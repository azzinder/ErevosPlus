// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { OwnPicture } from '../components/network-picture';
import { BlockedList } from '../components/chat-rules';
import { XmppAccount } from '../components/xmpp-account';
import { XmppFind } from '../components/xmpp-find';
import { XmppRegister } from '../components/xmpp-register';
import { SayTypingSwitch } from '../components/say-typing';
import { AccountTorChoice } from '../components/account-tor';
import { pickAvatar } from '../lib/pick-avatar';
import { Button, Card, Chip, Field, Input, Page, Row, SectionTitle, Text } from '../components/ui';
import { ask } from '../lib/alert';
import { shownLine } from '../lib/call-lines';
import { doorIsOpen } from '../lib/closed-notices';
import { canTor, canXmpp } from '../lib/core';
import { lockedChat } from '../lib/chat-protect';
import { t } from '../lib/i18n';
import { xmppInboxRows } from '../lib/inbox';
import { useNetworkWhere, whereParams } from '../lib/network-place';
import { askReadAll, toRead } from '../lib/read-all';
import { onTorReady } from '../lib/relay';
import { isXmppId, nameOf, xmppChatList, type XmppChat, type XmppState } from '../lib/xmpp';
import { isSound } from '../lib/xmpp-files';
import type { AccountTor } from '../lib/account-tor';
import { canXmppTor } from '../lib/xmpp-net';
import { fingerprint } from '../lib/xmpp-omemo';
import { onXmppChange, runXmpp, xmppAddContact, xmppBlock, xmppCreateGroup, xmppDecline, xmppDeclineInvite, xmppJoinGroup, xmppNow, xmppPushOn, xmppSetAvatar, xmppSetPush, xmppSetSayTyping, xmppSetTor, xmppSignIn, xmppSignOut, xmppTor } from '../lib/xmpp-store';
import { radius, space } from '../theme/colors';
import { useColors } from '../theme/context';

// The space's XMPP account (lib/xmpp-store.ts, docs/xmpp.md), under Settings → Relay and networks
// → XMPP: signing in, then the people who asked to add the account and the groups that invited it,
// a new chat with an address, a new private group of its contacts, joining a group by its address
// (a channel is not encrypted, and says so), its chats and groups and its contacts, the key of this
// device, and signing out. Each chat and group opens in app/xmpp-chat.tsx. Every view says these
// chats are not anonymous. Opened from a hidden place's hidden chats (`hidden=1`) it is that
// place's own account (lib/network-place.ts), and says so.

export default function XmppScreen() {
  const router = useRouter();
  const { hidden } = useLocalSearchParams<{ hidden?: string }>();
  const where = useNetworkWhere(hidden === '1');
  const [now, setNow] = useState(xmppNow(where));
  const [who, setWho] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('');
  // Before signing in: the new account's Tor choice from the start (lib/account-tor.ts), Off unless chosen.
  const [newTor, setNewTor] = useState<AccountTor>('never');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [newId, setNewId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [groupId, setGroupId] = useState('');
  const [groupPassword, setGroupPassword] = useState('');

  useEffect(() => {
    runXmpp();
    setNow(xmppNow(where));
    const stop = onXmppChange(() => setNow(xmppNow(where)));
    const stopTor = onTorReady(() => setNow(xmppNow(where)));
    return () => {
      stop();
      stopTor();
    };
  }, [where]);

  if (!canXmpp()) {
    return (
      <Page>
        <Text variant="title">XMPP</Text>
        <Text tone="muted">{t('This build of Erevos has no XMPP.')}</Text>
      </Page>
    );
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
      {t('Chat with people on XMPP, who use Conversations, Monal, Gajim, Dino or another XMPP app. Messages are encrypted with OMEMO, but these chats are not anonymous: the XMPP server sees who talks with whom, and when.')}
    </Text>
  );

  // The account's Tor (lib/account-tor.ts): its choice, Off unless chosen, which a chat «Through Tor»
  // makes Always while on; on the web, which has no socket of its own, it says only that it does not.
  const torNow = xmppTor(where);
  const tor = canXmppTor() ? (
    <AccountTorChoice
      network="XMPP"
      way={now.state ? torNow.own : newTor}
      chatsThroughTor={now.state ? torNow.chats : false}
      disabled={busy}
      onChange={(way) => (now.state ? void run(() => xmppSetTor(way)) : setNewTor(way))}
    />
  ) : null;

  const { loaded, state, problem, online } = now;
  if (!loaded) {
    return (
      <Page>
        <Text variant="title">XMPP</Text>
        {own}
        {about}
      </Page>
    );
  }

  if (!state) {
    return (
      <Page>
        <Text variant="title">XMPP</Text>
        {own}
        {about}
        <Card>
          <Field label={t('XMPP address')}>
            <Input value={who} onChangeText={setWho} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="name@example.org" accessibilityLabel={t('XMPP address')} />
          </Field>
          <Field label={t('Password')}>
            <Input value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} accessibilityLabel={t('Password')} />
          </Field>
          <Field label={t('Server')} hint={t('Only when the server is not the one in your address, or cannot be found. A name, name:port or a wss:// address.')}>
            <Input value={server} onChangeText={setServer} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="xmpp.example.org" accessibilityLabel={t('Server')} />
          </Field>
          <Button
            title={busy ? t('Signing in…') : t('Sign in')}
            loading={busy}
            disabled={busy || !isXmppId(who) || !password}
            onPress={() =>
              void run(async () => {
                await xmppSignIn(who.trim(), password, server, newTor);
                setPassword('');
              })
            }
          />
          <Text variant="caption" tone="faint">
            {where === 'place'
              ? t('Erevos signs in as a new device of the account, and keeps the sign-in encrypted in these hidden chats only.')
              : t('Erevos signs in as a new device of the account, and keeps the sign-in encrypted in this space only.')}
          </Text>
        </Card>
        {tor ? <Card>{tor}</Card> : null}
        <XmppRegister tor={newTor} />
        {note || problem ? <Text tone="muted">{note || problem}</Text> : null}
      </Page>
    );
  }

  const chats = xmppChatList(state).filter((chat) => !state.requests.includes(chat.jid));
  // Those with messages not read, to read at once (lib/read-all.ts): not who asks to add the account, nor an invitation.
  const unread = toRead(xmppInboxRows(state));
  const withChat = new Set(chats.map((chat) => chat.jid));
  const roster = Object.values(state.roster)
    .filter((c) => c.subscription !== 'remove')
    .sort((a, b) => nameOf(state, a.jid).localeCompare(nameOf(state, b.jid)));
  const contacts = roster.filter((c) => !withChat.has(c.jid));
  const open = (jid: string) => router.push({ pathname: '/xmpp-chat', params: { jid, ...whereParams(where) } });
  const toggle = (jid: string) => setPicked((now) => (now.includes(jid) ? now.filter((j) => j !== jid) : [...now, jid]));
  return (
    <Page>
      <Text variant="title">XMPP</Text>
      {own}
      <Text tone="muted">{t('Signed in as {id}', { id: state.jid })}</Text>
      <Text variant="caption" tone="muted">
        {online ? t('Connected.') : problem ? problem : t('Connecting…')}
      </Text>
      <Text variant="caption" tone="muted">
        {t('Not anonymous: the XMPP server sees who talks with whom, and when.')}
      </Text>

      {state.requests.length ? <SectionTitle title={t('Asks to add you')} /> : null}
      {state.requests.map((jid) => (
        <Card key={jid}>
          <Text variant="bodyStrong">{nameOf(state, jid)}</Text>
          <Text variant="caption" tone="muted">
            {jid}
          </Text>
          <Row wrap>
            <Button title={t('Accept')} compact disabled={busy} onPress={() => void run(() => xmppAddContact(jid))} />
            <Button title={t('Decline')} kind="secondary" compact disabled={busy} onPress={() => void run(() => xmppDecline(jid))} />
          </Row>
        </Card>
      ))}

      {state.invites?.length ? <SectionTitle title={t('Invitations to groups')} /> : null}
      {(state.invites ?? []).map((invite) => (
        <Card key={invite.room}>
          <Text variant="bodyStrong">{nameOf(state, invite.room)}</Text>
          <Text variant="caption" tone="muted">
            {invite.room}
          </Text>
          <Text tone="muted">{t('{name} invites you to a group', { name: nameOf(state, invite.from) })}</Text>
          {invite.reason ? <Text>{invite.reason}</Text> : null}
          <Row wrap>
            <Button
              title={t('Join')}
              compact
              disabled={busy}
              onPress={() =>
                void run(async () => {
                  open(await xmppJoinGroup(invite.room));
                })
              }
            />
            <Button title={t('Decline')} kind="secondary" compact disabled={busy} onPress={() => void run(() => xmppDeclineInvite(invite.room))} />
          </Row>
        </Card>
      ))}

      <SectionTitle title={t('New chat')} />
      <Card>
        <Row>
          <Input
            style={{ flex: 1 }}
            value={newId}
            onChangeText={setNewId}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="name@example.org"
            accessibilityLabel={t('XMPP address')}
          />
          <Button
            title={t('Start')}
            compact
            disabled={busy || !isXmppId(newId)}
            onPress={() =>
              void run(async () => {
                const jid = newId.trim().toLowerCase();
                await xmppAddContact(jid);
                setNewId('');
                open(jid);
              })
            }
          />
        </Row>
        <Text variant="caption" tone="faint">
          {t('They are added to your contacts and asked if you may see when they are online.')}
        </Text>
      </Card>

      <SectionTitle title={t('New group')} />
      <Card>
        <Input value={groupName} onChangeText={setGroupName} maxLength={100} placeholder={t('Group name')} accessibilityLabel={t('Group name')} />
        {roster.length ? (
          <Field label={t('Contacts')}>
            <Row wrap>
              {roster.map((contact) => (
                <Chip key={contact.jid} label={nameOf(state, contact.jid)} selected={picked.includes(contact.jid)} onPress={() => toggle(contact.jid)} />
              ))}
            </Row>
          </Field>
        ) : (
          <Text tone="muted">{t('No contacts yet.')}</Text>
        )}
        <Button
          title={t('Make the group')}
          compact
          disabled={busy || !groupName.trim()}
          onPress={() =>
            void run(async () => {
              const jid = await xmppCreateGroup(groupName, picked);
              setGroupName('');
              setPicked([]);
              open(jid);
            })
          }
        />
        <Text variant="caption" tone="faint">
          {t("Makes a private group on your XMPP server, encrypted with OMEMO for every member, as Conversations' private groups are.")}
        </Text>
      </Card>

      <SectionTitle title={t('Join a group')} />
      <Card>
        <Row>
          <Input
            style={{ flex: 1 }}
            value={groupId}
            onChangeText={setGroupId}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="name@conference.example.org"
            accessibilityLabel={t('Group address')}
          />
          <Button
            title={t('Join')}
            compact
            disabled={busy || !isXmppId(groupId)}
            onPress={() =>
              void run(async () => {
                const jid = await xmppJoinGroup(groupId, groupPassword.trim() || undefined);
                setGroupId('');
                setGroupPassword('');
                open(jid);
              })
            }
          />
        </Row>
        <Input
          value={groupPassword}
          onChangeText={setGroupPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t('Password, if the group asks for one')}
          accessibilityLabel={t('Password, if the group asks for one')}
        />
        <Text variant="caption" tone="faint">
          {t('A group that is not private, a channel, is not encrypted: everyone in it, and the servers, can read it.')}
        </Text>
      </Card>

      <XmppFind
        busy={busy}
        join={(jid) =>
          void run(async () => {
            open(await xmppJoinGroup(jid));
          })
        }
      />

      <SectionTitle title={t('Chats')} />
      {chats.length === 0 ? <Text tone="muted">{t('No XMPP chats yet.')}</Text> : null}
      {unread.length > 0 ? (
        <Row>
          <Button title={t('Mark all as read')} kind="secondary" compact disabled={busy} onPress={() => askReadAll(ask, unread)} />
        </Row>
      ) : null}
      {chats.map((chat) => (
        <ChatCard key={chat.jid} state={state} chat={chat} onOpen={() => open(chat.jid)} />
      ))}

      {contacts.length ? <SectionTitle title={t('Contacts')} /> : null}
      {contacts.map((contact) => (
        <Pressable key={contact.jid} onPress={() => open(contact.jid)} accessibilityRole="button" accessibilityLabel={nameOf(state, contact.jid)}>
          <Card>
            <Text variant="bodyStrong" numberOfLines={1}>
              {nameOf(state, contact.jid)}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {contact.jid}
            </Text>
          </Card>
        </Pressable>
      ))}

      <Card>
        <OwnPicture
          network="xmpp"
          of={state.avatars?.[state.jid] ? state.jid : undefined}
          busy={busy}
          onPick={() =>
            void run(async () => {
              const bytes = await pickAvatar('photos');
              if (bytes) await xmppSetAvatar({ bytes, type: 'image/jpeg' });
            })
          }
          onRemove={() => void run(() => xmppSetAvatar(null))}
        />
      </Card>

      <Card>
        <SayTypingSwitch on={!!state.sayTyping} server="XMPP" onChange={(on) => void run(() => xmppSetSayTyping(on))} />
      </Card>

      {tor ? <Card>{tor}</Card> : null}

      {state.blocked?.length ? (
        <>
          <SectionTitle title={t('Blocked contacts')} />
          <Card>
            <BlockedList people={state.blocked.map((jid) => ({ key: jid, name: nameOf(state, jid) === jid ? jid : `${nameOf(state, jid)} · ${jid}` }))} onUnblock={(jid) => void run(() => xmppBlock(jid, false))} />
          </Card>
        </>
      ) : null}

      {Platform.OS === 'android' && where === 'space' ? <ClosedPush busy={busy} run={run} /> : null}

      <SectionTitle title={t('This device')} />
      <Card>
        <Text tone="muted">{t('The OMEMO key of this device. The people you write to can compare it with what their app shows.')}</Text>
        <Text selectable variant="bodyStrong" style={{ fontFamily: 'monospace' }}>
          {fingerprint(state.omemo.identity.public)}
        </Text>
        {state.omemo2 ? (
          <>
            <Text variant="caption" tone="muted">
              {t('OMEMO 2, as Kaidan shows it.')}
            </Text>
            <Text selectable variant="bodyStrong" style={{ fontFamily: 'monospace' }}>
              {fingerprint(state.omemo2.ik)}
            </Text>
          </>
        ) : null}
      </Card>

      <SectionTitle title={t('Account')} />
      <XmppAccount jid={state.jid} busy={busy} />

      {note ? <Text tone="muted">{note}</Text> : null}

      <Button
        title={t('Sign out')}
        kind="secondary"
        disabled={busy}
        onPress={() =>
          ask(t('Sign out of XMPP?'), t('This device is taken off your XMPP account, and Erevos forgets its keys and the chats kept here. Signing in again makes a new device, which cannot read what came before.'), [
            { text: t('Cancel'), style: 'cancel' },
            { text: t('Sign out'), style: 'destructive', onPress: () => void run(xmppSignOut) },
          ])
        }
      />
    </Page>
  );
}

function ChatCard({ state, chat, onOpen }: { state: XmppState; chat: XmppChat; onOpen: () => void }) {
  const colors = useColors();
  // Locked with a PIN of its own (lib/chat-protect.ts): nothing of its messages shows.
  const locked = lockedChat(chat);
  const last = locked ? undefined : chat.messages.at(-1);
  const said = !last
    ? ''
    : last.locked
      ? t('Locked message')
      : last.call
        ? shownLine(last.text)
        : last.file
          ? last.file.type.startsWith('image/')
            ? t('Photo')
            : isSound(last.file)
              ? t('Voice message')
              : t('File: {name}', { name: last.file.name })
          : /^geo:\S+$/i.test(last.text.trim())
            ? `📍 ${t('Location')}`
            : last.text;
  return (
    <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={nameOf(state, chat.jid)}>
      <Card>
        <Row>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="bodyStrong" numberOfLines={1}>
              {nameOf(state, chat.jid)}
            </Text>
            {locked ? (
              <Text tone="muted" numberOfLines={1}>
                {t('Locked with a PIN')}
              </Text>
            ) : null}
            {last ? (
              <Text tone="muted" numberOfLines={1}>
                {chat.room && !last.mine && last.by ? `${last.by}: ${said}` : said}
              </Text>
            ) : null}
          </View>
          {chat.unread > 0 ? (
            <View style={{ minWidth: 24, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' }}>
              <Text variant="caption" color={colors.onPrimary}>
                {String(chat.unread)}
              </Text>
            </View>
          ) : null}
        </Row>
        {chat.room ? (
          <Text variant="caption" tone="faint" style={{ marginTop: space.xs }}>
            {chat.room.private ? t('Private group') : t('Channel, not encrypted')}
          </Text>
        ) : null}
        {chat.plain ? (
          <Text variant="caption" tone="faint" style={{ marginTop: space.xs }}>
            {t('Written without encryption: the XMPP server can read this chat.')}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

// Whether the space tells of XMPP messages while it is closed: only while another space is open,
// and only if it says a message came then (Settings → Notifications → In the background), as its
// own chats do (lib/closed-notices.ts), which is said when it does not.
function ClosedPush({ busy, run }: { busy: boolean; run: (work: () => Promise<unknown>) => Promise<void> }) {
  const on = xmppPushOn();
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
          <Chip label={t('Say a message came')} selected={on} onPress={() => !busy && !on && void run(() => xmppSetPush(true))} />
          <Chip label={t('No notice')} selected={!on} onPress={() => !busy && on && void run(() => xmppSetPush(false))} />
        </Row>
        <Text variant="caption" tone="muted">
          {on
            ? t('While another space is open, this one says "New message" when something comes on XMPP, never what, from whom or in which chat, and a call does not ring. For it the XMPP server tells this space\'s relay of each message while no app of the account is on: the XMPP server learns the relay\'s name, and the relay when messages come.')
            : t('Closed, this space hears nothing from XMPP: what came shows when it opens.')}
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
