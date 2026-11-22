// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { t } from './i18n';
import { canVerify, verifySignature } from './core';
import { fromBase64, utf8Encode } from './crypto';
import { wireOf, type ChannelName } from './update-channel';
import type { ChannelRelease, Release } from './updates';

// An Android update trusts more than GitHub. The release workflow signs the APK with a key kept
// in GitHub, and version.json, whose size and SHA-256 Check for updates checks, comes from the same
// workflow: whoever held the GitHub account could put an APK of their own in both. So the release
// computer, which signs the web app with its key kept offline (pwa/README.md), also signs what it
// found in the release, the APK's build and SHA-256 (deploy/web/publish.sh, pwa/release.mjs), and
// serves that beside the web app. Check for updates installs an APK only when that statement is
// signed by the key and names the same build and SHA-256 as version.json; until the release
// computer has signed a release, the release is not installed.

/** The release key's public half, as pwa/release-key.pub has it. */
export const RELEASE_KEY = 'pjWWvp05rToqI0/s1RBLqST1pOf8OnLzMW2m3L8NhGA=';

/** Where the release computer serves the statement: beside the web app. */
export const STATEMENT_URL = 'https://erevos-web.lphl.nekten.eu/android-update.json';

/** What the release key signs for an APK, as pwa/release.mjs androidStatement makes it. */
export function statementOf(build: number, sha256: string): string {
  return `erevos android update v1\nbuild ${build}\nsha256 ${sha256}\n`;
}

/** Whether `text` (android-update.json) is the statement for this release's APK, signed by `key`. */
export async function signsRelease(text: string, release: Release, key = RELEASE_KEY): Promise<boolean> {
  if (!release.apk || !canVerify()) return false;
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return false;
  }
  const d = (data ?? {}) as Partial<Record<'statement' | 'signature', unknown>>;
  if (typeof d.statement !== 'string' || typeof d.signature !== 'string') return false;
  if (d.statement !== statementOf(release.build, release.apk.sha256)) return false;
  const signature = fromBase64(d.signature);
  if (signature.length !== 64) return false;
  return verifySignature(fromBase64(key), utf8Encode(d.statement), signature);
}

/**
 * Whether android-update.json (`text`, null when the server has none) lets `release` install:
 * signed; not signed yet, when there is none or it is still the statement of an older build; or
 * refused, when it names this release (or none) and does not check.
 */
export async function signingOf(text: string | null, release: Release, key = RELEASE_KEY): Promise<'signed' | 'not yet' | 'refused'> {
  if (text === null) return 'not yet';
  if (await signsRelease(text, release, key)) return 'signed';
  let statement: unknown;
  try {
    statement = (JSON.parse(text) as { statement?: unknown } | null)?.statement;
  } catch {
    return 'refused';
  }
  const build = typeof statement === 'string' ? /^erevos android update v1\nbuild (\d+)\n/.exec(statement)?.[1] : undefined;
  return build && Number(build) < release.build ? 'not yet' : 'refused';
}

/** The statement the release computer serves now, or null when there is none. Throws when its server cannot be reached. */
export async function fetchStatement(fetchImpl: typeof fetch = fetch): Promise<string | null> {
  const res = await fetchImpl(STATEMENT_URL, { headers: { 'Cache-Control': 'no-cache' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(t('The web app\'s server answered {status}.', { status: res.status }));
  return res.text();
}

// Since there are several channels (lib/update-channel.ts), the release computer signs each apart, in
// android-update-<channel>.json beside android-update.json, with a statement that names the channel
// and the release's name too: so a statement of one channel never lets another's package install,
// and the notice of a new version (lib/release-notice.ts) reads the name from it. android-update.json
// stays, for Erevos's own channel, as every Erevos before reads it.

/** Where the release computer serves a channel's statement. */
export function channelStatementUrl(name: ChannelName): string {
  return STATEMENT_URL.replace(/android-update\.json$/, `android-update-${wireOf(name)}.json`);
}

/** What the release key signs for a channel's APK, as pwa/release.mjs channelStatement makes it: `name` as published (wireOf). */
export function channelStatementOf(name: string, version: string, build: number, sha256: string): string {
  return `erevos android update v2\nchannel ${name}\nname ${version}\nbuild ${build}\nsha256 ${sha256}\n`;
}

const V2 = /^erevos android update v2\nchannel (erevos|erevos-beta|plus|plus-beta|erevos-plus|erevos-plus-beta|lite|lite-beta)\nname ([0-9a-z.-]{1,40})\nbuild ([1-9]\d*)\nsha256 ([0-9a-f]{64})\n$/;

/** A channel's statement as it reads, when signed by `key`: its channel as published (wireOf), name, build and SHA-256; null for anything else. */
export async function readChannelStatement(text: string, key = RELEASE_KEY): Promise<{ channel: string; name: string; build: number; sha256: string } | null> {
  if (!canVerify()) return null;
  let d: Partial<Record<'statement' | 'signature', unknown>>;
  try {
    d = (JSON.parse(text) ?? {}) as typeof d;
  } catch {
    return null;
  }
  if (typeof d.statement !== 'string' || typeof d.signature !== 'string') return null;
  const m = V2.exec(d.statement);
  if (!m) return null;
  let signature: Uint8Array;
  try {
    signature = fromBase64(d.signature.trim());
  } catch {
    return null;
  }
  if (signature.length !== 64 || !(await verifySignature(fromBase64(key), utf8Encode(d.statement), signature))) return null;
  return { channel: m[1]!, name: m[2]!, build: Number(m[3]), sha256: m[4]! };
}

/**
 * Whether the statement of `release`'s channel (`text`, null when the server has none) lets it
 * install: signed, when it is signed and names that channel, the release's name, build and SHA-256;
 * not yet, when there is none or it names an older build; else refused.
 */
export async function channelSigningOf(text: string | null, release: ChannelRelease, key = RELEASE_KEY): Promise<'signed' | 'not yet' | 'refused'> {
  if (text === null || !release.apk) return text === null ? 'not yet' : 'refused';
  const read = await readChannelStatement(text, key);
  const wire = wireOf(release.channel);
  if (read && read.channel === wire && read.name === release.version && read.build === release.build && read.sha256 === release.apk.sha256) return 'signed';
  if (read && read.channel === wire && read.build < release.build) return 'not yet';
  let statement: unknown;
  try {
    statement = (JSON.parse(text) as { statement?: unknown } | null)?.statement;
  } catch {
    return 'refused';
  }
  const build = typeof statement === 'string' ? /\nbuild (\d+)\n/.exec(statement)?.[1] : undefined;
  return !read && build && Number(build) < release.build ? 'not yet' : 'refused';
}

/**
 * Whether `release` may install, by its channel's statement on the release computer's server. For
 * Erevos's own channel, while the server has no android-update-erevos.json yet, android-update.json
 * as before. Throws when the server cannot be reached.
 */
export async function releaseSigning(release: ChannelRelease, fetchImpl: typeof fetch = fetch, key = RELEASE_KEY): Promise<'signed' | 'not yet' | 'refused'> {
  const res = await fetchImpl(channelStatementUrl(release.channel), { headers: { 'Cache-Control': 'no-cache' } });
  if (res.status === 404) return release.channel === 'erevos' ? signingOf(await fetchStatement(fetchImpl), release, key) : 'not yet';
  if (!res.ok) throw new Error(t('The web app\'s server answered {status}.', { status: res.status }));
  return channelSigningOf(await res.text(), release, key);
}
