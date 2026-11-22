// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { AudioQuality, IOSOutputFormat, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, type RecordingOptions } from 'expo-audio';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View, type StyleProp, type TextStyle } from 'react-native';

import { fillText } from '../lib/contacts';
import { t } from '../lib/i18n';
import { MMS_MAX } from '../lib/pick-mms-photo';
import { placesIn } from '../lib/sms-parts';
import { parseVCards, type VCard } from '../lib/vcard';
import { MAX_VOICE_MS, MIN_VOICE_MS } from '../lib/voice';
import { openFileWith } from '../lib/open-with';
import { smsPictureBytes, type SmsMessage, type SmsPart } from '../modules/erevos-sms';
import { space } from '../theme/colors';

import type { VoiceControl } from './composer';
import { VoiceClip } from './matrix-voice';
import { PlaceCard } from './message-parts';
import { Text } from './ui';

// What an SMS or MMS shows besides its words (lib/sms-parts.ts), in its conversation (app/sms.tsx)
// and among a contact's chat (components/chat-thread-lines.tsx): its voice messages, played with
// Play; its contact cards, with Save, which opens a new contact with what the card says; the places
// its words name, opened in the phone's maps app. And the recording of a voice message for an MMS,
// for the microphone of the other chats (components/matrix-voice.tsx MicButton): recorded here as
// AMR-NB, the sound every phone's messaging app plays from an MMS, whatever the other chats
// record in (lib/audio.ts).

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

// AMR-NB at 12.2 kbit/s, about 1.5 KB a second: a minute is about 90 KB, under what carriers take
// in one MMS (MMS_MAX), which stops it should a phone write more. SMS are Android's alone: the iOS
// setting is there because expo-audio asks for one.
const AMR: RecordingOptions = {
  extension: '.amr',
  sampleRate: 8000,
  numberOfChannels: 1,
  bitRate: 12_200,
  android: { extension: '.amr', outputFormat: 'amrnb', audioEncoder: 'amr_nb', sampleRate: 8000, maxFileSize: MMS_MAX },
  ios: { outputFormat: IOSOutputFormat.MPEG4AAC, audioQuality: AudioQuality.LOW, linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false },
  web: {},
};

function deleteQuietly(file: File) {
  try {
    if (file.exists) file.delete();
  } catch {
    // Gone already: lib/audio.ts clearLeftovers deletes any left by a recording that did not end.
  }
}

/**
 * Records one voice message at a time for an MMS, as AMR, for MicButton: held, it records; let go,
 * `send` is given the sound; slid away, or under a second, it is let go. A minute is the most. `say`
 * tells what the screen should (the microphone is not allowed, it was too short, it was let go).
 */
export function useSmsVoice({ send, say }: { send: (audio: Uint8Array) => Promise<void>; say: (text: string) => void }): VoiceControl {
  const recorder = useAudioRecorder(AMR);
  const [recording, setRecording] = useState(false);
  const holding = useRef(false);
  const letGo = useRef(false);
  const started = useRef<Promise<boolean> | null>(null);
  const since = useRef(0);
  const longest = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ send, say });
  latest.current = { send, say };

  // Stops recording: the sound, or null when it was too short to be meant. Its file goes at once.
  async function finish(): Promise<Uint8Array | null> {
    const ms = Date.now() - since.current;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    const uri = recorder.uri;
    if (!uri) return null;
    const file = new File(uri);
    try {
      return ms < MIN_VOICE_MS ? null : await file.bytes();
    } finally {
      deleteQuietly(file);
    }
  }

  // Left in the middle of a recording: it goes unsent.
  useEffect(
    () => () => {
      if (longest.current) clearTimeout(longest.current);
      if (started.current) {
        started.current = null;
        holding.current = false;
        void finish().catch(() => undefined);
      }
    },
    [],
  );

  function start() {
    holding.current = true;
    letGo.current = false;
    started.current = (async () => {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        latest.current.say(t('Erevos may not use the microphone. Allow it in the phone settings to send voice messages.'));
        return false;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      since.current = Date.now();
      if (!holding.current) {
        // Let go while the microphone was getting ready: too short to be meant.
        void finish().catch(() => undefined);
        if (!letGo.current) latest.current.say(t('Hold to record, and let go to send.'));
        return false;
      }
      setRecording(true);
      longest.current = setTimeout(() => void stop(false), MAX_VOICE_MS);
      return true;
    })().catch((error: unknown) => {
      latest.current.say(t('Cannot record. {error}', { error: errorText(error) }));
      return false;
    });
  }

  async function stop(cancel: boolean) {
    holding.current = false;
    letGo.current = cancel;
    if (longest.current) clearTimeout(longest.current);
    longest.current = null;
    const ready = started.current;
    started.current = null;
    if (!ready || !(await ready)) return;
    setRecording(false);
    try {
      const audio = await finish();
      if (cancel) {
        latest.current.say(t('Recording cancelled.'));
        return;
      }
      if (!audio) {
        latest.current.say(t('Hold to record, and let go to send.'));
        return;
      }
      await latest.current.send(audio);
    } catch (error) {
      latest.current.say(t('Not sent. {reason}', { reason: errorText(error) }));
    }
  }

  return { recording, start, stop: (cancel) => void stop(cancel) };
}

/** The voice messages, contact cards and places of an SMS or MMS, under its pictures; nothing when it has none. */
export function SmsExtras({ m, ink }: { m: Pick<SmsMessage, 'text' | 'voices' | 'cards' | 'videos'>; ink?: StyleProp<TextStyle> }) {
  const places = useMemo(() => placesIn(m.text), [m.text]);
  const voices = m.voices ?? [];
  const cards = m.cards ?? [];
  const videos = m.videos ?? [];
  if (voices.length === 0 && cards.length === 0 && places.length === 0 && videos.length === 0) return null;
  return (
    <View style={{ gap: space.sm }}>
      {videos.map((part) => (
        <SmsVideo key={part.uri} part={part} ink={ink} />
      ))}
      {voices.map((part) => (
        <VoiceClip key={part.uri} type={part.type} fetch={() => smsPictureBytes(part.uri)} />
      ))}
      {cards.map((part) => (
        <SmsContactCard key={part.uri} part={part} ink={ink} />
      ))}
      {places.map((place) => (
        <PlaceCard key={`${place.lat},${place.lon}`} place={place} ink={ink} />
      ))}
    </View>
  );
}

/** A video of an MMS: a tap plays it in the phone's own video app, as Erevos has no player of its own. */
function SmsVideo({ part, ink }: { part: SmsPart; ink?: StyleProp<TextStyle> }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  async function play() {
    setNote('');
    setBusy(true);
    try {
      const bytes = await smsPictureBytes(part.uri);
      const ending = part.type.toLowerCase().includes('3gpp') ? '3gp' : part.type.toLowerCase().includes('webm') ? 'webm' : 'mp4';
      await openFileWith(`video.${ending}`, part.type, bytes);
    } catch (error) {
      setNote(errorText(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Pressable onPress={() => void play()} accessibilityRole="button" accessibilityLabel={t('Play the video')} disabled={busy}>
      <View style={{ width: 200, height: 120, borderRadius: 12, backgroundColor: '#334', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 30 }}>{busy ? '…' : '▶'}</Text>
      </View>
      <Text style={[ink, { fontSize: 13, opacity: 0.8 }]}>{`🎬 ${t('Video')}`}</Text>
      {note ? <Text style={[ink, { fontSize: 13, opacity: 0.8 }]}>{note}</Text> : null}
    </Pressable>
  );
}

/** The most contacts one card shows, of a file that holds several. */
const CARDS_SHOWN = 3;

/** A contact card that came: its name, numbers and emails, and Save, which opens a new contact with them. */
function SmsContactCard({ part, ink }: { part: SmsPart; ink?: StyleProp<TextStyle> }) {
  // Undefined while it is read; null when it could not be.
  const [read, setRead] = useState<VCard[] | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    smsPictureBytes(part.uri).then(
      (bytes) => live && setRead(parseVCards(bytes)),
      () => live && setRead(null),
    );
    return () => {
      live = false;
    };
  }, [part.uri]);
  const cards = read ?? [];
  return (
    <View style={{ gap: 2 }}>
      <Text style={[ink, { fontWeight: '700' }]}>{`👤 ${t('Contact card')}`}</Text>
      {read === null ? <Text style={[ink, { fontSize: 13, opacity: 0.8 }]}>{t('The message is not on this phone.')}</Text> : null}
      {cards.slice(0, CARDS_SHOWN).map((card, i) => (
        <View key={i} style={{ gap: 2 }}>
          <Text style={[ink, { fontSize: 15 }]} selectable>
            {card.name}
          </Text>
          {[...card.phones.slice(0, 3), ...card.emails.slice(0, 2)].map((entry, k) => (
            <Text key={k} style={[ink, { fontSize: 13 }]} selectable>
              {entry.value}
            </Text>
          ))}
          <Pressable onPress={() => router.push(`/contact-edit?fill=${encodeURIComponent(fillText(card))}`)} accessibilityRole="button" hitSlop={6}>
            <Text style={[ink, { textDecorationLine: 'underline' }]}>{t('Save')}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
