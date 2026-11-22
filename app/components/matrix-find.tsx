// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useState } from 'react';
import { View } from 'react-native';

import { plural, t } from '../lib/i18n';
import { isMatrixId, type MatrixState } from '../lib/matrix';
import type { FoundPerson } from '../lib/matrix-members';
import { findMessages, spacesOf, type FoundRoom } from '../lib/matrix-rooms';
import { matrixJoin, matrixPublicRooms, matrixSearchPeople, matrixSpaceRooms } from '../lib/matrix-store';
import { space } from '../theme/colors';

import { matrixJoinGate } from './matrix-ip';
import { lineOf } from './matrix-message';
import { Button, Card, Chip, Input, Row, SectionTitle, Text } from './ui';

// Finding rooms and words in the Matrix screen (app/matrix.tsx): the public rooms our Matrix server
// lists, or another server's; the rooms in the spaces we are in; and the words in the messages this
// phone keeps. The first two ask the Matrix server, which then learns what was looked for, as it
// does for Element, and the screen says so; looking for words asks nobody. And a new chat with
// someone by their Matrix ID, or found by name in the Matrix server's user directory
// (lib/matrix-members.ts searchPeople), which learns so who was looked for.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

type Page = { rooms: FoundRoom[]; next?: string };

export function MatrixFind({ state, busy, open, run }: { state: MatrixState; busy: boolean; open: (roomId: string) => void; run: (work: () => Promise<unknown>) => Promise<void> }) {
  const [term, setTerm] = useState('');
  const [server, setServer] = useState('');
  const [found, setFound] = useState<Page | null>(null);
  const [asking, setAsking] = useState(false);
  const [inSpace, setInSpace] = useState<string | null>(null);
  const [inside, setInside] = useState<Page | null>(null);
  const [words, setWords] = useState('');
  const [note, setNote] = useState('');
  const spaces = spacesOf(state);
  const seen = findMessages(state, words).slice(0, 20);

  async function ask(work: () => Promise<void>) {
    setAsking(true);
    setNote('');
    try {
      await work();
    } catch (error) {
      setNote(errorText(error));
    } finally {
      setAsking(false);
    }
  }

  const look = () =>
    ask(async () => {
      const page = await matrixPublicRooms(term, server);
      setFound(page);
      if (!page.rooms.length) setNote(t('No rooms found.'));
    });

  const more = () =>
    ask(async () => {
      if (!found?.next) return;
      const page = await matrixPublicRooms(term, server, found.next);
      setFound({ rooms: [...found.rooms, ...page.rooms], next: page.next });
    });

  const enter = (spaceId: string) =>
    ask(async () => {
      setInSpace(spaceId);
      setInside(null);
      setInside(await matrixSpaceRooms(spaceId));
    });

  const moreInside = () =>
    ask(async () => {
      if (!inSpace || !inside?.next) return;
      const page = await matrixSpaceRooms(inSpace, inside.next);
      setInside({ rooms: [...inside.rooms, ...page.rooms], next: page.next });
    });

  // Joins, by the address when it has one, and opens it.
  const join = (room: FoundRoom) =>
    void run(async () => {
      if (await matrixJoinGate(room.alias ?? room.id)) open(await matrixJoin(room.alias ?? room.id));
    });

  return (
    <>
      <SectionTitle title={t('Find a group')} />
      <Card>
        <Input value={term} onChangeText={setTerm} autoCapitalize="none" autoCorrect={false} placeholder={t('Words in its name or topic')} accessibilityLabel={t('Words in its name or topic')} onSubmitEditing={() => void look()} />
        <Input value={server} onChangeText={setServer} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="matrix.org" accessibilityLabel={t('Another Matrix server, to look there')} />
        <Row>
          <Button title={asking ? t('Looking…') : t('Look')} compact disabled={busy || asking} onPress={() => void look()} />
        </Row>
        <Text variant="caption" tone="muted">
          {t('Your Matrix server learns what you look for, as it does for Element. A public group may not be encrypted.')}
        </Text>
        {found?.rooms.map((room) => (
          <FoundRow key={room.id} room={room} busy={busy} onOpen={() => open(room.id)} onJoin={() => join(room)} />
        ))}
        {found?.next ? <Button title={t('More')} kind="secondary" compact disabled={asking} onPress={() => void more()} /> : null}
        {note ? <Text tone="muted">{note}</Text> : null}
      </Card>

      {spaces.length ? (
        <>
          <SectionTitle title={t('Spaces')} />
          <Card>
            <Row wrap>
              {spaces.map((it) => (
                <Chip key={it.id} label={it.name} selected={inSpace === it.id} onPress={() => (inSpace === it.id ? (setInSpace(null), setInside(null)) : void enter(it.id))} />
              ))}
            </Row>
            {inSpace && inside ? (
              inside.rooms.length ? (
                inside.rooms.map((room) => <FoundRow key={room.id} room={room} busy={busy} onOpen={() => open(room.id)} onJoin={() => join(room)} />)
              ) : (
                <Text tone="muted">{t('This space has no rooms.')}</Text>
              )
            ) : null}
            {inSpace && inside?.next ? <Button title={t('More')} kind="secondary" compact disabled={asking} onPress={() => void moreInside()} /> : null}
          </Card>
        </>
      ) : null}

      <SectionTitle title={t('Search messages')} />
      <Card>
        <Input value={words} onChangeText={setWords} autoCapitalize="none" autoCorrect={false} placeholder={t('Words in your messages')} accessibilityLabel={t('Words in your messages')} />
        <Text variant="caption" tone="muted">
          {t('Looks only in the messages on this phone. Nobody is asked.')}
        </Text>
        {words.trim().length >= 2 && !seen.length ? <Text tone="muted">{t('Nothing found.')}</Text> : null}
        {seen.map(({ roomId, message }) => (
          <View key={`${roomId}${message.id}`} style={{ gap: 2 }}>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {state.rooms[roomId]?.name} · {state.rooms[roomId]?.members[message.sender]?.name || message.sender}
            </Text>
            <Text numberOfLines={2}>{lineOf(message)}</Text>
            <Row>
              <Button title={t('Open the chat')} kind="secondary" compact onPress={() => open(roomId)} />
            </Row>
          </View>
        ))}
      </Card>
    </>
  );
}

/** A new chat: with a Matrix ID written whole, at once; otherwise the words are looked for in the Matrix server's user directory, to start one with whom it finds. */
export function MatrixNewChat({ busy, run, start }: { busy: boolean; run: (work: () => Promise<unknown>) => Promise<void>; start: (userId: string) => Promise<void> }) {
  const [who, setWho] = useState('');
  const [found, setFound] = useState<FoundPerson[] | null>(null);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState('');
  const exact = isMatrixId(who);
  const typed = who.trim();

  async function look() {
    if (asking || typed.length < 2) return;
    setAsking(true);
    setNote('');
    try {
      const { people } = await matrixSearchPeople(typed);
      setFound(people);
      if (!people.length) setNote(t('Nothing found.'));
    } catch (error) {
      setNote(errorText(error));
    } finally {
      setAsking(false);
    }
  }

  const open = (userId: string) =>
    void run(async () => {
      await start(userId);
      setWho('');
      setFound(null);
    });

  return (
    <>
      <SectionTitle title={t('New chat')} />
      <Card>
        <Row>
          <Input
            style={{ flex: 1 }}
            value={who}
            onChangeText={setWho}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="@name:matrix.org"
            accessibilityLabel={t('Matrix ID')}
            onSubmitEditing={() => (exact ? open(typed) : void look())}
          />
          <Button
            title={exact ? t('Start') : asking ? t('Looking…') : t('Search')}
            compact
            disabled={busy || asking || (!exact && typed.length < 2)}
            onPress={() => (exact ? open(typed) : void look())}
          />
        </Row>
        <Text variant="caption" tone="muted">
          {t('Write a Matrix ID to start a chat, or a name to look for it on your Matrix server, which then learns who you looked for.')}
        </Text>
        {found?.map((person) => (
          <Row key={person.id}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong" numberOfLines={1}>
                {person.name ?? person.id}
              </Text>
              {person.name ? (
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {person.id}
                </Text>
              ) : null}
            </View>
            <Button title={t('Start')} kind="secondary" compact disabled={busy} onPress={() => open(person.id)} />
          </Row>
        ))}
        {note ? <Text tone="muted">{note}</Text> : null}
      </Card>
    </>
  );
}

function FoundRow({ room, busy, onOpen, onJoin }: { room: FoundRoom; busy: boolean; onOpen: () => void; onJoin: () => void }) {
  return (
    <View style={{ gap: 2, paddingTop: space.xs }}>
      <Text variant="bodyStrong" numberOfLines={1}>
        {room.name}
      </Text>
      {room.topic ? (
        <Text tone="muted" numberOfLines={2}>
          {room.topic}
        </Text>
      ) : null}
      <Text variant="caption" tone="faint">
        {[plural(room.members, '{n} member', '{n} members'), room.alias ?? ''].filter(Boolean).join(' · ')}
      </Text>
      <Row>
        {room.joined ? (
          <Button title={t('Open')} kind="secondary" compact onPress={onOpen} />
        ) : room.open ? (
          <Button title={t('Join')} compact disabled={busy} onPress={onJoin} />
        ) : (
          <Text variant="caption" tone="muted">
            {t('By invitation only.')}
          </Text>
        )}
      </Row>
    </View>
  );
}
