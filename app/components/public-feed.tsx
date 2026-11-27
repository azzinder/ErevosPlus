// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { Image, Platform, Pressable, RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native';

import { ask, choose, confirm } from '../lib/alert';
import { MAX_OPTION, MAX_OPTIONS, MAX_QUESTION } from '../lib/chat-parts';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { canTor } from '../lib/core';
import { plural, t } from '../lib/i18n';
import { rowTime } from '../lib/inbox';
import type { MatrixFile, MatrixState } from '../lib/matrix';
import { matrixFile, matrixLearnJoins, matrixNow, matrixReact, matrixReply, onMatrixChange } from '../lib/matrix-store';
import { netThroughTor } from '../lib/net-http';
import { npubOf, shortMentions, shortNpub } from '../lib/nostr-dm';
import { canNostrTor, nostrChatsThroughTor } from '../lib/nostr-dm-net';
import type { NostrEvent } from '../lib/nostr-dm-net';
import {
  nostrDmDoneWith,
  nostrDmFeed,
  nostrDmFeedDone,
  nostrDmLike,
  nostrDmNow,
  nostrDmPollCount,
  nostrDmReactPost,
  nostrDmRepost,
  nostrDmStart,
  nostrDmTakeBack,
  nostrDmTakeBackReactions,
  nostrDmUnlike,
  nostrDmVote,
  nostrDmWritePoll,
  nostrDmWritePost,
  onNostrDmChange,
  sayFeedReport,
  sayFollowsReport,
  type PublicPhoto,
  nostrDmSetAccountTor,
  nostrDmTor,
} from '../lib/nostr-dm-store';
import { EMOJI_MOST, emojiOf, withEmoji } from '../lib/nostr-emoji';
import { morePosts, withoutMine, withReaction, type FeedPost, type PostReaction } from '../lib/nostr-feed';
import { POLL_LASTS, pollOpen, withMyVote, type PollCount } from '../lib/nostr-polls';
import { CAN_TAKE_PHOTOS, pickPhoto } from '../lib/pick-photo';
import { photoUri, releaseUri } from '../lib/photo-uri';
import { publicCard, publicPhoto, fetchesByItself, setPublicIpAsk, type FetchWhy, type LinkCard } from '../lib/public-fetch';
import { ipGate } from './ip-warning';
import { matrixFeed, mergeFeed, type PublicItem, type PublicShow } from '../lib/public-feed';
import { mediaIn, siteOf, type PublicImage, type PublicImages } from '../lib/public-media';
import { saveBytes } from '../lib/save-file';
import { loadCurrentSpaceData, updateCurrentSpaceData } from '../lock/space-data';
import { radius, space, withAlpha } from '../theme/colors';
import { useColors } from '../theme/context';

import { FileViewer } from './attachment';
import { KeyFace } from './key-face';
import { LinkedText, openLink } from './linked-text';
import { NetworkPicture } from './network-picture';
import { Button, Chip, Row, Sheet, Text, TextButton, Toggle, Input } from './ui';

// The Public tab of home (app/index.tsx), as a Nostr client such as Amethyst has its feed: the
// public posts of the people the space's Nostr key follows and those they shared again, and the
// messages of the public Matrix rooms the space is in, as one list, newest first. Each row has its
// writer's face (a small N or M says the network), name and time, the words, the photos inside the
// post and a card for its link, and what can be done with it: answer, share it again, like it,
// share it, and for Matrix answer, react and share. Nostr posts are looked up thirty at a time, more
// as the list comes to its end, the newest again when it is pulled down (lib/nostr-dm-store.ts
// nostrDmFeed), as the space's Tor way says; the Matrix ones are the rooms' own messages
// (lib/public-feed.ts). A photo or a card is fetched only while its row shows, and only as the
// owner chose under Photos (lib/public-fetch.ts): at once, only through Tor, or on a tap. What is
// held is held in memory while the feed shows, never kept; a post's custom emoji (NIP-30) are
// pictures fetched the same way, their :shortcode: until then. A poll (NIP-88, lib/nostr-polls.ts)
// shows its options, voted on with a tap while it is open, and how it stands when asked; one is
// made in the sheet of a new post, open for a day, three days or a week. Answering, sharing again,
// liking (a second tap takes it back, NIP-09), reacting, voting and new posts are public and signed
// with the space's own Nostr key (lib/nostr-dm-store.ts): home never shows a hidden place's.

// Longer posts show this many characters until Show all.
const LONG = 700;
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const PHOTOS_MOST = 4;
const NOSTR_COLOR = '#8E4EC6';
const MATRIX_COLOR = '#12A594';

// The likes going out now, by post: a second tap while one goes sends no second like.
const liking = new Set<string>();

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

// The post the screen of one post (app/public-post.tsx) shows: handed over here, never in the
// address, since a post is not a short text.
let handed: { post: FeedPost; names: Record<string, string> } | null = null;

/** Hands a post to the screen that shows it on its own, with the names known for its writers. */
export function showPost(post: FeedPost, names: Record<string, string>): void {
  handed = { post, names };
}

/** The post handed over by showPost, or null when none was. */
export function postShown(): { post: FeedPost; names: Record<string, string> } | null {
  return handed;
}

/** Lets go of the post handed over: as its screen closes. */
export function dropPost(): void {
  handed = null;
}

/** What the space's Nostr account is: still loading, without a key, or with one. */
export type NostrAccount = 'loading' | 'none' | 'ready';

// What the rows may do and how they show, the same for every row of a list.
type Ctx = {
  now: number;
  me: string;
  /** How photos and cards are fetched; null until it is read, when none is fetched. */
  images: PublicImages | null;
  /** A poll's results are looked up as it shows (a post's own screen), not only when asked for. */
  pollsAtOnce?: boolean;
  cards: boolean;
  nameOf: (key: string) => string;
  named: (key: string) => boolean;
  state: MatrixState | null;
  onPerson: (key: string) => void;
  onOpen?: (post: FeedPost) => void;
  onAnswer: (item: PublicItem) => void;
  onShareAgain: (event: NostrEvent) => void;
  onLike: (event: NostrEvent) => void;
  onShare: (item: PublicItem) => void;
  onReact: (item: Extract<PublicItem, { kind: 'matrix' }>, emoji?: string) => void;
  onMore: (item: PublicItem) => void;
};

type Writing = { to?: NostrEvent; roomId?: string; eventId?: string; room?: string };

/**
 * The sheets and the doings of the rows of a feed, for the list of home and for the screen of a
 * post (app/public-post.tsx): writing a post or an answer, reacting, the menu of a row, the sheet of
 * a person, and the Photos settings. `shown` is whether the feed shows now: nothing is read or
 * fetched while it does not. `posted` is told when a post of ours went.
 */
export function usePublicActions(names: Record<string, string>, shown: boolean, posted?: () => void) {
  const [images, setImages] = useState<PublicImages | null>(null);
  const [cards, setCards] = useState(true);
  const [writing, setWriting] = useState<Writing | null>(null);
  const [reacting, setReacting] = useState<{ roomId: string; eventId: string } | null>(null);
  const [reactSaid, setReactSaid] = useState('');
  const [menu, setMenu] = useState<PublicItem | null>(null);
  const [menuSaid, setMenuSaid] = useState('');
  const [person, setPerson] = useState<string | null>(null);
  const [personSaid, setPersonSaid] = useState('');
  const [settings, setSettings] = useState(false);
  const [, setTick] = useState(0);
  const me = nostrDmNow().state?.public ?? '';

  useEffect(() => {
    if (!shown) return;
    let alive = true;
    void loadCurrentSpaceData()
      .then((data) => {
        if (!alive) return;
        setImages(data.publicImages);
        setCards(data.publicCards);
      })
      .catch(() => {});
    return () => {
      alive = false;
      setImages(null);
      setWriting(null);
      setReacting(null);
      setMenu(null);
      setPerson(null);
      setSettings(false);
    };
  }, [shown]);

  const nameOf = (key: string) => names[key] || shortNpub(npubOf(key));
  const named = (key: string) => !!names[key];

  const fail = (error: unknown) => ask(t('Not done'), errorText(error), [{ text: t('OK') }]);

  async function share(url: string) {
    try {
      // A computer has no share sheet: the link is copied, to paste where it should go.
      if (Platform.OS === 'web') {
        const done = await copyText(url);
        ask(done ? t('Link copied') : t('Not copied.'), done ? url : '', [{ text: t('OK') }]);
        return;
      }
      await Share.share({ message: url });
    } catch (error) {
      fail(error);
    }
  }

  async function writeTo(key: string) {
    setPersonSaid('');
    try {
      const chat = nostrDmNow().state?.chats[key] ? key : await nostrDmStart(npubOf(key));
      setPerson(null);
      setMenu(null);
      router.push({ pathname: '/nostr-chat', params: { key: chat } });
    } catch (error) {
      setPersonSaid(errorText(error));
    }
  }

  function postsOf(key: string) {
    setPerson(null);
    setMenu(null);
    router.push({ pathname: '/nostr-posts', params: { key, ...(names[key] ? { name: names[key] } : {}) } });
  }

  const ctx = (now: number, state: MatrixState | null): Ctx => ({
    now,
    me,
    images,
    cards,
    nameOf,
    named,
    state,
    onPerson: (key) => {
      setPersonSaid('');
      setPerson(key);
    },
    onAnswer: (item) => {
      if (item.kind === 'nostr') {
        if (item.post.event) setWriting({ to: item.post.event });
      } else setWriting({ roomId: item.roomId, eventId: item.message.id, room: item.room });
    },
    onShareAgain: (event) => {
      void choose(t('Share again'), t('Share this post again with your followers?'), t('Cancel'), t('Share again')).then(async (yes) => {
        if (!yes) return;
        try {
          await nostrDmRepost(event);
        } catch (error) {
          fail(error);
        }
      });
    },
    // A second tap takes the like back.
    onLike: (event) => {
      if (liking.has(event.id)) return;
      liking.add(event.id);
      void mayPost()
        .then((go) => (go ? (nostrDmDoneWith(event.id).liked ? nostrDmUnlike(event) : nostrDmLike(event)) : undefined))
        .catch(fail)
        .finally(() => liking.delete(event.id));
    },
    onShare: (item) => void share(item.kind === 'nostr' ? `https://njump.me/${item.post.note}` : `https://matrix.to/#/${item.roomId}/${item.message.id}`),
    onReact: (item, emoji) => {
      if (emoji) void matrixReact(item.roomId, item.message.id, emoji).then(() => setTick((n) => n + 1)).catch(fail);
      else {
        setReactSaid('');
        setReacting({ roomId: item.roomId, eventId: item.message.id });
      }
    },
    onMore: (item) => {
      setMenuSaid('');
      setMenu(item);
    },
  });

  async function copyWords(text: string) {
    setMenuSaid((await copyText(text)) ? t('Copied. Any app that reads the clipboard can read it now.') : t('Not copied.'));
  }

  async function takeBack(event: NostrEvent) {
    setMenu(null);
    if (!(await confirm(t('Take back this post?'), t('The servers that keep it are asked to drop it. Copies that others made may stay.'), t('Take back')))) return;
    try {
      if (!(await mayPost())) return;
      await nostrDmTakeBack(event);
      posted?.();
    } catch (error) {
      fail(error);
    }
  }

  const personActions = (key: string) => (
    <>
      <Button title={t('Public posts')} kind="secondary" onPress={() => postsOf(key)} />
      {key !== me ? <Button title={t('Write to them')} onPress={() => void writeTo(key)} /> : null}
      {personSaid ? <Text tone="muted">{personSaid}</Text> : null}
    </>
  );

  const menuWords = menu ? (menu.kind === 'nostr' ? shortMentions(menu.post.text) : menu.message.text) : '';
  const sheets = (
    <>
      <Sheet visible={person !== null} onClose={() => setPerson(null)} title={person ? nameOf(person) : undefined}>
        {person ? (
          <>
            <Text selectable variant="mono" tone="faint">
              {npubOf(person)}
            </Text>
            {personActions(person)}
          </>
        ) : null}
      </Sheet>
      <Sheet visible={menu !== null} onClose={() => setMenu(null)}>
        {menu ? (
          <>
            {CAN_COPY && menuWords ? <Button title={t('Copy text')} kind="secondary" onPress={() => void copyWords(menuWords)} /> : null}
            {menu.kind === 'nostr' ? (
              <>
                {personActions(menu.post.sharedFrom ?? menu.post.by)}
                {menu.post.event && menu.post.event.pubkey === me ? <Button title={t('Take back')} kind="secondary" onPress={() => void takeBack(menu.post.event!)} /> : null}
              </>
            ) : (
              <Button
                title={t('Open the room')}
                kind="secondary"
                onPress={() => {
                  const roomId = menu.roomId;
                  setMenu(null);
                  router.push({ pathname: '/matrix-chat', params: { room: roomId } });
                }}
              />
            )}
            {menuSaid ? <Text tone="muted">{menuSaid}</Text> : null}
          </>
        ) : null}
      </Sheet>
      <Sheet visible={reacting !== null} onClose={() => setReacting(null)} title={t('React')}>
        <Row wrap>
          {REACTIONS.map((emoji) => (
            <Pressable
              key={emoji}
              accessibilityRole="button"
              accessibilityLabel={emoji}
              onPress={() => {
                const target = reacting;
                if (!target) return;
                setReactSaid('');
                void matrixReact(target.roomId, target.eventId, emoji)
                  .then(() => setReacting(null))
                  .catch((error) => setReactSaid(errorText(error)));
              }}
              style={({ pressed }) => [styles.emoji, pressed && { opacity: 0.6 }]}
            >
              <Text style={{ fontSize: 28, lineHeight: 36 }}>{emoji}</Text>
            </Pressable>
          ))}
        </Row>
        {reactSaid ? <Text tone="muted">{reactSaid}</Text> : null}
      </Sheet>
      <WriteSheet
        writing={writing}
        onClose={() => setWriting(null)}
        onDone={() => {
          setWriting(null);
          posted?.();
        }}
      />
      <PhotosSheet
        visible={settings}
        images={images ?? 'always'}
        cards={cards}
        onClose={() => setSettings(false)}
        onChange={(next) => {
          if (next.images !== undefined) setImages(next.images);
          if (next.cards !== undefined) setCards(next.cards);
          void updateCurrentSpaceData({ ...(next.images !== undefined ? { publicImages: next.images } : {}), ...(next.cards !== undefined ? { publicCards: next.cards } : {}) }).catch(() => {});
        }}
      />
    </>
  );

  return {
    ctx,
    sheets,
    /** Opens the sheet to write a new post, or an answer to `to`. */
    write: (to?: NostrEvent) => setWriting(to ? { to } : {}),
    openPhotos: () => setSettings(true),
    /** Draws the rows again, as something of theirs changed. */
    changed: () => setTick((n) => n + 1),
  };
}

type Picked = { bytes: Uint8Array; mime: string; w?: number; h?: number; uri: string };

/**
 * The sheet to write a post, a Nostr one with photos or an answer to a Matrix message; or a Nostr
 * poll (NIP-88), its words the question, open for as long as chosen: its end closes it.
 */
function WriteSheet({ writing, onClose, onDone }: { writing: Writing | null; onClose: () => void; onDone: () => void }) {
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<Picked[]>([]);
  const [polling, setPolling] = useState(false);
  const [options, setOptions] = useState(['', '']);
  const [multiple, setMultiple] = useState(false);
  const [lasts, setLasts] = useState(POLL_LASTS[0]);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState('');
  const held = useRef<Picked[]>([]);
  held.current = photos;
  const open = writing !== null;
  const matrix = !!writing?.roomId;
  // A poll is a post of its own, never an answer.
  const canPoll = !matrix && !writing?.to;
  const poll = canPoll && polling;
  const pollReady = !!text.trim() && options.filter((o) => o.trim()).length >= 2;

  // What was written or chosen goes when the sheet closes; the photos' addresses are let go.
  useEffect(() => {
    if (open) return;
    for (const photo of held.current) releaseUri(photo.uri);
    setText('');
    setPhotos([]);
    setPolling(false);
    setOptions(['', '']);
    setMultiple(false);
    setLasts(POLL_LASTS[0]);
    setSaid('');
    setBusy(false);
  }, [open]);
  useEffect(
    () => () => {
      for (const photo of held.current) releaseUri(photo.uri);
    },
    [],
  );

  async function add(from: 'photos' | 'camera') {
    setSaid('');
    try {
      const got = await pickPhoto(from, 90);
      if (got) setPhotos((now) => [...now, { bytes: got.bytes, mime: got.mime, w: got.w, h: got.h, uri: photoUri(got.bytes, got.mime) }].slice(0, PHOTOS_MOST));
    } catch (error) {
      setSaid(errorText(error));
    }
  }

  function remove(at: number) {
    setPhotos((now) => {
      releaseUri(now[at].uri);
      return now.filter((_, i) => i !== at);
    });
  }

  async function send() {
    if (!writing || busy) return;
    setBusy(true);
    setSaid('');
    try {
      if (writing.roomId && writing.eventId) {
        if (!text.trim()) throw new Error(t('Write something first.'));
        await matrixReply(writing.roomId, text.trim(), writing.eventId);
      } else if (!(await mayPost())) {
        return;
      } else if (poll) {
        await nostrDmWritePoll(text, options, multiple, Math.floor(Date.now() / 1000) + lasts);
      } else {
        const files: PublicPhoto[] = photos.map(({ bytes, mime, w, h }) => ({ bytes, mime, w, h }));
        await nostrDmWritePost(text, files, writing.to);
      }
      onDone();
    } catch (error) {
      setSaid(errorText(error));
      setBusy(false);
    }
  }

  return (
    <Sheet visible={open} onClose={onClose} title={matrix ? t('Reply in {room}', { room: writing?.room ?? '' }) : writing?.to ? t('Reply') : poll ? t('New poll') : t('New post')}>
      {canPoll ? (
        <Row wrap>
          <Chip label={t('Poll')} selected={polling} onPress={() => setPolling((now) => !now)} />
        </Row>
      ) : null}
      <Input
        value={text}
        onChangeText={setText}
        multiline={!poll}
        maxLength={poll ? MAX_QUESTION : undefined}
        placeholder={poll ? t('Ask something') : t('Write something')}
        accessibilityLabel={poll ? t('Question') : undefined}
        style={poll ? undefined : { minHeight: 110, textAlignVertical: 'top' }}
      />
      {poll ? (
        <>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 260 }} contentContainerStyle={{ gap: space.xs }} keyboardShouldPersistTaps="handled">
            {options.map((option, i) => (
              <Input
                key={i}
                value={option}
                onChangeText={(next) => setOptions((now) => now.map((o, j) => (j === i ? next : o)))}
                maxLength={MAX_OPTION}
                placeholder={t('Option {n}', { n: i + 1 })}
              />
            ))}
          </ScrollView>
          <Row wrap>
            {options.length < MAX_OPTIONS ? <TextButton title={t('Add an option')} onPress={() => setOptions((now) => [...now, ''])} /> : null}
            <Chip label={t('More than one answer')} selected={multiple} onPress={() => setMultiple((now) => !now)} />
          </Row>
          <Text variant="caption" tone="muted">
            {t('Open for')}
          </Text>
          <Row wrap>
            {POLL_LASTS.map((seconds) => (
              <Chip key={seconds} label={lastsLabel(seconds)} selected={lasts === seconds} onPress={() => setLasts(seconds)} />
            ))}
          </Row>
        </>
      ) : null}
      {!matrix && !poll ? (
        <>
          {photos.length ? (
            <Row wrap>
              {photos.map((photo, at) => (
                <View key={photo.uri} style={styles.thumbBox}>
                  <Image source={{ uri: photo.uri }} style={styles.thumb} accessibilityIgnoresInvertColors />
                  <Pressable onPress={() => remove(at)} accessibilityRole="button" accessibilityLabel={t('Remove')} style={styles.thumbRemove} hitSlop={6}>
                    <Text variant="label" color="#ffffff">
                      ×
                    </Text>
                  </Pressable>
                </View>
              ))}
            </Row>
          ) : null}
          {photos.length < PHOTOS_MOST ? (
            <Row wrap>
              <Button title={t('Add a photo')} kind="secondary" compact disabled={busy} onPress={() => void add('photos')} />
              {CAN_TAKE_PHOTOS ? <Button title={t('Take a photo')} kind="secondary" compact disabled={busy} onPress={() => void add('camera')} /> : null}
            </Row>
          ) : null}
        </>
      ) : null}
      <Text variant="caption" tone="muted">
        {matrix ? t('Everyone in the room can read it.') : t('This post is public and signed with the Nostr key of this space. Anyone can read it, and it shows it is yours.')}
      </Text>
      {said ? <Text tone="muted">{said}</Text> : null}
      <Button title={t('Post')} loading={busy} disabled={poll && !pollReady} onPress={() => void send()} />
    </Sheet>
  );
}

/** How long a poll is open, as its chip says: in days, or weeks. */
function lastsLabel(seconds: number): string {
  const days = Math.round(seconds / (24 * 3600));
  return days % 7 === 0 ? plural(days / 7, '{n} week', '{n} weeks') : plural(days, '{n} day', '{n} days');
}

/**
 * Before what the space's Nostr key posts, likes, votes on or takes back can show this phone's
 * address to the relays (lib/ip-warning.ts): unless the account goes through Tor now, said once,
 * with Always through Tor for the account as the way not to, where there is Tor.
 */
async function mayPost(): Promise<boolean> {
  if (nostrChatsThroughTor(nostrDmTor())) return true;
  return ipGate({ network: 'Nostr', act: 'send', of: 'public posts' }, canNostrTor() ? { label: t('Always through Tor'), run: () => nostrDmSetAccountTor('always') } : undefined);
}

/** The sheet of how photos and link cards are fetched (SpaceData.publicImages, publicCards). */
function PhotosSheet({ visible, images, cards, onClose, onChange }: { visible: boolean; images: PublicImages; cards: boolean; onClose: () => void; onChange: (next: { images?: PublicImages; cards?: boolean }) => void }) {
  const colors = useColors();
  const options: { value: PublicImages; title: string; text: string }[] = [
    { value: 'always', title: t('Always'), text: t('They show at once, as in Amethyst. Through Tor when Tor is on in this space.') },
    { value: 'tor', title: t('Only through Tor'), text: t('They show only when Tor is on; otherwise they wait for a tap.') },
    { value: 'tap', title: t('On a tap'), text: t('No photo comes before you tap it.') },
  ];
  return (
    <Sheet visible={visible} onClose={onClose} title={t('Photos in public posts')}>
      <Text tone="muted">{t('A photo or a link preview comes from the server where whoever wrote the post put it. That server sees that someone opened it.')}</Text>
      {options.map((option) => {
        const on = images === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange({ images: option.value })}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            style={[styles.option, { backgroundColor: on ? withAlpha(colors.primary, 0.16) : 'transparent' }]}
          >
            <View style={[styles.radio, { borderColor: on ? colors.primary : colors.border }]}>{on ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}</View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong">{option.title}</Text>
              <Text variant="caption" tone="muted">
                {option.text}
              </Text>
            </View>
          </Pressable>
        );
      })}
      <Pressable onPress={() => onChange({ cards: !cards })} accessibilityRole="switch" accessibilityState={{ checked: cards }} style={[styles.option, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, borderRadius: 0 }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">{t('Link previews')}</Text>
          <Text variant="caption" tone="muted">
            {t('The title and picture of the page under the link.')}
          </Text>
        </View>
        <Toggle on={cards} />
      </Pressable>
    </Sheet>
  );
}

type Feed = { posts: FeedPost[]; until?: number; older: boolean };
const NO_FEED: Feed = { posts: [], older: false };

/**
 * The feed of the Public tab, for home's list to show while `shown`: its rows and how each shows,
 * the words and choices above them, what shows with none or under them, pulling down for the
 * newest (`refreshControl`), coming to the end for older ones (`more`), and its sheets. The Nostr
 * posts are looked up while `account` is ready, the Matrix messages are those of the public rooms
 * when `matrixOn`; either alone works. What it found goes as soon as it is no longer shown.
 */
export function usePublicFeed(account: NostrAccount, matrixOn: boolean, shown: boolean) {
  const colors = useColors();
  const [feed, setFeed] = useState<Feed>(NO_FEED);
  const [names, setNames] = useState<Record<string, string>>({});
  const [looking, setLooking] = useState<'newest' | 'older' | null>(null);
  const [looked, setLooked] = useState(false);
  const [follows, setFollows] = useState<number | null>(null);
  // Why the newest page has no Nostr post: how the follow list's look-up went, or the posts' ask,
  // a line each, the first the reason.
  const [why, setWhy] = useState<string[]>([]);
  const [said, setSaid] = useState('');
  const [filter, setFilter] = useState<PublicShow>('all');
  const [matrixTick, setMatrixTick] = useState(0);
  // A photo or card fetched without Tor shows this phone's address to its site: said once before (lib/ip-warning.ts).
  useEffect(() => {
    setPublicIpAsk(() => ipGate({ network: 'Nostr', act: 'preview', of: 'public feed' }));
    return () => setPublicIpAsk(null);
  }, []);
  const [nostrTick, setNostrTick] = useState(0);
  const current = useRef(feed);
  current.current = feed;
  // Which showing a look-up is for, and whether one is going.
  const showing = useRef(0);
  const busy = useRef(false);
  const nostrOn = account === 'ready';
  const on = shown && nostrOn;
  const me = nostrDmNow().state?.public ?? '';

  async function look(older: boolean) {
    if (busy.current) return;
    const before = older ? current.current : NO_FEED;
    if (older && (!before.older || before.until === undefined)) return;
    busy.current = true;
    const at = showing.current;
    setLooking(older ? 'older' : 'newest');
    setSaid('');
    try {
      const page = await nostrDmFeed(older ? before.until : undefined, before.posts);
      if (at !== showing.current) return;
      setFollows(page.follows);
      // A list found and checked that names no one: the key follows no one, as the text says.
      if (!older) setWhy(page.posts.length ? [] : page.report ? (page.report.checked > 0 ? [] : sayFollowsReport(page.report, me)) : page.follows ? sayFeedReport(page) : []);
      setNames((known) => ({ ...(older ? known : {}), ...page.names }));
      setFeed({ posts: morePosts(before.posts, page.posts), until: page.until, older: page.older });
      if (!page.answered) setSaid(t('No server answered. Try again in a while.'));
    } catch (error) {
      if (at === showing.current) setSaid(errorText(error));
    } finally {
      if (at === showing.current) {
        busy.current = false;
        setLooking(null);
        setLooked(true);
      }
    }
  }

  useEffect(() => {
    if (!on) return;
    void look(false);
    return () => {
      // Nothing of it stays once it is not shown.
      showing.current += 1;
      busy.current = false;
      setFeed(NO_FEED);
      setNames({});
      setLooking(null);
      setLooked(false);
      setFollows(null);
      setWhy([]);
      setSaid('');
      nostrDmFeedDone();
    };
  }, [on, me]);

  // The Matrix rooms: which are public is learned once as the feed shows, and the messages come
  // as the account changes.
  useEffect(() => {
    if (!shown || !matrixOn) return;
    void matrixLearnJoins().catch(() => 0);
    return onMatrixChange(() => setMatrixTick((n) => n + 1));
  }, [shown, matrixOn]);
  useEffect(() => (shown ? onNostrDmChange(() => setNostrTick((n) => n + 1)) : undefined), [shown]);

  const matrixState = shown && matrixOn ? matrixNow().state : null;
  const matrixItems = useMemo(() => (matrixState ? matrixFeed(matrixState) : []), [matrixState, matrixTick]);
  const both = nostrOn && matrixOn;
  const show: PublicShow = both ? filter : nostrOn ? 'nostr' : 'matrix';
  const items = useMemo(() => (shown ? mergeFeed(feed.posts, matrixItems, show, feed.older) : []), [shown, feed, matrixItems, show]);

  const actions = usePublicActions(names, shown, () => void look(false));
  const now = Date.now();
  const lookAgain = <Button title={t('Look again')} kind="secondary" compact onPress={() => void look(false)} />;

  const intro = (
    <View style={styles.intro}>
      <Text variant="caption" tone="muted">
        {t('The public posts of the people you follow and the public Matrix rooms you are in, newest first.')}
      </Text>
      {canTor() && nostrOn ? (
        <Text variant="caption" tone="faint">
          {nostrChatsThroughTor(nostrDmTor())
            ? t('Through Tor: the Nostr servers do not see your address.')
            : t('Not through Tor now: the Nostr servers see your address. Tor for this account is under Settings → Server and networks → Nostr chats.')}
        </Text>
      ) : null}
      <Row wrap style={{ paddingTop: space.xs }}>
        {both ? (
          <>
            <Chip label={t('All')} selected={filter === 'all'} onPress={() => setFilter('all')} />
            <Chip label="Nostr" selected={filter === 'nostr'} onPress={() => setFilter('nostr')} />
            <Chip label="Matrix" selected={filter === 'matrix'} onPress={() => setFilter('matrix')} />
          </>
        ) : null}
        <Chip label={t('Photos')} onPress={actions.openPhotos} />
        {/* No pulling down in a browser. */}
        {Platform.OS === 'web' && looked && !looking && items.length && nostrOn ? lookAgain : null}
      </Row>
    </View>
  );

  // Why no Nostr post came, while the Nostr posts show: the follow list not found, or none sent.
  const reasons = !said && nostrOn && show !== 'matrix' ? why : [];
  const empty =
    account === 'loading' && !matrixOn ? null : account === 'none' && !matrixOn ? (
      <View style={styles.empty}>
        <Text tone="muted">{t('This space has no Nostr key yet. Make one, or bring the one of your other Nostr app, under Nostr chats.')}</Text>
        <Row>
          <Button title={t('Nostr chats')} kind="secondary" compact onPress={() => router.push('/nostr-chats')} />
        </Row>
      </View>
    ) : nostrOn && (looking || !looked) ? (
      <Text tone="muted" style={styles.empty}>
        {t('Looking…')}
      </Text>
    ) : (
      <View style={styles.empty}>
        <Text tone="muted">
          {said ||
            reasons[0] ||
            (nostrOn && follows === 0 && (!matrixOn || show === 'nostr')
              ? t('Your Nostr key follows no one yet. Follow people with it in another Nostr app, such as Amethyst or Primal, and their posts show here.')
              : t('No public posts were found.'))}
        </Text>
        {reasons.slice(1).map((line, i) => (
          <Text key={i} variant="caption" tone="faint">
            {line}
          </Text>
        ))}
        {nostrOn ? <Row>{lookAgain}</Row> : null}
      </View>
    );

  const footer = items.length ? (
    <View style={styles.footer}>
      {looking === 'older' ? <Text tone="muted">{t('Looking…')}</Text> : null}
      {said && !looking ? <Text tone="muted">{said}</Text> : null}
      {feed.older && !looking && nostrOn && show !== 'matrix' ? (
        <Row>
          <Button title={t('Older posts')} kind="secondary" compact onPress={() => void look(true)} />
        </Row>
      ) : null}
    </View>
  ) : null;

  const open = (post: FeedPost) => {
    showPost(post, names);
    router.push('/public-post');
  };
  const ctx = { ...actions.ctx(now, matrixState), onOpen: open };

  const refreshing = on && looking === 'newest' && items.length > 0;
  return {
    items,
    render: (item: PublicItem): ReactElement => <PublicRow item={item} ctx={ctx} borderColor={colors.border} />,
    intro,
    empty,
    footer,
    sheet: actions.sheets,
    /** Opens the sheet to write a new post. */
    post: () => actions.write(),
    // Pulled down, the posts show the newest again. For the list always, on only while they show:
    // Android puts a list that has one in a view of its own, which would draw the list anew. Not
    // in a browser, which has no pulling down, and where it would keep the list from scrolling.
    refreshControl:
      Platform.OS === 'web' ? undefined : (
        <RefreshControl
          enabled={on}
          refreshing={refreshing}
          onRefresh={() => {
            if (on) void look(false);
          }}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      ),
    // Coming to the end of the list, the older ones.
    more: () => {
      if (on && feed.posts.length && !looking && show !== 'matrix') void look(true);
    },
    // For the list to draw its rows again when a name, the feed or what was done with a post changes.
    extra: { feed, names, matrixItems, show, nostrTick, matrixTick, images: ctx.images, cards: ctx.cards },
  };
}

/** One row of the feed: a Nostr post or a Matrix message. */
export function PublicRow({ item, ctx, borderColor }: { item: PublicItem; ctx: Ctx; borderColor: string }) {
  return item.kind === 'nostr' ? <NostrRow post={item.post} ctx={ctx} borderColor={borderColor} /> : <MatrixRow item={item} ctx={ctx} borderColor={borderColor} />;
}

function Badge({ network }: { network: 'nostr' | 'matrix' }) {
  return (
    <View style={[styles.badge, { backgroundColor: network === 'nostr' ? NOSTR_COLOR : MATRIX_COLOR }]}>
      <Text variant="caption" color="#ffffff" style={{ fontSize: 9, lineHeight: 12, fontWeight: '700' }}>
        {network === 'nostr' ? 'N' : 'M'}
      </Text>
    </View>
  );
}

function Face({ network, children }: { network: 'nostr' | 'matrix'; children: ReactElement }) {
  return (
    <View style={styles.face}>
      {children}
      <Badge network={network} />
    </View>
  );
}

function Act({ glyph, label, onPress, active, color, count }: { glyph: string; label: string; onPress?: () => void; active?: boolean; color?: string; count?: number }) {
  const colors = useColors();
  const tint = active ? (color ?? colors.primary) : colors.textMuted;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={({ pressed }) => [styles.act, pressed && { opacity: 0.6 }]}>
      <Text color={tint} style={{ fontSize: 20, lineHeight: 24 }}>
        {glyph}
      </Text>
      {count ? (
        <Text variant="caption" color={tint}>
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Header({ name, sub, time, onName, onMore }: { name: string; sub?: string; time: string; onName?: () => void; onMore: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.head}>
      <Pressable onPress={onName} disabled={!onName} accessibilityRole="button" accessibilityLabel={name} style={{ flex: 1, gap: 1 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
        {sub ? (
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </Pressable>
      <Text variant="caption" tone="faint">
        {time}
      </Text>
      <Pressable onPress={onMore} accessibilityRole="button" accessibilityLabel={t('More')} hitSlop={8} style={{ paddingHorizontal: 4 }}>
        <Text color={colors.textMuted} style={{ fontSize: 18, lineHeight: 20, fontWeight: '700' }}>
          ⋮
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * A custom emoji of a post (NIP-30), in its words or as a reaction: its picture, fetched as the
 * post's photos are (lib/public-fetch.ts), or until then its :shortcode:, which a tap fetches
 * (`tappable`) when the feed does not by itself.
 */
function Emoji({ code, url, mode, size = 20, tappable = true }: { code: string; url: string; mode: PublicImages | null; size?: number; tappable?: boolean }) {
  const { held, state, tap } = useHeld((why) => publicPhoto(url, mode ?? 'tap', why), mode !== null && fetchesByItself(mode), url);
  if (held) return <Image source={{ uri: held.uri }} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel={`:${code}:`} />;
  return (
    <Text onPress={tappable && mode !== null && state !== 'loading' ? tap : undefined} variant={size < 20 ? 'caption' : undefined}>
      {`:${code}:`}
    </Text>
  );
}

/** The words of a post: a long one shows its start until Show all; a content warning covers them until asked for. Its custom emoji show as pictures (`emoji`, by shortcode). */
function Words({ text, warning, emoji, mode }: { text: string; warning?: string; emoji?: ReadonlyMap<string, string>; mode?: PublicImages | null }) {
  const [open, setOpen] = useState(warning === undefined);
  const [whole, setWhole] = useState(false);
  const long = text.length > LONG;
  const shownText = long && !whole ? `${text.slice(0, LONG)}…` : text;
  // Pictures for EMOJI_MOST of them at most; the rest stay their :shortcode:.
  let pictures = 0;
  const parts = emoji?.size ? withEmoji(shownText, emoji) : null;
  if (!open) {
    return (
      <>
        <Text tone="muted">{warning ? t('Content warning: {reason}', { reason: warning }) : t('Content warning')}</Text>
        <Row>
          <Button title={t('Show')} kind="secondary" compact onPress={() => setOpen(true)} />
        </Row>
      </>
    );
  }
  if (!text) return null;
  return (
    <>
      <Text selectable>
        {parts
          ? parts.map((part, i) =>
              'code' in part ? (
                (pictures += 1) <= EMOJI_MOST ? (
                  <Emoji key={i} code={part.code} url={part.url} mode={mode ?? null} />
                ) : (
                  `:${part.code}:`
                )
              ) : (
                <LinkedText key={i} text={part.text} />
              ),
            )
          : <LinkedText text={shownText} />}
      </Text>
      {long && !whole ? <TextButton title={t('Show all')} onPress={() => setWhole(true)} /> : null}
    </>
  );
}

function NostrRow({ post, ctx, borderColor }: { post: FeedPost; ctx: Ctx; borderColor: string }) {
  const author = post.sharedFrom ?? post.by;
  const name = ctx.nameOf(author);
  const event = post.event;
  const media = useMemo(() => mediaIn(shortMentions(post.text), event?.tags ?? []), [post.text, event]);
  const emoji = useMemo(() => emojiOf(event?.tags ?? []), [event]);
  const done = event ? nostrDmDoneWith(event.id) : { liked: false, shared: false };
  const colors = useColors();
  return (
    <View style={[styles.row, { borderBottomColor: borderColor }]}>
      {post.sharedFrom ? (
        <Pressable onPress={() => ctx.onPerson(post.by)} accessibilityRole="button" hitSlop={4} style={styles.note}>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {t('Shared by {name}', { name: ctx.nameOf(post.by) })}
          </Text>
        </Pressable>
      ) : null}
      <View style={styles.line}>
        <Pressable onPress={() => ctx.onPerson(author)} accessibilityRole="button" accessibilityLabel={name}>
          <Face network="nostr">
            <KeyFace identity={author} name={ctx.named(author) ? name : undefined} size={40} />
          </Face>
        </Pressable>
        <View style={styles.body}>
          <Header name={name} sub={ctx.named(author) ? shortNpub(npubOf(author)) : undefined} time={rowTime(post.at, ctx.now)} onName={() => ctx.onPerson(author)} onMore={() => ctx.onMore({ kind: 'nostr', id: `nostr:${post.note}`, at: post.at, post })} />
          {post.answer ? (
            <Text variant="caption" tone="muted">
              {t('An answer to another post')}
            </Text>
          ) : null}
          <Pressable onPress={ctx.onOpen ? () => ctx.onOpen?.(post) : undefined} disabled={!ctx.onOpen} accessibilityRole="button" style={{ gap: space.xs + 2 }}>
            <Words text={media.text} warning={post.warning} emoji={emoji} mode={ctx.images} />
          </Pressable>
          {post.warning === undefined ? <Media media={media} ctx={ctx} /> : null}
          {post.poll && event ? <PollBox poll={post.poll} event={event} atOnce={!!ctx.pollsAtOnce} /> : null}
          <View style={styles.acts}>
            {/* A poll is answered by its votes: NIP-10 answers are for posts. */}
            {post.poll ? null : <Act glyph="↩" label={t('Reply')} onPress={() => ctx.onAnswer({ kind: 'nostr', id: `nostr:${post.note}`, at: post.at, post })} />}
            <Act glyph="⇄" label={t('Share again')} active={done.shared} onPress={() => event && ctx.onShareAgain(event)} />
            <Act glyph={done.liked ? '♥' : '♡'} label={t('Like')} active={done.liked} color={colors.danger} onPress={() => event && ctx.onLike(event)} />
            <Act glyph="↗" label={t('Share')} onPress={() => ctx.onShare({ kind: 'nostr', id: `nostr:${post.note}`, at: post.at, post })} />
          </View>
        </View>
      </View>
    </View>
  );
}

const localpart = (id: string) => (id.startsWith('@') && id.includes(':') ? id.slice(1, id.indexOf(':')) : id);

function MatrixRow({ item, ctx, borderColor }: { item: Extract<PublicItem, { kind: 'matrix' }>; ctx: Ctx; borderColor: string }) {
  const colors = useColors();
  const { message } = item;
  const member = ctx.state?.rooms[item.roomId]?.members[message.sender];
  const name = member?.name || localpart(message.sender);
  const media = useMemo(() => mediaIn(message.text || message.poll?.q || ''), [message.text, message.poll]);
  const file = message.file?.kind === 'image' ? message.file : null;
  const reactions = Object.entries(message.reactions ?? {}).filter(([, who]) => who.length > 0);
  const mine = ctx.state?.userId;
  return (
    <View style={[styles.row, { borderBottomColor: borderColor }]}>
      <View style={styles.line}>
        <Face network="matrix">{member?.avatar ? <NetworkPicture network="matrix" of={member.avatar} size={40} fallback={name.slice(0, 1).toUpperCase()} /> : <KeyFace identity={message.sender} name={name} size={40} />}</Face>
        <View style={styles.body}>
          <Header name={name} time={rowTime(item.at, ctx.now)} onMore={() => ctx.onMore(item)} />
          <Pressable onPress={() => router.push({ pathname: '/matrix-chat', params: { room: item.roomId } })} accessibilityRole="button" hitSlop={4}>
            <Text variant="caption" tone="faint" numberOfLines={1}>
              {item.server ? t('in {room} · {server}', { room: item.room, server: item.server }) : t('in {room}', { room: item.room })}
            </Text>
          </Pressable>
          <Words text={media.text} />
          <Media media={media} ctx={ctx} file={file} />
          <View style={styles.acts}>
            <Act glyph="↩" label={t('Reply')} onPress={() => ctx.onAnswer(item)} />
            <Act glyph="☺" label={t('React')} onPress={() => ctx.onReact(item)} />
            {reactions.map(([emoji, who]) => {
              const ours = !!mine && who.includes(mine);
              return (
                <Pressable
                  key={emoji}
                  onPress={() => ctx.onReact(item, emoji)}
                  accessibilityRole="button"
                  accessibilityLabel={`${emoji} ${who.length}`}
                  style={[styles.reaction, { borderColor: ours ? colors.primary : colors.border, backgroundColor: ours ? withAlpha(colors.primary, 0.16) : 'transparent' }]}
                >
                  <Text variant="caption">{`${emoji} ${who.length}`}</Text>
                </Pressable>
              );
            })}
            <Act glyph="↗" label={t('Share')} onPress={() => ctx.onShare(item)} />
          </View>
        </View>
      </View>
    </View>
  );
}

const whenOf = (seconds: number) => new Date(seconds * 1000).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/**
 * A poll in its post (NIP-88, lib/nostr-polls.ts): its options, a tap on one votes while it is open
 * (on a poll of more than one choice, Vote sends those tapped), and how it stands, looked up when
 * asked for (Results), once voted, or as it shows (`atOnce`); until when it is open, or that it ended.
 */
function PollBox({ poll, event, atOnce }: { poll: NonNullable<FeedPost['poll']>; event: NostrEvent; atOnce: boolean }) {
  const colors = useColors();
  const [count, setCount] = useState<PollCount | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState('');
  const open = pollOpen(poll);

  async function look(voted?: string[]) {
    setBusy(true);
    setSaid('');
    try {
      if (voted && !(await mayPost())) return;
      if (voted) await nostrDmVote(event, voted);
      const got = await nostrDmPollCount(event);
      // Just voted: so it shows, whether or not the relays asked have the vote yet.
      setCount(voted ? withMyVote(got, poll, voted) : got);
      setPicked([]);
      if (!got.answered) setSaid(t('No server answered. Try again in a while.'));
    } catch (error) {
      setSaid(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (atOnce) void look();
  }, [atOnce, event.id]);

  const mine = picked.length ? picked : (count?.mine ?? []);
  const most = Math.max(1, ...(count?.counts ?? []));
  const tap = (id: string) => {
    if (!poll.multiple) return void look([id]);
    setPicked((now) => (now.includes(id) ? now.filter((one) => one !== id) : [...now, id]));
  };
  return (
    <View style={{ gap: space.xs }}>
      <Text variant="caption" tone="muted">
        {poll.multiple ? t('Poll · choose one or more') : t('Poll · choose one')}
      </Text>
      {poll.options.map((option, i) => {
        const chosen = mine.includes(option.id);
        const n = count?.counts[i];
        return (
          <Pressable
            key={option.id}
            onPress={() => tap(option.id)}
            disabled={!open || busy}
            accessibilityRole={poll.multiple ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: chosen, disabled: !open || busy }}
            accessibilityLabel={n === undefined ? option.label : `${option.label}, ${n}`}
            style={({ pressed }) => ({ gap: 3, paddingVertical: 6, paddingHorizontal: space.sm, borderRadius: radius.sm, backgroundColor: withAlpha(colors.text, pressed ? 0.14 : 0.06) })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Text>{poll.multiple ? (chosen ? '☑' : '☐') : chosen ? '◉' : '○'}</Text>
              <Text style={{ flex: 1 }}>{option.label}</Text>
              {n !== undefined ? <Text variant="bodyStrong">{n}</Text> : null}
            </View>
            {n !== undefined ? (
              <View style={{ height: 3, borderRadius: 2, backgroundColor: withAlpha(colors.text, 0.08) }}>
                <View style={{ height: 3, borderRadius: 2, width: `${(n / most) * 100}%`, backgroundColor: colors.primary }} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
      <Row wrap>
        {poll.multiple && open && picked.length ? <Button title={t('Vote')} compact loading={busy} onPress={() => void look(picked)} /> : null}
        {busy ? (
          <Text variant="caption" tone="muted">
            {t('Looking…')}
          </Text>
        ) : count ? (
          <Text variant="caption" tone="muted">
            {plural(count.voters, '{n} vote', '{n} votes')}
          </Text>
        ) : (
          <TextButton title={t('Results')} onPress={() => void look()} />
        )}
        {poll.endsAt ? (
          <Text variant="caption" tone="faint">
            {open ? t('Open until {when}', { when: whenOf(poll.endsAt) }) : t('The poll has ended.')}
          </Text>
        ) : null}
      </Row>
      {open ? (
        <Text variant="caption" tone="faint">
          {t('Your vote is public: anyone can see what you chose.')}
        </Text>
      ) : null}
      {said ? <Text tone="muted">{said}</Text> : null}
    </View>
  );
}

/**
 * The reactions to a post on its own screen (app/public-post.tsx): each once with how many chose
 * it, a custom emoji as its picture (NIP-30, fetched as the post's photos are), ours standing out.
 * A tap adds the same, or takes ours back (NIP-09); + offers others. `onChange` is told how they stand after.
 */
export function PostReactions({ post, reactions, mode, onChange }: { post: NostrEvent; reactions: PostReaction[]; mode: PublicImages | null; onChange: (next: PostReaction[]) => void }) {
  const colors = useColors();
  const [more, setMore] = useState(false);
  const [said, setSaid] = useState('');
  const busy = useRef(false);

  async function choose(sign: string, url?: string) {
    if (busy.current) return;
    busy.current = true;
    setSaid('');
    try {
      const had = reactions.find((r) => r.sign === sign);
      if (!(await mayPost())) return;
      if (had?.mine.length) {
        await nostrDmTakeBackReactions(post, had.mine);
        onChange(withoutMine(reactions, sign));
      } else {
        const made = await nostrDmReactPost(post, sign, url);
        onChange(withReaction(reactions, sign, made.id, url));
      }
      setMore(false);
    } catch (error) {
      setSaid(errorText(error));
    } finally {
      busy.current = false;
    }
  }

  return (
    <View style={{ gap: space.xs }}>
      <Row wrap>
        {reactions.map((r) => {
          const ours = r.mine.length > 0;
          return (
            <Pressable
              key={r.sign}
              onPress={() => void choose(r.sign, r.url)}
              accessibilityRole="button"
              accessibilityState={{ selected: ours }}
              accessibilityLabel={ours ? t('Take back {emoji}', { emoji: r.sign }) : t('React with {emoji}', { emoji: r.sign })}
              style={[styles.reaction, styles.chip, { borderColor: ours ? colors.primary : colors.border, backgroundColor: ours ? withAlpha(colors.primary, 0.16) : 'transparent' }]}
            >
              {r.url ? <Emoji code={r.sign.slice(1, -1)} url={r.url} mode={mode} size={18} tappable={false} /> : <Text variant="caption">{r.sign}</Text>}
              <Text variant="caption">{r.count}</Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setMore((now) => !now)} accessibilityRole="button" accessibilityLabel={t('More reactions')} style={[styles.reaction, { borderColor: colors.border }]}>
          <Text variant="caption">+</Text>
        </Pressable>
      </Row>
      {more ? (
        <Row wrap>
          {REACTIONS.map((emoji) => (
            <Pressable key={emoji} onPress={() => void choose(emoji)} accessibilityRole="button" accessibilityLabel={t('React with {emoji}', { emoji })} style={({ pressed }) => [styles.emoji, pressed && { opacity: 0.6 }]}>
              <Text style={{ fontSize: 24, lineHeight: 32 }}>{emoji}</Text>
            </Pressable>
          ))}
        </Row>
      ) : null}
      {said ? <Text tone="muted">{said}</Text> : null}
    </View>
  );
}

type Loader = (why: FetchWhy) => Promise<{ bytes: Uint8Array; mime: string }>;

/**
 * A photo held while its row shows: `load` is asked as the row shows when `auto`, else only on a
 * tap. Its data: address is held here and let go when the row goes.
 */
function useHeld(load: Loader, auto: boolean, id: string) {
  const [held, setHeld] = useState<{ uri: string; bytes: Uint8Array; mime: string } | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'failed'>(auto ? 'loading' : 'idle');
  const live = useRef(true);
  const uri = useRef<string | null>(null);
  const loader = useRef(load);
  loader.current = load;

  async function go(why: FetchWhy) {
    setState('loading');
    try {
      const got = await loader.current(why);
      if (!live.current) return;
      if (uri.current) releaseUri(uri.current);
      uri.current = photoUri(got.bytes, got.mime);
      setHeld({ uri: uri.current, bytes: got.bytes, mime: got.mime });
      setState('idle');
    } catch {
      if (live.current) setState('failed');
    }
  }

  useEffect(() => {
    live.current = true;
    if (auto) void go('show');
    return () => {
      live.current = false;
      if (uri.current) releaseUri(uri.current);
      uri.current = null;
    };
  }, [auto, id]);
  return { held, state, tap: () => void go('tap') };
}

function Photo({ id, load, auto, site, name, width, height }: { id: string; load: Loader; auto: boolean; site: string; name: string; width: number; height: number }) {
  const colors = useColors();
  const { held, state, tap } = useHeld(load, auto, id);
  const [viewing, setViewing] = useState(false);
  const box = { width, height, borderRadius: radius.md };
  if (held) {
    return (
      <>
        <Pressable onPress={() => setViewing(true)} accessibilityRole="button" accessibilityLabel={name} style={box}>
          <Image source={{ uri: held.uri }} style={box} resizeMode="cover" accessibilityIgnoresInvertColors />
        </Pressable>
        <FileViewer
          file={viewing ? { id, kind: 'photo', name, size: held.bytes.length } : null}
          uri={viewing ? held.uri : undefined}
          onSave={(choose) =>
            void saveBytes(name, held.mime, held.bytes, choose)
              .then((done) => done && setViewing(false))
              .catch(() => {})
          }
          onClose={() => setViewing(false)}
        />
      </>
    );
  }
  const waiting = state === 'loading';
  return (
    <Pressable
      onPress={waiting ? undefined : tap}
      accessibilityRole="button"
      accessibilityLabel={state === 'failed' ? t('Show the photo') : t('Tap to show the photo')}
      style={[styles.holder, box, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
    >
      {waiting ? (
        <Text variant="caption" tone="muted">
          {t('Looking…')}
        </Text>
      ) : state === 'failed' ? (
        <Text variant="label" tone="muted">
          {t('Show the photo')}
        </Text>
      ) : (
        <>
          <Text variant="bodyStrong" style={{ textAlign: 'center' }}>
            {t('Tap to show the photo')}
          </Text>
          {site ? (
            <Text variant="caption" tone="muted" style={{ textAlign: 'center' }}>
              {netThroughTor() ? t('from {site} · through Tor', { site }) : t('from {site}', { site })}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const clamp = (n: number, low: number, high: number) => Math.min(high, Math.max(low, n));

/** The photos of a post, inside it: one at its width keeping its shape, two to four in a grid; and the card of its link. */
function Media({ media, ctx, file }: { media: { images: PublicImage[]; link: string | null }; ctx: Ctx; file?: MatrixFile | null }) {
  const [width, setWidth] = useState(0);
  const mode = ctx.images;
  const items: { id: string; name: string; w?: number; h?: number; site: string; load: Loader; auto: boolean }[] = [];
  if (mode !== null) {
    if (file) {
      items.push({ id: `file:${file.encrypted?.url ?? file.url ?? file.name}`, name: file.name, w: file.w, h: file.h, site: '', auto: true, load: async () => ({ bytes: await matrixFile(file), mime: file.mime.startsWith('image/') ? file.mime : 'image/jpeg' }) });
    }
    for (const image of media.images) {
      if (items.length >= PHOTOS_MOST) break;
      items.push({ id: image.url, name: image.alt || siteOf(image.url) || 'photo', w: image.w, h: image.h, site: siteOf(image.url), auto: fetchesByItself(mode), load: (why) => publicPhoto(image.url, mode, why) });
    }
  }
  const gap = space.xs + 2;
  const wide = width > 0 ? width : 0;
  const tile = (i: number) => {
    const alone = items.length === 1;
    const big = items.length === 3 && i === 0;
    const w = alone || big ? wide : Math.floor((wide - gap) / 2);
    const item = items[i];
    const ratio = alone ? clamp(item.w && item.h ? item.w / item.h : 4 / 3, 0.6, 2.4) : big ? 2 : 1.2;
    return <Photo key={item.id} id={item.id} load={item.load} auto={item.auto} site={item.site} name={item.name} width={w} height={Math.round(w / ratio)} />;
  };
  return (
    <View onLayout={(event) => setWidth(Math.floor(event.nativeEvent.layout.width))} style={{ gap }}>
      {wide > 0 && items.length ? <View style={[styles.grid, { gap }]}>{items.map((_, i) => tile(i))}</View> : null}
      {mode !== null && ctx.cards && media.link ? <Card url={media.link} mode={mode} width={wide} /> : null}
    </View>
  );
}

/** The card of a link: its page's picture, site, title and a line. Fetched as the photos are. */
function Card({ url, mode, width }: { url: string; mode: PublicImages; width: number }) {
  const colors = useColors();
  const auto = fetchesByItself(mode);
  const [card, setCard] = useState<LinkCard | null>(null);
  const [asked, setAsked] = useState(auto);
  const [failed, setFailed] = useState(false);
  const [round, setRound] = useState(0);
  const why = useRef<FetchWhy>('show');

  useEffect(() => {
    if (!asked) return;
    let alive = true;
    setFailed(false);
    publicCard(url, mode, why.current)
      .then((got) => alive && setCard(got))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [url, mode, asked, round]);

  if (!asked || failed) {
    return (
      <Pressable
        onPress={() => {
          why.current = 'tap';
          setAsked(true);
          setRound((n) => n + 1);
        }}
        accessibilityRole="button"
        style={[styles.holder, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, paddingVertical: space.md }]}
      >
        <Text variant="label" tone="muted">
          {failed ? t('Show the preview') : t('Tap to show a preview of {site}', { site: siteOf(url) })}
        </Text>
      </Pressable>
    );
  }
  if (!card) return null;
  const picture = card.picture;
  const tapped = why.current === 'tap';
  return (
    <Pressable onPress={() => openLink(url)} accessibilityRole="link" accessibilityLabel={card.title || card.site} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      {picture && width > 0 ? <Photo id={picture} load={(w) => publicPhoto(picture, mode, tapped ? 'tap' : w)} auto={auto || tapped} site={siteOf(picture)} name={card.title || card.site} width={width - 2} height={Math.round((width - 2) / 1.9)} /> : null}
      <View style={{ padding: space.md, gap: 2 }}>
        <Text variant="caption" tone="faint" numberOfLines={1}>
          {card.site}
        </Text>
        {card.title ? (
          <Text variant="bodyStrong" numberOfLines={2}>
            {card.title}
          </Text>
        ) : null}
        {card.text ? (
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {card.text}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: 2,
  },
  empty: {
    gap: space.md,
    paddingTop: space.xl,
  },
  footer: {
    gap: space.sm,
    paddingTop: space.lg,
  },
  row: {
    gap: space.xs,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  note: {
    paddingLeft: 40 + space.sm,
  },
  line: {
    flexDirection: 'row',
    gap: space.sm,
  },
  body: {
    flex: 1,
    gap: space.xs + 2,
  },
  face: {
    width: 40,
    height: 40,
  },
  badge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  acts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space.xs,
    paddingRight: space.md,
  },
  act: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 36,
  },
  reaction: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  holder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingHorizontal: space.md,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  emoji: {
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  thumbBox: {
    width: 72,
    height: 72,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
  },
  thumbRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
