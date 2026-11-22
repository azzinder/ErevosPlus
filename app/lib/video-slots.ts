// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// How many moving .webm stickers play at once (each in a WebView, which costs memory and battery),
// and which: the newest of those drawn, by their message's id, so those at the end of a chat, where
// it opens, play. Between two of the same message (a sticker and its reactions' custom emoji, or
// several emoji) the one drawn later counts as newer. One that goes gives its place to the next.

export const MOST_VIDEOS = 4;

export type VideoSlots = {
  /** Each drawn one: its message's id and its running number. */
  shown: Map<number, { order: number; seq: number }>;
  next: number;
};

export const newVideoSlots = (): VideoSlots => ({ shown: new Map(), next: 1 });

/** A running number for one sticker, taken once as it is first drawn. */
export function takeSlot(slots: VideoSlots): number {
  return slots.next++;
}

export function showVideo(slots: VideoSlots, seq: number, order: number): void {
  slots.shown.set(seq, { order, seq });
}

export function hideVideo(slots: VideoSlots, seq: number): void {
  slots.shown.delete(seq);
}

/** Whether this one plays now: fewer than MOST_VIDEOS of those drawn are newer than it. */
export function playsNow(slots: VideoSlots, seq: number): boolean {
  const me = slots.shown.get(seq);
  if (!me) return false;
  let newer = 0;
  for (const other of slots.shown.values()) {
    if (other.seq !== seq && (other.order > me.order || (other.order === me.order && other.seq > me.seq))) newer++;
  }
  return newer < MOST_VIDEOS;
}
