// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '../components/keyboard';
import { LinkedText } from '../components/linked-text';
import { keptName, StarredHere, useKeep } from '../components/keep-actions';
import { Missing, type Answered } from '../components/matrix-message';
import { MicButton, RecordingLine, useVoiceCapture, VoiceClip } from '../components/matrix-voice';
import { MessageMenu, type MenuAction } from '../components/message-menu';
import { Pinned, PlaceCard, Quote, Reactions } from '../components/message-parts';
import { ChatLookSheet, ChatScreen } from '../components/chat-look';
import { ChatHistory, HistoryButtons, useHistoryTools } from '../components/chat-history';
import { HeldBubbles, keepForLater, LaterSheet, RemindSheet, remindPlace, useKeptDraft, type RemindOf } from '../components/chat-writing';
import { useChatProtect } from '../components/chat-protect';
import { askDelete, ChatTimer, CheckInPerson, useGoneAt, useVanishOnce, VanishStrip } from '../components/chat-rules';
import { hiddenOnScreen, NetworkChatNotify, useNetworkChatShown } from '../components/network-chat-notify';
import { CarryButtons, MentionChips, useNetworkAmong, usePhotoQuality } from '../components/network-carry';
import { NetworkFile } from '../components/network-file';
import { useNetworkThread } from '../components/network-thread';
import { NostrStickers } from '../components/nostr-stickers';
import { PlaceSheet } from '../components/place-sheet';
import { chosenStyle, SelectBar, selectAction, useSelection } from '../components/select-bar';
import { Button, Input, Page, Row, Sheet, Text } from '../components/ui';
import { ask } from '../lib/alert';
import { nostrHistory } from '../lib/chat-history-adapters';
import type { Place } from '../lib/chat-parts';
import { heldIn } from '../lib/chat-writing';
import { pinOf, shotsBlocked } from '../lib/chat-protect';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { voiceNamed } from '../lib/group-media';
import { t } from '../lib/i18n';
import { mimeOfName } from '../lib/matrix-media';
import { withMention, type Nameable } from '../lib/mentions';
import { cardFile, namesShown, placeOnly, placeWords, withNpubs } from '../lib/message-carry';
import { messageLine } from '../lib/message-line';
import { useNetworkWhere, whereParams } from '../lib/network-place';
import { nameOf, npubOf, personName, shortNpub, type NostrDmMessage, type NostrDmState } from '../lib/nostr-dm';
import { checkByCode, isBlocked, nextGoesIn, ownCode, setBlocked, setTimerIn, shownIn, timerOf, uncheck, type NostrCheck } from '../lib/nostr-rules';
import {
  canForwardNostr,
  nostrDmAct,
  nostrDmDelete,
  nostrDmFile,
  nostrDmForgetChat,
  nostrDmForward,
  nostrDmFreshen,
  nostrDmNow,
  nostrDmPin,
  nostrDmReact,
  nostrDmRead,
  nostrDmRename,
  nostrDmRetry,
  nostrDmSend,
  nostrDmSendFile,
  nostrDmSendSticker,
  nostrDmSetGuard,
  nostrDmSetLook,
  nostrDmSetNotify,
  nostrDmSetTor,
  nostrDmSetSubject,
  nostrDmStickerPlace,
  nostrDmUnreact,
  nostrDmWriting,
  NostrFileTooLargeError,
  onNostrDmChange,
  runNostrDm,
  type NostrOutgoingFile,
} from '../lib/nostr-dm-store';
import { canNostrTor, nostrChatsThroughTor } from '../lib/nostr-dm-net';
import { accountTorOf } from '../lib/account-tor';
import { hiddenKeep, ipGate } from '../components/ip-warning';
import { IpStop } from '../lib/ip-warning';
import { NOSTR_FILE_MOST, type NostrDmFile } from '../lib/nostr-files';
import { stickerMeta } from '../lib/own-stickers';
import { pickFile, TooLargeError } from '../lib/pick-file';
import { pickPhoto } from '../lib/pick-photo';
import { useSharedFiles, useSharedWords } from '../lib/shared-here';
import { pickVideo } from '../lib/pick-video';
import { placesIn } from '../lib/sms-parts';
import type { StickerToSend } from '../lib/sticker-send';
import { checkedChatNotify } from '../lock/chat-notify';
import { space } from '../theme/colors';
import { softBubble, textSized } from '../theme/bubbles';
import type { ChatLook } from '../theme/chat-theme';
import { useColors, useTheme } from '../theme/context';
import { checkedLook } from '../theme/look';

// One chat with someone on another Nostr app, or a group of them (lib/nostr-dm-store.ts): its
// messages, oldest first, and a field to write in. It is marked as not anonymous. Opening it, with
// Erevos on the screen, marks its messages read here only (NIP-17 tells the other app nothing), and
// looks up again, once a week, where they take messages and the name they gave themselves. A name
// given here shows in place of theirs; a group's name goes to all its members with the next
// message. Photos and files go encrypted to a file server (lib/nostr-files.ts); one that comes is
// fetched only when tapped. A message held down opens its menu (components/message-menu.tsx): react
// to it, answer it, copy it, forward it, pin it, choose it among others, delete it. The reactions
// show under a message, each tapped to add the same or, ours, to take it back (NIP-09, in a wrap,
// as NIP-17 allows); a custom emoji (NIP-30) shows as its :shortcode:, its picture never fetched in
// a chat. A pin is this device's only (NIP-17 has none), kept with the chat, over the thread. A
// forward goes as a new message to another Nostr chat of the same account, a file sent again.
// Messages chosen together (components/select-bar.tsx) are copied, forwarded or deleted at once;
// deleting removes them from this device, and of ours asks the others' apps to remove them too
// (NIP-09). A sticker, one of Erevos's own as its picture or one of those made from photos, goes
// as a photo (components/nostr-stickers.tsx).
// An answer shows the message it is to above its words, which scrolls to
// it when tapped, and the message being answered shows over the field until sent or let go. The
// microphone beside the field records a voice message while it is held (components/matrix-voice.tsx),
// which the others play with Play: a sound with its length (a duration tag) is one. While the chat
// shows, what comes in it only sounds, and it can be muted or given a sound of its own
// (components/network-chat-notify.tsx). Opened from a hidden place's hidden chats (`hidden=1`) it is
// the chat of that place's own key (lib/network-place.ts), which has no notification settings.
// **Public posts**, in a chat with one person, opens what they post for everyone, read only
// (app/nostr-posts.tsx). A message held down can be starred too, on this device only, a photo
// that came kept as one of the owner's stickers, and a photo, sound or file saved into the
// Collection (components/keep-actions.tsx); Starred messages lists the chat's, and the chat opened
// at one (`at`) goes to it.
// Words show with their marks (*bold*, _italic_…) and tappable web addresses; a place goes as its
// geo: address and a map's link, and one that comes so shows as a place; Camera, Video and Contact
// card (a .vcf file) send as a photo does, and in a group, @ offers its members and names them as
// nostr:npub1… (lib/message-carry.ts, components/network-carry.tsx).
// What is typed and not sent is kept as the chat's draft, encrypted with the account, and shows on
// its row; Send held down holds it to go later from this phone, shown after the thread until then
// (components/chat-writing.tsx, lib/chat-writing.ts). A message can be written into Chat with
// myself to remind (Remind me).

/** A voice message among the files: a sound that says how long it lasts. */
const isVoice = (file: NostrDmFile): file is NostrDmFile & { duration: number } => file.type.startsWith('audio/') && !!file.duration;

/** A message in one line, for its menu, the strip over the field and the quote of an answer. */
function lineOf(message: NostrDmMessage): string {
  const file = message.file;
  if (typeof file === 'object') {
    return messageLine(isVoice(file) ? { text: '', voice: { ms: file.duration } } : { text: '', file: { kind: file.type.startsWith('image/') ? 'photo' : 'file', name: file.name ?? t('File') } });
  }
  if (!file && placeOnly(message.text)) return `📍 ${t('Location')}`;
  return file ? t('File') : messageLine({ text: message.text }) || t('Message');
}

/** A recorded voice message as it is sent. */
const voiceFile = (audio: Uint8Array, ms: number): NostrOutgoingFile => ({ ...voiceNamed(audio), bytes: audio, durationMs: ms });

// Whether a message can be copied: it has words of its own.
const copyable = (message: NostrDmMessage) => CAN_COPY && !!message.text && !message.file;

/** A Nostr chat's screen, in the chat's own look or the space's (components/chat-look.tsx). */
export default function NostrChatScreen() {
  const [look, setLook] = useState<ChatLook | null>(null);
  return (
    <ChatScreen chat={look} header>
      <NostrChat onLook={setLook} />
    </ChatScreen>
  );
}

function NostrChat({ onLook }: { onLook: (chat: ChatLook | null) => void }) {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { key: given, hidden, at } = useLocalSearchParams<{ key?: string; hidden?: string; at?: string }>();
  const where = useNetworkWhere(hidden === '1');
  const key = given && /^[0-9a-f]{64}$/.test(given) ? given : undefined;
  const [now, setNow] = useState(nostrDmNow(where));
  // What Send to handed this chat (app/share.tsx): its words in the message field, a photo or file sent at once.
  const sharedTo = hidden === '1' || !key ? null : `nostr:${key}`;
  const sharedWords = useSharedWords(sharedTo);
  const [draft, setDraft] = useState(sharedWords);
  const [note, setNote] = useState('');
  const [naming, setNaming] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  // The message the next one answers and the one whose menu is open, by their ids.
  const [replyId, setReplyId] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  // Whether the chat's own look shows its choices (components/chat-look.tsx).
  const [styling, setStyling] = useState(false);
  // The messages being forwarded, while the chats to forward them to show; the stickers' sheet;
  // which pin the bar over the thread shows.
  const [forwarding, setForwarding] = useState<string[] | null>(null);
  const [stickering, setStickering] = useState(false);
  const [pinShown, setPinShown] = useState(0);
  const selection = useSelection<string>();
  // Search in this chat, its media, Go to a day and Export chat (components/chat-history.tsx).
  const history = useHistoryTools();
  // The sheet that sends where we are, how photos go, and whose contacts a contact card is chosen from.
  const [placing, setPlacing] = useState(false);
  const photos = usePhotoQuality();
  const among = useNetworkAmong(where);
  // Choosing when what is typed goes, and the message a reminder is being set for (components/chat-writing.tsx).
  const [choosingLater, setChoosingLater] = useState(false);
  const [reminding, setReminding] = useState<RemindOf | null>(null);
  // The next message to disappear, if it is to (components/chat-rules.tsx).
  const vanish = useVanishOnce();

  useEffect(() => {
    runNostrDm();
    setNow(nostrDmNow(where));
    return onNostrDmChange(() => setNow(nostrDmNow(where)));
  }, [where]);

  // Another chat chooses anew; Back ends the choosing before it leaves the chat.
  useEffect(() => selection.clear(), [key]);
  useEffect(() => {
    if (!selection.on) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      selection.clear();
      return true;
    });
    return () => back.remove();
  }, [selection.on]);

  const state = now.state;
  const chat = key && state ? state.chats[key] : undefined;
  // What is typed is kept as the chat's draft, and comes back in the field when it opens again.
  const kept = useKeptDraft(state ? nostrDmWriting(where) : null, key, (text) => setDraft((typed) => (typed.trim() ? typed : text)));
  // The chat's own look, told to the screen that draws it.
  const ownLook = useMemo(() => (chat?.look ? checkedLook(chat.look) : null), [chat?.look]);
  const lookChat = useMemo<ChatLook | null>(() => (key ? { look: ownLook, save: (look) => nostrDmSetLook(key, look) } : null), [ownLook, key]);
  useEffect(() => onLook(lookChat), [onLook, lookChat]);
  // Locked with a PIN of its own, its screenshots blocked (components/chat-protect.tsx): not in a
  // hidden place's chats, which their own PIN guards. While its PIN asks, nothing of it shows or is read.
  const guard = useChatProtect({
    id: `nostr:${key ?? ''}`,
    name: !state || !key ? '' : key === state.public ? t('Chat with myself') : nameOf(state, key) || shortNpub(npubOf(key)),
    pin: pinOf(chat),
    shots: shotsBlocked(chat),
    lockable: where === 'space' && !!chat,
    save: (change) => (key ? nostrDmSetGuard(key, change) : Promise.resolve()),
    say: setNote,
    onBack: () => router.back(),
  });
  const count = chat?.messages.length ?? 0;
  // What is gone by the chat's rules leaves the screen at its time (lib/nostr-rules.ts).
  const shownList = chat ? shownIn(chat) : [];
  useGoneAt(chat ? nextGoesIn(chat) : 0);
  // The thread opens at its last message, with the arrows to its start, to where it was left and to its
  // end (components/network-thread.tsx).
  const { scroll, scrollProps, threadProps, endProps, place, goTo, withArrows } = useNetworkThread({
    list: shownList,
    idOf: (message) => message.id,
    mine: (message) => message.mine,
    unread: chat?.unread ?? 0,
    // Opened at a starred message: there.
    at,
    onAt: (found) => found || setNote(t('That message is not on this phone.')),
  });
  // Star, Add to my stickers and Save to the Collection, in a message's menu (components/keep-actions.tsx).
  const keep = useKeep({ service: 'nostr', place: nostrDmStickerPlace(where), account: state?.public ?? '', chat: key ?? '', group: !!chat?.members, messages: chat?.messages, say: setNote });
  // A hidden place's chat is not told apart on the screen: nothing of it reaches the space's notices.
  const shown = useNetworkChatShown(!key || guard.gated ? undefined : where === 'space' ? `nostr:${key}` : hiddenOnScreen()) && !guard.gated;
  useEffect(() => {
    if (shown && key && chat?.unread) nostrDmRead(key).catch(() => undefined);
  }, [shown, key, count, chat?.unread]);
  const members = chat?.members;
  useEffect(() => {
    if (!key || !chat) return;
    for (const person of members ?? [key]) nostrDmFreshen(person);
  }, [key, !!chat, members?.join()]);

  // Not going on at a warning (IpStop) failed nothing, so nothing is said of it.
  const fail = (error: unknown) => {
    if (!(error instanceof IpStop)) setNote(error instanceof Error ? error.message : String(error));
  };
  // A hidden place's warnings are kept with its hidden chats, never in the space's data.
  const ipKeep = () => (where !== 'space' ? { keep: hiddenKeep() } : {});

  // Whether what goes now goes through Tor: the chat by itself, or the account's way.
  const throughTorNow = (to = key) => {
    const s = nostrDmNow(where).state;
    return !!to && !!s && ((!!s.chats[to]?.tor && canNostrTor()) || nostrChatsThroughTor(accountTorOf(s.tor)));
  };
  // Before what is sent can show this phone's address (lib/ip-warning.ts): said once, with the
  // chat's «Through Tor» as the way not to, where there is Tor.
  async function mayGo(to = key): Promise<boolean> {
    if (!to) return false;
    if (throughTorNow(to)) return true;
    return ipGate({ network: 'Nostr', act: 'send', of: `nostr:${to}`, ...ipKeep() }, canNostrTor() ? { label: t('Through Tor for this chat'), run: () => nostrDmSetTor(to, true) } : undefined);
  }
  // Before a file of theirs is fetched from the server they chose without Tor: said once for the chat.
  async function fetchTheirs(file: NostrDmFile, mine: boolean): Promise<Uint8Array> {
    if (!mine && key && !throughTorNow() && !(await ipGate({ network: 'Nostr', act: 'file', of: `nostr:${key}`, ...ipKeep() }, canNostrTor() ? { label: t('Through Tor for this chat'), run: () => nostrDmSetTor(key, true) } : undefined))) {
      throw new IpStop();
    }
    return nostrDmFile(file, key);
  }

  // A photo, file or voice message goes as an answer too, to the message chosen while it is still there.
  async function sendPicked(pick: () => Promise<NostrOutgoingFile | null>) {
    await sendWith(pick, nostrDmSendFile);
  }

  // Sends what was picked, a file or a sticker, answering the message chosen to answer.
  async function sendWith<T>(pick: () => Promise<T | null>, send: (key: string, picked: T, replyTo?: string) => Promise<void>) {
    if (!key || sending) return;
    if (!(await mayGo())) return;
    setNote('');
    setSending(true);
    try {
      const file = await pick();
      if (!file) return;
      const to = replyId && chat?.messages.some((m) => m.id === replyId) ? replyId : undefined;
      setReplyId(null);
      await send(key, file, to);
    } catch (error) {
      fail(error instanceof TooLargeError ? new NostrFileTooLargeError() : error);
    } finally {
      setSending(false);
    }
  }

  const voice = useVoiceCapture({ send: (audio, ms) => sendPicked(async () => voiceFile(audio, ms)), say: setNote });
  useSharedFiles(chat ? sharedTo : null, async (file) => (await mayGo()) && nostrDmSendFile(key ?? '', { bytes: file.bytes, name: file.name, mime: file.mime, ...(file.w && file.h ? { dim: `${file.w}x${file.h}` } : {}) }), fail, setSending);

  if (guard.gate) return guard.gate;
  if (!state || !key || !chat) {
    return (
      <Page>
        <Text variant="title">{t('Nostr chats')}</Text>
        <Text tone="muted">{now.loaded ? t('This Nostr chat is not here any more.') : ''}</Text>
      </Page>
    );
  }

  const byId = new Map(chat.messages.map((message) => [message.id, message]));
  // One that is gone meanwhile is none: what is typed then goes as a new message.
  const answered = replyId ? byId.get(replyId) : undefined;
  const menuMessage = menuFor ? byId.get(menuFor) : undefined;

  // What is typed goes as a new message, or as an answer to the one chosen; in a group, those
  // named with @ go as nostr:npub1… (NIP-27).
  async function send() {
    const text = draft.trim();
    if (!text || !key) return;
    if (!(await mayGo())) return;
    setDraft('');
    kept.sent();
    setNote('');
    setReplyId(null);
    nostrDmSend(key, withNpubs(text, nameable), answered?.id, vanish.lasts()).catch(fail);
  }

  // Holds what is typed to go at `at` from this phone (lib/chat-writing.ts), as an answer to the one chosen.
  async function sendLater(at: number) {
    setChoosingLater(false);
    const text = draft.trim();
    if (!text || !key) return;
    if (!(await mayGo())) return;
    if (await keepForLater(nostrDmWriting(where), { chat: key, text, at, ...(answered ? { replyTo: answered.id } : {}) }, setNote)) {
      setDraft('');
      kept.sent();
      setReplyId(null);
    }
  }

  const sendPhoto = (from: 'photos' | 'camera' = 'photos') =>
    sendPicked(async () => {
      const photo = await pickPhoto(from, photos.quality);
      return photo ? { bytes: photo.bytes, name: photo.name, mime: photo.mime, ...(photo.w && photo.h ? { dim: `${photo.w}x${photo.h}` } : {}) } : null;
    });
  const sendVideo = () =>
    sendPicked(async () => {
      const video = await pickVideo(NOSTR_FILE_MOST);
      return video ? { bytes: video.bytes, name: video.name, mime: video.mime, ...(video.w && video.h ? { dim: `${video.w}x${video.h}` } : {}) } : null;
    });
  // A contact card goes as a .vcf file, as a file does (kind 15); a place as its geo: address and a map's link in the words.
  const sendCard = (card: string) => sendPicked(async () => cardFile(card));
  async function sendPlace(place: Place) {
    setPlacing(false);
    if (key && (await mayGo())) nostrDmSend(key, placeWords(place)).catch(fail);
  }
  const sendAnyFile = () =>
    sendPicked(async () => {
      const picked = await pickFile(NOSTR_FILE_MOST);
      return picked ? { ...picked, mime: mimeOfName(picked.name) } : null;
    });

  const self = key === state.public;
  const group = !!members;
  const npub = npubOf(key);
  const name = self ? t('Chat with myself') : nameOf(state, key) || shortNpub(npub);
  const whoOf = (message: NostrDmMessage) => (message.mine ? t('You') : message.from ? personName(state, message.from) : name);
  // In a group, the others as @ offers them; everyone a message may name, us too, as its words show them.
  const nameable: Nameable[] = (members ?? []).map((member) => ({ identity: member, name: personName(state, member) }));
  const people: Nameable[] = [...nameable, ...(group ? [] : [{ identity: key, name }]), { identity: state.public, name: state.name || t('You') }];

  // A reaction chosen: ours again takes it back, another one goes in its place.
  const mineOn = (message: NostrDmMessage) => message.reactions?.[state.public];
  const react = async (message: NostrDmMessage, emoji: string) => {
    if (!(await mayGo())) return;
    await (emoji === mineOn(message) ? nostrDmUnreact(key, message.id) : nostrDmReact(key, message.id, emoji)).catch(fail);
  };

  async function copy(text: string) {
    setNote((await copyText(text)) ? t('Copied. Any app that reads the clipboard can read it now.') : t('Not copied.'));
  }

  const pins = (chat.pins ?? []).filter((id) => byId.has(id));
  const pinAt = Math.min(pinShown, Math.max(0, pins.length - 1));

  // Deletes from this device, after asking; or, with some of ours that went among them, asks the
  // others to delete those too (NIP-09).
  function remove(ids: string[]) {
    const gone = (everyone: boolean) => () => {
      selection.clear();
      void nostrDmDelete(key!, ids, everyone).catch(fail);
    };
    const ours = ids.some((id) => {
      const m = byId.get(id);
      return !!m?.mine && m.state !== 'failed' && m.state !== 'sending' && !m.old;
    });
    askDelete(
      ids.length,
      gone(false),
      ours ? gone(true) : undefined,
      t('They are removed from this phone. Of your own, the others are asked to remove them too: their Nostr apps may or may not do so.'),
    );
  }

  // The words of the messages chosen, oldest first: of several, each with who wrote it.
  function copyChosen() {
    const chosen = chat!.messages.filter((m) => selection.chosen.has(m.id) && copyable(m));
    selection.clear();
    if (!chosen.length) return setNote(t('Not copied.'));
    void copy(chosen.length === 1 ? chosen[0].text : chosen.map((m) => `${whoOf(m)}: ${m.text}`).join('\n'));
  }

  async function forwardTo(to: string, toName: string) {
    const ids = forwarding ?? [];
    setForwarding(null);
    if (!(await mayGo(to))) return;
    selection.clear();
    setNote(t('Sending…'));
    nostrDmForward(key!, ids, to).then(() => setNote(t('Forwarded to {name}.', { name: toName })), fail);
  }

  const stickerPlace = nostrDmStickerPlace(where);
  // One of the place's own stickers, made from a photo: as every sticker, through nostrDmSendSticker.
  function sendSticker(picture: Uint8Array) {
    setStickering(false);
    void sendWith(async () => {
      const { mime, w, h } = stickerMeta(picture);
      return { bytes: picture, mime, w: w ?? 0, h: h ?? 0 };
    }, nostrDmSendSticker);
  }
  // A built-in sticker, as its picture made on this device (lib/sticker-send.ts): through nostrDmSendSticker too.
  function sendBuiltIn(sticker: StickerToSend) {
    setStickering(false);
    void sendWith(async () => sticker, nostrDmSendSticker);
  }

  // What can be done with a message, held down: answering is for one that went.
  function actionsOf(message: NostrDmMessage): MenuAction[] {
    const actions: MenuAction[] = [];
    if (message.state !== 'failed') actions.push({ title: t('Reply'), onPress: () => setReplyId(message.id) });
    if (copyable(message)) actions.push({ title: t('Copy'), onPress: () => void copy(message.text) });
    if (canForwardNostr(message)) actions.push({ title: t('Forward'), onPress: () => setForwarding([message.id]) });
    const pinned = pins.includes(message.id);
    actions.push({ title: pinned ? t('Unpin') : t('Pin for me'), onPress: () => void nostrDmPin(key!, message.id, !pinned).then(() => setPinShown(0), fail) });
    const file = typeof message.file === 'object' ? message.file : undefined;
    actions.push(
      ...keep.actions({
        star: message.state !== 'failed' ? { id: message.id, at: message.at, mine: message.mine, line: lineOf(message) } : null,
        sticker: file && file.type.startsWith('image/') ? () => fetchTheirs(file, message.mine) : null,
        file: file ? { name: keptName(file.name, file.type), mime: file.type, fetch: () => fetchTheirs(file, message.mine) } : null,
        remote: true,
      }),
    );
    if (message.state !== 'failed' && remindPlace(where)) {
      const from = group && !message.mine ? `Nostr · ${name} · ${whoOf(message)}` : `Nostr · ${name}`;
      actions.push({ title: t('Remind me'), onPress: () => setReminding({ from, text: message.file ? lineOf(message) : message.text }) });
    }
    actions.push(selectAction(() => selection.start(message.id)));
    actions.push({ title: t('Delete'), danger: true, onPress: () => remove([message.id]) });
    return actions;
  }

  const others = Object.values(state.chats)
    .filter((other) => other.key !== key)
    .sort((a, b) => b.lastAt - a.lastAt);
  const chatName = (other: string) => (other === state.public ? t('Chat with myself') : nameOf(state, other) || shortNpub(npubOf(other)));

  // The message an answer is to, as the answer quotes it: null when it is not on this phone.
  const answeredBy = (message: NostrDmMessage): Answered | null | undefined => {
    if (!message.replyTo) return undefined;
    const to = byId.get(message.replyTo);
    return to ? { name: whoOf(to), line: lineOf(to), onPress: () => goTo(to.id) } : null;
  };

  const chosenCount = chat.messages.filter((m) => selection.chosen.has(m.id)).length;
  const bar = selection.on ? (
    <SelectBar
      count={chosenCount}
      onCancel={selection.clear}
      onAll={() => selection.set(chat.messages.map((m) => m.id))}
      onCopy={CAN_COPY ? copyChosen : undefined}
      onForward={() => {
        const ids = chat.messages.filter((m) => selection.chosen.has(m.id) && canForwardNostr(m)).map((m) => m.id);
        if (ids.length) setForwarding(ids);
      }}
      onDelete={() => remove([...selection.chosen])}
    />
  ) : null;

  // The chat's name: fixed over the thread, it stays while the thread scrolls (#12).
  const top = (
    <Text variant="title" numberOfLines={2}>
      {name}
    </Text>
  );

  const thread = withArrows(
    <KeyboardAwareScrollView
      ref={scroll}
      style={{ flex: 1, backgroundColor: colors.ground }}
      // As Page (components/ui.tsx) has it, but with a hold on the scrolling.
      contentContainerStyle={{ width: '100%', maxWidth: 760, alignSelf: 'center', padding: space.xl - 4, paddingBottom: insets.bottom + space.xl, gap: space.md }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={space.xl}
      {...scrollProps}
    >
      {group ? (
        <Text variant="caption" tone="muted">
          {t('A group with {names}', { names: members.map((member) => personName(state, member)).join(', ') })}
        </Text>
      ) : (
        <Text selectable variant="caption" tone="muted" style={{ fontFamily: 'monospace' }}>
          {npub}
        </Text>
      )}
      <Text variant="caption" tone="muted">
        {t('Nostr · encrypted (NIP-17), not anonymous')}
      </Text>
      {group || self ? null : (
        <CheckInPerson
          checked={!!chat.checked}
          code={ownCode(npubOf(state.public))}
          about={t('Their Nostr app shows their key as a code (nostr:npub…): take a photo of it here, and the chat is marked checked when it is this chat’s key. Let them take a photo of this code too. Nothing is sent.')}
          check={async (text) => checkSaid(await nostrDmAct((s) => checkByCode(s, key, text)))}
          onUncheck={() => void nostrDmAct(async (s) => uncheck(s, key)).catch(fail)}
        />
      )}
      {group || self ? null : (
        <>
          <Row>
            <Button title={t('Public posts')} kind="secondary" compact onPress={() => router.push({ pathname: '/nostr-posts', params: { key, ...whereParams(where) } })} />
          </Row>
          {chat.messages.length === 0 ? (
            <Text variant="caption" tone="faint">
              {t('No private messages here yet. What they post for everyone is under Public posts.')}
            </Text>
          ) : null}
        </>
      )}
      {pins.length ? (
        <Pinned
          index={pinAt}
          count={pins.length}
          line={lineOf(byId.get(pins[pinAt])!)}
          onPress={() => {
            goTo(pins[pinAt]);
            setPinShown((pinAt + 1) % pins.length);
          }}
        />
      ) : null}

      <View style={{ gap: space.md }} {...threadProps}>
        {shownList.map((message) => (
          <Bubble
            fetchFile={(file) => fetchTheirs(file, message.mine)}
            key={message.id}
            state={state}
            message={message}
            group={group}
            people={people}
            answered={answeredBy(message)}
            onRetry={() => nostrDmRetry(key, message.id).catch(fail)}
            onMenu={() => setMenuFor(message.id)}
            onSign={message.state !== 'failed' ? (sign) => void react(message, sign) : undefined}
            chosen={selection.chosen.has(message.id)}
            onChoose={selection.on ? () => selection.toggle(message.id) : undefined}
            onLayout={place(message.id)}
            starred={keep.starred.has(message.id)}
          />
        ))}
      </View>
      <HeldBubbles held={heldIn(state.writing, key)} account={() => nostrDmWriting(where)} say={setNote} />

      {answered ? <Quote name={whoOf(answered)} line={lineOf(answered)} onPress={() => goTo(answered.id)} onClose={() => setReplyId(null)} /> : null}
      {vanish.on ? (
        <VanishStrip seconds={vanish.seconds} note={t('Their app and the relays that honour its time (NIP-40) delete it then; others keep it.')} onChoose={vanish.choose} onClose={vanish.off} />
      ) : null}
      <MentionChips text={draft} members={nameable} onPick={(member) => setDraft(withMention(draft, member.name))} />
      <Row>
        <Input
          style={{ flex: 1 }}
          value={draft}
          onChangeText={(text) => {
            setDraft(text);
            kept.typed(text);
          }}
          multiline
          placeholder={t('Message')}
          accessibilityLabel={t('Message')}
        />
        {/* Held down: what is typed goes later. */}
        <Button title={t('Send')} compact disabled={!draft.trim()} onPress={() => void send()} onLongPress={draft.trim() ? () => setChoosingLater(true) : undefined} />
      </Row>
      {voice.recording ? null : (
        <Row wrap>
          <Button title={t('Location')} kind="secondary" compact disabled={sending} onPress={() => setPlacing(true)} />
          <CarryButtons
            disabled={sending}
            photos={photos}
            among={among}
            shown={shown}
            onCamera={() => void sendPhoto('camera')}
            onVideo={() => void sendVideo()}
            onCard={(card) => void sendCard(card)}
          />
        </Row>
      )}
      <LaterSheet visible={choosingLater && shown} where={where} onClose={() => setChoosingLater(false)} onPick={(at) => void sendLater(at)} />
      <RemindSheet of={shown ? reminding : null} where={where} onClose={() => setReminding(null)} say={setNote} />
      <Row {...endProps}>
        {voice.recording ? (
          <RecordingLine />
        ) : (
          <>
            <Button title={t('Photo')} kind="secondary" compact disabled={sending} onPress={() => void sendPhoto()} />
            <Button title={t('File')} kind="secondary" compact disabled={sending} onPress={() => void sendAnyFile()} />
            {stickerPlace ? <Button title={t('Sticker')} kind="secondary" compact disabled={sending} onPress={() => setStickering(true)} /> : null}
            {vanish.on ? null : <Button title={t('Disappear')} kind="secondary" compact onPress={vanish.toggle} />}
            {sending ?<Text tone="muted">{t('Sending…')}</Text> : <View style={{ flex: 1 }} />}
          </>
        )}
        <MicButton voice={voice} disabled={sending} />
      </Row>
      {note ? <Text tone="muted">{note}</Text> : null}
      <Row wrap>
        <NetworkChatNotify notify={checkedChatNotify(chat.notify)} hidden={where !== 'space'} calls={false} onChange={(next) => nostrDmSetNotify(key, next)} />
        {canNostrTor() && !self ? (
          <Button
            title={chat.tor ? t('Through Tor: on') : t('Through Tor')}
            kind="secondary"
            compact
            onPress={() => void nostrDmSetTor(key, !chat.tor).catch(fail)}
          />
        ) : null}
        <Button title={t('Chat look')} kind="secondary" compact onPress={() => setStyling(true)} />
        <StarredHere stars={keep.stars} who={name} onGo={(id) => (byId.has(id) ? goTo(id) : setNote(t('That message is not on this phone.')))} />
        {guard.buttons}
        <ChatTimer
          seconds={timerOf(chat)}
          note={t('New messages, sent or received, go from this phone that long after they were sent. Yours carry that time, so their app and the relays delete them then (NIP-40); those that do not honour it keep them. Messages already here stay.')}
          onChoose={(after) => void nostrDmAct(async (s) => setTimerIn(s, key, after)).catch(fail)}
        />
      </Row>
      {chat.tor && canNostrTor() && !self ? (
        <Text variant="caption" tone="faint">
          {t('What you send here, the look-up of where they read, and the photos and files of this chat go only through Tor, on circuits of their own, whatever the space’s Tor way; never without Tor. What comes to you follows your Nostr account, whose relays are read once for all its chats.')}
        </Text>
      ) : null}
      <HistoryButtons tools={history} exportable={where === 'space'} />
      <ChatLookSheet visible={styling} onClose={() => setStyling(false)} name={name} chat={lookChat} />
      <PlaceSheet visible={placing && shown} onClose={() => setPlacing(false)} onSend={sendPlace} said={t('Everyone in this chat can see it.')} />

      {self ? null : naming === null ? (
        <Button title={group ? t('Name this group') : t('Name them here')} kind="secondary" compact onPress={() => setNaming((group ? chat.subject : chat.name) ?? '')} />
      ) : (
        <View style={{ gap: space.xs }}>
          <Row>
            <Input
              style={{ flex: 1 }}
              value={naming}
              onChangeText={setNaming}
              maxLength={group ? 100 : 64}
              placeholder={group ? name : state.people[key]?.name || shortNpub(npub)}
              accessibilityLabel={group ? t('Name this group') : t('Name them here')}
            />
            <Button
              title={t('Save')}
              compact
              onPress={() =>
                void (group ? nostrDmSetSubject(key, naming) : nostrDmRename(key, naming))
                  .then(() => setNaming(null))
                  .catch(fail)
              }
            />
          </Row>
          <Text variant="caption" tone="faint">
            {group
              ? t('Everyone in the group sees it, with your next message.')
              : where === 'place'
                ? t('Only in these hidden chats: they are not told. Empty, it shows the name they gave themselves.')
                : t('Only in this space: they are not told. Empty, it shows the name they gave themselves.')}
          </Text>
        </View>
      )}

      {group || self ? null : isBlocked(state, key) ? (
        <>
          <Text variant="caption" tone="muted">
            {t('Blocked: what they send is dropped on this phone.')}
          </Text>
          <Button title={t('Unblock')} kind="secondary" onPress={() => void nostrDmAct(async (s) => setBlocked(s, key, false)).catch(fail)} />
        </>
      ) : (
        <Button
          title={t('Block')}
          kind="secondary"
          onPress={() =>
            ask(t('Block {name}?', { name }), t('What they send is dropped on this phone, unread, and does not come back if you unblock them. They are not told: Nostr cannot stop anyone from writing to you.'), [
              { text: t('Cancel'), style: 'cancel' },
              { text: t('Block'), style: 'destructive', onPress: () => void nostrDmAct(async (s) => setBlocked(s, key, true)).catch(fail) },
            ])
          }
        />
      )}
      <Button
        title={t('Remove this chat')}
        kind="secondary"
        onPress={() =>
          ask(
            t('Remove this chat?'),
            group
              ? t('Its messages are removed from this phone. The others keep theirs, and a new message in the group starts it again.')
              : t('Its messages are removed from this phone. The other person keeps theirs, and a new message from them starts the chat again.'),
            [
              { text: t('Cancel'), style: 'cancel' },
              {
                text: t('Remove'),
                style: 'destructive',
                onPress: () =>
                  void nostrDmForgetChat(key)
                    .then(() => router.back())
                    .catch(fail),
              },
            ],
          )
        }
      />
      <MessageMenu
        visible={!!menuMessage && shown}
        onClose={() => setMenuFor(null)}
        line={menuMessage ? lineOf(menuMessage) : ''}
        reaction={menuMessage ? mineOn(menuMessage) : undefined}
        onReact={menuMessage && menuMessage.state !== 'failed' ? (emoji) => void react(menuMessage, emoji) : undefined}
        actions={menuMessage ? actionsOf(menuMessage) : []}
      />
      <Sheet visible={forwarding !== null && shown} onClose={() => setForwarding(null)} title={t('Forward to')}>
        <ScrollView nestedScrollEnabled style={{ maxHeight: 380 }} contentContainerStyle={{ gap: space.xs }} keyboardShouldPersistTaps="handled">
          {others.map((other) => (
            <Button key={other.key} title={chatName(other.key)} kind="secondary" onPress={() => void forwardTo(other.key, chatName(other.key))} />
          ))}
        </ScrollView>
      </Sheet>
      {stickerPlace ? (
        <Sheet visible={stickering && shown} onClose={() => setStickering(false)} title={t('Send a sticker')}>
          <NostrStickers place={stickerPlace} onPick={sendSticker} onBuiltIn={sendBuiltIn} />
        </Sheet>
      ) : null}
    </KeyboardAwareScrollView>,
    top,
  );

  return (
    <View style={{ flex: 1 }}>
      {bar}
      <ChatHistory
        tools={history}
        name={name}
        messages={() => nostrHistory(chat.messages, (person) => personName(state, person), group)}
        goTo={(id) => {
          goTo(id);
          return true;
        }}
        exportable={where === 'space'}
        shown={shown}
        say={setNote}
      />
      {thread}
    </View>
  );
}

/** What a photo of their code showed (lib/nostr-rules.ts checkByCode). */
function checkSaid(found: NostrCheck): string {
  if (found === 'match') return t('It matches: no one is in between. Now let them take a photo of the code on this phone, so their phone checks you too.');
  if (found === 'own') return t('That is the code this phone shows. Take a photo of the code on their phone.');
  if (found === 'other') return t('That is the code of another key than this chat’s. Someone may be in between, or it is another account of theirs: ask them.');
  return t('That QR code is not a code to check a contact by.');
}

function Bubble({ state, fetchFile, message, group, people, answered, onRetry, onMenu, onSign, chosen, onChoose, onLayout, starred }: {
  state: NostrDmState;
  /** Fetches its file: the chat's way, after saying when its server may see this phone's address. */
  fetchFile: (file: NostrDmFile) => Promise<Uint8Array>;
  message: NostrDmMessage;
  group: boolean;
  /** Who its words may name (nostr:npub1…), shown by their names. */
  people: Nameable[];
  /** The message it answers, or null when that is not on this phone. */
  answered?: Answered | null;
  onRetry: () => void;
  /** Held down: its menu. */
  onMenu: () => void;
  /** A reaction under it tapped: ours takes it back, another adds the same. */
  onSign?: (sign: string) => void;
  /** It is among those chosen; while choosing, a tap adds it or takes it out. */
  chosen: boolean;
  onChoose?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Starred on this device (components/keep-actions.tsx). */
  starred?: boolean;
}) {
  const { colors, look } = useTheme();
  const mine = message.mine;
  const when = new Date(message.at).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  // NIP-17 says nothing back: one tick once a relay of theirs took it, no more.
  const status = message.state === 'sending' ? t('Sending…') : message.state === 'failed' ? t('Not sent.') : `${when}${mine ? ' ✓' : ''}${starred ? '  ·  ★' : ''}`;
  const file = typeof message.file === 'object' ? message.file : undefined;
  // Its words as they show: those named by their names, a place as a place (lib/message-carry.ts).
  const words = useMemo(() => (message.file ? '' : namesShown(message.text, people)), [message.file, message.text, people]);
  const place = message.file ? null : placeOnly(message.text);
  const places = useMemo(() => (message.file ? [] : placesIn(message.text)), [message.file, message.text]);
  return (
    <View onLayout={onLayout} style={chosen ? [{ padding: 2 }, chosenStyle(colors)] : undefined}>
      <Pressable
        onPress={onChoose}
        onLongPress={onChoose ?? onMenu}
        // One with buttons in it (Play, Save) stays apart from them for a screen reader.
        accessible={!file}
        accessibilityState={onChoose ? { selected: chosen } : undefined}
        accessibilityHint={onChoose ? undefined : t('Hold for more')}
        style={[{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: space.sm + 2, gap: 2 }, softBubble(look.bubbles, colors, mine)]}
      >
        {group && !mine && message.from ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {personName(state, message.from)}
          </Text>
        ) : null}
        {message.forwarded ? (
          <Text variant="caption" tone="muted" style={{ fontStyle: 'italic' }}>
            {t('Forwarded')}
          </Text>
        ) : null}
        {message.replyTo ? answered ? <Quote name={answered.name} line={answered.line} onPress={answered.onPress} /> : <Missing /> : null}
        {file ? (
          isVoice(file) ? (
            <VoiceClip type={file.type} duration={file.duration} fetch={() => fetchFile(file)} />
          ) : (
            <NetworkFile name={file.name ?? (file.type.startsWith('image/') ? t('Photo') : t('File'))} type={file.type} size={file.size} dim={file.dim} fetch={() => fetchFile(file)} onMenu={onChoose ?? onMenu} />
          )
        ) : message.file ? (
          <Text tone="muted">{t('A file: Erevos cannot open files sent this way yet.')}</Text>
        ) : place ? (
          <PlaceCard place={place} />
        ) : (
          // Not selectable: holding the words opens the menu, which can copy them. In the chat's text size (theme/look.ts).
          <>
            <Text style={textSized(look.textSize, 16)}>
              <LinkedText text={words} />
            </Text>
            {places.map((one, i) => (
              <PlaceCard key={i} place={one} />
            ))}
          </>
        )}
        <Text variant="caption" tone="faint">
          {status}
        </Text>
        {message.state === 'failed' ? <Button title={t('Try again')} kind="secondary" compact onPress={onRetry} /> : null}
      </Pressable>
      {/* Each reaction once, with how many chose it; ours stands out. A custom emoji (NIP-30) shows as its :shortcode:. */}
      <Reactions signs={Object.values(message.reactions ?? {})} mine={message.reactions?.[state.public]} mineSide={mine} onSign={onChoose ? undefined : onSign} onPress={onChoose} />
    </View>
  );
}
