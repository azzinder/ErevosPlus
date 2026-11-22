// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { fileSize } from '../lib/attachments';
import { playVoice } from '../lib/audio';
import { toBase64 } from '../lib/crypto';
import { t } from '../lib/i18n';
import { isCardFile } from '../lib/message-carry';
import { CAN_OPEN_FILE, openFileWith } from '../lib/open-with';
import { saveBytes } from '../lib/save-file';
import { voiceDuration } from '../lib/voice';
import { soundLength } from '../lib/xmpp-voice';
import { radius, space } from '../theme/colors';
import { OpenPhoto } from './attachment';
import { ContactFile } from './network-carry';
import { Button, Row, Text } from './ui';

// A photo, sound or file in a chat on XMPP or Nostr (app/xmpp-chat.tsx, app/nostr-chat.tsx):
// fetched from its server only when asked for, then a photo shown (a tap opens it on the whole
// screen, components/attachment.tsx OpenPhoto), a sound played, and any of them saved. What was
// fetched stays in memory while Erevos runs (lib/file-cache.ts). A sound is a voice message, as
// the other apps send one: Play and Stop, how long it lasts once that is known (as it was recorded
// here, or read from the file once it was fetched, lib/xmpp-voice.ts), and how much is left while
// it plays. A contact card (a .vcf) shows as one, once fetched (components/network-carry.tsx).

/** The ending a sound's type is written with, for the phone's player. */
function endingOf(type: string): string {
  const sub = type.split('/')[1]?.split(';')[0] ?? '';
  if (sub === 'mp4' || sub === 'x-m4a' || sub === 'm4a') return 'm4a';
  if (sub === 'mpeg') return 'mp3';
  return /^[a-z0-9]{2,5}$/.test(sub) ? sub : 'm4a';
}

type FileProps = {
  name: string;
  type: string;
  size?: number;
  dim?: string;
  /** How long a sound lasts, in milliseconds, when that is known. */
  duration?: number;
  fetch: () => Promise<Uint8Array>;
  onMenu?: () => void;
  /** Told how long a sound lasts, once it was fetched and its file says, to keep it. */
  onDuration?: (ms: number) => void;
  /** A photo is fetched and shown at once, as Telegram's are, not on a tap. */
  auto?: boolean;
};

export function NetworkFile(props: FileProps) {
  return isCardFile(props.name, props.type) ? <ContactFile name={props.name} fetch={props.fetch} /> : <FileShown {...props} />;
}

function FileShown({ name, type, size, dim, duration, fetch, onMenu, onDuration, auto }: FileProps) {
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [playing, setPlaying] = useState(false);
  // How long the sound lasts, as its file said, and how much of it has played.
  const [read, setRead] = useState<number | null>(null);
  const [played, setPlayed] = useState(0);
  const stop = useRef<(() => void) | null>(null);
  const here = useRef(true);
  const image = type.startsWith('image/');
  const sound = type.startsWith('audio/');
  useEffect(
    () => () => {
      here.current = false;
      stop.current?.();
    },
    [],
  );
  useEffect(() => {
    if (auto && image) void get();
  }, []);

  async function get(): Promise<Uint8Array | null> {
    if (bytes) return bytes;
    setBusy(true);
    setNote('');
    try {
      const got = await fetch();
      setBytes(got);
      const length = sound && !duration ? soundLength(got) : null;
      if (length) {
        setRead(length);
        onDuration?.(length);
      }
      return got;
    } catch (error) {
      setNote(error instanceof Error ? error.message : t('The file could not be fetched.'));
      return null;
    } finally {
      setBusy(false);
    }
  }

  // True once it is done, saved or not; false if the owner went back (a photo shown on the whole screen then stays).
  async function save(choose = false): Promise<boolean> {
    const got = await get();
    if (!got) return false;
    try {
      if (!(await saveBytes(name, type, got, choose))) return false;
      setNote(t('Saved.'));
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
    return true;
  }

  // Handed to the app the phone opens its kind with (a PDF reader), from memory (lib/open-with.ts).
  async function open() {
    const got = await get();
    if (!got || !here.current) return;
    try {
      await openFileWith(name, type, got);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  async function play() {
    if (stop.current) {
      stop.current();
      return;
    }
    const got = await get();
    // Left the chat while it was fetched: nothing plays on.
    if (!got || !here.current) return;
    try {
      setPlayed(0);
      setPlaying(true);
      stop.current = playVoice(
        got,
        () => {
          stop.current = null;
          setPlaying(false);
        },
        setPlayed,
        endingOf(type),
      );
    } catch (error) {
      setPlaying(false);
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  const lasts = duration ?? read ?? 0;
  const [w, h] = (dim ?? '').split('x').map(Number);
  const ratio = w && h ? w / h : 4 / 3;
  const uri = useMemo(() => (image && bytes ? `data:${type};base64,${toBase64(bytes)}` : null), [image, type, bytes]);
  return (
    <View style={{ gap: space.xs }}>
      {uri && bytes ? (
        <OpenPhoto uri={uri} name={name} size={bytes.length} w={w} h={h} style={{ width: 240, height: 240 / ratio, borderRadius: radius.sm }} onSave={save} onMenu={onMenu} />
      ) : sound ? (
        <Row>
          <Button title={playing ? t('Stop') : t('Play')} compact disabled={busy} onPress={() => void play()} />
          <Text style={{ flexShrink: 1 }}>
            {playing
              ? t('Playing, {time}', { time: voiceDuration(lasts ? Math.max(0, lasts - played) : played) })
              : lasts
                ? t('Voice message, {time}', { time: voiceDuration(lasts) })
                : t('Voice message')}
          </Text>
        </Row>
      ) : (
        <Text numberOfLines={2}>
          {name}
          {size ? ` · ${fileSize(size)}` : ''}
        </Text>
      )}
      <Row>
        {image && !bytes ? <Button title={t('Show photo')} compact disabled={busy} onPress={() => void get()} /> : null}
        {!image && !sound && CAN_OPEN_FILE ? <Button title={t('Open')} compact disabled={busy} onPress={() => void open()} /> : null}
        <Button title={t('Save')} kind="secondary" compact disabled={busy} onPress={() => void save()} />
      </Row>
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
    </View>
  );
}
