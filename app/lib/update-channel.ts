// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { EDITION, type Edition } from './edition';
import { secureGet, secureSet } from './secure';

// Which releases Updates offers (Settings → General → Updates): of which edition, Erevos Lite,
// Erevos or Erevos+, and whether betas too. Six channels, each published apart (lib/updates.ts) and
// signed apart by the release computer (lib/update-signature.ts):
//
// - `erevos`: Erevos (3.0.x), the latest release of azzinder/erevos-releases, as every Erevos before read it;
// - `erevos-beta`: Erevos's betas (3.0.x-beta.N), never marked latest;
// - `plus`: Erevos+ (3.1.x), never marked latest there, so an Erevos that did not choose it never takes it;
// - `plus-beta`: Erevos+'s betas (3.1.x-beta.N);
// - `lite`: Erevos Lite (3.2.x), the latest release of a repository of its own, azzinder/erevos-lite-releases;
// - `lite-beta`: Erevos Lite's betas (3.2.x-beta.N), its channel-beta there.
//
// The three editions are apps of their own (docs/editions.md): app.erevos, app.erevos.plus (from
// Erevos+ 3.1.0; its 7.x were app.erevos) and app.erevos.lite, each with its own data, signed with
// the same key. A release of the edition installed is an update, and installs over it once its build
// is above the installed one: Android installs nothing with a lower build. Another edition's is a
// move (lib/edition-move.ts): it installs beside this one, which hands it everything first.

export type UpdateEdition = 'erevos' | 'plus' | 'lite';
export type ChannelName = 'erevos' | 'erevos-beta' | 'plus' | 'plus-beta' | 'lite' | 'lite-beta';
export const CHANNELS: readonly ChannelName[] = ['erevos', 'erevos-beta', 'plus', 'plus-beta', 'lite', 'lite-beta'];
export const UPDATE_EDITIONS: readonly UpdateEdition[] = ['lite', 'erevos', 'plus'];

/** Each edition's Android package. */
export const PACKAGES: Readonly<Record<UpdateEdition, string>> = { erevos: 'app.erevos', plus: 'app.erevos.plus', lite: 'app.erevos.lite' };

/** The edition of a build of `edition` (lib/edition.ts: `lite` there is the plain Erevos, until Erevos Lite is an edition of its own). */
export function updateEditionOf(edition: Edition): UpdateEdition {
  return edition === 'plus' ? 'plus' : 'erevos';
}

/** The edition of this build. */
export const INSTALLED_EDITION: UpdateEdition = updateEditionOf(EDITION);

/** Each edition's name, as its icon says it. */
export function updateEditionName(edition: UpdateEdition): string {
  return edition === 'plus' ? 'Erevos+' : edition === 'lite' ? 'Erevos Lite' : 'Erevos';
}

/**
 * The Android package of a release of `edition` named `version`: the one its version.json says
 * (`given`), else the edition's, but Erevos+'s releases before 3.1.0 (its 7.x), which were app.erevos.
 */
export function packageOf(edition: UpdateEdition, version: string, given?: string | null): string {
  if (given && Object.values(PACKAGES).includes(given)) return given;
  if (edition === 'plus' && /^7\./.test(version)) return PACKAGES.erevos;
  return PACKAGES[edition];
}

/**
 * The name a channel goes by where it is published: its tag, its statement and the notice's file
 * (lib/updates.ts, lib/update-signature.ts, lib/release-notice.ts). Erevos+ from 3.1.0 on is an app
 * of its own (app.erevos.plus), so its releases go where the Erevos+ 7.x apps (app.erevos), which read
 * plus and plus-beta, never look: erevos-plus and erevos-plus-beta. Under plus and plus-beta goes
 * only the bridge, an Erevos+ that is still app.erevos and moves to app.erevos.plus (docs/editions.md).
 */
export function wireOf(name: ChannelName): string {
  return name === 'plus' ? 'erevos-plus' : name === 'plus-beta' ? 'erevos-plus-beta' : name;
}

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
  const regular: ChannelName = channel.edition;
  return channel.beta ? [regular, `${regular}-beta` as ChannelName] : [regular];
}

const KEY = 'erevos.update-channel';

function checked(text: string | null): ChannelKept {
  try {
    const v = JSON.parse(text ?? '') as Record<string, unknown> | null;
    return {
      ...(v?.edition === 'erevos' || v?.edition === 'plus' || v?.edition === 'lite' ? { edition: v.edition } : {}),
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
