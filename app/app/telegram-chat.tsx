// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Pressable, ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatScreen } from '../components/chat-look';
import { CardSheet } from '../components/card-share';
import { ChatPinGate } from '../components/chat-pin-gate';
import { openTelegramLink } from '../components/telegram-link-open';
import { KeyboardAwareScrollView } from '../components/keyboard';
import { PlaceSheet } from '../components/place-sheet';
import { MessageMenu, type MenuAction } from '../components/message-menu';
import { Quote } from '../components/message-parts';
import { Bubble, fetchFile, fetchPath, hasFile, nameOfFile, TelegramPicture, typeOf } from '../components/telegram-bubble';
import { CAN_COLLECT, importFromPath } from '../lib/collection-import';
import { hiddenCollection, spaceCollection } from '../lib/collection-place';
import { useModules } from '../lib/modules';
import { ErevosStickerSheet, PollSheet, ReactSheet, StickerSheet } from '../components/telegram-sheets';
import { useTelegramVoice } from '../components/telegram-voice';
import { hiddenOnScreen, useNetworkChatShown } from '../components/network-chat-notify';
import { MicButton, RecordingLine } from '../components/matrix-voice';
import { useNetworkThread } from '../components/network-thread';
import { ComposerPanel, IconButton } from '../components/composer';
import { beforePanel, usePanelBack } from '../components/panel-close';
import { CloseIcon, OptionsIcon, PhoneIcon, PlusIcon, SearchIcon, VideoIcon } from '../components/icons';
import { NetworkChatNotify } from '../components/network-chat-notify';
import { SelectBar } from '../components/select-bar';
import { Button, Card, Chip, Input, OptionList, Page, Row, Sheet, Text, TextButton } from '../components/ui';
import { ask, confirm } from '../lib/alert';
import { callPermissions } from '../lib/call-permissions';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { plural, t } from '../lib/i18n';
import { laterLabel } from '../lib/later';
import { LaterPicker } from '../components/later-picker';
import { DayCalendar } from '../components/chat-media';
import { telegramCallGate, telegramSendGate } from '../components/telegram-ip';
import { dayKey } from '../lib/chat-media';
import { TelegramVideoView } from '../modules/erevos-telegram';
import { useNetworkWhere, whereParams, type NetworkWhere } from '../lib/network-place';
import { TooLargeError } from '../lib/pick-file';
import { useOpenHiddenPlace } from '../lib/hidden-contacts';
import { CAN_PLACE } from '../lib/place';
import type { Place } from '../lib/chat-parts';
import { contactContent, locationContent } from '../lib/telegram-shares';
import { chatList, nameOf, type TgMessage } from '../lib/telegram';
import type { TgCan, TgMediaKind, TgQuiz, TgSticker } from '../lib/telegram-store';
import type { SealInfo, Shown } from '../lib/telegram-seal';
import {
  onTelegramChange,
  runTelegram,
  telegramAccept,
  telegramAdsOn,
  telegramCall,
  telegramCan,
  telegramCanCall,
  telegramCloseChat,
  telegramDecline,
  telegramDelete,
  telegramDownload,
  telegramEdit,
  telegramChatWith,
  telegramClosePoll,
  telegramForward,
  telegramPinMessage,
  telegramPinned,
  telegramReact,
  telegramReactions,
  telegramSendPoll,
  telegramSendSticker,
  telegramSendStickerFile,
  telegramSendVoice,
  telegramVote,
  telegramInvite,
  telegramNow,
  telegramOlder,
  telegramChatPin,
  telegramOpenChat,
  telegramRead,
  telegramSetChatPin,
  telegramSetStar,
  telegramStars,
  telegramSearch,
  telegramSendFile,
  telegramSendContent,
  telegramSetDraft,
  telegramMessageAt,
  telegramResend,
  telegramShots,
  telegramSendLater,
  telegramLaterList,
  telegramSendNow,
  telegramSafetyNumber,
  telegramSeals,
  telegramSponsored,
  telegramSponsorClicked,
  telegramSponsorSeen,
  telegramSend,
  telegramSetChatNotify,
  telegramChatNotify,
  telegramShown,
  telegramVerified,
} from '../lib/telegram-store';
import type { TgSponsored } from '../lib/telegram-store';
import { clearOld, telegramErevosSticker, telegramFileOf, telegramPickFile, telegramPickPhoto } from '../lib/telegram-out';
import { useSharedFiles, useSharedWords } from '../lib/shared-here';
import { telegramLine, telegramStatusLine } from '../lib/telegram-view';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';
import { opensChat, RELOCK_MS } from '../lock/chat-pin';
import { ownSpaceKey } from '../lock/config';
import { keepPrivate } from '../lib/screen-privacy';
import { loadCurrentSpaceData } from '../lock/space-data';
import { useLock } from '../lock/context';
import { currentSpace } from '../lock/keys';

// One Telegram chat (lib/telegram-store.ts, the ErevosGram build only): its messages, oldest first,
// and a field to write in. Opening it tells TDLib it is on screen and loads the latest messages; older
// ones come as it is scrolled to its start. With Erevos on the screen its messages are marked read,
// which Telegram tells the other side. A message held down opens its menu: answer it, copy it, delete
// it for me or, where Telegram allows, for everyone. A photo, voice message, video or file is
// downloaded by Telegram only when asked for, then shown or saved (components/network-file.tsx).
//
// A private chat has the ErevosGram pill at its top (lib/telegram-seal.ts): Telegram can read the
// chat until both sides use the encryption, which one invites to and the other accepts; once it is
// on, its safety number can be compared with theirs and marked verified, and a change of their keys
// is warned of. Groups and channels have none. What the encryption carries is shown as text; a packet
// of it never shows as its own letters. Opened from a hidden place's hidden chats (`hidden=1`) it is
// that place's own account's chat (lib/network-place.ts).
//
// The name under the title is the other person's last seen; tapping the title opens the chat's info
// (app/telegram-info.tsx). Next to Send, Attach sends a photo, a picture from the camera or a file;
// the encryption covers only text, so with it on the screen asks first. A message of ours can be
// edited (its words go back into the field), and any ordinary message can be forwarded to another
// chat. Search looks through the chat's messages at Telegram, and a message found is gone to in the thread.
//
// With nothing written, the microphone next to Send records a voice message while it is held (sliding
// left lets it go); like a file it is not covered by the encryption. A message's menu can also react
// to it, answer it in its thread (app/telegram-thread.tsx), pin it (a pinned message shows in a bar at
// the top that goes to it; with several, each tap goes to one and the bar moves on to the one before), choose it with others to copy, forward or delete together, and close a poll
// of ours. Attach sends a sticker from the account's packs, or, in a group or channel, a poll. Under a
// bubble are its reactions, to tap for ours; a poll is voted in; a place opens the phone's map, and a
// contact card can be written to. Messages are drawn by components/telegram-bubble.tsx.

// How many pages of older messages (50 each) a found message is looked for in, before it is too far back.
const FOUND_PAGES = 20;

// What was typed and left in a chat with ErevosGram encryption, which Telegram must not keep: on this phone, while Erevos runs.
const sealedDrafts = new Map<string, string>();

// The days Go to a day offers: any from Telegram's first, August 2013, to today, as which ones a
// chat has is not known before one is asked for. Made as it first opens on a day.
const EMPTY_DAYS = new Set<string>();
let telegramDays: { today: string; days: Set<string> } | null = null;
function daysToToday(): Set<string> {
  const today = dayKey(Date.now());
  if (telegramDays?.today === today) return telegramDays.days;
  const days = new Set<string>();
  for (let at = new Date(2013, 7, 1).getTime(); dayKey(at) <= today; at += 86_400_000) days.add(dayKey(at));
  days.add(today);
  telegramDays = { today, days };
  return days;
}

const menuable = (m: TgMessage) => m.sending !== 'pending' && m.kind !== 'service';

/** A Telegram chat's screen, in the space's look (components/chat-look.tsx). */
export default function TelegramChatScreen() {
  return (
    <ChatScreen chat={null} header>
      <TelegramChat />
    </ChatScreen>
  );
}

function TelegramChat() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id, hidden, kept: keptParam, at } = useLocalSearchParams<{ id?: string; hidden?: string; kept?: string; at?: string }>();
  // A chat of the space's account kept in the hidden chats (telegramHideChat) opens from there with `kept`.
  const keptHere = keptParam === '1';
  const where = useNetworkWhere(hidden === '1', keptHere);
  const router = useRouter();
  const chatId = Number(id);
  const [now, setNow] = useState(telegramNow(where));
  const [tick, setTick] = useState(0);
  // What Send to handed this chat (app/share.tsx): its words in the message field, a photo or file sent once it shows.
  const sharedTo = hidden !== '1' && !keptHere && Number.isFinite(chatId) ? `telegram:${chatId}` : null;
  const sharedWords = useSharedWords(sharedTo);
  const [draft, setDraft] = useState(sharedWords);
  // The latest of what is typed, and whether it is an edit, for the draft left as the chat closes.
  const typed = useRef('');
  typed.current = draft;
  const editing = useRef(false);
  const [note, setNote] = useState('');
  const [replyId, setReplyId] = useState<number | null>(null);
  const [menuFor, setMenuFor] = useState<number | null>(null);
  // What Telegram lets this account do with the message whose menu is open (telegramCan).
  const [menuCan, setMenuCan] = useState<{ id: number; can: TgCan } | null>(null);
  const [seal, setSeal] = useState<SealInfo | null>(null);
  const sealedNow = useRef(false);
  sealedNow.current = !!seal?.sealed;
  useSharedFiles(
    now.state?.auth.kind === 'ready' && now.state.chats[chatId] ? sharedTo : null,
    async (file) => {
      // As a file picked here: Telegram can read it, even in a chat with ErevosGram encryption.
      if (sealedNow.current && !(await confirm(t('Send a file'), t('ErevosGram encryption covers only text. Telegram can read photos and files sent here. Send anyway?'), t('Send')))) return;
      if (!(await telegramSendGate(chatId, where))) return;
      const out = telegramFileOf(file);
      await telegramSendFile(chatId, out.path, out.kind);
    },
    (error) => setNote(error instanceof Error ? error.message : String(error)),
    () => undefined,
  );
  const [number, setNumber] = useState<string | null>(null);
  const [showNumber, setShowNumber] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ad, setAd] = useState<TgSponsored | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  editing.current = editId !== null;
  const [attach, setAttach] = useState(false);
  usePanelBack(attach, () => setAttach(false));
  const [more, setMore] = useState(false);
  const [forwardIds, setForwardIds] = useState<number[] | null>(null);
  const [selecting, setSelecting] = useState<number[] | null>(null);
  const [pinnedList, setPinnedList] = useState<TgMessage[]>([]);
  const [pinAt, setPinAt] = useState(0);
  const [reacting, setReacting] = useState<{ id: number; emoji: string[] } | null>(null);
  const [pollForm, setPollForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [carding, setCarding] = useState(false);
  const [choosingLater, setChoosingLater] = useState(false);
  const [laterOpen, setLaterOpen] = useState(false);
  const [dayPicking, setDayPicking] = useState(false);
  // Whether this space makes link previews (Settings): Telegram then makes one of the first link sent.
  const [previews, setPreviews] = useState(false);
  useEffect(() => {
    if (where !== 'space') return;
    loadCurrentSpaceData().then((data) => setPreviews(data.previews), () => setPreviews(false));
  }, [where]);
  const hiddenOpen = useOpenHiddenPlace();
  const modules = useModules();
  const [stickers, setStickers] = useState(false);
  const [erevosStickers, setErevosStickers] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<TgMessage[] | null>(null);
  // The kind of message Search shows (its Media, links and files), or words only.
  const [kind, setKind] = useState<TgMediaKind | null>(null);
  const older = useRef({ loading: false, done: false });

  useEffect(() => {
    runTelegram();
    setNow(telegramNow(where));
    return onTelegramChange(() => {
      setNow(telegramNow(where));
      setTick((n) => n + 1);
    });
  }, [where]);

  const state = now.state;
  const ready = state?.auth.kind === 'ready';
  const chat = state?.chats[chatId];
  const messages = state?.messages[chatId] ?? [];
  const waiting = state?.later?.[chatId] ?? [];
  // Which messages here are pinned: the pinned bar is asked for again when this changes.
  const pinKey = messages.filter((m) => m.pinned).map((m) => m.id).join();
  const isPrivate = chat?.type === 'private';
  const fail = (error: unknown) => setNote(error instanceof Error ? error.message : String(error));

  // A chat locked with a PIN of its own (lock/chat-pin.ts, Telegram info → Lock with a PIN) shows
  // only once its PIN is typed, until it closes or Erevos was away more than RELOCK_MS, as an Erevos
  // chat does. Meanwhile nothing of it shows, and nothing is read or told to Telegram as seen.
  const lock = useLock();
  const kept = telegramChatPin(chatId, where);
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    let away = 0;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background') away = Date.now();
      else if (next === 'active' && away) {
        if (Date.now() - away > RELOCK_MS) setUnlocked(false);
        away = 0;
      }
    });
    return () => subscription.remove();
  }, []);
  const gated = !!kept && !unlocked;
  // As an Erevos chat: one opened with its PIN, one among hidden chats, and one set to Block
  // screenshots (Telegram info) keep out of screenshots and the recent apps preview while open.
  const pinOpen = !!kept && unlocked;
  useEffect(() => {
    if (!pinOpen) return;
    keepPrivate('chat', true);
    return () => keepPrivate('chat', false);
  }, [pinOpen]);
  const inHidden = where === 'place' || keptHere;
  useEffect(() => {
    if (!inHidden) return;
    keepPrivate('hidden', true);
    return () => keepPrivate('hidden', false);
  }, [inHidden]);
  const noShots = telegramShots(chatId, where);
  useEffect(() => {
    if (!noShots) return;
    keepPrivate('shots', true);
    return () => keepPrivate('shots', false);
  }, [noShots]);
  // The messages starred here, on this phone only (a message's menu → Star).
  const stars = telegramStars(chatId, where);

  // On screen for TDLib while this chat shows, and its first messages loaded.
  useEffect(() => {
    if (!ready || !Number.isFinite(chatId) || gated) return;
    older.current = { loading: false, done: false };
    // Copies of files sent a day ago or more are not needed by TDLib any more (lib/telegram-out.ts).
    clearOld();
    // What was typed and left here comes back: Telegram's draft, or this phone's in an encrypted chat.
    const draftKey = `${where}:${chatId}`;
    const left = sealedDrafts.get(draftKey) ?? telegramNow(where).state?.chats[chatId]?.draft ?? '';
    if (left) setDraft((now) => now || left);
    telegramOpenChat(chatId).catch(fail);
    // What this chat has sent for later, which Telegram keeps until then.
    telegramLaterList(chatId).catch(() => undefined);
    return () => {
      const text = editing.current ? '' : typed.current;
      if (sealedNow.current) {
        if (text.trim()) sealedDrafts.set(draftKey, text);
        else sealedDrafts.delete(draftKey);
      } else {
        sealedDrafts.delete(draftKey);
        if (text !== (telegramNow(where).state?.chats[chatId]?.draft ?? '')) void telegramSetDraft(chatId, text, where).catch(() => undefined);
      }
      void telegramCloseChat(chatId);
    };
  }, [ready, chatId, gated]);

  // The ad Telegram has for a channel, when ads are on: asked for as the channel opens, told as seen once.
  const isChannel = chat?.type === 'channel';
  const adsOn = telegramAdsOn(where);
  useEffect(() => {
    setAd(null);
    if (!ready || !isChannel || !adsOn || gated) return;
    let alive = true;
    telegramSponsored(chatId).then(
      (found) => {
        if (!alive || !found) return;
        setAd(found);
        void telegramSponsorSeen(chatId, found.id);
      },
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [ready, isChannel, adsOn, chatId]);

  // Where the encryption stands, asked again as anything changes.
  useEffect(() => {
    if (!ready || !isPrivate) return;
    let alive = true;
    telegramSeals().then(
      (all) => alive && setSeal(all.get(chatId) ?? { state: 'NONE', verified: false, keysChanged: false, sealed: false }),
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [ready, isPrivate, chatId, tick]);

  // The messages pinned in the chat, newest first, asked again a moment after one is pinned or unpinned.
  useEffect(() => {
    if (!ready || !Number.isFinite(chatId)) return;
    let alive = true;
    const timer = setTimeout(() => {
      telegramPinned(chatId).then(
        (found) => {
          if (!alive) return;
          setPinnedList(found);
          setPinAt(0);
        },
        () => undefined,
      );
    }, 400);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // Asked again only when a message here is pinned or unpinned, not with every update.
  }, [ready, chatId, pinKey]);

  // What may be done with the message held, asked as its menu opens; the menu shows once it is known.
  useEffect(() => {
    if (menuFor === null || !ready) return;
    let alive = true;
    const id = menuFor;
    telegramCan(chatId, [id]).then(
      (can) => alive && setMenuCan({ id, can }),
      // Not known (the message just went, or Telegram did not say): the menu offers what is usual.
      () => alive && setMenuCan({ id, can: { forMe: true, forAll: true, thread: true, pin: true } }),
    );
    return () => {
      alive = false;
    };
  }, [menuFor, ready, chatId]);

  // The safety number, when it is asked for and the encryption is on.
  useEffect(() => {
    if (!showNumber || seal?.state !== 'ACTIVE') return;
    let alive = true;
    telegramSafetyNumber(chatId).then(
      (n) => alive && setNumber(n),
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [showNumber, seal?.state, seal?.keysChanged, chatId]);

  // Who writes now falls away by itself.
  const writing = Object.entries(state?.typing[chatId] ?? {}).filter(([, until]) => until > Date.now());
  useEffect(() => {
    if (writing.length === 0) return;
    const timer = setTimeout(() => setTick((n) => n + 1), 6200);
    return () => clearTimeout(timer);
  }, [writing.length, tick]);

  const { scroll, scrollProps, threadProps, endProps, place, goTo, withArrows } = useNetworkThread({
    list: messages,
    idOf: (m) => String(m.id),
    mine: (m) => m.outgoing,
    unread: chat?.unread ?? 0,
    held: () => older.current.loading,
  });

  // Older messages, as the thread is scrolled to its start (or asked for).
  async function loadOlder() {
    if (!ready || older.current.loading || older.current.done) return;
    older.current.loading = true;
    try {
      if ((await telegramOlder(chatId)) === 0) older.current.done = true;
    } catch (error) {
      fail(error);
    } finally {
      older.current.loading = false;
    }
  }

  // A voice message: the microphone held records, and letting go sends. With ErevosGram encryption on
  // the owner is asked first, as for a file, as Telegram can read the sound.
  const voice = useTelegramVoice({
    send: async (recorded) => {
      if (seal?.sealed && !(await confirm(t('Send a file'), t('ErevosGram encryption covers only text. Telegram can read photos and files sent here. Send anyway?'), t('Send')))) return;
      if (!(await telegramSendGate(chatId, where))) return;
      const to = replyId ?? undefined;
      setReplyId(null);
      await telegramSendVoice(chatId, recorded, to);
    },
    say: setNote,
  });

  const shown = useNetworkChatShown(where === 'space' && !keptHere ? `telegram:${chatId}` : hiddenOnScreen());
  // What came and is not read yet is marked read while the chat shows, which Telegram tells them.
  const unreadIds = chat ? messages.filter((m) => !m.outgoing && m.id > chat.readInbox).map((m) => m.id) : [];
  useEffect(() => {
    if (shown && ready && !gated && unreadIds.length) telegramRead(chatId, unreadIds).catch(() => undefined);
  }, [shown, ready, gated, chatId, unreadIds.join()]);

  if (!state || !ready || !chat) {
    return (
      <Page>
        <Text variant="title">Telegram</Text>
        <Text tone="muted">{now.loaded ? t('This Telegram chat is not here any more.') : ''}</Text>
      </Page>
    );
  }

  const shownOf = (m: TgMessage): Shown | null => telegramShown(chatId, m, where);
  const lineOf = (m: TgMessage) => telegramLine(m, shownOf(m)).trim().split('\n')[0] || t('Message');
  const byId = new Map(messages.map((m) => [m.id, m]));
  const answered = replyId ? byId.get(replyId) : undefined;
  const menuMessage = menuFor ? byId.get(menuFor) : undefined;
  const writerOf = (m: TgMessage) => (m.outgoing ? t('You') : nameOf(state, m.sender) || chat.title);
  const group = chat.type === 'group' || chat.type === 'channel';
  const channel = chat.type === 'channel';

  function submit() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setNote('');
    if (editId !== null) {
      const target = editId;
      setEditId(null);
      telegramEdit(chatId, target, text).catch((error: unknown) => {
        setDraft(text);
        setEditId(target);
        fail(error);
      });
      return;
    }
    const to = answered?.id;
    setReplyId(null);
    // Said once before what this chat sends goes without Tor (components/telegram-ip.ts); not going on keeps the words.
    telegramSendGate(chatId, where)
      .then((go) => (go ? telegramSend(chatId, text, to, previews) : setDraft(text)))
      .catch((error: unknown) => {
        setDraft(text);
        fail(error);
      });
  }

  async function copy(text: string) {
    setNote((await copyText(text)) ? t('Copied. Any app that reads the clipboard can read it now.') : t('Not copied.'));
  }

  // Delete for me, or for everyone, as Telegram says each may be: in a supergroup or channel a
  // message goes for everyone or not at all, and another's only with the right.
  async function remove(list: TgMessage[]) {
    const ids = list.map((m) => m.id);
    const can = await telegramCan(chatId, ids).catch(() => ({ forMe: true, forAll: list.every((m) => m.outgoing) || isPrivate, thread: false, pin: false }));
    if (!can.forMe && !can.forAll) {
      setNote(t('You do not have the right to do this here.'));
      return;
    }
    const run = (revoke: boolean) =>
      telegramDelete(chatId, ids, revoke).then(
        () => setSelecting(null),
        (error: unknown) => setNote(t('Not deleted. {reason}', { reason: error instanceof Error ? error.message : String(error) })),
      );
    const question = can.forMe && can.forAll ? t('Delete this message only for you, or for everyone in the chat? Deleting for everyone cannot be brought back.') : can.forAll ? t('Delete this message for everyone in the chat? It cannot be brought back.') : t('Delete this message for you? The others in the chat keep it.');
    ask(t('Delete message'), question, [
      { text: t('Cancel'), style: 'cancel' },
      ...(can.forMe ? [{ text: t('Delete for me'), style: 'destructive' as const, onPress: () => void run(false) }] : []),
      ...(can.forAll ? [{ text: can.forMe ? t('Delete for everyone') : t('Delete'), style: 'destructive' as const, onPress: () => void run(true) }] : []),
    ]);
  }

  // A photo, a picture from the camera or a file, sent with the draft as its words if there are any.
  // The ErevosGram encryption covers only text, so with it on the owner is asked first.
  // "+" opens and closes the panel under the field; open, the end of the chat comes into view.
  function openAttach(open: boolean) {
    if (open) beforePanel();
    setAttach(open);
    if (open) setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  }

  // A tile that opens a sheet of its own closes the panel first.
  function attachThen(open: (on: boolean) => void) {
    setAttach(false);
    open(true);
  }

  async function sendPicked(how: 'photos' | 'camera' | 'file', hidden = false) {
    setAttach(false);
    setNote('');
    try {
      if (seal?.sealed && !(await confirm(t('Send a file'), t('ErevosGram encryption covers only text. Telegram can read photos and files sent here. Send anyway?'), t('Send')))) return;
      if (!(await telegramSendGate(chatId, where))) return;
      const picked = how === 'file' ? await telegramPickFile() : await telegramPickPhoto(how);
      if (!picked) return;
      const caption = draft.trim();
      setDraft('');
      const to = answered?.id;
      setReplyId(null);
      setEditId(null);
      await telegramSendFile(chatId, picked.path, picked.kind, caption, to, undefined, hidden && picked.kind !== 'document').catch((error: unknown) => {
        if (caption) setDraft(caption);
        throw error;
      });
    } catch (error) {
      if (error instanceof TooLargeError) setNote(t('That file is too large for Telegram.'));
      else fail(error);
    }
  }

  async function search(of: TgMediaKind | null = kind) {
    const words = query.trim();
    if (!words && !of) return;
    try {
      setFound(await telegramSearch(chatId, words, of ?? undefined));
    } catch (error) {
      fail(error);
    }
  }

  // A message found: the thread goes to it. One further back than what is drawn has its older
  // messages asked for first, a page at a time, up to FOUND_PAGES of them.
  async function goFound(m: TgMessage) {
    closeSearch();
    const here = () => (telegramNow(where).state?.messages[chatId] ?? []).some((x) => x.id === m.id);
    for (let page = 0; page < FOUND_PAGES && !here() && !older.current.done; page++) await loadOlder();
    if (!here()) {
      setNote(t('That message is too far back to show here.'));
      return;
    }
    // Once it is drawn and placed.
    setTimeout(() => goTo(String(m.id)), 300);
  }

  // Opened at a message (Starred messages, `at`): it is looked for once the chat shows.
  const wentAt = useRef('');
  useEffect(() => {
    if (!at || !ready || gated || wentAt.current === at || !Number.isFinite(Number(at))) return;
    wentAt.current = at;
    void goFound({ id: Number(at) } as TgMessage);
  }, [at, ready, gated]);

  function closeSearch() {
    setSearching(false);
    setQuery('');
    setFound(null);
    setKind(null);
  }

  // Go to a day: the last message of that day, or else the first after it is not known, so the
  // last before it, which the thread then shows (goFound).
  async function goToDay(day: string) {
    setDayPicking(false);
    const [y, mo, d] = day.split('-').map(Number);
    const start = new Date(y, mo - 1, d).getTime() / 1000;
    const m = await telegramMessageAt(chatId, start + 86_399).catch(() => null);
    if (!m) {
      setNote(t('Nothing found.'));
      return;
    }
    if (m.date < start) setNote(t('Nothing on {day}: the last message before it.', { day: new Date(start * 1000).toLocaleDateString() }));
    await goFound(m);
  }

  function chooseKind(next: TgMediaKind | null) {
    setKind(next);
    setFound(null);
    if (next || query.trim()) void search(next);
  }

  function forwardTo(target: number) {
    const ids = forwardIds;
    setForwardIds(null);
    if (ids === null || ids.length === 0) return;
    telegramSendGate(target, where)
      .then(async (go) => {
        if (!go) return;
        await telegramForward(chatId, ids, target);
        setSelecting(null);
        setNote(t('Forwarded.'));
      })
      .catch((error: unknown) => fail(error));
  }

  const openThread = (messageId: number) => router.push({ pathname: '/telegram-thread', params: { id: String(chatId), message: String(messageId), ...whereParams(where, keptHere) } });

  // The emoji the chat allows on a message, to pick one from.
  async function startReact(m: TgMessage) {
    try {
      setReacting({ id: m.id, emoji: await telegramReactions(chatId, m.id) });
    } catch (error) {
      fail(error);
    }
  }

  const react = (id: number, emoji: string, mine: boolean, custom?: string) => telegramReact(chatId, id, emoji, !mine, custom).catch(fail);
  // The pinned bar shows one at a time: a tap goes to it, and the bar moves on to the one before it.
  const pinned = pinnedList.length ? pinnedList[pinAt % pinnedList.length] : null;
  function goPinned() {
    if (!pinned) return;
    setPinAt((n) => (n + 1) % pinnedList.length);
    void goFound(pinned);
  }

  // Pinned for everyone; in a private chat it is asked if the other side sees it too.
  function pin(m: TgMessage, on: boolean) {
    const go = (onlyForMe: boolean) => telegramPinMessage(chatId, m.id, on, onlyForMe).catch(fail);
    if (!on || !isPrivate) {
      void go(false);
      return;
    }
    ask(t('Pin'), t('Pin this message at the top of the chat?'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Only for me'), onPress: () => void go(true) },
      { text: t('Pin for both'), onPress: () => void go(false) },
    ]);
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

  function sendPoll(question: string, options: string[], anonymous: boolean, multiple: boolean, quiz?: TgQuiz) {
    setPollForm(false);
    telegramSendGate(chatId, where)
      .then((go) => (go ? telegramSendPoll(chatId, question, options, anonymous, multiple, quiz) : undefined))
      .catch(fail);
  }

  // A place or a contact card: the same question as for a file, as Telegram can read them too.
  async function sendShare(content: Record<string, unknown>) {
    try {
      if (seal?.sealed && !(await confirm(t('Send a file'), t('ErevosGram encryption covers only text. Telegram can read photos and files sent here. Send anyway?'), t('Send')))) return;
      if (!(await telegramSendGate(chatId, where))) return;
      const to = answered?.id;
      setReplyId(null);
      await telegramSendContent(chatId, content, to);
    } catch (error) {
      fail(error);
    }
  }

  // Text sent for later: Telegram keeps it and sends it then, so it goes with this phone off too.
  async function sendLater(at: number) {
    setChoosingLater(false);
    const text = draft.trim();
    if (!text) return;
    if (!(await telegramSendGate(chatId, where))) return;
    const to = answered?.id;
    setDraft('');
    setReplyId(null);
    try {
      await telegramSendLater(chatId, text, at, to, previews);
    } catch (error) {
      setDraft(text);
      fail(error);
    }
  }

  function sendPlace(place: Place) {
    setPlacing(false);
    void sendShare(locationContent(place));
  }

  function sendCard(card: string) {
    const content = contactContent(card);
    if (!content) {
      setNote(t('Telegram sends only a contact card with a phone number.'));
      return;
    }
    setCarding(false);
    void sendShare(content);
  }

  // The same question as for a file: Telegram can read a sticker, a voice message and a poll in an encrypted chat.
  async function sendSticker(s: TgSticker) {
    setStickers(false);
    try {
      if (seal?.sealed && !(await confirm(t('Send a file'), t('ErevosGram encryption covers only text. Telegram can read photos and files sent here. Send anyway?'), t('Send')))) return;
      if (!(await telegramSendGate(chatId, where))) return;
      const to = answered?.id;
      setReplyId(null);
      await telegramSendSticker(chatId, s.file, s.emoji, to);
    } catch (error) {
      fail(error);
    }
  }

  // One of Erevos's own stickers, as a still picture sticker; asked first as for a file.
  async function sendErevosSticker(name: string) {
    setErevosStickers(false);
    try {
      if (seal?.sealed && !(await confirm(t('Send a file'), t('ErevosGram encryption covers only text. Telegram can read photos and files sent here. Send anyway?'), t('Send')))) return;
      if (!(await telegramSendGate(chatId, where))) return;
      const made = await telegramErevosSticker(name);
      const to = answered?.id;
      setReplyId(null);
      await telegramSendStickerFile(chatId, made.path, made.emoji, to);
    } catch (error) {
      fail(error);
    }
  }

  const chosen = selecting ? messages.filter((m) => selecting.includes(m.id)) : [];
  function copyChosen() {
    const words = chosen.filter((m) => m.kind === 'text' && shownOf(m) === null).map((m) => m.text).join('\n');
    if (words) void copy(words);
    setSelecting(null);
  }
  function forwardChosen() {
    const plain = chosen.filter((m) => shownOf(m) === null && m.sending !== 'failed');
    if (plain.length < chosen.length) setNote(t('Encrypted messages cannot be forwarded, so they were left out.'));
    if (plain.length) setForwardIds(plain.map((m) => m.id));
  }

  function actionsOf(m: TgMessage): MenuAction[] {
    const actions: MenuAction[] = [{ title: t('Reply'), onPress: () => setReplyId(m.id) }];
    const s = shownOf(m);
    // Not in a chat with encryption: the new words would go readable (telegramEdit refuses it).
    if (m.outgoing && m.kind === 'text' && s === null && m.sending !== 'failed' && !seal?.sealed) {
      actions.push({
        title: t('Edit'),
        onPress: () => {
          setReplyId(null);
          setEditId(m.id);
          setDraft(m.text);
        },
      });
    }
    if (s === null && m.sending !== 'failed') actions.push({ title: t('Forward'), onPress: () => setForwardIds([m.id]) });
    if (m.sending !== 'failed') actions.push({ title: t('React'), onPress: () => void startReact(m) });
    const can = menuCan?.id === m.id ? menuCan.can : null;
    if (group && m.sending !== 'failed' && can?.thread) actions.push({ title: t('Reply in thread'), onPress: () => openThread(m.id) });
    if (m.sending !== 'failed' && can?.pin !== false) {
      const isPinned = m.pinned || pinnedList.some((p) => p.id === m.id);
      actions.push({ title: isPinned ? t('Unpin') : t('Pin'), onPress: () => pin(m, !isPinned) });
    }
    if (m.poll && m.outgoing && !m.poll.closed) actions.push({ title: t('Close poll'), onPress: () => run(() => telegramClosePoll(chatId, m.id)) });
    if (m.sending !== 'failed') {
      const starred = stars.has(m.id);
      actions.push({ title: starred ? t('Unstar') : t('Star'), onPress: () => run(() => telegramSetStar(chatId, m.id, !starred)) });
    }
    // A photo, video or file goes into the Collection, encrypted there: the space's, or the open hidden chats' for one among them.
    const inHiddenNow = where === 'place' || keptHere;
    if (m.sending !== 'failed' && m.file !== undefined && hasFile(m) && CAN_COLLECT && modules.has('collection') && (!inHiddenNow || hiddenOpen)) {
      const fileId = m.file;
      actions.push({ title: t('Save to the Collection'), onPress: () => void collect(m, fileId) });
    }
    actions.push({ title: t('Select'), onPress: () => setSelecting([m.id]) });
    const words = s ? (s.kind === 'text' ? s.text : '') : m.kind === 'text' ? m.text : '';
    if (CAN_COPY && words) actions.push({ title: t('Copy'), onPress: () => void copy(words) });
    if (m.sending === 'failed') {
      // One Telegram could not send: again, or away; it was never anyone's but this account's.
      actions.unshift({ title: t('Send again'), onPress: () => run(async () => (await telegramSendGate(chatId, where)) && telegramResend(chatId, [m.id])) });
      actions.push({ title: t('Delete'), danger: true, onPress: () => run(() => telegramDelete(chatId, [m.id], false)) });
    } else if (!can || can.forMe || can.forAll) actions.push({ title: t('Delete'), danger: true, onPress: () => void remove([m]) });
    return actions;
  }

  async function collect(m: TgMessage, fileId: number) {
    try {
      const place = where === 'place' || keptHere ? (hiddenOpen ? hiddenCollection(hiddenOpen) : null) : spaceCollection();
      if (!place) return;
      setNote(t('Fetching…'));
      await importFromPath(place, await fetchPath(fileId, where), nameOfFile(m), typeOf(m));
      setNote(t('Saved to the Collection.'));
    } catch (error) {
      setNote(t('Not added. {error}', { error: error instanceof Error ? error.message : String(error) }));
    }
  }

  function run(work: () => Promise<unknown>) {
    setBusy(true);
    setNote('');
    work()
      .catch(fail)
      .finally(() => setBusy(false));
  }

  // A voice call to the other person of a private chat, once the microphone is allowed.
  const callTo = isPrivate && chat.userId !== undefined && telegramCanCall() ? chat.userId : undefined;
  // A video call asks for the camera too, and starts with it on.
  async function startCall(userId: number, video = false) {
    if (!(await telegramCallGate(userId, where))) return;
    if (!(await callPermissions(video))) throw new Error(video ? t('Allow the microphone and the camera for a video call.') : t('Allow the microphone to call.'));
    await telegramCall(userId, where, video);
  }

  const pill = !isPrivate || !seal ? null : (
    <Pill seal={seal} busy={busy} number={number} showNumber={showNumber} onToggle={() => setShowNumber((on) => !on)} chatId={chatId} run={run} />
  );

  const status = isPrivate && chat.userId !== undefined && writing.length === 0 ? telegramStatusLine(state.users[chat.userId]) : '';
  const typing = writing.map(([who]) => nameOf(state, Number(who))).filter(Boolean);
  if (gated && kept) {
    return (
      <View style={{ flex: 1 }}>
        <ChatPinGate
          name={chat.title}
          active={shown}
          open={async (pin) => {
            if (!(await opensChat(pin, kept))) return false;
            setUnlocked(true);
            return true;
          }}
          forgot={
            lock.passwordLock
              ? async (password) => {
                  if (!(await ownSpaceKey(currentSpace().space, password))) return false;
                  await telegramSetChatPin(chatId, null);
                  setUnlocked(true);
                  setNote(t('The PIN of {name} is off.', { name: chat.title }));
                  return true;
                }
              : undefined
          }
          onBack={() => router.back()}
        />
      </View>
    );
  }

  return withArrows(
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      {/* The name, last seen and buttons stay at the top while the messages scroll under them. */}
      <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: space.xl - 4, paddingVertical: space.sm, gap: space.sm }}>
        <Row>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/telegram-info', params: { id: String(chatId), ...whereParams(where, keptHere) } })}
            accessibilityRole="button"
            accessibilityLabel={chat.title}
            accessibilityHint={t('Opens the chat info')}
          >
            <Text variant="title" numberOfLines={2}>
              {chat.title}
            </Text>
            {status ? (
              <Text variant="caption" tone="muted">
                {status}
              </Text>
            ) : null}
          </Pressable>
          {/* Signs, each named for those who cannot see it, so the name and last seen keep their room on a small phone. */}
          <IconButton label={t('Search')} state={{ expanded: searching }} onPress={() => (searching ? closeSearch() : setSearching(true))}>
            <SearchIcon color={colors.text} size={22} />
          </IconButton>
          {callTo !== undefined ? (
            <IconButton label={t('Call')} disabled={busy} onPress={() => run(() => startCall(callTo))}>
              <PhoneIcon color={colors.primary} size={22} />
            </IconButton>
          ) : null}
          {callTo !== undefined && TelegramVideoView ? (
            <IconButton label={t('Video call')} disabled={busy} onPress={() => run(() => startCall(callTo, true))}>
              <VideoIcon color={colors.primary} size={22} />
            </IconButton>
          ) : null}
        </Row>
        {searching ? (
          <Card>
            <Input
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => void search()}
              returnKeyType="search"
              autoFocus
              autoCorrect={false}
              placeholder={t('Search')}
              accessibilityLabel={t('Search')}
            />
            <TextButton title={t('Go to a day')} onPress={() => setDayPicking(true)} />
            <Text variant="caption" tone="muted">
              {t('Media, links and files')}
            </Text>
            <Row wrap>
              {(
                [
                  ['photo', t('Photos')],
                  ['video', t('Videos')],
                  ['voice', t('Voice messages')],
                  ['document', t('Files')],
                  ['link', t('Links')],
                ] as const
              ).map(([k, label]) => (
                <Chip key={k} label={label} selected={kind === k} onPress={() => chooseKind(kind === k ? null : k)} />
              ))}
            </Row>
            {found && found.length === 0 ? <Text tone="muted">{t('Nothing found.')}</Text> : null}
            {kind === 'photo' || kind === 'video' ? (
              <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {(found ?? []).map((m) => (
                  <Pressable key={m.id} onPress={() => void goFound(m)} accessibilityRole="button" accessibilityLabel={telegramLine(m, shownOf(m))}>
                    <TelegramPicture fileId={kind === 'video' ? m.thumb : m.thumb ?? m.file} path={(fileId) => fetchPath(fileId, where)} size={96} fallback={kind === 'video' ? '▶' : '🖼'} />
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
            <ScrollView style={{ maxHeight: 280, display: kind === 'photo' || kind === 'video' ? 'none' : 'flex' }} keyboardShouldPersistTaps="handled">
              {(found ?? []).map((m) => (
                <Pressable key={m.id} onPress={() => void goFound(m)} accessibilityRole="button" style={{ gap: 2, paddingVertical: space.xs }}>
                  <Text variant="caption" tone="faint">
                    {new Date(m.date * 1000).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text numberOfLines={2}>{telegramLine(m, shownOf(m))}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Card>
        ) : null}
      </View>
      <KeyboardAwareScrollView
        ref={scroll}
        style={{ flex: 1, backgroundColor: colors.ground }}
        // As Page (components/ui.tsx) has it.
        contentContainerStyle={{ flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: space.xl - 4, paddingTop: space.xs, paddingBottom: insets.bottom + space.xl, gap: space.md }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={space.xl}
        {...scrollProps}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          scrollProps.onScroll(event);
          if (event.nativeEvent.contentOffset.y < 40) void loadOlder();
        }}
      >
        {ad ? (
          <Card>
            <Row>
              <Text variant="caption" tone="faint" style={{ flex: 1 }}>
                {t('Ad')}
              </Text>
              <TextButton title="✕" onPress={() => setAd(null)} />
            </Row>
            <Text variant="bodyStrong">{ad.title}</Text>
            <Text tone="muted" numberOfLines={4}>
              {ad.text}
            </Text>
            {ad.url ? (
              <Button
                title={ad.button || ad.url}
                kind="secondary"
                compact
                onPress={() => {
                  void telegramSponsorClicked(chatId, ad.id);
                  void Linking.openURL(ad.url).catch(() => undefined);
                }}
              />
            ) : null}
          </Card>
        ) : null}
        {pill}
        {pinned ? (
          <Pressable onPress={goPinned} accessibilityRole="button" accessibilityHint={t('Goes to the pinned message')}>
            <Card>
              <Text numberOfLines={1}>{`📌 ${pinnedList.length > 1 ? `${(pinAt % pinnedList.length) + 1}/${pinnedList.length} ` : ''}${lineOf(pinned)}`}</Text>
            </Card>
          </Pressable>
        ) : null}
        {group ? (
          <Text variant="caption" tone="muted">
            {channel ? t('Telegram channel · Telegram can read it') : t('Telegram group · Telegram can read it')}
          </Text>
        ) : null}
        {messages.length > 0 && !older.current.done ? <TextButton title={t('Older messages')} onPress={() => void loadOlder()} /> : null}

        <View style={{ gap: space.md }} {...threadProps}>
          {messages.map((m) => (
            <Bubble
              key={m.id}
              message={m}
              starred={stars.has(m.id)}
              shown={shownOf(m)}
              group={group}
              writer={group && !m.outgoing ? writerOf(m) : ''}
              read={m.outgoing && m.id <= chat.readOutbox}
              answered={m.replyTo ? (byId.has(m.replyTo) ? { name: writerOf(byId.get(m.replyTo)!), line: lineOf(byId.get(m.replyTo)!) } : null) : undefined}
              forwardName={forwardNameOf(m)}
              selecting={selecting !== null}
              selected={!!selecting?.includes(m.id)}
              fetch={(fileId) => fetchFile(fileId, where)}
              path={(fileId) => fetchPath(fileId, where)}
              onMenu={menuable(m) ? () => setMenuFor(m.id) : undefined}
              onSelect={() => setSelecting((now) => (now === null ? now : now.includes(m.id) ? now.filter((x) => x !== m.id) : [...now, m.id]))}
              onReact={(emoji, mine, custom) => void react(m.id, emoji, mine, custom)}
              onVote={(options) => telegramVote(chatId, m.id, options).catch(fail)}
              onThread={() => openThread(m.id)}
              onPerson={(userId) => void openPerson(userId)}
              onLink={(url) => void openTelegramLink(url, { router, where, here: chatId, goTo: (id) => void goFound({ id } as TgMessage), say: setNote })}
              onLayout={place(String(m.id))}
            />
          ))}
        </View>
        {typing.length ? (
          <Text variant="caption" tone="muted">
            {typing.join(', ')} · {t('typing…')}
          </Text>
        ) : null}

        {/* A short chat keeps the field at the bottom of the screen, not under its last message (#61). */}
        <View style={{ flexGrow: 1, marginTop: -space.md }} />
        {answered ? <Quote name={writerOf(answered)} line={lineOf(answered)} onClose={() => setReplyId(null)} /> : null}
        {editId !== null ? (
          <Row>
            <Text variant="caption" tone="muted" style={{ flex: 1 }}>
              {t('Editing')}
            </Text>
            <TextButton
              title="✕"
              onPress={() => {
                setEditId(null);
                setDraft('');
              }}
            />
          </Row>
        ) : null}
        {waiting.length > 0 && selecting === null ? (
          <TextButton title={plural(waiting.length, '{n} message goes later', '{n} messages go later')} onPress={() => setLaterOpen(true)} />
        ) : null}
        {selecting !== null ? (
          <View {...endProps}>
            <SelectBar
              count={selecting.length}
              onCancel={() => setSelecting(null)}
              onAll={() => setSelecting(messages.filter(menuable).map((m) => m.id))}
              onCopy={CAN_COPY && chosen.some((m) => m.kind === 'text' && shownOf(m) === null) ? copyChosen : undefined}
              onForward={chosen.length ? forwardChosen : undefined}
              onDelete={chosen.length ? () => remove(chosen) : undefined}
            />
          </View>
        ) : (
          <Row {...endProps}>
            {editId === null && !voice.recording ? (
              <IconButton label={attach ? t('Close') : t('Attach and more')} onPress={() => openAttach(!attach)} state={{ expanded: attach }}>
                {attach ? <CloseIcon color={colors.text} size={20} /> : <PlusIcon color={colors.text} size={20} />}
              </IconButton>
            ) : null}
            {voice.recording ? (
              <RecordingLine />
            ) : (
              <Input
                style={{ flex: 1 }}
                value={draft}
                onFocus={() => setAttach(false)}
                onChangeText={setDraft}
                multiline
                placeholder={seal?.sealed ? t('Encrypted message') : t('Message')}
                accessibilityLabel={t('Message')}
              />
            )}
            {/* The chat's options, beside the field, where a long chat keeps them in reach (#54, as #44). */}
            <IconButton label={t('Chat options')} onPress={() => setMore(true)}>
              <OptionsIcon color={colors.text} size={22} />
            </IconButton>
            {!draft.trim() && editId === null ? <MicButton voice={voice} /> : <Button title={editId !== null ? t('Save') : t('Send')} compact disabled={!draft.trim()} onPress={submit} />}
          </Row>
        )}
        {/* What "+" opens under the field, as in Erevos's own chats (#59): tiles of what to send, then how it goes. */}
        {attach && selecting === null && editId === null ? (
          <ComposerPanel
            encrypted={chat.type === 'secret'}
            tiles={[
              { key: 'photo', title: t('Photo'), icon: 'photo', onPress: () => void sendPicked('photos') },
              { key: 'camera', title: t('Camera'), icon: 'camera', onPress: () => void sendPicked('camera') },
              { key: 'hidden', title: t('Hidden photo'), icon: 'photo', onPress: () => void sendPicked('photos', true) },
              { key: 'file', title: t('File'), icon: 'file', onPress: () => void sendPicked('file') },
              { key: 'sticker', title: t('Sticker'), icon: 'sticker', onPress: () => attachThen(setStickers) },
              { key: 'erevos-sticker', title: t('Erevos sticker'), icon: 'sticker', onPress: () => attachThen(setErevosStickers) },
              ...(CAN_PLACE ? [{ key: 'place', title: t('Location'), icon: 'place' as const, onPress: () => attachThen(setPlacing) }] : []),
              { key: 'contact', title: t('Contact card'), icon: 'contact', onPress: () => attachThen(setCarding) },
              ...(chat.type !== 'private' && chat.type !== 'secret' ? [{ key: 'poll', title: t('Poll'), icon: 'poll' as const, onPress: () => attachThen(setPollForm) }] : []),
            ]}
            ways={
              !seal?.sealed
                ? [
                    {
                      key: 'later',
                      title: t('Send later'),
                      // Always in view, so it is found; with nothing typed yet it says so (#59).
                      description: draft.trim() ? t('Goes at the time you choose') : t('Write the message first, then choose when it goes.'),
                      icon: 'later',
                      onPress: () => {
                        if (!draft.trim()) return;
                        setAttach(false);
                        setChoosingLater(true);
                      },
                    },
                  ]
                : []
            }
          />
        ) : null}
        {note || now.problem ? <Text tone="muted">{note || now.problem}</Text> : null}
        <MessageMenu
          visible={!!menuMessage && menuable(menuMessage) && shown && menuCan?.id === menuMessage.id}
          onClose={() => {
            setMenuFor(null);
            setMenuCan(null);
          }}
          line={menuMessage ? lineOf(menuMessage) : ''}
          actions={menuMessage ? actionsOf(menuMessage) : []}
        />
        <ReactSheet
          visible={reacting !== null}
          onClose={() => setReacting(null)}
          emoji={reacting?.emoji ?? []}
          ours={(reacting ? byId.get(reacting.id)?.reactions ?? [] : []).filter((r) => r.mine).map((r) => r.emoji)}
          onPick={(emoji, mine) => {
            const target = reacting?.id;
            setReacting(null);
            if (target !== undefined) void react(target, emoji, mine);
          }}
        />
        <Sheet visible={more} onClose={() => setMore(false)} title={t('Chat options')}>
          <View style={{ gap: space.md }}>
            <OptionList title={t('This chat')}>
              <NetworkChatNotify notify={telegramChatNotify(chatId, where)} hidden={where !== 'space' || keptHere} calls={isPrivate} onChange={(next) => telegramSetChatNotify(chatId, next, where)} />
              <Button
                title={t('Chat info')}
                kind="secondary"
                compact
                onPress={() => {
                  setMore(false);
                  router.push({ pathname: '/telegram-info', params: { id: String(chatId), ...whereParams(where, keptHere) } });
                }}
              />
            </OptionList>
            <OptionList title={t('Find')}>
              <Button
                title={t('Search')}
                kind="secondary"
                compact
                onPress={() => {
                  setMore(false);
                  setSearching(true);
                }}
              />
              <Button
                title={t('Go to a day')}
                kind="secondary"
                compact
                onPress={() => {
                  setMore(false);
                  setDayPicking(true);
                }}
              />
            </OptionList>
          </View>
        </Sheet>
        <PollSheet visible={pollForm} onClose={() => setPollForm(false)} onSend={sendPoll} />
        <DayCalendar visible={dayPicking} days={dayPicking ? daysToToday() : EMPTY_DAYS} start={messages[messages.length - 1]?.date ? messages[messages.length - 1].date * 1000 : Date.now()} onPick={(day) => void goToDay(day)} onClose={() => setDayPicking(false)} />
        <Sheet visible={choosingLater} onClose={() => setChoosingLater(false)} title={t('Send later')}>
          <LaterPicker onPick={(at) => void sendLater(at)} />
          <Text variant="caption" tone="muted">
            {t('Telegram keeps it and sends it at that time, even if this phone is off then.')}
          </Text>
        </Sheet>
        <Sheet visible={laterOpen && waiting.length > 0} onClose={() => setLaterOpen(false)} title={t('Send later')}>
          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: space.md }}>
            {waiting.map((m) => (
              <Card key={m.id}>
                <Text variant="caption" tone="muted">
                  {t('Goes on {when}.', { when: laterLabel((m.later ?? 0) * 1000) })}
                </Text>
                <Text numberOfLines={3}>{telegramLine(m)}</Text>
                <Row>
                  <TextButton title={t('Send now')} onPress={() => void telegramSendGate(chatId, where).then((go) => (go ? telegramSendNow(chatId, m.id) : undefined)).catch(fail)} />
                  <TextButton title={t('Delete')} onPress={() => void telegramDelete(chatId, [m.id], true).catch(fail)} />
                </Row>
              </Card>
            ))}
          </ScrollView>
        </Sheet>
        <PlaceSheet visible={placing} onClose={() => setPlacing(false)} onSend={sendPlace} said={t('{name} gets this place through Telegram, which can read it. Erevos does not follow where you go after.', { name: chat.title })} />
        <CardSheet
          visible={carding}
          onClose={() => setCarding(false)}
          onSend={sendCard}
          among={where === 'space' ? 'space' : hiddenOpen}
          foot={t('Its name and phone number go through Telegram, which can read them.')}
        />
        <ErevosStickerSheet visible={erevosStickers} onClose={() => setErevosStickers(false)} onPick={(name) => void sendErevosSticker(name)} />
        <StickerSheet visible={stickers} onClose={() => setStickers(false)} path={(fileId) => fetchPath(fileId, where)} onPick={(sticker) => void sendSticker(sticker)} />
        <Sheet visible={forwardIds !== null} onClose={() => setForwardIds(null)} title={t('Forward to')}>
          <ScrollView style={{ maxHeight: 360 }}>
            {chatList(state, 'main')
              .filter((c) => c.id !== chatId)
              .map((c) => (
                <Pressable key={c.id} onPress={() => forwardTo(c.id)} accessibilityRole="button" style={{ paddingVertical: space.sm }}>
                  <Text numberOfLines={1}>{c.title || t('Chat')}</Text>
                </Pressable>
              ))}
          </ScrollView>
        </Sheet>
      </KeyboardAwareScrollView>
    </View>,
  );
}

// Where the ErevosGram encryption stands in a private chat, and what can be done about it.
function Pill({ seal, busy, number, showNumber, onToggle, chatId, run }: {
  seal: SealInfo;
  busy: boolean;
  number: string | null;
  showNumber: boolean;
  onToggle: () => void;
  chatId: number;
  run: (work: () => Promise<unknown>) => void;
}) {
  if (seal.state === 'NONE') {
    return (
      <Card>
        <Text>{`🔓 ${t('Telegram can read this chat')}`}</Text>
        <Row wrap>
          <Button title={t('ErevosGram encryption')} kind="secondary" compact disabled={busy} onPress={() => run(() => telegramInvite(chatId))} />
        </Row>
        <Text variant="caption" tone="faint">
          {t('Sends them an invitation. If they accept, what you write in this chat is encrypted end to end, and Telegram cannot read it.')}
        </Text>
      </Card>
    );
  }
  if (seal.state === 'INVITED') {
    return (
      <Card>
        <Text>{t('Invitation sent')}</Text>
        <Text variant="caption" tone="muted">
          {t('Until they accept, Telegram can read this chat.')}
        </Text>
      </Card>
    );
  }
  if (seal.state === 'INVITE_IN') {
    return (
      <>
        {/* The chat was encrypted, and this invitation has other keys than theirs: said before it is accepted. */}
        {seal.sealed ? (
          <Card>
            <Text variant="bodyStrong">{`⚠️ ${t('Their keys changed')}`}</Text>
            <Text tone="muted">{t('They may have a new phone, or someone may be in between. Compare the safety number with them by another way before you trust this chat again.')}</Text>
          </Card>
        ) : null}
        <Card>
          <Text variant="bodyStrong">{t('They want ErevosGram encryption')}</Text>
          <Text variant="caption" tone="muted">
            {t('If you accept, what you both write in this chat is encrypted end to end, and Telegram cannot read it.')}
          </Text>
          <Row wrap>
            <Button title={t('Accept')} compact disabled={busy} onPress={() => run(() => telegramAccept(chatId))} />
            <Button title={t('Decline')} kind="secondary" compact disabled={busy} onPress={() => run(() => telegramDecline(chatId))} />
          </Row>
        </Card>
      </>
    );
  }
  return (
    <>
      {seal.keysChanged ? (
        <Card>
          <Text variant="bodyStrong">{`⚠️ ${t('Their keys changed')}`}</Text>
          <Text tone="muted">{t('They may have a new phone, or someone may be in between. Compare the safety number with them by another way before you trust this chat again.')}</Text>
        </Card>
      ) : null}
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityHint={t('Shows the safety number')}>
        <Card>
          <Text>{`🔒 ${t('Encrypted end to end (ErevosGram)')}${seal.verified ? ` · ${t('Verified')}` : ''}`}</Text>
          {showNumber ? (
            <>
              <Text tone="muted">{t('Compare this safety number with the one on their phone, by another way than this chat. If the two are the same, nobody sits in between.')}</Text>
              <Text selectable variant="bodyStrong" style={{ fontFamily: 'monospace' }}>
                {number ?? '…'}
              </Text>
              <Row wrap>
                <Button
                  title={seal.verified ? t('Mark as not verified') : t('Mark as verified')}
                  kind="secondary"
                  compact
                  disabled={busy}
                  onPress={() => run(() => telegramVerified(chatId, !seal.verified))}
                />
              </Row>
            </>
          ) : (
            <Text variant="caption" tone="faint">
              {t('Tap to see the safety number.')}
            </Text>
          )}
        </Card>
      </Pressable>
    </>
  );
}
