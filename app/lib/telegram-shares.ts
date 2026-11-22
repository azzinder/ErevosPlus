// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { Place } from './chat-parts';
import { parseVCards } from './vcard';

// What a Telegram chat (app/telegram-chat.tsx) sends for Erevos's "Send where you are?"
// (components/place-sheet.tsx) and its contact card (components/card-share.tsx), as TDLib takes
// them: a place as inputMessageLocation, a card as inputMessageContact with the card itself as its
// vCard, so that Telegram's own apps show the name and number and can add the contact.

type Json = Record<string, unknown>;

/** A place, as Telegram's message of a location. */
export function locationContent(place: Place): Json {
  return { '@type': 'inputMessageLocation', location: { '@type': 'location', latitude: place.lat, longitude: place.lon, horizontal_accuracy: place.acc ?? 0 } };
}

/** A contact card, as Telegram's message of a contact; null when it has no number, which Telegram needs. */
export function contactContent(card: string): Json | null {
  const read = parseVCards(card)[0];
  const phone = read?.phones.find((p) => p.value.trim())?.value.trim();
  if (!read || !phone) return null;
  const first = read.given.trim() || read.name.trim();
  const last = read.given.trim() ? read.family.trim() : '';
  return { '@type': 'inputMessageContact', contact: { '@type': 'contact', phone_number: phone, first_name: first, last_name: last, vcard: card, user_id: 0 } };
}
