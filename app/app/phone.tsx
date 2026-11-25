// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, FlatList, Image, PermissionsAndroid, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View, type LayoutChangeEvent, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchIcon } from '../components/icons';
import { SpeedDialPick } from '../components/speed-dial';
import { SwipeTabs } from '../components/swipe-tabs';
import { Button, Card, Chip, fontStyle, Page, Row, Sheet, Text, TextButton } from '../components/ui';
import { offerUndo, UNDO_SHOWS, UndoBar } from '../components/undo-bar';
import { ask } from '../lib/alert';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { cardHref, dialCards, isContactNumber, type Card as ContactCard } from '../lib/contact-book';
import { addToContactHref, newContactHref, toDial, toDialKeys, type DialRow, type Findable } from '../lib/contacts';
import { press, tap } from '../lib/haptics';
import { Held } from '../lib/held';
import { mark, plural, t, useLang } from '../lib/i18n';
import { refreshKnownNames } from '../lib/known-names';
import { callLength, dialNumber, keyLetters, KEYS, textable, typeKey } from '../lib/phone';
import { isBlocked, onSmsOrderChanged, smsOrderChanged } from '../lib/sms-folders';
import { sameNumber } from '../lib/sms-invite';
import {
  CALL_FILTERS,
  callClock,
  callKind,
  callMarks,
  callsWith,
  callWho,
  dayLabel,
  filterCalls,
  groupCalls,
  hiddenNumber,
  keepHistory,
  keptHistory,
  KIND_LABELS,
  withDays,
  withoutCalls,
  type CallFilter,
  type CallHistory,
  type CallRow,
} from '../lib/phone-log';
import { lockedSpeedDials } from '../lib/phone-open';
import { blockedUntil, liftGroup, liveGroups, rulesFrom, rulesJson, type PhoneRules } from '../lib/phone-rules';
import { accountLabel, callAccount, PhoneSims } from '../lib/phone-sims';
import { refreshSpamList } from '../lib/spam-list';
import { currentSpace } from '../lock/keys';
import {
  blockingRules,
  callHistory,
  deleteCalls,
  deleteCallsOf,
  onPhoneEvent,
  phoneAccounts,
  phoneFavourites,
  phoneGroups,
  phoneReady,
  phoneStatus,
  placeCall,
  isEmergencyNumber,
  callVoicemail,
  deleteVoicemail,
  hasVoicemail,
  playVoicemail,
  stopVoicemail,
  voicemailReady,
  voicemails,
  placeVideoCall,
  videoCalling,
  reportedSpam,
  reportSpam,
  spamReady,
  type Voicemail,
  seenMissedCalls,
  setBlockingRules,
  showCall,
  type ContactGroup,
  type Favourite,
  type LoggedCall,
  type PhoneAccount,
  type PhoneStatus,
} from '../modules/erevos-phone';
import { contactsStatus } from '../modules/erevos-contacts';
import { blockedNumbers, blockNumber, canBlockNumbers, unblockNumber } from '../modules/erevos-sms';
import { radius, space, withAlpha, type Colors } from '../theme/colors';
import { useStyles, useTheme } from '../theme/context';

// The phone, with Erevos as Android's phone app (modules/erevos-phone): the keypad to call a
// number, the calls (Android's call history, with filters) and the favourites (the phone's starred
// contacts); above them a search for a contact to call (lib/contact-book.ts dialCards), and, while
// a contact group's calls are blocked, a reminder with Lift. A call
// itself shows on the native call screen, which works with Erevos locked and over the phone's lock
// screen; this screen is behind Erevos's password like the rest of the app, unless its owner lets
// it open without it (lib/phone-open.ts): then, with Erevos locked, it shows on its own
// (app/_layout.tsx), with the names of the phone's contacts only, and calls can be looked at and
// made, nothing changed. It opens from tel: links and the phone's call button with the number
// typed in (`number`), and from Android's notice of a missed call on the calls (`tab`). With two SIMs, each call goes on the one chosen for its
// number (lib/phone-sims.ts), else on the one chosen now, which is then kept for the number.

type Tab = 'keypad' | 'recents' | 'favourites' | 'voicemail';

const TABS: { tab: Tab; label: string }[] = [
  { tab: 'keypad', label: mark('Keypad') },
  { tab: 'recents', label: mark('Recents') },
  { tab: 'favourites', label: mark('Favourites') },
];

// Voicemail shows only where the phone company sends voicemails as recordings, and only with Erevos open.
const VOICEMAIL_TAB: { tab: Tab; label: string } = { tab: 'voicemail', label: mark('Voicemail') };

const tabOf = (tab: unknown): Tab => (tab === 'recents' || tab === 'favourites' || tab === 'voicemail' ? tab : 'keypad');

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

// Calls deleted from Recents hide at once, and leave Android's call history once Undo has shown
// (lib/held.ts), whatever screen shows then, or at once when Erevos goes to the background. `calls`
// are the ids that hide; with a `number`, every call with it up to `before` goes, the older ones too.
type Deleting = { id: string; calls: number[]; number: string; before: number };
const deleting = new Held<Deleting>();
AppState.addEventListener('change', (state) => state === 'background' && deleting.flush());
// The ids hidden: waiting to go, or gone and not yet read again without them.
const hiding = new Set<number>();
const hidingChanged = new Set<() => void>();
const tellHiding = () => hidingChanged.forEach((listener) => listener());

// The open space's key, which the call history kept is for (lib/phone-log.ts); null while Erevos is locked.
function spaceKey(): Uint8Array | null {
  try {
    return currentSpace().key;
  } catch {
    return null;
  }
}

// Reads the call history, and keeps it for the next time the calls show.
async function readHistory(): Promise<CallHistory> {
  const space = spaceKey();
  const history = await callHistory().catch((): CallHistory => ({ allowed: false, calls: [] }));
  keepHistory(space, history);
  return history;
}

async function deleteNow(item: Deleting) {
  try {
    await (item.number ? deleteCallsOf(item.number, item.before) : deleteCalls(item.calls));
  } catch (error) {
    // They show again, and the owner hears why.
    item.calls.forEach((id) => hiding.delete(id));
    tellHiding();
    ask(t('Not done'), t('The calls were not deleted. {error}', { error: errorText(error) }), [{ text: t('OK') }]);
  }
}

export default function Phone() {
  const params = useLocalSearchParams<{ number?: string; tab?: string; opened?: string }>();
  return <PhoneView params={params} />;
}

/** The Phone shown with Erevos locked (app/_layout.tsx): `onOpen` shows the password screen, and
 *  `onCalled` is told just before a call is made, which takes Erevos to the background. */
export type LockedPhone = { onOpen: () => void; onCalled: () => void };

/** The Phone, with a link's details (`params`); `locked` with Erevos locked. A link opened again
 *  (`opened` changes, app/_layout.tsx), as its icon or the widget's button tapped again, shows its
 *  tab again: the keypad, unless it names another. */
export function PhoneView({ params, locked }: { params: { number?: string; tab?: string; opened?: string }; locked?: LockedPhone }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<PhoneStatus | null>(phoneStatus());
  const [tab, setTab] = useState<Tab>(typeof params.number === 'string' ? 'keypad' : tabOf(params.tab));
  const [number, setNumber] = useState(dialNumber(typeof params.number === 'string' ? params.number : ''));
  const [note, setNote] = useState('');
  const [accounts, setAccounts] = useState<PhoneAccount[]>([]);
  const [sims, setSims] = useState<PhoneSims | null>(null);
  // The SIM chosen on the keypad, '' until one is.
  const [chosen, setChosen] = useState('');
  // The number to call once its SIM is chosen.
  const [choosing, setChoosing] = useState<string | null>(null);
  // The actions for the number typed on the keypad (add it to the contacts, text it, copy it).
  const [more, setMore] = useState(false);
  // The height left for the keypad under the title, card and tabs, and those of its SIM chips and
  // note, once laid out.
  const [room, setRoom] = useState(0);
  const [simHeight, setSimHeight] = useState(0);
  const [noteHeight, setNoteHeight] = useState(0);
  const keypad = useRef<ScrollViewInstance>(null);
  // The keys' scroll: its height on the screen, and its content's.
  const keysFrame = useRef(0);
  const keysContent = useRef(0);
  const screenSize = useWindowDimensions();
  // A short phone has no room for the card's explanation above the keypad, on any tab, so the tabs
  // stay where they are: its title alone, which opens the settings that say the rest. A tablet on
  // its side is short too, but has the room.
  const brief = screenSize.height < BRIEF_BELOW && screenSize.width < WIDE;
  // A narrow one, or one with large text, has no room for the tabs side by side as they are: they
  // share the row.
  const narrow = screenSize.width / Math.max(1, screenSize.fontScale) < NARROW_BELOW;
  // The search for a contact to call: in the phone's contacts, and the open space's own.
  const [query, setQuery] = useState('');
  const [dialable, setDialable] = useState<ContactCard[] | null>(null);
  const [mayRead, setMayRead] = useState(true);
  const [searchNote, setSearchNote] = useState('');
  const searching = query.trim() !== '';
  const findables = useMemo(() => new Map<string, Findable>(), [dialable]);
  const hits = useMemo(() => (dialable ? toDial(dialable, query, findables) : []), [dialable, query, findables]);

  // Read anew each time a search starts, so a contact added meanwhile is found.
  const readDialable = useCallback(() => {
    setMayRead(contactsStatus().read);
    dialCards(!locked).then(setDialable, () => setDialable([]));
  }, [locked]);
  useEffect(() => {
    if (searching) readDialable();
    else setSearchNote('');
  }, [searching, readDialable]);
  // The contacts what is typed on the keypad finds, by number or by name on the keys' letters (T9),
  // shown over the keys as a dialer does: the first, and the others in a list.
  const keyHits = useMemo(() => (dialable && number ? toDialKeys(dialable, number, KEY_HITS) : []), [dialable, number]);
  const [allHits, setAllHits] = useState(false);
  // Whether the phone keeps voicemails (visual voicemail), for their tab; never with Erevos locked.
  const [hasVoicemails, setHasVoicemails] = useState(false);
  // The speed dial key whose number is being chosen.
  const [speedKey, setSpeedKey] = useState<string | null>(null);
  const tabs = hasVoicemails ? [...TABS, VOICEMAIL_TAB] : TABS;
  const tabOrder = tabs.map((each) => each.tab);
  const readVoicemails = useCallback(() => {
    if (locked || !voicemailReady()) return;
    voicemails().then(
      (found) => setHasVoicemails(found.voicemails.length > 0),
      () => setHasVoicemails(false),
    );
  }, [locked]);
  // Read as the keypad shows, and anew each time it does, so a contact added meanwhile is found.
  useEffect(() => {
    if (tab === 'keypad' && !searching) readDialable();
  }, [tab, readDialable]);

  useEffect(() => {
    if (typeof params.number !== 'string') return;
    setNumber(dialNumber(params.number));
    setTab('keypad');
  }, [params.number, params.opened]);

  useEffect(() => {
    if (typeof params.number === 'string') return;
    if (typeof params.tab === 'string' || typeof params.opened === 'string') setTab(tabOf(params.tab));
  }, [params.number, params.tab, params.opened]);

  useEffect(() => {
    // Android answers in its own screens, and calls come and go: look again then.
    const look = () => {
      setStatus(phoneStatus());
      phoneAccounts().then(setAccounts, () => setAccounts([]));
      readVoicemails();
    };
    look();
    // The calls are read at once, so that they show as soon as they are opened.
    void readHistory();
    // With Erevos locked, no space is open: no SIM is kept for a number, and no name of its own shows.
    if (!locked) {
      const { space: open, key } = currentSpace();
      PhoneSims.open(open, key).then(setSims, () => setSims(null));
      // A contact linked to a number since the space opened: its calls show its name too.
      void refreshKnownNames();
      // The spam list, a week old, comes again when the owner switched that on.
      void refreshSpamList();
    }
    const app = AppState.addEventListener('change', (state) => state === 'active' && look());
    const calls = onPhoneEvent('onCalls', () => setStatus(phoneStatus()));
    return () => {
      app.remove();
      calls?.remove();
    };
  }, []);

  // A number with a SIM kept for it shows that SIM chosen.
  useEffect(() => {
    const kept = sims?.accountFor(number) ?? '';
    if (kept && accounts.some((a) => a.id === kept)) setChosen(kept);
  }, [number, sims, accounts]);

  // "Type a phone number." goes as soon as one is typed.
  useEffect(() => {
    if (number) setNote((shown) => (shown === t('Type a phone number.') || shown === t('Copied.') || shown === t('Not copied.') ? '' : shown));
    else setMore(false);
  }, [number]);

  if (Platform.OS !== 'android' || !phoneReady()) {
    return (
      <Page>
        <Text variant="title">{t('Phone')}</Text>
        <Text tone="muted">
          {Platform.OS === 'android'
            ? t('This build of Erevos has no phone part yet. It comes with the next build of the app.')
            : t('Only Android lets another app be the phone app.')}
        </Text>
      </Page>
    );
  }

  // Calls `to` on `account`; without one, on the SIM kept for the number, or asks which. With two
  // SIMs, the one it goes on is kept for the number.
  async function call(to: string, account?: string) {
    press();
    const plain = dialNumber(to);
    if (!plain) {
      setNote(t('Type a phone number.'));
      return;
    }
    setNote('');
    // An emergency number goes at once, on the SIM Android picks: never asked which, nor kept.
    const emergency = isEmergencyNumber(plain);
    const on = emergency ? '' : (account ?? callAccount(accounts, sims?.accountFor(plain) ?? ''));
    if (on === null) {
      setChoosing(plain);
      return;
    }
    try {
      // The phone app may call; otherwise Android asks first.
      if (!phoneStatus()?.isDefault) {
        const answer = await PermissionsAndroid.request('android.permission.CALL_PHONE');
        if (answer !== PermissionsAndroid.RESULTS.GRANTED) throw new Error(t('Erevos may not make calls. Make it the phone app under Settings.'));
      }
      locked?.onCalled();
      await placeCall(plain, on);
      if (on && !emergency && accounts.length >= 2) sims?.remember(plain, on).catch(() => undefined);
    } catch (error) {
      setNote(t('Not called. {error}', { error: error instanceof Error ? error.message : String(error) }));
    }
  }

  async function copyNumber(to: string) {
    setNote((await copyText(to)) ? t('Copied.') : t('Not copied.'));
  }

  // A video call through the phone company (ViLTE), from the number's ⋯, where a SIM can make one.
  async function videoCall(to: string) {
    press();
    const plain = dialNumber(to);
    if (!plain) return;
    setNote('');
    const account = accounts.some((a) => a.id === chosen) ? chosen : (callAccount(accounts, sims?.accountFor(plain) ?? '') ?? '');
    try {
      if (!phoneStatus()?.isDefault) throw new Error(t('Erevos may not make calls. Make it the phone app under Settings.'));
      locked?.onCalled();
      await placeVideoCall(plain, account);
    } catch (error) {
      setNote(t('Not called. {error}', { error: error instanceof Error ? error.message : String(error) }));
    }
  }

  // Speed dial, 2 to 9 held on an empty keypad: calls the key's number, or offers to choose one.
  // With Erevos locked, only a number one space lets work so (lib/phone-open.ts) is called.
  function speedDial(key: string) {
    if (locked) {
      void lockedSpeedDials().then((copy) => {
        const kept = copy?.keys.find((k) => k.key === key);
        if (kept) {
          void call(kept.number);
          return;
        }
        press();
        setNote(t('Speed dial works with Erevos unlocked.'));
      });
      return;
    }
    if (!sims) {
      press();
      setNote(t('Speed dial works with Erevos unlocked.'));
      return;
    }
    const kept = sims.speed(key);
    if (kept) {
      void call(kept.number);
      return;
    }
    press();
    setSpeedKey(key);
  }

  // The voicemail, held 1 on an empty keypad: on the SIM chosen above Call, else the default one.
  async function callTheVoicemail() {
    press();
    setNote('');
    const account = accounts.some((a) => a.id === chosen) ? chosen : '';
    if (!voicemailReady()) {
      setNote(t('This build of Erevos cannot do this yet.'));
      return;
    }
    if (hasVoicemail(account) === false) {
      setNote(t('This SIM has no voicemail number. Your phone company gives it; under Phone → Settings, Call settings sets it.'));
      return;
    }
    try {
      if (!phoneStatus()?.isDefault) {
        const answer = await PermissionsAndroid.request('android.permission.CALL_PHONE');
        if (answer !== PermissionsAndroid.RESULTS.GRANTED) throw new Error(t('Erevos may not make calls. Make it the phone app under Settings.'));
      }
      locked?.onCalled();
      await callVoicemail(account);
    } catch (error) {
      setNote(t('Not called. {error}', { error: error instanceof Error ? error.message : String(error) }));
    }
  }

  // The SIMs show once Erevos may read the phone's state; the phone app may, else it asks.
  async function askSims() {
    const answer = await PermissionsAndroid.request('android.permission.READ_PHONE_STATE').catch(() => null);
    if (answer !== PermissionsAndroid.RESULTS.GRANTED) {
      setNote(t("Without that, calls go on the phone's default SIM."));
      return;
    }
    setAccounts(await phoneAccounts().catch(() => []));
  }

  async function allowContacts() {
    const answer = await PermissionsAndroid.request('android.permission.READ_CONTACTS').catch(() => null);
    if (answer === PermissionsAndroid.RESULTS.GRANTED) readDialable();
    else setSearchNote(t('Android did not allow it. Under Settings, Allow calls and contacts says how to.'));
  }

  // On a small screen, or with large text, the keys shrink to fit the room left under the top
  // (down to 70%); below that the keys scroll under the number, kept at their end so Call shows,
  // and never run over the card and tabs.
  const simRow = accounts.length >= 2 || (status?.slots ?? 0) >= 2;
  // Where the keys at their full size leave room over the number for a row or more, the contacts
  // found are listed there, all of them; else the line over the keys shows the first, and the others
  // open from it. Worked out from the room alone, so the choice does not move the keys and change.
  const listHits = keypadSizes(room, simRow ? simHeight || CHIP_HEIGHT : 0, note ? noteHeight || NOTE_LINE : 0, 0).spare >= HIT_LINE + space.sm;
  const sized = keypadSizes(room, simRow ? simHeight || CHIP_HEIGHT : 0, note ? noteHeight || NOTE_LINE : 0, listHits ? 0 : HIT_LINE);
  const lang = useLang();
  // Heights as laid out, without the fractions of a pixel that rounding to the screen's pixels
  // moves back and forth: those would size the keys again, and lay them out again, for ever.
  const measured = (set: (change: (old: number) => number) => void) => (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    set((old) => (Math.abs(old - height) < 1 ? old : height));
  };
  const keepEnd = () => {
    if (keysContent.current > keysFrame.current + 1) keypad.current?.scrollToEnd({ animated: false });
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + space.md }]}>
      <View style={styles.top}>
        <Row style={styles.titleRow}>
          <Text variant="title" style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            {t('Phone')}
          </Text>
          {locked ? (
            <Button title={t('Open Erevos')} kind="secondary" compact onPress={locked.onOpen} />
          ) : (
            <>
              <Button title={t('Contacts')} kind="secondary" compact onPress={() => router.push('/contacts')} />
              <Button title={t('Settings')} kind="secondary" compact onPress={() => router.push('/phone-settings')} />
            </>
          )}
        </Row>
        <View style={styles.search}>
          <SearchIcon color={colors.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('Search contacts')}
            placeholderTextColor={colors.textFaint}
            style={[styles.searchInput, fontStyle('400')]}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel={t('Clear the search')} hitSlop={10}>
              <Text tone="muted">✕</Text>
            </Pressable>
          ) : null}
        </View>
        {status && status.calls > 0 ? <Button title={t('Back to the call')} onPress={showCall} /> : null}
        {status && !status.isDefault ? (
          brief && locked ? (
            <Card>
              <Text variant="bodyStrong">{t('Erevos is not the phone app')}</Text>
            </Card>
          ) : brief ? (
            <Pressable
              onPress={() => router.push('/phone-settings')}
              accessibilityRole="button"
              accessibilityHint={t("Calls made here show on Android's own call screen until you make Erevos the phone app, under Settings.")}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Card>
                <Row>
                  <Text variant="bodyStrong" style={styles.cardTitle}>
                    {t('Erevos is not the phone app')}
                  </Text>
                  <Text variant="heading" tone="muted">
                    ›
                  </Text>
                </Row>
              </Card>
            </Pressable>
          ) : (
            <Card>
              <Text variant="bodyStrong">{t('Erevos is not the phone app')}</Text>
              <Text tone="muted">{t("Calls made here show on Android's own call screen until you make Erevos the phone app, under Settings.")}</Text>
            </Card>
          )
        ) : null}
        {locked ? null : <GroupBlocks />}
        {searching ? null : (
          <Row style={narrow ? styles.tabsNarrow : styles.tabs}>
            {tabs.map((each) => (
              <Chip key={each.tab} label={t(each.label)} selected={tab === each.tab} onPress={() => setTab(each.tab)} fit={narrow} />
            ))}
          </Row>
        )}
        {note && (searching || tab !== 'keypad') ? <Text tone="muted">{note}</Text> : null}
      </View>

      {searching ? (
        // A number found is called at a tap; held down, it goes on the keypad.
        <FlatList
          data={hits}
          keyExtractor={(row) => row.key}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            mayRead ? undefined : (
              <Card>
                <Text tone="muted">{t("Android does not let Erevos read the phone's contacts yet.")}</Text>
                <Button title={t('Allow the contacts')} onPress={() => void allowContacts()} />
                {searchNote ? <Text tone="muted">{searchNote}</Text> : null}
              </Card>
            )
          }
          ListEmptyComponent={
            dialable === null ? undefined : (
              <Text tone="muted" style={styles.empty}>
                {t('No contact with a number matches.')}
              </Text>
            )
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setQuery('');
                void call(item.number);
              }}
              onLongPress={() => {
                setQuery('');
                setNumber(dialNumber(item.number));
                setTab('keypad');
              }}
              accessibilityRole="button"
              accessibilityLabel={t('Call {name}', { name: `${item.name}, ${item.kind}, ${item.number}` })}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Face name={item.name} photo="" size={44} />
              <View style={styles.rowBody}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {`${item.kind} · ${item.number}`}
                </Text>
              </View>
              <Text variant="heading" color={colors.success}>
                ☏
              </Text>
            </Pressable>
          )}
        />
      ) : (
        // A swipe to the side goes to the tab beside, as its chip does.
        <SwipeTabs tabs={tabOrder} current={tab} onChange={setTab}>
          {tab === 'voicemail' && hasVoicemails ? (
            <Voicemails
              accounts={accounts}
              onCall={(to) => void call(to)}
              onCallVoicemail={() => void callTheVoicemail()}
              onNone={() => {
                setHasVoicemails(false);
                setTab('recents');
              }}
            />
          ) : tab === 'recents' || tab === 'voicemail' ? (
            <Recents
              accounts={accounts}
              locked={!!locked}
              onCall={(to, account) => void call(to, account)}
              onEdit={(to) => {
                setNumber(dialNumber(to));
                setTab('keypad');
              }}
            />
          ) : tab === 'favourites' ? (
            <Favourites locked={!!locked} onCall={(to) => void call(to)} />
          ) : (
            <View style={styles.keypad} onLayout={measured(setRoom)}>
              {listHits ? (
                <ScrollView style={styles.hitList} contentContainerStyle={styles.hitListContent} keyboardShouldPersistTaps="handled">
                  {keyHits.map((row) => (
                    <HitRow key={row.key} row={row} onCall={(to) => void call(to)} onKeypad={(to) => setNumber(dialNumber(to))} />
                  ))}
                </ScrollView>
              ) : null}
              <View style={styles.numberLine}>
                {number && (CAN_COPY || (!locked && textable(number)) || videoCalling()) ? (
                  <Pressable
                    onPress={() => {
                      tap();
                      setMore(true);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={t('More for this number')}
                    hitSlop={10}
                    style={({ pressed }) => [styles.erase, { opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Text variant="heading" tone="muted">
                      ⋯
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.erase} />
                )}
                <TextInput
                  value={number}
                  onChangeText={(text) => setNumber(dialNumber(text))}
                  // The keys below type; held down, the field still pastes a number.
                  showSoftInputOnFocus={false}
                  style={[styles.number, sized.number, { color: colors.text }, fontStyle('400')]}
                  placeholder={t('Number')}
                  placeholderTextColor={colors.textFaint}
                  textAlign="center"
                />
                <Pressable
                  onPress={() => {
                    tap();
                    setNumber((n) => n.slice(0, -1));
                  }}
                  onLongPress={() => {
                    press();
                    setNumber('');
                  }}
                  disabled={!number}
                  accessibilityRole="button"
                  accessibilityLabel={t('Delete')}
                  hitSlop={10}
                  style={({ pressed }) => [styles.erase, { opacity: !number ? 0.3 : pressed ? 0.6 : 1 }]}
                >
                  <Text variant="heading" tone="muted">
                    ⌫
                  </Text>
                </Pressable>
              </View>
              {/* Where there is no room for the list over the number: always this high, so the keys do
                  not move as a contact is found or no longer. */}
              {listHits ? null : (
                <View style={styles.hitLine}>
                  {keyHits[0] ? (
                    <HitRow
                      row={keyHits[0]}
                      onCall={(to) => void call(to)}
                      onKeypad={(to) => setNumber(dialNumber(to))}
                      more={keyHits.length - 1}
                      onMore={() => setAllHits(true)}
                    />
                  ) : null}
                </View>
              )}
              <ScrollView
                ref={keypad}
                style={styles.keysScroll}
                contentContainerStyle={styles.keysColumn}
                // Taller than its room even at the smallest keys: Call, and what it said, stay in sight,
                // under the number.
                onLayout={(event) => {
                  keysFrame.current = event.nativeEvent.layout.height;
                  keepEnd();
                }}
                onContentSizeChange={(_, height) => {
                  keysContent.current = height;
                  keepEnd();
                }}
                keyboardShouldPersistTaps="handled"
              >
                {KEYS.map((keys) => (
                  <View key={keys.join('')} style={styles.keys}>
                    {keys.map((key) => (
                      <Pressable
                        key={key}
                        onPress={() => {
                          tap();
                          setNumber((n) => typeKey(n, key));
                        }}
                        onLongPress={
                          key === '0'
                            ? () => {
                                press();
                                setNumber((n) => typeKey(n, '+'));
                              }
                            : key === '1' && !number
                              ? () => void callTheVoicemail()
                              : !number && key >= '2' && key <= '9'
                                ? () => speedDial(key)
                                : undefined
                        }
                        accessibilityRole="button"
                        accessibilityLabel={key}
                        style={({ pressed }) => [styles.key, sized.key, pressed && styles.keyPressed]}
                      >
                        <Text style={sized.keyText}>{key}</Text>
                        {keyLetters(key, lang) ? (
                          <Text variant="caption" tone="faint" style={sized.letters} numberOfLines={1}>
                            {keyLetters(key, lang)}
                          </Text>
                        ) : null}
                        {key === '0' ? (
                          <Text variant="caption" tone="faint" style={[styles.keyPlus, sized.plus]}>
                            +
                          </Text>
                        ) : null}
                        {key === '1' ? (
                          <Text variant="caption" tone="faint" style={sized.letters} numberOfLines={1} accessibilityLabel={t('Hold for the voicemail')}>
                            oo
                          </Text>
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                ))}
                {accounts.length >= 2 ? (
                  <View onLayout={measured(setSimHeight)}>
                    <Row wrap style={styles.sims}>
                      {accounts.map((a) => (
                        <Chip key={a.id} label={accountLabel(a)} selected={chosen === a.id} onPress={() => setChosen(a.id)} />
                      ))}
                    </Row>
                  </View>
                ) : (status?.slots ?? 0) >= 2 ? (
                  <View onLayout={measured(setSimHeight)}>
                    <Row wrap style={styles.sims}>
                      <Chip label={t('Choose the SIM')} onPress={() => void askSims()} />
                    </Row>
                  </View>
                ) : null}
                <View style={styles.keys}>
                  <Pressable
                    onPress={() => void call(number, accounts.some((a) => a.id === chosen) ? chosen : undefined)}
                    accessibilityRole="button"
                    accessibilityLabel={t('Call')}
                    style={({ pressed }) => [styles.callButton, sized.callButton, { opacity: pressed ? 0.75 : 1 }]}
                  >
                    <Text variant="label" color="#FFFFFF" style={styles.callText} numberOfLines={1} adjustsFontSizeToFit>
                      {t('Call')}
                    </Text>
                  </Pressable>
                </View>
                {note ? (
                  <Text tone="muted" style={styles.note} onLayout={measured(setNoteHeight)}>
                    {note}
                  </Text>
                ) : null}
              </ScrollView>
            </View>
          )}
        </SwipeTabs>
      )}

      <Sheet visible={choosing !== null} onClose={() => setChoosing(null)} title={t('Call on')}>
        {accounts.map((a) => (
          <Button
            key={a.id}
            title={accountLabel(a)}
            kind="secondary"
            onPress={() => {
              const to = choosing;
              setChoosing(null);
              if (to) void call(to, a.id);
            }}
          />
        ))}
        {locked ? null : (
          <Text variant="caption" tone="faint">
            {t('Erevos keeps this SIM for the number, sealed in this space, and calls it on the same SIM next time.')}
          </Text>
        )}
      </Sheet>

      <SpeedDialPick
        slot={speedKey}
        onClose={() => setSpeedKey(null)}
        onPick={(to, name) => {
          const key = speedKey;
          setSpeedKey(null);
          if (!key || !sims || !to) return;
          sims.setSpeed(key, to, name).then(
            () => setNote(t('{name} is on speed dial {key}. Hold {key} to call.', { name: name || to, key })),
            (error) => setNote(errorText(error)),
          );
        }}
      />

      <Sheet visible={allHits && keyHits.length > 0} onClose={() => setAllHits(false)} title={number}>
        {keyHits.map((row) => (
          <HitRow
            key={row.key}
            row={row}
            onCall={(to) => {
              setAllHits(false);
              void call(to);
            }}
            onKeypad={(to) => {
              setAllHits(false);
              setNumber(dialNumber(to));
            }}
          />
        ))}
      </Sheet>
      <Sheet visible={more} onClose={() => setMore(false)} title={number}>
        {more && videoCalling() ? (
          <Button
            title={t('Video call')}
            onPress={() => {
              setMore(false);
              void videoCall(number);
            }}
          />
        ) : null}
        {locked || !textable(number) ? null : (
          <>
            <Button
              title={t('Add to contacts')}
              kind="secondary"
              onPress={() => {
                setMore(false);
                router.push(newContactHref(number));
              }}
            />
            <Button
              title={t('Add to an existing contact')}
              kind="secondary"
              onPress={() => {
                setMore(false);
                router.push(addToContactHref(number));
              }}
            />
            <Button
              title={t('Send an SMS')}
              kind="secondary"
              onPress={() => {
                setMore(false);
                router.push(`/sms?to=${encodeURIComponent(number)}`);
              }}
            />
          </>
        )}
        {CAN_COPY ? (
          <Button
            title={t('Copy the number')}
            kind="secondary"
            onPress={() => {
              setMore(false);
              void copyNumber(number);
            }}
          />
        ) : null}
      </Sheet>

      <UndoBar bottom={insets.bottom + space.md} />
    </View>
  );
}

// A reminder while a contact group's calls are blocked (under Settings, lib/phone-rules.ts), each
// with Lift; read again whenever the screen shows, and each minute, so a block that is over goes.
function GroupBlocks() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [rules, setRules] = useState<PhoneRules>(() => rulesFrom(blockingRules()));
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [now, setNow] = useState(Date.now());
  const live = liveGroups(rules, now);

  useFocusEffect(
    useCallback(() => {
      const look = () => {
        setRules(rulesFrom(blockingRules()));
        setNow(Date.now());
      };
      look();
      phoneGroups().then(
        (found) => setGroups(found.groups),
        () => setGroups([]),
      );
      const minute = setInterval(() => setNow(Date.now()), 60_000);
      const app = AppState.addEventListener('change', (state) => state === 'active' && look());
      return () => {
        clearInterval(minute);
        app.remove();
      };
    }, []),
  );

  function lift(id: string) {
    const at = Date.now();
    // As the settings keep them: without the blocks that are over.
    const lifted = liftGroup(rulesFrom(blockingRules()), id);
    const kept = { ...lifted, groups: liveGroups(lifted, at) };
    setBlockingRules(rulesJson(kept, at));
    setRules(kept);
    setNow(at);
  }

  if (live.length === 0) return null;
  return (
    <Card>
      {live.map((block) => {
        const title = groups.find((g) => g.id === block.id)?.title;
        return (
          <Row key={block.id} style={styles.groupBlock}>
            <View style={styles.rowBody}>
              <Text variant="bodyStrong">
                {title ? t('Calls from the group {group} are blocked', { group: title }) : t('Calls from a contact group are blocked')}
              </Text>
              <Text variant="caption" color={colors.danger}>
                {blockedUntil(block.until, now)}
              </Text>
            </View>
            <Button title={t('Lift')} kind="secondary" compact onPress={() => lift(block.id)} />
          </Row>
        );
      })}
    </Card>
  );
}

// Android's call history, read again whenever it changes, with filters; a row opens its calls,
// which can be deleted from there, with Undo for a few seconds, and its number added to the
// contacts when it is none. With Erevos locked, calls are only looked at and made.
function Recents({ accounts, locked, onCall, onEdit }: {
  accounts: PhoneAccount[];
  locked: boolean;
  onCall: (number: string, account?: string) => void;
  onEdit: (number: string) => void;
}) {
  const styles = useStyles(makeStyles);
  // The calls last read show at once, while they are read again.
  const [history, setHistory] = useState<CallHistory | null>(() => keptHistory(spaceKey()));
  const [filter, setFilter] = useState<CallFilter>('all');
  const [account, setAccount] = useState('');
  // The ids of the calls of the row that is open.
  const [open, setOpen] = useState<number[] | null>(null);
  const [note, setNote] = useState('');
  const [hidden, setHidden] = useState<ReadonlySet<number>>(() => new Set(hiding));
  // Android's list of blocked numbers, the SMS screens' too; null while Erevos may not read it.
  const [blocked, setBlocked] = useState<string[] | null>(null);

  useEffect(() => {
    const load = () => readHistory().then(setHistory);
    const lookBlocked = () => void canBlockNumbers().then((can) => (can ? blockedNumbers().then(setBlocked) : setBlocked(null)));
    load();
    lookBlocked();
    // Seen here, the missed calls leave Android's notice.
    seenMissedCalls();
    const changed = onPhoneEvent('onHistory', () => void load());
    const app = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void load();
      lookBlocked();
      seenMissedCalls();
    });
    const hide = () => setHidden(new Set(hiding));
    hidingChanged.add(hide);
    // A number blocked or unblocked here, in the phone settings or under SMS.
    const stopBlocked = onSmsOrderChanged(lookBlocked);
    return () => {
      changed?.remove();
      app.remove();
      hidingChanged.delete(hide);
      stopBlocked();
    };
  }, []);

  const calls = useMemo(() => withoutCalls(history?.calls ?? [], hidden), [history, hidden]);
  const items = useMemo(() => withDays(groupCalls(filterCalls(calls, filter, account)), Date.now()), [calls, filter, account]);
  const twoSims = accounts.length >= 2;
  // The open row as it is now: without the calls deleted since, gone once they all are.
  const row = useMemo<CallRow | null>(() => {
    const shown = open ? calls.filter((c) => open.includes(c.id)) : [];
    return shown.length ? { key: String(shown[0].id), kind: callKind(shown[0].type), calls: shown } : null;
  }, [open, calls]);
  const first = row?.calls[0] ?? null;
  const ofNumber = first ? callsWith(calls, first) : [];
  // Whether the open row's number is one of the contacts; one that is not can be added.
  const [known, setKnown] = useState<boolean | null>(null);
  const openNumber = !locked && first && !hiddenNumber(first) && !first.name ? first.number : '';
  useEffect(() => {
    setKnown(null);
    if (!openNumber) return;
    let active = true;
    void isContactNumber(openNumber).then((found) => active && setKnown(found));
    return () => {
      active = false;
    };
  }, [openNumber]);

  // Opens the contact that has this number, as the contacts show it.
  async function openContact(number: string) {
    setNote('');
    const cards = await dialCards(true).catch((): ContactCard[] => []);
    const found = cards.find((card) => card.phones.some((entry) => sameNumber(entry.value, number)));
    if (found) router.push(cardHref(found));
    else setNote(t('No contact has this number.'));
  }

  async function copyNumber(number: string) {
    setNote((await copyText(number)) ? t('Copied.') : t('Not copied.'));
  }

  async function allow() {
    const answer = await PermissionsAndroid.request('android.permission.READ_CALL_LOG').catch(() => null);
    if (answer === PermissionsAndroid.RESULTS.GRANTED) setHistory(await readHistory());
    else setNote(t('Android did not allow it. Under Settings, Allow calls and contacts says how to.'));
  }

  // The phone app may change the call history; otherwise Android asks first.
  async function mayChange(): Promise<boolean> {
    const permission = 'android.permission.WRITE_CALL_LOG';
    if (await PermissionsAndroid.check(permission).catch(() => false)) return true;
    const answer = await PermissionsAndroid.request(permission).catch(() => null);
    if (answer === PermissionsAndroid.RESULTS.GRANTED) return true;
    setNote(t('Android did not allow it. Under Settings, Allow calls and contacts says how to.'));
    return false;
  }

  // Deletes calls from the history after the seconds Undo shows; until then they only hide. With a
  // `number`, every call with it goes, the older ones the list does not show too.
  async function remove(ids: number[], number = '', who = '') {
    if (ids.length === 0 || !(await mayChange())) return;
    setNote('');
    const id = `calls:${ids[0]}:${Date.now()}`;
    ids.forEach((c) => hiding.add(c));
    tellHiding();
    deleting.hold({ id, calls: ids, number, before: Date.now() }, UNDO_SHOWS * 1000, deleteNow);
    offerUndo({
      text: number ? t('The calls with {who} were deleted.', { who }) : plural(ids.length, 'Call deleted.', '{n} calls deleted.'),
      undo: () => {
        if (!deleting.take(id)) return;
        ids.forEach((c) => hiding.delete(c));
        tellHiding();
      },
    });
  }

  // Puts the number in Android's list of blocked numbers, or takes it out as it was written there,
  // with Undo.
  async function setNumberBlocked(number: string, block: boolean, who: string, undoable = true) {
    setNote('');
    try {
      if (block) await blockNumber(number);
      else await unblockNumber(blocked?.find((b) => sameNumber(b, number)) ?? number);
      smsOrderChanged();
      if (undoable) {
        offerUndo({
          text: block ? t('Blocked {who}.', { who }) : t('Unblocked {who}.', { who }),
          undo: () => setNumberBlocked(number, !block, who, false),
        });
      }
    } catch (error) {
      setNote(errorText(error));
    }
  }

  if (history && !history.allowed) {
    return (
      <View style={styles.tabBody}>
        <Card>
          <Text tone="muted">{t('Android does not let Erevos read the call history yet.')}</Text>
          <Button title={t('Allow the call history')} onPress={() => void allow()} />
          {note ? <Text tone="muted">{note}</Text> : null}
        </Card>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={items}
        // Android's clipping of rows off the screen closed Erevos on Fabric (a row added twice).
        removeClippedSubviews={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {CALL_FILTERS.filter((f) => f.filter !== 'blocked' || calls.some((c) => callKind(c.type) === 'blocked')).map((f) => (
                <Chip key={f.filter} label={t(f.label)} selected={filter === f.filter} onPress={() => setFilter(f.filter)} />
              ))}
              {twoSims
                ? accounts.map((a) => <Chip key={a.id} label={a.name} selected={account === a.id} onPress={() => setAccount(account === a.id ? '' : a.id)} />)
                : null}
            </ScrollView>
            {note ? <Text tone="muted">{note}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          history ? (
            <Text tone="muted" style={styles.empty}>
              {calls.length ? t('No calls of this kind.') : t('No calls yet.')}
            </Text>
          ) : undefined
        }
        renderItem={({ item }) =>
          item.kind === 'day' ? (
            <Text variant="caption" tone="faint" style={styles.day}>
              {item.label}
            </Text>
          ) : (
            <CallLine
              row={item.row}
              accounts={twoSims ? accounts : []}
              onOpen={() => setOpen(item.row.calls.map((c) => c.id))}
              onCall={() => onCall(item.row.calls[0].number)}
            />
          )
        }
      />

      <Sheet visible={row !== null} onClose={() => setOpen(null)} title={first ? callWho(first) : ''}>
        {row ? (
          <CallDetails
            row={row}
            accounts={twoSims ? accounts : []}
            // One of several; the sheet closes so that Undo shows.
            onDelete={
              !locked && row.calls.length > 1
                ? (call) => {
                    setOpen(null);
                    void remove([call.id]);
                  }
                : undefined
            }
          />
        ) : null}
        {row && first && !hiddenNumber(first) ? (
          <>
            {twoSims ? (
              accounts.map((a) => (
                <Button
                  key={a.id}
                  title={t('Call on {sim}', { sim: accountLabel(a) })}
                  onPress={() => {
                    setOpen(null);
                    onCall(first.number, a.id);
                  }}
                />
              ))
            ) : (
              <Button
                title={t('Call')}
                onPress={() => {
                  setOpen(null);
                  onCall(first.number);
                }}
              />
            )}
            {locked ? null : (
              <Button
                title={t('Send an SMS')}
                kind="secondary"
                onPress={() => {
                  setOpen(null);
                  router.push(`/sms?to=${encodeURIComponent(first.number)}`);
                }}
              />
            )}
            {known === false ? (
              <>
                <Button
                  title={t('Add to contacts')}
                  kind="secondary"
                  onPress={() => {
                    setOpen(null);
                    router.push(newContactHref(first.number));
                  }}
                />
                <Button
                  title={t('Add to an existing contact')}
                  kind="secondary"
                  onPress={() => {
                    setOpen(null);
                    router.push(addToContactHref(first.number));
                  }}
                />
              </>
            ) : null}
            {!locked && (known === true || (first.name && known === null)) ? (
              <Button
                title={t('Open the contact')}
                kind="secondary"
                onPress={() => {
                  setOpen(null);
                  void openContact(first.number);
                }}
              />
            ) : null}
            {CAN_COPY ? (
              <Button
                title={t('Copy the number')}
                kind="secondary"
                onPress={() => {
                  setOpen(null);
                  void copyNumber(first.number);
                }}
              />
            ) : null}
            <Button
              title={t('Change the number before calling')}
              kind="secondary"
              onPress={() => {
                setOpen(null);
                onEdit(first.number);
              }}
            />
            {spamReady() && !locked && !first.name ? (
              <Button
                title={reportedSpam(first.number) ? t('Not spam') : t('Report as spam')}
                kind="secondary"
                onPress={() => {
                  const spam = !reportedSpam(first.number);
                  setOpen(null);
                  reportSpam(first.number, spam);
                  setNote(spam ? t('Reported as spam on this phone only. Its calls show a warning.') : t('No longer reported as spam.'));
                }}
              />
            ) : null}
            {blocked && !locked ? (
              <Button
                title={isBlocked(first.number, blocked) ? t('Unblock this number') : t('Block this number')}
                kind="secondary"
                onPress={() => {
                  setOpen(null);
                  void setNumberBlocked(first.number, !isBlocked(first.number, blocked), callWho(first));
                }}
              />
            ) : null}
          </>
        ) : null}
        {row && first && !locked ? (
          <>
            <Button
              title={plural(row.calls.length, 'Delete this call', 'Delete these {n} calls')}
              kind="danger"
              onPress={() => {
                setOpen(null);
                void remove(row.calls.map((c) => c.id));
              }}
            />
            {ofNumber.length > row.calls.length ? (
              <Button
                title={t('Delete every call with this number')}
                kind="danger"
                onPress={() => {
                  setOpen(null);
                  void remove(
                    ofNumber.map((c) => c.id),
                    first.number,
                    callWho(first),
                  );
                }}
              />
            ) : null}
          </>
        ) : null}
      </Sheet>
    </>
  );
}

// What a call was, on which SIM, and how: Wi-Fi calling, HD voice.
function callDetail(call: LoggedCall, accounts: PhoneAccount[]): string {
  const marks = callMarks(call.features);
  const sim = accounts.find((a) => a.id === call.account);
  return [t(KIND_LABELS[callKind(call.type)]), sim ? sim.name : '', marks.wifi ? t('Wi-Fi calling') : '', marks.hd ? t('HD voice') : '']
    .filter(Boolean)
    .join(' · ');
}

function CallLine({ row, accounts, onOpen, onCall }: { row: CallRow; accounts: PhoneAccount[]; onOpen: () => void; onCall: () => void }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const first = row.calls[0];
  const who = callWho(first);
  const detail = callDetail(first, accounts);
  const missed = row.kind === 'missed';
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${who}, ${detail}, ${callClock(first.at)}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Face name={first.name} photo={first.photo} size={44} />
      <View style={styles.rowBody}>
        <Text variant={first.isNew ? 'bodyStrong' : 'body'} numberOfLines={1} color={missed ? colors.danger : undefined}>
          {row.calls.length > 1 ? `${who} (${row.calls.length})` : who}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <Text variant="caption" tone="faint">
        {callClock(first.at)}
      </Text>
      {hiddenNumber(first) ? null : (
        <Pressable
          onPress={onCall}
          accessibilityRole="button"
          accessibilityLabel={t('Call {name}', { name: who })}
          hitSlop={6}
          style={({ pressed }) => [styles.callBack, pressed && styles.pressed]}
        >
          <Text variant="heading" color={colors.success}>
            ☏
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

// The calls of a row, one line each, under the number and the day; with `onDelete`, each can be
// deleted on its own.
function CallDetails({ row, accounts, onDelete }: { row: CallRow; accounts: PhoneAccount[]; onDelete?: (call: LoggedCall) => void }) {
  const first = row.calls[0];
  return (
    <View style={{ gap: space.xs }}>
      <Text tone="muted">{[first.name ? first.shown || first.number : '', dayLabel(first.at, Date.now())].filter(Boolean).join(' · ')}</Text>
      {row.calls.map((call) => (
        <Row key={call.id} style={{ gap: space.sm }}>
          <Text variant="caption" tone="muted" style={{ flex: 1 }}>
            {[callClock(call.at), callDetail(call, accounts), call.duration > 0 ? callLength(call.duration) : ''].filter(Boolean).join(' · ')}
          </Text>
          {onDelete ? <TextButton title={t('Delete')} onPress={() => onDelete(call)} /> : null}
        </Row>
      ))}
    </View>
  );
}

// The voicemails Android keeps, where the phone company sends them as recordings (visual voicemail):
// each plays at a tap of ▶, straight from Android's store; a tap on the row offers Call back, Send an
// SMS and Delete. Never shown with Erevos locked. `onNone` once none is left.
function Voicemails({ accounts, onCall, onCallVoicemail, onNone }: {
  accounts: PhoneAccount[];
  onCall: (number: string) => void;
  onCallVoicemail: () => void;
  onNone: () => void;
}) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [found, setFound] = useState<Voicemail[] | null>(null);
  const [playing, setPlaying] = useState(-1);
  const [open, setOpen] = useState<Voicemail | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    voicemails().then(
      (read) => {
        setFound(read.voicemails);
        if (read.voicemails.length === 0) onNone();
      },
      () => setFound([]),
    );
  }, [onNone]);

  useEffect(() => {
    load();
    const changed = onPhoneEvent('onVoicemail', (event) => {
      setPlaying((now) => (event.playing ? event.id : now === event.id ? -1 : now));
      if (!event.playing) load();
    });
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active') load();
      else stopVoicemail();
    });
    return () => {
      changed?.remove();
      app.remove();
      stopVoicemail();
    };
  }, []);

  async function play(item: Voicemail) {
    tap();
    setNote('');
    if (playing === item.id) {
      stopVoicemail();
      return;
    }
    try {
      await playVoicemail(item.id);
    } catch (error) {
      setNote(t('The voicemail did not play. {error}', { error: errorText(error) }));
    }
  }

  function remove(item: Voicemail) {
    setOpen(null);
    ask(t('Delete this voicemail?'), t('It goes from the phone, and from your phone company too where its app keeps it.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: () =>
          void deleteVoicemail(item.id).then((done) => {
            if (!done) setNote(t('The voicemail was not deleted.'));
            load();
          }),
      },
    ]);
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.filters}>
          <Button title={t('Call the voicemail')} kind="secondary" onPress={onCallVoicemail} />
        </View>
        {note ? <Text tone="muted">{note}</Text> : null}
        {(found ?? []).map((item) => {
          const who = item.name || item.shown || item.number || t('Unknown number');
          const sim = accounts.length >= 2 ? accounts.find((a) => a.id === item.account) : undefined;
          const detail = [dayLabel(item.at, Date.now()), callClock(item.at), item.duration > 0 ? callLength(item.duration) : '', sim ? sim.name : '']
            .filter(Boolean)
            .join(' · ');
          return (
            <View key={item.id}>
              <Pressable
                onPress={() => setOpen(item)}
                accessibilityRole="button"
                accessibilityLabel={`${who}, ${detail}`}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={[styles.newDot, { backgroundColor: item.isNew ? colors.primary : 'transparent' }]} />
                <Face name={item.name} photo="" size={40} />
                <View style={styles.rowBody}>
                  <Text variant={item.isNew ? 'bodyStrong' : 'body'} numberOfLines={1}>
                    {who}
                  </Text>
                  <Text variant="caption" tone="muted" numberOfLines={1}>
                    {detail}
                  </Text>
                  {item.transcript ? (
                    <Text variant="caption" tone="muted" numberOfLines={3}>
                      {`«${item.transcript}»`}
                    </Text>
                  ) : null}
                </View>
                {item.playable ? (
                  <Pressable
                    onPress={() => void play(item)}
                    accessibilityRole="button"
                    accessibilityLabel={playing === item.id ? t('Stop') : t('Play')}
                    hitSlop={6}
                    style={({ pressed }) => [styles.playButton, { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text variant="bodyStrong" color={colors.onPrimary}>
                      {playing === item.id ? '■' : '▶'}
                    </Text>
                  </Pressable>
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <Sheet visible={open !== null} onClose={() => setOpen(null)} title={open ? open.name || open.shown || open.number || t('Unknown number') : undefined}>
        {open?.number ? (
          <>
            <Button
              title={t('Call back')}
              onPress={() => {
                const to = open.number;
                setOpen(null);
                onCall(to);
              }}
            />
            <Button
              title={t('Send an SMS')}
              kind="secondary"
              onPress={() => {
                const to = open.number;
                setOpen(null);
                router.push(`/sms?to=${encodeURIComponent(to)}`);
              }}
            />
          </>
        ) : null}
        {open ? <Button title={t('Delete this voicemail')} kind="secondary" onPress={() => remove(open)} /> : null}
      </Sheet>
    </>
  );
}

// The phone's starred contacts, to call at a tap; one with several numbers and no default asks which.
function Favourites({ locked, onCall }: { locked: boolean; onCall: (number: string) => void }) {
  const styles = useStyles(makeStyles);
  const [found, setFound] = useState<{ allowed: boolean; favourites: Favourite[] } | null>(null);
  const [open, setOpen] = useState<Favourite | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const load = () => phoneFavourites().then(setFound, () => setFound({ allowed: false, favourites: [] }));
    load();
    const changed = onPhoneEvent('onHistory', () => void load());
    const app = AppState.addEventListener('change', (state) => state === 'active' && void load());
    return () => {
      changed?.remove();
      app.remove();
    };
  }, []);

  async function allow() {
    const answer = await PermissionsAndroid.request('android.permission.READ_CONTACTS').catch(() => null);
    if (answer === PermissionsAndroid.RESULTS.GRANTED) setFound(await phoneFavourites().catch(() => ({ allowed: false, favourites: [] })));
    else setNote(t('Android did not allow it. Under Settings, Allow calls and contacts says how to.'));
  }

  function tap(favourite: Favourite) {
    const only = favourite.primary || (favourite.numbers.length === 1 ? favourite.numbers[0].number : '');
    if (only) onCall(only);
    else setOpen(favourite);
  }

  if (found && !found.allowed) {
    return (
      <View style={styles.tabBody}>
        <Card>
          <Text tone="muted">{t("Android does not let Erevos read the phone's contacts yet.")}</Text>
          <Button title={t('Allow the contacts')} onPress={() => void allow()} />
          {note ? <Text tone="muted">{note}</Text> : null}
        </Card>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.list}>
        {note ? <Text tone="muted">{note}</Text> : null}
        {found && found.favourites.length === 0 ? (
          <Text tone="muted" style={styles.empty}>
            {t('No favourites yet. The contacts you star show here, to call at a tap.')}
          </Text>
        ) : null}
        <View style={styles.favourites}>
          {(found?.favourites ?? []).map((f) => (
            <Pressable
              key={f.id}
              onPress={() => tap(f)}
              onLongPress={() => {
                press();
                setOpen(f);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('Call {name}', { name: f.name })}
              style={({ pressed }) => [styles.favourite, pressed && styles.pressed]}
            >
              <Face name={f.name} photo={f.photo} size={64} />
              <Text variant="caption" numberOfLines={1} style={styles.favouriteName}>
                {f.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Sheet visible={open !== null} onClose={() => setOpen(null)} title={open?.name}>
        {(open?.numbers ?? []).map((n) => (
          <View key={n.number} style={{ gap: space.xs }}>
            <Button
              title={[n.label, n.shown || n.number].filter(Boolean).join(' · ')}
              kind={n.number === open?.primary ? 'primary' : 'secondary'}
              onPress={() => {
                setOpen(null);
                onCall(n.number);
              }}
            />
            {locked && !CAN_COPY ? null : (
              <Row wrap>
                {locked ? null : (
                  <Button
                    title={t('Send an SMS')}
                    kind="ghost"
                    compact
                    onPress={() => {
                      setOpen(null);
                      router.push(`/sms?to=${encodeURIComponent(n.number)}`);
                    }}
                  />
                )}
                {CAN_COPY ? (
                  <Button
                    title={t('Copy the number')}
                    kind="ghost"
                    compact
                    onPress={() => {
                      setOpen(null);
                      void copyText(n.number).then((done) => setNote(done ? t('Copied.') : t('Not copied.')));
                    }}
                  />
                ) : null}
              </Row>
            )}
          </View>
        ))}
        {open && !locked ? (
          <Button
            title={t('Open the contact')}
            kind="secondary"
            onPress={() => {
              const id = open.id;
              setOpen(null);
              router.push(`/contact-card?id=${encodeURIComponent(id)}`);
            }}
          />
        ) : null}
      </Sheet>
    </>
  );
}

// Below this window height (dp) the card above the keypad shows its title alone; below this width,
// the tabs share the row.
const BRIEF_BELOW = 860;
const WIDE = 600;
const NARROW_BELOW = 400;

// The keypad's height (styles.keypad): what shrinks, the number line, four rows of keys and Call;
// what does not, the SIM chips if any (`sims` high), the note under Call (`note` high), the gaps
// and the room above the number.
const NUMBER_LINE = 56;
const KEY_HEIGHT = 64;
const CALL_SIZE = 76;
const CHIP_HEIGHT = 38;
const NOTE_LINE = 20;
// The line over the keys for a contact what is typed finds, and how many it finds at most.
const HIT_LINE = 44;
const KEY_HITS = 20;
// The erase button beside the number is never smaller.
const ERASE = 44;

function keypadSizes(room: number, sims: number, note: number, hits = 0) {
  const parts = 6 + (sims > 0 ? 1 : 0) + (note > 0 ? 1 : 0) + (hits > 0 ? 1 : 0);
  const fixed = space.sm + (parts - 1) * space.sm + space.sm + sims + note + hits;
  const fit = (top: number) => Math.min(1, Math.max(0.7, top));
  let scale = room > 0 ? fit((room - fixed) / (NUMBER_LINE + 4 * KEY_HEIGHT + CALL_SIZE)) : 1;
  // A number line at its least leaves the keys and Call the rest.
  if (NUMBER_LINE * scale < ERASE) scale = fit((room - fixed - ERASE) / (4 * KEY_HEIGHT + CALL_SIZE));
  // Rounded down, so what fits is never a little too high.
  const key = Math.floor(KEY_HEIGHT * scale);
  const call = Math.floor(CALL_SIZE * scale);
  const line = Math.max(ERASE, Math.floor(NUMBER_LINE * scale));
  return {
    // What is left over the number once all is laid out at this size.
    spare: room > 0 ? room - fixed - line - 4 * key - call : 0,
    letters: { fontSize: Math.max(9, Math.round(11 * scale)), lineHeight: Math.max(11, Math.round(13 * scale)), letterSpacing: 1 },
    number: { fontSize: Math.round(32 * scale), height: line },
    key: { height: key, borderRadius: key / 2 },
    keyText: { fontSize: Math.round(28 * scale), lineHeight: Math.round(34 * scale) },
    plus: { fontSize: Math.round(13 * scale), bottom: Math.max(2, Math.round(4 * scale)) },
    callButton: { width: call, height: call, borderRadius: call / 2 },
  };
}

// A contact what is typed on the keypad found: called at a tap, put on the keypad held down; `more`,
// how many others it found, opens them.
function HitRow({ row, onCall, onKeypad, more = 0, onMore }: { row: DialRow; onCall: (to: string) => void; onKeypad: (to: string) => void; more?: number; onMore?: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.hitRow}>
      <Pressable
        onPress={() => {
          tap();
          onCall(row.number);
        }}
        onLongPress={() => {
          press();
          onKeypad(row.number);
        }}
        accessibilityRole="button"
        accessibilityLabel={t('Call {name}', { name: `${row.name}, ${row.kind}, ${row.number}` })}
        style={({ pressed }) => [styles.hitMain, pressed && styles.pressed]}
      >
        <Face name={row.name} photo="" size={32} />
        <View style={styles.rowBody}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {row.name}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {`${row.kind} · ${row.number}`}
          </Text>
        </View>
      </Pressable>
      {more > 0 && onMore ? <TextButton title={plural(more, 'One more', '{n} more')} onPress={onMore} /> : null}
    </View>
  );
}

// A contact's photo, or the first letter of the name, or the phone's sign for a bare number.
function Face({ name, photo, size }: { name: string; photo: string; size: number }) {
  const styles = useStyles(makeStyles);
  const round = { width: size, height: size, borderRadius: size / 2 };
  if (photo) return <Image source={{ uri: photo }} style={round} accessibilityIgnoresInvertColors />;
  const letter = [...name.trim()][0]?.toUpperCase() ?? '';
  return (
    <View style={[styles.face, round]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text variant={letter ? 'bodyStrong' : 'body'} tone="muted" style={{ fontSize: size * 0.4, lineHeight: size * 0.5 }}>
        {letter || '☏'}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      width: '100%',
      maxWidth: 760,
      alignSelf: 'center',
      backgroundColor: colors.ground,
    },
    top: {
      gap: space.md,
      paddingHorizontal: space.xl - 4,
      paddingTop: space.md,
    },
    titleRow: {
      gap: space.sm,
    },
    title: {
      flex: 1,
    },
    cardTitle: {
      flex: 1,
    },
    tabs: {
      gap: space.sm,
    },
    tabsNarrow: {
      gap: 6,
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
    searchInput: {
      flex: 1,
      height: '100%',
      color: colors.text,
      fontSize: 16,
    },
    tabBody: {
      paddingHorizontal: space.xl - 4,
      paddingTop: space.md,
    },
    list: {
      paddingHorizontal: space.lg,
      paddingBottom: space.lg,
    },
    filters: {
      gap: space.sm,
      paddingVertical: space.md,
    },
    empty: {
      paddingVertical: space.lg,
    },
    day: {
      paddingTop: space.md,
      paddingBottom: space.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingVertical: space.sm,
      paddingHorizontal: space.sm,
      marginHorizontal: -space.sm,
      borderRadius: radius.lg,
    },
    pressed: {
      backgroundColor: colors.surfacePressed,
    },
    rowBody: {
      flex: 1,
      gap: 2,
    },
    groupBlock: {
      gap: space.sm,
    },
    newDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    playButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    callBack: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    favourites: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingTop: space.md,
    },
    favourite: {
      width: '33.33%',
      alignItems: 'center',
      gap: space.xs,
      paddingVertical: space.md,
      paddingHorizontal: space.xs,
      borderRadius: radius.lg,
    },
    favouriteName: {
      textAlign: 'center',
    },
    face: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: withAlpha(colors.border, 0.6),
    },
    keypad: {
      flex: 1,
      justifyContent: 'flex-end',
      gap: space.sm,
      paddingTop: space.sm,
      paddingHorizontal: space.xl,
    },
    // As high as the keys, or the room under the number if less.
    keysScroll: {
      flexGrow: 0,
      flexShrink: 1,
    },
    keysColumn: {
      gap: space.sm,
    },
    // Over the number, in the room the keys leave: the contacts found, right over the number.
    hitList: {
      flex: 1,
    },
    hitListContent: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      gap: space.xs,
    },
    hitLine: {
      height: HIT_LINE,
      justifyContent: 'center',
    },
    hitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
    },
    hitMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      borderRadius: radius.md,
      paddingHorizontal: space.xs,
    },
    numberLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
    },
    number: {
      flex: 1,
      // As high as keypadSizes says: Android's own padding would add to it.
      paddingVertical: 0,
    },
    erase: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keys: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
    },
    key: {
      width: 76,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
    },
    keyPressed: {
      backgroundColor: colors.surfacePressed,
    },
    keyPlus: {
      position: 'absolute',
      bottom: 4,
    },
    sims: {
      justifyContent: 'center',
    },
    callButton: {
      marginTop: space.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2E7D32',
    },
    callText: {
      fontSize: 14,
      paddingHorizontal: space.xs,
    },
    note: {
      textAlign: 'center',
    },
  });
