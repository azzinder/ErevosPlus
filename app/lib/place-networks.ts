// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { onHiddenPlaceChange, openHiddenPlace } from './hidden-contacts';
import { closeMatrixPlaces, followMatrixPlaces } from './matrix-store';
import { closeNostrDmPlaces, followNostrDmPlaces } from './nostr-dm-store';
import { onPlacesChange, receivingPlaces } from './place-receiver';
import type { PlaceKey } from './place-lives';
import { closeTelegramPlaces, followTelegramPlaces } from './telegram-store';
import { closeXmppPlaces, followXmppPlaces } from './xmpp-store';

// A hidden place's own accounts on Matrix, XMPP, Nostr and Telegram (the ErevosGram build) (docs/matrix.md, docs/xmpp.md,
// docs/nostr-chats.md): each kept in the place's own value of its network's file, sealed with the
// place's key (lock/xmpp-data.ts and the others), apart from the space's, which never sees them.
// They run while the place's hidden chats are open, beside the space's; and as its hidden chats
// do, while they are closed too if they receive while closed (lib/place-receiver.ts, its switch
// in lock/hidden-keep.ts): then a message tells only "New message", and a call rings with no name
// until the PIN opens them (lib/xmpp-calls.ts, lib/matrix-calls.ts). Otherwise they stop as the
// hidden chats close (lib/hidden-contacts.ts). Their screens are the same as the space's, opened
// from the hidden chats (lib/network-place.ts); their chats are rows of the hidden chats' list,
// and tell nothing outside it.

/** Follows the hidden chats as they open and close, and the places that receive, for as long as the space is open. Returns how to stop. */
export function watchPlaceNetworks(): () => void {
  // Each store starts, stops, or shows another only as it changed (lib/place-lives.ts).
  const follow = () => {
    const open = openHiddenPlace();
    const receiving = receivingPlaces();
    const space = open?.space ?? receiving[0]?.space ?? null;
    const wanted: PlaceKey[] = space === null ? [] : receiving.filter((place) => place.space === space).map(({ pocket, key }) => ({ pocket, key }));
    if (open && !wanted.some((place) => place.pocket === open.pocket)) wanted.push({ pocket: open.pocket, key: open.key });
    const shown = open?.pocket ?? null;
    if (space === null) {
      closeAll();
      return;
    }
    followMatrixPlaces(space, wanted, shown);
    followXmppPlaces(space, wanted, shown);
    followNostrDmPlaces(space, wanted, shown);
    followTelegramPlaces(space, wanted, shown);
  };
  const closeAll = () => {
    closeMatrixPlaces();
    closeXmppPlaces();
    closeNostrDmPlaces();
    closeTelegramPlaces();
  };
  follow();
  const stopOpen = onHiddenPlaceChange(follow);
  const stopPlaces = onPlacesChange(follow);
  return () => {
    stopOpen();
    stopPlaces();
    closeAll();
  };
}
