// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { linkParts } from './open-link';
import { checkInvite } from './relay-invite';
import { textInviteOf } from './text-invite';
import { welcomeOf } from './welcome';

// Erevos opened for the first time with an invite (lib/setup-after.ts): one that brings a place on
// the inviting phone's server, a server at someone's home say, makes that the first space's server,
// as whoever invited meant, and LPHL's open one is not taken (lib/open-place.ts), unless the invite
// is not taken in the end. Self-contained, so the checks run it under Node.

/**
 * Whether `invite`, the screen of the link Erevos was first opened with, brings a server of its own:
 * an invite for someone new with a place on the inviting phone's server (lib/welcome.ts), one by SMS
 * that is not over (lib/text-invite.ts), or an invite to a server alone (lib/relay-invite.ts). A
 * contact link, a contact card or an invite with no place brings none.
 */
export function bringsServer(invite: string | undefined, now = Date.now()): boolean {
  if (!invite) return false;
  const { path, params } = linkParts(invite);
  if (path === '/welcome') return !!welcomeOf(params)?.invite;
  if (path === '/relay-invite') return checkInvite(params.relay, params.code) !== null;
  if (path === '/text-invite') {
    const found = textInviteOf(params.d);
    return !!found && !found.card && found.expires > now;
  }
  return false;
}
