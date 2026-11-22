// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { t } from './i18n';
import { channelsOf, type Channel, type ChannelName } from './update-channel';
import { VERSION_NAME } from './version-name';
// New versions, as in LPHL FASOULI. Every release (.github/workflows/release.yml) also goes to the
// public repository RELEASES_REPO, one release per version (tag v2.0.0 and up; v0.1.<build> until
// 0.1.16) with its packages and version.json, which says what the release is. Erevos reads the latest version.json only when
// its owner taps Check for updates: it never looks by itself, since a regular check would tell
// GitHub, every day, that this device has Erevos.

export const RELEASES_REPO = 'azzinder/erevos-releases';
export const RELEASES_PAGE = `https://github.com/${RELEASES_REPO}/releases/latest`;
export const LATEST_URL = `https://github.com/${RELEASES_REPO}/releases/latest/download/version.json`;

// Each channel but Erevos's own (lib/update-channel.ts) has a release of its own in the public
// repository, under a tag that stays (channel-plus, channel-erevos-beta, channel-plus-beta), whose
// version.json the release workflow replaces with each release of that channel; Erevos's own is the
// repository's latest release, as every Erevos before read it.

/** Where a channel's version.json is. */
export function channelUrl(name: ChannelName): string {
  return name === 'erevos' ? LATEST_URL : `https://github.com/${RELEASES_REPO}/releases/download/channel-${name}/version.json`;
}

/** A channel's download page. */
export function channelPage(name: ChannelName): string {
  return name === 'erevos' ? RELEASES_PAGE : `https://github.com/${RELEASES_REPO}/releases/tag/channel-${name}`;
}

export interface Release {
  /** 2.0.0 and up, or a test release such as 4.0.0-rc.1; 0.1.<build> until 0.1.16. */
  version: string;
  /** The build's number, which goes up with every release whatever its version. */
  build: number;
  /** YYYY-MM-DD */
  date: string;
  /** The Android package, when the release has one, with its SHA-256 (lowercase hex). */
  apk: { url: string; size: number; sha256: string } | null;
}

/** The build number in a version until 0.1.16, 0.<minor>.<build>; 0 for any other, and for a build made on a computer (0.0.x). */
export function buildOf(version: string | null | undefined): number {
  const m = /^0\.[1-9]\d*\.(\d+)$/.exec(version ?? '');
  return m ? Number(m[1]) : 0;
}

/**
 * The running app's build number: since 2.0.0 app.config.js keeps it apart from the version, in
 * `extra.build`; until 0.1.16 it was the version's last number. 0 for a build made on a computer.
 */
export function buildNumber(extraBuild: unknown, version: string | null | undefined): number {
  return typeof extraBuild === 'number' && Number.isInteger(extraBuild) && extraBuild > 0 ? extraBuild : buildOf(version);
}

/**
 * Downloads come only from the public repository's own releases: an https address of github.com
 * whose path, decoded and resolved (no "..", encoded or not), is under its download path.
 */
export function isReleaseFile(url: string): boolean {
  let parsed: URL;
  try {
    const raw = new URL(url);
    if (raw.username || raw.password) return false;
    parsed = new URL(decodeURIComponent(raw.pathname), raw.origin);
  } catch {
    return false;
  }
  return parsed.protocol === 'https:' && parsed.host === 'github.com' && parsed.pathname.startsWith(`/${RELEASES_REPO}/releases/download/`);
}

/**
 * version.json, checked; null if it is not a release this app understands. `apkOf` names the APK
 * that updates this build: `apk`, or `erevosgram` for the ErevosGram build (docs/erevosgram.md),
 * which the plain APK would otherwise replace with an Erevos without Telegram.
 */
export function parseRelease(text: string, apkOf: 'apk' | 'erevosgram' = 'apk'): Release | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const build = typeof d.build === 'number' && Number.isInteger(d.build) && d.build > 0 ? d.build : 0;
  if (!build) return null;
  // Since 2.0.0 the release's name is `name`; `version` stays 0.1.<build> there for Erevos 0.1.16
  // and before, which read only that.
  let version: string;
  if (typeof d.name === 'string' && VERSION_NAME.test(d.name)) version = d.name;
  else if (typeof d.version === 'string' && buildOf(d.version) === build) version = d.version;
  else return null;
  const date = typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date) ? d.date : '';
  const apk = d[apkOf] as Record<string, unknown> | undefined;
  const apkOk =
    !!apk &&
    typeof apk.url === 'string' &&
    isReleaseFile(apk.url) &&
    typeof apk.size === 'number' &&
    apk.size > 0 &&
    typeof apk.sha256 === 'string' &&
    /^[0-9a-f]{64}$/i.test(apk.sha256);
  return {
    version,
    build,
    date,
    apk: apkOk ? { url: apk.url as string, size: apk.size as number, sha256: (apk.sha256 as string).toLowerCase() } : null,
  };
}

/** A release, with the channel it was found in. */
export type ChannelRelease = Release & { channel: ChannelName };

/**
 * The newest release of `channel` (lib/update-channel.ts): of its edition, and, when it takes betas,
 * the newer of the regular release and the beta. Null when there is none yet. Throws when a
 * channel's version.json cannot be reached; a beta channel that has none yet is passed over.
 */
export async function fetchChannelRelease(channel: Channel, fetchImpl: typeof fetch = fetch): Promise<ChannelRelease | null> {
  const [regular, beta] = channelsOf(channel);
  const one = async (name: ChannelName): Promise<ChannelRelease | null> => {
    const res = await fetchImpl(channelUrl(name), { headers: { 'Cache-Control': 'no-cache' } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(t('GitHub answered {status}.', { status: res.status }));
    const release = parseRelease(await res.text());
    return release ? { ...release, channel: name } : null;
  };
  const first = await one(regular!);
  const second = beta ? await one(beta).catch(() => null) : null;
  if (!first) return second;
  if (!second) return first;
  return second.build > first.build ? second : first;
}

/** Whether `release` is newer than the running build (a build made on a computer, 0, never updates). */
export function isNewer(release: Release, currentBuild: number): boolean {
  return currentBuild > 0 && release.build > currentBuild;
}

/** The latest release, or null when there is none yet. Throws when it cannot be reached. */
export async function fetchLatestRelease(fetchImpl: typeof fetch = fetch, apkOf: 'apk' | 'erevosgram' = 'apk'): Promise<Release | null> {
  const res = await fetchImpl(LATEST_URL, { headers: { 'Cache-Control': 'no-cache' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(t('GitHub answered {status}.', { status: res.status }));
  return parseRelease(await res.text(), apkOf);
}

// The release's file for each package of the computer's shell (desktop/main.js system()), as the
// release workflow names them.
export const PACKAGE_FILES = new Map([
  ['windows', 'erevos-windows-x64-setup.exe'],
  ['windows-portable', 'erevos-windows-x64-portable.exe'],
  ['macos', 'erevos-macos.dmg'],
  ['linux', 'erevos-linux-x86_64.pacman'],
  ['linux-appimage', 'erevos-linux-x86_64.AppImage'],
]);

/**
 * The file of a release that updates this app where it installs from the download page: on Sailfish
 * OS its RPM, on a computer the file of the package the shell says it is, else null.
 */
export function packageFile(shell: 'electron' | 'sailfish' | null, system: string): string | null {
  if (shell === 'sailfish') return 'erevos-sailfish-aarch64.rpm';
  if (shell === 'electron') return PACKAGE_FILES.get(system) ?? null;
  return null;
}

/** "111 MB" */
export function formatSize(bytes: number): string {
  return `${Math.round(bytes / 1_000_000)} MB`;
}

// How many times a download that stalls is tried, in all.
export const DOWNLOAD_TRIES = 3;

/**
 * Whether a download failed as its connection stalled or broke (Android's OkHttp gives
 * "SocketTimeoutException: timeout", "Connection reset", "unexpected end of stream"), so that
 * trying again may get it, unlike a refused address or a full phone.
 */
export function stalled(error: unknown): boolean {
  const text = String((error as { message?: unknown } | null)?.message ?? error);
  return /SocketTimeoutException|timed? ?out|Connection reset|unexpected end of stream|stream was reset|Software caused connection abort/i.test(text);
}
