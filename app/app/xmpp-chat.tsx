// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '../components/keyboard';
import { LinkedText } from '../components/linked-text';
import { ChatTorSwitch } from '../components/account-tor';
import { accountNeverStraight, accountThroughTor } from '../lib/account-tor';
import { hiddenKeep, ipGate } from '../components/ip-warning';
import { IpStop } from '../lib/ip-warning';
import { canXmppTor } from '../lib/xmpp-net';
import { StarredHere, useKeep } from '../components/keep-actions';
import { Missing, ReactionChips } from '../components/matrix-message';
import { MicButton, RecordingLine, useVoiceCapture } from '../components/matrix-voice';
import { MessageMenu, type MenuAction } from '../components/message-menu';
import { Pinned, PlaceCard, PreviewCard, Quote } from '../components/message-parts';
import { PlaceSheet } from '../components/place-sheet';
import { chosenStyle, SelectBar, selectAction, useSelection } from '../components/select-bar';
import { XmppStickerSheet } from '../components/xmpp-stickers';

import { ChatLookSheet, ChatScreen } from '../components/chat-look';
import { ChatHistory, HistoryButtons, useHistoryTools } from '../components/chat-history';
import { HeldBubbles, keepForLater, LaterSheet, RemindSheet, remindPlace, useKeptDraft, type RemindOf } from '../components/chat-writing';
import { useChatProtect } from '../components/chat-protect';
import { askDelete, ChatTimer, CheckInPerson, SwitchLine, useGoneAt, useVanishOnce, VanishStrip } from '../components/chat-rules';
import { hiddenOnScreen, NetworkChatNotify, useNetworkChatShown } from '../components/network-chat-notify';
import { CarryButtons, MentionChips, useNetworkAmong, usePhotoQuality } from '../components/network-carry';
import { OwnName } from '../components/own-name';
import { NetworkFile } from '../components/network-file';
import { useNetworkThread } from '../components/network-thread';
import { useSayTyping } from '../components/say-typing';
import { PhoneSign, ShortcutTile, VideoSign } from '../components/shortcut-tile';
import { IconButton } from '../components/composer';
import { MoreIcon, OptionsIcon, PlusIcon } from '../components/icons';
import { Button, Card, Chip, Input, OptionList, Page, Row, SectionTitle, Sheet, Text, TextButton } from '../components/ui';
import { ask } from '../lib/alert';
import { currentCall } from '../lib/call';
import { shownLine } from '../lib/call-lines';
import { callPermissions } from '../lib/call-permissions';
import { vanishTimer } from '../lib/chat-rules';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { xmppHistory } from '../lib/chat-history-adapters';
import type { Place } from '../lib/chat-parts';
import { heldIn } from '../lib/chat-writing';
import { pinOf, shotsBlocked } from '../lib/chat-protect';
import { firstLink, fitPreview, previewWay } from '../lib/link-preview';
import { CAN_PREVIEW, makePreview } from '../lib/make-preview';
import { geoUri, placeOfGeo } from '../lib/matrix-parts';
import { throughTor } from '../lib/relay';
import { loadCurrentSpaceData } from '../lock/space-data';
import { currentGroupCall } from '../lib/group-call';
import { voiceNamed } from '../lib/group-media';
import { groupCallGoingOn, joinGroupCall, onGroupCallChange, startGroupCall } from '../lib/group-calls';
import { t } from '../lib/i18n';
import { mimeOfName } from '../lib/matrix-media';
import type { Nameable } from '../lib/mentions';
import { cardFile, withNick } from '../lib/message-carry';
import { actingWhere, useNetworkWhere } from '../lib/network-place';
import { pickFile } from '../lib/pick-file';
import { pickPhoto } from '../lib/pick-photo';
import { useSharedFiles, useSharedWords } from '../lib/shared-here';
import { pickVideo } from '../lib/pick-video';
import { stickerMeta } from '../lib/own-stickers';
import { rtc } from '../lib/webrtc';
import { forwardable, isBlocked, isXmppId, nameOf, onXmppTyping, plainIn, TYPING_SHOWS, XMPP_CONTACT_NAME, xmppChatList, xmppDevices, xmppPresence, xmppTorWay, xmppTyping, type XmppMessage, type XmppState } from '../lib/xmpp';
import { presenceText } from '../lib/net-presence';
import { pinsShown, reactionsShown } from '../lib/xmpp-actions';
import { startXmppCall } from '../lib/xmpp-calls';
import { fileOfOwnServer, isSound, shownType, XMPP_FILE_MOST, type XmppFile } from '../lib/xmpp-files';
import { DESCRIPTION_LONGEST, groupPeople, rankOf, type XmppRoom } from '../lib/xmpp-muc';
import { xmppGroupCalls, xmppPlaceGroupCalls } from '../lib/xmpp-muji';
import { fingerprint, NoOmemoError } from '../lib/xmpp-omemo';
import { checkByCode, hideIn, idsIn, markSent, nextGoesIn, ownCode, rulesOf, setTimerIn, setUnseen, shownIn, uncheck, unseenBy, type CheckResult } from '../lib/xmpp-rules';
import {
  onXmppChange,
  runXmpp,
  xmppAct,
  xmppAddToGroup,
  xmppRemoveFromGroup,
  xmppRenameContact,
  xmppRenameGroup,
  xmppSetGroupAdmin,
  xmppSetSubject,
  xmppBlock,
  xmppChange,
  xmppDelete,
  xmppDescribeGroup,
  xmppDropUnsent,
  xmppFile,
  xmppForward,
  xmppHeard,
  xmppAcceptDevice,
  xmppForgetChat,
  xmppLeaveGroup,
  xmppLookUpKeys,
  xmppNow,
  xmppPin,
  xmppRead,
  xmppReact,
  xmppReply,
  xmppSend,
  xmppSendAgain,
  xmppSendFile,
  xmppSendSticker,
  xmppSetGuard,
  xmppSetLook,
  xmppSetNotify,
  xmppSetPlain,
  xmppStickerPlace,
  xmppTyped,
  xmppWriting,
  type XmppOutgoingFile,
  type XmppSticker,
  xmppActingTor,
  xmppSetChatTor,
} from '../lib/xmpp-store';
import { checkedChatNotify } from '../lock/chat-notify';
import { openOwnSticker, type OwnSticker } from '../lock/sticker-data';
import { radius, space } from '../theme/colors';
import { softBubble, textSized } from '../theme/bubbles';
import type { ChatLook } from '../theme/chat-theme';
import { useColors, useTheme } from '../theme/context';
import { checkedLook } from '../theme/look';

// One XMPP chat (lib/xmpp-store.ts): its messages, oldest first, and a field to write in. It is
// marked as not anonymous, and as not encrypted when the person's apps have no OMEMO and the chat
// was chosen to go without it. Opening it, with Erevos on the screen, marks its messages read, and
// tells the other person's app when it asked; while it shows, what comes in it only sounds, and it
// can be muted or given sounds of its own (components/network-chat-notify.tsx). Photo and File send
// one through the server's HTTP upload, encrypted as the chat is (lib/xmpp-files.ts). The keys of
// their devices are listed below, to compare with them; one that came with another key has Accept,
// and nothing is written to it before (lib/xmpp.ts). The two tiles at the top call them
// (lib/xmpp-calls.ts), on the same call screen as Erevos's own calls. Opened from a hidden place's
// hidden chats (`hidden=1`) it is the place's own account's chat (lib/network-place.ts), whose
// calls are that account's, and no notifications, as a place's chats tell nothing outside the
// hidden chats.
//
// A group (lib/xmpp-muc.ts) is the same screen with its own words: its name and address, whether
// it is encrypted (a private group is, to every member; a channel is not), whether we are in it
// yet, its subject; each message says who wrote it and has no read marks. A private group we are
// in has call tiles too, which call in the group as Dino does (lib/xmpp-muji.ts), and a call going
// on in it can be joined, by its tile and by the line under its address; a channel has none.
// Below a private group are its members, each with their keys and a note when they have none, and
// for its admin Add people; Leave the group leaves it on the account's other apps too.
//
// A message held down opens its menu (components/message-menu.tsx), as in a Matrix chat: react to
// it, answer it, copy it, forward it to another XMPP chat of the account, pin it for this device
// only, choose it with others (components/select-bar.tsx: copy, forward or delete them together),
// and for one of ours change its words or delete it for everyone (lib/xmpp-actions.ts). An answer
// shows the message it is to above its words, which a tap goes to; a message changed says so, one
// forwarded too, and one taken back is only marked as such. The reactions are under it, tapped to
// react the same or take ours back. Messages pinned here show over the thread, one at a time, the
// latest first; a tap goes to it and shows the next. While the other person writes, their app may
// say so, and it shows; we are said to write only when the account says so, never in a group
// (components/say-typing.tsx).
//
// A sound is a voice message, as the other apps send one, played here with how long it lasts
// (components/network-file.tsx). Sticker sends one of Erevos's own, as its picture, or one of the
// stickers made here from photos (components/xmpp-stickers.tsx), as a photo. Who owns a group and
// who runs it is said beside them, and its owner sets its description.
//
// A place goes as a geo: link in the words, as Conversations sends one, and one that comes so shows
// as a place, with Open in maps on a phone. A link's preview (XEP-0511) goes beside words only in
// a chat written without encryption, and only when this phone makes previews (as for contacts);
// one that comes so shows under the words.
//
// Words show as XEP-0393 styles them (lib/text-style.ts), their web addresses tappable. Camera,
// Video and Contact card (a .vcf file) send as a file does, and in a group, @ offers who is in it
// and writes the name they have there (components/network-carry.tsx).
// A message held down can be starred too, on this device only, a photo that came kept as one of
// the owner's stickers, and a photo, sound or file saved into the Collection
// (components/keep-actions.tsx); Starred messages lists the chat's, and the chat opened at one
// (`at`) goes to it.
// What is typed and not sent is kept as the chat's draft, encrypted with the account, and shows on
// its row; Send held down holds it to go later from this phone, shown after the thread until then
// (components/chat-writing.tsx, lib/chat-writing.ts). One of ours that did not go is sent again, or
// deleted, from its menu; any message can be written into Chat with myself to remind (Remind me).

/** The place a message is, when its words are only a geo: link, as Conversations sends one. */
const placeIn = (message: XmppMessage) => (/^geo:\S+$/i.test(message.text.trim()) ? placeOfGeo(message.text.trim()) : null);

const MARKS = { sent: '✓', received: '✓✓', read: '✓✓✓' } as const;

/** A message in one line, for its menu, the strip over the field and the quote of an answer. */
function lineOf(message: XmppMessage): string {
  if (message.deleted) return t('Message deleted');
  if (message.locked) return t('Locked message');
  if (message.file) return isSound(message.file) ? t('Voice message') : message.file.name;
  if (placeIn(message)) return `📍 ${t('Location')}`;
  return shownLine(message.text).trim().split('\n')[0] || t('Message');
}

// Whether it has a menu: not one taken back, a call's line, or one still going or that did not go.
const menuable = (message: XmppMessage) => !message.deleted && !message.call && message.state !== 'sending' && message.state !== 'failed';
const copyable = (message: XmppMessage) => CAN_COPY && !!message.text && !message.file && !message.locked && !message.call && !message.deleted;
// One of ours that did not go: its menu sends it again, or deletes it here, where only it is.
const notSent = (message: XmppMessage) => message.mine && message.state === 'failed' && !message.deleted && !message.call;

/** An XMPP chat's screen, in the chat's own look or the space's (components/chat-look.tsx). */
export default function XmppChatScreen() {
  const [look, setLook] = useState<ChatLook | null>(null);
  return (
    <ChatScreen chat={look} header>
      <XmppChat onLook={setLook} />
    </ChatScreen>
  );
}

function XmppChat({ onLook }: { onLook: (chat: ChatLook | null) => void }) {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { jid: given, hidden, at } = useLocalSearchParams<{ jid?: string; hidden?: string; at?: string }>();
  const where = useNetworkWhere(hidden === '1');
  const jid = given?.toLowerCase();
  const [now, setNow] = useState(xmppNow(where));
  // What Send to handed this chat (app/share.tsx): its words in the message field, a photo or file sent at once.
  const sharedTo = hidden === '1' || !jid ? null : `xmpp:${jid}`;
  const sharedWords = useSharedWords(sharedTo);
  const [draft, setDraft] = useState(sharedWords);
  const [note, setNote] = useState('');
  // What could not be sent with OMEMO, a text, a file or a sticker, kept while the person decides about writing without it.
  const [unsent, setUnsent] = useState<{ text: string; to?: string; lasts?: number } | { file: XmppOutgoingFile } | { sticker: XmppSticker } | null>(null);
  // The next message to disappear, if it is to (components/chat-rules.tsx).
  const vanish = useVanishOnce();
  const [sending, setSending] = useState(false);
  // The message the next one answers or gives new words, and the one whose menu is open, by their IDs.
  const [replyId, setReplyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  // Whether the chat's own look shows its choices (components/chat-look.tsx).
  const [styling, setStyling] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [more, setMore] = useState(false);
  // Search in this chat, its media, Go to a day and Export chat (components/chat-history.tsx).
  const history = useHistoryTools();
  // Choosing when what is typed goes, and the message a reminder is being set for (components/chat-writing.tsx).
  const [choosingLater, setChoosingLater] = useState(false);
  const [reminding, setReminding] = useState<RemindOf | null>(null);
  // Counts who starts and stops writing, and the end of each while it shows, so the line under the thread follows.
  const [, setTyped] = useState(0);
  // A voice message recorded with the microphone (components/matrix-voice.tsx) goes as a file, as Conversations sends one.
  const sendVoice = useRef<(audio: Uint8Array, ms: number) => Promise<void>>(async () => undefined);
  const voice = useVoiceCapture({ send: (audio, ms) => sendVoice.current(audio, ms), say: setNote });
  const sendShared = useRef<(file: XmppOutgoingFile) => Promise<void>>(async () => undefined);
  useSharedFiles(now.state && jid && now.state.chats[jid] ? sharedTo : null, (file) => sendShared.current({ bytes: file.bytes, name: file.name, mime: file.mime }), (error) => setNote(error instanceof Error ? error.message : String(error)), () => undefined);
  // Messages chosen together, by their IDs; those being forwarded, while their chat is picked; which pin shows.
  const selection = useSelection<string>();
  const [forwarding, setForwarding] = useState<string[] | null>(null);
  const [pinShown, setPinShown] = useState(0);
  const [stickering, setStickering] = useState(false);
  // Tells the contact we write, only when the account says so (app/xmpp.tsx); never in a group.
  const sayTyping = useSayTyping(!!now.state?.sayTyping && !!jid && !now.state.chats[jid]?.room, (typing) => jid && xmppTyped(jid, typing));
  // Counts the changes of the group calls, so a call going on in the group shows as it starts and ends.
  const [, setCalls] = useState(0);
  const [placing, setPlacing] = useState(false);
  // How photos go, and whose contacts a contact card is chosen from (components/network-carry.tsx).
  const photos = usePhotoQuality();
  const among = useNetworkAmong(where);
  // Whether this phone makes the preview of a link it sends, and whether only through Tor (the space's settings).
  const [previews, setPreviews] = useState(false);
  const [previewsTor, setPreviewsTor] = useState(false);
  useEffect(() => {
    if (where !== 'space') return;
    loadCurrentSpaceData().then(
      (data) => {
        setPreviews(data.previews);
        setPreviewsTor(data.previewsTor === true);
      },
      () => setPreviews(false),
    );
  }, [where]);

  useEffect(() => onGroupCallChange(() => setCalls((n) => n + 1)), []);
  // Back ends the choosing, before it leaves the chat.
  const { on: choosing, clear: unchoose } = selection;
  useEffect(() => {
    if (!choosing) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      unchoose();
      return true;
    });
    return () => back.remove();
  }, [choosing, unchoose]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const off = onXmppTyping(() => {
      setTyped((n) => n + 1);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setTyped((n) => n + 1), TYPING_SHOWS + 100);
    });
    return () => {
      off();
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    runXmpp();
    setNow(xmppNow(where));
    return onXmppChange(() => setNow(xmppNow(where)));
  }, [where]);

  const state = now.state;
  const chat = jid && state ? state.chats[jid] : undefined;
  // What is typed is kept as the chat's draft, and comes back in the field when it opens again.
  const kept = useKeptDraft(state ? xmppWriting(where) : null, jid && isXmppId(jid) ? jid : undefined, (text) => setDraft((typed) => (typed.trim() ? typed : text)));
  // The chat's own look, told to the screen that draws it.
  const ownLook = useMemo(() => (chat?.look ? checkedLook(chat.look) : null), [chat?.look]);
  const lookChat = useMemo<ChatLook | null>(() => (jid && isXmppId(jid) ? { look: ownLook, save: (look) => xmppSetLook(jid, look) } : null), [ownLook, jid]);
  useEffect(() => onLook(lookChat), [onLook, lookChat]);
  // Locked with a PIN of its own, its screenshots blocked (components/chat-protect.tsx): not in a
  // hidden place's chats, which their own PIN guards. While its PIN asks, nothing of it shows or is read.
  const guard = useChatProtect({
    id: `xmpp:${jid ?? ''}`,
    name: state && jid ? nameOf(state, jid) : (jid ?? ''),
    pin: pinOf(chat),
    shots: shotsBlocked(chat),
    lockable: where === 'space' && !!state && !!jid && isXmppId(jid),
    save: (change) => (jid ? xmppSetGuard(jid, change) : Promise.resolve()),
    say: setNote,
    onBack: () => router.back(),
  });
  const count = chat?.messages.length ?? 0;
  // What is gone by the chat's rules leaves the screen at its time (lib/xmpp-rules.ts).
  const shownList = shownIn(chat);
  useGoneAt(nextGoesIn(chat));
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
  // A hidden place's chat is not told apart on the screen: nothing of it reaches the space's notices.
  const shown = useNetworkChatShown(!jid || guard.gated ? undefined : where === 'space' ? `xmpp:${jid}` : hiddenOnScreen()) && !guard.gated;
  useEffect(() => {
    if (shown && jid && chat?.unread) xmppRead(jid).catch(() => undefined);
  }, [shown, jid, count, chat?.unread]);
  // Their keys, or a private group's members', looked up as it opens, so they show before anything is written.
  const people = chat?.room ? (chat.room.private && state ? groupPeople(state, chat.room).join(' ') : '') : (jid ?? '');
  useEffect(() => {
    if (jid && people && now.online) xmppLookUpKeys(jid).catch(() => undefined);
  }, [jid, people, now.online]);
  // Whose stickers made from photos this chat sends: the space's, or its hidden place's own.
  const account = now.state?.jid;
  const stickerPlace = useMemo(() => (account ? xmppStickerPlace(where) : null), [where, account]);
  // Star, Add to my stickers and Save to the Collection, in a message's menu (components/keep-actions.tsx).
  const keep = useKeep({ service: 'xmpp', place: stickerPlace, account: account ?? '', chat: jid ?? '', group: !!chat?.room, messages: chat?.messages, say: setNote });

  if (guard.gate) return guard.gate;
  if (!state || !jid || !isXmppId(jid)) {
    return (
      <Page>
        <Text variant="title">XMPP</Text>
        <Text tone="muted">{now.loaded ? t('This XMPP chat is not here any more.') : ''}</Text>
      </Page>
    );
  }

  const fail = (error: unknown) => setNote(error instanceof Error ? error.message : String(error));
  // A hidden place's account keeps its warnings in its own hidden data, never the space's.
  const ipKeep = where !== 'space' ? { keep: hiddenKeep() } : {};

  // Before sending in the chat `to` while the account does not go through Tor now: its server sees
  // this phone's internet address then (lib/ip-warning.ts), said once a chat. The way not to:
  // «Through Tor» for that chat, where Erevos has Tor.
  const sendGate = (to: string) =>
    !state || accountThroughTor(xmppTorWay(state), true)
      ? Promise.resolve(true)
      : ipGate({ network: 'XMPP', act: 'send', of: `xmpp:${to}`, own: true, ...ipKeep }, canXmppTor() ? { label: t('Account through Tor'), run: () => throughTorNow(to) } : undefined);
  // Turns «Through Tor» on for the chat `to`, then waits, a minute at most, for the account to be
  // connected again, now through Tor, so what was being sent goes that way.
  async function throughTorNow(to: string) {
    await xmppSetChatTor(to, true);
    for (let waited = 0; waited < 60_000 && !xmppNow(where).online; waited += 500) await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // The preview of the first link in words typed: only in a chat without encryption (the preview
  // would tell the servers what the link is), when this phone makes them; only through Tor with
  // their own Tor switch on, else never while the space, or the account, sends everything through Tor.
  async function previewOf(text: string) {
    const way = where === 'space' && CAN_PREVIEW && chat && plainIn(chat) ? previewWay(previews, previewsTor, throughTor()) : 'none';
    // An account that goes only through Tor makes previews only through Tor too.
    if (way === 'straight' && state && accountNeverStraight(xmppTorWay(state))) return null;
    const link = way !== 'none' ? firstLink(text) : null;
    if (!link) return null;
    // Made straight, the site sees this phone's address: said first; not gone on, it goes without one.
    if (way === 'straight' && !(await ipGate({ network: 'XMPP', act: 'preview', of: 'xmpp', ...ipKeep }))) return null;
    setNote(t('Making the link’s preview…'));
    const made = await makePreview(link, way === 'tor');
    setNote('');
    return made ? fitPreview(text, made) : null;
  }

  // One to disappear (`lasts` seconds after it went) has its own time once it went (lib/xmpp-rules.ts markSent).
  async function send(text: string, to?: string, lasts = 0) {
    if (!jid) return;
    setNote('');
    // Not gone on: the words come back in the field, not lost.
    if (!(await sendGate(jid))) {
      setDraft((typed) => (typed.trim() ? typed : text));
      return;
    }
    try {
      const before = lasts ? await xmppAct(async (s) => idsIn(s, jid)) : null;
      await (to ? xmppReply(jid, text, to) : xmppSend(jid, text, to ? null : await previewOf(text)));
      if (before) await xmppAct(async (s) => markSent(s, jid, before, lasts));
    } catch (error) {
      // Their apps have no OMEMO: the text waits for the person to say whether to write without it,
      // which the card below explains.
      if (error instanceof NoOmemoError) setUnsent({ text, ...(to ? { to } : {}), ...(lasts ? { lasts } : {}) });
      else fail(error);
    }
  }

  sendVoice.current = (audio, ms) => sendFile({ bytes: audio, ...voiceNamed(audio), duration: ms });
  sendShared.current = sendFile;

  // Sends a sticker made from a photo, as a photo.
  async function sendOwnSticker(sticker: OwnSticker) {
    setStickering(false);
    try {
      const picture = await openOwnSticker(sticker);
      if (!picture) throw new Error(t('This sticker\'s picture is gone.'));
      const { mime, w, h } = stickerMeta(picture);
      await sendSticker({ bytes: picture, mime: mime === 'image/png' ? 'image/png' : 'image/jpeg', w: w ?? 0, h: h ?? 0 });
    } catch (error) {
      fail(error);
    }
  }

  // Sends a sticker's picture, whatever made it (lib/xmpp-store.ts xmppSendSticker).
  function sendSticker(sticker: XmppSticker) {
    return sendOut({ sticker });
  }

  function sendFile(file: XmppOutgoingFile) {
    return sendOut({ file });
  }

  async function sendOut(held: { file: XmppOutgoingFile } | { sticker: XmppSticker }) {
    if (!jid) return;
    setNote('');
    if (!(await sendGate(jid))) return;
    setSending(true);
    try {
      await ('sticker' in held ? xmppSendSticker(jid, held.sticker) : xmppSendFile(jid, held.file));
    } catch (error) {
      if (error instanceof NoOmemoError) setUnsent(held);
      else fail(error);
    } finally {
      setSending(false);
    }
  }

  async function sendPicked(pick: () => Promise<XmppOutgoingFile | null>) {
    try {
      const file = await pick();
      if (file) await sendFile(file);
    } catch (error) {
      fail(error);
    }
  }
  const sendPhoto = (from: 'photos' | 'camera' = 'photos') =>
    sendPicked(async () => {
      const photo = await pickPhoto(from, photos.quality);
      return photo ? { bytes: photo.bytes, name: photo.name, mime: photo.mime } : null;
    });
  // A video and a contact card (a .vcf) go as files do, by the server's HTTP upload.
  const sendVideo = () =>
    sendPicked(async () => {
      const video = await pickVideo(XMPP_FILE_MOST);
      return video ? { bytes: video.bytes, name: video.name, mime: video.mime } : null;
    });
  const sendCard = (card: string) => sendPicked(async () => cardFile(card));
  const sendAnyFile = () =>
    sendPicked(async () => {
      const picked = await pickFile(XMPP_FILE_MOST);
      return picked ? { ...picked, mime: mimeOfName(picked.name) } : null;
    });

  const byId = new Map((chat?.messages ?? []).map((message) => [message.id, message]));
  // One that is gone or taken back meanwhile is none: what is typed then goes as a new message.
  const replying = replyId ? byId.get(replyId) : undefined;
  const answered = replying && !replying.deleted ? replying : undefined;
  const editing = editId ? byId.get(editId) : undefined;
  const changed = editing && !editing.deleted && editing.mine ? editing : undefined;
  const menuMessage = menuFor ? byId.get(menuFor) : undefined;
  const me = state.jid;
  const writerOf = (message: XmppMessage) => (message.mine ? t('You') : chat?.room ? message.by || jid : nameOf(state, jid));

  // The words typed before the change come back in the field.
  const stopEditing = () => {
    setEditId(null);
    setDraft(kept.initial());
  };

  // What is typed goes as a new message, as an answer to the one chosen, or as the new words of the
  // one being changed.
  function submit() {
    const text = draft.trim();
    if (!text || !jid) return;
    if (changed) {
      setNote('');
      xmppChange(jid, changed.id, text).then(stopEditing, fail);
      return;
    }
    setDraft('');
    kept.sent();
    setReplyId(null);
    sayTyping.sent();
    void send(text, answered?.id, vanish.lasts());
  }

  // Holds what is typed to go at `at` from this phone (lib/chat-writing.ts), as an answer to the one chosen.
  async function sendLater(at: number) {
    setChoosingLater(false);
    const text = draft.trim();
    if (!text || !jid) return;
    if (await keepForLater(xmppWriting(where), { chat: jid, text, at, ...(answered ? { replyTo: answered.id } : {}) }, setNote)) {
      setDraft('');
      kept.sent();
      setReplyId(null);
    }
  }

  function sendPlace(place: Place) {
    setPlacing(false);
    void send(geoUri(place));
  }

  const react = (id: string, emoji: string) => {
    if (jid) xmppReact(jid, id, emoji).catch(fail);
  };

  async function copy(text: string) {
    setNote((await copyText(text)) ? t('Copied. Any app that reads the clipboard can read it now.') : t('Not copied.'));
  }

  // Deletes messages, once asked: from this phone only (lib/xmpp-rules.ts hideIn), or, all of them
  // ours, taken back for everyone in the chat, one after another.
  function remove(messages: XmppMessage[]) {
    if (!jid || !messages.length) return;
    const ids = messages.map((message) => message.id);
    const here = () => {
      selection.clear();
      xmppAct(async (s) => hideIn(s, jid, ids)).catch(fail);
    };
    const everyone = async () => {
      selection.clear();
      for (const message of messages) {
        try {
          await xmppDelete(jid, message.id);
        } catch (error) {
          setNote(t('Not deleted. {reason}', { reason: error instanceof Error ? error.message : String(error) }));
          return;
        }
      }
    };
    askDelete(messages.length, here, messages.every(deletable) ? () => void everyone() : undefined);
  }

  // Goes to a message of the thread by its ID, as an answer's quote or a pin is tapped.
  function reach(id: string) {
    if (byId.has(id)) goTo(id);
    else setNote(t('That message is not on this phone.'));
  }

  // Sends copies of the messages being forwarded to the chat `to`, the oldest first.
  function forwardTo(to: string) {
    const messages = (forwarding ?? []).map((id) => byId.get(id)).filter((m): m is XmppMessage => !!m);
    setForwarding(null);
    selection.clear();
    if (!messages.length || !state) return;
    void (async () => {
      if (!(await sendGate(to))) return;
      setNote(t('Forwarding…'));
      await xmppForward(to, messages);
      setNote(t('Forwarded to {name}.', { name: nameOf(state, to) }));
    })().catch(fail);
  }

  // Whether a message can be deleted for everyone: one of ours, which in a group the room named.
  const deletable = (message: XmppMessage) => message.mine && menuable(message) && (!chat?.room || !!message.sid);

  // What can be done with a message, held down. In a group, reacting, answering and deleting wait
  // for the room's ID of it; changing and deleting are for our own, and changing for words only.
  function actionsOf(message: XmppMessage): MenuAction[] {
    const actions: MenuAction[] = [];
    if (notSent(message)) {
      if (copyable(message)) actions.push({ title: t('Copy'), onPress: () => void copy(message.text) });
      actions.push({ title: t('Send again'), onPress: () => jid && void sendGate(jid).then((go) => (go ? xmppSendAgain(jid, message.id) : undefined)).catch(fail) });
      actions.push({ title: t('Delete'), danger: true, onPress: () => jid && void xmppDropUnsent(jid, message.id).catch(fail) });
      return actions;
    }
    const named = !chat?.room || !!message.sid;
    if (named) {
      actions.push({
        title: t('Reply'),
        onPress: () => {
          if (editId) stopEditing();
          setReplyId(message.id);
        },
      });
    }
    if (copyable(message)) actions.push({ title: t('Copy'), onPress: () => void copy(message.text) });
    if (forwardable(message)) actions.push({ title: t('Forward'), onPress: () => setForwarding([message.id]) });
    const pinned = pins.includes(message.id);
    actions.push({ title: pinned ? t('Unpin') : t('Pin for me'), onPress: () => jid && void xmppPin(jid, message.id, !pinned).catch(fail) });
    if (remindPlace(where) && state && jid) {
      const from = chat?.room ? `XMPP · ${nameOf(state, jid)} · ${writerOf(message)}` : `XMPP · ${nameOf(state, jid)}`;
      const text = message.text && !message.file && !message.locked && !placeIn(message) ? message.text : lineOf(message);
      actions.push({ title: t('Remind me'), onPress: () => setReminding({ from, text }) });
    }
    if (message.mine && !message.file && !message.locked) {
      actions.push({
        title: t('Edit'),
        onPress: () => {
          setReplyId(null);
          setEditId(message.id);
          setDraft(message.text);
        },
      });
    }
    const file = message.file && !message.locked ? message.file : undefined;
    actions.push(
      ...keep.actions({
        star: message.locked ? null : { id: message.id, at: message.at, mine: message.mine, line: lineOf(message) },
        sticker: file && shownType(file).startsWith('image/') ? () => fetchFile(file) : null,
        file: file ? { name: file.name, mime: shownType(file), fetch: () => fetchFile(file) } : null,
        remote: true,
      }),
    );
    actions.push(selectAction(() => selection.start(message.id)));
    actions.push({ title: t('Delete'), danger: true, onPress: () => remove([message]) });
    return actions;
  }

  // The message an answer is to, as the answer quotes it: null when it is not here.
  const answeredBy = (message: XmppMessage): Answer | null | undefined => {
    if (!message.replyTo) return undefined;
    const to = byId.get(message.replyTo);
    return to ? { name: writerOf(to), line: lineOf(to), onPress: () => reach(to.id) } : null;
  };

  // The messages chosen, the oldest first, and what can be done to them all.
  const chosen = (chat?.messages ?? []).filter((message) => selection.chosen.has(message.id));
  const copied = chosen.filter(copyable);
  const forwarded = chosen.filter(forwardable);
  // The pins that still show, the latest last; the one shown, the latest first.
  const pins = pinsShown(chat?.pins, chat?.messages ?? []);
  const pinAt = pins.length ? Math.min(pinShown, pins.length - 1) : 0;
  const pinId = pins.length ? pins[pins.length - 1 - pinAt] : null;

  async function call(video: boolean) {
    if (!jid) return;
    setNote('');
    if (currentCall() || currentGroupCall()) {
      setNote(t('There is a call already.'));
      return;
    }
    // A call never goes through Tor: the call relay sees this phone's address.
    if (!(await ipGate({ network: 'XMPP', act: 'call', of: `xmpp:${jid}`, ...ipKeep }))) return;
    if (!(await callPermissions(video))) {
      setNote(video ? t('A video call needs the camera and the microphone.') : t('A call needs the microphone.'));
      return;
    }
    await startXmppCall(jid, video, rtc, where === 'place').catch(fail);
  }

  // Starts a call in the private group, or joins the one going on, as it is: voice or video.
  async function callGroup(asked: boolean) {
    if (!jid) return;
    setNote('');
    if (currentCall() || currentGroupCall()) {
      setNote(t('There is a call already.'));
      return;
    }
    const calls = where === 'place' ? xmppPlaceGroupCalls : xmppGroupCalls;
    const going = groupCallGoingOn(jid);
    const video = going ? going.video : asked;
    if (!(await ipGate({ network: 'XMPP', act: 'call', of: `xmpp:${jid}`, ...ipKeep }))) return;
    if (!(await callPermissions(video))) {
      setNote(video ? t('A video call needs the camera and the microphone.') : t('A call needs the microphone.'));
      return;
    }
    try {
      const relay = await calls.callRelay();
      if (going) await joinGroupCall(calls, jid, relay, rtc);
      else await startGroupCall(calls, jid, video, relay, rtc);
    } catch (error) {
      fail(error);
    }
  }

  const name = nameOf(state, jid);
  const room = chat?.room;
  // A private group is encrypted to every member, a channel never is, and any other chat may be chosen to go without.
  const channel = !!room && !room.private;
  const plain = !!chat?.plain;
  const devices = xmppDevices(state, jid);
  const blocked = isBlocked(state, jid);
  // A private group we are in has call tiles, and one going on in it can be joined.
  const groupCalls = !!(room?.private && room.joined);
  const going = groupCalls ? groupCallGoingOn(jid) : null;
  // Whether they are online, as their devices say, while connected: only of a contact who let us see it.
  const presence = room || !now.online ? '' : presenceText(xmppPresence(state, jid));
  const how = channel
    ? t('XMPP channel · not encrypted: everyone in it, and the servers, can read it')
    : plain
      ? t('Not encrypted: the XMPP server can read this chat.')
      : room
        ? t('XMPP group · encrypted with OMEMO for every member, not anonymous')
        : t('XMPP · encrypted with OMEMO, not anonymous');
  // In a group, who is in it now, as @ offers them: by the name they have there, as its apps name them.
  const nicks: Nameable[] = room?.joined ? Object.keys(room.occupants).filter((nick) => nick !== room.nick).map((nick) => ({ identity: nick, name: nick })) : [];
  // Where what is forwarded can go: the account's other chats, a group only once joined.
  const targets = xmppChatList(state).filter((other) => other.jid !== jid && (!other.room || other.room.joined) && !isBlocked(state, other.jid));
  // The chat's name, its calls and who is online: fixed over the thread, it stays while the thread scrolls (#12).
  const top = (
    <View style={{ gap: space.xs }}>
      <Row>
        <Text variant="title" numberOfLines={2} style={{ flex: 1 }}>
          {name}
        </Text>
        {room ? null : (
          <>
            <ShortcutTile label={t('Video call')} tint="blue" onPress={() => void call(true)}>
              <VideoSign />
            </ShortcutTile>
            <ShortcutTile label={t('Voice call')} tint="green" onPress={() => void call(false)}>
              <PhoneSign />
            </ShortcutTile>
          </>
        )}
        {/* In a private group: a video call and a voice call; one going on is joined as it is, by its own tile alone. */}
        {groupCalls ? (
          going ? (
            going.video ? (
              <ShortcutTile label={t('A group video call is going on · Join')} tint="blue" onPress={() => void callGroup(true)}>
                <VideoSign />
              </ShortcutTile>
            ) : (
              <ShortcutTile label={t('A group call is going on · Join')} tint="green" onPress={() => void callGroup(false)}>
                <PhoneSign />
              </ShortcutTile>
            )
          ) : (
            <>
              <ShortcutTile label={t('Video call')} tint="blue" onPress={() => void callGroup(true)}>
                <VideoSign />
              </ShortcutTile>
              <ShortcutTile label={t('Voice call')} tint="green" onPress={() => void callGroup(false)}>
                <PhoneSign />
              </ShortcutTile>
            </>
          )
        ) : null}
        <IconButton label={t('More')} onPress={() => setMore(true)}>
          <MoreIcon color={colors.text} />
        </IconButton>
      </Row>
      {presence ? (
        <Text variant="caption" numberOfLines={2}>
          {presence}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {selection.on ? (
        <SelectBar
          count={selection.chosen.size}
          onCancel={selection.clear}
          onAll={() => selection.set((chat?.messages ?? []).filter(menuable).map((message) => message.id))}
          onCopy={
            copied.length
              ? () => {
                  selection.clear();
                  void copy(copied.map((message) => message.text).join('\n\n'));
                }
              : undefined
          }
          onForward={forwarded.length ? () => setForwarding(forwarded.map((message) => message.id)) : undefined}
          onDelete={chosen.length ? () => remove(chosen) : undefined}
        />
      ) : null}
      <ChatHistory
        tools={history}
        name={name}
        messages={() => xmppHistory(chat?.messages ?? [], me, (address) => nameOf(state, address), !!room)}
        goTo={(id) => {
          goTo(id);
          return true;
        }}
        exportable={where === 'space'}
        shown={shown}
        say={setNote}
      />
      {withArrows(
        <KeyboardAwareScrollView
          ref={scroll}
          style={{ flex: 1, backgroundColor: colors.ground }}
          // As Page (components/ui.tsx) has it.
          contentContainerStyle={{ width: '100%', maxWidth: 760, alignSelf: 'center', padding: space.xl - 4, paddingBottom: insets.bottom + space.xl, gap: space.md }}
          keyboardShouldPersistTaps="handled"
          bottomOffset={space.xl}
          {...scrollProps}
        >
          <Text variant="caption" tone="muted">
            {jid}
          </Text>
          <Text variant="caption" tone="muted">
            {how}
          </Text>
          {going ? (
            <TextButton
              title={going.video ? t('A group video call is going on · Join') : t('A group call is going on · Join')}
              onPress={() => void callGroup(going.video)}
            />
          ) : null}
          {plain ? <Button title={t('Encrypt again')} kind="secondary" compact onPress={() => xmppSetPlain(jid, false).catch(fail)} /> : null}
          {room && !room.joined ? (
            <Text variant="caption" tone="muted">
              {room.problem || t('Not in this group yet: joining it.')}
            </Text>
          ) : null}
          {room?.subject ? <Text selectable>{room.subject}</Text> : null}
          {room?.description ? (
            <Text variant="caption" tone="muted" selectable>
              {room.description}
            </Text>
          ) : null}
          {pinId ? (
            <Pinned
              index={pinAt}
              count={pins.length}
              line={byId.get(pinId) ? lineOf(byId.get(pinId)!) : ''}
              onPress={() => {
                reach(pinId);
                setPinShown((pinAt + 1) % pins.length);
              }}
            />
          ) : null}

          <View style={{ gap: space.md }} {...threadProps}>
            {shownList.map((message) => {
              // While messages are chosen, a tap or a hold on one adds it or takes it out.
              const choose = selection.on && menuable(message) ? () => selection.toggle(message.id) : undefined;
              return (
                <Bubble
                  key={message.id}
                  message={message}
                  group={!!room}
                  me={me}
                  answered={answeredBy(message)}
                  chosen={selection.chosen.has(message.id)}
                  onPress={choose}
                  onReact={menuable(message) && (!room || message.sid) ? (emoji) => react(message.id, emoji) : undefined}
                  onMenu={selection.on ? choose : menuable(message) || notSent(message) ? () => setMenuFor(message.id) : undefined}
                  onDuration={(ms) => void xmppHeard(jid, message.id, ms).catch(() => undefined)}
                  onLayout={place(message.id)}
                  starred={keep.starred.has(message.id)}
                />
              );
            })}
          </View>
          <HeldBubbles held={heldIn(state.writing, jid)} account={() => xmppWriting(where)} say={setNote} />
          {!room && xmppTyping(jid) ? (
            <Text variant="caption" tone="muted">
              {name} · {t('typing…')}
            </Text>
          ) : null}

          {unsent !== null ? (
            <Card>
              <Text>
                {room
                  ? t('Nobody in this group has an app with OMEMO that Erevos can find. You can write without encryption: the XMPP servers, and anyone who can read what passes through them, can then read it.')
                  : t('{name} has no app with OMEMO that Erevos can find. You can write to them without encryption: the XMPP server, and anyone who can read what passes through it, can then read it.', { name })}
              </Text>
              <Row wrap>
                <Button
                  title={t('Write without encryption')}
                  compact
                  onPress={() => {
                    const held = unsent;
                    setUnsent(null);
                    setNote('');
                    xmppSetPlain(jid, true)
                      .then(() => ('text' in held ? send(held.text, held.to, held.lasts) : sendOut(held)))
                      .catch(fail);
                  }}
                />
                <Button
                  title={t('Cancel')}
                  kind="secondary"
                  compact
                  onPress={() => {
                    if ('text' in unsent) {
                      setDraft(unsent.text);
                      kept.typed(unsent.text);
                    }
                    setUnsent(null);
                    setNote('');
                  }}
                />
              </Row>
            </Card>
          ) : null}

          {answered ? <Quote name={writerOf(answered)} line={lineOf(answered)} onPress={() => reach(answered.id)} onClose={() => setReplyId(null)} /> : null}
          {changed ? <Quote name={t('Edit message')} line={lineOf(changed)} onClose={stopEditing} /> : null}
          {vanish.on && !changed ? <VanishStrip seconds={vanish.seconds} note={t('It goes from this phone only: they keep it.')} onChoose={vanish.choose} onClose={vanish.off} /> : null}
          <MentionChips text={draft} members={nicks} onPick={(member) => setDraft(withNick(draft, member.name))} />
          <Row>
            <Input
              style={{ flex: 1 }}
              value={draft}
              onChangeText={(text) => {
                setDraft(text);
                sayTyping.typed(text);
                // A message being changed is not a draft: its words stay with it.
                if (!changed) kept.typed(text);
              }}
              multiline
              placeholder={t('Message')}
              accessibilityLabel={changed ? t('Edit message') : t('Message')}
            />
            <Button
              title={changed ? t('Save') : t('Send')}
              compact
              disabled={!draft.trim() || unsent !== null}
              onPress={submit}
              // Held down: what is typed goes later.
              onLongPress={!changed && draft.trim() && unsent === null ? () => setChoosingLater(true) : undefined}
            />
          </Row>
          <LaterSheet visible={choosingLater} where={where} onClose={() => setChoosingLater(false)} onPick={(at) => void sendLater(at)} />
          <RemindSheet of={reminding} where={where} onClose={() => setReminding(null)} say={setNote} />
          <Row {...endProps}>
            {voice.recording ? (
              <RecordingLine />
            ) : (
              <>
                {!changed ? (
                  <IconButton label={t('Attach and more')} onPress={() => setAttaching(true)} disabled={sending || unsent !== null}>
                    <PlusIcon color={colors.text} size={22} />
                  </IconButton>
                ) : null}
                {sending ? <Text tone="muted">{t('Sending…')}</Text> : <View style={{ flex: 1 }} />}
              </>
            )}
            {/* The chat's options, beside the field, where a long chat keeps them in reach (#44). */}
            <IconButton label={t('Chat options')} onPress={() => setMore(true)}>
              <OptionsIcon color={colors.text} size={22} />
            </IconButton>
            <MicButton voice={voice} disabled={sending || unsent !== null || !!changed} />
          </Row>
          {note || now.problem ? <Text tone="muted">{note || now.problem}</Text> : null}
          <PlaceSheet visible={placing} onClose={() => setPlacing(false)} onSend={sendPlace} said={channel ? t('Everyone in this group can see it, and the servers.') : t('Everyone in this chat can see it.')} />
          <XmppStickerSheet
            visible={stickering}
            onClose={() => setStickering(false)}
            place={stickerPlace}
            onPick={(sticker) => void sendOwnSticker(sticker)}
            onBuiltIn={(sticker) => {
              setStickering(false);
              void sendSticker(sticker);
            }}
          />
          <Sheet visible={forwarding !== null} onClose={() => setForwarding(null)} title={t('Forward to')}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 380 }} contentContainerStyle={{ gap: space.xs }} keyboardShouldPersistTaps="handled">
              {targets.map((other) => (
                <Button
                  key={other.jid}
                  // A copy into a chat not encrypted is read by its server: said beside its name.
                  title={plainIn(other) ? `${nameOf(state, other.jid)} · ${t('not encrypted')}` : nameOf(state, other.jid)}
                  kind="secondary"
                  onPress={() => forwardTo(other.jid)}
                />
              ))}
              {targets.length ? null : <Text tone="muted">{t('No chats yet')}</Text>}
            </ScrollView>
          </Sheet>
          <ChatLookSheet visible={styling} onClose={() => setStyling(false)} name={name} chat={lookChat} />
          <Sheet visible={attaching} onClose={() => setAttaching(false)} title={t('Attach and more')}>
            <View style={{ gap: space.sm }}>
              <Row wrap>
                <Button title={t('Photo')} kind="secondary" compact disabled={sending || unsent !== null || !!changed} onPress={() => { setAttaching(false); void sendPhoto(); }} />
                <Button title={t('File')} kind="secondary" compact disabled={sending || unsent !== null || !!changed} onPress={() => { setAttaching(false); void sendAnyFile(); }} />
                <Button title={t('Location')} kind="secondary" compact disabled={sending || unsent !== null} onPress={() => { setAttaching(false); setPlacing(true); }} />
                <Button title={t('Sticker')} kind="secondary" compact disabled={sending || unsent !== null || !stickerPlace} onPress={() => { setAttaching(false); setStickering(true); }} />
                <CarryButtons
                  disabled={sending || unsent !== null}
                  photos={photos}
                  among={among}
                  foot={channel || plain ? how : undefined}
                  onCamera={() => { setAttaching(false); void sendPhoto('camera'); }}
                  onVideo={() => { setAttaching(false); void sendVideo(); }}
                  onCard={(card) => { setAttaching(false); void sendCard(card); }}
                />
                {vanish.on ? null : <Button title={t('Disappear')} kind="secondary" compact onPress={() => { setAttaching(false); vanish.toggle(); }} />}
              </Row>
            </View>
          </Sheet>
          <Sheet visible={more} onClose={() => setMore(false)} title={t('Chat options')}>
            <View style={{ gap: space.md }}>
              {channel ? (
                <Text variant="caption" tone="muted">
                  {t('A channel tells only of messages that name you.')}
                </Text>
              ) : null}
              <OptionList title={t('This chat')}>
                <NetworkChatNotify notify={checkedChatNotify(chat?.notify)} hidden={where !== 'space'} onChange={(next) => xmppSetNotify(jid, next)} />
                <Button title={t('Chat look')} kind="secondary" compact onPress={() => {
                    setMore(false);
                    setStyling(true);
                  }} />
                <StarredHere stars={keep.stars} who={name} onGo={reach} onGoing={() => setMore(false)} />
                {guard.buttons}
                <ChatTimer
                  seconds={vanishTimer(rulesOf(chat))}
                  note={t('New messages, sent or received, go from this phone only, that long after they were sent. The other side keeps them: XMPP has no way to delete them there. Messages already here stay.')}
                  onChoose={(after) => void xmppAct(async (s) => setTimerIn(s, jid, after)).catch(fail)}
                  onChosen={() => setMore(false)}
                />
              </OptionList>
              <OptionList title={t('Find')}>
                <HistoryButtons tools={history} exportable={where === 'space'} onRun={() => setMore(false)} />
              </OptionList>
              {/* «Through Tor» for this chat or group: one connection carries the account's chats, so the whole account then goes only through Tor. Off unless turned on. */}
              {canXmppTor() ? <ChatTorSwitch network="XMPP" on={chat?.tor === true} disabled={!state} onChange={(on) => void xmppSetChatTor(jid, on).catch(fail)} /> : null}
              {/* A contact's name of our own: their item's in the account's contacts, which its other apps show too. */}
              {!room && state.roster[jid] ? (
                <OwnName
                  label={t('Name them here')}
                  current={state.roster[jid].name ?? ''}
                  placeholder={jid}
                  max={XMPP_CONTACT_NAME}
                  hint={t('Kept in your contacts on your XMPP server, so your other XMPP apps show it too. They are not told. Empty, their address shows again.')}
                  onSave={(named) => xmppRenameContact(jid, named)}
                />
              ) : null}

              {room?.admin && room.joined ? <GroupAdmin state={state} jid={jid} room={room} fail={fail} /> : null}
              {room?.private ? <Members state={state} jid={jid} room={room} fail={fail} /> : null}
              {!room && devices.length ? (
                <>
                  <SectionTitle title={t('Their keys')} />
                  <Card>
                    <Text tone="muted">{t('Compare these with what their app shows, by another way than this chat, to be sure nobody sits in between.')}</Text>
                    <Keys jid={jid} devices={devices} fail={fail} />
                    <CheckInPerson
                      checked={devices.some((d) => d.checked) && devices.every((d) => d.checked || !d.identity || !d.listed)}
                      code={ownCode(state)}
                      about={t('Their XMPP app shows a code of their address and keys, as Conversations does: take a photo of it here, and each of their devices whose key matches is marked checked. Let their app take a photo of this code too. Nothing is sent.')}
                      check={async (text) => checkedSaid(await xmppAct(async (s) => checkByCode(s, jid, text)))}
                      onUncheck={() => void xmppAct(async (s) => uncheck(s, jid)).catch(fail)}
                    />
                  </Card>
                </>
              ) : null}

              {room || blocked ? null : (
                <SwitchLine
                  title={t('Appear offline')}
                  on={unseenBy(state, jid)}
                  note={t('Your XMPP account shows them offline, whatever it shows everyone else, and tells them nothing of what you read or type, nor that their messages arrived. A group you share still shows you.')}
                  onPress={() => void xmppAct((s, connection) => setUnseen(s, connection, jid, !unseenBy(s, jid))).catch(fail)}
                />
              )}
              {room ? null : blocked ? (
                <>
                  <Text variant="caption" tone="muted">
                    {t('Blocked: nothing of theirs reaches your XMPP account, in any of its apps.')}
                  </Text>
                  <Button
                    title={t('Unblock')}
                    kind="secondary"
                    onPress={() => {
                      setMore(false);
                      void xmppBlock(jid, false).catch(fail);
                    }}
                  />
                </>
              ) : (
                <Button
                  title={t('Block')}
                  kind="secondary"
                  onPress={() =>
                    ask(t('Block {name}?', { name }), t('Their messages, calls and requests no longer reach your XMPP account, in any of its apps. They are not told.'), [
                      { text: t('Cancel'), style: 'cancel' },
                      {
                        text: t('Block'),
                        style: 'destructive',
                        onPress: () => {
                          setMore(false);
                          void xmppBlock(jid, true).catch(fail);
                        },
                      },
                    ])
                  }
                />
              )}
              {room ? (
                <Button
                  title={t('Leave the group')}
                  kind="secondary"
                  onPress={() =>
                    ask(t('Leave this group?'), t('Its messages are removed from this phone, and the other XMPP apps of your account leave the group too.'), [
                      { text: t('Cancel'), style: 'cancel' },
                      {
                        text: t('Leave'),
                        style: 'destructive',
                        onPress: () =>
                          void xmppLeaveGroup(jid)
                            .then(() => router.back())
                            .catch(fail),
                      },
                    ])
                  }
                />
              ) : (
                <Button
                  title={t('Remove this chat')}
                  kind="secondary"
                  onPress={() =>
                    ask(t('Remove this chat?'), t('Its messages are removed from this phone. The contact stays in your XMPP account, and the other person keeps theirs.'), [
                      { text: t('Cancel'), style: 'cancel' },
                      {
                        text: t('Remove'),
                        style: 'destructive',
                        onPress: () =>
                          void xmppForgetChat(jid)
                            .then(() => router.back())
                            .catch(fail),
                      },
                    ])
                  }
                />
              )}
            </View>
          </Sheet>
          <MessageMenu
            visible={!!menuMessage && (menuable(menuMessage) || notSent(menuMessage)) && shown}
            onClose={() => setMenuFor(null)}
            line={menuMessage ? lineOf(menuMessage) : ''}
            reaction={menuMessage?.reacted?.[me]?.[0]}
            onReact={menuMessage && menuable(menuMessage) && (!room || menuMessage.sid) ? (emoji) => react(menuMessage.id, emoji) : undefined}
            actions={menuMessage ? actionsOf(menuMessage) : []}
          />
        </KeyboardAwareScrollView>,
        top,
      )}
    </View>
  );
}

type Devices = ReturnType<typeof xmppDevices>;

/** What a photo of their code showed (lib/xmpp-rules.ts checkByCode). */
function checkedSaid(result: CheckResult): string {
  if (result.kind === 'checked') return t('It matches: no one is in between. Now let them take a photo of the code on this phone, so their phone checks you too.');
  if (result.kind === 'differs') return t('A key in the code is not the one this phone has for them. Someone may be in between, or they changed their app: ask them. Nothing was marked.');
  if (result.kind === 'unknown') return t('None of the keys in the code is one this phone knows for them yet. Write to them once, then take the photo again.');
  if (result.kind === 'other') return t('That is the code of {address}, not of this chat.', { address: result.jid });
  if (result.kind === 'own') return t('That is the code this phone shows. Take a photo of the code on their phone.');
  return t('That QR code is not a code to check a contact by.');
}

// A person's devices, each with its key to compare, whether it changed, and whether it is still
// listed. One that came with another key gets nothing written to it until that key is accepted
// here, after comparing it (lib/xmpp.ts acceptXmppDevice).
function Keys({ jid, devices, fail }: { jid: string; devices: Devices; fail: (error: unknown) => void }) {
  return (
    <>
      {devices.map((device) => (
        <View key={`${device.two ? 2 : 1}-${device.id}`} style={{ gap: 2 }}>
          <Text selectable variant="bodyStrong" style={{ fontFamily: 'monospace' }}>
            {device.identity ? fingerprint(device.identity) : t('Not seen yet')}
          </Text>
          {device.two ? (
            <Text variant="caption" tone="muted">
              {t('OMEMO 2, as Kaidan shows it.')}
            </Text>
          ) : null}
          {device.changed ? (
            <Text variant="caption" tone="muted">
              {t('This key changed since it was first seen.')}
            </Text>
          ) : null}
          {device.checked ? <Text variant="caption">✓ {t('Checked in person')}</Text> : null}
          {device.pending ? (
            <Row>
              <Button title={t('Accept')} kind="secondary" compact onPress={() => xmppAcceptDevice(jid, device.id, !!device.two).catch(fail)} />
            </Row>
          ) : null}
          {!device.listed ? (
            <Text variant="caption" tone="faint">
              {t('No longer in their device list.')}
            </Text>
          ) : null}
        </View>
      ))}
    </>
  );
}

/** Whether someone owns the group or runs it, beside their name; nothing for anyone else. */
function Rank({ room, address }: { room: XmppRoom; address: string }) {
  const colors = useColors();
  const rank = rankOf(room, address);
  if (!rank) return null;
  return (
    <Text variant="caption" color={colors.accentText}>
      {rank === 'owner' ? t('owner') : t('admin')}
    </Text>
  );
}

// What a group's admin may do besides adding people: the subject, and for its owner the name and
// the description; and in a channel, the people in it now, each of whom can be put out.
function GroupAdmin({ state, jid, room, fail }: { state: XmppState; jid: string; room: XmppRoom; fail: (error: unknown) => void }) {
  const [subject, setSubject] = useState(room.subject ?? '');
  const [name, setName] = useState(room.name ?? '');
  const [description, setDescription] = useState(room.description ?? '');
  const [busy, setBusy] = useState(false);
  const run = (work: () => Promise<void>) => {
    setBusy(true);
    work().catch(fail).finally(() => setBusy(false));
  };
  const nicks = room.private ? [] : Object.keys(room.occupants).filter((nick) => nick !== room.nick);
  return (
    <>
      <SectionTitle title={t('Run the group')} />
      <Card>
        <Row>
          <Input style={{ flex: 1 }} value={subject} onChangeText={setSubject} placeholder={t('Subject')} accessibilityLabel={t('Subject')} />
          <Button title={t('Save')} compact disabled={busy || subject.trim() === (room.subject ?? '')} onPress={() => run(() => xmppSetSubject(jid, subject))} />
        </Row>
        {room.owner ? (
          <Row>
            <Input style={{ flex: 1 }} value={name} onChangeText={setName} placeholder={t('Name of the group')} accessibilityLabel={t('Name of the group')} />
            <Button title={t('Rename')} compact disabled={busy || !name.trim() || name.trim() === (room.name ?? '')} onPress={() => run(() => xmppRenameGroup(jid, name))} />
          </Row>
        ) : null}
        {room.owner ? (
          <Row>
            <Input
              style={{ flex: 1 }}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={DESCRIPTION_LONGEST}
              placeholder={t('Description')}
              accessibilityLabel={t('Description')}
            />
            <Button title={t('Save')} compact disabled={busy || description.trim() === (room.description ?? '')} onPress={() => run(() => xmppDescribeGroup(jid, description))} />
          </Row>
        ) : null}
        {room.owner ? null : (
          <Text variant="caption" tone="muted">
            {t('Only its owner can rename the group.')}
          </Text>
        )}
      </Card>
      {nicks.map((nick) => (
        <Card key={nick}>
          <Row>
            <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {nick}
            </Text>
            <Rank room={room} address={room.occupants[nick] ?? ''} />
          </Row>
          <Button
            title={t('Take out')}
            kind="secondary"
            compact
            onPress={() =>
              ask(t('Take {name} out of the group?', { name: nick }), t('They can come back in, unless you bar them.'), [
                { text: t('Cancel'), style: 'cancel' },
                { text: t('Take out'), style: 'destructive', onPress: () => void xmppRemoveFromGroup(jid, { nick }).catch(fail) },
              ])
            }
          />
        </Card>
      ))}
    </>
  );
}

// A private group's members, each with their keys, and for its admin the contacts who can be added.
// Someone with no device known (they have none, or the look-up as the group opened has not come
// back yet) is marked, as the group's messages do not reach them.
function Members({ state, jid, room, fail }: { state: XmppState; jid: string; room: XmppRoom; fail: (error: unknown) => void }) {
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const members = groupPeople(state, room);
  const others = Object.values(state.roster)
    .filter((c) => c.subscription !== 'remove' && c.jid !== state.jid && !members.includes(c.jid))
    .sort((a, b) => nameOf(state, a.jid).localeCompare(nameOf(state, b.jid)));
  const toggle = (who: string) => setPicked((now) => (now.includes(who) ? now.filter((j) => j !== who) : [...now, who]));
  const add = () => {
    setBusy(true);
    xmppAddToGroup(jid, picked)
      .then(() => {
        setPicked([]);
        setAdding(false);
      })
      .catch(fail)
      .finally(() => setBusy(false));
  };
  return (
    <>
      <SectionTitle title={t('Members')} />
      {members.length === 0 ? <Text tone="muted">{t('Nobody else is in this group yet.')}</Text> : null}
      {members.some((member) => xmppDevices(state, member).length) ? (
        <Text tone="muted">{t('Compare these with what their app shows, by another way than this chat, to be sure nobody sits in between.')}</Text>
      ) : null}
      {members.map((member) => {
        const devices = xmppDevices(state, member);
        return (
          <Card key={member}>
            <Row>
              <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                {nameOf(state, member)}
              </Text>
              <Rank room={room} address={member} />
            </Row>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {member}
            </Text>
            {devices.some((device) => device.listed) ? null : (
              <Text variant="caption" tone="muted">
                {t('No OMEMO keys found yet: encrypted messages do not reach them.')}
              </Text>
            )}
            <Keys jid={member} devices={devices} fail={fail} />
            {room.admin && room.joined && member !== state.jid ? (
              <Row wrap>
                {room.owner ? (
                  <Button
                    title={room.admins?.includes(member) ? t('Remove as admin') : t('Make admin')}
                    kind="secondary"
                    compact
                    onPress={() => xmppSetGroupAdmin(jid, member, !room.admins?.includes(member)).catch(fail)}
                  />
                ) : null}
                {room.owner || !room.admins?.includes(member) ? (
                  <>
                    <Button
                      title={t('Take out')}
                      kind="secondary"
                      compact
                      onPress={() =>
                        ask(t('Take {name} out of the group?', { name: nameOf(state, member) }), t('The group’s messages no longer go to them. An admin can add them again.'), [
                          { text: t('Cancel'), style: 'cancel' },
                          { text: t('Take out'), style: 'destructive', onPress: () => void xmppRemoveFromGroup(jid, { address: member }).catch(fail) },
                        ])
                      }
                    />
                    <Button
                      title={t('Bar')}
                      kind="secondary"
                      compact
                      onPress={() =>
                        ask(t('Bar {name} from the group?', { name: nameOf(state, member) }), t('They are taken out and cannot join again until an admin lets them.'), [
                          { text: t('Cancel'), style: 'cancel' },
                          { text: t('Bar'), style: 'destructive', onPress: () => void xmppRemoveFromGroup(jid, { address: member }, true).catch(fail) },
                        ])
                      }
                    />
                  </>
                ) : null}
              </Row>
            ) : null}
          </Card>
        );
      })}
      {room.admin ? (
        adding ? (
          <Card>
            {others.length ? (
              <Row wrap>
                {others.map((contact) => (
                  <Chip key={contact.jid} label={nameOf(state, contact.jid)} selected={picked.includes(contact.jid)} onPress={() => toggle(contact.jid)} />
                ))}
              </Row>
            ) : (
              <Text tone="muted">{t('Every contact is in the group or asked already.')}</Text>
            )}
            <Row wrap>
              <Button title={t('Add')} compact disabled={busy || picked.length === 0} onPress={add} />
              <Button
                title={t('Cancel')}
                kind="secondary"
                compact
                onPress={() => {
                  setAdding(false);
                  setPicked([]);
                }}
              />
            </Row>
          </Card>
        ) : (
          <Button title={t('Add people')} kind="secondary" compact onPress={() => setAdding(true)} />
        )
      ) : null}
    </>
  );
}

/** The message an answer is to, as the answer quotes it, and going to it. */
type Answer = { name: string; line: string; onPress: () => void };

/**
 * A file a message names, fetched: from a server other than the account's own (the sender's HTTP
 * upload host) and not through Tor, that server sees this phone's internet address, so that is said
 * first, once a server (lib/ip-warning.ts); not gone on, it is not fetched.
 */
async function fetchFile(file: XmppFile): Promise<Uint8Array> {
  const account = xmppActingTor();
  if (account && !accountThroughTor(account.way, true) && !fileOfOwnServer(file, account.jid)) {
    let host = '';
    try {
      host = new URL(file.url).hostname.toLowerCase();
    } catch {
      // Named by the whole address then.
    }
    const keep = actingWhere() === 'place' ? { keep: hiddenKeep() } : {};
    // Not gone on: not fetched, and nothing more said (the file shows as before).
    if (!(await ipGate({ network: 'XMPP', act: 'file', of: `xmpp-file:${host || file.url.slice(0, 120)}`, ...keep }))) throw new IpStop();
  }
  return xmppFile(file);
}

function Bubble({ message, group, me, answered, chosen, onPress, onReact, onMenu, onDuration, onLayout, starred }: {
  message: XmppMessage;
  group: boolean;
  /** The account's address, to see which reactions are ours. */
  me: string;
  /** The message it answers, or null when that is not here. */
  answered?: Answer | null;
  /** Chosen among others (components/select-bar.tsx). */
  chosen?: boolean;
  /** Tapped, while messages are chosen: chooses it, or takes it out. */
  onPress?: () => void;
  /** A reaction under it was tapped: reacts the same, or takes ours back. Not given when it cannot be reacted to yet. */
  onReact?: (emoji: string) => void;
  /** Held down: its menu. */
  onMenu?: () => void;
  /** How long its sound lasts, read once it was fetched, to keep. */
  onDuration?: (ms: number) => void;
  /** Where it sits in the thread, to scroll to it. */
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Starred on this device (components/keep-actions.tsx). */
  starred?: boolean;
}) {
  const { colors, look } = useTheme();
  const mine = message.mine;
  const when = new Date(message.at).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  // A call's line: kept in English, shown in the app's language, with no marks.
  if (message.call) {
    return (
      <View onLayout={onLayout} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: space.sm + 2, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, gap: 2 }}>
        <Text>{shownLine(message.text)}</Text>
        <Text variant="caption" tone="faint">
          {when}
        </Text>
      </View>
    );
  }
  const status =
    message.state === 'sending'
      ? t('Sending…')
      : message.state === 'failed'
        ? t('Not sent.')
        : [`${when}${!group && mine && message.state ? ` ${MARKS[message.state]}` : ''}`, message.edited ? t('Edited') : '', starred ? '★' : ''].filter(Boolean).join('  ·  ');
  const reactions = reactionsShown(message);
  const file = message.file;
  return (
    // Chosen, it is washed across the thread (components/select-bar.tsx).
    <View onLayout={onLayout} style={chosen ? chosenStyle(colors) : undefined}>
      <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', gap: 4 }}>
        <Pressable
          onPress={onPress}
          onLongPress={onMenu}
          disabled={!onMenu && !onPress}
          // One with buttons in it (Save) stays apart from them for a screen reader.
          accessible={!file}
          accessibilityState={onPress ? { selected: !!chosen } : undefined}
          accessibilityHint={onMenu && !onPress ? t('Hold for more') : undefined}
          style={[{ alignSelf: mine ? 'flex-end' : 'flex-start', padding: space.sm + 2, gap: 2 }, softBubble(look.bubbles, colors, mine)]}
        >
          {group && !mine && message.by ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {message.by}
            </Text>
          ) : null}
          {message.forwarded && !message.deleted ? (
            <Text variant="caption" tone="muted" style={{ fontStyle: 'italic' }}>
              {t('Forwarded')}
            </Text>
          ) : null}
          {message.replyTo ? answered ? <Quote name={answered.name} line={answered.line} onPress={onPress ? undefined : answered.onPress} /> : <Missing /> : null}
          {message.deleted ? (
            <Text tone="muted" style={{ fontStyle: 'italic' }}>
              {t('Message deleted')}
            </Text>
          ) : message.locked ? (
            <Text tone="muted">{t('Locked: this message could not be opened on this device.')}</Text>
          ) : file ? (
            // A sound shows as a voice message, as the other apps send one.
            <NetworkFile name={file.name} type={shownType(file)} size={file.size} duration={file.duration} fetch={() => fetchFile(file)} onMenu={onMenu} onDuration={onDuration} />
          ) : (
            // Not selectable when it has a menu: holding the words opens it, which can copy them.
            <>
              {placeIn(message) ? (
                <PlaceCard place={placeIn(message)!} />
              ) : (
                // As XEP-0393 styles them (lib/text-style.ts), its web addresses tappable.
                <Text selectable={!onMenu} style={textSized(look.textSize, 16)}>
                  <LinkedText text={message.text} />
                </Text>
              )}
              {message.preview ? <PreviewCard preview={message.preview} /> : null}
            </>
          )}
          <Text variant="caption" tone="faint">
            {status}
            {!message.encrypted && !message.locked && !message.deleted ? ` · ${t('not encrypted')}` : ''}
          </Text>
        </Pressable>
        {reactions ? <ReactionChips reactions={reactions} me={me} mine={mine} onReact={(emoji) => onReact?.(emoji)} /> : null}
      </View>
    </View>
  );
}
