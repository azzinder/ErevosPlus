// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The lines of a chat's thread, the rows of its details, and the chat screen's styles
// (app/chat.tsx).

import { memo, type ReactNode, type RefObject } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { shownLine } from '../lib/call-lines';
import { voiceDuration } from '../lib/voice';
import { type FileRef } from '../lock/attachment-files';
import { Attachment, comingText } from './attachment';
import { Text, TextButton, Toggle } from './ui';
import { LinkedText } from './linked-text';
import { PlaceCard, PreviewCard, Quote, Reactions } from './message-parts';
import { PhotoSticker, StickerView } from './stickers';
import { EDITION } from '../lib/edition';
import { PayCard } from './pay-card';
import { PollCard } from './poll';
import { CardBubble } from './card-share';
import { chosenStyle } from './select-bar';
import { smsFailed, smsLineId, smsMark } from '../lib/sms-chat';
import { SmsExtras } from './sms-parts';
import { messageLine } from '../lib/message-line';
import { mediaText } from '../lib/imports';
import { sharedLine } from '../lib/chat-share';
import { onceLine } from '../lib/see-once';
import { isImportedSticker, isSound, isVoice } from '../lib/chat-media';
import { type LinkedMessage } from '../lock/archive';
import { radius, space, withAlpha, type Colors } from '../theme/colors';
import { bubbleStyles } from '../theme/bubbles';
import { useColors } from '../theme/context';
import { type SmsMessage } from '../modules/erevos-sms';
import { press, tap } from '../lib/haptics';
import { t, locale, plural, useLang } from '../lib/i18n';
import { caption, pad, type Message } from '../lib/chat-screen';
import { dayLabel } from '../lib/day-mark';

// A round button under the picture in a chat's details, with its name under it.
export function QuickAction({ title, sign, on = false, onPress }: { title: string; sign: string; on?: boolean; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected: on }}
      style={({ pressed }) => ({ alignItems: 'center', gap: 6, minWidth: 64, opacity: pressed ? 0.7 : 1 })}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: on ? colors.primary : colors.surface,
          borderWidth: 1,
          borderColor: on ? colors.primary : withAlpha(colors.border, 0.6),
        }}
      >
        <Text style={{ fontSize: 20, lineHeight: 24, color: on ? colors.onPrimary : colors.accentText }}>{sign}</Text>
      </View>
      <Text variant="caption" tone={on ? undefined : 'muted'}>
        {title}
      </Text>
    </Pressable>
  );
}

// A row in a chat's details: its name, and its value or a switch, with an arrow when it opens more.
export function DetailRow({ title, value, right, checked, open, danger = false, onPress }: {
  title: string;
  value?: string;
  right?: ReactNode;
  /** A switch, on or off, in place of the arrow; the row is read out as a switch. */
  checked?: boolean;
  /** Whether what it opens under it shows; without it, the row goes somewhere or acts at once. */
  open?: boolean;
  danger?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole={checked === undefined ? 'button' : 'switch'}
      accessibilityState={checked !== undefined ? { checked } : open === undefined ? undefined : { expanded: open }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        minHeight: 48,
        paddingVertical: 6,
        borderRadius: radius.md,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ flex: 1, color: danger ? colors.danger : colors.text }}>{title}</Text>
      {value ? (
        <Text tone="muted" numberOfLines={1} style={{ flexShrink: 1, textAlign: 'right' }}>
          {value}
        </Text>
      ) : null}
      {right}
      {checked !== undefined ? <Toggle on={checked} /> : null}
      {!right && checked === undefined && !danger ? (
        <Text style={{ fontSize: 20, lineHeight: 22, color: colors.textFaint, transform: [{ rotate: open ? '90deg' : '0deg' }] }}>›</Text>
      ) : null}
    </Pressable>
  );
}

/** A step of the search in a chat: to what it found earlier or later, or closing it. */
export function SearchStep({ sign, label, onPress }: { sign: string; label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.6 : 1 })}>
      <Text style={{ fontSize: 16, color: colors.accentText }}>{sign}</Text>
    </Pressable>
  );
}

export const dayOf = (at: number) => new Date(at).toDateString();

// A day as the chat's details say it, in the app's language: 21 October 2026.
export function dayText(at: number): string {
  try {
    return new Date(at).toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return new Date(at).toLocaleDateString();
  }
}

export const clock = (at: number) => {
  const d = new Date(at);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export { dayLabel };

/**
 * Over the first message of each day, in every chat: the day in bold on its own chip, with a line
 * either side, so it stands out from the messages (lib/day-mark.ts says the day).
 */
export function DayMark({ at }: { at: number }) {
  useLang();
  const colors = useColors();
  const label = dayLabel(at);
  return (
    <View style={dayStyles.row} accessible accessibilityRole="header" accessibilityLabel={label}>
      <View style={[dayStyles.rule, { backgroundColor: colors.border }]} />
      <Text style={[dayStyles.chip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}>{label}</Text>
      <View style={[dayStyles.rule, { backgroundColor: colors.border }]} />
    </View>
  );
}

const dayStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md, marginBottom: space.sm, paddingHorizontal: space.sm },
  rule: { flex: 1, height: StyleSheet.hairlineWidth * 2 },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

// What a line of the thread does when pressed, held or laid out (ChatScreen's rowDo).
export type RowActs = {
  play: (message: Message) => void;
  open: (message: Message) => void;
  menu: (message: Message) => void;
  goTo: (peer: string, tag: string) => void;
  vote: (message: Message, option: number) => void;
  paid: (message: Message) => void;
  fasouli: (message: Message) => void;
  placed: (message: Message, y: number) => void;
  smsAgain: (sms: SmsMessage) => void;
  smsMenu: (sms: SmsMessage) => void;
  smsEarlier: () => void;
  smsPlaced: (id: string, y: number) => void;
  importedPlaced: (index: number, message: LinkedMessage, y: number) => void;
  importedMenu: (message: LinkedMessage) => void;
  importedOpen: (file: FileRef) => void;
  importedPlay: (file: FileRef) => void;
  /** While messages are chosen (components/select-bar.tsx): adds it, or takes it out. */
  choose: (message: Message) => void;
  /** Opens a new contact filled with a contact card's (components/card-share.tsx). */
  saveCard: (card: string) => void;
  /** Shows a thread alone, by the tag of its first message. */
  thread: (tag: string) => void;
};

/** One RowActs that stays the same, doing what the latest render's does. */
export function steadyActs(latest: RefObject<RowActs | null>): RowActs {
  const now = () => latest.current!;
  return {
    play: (message) => now().play(message),
    open: (message) => now().open(message),
    menu: (message) => now().menu(message),
    goTo: (peer, tag) => now().goTo(peer, tag),
    vote: (message, option) => now().vote(message, option),
    paid: (message) => now().paid(message),
    fasouli: (message) => now().fasouli(message),
    placed: (message, y) => now().placed(message, y),
    smsAgain: (sms) => now().smsAgain(sms),
    smsMenu: (sms) => now().smsMenu(sms),
    smsEarlier: () => now().smsEarlier(),
    smsPlaced: (id, y) => now().smsPlaced(id, y),
    importedPlaced: (index, message, y) => now().importedPlaced(index, message, y),
    importedMenu: (message) => now().importedMenu(message),
    importedOpen: (file) => now().importedOpen(file),
    importedPlay: (file) => now().importedPlay(file),
    choose: (message) => now().choose(message),
    saveCard: (card) => now().saveCard(card),
    thread: (tag) => now().thread(tag),
  };
}

export type LineLook = { styles: ReturnType<typeof makeStyles>; b: ReturnType<typeof bubbleStyles>; colors: Colors; acts: RowActs };

// A message of the thread. It draws again only when what it shows changes, not each time the
// chat does (a voice message playing, a note), which keeps a long thread light to scroll.
export const MessageLine = memo(function MessageLine({ message, quoted, name, newDay, tail, lit, played, photo, taking, stranger = false, plays, canAnswer, waits, choosing = false, chosen = false, answers = 0, styles, b, colors, acts }: LineLook & {
  message: Message;
  /** The message it answers, when here. */
  quoted?: Message;
  /** The contact's name. */
  name: string;
  newDay: boolean;
  tail: boolean;
  lit: boolean;
  /** How far it has played, ms, while it is the voice message playing. */
  played: number | null;
  photo?: string;
  taking?: string;
  /** From a message request not accepted yet: its photos and files wait, and its links show no preview. */
  stranger?: boolean;
  /** A sticker among the last of the thread, which moves. */
  plays: boolean;
  /** They have it, so it can be voted on. */
  canAnswer: boolean;
  /** Ours sent for later, its time not come yet (scheduled): it says when it goes, until then. */
  waits: boolean;
  /** Messages are being chosen (components/select-bar.tsx): a tap adds it or takes it out, and nothing in it acts. */
  choosing?: boolean;
  /** It is one of those chosen. */
  chosen?: boolean;
  /** How many answers its thread has, shown under it outside a thread (lib/chat-parts.ts threadSizes). */
  answers?: number;
}) {
  useLang();
  const ink = message.mine ? [styles.mineText, b.mineText] : [styles.theirsText, b.theirsText];
  // A sticker, built in or made from a photo, shows on its own, with no bubble.
  const stuck = !!message.sticker || !!message.file?.sticker;
  // Imported chats shared (lib/chat-share.ts): a line where they went or came, and how far they
  // came while they do, then how far their files did (lib/share-rounds.ts). Their messages show
  // ahead of the new ones, as what was imported does.
  if (message.file?.history) {
    const status = !message.mine && message.file.from ? comingText(message.file, taking) : (taking ?? null);
    return (
      <View onLayout={(event) => acts.placed(message, event.nativeEvent.layout.y)}>
        {newDay && message.at ? <DayMark at={message.at} /> : null}
        <Pressable
          onPress={() => (choosing ? acts.choose(message) : acts.open(message))}
          onLongPress={() => {
            press();
            if (choosing) acts.choose(message);
            else acts.menu(message);
          }}
          accessibilityHint={t('Hold for more')}
          style={[chosen ? chosenStyle(colors) : undefined, lit && styles.lit]}
        >
          <Text variant="caption" tone="muted" style={[styles.divider, styles.day]}>
            {[sharedLine(message.file.history, message.mine, name), status].filter(Boolean).join('  ·  ')}
          </Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View onLayout={(event) => acts.placed(message, event.nativeEvent.layout.y)}>
      {newDay && message.at ? <DayMark at={message.at} /> : null}
      <Pressable
        disabled={!choosing}
        accessible={choosing}
        focusable={choosing}
        onPress={() => acts.choose(message)}
        onLongPress={() => acts.choose(message)}
        accessibilityRole={choosing ? 'checkbox' : undefined}
        accessibilityState={choosing ? { checked: chosen } : undefined}
        accessibilityLabel={choosing ? messageLine(message) : undefined}
        style={chosen ? chosenStyle(colors) : undefined}
      >
        <View pointerEvents={choosing ? 'none' : 'auto'}>
          <Pressable
            onPress={message.voice ? () => acts.play(message) : message.file ? () => acts.open(message) : undefined}
            onLongPress={() => {
              press();
              acts.menu(message);
            }}
            accessibilityHint={message.voice ? t('Tap to play, hold for more') : message.file ? t('Tap to open, hold for more') : t('Hold for more')}
            style={[
              styles.bubble,
              message.mine ? b.mine : b.theirs,
              message.file?.kind === 'photo' && !stuck && styles.photoBubble,
              tail && !stuck && (message.mine ? [b.mineTail, styles.mineTail] : [b.theirsTail, styles.theirsTail]),
              stuck && styles.stickerBubble,
              (message.myReaction || message.theirReaction) && styles.reacted,
              lit && styles.lit,
            ]}
          >
            {message.re ? (
              <Quote
                name={quoted ? (quoted.mine ? t('You') : name) : ''}
                line={quoted ? messageLine(quoted) : ''}
                ink={ink}
                onPress={() => acts.goTo(message.peer, message.re!)}
              />
            ) : null}
            {message.sticker ? (
              <StickerView name={message.sticker} fallback={message.text} play={plays} tap onLongPress={() => acts.menu(message)} />
            ) : message.file?.sticker ? (
              <PhotoSticker uri={photo} status={comingText(message.file, taking)} />
            ) : message.place ? (
              <PlaceCard place={message.place} ink={ink} />
            ) : message.pay && EDITION !== 'lite' ? (
              // Erevos Lite has no payment requests (docs/editions.md): one from a contact shows as
              // its words, as an Erevos from before shows it.
              <PayCard
                pay={message.pay}
                mine={message.mine}
                paid={message.paid}
                onPaid={canAnswer ? () => acts.paid(message) : undefined}
                onFasouli={message.pay.r ? () => acts.fasouli(message) : undefined}
                ink={ink}
              />
            ) : message.poll ? (
              <PollCard
                poll={message.poll}
                voters={[
                  { name: t('You'), chose: message.myVote ?? [] },
                  { name, chose: message.theirVote ?? [] },
                ]}
                mine={message.myVote ?? []}
                onChoose={canAnswer ? (option) => acts.vote(message, option) : undefined}
                ink={ink}
                ended={!!message.closed}
              />
            ) : message.card ? (
              <CardBubble card={message.card} ink={ink} onSave={() => acts.saveCard(message.card!)} />
            ) : message.seenOnce && !message.file ? (
              <Text style={[ink, { fontStyle: 'italic' }]}>{onceLine(message.mine, true)}</Text>
            ) : message.file ? (
              <Attachment file={message.file} uri={photo} state={stranger && message.file.from && !taking ? 'stranger' : taking} ink={ink} mine={message.mine} />
            ) : (
              <Text style={ink}>
                {message.voice
                  ? played !== null
                    ? `■  ${t('Playing, {time}', { time: voiceDuration(Math.max(0, message.voice.ms - played)) })}`
                    : `▶  ${t('Voice message, {time}', { time: voiceDuration(message.voice.ms) })}`
                  : <LinkedText text={shownLine(message.text)} />}
              </Text>
            )}
            {message.preview && !message.voice && !message.file && !stranger ? <PreviewCard preview={message.preview} ink={ink} /> : null}
            <Text style={[ink, styles.time, stuck && { color: colors.textMuted }]}>
              {[message.forwarded ? t('Forwarded') : '', message.at && !waits ? clock(message.at) : '', message.edited ? t('Edited') : '', caption(message)].filter(Boolean).join('  ·  ')}
            </Text>
          </Pressable>
          <Reactions
            signs={[message.theirReaction, message.myReaction].filter((sign): sign is string => !!sign)}
            mine={message.myReaction}
            mineSide={message.mine}
            onPress={() => acts.menu(message)}
          />
        </View>
      </Pressable>
      {answers > 0 && !choosing ? (
        <View style={{ alignSelf: message.mine ? 'flex-end' : 'flex-start', paddingHorizontal: space.sm }}>
          <TextButton title={plural(answers, '{n} answer in the thread', '{n} answers in the thread')} onPress={() => acts.thread(message.tag)} />
        </View>
      ) : null}
    </View>
  );
});

// An SMS or MMS with their number among the thread's messages, drawn again only when it changes.
export const SmsLine = memo(function SmsLine({ sms: m, earlier, newDay, tail, lit, styles, b, colors, acts }: LineLook & {
  sms: SmsMessage;
  /** The first SMS read, with a way to ask for earlier ones above it. */
  earlier: boolean;
  newDay: boolean;
  tail: boolean;
  lit: boolean;
}) {
  useLang();
  const id = smsLineId(m);
  const ink = m.mine ? [styles.mineText, b.mineText] : [styles.theirsText, b.theirsText];
  return (
    <View onLayout={(event) => acts.smsPlaced(id, event.nativeEvent.layout.y)}>
      {earlier ? <TextButton title={t('Show earlier SMS')} onPress={acts.smsEarlier} /> : null}
      {newDay ? <DayMark at={m.at} /> : null}
      <Pressable
        onPress={smsFailed(m) ? () => acts.smsAgain(m) : undefined}
        onLongPress={() => acts.smsMenu(m)}
        accessibilityHint={smsFailed(m) ? t('Tap to send it again.') : t('Hold for more')}
        style={[
          styles.bubble,
          m.mine ? b.mine : b.theirs,
          tail && (m.mine ? [b.mineTail, styles.mineTail] : [b.theirsTail, styles.theirsTail]),
          styles.sms,
          lit && styles.lit,
        ]}
      >
        {(m.pictures ?? []).map((p) => (
          <Image key={p.uri} source={{ uri: p.uri }} style={styles.smsPicture} resizeMode="cover" accessibilityLabel={t('Picture')} />
        ))}
        {m.text ? (
          <Text style={ink}>
            <LinkedText text={m.text} />
          </Text>
        ) : null}
        <SmsExtras m={m} ink={ink} />
        {/* Marked plain: what the SMS screen says of every SMS, and its marks. */}
        <Text style={[ink, styles.time]}>
          {[m.kind === 'mms' ? t('MMS (not encrypted)') : t('SMS (not encrypted)'), clock(m.at), m.mine ? smsMark(m.state) : ''].filter(Boolean).join('  ·  ')}
        </Text>
        {smsFailed(m) ? <Text style={[styles.time, { color: colors.danger }]}>{t('Tap to send it again.')}</Text> : null}
      </Pressable>
    </View>
  );
});

// A message of what was imported, among the thread's as if it had always been one of them: its day,
// its bubble and tail, its photos as they come near, its sounds played where they are. It is only
// to read: held, it is copied or its file opened. It draws again only when what it shows changes:
// of the photos read, only its own are looked at.
export const ImportedLine = memo(
  function ImportedLine({ message, index, sender, newDay, tail, lit, photos, playing, played, styles, b, colors, acts }: LineLook & {
    message: LinkedMessage;
    /** Its place in what was imported. */
    index: number;
    /** Who wrote it, over the first of their run in an imported group; or nothing. */
    sender: string;
    newDay: boolean;
    tail: boolean;
    lit: boolean;
    /** The photos read, by their file's id. */
    photos: Record<string, string>;
    /** Its sound playing (the file's id), and how far, ms. */
    playing: string | null;
    played: number;
  }) {
    useLang();
    const ink = message.mine ? [styles.mineText, b.mineText] : [styles.theirsText, b.theirsText];
    const missing = mediaText(message.media);
    // A sticker shows on its own, with no bubble, as the thread's do.
    const stuck = !message.text && !missing && message.files.length === 1 && isImportedSticker(message.files[0]);
    const pictures = !stuck && message.files.length > 0 && message.files.every((file) => file.kind === 'photo');
    const menu = () => acts.importedMenu(message);
    return (
      <View onLayout={(event) => acts.importedPlaced(index, message, event.nativeEvent.layout.y)}>
        {newDay ? <DayMark at={message.at} /> : null}
        <Pressable
          onLongPress={menu}
          accessibilityHint={t('Hold for more')}
          style={[
            styles.bubble,
            message.mine ? b.mine : b.theirs,
            pictures && styles.photoBubble,
            tail && !stuck && (message.mine ? [b.mineTail, styles.mineTail] : [b.theirsTail, styles.theirsTail]),
            stuck && styles.stickerBubble,
            lit && styles.lit,
          ]}
        >
          {sender ? <Text style={[ink, styles.sender]}>{sender}</Text> : null}
          {message.files.map((file, n) =>
            isSound(file) ? (
              <Pressable key={`${file.id}-${n}`} onPress={() => acts.importedPlay(file)} onLongPress={menu} accessibilityRole="button" accessibilityHint={t('Tap to play, hold for more')}>
                <Text style={ink}>
                  {playing === file.id
                    ? `■  ${t('Playing, {time}', { time: voiceDuration(played) })}`
                    : `▶  ${isVoice(file) ? t('Voice message') : file.name}`}
                </Text>
              </Pressable>
            ) : (
              <Pressable key={`${file.id}-${n}`} onPress={() => acts.importedOpen(file)} onLongPress={menu} accessibilityRole="button" accessibilityHint={t('Tap to open, hold for more')}>
                {stuck ? <PhotoSticker uri={photos[file.id]} /> : <Attachment file={file} uri={photos[file.id]} ink={ink} />}
              </Pressable>
            ),
          )}
          {message.text ? (
            <Text style={ink}>
              <LinkedText text={message.text} />
            </Text>
          ) : null}
          {missing ? <Text style={[ink, styles.files]}>{t('{files}, not imported', { files: missing })}</Text> : null}
          {message.at ? <Text style={[ink, styles.time, stuck && { color: colors.textMuted }]}>{clock(message.at)}</Text> : null}
        </Pressable>
      </View>
    );
  },
  (was, now) =>
    (Object.keys(now) as (keyof typeof now)[]).every((key) => key === 'photos' || was[key] === now[key]) &&
    now.message.files.every((file) => was.photos[file.id] === now.photos[file.id]),
);


export const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: space.lg,
      paddingTop: space.sm,
      gap: space.sm,
      backgroundColor: colors.ground,
    },
    kicker: {
      paddingHorizontal: space.md,
    },
    // The chat's bar at the top, across the screen and behind the status bar, on the bars' glass.
    topBar: {
      marginHorizontal: -space.lg,
      backgroundColor: colors.sheet,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    // The buttons' own room (44 across, the icon in the middle) spaces them, so the name has the rest.
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 60,
    },
    // The contact's picture and name: tapped, it shows or hides the chat's details.
    who: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 6,
      paddingLeft: 2,
      paddingRight: 2,
      borderRadius: radius.lg,
    },
    name: {
      fontSize: 17,
      lineHeight: 22,
    },
    // ⋯ keeps apart from the calls beside it, so a slip on it calls no one.
    moreGap: {
      marginLeft: space.sm,
    },
    // Hidden chats' links at the bar's end, apart from each other and from the screen's edge.
    headerLinks: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.lg,
      paddingRight: space.lg,
    },
    pressed: {
      backgroundColor: colors.surfacePressed,
    },
    subtitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    monoName: {
      fontFamily: 'monospace',
      fontSize: 16,
    },
    monoSmall: {
      fontFamily: 'monospace',
      fontSize: 11,
    },
    section: {
      gap: space.sm,
    },
    // A group of the chat's details, on a card.
    panel: {
      gap: space.sm,
      padding: space.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: withAlpha(colors.border, 0.5),
    },
    // A line in the middle, under New chat's QR code (app/chat.tsx).
    centered: {
      textAlign: 'center',
    },
    faces: {
      gap: space.md,
      paddingVertical: 2,
    },
    face: {
      width: 64,
      alignItems: 'center',
      gap: 4,
    },
    ring: {
      padding: 3,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    ringOn: {
      borderColor: colors.primary,
    },
    faceName: {
      fontSize: 12,
      maxWidth: 64,
      textAlign: 'center',
    },
    grow: {
      flex: 1,
      // A browser's field otherwise keeps its own width and pushes the button beside it out.
      minWidth: 0,
    },
    // Under the messages: the message bar (components/composer.tsx), across the screen, and the
    // panel "+" opens under it.
    dock: {
      marginHorizontal: -space.lg,
      marginTop: -space.xs,
    },
    // The chat's details between the title and the messages: they give way, and scroll, when the
    // keyboard leaves too little room, so the message field stays in view.
    top: {
      flexGrow: 0,
      flexShrink: 1,
    },
    topContent: {
      gap: space.sm,
    },
    thread: {
      flex: 1,
    },
    threadContent: {
      gap: 3,
      paddingVertical: space.sm,
    },
    hello: {
      alignItems: 'center',
      gap: space.md,
      paddingTop: space.xxl * 2,
      paddingHorizontal: space.xl,
    },
    bubble: {
      maxWidth: '82%',
      paddingTop: space.sm,
      paddingBottom: 6,
      paddingHorizontal: space.md,
      gap: 2,
    },
    // A message with reactions leaves room for them under it.
    reacted: {
      marginBottom: 0,
    },
    // A sticker stands on its own, with no bubble behind it.
    stickerBubble: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      paddingHorizontal: 0,
      shadowOpacity: 0,
      elevation: 0,
    },
    // The search in the chat, over its thread.
    searchBar: {
      paddingHorizontal: space.lg,
      paddingBottom: space.xs,
      gap: space.xs,
    },
    // A message found, or starred, in the chat's details.
    found: {
      gap: 2,
      paddingVertical: space.sm,
    },
    // One of the phone's SMS among the messages: edged, as it is plain (lib/sms-chat.ts).
    sms: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.warning,
    },
    smsPicture: {
      width: 220,
      height: 220,
      borderRadius: radius.md,
      backgroundColor: colors.border,
    },
    // A message gone to, lit a moment.
    lit: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    // A photo fills its bubble, with a thin edge.
    photoBubble: {
      paddingTop: 4,
      paddingHorizontal: 4,
    },
    // The last message of a run leaves room before the next run (its corner: theme/bubbles.ts).
    mineTail: {
      marginBottom: space.sm,
    },
    theirsTail: {
      marginBottom: space.sm,
    },
    divider: {
      alignSelf: 'center',
      textAlign: 'center',
    },
    day: {
      marginVertical: space.sm,
      paddingHorizontal: space.md,
      paddingVertical: 3,
      borderRadius: radius.pill,
      backgroundColor: withAlpha(colors.surfaceAlt, 0.7),
      overflow: 'hidden',
      fontSize: 12,
    },
    sender: {
      fontSize: 13,
      fontWeight: '700',
    },
    files: {
      fontSize: 13,
      fontStyle: 'italic',
    },
    time: {
      fontSize: 11,
      opacity: 0.7,
      alignSelf: 'flex-end',
    },
    mineText: {
      fontSize: 15,
      lineHeight: 21,
    },
    theirsText: {
      fontSize: 15,
      lineHeight: 21,
    },
    note: {
      color: colors.accentText,
      paddingHorizontal: 2,
    },
    // A chat's details, over the chat.
    sheetBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingHorizontal: space.lg,
      paddingVertical: space.xs,
    },
    sheetContent: {
      gap: space.sm,
      paddingHorizontal: space.lg,
      width: '100%',
      maxWidth: 640,
      alignSelf: 'center',
    },
    hero: {
      alignItems: 'center',
      gap: space.xs,
      paddingTop: space.md,
      paddingBottom: space.sm,
    },
    heroName: {
      textAlign: 'center',
      marginTop: space.sm,
    },
    badge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderWidth: 3,
      borderColor: colors.ground,
    },
    badgeText: {
      fontSize: 14,
      lineHeight: 18,
      color: colors.onPrimary,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: space.md,
      paddingBottom: space.sm,
    },
    groupTitle: {
      paddingHorizontal: space.xs,
      marginTop: space.sm,
    },
    group: {
      gap: space.xs,
      paddingVertical: space.xs,
      paddingHorizontal: space.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: withAlpha(colors.border, 0.5),
    },
    groupGap: {
      marginTop: space.md,
    },
    rowMore: {
      gap: space.sm,
      paddingBottom: space.sm,
    },
    importedChat: {
      gap: 2,
      paddingTop: space.sm,
    },
    rule: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    // The signs and colours offered for a contact's picture.
    signs: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    sign: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    signOn: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceAlt,
    },
    signText: {
      fontSize: 22,
      lineHeight: 28,
    },
    swatch: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    swatchOn: {
      borderWidth: 3,
      borderColor: colors.text,
    },
    safety: {
      fontSize: 15,
      lineHeight: 24,
    },
  });
