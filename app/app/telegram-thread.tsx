// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '../components/keyboard';
import { MicButton, RecordingLine } from '../components/matrix-voice';
import { MessageMenu, type MenuAction } from '../components/message-menu';
import { Quote } from '../components/message-parts';
import { Bubble, fetchFile, fetchPath } from '../components/telegram-bubble';
import { ErevosStickerSheet, ReactSheet, StickerSheet } from '../components/telegram-sheets';
import { useTelegramVoice } from '../components/telegram-voice';
import { Button, Input, Page, Row, Text, TextButton } from '../components/ui';
import { ask } from '../lib/alert';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { t } from '../lib/i18n';
import { useNetworkWhere, whereParams } from '../lib/network-place';
import { openTelegramLink } from '../components/telegram-link-open';
import { telegramSendGate } from '../components/telegram-ip';
import { TooLargeError } from '../lib/pick-file';
import { nameOf, type TgMessage } from '../lib/telegram';
import {
  onTelegramChange,
  runTelegram,
  telegramCan,
  telegramChatWith,
  telegramDelete,
  telegramNow,
  telegramReact,
  telegramReactions,
  telegramSendFile,
  telegramSendInThread,
  telegramSendSticker,
  telegramSendStickerFile,
  telegramSendVoice,
  telegramShown,
  telegramThread,
  telegramVote,
  type TgSticker,
} from '../lib/telegram-store';
import { clearOld, telegramErevosSticker, telegramPickFile, telegramPickPhoto } from '../lib/telegram-out';
import { telegramLine } from '../lib/telegram-view';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';

// The replies to one message of a Telegram group (or the comments under a channel post, which live in
// the channel's discussion group), opened from a message's menu or its replies button in
// app/telegram-chat.tsx. It asks Telegram for the thread, shows its messages oldest first as the chat
// does (components/telegram-bubble.tsx), from its end, and asks again a moment after its chat has
// something new (not with every update of any chat, which would ask Telegram too often). Below is a
// field to write in the thread, as in the chat: Attach sends a photo, a picture from the camera, a file
// or a sticker, and with nothing written the microphone held records a voice message. A message held
// down opens its menu: answer it (quoted above the field), react to it, copy it, or delete it. Groups
// have no ErevosGram encryption, so nothing here asks about it. Opened from a hidden place's hidden
// chats (`hidden=1`) it is that place's own account's thread (lib/network-place.ts).

export default function TelegramThreadScreen() {
  const router = useRouter();
  const { id, message, hidden, kept: keptParam } = useLocalSearchParams<{ id?: string; message?: string; hidden?: string; kept?: string }>();
  // A chat of the space's account kept in the hidden chats (telegramHideChat) opens from there with `kept`.
  const keptHere = keptParam === '1';
  const where = useNetworkWhere(hidden === '1', keptHere);
  const chatId = Number(id);
  const messageId = Number(message);
  const [now, setNow] = useState(telegramNow(where));
  const [thread, setThread] = useState<{ chatId: number; threadId: number; messages: TgMessage[] } | null>(null);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [replyId, setReplyId] = useState<number | null>(null);
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [attach, setAttach] = useState(false);
  const [stickers, setStickers] = useState(false);
  const [erevosStickers, setErevosStickers] = useState(false);
  const [reacting, setReacting] = useState<{ id: number; emoji: string[] } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scroll = useRef<{ scrollToEnd: (options?: { animated?: boolean }) => void } | null>(null);
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const state = now.state;
  const ready = state?.auth.kind === 'ready';
  const fail = (error: unknown) => setNote(error instanceof Error ? error.message : String(error));

  function load() {
    telegramThread(chatId, messageId).then(setThread, fail);
  }

  useEffect(() => {
    runTelegram();
    setNow(telegramNow(where));
    return onTelegramChange(() => setNow(telegramNow(where)));
  }, [where]);

  // Asked again a moment after the thread's chat changes: a message in it, edited, gone, read.
  const at0 = thread?.chatId ?? chatId;
  const c0 = now.state?.chats[at0];
  // Any change to its chat's messages counts (lib/telegram.ts touched): a reply, an edit, a reaction.
  const changeKey = c0 ? `${now.state?.touched?.[at0] ?? 0}:${c0.last?.id ?? 0}` : '';
  const firstKey = useRef<string | null>(null);
  useEffect(() => {
    if (!changeKey || !thread) return;
    if (firstKey.current === null || firstKey.current === changeKey) {
      firstKey.current = changeKey;
      return;
    }
    firstKey.current = changeKey;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(load, 500);
  }, [changeKey, !!thread]);

  // The newest replies show, as in a chat: at the end when the thread opens and after we send. A new
  // reply moves to it only when the end is in sight already, so older replies being read stay.
  const toEnd = useRef(true);
  const nearEnd = useRef(true);
  const count = thread?.messages.length ?? 0;
  useEffect(() => {
    if (!count || !(toEnd.current || nearEnd.current)) return;
    toEnd.current = false;
    setTimeout(() => scroll.current?.scrollToEnd({ animated: false }), 50);
  }, [count]);

  useEffect(() => {
    if (!ready || !Number.isFinite(chatId) || !Number.isFinite(messageId)) return;
    load();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [ready, chatId, messageId]);

  // A voice message, sent in the thread as an answer to the message quoted, if any.
  const voice = useTelegramVoice({
    send: async (recorded) => {
      if (!thread || !(await telegramSendGate(thread.chatId, where))) return;
      const to = replyId ?? undefined;
      setReplyId(null);
      toEnd.current = true;
      await telegramSendVoice(thread.chatId, recorded, to, thread.threadId);
      load();
    },
    say: setNote,
  });

  if (!state || !ready) {
    return (
      <Page>
        <Text variant="title">Telegram</Text>
      </Page>
    );
  }

  const at = thread?.chatId ?? chatId;
  const chat = state.chats[at];
  const list = thread?.messages ?? [];
  const byId = new Map(list.map((m) => [m.id, m]));
  const writerOf = (m: TgMessage) => (m.outgoing ? t('You') : nameOf(state, m.sender) || chat?.title || '');
  const shownOf = (m: TgMessage) => telegramShown(at, m, where);
  const lineOf = (m: TgMessage) => telegramLine(m, shownOf(m)).trim().split('\n')[0] || t('Message');
  const answered = replyId ? byId.get(replyId) : undefined;
  const menuMessage = menuFor ? byId.get(menuFor) : undefined;
  const menuable = (m: TgMessage) => m.sending !== 'pending' && m.kind !== 'service';

  function send() {
    const text = draft.trim();
    if (!text || !thread) return;
    setDraft('');
    setNote('');
    const to = answered?.id;
    setReplyId(null);
    toEnd.current = true;
    const { chatId: inChat, threadId } = thread;
    // Said once before what this chat sends goes without Tor (components/telegram-ip.ts); not going on keeps the words.
    telegramSendGate(inChat, where)
      .then((go) => (go ? telegramSendInThread(inChat, threadId, text, to).then(load) : setDraft(text)))
      .catch((error: unknown) => {
        setDraft(text);
        fail(error);
      });
  }

  // A photo, a picture from the camera or a file, with the draft as its words if there are any.
  async function sendPicked(how: 'photos' | 'camera' | 'file') {
    setAttach(false);
    setNote('');
    if (!thread) return;
    try {
      clearOld();
      if (!(await telegramSendGate(thread.chatId, where))) return;
      const picked = how === 'file' ? await telegramPickFile() : await telegramPickPhoto(how);
      if (!picked) return;
      const caption = draft.trim();
      setDraft('');
      const to = answered?.id;
      setReplyId(null);
      toEnd.current = true;
      await telegramSendFile(thread.chatId, picked.path, picked.kind, caption, to, thread.threadId).catch((error: unknown) => {
        if (caption) setDraft(caption);
        throw error;
      });
      load();
    } catch (error) {
      if (error instanceof TooLargeError) setNote(t('That file is too large for Telegram.'));
      else fail(error);
    }
  }

  async function sendSticker(s: TgSticker) {
    setStickers(false);
    if (!thread || !(await telegramSendGate(thread.chatId, where).catch(() => false))) return;
    const to = answered?.id;
    setReplyId(null);
    toEnd.current = true;
    await telegramSendSticker(thread.chatId, s.file, s.emoji, to, thread.threadId).then(load, fail);
  }

  async function sendErevosSticker(name: string) {
    setErevosStickers(false);
    if (!thread) return;
    try {
      if (!(await telegramSendGate(thread.chatId, where))) return;
      const made = await telegramErevosSticker(name);
      const to = answered?.id;
      setReplyId(null);
      toEnd.current = true;
      await telegramSendStickerFile(thread.chatId, made.path, made.emoji, to, thread.threadId);
      load();
    } catch (error) {
      fail(error);
    }
  }

  async function startReact(m: TgMessage) {
    try {
      setReacting({ id: m.id, emoji: await telegramReactions(at, m.id) });
    } catch (error) {
      fail(error);
    }
  }

  const react = (id: number, emoji: string, mine: boolean, custom?: string) => void telegramReact(at, id, emoji, !mine, custom).then(load, fail);

  async function copy(text: string) {
    setNote((await copyText(text)) ? t('Copied. Any app that reads the clipboard can read it now.') : t('Not copied.'));
  }

  // Delete for me, or for everyone, as Telegram says it may be (in a supergroup, only for everyone).
  async function remove(m: TgMessage) {
    const can = await telegramCan(at, [m.id]).catch(() => ({ forMe: true, forAll: m.outgoing, thread: false, pin: false }));
    if (!can.forMe && !can.forAll) {
      setNote(t('You do not have the right to do this here.'));
      return;
    }
    const run = (revoke: boolean) =>
      telegramDelete(at, [m.id], revoke).then(load, (error: unknown) => setNote(t('Not deleted. {reason}', { reason: error instanceof Error ? error.message : String(error) })));
    const question = can.forMe && can.forAll ? t('Delete this message only for you, or for everyone in the chat? Deleting for everyone cannot be brought back.') : can.forAll ? t('Delete this message for everyone in the chat? It cannot be brought back.') : t('Delete this message for you? The others in the chat keep it.');
    ask(t('Delete message'), question, [
      { text: t('Cancel'), style: 'cancel' },
      ...(can.forMe ? [{ text: t('Delete for me'), style: 'destructive' as const, onPress: () => void run(false) }] : []),
      ...(can.forAll ? [{ text: can.forMe ? t('Delete for everyone') : t('Delete'), style: 'destructive' as const, onPress: () => void run(true) }] : []),
    ]);
  }

  function actionsOf(m: TgMessage): MenuAction[] {
    const actions: MenuAction[] = [{ title: t('Reply'), onPress: () => setReplyId(m.id) }];
    if (m.sending !== 'failed') actions.push({ title: t('React'), onPress: () => void startReact(m) });
    const words = m.kind === 'text' ? m.text : '';
    if (CAN_COPY && words) actions.push({ title: t('Copy'), onPress: () => void copy(words) });
    if (m.sending !== 'failed') actions.push({ title: t('Delete'), danger: true, onPress: () => void remove(m) });
    return actions;
  }

  async function openPerson(userId: number) {
    try {
      const target = await telegramChatWith(userId);
      router.push({ pathname: '/telegram-chat', params: { id: String(target), ...whereParams(where) } });
    } catch (error) {
      fail(error);
    }
  }

  const forwardNameOf = (m: TgMessage) => {
    const f = m.forward;
    if (!f) return '';
    return (f.user !== undefined ? nameOf(state!, f.user) : '') || (f.chat !== undefined ? state!.chats[f.chat]?.title : '') || f.name || '';
  };

  return (
    <KeyboardAwareScrollView
      ref={scroll as never}
      style={{ flex: 1, backgroundColor: colors.ground }}
      // As Page (components/ui.tsx) has it.
      contentContainerStyle={{ width: '100%', maxWidth: 760, alignSelf: 'center', padding: space.xl - 4, paddingBottom: insets.bottom + space.xl, gap: space.md }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={space.xl}
      onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        nearEnd.current = contentOffset.y + layoutMeasurement.height >= contentSize.height - 160;
      }}
      scrollEventThrottle={100}
    >
      <Text variant="title" numberOfLines={2}>
        {chat?.title ?? 'Telegram'}
      </Text>
      <View style={{ gap: space.md }}>
        {list.map((m) => (
          <Bubble
            key={m.id}
            message={m}
            shown={shownOf(m)}
            group
            writer={m.outgoing ? '' : writerOf(m)}
            read={false}
            answered={m.replyTo && m.replyTo !== thread?.threadId ? (byId.has(m.replyTo) ? { name: writerOf(byId.get(m.replyTo)!), line: lineOf(byId.get(m.replyTo)!) } : null) : undefined}
            forwardName={forwardNameOf(m)}
            fetch={(fileId) => fetchFile(fileId, where)}
            path={(fileId) => fetchPath(fileId, where)}
            onMenu={menuable(m) ? () => setMenuFor(m.id) : undefined}
            onReact={(emoji, mine, custom) => react(m.id, emoji, mine, custom)}
            onVote={(options) => telegramVote(at, m.id, options).then(load, fail)}
            onPerson={(userId) => void openPerson(userId)}
            onLink={(url) => void openTelegramLink(url, { router, where, say: setNote })}
          />
        ))}
      </View>
      {answered ? <Quote name={writerOf(answered)} line={lineOf(answered)} onClose={() => setReplyId(null)} /> : null}
      {attach ? (
        <Row wrap>
          <Button title={t('Photo')} kind="secondary" compact onPress={() => void sendPicked('photos')} />
          <Button title={t('Camera')} kind="secondary" compact onPress={() => void sendPicked('camera')} />
          <Button title={t('File')} kind="secondary" compact onPress={() => void sendPicked('file')} />
          <Button
            title={t('Sticker')}
            kind="secondary"
            compact
            onPress={() => {
              setAttach(false);
              setStickers(true);
            }}
          />
          <Button
            title={t('Erevos sticker')}
            kind="secondary"
            compact
            onPress={() => {
              setAttach(false);
              setErevosStickers(true);
            }}
          />
        </Row>
      ) : null}
      <Row>
        {voice.recording ? (
          <RecordingLine />
        ) : (
          <Input style={{ flex: 1 }} value={draft} onChangeText={setDraft} multiline placeholder={t('Message')} accessibilityLabel={t('Message')} />
        )}
        {!voice.recording ? <TextButton title={t('Attach')} onPress={() => setAttach((on) => !on)} /> : null}
        {!draft.trim() ? <MicButton voice={voice} /> : <Button title={t('Send')} compact disabled={!thread} onPress={send} />}
      </Row>
      {note ? <Text tone="muted">{note}</Text> : null}
      <MessageMenu visible={!!menuMessage && menuable(menuMessage)} onClose={() => setMenuFor(null)} line={menuMessage ? lineOf(menuMessage) : ''} actions={menuMessage ? actionsOf(menuMessage) : []} />
      <ReactSheet
        visible={reacting !== null}
        onClose={() => setReacting(null)}
        emoji={reacting?.emoji ?? []}
        ours={(reacting ? byId.get(reacting.id)?.reactions ?? [] : []).filter((r) => r.mine).map((r) => r.emoji)}
        onPick={(emoji, mine) => {
          const target = reacting?.id;
          setReacting(null);
          if (target !== undefined) react(target, emoji, mine);
        }}
      />
      <ErevosStickerSheet visible={erevosStickers} onClose={() => setErevosStickers(false)} onPick={(name) => void sendErevosSticker(name)} />
      <StickerSheet visible={stickers} onClose={() => setStickers(false)} path={(fileId) => fetchPath(fileId, where)} onPick={(sticker) => void sendSticker(sticker)} />
    </KeyboardAwareScrollView>
  );
}
