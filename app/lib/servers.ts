// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The servers this build names by itself, in one place. LPHL's are the default; nothing here is
// needed to use Erevos with servers of one's own, which the owner sets in the app (a relay and its
// token, a relay to sign in at, WebDAV for backups and the Collection). Whoever builds Erevos for a
// community of their own may name theirs instead, with two settings of the build (app.config.js):
//   EREVOS_WEB_ORIGIN    the web server with Erevos's pages: contact pages (/c), invites by SMS
//                        (/i), which Android then opens in Erevos, and the speech and translation
//                        models (/models/, each checked against its hash in the core)
//   EREVOS_START_RELAY   the relay a phone with no relay yet is offered to sign in at, and that
//                        linking a device offers when the space has none
// Fixed, whatever the build says: what other phones read the same way (an invite by SMS with no
// relay in it names LPHL's, so every build reads it alike), and where Erevos's own releases are
// announced (lib/release-notice.ts, lib/update-signature.ts), which goes with the release key.
// The helper servers of a call straight between two phones (lib/direct.ts) follow EREVOS_START_RELAY:
// the call relay beside that relay first (LPHL_HELPER for LPHL's), and PUBLIC_HELPERS only when it
// does not answer.
// Expo is asked only when it is there, so the checks, in plain Node, can load this file.

/** LPHL's relay: the relay an invite by SMS with no relay in it names, in every build. */
export const LPHL_RELAY = 'wss://erevos.lphl.nekten.eu';
/** LPHL's web server: where Erevos's releases are announced and signed for, in every build. */
export const LPHL_WEB = 'https://erevos-web.lphl.nekten.eu';
/**
 * The helper server (STUN) beside LPHL's relay: its call relay, which listens on 3480 there, as
 * another service of that machine has the usual 3478 (lib/direct.ts helperOf).
 */
export const LPHL_HELPER = 'stun:erevos.lphl.nekten.eu:3480';

/** An origin as the build may give it: https, a host, maybe a port, no path. */
export const WEB_ORIGIN_SHAPE = /^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:[0-9]{1,5})?$/;
/** A relay as the build may give it: wss, a host, maybe a port, no path. */
export const RELAY_SHAPE = /^wss:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:[0-9]{1,5})?$/;

function given(name: 'webOrigin' | 'startRelay'): string {
  try {
    const constants = (require('expo-constants') as typeof import('expo-constants')).default;
    const value = constants.expoConfig?.extra?.[name];
    return typeof value === 'string' ? value : '';
  } catch {
    return '';
  }
}

/** The web server of this build's pages, as `given`, or LPHL's when it gives none or one not shaped as an origin. */
export function webOriginOf(value: string): string {
  return WEB_ORIGIN_SHAPE.test(value) ? value : LPHL_WEB;
}

/** The relay this build offers first, as `given`, or LPHL's when it gives none or one not shaped as a relay. */
export function startRelayOf(value: string): string {
  return RELAY_SHAPE.test(value) ? value : LPHL_RELAY;
}

/**
 * Public helper servers (STUN) that tell a phone its own internet address, which anyone may ask:
 * Cloudflare's and Nextcloud's. A call straight between two phones (lib/direct.ts callHelpers) asks
 * them only as a reserve, when the helper beside this build's first relay does not answer, and
 * never when the owner typed helpers of their own. They see the address that asks, nothing else.
 */
export const PUBLIC_HELPERS: readonly string[] = ['stun:stun.cloudflare.com:3478', 'stun:stun.nextcloud.com:443'];

/** The web server with this build's pages and models. */
export const WEB_ORIGIN = webOriginOf(given('webOrigin'));
/** The relay a phone with no relay yet is offered to sign in at. */
export const START_RELAY = startRelayOf(given('startRelay'));

/**
 * The page and its data of a link to an Erevos page, /c#... or /i#..., on any web server: this
 * build's, LPHL's, or a community's that serves Erevos's pages. What follows # never reaches that
 * server, and it is the same as the link the page opens in the app, so where it stands changes
 * nothing of what Erevos does with it: the screen it opens asks before anything is taken.
 * The server answers /c with /c/, so a link copied from the address bar may read /c/#.
 */
export function pageLink(text: string, page: 'c' | 'i'): string | null {
  const match = /^https:\/\/[a-z0-9.-]+(?::[0-9]{1,5})?\/([ci])\/?#(.*)$/is.exec(text);
  return match && match[1].toLowerCase() === page ? match[2] : null;
}
