// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The app's words (lib/i18n.ts) whose «Erevos» Erevos+ keeps as written (lib/edition.ts namesEditions):
// they speak of the other person's app, which may be the plain Erevos (their Erevos, a phone with or
// without Erevos, a member whose Erevos is older), of Erevos as what both editions share (Erevos phones
// nearby, an Erevos ID or invite), or of the plain Erevos alone (on a computer, an iPhone or Sailfish OS).
// In the guide the same is marked {=Erevos} (lib/edition.ts guideNamed). checks/edition.check.ts holds
// each to a text of the app.
export const KEEPS_EREVOS: ReadonlySet<string> = new Set([
  "Their phone shows it without a sound or vibration. Erevos as a web app cannot tell, nor can the notice of chats that are closed (hidden chats, another space), and these sound as usual.",
  "Not added. That contact uses the relay at {url}, and its link has no key for that relay. Ask them for a new link from an updated Erevos.",
  "{what} to the Erevos phones nearby, end-to-end encrypted, as the relay could not be reached. If {name}'s is not one of them, they hand it to {name}'s relay once they reach the internet, and so does this phone.",
  "{what} to the Erevos phones nearby, end-to-end encrypted, as the relay could not be reached. It comes only if {name}'s is one of them.",
  "That is not an Erevos contact link.",
  "Screenshots and screen recordings of this chat are blocked on both phones, on Android. Either of you can turn it on or off. Erevos on an iPhone, on a computer, in a browser or on Sailfish cannot block them, and nothing stops a photo of the screen taken with another camera.",
  "While a space is open, Erevos phones and computers on the same Wi-Fi or hotspot find each other and talk directly, even with no internet. Anyone on that Wi-Fi can tell an Erevos app is there, not whose.",
  "Besides Bluetooth, Erevos phones near each other find each other and talk over Wi-Fi Aware, faster and farther, with no internet. Anyone near can tell an Erevos phone is there, not whose.",
  "Only Bluetooth looks for Erevos phones near this one, and the same Wi-Fi when that is on.",
  "With no Wi-Fi in common, two Erevos phones near each other make a small Wi-Fi of their own (Wi-Fi Direct): faster than Bluetooth, and calls go over it with no internet. Anyone near can tell an Erevos phone is there and could join that Wi-Fi, getting only sealed bytes.",
  "Erevos phones meet only on a Wi-Fi they share, or over Bluetooth and Wi-Fi Aware.",
  "When the relay cannot be reached, Erevos phones nearby give each other what they could not send, sealed for the contact's relay. This phone keeps those it gets, three days at most, and hands them to that relay through yours. It cannot read them, nor tell who they are from or for: it sees only the relay's address.",
  "Asked, joining once Erevos is open on their phone: {names}",
  "The admin takes you out the next time Erevos is open on their phone. You read nothing the group says after.",
  "You are the group's admin: you add and take out members. Each contact's phone joins by itself the next time Erevos is open there. Messages are end-to-end encrypted for the whole group (MLS), and no relay learns who is in it.",
  "Missing. This code is from an older version of Erevos and cannot be added. Ask for a new one.",
  "Your radio then says its name to every radio in reach now and then, kilometres away, and where it is if its GPS is on. It says them in the clear, as Meshtastic does: anyone with a radio can read them, without Erevos. They can show where you are, and tie the radio to you.",
  "What you write to a contact whose Erevos reads on Nostr too goes through your relays first: your relay, then their home relays, then your home relay. Only when none of them takes it does it go through public Nostr relays. There it is end-to-end encrypted as always, and sealed once more for a key your contact gave this chat alone, by a key made for that message alone: the Nostr relays see neither who wrote it nor to whom, and your relay does not see what went that way.",
  "Puts a backup in place of everything on {device}. Chats that went on after the backup was made start anew by themselves; one with a contact whose Erevos is older may need their contact link again. Use a backup on one device at a time.",
  "This number has Erevos: link it to a contact",
  "That code has no key. Ask for their contact link or QR code from this version of Erevos.",
  "This build has no Erevos core, so it cannot encrypt. Rebuild the app.",
  "There is no relay, and no Erevos phone is linked nearby. Type the relay address in Relay, or come near their phone.",
  "Each member’s phone tells you, end-to-end encrypted. A member whose Erevos is older than these marks tells nothing, and stays under Not yet.",
  "A device whose Erevos is older cannot hold them: update it there first.",
  "{name} has an older Erevos: update it there first.",
  "You own the group: your phone lets people in, so they join once Erevos is open on it. Anyone with the link reads what is said from when they join, never what came before.",
  "The group shows in your chats once its owner’s phone lets you in: when Erevos is open on it, and if the group asks for it, once an admin says yes.",
  "A public group you own. Your phone lets people in when Erevos is open on it.",
  "The owner’s phone lets them in once it hears your answer, when Erevos is open on it.",
  "The owner’s phone takes you out the next time Erevos is open on it. You read nothing the group says after.",
  "Erevos ID",
  "Erevos ID: {id}",
  "That is not an Erevos ID: an Erevos ID is a contact link starting with erevos://contact",
  "The contact link their Erevos shows, under Copy my contact link or as their QR code. Once saved, they join these hidden chats, and the contact shows their chat and calls.",
  "The contact link their Erevos shows, under Copy my contact link or as their QR code, or choose them among these hidden chats' contacts. Added here, they join these hidden chats, and this card shows their chat and calls.",
  "That QR code holds no Erevos ID.",
  "{name} invites you to Erevos",
  "An invite to Erevos",
  "Sign in on the page the browser opened, then tap Open Erevos there. If nothing opens, type here the code it shows.",
  "Your contacts reach you with texts, stickers and reactions. For photos, voice messages, calls and groups, ask someone who uses Erevos for an invite and tap I have their code.",
  "Your contacts reach you only when near, over Wi-Fi or Bluetooth. To be reached from anywhere, ask someone who uses Erevos for an invite and tap I have their code.",
  "Give someone who uses Erevos your QR code or link. Texts go through Nostr.",
  "Give someone who uses Erevos your QR code or link. You reach each other when near, over Wi-Fi or Bluetooth.",
  "A link to put on a web page, such as your contact page: it opens a page that offers Erevos to whoever has no Erevos yet, then adds you. It works for as long as your contact link does.",
  "Join me on Erevos, for messages and calls only we can read: {link}",
  "{number} sent you an Erevos invite by SMS. Answer it with your contact link, so they can write to you here? Only if you know this number: the sender of an SMS can be made up.",
  "No Erevos yet? An SMS with a link: it offers them Erevos, and once they join you are each other’s contacts, end-to-end encrypted. For one person, for two days.",
  "Texts go by SMS to their number, end-to-end encrypted, only when the relay, Nostr, the phones nearby and LoRa all fail. Each costs SMS, and the phone company sees who wrote to whom, and when. Both phones need Erevos as the SMS app.",
  "Only texts and deletes go so, not photos, files, voice messages, marks or calls, nor long texts (about 800 Latin letters at most, or 400 Greek ones), nor anything from hidden chats. Both phones need Erevos as the SMS app.",
  "Your backup's password can be split into pieces for friends you trust: any 2 or 3 of them give it back, one alone shows nothing. If you lose your phone or forget the password, ask them for their pieces. Each goes inside the encryption of your chat with them, and only Erevos on their phone keeps it.",
  "The page on the other phone shows these two. They must be the same there; with internet, compare the certificate with the one on the Erevos website too.",
  "Both must be the ones the phone giving it shows. Once you have internet, compare the certificate with the one on the Erevos website too.",
  "The other phone has an older Erevos than this one.",
  "I already have Erevos on another phone",
  "{name} gets no more of it, and their Erevos deletes what came of it.",
  "Sharing, {percent}% · waiting for their Erevos to take it; an older one takes only the messages",
  "Ask someone who has Erevos to show you their QR code. Once you scan it, you are in and you are contacts, typing nothing.",
  "They scan it with their phone’s camera. With no Erevos yet, it shows them where to get it; then it gets ready by itself, with no relay or codes to type, and you are each other’s contacts.",
  "For one person, until {when}. It works when they have Erevos already, too.",
  "Send them your contact link with any app. They open it in Erevos, or paste it under I have their code, and you are each other’s contacts.",
  "An Erevos is near",
  "No Erevos on their phone?",
  "Join me on Erevos, where what we write to each other is end-to-end encrypted: {link}",
  "One link, for one person: their phone joins Erevos with it, typing nothing, and you are each other’s contacts at once. With no Erevos yet, it shows them where to get it.",
  "One link, for one person: their phone joins Erevos with it, typing nothing, and you are each other’s contacts at once. It opens only on a phone that has Erevos already.",
  "They scan it with their phone’s camera, with Erevos on it already: it gets ready by itself, with no relay or codes to type, and you are each other’s contacts.",
]);

// The app's words that speak both of this app and of the other person's or of what both editions
// share: for each «Erevos» in the English, in order, whether it stays as written (true) or says
// Erevos+ (false). A translation with as many «Erevos» follows the same order; one with another
// count keeps each as written (lib/edition.ts namedFor).
export const KEEPS_SOME: ReadonlyMap<string, readonly boolean[]> = new Map<string, readonly boolean[]>([
  ["{number} has Erevos. Messages to that number now go through Erevos, end-to-end encrypted.", [true, false]],
  ["{number} has Erevos and is now a contact. Messages to that number go through Erevos.", [true, false]],
  ["When messages come, or a call rings, while Erevos is closed, your relay sends a push and Erevos shows how many messages came since you last opened it, such as \"3 new messages\", or \"Call\" when only a call rang. With a relay or a sender's Erevos older than 2.0.0, or a message that other phones carried to the relay, it shows no number until you open it. Turned on for each space under Settings → Notifications → Notifications while closed, never for hidden chats.", [false, false, true]],
  ["As the SMS app, Erevos shows SMS and Erevos chats in one list. Writing to a number that has Erevos goes through Erevos, end-to-end encrypted. To everyone else it goes as a plain SMS, marked SMS: the phone company can read it, as it reads every SMS.", [false, false, true, false]],
  ["With the first SMS to a number that is not a contact, Erevos also sends a hidden invite. A phone without Erevos shows nothing. A phone with Erevos answers through the relay, and the two become contacts. The phone company sees one more short SMS. Each number is asked once a month at most. Turned off, Erevos sends no invites and answers none that come: no one becomes a contact from your number alone.", [false, true, true, false]],
  ["When messages come, or a call rings, while Erevos is closed, your relay sends a push through this browser's push service (Apple's on an iPhone), and Erevos shows how many messages came since you last opened it, such as \"3 new messages\", or \"Call\" when only a call rang, nothing more. The push carries no message and no sender, and its count is encrypted for this browser, but the push service sees when something comes for this device, and that it uses Erevos. With a relay or a sender's Erevos older than 2.0.0, or a message that other phones carried to the relay, there is no number: Erevos shows \"New message\", or \"New messages\" once more came, until you open it. Hidden chats never get notifications. Each space that turns them on has a push address of its own, so the address does not tie two spaces together at their relay.", [false, false, true, true, false]],
  ["The contact link their Erevos shows, under Copy my contact link or as their QR code. Once saved, they join your Erevos chats, and the contact shows their chat and calls.", [true, false]],
  ["The contact link their Erevos shows, under Copy my contact link or as their QR code. Added here, they join your Erevos chats, and this card shows their chat and calls, end-to-end encrypted.", [true, false]],
  ["Erevos asks GitHub for updates only when you tap the button: a regular check would tell GitHub that this device has Erevos. GitHub then sees this device's internet address, nothing else, and on Android so does the web app's server, which holds the release computer's signature of the update.", [false, true]],
]);
