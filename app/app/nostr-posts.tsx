// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Page, Text } from '../components/ui';
import { canTor } from '../lib/core';
import { t } from '../lib/i18n';
import { useNetworkWhere } from '../lib/network-place';
import { nameOf, npubOf, personName, shortMentions, shortNpub, type NostrPost } from '../lib/nostr-dm';
import { nostrChatsThroughTor } from '../lib/nostr-dm-net';
import { nostrDmNow, nostrDmPosts, nostrDmTor, onNostrDmChange, runNostrDm } from '../lib/nostr-dm-store';
import { space } from '../theme/colors';

// The public posts of someone a Nostr chat is with (app/nostr-chat.tsx), newest first, read only:
// looked up when this screen opens and when older ones are asked for (lib/nostr-dm-store.ts
// nostrDmPosts), as the space's Tor way says, and never kept. Nothing is fetched for them: a
// picture or a link is its address, as written, which can be selected and copied but not opened
// from here. A post with a content warning shows its words only when tapped. Opened from the Nostr
// Public tab's posts (components/public-feed.tsx), it is someone the space's key follows, with the name
// they gave themselves there (`name`) when this space has none for them.

export default function NostrPostsScreen() {
  const { key: given, hidden, name: called } = useLocalSearchParams<{ key?: string; hidden?: string; name?: string }>();
  const where = useNetworkWhere(hidden === '1');
  const key = given && /^[0-9a-f]{64}$/.test(given) ? given : undefined;
  const [now, setNow] = useState(nostrDmNow(where));
  const [posts, setPosts] = useState<NostrPost[]>([]);
  const [looking, setLooking] = useState(false);
  const [older, setOlder] = useState(false);
  const [said, setSaid] = useState('');
  const [looked, setLooked] = useState(false);

  useEffect(() => {
    runNostrDm();
    setNow(nostrDmNow(where));
    return onNostrDmChange(() => setNow(nostrDmNow(where)));
  }, [where]);

  const state = now.state;

  // The newest posts, or those before the oldest shown.
  async function look(more: boolean) {
    if (!key || looking) return;
    setLooking(true);
    setSaid('');
    try {
      const last = posts[posts.length - 1];
      const found = await nostrDmPosts(key, more && last ? Math.floor(last.at / 1000) - 1 : undefined);
      const shown = new Set(more ? posts.map((post) => post.id) : []);
      setPosts([...(more ? posts : []), ...found.posts.filter((post) => !shown.has(post.id))]);
      setOlder(found.older);
      if (!found.answered) setSaid(t('No relay answered. Try again in a while.'));
    } catch (error) {
      setSaid(error instanceof Error ? error.message : String(error));
    } finally {
      setLooking(false);
      setLooked(true);
    }
  }

  useEffect(() => {
    if (key && state && !looked && !looking) void look(false);
  }, [key, !!state]);

  if (!state || !key) {
    return (
      <Page>
        <Text variant="title">{t('Public posts')}</Text>
        <Text tone="muted">{now.loaded ? t('This Nostr chat is not here any more.') : ''}</Text>
      </Page>
    );
  }

  const npub = npubOf(key);
  const name = nameOf(state, key) || (typeof called === 'string' ? called.trim().slice(0, 64) : '') || shortNpub(npub);
  return (
    <Page>
      <Text variant="title" numberOfLines={2}>
        {name}
      </Text>
      <Text selectable variant="caption" tone="muted" style={{ fontFamily: 'monospace' }}>
        {npub}
      </Text>
      <Text variant="caption" tone="muted">
        {t('Public posts · read only')}
      </Text>
      <Text variant="caption" tone="faint">
        {t('What they post for everyone, newest first, as their relays keep it. It is looked up now and not kept, and no pictures or links are opened: they show as their addresses.')}
      </Text>
      {canTor() ? (
        <Text variant="caption" tone="faint">
          {nostrChatsThroughTor(nostrDmTor(where))
            ? t('Through Tor: the Nostr relays do not see your address.')
            : t('Not through Tor now: the Nostr relays see your address. Tor for this account is under Settings → Relay and networks → Nostr chats.')}
        </Text>
      ) : null}

      {posts.map((post) => (
        <Post key={post.id} post={post} sharedName={post.sharedFrom ? personName(state, post.sharedFrom) : undefined} />
      ))}

      {looking ? <Text tone="muted">{t('Looking…')}</Text> : null}
      {!looking && looked && posts.length === 0 && !said ? <Text tone="muted">{t('No public posts were found.')}</Text> : null}
      {said ? <Text tone="muted">{said}</Text> : null}
      {!looking && looked ? (
        older && posts.length ? (
          <Button title={t('Older posts')} kind="secondary" compact onPress={() => void look(true)} />
        ) : (
          <Button title={t('Look again')} kind="secondary" compact onPress={() => void look(false)} />
        )
      ) : null}
    </Page>
  );
}

function Post({ post, sharedName }: { post: NostrPost; sharedName?: string }) {
  // A post with a content warning keeps its words covered until asked for.
  const [open, setOpen] = useState(post.warning === undefined);
  const when = new Date(post.at).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <Card>
      <View style={{ gap: space.xs }}>
        {sharedName ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {t('Shared, from {name}', { name: sharedName })}
          </Text>
        ) : null}
        {post.answer ? (
          <Text variant="caption" tone="muted">
            {t('An answer to another post')}
          </Text>
        ) : null}
        {open ? (
          <Text selectable>{shortMentions(post.text)}</Text>
        ) : (
          <>
            <Text tone="muted">{post.warning ? t('Content warning: {reason}', { reason: post.warning }) : t('Content warning')}</Text>
            <Button title={t('Show')} kind="secondary" compact onPress={() => setOpen(true)} />
          </>
        )}
        <Text variant="caption" tone="faint">
          {when}
        </Text>
      </View>
    </Card>
  );
}
