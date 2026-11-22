// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { EDITION, type Edition } from './edition';
import { mark } from './i18n';
import { laterThan } from './version-name';

// What's new (Settings → General → What's new, app/whats-new.tsx): what each version changed, in
// short, newest first, by its number alone, as CHANGELOG.md tells it in full. Each version says
// first what changes for you (new things to see and use, new looks), then what changed under the
// hood (fixes, speed, battery, security inside), as the CHANGELOG's releases do. The words are
// English, shown with t(); i18n/<lang>/whats-new.ts has them in each language. **Bold** and
// [links](#guide-section) are written as in the guide. NEXT is what is on main and not out yet: it
// shows under the number of the version that runs. After a release its two lists move into a new
// entry of VERSIONS under the release's number; checks/whats-new.check.ts holds VERSIONS to the
// releases of CHANGELOG.md.

/** What changed, in its two kinds. */
export type Changes = { forYou: string[]; underTheHood: string[] };

export type WhatsNew = Changes & { version: string };

export const NEXT: Changes = {
  forYou: [
    mark("**Messenger in its case tells you of new messages**: in Erevos+, when you use Messenger in its case, Erevos now tells you of its new messages as it does of other chats, even if you never opened the case. A chat with messages not read shows on home until it is read, and tapping it opens it in the case; while the case is open, Erevos tells of nothing, as the page shows it. See [Messenger](#messenger)."),
    mark("**Messenger in its case wears your whole look**: in Erevos+, Meta's own Messenger page in its case now takes your look: its colours, dark or light as Erevos is, the shape of your bubbles (round, square or a line), your text size, your style's letters, and what lies behind your screens (a wallpaper, Neon's grid, Paper's lines and the others), and it changes with your look even while it is open. A photo of your own stays in Erevos: there the page shows a soft gradient instead. Where Meta changes its page, parts of it may keep Meta's look. See [Messenger](#messenger)."),
    mark("**Messenger in its case asks for the PIN once**: in Erevos+, what Meta's page keeps now stays in the case between openings, apart from every other page, so Meta knows your phone again and no longer asks for the PIN of your encrypted chats each time you open it. It goes when you sign out of Messenger, or when another account opens the case. See [Messenger](#messenger)."),
  ],
  underTheHood: [],
};

export const VERSIONS: WhatsNew[] = [
  {
    version: '7.3.0-rc.2',
    forYou: [
      mark("**Messenger chats you read stay read**: a Messenger chat you marked read right after Erevos+ started, while Messenger was still connecting, no longer comes back as unread; a chat whose last message is yours, sent from Messenger's own app or the web, is read; and encrypted chats you read in Messenger's app or on the web are read here too."),
      mark("**Messenger in its case fits the phone, and Facebook's feed is a tap away**: in Erevos+, Messenger in its case is now laid out at the phone's width, so it reads without zooming in, and shows under Erevos's own bar, in its colours, with **←** back to Erevos and **Facebook** to see Facebook's feed in the same page. Facebook also has a card of its own in the **Services** window, beside Messenger. See [Messenger](#messenger)."),
      mark("**See yourself in a video call**: once their picture comes, yours stays in a small window in the top corner, on both phones; before, it vanished, and each side saw only the other. See [Chat through a relay](#relay)."),
      mark("**Phones nearby are off until you turn them on**: Erevos no longer looks for phones nearby by itself, with Bluetooth, Wi-Fi Aware or on the same Wi-Fi, as on the same Wi-Fi it held a call back for up to a minute before it rang. Turn on **Look for phones nearby** under **Nearby, with no internet**, on **New chat**, to chat and call with no internet. See [Chat with a nearby phone](#nearby)."),
      mark("**Ways at a glance**: **Settings** → **Relay and networks** → **Ways** shows each way your messages go out by, the relay, Nostr, the phones nearby, LoRa, SMS and Tor, with how each is now and a line under it: full when it works, faint when it reaches no one now, dashed when it is off. Above them, how many of your messages wait to go, an orange dot for each. Only the space that is open shows, never hidden chats. See [How Erevos picks the path](#paths)."),
      mark("**LoRa makes up for lost pieces, and long texts go shorter**: a text sent by LoRa in several pieces now goes with spare pieces, one for each four, so it comes whole even when a piece or two are lost on the air; older Erevos reads it as before. And long texts are packed, with nothing lost, before they are encrypted, when that makes them go in fewer bytes, to contacts whose Erevos unpacks them. See [Over a LoRa radio](#lora)."),
      mark("**The day stands out in every chat**: over the first message of each day, groups and Chat with myself too, the day shows in bold between two lines: **Today**, **Yesterday**, the weekday within the last week, and before that the weekday and date. See [Chat through a relay](#relay)."),
      mark("**The microphone writes, if you like**: tap the microphone beside the message field and choose **Speak to write**, and from then on holding it writes what you say into the field, until you choose **Voice message** again. The choice stays for every chat. See [Chat through a relay](#relay)."),
      mark("**Ways on home**: once a relay is set, the line under the top bar of home is **Ways**, with a dot for each way your messages go out by and how many of them wait; a tap opens **Ways**. See [How Erevos picks the path](#paths)."),
    ],
    underTheHood: [],
  },
  {
    version: '7.3.0-beta.4',
    forYou: [
      mark("**Messenger in its case**: in Erevos+, Messenger can now be used in its case instead of by Erevos: Meta's own Messenger page, as on a computer, closed in by Erevos with the same sign-in. Only Meta's sites load in it, links out open in your browser without Facebook's tracking marks, nothing of the sign-in stays in it once closed, and calls work in it. Choose it on the Messenger screen under **How Messenger is used here**; its chats are then not in Erevos's lists and Erevos does not notify of them. Through Tor, if Messenger goes through Tor, and then without calls."),
      mark("**The keypad lists the contacts it finds, and shows its letters**: on the Phone's **Keypad**, the contacts what you type finds are listed in the room over the number, all of them, not one at a time; and each key shows its letters in the app's language, ΑΒΓ in Greek, ABC in the others. See [Phone](#phone)."),
      mark("**New chat asks whether they have Erevos**: over your QR code on **New chat**, choose **Has Erevos already** or **New to Erevos**. The first is your QR code as before, and says that it works only when both phones have a relay; the second shows an invite, which brings in someone new, or someone whose phone has no relay. New chat remembers your choice. See [Chat through a relay](#relay)."),
      mark("**Open a file with another app**: a file in a chat, a PDF say, has **Open** too, not only **Save**: the phone's app for it reads it from Erevos's memory, with no copy left on the phone. Erevos asks first, and never opens web pages, drawings or app packages that way. See [Chat through a relay](#relay)."),
      mark("**Shared chats say how far they are, on both phones**: chats a contact shared from a relay your Erevos does not take from by itself show **Coming, 40%** once you tap them, and their phone says it is taking them; if they did not come, both phones say so and yours buzzes twice. See [Chat through a relay](#relay)."),
      mark("**Calls connect again**: a call that rang no longer stays at **Connecting** on both phones; each phone now waits for its own addresses before it calls or answers. See [Chat through a relay](#relay)."),
      mark("**Answer a hidden contact's call with no PIN**: where hidden chats receive while closed, **Answer** on the ringing screen takes their contact's call at once, on a call screen with no name and no face, and the hidden chats stay closed; the small sign and the PIN still open them. See [Hidden chats](#hidden)."),
    ],
    underTheHood: [],
  },
  {
    version: '7.3.0-beta.3',
    forYou: [
      mark("**Matrix rooms with very long messages open**: a message with a very long run of names, dots or dashes, as some public Matrix rooms have, no longer closes Erevos+ as its chat shows it."),
      mark("**Messenger chats you read stay read**: a Messenger chat you marked read, or wrote in, no longer comes back as unread when Messenger sends it again, after Erevos+ reconnects or starts."),
      mark("**Chats stay where you read**: in Telegram, Matrix, XMPP and Nostr chats, the chat no longer moves by itself to other messages as older ones load above it; it stays at the last message, or where you were reading."),
      mark("**A phone beside you no longer slows Erevos**: with another Erevos phone near you on the same Wi-Fi, Erevos no longer links to it over Wi-Fi Aware too, which took your phone's Wi-Fi away for moments and slowed your messages and the relay, as if the other phone were far away; and a link to a phone nearby that stopped carrying anything is let go at once, not used on. See [Chat with a nearby phone](#nearby)."),
      mark("**Calls start sooner and sound steadier**: a call through the call relay no longer waits up to 5 seconds on each phone for every way to the relay, only for the first that works; while it goes on, Erevos looks for phones nearby less often, which took the phone's Wi-Fi away for moments and made gaps in the sound; and in a video call, their picture is no longer put aside when their sound came apart from it. See [Chat through a relay](#relay)."),
      mark("**Contacts as you dial**: on the Phone's **Keypad**, a contact whose number holds the digits you type, or whose name starts with them on the keys' letters (2 for ABC and ΑΒΓ), shows over the keys: tap it to call. See [Phone](#phone)."),
      mark("**Chats open at once**: a chat no longer waits, showing your contact as encrypted, for Erevos to finish what it was doing with the relay in the background; it is ready to use as it opens, and holding a message opens its menu, at most a moment later while Erevos says it is still reading what came. See [Chat through a relay](#relay)."),
      mark("**Pair with a code with no relay yet**: on a phone with no relay yet, **New chat** now has **Pair with a code** too, under your QR code, and opens straight on **Start with an invite** without first showing the screen of a phone with a relay. See [Chat through a relay](#relay)."),
    ],
    underTheHood: [],
  },
  {
    version: '7.3.0-beta.2',
    forYou: [
      mark("**Erevos+ says its own name, with an icon of its own**: the app and its guide now say Erevos+ everywhere, and its icon is Erevos's mark on a purple tile. Where it speaks of the plain Erevos, it still says Erevos."),
      mark("**Signal: one chat for each person, with their name**: in Erevos+, a Signal chat shows the person's name, what you send from the phone Erevos+ is linked to shows in the chat of the one you sent it to, and someone who first wrote to your phone number keeps one chat with you on their phone too."),
    ],
    underTheHood: [],
  },
  {
    version: '7.2.0-beta.2',
    forYou: [
      mark("**A Matrix chat read elsewhere is read here too**: an encrypted Matrix chat you read, or answered, in Element or on another device of yours no longer keeps its count of new messages here. See [Matrix](#matrix)."),
      mark("**A message's menu always opens**: holding a message, in a chat or a group, opens its menu every time; before, after you had been in another app, it could stop opening until Erevos was closed and opened again."),
      mark("**New chat, made anew**: your QR code is on New chat as soon as it opens, with **Scan theirs** and **Share** under it; the field at the top finds a contact by name, or adds someone whose link you paste; and **No Erevos yet?** makes an invite, showing again one no one took yet instead of making another. On a new phone with no relay, New chat starts with **Start with an invite**. The small QR code is new each time and good once: the first to scan it is a contact at once, and anyone after, or with the link you share, writes a message request first. See [Chat through a relay](#relay)."),
      mark("**A phone beside you brings your messages**: with no internet, an Erevos phone beside yours that has it, and carries for others, takes what waits for you on your relay and hands it over nearby, once you say yes to that phone. It learns your queue there, never what your messages say, and your phone moves to a new queue once it has internet again. Yours does the same for others while **Carry messages for others** is on, as it now is from the start. Never through Tor, and from another relay only once you say yes, warned it sees your address. See [Chat with a nearby phone](#nearby)."),
      mark("**The Collection asks for your password**: where the space has a password, the Collection asks for it each time it opens, and again after Erevos was away more than 30 seconds; a fingerprint or face works too. See [Collection](#collection)."),
    ],
    underTheHood: [],
  },
  {
    version: '7.2.0-beta.1',
    forYou: [
      mark("**New chat looks the same every time**: the two big buttons are always at the top; **How you connect now** shows only while something is missing, and says it in plain words; **Your contact link** and **Invite someone** are rows, with no second QR code button. See [Chat through a relay](#relay)."),
      mark("**One scan is all**: where your relay lets your phone invite, **Show your QR code** shows an invite for one person, so a phone new to Erevos joins your relay by itself as it scans it, typing nothing, and you are contacts at once; for someone else, tap **New QR code**. And with a relay, its queue is made by itself: **Create my relay queue** is there only to try again, should that fail. See [Chat through a relay](#relay)."),
      mark("**The bar at the top stays**: on the home screen, the bar with Erevos and its buttons no longer scrolls away with the list, and in SMS chats, as in those of the other networks, the name of the chat, its calls and who is online stay at the top while the messages scroll, as in Erevos's own chats."),
      mark("**A simpler field in Matrix and XMPP chats**: under it there is only **+**, for photos, files and the rest, and the microphone; the chat's settings are under **⋯** at the top."),
      mark("**A stranger's message shows only its words**: a message request, from someone who has only your contact link, shows only what it says until you accept it. Its photos and files wait, not taken, and its links show no preview. See [Chat through a relay](#relay)."),
      mark("**Photos sent as files say nothing of where they were taken**: a photo sent with **File** (JPEG, PNG, GIF or WebP) goes without where and when it was taken and the phone, as a photo does; a GIF sent as a photo keeps moving, now without its hidden notes."),
      mark("**A word of care over a stranger's first messages**: if a message request asks for a code, a PIN, a password or money, promises easy money, or its name looks like one of your contacts', **Be careful** says so above it. Erevos looks for this on your phone only, and blocks nothing. See [Chat through a relay](#relay)."),
      mark("**Tor finds its own way through**: under **Bridges**, **Automatic** tries Tor straight, then the obfs4 bridges, then Snowflake, then your own, until one connects, and remembers for 30 days the one that worked on Wi-Fi and on mobile data. **My network is watched** makes it never try straight, and **Check my connection** says whether Tor connects, and how, never your address. See [Through Tor](#tor)."),
      mark("**Adding a contact with 8 digits**: **Pair with a code** on **New chat** lets one phone show a code of 8 digits and the other type it, said aloud or read off the screen, and you are each other's contacts, with no QR code or link to pass. The code never leaves the phones, and whoever guesses gets 3 tries. See [Chat through a relay](#relay)."),
      mark("**A voice not your own**: in a contact's chat details, **Change my voice** sends your voice messages in that chat **Deeper** or **Higher**, as long as you spoke. The change is made on your phone before the message goes, so your own voice never leaves it. On Android 10 and later, and in browsers that make Opus themselves. See [Chat through a relay](#relay)."),
      mark("**A word of care under a short password**: setting the password of a space or the PIN of hidden chats, Erevos now says when it is short: someone who breaks into the phone's own security could guess it on computers of their own. A phrase of 4 or 5 words is far safer. It still takes a short one. See [Password lock](#lock)."),
      mark("**Groups that end**: a public group can now be a burner group, for one event. Under **It ends**, choose after a day, 3 days or 7 days, and when its time is up every member's Erevos deletes it, with its messages, photos and files, and its link stops working. See [public groups](#public-groups)."),
      mark("**A photo to see once**: under **+** in a chat or a group, **Photo to see once** sends a photo that never shows in the chat, and **Camera, to see once** one you take then. They see it once, on its own, kept out of screenshots where the phone allows, and as it closes it is deleted from their phone. It cannot be forwarded or saved. See [Chat through a relay](#relay)."),
      mark("**Threads in a contact's chat too**: hold a message and choose **Reply in thread**, as in a group. The thread shows alone and what you send there answers it; **n answers in the thread** under a message opens it. See [Chat through a relay](#relay)."),
      mark("**A voice message in words**: hold a voice message and choose **In words**, and your phone writes out what was said, in about a hundred languages, Greek among them. The first time it downloads a speech model of 268 MB, once you say so; then everything is done on your phone, and neither the sound nor its words leave it. On Android. See [Chat through a relay](#relay)."),
      mark("**Phones nearby carry for each other from the start**: **Carry messages for others**, under **Nearby, with no internet** on **New chat**, is now on until you turn it off, so a message that cannot reach its relay finds more phones to take it there. What this phone carries is sealed: it cannot read it, nor tell who it is from or for. See [Chat with a nearby phone](#nearby)."),
      mark("**Last seen is when they closed Erevos**: with **Say when I open and close Erevos** on, closing Erevos, or its hidden chats, now tells those you told while it was open when it closed, so their **last seen** is that time, not when they last heard from you. And you show online only while the chats they talk to you in are open: not while your hidden chats are open instead. See [Chat through a relay](#relay)."),
      mark("**Translate a message**: hold a message and choose **Translate**, and your phone translates it into your language, between Greek, English, German, Spanish, French and Italian. The first time for a language it downloads its translation models, of 60 to 95 MB each, once you say so; then everything is done on your phone, and neither the message nor its translation leave it. On Android. See [Chat through a relay](#relay)."),
      mark("**Sign in at another relay**: under **Sign in with LPHL** on New chat, **Sign in at another relay…** takes another relay's address, and the card signs in there with the accounts that relay takes; one that takes none says so, and its operator can give you an invite. See [Chat through a relay](#relay)."),
    ],
    underTheHood: [
      mark("**Post-quantum, all the way**: between two phones on this Erevos, every message of a chat is now also locked with a fresh ML-KEM key, a new one every few dozen messages, not only at the start. So someone who records your messages today and has a quantum computer one day still cannot read them. By itself, with nothing to turn on; not in groups."),
      mark("**Video calls take about half the data**: a video call over the internet goes through the call relay, so that neither side sees the other's address; its picture is now held to 1 Mbps, which on a phone looks much the same. A call on the same network is not held back."),
    ],
  },
  {
    version: '7.1.2',
    forYou: [
      mark("**Chats you have read stay read, on every network**: in Erevos+, Messenger, Signal, Session, Telegram, Matrix, XMPP and Nostr chats you have read no longer notify you again of messages already read, after a restart, a reconnect or when a chat opens. Signal's reads go both ways with the phone it is linked to, and a Nostr chat you answer from another app is read here too."),
      mark("**The guide tells of Messenger, Signal and Session**: in Erevos+, the user guide has a section for each, on signing in, chats, groups, calls, notifications, Tor and signing out. See [Messenger](#messenger), [Signal](#signal) and [Session](#session)."),
    ],
    underTheHood: [],
  },
  {
    version: '7.1.1',
    forYou: [
      mark("**Matrix warns before your internet address can be seen**: once per chat before the first message, photo or file that can go without Tor, with **Through Tor** to fix it or **Go on**; before a chat's first call, made or answered, as calls never go through Tor; before joining a group without Tor, with **Always through Tor** to fix it; and before a link's preview fetched straight. Only your own Matrix server sees the address: photos and files from other servers come through it. See [Who sees your internet address](#ip)."),
      mark("**Tor for your XMPP account, and per chat**: on Android, the XMPP screen, and the one before signing in, chooses **Off** (the default), **As the space** or **Always through Tor** for the account: its connection, the look for its server and its files, never straight when it must not. **Through Tor** under any XMPP chat or group, off by default, sends the whole account only through Tor while on, as one connection carries all its chats. Calls do not go through Tor. Before you send while the account does not go through Tor, before a call and before a file from another server, Erevos says once that your internet address can be seen, and how not to. See [XMPP](#xmpp)."),
      mark("**Telegram warns before your internet address can be seen**: once in each Telegram chat, before the first message, file, sticker, voice message, poll or forward while the account does not go through Tor, with **Through Tor** for that chat to fix it, **Guide** or **Go on**; before every Telegram call, made or answered, as calls never go through Tor; and before joining a group or channel by its link. See [Who sees your internet address](#ip)."),
      mark("**Tor for Messenger and Signal, and per chat**: in Erevos+, the Messenger and Signal screens, and the ones before signing in, choose **Off** (the default), **As the space** or **Always through Tor** for the account. With it, everything of the account goes through Tor, its pictures and files too, and Messenger's sign-in page and Signal's registering, captcha and linking as well: never straight when it must not. **Through Tor** under any of their chats, off by default, sends the whole account only through Tor while on, as each has one connection. Calls do not go through Tor."),
      mark("**Matrix: Tor as every account has it, and links that open**: the Matrix screen, before signing in too, has **Off** (the default, now for accounts signed in before too), **As the space** and **Always through Tor**; and each chat has **Through Tor**, which makes the whole account go only through Tor, as Matrix has one connection. Calls never go through Tor. A link in a Matrix message whose words do not say where it goes now says it after them, and opens with a tap. See [Matrix](#matrix)."),
      mark("**Nostr: Tor as every account, and per chat**: on Android, the **Nostr chats** screen, before a key is made or brought too, has **Off** (the default, also for keys from before), **As the space** and **Always through Tor** for the account: its relays, look-ups and file servers, never straight when it must not (Always, or the space's Everything). **Through Tor** at the foot of a Nostr chat, off by default, sends that chat alone only through Tor, on circuits of its own, whatever the account says; what comes to you follows the account. See [Chats with other Nostr apps](#nostr-chats)."),
      mark("**Telegram: Tor as every account, and per chat**: on Android, **Tor for this Telegram account**, in Telegram's settings and before signing in, has **Off** (the default), **As the space** and **Always through Tor**, as every account of another network. With Always, or while the space sends Everything through Tor, Telegram is reached only through Tor, signing in too, and never straight, not even when Tor cannot connect. **Through Tor** in a Telegram chat's info sends that chat only through Tor, and with it the whole account, which has one connection. Calls do not go through Tor. See [Telegram (ErevosGram)](#telegram)."),
      mark("**Messenger signs in on facebook.com, and opens Facebook**: in Erevos+, Messenger now signs in on Facebook's own page. **Open Facebook** on the Messenger screen shows Facebook itself with the same sign-in: its Messenger links come back to Erevos's chats, and other links open in your browser without Facebook's tracking marks and never through Tor, so the site sees your internet address. An account signed in on messenger.com before signs out and in again once to open Facebook."),
      mark("**Messenger, Signal and Session chats send more, and stay read**: in Erevos+, **+** in their chats sends a photo from your photos or the camera, a file or a sticker, and the microphone records a voice message. Your own messages show their words, where before some came empty; tapping a person with no Messenger chat yet opens a new one; and chats you mark read no longer come back unread."),
    ],
    underTheHood: [],
  },
  {
    version: '7.0.2',
    forYou: [
      mark("**The guide tells only of what Erevos has**: in Erevos, the user guide no longer speaks of Matrix, XMPP and the chats with other Nostr apps, which are in Erevos+. See [Erevos or Erevos+, and betas](#updates)."),
      mark("**Meeting someone in one tap**: **New chat** now starts with two big buttons, **Scan their QR code** and **Show your QR code**; one of you scanning the other is enough, and the rest is under them. See [Chat through a relay](#relay)."),
      mark("**The panic button, found at once**: it is first, in red, in the **⋯** menu of the home screen, and holding down the lock at the top of the home screen opens it. See [Panic button](#panic)."),
    ],
    underTheHood: [],
  },
  {
    version: '7.0.1',
    forYou: [
      mark("**A ready list of radio stations**: **Add a station** in the Collection's Radio now adds a country's most listened stations from Radio Browser at once, up to 100, with **Add the stations of this country**; the country is the phone's, and **Change** picks another. See [Collection](#collection)."),
      mark("**A new look to start with**: Erevos, newly installed, starts in Glass (Panes), Modernist, System, My color in sky blue, the phone's letters and square messages. A look you chose before stays as it was. See [Appearance](#appearance)."),
      mark("**Modules names only what Erevos has**: under **Settings** → **General**, **Modules** no longer lists Nostr, Matrix and XMPP, which are in Erevos+."),
    ],
    underTheHood: [
      mark("**Every copy carries its licences**: the Android app, the computer and Sailfish apps and the web app now carry the file NOTICES.txt, with Erevos's licence, AUTHORS.md and every package Erevos is built from, each with its licence text. See [Licence](#licence)."),
    ],
  },
  {
    version: '7.0.0',
    forYou: [
      mark("**Erevos or Erevos+, and betas, in Updates**: on Android, **Updates** now chooses the next update: **Erevos** or **Erevos+**, moving from one to the other with everything kept, and **Beta versions**, to join the betas, which come out first for trying, or leave them. See [Erevos or Erevos+, and betas](#updates)."),
      mark("**Radio and TV through Tor**: the Collection's settings on Android have **Play through Tor**, off unless you turn it on. On, stations and channels play only through Tor, so they do not see your IP address; TV may stall for a moment. Off, Erevos says before the first one plays that its server sees your IP address, with a button that turns it on. Before, they always played straight. See [Collection](#collection)."),
      mark("**A chat no longer freezes before a message sent for later shows**: a message your contact sends with **Send later** can come before its time, and shows only then. Until then its chat was marked read again and again without end, so it could stop answering: **⋮** opened nothing and **Back** did not leave it until Erevos was closed. Now such a message is read once it shows. See [Chat through a relay](#relay)."),
      mark("**Matrix, XMPP and Nostr chats are in Erevos+**: Erevos now has its own chats, the Phone, SMS and the Collection, and Erevos+ has Matrix, XMPP and the chats with other Nostr apps besides. An account you had on them stays on the phone, encrypted, and Erevos says so once; choose **Erevos+** in **Updates** to have it again. Erevos's own messages still go through Nostr relays when no relay of yours takes them. See [Erevos or Erevos+, and betas](#updates)."),
      mark("**Choose the part Erevos opens on**: under **All services**, hold any card, **All messages** too, and choose **Opens first**. Erevos's icon in the launcher, and Erevos started with nothing else to open, then open on it; with none chosen, or the chosen one hidden, on **All messages**. Before, the icon always opened the Erevos chats. The widget's buttons still open their own. See [Getting started](#start)."),
      mark("**Asked before strangers reach this phone**: an Erevos invite that comes by SMS is answered by itself only from a number in your contacts or one you have written to; from any other, Erevos asks first, as the sender of an SMS can be made up. A contact's invite to a place on their relay now says first that their relay sees your IP address, and is taken only if you go on. See [Who sees your internet address](#ip)."),
      mark("**Notices in your language**: Android's own notices and screens, new versions, reminders, birthdays, calls, SMS codes and the contact picker, now speak German, Spanish, French, Italian, Portuguese and Serbo-Croatian too, not only Greek and English. Older Greek subtitles, not saved as UTF-8, now show as Greek on the computer. See [Collection](#collection)."),
      mark("**Video calls on the computer, and the calculator after a wipe**: a video call started or answered on the computer now opens its camera. With the calculator in place of Erevos's icon, once Erevos is wiped by the panic password or **Clear storage**, the calculator opens Erevos as new and gives Erevos's icon back, where before no code opened it any more. See [Appearance](#appearance)."),
      mark("**Last seen starts off**: in a new space, **Last seen** is now off until you turn it on, so no contact sees when you last had Erevos open, and you see no one's either. A space you already have keeps it as it was. See [Chat through a relay](#relay)."),
      mark("**A chat with a big file no longer closes Erevos**: on Android, opening a chat that held a large file, or one shared in many pieces, could close Erevos at once. Now it opens. See [Chat through a relay](#relay)."),
      mark("**A hidden service stays quiet**: a service you hide in the **Services** window, Messenger, Matrix, SMS or any other, no longer sends notifications or counts on Erevos's icon, as a muted chat. It stays connected and tells again once you show it. Telegram, whose folders can stand on home of their own, keeps telling. See [Getting started](#start)."),
      mark("**Screenshots in hidden chats too, if you want**: hidden chats now follow **Screenshots** in **Privacy and security**: on, as it starts, they stay out of screenshots and the recent apps; turned off, screenshots work in them as in the other chats. Before, hidden chats always kept them out. See [Hidden chats](#hidden)."),
      mark("**The Public tab says why it shows no Nostr post**: whether the list of people you follow was not found, or they were found but no relay sent their posts, or their posts came but could not be shown, and how each relay answered. Before, it said only that no public posts were found. See [Chats with other Nostr apps](#nostr-chats)."),
      mark("**A new computer links to the end**: a computer with no relay before linking now takes the phone's answer at once, so linking with the small code finishes by itself, and with the full code **They match** shows. Before, the phone waited for **They match** while the computer showed nothing more until Erevos started again. See [Linked devices](#devices)."),
      mark("**Sharing into Erevos reaches every service**: **Send to** now lists the chats of your Matrix, XMPP and Nostr accounts too, beside Erevos chats, groups and SMS conversations. A photo or file shared from another app no longer goes missing when Erevos locks as it opens: after the password, **Send to** shows it again, where before it said that nothing came to send. See [Chat through a relay](#relay)."),
      mark("**Search, media, days and export in Matrix, XMPP, Nostr and SMS**: these chats now have **Search in this chat**, **Media, links and files**, **Go to a day** and **Export chat**, as Erevos chats do, over what your phone keeps of them; an SMS conversation has them under **⋮**. Nothing you search for leaves your phone. See [Getting started](#start)."),
      mark("**Styles, cards and video in Matrix, XMPP and Nostr**: these chats now show bold, italic and the other marks for how words look, with tappable links, and send a contact card, a video without where it was filmed, or a photo from the camera at the quality you choose. In groups, @ offers the members; Nostr chats send your location, and a message you forward is marked as forwarded on your phone. See [Matrix](#matrix)."),
      mark("**Starred messages in every chat**: star a message in Matrix, XMPP, Nostr and SMS too, and find it again under **Starred messages**; save a photo, video, voice message or file that came there to the Collection, and keep a sticker or photo that came as one of your stickers. See [Chat through a relay](#relay)."),
      mark("**Pin and archive any chat**: hold any chat down on the home screen (an Erevos contact or group, Matrix, XMPP or Nostr) to **Pin to the top**, **Archive** or, on Android, mute it, as SMS conversations already could. Archived chats wait under **Archived** until a new message comes from them. Matrix favourites show pinned, and low-priority rooms come last. A Matrix row shows ✓✓✓ once everyone has read yours. Matrix rooms, XMPP contacts and group MMS can take a name of your own. See [Getting started](#start)."),
      mark("**Drafts, Send later and Remind me on Matrix, XMPP and Nostr**: what you type in a chat and do not send stays as its draft, also after Erevos closes, and shows on the chat's row. Hold **Send** down to send a message later from this phone. A Matrix or XMPP message that did not go has **Send again** in its menu, and **Remind me** on a message of any of these chats, SMS too, puts it in Chat with myself with a reminder. See [Matrix](#matrix)."),
      mark("**A PIN and screenshots for Matrix, XMPP, Nostr and SMS chats**: lock a chat on Matrix, XMPP or Nostr, or an SMS conversation, with a PIN of its own and block its screenshots, as an Erevos chat; an SMS conversation can also have its own look, be muted, or have a sound of its own. See [Hidden chats](#hidden)."),
      mark("**Chat rules on Matrix, XMPP, Nostr and SMS**: disappearing messages, a timer for the chat or **Disappear** for one message, each chat saying what the other side keeps; **Block** on Matrix and Nostr, with a list of whom you blocked on each service's screen; **Delete** asks **This phone** or **Everyone**; on XMPP, **Appear offline** to one contact; and **Check in person** by QR code on XMPP and Nostr. See [Matrix](#matrix)."),
      mark("**Choose where a call's sound goes**: with a Bluetooth or wired headset connected, **Speaker** in a call becomes **Audio output**, to choose the phone, the speaker or the headset, a Bluetooth one by its own name. A headset connected as a call starts, or during it, takes the sound, as in a phone call. On Android. See [Chat through a relay](#relay)."),
      mark("**Nothing goes through Tor unless you turn it on**: on Android, **Automatically from your relay** under **Home relay** is now off in a new space, so a space no longer takes its relay's paired relay as a home relay through Tor by itself; turn it on there if you want it. Turning it off now also lets go of the home relay it took, so Tor does not run for it. See [Home relay](#home-relay)."),
      mark("**Your relays first, Nostr only after them**: a text to a contact who reads on Nostr now goes through your relay, then their home relays, then your home relay, and through the public Nostr relays only when none of them took it. Before, it went to the Nostr relays first and through your relay only when they were slow or did not take it. See [Through Nostr](#nostr)."),
      mark("**One chat only through Tor**: on Android, **Through Tor** in an Erevos chat's **Details** sends that chat's messages and files only through Tor, on circuits of its own, whatever the space's Tor setting. It is off unless you turn it on, and calls do not go through Tor. See [Through Tor](#tor)."),
      mark("**One chat only through Tor reaches Nostr too**: a chat with **Through Tor** on in its **Details** now sends and reads its Nostr texts only through Tor, and its photos and files on Nostr file servers too, even when the space's Tor is **Nothing**; Tor is started for it, and what goes waits for it. Until your contact first writes to the chat's own queue, their first messages come to the space's own queue, which is read the space's way. Before, with the space's Tor off, such a chat's texts could reach the public Nostr relays straight, and they saw the phone's internet address. See [Through Tor](#tor)."),
      mark("**Through Tor on your linked devices too**: a chat's **Through Tor** switch, set in its **Details**, now reaches your linked devices (your computer, the web app and Jolla) and back: switched on or off on any of them, it is switched everywhere. On a linked device that chat's messages, files and send-later messages then go only through Tor too, on the chat's own circuits, never straight; so do the copies that go to your contact's other devices. The web app has no Tor: there a chat with the switch on sends nothing while it is on, and the switch is shown so it can be turned off. A device on an older version never turns it off anywhere; it learns a change made elsewhere at that contact's next change. Before, it was only on the phone where you set it. See [Through Tor](#tor)."),
      mark("**Nostr has its own Tor switch**: the **Nostr** screen now has **Nostr through Tor**, **On** or **Off**, off unless you turn it on. **On**, Erevos reaches the Nostr relays and the Nostr file servers only through Tor, and starts Tor for it even when the space's Tor is **Nothing**; a text that goes there waits while Tor starts. It only adds Tor: with the space's Tor on, or for a chat set to **Through Tor**, Nostr goes through Tor whatever it says. Before, Nostr only followed the space's Tor setting, and the screen only said whether it was on. See [Through Nostr](#nostr)."),
      mark("**Erevos warns before your internet address can be seen**: once before the first message, voice message or file in an Erevos chat that can go without Tor, with **Through Tor for this chat** to fix it or **Go on**; before the first message in an Erevos group that can go without Tor; before a call, as calls never go through Tor, unless the contact is nearby on the same network; before fetching a file from a server your contact chose; and in every **Open this link?** question, where the site sees the address. Each has a **Guide** button. Before, Erevos did not say it. See [Who sees your internet address](#ip)."),
      mark("**A Tor switch of their own**: backups to a server, the Collection's server copy, radio and TV lists, link previews and updates each have a **Through Tor** switch in their own screen, off unless you turn it on. On, that goes only through Tor, whatever the space's Tor setting, and waits while Tor starts; nothing goes straight. Off, it goes as before. It only adds Tor. For updates, the switch makes the daily new-version notice and **Check for updates** ask the web app's server instead of GitHub; a new version is told, but it does not download through Tor: to install it, turn the switch off for a moment. Playing a radio station or a TV channel always goes straight. Before, backups, the Collection and radio and TV followed only the space's Tor setting, and link previews and updates never went through Tor. See [Who sees your internet address](#ip)."),
      mark("**Bare web addresses open too**: t.me/name, example.org/page and the like are now tappable in every chat, as in Telegram and Signal, and show whole before they open; e-mail addresses and file names are not. See [Chat through a relay](#relay)."),
      mark("**Share an imported chat with the other person**: a Telegram, WhatsApp or Viber chat that goes on with an Erevos contact can now go to them too, from the chat's **Details** or **Settings** → **Data and devices** → **Imported chats**: every message, photo, video, voice message and file, end-to-end encrypted, to them alone, whatever its size. Their Erevos keeps the messages at once and shows them ahead of the new messages, the sides swapped; the files follow in rounds through your relay while both phones run Erevos, each up to 4 GB, as large as an import now keeps. See [Imported chats](#import)."),
      mark("**Stickers on other networks**: a built-in sticker sent on Matrix, XMPP, Nostr or by MMS arrives as its picture, made on your device, its words in your language. See [Chat through a relay](#relay)."),
      mark("**One button for all your services**: under the search on the home screen, one button says which service shows, with the messages not read and any service not connected now. Tap it for a window with every service as a card, each with its own number and a dot for its connection; **Add** turns more on, and holding a card moves it or hides it. With no search, the chats with messages not read come first, under **Unread**, then the rest under **Recent**. See [Getting started](#start)."),
      mark("**Voice messages in Opus**: on Android 10 and later, in the web app and on a computer, voice messages are recorded as Ogg/Opus, as Telegram and Element send them: as clear as before at half the size, about 240 KB a minute. Every Erevos plays them, Safari on an older iPhone too. See [Chat through a relay](#relay)."),
      mark("**Mark all as read**: the ⋮ menu of the chats has it for the part of the list you are on, all messages, SMS, Erevos, Matrix, XMPP or Nostr, and the Matrix, XMPP and Nostr screens have it for their chats. It asks first, then reads each chat as opening it would: those who wrote are told as then. See [Getting started](#start)."),
      mark("**Answer with video, or voice only**: an incoming call, Erevos, group, XMPP or Matrix, now offers both. You can add video to an Erevos voice call while it goes on, and Flip on a computer moves to your next camera. See [Chat through a relay](#relay)."),
      mark("**Voice messages, places, contact cards and pins in SMS**: in an SMS conversation, hold the microphone to send a voice message by MMS. **+** also sends where you are, as an SMS with a map link any phone opens, and a contact from your phone as a contact card. Voice messages, contact cards and map links you receive show as such, to play, save or open. Hold a message down to **Pin for me**, kept only on this phone, or **Select** several to copy, forward or delete them together. See [SMS](#sms)."),
      mark("**More in XMPP chats**: voice messages from other XMPP apps now play in the chat and show how long they are; **Sticker** sends your own photo stickers as photos, encrypted as the chat is; groups show who is **owner** or **admin**, and the owner can set the group's **Description**; **Forward** sends one or several messages to another XMPP chat; tapping a quoted reply goes to the message; **Pin for me** keeps a message at the top on this phone only; and **Select** chooses several messages to copy, forward or delete. See [XMPP](#xmpp)."),
      mark("**More in Nostr chats**: tap a reaction to add it or take yours back, pin messages for yourself, select several to copy, forward or delete, send your own photo stickers, and see, vote on and make polls in the Public feed. See [Chats with other Nostr apps](#nostr-chats)."),
      mark("**Matrix groups and stickers**: in a Matrix group, **Members** shows who is in it and who is an admin or moderator, and lets admins rename it, set its subject, make admins, and take people out or bar them. Stickers sent from Element and other Matrix apps now show, and your own stickers made from photos can be sent. **New chat** can find people by name, and **Select** in a message's menu chooses several messages to copy, forward or delete. See [Matrix](#matrix)."),
      mark("**More in your chats and groups**: choose several messages to copy, forward or delete at once; end your polls; reply in threads in groups; give a group a description; and send a contact from your phone as a card. See [Chat through a relay](#relay) and [Group chats](#groups)."),
      mark("**Read marks no longer go missing**: when you read a message and put the phone away at once, the other person still learns that you read it, at Erevos's next look, also after Erevos was closed. Before, it could stay at ✓✓ for them for good."),
      mark("**Backups are checked**: after each automatic backup Erevos reads it back from the folder, opens it with its password, makes sure every part it names is there, of its size, and reads two of them through. On a server it looks at the listing only. **Check now** under Backups also downloads the server’s newest backup and ten of its parts; a part missing or damaged shows in red. **Full check of the folder** compares every part there with its SHA-256, on the phone. See [Backups](#backup)."),
      mark("**Folders in Chat with myself**: notes, photos, files and voice messages can now go in folders. The folder button at the top makes one; its tab above the notes then shows only what is in it, and what you write while it is chosen goes into it. Holding a note offers **Move to a folder**; holding a folder's tab renames or deletes it, its notes staying. The folders go to your linked devices with the notes. See [Getting started](#start)."),
      mark("**Messages come at once while Erevos shows**: Erevos now waits at your relay with the connection open also while it is on the screen, so a message or a call comes the moment it is sent, not at the next look every 3 seconds, and the phone's radio rests in between."),
      mark("**The battery mode And sleep spares more**: each time it wakes the phone to look, about once a minute, the phone now sleeps again within a second or two when nothing came, not after 25 seconds."),
      mark("**A new battery mode, And light sleep**: under Settings → Notifications → In the background. The phone may sleep, and what comes to your relay wakes it, so messages and calls still come at once where the network and Android allow it. It is new: if messages come late with it, choose another."),
      mark("**A new first start**: the first screen now says what you do not give, no phone number, email, user name or account, and asks for a name for your contacts, if you want one. After the modules comes a short screen for each, with how to begin with it and what Android should allow for it, **Allow all, one by one** among it; then the password lock and backups, then what is ready and what is missing. **I already have Erevos on another phone** goes straight to restoring a backup. See [Modules](#modules)."),
      mark("**Leftovers**: photos and files that nothing names any more, as those of an import that stopped in its middle, can now be found and deleted, under Backups → **Leftovers**. Type the PIN of each of your hidden chats and the password of any other space, tap **Find leftovers**, and Erevos shows how much none of them names; **Delete them** deletes it once you say so. See [Backups](#backup)."),
      mark("**What takes room**: Backups now have **What takes room**, which shows on Android how much room Erevos takes on the phone, by kind: the Collection with the chats' photos and files, voice messages, chat history, Tor, and what writes that did not end left over. Each automatic backup holds it all, so it tells why one is large. See [Backups](#backup)."),
      mark("**Choose the name others see**: under Settings → Privacy and security → **My name**, give this space a name that your contacts and your private groups see instead of a code, always encrypted. Hidden chats have a name of their own, in their settings, empty at first. See [Chat through a relay](#relay)."),
      mark("**Photos and files from the Collection, straight from a chat**: **+** in a chat now has **Collection**, which opens the Collection of that chat's place, its photos and its other files. Tap what to send, then **Send**, and it goes in the chat. Before, **Photo** opened only the phone's own gallery. See [Collection](#collection)."),
      mark("**Your SMS on your computer**: the phone's SMS can now show on this space's linked devices too, a computer, a browser or a tablet, end-to-end encrypted: read them there and answer, and the phone sends the answer. The latest 50 conversations go, each with its latest 50 messages; photos stay on the phone. Off until you turn it on, on the phone, under Settings → Phone and SMS → SMS → **On my linked devices too**. See [SMS](#sms)."),
      mark("**TV in the Collection**: the Collection's new **TV** tab plays TV channels from IPTV lists (.m3u), by their link or from a file, or from iptv-org's public list of free channels, by country or whole, in their groups, with a search, on Android, on a computer and in a browser. There is no programme guide, logos show only if you turn them on, and a channel's name and link, or a radio station's, can be sent to a chat. See [Collection](#collection)."),
      mark("**Radio that keeps playing**: when a station's server, or a proxy on the way, drops the stream, or the network goes for a moment, Erevos asks the station again by itself, a few seconds later, instead of stopping."),
      mark("**Radio playlists with many stations**: in the Collection's Radio, **Add a station** takes a playlist link (.m3u, .pls) that names many stations and adds each of them, and **Import a playlist file** adds the stations of a .m3u or .pls file from your device. Only stations with an https link are added, and Erevos says how many were left out."),
      mark("**Say when I open Erevos**: with **Last seen** on, opening Erevos now tells your contacts at once, without waiting for a message: only those you talked with in the last 30 days who show their own time too, each after a random wait of up to a minute, at most every 15 minutes. The relay can then tell when you open Erevos: turn it off under Settings → Privacy and security → Last seen, or in a chat's details. See [Chat through a relay](#relay)."),
      mark("**Moving to a new phone**: a new chapter of the guide takes you step by step from the old phone to the new one with one backup: what to get ready, what comes over, what to set again, and wiping the old one at the end. See [Moving to a new phone](#new-phone)."),
      mark("**A lost phone**: if the phone a backup came from was lost or stolen and may still be on, **The old phone was lost** under Settings → Data and devices → Backups moves every space and its hidden chats to new relay queues, so that phone reads nothing more of yours there, and tells your contacts quietly. The contact links and QR codes you gave before work for 14 more days. See [Backups](#backup)."),
      mark("**Restored chats go on by themselves**: after a backup is restored, a chat that went on after the backup was made starts a new conversation with the contact by itself, so you no longer give each other your links again, but with a contact on an older Erevos. See [Backups](#backup)."),
      mark("**Backups every 6 hours, and lighter**: automatic backups can now come every 6 hours too, made while Erevos is open and as it goes to the background. Each one writes and sends only the photos, files and voice messages that are new, and names again those of the backups before it: keep the whole backup folder together. See [Backups](#backup)."),
      mark("**Linked devices after a restore**: the phone a backup was restored on can ask the computers and browsers the old phone had linked to link again: tap **Ask to link again** under Settings → Data and devices → Linked devices, then **Link again** on the device. It keeps its chats, with no code to scan. See [Backups](#backup)."),
      mark("**The phone's calls in backups**: on Android, **Put the calls in backups** under Backups adds the call history and Android's blocked numbers to your backups, and restoring adds back those the phone lacks. Off until you turn it on. See [Backups](#backup)."),
      mark("**Block screenshots in a chat**: in a chat's details, **Block screenshots** keeps screenshots and screen recordings of it out on both phones, on Android, and either of you can turn it off again. Erevos on an iPhone, on a computer, in a browser or on Sailfish cannot block them, and says so. See [Chat through a relay](#relay)."),
      mark("**Every chat in its own look**: groups, Chat with myself and chats on Matrix, XMPP and Nostr now have **Chat look** too, as a contact's chat had, for that chat only. See [Chat through a relay](#relay)."),
      mark("**Letters and text size**: Settings → Appearance has **Letters** (the style's own, the phone's, serif or monospace) and the messages' **Text size**, for the whole app or, from **Chat look**, for one chat. See [Appearance](#appearance)."),
      mark("**Muting hidden Matrix, XMPP and Nostr chats**: a hidden place's own Matrix, XMPP and Nostr chats can now be muted, as hidden chats are, and then say nothing at all. See [Hidden chats](#hidden)."),
      mark("**Reminders that come again**: a note Fasouli keeps for a scheduled payment now reminds you each time it is due, every month or as the payment repeats, and shows how often. Once you see it, it moves to its next time. See [Getting started](#start)."),
      mark("**Who is online on Matrix and XMPP**: under a contact's name it says, as their server does, **Online**, **Away** or **Do not disturb**, with the words they set, or when they were last online, and their picture in the chat list has a green dot. On Matrix, Erevos no longer says you are online unless you turn on **Say when I am online** on the Matrix screen. See [Matrix](#matrix)."),
      mark("**New modules on after an update**: where the modules were chosen before the Collection came, as on a phone or computer updated from 6, the Collection stayed off. Now it is on there, as is any module that comes later, until you turn it off in Settings → General → Modules. See [Modules](#modules)."),
      mark("**Photos of the Collection one after the other**: in a photo, the arrows (on a phone too, while the bars show) or a swipe go to the next or the one before, and **Slideshow** shows them by themselves, one every 4 seconds, till a tap. On a computer, in a browser and on Sailfish OS a photo opens again instead of staying at **Opening the photo…**. See [Collection](#collection)."),
      mark("**A home relay by itself**: on Android, when your relay names a relay paired with it, a space with no home relay takes that one, only through Tor, with its token from a coupon: nothing to type. **Automatically from your relay**, under Settings → Relay and networks → Home relay, turns it off. See [Home relay](#home-relay)."),
      mark("**A chip for every part that is on**: above the chats, **SMS**, **Erevos**, **Matrix**, **XMPP** and **Nostr** each have their chip whenever they are on in Modules, also with no chat yet. Before, in a space with only SMS so far, choosing **All messages** after Erevos's icon opened its chats hid the chips, with no way back."),
      mark("**Invite at one tap**: on the home screen, **Invite** beside the relay's line shows an invite's QR code at once, with nothing to type: who it is for and your name for them can be typed below it, or never. See [Chat through a relay](#relay)."),
      mark("**Smaller invite QR codes**: the QR code of **Invite someone** now holds about eight times less, so simpler and older cameras read it too, and its link is short enough for an SMS. It opens Erevos's page for invites, which offers Erevos and then opens the invite in it. Where your relay lets this phone make no invite, the long one is still made. See [Chat through a relay](#relay)."),
      mark("**Invites and contact links by touch**: on an Android phone with NFC, while **Invite someone** or **My QR code** shows the small QR code, hold the back of their phone to the back of yours: their phone opens it by itself, in Erevos where it is installed. See [Chat through a relay](#relay)."),
      mark("**Sign in with LPHL without typing a code**: on Android, once you sign in on the page the browser opened, tap **Open Erevos** there, and Erevos finishes signing in by itself. The code to type is still on the page, in case nothing opens. It needs the relay updated. See [Chat through a relay](#relay)."),
      mark("**A small contact QR code**: **Show my QR code** now shows your contact link in short, so any camera reads it, and **Share my contact link** sends a link any app lets you tap. Whoever scans it while it shows is your contact at once; later, they write a message request first. **Large QR code, for no internet** shows the whole one, for near with no internet. See [Chat through a relay](#relay)."),
      mark("**Links open Erevos**: on Android, an invite or contact link tapped in any app opens Erevos, which asks before it takes it, once the web server and a new Erevos are both out. See [Chat through a relay](#relay)."),
      mark("**More music and video formats in the Collection**: on Android MP3, AAC, M4A, FLAC, Ogg, Opus, WAV, AMR, MP4, MKV, WebM and 3GP play, also a file that came with no type, known by its name's ending, and seeking works in an MP3 with no table of its seconds. See [Collection](#collection)."),
      mark("**Music of the Collection goes on with the screen off**: on Android, music could stop a while after the screen went off. Now the player is kept in the foreground for as long as the list plays. See [Collection](#collection)."),
      mark("**Photos, Videos, Music and Files**: the Collection has a tab for each, each with the folders that hold any of its files above it. See [Collection](#collection)."),
      mark("**A player's screen for the Collection**: tap the bar of the music playing, or **Now playing**, for its cover, title, artist and album, a bar to move in it, previous and next, **Shuffle**, **Repeat** (all or one), the speed from 0.5× to 2×, and the list, to tap another. A video, or music of 10 minutes or more, starts where you left it. The notification shows the title and cover only with **Show the title in the notification** on. See [Collection](#collection)."),
      mark("**Subtitles for the Collection's videos**: an .srt or .vtt file in the same folder with the video's name (film.srt, or film.en.srt) shows as its subtitles, and a tap at the top turns them off or on. See [Collection](#collection)."),
      mark("**Playlists in the Collection's Music**: songs in the order you choose, kept encrypted with the Collection, played in order or shuffled. Make one at the top of Music, and add songs from their menu or by holding them down. See [Collection](#collection)."),
      mark("**Music and videos of any size in the desktop app's Collection**: they play and seek at once, read a piece at a time from their encrypted pieces, never held whole in memory. See [Collection](#collection)."),
      mark("**Internet radio in the Collection**: a Radio tab with stations you add by their https link, kept encrypted with the Collection, played like the music, with the notice on the phone. The station sees your device's IP address. See [Collection](#collection)."),
      mark("**Find radio stations by name**: Add a station in the Collection's Radio tab searches Radio Browser, a free directory, sent only the words you type when you press Search. See [Collection](#collection)."),
      mark("**Link a computer with one tap**: on the computer, **Linked devices** now shows a small code at once. Scan it with the phone and tap **Link**: the phone gives the computer what it needs through Nostr, end-to-end encrypted, and nothing has to be typed or compared. If Nostr cannot be reached, **Link another way** keeps the old way. See [Linked devices](#devices)."),
      mark('**Support Erevos**: every way has its QR code now, Liberapay and PayPal too, and PayPal opens in the browser.'),
      mark('**Chats open at their end**: a long chat, or one with imported messages, could open at a message read long ago, often a photo, as it drew earlier messages on its way to the end. Now it opens at the newest message, and the arrow to where you left off is there when new ones came.'),
      mark("**Tor off unless you turn it on**: a new space sends nothing through Tor, so messages go fastest, and turning Tor on asks first, as it makes them slower. A space you already have keeps its choice, under Settings → Relay and networks → Tor. Texts through Nostr now go without Tor too: then the Nostr relays see your phone's internet address, never who wrote to whom. See [Through Tor](#tor)."),
      mark("**Linked devices on the same Wi-Fi**: the phone and a computer on the same Wi-Fi or hotspot give each other what changes straight there, with no internet too. See [Linked devices](#devices)."),
      mark("**Your Matrix, XMPP and Nostr accounts on every linked device**: each device linked gets them by itself, with no choice to make, and they follow as they change on the phone: one you sign out of there, or replace with another, goes from the devices too. See [Linked devices](#devices)."),
      mark("**Same settings on your linked devices**: the language, the look and Last seen changed on the phone or a computer change on the others too. A photo behind the screens, passwords, PINs and what is about one device alone stay on each. A device can keep its own: **Same settings on every device** in Linked devices. See [Linked devices](#devices)."),
      mark('**Collection**: an encrypted place in every space and hidden place for photos, files and folders, with its icon next to the lock. Turn it on in Modules. See [Collection](#collection).'),
      mark('**Music, videos and PDFs in the Collection**: music and videos play from their encrypted pieces, music on with the screen off and with play, pause, next and previous on the lock screen, and PDFs read page by page inside Erevos. **Open with another app** leaves no plain copy, and a photo or video picked from the gallery can be deleted there after importing. See [Collection](#collection).'),
      mark("**Last seen**: when a contact is not online, their chat says when they last had Erevos open, to the minute. It goes end-to-end encrypted, never to the relay. It is on, and both ways: turn it off in Settings → Privacy and security → Last seen, and no one sees yours, nor you theirs. Hidden chats have their own time and their own switch, in a chat's details there. See [Chat through a relay](#relay)."),
      mark("**One Public feed**: the new **Public** chip on the home screen shows the public posts of the Nostr people you follow and the public Matrix rooms you are in as one feed, as in Amethyst, with photos inside the posts and a card for a link. Answer, share again, like, share and write new posts with photos; for Matrix, answer, react and share. **Photos** chooses whether photos come at once, only through Tor or on a tap. The **Nostr** chip shows only the Nostr chats again. See [Chats with other Nostr apps](#nostr-chats)."),
      mark("**The Collection on a computer**: in the desktop app for Linux, macOS and Windows the Collection keeps your photos and files encrypted too. Photos, PDFs, music and videos open in memory only, never as a plain copy on the disk, and close when the space locks. **Save to the computer** asks first. See [Collection](#collection)."),
      mark("**Files up to 4 GB in the Collection**: on Android a file picked from the phone's files is encrypted as it is read, with no plain copy first, so it comes in faster and needs no room twice. In the desktop app music and videos up to 1 GB play. See [Collection](#collection)."),
      mark("**The Collection on a WebDAV server**: each space and hidden place can copy its Collection, still encrypted, to a folder on a server you choose, Nextcloud, ownCloud or any that speaks WebDAV, so big files are not only on the phone. Only what is new goes, and a phone that lacks a file fetches it from there. See [Collection](#collection)."),
      mark("**The Collection on your linked devices**: turn on **On my linked devices too** in a Collection's settings and that Collection goes to the space's or hidden place's linked devices, changes and deletions with it. Small pictures come at once, a file itself on the same Wi-Fi or when you open it, a piece at a time, going on where it stopped after the network drops. See [Collection](#collection)."),
      mark("**The Collection in the browser and on Sailfish OS**: the web app, on an iPhone's home screen too, and Erevos on Sailfish OS have the Collection now. A file is encrypted a piece at a time as it is read, and if the browser runs out of room nothing of it is kept. Photos, text, music and videos up to 256 MB open in memory only; a PDF is saved to be read elsewhere. See [Collection](#collection)."),
      mark("**Groups stay on the device you choose**: on the phone, under Linked devices → Groups stay on, move the groups to a linked computer. Their keys go there, never copied, so the groups work there with the phone off and new ones can be made there; members see nothing new. See [Linked devices](#devices)."),
      mark("**Add someone new on a linked device without the phone**: a computer adds someone whose contact link is from this version by itself, with the phone off, and writes to them at once; they see your account as a request, with the same safety number, and the phone adds them too once it is on. See [Linked devices](#devices)."),
      mark("**Calls and Send later on your linked devices without the phone**: with a contact on this version, a computer calls and is called by itself and sends a message for later itself, with the phone off, and a copy goes to each of their devices too, held till its time. Every device of yours shows what is scheduled, and deleting it on any of them takes it back everywhere. See [Linked devices](#devices)."),
      mark("**A home relay only through Tor**: switch a home relay to **Only through Tor** and it never sees your phone's address, whatever Tor is set to for the rest. With no token typed, it gives one for a coupon that your relay signs blind, so neither relay can tell whose it is, and two spaces can use each other's relays as home relays with nothing tying them together. The token comes within the hour, lasts 90 days, and Erevos renews it by itself. Needs Tor, on Android. See [Home relay](#home-relay)."),
      mark("**Shared into the Collection with no plain copy**: a photo or file another app shares with Erevos is encrypted as it comes in, before **Send to** opens, so on its way into the Collection it never lies unencrypted on the phone. It can be up to 4 GB there, and a large one shows how far it is encrypted, with **Cancel**; a chat still takes 100 MB at most. See [Collection](#collection)."),
      mark("**See a file come from the WebDAV server**: a file of the Collection that is not on this device, as after a backup restored on a new phone, shows how much of it has come from the server, and **Cancel** stops it; what came stays, and the next time only the rest comes. Music, videos, PDFs and **Open with another app** fetch it first too, instead of failing. See [Collection](#collection)."),
      mark("**Notes from another app**: an app on the phone, as Fasouli for a payment that is coming, can ask to keep a note with its reminder in Chat with myself. Erevos asks you first, in the space you open. See [Getting started](#start)."),
      mark("**Payment requests**: another app, as Fasouli, can ask Erevos to send one to a contact: an amount and what it is for, as a card. They tap **Paid** once they paid, and **Mark in Fasouli** then marks it collected there. Erevos moves no money. See [Chat through a relay](#relay)."),
      mark("**Panic tells Fasouli too**: on Android, under Settings → Privacy and security → Panic button → **Tell other apps**, choose the apps Erevos tells as it wipes, as a panic app does: Fasouli then locks itself. Each asks you first. See [Panic button](#panic)."),
      mark("**Sign in with Nextcloud**: a Collection's server and the backups' server can now be your Nextcloud, as LPHL's, the one Fasouli syncs with, without typing a password: tap **Sign in with Nextcloud**, sign in in the browser and grant access. Erevos gets an app password of its own and its own folder there, Erevos/Collection or Erevos/Backups. See [Collection](#collection)."),
    ],
    underTheHood: [
      mark("**Ticks**: a text the other phone had, and read, before it showed as sent here (through a slow Nostr relay) now shows as read, not with one tick. Ticks from a contact on another relay no longer stop, and a text that reaches a phone while Erevos is in the background there gets its second tick at that phone's next check."),
      mark("**Chats are saved faster**: a message that comes, is read or is deleted is saved by looking only at its own chat, which shows most with many chats or after a large import. The chat screen is no longer drawn again every 5 seconds."),
      mark("**Large imports write less**: the note of the files an import is still writing is kept in small parts, not written whole for every file."),
      mark("**A text no longer waits for slow Nostr relays**: with Nostr on, a text waited for a Nostr relay to say it took it, up to 20 seconds when none answered, before it went through the relay. Now, when none says so within 4 seconds, it goes through the relay as well at once."),
      mark("**An import that stops leaves nothing behind**: when Erevos stops while it brings in the photos and files of a Telegram, WhatsApp or Viber export, as when Android closes it or the battery runs out, what it had written of them is deleted the next time it starts. Before, it stayed on the phone, and in every backup, for good. See [Imported chats](#import)."),
      mark("**Backups to a server get there again**: a backup to your own server, such as a Nextcloud, no longer stops when the server misses one of its pieces for a moment, as when it closes for a few minutes at night. That piece goes again a little later and the backup carries on; before, it started over the next time, and a large backup could fail day after day. See [Backups](#backup)."),
      mark("**A chat opens at its last message again**: opened from the home screen or a notification, a chat could stop above its newest messages, often above the unread ones. Now it goes to its end at once, and once more as its messages come into view."),
      mark("**A new sign-in to a relay is no longer undone**: after you signed in to your relay again, a chat screen open from before could later write back the token from before, which the relay no longer lets in, and the relay then refused this phone. Now the new token is kept at once, and every chat screen open takes it. See [Chat through a relay](#relay)."),
      mark("**A message sent offline is no longer lost when you leave the chat**: what you sent while your chats were still opening, as they do for a while with no connection, was lost if you left the chat before it went. Now it waits, marked **Waiting**, and goes by itself once the relay or their phone nearby can take it, a voice message too. See [Chat through a relay](#relay)."),
      mark("**No more freezing after a space opens**: while an automatic backup was made, the screen could stop answering for minutes. Now the backup's files are written, listed and deleted in their folder away from the screen, and its parts are checked natively, many times faster."),
      mark("**Groups after a restore**: a member restored from a backup asks the group's admin to put it in again, which works while the group moved on only a little."),
      mark("**The time of a message that waited**: a message that waited on the relay, as for a computer or for hidden chats that were closed, now shows when it was sent, not when it came. From an Erevos before this version it still shows when it came."),
      mark("**Home relay**: the screen no longer says that whoever runs a home relay sees this phone's address when it is set to **Only through Tor**."),
      mark("**An invite that opened Erevos for the first time** opens once the first start's setup is done, however long it took; before, after five minutes on the setup screens it was lost."),
      mark("**Large files saved from the Collection on Sailfish OS**: **Save to phone** writes a file of any size to Downloads a piece at a time, as the desktop app now does too, and when the disk has no room left Erevos says so and leaves nothing half-written. See [Collection](#collection)."),
      mark("**Backups skip what is on the WebDAV server after a restart too**: that a Collection's copies on its server are complete is kept with it, so a backup made after Erevos starts again still leaves its pieces out, as long as no file was added or deleted since. **The connection works.** now shows in the colour of success, not of a warning. See [Collection](#collection)."),
      mark("**Moving a chat to a space with no relay**: **Move to another space** stopped there, as that space had no relay of its own. Now it offers this space's relay, which that space then keeps, and it makes that space's relay queue when it has a relay but no queue yet. See [Second password](#second)."),
      mark("**Fixes from a review of all the code**: a message you were typing stays with its chat when you open another, and never shows in a PIN-locked chat's place; a locked chat under a locked group stays out of screenshots when the group closes; the Collection's catalogue goes into backups, so a restored phone opens its files; calls in a public group reach their members; a Matrix or XMPP account no longer stops for good at one bad message or an unreachable server; a message sent for later stays listed while its details are still coming; the computer app's Wi-Fi link refuses an impossible port; and the panic button lets the apps it tells start before it closes."),
      mark("**Safer in twelve more ways, from the review before 7**: a message the relay hands you is deleted there only once your phone has kept it, so a connection cut at that moment loses nothing (an older relay works as before); a relay keeps a bound on what it holds in all and for each phone; in a public group no one can have another member taken out by claiming to be them; with SMS invites off, no one becomes a contact from your number alone; searches that find nothing are forgotten after a quarter of an hour; a Matrix message is shown as its sender's only when the key came from their device, else as **Not verified**, and an XMPP or Matrix device that changes its key gets nothing until you accept it, while a new device is said in the chat; a photo or file from a server its sender chose is fetched by itself only through Tor, else on a tap; an old first packet replayed to you never takes over a chat; and your linked devices' log takes each device's changes only from that device, and forgets devices that are gone."),
      mark("**Web app and Sailfish OS fixes from the review**: in the web app, each space that turns notifications on gets a push address of its own, from a service worker of its own, so a relay is never given another space's address and it never ties two spaces together; the browser's settings then list one service worker for each such space. A check for a new release that was slow to answer no longer brings back the release just replaced. On Sailfish OS, another app on the phone can no longer make Erevos hold on to memory, nor give orders to the helper that waits at the relay while Erevos is out of sight. See [On an iPhone](#iphone)."),
    ],
  },
  {
    version: '6.0.0-rc.2',
    forYou: [],
    underTheHood: [
      mark("**Home's buttons stay at the bottom**: after the password, home's **Remind me** and **New chat** could float halfway up the screen, over the chats, with the list ending above them, until Erevos went away and came back. Now the screen asks Android at once whether a keyboard is open. See [Password lock](#lock)."),
      mark("**The Nostr tab's posts come**: **Posts** could stay on **Looking…** for good through Tor. Each wait through Tor took one of the threads the whole app shares, and once all were taken, every look-up of the posts waited behind the others; a relay that answered and then could not be reached kept them waiting with no end. Now Tor's waits have threads of their own, a relay that cannot be reached is let be after 20 seconds, and the posts come within about two minutes at most, with what was found by then. See [Chats with other Nostr apps](#nostr-chats)."),
      mark("**Linux, Windows and macOS again**: 6.0.0-rc.1 came out without them: the check that each build for computers opens did not know the setup of Erevos's very first start. Now it does."),
    ],
  },
  {
    version: '6.0.0-rc.1',
    forYou: [
      mark("**Links open on Sailfish OS**: **Sign in with LPHL**, a donation page or a link in a chat opened nothing there. Now Sailfish OS opens them: a web page in the browser, a number in the phone or the messages, an address in the mail."),
      mark("**Matrix, and photos and files in XMPP and Nostr chats, on Sailfish OS**: Erevos there could not reach their servers over HTTPS, so Matrix could not sign in, photos and files neither came nor went, and links showed no preview. Now they work as on a computer."),
      mark("**A phone call shows its screen**: with Erevos as the phone app, a call that came could ring with the phone's screen black, so it could not be answered, when Android's full-screen notifications for Erevos, Erevos's notices or its notices of incoming calls were off. Now the call screen comes up by itself, over the lock screen too, and turns the screen on. A call that Do Not Disturb holds back still comes quietly, with the screen off. See [Phone](#phone)."),
      mark("**The calculator shows a long result from its start**: upright, a result with many decimals hid its first digits, which showed only with the phone turned sideways. Now a long number gets smaller to fit, its first digits always in sight."),
      mark("**Pick the recipient of a new SMS from your contacts**: **New SMS** has a **Contacts** button that opens your contacts with a search, and typing a name or number suggests the contacts that match. A contact with several numbers shows a line for each, and for a group MMS each one you pick is added. With only the SMS open, only the phone's contacts show. See [SMS](#sms)."),
      mark("**More for a number in the Phone**: on the keypad, **⋯** beside a typed number offers **Add to contacts**, **Add to an existing contact**, **Send an SMS** and **Copy the number**. **Recents** and **Favourites** offer **Copy the number** and **Open the contact**; **Favourites** also **Send an SMS**, and **Recents** adds an unknown number to an existing contact. With Erevos locked, the Phone still only calls. See [Phone](#phone)."),
      mark("**A short buzz on touch**: the keys of the keypad, **Call**, **End**, Send, the keyboard's Enter, switches and menus that open give a short buzz. **Settings** → **Appearance** → **Vibrate on touch** turns it off. See [Appearance](#appearance)."),
      mark("**Choose the parts of Erevos you use**: Erevos's own chats, the Phone, the SMS, and the chats with Nostr, Matrix and XMPP apps are modules now, any of them on, Erevos's own too, at least one. One that is off does not start and shows nowhere, and the Phone's and the SMS's icons leave the phone's apps: Erevos is lighter, opens faster and uses less battery. Nothing of it is deleted: it is all there again when it is back on. Erevos's very first start sets it up as an installer does, its language, the modules and what Android should allow for them; a module turned on later asks for its permissions again. After this update every module stays on until you change them in **Settings** → **General** → **Modules**. See [Modules](#modules)."),
      mark("**A number on each icon, on Huawei and Honor**: their launchers now show a number on each of Erevos's icons apart, with **Number on the icon** on: on Erevos's own the messages, on SMS's the SMS not read, on Phone's the missed calls, on Contacts's a birthday today. Most other launchers, such as those of Pixel and GrapheneOS, Samsung's and Kvaesitso, give a notice's dot or number to all of an app's icons alike, and Erevos cannot change that there. See [Appearance](#appearance)."),
      mark("**Public posts in the Nostr tab**: on the home screen, the Nostr tab shows first **Posts**, the public posts of the people your Nostr key follows and what they shared again, newest first, as in Amethyst or a Telegram channel, with **Chats** one tap away. Older ones come as you scroll to the end, the newest when you pull the list down; tap who wrote a post for their posts or to write to them. Read only, looked up through Tor as the space says and not kept, and no pictures or links are opened. See [Chats with other Nostr apps](#nostr-chats)."),
      mark("**Backups keep what closed chats need**: a backup now also holds what lets hidden chats ring a call and say a message came while they are closed, and a closed space say one came. So after a restore, on another phone too, **Ring calls when closed**, **Say when a message comes** and **Also while another space is open** go on as they were. See [Backups](#backup)."),
      mark("**Open another space from the search**: type another space's password in **Search chats** on the home screen and press Enter: the open space closes, nothing of it stays, and the other opens, as with **Lock now** and its password. It takes as long whatever is typed, and a wrong password, or the open space's own, is just a search. See [Second password](#second)."),
      mark("**A dot for unread messages elsewhere, if you want it**: hidden chats with **Receive while closed** can show a small dot on the magnifier of **Search chats** while they have a message unread (their switch **Dot for unread messages**), and a space set to say a message came while another is open can show one on the padlock at the top of the other spaces' chats (**Dot in the other spaces**). Never how many, nor where; off unless you turn it on. See [Hidden chats](#hidden)."),
      mark("**Joining takes only the invite**: on a phone with no relay yet, **New chat** shows one way in, **I have an invite**. Signing in with LPHL, **Start without a relay** and the relay's settings are under **For advanced users**, for whoever looks for them. And an invite to your relay gives the relay only a name of random letters and digits for the phone it lets in: the name you type stays on your phone, where your list of invites shows it. See [Chat through a relay](#relay)."),
      mark("**Invited phones stay**: on a relay of this version, a phone you invited keeps its access even once yours goes, and so do the phones it invited; taking back an invite cuts off that one phone alone. See [Chat through a relay](#relay)."),
      mark("**Hidden chats on your linked devices**: each place of hidden chats now links on its own, from inside it, to the same place on a computer or in a browser, with **Linked devices** under its list. Its chats, messages, groups, calls, Chat with myself and its own Matrix, XMPP and Nostr accounts go there, and its contacts write to it there directly. Nothing of it shows in the space or on the space's linked devices. The link runs while the place is open, and while it is closed too with **Receive while closed** on. See [Linked devices](#devices)."),
      mark("**Move a chat to another space**: in a chat's **Details**, **Move to another space** takes it, with its messages, name, picture, look and imported chats, into the space whose password you type, as a move into hidden chats does: the safety number stays the same, and their phone is told at once to write there. That space stays closed, and the row shows in every space. A chat never takes the place of one that space, or hidden chats, already have with the same person. See [Second password](#second)."),
      mark("**Backups bring the phone back as it was**: a backup now holds the photos, files and voice messages too, in files of their own beside it, each sealed and bound to its backup; and the panic password, the settings that go with you, the Phone's quick replies and the calls it turns away, the SMS for later and automatic backups with their server, but not their folder. An SMS for later whose time passed before the restore waits for you to send it or delete it. What stays with each phone, as the fingerprint, the folders and what Android allows, never comes back: after a restore, Android's permissions open for the modules that are on. See [Backups](#backup)."),
      mark("**A newer backup asks for a newer Erevos**: a backup made by a newer Erevos than yours is refused, with nothing changed, and Erevos asks you to update to the latest version first. An Erevos from before 6.0.0 does not open backups from 6.0.0 on: update it, then restore. See [Backups](#backup)."),
    ],
    underTheHood: [],
  },
  {
    version: '4.0.0-rc.10',
    forYou: [],
    underTheHood: [
      mark("**Erevos no longer stops when only the SMS or the Contacts are open**: from them, a contact's chat, an SMS, another icon or a screen that asks for the password again could make Erevos say it could not open (Maximum call stack size exceeded). Now the password opens all of Erevos, then that screen. And when Erevos cannot open, **Try again** starts it again. See [Password lock](#lock)."),
      mark("**Each icon opens what it names**: after Erevos was opened by the SMS icon, or from the recent apps, another icon, the widget or a notice could sometimes show the SMS instead. Now each opens what it names. With only the SMS or the Contacts open, another icon asks for the password as when Erevos is locked, then opens its own part: the Contacts icon only the contacts, Erevos's own icon all of it. And Back on Erevos's first screen now puts it behind, as Home does, whatever opened it. See [Password lock](#lock)."),
    ],
  },
  {
    version: '4.0.0-rc.9',
    forYou: [
      mark("**Only the Contacts**: with Erevos locked, the Contacts icon, the widget's Contacts button and the notice of a birthday ask for the password, then open only the contacts. A chat, an SMS, Settings, and the orange padlock **Unlock everything**, ask for it again, then open all of Erevos. See [Password lock](#lock)."),
      mark('**Old private messages in Nostr chats**: Erevos also reads private messages sent the older way (NIP-04), which Damus, Primal and many apps still send and keep, past and new, in the same chats. The relays see who wrote such a message to whom; Erevos itself still sends only the NIP-17 way. See [Chats with other Nostr apps](#nostr-chats).'),
      mark("**Public posts in Nostr chats**: in a chat with one person, **Public posts** shows what they post for everyone, newest first, read only. It is looked up through Tor as the space says and not kept, and no pictures or links are opened. See [Chats with other Nostr apps](#nostr-chats)."),
    ],
    underTheHood: [],
  },
  {
    version: '4.0.0-rc.8',
    forYou: [
      mark('**Only the SMS**: with Erevos locked, the SMS icon, the widget\'s SMS button and the notice of a new SMS ask for the password, then open only the SMS. Anything else, and the orange padlock **Unlock everything**, asks for it again, then opens all of Erevos. See [Password lock](#lock).'),
    ],
    underTheHood: [
      mark("**Nostr chats with a key brought from another app get their messages again**: Erevos reads where that app said your messages arrive, as that app does, instead of its own three relays, fetches the messages kept there and in older lists of the key, and reads a relay again when it stops sending. Before, such a key could show its chats with no past messages and get no new ones. See [Chats with other Nostr apps](#nostr-chats)."),
    ],
  },
  {
    version: '4.0.0-rc.7',
    forYou: [
      mark("**Licence**: Settings → General → Licence says under which licence Erevos is free software, AGPL-3.0-or-later, its three additional terms, that it comes with no warranty, and who made it. See [Licence](#licence)."),
      mark("**Contact**: Settings → General → Contact adds the maker of Erevos as a contact, to write to in Erevos itself, end-to-end encrypted, with no phone number and no email. See [What Erevos is](#about)."),
      mark("**A new sticker set, Angry Eyes**: 24 faces of big yellow eyes on a black disc, drawn by the maintainer, each with the moves he gave it."),
    ],
    underTheHood: [
      mark("**The calculator opens again**: in 4.0.0-rc.6 it closed as soon as it was tapped."),
      mark("**People you follow on Nostr are looked for on more relays**: **Show the people you follow** also asks relays that gather follow lists and more of the relays your key writes on, and waits longer for them; when it finds no one, it says why and how each relay answered. See [Chats with other Nostr apps](#nostr-chats)."),
    ],
  },
  {
    version: '4.0.0-rc.6',
    forYou: [
      mark("**Panic password**: with the password lock on, **Set the panic password** under the Panic button sets a password of its own that, typed on the lock screen, wipes Erevos as **Wipe everything now** does, while the screen shows **Wrong password**. Nothing shows whether one is set. See [Panic button](#panic)."),
      mark("**Calculator in place of Erevos**: on Android, under Launcher icons, a calculator that works can take the place of Erevos's icon; your code, then **=**, opens Erevos, which asks for its password as always. See [Appearance](#appearance)."),
      mark("**Chat with myself on your linked devices too**: notes, photos, files, voice messages and reminders written on one device go to the others, as do a reminder changed or seen and a note deleted. Those from before go once, both ways. See [Linked devices](#devices)."),
      mark("**Start when the phone turns on**: on Android, under In the background, Erevos can start by itself after the phone turns on, so the spaces set to say a message came while closed already say \"New message\", never which space or what. Off unless you choose it. See [Chat through a relay](#relay)."),
    ],
    underTheHood: [
      mark("**Moving the clock no longer ends the wait after wrong passwords**: it goes by the phone's own time since it started, which no one can set; after a restart it starts again from its beginning. See [Password lock](#lock)."),
      mark("**People you follow on Nostr, found where your other app keeps them**: with a key brought from another Nostr app, **Show the people you follow** also looks on the relays your key writes on, and says so when no relay answered. See [Chats with other Nostr apps](#nostr-chats)."),
      mark("**Your Nostr name keeps the rest of your profile**: saving **Your name** changes only the name in your profile; a picture or words that another app of your key put there stay. Before, they could be wiped. See [Chats with other Nostr apps](#nostr-chats)."),
      mark("**Screens come down when no keyboard is open, in every case**: the home screen's list and buttons, or a chat, could still stay up as if a keyboard were open after it had gone. Now Erevos asks Android itself whether a keyboard is shown, and with none they come down within a second."),
    ],
  },
  {
    version: '4.0.0-rc.5',
    forYou: [
      mark("**New chat opens hidden chats sooner**: hold **New chat** down for a moment, not a whole second, and the field for a PIN of hidden chats opens; on Android the phone buzzes once as it opens. See [Hidden chats](#hidden)."),
      mark("**People you follow on Nostr**: under New chat in Nostr chats, **Show the people you follow** lists the people your Nostr key follows, with their names; tap one to write to them. See [Chats with other Nostr apps](#nostr-chats)."),
    ],
    underTheHood: [
      mark("**Who makes Erevos, and its licence**: About Erevos now names its maker, and every file of Erevos's source code says whose it is and under which licence; the AGPL-3.0 licence has three added terms (keep the maker's name, mark a changed version, give it another name). See [What Erevos is](#about)."),
    ],
  },
  {
    version: '4.0.0-rc.4',
    forYou: [
      mark("**Numbers on the home chips**: each chip above the chats (All messages, SMS, Erevos, Matrix, XMPP, Nostr) shows how many messages are not read in it, as a small number after its name; muted chats and groups are not counted. See [Getting started](#start)."),
      mark("**Open a photo full screen in Matrix, XMPP and Nostr chats**: tap a photo shown in a Matrix, XMPP or Nostr chat to see it on the whole screen, with zoom, turning with the phone and Save, as in a chat with a contact. See [Matrix](#matrix), [XMPP](#xmpp) and [Chats with other Nostr apps](#nostr-chats)."),
      mark("**Who got and who read your messages in groups**: in a group that is not public, your messages show ✓, then ✓✓ once they reached the phone of every member, and ✓✓✓ once every one read them. Hold one and choose **Who read it** to see who read it and when, whose phone it reached and when, and who has neither yet. A member whose Erevos is older says nothing. A linked computer shows the same marks. See [Chat through a relay](#relay) and [Group chats](#groups)."),
      mark("**Who read your messages in Matrix**: your messages in a Matrix chat show ✓ once the Matrix server took them and ✓✓✓ once every other member read them, as their Matrix apps tell their servers; **Who read it**, on a message held down, lists who read it and when, and who has not. Matrix has no mark for a message that reached a phone, so there is no ✓✓. See [Matrix](#matrix)."),
    ],
    underTheHood: [
      mark("**Quiet group messages for the marks**: the group message that says a message came or was read goes only to the senders concerned, and batched; after 300 such messages to some members only, the next goes to all, so no member falls behind in the phone's MLS keys (they accept a jump of 1000 at most). Groups let go of as their space closes send nothing more. See [Group chats](#groups)."),
    ],
  },
  {
    version: '4.0.0-rc.3',
    forYou: [
      mark("**Delete me from everywhere**: Settings → Privacy and security → Delete me from everywhere deletes what the servers keep for the open space (its queues on the relays with the messages in them, what a relay holds for you to send later, files waiting there, invites nobody used), asks the Nostr relays through Tor to forget the keys your chats read on, and stops the space until you tap Start again. Your phone keeps everything. You can also sign out of Matrix and XMPP and delete the Nostr account made here. See [Delete me from everywhere](#forget)."),
      mark("**Bold, italic, code and hidden words**: in chats and groups, words typed between * become bold, between _ italic, between ~ struck through, between ` code, and between || hidden behind a grey bar until tapped. See [Chat through a relay](#relay)."),
      mark("**Hidden photo**: under + in a chat or a group, a photo that shows blurred until it is tapped. See [Chat through a relay](#relay)."),
      mark("**Safety message**: under + in a chat, words to a contact that the relay sends by itself if you do not open Erevos for 6 hours to a week; each time you open it, they move on again. See [Chat through a relay](#relay)."),
      mark("**Name a member in a group with @**: type @ and pick a member; they are told of the message even if they muted the group. See [Group chats](#groups)."),
      mark("**Reply, change, react and delete in XMPP chats**: hold a message in an XMPP chat or group to answer it, change your words, delete it for everyone or react with an emoji, as Conversations, Dino, Gajim, Monal and Kaidan do; and **typing…** shows while the other person writes. See [XMPP](#xmpp)."),
      mark("**See who is writing in a Matrix chat**: **typing…** shows under a Matrix chat while someone writes in it, as the Matrix server says. It shows of you too only if you turn on **Say when I am writing** on the Matrix or XMPP screen: off at first, as it goes through the server not encrypted. See [Matrix](#matrix)."),
      mark("**Block someone on XMPP**: Block, at the bottom of an XMPP chat, keeps that person's messages, calls and requests from every app of your XMPP account; Unblock lets them through again. See [XMPP](#xmpp)."),
      mark("**Voice messages in XMPP chats**: hold the microphone under an XMPP chat's message box to record, and let go to send; it goes encrypted as the chat is, as Conversations sends one. See [XMPP](#xmpp)."),
      mark("**Matrix groups from Erevos**: New group, on the Matrix screen, makes an encrypted group with a name and the people you invite; Join a group joins one by its address; Invite, in a group, asks someone else in; typing @ in a group names a member, who is told of it. See [Matrix](#matrix)."),
      mark("**Profile pictures on Matrix and XMPP**: contacts and Matrix rooms show their picture in the chat list, and you can set your own on the Matrix and XMPP screens (Choose a photo). Pictures are not encrypted on either network: the server sees them. See [Matrix](#matrix) and [XMPP](#xmpp)."),
      mark("**Run an XMPP group**: a group's admins can set its subject and take people out or bar them, its owner can rename it and make admins, and in a channel the admin sees who is in it and can put them out. See [XMPP](#xmpp)."),
      mark("**Check a Matrix device by QR code**: once both sides accept a check, Erevos shows a code for Element (or another Erevos) to photograph, or photographs theirs, as Element does; comparing emoji stays one tap away. See [Matrix](#matrix)."),
      mark("**Sign in to Matrix with single sign-on** (Android): when your Matrix server signs people in on its own page, as matrix.org does, Sign in with single sign-on opens it in the browser and comes back to Erevos. See [Matrix](#matrix)."),
      mark("**A closed space tells of XMPP messages**: on Android, Say a message came under While this space is closed, on the XMPP screen, has a closed space say \"New message\" when something comes on XMPP while another space is open, never what, from whom or in which chat. Off until you choose it. It needs a relay updated for it and an XMPP server that sends notices to apps that are away; the XMPP server then learns the relay's name, and the relay when messages come. See [XMPP](#xmpp)."),
      mark("**The panic button on a computer and on Sailfish OS**: Settings → Privacy and security → Panic button now wipes Erevos there too, with its automatic backups if you choose; on a computer it then starts again as new. See [Panic button](#panic)."),
      mark("**Every chat opens at its latest message**: chats with contacts, groups and SMS, and the Matrix, XMPP and Nostr chats, all open at the last message with the message bar under it, and have round arrows to the start, to where you left off (the first message that was new when you opened it) and to the end. See [Getting started](#start)."),
      mark("**Matrix: threads, polls, places and link previews**: hold a message and choose **Reply in thread**; **Poll** and **Location** sit under the message box; and the first link in a message goes with a preview when link previews are on, never through Tor. See [Matrix](#matrix)."),
      mark("**Matrix: pins, forwarding, favourites and finding**: **Pin** a message to the top of a room, **Forward** it to another chat, hold a chat for **Make a favourite**, **Low priority** or **Leave and forget**, **Find a group** among public rooms and spaces, and **Search messages** kept on this phone. See [Matrix](#matrix)."),
      mark("**Matrix: make an account and look after devices**: **Make a new account** on a Matrix server that allows it, and **Devices** to see them, rename one, or sign the others out. See [Matrix](#matrix)."),
      mark("**Older Matrix calls**: one-to-one calls as FluffyChat, Nheko and Element on a computer make them now ring here, and in a chat with one person the call tiles offer **Element Call** or **Older call**. See [Matrix](#matrix)."),
      mark("**Linking a computer is clearer**: on a computer, Settings → Data and devices → Linked devices now starts with Link to my phone, with LPHL's relay filled in and Sign in with LPHL under the token, so no token has to be copied from the phone; and it says that the QR code shows once Link to my phone is tapped. See [Linked devices](#devices)."),
      mark("**Matrix, XMPP and Nostr on a linked computer**: linking a computer can bring this space's Matrix and XMPP accounts and the key of its Nostr chats over too, each signed in there as a new device of its own; for a computer linked already, tap Send the accounts under it on the phone. A Matrix server seldom lets the phone sign the computer in: the computer then asks for the Matrix password once, and the account's keys come from the phone, so no Security Key or check by emoji is needed. See [Linked devices](#devices)."),
      mark("**XMPP: make an account, change the password, delete it, find groups**: **Make a new account** on an XMPP server that allows it, **Account** to change the password or delete the account for good, **Find a group** on your server or among public groups, **Location** as Conversations sends it, and link previews in chats written without encryption. See [XMPP](#xmpp)."),
    ],
    underTheHood: [
      mark("**Every relay queue on one list**: the queues a space keeps on the relays are gathered in one place, and the checks fail if a new kind of queue is made without being added there, so Delete me from everywhere cannot leave one behind."),
      mark("**The panic button says when it refused**: when your panic app asked to wipe Erevos while the switch was off, or signed with another key, the panic screen now says so, with the time. An app that moves to a new key the way Android allows stays trusted; otherwise you can trust it again as it is now. See [Panic button](#panic)."),
      mark("**The home screen's chips stay on one line**: with a Nostr, Matrix or XMPP chip as well, **Names** went to a line of its own and the chips moved. Now they stay on one line that slides to the side, and the chosen one is always in sight."),
      mark("**Screens come down when the keyboard is gone**: back from another app that had its keyboard open, the home screen's buttons (or a chat's field) could stay up where the keyboard had been, until a keyboard opened again. Now they come down within a second."),
    ],
  },
  {
    version: '4.0.0-rc.2',
    forYou: [
      mark("**See what you type in a password or a PIN**: every field for a password, a PIN or a token has an eye at its end: tap it to see what you type, and again to hide it. It is hidden again the next time. See [Password lock](#lock)."),
      mark("**Link for a website**: under New chat → Your contact link, a link to put on a web page, such as your contact page. It opens a page that offers Erevos to whoever has none yet, then adds you; what they send comes as a message request. See [Chat through a relay](#relay)."),
    ],
    underTheHood: [
      mark("**A chat read as it opens stays read**: messages read while their chat was still opening, as Erevos ended a look at the relay, showed as unread on the home screen once you went back. Now they are marked read as soon as they show."),
      mark("**An update's download that stalls is tried again**: when the connection brings nothing for a while, Erevos starts the download again by itself, three times in all, and then says so in its own words. See [Updates](#updates)."),
    ],
  },
  {
    version: '4.0.0-rc.1',
    forYou: [
      mark("**Backups to your server from a computer and the web app too**: in the desktop app, automatic backups go to your WebDAV server as on Android; in the web app, Send a backup now sends one there, with a server that lets the web app in. Both can restore from it. Not through Tor. See [Backups](#backup)."),
      mark("**Restore a backup straight from your server**: Restore from a server, under Backups, lists the backups on your server, newest first, and opens the one you choose with its password, with no download by hand, on a new phone too. See [Backups](#backup)."),
      mark("**Backups to your server through Tor**: on Android, automatic backups sent to your own server now follow the space's choice under Settings → Relay and networks → Tor, as Matrix does, so with Tor the server no longer sees where you are. To a server too says when they go through Tor. See [Backups](#backup)."),
      mark("**Media, links and files in groups too**: in a group's details, a list of its photos, videos, voice messages, music, files and links, each kind apart under its months, with a calendar, as in a contact's chat. A tap opens or plays; held, each goes to its message. See [Group chats](#groups)."),
      mark("**Every message says which way it went**: hold a message and its menu says whether it went or came through the relay, through Nostr, to a phone nearby or over LoRa. Messages from before say nothing. See [Through Nostr](#nostr)."),
      mark("**More battery saved in the background, if you choose**: under Settings → Notifications → In the background, Only the waste stays the default; And nearby phones also turns off the radios for phones nearby while Erevos is in the background; And sleep also lets the phone sleep, so Erevos looks at your relay about once a minute and a message or a call can be a minute or two late. Android only. See [Chat through a relay](#relay)."),
      mark("**Photos, files and voice messages with no relay**: when there is no relay between you and your contact and they read on Nostr, a voice message goes through Nostr like a text, a photo up to 3 MB in pieces, and a larger photo, a video or another file, up to 20 MB, to an encrypted file server (Blossom), all through Tor. See [Through Nostr](#nostr)."),
      mark("**A new sticker set, Takis**: a caricature in a dark suit and a purple tie with dots, in 24 moods that move."),
      mark("**Erevos's icon keeps the number of messages not read, on Android**: leaving Erevos with messages not read, a notice without sound keeps how many until you read them, and the launcher shows it on the icon, as a number or a dot. Settings → Notifications → Number on the icon turns it off. See [Chat through a relay](#relay)."),
      mark('**Notifications for each chat**: on Android, mute a chat or a group for 8 hours, a week or always, and give its messages and its calls a sound of their own, or none. See [Chat through a relay](#relay).'),
      mark('**What\'s new in two parts**: each version says first what changes for you, then what changed under the hood: fixes, speed, battery and security inside. See [Updates](#updates).'),
      mark('**Location finds where you are, indoors too**: the phone looks by satellite and by its network at once, a sheet says it is looking, and when nothing is found it says why, with Try again. See [Chat through a relay](#relay).'),
      mark('**The user guide is in every language of the app**: it shows in the one you chose, and names the buttons as the app shows them. See [Language](#start).'),
      mark('**The web app\'s icon counts what is not read**: on an iPhone, with notifications on for the space, Erevos\'s icon on the home screen shows how many messages are not read, never a hidden chat\'s, unless turned off under Settings → Notifications → Number on the icon. See [On an iPhone](#iphone).'),
      mark("**The web app's notifications, more dependable**: no New message over Erevos while it is open, and a push held back while the phone was offline no longer counts messages you already read (both with your relay updated), every notice sounds in Chrome, Firefox and Edge, they come back by themselves when the browser changes its push address, and Notifications while closed says when the browser blocks them or your relay was not told yet that they are off. See [On an iPhone](#iphone)."),
      mark("**Calls ring in the web app, on the computer and on Sailfish OS**: a call that comes while Erevos is open now rings, where only its screen showed, and vibrates where the phone can. On an iPhone it rings once you have touched Erevos, and not on silent. See [On an iPhone](#iphone)."),
      mark('**Erevos on a computer keeps running with its window closed**: in the system tray (on a Mac, in the Dock) it goes on receiving, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Turn it off under Settings → Notifications → In the background. See [On a computer](#desktop).'),
      mark("**Erevos on Sailfish OS tells of messages and calls while it is closed**: while it is out of sight or closed, a small helper waits at the relay for the open space, a notification says how many messages came, never who or what, and a call rings with the phone's ringtone. See [On Sailfish OS](#sailfish)."),
      mark("**Permissions checks every notice Erevos uses**: on Android, the message notice without sound or with a chat's own sound, and the reminders', turned off, now show there, with a button to each. See [Chat through a relay](#relay)."),
      mark('**Hidden chats say what their switches need**: Say when a message comes and Ring calls when closed say so when Settings → Notifications → In the background lets them do nothing. See [Hidden chats](#hidden).'),
      mark("**Truer words about notices**: Settings and the guide give the notices' own words and say what each one needs. See [Chat through a relay](#relay)."),
      mark("**Photos open on the whole screen**: tap one to see it edge to edge, zoom in with two fingers or a double tap, and tap again to hide or show what is around it; big photos open as small ones do. Erevos also turns with the phone while the phone's Auto-rotate is on, and a photo shown on its own even when it is off. See [Chat through a relay](#relay)."),
      mark("**Matrix accounts in Erevos**: sign a space in to Matrix and chat with people who use Element or another Matrix app, end-to-end encrypted, under Settings → Relay and networks → Matrix. These chats are not anonymous, and say so: the Matrix server sees who talks with whom. Text, photos and files. See [Matrix](#matrix)."),
      mark("**Every network's chats on the home screen**: once you sign in to Matrix, its chats are in the list with the Erevos chats and the SMS, newest first, each marked Matrix, and the Matrix chip shows them alone, as SMS and Erevos do. See [Matrix](#matrix)."),
      mark("**Check Matrix devices by emoji**: in a chat with one person on Matrix, Check by emoji shows you both seven pictures; if they match, nobody sits in between, and Element sees the check too. Check this device with another of yours makes your own Element trust Erevos. See [Matrix](#matrix)."),
      mark("**Automatic backups to your own server too**: on Android, each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. Off until you add one. The server gets random bytes under a random name and cannot open them; it still sees your account, your address and when. See [Backups](#backup)."),
      mark("**Matrix Security Key and key backup**: enter the Security Key Element made, under Settings → Relay and networks → Matrix, and earlier messages open, new keys are backed up, and your other devices trust Erevos. An account with none can set one up there. See [Matrix](#matrix)."),
      mark("**Matrix through Tor**: on Android, a space's Matrix account follows its choice under Settings → Relay and networks → Tor, so the Matrix server no longer sees where you are; the Matrix screen says when it goes through Tor. See [Matrix](#matrix)."),
      mark("**XMPP accounts in Erevos**: sign a space in to XMPP, under Settings → Relay and networks → XMPP, and chat with people who use Conversations, Monal, Gajim, Dino or another XMPP app, encrypted with OMEMO. These chats are not anonymous, and say so: the XMPP server sees who talks with whom. Text with delivery and read marks, photos and files, in the home list under an XMPP chip of its own, and through Tor on Android as you chose. See [XMPP](#xmpp)."),
      mark("**Voice and video calls with people on XMPP**: the two tiles at the top of an XMPP chat call the person, and their calls ring on the same screen as Erevos's own, with apps that call as Conversations does. The call goes through your call relay or the XMPP server's, so they do not learn your address; the key that proves it passes through the XMPP servers, which could put themselves in between. See [XMPP](#xmpp)."),
      mark("**Voice and video calls with people on Matrix**: on Android, the two tiles at the top of a Matrix chat call with Element Call, the call app of Element and Element X, which opens inside Erevos in a window of its own, and their calls ring here as Erevos's own do. Sound and picture are end-to-end encrypted and go through the media server your Matrix server names, never through Tor. See [Matrix](#matrix)."),
      mark("**Voice and video calls with people on Matrix, in the web app and on a computer**: the two tiles at the top of a Matrix chat call with Element Call there too, as on Android, over the app; its back arrow makes it small in a corner, so you can keep using Erevos during the call. Element Call runs apart from Erevos and can read nothing of it. See [Matrix](#matrix)."),
      mark("**Chats with people on other Nostr apps**: give a space a Nostr key of its own, under Settings → Relay and networks → Nostr chats, and chat with people who use Damus, Amethyst, Primal, 0xchat or another Nostr app, one to one or in groups, encrypted as NIP-17 asks: the relays see whom a message is for, not who wrote it. These chats are not anonymous, and say so: your key is the same to everyone you write to. Text, photos, files and reactions, in the home list under a Nostr chip of its own, and through Tor on Android as you chose. See [Chats with other Nostr apps](#nostr-chats)."),
      mark("**Notices for Matrix, XMPP and Nostr messages**: a message in a chat on Matrix, XMPP or Nostr shows a notice and counts in the number on Erevos's icon, as in Erevos's own chats. On Android, Notifications at the bottom of such a chat mutes it or gives it a sound of its own, and an XMPP or Matrix call rings with its chat's ringtone. See [Matrix](#matrix), [XMPP](#xmpp) and [Chats with other Nostr apps](#nostr-chats)."),
      mark("**A closed space tells of Matrix messages**: on Android, Say a message came under While this space is closed, on the Matrix screen, has a closed space say \"New message\" when something comes on Matrix while another space is open, never what, from whom or in which chat. Off until you choose it. The Matrix server then tells the space's relay of each message, with no words in it: it learns the relay's address, and the relay when messages come. See [Matrix](#matrix)."),
      mark("**Made with others' open source**: About Erevos, and the guide, now name the open-source projects Erevos is built on, with their makers and their licences. See [What Erevos is](#about)."),
      mark("**Groups on XMPP**: under Settings → Relay and networks → XMPP, make a private group with your contacts, encrypted with OMEMO for every member as Conversations' private groups are, or join a group by its address, and answer invitations to groups. A group that is not private, a channel, is not encrypted, and says so. Your groups follow your account's other XMPP apps, and a channel tells only of messages that name you. See [XMPP](#xmpp)."),
      mark("**More in Matrix chats**: hold a message to react to it, reply to it, copy it and, if it is yours, edit it or delete it for everyone. Load earlier messages brings in older ones, and the microphone under the message box sends voice messages that Element plays too. Reactions are not encrypted, as Element sends them. See [Matrix](#matrix)."),
      mark("**Video added to an XMPP call**: in a voice call with someone on XMPP, either of you can turn on video with Add video; the other is asked first and can say Not now. It works with apps that add video to a call as Conversations does. See [XMPP](#xmpp)."),
      mark("**Voice messages and replies in Nostr chats**: hold the microphone under the message box to send a voice message, which plays with Play; hold a message to reply to it, and the answer shows the message it is to, here and in other Nostr apps. See [Chats with other Nostr apps](#nostr-chats)."),
      mark("**OMEMO 2 in XMPP chats**: a message to someone whose app speaks OMEMO 2, as Kaidan does, now goes with OMEMO 2 to that app and with OMEMO 0.3 to their others, as before. The XMPP screen shows this device's key both ways, to compare with what each app shows. See [XMPP](#xmpp)."),
      mark("**Hidden chats can have their own Matrix, XMPP and Nostr accounts**: under the list of a place of hidden chats, Matrix, XMPP and Nostr open an account of that place alone, apart from the space's, kept encrypted with the hidden chats' key. Its chats show among the hidden chats only. It connects while they are open, and while they are closed too if Receive while closed is on, as the hidden chats do: then a message says only \"New message\", and a call rings with no name and is answered with the PIN. See [Hidden chats](#hidden)."),
      mark("**Matrix, XMPP and Nostr in backups**: a backup now holds the Matrix, XMPP and Nostr accounts of every space and of its hidden chats. After a restore, a Nostr key comes back with its chats as they were; an XMPP account goes on as a new device of the account, with its contacts and chats; a Matrix account is let go of on this phone, and the space signs in again as a new device; its Security Key opens the messages from before. See [Backups](#backup)."),
      mark("**Matrix voice messages show their waveform, and Nostr answers can be photos**: a voice message sent in a Matrix chat carries its waveform, which Element draws, and one that comes with a waveform shows it under Play; in a Nostr chat, a photo, file or voice message sent while a message shows over the message box answers it. See [Matrix](#matrix) and [Chats with other Nostr apps](#nostr-chats)."),
      mark("**Group calls in XMPP groups**: in a private XMPP group, start a voice or video call, answer one that rings, or join one going on, together with people who use Dino. See [XMPP](#xmpp)."),
      mark("**Spam SMS come quietly**: on Android, an SMS that the spam filter's own words catch, a link with words that try to fool from a number that is no contact and that you never answered, still goes to Spam but no longer shows a notice or makes a sound. Spam by your own words and rules still shows one, as they stay encrypted in the space; with the Spam filter off, every SMS does. See [SMS](#sms)."),
      mark("**Check a contact in person with QR codes**: under Safety number in a chat's details, each phone shows a code; take a photo of the code on the other phone, and they of yours. When it matches, the contact is marked Checked in person. Nothing is sent. See [Chat through a relay](#relay)."),
      mark("**Up to three home relays**: under Settings → Relay and networks → Home relay, Add another home relay gives a space up to two more, each with a queue of its own. Your contact link and your messages name them in order, and contacts try each while the ones before cannot be reached. See [Home relay](#home-relay)."),
      mark("**Introduce two of your contacts**: in a contact's chat details, Introduce to a contact asks them and another contact of yours, each in your chat with them. Only if both say yes do they become contacts, and neither learns whether the other said no. See [Chat through a relay](#relay)."),
      mark("**Encrypted SMS when nothing else works, if you choose**: on Android, when the relay, Nostr, the phones nearby and LoRa all fail, a text to an Erevos contact whose number is linked can go by SMS, end-to-end encrypted, hidden from their SMS app. Off until you turn it on, for all such contacts under Settings → Phone and SMS → SMS, or for one in a chat's Details. It costs SMS (3 for a short text, up to 10 for a longer one), and the phone company sees who wrote to whom, and when. Both phones need Erevos as the SMS app. See [SMS](#sms)."),
      mark("**Your backup password in pieces with friends**: under Settings → Data and devices → Backup pieces, give pieces of it to 3 to 5 contacts; any 2 or 3 of them give it back, one alone shows nothing. Each goes inside the encryption of your chat with them and only their Erevos keeps it; your phone keeps none. See [Backup pieces with friends](#backup-pieces)."),
      mark("**Panic button**: under Settings → Privacy and security → Panic button, wipe everything Erevos keeps here with one tap, on Android and in the web app. On Android, a panic app such as Ripple can do it too, but only the one you say yes to, checked by its signature. See [Panic button](#panic)."),
      mark("**Answer a hidden call with Answer**: on the \"Incoming call\" screen with no name that a call to your hidden chats brings, **Answer** now asks for the PIN, as the small sign does, and the right PIN answers the call; before, it could not connect, and only the small sign could. See [Hidden chats](#hidden)."),
      mark("**Erevos to a phone nearby, with no internet**: under Settings → General → Give Erevos to a phone nearby, this phone serves its Erevos over the same Wi-Fi or its hotspot for ten minutes, with a QR code. A phone without Erevos downloads it in the browser; one with an older Erevos takes it under Updates → From a phone nearby, which installs it only when it is Erevos, signed as that one is. See [Erevos to a phone nearby](#give-app)."),
      mark("**Hidden chats with phones nearby**: while hidden chats are open, or receive while closed, they reach a contact's phone nearby over Bluetooth, Wi-Fi Aware, Wi-Fi Direct or the same Wi-Fi, with no internet, as your other chats do. The space never learns that a hidden contact is near, and nothing on the air tells their messages from the space's; other phones never carry them, and they never go over LoRa or by SMS. See [Hidden chats](#hidden)."),
      mark("**The same Wi-Fi on Sailfish OS**: Erevos on Sailfish OS finds Erevos phones and computers on the same Wi-Fi or a phone's hotspot and talks with them with no internet, as on a computer. See [On Sailfish OS](#sailfish)."),
    ],
    underTheHood: [
      mark("**Pieces of photos through Nostr stay with their chats**: while a photo that comes through Nostr waits for the rest of its pieces, they are now kept encrypted with the space or the hidden chats they came for, no longer apart where they could be counted, so nothing outside a hidden chats' password says that a photo is on its way to them. Pieces kept before go to the first chats whose photo they are, or after four days. See [Through Nostr](#nostr)."),
      mark("**A relay restart no longer brings a false notice**: after your relay restarted, a hidden chat or a closed space said New message once more for messages it had told of already. Your relay needs an update for it. See [Hidden chats](#hidden)."),
      mark("**The spam filter reads words as they look**: a scam text that swaps a letter for a look-alike of another alphabet, or hides a mark that shows nothing inside a word, no longer gets past it. See [SMS](#sms)."),
      mark("**A contact you delete no longer comes back from an old ask**: in a group, a member you asked for their contact link, or who asked for yours, and whom you then deleted as a contact before Erevos looked at the relay again, could be added again by that old ask. Deleting them now lets go of it at once. See [Group chats](#groups)."),
      mark("**A chat locked with its own PIN stays locked**: when its contact's Erevos started a new conversation, as it does about once a month, the chat lost its PIN, and a public group joined again lost its own. See [Hidden chats](#hidden)."),
      mark('**A contact\'s SMS no longer stay counted as new**: opening their chat reads all of them, the earlier ones too, not only those that show.'),
      mark('**A message no longer waits when Tor cannot reach the relay**: with Tor for messages, it goes straight at once, as the Tor settings say. See [Through Tor](#tor).'),
      mark('**Background notices no longer stop after a network change**: when the connection of a wait at the relay died on the way (Wi-Fi to mobile data, the relay restarting), Erevos took the relay for one from before, which cannot wait, for the whole run: contacts\' messages then came up to ten minutes late, and hidden chats, closed spaces and hidden rings said nothing until Erevos was restarted. See [Chat through a relay](#relay).'),
      mark('**A call hung up at once no longer rings**: when the hang-up came in the same look as the call, the phone rang 45 seconds for a call nobody was on; the same for a group call its starter left at once. See [Chat through a relay](#relay).'),
      mark('**A hidden call rings once**: a place with Receive while closed and a ring queue rang twice for one call, and a call taken while hidden chats were open rang again as they closed. See [Hidden chats](#hidden).'),
      mark('**A member\'s contact link no longer says New message**: the answer to an ask from a group only adds the contact, with no notice. See [Group chats](#groups).'),
      mark('**The birthday notice and the phone\'s incoming call no longer replace each other**: they had the same notice number. See [Contacts](#contacts).'),
      mark("**A closed space tells of its contacts' messages too**: since each contact writes to a queue of their own, a space that says a message came while another is open told only of group messages and first messages from new contacts. It now asks about its contacts' queues too, up to 64. See [Chat through a relay](#relay)."),
      mark("**The relay's pushes to the web app, sturdier**: a push the push service could not take just then is sent again, a call goes before the messages waiting their turn, and whoever runs the relay can allow another push service. Your relay needs an update for it."),
      mark("**Calls ring as they should**: with Do Not Disturb only when their notice may break through, with a phone's clock off too once the relay is updated, and to the end on Android 7 and 8; a second call is told busy, and a ring stops only for its own call. See [Chat through a relay](#relay)."),
      mark('**Hidden calls**: one turned down no longer leaves Erevos over the lock screen, one that comes while the password screen shows comes over it, and none rings twice. See [Hidden chats](#hidden).'),
      mark('**Notices come again at once after a change of network**, and receiving starts again as Erevos shows when Android refused it. See [Chat through a relay](#relay).'),
      mark("**Hidden chats' notices tell each message once**: what came since a place last looked is told as it closes, a call that rang is not told again as a message, and a place whose queue the relay lost keeps its switch on. See [Hidden chats](#hidden)."),
      mark('**Hidden chats close while Erevos is away**, after 30 seconds, so a call to them meanwhile rings with their PIN to answer. See [Hidden chats](#hidden).'),
      mark('**A voice message counts once**, on its last part, also when it goes again whole.'),
      mark('**The number on the icon counts only what is still there**: a message deleted for everyone, or read on a linked computer, no longer counts. See [Chat through a relay](#relay).'),
      mark('**Messages sent for later** tell of themselves only while their space is open, without sound if sent so.'),
      mark('**SMS**: one to the chat on screen only sounds there, they are marked read only while their screen shows, and Android names their notices SMS. See [SMS](#sms).'),
      mark("**Reminders**: one seen in Chat with myself goes from the notice, a hidden place's go with a new PIN, and birthdays come at 9:00. See [Getting started](#start)."),
      mark('**Nostr reads as soon as Tor is ready.** See [Through Nostr](#nostr).'),
      mark("**Erevos's notices show its mark** in the status bar."),
      mark('**Notices are asked for with receiving off too**, when Say a message came is on.'),
      mark('**Test versions before a release**: Erevos reads a version such as 4.0.0-rc.1, a test version that comes before 4.0.0, when it looks for updates, tells of a new version and shows what is new. See [Updates](#updates).'),
      mark('**A call to a slow phone rings in full**: the caller now waits up to a minute and a quarter for the other phone to say it rings, and then 45 seconds from then, so a call that reached it late no longer rings there only to stop at once; and the phone called reads a call before anything it has to send, and waits for calls again at once after its network changes. See [Chat through a relay](#relay).'),
      mark("**The web app and the computer reach Matrix, XMPP and Nostr servers over HTTPS**: their page policy allowed only WebSocket connections, so Matrix sign-in, XMPP server discovery and file sharing, and Nostr files and name lookups failed there. They work now. See [Matrix](#matrix), [XMPP](#xmpp) and [Chats with other Nostr apps](#nostr-chats)."),
      mark("**Bluetooth that cannot be followed**: the random number your phone sends out over Bluetooth for phones nearby to find it changed only when Erevos started again; it now changes every nine to twelve minutes, so someone listening cannot follow your phone from place to place by it. Older Erevos phones still find yours. See [Chat with a nearby phone](#nearby)."),
      mark("**Downloads stop at 100 MB**: a file, a backup from a server or any other download is read as it comes and stopped as soon as it passes 100 MB, or less where the network's files are smaller, such as 20 MB for Nostr files, so a file server a contact names can no longer fill the phone's memory with an answer without end. A backup on a server comes back up to 100 MB; download a larger one and open it with Restore a backup. See [Backups](#backup)."),
      mark("**Hidden chats show at once**: as the PIN opens them, their chats and contacts show at once, to read, while what they were receiving in the background ends; before, that could hold them back a long while, as it may go through Tor. See [Hidden chats](#hidden)."),
    ],
  },
  {
    version: '3.4.2',
    forYou: [
      mark('**The SMS field keeps its width on a small screen**: Photo and Send beside it are round buttons, as in a chat.'),
    ],
    underTheHood: [
      mark('**A message sent as a chat opens waits for it**, marked Sending…, and goes as soon as the chat is open, never saying that Erevos cannot encrypt.'),
      mark('**What you read as a chat opens stays read**: the home screen no longer counts it as new.'),
      mark('**No question from Samsung about its sharing**: on a Samsung phone, Wi-Fi Aware and the Wi-Fi with phones nearby stay off until you turn them on. See [Chat with a nearby phone](#nearby).'),
    ],
  },
  {
    version: '3.4.1',
    forYou: [
      mark('**Send answers at once**: a short buzz as you press it, the field empties and the message shows, marked Sending…, so it never goes twice.'),
    ],
    underTheHood: [
      mark('**The screen no longer stays pushed up** after the keyboard closed behind a sheet, a dialog or another app.'),
      mark('**Importing a chat with its photos no longer freezes Erevos**: the screen moves while the files come in, says what share of them is in, and **Cancel** stops it. A chat moved into hidden chats takes the chats imported into it along. See [Imported chats](#import).'),
    ],
  },
  {
    version: '3.4.0',
    forYou: [
      mark('[Transparency](#transparency), a new part of the guide: what the server behind Erevos keeps and for how long, what it does not keep, and who else sees something.'),
      mark("**What's new**: this list, in Settings → General, by version."),
      mark("**A group video call from the top of the group**: a blue camera beside the green handset, as in a contact's chat."),
      mark("**Hidden chats, more like the others**: they close after 30 seconds in the background, not at once, and never during a call or while you pick a photo or a file; while open, a message plays its sound, and link previews have a switch of their own there. See [Hidden chats](#hidden)."),
      mark("**Hidden chats that receive while closed**: a switch at the top of each place, on for new places, has them receive as your other chats do: their contacts see at once that a message came, a notice says only \"New message\", and a call rings with no name. See [Hidden chats](#hidden)."),
      mark("**Hidden chats wait and import too**: what cannot go now waits, marked Waiting, and goes by itself through their relay; Send later works there as in your other chats; and a chat from Telegram, WhatsApp or Viber can be imported into a hidden chat, kept only there. See [Hidden chats](#hidden)."),
      mark("**Hidden chats listed like your chats**: they open on a list as the home screen's, with what was said last and how many are not read, and each place has a Chat with myself of its own at its top. See [Hidden chats](#hidden)."),
      mark("**More in hidden chats**: with Receive while closed on, what comes to them through Nostr is read while they are closed too; and there a contact can be added from a photo of their QR code, and a hidden contact given a photo. See [Hidden chats](#hidden)."),
      mark("**Hidden chats with no relay**: as your other chats, they can begin through Nostr only: their contact link and QR code say where they read there, and texts and reactions go there. See [Hidden chats](#hidden)."),
      mark("**Groups in hidden chats**: under their list, New group makes a group with their contacts; it lists among their chats, goes through their relay only, and is read while they are closed if Receive while closed is on. See [Hidden chats](#hidden)."),
      mark("**No test version line**: the home screen no longer ends saying this is a test version. The guide still says exactly what is protected, and that nothing has been audited yet. See [What is protected today](#privacy)."),
      mark("**The contacts menu in hidden chats**: their Contacts has a menu again, with what is theirs only: a .vcf file imported into them, their contacts saved as a .vcf file, and a contact's QR code read from a photo. An Erevos ID typed there adds them to the hidden chats. See [Contacts](#contacts)."),
      mark("**Two new sticker sets of 24 moods**: **Tux**, the Linux penguin as he is drawn, and **Aikido**, an aikidoka in keikogi and a wide hakama, who also bows, sits in seiza and rolls."),
    ],
    underTheHood: [
      mark('**Your relay proves its own key**: every connection to it starts with a check only the relay holding that key can pass, so no one in between can pass for it. Once it has, Erevos never reaches it without the check. Your relay needs an update for it.'),
      mark("**Nothing shows behind a chat's PIN**: none of the messages of a chat locked with a PIN is drawn until its PIN is typed, and with glass, a wallpaper or a style's own scene, the PIN screen is a dense frost that lets nothing through."),
      mark("**A relay queue for each contact**: each contact writes to a queue only they know, so the relay cannot tell that two contacts write to the same phone, and deleting or blocking someone deletes only theirs. Your relay needs an update for it."),
    ],
  },
  {
    version: '3.3.2',
    forYou: [
      mark('**The plain call button for more contacts**: the orange keypad at the top of a contact’s chat also takes the number of a contact you connected them to (**Connect to one of my contacts**), the mobile number first.'),
    ],
    underTheHood: [],
  },
  {
    version: '3.3.1',
    forYou: [
      mark('**Viber chats can be imported**: from the HTML file of the Android app Backup Text for Viber, words only.'),
    ],
    underTheHood: [],
  },
  {
    version: '3.3.0',
    forYou: [
      mark('**Start without a relay, through Nostr**: **Start without a relay** on New chat. Texts, stickers, reactions, edits and the delivered and read marks go through Nostr over Tor. Photos, voice messages, files and calls still need a relay or a phone nearby.'),
      mark('**Told when a new version is out** (Android): once a day Erevos asks LPHL’s server, then shows a pinned Erevos row and a notice, only for a version the release computer signed. It turns off in Settings → General → Updates.'),
      mark('**Lock a chat with a PIN**: Details → Lock with a PIN, for chats and groups. Nothing of it shows in search, starred messages or imports. In hidden chats it asks for no PIN.'),
      mark('**A new handset** on the green tiles: Phone, and the call in a chat.'),
      mark('**A new New chat screen**: How you connect now at the top, three large cards for a phone without a relay (I have an invite, Sign in with LPHL, Start without a relay), and the technical part under For advanced users.'),
      mark('**Invite by SMS** (Android): on a phone contact’s card, for one person, for 2 days. The link opens a page that offers Erevos (the APK for Android, the web app for an iPhone or a computer), then opens the invite. The QR code and Share the invite stay as they were.'),
      mark('**A phone call button** in Erevos chats and SMS chats.'),
    ],
    underTheHood: [
      mark('**The relay comes by itself**: whoever has a relay that invites sends a contact with no relay an invite once, inside the chat, and the other phone takes it by itself.'),
      mark('**Nostr steadier through Tor**: each Nostr relay has its own way through Tor, and after a failure it tries a new exit. A clearer error on the Nostr screen.'),
      mark('**When the connection to the relay drops** while Erevos waits on it, Erevos notices and connects again, where it stayed stuck before.'),
      mark('**Fixes to the SMS invite**: a link copied as /i/#… works too, an older web app opens the invite as well, and on iOS 26 it says Share is under •••.'),
    ],
  },
  {
    version: '3.2.1',
    forYou: [
      mark('**Edit a message** you sent, up to a day after: to contacts, groups and linked devices, with Edited beside the time.'),
      mark('**Nostr says what it did**: Sent through Nostr, and on the Nostr screen what each relay did last.'),
      mark('**Coloured call buttons** at the top of a chat: video blue, voice green.'),
    ],
    underTheHood: [],
  },
  {
    version: '3.2.0',
    forYou: [
      mark('Arrows to the start and the end of a chat; earlier messages come by themselves as you scroll.'),
      mark('Chats imported from Telegram and WhatsApp look like Erevos messages: bubbles, days, photos, voice messages, search.'),
      mark('Dogs instead of cats in the stickers.'),
      mark('Screenshots: a switch in Settings → Privacy and security.'),
      mark('Hidden chats from New chat: hold it for a second.'),
      mark('Coloured tiles on the home screen: Phone green, Contacts violet, the lock orange.'),
      mark('**Chat with myself**, always first, and **Remind me**, the orange bell.'),
      mark('**Media, links and files** in a chat’s Details, with a calendar and Go to a day.'),
      mark('Import a chat from inside the chat: Details → Imported chats.'),
      mark('A closed space can say that a message came while another space is open.'),
      mark('The message menu says when a message went or came through Nostr.'),
      mark('**Support Erevos**: Liberapay, PayPal, Monero, Bitcoin.'),
      mark('Who makes Erevos and why, in About Erevos; the guide says why everywhere.'),
    ],
    underTheHood: [],
  },
  {
    version: '3.1.2',
    forYou: [
      mark('**Settings in 8 groups**, with a search: General, Appearance, Notifications, Privacy and security, Relay and networks, Phone and SMS, Data and devices, For testing. The home screen’s ⋯ keeps only the places, and Settings last.'),
    ],
    underTheHood: [],
  },
  {
    version: '3.1.1',
    forYou: [],
    underTheHood: [
      mark('Check for updates says what stopped an update.'),
      mark('Invite someone is not made from a token for all; it asks you to sign in to the relay first.'),
      mark('The relay’s token for all becomes a token of the phone’s own, by itself (needs the relay updated).'),
      mark('A relay that refuses through Tor says why.'),
    ],
  },
  {
    version: '3.1.0',
    forYou: [
      mark('Hidden chats by holding New chat.'),
      mark('A search for contacts on the Phone.'),
      mark('New chat shows first how to add a contact.'),
      mark('Erevos in other apps’ Share.'),
      mark('A sound for every new message, also while Erevos shows.'),
    ],
    underTheHood: [
      mark('Less battery in the background: the relay, Tor and the nearby radios.'),
      mark('Erevos no longer closes when you make a sticker from a photo.'),
      mark('Hidden chats’ notices are right.'),
      mark('A call shows over the screen saver, and the screen wakes.'),
      mark('The SMS settings say right what holding does.'),
    ],
  },
  {
    version: '3.0.0',
    forYou: [
      mark('Each icon opens what it names: Erevos, SMS, Phone, Contacts, the widget.'),
      mark('**Messages through Tor by default**: Messages, Everything or Nothing.'),
      mark('**Texts through Nostr**: three public relays, through Tor, with your own relay as backup after 5 minutes.'),
    ],
    underTheHood: [],
  },
  {
    version: '2.0.3',
    forYou: [
      mark('One invite for everything: the relay and the contact together.'),
      mark('Spam rules for senders and numbers abroad, with the reason.'),
      mark('480 stickers in 20 sets.'),
      mark('Copy code for one-time codes in SMS.'),
    ],
    underTheHood: [
      mark('Lighter chats on older phones; QR codes at once.'),
      mark('Locked, Erevos keeps receiving.'),
      mark('Faster contacts; the hidden chats’ notice counts only messages.'),
      mark('The relay tries every address: push, other relays, the LPHL sign-in.'),
    ],
  },
  {
    version: '2.0.2',
    forYou: [
      mark('The icons fill the launcher’s shape.'),
    ],
    underTheHood: [
      mark('Swiping on the tabs only changes the tab.'),
    ],
  },
  {
    version: '2.0.1',
    forYou: [
      mark('Coloured icons (Erevos red, Phone green, SMS blue, Contacts violet) and a new SMS icon.'),
      mark('A colour for each icon, and the order of the widget’s buttons.'),
      mark('Swipe to go back, and between tabs.'),
    ],
    underTheHood: [],
  },
  {
    version: '2.0.0',
    forYou: [
      mark('A new contact can take the name of a contact on the phone.'),
      mark('**Sign in to the relay with LPHL**, and **invites to the relay**.'),
      mark('Permissions in the web app, and more on Android; the web app’s notice says how many came.'),
      mark('Hidden chats can ring calls while they are closed.'),
      mark('A new chat screen; QR codes from a photo; the Phone for small screens.'),
      mark('Add as contact inside a group.'),
      mark('Stickers in sets, moving, and your own.'),
      mark('SMS inside the Erevos chat.'),
      mark('An F-Droid build; Serbo-Croatian; new version numbers.'),
    ],
    underTheHood: [
      mark('An update of the WebView no longer closes Erevos.'),
      mark('Deleting or blocking a contact gives you a new queue on the relay.'),
      mark('New keys every month in chats, every week in groups.'),
      mark('Linked devices work with the phone off.'),
      mark('Android updates need the release computer’s signature.'),
      mark('Much for security: Argon2id, messages encrypted for the relay too, a token for each phone, no link starts a call.'),
    ],
  },
  {
    version: '0.1.16',
    forYou: [
      mark('Imports from Telegram and WhatsApp bring photos, videos, voice messages and files.'),
      mark('A phone without a relay talks through a place on a contact’s relay.'),
    ],
    underTheHood: [],
  },
  {
    version: '0.1.14',
    forYou: [
      mark('Back to my chats, for hidden chats.'),
    ],
    underTheHood: [
      mark('Erevos receives and rings even after you swipe it away from the recent apps.'),
    ],
  },
  {
    version: '0.1.12',
    forYou: [
      mark('Hidden chats can say a message came.'),
    ],
    underTheHood: [
      mark('Fixes: menus, QR codes from a photo, Bluetooth on Android 17, long lists.'),
    ],
  },
  {
    version: '0.1.11',
    forYou: [
      mark('The Phone without the password, if you allow it; a home screen widget; an SMS and Erevos filter.'),
    ],
    underTheHood: [],
  },
  {
    version: '0.1.10',
    forYou: [
      mark('Links wait for the password; Phone and Contacts icons; the Erevos ID on a contact.'),
    ],
    underTheHood: [],
  },
  {
    version: '0.1.8',
    forYou: [
      mark('61 new features: 5 new languages, linked devices, public groups, replies, reactions, polls, send later, Erevos as the phone and contacts app, Tor bridges, the fingerprint, Windows and more.'),
    ],
    underTheHood: [],
  },
  {
    version: '0.1.7',
    forYou: [
      mark('SMS notices in the background.'),
    ],
    underTheHood: [],
  },
  {
    version: '0.1.6',
    forYou: [],
    underTheHood: [
      mark('The web app comes out with every release.'),
    ],
  },
  {
    version: '0.1.5',
    forYou: [
      mark('Greek in the whole app.'),
    ],
    underTheHood: [],
  },
  {
    version: '0.1.4',
    forYou: [
      mark('Web Push in the web app.'),
    ],
    underTheHood: [],
  },
  {
    version: '0.1.2',
    forYou: [
      mark('The first signed Android release: encrypted chats, calls, groups, hidden chats, backups, imports, and phones nearby without the internet.'),
    ],
    underTheHood: [],
  },
];

/**
 * The list as the version that runs (`running`) shows it: NEXT under `running`'s number when it
 * comes after the last release, else (a build of main for testing) with no number, then every
 * release.
 */
export function whatsNewFor(running: string, edition: Edition = EDITION): (Changes & { version: string | null })[] {
  const released = VERSIONS[0]?.version ?? '0';
  const pending = NEXT.forYou.length + NEXT.underTheHood.length > 0;
  const next = pending && !VERSIONS.some((v) => v.version === running) ? [{ version: laterThan(running, released) ? running : null, ...NEXT }] : [];
  const all = [...next, ...VERSIONS];
  return edition === 'lite' ? all.map(({ forYou, underTheHood, ...rest }) => ({ ...rest, forYou: forYou.filter(inLite), underTheHood: underTheHood.filter(inLite) })) : asPlus(all);
}

// Erevos+ tells its releases as its own: a release of the plain Erevos alone (after 7.0.0, an even
// minor number: 7.0.y, 7.2.0-beta.1, while Erevos+ has the odd ones, docs/editions.md) is not listed in it, and what it brought shows under the Erevos+ release that
// came after it, but what only the plain Erevos is about (ONLY_LITE). With no Erevos+ release after
// it yet, it stays as it is.
const PLAIN_RELEASE = /^\d+\.\d*[02468]\.\d+(?:-[0-9A-Za-z.]+)?$/;
const ONLY_LITE = /only (?:of )?what Erevos has\b/;
// The last release before there were two editions: older ones are the history of both.
const FIRST_TWO = '7.0.0';

export function asPlus<T extends Changes & { version: string | null }>(list: T[]): T[] {
  const out: T[] = [];
  let carried: Changes = { forYou: [], underTheHood: [] };
  // Oldest first, so what a plain release brought goes up to the next Erevos+ one.
  const plain = (version: string) => PLAIN_RELEASE.test(version) && laterThan(version, FIRST_TWO);
  const ownAt = (entry: T) => entry.version !== null && !plain(entry.version);
  for (const entry of [...list].reverse()) {
    if (!ownAt(entry) && entry.version !== null && list.slice(0, list.indexOf(entry)).some(ownAt)) {
      carried = { forYou: [...entry.forYou.filter((x) => !ONLY_LITE.test(x)), ...carried.forYou], underTheHood: [...entry.underTheHood.filter((x) => !ONLY_LITE.test(x)), ...carried.underTheHood] };
      continue;
    }
    out.unshift(carried.forYou.length + carried.underTheHood.length ? { ...entry, forYou: [...entry.forYou, ...carried.forYou], underTheHood: [...entry.underTheHood, ...carried.underTheHood] } : entry);
    carried = { forYou: [], underTheHood: [] };
  }
  return out;
}

// What the plain Erevos (lib/edition.ts) shows: not what is of networks only Erevos+ has, but the
// word that they are there.
const PLUS_ONLY = /\bMatrix\b|\bXMPP\b|other Nostr apps|Nostr chats|Nostr accounts?\b|\bElement Call\b|\bPublic\b/;
const IN_PLUS = '**Matrix, XMPP and Nostr chats are in Erevos+**';
const inLite = (text: string): boolean => text.startsWith(IN_PLUS) || !PLUS_ONLY.test(text);
