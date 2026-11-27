// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Share, View } from 'react-native';

import { QrCode } from '../components/QrCode';
import { QuickFromComputer, QuickToPhone } from '../components/quick-link';
import { RelaySignIn } from '../components/relay-signin';
import { Button, Card, Chip, Field, Input, Page, Row, SectionTitle, Text, TextButton, Toggle } from '../components/ui';
import { ask } from '../lib/alert';
import { GroupsHeldError, onLinked, placeLinks, spaceLinks, type AccountsHere, type AgainInfo, type AskedHere, type DeviceInfo, type HistoryChoice, type Links } from '../lib/devices';
import { tap } from '../lib/haptics';
import { enterHiddenScreen, useOpenHiddenPlace } from '../lib/hidden-contacts';
import { mark, t } from '../lib/i18n';
import { checkLinkCode, linkCodeLink } from '../lib/link-code';
import { canQuickLink } from '../lib/link-nostr';
import { checkQuick, type QuickCode } from '../lib/link-quick';
import { matrixWaiting } from '../lib/linked-accounts';
import { placeChanged } from '../lib/receiver';
import { createQueue, toHex } from '../lib/relay';
import { ownToken } from '../lib/relay-signin';
import { SHELL } from '../lib/shell';
import { setSettingsShared, settingsShared } from '../lib/sync/settings';
import { START_RELAY } from '../lib/welcome';
import { loadCurrentSpaceData, loadHiddenData, updateCurrentSpaceData } from '../lock/space-data';
import { space } from '../theme/colors';

// Settings → Data and devices → Linked devices (lib/devices.ts, docs/linked-devices.md). On a computer or in a browser:
// Link to my phone shows a code for the phone to read, then the code both show, to compare. On the
// phone: the code read (the camera opens erevos://link?... here, see app/link.tsx) or pasted, the
// code to compare, what of the history goes, and Link; then the devices linked, each with Unlink.
// Nothing goes anywhere until Link is tapped on the phone, and the chats only once They match is
// tapped on the computer. On a computer or in a browser Link to my phone comes first, with LPHL's
// relay filled in and its sign-in under the token, so a token never has to be copied over. The
// space's Matrix, XMPP and Nostr accounts go with every link, follow as they change, or go again
// with Send the accounts (lib/linked-accounts.ts); the linked device says which it has from the phone, and asks
// for the Matrix sign-in when the homeserver gave no token for it.
//
// On a phone a backup was put back on, From the backup lists the devices of the phone it was made
// on: Ask to link again asks one, which shows the ask, and links to this phone once Link again is
// tapped there, keeping its chats (lib/link-again.ts). Nothing is asked until it is tapped here, and
// nothing links until it is tapped there too.
//
// Opened from hidden chats (`hidden=1`, or a code the camera opened while they are open beneath,
// app/link.tsx) it is theirs: the place's own links (lib/devices.ts, placeLinks), its own accounts,
// and nothing once they close (lib/hidden-contacts.ts). The phone answers on the place's own relay
// queue, made in the hidden chats under For advanced users, which keep it themselves (app/chat.tsx),
// so this screen makes none for them.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];
const DAY = 24 * 3600 * 1000;
type Period = 'all' | 'month' | 'week' | 'none';
const PERIODS: { period: Period; label: string }[] = [
  { period: 'all', label: mark('All of it') },
  { period: 'month', label: mark('The last month') },
  { period: 'week', label: mark('The last week') },
  { period: 'none', label: mark('None') },
];

function sinceOf(period: Period): number | null {
  if (period === 'none') return null;
  if (period === 'all') return 0;
  return Date.now() - (period === 'month' ? 30 : 7) * DAY;
}

// What a device is called unless it is given a name.
function ownName(): string {
  if (SHELL === 'electron') return t('Computer');
  if (Platform.OS === 'web') return t('Web browser');
  return t('Phone');
}

// A computer or a browser, where Link to my phone is what is usually wanted.
const ON_COMPUTER = SHELL === 'electron' || Platform.OS === 'web';

function whenText(ms: number): string {
  return new Date(ms).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Devices() {
  const params = useLocalSearchParams<{ hidden?: string }>();
  return <LinkedDevices hidden={params.hidden === '1'} />;
}

/** Linked devices of the open space, or of the open hidden chats (`hidden`). */
export function LinkedDevices({ hidden }: { hidden: boolean }) {
  const router = useRouter();
  const params = useLocalSearchParams<{ key?: string; id?: string; relay?: string; rk?: string; s?: string; name?: string; n?: string }>();
  const hiddenOpen = useOpenHiddenPlace();
  const place = hidden ? hiddenOpen : null;
  const [links, setLinks] = useState<Links | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [role, setRole] = useState<ReturnType<Links['role']>>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  // On a computer: its relay, when the space has none yet, and the code it shows.
  const [relayUrl, setRelayUrl] = useState('');
  const [relayToken, setRelayToken] = useState('');
  const [hasQueue, setHasQueue] = useState(false);
  const [name, setName] = useState(ownName);
  const [offer, setOffer] = useState<string | null>(null);
  // On the phone: the code read or pasted, what it asks, and what of the history goes.
  const [pasted, setPasted] = useState('');
  const [asked, setAsked] = useState<{ name: string; code: string } | null>(null);
  // On the phone: a computer's short code read (lib/link-quick.ts); on a computer: the way before
  // it, with the relay typed, chosen or fallen back to.
  const [quick, setQuick] = useState<QuickCode | null>(null);
  const [another, setAnother] = useState(false);
  const [period, setPeriod] = useState<Period>('all');
  const [files, setFiles] = useState(true);
  const [again, setAgain] = useState<string | null>(null);
  // Whether this device has the same settings as the account's other devices (lib/sync/settings.ts).
  const [shared, setShared] = useState(settingsShared);
  const [copied, setCopied] = useState(false);
  // On a linked device: the accounts from the phone.
  const [here, setHere] = useState<AccountsHere | null>(null);
  // Where the groups are held (docs/sync.md, S6), and where they go while they move.
  const [holder, setHolder] = useState<ReturnType<Links['groupsHolder']>>({ on: null, to: undefined, can: [], problem: null });
  // On a phone a backup was put back on: the devices of the phone it was made on. On a linked device:
  // its phone, put back from a backup, asking it to link again.
  const [back, setBack] = useState<AgainInfo[]>([]);
  const [asking, setAsking] = useState<AskedHere | null>(null);

  const refresh = (l: Links) => {
    setDevices(l.devices());
    setRole(l.role());
    setAnswer(l.answerCode());
    setCopied(l.copied());
    setHere(l.accountsHere());
    setHolder(l.groupsHolder());
    setBack(l.fromBackup());
    setAsking(l.askedHere());
    // A code gone meanwhile, as when a phone's space read a place's: Link to my phone starts again.
    if (!l.offered()) setOffer(null);
  };

  useEffect(() => (hidden ? enterHiddenScreen() : undefined), [hidden]);

  useEffect(() => {
    let active = true;
    let stop: () => void = () => undefined;
    setLinks(null);
    if (hidden && !place) return;
    (place ? placeLinks(place.space, place.pocket, place.key) : spaceLinks())
      .then(async (l) => {
        if (!active) return;
        setLinks(l);
        refresh(l);
        stop = onLinked(() => active && refresh(l), place ? { space: place.space, pocket: place.pocket } : null);
        const data = place ? await loadHiddenData(place.space, place.pocket, place.key) : await loadCurrentSpaceData();
        if (!active) return;
        setRelayUrl(data.url || START_RELAY);
        setRelayToken(data.token);
        setHasQueue(!!data.ownQueue);
        const shown = await l.shownOffer().catch(() => null);
        if (active) setOffer(shown);
      })
      .catch((error) => active && setNote(errorText(error)));
    return () => {
      active = false;
      stop();
    };
  }, [hidden, place]);

  // A code the camera opened Erevos with: read at once, but nothing goes until Link is tapped.
  const opened = checkLinkCode(params.key, params.id, params.relay, params.rk ?? '', params.s, params.name ?? '');
  useEffect(() => {
    if (!links || !opened) return;
    void read(linkCodeLink(opened));
  }, [links, params.key]);

  // A computer's short code: the space's only, as hidden chats link with the full code.
  useEffect(() => {
    if (!links || params.key !== undefined) return;
    const short = checkQuick(params.n, params.s, params.name ?? '');
    if (!short) return;
    if (place) setNote(t('Inside hidden chats, link with the code Link to my phone shows inside the same hidden chats on the computer.'));
    else setQuick(short);
  }, [links, params.n]);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    setNote('');
    try {
      await work();
    } catch (error) {
      setNote(errorText(error));
    } finally {
      setBusy(false);
      if (links) refresh(links);
    }
  }

  // ---- On a computer ----

  const showCode = () =>
    run(async () => {
      if (!links) return;
      const url = relayUrl.trim();
      // Hidden chats keep their relay and queue themselves, which the phone answers on.
      if (place && !hasQueue) throw new Error(t('These hidden chats have no server queue yet: in them, type the server address under For advanced users, then create their queue.'));
      if (!/^wss?:\/\/[^\s/?#]+(\/[^\s]*)?$/i.test(url)) throw new Error(t('A server address starts with ws:// or wss://.'));
      // The phone answers on this space's queue, so there has to be one.
      if (!hasQueue) {
        const ids = await createQueue({ url, token: relayToken.trim() || undefined });
        await updateCurrentSpaceData({ url, token: relayToken.trim(), ownQueue: { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) } });
        // Read from at once: the phone answers on it.
        placeChanged();
        setHasQueue(true);
      }
      setOffer(await links.makeOffer(name));
    });

  // Signed in to the relay for a token of this device's own: kept at once with the relay, so the
  // token is not lost when the screen is left before Link to my phone.
  async function signedIn(token: string, who: string) {
    const url = relayUrl.trim();
    setRelayToken(token);
    try {
      await updateCurrentSpaceData({ url, token, ownToken: ownToken(url, token) });
      placeChanged();
      setNote(t('Signed in as {name}: this device has a token of its own there. Now tap Link to my phone.', { name: who }));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  async function copy(text: string) {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
        setNote(place ? t('Code copied. Paste it on the phone, in Linked devices of the same hidden chats.') : t('Code copied. Paste it on the phone in Settings → Data and devices → Linked devices.'));
        return;
      }
      await Share.share({ message: text });
    } catch (error) {
      setNote(errorText(error));
    }
  }

  const confirm = () =>
    run(async () => {
      if (!links || !answer) return;
      await links.confirm(answer);
      setOffer(null);
      setNote(t('Linked. The chats come from the phone, and with them the messages it chose to bring over.'));
    });

  // On a computer linking with the short code: the code to compare came from the phone itself.
  const quickConfirm = async (code: string) => {
    if (!links) return;
    await links.confirm(code);
    setOffer(null);
    setNote(t('Linked. The chats come from the phone, and with them the messages it chose to bring over.'));
    refresh(links);
  };

  // On a computer: back to the way before, with why, and the phone's relay when one came.
  const quickFallback = (why: string, relay?: string) => {
    setAnother(true);
    if (relay) setRelayUrl(relay);
    setNote(t('{why} Link this way instead: sign in to the server below, then tap Link to my phone.', { why }));
  };

  const differ = () =>
    run(async () => {
      if (!links) return;
      await links.refuse();
      setOffer(null);
      setNote(t('Not linked. Someone else may have read the code. Make a new one, and link again.'));
    });

  // ---- On the phone ----

  async function read(text: string) {
    await run(async () => {
      if (!links) return;
      setAsked(await links.prepare(text));
    });
  }

  const link = () =>
    run(async () => {
      if (!links || !asked) return;
      await links.link({ since: sinceOf(period), files }, t('Phone'));
      setAsked(null);
      setPasted('');
      setNote(t('Now the computer shows a code too. If it is {code}, tap They match there.', { code: asked.code }));
    });

  function unlink(device: DeviceInfo) {
    const own = role === 'linked';
    ask(
      own ? t('Unlink this device') : t('Unlink {name}', { name: device.name }),
      own
        ? t("The account's chats leave this device, messages and all, and so do the accounts it brought over from the phone. The phone keeps them.")
        : t('Nothing more goes to it, and nothing it sends is taken. What it has stays on it, behind its own lock.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Unlink'),
          style: 'destructive',
          onPress: () =>
            void run(async () => {
              if (!links) return;
              let told: boolean;
              try {
                told = await links.unlink(device.id);
              } catch (error) {
                // The groups are held there (or here): unlinked all the same only once asked again.
                if (error instanceof GroupsHeldError) return unlinkHolding(device, error.message);
                throw error;
              }
              unlinked(told, own);
            }),
        },
      ],
    );
  }

  function unlinked(told: boolean, own: boolean) {
    setNote(told ? t('Unlinked.') : own ? t('Unlinked here. The phone was not told: unlink this device there too.') : t('Unlinked. The device was not told, and gets nothing more.'));
  }

  // The groups are held on the device unlinked, or on this one: unlinked all the same, they show as
  // left on the phone (a lost device), and go with the account's chats here.
  function unlinkHolding(device: DeviceInfo, why: string) {
    const own = role === 'linked';
    ask(t('Unlink all the same?'), `${why} ${own ? t('Unlinked now, the groups go from this device, and the phone shows each as left.') : t('Unlinked now, this phone shows each of the groups as left, unless they are still on their way to it: those stay here. Do it if the device is lost.')}`, [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Unlink'),
        style: 'destructive',
        onPress: () =>
          void run(async () => {
            if (!links) return;
            unlinked(await links.unlink(device.id, true), own);
          }),
      },
    ]);
  }

  // On a phone a backup was put back on: a device of the phone it was made on, asked to link again, or let go of.
  const askAgain = (device: AgainInfo) =>
    run(async () => {
      if (!links) return;
      await links.askAgain(device.id);
      setNote(t('Asked. On {name}, tap Link again: it links to this phone and keeps its chats.', { name: device.name }));
    });

  function forgetAgain(device: AgainInfo) {
    ask(t('Let go of {name}', { name: device.name }), t('It is asked nothing from this phone. To link it later, link it as the first time.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Let go'),
        style: 'destructive',
        onPress: () =>
          void run(async () => {
            if (links) await links.forgetAgain(device.id);
          }),
      },
    ]);
  }

  // On a linked device: yes, or not now, to its phone asking it to link again.
  const linkAgain = () =>
    run(async () => {
      if (!links) return;
      await links.linkAgain();
      setNote(t('Said yes. Once the phone hears it, this device is linked to it again.'));
    });

  const notAgain = () =>
    run(async () => {
      if (links) await links.notAgain();
    });

  const bringAgain = (id: string) =>
    run(async () => {
      if (!links) return;
      const choice: HistoryChoice = { since: sinceOf(period), files };
      await links.bringAgain(id, choice);
      setAgain(null);
      setNote(t('The messages go to it now. What it has already is not kept twice.'));
    });

  // On the phone: the space's Matrix, XMPP and Nostr accounts to a device linked already, or the hidden chats' own.
  function sendAccounts(device: DeviceInfo) {
    ask(
      t('Send the accounts to {name}', { name: device.name }),
      place
        ? t("These hidden chats' own Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, into the same hidden chats there, and it signs in to each as a new device. Once unlinked, it signs out of them.")
        : t("This space's Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, and it signs in to each as a new device. Once unlinked, it signs out of them."),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Send'),
          onPress: () =>
            void run(async () => {
              if (!links) return;
              const sent = await links.giveAccounts(device.id);
              const names = sent.map((n) => (n === 'matrix' ? 'Matrix' : n === 'xmpp' ? 'XMPP' : 'Nostr')).join(', ');
              const none = place
                ? t('Nothing went: these hidden chats have no Matrix, XMPP or Nostr account of their own, or too much waits for that device already.')
                : t('Nothing went: this space has no Matrix, XMPP or Nostr account, or too much waits for that device already.');
              setNote(sent.length > 0 ? t('Sent to {name}: {accounts}.', { name: device.name, accounts: names }) : none);
            }),
        },
      ],
    );
  }

  const choosing = (
    <>
      <Field label={t('Messages to bring over')}>
        <Row wrap>
          {PERIODS.filter((p) => p.period !== 'none' || !again).map((p) => (
            <Chip key={p.period} label={t(p.label)} selected={period === p.period} onPress={() => setPeriod(p.period)} />
          ))}
        </Row>
      </Field>
      <Row wrap>
        <Chip label={t('Photos and files too')} selected={files} onPress={() => setFiles(!files)} />
      </Row>
    </>
  );

  // On the phone: a computer's code, read or pasted.
  const fromComputer = !asked ? (
    <Card>
      <Text variant="heading">{t('Link a computer to this phone')}</Text>
      <Text tone="muted">
        {place
          ? t('On the computer, open the same hidden chats with their PIN, then Linked devices → Link to my phone in them. Then scan its code with this phone\'s camera while these hidden chats are open, or copy it there and paste it here.')
          : t('On the computer, open Settings → Data and devices → Linked devices → Link to my phone. Then scan its code with this phone\'s camera, or copy it there and paste it here.')}
      </Text>
      <Field label={t('Code from the computer')}>
        <Input value={pasted} onChangeText={setPasted} placeholder="erevos://link?…" autoCapitalize="none" autoCorrect={false} />
      </Field>
      <Button title={t('Next')} kind="secondary" disabled={busy || !pasted.trim()} onPress={() => void read(pasted)} />
    </Card>
  ) : null;

  // On a computer: a relay queue of its own if it has none, then the code for the phone.
  const quickHere = ON_COMPUTER && !place && !another && links !== null && canQuickLink();
  const toPhone = role === null && !asked ? (
    <Card>
      <Text variant="heading">{t('Link to my phone')}</Text>
      {quickHere && links ? (
        <>
          <QuickToPhone links={links} name={name} answer={answer} confirm={quickConfirm} fallback={quickFallback} onNote={setNote} />
          <TextButton title={t('Link another way')} onPress={() => setAnother(true)} />
        </>
      ) : answer ? (
        <>
          <Text tone="muted">{t('The phone read the code. Does it show this one too?')}</Text>
          <Text variant="mono" selectable style={{ fontSize: 20 }}>
            {answer}
          </Text>
          <Button title={t('They match')} disabled={busy} onPress={() => void confirm()} />
          <Button title={t('They differ')} kind="secondary" disabled={busy} onPress={() => void differ()} />
        </>
      ) : offer ? (
        <>
          <Text tone="muted">
            {place
              ? t('On the phone that holds the account, open the same hidden chats with their PIN, then scan this code with the camera, or paste it in Linked devices in them. These hidden chats must have no chats of their own.')
              : t('On the phone that holds the account, scan this code with the camera, or paste it in Settings → Data and devices → Linked devices. This space must have no chats of its own.')}
          </Text>
          <QrCode text={offer} size={240} />
          <Button title={Platform.OS === 'web' ? t('Copy the code') : t('Share the code')} kind="secondary" onPress={() => void copy(offer)} />
          <Text variant="caption" tone="faint">
            {t('Waiting for the phone. The code works for half an hour.')}
          </Text>
        </>
      ) : (
        <>
          <Text tone="muted">
            {place
              ? t('Use this when this device is the computer: these hidden chats become those of the same hidden chats on the phone that holds the account.')
              : t('Use this when this device is the computer: its chats become those of the phone that holds the account.')}
          </Text>
          {copied ? <Text>{t('These chats came from a linked device’s backup: you can read them here, but not write in them. To write, link this device to the phone again, in Linked devices.')}</Text> : null}
          {place && !hasQueue ? <Text>{t('These hidden chats have no server queue yet: in them, type the server address under For advanced users, then create their queue.')}</Text> : null}
          {!hasQueue && !place ? (
            <>
              <Field label={t('Server address')}>
                <Input value={relayUrl} onChangeText={setRelayUrl} placeholder="wss://relay.example" autoCapitalize="none" autoCorrect={false} keyboardType="url" />
              </Field>
              <Field label={t('Token (optional)')}>
                <Input value={relayToken} onChangeText={setRelayToken} placeholder={t('Token, if the server needs one')} autoCapitalize="none" autoCorrect={false} secureTextEntry />
              </Field>
              <RelaySignIn url={relayUrl.trim()} token={relayToken} onToken={(token, who) => void signedIn(token, who)} onNote={setNote} />
              <Text variant="caption" tone="muted">
                {t('The phone answers on a queue of this device on a server: the one the phone uses, or any other. If the server asks for a token, sign in when it offers that, or type one.')}
              </Text>
            </>
          ) : null}
          <Field label={t('Name of this device')}>
            <Input value={name} onChangeText={setName} maxLength={40} />
          </Field>
          <Text variant="caption" tone="muted">
            {t('Tap Link to my phone, and a QR code for the phone shows here.')}
          </Text>
          <Button title={t('Link to my phone')} disabled={busy} onPress={() => void showCode()} />
        </>
      )}
    </Card>
  ) : null;

  async function turnShared() {
    tap();
    const next = !shared;
    setShared(next);
    await setSettingsShared(next);
    // On again: this device takes the account's settings as they are now.
    if (next && links) await links.takeSettings().catch(() => undefined);
  }

  // On the phone: which one device holds the groups' keys, this phone or a linked device.
  const linkedNow = devices.filter((d) => d.linked);
  const moveGroups = (to: string | null) =>
    run(async () => {
      tap();
      if (!links) return;
      await links.moveGroups(to);
      setNote(to === null ? t('The groups come back to this phone once the device that holds them hears it.') : t('The groups go to {name} once it hears it.', { name: linkedNow.find((d) => d.id === to)?.name ?? '' }));
    });
  const holding =
    role === 'primary' && linkedNow.length > 0 ? (
      <Card>
        <Text variant="heading">{t('Groups stay on')}</Text>
        <Row wrap>
          <Chip label={t('This phone')} selected={holder.on === null} onPress={() => void moveGroups(null)} />
          {linkedNow.map((d) => (
            <Chip key={d.id} label={d.name} selected={holder.on === d.id} disabled={!holder.can.includes(d.id) && holder.on !== d.id} onPress={() => void moveGroups(d.id)} />
          ))}
        </Row>
        {holder.to !== undefined ? <Text tone="muted">{t('Moving: both devices have to be on.')}</Text> : null}
        {holder.problem ? <Text>{holder.problem}</Text> : null}
        {linkedNow.some((d) => !holder.can.includes(d.id)) ? <Text variant="caption" tone="muted">{t('A device whose Erevos is older cannot hold them: update it there first.')}</Text> : null}
        <Text variant="caption" tone="muted">
          {t('The keys of the groups are on one device at a time, never copied. There, groups work with the phone off; the other devices write in them through it, so it has to be on. Moving them needs both on, and the server. Public groups stay on the phone.')}
        </Text>
      </Card>
    ) : null;

  // The space's own, never hidden chats': its language, look and last seen, on every device of the account.
  const sharing =
    !place && (role === 'linked' || devices.length > 0) ? (
      <Card>
        <Pressable onPress={() => void turnShared()} accessibilityRole="switch" accessibilityState={{ checked: shared }} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{t('Same settings on every device')}</Text>
            <Text variant="caption" tone="muted">
              {t('The language, the look and Last seen change on the other devices too. A photo behind the screens, passwords, PINs and what is about this device alone stay as they are on each.')}
            </Text>
          </View>
          <Toggle on={shared} />
        </Pressable>
      </Card>
    ) : null;

  if (hidden && !place) {
    return (
      <Page>
        <Text tone="muted">{t('The hidden chats are closed.')}</Text>
      </Page>
    );
  }

  if (role === 'linked') {
    const phone = devices[0];
    const waiting = matrixWaiting(here?.left);
    const notYet = [here?.left.matrix && !waiting ? 'Matrix' : '', here?.left.xmpp ? 'XMPP' : '', here?.left.nostr ? 'Nostr' : ''].filter(Boolean).join(', ');
    const fromPhone = here ? (
      <Card>
        <Text variant="heading">{t('Accounts from the phone')}</Text>
        {here.brought.matrix ? <Text tone="muted">{t('Matrix: {id}, signed in here as a new device.', { id: here.brought.matrix.userId })}</Text> : null}
        {waiting ? (
          <>
            <Text>
              {t('Matrix: sign in to {id} here once, with its password. Its keys come from the phone, so no Security Key or check by emoji is needed.', { id: waiting.userId })}
            </Text>
            <Button title={t('Sign in to Matrix')} kind="secondary" onPress={() => router.push({ pathname: '/matrix', params: { user: waiting.userId, ...(place ? { hidden: '1' } : {}) } })} />
          </>
        ) : null}
        {here.brought.xmpp ? <Text tone="muted">{t('XMPP: {id}, signed in here as a new device.', { id: here.brought.xmpp })}</Text> : null}
        {here.brought.nostr ? <Text tone="muted">{t('Nostr: the key of the Nostr chats is here too.')}</Text> : null}
        {here.left.xmpp || here.left.nostr || (here.left.matrix && !waiting) ? (
          <Text tone="muted">
            {place
              ? t('Not brought over yet: {accounts}. Tried again each time these hidden chats open.', { accounts: notYet })
              : t('Not brought over yet: {accounts}. Tried again each time this space opens.', { accounts: notYet })}
          </Text>
        ) : null}
        {here.problems.map((problem) => (
          <Text key={problem} variant="caption" tone="faint">
            {problem}
          </Text>
        ))}
        <Text variant="caption" tone="faint">
          {t('Once this device is unlinked, it signs out of the accounts it brought over.')}
        </Text>
      </Card>
    ) : null;
    return (
      <Page>
        <Text variant="title">{t('Linked devices')}</Text>
        <Card>
          <Text variant="heading">{t('Linked to {name}', { name: phone?.name || t('Phone') })}</Text>
          {phone ? <Text tone="muted">{t('Since {when}. Last heard from {last}.', { when: whenText(phone.since), last: whenText(phone.heard) })}</Text> : null}
          <Text tone="muted">
            {place
              ? t(
                  'These hidden chats have the chats and groups of the same hidden chats on the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server, with these hidden chats open or receiving while closed there. Calls ring here too. New groups and group calls stay on the phone for now.',
                )
              : t(
                  "This device has the chats and groups of the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server. Calls ring here too. New groups, public groups and group calls stay on the phone for now.",
                )}
          </Text>
          {phone ? <Button title={t('Unlink this device')} kind="danger" disabled={busy} onPress={() => unlink(phone)} /> : null}
        </Card>
        {asking ? (
          <Card>
            <Text variant="heading">{t('{name} asks to link again', { name: asking.name })}</Text>
            <Text tone="muted">
              {t('A backup of the phone was put back on {name}, which asked {when}. If you did that, link this device to it: it keeps its chats and gets what came since, and the phone before gets nothing more from it. If not, tap Not now: it stays linked as it is.', {
                name: asking.name,
                when: whenText(asking.made),
              })}
            </Text>
            {asking.said ? (
              <Text variant="caption" tone="faint">
                {t('Waiting for {name}: it has to be on.', { name: asking.name })}
              </Text>
            ) : (
              <Row wrap>
                <Button title={t('Link again')} disabled={busy} onPress={() => void linkAgain()} />
                <Button title={t('Not now')} kind="secondary" disabled={busy} onPress={() => void notAgain()} />
              </Row>
            )}
          </Card>
        ) : null}
        {holder.on === 'here' ? (
          <Card>
            <Text variant="heading">{t('The groups are held here')}</Text>
            <Text tone="muted">{t('Groups work on this device with the phone off, and you can make new ones here. The phone and the other devices write in them through this one, so it has to be on.')}</Text>
          </Card>
        ) : null}
        {fromPhone}
        {sharing}
        {note ? <Text tone="muted">{note}</Text> : null}
      </Page>
    );
  }

  return (
    <Page>
      <Text variant="title">{t('Linked devices')}</Text>
      <Text tone="muted">
        {place
          ? t(
              'These hidden chats on a computer or in a browser, linked on their own. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Nothing of it shows in the space, nor goes to its linked devices.',
            )
          : t(
              'The same account on a computer or in a browser. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Hidden chats and what a second password opens never go with it: each links on its own, from inside it.',
            )}
      </Text>

      {quick && links && !asked ? (
        <QuickFromComputer
          links={links}
          code={quick}
          history={() => ({ since: sinceOf(period), files })}
          choosing={choosing}
          done={() => {
            setQuick(null);
            refresh(links);
          }}
          onNote={setNote}
        />
      ) : null}

      {asked ? (
        <Card>
          <Text variant="heading">{t('Link {name}', { name: asked.name || t('Computer') })}</Text>
          <Text tone="muted">{t('Once you tap Link, the computer shows this code. Link only if it shows the same:')}</Text>
          <Text variant="mono" selectable style={{ fontSize: 20 }}>
            {asked.code}
          </Text>
          {choosing}
          <Button title={t('Link')} disabled={busy} onPress={() => void link()} />
          <TextButton title={t('Cancel')} onPress={() => setAsked(null)} />
        </Card>
      ) : null}

      {devices.length > 0 ? (
        <>
          <SectionTitle title={t('Devices')} />
          {devices.map((device) => (
            <Card key={device.id}>
              <Text variant="heading">{device.name}</Text>
              <Text tone="muted">
                {device.linked
                  ? device.heard
                    ? t('Linked {when}. Last heard from {last}.', { when: whenText(device.since), last: whenText(device.heard) })
                    : t('Linked {when}.', { when: whenText(device.since) })
                  : t('Waiting for They match to be tapped on it.')}
              </Text>
              {device.history ? <Text variant="caption" tone="faint">{t('Bringing over messages: {n} so far.', { n: device.history.done })}</Text> : null}
              {again === device.id ? (
                <>
                  {choosing}
                  <Button title={t('Bring over')} disabled={busy} onPress={() => void bringAgain(device.id)} />
                  <TextButton title={t('Cancel')} onPress={() => setAgain(null)} />
                </>
              ) : (
                <Row wrap>
                  {device.linked ? <Button title={t('Bring over messages again')} kind="secondary" compact disabled={busy} onPress={() => setAgain(device.id)} /> : null}
                  {device.linked ? <Button title={t('Send the accounts')} kind="secondary" compact disabled={busy} onPress={() => sendAccounts(device)} /> : null}
                  <Button title={t('Unlink')} kind="danger" compact disabled={busy} onPress={() => unlink(device)} />
                </Row>
              )}
            </Card>
          ))}
        </>
      ) : null}

      {back.length > 0 ? (
        <>
          <SectionTitle title={t('From the backup')} />
          <Text tone="muted">
            {t('These devices were linked to the phone this backup was made on. Ask only those that are still yours: each shows the ask, and links to this phone once Link again is tapped on it. It keeps its chats, and gets what came since.')}
          </Text>
          {back.map((device) => (
            <Card key={device.id}>
              <Text variant="heading">{device.name}</Text>
              <Text tone="muted">
                {device.said
                  ? t('It said yes. Linking…')
                  : device.asked
                    ? t('Asked {when}. Waiting for Link again to be tapped on it.', { when: whenText(device.asked) })
                    : device.since
                      ? t('Linked there {when}.', { when: whenText(device.since) })
                      : t('Not asked yet.')}
              </Text>
              <Row wrap>
                <Button title={device.asked ? t('Ask again') : t('Ask to link again')} kind="secondary" compact disabled={busy || device.said} onPress={() => void askAgain(device)} />
                <Button title={t('Let go')} kind="danger" compact disabled={busy} onPress={() => forgetAgain(device)} />
              </Row>
            </Card>
          ))}
        </>
      ) : null}

      {holding}

      {sharing}

      {quick ? null : ON_COMPUTER ? toPhone : fromComputer}
      {quick ? null : ON_COMPUTER ? fromComputer : toPhone}

      {note ? <Text tone="muted">{note}</Text> : null}
    </Page>
  );
}
