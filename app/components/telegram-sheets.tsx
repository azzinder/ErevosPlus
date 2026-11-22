// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { t } from '../lib/i18n';
import { telegramStickers, telegramStickerSets, type TgQuiz, type TgSticker, type TgStickerSet } from '../lib/telegram-store';
import { radius, space } from '../theme/colors';
import { useColors } from '../theme/context';

import { StickerPicker } from './stickers';
import { TelegramPicture } from './telegram-bubble';
import { Button, Chip, Input, Row, Sheet, Text, TextButton, Toggle } from './ui';

// The sheets of a Telegram chat's composer (app/telegram-chat.tsx): a reaction to give to a message
// from the emoji the chat allows, a poll to write (a question, two to ten options, whether the
// votes are anonymous, whether several answers can be given; or a quiz, with its right answer and
// what is said about it once answered), and a sticker to send, picked from
// the account's sticker packs, or one of Erevos's own, sent as a still picture sticker.

const MOST_OPTIONS = 10;

/** The emoji a message can be reacted with; the ones already ours show as chosen. */
export function ReactSheet({ visible, onClose, emoji, ours, onPick }: { visible: boolean; onClose: () => void; emoji: string[]; ours: string[]; onPick: (emoji: string, mine: boolean) => void }) {
  const colors = useColors();
  return (
    <Sheet visible={visible} onClose={onClose} title={t('React')}>
      <Row wrap>
        {emoji.map((e) => (
          <Pressable
            key={e}
            onPress={() => onPick(e, ours.includes(e))}
            accessibilityRole="button"
            accessibilityLabel={e}
            accessibilityState={{ selected: ours.includes(e) }}
            style={{ padding: space.sm, borderRadius: radius.md, borderWidth: ours.includes(e) ? 2 : 1, borderColor: ours.includes(e) ? colors.primary : colors.border }}
          >
            <Text style={{ fontSize: 26 }}>{e}</Text>
          </Pressable>
        ))}
      </Row>
    </Sheet>
  );
}

/** The form of a poll to send. */
export function PollSheet({ visible, onClose, onSend }: { visible: boolean; onClose: () => void; onSend: (question: string, options: string[], anonymous: boolean, multiple: boolean, quiz?: TgQuiz) => void }) {
  const colors = useColors();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [anonymous, setAnonymous] = useState(true);
  const [multiple, setMultiple] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [correct, setCorrect] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');
  useEffect(() => {
    if (!visible) return;
    setQuestion('');
    setOptions(['', '']);
    setAnonymous(true);
    setMultiple(false);
    setQuiz(false);
    setCorrect(null);
    setExplanation('');
  }, [visible]);
  const filled = options.map((o) => o.trim()).filter(Boolean);
  // The right answer's place among the options that are filled in.
  const right = correct !== null && options[correct]?.trim() ? options.slice(0, correct).filter((o) => o.trim()).length : null;
  const ready = question.trim().length > 0 && filled.length >= 2 && (!quiz || right !== null);
  const toggleRow = (label: string, on: boolean, change: (next: boolean) => void) => (
    <Pressable onPress={() => change(!on)} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: on }} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs }}>
      <Text style={{ flex: 1 }}>{label}</Text>
      <Toggle on={on} />
    </Pressable>
  );
  return (
    <Sheet visible={visible} onClose={onClose} title={t('Poll')}>
      <Input value={question} onChangeText={setQuestion} placeholder={t('Question')} accessibilityLabel={t('Question')} maxLength={255} />
      {options.map((o, i) => (
        <Row key={i}>
          {quiz ? (
            <Pressable
              onPress={() => setCorrect(i)}
              accessibilityRole="radio"
              accessibilityLabel={t('Right answer')}
              accessibilityState={{ checked: correct === i }}
              style={{ padding: space.xs, borderRadius: radius.md, borderWidth: correct === i ? 2 : 1, borderColor: correct === i ? colors.primary : colors.border }}
            >
              <Text>{correct === i ? '✅' : '⬜'}</Text>
            </Pressable>
          ) : null}
          <Input
            style={{ flex: 1 }}
            value={o}
            onChangeText={(text) => setOptions((now) => now.map((x, at) => (at === i ? text : x)))}
            placeholder={t('Option {n}', { n: i + 1 })}
            accessibilityLabel={t('Option {n}', { n: i + 1 })}
            maxLength={100}
          />
        </Row>
      ))}
      {options.length < MOST_OPTIONS ? <TextButton title={t('Add option')} onPress={() => setOptions((now) => [...now, ''])} /> : null}
      {toggleRow(t('Anonymous votes'), anonymous, setAnonymous)}
      {quiz ? null : toggleRow(t('Several answers'), multiple, setMultiple)}
      {toggleRow(t('Quiz'), quiz, setQuiz)}
      {quiz ? (
        <>
          <Text variant="caption" tone="faint">
            {t('Tap the box next to the right answer. Each one answers once and cannot change it.')}
          </Text>
          <Input value={explanation} onChangeText={setExplanation} multiline placeholder={t('Explanation (optional)')} accessibilityLabel={t('Explanation (optional)')} maxLength={200} />
        </>
      ) : null}
      <Button
        title={t('Send')}
        disabled={!ready}
        onPress={() => onSend(question.trim(), filled, anonymous, quiz ? false : multiple, quiz && right !== null ? { correct: right, explanation: explanation.trim() } : undefined)}
      />
    </Sheet>
  );
}

/** The account's sticker packs as chips, and the chosen pack's stickers as pictures to tap. */
export function StickerSheet({ visible, onClose, path, onPick }: { visible: boolean; onClose: () => void; path: (fileId: number) => Promise<string>; onPick: (sticker: TgSticker) => void }) {
  const [sets, setSets] = useState<TgStickerSet[] | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [stickers, setStickers] = useState<TgSticker[]>([]);
  const [note, setNote] = useState('');
  useEffect(() => {
    if (!visible) return;
    let alive = true;
    setNote('');
    telegramStickerSets().then(
      (found) => {
        if (!alive) return;
        setSets(found);
        setChosen((now) => now ?? found[0]?.id ?? null);
      },
      (error: unknown) => alive && setNote(error instanceof Error ? error.message : String(error)),
    );
    return () => {
      alive = false;
    };
  }, [visible]);
  useEffect(() => {
    if (!visible || chosen === null) return;
    let alive = true;
    setStickers([]);
    telegramStickers(chosen).then(
      (found) => alive && setStickers(found),
      (error: unknown) => alive && setNote(error instanceof Error ? error.message : String(error)),
    );
    return () => {
      alive = false;
    };
  }, [visible, chosen]);
  return (
    <Sheet visible={visible} onClose={onClose} title={t('Sticker')}>
      {sets && sets.length === 0 ? <Text tone="muted">{t('No sticker packs yet.')}</Text> : null}
      <Row wrap>
        {(sets ?? []).map((s) => (
          <Chip key={s.id} label={s.title || '…'} selected={s.id === chosen} onPress={() => setChosen(s.id)} />
        ))}
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {stickers.map((s) => (
          <Pressable key={s.file} onPress={() => onPick(s)} accessibilityRole="button" accessibilityLabel={s.emoji || t('Sticker')}>
            <TelegramPicture fileId={s.thumb ?? (s.animated ? undefined : s.file)} path={path} size={72} fallback={s.emoji} />
          </Pressable>
        ))}
      </View>
      {note ? <Text tone="muted">{note}</Text> : null}
    </Sheet>
  );
}

/** Erevos's own stickers, to send one to a Telegram chat: tapped, its name is `onPick`ed. */
export function ErevosStickerSheet({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (name: string) => void }) {
  return (
    <Sheet visible={visible} onClose={onClose} title={t('Erevos sticker')}>
      <Text variant="caption" tone="faint">
        {t('Telegram gets it as a still picture sticker.')}
      </Text>
      <StickerPicker onPick={onPick} />
    </Sheet>
  );
}
