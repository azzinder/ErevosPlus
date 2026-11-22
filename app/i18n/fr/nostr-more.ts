// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of more in Nostr chats and public posts: pins for this device, deleting, stickers, polls (i18n/fr/index.ts).
export const nostrMore: Record<string, string> = {
  'They are removed from this phone. Of your own, the others are asked to remove them too: their Nostr apps may or may not do so.':
    'Ils sont retirés de ce téléphone. Pour les tiens, les autres sont aussi priés de les retirer : leurs applis Nostr le font ou non.',
  'Your stickers go as photos do, encrypted: other Nostr apps show them as photos.': 'Tes stickers partent comme des photos, chiffrés : les autres applis Nostr les affichent comme des photos.',
  'Open for': 'Ouvert pendant',
  Vote: 'Voter',
  Results: 'Résultats',
  'Open until {when}': 'Ouvert jusqu’à {when}',
  'Your vote is public: anyone can see what you chose.': 'Ton vote est public : tout le monde peut voir ce que tu as choisi.',
  '{n} vote': '{n} vote',
  '{n} votes': '{n} votes',
  'Through Tor: on': 'Via Tor : activé',
  'What you send here, the look-up of where they read, and the photos and files of this chat go only through Tor, on circuits of their own, whatever the space’s Tor way; never without Tor. What comes to you follows your Nostr account, whose relays are read once for all its chats.':
    'Ce que tu envoies ici, la recherche de l’endroit où ils lisent, et les photos et fichiers de cette discussion passent uniquement par Tor, sur des circuits à eux, quel que soit le mode Tor de l’espace ; jamais sans Tor. Ce qui t’arrive suit ton compte Nostr, dont les relais sont lus une fois pour toutes ses discussions.',
  'Not through Tor now: the Nostr relays see your address.':
    'Pas via Tor pour l’instant : les relais Nostr voient ton adresse.',
  'Not through Tor now: the Nostr relays see your address. Tor for this account is under Settings → Relay and networks → Nostr chats.':
    'Pas via Tor pour l’instant : les relais Nostr voient ton adresse. Le Tor de ce compte est sous Réglages → Relais et réseaux → Discussions Nostr.',
  'A chat can also go through Tor by itself, on circuits of its own: «Through Tor» at its foot. It does, whatever is chosen here.':
    'Une discussion peut aussi passer seule par Tor, sur des circuits à elle : « Via Tor » en bas de la discussion. Elle passe alors ainsi, quel que soit le choix ici.',
};
