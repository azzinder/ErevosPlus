// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';
import { ModelsServer, useModelsHost } from './models-server';
import { View } from 'react-native';

import { confirm } from '../lib/alert';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { errorText } from '../lib/chat-screen';
import { lang, t } from '../lib/i18n';
import { anyModelHere, deleteModels, downloadModels, languageName, letGoOfModels, missing, translate } from '../lib/translate';
import { intoFor, LANGUAGES, languageOf, type Language } from '../lib/translate-ways';
import { Button, Chip, Row, Sheet, Text, TextButton } from './ui';

// A message translated (lib/translate.ts), from its menu in a chat or a group: from the language
// it seems to be in into the app's, either of which the owner can change. The first time for a
// way, it says what models it needs and where they come from, and downloads them once the owner
// says so. The translation shows here only, to read or copy: it is not kept, nor sent.

type Step =
  | { at: 'need' }
  | { at: 'downloading'; received: number; total: number }
  | { at: 'working' }
  | { at: 'done'; words: string }
  | { at: 'failed'; why: string };

const MB = (bytes: number) => Math.round(bytes / 1_000_000);

export function TranslateSheet({ text, onClose }: {
  /** The message's text; null while the sheet is closed. */
  text: string | null;
  onClose: () => void;
}) {
  // Where the model comes from: LPHL's server, or a web folder the owner named (lib/models-server.ts).
  const host = useModelsHost();
  const [from, setFrom] = useState<Language>('en');
  const [into, setInto] = useState<Language>('en');
  const [step, setStep] = useState<Step>({ at: 'working' });
  const [copied, setCopied] = useState(false);
  const stopping = useRef<AbortController | null>(null);
  // Which ask a result is for: one that comes after the sheet closed, or the languages changed, is dropped.
  const turn = useRef(0);

  async function work(said: string, a: Language, b: Language, mine: number) {
    setStep({ at: 'working' });
    try {
      const words = await translate(said, a, b);
      if (turn.current === mine) setStep({ at: 'done', words });
    } catch (e) {
      if (turn.current === mine) setStep({ at: 'failed', why: errorText(e) });
    }
  }

  // Each time the sheet opens on a message, or a language is changed.
  function start(said: string, a: Language, b: Language) {
    const mine = ++turn.current;
    stopping.current?.abort();
    setCopied(false);
    if (a === b) setStep({ at: 'done', words: said });
    else if (missing(a, b).length === 0) void work(said, a, b, mine);
    else setStep({ at: 'need' });
  }

  useEffect(() => {
    if (!text) return;
    const b = intoFor(lang());
    const guessed = languageOf(text) ?? 'en';
    const a = guessed === b ? (b === 'en' ? 'el' : 'en') : guessed;
    setFrom(a);
    setInto(b);
    start(text, a, b);
    return () => {
      turn.current++;
      stopping.current?.abort();
      letGoOfModels();
    };
  }, [text]);

  function choose(a: Language, b: Language) {
    if (!text) return;
    setFrom(a);
    setInto(b);
    start(text, a, b);
  }

  async function download() {
    if (!text) return;
    const mine = turn.current;
    const stop = new AbortController();
    stopping.current = stop;
    const list = missing(from, into);
    const total = list.reduce((sum, m) => sum + m.bytes, 0);
    setStep({ at: 'downloading', received: 0, total });
    try {
      await downloadModels(list, (received) => turn.current === mine && setStep({ at: 'downloading', received, total }), stop.signal);
    } catch (e) {
      if (turn.current === mine) setStep(stop.signal.aborted ? { at: 'need' } : { at: 'failed', why: t('Not downloaded. {error}', { error: errorText(e) }) });
      return;
    } finally {
      if (stopping.current === stop) stopping.current = null;
    }
    if (turn.current === mine) await work(text, from, into, mine);
  }

  async function remove() {
    if (!(await confirm(t('Delete the translation models'), t('Messages cannot be translated until a model is downloaded again.'), t('Delete')))) return;
    deleteModels();
    onClose();
  }

  async function copy(words: string) {
    if (await copyText(words)) setCopied(true);
  }

  const needed = text ? missing(from, into) : [];
  const size = MB(needed.reduce((sum, m) => sum + m.bytes, 0));
  const busy = step.at === 'working' || step.at === 'downloading';
  return (
    <Sheet visible={!!text} onClose={onClose} title={t('Translation')}>
      <Text variant="caption" tone="muted">{t('From')}</Text>
      <Row wrap>
        {LANGUAGES.map((l) => (
          <Chip key={l} label={languageName(l)} selected={l === from} disabled={busy} onPress={() => choose(l, into)} />
        ))}
      </Row>
      <Text variant="caption" tone="muted">{t('Into')}</Text>
      <Row wrap>
        {LANGUAGES.map((l) => (
          <Chip key={l} label={languageName(l)} selected={l === into} disabled={busy} onPress={() => choose(from, l)} />
        ))}
      </Row>
      {step.at === 'need' ? (
        <>
          <Text>
            {t('To translate this way, Erevos needs translation models ({size} MB), once. They are downloaded from {host}, which sees your IP address, as for any download. Then everything is done on this phone: the message and its translation never leave it.', { size, host })}
          </Text>
          <Button title={t('Download ({size} MB)', { size })} onPress={() => void download()} />
          <ModelsServer />
        </>
      ) : step.at === 'downloading' ? (
        <>
          <Text>{t('Downloading the translation models: {got} of {size} MB', { got: MB(step.received), size: MB(step.total) })}</Text>
          <Button title={t('Stop')} kind="secondary" onPress={() => stopping.current?.abort()} />
        </>
      ) : step.at === 'working' ? (
        <Button title={t('Translating…')} loading disabled onPress={() => undefined} />
      ) : step.at === 'done' ? (
        <>
          <View>
            <Text selectable>{step.words}</Text>
          </View>
          <Text variant="caption" tone="muted">
            {t('Translated on this phone, so it may have mistakes. It is not kept.')}
          </Text>
          {CAN_COPY && step.words ? <Button title={copied ? t('Copied') : t('Copy')} kind="secondary" onPress={() => void copy(step.words)} /> : null}
        </>
      ) : (
        <Text>{step.why}</Text>
      )}
      {anyModelHere() && !busy ? (
        <Row>
          <TextButton title={t('Delete the translation models')} onPress={() => void remove()} />
        </Row>
      ) : null}
    </Sheet>
  );
}
