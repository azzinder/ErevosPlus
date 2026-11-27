// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { Contact } from '../lock/e2e-data';
import { sameRelay } from './relay';

// The invite a phone sends by itself to a contact with no queue of their own (app/chat.tsx
// offerRelays, lib/relay-offer.ts) is one of its invites to its relay. The phone that sent it learns
// when theirs came onto the relay with it: once they read there (their messages say so), the relay
// is asked about that invite, once, and their chat says so, with Take back under that line while
// they are there (app/chat.tsx invitesCame, lib/call-lines.ts inviteLine). Only that phone knows.

/** The contacts sent an invite to the relay at `relay` (Contact.rid) who read there now, not yet
 *  said: the relay is asked whether they came in with it. */
export function invitesToSettle(contacts: readonly Contact[], relay: string): Contact[] {
  return contacts.filter((c) => !!c.rid && !c.rin && !c.rib && !!c.sender && !!relay.trim() && sameRelay(c.relay, relay));
}

/** Whether this phone holds a place for them on its relay at `relay` that it may take back: they
 *  came in with its invite, it was not taken back, and they read there still. */
export function holdsPlace(contact: Contact | undefined, relay: string): boolean {
  return !!contact?.rid && !!contact.rin && !contact.rib && !!contact.sender && !!relay.trim() && sameRelay(contact.relay, relay);
}
