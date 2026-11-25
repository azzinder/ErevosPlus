// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { BRIDGE, EDITION, type Edition } from './edition';
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
    mark("**One + for every chat**: in Erevos+'s Telegram, Signal, Messenger and Session chats, **+** beside where you write opens a grid with icons, as in Erevos's own chats, in place of the grey buttons. See [Telegram](#telegram)."),
    mark("**Where you write stays at the bottom**: in a Telegram, Signal, Messenger or Session chat with few messages, the field no longer sits under the last message in the middle of the screen."),
    mark("**Session and Signal in backups**: in Erevos+, a backup now holds Session's account and chats, sealed with its password, and a restore brings them back. It holds Signal's history too, but not its link to the account: register or link Signal again, and the old messages show beside the new ones, to read only. **Backups** and the message after a backup say that Telegram and Messenger are not in it, and what each needs after a restore. See [Backups](#backup)."),
    mark("**Messenger's old chats no longer come back unread**: in Erevos+, after the phone restarted, Erevos+ showed old Messenger, Signal or Session chats as not read again, each with one message, although nothing new had come. Only a message that really comes now, or one that came while Erevos+ was closed, makes a chat unread. See [Messenger](#messenger)."),
  ],
  underTheHood: [],
};

export const VERSIONS: WhatsNew[] = [
  {
    version: '3.1.0-rc.2',
    forYou: [
      mark("**Release candidate 2**: Erevos+ with everything Erevos 3.0.0-rc.2 brought, and what is below."),
      mark("**Messenger's chats stay read**: in Erevos+, a Messenger chat you read no longer comes back unread after a while, and Mark all as read also covers the older chats Meta sends later. Only chats in Meta's inbox count as not read, as on Meta's own page: message requests and archived chats do not. With Messenger in its case, its card opens the case and home stays as you left it. See [Messenger](#messenger)."),
      mark("**Chat options in reach**: in Erevos+'s Telegram, Signal, Messenger and Session chats too, a sliders button beside where you write opens the chat's options in one tidy list, as in Erevos's own. See [Telegram](#telegram)."),
      mark("**Signal finds your contacts**: in Erevos+, **New chat** on Signal offers the phone's contacts that match as you type, and a typed number as **New number**. Signal is asked only about the one you tap. See [Signal](#signal)."),
    ],
    underTheHood: [],
  },
  {
    version: '3.2.0-rc.2',
    forYou: [
      mark("**Release candidate 2**: Erevos Lite with what Erevos 3.0.0-rc.2 brought to its chats: New chat that asks where the other person is, and the fixes with it."),
    ],
    underTheHood: [],
  },
  {
    version: '3.0.0-rc.2',
    forYou: [
      mark("**New chat asks where the other person is**: **Near me** makes two phones side by side each other's contacts with nothing typed, once both show the same six pictures; **Far away** sends an invite with any app; **I have their code** takes 8 digits, a link or a QR code. See [Chat through a relay](#relay)."),
      mark("**QR codes and invites with SMS invites off**: a contact QR code or an invite link you take yourself now works also with the invites by SMS turned off under **Find Erevos on a number**; until now nothing happened then."),
      mark("**Camera at a tap**: on Android, **Appearance** → **Launcher icons** → **Camera** gives the Collection's camera an icon of its own among the phone's apps, and holding Erevos's icon down offers **Camera** too. See [Collection](#collection)."),
      mark("**Speed dial with Erevos locked**: if you turn it on under **Phone** → **Settings**, holding 2 to 9 on the Phone opened without the password calls your speed dial numbers with Erevos locked too. See [Phone](#phone)."),
      mark("**Chat options in SMS conversations**: a sliders button beside where you write opens **Chat options**, one tidy list in place of the rows of buttons: notifications, the chat's look, search, media and more."),
      mark("**Chat options in Nostr, Matrix and XMPP chats**: the same sliders button beside where you write, with the contact's own options on Nostr; Nostr's **+** now holds what goes with a message."),
      mark("**The warning without Tor comes once**: that your internet address can be seen is now said once for a whole network, not in every chat; after that a quiet line above where you write says it, with **Through Tor for this chat**."),
      mark("**Start when the phone turns on**: after the phone restarts, Erevos now waits with a notice in the status bar and no longer stops without a word; a tap on the notice opens it for the password."),
      mark("**Backup progress stays in sight**: **Make a backup** shows how far it is again when you leave the screen, or Erevos, and come back, and then how it ended."),
    ],
    underTheHood: [
      mark("Unlocking with a fingerprint or face no longer turns itself off by mistake, when Erevos checked its key while the phone itself was locked or Android answered late."),
      mark("**Near me** shows six pictures made from a key the two phones agree on then: a phone in between would show each of you different ones, and each phone gives its contact link only once its owner says the pictures are the same."),
    ],
  },
  {
    version: '3.1.0-rc.1',
    forYou: [
      mark("**Release candidate**: Erevos+ as it is meant to come out, with everything Erevos 3.0.0-rc.1 brought."),
      mark("**Messenger in its case, one way in**: in Erevos+, with Messenger **In its case**, its card in **Services** opens the case as Settings does, and Facebook's feed is in the case's own bar, with no Facebook card or button beside it. If the case cannot open, Erevos says why. See [Messenger](#messenger)."),
      mark("**Telegram notices go once read**: in Erevos+, a Telegram chat read and left at once no longer leaves its notice of new messages behind, and a muted chat says nothing of what came meanwhile once it is unmuted. See [Telegram](#telegram)."),
    ],
    underTheHood: [],
  },
  {
    version: '3.2.0-rc.1',
    forYou: [
      mark("**Release candidate**: Erevos Lite as it is meant to come out, with what Erevos 3.0.0-rc.1 brought to its chats and calls."),
    ],
    underTheHood: [],
  },
  {
    version: '3.0.0-rc.1',
    forYou: [
      mark("**Search and Ways stay in sight**: on home, the search and the **Ways** line stay under the top bar while the list scrolls."),
      mark("**Calls on a locked phone**: a call that rings with the phone locked or its screen off now turns the screen on by itself. See [Phone](#phone)."),
    ],
    underTheHood: [
      mark("From a code review made with the help of AI: a restore that cannot finish leaves the phone as it was, and the relay keeps its lent places, held messages and deletions right, also after a power cut."),
    ],
  },
  {
    version: '3.1.0-beta.2',
    forYou: [
      mark("**Messenger in its case tells you of new messages**: in Erevos+, when you use Messenger in its case, Erevos now tells you of its new messages as it does of other chats, even if you never opened the case. A chat with messages not read shows on home until it is read, and tapping it opens it in the case; while the case is open, Erevos tells of nothing, as the page shows it. See [Messenger](#messenger)."),
      mark("**Messenger in its case wears your whole look**: in Erevos+, Meta's own Messenger page in its case now takes your look: its colours, dark or light as Erevos is, the shape of your bubbles (round, square or a line), your text size, your style's letters, and what lies behind your screens (a wallpaper, Neon's grid, Paper's lines and the others), and it changes with your look even while it is open. A photo of your own stays in Erevos: there the page shows a soft gradient instead. Where Meta changes its page, parts of it may keep Meta's look. See [Messenger](#messenger)."),
      mark("**Messenger in its case asks for the PIN once**: in Erevos+, what Meta's page keeps now stays in the case between openings, apart from every other page, so Meta knows your phone again and no longer asks for the PIN of your encrypted chats each time you open it. It goes when you sign out of Messenger, or when another account opens the case. See [Messenger](#messenger)."),
      mark("**Your networks move with Erevos+**: moving from one Erevos+ to another on the same phone (as from Erevos+ 7.x to the new Erevos+), Telegram, Signal, Session, Messenger and Matrix now go on signed in, as they were. Telegram's photos and files download again as they are opened, and Messenger's page asks for its PIN once more. Moving from Erevos+ to Erevos or Erevos Lite says first that those accounts stay behind, and to write down Session's 13 recovery words. See [Updates](#updates)."),
    ],
    underTheHood: [],
  },
  {
    version: '3.2.0-beta.2',
    forYou: [
      mark("**Erevos Lite**: Erevos's own chats, groups and calls, end-to-end encrypted, in an app of its own that asks for fewer permissions. It moves to Erevos or Erevos+, and they to it, under **Updates**. See [Updates](#updates)."),
    ],
    underTheHood: [],
  },
  {
    version: '3.0.0-beta.2',
    forYou: [
      mark("**Short passwords**: a new password, or PIN of hidden chats, that is short is taken only after **Use it anyway**. See [Password lock](#lock)."),
    ],
    underTheHood: [
      mark("Tries of a password or PIN count one at a time, also across a browser's tabs; a restore that cannot finish puts back what the phone had; a release's SHA256SUMS is signed."),
    ],
  },
  {
    version: '3.0.0-beta.1',
    forYou: [
      mark("**Erevos, Erevos+ or Erevos Lite**: each is now an app of its own. Choose another under **Updates**, and this Erevos hands it everything here on the phone, encrypted: open the new one within a day and it brings your chats. See [Updates](#updates)."),
      mark("**Make a backup** shows what it does and how far it is in its card, with a bar, and a notice says when the backup is done. See [Backups](#backup)."),
      mark("**MMS abroad**: while roaming, an MMS waits for a tap, **Fetch (may cost)**, unless you choose otherwise under **Settings** → **Phone and SMS** → **SMS** → **MMS**. See [SMS](#sms)."),
      mark("**Quick texts**: hold the **+** in an SMS conversation down for short words you write often, and keep your own. See [SMS](#sms)."),
      mark("**Reactions from iPhones**: a like or another reaction an iPhone or Google Messages sends by SMS, Liked “…”, shows as 👍 on your message instead of a message of its own. See [SMS](#sms)."),
      mark("**Videos by MMS**: **+** → **Record a video** in an SMS conversation records one in MMS quality with the phone's camera app, and a video that comes plays with a tap. See [SMS](#sms)."),
      mark("**Answer an SMS from its notice**: **What an SMS says, on its notice**, under the SMS settings, off at first, shows who wrote and what on the notice while the space is open, with **Reply** and **Mark as read**. Locked, it says \"New message\" again. See [SMS](#sms)."),
      mark("**What an SMS costs**: as you write a longer SMS, a line over the field says how many SMS it goes as, 70 letters each with Greek small letters, accents or an emoji, 160 without. **Without accents (cheaper)**, under the SMS settings, sends it without accents and Greek in capitals, as the old phones wrote it. See [SMS](#sms)."),
      mark("**Who an unknown number is, without asking anyone**: the call screen of a number that is none of your contacts says its country, place and whether it is a mobile, from the number alone, and warns of spam from a list you download whole under **Phone** → **Settings** → **Spam list**, or numbers you reported in **Recents**. See [Phone](#phone)."),
      mark("**Video calls through your phone company**: where your SIM and network carry them (ViLTE), a video call that comes shows **Answer with video** and **Audio only**, a call can turn video on with **Video**, and **⋯** beside a typed number offers **Video call**. See [Phone](#phone)."),
      mark("**Who is in a conference call**: once calls are merged, the call screen lists each person, with **Separate** to talk with one alone and **End** to drop one, where your phone company allows it. See [Phone](#phone)."),
      mark("**Speed dial**: hold a key from 2 to 9 on the Phone's empty keypad to call the number you put on it; an empty key offers to choose one, and **Phone** → **Settings** → **Speed dial** shows them all. Kept sealed in the space. See [Phone](#phone)."),
      mark("**Call settings in one place**: under **Phone** → **Settings**, **Call settings** opens Android's screens for call forwarding, call waiting, showing your number and the voicemail number, for each SIM, and asks your phone company with the usual codes where a phone has no such screen. See [Phone](#phone)."),
      mark("**Voicemail at a hold**: on the Phone's keypad, hold **1** to call your voicemail. Where your phone company sends voicemails as recordings, **Voicemail** beside **Recents** lists them, to play, call back or delete. See [Phone](#phone)."),
      mark("**Emergency calls without delay**: an emergency number is called at once, never asking which SIM, and with Erevos locked, **Emergency call** on the password screen opens Android's emergency keypad. See [Phone](#phone)."),
      mark("**Gallery originals, deleted as chosen**: with **Delete the original from the gallery after importing** on, a photo picked from the phone's storage is now deleted from the gallery too, and when Android does not say which photo of the gallery it is, Erevos says so instead of keeping quiet. See [Collection](#collection)."),
      mark("**Photos and videos, as in a gallery**: in the Collection, **Camera** is Erevos's own, so no other app sees what it takes, **From the gallery** brings in many photos and videos at once, HEIC and AVIF photos show among the photos, **Edit** turns and cuts a photo into a new one, and **Information** says whether a photo or video says where it was taken. A photo that leaves Erevos goes without where and when it was taken, unless you choose otherwise. See [Collection](#collection)."),
      mark("**Night photos and HDR**: Erevos's own camera now uses the night, HDR and portrait modes of the phone's maker where the phone has them, as on a Pixel, made on the phone itself. A tap focuses there, **Darker** and **Brighter** set the light, the zoom buttons go to the wide lens, 2× and 5×, and videos can be HDR. A photo is never written anywhere, not even for a moment. See [Collection](#collection)."),
      mark("**The services stay in sight**: on home, the services button stays under the top bar while the list scrolls, so another part is a tap away; the search and **Ways** scroll with the list. **Names** shows only on the **SMS** part, where it belongs."),
      mark("**New SMS on the SMS part**: on the **SMS** part of the chat list, the button at the bottom is **New SMS** and opens only a new SMS, also with Erevos's own chats on. See [SMS](#sms)."),
    ],
    underTheHood: [],
  },
];

/**
 * The list as the version that runs (`running`) shows it: NEXT under `running`'s number when it
 * comes after the last release, or the build is Erevos+'s bridge (`bridge`), whose 7.x name comes
 * before the 3.x ones and is a release all the same; else (a build of main for testing) with no
 * number, then every release.
 */
export function whatsNewFor(running: string, edition: Edition = EDITION, bridge = BRIDGE): (Changes & { version: string | null })[] {
  return whatsNewOf(VERSIONS, NEXT, running, edition, bridge);
}

/** whatsNewFor, of any list of releases and what is not out yet: for the checks. */
export function whatsNewOf(versions: WhatsNew[], next: Changes, running: string, edition: Edition, bridge = false): (Changes & { version: string | null })[] {
  // A release of Erevos Lite (x.2.y) is told only in Erevos Lite: what it brought of Erevos's own is
  // told in Erevos's releases already.
  const lite = (v: { version: string | null }) => v.version !== null && LITE_RELEASE.test(v.version);
  const own = edition === 'lite' ? versions : versions.filter((v) => !lite(v));
  // The last release of this edition: Erevos Lite's own, before which what runs is its first.
  const released = (edition === 'lite' ? own.find(lite) : own[0])?.version ?? '0';
  const pending = next.forYou.length + next.underTheHood.length > 0;
  const coming = pending && !own.some((v) => v.version === running) ? [{ version: bridge || laterThan(running, released) ? running : null, ...next }] : [];
  const all = [...coming, ...own];
  if (edition === 'plus') return asPlus(all);
  const kept = edition === 'lite' ? (text: string) => inLite(text) && inErevosLite(text) : inLite;
  const shown = all.map(({ forYou, underTheHood, ...rest }) => ({ ...rest, forYou: forYou.filter(kept), underTheHood: underTheHood.filter(kept) }));
  return edition === 'lite' ? asLite(shown, running).filter((v) => v.forYou.length + v.underTheHood.length > 0) : shown;
}

// Erevos Lite tells its releases (x.2.y, their betas and rcs) as its own: what a release of another
// edition brought shows under the Lite release that came after it, or, with none yet, under the
// Lite version that runs (its first release, 3.2.0-beta.2, brings all Erevos had until then). A
// build of main for testing, with no Lite number, keeps them as they are. So each release of Erevos
// Lite has its entry in VERSIONS, as CHANGELOG.md's "## 3.2.x" (release-lite.yml checks it): what
// came before it then stays under it, not under the next one.
const LITE_RELEASE = /^(?!7\.)\d+\.2\.\d+(?:-(?:alpha|beta|rc)\.\d+)?$/;

export function asLite<T extends Changes & { version: string | null }>(list: T[], running: string): (Changes & { version: string | null })[] {
  const out: (Changes & { version: string | null })[] = [];
  let carried: T[] = [];
  const merged = (entry: Changes & { version: string | null }, from: T[]) => ({
    ...entry,
    forYou: [...entry.forYou, ...from.flatMap((x) => x.forYou)],
    underTheHood: [...entry.underTheHood, ...from.flatMap((x) => x.underTheHood)],
  });
  // Oldest first, so what another edition's release brought goes up to the next Lite one.
  for (const entry of [...list].reverse()) {
    if (entry.version !== null && !LITE_RELEASE.test(entry.version)) {
      carried = [entry, ...carried];
      continue;
    }
    out.unshift(merged(entry, carried));
    carried = [];
  }
  if (carried.length === 0) return out;
  if (LITE_RELEASE.test(running) && !list.some((v) => v.version === running)) return [merged({ version: running, forYou: [], underTheHood: [] }, carried), ...out];
  return [...carried, ...out];
}

// Erevos+ tells its releases as its own: a release of the plain Erevos alone (7.0.y after 7.0.0,
// docs/editions.md; 7.2.y; since then x.0.y, and Erevos⁻'s x.2.y, their betas and rcs too) is not listed in it, and what it brought
// shows under the Erevos+ release that came after it, but what only the plain Erevos is about
// (ONLY_LITE). With no Erevos+ release after it yet, it stays as it is.
const PLAIN_RELEASE = /^(?:7\.0\.[1-9]\d*|7\.2\.\d+|(?!7\.)\d+\.[02]\.\d+)(?:-(?:alpha|beta|rc)\.\d+)?$/;
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
export const inLite = (text: string): boolean => text.startsWith(IN_PLUS) || !PLUS_ONLY.test(text);

// What Erevos Lite shows besides: not what is of the Phone, the SMS, the Collection or its camera,
// which it has not.
// Case counts: the Phone and the Collection are written with a capital, the phone you hold is not.
const EREVOS_ONLY = /\(#(?:phone|sms|collection|modules)\)|\bSMS\b|\bMMS\b|\bPhone\b|\bCollection\b|\b[Vv]oicemails?\b|\b[Ss]peed dial\b/;
export const inErevosLite = (text: string): boolean => !EREVOS_ONLY.test(text);
