// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { startActivityAsync } from 'expo-intent-launcher';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Linking, PermissionsAndroid, Platform } from 'react-native';

import { BlockedNumbers } from '../components/blocked-numbers';
import { SmsRecipient } from '../components/sms-recipient';
import { Button, Card, Chip, Field, Input, Page, Row, SectionTitle, Text } from '../components/ui';
import { mark, plural, t } from '../lib/i18n';
import { guessHome, smsOrderChanged } from '../lib/sms-folders';
import { smsAddress, smsNumbers } from '../lib/sms-group';
import { SmsLink } from '../lib/sms-link';
import { smsDevicesChanged } from '../lib/sms-share';
import { currentSpace } from '../lock/keys';
import { MAX_WORDS, UNDO_SECONDS, WORD, type SmsData } from '../lock/sms-data';
import { fetchMms, mmsSwitches, onSmsEvent, requestDefaultSms, setMmsSwitches, smsMirrored, smsPacketsReady, smsReady, smsStatus, smsThreads, smsToolsReady, waitingMms, type SmsStatus, type WaitingMms } from '../modules/erevos-sms';

// Erevos as the phone's SMS app: then the home screen shows SMS and Erevos chats in one list, and
// writing to a number that has Erevos goes through Erevos. Whether to look for Erevos on a number
// with a hidden SMS invite, whether texts to Erevos contacts go by SMS, encrypted, when nothing else
// takes them (lib/sms-way.ts), whether SMS numbers show the names the phone's contacts give them, and
// a new SMS conversation. The space's SMS folders, its spam filter's rules, the seconds an SMS waits
// to be taken back, and the numbers blocked in Android's own list.

// What the SMS app needs from Android. Becoming the SMS app gives them, except to an app installed
// from a browser on Android 15 and later, which Android holds them back from until its owner allows
// "restricted settings" for it.
const SMS_PERMISSIONS = [
  'android.permission.READ_SMS',
  'android.permission.RECEIVE_SMS',
  'android.permission.SEND_SMS',
  'android.permission.RECEIVE_MMS',
] as const;
// Android 15 and later also hold the SMS app role back from an app installed from a browser: its
// question then does not come, or says the setting is restricted.
const NOT_CHOSEN = mark(
  "Choose Erevos in Android's Default apps → SMS app. If Android says it is a restricted setting, open Erevos's App info, tap ⋮ at the top right → Allow restricted settings, and choose Erevos again.",
);
const RESTRICTED = mark(
  "Android did not allow it. In Erevos's App info, under Permissions → SMS, it may say Restricted setting: then go back, tap ⋮ at the top right → Allow restricted settings, and allow SMS under Permissions.",
);

// The parts of this screen that open alone from Settings (lib/settings.ts), by their titles.
const PARTS = {
  app: mark('Erevos as the SMS app'),
  find: mark('Find Erevos on a number'),
  last: mark('SMS when nothing else works'),
  names: mark('Names from your contacts'),
  devices: mark('On my linked devices too'),
  folders: mark('Archived, Spam and Trash'),
  spam: mark('Spam filter'),
  blocked: mark('Blocked numbers'),
  undo: mark('Taking an SMS back'),
  mms: mark('MMS'),
  sims: mark('Two SIMs'),
  new: mark('New SMS'),
};
type Part = keyof typeof PARTS;

// The spam filter's rules as this screen shows them.
const spamOf = (data: Readonly<SmsData> | null) => ({
  on: data?.spam ?? true,
  links: data?.spamLinks ?? false,
  words: [...(data?.spamWords ?? [])],
  from: [...(data?.spamFrom ?? [])],
  allow: [...(data?.allowFrom ?? [])],
  abroad: data?.spamAbroad ?? false,
});

export default function SmsSettings() {
  const params = useLocalSearchParams<{ part?: string }>();
  const part = typeof params.part === 'string' && params.part in PARTS ? (params.part as Part) : null;
  const shows = (one: Part) => !part || part === one;
  const [status, setStatus] = useState<SmsStatus | null>(smsStatus());
  // Whether Android lets Erevos read the phone's SMS; null until known.
  const [canRead, setCanRead] = useState<boolean | null>(null);
  const [readNote, setReadNote] = useState('');
  // Whether Android lets Erevos show a notice when an SMS comes (Android 13 and later ask); null until known.
  const [canNotify, setCanNotify] = useState<boolean | null>(null);
  // Set once the owner asked Android to make Erevos the SMS app, until it is.
  const [asked, setAsked] = useState(false);
  // What reading the phone's SMS gave, as the SMS app: how many conversations, or why it failed.
  const [reading, setReading] = useState<{ count: number } | { error: string } | null>(null);
  const [link, setLink] = useState<SmsLink | null>(null);
  const [invites, setInvites] = useState(true);
  // SMS when nothing else works, for every contact with a number, and how many have it one by one.
  const [smsWay, setSmsWay] = useState<{ all: boolean; some: number }>({ all: false, some: 0 });
  const [names, setNames] = useState(false);
  // The phone's SMS on the space's linked devices too (lib/sms-share.ts).
  const [devices, setDevices] = useState(false);
  const [number, setNumber] = useState('');
  const [note, setNote] = useState('');
  // The spam filter (lib/sms-folders.ts) and the seconds to take an SMS back, as the space keeps them.
  const [spam, setSpam] = useState(() => spamOf(null));
  const [word, setWord] = useState('');
  // A rule on who sends, as typed, and the phone's own country code as typed.
  const [sender, setSender] = useState('');
  const [home, setHome] = useState('');
  const [undo, setUndo] = useState(5);
  // SMS without accents, Greek in capitals, to cost fewer (lib/sms-count.ts).
  const [plain, setPlain] = useState(false);
  // Who wrote and what on an SMS's notice, with Reply and Mark as read (lib/sms-notices.ts).
  const [notices, setNotices] = useState(false);
  // MMS fetched at once and while roaming (MmsStore.kt), and those waiting for a tap.
  const [mms, setMms] = useState(mmsSwitches());
  const [waiting, setWaiting] = useState<WaitingMms[]>(() => waitingMms());
  // A waiting MMS that came, or did not when fetched, changes the list.
  useEffect(() => {
    const changed = onSmsEvent('onSms', () => setWaiting(waitingMms()));
    return () => changed?.remove();
  }, []);

  useEffect(() => {
    const { space, key } = currentSpace();
    SmsLink.open(space, key)
      .then((opened) => {
        setLink(opened);
        setInvites(opened.invites);
        setSmsWay({ all: opened.smsWay.all, some: opened.smsWay.some.length });
        setNames(opened.names);
        setDevices(opened.devices);
        setSpam(spamOf(opened.state));
        setHome(opened.state.home);
        setUndo(opened.undo);
        setPlain(opened.plain);
        setNotices(opened.notices);
      })
      .catch(() => setNote(t('The SMS settings of this space could not open.')));
    const look = () => {
      const now = smsStatus();
      setStatus(now);
      if (Platform.OS !== 'android') return;
      void PermissionsAndroid.check('android.permission.READ_SMS').then(setCanRead, () => setCanRead(null));
      if (Number(Platform.Version) >= 33) {
        void PermissionsAndroid.check('android.permission.POST_NOTIFICATIONS').then(setCanNotify, () => setCanNotify(null));
      } else setCanNotify(true);
      if (now?.isDefault) {
        smsThreads().then(
          (threads) => setReading({ count: threads.length }),
          (error) => setReading({ error: error instanceof Error ? error.message : String(error) }),
        );
      } else setReading(null);
    };
    look();
    // Android answers in its own screens: look again when the app comes back.
    const subscription = AppState.addEventListener('change', (state) => state === 'active' && look());
    return () => subscription.remove();
  }, []);

  // On a linked device, the SMS are the phone's: what they are, and where they are turned off.
  if (smsMirrored()) {
    return (
      <Page>
        <Text variant="title">SMS</Text>
        <Text tone="muted">
          {t("These are your phone's SMS. They come here through the phone, and what you write here goes from the phone as soon as it gets it. Older SMS and photos stay on the phone. To stop them, turn off On my linked devices too on the phone, under Settings → SMS.")}
        </Text>
      </Page>
    );
  }

  if (Platform.OS !== 'android' || !smsReady()) {
    return (
      <Page>
        <Text variant="title">SMS</Text>
        <Text tone="muted">
          {Platform.OS === 'android'
            ? t('This build of Erevos has no SMS part yet. It comes with the next build of the app.')
            : t('Only Android lets another app be the SMS app.')}
        </Text>
      </Page>
    );
  }

  async function makeDefault() {
    setNote('');
    setAsked(true);
    try {
      requestDefaultSms();
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
    if (Number(Platform.Version) >= 33) await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS').catch(() => undefined);
  }

  async function openDefaultApps() {
    await startActivityAsync('android.settings.MANAGE_DEFAULT_APPS_SETTINGS').catch(() => Linking.openSettings());
  }

  async function allowSms() {
    setReadNote('');
    const answers = await PermissionsAndroid.requestMultiple([...SMS_PERMISSIONS]).catch(() => null);
    const granted = answers?.['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED;
    setCanRead(granted);
    if (!granted) setReadNote(t(RESTRICTED));
  }

  // Android asks only until it was refused twice; then only Erevos's App info turns them on.
  async function allowNotices() {
    const answer = await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS').catch(() => null);
    if (answer === PermissionsAndroid.RESULTS.GRANTED) setCanNotify(true);
    else void Linking.openSettings();
  }

  async function toggleInvites() {
    if (!link) return;
    const next = !invites;
    await link.setInvites(next);
    setInvites(next);
  }

  async function toggleSmsWay() {
    if (!link) return;
    const next = !smsWay.all;
    await link.setSmsWay(next);
    setSmsWay({ all: next, some: link.smsWay.some.length });
  }

  // Names from the phone's contacts: Android asks once, when the owner turns them on.
  async function toggleNames() {
    if (!link) return;
    setNote('');
    if (!names) {
      const answer = await PermissionsAndroid.request('android.permission.READ_CONTACTS').catch(() => null);
      if (answer !== PermissionsAndroid.RESULTS.GRANTED) {
        setNote(t("Erevos may not read the phone's contacts, so numbers stay as they are."));
        return;
      }
    }
    await link.setNames(!names);
    setNames(!names);
    smsDevicesChanged();
  }

  async function toggleDevices() {
    if (!link) return;
    setNote('');
    const next = !devices;
    try {
      await link.setDevices(next);
      setDevices(next);
      smsDevicesChanged();
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  async function changeSpam(change: (opened: SmsLink) => Promise<unknown>) {
    if (!link) return;
    await change(link);
    setSpam(spamOf(link.state));
    smsOrderChanged();
  }

  async function addSender(allow: boolean) {
    const typed = sender.trim();
    if (!typed || !link) return;
    if (!(await link.addSenderRule(typed, allow))) {
      setNote(t('At most {n} senders each way, each up to {length} letters, and not * alone.', { n: MAX_WORDS, length: WORD }));
      return;
    }
    setSender('');
    await changeSpam(async () => undefined);
  }

  // Turned on, the country code is the one most of the numbers answered here are written with,
  // unless one is kept already: the owner sees it and can change it.
  async function changeAbroad() {
    if (!link) return;
    let code = home;
    if (!spam.abroad && !code) {
      const threads = await smsThreads().catch(() => []);
      const answered = threads.filter((th) => th.replied || th.mine);
      code = guessHome((answered.length > 0 ? answered : threads).flatMap((th) => smsNumbers(th.address)));
      setHome(code);
    }
    await changeSpam((l) => l.setSpamAbroad(!spam.abroad, code));
  }

  async function addWord() {
    const typed = word.trim();
    if (!typed || !link) return;
    if (!(await link.addSpamWord(typed))) {
      setNote(t('At most {n} words, each up to {length} letters.', { n: MAX_WORDS, length: WORD }));
      return;
    }
    setWord('');
    await changeSpam(async () => undefined);
  }

  async function chooseUndo(seconds: number) {
    if (!link) return;
    await link.setUndo(seconds);
    setUndo(link.undo);
  }

  function mmsSwitch(auto: boolean, roaming: boolean) {
    setMmsSwitches(auto, roaming);
    setMms(mmsSwitches());
  }

  async function fetchWaiting(one: WaitingMms) {
    setNote('');
    try {
      await fetchMms(one.location);
      setWaiting(waitingMms());
      setNote(t('Fetching it: it shows in its conversation once it came.'));
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  async function toggleNotices() {
    if (!link) return;
    await link.setNotices(!notices);
    setNotices(link.notices);
  }

  async function togglePlain() {
    if (!link) return;
    await link.setPlain(!plain);
    setPlain(link.plain);
  }

  function open() {
    // Several numbers, separated by commas, make a group's conversation.
    const numbers = smsNumbers(number);
    if (numbers.length === 0) {
      setNote(t('Type a phone number.'));
      return;
    }
    setNumber('');
    router.push(`/sms?to=${encodeURIComponent(smsAddress(numbers))}`);
  }

  return (
    <Page>
      <Text variant="title">{part ? t(PARTS[part]) : 'SMS'}</Text>
      {shows('app') ? (
        <>
          <Card>
            <Text variant="bodyStrong">{status?.isDefault ? t('Erevos is the SMS app') : t('Erevos is not the SMS app')}</Text>
            <Text tone="muted">
              {t('As the SMS app, Erevos shows SMS and Erevos chats in one list. Writing to a number that has Erevos goes through Erevos, end-to-end encrypted. To everyone else it goes as a plain SMS, marked SMS: the phone company can read it, as it reads every SMS.')}
            </Text>
            {status?.isDefault ? null : (
              <>
                <Button title={t('Make Erevos the SMS app')} onPress={() => void makeDefault()} />
                {asked ? (
                  <>
                    <Text variant="bodyStrong">{t('Android did not make Erevos the SMS app')}</Text>
                    <Text tone="muted">{t(NOT_CHOSEN)}</Text>
                    <Button title={t('Open Default apps')} kind="secondary" onPress={() => void openDefaultApps()} />
                    <Button title={t("Open Erevos's App info")} kind="secondary" onPress={() => void Linking.openSettings()} />
                  </>
                ) : null}
              </>
            )}
            {status?.isDefault && canRead === false ? (
              <>
                <Text variant="bodyStrong">{t('Android does not let Erevos read the SMS')}</Text>
                <Text tone="muted">
                  {t('So no SMS show yet. Android holds this back from an app installed from a browser, until you allow it.')}
                </Text>
                <Button title={t('Allow SMS')} onPress={() => void allowSms()} />
                <Button title={t("Open Erevos's App info")} kind="secondary" onPress={() => void Linking.openSettings()} />
                {readNote ? <Text tone="muted">{readNote}</Text> : null}
              </>
            ) : null}
            {status?.isDefault && canRead !== false && reading ? (
              <Text tone="muted">
                {'error' in reading
                  ? t("Erevos could not read the phone's SMS: {error}", { error: reading.error })
                  : reading.count === 0
                    ? t('Erevos found no SMS on this phone.')
                    : plural(reading.count, 'Erevos reads {n} SMS conversation on this phone.', 'Erevos reads {n} SMS conversations on this phone.')}
              </Text>
            ) : null}
            {status?.isDefault && canNotify === false ? (
              <>
                <Text variant="bodyStrong">{t('Notifications are off')}</Text>
                <Text tone="muted">{t('So nothing tells you when an SMS comes.')}</Text>
                <Button title={t('Allow notifications')} onPress={() => void allowNotices()} />
              </>
            ) : null}
            {status && !status.phone ? <Text tone="muted">{t('This device has no phone part, so it cannot send SMS.')}</Text> : null}
          </Card>
        </>
      ) : null}

      {shows('find') ? (
        <>
          {part ? null : <SectionTitle title={t('Find Erevos on a number')} />}
          <Card>
            <Text tone="muted">
              {t('With the first SMS to a number that is not a contact, Erevos also sends a hidden invite. A phone without Erevos shows nothing. A phone with Erevos answers through the relay, and the two become contacts. The phone company sees one more short SMS. Each number is asked once a month at most. Turned off, Erevos sends no invites and answers none that come: no one becomes a contact from your number alone.')}
            </Text>
            <Button title={invites ? t('Turn invites off') : t('Turn invites on')} kind="secondary" onPress={() => void toggleInvites()} />
            <Text variant="caption" tone="faint">
              {t('A number can also be linked by hand: open its SMS conversation and choose the contact.')}
            </Text>
          </Card>
        </>
      ) : null}

      {shows('last') && smsPacketsReady() ? (
        <>
          {part ? null : <SectionTitle title={t('SMS when nothing else works')} />}
          <Card>
            <Text tone="muted">
              {t("When the relay, Nostr, the phones nearby and LoRa all fail, a text to an Erevos contact whose number is linked can go by SMS instead, end-to-end encrypted like any Erevos message, as hidden data SMS their SMS app does not show. Off unless you turn it on, here for all such contacts or in a chat's Details for one.")}
            </Text>
            <Text tone="muted">
              {t('Mind what it costs: each SMS costs what your plan says, a short text takes 3 SMS and a longer one up to 10. And the phone company sees which number wrote to which, and when, as with any SMS; never what was written.')}
            </Text>
            <Text tone="muted">
              {t('Only texts and deletes go so, not photos, files, voice messages, marks or calls, nor long texts (about 800 Latin letters at most, or 400 Greek ones), nor anything from hidden chats. Both phones need Erevos as the SMS app.')}
            </Text>
            <Button title={smsWay.all ? t('Turn off for all contacts') : t('Turn on for all contacts')} kind="secondary" onPress={() => void toggleSmsWay()} />
            {smsWay.some > 0 ? (
              <Text variant="caption" tone="faint">
                {plural(smsWay.some, "On for {n} contact in their chat's Details.", "On for {n} contacts in their chats' Details.")}
              </Text>
            ) : null}
            {status && !status.isDefault ? <Text variant="caption" tone="faint">{t('Erevos is not the SMS app yet, so nothing goes by SMS.')}</Text> : null}
          </Card>
        </>
      ) : null}

      {shows('names') ? (
        <>
          {part ? null : <SectionTitle title={t('Names from your contacts')} />}
          <Card>
            <Text tone="muted">
              {t("SMS numbers that are no Erevos contact show only their numbers, until you turn names on here or with Names above the list: then the names your phone's contacts give them, and those of your contacts kept only in Erevos. Erevos reads them only to show them, keeps no copy, and sends them nowhere. Android asks first.")}
            </Text>
            <Button title={names ? t('Show numbers only') : t('Show names from my contacts')} kind="secondary" onPress={() => void toggleNames()} />
            <Text variant="caption" tone="faint">
              {t('With the names come the pictures your contacts have, in the list and in the conversation. They too are read only to show them.')}
            </Text>
          </Card>
          <Card>
            <Text variant="bodyStrong">{t('What an SMS says, on its notice')}</Text>
            <Text tone="muted">
              {t('A notice says only "New message" at first. With this on, while this space is open, it shows who wrote and what, with Reply and Mark as read: anyone who sees the phone\'s screen sees them too. Locked, it says "New message" again. Never with a one-time code.')}
            </Text>
            <Button title={notices ? t('Notices without who and what') : t('Show who and what on notices')} kind="secondary" onPress={() => void toggleNotices()} />
          </Card>
        </>
      ) : null}

      {shows('devices') ? (
        <>
          {part ? null : <SectionTitle title={t('On my linked devices too')} />}
          <Card>
            <Text tone="muted">
              {t("Your SMS go to this space's linked devices too: a computer, a browser, a tablet. There you read them and answer, and the answer goes from this phone as soon as it gets it, while this space is open here. The latest 50 conversations go, each with its latest 50 messages, end-to-end encrypted like all the devices share; older ones and photos stay on this phone, and so do those in the Trash and in Spam. Off unless you turn it on.")}
            </Text>
            <Button title={devices ? t('Stop the SMS on my devices') : t('Send my SMS to my devices too')} kind="secondary" onPress={() => void toggleDevices()} />
          </Card>
        </>
      ) : null}

      {shows('folders') ? (
        <>
          {part ? null : <SectionTitle title={t('Archived, Spam and Trash')} />}
          <Card>
            <Text tone="muted">
              {t("In the list, hold an SMS conversation down to pin it to the top, archive it, mark it as spam, block it or delete it; a swipe to the side goes to the tab beside. This space keeps its own pins, archived conversations, Trash and spam marks, sealed with its password; the SMS stay in the phone's SMS, where another space sees them as they are.")}
            </Text>
            <Row wrap>
              <Button title={t('Archived conversations')} kind="secondary" compact onPress={() => router.push('/sms-folder?folder=archived')} />
              <Button title={t('Spam')} kind="secondary" compact onPress={() => router.push('/sms-folder?folder=spam')} />
              <Button title={t('Trash')} kind="secondary" compact onPress={() => router.push('/sms-folder?folder=trash')} />
            </Row>
          </Card>
        </>
      ) : null}

      {shows('spam') ? (
        <>
          {part ? null : <SectionTitle title={t('Spam filter')} />}
          <Card>
            <Text tone="muted">
              {t('It works on this phone alone, by rules, and sends nothing anywhere. An SMS from a number that is no contact and was never answered goes to Spam when it has a link with words that try to fool, like a parcel held or a prize, or one of your words below. A number you marked as spam always goes there, one you marked not spam never does.')}
            </Text>
            <Button title={spam.on ? t('Turn the spam filter off') : t('Turn the spam filter on')} kind="secondary" onPress={() => void changeSpam((l) => l.setSpam(!spam.on))} />
            {spam.on ? (
              <>
                <Button
                  title={spam.links ? t('Let links from unknown numbers through') : t('Send every link from unknown numbers to Spam')}
                  kind="ghost"
                  compact
                  onPress={() => void changeSpam((l) => l.setSpamLinks(!spam.links))}
                />
                <Field label={t('Your words')} hint={t('An SMS with one of them goes to Spam, from any number or sender that is no contact. Tap a word to remove it.')}>
                  <Row>
                    <Input value={word} onChangeText={setWord} placeholder={t('A word or a few')} style={{ flex: 1 }} onSubmitEditing={() => void addWord()} maxLength={WORD} />
                    <Button title={t('Add')} compact kind="secondary" onPress={() => void addWord()} />
                  </Row>
                </Field>
                {spam.words.length > 0 ? (
                  <Row wrap>
                    {spam.words.map((w) => (
                      <Chip key={w} label={`${w} ×`} onPress={() => void changeSpam((l) => l.removeSpamWord(w))} />
                    ))}
                  </Row>
                ) : null}
                <Field
                  label={t('Senders')}
                  hint={t('A sender’s name, as shops and banks send, or a number, where * stands for anything: +4470* is every number that starts so, 1234* every short code that does. Let through: the filter never sends theirs to Spam, as your bank’s or your family’s; a number you marked as spam, or blocked, still goes there.')}
                >
                  <Input value={sender} onChangeText={setSender} placeholder={t('PROMO, +4470*, 1234*')} maxLength={WORD} autoCapitalize="none" autoCorrect={false} />
                </Field>
                <Row wrap>
                  <Button title={t('To Spam')} compact kind="secondary" disabled={!sender.trim()} onPress={() => void addSender(false)} />
                  <Button title={t('Let through')} compact kind="secondary" disabled={!sender.trim()} onPress={() => void addSender(true)} />
                </Row>
                {[
                  { rules: spam.from, title: t('To Spam:') },
                  { rules: spam.allow, title: t('Let through:') },
                ].map(({ rules, title }) =>
                  rules.length > 0 ? (
                    <Row wrap key={title}>
                      <Text variant="caption" tone="muted">
                        {title}
                      </Text>
                      {rules.map((r) => (
                        <Chip key={r} label={`${r} ×`} onPress={() => void changeSpam((l) => l.removeSenderRule(r))} />
                      ))}
                    </Row>
                  ) : null,
                )}
                <Button
                  title={spam.abroad ? t('Let numbers from abroad through') : t('Send numbers from abroad to Spam')}
                  kind="ghost"
                  compact
                  onPress={() => void changeAbroad()}
                />
                {spam.abroad ? (
                  <Field
                    label={t('Your country code')}
                    hint={home ? t('A number written with another one is from abroad; one written without any is from here.') : t('Type it: until then no number counts as from abroad.')}
                  >
                    <Row>
                      <Text>+</Text>
                      <Input
                        value={home}
                        onChangeText={(text) => setHome(text.replace(/\D/g, '').slice(0, 3))}
                        onBlur={() => void changeSpam((l) => l.setSpamAbroad(true, home))}
                        onSubmitEditing={() => void changeSpam((l) => l.setSpamAbroad(true, home))}
                        placeholder="30"
                        keyboardType="number-pad"
                        style={{ flex: 1 }}
                      />
                    </Row>
                  </Field>
                ) : null}
              </>
            ) : null}
            <Text variant="caption" tone="faint">
              {t('A notice still says "New message" when spam comes, as it shows before Erevos is opened. Block a number to hear nothing more from it.')}
            </Text>
          </Card>
        </>
      ) : null}

      {shows('blocked') ? (
        <>
          {part ? null : <SectionTitle title={t('Blocked numbers')} />}
          <Card>
            <Text tone="muted">
              {t("These are Android's own blocked numbers: Android rejects their SMS, MMS and calls. Every space, and the phone app, sees the same list. Block one from its conversation, with ⋮, or here.")}
            </Text>
            <BlockedNumbers
              cannot={smsToolsReady() ? t('Only the SMS app or the phone app can see and change them: make Erevos the SMS app first.') : t('This build of Erevos cannot block numbers yet.')}
            />
          </Card>
        </>
      ) : null}

      {shows('undo') ? (
        <>
          {part ? null : <SectionTitle title={t('Taking an SMS back')} />}
          <Card>
            <Text tone="muted">
              {t('An SMS you send waits this long at the end of the conversation before it goes: tap it then to take it back. When you leave Erevos, it goes at once.')}
            </Text>
            <Row wrap>
              {UNDO_SECONDS.map((seconds) => (
                <Chip key={seconds} label={seconds ? plural(seconds, '{n} second', '{n} seconds') : t('Off')} selected={undo === seconds} onPress={() => void chooseUndo(seconds)} />
              ))}
            </Row>
          </Card>
          <Card>
            <Text variant="bodyStrong">{t('Without accents (cheaper)')}</Text>
            <Text tone="muted">
              {t('Greek small letters and accents fit 70 letters in an SMS, not 160. With this on, a plain SMS goes without accents and Greek in capitals, as the old phones wrote it, so it fits 160 again. Not with an emoji, nor in an MMS, which costs the same either way.')}
            </Text>
            <Button title={plain ? t('Send with accents') : t('Send without accents')} kind="secondary" onPress={() => void togglePlain()} />
          </Card>
        </>
      ) : null}

      {mms && shows('mms') ? (
        <>
          {part ? null : <SectionTitle title={t('MMS')} />}
          <Card>
            <Text tone="muted">
              {t('An MMS waits at the phone company until the phone fetches it, over mobile data, which abroad may cost. Turned off, it waits for a tap: in its conversation, or here.')}
            </Text>
            <Button title={mms.auto ? t('Fetch MMS only on a tap') : t('Fetch MMS at once')} kind="secondary" onPress={() => mmsSwitch(!mms.auto, mms.roaming)} />
            {mms.auto ? (
              <Button title={mms.roaming ? t('Not at once while roaming') : t('At once while roaming too')} kind="secondary" onPress={() => mmsSwitch(mms.auto, !mms.roaming)} />
            ) : null}
            <Text variant="caption" tone="faint">
              {mms.auto ? (mms.roaming ? t('Fetched at once, abroad too.') : t('Fetched at once, but while roaming only on a tap.')) : t('Fetched only on a tap.')}
            </Text>
            {waiting.map((one) => (
              <Row key={one.location} wrap>
                <Text style={{ flex: 1 }}>
                  {t('MMS from {from} · {size} KB', { from: one.from || '?', size: String(Math.max(1, Math.round(one.size / 1024))) })}
                  {one.failed && !one.fetching ? `\n${t('It did not come. Try again with mobile data on.')}` : ''}
                </Text>
                <Button title={one.fetching ? t('Fetching…') : t('Fetch (may cost)')} kind="secondary" onPress={() => void fetchWaiting(one)} />
              </Row>
            ))}
            {part === 'mms' && note ? <Text tone="muted">{note}</Text> : null}
          </Card>
        </>
      ) : null}

      {(status?.slots ?? 0) >= 2 && shows('sims') ? (
        <>
          {part ? null : <SectionTitle title={t('Two SIMs')} />}
          <Card>
            <Text tone="muted">
              {t('In an SMS conversation, choose the SIM above the message field. Erevos keeps that choice for the number; until then, it answers on the SIM the last message came on. Each message shows its SIM.')}
            </Text>
          </Card>
        </>
      ) : null}

      {shows('new') ? (
        <>
          {part ? null : <SectionTitle title={t('New SMS')} />}
          <SmsRecipient value={number} onChange={setNumber} onSubmit={open} />
          <Button title={t('Write')} kind="secondary" onPress={open} />
          {note ? <Text tone="muted">{note}</Text> : null}
        </>
      ) : null}
    </Page>
  );
}
