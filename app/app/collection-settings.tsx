// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { NextcloudSignIn } from '../components/nextcloud-sign-in';
import { serverTorLine, TorSwitch } from '../components/tor-switch';
import { Button, Card, Field, Input, Page, Row, Text, Toggle } from '../components/ui';
import { fileSize } from '../lib/attachments';
import { cloudLabel, loadCloudBackup } from '../lib/backup-cloud';
import { CAN_CLOUD_BACKUP } from '../lib/backup-place';
import { canTorHttp } from '../lib/core';
import { CAN_DELETE_ORIGINALS, CAN_TAKE_PHOTO } from '../lib/collection-import';
import { useCollectionPlace } from '../lib/collection-place';
import { canPlayThroughTor, PLAY_CHOICES, playsThroughTor, stopOnLockChanged } from '../lib/collection-play';
import { bringBackAll, checkCollectionServer, connectCollectionServer, scheduleServerCopy, serverStatus, testCollectionServer, turnCollectionServer, watchServerStatus, type ServerCheck, type ServerStatus } from '../lib/collection-webdav';
import { tap } from '../lib/haptics';
import { locale, plural, t } from '../lib/i18n';
import { throughTorNow } from '../lib/net-http';
import { cameraOpensLocked, setCameraOpensLocked } from '../lock/camera-drop';
import { FillStoppedError, loadCollection, setCollectionBackup, setCollectionOption, type Collection, type CollectionOption, type CollectionPlace, type CollectionServer } from '../lock/collection-data';
import { useLock } from '../lock/context';
import { currentSpace } from '../lock/keys';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';

// The Collection's settings (Settings → Data and devices → Collection, and from the Collection's
// own menu, where a hidden place's own Collection, `hidden`, has them too), each the place's own
// choice (lock/collection-data.ts): whether it goes into backups; whether a photo or video picked
// from the phone's gallery is deleted there once it is in the Collection, which Android has the
// owner confirm each time (Android 11 and later; before, the switch shows but cannot be turned
// on); and, for its music and videos (lib/collection-play.ts), whether the list playing stops when
// the space locks, and whether Android's notice shows the file's name. In the web build (the desktop
// app, a browser, Sailfish OS) only the backups' choice shows: it has no gallery, and its player always stops when the space locks, with
// no notice (lib/collection-play.ts); the other choices stay kept for the phone.
// Where backups can go to a server, the place's Collection can be copied to a WebDAV server too
// (lib/collection-webdav.ts): its address, user name and password, kept sealed with the place,
// first those of the backups' server if there is one, with how the copying goes (only this
// Collection's files, how much of them is there, when the last copy began and ended, this phone's
// time), a check of what is there, bringing back every file not on this phone, and its own Tor
// switch. The radio and TV lists have one too (components/collection-radio.tsx, collection-tv.tsx),
// for what Erevos asks of their servers; and the stations and channels themselves Play through Tor
// (lib/collection-play.ts), off until turned on, which the Android app with Tor shows: off, they
// play straight, unless the space sends everything through Tor, and Erevos says first that they
// see this phone's internet address.
// And, in a space behind a password, whether Erevos's camera opens without it (lock/camera-drop.ts):
// the phone's own choice, the same in every space, on until turned off; not shown in hidden chats.

const DESK = Platform.OS === 'web';

export default function CollectionSettingsScreen() {
  const colors = useColors();
  const { hidden } = useLocalSearchParams<{ hidden?: string }>();
  const place = useCollectionPlace(hidden === '1');
  const [backup, setBackup] = useState<boolean | null>(null);
  const [options, setOptions] = useState<Pick<Collection, CollectionOption> | null>(null);
  const [note, setNote] = useState('');
  const { passwordLock } = useLock();
  // Whether the camera opens without the password; null until read.
  const [cameraOpen, setCameraOpen] = useState<boolean | null>(null);
  useEffect(() => {
    void cameraOpensLocked().then(setCameraOpen);
  }, []);

  async function turnCamera() {
    if (cameraOpen === null) return;
    tap();
    const next = !cameraOpen;
    setCameraOpen(next);
    try {
      await setCameraOpensLocked(next, currentSpace().key);
    } catch (error) {
      setCameraOpen(!next);
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  useEffect(() => {
    if (!place) {
      setBackup(null);
      setOptions(null);
      return;
    }
    let active = true;
    void loadCollection(place)
      .then((c) => {
        if (!active) return;
        setBackup(c.backup);
        setOptions({
          deleteOriginals: c.deleteOriginals === true,
          exportWhole: c.exportWhole === true,
          stopOnLock: c.stopOnLock === true,
          showTitle: c.showTitle === true,
          devices: c.devices === true,
          showLogos: c.showLogos === true,
          serverTor: c.serverTor === true,
          listsTor: c.listsTor === true,
          playTor: c.playTor === true,
        });
      })
      .catch(() => {
        if (!active) return;
        setBackup(null);
        setOptions(null);
      });
    return () => {
      active = false;
    };
  }, [place]);

  async function turn(option: CollectionOption) {
    if (!place || !options) return;
    tap();
    await turnTo(option, !options[option]);
  }

  async function turnTo(option: CollectionOption, next: boolean) {
    if (!place || !options || options[option] === next) return;
    setOptions({ ...options, [option]: next });
    try {
      await setCollectionOption(place, option, next);
      // A list playing now follows the change at once.
      if (option === 'stopOnLock') stopOnLockChanged(next);
    } catch (error) {
      setOptions({ ...options, [option]: !next });
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  async function turnBackup() {
    if (!place || backup === null) return;
    tap();
    const next = !backup;
    setBackup(next);
    try {
      await setCollectionBackup(place, next);
    } catch (error) {
      setBackup(!next);
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <Page>
      <Text variant="title">{t('Collection')}</Text>
      <Text tone="muted">{t('Photos and files, encrypted. This Collection opens only while its space or hidden place is open.')}</Text>
      {hidden === '1' && !place ? <Text tone="muted">{t('The hidden chats are closed.')}</Text> : null}
      <Card>
        <Pressable onPress={() => void turnBackup()} disabled={backup === null} accessibilityRole="switch" accessibilityState={{ checked: backup === true, disabled: backup === null }} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{t('The Collection goes into the backups')}</Text>
            <Text variant="caption" tone="muted">
              {t('Only this one. It counts for backups made while it is open.')}
            </Text>
          </View>
          <Toggle on={backup === true} />
        </Pressable>
        {note ? (
          <Text variant="caption" color={colors.warning}>
            {note}
          </Text>
        ) : null}
      </Card>
      <Card>
        <Switch
          title={t('On my linked devices too')}
          text={t('The Collection goes to the linked devices of this space or hidden place, and a change made on one goes to all. Small pictures come at once; a file itself on the same Wi-Fi, or when you open it. A file deleted on one is deleted on all.')}
          on={options?.devices === true}
          disabled={!options}
          onPress={() => void turn('devices')}
        />
      </Card>
      {place && CAN_CLOUD_BACKUP ? <ServerCard place={place} tor={options?.serverTor === true} torReady={options !== null} onTor={(on) => void turnTo('serverTor', on)} /> : null}
      {DESK ? null : (
        <Card>
          <Switch
            title={t('Delete the original from the gallery after importing')}
            text={CAN_DELETE_ORIGINALS ? t('Only a photo or video picked from the phone’s files. Android asks you to confirm each time. Photos taken with the camera never go to the gallery.') : t('Android 11 or later is needed for this.')}
            on={CAN_DELETE_ORIGINALS && options?.deleteOriginals === true}
            disabled={!CAN_DELETE_ORIGINALS || !options}
            onPress={() => void turn('deleteOriginals')}
          />
        </Card>
      )}
      {!DESK && CAN_TAKE_PHOTO && passwordLock && hidden !== '1' ? (
        <Card>
          <Switch
            title={t('Open the camera without the password')}
            text={t('With Erevos locked, the camera’s icon opens the camera at once. What it takes is encrypted as it is taken and shows only after the password, in the Collection of the space opened last. Nothing else opens from there. This phone’s choice, the same in every space.')}
            on={cameraOpen === true}
            disabled={cameraOpen === null}
            onPress={() => void turnCamera()}
          />
        </Card>
      ) : null}
      <Card>
        <Switch
          title={t('Photos leave with their place and time')}
          text={t('Off: a JPEG, PNG, WebP or GIF photo saved out of the Collection or opened with another app goes without where and when it was taken and the phone. Inside the Collection every photo keeps them, encrypted. Videos and HEIC photos always go as they are; you are told first when they say where they were taken.')}
          on={options?.exportWhole === true}
          disabled={!options}
          onPress={() => void turn('exportWhole')}
        />
      </Card>
      {PLAY_CHOICES ? (
        <Card>
          <Switch
            title={t('Stop playing when the space locks')}
            text={t('Otherwise music and videos go on after the space locks; on the phone’s lock screen only play, pause, next, previous and stop work.')}
            on={options?.stopOnLock === true}
            disabled={!options}
            onPress={() => void turn('stopOnLock')}
          />
          <Switch
            title={t('Show the title in the notification')}
            text={t('Otherwise the notification and the phone’s lock screen say only “Playing”.')}
            on={options?.showTitle === true}
            disabled={!options}
            onPress={() => void turn('showTitle')}
          />
        </Card>
      ) : null}
      <Card>
        <Switch
          title={t('Show channel logos')}
          text={
            throughTorNow(options?.listsTor === true)
              ? t('In TV, each channel’s logo is fetched from its server through Tor, so it does not see this device’s IP address. Otherwise a TV icon shows.')
              : t('In TV, each channel’s logo is fetched from its server, which then sees this device’s IP address. Otherwise a TV icon shows.')
          }
          on={options?.showLogos === true}
          disabled={!options}
          onPress={() => void turn('showLogos')}
        />
      </Card>
      {options && (options.listsTor || canTorHttp()) ? (
        <Card>
          <Text variant="bodyStrong">{t('Radio and TV lists')}</Text>
          <Text variant="caption" tone="muted">
            {t('What Erevos asks for Radio and TV: the search in Radio Browser, a playlist or TV list fetched by its link, and the channels’ logos.')}
          </Text>
          <TorSwitch on={options.listsTor === true} onChange={(on) => void turnTo('listsTor', on)} said={serverTorLine(options.listsTor === true)} />
        </Card>
      ) : null}
      {options && (options.playTor || canPlayThroughTor()) ? (
        <Card>
          <Switch title={t('Play through Tor')} text={playTorLine(options.playTor === true)} on={options.playTor === true} disabled={!options} onPress={() => void turn('playTor')} />
        </Card>
      ) : null}
    </Page>
  );
}

function Switch({ title, text, on, disabled, onPress }: { title: string; text: string; on: boolean; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="switch" accessibilityState={{ checked: on, disabled }} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, opacity: disabled ? 0.55 : 1 }}>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" tone="muted">
          {text}
        </Text>
      </View>
      <Toggle on={on} />
    </Pressable>
  );
}

/** How the stations and channels play now, with Play through Tor `on` or off, in plain words. */
function playTorLine(on: boolean): string {
  if (on) {
    if (canPlayThroughTor()) return t('Stations and channels play only through Tor, so they do not see this phone’s internet address. It is slower and waits while Tor starts, and TV may stall for a moment.');
    return canTorHttp()
      ? t('Stations and channels play through Tor only on the phone, so with Tor on for them they do not play here.')
      : t('This build of Erevos has no Tor, so with this on, stations and channels do not play.');
  }
  if (playsThroughTor(false)) return t('This space sends everything through Tor, so stations and channels play through Tor too, and do not see this phone’s internet address.');
  return t('Stations and channels play straight and see this phone’s internet address while they play. Erevos says so before the first one plays.');
}

const whenText = (ms: number) => new Date(ms).toLocaleString(locale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
// The time alone when it is of the same day as `since`.
const clockText = (ms: number, since: number) =>
  new Date(ms).toDateString() === new Date(since).toDateString() ? new Date(ms).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }) : whenText(ms);

function statusText(server: CollectionServer, status: ServerStatus | null): string {
  if (status?.running) return t('Copying… {done} of {total}', { done: fileSize(status.done), total: fileSize(status.total) });
  const parts: string[] = [];
  // Only this Collection's files: not the chats' photos, nor anything of a backup.
  if (status && status.total) parts.push(t('Only this Collection’s files, encrypted: {done} of {total} are on the server.', { done: fileSize(status.done), total: fileSize(status.total) }));
  const last = Math.max(status?.last ?? 0, server.last);
  // The last copy of this run, whole: when it began and when it ended.
  if (status?.began && status.last >= status.began && !status.error) parts.push(t('The last copy began {start} and ended {end}.', { start: whenText(status.began), end: clockText(status.last, status.began) }));
  else parts.push(last ? t('Last copied {when}.', { when: whenText(last) }) : t('Not copied yet.'));
  if (status?.error) parts.push(t('It did not go: {error}', { error: status.error }));
  return parts.join(' ');
}

// What a check of the copies on the server found, in words; whether all is there as made.
function checkText(checked: ServerCheck): { text: string; whole: boolean } {
  const when = whenText(checked.at);
  if (checked.error) return { text: t('Checked {when}: {error}', { when, error: checked.error }), whole: false };
  if (checked.missing || checked.damaged)
    return {
      text: t('Checked {when}: of its {pieces} pieces, {missing} are not on the server and {damaged} are not as made. Copy now sends again those this phone has.', { when, pieces: checked.pieces, missing: checked.missing, damaged: checked.damaged }),
      whole: false,
    };
  return {
    text: plural(checked.files, 'Checked {when}: the {pieces} pieces of its {n} file are all on the server, each of its size, and the {read} fetched open with their key.', 'Checked {when}: the {pieces} pieces of its {n} files are all on the server, each of its size, and the {read} fetched open with their key.', { when, pieces: checked.pieces, read: checked.read }),
    whole: true,
  };
}

// The place's server: on or off, its address, user name and password, how the copying goes, and
// its own Tor switch (`tor`, the place's Collection.serverTor), which the test and the sign-in
// with Nextcloud follow too.
function ServerCard({ place, tor, torReady, onTor }: { place: CollectionPlace; tor: boolean; torReady: boolean; onTor: (on: boolean) => void }) {
  const colors = useColors();
  const [server, setServer] = useState<CollectionServer | null | undefined>(undefined);
  const [status, setStatus] = useState<ServerStatus | null>(() => serverStatus(place));
  const [form, setForm] = useState(false);
  const [address, setAddress] = useState('');
  const [user, setUser] = useState('');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  // What the last check found, and how far bringing the files back is (null when it does not run).
  const [checked, setChecked] = useState<ServerCheck | null>(null);
  const [bringing, setBringing] = useState<{ done: number; all: number } | null>(null);
  const [stopBringing, setStopBringing] = useState<AbortController | null>(null);
  const [note, setNoteText] = useState('');
  // Whether the note says the connection works: in the colour of what went well, not of a warning.
  const [works, setWorks] = useState(false);
  const setNote = (text: string) => {
    setNoteText(text);
    setWorks(false);
  };

  useEffect(() => {
    let active = true;
    void loadCollection(place)
      .then((c) => active && setServer(c.server ?? null))
      .catch(() => active && setServer(null));
    setStatus(serverStatus(place));
    setChecked(null);
    const stop = watchServerStatus(place, (next) => active && setStatus(next));
    return () => {
      active = false;
      stop();
    };
  }, [place]);

  // Bringing the files back stops when the screen goes; what came stays.
  useEffect(() => () => stopBringing?.abort(), [stopBringing]);

  async function check() {
    setBusy(true);
    setNote('');
    try {
      setChecked(await checkCollectionServer(place));
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  // Every file not whole on this phone, fetched from the server now.
  async function bringBack() {
    const stop = new AbortController();
    setStopBringing(stop);
    setBusy(true);
    setNote('');
    setBringing({ done: 0, all: 0 });
    try {
      const brought = await bringBackAll(place, { signal: stop.signal, progress: (done, all) => setBringing({ done, all }) });
      if (brought.wanted === 0) setNote(t('All of this Collection’s files are on this phone already.'));
      else {
        setNote(
          [
            plural(brought.came, '{n} file came back from the server.', '{n} files came back from the server.'),
            brought.failed > 0 ? plural(brought.failed, '{n} did not: the server does not have it whole.', '{n} did not: the server does not have them whole.') : '',
          ]
            .filter(Boolean)
            .join(' '),
        );
        setWorks(brought.failed === 0);
      }
    } catch (error) {
      if (!(error instanceof FillStoppedError)) setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBringing(null);
      setStopBringing(null);
      setBusy(false);
    }
  }

  // The form, filled with this place's server, or else the backups' own.
  async function openForm() {
    setNote('');
    if (server) {
      setAddress(server.url);
      setUser(server.user);
      setSecret(server.password);
    } else {
      const cloud = await loadCloudBackup().catch(() => null);
      setAddress(cloud?.url ?? '');
      setUser(cloud?.user ?? '');
      setSecret(cloud?.password ?? '');
    }
    setForm(true);
  }

  async function turn() {
    if (server === undefined || busy) return;
    tap();
    if (!server) return void openForm();
    const next = !server.on;
    setServer({ ...server, on: next });
    try {
      await turnCollectionServer(place, next);
    } catch (error) {
      setServer(server);
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  async function test() {
    setBusy(true);
    setNote('');
    try {
      await testCollectionServer(address, user, secret, tor);
      setNote(t('The connection works.'));
      setWorks(true);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function connect() {
    setBusy(true);
    setNote('');
    try {
      setServer(await connectCollectionServer(place, address, user, secret));
      setForm(false);
      setSecret('');
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  const ready = !!address.trim() && !!user.trim() && !!secret;
  return (
    <Card>
      <Switch title={t('Also on a WebDAV server')} text={t('This Collection’s files are copied, still encrypted, to a folder on a server you choose: Nextcloud, ownCloud or any that speaks WebDAV. The server cannot open them. A phone that lacks a file fetches it from there. Copies go while this space or hidden place is open.')} on={server?.on === true} disabled={server === undefined || busy} onPress={() => void turn()} />
      {server || form ? <TorSwitch on={tor} onChange={onTor} disabled={!torReady || busy} said={serverTorLine(tor)} /> : null}
      {server && !form ? (
        <>
          <Text variant="caption" tone="muted">
            {cloudLabel(server)} · {statusText(server, status)}
          </Text>
          {checked ? (
            <Text variant="caption" color={checkText(checked).whole ? undefined : colors.warning} tone={checkText(checked).whole ? 'muted' : undefined}>
              {checkText(checked).whole ? '✓ ' : '⚠ '}
              {checkText(checked).text}
            </Text>
          ) : null}
          {bringing ? (
            <Text variant="caption" accessibilityLiveRegion="polite">
              {t('Bringing the files back from the server: {done} of {all}…', { done: bringing.done, all: bringing.all })}
            </Text>
          ) : null}
          <Row wrap>
            {server.on ? <Button title={t('Copy now')} kind="secondary" compact onPress={() => scheduleServerCopy(place, 0)} disabled={status?.running === true || busy} /> : null}
            <Button title={busy && !bringing ? t('One moment…') : t('Check')} kind="secondary" compact onPress={() => void check()} disabled={busy} />
            {bringing ? (
              <Button title={t('Cancel')} kind="secondary" compact onPress={() => stopBringing?.abort()} />
            ) : (
              <Button title={t('Bring back the files not on this phone')} kind="secondary" compact onPress={() => void bringBack()} disabled={busy} />
            )}
            <Button title={t('Change the server')} kind="secondary" compact onPress={() => void openForm()} disabled={busy} />
          </Row>
        </>
      ) : null}
      {form ? (
        <>
          <NextcloudSignIn folder="collection" disabled={busy} tor={tor} onSigned={(next) => {
            setAddress(next.url);
            setUser(next.user);
            setSecret(next.password);
          }} />
          <Field label={t('Folder address (WebDAV)')}>
            <Input value={address} onChangeText={setAddress} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="https://" accessibilityLabel={t('Folder address (WebDAV)')} />
          </Field>
          <Field label={t('User name')}>
            <Input value={user} onChangeText={setUser} autoCapitalize="none" autoCorrect={false} accessibilityLabel={t('User name')} />
          </Field>
          <Field label={t('Password')} hint={t("Best an app password made for Erevos alone, in the server's security settings: you can take it back there without changing your own.")}>
            <Input value={secret} onChangeText={setSecret} secureTextEntry autoCapitalize="none" autoCorrect={false} accessibilityLabel={t('Password')} />
          </Field>
          <Row wrap>
            <Button title={busy ? t('One moment…') : t('Connect')} compact loading={busy} onPress={() => void connect()} disabled={busy || !ready} />
            <Button title={t('Test the connection')} kind="secondary" compact onPress={() => void test()} disabled={busy || !ready} />
            <Button title={t('Cancel')} kind="secondary" compact onPress={() => setForm(false)} disabled={busy} />
          </Row>
        </>
      ) : null}
      {note ? (
        <Text variant="caption" color={works ? colors.success : colors.warning}>
          {note}
        </Text>
      ) : null}
    </Card>
  );
}
