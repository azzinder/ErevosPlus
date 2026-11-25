// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useRef, useState, type ReactElement } from 'react';
import { Keyboard, Platform, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { leftOff } from '../lib/left-off';
import { space } from '../theme/colors';
import type { KeyboardAwareScrollView, KeyboardAwareScrollViewRef } from './keyboard';
import { BELOW_TOP, ThreadArrows } from './thread-arrows';

// The fixed top over the thread: as wide and as far in as the thread under it (Page, components/ui.tsx).
const TOP = { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: space.xl - 4, paddingTop: space.sm, paddingBottom: space.xs } as const;

// What the chats with Matrix, XMPP and Nostr share, as the Erevos chat, a group and SMS have it
// (their threads sit above a field of their own; these screens scroll the head, the thread and the
// message field together): the thread opens at its last message with the message field under it,
// follows what comes while it is read at the end, and has the arrows to its start, to where it was
// last seen and to its end (components/thread-arrows.tsx).
//
// With the keyboard open they do as the Erevos chat does: the screen ends above the keyboard
// (KeyboardPaddedView, components/keyboard.tsx: `padded`), so the message field and the buttons
// under it sit on the keyboard, and the few messages of a short chat stay where they were, at the
// top. A scrolling view that moved its content up for the keyboard instead took those messages out
// of sight, once the content was as tall as the screen.

/** The scrolling view's content, as Page (components/ui.tsx) has it, and at least as tall as the screen. */
export const THREAD_PAGE = { flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: space.xl - 4, gap: space.md } as const;
/** The room under the buttons at the page's end, as the Erevos chat's field has it: not the page's own, which is for a page that ends in the air. */
export const THREAD_FOOT = space.md;
/** The thread in it: its messages from the top, and the room a short one leaves, so what is under it sits at the bottom. */
export const THREAD_GROWS = { flexGrow: 1, gap: space.md } as const;
/** How far the page's content is from the sides: what opens under the field (the "+" panel) reaches them. */
export const THREAD_SIDE = space.xl - 4;

/** How far from its start or end the thread counts as away from it: half of what shows of it. */
const AWAY = 0.5;
/** How near the end the thread is read, for what comes to be followed. */
const NEAR = 80;

type Place = { y: number; height: number };

/**
 * The scrolling of a chat screen made of its head, the thread (`threadProps`), and what is under it
 * (the message field and its buttons, the last of which takes `endProps`), all in one scrolling
 * view (`scrollProps`) that `withArrows` draws the arrows over. The view's content fills the screen
 * (THREAD_PAGE) and the thread takes what room is left (THREAD_GROWS), so in a chat with few
 * messages the message field still sits at the bottom, as in an Erevos chat. `toEnd` reads the
 * thread at its end from now on: what opens under the field (the "+" panel) is then brought into
 * view as it is laid out. `list` is the thread, the oldest
 * first, and `unread` how many of the newest, not `mine`, were not read when the chat opened. `held`
 * says when something else keeps the place (older messages coming in above): the thread then
 * follows nothing. Opened at a message (`at`, a starred one), the thread opens there instead, once
 * it is laid out, and `onAt` is told whether it was here. `padded` says the screen ends above the
 * keyboard by itself (KeyboardPaddedView): all of the view shows then, and it is a plain scrolling
 * view; without it the view is one the keyboard covers (KeyboardAwareScrollView).
 */
export function useNetworkThread<T>({
  list,
  idOf,
  mine,
  unread,
  held,
  at: openAt,
  onAt,
  padded = false,
}: {
  list: readonly T[];
  idOf: (message: T) => string;
  mine: (message: T) => boolean;
  unread: number;
  held?: () => boolean;
  at?: string;
  onAt?: (found: boolean) => void;
  padded?: boolean;
}) {
  const scroll = useRef<KeyboardAwareScrollViewRef>(null);
  const view = useRef({ y: 0, height: 0 });
  const thread = useRef<Place>({ y: 0, height: 0 });
  const end = useRef<Place>({ y: 0, height: 0 });
  const placed = useRef<Record<string, number>>({});
  const following = useRef(true);
  const [footHeight, setFootHeight] = useState(0);
  const [at, setAt] = useState({ start: false, end: false, below: false, seen: false });
  const last = useRef(at);

  // Where the chat was left: the first of the messages that were new when it opened, taken once.
  const left = useRef<string | null | undefined>(undefined);
  if (left.current === undefined && list.length > 0) left.current = leftOff(list, unread, idOf, mine);
  const seenId = left.current ?? null;

  // The end of what is under the thread: the screen's foot.
  const footEnd = () => end.current.y + end.current.height + space.md;

  // How much sits under the thread, to lift the arrows above it.
  function sayFoot() {
    const height = Math.max(0, footEnd() - (thread.current.y + thread.current.height));
    setFootHeight((before) => (Math.abs(before - height) < 1 ? before : height));
  }

  // How much of the view shows: all of it on a screen that ends above the keyboard (`padded`);
  // otherwise the keyboard, while it is open, covers its lower part, as the screen does not shrink
  // for it (components/keyboard.tsx).
  const shows = () => view.current.height - (!padded && Keyboard.isVisible() ? (Keyboard.metrics()?.height ?? 0) : 0);

  // Scrolls so that the message field ends what shows, and the last message is just above it.
  function toFoot(animated = false) {
    if (!view.current.height || !end.current.height) return;
    scroll.current?.scrollTo({ y: Math.max(0, footEnd() - shows()), animated });
  }

  // The arrows follow the scrolling: the thread's start and end, and where it was left, away from the view.
  function arrowsAt() {
    const { y, height } = view.current;
    const room = height * AWAY;
    const top = thread.current.y;
    const bottom = top + thread.current.height;
    const seenY = seenId !== null && placed.current[seenId] !== undefined ? top + placed.current[seenId] : null;
    const now = {
      start: y > top + room,
      end: bottom - (y + height) > room,
      below: y > bottom,
      // Where it was left shows until it is in sight.
      seen: seenY !== null && !(seenY >= y && seenY <= y + height - BELOW_TOP),
    };
    if (now.start === last.current.start && now.end === last.current.end && now.below === last.current.below && now.seen === last.current.seen) return;
    last.current = now;
    setAt(now);
  }

  // Whether the owner has moved the thread by hand since it opened. Until then it is read at its
  // end whatever the view does by itself: Android moves it when what is in it gets shorter (a
  // photo drawn smaller than the room kept for it), which left a chat that had just opened
  // somewhere in its middle, no longer following its end.
  // In the web and desktop apps react-native-web never says a drag began (onScrollBeginDrag), and
  // Android's own moves of the view are not there to undo: the thread follows its end only while
  // it is read there, as before.
  const touched = useRef(Platform.OS === 'web');

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    view.current.y = contentOffset.y;
    // At the end, or all of it in view (a short thread, whose end shows at the top), or at the
    // bottom of all there is (the foot's place may not be told yet).
    const atEnd = view.current.y + shows() > footEnd() - NEAR || contentOffset.y + layoutMeasurement.height > contentSize.height - NEAR;
    if (atEnd || touched.current) following.current = atEnd;
    arrowsAt();
  }

  // Opened, or grown: at the message field once, and after that while it is read there.
  const opened = useRef(false);

  // Older messages come in above, while the thread is read away from its end: what was in view
  // stays, moved down by as much as they take (`keep`: how tall it all was before them). Else the
  // view stayed where it was over what came, and the thread seemed to scroll by itself.
  const tall = useRef(0);
  const first = useRef<string | null>(null);
  const keep = useRef<number | null>(null);
  const firstNow = list.length > 0 ? idOf(list[0]) : null;
  if (firstNow !== first.current) {
    if (first.current !== null && firstNow !== null && opened.current && !following.current && tall.current > 0 && list.some((message) => idOf(message) === first.current)) {
      keep.current ??= tall.current;
    }
    first.current = firstNow;
  }

  // The message the chat was opened at, until it is gone to, or found not to be here.
  const goal = useRef<string | null>(openAt || null);

  // Goes to the message the chat was opened at, once it and the thread are laid out. True while
  // that keeps the thread from opening at its end.
  function toGoal(): boolean {
    const id = goal.current;
    if (!id) return false;
    if (list.length === 0) return true;
    if (!list.some((message) => idOf(message) === id)) {
      goal.current = null;
      onAt?.(false);
      return false;
    }
    if (placed.current[id] === undefined || !view.current.height || !thread.current.height) return true;
    goal.current = null;
    opened.current = true;
    following.current = false;
    const go = (animated: boolean) => scroll.current?.scrollTo({ y: Math.max(0, thread.current.y + (placed.current[id] ?? 0) - BELOW_TOP), animated });
    go(false);
    // Once more when what is above it has its height (a photo), so it is not left short of it.
    setTimeout(() => go(true), 250);
    onAt?.(true);
    return true;
  }

  function onContentSizeChange() {
    // Older messages coming in above hold the place only once the chat has opened at its end, and
    // only while it is read away from there: one asked for at the very start (the view still at
    // its top before it went to the end) kept a chat open at its oldest messages, anywhere.
    if (held?.() && opened.current && !following.current) return;
    if (toGoal()) {
      arrowsAt();
      return;
    }
    if (!opened.current || following.current) {
      if (view.current.height && end.current.height && list.length > 0) {
        opened.current = true;
        toFoot();
      }
    }
    arrowsAt();
  }

  const scrollProps = {
    scrollEventThrottle: 100,
    onScroll,
    onScrollBeginDrag: () => {
      touched.current = true;
    },
    onContentSizeChange: (_width?: number, height?: number) => {
      if (height !== undefined) {
        const before = keep.current;
        if (before !== null && height !== before) {
          keep.current = null;
          if (!following.current) {
            view.current.y = Math.max(0, view.current.y + height - before);
            scroll.current?.scrollTo({ y: view.current.y, animated: false });
          }
        }
        tall.current = height;
      }
      onContentSizeChange();
    },
    onLayout: (event: LayoutChangeEvent) => {
      view.current.height = event.nativeEvent.layout.height;
      onContentSizeChange();
    },
  };

  const threadProps = {
    onLayout: (event: LayoutChangeEvent) => {
      thread.current = { y: event.nativeEvent.layout.y, height: event.nativeEvent.layout.height };
      sayFoot();
      toGoal();
      arrowsAt();
    },
  };

  // The last of what sits under the thread (the buttons under the message field).
  const endProps = {
    onLayout: (event: LayoutChangeEvent) => {
      const { y, height } = event.nativeEvent.layout;
      end.current = { y, height };
      sayFoot();
      onContentSizeChange();
    },
  };

  // Where a message begins in the thread.
  const place = (id: string) => (event: LayoutChangeEvent) => {
    placed.current[id] = event.nativeEvent.layout.y;
    if (id === goal.current) toGoal();
  };

  // Scrolls the thread to a message, a little below the top.
  function goTo(id: string) {
    touched.current = true;
    following.current = false;
    const y = placed.current[id];
    if (y !== undefined) scroll.current?.scrollTo({ y: Math.max(0, thread.current.y + y - BELOW_TOP), animated: true });
  }

  const toStart = () => {
    touched.current = true;
    following.current = false;
    scroll.current?.scrollTo({ y: Math.max(0, thread.current.y - space.xl), animated: true });
  };
  const toEnd = () => {
    following.current = true;
    toFoot(true);
  };

  // Over the thread's lower right, above the message field when that is what shows there.
  const arrows = at.below ? null : (
    <ThreadArrows
      start={at.start}
      end={at.end}
      onStart={toStart}
      onEnd={toEnd}
      seen={at.seen}
      onSeen={seenId !== null ? () => goTo(seenId) : undefined}
      bottom={footHeight + space.xl}
    />
  );

  // The scrolling view with the arrows over it, and above it `top`, the chat's name and its buttons,
  // which stays where it is while the thread scrolls (#12).
  const withArrows = (content: ReactElement, top?: ReactElement | null) => (
    <View style={{ flex: 1 }}>
      {top ? <View style={TOP}>{top}</View> : null}
      <View style={{ flex: 1 }}>
        {content}
        {arrows}
      </View>
    </View>
  );

  return { scroll, scrollProps, threadProps, endProps, place, goTo, toEnd, withArrows };
}
