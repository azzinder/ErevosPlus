// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { BlockedList } from '../components/chat-rules';
import { MatrixDevices } from '../components/matrix-devices';
import { MatrixFind, MatrixNewChat } from '../components/matrix-find';
import { lineOf } from '../components/matrix-message';
import { MatrixRegister } from '../components/matrix-register';
import { AccountTorChoice } from '../components/account-tor';
import { matrixJoinGate } from '../components/matrix-ip';
import { MatrixVerifyCard } from '../components/matrix-verify-card';
import { OwnPicture } from '../components/network-picture';
import { SayOnlineSwitch, SayTypingSwitch } from '../components/say-typing';
import { pickAvatar } from '../lib/pick-avatar';
import { Button, Card, Chip, Field, Input, Page, Row, SectionTitle, Sheet, Text } from '../components/ui';
import { ask } from '../lib/alert';
import { doorIsOpen } from '../lib/closed-notices';
import { canMatrix } from '../lib/core';
import { lockedChat } from '../lib/chat-protect';
import { t } from '../lib/i18n';
import { matrixInboxRows } from '../lib/inbox';
import { isMatrixId, roomList, shownRoomName, type MatrixRoom, type MatrixState } from '../lib/matrix';
import { refreshIgnored, setIgnored } from '../lib/matrix-rules';
import { sortedRooms } from '../lib/matrix-rooms';
import {
  matrixAct,
  matrixCreateGroup,
  matrixForget,
  matrixJoin,
  matrixLeave,
  matrixNow,
  matrixPushOn,
  matrixRecoveryInfo,
  matrixSetPush,
  matrixSetUpRecovery,
  matrixLoginWays,
  matrixSignIn,
  matrixSsoStart,
  matrixUnlock,
  matrixSetAvatar,
  matrixSetSayOnline,
  matrixSetSayTyping,
  matrixSignOut,
  matrixStartChat,
  matrixTag,
  matrixVerifications,
  matrixVerify,
  onMatrixChange,
  matrixRoomsThroughTor,
  matrixSetTor,
  matrixTorWay,
  runMatrix,
} from '../lib/matrix-store';
import { useNetworkWhere, whereParams } from '../lib/network-place';
import { askReadAll, toRead } from '../lib/read-all';
import { onTorReady } from '../lib/relay';
import { radius, space } from '../theme/colors';
import { useColors } from '../theme/context';

// The space's Matrix account (lib/matrix-store.ts, docs/matrix.md), under Settings → Relay and
// networks → Matrix: signing in, then its chats, invites first, a new chat with a Matrix ID or
// someone found by name in the Matrix server's user directory (components/matrix-find.tsx), a new
// group with a name and the Matrix IDs asked to join it, joining a group by its address, on
// Android whether it tells of messages while the space is closed (lib/matrix-push.ts), and signing
// out. Each chat opens in app/matrix-chat.tsx. Every view says these chats are not anonymous.
// Opened from a hidden place's hidden chats (`hidden=1`) it is that place's own account
// (lib/network-place.ts), and says so; it has no notice while closed.

export default function MatrixScreen() {
  const router = useRouter();
  // `user`: the account the phone gave this linked device, to sign in to (app/devices.tsx).
  const { hidden, user } = useLocalSearchParams<{ hidden?: string; user?: string }>();
  const where = useNetworkWhere(hidden === '1');
  const [now, setNow] = useState(matrixNow(where));
  const [who, setWho] = useState(() => (user && isMatrixId(user) ? user : ''));
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupPeople, setGroupPeople] = useState('');
  const [address, setAddress] = useState('');
  const [optionsFor, setOptionsFor] = useState<string | null>(null);
  const [providers, setProviders] = useState<{ homeserver: string; list: { id: string; name: string }[] } | null>(null);

  useEffect(() => {
    runMatrix();
    setNow(matrixNow(where));
    const stop = onMatrixChange(() => setNow(matrixNow(where)));
    const stopTor = onTorReady(() => setNow(matrixNow(where)));
    return () => {
      stop();
      stopTor();
    };
  }, [where]);

  // Whom the account blocks, as its other apps may have changed it (lib/matrix-rules.ts).
  const signedIn = !!now.state;
  useEffect(() => {
    if (signedIn) void matrixAct(refreshIgnored).catch(() => undefined);
  }, [signedIn, where]);

  if (!canMatrix()) {
    return (
      <Page>
        <Text variant="title">Matrix</Text>
        <Text tone="muted">{t('This build of Erevos has no Matrix yet. It comes with the next build of the app.')}</Text>
      </Page>
    );
  }

  // The browser opens the provider's page, and comes back to Erevos (app/matrix-sso.tsx).
  async function openSso(homeserver: string, idp?: string) {
    setProviders(null);
    await Linking.openURL(matrixSsoStart(homeserver, Linking.createURL('matrix-sso'), idp));
  }

  async function run(work: () => Promise<unknown>) {
    setBusy(true);
    setNote('');
    try {
      await work();
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  // A hidden place's own account says so under the title: it is not the space's.
  const own = where === 'place' ? (
    <Text variant="caption" tone="muted">
      {t('This account is these hidden chats\' own: nothing of it shows outside them.')}
    </Text>
  ) : null;

  const about = (
    <Text tone="muted">
      {t('Chat with people on Matrix, who use Element or another Matrix app. Messages are end-to-end encrypted, but these chats are not anonymous: the Matrix server sees who talks with whom, and when.')}
    </Text>
  );

  // The account's Tor (lib/account-tor.ts), Off unless chosen, before signing in too: the server
  // sees this phone's address only without Tor. A room «Through Tor» makes it Always.
  const tor = <AccountTorChoice network="Matrix" way={matrixTorWay(where)} chatsThroughTor={matrixRoomsThroughTor(where)} onChange={(way) => void run(() => matrixSetTor(way))} />;

  const { loaded, state, problem } = now;
  if (!loaded) {
    return (
      <Page>
        <Text variant="title">Matrix</Text>
        {own}
        {about}
      </Page>
    );
  }

  if (!state) {
    return (
      <Page>
        <Text variant="title">Matrix</Text>
        {own}
        {about}
        <Card>
          <Field label={t('Matrix ID')}>
            <Input value={who} onChangeText={setWho} autoCapitalize="none" autoCorrect={false} placeholder="@name:matrix.org" accessibilityLabel={t('Matrix ID')} />
          </Field>
          <Field label={t('Password')}>
            <Input value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} accessibilityLabel={t('Password')} />
          </Field>
          <Field label={t('Server')} hint={t('Only when it is not the one in your Matrix ID.')}>
            <Input value={server} onChangeText={setServer} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="matrix.org" accessibilityLabel={t('Server')} />
          </Field>
          <Button
            title={busy ? t('Signing in…') : t('Sign in')}
            loading={busy}
            disabled={busy || !isMatrixId(who) || !password}
            onPress={() =>
              void run(async () => {
                await matrixSignIn(who, password, server);
                setPassword('');
              })
            }
          />
          {Platform.OS === 'android' ? (
            <>
              <Button
                title={t('Sign in with single sign-on')}
                kind="secondary"
                disabled={busy || !(server.trim() || isMatrixId(who))}
                onPress={() =>
                  void run(async () => {
                    const ways = await matrixLoginWays(server.trim() || who);
                    if (!ways.sso) throw new Error(t('This Matrix server has no single sign-on: sign in with your password.'));
                    if (ways.sso.length > 1) setProviders({ homeserver: ways.homeserver, list: ways.sso });
                    else await openSso(ways.homeserver, ways.sso[0]?.id);
                  })
                }
              />
              {providers ? (
                <Row wrap>
                  {providers.list.map((p) => (
                    <Chip key={p.id} label={p.name} onPress={() => void run(() => openSso(providers.homeserver, p.id))} />
                  ))}
                </Row>
              ) : null}
              <Text variant="caption" tone="faint">
                {t('Single sign-on opens the browser, to sign in where your Matrix server sends you (matrix.org asks this of new accounts), then comes back here. The browser does not go through Tor: that page sees your address.')}
              </Text>
            </>
          ) : null}
          <Text variant="caption" tone="faint">
            {where === 'place'
              ? t('Erevos signs in as a new device named Erevos, and keeps the sign-in sealed in these hidden chats only.')
              : t('Erevos signs in as a new device named Erevos, and keeps the sign-in sealed in this space only.')}
          </Text>
        </Card>
        <MatrixRegister />
        {tor}
        {note || problem ? <Text tone="muted">{note || problem}</Text> : null}
      </Page>
    );
  }

  // Chats only: the spaces are in Find a group. Favourites first, those of low priority last.
  const rooms = sortedRooms(roomList(state).filter((room) => !room.space));
  // Those of them with messages not read, to read at once (lib/read-all.ts); an invite is answered instead.
  const listed = new Set(rooms.map((room) => `matrix:${room.id}`));
  const unread = toRead(matrixInboxRows(state).filter((row) => listed.has(row.identity)));
  const optionsRoom = optionsFor ? state.rooms[optionsFor] : undefined;
  const openRoom = (id: string) => router.push({ pathname: '/matrix-chat', params: { room: id, ...whereParams(where) } });
  // Checks between this device and another of ours go to-device, without a chat.
  const check = matrixVerifications(where).find((v) => !v.roomId);
  return (
    <Page>
      <Text variant="title">Matrix</Text>
      {own}
      <Text tone="muted">{t('Signed in as {id}', { id: state.userId })}</Text>
      <Text variant="caption" tone="muted">
        {t('Not anonymous: the Matrix server sees who talks with whom, and when.')}
      </Text>
      {tor}
      {check ? <MatrixVerifyCard check={check} name={state.userId} /> : null}
      {!check || check.phase === 'done' || check.phase === 'cancelled' ? (
        <Button title={t('Check this device with another of yours')} kind="secondary" disabled={busy} onPress={() => void run(() => matrixVerify(state.userId))} />
      ) : null}

      <MatrixNewChat
        busy={busy}
        run={run}
        start={async (userId) => {
          const room = await matrixStartChat(userId);
          router.push({ pathname: '/matrix-chat', params: { room: room.id, ...whereParams(where) } });
        }}
      />

      <SectionTitle title={t('New group')} />
      <Card>
        <Input value={groupName} onChangeText={setGroupName} placeholder={t('Name of the group')} accessibilityLabel={t('Name of the group')} />
        <Input
          value={groupPeople}
          onChangeText={setGroupPeople}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          placeholder="@anna:matrix.org @ben:example.org"
          accessibilityLabel={t('Matrix IDs to invite, with spaces between them')}
        />
        <Text variant="caption" tone="muted">
          {t('Encrypted, for those invited only. Everyone in it sees who the others are.')}
        </Text>
        <Row>
          <Button
            title={t('Create')}
            compact
            disabled={busy || !groupName.trim()}
            onPress={() =>
              void run(async () => {
                const room = await matrixCreateGroup(groupName, groupPeople.split(/[\s,;]+/).filter(Boolean));
                setGroupName('');
                setGroupPeople('');
                router.push({ pathname: '/matrix-chat', params: { room: room.id, ...whereParams(where) } });
              })
            }
          />
        </Row>
      </Card>

      <SectionTitle title={t('Join a group')} />
      <Card>
        <Row>
          <Input
            style={{ flex: 1 }}
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="#name:matrix.org"
            accessibilityLabel={t('Address of the group')}
          />
          <Button
            title={t('Join')}
            compact
            disabled={busy || !/^[#!][^\s:]+:[^\s]+$/.test(address.trim())}
            onPress={() =>
              void run(async () => {
                if (!(await matrixJoinGate(address.trim()))) return;
                const id = await matrixJoin(address.trim());
                setAddress('');
                router.push({ pathname: '/matrix-chat', params: { room: id, ...whereParams(where) } });
              })
            }
          />
        </Row>
        <Text variant="caption" tone="muted">
          {t('A public group may not be encrypted: its screen says so. Everyone in it, and the Matrix servers, can then read it.')}
        </Text>
      </Card>

      <MatrixFind state={state} busy={busy} open={openRoom} run={run} />

      <Card>
        <OwnPicture
          network="matrix"
          of={state.avatar}
          busy={busy}
          onPick={() =>
            void run(async () => {
              const bytes = await pickAvatar('photos');
              if (bytes) await matrixSetAvatar({ bytes, mime: 'image/jpeg' });
            })
          }
          onRemove={() => void run(() => matrixSetAvatar(null))}
        />
      </Card>

      <Card>
        <SayTypingSwitch on={!!state.sayTyping} server="Matrix" onChange={(on) => void run(() => matrixSetSayTyping(on))} />
      </Card>

      <Card>
        <SayOnlineSwitch on={!!state.sayOnline} server="Matrix" onChange={(on) => void run(() => matrixSetSayOnline(on))} />
      </Card>

      {state.ignored?.length ? (
        <>
          <SectionTitle title={t('Blocked contacts')} />
          <Card>
            <BlockedList people={state.ignored.map((id) => ({ key: id, name: id }))} onUnblock={(id) => void run(() => matrixAct((s) => setIgnored(s, id, false)))} />
          </Card>
        </>
      ) : null}

      <SectionTitle title={t('Security Key')} />
      <RecoveryCard state={state} />

      <SectionTitle title={t('Devices')} />
      <MatrixDevices userId={state.userId} />

      {Platform.OS === 'android' && where === 'space' ? <ClosedPush busy={busy} run={run} /> : null}

      <SectionTitle title={t('Chats')} />
      {rooms.length === 0 ? <Text tone="muted">{t('No Matrix chats yet.')}</Text> : null}
      {unread.length > 0 ? (
        <Row>
          <Button title={t('Mark all as read')} kind="secondary" compact disabled={busy} onPress={() => askReadAll(ask, unread)} />
        </Row>
      ) : null}
      {rooms.map((room) => (
        <RoomRow
          key={room.id}
          room={room}
          onOpen={() => openRoom(room.id)}
          onMore={() => setOptionsFor(room.id)}
          onJoin={() =>
            void run(async () => {
              if (await matrixJoinGate(room.id)) await matrixJoin(room.id);
            })
          }
          onDecline={() => void run(() => matrixLeave(room.id))}
        />
      ))}

      {note || problem ? <Text tone="muted">{note || problem}</Text> : null}

      <Sheet visible={!!optionsRoom} onClose={() => setOptionsFor(null)} title={optionsRoom ? shownRoomName(optionsRoom) : undefined}>
        <Button
          title={optionsRoom?.tags?.favourite ? t('Not a favourite any more') : t('Make a favourite')}
          kind="secondary"
          onPress={() => {
            const id = optionsFor;
            setOptionsFor(null);
            if (id) void run(() => matrixTag(id, optionsRoom?.tags?.favourite ? null : 'favourite'));
          }}
        />
        <Button
          title={optionsRoom?.tags?.low ? t('Not low priority any more') : t('Low priority')}
          kind="secondary"
          onPress={() => {
            const id = optionsFor;
            setOptionsFor(null);
            if (id) void run(() => matrixTag(id, optionsRoom?.tags?.low ? null : 'low'));
          }}
        />
        <Button
          title={t('Leave and forget')}
          kind="secondary"
          onPress={() => {
            const id = optionsFor;
            setOptionsFor(null);
            if (id) {
              ask(t('Leave and forget this chat?'), t('You leave it, and the Matrix server forgets it for your account, so your other Matrix apps no longer show it either.'), [
                { text: t('Cancel'), style: 'cancel' },
                { text: t('Leave'), style: 'destructive', onPress: () => void run(() => matrixForget(id)) },
              ]);
            }
          }}
        />
      </Sheet>

      <Button
        title={t('Sign out')}
        kind="secondary"
        disabled={busy}
        onPress={() =>
          ask(t('Sign out of Matrix?'), t('This device is taken off your Matrix account, and Erevos forgets its keys. Signing in again makes a new device, which cannot read what came before.'), [
            { text: t('Cancel'), style: 'cancel' },
            { text: t('Sign out'), style: 'destructive', onPress: () => void run(matrixSignOut) },
          ])
        }
      />
    </Page>
  );
}

// Whether the space tells of Matrix messages while it is closed: only while another space is open,
// and only if it says a message came then (Settings → Notifications → In the background), as its
// own chats do (lib/closed-notices.ts), which is said when it does not.
function ClosedPush({ busy, run }: { busy: boolean; run: (work: () => Promise<unknown>) => Promise<void> }) {
  const on = matrixPushOn();
  const [door, setDoor] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    doorIsOpen().then(
      (open) => live && setDoor(open),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [on]);
  return (
    <>
      <SectionTitle title={t('While this space is closed')} />
      <Card>
        <Row wrap>
          <Chip label={t('Say a message came')} selected={on} onPress={() => !busy && !on && void run(() => matrixSetPush(true))} />
          <Chip label={t('No notice')} selected={!on} onPress={() => !busy && on && void run(() => matrixSetPush(false))} />
        </Row>
        <Text variant="caption" tone="muted">
          {on
            ? t('While another space is open, this one says "New message" when something comes on Matrix, never what, from whom or in which chat, and a call does not ring. For it the Matrix server tells this space\'s relay of each message, with no words in it: the Matrix server learns the relay\'s address, and the relay when messages come.')
            : t('Closed, this space hears nothing from Matrix: what came shows when it opens.')}
        </Text>
        {on && door === false ? (
          <Text variant="caption" tone="muted">
            {t('This space says nothing while closed for now: choose Also while another space is open under Settings → Notifications → In the background.')}
          </Text>
        ) : null}
      </Card>
    </>
  );
}

function RoomRow({ room, onOpen, onMore, onJoin, onDecline }: { room: MatrixRoom; onOpen: () => void; onMore: () => void; onJoin: () => void; onDecline: () => void }) {
  const colors = useColors();
  // Locked with a PIN of its own (lib/chat-protect.ts): nothing of its messages shows.
  const locked = lockedChat(room);
  const last = locked ? undefined : room.messages.at(-1);
  if (room.invitedBy) {
    return (
      <Card>
        <Text variant="bodyStrong">{room.name}</Text>
        <Text tone="muted">{t('Invited by {name}', { name: room.invitedBy })}</Text>
        <Row wrap>
          <Button title={t('Join')} compact onPress={onJoin} />
          <Button title={t('Decline')} kind="secondary" compact onPress={onDecline} />
        </Row>
      </Card>
    );
  }
  return (
    <Pressable onPress={onOpen} onLongPress={onMore} accessibilityRole="button" accessibilityLabel={shownRoomName(room)} accessibilityHint={t('Hold for more')}>
      <Card>
        <Row>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="bodyStrong" numberOfLines={1}>
              {room.tags?.favourite ? '★ ' : ''}
              {shownRoomName(room)}
            </Text>
            {locked ? (
              <Text tone="muted" numberOfLines={1}>
                {t('Locked with a PIN')}
              </Text>
            ) : null}
            {last ? (
              <Text tone="muted" numberOfLines={1}>
                {last.locked ? t('Locked message') : lineOf(last)}
              </Text>
            ) : null}
          </View>
          {room.unread > 0 ? (
            <View style={{ minWidth: 24, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' }}>
              <Text variant="caption" color={colors.onPrimary}>
                {String(room.unread)}
              </Text>
            </View>
          ) : null}
        </Row>
        {!room.encrypted ? (
          <Text variant="caption" tone="faint" style={{ marginTop: space.xs }}>
            {t('Not encrypted: the Matrix server can read this chat.')}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

// The account's Security Key (lib/matrix-backup.ts): asked for once, to open its cross-signing
// keys and key backup; or, for an account with none, made here for the person to write down.
function RecoveryCard({ state }: { state: MatrixState }) {
  const [info, setInfo] = useState<{ storage: boolean; phrase: boolean } | null>(null);
  const [words, setWords] = useState('');
  const [made, setMade] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const open = !!state.backup && !!state.crossSigning;
  useEffect(() => {
    if (open) return;
    let live = true;
    matrixRecoveryInfo()
      .then((found) => live && setInfo(found))
      .catch((error: unknown) => live && setNote(error instanceof Error ? error.message : String(error)));
    return () => {
      live = false;
    };
  }, [open]);

  async function act(work: () => Promise<void>) {
    setBusy(true);
    setNote('');
    try {
      await work();
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      {made ? (
        <>
          <Text>{t('Your new Security Key:')}</Text>
          <Text selectable variant="bodyStrong" style={{ fontFamily: 'monospace' }}>
            {made}
          </Text>
          <Text tone="muted">{t('Write it down and keep it safe: only it opens your earlier messages on a new device. Erevos does not keep it.')}</Text>
          <Button title={t('I wrote it down')} compact onPress={() => setMade('')} />
        </>
      ) : open ? (
        <Text tone="muted">{t('Key backup is on: earlier messages open with it, and new keys are kept in it.')}</Text>
      ) : !info ? null : info.storage ? (
        <>
          <Text tone="muted">
            {info.phrase
              ? t('Enter your Security Key or Security Phrase, as Element made it: earlier messages open, and your other devices trust this one.')
              : t('Enter your Security Key, as Element made it: earlier messages open, and your other devices trust this one.')}
          </Text>
          <Input value={words} onChangeText={setWords} secureTextEntry autoCapitalize="none" autoCorrect={false} accessibilityLabel={t('Security Key')} />
          <Button
            title={t('Open')}
            compact
            loading={busy}
            disabled={busy || !words.trim()}
            onPress={() =>
              void act(async () => {
                const done = await matrixUnlock(words.trim());
                setWords('');
                setNote(t('Opened. Earlier messages that opened: {n}.', { n: done.opened }));
              })
            }
          />
        </>
      ) : (
        <>
          <Text tone="muted">{t('This account has no Security Key yet. Set one up, so a new device of yours can read earlier messages.')}</Text>
          <Button title={t('Set up a Security Key')} compact loading={busy} disabled={busy} onPress={() => void act(async () => setMade(await matrixSetUpRecovery()))} />
        </>
      )}
      {note ? <Text tone="muted">{note}</Text> : null}
    </Card>
  );
}

