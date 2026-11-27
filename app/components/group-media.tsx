// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, View, type StyleProp, type TextStyle } from 'react-native';

import { clearLeftovers, playVoice, useVoiceRecorder } from '../lib/audio';
import { bytesSource, FileGoneError, MAX_FILE, readFile, type Source } from '../lib/attachments';
import { filesToTake, sendGroupFile, takeGroupFile, voiceMime } from '../lib/group-media';
import { t } from '../lib/i18n';
import { loadPhotoQuality, savePhotoQuality } from '../lib/photo-quality';
import { isSharedPhoto, readShared, type SharedFile } from '../lib/share-in';
import { sendsWithPlace } from '../lib/photo-place';
import { pickSource, TooLargeError } from '../lib/pick-file';
import { CAN_TAKE_PHOTOS, NoCameraError, pickPhoto, type PhotoQuality } from '../lib/pick-photo';
import type { Relay } from '../lib/relay';
import { saveFile } from '../lib/save-file';
import { notYoursToSee, onceLine } from '../lib/see-once';
import { MAX_VOICE_MS, MIN_VOICE_MS, voiceDuration } from '../lib/voice';
import { cleanFileName, cleanMime, mimeOf, type FileMeta, type FileRef } from '../lock/attachment-files';
import type { GroupMessage } from '../lock/group-data';
import { Attachment, comingText, FileViewer, openRefWith, shownOf, useShownPhotos } from './attachment';
import { ComposerPanel, type ComposerTile, type VoiceControl } from './composer';
import { useGroupsWhere } from './groups-at';
import { groupIpGate } from './ip-warning';
import { PhotoSticker } from './stickers';
import { Text } from './ui';

// Photos, files and voice messages in a group's thread (components/group-chat.tsx, lib/group-media.ts): the
// panel "+" opens under its message bar (components/composer.tsx), the bar's microphone, each
// one's place in its bubble, and the photo or file looked at on its own. Others' up to AUTO_TAKE
// are taken from the relay while the group is open, as they come; bigger ones when tapped. A voice
// message is recorded while the microphone is held, and plays when tapped. Nothing here is a group's message itself: where a file is, once taken, shows here
// at once, and is kept in the group (Groups.setFile) for the next time it opens.

// How long what this says stays under the messages, milliseconds.
const SAID_SHOWN = 8000;

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

type Picked = { name: string; mime: string; source: Source; w?: number; h?: number; hidden?: true; once?: true; close?: () => void };

/**
 * The media of group `id`, whose messages are `messages`. `onError` shows what went wrong. Gives
 * the panel under the message bar (`panel`, shown while `attaching`), the microphone (`voice`),
 * what goes on now (`said`, for under the messages), the sheets (`sheets`), and a message's photo,
 * file or voice message for its bubble (`content`). `more` gives the panel's other tiles
 * (components/group-messages.tsx), each opened once the panel has closed. `thread`: the tag of the
 * message whose thread shows, which what is sent then answers.
 */
export function useGroupMedia(id: string, messages: GroupMessage[], onError: (text: string) => void, more?: (afterPanel: (then: () => void) => void) => ComposerTile[], thread?: string | null) {
  const { at: groupsAt } = useGroupsWhere();
  const [own, setOwn] = useState<Relay | null>(null);
  const [quality, setQuality] = useState<PhotoQuality>('original');
  const [attaching, setAttaching] = useState(false);
  const [viewing, setViewing] = useState<FileRef | null>(null);
  // The tag of a member's photo to see once that shows: let go of as it closes (lib/see-once.ts).
  const viewingOnce = useRef<string | null>(null);
  const [said, setSaid] = useState('');
  const saidTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // How far each file being taken from the relay is, by its id; 'failed' or 'gone' if it did not come.
  const [taking, setTaking] = useState<Record<string, string>>({});
  // Files taken while the group is open, by id: shown at once, before its messages are read again.
  const [taken, setTaken] = useState<Record<string, FileRef>>({});
  const takingNow = useRef(new Set<string>());
  // Files already tried, so one that failed is taken again only when tapped.
  const tried = useRef(new Set<string>());
  const recorder = useVoiceRecorder();
  // While the microphone is held, and the recording it started.
  const [talking, setTalking] = useState(false);
  const holding = useRef(false);
  const recording = useRef<Promise<boolean> | null>(null);
  const longest = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Let go of on purpose (slid away), so nothing is said of it.
  const letGo = useRef(false);
  // The voice message playing, by its file's id, how far it has played, and how to stop it.
  const [playing, setPlaying] = useState<string | null>(null);
  const [played, setPlayed] = useState(0);
  const stopPlaying = useRef<(() => void) | null>(null);

  // What it says goes after a while; how far a file has gone stays until it is done.
  function say(text: string, stays = false) {
    if (saidTimer.current) clearTimeout(saidTimer.current);
    saidTimer.current = stays || !text ? null : setTimeout(() => setSaid(''), SAID_SHOWN);
    setSaid(text);
  }

  useEffect(() => {
    clearLeftovers();
    loadPhotoQuality().then(setQuality, () => undefined);
    groupsAt.relay().then(setOwn, () => setOwn(null));
    // Nothing plays, or records, once the group closes.
    return () => {
      stopPlaying.current?.();
      holding.current = false;
      if (longest.current) clearTimeout(longest.current);
      if (saidTimer.current) clearTimeout(saidTimer.current);
    };
  }, [groupsAt]);

  const fileOf = (m: GroupMessage) => (m.file ? (taken[m.file.id] ?? m.file) : undefined);
  const shown = messages.map((m) => (m.file ? { ...m, file: fileOf(m) } : m));

  // Takes a photo, file or voice message that came, from the relay it is on through ours, and keeps it here.
  async function take(ref: FileRef, voice: boolean, itself = false) {
    if (takingNow.current.has(ref.id) || !ref.from) return;
    takingNow.current.add(ref.id);
    tried.current.add(ref.id);
    try {
      const relay = own ?? (await groupsAt.relay().catch(() => null));
      if (!relay) {
        onError(t('Type the server address in Server first.'));
        return;
      }
      setTaking((now) => ({ ...now, [ref.id]: '0%' }));
      const kept = await takeGroupFile(
        await groupsAt.groups(),
        id,
        relay,
        ref,
        (done, count) => setTaking((now) => ({ ...now, [ref.id]: `${Math.floor((done / count) * 100)}%` })),
        itself,
      );
      if (kept) setTaken((now) => ({ ...now, [ref.id]: kept }));
      setTaking(({ [ref.id]: _done, ...rest }) => rest);
    } catch (error) {
      setTaking((now) => ({ ...now, [ref.id]: error instanceof FileGoneError ? 'gone' : 'failed' }));
      const reason = { error: errorText(error) };
      onError(voice ? t('A voice message did not come. {error}', reason) : ref.kind === 'photo' ? t('A photo did not come. {error}', reason) : t('A file did not come. {error}', reason));
    } finally {
      takingNow.current.delete(ref.id);
    }
  }

  // Others' up to AUTO_TAKE are taken as soon as they come, or when the group opens.
  useEffect(() => {
    if (!own) return;
    for (const file of filesToTake(shown, tried.current, own)) void take(file, messages.find((m) => m.file?.id === file.id)?.ms !== undefined, true);
  }, [own, messages]);

  function chooseQuality(next: PhotoQuality) {
    setQuality(next);
    savePhotoQuality(next).catch((error) => onError(errorText(error)));
  }

  // Sends a photo, file or voice message (with `ms`) to the group: its chunks to our relay, then
  // where they are to every member. If any of it cannot go, nothing is kept.
  async function send(what: 'photo' | 'file' | 'voice', source: Source, meta: Omit<FileMeta, 'size'>, ms?: number) {
    try {
      if (source.size > MAX_FILE) throw new TooLargeError();
      const relay = own ?? (await groupsAt.relay());
      if (what !== 'voice') say(what === 'photo' ? t('Sending the photo…') : t('Sending the file…'), true);
      await sendGroupFile(
        await groupsAt.groups(),
        id,
        relay,
        source,
        meta,
        ms,
        groupsAt.transport,
        (done, count) => {
          if (count < 2 || what === 'voice') return;
          const percent = Math.floor((done / count) * 100);
          say(what === 'photo' ? t('Sending the photo, {percent}%', { percent }) : t('Sending the file, {percent}%', { percent }), true);
        },
        thread ? { re: thread } : {},
      );
      say('');
    } catch (error) {
      say('');
      onError(error instanceof TooLargeError ? t('Not sent. Files can be 100 MB at most.') : t('Not sent. {reason}', { reason: errorText(error) }));
    }
  }

  async function sendPicked(kind: 'photo' | 'file', get: () => Promise<Picked | null>) {
    // Said once for the group before anything of it goes, before the photo or file is picked.
    if (!(await groupIpGate(id, groupsAt.hidden))) return;
    let picked: Picked | null;
    try {
      picked = await get();
    } catch (error) {
      onError(
        error instanceof TooLargeError
          ? t('Not sent. Files can be 100 MB at most.')
          : error instanceof NoCameraError
            ? error.message
            : t('Cannot open it. {error}', { error: errorText(error) }),
      );
      return;
    }
    if (!picked) return;
    try {
      const size = picked.w && picked.h ? { w: picked.w, h: picked.h } : {};
      await send(kind, picked.source, { name: picked.name, mime: picked.mime, kind, ...size, ...(picked.hidden ? { hidden: true as const, ...(picked.once ? { once: true as const } : {}) } : {}) });
    } finally {
      picked.close?.();
    }
  }

  // What is picked under "+" opens once the panel has closed.
  function afterSheet(then: () => void) {
    setAttaching(false);
    then();
  }

  // A photo from the gallery or the camera; `hidden`, blurred till tapped; `once`, to see once (lib/see-once.ts).
  function sendPhoto(from: 'photos' | 'camera', hidden = false, once = false) {
    afterSheet(() =>
      void sendPicked('photo', async () => {
        const photo = await pickPhoto(from, quality);
        return photo && { name: photo.name, mime: photo.mime, source: bytesSource(photo.bytes), w: photo.w, h: photo.h, ...(hidden || once ? { hidden: true as const } : {}), ...(once ? { once: true as const } : {}) };
      }),
    );
  }

  function sendPickedFile() {
    afterSheet(() =>
      void sendPicked('file', async () => {
        const picked = await pickSource(MAX_FILE, true);
        if (!picked) return null;
        if (!(await sendsWithPlace(picked))) return null;
        const name = cleanFileName(picked.name);
        const mime = cleanMime(picked.mime);
        return { name, mime: mime === 'application/octet-stream' ? mimeOf(name) : mime, source: picked.source, close: picked.close };
      }),
    );
  }

  // A photo or file shared from another app (lib/share-in.ts), sent as the group opens.
  function sendShared(shared: SharedFile) {
    return sendPicked(isSharedPhoto(shared) ? 'photo' : 'file', () => readShared(shared));
  }

  // Starts recording while the microphone is held. Letting go sends it; a minute sends it anyway.
  function startTalking() {
    holding.current = true;
    letGo.current = false;
    const started = recorder.start().then((ok) => {
      if (!ok) {
        onError(t('Erevos may not use the microphone. Allow it in the phone settings to send voice messages.'));
        return false;
      }
      if (!holding.current) {
        // Let go while the microphone was getting ready: too short to be meant.
        void recorder.stop().catch(() => undefined);
        if (!letGo.current) say(t('Hold to record, and let go to send.'));
        return false;
      }
      setTalking(true);
      longest.current = setTimeout(() => void stopTalking(), MAX_VOICE_MS);
      return true;
    });
    recording.current = started.catch((error) => {
      onError(t('Cannot record. {error}', { error: errorText(error) }));
      return false;
    });
  }

  // Stops recording and sends it, or, `cancel`led (slid away), lets it go. Under a second is
  // taken for a slip, and is let go too.
  async function stopTalking(cancel = false) {
    holding.current = false;
    letGo.current = cancel;
    if (longest.current) clearTimeout(longest.current);
    longest.current = null;
    const started = recording.current;
    recording.current = null;
    if (!started || !(await started)) return;
    setTalking(false);
    try {
      const recorded = await recorder.stop();
      if (cancel) {
        say(t('Recording cancelled.'));
        return;
      }
      if (!recorded || recorded.ms < MIN_VOICE_MS) {
        say(t('Hold to record, and let go to send.'));
        return;
      }
      // Kept while the guide is read, should it be: Cancel lets it go.
      if (!(await groupIpGate(id, groupsAt.hidden))) return;
      await send('voice', bytesSource(recorded.audio), { name: 'voice', mime: voiceMime(recorded.audio), kind: 'file' }, recorded.ms);
    } catch (error) {
      onError(t('Not sent. {reason}', { reason: errorText(error) }));
    }
  }

  // Plays a voice message, or stops it if it is the one playing.
  async function play(file: FileRef) {
    stopPlaying.current?.();
    if (playing === file.id) return;
    try {
      const audio = await readFile(file);
      if (!audio) {
        onError(t("This voice message's sound is gone."));
        return;
      }
      setPlaying(file.id);
      setPlayed(0);
      stopPlaying.current = playVoice(
        audio,
        () => {
          stopPlaying.current = null;
          setPlaying((current) => (current === file.id ? null : current));
        },
        setPlayed,
      );
    } catch (error) {
      onError(t('Cannot play it. {error}', { error: errorText(error) }));
    }
  }

  // A photo, file or voice message tapped: taken from the relay if it is not here yet, otherwise
  // played, or shown on its own.
  function open(m: GroupMessage) {
    const file = fileOf(m);
    if (!file) return;
    // Ours to see once is the members' to see.
    if (file.once && m.from === '') {
      say(notYoursToSee());
      return;
    }
    if (file.from) void take(file, m.ms !== undefined);
    else if (m.ms !== undefined) void play(file);
    else {
      viewingOnce.current = file.once ? m.tag : null;
      setViewing(file);
    }
  }

  // Closes the photo looked at; a member's to see once is let go of here.
  function closeViewing() {
    const tag = viewingOnce.current;
    viewingOnce.current = null;
    setViewing(null);
    if (tag) void groupsAt.groups().then((groups) => groups.seeOnce(id, tag)).catch((error) => onError(errorText(error)));
  }

  async function saveViewed(choose: boolean) {
    if (!viewing) return;
    try {
      const where = await saveFile(viewing, choose);
      if (!where) return;
      setViewing(null);
      say(t('Saved in {where}. There it is outside Erevos, not sealed.', { where }));
    } catch (error) {
      setViewing(null);
      onError(t('Not saved. {error}', { error: errorText(error) }));
    }
  }

  // The photos shown: the latest photos and stickers in the thread, and the one looked at on its own.
  const photoFiles = shownOf(shown.flatMap((m) => (m.file ? [m.file] : [])));
  if (viewing?.kind === 'photo' && !photoFiles.some((file) => file.id === viewing.id)) photoFiles.push(viewing);
  const photos = useShownPhotos(photoFiles, (error) => onError(t('Cannot show the photo. {error}', { error: errorText(error) })));

  const voice: VoiceControl = { recording: talking, start: startTalking, stop: (cancel) => void stopTalking(cancel) };

  // What "+" opens under the bar: photos and files, then what `more` adds. A group has no ways to
  // send but now, so no rows under them.
  const tiles: ComposerTile[] = [{ key: 'photo', title: t('Photo'), icon: 'photo', onPress: () => sendPhoto('photos') }];
  if (CAN_TAKE_PHOTOS) tiles.push({ key: 'camera', title: t('Camera'), icon: 'camera', onPress: () => sendPhoto('camera') });
  tiles.push(
    { key: 'hidden-photo', title: t('Hidden photo'), icon: 'photo', onPress: () => sendPhoto('photos', true) },
    { key: 'once-photo', title: t('Photo to see once'), icon: 'photo', onPress: () => sendPhoto('photos', true, true) },
    ...(CAN_TAKE_PHOTOS ? [{ key: 'once-camera', title: t('Camera, to see once'), icon: 'camera' as const, onPress: () => sendPhoto('camera', true, true) }] : []),
    { key: 'file', title: t('File'), icon: 'file', onPress: sendPickedFile },
    ...(more?.(afterSheet) ?? []),
  );
  const panel: ReactNode = (
    <ComposerPanel
      tiles={tiles}
      quality={{ value: quality, onChange: chooseQuality }}
      foot={t('A file goes as it is, up to 100 MB, with whatever it says inside. The server keeps it, encrypted, 14 days, for each member to take.')}
    />
  );

  const sheets: ReactNode = (
    <>
      <FileViewer file={viewing} uri={viewing ? photos[viewing.id] : undefined} onSave={(choose) => void saveViewed(choose)} onOpen={viewing ? () => openRefWith(viewing) : undefined} onClose={closeViewing} once={!!viewing?.once} />
    </>
  );

  /** A message's photo, file or voice message, tappable, or null when it has none. `onLongPress` is the bubble's. */
  function content(m: GroupMessage, ink: StyleProp<TextStyle>, onLongPress?: () => void): ReactNode {
    const file = fileOf(m);
    if (!file) return m.seenOnce ? <Text style={[ink, { fontStyle: 'italic' }]}>{onceLine(m.from === '', true)}</Text> : null;
    const voice = m.ms !== undefined;
    const coming = comingText(file, taking[file.id]);
    return (
      <Pressable onPress={() => open(m)} onLongPress={onLongPress} accessibilityRole="button" accessibilityHint={voice ? t('Tap to play') : t('Tap to open')}>
        {voice ? (
          <View style={{ gap: 2 }}>
            <Text style={ink}>
              {playing === file.id
                ? `■  ${t('Playing, {time}', { time: voiceDuration(Math.max(0, m.ms! - played)) })}`
                : `▶  ${t('Voice message, {time}', { time: voiceDuration(m.ms!) })}`}
            </Text>
            {coming ? <Text style={[ink, { fontSize: 13, opacity: 0.8 }]}>{coming}</Text> : null}
          </View>
        ) : file.sticker ? (
          <PhotoSticker uri={photos[file.id]} status={coming} />
        ) : (
          <Attachment file={file} uri={photos[file.id]} state={taking[file.id]} ink={ink} mine={m.from === ''} />
        )}
      </Pressable>
    );
  }

  return { panel, attaching, setAttaching, voice, said, sheets, content, sendShared };
}
