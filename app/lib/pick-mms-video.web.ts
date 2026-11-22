// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// MMS, as pick-mms-video.ts, on a computer: there is no SMS there, so no video for one.

export const MMS_VIDEO_SECONDS = 30;

export type MmsVideo = { bytes: Uint8Array; mime: string };

export function videoMime(name: string): string {
  return name.toLowerCase().endsWith('.3gp') ? 'video/3gpp' : 'video/mp4';
}

export async function recordMmsVideo(): Promise<MmsVideo | null> {
  return null;
}

export async function pickMmsVideo(): Promise<MmsVideo | null> {
  return null;
}
