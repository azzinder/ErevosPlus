// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useIsFocused } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatLookSheet } from './chat-look';
import { canNotifyChats, ChatNotifySheet } from './chat-notify-sheet';
import { ChatPinGate } from './chat-pin-gate';
import { DayMark } from './chat-thread-lines';
import { DraftComposer, IconButton, useDraft } from './composer';
import { useGlassBlur } from './glass';
import { useGroupMedia } from './group-media';
import { useGroupMessages } from './group-messages';
import { useGroupsWhere } from './groups-at';
import { BackIcon, MoreIcon, ShieldIcon } from './icons';
import { KeyboardPaddedView } from './keyboard';
import { PasswordSheet } from './PasswordSheet';
import { KeyFace } from './key-face';
import { LinkedText } from './linked-text';
import { usePublicGroup } from './public-group';
import { chosenStyle } from './select-bar';
import { PhoneSign, ShortcutTile, VideoSign } from './shortcut-tile';
import { ThreadArrows, useThreadAway } from './thread-arrows';
import { Button, Card, Chip, Field, Input, Row, Sheet, Text, TextButton } from './ui';
import { choose, confirm } from '../lib/alert';
import { screenOfGroup, showOnScreen } from '../lib/background';
import { forwardedTo } from '../lib/forward';
import { currentCall } from '../lib/call';
import { sameDay } from '../lib/day-mark';
import { shownLine } from '../lib/call-lines';
import { callPermissions } from '../lib/call-permissions';
import { currentGroupCall } from '../lib/group-call';
import { groupCallGoingOn, joinGroupCall, onGroupCallChange, startGroupCall } from '../lib/group-calls';
import { MAX_GROUP_NAME } from '../lib/group-signal';
import { ASK_AGAIN, MAX_GROUP_DESC, MAX_GROUP_TEXT, memberName, noteText, type GroupInfo, type GroupMember } from '../lib/groups';
import { leftOff } from '../lib/left-off';
import { namesFor, typingMention, withMention } from '../lib/mentions';
import { takeShared } from '../lib/share-in';
import { press } from '../lib/haptics';
import { plural, t } from '../lib/i18n';
import { appShown, onAppShown } from '../lib/receiver';
import { keepPrivate } from '../lib/screen-privacy';
import { rtc } from '../lib/webrtc';
import { makeChatPin, opensChat, RELOCK_MS } from '../lock/chat-pin';
import { ownSpaceKey } from '../lock/config';
import { useLock } from '../lock/context';
import { currentSpace } from '../lock/keys';
import { MAX_NAME } from '../lock/e2e-data';
import type { GroupMessage } from '../lock/group-data';
import { radius, space, withAlpha, type Colors } from '../theme/colors';
import { bubbleStyles } from '../theme/bubbles';
import { useStyles, useTheme } from '../theme/context';
import type { ChatLook } from '../theme/chat-theme';
import { ContactPicker, groupableContacts } from './contact-picker';
import { ChatMedia } from './chat-media';
import { groupMedia } from '../lib/chat-media';
import { IpStop } from '../lib/ip-warning';
import { throughTor } from '../lib/relay';
import { IpQuiet } from './ip-warning';

// A group chat (lib/groups.ts), of the space or of a hidden place (components/groups-at.tsx): its messages, each of others' with the sender's name, notes of who
// joined and left, and the message bar to write in (components/composer.tsx). Its members sheet,
// under ⋯, lists who is in it and what the group is about (its description); the admin adds
// contacts, takes members out, renames it and says what it is about, and anyone can leave. The call button at the top starts a call in the group (lib/group-calls.ts), and
// the members sheet a video call; the call going on shows above the messages, to join. "+" and the
// microphone in the bar send photos, files and voice messages (components/group-media.tsx).
// A message held down opens its menu, and its bubble shows what it answers, a sticker, a place, a
// poll, a contact card or a link's preview, its reactions, and how many answers its thread has; a
// thread shows alone, and messages chosen together have the top bar (components/group-messages.tsx).
// `at`: the tag of a message to go to, starred or found.
// In a group that is not public, the members sheet asks a member who is not a contact for their
// contact link (Add as contact), and names a contact who has no name yet; a member who asks for
// this phone's shows as a card over the messages, to Send or not (lib/groups.ts `askContact`),
// unless they are a contact here already. Asking and answering are the phone's, which holds the
// account's keys: a linked device names contacts, and the phone takes the name.
// A hidden place's group has no PIN of its own, as its hidden chats have none, and is never public.

type Contact = { identity: string; name: string };

// What asking for a contact link says, on the card and before Send in the members sheet: `who` is
// a member's label, which starts in small letters.
const askTitle = (who: string) => upperFirst(t('{who} asks for your contact link', { who }));
const upperFirst = (text: string) => {
  const [first = '', ...rest] = [...text];
  return first.toLocaleUpperCase() + rest.join('');
};
// The touch area around a control under a member's name: the line is short, the finger is not.
const TALL = { top: 14, bottom: 14, left: 8, right: 8 };
// The messages drawn while a group's PIN is asked for.
const NONE: GroupMessage[] = [];
const askBody = () => t('Only you see this. Send yours if you know who they are: you become each other’s contacts. If you don’t, they are not told.');

const pad = (n: number) => String(n).padStart(2, '0');
const clock = (at: number) => {
  const d = new Date(at);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Group `id`'s chat; `onBack` goes back from it. Its own look, and how to keep a new one, goes to
 * `onLook`, for the screen that draws the chat in it (components/chat-look.tsx, app/chat.tsx).
 */
export function GroupChat({ id, at, onBack, onLook }: { id: string; at?: string; onBack: () => void; onLook: (chat: ChatLook | null) => void }) {
  const { at: groupsAt, linked: groupsLinked } = useGroupsWhere();
  const hidden = groupsAt.hidden;
  const styles = useStyles(makeStyles);
  const { colors, look } = useTheme();
  const barBlur = useGlassBlur();
  const b = useMemo(() => bubbleStyles(look.bubbles, colors, look.textSize), [look.bubbles, colors, look.textSize]);
  const insets = useSafeAreaInsets();
  // A narrow phone (360 wide): the top bar's picture is smaller, and what it is goes without its
  // shield, so the words fit beside the buttons, as in a contact's chat.
  const narrow = useWindowDimensions().width < 400;
  const [info, setInfo] = useState<GroupInfo | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  // Words passed on from another app's Share (app/share.tsx, lib/forward.ts) start in the field.
  const { draft } = useDraft(() => forwardedTo(`group:${id}`)?.text ?? '');
  const [note, setNote] = useState('');
  const [sheet, setSheet] = useState(false);
  // A public group's ⋯: its video call, and its own screen.
  const [publicMenu, setPublicMenu] = useState(false);
  // Whether the group's own notifications show (lock/chat-notify.ts), and its own look (theme/look.ts).
  const [notifying, setNotifying] = useState(false);
  const [styling, setStyling] = useState(false);
  const [answering, setAnswering] = useState(false);
  // The group's photos, files, voice messages and links, apart (components/chat-media.tsx).
  const [mediaOpen, setMediaOpen] = useState(false);
  const [, setCalls] = useState(0);
  const scroll = useRef<ScrollViewInstance>(null);
  // Whether the thread is away from its start and its end, for the arrows to them, and from where it was left.
  const { away, onScroll, spot } = useThreadAway();
  // Where the group was left: the first message that was new when it opened, taken before it is read.
  const left = useRef<string | null | undefined>(undefined);
  // A public group (app/public-group.tsx): its members by the names they chose, and its own screen for them.
  const pub = usePublicGroup(id);
  // The names members go by, as their keys last said (lib/groups.ts saidName): shown for those who are no named contact.
  const [said, setSaid] = useState<Readonly<Record<string, string>>>({});
  const name = (identity: string) => (pub.isPublic ? pub.name(identity) : memberName(identity, contacts, (i) => said[i] ?? ''));
  // The name a member's picture takes its letter from: none for one who is not a named contact, as
  // "member 1a2b…" would give each the same letter.
  const faceName = (identity: string) => (pub.isPublic ? pub.name(identity) : (contacts.find((c) => c.identity === identity)?.name ?? ''));
  // A group locked with a PIN of its own (lock/chat-pin.ts) shows only once its PIN is typed, until
  // it closes or Erevos was away more than RELOCK_MS. Meanwhile it is not read, and none of its
  // messages is drawn: nothing of it lies under the gate (ChatPinGate).
  const [unlocked, setUnlocked] = useState(false);
  const gated = !hidden && !!info?.locked && !unlocked;
  const shown = gated ? NONE : messages;
  // Replies, reactions, pins, stickers, places, polls and the rest: the menu, sheets, and bubble parts.
  const parts = useGroupMessages({ id, info, messages: shown, name, onNote: setNote, scroll, at, draft });
  spot.current = () => (left.current ? (parts.yOf(left.current) ?? null) : undefined);
  // The @word being typed (lib/mentions.ts), and the members, but this phone, to name with it.
  const [typedName, setTypedName] = useState<string | null>(null);
  const [others, setOthers] = useState<string[]>([]);
  const naming = typedName !== null;
  useEffect(() => {
    if (!naming) return;
    let active = true;
    void groupsAt
      .groups()
      .then((groups) => groups.members(id))
      .then((list) => {
        if (active) setOthers(list.flatMap((m) => (m.about && !m.me ? [m.about.id] : [])));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [naming, id, groupsAt]);
  const nameable = typedName === null ? [] : namesFor(typedName, others.map((identity) => ({ identity, name: name(identity) })));
  // Photos, files and voice messages: the panel under the bar, the microphone, sheets, and their place in the bubbles.
  const media = useGroupMedia(id, shown, setNote, parts.attachMore, parts.thread);

  // A photo or file shared from another app goes as the group opens (lib/share-in.ts).
  useEffect(() => {
    let sending = Promise.resolve();
    for (let shared = takeShared(`group:${id}`); shared; shared = takeShared(`group:${id}`)) {
      const one = shared;
      sending = sending.then(() => media.sendShared(one));
    }
  }, [id]);

  const opened = useRef(false);
  opened.current = unlocked;
  useEffect(() => {
    let away = 0;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') away = Date.now();
      else if (state === 'active' && away) {
        if (Date.now() - away > RELOCK_MS) setUnlocked(false);
        away = 0;
      }
    });
    return () => subscription.remove();
  }, []);
  const [pinAsk, setPinAsk] = useState<'on' | 'off' | null>(null);
  const lock = useLock();
  // Opened with its PIN, it keeps out of screenshots and the recent apps preview, as hidden chats do.
  const pinOpen = !hidden && !!info?.locked && unlocked;
  useEffect(() => {
    if (!pinOpen) return;
    keepPrivate('chat', true);
    return () => keepPrivate('chat', false);
  }, [pinOpen]);

  // On the screen, what comes in the group only sounds (lib/background.ts); in hidden chats, as they say.
  const focused = useIsFocused();
  useEffect(() => (id && focused && !gated && !hidden ? showOnScreen(screenOfGroup(id)) : undefined), [id, focused, gated, hidden]);
  // What comes while it is not on the screen stays not read, for the number on Erevos's icon (lib/background.ts).
  const focusedNow = useRef(focused);
  focusedNow.current = focused;

  // A call going on in the group shows, until its members' phones go quiet.
  useEffect(() => {
    const stop = onGroupCallChange(() => setCalls((n) => n + 1));
    const timer = setInterval(() => setCalls((n) => n + 1), 30_000);
    return () => {
      stop();
      clearInterval(timer);
    };
  }, []);

  // Their chats' contacts, read again whenever the group changes: one added from it gets their name.
  const readContacts = useCallback(() => {
    void groupsAt
      .chats()
      .then(({ e2e }) => setContacts(e2e.contacts().map((c) => ({ identity: c.identity, name: c.name }))))
      .catch(() => undefined);
  }, [groupsAt]);

  // The group's own look, told to the screen that draws it, until the chat closes.
  const ownLook = info?.look ?? null;
  const lookChat = useMemo<ChatLook>(() => ({ look: ownLook, save: async (look) => (await groupsAt.groups()).setLook(id, look) }), [ownLook, groupsAt, id]);
  useEffect(() => onLook(lookChat), [onLook, lookChat]);
  useEffect(() => () => onLook(null), [onLook]);

  const load = useCallback(async () => {
    const groups = await groupsAt.groups();
    const listed = groups.list().find((g) => g.id === id) ?? null;
    const loaded = groups.messages(id);
    if (left.current === undefined && listed) {
      left.current = leftOff(
        loaded,
        listed.unread,
        (m) => m.tag,
        (m) => !m.from || !!m.note,
      );
    }
    setInfo(listed);
    setMessages(loaded);
    if (focusedNow.current && appShown() && (hidden || !listed?.locked || opened.current)) await groups.markRead(id, groupsAt.transport);
  }, [id, groupsAt, hidden]);

  // On the screen again, what came meanwhile is read then.
  useEffect(() => {
    if (!focused) return;
    void load().catch(() => undefined);
    return onAppShown((shown) => void (shown && load().catch(() => undefined)));
  }, [focused, load]);

  // Opens it, locked with its PIN, once that is typed, and reads it then.
  async function openWithPin(pin: string): Promise<boolean> {
    const groups = await groupsAt.groups();
    const kept = groups.pinOf(id);
    if (kept && !(await opensChat(pin, kept))) return false;
    setUnlocked(true);
    opened.current = true;
    await groups.markRead(id, groupsAt.transport).catch(() => undefined);
    return true;
  }

  // Takes its PIN off with the password that opens the space, its PIN forgotten.
  async function forgotPin(password: string): Promise<boolean> {
    if (!(await ownSpaceKey(currentSpace().space, password))) return false;
    const groups = await groupsAt.groups();
    await groups.setPin(id, null);
    setUnlocked(true);
    opened.current = true;
    await groups.markRead(id, groupsAt.transport).catch(() => undefined);
    setNote(t('The PIN of {name} is off.', { name: info?.name ?? '' }));
    return true;
  }

  async function lockWithPin(pin: string) {
    const groups = await groupsAt.groups();
    await groups.setPin(id, await makeChatPin(pin));
    setUnlocked(true);
    opened.current = true;
    setPinAsk(null);
    setNote(t('{name} is locked with a PIN now: it asks for it each time the chat opens.', { name: info?.name ?? '' }));
  }

  async function takePinOff(pin: string): Promise<boolean> {
    const groups = await groupsAt.groups();
    const kept = groups.pinOf(id);
    if (kept && !(await opensChat(pin, kept))) return false;
    await groups.setPin(id, null);
    setPinAsk(null);
    return true;
  }

  useEffect(() => {
    let stop = () => undefined as void;
    let active = true;
    readContacts();
    void groupsAt
      .groups()
      .then((groups) => {
        if (!active) return;
        void load();
        setSaid(groups.saidNames());
        // Reading the members learns the names they go by now.
        void groups.members(id).catch(() => undefined);
        // Marking it read changes it too: only what came reloads it.
        let seen = groups.messages(id).length;
        stop = groups.onChange(() => {
          setSaid(groups.saidNames());
          const now = groups.messages(id).length;
          const listed = groups.list().find((g) => g.id === id) ?? null;
          setInfo(listed);
          readContacts();
          if (now !== seen) {
            seen = now;
            void load();
          }
        });
      })
      .catch((error) => setNote(error instanceof Error ? error.message : String(error)));
    return () => {
      active = false;
      stop();
    };
  }, [id, groupsAt, load, readContacts]);

  async function send() {
    const text = draft.text().trim();
    if (!text) return;
    draft.set('');
    setNote('');
    try {
      await parts.send(text);
    } catch (error) {
      draft.set(text);
      // Not sent at the owner's own Cancel (components/ip-warning.tsx): the words stay, and nothing is said.
      if (!(error instanceof IpStop)) setNote(error instanceof Error ? error.message : String(error));
    }
  }

  // The card's Send or Don't, for the member who asked first.
  async function answer(member: string, send: boolean) {
    setNote('');
    setAnswering(true);
    try {
      const groups = await groupsAt.groups();
      if (send) await groups.answerContact(id, member, groupsAt.transport);
      else await groups.declineContact(id, member);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setAnswering(false);
    }
  }

  // Starts a call, or joins the one going on, as it is: voice or video.
  async function call(asked: boolean) {
    setNote('');
    // On a linked device the group is the phone's, and so are its calls (lib/devices.ts).
    if (groupsLinked()) {
      setNote(t('Group calls ring on the phone that holds this account, for now. Call from there.'));
      return;
    }
    if (currentCall() || currentGroupCall()) {
      setNote(t('There is a call already.'));
      return;
    }
    const going = groupCallGoingOn(id);
    const video = going ? going.video : asked;
    if (!(await callPermissions(video))) {
      setNote(video ? t('A video call needs the camera and the microphone.') : t('A call needs the microphone.'));
      return;
    }
    try {
      const relay = await groupsAt.calls.callRelay();
      const direct = t(
        "Your relay has no call relay beside it, so the call would go straight between the phones. That only works on the same Wi-Fi, and each phone in the call sees the others' addresses on it. With a call relay, none does.",
      );
      if (!relay && !(await confirm(t('Call without a call relay?'), direct, t('Call')))) return;
      if (going) await joinGroupCall(groupsAt.calls, id, relay, rtc);
      else await startGroupCall(groupsAt.calls, id, video, relay, rtc);
    } catch (error) {
      setNote(t('Could not call. {reason}', { reason: error instanceof Error ? error.message : String(error) }));
    }
  }

  // The bar at the top, on the bars' glass from the top of the screen, behind the status bar: while
  // messages are chosen, what can be done to them. Back leaves a thread shown alone, then the group.
  const bar = (children: ReactNode) => (
    <View style={[styles.topBar, { marginTop: -insets.top, paddingTop: insets.top + 2 }, barBlur]}>
      {parts.selectBar ?? (
        <View style={styles.header}>
          <IconButton label={t('Back')} onPress={parts.thread ? parts.closeThread : onBack}>
            <BackIcon color={colors.text} size={24} />
          </IconButton>
          {children}
        </View>
      )}
    </View>
  );

  if (!info) {
    return (
      <View style={styles.screen}>
        {bar(<View style={{ flex: 1 }} />)}
        <View style={[styles.center, { flex: 1 }]}>
          <Text tone="muted">{note || t('This group is not here.')}</Text>
        </View>
      </View>
    );
  }

  const out = info.status !== 'in';
  // The messages shown: those of the thread shown alone, or all.
  const lines = parts.thread ? shown.filter(parts.inThread) : shown;
  const going = out ? null : groupCallGoingOn(id);
  // Who asks for this phone's contact link, but a contact here already: the first, the rest wait
  // in the members sheet.
  const asks = info.asks.filter((a) => !contacts.some((c) => c.identity === a.id));
  const asker = out || pub.isPublic || groupsLinked() ? null : (asks[0] ?? null);
  // The panel under "+" closes first: it is not left open under what opens.
  const openMembers = () => {
    media.setAttaching(false);
    if (pub.isPublic) router.push(`/public-group?id=${id}`);
    else setSheet(true);
  };
  const caption = out ? (info.status === 'leaving' ? t('Leaving') : t('You are not in this group')) : (pub.caption ?? t('Group · encrypted'));
  return (
    <KeyboardPaddedView bottom={insets.bottom} style={styles.screen}>
      {bar(
        <>
          <Pressable
            onPress={openMembers}
            accessibilityRole="button"
            accessibilityLabel={`${info.name}, ${out || pub.caption ? caption : t('Group · end-to-end encrypted')}`}
            accessibilityHint={t('Members and settings')}
            style={({ pressed }) => [styles.top, pressed && styles.pressed]}
          >
            <KeyFace identity={id} name={info.name} size={narrow ? 36 : 40} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="heading" numberOfLines={1} style={styles.name}>
                {parts.thread ? t('Thread · {name}', { name: info.name }) : info.name}
              </Text>
              <View style={styles.subtitle}>
                {out || narrow ? null : <ShieldIcon color={colors.success} size={11} />}
                <Text variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
                  {caption}
                </Text>
              </View>
            </View>
          </Pressable>
          {/* A video call and a voice call, as in a contact's chat; one going on is joined as it is, by its own tile alone. */}
          {out || going ? null : (
            <ShortcutTile label={t('Video call')} tint="blue" onPress={() => void call(true)}>
              <VideoSign />
            </ShortcutTile>
          )}
          {out ? null : going?.video ? (
            <ShortcutTile label={t('A group video call is going on · Join')} tint="blue" onPress={() => void call(true)}>
              <VideoSign />
            </ShortcutTile>
          ) : (
            <ShortcutTile label={going ? t('A group call is going on · Join') : t('Voice call')} tint="green" onPress={() => void call(false)}>
              <PhoneSign />
            </ShortcutTile>
          )}
          {/* Apart from the call, so a slip on it calls no one; upright on Android, as its apps have it. */}
          <View style={styles.moreGap}>
            <IconButton label={t('Members and settings')} onPress={() => (pub.isPublic && !out ? setPublicMenu(true) : openMembers())}>
              <MoreIcon color={colors.text} size={Platform.OS === 'web' ? 20 : 18} upright={Platform.OS !== 'web'} />
            </IconButton>
          </View>
        </>,
      )}
      {going ? (
        <Pressable onPress={() => void call(going.video)} accessibilityRole="button" style={({ pressed }) => [styles.going, pressed && styles.pressed]}>
          <Text variant="bodyStrong" color={colors.accentText}>
            {going.video ? t('A group video call is going on · Join') : t('A group call is going on · Join')}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {going.people.map(name).join(', ')}
          </Text>
        </Pressable>
      ) : null}
      {asker ? (
        <View style={styles.ask}>
          <Row>
            <KeyFace identity={asker.id} name={faceName(asker.id)} size={36} />
            <Text variant="bodyStrong" style={{ flex: 1 }}>
              {askTitle(name(asker.id))}
            </Text>
          </Row>
          <Text variant="caption" tone="muted">
            {askBody()}
          </Text>
          <Row>
            <Button title={t('Send')} compact disabled={answering} onPress={() => void answer(asker.id, true)} />
            <Button title={t('Don’t')} kind="secondary" compact disabled={answering} onPress={() => void answer(asker.id, false)} />
          </Row>
          {asks.length > 1 ? (
            <TextButton
              title={plural(asks.length - 1, '{n} more member asks too, in the members list.', '{n} more members ask too, in the members list.')}
              onPress={openMembers}
            />
          ) : null}
        </View>
      ) : null}
      {parts.pinned}
      {parts.search}
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scroll}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => parts.follows() && scroll.current?.scrollToEnd({ animated: false })}
          // It keeps to its end too as the keyboard or the panel under the bar take room from it.
          onLayout={() => parts.follows() && scroll.current?.scrollToEnd({ animated: false })}
          onScroll={onScroll}
          scrollEventThrottle={100}
        >
          {lines.map((m, i) => {
            const before = lines[i - 1];
            // The day over the first line of each day, as in every chat.
            const newDay = !!m.at && (!before?.at || !sameDay(before.at, m.at));
            const day = newDay ? <DayMark at={m.at} /> : null;
            if (m.note) {
              return (
                <View key={i}>
                  {day}
                  <Text variant="caption" tone="muted" style={styles.noteLine}>
                    {noteText(m.text, name)}
                  </Text>
                </View>
              );
            }
            const mine = !m.from;
            const first = newDay || !before || before.note || before.from !== m.from;
            const ink = mine ? b.mineText : b.theirsText;
            const caption = parts.caption(m);
            // A sticker, built in or made from a photo, shows on its own, with no bubble.
            const stuck = !!m.sticker || !!m.file?.sticker;
            const chosen = parts.chosen(m);
            return (
              <View key={i} onLayout={parts.placedAt(m)}>
                {day}
                {/* While messages are chosen, a tap adds it or takes it out, and nothing in it acts. */}
                <Pressable
                  disabled={!parts.choosing}
                  accessible={parts.choosing}
                  focusable={parts.choosing}
                  onPress={() => parts.choose(m)}
                  onLongPress={() => parts.choose(m)}
                  accessibilityRole={parts.choosing ? 'checkbox' : undefined}
                  accessibilityState={parts.choosing ? { checked: chosen } : undefined}
                  accessibilityLabel={parts.choosing ? `${mine ? t('You') : name(m.from)}: ${m.text}` : undefined}
                  style={chosen ? chosenStyle(colors) : undefined}
                >
                  <View pointerEvents={parts.choosing ? 'none' : 'auto'}>
                    <Pressable
                      onLongPress={() => {
                        press();
                        parts.hold(m);
                      }}
                      accessibilityHint={t('Hold for more')}
                      style={[styles.bubble, mine ? b.mine : b.theirs, m.file?.kind === 'photo' && !stuck && (mine || !first) && styles.photoBubble, stuck && styles.stickerBubble, parts.litStyle(m)]}
                    >
                      {!mine && first ? (
                        <Text variant="label" color={colors.accentText}>
                          {name(m.from)}
                        </Text>
                      ) : null}
                      {parts.quote(m, ink)}
                      {media.content(m, ink, () => parts.hold(m)) ??
                        parts.body(m, ink) ?? (
                          <Text style={ink}>
                            <LinkedText text={shownLine(m.text)} />
                          </Text>
                        )}
                      {parts.preview(m, ink)}
                      <Text style={[ink, styles.time, stuck && { color: colors.textMuted }]}>{caption ? `${clock(m.at)}  ·  ${caption}` : clock(m.at)}</Text>
                    </Pressable>
                    {parts.reactions(m)}
                    {parts.threadCount(m)}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
        <ThreadArrows
          start={away.start}
          end={away.end}
          seen={away.seen}
          onSeen={() => left.current && parts.goTo(left.current)}
          onStart={() => {
            parts.stay(true);
            scroll.current?.scrollTo({ y: 0, animated: true });
          }}
          onEnd={() => {
            parts.stay(false);
            scroll.current?.scrollToEnd({ animated: true });
          }}
        />
      </View>
      {note ? (
        <Text variant="caption" color={colors.danger} style={styles.noteText}>
          {note}
        </Text>
      ) : media.said ? (
        <Text variant="caption" tone="muted" style={styles.noteText}>
          {media.said}
        </Text>
      ) : null}
      {out || nameable.length === 0 ? null : (
        <ScrollView horizontal keyboardShouldPersistTaps="always" showsHorizontalScrollIndicator={false} contentContainerStyle={styles.names}>
          {nameable.map((member) => (
            <Chip
              key={member.identity}
              label={`@${member.name}`}
              onPress={() => {
                draft.set((typed) => withMention(typed, member.name));
                setTypedName(null);
              }}
            />
          ))}
        </ScrollView>
      )}
      {out || throughTor() ? null : <IpQuiet />}
      {out ? null : (
        <DraftComposer
          draft={draft}
          onChangeText={(text) => setTypedName(typingMention(text))}
          placeholder={t('Message {name}', { name: info.name })}
          maxLength={MAX_GROUP_TEXT}
          onSend={() => void send()}
          voice={media.voice}
          answering={parts.answering}
          editing={parts.editing}
          onSticker={parts.openStickers}
          panel={media.panel}
          panelOpen={media.attaching}
          onPanel={media.setAttaching}
        />
      )}
      {media.sheets}
      {parts.sheets}
      <ChatMedia
        visible={mediaOpen && !gated}
        items={mediaOpen ? groupMedia(shown, name) : []}
        name={info.name}
        onClose={() => setMediaOpen(false)}
        onShow={(item) => parts.goTo(item.tag)}
      />
      <MembersSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        onOpen={() => setSheet(true)}
        info={info}
        name={name}
        faceName={faceName}
        contacts={contacts}
        onContacts={readContacts}
        onNote={setNote}
        onSearch={parts.startSearch}
        onMedia={() => {
          setSheet(false);
          setTimeout(() => setMediaOpen(true), Platform.OS === 'web' ? 0 : 300);
        }}
        onExport={parts.exportGroup}
        onVideo={() => void call(true)}
        onNotify={
          canNotifyChats
            ? () => {
                setSheet(false);
                setTimeout(() => setNotifying(true), Platform.OS === 'web' ? 0 : 300);
              }
            : undefined
        }
        onStyle={() => {
          setSheet(false);
          setTimeout(() => setStyling(true), Platform.OS === 'web' ? 0 : 300);
        }}
        onPin={
          hidden
            ? undefined
            : () => {
                setSheet(false);
                setTimeout(() => setPinAsk(info.locked ? 'off' : 'on'), Platform.OS === 'web' ? 0 : 300);
              }
        }
        onGone={onBack}
      />
      <PasswordSheet
        visible={pinAsk === 'on'}
        title={t('Lock this chat with a PIN')}
        repeat
        hint={t('Asked each time the chat opens. Only this phone knows it.')}
        submitLabel={t('Lock')}
        onClose={() => setPinAsk(null)}
        onSubmit={lockWithPin}
      />
      <PasswordSheet visible={pinAsk === 'off'} title={t('Type its PIN to take it off')} repeat={false} submitLabel={t('Take it off')} onClose={() => setPinAsk(null)} onSubmit={takePinOff} />
      <ChatNotifySheet
        visible={notifying}
        onClose={() => setNotifying(false)}
        title={t('Notifications for {name}', { name: info.name || t('Group') })}
        notify={info.notify ?? null}
        hidden={hidden}
        onChange={async (next) => (await groupsAt.groups()).setNotify(id, next)}
      />
      <ChatLookSheet visible={styling} onClose={() => setStyling(false)} name={info.name || t('Group')} chat={lookChat} />
      <Sheet visible={publicMenu} onClose={() => setPublicMenu(false)} title={info.name}>
        <Row wrap>
          <Button
            title={going ? t('A group video call is going on · Join') : t('Video call')}
            kind="secondary"
            compact
            onPress={() => {
              setPublicMenu(false);
              void call(true);
            }}
          />
          <Button
            title={t('Members and settings')}
            kind="secondary"
            compact
            onPress={() => {
              setPublicMenu(false);
              openMembers();
            }}
          />
          {canNotifyChats ? (
            <Button
              title={t('Notifications')}
              kind="secondary"
              compact
              onPress={() => {
                setPublicMenu(false);
                setTimeout(() => setNotifying(true), Platform.OS === 'web' ? 0 : 300);
              }}
            />
          ) : null}
          <Button
            title={t('Chat look')}
            kind="secondary"
            compact
            onPress={() => {
              setPublicMenu(false);
              setTimeout(() => setStyling(true), Platform.OS === 'web' ? 0 : 300);
            }}
          />
        </Row>
      </Sheet>
      {gated ? <ChatPinGate name={info.name} active={focused} open={openWithPin} forgot={lock.passwordLock ? forgotPin : undefined} onBack={onBack} /> : null}
    </KeyboardPaddedView>
  );
}

function MembersSheet({ visible, onClose, onOpen, info, name, faceName, contacts, onContacts, onNote, onSearch, onMedia, onExport, onVideo, onNotify, onStyle, onPin, onGone }: {
  visible: boolean;
  onClose: () => void;
  onOpen: () => void;
  info: GroupInfo;
  name: (identity: string) => string;
  /** The name a member's picture takes its letter from (GroupScreen `faceName`). */
  faceName: (identity: string) => string;
  /** Their chats' contacts, and how to read them again once one is named here. */
  contacts: Contact[];
  onContacts: () => void;
  onNote: (text: string) => void;
  /** Opens the search through the group's messages, and writes the group out as text. */
  onSearch: () => void;
  /** Opens the group's media, links and files. */
  onMedia: () => void;
  onExport: () => void;
  /** Starts a video call in the group, or joins the call going on. */
  onVideo: () => void;
  /** The group's own notifications (lock/chat-notify.ts): where chats can have them. */
  onNotify?: () => void;
  /** The group's own look (components/chat-look.tsx). */
  onStyle: () => void;
  /** Locks the group with a PIN of its own, or takes it off (lock/chat-pin.ts): none in hidden chats. */
  onPin?: () => void;
  /** Leaves its chat, once it is deleted here. */
  onGone: () => void;
}) {
  const { colors } = useTheme();
  const { at: groupsAt, linked: groupsLinked } = useGroupsWhere();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [adding, setAdding] = useState<Contact[] | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [rename, setRename] = useState('');
  // What the group is about, as the admin types it.
  const [about, setAbout] = useState('');
  const [busy, setBusy] = useState(false);
  // The contact being named, and the name typed for it.
  const [naming, setNaming] = useState('');
  const [contactName, setContactName] = useState('');

  useEffect(() => {
    if (!visible) return;
    setAdding(null);
    setChosen(new Set());
    setRename(info.name);
    setAbout(info.desc);
    setNaming('');
    void groupsAt
      .groups()
      .then((groups) => groups.members(info.id))
      .then(setMembers, () => setMembers([]));
  }, [visible, info.id, info.name, info.desc, groupsAt]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      onNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  async function startAdding() {
    const ids = new Set(members.map((m) => m.about?.id));
    const all = await groupableContacts(groupsAt.chats);
    setAdding(all.filter((c) => !ids.has(c.identity) && !info.asked.includes(c.identity)));
  }

  // The question shows once the sheet is gone: on the web, over it, it would not show.
  const closeThenConfirm = (title: string, message: string, action?: string) => {
    onClose();
    return confirm(title, message, action);
  };
  // As closeThenConfirm, for what destroys nothing (asking for a contact link, sending one): over the
  // sheet on a phone, so the member's row shows what came of it, and on the web the sheet opens again.
  const thenChoose = async (title: string, message: string, action: string) => {
    if (Platform.OS !== 'web') return choose(title, message, t('Cancel'), action);
    onClose();
    const ok = await choose(title, message, t('Cancel'), action);
    onOpen();
    return ok;
  };

  const out = info.status !== 'in';
  const linked = groupsLinked();

  // Asks a member for their contact link, once they said what it does.
  const askFor = (identity: string) =>
    void thenChoose(
      t('Add as contact'),
      t('Erevos asks {name} for their contact link, in a message only they get, and gives them yours. If they send theirs, you are each other’s contacts. If they don’t, you are not told.', {
        name: name(identity),
      }),
      t('Ask'),
    ).then((ok) => {
      if (ok) void run(async () => (await groupsAt.groups()).askContact(info.id, identity, groupsAt.transport));
    });

  // Under a member's name: asking them for their contact link, what came of it, or naming them.
  // On a linked device only naming: asking is the phone's.
  const contactControl = (identity: string) => {
    const contact = contacts.find((c) => c.identity === identity);
    if (contact) {
      return contact.name ? null : (
        <TextButton
          title={t('Name')}
          hitSlop={TALL}
          onPress={() => {
            setNaming(identity);
            setContactName('');
          }}
        />
      );
    }
    if (linked) return null;
    if (info.asks.some((a) => a.id === identity)) {
      return (
        <Row>
          <Text variant="caption" tone="muted" style={{ flexShrink: 1 }}>
            {t('Asks for your contact link')}
          </Text>
          <TextButton
            title={t('Send')}
            hitSlop={TALL}
            onPress={() =>
              void thenChoose(askTitle(name(identity)), askBody(), t('Send')).then((ok) => {
                if (ok) void run(async () => (await groupsAt.groups()).answerContact(info.id, identity, groupsAt.transport));
              })
            }
          />
        </Row>
      );
    }
    const asked = info.wants.find((w) => w.id === identity);
    if (asked && Date.now() - asked.at < ASK_AGAIN) {
      return (
        <Text variant="caption" tone="muted">
          {t('Asked')}
        </Text>
      );
    }
    return <TextButton title={asked ? t('Ask again') : t('Add as contact')} hitSlop={TALL} onPress={() => askFor(identity)} />;
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={info.name}>
      <ScrollView nestedScrollEnabled style={{ maxHeight: 520 }} contentContainerStyle={{ gap: space.sm }}>
        {adding ? (
          <>
            <Text variant="bodyStrong">{t('Add to the group')}</Text>
            {adding.length === 0 ? (
              <Text tone="muted">{t('Every contact is in the group or asked already.')}</Text>
            ) : (
              <ContactPicker
                contacts={adding}
                chosen={chosen}
                onToggle={(identity) =>
                  setChosen((before) => {
                    const next = new Set(before);
                    if (next.has(identity)) next.delete(identity);
                    else next.add(identity);
                    return next;
                  })
                }
              />
            )}
            <Row>
              <Button
                title={t('Ask them')}
                compact
                disabled={busy || chosen.size === 0}
                onPress={() =>
                  void run(async () => {
                    await (await groupsAt.groups()).add(info.id, [...chosen], groupsAt.transport);
                    onClose();
                  })
                }
              />
              <TextButton title={t('Back')} onPress={() => setAdding(null)} />
            </Row>
          </>
        ) : (
          <>
            {info.desc && !(info.admin && !out && !linked) ? (
              <Text>
                <LinkedText text={info.desc} />
              </Text>
            ) : null}
            <Text variant="caption" tone="muted">
              {out
                ? t('You are no longer in this group. Its messages stay here until you delete it.')
                : t("{n} in the group. Each has their own keys: the group's messages are end-to-end encrypted for those in it now.", {
                    n: members.length,
                  })}
            </Text>
            {out ? null : (
              <Button
                title={t('Video call')}
                kind="secondary"
                compact
                onPress={() => {
                  onClose();
                  onVideo();
                }}
              />
            )}
            {members.map((m) => (
              <View key={m.leaf} style={{ gap: space.sm }}>
                <Row>
                  <KeyFace identity={m.about?.id ?? ''} name={m.me ? t('You') : faceName(m.about?.id ?? '')} size={36} />
                  <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-start', gap: 2 }}>
                    <Text numberOfLines={1} style={{ alignSelf: 'stretch' }}>
                      {m.me ? t('You') : name(m.about?.id ?? '')}
                      {m.leaf === 0 ? t('  · admin') : ''}
                    </Text>
                    {m.me || !m.about || out ? null : contactControl(m.about.id)}
                  </View>
                  {info.admin && !m.me && !out ? (
                    <TextButton
                      title={t('Take out')}
                      onPress={() =>
                        void closeThenConfirm(t('Take out'), t('{name} will read nothing the group says from now on.', { name: name(m.about?.id ?? '') })).then(
                          (ok) => {
                            if (ok) void run(async () => (await groupsAt.groups()).remove(info.id, m.leaf, groupsAt.transport));
                          },
                        )
                      }
                    />
                  ) : null}
                </Row>
                {naming && naming === m.about?.id ? (
                  <Card>
                    <Field label={t('Name')}>
                      <Input value={contactName} onChangeText={setContactName} maxLength={MAX_NAME} autoFocus />
                    </Field>
                    <Row>
                      <Button
                        title={t('Save')}
                        compact
                        disabled={busy || !contactName.trim()}
                        onPress={() =>
                          void run(async () => {
                            await (await groupsAt.chats()).e2e.rename(naming, contactName);
                            setNaming('');
                            onContacts();
                          })
                        }
                      />
                      <TextButton title={t('Cancel')} onPress={() => setNaming('')} />
                    </Row>
                  </Card>
                ) : null}
              </View>
            ))}
            {out ? null : (
              <Text variant="caption" color={colors.textFaint}>
                {linked
                  ? t('Members who are not your contacts show by the start of their key. Ask them for their contact links on the phone that holds this account.')
                  : t('Members who are not your contacts show by the start of their key. Tap Add as contact under a member’s name to ask them, in a message only they get, for their contact link. Once they send it, you are each other’s contacts, and Name gives them a name.')}
              </Text>
            )}
            {info.asked.length > 0 ? (
              <Text variant="caption" tone="muted">
                {t('Asked, joining once Erevos is open on their phone: {names}', { names: info.asked.map(name).join(', ') })}
              </Text>
            ) : null}
            {info.admin && !out ? (
              <Card>
                <Field label={t('Group name')}>
                  <Input value={rename} onChangeText={setRename} maxLength={MAX_GROUP_NAME} />
                </Field>
                <Row wrap>
                  <Button
                    title={t('Rename')}
                    kind="secondary"
                    compact
                    disabled={busy || !rename.trim() || rename.trim() === info.name}
                    onPress={() => void run(async () => (await groupsAt.groups()).rename(info.id, rename, groupsAt.transport))}
                  />
                  <Button title={t('Add members')} kind="secondary" compact disabled={busy} onPress={() => void startAdding()} />
                </Row>
              </Card>
            ) : null}
            {info.admin && !out && !linked ? (
              <Card>
                <Field label={t('Description')}>
                  <Input value={about} onChangeText={setAbout} maxLength={MAX_GROUP_DESC} multiline />
                </Field>
                <Button
                  title={t('Save')}
                  kind="secondary"
                  compact
                  disabled={busy || about.trim() === info.desc}
                  onPress={() => void run(async () => (await groupsAt.groups()).describe(info.id, about, groupsAt.transport))}
                />
              </Card>
            ) : null}
            <Row wrap>
              <Button
                title={t('Search in this chat')}
                kind="secondary"
                compact
                onPress={() => {
                  onClose();
                  onSearch();
                }}
              />
              <Button title={t('Media, links and files')} kind="secondary" compact onPress={onMedia} />
              <Button
                title={t('Export chat')}
                kind="secondary"
                compact
                onPress={() => {
                  onClose();
                  setTimeout(onExport, Platform.OS === 'web' ? 0 : 300);
                }}
              />
              {onNotify ? <Button title={t('Notifications')} kind="secondary" compact onPress={onNotify} /> : null}
              <Button title={t('Chat look')} kind="secondary" compact onPress={onStyle} />
              {onPin ? <Button title={info.locked ? t('Take the PIN off') : t('Lock with a PIN')} kind="secondary" compact onPress={onPin} /> : null}
            </Row>
            {out ? (
              <Button
                title={t('Delete the group here')}
                kind="secondary"
                onPress={() =>
                  void closeThenConfirm(t('Delete the group'), t('Its messages are deleted from this phone.'), t('Delete')).then(
                    (ok) => {
                      if (!ok) return;
                      void run(async () => {
                        await (await groupsAt.groups()).forget(info.id);
                        onGone();
                      });
                    },
                  )
                }
              />
            ) : (
              <Button
                title={info.admin ? t('Close the group') : t('Leave the group')}
                kind="secondary"
                disabled={busy}
                onPress={() =>
                  void closeThenConfirm(
                    info.admin ? t('Close the group') : t('Leave the group'),
                    info.admin
                      ? t('You are its admin: closing it takes every member out, and no one can write in it again.')
                      : t('The admin takes you out the next time Erevos is open on their phone. You read nothing the group says after.'),
                    info.admin ? t('Close') : t('Leave'),
                  ).then((ok) => {
                    if (ok) void run(async () => (await groupsAt.groups()).leave(info.id, groupsAt.transport));
                  })
                }
              />
            )}
          </>
        )}
      </ScrollView>
    </Sheet>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      width: '100%',
      maxWidth: 760,
      alignSelf: 'center',
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: space.xl,
    },
    // The group's bar at the top, across the screen and behind the status bar, on the bars' glass.
    topBar: {
      backgroundColor: colors.sheet,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    // The buttons' own room (44 across, the icon in the middle) spaces them, so the name has the rest.
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 60,
    },
    name: {
      fontSize: 17,
      lineHeight: 22,
    },
    subtitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    // ⋯ keeps apart from the call beside it, so a slip on it calls no one.
    moreGap: {
      marginLeft: space.sm,
    },
    // A member's ask for this phone's contact link, over the messages.
    ask: {
      marginHorizontal: space.lg,
      marginTop: space.sm,
      padding: space.md,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: space.sm,
    },
    going: {
      marginHorizontal: space.lg,
      paddingHorizontal: space.md,
      paddingVertical: space.sm,
      borderRadius: radius.md,
      backgroundColor: withAlpha(colors.primary, 0.16),
      gap: 2,
    },
    // The group's picture and name: tapped, its members.
    top: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 6,
      paddingLeft: 2,
      paddingRight: 2,
      borderRadius: radius.lg,
    },
    pressed: {
      backgroundColor: colors.surfacePressed,
    },
    list: {
      gap: 3,
      paddingHorizontal: space.lg,
      paddingVertical: space.sm,
    },
    bubble: {
      maxWidth: '82%',
      paddingTop: space.sm,
      paddingBottom: 6,
      paddingHorizontal: space.md,
      gap: 2,
      marginBottom: 3,
    },
    // A photo fills its bubble, with a thin edge.
    photoBubble: {
      paddingTop: 4,
      paddingHorizontal: 4,
    },
    // A sticker stands on its own, with no bubble behind it.
    stickerBubble: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      paddingHorizontal: 0,
      shadowOpacity: 0,
      elevation: 0,
    },
    time: {
      fontSize: 11,
      opacity: 0.7,
      alignSelf: 'flex-end',
    },
    noteLine: {
      alignSelf: 'center',
      textAlign: 'center',
      paddingVertical: space.xs,
    },
    noteText: {
      paddingHorizontal: space.lg,
    },
    names: {
      gap: space.xs,
      paddingHorizontal: space.md,
      paddingVertical: space.xs,
    },
  });
