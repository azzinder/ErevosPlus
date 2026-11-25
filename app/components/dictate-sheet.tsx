// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';
import { ModelsServer, useModelsHost } from './models-server';
import { View } from 'react-native';

import { useVoiceRecorder } from '../lib/audio';
import { errorText } from '../lib/chat-screen';
import { t } from '../lib/i18n';
import { downloadModel, letGoOfModel, MODEL_BYTES, modelHere, writeOut } from '../lib/speech';
import { useColors } from '../theme/context';
import { MicIcon } from './icons';
import { Button, Row, Sheet, Text } from './ui';

// Dictation: speak, and the words are written into the message field, to change before sending.
// The same speech model as a voice message in words (lib/speech.ts, components/speech-sheet.tsx),
// downloaded once when the owner says so; the sound is heard and written out on this phone only,
// and neither it nor its words leave it. The sound is not kept.

type Step =
  | { at: 'need' }
  | { at: 'downloading'; received: number }
  | { at: 'listening'; since: number }
  | { at: 'writing' }
  | { at: 'failed'; why: string };

/** The longest one dictation listens: then it stops and writes out what it heard. */
export const DICTATE_MS = 120_000;

const MB = (bytes: number) => Math.round(bytes / 1_000_000);

const clockOf = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

export function DictateSheet({ open, onWords, onClose }: {
  open: boolean;
  /** What was heard, once written out; not called when nothing was. */
  onWords: (words: string) => void;
  onClose: () => void;
}) {
  // Where the model comes from: LPHL's server, or a web folder the owner named (lib/models-server.ts).
  const host = useModelsHost();
  const colors = useColors();
  const recorder = useVoiceRecorder();
  // The latest of what the bar gave, for a result that comes after it drew again.
  const told = useRef({ onWords, onClose });
  told.current = { onWords, onClose };
  const [step, setStep] = useState<Step>({ at: 'need' });
  const [now, setNow] = useState(0);
  const stopping = useRef<AbortController | null>(null);
  const recording = useRef(false);
  // Which opening of the sheet a result is for: one that comes after it closed is dropped.
  const turn = useRef(0);

  async function listen(mine: number) {
    try {
      const started = await recorder.start();
      if (turn.current !== mine) {
        if (started) void recorder.stop().catch(() => undefined);
        return;
      }
      if (!started) {
        setStep({ at: 'failed', why: t('Erevos may not use the microphone. Allow it in the phone settings to speak into the field.') });
        return;
      }
      recording.current = true;
      setNow(Date.now());
      setStep({ at: 'listening', since: Date.now() });
    } catch (e) {
      if (turn.current === mine) setStep({ at: 'failed', why: errorText(e) });
    }
  }

  async function done() {
    if (!recording.current) return;
    recording.current = false;
    const mine = turn.current;
    setStep({ at: 'writing' });
    try {
      const sound = await recorder.stop();
      const words = sound ? await writeOut(sound.audio) : '';
      if (turn.current !== mine) return;
      if (!words) {
        setStep({ at: 'failed', why: t('No words were heard.') });
        return;
      }
      told.current.onWords(words);
      told.current.onClose();
    } catch (e) {
      if (turn.current === mine) setStep({ at: 'failed', why: errorText(e) });
    }
  }

  useEffect(() => {
    const mine = ++turn.current;
    if (!open) return;
    if (modelHere()) void listen(mine);
    else setStep({ at: 'need' });
    return () => {
      turn.current++;
      stopping.current?.abort();
      // Closed while it listened: the sound is dropped, not written out.
      if (recording.current) {
        recording.current = false;
        void recorder.stop().catch(() => undefined);
      }
      // The model holds about 1.5 GB while it is open: let go of it once this closes.
      letGoOfModel();
    };
    // The recorder is the same one each time; only opening and closing start and stop it.
  }, [open]);

  // The clock while it listens, and the stop at the longest it listens.
  const listening = step.at === 'listening' ? step.since : 0;
  useEffect(() => {
    if (!listening) return;
    const tick = setInterval(() => {
      setNow(Date.now());
      if (Date.now() - listening >= DICTATE_MS) void done();
    }, 250);
    return () => clearInterval(tick);
  }, [listening]);

  async function download() {
    const mine = turn.current;
    const stop = new AbortController();
    stopping.current = stop;
    setStep({ at: 'downloading', received: 0 });
    try {
      await downloadModel((received) => turn.current === mine && setStep({ at: 'downloading', received }), stop.signal);
    } catch (e) {
      if (turn.current === mine) setStep(stop.signal.aborted ? { at: 'need' } : { at: 'failed', why: t('Not downloaded. {error}', { error: errorText(e) }) });
      return;
    } finally {
      if (stopping.current === stop) stopping.current = null;
    }
    if (turn.current === mine) await listen(mine);
  }

  return (
    <Sheet visible={open} onClose={onClose} title={t('Speak to write')}>
      {step.at === 'need' ? (
        <>
          <Text>
            {t('To write what you say, Erevos needs a speech model ({size} MB), once. It is downloaded from {host}, which sees your IP address, as for any download. Then everything is done on this phone: your voice and its words never leave it.', { size: MB(MODEL_BYTES), host })}
          </Text>
          <Text variant="caption" tone="muted">
            {t('It hears about a hundred languages, Greek among them, and finds the one spoken. Best over Wi-Fi.')}
          </Text>
          <Button title={t('Download ({size} MB)', { size: MB(MODEL_BYTES) })} onPress={() => void download()} />
          <ModelsServer />
        </>
      ) : step.at === 'downloading' ? (
        <>
          <Text>{t('Downloading the speech model: {got} of {size} MB', { got: MB(step.received), size: MB(MODEL_BYTES) })}</Text>
          <Button title={t('Stop')} kind="secondary" onPress={() => stopping.current?.abort()} />
        </>
      ) : step.at === 'listening' ? (
        <>
          <Row>
            <View
              style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <MicIcon color={colors.onPrimary} size={22} />
            </View>
            <Text accessibilityLiveRegion="polite">{t('Listening… {time}', { time: clockOf(now - step.since) })}</Text>
          </Row>
          <Text variant="caption" tone="muted">
            {t('Speak, then tap Done: the words go into the field, to change before you send them. Written out on this phone, so it may have mistakes.')}
          </Text>
          <Button title={t('Done')} onPress={() => void done()} />
          <Button title={t('Cancel')} kind="secondary" onPress={onClose} />
        </>
      ) : step.at === 'writing' ? (
        <>
          <Button title={t('Writing it out…')} loading disabled onPress={() => undefined} />
          <Text variant="caption" tone="muted">
            {t('A long one takes a while, up to a minute or two, as the phone writes it out by itself.')}
          </Text>
          {/* Closed now, what it writes out is dropped (turn), and the model let go of. */}
          <Button title={t('Cancel')} kind="secondary" onPress={onClose} />
        </>
      ) : (
        <>
          <Text>{step.why}</Text>
          {modelHere() ? <Button title={t('Try again')} onPress={() => void listen(turn.current)} /> : null}
        </>
      )}
    </Sheet>
  );
}
