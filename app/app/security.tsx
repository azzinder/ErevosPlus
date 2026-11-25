// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';

import { DesktopBackground } from '../components/desktop-background';
import { IntegrityCard } from '../components/integrity-card';
import { PasswordSheet } from '../components/PasswordSheet';
import { Button, Card, Chip, Field, Input, Page, Row, SectionTitle, Text } from '../components/ui';
import { confirm } from '../lib/alert';
import { loadBatteryMode, saveBatteryMode, type BatteryMode } from '../lib/battery-mode';
import { dropsOfClosedSpaces } from '../lib/camera-drops';
import { doorIsOpen, followDoor, setDoorOpen } from '../lib/closed-notices';
import { DESKTOP } from '../lib/desktop';
import { iconNumberOn, setIconNumberOn } from '../lib/icon-number';
import { mark, t } from '../lib/i18n';
import { myNameAt, setMyNameAt } from '../lib/my-name';
import { CAN_KEEP_PRIVATE, keepPrivate, loadScreenPrivacy, saveScreenPrivacy } from '../lib/screen-privacy';
import { PUSH_AVAILABLE } from '../lib/web-push';
import { setLastSeen, setTellOpen } from '../lib/space-chats';
import { spaceGroupsAt } from '../lib/space-groups';
import { MAX_NAME } from '../lock/e2e-data';
import {
  askBattery,
  askFullScreen,
  backgroundState,
  canRingInBackground,
  canStartAtBoot,
  loadBootStart,
  loadMessageNotices,
  loadRingInBackground,
  saveBootStart,
  saveMessageNotices,
  saveRingInBackground,
} from '../lib/background';
import { BiometricError, biometricOn, turnOffBiometric, turnOnBiometric } from '../lock/biometric';
import { dropOthersLockedSpeed, loadLockConfig, lockWithPassword, removePasswordLock, removeSecondPassword, setLockPassword, type LockConfig } from '../lock/config';
import { useLock } from '../lock/context';
import { prepareHidden, removeHiddenPassword, setHiddenPassword } from '../lock/hidden';
import { POCKETS } from '../lock/sealed-file';
import { currentSpace, newSpaceKey } from '../lock/keys';
import { EMPTY_SPACE, loadCurrentSpaceData, prepareSpaces, saveSpaceData, updateCurrentSpaceData } from '../lock/space-data';
import { biometricSealer } from '../modules/erevos-biometric';
import { useTheme } from '../theme/context';

// What the password sheet sets: this space's own password, its second password, or the
// password of its hidden chats. Or it asks for this space's password, to turn on unlocking with
// a fingerprint or face.
type Editing = 'own' | 'second' | 'hidden' | 'biometric' | null;

// The parts of this screen that open alone from Settings (lib/settings.ts), by their titles.
const PARTS = {
  myname: mark('My name'),
  lock: mark('Lock and second password'),
  hidden: mark('Hidden chats'),
  screen: mark('Screenshots'),
  lastseen: mark('Last seen'),
  background: mark('In the background'),
  web: mark('This web app'),
  push: mark('Notifications while closed'),
  icon: mark('Number on the icon'),
};
type Part = keyof typeof PARTS;

// Lock settings, as in LPHL FASOULI. Every space shows exactly the same screen, and nothing on it
// says whether a second password or hidden chats are set (see lock/config.ts and
// lock/hidden.ts), so the space a second password opens cannot be told apart from the real one.
// Unlocking with a fingerprint or face shows the same in every space too (lock/biometric.ts).
export default function Security() {
  const params = useLocalSearchParams<{ part?: string }>();
  const part = typeof params.part === 'string' && params.part in PARTS ? (params.part as Part) : null;
  const shows = (one: Part) => !part || part === one;
  const { space, setPasswordLock, lockNow, openSpace } = useLock();
  const { colors, look } = useTheme();
  const [config, setConfig] = useState<LockConfig | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [note, setNote] = useState('');
  // Which of the space's places for hidden chats the PIN buttons below are for.
  const [place, setPlace] = useState(0);
  // Whether a fingerprint or face opens Erevos: null where the phone cannot.
  const [biometric, setBiometric] = useState<boolean | null>(null);

  // Whether this phone keeps a locked space out of screenshots (lib/screen-privacy.ts).
  const [screenPrivate, setScreenPrivate] = useState<boolean | null>(null);
  // Whether the space's contacts see when it was last open, and it sees theirs (lib/last-seen.ts).
  const [lastSeen, setLastSeenShown] = useState<boolean | null>(null);
  const [tellOpen, setTellOpenShown] = useState(true);
  // The name this space goes by (lib/my-name.ts): null until read.
  const [myName, setMyName] = useState<string | null>(null);

  const reload = async () => {
    setConfig(await loadLockConfig());
    setBiometric(biometricSealer.available() ? await biometricOn(biometricSealer) : null);
    setScreenPrivate(await loadScreenPrivacy());
    const data = await loadCurrentSpaceData().catch(() => null);
    setLastSeenShown(data?.lastSeen ?? null);
    setTellOpenShown(data?.tellOpen ?? true);
    if (part === 'myname') setMyName(await myNameAt(spaceGroupsAt).catch(() => ''));
  };

  async function saveMyName() {
    if (myName === null) return;
    try {
      await setMyNameAt(spaceGroupsAt, myName);
      setMyName(await myNameAt(spaceGroupsAt));
    } catch (error) {
      setNote(String((error as Error)?.message ?? error));
    }
  }

  async function changeLastSeen(on: boolean) {
    await setLastSeen(on);
    setLastSeenShown(on);
  }

  async function changeTellOpen(on: boolean) {
    await setTellOpen(on);
    setTellOpenShown(on);
  }

  async function setScreenPrivacy(on: boolean) {
    await saveScreenPrivacy(on);
    keepPrivate('lock', on);
    setScreenPrivate(on);
  }
  useEffect(() => {
    reload();
  }, []);

  if (!config) return <View style={{ flex: 1, backgroundColor: colors.ground }} />;
  const locked = config.slots.length > 0 && config.direct !== space;

  async function turnOff() {
    const ok = await confirm(t('Turn off the lock'), t('Erevos will open without a password. The second password stops working too.'));
    if (!ok) return;
    await removePasswordLock(space, currentSpace().key);
    // What the locked camera took for the spaces that no longer open goes (lib/camera-drops.ts).
    await dropsOfClosedSpaces(space, currentSpace().key).catch(() => undefined);
    await turnOffBiometric(biometricSealer);
    setPasswordLock(false);
    await reload();
    setNote(t('The lock is off.'));
  }

  async function removeSecond() {
    const ok = await confirm(
      t('Remove second password'),
      t('The second password will stop working. What was in that space stays on the phone, and nothing opens it.'),
    );
    if (!ok) return;
    await removeSecondPassword(space, currentSpace().key);
    await dropsOfClosedSpaces(space, currentSpace().key).catch(() => undefined);
    await reload();
    setNote(t('Saved.'));
  }

  async function removeHidden() {
    const ok = await confirm(
      t('Remove hidden chats PIN'),
      t('The hidden chats in place {place} will stop opening. They stay on the phone, and nothing opens them.', { place: place + 1 }),
    );
    if (!ok) return;
    await removeHiddenPassword(space, place);
    setNote(t('Saved.'));
  }

  async function turnOffFingerprint() {
    await turnOffBiometric(biometricSealer);
    await reload();
    setNote(t('Saved.'));
  }

  async function submit(password: string) {
    const { key } = currentSpace();
    if (editing === 'biometric') {
      try {
        const prompt = { title: t('Fingerprint or face for Erevos'), cancel: t('Cancel') };
        if (!(await turnOnBiometric(biometricSealer, space, password, prompt))) return false;
        setNote(t('Erevos opens with your fingerprint or face too.'));
      } catch (e) {
        if (!(e instanceof BiometricError && e.reason === 'cancelled')) throw e;
      }
      setEditing(null);
      await reload();
      return;
    }
    if (editing === 'hidden') {
      await setHiddenPassword(space, place, password, null);
    } else if (editing === 'second') {
      // A new space with a new key, and no hidden chats. Whatever was there before cannot be opened any more.
      const next = space + 1;
      const nextKey = newSpaceKey();
      // Nor is its speed dial called with Erevos locked any more (lock/config.ts).
      await dropOthersLockedSpeed(space, key);
      await setLockPassword(next, password, nextKey);
      // It looks like this space, so the two cannot be told apart by their look.
      await saveSpaceData(next, nextKey, { ...EMPTY_SPACE, look });
      for (let pocket = 0; pocket < POCKETS; pocket++) await removeHiddenPassword(next, pocket);
      // The space a second password set inside the new one would open exists too.
      await prepareSpaces(next + 1);
      await prepareHidden(next + 2);
    } else if (locked) {
      await setLockPassword(space, password, key);
    } else {
      const other = await lockWithPassword(space, password, key);
      if (other) {
        // The password of another space (after the lock was turned off here): open it.
        setEditing(null);
        openSpace(other);
        return;
      }
      setPasswordLock(true);
      // The spaces second passwords open exist from now on, used or not, with keys no one has
      // until a password is set.
      await prepareSpaces(space + 1);
    }
    setEditing(null);
    await reload();
    setNote(t('Password saved.'));
  }

  return (
    <Page>
      <Text variant="title">{part ? t(PARTS[part]) : t('Lock')}</Text>

      {part === 'myname' && myName !== null ? (
        <Field label={t('My name')} hint={t('Contacts and private groups see it, encrypted, instead of a code. Each space and its hidden chats have their own: the same name in two of them tells whoever sees both that they are yours.')}>
          <Input
            value={myName}
            onChangeText={setMyName}
            onEndEditing={() => void saveMyName()}
            onSubmitEditing={() => void saveMyName()}
            placeholder={t('Name')}
            maxLength={MAX_NAME}
            autoCorrect={false}
          />
        </Field>
      ) : null}

      {shows('lock') ? (
        <>
          <SectionTitle title={t('Lock when Erevos opens')} />
          <Row wrap>
            <Chip label={t('No lock')} selected={!locked} onPress={() => (locked ? turnOff() : undefined)} />
            <Chip label={t('Password')} selected={locked} onPress={() => (locked ? undefined : setEditing('own'))} />
          </Row>

          {locked ? (
            <>
              <Card>
                <Text variant="bodyStrong">{t('Password lock is on')}</Text>
                <Text variant="caption" tone="muted" style={hint}>
                  {t('Erevos asks for the password every time it opens and after 30 seconds in the background.')}
                </Text>
                <Row wrap>
                  <Button title={t('Change password')} kind="secondary" compact onPress={() => setEditing('own')} />
                  <Button title={t('Lock now')} kind="secondary" compact onPress={lockNow} />
                </Row>
              </Card>

              {biometric !== null ? (
                <Card>
                  <Text variant="bodyStrong">{t('Fingerprint or face')}</Text>
                  <Text variant="caption" tone="muted" style={hint}>
                    {biometric
                      ? t('On: Erevos opens with your fingerprint or face too. The password always works.')
                      : t('Open Erevos with your fingerprint or face instead of typing the password. The password always works too.')}
                  </Text>
                  <Text variant="caption" tone="muted" style={hint}>
                    {t('It opens only what your first password opens, never the space of a second password or hidden chats. Someone who holds you can press your finger to the phone: if that may happen, keep it off.')}
                  </Text>
                  <Row wrap>
                    {biometric ? (
                      <Button title={t('Turn off')} kind="secondary" compact onPress={turnOffFingerprint} />
                    ) : (
                      <Button title={t('Turn on')} kind="secondary" compact onPress={() => setEditing('biometric')} />
                    )}
                  </Row>
                </Card>
              ) : null}

              <Card>
                <Text variant="bodyStrong">{t('Second password')}</Text>
                <Text variant="caption" tone="muted" style={hint}>
                  {t('If someone forces you to open the app, type the second password instead. It opens a separate, empty Erevos with its own contacts and relay. Your real chats stay hidden, and nothing in the app shows that they exist.')}
                </Text>
                <Text variant="caption" tone="muted" style={hint}>
                  {t('For privacy, the app never shows whether a second password is set. Setting one replaces the one before.')}
                </Text>
                <Row wrap>
                  <Button title={t('Set second password')} kind="secondary" compact onPress={() => setEditing('second')} />
                  <Button title={t('Remove second password')} kind="secondary" compact onPress={removeSecond} />
                </Row>
              </Card>
            </>
          ) : (
            <Text variant="caption" tone="muted" style={hint}>
              {t('Anyone who opens this phone can open Erevos. With a password you can also set a second password that opens a separate, empty space.')}
            </Text>
          )}
        </>
      ) : null}

      {CAN_KEEP_PRIVATE && screenPrivate !== null && shows('screen') ? (
        <>
          {part ? null : <SectionTitle title={t('Screenshots')} />}
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {screenPrivate
                ? t('On: Erevos stays out of screenshots, screen recordings and the recent apps, so no one sees its last screen there.')
                : t('Off: screenshots work, and the recent apps show the last screen of Erevos.')}{' '}
              {locked ? '' : `${t('It counts in a space with a password lock: this one has none, so screenshots of it work.')} `}
              {t('While it is on, hidden chats stay out of them too.')}
            </Text>
            <Row wrap>
              <Button title={screenPrivate ? t('Turn off') : t('Turn on')} kind="secondary" compact onPress={() => void setScreenPrivacy(!screenPrivate)} />
            </Row>
          </Card>
        </>
      ) : null}

      {lastSeen !== null && shows('lastseen') ? (
        <>
          {part ? null : <SectionTitle title={t('Last seen')} />}
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {lastSeen
                ? t('On: your contacts see the exact time you last had Erevos open, and you see theirs.')
                : t('Off: no one sees when you last had Erevos open, and you see no one’s either.')}{' '}
              {t('It goes end-to-end encrypted, inside what goes to your contacts anyway, never to the relay. Only for the chats of this space: hidden chats have their own switch, in a chat’s details there. Whether you are online now has its own switch in each chat: Appear offline.')}
            </Text>
            <Row wrap>
              <Button title={lastSeen ? t('Turn off') : t('Turn on')} kind="secondary" compact onPress={() => void changeLastSeen(!lastSeen).catch((error) => setNote(String(error?.message ?? error)))} />
            </Row>
          </Card>
          {lastSeen ? (
            <Card>
              <Text variant="label">{t('Say when I open and close Erevos')}</Text>
              <Text variant="caption" tone="muted" style={hint}>
                {tellOpen
                  ? t('As Erevos opens, the contacts you talked with in the last 30 days, who show their own time too, are told so at once, each after a random wait of up to a minute, at most every 15 minutes. As it closes, those told while it was open are told when it closed. The relay sees that something goes to them then, so it can tell when you open and close Erevos.')
                  : t('Your time goes only with what goes to your contacts anyway: a message, a mark that theirs came or was read, or an answer while they have your chat open. The relay learns nothing new.')}
              </Text>
              <Row wrap>
                <Button title={tellOpen ? t('Turn off') : t('Turn on')} kind="secondary" compact onPress={() => void changeTellOpen(!tellOpen).catch((error) => setNote(String(error?.message ?? error)))} />
              </Row>
            </Card>
          ) : null}
        </>
      ) : null}

      {shows('hidden') ? (
        <>
          {part ? null : <SectionTitle title={t('Hidden chats')} />}
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {t('Chats that open only with their own PIN: type it in the search on the home screen and press Enter. A wrong one is just a search. A chat moves into them from its details. They have their own relay queue, so while they are closed their messages wait on the relay and never show among your other chats.')}
            </Text>
            <Text variant="caption" tone="muted" style={hint}>
              {t('Every space has {n} places for hidden chats, each with its own PIN. For privacy, the app never shows whether any are set, so remember which places you use. A new PIN for a place starts it empty and replaces what was there. To keep them and change only the PIN, open them and change it there.', { n: POCKETS })}
            </Text>
            <Row wrap>
              {Array.from({ length: POCKETS }, (_, pocket) => (
                <Chip key={pocket} label={t('Place {n}', { n: pocket + 1 })} selected={place === pocket} onPress={() => setPlace(pocket)} />
              ))}
            </Row>
            <Row wrap>
              <Button title={t('Set hidden chats PIN')} kind="secondary" compact onPress={() => setEditing('hidden')} />
              <Button title={t('Remove hidden chats PIN')} kind="secondary" compact onPress={removeHidden} />
            </Row>
          </Card>
        </>
      ) : null}

      {canRingInBackground && shows('background') ? <BackgroundCalls titled={!part} /> : null}
      {DESKTOP && shows('background') ? <DesktopBackground titled={!part} /> : null}

      {!part || part === 'web' || part === 'push' ? <IntegrityCard part={part === 'web' || part === 'push' ? part : undefined} /> : null}

      {(PUSH_AVAILABLE || canRingInBackground) && shows('icon') ? <IconNumberChoice titled={!part} /> : null}

      {note ? (
        <Text variant="label" color={colors.success}>
          {note}
        </Text>
      ) : null}

      <PasswordSheet
        visible={editing !== null}
        title={
          editing === 'hidden'
            ? t('Set hidden chats PIN, place {n}', { n: place + 1 })
            : editing === 'biometric'
              ? t('Fingerprint or face')
              : editing === 'second'
                ? t('Set second password')
                : locked
                  ? t('Change password')
                  : t('Set password')
        }
        repeat={editing !== 'biometric'}
        warnWeak
        submitLabel={editing === 'biometric' ? t('Turn on') : t('Save')}
        onClose={() => setEditing(null)}
        onSubmit={submit}
      />
    </Page>
  );
}

// Receiving while Erevos is in the background (lib/background.ts), on this phone: the switch, the
// messages notice, whether this space says a message came while another is open
// (lib/closed-notices.ts), and what Android still has to allow, each with the way to allow it.
function BackgroundCalls({ titled }: { titled: boolean }) {
  const [on, setOn] = useState<boolean | null>(null);
  const [notices, setNotices] = useState(true);
  const [door, setDoor] = useState<boolean | null>(null);
  const [doorSaid, setDoorSaid] = useState('');
  // Whether a dot on the lock of the other spaces says a message came here while closed (SpaceData.sign, lib/unread-signs.ts).
  const [sign, setSign] = useState(false);
  const [allowed, setAllowed] = useState(backgroundState);
  const [battery, setBattery] = useState<BatteryMode>('normal');
  // Whether Erevos starts by itself as the phone turns on (lib/background.ts): the phone's choice, on until turned off.
  const [boot, setBoot] = useState(loadBootStart);

  useEffect(() => {
    loadBatteryMode().then(setBattery);
    loadRingInBackground().then(setOn);
    loadMessageNotices().then(setNotices);
    doorIsOpen().then(setDoor, () => setDoor(false));
    loadCurrentSpaceData().then(
      (data) => setSign(data.sign),
      () => undefined,
    );
    // Back from Android's settings: what it allows now.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setAllowed(backgroundState());
    });
    return () => subscription.remove();
  }, []);

  function choose(next: boolean) {
    setOn(next);
    void saveRingInBackground(next).then(() => setAllowed(backgroundState()));
  }

  function chooseBattery(next: BatteryMode) {
    setBattery(next);
    void saveBatteryMode(next);
  }

  function chooseNotices(next: boolean) {
    setNotices(next);
    void saveMessageNotices(next).then(() => setAllowed(backgroundState()));
  }

  function chooseBoot(next: boolean) {
    saveBootStart(next);
    setBoot(loadBootStart());
  }

  function chooseDoor(next: boolean) {
    setDoorSaid('');
    setDoorOpen(next).then(
      () => setDoor(next),
      (error: unknown) => setDoorSaid(error instanceof Error ? error.message : String(error)),
    );
  }

  // The door says it too, so the other spaces read it while this one is closed.
  function chooseSign(next: boolean) {
    setSign(next);
    const { space, key } = currentSpace();
    updateCurrentSpaceData({ sign: next })
      .then(() => followDoor(space, key))
      .catch((error: unknown) => {
        setSign(!next);
        setDoorSaid(error instanceof Error ? error.message : String(error));
      });
  }

  if (on === null) return null;
  return (
    <>
      {titled ? <SectionTitle title={t('In the background')} /> : null}
      <Row wrap>
        <Chip label={t('Receive and ring')} selected={on} onPress={() => choose(true)} />
        <Chip label={t('Only while Erevos shows')} selected={!on} onPress={() => choose(false)} />
      </Row>
      <Row wrap>
        <Chip label={t('Say a message came')} selected={notices} onPress={() => chooseNotices(true)} />
        <Chip label={t('No notice')} selected={!notices} onPress={() => chooseNotices(false)} />
      </Row>
      {on && canRingInBackground ? (
        <>
          <Row wrap>
            <Chip label={t('Only the waste')} selected={battery === 'normal'} onPress={() => chooseBattery('normal')} />
            <Chip label={t('And nearby phones')} selected={battery === 'nearby'} onPress={() => chooseBattery('nearby')} />
            <Chip label={t('And light sleep')} selected={battery === 'light'} onPress={() => chooseBattery('light')} />
            <Chip label={t('And sleep')} selected={battery === 'sleep'} onPress={() => chooseBattery('sleep')} />
          </Row>
          <Text variant="caption" tone="muted" style={hint}>
            {battery === 'normal'
              ? t('Erevos spares the battery only where nothing is lost: it waits at your relay for all its queues at once, asks nothing again after an empty wait, and keeps the links to phones nearby quieter.')
              : battery === 'nearby'
                ? t('Also, while Erevos is in the background, the radios for phones nearby (Bluetooth, Wi-Fi Aware, Wi-Fi Direct and the same Wi-Fi) are off: a phone nearby reaches you only while Erevos shows. Through your relay all comes as before.')
                : battery === 'light'
                  ? t('And the phone may sleep while Erevos is in the background, with its wait at your relay left open: what comes there wakes the phone, so a message or a call still comes at once where the network and Android allow it, and Erevos looks by itself every few minutes besides. New, and not tried on many phones yet: if messages come late, choose another. The radios for phones nearby are off, as with the one before.')
                  : t('And the phone may sleep while Erevos is in the background: Erevos looks at your relay about once a minute, so a message or a call can be a minute or two late, and later where Android holds back sleeping apps, unless Keep running on battery is allowed. The radios for phones nearby are off, as with the one before.')}
          </Text>
        </>
      ) : null}
      {on && notices && door !== null ? (
        <>
          <Row wrap>
            <Chip label={t('This space only while open')} selected={!door} onPress={() => chooseDoor(false)} />
            <Chip label={t('Also while another space is open')} selected={door} onPress={() => chooseDoor(true)} />
          </Row>
          <Text variant="caption" tone="muted" style={hint}>
            {doorSaid ||
              (door
                ? t('While another space is open, this one says only "New message", as that one does, never which space; its hidden chats say nothing then. For it the phone keeps the addresses of its queues at its relay outside its password, including the queue each contact writes to, for up to 64 contacts, never its keys, who its contacts are, or its messages, and its relay may tell that the two spaces are on one phone. If this space goes through Tor (Messages or Everything), it is asked about only through Tor: while the open space has Tor off, or its Tor is starting or has just failed, this one says nothing, and what came is told once Tor is ready there.')
                : t('Closed, this space receives nothing: its messages wait at its relay and come when it opens.'))}
          </Text>
          {door ? (
            <>
              <Row wrap>
                <Chip label={t('Dot in the other spaces')} selected={sign} onPress={() => chooseSign(true)} />
                <Chip label={t('No dot')} selected={!sign} onPress={() => chooseSign(false)} />
              </Row>
              <Text variant="caption" tone="muted" style={hint}>
                {sign
                  ? t('When a message comes here while another space is open, a small dot shows on the padlock at the top of that space\'s chats, until you open this one: never how many, nor which space. Whoever sees those chats sees the dot too, and may guess there is another space.')
                  : t('The other spaces show no sign of this one: only the notice says a message came.')}
              </Text>
            </>
          ) : null}
        </>
      ) : null}
      {/* Where Erevos receives in the background it starts by itself, until turned off here (lib/boot-choice.ts). */}
      {on && canStartAtBoot ? (
        <>
          <Row wrap>
            <Chip label={t('Start when the phone turns on')} selected={boot} onPress={() => chooseBoot(true)} />
            <Chip label={t('Wait until I open it')} selected={!boot} onPress={() => chooseBoot(false)} />
          </Row>
          <Text variant="caption" tone="muted" style={hint}>
            {!boot
              ? t('After the phone turns on, Erevos waits until you open it.')
              : notices
                ? t('After the phone turns on, or Erevos is updated, Erevos starts by itself, with no space open: the spaces set to say a message came also while another is open already say "New message", never which space, nor who or what. Everything else waits for a password, as Erevos keeps no key on the phone. Meanwhile a quiet notice says "Locked". Spaces that go through Tor say nothing until a space is open. With no such space, only a quiet notice says it is locked, and a tap on it opens Erevos.')
                : t('After the phone turns on, or Erevos is updated, Erevos starts by itself, with no space open, and a quiet notice says it is locked: a tap on it opens Erevos. Nothing comes until a space is open.')}
          </Text>
        </>
      ) : null}
      <Card>
        <Text variant="caption" tone="muted" style={hint}>
          {on
            ? t('While a space is open, Erevos keeps running in the background: it waits at the relay and on the links to phones nearby, so messages come and a call rings with the phone\'s ringtone, over the lock screen too. Only that space\'s chats and groups, and hidden chats with Receive while closed on; other hidden chats only say that a message came, or ring with no name, if you let them. The notices never say who or what: "Erevos" while it receives, "Incoming call" or "Incoming video call" when one rings, and "New message" or how many came; on a locked phone the one for messages says only "Erevos". Swiped away from the recent apps, it goes on the same; stopped by Android, it takes nothing and cannot ring.')
            : t('Messages come, and a call rings, only while Erevos shows. A call shows as missed once you open Erevos.')}
        </Text>
        {/* The notice for messages and their sound while Erevos shows need it with the receiving off too. */}
        {(on || notices) && allowed && !allowed.notices ? (
          <Text variant="caption" tone="muted" style={hint}>
            {t("Notices are off for Erevos in Android's settings: calls still ring, with no notice to tap, and no notice says a message came.")}
          </Text>
        ) : null}
        {on && allowed && (!allowed.battery || !allowed.fullScreen) ? (
          <Row wrap>
            {!allowed.battery ? <Button title={t('Keep running on battery')} kind="secondary" compact onPress={askBattery} /> : null}
            {!allowed.fullScreen ? <Button title={t('Show calls over the lock screen')} kind="secondary" compact onPress={askFullScreen} /> : null}
          </Row>
        ) : null}
        {on && allowed && !allowed.battery ? (
          <Text variant="caption" tone="muted" style={hint}>
            {t("Without it, Android's battery saving may stop Erevos after a while in the background.")}
          </Text>
        ) : null}
        {on || (notices && allowed && !allowed.notices) ? (
          <Row wrap>
            <Button title={t('All permissions')} kind="ghost" compact onPress={() => router.push('/permissions')} />
          </Row>
        ) : null}
      </Card>
    </>
  );
}

// The number on Erevos's icon (lib/icon-number.ts), on this device: the web app's, with
// notifications while closed, or on Android the one the launcher draws from the messages notice
// (lib/background.ts); and on Huawei's and Honor's launchers, which take a number for each icon,
// each icon's own (modules/erevos-widget, IconNumbers.kt).
function IconNumberChoice({ titled }: { titled: boolean }) {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    iconNumberOn().then(setOn);
  }, []);

  function choose(next: boolean) {
    setOn(next);
    void setIconNumberOn(next);
  }

  if (on === null) return null;
  return (
    <>
      {titled ? <SectionTitle title={t('Number on the icon')} /> : null}
      <Row wrap>
        <Chip label={t('Show the number')} selected={on} onPress={() => choose(true)} />
        <Chip label={t('No number')} selected={!on} onPress={() => choose(false)} />
      </Row>
      <Card>
        <Text variant="caption" tone="muted" style={hint}>
          {canRingInBackground
            ? on
              ? t("When you leave Erevos with messages not read in the open space's chats and groups, a notice without sound says how many, and counts on with those it tells of after, until you read them. Muted chats and hidden ones are not counted as you leave. The phone's launcher shows it on Erevos's icon: as a number, or on some phones, such as Pixels, as a dot. Only with Say a message came, under In the background. For every space on this phone.")
              : t("Erevos's icon keeps no number of its own: the launcher shows one only while the notice tells of messages that came since you last had Erevos open.")
            : on
              ? t("Where the browser can show it (an iPhone's or iPad's home screen, a Mac's Dock, Chrome or Edge installed on a computer), Erevos's icon shows how many messages the space you had open has not read, and those that came since, never a hidden chat's. Only for a space with notifications while closed on. The number stays while Erevos is closed: one that does not match the space you open may hint at another. For every space on this device.")
              : t("Erevos's icon shows no number.")}
        </Text>
        {canRingInBackground ? (
          <Text variant="caption" tone="muted" style={hint}>
            {t(
              "With Show the number, Huawei's and Honor's launchers put a number on each of Erevos's icons apart: on Erevos's own the messages its notice counts, on SMS's the SMS not read, on Phone's the missed calls, on Contacts's a birthday today. Other launchers, such as those of Pixel and GrapheneOS, Samsung's, Xiaomi's and Kvaesitso, show each notice of Erevos on all its icons alike: Android gives it to the app, not to one of its icons, and Erevos cannot change that.",
            )}
          </Text>
        ) : null}
      </Card>
    </>
  );
}

// Hints read better a little larger and looser than captions.
const hint = { fontSize: 14, lineHeight: 20 };
