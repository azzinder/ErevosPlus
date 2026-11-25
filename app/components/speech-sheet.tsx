// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';
import { ModelsServer, useModelsHost } from './models-server';
import { View } from 'react-native';

import { confirm } from '../lib/alert';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { errorText } from '../lib/chat-screen';
import { t } from '../lib/i18n';
import { deleteModel, downloadModel, letGoOfModel, MODEL_BYTES, modelHere, writeOut } from '../lib/speech';
import { Button, Row, Sheet, Text, TextButton } from './ui';

// A voice message written out (lib/speech.ts), from its menu in a chat or a group. The first
// time, it says what the speech model is and where it comes from, and downloads it once the owner
// says so. The words show here only, to read or copy: they are not kept, nor sent.

type Step =
  | { at: 'need' }
  | { at: 'downloading'; received: number }
  | { at: 'writing' }
  | { at: 'done'; words: string }
  | { at: 'failed'; why: string };

const MB = (bytes: number) => Math.round(bytes / 1_000_000);

export function SpeechSheet({ sound, onClose }: {
  /** The voice message's sound, read when the sheet opens; null while it is closed. */
  sound: (() => Promise<Uint8Array | null>) | null;
  onClose: () => void;
}) {
  // Where the model comes from: LPHL's server, or a web folder the owner named (lib/models-server.ts).
  const host = useModelsHost();
  const [step, setStep] = useState<Step>({ at: 'writing' });
  const [copied, setCopied] = useState(false);
  const stopping = useRef<AbortController | null>(null);
  // Which opening of the sheet a result is for: one that comes after it closed, or for another, is dropped.
  const turn = useRef(0);

  async function write(read: () => Promise<Uint8Array | null>, mine: number) {
    setStep({ at: 'writing' });
    try {
      const audio = await read();
      if (!audio) throw new Error(t("This voice message's sound is gone."));
      const words = await writeOut(audio);
      if (turn.current === mine) setStep({ at: 'done', words });
    } catch (e) {
      if (turn.current === mine) setStep({ at: 'failed', why: errorText(e) });
    }
  }

  useEffect(() => {
    const mine = ++turn.current;
    setCopied(false);
    if (!sound) return;
    if (modelHere()) void write(sound, mine);
    else setStep({ at: 'need' });
    return () => {
      turn.current++;
      stopping.current?.abort();
      // The model holds about 1.5 GB while it is open: let go of it once this closes.
      letGoOfModel();
    };
  }, [sound]);

  async function download() {
    if (!sound) return;
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
    if (turn.current === mine) await write(sound, mine);
  }

  async function remove() {
    if (!(await confirm(t('Delete the speech model'), t('Voice messages cannot be written out until it is downloaded again ({size} MB).', { size: MB(MODEL_BYTES) }), t('Delete')))) return;
    deleteModel();
    onClose();
  }

  async function copy(words: string) {
    if (await copyText(words)) setCopied(true);
  }

  return (
    <Sheet visible={!!sound} onClose={onClose} title={t('Voice message in words')}>
      {step.at === 'need' ? (
        <>
          <Text>
            {t('To write out voice messages, Erevos needs a speech model ({size} MB), once. It is downloaded from {host}, which sees your IP address, as for any download. Then everything is done on this phone: the sound and its words never leave it.', { size: MB(MODEL_BYTES), host })}
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
      ) : step.at === 'writing' ? (
        <Button title={t('Writing it out…')} loading disabled onPress={() => undefined} />
      ) : step.at === 'done' ? (
        <>
          <View>
            <Text selectable>{step.words || t('No words were heard.')}</Text>
          </View>
          <Text variant="caption" tone="muted">
            {t('Written out on this phone, so it may have mistakes. It is not kept.')}
          </Text>
          {CAN_COPY && step.words ? <Button title={copied ? t('Copied') : t('Copy')} kind="secondary" onPress={() => void copy(step.words)} /> : null}
        </>
      ) : (
        <Text>{step.why}</Text>
      )}
      {modelHere() && step.at !== 'writing' && step.at !== 'downloading' ? (
        <Row>
          <TextButton title={t('Delete the speech model')} onPress={() => void remove()} />
        </Row>
      ) : null}
    </Sheet>
  );
}
