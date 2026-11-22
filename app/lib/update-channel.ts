// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { EDITION } from './edition';
import { secureGet, secureSet } from './secure';

// Which releases Updates offers (Settings → General → Updates): of which edition, Erevos or
// Erevos+, and whether betas too. Four channels, each published apart in the public download
// repository (lib/updates.ts) and signed apart by the release computer (lib/update-signature.ts):
//
// - `erevos`: Erevos (7.0.x), the repository's latest release, as every Erevos before read it;
// - `erevos-beta`: Erevos's betas (7.0.x-beta.N), never marked latest;
// - `plus`: Erevos+ (7.1.x), never marked latest, so an Erevos that did not choose it never takes it;
// - `plus-beta`: Erevos+'s betas (7.1.x-beta.N).
//
// The two editions are the same package with the same signature and the same data
// (docs/editions.md), so one installs over the other as an update and keeps everything. Choosing the
// other edition, or leaving the betas, takes effect with the next release of what was chosen whose
// build is above the installed one: Android installs nothing with a lower build.

export type UpdateEdition = 'erevos' | 'plus';
export type ChannelName = 'erevos' | 'erevos-beta' | 'plus' | 'plus-beta';
export const CHANNELS: readonly ChannelName[] = ['erevos', 'erevos-beta', 'plus', 'plus-beta'];

/** The edition of this build (lib/edition.ts): Erevos+, or the plain Erevos. */
export const INSTALLED_EDITION: UpdateEdition = EDITION === 'plus' ? 'plus' : 'erevos';

/** Whether `version` (2.1.0, 7.0.1-beta.2) is a beta or an alpha. The release candidates before 7.0.0 were the regular line, so they are not. */
export function isTestVersion(version: string): boolean {
  return /-(alpha|beta)\.[1-9]\d*$/.test(version);
}

/** What is kept: the edition chosen and whether betas are taken; left out while they follow what is installed. */
export type ChannelKept = { edition?: UpdateEdition; beta?: boolean };

/** The releases offered: of `edition`, and its betas too when `beta`. */
export type Channel = { edition: UpdateEdition; beta: boolean };

/** The channel as kept, else what is installed: its edition, and betas when it is one. */
export function channelOf(kept: ChannelKept, installedVersion: string, installedEdition: UpdateEdition = INSTALLED_EDITION): Channel {
  return { edition: kept.edition ?? installedEdition, beta: kept.beta ?? isTestVersion(installedVersion) };
}

/** The channels a release of `channel` is looked for in: its edition's releases, and its betas too. */
export function channelsOf(channel: Channel): ChannelName[] {
  return channel.edition === 'plus' ? (channel.beta ? ['plus', 'plus-beta'] : ['plus']) : channel.beta ? ['erevos', 'erevos-beta'] : ['erevos'];
}

const KEY = 'erevos.update-channel';

function checked(text: string | null): ChannelKept {
  try {
    const v = JSON.parse(text ?? '') as Record<string, unknown> | null;
    return {
      ...(v?.edition === 'erevos' || v?.edition === 'plus' ? { edition: v.edition } : {}),
      ...(typeof v?.beta === 'boolean' ? { beta: v.beta } : {}),
    };
  } catch {
    return {};
  }
}

export async function loadChannel(): Promise<ChannelKept> {
  return checked(await secureGet(KEY).catch(() => null));
}

const listeners = new Set<() => void>();

/** Has `listener` called each time the channel changes. Returns how to stop. */
export function onChannel(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Keeps `change` in the channel. */
export async function setChannel(change: ChannelKept): Promise<void> {
  await secureSet(KEY, JSON.stringify({ ...(await loadChannel()), ...change }));
  listeners.forEach((listener) => listener());
}
