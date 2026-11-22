// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useFocusEffect, useLocalSearchParams, useNavigation, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, PermissionsAndroid, Platform, Pressable, StyleSheet, TextInput, useWindowDimensions, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatActions, useArrangedChats } from '../components/chat-actions';
import { ChatRow, MyselfRow } from '../components/chat-row';
import { NewSmsSheet } from '../components/new-sms-sheet';
import { FoundRow } from '../components/found-row';
import { gradientStyle } from '../components/glass';
import { BellIcon, ChevronIcon, GearIcon, MoreIcon, PencilIcon, PinIcon, PlusIcon, SearchIcon } from '../components/icons';
import { LaterPicker } from '../components/later-picker';
import { KeyboardPaddedView } from '../components/keyboard';
import { usePublicFeed } from '../components/public-feed';
import { CollectionSign, LockSign, PersonSign, PhoneSign, ShortcutTile } from '../components/shortcut-tile';
import { ListSection, Services, type Service } from '../components/services';
import { SmsActions, type SmsTarget } from '../components/sms-actions';
import { SmsHome } from '../components/sms-home';
import { SwipeTabs } from '../components/swipe-tabs';
import { Button, Chip, font, fontStyle, Input, Row, Sheet, Text } from '../components/ui';
import { UndoBar } from '../components/undo-bar';
import { ask } from '../lib/alert';
import { canGroup, canNostrChat, canPublicGroup, hasCore } from '../lib/core';
import { againNote, copyNote, linkedRole } from '../lib/devices';
import { memberName, noteText } from '../lib/groups';
import { handOverHidden } from '../lib/hidden-handoff';
import { press } from '../lib/haptics';
import type { ChatListPlace } from '../lib/chat-list';
import { lang, mark, plural, t, tFor } from '../lib/i18n';
import { armReminders, myNotes, onNotesChanged, writeNote, type Note } from '../lib/myself';
import { CURRENT_BUILD } from '../lib/release-look';
import { loadNotice, onNotice, shownRelease, type Told } from '../lib/release-notice';
import { MSG_SERVICES, SERVICE_NAMES } from '../lib/messenger';
import { facebookWay, messengerNow, msgCaseOnly, msgMessengerWay, onMessengerChange, openFacebook, openMessengerCase } from '../lib/messenger-store';
import { buildInbox, filterInbox, groupRows, inboxParts, matrixInboxRows, mergeRows, msgInboxRows, nostrInboxRows, rowOn, showsIn, shownName, tabUnread, telegramInboxRows, tgFolderOf, xmppInboxRows, type InboxGroup, type InboxRow, type InboxShow, type InboxSms } from '../lib/inbox';
import { askReadAll, toReadIn } from '../lib/read-all';
import { moduleOn, onModulesChange, useModules, type Module } from '../lib/modules';
import { arrangeServices, hideService, inAllMessages, moveService, startOn, startPart, useServiceOrder } from '../lib/service-order';
import { matrixLearnJoins, matrixNow, onMatrixChange } from '../lib/matrix-store';
import { directOther, matrixPresence } from '../lib/matrix';
import { nearbyOn } from '../lib/nearby-links';
import { isOn } from '../lib/net-presence';
import { onTelegramChange, telegramAwayChats, telegramHomeFolders, telegramLockedChats, telegramNow, telegramShown } from '../lib/telegram-store';
import type { TgFolder } from '../lib/telegram';
import { xmppOnline } from '../lib/xmpp';
import { onXmppChange, xmppNow } from '../lib/xmpp-store';
import { nostrDmNow, onNostrDmChange } from '../lib/nostr-dm-store';
import { isPublicItem, isPublicRoom, type PublicItem } from '../lib/public-feed';
import { foundAt, foundName, groupFindables, searchMessages, type Findable } from '../lib/message-search';
import { checksOffered, offerChecks } from '../lib/permissions';
import { loadSetupAfter } from '../lib/setup-after';
import { HAS_LINKS, HAS_RADIO } from '../lib/radio';
import { MAX_NOTE_TEXT } from '../lock/myself-data';
import { onReceived } from '../lib/receiver';
import { spaceChats } from '../lib/space-chats';
import { groupMemberSaid, publicMemberName, spaceGroups } from '../lib/space-groups';
import { arrangeRows, dueTrash, emptyTrash, onSmsOrderChanged, sortSms } from '../lib/sms-folders';
import { sameNumber } from '../lib/sms-invite';
import { SmsLink } from '../lib/sms-link';
import { sweepSpaceSms } from '../lib/sms-rules';
import { hiddenSign, onSignsChange, spacesSign } from '../lib/unread-signs';
import { deleteSmsThread, onSmsEvent, smsMirrored, smsStatus, smsToolsReady } from '../modules/erevos-sms';
import { NO_SMS, smsRows, type SmsList } from '../lib/sms-rows';
import { Archive } from '../lock/archive';
import type { ChatNotify } from '../lock/chat-notify';
import { useLock } from '../lock/context';
import { loadE2EData } from '../lock/e2e-data';
import { Logo } from '../lock/gate';
import { searchHidden, searchOpens } from '../lock/hidden';
import { History, type Message } from '../lock/history';
import { loadInboxCache, saveInboxCache } from '../lock/inbox-cache';
import { currentSpace } from '../lock/keys';
import { editionNote } from '../lib/edition-notice';
import { EDITION, editionName, named, type Edition } from '../lib/edition';
import { answerAsked, invitesToAsk, onInvitesToAsk } from '../lib/sms-relay';
import { loadCurrentSpaceData } from '../lock/space-data';
import { waysNow } from '../lib/ways';
import { HUES, NO_INPUT, useWays } from '../lib/ways-read';
import { radius, shape, space, withAlpha, type Colors } from '../theme/colors';
import { useStyles, useTheme } from '../theme/context';
import Contacts from './contacts';

// The home screen: the space's chats, newest first, as a messenger shows them, with a search over
// names and last messages, and the messages found under them, the relay's state, and the rest of
// the app behind the menu. It is read
// again each time it comes back into view, so a chat just written in moves to the top, and each
// time a message comes while it shows (lib/receiver.ts). Hidden
// chats never show here: their PIN, typed in the search or after holding New chat down, opens
// them, in every space alike.

type Relay = 'ready' | 'no-queue' | 'none';

// The places of Erevos; its settings are in Settings (lib/settings.ts), the Phone and Contacts in
// the tiles at the top. `links`: where there are links to phones nearby.
// `erevos`: part of Erevos's own chats, so only while they are on (lib/modules.ts).
const MENU: { title: string; detail: string; href: Href; links?: boolean; erevos?: boolean }[] = [
  { title: mark('New group'), detail: mark('A group chat with your contacts, end-to-end encrypted'), href: '/new-group', erevos: true },
  { title: mark('Public groups'), detail: mark('Make a group anyone with its link can join, or join one by a link'), href: '/public-groups', erevos: true },
  { title: mark('Starred messages'), detail: mark('The messages you starred, in all your chats'), href: '/starred' },
  {
    title: mark('Nearby phones'),
    detail: HAS_RADIO ? mark('Your contacts over Bluetooth and Wi-Fi, without internet') : mark('Your contacts on the same Wi-Fi, without internet'),
    href: '/chat',
    links: true,
    erevos: true,
  },
  { title: mark('User guide'), detail: mark('How Erevos works, and what is not protected yet'), href: '/guide' },
];

// The open space, or none for a moment as it closes.
function openSpace(): { space: number; key: Uint8Array } | null {
  try {
    return currentSpace();
  } catch {
    return null;
  }
}

// The spaces whose Trash was looked at since Erevos started: what was there long enough goes from
// the phone once each time.
const trashLooked = new Set<number>();

// Which of the list shows: all of it, or one network's chats, the SMS, the Erevos chats, the
// Matrix ones, the XMPP ones or the Nostr ones (lib/inbox.ts, showsIn), each with its chip while its
// module is on, once two are; and the Public feed (components/public-feed.tsx), with its chip when the
// space has a Nostr key or a public Matrix room.
// Erevos's widget and its icons in the launcher open on one of them (erevos://?show=sms), again
// each time they are tapped (`opened`, app/_layout.tsx).
// A Telegram folder chosen for home (lib/telegram-store.ts telegramHomeFolders) is a part of its own, `tg:` and its id.
const showOf = (show: unknown): InboxShow =>
  show === 'sms' || show === 'erevos' || show === 'matrix' || show === 'xmpp' || show === 'nostr' || show === 'telegram' || show === 'messenger' || show === 'signal' || show === 'session' || show === 'public' || (typeof show === 'string' && /^tg:-?\d{1,15}$/.test(show)) ? (show as InboxShow) : 'all';
const SHOW_LABELS: Record<Exclude<InboxShow, `tg:${number}`>, () => string> = { all: () => t('All messages'), sms: () => t('SMS'), erevos: () => editionName(), matrix: () => 'Matrix', xmpp: () => 'XMPP', nostr: () => 'Nostr', telegram: () => 'Telegram', messenger: () => 'Messenger', signal: () => 'Signal', session: () => 'Session', public: () => t('Public') };
// A Telegram folder's chip has the folder's name, as Telegram has it.
const showLabel = (show: InboxShow, folders: readonly TgFolder[]): string => {
  const folder = tgFolderOf(show);
  if (folder === null) return SHOW_LABELS[show as keyof typeof SHOW_LABELS]();
  return folders.find((f) => f.id === folder)?.name || 'Telegram';
};

// A section's title in the list of chats: Unread, then Recent (components/services.tsx ListSection).
type Section = { section: 'unread' | 'recent' };
const isSection = (item: object): item is Section => 'section' in item;

// How long New chat is held down before it asks for a PIN of hidden chats, in milliseconds: a little
// longer than a hold anywhere else, so an ordinary one does not open it. A short buzz says it opened.
const DOOR_HOLD = 600;
const DOOR_BUZZ = 40;

// With only the SMS or the Contacts open (app/_layout.tsx), the home screen is their list alone.
// How often home reads the ways out again, for its line under the top bar.
const WAYS_EVERY = 10_000;

export default function HomeScreen() {
  const only = useLock().only;
  return only === 'sms' ? <SmsHome /> : only === 'contacts' ? <Contacts /> : <Home />;
}

function Home() {
  const styles = useStyles(makeStyles);
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const lock = useLock();
  // Only the modules on show (lib/modules.ts): their chats, tiles, menu and buttons.
  const modules = useModules();
  const erevosOn = modules.has('erevos');
  const phoneOn = modules.has('phone');
  const collectionOn = modules.has('collection');
  // Whether any module that brings messages is on: with none (the Phone alone), there is no list.
  const messagesOn = erevosOn || modules.has('sms') || modules.has('nostr') || modules.has('matrix') || modules.has('xmpp') || modules.has('telegram') || MSG_SERVICES.some((m) => modules.has(m));
  const [rows, setRows] = useState<InboxRow[] | null>(null);
  const [relay, setRelay] = useState<Relay>('none');
  const [query, setQuery] = useState('');
  const params = useLocalSearchParams<{ show?: string; opened?: string; from?: string }>();
  // Erevos's launcher icon (from=launcher) and a start with no link open on the part the owner
  // chose (lib/service-order.ts startPart), All messages when none; any other link on its own part.
  const start = startPart(useServiceOrder());
  const linked = typeof params.show === 'string' && params.from !== 'launcher';
  const [chosenShow, setShow] = useState<InboxShow>(showOf(linked ? params.show : start));
  // A part whose module is off (an icon or the widget may still name it) shows all.
  // The public feed is of the Nostr and the Matrix parts: with both off it shows all too.
  // A Telegram folder no longer chosen (or gone from the account) shows Telegram's part.
  const chosenFolder = tgFolderOf(chosenShow);
  const homeFolders = modules.has('telegram') ? telegramHomeFolders() : [];
  const show: InboxShow =
    chosenFolder !== null
      ? homeFolders.includes(chosenFolder)
        ? chosenShow
        : modules.has('telegram')
          ? 'telegram'
          : 'all'
      : chosenShow === 'all' || (chosenShow === 'public' ? modules.has('nostr') || modules.has('matrix') : modules.has(chosenShow as Module))
        ? chosenShow
        : 'all';
  useEffect(() => {
    setShow(showOf(linked ? params.show : start));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a link, or the icon again; the part chosen to open on below
  }, [params.show, params.opened, linked]);
  useEffect(() => {
    if (!linked) setShow(showOf(start));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the part to open on is read or chosen
  }, [start]);
  // After a new version, the permissions check shows by itself once, when calls and messages in
  // the background need something (lib/permissions.ts), and on Android once after a backup was
  // restored; in the web app after a new signed release, when messages, calls or the data need
  // something (lib/permissions.web.ts). A moment later, and only if nothing else opened meanwhile
  // (a link, the widget, a call): then the next start offers it.
  const navigation = useNavigation();
  useEffect(() => {
    let active = true;
    const wait = setTimeout(() => {
      // The first start's steps not done yet, or going on after a backup was restored
      // (lib/setup-after.ts), come first: they ask for what the modules need, as the check would.
      void loadSetupAfter().then(async (after) => {
        if (after) {
          if (!active || !navigation.isFocused()) return;
          void checksOffered();
          router.push('/first-steps');
          return;
        }
        const offer = await offerChecks();
        if (!offer || !active || !navigation.isFocused()) return;
        void checksOffered();
        router.push(`/permissions?after=${offer}`);
      });
    }, 1500);
    return () => {
      active = false;
      clearTimeout(wait);
    };
  }, [navigation]);
  // The space's messages as last read, and its chats' names, for the search.
  const [searched, setSearched] = useState<{ messages: Findable[]; names: Map<string, string> }>({ messages: [], names: new Map() });

  // A search sent with the keyboard's search key is also tried as a PIN of hidden chats. A right
  // one opens those and the search empties; a wrong one is a search like any other.
  // A search sent is tried as a PIN of hidden chats and as another space's password
  // (lock/hidden.ts searchOpens): what it opens opens, and anything else stays a search.
  async function searchSubmitted() {
    const found = await searchOpens(currentSpace().space, query, moduleOn('erevos')).catch(() => null);
    if (!found) return;
    setQuery('');
    if ('space' in found) {
      lock.openSpace(found.space);
      return;
    }
    handOverHidden(found.place);
    router.push('/chat?hidden=open');
  }
  // New chat held down asks for a PIN of hidden chats, alike in every space: a right one opens
  // them, a wrong one only closes it, as a search that finds nothing.
  const [door, setDoor] = useState(false);
  const [doorPin, setDoorPin] = useState('');
  const closeDoor = () => {
    setDoor(false);
    setDoorPin('');
  };
  async function openDoor() {
    const pin = doorPin;
    closeDoor();
    const place = await searchHidden(currentSpace().space, pin).catch(() => null);
    if (!place) return;
    handOverHidden(place);
    router.push('/chat?hidden=open');
  }
  const [menu, setMenu] = useState(false);
  // Chat with myself, always at the top of the chats, and Remind me beside New chat (lib/myself.ts).
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [reminding, setReminding] = useState(false);
  const [reminder, setReminder] = useState('');
  const [reminderSaid, setReminderSaid] = useState('');
  const wide = useWindowDimensions().width >= 400;
  // A new Erevos, told by Erevos itself above the chats until it is installed (lib/release-notice.ts),
  // and whether Updates was opened since it was told.
  const [release, setRelease] = useState<(Told & { seen: boolean }) | null>(null);
  useEffect(() => {
    let live = true;
    const load = () =>
      void loadNotice().then((kept) => {
        const shown = shownRelease(kept, CURRENT_BUILD);
        if (live) setRelease(shown ? { ...shown, seen: kept.seen } : null);
      }, () => undefined);
    load();
    const off = onNotice(load);
    return () => {
      live = false;
      off();
    };
  }, []);
  // The notes, read again whenever they change; reminders still to come are asked of the phone
  // again, as after a backup was put back.
  useEffect(() => {
    let live = true;
    const load = () =>
      myNotes().then(
        (list) => {
          if (!live) return;
          setNotes(list);
          armReminders(list);
        },
        () => undefined,
      );
    void load();
    const off = onNotesChanged(() => void load());
    return () => {
      live = false;
      off();
    };
  }, []);
  const closeReminder = () => {
    setReminding(false);
    setReminder('');
    setReminderSaid('');
  };
  async function keepReminder(due: number) {
    const text = reminder.trim();
    if (!text) {
      setReminderSaid(t('Write what to remind you of first.'));
      return;
    }
    try {
      await writeNote({ text: text.slice(0, MAX_NOTE_TEXT), due });
      closeReminder();
    } catch (error) {
      setReminderSaid(t('Not kept. {reason}', { reason: error instanceof Error ? error.message : String(error) }));
    }
  }
  const closeMenu = () => setMenu(false);
  const [now, setNow] = useState(Date.now());
  // The contacts whose phones said they are open, and not long ago (lib/e2e.ts).
  const [online, setOnline] = useState<Set<string>>(new Set());
  // The phone's SMS as last read: the list shows them while they are read again.
  const smsShown = useRef<SmsList>(NO_SMS);
  // Those of them in the list (not archived, spam nor in the Trash), and how the list is read again:
  // for Mark all as read (lib/read-all.ts).
  const smsListed = useRef<InboxSms[]>([]);
  const reload = useRef<() => void>(() => undefined);
  // Read again, as when the names were just turned on, or a module was turned on or off.
  const [again, setAgain] = useState(0);
  useEffect(() => onModulesChange(() => setAgain((n) => n + 1)), []);
  // How many SMS conversations are in the space's Archive, Spam and Trash.
  const [folders, setFolders] = useState({ archived: 0, spam: 0, trash: 0 });
  // The dots that say messages came unread where these chats do not show them, each only where it was
  // asked for (lib/unread-signs.ts): on the search, for hidden chats; on the lock, for the other spaces.
  const [signs, setSigns] = useState({ hidden: false, spaces: false });
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const read = () => {
        void Promise.all([hiddenSign().catch(() => false), spacesSign().catch(() => false)]).then(([hidden, spaces]) => {
          if (active) setSigns((was) => (was.hidden === hidden && was.spaces === spaces ? was : { hidden, spaces }));
        });
      };
      read();
      const stop = onSignsChange(read);
      return () => {
        active = false;
        stop();
      };
    }, []),
  );
  // The SMS conversation held down, whose actions show; and any other chat held down (components/chat-actions.tsx).
  const [target, setTarget] = useState<SmsTarget | null>(null);
  const [chatTarget, setChatTarget] = useState<InboxRow | null>(null);
  // The SMS conversations archived, and whether the list shows what is archived instead of itself.
  const [smsArchived, setSmsArchived] = useState<InboxSms[]>([]);
  const [archiveShown, setArchiveShown] = useState(false);
  const smsRead = useRef(false);
  // Whether the list read now shows, or still the copy kept from last time (lock/inbox-cache.ts).
  const readShown = useRef(false);
  const copyShown = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const { space: current, key } = currentSpace();
      const quiet = <T,>(promise: Promise<T>, fallback: T) => promise.catch(() => fallback);
      // The chats as the chat screen and the receiver have them (lib/space-chats.ts), or, in a
      // build that cannot encrypt, as kept on the phone.
      const chats = (): Promise<[{ identity: string; name: string; timer: number; phone?: string; locked?: boolean; notify?: ChatNotify }[], Message[]]> =>
        hasCore()
          ? spaceChats().then(({ e2e, history }) => {
              const phones = new Map(e2e.phones().map((p) => [p.identity, p.phone]));
              return [e2e.contacts().map((c) => ({ ...c, phone: phones.get(c.identity) })), history.messages()];
            })
          : Promise.all([loadE2EData('space', current, key).then((d) => d.contacts.map((c) => ({ ...c, locked: !!c.pin }))), History.open('space', current, key).then((h) => h.messages())]);
      // The chats show as soon as they are read; the phone's SMS, slower to read (a hundred
      // conversations), join them when they are.
      const load = () => {
        let chatsRead: ((sms: SmsList) => void) | null = null;
        // The phone's SMS show only once Erevos is its SMS app.
        let smsFirst = false;
        // Erevos's own chats, groups and those brought in from other apps only with Erevos on.
        const erevos = moduleOn('erevos');
        if (smsStatus()?.isDefault && moduleOn('sms')) {
          smsFirst = smsRead.current === false;
          void quiet(smsRows(current, key), smsShown.current).then((sms) => {
            if (!active) return;
            smsShown.current = sms;
            smsRead.current = true;
            smsFirst = false;
            chatsRead?.(sms);
          });
          if (smsToolsReady() && !trashLooked.has(current)) {
            trashLooked.add(current);
            void SmsLink.open(current, key)
              .then((link) => emptyTrash(link, dueTrash(link.state.trash, Date.now()), deleteSmsThread))
              .then((gone) => active && gone > 0 && load())
              .catch(() => undefined);
          }
          // What a conversation's timer took goes from the phone (lib/sms-rules.ts).
          void sweepSpaceSms(current, key)
            .then((gone) => active && gone > 0 && load())
            .catch(() => undefined);
        } else smsShown.current = NO_SMS;
        const groupsOn = erevos && canGroup();
        void Promise.all([
          erevos ? quiet(chats(), [[], []]) : Promise.resolve<Awaited<ReturnType<typeof chats>>>([[], []]),
          erevos ? quiet(Archive.open('space', current, key).then((a) => a.chats()), []) : Promise.resolve([]),
          quiet(loadCurrentSpaceData(), null),
          groupsOn ? quiet(spaceGroups().then((g) => g.list() as InboxGroup[]), []) : Promise.resolve([] as InboxGroup[]),
          groupsOn ? quiet(spaceGroups().then((g) => g.list().flatMap((group) => groupFindables(group.id, g.messages(group.id)))), []) : Promise.resolve([]),
        ]).then(([[contacts, messages], imported, data, groups, said]) => {
          if (!active) return;
          const name = (identity: string) => publicMemberName(identity) ?? memberName(identity, contacts, groupMemberSaid);
          const phones = contacts.flatMap((c) => (c.phone ? [c.phone] : []));
          // The search finds nothing said in a chat locked with its PIN, only its name.
          const locked = new Set([...contacts.filter((c) => c.locked).map((c) => `contact:${c.identity}`), ...groups.filter((g) => g.locked).map((g) => `group:${g.id}`)]);
          setSearched({
            messages: [...messages, ...said].filter((m) => !locked.has(m.peer)),
            names: new Map([...contacts.map((c): [string, string] => [`contact:${c.identity}`, shownName(c)]), ...groups.map((g): [string, string] => [`group:${g.id}`, g.name])]),
          });
          chatsRead = (sms) => {
            const at = Date.now();
            // Archived, spam and those in the Trash are not in the list; pinned ones are at its top.
            const order = sms.order;
            const sorted = order ? sortSms(sms.threads, order, sms.blocked, (t) => !!t.name || phones.some((p) => sameNumber(p, t.address))) : null;
            smsListed.current = sorted?.list ?? sms.threads;
            const merged = mergeRows(buildInbox(contacts, messages, imported, at, smsListed.current), groupRows(groups, name, (text) => noteText(text, name)));
            const list = order ? arrangeRows(merged, order.pinned, order.drafts) : merged;
            setFolders({ archived: sorted?.archived.length ?? 0, spam: sorted?.spam.length ?? 0, trash: order?.trash.length ?? 0 });
            setSmsArchived(sorted?.archived ?? []);
            if (sorted && sorted.back.length > 0) void SmsLink.open(current, key).then((link) => link.unarchive(sorted.back)).catch(() => undefined);
            // Not "No chats yet", nor the kept copy without its SMS, while the SMS are still being
            // read the first time.
            if (smsFirst && (list.length === 0 || copyShown.current)) return;
            setNow(at);
            setRows(list);
            readShown.current = true;
            if (smsFirst) return;
            copyShown.current = false;
            void saveInboxCache(current, key, list).catch(() => undefined);
          };
          chatsRead(smsShown.current);
          setRelay(!data?.url ? 'none' : data.ownQueue ? 'ready' : 'no-queue');
        });
      };
      reload.current = load;
      // Who shows online, again when the first of them is due to show no more, as it lasts only a
      // while, and as something comes; every half minute at least. A chat that appears offline does
      // not see it.
      let onlineTimer: ReturnType<typeof setTimeout> | null = null;
      const lookOnline = () => {
        if (onlineTimer) clearTimeout(onlineTimer);
        onlineTimer = null;
        let next = 30_000;
        void (hasCore() && moduleOn('erevos') ? spaceChats() : Promise.reject())
          .then(({ e2e }) => {
            const at = Date.now();
            const ids: string[] = [];
            for (const c of e2e.contacts()) {
              const until = c.hide ? 0 : e2e.onlineUntil(c.identity, at);
              if (until <= 0) continue;
              ids.push(c.identity);
              next = Math.min(next, until - at + 50);
            }
            if (active) setOnline((before) => (before.size === ids.length && ids.every((id) => before.has(id)) ? before : new Set(ids)));
          })
          .catch(() => undefined)
          .finally(() => {
            if (active && !onlineTimer) onlineTimer = setTimeout(lookOnline, Math.max(250, next));
          });
      };
      // The list as it showed last time, at once, until the one read now replaces it.
      if (!readShown.current) {
        void loadInboxCache(current, key)
          .then(({ rows: kept }) => {
            if (!active || readShown.current || kept.length === 0) return;
            copyShown.current = true;
            setNow(Date.now());
            setRows(kept);
          })
          .catch(() => undefined);
      }
      load();
      lookOnline();
      // Once, in a linked device's chats restored from its backup: that they are read, not written in, here.
      // Else once, on a phone a backup was put back on, that its devices can be asked to link again;
      // or on a linked device, that its phone asks it to.
      void copyNote().then(async (text) => {
        if (text) {
          if (active) ask(t('Linked devices'), text, [{ text: t('OK') }]);
          return;
        }
        const again = await againNote();
        if (again && active) ask(t('Linked devices'), again, [{ text: t('Not now'), style: 'cancel' }, { text: t('Open'), onPress: () => router.push('/devices') }]);
      });
      // An SMS invite from a number not known here waits for the owner: its sender can be made up.
      let asking = false;
      const askInvite = () => {
        const from = invitesToAsk()[0];
        if (!from || asking || !active) return;
        asking = true;
        const done = (yes: boolean) => {
          asking = false;
          answerAsked(from, yes);
        };
        ask(t('An invite by SMS'), t('{number} sent you an Erevos invite by SMS. Answer it with your contact link, so they can write to you here? Only if you know this number: the sender of an SMS can be made up.', { number: from }), [
          { text: t('No'), style: 'cancel', onPress: () => done(false) },
          { text: t('Answer it'), onPress: () => done(true) },
        ]);
      };
      askInvite();
      const stopAsk = onInvitesToAsk(askInvite);
      // Once in a space, in the plain Erevos: its accounts on networks only Erevos+ has are kept.
      void editionNote(current, key)
        .then((text) => {
          if (text && active) ask('Erevos+', text, [{ text: t('OK') }]);
        })
        .catch(() => undefined);
      // What comes while this screen shows moves its chat to the top.
      const stop = onReceived(() => {
        load();
        lookOnline();
      });
      // And an SMS, as Erevos is the SMS app, and a change of the space's order of its SMS.
      const sms = onSmsEvent('onSms', load);
      const stopOrder = onSmsOrderChanged(load);
      // And what comes in a group.
      let stopGroups = () => undefined as void;
      if (canGroup()) {
        void spaceGroups()
          .then((g) => {
            if (active) stopGroups = g.onChange(load);
          })
          .catch(() => undefined);
      }
      return () => {
        active = false;
        if (onlineTimer) clearTimeout(onlineTimer);
        stop();
        sms?.remove();
        stopOrder();
        stopGroups();
        stopAsk();
      };
    }, [again]),
  );

  // The Matrix rooms, the XMPP chats and the chats with other Nostr apps join the list while the
  // space has them (lib/matrix-store.ts, lib/xmpp-store.ts, lib/nostr-dm-store.ts).
  const [matrixTick, setMatrixTick] = useState(0);
  useEffect(() => onMatrixChange(() => setMatrixTick((n) => n + 1)), []);
  const [xmppTick, setXmppTick] = useState(0);
  useEffect(() => onXmppChange(() => setXmppTick((n) => n + 1)), []);
  const [nostrTick, setNostrTick] = useState(0);
  useEffect(() => onNostrDmChange(() => setNostrTick((n) => n + 1)), []);
  const [telegramTick, setTelegramTick] = useState(0);
  useEffect(() => onTelegramChange(() => setTelegramTick((n) => n + 1)), []);
  const [msgTick, setMsgTick] = useState(0);
  useEffect(() => onMessengerChange(() => setMsgTick((n) => n + 1)), []);
  // Messenger, Signal and Session are the phone's, shown in its first space (lib/messenger-store.ts).
  const msgHere = openSpace()?.space === 0;
  const matrix = modules.has('matrix') ? matrixNow().state : null;
  const telegram = modules.has('telegram') ? telegramNow().state : null;
  const xmpp = modules.has('xmpp') ? xmppNow().state : null;
  const nostrAccount = nostrDmNow();
  const nostr = modules.has('nostr') ? nostrAccount.state : null;
  const mergedRows = useMemo(() => {
    if (!rows) return rows;
    // The copy kept from last time may still have a module's rows that is off now.
    let all = rows.filter((row) => rowOn(row, modules));
    if (matrix) all = mergeRows(all, matrixInboxRows(matrix));
    if (xmpp) all = mergeRows(all, xmppInboxRows(xmpp));
    if (nostr) all = mergeRows(all, nostrInboxRows(nostr));
    if (telegram) all = mergeRows(all, telegramInboxRows(telegram, (m) => telegramShown(m.chatId, m), 'main', telegramHomeFolders(), telegramLockedChats(), telegramAwayChats()));
    // Messenger in its case: only its chats with messages not read, which open in the case.
    if (msgHere)
      for (const service of MSG_SERVICES)
        if (modules.has(service)) all = mergeRows(all, msgInboxRows(service, messengerNow(service)).filter((row) => !msgCaseOnly(service) || row.unread > 0));
    return all;
  }, [rows, modules, matrix, matrixTick, xmpp, xmppTick, nostr, nostrTick, telegram, telegramTick, msgHere, msgTick]);
  // The space's order of its chats (lib/chat-list.ts): pinned ones at the top of the list, archived
  // ones out of it, under Archived with the archived SMS conversations, until a message comes from them.
  const here = openSpace();
  const listPlace = useMemo((): ChatListPlace | null => (here ? { holder: 'space', space: here.space, key: here.key } : null), [here?.space, here?.key]);
  const ordered = useArrangedChats(mergedRows, listPlace);
  const everyRow = ordered?.list ?? null;
  const archivedRows = useMemo(
    () => (ordered ? mergeRows(ordered.archived, buildInbox([], [], [], now, smsArchived)).filter((row) => showsIn(row, show)) : []),
    [ordered, smsArchived, now, show],
  );
  const archiveOn = archiveShown && show !== 'public';
  // Who shows online: Erevos contacts (lookOnline), and Matrix and XMPP ones as their servers say.
  const xmppConnected = modules.has('xmpp') && xmppNow().online;
  const allOnline = useMemo(() => {
    const ids = new Set(online);
    if (xmpp && xmppConnected) for (const jid of xmppOnline(xmpp)) ids.add(`xmpp:${jid}`);
    if (matrix) {
      for (const room of Object.values(matrix.rooms)) {
        const one = directOther(matrix, room);
        if (one && isOn(matrixPresence(matrix, one))) ids.add(`matrix:${room.id}`);
      }
    }
    return ids;
  }, [online, xmpp, xmppConnected, xmppTick, matrix, matrixTick]);
  // A service hidden in the Services window (lib/service-order.ts) leaves its chats out of All
  // messages too, and out of its number; a search still finds them, and its own part still shows them.
  const serviceOrder = useServiceOrder();
  const allRows = useMemo(() => {
    if (!everyRow || serviceOrder.hidden.length === 0) return everyRow;
    return everyRow.filter((row) => inAllMessages(row, serviceOrder.hidden));
  }, [everyRow, serviceOrder]);
  const shown = useMemo(() => {
    if (archiveOn) return filterInbox(archivedRows, query);
    const found = filterInbox((show === 'all' && !query.trim() ? allRows : everyRow) ?? [], query);
    return found.filter((row) => showsIn(row, show));
  }, [everyRow, allRows, query, show, archiveOn, archivedRows]);
  // With no search, the chats with messages not read come first, under Unread, and the rest under
  // Recent, each in the order they had (an SMS conversation pinned stays first of its own). A muted
  // chat's messages wait under Recent, as its number is left out of the service's.
  const listed = useMemo((): (InboxRow | Section)[] => {
    if (query.trim() || archiveOn) return shown;
    const waiting = shown.filter((row) => row.unread > 0 && !row.muted);
    if (waiting.length === 0) return shown;
    const rest = shown.filter((row) => !(row.unread > 0 && !row.muted));
    return [{ section: 'unread' }, ...waiting, ...(rest.length ? [{ section: 'recent' } as Section, ...rest] : [])];
  }, [shown, query, archiveOn]);
  // The chats of the part shown with messages not read, whatever the search says, for Mark all as
  // read in the menu (lib/read-all.ts): none in the public feed.
  const unreadShown = useMemo(() => toReadIn((show === 'all' ? allRows : everyRow) ?? [], show), [everyRow, allRows, show]);
  // The choice shows once two parts are on, each with its chip even with no chat yet: otherwise,
  // in a space with only SMS so far, leaving the Erevos chats (as Erevos's icon opens them) for All
  // hid the chips, with no way back.
  const publicRooms = !!matrix && Object.values(matrix.rooms).some((room) => isPublicRoom(matrix, room));
  const parts = inboxParts(everyRow ?? [], {
    erevos: erevosOn,
    sms: modules.has('sms'),
    matrix: modules.has('matrix'),
    xmpp: modules.has('xmpp'),
    nostr: modules.has('nostr'),
    telegram: modules.has('telegram'),
    messenger: msgHere && modules.has('messenger'),
    signal: msgHere && modules.has('signal'),
    session: msgHere && modules.has('session'),
    feed: !!nostr || publicRooms,
    tgFolders: homeFolders,
  });
  // The parts in the order chosen in the Services window, those hidden there left out (lib/service-order.ts):
  // a hidden part's chats still show under All messages. One opened by an icon or the widget shows even so.
  const arranged = arrangeServices(['all', ...parts] as InboxShow[], serviceOrder);
  const tabs: InboxShow[] = [...arranged.shown, ...(show !== 'all' && !arranged.shown.includes(show) ? [show] : [])];
  const mixed = tabs.length > 2;
  // Where New chat goes: on Matrix's part, a Matrix chat (app/matrix.tsx); on XMPP's, an XMPP one
  // (app/xmpp.tsx); on Nostr's, one with another Nostr app (app/nostr-chats.tsx); otherwise an
  // Erevos chat, or, with Erevos off, the first other part on, a new SMS last. None without chats,
  // and none on the Public part, which has New post instead, for a space with a Nostr key.
  const newChat: Href | 'sms' | null =
    show === 'public' ? null : show === 'matrix' ? '/matrix' : show === 'xmpp' ? '/xmpp' : show === 'nostr' ? '/nostr-chats' : show === 'telegram' || tgFolderOf(show) !== null ? '/telegram' : show === 'messenger' || show === 'signal' || show === 'session' ? `/${show}` : show === 'sms' && !erevosOn ? 'sms' : erevosOn ? '/chat?setup=1' : modules.has('matrix') ? '/matrix' : modules.has('xmpp') ? '/xmpp' : modules.has('nostr') ? '/nostr-chats' : modules.has('telegram') ? '/telegram' : modules.has('sms') ? 'sms' : null;
  // New post, on the Public part, for a space with a Nostr key: its public posts are signed with it.
  const newPost = show === 'public' && !!nostr;
  const [writingSms, setWritingSms] = useState(false);
  // The services, for the button under the search and its window (components/services.tsx): each
  // part of the list with its messages not read, and whether its network is connected. Erevos's is
  // its relay; Matrix's its account read with no problem; XMPP's its connection open; Nostr's its
  // inbox's relays read. The SMS and the public feed have none to show.
  const services: Service[] = tabs.map((tab) => ({
    key: tab,
    label: showLabel(tab, telegram?.folders ?? []),
    count: tabUnread((tab === 'all' ? allRows : everyRow) ?? [], tab),
    link: linkOf(tab),
  }));
  function linkOf(tab: InboxShow): Service['link'] {
    // Erevos's relay: a dot while it is ready; none while it is read or when none is set (the line
    // above says so), so the button never says Erevos is offline only because it is still starting.
    if (tab === 'erevos') return relay === 'ready' ? 'on' : null;
    if (tab === 'matrix') return matrix ? (matrixNow().problem ? 'off' : 'on') : null;
    if (tab === 'xmpp') {
      const now = xmppNow();
      return now.online ? 'on' : now.problem ? 'off' : null;
    }
    if (tab === 'nostr') return nostrAccount.reading > 0 ? 'on' : nostrAccount.problem ? 'off' : null;
    if (tab === 'messenger' || tab === 'signal' || tab === 'session') {
      const now = messengerNow(tab);
      return !now.signedIn ? null : now.connected || tab !== 'messenger' ? (now.signInAgain ? 'off' : 'on') : now.status ? 'off' : null;
    }
    return null;
  }
  // Erevos+: Facebook's feed, a card of its own in the Services window, with Messenger's sign-in
  // (lib/messenger-store.ts openFacebook); a Messenger link followed there opens that chat here.
  const messengerIn = parts.includes('messenger') && messengerNow('messenger').signedIn && !messengerNow('messenger').signInAgain;
  const [facebookHere, setFacebookHere] = useState(false);
  useEffect(() => {
    if (!messengerIn) return setFacebookHere(false);
    let live = true;
    void facebookWay().then((w) => live && setFacebookHere(w === 'facebook'), () => undefined);
    return () => {
      live = false;
    };
  }, [messengerIn]);
  const pages = facebookHere
    ? [
        {
          key: 'facebook',
          label: 'Facebook',
          onOpen: () =>
            void openFacebook().then(
              (key) => {
                if (key) router.push({ pathname: '/messenger-chat', params: { key } });
              },
              (e: unknown) => ask(t('Not done'), e instanceof Error ? e.message : String(e), [{ text: t('OK') }]),
            ),
        },
      ]
    : [];
  // Every chat of the part shown read at once, asked first, as each would be opened.
  const readAll = unreadShown.length > 0 ? () => askReadAll(ask, unreadShown, { sms: smsListed.current, onOwnRead: () => reload.current() }, () => reload.current()) : undefined;
  // Names, once there are SMS conversations: they unlock the names of their numbers.
  const hasSmsRows = (everyRow ?? []).some((row) => row.sms !== '');
  // The Public tab (components/public-feed.tsx): the posts of the people the space's Nostr key
  // follows and the messages of its public Matrix rooms, in one list. A search shows the chats it finds, as in every tab.
  const feedShown = show === 'public' && !query.trim();
  const feed = usePublicFeed(!nostrAccount.loaded ? 'loading' : nostr ? 'ready' : 'none', publicRooms, feedShown);
  // Which Matrix rooms are public is learned once, so the Public chip is there with them.
  const matrixAccount = !!matrix;
  useEffect(() => {
    if (matrixAccount) void matrixLearnJoins().catch(() => 0);
  }, [matrixAccount]);

  // Turns the names of SMS numbers on, as under Settings → Phone and SMS → SMS (Android asks first), or off.
  async function toggleNames() {
    const on = !smsShown.current.names;
    if (on && Platform.OS === 'android') {
      const answer = await PermissionsAndroid.request('android.permission.READ_CONTACTS').catch(() => null);
      if (answer !== PermissionsAndroid.RESULTS.GRANTED) {
        ask(t('Not done'), t("Erevos may not read the phone's contacts, so numbers stay as they are."), [{ text: t('OK') }]);
        return;
      }
    }
    const { space: current, key } = currentSpace();
    const link = await SmsLink.open(current, key).catch(() => null);
    if (!link) return;
    await link.setNames(on);
    smsShown.current = { ...smsShown.current, names: on };
    setAgain((n) => n + 1);
  }
  // Messages with what is looked for in them, once it is two letters or more.
  const hits = useMemo(() => (query.trim().length >= 2 ? searchMessages(searched.messages, query, 50) : []), [searched, query]);
  const nameOf = (peer: string) => searched.names.get(peer) ?? shownName({ identity: peer.replace(/^contact:/, ''), name: '' });

  const relayText = relay === 'no-queue' ? t('Relay set · no queue yet') : t('No relay yet · tap to set one');
  // The ways out of the space, for the line under the top bar (lib/ways-read.ts); Tor covers others and has no dot.
  const waysRead = useWays(WAYS_EVERY);
  const waysWaiting = waysRead?.waiting ?? 0;
  const waysShown = waysNow(waysRead?.input ?? NO_INPUT, waysWaiting);
  const shownWays = waysShown.ways.filter((way) => way.id !== 'tor');
  const waysLabel = `${t('Ways')}. ${waysShown.lead} ${waysShown.waiting}`;

  // The bar at the top, with the name and its buttons, stays where it is while the list scrolls (#12).
  const topBar = (
    <View style={styles.topBar}>
      <View style={styles.brand}>
        <Logo size={30} />
        <Text variant="title">{editionName()}</Text>
      </View>
      <View style={styles.tools}>
        {Platform.OS !== 'web' ? (
          <>
            {phoneOn ? (
              <ShortcutTile label={t('Phone')} tint="green" onPress={() => router.push('/phone')}>
                <PhoneSign />
              </ShortcutTile>
            ) : null}
            <ShortcutTile label={t('Contacts')} tint="violet" onPress={() => router.push('/contacts')}>
              <PersonSign />
            </ShortcutTile>
          </>
        ) : null}
        {collectionOn ? (
          <ShortcutTile label={t('Collection')} tint="blue" onPress={() => router.push('/collection')}>
            <CollectionSign tint="blue" />
          </ShortcutTile>
        ) : null}
        <ShortcutTile
          label={lock.passwordLock ? t('Lock now') : t('Lock and second password')}
          tint="orange"
          onPress={() => (lock.passwordLock ? lock.lockNow() : router.push('/security'))}
          // Held down, the panic button at once (#10): found fast in an emergency, never pressed by a tap.
          onLongPress={() => router.push('/panic')}
          hint={t('Hold down for the panic button')}
          dot={lock.passwordLock && signs.spaces ? { color: colors.primary, ring: colors.background, label: t('Unread messages elsewhere') } : null}
        >
          <LockSign tint="orange" />
        </ShortcutTile>
        <IconButton label={t('Menu')} onPress={() => setMenu(true)}>
          <MoreIcon color={colors.text} />
        </IconButton>
      </View>
    </View>
  );

  const header = (
    <View style={styles.headerBlock}>
      {messagesOn ? (
        <View style={styles.search}>
          <View>
            <SearchIcon color={colors.textFaint} />
            {signs.hidden ? <View accessible accessibilityLabel={t('Unread messages elsewhere')} style={[styles.searchDot, { backgroundColor: colors.primary, borderColor: colors.surfaceAlt }]} /> : null}
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => {
              press();
              void searchSubmitted();
            }}
            placeholder={t('Search chats')}
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      ) : null}
      {/* The relay is Erevos's own (lib/modules.ts). */}
      {erevosOn ? (
        <View style={styles.statusRow}>
          {/* With a relay, the line is the Ways (app/ways.tsx): a dot for each way out, full when it
              works, faint when it is on but reaches no one, a ring when it is off, and how many of the
              space's own messages wait to go. Before, it says what the relay still needs. */}
          {relay === 'ready' ? (
            <Pressable
              onPress={() => router.push('/ways')}
              accessibilityRole="button"
              accessibilityLabel={waysLabel}
              style={({ pressed }) => [styles.status, pressed && styles.pressed]}
            >
              <View style={styles.wayDots}>
                {shownWays.map((way) => {
                  const hue = HUES[way.id][scheme === 'dark' ? 1 : 0];
                  return (
                    <View
                      key={way.id}
                      style={[styles.dot, way.look === 'off' ? { borderWidth: 1.5, borderColor: colors.textFaint, borderStyle: 'dashed' } : { backgroundColor: way.look === 'up' ? hue : withAlpha(hue, 0.35) }]}
                    />
                  );
                })}
              </View>
              <Text variant="caption" tone="muted" style={styles.statusText}>
                {t('Ways')}
              </Text>
              {waysWaiting > 0 ? (
                <Text variant="caption" color={colors.warning} style={[styles.statusText, fontStyle('600')]}>
                  {plural(waysWaiting, '· {n} waits to go', '· {n} wait to go')}
                </Text>
              ) : null}
              <ChevronIcon color={colors.textFaint} size={12} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/chat?setup=1')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.status, pressed && styles.pressed]}
            >
              <View style={[styles.dot, { backgroundColor: relay === 'no-queue' ? colors.warning : colors.textFaint }]} />
              <Text variant="caption" tone="muted" style={styles.statusText}>
                {relayText}
              </Text>
            </Pressable>
          )}
          {/* Invite someone at a tap: its QR code shows at once (components/welcome-invite.tsx). A linked device invites from the phone. */}
          {relay === 'ready' && linkedRole() !== 'linked' ? (
            <Pressable
              onPress={() => router.push('/chat?setup=invite')}
              accessibilityRole="button"
              accessibilityLabel={t('Invite someone')}
              style={({ pressed }) => [styles.status, { backgroundColor: colors.primary }, pressed && styles.pressed]}
            >
              <PlusIcon color={colors.onPrimary} size={14} />
              <Text variant="caption" style={[styles.statusText, { color: colors.onPrimary }]}>
                {t('Invite')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {/* The services: one button, which opens them all in a window (components/services.tsx), so
          however many there are, the list starts at once under it. */}
      {mixed || arranged.hidden.length > 0 || pages.length > 0 ? (
        <Services
          services={services}
          hidden={arranged.hidden.map((key) => ({ key, label: showLabel(key, telegram?.folders ?? []) }))}
          pages={pages}
          current={show}
          onPick={(key) => setShow(key as InboxShow)}
          onAdd={() => router.push('/modules')}
          onReadAll={readAll}
          onMove={(key, by) => void moveService(tabs, key, by)}
          start={start}
          onStart={(key) => void startOn(key)}
          onHide={(key, hide) => {
            void hideService(key, hide);
            if (hide && show === key) setShow('all');
          }}
        />
      ) : null}
      {hasSmsRows && !smsMirrored() && (show === 'all' || show === 'sms') ? (
        <Row wrap>
          <Chip label={t('Names')} selected={smsShown.current.names} onPress={() => void toggleNames()} />
        </Row>
      ) : null}
      {feedShown ? feed.intro : null}
      {archiveOn ? (
        <Text variant="caption" tone="muted">
          {t('Chats you archived. One comes back to the list when a new message comes from them. Hold one down for more.')}
        </Text>
      ) : null}
      {archivedRows.length + folders.spam + folders.trash > 0 || archiveOn ? (
        <Row wrap>
          {/* What is archived, every chat's of the part shown, in place of the list until tapped again. */}
          {archivedRows.length || archiveOn ? <Chip label={t('Archived · {n}', { n: archivedRows.length })} selected={archiveOn} onPress={() => setArchiveShown(!archiveOn)} /> : null}
          {folders.spam ? <Chip label={t('Spam · {n}', { n: folders.spam })} onPress={() => router.push('/sms-folder?folder=spam')} /> : null}
          {folders.trash ? <Chip label={t('Trash · {n}', { n: folders.trash })} onPress={() => router.push('/sms-folder?folder=trash')} /> : null}
        </Row>
      ) : null}
      {/* A new Erevos, then Chat with myself, stay first, whatever comes in, but for one network alone and a search. */}
      {release && !query.trim() && !archiveOn && (show === 'all' || show === 'erevos') ? <ReleaseRow release={release} /> : null}
      {erevosOn && notes !== null && !query.trim() && !archiveOn && (show === 'all' || show === 'erevos') ? <MyselfRow notes={notes} /> : null}
    </View>
  );

  // The list ends above the keyboard while the search is typed in, and New chat floats above it.
  return (
    <KeyboardPaddedView inset={insets.bottom} style={styles.container}>
      {/* A swipe to the side goes to the chip beside (All messages, SMS, Erevos, Matrix, XMPP, Public, Nostr), on the rows too:
          an SMS conversation is archived or deleted by holding it down. */}
      <View style={[styles.list, styles.fixedBar]}>{topBar}</View>
      <SwipeTabs tabs={mixed ? tabs : []} current={show} onChange={setShow}>
        <FlatList<InboxRow | PublicItem | Section>
          // The Public tab's posts are rows of the same list, so the search above them stays as it is.
          data={feedShown ? feed.items : listed}
          // Android's clipping of rows off the screen closed Erevos on Fabric (a row added twice).
          removeClippedSubviews={false}
          keyExtractor={(item) => (isSection(item) ? `section:${item.section}` : isPublicItem(item) ? item.id : item.identity)}
          ListHeaderComponent={header}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
          renderItem={({ item }) =>
            isSection(item) ? (
              item.section === 'unread' ? (
                <ListSection title={t('Unread · {n}', { n: tabUnread(shown, 'all') })} action={readAll ? t('Mark all as read') : undefined} onAction={readAll} />
              ) : (
                <ListSection title={t('Recent')} />
              )
            ) : isPublicItem(item) ? (
              feed.render(item)
            ) : item.sms ? (
              <ChatRow row={item} now={now} onLong={() => setTarget({ address: item.sms, name: shownName(item), at: item.at, folder: archiveOn ? 'archived' : 'list' })} />
            ) : (
              // Held down, what can be done to it: an invitation is answered on its own screen.
              <ChatRow row={item} now={now} online={allOnline.has(item.identity)} onLong={item.invited ? undefined : () => setChatTarget(item)} />
            )
          }
          extraData={feedShown ? feed.extra : allOnline}
          refreshControl={feed.refreshControl}
          onEndReached={feed.more}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            feedShown ? (feed.empty ?? undefined) : everyRow === null || hits.length > 0 ? undefined : archiveOn && !query ? (
              <Text tone="muted" style={styles.emptyText}>
                {t('Nothing archived.')}
              </Text>
            ) : query ? (
              <Text tone="muted" style={styles.emptyText}>
                {t('No chat has “{query}” in it.', { query: query.trim() })}
              </Text>
            ) : show === 'matrix' ? (
              <Text tone="muted" style={styles.emptyText}>
                {t('No Matrix chats yet.')}
              </Text>
            ) : show === 'xmpp' ? (
              <Text tone="muted" style={styles.emptyText}>
                {t('No XMPP chats yet.')}
              </Text>
            ) : show === 'nostr' ? (
              <Text tone="muted" style={styles.emptyText}>
                {t('No Nostr chats yet.')}
              </Text>
            ) : tgFolderOf(show) !== null ? (
              <Text tone="muted" style={styles.emptyText}>
                {t('No chats in this folder yet.')}
              </Text>
            ) : show === 'messenger' || show === 'signal' || show === 'session' ? (
              <View style={styles.empty}>
                <Text tone="muted" style={styles.emptyText}>
                  {show === 'messenger' && messengerNow(show).signedIn && msgMessengerWay() === 'case'
                    ? t('Messenger opens in its case: Meta’s own page, closed in by Erevos.')
                    : messengerNow(show).signedIn
                      ? t('No chats yet.')
                      : t('Not signed in to {service} on this phone.', { service: SERVICE_NAMES[show] })}
                </Text>
                <Button
                  title={t('Open {service}', { service: SERVICE_NAMES[show] })}
                  compact
                  onPress={() =>
                    show === 'messenger' && messengerNow(show).signedIn && !messengerNow(show).signInAgain && msgMessengerWay() === 'case'
                      ? void openMessengerCase().catch(() => router.push('/messenger'))
                      : router.push(`/${show}`)
                  }
                />
              </View>
            ) : show === 'telegram' ? (
              <View style={styles.empty}>
                <Text tone="muted" style={styles.emptyText}>
                  {t('No Telegram chats yet.')}
                </Text>
                <Button title={t('Open Telegram')} compact onPress={() => router.push('/telegram')} />
              </View>
            ) : show === 'sms' ? (
              // The SMS chip shows while the SMS are on, also before Erevos is the SMS app, which
              // alone may read them: Settings → Phone and SMS → SMS makes it that.
              smsStatus()?.isDefault ? (
                <Text tone="muted" style={styles.emptyText}>
                  {t('No SMS yet.')}
                </Text>
              ) : (
                <View style={styles.empty}>
                  <Text tone="muted" style={styles.emptyText}>
                    {t('Erevos is not the SMS app')}
                  </Text>
                  <Button title={t('Make Erevos the SMS app')} compact onPress={() => router.push('/sms-settings')} />
                </View>
              )
            ) : !messagesOn ? (
              // The Phone alone (lib/modules.ts): no chats, nor SMS, to list.
              <View style={styles.empty}>
                <Logo size={64} />
                <Text variant="heading" style={styles.emptyText}>
                  {t('Only the Phone is on')}
                </Text>
                <Text tone="muted" style={styles.emptyText}>
                  {t('Erevos shows no chats, as no part with messages is on. More parts can be turned on in Settings → General → Modules.')}
                </Text>
                <Row wrap style={{ justifyContent: 'center' }}>
                  <Button title={t('Phone')} compact onPress={() => router.push('/phone')} />
                  <Button title={t('Modules')} kind="secondary" compact onPress={() => router.push('/modules')} />
                </Row>
              </View>
            ) : (
              <View style={styles.empty}>
                <Logo size={64} />
                <Text variant="heading" style={styles.emptyText}>
                  {t('No chats yet')}
                </Text>
                {erevosOn ? (
                  <Text tone="muted" style={styles.emptyText}>
                    {t("No account and no phone number. Share your contact link or QR code, or add someone else's, to start a chat.")}
                  </Text>
                ) : null}
                {erevosOn && relay === 'ready' && linkedRole() !== 'linked' ? (
                  <Button title={t('Invite someone')} onPress={() => router.push('/chat?setup=invite')} />
                ) : null}
              </View>
            )
          }
          ListFooterComponent={
            feedShown ? (feed.footer ?? undefined) : hits.length > 0 ? (
              <View style={styles.found}>
                <Text variant="overline" tone="muted">
                  {t('Messages')}
                </Text>
                {hits.map((hit) => (
                  <FoundRow
                    key={`${hit.peer}|${hit.tag}`}
                    name={foundName(hit, nameOf(hit.peer))}
                    line={hit.line}
                    at={hit.at}
                    now={now}
                    onPress={() => router.push(foundAt(hit))}
                  />
                ))}
              </View>
            ) : undefined
          }
        />
      </SwipeTabs>
      {/* Remind me, named where there is room for it beside New chat: Remind me only with Erevos, as it
          goes in Chat with myself, and New chat with any part that has chats (lib/modules.ts). */}
      {newChat || newPost ? (
        <View style={[styles.fabs, { bottom: insets.bottom + space.xl }]}>
          {erevosOn ? (
            <Pressable
              onPress={() => setReminding(true)}
              accessibilityRole="button"
              accessibilityLabel={t('Remind me')}
              style={({ pressed }) => [styles.remindFab, !wide && styles.remindRound, pressed && styles.fabPressedLight]}
            >
              <BellIcon color="#ffffff" size={22} />
              {wide ? (
                <Text variant="label" color="#ffffff">
                  {t('Remind me')}
                </Text>
              ) : null}
            </Pressable>
          ) : null}
          {newPost ? (
            <Pressable
              onPress={feed.post}
              accessibilityRole="button"
              accessibilityLabel={t('New post')}
              style={({ pressed }) => [styles.fab, shape.glow && { boxShadow: `0px 0px 18px ${withAlpha(colors.primary, 0.6)}` }, pressed && styles.fabPressed]}
            >
              <PencilIcon color={colors.onPrimary} size={20} />
              <Text variant="label" color={colors.onPrimary}>
                {t('New post')}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => (newChat === 'sms' ? setWritingSms(true) : newChat && router.push(newChat))}
              onLongPress={() => {
                // The PIN of hidden chats, which are Erevos's own.
                if (!moduleOn('erevos')) return;
                try {
                  Vibration.vibrate(DOOR_BUZZ);
                } catch {
                  // A phone without a vibrator: nothing to feel.
                }
                setDoor(true);
              }}
              delayLongPress={DOOR_HOLD}
              accessibilityRole="button"
              accessibilityLabel={t('New chat')}
              style={({ pressed }) => [
                styles.fab,
                // Neon and Matrix: lit, so it glows.
                shape.glow && { boxShadow: `0px 0px 18px ${withAlpha(colors.primary, 0.6)}` },
                pressed && styles.fabPressed,
              ]}
            >
              <PlusIcon color={colors.onPrimary} size={20} />
              <Text variant="label" color={colors.onPrimary}>
                {newChat === 'sms' ? t('New SMS') : t('New chat')}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}
      <NewSmsSheet visible={writingSms} onClose={() => setWritingSms(false)} />
      <UndoBar bottom={insets.bottom + space.xl + 56 + space.md} />
      <SmsActions target={target} onClose={() => setTarget(null)} />
      <ChatActions target={chatTarget} place={listPlace} where="space" undo onClose={() => setChatTarget(null)} onChanged={() => reload.current()} />
      {feed.sheet}
      <Sheet visible={door} onClose={closeDoor}>
        <Input
          value={doorPin}
          onChangeText={setDoorPin}
          placeholder={t('PIN')}
          secureTextEntry
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={() => {
            press();
            void openDoor();
          }}
        />
        <Button title={t('Open')} onPress={() => void openDoor()} />
      </Sheet>
      <Sheet visible={reminding} onClose={closeReminder} title={t('Remind me')}>
        <Input value={reminder} onChangeText={setReminder} placeholder={t('What to remind you of')} multiline maxLength={MAX_NOTE_TEXT} autoFocus />
        <LaterPicker remind onPick={(at) => void keepReminder(at)} />
        {reminderSaid ? (
          <Text variant="caption" color={colors.danger}>
            {reminderSaid}
          </Text>
        ) : (
          <Text variant="caption" tone="muted">
            {t('It goes in Chat with myself, and only says “Reminder” on the phone at that time.')}
          </Text>
        )}
      </Sheet>
      <Sheet visible={menu} onClose={closeMenu}>
        {/* The panic button first and red, so it is found at once in an emergency (#10). It opens
            its screen, where Wipe now is first and asks once more, so a slip wipes nothing. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMenu(false);
            router.push('/panic');
          }}
          style={({ pressed }) => [styles.panicRow, { backgroundColor: withAlpha(colors.danger, 0.12), borderColor: colors.danger }, pressed && styles.pressed]}
        >
          <View style={[styles.panicSign, { backgroundColor: colors.danger }]}>
            <Text variant="bodyStrong" style={styles.panicMark}>
              !
            </Text>
          </View>
          <View style={styles.settingsText}>
            <Text variant="bodyStrong" color={colors.danger}>
              {t('Panic button')}
            </Text>
            <Text variant="caption" tone="muted">
              {t('Wipe Erevos at once')}
            </Text>
          </View>
        </Pressable>
        {/* A linked device has the phone's groups, but makes and joins none (lib/devices.ts). */}
        {MENU.map((item) => (item.links && !nearbyOn() ? { ...item, detail: mark('Off on this phone. Tap to turn on Look for phones nearby.'), href: '/chat?setup=nearby' as Href } : item)).filter((item) => (!item.erevos || erevosOn) && (item.href !== '/starred' || messagesOn) && (!item.links || HAS_LINKS) && (item.href !== '/new-group' || (canGroup() && linkedRole() !== 'linked')) && (item.href !== '/public-groups' || (canPublicGroup() && linkedRole() !== 'linked'))).map((item) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            onPress={() => {
              setMenu(false);
              router.push(item.href);
            }}
            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
          >
            <Text variant="bodyStrong">{t(item.title)}</Text>
            <Text variant="caption" tone="muted">
              {t(item.detail)}
            </Text>
          </Pressable>
        ))}
        {/* Every chat of the part shown read at once, asked first, as each would be opened. */}
        {readAll ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setMenu(false);
              readAll();
            }}
            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
          >
            <Text variant="bodyStrong">{t('Mark all as read')}</Text>
            <Text variant="caption" tone="muted">
              {plural(unreadShown.length, '{n} chat', '{n} chats')}
            </Text>
          </Pressable>
        ) : null}
        {/* Named in English too, so the language is found in one that cannot be read. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMenu(false);
            router.push('/settings');
          }}
          style={({ pressed }) => [styles.menuRow, styles.settingsRow, pressed && styles.pressed]}
        >
          <GearIcon color={colors.accentText} size={22} />
          <View style={styles.settingsText}>
            <Text variant="bodyStrong">{lang() === 'en' ? 'Settings' : `${t('Settings')} · Settings`}</Text>
            <Text variant="caption" tone="muted">
              {t('Language, appearance, privacy, the relay and more')}
            </Text>
          </View>
        </Pressable>
      </Sheet>
    </KeyboardPaddedView>
  );
}

function IconButton({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const EREVOS_FACE = require('../assets/icon/favicon.png');

// A new Erevos, as a message from Erevos itself at the top of the chats: in amber with a mark until
// Updates was opened, then plainly, until it is installed.
function ReleaseRow({ release }: { release: Told & { seen: boolean } }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  // A release of the plain Erevos (7.0.x), told in Erevos+ whose Updates chose it, says Erevos's name.
  const of: Edition = /^\d+\.\d*[02468]\.\d/.test(release.name) ? 'lite' : EDITION;
  const said = tFor(of, 'Erevos {name} is out. Tap to see what is new and update.', { name: release.name });
  return (
    <Pressable
      onPress={() => router.push('/updates')}
      accessibilityRole="button"
      accessibilityLabel={`${editionName(of)}, ${said}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Image source={EREVOS_FACE} style={{ width: 52, height: 52, borderRadius: 26 }} accessibilityIgnoresInvertColors />
      <View style={styles.rowBody}>
        <View style={styles.rowLine}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.rowName}>
            {editionName(of)}
          </Text>
          <PinIcon color={colors.textFaint} size={13} />
        </View>
        <View style={styles.rowLine}>
          <View style={styles.previewLine}>
            <Text numberOfLines={2} variant="caption" tone={release.seen ? 'muted' : undefined} color={release.seen ? undefined : colors.warning} style={[styles.preview, release.seen ? null : styles.previewUnread]}>
              {said}
            </Text>
          </View>
          {release.seen ? null : (
            <View style={[styles.badge, { backgroundColor: colors.warning }]}>
              <Text variant="caption" color="#ffffff" style={styles.badgeText}>
                1
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ground,
    },
    list: {
      width: '100%',
      maxWidth: 760,
      alignSelf: 'center',
      paddingHorizontal: space.lg,
    },
    headerBlock: {
      gap: space.md,
      paddingTop: space.md,
      paddingBottom: space.sm,
    },
    fixedBar: {
      paddingTop: space.md,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
    },
    tools: {
      flexDirection: 'row',
      gap: space.xs,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      backgroundColor: colors.surfacePressed,
    },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      height: 46,
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: withAlpha(colors.border, 0.6),
    },
    searchDot: {
      position: 'absolute',
      top: -3,
      right: -4,
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      color: colors.text,
      fontSize: 16,
      ...(fontStyle('400') ?? {}),
      ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
    },
    status: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: space.sm,
      paddingVertical: 6,
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: withAlpha(colors.border, 0.6),
    },
    statusText: {
      fontSize: 12,
    },
    statusRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: space.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    wayDots: {
      flexDirection: 'row',
      gap: 3,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingVertical: space.sm + 2,
      paddingHorizontal: space.sm,
      marginHorizontal: -space.sm,
      borderRadius: radius.lg,
    },
    rowBody: {
      flex: 1,
      gap: 3,
    },
    rowLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space.sm,
    },
    rowName: {
      flex: 1,
    },
    previewLine: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    preview: {
      flex: 1,
      fontSize: 14,
    },
    previewUnread: {
      ...font('600'),
    },
    badge: {
      minWidth: 22,
      height: 22,
      paddingHorizontal: 6,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    badgeText: {
      fontSize: 12,
      ...font('700'),
    },
    empty: {
      alignItems: 'center',
      gap: space.md,
      paddingTop: space.xxl * 2,
      paddingHorizontal: space.xl,
    },
    emptyText: {
      textAlign: 'center',
    },
    // The messages the search found, under the chats it found.
    found: {
      gap: space.sm,
      paddingHorizontal: space.lg,
      paddingTop: space.lg,
    },
    fabs: {
      position: 'absolute',
      right: space.xl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
    },
    fab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      height: 56,
      paddingHorizontal: space.xl - 4,
      borderRadius: 28,
      backgroundColor: colors.primary,
      boxShadow: `0px 8px 24px ${withAlpha('#000000', 0.35)}`,
    },
    fabPressed: {
      backgroundColor: colors.primaryPressed,
    },
    // Remind me: amber, as a reminder is, on every look.
    remindFab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      height: 56,
      paddingHorizontal: space.lg,
      borderRadius: 28,
      backgroundColor: '#f28a12',
      ...gradientStyle('linear-gradient(160deg, #ffc061 0%, #f28a12 100%)'),
      boxShadow: `0px 8px 24px ${withAlpha('#000000', 0.35)}`,
    },
    remindRound: {
      width: 56,
      paddingHorizontal: 0,
      justifyContent: 'center',
    },
    fabPressedLight: {
      opacity: 0.85,
    },
    menuRow: {
      gap: 2,
      paddingVertical: space.sm + 2,
      paddingHorizontal: space.sm,
      borderRadius: radius.md,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      paddingTop: space.md,
    },
    settingsText: {
      flex: 1,
      gap: 2,
    },
    panicRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      padding: space.md,
      marginBottom: space.sm,
      borderWidth: 2,
      borderRadius: radius.lg,
    },
    panicSign: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    panicMark: {
      color: '#ffffff',
      fontSize: 19,
    },
  });
