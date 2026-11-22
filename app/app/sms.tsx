// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, BackHandler, Image, PermissionsAndroid, Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatHistory, historyRows, useHistoryTools } from '../components/chat-history';
import { RemindSheet, remindPlace, type RemindOf } from '../components/chat-writing';
import { ChatTimer, useGoneAt } from '../components/chat-rules';
import { canDial, DialTile } from '../components/dial-tile';
import { IconButton, SendDisc } from '../components/composer';
import { keptName, ownStickerPart, useKeep } from '../components/keep-actions';
import { MoreIcon, PlusIcon } from '../components/icons';
import { KeyboardPaddedView } from '../components/keyboard';
import { LaterPicker } from '../components/later-picker';
import { MicButton, RecordingLine } from '../components/matrix-voice';
import { Pinned } from '../components/message-parts';
import { PlaceSheet } from '../components/place-sheet';
import { chosenStyle, SelectBar, useSelection } from '../components/select-bar';
import { SmsActions, type SmsTarget } from '../components/sms-actions';
import { SmsOwnScreen } from '../components/sms-own';
import { SmsExtras, useSmsVoice } from '../components/sms-parts';
import { ContactsSheet } from '../components/sms-recipient';
import { StickerPicker } from '../components/stickers';
import { BELOW_TOP, ThreadArrows, useThreadAway } from '../components/thread-arrows';
import { deleteSms, deleteSmsMany, erevosNumber, maySendSms, onSmsChangedElsewhere, sendSmsAgain, SmsForward } from '../components/sms-message';
import { Button, Card, Chip, Input, Page, Row, Sheet, Text } from '../components/ui';
import { UndoBar } from '../components/undo-bar';
import { ask } from '../lib/alert';
import { showOnScreen, showSmsOnScreen } from '../lib/background';
import type { Place } from '../lib/chat-parts';
import { isContactNumber, sealedNamer, type Card as PhoneCard } from '../lib/contact-book';
import { newContactHref } from '../lib/contacts';
import { SMS_BEFORE, SMS_DRAWN, SMS_KEPT, smsHistory } from '../lib/chat-history-adapters';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { canRelaySeal } from '../lib/core';
import { fromBase64, randomBytes } from '../lib/crypto';
import { toBase64Url } from '../lib/e2e';
import { forwardedTo, forwardTo, type Forwarded } from '../lib/forward';
import { Held } from '../lib/held';
import { locale, plural, t } from '../lib/i18n';
import { laterLabel } from '../lib/later';
import { oneTimeCode } from '../lib/one-time-code';
import { spaceLinkSender } from '../lib/queue-move';
import { appShown, onAppShown } from '../lib/receiver';
import { relayKey } from '../lib/relay';
import { deletingSms, linkedContact, smsFailed, smsLineId, smsMark } from '../lib/sms-chat';
import { onSmsOrderChanged, shownMessages, smsFolder, smsTitle, spamReason, spamWhy, trashOf } from '../lib/sms-folders';
import { groupName, sameConversation, smsAddress, smsNumbers } from '../lib/sms-group';
import { sameNumber } from '../lib/sms-invite';
import { MMS_MAX, pickMmsPhoto } from '../lib/pick-mms-photo';
import { CAN_PLACE } from '../lib/place';
import { cancelLater as cancelSmsLater, laterChanged, onLaterSent, waitsForOwner } from '../lib/sms-later';
import { chooseSim, simLabel, SmsLink } from '../lib/sms-link';
import { goneSms, nextSmsGoes, smsRulesOf, sweepSpaceSms } from '../lib/sms-rules';
import { vanishTimer } from '../lib/chat-rules';
import { CARD_MIME, chosenText, contactVCard, forwardOf, isPinned, partsOf, partWord, pinnedShown, placeSms, VOICE_MIME } from '../lib/sms-parts';
import { stickerImage } from '../lib/sticker-image';
import { stickerToSend } from '../lib/sticker-send';
import { contactRows } from '../lib/sms-recipient';
import { cleanName, loadE2EData, type Contact } from '../lock/e2e-data';
import { useLock } from '../lock/context';
import { currentSpace } from '../lock/keys';
import { restoredAt } from '../lock/restored';
import { LinkedText } from '../components/linked-text';
import { loadCurrentSpaceData } from '../lock/space-data';
import { LATER_TEXT, type LaterSms, type SmsData, type SmsPin } from '../lock/sms-data';
import { smsCount, withoutAccents } from '../lib/sms-count';
import { withReactions } from '../lib/sms-reactions';
import { QuickTexts } from '../components/sms-quick';
import { MMS_VIDEO_SECONDS, pickMmsVideo, recordMmsVideo } from '../lib/pick-mms-video';
import { spaceStarPlace } from '../lock/stars-data';
import { phoneContactPhoto } from '../modules/erevos-contacts';
import {
  blockedNumbers,
  contactCards,
  markSmsRead,
  mmsReady,
  onSmsEvent,
  sendMms,
  sendSms,
  sendSmsData,
  smsMessages,
  smsSims,
  smsToolsReady,
  smsMirrored,
  smsPictureBytes,
  smsStatus,
  fetchMms,
  waitingMms,
  type Sim,
  type SmsMessage,
  type WaitingMms,
} from '../modules/erevos-sms';
import { radius, space, type Colors } from '../theme/colors';
import { useStyles, useTheme } from '../theme/context';

// One SMS conversation, with a number. A number linked to an Erevos contact opens that contact's
// chat instead, where its SMS show among the chat's messages (lib/sms-chat.ts), unless `plain`
// asks for the SMS, as the chat's details and the contact card do to write one. Messages here are
// plain SMS: the phone company can read them. The first one to a number that is no Erevos contact's
// also carries a hidden invite (lib/sms-invite.ts), when invites are on. A contact can be linked to
// the number by hand. A photo, a voice message (held on the microphone), a contact from the
// phone's contacts and a built-in sticker, as its picture made on the phone (lib/sticker-send.ts),
// go as an MMS, as plain as an SMS; where you are goes as an SMS of its geo: address
// and a map's link (lib/sms-parts.ts). The voice messages, contact cards and places that come show
// as such, to play, save or open in the maps app. With two SIMs, the one to send on is chosen here,
// and kept for the number. The number shows the name and picture the phone's contacts give it, when that is
// turned on. With several numbers (`to` comma-separated) it is a group's conversation: every
// message goes to all of them as one MMS, text alone too, and each that comes says who wrote it.
// Ours are marked ✓ once they went and ✓✓✓ once the network's delivery report says they reached
// the phone. Send held down sends a text SMS later (lib/sms-later.ts), to one number only; it shows
// at the end, marked Scheduled, until it goes.
//
// What is typed and not sent is kept, sealed in the space, as the conversation's draft. A message
// sent waits the seconds chosen under SMS (5 at first), shown at the end, and can be taken back in
// that time; one that did not go is sent again with a tap. Held down, a message can be passed on to
// another number or into an Erevos chat, or deleted from the phone, with Undo for a few seconds
// (components/sms-message.tsx, as in a contact's chat).
// SMS another app writes, while it is the SMS app, show as Erevos hears of them, or as it comes back.
// Held down, a message can also be pinned over the conversation for the owner alone (SMS have no
// pins), kept with the space's SMS data, or chosen with others (Select), to copy, forward or delete
// them together, or written into Chat with myself to remind at a time chosen (Remind me,
// components/chat-writing.tsx).
// ⋮ pins, archives, marks as spam, blocks or deletes the conversation (components/sms-actions.tsx);
// the part of it in the Trash does not show here. A sender that writes with a name instead of a
// number (a bank, say) shows its SMS, and cannot be answered.
// Held down, a message can be starred too, on this phone only, its picture kept as one of the
// owner's stickers, and its picture, voice message or contact card saved into the Collection
// (components/keep-actions.tsx); the stickers made from photos go as an MMS, as the built-in ones
// do. Opened at a message (`at`, a starred one), the conversation goes to it.
// It can have a look of its own, a PIN of its own, its screenshots blocked and, with one number,
// notifications of its own, all kept in the space (components/sms-own.tsx).

/** What an MMS carries besides its words: a picture, a voice message or a contact card (`name`, whose). */
type Part = { bytes: Uint8Array; mime: string; name?: string };

/** A contact of the phone's to send as a contact card, as the contacts sheet lists it. */
type CardRow = ReturnType<typeof contactRows<PhoneCard>>[number];

/** An SMS waiting its seconds before it goes, in the space it was written in. */
type Outgoing = { id: string; to: string; text: string; part: Part | null; sim: number; group: boolean; space: number };

// SMS waiting to go, whatever screen shows (lib/held.ts); when Erevos goes to the background, they
// go at once, as messages waiting to be deleted do (components/sms-message.tsx).
const outbox = new Held<Outgoing>();
AppState.addEventListener('change', (state) => state === 'background' && outbox.flush());
// The open conversation hears which went and which could not.
const delivered = new Set<(sms: Outgoing, error: unknown) => void>();

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

// The open space's SMS data, while it is still the space the SMS was written in.
async function spaceLink(space: number): Promise<SmsLink | null> {
  let open: { space: number; key: Uint8Array };
  try {
    open = currentSpace();
  } catch {
    return null;
  }
  return open.space === space ? SmsLink.open(open.space, open.key) : null;
}

// Sends an SMS whose seconds are up: as one MMS with a part or to a group, else as an SMS; then,
// with the first SMS to a number that is no contact, the hidden invite. One that could not go is kept as the
// conversation's draft, so it is not lost.
async function deliver(sms: Outgoing): Promise<void> {
  try {
    if (sms.part || sms.group) await sendMms(sms.to, sms.text, sms.part, sms.sim);
    else await sendSms(sms.to, sms.text, sms.sim);
  } catch (error) {
    const link = await spaceLink(sms.space).catch(() => null);
    if (link && sms.text && !link.draftFor(sms.to)) await link.setDraft(sms.to, sms.text).catch(() => undefined);
    delivered.forEach((listener) => listener(sms, error));
    return;
  }
  delivered.forEach((listener) => listener(sms, null));
  // On a linked device the phone sends it, with no invite: that is the phone's own to send.
  if (!sms.group && !smsMirrored()) await invite(sms.to, sms.space).catch(() => undefined);
}

// With the first SMS to a number that is no contact: a hidden invite, answered through the relay
// if that phone has Erevos. None to an Erevos contact's number, linked or on their contact card,
// whose relay and queue it would tell in plain. Without a relay queue there is nowhere to answer,
// so none is sent.
async function invite(to: string, space: number) {
  const sms = await spaceLink(space);
  if (!sms || !sms.wantsInvite(to)) return;
  const { contacts } = await loadE2EData('space', space, currentSpace().key);
  if (await erevosNumber(to, contacts)) return;
  const data = await loadCurrentSpaceData();
  if (!data.url || !data.ownQueue) return;
  let key = '';
  if (canRelaySeal()) {
    const bytes = await relayKey({ url: data.url, token: data.token || undefined }).catch(() => null);
    if (bytes) key = toBase64Url(bytes);
  }
  try {
    // Its answer comes to the queue the contact link names (lib/queue-move.ts), not the one contacts write to.
    await sms.invite(to, { senderHex: await spaceLinkSender(data.ownQueue), relay: data.url, relayKey: key }, sendSmsData);
  } catch {
    // The SMS went; the invite goes with a later one.
  }
}

// The conversation a link names: its numbers, a group's comma-separated; or a sender that writes
// with a name instead of a number, whose SMS show, but cannot be answered.
function conversationOf(raw: string): string {
  const numbers = smsNumbers(raw);
  const sender = numbers.length === 0 && /^[\p{L}\p{N}][\p{L}\p{N} .&_-]{0,19}$/u.test(raw.trim()) ? raw.trim() : '';
  return smsAddress(numbers) || sender;
}

/** An SMS conversation's screen, in its own look or the space's, and locked with its PIN or not
 *  (components/sms-own.tsx): `tools` are the buttons for those, in it. */
export default function SmsScreen() {
  const params = useLocalSearchParams<{ to?: string }>();
  return <SmsOwnScreen to={conversationOf(typeof params.to === 'string' ? params.to : '')}>{(tools) => <Sms tools={tools} />}</SmsOwnScreen>;
}

function Sms({ tools }: { tools: ReactNode }) {
  const params = useLocalSearchParams<{ to?: string; text?: string; plain?: string; at?: string }>();
  // With only the SMS open (app/_layout.tsx), a number of a contact stays a plain SMS conversation,
  // and nothing names the space's contacts.
  const smsOnly = useLock().only === 'sms';
  const raw = typeof params.to === 'string' ? params.to : '';
  const numbers = smsNumbers(raw);
  const to = conversationOf(raw);
  const group = numbers.length > 1;
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  // How many of the latest SMS show: more once an older one is gone to. Search in this chat, its
  // media, Go to a day and Export chat (components/chat-history.tsx) read all the phone keeps.
  const drawn = useRef(SMS_DRAWN);
  const history = useHistoryTools();
  // A message passed on to this conversation from another (lib/forward.ts).
  const [forwarded] = useState<Forwarded | null>(() => forwardedTo(to, sameConversation));
  const [draft, setDraft] = useState(forwarded?.text ?? (typeof params.text === 'string' ? params.text : ''));
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [choosing, setChoosing] = useState(false);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [part, setPart] = useState<Part | null>(forwarded?.photo ?? null);
  const [sims, setSims] = useState<Sim[]>([]);
  const [sim, setSim] = useState(-1);
  const [names, setNames] = useState<Record<string, string>>({});
  const [face, setFace] = useState('');
  // Whether the number is one of the contacts, the phone's or those kept only in Erevos; null
  // while Erevos may not read them.
  const [inContacts, setInContacts] = useState<boolean | null>(null);
  const [later, setLater] = useState<LaterSms[]>([]);
  const [laterMenu, setLaterMenu] = useState(false);
  // When a backup was restored here: an SMS for later whose time came before waits for the owner (lib/sms-later.ts).
  const [restored, setRestored] = useState(0);
  // The space's order of its SMS (lib/sms-folders.ts), and the numbers Android blocks.
  const [order, setOrder] = useState<SmsData | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  // What waits to go, and what waits to be deleted, of this conversation.
  const [pending, setPending] = useState(() => outbox.list());
  const [going, setGoing] = useState(() => deletingSms.list());
  const [now, setNow] = useState(Date.now());
  // The message held down, the one being passed on, and the conversation's own actions (⋮).
  const [chosen, setChosen] = useState<SmsMessage | null>(null);
  // The message a reminder is being set for: it goes into Chat with myself (components/chat-writing.tsx).
  const [reminding, setReminding] = useState<RemindOf | null>(null);
  const [forwarding, setForwarding] = useState<SmsMessage | null>(null);
  const [menu, setMenu] = useState<SmsTarget | null>(null);
  // The sheet of what an MMS can carry, where you are being found, a contact being chosen to send.
  const [attaching, setAttaching] = useState(false);
  // The sheet of quick texts (components/sms-quick.tsx): held +, or from Attach and more.
  const [quicking, setQuicking] = useState(false);
  const [atCarrier, setAtCarrier] = useState<WaitingMms[]>([]);
  const [placing, setPlacing] = useState(false);
  const [choosingCard, setChoosingCard] = useState(false);
  // The built-in stickers' sheet, what it says, and whether one's picture is being made.
  const [stickering, setStickering] = useState(false);
  const [stickerNote, setStickerNote] = useState('');
  const stickerOpen = useRef(false);
  stickerOpen.current = stickering;
  const drawing = useRef(false);
  // The messages chosen together (Select), those pinned for the owner, and which of them the bar shows.
  const selection = useSelection<string>();
  const [pins, setPins] = useState<SmsPin[]>([]);
  const [pinAt, setPinAt] = useState(0);
  // Pins change one after the other, so none is lost to another saved at the same time.
  const pinWork = useRef<Promise<void>>(Promise.resolve());
  // Held on the microphone, a voice message goes as an MMS on its own.
  const voice = useSmsVoice({ send: (audio) => go('', { bytes: audio, mime: VOICE_MIME }).then(() => undefined), say: setNote });
  const link = useRef<SmsLink | null>(null);
  // Whether the draft kept for the conversation was read: until then nothing is saved over it.
  const draftRead = useRef(false);
  const draftNow = useRef(draft);
  draftNow.current = draft;
  const twoSims = (smsStatus()?.slots ?? 0) >= 2;
  const thread = useRef<ScrollViewInstance>(null);
  // Gone to its start by its arrow, the thread keeps where it is read, until its end or a new SMS is.
  const keepsPlace = useRef(false);
  const { away, onScroll, spot } = useThreadAway();
  // Where each SMS begins in the thread, and where the conversation was left: the first SMS that
  // came and was not read when it opened, taken before it is marked read.
  const placed = useRef(new Map<string, number>());
  // Opened at a message (a starred one): gone to once it is laid out.
  const goal = useRef(typeof params.at === 'string' ? params.at : '');
  // Star, Add to my stickers and Save to the Collection, in a message's menu, and the space's own
  // stickers among those to send (components/keep-actions.tsx).
  const keepPlace = useMemo(spaceStarPlace, []);
  const live = useMemo(() => messages.map((m) => ({ id: smsLineId(m), at: m.at })), [messages]);
  const keep = useKeep({ service: 'sms', place: keepPlace, account: '', chat: to, group, messages: live, say: setNote });
  const taking = useRef<{ to: string; left: Promise<string | null> } | null>(null);
  const left = useRef<string | null>(null);
  const markRead = useCallback(() => {
    if (taking.current?.to !== to) {
      left.current = null;
      taking.current = {
        to,
        left: smsMessages(to).then(
          (loaded) => {
            const first = loaded.find((m) => !m.mine && !m.read);
            return first && first !== loaded[0] ? smsLineId(first) : null;
          },
          () => null,
        ),
      };
    }
    const taken = taking.current;
    return taken.left.then((id) => {
      if (taking.current === taken) left.current = id;
      return markSmsRead(to);
    });
  }, [to]);

  // Read only while this conversation shows with Erevos on the screen: an SMS that comes while it is
  // away stays unread, and its notice with it, until it comes back to it (SmsStore.kt markRead).
  const focusedNow = useRef(false);
  const load = useCallback(() => {
    // The MMS of this conversation waiting at the phone company for a tap (MmsStore.kt).
    const here = smsNumbers(to);
    setAtCarrier(waitingMms().filter((w) => here.some((n) => sameNumber(n, w.from))));
    smsMessages(to, drawn.current)
      .then((loaded) => {
        setMessages(loaded);
        return loaded;
      })
      .catch(() => setNote(t('The SMS on this phone could not be read. Make Erevos the SMS app under Settings → Phone and SMS → SMS.')));
    if (focusedNow.current && appShown()) markRead().catch(() => undefined);
    // What waits to go later, and the space's order, as the phone has them now.
    const sms = link.current;
    if (sms) {
      sms
        .refresh()
        .then(() => {
          setLater(sms.later.filter((l) => sameNumber(l.to, to)));
          setOrder(sms.state);
          setPins(sms.messagePins(to));
        })
        .catch(() => undefined);
    }
  }, [to, markRead]);

  // On the screen, an SMS that comes in it only sounds (lib/background.ts).
  useFocusEffect(useCallback(() => (to ? showSmsOnScreen(numbers.length > 0 ? numbers : [to]) : undefined), [to]));
  // On a linked device given the phone's SMS, what comes here only sounds, as in a chat on another network.
  useFocusEffect(useCallback(() => (to && smsMirrored() ? showOnScreen(`sms:${to}`) : undefined), [to]));

  // Shown, and Erevos back on the screen: what came meanwhile is read.
  useFocusEffect(
    useCallback(() => {
      focusedNow.current = true;
      if (appShown()) markRead().catch(() => undefined);
      const stopShown = onAppShown((shown) => {
        if (shown && focusedNow.current) load();
      });
      return () => {
        focusedNow.current = false;
        stopShown();
      };
    }, [to, load, markRead]),
  );

  // A number that is no contact can be added as one, even with the names not shown; looked at
  // again on coming back, as from adding it.
  useFocusEffect(
    useCallback(() => {
      if (group || numbers.length !== 1) return;
      let active = true;
      void isContactNumber(numbers[0]).then((known) => active && setInContacts(known));
      return () => {
        active = false;
      };
    }, [to]),
  );

  useEffect(() => {
    const { space, key } = currentSpace();
    load();
    loadE2EData('space', space, key)
      .then((data) => {
        const linked = linkedContact(data.contacts, to, params.plain === '1' || smsOnly);
        if (linked) {
          // What was passed on to the number goes into the contact's chat instead.
          if (forwarded) forwardTo(`contact:${linked.identity}`, { text: forwarded.text, photo: null });
          router.replace(`/chat?contact=${linked.identity}`);
        } else if (!smsOnly) setContacts(data.contacts);
      })
      .catch(() => undefined);
    void restoredAt()
      .then(setRestored)
      .catch(() => undefined);
    SmsLink.open(space, key)
      .then(async (opened) => {
        link.current = opened;
        setOrder(opened.state);
        setPins(opened.messagePins(to));
        if (!draftRead.current) {
          draftRead.current = true;
          const kept = opened.draftFor(to);
          if (kept) setDraft((typed) => (typed.trim() ? typed : kept));
        }
        if (!group) setLater(opened.later.filter((l) => sameNumber(l.to, to)));
        // Once names are on: the phone's contacts', else those of the contacts kept only in Erevos.
        if (opened.names) {
          const cards = await contactCards(numbers).catch(() => ({}) as Record<string, { name: string; photo: string }>);
          const sealed = await sealedNamer();
          setNames(Object.fromEntries(numbers.flatMap((n) => (cards[n]?.name || sealed(n) ? [[n, cards[n]?.name || sealed(n)]] : []))));
          setFace(group ? '' : (cards[to]?.photo ?? ''));
        }
        if (!twoSims) return;
        const [found, loaded] = await Promise.all([smsSims(), smsMessages(to, 50).catch(() => [] as SmsMessage[])]);
        const lastCame = [...loaded].reverse().find((m) => !m.mine)?.sim ?? -1;
        setSims(found);
        setSim(chooseSim(found, opened.simFor(to), lastCame));
      })
      .catch(() => undefined);
    void blockedNumbers().then(setBlocked);
    const ours = (address: string) => (numbers.length > 0 ? numbers.some((n) => sameNumber(address, n)) : sameConversation(address, to));
    const subscriptions = [onSmsEvent('onSms', ({ address }) => ours(address) && load()), onSmsEvent('onSmsSent', () => load()), onSmsEvent('onSmsDelivered', () => load())];
    const stopLater = onLaterSent(load);
    // Written by another SMS app, while Erevos shows or before it came back.
    const stopElsewhere = onSmsChangedElsewhere(load);
    const stopOrder = onSmsOrderChanged(() => {
      load();
      void blockedNumbers().then(setBlocked);
    });
    const stopOutbox = outbox.onChange(() => setPending(outbox.list()));
    const stopDeleting = deletingSms.onChange(() => setGoing(deletingSms.list()));
    // One that went shows as the phone has it; one that could not go comes back into the field.
    const heard = (sms: Outgoing, error: unknown) => {
      if (!sameConversation(sms.to, to)) return;
      load();
      if (!error) return;
      setNote(t('Not sent. {error}', { error: errorText(error) }));
      setDraft((typed) => (typed.trim() ? typed : sms.text));
      if (sms.part) setPart((shown) => shown ?? sms.part);
    };
    delivered.add(heard);
    return () => {
      subscriptions.forEach((s) => s?.remove());
      stopLater();
      stopElsewhere();
      stopOrder();
      stopOutbox();
      stopDeleting();
      delivered.delete(heard);
    };
  }, [to, load, params.plain]);

  // The draft is kept a moment after typing stops, when Erevos goes to the background, and when
  // the conversation closes.
  useEffect(() => {
    if (!draftRead.current) return;
    const timer = setTimeout(() => void link.current?.setDraft(to, draft).catch(() => undefined), 1500);
    return () => clearTimeout(timer);
  }, [draft, to]);
  useEffect(() => {
    const save = () => draftRead.current && void link.current?.setDraft(to, draftNow.current).catch(() => undefined);
    const subscription = AppState.addEventListener('change', (state) => state === 'background' && save());
    return () => {
      subscription.remove();
      save();
    };
  }, [to]);

  // Back ends the choosing of several messages, before it leaves the conversation.
  useEffect(() => {
    if (!selection.on) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      selection.clear();
      return true;
    });
    return () => subscription.remove();
  }, [selection.on, selection.clear]);

  // The seconds left of what waits to go, counted down.
  const waiting = pending.filter((p) => sameConversation(p.item.to, to));
  useEffect(() => {
    if (waiting.length === 0) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [waiting.length]);

  // What the conversation's timer took leaves the screen at its time, and the phone then (lib/sms-rules.ts).
  const rules = order && to ? smsRulesOf(order, to) : undefined;
  const timedOut = goneSms(rules, messages);
  useGoneAt(nextSmsGoes(rules, messages));
  useEffect(() => {
    if (!timedOut.length) return;
    const { space, key } = currentSpace();
    void sweepSpaceSms(space, key, true)
      .then((went) => went > 0 && load())
      .catch(() => undefined);
  }, [timedOut.length, load]);

  if (!to) {
    return (
      <Page>
        <Text tone="muted">{t('No phone number.')}</Text>
      </Page>
    );
  }

  const trashed = order ? trashOf(to, order) : null;
  const hidden = new Set(going.filter((g) => sameConversation(g.item.to, to)).map((g) => g.item.id));
  // A reaction an iPhone or Google Messages sent as words shows as its mark on the message it names (lib/sms-reactions.ts).
  const { lines: shown, marks: reactions } = withReactions(shownMessages(messages, trashed).filter((m) => !hidden.has(smsLineId(m)) && !timedOut.includes(m)));
  spot.current = () => (left.current && shown.some((m) => smsLineId(m) === left.current) ? (placed.current.get(left.current) ?? null) : undefined);
  // The one-time code of each SMS that came with one, found once for the conversation as read.
  const codes = useMemo(() => new Map(messages.filter((m) => !m.mine && m.text).map((m) => [smsLineId(m), oneTimeCode(m.text)] as const)), [messages]);
  const title = group ? smsTitle(order, to) || groupName(numbers, names) : names[to] || to;
  // Where the conversation is, by its latest message: in the list, archived, in Spam, or in the
  // Trash with nothing after.
  const last = messages[messages.length - 1] ?? null;
  const known = !!names[to] || contacts.some((c) => c.phone && sameNumber(c.phone, to));
  const latest = last ? { address: to, text: last.text, at: last.at, mine: last.mine, unread: 0, replied: messages.some((m) => m.mine) } : null;
  const folder = order && latest ? smsFolder(latest, order, blocked, known) : 'list';
  // In Spam, why: which rule sent it there.
  const spamFor = folder === 'spam' && order && latest ? spamReason(latest, order, blocked, known) : null;

  // The SIMs show once Erevos may read the phone's state; it asks only when the owner taps.
  async function askSims() {
    const answer = await PermissionsAndroid.request('android.permission.READ_PHONE_STATE').catch(() => null);
    if (answer !== PermissionsAndroid.RESULTS.GRANTED) {
      setNote(t("Without that, SMS go on the phone's default SIM."));
      return;
    }
    const found = await smsSims();
    setSims(found);
    const lastCame = [...messages].reverse().find((m) => !m.mine)?.sim ?? -1;
    setSim(chooseSim(found, link.current?.simFor(to) ?? -1, lastCame));
  }

  // Who wrote a message in a group's conversation: the group's number as the contacts name it.
  function whose(from: string): string {
    const number = numbers.find((n) => sameNumber(n, from)) ?? from;
    return names[number] || number;
  }

  function pickSim(id: number) {
    setSim(id);
    link.current?.setSim(to, id).catch(() => undefined);
  }

  // A video for an MMS: recorded by the camera app in MMS quality, or one of the phone's small enough.
  async function addVideo(record: boolean) {
    setNote('');
    try {
      const picked = record ? await recordMmsVideo() : await pickMmsVideo();
      if (picked) setPart(picked);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  async function addPhoto() {
    setNote('');
    try {
      const picked = await pickMmsPhoto();
      if (picked) setPart(picked);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  // Sends words and a part, after the seconds chosen to take it back (none: at once); `taken` once
  // Erevos may send, to empty the field. False when it could not.
  async function go(text: string, carried: Part | null, taken?: () => void): Promise<boolean> {
    keepsPlace.current = false;
    setNote('');
    try {
      await maySendSms();
      if (group && !mmsReady() && !smsMirrored()) throw new Error(t('This build of Erevos cannot send to several numbers yet.'));
      // A group's message goes to everyone as one MMS, even without a part.
      const sms: Outgoing = { id: toBase64Url(randomBytes(9)), to, text: sent(text, carried), part: carried, sim, group, space: currentSpace().space };
      taken?.();
      const seconds = link.current?.undo ?? 0;
      if (seconds > 0) outbox.hold(sms, seconds * 1000, deliver);
      else await deliver(sms);
      return true;
    } catch (error) {
      setNote(t('Not sent. {error}', { error: errorText(error) }));
      return false;
    }
  }

  // The words as they go: without accents, Greek in capitals, when the owner chose so and that keeps
  // a plain SMS in the GSM alphabet (lib/sms-count.ts); an MMS costs the same either way.
  function sent(text: string, carried: Part | null = null): string {
    if (!link.current?.plain || carried || group) return text;
    return withoutAccents(text) ?? text;
  }

  // Sends what is typed, and the part with it.
  async function send() {
    const text = draft.trim();
    if ((!text && !part) || sending) return;
    setSending(true);
    try {
      await go(text, part, () => {
        setDraft('');
        setPart(null);
      });
    } finally {
      setSending(false);
    }
  }

  // Where you are, as an SMS of its geo: address and a map's link, which every phone opens.
  function sendPlace(place: Place) {
    setPlacing(false);
    void go(placeSms(place), null);
  }

  // A built-in sticker, as its picture made on this phone (lib/sticker-send.ts), small enough for
  // one MMS, alone in it, as a voice message goes; when none could be made, nothing goes.
  async function sendSticker(name: string) {
    if (drawing.current) return;
    drawing.current = true;
    setStickerNote('');
    try {
      const picture = await stickerToSend(name, stickerImage, MMS_MAX);
      if (!stickerOpen.current) return;
      if (!picture) {
        setStickerNote(t('This sticker could not be made into a picture. Try again.'));
        return;
      }
      setStickering(false);
      await go('', { bytes: picture.bytes, mime: picture.mime });
    } finally {
      drawing.current = false;
    }
  }

  // A contact of the phone's, as a contact card to send with the words typed.
  async function pickCard(card: PhoneCard) {
    setNote('');
    try {
      const photo = card.phone?.photo ? await phoneContactPhoto(card.phone.id).catch(() => null) : null;
      setPart({ bytes: contactVCard(card, photo ? fromBase64(photo) : null, MMS_MAX), mime: CARD_MIME, name: card.name });
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Takes back an SMS before it goes: its words, and its part, come back into the field.
  function takeBack(id: string) {
    const sms = outbox.take(id);
    if (!sms) return;
    setDraft((typed) => (typed.trim() ? `${sms.text}\n${typed}` : sms.text));
    if (sms.part) setPart(sms.part);
  }

  // Keeps the SMS typed to go at `at`: sealed in the space, and held by Android until then, which
  // sends it then with Erevos closed too (lib/sms-later.ts). Asked now whether Erevos may send, as
  // it cannot ask then.
  async function sendLater(at: number) {
    keepsPlace.current = false;
    const text = draft.trim();
    const sms = link.current;
    setLaterMenu(false);
    if (!text || !sms || group || part || at <= Date.now()) return;
    setNote('');
    try {
      if (text.length > LATER_TEXT) throw new Error(t('It is too long to send later.'));
      await maySendSms();
      if (!(await sms.addLater({ to, text: sent(text), at, sim }))) throw new Error(t('{n} SMS already wait to go later.', { n: sms.later.length }));
      setDraft('');
      setLater(sms.later.filter((l) => sameNumber(l.to, to)));
      laterChanged();
      setNote(t('It goes on {when}, with Erevos closed too; if the phone is off then, as soon as it is on again. Tap it to cancel it.', { when: laterLabel(at) }));
    } catch (error) {
      setNote(t('Not kept. {reason}', { reason: error instanceof Error ? error.message : String(error) }));
    }
  }

  function cancelLater(sms: LaterSms) {
    ask(t('SMS later'), t('Cancel this SMS? It has not gone, and will not.'), [
      { text: t('Keep it'), style: 'cancel' },
      {
        text: t('Cancel it'),
        style: 'destructive',
        onPress: () => {
          const kept = link.current;
          if (!kept) return;
          void cancelSmsLater(kept, sms.id)
            .then((cancelled) => {
              setLater(kept.later.filter((l) => sameNumber(l.to, to)));
              laterChanged();
              if (!cancelled) {
                setNote(t('It had gone already.'));
                load();
              }
            })
            .catch((error) => setNote(t('Not cancelled. {reason}', { reason: error instanceof Error ? error.message : String(error) })));
        },
      },
    ]);
  }

  // An SMS for later a backup brought back, whose time came before it was restored: it went from
  // nowhere here, and the phone the backup came from may have sent it. The owner sends it now, or
  // deletes it.
  function heldLater(sms: LaterSms) {
    const forget = async () => {
      const kept = link.current;
      if (!kept) return false;
      const cancelled = await cancelSmsLater(kept, sms.id);
      setLater(kept.later.filter((l) => sameNumber(l.to, to)));
      laterChanged();
      return cancelled;
    };
    ask(t('SMS later'), t('This SMS was to go on {when}, before this backup was restored, and did not go from this phone. The phone the backup came from may have sent it already.', { when: laterLabel(sms.at) }), [
      { text: t('Keep it'), style: 'cancel' },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: () => void forget().catch((error) => setNote(t('Not deleted. {reason}', { reason: errorText(error) }))),
      },
      {
        text: t('Send now'),
        onPress: () => {
          void (async () => {
            await maySendSms();
            if (!(await forget())) {
              setNote(t('It had gone already.'));
              load();
              return;
            }
            await deliver({ id: toBase64Url(randomBytes(9)), to: sms.to, text: sms.text, part: null, sim: sms.sim, group: false, space: currentSpace().space });
          })().catch((error) => setNote(t('Not sent. {error}', { error: errorText(error) })));
        },
      },
    ]);
  }

  // One of ours that did not go, or did not reach their phone, goes again, in its place.
  function sendAgain(m: SmsMessage) {
    setChosen(null);
    sendSmsAgain(m, to, sim, { sent: load, note: setNote });
  }

  // Pins a message over the conversation for the owner alone, or takes the pin away.
  function setPin(m: SmsMessage, on: boolean) {
    const kept = link.current;
    if (!kept) return;
    pinWork.current = pinWork.current
      .then(() => kept.pinMessage(to, { id: smsLineId(m), at: m.at }, on))
      .then(() => {
        setPins(kept.messagePins(to));
        if (on) setPinAt(0);
      })
      .catch((error) => setNote(errorText(error)));
  }

  // A message gone from the phone is pinned no more.
  function unpinGone(m: SmsMessage) {
    if (isPinned(pins, m)) setPin(m, false);
  }

  // Deletes a message from the phone after the seconds Undo shows; until then it only hides.
  function deleteOne(m: SmsMessage) {
    setChosen(null);
    const why = deleteSms(m, to, () => {
      unpinGone(m);
      load();
    });
    if (why) setNote(why);
  }

  // Goes to a message in the thread, as far as it is drawn.
  function goTo(id: string) {
    const y = placed.current.get(id);
    if (y === undefined) return;
    keepsPlace.current = true;
    thread.current?.scrollTo({ y: Math.max(0, y - BELOW_TOP), animated: true });
  }

  const mayAnswer = numbers.length > 0;
  const pinnedNow = pinnedShown(pins, shown);
  const pinIndex = Math.min(pinAt, Math.max(0, pinnedNow.length - 1));
  // The messages chosen, in the order they show.
  const picked = selection.on ? shown.filter((m) => selection.chosen.has(smsLineId(m))) : [];
  const lineOf = (m: SmsMessage) => m.text.split('\n')[0].trim() || (partsOf(m)[0] ? partWord(partsOf(m)[0].type) : '');
  // What an MMS carries can be added: a picture or a contact card where this build sends MMS, where you are where the phone finds it.
  const canPart = mmsReady();
  const partLabel = (p: Part) =>
    p.mime.startsWith('image/')
      ? t('Picture · {size} KB · remove', { size: Math.ceil(p.bytes.length / 1024) })
      : t('{what} · {size} KB · remove', { what: p.name ? `${partWord(p.mime)} · ${p.name}` : partWord(p.mime), size: Math.ceil(p.bytes.length / 1024) });
  return (
    <KeyboardPaddedView bottom={insets.bottom} style={styles.screen}>
      {selection.on ? (
        <SelectBar
          count={picked.length}
          onCancel={selection.clear}
          onAll={() => selection.set(shown.map(smsLineId))}
          onCopy={
            CAN_COPY
              ? () => {
                  const text = chosenText(shown, selection.chosen);
                  selection.clear();
                  if (text) void copyText(text).then((done) => setNote(done ? t('Copied. Any app that reads the clipboard can read it now.') : t('Not done')));
                }
              : undefined
          }
          onForward={() => {
            const one = forwardOf(shown, selection.chosen);
            selection.clear();
            if (one) setForwarding(one);
          }}
          onDelete={
            smsMirrored()
              ? undefined
              : () =>
                  deleteSmsMany(picked, to, {
                    gone: (id) => {
                      const m = picked.find((p) => smsLineId(p) === id);
                      if (m) unpinGone(m);
                      load();
                    },
                    confirmed: selection.clear,
                    note: setNote,
                  })
          }
        />
      ) : null}
      <ChatHistory
        tools={history}
        name={title}
        messages={() => smsHistory(shown, group ? whose : undefined)}
        kept={() => smsMessages(to, SMS_KEPT).then((all) => smsHistory(shownMessages(all, trashed).filter((m) => !hidden.has(smsLineId(m))), group ? whose : undefined))}
        goTo={(id) => placed.current.has(id) && (goTo(id), true)}
        drawMore={(count) => {
          drawn.current = Math.max(drawn.current, count + SMS_BEFORE);
          load();
        }}
        exportable
        say={setNote}
      />
      {/* Who the chat is with: fixed over the thread, it stays while the thread scrolls (#12). */}
      <View style={styles.head}>
        {face ? <Image source={{ uri: face }} style={styles.face} onError={() => setFace('')} accessibilityIgnoresInvertColors /> : null}
        <View style={styles.headText}>
          <Text variant="title">{title}</Text>
          {group ? <Text tone="muted">{plural(numbers.length, 'Group MMS · {n} number', 'Group MMS · {n} numbers')}</Text> : names[to] ? <Text tone="muted">{to}</Text> : null}
          {inContacts === false ? (
            <View style={styles.addContact}>
              <Button title={t('Add to contacts')} kind="secondary" compact onPress={() => router.push(newContactHref(numbers[0]))} />
            </View>
          ) : null}
          {folder !== 'list' ? (
            <Text variant="caption" color={colors.warning}>
              {folder === 'spam' ? t('In Spam') : folder === 'archived' ? t('Archived') : t('In the Trash')}
            </Text>
          ) : null}
          {spamFor ? (
            <Text variant="caption" tone="muted">
              {spamWhy(spamFor)}
            </Text>
          ) : null}
        </View>
        {!group && numbers.length === 1 && canDial(numbers[0]) ? <DialTile number={numbers[0]} onFailed={setNote} /> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('More')}
          hitSlop={8}
          onPress={() => setMenu({ address: to, name: title, at: last?.at ?? Date.now(), folder })}
          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
        >
          <MoreIcon color={colors.text} />
        </Pressable>
      </View>
      {!selection.on && pinnedNow.length > 0 ? (
        <View style={styles.pinned}>
          <Pinned
            index={pinIndex}
            count={pinnedNow.length}
            line={lineOf(pinnedNow[pinIndex])}
            onPress={() => {
              goTo(smsLineId(pinnedNow[pinIndex]));
              setPinAt((pinIndex + 1) % pinnedNow.length);
            }}
          />
        </View>
      ) : null}
      <View style={styles.frame}>
        <ScrollView
          ref={thread}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => keepsPlace.current || thread.current?.scrollToEnd({ animated: false })}
          onScroll={onScroll}
          scrollEventThrottle={100}
        >
          <Card>
            <Text variant="caption" color={colors.warning}>
              {t('Plain SMS: not encrypted. The phone company can read these messages.')}
            </Text>
            {tools}
            {order && !smsMirrored() && smsToolsReady() ? (
              <Row>
                <ChatTimer
                  seconds={vanishTimer(rules)}
                  note={t('New messages, sent or received, go from this phone that long after they were sent, or as soon as Erevos runs again. The other phone keeps them: an SMS cannot be deleted there. Messages already here stay.')}
                  onChoose={(after) => {
                    const kept = link.current;
                    if (!kept) return;
                    void kept
                      .setVanish(to, after)
                      .then((done) => (done ? setOrder(kept.state) : setNote(t('Not done'))))
                      .catch(() => setNote(t('Not done')));
                  }}
                />
              </Row>
            ) : null}
            {contacts.length > 0 && !group && mayAnswer ? (
              choosing ? (
                <>
                  <Text tone="muted">{t('Which contact is {number}? Messages to this number will go through Erevos.', { number: to })}</Text>
                  <Row wrap>
                    {contacts.map((c) => (
                      <Chip
                        key={c.identity}
                        label={c.name ? cleanName(c.name) : t('contact {id}', { id: c.identity.slice(0, 8) })}
                        onPress={() => router.replace(`/chat?contact=${c.identity}&phone=${encodeURIComponent(to)}`)}
                      />
                    ))}
                  </Row>
                </>
              ) : (
                <Button title={t('This number has Erevos: link it to a contact')} kind="ghost" compact onPress={() => setChoosing(true)} />
              )
            ) : null}
          </Card>
          {trashed && messages.length > shown.length && hidden.size === 0 ? (
            <Text variant="caption" tone="faint">
              {t('The messages before are in the Trash.')}
            </Text>
          ) : null}
          {shown.map((m) => {
            const id = smsLineId(m);
            const isChosen = selection.chosen.has(id);
            return (
              <View
                key={id}
                onLayout={(event) => {
                  placed.current.set(id, event.nativeEvent.layout.y);
                  if (id !== goal.current) return;
                  goal.current = '';
                  keepsPlace.current = true;
                  setTimeout(() => goTo(id), 300);
                }}
                style={isChosen ? [styles.chosenRow, chosenStyle(colors)] : undefined}
              >
                <Pressable
                  // While messages are chosen, a tap adds this one or takes it out.
                  onPress={selection.on ? () => selection.toggle(id) : smsFailed(m) ? () => sendAgain(m) : undefined}
                  onLongPress={() => (selection.on ? selection.toggle(id) : setChosen(m))}
                  accessibilityRole={selection.on || smsFailed(m) ? 'button' : undefined}
                  accessibilityState={selection.on ? { selected: isChosen } : undefined}
                  style={[styles.bubble, m.mine ? styles.mine : styles.theirs]}
                >
                  {(m.pictures ?? []).map((p) => (
                    <Image key={p.uri} source={{ uri: p.uri }} style={styles.picture} resizeMode="cover" accessibilityLabel={t('Picture')} />
                  ))}
                  {group && !m.mine && m.from ? (
                    <Text variant="caption" tone="muted">
                      {whose(m.from)}
                    </Text>
                  ) : null}
                  {m.text ? (
                    // Not selectable here, so holding the message down shows what it can do; its words
                    // can be selected and copied there.
                    <Text>
                      <LinkedText text={m.text} />
                    </Text>
                  ) : null}
                  <SmsExtras m={m} />
                  {reactions.get(id)?.length ? (
                    <Text accessibilityLabel={t('Reactions: {marks}', { marks: reactions.get(id)!.join(' ') })}>{reactions.get(id)!.join(' ')}</Text>
                  ) : null}
                  <Text variant="caption" tone="faint">
                    {new Date(m.at).toLocaleString(locale())}
                    {sims.length > 1 && simLabel(sims, m.sim) ? ` · ${simLabel(sims, m.sim)}` : ''}
                    {m.mine && smsMark(m.state) ? ` · ${smsMark(m.state)}` : ''}
                    {isPinned(pins, m) ? ` · ${t('Pinned')}` : ''}
                    {keep.starred.has(id) ? ' · ★' : ''}
                  </Text>
                  {smsFailed(m) ? (
                    <Text variant="caption" color={colors.danger}>
                      {t('Tap to send it again.')}
                    </Text>
                  ) : null}
                  {CAN_COPY && codes.get(smsLineId(m)) ? (
                    <Row>
                      <Chip
                        label={t('Copy code')}
                        onPress={() => {
                          void copyText(codes.get(smsLineId(m))!).then((done) => setNote(done ? t('The code is copied: any app that reads the clipboard can read it.') : t('The code could not be copied.')));
                        }}
                      />
                    </Row>
                  ) : null}
                </Pressable>
              </View>
            );
          })}
          {atCarrier.map((w) => (
            <View key={w.location} style={[styles.bubble, styles.theirs]}>
              <Text variant="caption" tone="muted">
                {t('MMS · {size} KB', { size: String(Math.max(1, Math.round(w.size / 1024))) })}
              </Text>
              <Button
                title={w.fetching ? t('Fetching…') : t('Fetch (may cost)')}
                onPress={() => {
                  setAtCarrier((now) => now.map((x) => (x.location === w.location ? { ...x, fetching: true, failed: false } : x)));
                  fetchMms(w.location).catch((error: unknown) => setNote(errorText(error)));
                }}
              />
              {w.failed && !w.fetching ? (
                <Text variant="caption" tone="muted">
                  {t('It did not come. Try again with mobile data on.')}
                </Text>
              ) : null}
              <Text variant="caption" tone="faint">
                {new Date(w.at).toLocaleString(locale())}
              </Text>
            </View>
          ))}
          {later.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => (waitsForOwner(l, restored) ? heldLater(l) : cancelLater(l))}
              accessibilityRole="button"
              style={[styles.bubble, styles.mine, styles.later]}
            >
              <Text>{l.text}</Text>
              {waitsForOwner(l, restored) ? (
                <Text variant="caption" color={colors.danger}>
                  {t('Not sent · was to go {when}. Tap to send it or delete it.', { when: laterLabel(l.at) })}
                </Text>
              ) : (
                <Text variant="caption" tone="faint">
                  {t('Scheduled · {when}', { when: laterLabel(l.at) })}
                  {sims.length > 1 && simLabel(sims, l.sim) ? ` · ${simLabel(sims, l.sim)}` : ''}
                </Text>
              )}
            </Pressable>
          ))}
          {waiting.map(({ item, at }) => (
            <Pressable key={item.id} onPress={() => takeBack(item.id)} accessibilityRole="button" style={[styles.bubble, styles.mine, styles.later]}>
              {item.part ? <Text variant="caption">{partWord(item.part.mime)}</Text> : null}
              {item.text ? <Text>{item.text}</Text> : null}
              <Text variant="caption" color={colors.accentText}>
                {t('Goes in {n} s · tap to take it back', { n: Math.max(1, Math.ceil((at - now) / 1000)) })}
              </Text>
            </Pressable>
          ))}
          {note ? <Text tone="muted">{note}</Text> : null}
        </ScrollView>
        <ThreadArrows
          start={away.start}
          end={away.end}
          seen={away.seen}
          onSeen={() => {
            const y = left.current ? placed.current.get(left.current) : undefined;
            if (y === undefined) return;
            keepsPlace.current = true;
            thread.current?.scrollTo({ y: Math.max(0, y - BELOW_TOP), animated: true });
          }}
          onStart={() => {
            keepsPlace.current = true;
            thread.current?.scrollTo({ y: 0, animated: true });
          }}
          onEnd={() => {
            keepsPlace.current = false;
            thread.current?.scrollToEnd({ animated: true });
          }}
        />
      </View>
      {mayAnswer && (sims.length > 1 || (twoSims && sims.length === 0) || part) ? (
        <Row wrap style={styles.options}>
          {sims.length > 1 ? (
            sims.map((s) => <Chip key={s.id} label={`SIM ${s.slot + 1}${s.name ? ` · ${s.name}` : ''}`} selected={sim === s.id} onPress={() => pickSim(s.id)} />)
          ) : twoSims && sims.length === 0 ? (
            <Chip label={t('Choose the SIM')} onPress={() => void askSims()} />
          ) : null}
          {part ? <Chip label={partLabel(part)} selected onPress={() => setPart(null)} /> : null}
        </Row>
      ) : null}
      {mayAnswer && !part && !group && draft.trim() ? <SmsCounter text={sent(draft.trim())} /> : null}
      {mayAnswer ? (
        <View style={styles.composer}>
          {!voice.recording ? (
            <IconButton label={t('Attach and more')} onPress={() => setAttaching(true)} onLongPress={() => setQuicking(true)}>
              <PlusIcon color={colors.text} size={22} />
            </IconButton>
          ) : null}
          {voice.recording ? (
            <RecordingLine />
          ) : (
            <Input value={draft} onChangeText={setDraft} placeholder={part || group ? t('MMS (not encrypted)') : t('SMS (not encrypted)')} multiline style={styles.input} />
          )}
          {/* With nothing typed, the microphone: held, it records a voice message for an MMS. */}
          {canPart && !draft.trim() && !part ? (
            <MicButton voice={voice} disabled={sending} />
          ) : (
            <SendDisc
              busy={sending}
              disabled={!draft.trim() && !part}
              onPress={() => void send()}
              onLongPress={!group && !part && draft.trim() && !smsMirrored() ? () => setLaterMenu(true) : undefined}
            />
          )}
        </View>
      ) : (
        <View style={styles.composer}>
          <Text variant="caption" tone="muted" style={styles.input}>
            {t('It writes with a name, not a number, so it cannot be answered.')}
          </Text>
        </View>
      )}
      <UndoBar bottom={84} />
      <Sheet visible={laterMenu} onClose={() => setLaterMenu(false)} title={t('SMS later')}>
        {laterMenu ? <LaterPicker onPick={(at) => void sendLater(at)} /> : null}
        <Text variant="caption" tone="muted">
          {t('It goes at that time, with Erevos closed and locked too; if the phone is off then, as soon as it is on again. Until then it is not in the phone\'s SMS: it waits locked with a key of this phone. Text only, to one number.')}
        </Text>
      </Sheet>
      <Sheet visible={chosen !== null} onClose={() => setChosen(null)}>
        {chosen ? (
          <>
            {chosen.text ? (
              <>
                <ScrollView nestedScrollEnabled style={styles.chosenText}>
                  <Text selectable>{chosen.text}</Text>
                </ScrollView>
                <Text variant="caption" tone="muted">
                  {t('Hold the words down to copy them.')}
                </Text>
              </>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setForwarding(chosen);
                setChosen(null);
              }}
              style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
            >
              <Text variant="bodyStrong">{t('Forward')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                selection.start(smsLineId(chosen));
                setChosen(null);
              }}
              style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
            >
              <Text variant="bodyStrong">{t('Select')}</Text>
            </Pressable>
            {chosen.id >= 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setPin(chosen, !isPinned(pins, chosen));
                  setChosen(null);
                }}
                style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
              >
                <Text variant="bodyStrong">{isPinned(pins, chosen) ? t('Unpin') : t('Pin for me')}</Text>
              </Pressable>
            ) : null}
            {keep
              .actions({
                star: chosen.id >= 0 ? { id: smsLineId(chosen), at: chosen.at, mine: chosen.mine, line: lineOf(chosen) } : null,
                // An MMS's parts are read on the phone that has it, not on a device given its SMS.
                sticker: !smsMirrored() && chosen.pictures?.[0] ? () => smsPictureBytes(chosen.pictures![0].uri) : null,
                file: !smsMirrored() && partsOf(chosen)[0] ? { name: keptName(undefined, partsOf(chosen)[0].type), mime: partsOf(chosen)[0].type, fetch: () => smsPictureBytes(partsOf(chosen)[0].uri) } : null,
              })
              .map((action) => (
                <Pressable
                  key={action.title}
                  accessibilityRole="button"
                  onPress={() => {
                    setChosen(null);
                    action.onPress();
                  }}
                  style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
                >
                  <Text variant="bodyStrong">{action.title}</Text>
                </Pressable>
              ))}
            {remindPlace('space') ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setReminding({ from: `SMS · ${title}`, text: chosen.text || t('Picture') });
                  setChosen(null);
                }}
                style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
              >
                <Text variant="bodyStrong">{t('Remind me')}</Text>
              </Pressable>
            ) : null}
            {smsFailed(chosen) ? (
              <Pressable accessibilityRole="button" onPress={() => sendAgain(chosen)} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
                <Text variant="bodyStrong">{t('Send again')}</Text>
              </Pressable>
            ) : null}
            {smsMirrored() ? null : (
              <Pressable accessibilityRole="button" onPress={() => deleteOne(chosen)} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
                <Text variant="bodyStrong" color={colors.danger}>
                  {t('Delete')}
                </Text>
              </Pressable>
            )}
          </>
        ) : null}
      </Sheet>
      <SmsForward message={forwarding} contacts={contacts} onClose={() => setForwarding(null)} onNote={setNote} />
      <RemindSheet of={reminding} where="space" onClose={() => setReminding(null)} say={setNote} />
      <QuickTexts
        visible={quicking}
        link={link.current}
        onClose={() => setQuicking(false)}
        onPick={(text) => setDraft((typed) => (typed.trim() ? `${typed.trimEnd()} ${text}` : text))}
      />
      <Sheet visible={attaching} onClose={() => setAttaching(false)} title={t('Attach and more')}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setAttaching(false);
            setQuicking(true);
          }}
          style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
        >
          <Text variant="bodyStrong">{t('Quick texts')}</Text>
          <Text variant="caption" tone="muted">
            {t('Or hold + down.')}
          </Text>
        </Pressable>
        {canPart ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setAttaching(false);
              void addPhoto();
            }}
            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
          >
            <Text variant="bodyStrong">{t('Photo')}</Text>
          </Pressable>
        ) : null}
        {canPart ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setAttaching(false);
              void addVideo(true);
            }}
            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
          >
            <Text variant="bodyStrong">{t('Record a video')}</Text>
            <Text variant="caption" tone="muted">
              {t("Up to {n} seconds, in the small picture an MMS takes. The camera app keeps it in the phone's videos too.", { n: String(MMS_VIDEO_SECONDS) })}
            </Text>
          </Pressable>
        ) : null}
        {canPart ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setAttaching(false);
              void addVideo(false);
            }}
            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
          >
            <Text variant="bodyStrong">{t('Video from the phone')}</Text>
            <Text variant="caption" tone="muted">
              {t('Only one small enough for an MMS, about {n} KB.', { n: String(Math.round(MMS_MAX / 1024)) })}
            </Text>
          </Pressable>
        ) : null}
        {CAN_PLACE ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setAttaching(false);
              setPlacing(true);
            }}
            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
          >
            <Text variant="bodyStrong">{t('Location')}</Text>
          </Pressable>
        ) : null}
        {canPart ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setAttaching(false);
              setChoosingCard(true);
            }}
            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
          >
            <Text variant="bodyStrong">{t('Contact card')}</Text>
          </Pressable>
        ) : null}
        {canPart ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setAttaching(false);
              setStickerNote('');
              setStickering(true);
            }}
            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
          >
            <Text variant="bodyStrong">{t('Sticker')}</Text>
          </Pressable>
        ) : null}
      </Sheet>
      <Sheet visible={stickering} onClose={() => setStickering(false)} title={t('Send a sticker')}>
        <StickerPicker
          onPick={(name) => void sendSticker(name)}
          mine={
            keepPlace
              ? {
                  place: keepPlace,
                  onPick: (sticker) => {
                    setStickering(false);
                    void ownStickerPart(sticker).then((picture) => go('', picture), (error: unknown) => setNote(errorText(error)));
                  },
                }
              : undefined
          }
        />
        {stickerNote ? (
          <Text variant="caption" tone="muted">
            {stickerNote}
          </Text>
        ) : null}
      </Sheet>
      <PlaceSheet visible={placing} onClose={() => setPlacing(false)} onSend={sendPlace} said={t('Plain SMS: not encrypted. The phone company can read these messages.')} />
      <ContactsSheet<CardRow> visible={choosingCard} onClose={() => setChoosingCard(false)} rows={contactRows} onPick={(row) => void pickCard(row.card)} phoneOnly />
      <SmsActions target={menu} onClose={() => setMenu(null)} onTrashed={() => router.canGoBack() && router.back()} more={historyRows(history, true)} />
    </KeyboardPaddedView>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.ground },
    frame: { flex: 1 },
    thread: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: space.lg, gap: space.sm },
    head: { flexDirection: 'row', alignItems: 'center', gap: space.md, width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: space.lg, paddingTop: space.sm },
    headText: { flex: 1, gap: 2 },
    addContact: { flexDirection: 'row', marginTop: space.xs },
    face: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceAlt },
    more: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    pressed: { backgroundColor: colors.surfacePressed },
    bubble: { maxWidth: '85%', padding: space.md, borderRadius: radius.lg, gap: 2 },
    mine: { alignSelf: 'flex-end', backgroundColor: colors.surfaceAlt },
    theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface },
    composer: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, padding: space.md, borderTopWidth: 1, borderTopColor: colors.border },
    input: { flex: 1, maxHeight: 140 },
    counter: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.xs },
    options: { paddingHorizontal: space.md, paddingTop: space.sm },
    picture: { width: 220, height: 220, borderRadius: radius.md, backgroundColor: colors.border },
    later: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
    pinned: { paddingTop: space.sm },
    chosenRow: { marginHorizontal: -space.sm, paddingHorizontal: space.sm },
    menuRow: { paddingVertical: space.md, paddingHorizontal: space.sm, borderRadius: radius.md },
    chosenText: { flexGrow: 0, maxHeight: 220, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  });

// How many SMS what is typed costs, shown once it nears or passes one SMS: 160 letters in the GSM
// alphabet, 70 with Greek small letters, accents or an emoji (lib/sms-count.ts).
function SmsCounter({ text }: { text: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const count = smsCount(text);
  if (count.parts === 1 && count.used < count.each - 20) return null;
  return (
    <View style={styles.counter}>
      <Text variant="caption" tone="faint" style={styles.input}>
        {count.gsm ? t('{n} letters an SMS', { n: String(count.each) }) : t('Greek, accents or emoji: {n} letters an SMS', { n: String(count.each) })}
      </Text>
      <Text variant="caption" style={{ color: count.parts > 1 ? colors.warning : colors.textMuted, fontWeight: '700' }}>
        {t('{used} / {n} SMS', { used: String(count.used), n: String(count.parts) })}
      </Text>
    </View>
  );
}

