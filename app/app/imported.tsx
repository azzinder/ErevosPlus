// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, View, type ListViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Attachment, FileViewer, SHOWN_PHOTOS, useShownPhotos } from '../components/attachment';
import { FoundExport, useImportFlow } from '../components/import-flow';
import { Button, Card, Chip, Page, Row, Text, TextButton } from '../components/ui';
import { ask } from '../lib/alert';
import { askToShare } from '../lib/chat-share';
import { plural, t } from '../lib/i18n';
import { mediaText, shownTime, SOURCE_LABELS } from '../lib/imports';
import { saveFile } from '../lib/save-file';
import { Archive, type ArchivedMessage, type ChatSummary } from '../lock/archive';
import type { FileRef } from '../lock/attachment-files';
import { loadE2EData } from '../lock/e2e-data';
import { currentSpace } from '../lock/keys';
import { radius, space, type Colors } from '../theme/colors';
import { useStyles } from '../theme/context';

// Chats brought in from Telegram, WhatsApp and Viber exports (lib/imports.ts), kept sealed in this space
// (lock/archive.ts). They are only to read: Erevos cannot show who really wrote them, and they
// are sent nowhere on their own. One can go on in Erevos: linked to one of the space's contacts, it
// shows in the chat with them, ahead of the new messages, and can be shared with them alone (their
// chat asks first and sends it, lib/chat-share.ts).

type Contact = { identity: string; name: string; locked?: boolean };

const contactLabel = (identity: string, contacts: Contact[]) =>
  contacts.find((contact) => contact.identity === identity)?.name || t('contact {id}', { id: identity.slice(0, 8) });

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

const day = (at: number) => shownTime(at).slice(0, 10);

export default function ImportedScreen() {
  const [archive, setArchive] = useState<Archive | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  // The space's own contacts, that an imported chat can go on with. Not its hidden chats'.
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState('');
  // What a picked file held, waiting for the owner's name in it before it is kept.
  const flow = useImportFlow(archive, setNote, () => {
    if (archive) setChats(archive.chats());
  });

  useEffect(() => {
    let active = true;
    const { space: current, key } = currentSpace();
    Archive.open('space', current, key)
      .then((opened) => {
        if (!active) return;
        setArchive(opened);
        setChats(opened.chats());
      })
      .catch((error) => active && setNote(t('Imported chats could not open. {reason}', { reason: errorText(error) })));
    loadE2EData('space', current, key)
      .then((data) => active && setContacts(data.contacts.map(({ identity, name, pin }) => ({ identity, name, locked: !!pin }))))
      .catch(() => {
        // No contacts to go on with.
      });
    return () => {
      active = false;
    };
  }, []);

  function remove(chat: ChatSummary) {
    ask(t('Delete imported chat'), t('Delete “{title}” from this phone? It cannot be brought back.', { title: chat.title || SOURCE_LABELS[chat.source] }), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: () => {
          archive
            ?.remove(chat.id)
            .then(() => {
              setChats(archive.chats());
              setOpen(null);
            })
            .catch((error) => setNote(errorText(error)));
        },
      },
    ]);
  }

  async function link(chat: ChatSummary, contact: string, inChat = false) {
    try {
      await archive?.link(chat.id, contact, inChat);
      if (archive) setChats(archive.chats());
      if (inChat) setNote(t('Now only in the chat with {name}. Its details there bring it back here.', { name: contactLabel(contact, contacts) }));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Those kept only in the chat they go on in are not listed, while that contact is there, nor those
  // that go on in a chat locked with its PIN, which shows them once opened with it.
  const isContact = (identity: string) => contacts.some((contact) => contact.identity === identity);
  const isLocked = (identity: string) => contacts.some((contact) => contact.identity === identity && contact.locked);
  const listed = chats.filter((chat) => !(chat.inChat && isContact(chat.contact)) && !isLocked(chat.contact));

  const opened = open ? chats.find((chat) => chat.id === open) : undefined;
  if (opened && archive) {
    return (
      <ChatView
        archive={archive}
        chat={opened}
        contacts={contacts}
        onLink={(contact) => void link(opened, contact)}
        onBack={() => setOpen(null)}
        onDelete={() => remove(opened)}
      />
    );
  }

  return (
    <Page>
      <Text variant="title">{t('Imported chats')}</Text>
      <Text tone="muted">
        {t(
          'Chats brought in from Telegram, WhatsApp or Viber, to read here, with their photos, videos, voice messages and files. They stay on this phone, sealed in this space, unless you share one with the contact it goes on with: then it goes to them alone, end-to-end encrypted.',
        )}
      </Text>

      {flow.found ? <FoundExport flow={flow} /> : <Button title={t('Import a file')} loading={flow.busy} onPress={() => void flow.pick()} />}

      {note ? <Text variant="caption" style={{ fontSize: 14 }}>{note}</Text> : null}

      {listed.length === 0 && !flow.found ? (
        <Text variant="caption" tone="muted">
          {t(
            'Nothing imported yet. In WhatsApp: a chat, then More, Export chat, Include media, and save the .zip to the phone. In Telegram Desktop: Export chat history, format JSON, with photos, videos, voice messages and files, then make a .zip of the folder it made and copy it to the phone. From Viber: save the chat with the Android app Backup Text for Viber and copy its .html file to the phone.',
          )}
        </Text>
      ) : null}

      {chats.length > listed.length ? (
        <Text variant="caption" tone="muted">
          {plural(
            chats.length - listed.length,
            'One more is kept only in the chat it goes on in: its details there show it.',
            '{n} more are kept only in the chats they go on in: their details there show them.',
          )}
        </Text>
      ) : null}

      {listed.map((chat) => (
        <Card key={chat.id}>
          <Text variant="bodyStrong">{chat.title || SOURCE_LABELS[chat.source]}</Text>
          <Text variant="caption" tone="muted">
            {SOURCE_LABELS[chat.source]}, {plural(chat.count, '{n} message', '{n} messages')}
            {chat.last ? t(', {from} to {to}', { from: day(chat.first), to: day(chat.last) }) : ''}
            {chat.contact ? t('. Goes on in Erevos with {name}.', { name: contactLabel(chat.contact, contacts) }) : ''}
          </Text>
          <Row wrap>
            <TextButton title={t('Read')} onPress={() => setOpen(chat.id)} />
            {chat.contact && isContact(chat.contact) ? <TextButton title={t('Keep only in the chat')} onPress={() => void link(chat, chat.contact, true)} /> : null}
            {/* Shared with them alone, from their chat, which asks first; not one a contact shared here. */}
            {chat.contact && isContact(chat.contact) && !chat.shared ? (
              <TextButton
                title={t('Share with {name}', { name: contactLabel(chat.contact, contacts) })}
                onPress={() => {
                  askToShare(chat.contact);
                  router.push({ pathname: '/chat', params: { contact: chat.contact } });
                }}
              />
            ) : null}
            <TextButton title={t('Delete')} onPress={() => remove(chat)} />
          </Row>
        </Card>
      ))}
    </Page>
  );
}

// A message counts as on the screen once a tenth of it shows; at most this many of their photos are read.
const SEEN = { itemVisiblePercentThreshold: 10 };
const SEEN_PHOTOS = Platform.OS === 'web' ? 60 : 12;

function ChatView({ archive, chat, contacts, onLink, onBack, onDelete }: {
  archive: Archive;
  chat: ChatSummary;
  contacts: Contact[];
  onLink: (contact: string) => void;
  onBack: () => void;
  onDelete: () => void;
}) {
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [picking, setPicking] = useState(false);
  const [viewing, setViewing] = useState<FileRef | null>(null);
  const [note, setNote] = useState('');
  const title = chat.title || SOURCE_LABELS[chat.source];
  const messages = useMemo(() => archive.chat(chat.id)?.messages ?? [], [archive, chat.id]);
  // Newest first, in a list drawn upside down, so it opens at the latest message.
  const newestFirst = useMemo(() => [...messages].reverse(), [messages]);
  // In a group, each message says who wrote it.
  const group = useMemo(() => new Set(messages.map((m) => m[1]).filter((name) => name && name !== chat.me)).size > 1, [messages, chat.me]);
  // The photos of the messages on the screen, read as the list is scrolled, so they show as they were.
  const [seenPhotos, setSeenPhotos] = useState<FileRef[]>([]);
  const onSeen = useRef(({ viewableItems }: { viewableItems: (Omit<ListViewToken, 'item'> & { item: ArchivedMessage })[] }) => {
    const files = viewableItems.flatMap(({ item }) => (item[4] ?? []).filter((file) => file.kind === 'photo')).slice(0, SEEN_PHOTOS);
    setSeenPhotos((now) => (now.map((file) => file.id).join() === files.map((file) => file.id).join() ? now : files));
  }).current;
  // The photos shown: the latest, those on the screen, and the one looked at on its own.
  const shownPhotos = useMemo(() => {
    const latest = newestFirst
      .flatMap(([, , , , files = []]) => files)
      .filter((file) => file.kind === 'photo')
      .slice(0, SHOWN_PHOTOS);
    return [...latest, ...seenPhotos.filter((file) => !latest.some((one) => one.id === file.id))];
  }, [newestFirst, seenPhotos]);
  const photos = useShownPhotos(viewing?.kind === 'photo' ? [...shownPhotos, viewing] : shownPhotos, (error) =>
    setNote(t('Cannot show the photo. {error}', { error: errorText(error) })),
  );

  async function save(file: FileRef, choose: boolean) {
    try {
      const where = await saveFile(file, choose);
      if (!where) return;
      setViewing(null);
      setNote(t('Saved in {where}. There it is outside Erevos, not sealed.', { where }));
    } catch (error) {
      setViewing(null);
      setNote(t('Not saved. {error}', { error: errorText(error) }));
    }
  }

  const render = ({ item: [at, sender, text, kinds, kept = []] }: { item: ArchivedMessage }) => {
    const mine = chat.me !== '' && sender === chat.me;
    const files = mediaText(kinds);
    const ink = mine ? styles.mineText : styles.theirsText;
    return (
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        {group && !mine && sender ? <Text style={[styles.sender, ink]}>{sender}</Text> : null}
        {kept.map((file, i) => (
          <Pressable key={`${file.id}-${i}`} onPress={() => setViewing(file)} accessibilityRole="button">
            <Attachment file={file} uri={photos[file.id]} ink={ink} />
          </Pressable>
        ))}
        {text ? <Text style={ink}>{text}</Text> : null}
        {files ? <Text style={[styles.files, ink]}>{t('{files}, not imported', { files })}</Text> : null}
        <Text style={[styles.time, ink]}>{shownTime(at)}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + space.md }]}>
      <View style={styles.header}>
        <Text variant="title" style={styles.grow} numberOfLines={1}>
          {title}
        </Text>
        <TextButton title={t('Delete')} onPress={onDelete} />
        <TextButton title={t('All imported')} onPress={onBack} />
      </View>
      <Text variant="caption" tone="muted">
        {t('Imported from {source}, only to read. Erevos cannot show who really wrote these.', { source: SOURCE_LABELS[chat.source] })}
        {chat.skipped === 1 ? t(' One notice or call was left out.') : chat.skipped ? t(' {n} notices and calls were left out.', { n: chat.skipped }) : ''}
      </Text>
      {note ? <Text variant="caption">{note}</Text> : null}
      {chat.contact ? (
        <View style={styles.section}>
          <Text variant="caption" tone="muted">
            {t('Goes on in Erevos with {name}: these messages show in that chat, ahead of the new ones, only on this phone.', {
              name: contactLabel(chat.contact, contacts),
            })}
          </Text>
          <Row wrap>
            <TextButton title={t('Open the chat')} onPress={() => router.push({ pathname: '/chat', params: { contact: chat.contact } })} />
            <TextButton title={t('Unlink')} onPress={() => onLink('')} />
          </Row>
        </View>
      ) : picking ? (
        <View style={styles.section}>
          <Text variant="caption" tone="muted">
            {contacts.length === 0
              ? t("There are no Erevos contacts in this space yet. In Chat, open Server and add {name}'s contact link, then come back here.", { name: title })
              : t('Which Erevos contact is {name}? These messages then show in the chat with them, ahead of the new ones, only on this phone.', { name: title })}
          </Text>
          <Row wrap>
            {contacts.map((contact) => (
              <Chip
                key={contact.identity}
                label={contactLabel(contact.identity, contacts)}
                mono={!contact.name}
                selected={false}
                onPress={() => {
                  setPicking(false);
                  onLink(contact.identity);
                }}
              />
            ))}
            <TextButton title={t('Cancel')} onPress={() => setPicking(false)} />
          </Row>
        </View>
      ) : (
        <TextButton title={t('Continue in Erevos')} onPress={() => setPicking(true)} />
      )}
      <FlatList
        data={newestFirst}
        // Android's clipping of rows off the screen closed Erevos on Fabric (a row added twice).
        removeClippedSubviews={false}
        inverted
        renderItem={render}
        onViewableItemsChanged={onSeen}
        viewabilityConfig={SEEN}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.thread}
        initialNumToRender={30}
      />
      <FileViewer
        file={viewing}
        uri={viewing ? photos[viewing.id] : undefined}
        onSave={(choose) => viewing && void save(viewing, choose)}
        onClose={() => setViewing(null)}
      />
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      padding: space.lg,
      gap: space.md,
      backgroundColor: colors.ground,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
    },
    grow: {
      flex: 1,
    },
    section: {
      gap: space.sm,
    },
    thread: {
      gap: space.sm,
      paddingVertical: space.sm,
    },
    bubble: {
      maxWidth: '80%',
      paddingVertical: space.sm,
      paddingHorizontal: space.md,
      borderRadius: Math.min(radius.md, 16),
      gap: 2,
    },
    mine: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
    },
    theirs: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surfaceAlt,
    },
    mineText: {
      fontSize: 15,
      color: colors.onPrimary,
    },
    theirsText: {
      fontSize: 15,
      color: colors.text,
    },
    sender: {
      fontSize: 13,
      fontWeight: '700',
    },
    files: {
      fontSize: 13,
      fontStyle: 'italic',
    },
    time: {
      fontSize: 11,
      opacity: 0.7,
    },
  });
