// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { FoundRow } from '../components/found-row';
import { FolderIcon, LockIcon } from '../components/icons';
import { Button, Input, Page, Sheet, Text } from '../components/ui';
import { CAN_COLLECT, importShared } from '../lib/collection-import';
import { copyToSend } from '../lib/collection-out';
import { spaceCollection } from '../lib/collection-place';
import { canGroup, hasCore } from '../lib/core';
import { forwardTo } from '../lib/forward';
import { locale, t } from '../lib/i18n';
import { shownName } from '../lib/inbox';
import { useModules } from '../lib/modules';
import { holdsShare } from '../lib/open-link';
import { handPay, payAmount, type Pay } from '../lib/pay';
import { dropShared, handShared, isSharedPhoto, sharedFileOf, type SharedFile } from '../lib/share-in';
import { fitsNetwork, inOrder, networkOf, tooLargeFor, useNetworkTargets, type Network } from '../lib/share-networks';
import { spaceChats } from '../lib/space-chats';
import { spaceGroups } from '../lib/space-groups';
import { MAX_FILE } from '../lib/attachments';
import { addFolder, loadCollection, type Collection, type CollectionItem } from '../lock/collection-data';
import { loadInboxCache } from '../lock/inbox-cache';
import { currentSpace } from '../lock/keys';
import { radius, space } from '../theme/colors';
import { useColors } from '../theme/context';

// Send to: what another app shared with Erevos from its Share (lib/share-in.ts), opened once a
// space is open. The chats, groups and SMS conversations the home screen showed last come first, in
// its order, then every other chat and group of the space by name, with the chats of its Matrix,
// XMPP and Nostr accounts (lib/share-networks.ts); never hidden chats. The one picked opens with
// the words in its message field, to read and send there, and a photo or file goes there at once.
// An SMS conversation takes only words.
//
// With the Collection on (lib/modules.ts), a photo or file has the Collection first, before the
// chats: a sheet asks which of its folders, and the file goes into it as soon as that is answered,
// as it is: Android encrypted it as it came (modules/erevos-collection, ShareActivity.kt), so no
// plain copy of it is ever on the disk. Opened from the Collection itself (`collection`, the
// ids of the files), it sends those to the chat picked, as a photo or file picked there goes.

type Target = { key: string; name: string; kind: 'chat' | 'group' | 'sms' | Network; at: number; to: string; open: string };

const plain = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function chatTarget(identity: string, name: string, at: number): Target {
  return { key: identity, name, kind: 'chat', at, to: `contact:${identity}`, open: `/chat?contact=${identity}` };
}

function groupTarget(id: string, name: string, at: number): Target {
  return { key: `group:${id}`, name, kind: 'group', at, to: `group:${id}`, open: `/group?id=${id}` };
}

function smsTarget(address: string, name: string, at: number): Target {
  return { key: `sms:${address}`, name, kind: 'sms', at, to: address, open: `/sms?to=${encodeURIComponent(address)}` };
}

export default function ShareScreen() {
  return <SendTo />;
}

/**
 * Send to, as share.tsx opens it, or (`pay`) for a payment request another app asks for
 * (app/pay.tsx, lib/pay.ts): then only Erevos chats, and the chat picked asks before it sends.
 */
export function SendTo({ pay }: { pay?: Pay | null }) {
  const params = useLocalSearchParams<{ text?: string; file?: string; sealed?: string; name?: string; mime?: string; large?: string; collection?: string }>();
  const asked = pay !== undefined;
  const colors = useColors();
  const modules = useModules();
  const text = (params.text ?? '').trim();
  const file = useMemo(() => (asked ? null : sharedFileOf(params)), [asked, params.file, params.sealed, params.name, params.mime]);
  const large = params.large === '1';
  const [targets, setTargets] = useState<Target[] | null>(null);
  // The home screen's list as it was kept last, its identities in its order.
  const [order, setOrder] = useState<string[]>([]);
  const networks = useNetworkTargets(modules);
  const [query, setQuery] = useState('');
  // The Collection's files to send (`collection`), and the Collection's folders to choose from.
  const [sending, setSending] = useState<CollectionItem[] | null>(null);
  const [folders, setFolders] = useState<Collection | null>(null);
  const [asking, setAsking] = useState(false);
  const [naming, setNaming] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const fromCollection = !asked && typeof params.collection === 'string' && params.collection.length > 0;
  // Whether the photo or file was handed on: if not, it goes as Send to closes. Not as Erevos locks
  // over it, just after the share brought it back from the background: Send to opens again after
  // the password (lib/open-link.ts lockingKeepsLink), with the file still there.
  const handed = useRef(false);

  useEffect(() => {
    handed.current = false;
    return () => {
      if (file && !handed.current && !holdsShare(file.sealed?.id ?? file.file)) dropShared(file);
    };
  }, [file]);

  // The files of the Collection asked to be sent: those of this space that are still there.
  useEffect(() => {
    if (!fromCollection) return;
    const ids = new Set(String(params.collection).split(',').filter((id) => /^[0-9a-f]{32}$/.test(id)));
    void loadCollection(spaceCollection())
      .then((c) => setSending(c.items.filter((i) => ids.has(i.id))))
      .catch(() => setSending([]));
  }, [fromCollection, params.collection]);

  useEffect(() => {
    let active = true;
    const { space, key } = currentSpace();
    void Promise.all([
      loadInboxCache(space, key).catch(() => ({ rows: [] })),
      hasCore() ? spaceChats().catch(() => null) : null,
      hasCore() && canGroup() ? spaceGroups().catch(() => null) : null,
    ]).then(([cache, chats, groups]) => {
      if (!active) return;
      const contacts = (chats?.e2e.contacts() ?? []).filter((c) => !c.request);
      const listed = (groups?.list() ?? []).filter((g) => g.status === 'in');
      const recent: Target[] = [];
      for (const row of cache.rows) {
        if (row.identity.startsWith('sms:')) recent.push(smsTarget(row.identity.slice(4), shownName(row), row.at));
        else if (row.identity.startsWith('group:')) {
          const group = listed.find((g) => `group:${g.id}` === row.identity);
          if (group) recent.push(groupTarget(group.id, group.name, row.at));
        } else {
          const contact = contacts.find((c) => c.identity === row.identity);
          if (contact) recent.push(chatTarget(contact.identity, shownName(contact), row.at));
        }
      }
      const shown = new Set(recent.map((r) => r.key));
      const rest = [
        ...contacts.filter((c) => !shown.has(c.identity)).map((c) => chatTarget(c.identity, shownName(c), 0)),
        ...listed.filter((g) => !shown.has(`group:${g.id}`)).map((g) => groupTarget(g.id, g.name, 0)),
      ].sort((a, b) => a.name.localeCompare(b.name));
      setTargets([...recent, ...rest]);
      setOrder(cache.rows.map((row) => row.identity));
    });
    return () => {
      active = false;
    };
  }, []);

  const withFile = !!file || fromCollection;
  const what = asked
    ? pay
      ? `💶 ${t('Payment request')}: ${payAmount(pay, locale())}${pay.w ? ` · ${pay.w}` : ''}`
      : ''
    : fromCollection
    ? (sending ?? []).map((i) => i.file.name).join(', ')
    : file
      ? isSharedPhoto(file)
        ? t('A photo: {name}', { name: file.name })
        : t('A file: {name}', { name: file.name })
      : text;
  const q = plain(query.trim());
  // Larger than a chat takes (100 MB): only the Collection may keep it.
  const onlyCollection = !!file?.sealed && file.sealed.size > MAX_FILE;
  const choices = useMemo(() => (targets ? inOrder<Target>([...targets, ...networks], order) : []), [targets, networks, order]);
  const shown = (onlyCollection ? [] : choices).filter((target) => (asked ? target.kind === 'chat' : !withFile || target.kind !== 'sms') && (!q || plain(target.name).includes(q)));
  // The Collection takes a photo or file shared in, on the phone, when it is on.
  const toCollection = !!file && !fromCollection && CAN_COLLECT && Platform.OS !== 'web' && modules.has('collection');
  const kindOf = (target: Target) =>
    target.kind === 'group' ? t('Group') : target.kind === 'sms' ? t('SMS') : target.kind === 'matrix' ? 'Matrix' : target.kind === 'xmpp' ? 'XMPP' : target.kind === 'nostr' ? 'Nostr' : target.kind === 'telegram' ? 'Telegram' : t('Erevos chat');

  async function choose(target: Target) {
    if (asked) {
      if (!pay || target.kind !== 'chat') return;
      handPay(target.to, pay);
      router.replace(target.open);
      return;
    }
    // A file larger than a Matrix, XMPP or Nostr chat sends stays here, for another pick.
    const network = networkOf(target.to);
    const sizes = file ? [{ size: file.sealed?.size ?? file.held?.size ?? 0, photo: isSharedPhoto(file) }] : (sending ?? []).map((i) => ({ size: i.file.size, photo: isSharedPhoto({ file: '', name: i.file.name, mime: i.file.mime }) }));
    if (network && !sizes.every((one) => fitsNetwork(network, one.size, one.photo))) {
      setNote(tooLargeFor(network).message);
      return;
    }
    if (text) forwardTo(target.to, { text, photo: null });
    if (file) {
      handed.current = true;
      handShared(target.to, file);
    }
    if (fromCollection) {
      // Plain copies for the chat to read, which deletes each as it does.
      if (!sending || sending.length === 0 || busy) return;
      setBusy(true);
      try {
        const copies: SharedFile[] = [];
        for (const item of sending) copies.push(await copyToSend(item));
        handShared(target.to, copies);
      } catch (error) {
        setNote(error instanceof Error ? error.message : String(error));
        setBusy(false);
        return;
      }
    }
    router.replace(target.open);
  }

  async function openFolders() {
    setNote('');
    setFolders(await loadCollection(spaceCollection()).catch(() => null));
    setAsking(true);
  }

  // Encrypts the shared file into the Collection, in a folder ('' for none), and shows the Collection.
  async function keepIn(folder: string) {
    if (!file || busy) return;
    setAsking(false);
    setBusy(true);
    handed.current = true;
    try {
      await importShared(spaceCollection(), file, folder);
      router.replace('/collection');
    } catch (error) {
      setNote(t('Not added. {error}', { error: error instanceof Error ? error.message : String(error) }));
      setBusy(false);
    }
  }

  async function makeFolder() {
    const name = naming ?? '';
    setNaming(null);
    try {
      const made = await addFolder(spaceCollection(), name);
      await keepIn(made.id);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <Page>
      <Text variant="title">{t('Send to')}</Text>
      {large ? <Text tone="muted">{t('This file is too large for the Collection.')}</Text> : null}
      {onlyCollection ? (
        <Text tone="muted">
          {toCollection ? t('Chats take files up to 100 MB: this one can go only to the Collection.') : t('Chats take files up to 100 MB: this one can go only to the Collection. Turn the Collection on in Settings → General → Modules.')}
        </Text>
      ) : null}
      {note ? <Text color={colors.warning}>{note}</Text> : null}
      {what ? (
        <Text numberOfLines={4} tone="muted">
          {what}
        </Text>
      ) : asked ? (
        <Text tone="muted">{t('This payment request cannot be read.')}</Text>
      ) : !large ? (
        <Text tone="muted">{t('Nothing came to send.')}</Text>
      ) : null}
      {what ? (
        <>
          {onlyCollection ? null : (
            <>
            <Input value={query} onChangeText={setQuery} placeholder={t('Search chats')} accessibilityLabel={t('Search chats')} />
            <Text variant="caption" tone="muted">
              {asked
                ? t('The chat you pick asks before the request goes. Only Erevos chats, never hidden chats.')
                : withFile
                ? t('The photo or file goes as soon as the chat or group you pick opens. Never to hidden chats, nor as an SMS.')
                : t('It opens in the chat, group or SMS conversation you pick, in the message field, to read and send there. Never in hidden chats.')}
            </Text>
            </>
          )}
          {toCollection ? (
            <Pressable
              onPress={() => void openFolders()}
              accessibilityRole="button"
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: pressed ? colors.surfacePressed : colors.surface, borderWidth: 1, borderColor: colors.primary })}
            >
              <LockIcon color={colors.primary} size={22} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{t('Collection')}</Text>
                <Text variant="caption" tone="muted">
                  {t('Encrypted · only in this space')}
                </Text>
              </View>
            </Pressable>
          ) : null}
          {targets && shown.length === 0 ? <Text tone="muted">{t('No chat matches.')}</Text> : null}
          {shown.map((target) => (
            <FoundRow key={target.key} name={target.name} line={kindOf(target)} at={target.at} now={Date.now()} onPress={() => void choose(target)} />
          ))}
        </>
      ) : null}
      <Sheet visible={asking && naming === null} onClose={() => setAsking(false)} title={t('Which folder?')}>
        <FolderRow title={t('No folder')} text={t('At the top of the Collection')} onPress={() => void keepIn('')} />
        {(folders?.folders ?? []).map((f) => (
          <FolderRow key={f.id} title={f.name} count={folders?.items.filter((i) => i.folder === f.id).length} onPress={() => void keepIn(f.id)} />
        ))}
        <FolderRow title={t('New folder')} onPress={() => setNaming('')} />
      </Sheet>
      <Sheet visible={naming !== null} onClose={() => setNaming(null)} title={t('New folder')}>
        <Input value={naming ?? ''} onChangeText={setNaming} placeholder={t('Folder name')} accessibilityLabel={t('Folder name')} autoFocus maxLength={60} onSubmitEditing={() => void makeFolder()} />
        <Button title={t('Save')} disabled={!naming?.trim()} onPress={() => void makeFolder()} />
      </Sheet>
    </Page>
  );
}

// One choice in the folder sheet: its name, what it is, or how many files it holds.
function FolderRow({ title, text, count, onPress }: { title: string; text?: string; count?: number; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm }, pressed && { opacity: 0.6 }]}>
      <FolderIcon color={colors.primary} size={22} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{title}</Text>
        {text ? (
          <Text variant="caption" tone="muted">
            {text}
          </Text>
        ) : null}
      </View>
      {count !== undefined ? <Text tone="muted">{count}</Text> : null}
    </Pressable>
  );
}
