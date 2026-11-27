// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A chat that goes only through Tor (lib/tor-chats.ts, app/chat.tsx) in Greek (i18n/el/index.ts).
export const torChatText: Record<string, string> = {
  "This chat goes only through Tor, which this build of Erevos does not have.": "Αυτή η συνομιλία πηγαίνει μόνο μέσω Tor, που αυτή η έκδοση του Erevos δεν έχει.",
  "Messages and files with {name} now go only through Tor. They wait while Tor starts.": "Τα μηνύματα και τα αρχεία με {name} πηγαίνουν πλέον μόνο μέσω Tor. Περιμένουν όσο ξεκινά το Tor.",
  "Messages with {name} go as the space’s Tor setting says.": "Τα μηνύματα με {name} πηγαίνουν όπως λέει η ρύθμιση Tor του χώρου.",
  "Through Tor": "Μέσω Tor",
  "This chat goes only through Tor, on its own circuits, whatever the space’s Tor setting: the server does not see your address for it. Slower, and it waits while Tor starts. Calls do not go through Tor.": "Αυτή η συνομιλία πηγαίνει μόνο μέσω Tor, από δικά της κυκλώματα, ό,τι κι αν λέει η ρύθμιση Tor του χώρου: ο server δεν βλέπει τη διεύθυνσή σου γι' αυτήν. Πιο αργά, και περιμένει όσο ξεκινά το Tor. Οι κλήσεις δεν περνούν από Tor.",
  "This chat goes as the space’s Tor setting says. Turn on to send it only through Tor.": "Αυτή η συνομιλία πηγαίνει όπως λέει η ρύθμιση Tor του χώρου. Άνοιξέ το για να πηγαίνει μόνο μέσω Tor.",
  "This build of Erevos has no Tor, so this chat sends nothing from here while this is on. Turn it off here, or write from the phone.": "Αυτή η έκδοση του Erevos δεν έχει Tor, γι’ αυτό αυτή η συνομιλία δεν στέλνει τίποτα από εδώ όσο το «Μέσω Tor» είναι ανοιχτό. Κλείσε το εδώ ή γράψε από το τηλέφωνο.",
};
