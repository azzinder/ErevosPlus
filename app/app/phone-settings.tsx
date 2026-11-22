// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { startActivityAsync } from 'expo-intent-launcher';
import { useEffect, useState } from 'react';
import { AppState, Linking, PermissionsAndroid, Platform, View } from 'react-native';

import { BlockedNumbers } from '../components/blocked-numbers';
import { SpeedDialPick } from '../components/speed-dial';
import { Button, Card, Input, Page, Row, Sheet, Text } from '../components/ui';
import { askFullScreen, backgroundState } from '../lib/background';
import { mark, plural, t } from '../lib/i18n';
import { cleanReplies, MAX_REPLIES, MAX_REPLY } from '../lib/phone';
import { phoneOpensLocked, setPhoneOpensLocked } from '../lib/phone-open';
import {
  addPrefix,
  BLOCK_FOR,
  blockedUntil,
  blockGroup,
  blockUntil,
  liftGroup,
  liveGroups,
  MAX_OWN,
  ownPrefix,
  removePrefix,
  rulesFrom,
  rulesJson,
  shownPrefix,
  TELEMARKETING,
  type PhoneRules,
} from '../lib/phone-rules';
import {
  blockingRules,
  onPhoneEvent,
  openCallSettings,
  clearSpamList,
  clearSpamReports,
  setSpamSwitches,
  spamReady,
  spamState,
  type SpamState,
  phoneAccounts,
  placeCall,
  type PhoneAccount,
  phoneGroups,
  phoneReady,
  phoneStatus,
  quickReplies,
  requestDefaultPhone,
  requestScreening,
  setBlockingRules,
  setQuickReplies,
  type ContactGroup,
  type PhoneStatus,
} from '../modules/erevos-phone';
import { smsToolsReady } from '../modules/erevos-sms';
import { useLock } from '../lock/context';
import { accountLabel, PhoneSims } from '../lib/phone-sims';
import { currentSpace } from '../lock/keys';
import { SPEED_KEYS } from '../lock/phone-data';
import { confirm } from '../lib/alert';
import { netThroughTor } from '../lib/net-http';
import { downloadSpamList, setSpamWeekly, spamAddress, spamWithoutTor } from '../lib/spam-list';
import { space } from '../theme/colors';
import { useTheme } from '../theme/context';

// Erevos as the phone's phone app (modules/erevos-phone): then a call, made or come, shows on
// Erevos's own call screen, over the lock screen and with Erevos locked, and tel: links and the
// phone's call button open Erevos's keypad. What Android still holds back shows here, each with
// the way to allow it; the quick replies a call can be declined with, and which calls are blocked.

// What the phone app needs from Android. Becoming the phone app gives them, except to an app
// installed from a browser on Android 15 and later, which Android holds back until its owner
// allows "restricted settings" for it.
const PHONE_PERMISSIONS = [
  'android.permission.CALL_PHONE',
  'android.permission.READ_PHONE_STATE',
  'android.permission.READ_CALL_LOG',
  'android.permission.WRITE_CALL_LOG',
  'android.permission.READ_CONTACTS',
] as const;
const NOT_CHOSEN = mark(
  "Choose Erevos in Android's Default apps → Phone app. If Android says it is a restricted setting, open Erevos's App info, tap ⋮ at the top right → Allow restricted settings, and choose Erevos again.",
);
// The codes every GSM network takes for what it keeps of a SIM's calls (3GPP TS 22.030): dialled
// like a number, and the network answers in Android's own message.
const CALL_CODES: { what: string; codes: { label: string; code: string }[] }[] = [
  {
    what: mark('Call forwarding'),
    codes: [
      { label: mark('Check'), code: '*#21#' },
      { label: mark('Turn it all off'), code: '##002#' },
    ],
  },
  {
    what: mark('Call waiting'),
    codes: [
      { label: mark('Check'), code: '*#43#' },
      { label: mark('On'), code: '*43#' },
      { label: mark('Off'), code: '#43#' },
    ],
  },
  { what: mark('Showing your number'), codes: [{ label: mark('Check'), code: '*#31#' }] },
];
const RESTRICTED = mark(
  "Android did not allow it all. In Erevos's App info, under Permissions, call logs may say Restricted setting: then go back, tap ⋮ at the top right → Allow restricted settings, and allow Phone, Call logs and Contacts under Permissions.",
);

export default function PhoneSettings() {
  const [status, setStatus] = useState<PhoneStatus | null>(phoneStatus());
  // Whether Android gave the phone app all it needs; null until known.
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [allowNote, setAllowNote] = useState('');
  // Whether Android lets Erevos show the call notices (Android 13 and later ask); null until known.
  const [canNotify, setCanNotify] = useState<boolean | null>(null);
  const [overLock, setOverLock] = useState(backgroundState()?.fullScreen ?? true);
  // Set once the owner asked Android to make Erevos the phone app, until it is.
  const [asked, setAsked] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const look = () => {
      setStatus(phoneStatus());
      setOverLock(backgroundState()?.fullScreen ?? true);
      if (Platform.OS !== 'android') return;
      void Promise.all(PHONE_PERMISSIONS.map((p) => PermissionsAndroid.check(p))).then(
        (answers) => setAllowed(answers.every(Boolean)),
        () => setAllowed(null),
      );
      if (Number(Platform.Version) >= 33) {
        void PermissionsAndroid.check('android.permission.POST_NOTIFICATIONS').then(setCanNotify, () => setCanNotify(null));
      } else setCanNotify(true);
    };
    look();
    // Android answers in its own screens: look again when the app comes back.
    const subscription = AppState.addEventListener('change', (state) => state === 'active' && look());
    return () => subscription.remove();
  }, []);

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

  async function makeDefault() {
    setNote('');
    setAsked(true);
    try {
      requestDefaultPhone();
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
    if (Number(Platform.Version) >= 33) await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS').catch(() => undefined);
  }

  async function openDefaultApps() {
    await startActivityAsync('android.settings.MANAGE_DEFAULT_APPS_SETTINGS').catch(() => Linking.openSettings());
  }

  async function allow() {
    setAllowNote('');
    const answers = await PermissionsAndroid.requestMultiple([...PHONE_PERMISSIONS]).catch(() => null);
    const all = PHONE_PERMISSIONS.every((p) => answers?.[p] === PermissionsAndroid.RESULTS.GRANTED);
    setAllowed(all);
    if (!all) setAllowNote(t(RESTRICTED));
  }

  // Android asks only until it was refused twice; then only Erevos's App info turns them on.
  async function allowNotices() {
    const answer = await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS').catch(() => null);
    if (answer === PermissionsAndroid.RESULTS.GRANTED) setCanNotify(true);
    else void Linking.openSettings();
  }

  return (
    <Page>
      <Text variant="title">{t('Phone settings')}</Text>
      <Card>
        <Text variant="bodyStrong">{status?.isDefault ? t('Erevos is the phone app') : t('Erevos is not the phone app')}</Text>
        <Text tone="muted">
          {t("As the phone app, Erevos shows every call on its own screen: who calls, with their photo, over the lock screen too, without unlocking Erevos. Its Phone screen, with the keypad, the calls and the favourites, stays behind Erevos's password, unless you let it open without it, below. Phone calls are plain phone calls: the phone company carries them, as it carries every call.")}
        </Text>
        {status?.isDefault ? null : (
          <>
            <Button title={t('Make Erevos the phone app')} onPress={() => void makeDefault()} />
            {asked ? (
              <>
                <Text variant="bodyStrong">{t('Android did not make Erevos the phone app')}</Text>
                <Text tone="muted">{t(NOT_CHOSEN)}</Text>
                <Button title={t('Open Default apps')} kind="secondary" onPress={() => void openDefaultApps()} />
                <Button title={t("Open Erevos's App info")} kind="secondary" onPress={() => void Linking.openSettings()} />
              </>
            ) : null}
          </>
        )}
        {status?.isDefault && allowed === false ? (
          <>
            <Text variant="bodyStrong">{t('Android holds back part of what the phone app needs')}</Text>
            <Text tone="muted">{t('Calls, the SIMs, the call history or the names of your contacts may not show. Android holds this back from an app installed from a browser, until you allow it.')}</Text>
            <Button title={t('Allow calls and contacts')} onPress={() => void allow()} />
            <Button title={t("Open Erevos's App info")} kind="secondary" onPress={() => void Linking.openSettings()} />
            {allowNote ? <Text tone="muted">{allowNote}</Text> : null}
          </>
        ) : null}
        {status?.isDefault && canNotify === false ? (
          <>
            <Text variant="bodyStrong">{t('Notifications are off')}</Text>
            <Text tone="muted">{t('So a call that comes shows no Answer and Decline outside the call screen.')}</Text>
            <Button title={t('Allow notifications')} onPress={() => void allowNotices()} />
          </>
        ) : null}
        {status?.isDefault && !overLock ? (
          <>
            <Text tone="muted">{t('Android does not let Erevos show a call that comes over the lock screen: it shows as a notice only.')}</Text>
            <Button title={t('Show calls over the lock screen')} kind="secondary" onPress={askFullScreen} />
          </>
        ) : null}
        {status && !status.phone ? <Text tone="muted">{t('This device has no phone part, so it cannot make calls.')}</Text> : null}
        {note ? <Text tone="muted">{note}</Text> : null}
      </Card>
      {status?.isDefault ? <OpenLocked /> : null}
      {status?.isDefault && status.phone ? <CallSettings /> : null}
      {status?.phone ? <SpeedDials /> : null}
      {status?.isDefault ? <QuickReplies /> : null}
      {status?.isDefault ? <Blocking screens={status.screens} /> : null}
      {status?.isDefault && spamReady() ? <SpamList screens={status.screens} /> : null}
    </Page>
  );
}

// Whether the Phone opens without Erevos's password (lib/phone-open.ts); only with a password to
// open without.
function OpenLocked() {
  const { passwordLock } = useLock();
  const [on, setOn] = useState<boolean | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    void phoneOpensLocked().then(setOn);
  }, []);

  if (!passwordLock || on === null) return null;

  async function change(next: boolean) {
    setNote('');
    try {
      await setPhoneOpensLocked(next);
      setOn(next);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <Card>
      <Text variant="bodyStrong">{t('Open the Phone without the password')}</Text>
      <Text tone="muted">
        {t("With Erevos locked, the Phone's icon, a tel: link and the notice of a missed call then open the keypad, the calls and the favourites, which Android keeps for every phone app. Anyone holding the unlocked phone sees your calls and favourites, with the names of the phone's contacts only, never those kept only in Erevos or in hidden chats. Calls can be made there, nothing changed; everything else stays behind the password.")}
      </Text>
      {on ? <Text variant="bodyStrong">{t('The Phone opens without the password.')}</Text> : null}
      <Button
        title={on ? t('Keep the Phone behind the password') : t('Open the Phone without the password')}
        kind={on ? 'secondary' : 'primary'}
        onPress={() => void change(!on)}
      />
      {note ? <Text tone="muted">{note}</Text> : null}
    </Card>
  );
}

// Which calls are blocked: the telemarketing ranges, the owner's prefixes, and a contact group's
// contacts for a while (lib/phone-rules.ts). The same in every space, so they tell nothing of another.
function Blocking({ screens }: { screens: boolean }) {
  const { colors } = useTheme();
  const [rules, setRules] = useState<PhoneRules>(() => rulesFrom(blockingRules()));
  const [typed, setTyped] = useState('');
  const [note, setNote] = useState('');
  const [groups, setGroups] = useState<{ allowed: boolean; groups: ContactGroup[] } | null>(null);
  // The group whose block's length is being chosen.
  const [choosing, setChoosing] = useState<ContactGroup | null>(null);
  // Read again each minute, so a block that is over shows so.
  const [now, setNow] = useState(Date.now());
  const live = liveGroups(rules, now);
  const blocking = rules.telemarketing || rules.own.length > 0 || live.length > 0;

  useEffect(() => {
    const load = () => phoneGroups().then(setGroups, () => setGroups({ allowed: false, groups: [] }));
    load();
    const changed = onPhoneEvent('onHistory', () => void load());
    const minute = setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      changed?.remove();
      clearInterval(minute);
    };
  }, []);

  function keep(next: PhoneRules) {
    const at = Date.now();
    const kept = { ...next, groups: liveGroups(next, at) };
    setBlockingRules(rulesJson(kept, at));
    setRules(kept);
    setNow(at);
    // Turned away before they ring once Erevos screens calls; Android asks the owner once.
    if (!screens && (kept.telemarketing || kept.own.length > 0 || kept.groups.length > 0)) askScreening();
  }

  function askScreening() {
    try {
      requestScreening();
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  function add() {
    const prefix = ownPrefix(typed);
    if (!prefix) {
      setNote(t('Type the start of the numbers to block, with the country code or as you dial it here: +33 162 or 0162.'));
      return;
    }
    setNote('');
    setTyped('');
    keep(addPrefix(rules, prefix));
  }

  return (
    <>
      <Card>
        <Text variant="bodyStrong">{t('Blocking')}</Text>
        <Text tone="muted">
          {t("A blocked call does not ring and leaves no notice; it shows under Blocked in the calls. The telemarketing ranges and your prefixes never block a number in the phone's contacts. What is blocked is the same in every space, and keeps no names.")}
        </Text>
        <Button
          title={rules.telemarketing ? t('Stop blocking telemarketing') : t('Block telemarketing')}
          kind={rules.telemarketing ? 'secondary' : 'primary'}
          onPress={() => keep({ ...rules, telemarketing: !rules.telemarketing })}
        />
        <Text variant="caption" tone="faint">
          {t('The numbers these countries keep for telemarketing calls:')}
        </Text>
        {TELEMARKETING.map((range) => (
          <Text key={range.code} variant="caption" tone="faint">
            {`${t(range.country)} (+${range.code}): ${range.shown}${range.note ? ` (${t(range.note)})` : ''}`}
          </Text>
        ))}
        <Text variant="bodyStrong">{t('Numbers starting with')}</Text>
        {rules.own.map((prefix) => (
          <Row key={prefix} style={{ gap: space.sm }}>
            <Text style={{ flex: 1 }}>{shownPrefix(prefix)}</Text>
            <Button title={t('Remove')} kind="secondary" compact onPress={() => keep(removePrefix(rules, prefix))} />
          </Row>
        ))}
        {rules.own.length < MAX_OWN ? (
          <Row style={{ gap: space.sm }}>
            <Input value={typed} onChangeText={setTyped} placeholder="+33 162" keyboardType="phone-pad" style={{ flex: 1 }} onSubmitEditing={add} />
            <Button title={t('Block')} compact onPress={add} />
          </Row>
        ) : null}
        {blocking && !screens ? (
          <>
            <Text tone="muted">{t('Erevos does not screen calls yet, so a blocked call rings a moment before Erevos ends it.')}</Text>
            <Button title={t('Let Erevos screen calls')} kind="secondary" onPress={askScreening} />
          </>
        ) : null}
        {note ? <Text tone="muted">{note}</Text> : null}
      </Card>

      <Card>
        <Text variant="bodyStrong">{t('Blocked numbers')}</Text>
        <Text tone="muted">
          {t("Android's own blocked numbers, the same list as under SMS: Android rejects their calls before they ring, and their SMS and MMS. Every space sees the same list.")}
        </Text>
        <BlockedNumbers cannot={smsToolsReady() ? t('Only the phone app or the SMS app may see them: make Erevos the phone app above.') : t('This build of Erevos cannot block numbers yet.')} />
      </Card>

      <Card>
        <Text variant="bodyStrong">{t('Block a contact group')}</Text>
        <Text tone="muted">
          {t("The calls of a group's contacts, as your phone's contacts label them, are blocked for a while: for an hour, until tomorrow morning, or until you lift it.")}
        </Text>
        {groups && !groups.allowed ? <Text tone="muted">{t("Android does not let Erevos read the phone's contacts yet.")}</Text> : null}
        {groups?.allowed && groups.groups.length === 0 ? <Text tone="muted">{t('Your phone has no contact groups yet.')}</Text> : null}
        {(groups?.allowed ? groups.groups : []).map((group) => {
          const block = live.find((b) => b.id === group.id);
          // Two accounts can each have a group of the same name.
          const twice = groups?.groups.some((g) => g.id !== group.id && g.title === group.title);
          return (
            <Row key={group.id} style={{ gap: space.sm }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text>{twice && group.account ? `${group.title} · ${group.account}` : group.title}</Text>
                <Text variant="caption" color={block ? colors.danger : colors.textFaint}>
                  {block ? blockedUntil(block.until, now) : plural(group.count, '{n} contact', '{n} contacts')}
                </Text>
              </View>
              {block ? (
                <Button title={t('Lift')} kind="secondary" compact onPress={() => keep(liftGroup(rules, group.id))} />
              ) : (
                <Button title={t('Block')} kind="secondary" compact onPress={() => setChoosing(group)} />
              )}
            </Row>
          );
        })}
      </Card>

      <Sheet visible={choosing !== null} onClose={() => setChoosing(null)} title={choosing?.title}>
        {BLOCK_FOR.map((choice) => (
          <Button
            key={choice.length}
            title={t(choice.label)}
            kind="secondary"
            onPress={() => {
              if (choosing) keep(blockGroup(rules, choosing.id, blockUntil(choice.length, Date.now())));
              setChoosing(null);
            }}
          />
        ))}
      </Sheet>
    </>
  );
}

// What the phone company keeps of each SIM's calls: forwarding, call waiting, showing your number and
// the voicemail number. Android's own screens set them; where a phone has none, the network's codes
// ask it, and it answers in Android's own message.
function CallSettings() {
  const [accounts, setAccounts] = useState<PhoneAccount[]>([]);
  const [chosen, setChosen] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    phoneAccounts().then(
      (found) => {
        setAccounts(found);
        if (found.length >= 2) setChosen(found[0].id);
      },
      () => setAccounts([]),
    );
  }, []);

  function open(kind: 'calls' | 'voicemail') {
    setNote(openCallSettings(kind, chosen) ? '' : t('This phone has no such screen of its own. The codes below ask your phone company instead.'));
  }

  async function dial(code: string) {
    setNote('');
    try {
      await placeCall(code, chosen);
    } catch (error) {
      setNote(t('Not called. {error}', { error: error instanceof Error ? error.message : String(error) }));
    }
  }

  return (
    <Card>
      <Text variant="bodyStrong">{t('Call settings')}</Text>
      <Text tone="muted">
        {t('Call forwarding, call waiting, showing your number and the voicemail number are kept by your phone company, for each SIM. Android sets them in its own screens.')}
      </Text>
      {accounts.length >= 2 ? (
        <Row wrap style={{ gap: space.sm }}>
          {accounts.map((a) => (
            <Button key={a.id} title={accountLabel(a)} kind={chosen === a.id ? 'primary' : 'secondary'} compact onPress={() => setChosen(a.id)} />
          ))}
        </Row>
      ) : null}
      <Button title={t('Forwarding, waiting and your number')} kind="secondary" onPress={() => open('calls')} />
      <Button title={t('Voicemail number')} kind="secondary" onPress={() => open('voicemail')} />
      <Text variant="bodyStrong">{t('Ask your phone company')}</Text>
      <Text tone="muted">{t('Each button calls a code, as every network takes them; the answer shows in a message of Android.')}</Text>
      {CALL_CODES.map((group) => (
        <View key={group.what} style={{ gap: space.xs }}>
          <Text>{t(group.what)}</Text>
          <Row wrap style={{ gap: space.sm }}>
            {group.codes.map((each) => (
              <Button key={each.code} title={`${t(each.label)} · ${each.code}`} kind="secondary" compact onPress={() => void dial(each.code)} />
            ))}
          </Row>
        </View>
      ))}
      <Text variant="caption" tone="faint">
        {t('To hide your number for one call only, type #31# before the number on the keypad.')}
      </Text>
      {note ? <Text tone="muted">{note}</Text> : null}
    </Card>
  );
}

// Speed dial: the number each of the keys 2 to 9 calls, held down on an empty keypad; sealed in the
// space (lib/phone-sims.ts).
function SpeedDials() {
  const [sims, setSims] = useState<PhoneSims | null>(null);
  const [choosing, setChoosing] = useState<string | null>(null);
  const [note, setNote] = useState('');
  // Bumped when a key changes, to show it.
  const [, setShown] = useState(0);

  useEffect(() => {
    try {
      const { space: open, key } = currentSpace();
      PhoneSims.open(open, key).then(setSims, () => setSims(null));
    } catch {
      setSims(null);
    }
  }, []);

  if (!sims) return null;

  function pick(number: string, name: string) {
    const key = choosing;
    setChoosing(null);
    if (!key || !sims) return;
    sims.setSpeed(key, number, name).then(
      () => {
        setNote('');
        setShown((n) => n + 1);
      },
      (error) => setNote(error instanceof Error ? error.message : String(error)),
    );
  }

  return (
    <Card>
      <Text variant="bodyStrong">{t('Speed dial')}</Text>
      <Text tone="muted">{t('Hold a key from 2 to 9 on an empty keypad to call its number. 1 calls the voicemail. Kept sealed in this space.')}</Text>
      <Row wrap style={{ gap: space.sm }}>
        {SPEED_KEYS.map((key) => {
          const kept = sims.speed(key);
          return (
            <Button
              key={key}
              title={`${key} · ${kept ? kept.name || kept.number : t('Set')}`}
              kind={kept ? 'primary' : 'secondary'}
              compact
              onPress={() => setChoosing(key)}
            />
          );
        })}
      </Row>
      {note ? <Text tone="muted">{note}</Text> : null}
      <SpeedDialPick slot={choosing} current={choosing ? sims.speed(choosing) : undefined} onClose={() => setChoosing(null)} onPick={pick} />
    </Card>
  );
}

// The spam list: a list of numbers downloaded whole, from an address the owner chooses, matched on
// the phone (lib/spam-list.ts), and the numbers they reported in Recents. The call screen warns of
// a number on it; it can ring silently. Never a number looked up anywhere.
function SpamList({ screens }: { screens: boolean }) {
  const [state, setState] = useState<SpamState | null>(spamState());
  const [address, setAddress] = useState(state?.source ?? '');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [plainOk, setPlainOk] = useState(true);
  useEffect(() => {
    void spamWithoutTor().then(setPlainOk);
  }, []);
  if (!state) return null;

  const look = () => {
    setState(spamState());
    void spamWithoutTor().then(setPlainOk);
  };

  function switches(warn: boolean, silence: boolean) {
    setSpamSwitches(warn, silence);
    look();
    if (silence && !screens) {
      try {
        requestScreening();
      } catch (error) {
        setNote(error instanceof Error ? error.message : String(error));
      }
    }
  }

  async function weekly(on: boolean) {
    const withoutTor = on && !netThroughTor();
    if (withoutTor) {
      const go = await confirm(
        t('Your internet address can be seen'),
        t("Without Tor, the list's server sees this phone's internet address (IP address) each week, though no number of yours: the list comes whole, and is matched on the phone."),
        t('Download each week'),
      );
      if (!go) return;
    }
    await setSpamWeekly(on, withoutTor);
    look();
  }

  async function download() {
    const from = spamAddress(address);
    if (!from) {
      setNote(t('Type the https:// address of a list.'));
      return;
    }
    if (!netThroughTor()) {
      const go = await confirm(
        t('Your internet address can be seen'),
        t("Without Tor, the list's server sees this phone's internet address (IP address), though no number of yours: the list comes whole, and is matched on the phone."),
        t('Download'),
      );
      if (!go) return;
    }
    setBusy(true);
    setNote('');
    try {
      const count = await downloadSpamList(from);
      setNote(plural(count, 'The list holds {n} number.', 'The list holds {n} numbers.'));
    } catch (error) {
      setNote(t('The list did not come. {error}', { error: error instanceof Error ? error.message : String(error) }));
    } finally {
      setBusy(false);
      look();
    }
  }

  return (
    <Card>
      <Text variant="bodyStrong">{t('Spam list')}</Text>
      <Text tone="muted">
        {t("A list of numbers known for spam, downloaded whole from an address you choose and matched on the phone, so no number of yours or of who calls is ever looked up anywhere. The call screen of a number on it warns you; the numbers you report in Recents count too. Without a list, the call screen still says where an unknown number is from and whether it is a mobile, from the number alone.")}
      </Text>
      <Button
        title={state.warn ? t('Stop warning of spam') : t('Warn of spam')}
        kind={state.warn ? 'secondary' : 'primary'}
        onPress={() => switches(!state.warn, state.silence)}
      />
      <Button
        title={state.silence ? t('Let spam calls ring') : t('Ring spam calls silently')}
        kind="secondary"
        onPress={() => switches(state.warn, !state.silence)}
      />
      <Text variant="caption" tone="faint">
        {t('A silent call still shows, and can be answered; a contact of yours is never silenced.')}
      </Text>
      <Input value={address} onChangeText={setAddress} placeholder="https://" autoCapitalize="none" autoCorrect={false} keyboardType="url" />
      <Button title={busy ? t('Downloading…') : t('Download the list')} disabled={busy} onPress={() => void download()} />
      <Text tone="muted">
        {state.at > 0
          ? t('{count} on the list, downloaded {date}.', { count: String(state.count), date: new Date(state.at).toLocaleDateString() })
          : t('No list downloaded yet.')}
      </Text>
      {state.at > 0 ? (
        <>
          <Button
            title={state.auto ? t('Stop downloading it each week') : t('Download it again each week')}
            kind="secondary"
            onPress={() => void weekly(!state.auto)}
          />
          <Text variant="caption" tone="faint">
            {t("With Erevos unlocked, the list comes again from the same address when it is a week old, through Tor when the space's Tor way is on.")}
          </Text>
          {state.auto && !plainOk && !netThroughTor() ? (
            <Text variant="caption" tone="faint">
              {t('Tor is off, so the list does not come again: it was switched on with Tor. Switch it off and on again to let it come without Tor.')}
            </Text>
          ) : null}
        </>
      ) : null}
      {state.at > 0 ? (
        <Button
          title={t('Remove the list')}
          kind="secondary"
          onPress={() => {
            clearSpamList();
            look();
          }}
        />
      ) : null}
      {state.own > 0 ? (
        <>
          <Text tone="muted">{plural(state.own, 'You reported {n} number.', 'You reported {n} numbers.')}</Text>
          <Button
            title={t('Forget my reports')}
            kind="secondary"
            onPress={() => {
              clearSpamReports();
              look();
            }}
          />
        </>
      ) : null}
      {note ? <Text tone="muted">{note}</Text> : null}
      <Text variant="caption" tone="faint">
        {t('The list, its address, these switches and the numbers you reported stay on this phone outside your spaces, not encrypted, so that a call is checked with Erevos locked too.')}
      </Text>
    </Card>
  );
}

// The replies Message offers on the call screen, to decline a call with an SMS.
function QuickReplies() {
  const [kept, setKept] = useState(quickReplies());
  const [replies, setReplies] = useState(kept.replies);
  const changed = JSON.stringify(replies) !== JSON.stringify(kept.replies);

  function keep(next: string[]) {
    setQuickReplies(next);
    const now = quickReplies();
    setKept(now);
    setReplies(now.replies);
  }

  return (
    <Card>
      <Text variant="bodyStrong">{t('Quick replies')}</Text>
      <Text tone="muted">
        {t('Message, on the call screen of a call that rings, declines it with one of these, which the phone sends the caller as an SMS. They are kept on the phone, not sealed, as the call screen shows them with Erevos locked.')}
      </Text>
      {replies.map((reply, i) => (
        <Row key={i} style={{ gap: space.sm }}>
          <Input
            value={reply}
            onChangeText={(text) => setReplies((all) => all.map((r, j) => (j === i ? text : r)))}
            maxLength={MAX_REPLY}
            style={{ flex: 1 }}
          />
          <Button title={t('Remove')} kind="secondary" compact onPress={() => setReplies((all) => all.filter((_, j) => j !== i))} />
        </Row>
      ))}
      {replies.length < MAX_REPLIES ? <Button title={t('Add a reply')} kind="secondary" onPress={() => setReplies((all) => [...all, ''])} /> : null}
      {changed ? <Button title={t('Save')} onPress={() => keep(cleanReplies(replies))} /> : null}
      {kept.own ? <Button title={t('Use the usual replies')} kind="secondary" onPress={() => keep([])} /> : null}
    </Card>
  );
}
