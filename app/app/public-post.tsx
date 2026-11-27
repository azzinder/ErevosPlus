// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { dropPost, PostReactions, postShown, PublicRow, usePublicActions } from '../components/public-feed';
import { Button, Page, Row, Text } from '../components/ui';
import { plural, t } from '../lib/i18n';
import { nostrDmPostTalk, onNostrDmChange, runNostrDm, type PostTalk } from '../lib/nostr-dm-store';
import type { FeedPost } from '../lib/nostr-feed';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';

// One post of the Public tab (components/public-feed.tsx) on its own: the post, how many liked it
// and shared it again, its reactions, each tapped to add the same or take ours back, and the
// answers to it, each as a row of the feed, with Answer to write one; a poll, how it stands. What
// it says is looked up when the screen opens (lib/nostr-dm-store.ts nostrDmPostTalk), as the
// space's Tor way says, and never kept. The post is handed over in memory, not in the address
// (showPost), and let go as the screen closes.

export default function PublicPostScreen() {
  const colors = useColors();
  const [handed] = useState(postShown);
  const [talk, setTalk] = useState<PostTalk | null>(null);
  const [looking, setLooking] = useState(false);
  const [said, setSaid] = useState('');
  const [, setTick] = useState(0);
  const names = { ...handed?.names, ...talk?.names };
  const post = handed?.post;

  async function look() {
    const event = post?.event;
    if (!event || looking) return;
    setLooking(true);
    setSaid('');
    try {
      const found = await nostrDmPostTalk(event);
      setTalk(found);
      if (!found.answered) setSaid(t('No server answered. Try again in a while.'));
    } catch (error) {
      setSaid(error instanceof Error ? error.message : String(error));
    } finally {
      setLooking(false);
    }
  }

  useEffect(() => {
    runNostrDm();
    void look();
    const stop = onNostrDmChange(() => setTick((n) => n + 1));
    return () => {
      stop();
      dropPost();
    };
  }, []);

  const actions = usePublicActions(names, true, () => void look());

  if (!post) {
    return (
      <Page>
        <Text variant="title">{t('Post')}</Text>
        <Text tone="muted">{t('This post is not here any more.')}</Text>
      </Page>
    );
  }

  const ctx = { ...actions.ctx(Date.now(), null), pollsAtOnce: true };
  const answer = (of: FeedPost) => <PublicRow key={of.id} item={{ kind: 'nostr', id: `nostr:${of.note}`, at: of.at, post: of }} ctx={ctx} borderColor={colors.border} />;
  return (
    <Page>
      <View>{answer(post)}</View>
      <Row wrap>
        {talk ? (
          <>
            <Text variant="caption" tone="muted">
              {plural(talk.likes, '{n} like', '{n} likes')}
            </Text>
            <Text variant="caption" tone="muted">
              {plural(talk.shares, '{n} share', '{n} shares')}
            </Text>
          </>
        ) : null}
      </Row>
      {talk && post.event ? <PostReactions post={post.event} reactions={talk.reactions} mode={ctx.images} onChange={(reactions) => setTalk((now) => now && { ...now, reactions })} /> : null}
      {/* A poll is answered by its votes. */}
      {post.poll ? null : <Button title={t('Reply')} onPress={() => actions.write(post.event)} />}
      <Text variant="overline" tone="muted">
        {t('Answers')}
      </Text>
      {talk?.answers.map(answer)}
      {looking ? <Text tone="muted">{t('Looking…')}</Text> : null}
      {!looking && talk && talk.answers.length === 0 && !said ? <Text tone="muted">{t('No answers were found.')}</Text> : null}
      {said ? <Text tone="muted">{said}</Text> : null}
      {!looking ? (
        <View style={{ paddingTop: space.sm }}>
          <Row>
            <Button title={t('Look again')} kind="secondary" compact onPress={() => void look()} />
          </Row>
        </View>
      ) : null}
      {actions.sheets}
    </Page>
  );
}
