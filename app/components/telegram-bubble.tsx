// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { File } from 'expo-file-system';
import { memo, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Image, Linking, Modal, Pressable, View, type LayoutChangeEvent } from 'react-native';

import { t, plural } from '../lib/i18n';
import { mimeOfName } from '../lib/matrix-media';
import type { NetworkWhere } from '../lib/network-place';
import type { TgMessage, TgPoll, TgReaction } from '../lib/telegram';
import type { Shown } from '../lib/telegram-seal';
import { telegramCustomEmoji, telegramDownload, telegramNow, type TgSticker } from '../lib/telegram-store';
import { TelegramMediaView, TelegramStickerView } from '../modules/erevos-telegram';
import { saveBytes } from '../lib/save-file';
import { telegramLine } from '../lib/telegram-view';
import { hideVideo, newVideoSlots, playsNow, showVideo, takeSlot } from '../lib/video-slots';
import { radius, space } from '../theme/colors';
import { softBubble, textSized } from '../theme/bubbles';
import { useTheme } from '../theme/context';

import { PreviewCard, Quote } from './message-parts';
import { LinkedText } from './linked-text';
import { withMentions } from '../lib/telegram-links';
import { NetworkFile } from './network-file';
import { BackIcon } from './icons';
import { Button, Row, Text, TextButton } from './ui';

// One message of a Telegram chat as a bubble (app/telegram-chat.tsx, app/telegram-thread.tsx): who
// wrote it, what it answers, where it was forwarded from, its words, photo, voice message, file,
// sticker, poll, place or contact card, the reactions under it, how many answered it in its thread,
// and when it was sent. A photo, voice message or file is downloaded by Telegram only when asked for
// (components/network-file.tsx); a sticker is shown as it is downloaded, and one that moves plays
// (modules/erevos-telegram StickerView.kt) with its still picture shown until then. A poll shows its
// options to tap until we have voted or it is closed, and then each option's share; a quiz then shows
// the right answer, ours if it was wrong, and what it says about it. A custom emoji reaction shows
// its picture.

const MARKS = { sent: '✓', read: '✓✓' } as const;

/** A downloaded file's local path, once Telegram has fetched it to the phone. */
export async function fetchPath(fileId: number, where: NetworkWhere): Promise<string> {
  const get = () => telegramNow(where).state?.files[fileId];
  if (!get()?.done) await telegramDownload(fileId);
  for (let waited = 0; ; waited++) {
    const f = get();
    if (f?.done && f.path) return f.path.startsWith('file://') ? f.path : `file://${f.path}`;
    if (waited > 8 && f && !f.downloading) throw new Error(t('The file could not be fetched.'));
    if (waited > 2400) throw new Error(t('The file could not be fetched.'));
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

/** A downloaded file's bytes. */
export async function fetchFile(fileId: number, where: NetworkWhere): Promise<Uint8Array> {
  return new File(await fetchPath(fileId, where)).bytes();
}

/** The type a file is saved and shown as, by what the message is. */
export function typeOf(m: TgMessage): string {
  switch (m.kind) {
    case 'photo':
      return 'image/jpeg';
    case 'voice':
      return 'audio/ogg';
    case 'audio':
      return mimeOfName(m.fileName || 'audio.mp3');
    case 'video':
    case 'animation':
    case 'video-note':
      return 'video/mp4';
    default:
      return mimeOfName(m.fileName || 'file');
  }
}

/** Kinds of message that are a video, shown in the bubble (MovingMedia). */
const MOVING: TgMessage['kind'][] = ['video', 'animation', 'video-note'];

export const nameOfFile = (m: TgMessage) => m.fileName || (m.kind === 'photo' ? `photo-${m.id}.jpg` : MOVING.includes(m.kind) ? `video-${m.id}.mp4` : m.kind === 'voice' ? `voice-${m.id}.ogg` : `file-${m.id}`);
export const hasFile = (m: TgMessage) => m.file !== undefined && m.kind !== 'text' && m.kind !== 'sticker';

/** A picture from a file of Telegram's, shown when it has come; its emoji (or nothing) until then. */
export function TelegramPicture({ fileId, path, size, fallback }: { fileId?: number; path: (fileId: number) => Promise<string>; size: number; fallback?: string }) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    if (fileId === undefined) return;
    let alive = true;
    path(fileId).then(
      (found) => alive && setUri(found),
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [fileId]);
  if (!uri) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: size / 3 }}>{fallback ?? ''}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel={fallback || t('Sticker')} />;
}

// Which moving .webm stickers play: lib/video-slots.ts.
const videos = newVideoSlots();
const videoWatchers = new Set<() => void>();
let videoTick = 0;
function videoChanged() {
  videoTick++;
  for (const watch of videoWatchers) watch();
}
function useVideoSlot(on: boolean, order: number): boolean {
  const seq = useRef(0);
  if (seq.current === 0) seq.current = takeSlot(videos);
  const me = seq.current;
  useSyncExternalStore(
    (watch) => {
      videoWatchers.add(watch);
      return () => videoWatchers.delete(watch);
    },
    () => videoTick,
  );
  useEffect(() => {
    if (!on) return;
    showVideo(videos, me, order);
    videoChanged();
    return () => {
      hideVideo(videos, me);
      videoChanged();
    };
  }, [on, order]);
  return on && playsNow(videos, me);
}

/**
 * A sticker that moves: its still picture until its file has come, then the sticker itself playing.
 * Without the player (a build without Telegram) the still picture stays.
 */
export function MovingSticker({ file, thumb, path, size, fallback, order = 0 }: { file?: number; thumb?: number; path: (fileId: number) => Promise<string>; size: number; fallback?: string; order?: number }) {
  const [uri, setUri] = useState<string | null>(null);
  // A .webm sticker plays in a WebView of its own: only the newest few at a time, the rest stay still.
  const video = !!uri && /\.webm$/i.test(uri);
  const room = useVideoSlot(video, order);
  useEffect(() => {
    if (file === undefined || !TelegramStickerView) return;
    let alive = true;
    path(file).then(
      (found) => alive && setUri(found),
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [file]);
  if (uri && TelegramStickerView && (!video || room)) {
    return <TelegramStickerView path={uri} style={{ width: size, height: size }} accessible accessibilityLabel={fallback || t('Sticker')} />;
  }
  return <TelegramPicture fileId={thumb} path={path} size={size} fallback={fallback} />;
}

/** How long a video lasts, as 1:05. */
const lastsOf = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

/**
 * A message's video, GIF or round video, in its bubble at its own shape. A GIF comes by itself and
 * plays muted, round and round (as many at once as moving stickers, the newest); a video shows its
 * still picture with ▶ and how long it lasts, and a tap fetches it and plays it on the whole screen
 * with sound. Save keeps it on the phone.
 */
function MovingMedia({ message, path, fetch, onMenu }: { message: TgMessage; path: (fileId: number) => Promise<string>; fetch: (fileId: number) => Promise<Uint8Array>; onMenu?: () => void }) {
  const gif = message.kind === 'animation';
  const round = message.kind === 'video-note';
  const ratio = message.width && message.height ? message.width / message.height : round ? 1 : 16 / 9;
  const width = round ? 200 : ratio >= 1 ? 240 : Math.max(140, Math.round(300 * ratio));
  const height = round ? 200 : Math.round(width / ratio);
  const [thumb, setThumb] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const room = useVideoSlot(gif && !!uri, message.id);
  useEffect(() => {
    let alive = true;
    if (message.thumb !== undefined) path(message.thumb).then((found) => alive && setThumb(found), () => undefined);
    if (gif && message.file !== undefined) path(message.file).then((found) => alive && setUri(found), () => undefined);
    return () => {
      alive = false;
    };
  }, [message.file, message.thumb]);

  async function play() {
    if (message.file === undefined) return;
    if (uri) {
      setOpen(true);
      return;
    }
    setBusy(true);
    setNote('');
    try {
      const found = await path(message.file);
      setUri(found);
      setOpen(true);
    } catch (error) {
      setNote(error instanceof Error ? error.message : t('The file could not be fetched.'));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (message.file === undefined) return;
    setBusy(true);
    setNote('');
    try {
      const bytes = await fetch(message.file);
      if (await saveBytes(nameOfFile(message), typeOf(message), bytes)) setNote(t('Saved.'));
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  const shape = { width, height, borderRadius: round ? width / 2 : radius.sm, overflow: 'hidden' as const, backgroundColor: '#000000' };
  return (
    <View style={{ gap: space.xs }}>
      <Pressable
        onPress={() => void play()}
        onLongPress={onMenu}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={gif ? t('GIF') : message.duration ? t('Play the video, {time}', { time: lastsOf(message.duration) }) : t('Play the video')}
        style={shape}
      >
        {gif && uri && room && TelegramMediaView ? (
          <TelegramMediaView path={uri} style={{ width, height }} />
        ) : thumb ? (
          <Image source={{ uri: thumb }} style={{ width, height }} resizeMode="cover" />
        ) : null}
        {!gif || !uri ? (
          <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#ffffff', fontSize: 22 }}>{busy ? '…' : gif ? 'GIF' : '▶'}</Text>
            </View>
          </View>
        ) : null}
        {!gif && message.duration ? (
          <View style={{ position: 'absolute', left: round ? width / 2 - 24 : 6, bottom: 6, paddingHorizontal: 6, borderRadius: radius.sm, backgroundColor: 'rgba(0,0,0,0.55)' }}>
            <Text variant="caption" style={{ color: '#ffffff' }}>
              {lastsOf(message.duration)}
            </Text>
          </View>
        ) : null}
      </Pressable>
      {!round ? (
        <Row>
          <Button title={t('Save')} kind="secondary" compact disabled={busy} onPress={() => void save()} />
        </Row>
      ) : null}
      {busy ? (
        <Text variant="caption" tone="muted">
          {t('Fetching…')}
        </Text>
      ) : null}
      {note ? (
        <Text variant="caption" tone="muted">
          {note}
        </Text>
      ) : null}
      {open && uri && TelegramMediaView ? (
        <Modal visible animationType="fade" onRequestClose={() => setOpen(false)} supportedOrientations={['portrait', 'landscape']}>
          <View style={{ flex: 1, backgroundColor: '#000000' }}>
            <TelegramMediaView path={uri} controls style={{ flex: 1 }} />
            <View style={{ position: 'absolute', top: space.xl, left: space.md }}>
              <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel={t('Back')} hitSlop={12} style={{ padding: space.sm, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.55)' }}>
                <BackIcon color="#ffffff" />
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

/** A photo or video sent hidden: its small picture blurred, until a tap shows it. */
function HiddenCover({ message, path, onShow, onMenu }: { message: TgMessage; path: (fileId: number) => Promise<string>; onShow: () => void; onMenu?: () => void }) {
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    if (message.thumb === undefined) return;
    let alive = true;
    path(message.thumb).then((found) => alive && setThumb(found), () => undefined);
    return () => {
      alive = false;
    };
  }, [message.thumb]);
  const ratio = message.width && message.height ? message.width / message.height : 4 / 3;
  const width = ratio >= 1 ? 240 : Math.max(140, Math.round(300 * ratio));
  const height = Math.round(width / ratio);
  return (
    <Pressable onPress={onShow} onLongPress={onMenu} accessibilityRole="button" accessibilityLabel={t('Hidden photo · tap to see it')} style={{ width, height, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: '#333333', alignItems: 'center', justifyContent: 'center' }}>
      {thumb ? <Image source={{ uri: thumb }} blurRadius={40} style={{ position: 'absolute', width, height }} resizeMode="cover" /> : null}
      <View style={{ paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <Text variant="caption" style={{ color: '#ffffff' }}>
          {t('Hidden photo · tap to see it')}
        </Text>
      </View>
    </Pressable>
  );
}

/** A sticker, still or moving. */
function StickerPicture({ sticker, path, size, order }: { sticker: TgSticker; path: (fileId: number) => Promise<string>; size: number; order?: number }) {
  return sticker.animated ? (
    <MovingSticker file={sticker.file} thumb={sticker.thumb} path={path} size={size} fallback={sticker.emoji} order={order} />
  ) : (
    <TelegramPicture fileId={sticker.file} path={path} size={size} fallback={sticker.emoji} />
  );
}

/** A custom emoji's picture, asked of Telegram by its id; its plain emoji until it has come. */
function CustomEmoji({ id, path, size, order }: { id: string; path: (fileId: number) => Promise<string>; size: number; order?: number }) {
  const [sticker, setSticker] = useState<TgSticker | null>(null);
  useEffect(() => {
    let alive = true;
    telegramCustomEmoji([id]).then(
      (found) => alive && setSticker(found.get(id) ?? null),
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [id]);
  if (!sticker) return <Text variant="caption">✨</Text>;
  return <StickerPicture sticker={sticker} path={path} size={size} order={order} />;
}

/** A reaction under a bubble: its emoji (or custom emoji's picture) and how many gave it. */
function ReactionChip({ reaction, path, order, disabled, onPress }: { reaction: TgReaction; path: (fileId: number) => Promise<string>; order: number; disabled: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${reaction.custom ? t('Custom emoji') : reaction.emoji} ${reaction.count}`}
      accessibilityState={{ selected: reaction.mine }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill, borderWidth: reaction.mine ? 2 : 1, borderColor: reaction.mine ? colors.primary : colors.border }}
    >
      {reaction.custom ? <CustomEmoji id={reaction.custom} path={path} size={18} order={order} /> : <Text variant="caption">{reaction.emoji}</Text>}
      <Text variant="caption">{String(reaction.count)}</Text>
    </Pressable>
  );
}

/** A poll: its question and options, to tap until we have voted or it is closed, then each one's share. */
function PollView({ poll, onVote }: { poll: TgPoll; onVote?: (options: number[]) => void }) {
  const { colors } = useTheme();
  const [picked, setPicked] = useState<number[]>([]);
  const voted = poll.options.some((o) => o.chosen);
  const results = voted || poll.closed;
  const toggle = (i: number) => setPicked((now) => (now.includes(i) ? now.filter((x) => x !== i) : [...now, i]));
  const quiz = poll.quiz;
  // In a quiz the right answer has ✅, and ours ❌ when it was wrong; in a poll ours has ✓.
  const markOf = (chosen: boolean, i: number) => (quiz?.includes(i) ? '✅ ' : quiz?.length && chosen ? '❌ ' : chosen ? '✓ ' : '');
  return (
    <View style={{ gap: space.xs, minWidth: 220 }}>
      <Text variant="bodyStrong">{`${quiz !== undefined ? '❓' : '📊'} ${poll.question}`}</Text>
      {poll.options.map((o, i) =>
        results ? (
          <View key={i} style={{ gap: 2 }}>
            <Text>{`${markOf(o.chosen, i)}${o.text}`}</Text>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
              <View style={{ width: `${Math.max(0, Math.min(100, o.percent))}%`, height: 6, backgroundColor: colors.primary }} />
            </View>
            <Text variant="caption" tone="muted">
              {`${o.percent}% · ${plural(o.votes, '{n} vote', '{n} votes')}`}
            </Text>
          </View>
        ) : (
          <Pressable
            key={i}
            disabled={!onVote}
            onPress={() => (poll.multiple ? toggle(i) : onVote?.([i]))}
            accessibilityRole={poll.multiple ? 'checkbox' : 'button'}
            accessibilityState={{ checked: picked.includes(i) }}
            style={{ paddingVertical: space.xs, paddingHorizontal: space.sm, borderRadius: radius.md, borderWidth: 1, borderColor: picked.includes(i) ? colors.primary : colors.border }}
          >
            <Text>{`${poll.multiple ? (picked.includes(i) ? '☑ ' : '☐ ') : ''}${o.text}`}</Text>
          </Pressable>
        ),
      )}
      {!results && poll.multiple && onVote ? <Button title={t('Vote')} compact disabled={picked.length === 0} onPress={() => onVote(picked)} /> : null}
      {voted && !poll.closed && poll.revote && onVote ? <TextButton title={t('Retract vote')} onPress={() => onVote([])} /> : null}
      {results && poll.explanation ? <Text tone="muted">{`💡 ${poll.explanation}`}</Text> : null}
      <Text variant="caption" tone="faint">
        {[plural(poll.total, '{n} vote', '{n} votes'), quiz !== undefined ? t('Quiz') : '', poll.closed ? t('Poll closed') : poll.anonymous ? t('Anonymous poll') : ''].filter(Boolean).join(' · ')}
      </Text>
    </View>
  );
}

export type Answer = { name: string; line: string };

type BubbleProps = {
  message: TgMessage;
  shown: Shown | null;
  group: boolean;
  /** Who wrote it, in a group, for a message that is not ours. */
  writer: string;
  read: boolean;
  /** The message it answers, or null when that is not here. */
  answered?: Answer | null;
  /** Where it was forwarded from, said as a name; empty for an ordinary message. */
  forwardName?: string;
  /** In selection mode (several messages chosen): a tap picks it or lets it go. */
  selecting?: boolean;
  selected?: boolean;
  fetch: (fileId: number) => Promise<Uint8Array>;
  path: (fileId: number) => Promise<string>;
  onMenu?: () => void;
  onSelect?: () => void;
  /** A reaction chip was tapped: its emoji (empty for a custom one), whether it is ours now, and a custom emoji's id. */
  onReact?: (emoji: string, mine: boolean, custom?: string) => void;
  onVote?: (options: number[]) => void;
  onThread?: () => void;
  /** A contact card's person was asked to be written to. */
  onPerson?: (userId: number) => void;
  /** Where a tapped link goes: Telegram's own open in the chat screens (lib/telegram-links.ts). */
  onLink?: (url: string) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Starred on this phone: a star by its time. */
  starred?: boolean;
};

// A message is drawn again only when what it shows changed, not with every letter typed below it
// or every message that comes: what it does when held, measured or asked for its file stays the
// same for the same message, so those are not compared.
export const Bubble = memo(BubbleView, (a, b) =>
  a.message === b.message &&
  a.shown?.kind === b.shown?.kind &&
  (a.shown?.kind === 'text' ? a.shown.text : '') === (b.shown?.kind === 'text' ? b.shown.text : '') &&
  a.group === b.group &&
  a.writer === b.writer &&
  a.read === b.read &&
  (a.answered === undefined) === (b.answered === undefined) &&
  a.answered?.name === b.answered?.name &&
  a.answered?.line === b.answered?.line &&
  a.forwardName === b.forwardName &&
  !!a.selecting === !!b.selecting &&
  !!a.selected === !!b.selected &&
  !!a.starred === !!b.starred &&
  !a.onMenu === !b.onMenu,
);

function BubbleView({ message, shown, group, writer, read, answered, forwardName, selecting, selected, starred, fetch, path, onMenu, onSelect, onReact, onVote, onThread, onPerson, onLink, onLayout }: BubbleProps) {
  const { colors, look } = useTheme();
  // A photo or video sent hidden shows blurred until tapped, as a hidden photo in an Erevos chat.
  const [revealed, setRevealed] = useState(false);
  const mine = message.outgoing;
  const when = new Date(message.date * 1000).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  // A line about the chat, not a message: a change in it, or a step of the encryption.
  if (message.kind === 'service' || (shown && shown.kind !== 'text' && shown.kind !== 'unreadable')) {
    return (
      <View onLayout={onLayout} style={{ alignSelf: 'center', maxWidth: '85%' }}>
        <Text variant="caption" tone="muted" style={{ textAlign: 'center' }}>
          {telegramLine(message, shown)}
          {' · '}
          {when}
        </Text>
      </View>
    );
  }
  const status = message.sending === 'pending' ? t('Sending…') : message.sending === 'failed' ? t('Not sent.') : [`${when}${!group && mine ? ` ${read ? MARKS.read : MARKS.sent}` : ''}`, message.edited ? t('Edited') : '', message.views ? `👁 ${message.views}` : '', starred ? '★' : ''].filter(Boolean).join('  ·  ');
  const file = hasFile(message) && !shown ? message : null;
  const sticker = message.kind === 'sticker' && !shown;
  const words = shown ? (shown.kind === 'text' ? shown.text : '') : message.kind === 'poll' || message.kind === 'location' ? '' : message.text;
  const place = message.location;
  const card = message.contact;

  return (
    <View onLayout={onLayout} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', gap: 4 }}>
      <Pressable
        onPress={selecting ? onSelect : undefined}
        onLongPress={selecting ? onSelect : onMenu}
        disabled={!selecting && !onMenu}
        // One with buttons in it (Save) stays apart from them for a screen reader.
        accessible={!file && !message.poll && !place && !card}
        accessibilityState={{ selected: !!selected }}
        accessibilityHint={onMenu ? t('Hold for more') : undefined}
        style={[
          { alignSelf: mine ? 'flex-end' : 'flex-start', padding: space.sm + 2, gap: 2, borderRadius: radius.md, borderWidth: selected ? 2 : 0, borderColor: colors.primary },
          softBubble(look.bubbles, colors, mine),
        ]}
      >
        {writer ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {writer}
          </Text>
        ) : null}
        {forwardName ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {t('Forwarded from {name}', { name: forwardName })}
          </Text>
        ) : null}
        {message.replyTo ? answered ? <Quote name={answered.name} line={answered.line} /> : <Text variant="caption" tone="muted">{t('Message not here')}</Text> : null}
        {file && file.spoiler && !revealed ? (
          <HiddenCover message={file} path={path} onShow={() => setRevealed(true)} onMenu={onMenu} />
        ) : file && MOVING.includes(file.kind) && TelegramMediaView ? (
          <MovingMedia message={file} path={path} fetch={fetch} onMenu={onMenu} />
        ) : file ? (
          <NetworkFile name={nameOfFile(file)} type={typeOf(file)} dim={file.width && file.height ? `${file.width}x${file.height}` : undefined} fetch={() => fetch(file.file!)} onMenu={onMenu} auto={file.kind === 'photo'} />
        ) : null}
        {sticker ? (
          message.animated ? (
            <MovingSticker file={message.file} thumb={message.thumb} path={path} size={160} fallback={message.text} order={message.id} />
          ) : (
            <TelegramPicture fileId={message.file} path={path} size={160} fallback={message.text} />
          )
        ) : null}
        {message.poll ? <PollView poll={message.poll} onVote={selecting ? undefined : onVote} /> : null}
        {place ? (
          <View style={{ gap: space.xs }}>
            <Text>{`📍 ${t('Location')}`}</Text>
            {message.text ? <Text>{message.text}</Text> : null}
            <Button title={t('Open map')} kind="secondary" compact onPress={() => void Linking.openURL(`geo:${place.lat},${place.lon}?q=${place.lat},${place.lon}`).catch(() => undefined)} />
          </View>
        ) : null}
        {card ? (
          <View style={{ gap: space.xs }}>
            <Text>{`👤 ${[card.name, card.phone].filter(Boolean).join(' · ')}`}</Text>
            {card.userId && onPerson && !selecting ? <Button title={t('Message')} kind="secondary" compact onPress={() => onPerson(card.userId!)} /> : null}
          </View>
        ) : null}
        {shown?.kind === 'unreadable' ? (
          <Text tone="muted">{`🔒 ${t('Encrypted message that could not be opened on this phone')}`}</Text>
        ) : words && !sticker ? (
          // Not selectable when it has a menu: holding the words opens it, which can copy them.
          <Text selectable={!onMenu && !selecting} style={textSized(look.textSize, 16)}>
            {/* Its marks shown as they say, and its web addresses tappable, as in an Erevos chat. */}
            <LinkedText text={words} ways={{ more: withMentions, open: onLink }} />
          </Text>
        ) : !file && !sticker && message.kind !== 'text' && !message.poll && !place && !card ? (
          <Text tone="muted">{telegramLine(message, null)}</Text>
        ) : null}
        {message.preview && !shown && !selecting ? <PreviewCard preview={message.preview} /> : null}
        <Text variant="caption" tone="faint">
          {status}
          {shown?.kind === 'text' ? ` · ${t('encrypted')}` : ''}
        </Text>
      </Pressable>
      {message.reactions?.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignSelf: mine ? 'flex-end' : 'flex-start' }}>
          {message.reactions.map((r) => (
            <ReactionChip key={r.custom ?? r.emoji} reaction={r} path={path} order={message.id} disabled={!onReact || !!selecting} onPress={() => onReact?.(r.emoji, r.mine, r.custom)} />
          ))}
        </View>
      ) : null}
      {message.replies && onThread && !selecting ? (
        <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start' }}>
          <TextButton title={plural(message.replies, '{n} reply', '{n} replies')} onPress={onThread} />
        </View>
      ) : null}
    </View>
  );
}
