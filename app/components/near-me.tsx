// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ipGate } from './ip-warning';
import { useReduceMotion } from './stickers';
import { Button, Row, Text, TextButton } from './ui';
import { t } from '../lib/i18n';
import { nearby } from '../lib/nearby';
import { holdNearbyLinks } from '../lib/nearby-links';
import { NearPair, type NearEnd, type NearFound } from '../lib/near-pair';
import { nostrChatsThroughTor } from '../lib/nostr-dm-net';
import { newPairCode, PAIR_LASTS, showCode, showPairCode, type PairEnd, type Pairing } from '../lib/pair-code';
import { onLinkEvent, sendLink } from '../lib/radio';
import { sasEmoji } from '../lib/sas-emoji';
import { radius, space, withAlpha } from '../theme/colors';
import { useColors } from '../theme/context';

// Near me, a page of New chat (app/chat.tsx): for someone beside you. The two phones find each
// other by themselves on the links to phones nearby and show six pictures to compare, and two
// yeses make them contacts (lib/near-pair.ts). Under it, for when they do not: this phone's QR
// code and a code of 8 digits to show (lib/pair-code.ts), the other's to scan or type, and giving
// Erevos to a phone that has none (app/give-app.tsx).

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];
// A phone newly shown takes no yes for this long: a tap meant for the one before it says nothing of this one.
const SETTLE = 1200;

/**
 * The phones beside this one that show Near me too, while `on`: the links are kept up whatever
 * Look for phones nearby says (holdNearbyLinks), and let go as it ends, once a yes on its way arrived.
 */
function useNearPair(on: boolean, own: () => NearEnd | null, onJoined: (end: NearEnd) => void) {
  const [state, setState] = useState<{ found: NearFound[]; linked: number; spent: boolean }>({ found: [], linked: 0, spent: false });
  const pair = useRef<NearPair | null>(null);
  const ownNow = useRef(own);
  ownNow.current = own;
  const joined = useRef(onJoined);
  joined.current = onJoined;
  useEffect(() => {
    if (!on) return;
    let alive = true;
    const release = holdNearbyLinks();
    const made: NearPair = new NearPair({
      send: sendLink,
      own: () => ownNow.current() ?? { link: '', name: '' },
      onChange: () => alive && setState({ found: made.found(), linked: made.linked(), spent: made.spent() }),
      onDone: (end) => alive && joined.current(end),
    });
    pair.current = made;
    const subscriptions = [
      // 'ble' is presence only, and a LoRa radio too slow for this.
      onLinkEvent('onPeer', ({ id, kind }) => {
        if (kind !== 'ble' && kind !== 'lora') made.linkUp(id);
      }),
      onLinkEvent('onText', ({ peer, text }) => {
        made.frameIn(peer, text);
      }),
    ];
    for (const link of nearby.fastLinks()) made.linkUp(link);
    made.start();
    return () => {
      alive = false;
      pair.current = null;
      setState({ found: [], linked: 0, spent: false });
      void made.stop().then(() => {
        subscriptions.forEach((subscription) => subscription.remove());
        release();
      });
    };
  }, [on]);
  return {
    ...state,
    yes: (id: string) => pair.current?.yes(id),
    no: (id: string, aside = true) => pair.current?.no(id, aside),
    again: () => pair.current?.again(),
  };
}

// Rings going out from a dot, while this phone looks: still when the phone asks for less motion.
function Looking({ color }: { color: string }) {
  const reduce = useReduceMotion();
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce !== false) return;
    const loop = Animated.loop(Animated.timing(turn, { toValue: 1, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [reduce]);
  const ring = (from: number, to: number) => ({
    opacity: turn.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
    transform: [{ scale: turn.interpolate({ inputRange: [0, 1], outputRange: [from, to] }) }],
  });
  return (
    <View style={styles.looking} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.ring, { borderColor: withAlpha(color, 0.25) }]} />
      <View style={[styles.ring, styles.ringMid, { borderColor: withAlpha(color, 0.4) }]} />
      <Animated.View style={[styles.ring, { borderColor: color }, ring(0.35, 1)]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

// The time a code shown still lasts, as minutes and seconds.
function Lasts({ until }: { until: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const left = Math.max(0, Math.round((until - now) / 1000));
  return (
    <Text variant="caption" tone="muted" style={styles.center}>
      {t('On their phone: New chat, then I have their code. It lasts {time} more.', { time: `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` })}
    </Text>
  );
}

/** A phone found: its six pictures, to compare with those on the other screen, and the owner's answer. */
export function FoundCard({ found, place, ready, onYes, onNo, onCancel }: {
  found: NearFound;
  /** Which one of how many, when there is more than one. */
  place?: { n: number; count: number };
  /** Whether a yes is taken yet: not for a moment after the phone shows (SETTLE). */
  ready: boolean;
  onYes: () => void;
  onNo: () => void;
  /** Takes a yes back, while the other phone's is awaited. */
  onCancel: () => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.card, { borderRadius: radius.lg, backgroundColor: colors.surface, borderColor: withAlpha(colors.primary, 0.6) }]} accessibilityLiveRegion="polite">
      <Text variant="heading" style={styles.center}>
        {t('A phone was found')}
      </Text>
      {place ? (
        <Text variant="caption" tone="muted" style={styles.center}>
          {t('Phone {n} of {count}', place)}
        </Text>
      ) : null}
      <View style={styles.pictures}>
        {found.pictures.map((index, n) => {
          const { emoji, name } = sasEmoji(index);
          return (
            <View key={n} style={styles.picture} accessible accessibilityLabel={name}>
              <Text style={styles.emoji}>{emoji}</Text>
              <Text variant="caption" tone="muted" numberOfLines={2} style={styles.center}>
                {name}
              </Text>
            </View>
          );
        })}
      </View>
      {found.waiting ? (
        <>
          <Text style={styles.center}>{t('Waiting for the other phone to say yes too…')}</Text>
          <TextButton title={t('Cancel')} onPress={onCancel} />
        </>
      ) : (
        <>
          <Text style={styles.center}>
            {found.refused
              ? t('The other phone said the pictures are not the same. Compare them again, in the same order.')
              : t('Does the other phone show these same pictures, in the same order?')}
          </Text>
          <Row wrap style={styles.buttons}>
            <Button title={t('No, others')} kind="secondary" onPress={onNo} />
            <Button title={t('Yes, the same')} disabled={!ready} onPress={onYes} />
          </Row>
          <Text variant="caption" tone="muted" style={styles.center}>
            {t('The same pictures on both phones mean no other phone sits between them. Say yes only when you have looked at both screens.')}
          </Text>
        </>
      )}
    </View>
  );
}

export function NearMe({ shown, search, held, own, onJoined, qr, ownLink, canCode, onCodeLink, onScan, onType, onGive }: {
  /** Whether the page shows now: only then does this phone look, and show a code. */
  shown: boolean;
  /** Whether this phone can look for the other by itself here: with links to phones nearby, in the chats of the space. */
  search: boolean;
  /** Look for phones nearby is off: the links run only while this page shows, which is said. */
  held: boolean;
  /** This phone's contact link and the name it gives itself; null while it has no link yet. */
  own: () => NearEnd | null;
  /** Both owners said the pictures are the same: the other phone's contact link and name. */
  onJoined: (end: NearEnd) => void;
  /** This phone's QR code for the other to scan, with what it says under it. */
  qr: ReactNode;
  ownLink: string | null;
  /** Whether this build pairs with a code of 8 digits. */
  canCode: boolean;
  /** The phone that typed the code shown here: its contact link. */
  onCodeLink: (link: string) => void;
  /** Their QR code, photographed. */
  onScan: () => void;
  /** Their code, typed: the page for it. */
  onType: () => void;
  /** Giving Erevos to a phone with none, where this phone can. */
  onGive?: () => void;
}) {
  const colors = useColors();
  const near = useNearPair(shown && search && !!ownLink, own, onJoined);
  const first = near.found.find((found) => !found.aside) ?? null;
  const [settled, setSettled] = useState<string | null>(null);
  useEffect(() => {
    if (!first) return;
    const timer = setTimeout(() => setSettled(first.id), SETTLE);
    return () => clearTimeout(timer);
  }, [first?.id]);

  // The code of 8 digits, shown only once asked for: the phones meet on public Nostr relays for it.
  const [code, setCode] = useState('');
  const [until, setUntil] = useState(0);
  const [busy, setBusy] = useState(false);
  const [codeNote, setCodeNote] = useState('');
  const pairing = useRef<Pairing | null>(null);
  const stopCode = () => {
    pairing.current?.stop();
    pairing.current = null;
  };
  useEffect(() => {
    if (shown) return;
    stopCode();
    setCode('');
    setBusy(false);
    setCodeNote('');
  }, [shown]);
  useEffect(() => stopCode, []);

  async function showMine() {
    if (!ownLink) return;
    // Straight, unless the space's Tor carries Nostr, those relays see this phone's internet address: said first.
    if (!nostrChatsThroughTor() && !(await ipGate({ network: 'Nostr', act: 'pair', of: 'pair code' }))) return;
    stopCode();
    const made = newPairCode();
    setCode(made);
    setUntil(Date.now() + PAIR_LASTS);
    setCodeNote('');
    setBusy(true);
    let end: PairEnd;
    try {
      const under = await showCode(made, ownLink);
      pairing.current = under;
      end = await under.done;
      if (pairing.current !== under) return;
      pairing.current = null;
    } catch (error) {
      end = { error: errorText(error) };
    }
    setBusy(false);
    if ('link' in end) {
      setCode('');
      onCodeLink(end.link);
    } else if (end.error) setCodeNote(end.error);
  }

  const card = [styles.card, { borderRadius: radius.lg, backgroundColor: colors.surface, borderColor: colors.border }];
  return (
    <View style={styles.page}>
      {search ? (
        first ? (
          <FoundCard
            found={first}
            place={near.found.length > 1 ? { n: near.found.indexOf(first) + 1, count: near.found.length } : undefined}
            ready={settled === first.id}
            onYes={() => near.yes(first.id)}
            onNo={() => near.no(first.id)}
            onCancel={() => near.no(first.id, false)}
          />
        ) : (
          <View style={styles.status} accessibilityLiveRegion="polite">
            <Looking color={colors.primary} />
            <Text variant="heading" style={styles.center}>
              {near.spent
                ? t('Too many tries')
                : near.found.length > 0
                  ? t('No other phone was found')
                  : near.linked > 0
                    ? t('An Erevos is near')
                    : t('Looking for phones beside you…')}
            </Text>
            <Text tone="muted" style={styles.center}>
              {near.spent
                ? t('Go back and open Near me again, on both phones.')
                : near.found.length > 0
                  ? t('The phones you set aside may show again.')
                  : near.linked > 0
                    ? t('On that phone too: New chat, then Near me. The pictures show as soon as both are there.')
                    : t('On the other phone too: New chat, then Near me. Keep the two close, with Bluetooth on.')}
            </Text>
            {near.found.length > 0 && !near.spent ? <Button title={t('Show them again')} kind="secondary" compact onPress={near.again} /> : null}
            {held ? (
              <Text variant="caption" tone="muted" style={styles.center}>
                {t('Bluetooth and Wi-Fi look for phones only while this page is open: Look for phones nearby stays off.')}
              </Text>
            ) : null}
          </View>
        )
      ) : (
        <Text tone="muted">
          {ownLink ? t('Here the phones do not find each other by themselves: use the QR code or a code, below.') : t('Getting it ready…')}
        </Text>
      )}
      <View style={card}>
        <Text variant="label">{search ? t('If it is not found') : t('Your QR code')}</Text>
        {qr}
        {canCode && ownLink ? (
          code ? (
            <>
              <Text variant="display" selectable accessibilityLabel={code.split('').join(' ')} style={styles.center}>
                {showPairCode(code)}
              </Text>
              {busy ? <Lasts until={until} /> : <Text variant="caption" tone="muted" style={styles.center}>{codeNote || t('This code is closed.')}</Text>}
              {!busy ? <Button title={t('New code')} kind="secondary" compact onPress={() => void showMine()} /> : null}
            </>
          ) : (
            <Button title={t('Show a code of 8 digits')} kind="secondary" onPress={() => void showMine()} />
          )
        ) : null}
      </View>
      {onGive ? (
        <Pressable
          onPress={onGive}
          accessibilityRole="button"
          style={({ pressed }) => [styles.give, { borderRadius: radius.lg, borderColor: colors.border }, pressed && styles.pressed]}
        >
          <Text variant="label">{t('No Erevos on their phone?')}</Text>
          <Text variant="caption" color={colors.accentText}>
            {t('Give it to them from here')}
          </Text>
        </Pressable>
      ) : null}
      <Row wrap style={styles.buttons}>
        <Button title={t('Scan theirs')} kind="secondary" onPress={onScan} />
        <Button title={t('Type their code')} kind="secondary" onPress={onType} />
      </Row>
    </View>
  );
}

const RING = 132;
// A picture with its name under it, and three of them to a row: the six read as two rows.
const PICTURE = 88;

const styles = StyleSheet.create({
  page: {
    gap: space.md,
  },
  status: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
  },
  looking: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 2,
  },
  ringMid: {
    width: RING * 0.62,
    height: RING * 0.62,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  card: {
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderWidth: 1,
  },
  pictures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    maxWidth: 3 * PICTURE + 2 * space.sm,
  },
  picture: {
    alignItems: 'center',
    width: PICTURE,
  },
  emoji: {
    fontSize: 36,
    lineHeight: 44,
  },
  center: {
    textAlign: 'center',
  },
  buttons: {
    justifyContent: 'center',
  },
  give: {
    alignItems: 'center',
    gap: 2,
    padding: space.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  pressed: {
    opacity: 0.7,
  },
});
