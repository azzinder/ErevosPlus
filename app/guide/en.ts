// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

/** The user guide in English. Its format: lib/guide.ts. The same sections, in the same order and shape, as the Greek one. */
export const guide = `
## What Erevos is {#about}

Erevos is a messenger made for privacy. You need no account, no phone number and no email to use it, and it is
meant to keep working wherever you are: through a nearby phone with no network at all, over Wi-Fi, or over the
internet.

- **Nearby, without internet:** two Android phones talk directly over Bluetooth, Wi-Fi Aware or Wi-Fi Direct, end-to-end
  encrypted, and phones and computers on the same Wi-Fi or a phone's hotspot do too. With a LoRa radio, texts go kilometres.
- **Through a relay:** over Wi-Fi or the internet, through a small server (a relay) that you can run yourself.
- **Spaces:** a password lock, a second password that opens a separate, empty Erevos, and hidden chats in every
  space.
- **Appearance:** the LPHL looks: Classic, Modernist and Nocturne, twelve palettes, and glass as on lphl.nekten.eu.

{-**Erevos+** is the same app with more: chats with people on Telegram, Messenger, Signal, Session, Matrix, XMPP
and Nostr, on Android 8.0 or newer. Move to it, or back, in **Updates**: see [Erevos, Erevos+ or Erevos Lite, and betas](#update-channel).}

> Messages are **end-to-end encrypted**, through a relay and nearby alike, but nothing has been audited yet by
> independent experts. [What is protected today](#privacy) says exactly what is and is not.

This guide opens from **User guide** in the home screen's menu (the three dots at the top). The search at its top finds any word in it. The guide
is in every language of the app, and shows in the one you chose, see [Language](#start).

### Who makes it, and why

- **Who:** Erevos, by azzinder: the same person who made [Fasouli](https://github.com/azzinder/lphl-chrima-releases/releases/latest), a private app for your money.
- **Where:** it does not matter. What matters is that the relay and the app for the browser run on the maker's own
  server (lphl.nekten.eu).
- **For whom:** for anyone who wants to talk with their own people without giving a phone number, an email or an
  account: friends, families, groups, and those who live where the internet is cut off or watched. And for those who,
  with nothing to hide, want to keep their personal space private, away from prying eyes.
- **Why:** because the well-known apps ask for a phone number, know who talks to whom, and stop when the internet goes
  down. Because the "terms of use" of some of them do not cover us, and we have doubts about how they protect our
  privacy. Because others lack features we need. Erevos asks for nothing, and finds a way through whatever is there:
  the internet, Wi-Fi, Bluetooth, a phone nearby.
- **Who pays:** no one: no ads, no investors, no data collection. Whoever wants can help with the running costs, such
  as the server: **Settings** → **General** → **Support Erevos** has the ways, Liberapay, PayPal, Monero and Bitcoin.
  Giving or not changes nothing in the app.
  **Why:** each way opens outside Erevos, in the browser or a wallet, only when tapped, so Erevos itself sends nothing
  and never knows who gave. PayPal knows who gives; Monero shows neither who gave nor how much; Bitcoin shows no names,
  but what the address received is public.
- **Contact:** **Settings** → **General** → **Contact** adds the maker as a contact, and you write in Erevos itself,
  end-to-end encrypted, with no phone number and no email.

### Made with others' open source

Erevos itself is free software, under the AGPL-3.0-or-later licence, see [Licence](#licence), and it is built on
open-source work by others.
These are the main parts, each with its maker and its licence:

- **Element Call** (Element; AGPL-3.0): Matrix calls.
- **Arti, lyrebird, Snowflake and WebTunnel** (The Tor Project; Arti MIT or Apache-2.0, lyrebird BSD-2-Clause,
  Snowflake BSD-3-Clause, WebTunnel MIT): Tor inside the app, and Tor bridges on Android.
- **vodozemac** (Matrix.org Foundation; Apache-2.0): Matrix's encryption.
- **OpenMLS** (OpenMLS Authors; MIT): encrypted groups.
- **RustCrypto and dalek-cryptography libraries** (their developers; MIT or Apache-2.0 for RustCrypto, BSD-3-Clause for
  dalek-cryptography): the encryption itself.
- **React Native, Expo and react-native-webrtc** (Meta, 650 Industries and the React Native WebRTC Community; MIT): the
  app and its calls.
- **Electron** (Electron contributors; MIT): the computer app.
- **Inter fonts** (Rasmus Andersson and the Inter Project Authors; SIL Open Font License 1.1): the app's typefaces.

The full list, every package with its licence, is in the file \`CREDITS.md\` that comes with {=Erevos}'s source code.

**Why:** because their makers gave their work freely and asked to be named, and because you should be able to see what
Erevos is made of.

This part opens from **Settings** → **General** → **About Erevos** too.

## Getting started {#start}

Erevos is downloaded from its releases page, one file for each system: see [Updates](#updates) for where, and how to
update it. It runs on Android, on a computer (Linux, macOS and Windows), on Sailfish OS and, from the browser, on an
iPhone. If you are new to it, start with an invite from someone who uses it: one QR code or link, and you are in,
with them as a contact (see Inviting someone new, under [Chat through a relay](#relay)).

The home screen is the list of your chats, the one that moved last at the top. Each shows the contact's picture,
the last message with its marks, when it came, and how many of their messages you have not read. A clock beside it
means its messages disappear. **Search chats** finds a chat by its name or its last message, and, under the chats,
the messages that have what you type in them, in all the space's chats: tap one to open its chat at it. In a chat, its
details have **Search in this chat**: ▲ and ▼ go to what it found earlier and later. Either looks only on this phone:
in what it keeps sealed{~, and **Search in this chat** in the SMS a contact's chat shows too}; hidden chats are searched
only from inside them. A long chat opens at its latest 100 messages, and earlier ones, those imported from Telegram or
WhatsApp among them, come by themselves as you scroll up (**Show earlier messages**, above them, brings them too); going
to an earlier one (from the search, a starred message or the one a message answers) brings it too.
Every chat opens at its latest message, with the message bar under it: chats with contacts{~, groups and SMS
conversations|
and groups}{+, and the Matrix, XMPP and Nostr chats} alike. Scrolled up a little, round arrows show at the lower right in
each of them: the upper one goes to the chat's start, the lower one back to its end. Between them, when some messages
were new as you opened the chat, a double tick goes to the first of those, where you left off, for as long as that
message is out of sight. From the start, **Show later messages**, under what shows, brings more; writing a message, or
the lower arrow, goes back to the end.

**Why:** a long chat opens at its latest messages so that it opens at once: drawing all of it at a time would be slow,
on older phones most of all. Hidden chats are left out of the home screen's search so that the home screen looks the
same whether a space has any or not: their messages can be read only while their PIN has them open.

**Pinned and archived:** hold any chat down on the home screen, a contact's or a group's{~, |}{+on Matrix, XMPP, Nostr or
SMS}{-{~or an SMS conversation}}, for **Pin to the top**, **Archive** and, on Android, **Mute this chat**. At most 10 chats stay pinned. An
archived chat leaves the list until a new message comes from it; tap **Archived** at the top to see what you archived,{~
SMS too,} and tap it again to go back. Hidden chats keep their own pinned and archived chats.

- **The picture** is drawn from the contact's key: the same key always gives the same colours and moon{+ (in greens under Matrix)}, so you know
  a chat at a glance without any photo. It is not a check of the key; the [safety number](#relay) is.
- **The line under the search** says whether a relay is set and your queue is ready. Tap it to set one up.
- **The search and that line stay** under the top bar{~, with the services button,|} while the list scrolls.
- **Chat with myself**, always first in the chats, with a pin, holds your notes to yourself: see Chat with myself and
  reminders below.
- [+] **Matrix chats**, once you sign in to Matrix, are in the list with the others, newest first, each marked
  **Matrix**, and an invite shows at the top. The **Matrix** chip shows only them, and there **New chat** starts a
  Matrix chat: see [Matrix](#matrix).
- [+] **XMPP chats**, once you sign in to XMPP, are in the list the same way, each marked **XMPP**, and a person who asks to
  add you, or a group that invites you, shows at the top. The **XMPP** chip shows only them, and there **New chat**
  starts an XMPP chat: see [XMPP](#xmpp).
- [+] **Nostr chats**, once the space has a Nostr key, are in the list the same way, each marked **Nostr**. The **Nostr**
  chip shows only them, with how many are not read, and there **New chat** opens the Nostr chats screen: see
  [Chats with other Nostr apps](#nostr-chats).
- **Mark all as read**, in the ⋮ menu, reads at once every chat of the part of the list you are on (all messages{~, SMS| or}{-{~ or
 |} Erevos}{+,
  Erevos, Matrix, XMPP or Nostr}), muted and PIN-locked ones too, after asking. Each is read as if you opened it, so
  those who wrote are told as then; invitations and people asking to add you stay until you answer them.{+ The Matrix,
  XMPP and Nostr screens have it under **Chats** for their own chats.} Hidden chats are never read by it.
- [+] **The Public feed**, once the space has a Nostr key or is in a public Matrix room, is one more chip, **Public**: one
  feed, as in Amethyst, of the public posts of the people your Nostr key follows and the messages of the public Matrix
  rooms you are in, newest first. Each shows who wrote it (a small N or M says the network), when, its words, its
  photos inside the post and a card for its link. With both on, **All**, **Nostr** and **Matrix** above the feed
  choose what shows, and **Photos** chooses how photos and cards are fetched. Under a post: answer, share again, like
  and share; under a Matrix message: answer, react and share. **New post**, the pen at the bottom, writes a public
  post, with up to four photos. See [Chats with other Nostr apps](#nostr-chats).
- **New chat**, at the bottom, asks where the other person is, **Near me**, **Far away** or **I have their code**, and
  adds them; the rows under these open your own link, who is blocked and the relay settings. **Remind me**, the orange
  bell beside it, writes a reminder for you.
- **{~The green handset and the violet person|The violet person}** at the top, on Android, {~open **Phone** and **Contacts** at once, in the
  colours of their icons|opens **Contacts** at once, in the colour of its icon} on the phone's home screen. {~They are|It is} not in the menu under the three dots as well.
- [~] **The services button**, under the top bar, where it stays while the list scrolls, once two parts with messages are on in Modules, says which part of the
  list shows (**All services**, or the one chosen), with the services' signs, the messages not read in all of them,
  and in red a service that is not connected now. Tap it for the **Services** window: a card for each part that is on,
  also with no chat yet, each with the messages not read in it (99+ above 99) and a dot, green while its network is
  connected, red with **Offline** when it is not. A card shows only that part: **All messages** all of them, **SMS**
  only the SMS (with the chats whose last message was an SMS; it says so when Erevos is not the SMS app yet),
  **Erevos** only the Erevos chats, every contact's whatever came last{+, and **Matrix**, **XMPP**, **Public** and
  **Nostr** theirs}. **Add** opens Modules, to turn more on, and **Mark all as read** reads the part shown. Hold a card
  down to move it earlier or later or to **Hide** it: a hidden service stays on, but sends no notifications and counts on no icon (Telegram, whose folders
  can show on home, still does), and its chats leave **All messages** too (a search still finds them), and it waits at the foot of the window, where a tap shows it
  again. Any card held, **All messages** too, can be made **Opens first**: Erevos's icon opens on it, and on
  **All messages** while none is chosen. Chats and groups on **Muted** are left out of the numbers, as they are of the number on Erevos's icon, and
  what is typed in the search changes nothing in them. Under the button, with no search, the chats with messages not
  read come first, under **Unread**, with **Mark all as read** beside it, then the others under **Recent**.
- **The widget**, on Android: add Erevos from your home screen's widgets. {~Its four buttons open **Phone**, the
  **SMS**, the Erevos **Messages** and **Contacts**, after the password like any link (the Phone without it, if you
  let it). Over the first three it shows how many missed calls, unread SMS and new messages there are, never who or
  what; with missed calls, **Phone** opens on **Recents**.|Its two buttons open the Erevos **Messages** and
  **Contacts**, after the password like any link. Over **Messages** it shows how many new messages there are, never
  who or what.} A button tapped again shows its screen again, also after
  you chose another tab there. Its words follow Erevos's language. **Settings** → **Appearance** → **Widget** sets the
  order of its buttons.
- **The orange lock** at the top locks Erevos at once when a password is set, or opens the lock settings when not.
- **The three dots** open the rest:

| In the menu | What it opens |
| --- | --- |
| **New group** | A group chat with your contacts. See [Group chats](#groups). |
| **Public groups** | A group anyone with its link can ask to join, with an owner and admins. See [Public groups](#public-groups). |
| **Starred messages** | The messages you starred, in all your chats. See A message's menu, under Chat through a relay. |
| **Nearby phones** | Your contacts over Bluetooth and Wi-Fi Aware, or on the same Wi-Fi, without internet. See [Chat with a nearby phone](#nearby). |
| **User guide** | This guide. |
| **Settings** | The last row, with a cog: everything you can set, in groups, with a search. See Settings below. |

Inside a chat, its name and picture are at the top with how it travels: **Encrypted** (end to end), **Online**,
**Nearby** while their phone is linked to yours over the radio, or **typing…**, with a stopwatch when the chat's
messages disappear. Beside them, the blue tile with a camera starts a video call and the green one with a handset a voice call. Tap the name, or **⋯**
after them (**⋮** on Android), for the chat's **Details**: its picture (tap it to change it), **Call**, **Video**, **Rename** and **Picture**, then **Disappearing messages**, **Block screenshots**,
**Appear offline**, **Chat look**, the **Safety number**, **Move to hidden chats**, **Move to another space** and **Delete messages**. **Done**
closes them.

**Media, links and files**, in the details under **Search in this chat**, lists what the chat holds, each kind under its
own tab with how many there are: **Photos** (in a grid), **Videos**, **Voice messages**, **Music**, **Files** and
**Links**, the newest first under their months, those imported from Telegram or WhatsApp too. A tap opens a photo or a
file to look at or save, plays a sound right there, or opens a link after asking; held, each offers **Show in chat**,
which goes to its message. One not yet taken from the relay is gone to in the chat, where a tap takes it. The calendar
at the top goes to a day: the days that have any of that kind are marked. **Go to a day**, under it in the details,
does the same for the chat itself: it goes to that day's first message.

**Why:** the lists are made on this phone from what it already keeps, so no server learns what a chat holds; and only
the photos on the screen are read, as in the chat, so a chat with thousands of them opens as fast as one with none.

[~] **On {+Matrix, XMPP, Nostr and }SMS too:** {+a chat on Matrix, XMPP or Nostr has **Search in this chat**, **Media, links
and files**, **Go to a day** and **Export chat** at its foot, beside **Notifications**, and }an SMS conversation has
{-**Search in this chat**, **Media, links and files**, **Go to a day** and **Export chat** }{+them }first under its **⋮**. They look only at what this phone keeps of the chat: {+the messages a Matrix chat keeps
(under the search, **Load earlier messages** fetches older ones from its server, as the top of the chat does), those
of an XMPP or Nostr chat, and }every SMS and MMS of the conversation on the phone; going to an older SMS loads the
conversation back to it. Nothing you type in the search leaves the phone. Photos and files are listed, and a tap goes
to each in the chat, where a tap fetches it from its server as before, so no server learns which ones you looked at;
an MMS's pictures show in the list itself. **Export chat** writes the chat out as for a contact, after the same
question; a hidden place's chats are not exported.

A good first hour:

1. Open **Settings** → **Privacy and security** → **Lock and second password** and set a password, so nobody who
   picks up the phone can open Erevos.
2. Open **Nearby phones** from the menu on two phones that are close to each other, and allow what Android asks for.
3. Add each other with **New chat** → **Near me**, on both phones, as in [Chat with a nearby phone](#nearby), and send
   a message: it goes nearby, end-to-end encrypted, with no relay and no internet.
4. To talk from further away, set up a relay as in [Chat through a relay](#relay).

### Chat with myself and reminders

**Chat with myself** is always at the top of the chats, with a pin, in every space. It is a chat with no one else in
it: write notes, links, photos, files and voice messages to yourself, as in any chat. It goes to no one else: it stays
encrypted in the space, and goes only to your own linked devices, end-to-end encrypted, so each has the same notes and
reminders (see [Linked devices](#devices)). A backup takes all of it, notes, photos, files and voice messages, as
with chats.

- **A reminder:** tap **Remind me** (the orange bell beside **New chat**), write what to remind you of, pick a time
  (**In 1 hour**, **Tonight 20:00**, **Tomorrow 09:00**, or any day, hour and minute) and tap **Remind me**. It goes in
  Chat with myself, with a bell and its time. In the chat, **+** → **Remind me**, or holding the send arrow, gives the
  note you write a time too.
- **At its time**, on Android, the phone shows a notice, **Reminder** (or **3 reminders**) – "Open Chat with myself to
  read it", never what it says, with Erevos closed and locked too; tapped, it opens Chat with myself, after the
  password. Until you open the chat, the reminder shows on its row at the top of the chats, with a count, and in the
  chat with a coloured edge; seen there, it goes from the notice too. On a computer, in the web app, or with notices
  turned off, that is where you see it. If **Exact times** is not allowed (**Settings** → **General** →
  **Permissions**), Android may show it a few minutes late.
- **Holding a note** offers **Copy**, **Open** (a photo or a file), **Remind me**, or **Change the reminder** and **No
  reminder**, **Move to a folder**, and **Delete**.
- **Folders:** the folder button at the top, beside **Chat look**, makes one. Then tabs show above the notes: **All
  notes**, and one for each folder, which shows only what is in it; what you write, send or record while a folder is
  chosen goes into it. A note is in one folder at most: **Move to a folder** puts it in another, a new one, or **No
  folder**. Holding a folder's tab, or tapping it again, offers **Rename the folder** and **Delete the folder**; its
  notes stay, in no folder. A note goes to your linked devices with its folder, and a folder renamed or deleted on one
  is so on the others too; an empty one stays on the device it was made on.
- Each space has a Chat with myself of its own, and so does each place of hidden chats, at the top of their list (see
  [Hidden chats](#hidden)). A hidden place's reminders show there once its PIN opens it; the phone tells them at their
  time only while **Receive while closed** is on for that place, in the same notice. A new PIN for the place, which
  starts it empty, or the place removed, takes its reminders off the phone. A hidden place's notes go only to the
  devices linked to that place on its own, never to the space's (see [Linked devices](#devices)).
- **From another app:** an app on the phone can ask to keep a note here, as Fasouli does for a payment that is coming,
  with its reminder. Erevos opens Chat with myself after the password, in the space you open, and asks **Keep this
  note?** first, showing the words and the time; only **Add** keeps it. Nothing goes back to the app. For a scheduled payment the reminder comes again, every month or as the payment repeats: once you see it, it moves to its next time.

**Why:** a notice shows on the locked screen to whoever holds the phone, so what a reminder says stays encrypted in its
space and Android is told only its time: the notice cannot tell anyone what you wanted to remember, nor which space it
is in. And the notes go to no one but your own devices, end-to-end encrypted between them as your chats are: the relay
carries them only sealed.

- [~] **From other chats:** a message of {+a Matrix, XMPP, Nostr or }{-an }SMS {+chat}{-conversation} can come here too, with a reminder: **Remind
  me** in its menu.

### Moving around with swipes

- **Back:** swipe to the right anywhere on a screen to go back, as the back arrow does. A round arrow comes out at
  the left; let go once it is whole, or flick, and you are back. Let go sooner and you stay. In a chat it does what
  its back arrow does: back to the list of chats, or out of hidden chats, closing them. In a chat's **Details** it
  closes them.
- **Tabs:** swipe to the left or right to go to the tab beside, as tapping its chip does: {~**All messages**, **SMS**}{+,}{-{~ and}}
  {~**Erevos**}{+, **Matrix**, **XMPP** and **Nostr**}{~ on the home screen (those on in Modules), **Keypad**, **Recents** and
  **Favourites** in **Phone**,} the filters in **Contacts**, and the sets of stickers.{~ On the home screen the parts are
  chosen in the **Services** window, under the button below the top bar.}
- On a screen with tabs, a swipe only changes the tab, on the rows of its list too, and past the first or the last
  tab it does nothing: go back there with the back arrow.{~ An SMS conversation is archived or deleted by holding it
  down.}

### Settings

**Settings**, the last row of the menu (the three dots), holds everything you can set in Erevos, in groups, as a
phone's own settings do. In the other languages it is named in that language and in English, such as
**Einstellungen · Settings**, so it is found in a language you cannot read.

- **Search the settings,** at the top, finds a setting by the start of its words, with or without accents, and shows
  where it is, such as {~**Phone and SMS › SMS**|**Privacy and security › Hidden chats**}. Tap it to open it.
- **Language · Γλώσσα,** the row under the search, opens the list of languages, see Language below.
- **A group** opens the list of its settings, and a setting opens its screen. A setting with parts, such as {~**SMS**|**Backups**},
  lists them, and each part opens alone.
- **Only what works here shows:** on a computer, on Sailfish OS and in the web app there is no {~**Phone and SMS**,
  |}Tor, Nostr or LoRa, and a group with nothing to set here does not show.
- [~] **Only the modules on show:** the settings of a module that is off, such as {+**Matrix** or }**Phone and SMS**, do not
  show either: see [Modules](#modules).

| Group | What is in it |
| --- | --- |
| **General** | **Language**, {~**Modules**, |}**Updates**, **Give Erevos to a phone nearby** (Android), **What's new**, **About Erevos**, **Support Erevos** and **Permissions** (Android and the web app). See Language below, {~[Modules](#modules), |}[Updates](#updates) and [Erevos to a phone nearby](#give-app). |
| **Appearance** | **Style and colours** (look, glass, style, theme, colours and text on coloured areas, with the preview), **Wallpaper**, **Messages** (the bubbles' shape), **Launcher icons** (Android), **Widget** (Android) and **Vibrate on touch** (Android). See [Appearance](#appearance). |
| **Notifications** | **In the background** (Android and the computer app): receiving and ringing while Erevos is closed, and the notice for messages; on a computer, whether Erevos keeps running with its window closed. **Notifications while closed** (the web app): Web Push. **Number on the icon**: how many messages are not read, on Erevos's icon. See [On an iPhone](#iphone) and [On a computer](#desktop). |
| **Privacy and security** | **Lock and second password** (lock when Erevos opens, the password, screen privacy, fingerprint or face, the second password), **Hidden chats** (the PINs of the 4 places), **Panic button** (with the panic password), **Calculator in place of Erevos** (Android, under Appearance), **Screenshots** (Android) and **This web app** (the web app only). See [Password lock](#lock), [Second password](#second), [Hidden chats](#hidden) and [Panic button](#panic). See also [Delete me from everywhere](#forget). |
| **Relay and networks** | **Ways**, **Relay** (it opens **New chat** with **For advanced users** open), **Home relay**, **Tor** (Android), **Nostr** (Android){+,}{- and} **LoRa radio** (Android){+, **Matrix**, **XMPP** and **Nostr chats**}. See [Chat through a relay](#relay), [Home relay](#home-relay), [Through Tor](#tor), [Through Nostr](#nostr){+,}{- and} [Over a LoRa radio](#lora){+, [Matrix](#matrix), [XMPP](#xmpp) and [Chats with other Nostr apps](#nostr-chats)}. |
[~] | **Phone and SMS** (Android) | **Phone**, the phone app's settings, the same as **Phone** → **Settings**. **SMS**, in parts: **Erevos as the SMS app**, **Find Erevos on a number**, **SMS when nothing else works**, **Names from your contacts**, **Archived, Spam and Trash**, **Spam filter**, **Blocked numbers**, **Taking an SMS back**, **Two SIMs** (only with two SIMs) and **New SMS**. See [Phone](#phone) and [SMS](#sms). |
| **Data and devices** | **Backups**, **Backup pieces**, **Linked devices** and **Imported chats**. See [Backups](#backup), [Backup pieces with friends](#backup-pieces), [Linked devices](#devices) and [Imported chats](#import). |
| **For testing** | **Relay test** and **Radio test** (Android). See [The test screens](#tests). |

### Language

Erevos is in English, Greek, German, French, Spanish, Italian, Portuguese and Serbo-Croatian. The first time it
starts, it follows the phone's language if it is one of these (a phone in Serbian, Croatian, Bosnian or Montenegrin
starts in Serbo-Croatian), and is in English otherwise. To change it, open the menu (the three dots), tap
**Settings**, its last row, and then the first row there, **Language · Γλώσσα**. In the other languages both are
named in that language and in English, such as **Einstellungen · Settings** and **Sprache · Language**. Then tap the
language, each named in its own words: **Ελληνικά**, **English**,
**Deutsch**, **Español**, **Français**, **Italiano**, **Português** or **Srpskohrvatski**. The whole app changes
at once.

- **This guide** is in each of these languages too, and names the buttons as the app shows them in yours. In the
  languages other than English and Greek, a word new to the app may show in English for a while, until it is
  translated.
- **Kept on the phone:** the choice is kept on this phone, outside every space, so the password screen shows in it
  too, and every space opens in it. It is not sealed: whoever holds the phone can see which language you chose.
- **Android's notices** (an incoming call, new messages, Erevos receiving in the background) are in Greek when Erevos
  is, and in English in every other language.

## Modules {#modules}

Erevos is made of parts, its modules: **Erevos** itself (its own chats, groups and calls, end-to-end encrypted, with
the hidden chats), the **Phone**{- and}{+,} the **SMS**{+, the chats with **Nostr**, **Matrix** and **XMPP** apps, and **Telegram**, **Messenger**, **Signal** and **Session**}. The **Collection** (your photos and files, encrypted) is a module too. The Phone and the SMS are only on Android, the Collection on Android, in the desktop app, in the web app and on Sailfish OS. Any of them can be on, Erevos itself too, one or more, at least one: **Settings** →
**General** → **Modules** turns each on or off at any time.

The very first time Erevos starts, it sets itself up as an installer does. Before its first space opens: what you
do not give (no phone number, email, user name or account: you add people with a QR code or a link, or they invite
you), a name for your contacts if you want one, and the language; then which modules to use, each with what it does.
Then, in the space: a screen for each module chosen, with how to begin with it (for Erevos, how you join; for the Phone
and the SMS, Erevos as the phone app and as the SMS app{+; for Nostr, Matrix and XMPP, your account there}) and what
Android, or the browser, should allow for it. Each permission is on the first screen that needs it, and **Allow all,
one by one** asks the questions Android asks in Erevos itself one after another. Then the password lock and automatic
backups, then what is ready and what is missing, with **Invite someone**. **Do the rest later** leaves the rest for
Settings; until you finish or put it off, the steps show again when Erevos starts. Opened with an invite, Erevos shows
it once the steps are done. After an update every module stays on, as before, until you change them.

- **The name:** it is not a user name: no one searches for it, and it need not be unique. It goes, encrypted, only to
  those you add, and **My name** under Settings → Privacy and security changes it.
- **Moving from another phone:** on Android, **I already have {=Erevos} on another phone** skips the name and the
  modules, which come with the backup. The space opens, **Open Backups** restores it (see
  [Moving to a new phone](#new-phone)), and the screens of the modules it brings follow, then the fingerprint and the
  folder of automatic backups, which stay with each phone. **I have no backup yet** says how to make one.
- **On a computer or in a browser:** **Link to my phone** skips the steps and opens **Linked devices**.

- **Off:** a module that is off does not start: nothing of it runs, waits at a server or rings, so Erevos is lighter,
  opens faster and uses less battery. It shows nowhere: not on the home screen, in its menu or in Settings, and the
  Phone's and the SMS's icons leave the phone's apps. A link, a notice or the widget that still leads to it says that
  it is off, with **Open Modules**.
- **Nothing is deleted:** its chats, contacts, accounts and settings are there again when it is back on. Contacts, the
  password lock, the spaces, the backups and Settings are always there, whatever is on.
- **On again:** a module turned on starts at once, and **Permissions** shows what Android should allow for it, as at
  the first start.
- **New with an update:** a module that comes with an update, as the Collection did with 7, is on, also where you chose
  the modules before it came, until you turn it off.
- **The Phone or the SMS off** while Erevos is still the phone app or the SMS app: Android goes on giving Erevos the
  calls or the SMS, kept as before. **Open Default apps** chooses another app.
- **The Phone alone:** with no module that brings messages on, the home screen says so, with **Phone** and
  **Modules**.
- **Kept on the phone:** the choice is for this phone, the same in every space, and kept outside the spaces, as the
  icons are, since the Phone may open without the password.

**Why:** not everyone wants all of it. Someone who uses {=Erevos} only as a phone, or only for Nostr, gets an app that
does only that, and a phone that does not wait in the background for messages that never come.

## Chat with a nearby phone {#nearby}

While a space is open, on any screen, Erevos looks for other {=Erevos} phones around it, over Bluetooth and, where the
phone has it, Wi-Fi Aware, and on the Wi-Fi it is on, phones and computers alike. No internet, SIM or Wi-Fi network is
needed. It carries messages to your contacts, end-to-end encrypted like those through the relay.

It looks only once **Look for phones nearby** is on, under **For advanced users** → **Nearby, with no internet**, on
**New chat**: it is off until you turn it on, on both phones, and until then everything goes through the relay. Only
**Near me**, on New chat, looks without it, while its page is open, to add a contact.

1. Open **Nearby phones** from the menu on both phones. The first time, Android asks to find nearby devices (on Android 12 and
   older, also for the location); allow it, or the phones cannot find each other.
2. If you are not contacts yet, add each other: on both phones tap **New chat** and then **Near me**, and tap **Yes,
   the same** once both show the same pictures, as in [Chat through a relay](#relay). Without a relay each phone gives
   only its keys, and you reach each other nearby only, until you have one.
3. Pick the contact, type in the message bar at the bottom and tap the send arrow. Once their phone answers, the top of the chat says
   **Nearby**.

- **While a space is open:** the links start when a space opens, whatever screen shows, and stop when another space
  opens: locked, the space goes on behind the password screen. A message from nearby shows on the home screen as one through the relay does, and a call rings
  there too. On Android they stay up with Erevos in the background, while **In the background** is on **Receive and
  ring**. To spare the battery there, it looks for phones less often: Wi-Fi Direct every ten minutes, Wi-Fi Aware a
  minute in every five, and on the same Wi-Fi it hears the others twenty seconds in every two minutes. A phone nearby
  may so be found a few minutes later; links that are up stay up, and once Erevos shows it looks as often as before.
- **Range:** a few tens of metres in the open, less through walls.
- **Wi-Fi Aware:** faster, but not every phone has it. Bluetooth works on all of them. To stop it, turn off **Look
  with Wi-Fi Aware**, above **Find Erevos on the same Wi-Fi**.
- **The same Wi-Fi or a hotspot:** phones on one Wi-Fi, or on one phone's hotspot, find each other and talk directly,
  even when that Wi-Fi has no internet; the desktop app too. If Android asks whether to stay on a Wi-Fi with no
  internet, stay. Anyone on that Wi-Fi can tell an Erevos app is there, not whose. A computer's firewall must let port
  47905 in (UDP and TCP). To stop it, turn off **Find Erevos on the same Wi-Fi** under **For advanced
  users** → **Nearby, with no internet**, on **New chat**.
- **A Wi-Fi of their own (Android 10 and later):** with no Wi-Fi in common, two {=Erevos} phones near each other make a
  small Wi-Fi of their own (Wi-Fi Direct) and talk over it as on the same Wi-Fi: faster than Bluetooth, and a call
  goes over it with no internet. It asks nothing; each phone stays on its own Wi-Fi too where it can. Anyone near can
  tell an {=Erevos} phone is there, and could join that small Wi-Fi, getting only sealed bytes. It needs **Find Erevos
  on the same Wi-Fi** on; to stop it alone, turn off **Make a Wi-Fi with phones nearby** below it.
- **On a Samsung phone** **Look with Wi-Fi Aware** and **Make a Wi-Fi with phones nearby** are off until you turn
  them on: while an app uses them, Samsung asks to turn off its own sharing. Bluetooth and the same Wi-Fi work without
  them.
- **Other phones nearby** get only sealed bytes they cannot open, and only until your contact's phone is known: from
  then on what you send goes to it alone. Voice messages go only to a contact known to be near. Photos and files need
  the relay.
- **With a relay as well,** each message also goes through it, so nothing is lost if the link drops; the copy that
  comes second is not shown again. If the relay cannot be reached, the copy nearby is the one that counts.
- **Carried by other phones:** when the relay cannot be reached and your contact is not near, the {=Erevos} phones nearby
  also take your message sealed for your contact's relay. Each keeps it, three days at most, gives it to two more
  phones at most that it meets, and hands it to that relay through its own relay once it can; so does yours. They
  cannot read it, nor tell who it is from or for: they see only the relay's address. It stays when Erevos closes,
  sealed on the phone. Yours stay in your space, and go only while it is open. Carrying for others is on unless you
  turn off **Carry messages for others** under **For advanced users** → **Nearby, with no internet**, on **New chat**,
  and only for relays on the internet over TLS (wss://): a stranger nearby never has your phone, or your relay, reach
  one on a local network or on the phone itself. Your own messages are carried by the phones nearby that have it on.
- **Brought by other phones:** the other way round, when your phone has no internet, an {=Erevos} phone beside it that
  has internet, and carries for others, takes what waits for you on your relay and hands it over nearby. Erevos asks
  once about each such phone, a contact's too, as a stranger can pass on a contact's messages to seem to be them, and
  only while it is in front: **A phone near you has internet. Should it bring your messages?** That phone learns which
  queue on your relay is yours, and when you read it; never what your messages say, which only your phone opens.
  Knowing the queue, it could take your messages before they reach you, so once your phone has internet again it moves
  to a new queue by itself and tells your contacts quietly. Hidden chats are asked about apart, and only while they
  are on the screen, since that phone would learn there is a second queue, and so that there may be hidden chats.
  Never for a relay reached only through Tor. Your phone does the same for the phones beside it while **Carry messages
  for others** is on, never while it goes through Tor, and from a relay other than its own only once you say yes,
  warned that this relay then sees your phone's internet address.

**Why:** a packet does not say who it is for, so no one nearby can tell from it whose it is. Until your contact's
phone answers on a link, your phone cannot tell which of the phones nearby is theirs either: so the short packets go to
all of them, each tries them, and from the first that opens, that link is your contact's. A voice message, in larger
pieces, waits for that.

> A message from nearby opens only in the space that has that contact. One for another space of this phone waits in
> memory, six hours at most, until that space opens. One for hidden chats opens only while they are open, or
> receive while closed, and waits so until then.

**Why:** the nearby links belong to the phone, not to a space, and nothing on them names one: what comes is tried in
the chats of the space that is open, and kept a while in memory for the others, never written to the phone. Hidden
chats use them too, but what they hear is their own: the link a hidden contact was heard on is kept apart from the
space's, in memory only while those hidden chats are open or receive while closed, so the space never learns that one
of their contacts is near; and on the air their messages look like the space's. They never carry for others, are never
carried, and never go over LoRa{~ or by SMS}.

**Bluetooth that cannot be followed:** what your phone sends out over Bluetooth for others to find it says only
that a phone with {=Erevos} is near, with a random number that changes every nine to twelve minutes, and on Android 8
and later from an address that changes with it. So someone listening in one place and then in another cannot tell
that it is the same phone, from Erevos at least. Links that are up stay up. Phones with an older {=Erevos} find yours,
and yours them, as before.

## Over a LoRa radio {#lora}

With a Meshtastic LoRa radio linked to the phone by Bluetooth, Erevos reaches Erevos with a radio on the same mesh,
kilometres away, with no internet: straight, or through the Meshtastic radios between. It is off unless you set a
radio, and on Android only.

1. Set up the radio in the Meshtastic app first, its **region** above all: without one it sends nothing. Then close
   the Meshtastic app, or disconnect it there: a radio links to one app at a time.
2. Open **Settings** → **Relay and networks** → **LoRa radio**, tap **Find my radio**, read what it says, and tap
   your radio when it shows. A radio not paired yet asks for its PIN: it shows on the radio's screen, or is 123456.
3. Your contact does the same with theirs, on the same mesh: the same region and the same first channel.
4. Write as always. When the relay cannot be reached and no phone is near, a text goes over LoRa,
   and the line under the chat says so.

- **Only text, and slowly:** a message goes in pieces of about 220 bytes, each a second or two on the air, and the law
  allows a radio only so much air time (in the EU, a tenth of each hour). So LoRa takes only texts and deletes, and
  only when nothing else does. Voice messages, photos and files wait in the chat, marked **Waiting**, and go by
  themselves once the relay or a phone nearby can take them; calls need one of those too. The first message to a
  contact takes longer, as it holds the keys.
- **Marks:** **✓✓** comes with their next message, as marks alone do not go over LoRa.
- **Spare pieces, and long texts packed:** a message of two pieces or more goes with spare pieces after it, one for
  every four, so your contact's Erevos makes up pieces lost on the way, with nothing sent again; they take a little
  more air time. A long text goes packed, smaller and with nothing lost, to a contact whose Erevos reads packed
  messages, so it takes fewer pieces, or fits at all; a short one goes as it is.
- **To every radio in reach:** each message is heard by every radio around, and passed on by the Meshtastic radios, as
  Meshtastic does. Every Erevos tries it; only your contact's opens it. Nothing is carried for others over LoRa.
- **Its name and where it is:** Meshtastic radios say their name to every radio in reach now and then, and where they
  are if they have GPS or a fixed position, in the clear. Erevos keeps yours from doing so (**Kept quiet**): it sets
  its role to Client hidden, turns its GPS off and removes a fixed position. It still answers a radio that asks its
  name, so give it a name that says nothing of you, in the Meshtastic app. **Said to all in reach** puts its role and
  GPS back, after a warning; a fixed position is set again in the Meshtastic app. If the radio does not keep the
  settings, the LoRa screen says so.
- **It stays linked** while Erevos runs, and links again by itself when the radio comes back in reach. **Turn LoRa
  off** gives the radio back its role and GPS, if it is linked, then unlinks it and forgets it. Hidden chats never go
  over LoRa.

**Why:** what a Meshtastic radio says of itself goes in the clear, to anyone listening kilometres away: its name and
where it is could show where you are and tie the radio to you, so Erevos keeps it quiet unless you choose otherwise.
And as the law allows a radio only so much air time, LoRa is kept for your own texts, when nothing else can take them,
never for what other phones would have it carry.

> A LoRa radio is heard kilometres away, and its signal can be traced to where it is, quiet or not. What Erevos sends
> stays end-to-end encrypted, but anyone with a radio can tell that yours sends, when and how much. With
> **Said to all in reach**, anyone with a radio can also read its name and where it is.

## Chat through a relay {#relay}

A relay is a small server that keeps one-way queues: each phone has its own queue, and whoever has its **contact
link** can drop messages into it. The relay holds no accounts, names or phone numbers, and cannot read the messages:
they are end-to-end encrypted, and only the two phones have the keys. Each phone may use a relay of its own: a message
to a contact on another relay is sealed for theirs and handed to yours, which passes it on, so their relay never sees
your phone's address. A phone with no relay gets a place on its contact's, see **No relay of your own** below.

**Why:** with queues and no accounts, no server holds a list of who knows whom, and no one needs your phone number or
email to reach you: whoever has your contact link can write to your queue, and only you read it.

1. On the home screen, tap **New chat**. While something is missing, **How you connect now** at the top says in plain
   words how your contacts reach you: through your relay, through Nostr with no relay, or only nearby; when everything
   works it is not shown. With a relay, a field at the top finds a contact by name or adds a link pasted into it. Then
   comes one question, **Where is the other person?**, and each answer opens a page of its own: **Near me**, **Far
   away** and **I have their code**, as in 4 to 6 below. Three small buttons under them open the rest: **My link**,
   **Blocked contacts** and **For advanced users**, where the relay's own settings are, and a phone with no relay yet
   has one more, **I have no invite**, which opens the same page; **Settings** → **Relay and networks** → **Relay**
   opens New chat with them open.
2. Under **For advanced users**, type the **Relay address**: \`ws://<computer address>:7879\` for a relay on your own network, or
   \`wss://relay.example.org\` for one on the internet. Add the **Token** if the relay needs one.
3. Erevos makes your queue on it by itself, a few seconds later, and says **Relay queue created**: everything works, texts,
   photos, voice messages, calls and groups, and **How you connect now** goes, as nothing is missing. If it cannot, the note
   says why; **Create my relay queue**, under the address, tries again.
4. **Near me**, for someone beside you: on both phones, tap **New chat** and then **Near me**. The two phones find
   each other by themselves, over Bluetooth or the Wi-Fi they share, and each shows **A phone was found** with six
   pictures. Look at both screens: when the pictures are the same, in the same order, each of you taps **Yes, the
   same**, and you are each other's contacts, with no relay, no internet and nothing typed. **No, others** leaves that
   phone aside. The pictures come from a key the two phones make with each other, so a phone that sat between them
   would show each of you different ones; each phone gives its contact link only once its owner says yes, encrypted
   with that key. The page looks for phones only while it is open, also with **Look for phones nearby** off, which
   stays off; in hidden chats and in the web app nothing looks. Under **If it is not found** the page has the other
   ways for someone beside you: a QR code for their camera, which is an invite where your relay lets this phone invite
   and your contact link otherwise; **Show a code of 8 digits**, which they type as in 6; **Scan theirs** and **Type
   their code**, for theirs; and, on Android, **No Erevos on their phone?**, which hands them the app itself. The QR
   code there shows small; a tap shows it large.
5. **Far away**, for someone who is not with you: the page makes an invite, one link for one person, inside a message
   ready to send. Tap **Send with…** and choose the app it goes with (in a browser and on a computer, **Copy the
   invite**), or **Its QR code** to show it as a code. They tap the link: with Erevos on their phone it opens there,
   and with none the link first shows where to get it. Their phone then joins your relay with access of its own,
   typing nothing, and you are each other's contacts. The page says how far things are, **The invite is ready**,
   **Waiting for them to open it**, **You are connected**, and you may leave it meanwhile: once their phone has
   joined, they show in your chats. More about invites is in Inviting someone new, below. Where this phone can make no
   invite, with no relay yet, in hidden chats or on a linked computer, the page gives your contact link to send
   instead: they open it in Erevos, or paste it under **I have their code**. On the page the link in the message shows
   short, its middle left out; what is sent, copied or shown as a QR code is always the whole link.
6. **I have their code**, for what they gave you. Type the 8 digits their phone shows under **Near me** → **Show a
   code of 8 digits**, beside you or said on a call: each phone then has the other as a contact. The code itself never
   leaves the phones: they prove to each other that they know it, and their contact links go encrypted with a key only
   the same code makes. They meet on public Nostr relays, which see neither the code nor the links, and whoever
   guesses gets 3 tries before the code closes. A code lasts 10 minutes. Under the digits, paste their contact link or
   invite into the field and tap **Add**, or tap **Scan their QR code** and take a photo of the QR code on their
   screen, or **From a photo of their QR code** for a screenshot or a photo of it they sent you. Erevos reads it and
   adds them at once. On a computer, on Sailfish OS and in the web app, **Scan their QR code** asks for a photo of it;
   on an iPhone it offers the camera too. Hidden chats have this page too.
7. **My link**, under the three, is this phone's own QR code and contact link. Let the other phone scan the code with
   its camera, then open the link in Erevos. The **Add a contact** screen shows what it holds: tap **Add to chat**
   only if you scanned it yourself. **Add and connect to one of my contacts** adds them too, linked to the contact you
   choose, whose name the chat takes. The code is short, so any camera reads it. Whoever scans it answers with their
   own contact link, and then this phone writes to them first. The code is new each time the page opens, and good
   once: the first to scan it is a contact at once; anyone who scans it after, or takes the link you share, writes a
   message request first. **Large QR code, for no internet** shows the whole code instead, which works nearby with no
   internet, and **Small QR code** goes back. **Share**, under it, sends a short link that any app lets you tap; on
   Android it opens Erevos, which asks before it takes it. To add someone with their contact QR code, your phone needs
   a relay first. This QR code works only when both phones have a relay, as the page says: otherwise use **Near me**,
   or an invite from **Far away**. **Scan theirs** and **From a photo of their QR code**, under it, read the other
   phone's code from here. Touch works too: while the small contact QR code shows and NFC is on, on Android, the other
   phone takes it when you hold the back of their phone to the back of yours. It works only while Erevos is open in
   front, not in the background, and never with the large QR code.

Whichever way you take, it ends on **You are connected**: their picture, **Their name in your chats**, which their
phone may have given and you may change, and **Write a message** or **Add someone else**. The new chat appears on the
home screen named **contact** and the first characters of their key, until it has a name: **Rename** in its details
gives it one. Right after you add them here, **Connect to one of my contacts** under the note that they were added
lets you choose one of your contacts instead (**Not now** leaves it): the chat takes that contact's name, if it has
none of its own, and the contact's card shows the chat. Hidden chats offer only their own contacts, never the phone's.
It is enough that one phone adds the other: adding a link starts an encrypted conversation and tells the other phone
how to answer, so it lists the chat the next time it looks at its queue, which it does every few seconds.

**What the relay sees of a chat:** all your contacts write to your one queue. Once each phone has had a message from
the other, every message between them is sealed once more for the phone it goes to, with a key that phone gave inside
the chat, so to the relay each is random bytes of one of a few sizes, and it cannot tell from them which conversation
they belong to. The first message of a chat, and any sent before the answer comes, still show it. The relay still sees
which address puts each message in, and when. And each one tells the relay, in a byte it reads, what it carries: a
message someone reads, word between phones (that a message came or was read, typing, being online, reactions, new
keys), or a call that rings. So the relay sees which are messages, and when a call starts, whether notifications are
on or not: it is how a closed web app's notice can count them, and the notice of closed hidden chats.

### Ways in to the relay

A relay that needs a token lets a phone in three ways. Each way ends with a token of the phone's own there, so whoever
runs the relay can take any one phone out alone.

- **An invite:** a QR code or link from a phone already on the relay (see Inviting someone new below). Nothing to type,
  and you are contacts at once.
- **An account:** **Sign in with LPHL**, when the relay offers it (see Signing in to the relay below). Any LPHL account
  can, on up to 10 phones.
- **The relay's token:** the one token for all, from whoever runs the relay, typed in under **Token**. Erevos trades
  it at once, by itself, for a token of the phone's own, named there as you name yourself in invites (\`phone\` when
  you gave no name), says so, and uses only that from then on. So this phone can invite too. It needs a relay that
  takes invites, from after Erevos 3.1.0; with an older one, or one that takes no invites, the phone keeps the relay's
  token and cannot invite.
- **The limits:** a phone may have 5 invites waiting at once and make 10 a day (the day by UTC); each is for one phone
  and lasts 7 days. The relay lets in 100 phones by invite in all, the invites still waiting counting too, unless its
  operator chose otherwise. Phones that came with an account or with the relay's token do not count in those 100: the
  relay gives a token of their own to 50 phones a day that came with its token, and an account has 10 phones. The
  relay serves 512 connections at once, whoever they are, unless its operator chose otherwise.
- **Taking a phone out:** whoever runs the relay deletes its line in the relay's file of tokens: it can no longer use
  the relay, while the phones it invited keep theirs. When it ever had the relay's token, they also change that token,
  so it cannot come back with it. Phones with tokens of their own go on as they are: only a phone with the old token
  still typed in (not opened since, or with an older {=Erevos}) needs the new one.
- **Hidden chats** keep the relay token typed in for them: trading it at the same moment as the space's would show the
  relay that they are this phone's. When the relay's token changes, type the new one under their **For advanced users**.

**Why:** the relay gives each connection a thread of its own, so it serves only so many at once; and it adds only so
many lines a day for phones that came with its one token, so a token that went where it should not cannot fill its file
of tokens.

### Inviting someone new

One QR code or link brings someone new in: their phone joins {=Erevos} on your relay, with access of its own, typing
nothing, and you are each other's contacts at once, with no message request.

- **To invite:** on the home screen, tap **Invite** beside the relay's line, or, on **New chat**, tap **Far away**.
  The invite is made at once and shows inside a message ready to send: tap **Send with…** and choose the app, or tap
  **Its QR code** and let them scan it with their phone's camera. **Who is it for?**, below it, opens two fields,
  their name in your chats and **Your name, for them**: fill them in, or leave both empty. Opened again while no one
  took it and it has a day left, it shows the same invite, so it spends none of the 5 waiting and 10 a day; **Invite
  someone else** makes a new one, and **Take this invite back** closes its link while no phone has taken it. It is for
  one person, for 7 days, or less when the relay's invite ends sooner. Whoever takes it first has it, so give it to
  them only. For someone beside you, **Near me** shows such an invite as a QR code too. On an Android phone with NFC
  on, you can also hand it over by touch: hold the back of their phone to the back of yours while the code shows, and
  their phone opens the link by itself, in Erevos if it is installed, otherwise on Erevos's web page, which offers
  {=Erevos}. If NFC is off, the page says to turn it on in Android's settings.
- **To join:** tap the link they sent, or scan the invite with the camera and open the link in Erevos: it opens **…
  invites you to {=Erevos}**, and you tap **Join** only if it came from them. Inside Erevos, **I have their code** on
  **New chat** takes an invite too: tap **Scan their QR code** and take a photo of the invite on their screen, or
  **From a photo of their QR code**, or paste the link into the field there and tap **Add**. Erevos takes access of
  its own to their relay and a queue there, adds them and says **Welcome to {=Erevos}**. Its first message tells their
  phone, which adds this one as a contact at once, named as they typed.
- **The other ways in:** on **New chat**, **For advanced users** opens the rest, for whoever looks for them: **Sign in
  with LPHL** signs this phone in to LPHL's relay with an LPHL account, in the browser (see Signing in to the relay
  below), and then you add your contacts by their invites or links; **Start without a server**, as in With no relay at
  all, under Through Nostr; and the relay settings, as in 1 to 3 above. An invite is the simplest way in, and on the
  relay an invited phone has only a name of random letters and digits.
- **A server of your own:** on the same screen, under **Where your messages wait**, **I have a server of my own**
  takes the address of a relay that is yours, or your family's, group's or workplace's, and the code you were given
  for it (the relay's token; leave it empty if the relay has none). **Connect** tries it at once, and nothing is kept
  if the server does not answer. While this phone has no relay yet, **I have no invite** on **New chat** opens this
  screen too.
- **Another relay:** under **Sign in with LPHL**, **My account is at another server…** takes the address of another relay,
  as its operator gave it, such as relay.example.org: the card then signs in there, named after the accounts that relay
  takes, or says it offers no sign-in, and then its operator can give you an invite. **Back to** brings LPHL's back.
- **What your relay must allow:** the access of its own is an invite to your relay (see Invites to the relay below),
  so it comes only from a phone with a token of its own on a relay that takes invites. It counts among your invites,
  under a name of random letters and digits, and stays even once yours goes. A phone with the relay's one token for
  all trades it for one of its own first (see Ways in to the relay above); where the relay does not, it makes no
  invite: sign in to the relay first (below the **Token**, under **For advanced users**), or take an invite to it.
  When your relay takes no invites, the invite still makes you contacts, and their phone uses your relay only as your
  contact link lets it, as in No relay of your own below. Such an invite opens only on a phone that has Erevos
  already.
- **A phone with a relay already** keeps its own: the invite only adds you, and you are contacts at once all the same.
- **What is kept:** your phone keeps each invite's secret and the name for them, sealed in the space, until it is used
  or its 7 days end, 20 at most at once. Nothing of it is on the relay but the invite to the relay.
- [~] **By SMS, to someone with no {=Erevos} yet:** on Android, the card of a contact who is not in Erevos has **Invite by
  SMS**. It writes an SMS to their first number with a short link, in the SMS app (Erevos's own when it is the phone's
  SMS app), for you to send or not. The link's page on LPHL's web server offers them {=Erevos} (the Android app, or the
  web app on an iPhone) and then opens the invite in it; in the web app on an iPhone, they paste the link under **I
  have an invite**. They tap **Join**: their phone joins your relay as above and answers yours through it, which adds
  them, linked to that number and named as on the card. Its first message, which goes by itself, makes you their
  contact, named as you named yourself in your last invite. The invite follows the **#** in the link, which no web
  server is sent, but the phone company sees the SMS, as every SMS: so it is for one person, for two days, and when
  the two days end with no phone having used it, your phone takes its invite to the relay back. It needs a relay
  that lets your phone invite, as above.

### No relay of your own

A phone with no relay chats over the internet all the same: adding the link of a contact whose relay lends places, it
takes a place there, with no token.

- **How:** add their link as in 6, with nothing under **Relay**. Erevos says you now have a place on their relay, lent
  through their link, and uses it as its own from then on: your own link names it, so others reach you there too.
- **Who lends:** your link carries a ticket for a place on your relay only when you turn on **Share a place on my
  relay with this link**, under **My link** on **New chat**, and only for the link shown then: the next time the chat
  opens, it is off again. The relay needs a key for two-hop sending, and lends only once whoever runs it turns lending
  on; they can also take back a ticket's places. A ticket lasts 30 days and gives up to four places. Anyone who sees a
  link with a ticket can take a place with it, so give such a link only to whom you mean to.
- **What a lent place does not do:** messages to contacts on other relays go straight to their relay, which then sees
  your phone's address. It keeps nothing for later (a message sent later waits on the phone), gives no call relay
  (calls go straight between the phones), and makes 4 more queues and sends 50 MB of files a day at most. Your link
  lends nothing on.
- **Your own relay instead:** type its address under **Relay**: the lent place is let go of, and contacts learn the
  new one from your next message.
- **A link without a ticket** (from an older relay or Erevos): a relay that needs no token is used as it is;
  otherwise you reach each other nearby only, until you have a relay.

**Why:** a link with a ticket is a key to your relay for whoever sees it, so your link carries one only when you choose,
for the link shown then, and the relay lends only once whoever runs it allows it. A lent place's files are kept to a few
photos and voice messages a day, so it never takes the relay's whole store.

### Invites to the relay

A phone with a token of its own on a relay that takes invites can let one more phone use that relay, with a token of
that phone's own, so no token is typed or passed on.

- **To invite:** under **For advanced users** on **New chat**, below the **Token**, tap **Invite to the relay**, type who it is
  for and tap **Make the invite**. A QR code opens: let their phone scan it with its camera and open the link in
  Erevos, or tap **Share the invite** and send it to them. It is good for one phone for 7 days, and whoever takes it
  first has it, so show it to them only.
- **To take one:** the link opens **Invite to a relay**, with the relay's address: tap **Use this relay** only if it
  came from someone you know. In Erevos, **I have their code** on **New chat** takes an invite too: with **Scan their
  QR code**, **From a photo of their QR code**, or its link pasted into the field there. Erevos makes a token for this
  phone, keeps it with the relay's address in this space only, and makes your queue there. If the phone uses another
  relay, it asks first, and contacts learn your new queue from your next message. Erevos takes an invite to a wss://
  relay, or to a ws:// one on a home network only (such as \`ws://192.168.1.10:7879\`). Hidden chats take no invites.
- **Your invites:** listed under the button, waiting or in use. **Take back** takes back one still waiting, or cuts off
  the phone that took it at once, only that one: the phones it invited keep theirs.
- **Theirs to keep:** a phone you invited keeps its line on the relay even once yours goes, because the phone that
  invited you took it back, the account you signed in with may no longer use the relay, or its operator took it out, and
  so do the phones it invited. Only your invites still waiting then let no one in.
- **What the relay keeps:** a name of random letters and digits for that phone, which says nothing of who it is (the
  name you typed stays on your phone; an Erevos before 6.0.0 gave the relay that name, in Latin letters), that you
  invited it, and a fingerprint of its token, not the token. Whoever runs the relay sees this, and can take any phone
  off it. A phone may have 5 invites waiting at once, and make 10 a day, and the relay lets in only so many phones by
  invite (100, unless its operator chose otherwise).
- **Who can invite:** a phone with a token of its own, on a relay whose operator turned invites on (see [Running your
  own relay](#own-relay)). A phone with the relay's one token for all trades it for one of its own first (see Ways in
  to the relay above). With a lent place there is no **Invite to the relay**.

**Why:** the relay keeps only a fingerprint of each token, never the token, so its file tells no one how to connect.
And an invite names a wss:// relay, or a ws:// one at home, so it can never send your phone's requests across the
internet in the clear.

### Signing in to the relay

A relay can let phones sign in with an account its operator trusts, such as LPHL, for a token of their own, with
nothing to type in Erevos.

- **To sign in:** type the relay's address under **Relay**. When the relay offers it, **Sign in with LPHL** shows
  below the **Token**. Tap it: the browser opens the sign-in page, where you type your name and password, which Erevos
  never sees. The relay's page then shows six digits. On Android, tap **Open {=Erevos}** there and Erevos finishes
  signing in by itself; otherwise type them as described next. Back in Erevos, which puts you straight in **Code from
  the page**, type them there and tap **Finish signing in**: the phone keeps its token with the relay's address in
  this space only, and makes your queue there. Type the code only in Erevos on your own phone and give it to no one,
  even if asked: whoever types it uses the relay as you. After 5 wrong codes the sign-in is over: sign in again.
  Erevos opens only a sign-in page on the relay's own address, over https.
- **Signing in again** on the same phone takes the place of its line on the relay, when its token is the one it got
  from that relay. Each phone gets a line of its own, 10 at most for one account.
- **What the relay and LPHL see:** the relay names the phone's line after your user name (\`lphl:nekten\`), and every
  hour it asks LPHL whether the account may still use it: once the account is closed or disabled, or LPHL cannot be
  asked for 3 days, the line goes, and the phone can no longer use the relay; the phones it invited keep theirs. LPHL
  sees each sign-in and these checks, but nothing of your spaces, chats or contacts. Signing in from another space with
  the same account shows the relay that both are yours.
- **Hidden chats** do not sign in.

**Why:** the page shows the code and you type it in Erevos, not the other way round, so a sign-in link someone else
sends you gets them nothing: only whoever signed in sees the code, and five wrong ones end it. Erevos opens a sign-in
page only on the relay's own address, over https, so nothing answering in the relay's place can send you to a page
somewhere else. And a provider that cannot be asked for a while cuts no phone off at once: only 3 days without a good
answer do. And the **Open Erevos** button is just as safe: the link holds only the six digits, which claim nothing
without the secret that only the phone that started the sign-in holds, so an app that caught the link gets nothing.

### The relay's own key

Once Erevos knows your relay's key (it asks the relay the first time, or a contact link gives it), every connection to
that relay starts with a check: the relay must prove it holds that key, and the token and everything after it go
encrypted to that key, inside the connection's own encryption (TLS). Under **How you connect now**, Erevos then says
that your relay proved its own key. From then on, this space never reaches that relay without the check.

- A relay older than this app proves nothing: it works as before, and **How you connect now** says it is older. Erevos
  tries again every hour.
- A relay that cannot prove the key Erevos keeps for it gets nothing, and your messages wait; **How you connect now**
  says so in red. Only if its operator told you it has a new key, tap **It has a new key**: Erevos then takes the key
  the relay gives next.

**Why:** the connection's certificate says only that whoever answers holds a certificate for the relay's name, which a
company that issues certificates can also give someone else, by mistake or when made to. The relay's own key is only on
its server, so no one in between can pass for it, and a renewed certificate changes nothing.

### The safety number

Open the chat, tap its name and then **Safety number**. Both phones show the same 60 digits for the two of you. Compare them
in person or on a call: if they match, no one is in between. If they differ, do not trust that chat, and add the
link again, scanned from their own phone. Once they have linked a device, it also says when the list of their devices
last changed: your messages go to each place in it too, so if they did not link or unlink one then, ask them.

Side by side, you can check with codes instead of reading the digits: under the number each phone shows a QR code.
Tap **Take a photo of their code** and photograph the code on their phone, then let them do the same with yours. When
it matches, the row says **Checked in person**. Each phone marks the other only by what it saw itself, and nothing is
sent. If it says it does not match, someone may be in between: do not trust that chat. **Choose a photo of their
code** checks a photo of it you already have instead. The mark **Checked in person**, with the day, stays until you
tap **Take the mark off**. It stays on this phone, goes with the chat into or out of hidden chats, and is not passed
on to your linked devices. A code from a newer {=Erevos} says so: update Erevos, then take the photo again.

**Why:** the code holds only a hash of your two keys, in an order that tells the two phones apart, so a photo of your
own screen checks nothing, and a photo of the code says nothing of who you are to someone without both keys.

### Introducing two contacts

In a contact's chat details, **Introduce to a contact** lets you choose another of your contacts and **Ask both**.
Each is asked in your chat with them, by a message that names the other as you named them; both need a name. Each
answers **Say yes** or **Say no** in that chat. Only if both say yes do they become contacts: the one whose chat you
introduced from writes first, and the other's phone takes them at once, named as you named them. If one says no,
nothing happens, and the other is not told. An introduction waits a week.

**Why:** everything of it goes inside the encryption of your chats with each of them, so no relay sees who is
introduced to whom. You pass on only the contact link the second one chose to give, after saying yes. As whoever
introduces could pass someone else off, compare the safety number with the new contact as with any other.

### Sent, came and read

Over the first message of each day, in every chat, groups and Chat with myself too, the day stands out on its own:
**Today**, **Yesterday**, the weekday within the last week, and before that the weekday and date, such as **Tuesday,
November 10**.

Under each of your messages to a contact, **✓** says the relay or a phone nearby took it, **✓✓** that it came to
their phone, and **✓✓✓** that they read it. Their phone tells yours, inside the encryption, the next time each looks
at the relay, or at once when they are nearby. A message counts as read once its chat shows on the screen. **Mark all as
read** in the ⋮ menu counts the same: their phones are told with the next look at the relay.

In a group that is not public, your messages have the same marks, for all the other members together: **✓** once sent,
**✓✓** once the message reached the phone of every member who was in the group when you sent it, and **✓✓✓** once
every one of them read it. Each member's phone tells yours, in a quiet group message meant for you alone, end-to-end
encrypted like the rest of the group: that the message came, a couple of seconds after it did (with the others that
came meanwhile, in one), and that it was read, once the group is on the screen. Hold a message of yours down and
choose **Who read it** to see who read it and when, whose phone it reached and when, and who has neither yet, under
**Not yet**. A member whose {=Erevos} is older than these marks tells nothing, so they stay under **Not yet** and the
message stays at **✓**. Public groups have no marks. A computer linked to this phone shows the same marks.

- **Sending…:** the moment you press Send, the phone gives a short buzz, the field empties and the message shows,
  marked **Sending…** until the relay or their phone takes it. If it cannot go and cannot wait, its words go back in
  the field. Leaving the chat while it shows **Sending…** does not lose it: it goes, or waits marked **Waiting**.
- **Waiting:** a message nothing could take, as the relay cannot be reached and their phone is not near, stays in
  the chat marked **Waiting**, and goes by itself, in order, once the relay or their phone nearby can take it, while a
  space is open; then it shows **✓**. A text waits at once. A voice message, photo or file asks first: **Keep it
  waiting** or **Delete it**. A waiting message is deleted on this phone only. In hidden chats it waits too, but goes
  through their relay only, never to the phone nearby or over LoRa: while they are open, or, with **Receive while
  closed** on, while the space is open. When the contact's queue on the relay is full, a text, voice message, photo or file still goes to their linked
  devices, if they have any, shows as sent, and is tried again for their phone while hidden chats stay open: closed
  before it went, their phone never gets it.
- **Send later:** hold the send arrow down and choose **Later…**, or tap **+** and then **Send later**. Choose a time
  at a tap (**In 1 hour**, **Tonight 20:00**, **Tomorrow 09:00**) or the day, hour and minutes, up to a year ahead, then **Send later**. The message stays in the chat marked
  **Scheduled** with its time. It goes encrypted to the relay, which keeps it and sends it at that time, even if this
  phone is off or locked then, and their phone shows it from that time, not sooner. With no relay reachable now, it
  waits on this phone and goes to the relay once one can be reached. With nothing typed, the time you choose is for
  the next photo, file or voice message: a photo or file goes to your relay at once and stays there until they take
  it, 14 days after its time at most. Hidden chats have it too, the same way, through their relay. Until its time, delete it to take it back from the relay, and it never goes. Should their relay queue
  change before then, Erevos holds it again for the new one the next time it reaches the relay.
  With a token of this phone's own, it goes only if the phone still has its line on that relay then. A message without sound
  stays without sound. A relay from before this keeps nothing for later: then the message waits on this phone and
  goes at its time while Erevos runs, in the background too while **In the background** is on **Receive and ring**
  (below), or when Erevos next opens.
- **Safety message:** type it, tap **+** and then **Safety message**, and choose how long: 6 or 12 hours, 1, 2 or 3
  days, or a week. It goes to the relay at once, as one sent for later, and the relay sends it by itself at that time.
  Each time you open Erevos, past its password, it moves on that long again, so it goes only if you do not open Erevos
  in time: if the phone is lost, taken, broken or kept from the internet, or something happened to you. Erevos running
  in the background does not move it, nor does its password screen, nor a window left open that no one has touched or
  typed in for 10 minutes. In hidden chats it moves on while their place receives, or when you open it. In the chat it
  is marked **Safety message** with the time it would go; delete it to stop it. Write it so that it says what it is: to
  your contact it comes as an ordinary message. If the relay cannot be reached when you open Erevos, it keeps its time.
  It is encrypted once and goes to the relay again as it is each time it moves on, so it costs your chat nothing.
  **Why:** a message held by the relay needs nothing from this phone to go, so no one who takes the phone can stop it,
  except by opening Erevos with its password.
- **Send without sound:** hold the send arrow down and choose **Without sound**: their phone shows the notice without
  a sound or vibration. An Erevos from before it does not know this and sounds as usual, and so does Erevos as a web
  app, whose notice comes from the browser. So does the notice of a place of hidden chats that is closed, with **Say
  when a message comes** on, and of a closed space with **Also while another space is open**: these only ask the relay
  how many came, and it cannot tell one without sound from another, as only the encrypted message says so.
- **Links:** a web address in a message is underlined, also a bare one such as t.me/name or example.org/page, as
  Telegram and Signal show them; an e-mail address or a file's name (photo.jpg) is not. Tap it and Erevos shows it
  whole, to open in the browser only if it is where you want to go. Nothing is fetched before that.
- **Share from another app** (Android): in another app's **Share**, such as the browser's for a page, pick
  **Erevos**. Once a space is open, **Send to** lists the chats{~, groups and SMS conversations| and groups} the home screen showed
  last, then every other chat and group{+, and the chats of your Matrix, XMPP and Nostr accounts}, with a search; never
  hidden chats. Words and links open in the message field of the one you pick, to read and send there; a photo or file
  goes as soon as that chat or group opens, a photo at the quality you chose for photos{~, and never as an SMS}. A file
  can be 100 MB at most{+ in an Erevos chat, 50 MB on Matrix and XMPP and 20 MB on Nostr}. It is encrypted as it comes
  in, with a key only in Erevos's memory, and waits so on the phone, also while you give the password if Erevos locks
  first; it goes once sent, or when you leave **Send to**.
- **They see when you read:** your phone tells theirs, as theirs tells yours, unless that chat appears offline (below).
- **When messages come:** Erevos looks at the relay every few seconds while it is open and unlocked, on any screen,
  and the home screen moves the chat to the top by itself. On Android each new message sounds, with a notice that
  says only how many came, while Erevos shows too; in the chat or group open on the screen only the sound plays, and
  opening a chat takes what came there off the count. Typing, and that a message came or was read, make none. On
  Android it goes on in the background too, while **In
  the background** is on **Receive and ring** (below): there it waits at the relay until something comes, a minute at
  a time, instead of asking every few seconds, and asks nothing more when nothing came, so the battery lasts, and a
  notice says only how many messages came. Closed, locked, or
  long in the background otherwise, it does not: messages wait on the relay, up to 14 days, and come once Erevos
  opens again. A question to the relay with no answer in time (a wait there its minute and half a minute more,
  anything else 45 seconds, a part of a file 2 minutes) counts as failed and is asked again, so a connection that
  died on the way, as when the phone's network sleeps or changes, holds nothing back.

### Online, last seen, and appearing offline

While a contact's chat is open on your screen, Erevos asks their phone now and then whether it is open, and says yours
is. If theirs is, the chat says **Online** under their name with a green dot, and the home screen shows the dot on
their picture. Writing to someone also shows you online to them for two minutes. All of it goes inside the encryption,
only between you and that contact: the relay sees a message now and then, as with any chat.

When they are not online, the chat says when they last had Erevos open, to the minute: **last seen today at 14:32**. Your
phone tells your contacts yours the same way, inside what goes to them anyway (a message, or that one came), and once
when one opens your chat while Erevos is closed on your phone, only if it was open since they were last told. It is off
in a new space until you turn it on, in **Settings** → **Privacy and security** → **Last seen**, or in any chat's
details; a space made before 7.0.1 keeps it as it was, on unless you turned it off. It goes both
ways: turned off, no one sees yours, and you see no one's either; those who saw it lose it with your next message. It is
set for the whole space and its linked devices, each space on its own. Each place of hidden chats has its own switch,
in a chat's details there, and its own time: while they are open, only they count as open, not the space.

With **Say when I open and close Erevos** on (under **Last seen**, on unless you turn it off), opening Erevos also tells your
contacts at once, without waiting for a message: only those you talked with in the last 30 days who show their own time
too, each after a random wait of up to a minute, at most every 15 minutes, never a chat that appears offline or a
message request. As Erevos closes, or its hidden chats do, those told while it was open are told at once when it
closed, so their **last seen** is that time. The relay then sees something go to them as you open and close Erevos, so it
can tell when you do: turn it off
and your time goes only with what goes to them anyway.

While you type to a contact who shows online, their chat shows **typing…** under your name for a few seconds, and
yours under theirs when they type. It is said every few seconds at most, only while they show online, never to a
message request, and not in groups.

**Why:** being online is said only between you and a contact whose chat is open, inside the encryption, so the relay
sees no more than a message now and then between two people talking. The time you were last seen rides inside the same
messages, end-to-end encrypted: the relay never learns it. It does tell your contacts when you sleep or work, and two
contacts seen at the same minute may be guessed to talk: turn it off if that matters to you. Someone who only has your
link, writing as a message request, hears nothing back until you accept: not that you read, nor that you are online,
typing or last seen. Until you accept, only its words show: its photos and files wait, not taken, and its links show no
preview. If its first messages ask for a code, a PIN, a password or money, promise easy money, or its name looks like
one of your contacts', **Be careful** says so above them. Erevos looks for this on your phone only, and blocks nothing.

To hide it from one contact, open their chat, tap its name and then **Appear offline**. With it on:

- **They do not see you online**, nor that you are typing, and your phone sends them nothing while you read.
- **Their messages stay ✓** on their phone, not ✓✓ or ✓✓✓, while you read them.
- **When you write to them**, you show online for two minutes, and every message of theirs you read turns ✓✓✓ at once.
- **You do not see them online either**, since your phone does not ask, nor when they were last seen; and they get
  no time of yours.

It is set for each chat, on this phone only. Turn it off again and they see what you read with your next look at the relay.

### Names and deleting

Open a chat, tap its name and then **Rename** to give it a name. The name stays on this phone, sealed with the chat: the other phone
does not see it. An empty name brings back the start of their key, unless one of your contacts is linked to them: then they take its
name again the next time its card opens, while the link stays (see [Contacts](#contacts)).

**My name:** under Settings → Privacy and security → **My name** you can choose the name your contacts see in place of a code. It is told encrypted, only to the contacts you accepted, and your private groups learn it too: there, those who are not your contacts show as "Name · 1a2b", with the start of their key. If you gave a contact a name of your own (**Rename**), you keep seeing yours; the one they chose shows in their **Details** as "Calls themselves" and as the hint in the rename field. Each space has its own name, and so has each place of hidden chats (in its settings, beside **Receive while closed**): a hidden place never takes the space's name and starts empty, and the same name in two of them tells whoever sees both that they are yours. A name can have 40 characters at most.

Tap its name and then **Picture** to give them a picture of your own choosing, a sign on a colour, instead of the one drawn
from their key. Or tap **Photo** (or **Take photo**) for a photo: cut square, made small and drawn anew, so nothing it said besides its
picture (a place, a phone) is kept, then sealed in a file of its own. It too stays on this phone, and goes into backups;
**Picture from their key** brings the drawn one back.

Each chat can also look its own way: tap its name and then **Chat look** for the same choices as **Appearance** (style, theme,
colors, letters, wallpaper, messages and their text size), for that chat only. A group has **Chat look** where its name opens
(in a public group, under **⋯**), Chat with myself has it at the top{+, and a chat on Matrix, XMPP or Nostr at its foot, beside
**Notifications**}. Like the name, it stays on this phone, sealed with the chat. **Same as the app** gives it the app's look again.

To keep a chat outside Erevos, tap its name and then **Export chat**: its messages go into a text file, each day under its
date and each message with its time and who wrote it, saved in the folder you pick (on a computer, where you choose). The
file is not encrypted: anyone who has it, or any app that reads that folder, can read it. Photos, files and voice messages
are only named, messages that disappear are left out, and hidden chats are not exported, so that no file outside Erevos
shows they are there.

**Why:** a message that disappears is left out, and so is a quote of one, as whoever sent it meant it to disappear,
not to stay in a file.

To delete one message, press and hold it and tap **Delete**. To delete all the messages of a chat, tap its name and then **Delete messages**.
Either way Erevos asks where:

- **This phone:** only here. The other phone keeps its own.
- **Both phones:** their phone deletes them too, the next time it looks at the relay. Their Erevos does so, but a
  changed app, a screenshot or a copy can still keep them.

### Deleting and blocking a contact

Tap a chat's name and then **Delete contact** to forget them: their chat goes from this phone, and Erevos gives you a
new relay queue at once. Your other contacts are told it quietly, in a message with nothing in it, and again 7, 14 and
21 days later while they have not written to the new one; what they wrote to the old one meanwhile still shows for 14
days. The one you deleted is not told, and nothing they send there shows. Your contact link stays as it was, so they
can still ask to talk again with it, as a message request, like anyone who has it.

**Why:** all your contacts write to your one queue, so whoever you delete still knows where it is; once it moves, they
can no longer write to you there, nor can whoever sent the junk below. Your contact link names a queue of its own,
which a deletion leaves alone, so every link and QR code you gave keeps working.

**A queue for each contact:** at a relay updated for it, each contact writes to a queue of their own, which only they
know, said inside your encrypted messages; your contact link's queue is then only for first messages. So the relay
cannot tell from where messages go that two contacts write to the same phone, and deleting or blocking someone deletes
their queue alone: your own moves only if they knew it too, as contacts from before this do, and someone who came
through your contact link before its first move. Contacts from before get one of their own in turn, a few at a time,
quietly, and an Erevos of theirs from before takes it too. These queues are read with no token, so the token, which
names your phone, does not tie them together; through Tor, eight at a time, each eight on circuits of their own. They
are still made and deleted with the token, so a relay that keeps logs can tie them together then. Hidden chats and
linked computers keep one queue for everyone, for now. The web app has no Tor, so while it is open it waits on all
your contacts' queues together, from one address; with notifications while closed turned on, your relay also has one
push address for all your contacts' queues (see [On an iPhone](#iphone)).

- **Block contact**, under it, does the same, and also drops what they send later, a request too. **Block**, beside
  **Refuse**, blocks a message request: a request knows only your contact link, so it moves your queue only while the
  link still names that one, as it does until your first move. Whoever you blocked is under **Blocked contacts** on
  **New chat**, with **Unblock**. Adding them again from their link asks you to unblock them first;
  until then nothing adds them, {~neither their answer to an invite by SMS nor their contact link|not even their contact link} in a group. Each
  person who writes from your contact link can make the phone sound, as any message does: **Refuse** or **Block**
  stops that one, **Notifications** → **Muted** in their chat silences them without refusing, and **New contact link**
  stops whoever has the old link once its 14 days are over.
- **Groups:** someone in one of your groups can still write to you there. Erevos says in how many you are together:
  leave them, or ask their admin to take them out.
- **When the relay cannot be reached**, the queue changes as soon as it answers, and until then nothing they send
  shows.
- **Scheduled messages** you had for them are taken back from the relay, at once or as soon as it answers, so they
  never go.
- **Junk:** when your queue fills with what is for no one here, Erevos gives you a new one the same way and says so, at
  most once a day. When junk fills the queue your contact link names, you get a new link instead. A flood of made-up
  message requests counts as junk too, while a batch of real ones still comes.
- **New contact link**, under **My link** on **New chat**, gives you a new link: the links and QR codes you gave
  before work for 14 more days, then no more. Your contacts are not affected. Should the relay lose the queue your
  link names, you get a new link the same way, but the ones you gave before stop working at once.
- **Link for a website**, beside it, in the space's chats, gives you a link to put on a web page, such as your contact
  page, with the name you choose for it. It opens a page that offers {=Erevos} to whoever has none yet, on Android, an
  iPhone or a computer, and then adds you. Anyone who sees it can write to you, so what they send comes as a message
  request, which you accept, refuse or block. It gives no place on your relay, and it works for as long as your contact
  link does: **New contact link** ends it too.
- **On a linked computer** it goes to the phone, which deletes or blocks them too and moves its queues, the computer's
  as well. The phone keeps who is blocked and tells the computer: adding them there from their link asks you to
  unblock them too, and **Unblock** unblocks them on the phone as well.
- **In hidden chats** only that place's queues move, its ring queue at once, so the one you deleted can no longer make
  the phone ring. Nothing of the space or the other places moves.

The contact card's **Delete** (see [Contacts](#contacts)) takes only the card away, not the chat. A backup made before
a deletion or a block brings that contact back: delete or block them again after restoring it. Once restored, your
queue says it is newer than any your contacts know, and each is told it again, so they all write where you read.

### A message's menu

Press and hold a message for its menu: the reactions at the top, then what you can do with it.

- **Reactions:** tap one, or **+** for more. It shows under the message on both phones, yours lit; tap it
  again to take it back. Each of you has one reaction on a message. It goes at once, or not at all: when neither
  the relay nor their phone nearby can take it, nothing changes.
- **Reply:** your next message answers it, and shows it quoted above your words, on both phones. Tap the quote to go
  to the message it answers; **✕** drops it. An Erevos from before this shows the answer without the quote.
- **Reply in thread:** answers it in a thread, as in a group: the thread shows alone, with **Thread** at the top, and
  what you send there answers it. Under a message answered, **n answers in the thread** opens it; Back shows the
  whole chat again. An Erevos from before shows each answer with its quote.
- **Forward:** sends a copy of it to another chat: pick a contact, or a group. Its words, sticker or place go anew, a
  poll as a new one with no answers yet, and a voice message's sound or a photo's or file's bytes are sent again,
  encrypted with a new key, so nothing ties the copy to the message it came from. The copy says **Forwarded** under
  it, not from where; an Erevos from before this shows it without that. A message that disappears
  is not forwarded, and from hidden chats a message goes only to the same hidden chats.
- **Star:** stars it, on this phone only, to find it again: **Starred messages** in the home screen's menu lists them
  from all your chats, and a chat's details list its own. A tap goes to the message. Hidden chats' starred messages
  show only in their chats' details.{~ }{+Chats on Matrix, XMPP and Nostr, and }{~SMS conversations}{+,}{~ have **Star** too, kept
  encrypted on this phone only: a chat's own **Starred messages** lists its stars, and the home screen's lists them
  with all the rest, each opening its chat at the message. In those chats, holding a photo, video, voice message or
  file, or an MMS's picture, also offers **Save to the Collection**, and holding a sticker or photo that came offers
  **Add to my stickers**; the SMS sticker picker offers your own stickers too, to send as MMS.}
- **Pin:** pins it to the top of the chat, on both phones; either of you can **Unpin** it. With more than one pinned,
  the latest shows; tap it to go to it, and the next one shows.
- **Copy:** puts its words on the clipboard, to paste in another app. On Android the copy is marked private, so the
  phone's notice of it does not show the words, but any app that reads the clipboard can read them.
- **Select:** chooses this message, and a tap on others adds them; a bar then offers **Copy**, which puts all their
  words in one text with each one's time and writer, **Forward**, which sends them to one chat, and **Delete**, which
  asks once before it deletes them. **Back** stops choosing.
- **Edit:** for a message of yours, up to a day after you sent it. Its words go in the field under **Edit message**:
  change them and send, or **✕** to leave it as it was. Both phones show the new words, with **Edited** beside the
  time. Only words are edited, not a sticker, a place, a poll, a voice message, a photo or a file, nor words you
  forwarded. One that still waits to go goes with the new words, not marked; one sent for later is not edited. The
  edit goes at once, or not at all, as a reaction does, and your linked devices show it too. An Erevos from before
  this keeps the old words.
  **Why:** a day is time enough to put a mistake right, and no one can change what they said days ago. The mark
  shows the words are not the first ones.
- **End poll:** for a poll of yours: no more votes count, and the final results show. An Erevos from before this still
  sees it open, and a vote sent at that moment may count on some phones only.
- **Delete:** on this phone, or on both, as above.

Reactions, replies, pins and edits travel inside the encryption, like the messages.

### How words look

Marks typed around words change how they show, in chats and groups, as in WhatsApp and Signal: \`*bold*\`,
\`_italic_\`, \`~struck through~\`, a word between backticks as code (three backticks around lines for a block of
code), and \`||words||\` hidden behind a grey bar until tapped, on the screen, in the home screen's line and in a
quote (there as ▒▒▒).

- **Only around words:** a mark counts when it starts a word and ends one, so \`2*3*4\`, \`snake_case\` and web
  addresses stay as they are. Bold, italic and struck through stay on one line.
- **Others see the marks:** an Erevos from before, and other apps, show the words with their marks, as typed.
- **Hidden photo:** under **+**, **Hidden photo** sends a photo that shows blurred in the chat, in contacts' chats and
  groups, until it is tapped and opens on its own. It is blurred in **Media, links and files** too. An Erevos from
  before shows it as any photo.
- **Photo to see once:** under **+**, **Photo to see once** sends a photo that never shows in the chat, in contacts'
  chats and groups. **Camera, to see once** sends one you take there and then, the same way. Whoever gets it taps it
  and sees it once, on its own, kept out of screenshots where the phone allows; as it closes, Erevos deletes it from
  their phone, and the chat says **Photo seen once**. It cannot be forwarded{~, saved or put in the Collection| or saved}, and your
  own phone lets go of it once it reached them. Nothing stops a camera pointed at the screen, and an Erevos from
  before shows it as a hidden photo.

**Why:** a mark typed in the words travels in them, inside the encryption, with nothing beside them to tell apart.

### Disappearing messages

Open a chat, tap its name and then **Disappearing messages** to choose how long its new messages last once read: 5 minutes, 1 hour,
1 day or 1 week. To make only the next message disappear, tap the stopwatch beside the message field (or
**Disappearing message** under **+**, or **Disappear** in the send arrow's menu): **Disappears 1 hour after it is read**
shows over the field. Tap the time to pick another, or **✕** to turn it off. It goes with the next message you send:
words, a voice message, a photo or file, a sticker, a place or a poll, now or later.{~ An SMS cannot disappear: sent as
an SMS, it stays on both phones (Erevos says so first), and the stopwatch is off again.} Its time starts when the other phone shows it on the screen, and your copy starts when their phone says so
(**✓✓✓**). Each message says when it disappears. The other phone learns the chat's setting the next time it looks at
the relay, and either phone can change it: the later change wins. Messages already in the chat stay.

- **Until it is read** a disappearing message stays on both phones, sealed like the rest. If their {=Erevos} never says
  it read it, your copy stays.
- **While Erevos is closed:** a message whose time has come is deleted when the chat next opens. Until then it stays
  on the phone, sealed like the rest.
- **Not a guarantee:** their {=Erevos} deletes them, but a changed app, a screenshot or a copy can still keep them.

### Block screenshots

Open a chat, tap its name and then **Block screenshots**: on Android, neither phone can take a screenshot or a screen recording of the chat while it shows, and the recent apps show it blank. The other phone learns it with your next message, and either of you can turn it off again: the later change wins. The chat says so when they change it.

**Why:** what you write stays between the two of you, unless someone sets out to copy it.

- **Android only:** {=Erevos} on an iPhone, on a computer, in a browser or on Sailfish cannot block screenshots, and the chat says so there.
- **Not a guarantee:** a photo of the screen taken with another camera, or a changed app, still keeps it.

### Notifications for this chat

On Android, open a chat, tap its name and then **Notifications**; in a group, tap its name (in a public group, **⋯**)
and then **Notifications**. **Muted** for 8 hours, 1 week or **Always**: its messages make no sound and show no
notice, so Erevos's icon does not count them either; the list still shows them, with a struck-through bell, and its
calls still ring. **Message sound** and **Ringtone** give it a sound of its own for its messages and for its calls,
from Android's own list of sounds, or **Without sound**. In a chat's details the row then says **Muted until** and the
time, or **Sounds of its own**.

**Why:** a muted chat still counts in the list, so nothing that came is lost: only the phone stops calling you to it.
Its sounds are kept on this phone only, with the chat in the space's encrypted data, as each phone has sounds of its
own: a linked device keeps its own, and the other phone learns nothing of them.

- **In hidden chats** there is only **Muted**: a sound of its own would tell anyone near which chat it is.{+ So it is for the
  chats of a hidden place's own Matrix, XMPP and Nostr accounts: muted, they say nothing, not even "New message".}
- **A closed space, and hidden chats while closed,** do not know which chat a message came in, so they tell of it as
  the app's settings say.
- **Only on Android** for now: the web app tells of every chat as its settings say.

### Voice messages

In a contact's chat, with nothing typed, press and hold the microphone at the end of the message bar while you talk,
and let go to send; slide left before you let go to drop it instead. A press of under a second is taken for a slip
and sends nothing. After a minute it sends by itself. The first time, Android asks whether Erevos may use the
microphone: it records only while you hold it. With TalkBack, tap it once to start and again to send. Tap a voice
message to play it, and tap it again to stop. Voice messages have the same marks as the rest, and follow the chat's
disappearing setting.

**Change my voice:** in a contact's chat details, **Change my voice** sends your voice messages in that chat
**Deeper** or **Higher**, as long as you spoke. Your phone changes the sound before the message goes, so your own
voice never leaves it; if the change fails, the message is not sent. Only your phone knows the setting. It makes your
voice hard to know by ear, but someone with the recording and time could undo some of it. On Android 10 and later, and
in browsers that make Opus themselves (WebCodecs); the walkie-talkie keeps your voice.

**In words:** hold a voice message, in a contact's chat or a group, and choose **In words**: your phone writes out
what was said, to read or copy. The first time it downloads a speech model of 268 MB, once you say so, from Erevos's
own server, which sees your address as for any download; then all of it is done on your phone, and neither the sound
nor its words leave it. It hears about a hundred languages, Greek among them, and finds the one spoken. It may make
mistakes, and the words are not kept. **Delete the speech model**, under it, frees the space. Only on Android, and it
needs a phone with about 2 GB of memory free, as it takes about 1.5 GB while it writes; should that fail, the next try
opens the model again. Where nobody speaks, in silence or noise, it writes nothing, rather than words nobody said.

**Speak to write:** tap the microphone beside the message field, in a chat or a group, and choose **Speak to write**: from then on, holding the microphone listens instead of recording a voice message, until you choose **Voice message** in the same menu. Speak; tap
**Done**, and your words are written into the field, to change before you send them. It uses the same speech model as
**In words**, downloaded once when you say so, and all of it is done on your phone: neither your voice nor its words
leave it, and the sound is not kept. It listens for up to two minutes, and may make mistakes. Only on Android.

**Translate:** hold a message, in a contact's chat or a group, and choose **Translate**: your phone translates it into
your language, to read or copy, between Greek, English, German, Spanish, French and Italian. It guesses the message's
language; tap another under **From** or **Into** to change either. The first time for a language it downloads its
translation models, of 60 to 95 MB each, once you say so, from Erevos's own server, which sees your address as for any
download; two languages neither of which is English go through English, with a model for each. Then all of it is done
on your phone, and neither the message nor its translation leave it. The models are OPUS-MT, by the University of
Helsinki (CC-BY 4.0). It may make mistakes, and the translation is not kept. **Delete the translation models**, under
it, frees the space. Only on Android.

**Why:** on Android 10 and later, in the web app and on a computer, a voice message is Opus at 32 kbit/s, about 240 KB a
minute, as Telegram, Element and Conversations send them: as clear as speech gets. On Android 9 and older, and in Safari
before iOS 18.4 and macOS 15.4, it is AAC at 64 kbit/s, about 480 KB a minute. More would not be heard in a voice, but
would be slower to send, over Bluetooth most of all. Every Erevos plays both: Safari before 18.4 plays Opus once Erevos
repacks it for it, and where a browser cannot play one, Erevos says so.

- **Through the relay, or nearby,** end-to-end encrypted like the words, in several pieces. No one in between can
  hear them, but from the pieces the relay, or whoever listens nearby, can tell that something long was sent, and
  roughly how long. Nearby they go only to a contact's phone known to be near.
- **On the phone** each sound is kept in a file of its own, sealed with its own key, which only the chat's sealed
  history holds. When the message goes, deleted, disappeared or the oldest, its file goes too. How many of these files
  there are, and their sizes, show roughly how many voice messages the phone keeps, in all its spaces together, not
  in which.
- **While it plays** the sound is unsealed in Erevos's cache, and deleted once it stops. If Erevos is closed while it
  records or plays, what was left goes the next time a chat opens.

### Photos and files

In a contact's chat, tap **+** beside the message field, which opens where the keyboard was, then **Photo** to pick one
from the phone's photos, **Camera** to take one, or **File** for anything else, up to 100 MB. Under them, **Photo
quality** sets how photos go, and
Erevos remembers it:

- **Original** (the default): the photo exactly as it was, full size, no quality lost. Only what it says besides its
  picture is taken out: where it was taken, the phone, the time, thumbnails. Its name is just "photo".
  A photo sent with **File** (JPEG, PNG, GIF or WebP, up to 64 MB) goes without them too, under its own name; for a HEIC or
  AVIF file, or a larger one, Erevos asks first, as it cannot take them out of it.
- **90%** and **75%:** a new, smaller photo, quicker to send, that says nothing but its picture.

Their photos and files up to 16 MB come by themselves; tap a bigger one to take it. Tap a photo to see it on the whole
screen, with its size: two fingers or a double tap zoom in, one finger moves it while zoomed, and a tap hides or shows
what is around it. Tap a file to save it. Erevos turns with the phone while the phone's **Auto-rotate** is on, and a
photo shown on its own turns with it even when it is off. **Save** puts a copy in a folder you choose the first time,
and **Save in another folder** changes it. Photos and files have the same marks as the rest, and follow the chat's
disappearing setting.

- **Open with another app:** a file that is not a photo has **Open** too, on Android: the phone's app for its kind, a
  PDF reader say, reads it from Erevos's memory, with no copy left on the phone, and the link is let go of when the next
  file opens or the space locks. Erevos asks first, as that app is outside Erevos and its encryption, and never opens
  web pages, drawings or app packages that way, as they could reach the internet outside Tor: save those instead.
- **How they travel:** each file is encrypted on the phone with a key of its own, in pieces all of one size, and put
  on your relay. Only where the pieces are and the key go to the contact, end-to-end encrypted. Their phone takes the
  pieces through their own relay, so your relay never sees their phone's address, checks every piece, and then
  deletes them from the relay. Pieces nobody takes are deleted after 14 days.
- **What the relay sees:** how many pieces there are and their size, so roughly how big the file is, and when. Not
  what it is or who it is for.
- **A file goes as it is,** with whatever it says inside: a document's author, or a photo's place and phone if you
  send it with **File**. Send photos with **Photo**.
- **On the phone** each file is kept in its pieces, as they travelled, sealed with its own key, which only the chat's
  sealed history holds. When the message goes, its pieces go too. How many pieces there are shows roughly how much the
  phone keeps, in all its spaces together, not in which. A photo is shown from memory, never written out unsealed.
  The phone's photo picker hands over a copy in Erevos's cache, deleted once read, and a photo taken here is not kept
  in the phone's photos.
- **Saved** photos and files are outside Erevos, not sealed: anyone with the phone can open them.
- **Through the relay only:** files need its file store, even when the contact is nearby. A relay older than this
  version cannot take files: update it.

### More under +

Under **+** there is more to send than photos and files (the smiley at the end of the message field opens the
stickers too):

- **Sticker:** one of the 576 stickers built into Erevos, in 24 sets of 24 (among them **Moons**, **Dogs**,
  **Greece**, **Words** and **Treats**), drawn by each phone itself: only its name travels, so nothing is ever
  downloaded. An Erevos from before this shows its emoji instead. All but the words and the treats move a little for a
  few seconds as they come and when tapped, then rest; with the phone's reduce motion setting on, they stay still. The
  words show in the app's language.
- **As a picture:** in a chat on another network that takes only pictures, a built-in sticker goes as its picture
  instead: 512 by 512 with a clear background, drawn on your phone or computer from the same shapes, at rest, its words
  in the app's language. Nothing is downloaded to make it.
- **Mine**, among the stickers, holds those you make from photos. **New sticker from a photo** cuts one square, makes it
  small (512 by 512, about 100 KB at most) and keeps only its picture, nothing of where or with what it was taken. It is
  kept sealed in the space, or in the hidden chats it was made in, and shows only there, up to 100 of them; hold one to
  delete it. Like the rest, it goes into a backup, sealed, and never to the account's other devices. It goes as a photo
  goes, end-to-end encrypted through the relay, marked as a sticker, so it shows on its own with no bubble; an Erevos
  from before this shows it as a photo. Hold a sticker someone sent you and tap **Add to my stickers** to keep it.
- **Location** (on Android): sends where you are, once, as a place. The first time, Android asks whether Erevos may use
  the location. The phone looks on every way it has at once: by satellite, when you allowed the precise location, and by
  its network location, which on many phones asks Google or the phone's maker. A sheet opens at once and says it is
  looking; indoors, where the satellites are hard to see, that can take up to a minute. When nothing comes in time, it
  offers the place the phone found in the last ten minutes, saying how long ago, or says why none was found, with **Try
  again** and the phone's screen that changes it. Erevos looks only when you tap, shows you the place before it goes, and
  does not follow you after. The message holds only the coordinates, end-to-end encrypted; no map is loaded in Erevos.
  **Open in maps** hands the place to your maps app, which may load its map from the internet. An Erevos from before this
  shows the coordinates as words.
- **Contact card:** sends a contact from your phone's contacts as a card, with its name, numbers and email addresses,
  end-to-end encrypted. The other person sees the card with **Add to contacts**; an Erevos from before this shows it as
  words. In hidden chats you choose only among the contacts kept in the hidden place, never the phone's.
- **Poll:** a question with two options or more, up to 12, and, with **More than one answer**, more than one to choose.
  Tap an option to choose it, again to take it back; each option shows how many chose it, and who. Votes travel inside
  the encryption, as reactions do. An Erevos from before this shows the question and its options as words, to answer in
  words.
- [~] **Payment request** (asked from another app, as Fasouli): an amount and what it is for, as a card. The one asked
  taps **Paid** once they paid, which tells your phone, and cannot be taken back; then **Mark in Fasouli**, on Android,
  marks it collected there. Erevos moves no money and knows of no bank: the card only says what was asked. Only in
  chats with a contact, never in hidden chats. An Erevos from before this shows the amount as words.

**Why:** a sticker pack fetched from the internet would tell a server that this phone has {=Erevos}, so the stickers are
built in and only their names travel. Your own are listed in one sealed value of the same size for every space and
hidden place, used or not, so a list in use looks like one that is not: 100 is what it holds. A place is sent only from
Android: on a computer or in the web app, the browser would ask an outside service where it is.

### Link previews

A link in a message is underlined, and opens only once you tap it and say so. With **Link previews** on, in a chat's
details, a link you send goes with its preview: as you send it, this phone fetches the page and takes its title, a line
about it and a small picture, and they go inside the message, end-to-end encrypted. The phone that gets it fetches
nothing: it shows what came. It is off unless you turn it on, and then it is on for all the chats of the space;
each place of hidden chats has a switch of its own, in a chat's details there.

**Why:** only the sender's phone fetches the page, so the phone that gets a link reaches no site someone else chose,
and shows that site nothing of itself, not even its address.

- **The site sees this phone's internet address**, and when, as it would from a browser, but not who the message is
  for. With **Through Tor** on, under **Link previews**, the page and its picture are fetched only through Tor,
  whatever the space's Tor setting, so the site does not see the address. That is slower, and waits while Tor starts;
  a page that sends you on elsewhere (a redirect), or that does not let Tor in, gets no preview. While everything in
  the space goes through Tor (**Everything** under Tor), previews are made only with **Through Tor** on.
- {=Erevos} on a computer makes none, but shows those that come all the same.
- **Over LoRa**, which takes only a little, a message goes without its preview rather than wait, and keeps none here.
- A preview is what the page says of itself, true or not. An Erevos from before this shows the link without it.

### Voice and video calls

In a contact's chat, tap the green handset at the top for a voice call, or the blue camera beside it for a video call. The first time, Android asks whether
Erevos may use the microphone, and the camera for video. Their phone rings while {=Erevos} is open there, on any screen of
the space: they tap **Answer** or **Decline**. During the call you can mute, switch the loudspeaker, turn your camera off, flip
between the front and back camera, and **End**. Each call leaves a line in the chat, such as how long it lasted, or
a missed call.

- **Answer with video or voice only:** a call that rings offers **Answer**, for voice only, and **Answer with video**,
  in Erevos's calls{+ and in XMPP and Matrix calls}; in a group call they are **Join** and **Join with video**. A video
  call answered with voice only starts with your camera off.
- **Where the sound goes** (Android): with a Bluetooth or wired headset connected, **Speaker** becomes **Audio output**:
  it shows where the sound goes now, **Phone**, **Speaker**, **Headphones** or **Bluetooth**, and a tap lists them all,
  a Bluetooth headset by its own name, to choose. A headset connected as the call starts, or during it, takes the
  sound, as in a phone call, and turning your camera on leaves it there; when it goes, the sound goes back to the
  phone, or to the loudspeaker in a video call.
- **Turn your camera on later:** **Camera on**, on the call screen, works when the other side's app can change a call
  while it goes on; a group call stays as you joined it.
- **Add video to a voice call:** in an Erevos voice call, **Add video** turns your camera on once the other person says
  yes; if they say no, the call stays voice.
- **Your own picture:** in a video call your camera fills the screen until their picture comes; then it moves to a
  small window in the top corner, on both phones, so each of you sees the other and yourself.
- **Switch camera:** **Flip** moves to the next camera. On a computer it shows only when there is more than one camera.
- **How the call connects:** hold the call screen down for a moment to see how much of their sound was lost or had to
  be filled in, heard as gaps, how often that happened, the time there and back, the way the call goes, and how long it
  took to ring and to connect. A tap closes it. It is measured on your phone only, and helps find why a call sounds bad.

**A call to a phone that is slow to take it:** when their phone takes your call late, for example because it reads
through Tor, **Calling…** shows for up to a minute and a quarter, and once it rings there it rings for 45 seconds from
then, so a call that arrived late does not ring on their phone only to stop at once. Their phone also reads a call
before anything it has to send, and after its network changes (Wi-Fi to mobile data) it waits for calls again at once.

**A plain call on the mobile network:** when a contact has their phone number linked to them, or is connected to one
of your contacts with a number (**Connect to one of my contacts** in their chat, a mobile number first), the orange
keypad at the top of their chat, before the camera, opens a keypad with that number typed{~, and so does the one at the
top of an SMS conversation}. It is {~Erevos's **Phone** when Erevos is the phone app, or else }the phone's own: tap the call key there. Such a
call goes over the phone company's network and is not encrypted{~, as a plain SMS is not}. Hidden chats and computers do not have it.

- **End-to-end encrypted:** the call is set up with messages through the relay, encrypted like the rest. Those carry
  the key that encrypts the call itself, so no one in between can listen, not even the call relay below.
- **Through the call relay:** a relay set up with the kit in \`deploy/relay\` has a call relay beside it. The call
  goes through it, so neither phone learns the other's IP address. Over Wi-Fi or mobile data, anywhere.
- **Without a call relay** (a relay on your own computer, for example), Erevos asks first: the call then goes
  straight between the phones, only works on the same Wi-Fi, and each phone sees the other's address on it.
- **Without internet:** on the same Wi-Fi, a phone's hotspot, or the Wi-Fi two phones make (Wi-Fi Direct), with a
  space open on both, a call needs no relay at all: it is set up over the nearby link and goes straight between the phones (or computers). The same goes for group
  messages and group calls.
- **In the background (Android):** while a space is open, Erevos keeps running when you leave it, with Home, Back on
  its first screen or by swiping it away from the recent apps, with a quiet notice, "Erevos – Ready for calls and messages", that does not
  show on the lock screen. It waits at the relay and on the links to phones nearby, so messages come: a notice
  says only "New message", or how many came, and on a locked phone only "Erevos". A message request, from someone who
  has only your contact link, makes the same notice and sound, and counts on the icon, as any message does. A call
  rings with the phone's ringtone and a notice, "Incoming call" (or "Incoming video call") – "Open Erevos to answer",
  with no name, over the lock screen and the screen saver too, and the screen wakes. Tap it to answer. With the password
  lock on, a call that rings shows before the password, and Erevos locks as soon as it ends. Locked, the space goes on
  behind the password screen, so messages and calls still come, and a call shows over the password screen. Only that space's chats
  and groups come so, and hidden chats with **Receive while closed** on; other hidden chats only say that a message
  came, or ring with no name, if you let them (see Hidden chats). Set it under **Settings** → **Notifications** → **In the background**:
  **Receive and ring** (the default) or **Only while Erevos shows**, and **Say a message came** (the default) or **No
  notice**, which goes for while Erevos shows too. There too, if Android asks for them, **Keep running on battery** and **Show calls over the lock
  screen**. Below them, **Only the waste** (the default), **And nearby phones** and **And sleep** choose how much battery it spares in the background: the second also turns off the radios for phones nearby while Erevos is in the background, the third also lets the phone sleep, so Erevos looks at the relay about once a minute, and a message or a call can be a minute or two late.
- **And light sleep:** a fourth choice there, between **And nearby phones** and **And sleep**. The phone may sleep, but Erevos leaves its wait at the relay open, so what comes wakes the phone and a message or a call still comes at once where the network and Android allow it; Erevos also looks by itself every few minutes. It is new and not tried on many phones yet: if messages come late with it, choose another.
- **The number on the icon:** with **Say a message came** on, when you leave Erevos with messages not read in the open
  space's chats and groups, the notice stays, without sound, and says how many, with those it tells of after; it goes
  while Erevos shows, and comes back as you leave it, until you have read them. Messages in a muted chat are not
  counted (see Notifications for this chat), nor those in a hidden chat as you leave. Android's launcher shows it on
  Erevos's icon, as a number, or on some phones, such as Pixels, as a dot. **Settings** → **Notifications** → **Number
  on the icon** turns it off: the notice then tells only of what came since you last had Erevos open, and the
  launcher's number goes with it. A message deleted for everyone before you read it, or read on a linked computer, no
  longer counts.

  **Why:** on Android only a notice can put a number on an app's icon, so the notice stays while messages wait; it
  says no more than how many, as it always did.
- **A space that is closed:** it receives nothing, as its key is only in memory while it is open: its messages wait at
  its relay and come when you open it. Unless you choose, in that space, **Also while another space is open** under
  **Settings** → **Notifications** → **In the background** (the default is **This space only while open**): then, while
  another space is open and receives, it says only "New message", or how many came, with the same notice as that space,
  never which space, and its hidden chats say nothing. What other phones carried to its relay counts as a message,
  deletes too, and a message sent to it without sound sounds as usual (see **Send without sound**). For it the phone keeps the addresses of its queues at its relay
  outside its password, including the queue each contact writes to, for up to 64 contacts, never its keys, who its
  contacts are, or its messages, and asks the relay only how many came, never for them: they stay there until the space
  opens. A space that goes through Tor (**Messages** or **Everything**, under **What goes through Tor**) is asked
  about only through Tor: while the open space has Tor off, or its Tor is starting or has just failed, the closed space
  says nothing, and what came is told once Tor is ready there.

  **Why:** a space behind a second password must not show that it is there, so it is off unless you turn it on, and then
  it says no more than the space that is open would. Asked straight from the phone while another space is open, its
  relay or someone watching the network could tie the two spaces together by the phone's internet address. Since each contact writes to a queue of their own, the space must
  ask about each of those too, or their messages would say nothing. The cost is that its relay may tell that the two
  spaces are on one phone, and someone who examines the phone with tools may find that a second space keeps addresses
  there, and how many contacts it has.
- **A dot for the other spaces:** in a space set to **Also while another space is open**, **Dot in the other spaces**,
  under it (the default is **No dot**), also shows a small dot on the padlock at the top of the chats of the space
  that is open, once a message came to this one while it was closed, until you open it: never how many, nor which
  space. It works where the notice does: on Android, while the space that is open has **Receive and ring** and **Say a
  message came** on. For it the phone keeps, beside the addresses above, only whether a message came. Whoever sees the
  open space's chats sees the dot too, and may guess there is another space.
- **When the phone turns on:** where Erevos receives in the background, it starts by itself after the phone turns on,
  or after Erevos is updated: **Start when the phone turns on**, under **Settings** → **Notifications** → **In the
  background**, is the default, and **Wait until I open it** there leaves it closed until you open it. It starts with
  no space open, as a space with a password opens only with it and Erevos keeps no key on the phone. So until you open
  a space it reads no message, shows nothing of what came, and rings for no call. Only the spaces set to **Also while
  another space is open** ask their relay whether something came, without taking it: a quiet notice says "Locked: says
  only that messages came", and "New message", or how many came, shows when something does, never which space, nor who
  or what; a call counts as something that came, and does not ring. Spaces that go through Tor say nothing until a
  space is open. With no such space, or with **No notice**, only a quiet notice says "Locked. Open it to receive calls
  and messages again.", and a tap on it opens Erevos. An Erevos with no password does not open by itself either: it
  too says it is locked until you open it. Once a space is open, it receives and rings as ever. Android only.

  **Why:** after a restart Erevos could not tell you that messages wait until you happened to open it. Without your
  password it still cannot read them, so it says no more than a closed space does.
- **Where it cannot ring:** stopped by Android (or by the phone's battery saving, or the phone maker's own setting),
  after the phone restarts until you open Erevos and the space once, in another space (it only says a message came, if
  you let it, as above), or on a computer or in the web
  app while closed. A call there shows as a missed call once Erevos opens. When Android closes Erevos while it
  receives and starts it again, as it usually does, a quiet notice says so: open Erevos and the space to receive
  again. After **Force stop**, with battery use set to Restricted, or when the phone maker's own setting closes it,
  Android starts nothing again, so no notice says so: the "Erevos" notice just goes, and nothing rings until you open
  Erevos. **Permissions** (below) says ahead if one of these is set. So does one, "Locked", when the space
  that received closes (after a backup is restored, say) and Erevos leaves the screen with the password asked. A message request cannot call you until
  you accept it.
- **Permissions (Android):** **Settings** → **General** → **Permissions** shows what Android lets Erevos do for calls
  and messages in the background (notices, the call notice and that it pops up, the message notice, with its
  "Messages without sound" and "Messages with a chat's own sound" notices, which also keep the number on the icon,
  calls over the lock screen, running on battery, running in the background with battery use not set to Restricted,
  not paused when unused, mobile data in the background, the microphone) and for other things (the sound for new
  messages, notices on the lock screen, calls through Do Not Disturb, camera, phones nearby, contacts, exact times for
  {~SMS sent later and }reminders, the reminder notice once a reminder came), each with why and a
  button that opens Android's own question or setting. It also says when the phone is on silent or vibrate, when
  battery saver is on, and when Do Not Disturb is on while Erevos calls are not let through it. On Huawei, Honor,
  Xiaomi, OPPO, realme, OnePlus, vivo, Samsung and ASUS phones it also says where the maker's own setting is, which
  Erevos cannot read: tap **I did it** once it is set. After each new version, and the first time, it opens by itself
  when calls or messages need something. In the web app it shows what the browser allows, see [On an iPhone](#iphone).
- **One call at a time.** A call goes on while you move between screens of the space. It ends when the space closes,
  and a call in hidden chats when they close, which they do not do during a call. Swiping Erevos away from
  the recent apps ends a call too.
- Calls do not go over a nearby phone or Bluetooth. There, **Talkie** under **+** turns the chat into a
  walkie-talkie, and **Talkie is on** shows over the field: hold the walkie-talkie at the end of the bar while you
  talk, let go, and it plays on their phone as it comes, if the chat with you is open
  there; if not, it waits as a voice message. It is a smaller voice message (about 3 KB a second), so it goes
  everywhere a message goes, Bluetooth included.

**Why:** the keys that open a space's messages are in memory only while it is open, and sealed behind its password
otherwise. So after the phone restarts, nothing can be read and nothing rings until you open Erevos and the space once;
and hidden chats, whose key is in memory only while they are open unless **Receive while closed** keeps it with the
space, otherwise only say that a message came, or ring with no name, if you let them.

> The relay settings, your queue, your contacts and their names, the keys of your conversations and the messages are
> kept in this space, sealed. History has no limit: it is kept in sealed pages of the same size, mixed with the pages
> of the other spaces and hidden chats, so only how much they all take together shows, not whose they are. The rest
> is kept the same size for every space and hidden chats, used or not; what is larger goes to pages like the
> history's, among them. Deleted
> messages can stay for a while in the phone's storage, sealed like the rest, until something is written over them.
> Messages sent or received nearby are kept the same way.

## Group chats {#groups}

From the home screen's menu, **New group**: give it a name, tick the contacts to ask, and tap **Make the group**.
You are its admin. Each contact's phone answers by itself the next time {=Erevos} is open there, and joins: the group
then shows on their home screen, with a note of who added them. A phone joins only a group whose admin is the contact
who asked it, and an admin lets a contact in only as themselves, never as someone else. Groups go through the relay,
so it has to be set.

**Why:** only the admin's phone changes the group (who is in it, its name), so no server has to put the changes in
order: every phone takes them from that one. So a member leaves by asking the admin, and only the admin adds or takes
out members.

- **Who can be asked:** contacts you have accepted, in this space. Members who are not each other's contacts still
  talk in the group, and show by the start of their key.
- **Add as contact:** in the members list (**⋯**), **Add as contact** under a member who is not your contact asks
  them, in a message only they get, for their contact link, and gives them yours. On their phone the ask shows once,
  at the top of the group, and they tap **Send** or **Don’t**; if they tap **Don’t**, you are not told. Once they send
  it you are each other's contacts, with a chat of your own, and **Name** gives them a name, as it does under any
  contact who has none yet. No answer can mean they have not opened the group yet, said no, have an older {=Erevos}, or
  still have you as a contact, which shows them nothing; after a week you can ask again. Once you are each other's
  contacts, in any group or by a contact link, what was asked in your other groups goes, and their ask no longer
  shows. A member taken out of the group asks nothing more. If two members show the same key, one of them is not who
  they say, and no contact link goes to either or is taken from either. Not in public groups. Asking is for the phone
  that holds the account; **Name** works on a linked device too.
- **End-to-end encrypted for the group:** MLS (RFC 9420). Each message is encrypted once for the group, then sealed
  again for each member, so what reaches each member's queue looks like nothing the others get, and no relay can tell
  who is in a group. It goes straight to each member's queue, through your relay. Every week each phone's keys in the
  group are made new, the admin's by itself and each member's through the admin, so keys taken from a phone once stop
  reading the group.
- **Members:** tap the group's name at the top, or **⋯** beside it. The admin adds contacts, takes members out and renames the group. A
  member taken out reads nothing the group says from then on, and the group stays on their phone, read only, until
  they delete it.
- **Threads:** hold a message and choose **Reply in thread** to answer it in a thread, or tap **n answers in the
  thread** under a message to open it. The thread shows alone, and what you send there answers it.
- **Description:** the group's admin writes it in the members sheet, under **Description**, and taps **Save**. Every
  member reads it, also those who join later. A change from anyone else is ignored.
- **Leaving:** **Leave the group** asks the admin, whose phone takes you out the next time {=Erevos} is open there. The
  admin's own button is **Close the group**: it takes every member out.
- **One admin:** a private group has one admin, the one who made it. **Why:** the group's changes must come in one
  order, and with MLS no server puts them in order, so two admins could change the group at once and split it in two. An
  Erevos from before this accepts changes only from the one who made the group.
- **Group calls:** the green handset at the top of the group starts a voice call in it, and the blue camera beside it
  a video call (also **Video call** under **⋯**). While one is going on, only its own button shows, to join it. It
  rings on the members' phones where Erevos is open, and whoever answers is in it. A call going on shows at the top of
  the group, to join it later. Up to eight people: each phone connects to each other one, through the call relay, so
  no phone sees another's IP address; without a call relay, only on the same Wi-Fi. End-to-end encrypted between each
  two phones, their keys sent in the group's encryption. In a video call each phone sends its picture to each other
  one, so pictures show for up to four people; with more, they pause and the sound goes on, until a server for bigger
  video calls is set up. A call that rings offers **Join** and **Join with video**.
- **Photos, files and voice messages:** **+** beside the field sends a photo or a file, as in a contact's chat,
  with the same **Photo quality**; hold the microphone while you talk, and let go to send. Each is encrypted with a key of
  its own and put on your relay once, and only where it is and its key go to the group, in its encryption. Each
  member's phone takes it from there through its own relay: up to 16 MB by itself while the group is open, a bigger
  one when tapped. Tap a photo to see it whole, a file to save it, a voice message to play it.
  - **The relay keeps it 14 days,** encrypted, as it cannot know when every member has taken it.
  - **Through the relay only,** even when members are nearby.
  - **A member who joins later** does not get what came before, as with the words. A member whose {=Erevos} is from
    before this version sees nothing of it.
  - **On the phone** each is kept in its pieces, sealed, as in a contact's chat. Deleting the group here deletes them.
- **A message's menu,** held down, as in a contact's chat: the reactions, **Reply**, **Forward**, **Star**, **Pin**,
  **Copy**, **Edit** and **Delete**. Each member has one reaction on a message, and a poll shows who chose what. A pin is for
  everyone, and any member can **Unpin** it. **Edit** gives your own words new ones for every member, up to a day after
  they went, marked **Edited**. **Delete** asks **This phone** or, for your own message, **Everyone**:
  the members' Erevos delete it too, and a photo, file or voice message of yours leaves your relay at once instead of
  in 14 days. **+** has **Sticker**, **Location** and **Poll** here too. Links are underlined and asked before
  they open, and **Link previews**, when on, go with yours. In the members sheet, or a public group's own screen, **Search in this chat** goes through the group's messages and **Export chat**
  writes them out, and **Media, links and files** lists the group's photos, videos, voice messages, music, files and links, each kind apart, as in a contact's chat (see above), each going to its message; **Starred messages** and the home screen's search take in the groups too. A member whose {=Erevos} is
  from before this version sees the words, a sticker's emoji, a place's coordinates and a poll's question, and
  nothing of reactions, pins, edits and deleting. **Select** chooses several messages to copy, forward or delete
  together, a poll of yours has **End poll**, and **+** has **Contact card** too. **Everyone** is offered when deleting
  only if all you chose are yours.
- **Naming a member:** type **@** in the message box, and the members whose names start with what follows show above
  it: tap one to put in their whole name. A member named so is told of the message even if they muted the group. Only
  whole names count, so **@Anna** does not name Anna Maria. An Erevos from before shows the words only, and tells as
  the group's settings say.
- **Not yet:** typing and disappearing messages in groups, and groups over a nearby phone.

## Public groups {#public-groups}

A public group is one anyone with its link, or its QR code, can ask to join: for a club, a street or a class, where
not everyone is your contact. From the home screen's menu, **Public groups**: give it a name and the name you go by in
it, choose who comes in, and tap **Make the public group**. You own it. Its messages are end-to-end encrypted with MLS
and go to each member as in any group, and no relay learns who is in it.

- **The link:** tap the group's name at the top for its link and QR code, and **Share the link**. Whoever opens it, or
  scans the code with the phone's camera, chooses the name the group sees and taps **Ask to join**. A link can also be
  pasted under **Join by a link**. Every member has the link, and can pass it on.
- **Description:** the owner or an admin writes it in the group's own screen, under **Description**, and taps **Save**;
  everyone in the group reads it.
- **Joining while you are away:** the request waits on your relay, sealed so that only your phone opens it, until
  Erevos is open on your phone: it looks every few seconds while Erevos shows, and about every minute in the
  background. Then it lets them in, and the group shows on their phone.
- **Who comes in:** **Anyone with the link**, or **An admin lets them in**: then whoever asks waits under **Asking to
  join**, for you or an admin to tap **Let in** or **Turn away**. Your phone still lets them in, once it hears.
- **Admins:** under **Members**, tap **Moderate** beside a member, then **Make an admin**. Admins mute, take out and ban
  members, let in who asks, and delete a message for everyone; only you moderate admins, and nobody moderates you.
  - **Mute:** their phone sends nothing in the group, and no phone shows what theirs sends anyway. **Let them write**
    undoes it.
  - **Take out:** they read nothing the group says from then on, and can ask to join again by the link.
  - **Ban:** taken out, and what their phone asks after is turned away. **Lift the ban**, under **Banned**, undoes it.
    A ban stops the same phone, not someone who comes back with a new relay queue: against that, choose **An admin
    lets them in**, or change the link.
  - **Delete for everyone:** the latest messages are listed at the bottom; **Delete** takes one off every member's
    phone. Whoever read it already may have kept a copy.
- **Change the link:** the link and QR code shared so far stop working at once, and every member gets the new one.
  Requests still waiting at the old one are lost.
- **Hand the group over:** under a member's **Moderate**. Their phone owns it from then on and lets people in, so the
  link changes to one on their relay; you stay an admin. If your phone is lost before you hand it over, no one can let
  anyone in again, though the group goes on for those in it.
- **Close the group** takes every member out. A member's **Leave the group** asks your phone to take them out.
- **A burner group,** for one event: before you make it, under **It ends**, choose **After a day**, **After 3 days**
  or **After 7 days**. When its time is up, every member's Erevos deletes it, each by its own phone's clock, with its
  messages, photos and files, the next time it is open, and its link stops working. When it ends is set as the group
  is made, and never changes. The group's own screen says when it ends. A member on an older {=Erevos} keeps it, and
  anyone may have kept a copy or a screenshot before then.
- **Up to 100 members,** as the whole group has to fit in the one message that lets someone in.
- **Every phone in a public group needs this version of {=Erevos}.** Groups made from contacts work as before.

**Why:** only the owner's phone changes the group and lets people in, so changes never race and no server has to put
them in order. That is why the group goes on without it, but no one new comes in: hand it over before you change
phones.

### What a public group gives away

> Anyone with the link can read the group from when they are let in, never what was said before, and the link can be
> passed on: change it to stop that.

- **The link** shows the group's name and your relay's address to whoever sees it.
- **Every member sees every member's** chosen name, a key made for this group alone, their relay's address and their
  queue's sender id. The key says nothing of who they are in their chats, nor which other groups they are in. The
  queue is one their public groups alone read on, not the one in their contact link, the same in each of their public
  groups (an Erevos before 2.0.0 says the one in its contact link).
- **Names are chosen, not proven:** anyone can call themselves anything. The start of each member's key shows beside
  the name, and the owner and the admins are marked.
- **Whatever is said can be copied** by anyone in the group: end-to-end encryption keeps the relays out, not the members.
- **The relays** read nothing and learn no one in the group. Yours sees requests come to the group's door, how many and
  when, not from whom. Members can fill each other's queue with what cannot be read, up to what the relay takes.

## How Erevos picks the path {#paths}

When you send a message, Erevos picks the path by itself:

1. **Their phone is near** (the top of the chat says **Nearby**): it goes over the nearby link, and through the relay
   too when there is one.
2. **Otherwise, with a relay:** it goes through the relay, and a short message also goes to the {=Erevos} phones linked
   nearby, so theirs can answer nearby if it is one of them. If the relay cannot be reached, that copy is the one
   that counts, and those phones carry it to your contact's relay too, as in [Chat with a nearby phone](#nearby).
3. **Otherwise, with no relay,** it goes to the {=Erevos} phones linked nearby, as in 2.
4. **And over LoRa,** when a radio is set and the relay could not take a text, as in [Over a LoRa radio](#lora). With
   no way at all, the message waits, marked **Waiting**, and goes by itself once there is one, as in
   [Sent, came and read](#relay); a line under the chat says why.
5. [~] **And by SMS,** last of all, when you turned it on for that contact and nothing else took a text, as in
   [SMS](#sms).

Every path is end-to-end encrypted: no relay and no phone in between can read what you send.

**Ways**, under **Settings** → **Relay and networks**, shows every path at a glance: a card for the relay, Nostr, the phones nearby, LoRa{~, SMS} and Tor, each with how it is now and a line under it, full when it works, faint when it is on but reaches no one now, and dashed when it is off. Above them it says how many of your messages wait to go, with an orange dot for each. A card opens the settings of its path. It shows only the space that is open, never hidden chats. On home, the line under the top bar is **Ways** too, once a relay is set: a dot for each way, and how many of your messages wait; a tap opens it.

| Line under the chat | What to do |
| --- | --- |
| **Sent nearby, end-to-end encrypted.** | Nothing: their phone is near and has it. |
| **Sent through the relay, end-to-end encrypted.** | Nothing: it is on its way. |
| **Sent to the {=Erevos} phones nearby, end-to-end encrypted, as the relay could not be reached.** | It comes only if one of them is theirs: wait for **✓✓**, or check the relay. |
| **… If their phone is not one of them, they hand it to their relay once they reach the internet, and so does this phone.** | Nothing: it comes once one of them, or this phone, reaches the internet. Wait for **✓✓**. |
| **Sent over LoRa, end-to-end encrypted, as the relay could not be reached.** | It comes if their {=Erevos} has a radio on the same mesh, within reach: wait for **✓✓**, or check the relay. |
[~] | **Sent by SMS, end-to-end encrypted, as nothing else could take it.** | Nothing: it costs SMS, and the phone company sees that you wrote to their number. **✓✓** comes once the relay or Nostr can be reached. |
| **Waiting. The relay cannot be reached (or There is no relay), and their phone is not near.** | Nothing: it goes by itself once the relay or their phone nearby can take it, and then shows **✓**. Without a relay, fill in its address, as in [Chat through a relay](#relay), or come near their phone. |
| **Waiting. It is too long for LoRa.** | Nothing: it goes once the relay or their phone nearby can take it. Or send it in shorter parts. |
[~] | **Waiting. It is too long for SMS.** | Nothing: it goes once the relay or their phone nearby can take it. Or send it in shorter parts. |
| **Not sent. The relay does not have this contact's queue any more.** | Ask them to write to you, or for their new contact link. |
| **This build cannot encrypt, so chats through the relay are off.** | Build the app again: this build is older than its encryption. |

## Erevos on your own servers {#own-servers}

Erevos does not need its maker's servers. LPHL's are only what it offers first: you can use your own for each thing
below, from inside the app, with nothing else to install on the phone.

- **Messages, photos and files:** they wait, end-to-end encrypted, on a small server called a relay. To use yours, or
  your group's: on **New chat**, **I have no invite**, then **I have a server of my own**, and type its address and
  the code you were given. Later, the same two are the relay address and the token under **For advanced users**.
- **Calls:** nothing more to set. The call relay comes with your relay, so with your own relay your calls go through
  your own server too.
- **Backups:** on **Backups**, **To a server too** sends each backup, encrypted, to a folder on a server you choose,
  such as your own Nextcloud. See [Backups](#backup).
- [~] **The Collection:** in its settings, **Also on a WebDAV server** keeps its encrypted files on a server you
  choose. See [Collection](#collection).
- **Speech and translation models:** where Erevos asks to download them, **Download from another server…** takes a
  web folder of yours that holds the same files. Erevos checks every file and refuses one that was changed.
- **No server at all:** **Start without a server** on the same screen. Texts then go through public Nostr relays, or
  straight between phones that are near. See [With no relay at all](#nostr).

**What still reaches LPHL:** only a phone whose relay is LPHL's asks LPHL's web server, once a day, whether a new
version is out (see [Told when a new version is out](#updates)); **Check for updates** asks GitHub. {~A contact
link made for a website and an invite by SMS open|A contact link made for a website opens} a page on LPHL's web server, which gets nothing of what the link
says: that part never leaves the phone. The same pages on another server are read too, when you paste or scan them.

**To set up a relay yourself:** see [Running your own relay](#own-relay), next.

## Running your own relay {#own-relay}

A relay you run yourself is the safest one, since whoever runs a relay sees who connects to it. The source code
has everything in \`deploy/relay\`.

- **On your own network:** run the relay on a computer, open port 7879 in its firewall, and type
  \`ws://<its address>:7879\` on every phone. Close the port again when you are done.
- **On the internet:** a server (VPS) with Debian 12 or Ubuntu 22.04 or later, a domain name (or a free
  \`sslip.io\` name) and ports 80 and 443 open. One command installs the relay behind Caddy, with a certificate from
  Let's Encrypt and a random token. Every phone then uses \`wss://<your domain>\` and that token. The same command
  sets up the call relay for calls, which needs port 3478 and the UDP ports 50000 to 50999 open too.

Queues and waiting messages are kept on the server's disk, and so are the encrypted pieces of photos and files until
they are taken (1024 MB together at most), so a restart loses nothing, and no request is logged.
Messages sent for later are kept there until their time too, 10,000 or 256 MB at most: the relay sees when
each is to go, not what it says.

**Why:** what the relay keeps has limits, so the phones that use it cannot fill its disk or its memory.

**Its own key:** the relay's key file (\`EREVOS_RELAY_KEY\`, which the one command sets up) is what it proves on every
connection, so phones know it by that key rather than by its certificate (see [The relay's own key](#relay)). Keep that
file, in its backups too: with a new one, every phone that knew the old key refuses the relay until someone taps **It
has a new key** on it.

**Invites:** the relay can let each phone have a token of its own, in a file of tokens, and then let those phones invite
more, each invite for one phone (see [Invites to the relay](#relay)). Turn it on with \`EREVOS_RELAY_INVITES=on\` beside
\`EREVOS_RELAY_TOKENS\`; the relay then writes the lines of invited phones in that file itself, with who invited them
and when, and taking a line out cuts that phone off, that one alone: the phones it invited keep theirs, so to take those
off too, delete each of their lines (each says who invited it). It lets in 100 phones by invite at most
(\`EREVOS_RELAY_MAX_INVITED\`). \`erevos-relay free-line NAME\`, run with the relay stopped, makes a line one of yours:
the phone that invited it can no longer take it back, and it no longer counts among the 100. A phone that comes with the
relay's token (\`EREVOS_RELAY_TOKEN\`) asks once for a line of its own, which the relay adds as one of yours, saying it
came with the relay's token and when, 50 a day at most: so you can hand out that token, delete any one phone's line, and
then change the token without cutting off the others. \`deploy/relay/README.md\` says how.

**Signing in:** with a file of tokens, the relay can also let phones sign in with an OpenID Connect provider, such as
Authentik, for a token of their own, and checks each account every hour, taking its phones off after 3 days without an
answer and two more checks of each phone that fail an hour apart (see [Signing in to the relay](#relay)). One browser
may start 10 sign-ins a minute. With \`EREVOS_RELAY_OIDC_GROUP\`, only the accounts in that group may.
It needs a client at the provider, a few settings, and \`/signin/\` passed to the relay as plain HTTP:
\`deploy/relay/README.md\` says how.

> Never post the token where others can read it. Whoever runs the server sees the IP addresses that connect, the
> queue ids, and when and how much arrives. They cannot read the messages, which are end-to-end encrypted.

## Home relay {#home-relay}

Under **Settings** → **Relay and networks** → **Home relay**, a space can have a second relay with a queue of its own:
one at home, on a Raspberry Pi or an old computer, or any other relay you trust. It is optional.

- **What it does:** your contact link and every message say that queue beside your relay. While your relay cannot be
  reached, contacts write there, and Erevos takes what comes there with each look. What you send goes through it
  when your own relay is down.
- **How to set it up:** run a relay as in [Running your own relay](#own-relay), type its address (and token, if it
  has one) and choose **Save**. Contacts learn it from your next message to them, or from your new contact link.
- **What it sees:** what your relay sees, this phone's address when it takes messages (but not when it is only through
  Tor), and when and how much comes. Hidden chats do not use it.
- **Only through Tor:** a switch for each home relay. That relay never sees this phone's address, whatever Tor is set to
  for the rest. With no token typed, it gives a token for a coupon: your relay, the space's own, signs the coupon blind,
  so neither relay can tell whose the token is. The coupon is taken up to an hour after it was signed, at a random time, so
  the times the two relays saw do not match, and the token comes from the home relay within the hour. The token lasts 90
  days, and Erevos takes a new coupon by itself on a random day between day 30 and day 60. A limit: with few phones on a relay, whoever runs both
  could still guess by the times alone. So two spaces (see [Second password](#second)) can each use the other's relay as
  their home relay, and no relay ties them together. Both relays must have coupons turned on, and it needs a build with
  Tor, on Android (see [Through Tor](#tor)).
- **Automatically from your relay:** a switch, off unless you turn it on, on Android, where Erevos has Tor. When your relay
  names a relay paired with it (its operator sets that up), a space with no home relay takes that one by itself, only
  through Tor, with its token from a coupon as above: nothing to type, and nothing to do when your relay names another.
  Turning it off lets go of the home relay it took, and removing the home relay by hand turns it off for that space; a home relay you typed yourself stays as it is. Hidden
  places never take one so.
- **For hidden chats:** each hidden place can have a home relay of its own, under **For advanced users** on its
  screen with no chat picked, while it is open. It is kept with that place only, sealed with its PIN, so the space knows nothing of it, and it is looked
  at while the place is open. Use another relay than the space's: one relay seeing both queues would tie them
  together.

**More than one:** **Add another home relay** gives up to two more, each with a queue of its own, for example one at
home and one at a friend's. Contacts try them in the order shown, and Erevos takes what comes on each. Your contact
link names the others only while it stays short enough for one QR code; the rest reach contacts with your next
message. A contact with an older {=Erevos} uses only the first.

## Through Tor {#tor}

Under **Settings** → **Relay and networks** → **Tor**, **What goes through Tor** chooses which of this space's
requests to its relays go through the Tor network. Each space has its own choice:

| Choice | What goes through Tor |
| --- | --- |
| **Nothing** | Unless you change it. The relay and the Nostr relays see your phone's IP address for everything. |
| **Messages** | What you write, and what tells your contacts something, such as that a message was read. Pictures, files and voice messages go straight, which is faster: for them the relay sees your phone's IP address. |
| **Everything** | Files too. Nothing goes to a relay without Tor. |

**Why:** a new space starts with **Nothing**, as Tor makes messages slower; a space made before keeps its choice. With
**Messages**, what you write is hidden by Tor and never waits for it, while pictures, files and voice messages, which
are large, go straight and so faster.

- **Turning Tor on:** from **Nothing** to **Messages** or **Everything**, Erevos first asks **Turn Tor on?** and says
  that messages get slower; **Cancel** keeps **Nothing**.

- **One chat only through Tor:** in an Erevos chat, **Details** → **Through Tor** sends that chat's messages and files
  only through Tor, on Tor circuits of its own, whatever this space's choice; it is off unless you turn it on. The
  relay then does not see your phone's IP address for that chat, and no Tor exit carries it together with another
  chat. It is slower, and what goes waits while Tor starts. Calls do not go through Tor. Hidden chats have it too,
  each in its own **Details**.
  It is the same on your linked devices: switched on or off on any of them, it is switched on or off everywhere. On a
  device without Tor, such as the web app, that chat sends nothing while it is on.
  It covers that chat's Nostr texts and its photos and files on Nostr file servers too, even when this space's choice
  is **Nothing**: Tor is started for them, and nothing goes straight. Until your contact first writes to the chat's
  own queue, their first messages come to the space's own queue, which is read the space's way. See [Who sees your
  internet address](#ip).

- **What it hides:** the relay no longer sees your phone's IP address, only a Tor exit (or nothing, for a relay
  with a \`.onion\` address). Your phone company or the Wi-Fi sees only that you use Tor, not which relay.
- **What it costs:** what goes through Tor comes and goes slower, and the first start of Tor takes a while. The screen
  shows how far Tor is. To spare the battery, Erevos sends the reduced padding Tor made for phones: the filler Tor
  sends to hide when you talk goes every 9 to 14 seconds, not every few, and none comes to the phone.
- **What it does not cover:** calls, whose sound and picture go straight between the phones or through the call
  relay; nearby phones{~ and SMS}, which do not use the internet.
- **On Android only:** {=Erevos} on a computer and the web app have no Tor yet, so there everything goes straight.

> With **Messages**, a message never waits for Tor: one Tor could not take to the relay goes straight at once, and so
> do messages while Tor starts, or for a minute after it could not reach the relay; then Tor is tried again. With
> **Everything**, nothing goes to a relay without Tor:
> when Tor cannot reach the relay, the message waits and is tried again; Erevos never falls back to your own
> connection by itself.

### Bridges

Where Tor itself is blocked, **Bridges** on the same screen lets Tor reach its network through bridges instead. It
is **No bridges** unless you choose, each space has its own, and it counts only while something goes through Tor.

| Choice | What it is |
| --- | --- |
| **Automatic** | Erevos tries the ways in turn until Tor connects: straight, the obfs4 bridges, Snowflake, then your own lines, if any. It remembers for 30 days the one that worked on Wi-Fi and on mobile data, and tries it first; on another network it looks again. With **My network is watched** on, it never tries straight, so the network sees only a bridge. |
| **obfs4** | The obfs4 bridges Tor Browser comes with. To whoever watches the network, Tor looks like random bytes. A censor that knows them may block them. |
| **Snowflake** | Through volunteers' browsers, over WebRTC, the way a video call goes. To find one, Erevos asks Snowflake's broker through a CDN, behind another site's name, and STUN servers tell the phone its own address: they see that address, never your messages. Slower, and hard to block. |
| **My own** | Bridge lines from bridges.torproject.org, from bridges@torproject.org by email, or from @GetBridgesBot on Telegram, pasted one per line; then tap **Use these bridges**. obfs4, Snowflake, WebTunnel, meek and plain bridges work. |

- **Only through them:** with bridges, Tor never goes straight to its relays. When no bridge answers, with
  **Everything** messages wait, as they do when Tor cannot reach the relay; with **Messages** they go to the relay
  without Tor until one does. Lines that are not bridges are not taken, and Tor stays off.
- **Check my connection**, under them, says whether Tor connects, and which way, never this phone's address. With
  **Automatic**, it looks again from the start.
- **Changing them** while Tor runs closes its connections and makes them again the new way.
- **On Android only:** the app carries lyrebird, Tor's own program for obfs4, Snowflake, WebTunnel and meek. A
  computer and the web app have no Tor yet, so no bridges either.

## Through Nostr {#nostr}

Under **Settings** → **Relay and networks** → **Nostr**, **Texts through Nostr** is **On** unless you change it. Then
what you write to a contact whose {=Erevos} reads on Nostr too goes through your relays first: your relay, then their home
relays, then your home relay; and through public Nostr relays only when none of them took it. Each space has its own
choice, and its own Nostr relays.

- **How it is sealed:** end-to-end encrypted as always, then sealed once more for a key your contact gave this chat
  alone, and signed by a key made for that one text (a NIP-59 gift wrap). The Nostr relays see that someone wrote to a
  key that names no one, when, and how big; not who wrote it, nor to whom. Your relay does not see what went that way.
- **What the Nostr relays can tell:** your phone asks each of them for all its keys at once: a relay can tell that those
  keys are read together. Through Tor, never from where: each relay is reached on Tor circuits of its own, so no Tor
  exit carries what goes to two of them, and none can tell it is one phone's. With **Nothing** it goes straight, so
  they see your phone's IP address, still not who wrote to whom. Some relays refuse some Tor exits, and some exits
  cannot reach a relay: after a failure like that, the next try goes through another exit.
- **How it goes:** with **Nothing**, texts go to the Nostr relays straight. With **Messages**, through Tor once Tor is
  ready, and through your relay while Tor starts. With **Everything**, only through Tor. When the way changes, the Nostr
  connections close and open again the new way.
- **Nostr through Tor:** on the **Nostr** screen, **Nostr through Tor** is **Off** unless you turn it on. **On**,
  Erevos reaches the Nostr relays and the Nostr file servers only through Tor and starts Tor for it, even when the
  space's Tor is **Nothing**; a text that goes there waits while Tor starts. It only adds Tor: with Tor on for the
  space, Nostr goes through Tor whatever this says, and a chat set to **Through Tor** goes through Tor whatever this
  says. See [Who sees your internet address](#ip).
- **The relays:** relay.damus.io, nos.lol and relay.primal.net unless you change them; you can add your own, five at
  most. Your contacts are told the relays you read on, and write to you there; one that takes a text is enough.
- **What stays on your relay:** calls, reactions, and the marks that a message came or was read; and what you write to contacts on an iPhone or a computer, which do not read on Nostr. Pictures, files and voice messages go through your relay when one is between you; with no relay between you they go through Nostr too (see With no relay at all).
- **Which way it went:** hold a message: its menu says **Went through Nostr** or **Came through Nostr** when a Nostr
  relay took it. From now on it also says **Went through the relay**, **Came through the relay**, **Went to their phone
  nearby**, **Came from a phone nearby** or **Went over LoRa**; a message from before says nothing. The note under the
  messages says **Sent through Nostr** too. Two phones side by side give each other texts nearby first, then through
  the relays; Nostr carries a text only when the relays did not take it.
- **What the relays did last:** the **Nostr** screen shows, for each relay, whether it took the last text it was given
  and how many seconds after, or why not, and whether your phone reads on it. It is kept on this phone only, until
  Erevos closes. A text never waits for the Nostr relays while your relays take it.
- **On Android only,** as Tor is.

**Why:** the Nostr relays are public, so when Tor is on for the space Erevos reaches them through Tor, and they never
learn where your phone is; with **Nothing** it reaches them straight. Only texts go there, as the backup of your
relays: a text that went there goes through your relay again should it not come, while the marks that a message came or
was read would have none, and a message sent for later needs your relay to hold it until its time. With no relay between
you, pictures, files and voice messages go there too (see With no relay at all).

> A text that went through Nostr goes through your relay again should your contact's phone not say within five minutes
> that it came, and they see it once. When neither your relays nor a Nostr relay takes it, it waits and goes again, as
> any message does.

- **Hidden chats:** they read on Nostr too, while they are open, and closed as well while **Receive while closed** is
  on for them and the space is open (see [Hidden chats](#hidden)). Closed, they still show "New message": with each
  text through Nostr, your contact also sends your relay a bell, a message that says nothing, which your relay counts
  as one, as before. With no relay, their contact link and QR code say where they read on Nostr, with a key of that
  place alone, and texts, reactions and the marks that a message came go there, as from a phone with no relay.

### With no relay at all {#nostr-only}

A phone with no relay, no invite and no LPHL account can still begin: its contact link and QR code say where it reads
on Nostr, and that is enough to talk.

- **To begin:** on **New chat**, under **For advanced users**, tap **Start without a server**, then **Show my QR code**
  or **Share my contact link**, and give it to someone who uses {=Erevos}. Who adds it writes to you through Nostr, and
  shows as a message request, which you accept. You can add their link or QR code too, the same way.
- **What goes:** texts, stickers, reactions, edits, and the marks that a message came or was read, all through Nostr; and photos, files and voice messages too. A voice message goes in wraps like a text. A photo up to 3 MB goes in pieces of 32 KB, a wrap each, sent before the message that offers it; the other phone keeps them, encrypted with the rest of the space or the hidden chats they came for, until all have come, four days at most. A larger photo, a video or any other file, up to 20 MB, goes as one blob, encrypted on the phone, to a Blossom file server (blossom.primal.net, blossom.band or nostr.download), through Tor as the space's Tor choice says (straight with **Nothing**): the server keeps only what it cannot read. Calls and groups need a relay, or the other phone nearby. Hidden chats work so too, through Nostr only (see [Hidden chats](#hidden)).
- **When it does not come:** the Nostr relays keep a text for two days. Until your contact's phone says it came, Erevos
  gives it to them again once a day, for two weeks.
- **A relay by itself:** when your contact has a relay that lets them invite, their {=Erevos} sends yours an invite to it
  by itself, once, in the chat, whether you first met through Nostr or nearby, over Bluetooth, Wi-Fi or a QR code.
  Your phone takes it by itself, and from then on photos, voice messages and calls work too, with everyone. It counts
  as one of their invites. Someone whose message request you have not accepted chooses no relay for you: their invite
  waits until you accept them, a week at most.
- **An older Erevos** does not read the Nostr part of a link: it reaches you nearby only, until you have a relay.

**Why:** Nostr is only the way in. No one needs an invite to begin, and once one of you has a relay, it carries what
is too big for Nostr.

## Who sees your internet address {#ip}

Your phone's internet address, its IP address, shows roughly where you are and which provider you use. It does not
show what you write. Whoever your phone connects to sees it, unless the connection goes through Tor.

- **Your relay and your contact's relays:** they see it. To hide it, turn Tor on for the space (**Settings** → **Relay
  and networks** → **Tor**), or turn on **Through Tor** in one chat's **Details**. See [Through Tor](#tor).

- [+] **XMPP:** your XMPP server sees it while Erevos is connected, unless the account goes through Tor; the servers of
  your contacts and groups do not, as your server carries your messages to them. Erevos warns before you send in a chat
  while the account does not go through Tor (with **Through Tor** for that chat as the fix), before every call, and
  before fetching a file from another server than yours. See [XMPP](#xmpp).

- **The public Nostr relays and the Nostr file servers:** they see it unless the connection goes through Tor. Turn on
  **Nostr through Tor** under **Settings** → **Relay and networks** → **Nostr**, or **Through Tor** for one chat. See
  [Through Nostr](#nostr).
- **A code of 8 digits**, under **Near me** and **I have their code**: the two phones meet on those same public Nostr
  relays, so without Nostr through Tor they see the address, though not the code or the contact links. Erevos says so
  before the first one.

- [+] **Matrix:** only your own Matrix server sees it, not your contacts' servers: photos and files from other servers
  come to you through yours too. Choose **Tor for this Matrix account** on the Matrix screen, or turn on **Through
  Tor** under a chat's buttons, which takes the whole account through Tor. See [Matrix](#matrix).
- [+] **Telegram:** Telegram's servers see it, unless the account goes through Tor: choose **Always through Tor** under
  **Tor for this Telegram account** in Telegram's settings, or turn on **Through Tor** in one chat's info, which sends
  the whole account through Tor. See [Telegram](#telegram).
- [+] **Chats with other Nostr apps and the Public feed:** their relays and file servers see it unless the account goes
  through Tor (**Tor** on the **Nostr chats** screen) or the chat's **Through Tor** is on. Posting, liking or voting in
  the Public feed, and its photos and link previews fetched without Tor, show it too. See [Chats with other Nostr
  apps](#nostr-chats).
- [+] **Messenger, Signal and Session** (Erevos+): their own servers see it (Meta's, Signal's, or the first Session node),
  not your contacts, unless the account goes through Tor: choose **Always through Tor** under **Tor for this …
  account** on its screen, or turn on **Through Tor** in one chat, which sends the whole account through Tor. Signing
  in, Signal's captcha, Messenger's pictures and **Open Facebook** go the same way. Erevos warns before you send in a chat while the
  account does not go through Tor, and before every call. See [Messenger](#messenger), [Signal](#signal) and [Session](#session).

- **Calls:** they never go through Tor. The call relay, yours or your contact's, sees the address, though not what is
  said. A call between phones nearby on the same network stays on that network.

- **A file on a server your contact chose:** the server sees the address when your phone fetches the file. Tor hides
  it.

- **Web links you open:** the site sees it, as any web page does. To hide it, open links in Tor Browser. A link's
  preview is fetched from its site too, and the site sees the address the same way.
  With **Through Tor** on for link previews, it does not.

- **A contact's relay:** while your space has no relay of its own, or only a place lent on one, a contact can give
  you a place on theirs, and it comes with their message. Their relay then sees the address, so Erevos asks before it
  takes it, unless the space sends everything through Tor. Not taken, the invite is let go.

- **Groups:** a message in an Erevos group goes through a server, which sees the address. Tor for the space hides it;
  a group has no switch of its own.

- **Backups, {~the Collection's server, radio and TV lists, |}link previews and updates:** each has its own **Through
  Tor** switch, in its own screen, off unless you turn it on. See [Backups](#backup), {~[Collection](#collection), |}[Chat
  through a relay](#relay) and [Updates](#updates).

- [~] **Radio stations and TV channels:** each sees the address while it plays. **Play through Tor**, in the Collection's
  settings on Android, off unless you turn it on, plays them only through Tor. See [Collection](#collection).

Erevos warns once before each of these, with the title **Your internet address can be seen**, a **Guide** button that
opens this section and, where it can, a button that fixes it, such as **Through Tor for this chat**. **Go on** goes
on. For what you send, it is said once for the whole network, not in each chat: after that, a chat or group that goes
without Tor shows only a quiet line above where you write, **Without Tor: the relays see your internet address.**,
with **Through Tor for this chat** and **Guide** beside it.

After the guide, the same question comes back, and what you were sending, such as a voice message or a file, waits
for it. A call that rings here says it under the call, and answering goes on. Hidden chats keep what was said with
them, apart from the space.

Nearby phones{~, LoRa and SMS| and LoRa} do not use the internet, so they show no internet address.

## Matrix {#matrix}

Under **Settings** → **Relay and networks** → **Matrix**, a space can sign in to a Matrix account, to chat with people
who use Element or another Matrix app. Erevos talks to the Matrix server itself, as Element does: no bridge sits in
between.

- **Signing in:** your Matrix ID, such as @name:matrix.org, and its password. Erevos becomes a new device of the
  account, named Erevos. The sign-in and the device's keys are kept sealed in this space, and are in backups: after a
  restore, the space signs in again, as a new device. Its hidden chats can have a Matrix account of their own, see
  [Hidden chats](#hidden).
- **Single sign-on:** on Android, when your Matrix server signs people in elsewhere (as matrix.org asks of new
  accounts), **Sign in with single sign-on** opens the browser on that page, and it comes back to Erevos once you
  signed in there; a server with several providers lets you pick one. The browser does not go through Tor, so that
  page sees your address. As there is no password to give, Erevos makes the account's cross-signing keys only when the
  server takes them without asking again; otherwise check this device by emoji or QR code from another of yours, or
  enter the Security Key.
- **Chats:** **New chat** starts an encrypted chat with a Matrix ID. Invites show first, with **Join** and **Decline**.
  Write a name instead of a Matrix ID to look for people in your Matrix server's user directory, which learns who you
  looked for; **Start** begins the chat with the one you tap.
- **Groups:** **New group**, on the Matrix screen, makes an encrypted group from a name and the Matrix IDs you write,
  each asked to join, as Element makes one; everyone in it sees who the others are. **Join a group** joins one by its
  address, such as #name:matrix.org. A public group may not be encrypted, and its screen then says so. In a group,
  **Invite** asks someone else to join, if the group lets you.
  Typing **@** in a group offers its members; a message names those written whole, so their apps tell them of it.
- **Members:** in a group, **Members** lists its people and shows who is the **owner**, an **admin** or a **moderator**,
  as their power levels say. Where your level allows, you rename the group, set its **Subject**, **Make admin** or
  **Remove as admin**, **Take out** someone (the group's messages no longer reach them) or **Bar** them (they cannot
  join again until an admin lets them).
- **Encryption:** messages are end-to-end encrypted with Matrix's own encryption (Olm and Megolm, through vodozemac).
  A chat that is not encrypted says so.
- **Not anonymous:** the Matrix server sees your account, who talks with whom and when, and, without Tor, from where.
  In a chat with people on other servers, those servers see it too.
- **Through Tor:** on Android, the Matrix screen, before signing in too, has the Tor choice every account has:
  **Off** (the default) goes straight, and the Matrix server sees your address; **As the space** follows **Settings**
  → **Relay and networks** → **Tor**: with **Messages**, through Tor once it is ready and straight while it starts,
  photos and files straight; with **Everything**, all of it only through Tor; **Always through Tor** sends this
  account only through Tor, signing in too, and nothing without it. Tor uses the space's bridges. A chat's
  **Through Tor**, under its buttons, makes the whole account go only through Tor while it is on: Matrix has one
  connection for all chats of an account. Calls never go through Tor.
- **Messages from before:** a message sent before Erevos signed in, or one whose key has not come yet, shows as locked.
- **Photos and files:** **Photo** and **File** send them, up to 50 MB, encrypted on the phone before they go to the
  Matrix server, so it keeps only what it cannot read. A photo you get is fetched only when you tap **Show photo**;
  **Save** keeps any file on the phone.
  Tap a photo that shows to see it on the whole screen, as in a contact's chat: two fingers or a double tap zoom in,
  it turns with the phone, and **Save** keeps it (see Photos and files, under [Chat through a relay](#relay)).
- **Stickers:** a sticker that Element, FluffyChat or Element X send shows in the chat; **Show sticker** fetches it
  through your Matrix server. **Sticker** sends your own stickers made from photos (**Mine**) as pictures, encrypted
  where the chat is. The built-in sets are there too: each sticker goes as its picture, made on your device, with its
  words for apps that show only those.
- **Reactions, answers, changes and deleting:** hold a message to open its menu: pick a reaction at the top, **Reply**
  to answer it, **Copy** its words, and for a message of yours **Edit** or **Delete** it. An answer shows the message it
  is to above its words, and a tap on that goes to the message. Reactions show under a message; tap one to react the
  same, or tap yours to take it back. They are not encrypted, as Element sends them, even in an encrypted chat: the
  Matrix server sees which message got which reaction, and from whom. Only you can change your own messages, and a
  changed one says **Edited**. **Delete** takes a message of yours back for everyone in the chat, once you confirm; it
  cannot be undone, and the chat keeps a line saying it was deleted.
- **Several messages:** **Select**, in a message's menu, chooses it, and a tap adds others; then **Copy**, **Forward**
  or **Delete**. **Delete** takes them back for everyone in the chat, after you confirm: yours and, where your level
  allows, those of others. It cannot be undone.
- **This phone or everyone:** **Delete**, for one message or several, asks first: **This phone** deletes them here
  only, and they stay hidden if they come again; **Everyone** takes them back as said above, offered only when each of
  them can be taken back.
- **Writing:** who is writing in the chat now, as the Matrix server says, shows under it with **typing…**. Erevos says
  it of you only if you turn on **Say when I am writing** on the Matrix screen; it is off at first, as it goes through
  the Matrix server not encrypted, so the server learns each time you write.
- **Online:** in a chat with one person, under their name it says **Online**, **Away** or **Do not disturb**, with the
  words they set, or when they were last online, as their Matrix server says, and their picture in the chat list has a
  green dot while they are online. Some servers do not say it. Erevos says it of you only if you turn on **Say when I
  am online** on the Matrix screen; it is off at first, as it goes through the Matrix server not encrypted.
- **Marks:** your messages show **✓** once the Matrix server took them and **✓✓✓** once every other member of the chat
  read them, as each one's Matrix app tells their server (read receipts). Matrix has no mark for a message that
  reached a phone, so there is no **✓✓**. Hold a message of yours down and choose **Who read it** to see who read it
  and when, and who has not (the first 100). A Matrix app can be set to send no read receipts: its member then shows
  as not having read.
- **Profile pictures:** a Matrix room, or the person in a chat with one person, shows their picture in the chat list,
  and so does an XMPP contact. **Choose a photo**, on the Matrix screen, sets yours for your contacts; **Remove**
  takes it away. Pictures are not encrypted in any Matrix or XMPP app: the server sees them, and your contacts see
  yours.
- **Earlier messages:** a chat with more history on the Matrix server shows **Load earlier messages** at its top; each
  tap fetches more, and the chat stays where you were reading. A message whose key has not come yet shows as locked.
- **Voice messages:** press and hold the microphone under the message box to record, and let go to send; slide left
  before you let go to drop the recording. A minute is the most, and a press of under a second sends nothing. With
  TalkBack, tap it once to start and again to send. In an encrypted chat it is encrypted like a photo, and Element and
  other Matrix apps play it as a voice message. One that comes plays with **Play**, and is fetched only when you play
  it. Its waveform goes with it, as Element draws one, and one that comes with a waveform shows it under **Play**,
  coloured as it plays.
- **Check by emoji:** in a chat with one person, **Check by emoji** shows you both seven pictures; if they are the
  same, in the same order, tap **They match** on both phones. Nobody can then sit in between unseen, and the chat
  says **Checked by emoji**. **Check this device with another of yours**, on the Matrix screen, does the same with
  your own Element, so it trusts Erevos's device. Element can start either one too.
- **Check by QR code:** once both sides accepted a check, and both apps can do it, the card shows a code and
  **Photograph their code**. Let the other app photograph the code shown here (in Element: **Scan**), then answer
  **Yes, it does** when it says the check went well; or photograph the code their app shows. **Compare emoji instead**
  goes the other way. The code holds the two accounts' (or devices') keys and a one-use secret, so a code from anyone
  in between does not fit. Nothing is trusted until both sides said done.
- **Security Key:** under **Security Key** on the Matrix screen, enter the Security Key (or Security Phrase) Element
  made: earlier messages open from the account's key backup, new keys go into it, and your other devices trust this
  one. An account with none can **Set up a Security Key** here; write it down, as Erevos does not keep it.
- **Calls:** the two tiles at the top of a chat call by voice or with video, with Element Call, the call app of Element
  and Element X, which Erevos carries inside it and shows over the app, in a window of its own: on Android, in the web
  app and on a computer (Windows, macOS and Linux). Its back arrow, or the Escape key, makes it small, in a corner over
  Erevos, so you can keep using Erevos during the call; a tap on the small window brings it back to full size. Until
  the call has started, a **Close** button under it ends it, in case it never starts. Calls to you ring here as
  Erevos's own do, while this space is open: **Answer** opens Element Call into the call, **Decline** tells the caller.
  Sound and picture are end-to-end encrypted, with keys only those in the call have, and go through the media server
  (LiveKit) your Matrix server names, which sees this device's address; a Matrix server without one cannot call. What
  Element Call says to the Matrix server goes through Erevos, and through Tor as the rest of Matrix does, but the call
  itself never goes through Tor. Element Call reaches no tracker. Older one-to-one Matrix calls, as FluffyChat makes them, ring here too (see **Older calls**). While a Matrix call is on or ringing, another call, Erevos's own or on XMPP, does not ring
  and shows as missed, and the other way round. On Android, Back or leaving Erevos makes the call window small over
  other apps (picture in picture). Sailfish OS has no Matrix calls.
- **In the web app and on a computer:** the browser or the computer asks once for the camera and the microphone; on a
  computer, only the call window can use the camera. Where the sound goes, and which microphone, are the computer's or
  the browser's own to choose. In the web app, Element Call comes from a second address of its own,
  erevos-call.lphl.nekten.eu, and on a computer from a separate part of the app, so it can read nothing of Erevos: not
  its keys, not its chats. The web app checks Element Call's files against the same signed release as the app itself
  before it runs it, so the first call in the web app takes a moment longer, while it gets and checks Element Call.
  **Why:** Element Call's code is not written by Erevos, so it runs apart from Erevos, where it can never get near its
  keys and chats.
- **Notifications:** a message that comes shows a notice and counts in the number on Erevos's icon, as in Erevos's own
  chats, while this space is open; on a computer, while Erevos runs. On Android, **Notifications** at the bottom of a
  chat mutes it or gives it a sound of its own; a muted chat is not counted. **Chat look** beside it gives the chat a look
  of its own.
- **Chat options:** the sliders button beside where you write, or **⋯** at the top, opens them all in one tidy list,
  in reach however long the chat: **Notifications**, **Chat look**, the PIN, screenshots and disappearing messages
  under **This chat**, then search, media, a day and export under **Find**.
- **While this space is closed:** on Android, **Say a message came** under **While this space is closed** on the Matrix
  screen lets this space say "New message" when something comes on Matrix while another space is open, as its own
  chats do with **Also while another space is open** under **Settings** → **Notifications** → **In the background**,
  which it needs too. It never says what, from whom or in which chat, and a call does not ring then: only the space's
  key opens what came. For it the Matrix server tells this space's relay of each message, with no words in it, so the
  Matrix server learns the relay's address, and the relay when messages come. Off unless you turn it on; it needs a
  relay updated for it, which the Matrix server can reach.
- **Threads:** hold a message and choose **Reply in thread** to answer it in a thread. A thread opens on a screen of
  its own, and a message with answers says how many; tap it to open the thread. Apps without threads show the answers
  as plain answers.
- **Polls:** **Poll**, under **+**, asks a question with several options. Tap an option in the bubble to choose it,
  and tap again to take it back; everyone sees who chose what. Whoever made a poll can hold it and choose **End
  poll**: no vote counts after that.
- **Places:** **Location** sends where you are, once, as Element does; it goes encrypted as the chat is, and shows
  with **Open in maps** on Android.
- **Link previews:** with **Link previews** on, as for your contacts' chats, the first link in a message goes with a
  preview your phone made, in an encrypted chat encrypted too. Through Tor only with **Through Tor** on under **Link previews**, and never in a hidden place.
- **Pinning and forwarding:** **Pin**, in a message's menu, pins it to the top of the room for everyone, if the room
  lets you; a bar over the chat shows the latest pinned message, and a tap goes to it and then shows the next.
  **Unpin** takes it down. **Forward** sends a copy to another chat of this account; the copy shares nothing with the
  original. A chat that is not encrypted says so beside its name, as its server reads a copy sent there.
- **Finding groups:** **Find a group**, on the Matrix screen, looks through the public rooms of your Matrix server, or
  of another one you write, which then learns what you look for. **Spaces** lists the rooms in the spaces you are in,
  to join. **Search messages** looks only through the messages kept on this phone, and asks nobody.
- **Favourites:** hold a chat in the list for **Make a favourite** (it goes first), **Low priority** (it goes last)
  and **Leave and forget**, which also has the Matrix server forget it, so your other Matrix apps no longer show it.
  They are kept in your account, so your other Matrix apps sort the same.
- **A new account:** on the sign-in screen, **Make a new account** makes one on a Matrix server that allows it, from a
  server, a name and a password. If the server asks, Erevos asks you to agree to its terms, to give a registration
  token, or to take a step on the server's own page, such as a captcha, which opens in the browser, not through Tor. A
  server that asks for an e-mail address makes accounts only on its website; make one there, then sign in here.
- **Devices:** **Devices**, on the Matrix screen, lists the account's devices with when each was last seen. **Rename**
  gives one a new name. **Sign out the other devices** takes them off the account: they lose their keys and can no
  longer read what comes. The Matrix server asks for your password first.
- **Older calls:** in a chat with one person, the call tiles ask for **Element Call** or **Older call**. The older
  call works with FluffyChat, Nheko and Element on a computer, and rings here when they call. Its signals go as the
  chat does, encrypted in an encrypted chat, through your relay when the space has one, else through your Matrix
  server's call relay; the call itself is encrypted (DTLS-SRTP).

**Why:** Erevos's own chats hide who talks with whom; a Matrix server cannot. So Matrix chats are kept apart and
marked, for the people you would otherwise reach only on Matrix.

- **What a message carries:** the marks for how words look, such as bold and hidden words, show as in an Erevos chat
  (see [Chat through a relay](#relay)), and go with the message, so Element shows them too. Of what another app sends,
  only bold, italic, struck through, code and hidden words show: nothing in it runs, no picture is fetched, and a link
  shows where it really goes. Web addresses can be tapped, and Erevos asks before opening one. Beside **Photo** and
  **File** are **Camera**, **Video**, **Contact card** and **Photo quality**: a contact card goes as a .vcf file that
  any app opens, and one that comes shows as a card once you tap **Show**, with **Add to contacts**; a video goes
  without the parts that say where it was filmed or on which phone. A message you forward is marked **Forwarded** on
  your phone only, so the others never learn where it came from.
- **Pinned, last and named:** pinning a room makes it your favourite on Matrix, so your other Matrix apps show it
  pinned too, and rooms of low priority come last. On the home list your last message shows ✓✓✓ once everyone in the
  room has read it. **Name them here** (a person) or **Name it here** (a group), at the foot of the chat, gives a room
  a name of your own, only on this phone; nobody is told.
- **Drafts:** what you type and do not send stays as the chat's draft, encrypted on this phone only. It comes back
  when you open the chat again, also after Erevos closed, and the home list shows it on the chat's row as **Draft**. A
  Matrix thread keeps no draft of its own.
- **Send later:** hold **Send** down, or, with the message typed, tap **+** and then **Send later**, and choose a time
  (**In 1 hour**, **Tonight 20:00**, **Tomorrow 09:00**, or any day and time) and tap **Send later**. The message
  waits on this phone, encrypted, shown dashed after the chat's messages with its time, and goes from this phone at
  that time while Erevos is unlocked, on Android in the background too; otherwise as soon as it is unlocked again.
  Text only. Tap it to send it now or delete it. In hidden chats one goes only while they are open, unless they
  receive while closed. One that a restored backup brought back, whose time came before the restore, does not go by
  itself: the phone the backup came from may have sent it already.
- **Send again:** a message of yours that shows **Not sent** has **Send again** and **Delete** in its menu.
- **Remind me:** a message's menu has **Remind me**. Pick a time: the message, with the name of its chat, goes into
  **Chat with myself** and reminds you then. It needs **Erevos** on in [Modules](#modules).
- **Disappearing messages:** **Disappearing messages**, in **Chat options**, sets a time for new messages, sent or
  received: 5 minutes, 1 hour, 1 day or 1 week after each was sent. Then they go from this phone, and yours are taken
  back for everyone in the chat too (their apps show them as deleted), or as soon as Erevos runs again. What the
  others sent stays with them. **Disappearing message**, under **+**, does it for the next message only. Messages
  already in the chat stay.
- **Blocking:** **Block**, in a chat with one person, adds them to your account's ignore list: nothing of theirs
  reaches your Matrix account, in any of its apps, and they are not told. **Blocked contacts**, on the Matrix screen,
  lists them, with **Unblock**.

## XMPP {#xmpp}

Under **Settings** → **Relay and networks** → **XMPP**, a space can sign in to an XMPP account, to chat with people who
use Conversations, Monal, Gajim, Dino or another XMPP app. Erevos talks to the XMPP server itself, as those apps do: no
bridge sits in between.

- **Signing in:** your XMPP address, such as name@example.org, and its password. Erevos finds the server from the
  address; **Server** is only for one it cannot find (a name, name:port or a wss:// address). Erevos becomes a new
  device of the account. The sign-in and the device's keys are kept encrypted in this space, and are in backups: after a
  restore, the account goes on as a new device. Its hidden chats can have an XMPP account of their own, see [Hidden
  chats](#hidden).
- **Chats:** **New chat** adds the address to your contacts, asks the person to let you see when they are online, as
  other XMPP apps do, and opens the chat. Someone who asks to add you shows at the top of the home list and on the XMPP
  screen, with **Accept** and **Decline**. The contacts the account already has are under **Contacts**.
- **Encryption:** messages are encrypted with OMEMO, for each of their devices and for your account's other devices,
  which read along: with OMEMO 2 for a device whose app has it, as Kaidan does, and with version 0.3, which
  Conversations, Monal, Gajim and Dino speak, for the others. It is Erevos's own code, not audited, checked against
  other OMEMO libraries. If their apps have no OMEMO, Erevos says so and writes only when you choose
  **Write without encryption** for that chat; **Encrypt again** goes back.
- **Their keys:** at the bottom of a chat are the fingerprints of their devices. Compare them with what their app shows,
  by another way than the chat. A key that changed since it was first seen says so. This device's own key is on the XMPP
  screen, twice: as apps with OMEMO 0.3 show it, and as Kaidan shows it. One device has one key in both, written two
  ways.
- **Marks:** one tick when sent, two when their app has it, three when they read it, as in Erevos's own chats, for apps
  that send these marks.
- **Reply, change, react, delete:** hold a message for its menu: **Reply** answers it, **Edit** changes the words of one
  of yours, **Delete** takes one of yours back for everyone in the chat, and the emoji react to it; tapping a reaction
  under a message reacts the same, or takes yours back. They work with apps that do the same, as Conversations, Dino,
  Gajim, Monal and Kaidan do; other apps show a reply with a quote of what it answers, and a change as a new message.
  The words of a reply and of a change are encrypted as the chat is, but which message a reply, change, reaction or
  deletion is about, and a reaction's emoji, go as those apps send them, not encrypted, so the XMPP servers see them. In
  a group, a message can be answered, reacted to or deleted once the group has passed it back. Tapping the quote of a
  reply goes to the message it answers. **Forward** sends one or several messages to another XMPP chat. **Pin for me**
  keeps a message at the top of the chat, on this phone only. **Select** chooses several messages to copy, forward or
  delete; the **Delete** there takes back only your own.
- **This phone or everyone:** **Delete**, for one message or several, asks first: **This phone** deletes them here
  only, and they stay hidden if they come again; **Everyone** takes them back as said above, offered only when each of
  them can be taken back.
- **Writing:** when the other person's app says they are writing, **typing…** shows under the chat. Erevos says it of
  you only if you turn on **Say when I am writing** on the XMPP screen, and only to a contact who sees your presence,
  never in a group; it is off at first, as it goes through the XMPP server not encrypted, so the server learns each
  time you write.
- **Online:** under a contact's name it says **Online**, **Away** or **Do not disturb**, with the words they set, or
  when they were last online, as their apps say, and their picture in the chat list has a green dot while they are
  online; only of a contact who lets you see their presence. As in every XMPP app, the contacts who see your presence
  see when Erevos is connected; it goes through the XMPP servers not encrypted.
- **Profile pictures:** a Matrix room, or the person in a chat with one person, shows their picture in the chat list,
  and so does an XMPP contact. **Choose a photo**, on the XMPP screen, sets yours for your contacts; **Remove** takes
  it away. Pictures are not encrypted in any Matrix or XMPP app: the server sees them, and your contacts see yours.
- **Blocking:** **Block**, at the bottom of a chat, stops that person's messages, calls and requests from reaching your
  XMPP account, in any of its apps, as the XMPP server does it (XEP-0191); they are not told. **Unblock** lets them
  through again. Someone blocked in another app of the account is blocked here too.
- **Messages from before:** what came while Erevos was closed is fetched from the server's archive when it connects, if
  the server keeps one. A message sent before this device signed in, or not meant for it, shows as locked.
- **Photos and files:** **Photo** and **File**, under **+**, send one of up to 50 MB, or less if your XMPP server
  takes less, through the server's file upload. In an encrypted chat it is encrypted on this phone first, with a key
  made for it alone, and the key goes in the message, encrypted with OMEMO, so the server keeps only what it cannot
  read; Conversations, Monal, Gajim and Dino open it. In a chat written without encryption the file goes as it is. A
  photo, sound or file that comes is fetched only when you tap **Show photo**, **Play** or **Save**. On Android, files
  go through Tor as the chat does. Tap a photo that shows to see it on the whole screen, as in a contact's chat: two
  fingers or a double tap zoom in, it turns with the phone, and **Save** keeps it (see Photos and files, under [Chat
  through a relay](#relay)).
- **Stickers:** **Sticker** sends your own stickers made from photos (**Mine**) as photos, encrypted as the chat is;
  other XMPP apps show them as photos. The built-in sets are there too: each sticker goes as its picture, made on your
  device. A sticker pack that another app sends (XEP-0449) is not fetched: it shows its words.
- **Voice messages:** press and hold the microphone under the message box to record, and let go to send, as in a
  Matrix chat. It goes as a sound file, encrypted as the chat is, as Conversations sends one, and plays with **Play**. A
  voice message from Conversations or another XMPP app (a .m4a or .ogg file) shows as a voice message too, with **Play**
  and how long it lasts.
- **Groups:** a **private group** is for its members only, and each of them sees who the others are. Every message in it
  is encrypted with OMEMO for each member's devices, as Conversations' private groups do it, so the XMPP servers cannot
  read it; what was written before you joined shows as locked. A **channel** is any other group: it is not encrypted,
  so everyone in it, and the servers, can read it, and its screen says so. On the XMPP screen, **New group** makes a
  private group on your XMPP server from a name and the contacts you choose, and **Join a group** joins one by its
  address, such as name@conference.example.org, with its password if it asks for one. Under a private group,
  **Members** lists its people with their keys, to compare as in a chat, and notes anyone with no OMEMO keys, who cannot
  read what is encrypted; its admin can **Add people**. A contact who invites you to a group shows under **Invitations
  to groups**, with **Join** and **Decline**; an invitation from anyone else is not shown. Your groups follow your
  account's other XMPP apps through its bookmarks: a group joined there is joined here, and **Leave the group** leaves it
  there too. A channel tells only of messages that name you. In a group, **owner** and **admin** show beside the members
  who are, and the group's **Description** shows under its subject.
- **Running a group:** the admins of a group see **Run the group** in its screen. They set its **Subject**; its owner
  can also **Rename** it. In a private group, each member has **Take out** (the group's messages no longer go to them,
  and an admin can add them again) and **Bar** (they cannot join again until an admin lets them); the owner can **Make
  admin** a member, or **Remove as admin**. In a channel, **Run the group** lists who is in it, each with **Take
  out**. Admins cannot take out other admins; only the owner can. The owner also sets the group's **Description**; some
  servers do not allow one, and Erevos says so.
- **Calls:** the two tiles at the top of a chat call the person, by voice or with video, on the same call screen as
  Erevos's own calls, and their calls ring here the same way, while this space is open; a call from someone not in your
  contacts only shows as missed. It works with apps that call as Conversations does (Jingle, rung with XEP-0353). The
  call itself is encrypted (DTLS-SRTP), but the fingerprint of its key goes through the XMPP servers as it is, not
  end-to-end encrypted, so those servers could put themselves in between. It goes through this space's call relay when
  there is one, else through the XMPP server's TURN server, and only through it, so the other person does not learn your
  address; with neither, it goes straight, and they do. A call never goes through Tor: the call relay or the TURN server
  sees this phone's address.
  In a voice call, either of you can turn on video: **Add video**, on the call screen, turns your camera on and asks the
  other person first, who chooses **Not now** or **Turn on video**. Video starts only if they say yes, and a no leaves
  the call as it was. It works with apps that add video to a call as Conversations does.
- **Group calls:** in a private group you are in, the two tiles at the top start a voice or a video call in the group,
  and a call started in one of your groups rings here, while this space is open. While a call goes on in a group, a tile
  at the top and a line under its name say so, and tapping either joins it, until its last person leaves. It works with
  Dino, which calls in groups the same way (MUJI): each call has a room of its own on the group service, which only the
  group's members may join, and each phone in the call connects straight to each other one, as in Erevos's own group
  calls, through this space's call relay or the XMPP server's TURN server, eight people at most. As in a call with one
  person, the call is encrypted (DTLS-SRTP), but the fingerprints of its keys, and the invitations, go through the XMPP
  servers as they are, and the group service sees who is in the call and when. A hidden chats' own XMPP account calls in
  its groups the same way, while the hidden chats are open; while they are closed, with **Receive while closed** on, a
  call that comes in one of its groups shows as missed.
- **Not anonymous:** the XMPP server sees your account, your contacts, who talks with whom and when, and, without Tor,
  from where. The other person's server sees the same of its chats with you.
- **Through Tor:** on Android, the XMPP screen, and the one before signing in, chooses the account's Tor: **Off** (the
  default: straight, and the server sees your address), **As the space** (as this space's choice under **Settings** →
  **Relay and networks** → **Tor** says: with **Messages** through Tor once Tor is ready, its files straight; with
  **Everything** only through Tor, files too; with **Nothing** straight) or **Always through Tor** (only through Tor,
  whatever the space does, signing in too, and nothing goes while Tor cannot connect). Its connection, the look for its
  server and its files follow the choice; Tor uses the space's bridges. Calls never go through Tor, and no link preview
  is made while the account must not go straight. Where Erevos cannot open a connection of its own (the web app, a
  computer), it uses the server's WebSocket, straight, and a server without one cannot be reached.
- **A chat through Tor:** **Through Tor** under a chat or group, off unless turned on, sends it only through Tor. One
  connection to the server carries all the account's chats, so while any chat has it on, the whole account goes only
  through Tor, whatever is chosen for the account, and the XMPP screen says so.
- **Notifications:** a message that comes shows a notice and counts in the number on Erevos's icon, as in Erevos's own
  chats, while this space is open; on a computer, while Erevos runs. On Android, **Notifications** at the bottom of a
  chat mutes it or gives it a sound of its own; a muted chat is not counted. **Chat look** beside it gives the chat a look
  of its own.
- **Chat options:** the sliders button beside where you write, or **⋯** at the top, opens them all in one tidy list,
  in reach however long the chat: **Notifications**, **Chat look**, the PIN, screenshots and disappearing messages
  under **This chat**, then search, media, a day and export under **Find**.
- **While this space is closed:** on Android, **Say a message came** under **While this space is closed** on the XMPP
  screen lets this space say "New message" when something comes on XMPP while another space is open, as its own chats
  do with **Also while another space is open** under **Settings** → **Notifications** → **In the background**, which it
  needs too. It never says what, from whom or in which chat, and a call does not ring then: only the space's key opens
  what came. For it the XMPP server tells this space's relay of each message while no app of the account is on, so the
  XMPP server learns the relay's name, and the relay when messages come. Off unless you turn it on; it needs a relay
  updated for it, which XMPP servers can reach (its owner opens a port for them), and an XMPP server that sends notices
  to apps that are away, as most do.
- **A new account:** on the sign-in screen, **Make a new account** makes one on an XMPP server that allows it
  (XEP-0077), from an address and a password. A server that asks for a captcha, or makes accounts only on its website,
  says so and gives its page when it has one; make the account there, then sign in here.
- **Password and deleting:** **Account**, on the XMPP screen, has **Change the password** and **Delete the account**,
  which deletes the account from the server for good, after two questions, the second asking for the address. Erevos
  forgets its keys; the address may not be made again.
- **Finding groups:** **Find a group** has **Groups on your server**, those the server lets anyone find, and **Search
  public groups**, which asks search.jabber.network: it learns the words you look for and sees your server's name, and
  your server does not. A public group is a channel, not encrypted.
- **Places:** **Location** sends where you are as a geo: link, as Conversations does, encrypted as the chat is; one
  that comes so shows as a place, with **Open in maps** on Android.
- **Link previews:** in a chat written without encryption, with **Link previews** on, the first link goes with its
  preview (XEP-0511), and one that comes so shows under the words. An encrypted chat sends none, as it would tell the
  servers what the link is.

**Why:** Erevos's own chats hide who talks with whom; an XMPP server cannot. So XMPP chats are kept apart and marked, for
the people you would otherwise reach only on XMPP.

- **What a message carries:** the marks for how words look and tappable web addresses, as in a Matrix chat, with
  **Camera**, **Video**, **Contact card** and **Photo quality** (see [Matrix](#matrix)). In a group, typing @ offers
  its members, and a tap writes that one's name in the group, as Conversations does.
- **A name of your own:** **Name them here**, at the foot of a contact's chat, keeps a name of your own for them in
  your contacts on your XMPP server, so your other XMPP apps show it too. They are not told. Leave it empty to show
  their address again.
- **Drafts:** what you type and do not send stays as the chat's draft, encrypted on this phone only. It comes back
  when you open the chat again, also after Erevos closed, and the home list shows it on the chat's row as **Draft**.
- **Send later:** hold **Send** down, or, with the message typed, tap **+** and then **Send later**, and choose a time
  (**In 1 hour**, **Tonight 20:00**, **Tomorrow 09:00**, or any day and time) and tap **Send later**. The message
  waits on this phone, encrypted, shown dashed after the chat's messages with its time, and goes from this phone at
  that time while Erevos is unlocked, on Android in the background too; otherwise as soon as it is unlocked again.
  Text only. Tap it to send it now or delete it. In hidden chats one goes only while they are open, unless they
  receive while closed. One that a restored backup brought back, whose time came before the restore, does not go by
  itself: the phone the backup came from may have sent it already.
- **Send again:** a message of yours that shows **Not sent** has **Send again** and **Delete** in its menu.
- **Remind me:** a message's menu has **Remind me**. Pick a time: the message, with the name of its chat, goes into
  **Chat with myself** and reminds you then. It needs **Erevos** on in [Modules](#modules).
- **Disappearing messages:** **Disappearing messages**, in **Chat options**, deletes new messages from this phone that
  long after they were sent, and **Disappearing message**, under **+**, does it for the next message only. The other
  side keeps them: XMPP has no way to delete them there. Messages already here stay.
- **Appear offline:** at the bottom of a chat with one person, **Appear offline** shows you offline to them, whatever
  your account shows everyone else, and tells them nothing of what you read or type, nor that their messages came. A
  group you share still shows you. It holds for this phone's connection only.
- **Check in person:** under **Their keys**, **Check in person** shows a code of your address and keys, as
  Conversations does. Photograph theirs there: each of their devices whose key matches is marked checked. A key that
  differs marks nothing and says so: someone may be in between, or they changed their app. Nothing is sent.
- **Blocked contacts:** the XMPP screen lists whom the account blocks, with **Unblock**.

## Chats with other Nostr apps {#nostr-chats}

Under **Settings** → **Relay and networks** → **Nostr chats**, a space can have a Nostr key of its own, to chat one to
one or in groups with people who use Damus, Amethyst, Primal, 0xchat or another Nostr app that sends private messages as
NIP-17 asks. It is not [Through Nostr](#nostr), which carries Erevos's own chats.

- **The key:** **Make a Nostr key** makes one for this space; **Or bring a key from another Nostr app** takes the nsec
  of one you already have, and reads what its relays still keep. The key and its chats are kept encrypted in this space,
  and are in backups: after a restore, they come back as they were. Its hidden chats can have a Nostr key of their own,
  see [Hidden chats](#hidden). **Show the secret key (nsec)** shows it, to write down or to take to another app: whoever
  has it reads these chats and writes as you.
- **Your Nostr key:** give its npub to the people who should write to you, with **Copy** or **Show QR code**. **Your
  name**, if you give one, is public: other Nostr apps show it in place of your npub. Only the name changes there: a picture or
  words that another app of your key put in your profile stay.
- **Chats:** **New chat** takes their npub (or nprofile), from their profile in their app, or a name such as
  name@example.org (NIP-05). **Show the people you follow**, under it, lists the people your Nostr key follows (its
  public follow list, looked for also on relays that gather such lists and on the relays your key writes on), with
  their names: tap one to write to them. When it finds no one, it says why, whose list it looked for and how each relay
  answered. Nothing is loaded until you tap it, and no profile pictures. The chats are in the home list too, each
  marked **Nostr**; the **Nostr** chip shows only them, and there **New chat** opens this screen.
  **Name them here** gives a chat a name that only you see.
- **Groups:** **New group** makes one from two or more of the people you chat with, twenty at most, with a name if you
  like. Nostr groups have no admins: a group is the people its messages name, each message goes to each of them,
  encrypted for each, and nobody can be added or taken out later; a group with other people is a new group. **Name this
  group** renames it for everyone, with your next message. A message another app sends to you and others shows as a
  group too, each message with who wrote it.
- **Photos and files:** **Photo** and **File**, under **+**, send one of up to 20 MB. It is encrypted on this phone
  with a key made for it alone (AES-GCM, as NIP-17 asks) and put on a Blossom file server, which keeps only what it
  cannot read; its key goes in the message, encrypted as messages are, and the upload is signed by a key made for it
  alone, so the server does not learn whose it is. On Android, files go through Tor as these chats do. **File
  servers** says where they go, the first that takes one: blossom.primal.net, blossom.band and nostr.download unless you
  change them. A photo or file that comes is fetched only when you tap **Show photo** or **Save**, and opens only if it
  is the one that was sent.
  Tap a photo that shows to see it on the whole screen, as in a contact's chat: two fingers or a double tap zoom in,
  it turns with the phone, and **Save** keeps it (see Photos and files, under [Chat through a relay](#relay)).
- **Reactions:** hold a message to open its menu and react with 👍, ❤️, 😂, 😮, 😢 or 🙏, or with one of more behind **+**;
  under it show the reactions, the last one of each person, as other Nostr apps send them (NIP-25). Tap a reaction under
  a message to add the same, or tap yours to take it back; the others' apps are asked to remove it.
- **Answers:** **Reply**, in the menu of a held message, answers it. The message shows over the message box, with a ✕ to
  let it go, and then above your answer in the chat, where a tap goes to it. Other Nostr apps show it as an answer too
  (NIP-17 marks it as a reply). A photo, file or voice message sent while it shows answers it too. **Copy**, in the same
  menu, takes the words of a message.
- **Voice messages:** press and hold the microphone under the message box to record, and let go to send; slide left
  before you let go to drop the recording. A minute is the most, and a press of under a second sends nothing. It goes as
  a file does, encrypted on this phone and put on a file server, with how long it lasts in the message; whether another
  app plays it as a voice message or as a sound file is up to that app. One that comes with its length plays with
  **Play**, and is fetched only when you play it.
- **Pin for me:** keeps a message at the top of the chat, on this phone only; no one else sees it.
- **Select:** chooses several messages to **Copy**, to **Forward** to another Nostr chat (photos and files are sent
  again) or to **Delete**. Delete takes them from this phone and asks the others' apps to delete your own too: their
  apps may or may not do so.
- **This phone or everyone:** **Delete** asks first: **This phone** deletes them here only, and they stay hidden if
  they come again; **Everyone** also asks the others' apps to delete your own (NIP-09), which they may or may not do.
- **Stickers:** **Sticker** sends your own stickers made from photos (**Mine**) as photos, encrypted: other Nostr apps
  show them as photos. The built-in sets are there too: each sticker goes as its picture, made on your device.
- **Encryption:** each message is encrypted for them and signed by you, then wrapped again by a key made for that
  message alone, its time set back by up to two days (NIP-17, with NIP-44 and NIP-59). The relays see whom it is for,
  not who wrote it, when, or what it says. A copy goes to your own relays, so your other Nostr apps with this key read
  along. It is Erevos's own code, not audited, checked against NIP-17's own example and against nostr-tools.
- **Where your messages arrive:** the relays other apps send your messages to: relay.damus.io, nos.lol and
  relay.primal.net unless you change them, three at most. Erevos tells other apps about them (a kind 10050 list) when
  they change and once a week. It sends to the relays the other person's app names; an app that names none cannot get
  a message yet, and Erevos says so. A key brought from another app reads where that app said your messages arrive
  (its own kind 10050 list), unless you changed them here, and says that list again, so both apps get the same messages;
  it reads those relays from their start, and fetches once what relays named in older lists of the key still keep.
- **Old private messages:** many apps still send and keep private messages the older way (NIP-04, kind 4), which
  Damus and Primal showed for years. Erevos reads them too, past and new, and shows them in the same chats: on the
  relays where your messages arrive and on up to four more, those your key's other app reads (its kind 10002 list, for
  a key brought from another app) and relay.damus.io, nos.lol and relay.primal.net. These are encrypted too, but the
  relays see who wrote to whom and when. Erevos itself sends only the NIP-17 way.
- **Public posts:** in a chat with one person, **Public posts** shows what they post for everyone (kind 1) and the
  posts of others they shared again, newest first, thirty at a time, with **Older posts** for more. It is read only:
  nothing can be answered, reacted to or posted from here. It is looked up when it opens, on the relays used for
  look-ups and on those their relay list (NIP-65) says they write on, as the space's Tor way says, and nothing of it is
  kept. No pictures or links are opened: they show as their addresses, which can be copied. A post with a content
  warning shows its words after a tap on **Show**. An account that only posts for everyone, such as a project's, sends
  no private messages: its chat stays empty, and its posts are here.
- **The Public feed:** on the home screen, the **Public** chip shows one feed of what the people your Nostr key follows
  post for everyone, and what they shared again, and the messages of the public Matrix rooms you are in (rooms anyone
  may join), newest first, as in Amethyst: the face of who wrote it with a small **N** or **M**, their name, when, the
  words, the photos inside the post (one at the full width, two to four in a grid) and, for the first link, a card with
  its picture, site, title and a line. For Matrix, the line under the name says the room and its server: tap it to open
  the room. More come as you scroll to the end, or with **Older posts**; pull the list down for the newest (in a
  browser, **Look again**). Following people is still done in another Nostr app with the same key. Your follow list,
  where the people in it write (their NIP-65 lists) and their posts are looked up only while the feed shows, on the
  relays used for look-ups, on those that gather lists and on those they write on, as the space's Tor way says; names
  only for the posts that show. Nothing is kept.
  **Photos**, above the feed, is the choice that matters for privacy. A photo or a link card comes from the server where
  whoever wrote the post put it, and that server sees the address it was fetched from, through Tor a Tor exit's, and
  that someone opened it. **Always** shows them at once, through Tor when Tor is on in this space; **Only through
  Tor** shows them only when Tor is on, and otherwise on a tap; **On a tap** fetches none before you tap it. **Link
  previews** switches the cards. Nothing is fetched while the feed is not shown, a photo is held only while its post
  shows, and none is kept; one that does not come shows **Show the photo** to try again. Only addresses out on the
  internet are fetched, never one of this phone or your home network.
  Under a Nostr post: **Answer** writes an answer, **Share again** shows the post to your followers (it asks first),
  the heart likes it, and the arrow shares a link to it. Its three dots: **Copy text**, the writer's **Public posts**,
  **Write to them**, and **Take back** for a post of your own. Tap a post to open it with how many liked it and shared
  it again, and the answers to it. **New post**, the pen, writes a public post, with up to four photos. Answers,
  sharing again, likes and posts are public and signed with this space's Nostr key: anyone can read them, and they show
  they are yours; a photo you add is put on the space's file server unencrypted, as a public post's must be. Under a
  Matrix message: **Answer**, **React** (a choice of six) and share (a matrix.to link), and in its three dots **Copy
  text** and **Open the room**. It is always this space's key and account, never the hidden chats' own.
- **Polls:** in the Public feed a poll shows with its answers, to **Vote** on and, while it is open, with **Results**.
  **New post** and then **Poll** makes one: up to 10 answers, one or more to choose, open for 1, 3 or 7 days. Votes are
  public: anyone can see what you chose. A reaction of yours under a post can be taken back by tapping it again.
- **Custom emoji:** in the Public feed, the emoji that other apps make load like post photos do, as **Photos** and Tor
  say above. In private chats they show as :name: and are never loaded.
- **Marks:** one tick once one of their relays took the message. NIP-17 sends nothing back: not when their app has it,
  nor when they read it. Reading a chat here tells no one.
- **Not anonymous:** your key is the same to everyone you write to, and anyone who has an npub can write to it. The
  relays where your messages arrive see your key read them and, without Tor, from where. Only the connection that reads
  your relays tells them who reads, when a relay asks (NIP-42); sending and looking people up never do.
- **Through Tor:** on Android, **Tor** on this screen chooses how this Nostr account reaches its relays and file
  servers, as each network's account does: **Off**, the default for a new key, straight; **As the space**, as this
  space's choice under **Settings** → **Relay and networks** → **Tor** says (with **Messages** through Tor once Tor is
  ready, with **Everything** only through Tor); **Always through Tor**, only through Tor, Tor started for it, never
  straight. A key made before this choice starts on **Off** too. The screen says which way they go now. In the web
  app and on a computer, they go straight.
  **Through Tor**, at the foot of a chat, sends that chat alone only through Tor, whatever the space's way, on circuits
  of its own, so no Tor exit carries its messages and another chat's: what you send in it, the look-up of where they
  read, and its photos and files; with no Tor, nothing of it goes. What comes to you still follows the space's way, as
  one connection reads your messages for all chats. It is kept on this phone only.
- **Notifications:** a message that comes shows a notice and counts in the number on Erevos's icon, as in Erevos's own
  chats, while this space is open; on a computer, while Erevos runs. On Android, **Notifications** at the bottom of a
  chat mutes it or gives it a sound of its own; a muted chat is not counted. **Chat look** beside it gives the chat a look
  of its own.
- **Chat options:** the sliders button beside where you write, or **⋯** at the top, opens them all in one tidy list,
  in reach however long the chat: **Notifications**, **Chat look**, the PIN, screenshots and disappearing messages
  under **This chat**, then search, media, a day and export under **Find**.
- **Not yet:** files another app encrypts some other way (they show as a file Erevos cannot open).

**Why:** many people are on Nostr and will stay there. This lets you write to them from Erevos, kept apart and marked,
because a Nostr key is the same to everyone you write to, while Erevos's own chats hide who talks with whom.

- **What a message carries:** as in a Matrix chat (see [Matrix](#matrix)), and **Location**, which sends where you are
  as a geo: address and a map link that every Nostr app can show; a place sent so shows as a place. In a group, typing
  @ offers its members, named so that every Nostr app knows who is meant. A message you forward is marked
  **Forwarded** on your phone only.
- **Drafts:** what you type and do not send stays as the chat's draft, encrypted on this phone only. It comes back
  when you open the chat again, also after Erevos closed, and the home list shows it on the chat's row as **Draft**.
- **Send later:** hold **Send** down, or, with the message typed, tap **+** and then **Send later**, and choose a time
  (**In 1 hour**, **Tonight 20:00**, **Tomorrow 09:00**, or any day and time) and tap **Send later**. The message
  waits on this phone, encrypted, shown dashed after the chat's messages with its time, and goes from this phone at
  that time while Erevos is unlocked, on Android in the background too; otherwise as soon as it is unlocked again.
  Text only. Tap it to send it now or delete it. In hidden chats one goes only while they are open, unless they
  receive while closed. One that a restored backup brought back, whose time came before the restore, does not go by
  itself: the phone the backup came from may have sent it already.
- **Remind me:** a message's menu has **Remind me**. Pick a time: the message, with the name of its chat, goes into
  **Chat with myself** and reminds you then. It needs **Erevos** on in [Modules](#modules).
- **Disappearing messages:** **Disappearing messages**, in **Chat options**, deletes new messages, sent or received,
  from this phone that long after they were sent. Yours carry that time (NIP-40), so their app and the relays that
  honour it delete them then; those that do not keep them. **Disappearing message**, under **+**, does it for the next
  message only. A message that comes with its own time goes at that time.
- **Blocking:** **Block**, at the bottom of a chat, drops what that key sends on this phone, unread; it does not come
  back if you unblock them. They are not told: Nostr cannot stop anyone from writing to you. **Blocked contacts**, on
  the Nostr chats screen, lists them, with **Unblock**.
- **Check in person:** in a chat with one person, **Check in person** shows your key's code. Photograph the code their
  app shows (nostr:npub…): the chat is marked checked when it is this chat's key. Nothing is sent.

## Telegram {#telegram}

Only in Erevos+, on Android, a space can sign in to your Telegram account and chat with people on Telegram, under **Settings** → **Relay and networks** → **Telegram**. Erevos is not made by Telegram, and uses the Telegram API. The chats join the home list, marked **Telegram**, with a chip of their own.

- **Signing in:** tap **Sign in to Telegram**, give your phone number with the country code, then the code Telegram sends: to its app on your other devices, by SMS or by a call; **Send the code again** asks for it anew. If your account has a two-step password, Erevos asks for it and shows your hint. If Telegram wants you to confirm on another device, Erevos shows the link to open there. A new Telegram account, or signing in by e-mail, Erevos cannot do yet: do it once in the official Telegram app first. What Telegram keeps on this phone is kept encrypted in this space.
- **Normal chats:** Telegram can read them. An ordinary Telegram chat is encrypted only between you and Telegram's servers, and groups and channels are never encrypted end to end. A private chat says so at its top: **Telegram can read this chat**.
- **ErevosGram encryption:** in a private chat, **ErevosGram encryption** sends the other person an invitation. If they use {=Erevos} or the ErevosGram app and tap **Accept**, the chat becomes **Encrypted end to end (ErevosGram)**: what you both write is sealed with Erevos's own protocol before it reaches Telegram, which sees only text it cannot read. When they invite you, the chat shows **They want ErevosGram encryption**, with **Accept** and **Decline**. It is Erevos's own code, not audited. What was written before it was on stays readable by Telegram.
- **Safety number:** tap the lock at the top of an encrypted chat to see its safety number. Compare it with the one on their phone, by another way than Telegram, and tap **Mark as verified** when the two are the same. If their keys change, the chat warns you: compare again before you trust it.
- **Calls:** in a private chat, the call button at the top starts a Telegram voice call, and an incoming one shows over any screen with **Answer** and **Decline**. Telegram's own calling does the call, encrypted end to end by Telegram's own call encryption. Compare the four emoji on your screen with the ones on the other phone: if they are the same, no one listens in. **Video call**, beside it, starts one with your camera on; a video call rings with **Answer with video** beside **Answer**. During any call, **Camera** turns your camera on or off and **Switch** changes between the front and the back one; the other's picture fills the screen while their camera is on.
- **Chats and Settings:** the Telegram screen lists your chats as rows, like the home screen, and brings more as you scroll down. **Settings**, beside the title, has **Ads in channels**, **Telegram folders**, the **ErevosGram keys** and **Leave Telegram on this phone**; **Chats** there, or Back, returns to the list.
- **Bring keys from the ErevosGram app:** on the Telegram screen, **Bring keys from the ErevosGram app**. In the ErevosGram app export the keys, which writes erevosgram-keys.txt and shows a 20-character code; paste the file's line into Erevos and type the code. Chats encrypted there open here. Do not use the ErevosGram app for those chats afterwards. If this space already has ErevosGram keys, replacing them is asked for separately, and chats encrypted here so far stop opening.
- **Ads in channels:** off unless you turn on **Ads in channels** on the Telegram screen. Telegram asks apps to show its ads in large public channels; with it on, a channel can show a small card marked **Ad** at its top, which you can close.
- **Folders:** the folders you made in Telegram show as chips on the Telegram screen, between **Chats** and **Archive**. Under **Telegram folders**, turn on the ones you want: each shows as its own tab there and on the home screen. Once any folder is on, only the chats in those folders notify. The folders stay as they are in Telegram.
- **Chat info:** tap a chat's name to see when the person was last on, their name, number and bio, or a group's description, members and links. There you can mute the chat, pin it, archive it, mark it read or unread, put it in your Telegram folders (Telegram changes them on all your devices), have new messages delete themselves after a day, a week or a month, block the person, clear the history, and delete the chat or leave the group or channel.
- **Chat options:** the sliders button beside where you write opens, in one tidy list in reach however long the chat, **Notifications** and **Chat info** under **This chat**, then **Search** and **Go to a day** under **Find**.
- **Sending photos and files:** **+** beside where you write opens, as in an Erevos chat, a grid with icons: **Photo**, **Camera**, **File** and the rest, with **Send later** under **How it goes**. What you have typed goes under it as its words. The ErevosGram encryption covers only text: in an encrypted chat Erevos asks first, because Telegram can read photos and files.
- **Edit, forward, search:** hold one of your own messages and tap **Edit** to change its words (not in an encrypted chat), or hold any ordinary message and tap **Forward** to send it on to another chat. **Search**, at the top of a chat, looks through its messages.
- **Voice messages:** with nothing typed, the microphone next to **Send** records while you hold it; let go to send, slide left to cancel. Like a file, a voice message is not covered by the ErevosGram encryption, so in an encrypted chat Erevos asks first.
- **Reactions:** hold a message and tap **React** to pick an emoji. The reactions show under the message; tap one to give or take back yours.
- **Polls and stickers:** in a group or channel, **+** → **Poll** asks for a question, two to ten options, and whether votes are anonymous and several answers are allowed. Tap an option to vote (**Vote** when several are allowed), **Retract vote** takes it back, and **Close poll** in the menu of your own poll ends it. **+** → **Sticker** sends one from your sticker packs.
- **Threads:** a message that has replies shows how many; tap it to read them and write one. **Reply in thread** in a message's menu starts or joins a thread in a group or channel.
- **Pinned message:** a pinned message shows in a bar at the top of the chat; tap it to go to it. **Pin** and **Unpin** are in the message's menu; in a private chat you choose between **Pin for both** and **Only for me**.
- **Several messages:** **Select** in a message's menu lets you tap more messages, then **Copy**, **Forward** or **Delete** them together. Encrypted messages cannot be forwarded and are left out.
- **Members and admins:** in a group or channel, the chat info lists its **Members**, marked **Owner** or **Admin**; tap one to write to them. The owner and admins can **Edit** the title and description and **Remove** a member.
- **More in groups and chats:** with the right to add admins, **Make admin** beside a member chooses what they may do, and **Rights** beside an admin changes it or, with **Dismiss admin**, makes them a member again. **Add member** adds one of your contacts, or anyone by their @name; if their privacy settings say no, send them the invite link. **+** → **Poll** can make a **Quiz**: tap the box beside the right answer, and add an explanation if you like; once someone answers, the right answer shows with ✅. Stickers that move play in the chat. **+** → **Erevos sticker** sends one of Erevos's own stickers; Telegram gets it as a still picture sticker. A reaction with a custom emoji shows its picture. With several pinned messages, the bar at the top shows them one at a time: each tap goes to one and moves on to the one before. A thread has **+**, the microphone and a message menu, as a chat does. On the home screen, on the Telegram tab or one of its folders, the menu has **Mark all as read**. Photos show in the chat by themselves and GIFs play there; a video shows its picture with ▶ and how long it lasts, and a tap plays it on the whole screen, with sound. The chat's name and buttons stay at the top while you scroll. **Lock with a PIN**, in a chat's info, locks it as an Erevos chat is locked: it asks for its PIN each time it opens, and home shows no words of it. **Move to hidden chats**, there too, keeps the chat in the hidden chats their PIN opens: it leaves this space's lists and counts, and shows only there; **Move back to my chats** brings it back. Telegram itself still has it, on all your devices. Under **+** in a Telegram chat, **Hidden photo** sends a photo that shows blurred until it is tapped, and such photos you receive show the same way. **Location** and **Contact card** under **+** send a place or one of your contacts to a Telegram chat, as Telegram's own apps show them; Telegram can read both, and a card goes only with a phone number. **Send later** under **+** in a Telegram chat sends what is typed at the time you choose: Telegram keeps it and sends it then, even with this phone off, and **messages go later** above the message box lists them, with **Send now** and **Delete**. Not in a chat with ErevosGram encryption. In a Telegram chat, the search button also shows its **Media, links and files**: **Photos**, **Videos**, **Voice messages**, **Files** or **Links**, each kind apart, all of them from Telegram and not only those on this phone; tap one to go to it in the chat. With **Link previews** on in Settings, the first link of a message sent to a Telegram chat goes with the preview Telegram's servers make of it, as in Telegram's own apps; previews that come show under the words, without their picture, and ask before the link opens. **Block screenshots** in a Telegram chat's info keeps it out of screenshots and the recent apps preview on this phone, on Android; Telegram cannot ask the other side to do the same. A Telegram chat opened with its PIN, or kept in hidden chats, keeps out of them as well, as an Erevos chat does. **Notifications** in a Telegram chat's info sets its own sound and ringtone on this phone, or mutes it here for a while, as for an Erevos chat; **Mute notifications** above it mutes it in Telegram, on all your devices. In a Telegram chat, what was typed and left comes back when the chat opens again: Telegram keeps it as the chat's draft on all your devices, except in a chat with ErevosGram encryption, where only this phone keeps it while Erevos runs. A message that could not be sent has **Send again** and **Delete** in its menu, and the search button has **Go to a day**. Hold a photo, video or file in a Telegram chat and choose **Save to the Collection** to keep a copy there, encrypted; one in hidden chats goes to their Collection. **Send to**, from another app's Share, lists the space's Telegram chats too, but for those locked with a PIN, kept in hidden chats, or channels: the words go into the chat's message field, and a photo or file up to 100 MB goes at once. In a Telegram chat, an @name is tappable, and a t.me link (a person, a group or channel, a message, an invitation) opens inside Erevos's Telegram, asking first before joining a chat by its invitation; other links ask before they open in the browser. **Tor for this Telegram account**, in Telegram's settings and before signing in, has **Off** (the default), **As the space** and **Always through Tor**, as every account of another network has: with Always, or while the space sends Everything through Tor, Telegram is reached only through Tor, on circuits of its own, signing in too, and never straight, not even when Tor cannot connect; each hidden place's account chooses on its own. **Through Tor** in a Telegram chat's info sends that chat only through Tor: Telegram has one connection for all of an account's chats, so the whole account goes through Tor while it is on. Slower, and calls do not go through Tor.
- **Find by @name:** at the top of the Telegram screen, type a name after **Find by @name** to open the chat with that person or channel.
- **Hidden chats:** each hidden place can have a Telegram account of its own, that shows nowhere outside its hidden chats. See [Hidden chats](#hidden).
- **Leaving:** **Leave Telegram on this phone**, at the bottom of the Telegram screen, asks you to choose: **Log out at Telegram too** takes this phone off your devices at Telegram, and **Only forget it here** leaves it listed there until you remove it in the Telegram app. Either way Erevos deletes what Telegram kept on this phone and the ErevosGram keys, so encrypted chats cannot be read again.
- **Photos and files:** a photo, a voice message, a video or a file is fetched from Telegram only when you ask, then shown or saved. Voice messages and videos show as files for now.

## Messenger {#messenger}

Only in Erevos+, on Android, Erevos can sign in to your Facebook Messenger account and chat with people on Messenger, under **Settings** → **Relay and networks** → **Messenger**, or from its card on the home screen. Erevos speaks with Meta's servers itself, with no bridge in between; it is not made by Meta. The account belongs to the phone, not to a space: its chats join the home list of the first space, marked **Messenger**, with a card of their own. Turn Messenger on or off under **Settings** → **General** → **Modules**.

- **Signing in:** **Sign in to Messenger** opens Facebook's own sign-in page. Sign in there as on facebook.com, with any code or check Facebook asks for, and Erevos keeps the sign-in, encrypted, on this phone. If Messenger ends it later, the Messenger screen says **Messenger asks you to sign in again**.
- **What Meta can read:** under a chat's name, Erevos says whether it is end-to-end encrypted. Meta cannot read an end-to-end encrypted chat, but knows who talks with whom and when; any other chat, Meta can read.
- **Chats:** the Messenger screen lists your chats, newest first. **New chat** finds people by name: write it, tap **Search**, then tap the person to start.
- **Writing:** **+** beside the message box gives **Photo**, **Camera**, **File** (up to 100 MB) and **Sticker**. With nothing written, hold the microphone to record a voice message. Hold a message for its menu: a reaction, **Reply**, **Copy** and **Delete**, with **Delete for everyone** for your own messages and **Delete for me** for any. Answers, reactions, edits and deletions show as they come. Messenger's calls are not in Erevos.
- **Open Facebook:** on the Messenger screen, **Open Facebook** shows Facebook's own page with the same sign-in. Messenger links there come back to Erevos; other links open in your browser, without Facebook's tracking marks and never through Tor, so that site sees your internet address. If the screen first asks you to sign out and in again, do it once: Messenger now signs in on facebook.com. Facebook also has a card of its own in the **Services** window on the home screen, beside Messenger, which opens it at once. With Messenger **In its case** there is neither card nor button: Facebook's feed is in the case's own bar, and Messenger's card opens the case.
- **Messenger in its case:** on the Messenger screen, under **How Messenger is used here**, **By Erevos** (the default) has Erevos speak Messenger itself, and **In its case** shows Meta's own Messenger page instead, as on a computer, closed in by Erevos with the same sign-in; **Open Messenger** opens it. Only Meta's sites load in it, links out open in your browser without Facebook's tracking marks, and what Meta's page keeps stays in the case alone, apart from every other page, so it knows your phone again and does not ask for the PIN of your encrypted chats each time; it goes when you sign out of Messenger or another account opens it. Calls work in it, but not through Tor: if Messenger goes through Tor, the page goes only through Tor, with no calls, and links out do not open. Erevos still tells you of new messages, even when the case was never opened: a chat with messages not read shows on home until it is read, and tapping it opens it in the case; while the case shows, Erevos tells of nothing, as the page shows it. Chat locks, hidden chats and the Collection do not apply to its chats. It closes as the space locks or closes, and with the panic button, and it keeps out of screenshots and the recent apps preview whenever Erevos's own screen does; so does the Facebook page. It shows under Erevos's own bar, in Erevos's colours: **←** goes back to Erevos, and **Facebook** in the bar shows Facebook's feed in the same page, with **Messenger** there to come back. The page is laid out at the phone's width, so it reads without zooming in. Meta's page itself takes your whole look: its colours, dark or light as Erevos is, the shape of your bubbles, your text size, your style's letters, and what lies behind your screens, changing with your look even while it is open; a photo of your own stays in Erevos, and the page shows a soft gradient instead. Where Meta changes its page, parts of it may keep Meta's look.
- **Chat options:** the sliders button beside where you write, or **⋯** at the top, opens the chat's **Notifications** and **Through Tor** in one tidy list, in reach however long the chat.
- **Attach and more:** **+** beside where you write opens, as in an Erevos chat, a grid with icons: **Photo**, **Camera** and **File**, and **Sticker** where the chat has stickers. Signal and Session chats have it too.
- **Notifications and reading:** new messages notify you and count on Erevos's icon, as other chats do. Opening a chat marks it read, and it stays read until someone writes again, even before Messenger has heard of it. Each chat has its own **Notifications** below its message box: muted, or with a sound of its own.
- **Through Tor:** **Tor for this Messenger account**, on the Messenger screen and before signing in too, is **Off** by default, and Meta's servers see your internet address; **As the space** follows **Settings** → **Relay and networks** → **Tor**; **Always through Tor** sends the account, its sign-in and its pictures only through Tor. **Through Tor** under a chat sends the whole account through Tor, as Messenger has one connection for all its chats. Meta may ask to confirm, or lock for a while, an account that signs in through Tor. See [Who sees your internet address](#ip).
- **Signing out:** **Sign out of Messenger on this phone** takes its chats out of Erevos; you can sign in again. Backups keep each chat's notifications and the Tor choice, not the sign-in: after a restore, sign in again.

## Signal {#signal}

Only in Erevos+, on Android, Erevos can hold your Signal account and chat with people on Signal, under **Settings** → **Relay and networks** → **Signal**, or from its card on the home screen. Erevos speaks Signal's own protocol with Signal's servers, and every chat is end-to-end encrypted; it is not made by Signal. The account belongs to the phone, not to a space: its chats join the home list of the first space, marked **Signal**, with a card of their own. Turn Signal on or off under **Settings** → **General** → **Modules**.

- **Two ways in:** **New Signal account with my phone number** makes Erevos the Signal of that number, and the Signal app on another phone with the same number then stops. **Link to Signal on another phone** keeps your Signal where it is and adds Erevos as one of its linked devices.
- **A new account:** write your number with its country code, as +30 69…, and choose whether the code comes by SMS or, with **The code comes by a call**, by a call. Signal first asks you to solve a captcha on its own page. Then write the code Signal sent, and the name others see on Signal (the last name is optional).
- **Linking:** on the other phone, in Signal, open **Settings** → **Linked devices** → **Link a new device** and scan the code Erevos shows. New messages then come to both.
- **Chats and groups:** the Signal screen lists your chats and groups, newest first. **New chat** finds a person by phone number or by name; tap them to start. The groups you are in work like chats; new groups are made in the Signal app.
- **Writing:** **+** gives **Photo**, **Camera**, **File** (up to 100 MB) and **Sticker**; with nothing written, hold the microphone for a voice message. Hold a message for a reaction, **Reply**, **Copy** and **Delete**, with **Delete for everyone** for your own messages and **Delete for me** for any. As you type, the phone's contacts that match show too, and a typed number as **New number**: Signal is asked only about the one you tap.
- **Calls:** in a chat with one person, **Voice call** and **Video call** call them on Signal, end-to-end encrypted. An incoming Signal call shows over any screen, with **Answer**, **Answer with video** and **Decline**. Calls do not go through Tor, and Erevos warns you before each one.
- **Notifications and reading:** as for Messenger, new messages notify you and count on the icon, a chat read here stays read, and each chat has its own **Notifications**, with a ringtone of its own for calls.
- **Chat options:** as for Messenger, the sliders button beside where you write, or **⋯** at the top.
- **Through Tor:** **Tor for this Signal account**, before signing in too, works as for Messenger: **Off** by default, so Signal's servers see your internet address. With **Always through Tor**, registering, its captcha and linking go through Tor too. **Through Tor** under a chat sends the whole account through Tor.
- **Signing out:** **Sign out of Signal on this phone** takes its chats out of Erevos. Backups keep each chat's notifications and the Tor choice, not the account: after a restore, register or link again.

## Session {#session}

Only in Erevos+, on Android, Erevos can hold a Session account and chat with people on Session, under **Settings** → **Relay and networks** → **Session**, or from its card on the home screen. Session asks for no phone number and no email: the account is 13 recovery words, and its messages go end-to-end encrypted through the onion routing of Session's nodes. Erevos is not made by Session. The account belongs to the phone, not to a space: its chats join the home list of the first space, marked **Session**, with a card of their own. Turn Session on or off under **Settings** → **General** → **Modules**.

- **A new account:** tap **New Session account**, write your name on Session and tap **Make the account**. Erevos shows **Your 13 recovery words**: write them down, keep them safe, and tap **I wrote them down**. They are the only way to bring the account back, and anyone who has them can read your chats.
- **An account you already have:** **Bring back an account with its 13 words** takes the words, with spaces between them, and your name; then tap **Bring it back**.
- **Your Session ID:** the Session screen shows it, with **Copy**. Others start a chat with you by it.
- **Chats:** **New chat** takes a Session ID or an ONS name, and **Open** starts the chat.
- **Groups:** **New Session group** makes a group from a name and the people you pick among your Session chats. They get an invitation and join when they accept it, and you are its admin. In a group, its button shows the **Members**; an admin can **Add people**, **Rename** the group, and **Make admin** or **Remove from the group** someone who is not an admin. **Leave the group** leaves it, and coming back needs a new invitation.
- **Writing:** **+** gives **Photo**, **Camera**, **File** (up to 10 MB) and **Sticker**; with nothing written, hold the microphone for a voice message. Hold a message for a reaction, **Reply**, **Copy** and **Delete**.
- **Calls:** in a chat with one person, **Voice call** and **Video call** call them on Session. Session rings its calls itself, quietly for a muted chat. Calls do not go through Tor, and Erevos warns you before each one.
- **Notifications and reading:** as for Messenger and Signal, with each chat's own **Notifications** and a ringtone of its own for calls.
- **Chat options:** as for Messenger, the sliders button beside where you write, or **⋯** at the top.
- **Through Tor:** **Tor for this Session account** works as for Messenger and Signal, **Off** by default. Session's onion routing already keeps your internet address from the people you write to; the first Session node sees it unless the account goes through Tor.
- **Signing out:** **Sign out of Session on this phone** asks first, because without your 13 recovery words the account cannot come back. Erevos+'s backups keep the account and its chats, sealed with the backup's password, and a restore brings them back; without a backup, its words bring the account back.

## SMS {#sms}

On Android, Erevos can be the phone's SMS app: under **Settings** → **Phone and SMS** → **SMS** → **Erevos as the SMS
app**, tap **Make Erevos the SMS app**. The home screen then shows SMS and Erevos chats in one list.

> **SMS and MMS are not encrypted by Erevos.** They travel as every SMS does, and stay in Android's own SMS store, where
> any app allowed to read SMS sees them and Android's backups hold them. Only Erevos chats are end-to-end encrypted.

- **SMS from before:** nothing to import. Erevos shows the SMS and MMS already on the phone, from Android's own
  store, where they stay for any other SMS app. Android keeps them, not sealed by Erevos, as with every SMS app.
- **If Erevos does not become the SMS app:** Android 15 and later can hold this back from an app installed from a
  browser. Under **Settings** → **Phone and SMS** → **SMS** → **Erevos as the SMS app**, tap **Open Default
  apps** → **SMS app** → Erevos. If Android calls it a restricted setting, open **Erevos's App info**, tap **⋮** at
  the top right → **Allow restricted settings**, and choose Erevos again.
- **When an SMS comes:** a notice says "New message", without who sent it or what it says. If none comes,
  **Erevos as the SMS app** shows **Allow notifications** while Android holds them back.
- **One-time codes:** an SMS that says it holds a code (a bank's, a sign-in's), in any of the app's languages, gets
  **Copy code** under it in the chat, and on its notice too, without the code showing there; on Android 12 and later
  the notice's button asks to unlock the phone first. Only its 4 to 8 digits are copied, never a phone number, an
  amount, a date or a time, and Android shows no preview of them. Any app that reads the clipboard can read them, so
  paste the code soon.
- **Answering from the notice:** **Settings** → **Phone and SMS** → **SMS** → **What an SMS says, on its notice**,
  off at first, shows on an SMS's notice who wrote and what while this space is open, with **Reply**, which sends a
  plain SMS on the SIM it came on, and **Mark as read**. Anyone who sees the screen sees them; locked, or with
  another space open, the notice says only "New message" again, and one with a one-time code always does.
- **If no SMS show:** Android 15 and later hold the SMS permission back from an app installed from a browser. Under
  **Settings** → **Phone and SMS** → **SMS** → **Erevos as the SMS app**, tap **Allow SMS**. If Android calls it a
  restricted setting, open **Erevos's App info**, tap **⋮** at the top right → **Allow restricted settings**, and
  allow SMS under **Permissions**. Chats sent as RCS ("chat" in Google Messages) stay in that app and do not show.
  **Erevos as the SMS app** says how many SMS conversations Erevos reads, or why it could not read them.
- **Writing to someone with {=Erevos}:** it goes through Erevos, end-to-end encrypted, once their number is linked to
  their contact. Link it by hand in the SMS conversation, or let a hidden invite find it. From then on their SMS
  conversation opens their chat.
- **Their SMS in the chat:** the SMS and MMS with their number, those from before and those that come, show among
  the chat's messages by time, each edged and marked **SMS (not encrypted)**, with its ✓ and its photos. Hold one
  down to copy, forward or delete it, as in the SMS conversation. They stay in the phone's SMS, never in the
  chat's sealed history; only the conversation with that one number shows, not a group MMS, and only while Erevos
  is the SMS app or may read SMS, never in hidden chats. The latest show first: **Show earlier SMS**, above them,
  brings more, and the chat's search finds them too. Opening the chat reads all of theirs, the earlier ones too, so
  none is left counted on the home screen. A number on their contact card does the same, without linking it.
- **A plain SMS to them:** when there is no internet, say. **Plain SMS** in the chat's **Details** opens their SMS
  conversation to write it there, and **+** → **Send as SMS**, or **As SMS** when you hold the send arrow, sends
  what you typed as one, after asking. It shows in the chat as an SMS. The phone company can read it. An SMS cannot
  disappear nor answer a message: with the stopwatch on, or a message being answered, Erevos says so when it asks.
- **Hidden invites:** with the first SMS to a number that is not a contact, Erevos also sends a short hidden invite.
  None goes to an Erevos contact's number, linked or on their contact card. A phone without {=Erevos} shows nothing; a
  phone with {=Erevos} answers through the relay and the two become contacts. It answers by itself only a number it
  knows, in its contacts or one you have written to by SMS; for any other it asks first, **An invite by SMS**, as the
  sender of an SMS can be made up. Each number is asked once a month at most,
  and **Turn invites off**, under **Settings** → **Phone and SMS** → **SMS** → **Find Erevos on a number**, stops
  them.

**Why:** so that two {=Erevos} phones find each other from a phone number alone, with no server that knows numbers. The
invite is a data SMS, which messaging apps do not show, so a phone without {=Erevos} shows nothing.

- **Everyone else:** a plain SMS, marked SMS. The phone company can read it, as it reads every SMS.
- **✓ and ✓✓✓:** an SMS of yours shows ✓ once it went, and ✓✓✓ once the network's delivery report says it reached
  their phone, or "not delivered". Some phone companies send no delivery reports; then it stays ✓. SMS cannot say
  whether it was read.
- **Photos, voice messages and contact cards (MMS):** **+** → **Photo** adds a photo, made smaller to fit one MMS (about
  280 KB), with nothing in it besides the picture. Hold the microphone, with nothing typed, to record a voice message of
  up to a minute, sent as an MMS in AMR, the format phones' messaging apps play. **+** → **Contact card** sends a
  contact from the phone's contacts as a vCard, without your notes on it or its groups, and with its picture only if
  that still fits. **+** → **Sticker** sends one of the built-in stickers as its picture, alone in an MMS. Photos,
  voice messages and contact cards that come show in the conversation, to play or to save (**Save** opens a new contact
  with the card's details). An MMS is as plain as an SMS: the phone company can see it.
- **Videos (MMS):** **+** → **Record a video** asks the phone's camera app for a video in MMS quality, up to 30
  seconds of small picture, which most camera apps keep; **Video from the phone** takes one only when it is small
  enough already, about 280 KB, as Erevos does not make a video smaller. A video that comes shows ▶ in the
  conversation, and a tap plays it in the phone's own video app.
- **MMS abroad:** an MMS waits at the phone company until the phone fetches it over mobile data, which abroad may
  cost. **Settings** → **Phone and SMS** → **SMS** → **MMS** fetches them at once but, unless you turn it on, not
  while roaming: then one shows in its conversation as **MMS** with its size and **Fetch (may cost)**, and under
  **MMS** too, for a number with no conversation yet. Turned off altogether, every MMS waits for a tap.
- **Where you are:** **+** → **Location** sends where you are as an SMS with a geo: address and an OpenStreetMap link,
  which any phone opens. A geo: address, or a link of OpenStreetMap, Google Maps, Apple Maps or Waze, in an SMS that
  comes shows as a place, to open in the maps app; a short link stays a link, as it would have to be fetched to tell the
  place.
- **Reactions from an iPhone or Google Messages:** when someone without Erevos reacts to an SMS of yours, their
  phone sends it as words, Liked “See you at 8” or Reacted 😂 to “See you at 8”: the conversation shows it as 👍 or 😂
  under the message it names, the latest with those words, and not as a message of its own; one taken back (Removed
  a like from …) goes. Only those written in English are read so far; one whose message is not found stays as it
  came.
- **Pinned for you:** hold a message and choose **Pin for me** to pin it over the conversation. SMS have no pins: it is
  kept only on this phone, encrypted with the space's SMS data, and the other person never knows.
- **Several messages:** hold a message and choose **Select**, then tap others: **Copy** puts them in one text,
  **Forward** sends them as one into another conversation's draft, and **Delete** deletes them from the phone, with
  **Undo** for a few seconds.
- **A new SMS:** on the **SMS** part of the chat list, the button at the bottom is **New SMS**, and it opens only
  that, also with Erevos's own chats on.
- **Choosing a recipient:** under **New SMS**, tap **Contacts** to pick from your contacts, with a search, or just type: contacts
  that match the name or number you type show under the field, and a tap fills it in. A contact with several numbers
  shows one line for each. For a group, each one you pick is added to the numbers there. They are the Phone's contacts
  and, with Erevos unlocked, those kept only in Erevos and your Erevos contacts with a number, never the names of hidden
  chats. With only the SMS open, only the phone's contacts show. Android asks first to let Erevos read them.
- **Group MMS:** under **Settings** → **Phone and SMS** → **SMS** → **New SMS**, type several numbers separated by
  commas and tap **Write**. Every message goes to all of them as one MMS, text alone too, and their answers come into
  the same conversation, each with who wrote it. Everyone in it sees everyone's number, and the phone company sees all
  of it.
- **Two SIMs:** the SIM to send on shows above the message field; tap **Choose the SIM** once to let Erevos see
  them. Your choice is kept for that number; until then, Erevos answers on the SIM the last message came on. Each
  message shows its SIM.
- **SMS later:** hold the round **Send** after the field down, or, with the SMS typed, tap **+** and then **Send
  later**, and choose a time, as in a chat. The SMS shows at the end of the conversation marked **Scheduled**; tap it
  to cancel it. It goes at that time, with Erevos closed and locked too; if the phone is off then, as soon as it is on
  and unlocked again. Until then it is not in the phone's SMS, where other apps would see it, and the phone company
  does not have it. It waits locked with a key of the phone itself (Android Keystore), not with your space's password,
  as Android has to send it while Erevos is locked: the protection every SMS has once sent, as sent SMS stay in the
  phone's SMS. Text only, to one number.
- **Links:** a web address in an SMS is underlined, and opens as in a chat, once you have seen it whole.
- **Names from your contacts:** off at first, so SMS numbers show as numbers. **Names**, above the list on the **SMS** part, unlocks them
  (as does **Show names from my contacts** under **Settings** → **Phone and SMS** → **SMS** → **Names from your
  contacts**): the names your phone's contacts give SMS numbers, and the pictures they have for them, or else those of
  your contacts kept only in Erevos, in the list and in the conversation. Tap **Names** again for numbers only. Erevos
  only reads them to show them, and keeps no copy.
- **Senders with a name:** an SMS from a name instead of a number, like a bank's, opens to read, but cannot be
  answered.
- **Remind me:** hold a message down for **Remind me**: it goes into **Chat with myself** with the conversation's
  name, and reminds you at the time you pick.
- **Disappearing messages:** with Erevos as the SMS app, **Disappearing messages**, in a conversation's **Chat
  options**, deletes its new SMS from this phone that long after they were sent, or as soon as Erevos runs again. The
  other phone keeps them: an SMS cannot be deleted there. Messages already here stay.

### Encrypted SMS when nothing else works

When the relay, Nostr, the phones nearby and LoRa all fail, a text to an Erevos contact whose number is linked can go
by SMS instead, end-to-end encrypted like any Erevos message. It is off unless you turn it on: for all such contacts
under **Settings** → **Phone and SMS** → **SMS** → **SMS when nothing else works** (**Turn on for all contacts**), or
for one in their chat's **Details** → **SMS when nothing else works**.

- **What it costs:** each SMS costs what your plan says. A short text takes 3 SMS, a longer one up to 10; abroad an
  SMS can cost much more.
- **What the phone company sees:** which number wrote to which, when, and how many SMS, as with any SMS; never what
  was written, which goes as the same encrypted message the relay would have carried.
- **What goes:** only texts and deletes. Not photos, files, voice messages, calls, reactions or the marks that a
  message came or was read, nor texts longer than about 800 Latin letters (400 Greek ones), nor the very first message
  to a new contact, which holds the keys. Those wait, marked **Waiting**, as in [How Erevos picks the path](#paths).
  Hidden chats never go by SMS.
- **Both phones** need {=Erevos} as the SMS app, and the contact's number linked to their chat. The SMS are hidden data
  SMS for Erevos, which no SMS app shows, and nothing of them is kept in the phone's SMS.
- **Which way it went:** hold the message: its menu says **Went by SMS** or **Came by SMS**. **✓✓** comes once the
  relay or Nostr can be reached again: no SMS goes back by itself.

**Why:** SMS reach a phone with no internet at all, wherever there is a mobile network. But they cost money and tell
the phone company who talks to whom, which Erevos otherwise hides, so SMS is the last way, and only when you choose it.

> Turn it on only for those you need to reach this way. The phone company, and anyone who can see its records, can
> tell from these SMS that your two numbers talk, and when.

### Keeping the SMS in order

- **Hold down:** in the list, hold an SMS conversation down for what it can do: **Pin to the top**, **Archive**,
  **Mark as spam**, **Block** and **Delete**, and **Add to contacts** for a number that is none of your contacts. In a
  conversation, **⋮** at the top shows the same, and first **Search in this chat**, **Media, links and files**, **Go
  to a day** and **Export chat** (see [Getting started](#start)), and such a number has **Add to contacts** under its
  name too: a new contact with the number in it.
- **Pinned:** up to 10 SMS conversations stay at the top of the list, with a pin. **Unpin** lets one go back to its
  place.
- **Archived conversations:** out of the list, under **Archived** at the top of the home screen. One comes back to
  the list by itself when a new SMS comes from them, or with **Unarchive**.
- **Group MMS names:** hold a group MMS down and choose **Name it here** to give it a name of your own, only on this
  phone.
- **A conversation's own:** in its **Chat options**, a conversation has **Chat look**, as a chat does, and, with one
  number, **Notifications**: mute it for a while or always, or give it a sound of its own, or none. These hold while
  the space is open; with it closed, every SMS notifies as the settings say.
- **Chat options:** the sliders button beside where you write, or **⋯** at the top, opens them all in one tidy list,
  in reach however long the chat: **Notifications**, **Chat look**, the PIN, screenshots and disappearing messages
  under **This chat**, then search, media, a day and export under **Find**.
- **Trash:** a deleted conversation waits in the **Trash** 30 days, then Erevos deletes it from the phone's SMS. Until
  then **Bring back** puts it back in the list; **Delete now** and **Empty the Trash** delete at once, for good. An
  SMS that comes after it went to the Trash shows in the list again. Only the SMS app may delete SMS.
- **Spam:** a filter that works on the phone alone, by rules, and sends nothing anywhere. An SMS from a number that is
  no contact and that you never answered goes to **Spam** when it has a link with words that try to fool, like a
  parcel held or a prize, or one of the words you add under **Settings** → **Phone and SMS** → **SMS** → **Spam
  filter**. **Mark as spam** and **Not spam** decide for a number for good. An SMS that the filter's own words catch (a link with words that try to fool, from a phone number that is in none of the phone's contacts and that you never answered) comes with no notice and no sound, as the phone knows those words too; any other spam, by your words, your rules or from abroad, still shows "New message", as that notice comes before Erevos is opened and the rest of the filter stays encrypted in the space. A number you marked **Not spam** or let through comes quietly too when it sends such words, unless it is in the phone's contacts. With the **Spam filter** off, every SMS has its notice: the phone keeps only whether the filter is on, as the space opened last says.
  Each conversation in **Spam**, in the folder and at the top of the
  conversation, says why it is there: the number is blocked, you marked it, your rule names the sender, a number from
  abroad, your word, or a link and which words.
- **Look-alike letters:** a scam text that swaps a letter for one of another alphabet that looks the same, as a Cyrillic а in a Latin word, or hides a mark that shows nothing inside a word, does not get past the filter: it reads the words as they look. Who sends is never compared so, as a look-alike of an allowed sender is not that sender.
- **Rules on who sends:** under **Spam filter**, **Senders** takes a sender's name, as shops and banks send (letters,
  without accents or case), or a number, where \`*\` stands for anything: \`+4470*\` is every number that starts so,
  \`1234*\` every short code that does, and with your country code known, \`69*\` is every number \`+3069...\` too.
  **To Spam** sends theirs there; **Let through** keeps the filter's rules off them, as your bank's or your family's,
  though a number you marked as spam, or blocked, still goes there. **Send numbers from abroad to Spam** sends every
  number written with another country code than **Your country code**, which Erevos takes from the numbers you answer
  and you can change. A number written without one is from here. Tap a rule to remove it.
- **Block:** **Block** in the menu of a conversation, or **Settings** → **Phone and SMS** → **SMS** → **Blocked
  numbers**, puts a number in Android's own list of blocked numbers: Android rejects its SMS, MMS and calls, and every
  space and the phone app see the same list. Only the SMS app or the phone app may see and change it.
- **Drafts:** what you type and do not send stays with that conversation, and the list shows it as **Draft**. An SMS
  that could not go stays there as the draft too.
- **Quick texts:** hold the **+** beside the field down, or choose **Quick texts** under it, for short words you
  write often (I'm on my way, I'll call you later): a tap puts one in the field, to send as it is or with more.
  **Add** keeps one of your own, and holding one down removes it; from then on the list is yours, kept encrypted
  with the space's SMS, each space its own.
- **Taking an SMS back:** an SMS you send waits 5 seconds at the end of the conversation first: tap it then to take it
  back into the message field. **Settings** → **Phone and SMS** → **SMS** → **Taking an SMS back** sets **Off**, 5 or
  10 seconds. When you leave Erevos, it goes at once.
- **What it costs to send:** a longer SMS shows a line over the field with how many letters it has and how many SMS
  it goes as: 160 letters in one SMS, or 153 in each part of a longer one, but 70, or 67, as soon as it has a Greek
  small letter, an accent or an emoji. **Settings** → **Phone and SMS** → **SMS** → **Without accents (cheaper)**
  sends a plain SMS without accents and Greek in capitals, as the old phones wrote it (ΚΑΛΗΜΕΡΑ), so it fits 160
  again; not one with an emoji, nor an MMS.
- **Send again:** one of yours that did not go, or was not delivered, says so: tap it to send it again. Hold any
  message down for **Forward**, **Send again** and **Delete**, with its words to select and copy; a deleted message
  has **Undo** too.
- **Forward:** hold a message down → **Forward**, then type a number and tap **Write**, or choose a contact under
  **Into an Erevos chat**. It opens in that conversation, to read and send there. To a number its picture goes too,
  as an MMS; into a chat only its words.
- **Each space its own:** pins, archived conversations, the Trash, spam marks and drafts belong to the space, sealed
  with its password. The SMS themselves stay in the phone's SMS: another space sees them as they are, and one in the
  Trash here shows there until it is deleted from the phone.

### On your linked devices

The phone's SMS can show on this space's [linked devices](#devices) too: a computer, a browser, a tablet. There you
read them and answer them, and the phone sends the answer as an SMS. It is off unless you turn it on, on the phone:
**Settings** → **Phone and SMS** → **SMS** → **On my linked devices too** → **Send my SMS to my devices too**.

- **What goes:** the latest 50 conversations of the list and of **Archived**, each with its latest 50 messages,
  end-to-end encrypted as everything the devices share. Older ones, those in the **Trash** and in **Spam**, and the
  photos stay on the phone: a message with a photo says **📷 A photo, on the phone**. Names go only while the phone
  shows them (**Names from your contacts**).
- **Answering:** what you write on a device shows as sending until the phone sent it, on the SIM it uses for that
  number, and then it is among the phone's own. One the phone could not send says so: tap it to send it again. The
  phone sends each one once only, and at most 60 an hour from the devices, so a lost device cannot send a flood of
  SMS; one that waited more than a day does not go.
- **Read:** a conversation read on a device is marked read on the phone too.
- **Notices:** a new SMS gives a notice on the device too, as its notification settings say.
- **Through the phone:** the SMS come and go only while this space is open on the phone, as all that goes through
  the phone. On a device the screens are the phone's, without what only the phone does: deleting, blocking, sending
  later, photos and invites.
- **Each space its own:** the switch belongs to the space. A place of hidden chats never sends the SMS to devices.
- **Off:** **Stop the SMS on my devices**, on the phone, takes them off every device.

**Why:** only the phone has a SIM, so only the phone sends and receives SMS. The devices see them through the phone,
end-to-end encrypted like the rest, and the phone company sees nothing more than before.

## Phone {#phone}

On Android, Erevos can be the phone's phone app: under **Phone** in the menu, tap **Settings** → **Make Erevos the
phone app**. Every call then shows on Erevos's own call screen, and tel: links and the phone's call button open
Erevos's keypad. **Phone** opens from the handset at the top of the home screen too, and has an icon of its own in
the phone's apps, **Phone**, green with a handset on Erevos's mark, which opens the keypad. Each of these, like a tel: link,
opens it once Erevos is unlocked: with a password, after you type it, unless the Phone opens without it (see Erevos's
password, below). Until then a card at the top says **Erevos is not the phone app**; on a small phone it shows only
that title, and tapping it opens the Phone's **Settings**.

- **Emergency calls:** an emergency number (112, or your country's) is called at once, never asking which SIM:
  Android picks it. With Erevos locked and the Phone behind the password, **Emergency call** on the password screen
  opens Android's own emergency keypad, with no password.
- **Search contacts:** at the top of the Phone, type a name, a number or part of either: the contacts with a number
  show instead of the tabs, each number on a line of its own. Tap one to call it, or hold it down to put it on the
  keypad. It looks in the phone's contacts and, with Erevos unlocked, in those kept only in Erevos and your Erevos
  contacts with a number; never in hidden chats.
- **Contacts as you dial:** as you type on the **Keypad**, the contacts it finds are listed over the number: one whose
  number holds the digits typed, or whose name starts with them on the keys' letters, as 2 for ABC (and ΑΒΓ). Each key
  shows its letters in the app's language. Tap a contact to call it, or hold it down to put its number on the keypad. On
  a small screen, where there is no room over the number, the first shows over the keys and **2 more** (say) beside it
  lists the others.
- **The call screen:** who calls, or who you call, with the name and photo your phone's contacts give them; while
  Erevos is unlocked, a number linked to one of your Erevos contacts shows the name you gave them, and so does the
  number of a contact kept only in Erevos; that of a contact of open hidden chats, only while they are open. It shows over the
  lock screen and needs no password, as a call has to be answered with Erevos locked. A call that comes shows
  **Answer**, **Decline** and **Message**, and Android rings with the contact's own ringtone; the volume keys quiet
  it. In a call: **Mute**, **Keypad** for the tones a menu asks for, **Speaker**, **Hold**, **Add call** and **End**.
  At your ear the screen goes off.
- **Where the sound goes:** with a Bluetooth device or a headset, the button beside **Keypad** names where the sound
  goes, and a tap lets you choose: the phone, the speaker, the headset or the Bluetooth device.
- **A second call:** one that comes during a call shows **Hold and answer**, **End and answer** and **Decline**.
  With a call on hold, the line under the name says so: tap it, or **Swap**, to talk with the other. **Merge** puts
  the two in one call, when your phone company allows it.
- **A conference call:** once calls are merged, the call screen lists the people in it instead of the photo. Beside
  each, **Separate** talks with that person alone while the others wait on hold, and **End** drops only them; each
  shows only where your phone company allows it.
- **Video calls through your phone company:** where your SIM and network carry them (ViLTE, over 4G or 5G), a video
  call that comes shows **Answer with video** and **Audio only**; in a call, the other side shows full screen and
  your camera in a corner, with **Camera off** and **Switch camera**. A call without video shows **Video** when both
  sides can, and when the other side asks, Erevos asks you: **Turn video on** or **Keep to sound**. To start one,
  type the number and tap **⋯** → **Video call**. Android asks once for the camera. Like any phone call, the phone
  company carries it and can see it; none of this shows where the network has no video calls.
- **Decline with a message:** **Message**, on a call that rings, declines it with a quick reply, or one you write,
  which your phone sends the caller as an SMS; it shows among your SMS. Under **Phone** → **Settings**,
  **Quick replies** changes them: **Add a reply**, **Remove**, **Save**, and **Use the usual replies**. They are kept
  on the phone, not sealed, as the call screen shows them with Erevos locked.
- **The keypad:** under **Phone**, type a number and tap **Call**; hold **0** for +. Held down, the number's field
  pastes one. **Add call**, during a call, opens it once Erevos is unlocked.
- **Voicemail:** on an empty keypad, hold **1** (marked oo) to call your voicemail, on the SIM chosen above
  **Call**. If the SIM has no voicemail number, the Phone says so: your phone company gives it. Where your phone
  company sends voicemails as recordings (visual voicemail), **Voicemail** shows beside **Favourites**: each
  voicemail with who left it, when, how long, and its words when they came. **▶** plays it, **■** stops it; a tap on
  the row offers **Call back**, **Send an SMS** and **Delete this voicemail**. **Call the voicemail** at the top
  calls it. Erevos plays them from Android's store and keeps no copy; with Erevos locked the tab does not show.
- **Speed dial:** on an empty keypad, hold a key from 2 to 9 to call the number on it. A key with none offers to
  choose one: type a name or a number and tap the contact, or **Use** the number typed. Under
  **Phone** → **Settings**, **Speed dial** shows the eight keys; tap one to change it, or **Take it off**. Speed dial
  is kept sealed in the space, and works with Erevos unlocked. While the Phone opens without the password, **Let speed
  dial work with Erevos locked** (off at first) lets it work there too: a copy of the numbers, without their names, is
  then kept on the phone outside the space, so anyone holding the unlocked phone can call them. One space at a time.
  It can show that the space exists: someone shown another space of yours finds the keys calling numbers that are not
  that space's. The copy is deleted when the Phone goes back behind the password, when a backup is restored, when the
  lock is turned off, and when a second password is removed or set again while another space is open; turn it on again
  then.
- **Call settings:** under **Phone** → **Settings**, **Call settings** opens Android's own screens for what your
  phone company keeps of each SIM's calls: **Forwarding, waiting and your number**, and **Voicemail number**; with
  two SIMs, tap the SIM first. Under **Ask your phone company**, each button dials the network's code (**Check**
  call forwarding \`*#21#\`, **Turn it all off** \`##002#\`; call waiting \`*#43#\`, **On** \`*43#\`, **Off**
  \`#43#\`; showing your number \`*#31#\`), and the answer shows in a message of Android. To hide your number for
  one call only, type \`#31#\` before the number.
- **Two SIMs:** above **Call**, tap the SIM to call on; the first time, **Choose the SIM** asks Android to let Erevos
  see them. A number you call without choosing asks **Call on** which. Erevos keeps the SIM you used for each number,
  sealed in the space, and calls it on the same one next time. The call screen names the SIM of each call.
- **The calls:** under **Phone**, **Recents** lists Android's call history, newest first, under each day: who, what
  the call was, on which SIM, and how. **All**, **Missed**, **Incoming**, **Outgoing** and, once a call was blocked,
  **Blocked** filter it; with two SIMs, **SIM 1** or **SIM 2** keeps that SIM's calls. Calls one after another with
  the same number show once, with how many. **☏** calls back; a tap on the row shows its calls, how long each lasted,
  and **Call** (with two SIMs, one for each), **Send an SMS**, **Add to contacts** for a number that is none of your
  contacts, and **Change the number before calling**. Seen there, missed calls leave Android's notice, and that
  notice opens **Recents**.
- **Deleting calls:** in the row's calls, **Delete this call** (or **Delete these 3 calls**, for a row of several)
  deletes them from Android's call history, **Delete** beside one of several deletes only that one, and
  **Delete every call with this number**, when it has more, deletes them all, the older ones too. **Undo** shows for
  a few seconds first; until then they only hide.
- **Favourites:** the contacts starred in your phone's contacts, with their photos. A tap calls the contact's
  default number, or asks which when there are several and none is the default; held down, it shows them all.
- **More for a number:** once a number is typed on the keypad, **⋯** beside it offers **Add to contacts**, **Add to an existing contact** (your contacts open: tap the one to add the number to, or make a new one), **Send an SMS** and **Copy the number**. In **Recents**, the row's calls offer the same, and **Open the contact** for a number that is one of your contacts. In **Favourites**, hold a contact down to see its numbers, each with **Send an SMS** and **Copy the number**, and **Open the contact**. With Erevos locked, the Phone only calls, and copies a number: no SMS, no changes to your contacts. Every key, **Call** and the keyboard's Enter give a short buzz; **Settings** → **Appearance** → **Vibrate on touch** turns it off. See [Appearance](#appearance).
- **Wi-Fi calling and HD voice:** the call screen says so under the name when a call goes over Wi-Fi or with HD
  voice, and **Recents** says it for each call.
- **Blocking:** under **Phone** → **Settings**, **Block telemarketing** blocks calls from the numbers some countries
  keep for telemarketing: France (01 62, 01 63, 02 70, 02 71, 03 77, 03 78, 04 24, 04 25, 05 68, 05 69, 09 48, 09 49
  and 09 475 to 09 479, by ARCEP's decision 2022-1583), Spain (400, since 17 October 2026), Chile (809), India (140)
  and Brazil (0303, which callers there may leave out since August 2025). Other countries keep no such numbers, or
  Erevos is not sure they do, so nothing is blocked for them. Under **Numbers starting with**, type the start of more
  numbers to block, with the country code (+33 162) or as you dial it here (0162), and tap **Block**; **Remove**
  takes one away. These never block a number in your phone's contacts. A blocked call does not ring and leaves no
  notice; it shows in **Recents**, under **Blocked**. Android asks once whether Erevos may screen calls
  (**Let Erevos screen calls**): without that, a blocked call rings a moment before Erevos ends it. What is blocked
  is the same in every space, so it tells nothing of another, and is kept on the phone with no names.
- **Blocked numbers:** under **Phone** → **Settings**, **Blocked numbers** is Android's own list, the same one as
  **Settings** → **Phone and SMS** → **SMS** → **Blocked numbers**: type a number and tap **Block**, or tap one to
  unblock it. In **Recents**, a row's calls show **Block this number** or **Unblock this number**, with **Undo**.
  Android rejects their calls before they ring, and their SMS and MMS. Every space sees the same list.
- **Unknown numbers and spam:** for a number that is none of your contacts, the call screen says under the number
  where it is from (its country and flag, and the town of a landline where the number tells it) and whether it is a
  mobile, a landline, free or premium rate: read from the number alone, on the phone. Under **Phone** →
  **Settings**, **Spam list** downloads a list of numbers known for spam, whole, from the https:// address you type:
  one number a line with its country code, or the start of numbers followed by \`*\`, then what kind of calls they
  are. Erevos keeps none of its own; choose a list you trust. Without Tor, the list's server sees this phone's
  internet address, and Erevos says so first. The call screen of a number on it shows **Possible spam**; **Ring spam
  calls silently** lets them ring with no sound (Android 10 and later), never a contact's. In **Recents**, **Report
  as spam** on a number that is none of your contacts adds it on this phone only, and **Not spam** takes it back;
  **Forget my reports** clears them. No number is ever looked up anywhere. **Download it again each week** has it
  come again from the same address when it is a week old, with Erevos unlocked, through Tor when the space's Tor way
  is on; it is off until you switch it on.
- **A contact group for a while:** under **Phone** → **Settings**, **Block a contact group** lists the groups (the
  labels) of your phone's contacts. **Block** beside one blocks its contacts' calls **For an hour**,
  **Until tomorrow morning** (7:00) or **Until I lift it**; the line under the group says until when, and **Lift**
  ends it sooner. Such a call is blocked like the others: it does not ring, and shows in **Recents**, under
  **Blocked**. Erevos only reads the groups, and keeps the group's id and the time, not its name. While a group is
  blocked, the **Phone** screen says so at the top, until when, with **Lift**.

**Why:** a call is screened with Erevos locked too, so what is blocked cannot be sealed inside a space; and kept the
same for every space, it shows nothing of any of them.

- **Erevos's password:** the **Phone** screen, with the keypad, the calls and the favourites, is behind it like the
  rest of Erevos. Only the call screen is not, unless you let the Phone open without it: under **Phone** →
  **Settings**, **Open the Phone without the password** (off at first, and shown only while Erevos has a password).
  With Erevos locked, the Phone's icon, a tel: link and the notice of a missed call then open the keypad,
  **Recents** and **Favourites**, which Android keeps for every phone app, with the names of the phone's contacts only:
  never those kept only in Erevos or of hidden chats, and no SIM kept for a number. There you can call, nothing more:
  no deleting, blocking, SMS or adding to contacts. **Open Erevos** at the top shows the password screen, as does
  Erevos's own icon after Erevos was in the background for more than 30 seconds, unless a call made there took it
  away. **Keep the Phone behind the password** turns it off.
- **If Erevos does not become the phone app:** as with SMS, Android 15 and later can hold it back from an app
  installed from a browser. Under **Settings**, tap **Open Default apps** → **Phone app** → Erevos. If Android calls
  it a restricted setting, open **Erevos's App info**, tap **⋮** at the top right → **Allow restricted settings**,
  and choose Erevos again. **Allow calls and contacts** shows while Android still holds back calls, the call history
  or the contacts.
- **After the phone restarts:** until you unlock the phone for the first time, Android's own call screen answers.
- **What a phone call is:** a plain phone call, as with every phone app: the phone company carries it and can
  listen. Calls to your Erevos contacts from a chat are another thing: end-to-end encrypted, through the internet.

## Contacts {#contacts}

On Android, **Contacts** in the menu shows the phone's contacts: the ones in Android's own contacts, which your
other apps use too, so there is nothing to import. Android asks once whether Erevos may read and change them
(**Allow contacts**). They open from the person at the top of the home screen too, and have an icon of their own in
the phone's apps, **Contacts**, violet with a person on Erevos's mark, which opens them behind Erevos's lock: with a
password, once you type it.

- **Finding someone:** **Search contacts** looks in every field: names, numbers (however they are written, with or
  without the country code), emails, addresses, the company, the birthday and the note. **Favourites** shows only
  the contacts with a star.
- **A contact:** tap one to see all of it. Tap a number to call it{~, or **SMS** beside it to write to it in Erevos};
  tap an email or an address to open it. **Add to favourites** at the top gives it a star, in Android's contacts,
  so the phone app lists it among the favourites too.
- **New contact** and **Edit:** first and last name, company and job title, as many numbers, emails and addresses
  as you need, each with its kind (**Mobile**, **Home**, **Work**, **Other**), a birthday (day/month/year, or
  day/month) and a note. A new contact is kept **On this phone only**, or in an account the phone syncs contacts
  with (Google), as you choose. What Erevos does not show of a contact, such as another app's own details, stays as
  it was.
- **Photo:** tap the picture at the top of a contact to **Choose a photo** from the phone's photos, **Take photo**
  with the camera, or **Remove the photo**. You cut it square, and Erevos draws it anew, so nothing the photo said
  besides its picture (a place, a phone) is kept. It is kept with the contact in Android's contacts, where the phone
  shows it when they call.
- **Ringtone:** on a contact, **Choose ringtone** opens Android's own picker, with the phone's sounds and those you
  added; the phone rings with it when that contact calls. **Default ringtone** there gives back the phone's own.
- **.vcf files:** **Import from a .vcf file** in the menu of Contacts reads a vCard file that another phone or app
  saved (any of its versions, old Greek phones' too) and saves those not on the phone yet, with their photos and
  groups, on this phone only or in an account. **Save as a .vcf file** there saves the contacts shown (all of them,
  the favourites, a group, or what the search found) as one file, in a folder you choose; on a contact, it saves
  that one. The file is outside Erevos and not sealed: anyone who has it can read the contacts.
- **QR codes:** **QR code** on a contact shows its vCard as a QR code, which another phone's camera reads as a
  contact to add: its name, numbers, emails, addresses and note, without its photo (a long note or many addresses
  are left out to fit). Whoever sees it can read it. **Read a contact's QR code** in the menu reads one from a photo
  you take or choose, here on the phone, and starts a new contact with it, saved only when you save it. Someone's
  Erevos QR code starts one with their {=Erevos} ID.
- **Duplicates:** **Find duplicates** in the menu lists the contacts that look like the same person kept twice: the
  same name (its words in any order), number or email. **Merge** keeps the fullest of them, with every number, email
  and address of the others, their notes, and their photo, ringtone, star and groups when it has none, and deletes
  the others; **Merge all** does so for every set. **Not the same** hides a set until you open the list again.
- **Birthdays:** the **Birthdays** chip under the search lists the contacts with a birthday, the next one first,
  with how many days are left and the age they turn. **Birthday reminders** in the menu (off at first) puts a notice
  on the morning of each one, from 9:00, even with Erevos closed; on the lock screen it says only that there is a
  birthday. They are the phone's contacts' birthdays only, never those of contacts kept only in Erevos.
- **SIM contacts** in the menu reads the contacts on the phone's SIM cards and copies those not on the phone yet
  (all chosen at first) into Android's contacts, on this phone only or in an account. The SIM keeps its own.
- **Only in Erevos:** under **Kept in**, a new contact can be kept **Only in Erevos** instead: sealed in this space
  like its chats, never in Android's contacts, so no other app or account sees it, and other apps show only its
  number; Erevos's call screen shows its name while Erevos is unlocked. It has a lock in the list, and the **Only in
  Erevos** chip shows just those.
  **Keep only in Erevos** on a phone contact moves it in, with its photo and star, and deletes it from the phone's
  contacts; **Move to the phone's contacts** takes it back out. Its photo is sealed with it. Groups, ringtones and
  birthday reminders are Android's, so it has none. A call{~ or SMS} to it still goes through the phone, and shows in
  the phone's call log{~ and SMS} like any other. An Erevos backup holds these contacts, sealed.
- **In hidden chats:** **Contacts** at the top of open hidden chats lists their own contacts, kept only there and
  sealed with them: they show nowhere else, not even in the space's contacts, and the screen shows nothing once the
  hidden chats close. A new contact there is always one of theirs. A photo can be given to one, as hidden chats stay
  open while you pick or take it. Their menu has only what is theirs: **Import from a .vcf file** keeps a file's
  contacts with them, sealed, never in the phone's contacts; **Save as a .vcf file** saves those shown, or one on its
  card, in a folder you choose (outside Erevos and not encrypted); **Read a contact's QR code** starts one of their
  contacts. An {=Erevos} ID typed or read there adds them to the hidden chats, never to the space's. Calling one through
  the phone app closes the hidden chats once Erevos is away more than 30 seconds, and shows in its call log.
- **{=Erevos} ID:** a contact's {=Erevos} ID is the contact link their {=Erevos} shows, under **Copy my contact link** or as
  their QR code. On a contact's card, or under **{=Erevos} ID** when you write one, paste it, or read it with **Take a photo
  of the QR code** or **Choose a photo of the QR code**: **Add to Erevos** (or **Save**) adds them to your Erevos chats,
  which open with them, and links the contact to them, and the chat takes the contact's name if it has none of its
  own. A contact that is an Erevos contact shows the start of their key as **{=Erevos} ID**.
- **Erevos contacts:** a contact that is the same person as one of your chats' Erevos contacts shows as one card with
  it: by a number linked to them in Erevos, by their {=Erevos} ID, or with **Choose from my Erevos chats** on its card, a
  link sealed in the space, never in Android's contacts (**Not this Erevos contact** undoes it). The card then has
  **Message**, **Call** and **Video**, end-to-end encrypted through Erevos instead of the phone company. A chats' contact that no contact is
  has a card of its own, with the shield, where **Add to contacts** makes one and **Connect to one of my contacts**
  links it to one you have, whose card then shows it; the **Erevos contacts** chip lists them all. An Erevos contact without a name of its own takes the name of the contact linked to it, as they are linked or
  as that contact's card opens; a name you gave it in Erevos stays, and one you emptied comes back from the contact
  then. In hidden chats, these are the hidden chats' own contacts, and their chat opens there.
- **History:** a contact's card lists {~its latest calls in the phone's call log, its SMS and |}its messages in Erevos,
  the newest first; tap one to {~call back, write an SMS or |}open the chat.{~ The calls show once you let Erevos read the
  call log (**Show calls**). Erevos only reads them to show them, and keeps no copy.}
- **Other apps:** another app's **Add to contacts** (a number in the phone app, an email in mail) can open in Erevos:
  a new contact with what that app gave, or the list to tap the contact to add it to. An app that shows or changes a
  contact can open it in Erevos too, behind Erevos's lock. Android asks which app to use; choose Erevos. An app that
  asks you to pick a contact, or a number, email or address, gets only the one you tap, from the phone's contacts:
  those kept only in Erevos never show there.
- **Delete** takes the contact off the phone, from every account it is kept in; one kept only in Erevos, from Erevos.
- **Groups:** **Groups** in the menu of Contacts (the three dots) lists Android's own groups, such as Family or
  Work, with how many are in each, and makes new ones. Open one to **Add contacts**, take one out with **×**,
  **Rename** it or **Delete group** (its contacts stay). On a contact, **Choose groups** puts it in groups or takes
  it out. The chips under the search show one group's contacts. A group is kept in an account, as its contacts are:
  a contact joins it only if it is kept in that account too.

## Password lock {#lock}

Under **Settings** → **Privacy and security** → **Lock and second password**, **Lock when Erevos opens** has two
choices: **No lock** and **Password**.

1. Tap **Password**, type it twice (at least 4 characters) and tap **Save**.
2. From then on Erevos asks for it every time it opens, and again after 30 seconds in the background. On Android, as Erevos goes to the background, the phone covers its screens with a plain cover in their background colour: back within the 30 seconds, the cover is gone before anything shows; back later, it stays until the password screen shows, so nothing of the space shows before the password. The 30 seconds are counted on a clock that changing the phone's time does not move.
3. **Change password** changes it, and **Lock now** locks Erevos straight away: on Android its screen is covered at once.

- **A phrase, not a short PIN:** what checks the password is kept in the phone's keystore, so a copy of the phone's
  storage cannot be used to try passwords. But someone who breaks into the phone's own security, as forensic tools do
  on some phones, could try guesses on computers of their own, and a PIN of 6 digits, a million of them, falls in
  days. A phrase of 4 or 5 words does not. Under a short new password, or PIN of hidden chats, Erevos says so, and
  takes it only when **Use it anyway** is pressed. The same guesses can be tried on a backup by whoever has it and its
  password: a short PIN is weakest there.
- **Locked, still receiving:** when Erevos locks, the password screen comes in front of the open space, which goes on
  behind it: messages and calls still come, with their notices, and a call shows over the password screen. Its
  screens close, hidden chats too, and the call screen no longer shows its contacts' names. Its password opens it
  again; another space's password closes it first, with nothing of it kept in memory.
- [~] **Only the SMS:** with Erevos locked, the SMS icon, the widget's **SMS** button and the notice of a new SMS still ask
  for the password, but then open only the SMS: the list of the phone's SMS conversations, each in a row of its own,
  their conversations, **Archived**, **Spam** and **Trash**, and **New SMS**. Nothing else of the space shows. Anything
  else, a contact, a chat, **Settings**, Erevos's own icon or the orange padlock **Unlock everything** at the top, asks
  for the password again, and then opens all of the space. So a code that came by SMS can be read with someone beside
  you, and the rest of Erevos stays closed.
- **Only the Contacts:** in the same way, the Contacts icon, the widget's **Contacts** button and the notice of a
  birthday ask for the password, then open only the contacts: their list, a contact's card (without your chats and
  calls with them), **Edit**, groups, duplicates, the SIM and importing. **Call** still opens the phone's dialer. A chat{~,
  an SMS|}, **Settings** or the orange padlock **Unlock everything** at the top asks for the password again, and then
  opens all of the space. Another icon, the widget or a notice, with {~only the SMS or |}only the Contacts open, asks for
  the password as when Erevos is locked, then opens what it names: the Contacts icon only the contacts, {~the SMS icon
  only the SMS, |}Erevos's own icon all of it.

- **Seeing what you type:** every field for a password, a PIN or a token, here and anywhere in Erevos, has an eye at
  its end: tap it to see what you type, and again to hide it. It is hidden again each time the field shows anew, and
  on Android the keyboard is told not to learn it.
- **Wrong passwords:** after 5 wrong tries, each further one makes you wait, 30 seconds at first and twice as long
  each time, up to an hour. The count survives a restart. The wait goes by the phone's own clock since it was turned
  on, which no one can set, so moving the date and time forward does not end it; turned off and on during a wait, the
  phone waits it again from its beginning, as the time already waited cannot be known. In the web app and on a
  computer it goes the same way while Erevos stays open, and starts again from its beginning when Erevos opens anew.
- **What is sealed:** each space's contacts, the keys of its conversations, its messages, its relay settings and its
  look are kept on the phone sealed with a key that only its password opens.
- **The list at once:** the home screen keeps a sealed copy of its first rows, so the list shows as soon as the space
  opens and then updates. It is always the same size, so it tells no one how many chats there are or which spaces
  are used, and it never holds what a disappearing message said.

**Why:** each password tried costs time and a lot of memory on purpose (PBKDF2, then Argon2id), so that whoever copies
what the phone keeps cannot try passwords fast; and someone holding the phone waits longer after each wrong try. The
count is one for the whole phone, kept across restarts, as the password screen comes before any space opens, and
the wait is measured where moving the clock cannot shorten it.

> There is no way to recover a forgotten password: nothing is stored that could open the data without it. Only a
> fingerprint or face, while it is on, still opens the first space (see below).

### Screenshots

With the password lock on, Android keeps Erevos out of screenshots, screen recordings and the recent apps: there the
last screen of Erevos shows blank, so whoever holds the unlocked phone a moment does not see your chats in it. Under
**Settings** → **Privacy and security** → **Screenshots**, **Turn off** lets screenshots work again (to send one, say),
and **Turn on** brings it back. While it is on, hidden
chats stay out of them too, even in a space without the password lock; turned off, screenshots work in them as well. The setting is the phone's, the same in
every space. On a computer and in the web app it does not exist.

**Why:** without it, the last screen of Erevos stays as a picture among the recent apps until Erevos opens again, so
hidden chats always keep out, never to show there without their PIN. The setting is the same in every space so that it
tells nothing of which space opened.

### Fingerprint or face

On Android 11 and later, with a fingerprint or face set up in the phone's settings, Erevos can open with it too. It
is off unless you turn it on.

1. With the password lock on, under **Fingerprint or face**, tap **Turn on**.
2. Type the password of the space you are in, tap **Turn on**, and touch the sensor (or look at the phone).
3. From then on the password screen has a **Fingerprint or face** button. The password always works too, and
   **Turn off** turns it off. The button is there as soon as the password screen shows.

- **Only the first password's space:** a fingerprint never opens the space of a second password, nor hidden chats.
  Turned on in the space a second password opens, it opens nothing: the first time it is tried it turns itself off,
  and the password opens Erevos. The setting looks the same in every space.
- **Under pressure:** someone who holds you can press your finger to the phone, or hold it to your face. If that may
  happen, keep it off: then they need a password, and you can give them the second one.
- **How it is kept:** the first space's key is sealed by a key in the phone's secure hardware (the Android Keystore)
  that works only right after a strong fingerprint or face check, once for each use. Adding or removing a fingerprint
  or face makes Android drop that key: it is then off, and you turn it on again. A key that stops working in some
  other way turns it off too, after three tries in a row in which the key could not be used. Nothing leaves the phone.
- **Which face:** a face counts only where Android rates its face unlock as strong, as on the Pixel 8 and later;
  elsewhere it is the fingerprint.
- **Wrong passwords** are counted as before: a fingerprint does not change the count.
- **Not on a computer or the web:** it is offered only on Android. Turning the lock off turns it off too.

**Why:** a finger is easier to force than a password, and anyone whose finger or face the phone knows could use it, so
it never opens a second password's space or hidden chats. Turned on in another space, it keeps a key that opens
nothing, in the same shape, so what is stored does not show which space it was turned on in.

## Second password {#second}

If someone forces you to open Erevos, type the second password instead of your own. It opens a separate, empty
Erevos with its own contacts, relay and look. Your real chats stay hidden, and nothing in the app shows that they
exist.

1. With the password lock on, tap **Set second password**.
2. Type it twice and tap **Save**. It must differ from your own password.

- **The look:** the second space starts with the look of the space it was set in, so it does not stand out.
- **One at a time:** setting a second password again replaces the one before. **Remove second password** removes it.
- **From the search:** in an open space, type another space's password in **Search chats** and press Enter: the open
  space closes, nothing of it stays, and the other opens, as with **Lock now** and its password. It takes as long
  whatever is typed, so its time does not show whether there is another space. A wrong password, or the open space's
  own, is just a search; the panic password works only on the password screen.
- **Moving a chat there:** in a chat's **Details**, tap **Move to another space**, type the other space's password and
  tap **Move**. The chat goes there with its messages, name, picture, look and imported chats, encrypted with that
  space's key, and that space stays closed. The safety number stays the same, and their phone is told at once to write
  there from now on. The row shows in every space, and the password is tried as the search tries it: a wrong one, or
  this space's own, moves nothing. A chat with someone the other space already has a chat with stays where it is.
  Whoever reads the other space with a forensic tool could tell the chat came from elsewhere: its contact still knows it
  by this space's key.
  If that space has no relay yet, Erevos offers this space's: **Move with this space's relay** moves the chat and
  gives that space this relay to keep, and the relay can then tell that both spaces are on one phone.
- **Discretion:** for privacy, the app never shows whether a second password is set. In the web app with
  notifications while closed on, the number on Erevos's icon stays while Erevos is closed: one that does not match
  the space you open may hint at another (**Number on the icon** turns it off).{~ On Android, what the camera took
  with Erevos locked can hint at another space too while it waits for its own: see **Camera before the password** in
  [Collection](#collection).}

## Hidden chats {#hidden}

Every space has 4 places for hidden chats, each opened only with its own PIN, and they never show among your other
chats. There is no button for them anywhere. Each place can hold one chat or several, so 2 spaces have 8 places.

**Why:** each place already has a PIN of its own, so a chat alone in a place has a key of its own, and a place can also
hold several chats under one PIN. The number of places is fixed for two reasons:

- **So that nothing shows.** All 4 places exist from the first start, filled with random data while unused. Whoever
  makes you open the phone, or copies what it keeps, cannot tell whether you have hidden chats, or how many. With a key
  for each chat, the sealed files would grow with each new hidden chat, and give away how many there are.
- **So that it stays quick.** A PIN typed in the search is tried on every place, and each try is slow on purpose
  (Argon2id, which takes a lot of memory and time, so that PINs cannot be guessed fast). With 4 places opening stays
  short and always takes the same time, so the time does not tell how many are used either.

The number can be raised later with nothing lost, at the cost of opening a little slower; lowering it would delete
what the places taken away hold.

1. Start a place in either of two ways: under **Settings** → **Privacy and security** → **Hidden chats**, pick **Place
   1** to **Place 4**, tap **Set hidden chats PIN**, type it twice and tap **Save**; or open a chat's **Details**, tap
   **Move to hidden chats**, type a PIN of 4 characters or more, tap **New hidden chats**, pick a place, then **Start
   and move**. Remember which places you use: for privacy, Erevos cannot tell which are free.
2. To open them, type the PIN in **Search chats** on the home screen and press Enter (the keyboard's search key). Or
   hold **New chat** down for a moment: a field for the PIN opens, with a short buzz on Android, the same in every space; type it and
   tap **Open**. It opens only the place with that PIN. A wrong PIN is just a search, or only closes the field:
   nothing happens.
3. They open titled **Hidden chats**, with **Contacts** and **Change PIN** at the top, and list their chats and groups
   as the home screen lists yours: the newest first, each with what was said last, when, and how many are not read. Tap
   one to open it. The back arrow closes them.
4. To move another chat into a place, open its **Details**, tap **Move to hidden chats**, type that place's PIN and
   tap **Move**. The
   chat leaves your list with its messages, name, picture and look, and the chats imported into it, and its safety
   number stays the same. Their phone
   is told at once to write to the hidden chats from now on; a message they send in that very moment may not come.
5. To move a chat back among the space's chats, open it in the hidden chats, then its **Details**, tap **Move back to
   my chats** and **Move**. It goes with its messages, name, picture, look and imported chats, and its phone is told
   where to write.

- **Relay, Nostr and phones nearby:** hidden chats have their own relay queue and their own keys. While they are open,
  or receive while closed, they also reach a contact's phone nearby, as your other chats do (see [Chat with a nearby
  phone](#nearby)), but other phones never carry them, and they never go over LoRa{~ or by SMS}.
  With no relay, their contact link says where they read on Nostr, with a key of that place alone, and texts go there,
  as from a phone with no relay; photos, voice messages, calls and groups need a relay. While they are closed, their
  messages wait on the relay, or on Nostr for two days, unless **Receive while closed** is on.
- **Receive while closed:** a switch at the top of each place. On, its hidden chats receive as your other chats do while
  the space is open, whatever screen shows and with Erevos in the background: their contacts see at once that a message
  came, a notice says only "New message", on Android a call rings with "Incoming call" and no name (on the ringing screen, **Answer** takes it with no PIN, on a call screen with no name and no face, and the hidden chats stay closed; the small sign, the PIN and **Connect** open them and answer it there), and a reminder of their Chat with myself
  shows a notice that says only **Reminder**. What comes to them through Nostr is read then too{+, and their own Matrix,
  XMPP and Nostr accounts stay connected (see below)}. A call that ended before you opened them, or rang too long, shows
  as missed. Nothing of them shows anywhere until the PIN opens them. A new place starts with it on; places set before
  stay as they were until you turn it on. For it, the place's key is kept encrypted with the space, among a random key
  for each other place, so opening the space does not show which places receive, or are set. But whoever opens the space
  and copies what the phone keeps could open that place too, with no PIN: the PIN then keeps them out of sight of
  whoever holds the phone, not of a forensic tool. Off, their key is only behind the PIN, and their messages wait on the
  relay until you open them. Backups keep the switch.
- **Dot for unread messages:** with **Receive while closed** on, a switch under it (off unless you turn it on). On,
  while one of the place's chats or groups has a message unread{+, or one of its own Matrix, XMPP or Nostr chats had one
  since you last opened it}, a small dot shows on the magnifier of **Search chats** on the home screen: never how many,
  nor where. It goes once you read them. Whoever sees the space's chats sees it too, and may guess there are hidden
  chats. Places that only **Say when a message comes** get no dot: the switch would have to be kept where the space
  could read it.
- **They close by themselves** once Erevos was in the background for more than 30 seconds, as a chat's own PIN
  locks again, but not during a call, nor while you pick a photo or a file for them or take a photo.
- **While they are open,** a message that comes plays the sound for new messages, as in your other chats. With Erevos
  in the background before they close, a notice says "New message" only if **Receive while closed** or **Say when a
  message comes** is on for that place.
- **Like your other chats:** what cannot go now waits, marked **Waiting**, through their relay only, or Nostr with no
  relay (see **Waiting** under [Chat through a relay](#relay)), **Send later** works as there, and a chat exported
  from another app can be imported into a hidden chat's details (see [Imported chats](#import)). A contact can be
  added from a photo of their QR code there too, taken or picked while they stay open. Each place has its own
  **Chat with myself**, first in its list (see **Chat with myself and reminders** under [Getting started](#start)).
- **Groups:** **New group**, under their list, makes a group with their contacts, as on the home screen (see
  [Group chats](#groups)), and it shows in their list among their chats. Its members are only contacts of that place,
  and one you add as a contact from it becomes a contact of that place. What is written in it goes through the place's
  relay only, to a queue of its own there, never to a phone nearby; while the place is closed it is read only with
  **Receive while closed** on, and **Say when a message comes** does not count it. Its calls ring only while the
  hidden chats are open: one started while they are closed shows as missed. A group there has no PIN of its own, and
  none is public.
- [+] **Matrix, XMPP and Nostr:** under their list, **Matrix**, **XMPP** and **Nostr** open the screens of those networks
  (see [Matrix](#matrix), [XMPP](#xmpp) and [Chats with other Nostr apps](#nostr-chats)) for accounts of the hidden
  chats' own, apart from the space's: a Matrix account and an XMPP account to sign in to, and a Nostr key. The sign-ins
  and the key are kept encrypted with the hidden chats' key, and nothing of them shows outside the hidden chats: their
  chats are in the hidden chats' list only, and add nothing to the number on Erevos's icon or to the home list. The
  accounts connect while the hidden chats are open, and while they are closed too if **Receive while closed** is on,
  as the hidden chats themselves receive: then a message there shows a notice that says only "New message", and on
  Android a Matrix or XMPP call rings with "Incoming call" and no name, answered with the PIN as their other calls are;
  one not answered in time shows as missed, and so does an XMPP group call that comes while they are closed. With it
  off, the accounts connect only while the hidden chats are open, and nothing comes while they are closed. Their chats
  call as the space's do, from the hidden chats' own account; a call to it while the hidden chats are open rings with
  the phone's ringtone, and they stay open until it ends. A Matrix account of theirs has no **Say a message came**.
- **Linked devices:** under their list, **Linked devices** links these hidden chats on their own to the same place on
  a computer or in a browser, from inside them, apart from the space and its linked devices: their chats, messages and
  own accounts go there, and nothing of it shows in the space (see **Hidden chats and second passwords** under [Linked
  devices](#devices)). Not linked, they are on this phone only.
- **Link previews** have a switch of their own in a hidden chat's details, for all the chats of that place, off unless
  you turn it on (see **Link previews** under [Chat through a relay](#relay)).
- **Say when a message comes** (Android): at the top of a place while **Receive while closed** is off. Turned on,
  while the place is closed a notice says only "New message", or how many came, as for the other chats, with Erevos in the background or showing, each message
  once, also when Erevos was closed and started again; what came while the place was open makes none once it closes. That a message of yours came to them or was read, typing and new keys make none, nor does a call that rang (see **Ring
  calls when closed**); one that did not ring counts as a message. A message or a delete that other {=Erevos} phones
  carried to the relay (see **Carried by other phones** in [Chat with a nearby phone](#nearby)) cannot say what it carries, since the phones that carry it
  must not know: it counts as a message, so a delete shows "New message" too, and the first message of a chat may count
  as two; and one sent without sound sounds as usual (see **Send without sound**). It needs **Receive and ring** and
  **Say a message came** under **In the background**, which the switch says when they are not on, and a relay that
  waits (from 18 October 2026 on); one from before 23 October
  2026 can only say that something waits, so then "New message" shows for that too, once until you open that place.
  For it, the space keeps a relay queue for each of its 4 places, those not in use made for nothing on the same
  relay, so opening the space shows neither whether hidden chats are set nor which, as long as they use the space's
  relay; the relay is asked only how many messages came, as it counts them by the byte each one carries (see what
  the relay sees, above), never for them. Whoever sees the notice and finds nothing new in your chats may guess there
  are more. After you delete or block someone in the place, a first message from someone new, by the place's contact
  link or QR code, makes none: it shows when you open the place. Backups keep it.
- **Ring calls when closed** (Android): below **Say when a message comes**, while **Receive while closed** is off.
  Turned on, while the place is closed, with Erevos in the background or on any screen, a call from one of its
  contacts makes the phone ring and show "Incoming call" with no name, as a call from your other chats does. On the ringing screen, tap **Answer** or the small sign,
  type the PIN and tap **Connect** to answer; **Decline** stops the ring. Whoever taps **Answer** without the PIN gets
  no further than the PIN field. The
  ring lasts about 45 seconds. It needs **Receive and ring** under **In the background**, which the switch says when
  it is not on, and a relay that waits, and
  uses a relay queue of its own for each of the 4 places, those not ringing made for nothing on the same relay, the
  same as the message notice above, so opening the space gives nothing away. The caller only rings a queue there; the
  call itself waits on the chat's own queue until the PIN opens it. A contact you have deleted can still make it ring,
  but the call can never connect. A call placed from a linked computer rings only while the hidden chats are open.
  Backups keep it.
- **A new PIN for a place** (from **Hidden chats** in **Settings**, or **New hidden chats**) starts it empty and
  replaces what was in it. To keep them and change only the PIN, open them and use **Change PIN** there. Each PIN must
  differ from the others and from the password that opens Erevos.
- **Wrong PINs in the search** are counted apart from the lock screen's: after five, searches stop trying for a while,
  silently, and the lock screen never waits because of them.
- **A PIN keeps out whoever picks up the phone,** not whoever copies what it keeps: with a forensic tool on an
  unlocked or rooted phone, PINs can be tried with no wait. Each try costs Argon2id (a lot of memory and time), but a
  PIN of 4 digits is only 10,000 tries. If that is what you fear, use a longer PIN, or a few words.
- **Discretion:** every space has all 4 places from the start, the unused ones filled with random data that looks
  like used ones, and the search tries every place each time. So nothing shows whether any hidden chats are set, or
  how many.

### A chat locked with a PIN {#chat-pin}

A chat or a group can have a PIN of its own, apart from hidden chats: it stays among your chats, but opens only with
its PIN.

1. Open the chat, tap **⋮** at the top for its **Details**, then **Lock with a PIN** (in a group: the group's name at
   the top, then **Lock with a PIN**).
2. Type a PIN of at least 4 characters twice, then **Lock**.

- **Opening it:** it asks for the PIN. It locks again once you leave it, open another chat, or Erevos is away more
  than half a minute (as the password lock).
- **Behind the PIN** nothing of the chat shows: none of its messages is drawn until the PIN is typed, and with glass,
  a wallpaper or a style's own scene, the PIN screen lies on a dense frost that lets nothing through.
- **In the list** it shows its name with a lock and **Locked with a PIN**, nothing of its messages, nor in the
  search, in **Starred messages** or in **Imported chats**. The notice says only **New message**, as for every chat.
- **Wrong PINs** are counted on the phone, for every chat at once and apart from the lock screen's: after five, the
  next try waits, longer each time.
- **Forgot the PIN?** Under the PIN, where the space has a password, **Forgot the PIN?** takes it off with the
  password that opens the space. Without a password, nothing can open it again: deleting the contact is then the only
  way.
- **Into hidden chats:** a chat you move into hidden chats takes its PIN with it, which asks nothing there, as the
  hidden chats' own PIN guards them. Moved back to the chats, the same PIN asks again.
- **To take it off:** **Details** → **Lock with a PIN** again, and type its PIN.
- **Only this phone knows it,** and each linked device has its own. Backups keep it.
- [~] **On {+Matrix, XMPP, Nostr and }SMS too:** {+a chat on Matrix, XMPP or Nostr has **Lock with a PIN** at its foot, and }an
  SMS conversation {-has **Lock with a PIN** }under its **Plain SMS** line, working the same way: its name with a lock in the list, none of its
  messages in the search, and the space's password takes a forgotten PIN off. **Block screenshots** sits beside it, on
  this phone only (Android): the others are not told. A hidden place's chats offer neither, as its own PIN guards them
  and they stay out of screenshots while **Screenshots** is on.

**Why:** some chats should stay where they are, but not open for whoever holds the phone a moment. The PIN is kept
only as Argon2id of it, so it cannot be read from the phone, and guesses are slow. It is a lock on the screen, not a
key of its own: the chat's messages stay encrypted with the rest of the space, and whoever copies what the phone keeps
while the space is open could still read them. For a chat that must not even be seen, use hidden chats.

## Collection {#collection}

The Collection is an encrypted place for your photos, files and folders, in every space and in every hidden place, each with its own: the space's opens only in the space, a hidden place's only in that hidden place, and nothing on the phone tells that a place has one. Its icon, two pictures with a tiny padlock, is on the home screen left of the lock, and at the top of a hidden place's chats. It is a module, on Android, in the desktop app, in the web app and on Sailfish OS: **Settings** → **General** → **Modules**.

- **Inside:** tabs across the top: **Photos** as a grid by month, **Videos**, **Music** and the other **Files** as lists, each with the folders that hold any of its files above it (**Files** the empty ones too). **+** takes a photo with the camera, which goes straight here and never to the gallery, brings in a file from the phone's files, up to 4 GB, encrypted as it is read with no copy first, or makes a new folder. Press and hold to choose several, to move, send or delete them; press and hold a folder to rename or delete it, which keeps its files.
- **Encrypted:** each file is encrypted with a key of its own, in pieces named at random lying among the chats' pieces, so nothing on the phone tells a file of the Collection from a photo of a chat. Only the Collection's own catalogue, sealed as the chats are, says which is which. The Collection stays out of screenshots, and closes when the space locks.
- **Asks again:** where the space has a password, the Collection asks for it each time it opens, and again once Erevos was away more than 30 seconds, before anything of it shows; a fingerprint or face works too where it unlocks Erevos. Wrong passwords count as on the lock screen. A hidden place's Collection asks nothing more, as hidden chats close as soon as Erevos is left.
- **From a chat or another app:** press and hold a photo or file in a chat, then **Save to the Collection**: it is copied into the Collection of that chat's place. From another app's Share, **Send to** has the **Collection** first, and asks which folder; it goes in as it came, already encrypted, so it never lies unencrypted on the phone. It can be up to 4 GB; one larger than 100 MB can go only to the Collection, as a chat takes 100 MB at most.
- **Out of the Collection:** a photo opens on the whole screen, to swipe and zoom, with **Send to a chat**, **Save to phone**, **Information** and **Delete**. Saving to the phone, or opening a file with another app, takes it out unencrypted, and Erevos says so first. Sending to a chat leaves the Collection's copy where it is. From a hidden place's Collection, files go only to the chats and groups of that hidden place, never to the space's, and the space's Collection never to a hidden place's. Swipe, or use the arrows, for the next photo or the one before; **Slideshow** at the top shows them one after the other, every 4 seconds, till a tap.
- **From a chat:** **+** under the message field, then **Collection**, opens the Collection of that chat's place: tap the photos or files to send, then **Send**, and they go in that chat.
- **Backups:** a backup holds the Collection with the rest of the phone. **Settings** → **Data and devices** → **Collection**, or the three dots in the Collection, can leave that Collection out of the backups made while it is open: each Collection has its own choice.
- **On a WebDAV server:** in the Collection's settings, **Also on a WebDAV server** copies that Collection's files as they are, still encrypted, to a folder on a server you choose, Nextcloud, ownCloud or any that speaks WebDAV: give the folder's address, a user name and, best, an app password, then tap **Connect**; **Test the connection** checks them first. Each space and hidden place has its own choice and server; the backups' server is offered first. Only what is not there yet goes, a piece at a time, while the place is open, going on where it stopped after the network drops, and a file deleted here is deleted there too; nothing else in the folder is touched. The server sees only pieces with random names, in a subfolder with a random name, and cannot open them. A phone that lacks a file, as after a backup restored on a new phone, fetches it from there as it opens, and keeps only pieces that open with the file's key. Erevos shows how much of it has come, with **Cancel**: what came stays, and the next time only the rest comes; music, videos, PDFs and **Open with another app** fetch it first too. While everything is copied, backups made while the place is open may leave its pieces out, after Erevos starts again too, until a file is added or deleted. It has a **Through Tor** switch of its own, off unless you turn it on: with it on, the copy goes only through Tor, whatever the space's Tor setting, so the server does not see your IP address; it is slower, and waits while Tor starts. Where there is no Tor, in the desktop app and the web app, a server with it on gets nothing. Under the server, a line says how much of this Collection's own files, encrypted, is on it, and when the last copy began and ended; the chats' photos and backups are not among them. After each copy Erevos lists the folder again, and a piece that is not there whole goes again with the next copy. **Check** looks without changing anything: every piece is there, of its size, and 4 of them, picked at random, are fetched and open with their key, so one the server changed or swapped shows. **Bring back the files not on this phone** fetches at once every file not whole here, as after a backup restored on a new phone, with **Cancel**: what came stays, and Erevos says how many came back and how many the server does not have whole either.
- **With Nextcloud, as LPHL’s:** in that form, and in the backups’ **Add a server**, type your Nextcloud’s address under **Your Nextcloud** and tap **Sign in with Nextcloud**: sign in in the browser, as Fasouli does, through Authentik or however it signs in, and choose **Grant access**. Erevos gets an app password of its own and fills the form with its own folder in your files, **Erevos/Collection** or **Erevos/Backups**, made if it is not there, beside Fasouli’s, which it never reads; then tap **Connect**. Take that app password back in Nextcloud → Settings → Security. The sign-in follows the **Through Tor** switch of the server it signs in for: with it on, Erevos asks your Nextcloud only through Tor, but the browser page itself goes as the browser always does.
- **On your linked devices:** in the Collection's settings, **On my linked devices too** sends that Collection to the [linked devices](#devices) of its space or hidden place, and the switch goes to all of them. A file added, renamed, moved or deleted on one is so on all. Small pictures come at once; a file itself comes at once on the same Wi-Fi, else when you open it, from the WebDAV server if the Collection has one, or through the relay up to 100 MB. Each piece is kept only once it opens with the file's key, and a transfer cut off goes on from the piece that was missing. A file is deleted elsewhere only when it is deleted on one of your devices, never because it is missing there. A hidden place's Collection goes only to that place's own linked devices.
- **Music, videos and PDFs:** a PDF reads page by page inside Erevos (Android 11 and later), decrypted in memory only. Music and videos play straight from their encrypted pieces, never from a copy: a video on the whole screen, music with the next ones in the folder, going on with the screen off, with play, pause, next and previous in the notification and on the phone's lock screen, and only those there. The list goes on after the space locks, unless **Stop playing when the space locks** is on in the Collection's settings; **Stop** and the panic button end it. The notification says only **Playing** unless **Show the title in the notification** is on. **Open with another app** hands the file over as it is decrypted, with no copy on the phone, until you leave the Collection; the other app may keep one of its own.
- **Gallery originals:** with **Delete the original from the gallery after importing** on, a photo or video picked from the phone's files is deleted from the gallery once it is in the Collection, after Android asks you to confirm. It needs Android 11 or later. A photo from the camera never goes to the gallery. If Android does not say which photo of the gallery it is (as from **Recent** in the file picker), the original stays and Erevos says so: pick it from **Images** or the phone's storage.
- **Photos and videos:** in **+**, **Camera** is Erevos's own: photos and videos one after the other, with the flash and the front camera, straight into the Collection, never to the gallery, and no other app sees them; a photo is never written anywhere, not even for a moment, and holds nothing but its picture. Where the phone's maker offers them, as on a Pixel, **Night** and **Portrait** stand beside **Photo**, and **HDR on** at the top: they are the phone's own, made on the phone, and nothing goes out. A tap focuses and sets the light there; two fingers zoom, and the buttons above the shutter go to the wide lens (**0.5×**), **1×**, **2×** and **5×** where the phone has them. **More** has a timer of 3 or 10 seconds, a grid, a silent shutter where the law allows it, **Darker** and **Brighter** and, for videos, HD, Full HD or 4K, and **HDR video on** where the phone films it; in video the light can stay on. **From the gallery** brings in many photos and videos at once; with **Delete the original from the gallery after importing** on, Android then asks once for all of them. HEIC and AVIF photos show among the **Photos** (Android draws HEIC from 9 and AVIF from 12); one the device cannot draw offers **Open with another app**. Under a photo, **Edit** turns it a quarter at a time and cuts it with a frame dragged by its corners: it is kept as a new photo, and the one it came from stays as it was. **Information** says whether a photo or video says where it was taken. A JPEG, PNG, WebP or GIF photo saved out or opened with another app goes without where and when it was taken and the phone, unless **Photos leave with their place and time** is on in the Collection's settings; a video or a HEIC photo goes as it is, and Erevos says first when it names a place. The camera, the gallery and **Edit** are on Android; in the desktop app and a browser AVIF photos show too.
- **Camera before the password:** with Erevos locked, the camera's icon and **Camera** on Erevos's icon open the camera at once, with no password. What it takes, photos and videos, is encrypted as it is taken, for the space opened last, and shows only after that space's password, in its Collection; the camera says how many it took. Nothing else opens from there, not even what it just took: the locked camera holds no key that opens anything, so whoever holds the phone can add to what waits, and see none of it. What was taken for one space never shows in another, and what waits is in no backup: a backup restored deletes it. **Open the camera without the password**, in the Collection's settings, is on unless you turn it off, and is this phone's, the same in every space; off, the camera's icon waits for the password. Left on, it can show that a space exists: while something waits for a space, it lies on the phone as files that another space, once opened, leaves there, and someone shown that other space who reads the phone with a forensic tool finds them. Where a second password must stay unseen, turn it off. What still waits for the other spaces is deleted when the first password's space removes its second password or turns its lock off. It works once a space with a password has been opened on the phone. Android only.
- **In the desktop app:** on Linux, macOS and Windows the Collection works too, its files kept encrypted in Erevos's own folder on the computer. **+** brings in a file from the computer, encrypted a piece at a time; there is no camera. Photos, text, PDFs (in the built-in PDF viewer), music and videos open in Erevos's memory only, never as a plain copy on the disk, up to 1 GB each, and music and videos of any size, read a piece at a time from their encrypted pieces as they play; the file closes, and music or a video stops, when the space locks or with the panic button. **Save to the computer** asks first, as on the phone; **Open with another app** is not there.
- **In a browser and on Sailfish OS:** the web app, on an iPhone's home screen too, and {=Erevos} on Sailfish OS have the Collection as well. **+** brings in a file with the browser's own picker, read and encrypted a piece at a time, so a large one is never held whole; its pieces are kept in the browser's storage, or on Sailfish OS in Erevos's own folder. A browser gives a site only so much room: when it runs out, nothing of the file is kept, and Erevos says so. Photos, text, music and videos open in memory only, up to 256 MB each, and close when the space locks; a PDF is not shown there: save it to read it with another app. **Save to this device** (on Sailfish OS **Save to phone**) asks first; in a browser it takes up to 256 MB, while Sailfish OS writes a file of any size to Downloads a piece at a time. In a browser the WebDAV server has to let the web app in, as for backups; Sailfish OS has no copy on WebDAV.
- **Formats:** on Android MP3, AAC and M4A, FLAC, Ogg and Opus, WAV, AMR, MP4, MKV, WebM and 3GP play, a file that came with no type too, known by its name's ending, as files from other apps often come. In the desktop app and a browser, what the browser plays of them: not 3GP nor AMR.
- **The player's screen:** tap the bar of the music playing at the bottom of the Collection, or **Now playing** under a file of music, for its cover, title, artist and album as the file says them (else its name), a bar to tap or drag to another place, previous, play or pause and next, **Shuffle**, **Repeat** (the list, or the one file) and the speed, from 0.5× to 2×, and the list, the one playing marked: tap another to play it. A video, or music of 10 minutes or more, starts where you left it: where it got to is kept in the Collection's own catalogue, encrypted with it, never elsewhere on the phone, and only for this device. The notification and the lock screen show the title, artist and cover only with **Show the title in the notification** on; otherwise only **Playing**.
- **Subtitles:** an .srt or .vtt file in the same folder as a video, with its name (film.mkv and film.srt, or film.en.srt), plays as its subtitles, read from its encrypted pieces as the video is; **Subtitles on** at the top turns them off, and on again.
- **Playlists:** at the top of **Music**, **New playlist** makes one; songs go into it from their menu (**Add to a playlist**) or chosen together (hold one down, then **Playlist**). Open it to play it in order or shuffled, move a song up or down, or take it out: it stays in the Collection. Playlists are kept encrypted with the Collection, never in plain storage.
- **Radio:** the **Radio** tab holds internet radio stations, each by its link; **+** there adds one. Only https links: Erevos opens no plain http, so a station that has only an http link cannot be added. A playlist link (.m3u, .pls) is read once, as it is added, for the stream's own link; an HLS stream (.m3u8) plays on the phone. A station plays like the music, with the same notice, the same **Stop playing when the space locks** and the panic button; the title it sends shows on the player's screen, and in the notification only when **Show the title in the notification** is on. Unless **Play through Tor** is on, below, the station, and whoever runs its server, sees your device's IP address while it plays, as any site does, and Erevos says so before the first one plays. Erevos sends a station nothing else, and only "Erevos" as its name. Stations are kept encrypted with the Collection.
- **Finding a station:** **Add a station** also searches Radio Browser (radio-browser.info), a free directory of stations anyone can add to: it is sent only the words you type, when you press **Search**, and sees your device's IP address, as the station does. Only stations it has an https link for are shown; a tap adds one. With **Through Tor** on under **Radio and TV lists**, below, the search goes through Tor, and Radio Browser does not see your IP address.
- **A ready list of a country:** **Add a station** also adds, with **Add the stations of this country**, Radio Browser's most listened stations of a country you choose, up to 100, each with an https link. Radio Browser is asked once, when you press it, and sees your device's IP address, unless **Through Tor** is on under **Radio and TV lists**.
- **A playlist of many stations:** a playlist link (.m3u, .pls) that names many stations adds each of them, and **Import a playlist file** adds the stations of a .m3u or .pls file on your device, read there and sent nowhere. Only stations with an https link are added (500 at most from one list), and Erevos says how many were left out.
- **When a stream drops:** if a station's server, or a proxy on the way, ends the stream, or the network goes for a moment, Erevos asks the station again by itself after 1, 2, 4… seconds (at most 30), while you still want it playing, on Android, on a computer and in a browser. After 12 tries in a row it stops and says so.
- **TV:** the **TV** tab holds TV channels, each by its https link, in the groups their list gives them, with a row to show one group and a search by name. A tap plays a channel on the whole screen, as a video, with the same **Stop playing when the space locks** and the panic button; there is no programme guide. It plays on Android, in the desktop app and in a browser; there an HLS stream plays through hls.js, and only when its server lets the web app read it.
- **Adding channels:** **+** in **TV** adds a list by its link (.m3u), read once as it is added, a list file from your device (**Import a list file (.m3u)**), read there and sent nowhere, or one channel by its link. Only channels with an https link are added, a link already there once, up to 15,000 in each Collection, and Erevos says how many were left out. Hold a channel down to rename it, delete it or its whole group, or **Send to a chat** its name and link; a radio station's menu has **Send to a chat** too.
- **iptv-org:** **Add channels** offers iptv-org (github.com/iptv-org/iptv), a public list of free channels: **iptv-org by country**, your device's region first, or **iptv-org: all channels**, over 10,000 of them. Its server sees your device's IP address when the list is fetched, and each channel when it plays, unless **Play through Tor** is on. With **Through Tor** on under **Radio and TV lists**, below, the list is fetched through Tor, so its server does not see your IP address; each channel still does when it plays, unless **Play through Tor** is on too.
- **What a channel sees:** unless **Play through Tor** is on, below, the channel, and whoever runs its server, sees your device's IP address while it plays, as any site does, and Erevos says so before the first one plays. Logos show only with **Show channel logos** on in the Collection's settings, as each logo's server sees your IP address too; otherwise a TV icon. Channels are kept encrypted with the Collection.
- **Radio and TV lists through Tor:** in the Collection's settings, the card **Radio and TV lists** has **Through Tor**, off unless you turn it on. On, Erevos asks only through Tor, whatever the space's Tor setting, for the search in Radio Browser, a playlist or TV list fetched by its link, iptv-org's list and the channels' logos, so their servers do not see your device's IP address. It is slower, and waits while Tor starts. Playing the stations and channels themselves has its own switch, next.
- **Play through Tor:** on Android the Collection's settings also have **Play through Tor**, off unless you turn it on. On, stations and channels play only through Tor, so neither they nor whoever runs their servers see your device's IP address; if Tor does not start, nothing plays straight instead. It is slower and waits while Tor starts, and a TV channel may start slowly or stall for a moment. While the space sends everything through Tor, they play through Tor even with it off. Off, they play straight: before the first one plays, Erevos says that its server sees your IP address, with a **Play through Tor** button that turns it on and plays through Tor, and **Go on**, which plays straight. Only Android plays them through Tor: elsewhere, with it on, they do not play, and Erevos says why; on a computer neither do they while the space sends everything through Tor.

**Why:** some photos and files, a passport, a contract, a picture, should neither sit in the gallery for any app to read nor travel in a chat. The Collection keeps them with the same encryption as the chats, apart from them. Once a file is saved to the phone or opened with another app, it is outside Erevos, not encrypted.

## Backups {#backup}

A backup holds everything Erevos keeps on this phone: every space, with its contacts, the keys of its conversations,
its messages, photos, files, voice messages, imported chats and hidden chats, {+its accounts on Matrix, XMPP and Nostr,
}its Chat with myself, the lock and the panic password, and the settings that go with you to another phone. Inside it
each space stays sealed with its own password, and the backup is sealed again with a password of its own. Its photos,
files and voice messages go in files of their own beside it, up to 4 MB each, whose names start as the backup's; an
automatic backup uses the files of the ones before it too: keep the whole folder together. It is under **Settings** → **Data and devices** → **Backups**.

[+] Session's account and chats go into a backup, sealed with its password and the first space's (a backup made from another space holds them as the first space last kept them), and a restore brings them back, sealed again on the new phone, once the first space opens; a phone with another Session account keeps its own, and Erevos says so; its photos and files do not, and come again from Session while it keeps them. Signal's history goes in too, sealed the same way: its chats and messages, without their photos and files, and not its link to the account, its keys or its safety numbers. After a restore, register or link Signal again; once the first space opens, the old messages show in their chats beside the new ones, to read only. Telegram and Messenger are not in a backup: their sign-ins are each phone's own. After a restore, sign in to them again; their messages come back only as far as each network keeps them. What Erevos keeps of them goes in: each chat's notifications, the Tor choices, and the keys of the ErevosGram encryption.

1. **Make a backup:** under **Make a backup**, tap **Into a folder**, choose a folder (on the phone, a memory card, or
   a cloud app that shows its folders there; on a computer, any folder), type a password for the backup twice (at
   least 12 characters, or four words) and tap **Save**. In a browser the button is **Make a backup**, and the backup
   and its files go to the share sheet, or to the downloads: the first at once, each next one after a tap on **Save**.
   While it is made, its card says what it does and how far it is. Then it says how big it is in all, with the files
   beside it, when it began and when it ended (the time in its name is when it began), and what is not in it: Erevos
   itself and what it keeps only for a while{~, or the Collection's files that are whole on its WebDAV server, which a
   restore fetches from there, or a Collection you keep out of backups}. On Android and in the desktop app Erevos then
   reads it back from the folder, as after each automatic backup (see **Check the backups** below), and says what it
   found. When it is done, a notice says so.
2. **Automatic backups:** choose **Every 6 hours**, **Every day** or **Every week**, then a folder and a password.
   Erevos makes one while it is open, once the last one is older than that: when a space opens, every 15 minutes, and
   as it goes to the background, before it locks; never with no space open. Each one writes only the photos, files and
   voice messages that are new since the one before, and names again the files of the earlier ones for the rest, so
   one every 6 hours costs little. The folder keeps the 3 newest, with every file they need, and deletes the files none
   of them needs. One that failed is tried again when a space opens, or an hour later. Under them are **Back up now**,
   **Change folder** and **Change password**; **Off** stops them, and the ones made stay in the folder.
3. **To a server too:** a backup can also go to a folder on a server you choose that speaks WebDAV, such as your own
   Nextcloud. **Add a server** under **To a server too**, or **To a server (WebDAV)** under **Make a backup**, asks
   for the folder's address, a user name and, best, an app password made for Erevos alone: tap **Connect**, and the
   first backup goes there. With automatic backups on, on Android and in the desktop app, each one goes there too: the
   server keeps the 3 newest, with every file they need, and each one sends only what is new. Without them, and in the
   web app, which makes no backups by itself, one goes there when you send it, with a password you type each time:
   **Send a backup now**, under **To a server too**. Under **Make a backup**, the button then reads **To** and the
   server's name and sends one now; with automatic backups on, it sends one of them, with their password, and none
   into the folder. Erevos then checks it on the server (see **Check the backups** below) and says how big it is in
   all and when it began and ended. One sent with a password of its own goes whole each time, with every photo and
   file, and the server keeps the 3 newest whole: Erevos says so as it asks for the password, with about how much that
   is on Android. Turning automatic backups off keeps the server, for the backups you send; **Stop sending** forgets
   it, and those there stay. Each server has a **Through Tor** switch, in its card and in the form that adds one, off
   unless you turn it on (see **On a server** below).
4. **Restore:** tap **Restore a backup**, choose the file and type its password. Erevos asks once more, finds the
   backup's files beside it, or asks you to choose them or their folder (for an automatic backup, choose every file of
   the folder, as some of its files may start as an earlier backup's name), then puts the backup in place of everything on
   the phone, and opens as it was when the backup was made, with the passwords used then. With one of its files missing, damaged or another backup's, Erevos says which, and nothing is changed unless you choose to restore the rest without it: then the photos, files and voice messages on the phone stay as they are, and those it holds do not come back. **Restore from a server** looks in the folder automatic
   backups go to, or in one you give with its user name and password, and lists the backups there, newest first:
   choose one, type its password, and it is restored the same way, with its files from there.

- **Keep the backup's password:** nothing opens a backup without it, and no one can recover it. Without a password
  lock, the backup's password is all that protects it. Whoever has the file can try passwords on it as fast as their
  computer goes, with no phone to slow them down, so a short one does not hold: Erevos takes none under 12 characters.
- **Automatic backups keep their password on the phone,** so they need no password each time. Whoever opens their
  folder still needs the spaces' passwords to read the chats.
- **What takes room:** on Android, **Measure** under **What takes room** shows how much room Erevos takes on the phone, by kind: {~the Collection with |}the chats' photos and files, voice messages, chat history, Tor, and what writes that did not end left over. Each automatic backup holds it all, so this tells why one is large. Only the files' names and sizes are looked at, on the phone, and nothing is sent.
- **Leftovers:** photos and files no chat{~, Collection|} or import names any more, as those of an import that stopped in its middle, stay on the phone and in every backup. Under **Leftovers**, type one at a time, or several at once separated by commas or spaces, the PIN of each of your hidden chats and the password of any other space, then tap **Find leftovers**: Erevos reads which files each of them and this space name, and shows how much none of them names. **Delete them** deletes those, after you say so once more. A place you did not open there loses its photos and files: open every one first. A file written in the last day is never taken{~, nor what the camera took with Erevos locked while it waits for its space}, and backups already made keep everything.
- **Check the backups:** after each backup into a folder, automatic or made by hand, on Android and in the desktop app, Erevos reads it back from the folder: it opens with its password, every part it names is there, of its size, and two parts picked at random are read through. Of a server it then only looks at the listing: the backup and every part it names are there, each of the size it was sent with, so nothing is downloaded. **Check now** also downloads the server’s newest backup and ten of its parts. A part missing or damaged shows in red: back up now, then check again. **Full check of the folder** reads every part there through and compares it with the SHA-256 the backup wrote down for it: a few minutes for many GB, and nothing leaves the phone.
- **On a server:** the backup sent there is sealed with its password like the others, and that password never leaves
  the phone, so the server cannot open it. Its name is random and the file looks like random bytes, of one of a few
  sizes, so neither says it is Erevos's nor tells exactly how much it holds. Its photos, files and voice messages go
  as uploads of their own, all of one size, each under a random name too and sealed with the backup's password, bound
  to that backup and to their place in it, so none can be swapped, dropped or taken from another backup unseen; the
  server keeps each as long as one of the backups it keeps needs it, and then deletes it. Their names are as long as the backup's, but their size tells them from it, so the server can count them, and so tell roughly how much the backup holds. What a backup cut short left there is deleted before the next one goes, so a server that had no room left has some again. The server still sees your account, when one comes and
  roughly how big it is. On Android, backups go to it as the space's choice under **Settings** → **Relay
  and networks** → **Tor** says{+, as Matrix does}: with **Everything** only through Tor, so the server does not see the
  phone's address; with **Messages** through Tor once Tor is ready, and straight while Tor starts or when it fails;
  with **Nothing** straight, and the server sees the phone's address. A backup first waits up to two minutes for Tor
  to start, and **To a server too** says which way it goes now. In the desktop app the app itself sends them, not its
  page, as a page may not reach such a server; in the web app the browser sends them, and it reaches only a server set
  to let the web app in (CORS), which Nextcloud is not as it comes. Neither has Tor for it: while a space sends
  **Everything** through Tor, none goes from there. In the web app the server's password is kept in the browser,
  sealed with a key the browser does not give out. **Restore from a server** downloads the one you choose the same
  way, through Tor as the space says, and writes nothing there; a password typed for it is used for that restore only
  and not kept. Through Tor no file of a backup larger than 64 MB comes, and straight none larger than 100 MB, the
  most Erevos takes in any download: then download the backup and its files from the server and tap **Restore a
  backup**. An Erevos from before this version does not open such a backup. Google Drive is left out on
  purpose: Google ties the file to your name, and Erevos would need Google's apps and a Google sign-in on the phone.
  Each server's **Through Tor** switch, off unless you turn it on, goes before the space's choice for that server: on,
  its backups go only through Tor, whatever the space's Tor setting, and wait for Tor to start, so the server does not
  see the phone's address. **Restore from a server** and the form that adds a server have the same switch, and the
  Nextcloud sign-in follows the switch of the server it signs in for: the browser page itself goes as the browser
  always does. The desktop app and the web app have no Tor: a server with the switch on gets nothing from there.
  Backup pieces you give to friends ([Backup pieces with friends](#backup-pieces)) do not carry the switch.
- **Chats that went on after the backup:** restoring puts back each conversation's keys as they were then. Messages
  that came after the backup and were already read are not in it. A conversation that went on after the backup would
  stop opening new messages, so each restored chat, the space's and each hidden place's as it opens, starts a new
  conversation with every contact by itself, quietly, from the newest keys they gave it, and their {=Erevos} goes on in
  it. With a contact whose {=Erevos} is older, ask them for their contact link again. Before a restored chat writes again,
  its conversations skip ahead past the keys they may have used since the backup, so no key ever seals two messages:
  one sealed twice would let whoever kept both packets read the two together. In a group, a restored member asks the
  admin's Erevos to put it in again, which works while the group moved on only a little; otherwise ask to be added
  again.
- [+] **Matrix, XMPP and Nostr:** the accounts of each space and of its hidden chats are in the backup. A **Nostr** key
  comes back with its chats, as they were. An **XMPP** account comes back with its sign-in, contacts, chats and the keys
  it knows of other people, and goes on as a new device of the account: it keeps its identity key, so your contacts'
  apps still know its key, but takes a new device id, resource and keys, every conversation begins again, and the old
  device is taken off the account's device lists once it connects. It cannot read messages encrypted to the old device
  after the backup. A **Matrix** account is let go of on this phone, never signed out on the server, which would end the
  device on the phone the backup came from; the space signs in again, as a new device, and its Security Key opens the
  messages from before. Put back as they were, the conversations of such a device would use again message keys that the
  others refuse, and the phone the backup came from may still be using the device.
- **Closed chats:** a backup also holds what **Ring calls when closed** and **Say when a message comes** of hidden
  chats, and **Also while another space is open**, need. So after a restore, on another phone too, they go on as they
  were. A backup from before this version has none of it: restoring it leaves them as the phone has them.
- **Settings:** a backup holds the settings that are yours rather than the phone's: the language,{~ the modules,}
  vibration, notices in the background and the number on the icon, the battery mode, screen privacy, photo quality,
  whether the Phone opens without the password, and how Erevos reaches phones nearby (carrying their messages, the
  same Wi-Fi, Wi-Fi Direct, Wi-Fi Aware and a LoRa radio, which comes back on only where this phone knows it). On
  Android it also holds the Phone's quick replies and the calls it turns away, those of a group of contacts only where
  this phone has a group of that name in the same account. Automatic backups and their server come back with their
  password, but not their folder, which Android lets only the phone it was chosen on write in: on another phone,
  **Backups** says to choose one, and until then they go only to the server.
- **One phone at a time:** a backup restored on a second phone reads the same relay queues as the first, and each
  takes messages the other then never gets. Use it to move to a new phone, not to keep two.
- **The old phone was lost:** a phone that was lost or stolen and is still on goes on reading the relay queues it
  knew, so messages sent there may reach it and never the new phone. After restoring the backup on the new phone, tap
  **The old phone was lost** under **Backups** (after a restore of a backup from another phone, Erevos points at it)
  and say **Move the queues**. Every space and its hidden chats then move to new relay queues, each the next time it
  opens here, and your contacts and groups are told quietly. The old queues are read here until each contact writes
  to the new ones, 14 days at most, and the contact links and QR codes you gave before work for 14 days, then no more.
  What comes through Nostr{+, XMPP or Matrix} still reaches the old phone. After another restore, tap it again.
- **Discretion:** every space shows the same Backups screen, and a backup holds every space, so neither tells how
  many spaces there are or whether hidden chats are set. The files' names say they are an Erevos backup, and their
  number and size show roughly how much is kept.
- [~] **The phone's SMS:** on Android, **Put the SMS in backups** adds the phone's SMS and MMS to each backup from then
  on, with up to 32 MB of their pictures, while Erevos is the SMS app. They are sealed with the backup's password like
  the rest. Restoring the backup puts back into the phone's SMS each message it does not have yet, and deletes none;
  Erevos has to be the SMS app then too, or the rest is restored without them. The SMS are the phone's, the same in
  every space. An older Erevos does not open a backup that holds SMS.
- [~] **The phone's calls:** on Android, **Put the calls in backups**, under **The phone's calls**, adds the phone's call
  history (its newest 10,000 calls, without voicemail) and Android's own list of blocked numbers to each backup from
  then on, while Android lets Erevos read the call history; the blocked numbers only while Erevos is the Phone or SMS
  app. It is off until you turn it on, and the choice goes in backups. They are sealed with the backup's password like
  the rest. Restoring the backup adds to the phone each call and blocked number it does not have yet, and deletes
  none; Erevos has to be the Phone app then (**Settings** → **Phone and SMS** → **Phone**), or the rest is restored
  without them. Android keeps about the newest 500 calls of each SIM, so older ones restored may go as new calls come.
  An older Erevos does not open a backup that holds calls.
- [~] **The SMS in order:** each space's pins, archived conversations, Trash, drafts, spam filter and marks, how long an
  SMS waits to be taken back, the SMS to go later (**SMS later**), invites, names from your contacts, whether messages
  to Erevos contacts may go by SMS, and the SIM chosen for each number are in every backup, sealed with the space's
  password like the rest. The SIM chosen comes back only on the same phone, as each phone gives its SIMs ids of its own: on another, SMS and calls go on its default SIM until you choose one there. An SMS for later whose time came before the restore does not go by itself, as the phone the
  backup came from may have sent it: it shows as not sent, and a tap on it sends it or deletes it. One still to come
  goes at its time. An older Erevos does not open a backup that holds them; one made by an older {=Erevos} restores as
  ever, without them.
- **What never comes back:** what belongs to the phone itself comes with no backup, so a restore on another phone
  cannot bring it: the fingerprint or face, whose key Android keeps in that phone's chip; the folders Erevos may write
  in, as that of automatic backups, which Android lets it into only on the phone they were chosen on; what Android lets
  Erevos do{~ and which apps make calls and send SMS}, which only you can allow on each phone, so after a restore on
  Android **Permissions** opens{~ for the modules that are on}; {~the call history and Android's own list of blocked
  numbers, unless **Put the calls in backups** was on, as above; |}and the count of wrong passwords.{+ An XMPP account comes
  back as a new device of itself and Matrix signs in again, as above,}{- Linked devices link again, as below.}{+ and linked devices link again, as below.}
- **Linked devices:** a link stays with the phone and the computer it was made on, and no backup holds it, but a
  backup holds what lets the phone it is restored on ask each of them to link again. After restoring a backup on
  another phone, open **Settings** → **Data and devices** → **Linked devices** there: under **From the backup**, tap
  **Ask to link again** for each device that is still yours, or **Let go** for one that is not. The device, which has
  to be on, shows the ask: tap **Link again** there only if you restored the backup yourself, otherwise **Not now**.
  It then links to the new phone with no code to scan, keeps its chats and gets what came since; messages that reached
  the old phone after the backup stay on it only. Once linked again, neither the old phone nor anyone with the same
  backup reaches it. An ask is good for 14 days, and a hidden place's devices are asked from inside that place. A
  device on an older {=Erevos} shows no ask: tap **Unlink this device** on it, then link it as the first time, see
  [Linked devices](#devices). Contacts on this version stop writing to your computers until they link again: the phone gives them a new list of its devices that names none. If this phone's clock is behind the lost one's,
  that list goes once they write to it, and their chat details may say it changed the day after you restored. A
  linked computer's own backup holds the phone's chats as they were, but
  not the link to write in them: restored, they can be read there but not written in, and Erevos says so once. To write
  in them, link that computer to the phone again: the chats the phone still has stay, with what came since, and the
  others go. On the phone, unlink the device it was before. Make the backups on the phone.
- **Versions:** a backup opens only in an Erevos as new as the one that made it, or newer. One made by a newer {=Erevos} is
  refused, with nothing changed: update Erevos to the latest version first. An Erevos from before 6.0.0 says a backup
  from 6.0.0 on is not an Erevos backup: update it too.

## Backup pieces with friends {#backup-pieces}

The password of your backups can go to friends in pieces, under **Settings** → **Data and devices** → **Backup
pieces**: choose **2 of 3**, **2 of 4**, **3 of 4** or **3 of 5**, then as many contacts, and tap **Give the
pieces**. With automatic backups on, Erevos checks that the password you type is theirs. With a server under **To a
server too**, the pieces can hold its address, user name and password as well, so the backups there can be found and
opened with them. Each contact gets a message that says what it is, and their {=Erevos} keeps the piece apart from the
chat, under **Pieces you keep for friends**.

1. **To get it back:** ask enough of them for their pieces. Each taps **Show the code** beside yours, and you tap
   **Scan a code** under **Put your pieces together**; or they tap **Copy** and send you the text another way, and you
   paste it and tap **Add**; or, while your phone still has the account, they tap **Give it back in your chat**. Then
   tap **Put together**: Erevos shows the password, and, with a server in the pieces, **Restore from that server**
   lists the backups there.
2. **A new password:** once your backups have a new password, the pieces given before are of no use: give new ones.

- **What a piece shows:** nothing. Fewer pieces than needed say nothing of the password, however much computing is
  put to them: with them, every password is as likely as any other. Every piece has the same size, whatever the
  password, and nothing in it names you or the other friends.
- **On your phone:** the message stays in the chat, but its piece does not: once it went, nothing on your phone keeps
  the pieces, only to whom they went. Whoever opens one of your spaces learns whom you gave pieces to, not the
  password. Pieces go to the space's contacts only, not to hidden chats.
- **What it cannot stop:** enough friends together can open your backups if they also get the file: choose people
  who do not all know each other. Someone may pretend to be you, from a new number or a new account, to get the
  pieces: a friend should give one back only to you in person, or in the chat they already have with you. A friend
  whose {=Erevos} is older than this version sees the message but keeps no piece.

**Why:** a backup is only as safe as its password, and a strong password is easy to lose. Split this way (Shamir's
secret sharing), no single friend, and no relay, holds anything that opens it.

## Moving to a new phone {#new-phone}

Everything Erevos keeps goes to a new phone in one backup: every space with its hidden chats, contacts, messages,
photos{~, files and Collection| and files}, its accounts and relays, the lock, the panic password and your settings. No server
keeps a copy of it for you, so nothing comes over by itself: the backup carries it, sealed with its password.

1. **On the new phone, install {=Erevos}:** the same version as on the old phone, or newer, as an older {=Erevos} refuses
   a backup a newer one made. With no internet, the old phone can give it, see [Erevos to a phone nearby](#give-app).
2. [~] **On the old phone, get it ready:** for the phone's SMS to come too, turn on **Put the SMS in backups** under
   **Backups**, and for its call history **Put the calls in backups**. A Collection left out of the backups stays behind: put it back in, or give it a WebDAV server, see
   [Collection](#collection).{+ Have your Matrix Security Key at hand, as Matrix signs in again on the new phone.}
3. **On the old phone, make the backup:** under **Settings** → **Data and devices** → **Backups**, tap **Make a
   backup**, or **Back up now** with automatic backups. Make it last, just before you move, and from then on do not
   open Erevos on the old phone: what comes after waits on the relays for the new one.
4. **Bring it over:** copy the backup and every file whose name starts as its name, all in one folder, to the new
   phone, by cable, a memory card or a cloud app. A backup on your server needs no copying.
5. **On the new phone, restore:** at the first start, tap **I already have {=Erevos} on another phone** (or go through
   the first start).{~ On Android, for the SMS, let Erevos be the SMS app there too.} Then under **Settings** → **Data and devices** → **Backups** tap **Restore a backup** and choose the
   file, or **Restore from a server** and give the server's address, user name and password; type the backup's
   password and say yes. Erevos opens as the old phone was, with the same passwords.
6. **On the new phone, set again what is the phone's:** **Permissions** opens for what Android should allow. Then
   turn on the fingerprint or face again (see [Password lock](#lock)), choose the folder of automatic backups again
   under **Backups**, and the SIM for each number{+, and sign in to Matrix with its Security Key}.
7. **On the old phone, wipe Erevos:** once the new phone shows your chats and new messages come there, tap **Wipe
   everything now** under **Settings** → **Privacy and security** → **Panic button**. Not **Delete me from
   everywhere**: that deletes the relay queues the new phone reads.

- **One phone at a time:** both phones read the same relay queues, and a message goes to whichever takes it first,
  so the other never gets it. Keep the old one closed from the backup on, and wipe it at the end.
- **Your contacts:** each space keeps its relay, its token and its home relay, so there is nothing to type again and
  no invite to ask for. Your contacts write to you as before.
- **Hidden chats:** every hidden place comes with the backup, each with its PIN, and nothing on the new phone tells
  that there are any, see [Hidden chats](#hidden).
- [+] **Matrix, XMPP and Nostr:** a Nostr key goes on as it was, an XMPP account as a new device of itself, and Matrix
  signs in again as a new device, its Security Key opening the messages from before, see [Backups](#backup).
- **Linked devices:** on the new phone, under **Settings** → **Data and devices** → **Linked devices**, tap **Ask to
  link again** for each computer or browser that is still yours, then **Link again** on it: it keeps its chats, with
  no code to scan. A hidden place's devices from inside that place. A device on an older {=Erevos}: tap **Unlink this
  device** on it, then link it to the new phone as the first time. See [Backups](#backup).
- [~] **The Collection:** it comes in the backup's files. One left out of the backups comes only from its WebDAV server,
  each file as it opens; one with neither stays on the old phone, and the wipe deletes it.
- **{~Modules and settings:** the modules that are on, the|Settings:** the} language and your other settings come with the backup.
  What Android keeps for each phone stays there, as what it lets Erevos do{~; the call history and its blocked numbers
  come too with **Put the calls in backups** on}.
- **A file missing:** with a file of the backup missing or damaged, Erevos says which and changes nothing, unless you
  choose to restore the rest without it.
- **If the old phone is lost:** restore your newest backup on the new phone as soon as you can, from your server too,
  then tap **The old phone was lost** under **Backups**, so it reads nothing more of yours on the relays.
  If you lost the backup's password, friends holding its pieces can give it back, see
  [Backup pieces with friends](#backup-pieces).

**Why:** Erevos keeps nothing of yours on a server that could hand it back, so no account brings your chats to a new
phone. One backup, sealed with its password, carries all of it, and only you can open it.

## Panic button {#panic}

When you are in danger, Erevos can wipe itself at once, under **Settings** → **Privacy and security** → **Panic
button**: tap **Wipe everything now** and say **Wipe**. On Android, in the web app, on a computer and on Sailfish OS.

To find it fast in an emergency, it is also first, in red, in the **⋯** menu of the home screen, and holding down the
lock at the top of the home screen opens it at once. A tap on the lock still locks; only holding it down opens the
panic button, and there **Wipe everything now** still asks once more.

- **What goes:** every space and its hidden chats, with their contacts, messages, photos, files and keys; the lock and
  its passwords; {+the Matrix, XMPP and Nostr accounts and }the relay tokens; the settings and password of automatic
  backups, and of their server. On Android, Erevos then closes, and opens next time as if just installed. With **Also the
  automatic backups in** the folder chosen, the backup files there go first.
- **What stays:** what Erevos cannot reach: backups you copied elsewhere or sent to a server (their password still
  guards them), what the relay holds for you until it expires, and what your contacts have.

1. **From a panic app:** on Android, a panic app such as Ripple wipes the apps you choose with one gesture. Install
   one, choose Erevos in it: Erevos opens this screen, after its password, and asks. Tap **Say yes**.
2. **Only that app:** only the app you said yes to can wipe Erevos, and only while **A panic app may wipe Erevos** is
   on. Erevos checks the app's name and its signature: another app, or the same name installed again by someone else,
   cannot. An update of the app that moves to a new key the way Android allows (key rotation) is still trusted.
   **Stop trusting** ends it.
4. **When Erevos refused:** if the trusted app asked to wipe while the switch was off, or signed with another key,
   this screen says so in red, with the day and the time. When the app is signed with another key, **Trust … as it is
   now** trusts it again: say yes only if you updated it yourself.
3. **After a wipe:** the panic app is forgotten too: say yes to it again once you set Erevos up again.

- **On a computer and on Sailfish OS:** there is no panic app, only **Wipe everything now**, with **Also the automatic
  backups in** their folder if you choose it. On a computer Erevos then starts again as if just installed; on Sailfish
  OS it closes. The keyring's item for Erevos stays on a computer, but what it sealed is gone, so it opens nothing.
- **What it cannot hide:** on the phone, without the password, one can still see that Erevos is installed, and that a
  panic app may wipe it, though not what was in it.
- **Telling other apps (Android):** under **Tell other apps**, choose the apps Erevos tells as it wipes, as a panic
  app does, from the button, the panic password or a panic app. Each one asks you first whether Erevos may. Fasouli
  then locks itself: it closes, and asks for its lock again when it opens.

**Why:** at a border or in an arrest there may be no time to open each chat. One tap, or the gesture of a panic app,
leaves nothing to open.

### Panic password

With the password lock on, the same screen offers a **Panic password**: a password of its own that, typed on the lock
screen, wipes Erevos as **Wipe everything now** does. On Android, in the web app, on a computer and on Sailfish OS.

1. Tap **Set the panic password**, type it twice (at least 4 characters) and tap **Save**. It must differ from every
   password of your spaces: Erevos refuses one that opens a space, and no space's password can become it later.
2. Typed on the lock screen, it shows **Wrong password**, as any wrong one does, and Erevos wipes everything at once. On
   Android Erevos then closes, and opens next time as if just installed, and the automatic backups in their folder go
   too when **Also the automatic backups in** is on under **From a panic app**; elsewhere they stay.
3. **Turn off the panic password** makes it only a wrong password again. Setting it again replaces the one before.
   Turning the password lock off turns it off too.

- **Nothing shows it:** Erevos keeps a place for a panic password from its first start, random until one is set and
  shaped the same after, and checks it with every password typed on the lock screen, the same way and for as long. So
  neither what the phone keeps nor how long a check takes shows whether one is set, and this screen cannot tell you
  either: if you are not sure, set it again.
- **Only on the lock screen:** typed anywhere else Erevos asks for a password, it is only a wrong one. Backups keep
  it as it was when they were made. While wrong tries make the lock screen wait (see
  [Password lock](#lock)), it waits too.

**Why:** someone may make you open Erevos. With a panic password you can seem to give them yours, and what they would
see is gone before the screen changes.

## Delete me from everywhere {#forget}

When you want what the servers keep for you gone, under **Settings** → **Privacy and security** → **Delete me from
everywhere**: tap **Delete me from everywhere** and say yes twice. Your phone keeps everything it has; this is not the
[Panic button](#panic), which wipes the phone.

- **What goes:** every queue this space has on the relays, with the messages waiting in them: your own, the one your
  contact link names, your groups', your contacts', your home relay's, {+the ones for Matrix and XMPP notices, }the doors of
  your public groups and those of your linked devices. Also the messages a relay holds for you to send later, the files
  that came and wait on it, and the invites you made and nobody used. Hidden chats that receive while closed go with the
  space; the others when you open them while the space is stopped. The screen's lists leave hidden chats out, so they
  never show that there are any. Erevos also asks every Nostr relay to forget the keys your chats read on (a
  request to vanish, NIP-62): through Tor when Tor is on, straight when it is off. With Tor on but not ready yet, Nostr
  is not asked; wait until it is, and delete again.
- [+] **Matrix, XMPP, Nostr:** with **Also sign out of Matrix and XMPP, and delete the Nostr account made here**, those
  accounts are signed out here. Their accounts stay on their servers, which are theirs, not Erevos's. A Nostr account you
  brought from another app is left alone.
- **The space is stopped:** it receives and sends nothing, so no queue is made again at once (Erevos makes a lost queue
  anew by itself). **Start again** ends it: new queues are made, as after a relay lost them, and your contacts are told
  quietly. Give them a new contact link too, as the old links name queues that are gone.
- **What it cannot reach:** your contacts' phones, Nostr relays that do not do as asked,{- and} files you sent through a file
  server{+, and the Matrix and XMPP servers}. The screen lists what was deleted, what was gone already and what could not be
  reached; **Delete again** tries the rest.

**Why:** a relay, even one you trust, is a place that keeps something of you. This is the one tap that takes it all back
without wiping the phone, for when you leave a relay, or a chapter of your life.

## Imported chats {#import}

Your old chats from Telegram and WhatsApp can come into Erevos, to read, with their photos, videos, voice messages and
files, and those from Viber with their words. They stay on this phone, sealed in the space you bring them into, and go
to no one unless you share one with the person it was with (below).

First export the chat from the other app:

- **WhatsApp:** open the chat, then **More**, **Export chat**, **Include media**, and save the .zip to the phone.
  **Without media** brings only the words.
- **Telegram Desktop:** **Export chat history**, format **JSON**, with the photos, videos, voice messages and files you
  want. Then make a .zip of the folder it made (on Windows: right-click it, **Send to**, **Compressed (zipped) folder**)
  and copy the .zip to the phone. **result.json** on its own brings only the words.
- **Viber:** Viber itself exports no chats. On Android, the app **Backup Text for Viber** saves one as an .html file:
  copy that to the phone. Only the words come in, with Viber's emoticons as emoji. Your own messages there carry no
  name, so they come in as **Me**, already picked as you. Messages from a day before Viber existed, such as 1970, are
  from a phone whose clock was wrong: they come in with no time.

Then:

1. In Erevos, open **Settings** → **Data and devices** → **Imported chats** and tap **Import a file**, then pick the
   file.
2. Erevos says what it found, with how many photos and files and how large they are together. Tap your own name, so
   your messages show on the right, and tap **Keep**. The files come in one after another, and it says how many and
   what share of them are in. **Cancel** stops it then, and keeps none of them.
3. Delete the export file from the phone yourself: Erevos keeps its own sealed copy, but the file you saved is not
   sealed.

To go on with the conversation in Erevos, the other person needs Erevos too:

1. With **New chat**, add them as a contact through the relay, as in [Chat through a relay](#relay).
2. Open the imported chat, tap **Continue in Erevos** and pick them.
3. Their chat now shows the old messages ahead of the new ones, as if they had always been in Erevos: in bubbles, by
   day, with their times, and **Continued in Erevos** between them and the new. **Open the chat** takes you there, and
   a contact you have not named takes the imported chat's name.

**From inside the chat:** a contact's chat has **Imported chats** in its **Details**, above **Privacy**. **Import a chat
here** brings a file in straight into that chat, without going through **Settings**: when the file holds several
chats, as a Telegram export of all of them does, it asks which one goes on here, and offers the longest. Each imported
chat that goes on there is listed with three buttons:

- **Keep only in the chat** takes it out of **Settings** → **Data and devices** → **Imported chats**: it shows only in
  that chat, as if it had always been there. A chat brought in from the chat's details is kept so from the start.
  **Show in Imported chats too** puts it back in the list, and so does the list itself, when that contact is gone.
- **Unlink** stops it showing in the chat; it stays in **Imported chats**, to read or to go on with someone else.
- **Delete** deletes it from the phone, with its photos and files, after asking.

**Why:** an old chat belongs with the person it was with, so it is brought in, kept and deleted where you talk to them,
and the list in **Settings** keeps only what has nowhere else to go. Nothing of it leaves the phone unless you share it.

- **Photos, videos, voice messages and files** come in from a .zip, each sealed in this space as a file in a chat is.
  Photos show in the chat as you scroll to them, and stickers as stickers; tap a photo or file to see it on its own and
  **Save** it. Voice messages and songs play right in the chat with a tap; a video plays in the phone's own app once
  saved. Hold an imported message to **Copy** it or **Open** its file. **Search in this chat** finds the imported
  messages too. Files larger than 4 GB, and those the export does not hold, stay behind, and the chat says where
  one was.
- **Room on the phone:** while a .zip comes in, the phone needs about twice its size free, as Erevos reads a copy of it
  and keeps the files sealed. Backups hold imported files too, as other files.
- **Only to read:** imported messages are not sent as messages, so the other phone has them only if you share the chat
  with them. Erevos cannot show who really wrote them.
- **Notices and calls** from the other app are left out, and the chat says how many.
- **In hidden chats** too: in a hidden chat's **Details**, **Import a chat here** keeps the chat with that place,
  encrypted with its key, and shows it only in that chat, never in **Settings** → **Data and devices** → **Imported
  chats**; there it can only be deleted. A chat moved into hidden chats takes the chats imported into it along, kept
  only in it there, and brings them back if it moves back.
- **Delete messages** in a chat leaves the imported ones: delete those in the chat's **Details**, under **Imported
  chats**, or in **Settings** → **Data and devices** → **Imported chats**.

**Share it with them:** the person an imported chat goes on with can have it too. In their chat's **Details**, under
**Imported chats**, tap **Share with** and their name; in **Settings** → **Data and devices** → **Imported chats** a
chat that goes on with someone has the same button, which opens their chat. Erevos says how many messages and how many
MB go, and asks first. Then all the chats imported with them go together, whatever their size, every message with
every photo, video, voice message and file kept, to them alone, end-to-end encrypted through your relay, and the chat
says you shared it.

- **On their side** there is nothing to do: their {=Erevos} keeps the messages at once, says in the chat who shared them,
  from where and how many, and shows them ahead of the new ones, only to read, as an imported chat. The photos and
  files fill in as they come, and under that line it says how many came, **Files: 3 of 10**. The sides are swapped:
  what you wrote shows as from you, on their left, and in a chat of two what they wrote shows as their own, on the
  right; in a group, everyone keeps their name. It is kept only in your chat there, and they can delete it in its
  **Details**. Their linked devices keep the messages only.
- **Shared again**, it takes the place of the copy they had, so it is never there twice. A chat someone shared with you
  is not shared on.
- **Only with them:** only with an Erevos contact the chat goes on with, never with a group, and it cannot be forwarded.
  In hidden chats it works the same, and on their side it stays in the place your chat is in, hidden chats too.
- **In rounds:** the photos and files go after the messages, a few dozen MB at a time: each round waits on your relay
  until their phone takes it and deletes it there, and then the next goes. So a chat of any size goes, each file up to
  4 GB, and needs little of the relay's room, which other files share; when the relay is full, Erevos waits and asks
  again, a little longer each time. It goes on whenever both phones run Erevos, also after either was off or offline
  for a while; a round not taken in 12 days is put on the relay again before it expires. A file deleted from this phone
  since is named as one that stayed behind.
- **How far it is** shows under your line in the chat, **Sharing, 40%**. Tap it to **Stop sharing**: what waits on the
  relay is taken off, and their {=Erevos} deletes what came of it. If they delete the chats, it stops the same way.
- **From a relay their {=Erevos} does not take from by itself**, the chats wait on their side for a tap on their line; then
  it says how far they have come, **Coming, 40%**, and your line says **Sharing · their phone is taking it**. If they
  could not be taken, both phones say so and theirs buzzes twice: they tap it to try again. Taking them from there
  without Tor shows that server their internet address, and {=Erevos} says so first.
- **An Erevos from before** gets a file instead, **Chat from Telegram.json**, with the messages in it as text, and none
  of the photos and files.

> The file of imported chats grows with what you bring in, so its size tells roughly how much was imported, but not
> into which space.

## Appearance {#appearance}

**Appearance** follows Fasouli and the LPHL site. It is under **Settings** → **Appearance**, in parts that each
open alone: **Style and colours** (the look, glass, style, theme, colours and text on coloured areas below, with the
**Preview**), **Wallpaper**, **Messages**, and on Android **Launcher icons** and **Widget**.

| Setting | Choices |
| --- | --- |
| **Look** | **Flat**, or **Glass** as on lphl.nekten.eu. Glass comes in two kinds: **Panes** (each card a pane of glass over the wallpaper) and **One pane** (each screen on one frosted pane). |
| **Style** | **Classic** (Erevos's dark and gold), **Modernist** (Inter Tight), **Nocturne** (always dark, with its own colours), **Neon** (cyan and magenta LEDs that glow, over a grid running to a setting sun), **Matrix** (green on black in monospace, with code raining behind), **Paper** (fountain-pen blue on cream, in a serif, over ruled lines with a red margin), **Aurora** (violet on near-white, soft and round, over pools of mint, lilac and peach light), **Material You** (the phone's own colors, on Android 12 and later) and **Custom** (your own background and accent). |
| **Theme** | **System**, **Light** or **Dark**. Nocturne, Neon and Matrix are always dark, Paper and Aurora always light, and Custom is light or dark as its background is. Material You follows it. |
| **Colors** | The style's own, one of the twelve LPHL palettes, or **My color**. Choosing a palette under a style with its own colours goes back to the style chosen before. |
| **Custom** | With **Custom** chosen: its **background** (eight light, eight dark) and its **accent**. The text and the surfaces are made from the background, and every color is checked to read on it. |
| **Text on colored areas** | **White**, **As in the palette**, or **My color**. |
| **Letters** | The letters of every text: **The style's own**, **The phone's**, **Serif** (small strokes at the letters' ends, as in books) or **Monospace** (every letter as wide, as on a typewriter). |
| **Wallpaper** | What lies behind every screen: **Style default** (the style's own scene or glow), **Plain**, or a pattern drawn faintly in the accent: **Dots**, **Grid**, **Stripes**, **Stars**, **Lights** (soft circles of light) or **Gradient**; or **Photo**, a photo of your own, made smaller, drawn anew and sealed, under a veil so the text reads (**Change photo** picks another). The password screen shows the style's own instead. |
| **Messages** | How a chat draws messages: **Round** bubbles, **Square** ones, or **Line**, no bubble but a line beside the text, as a log. |
| **Text size** | How large the messages' text is: **Small**, **Normal**, **Large** or **Larger**. The rest of the screen stays as it is. |

Erevos, newly installed, starts in **Glass** (**Panes**), **Modernist**, **System**, **My color** in sky blue, text **As in the palette**, **The phone's** letters and **Square** messages. A look chosen before stays as it was.

Neon, Matrix, Paper and Aurora draw their own scene behind every screen, Custom keeps the background you chose and
Material You the phone's colors, so **Glass** waits while they are chosen. The rain stands
still when the phone is set to reduce motion.

The **Preview** shows a few messages and buttons in the look you chose. Every combination is checked so that text
always reads well, on glass too.

- **Each space keeps its own look.**
- **The password screen** shows the look last used. To do so it is kept outside the sealed data: it says nothing
  about your chats, but whoever opens the phone sees which look you use.
- **Material You** takes the colors Android makes from your wallpaper (Android 12 and later), light or dark as
  **Theme** says, with round buttons and softly rounded cards, in the phone's own font. A new wallpaper changes them
  in Erevos too, once it shows again. They are read on the phone and go nowhere. On older Android and on a computer
  it is not offered.
- **Launcher icons** (Android): the colour of each of Erevos's icons among the phone's apps, **Erevos** (red, it
  opens the Erevos chats, or the chat you left open){~, **Phone** (green, it opens the keypad), **SMS** (blue, it opens
  the SMS list)} and **Contacts** (violet): red, orange, green, blue, violet or dark. Each tap opens what its icon
  names, also when Erevos showed another of them. The colour is the phone's, not each space's, as the icons show
  before Erevos is unlocked. After a change some launchers take the icon off the home screen: add it again from the
  list of apps.
- [~] **Camera** (Android, under **Launcher icons**): Erevos's camera at a tap. **Put the Camera among the phone's apps**
  adds an icon of its own (orange at first, in any colour), and holding Erevos's icon down offers **Camera** too, which
  can also be dragged to the home screen. Either opens the Collection's camera, and what it takes goes straight into
  the Collection: with Erevos locked, at once, and what it took shows only after the password (**Open the camera
  without the password**, in the Collection's settings); with that off, behind Erevos's password and the Collection's.
  Neither shows while the Collection is off in **Modules** or the calculator stands in place of Erevos.
- **Dots and numbers on the icons** (Android): Android gives a notice's dot or number to the app, not to one of its
  icons, so on most launchers, such as those of Pixel and GrapheneOS, Samsung's, Xiaomi's and Kvaesitso, each notice
  of Erevos (a message, {~an SMS, |}a call, a birthday) shows on the Erevos{~, Phone, SMS and| and} Contacts icons alike; Erevos
  cannot change that there. To keep the dot for some notices only, turn it off for the others in Android's settings
  for Erevos's notifications, where each kind of notice has a switch of its own. Huawei's and Honor's launchers take a
  number for each icon: there, with **Settings** → **Notifications** → **Number on the icon** → **Show the number**,
  Erevos's own icon shows the messages its notice counts, {~the SMS icon the SMS not read, the Phone icon the missed
  calls |}and the Contacts icon a birthday today, each number on its own icon only.
- **Calculator in place of Erevos** (Android, under **Launcher icons**): a calculator that works shows among the
  phone's apps instead of Erevos's icon. Tap **Put the calculator in its place**, type a code of 4 to 12 digits twice
  and tap **Save**. From then on open the calculator, type the code, then **=**: Erevos opens, asking for its password
  as always. Any other sum is only a sum. **Change the code** changes it; **Show Erevos's icon again** brings the icon
  back, in its colour, and forgets the code. Only the icon is hidden: Android's list of apps, the notices, the recent
  apps, and the {~Phone, SMS and |}Contacts {~icons|icon} still {~show|shows} Erevos. The phone keeps only a hash of the code: it is a door,
  not the lock. Once Erevos is wiped, by the panic password or Android's **Clear storage**, no code opens it any more:
  the calculator then opens Erevos, as new, and Erevos's own icon comes back in its place.

  **Why:** whoever glances at the phone sees a calculator, not a messenger; the password still guards what is inside.
- **Widget** (Android): the order of the widget's {~four|two} buttons, from left to right, with the widget drawn as it will
  look. Tap ↑ or ↓ to move a button; **First order** puts them back.
- **Vibrate on touch** (Android): a short buzz when you tap a key of the keypad, Send, Enter or a switch, and when a menu opens; never while you scroll. On unless turned off here. It is the phone's, the same in every space.

## On a computer {#desktop}

Erevos also runs on a computer, Linux, macOS or Windows, as an app of its own. It chats through a relay, end-to-end
encrypted as on the phone, and keeps its contacts, messages and settings sealed the same way.

1. Install it. On Linux: the package for Arch-based systems (\`erevos-linux-x86_64.pacman\`, with \`sudo pacman -U\`) or the
   AppImage. On a Mac: open the disk image and drag Erevos to Applications. It has no paid Apple signature, so the
   first time allow it under **System Settings → Privacy & Security → Open Anyway**. On Windows 10 or 11: run
   \`erevos-windows-x64-setup.exe\`, which installs Erevos for you alone, with no administrator, and puts it in the
   Start menu; or keep \`erevos-windows-x64-portable.exe\` where you like and run it, with nothing installed. Neither
   has a paid signature, so the first time Windows says it protected your PC: tap **More info**, then **Run anyway**.
2. Set the relay and add contacts as on the phone, see [Chat through a relay](#relay). **Copy my contact link** copies
   your link, to paste where it should go.

- **What only the phone does:** Bluetooth, Wi-Fi Aware and LoRa, and their tests. Contacts on the same Wi-Fi it reaches
  as a phone does, see [Chat with a nearby phone](#nearby). The rest is the same: spaces and the second password,
  hidden chats, voice messages, imported chats and backups.
- **Where it keeps things:** in its own folder (on Linux \`~/.config/Erevos\`, on a Mac
  \`~/Library/Application Support/Erevos\`, on Windows \`%APPDATA%\\Erevos\`), sealed as on the phone. Its keystore is
  sealed with the system's keyring (on a Mac the Keychain, on Windows the key of your Windows account). On a Linux
  system without a keyring (KWallet or GNOME Keyring), or one Erevos does not find, Erevos opens with a note and keeps
  nothing: start the keyring, or give Erevos \`--password-store=gnome-libsecret\`. Started with \`--plain-secrets\`, it
  keeps its keystore there as it is, readable by your user: then set a password lock. The portable Windows app keeps its things in the
  same folder as the installed one, and uninstalling leaves them there.

**Why:** without a keyring, the keystore would lie on the disk as it is, readable by your user, so Erevos keeps nothing
there unless you choose it with \`--plain-secrets\`: no password slot lies there unsealed by surprise.

- **Windows' firewall** asks, the first time Erevos opens, whether it may use the network. Allow it on private
  networks, or phones and computers on the same Wi-Fi cannot reach it; relays work either way.
- **Voice messages** recorded on a computer are Opus, on a phone AAC. Both play on both.
- **Photos** come from the computer's files; there is no camera. **Save** asks where to put a photo or file.
- **A computer and a phone can share an account:** link the computer to the phone, and both have the same chats and
  contacts, see [Linked devices](#devices). Or a backup moves everything from one to the other, see
  [Backups](#backup), and from then on use only the one.
- **In the background:** closing its window leaves Erevos running in the system tray (on a Mac, in the Dock), unless you
  turn it off: **Settings** → **Notifications** → **In the background** → **Quit when closed**. It goes on waiting at
  the relay: a call rings, with a ring of its own, and brings the window back, and a notification says how many messages
  are not read, never who or what, until Erevos shows again. Open it from its icon in the tray, or by starting Erevos
  again, and quit it from that icon's menu (on a Mac, from its menu). Where the desktop shows no tray, as GNOME without
  an extension for it, starting Erevos again brings the window back. Quit, it receives nothing: messages wait on the
  relay, and a call shows as a missed call once it opens.
- **Calls** ring while Erevos shows, with a ring of its own: two short rings every 3 seconds, until the call is
  answered or ends.
- **Tested so far** on Linux. The Mac and Windows versions are built and opened on GitHub's computers, not yet by a
  person.

## Linked devices {#devices}

The same account on the phone and on a computer, or in a browser: the same chats, contacts and messages on both. The
phone stays the account: it alone adds contacts, and links and unlinks devices. Each linked device has keys of its
own, which the phone signs into a list of the account's devices and gives its contacts. Contacts on this version then
write to each device too, end-to-end encrypted, so it gets their messages with the phone off; for those on older
versions the phone passes on to the computer what comes, and seals for them what the computer writes. Contacts see the
same account and the same safety number, whatever version of Erevos they have.

**Why:** each device has keys of its own, never a copy of the account's: Erevos has no server that could cut off a lost
device, so a device is never more than an entry in a list the phone signs, and unlinking it is enough. The list always
has four places, those no device takes holding keys made for nothing, so contacts cannot tell how many devices you
have. And with the phone as the account, contacts on any older Erevos reach you as before.

To link a computer:

1. On the computer, in a space with no chats of its own (a new install, a space a new password opens, or a linked
   computer's chats restored from its backup), open **Settings** → **Data and devices** → **Linked devices**. There
   **Link to my phone** comes first, and shows a small QR code at once: nothing to type.
2. On the phone, scan the code with the camera: Erevos asks **Link … to this phone?** Choose what of the history
   goes (**All of it**, **The last month**, **The last week** or **None**), whether **Photos and files too**, then tap
   **Link**. That is all: the phone gives the computer what it needs through Nostr, end-to-end encrypted, and the
   computer shows its own code to the phone and the safety codes are compared on their own, so nothing is typed or
   compared by you.
3. If Nostr cannot be reached, or the computer cannot use the relay, it says so. Tap **Link another way** there: if it
   asks for a relay, LPHL's is filled in, so tap **Sign in with LPHL** for a token of the computer's own, or type
   another relay and its token. Name the device and tap **Link to my phone**: it then shows a larger QR code. Scan it
   with the phone, or copy the code, paste it on the phone under **Code from the computer** and tap **Next**. The phone
   shows the computer's name and a code of four groups of five digits; choose as above and tap **Link**.
4. Only in that way does the computer show a code too: if it is the phone's, tap **They match**. If not, tap **They
   differ**: someone else may have read its QR code, and nothing went to them. Hidden chats link only this way, from
   inside them, with the full code.

The chats then come to the computer, and after them the messages chosen.

- **Messages** from contacts come to both, and each keeps them once: one that comes again within 30 days (up to 2000
  from one contact) is not kept again, even after it disappeared or was deleted there. For that each keeps, for 30
  days, which messages came and on what day, not what they said, also once they disappeared or were deleted, and in a
  backup made meanwhile; the phone keeps it too for a contact who linked a device. What you write on the computer
  goes to a contact on this version straight from it, once they wrote to the computer, and through the phone
  otherwise: the phone shows it as yours, and the contact gets it from the account. What you write on the phone shows
  on the computer too. Read marks, reactions, pins, votes, deleting from both phones, names, timers, chat looks and
  pictures, appearing offline and accepting requests go both ways. A star, or deleting on **This phone**, done on the
  phone goes to the computer too; done on the computer, it stays there.
- **With the phone off**, contacts on this version still reach the computer, and the computer them: what they write,
  read and react to comes, and what you write goes. If the phone stays off so long that its queue on the relay fills
  (1000 messages), what they write and read still reaches the computer, a long voice message whole; what they react
  to, pin, vote on or delete, and their calls, do not go through until the phone is on again. For contacts on older
  versions (adding them too) and groups, **the phone has to be on** and reach the
  relay: what the computer writes meanwhile waits on the relay, and goes once the phone is back. Someone new whose contact link is from this version the computer adds with the phone off
  too: it starts the chat with them itself, they see your account as a request, and the phone adds them too once it is
  on. Two or more linked
  devices also reach each other directly: with the phone off, each still shows what the others write, read and react
  to, and the changes they make to contacts; one that missed the first message of another gets a new one a day or more
  later. A computer that was off for longer than the relay keeps messages (14 days), or missed a contact's first
  message to it, still gets what they write after: their {=Erevos} starts again with it a day or more later, then ever
  less often, until it answers. After a contact deletes you and adds you again, the computer starts again with their
  devices too.
- **Photos and files** that come stay on the relay until both the phone and the computer took them; then the phone
  deletes them there. One the computer never takes goes when it is unlinked, or after 14 days, as any not taken.
- **Chat with myself** is the same on each device: a note, photo, file or voice message written on one goes to the
  others, and so do a reminder set, changed or seen and a note deleted; of two changes to one note, the later stays.
  Those written before linking go once, both ways, as soon as both have this version. A reminder shows on each device
  at its time, and seen on one it goes from the others. A note's photo or file goes as a copy on the relay, deleted
  there once taken, or, for two devices or more, left there until it expires (14 days). Hidden chats' notes go only
  within their own link, below.
- **Settings:** the language, the look (the style, the colours, the size of the text) and **Last seen** are the same on
  every device of the space: changed on one, they change on the others too. A photo behind the screens stays on the device it was
  chosen on, and so does all that is about one device alone: passwords, PINs and the panic code, the lock's time,
  vibration, the relay and Tor,{~ the modules,} the device's name. A device that should keep its own: **Settings** →
  **Data and devices** → **Linked devices** → **Same settings on every device** off. Turned on again, it takes the
  others' at once. Hidden chats keep their own.
- **Through Tor for one chat:** the **Through Tor** switch in an Erevos chat's **Details** is the same on every device:
  switched on or off on one, it is switched on or off on all. On a device without Tor, such as the web app, that chat
  sends nothing while it is on. A device on an older version never turns it off for the others. See [Through Tor](#tor).
- **On the same Wi-Fi:** the phone and a computer on the same Wi-Fi or hotspot (with **Find Erevos on the same Wi-Fi** on)
  give each other what changes straight there, with no internet too; the relay still gets its copy, which then changes
  nothing more. Only the space's: hidden chats' links go through the relay.
- **Calls** ring on the phone and on the computer. Answer on either: the other stops ringing, and says it was
  answered on another device. Turning a call down on one turns it down on both. With a contact on this version, the
  computer calls and is called by itself, with the phone off too; with one on an older version it calls through the
  phone, which has to stay on only to set it up. Either way the call itself goes straight between the computer and the
  contact, encrypted between them.
- **Send later** works on the computer too. To a contact on this version the computer hands it to the relay itself, and
  a copy for each of their devices, so it goes at its time with your phone off and reaches theirs with their phone off;
  to one on an older version it goes through the phone. Every device of yours shows it as scheduled, and deleting it
  on any of them before its time takes it back everywhere.
- **Groups** are on the computer too, with their messages, photos, files and voice messages. Write in them, answer,
  react, vote, pin, delete your own for everyone, add and take out members, rename one or leave it, there as on the
  phone: the phone does it for the computer, as its own. A photo or file the phone keeps goes to the computer as a copy
  on the relay, deleted there once the computer took it. What the members do later to a message (react, vote, pin,
  delete it for everyone) shows on the computer too, as does a star or deleting on **This phone** done on the phone. A
  message the phone could not send to the group (one closed meanwhile, say) shows on the computer as **Not sent by the
  phone**. Making a group, public groups and group calls stay on the phone for now.
- **Groups stay on** a device of your choice: on the phone, under **Settings** → **Data and devices** → **Linked
  devices** → **Groups stay on**, pick **This phone** or a linked computer. The keys of the groups then move there, never
  copied, so the groups work there with the phone off, and new ones can be made there; the phone and the other devices
  write in them through it, so it has to be on. Members see nothing new: the same you, whose group messages come to
  another queue. Moving needs both on and the relay, and public groups stay on the phone (leave them first). To unlink
  that computer, move the groups back to the phone first. If it is lost, unlink it all the same: the groups
  then show as left on the phone. A computer whose {=Erevos} is older cannot hold them.
- **Hidden chats and second passwords** never go with the space's link: each links on its own, from inside it. For a
  place of hidden chats: on the computer, open that place with its PIN, new and empty as a new PIN sets it, and give it
  a relay queue of its own under **For advanced users** there; then tap **Linked devices** under its list, and **Link to
  my phone**. On the phone, open the same place with its PIN, tap **Linked devices** under its list, and scan the
  computer's code with the camera while the place stays open, or paste it there; then as above. A code shown in a place
  links only a place, and a space's only a space: read by the other, it just goes, and **Link to my phone** starts again on the computer. The
  place then has a link of its own, with keys of its own and its own list of devices, signed by its own account, so its
  contacts on this version write to the computer's place directly. Its messages, contacts, groups, calls, photos and
  files and its Chat with myself go between the two places as the space's go between linked devices{+, and so do its own
  Matrix, XMPP and Nostr accounts, always, and again as they change}. Nothing of it
  shows in the space, on its screens or on its linked devices, and the space's link never carries anything of a place:
  what a place keeps of its link is encrypted with its own key, among values made for nothing for the other places, in a
  file of the same size whether any place links or none. The link runs while the place is open, and while it is closed
  too if **Receive while closed** is on; closed with it off, nothing of it syncs, and what comes waits on the relay (14
  days) until it opens, on either side. On the computer, new groups and group calls stay on the phone, a chat cannot be
  moved into the place or out of it (move it on the phone), and a call answered there stops the phone's ring only while
  the place is open on the phone. Hidden chats write to the devices of a contact on this version as your other chats do,
  so those get them with the contact's phone off, and to the contact they look like the chats of a phone that never
  linked a device. A chat moved into hidden chats on the phone leaves the computer. Moved into hidden chats, or out of
  them into your chats, a chat writes to the contact's phone only, as an older {=Erevos} does, until it goes back to where
  it was made: their {=Erevos} is told first, so their devices stop writing to yours, and they can tell from it that the
  chat stopped knowing of linked devices: if it gave them the list of your devices, that it went into hidden chats. A
  space a second password opens links only from inside it, to devices of its own.
- **Bring over messages again**, on the phone, sends a period of the history again, with its reactions, pins, votes
  and stars; what the computer has already is not kept twice.
- [+] **Matrix, XMPP and Nostr**: every device linked gets them, and they follow as they change on the phone: an account signed out of there, or another in its place, goes from the devices too. The computer signs in to
  this space's Matrix and XMPP accounts and takes the key of its Nostr chats, each as a new device of its own: the
  phone keeps its own. For a computer linked already, tap **Send the accounts** under it on the phone. XMPP and Nostr
  come by themselves. A Matrix server seldom lets the phone sign a new device in: then **Linked devices** on the
  computer says so, and **Sign in to Matrix** there opens Matrix with the ID filled in, for its password, once. The
  account's keys come from the phone, so no Security Key or check by emoji is needed, and the messages from before
  open from its key backup. A computer that has an account of its own on one of them keeps it, and what could not come
  yet (offline, say) is tried again each time it opens. Unlinked, the computer signs out of the accounts it brought
  over. A place of hidden chats linked on its own gives its own accounts the same way, from its own **Linked
  devices**, into the same place on the computer: never the space's, and the space's never go to it. Each device signs
  in as itself, never with a copy of the phone's keys, which would then be used twice and break the encryption; so
  either can be signed out alone, from the account's devices.
- [~] **SMS**: the phone's SMS can show on the devices too, and be answered there through the phone, once you turn it on
  under **Settings** → **Phone and SMS** → **SMS** → **On my linked devices too**, see [SMS](#sms).
- **Unlink**, on the phone, cuts a device off at once: nothing more goes to it, and nothing it sends is taken.
  Contacts on this version are told the next time the phone reaches the relay: they stop writing to it, and take
  nothing more from it. That is how to cut off a lost computer. If it is on, it is told, and the account's chats leave
  it. On the computer, **Unlink this device** does the same from there.
- **Up to four** devices link to one phone. A backup does not carry the links, but after restoring one on
  another phone, that phone asks each device that is still yours to link again, with a tap on each, see
  [Backups](#backup).

## On an iPhone, from the browser {#iphone}

Erevos has no App Store app. On an iPhone it runs as a web app, added to the home screen from Safari, with no Apple
account. It chats through a relay, end-to-end encrypted as on the phone, and keeps its contacts, messages and settings
sealed the same way, in Safari's storage for the app.

1. Open the address of the Erevos server you were given in **Safari**. Erevos shows how to add it: tap **Share** (on
   iOS 26, under **•••**), then **Add to Home Screen**, then open Erevos from the home screen. Needs iOS 17 or later.
2. In Erevos, open **Settings** → **Privacy and security** → **This web app** and compare the release key's
   fingerprint with the one you were given with the address, character by character. If it differs, delete the app and
   tell whoever gave you the address.
3. Set a password lock (in Erevos, **Settings** → **Privacy and security** → **Lock and second password**). On the
   web it matters most: see below.
4. Set the relay and add contacts as on the phone, see [Chat through a relay](#relay).

**How it checks itself.** A web app is code the server sends, so a server that is broken into, or ordered to, could
send changed code. Erevos does not take that code on trust:

- The first time it opens, it fetches its code with a list of every file and its fingerprint, signed with the
  release key, which only the person who makes the releases holds; the server does not have it. It checks the
  signature and every file, keeps them on the iPhone, and from then on runs only those. The server cannot change them.
- An update is taken only if it is signed with the same key and newer than the one in use; it starts the next time
  Erevos opens. An unsigned or older one is refused, and Erevos says so.
- Whoever wants to can check the server: \`node pwa/release.mjs verify https://<address>\` checks the signature and
  every file the server gives out, and \`scripts/reproduce-web.sh <version> https://<address>\` builds that release again
  from its source and checks that every file comes out the same.

**What is left.** These are real limits; know them:

- **The first time** you open it, you trust the server: it is the one that sends the checking part. Step 2 is how
  you catch a wrong one.
- **The checking part itself** (the service worker) is fetched again by Safari at least once a day, and Safari can
  replace it without asking Erevos. Erevos then checks the new one against the signed release and warns you
  (**Erevos was tampered with**), but a server that knows how could get past that check. If you see the warning, do
  not open Erevos from that server again until it is explained. With a password lock your chats stay sealed.
- **No Bluetooth or nearby link**{~ and no SMS}: Safari does not allow them.
- **Only while it is open:** iOS stops web apps in the background, so messages arrive when you open Erevos; they wait
  on the relay until then.
- **Calls** ring while Erevos is open, with a ring of its own: two short rings every 3 seconds. Safari lets it sound
  only once you have touched Erevos since it opened, and not with the iPhone on silent. With Erevos closed a call does
  not ring: only the notification "Call" shows, once notifications are on. Apple allows a web app nothing more; ringing
  as a phone does would take an app from the App Store.
- **Notifications** while Erevos is closed are off unless you turn them on: in Erevos, **Settings** →
  **Notifications** → **Notifications while closed** → **Turn on** (iOS 16.4 or later, from the home screen). When
  messages come, or a call rings, your relay sends a push through Apple, and Erevos shows how many messages came since
  you last opened it (**3 new messages**), or **Call** when only a call rang, in the app's language, nothing more. The
  count is encrypted for your iPhone: Apple sees when something comes for your iPhone, and that it uses {=Erevos}, never
  what or from whom. With a relay or a sender's {=Erevos} older than 2.0.0, or a message that other phones carried to the
  relay, there is no number: Erevos shows **New message**, or **New messages** once more came, until you open it. They
  are per space, never for hidden chats, and your relay must be set up to send them. They come for each contact's own
  queue too: your relay then has one push address for all your contacts' queues, and Apple gets one push for each
  contact who wrote, 15 seconds apart, so from such a run it can guess how many wrote at once, never who. Erevos's
  icon on the home screen then shows a number too: the messages not read in the space you had open, which stays once
  Erevos is closed, and those that came since (what came with no number counts as one), never a hidden chat's.
  **Settings** → **Notifications** → **Number on the icon** turns it off. Notifications work through Apple's push
  service, Google's (Chrome, and Edge on Android, Brave and Opera), Mozilla's (Firefox) and Microsoft's (Edge on
  Windows): a browser that uses another cannot turn them on, unless whoever runs your relay allows its push service.
  Each space that turns them on has a push address of its own, so no relay is ever given another space's, and the
  address does not tie your spaces together. For it each such space has a service worker of its own in the browser:
  whoever can look into the browser's settings can count them, and so how many spaces have notifications on. A message
  request from someone new, through your contact link, may show only once Erevos opens. The number on the icon shows
  also on a Mac with Safari's Add to Dock, and in the web app installed from Chrome or Edge on Windows, macOS or
  ChromeOS. No **New message** banner shows over Erevos while it is open on the screen. The **Notifications while
  closed** screen says when the browser or the phone does not allow them and, after you turn them off, when your relay
  could not be told yet and may still send one: Erevos tells it as soon as it can reach it. When the browser changes
  its push address, or its push service drops it, Erevos gives your relay the new one by itself as it comes back on
  the screen.
- **Permissions:** in Erevos, **Settings** → **General** → **Permissions** shows what the browser lets Erevos do:
  whether it runs from the home screen, notifications while closed (needed once this space turned them on), the
  microphone for calls, the camera for video calls, and whether the browser keeps Erevos's data for good. Without
  that, Safari may clear the data when the iPhone runs low on space, so a backup is the safety net. Each has why, and
  a button with the browser's own question; where the browser no longer asks, it says where the setting is (**Settings
  → Notifications → Erevos**, or **Settings → Apps → Safari → Microphone**). It only reads what the browser says. A
  browser does not let Erevos read battery saving or Low Power Mode, so those are not there. After each new signed
  release it opens by itself when something messages, calls or the data need is missing. In another browser (Chrome,
  Firefox) it is the same, with that browser's settings.
- **Backups** are made by hand: **Make a backup** saves the backup and its files through the share sheet (Files,
  iCloud Drive or another app). A browser gives out a file only after a tap, so there are no automatic backups.
- **Voice messages** recorded on an iPhone are AAC; they play everywhere.
- **Apple** makes Safari and could change it, as with any app on an iPhone.

## On Sailfish OS {#sailfish}

On a Sailfish OS phone Erevos is an app of its own: the same app as in the browser, shown by Sailfish's own browser
engine inside a Sailfish window, with its code installed with the app and not fetched from a server. It chats through a
relay, end-to-end encrypted as on the phone, and keeps its contacts, messages and settings sealed the same way.

1. Allow apps from outside the Jolla Store: **Settings → Untrusted software → Allow untrusted software**.
2. Copy \`erevos-sailfish-aarch64.rpm\` to the phone (Downloads) and tap it in **Files**, then **Install**. From a
   terminal (Developer mode) it is \`pkcon install-local erevos-sailfish-aarch64.rpm\`. Needs Sailfish OS 5 in its
   64-bit (aarch64) version.
3. Set a password lock (in Erevos, **Settings** → **Privacy and security** → **Lock and second password**). See
   below why it matters here.
4. Set the relay and add contacts as on the phone, see [Chat through a relay](#relay).

- **What only Android does:** Bluetooth, Wi-Fi Aware, Wi-Fi Direct{~, LoRa and SMS| and LoRa}. The same Wi-Fi works here too, as on
  a computer: see [Chat with a nearby phone](#nearby). Sailfish OS's firewall already lets its port, 47905, in: only
  a firewall you made stricter yourself needs a rule for it. The rest is the same: spaces and
  the second password, hidden chats, voice messages, imported chats and backups.
- **Where it keeps things:** in \`~/.local/share/erevos\` on the phone, sealed as on the phone. Sailfish has no
  keyring for apps, so the keystore is kept there as it is, readable by your user, and so by any app that runs as
  you: the password lock is what seals it.
- **Backups** go to \`Documents/Erevos\` on the phone, by hand or every day; copy them from there to a memory card or
  another device. **Save** puts a photo or file in Downloads.
- **Calls** ring while Erevos shows, with a ring of its own: two short rings every 3 seconds, and the phone vibrates
  where it can, until the call is answered or ends. A call that comes before you have touched Erevos since it opened may
  show without sound.
- **While it is closed:** with a space open, a small helper of Erevos waits at the relay while Erevos is out of sight
  or closed, and takes nothing. A notice says only how many messages came, never who or what, and a call rings with
  the phone's ringtone, as its profile sets it, for 45 seconds at most; a tap on either opens Erevos. Hidden chats say
  nothing then. Locking the space stops it, and after the phone restarts it waits again only once Erevos opens the
  space. Like the rest of Erevos here it goes straight, without Tor. Each wait wakes the phone about once a minute, as
  on Android.
- **Tested so far** on Sailfish's browser engine (Gecko 91) on a computer, chatting with a browser through a relay.
  The same Wi-Fi was checked against the computer's, on a computer. Not yet on a Sailfish phone.

## Updates {#updates}

Erevos asks GitHub for updates only when you tap the button, as in Fasouli: a regular check would tell GitHub,
every day, that this phone or computer has {=Erevos}. On Android it also tells you when a new version is out, without
asking GitHub, as **Told when a new version is out** below says. To update:

1. Open **Settings** → **General** → **Updates** (or **Check for updates** at the bottom of this guide's first
   screen).
   It shows the version you have, such as **Erevos 2.0.0**.
2. Tap **Check for updates**. GitHub then sees this device's internet address, nothing else; on Android so does the web
   app's server, which holds the release computer's signature of the update. While everything in the
   space goes through Tor (**Everything** under Tor), Erevos does not check, since that would go around Tor.
   With **Through Tor** on, on this screen (off unless you turn it on), it asks only the web app's server, through
   Tor, and not GitHub: GitHub is not asked and nothing sees the address. That is slower, and waits while Tor starts;
   and it works while everything in the space goes through Tor too.
3. When there is a new version: on Android tap **Install**. It downloads, is checked against the release (its size and
   SHA-256), and Android's installer opens: tap **Install** there. Erevos offers it only once the release computer,
   which keeps its key offline, has signed that build and SHA-256: whoever took over the GitHub account alone could
   not get an APK of their own installed. Until then it says the version is out but not signed yet. When the web app's
   server cannot be reached it says so, with the reason, and when the signature there does not match it says that:
   either way nothing installs. A download whose connection brings nothing for a while is tried again by itself, from
   the start, three times in all; then Erevos says so, and nothing installs. The first time, Android asks to allow
   installing apps from Erevos. On a computer and Sailfish OS, **Open download page** opens the releases page: take
   the file Erevos names, the one of the package you have, and update as in the table below.
   Through Tor a new version is told, but it does not download here, as its package is larger than Erevos's Tor takes:
   turn **Through Tor** off for a moment to install it, or download it from the releases page in Tor Browser.

A version such as **4.0.0-rc.1** is a test version before 4.0.0 (a release candidate): it installs and updates like
any other, and 4.0.0 comes after it.

### Erevos, Erevos+ or Erevos Lite, and betas {#update-channel}

On Android, **Updates** also says which releases are offered to this phone:

- **Next update**: **Erevos Lite** (Erevos's own chats and calls, nothing else; versions 3.2.x), **Erevos** (its own
  chats, the Phone, SMS and the Collection; versions 3.0.x) or **Erevos+** (all of that, with Telegram, Messenger,
  Signal, Session, Matrix, XMPP and Nostr; versions 3.1.x). The one you have is chosen at first. Each is an app of its
  own, with its own data, so choosing another is a move, not an update: **Check for updates** finds it and asks **Move
  to …**. This Erevos then makes a copy of everything, encrypted, here on the phone (every space, with its contacts,
  messages and settings), and Android installs the other app beside this one, if it is not there already. Open it
  within a day: it asks whether to bring your chats, and takes them; nothing leaves the phone. The spaces then open
  with their passwords, as after any restore. The phone's SMS and calls stay in the phone: make the new app the SMS
  and phone app, if you use them. From the moment the move is made, the old app receives and sends nothing and shows
  only the move, so that no message stays there that the new one does not have; **Call the move off** opens it as
  before. Once the new one took it, the old one offers **Delete everything here** and **Uninstall**; a move not taken
  within a day is deleted, and the old app opens as before. A new app already set up asks too, and what it brings
  takes the place of everything it has. The move needs free room on the phone for a copy of everything: Erevos says so
  first when there is not enough. The F-Droid build, signed with another key, cannot move this way: use
  [Backups](#backup) instead.
- **Beta versions**: off, only regular versions are offered. On, betas too (such as **7.0.1-beta.1**): they come out
  first, for trying, and may have problems. A beta has it on at first. Turn it off to leave the betas: the next regular
  version with a build number above the beta you have installs over it and keeps everything, with no uninstalling.

From Erevos+, the networks come too: Telegram, Signal, Session, Messenger and Matrix go on signed in, in the new app,
as they were (Telegram's photos and files download again as they are opened, and Messenger's page asks for its PIN
once more). Erevos and Erevos Lite have no Telegram, Messenger, Signal or Session: moving to them leaves those
accounts in the old Erevos+, which then opens nothing, so if you use Session, write down its 13 recovery words first.

Erevos+ needs Android 8.0 or newer: on an older phone it cannot be chosen, and the phone stays on Erevos.

The notice of a new version follows the same choice. Each edition and its betas are signed apart by the release
computer, so one never installs as another.

### What's new {#whats-new}

**Settings** → **General** → **What's new** (also **What's new** in **Updates**) says in short what each version
changed, the newest first, by its number alone; the version you have says **This version**. Each release adds its own.
The CHANGELOG of the source code tells every change in full.
Each version, there as here, says first what changes **For you**, what you see and use, then what changed
**Under the hood**: fixes, speed, battery and security inside.

### Told when a new version is out {#release-notice}

On Android, once a day, Erevos asks LPHL's server, which runs the relay too, whether a new version is out. When one is,
**Erevos** shows at the top of the chats, pinned, with its icon: **Erevos 3.3.0 is out. Tap to see what is new and
update.**, marked until you open it, and a notice says **Erevos 3.3.0 is out** too. Tap either for **Updates**, then
**Check for updates**. It goes once you have that version.

- **Only when signed:** it counts only once the release computer has signed both the build and its name, the same
  signature that lets **Updates** install it. So it comes once that version can be installed, and the server alone
  cannot make one up.
- **Only on LPHL's relay:** a space asks only while it uses LPHL's relay and does not send everything through Tor
  (**Everything** under Tor): the server then sees nothing it does not see already. A space on another relay, or with
  no relay, asks nothing; there **Check for updates** tells you.
  The **Through Tor** switch in **Updates**, one for this notice and for **Check for updates**, on this phone only,
  makes it ask through Tor: the server then does not see the phone's address, and a space that sends everything
  through Tor asks too. A new version is told, but installs only with the switch off.
- **To turn it off:** **Settings** → **General** → **Updates** → **Tell me when a new version is out**.
- It works from the version that has it on: the one before says nothing. Not in the F-Droid build, which F-Droid
  updates.

**Why:** so no one has to look on GitHub, one by one, for each new version, and GitHub never learns which phones have
Erevos: the server asked is the one the phone already talks to, and what it says counts only with the release
computer's signature, kept offline.

The rest of this section is for updating by hand.

**Where new versions are:** on Erevos's releases page, \`https://github.com/azzinder/erevos-releases/releases\`. The newest is at the top, such as **Erevos 2.0.0**, with a file for each
system. The five newest stay there.

**Check the file** if you can, on a computer: each release has \`SHA256SUMS\`, and in the folder with the downloaded
files \`sha256sum -c --ignore-missing SHA256SUMS\` must say **OK** for each.

**Make a backup first** (**Settings** → **Data and devices** → **Backups** → **Make a backup**), see
[Backups](#backup). An update keeps everything, but a backup costs a minute and covers any surprise.

| On | How to update |
| --- | --- |
| **Android** | **Settings** → **General** → **Updates** → **Check for updates** → **Install**, or by hand: open the releases page on the phone, tap \`erevos-android.apk\`, then **Install**. It installs over the one you have and keeps everything. Allow installing from the browser once, when Android asks. |
| **Linux, Arch-based** | \`sudo pacman -U erevos-linux-x86_64.pacman\` |
| **Linux, AppImage** | Replace the old \`erevos-linux-x86_64.AppImage\` with the new one and make it executable. |
| **macOS** | Open \`erevos-macos.dmg\` and drag Erevos to Applications, **Replace**. Then allow it again under **System Settings → Privacy & Security → Open Anyway**. |
| **Windows, installed** | Close Erevos and run the new \`erevos-windows-x64-setup.exe\`: it installs over the one you have. Windows may warn again: **More info**, then **Run anyway**. |
| **Windows, portable** | Close Erevos and put the new \`erevos-windows-x64-portable.exe\` in the place of the old one. |
| **Sailfish OS** | Tap \`erevos-sailfish-aarch64.rpm\` in **Files**, then **Install**, or \`pkcon install-local erevos-sailfish-aarch64.rpm\`. |
| **iPhone, browser** | Nothing to do: the web app takes a new signed version by itself when it opens, see [On an iPhone](#iphone). |

- **Contacts, chats and settings stay** on every system: they live in Erevos's own folder, not in the app.
- **Android, the first time from the releases page:** an Erevos built on a computer for testing is signed with
  another key, and Android refuses to install over it (**App not installed**). Make a backup, uninstall {=Erevos},
  install the one from the releases page and restore the backup. After that, every update installs over it.
- **{=Erevos} from F-Droid**, once it is there, is updated by F-Droid: its **Updates** shows the version and says so,
  with no **Check for updates**. F-Droid signs it with a key of its own, so Android installs neither it over the
  Erevos from the releases page nor that one over it. To switch: make a backup, uninstall {=Erevos}, install the other one
  and restore the backup.
- **Never older:** do not install an older version over a newer one. Its data may be in a form the older one cannot
  read. Restore a backup made with that older version instead.
- **A release that lacks your system** says so in its notes: that build failed, so take the release before.

## Erevos to a phone nearby {#give-app}

With no internet, an Android phone with {=Erevos} can give it to a phone next to it, under **Settings** → **General** →
**Give Erevos to a phone nearby** (also in **Updates**). Both phones must be on the same Wi-Fi, or the other one on
this phone's hotspot: turn the hotspot on in Android's settings first.

1. **On the phone that gives:** tap **Start**. A QR code shows, with the package's size, and below it the addresses
   to type in a browser instead.
2. **On a phone without {=Erevos}:** scan the code with its camera. Its browser opens a page, from the giving phone, with
   **Download {=Erevos}**: download it and open the file, and Android installs it. The first time, Android asks to allow
   installing apps from that browser. The page shows the package's SHA-256 and its certificate's: they must be the
   ones the giving phone shows under **To compare**.
3. **On a phone with an older {=Erevos}:** open **Settings** → **General** → **Updates** → **From a phone nearby**
   instead and photograph the code. Erevos downloads the package and opens Android's installer only when its SHA-256
   is the one in the code, it is Erevos, signed with the same certificate as the Erevos there, and newer.

- **How long:** the giving phone serves it while its screen shows, ten minutes at most, and stops sooner on **Stop**.
  It serves only under a random address no one can guess, only to phones on its own network, and nothing but the
  package and its page: no chat, contact or setting goes with it.
- **What it cannot check for you:** the browser only downloads. A phone with a changed Erevos would show its own
  certificate, so once you have internet compare the certificate with the one on Erevos's website or releases page.
  Erevos itself, in **Updates**, refuses a package signed otherwise.
- **Not from a store:** an {=Erevos} installed in parts, as some stores install apps, cannot be given whole and says so.
  {=Erevos} from F-Droid is signed by F-Droid: it can go to a phone without {=Erevos}, or over F-Droid's Erevos through the
  browser, but an Erevos from the releases page refuses it in **Updates**, as Android would. F-Droid's Erevos takes
  nothing in **Updates**: F-Droid updates it.
- Android only. Anyone on the same network who sees the code can download Erevos too; nothing else is there to take.

**Why:** where the internet is cut, or watched, or a phone may not reach the website at all, Erevos can still go from
hand to hand, and the phone that takes it can check it is the real one.

## The test screens {#tests}

Two screens under **Settings** → **For testing** are there to test the connections, step by step.

- **Radio test (Android):** **Permissions** asks Android for what the radio needs, **Start** and **Stop** turn
  Bluetooth and Wi-Fi Aware on and off, **Send hello** sends a plain test message to the nearby phone's Radio test (a
  chat does not show it), and the **Log** shows what happened.
- **Relay test (Wi-Fi):** **Create queue** makes a queue on a relay and shows two ids. Give the **sender id** to
  the phone that writes to you, and keep the **recipient id** private. **Send** and **Receive** move messages by hand.

> With one phone you can still try a chat through the relay: your chats and your **Hidden chats** each have their
> own relay queue and their own keys. Create both queues on the same relay, tap **Share my contact link** in one and
> copy it, then add it in the other, and write both ways. A chat's own link is refused as a contact.

## What is protected today {#privacy}

Erevos says plainly what it protects and what it does not, yet.

| What | Today | Coming |
| --- | --- | --- |
| **Account, phone number, email** | None needed. Contacts are pairs of one-way relay queues. | |
| **Contacts and their names, keys, relay settings, look** | Sealed on the phone with each space's key. | |
| **Messages through a relay** | End-to-end encrypted: PQXDH with ML-KEM-768 to start, then the double ratchet. The relay cannot read them, and once both phones have had a message from each other it cannot tell them apart by conversation either: each is sealed once more for the phone it goes to. It sees which are messages someone reads, which are word between phones, and which are calls that ring, as each says. Not audited yet. | An outside audit. |
| **Messages to a nearby phone** | End-to-end encrypted, the same as through the relay. Whoever listens nearby can tell that {=Erevos} phones are near each other, and when and how much they send; on the same Wi-Fi, so can anyone on it, and over Wi-Fi Direct anyone who joins the phones' own Wi-Fi. Until your contact's phone is known, the other {=Erevos} phones linked nearby get your short messages, sealed. | |
| **Messages carried by other phones** | Sealed twice: end-to-end for your contact, and for their relay. A phone that carries one sees which relay it goes to, when, and how big; not who it is from or for. Its relay sees which relay it goes to, and that relay sees the carrier's relay, not its phone. Kept sealed on the phone, three days at most: those for others in a file of the phone's, whose size shows roughly how many; your own in your space, sealed with its key. Hidden chats are never carried. | |
| **Messages over LoRa** | End-to-end encrypted, the same as through the relay. Anyone with a radio, kilometres away, can tell that yours sends, when and how much, and its signal can be traced to where it is. Erevos keeps your radio from saying its name and where it is (role Client hidden, GPS off, no fixed position) unless you let it; it still answers a radio that asks its name. Every Erevos on the mesh gets your LoRa messages, sealed. | Setting the radio's name from Erevos. |
[~] | **Messages by SMS, when nothing else works** | End-to-end encrypted, the same as through the relay, in hidden data SMS. Off unless you turn it on. The phone company sees which number wrote to which, when, and how many SMS; never what was written. Each costs what an SMS costs. | |
| **Who talks to whom** | The relay sees IP addresses, queue ids, and when and how much. With a second relay, your relay never sees your address. From a place lent on a contact's relay, every relay you send to sees it. [Through Tor](#tor), once you turn it on, with **Messages** no relay sees it for what you write, and with **Everything** for pictures and files too; with bridges, for where Tor is blocked, the network sees only a bridge. Snowflake's broker and STUN servers see your address. | Tor on a computer. |
| **The connection to the relay** | TLS, and inside it, once the relay's key is known, a channel to that key: the relay proves it holds it on every connection, and the token and every request go encrypted to it, so someone in between with a certificate for the relay's name cannot pass for it. A relay that proved its key once is never reached without it again. A relay older than this app goes as before, and **How you connect now** says so. The first key comes from the relay the first time it is asked, or from a contact link: whoever is in between that very first time could give one of their own. [The relay's own key](#relay). Not audited. | Our relay's key built into the app, and in invites. |
| **Texts through Nostr** | End-to-end encrypted as through a relay, then wrapped once more for a key your contact gave that chat alone, signed by a key made for that text alone. The Nostr relays see when and how big, and that a key that names no one gets a text; your phone reads all its keys on one connection, through Tor when Tor is on, so a relay can tell they are read together, and from where only with Tor off. Your relay sees them only as the backup, and a bell for hidden chats. [Through Nostr](#nostr). | |
[~] | **SMS** | A plain SMS is read by the phone company, as every SMS. To a number linked to an Erevos contact it goes through Erevos instead. A hidden invite is one more short SMS the phone company sees. | |
| **The phone's contacts** | In Android's own contacts, not sealed by Erevos, as with every contacts app: every app allowed to read them sees them, and an account (Google) may sync them. Erevos sends them nowhere. A .vcf file saved from them is outside Erevos, not sealed.{~ A contact's calls and SMS are read from the phone's own call log and SMS only to show its history, and kept nowhere.} | |
| **Contacts kept only in Erevos** | Sealed with the space's key, or with the hidden chats' for theirs, in one file for every space whose size shows roughly how many there are in all, not whose they are; their photos each in a file of its own. Never in Android's contacts. A .vcf file saved from them, hidden chats' too, is outside Erevos, not encrypted. Calls{~ and SMS} to them go through the phone, and show in its call log{~ and SMS}. | |
[~] | **Phone calls** | Plain phone calls: the phone company carries them and can listen, as with every phone app. Android keeps the call history, not sealed by Erevos, as for every phone app; Erevos reads it, and the favourites, to show them, deletes from it only the calls you delete, and keeps no copy. The SIM chosen for each number is sealed in the space; the quick replies, and what is blocked (prefixes, group ids and times only, the same for every space), are kept on the phone, not sealed. | |
| **Imported chats** | Sealed in the space they were brought into, their photos and files too, each in its pieces as a chat's file is. The file's size, and how many pieces there are, tell roughly how much was imported, not where. | Viber's photos and files, and files over 4 GB. |
| **Message history** | Kept on the phone, sealed in its space, with no limit, in same-size pages mixed for all spaces. Only how much it all takes shows, not which space it belongs to. Deleting on both phones, and disappearing messages, rely on the other phone's Erevos. | |
| **Nearby messages** | Open only in the space that has the contact. One for another space waits in memory, six hours at most, until that space opens. One for hidden chats opens only while they are open, or receive while closed, and the space never learns that one of their contacts is near. | |
| **Voice messages** | End-to-end encrypted through the relay or nearby, in pieces: the relay, or whoever listens nearby, can tell roughly how long each is. Each sound is sealed in a file of its own; how many files there are, and their sizes, show roughly how many are kept, not in which space. Unsealed in the cache only while it plays. | Sound files all of one size. |
| **Photos and files** | End-to-end encrypted, through the relay's file store, in pieces of one size: the relay sees how many and when, so roughly how big. Your relay sees your address, as for messages; the contact takes them through their own relay. Photos lose their place, phone and time, unless sent as a file; a file keeps what it says inside. Sealed on the phone in their pieces, shown from memory. Saved copies are outside Erevos. Backups hold them, sealed with the backup's password, in files of their own. | |
| **On a computer** | Sealed as on the phone, in the app's own folder. Its keystore is sealed with the system's keyring (on Windows, your account's key); on a Linux system without one, Erevos keeps nothing unless started with \`--plain-secrets\`, and then keeps it as it is. | |
| **Backups** | Sealed with their own password, holding every space as it is sealed on the phone, its photos, files and voice messages in files of their own beside the backup. Their names say they are an Erevos backup, and their number and size show roughly how much is kept. Automatic backups keep their password on the phone. Sent to a server only once you add one: random bytes under random names, of padded sizes; the server sees your account and when, and your address unless it goes through Tor. | |
| **Marks ✓✓ and ✓✓✓** | The contact's phone learns when yours got and read their messages, encrypted. In a group that is not public, so does the phone of whoever sent the message. The relay, or whoever listens nearby, sees one more small message. | A switch to stop telling when you read. |
| **Fingerprint or face (Android)** | Off unless turned on. Opens only the first password's space: its key sealed in the Android Keystore, usable only right after a strong fingerprint or face check, and dropped when they change. Someone who holds you can use your finger. | |
| **Notices (Android)** | In the background: "Erevos – Ready for calls and messages" (not on the lock screen), "Incoming call" or "Incoming video call" – "Open Erevos to answer", and "New message" or how many came; when Android or the password stops it, "Closed by Android" or "Locked" – "Open it to receive calls and messages again"; a reminder, "Reminder" or how many; a new version, "Erevos X is out". Never who or what. On a locked phone the one for messages says only "Erevos". Hidden chats that may say so show the same notice, counted with the rest: whoever sees it and finds nothing new may guess there are more. As the phone app, the notice of a phone call names who calls, over the lock screen too, as every phone app's does, but never by a name only hidden chats know: a call from one of their contacts shows the number. | |
| **Widget{~ and Phone} (Android)** | The widget, once added, shows how many {~missed calls, unread SMS and |}new messages there are, never who or what.{~ The Phone opens without the password only if you let it: then anyone holding the unlocked phone sees the calls and favourites Android keeps, with the names of the phone's contacts only.} | |
| **Calls** | End-to-end encrypted (DTLS-SRTP, its key sent in the encrypted chat). Through the call relay, neither phone sees the other's IP address; the server running it sees both, when and how long, and how much passes. Without a call relay, on the same Wi-Fi only, each phone sees the other's address. The relays see when a call starts ringing. | Ringing in the web app while closed. Calls over Bluetooth (the walkie-talkie works there). |
| **Group chats** | End-to-end encrypted with MLS (RFC 9420); members taken out read nothing after. Each member's copy is sealed apart, so relays cannot tell who is in a group; each relay still sees a message reach a queue. Members see each other's keys and relay addresses. Photos, files and voice messages go through the sender's relay's file store, as to a contact, and stay there 14 days. Not audited. | |
| **Group calls** | Voice and video, end-to-end encrypted between each two phones in the call (DTLS-SRTP, its keys sent in the group's encryption). Through the call relay, no phone sees another's IP address; the server running it sees each phone's, when and how long, and how much passes. Every member, in the call or not, learns who is in it. The relays see when one starts. | Video with more than four people, through a server; more than eight people. |
| **Public groups** | As group chats, and anyone with the link can ask to join and read from when let in. Requests come to the owner's relay sealed for the owner's phone: the relay sees how many and when, not from whom. Members see each other's chosen names, keys made for that group alone, relay addresses and queue sender ids. Not audited. | |
| **Link previews** | Off unless turned on. Then, as you send a link, your phone fetches its page straight from the site, which sees your IP address and when, not who the message is for. The preview goes inside the encrypted message; the phone that gets it fetches nothing. With **Through Tor** on, the page is fetched only through Tor, and the site does not see your IP address. None while the space sends everything through Tor, unless **Through Tor** is on; in hidden chats only with their place's own switch. | |

## Transparency {#transparency}

What the server behind Erevos (lphl.nekten.eu) keeps, and what has been asked of it. This page goes out inside every
release, so it is signed with the release, as the app is.

**Requests from authorities.** As of this release: none. No authority, court or company has asked for data about
anyone who uses {=Erevos}, and no one has been asked to keep quiet about such a request. If this paragraph is ever gone,
or no longer says "none", take it as a sign. **Why:** a request that comes with an order to keep quiet cannot be told,
but a sentence that stops being written can be noticed. That works only as long as it is renewed: each release says it
again.

What the relay keeps, and for how long:

| What | For how long |
| --- | --- |
| **Messages that wait**, encrypted end to end | Until taken, 14 days at most. |
| **Photos and files**, encrypted, in pieces | As messages: until taken, 14 days at most. |
| **Messages sent for later**, encrypted | Until their time comes. |
| **Queues**, random ids with no name | Until their phone has not used them for 180 days. |
| **Access lines**: for each phone, the SHA-256 of its token and a name: random letters and digits for one invited from Erevos 6.0.0 on (before, the one the inviter typed), or the LPHL user name for those who signed in with LPHL | Until the line is taken out. |
| **Web app push addresses**, for notices while the web app is closed | Until turned off in the web app. |

What it does not keep:

- **No list of connections.** The relay writes no log of who connected or when, and the web server in front of the
  relay and of the web app keeps no access log since 24 October 2026. Errors are logged, and an error can name an
  address.
- **No contacts, names or phone numbers.** It has none to keep.

What it still sees while it runs: the IP addresses that connect, when messages come and go, and how big they are, as
[What is protected today](#privacy) says. During a call through the call relay, the IP addresses of the phones in it.

**Copies.** The relay's folder is backed up every day, with the waiting messages still encrypted end to end. The copies
hold what the table above lists, for as long as they are kept.

**Others who see something:** the hosting company (Hetzner), which runs the machine and its network; LPHL's sign-in
(Authentik), which sees each sign-in with LPHL; and for the web app with notices while closed, the push service of the
browser (Apple, Google or Mozilla), which sees that a notice came, never what.

## Licence {#licence}

**Erevos, by azzinder.** Copyright © 2026 azzinder.

Erevos is free software, under the GNU Affero General Public License, version 3 or any later version
(AGPL-3.0-or-later): anyone may use it, study it, share it and change it. Whoever shares Erevos, changed or not, or
runs a changed Erevos for others over a network, must follow that licence, and share the source code of their version
with those who get it.

### Additional terms

Under section 7 of the licence, these terms apply to Erevos as well:

- **The author's name.** Copies and changed versions keep the notice "Erevos, by azzinder" in the app's About,
  [What Erevos is](#about).
- **A changed version says so.** It says clearly that it is changed, and does not present itself as the original
  Erevos.
- **The name and the logo.** The licence gives no right to the name "Erevos" or to its logo: a changed version that
  is given to others takes another name.

### No warranty

Erevos is given in the hope that it will be useful, but **without any warranty**: not even that it can be sold, or
that it fits a particular purpose. The licence says more.

### Who made it

Erevos is built by **human-directed agentic engineering**: the maintainer sets the design, the constraints, what each
change must do and when it is done; AI tools write, run the checks and revise.

Erevos is designed, directed and maintained by azzinder, who chose its features and how they work, its security model
and its structure, tests it on real devices and decides what goes into each release. AI tools were used extensively to
write the code and the texts, always on the maintainer's instructions and from the maintainer's design.

Parts made by others keep their own makers and licences, see [Made with others' open source](#about). The full texts
come with {=Erevos}'s source code: \`AUTHORS.md\`, \`CREDITS.md\` and the folder \`LICENSES\`. Every copy of Erevos also carries the file \`NOTICES.txt\`, with Erevos's licence, \`AUTHORS.md\` and every package Erevos is built from, each with its licence text: inside the Android app, in the folder of the computer and Sailfish apps, and in the web app at \`/NOTICES.txt\`. The licence itself is on
[gnu.org](https://www.gnu.org/licenses/agpl-3.0.html).

**Why:** a free licence protects you only if you can read it. It says what you may do with Erevos, and what anyone who
changes it owes you.

This part opens from **Settings** → **General** → **Licence** too.

## What is coming {#coming}

End-to-end encryption is here, through the relay and over the nearby link, and most of what follows is built on it.

- **More ways to stay in touch:** Tor bridges for where Tor is blocked are here, see [Through Tor](#tor). Next: Tor
  on a computer.
  - **LoRa radios (Meshtastic):** here, see [Over a LoRa radio](#lora). Next: setting the radio's name from Erevos.
  - [~] **SMS:** Erevos as the SMS app is here, with MMS photos, group MMS and two SIMs, see [SMS](#sms).
  - [~] **Phone:** Erevos as the phone app is here, with its own call screen, see [Phone](#phone).
  - **Email, QR codes, USB, NFC:** for when nothing else gets through.
- **Calls:** voice and video calls are here, and on Android they ring in the background, see [Chat through a
  relay](#relay), and so is a walkie-talkie that works even over Bluetooth.
- **Groups:** group chats, with photos, files and voice messages, and group voice and video calls are here, see [Group chats](#groups). Next: video with
  more than four people, through a server the call moves to by itself, still encrypted end to end.
- **Bringing your chats:** Telegram and WhatsApp already come in, with their photos and files, and Viber with its
  words, see [Imported chats](#import). Next: Viber's photos and files.
- **More systems:** public groups and group calls on linked devices too; the account, its calls and its groups are on
  a computer already, see [Linked devices](#devices). Linux, macOS and Windows are here, see [On a computer](#desktop), the iPhone from the browser, see [On an iPhone](#iphone), and Sailfish OS, see
  [On Sailfish OS](#sailfish); and so are backups, see [Backups](#backup).

## Questions {#faq}

### I forgot my password.

There is no way to recover it. Erevos keeps nothing that could open your data without it. Only if unlocking with a
[fingerprint or face](#lock) is on does it still open the first space: set a new password there with
**Change password**.

### A contact who is near never shows "Nearby".

- Write to them: the phones learn which is which from the first message that
  comes nearby. Only contacts are found, so add each other first.
- Keep a space open on both phones: Erevos on the screen, or in the background with **In the background** on
  **Receive and ring**.
- Check that Bluetooth is on (and, on Android 12 and older, the location), and that Erevos may find nearby devices
  (Android settings → Apps → Erevos → Permissions).
- Bring the phones closer. If one of them has no Wi-Fi Aware, they meet over Bluetooth, which is slower to start.
- Or join both to one Wi-Fi, or one phone's hotspot, with **Find Erevos on the same Wi-Fi** on. Some public Wi-Fi
  keeps the devices on it apart: there it cannot work. With no Wi-Fi in common, **Make a Wi-Fi with phones nearby**
  lets them make one (Android 10 and later); give it up to a minute or two.

### Nothing comes over LoRa.

- Both radios need the same region and the same first channel (its name and key) in the Meshtastic app, and to be in
  reach of each other, or of radios between.
- **LoRa radio**, under **Settings** → **Relay and networks**, must say **Linked**. If it does not, close the
  Meshtastic app: a radio links to one app at a time.
- Only texts go, and only when the relay cannot be reached and no phone is near.
- In the EU a radio may send only so much each hour: after many messages, it waits.

### A contact code was not added.

A contact on another relay needs a link with that relay's key, which links from an up-to-date {=Erevos} have: the line
under the chat names that relay. A code from an older {=Erevos} has no keys and is refused: ask for a new one.

### Can the relay read my messages?

No. Messages through a relay are end-to-end encrypted, and only the two phones have the keys. The relay still
sees which queues are used, and when and how much arrives ([Running your own relay](#own-relay)). Compare the safety
number, as in [Chat through a relay](#relay), to be sure no one is in between. Nothing has been audited yet.

### Why does Erevos not ask for my phone number?

Because nothing needs it. Each contact is a pair of one-way relay queues, so no server holds a list of who knows
whom.

### Does it work on an iPhone or a computer?

On a computer, yes: Linux, macOS and Windows, see [On a computer](#desktop).
On an iPhone, yes, from the browser, as a web app, see [On an iPhone](#iphone).
`;
