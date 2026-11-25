# Changelog

What each release changed, newest first, for whoever taps **Update**. Each release lists first what
changes **for you**, what you see and use, then what changed **under the hood**: fixes, speed, battery
and security inside. After 0.1.16 comes 2.0.0.
Until then releases were numbered `0.1.<run of the release workflow>`, so some numbers have none:
0.1.1 went out only on the private repository, without an Android app, and 0.1.3, 0.1.9, 0.1.13
and 0.1.15 never came out.
4.0.0-rc.6 is the first release with a macOS build. After 4.0.0-rc.10 comes 6.0.0-rc.1, and after 7.0.2 comes 7.2.0-beta.1 (7.1 and 7.3 are Erevos+). After 7.2.0-rc.2 comes 3.0.0-beta.1: since then the second number says the edition (3.0.x Erevos, 3.1.x Erevos+, 3.2.x Erevos Lite), and What's new in the app starts again there. **Not audited.**

## 3.2.0-rc.2 (2026-11-25)

The second release candidate of Erevos Lite: Erevos 3.0.0-rc.2 for Erevos's own chats and calls, with what is below.

### For you

- What Erevos 3.0.0-rc.2 brought to chats: New chat that asks where the other person is, with **Near me**, **Far
  away** and **I have their code**; the warning without Tor said once for a network; **Make a backup** showing how
  far it is again; and **Start when the phone turns on** waiting with a notice in the status bar. The camera's icon,
  the chat options and the speed dial with Erevos locked are the Collection's, the SMS's and the Phone's, which
  Erevos Lite has not.

### Under the hood

- Unlocking with a fingerprint or face no longer turns itself off by mistake, and **Near me** pairs with a key the
  two phones agree on then, as in Erevos 3.0.0-rc.2.

## 3.0.0-rc.2 (2026-11-25)

### For you

- Erevos's camera at a tap (Android; not in Erevos Lite, which has no camera). **Appearance** → **Launcher icons** →
  **Camera** → **Put the Camera among the phone's apps** adds an icon of its own, off at first, in any of the six
  colours, and holding Erevos's icon down offers **Camera** too. Both open the Collection's camera, behind Erevos's
  password and the Collection's (`modules/erevos-collection` `CameraOpenActivity`, `erevos://collection?camera=1`,
  `app/collection.tsx`). Neither shows while the Collection is off or the calculator stands in place of Erevos
  (`modules/erevos-icons` `applyCamera`, `applyShortcut`; `lib/module-icons.ts`). Erevos Lite keeps the Collection's
  module, for the files in its chats, so its build takes the Camera's icon and what it opens out of the app
  (`plugins/with-edition-modules.js` `CAMERA_NOT_IN_LITE`), and shows neither the card nor the shortcut. Requested by
  the maintainer.
- The warning that your internet address can be seen before you send without Tor now comes once for the whole
  network, not in every chat. After that a chat or group that goes without Tor shows only a quiet line above where
  you write, **Without Tor: the relays see your internet address.**, with **Through Tor for this chat** and
  **Guide** (`lib/ip-warning.ts` `ipKey`, `components/ip-warning.tsx` `IpQuiet`). Requested by the maintainer.
- **Make a backup** shows how far it is again when you leave the backups screen, or Erevos, and come back, and then
  how it ended. Only in the space it was made in: once that space closes, nothing of the backup shows in the one
  opened next, and one still being made then ends without a word, the phone's notice that names it left out too
  (`lib/backup-making.ts`, `app/backup.tsx`).
- **Start when the phone turns on**: with no space set to tell of messages while closed, Erevos no longer stops
  without a word: the quiet **Locked** notice stays, and a tap on it opens Erevos for the password. While it waits for
  those spaces, its notice now shows in the status bar too (a channel of its own, **Waiting since the phone turned
  on**). The choice is now kept with the phone's other settings, so a backup restored, or a move to another edition,
  keeps it (`lib/background.ts` `syncBootStart`, `lock/backup.ts`).
- Chat options in reach (#44): in chats on Nostr, Matrix and XMPP and in SMS conversations, a sliders button beside
  where you write opens **Chat options**, one tidy list in place of the rows of buttons above or below the thread:
  **Notifications**, **Chat look**, the PIN, screenshots and disappearing messages under **This chat**, search, media,
  a day and export under **Find**, and, on Nostr, the contact's own (public posts, a name, block, remove). Nostr's
  **+** now holds what goes with a message, as Matrix's does (`components/ui.tsx` `OptionList`). Requested by the
  maintainer.
- New chat asks one thing (#45): **Where is the other person?** Each answer is a page of its own, and all three end on
  **You are connected**, with their name to set and **Write a message**. **Near me**: tap it on both phones, and the
  two find each other over Bluetooth or the Wi-Fi they share; each shows the same six pictures, both tap **Yes, the
  same**, and you are each other's contacts, with no relay, no internet and nothing typed or scanned. The page looks
  only while it is open, also with **Look for phones nearby** off, which stays off; under **If it is not found** it
  keeps the QR code for their camera, the code of 8 digits and, on Android, the app itself for a phone with no Erevos.
  **Far away**: an invite inside a message ready to send, with **Send with…**, its QR code, how far it has come
  (ready, waiting, connected) and **Take this invite back**, which closes its link while no phone has taken it; where
  this phone can make no invite, its contact link goes instead. **I have their code**: the 8 digits, their link or
  invite pasted, or their QR code. Under these, three rows hold the rest: **My link** (this phone's own QR code and
  link, a new contact link, a link for a website), **Blocked contacts** and **For advanced users** (the relay's
  settings, and the switches of **Nearby, with no internet**, which moved there). What the pictures, or the code of 8
  digits, hand over is taken as a contact link and as nothing else, never as an invite to a relay (`addPaired`). In
  the first steps, **I have an invite** opens **I have their code**. An invite whose link opens only where Erevos is
  already (a relay that lets this phone invite no one) now says so (`app/chat.tsx`, `components/new-chat-doors.tsx`,
  `near-me.tsx`, `their-code.tsx`, `welcome-invite.tsx`). Requested by the maintainer.
- Phone: speed dial can work with Erevos locked, if you choose. Under **Phone** → **Settings** → **Speed dial**, **Let
  speed dial work with Erevos locked** (off at first, offered only while the Phone opens without the password) keeps a
  copy of that space's speed dial numbers, without their names, on the phone outside the space (`lib/phone-open.ts`),
  so holding 2 to 9 on the Phone opened without the password calls them. One space at a time; the space knows its copy
  by a random `feed` kept sealed in its own data, so the copy does not say which space it is, though the option says
  that the numbers called can show that the space exists. Never in a backup, and never longer than it is of use: the
  copy is deleted when the Phone goes back behind the password, when a backup is restored (`lock/backup.ts`), when the
  lock is turned off, and when a second password is removed or set again while another space is open (`lock/config.ts`
  `dropOthersLockedSpeed`). Requested by the maintainer (#37).
- A contact QR code or an invite link you take yourself is answered also with the invites by SMS turned off (**Turn
  invites off**, under **Find Erevos on a number**). Turned off, the phone answered no invite at all, so the other
  phone never heard back and nothing happened; now only what came by SMS waits for the switch (`lib/sms-relay.ts`
  `invitesDue`, #35). Requested by the maintainer.

### Under the hood

- Unlocking with a fingerprint or face no longer turns itself off by mistake. It turned off whenever Erevos checked
  its key while the phone itself was locked (an Erevos call showing over the lock screen, say), or when Android's
  Keystore did not answer at once: both were taken for a key Android had dropped. Now a key Android really dropped
  (`KeyPermanentlyInvalidatedException`), or one that does not open what it sealed, turns it off at once, and nothing
  else does. A key broken in some other way, which Android only says it could not use, turns it off after three tries
  in a row on an unlocked phone, so its button does not stay to fail every time (`modules/erevos-biometric`,
  `lock/biometric.ts`).
- **Near me** pairs over the links to phones nearby with a key the two phones agree on then (`lib/near-pair.ts`,
  frames `EVP1:`, which an older Erevos leaves alone). The one that goes first gives the hash of its share before it
  sees the other's, and opens it only after: neither can choose a share to make the pictures match. The six pictures
  say 36 bits of the key; a phone makes 40 shares at most while the page stays open and keeps 8 pairings at once, so
  a phone in between has about one chance in a hundred million of showing both owners the same six. Nothing that
  names the owner goes before its yes, and then its contact link goes encrypted with that key
  (`checks/near-pair.check.ts`). Not tried on two real phones yet.
- The invite of **Far away** can be taken back from the relay while no phone used it (`lib/sms-relay.ts`
  `takeBackShortInvite`), and a message pasted whole, the invite's words with its link, is read as the link alone
  (`lib/open-link.ts`).

## 3.1.0-rc.1 (2026-11-23)

The first release candidate of Erevos+: Erevos 3.0.0-rc.1 with every network, with what is below. Erevos+ 7.x
moves to it through the bridge, 7.3.1, with its networks signed in.

### For you

- Everything Erevos 3.0.0-rc.1 brought (below), in Erevos+: the search and the **Ways** that stay in sight, calls on
  a locked phone that wake the screen, and the code review's fixes.
- Erevos Lite, 3.2.x, is a third app beside Erevos and Erevos+: moving from Erevos+ to it says first, as moving to
  Erevos does, that the other networks' accounts stay behind, and to write down Session's 13 recovery words.
- Telegram: a chat read and left at once no longer leaves its «1 message» notice behind (the read counts here at
  once, `readLocally`), and a message whose count TDLib gives in a later batch, or its new chat's place in the list,
  is still told of, once. A chat muted or kept in hidden chats keeps nothing to tell of, so being unmuted says nothing
  of what came meanwhile (`freshLeft`). Reported by the maintainer.
- Messenger in its case, one way in: with **In its case** chosen, Messenger's card in **Services** opens the case as
  Settings does, and a chat on home opens there at that chat; if the case cannot open, Erevos says why instead of
  going to the settings page. Facebook's feed is then in the case's own bar, so there is no Facebook card nor **Open
  Facebook** button beside it. Facebook's own page, used by Erevos itself, wears Erevos's look too, as far as the
  mobile site takes it. Requested by the maintainer.

### Under the hood

- Erevos's main merged in: the plain Erevos is built as `erevos` now, and `lite` is Erevos Lite. Messenger, Signal
  and Session are built only into Erevos+ (`erevos-messenger` takes its stub in both other editions), and Telegram
  goes only with Erevos+. Where Erevos+ keeps «Erevos» as written (the other person's app, or what all editions
  share), Erevos Lite keeps it too.

## 3.2.0-rc.1 (2026-11-23)

The first release candidate of Erevos Lite: Erevos 3.0.0-rc.1 for Erevos's own chats and calls, with what is below.

### For you

- What Erevos 3.0.0-rc.1 brought to chats and calls; its call on a locked phone is the Phone's, which Erevos Lite has not.

### Under the hood

- The guide's new line on the search and the **Ways** staying under the top bar leaves out the services button in Erevos Lite, which has none, and What's new no longer names that button in its line on them, in any edition.

## 3.0.0-rc.1 (2026-11-23)

### For you

- On home, the search and the **Ways** line stay under the top bar with the services button while the list scrolls
  (`app/index.tsx` `pinned`), so a search or another way out is a tap away from anywhere in the list; the guide says
  so. Requested by the maintainer.
- Phone: a SIM call that rings on a locked phone, or with its screen off, wakes the screen itself and keeps it on,
  bright, while it rings (at most a minute; `CallService` `wake`), as Erevos's own calls already do: on some phones it
  rang with a black screen that could not be answered. A call that rings while **Call ended** still shows now shows at
  once. Requested by the maintainer; the cause is not proven (no log), and it is not yet tried on a phone.

### Under the hood

From an AI-assisted code review, each finding checked in the code:

- A restore that cannot delete what the backup did not have, after it wrote everything else, puts the phone back as it
  was instead of saying it failed with the backup's lock already in place (`lock/backup.ts`, BACKUP-03).
- Relay: a ticket gives no more places once it expires or is revoked, also on a connection that opened with it before
  (`lend.rs` `borrow`, LEND-02).
- Relay: a lent token's queue or file that then fails (the relay full, a write that failed) is given back for the day,
  so a failure costs no place (`server.rs` `lent_give_back`, `Lend::give_back`, LEND-04).
- Relay: a message held for later that is taken back, one that went, and a deleted file chunk stay gone after a power
  cut (the folder is synced after each delete, STORAGE-02).
- Relay: a message held again for later under an id already held stays with the phone that held it first
  (SCHEDULE-02).
- Checks: wrong passwords tried from two browser tabs at once count one at a time, and a lockout reached while checks
  wait in line holds; what a relay restart keeps of a queue (its owner only in memory, on purpose) and the sender and
  recipient roles after it.

## 3.1.0-beta.2 (2026-11-23)

The first Erevos+ as an app of its own, `app.erevos.plus`, beside Erevos and Erevos Lite. It takes the
last number of its generation, as Erevos 3.0.0-beta.2 and Erevos Lite 3.2.0-beta.2 do, so there is no
3.1.0-beta.1. Erevos+ 7.x moves to it through the bridge, 7.3.1, with its networks signed in.

### For you

- Erevos+: Messenger in its case tells of new messages, as the maintainer chose: the engine now runs in the case's way too (`lib/messenger-store.ts` `startOne`, `msgSetMessengerWay`), only to hear what comes, even if the case was never opened. A chat with messages not read shows on home until it is read (`msgCaseOnly`, `app/index.tsx`), and tapping it opens it in the case at that chat (`components/chat-row.tsx`); while the case shows, nothing is told (`counted` skips while `caseOpen`), as the page shows it. Requested by the maintainer.
- Erevos+: Messenger in its case wears Erevos's whole look on Meta's page itself, not only in its bar (`lib/messenger-case-look.ts` `messengerCaseLook`, sent with the bar's colours through `webPagesLook` and painted by `WebPages.dress`/`repaint`): Erevos's colours over Meta's own CSS variables, Meta's dark or light set as Erevos is (`__fb-dark-mode`/`__fb-light-mode`), the accent on buttons and on our own messages (deepened until Meta's white words read on it); the look's text size (the web view's `textZoom`); the bubbles' shape, square, line or lit (Meta's bubbles found by their fill and marked `erevos-mine`/`erevos-theirs`); the style's own letters (Inter, Inter Tight: `lib/messenger-case-fonts.ts`, served to the page from the phone at `__erevos/font/`, never fetched) or the look's serif or monospace; and what lies behind the screens as CSS layers (`caseBackdrop`: Nocturne's glow, the glass's wallpaper and haze, Neon's grid, Matrix's rain, Paper's lines, Aurora's light, the wallpapers), the page's grounds see-through over it. A photo of one's own stays in Erevos (a gradient of the accent instead). An open case takes a changed look at once. Only colours go into the page's CSS. Variable names Meta does not use do nothing, so parts Meta draws otherwise keep Meta's look. Requested by the maintainer.
- Erevos+: Messenger in its case asks for the PIN of the encrypted chats once, not at every opening: the case's page now has a web view profile of its own (`MessengerCaseActivity` `kept`, androidx.webkit `ProfileStore`, feature `MULTI_PROFILE`), apart from every other page, whose storage and cookies stay between openings; before, all of it was wiped as the case closed, so Meta saw a new computer each time. It is wiped when Messenger signs out (the `logout` op, or signed out on the page) and when another account (`c_user`) opens the case. Where the web view has no profiles, nothing stays, as before. Requested by the maintainer.
- Moves between editions carry Erevos+'s networks, as the maintainer chose after the code review: what the engines keep outside the backup goes too (`erevos-device` `MoveNet.kt`), each module naming it in its manifest (`erevos.move.carry.*`): Messenger's, Signal's and Session's folders, their Keystore-sealed keys (`signal/db.key`, `session/data.key`) opened and sealed again with the new app's own key, and each space's TDLib database (not its media, which downloads again). Nothing of it waits on the phone: the app moved to reads it through the move's provider, only once the old app moved out and from a process of it in which no engine ran (an older one is ended and asked again), whole or not at all (an `end` entry and the pipe's error), and only where it carries the same itself; it goes in place after the backup restored, or at the next start when an engine was open (Erevos says why and asks again should it not go: `placeCarried`), while the old app is told the move was taken as soon as the backup restored, so it never goes stale and opens again. Engines refuse to open in an app moved out or with a carry waiting, and an app moved out ends its process as its screen is left (the other edition's package is downloaded and checked before the move is made, and Android's installer shows only once this app moved out, so that screen shows from the start), so Signal's and Session's engines, which cannot stop by themselves, run on there no longer; what they took in meanwhile is in their folders and goes with the move. Should the engines' part not come, the move changes nothing and says that Backups by hand would leave those accounts behind (Session's 13 words). Matrix goes on as the same device after a move (`lock/restored.ts` `markMove`). Moving from Erevos+ to Erevos or Erevos Lite says first that those accounts stay in the old Erevos+, and to write down Session's 13 words. Requested by the maintainer.
- Erevos+'s bridge (7.3.1) shows what is new under its own number, not «Not out yet» (`extra.bridge`, `whatsNewFor`). Requested by the maintainer.

### Under the hood

- Releases: Erevos+ from 3.1.0 is built as `app.erevos.plus` and published under `erevos-plus` and `erevos-plus-beta`, with its Android app named in `version.json` (`package`); with **bridge** on, `erevosgram.yml` builds it as `app.erevos` (`EREVOS_BRIDGE=1`) and publishes it under `plus`, where the Erevos+ 7.x apps look, titled "(bridge)", never a beta, without the web app, and never deleted with the older releases. The APK's package is checked before it goes out. Requested by the maintainer.

## 3.2.0-beta.2 (2026-11-23)

The first release of Erevos Lite, an Android app of its own (`app.erevos.lite`): Erevos's own chats and calls,
without the Phone, the SMS, the Collection or Fasouli. It is Erevos 3.0.0-beta.2 otherwise, with what is below;
Erevos and Erevos+ have no release of this number.

### For you

- **Erevos Lite**: Erevos's own chats, groups and calls, end-to-end encrypted, in an app of its own, with no Phone, SMS or Collection and none of their permissions. It moves to Erevos or Erevos+, and they to it, under **Updates**.

### Under the hood

- **Erevos Lite** as an edition of its own (`EREVOS_EDITION=lite`, docs/editions.md): Erevos's own chats and calls alone, the Android app `app.erevos.lite`, versions 3.2.x, released by hand with `.github/workflows/release-lite.yml` to `azzinder/erevos-lite-releases`. The Phone's and the SMS's native modules are left out of its app (`app/plugins/with-edition-modules.js`), and with them every permission of theirs; the Collection is not offered, though its native module stays for opening chat files with another app; its first start has no step for the modules, Settings no Modules, the widget and the launcher icons no Phone or SMS, and its guide and What's new leave them out, What's new under its own 3.2.x numbers. It has no payment requests of Fasouli's either: a request a contact sends shows as its words. Its guide says only what Lite has, in every language: what only the other editions have is marked in the guide's text (`{~…}`, `[~]`), down to a contact's history, which in Lite is its messages alone, as it may not read the call log.
- The plain Erevos is built as `EREVOS_EDITION=erevos`: `lite` was its name until 3.0.0 and is Erevos Lite's now. Every workflow says `erevos`; `scripts/reproduce-apk.sh` and `scripts/reproduce-web.sh` still build a commit from before with `lite`, and `reproduce-apk.sh` also checks Erevos Lite's releases.

## 3.0.0-beta.2 (2026-11-22)

3.0.0-beta.1 went out without its Android app and its Sailfish package, which did not build; 3.0.0-beta.2
brings them, with everything 3.0.0-beta.1 changed.

### For you

- A new password, or PIN of hidden chats, that is short is taken only after **Use it anyway**, under the word of care it already had; the guide says a backup and its password let anyone try short ones too.

### Under the hood

- Phone: whether a SIM has a voicemail number is read through that SIM's own telephony service, which every
  Android has; the Android app of 3.0.0-beta.1 did not build without it.
- SMS: the notice of an SMS that came, with who wrote and what, builds on Android again (the sender and
  the words are read once, so Kotlin knows neither is missing).
- Releases: the Sailfish RPM of a 3.x version, which carries an Epoch, no longer fails after it is built, when
  the SDK finds no package of that name to check.
- Every check of a password or PIN (lock screen, search on the home screen, the hidden chats' door, chat PINs, the lock settings) runs one at a time, in a browser across all its tabs too, and counts as wrong before its slow keys are made: tries sent all at once, or cut short, each count (lock/tries.ts countedCheck).
- A backup file asking more than twice Erevos's own key cost (Argon2id over 64 MiB or 6 passes, PBKDF2 over 1,000,000 rounds) is refused before its password is tried.
- A restore that cannot write all of its files and keystore entries (a full phone) puts back what the phone held, instead of leaving half of each, and removes the photos and files it had brought.
- Relay: sign-in with an OpenID provider also checks the ID token's `exp` and, when it names other audiences, `azp`; lending refuses a place or quota while its counts cannot be written to disk.
- Releases: `npm audit` fails the checks on high advisories too; the web publish on the release computer signs the release's SHA256SUMS too (SHA256SUMS.sig beside the web app, `node pwa/release.mjs verify-sums`), and `deploy/web/publish-sums.sh` signs it again after a package added later (macOS, a missing APK) rewrote it.
- Checks: a first packet sent again after a restore, once its id is no longer kept, never takes the place of the conversation the chat sends in nor where it sends; one a contact really starts with a clock gone back takes over only once they write in it; and when a first packet counts as old (`staleFirst`), whatever its time or none.

## 3.0.0-beta.1 (2026-11-22)

### For you

- **Updates** offers three editions, **Erevos Lite**, **Erevos** and **Erevos+**, each an Android app of its own (`app.erevos.lite`, `app.erevos`, `app.erevos.plus` from Erevos+ 3.1.0). Choosing another is a move: this Erevos makes an encrypted backup of everything into a folder of its own for moves, Android installs the other app beside it (downloaded and checked as an update, or already there), and the other app, opened within a day, asks to bring the chats and restores them; nothing leaves the phone, and a move not taken within a day is deleted (`lib/edition-move.ts`, `lib/move-note.ts`, `lib/move-state.ts`; the first-run screen and **First steps** offer it, and an app set up already asks at its start, warning that it takes the place of everything there). From the moment the move is made, the app moved from opens no space and receives nothing, in the background too, showing only the move with **Call the move off**; once taken, **Delete everything here** and **Uninstall** (`components/moved-out.tsx`). A move not taken within a day is deleted at the next start; the free room is checked first. The app moved to asks to be the SMS and phone app when the one moved from was (`roles` in move.json), and both screens of the app moved from say so; should the app moved from not hear that its move was taken, it is told at the next start. Erevos+'s bridge (app.erevos) moves from plus to plus, which only it may (`moveFor`). The phone's SMS and calls stay in Android's stores. Requested by the maintainer; not yet tried on a phone.
- **Make a backup** says in its card what it does (gathering, encrypting and saving) and how far it is, with a bar, instead of only at the foot of the screen; when the backup is saved, a notice says so (`modules/erevos-device` `Backups.kt`, `lib/backup-notice.ts`), as it can take minutes. Requested by the maintainer.
- The Collection's camera: where the phone's maker offers them through CameraX Extensions, as on a Pixel, **Night** and **Portrait** beside **Photo** and **HDR on** at the top, made on the phone by its own system; a tap focuses and meters there; **Darker** and **Brighter**; zoom buttons for the wide lens (0.5×), 1×, 2× and 5× where the phone has them, and two fingers between; a timer of 3 or 10 seconds, a grid, a silent shutter, the light on while filming, HD, Full HD or 4K, and **HDR video on** (HLG, 10-bit) where the phone films it. Not yet tried on a phone.
- SMS: **MMS** under SMS settings: fetched at once (on by default) and while roaming (off by default); one not fetched waits in its conversation, and under MMS, with its size and **Fetch (may cost)** (MmsStore keeps the carrier's notice). Not yet tried on a phone.
- SMS: quick texts, held **+** or **Quick texts** in an SMS conversation: the app's own until the owner adds or removes one, then theirs, kept encrypted with the space's SMS data (components/sms-quick.tsx). Not yet tried on a phone.
- SMS: a reaction an iPhone or Google Messages sends by SMS in English (Liked “…”, Reacted 😂 to “…”, Removed a like from “…”) shows as its mark under the message it names instead of a message of its own (lib/sms-reactions.ts); one whose message is not found stays. Not yet tried on a phone.
- SMS: videos by MMS: **+** → **Record a video** asks the camera app for MMS quality (EXTRA_VIDEO_QUALITY 0, 30 seconds), **Video from the phone** takes one already under the MMS size; one that comes shows ▶ and plays in the phone's video app (MmsStore keeps video/* parts). Not yet tried on a phone.
- SMS: **What an SMS says, on its notice**, off by default, shows who wrote and what on an SMS's notice while the space is open, with Reply (a plain SMS on the SIM it came on, Erevos locked too) and Mark as read (NoticeReply.kt); told to the phone in memory only, and never for one with a one-time code. Not yet tried on a phone.
- SMS: a longer SMS shows over the field how many letters it has and how many SMS it goes as (GSM alphabet 160/153, UCS-2 70/67, counted as the phone company does), and **Without accents (cheaper)** under SMS settings, off by default, sends a plain SMS without accents and Greek in capitals when that keeps it in the GSM alphabet (lib/sms-count.ts). Not yet tried on a phone.
- Phone: the spam list can come again by itself each week from the same address, with Erevos unlocked and through Tor when the space's Tor way is on; off by default, with the internet address warning when switched on without Tor. A server that does not answer is asked again a day later. Not yet tried on a phone.
- Phone: for a number that is none of the contacts, the call screen says where it is from (country and flag, the place of a landline) and its kind (mobile, landline, free, premium rate), read on the phone from the number alone with libphonenumber 9.0.43 and its geocoder 3.43. A spam list the owner downloads whole from an https:// address of their choosing (no default) is matched on the phone, with numbers they report themselves from Recents; listed calls show **Possible spam** and can be silenced through call screening, never a contact's. No number is ever looked up anywhere; without Tor, Erevos warns that the list's server sees the phone's address first. Not yet tried on a phone.
- The phone company's video calls (ViLTE), where the SIM and network carry them: a video call that rings shows **Answer with video** (`Calls.answerVideo`, `VideoProfile.STATE_BIDIRECTIONAL`) and **Audio only**; in the call, Telecom's `VideoCall` draws the other side full screen and the camera in a corner, with **Camera off** and **Switch camera**; an audio call that both sides can turn to video shows **Video**, and the other side's asking is answered with **Turn video on** or **Keep to sound** (`CallVideo.kt`, `CallActivity.kt`). The camera's permission is asked at the first use; without it the call stays audio. **⋯** beside a typed number offers **Video call** when a SIM has `CAPABILITY_VIDEO_CALLING` (`modules/erevos-phone` `videoCalling`, `placeVideoCall`, `app/phone.tsx`). Requested by the maintainer; not yet tried on a phone, and only a network with video calls can try it.
- A conference call's screen lists its people instead of the photo, each with **Separate** (`Call.splitFromConference`) and **End** (`disconnect` of that person's call), shown only where Telecom gives the call `CAPABILITY_SEPARATE_FROM_CONFERENCE` or `CAPABILITY_DISCONNECT_FROM_CONFERENCE` (`CallActivity.kt` `showPeople`; words in the eight languages, `Words.kt`). Requested by the maintainer; not yet tried on a phone.
- **Speed dial** on the Phone: held on an empty keypad, 2 to 9 call the number put on the key (`app/phone.tsx` `speedDial`); a key with none offers to choose a contact or a typed number (`components/speed-dial.tsx`), and **Phone** → **Settings** → **Speed dial** shows the eight keys to change or **Take it off**. Kept sealed with the space's phone data (`lock/phone-data.ts` `speed`, `lib/phone-sims.ts` `setSpeed`), so it works with Erevos unlocked only. Requested by the maintainer; not yet tried on a phone.
- **Call settings** under **Phone** → **Settings**, for each SIM: **Forwarding, waiting and your number** opens Android's own call settings (`com.android.phone` `CallFeaturesSettingActivity`, else `TelecomManager.ACTION_SHOW_CALL_SETTINGS`) and **Voicemail number** its voicemail settings (`ACTION_CONFIGURE_VOICEMAIL`), with the SIM's account (`modules/erevos-phone` `openCallSettings`). Under **Ask your phone company**, buttons dial the network's codes (3GPP TS 22.030: `*#21#`, `##002#`, `*#43#`, `*43#`, `#43#`, `*#31#`) on that SIM, and the network answers in Android's message (`app/phone-settings.tsx` `CallSettings`). Requested by the maintainer; not yet tried on a phone.
- Voicemail on the Phone: on an empty keypad, holding **1** (marked oo) calls the voicemail of the SIM chosen above **Call**, else the default one, through Telecom's `voicemail:` address; a SIM with no voicemail number says so instead (`modules/erevos-phone` `callVoicemail`, `hasVoicemail`). Where the phone company sends visual voicemail, a **Voicemail** tab lists Android's voicemails (`VoicemailContract`, which the phone app may read), with the transcript when one came: **▶** plays one straight from Android's store and marks it heard, and the row offers **Call back**, **Send an SMS** and **Delete this voicemail** (`Voicemail.kt`, `app/phone.tsx` `Voicemails`). Never shown with Erevos locked; Erevos keeps no copy. Requested by the maintainer; not yet tried on a phone.
- Emergency calls from the Phone: an emergency number (Android's `TelephonyManager.isEmergencyNumber`, with 112 and 911 always) is called at once on the SIM Android picks, never asking **Call on** which nor kept for the number (`modules/erevos-phone` `isEmergency`, `app/phone.tsx`). With Erevos the phone app and locked, the password screen has **Emergency call**, which opens Android's own emergency keypad with no password (`emergencyDial`, `lock/gate.tsx`). Reported by the maintainer's review of the Phone; not yet tried on a phone.
- **Delete the original from the gallery after importing** deletes more of what it should: a photo or video picked from the phone's storage, whose link Android maps to the gallery's files table, was taken for no photo of the gallery and kept; it is now asked for too. One picked through the photo picker is found in the gallery by its id, and asked for only when its name and size there match (`modules/erevos-collection` `galleryUri`, `pickedInGallery`). When Android still does not say which photo it is, or cannot delete it, the Collection says so under the list instead of nothing (`lib/collection-import.ts`). Reported by the maintainer; not yet tried on a phone.
- On home, the services button stays under the top bar while the list scrolls (out of the list's header into the fixed part, `app/index.tsx` `servicesBar`); the search, **Ways** and **Invite** still scroll with the list. **Names** (SMS names from the phone's contacts) shows only on the **SMS** part, no longer on **All services**. Reported by the maintainer.
- On the **SMS** part of the chat list, the button at the bottom is **New SMS** and opens only a new SMS, also with Erevos's own chats on; it opened New chat's Erevos steps there unless Erevos was off (`app/index.tsx` `newChat`). Holding it still opens the hidden chats' PIN. Reported by the maintainer.

### Under the hood
- The core's `url` crate is 2.5.9 (with `form_urlencoded` 1.2.3): 2.5.8 could overflow the stack on a URL of nested `blob:` addresses (RUSTSEC-2026-0592), which `cargo audit` in the rust check now refuses.
- The Collection's camera says what went wrong in the owner's language (not opened, stopped, not ready, the photo or video not taken or not kept): the camera's own English words, from Android, showed before (`cameraTrouble` in `components/erevos-camera.tsx`, `troubleOf` in `lib/camera-controls.ts`). From the review of 8a88072 (Υ1).
- What the Collection's camera left unencrypted in the app's cache, when Erevos stopped before keeping it (the battery ran out, Android stopped it while recording), is deleted as Erevos starts (`lib/camera-cache.ts`). From the review of b379943f (Τ12).
- Only 3.x to 6.x go after 7.x in a release's order and in GitHub's latest; 8.x and on come after them, and 1.x and 2.x stay before 7.x (`order` in `release.yml`, `laterThan`). The Sailfish OS RPM and the Arch Linux package keep epoch 1 for every major from 3 on but 7, so 8.0.0 also installs over 6.x. From the review of b379943f (Τ11).
- **Phone settings** says, under the spam list, that the list, its address, its switches and the numbers reported stay on the phone outside the spaces, not encrypted, so a call is checked with Erevos locked too. From the review of b379943f (Τ10).
- As the space locks, an SMS notice showing who wrote and what, with **Reply**, becomes a plain **New message** at once, without a sound; before, only the next notices did (`SmsStore.setNoticeDetails`). From the review of b379943f (Τ8).
- **Turn and crop** in the Collection takes a photo's sides from the image once shown when the Collection does not know them (HEIC, WebP, GIF, AVIF): it took such a photo as square, and the frame dragged did not match the picture (`components/collection-edit.tsx`). From the review of b379943f (Τ7).
- An MMS video goes with the type its bytes say (3GP, MP4 or WebM, `lib/video-type.ts`), not always as 3GP, so a phone that gets an MP4 plays it; one the camera app recorded too big says the camera did not keep to MMS quality, instead of asking to record one; and **Record a video** says the camera app keeps the video in the phone's videos too. From the review of b379943f (Τ6).
- The Collection's camera stays open while Android asks for the camera or the microphone: the question counted as leaving Erevos, which closes the camera, so the first time it closed as soon as it was allowed (`components/erevos-camera.tsx`, `whilePicking`). From the review of b379943f (Τ5).
- A waiting MMS stays listed while it is fetched on a tap, and goes only once it came: one that did not come (roaming data off, say) says so and can be fetched again; before, it left the list at the tap and was lost. The SMS list shows **MMS waiting · n** while any wait, also from a number with no conversation yet, and leads to **Settings** → **MMS**; one announced more than 7 days ago, which the carrier no longer keeps, leaves the list (`MmsStore.kt`). From the review of b379943f (Τ4, Τ9).
- The spam list's weekly download goes without Tor only when it was switched on without Tor, after the warning that the list's server sees the IP address; switched on with Tor, it waits while Tor is off, and **Phone settings** says so (`setSpamWeekly`, `spamWithoutTor` in `lib/spam-list.ts`). A weekly download switched on before this asks again. From the review of b379943f (Τ3).
- The phone module asks for the phone's voicemails (`READ_VOICEMAIL`, `WRITE_VOICEMAIL`), which Android gives the phone app: without them the **Voicemail** tab never showed. From the review of b379943f (Τ2).
- Erevos's camera is its own, on Android's CameraX (`modules/erevos-collection` `CameraPreview.kt`), and expo-camera is gone, and with it Google's barcode scanner (ML Kit, Play services' code scanner) and Play services' document scanner, which it brought into the app: they are closed code and F-Droid takes no app with them. A photo is taken into memory and drawn anew there, with its small picture (`CleanPhoto.kt`), never written to the cache; a video is recorded into the cache's folder `Camera`, which `lib/camera-cache.ts` empties as Erevos starts. A check fails if a library of Play services or ML Kit comes back into the build (`checks/no-google.check.ts`). From the review of b379943f (Τ1). The Kotlin was not built before the push: the first build tells.
- Ready for the numbering after 7.x, where the second number says the edition (3.0.x Erevos, 3.1.x Erevos+, 3.2.x Erevos⁻): the release workflows put every 3.x after every 7.x, in a release's order and in GitHub's latest (`order` in `release.yml`, `laterThan` in `lib/version-name.ts`), and the Sailfish OS RPM and the Arch Linux package of a 3.x have epoch 1, so the phone and pacman take 3.0.0 as newer than 7.2.0. Updates already compared build numbers. What's new lists the releases from 7.0.0 on: the older ones (2.x to 6.x, whose names come again) stay here only. Requested by the maintainer.

## 7.3.0-rc.2 (2026-11-21)

Erevos+ with what Erevos has up to 7.2.0-rc.2 (5fb3341f), for Android 8.0 or newer (64-bit). It installs over
Erevos+ 7.3.0-beta.4 and over Erevos, and keeps everything. There is no Erevos+ 7.3.0-rc.1: this one goes in step with
Erevos 7.2.0-rc.2.

### For you

- Messenger chats you mark read stay read (#19): read while Messenger was still connecting (just after Erevos+ starts) they are now kept read and Meta is told once connected; a chat whose last message is yours, sent from Messenger's app or the web, is read; and encrypted chats you read in Messenger's app or on the web are read here too. Reported by the maintainer on Erevos+ 7.3.0-beta.4.
- Erevos+: Messenger in its case fits the phone and shows inside Erevos (FABLE! findings on 7.3.0-beta.4, from the maintainer's Pixel 8 Pro): the page is laid out at the phone's width (`width=device-width`) instead of 900, which a phone squeezed into about 410 so that all was too small; it shows under Erevos's own bar in the theme's colours (`WebPages.framed`, colours from `lib/web-pages.ts` `webPagesLook`), with **←** back to Erevos and **Facebook** to swap to Facebook's feed in the same page and sign-in (and **Messenger** back). The Facebook page wears the same bar. Facebook also has a card of its own in the home **Services** window (`components/services.tsx` `pages`), beside Messenger, when Messenger is signed in on facebook.com. Requested by the maintainer, who chose both places for the feed. The bar's name and its Facebook/Messenger button follow the page wherever it goes (its own links, Back), not only the button's tap (`doUpdateVisitedHistory`; FABLE! F1 on 80076a66).
- The day stands out in every chat: over the first message of each day, in chats, groups (which showed only the time of each message, and now show the day too) and Chat with myself, the day shows in bold on its own chip between two lines (`components/chat-thread-lines.tsx` `DayMark`), as **Today**, **Yesterday**, the weekday within the last week, and before that the weekday and date, with the year once it is another year's (`lib/day-mark.ts`, in the app's language; `checks/day-mark.check.ts`). It took the place of the faint `YYYY-MM-DD`. Requested by the maintainer, from his chosen mockup («Α»).
- The microphone beside the message field can write instead of record: a tap on it opens a menu, **Voice message** or **Speak to write**, ticked as chosen, and what is chosen stays for every chat and group on the device (`lib/mic-mode.ts`, key `erevos.mic`), until chosen again. Held, it then records as before, or opens **Speak to write** listening; it shows the microphone with lines while it writes. A press is a tap until it is held a quarter of a second (`MIC_TAP_MS`), so a voice message starts that much later. With Talkie on, or where nothing can be written out, the microphone only records, with no menu, as before. **Speak to write** under **+** is gone (`components/composer.tsx`). Requested by the maintainer, from his chosen mockup («Γ» with «Α»'s menu).
- **Ways on home**: once a relay is set, the line under the top bar of home is **Ways**, with a dot for each way out of the space (full when it works, faint when it reaches no one now, a ring of dashes when it is off; Tor, which covers others, has none) and, in orange, how many of the space's own messages wait to go; a tap opens **Ways** (`app/index.tsx`, `lib/ways-read.ts` `useWays`, read every 10 seconds and as a way changes, only while home shows). It took the place of «Relay ready · end-to-end encrypted»; before a relay is set, the line says what it still needs, as before. What the Ways screen reads moved to `lib/ways-read.ts`. Requested by the maintainer, from his chosen mockup («Α»).
- Phones nearby are off until turned on: a new switch, **Look for phones nearby**, under **Nearby, with no internet** on **New chat**, starts or stops Bluetooth, Wi-Fi Aware, the same Wi-Fi and Wi-Fi Direct together (`lib/nearby-links.ts` `setNearbyKept`, key `erevos.nearby`, off unless 'on'; the switches under it show only when it is on, and **Ways** says it looks for no phone nearby). A LoRa radio set stays linked either way. With the links on, two phones on the same Wi-Fi took up to a minute for a call to ring (a Pixel's log, 2026-11-20: the Bluetooth advertiser restarted every half second meanwhile); with them off it rang at once. Requested by the maintainer, for 7.2.0-rc.1.
- With phones nearby off, Erevos now says so where it sends the owner to them: the **Nearby phones** row of the home menu reads that they are off and opens the switch, as do **Ways** and the note after a contact is added only nearby (`lib/nearby-links.ts` `nearbyOn`, `/chat?setup=nearby`). Found by the review of 01a2bb53.
- In a video call, our own picture stays in the small window in the top corner once theirs comes, on both phones (`components/call-screen.tsx`): it went to no size at all as it moved from the whole screen to the corner (Android's RTCView, resized, drew it 0×0, a Pixel's log 2026-11-20), so each side saw only the other. Each picture is now made anew as it moves; their picture too, as it comes, and the tiles of a group call as they change size. Our picture stays over theirs with the back camera as well, and in a browser its sound stays muted then. Reported by the maintainer (#20).
- **Ways**, under **Settings** → **Relay and networks**, shows every way the open space's messages go out by on one screen, a card each: the relay (it answers, or cannot be reached now, with its home relay), Nostr (how many of its relays read now), the phones nearby (how many, by which radios, and how many messages of others this phone carries), LoRa, SMS (for how many contacts) and Tor, each with a line under it, full when it works, faint when it is on but reaches no one now, dashed when it is off, and a tap to its settings. Above them, how many of the space's own messages wait to go, an orange dot for each (`app/ways.tsx`, `lib/ways.ts`). When a relay last answered, or could not be reached, is kept in memory for it (`lib/relay.ts` `relayHeard`). Only the space open shows, never its hidden chats nor whether it has any. Requested by the maintainer, from his approved mockup, after a look at MeshSat's home screen.
- **LoRa spare pieces**: a text sent over LoRa in 2 to 16 pieces now goes with spare pieces after them, one for each four pieces, at most four (`E2` frames, `lib/lora.ts`), made by a Reed-Solomon erasure code over GF(256) with a Cauchy matrix (`lib/fec.ts`): any k of the k + m pieces that come give back the text, so one or two pieces lost on the air no longer lose it. The data pieces stay `E1` as before, so an older Erevos reads them as it did and leaves the spares; the cost is about a quarter more air time for texts of several pieces. A single-piece text has no spares. Requested by the maintainer, after a look at MeshSat.
- **Long texts packed before they are encrypted**: a message's plaintext is deflated (`lib/packing.ts`, marker byte `0x01`) when that moves it to a smaller padding bucket (256, 1024, 4096, 16384 bytes), so the gain is for long texts; short ones go as before. Only to contacts whose messages say `zp: 1` (every message now says so; `Contact.packs`), never through a second relay nor to linked devices, which get plain JSON. Unpacking stops at 64 KiB. Requested by the maintainer, after a look at MeshSat.

### Under the hood

- Home reads the ways at most once a second, however often a relay answers, and draws again only when a dot or the count waiting changes (`lib/ways-read.ts` `useWays`). Just after a send, a tap on the microphone opens no menu, so a double tap on **Send** no longer closes the keyboard (`components/composer.tsx`). The day over each day's messages is always in the app's language, English too on a phone set to another (`lib/day-mark.ts`). Found in the review before 7.2.0-rc.2.
- On the web and the computer, a packet that made the core panic no longer stops it for every message after: the core runs there as WebAssembly, where a panic cannot be caught as on Android (`crates/erevos-ffi/src/android.rs` `guarded`) and stops it with a trap. Each call is now guarded (`lib/core-guard.ts`, used by `lib/crypto-setup.ts`): after a trap the core is set up again from the same module (`__wbg_reset_state`, made by wasm-bindgen's `--experimental-reset-state-function`, in `scripts/build-web-core.mjs` and `checks/build-core.mjs`), which loses nothing, as it keeps nothing between calls, and that call fails with a plain error, as a damaged packet does elsewhere (`checks/core-guard.check.ts`). No packet that does it is known.
- No incoming bytes make the core panic: `crates/erevos-ffi/src/no_panic.rs` gives every call that reads what another phone, a relay, a group, Nostr, a pairing or an imported file sent random bytes, and good packets cut short, grown, with bits turned or a length made huge, 400 each in every `cargo test` (`EREVOS_NO_PANIC_ROUNDS` for more; 6000 each found none). A group's own state is left out: it comes only from the phone's own sealed storage, where OpenMLS's memory storage unwraps what it reads. Requested by the maintainer, after a look at Kryfo 0.6.3.

## 7.3.0-beta.4 (2026-11-19)

Erevos+ with what Erevos has up to 7.2.0-beta.4 and after it (65f62d48), for Android 8.0 or newer (64-bit). It
installs over Erevos+ 7.3.0-beta.3 and over Erevos, and keeps everything.

### For you

- A file in a chat (a PDF, say) can now be opened with another app, not only saved: Open in the file's view in Erevos's own chats and next to the file in Telegram, Matrix, XMPP, Nostr, Signal, Session and Messenger chats. The other app reads it through a link of Erevos's own that holds it in memory only, forgotten when the next file is opened or the space locks (`lib/open-with.ts`, `modules/erevos-collection`). Reported by the maintainer on Erevos+ 7.3.0-beta.3.
- A Telegram, Matrix, XMPP or Nostr chat opens at its end again, not somewhere in its middle (`components/network-thread.tsx`): until the thread is moved by hand it keeps following its end, also when Android moves the view by itself as what is in it gets shorter (a photo drawn smaller than the room kept for it); and older messages asked for at the very start, before the chat had gone to its end, no longer keep it at its oldest ones. Reported by the maintainer on Erevos+ 7.3.0-beta.3 (Pixel 8 Pro).
- Erevos+: Messenger in its case: on the Messenger screen, **How Messenger is used here** chooses Erevos's own engine (as before, the default) or the case, Meta's own facebook.com/messages page, as on a computer, in a web view closed in by Erevos with the engine's sign-in. Only Meta's sites load in it; links out open in the browser without Facebook's tracking marks; the sign-in is given to the page only while it shows, and the cookies it ends with go back to the engine; calls work in it (microphone and camera asked for). Through Tor when Messenger goes through Tor, never straight, and then with no calls. In the case the engine stays off: its chats are not in Erevos's lists and are not notified. Requested by the maintainer.
- Erevos+: Messenger in its case, Facebook's page and a service's sign-in page close as the space locks or closes and with the panic button, and keep out of screenshots and the recent apps preview whenever Erevos's own screen does (`WebPages.kt` in modules/erevos-messenger, `lib/web-pages.ts`); what such a page left in the web view when Android ended Erevos with it open goes as the engines open; only Meta's own pages in the case get the microphone and camera; and the guide tells of the case, in all its languages. From the review of e4599e20.
- A hidden contact's call, where the hidden chats receive while closed, is answered with **Answer** and no PIN: the call shows no name and no face, and the hidden chats run only for it, out of sight, and close as it ends (`components/hidden-ring-screen.tsx`, `app/chat.tsx` `callOnly`, `CallPlace.nameless`). The small sign and the PIN still open them and answer there. Hidden chats that only ring while closed have no key before the PIN, so there **Answer** still asks for it. Requested by the maintainer, who chose no name.
- After **Answer** with no PIN on a hidden contact's call, the nameless call screen shows at once, saying **Connecting…**, with **End**, until the call comes (`components/hidden-ring-screen.tsx` `HiddenCallWaiting`): only the backdrop showed, with no way to tell whether it took, up to 75 seconds when the caller had hung up. **End** closes the hidden chats at once. Found by the review of 83d03391.
- **New chat** asks over your QR code whether the other person has Erevos: **Has Erevos already** shows your QR code as before, saying it works only when both phones have a relay; **New to Erevos** shows an invite on the card itself, with **Share the invite** and **New QR code**, which brings in someone new or someone whose phone has no relay. The choice is kept on the phone. It replaces the **No Erevos yet?** row (`components/connect-cards.tsx` `MyQrCard`, `components/welcome-invite.tsx` `inline`, `app/chat.tsx`). Requested by the maintainer, from his approved mockup.
- The Phone's **Keypad** lists the contacts what is typed finds in the room over the number (`app/phone.tsx` `listHits`, `hitList`), all of them, scrolling if more; where the keys at full size leave no row there (a small screen), the line over the keys shows the first and **N more** as before. Each key 2–9 shows its letters in the app's language, Greek for Greek, Latin for the others (`lib/phone.ts` `keyLetters`), the same a name is found by. Requested by the maintainer.
- A call that rang at last no longer stays at **Connecting** on both phones: Android's WebRTC 155 said it had found every address to try before it had looked at the phone's networks, so the offer and the answer went with none, and neither phone had anything to try. They now wait for the addresses, at most 5 seconds as before (`lib/call.ts` `describedSdp`, for group calls too). Reported by the maintainer.
- Imported chats a contact shares with you, from a relay your Erevos does not take from by itself, show how far they have come once you tap their line (**Coming, 40%**), and **Did not come · tap to try again** if they could not be taken, where the line went on asking for a tap with nothing to show (`lib/share-rounds.ts` `keepPack`, `app/chat.tsx`). The phone also gives two short buzzes when they, or a photo or file you tapped, did not come (`lib/haptics.ts` `failed`), and, as for a file, says first that taking them from there without Tor shows that server your internet address. Reported and requested by the maintainer on two Pixels.
- The phone that shared imported chats says so too as the other phone takes them after a tap there: **Sharing · their phone is taking it**, or **it did not come to their phone; they can tap it to try again** (a quiet signal, `taking` in `lib/chat-parts.ts`, kept by `lib/share-rounds.ts` `takingCame`; an Erevos from before takes no notice). Requested by the maintainer.
- Fixes from the review of e71025a7: **Open** goes by the file's name when it says what the file is (an «invoice.pdf» said by its sender to be a web page opens as a PDF, not in the browser), never hands web pages, drawings or app packages to another app (they could reach the internet outside Tor, or install), and asks first each time, as the Collection does (`lib/open-type.ts`, `lib/open-with.ts`, `checks/open-type.check.ts`); in the web and desktop apps a Telegram, Matrix, XMPP or Nostr chat read away from its end no longer jumps to it as older messages load, where no drag is ever told (`components/network-thread.tsx`); the sharer's **their phone is taking it** goes back after 15 minutes with no word, and a miss said in the same moment wins (`lib/share-rounds.ts` `TAKING_STALE`); the guide, in 8 languages, and What's new tell of **Open**, of the shared chats' lines on both phones and of the calls that stayed at **Connecting**. Reported by the review.

### Under the hood

- `MessengerCaseActivity` (modules/erevos-messenger, `messengerCase`), `messengerWay` kept sealed with the first space in `lock/msg-own-data.ts`, `msgSetMessengerWay` and `openMessengerCase` in `lib/messenger-store.ts`. A sign-in from before, made on messenger.com, is asked to sign in again before the case opens.
- The Rust check passes again with Rust 1.99's clippy (`crates/erevos-core/src/voice_shift.rs`): `is_multiple_of(2)` and `as_chunks::<2>()` in place of `% 2` and `chunks_exact(2)`, the same samples. Reported by the maintainer.

## 7.3.0-beta.3 (2026-11-18)

Erevos+ with what Erevos has up to 7.2.0-beta.3, for Android 8.0 or newer (64-bit). It installs over Erevos+ 7.3.0-beta.2
and over Erevos, and keeps everything.

### For you

- Erevos+: a message with a very long run of names, dots or dashes (as one in a public Matrix room) no longer closes the app as its chat shows it (`lib/links.ts` `splitLinks`): its web addresses are found one character at a time, with no repeating pattern inside another, which ran Hermes's pattern matcher out of room ("Maximum regex stack depth reached"). Should a message's words still not read, they show as they came, what is hidden staying hidden (`components/linked-text.tsx`). Reported by the maintainer on Pixel 10 Pro with Erevos+ 7.3.0-beta.2.
- A Telegram, Matrix, XMPP or Nostr chat that opened at its last message no longer moves by itself to other messages as older ones come in above (`components/network-thread.tsx`): read away from its end, what was in view stays, moved down by as much as they take, as the Matrix chat already did; a short thread, all of it in view, counts as read at its end, so it stays there as the older messages come. Reported by the maintainer on Erevos+ 7.3.0-beta.2 (Telegram).
- Erevos+: a Messenger chat marked read stays read (`messenger/core` `readHere`, `unreadAfter`): the engine keeps on the phone up to when each chat was read here, marked read or written in, and a chat Meta sends again with an older read mark (an encrypted chat's is not moved by marking it read; a reconnect or a restart sends every chat again) or a message sent again from before is no longer unread. Reported by the maintainer on 7.3.0-beta.2.
- The web, computer and Sailfish apps no longer say a fingerprint or face can unlock Erevos, which only Android offers: Settings → Privacy and security → Lock and second password reads «Password and second password» there (`lib/settings.ts`), and the first steps leave the fingerprint out where it cannot be turned on (`app/first-steps.tsx`). Reported by the maintainer in the Erevos+ web app.
- A call through the call relay sends its description soon after its first address relayed over UDP (`lib/call.ts` `describedSdp`, `RELAYED_GRACE_MS` 300 ms), not after every address or GATHER_MS (5 s) on each phone, as when the relay over TCP was slow to answer. While such a call is connected, the nearby links are quiet as in the background (`lib/nearby-links.ts`): Wi-Fi Aware, Wi-Fi Direct and Bluetooth looking took the Wi-Fi off its network for moments, likely the gaps heard in the sound; a call direct on the same network keeps them. Their stream shown keeps their picture when their sound comes in a stream of its own (`theirStream`). Reported by the maintainer on Pixel 10 Pro and Pixel 9 Pro; not yet tried on the phones.
- A chat opened while the receiver's look at the relay was under way shows what that look took as soon as it ends (`app/chat.tsx` `showWhole`, `lib/shown-anew.ts`): since the chat no longer waits for it (`relayFree`), a message, mark or reaction it took went into the history but not into the open chat, and showed only when the chat opened again. Found by the review of main 26eabc8b. A call through the call relay that could not connect forgets the call relay's credentials kept (`forgetCallRelays`), so the next call asks anew, as after a new secret there or with this phone's clock far off. What's new no longer says a held message opens its menu from the start: for a moment it may say Erevos is still reading.
- Holding the call screen down shows how the call connects (`lib/call-quality.ts`, `components/call-screen.tsx` `CallDetails`), read from WebRTC every 2 s while connected: of their sound in the last moments, the share lost and the share filled in by the phone (heard as gaps), how many readings had a gap, jitter, the time there and back, the way (call relay or direct, UDP or TCP, Wi-Fi or mobile data), and how long it took to ring and to connect after the answer (`Call.madeAt`, `ringingAt`, `answeredAt`). A tap closes it; nothing of it leaves the phone. Guide in all languages. Requested by the maintainer, to find the gaps in a call's sound over mobile data.
- Another Erevos phone near on the same Wi-Fi no longer slows this one (`WifiAwareLink`): each phone says in its Wi-Fi Aware publish the nonce of its same Wi-Fi link, and one found that is linked on the same Wi-Fi already (`LanLink.linkedTo`) is not knocked on, as Wi-Fi Direct already did; a Wi-Fi Aware network beside the Wi-Fi took it off its network for moments, slowing messages and the relay while the phones were near. Should that link go, the phone is knocked on within 10 s. A send that fails on a Wi-Fi Aware link now closes it, so the next send finds it gone (`nearby.lost`) instead of still taking it as the contact's link. Reported by the maintainer: a message took long to come with the other phone nearby, as if it were better in another city.
- A call no longer asks the relay for its call relay first (`lib/relay.ts` `callRelay`): the call relay's credentials, which last 12 hours, are kept until an hour before they end, and asked for ahead as the receiver or a chat starts looking at the relay (`warmCallRelay`). Over a slow network that ask took up to 4 s on each phone, the one called before it even rang. Reported by the maintainer: a call took much longer than 5 s to start.
- The Phone's **Keypad** shows over its keys a contact what is typed finds (`lib/contacts.ts` `toDialKeys`, `keysOf`, `app/phone.tsx` `HitRow`): by the digits of a number first, then by a word of the name on the keys' letters, Latin and Greek (T9); a tap calls, held down it goes on the keypad, and **N more** lists the others. The line over the keys is always there, so the keys do not move.

- A chat opens at once (`app/chat.tsx` `relayFree`): it no longer waits for the look at the relay that the receiver beside the other screens had under way (`holdReceiver`, `holdPlace`), which sent what waited, receipts, Nostr copies and more, and could take tens of seconds on a slow relay or Tor, while the contact showed as encrypted and holding a message did nothing. The receiver still stops at its next step; only the chat's own looks at the relay and at Nostr wait for that, so no message is taken by both. A message held before the chats are in hand opens its menu once they are, saying meanwhile that Erevos is still reading (`menuWaiting`). The Myself chat's menu is a menu of its own each time too (`components/myself-chat.tsx`), as contacts' chats have been since 7.2.0-beta.2.

- New chat on a phone with no relay yet has **Pair with a code** too, under its QR code (`app/chat.tsx`): the phones meet on public Nostr relays and trade contact links, which needs no relay of one's own; it was left out of the newcomer's screen. New chat also no longer shows the screen of a phone with a relay for a moment before the newcomer's (`loaded`).
### Under the hood

- A text that speaks both of Erevos+ and of the other person's Erevos names each as it is: Erevos+ for this app, Erevos
  for theirs or for what both editions share (`lib/edition-keeps.ts` `KEEPS_SOME`, `lib/edition.ts` `namedFor`), where
  before the whole text kept «Erevos». A translation with another count of the name keeps it as written.
- The release's APK build stops after 50 minutes (`.github/workflows/release.yml`): on 7.2.0-beta.2 the F-Droid APK hung in its last packaging step for close to two hours, which held back the whole release; now the release comes out after at most about an hour, without the APK that hung. The Erevos+ build (`.github/workflows/erevosgram.yml`) stops a hung APK build after 90 minutes instead of 180.
- Calls run on react-native-webrtc 155.0.1 (was 124.0.8): the same JavaScript, and on Android Google's WebRTC M155 built by Jitsi (`org.jitsi:webrtc` 155) in place of M124, about two years newer in its sound, video and network handling, with small fixes in screen sharing and codec choice. Tor runs on arti 0.48 (was 0.47, `crates/erevos-tor`); Rust crates are updated within their versions (`cargo update`, OpenMLS 0.9.2 among them); Expo 58.0.26 (was 58.0.21) with its modules, React 19.3.0, reanimated 4.7.1, worklets 0.13.0 and svg 15.16.0 (the versions Expo 58.0.26 expects, as `expo install --check` asks), quick-crypto 1.1.10, safe-area-context 5.11.1, hls.js 1.7.4 and element-call-embedded 0.28.2, for their fixes. `cargo test --workspace` and `cargo audit` pass as before; calls and Tor are still to be tried on the phones. CREDITS.md and NOTICES.txt anew. Requested by the maintainer.
- No file of the app takes itself back through others any more, which Metro warned of at every start on the DELL (`Require cycle`): `lib/i18n.ts` takes `lib/secure.ts` only when it reads or keeps the language, `toBase64Url`/`fromBase64Url` live in `lib/crypto.ts` (for `lib/device-list.ts`), and what `lib/xmpp-muc.ts` needs of `lib/xmpp.ts` is in the new `lib/xmpp-base.ts`; `checks/import-cycles.check.ts` keeps it so. The swipe back (`components/swipe-back.tsx`) asks expo-router whether there is a screen before as the finger moves, not while drawing, where it may be out of date; and the keyboard's margin (`components/keyboard.tsx`) gives Reanimated its list of what it reads only on the web, where it is wanted. Reported by the maintainer.
- Speech and translation run on candle 0.11.1 (`crates/erevos-speech`, was 0.9.1). It takes zip 9.7, so the seven zip 1.3.1 advisories no longer need letting through `cargo audit` and are gone from `.cargo/audit.toml`. It also brings the tokenizers crate, built without its C++ (fancy-regex, esaxx-rs without `cpp`): Erevos does not call it, so only the app's size grows a little. The speech checks pass and the Android build checks; how fast voice messages are written out and translated on a phone is still to be tried on the Pixel. CREDITS.md and NOTICES.txt anew. Requested by the maintainer.

## 7.3.0-beta.2 (2026-11-17)

Erevos+ with what Erevos has up to 7.2.0-beta.2, for Android 8.0 or newer (64-bit). It installs over Erevos+ 7.1.2
and over Erevos, and keeps everything.

### For you

- **Erevos+ says its own name, with an icon of its own**: the app and its guide say Erevos+ everywhere (`lib/edition.ts`
  `named`, `asEdition`, `guideNamed`), and its icon is Erevos's mark on a purple tile (`brand/`). Where a text speaks of
  the plain Erevos, or of whose Erevos is, it still says Erevos; a release of the plain Erevos is told with Erevos's
  name (`app/updates.tsx`, `app/index.tsx`).
- **Signal: one chat for each person, with their name**: what we send from the phone Erevos+ is linked to goes to the
  chat of the one it went to, not to a chat with ourselves (`thread_of_content`); a person's name comes from the
  profile key their message carries, and is asked again after a failure; someone who wrote to our phone number gets
  our PNI signature with our answers, so their Signal keeps one chat with us (vendored presage
  `send_message_signed`, `pni-signature.json`).

### Under the hood

- The plain Erevos has the even minor numbers from 7.2 on (7.2.0-beta.1) and Erevos+ the odd ones: Erevos+'s What's
  new tells a plain release under its own next one (`lib/whats-new.ts` `PLAIN_RELEASE`), and the home screen's notice
  of a plain release says Erevos's name.
- The checks read the app's words with Erevos's own names (`checks/register.mjs`, `lib/edition.ts` `ownNames`), and
  `checks/edition.check.ts` checks Erevos+'s naming apart.
- Texts that speak of the other person's app, of what both editions share (the Erevos ID, invites, phones nearby) or of
  Erevos's website and releases keep «Erevos» in Erevos+ too: a list of those texts (`lib/edition-keeps.ts`) and, in
  the guide, each such «Erevos» marked `{=Erevos}` (`guide/*.ts`, `lib/edition.ts` `unmarkKept`).
- The check of a place's sealed stars looks only for texts the sealed file can never hold by chance
  (`checks/stars.check.ts`).
- `cargo audit` passes again (`.cargo/audit.toml`): the five zip 1.3.1 advisories (RUSTSEC-2025-0168, RUSTSEC-2026-0367, -0368, -0369, -0429) are let through for now, since zip comes only from candle-core 0.9.1 for .npz and PyTorch files, which never call `extract()`, and speech and translation load only GGUF models checked by SHA-256. Taken out with the move to candle 0.11.
- The release's APK build stops after 50 minutes (`.github/workflows/release.yml`): on 7.2.0-beta.2 the F-Droid APK hung in its last packaging step for close to two hours, which held back the whole release; now the release comes out after at most about an hour, without the APK that hung. The Erevos+ build (`.github/workflows/erevosgram.yml`) stops a hung APK build after 90 minutes instead of 180.

## 7.2.0-beta.2 (2026-11-17)

### For you

- An encrypted Matrix room read or answered on another of our devices is read here too (`lib/matrix.ts` `takeReceipts`, `takeRoom`, `sinceRead`): our own receipt (m.read or m.read.private) and a message of ours from another device raise `readTs`, and the room counts only what others wrote after it.
- A message's menu opens every time it is held (`components/message-menu.tsx`, `app/chat.tsx`, `components/group-messages.tsx`, `components/chat-media.tsx`): each opening is a menu of its own (a new key), and an open menu closes when the app goes to the background, so a menu Android took away unseen no longer keeps the next one from showing until Erevos is restarted.
- New chat is made anew (`app/chat.tsx`, `components/connect-cards.tsx` `MyQrCard`, `InviteRow`): this phone's QR code is on the screen itself as soon as New chat opens (the small contact card where the relay makes one, NFC with it, **Large QR code, for no internet**), with **Scan theirs**, **Share** and **From a photo of their QR code** under it; a field at the top finds a contact among the faces by name, or adds the link pasted into it (in hidden chats, a link only); **No Erevos yet?** opens the invite. The two big buttons, the **or** line and **Add a contact** are gone.
- New chat's small contact QR code is one-time (`lib/sms-link.ts` `onceSecret`, `takeOnce`, `lock/sms-data.ts` `cardsOnce`): a new one each time New chat or My QR code opens, the same while that opening lasts, the older kept 30 days (50 at most) so an answer to one still comes as a request, and only the first answer to the newest makes its sender a contact at once; any later answer, to it or an older one, is a message request, as one to the shared contact card always is. It replaces the window of 2 minutes after the code showed (`cardShown`), which Share's card also opened. The top field says when no contact has the name typed, and the card takes its name from the space as soon as it is open (`linkE2E`).
- The invite for someone with no Erevos yet shows again the one made before while no one took it and it has a day left (`lib/sms-relay.ts` `waitingShortInvite`, `lib/sms-link.ts`, `components/welcome-invite.tsx`), so opening it again no longer spends one of the 5 waiting and 10 a day; **Invite someone else** still makes a new one.
- New chat on a phone with no relay yet starts with **Start with an invite**: **Scan their QR code**, a field for the invite link, a photo of it, and this phone's own QR code under it, for someone with Erevos to scan (messages then go through Nostr, or nearby).
- New chat shows this phone's contact link and QR code at once (`app/chat.tsx` `earlyE2E`, `linkE2E`): they use the space's chats as soon as they are open, not once the receiver's look at the relay under way ends (holdReceiver), which took 10 to 15 seconds.
- A phone with no internet has an Erevos phone beside it that has internet, and carries for others, bring what waits in its queue on its relay (`lib/bridge.ts`, `lib/nearby.ts` bridge frames EVB0/EVB1/EVB2, `lib/relay.ts` `receiveThrough`, `ackThrough`, `readForOthers`): it passes the very relay requests, a take or an acknowledgement of one queue on `/read` with no token, and the relay's replies come back as they are. Only once the owner said yes to that phone, a contact's too (a stranger can pass on a contact's packets), asked once while Erevos is in front; the question holds up no look and is forgotten when the link goes; hidden chats are asked about apart, only while they are on the screen, as a phone reading a second queue learns there may be hidden chats. On the serving side a no for another relay holds for the whole link. The phone asked learns the queue, so the own queue moves with the next look that reaches the relay (`QueueMove.bridged`, move reason `bridge`; hidden chats too). The phone in the middle passes requests to the relay it uses itself, and to another only once its owner said yes, warned that that relay sees its internet address (IP act `bridge`, asked once a link and relay while linked, never waited for), never while its space goes through Tor, at most 120 requests and 2 MB of replies a link in 10 minutes, a reply one message at most; a no goes back at once. Never for a relay reached only through Tor or another relay. A phone offers it while **Carry messages for others** is on and its last look reached its relay.
- Where the space has a password, the Collection asks for it each time it opens, and again once Erevos was away more than 30 seconds, before anything of it is read (`components/collection-gate.tsx`, `app/collection.tsx`); a fingerprint or face works too (`lock/biometric.ts` `confirmWithBiometric`, which never turns it off). Asks for a fingerprint or face first where that is on; picking a photo or file is never time away (`lib/picking.ts`). Wrong passwords count as on the lock screen. Not in a hidden place's Collection, which closes when Erevos is left.

### Under the hood

## 7.2.0-beta.1 (2026-11-16)

### For you

- **Pair with a code** says first, once, that the two phones meet on public Nostr relays, which see the phone's internet address without Nostr through Tor (`lib/ip-warning.ts` `pair`, `components/pair-code-sheet.tsx`); the guide's Who sees your internet address says so too.
- **Sign in at another relay…** under the sign-in card of New chat (`app/chat.tsx` `signInAt`, `lib/relay-signin.ts` `signInRelay`): another relay's address, with or without `wss://`, and the card signs in there, named after that relay's own provider (`EREVOS_RELAY_OIDC_NAME`); one that offers no sign-in, or cannot be reached, says so (`components/relay-signin.tsx`). LPHL's stays the first.
- New chat looks the same every time it opens: the two big buttons at the top, **How you connect now** only while something is missing, and **Your contact link** and **Invite someone** as rows, with no second Show my QR code.
- One scan is all: where your relay lets your phone invite, **Show your QR code** shows an invite, so a phone new to Erevos joins your relay by itself as it scans it, and you are contacts at once. A relay's queue is made by itself, with no **Create my relay queue** to tap, and **How you connect now** says what is missing in plain words.
- The bar at the top stays where it is: on the home screen (the list scrolls under it) and in SMS, Matrix, XMPP and Nostr chats (`useNetworkThread` `withArrows(content, top)`), as in Erevos's own chats. Under the field of a Matrix or XMPP chat only **+** (Attach and more) and the microphone; the chat's settings are under **⋯** at the top.
- Signal, Session and Messenger chats keep their name, calls and **⋯** at the top while the chat scrolls (Erevos+, `components/msg-chat.tsx`); a chat's **Notifications** and **Through Tor** are under **⋯**.
- **Encrypted Matrix chats notify again** (Erevos+): a message from someone else that comes after the chat was last read counts here, even when the homeserver's own count says nothing of it, as it cannot read encrypted messages and many accounts' rules count none in groups (`freshFromOthers`).
- A message request shows only its words until you accept it: its photos and files wait, not taken (`app/chat.tsx` `strangers`), and its links show no preview.
- A photo sent as a file (JPEG, PNG, GIF, WebP, up to 64 MB) goes without where and when it was taken and the phone (`lib/photo.ts` `cleanImage`, `cleanGif`, `cleanWebp`), and a GIF sent as a photo without its comments and XMP. A HEIC or AVIF file, or a photo larger than that, is sent only once the owner says so in a pop-up (`lib/photo-place.ts`).
- A word of care over a message request's first messages (`lib/scam-shield.ts`): asks for a code, PIN, password or money, promises easy money, or a name like a contact's, in all 8 languages, looked for on the phone only; nothing is blocked.
- Tor's **Automatic** bridges (`lib/bridges.ts` `autoRoutes`, `lib/tor.ts` `startAuto`): straight, obfs4, Snowflake, own lines in turn until Tor is ready, the way learned per kind of network (`networkKind` in the call module, new: needs the next build) kept 30 days in the space's settings; **My network is watched** never tries straight; **Check my connection** on the Tor screen.
- **Pair with a code** on New chat (`lib/pair-code.ts`, `components/pair-code-sheet.tsx`): one phone shows 8 digits, the other types them, and each gets the other's contact link. The two agree on a key with the code, CPace on ristretto255 (`crates/erevos-core/src/cpace.rs`, new in the core: needs the next build), meet at a Nostr key made from the first 3 digits on the public relays, prove the same code by tags, and send their links encrypted with that key; 3 wrong codes close it.
- **Change my voice** in a contact's chat details (`lib/voice-change.ts`, `Contact.voice`, kept on this phone only): its voice messages go **Deeper** or **Higher**, the same length, changed before they go by the core (`crates/erevos-core/src/voice_shift.rs`, WSOLA then resampling, which moves pitch and formants together). On Android from Voice.kt's recording (`voiceSamples`, `voiceOpus`: MediaCodec decode, Opus encode, Ogg mux; new native calls, needs the next build), in browsers with WebCodecs' Opus; should the change fail, nothing is sent. Not for the walkie-talkie.
- A word of care under a short new password of a space or PIN of hidden chats (`lib/password-strength.ts`, `PasswordSheet` `warnWeak`, the move to new hidden chats): fewer than 10 characters, or only digits and fewer than 14, says that someone who breaks into the phone's own security could guess it on computers of their own, and that a phrase is far safer. Advice only; StrongBox was looked at for this and left out, as a chip-bound lock would open on no other phone, from no backup.
- **Burner groups** (`lib/public-groups.ts` `endDue`, `Rules.ends` in the MLS rules extension, `PublicGroup.ends`): a public group made with **It ends** after a day, 3 or 7 days; at its time every member's Erevos, the owner's too, forgets it by its own clock, with its messages and files, on its next look at the doors, and the owner's closes its link. Each member is in it under a name and a signing key made for it alone, as in every public group. Older Erevos ignores the end and keeps it.
- **Photo to see once** under **+**, in contacts' chats and groups (`lib/see-once.ts`, FileMeta `once`, always with `hidden`): never drawn in the chat nor listed in its media, not forwarded, saved or put in the Collection; theirs opens once in the viewer, kept from screenshots (`keepPrivate('once')`), and as it closes the phone deletes its chunks and keeps the message as **Photo seen once** (`History.seeOnce`, `Groups.seeOnce`, part `seenOnce`); ours is let go of once marked as come (contacts) or as it went (groups). An Erevos from before shows it as a hidden photo.
- **Threads in a contact's chat** (`app/chat.tsx` `threadRoot`, `components/chat-thread-lines.tsx` `answers`): **Reply in thread** in a message's menu and **n answers in the thread** under one answered show the thread alone, without SMS or imported chats, as a group's does (`threadRoots`, `threadSizes`); what is sent there answers the one answered or else the thread's first message, so an Erevos from before shows answers with their quotes.
- **A voice message in words** (`crates/erevos-speech`, `lib/speech.ts`, `components/speech-sheet.tsx`): **In words** in a voice message's menu, in contacts' chats and groups, writes it out on the phone with Whisper small (OpenAI, MIT) run by our own code on candle (decoder with a key/value cache, 8-bit weights opened as f32), about a hundred languages, the one spoken found by itself. The model (268 MB, `erevos-whisper-small-q8.gguf`, made by `examples/make_model.rs`) is downloaded once the owner says so and checked against its SHA-256 by the core; the sound and its words never leave the phone and are not kept. Android only (`speech` feature of `erevos-ffi`, `speechText`/`speechLetGo` on a thread of their own): needs the next build.
- **Carry messages for others** is on until turned off (`lib/nearby-links.ts` `nearbySettings`: only a kept `off` turns it off), so phones nearby carry each other's sealed messages to their relays from the start; still only to relays on the internet over TLS. One who turned it off keeps it off.
- **Last seen is when they closed Erevos** (`lib/last-seen.ts` `onShownEnded`, `E2E.closeDue`): as a space or a place of hidden chats stops showing, the contacts told while it showed (not in its last minute) are told at once when it closed, by the chat screen while the chats are still open, else by the receiver; under **Say when I open and close Erevos**. `on` is said only while that space or place shows (`E2E.showsNow`), so hidden chats being open no longer shows the space online, nor the other way.
- **Translate** in a message's menu, in contacts' chats and groups (`crates/erevos-speech` `marian.rs`, `spm.rs`, `lib/translate.ts`, `lib/translate-ways.ts`, `components/translate-sheet.tsx`): between Greek, English, German, Spanish, French and Italian on the phone, with OPUS-MT models (University of Helsinki, CC-BY 4.0) run by our own Marian and SentencePiece code on candle, a sentence at a time. Ten models, each language into and out of English (60 to 95 MB each, 826 MB in all, made by `examples/make_translation.rs`); two languages neither of which is English go through English. A model is downloaded from our own server once the owner says so and checked against its SHA-256 by the core (`TRANSLATIONS`); the message and its translation never leave the phone and are not kept. The language is guessed from the letters and commonest words, and can be changed in the sheet. Android only (`translateText`/`translateLetGo` on the speech thread, the two models used last kept open): needs the next build.
- **Camera, to see once** under **+**, in contacts' chats and groups (`app/chat.tsx`, `components/group-media.tsx`): a photo to see once taken there and then, besides one from the photos.
- In Matrix and XMPP chats, the **More** sheet closes as **Starred messages**, **Disappearing messages**, a history tool, **Block** or **Unblock** is used, so what each opens is not under it (`StarredHere` `onGoing`, `ChatTimer` `onChosen`, `HistoryButtons` `onRun`).
- **In words** writes nothing of silence or noise, where Whisper made words up (`crates/erevos-speech/src/whisper.rs` `quiet`, `<|nospeech|>` with the mean log probability, `without_sounds`), and cuts a run of words that goes round in a loop to once (`looping`).

### Under the hood

- A photo sent as a file waits for its copy without where it was taken to be written before it goes (`lib/pick-file.ts`), and a translation or speech model downloaded waits to be moved into place before it is looked for (`lib/translate.ts`, `lib/speech.ts`): expo-file-system's `write` and `move` return promises. `checks/file-calls.check.ts` fails on one not awaited.
- A post-quantum ratchet beside the double ratchet (`crates/erevos-core/src/spqr.rs`, docs/spqr.md): once both phones' Erevos say they read it (`Message.pq`), every message of a contact's chat is also mixed with a fresh ML-KEM-768 secret, a new one every few dozen messages each way, its keys sent in pieces in a field of the same length in every message. A conversation put back from a backup starts it over and the other phone follows. On by itself, no switch; not in groups. New in the core: needs the next build.
- Erevos+ says its own name everywhere: every text and notice, the guide, the home screen's filter, the launcher's icon names and the web app's notices say **Erevos+** (`lib/edition.ts` `asEdition`, `guideNamed`, in `t()` and `plural()`), except where the words speak of the plain Erevos beside Erevos+, and the licence's "Erevos, by azzinder". The plain Erevos is unchanged.
- Erevos+ says its own name and tells its releases as its own (`lib/edition.ts` `named`, `lib/whats-new.ts` `asPlus`): the plain Erevos's releases after 7.0.0 show in Erevos+ under its next release, and Erevos+'s own icons and marks are its own files of the same names. The plain Erevos shows nothing new.
- Video calls over the internet send at most 1 Mbps a picture (`RELAY_VIDEO_BITRATE`): every such call goes through the call relay, so the relay carries about half as much; on a phone the picture looks much the same. Calls direct on the same network are not held back.
- A burner group ends on each phone by that phone's own clock: the owner's phone closes it for nobody else, so one whose clock runs ahead ends it early only for itself (`PublicGroups.endDue`); when it ends is taken only from the rules a phone first reads as it joins, never from a later change.
- Pairing with a code: a 'wrong', or a 'done' whose tag does not hold, which whoever watches the meeting place can write too, no longer ends it on the phone that typed the code; it waits 10 seconds more for the shower's 'done' (`lib/pair-code.ts` `pairGrace`).
- A photo to see once of ours whose arrival mark came before it was kept leaves no encrypted chunks behind on the phone (`lock/history.ts` `add`).
- The speech and translation models are opened anew after a call that failed midway, instead of refusing every call until Erevos restarts (`crates/erevos-ffi` `SPEECH`, `TRANSLATORS`, `clear_poison`).
- Greek says «από άκρη σε άκρη» everywhere; the guide and the burner group's texts in Portuguese are in Brazilian Portuguese where they had slipped.

## 7.1.2 (2026-11-14)

Erevos+ with what Erevos has up to 7.0.2, for Android 8.0 or newer (64-bit). It installs over Erevos+ 7.1.1 and Erevos, and keeps everything.

### For you

- **Chats you have read stay read, on every network** (Erevos+): Messenger, Signal, Session, Telegram, Matrix, XMPP and Nostr chats you have read no longer notify you again of messages already read: not after a restart or a reconnect, not when a chat opens, and not when a service hands out old messages again. Signal's reads go both ways with the phone it is linked to, and a Nostr chat you answer from another app, such as Amethyst, is read here too. A read in the official Session app does not reach Erevos yet.
- Erevos+'s user guide has sections of their own for **Messenger**, **Signal** and **Session**, in all 8 languages: how to sign in or make an account, chats, groups, calls, notifications, Tor and signing out. The **Telegram** section now speaks of Erevos+ instead of the old ErevosGram build, and the plain Erevos's guide leaves all four out.
- The plain Erevos's user guide no longer speaks of Matrix, XMPP and the chats with other Nostr apps: the guide's sources mark what only Erevos+ says (`{+…}`, `{-…}`, `- [+]`, `editionSource`), and Erevos+'s guide reads as before.
- New chat starts with two big buttons, **Scan their QR code** and **Show your QR code**, with the rest under them (`MeetWays`).
- The panic button is first, in red, in the home screen's **⋯** menu, and holding down the lock on the home screen opens it.

### Under the hood

- Erevos+ can have a web app of its own: `pwa/build.mjs --edition plus` makes `erevosplus-web` for erevosplus-web.lphl.nekten.eu, with Element Call at erevosplus-call, kept on the server in `/var/www/erevosplus-web` (`deploy/web/install.sh`), apart from the plain Erevos's. The worker takes only releases of its own web app, so the two never replace each other (`pwa/sw.js`, `docs/editions.md`). `scripts/reproduce-web.sh` builds a web app again in the edition it was made as.
- Read marks per network: `lib/messenger-store.ts` counts as new no message at or before a chat's read mark, its shown last message or the engine's start; Signal's engine keeps reads across restarts and sends and takes read syncs with the account's other devices; Session's keeps the read as a time (`readMs`) written at once, and remembers deleted, unsent and expired messages so a swarm handing them out again adds nothing; Telegram, XMPP (`readAt`), Nostr (`addMessage`) and Matrix (`newSinceRead`) no longer count what was read, caught up with or sent again.

## 7.1.1 (2026-11-14)

Erevos+'s first stable release, for Android 8.0 or newer (64-bit): everything from 7.1.0-beta.5 and 7.1.0-beta.6,
what came after them, and what Erevos has up to 7.0.1, in one. It installs over Erevos and keeps everything.

### For you

- **Tor for Messenger and Signal, and per chat** (Erevos+): the Messenger and Signal screens, before signing in
  too, choose **Off** (the default), **As the space** or **Always through Tor**. Everything of the account goes the
  way chosen, its pictures and files too, and Messenger's sign-in page and Signal's registering, captcha and linking
  as well (through a local bridge into Tor, with the page's peer connections removed): never straight when it must
  not. **Through Tor** under any of their chats, off by default, sends the whole account only through Tor while on.
  Calls do not go through Tor. Signal kept with the earlier switch on stays Always.
- **Tor for your XMPP account, and per chat**: on Android, the XMPP screen, and the one before signing in, chooses
  **Off** (the default), **As the space** or **Always through Tor** for the account: its connection, the look for its
  server (SRV over DNS-over-HTTPS) and its files, never straight when it must not (Always, or the space's Everything).
  **Through Tor** under any XMPP chat or group, off by default, sends the whole account only through Tor while on, as
  one server connection carries all its chats. Calls do not go through Tor, and no link preview is made while the
  account must not go straight. An account kept with the earlier switch on stays Always.
  Before sending while the account does not go through Tor (with **Through Tor** for the chat as the fix), before
  every call and before fetching a file from a server other than your own, Erevos warns once that your internet
  address can be seen.
- **Nostr: Tor as every account, and per chat**: on Android, the **Nostr chats** screen, before a key is made or
  brought too, chooses **Off** (the default, also for keys from before), **As the space** or **Always through Tor**
  for the account: its relays, look-ups, NIP-05 names and file servers, never straight when it must not (Always, or
  the space's Everything). **Through Tor** at the foot of a Nostr chat, off by default, sends that chat alone only
  through Tor, on circuits of its own (its messages, the look-up of where they read, its photos and files), whatever
  the account says; what comes to you follows the account, as one connection reads its inbox for all chats.
- **Telegram: Tor as every account, and per chat**: on Android, **Tor for this Telegram account**, in Telegram's
  settings and before signing in, has **Off** (the default), **As the space** and **Always through Tor**, as every
  account of another network. With Always, or while the space sends Everything through Tor, Telegram is reached only
  through Tor, signing in too, and never straight, not even when Tor cannot connect. **Through Tor** in a Telegram
  chat's info sends that chat only through Tor, and with it the whole account, which has one connection. Calls do not
  go through Tor. The old Telegram **Through Tor** switch, if it was on, is now **Always through Tor**.
- **Erevos+ and Erevos**: one app in two editions from the same code. **Erevos+** has every service: Erevos's own
  chats, the Phone, SMS, the Collection, Nostr, Matrix, XMPP, Telegram (ErevosGram), and now **Messenger**,
  **Signal** and **Session**. **Erevos** has only Erevos's own chats, the Phone, SMS and the Collection, and none of
  the other services' code is in it. Both are the same app on the phone: moving from one to the other keeps
  everything, and what the plain Erevos does not have waits, untouched, for Erevos+. The name under the icon is the
  edition's: **Erevos+** or **Erevos**.
- **Messenger, Signal and Session in Erevos+**, each a module with its own part on home: Messenger signs in on
  facebook.com's own page and keeps only its session, never the password; Signal makes a new account with your
  number (after Signal's captcha and its code) or links to Signal on another phone with a QR code; Session makes an
  account of 13 recovery words or brings one back with them. Their chats show with Erevos's own: text, photos and
  files, answers, reactions, deleting for you or for everyone. They are the phone's accounts and show in its first
  space.
- **Messenger opens Facebook too** (Erevos+): **Open Facebook** on the Messenger screen shows Facebook itself
  (m.facebook.com) with the same sign-in, given to the page only while it shows and taken away when it closes. Its
  Messenger links come back to Erevos's chats; other links open in your browser, out of Facebook's link wrapper and
  without its tracking marks (fbclid, utm_* and Facebook's own), and never through Tor, so the site sees your internet
  address. Only Meta's own hosts load inside. An account signed in on messenger.com before signs out and in again once
  to open Facebook.
- **Messenger, Signal and Session chats send more, and stay read** (Erevos+): **+** sends a photo from your photos or
  the camera, a file or a sticker, and the microphone records a voice message. Your own messages show their words,
  where before some came empty; tapping a person with no Messenger chat yet opens a new one; and chats you mark read
  no longer come back unread when the service sends their messages again.
- **Session calls and groups in Erevos+**: 📞 and 🎥 in a one-to-one Session chat call that person, as the official
  Session apps do (through Session's own servers for calls), on a screen of their own that rings over the lock screen,
  with mute, speaker, camera on or off and flip; a missed call leaves a notification. **New Session group** on the
  Session page makes a group with you as its admin: the people you pick get an invitation and join when they accept
  it. **Group** in a Session group's chat shows its members, who is admin and who is still invited; an admin renames
  it, invites more people, removes someone or makes them admin; anyone can leave. Invitations to Session groups
  and their messages come in as well.
- **Tor for Session in Erevos+**: the Session page has **Tor for this Session account**, Off (the default), As the space
  or Always through Tor, and each Session chat has **Through Tor**, off by default. Through Tor, all Session sends
  (its onion requests, files, signing up and bringing an account back) go through Erevos's Tor first, so not even the
  first Session node sees your address; with Always, or a chat set Through Tor, Session sends nothing rather than go
  straight while Tor cannot connect. Calls do not go through Tor.
- **Signal calls in Erevos+**: 📞 **Voice call** and 🎥 **Video call** in a Signal chat with one person, and Signal
  calls ring in Erevos, with the official Signal apps on the other side too. They are Signal's own calls, made with
  RingRTC, Signal's calling library, end-to-end encrypted as in Signal; they always go through Signal's relays, so the
  other phone never learns your address. Answer, Decline, Mute, Speaker, Camera and Switch, as in Erevos's other calls.
  Group calls are not here yet.
- **Matrix warns before your internet address can be seen**: once per chat before the first message, photo or file
  that can go without Tor, with **Through Tor** to fix it; before a chat's first call, made or answered, as calls never
  go through Tor; before joining a group without Tor, with **Always through Tor** to fix it; and before a link's
  preview fetched straight. Only your own Matrix server sees the address: media from other servers comes through it.
- **Matrix: Tor as every account has it, and links that open**: the Matrix screen, before signing in too, has
  **Off** (the default, now also for accounts signed in before), **As the space** and **Always through Tor**, as every
  account of another network has; each chat has **Through Tor**, which makes the whole account go only through Tor
  (Matrix has one connection for all its chats). Calls never go through Tor. A link in a Matrix message whose words do
  not say where it goes now says it after them, and opens with a tap.
- **Matrix on the shared account Tor** (lib/account-tor.ts): MatrixTor is AccountTor, Off by default; every request,
  sign-in, look-ups, media and files, goes by matrixWayOf (a room's «Through Tor» makes it 'always'), never straight
  with 'always' or the space's Everything; Tor's HTTP in the core, started through lib/tor.ts ensureTor when needed.

### Under the hood

- **Telegram never goes straight as it starts through Tor**: the way into Tor now goes to TDLib with its first
  parameters, before it connects at all, so a first start or sign-in with Tor never reaches Telegram straight; when Tor
  cannot be had, Telegram waits rather than going straight. The account follows the space's Tor setting as it changes.
- **Matrix account's own Tor way** (lib/matrix.ts MatrixTor, MatrixState.tor): 'always' starts Tor through
  lib/tor.ts ensureTor when the space's way did not and never goes straight; 'never' goes straight. No core change:
  the core's Tor HTTP (crates/erevos-tor) was already there. A hidden place's own account has its own way too.
- **Checks**: a muted room of a hidden place's own Matrix account tells of nothing (checks/network-notices.check.ts);
  Matrix HTML links whose words do not open where they go (checks/chat-carry.check.ts).

## 7.0.2 (2026-11-14)

### For you

- The plain Erevos's user guide no longer speaks of Matrix, XMPP and the chats with other Nostr apps: the guide's sources mark what only Erevos+ says (`{+…}`, `{-…}`, `- [+]`, `editionSource`), and Erevos+'s guide reads as before.
- New chat starts with two big buttons, **Scan their QR code** and **Show your QR code**, with the rest under them (`MeetWays`).
- The panic button is first, in red, in the home screen's **⋯** menu, and holding down the lock on the home screen opens it.

### Under the hood

- Matrix chats marked read stay read (`newSinceRead`, shared with Erevos+; Matrix is not in the plain Erevos).

## 7.0.1 (2026-11-14)

### For you

- A ready list of radio stations: **Add a station** adds a country's most listened stations from Radio Browser at once, up to 100 (`radioCountryUrl`).
- A new look to start with: Erevos, newly installed, starts in Glass (Panes), Modernist, System, My color #0EA5E9, text as in the palette, the phone's letters and square messages (`DEFAULT_LOOK`). A look kept before keeps the old defaults for what it lacks (`KEPT_LOOK`).
- **Modules** in the plain Erevos no longer names Nostr, Matrix and XMPP.

### Under the hood

- Every release also carries `erevos-android-fdroid.apk`, the F-Droid build (`EREVOS_DISTRIBUTION=fdroid`), signed with the release key, for F-Droid to compare with its own build of the tag and hand out the signed copy (`docs/reproducible-builds.md`).
- Every copy of Erevos carries its licences: `app/public/NOTICES.txt` holds Erevos's licence, AUTHORS.md and every package Erevos is built from with its licence text (`node scripts/credits.mjs` writes it, `credits.check.ts` checks it). The web export carries it, so the web, computer and Sailfish apps do; on Android the plugin `with-notices` puts it in the app's assets.

## 7.0.0 (2026-11-13)

The stable release: everything from 7.0.0-rc.1 to 7.0.0-rc.10, and what came after them, in one.

### For you

- **Erevos or Erevos+, and betas, in Updates**: on Android, **Updates** now chooses the next update: **Erevos** or
  **Erevos+**, moving from one to the other with everything kept, and **Beta versions**, to join the betas or leave
  them. Erevos+ is published in the same public download repository as Erevos, and each edition and its betas are
  signed apart by the release computer.
- **Radio and TV through Tor**: the Collection's settings on Android have **Play through Tor**, off unless you turn it
  on. On, stations and channels play only through Tor, so they do not see your IP address; TV may stall for a moment.
  Off, Erevos says before the first one plays that its server sees your IP address, with a button that turns it on.
  Before, they always played straight, and the settings said so.
- **A chat no longer freezes before a message sent for later shows**: a message your contact sends with **Send later**
  can come before its time, and shows only then. Until then its chat was marked read again and again without end, so
  it could stop answering: **⋮** opened nothing and **Back** did not leave it until Erevos was closed. Now such a
  message is read once it shows.
- **Matrix, XMPP and Nostr chats are in Erevos+**: Erevos now has its own chats, the Phone, SMS and the Collection,
  and Erevos+ has Matrix, XMPP and the chats with other Nostr apps besides. An account you had on them stays on the
  phone, encrypted, and Erevos says so once in each space; choose **Erevos+** in **Updates** to have it again.
  Erevos's own messages still go through Nostr relays when no relay of yours takes them. On Android, Erevos+ needs
  Android 8.0 or newer.
- **Choose the part Erevos opens on**: under **All services**, hold any card, **All messages** too, and choose
  **Opens first**. Erevos's icon in the launcher, and Erevos started with nothing else to open, then open on it; with
  none chosen, or the chosen one hidden, on **All messages**. Before, the icon always opened the Erevos chats. The
  widget's buttons still open their own.
- **Asked before strangers reach this phone**: an Erevos invite that comes by SMS is answered by itself only from a
  number in your contacts or one you have written to; from any other, Erevos asks first, as the sender of an SMS can
  be made up. A contact's invite to a place on their relay now says first that their relay sees your IP address, and
  is taken only if you go on.
- **Notices in your language**: Android's own notices and screens, new versions, reminders, birthdays, calls, SMS
  codes and the contact picker, now speak German, Spanish, French, Italian, Portuguese and Serbo-Croatian too, not
  only Greek and English. Older Greek subtitles, not saved as UTF-8, now show as Greek on the computer.
- **Video calls on the computer, and the calculator after a wipe**: a video call started or answered on the computer
  now opens its camera. With the calculator in place of Erevos's icon, once Erevos is wiped by the panic password or
  **Clear storage**, the calculator opens Erevos as new and gives Erevos's icon back, where before no code opened it.
- **Last seen starts off**: in a new space, **Last seen** is now off until you turn it on, so no contact sees when you
  last had Erevos open, and you see no one's either. A space you already have keeps it as it was.
- **A chat with a big file no longer closes Erevos**: on Android, opening a chat that held a large file, or one
  shared in many pieces, could close Erevos at once. Now it opens.
- **A hidden service stays quiet**: a service you hide in the **Services** window no longer sends notifications
  or counts on Erevos's icon, as a muted chat; it stays connected. Telegram, whose folders can stand on home, keeps
  telling.
- **Screenshots in hidden chats too, if you want**: hidden chats now follow **Screenshots** in **Privacy and
  security**: on, as it starts, they stay out of screenshots and the recent apps; turned off, screenshots work in them
  as in the other chats. Before, hidden chats always kept them out.
- **Smaller fixes you may see**: a radio station playing through Tor says so under **Now playing**; on Android older
  than 8.0, **Updates** says Erevos+ needs Android 8.0 and stays on Erevos; the palette once named after a site is
  now **Erevos**.
- **Call and Video on a hidden contact's card call**: opened over the contact's own hidden chat, they did nothing, as
  the chat that was to start the call was open already. Now the call starts there, as from the tiles at the top of the
  chat.
- **Choose where a call's sound goes** (Android): with a Bluetooth or wired headset connected, the call screen's
  **Speaker** becomes **Audio output**, which shows where the sound goes now (**Phone**, **Speaker**, **Headphones** or
  **Bluetooth**) and lists them all, a Bluetooth headset by its own name, to choose; in Erevos calls and group calls,
  and in XMPP and Matrix calls on the same screen. A headset connected as a call starts, or during it, takes the sound,
  as in a phone call, and turning the camera on leaves it there; when it goes, the sound goes back to the earpiece, or
  to the loudspeaker in a video call. Before, the call screen had only **Speaker**, on or off, so a Bluetooth headset
  could not be chosen.
- **Nothing goes through Tor unless you turn it on** (Android): **Automatically from your relay** under **Home relay**
  is now off in a new space, as every Tor switch is, so a space no longer takes the relay its relay is paired with as a
  home relay through Tor by itself. Turning it off now also lets go of the home relay it took, the ones you typed
  staying as they are, so Tor does not run for it. Before, it was on unless turned off, and turning it off kept the
  home relay it had taken, still reached through Tor. A space that has it on keeps it on until you turn it off.
- **Your relays first, Nostr only after them**: a text to a contact who reads on Nostr goes through your relay, then
  their home relays, then your home relay, and through the public Nostr relays only when none of them took it, so
  Nostr never holds a text back. Before, it went to the Nostr relays first, and through your relay only when none took
  it within four seconds; a text that goes through Nostr still goes through your relay again should their phone not
  say it came within five minutes.
- **One chat only through Tor** (Android): an Erevos chat's **Details** has **Through Tor**, off unless turned on. On,
  that chat's messages and files go only through Tor, on Tor circuits of their own, whatever the space's Tor way, so
  the relay does not see the phone's address for it and no Tor exit carries it with another chat; they wait while Tor
  starts. Calls do not go through Tor. Hidden chats have it too.
- **One chat only through Tor reaches Nostr too**: a chat with **Through Tor** on in its **Details** now sends and
  reads its Nostr texts only through Tor, and its photos and files on Nostr file servers (Blossom) too, even when the
  space's Tor is **Nothing**; Tor is started for it, and what goes waits for it, never straight. Until the contact
  first writes to the chat's own queue, their first messages come to the space's own queue, which is read the space's
  way. Before, with the space's Tor off, such a chat's texts could reach the public Nostr relays straight, and they
  saw the phone's internet address.
- **Through Tor on your linked devices too**: a chat's **Through Tor** switch (**Details** → **Through Tor**) now
  reaches the account's linked devices, the computer app, the web app and Jolla (Sailfish), and back: switched on or
  off on any of them, it is switched everywhere. On a linked device that chat's messages, files and send-later
  messages then go only through Tor too, on the chat's own circuits, never straight, and so do the copies that go to
  the contact's other devices. The web app, and any build without Tor, sends nothing for such a chat while the switch
  is on; the switch is shown there while it is on, so it can be turned off, with a line that says why. A device still
  on an older version never turns it off anywhere; it learns a change made elsewhere at that contact's next change.
  Before, it was only on the phone where you set it, and the computer and the web app sent that chat as their own Tor
  setting said.
- **Nostr has its own Tor switch**: the **Nostr** screen has **Nostr through Tor**, **On** or **Off**, off unless
  turned on. On, Erevos reaches the Nostr relays and the Nostr file servers only through Tor, starting Tor for it even
  when the space's Tor is **Nothing**; a text that goes there waits while Tor starts. It only adds Tor: with the
  space's Tor on, Nostr goes through Tor whatever it says, and so does a chat set to **Through Tor**. Before, Nostr
  only followed the space's Tor setting, and the screen only said whether it was on.
- **Warnings before your internet address (IP address) can be seen**, each said once, with a **Guide** button that
  opens the new guide section **Who sees your internet address** and, where there is one, a button that fixes it:
  before the first message, voice message or file in an Erevos chat that can go without Tor (**Through Tor for this
  chat** turns that chat's switch on and sends; **Go on** sends and the chat is not warned again); before the first
  message, photo, file or voice message in an Erevos group that can go without Tor (**Cancel** keeps the words typed);
  before a call, which never goes through Tor, unless the contact is nearby on the same network, and under a call that
  rings through a call relay, answered as it is; before fetching a file a contact put on a file server they chose; and
  in every **Open this link?** question, which now says the site sees the address and that Tor Browser hides it. After
  **Guide**, the same question comes back once the guide is closed, and a voice message recorded or a file shared waits
  for it, not lost. Hidden chats keep what was said with them, never in the space's data. Before, none of these said
  so.
- **A Tor switch of their own**: backups to a server, the Collection's server copy, radio and TV lists, link previews
  and updates each have a **Through Tor** switch in their own screen (in a server's card and in the form that adds or
  restores from one, in the Collection's settings, under **Radio and TV lists**, under **Link previews**, in
  **Updates**), off unless turned on. On, that goes only through Tor, starting Tor for it and waiting while it starts,
  whatever the space's Tor setting; nothing goes straight. It only adds Tor: off, it goes as the space's Tor setting
  says. The Nextcloud sign-in follows the switch of the server it signs in for. On the computer and in the web app,
  which have no Tor, a server with the switch on gets nothing; backup pieces given to friends do not carry it. Radio
  Browser's search, playlist and TV-list links and channel logos go through Tor; playing a station or a channel always
  goes straight, so it sees the address. A link preview is fetched through Tor, slower, and a page that sends you on
  elsewhere, or does not let Tor in, gets none; with the space's Tor at **Everything**, previews go only if the switch
  is on. For updates, one switch makes the daily new-version notice and **Check for updates** ask the web app's server,
  which holds the release computer's signature of each update, through Tor, and not GitHub; a new version is told, but
  does not download through Tor, as its package is larger than Erevos's Tor takes: to install it, turn the switch off
  for a moment, or download it from the releases page in Tor Browser. The updates switch is per phone. Before, backups,
  the Collection and radio and TV followed only the space's Tor setting, previews and updates never went through Tor,
  and several screens only had a line saying whether the space's Tor was on.
- **Bare web addresses open too**: t.me/name, example.org/page and other names with a known web ending are underlined
  and tappable in every chat, as Telegram and Signal show them, opened with https:// once shown whole. E-mail
  addresses and file names (photo.jpg) are not links. Before, only addresses starting with http://, https:// or www.
  were.
- **The Public tab says why it shows no Nostr post**: whether the list of people you follow was not found
  (with how each relay answered, as **Show the people you follow** says), or they were found but no relay sent their
  posts, or posts came but none could be shown. Before, with Matrix on too, it said only that no public posts were
  found, which hid a key that follows no one.
- **A new computer links to the end**: a computer that had no relay before linking now reads the queue it makes for the
  link at once, so it takes the phone's answer: linking with the small code finishes by itself, and with the full code
  **They match** shows. Before, the phone waited for **They match** while the computer showed nothing more, as it
  looked only at the relay it had when Erevos started, until a chat was opened or Erevos started again.
- **Sharing into Erevos reaches every service**: **Send to** lists the chats of the space's Matrix, XMPP and Nostr
  accounts too, beside Erevos chats, groups and SMS conversations; words open in the chat's message field, and a photo
  or file goes as soon as the chat opens, up to 50 MB on Matrix and XMPP and 20 MB on Nostr (a larger one stays in
  **Send to** for another pick). A photo or file shared while Erevos was in the background no longer goes missing:
  Erevos locked as **Send to** opened, **Send to** deleted the file as it closed, and after the password it said
  nothing came to send. Now the file waits for **Send to**, which opens again after the password.
- **Search, media, days and export in Matrix, XMPP, Nostr and SMS**: a chat on Matrix, XMPP or Nostr has **Search in
  this chat**, **Media, links and files**, **Go to a day** and **Export chat** at its foot, and an SMS conversation has
  them first under **⋮**, as Erevos chats do. They look only at what the phone keeps: a Matrix chat's kept messages,
  where the search can also **Load earlier messages** from the server; an XMPP or Nostr chat's kept messages; every
  SMS and MMS of the conversation on the phone (going to an older SMS loads the conversation back to it). Nothing typed
  in the search leaves the phone. Photos and files on a network's server are listed and open at their message, where a
  tap fetches them as before, so no server learns which were looked at; MMS pictures show in the grid. **Export chat**
  writes the chat out as for an Erevos contact, after the same warning; a hidden place's chats are not exported. Not
  yet: going to a Matrix day older than what the phone keeps.
- **Styles, cards and video in Matrix, XMPP and Nostr**: the marks for how words look show, with tappable links. A
  Matrix message carries its look to Element and the other Matrix apps (formatted_body), and of what those apps send
  only bold, italic, struck through, code and hidden words show: nothing runs, no picture is fetched. In a group, @
  offers the members (Nostr names them as NIP-27 asks; XMPP writes the nick, as Conversations does). A contact card
  goes as a .vcf any app opens; a video goes with its udta and meta boxes emptied, so not where it was filmed nor on
  which phone; a photo from the camera goes at the quality chosen. Nostr chats send a location as a geo: address and a
  map link. A forwarded message is marked as forwarded on the phone only, in Matrix and Nostr.
- **Starred messages in every chat**: **Star** works in Matrix, XMPP and Nostr chats and in SMS too, as in an Erevos
  chat. Stars are kept encrypted with the space on this device only (not synced to linked devices), a hidden place
  keeping its own apart; **Starred messages** lists those of every chat, the latest first, each opening its chat at
  the message, and a chat's own lists its stars. A held photo, video, voice message or file, or an MMS's picture, has
  **Save to the Collection**, and a sticker or photo that came has **Add to my stickers**; the SMS sticker picker
  offers your own stickers to send as MMS. Stars are in backups. Not yet: stars in an Erevos contact's SMS.
- **Pin and archive any chat**: hold any chat down on the home list, an Erevos contact or group, Matrix, XMPP or
  Nostr, not only SMS, for **Pin to the top**, **Archive** and, on Android, **Mute this chat**. At most 10 pins; an
  archived chat comes back when a new message comes from it, and **Archived** shows them all, SMS too, in place. A
  Matrix pin is m.favourite on the server, so other Matrix apps show it pinned; m.lowpriority rooms come last;
  archiving is local only. Matrix rooms (on this phone only), XMPP contacts (in the roster on the server, RFC 6121)
  and group MMS take names of one's own. A Matrix row shows ✓✓✓ once everyone has read the last message. Pins and
  archive are kept encrypted and are in backups; hidden places keep their own. Fixed: SMS pins were lost when network
  rows were merged into the list.
- **Drafts, Send later, Send again and Remind me in Matrix, XMPP and Nostr chats**: what is typed and not sent stays
  as the chat's draft, on this phone, encrypted with the space (or the hidden place), and shows on its row as an SMS
  draft does. Holding **Send** holds a message to go later from this phone (text only, local, at most 100 per
  account): it goes while the space is open, on Android with Erevos in the background too, or as soon as it runs
  again; one a restored backup brought back past its time waits for the owner. A Matrix or XMPP message that did not
  go now has **Send again** and **Delete** in its menu. **Remind me** on a message of these chats, or of an SMS
  conversation, writes it into Chat with myself with a reminder. Not yet: a Matrix thread's own draft.
- **A PIN and screenshots for Matrix, XMPP, Nostr and SMS chats**: a chat on Matrix, XMPP or Nostr, and an SMS
  conversation, can be locked with a PIN of its own (kept only as Argon2id of it, in the account's or the SMS data,
  encrypted) and have its screenshots blocked, as Erevos chats can: locked, nothing of it is drawn, read or marked
  read, the home list shows only its name with a lock, and the search finds nothing of it. An SMS conversation also
  gets **Chat look**, and, with one number, **Notifications** to mute it or give it a sound of its own (a silent
  "sms-own" channel, the sound played by Erevos), applied only while the space is open, so a closed space shows
  nothing of which conversations are set apart. Hidden places do not offer these. On this device only.
- **Chat rules on Matrix, XMPP, Nostr and SMS**: disappearing messages, as a timer for the chat (5 minutes to 1 week,
  counted from sending, for new messages) or **Disappear** for one message. On Nostr they carry their NIP-40
  expiration, so the other app and the relays that honour it delete them too; on Matrix your own are taken back for
  everyone when due; on XMPP and SMS (Erevos as the SMS app) only this phone's copy goes, and the chat says the other
  side keeps them. **Block** on Matrix (the account's ignore list, in all its apps) and Nostr (on this phone), with a
  **Blocked contacts** list on the Matrix, XMPP and Nostr screens. **Delete** asks **This phone** or **Everyone**;
  deleted here, a message stays hidden if it comes again. On XMPP, **Appear offline** to one contact (RFC 6121
  directed presence, no receipts, markers or typing to them). **Check in person**: photograph the QR code of their
  XMPP app (as Conversations shows it) or of their Nostr key. Timers, deleted-here, the Nostr block and appearing
  offline are this device's own, not synced to linked devices. A starred message that disappears, or is deleted on
  this phone, takes its star along, as in an Erevos chat.
- **Share an imported chat with the other person**: the Telegram, WhatsApp and Viber chats that go on with an Erevos
  contact can go to that contact alone, from the chat's Details or Settings → Data and devices → Imported chats, after
  one question that says how many messages and MB go, whatever their size. All of them go together, every message and
  every photo, video, voice message and file kept, end-to-end encrypted through your relay. The messages go at once, in
  one file; their Erevos keeps them at once in their imported chats, in the same space or hidden chats, linked to you,
  the sides swapped (in a group export everyone keeps their name), in place of a copy shared before. The photos and
  files follow in rounds, each chunk as it is kept: a few dozen MB on your relay at a time, put there as their phone
  takes and deletes the ones before, so a share needs little room there, waits and asks again when the relay is full,
  and goes on after either phone restarts or was offline, while both phones run Erevos. They fill in on their side as
  they come, "Files: 3 of 10" under its line; yours says "Sharing, 40%", and tapped it can stop the share, its chunks
  taken off the relay and what came deleted on their phone, as it is when they delete the chats. Each file can be up to
  4 GB, as an import now keeps them (it kept 1 GB before). Never to a group, never forwarded. An Erevos from before
  shows it as a file, "Chat from Telegram.json", with the messages in it, and no file goes to it.
- **Stickers on other networks**: built-in stickers can go to other apps as a picture (PNG, 512 by 512, clear
  background), drawn on your phone or computer from the sticker's own shapes; nothing is downloaded. In a Matrix, XMPP
  or Nostr chat **Sticker** now offers the built-in sets beside **Mine**, and in an SMS conversation **+** →
  **Sticker** sends one by MMS. A sticker with words carries them in the app's language.
- **One button for all your services**: the home screen's line of chips is now one button under the search, which
  says which service shows, the messages not read and any service not connected now, and opens a window with every
  service as a card, each with its number and a dot for its connection, plus **Add**. Hold a card to move it or hide
  it; a hidden service still notifies, but its chats leave All messages too
  (a search still finds them). With no search the chats with
  messages not read come first, under Unread, then the rest under Recent.
- **Voice messages in Opus**: voice messages are recorded as Ogg/Opus on Android 10 and later and in the web and desktop
  apps, at half the size (about 240 KB a minute) and as clear. Older phones and Safari before 18.4 keep AAC. Every
  Erevos plays both, an iPhone before iOS 18.4 too, and they go to Matrix, XMPP and Nostr as voice.ogg.
- **Mark all as read**: in the ⋮ menu of the home screen, for the part of the list shown (all messages, SMS, Erevos,
  Matrix, XMPP or Nostr), and under Chats on the Matrix, XMPP and Nostr screens. It asks first. Each chat is read as if
  opened: Erevos contacts hear of it with the next look at the relay (an "appear offline" chat with what it next writes,
  a message request never), groups' members as usual, Matrix gets a read receipt and XMPP a chat marker. Invitations
  stay until answered. Your linked devices see the chats read too.
- **Answer any call with video or with voice only**: Erevos calls, group calls, XMPP and Matrix (Element Call too) offer
  Answer and Answer with video, in a group call Join and Join with video. Turn your camera on later where the other app
  allows it, add video to an Erevos voice call, and switch cameras on web and desktop (Flip shows only when there is
  more than one camera).
- **More in SMS conversations**: hold the microphone to send a voice message by MMS (AMR, up to a minute, the format
  phones' messaging apps play). **+** → **Location** sends where you are as an SMS with its geo: address and an
  OpenStreetMap link. **+** → **Contact card** sends a contact from the phone as a vCard in an MMS. Voice messages and
  contact cards you receive show ready to play or save (**Save** opens a new contact with the card's details), and map
  links in SMS show as places to open in the maps app. Hold a message down for **Pin for me**, pinned over the
  conversation only for you, or **Select** to copy, forward or delete several at once.
- **More in XMPP chats**: voice messages from Conversations and other apps play with their length; **Sticker** sends
  your own photo stickers as photos (encrypted as the chat is); group members show owner and admin badges and the owner
  can edit the group's description; **Forward** sends one or several messages to another XMPP chat (marked as forwarded
  with XEP-0297 where the chat is not encrypted); tapping a quoted reply jumps to it; **Pin for me** pins messages on
  this phone only; and **Select** copies, forwards or deletes several messages.
- **More in Nostr chats**: tap a reaction to add the same or take yours back; **Pin for me** keeps pins on this phone;
  **Select** several messages to copy, forward to another Nostr chat (photos and files sent again) or delete, which asks
  the others' apps to delete your own too; send your own photo stickers. In the Public feed: polls you can see, vote on
  and make, reactions you can take back, and custom emoji, loaded as post photos are.
- **Matrix: groups, stickers, finding people, choosing several messages**: **Members** shows who is owner, admin or
  moderator from the group's power levels, and where your level allows you rename the group, set its subject, make or
  remove admins, take people out and bar them. Stickers from Element, FluffyChat and Element X show, and **Sticker**
  sends your own photo stickers, encrypted where the chat is. **New chat** searches the server's user directory besides
  taking a Matrix ID (the server learns who you looked for). **Select** copies, forwards or deletes several messages,
  for everyone in the chat where your level allows.
- **More in your chats and groups**: choose several messages to copy, forward or delete together, end a poll you made,
  send a contact card that can be added to contacts, follow and answer threads in groups, and read a group's
  description, which its admin sets (the owner or an admin of a public group). A private group has one admin: the order
  of its changes cannot be kept with two.
- **Folders in Chat with myself**: notes, photos, files and voice messages can go in folders. The folder button at the
  top makes one; its tab above the notes shows only what is in it, and what you write while it is chosen goes into it.
  Holding a note offers **Move to a folder**; holding a folder's tab renames or deletes it, its notes staying, in no
  folder. A note is in one folder at most, and goes to your linked devices with its folder; one renamed or deleted on
  one device is so on the others too. An empty folder stays on the device it was made on.
- **The battery mode Sleep spares more**: each time its alarm wakes the phone, about once a minute, Erevos asks the
  relay once and lets the phone sleep again as soon as nothing came, in a second or two. Before, the phone stayed
  awake 25 seconds of every minute. When something came, while an automatic backup is made, or while Nostr is read,
  it stays awake as before.
- **A new battery mode, And light sleep** (Settings → Notifications → In the background, between **And nearby phones** and **And sleep**): like And sleep, the phone itself sleeps while
  Erevos is in the background, but Erevos leaves its question open at the relay, so a message or a call wakes the
  phone through the network when it comes, without waiting for the next look. A look is still made every four
  minutes, for what the network did not wake the phone for. Whether the phone wakes for the network while it sleeps
  depends on the phone and on its battery settings for Erevos: where it does not, messages come at the next look.
  **Only the waste** stays as it was, and is still what the app starts with.
- **With Erevos open, messages come at once**: the app now waits at the relay for what comes, as it does in the
  background, and no longer asks it every three seconds. A message shows the moment the relay has it, and the phone's
  radio is used less while a chat is open.
- **Read marks no longer go missing**: when you read a message and put the phone away at once, before Erevos next
  spoke to the relay, the other person was never told, and the message stayed at ✓✓ for them for good. What was
  read is now kept until a message to them has said it, and is said at the next look, by the open chat or in the
  background, also after Erevos was closed. Messages read before this version, whose mark was lost, stay as they are.
- **Backups are checked**: after each automatic backup Erevos reads it back from the folder, opens it with automatic
  backups' key, makes sure every part it names is there, of its size, and reads two parts picked at random through.
  On a server it then looks only at what the server lists, so nothing is downloaded. **Check now** under Backups
  also downloads the server's newest backup and ten of its parts, and reads ten in the folder. A part missing or
  damaged shows in red, with how many. **Full check of the folder** reads every part there through on Android's side,
  off the screen's thread, and compares it with the SHA-256 the backup wrote down for it, with its progress and Cancel.
  A backup the check after it does not find whole counts as failed: Backups say why, and it is made again an hour
  later, with what was missing or cut short.
- **A new first start**: the first screen now says what you do not give, no phone number, email, user name or
  account (you add people with a QR code or a link, or they invite you), and asks for a name for your contacts, if
  you want one. After the modules comes a short screen for each module chosen, with how to begin with it and what
  Android, or the browser, should allow for it, each permission on the first screen that needs it, with **Allow all,
  one by one**; then the password lock and automatic backups, then what is ready and what is missing, with **Invite
  someone**. **Do the rest later** leaves it all for Settings. **I already have Erevos on another phone** skips the
  name and the modules, which come with the backup, and goes straight to restoring it; on a computer or in a browser,
  **Link to my phone** opens Linked devices. An invite Erevos was opened with shows once the steps are done.
- **Leftovers**: photos and files that nothing names any more, as those of an import that stopped in its middle, can
  now be found and deleted, under Backups → **Leftovers**. Type the PIN of each of your hidden chats and the password
  of any other space, tap **Find leftovers**, and Erevos shows how much none of them names; **Delete them** deletes it
  once you say so. A file written in the last day is never taken, and nothing leaves the phone.
- **What takes room**: Backups now have **What takes room**, which shows on Android how much room Erevos takes on the
  phone, by kind: the Collection with the chats' photos and files, voice messages, chat history, Tor, and what writes
  that did not end left over. Each automatic backup holds it all, so it tells why one is large. Only the files' names
  and sizes are looked at, on the phone, and nothing is sent.
- **Choose the name others see**: under Settings → Privacy and security → **My name**, a space can go by a name you
  choose, which your accepted contacts and your private groups see, encrypted, in place of a code (up to 40
  characters, none at first). A contact you gave a name of your own keeps showing under yours; their chosen name shows
  in their details as "Calls themselves". In a private group, members who are not your contacts show as "Name · 1a2b".
  Each space and each place of hidden chats has its own name, in its settings, and a hidden place never takes the
  space's: the same name in two of them tells whoever sees both that they are yours.
- **Photos and files from the Collection, straight from a chat**: **+** in a chat now has **Collection**, which opens
  the Collection of that chat's place (the space's, or the hidden chats' own). Tap what to send, then **Send**, and it
  goes in the chat. Before, **Photo** opened only the phone's own gallery.
- **Your SMS on your linked devices**: with **On my linked devices too** turned on under Settings → Phone and SMS →
  SMS on the phone (off unless turned on; each space its own), the phone's SMS show on the space's linked devices too:
  the latest 50 conversations of the list and Archived, each with its latest 50 messages, their names only as the phone
  shows them, never those in the Trash or Spam, never a hidden place's. They show there as on the phone, in the home
  screen, the SMS screen and a contact's chat, with notices as a chat on another network has. An answer written there
  shows as sending until the phone sent it, once only, on the SIM it uses for that number (a group's as one MMS), and
  then is among the phone's own; one the phone could not send says so, and is sent again with a tap. A conversation
  read there is marked read on the phone. Photos, deleting, blocking, sending later and invites stay on the phone.
  Requested by the maintainer.
- **TV in the Collection**: a new **TV** tab, beside Radio, keeps TV channels sealed in the Collection's catalogue,
  each by its https link with its group and logo: from an IPTV list (.m3u) by its link, read once, or from a file on
  the device, read there; from iptv-org's public list of free channels, by country (the device's region first) or
  whole; or one at a time. Up to 15,000 in each Collection, a link once; same-name channels all stay; http ones are
  left out and counted. Grouped by the list's groups (iptv-org's "News;Sports" by the first), with a row to show one
  group and a search by name; a channel's menu renames it, deletes it or its whole group, or sends its name and link
  to a chat, as a radio station's menu now does too. It plays as a video on Android (Media3, HLS included, with the
  station's reconnecting), and in the desktop app and a browser, an HLS stream through hls.js 1.7.3 (without a
  worker) where the engine cannot play it, which needs the stream's server to let the page read it; radio stations
  with an HLS stream now play there too. Logos are fetched only with **Show channel logos** on (off unless turned
  on), as their servers see the device's IP address. No programme guide.
- **Radio that keeps playing**: a station whose server or proxy drops the stream (ends it quietly, errs, or
  stalls), or whose network goes for a moment, is asked again after 1, 2, 4… seconds (at most 30, 12 tries in a
  row) instead of stopping; on Android, on a computer and in a browser.
- **Radio playlists with many stations**: in the Collection's Radio, **Add a station** takes a playlist link (.m3u,
  .pls) that names many stations and adds each of them (500 at most), and **Import a playlist file** adds the
  stations of a .m3u or .pls file from the device, read there and sent nowhere. Only https stations are added.
- **Block screenshots in a chat**: in a chat's details, **Block screenshots** keeps screenshots and screen recordings
  of the chat (and its picture in the recent apps) out on both phones, on Android. Either phone can turn it on or off,
  and the later change wins, told with the next message as the disappearing-messages timer is. Erevos on an iPhone,
  on a computer, in a browser or on Sailfish cannot block them, and says so; nothing stops a photo of the screen.
- **Say when I open Erevos**: with **Last seen** on, opening Erevos now tells your contacts at once, without waiting
  for a message: only those you talked with in the last 30 days who show their own time too, each after a random wait
  of up to a minute, at most every 15 minutes, never a chat that appears offline or a message request; hidden chats
  only while they are open. The relay can then tell when you open Erevos. On unless turned off, under Settings →
  Privacy and security → Last seen, or in a chat's details (`SpaceData.tellOpen`, lib/e2e.ts `openDue`, lib/receiver.ts
  `tellOpenLater`). Requested by the maintainer.
- **Moving to a new phone**: a new chapter of the guide (#new-phone), in every language, takes you step by step from
  the old phone to the new one with one backup: what to get ready, what comes over, what to set again on the new
  phone, and wiping the old one with the panic button at the end, never with Delete me from everywhere.
- **A lost phone**: Backups has **The old phone was lost**: a phone a backup came from that was lost or stolen and
  is still on went on reading the relay queues it knew. It marks this phone (lock/restored.ts, kept in no backup),
  and each space and hidden place a backup put back here then moves once, as it next opens: its contacts' own queues,
  its own queue with each home relay's, its ring queue and watch slot and its linked devices' places, the contact
  link's queue, and the groups' and public groups' (lib/queue-move.ts `lostNow`, move reason `phone`), each step kept
  as made. Contacts and groups are told quietly; the old queues are read until each contact was heard on a new one,
  14 days at most, and links and QR codes given before work for 14 days. Nostr, XMPP and Matrix are not moved.
  Requested by the maintainer.
- **Restored chats go on by themselves**: a chat put back from a backup starts a new conversation with every kept
  contact as it opens, from the newest prekeys they gave it (`bundleAt` says when), with a first message that shows
  nothing and a later `fa`, so their Erevos sends in it from then on (lib/e2e.ts `startAnew`); a contact's endpoints
  start one with the next copy. With a contact on an Erevos that gives no prekeys, the link is still needed.
  Requested by the maintainer.
- **Backups every 6 hours, and lighter**: automatic backups can be made every 6 hours too, while a space is open:
  when it opens, every 15 minutes, and as Erevos goes to the background, before it locks; one that failed is tried
  again after an hour. Each names again the parts of earlier automatic backups in the same folder or on the same
  server whose files are all still there unchanged, and makes new ones only for the rest, in a new entry kind
  (SHARED, 9) that binds each part by its size, SHA-256, backup id and number; an older Erevos refuses it and asks to
  be updated. A ledger on the phone (lib/backup-ledger.ts, in no backup) keeps what each backup named; the folder and
  the server keep the 3 newest and every part they name. Manual backups stay whole. Requested by the maintainer.
- **Linked devices after a restore**: a backup now holds, for each linked device, what reaches it and a key it gave
  its phone (`relinks`), never a link's conversation. On a phone it was restored on, Linked devices lists them under
  **From the backup**; **Ask to link again** sends one an ask signed by the account and by that key (lib/link-again.ts),
  and **Link again** on the device links it anew, with no code, keeping its chats. Linked again, it has a new endpoint
  and key, so neither the old phone nor the same backup elsewhere reaches it. Older devices link again as the first
  time. Requested by the maintainer.
- **The phone's calls in backups**: on Android, **Put the calls in backups** (off until turned on, kept in backups)
  adds the call history (the newest 10,000 calls, without voicemail; the SIM as its slot) and Android's own blocked
  numbers to each backup, in a new entry kind (PHONE_CALLS, 8) an older Erevos refuses (CallsBackup.kt,
  lib/backup-calls.ts). Restoring adds those the phone lacks, deletes none, and needs Erevos to be the Phone app.
  Requested by the maintainer.
- **Every chat's own look**: a group, Chat with myself and each chat on Matrix, XMPP and Nostr now have **Chat look**,
  as a contact's chat had: the choices of Appearance for that chat only, kept on this device (lock/group-data.ts,
  lock/myself-data.ts, the network accounts' records), drawn on its screen by components/chat-look.tsx with its
  backdrop and header. Appearance has two new choices, for the app and each chat: **Letters** (the style's own, the
  phone's, a serif or a monospace, over every text: `Look.font`, `shape.face`) and the messages' **Text size**
  (`Look.textSize`, 0.87 to 1.3 times). Matrix, XMPP and Nostr bubbles follow the bubble shape. An older Erevos
  ignores both and keeps its own letters and size. Requested by the maintainer.
- **Muting the hidden places' Matrix, XMPP and Nostr chats**: the chats of a hidden place's own accounts now have
  **Notifications** with **Muted** only, as hidden chats do; muted, they give no "New message" and no unread sign
  (lib/network-notices.ts `hearing`). A Nostr chat's notifications no longer offer a ringtone, as Nostr does not
  ring. Requested by the maintainer.
- **Reminders that come again**: `erevos://myself?…&every=1m` (or `Nd`, `Nw`, `Nm`, `Ny`) keeps a note whose reminder
  repeats, as Fasouli asks for a scheduled payment. Once seen it moves to its next time (lib/note-repeat.ts), on the
  same clock time, a month's last day kept for the 29th to 31st; it goes to linked devices with the note.
- **Who is online on Matrix and XMPP**: under the name of a Matrix contact in a chat with one person, or of an XMPP
  contact who lets you see their presence, the chat says **Online**, **Away** or **Do not disturb**, with the words
  they set, or when they were last online, as their server says (m.presence; RFC 6121 presence with XEP-0319 idle
  time), and their picture in the chat list has a green dot. It is kept in memory only, never in the account's file
  or a backup, and an XMPP session forgets it as it begins (lib/net-presence.ts). On Matrix, Erevos now syncs with
  `set_presence=offline` and tells the homeserver once a run that it is offline, unless **Say when I am online** is
  turned on on the Matrix screen: before, every sync made the account show online.
- **New modules on after an update**: where the modules were chosen before the Collection came, as on a phone or
  computer updated from 6, the Collection stayed off after the update, as the choice was kept as a bare list of the
  modules on (lib/modules.ts). The choice is now kept with the modules there were when it was made, and any module
  newer than it is on, as every module is before one, until it is turned off in **Modules**. A choice kept before is
  read as made before the Collection, so the Collection is on there once, also where 7.0.0-rc.1 had it turned off.
- **Photos of the Collection one after the other**: in a photo, the arrows (on a phone too, while the bars show) or a
  swipe go to the next or the one before, and **Slideshow** shows them by themselves, one every 4 seconds, till a tap. On
  a computer, in a browser and on Sailfish OS a photo opens again instead of staying at **Opening the photo…**. See
  [Collection](#collection).
- **A home relay by itself**: on Android, when the space's relay names a relay paired with it, a space with no home
  relay takes that one by itself, only through Tor, with its token from a coupon, so nothing is typed (lib/pair.ts).
  Only the space's, never a hidden place's. **Automatically from your relay**, a switch on the **Home relay** screen,
  on unless turned off, turns it off, and so does removing the home relay there by hand. A home relay set so follows
  the pair when the relay names another, and goes when it became the space's own relay. The relay is asked once a
  day while Erevos runs, and every phone gets the same answer.
- **A chip for every part that is on**: above the chats, **SMS**, **Erevos**, **Matrix**, **XMPP** and **Nostr** each
  have their chip whenever they are on in Modules, also with no chat yet (lib/inbox.ts inboxParts), and the **SMS**
  chip says when Erevos is not the SMS app yet, with a button to make it that. Before, a chip showed only once its
  part had chats or an account: in a space with only SMS so far, choosing **All messages** after Erevos's icon opened
  its chats hid the chips, so there was no way back to them.
- **Invite at one tap**: on the home screen, **Invite** beside the relay's line opens Invite someone with its QR code
  already made, with nothing to type; who it is for and the name the phone gives itself can be typed below the code,
  or never (E2E.nameInvite). Opened again within 15 minutes, it shows the same invite while it waits, as a relay lets
  a phone make only a few a day; **Invite someone else** makes another. The empty home screen has an **Invite
  someone** button too (components/welcome-invite.tsx).
- **Smaller invite QR codes**: **Invite someone** makes the short invite an invite by plain SMS is
  (lib/sms-relay.ts makeShortInvite, lib/text-invite.ts), with no number and for 7 days: a link of about 270
  characters to Erevos's invite page instead of about 2000, so its QR code has about eight times fewer modules and
  simpler cameras read it. Its answer adds whoever took it as a contact, named as typed then or later
  (SmsLink.nameTextInvite). A scanned or pasted short invite is taken in New chat too. Where the relay lets the phone
  make no invite, the long one (lib/welcome.ts) is still made.
- **A small contact QR code**: **Show my QR code** under New chat → **Your contact link** now shows a contact card of
  about 150 characters instead of about 2000 (lib/text-invite.ts flag 4: no relay invite, no end), so any camera reads
  it; **Share my contact link** shares its short link (https://erevos-web.lphl.nekten.eu/i#…). Whoever scans it answers
  with their own contact link, opened with SmsLink.cardSecret, and this phone writes first. While the card shows
  (lib/sms-relay.ts contactCard/cardShown), or up to 2 minutes after, the answer adds a contact at once; later it is
  taken as a message request (E2E.asRequest). **Large QR code, for no internet** shows the full code, for near with no
  internet. Adding someone by their contact QR code needs a relay on this phone.
- **Links open Erevos**: on Android, an invite or contact link (https://erevos-web.lphl.nekten.eu/i#… or /c#…) tapped
  in any app opens Erevos, which asks before it takes it. app.json has intentFilters with autoVerify for /i and /c on
  erevos-web.lphl.nekten.eu, and lib/open-link.ts webLinkHref reads the link. It works once the web server publishes
  /.well-known/assetlinks.json and a new Erevos is installed; until then the page opens in the browser and offers
  Erevos.
- **Invites and contact links by touch**: on Android, while **Invite someone** or **My QR code** shows a short link,
  the phone answers as an NFC Forum Type 4 tag with it, one NDEF URI record (modules/erevos-device NfcShare.kt, a
  HostApduService for D2760000850101, only unlocked; lib/nfc-share.ts). The other phone needs no app open: Android
  opens the https link, in Erevos through its App Links. Never in the background, never the long link, and over after
  ten minutes if Erevos never lets go. Adds the NFC permission.
- **Sign in with LPHL without typing a code**: on Android the phone opens the relay's sign-in with `&to=app`, and the
  page with the code then has an **Open Erevos** button, erevos://signin?code=<six digits> (crates/erevos-relay
  signin.rs, pages.rs code_to_app); app/signin.tsx hands the code to the sign-in under way (lib/relay-signin.ts
  offerSignInCode), which claims with it at once. The digits claim nothing without the claim secret, which never leaves
  the phone that started, so an app that took the link gets nothing; the code to type stays on the page. Needs the
  relay updated; an older relay ignores `to=app`.
- **More music and video formats in the Collection**: a file plays by its type, and when the type says nothing (often
  application/octet-stream, or none, from another app or a chat) by its name's ending: MP3, AAC, M4A, FLAC, Ogg, Opus,
  WAV, AMR, MKA, MP4, MKV, WebM, 3GP and MOV (lib/collection-view.ts playKind). On Android Media3 reads them all by
  their first bytes, and an MP3 or AAC file with no table of its seconds is sought in as if at a constant bitrate
  (Playing.kt). The page's player is told the type the ending says, for a file that came without one.
- **Music of the Collection goes on with the screen off**: on Android (seen on a Pixel with Android 16) music could
  stop a while after the screen went off. The player's service was only started (startService), and was not always
  made a foreground service, so Android froze Erevos with the cached apps after a while, its wake lock
  notwithstanding. The player now keeps a Media3 controller of its own connected to the service's session for as long
  as the list plays (Playing.kt bind), Media3's own way: the service is bound, and Media3 starts it in the foreground
  as soon as the player plays.
- **Photos, Videos, Music and Files**: the Collection's two tabs are four, a file in the one its kind says
  (lib/collection-view.ts tabOf: a video or music by playKind, so by its ending too), each a list but Photos, and each
  with the folders that hold any of its files above it; Files shows the empty folders too, so one just made is there
  to open (folderTilesFor). Moving files still offers every folder.
- **A player's screen for the Collection** (components/collection-now-playing.tsx): a tap on the bar of the music
  playing, or on **Now playing** under a file of music, opens it: the cover, title, artist and album the file says
  of itself (Media3's MediaMetadata on Android; on a computer, in a browser and on Sailfish OS read from its first
  chunks, ID3v2, MP4 and FLAC, lib/media-tags.ts), a bar to tap or drag, previous, play or pause and next, Shuffle,
  Repeat (all or one), the speed from 0.5× to 2×, Stop, and the list with the one playing marked, a tap on another
  to jump there (lib/collection-queue.ts on the page; Media3's own on Android). A video, or music of 10 minutes or
  more, starts where it was left: where it got to is asked of the player every 15 seconds while the Collection is
  open, when it stops and as the space locks, and kept in the place's catalogue, sealed with it, never in plain
  storage (lock/collection-data.ts keepPositions, not sent to the linked devices). After the space locked, the list
  holds no place's key: the same place opened again takes it back. The notification and the lock screen show the
  title (the file's own, else its name), artist, album and cover only with **Show the title in the notification**
  on, otherwise only **Playing** (Playing.kt shown).
- **Subtitles for the Collection's videos** (lib/subtitles.ts): an .srt or .vtt file in the same folder with the
  video's name, or its name and a language (film.en.srt), plays as its subtitles when its chunks are here. On Android
  Media3 takes it as a side-loaded subtitle (SubtitleConfiguration) read from its chunks through the player's sealed
  data source by a token of its own, the player now made with DefaultMediaSourceFactory; on a computer, in a browser
  and on Sailfish OS it is converted from SubRip to WebVTT in memory and given to the page's player as a <track> of a
  blob: address, let go of with the rest. A button at the top of the video turns them off and on.
- **A read of the Collection's music that fails once is tried again** (Playing.kt onPlayerError): where it stopped, once
  for each file, before the player goes to the next file; at the list's last file it used to stop there, with its
  notice still shown.
- **Playlists in the Collection's Music** (components/collection-playlist.tsx): songs in an order of the owner's, kept
  in the place's sealed catalogue (lock/collection-data.ts playlists: an id of their own, the files' ids, `at`; a
  deleted one leaves a mark in `gone`, a deleted file goes from them). Made at the top of Music, filled from a song's
  menu or the songs chosen, played in order or shuffled by the same player, a song moved up or down or taken out.
- **The desktop app plays the Collection's music and videos of any size** (desktop/play.js, lib/collection-desk-player.ts):
  the shell answers the page's player by range from the encrypted chunks, opening only those the range needs, at
  /__play/<token>; the file's key is held in the shell's memory only, by a random token, and forgotten when the file
  is let go of, the list stops, the space locks, the panic button or the window closes. A shell from before it has
  the page decrypt into memory as before, up to 1 GB.
- **Internet radio in the Collection** (lib/collection-radio.ts, components/collection-radio.tsx): a Radio tab of
  stations kept in the place's sealed catalogue (lock/collection-data.ts stations: id, name, https link, type, `at`;
  a deleted one leaves a mark in `gone`). Added by an https link only (Erevos allows no cleartext); a .m3u or .pls
  is fetched once and its first https link kept, an HLS stream (.m3u8, or an .m3u that is one) kept as it is. On
  Android Media3 plays it through the same player and notice (DefaultHttpDataSource with the User-Agent "Erevos",
  no redirect to http, media3-exoplayer-hls, WAKE_MODE_NETWORK), with the same stops on lock and panic; its ICY
  title shows on the player's screen, and in the notice only with Show the title. In the web build the page's
  player plays the link; the desktop app's CSP needs media-src https: for it.
- **Radio stations found by name** (lib/collection-radio.ts radioSearchUrl, foundStations): Add a station searches
  Radio Browser (de1.api.radio-browser.info, /json/stations/search, 30 at most, broken ones hidden), sent only the
  words typed, when Search is pressed, with the User-Agent "Erevos" on Android and in the desktop app (a browser's
  page sends the browser's own), as backups' requests go; only stations with an
  https link are offered, and a tap adds one as a link typed would be.
- **Link a computer with one tap**: on a computer, **Linked devices** → **Link to my phone** now shows a small QR code
  at once, with nothing to type. The phone scans it with its camera and you tap **Link** once: the phone gives the
  computer, end-to-end encrypted through Nostr, what it needs, and the computer shows its full code to the phone, which
  links it; the safety code is compared by the computer on its own, so no **They match** is tapped. If Nostr cannot be
  reached, or the computer cannot use the relay, the computer says so and **Link another way** keeps the old way (the
  relay address, signing in with LPHL, comparing the code). Only the space, never hidden chats: they still link with
  the full code inside them. See [Linked devices](#devices).
- **Sign in with Nextcloud**: a Collection's server and the backups' server can be a Nextcloud, as LPHL's, the
  one Fasouli syncs with, through Nextcloud's Login Flow v2 in the browser (through Authentik or however it signs in),
  with no password typed. Erevos gets an app password of its own and its own folder, `Erevos/Collection` or
  `Erevos/Backups`, made if missing; nothing of Fasouli's is read. Then **Connect** as before.
- **Panic tells Fasouli too** (Android): under Settings → Privacy and security → Panic button → Tell other apps,
  choose apps that take a panic app's request, as Fasouli. When the panic code or button wipes Erevos, it tells them
  first, and Fasouli locks itself. Only apps you choose are told, and only while they are signed as when you chose them.
- **Payment requests**: another app, as Fasouli, can ask Erevos to send one to a contact
  (`erevos://pay?a=…&d=…&c=…&w=…&r=…`): Send to opens with only Erevos chats, and the chat asks before it goes. It
  shows as a card with the amount and what it is for; the contact taps **Paid** once they paid (it cannot be taken
  back), and the sender's **Mark in Fasouli** opens `lphlchrima://paid?r=…` to mark it collected there. Erevos moves no
  money. An Erevos from before shows the request as words.
- **Notes from another app**: an app on the phone, as Fasouli for a payment that is coming, can ask to keep a note
  with its reminder in Chat with myself (`erevos://myself?note=…&due=…`). It opens after the password, in the space
  you open, and Erevos asks first, showing the words and the time; nothing goes back to the app.
- **Groups stay on the device you choose**: on the phone, under Linked devices → Groups stay on, move the groups to a
  linked computer. Their keys go there, never copied, so the groups work there with the phone off and new ones can be
  made there; members see nothing new. A lost computer that holds them can still be unlinked.
- **Add someone new on a linked device without the phone**: a computer adds someone whose contact link is from this
  version by itself, with the phone off, and writes to them at once; they see your account as a request, with the same
  safety number, and the phone adds them too once it is on.
- **Calls and Send later on your linked devices without the phone**: with a contact on this version, a computer calls
  and is called by itself, with the phone off too: answered on one device, the others stop ringing; turned down on one,
  it is turned down on all. **Send later** on a computer hands the message to the relay itself, with a copy for each
  of the contact's devices, so it goes at its time with your phone off and reaches theirs with their phone off. Every
  device of yours shows it as scheduled, and deleting it on any of them before its time takes it back everywhere. With
  contacts on older versions, both still go through the phone. See [Linked devices](#devices).
- **The Collection on your linked devices**: **On my linked devices too** in a Collection's settings sends that
  Collection to the linked devices of its space or hidden place, and the switch goes to all of them. Files added,
  renamed, moved or deleted on one are so on all; small pictures come at once, a file itself at once on the same Wi-Fi,
  else when it is opened (from the Collection's WebDAV server, or through the relay up to 100 MB), a piece at a time,
  each kept only once it opens with the file's key. A file is deleted elsewhere only when it was deleted on one of your
  devices, never for being missing. Off until turned on. See [Collection](#collection).
- **Linked devices on the same Wi-Fi**: the phone and a computer on the same Wi-Fi or hotspot give each other what
  changes straight there, with no internet too. See [Linked devices](#devices).
- **Your Matrix, XMPP and Nostr accounts on every linked device**: each device linked gets them by itself, with no
  choice to make (the switch **Matrix, XMPP and Nostr accounts too** is gone), and they follow as they change on the
  phone: one you sign out of there, or replace with another, goes from the devices too. Hidden chats' own accounts go
  the same way to their own linked places. See [Linked devices](#devices).
- **Last seen**: when a contact is not online, their chat says when they last had Erevos open, to the minute (**last
  seen today at 14:32**). It rides end-to-end encrypted inside what goes to them anyway, never to the relay, and a phone
  whose Erevos is closed answers one who opens its chat once, only with a newer time. On unless turned off, and both
  ways: off in **Settings** → **Privacy and security** → **Last seen** (or a chat's details), no one sees yours, nor you
  theirs, and those who saw it lose it with your next message. One setting for the space and its linked devices; each
  place of hidden chats has its own switch and its own time (while they are open, only they count as open). Never to a
  chat that appears offline or a message request. See
  [Chat through a relay](#relay).
- **One Public feed**: the new **Public** chip on the home screen shows the public posts (kind 1) of the Nostr people your
  key follows, and what they shared again, together with the messages of the public Matrix rooms you are in, as one feed,
  newest first, as in Amethyst: each post with its writer's face (a small N or M says the network), name and time, its
  words, its photos inside the post and a card with the picture, site and title of its link. Under a Nostr post: answer,
  share again (it asks first), like and share, and in its menu copy the text, the writer's public posts, write to them
  and take back your own; tap a post to see how many liked it and shared it, and the answers. Under a Matrix message:
  answer, react and share. **New post** writes a public post with up to four photos. Answers, shares, likes and posts are
  public and signed with the space's Nostr key. **Photos** chooses how photos and link cards are fetched: **Always**, **Only
  through Tor** or **On a tap**, since the server of a photo sees the address it was fetched from, through Tor a Tor
  exit's; **Link previews** switches the cards. Nothing is fetched while the feed is not shown. The **Nostr** chip shows
  only the Nostr chats again, as before its posts moved here. See [Chats with other Nostr apps](#nostr-chats).
- **Same settings on your linked devices**: the language, the look (style, colours, text size) and **Last seen** changed on the phone
  or on a computer change on the others too. A photo behind the screens stays on the device it was chosen on, and so
  does what is about one device alone: passwords, PINs, the panic code, the lock's time, vibration, the relay and Tor,
  the modules, its name. **Same settings on every device** in **Linked devices** lets a device keep its own; turned on
  again, it takes the others'. Hidden chats keep theirs. See [Linked devices](#devices).
- **Support Erevos**: every way has its QR code now, Liberapay and PayPal too, besides the Monero and Bitcoin
  addresses. PayPal opens in the browser: its old link only handed over to the PayPal app, so it failed without it.
  The page `site/donate` has the same QR codes.
- **Collection**: an encrypted place in every space and every hidden place for photos, files and folders, kept apart
  from the chats and out of screenshots. Its icon, two pictures with a tiny padlock, is on the home screen left of the
  lock and at the top of a hidden place's chats, and a hidden place's Collection shows only there. Folders, the photos
  as a grid by month, the files as a list, a full-screen photo viewer, text files read in the app, and **Send to a
  chat**, **Save to phone** and **Open with another app**, each asking first, since the file leaves the Collection
  unencrypted. A photo from the camera goes straight in and never to the gallery; **Save to the Collection** in a
  chat's message menu, and **Send to** from other apps, which has the Collection first. It is a module, on Android
  and in the desktop app (**Settings** → **General** → **Modules**), with its own settings for leaving it out of backups.
- **Music, videos and PDFs in the Collection**: music and videos play straight from their encrypted pieces, never from
  a plain copy, with seeking: a video on the whole screen, music on with the screen off, with play, pause, next and
  previous in the notification and on the phone's lock screen, and only those there. The list goes on after the space
  locks unless **Stop playing when the space locks** is on; **Stop** and the panic button end it, and the notification
  says only **Playing** unless **Show the title in the notification** is on. A PDF reads page by page inside Erevos
  (Android 11 and later), decrypted in memory only. **Open with another app** now hands the file over as it is
  decrypted, with no plain copy left on the phone. **Delete the original from the gallery after importing** works on
  Android 11 and later: a photo or video picked from the phone's files is deleted from the gallery once it is in the
  Collection, after Android asks you to confirm. See [Collection](#collection).
- **The Collection on a computer**: the Collection is a module of the desktop app for Linux, macOS and Windows too,
  its files encrypted in Erevos's own folder on the computer, as the chats' are. **+** brings in a file from the
  computer, encrypted a piece at a time, so a large one is never held whole. Photos (with arrows and the arrow keys),
  text, PDFs in the built-in PDF viewer, music and videos open in Erevos's memory only, never as a plain copy on the
  disk, up to 1 GB each; the file closes and music or a video stops when the space locks or with the panic button.
  **Send to a chat** works as on the phone, **Save to the computer** asks first with the same warning, and **Open with
  another app** is not offered there. See [Collection](#collection).
- **The Collection in the browser and on Sailfish OS**: the web app, on an iPhone's home screen too, and Erevos on
  Sailfish OS have the Collection module as well. **+** brings in a file with the browser's own picker, read a slice at
  a time and encrypted as it is read, so a large one is never held whole. Its pieces go where the app's other files go:
  in a browser its storage (IndexedDB), one write a piece; on Sailfish OS Erevos's own folder, one file a piece. When
  the browser has no room left, the pieces already written are deleted, the catalogue stays as it was, and Erevos says
  so. Photos, text, music and videos open in memory only, up to 256 MB each, made from the decrypted pieces without a
  second copy, and let go of when the space locks. A PDF is not shown there, as the page may not frame it: it is saved
  to be read with another app. **Save to this device** (**Save to phone** on Sailfish OS) asks first and takes files up
  to 256 MB. The WebDAV copy is offered where backups can go to a server: in a browser, a server that lets the web app
  in, and not on Sailfish OS. See [Collection](#collection).
- **Files up to 4 GB in the Collection**: a file of the Collection can be up to 4 GB. On Android a file picked from the
  phone's files is encrypted as it is read, straight from where it lies, with no plain copy in Erevos's cache first:
  it comes in faster and needs no room for it twice. See [Collection](#collection).
- **The Collection on a WebDAV server**: each space and hidden place can copy its Collection to a folder on a server
  you choose, Nextcloud, ownCloud or any that speaks WebDAV (**Settings** → **Data and devices** → **Collection** →
  **Also on a WebDAV server**), off until you turn it on. Its pieces go as they lie on the phone, already encrypted,
  under the same random names, into a subfolder with a random name, so the server can open none of them. The address,
  user name and app password are kept sealed with that place, and the backups' server is offered first. Only what is
  missing there goes, a piece at a time, while the place is open, tried again when the network drops and going on
  where it stopped; a piece there of the wrong size goes again, a file deleted here is deleted there, and nothing else
  in the folder is touched. A phone that lacks a file, as after a backup restored on a new phone, fetches its pieces
  from there as it opens, keeping only those that open with the file's key. While everything is copied, backups made
  while the place is open leave its pieces out. See [Collection](#collection).
- **Chats open at their end**: a long chat, or one with imported messages, could open at a message read long ago,
  often a photo. Now it opens at the newest message, and the arrow to where you left off is there when new ones came.
- **Tor off unless you turn it on**: a new space sends nothing through Tor, so messages go fastest, and turning Tor on
  asks first, as it makes messages slower and the first start of Tor takes a while; **Cancel** keeps **Nothing**.
  A space you already have keeps its choice, under **Settings** → **Relay and networks** → **Tor**, where the choices
  now read **Nothing**, **Messages**, **Everything**. Texts through Nostr now go without Tor too: with **Nothing** the
  Nostr relays see your phone's internet address, never who wrote to whom. With **Messages** they go through Tor once
  it is ready, and through your relay while it starts; with **Everything** only through Tor. With no relay at all,
  texts, photos, files and voice messages follow the same way, and **Delete me from everywhere** asks the Nostr relays
  straight when Tor is off. See [Through Tor](#tor).
- **A home relay only through Tor**: switch a home relay to **Only through Tor** (Settings → Relay and networks → Home
  relay) and it never sees your phone's address, whatever Tor is set to for the rest. With no token typed, it gives you
  one for a coupon that your relay signs blind, so neither relay can tell whose it is: two spaces (second password) can
  each use the other's relay as their home relay, with no relay tying them together. Erevos takes the coupon up to an
  hour after it was signed, at a random time, so the times the two relays saw do not match (still, with few phones on a
  relay, whoever runs both could guess by the times alone). The token comes within the hour, lasts 90 days, and Erevos
  takes a new coupon by itself on a random day between day 30 and day 60. Needs a build with Tor (Android), and relays whose operators turned coupons
  on. See [Home relay](#home-relay).
- **Shared into the Collection with no plain copy**: a photo or file another app shares with Erevos is encrypted as it
  comes in, before **Send to** opens, so on its way into the Collection it never lies unencrypted on the phone; a chat
  it goes to instead reads it from those encrypted pieces. It can be up to 4 GB on its way into the Collection; a
  chat still takes 100 MB at most, so **Send to** offers a larger one only to the Collection. While a large one is encrypted, a screen
  shows how far it is, with **Cancel**. See [Collection](#collection).
- **See a file come from the WebDAV server**: a file of the Collection that is not on this device, as after a backup
  restored on a new phone, shows how much of it has come from the server, and **Cancel** stops it; what came stays,
  and the next time only the rest comes. Music, videos, PDFs and **Open with another app** fetch it first too,
  instead of failing. See [Collection](#collection).

### Under the hood

- The app is built on Expo SDK 58 and React Native 0.88, with the tools that build it updated too: this closes
  the known weaknesses in the router's address reading and in the build tools. Files are still written whole before
  the app goes on, and Android release builds are still not shrunk, as before.
- The plain Erevos is built with `EREVOS_EDITION=lite` (docs/editions.md): its core has no Matrix, XMPP or chats with
  other Nostr apps in it, its guide leaves their sections out, and its icon says Erevos.
- A backup reads every page the files it holds name, even while the app saves: pages let go of meanwhile are deleted
  only once it is done. Before, a save at that moment could leave a backup whose value would not open after a restore.
- Wrong PINs tried by searching are let go of a quarter of an hour at a time on the phone's own clock, which moving
  the date does not change, rather than all at once by the date.
- The relay's log says a damaged last record of its journal is cut short or damaged, rather than only a write that did
  not finish.
- Every Erevos build's number is above every Erevos+ build so far, so Updates moves between the two and Android
  installs each over the other.
- The core opens HTTPS streams through Tor (no ALPN, held back when the player pauses), and Android's player reads a
  station or a channel over them, HLS pieces too, speaking HTTP/1.1 itself.
- A chat's thread, and its media list while the details show, are no longer worked out again each time the clock moves
  or another chat changes; marking messages read finds them by tag in one pass, and a link followed by a long run of
  marks or brackets is trimmed in one pass too, where before it took ever longer with each mark.
- The relay checks each record of its journal (CRC-32C, `EREVOSJ3`): a record the disk changed is found at start,
  what comes before it is read, and the journal as it was is kept beside it before it is written again. A journal
  from an older relay is read as it is. `erevos-relay downgrade-journal` writes it back as older relays read it,
  losing nothing, for going back to one (deploy/relay/README.md).
- Group messages from a member no longer in the group are dropped (only their own request for new keys is read).
- A relay address is checked before Erevos connects to it, files' too, and at most 512 characters long.
- The sync log refuses names such as `__proto__` or `constructor`, which could change how every entry reads.
- The Collection's WebDAV copy deletes an unnamed piece only once it has stayed unnamed for an hour across copies.
- A Nostr message that could not be opened is tried again when it comes again, rather than taken as seen.
- A message is held to wait for a contact only when the error is one waiting can mend.
- An SMS group's numbers leave out any part with letters, such as a name the phone added.
- A call between two phones on the same network answers with all its paths, not only through a call relay, when the
  offer had only local addresses.
- Share to Erevos takes only another app's content, never a file or one of Erevos's own providers.
- The computer allows the camera only to the app's own calls, and follows a link inside the app only to its exact
  origin. macOS says why it uses the camera.
- Element Call is built only into Erevos+.
- The relay's XMPP push gives a stream a minute for its whole start, and one address at most 8 of its 64 places.
- Nostr through Tor keeps at most 256 frames waiting to be read.
- Damaged stored state gives an error, not a crash: a group's length that would wrap on 32 bits (the web app), a
  ratchet with a receiving chain but no peer key, and a counter at its end.
- The release counts on from plain Erevos's own last release, not GitHub's latest, which may be Erevos+.
- **Nostr gift wraps can carry an expiration** (crates/erevos-nostr/src/chat.rs): the rumor's exact NIP-40 time, each
  wrap's that time plus 0–3600 s at random, so relays cannot match the two. The core packages need their usual rebuild
  for it to go out.
- **Ticks**: a text the other phone had, and read, before it showed as sent here (through a slow Nostr relay) no longer
  stays at one tick.
- **Ticks from a contact on another relay**: they no longer stop when a message from your phone did not yet carry your
  relay's key, and a "came" that could not go right away goes with the next look.
- **A text no longer waits for slow Nostr relays**: with Nostr on, a text to a contact waited for one of the Nostr
  relays to say it took it, up to 20 seconds when none answered, before it went through their relay. Now, when none
  says so within 4 seconds, it goes through the relay as well at once; their phone shows it once.
- **A change in a chat is saved faster**: only the chat that changed, and the pages that hold its messages, are looked
  at when a message comes, is read or is deleted, each message is unpacked once, and a page is no longer written out
  whole to measure it for every message put in it. With many chats, or after a large import, each change took
  longer the more there was.
- **A large import notes its files in small parts**: the list of files an import is still writing, which the next
  start deletes if it stopped, was written whole for every file, and for an export of thousands of files grew past
  what one keystore entry holds well. It is kept in parts of 40 now, and only the last part is written.
- **An open chat is drawn again only when something is due**: the chat screen drew itself again every five seconds,
  and the home screen asked who is online as often. Each now waits for the next moment something changes: a message
  that disappears, one sent for later that goes, a contact who is no longer online.
- **The chat screen's file is smaller**: the lines of a thread, the rows of a chat's details and the screen's styles
  moved to a file of their own (`components/chat-thread-lines.tsx`), and what they share with the screen to
  `lib/chat-screen.ts`. Nothing changes in what the screen does.
- **A note keeps its folder when an older Erevos changes it**: a linked device with a version from before the folders
  of Chat with myself said nothing of a note's folder, and a note changed there left its folder on the others. A
  device now says so when a note is in no folder, and one that says nothing leaves the note where it is.
- **Leftovers say when wrong tries make it wait**: several PINs or passwords typed together that open nothing count
  as wrong tries of a search, and after five nothing opens for a while, a right one neither. The screen now says
  so, with how long.
- **An import that stops leaves nothing behind**: when Erevos stops while it brings in the photos and files of a
  Telegram, WhatsApp or Viber export, as when Android closes it or the battery runs out, what it had written of them is
  deleted the next time it starts. Before, it stayed on the phone, and in every backup, for good.
- **The clearing of leftovers is more careful**: a file is kept when its name carries an identifier that is in use
  with something written before or after it, and nothing is taken for a leftover while a part of what Erevos keeps
  cannot be read. SMS that could not be read for a linked device are looked at again on the next pass.
- **Backups to a server get there again**: a backup sent to a server, such as a Nextcloud, no longer stops when the
  server misses one of its pieces for a moment, as when it closes for a few minutes at night (503) or is slow to take
  one (408). That piece goes again, after a few seconds and then up to a few minutes, and the backup carries on; before,
  it deleted all it had sent and started over the next time, and a large backup could fail day after day.
- A text that is not proper UTF-8, such as the name in a damaged invite by SMS, is read without failing: bytes that
  start no character read as �, as the phone's own decoder reads them, instead of stopping the reading with an error.
- Messages say the sender's chosen name (`nm`), only when it changes; group members say it in their keys (About.name).
- **A chat opens at its last message again**: a chat opened as a screen of its own (from the home screen or a
  notification) first shows its empty thread while its history is read, and that empty thread used up the jump to the
  end made at once; when the messages came, the thread went to its end animated from the top, which on Android can
  stop short of rows not yet on screen, or count as the person scrolling and draw earlier messages there. Now the
  first jump is made once messages show, a thread that grew by a screen or more goes to its end at once, and a jump
  made at once is made again a frame later, after its rows are on screen. Inferred from the code, not seen on a phone.
- **A new sign-in to a relay is no longer undone**: signing in again (with LPHL, or by an invite) gives the phone a
  new token and the relay takes the old one's line away. The token went into the space's settings only when the chat
  screen saved all of its relay settings, and a chat screen opened from before, holding the old token, could write all of
  its own back the next time any of them changed: the relay then refused the phone ("cannot reach the relay…, or the
  token is wrong") until it signed in once more. Now the new token is written at once with which token it is, a chat
  screen writes only the relay settings it changed itself, and every chat screen open follows what another writes to
  them (lock/space-data.ts watchSpaceData, changedRelaySettings).
- **A message sent offline is no longer lost when you leave the chat**: while a chat screen's chats are still opening
  (a look at the relay under way ends first, which with no connection can take a while), what is sent there is held
  by the screen, marked Sending…, and goes once they open. Leaving the chat before then lost it, words and voice
  messages alike. Now what the screen still holds as it closes is kept in the chats' history marked waiting
  (lib/waiting.ts keepUnsent), each with a tag of its own, and goes by itself with the next look that reaches the
  relay, or to their phone nearby, as any message that waits. A walkie-talkie message is for now only, and is not
  kept.
- **No more freezing after a space opens**: an automatic backup, which starts ten seconds
  after a space opens, could keep the screen from answering for minutes on Android, more so the first one after
  7.0.0-rc.3. Its files are now written, listed with their names and sizes in one look, and deleted in their folder away
  from the thread the screen answers on (Folders.kt in modules/erevos-device), where expo-file-system asked Android
  again for each file's name and size there. SHA-256 is native (OpenSSL, through react-native-quick-crypto) for what is
  4 KB or more, kept only if it hashes as the JavaScript one does: in JavaScript it hashed a megabyte or two a second on
  a phone, and each 4 MB part of an automatic backup is hashed. The stamps of the files a backup holds are read 200 at a
  time, the screen answering between.
- **Matrix photos and files hashed natively**: the SHA-256 that an encrypted Matrix file is checked against, when it
  is sent and when it is opened, is the native one too (lib/matrix-media.ts), so a large one no longer holds the screen.
- **The phone's SMS in the space's log** (docs/sync.md, phase S8; lib/sync/sms.ts): a kind only the phone writes,
  `sms`, a record for each conversation and message, whole in one field and written again only when it changed, the
  phone reading a conversation again only when it changed or every 10 minutes (lib/sms-share.ts). Devices write
  `sms-ask` (an SMS to send, 16 random hex as its id) and `sms-read`. The phone keeps in the space's sealed SMS data
  what it took of each ask before sending it, so none goes twice, even if Erevos stops on the way, and sends at most
  60 an hour from the devices; asks older than a day are refused, those not sent are removed after a week. On a
  device the SMS module (modules/erevos-sms) reads the phone's in place of its own (lib/sms-mirror.ts), so the screens
  are those of the phone, without the tools only the phone has. Requested by the maintainer.
- **Groups after a restore**: a member put back from a backup asks its admin, once, to put it in anew in each group,
  which brings it back while the group moved on fewer than 5 key changes; an admin asks nothing, as its own commit
  from an old key change would only fork the group (lib/groups.ts `renewAgain`). Requested by the maintainer.
- **The time of a message that waited**: each message now says, inside its encryption, when its sender sealed it
  (`st`), and a message that waited on the relay, as for a linked computer or for hidden chats that were closed,
  shows at that time instead of when it came, unless that time is ahead of this clock or more than 30 days back
  (lib/later.ts `cameAt`). The phone's own messages copied to a device do the same. Reported by the maintainer.
- **TV and HLS radio in the computer app, whatever their servers allow**: the desktop app's shell now fetches an HLS
  stream's playlists and pieces for the page's hls.js (desktop/stream.js, `/__stream`), so a channel whose server does
  not let a web page read it (CORS), as most of iptv-org's, plays there too: only the stream's own link and the links
  its playlists name, each by a number given to the page alone, over https only (never a redirect to plain http),
  with no cookies and the User-Agent "Erevos". A station or channel the page's player asks for itself, and the radio
  search, playlists, TV lists and logos the shell fetches (`/__webdav`), now say only "Erevos" too, as the
  Collection says they do. Requested by the maintainer.
- **An invite that opened Erevos for the first time** opens once the first start's setup is done, however long the
  setup took; before, after five minutes on the setup screens it was lost and had to be scanned again (lib/open-link.ts).
- **The invite page reads contact cards**: opened from the short contact QR code, `/i` now shows "{name} on
  Erevos" and says it adds a contact for someone who has Erevos already, with no end date, instead of offering it as
  an invite from a newer Erevos; an invite that is over no longer says invites last two days (pwa/i/invite.js).
- **The web app's site says which app may open its links**: every web release now has
  `/.well-known/assetlinks.json`, naming `app.erevos` signed with the release key, which Android needs before it
  opens a tapped invite or contact link in Erevos instead of the browser (pwa/build.mjs).
- **Sailfish OS, notices while Erevos is closed**: since 7.0.0-rc.1 the helper erevos-watch takes the queues to wait
  on only from Erevos, and it knew Erevos only by the program a process runs. Started from the home screen or by a tap
  on a notice, Erevos runs inside a booster of mapplauncherd, which loads it as a library, so the helper refused it and
  told of nothing. Now it also takes a booster that has Erevos's program loaded to run (sailfish/watch/src/watcher.cpp).
- **Internet radio in the web app and on Sailfish OS**: their Content-Security-Policy now lets the page's player
  play a station's https link (media-src https:; pwa/build.mjs, pwa/sw.js, deploy/web/install.sh,
  sailfish/src/shellserver.cpp). On Sailfish OS the station search and playlists are asked by the page itself, as in a
  browser, instead of refused: only a server that lets the page in (CORS) answers, as Radio Browser does. A page cannot
  say its own User-Agent, so there the browser's goes instead of "Erevos" (lib/backup-http.web.ts).
- **The relay names its pair**: `EREVOS_RELAY_PAIR`, the address of a relay that takes this one's coupons (up to 3,
  apart by spaces), is told to each phone that may have coupons signed here, with the new `PAIR` request (38), and
  `NOT_FOUND` to every other; an older relay closes the connection, which the app takes as none
  (crates/erevos-relay coupons.rs, server.rs; deploy/relay/README.md).
- **Home relay**: the screen said that whoever runs a home relay sees this phone's address when it takes messages,
  also for one set to **Only through Tor**, whose own caption says the opposite. Where Tor can be used, the sentence
  now adds "unless it is set to Only through Tor below" (app/home-relay.tsx).
- **Short link code**: the computer's QR code is erevos://link?n=<its Nostr key>&s=<secret>&name=<name>, small enough
  for any camera (components/quick-link.tsx, lib/link-quick.ts). The messages between phone and computer are Nostr
  gift wraps (NIP-59: a rumor sealed to the other's key, wrapped with a one-time key) sent to and read from three
  relays (relay.damus.io, nos.lol, relay.primal.net; lib/link-nostr.ts), so the relays see neither who nor what. The
  phone's grant carries its relay address and an invite, from which the computer makes a relay token of its own, or
  the shared relay token typed into the phone, never the phone's own. The computer then answers with an offer of its
  full code, the phone links it as with the full code read, and the computer compares the safety code itself. Without
  Nostr, or where the computer cannot use the relay, the screen falls back to the old way (app/app/devices.tsx).
- **Matrix's encryption wipes its keys again** (vodozemac 0.11.2): vodozemac 0.11.1, which does the Olm and Megolm
  encryption of Matrix chats, left copies of keys in memory after use: each step of Olm's ratchet left the new root and
  chain key behind (RUSTSEC-2026-0451), and the ciphers and hashes under it were built without their wiping
  (RUSTSEC-2026-0445). Someone who could read the app's memory might then have read earlier Matrix messages of that
  chain. 0.11.2 wipes them; nothing else changes.
- **Twelve more fixes from the review before 7**: acknowledged receive at the relay (`RECEIVE` with `HOLD`, new `ACK`
  opcode; an older relay answers as before and the app takes the old path), so a message is deleted there only once the
  phone kept it; relay caps `EREVOS_RELAY_QUEUED_MB` (1024) in all and `EREVOS_RELAY_QUEUED_PER_PHONE_MB` (64) per
  token, refused as `Full`, and a journal over the cap loads without its oldest; a public group's owner removes a seat
  said to be the same phone only once the new seat is heard from (`again`, `lib/public-groups.ts`); SMS invites that
  come are not answered while invites are off; the search's wrong tries are forgotten after 15 minutes and wait 5 at
  most (`lock/tries.ts`); Matrix room keys are tied to the device that gave them, a message opens only as its sender's
  (`ownerCheck`), backup keys and untied ones show **Not verified**, a device with a new key is kept with its old keys
  and no longer sent to, and a new device is said once; XMPP keeps the old identity and session when a device's key
  changes (`pending`, **Accept** in the device sheet) and says new devices once; a file from a sender-chosen place
  (blossom, a foreign relay from a lent place) is auto-taken only through Tor, else on a tap (`takesItself`), in groups
  too; first packets carry their time (`fa`), an older one never becomes the sending conversation, replay lists 1000/64;
  the devices' log takes a device's ops only from that device, devices no longer pass on the phone's ops, gone devices
  are pruned from the vectors, cap 256 (`docs/sync.md`).
- **Fixes from a review of all the code before 7**: one draft per chat in the chat screen (`app/chat.tsx`), so what was
  typed in one chat, a PIN-locked one too, never shows in another; `lib/screen-privacy.ts` counts who asks for a
  private screen, so a locked chat under a locked group stays out of screenshots when the group closes; the
  Collection's catalogue (`erevos-collection`) goes into backups, and a restore deletes the linked devices' and the
  log's files (`erevos-devices`, `erevos-sync`) with their pages instead of leaving them without them; a call signal
  in a public group is for this phone by its key in the group, not its identity (`lib/groups.ts`, `GroupCallPlace.me`);
  Matrix's sync lets go of an event whose plaintext is no JSON object, and keeps `since` when `next_batch` is missing;
  XMPP refuses a SCRAM success without the server's proof, and asks for stale device lists once, not for ever, when
  their server cannot be reached; a hidden place's new password is refused when it opens another pocket or the own
  space; the log's ids skip `Object.prototype`'s names, a `whole` taken stamps only what is taken now, and a `later`
  record whose `at` is still coming in the next batch is not deleted; the groups handed to a device that stopped
  between taking them and saying so are taken as held when the offer comes again (`lib/devices.ts`); the relay's
  Matrix push reader refuses a chunk size that would overflow; the computer app's Wi-Fi link refuses a port past
  65535 and forgets settled file queues; Send to takes only `content://` streams and keeps its job when the phone
  turns; and the panic button's TRIGGER finishes without removing the task when it told other apps, so they start.
- **Web app and Sailfish OS fixes from the review before 7**: each space has a push address of its own
  (`lib/web-push.web.ts`): a space that turns notifications on registers the app's worker again for a scope of its own,
  `/__erevos/push/<32 hex digits at random>/`, kept in its encrypted data (`SpaceData.pushScope`), and subscribes there,
  so no relay is given the address another space gave its relay; turned off, that registration goes, and the panic
  button removes them all. In such a scope `pwa/sw.js` only shows notices: it keeps no release, sends a page asked of it
  to the app's, and answers only `close`; the count all the workers keep together is read again each time, under a Web
  Lock where the browser has them. A space whose notifications were on before has the app's first address, which other
  spaces may share: it makes its own as it opens, and that one is never given again. The browser lists each
  registration, so its settings show how many spaces have notifications on (the maintainer's choice). The worker's state
  changes one change at a time, from what is stored (`changeState`), so a check still waiting on the server no longer
  writes back the release a promote just let go of (`checks/web-update.check.ts`, `checks/web-push.check.ts`,
  `checks/web-notice.check.ts`). On Sailfish OS the shell's local server checks the host and the token, in constant
  time, before it takes any body, takes a body only on the shell's paths, keeps at most 32 connections still arriving
  and closes one silent for 30 seconds (`sailfish/src/shellserver.cpp`); `erevos-watch` takes calls only from Erevos's
  own program, by the caller's process (`watch/src/watcher.cpp`), and Erevos tells the helper only once the name is held
  by the `erevos-watch` beside it (`sailfish/src/watchlink.cpp`).
- **Shares encrypted as they come** (`modules/erevos-collection`, `ShareActivity.kt`, `SharedIn.kt`): Send to's
  Android screen moves from `erevos-device` to the Collection's module, beside the Sealer, and encrypts a shared photo
  or file into the Collection's chunks while Android lets it be read, with a random key held in memory only; its
  link says only the file's id (`sealed`). A photo's size and small picture are drawn there in memory. The Collection
  takes the chunks as they are (`importShared`, `addSealedToCollection`); a chat reads them as it sends, a photo from
  a plain copy deleted once read, as before. The next share, the panic button, or leaving Send to deletes them; a note
  in the cache names chunks left by an Erevos that stopped first. `checks/share-in.check.ts`.
- **Fetching a file's missing chunks says how far it is** (`lock/collection-data.ts` `FillOptions`, `fillItemHere`;
  `lib/collection-webdav.ts` `fetchMissingChunks`): chunks here of all and bytes, with an `AbortSignal` that stops it
  between chunks (`FillStoppedError`) and keeps what came; which chunks are here comes from one list of the folder,
  none read. The viewer, the PDF reader, the player and Open with another app show it, with Cancel and Go on
  (`components/collection-fetch.tsx`).
- **Backups skip what is on the WebDAV server after a restart too**: the server record keeps a mark of the chunks the
  catalogue named when its copies were last complete (`whole`, a SHA-256 of their names and sizes, `wholeMark`),
  saved without counting as a change; on load the copies count as complete when the catalogue still names those very
  chunks (`serverHoldsAll`). Any file added or deleted changes the mark. **The connection works.** in a Collection's
  settings is now in the colour of success, not of a warning. `checks/collection-webdav.check.ts`.
- **A holder of the groups that moves (sync phase S6)**: the account's one MLS state moves between the phone and a
  linked device in two steps: wiped where it was and kept as it went in one save (lib/groups.ts `moveOut`,
  `GroupData.handed`), put on the relay as a file (`hold`), and let go of only once the other side says it took it
  (`held`), or kept again should it never be taken (`nohold`, `takeBack`); never copied. Only to a device whose Erevos
  says it can (`can`). The holder announces its own queue with its next keys, and the queues read before stay its own
  30 days; the other side passes on group messages and signals that still come to it (`gpkt`, `gsig`) and asks through
  it, and what comes while they are on their way waits on the phone till they are held again; the members see the same
  leaf. Refused while in or asking to join a public group, which a linked device makes and joins none of; the holder
  is unlinked only when asked again, a lost device's groups then showing as left (docs/sync.md, S6).
- **A new contact from a linked device (sync phase S5)**: the account's X25519 identity signs (XEdDSA, in the core:
  `accountBind`, `bundleBound`) that its bundle's signing key is its own; the phone gives that word to its devices with
  the list, and a pass for each device, signed for 14 days and renewed, which says where the account reads. Contact links
  say `d=1`; a device adding someone new from one starts the conversation from its endpoint with the word, the list and
  its pass, which their Erevos checks before taking it, so an unlinked device starts nothing new once its pass ran out
  (docs/sync.md, S5).
- **Calls and Send later from the linked devices (sync phase S4)**: every message says `cl: 1`, which lets call signals
  go whole to each endpoint of the other account and a device write its own; the caller ends the others with
  `end{taken, by}` once one answers. Sent for later, a copy for each endpoint is held by the relay too (`Copy.due`), and
  where each is held is kept to take back with the message. What is held is record `later` in the place's log, so every
  device shows it and can take it back (docs/sync.md, S4).
- **A chat that opened at an old message**: as a chat opened, its thread went to its end animated, and on the way
  passed the top of what it showed, where scrolling draws earlier messages and keeps in place what was read there: so
  a chat of more than 100 messages, or with imported ones, could stay at one of its oldest drawn, often a photo. Now
  the thread's own way to its end (`lib/thread-follow.ts`, `checks/thread-follow.check.ts`) draws nothing and does
  not leave the end, the first one in a chat goes there at once, and a chat opened after another starts at its end
  again rather than keep the other's scroll state.
- **Moving a chat to a space with no relay**: **Move to another space** stopped with "That space's chats have no relay
  queue yet" when the other space had no relay of its own. Now it offers this space's relay with a second tap, **Move
  with this space's relay**, which that space then keeps (the relay can then tell that both spaces are on one phone), and
  it makes that space's relay queue itself when it has a relay but no queue yet. See [Second password](#second).
- **Last seen** (`lib/last-seen.ts`): each message to a contact of the space's own chat says `ls`, when that space
  was last shown on the screen (kept per space, in memory only), or 0 once turned off (`SpaceData.lastSeen`, on by
  default; shared with linked devices through the account's log as setting `lastSeen`), and the same for each hidden
  place with its own `lastSeen` and its own time (while its chats are open, its space does not count as shown). The
  contact keeps the latest as `Contact.seenAt`, never later than its own clock, and 0 forgets it. A chat that appears
  offline and a message request are told none. An `ask` that comes while the app is away is answered
  only when the space was shown since that contact was last told. An Erevos before ignores `ls`.
- **The account's log, first part** (`lib/sync/`, `docs/sync.md`): one way for the account's own devices to share what
  they change, in place of a kind of message for each thing. Stamps that stay in order whatever a device's clock says,
  records that end the same on every device whatever order changes came in, and devices that say how far they are and
  give each other what is missing, or the whole log to one far behind. Used by nothing yet: the next part moves
  contacts and notes onto it. `checks/sync.check.ts`.
- **The account's log between the devices**: kept sealed for each space and hidden place (`lock/sync-data.ts`, left
  out of backups like the links), and said in the links to the phone and between linked devices. The phone writes its
  contacts and those it blocked into it; the devices keep it, and nothing reads it yet. A change costs one packet to
  each device, with nothing said back; now and then the phone asks a device that may lack something how far it is.
- **Contacts through the account's log**: a linked device writes its own changes to a contact (name, timer, look,
  hidden, a request accepted, removed) into the log, and the contacts on every device follow it, field by field by
  when each was set, as they follow a change another device says. The phone does a device's change as before and
  then writes what it has, so all end with the phone's. The messages of before still go, for devices of 6.x.
- **QR codes of Liberapay and PayPal**: Liberapay's holds its link, PayPal's its link with `&source=qr` at the end
  (`LIBERAPAY_QR` and `PAYPAL_QR` in `lib/donate.ts`); the **Open PayPal** button opens the link without it, and the
  coins' QR codes still hold only the bare address. `checks/donate.check.ts` holds all of them, and
  `site/donate/build.mjs` draws the same two for the web page.
- **Tor off in a new space**: `EMPTY_SPACE.tor` is `'off'` (`lock/space-data.ts`); a stored way is left as it is by
  `torWayOf`, so a space from before keeps its way (**Messages** unless changed). `nostrOf` no longer takes the Tor way.
  `Line` in `lib/nostr.ts` opens its sockets straight (`openNostrStraight` in `lib/nostr-dm-net.ts`) when `torOff()`,
  and through Tor otherwise; `onTorWay` in `lib/relay.ts` closes the senders and reopens the readers when the way
  changes, so the connections follow it. `lib/forget-me.ts` asks the Nostr relays straight with Tor off, through Tor
  with Tor on, and skips them only while Tor is on but not ready. The Tor screen (`app/tor.tsx`) lists **Nothing**,
  **Messages**, **Everything**, and asks **Turn Tor on?** going from **Nothing** to either of the others.
  `checks/nostr.check.ts` has a check that with Tor off nothing opens through Tor, and that the connections follow the
  way as it changes.
- **Settings through the account's log** (`lib/sync/settings.ts`): the language, the look and last seen are records of kind
  `setting` in the space's log, written as they change on a device, never as they come from it, and put in place on
  the others; the phone writes those it has into a log that has none yet, so a device just linked takes the phone's.
  Each device can stop sharing them (`erevos.share-settings`). `checks/sync-settings.check.ts`.
- **Accounts through the account's log**: the phone writes who each of its Matrix, XMPP and Nostr accounts is (the
  user, the address, the key's public half) as records of kind `account` (`followAccounts` in `lib/devices.ts`, once a
  minute while a device is linked, `who` in `lib/linked-accounts.ts`), and gives the accounts again to every linked
  device as one appears or changes. A device lets go of an account it brought once the log removes it
  (`accountsFrom`), and of the one it brought before once another of that network comes in its place; one the log never
  named stays, and so does one of the device's own. Secrets still go only in the `accounts` envelope, never in the log.
- **The whole log as a file**: a device new, put back from a backup or long away is given the account's log whole;
  once larger than one packet holds (12 KB), it goes as a file on the sender's relay queue, encrypted with a key of
  its own that only the envelope carries, and is taken once and deleted there (`snapshot` and `syncHeard` in
  `lib/devices.ts`). One that cannot be taken is let be: the device asks again within 10 minutes.
- **Links between your devices over the links nearby**: a link packet that came on a link nearby (`near`, through
  `e2e.receive` and `Link.open`) has that device heard there (`device:<id>` in `lib/nearby.ts`), and what goes to it
  is handed there first (`toHeard`, only to the link it was heard on, never spread), each packet once; the outbox
  keeps it until the relay took it too, and the copy that comes second opens nothing. The space's links only.
- **Large files from another device, chunk by chunk** (`lib/sync/chunks.ts`, `ChunkFetch`): only the chunks missing are
  asked for, by whichever way answers first; each is opened with the file's key before it is kept, so one cut short
  or damaged is never kept; a file is whole only once every chunk is; one deleted while it comes keeps no chunk. For
  the Collection's files between devices (up to 4 GB), used by nothing yet. `checks/sync-chunks.check.ts` cuts the
  network off in the middle.
- **A fast way for those chunks on the same Wi-Fi** (`desktop/chunks.js`, `ChunkChannel.kt`, `lib/sync/lan-chunks.ts`):
  a TCP channel of its own beside the links nearby, so a chunk never goes through the app. Each linked device gets a
  key of its own inside their encrypted link, for the files it may take only; both sides show they hold it before
  anything else, and each chunk is kept only once it opens with the file's key. Unlinked, the key is let go. Not on
  the web app or Sailfish OS. `checks/chunk-channel.check.ts` cuts the Wi-Fi at chunk 17 of 40.
- **The Collection's catalogue in the place's log** (`lib/sync/collection.ts`, `lib/collection-links.ts`): files, folders,
  the WebDAV server and the switch as records of kind `collection`, written field by field only where they changed here
  since the log last said them; a file goes elsewhere only by the log's removal. Chunks come by ChunkFetch: the fast
  Wi-Fi way, the place's server, or the relay on asking a device that has them (envelopes `cfetch`, `cfile`).
  `checks/sync-collection.check.ts`, `checks/collection-links.check.ts`.
- **Coupons for a home relay's token (blind RSA)**: a home relay reached only through Tor (`SpareRelay.tor`,
  `Relay.tor`, `ensureTor`) gets its token for a coupon the space's relay signs blind: RFC 9474
  RSABSSA-SHA384-PSS-Randomized, with blind-rsa-signatures 0.18 (lib/coupons.ts, crates/erevos-relay coupons.rs). Relay
  ops `COUPON_KEY` (the public key to blind with), `COUPON_SIGN` (blind-signs with the phone's token, 2 a day and 6 in
  30 days per phone), `COUPON_KEYS` (the SHA-256 of each issuer key it takes) and `COUPON_REDEEM` (takes a coupon, once, for a line
  for the token). A relay turns them on with `EREVOS_RELAY_COUPON_KEY` (signing) and `EREVOS_RELAY_COUPON_ISSUERS`
  (taking). The lines it makes are named spare and last 90 days, 2000 at most (`EREVOS_RELAY_MAX_COUPONS`); a coupon line
  neither invites nor has coupons signed. Each step one relay sees comes minutes to hours after the one before, at random, on Tor circuits of the
  home relay's own (a new one for each coupon taken), so the two relays' times do not match; the token is renewed on a
  random day between day 30 and day 60. Every request to a home relay set to Tor only goes through Tor, the deletion
  of its old queues and Delete me from everywhere included.

## 6.0.0-rc.2 (2026-11-04)

### For you

### Under the hood

- **Home's buttons stay at the bottom**: after the password, home's **Remind me** and **New chat** could float halfway
  up the screen, over the chats, with the list ending above them, until Erevos went away and came back (on the Pixel,
  after the update to 6.0.0-rc.1). The keyboard of the password screen came and went before home was there, and
  `KeyboardPaddedView` (`components/keyboard.tsx`) listened for the keyboard only from the first screen that used it,
  and looked at Android's word only after a move: home came up with the keyboard library still holding a keyboard's
  height, and nothing moved again. Now the keyboard is watched from the start, and every such screen asks Android as it
  comes up, and again 0.6 s later.
- **The Nostr tab's posts come**: through Tor, **Posts** could stay on **Looking…** for good (on the Pixel, with
  6.0.0-rc.1). Each call through Tor that waits (a relay's wait for messages, each Nostr relay's next frame, an open
  under way) kept a thread of `Dispatchers.IO` while it waited, and those are at most 64 for all of the app's waits,
  Expo's own too: with some twenty Nostr relays opened at once for the posts, a call waited behind the others' waits
  before it even began. And a relay that answered the follow list and then went (as one closed after a minute unused)
  was opened again for where people write and their names with no limit in time (`lookUpAnswered` in
  `lib/nostr-dm-store.ts`). Now Tor's calls go on threads of their own, 256 at most, beyond those 64
  (`Dispatchers.IO.limitedParallelism`, `ErevosCoreModule.kt`); those look-ups reach each relay within 20 s, as the
  follow list's does, and only the keys a relay said all it keeps for count as looked up; and the newest page begins no
  such look-up after two minutes, so it comes with what was found by then. `checks/nostr-feed.check.ts` plays a relay
  that answers the follow list and then cannot be reached: the old code never brought the page.
- **Linux, Windows and macOS again**: 6.0.0-rc.1 came out with Android, Sailfish OS and the web app only. The release's
  check that each build for computers opens (`desktop/main.js`, `--smoke`) waited for the chats or the password screen,
  and a first start now shows the setup instead. Now the setup counts as a first screen too. The setup also took the
  keyboard library itself, so in browsers and on computers it threw "PromiseResolve called on non-object" as it opened,
  though nothing stopped. Now it takes the web stand-in (`components/keyboard.web.tsx`), and
  `checks/web-stand-ins.check.ts` holds every screen to it.

## 6.0.0-rc.1 (2026-11-04)

### For you

- **Links open on Sailfish OS**: **Sign in with LPHL**, a donation page or a link in a chat opened nothing there. Now
  Sailfish OS opens them: a web page in the browser, a number in the phone or the messages, an address in the mail.
- **Matrix, and photos and files in XMPP and Nostr chats, on Sailfish OS**: the page's Content-Security-Policy there
  (`sailfish/src/shellserver.cpp`) let no HTTPS through, unlike the computer's, so Matrix could not sign in, photos and
  files neither came nor went, and links showed no preview. Now it allows HTTPS as the computer's does.
- **A phone call shows its screen**: with Erevos as the phone app, a call that came showed its screen only through
  its notice's full-screen intent, so it rang with the phone's screen black, and could not be answered, when Android's
  full-screen notifications for Erevos (Android 14 and later), Erevos's notices or its channel of incoming calls were
  off. Now `CallService` also starts the call screen itself while the phone is locked or its screen off, or when the
  notice cannot show. A call that Do Not Disturb holds back, or that a screening app silenced, still comes quietly. The
  notice also gives Android the caller's number, so that Do Not Disturb lets the notice of a call it lets ring show.
- **The calculator shows a long result from its start**: upright, a result with many decimals hid its first digits
  (the display cut a long number at its start), which showed only with the phone turned sideways. Now a long number
  gets smaller to fit, its first digits always in sight.
- **Pick the recipient of a new SMS from your contacts**: **New SMS** (the SMS home and Settings → Phone and SMS →
  SMS) has a **Contacts** button that opens the contacts with a search, and typing a name or number suggests the
  contacts that match, accents and case aside. A contact with several numbers shows a line for each; for a group MMS
  each pick is added to the numbers there. The contacts are the Phone's search's: the phone's and, with Erevos
  unlocked, those kept only in Erevos and Erevos contacts with a number, never hidden chats'; with only the SMS open,
  the phone's alone.
- **More for a number in the Phone**: on the keypad, a **⋯** beside a typed number offers **Add to contacts**,
  **Add to an existing contact** (the contacts open to pick one, `/contacts?add=`), **Send an SMS** and
  **Copy the number**. **Recents** adds **Add to an existing contact** for a number that is none of the contacts,
  **Open the contact** for one that is, and **Copy the number**; **Favourites** adds **Send an SMS**, **Copy the
  number** and **Open the contact** to each number. With Erevos locked, the Phone still only calls (and copies).
- **A short buzz on touch**: the keys of the keypad (held **0** for +), **Call**, the call screen's buttons, Send, the
  keyboard's Enter where it sends or submits, buttons, chips, switches and the menus that open now buzz for 10 to 15
  ms (`lib/haptics.ts`), never while scrolling. **Settings** → **Appearance** → **Vibrate on touch** turns it off,
  for the phone; nothing on the web app and the computer.
- **Choose the parts of Erevos you use**: Erevos's own chats, the Phone, the SMS, and the chats with Nostr, Matrix and
  XMPP apps are modules (`lib/modules.ts`), any combination, Erevos's own too, at least one, kept on the device outside
  the spaces. One that is off does not start (the space's receivers, Matrix, XMPP and Nostr connections, calls and the
  background service follow them, `app/_layout.tsx` Receiver), and shows nowhere: the home screen's rows, tiles, menu
  and buttons, its settings, the permissions it would ask for, and the Phone's and the SMS's launcher icons (their
  aliases disabled, colour kept). A screen of one that is off, reached by a link, a notice or the widget, says so.
  Nothing is deleted. Erevos's first start is a setup (`components/setup.tsx`): what Erevos is, its language, the
  modules, then on Android the permissions for them with Erevos as the phone and SMS app; turning one on later opens
  the permissions for it again. Installs from before keep every module on. **Settings** → **General** → **Modules**.
- **A number on each icon, on Huawei and Honor**: every notice of Erevos showed its dot or number on all four of its
  icons (reported on the Pixel and Kvaesitso). Launchers give a notice to the app, not to one of its icons: Android's
  Launcher3 (Pixel, GrapheneOS, LineageOS) looks it up by package (`PopupDataProvider.getDotInfoForItem`), with only a
  pinned shortcut matched by the notice's shortcut id, Kvaesitso by package too (`NotificationBadgeProvider`), and
  Samsung's and Xiaomi's count an app's notices; no notice can name a launcher activity. Huawei's and Honor's launchers
  instead take a number for one icon at a time (`change_badge`, by the icon's activity). Erevos now tells them, as the
  widget counts (`IconNumbers.kt` in `erevos-widget`): on the icon of Erevos that is on, the messages its notice counts,
  on SMS's the SMS and MMS not read, on Phone's the missed calls the call history marks new, on Contacts's a birthday
  notice that shows; none on an icon that is off or on the calculator, and none with **Number on the icon** off. Only
  to that launcher, a system app, while it is the phone's own and in use. It takes their `CHANGE_BADGE` permission,
  granted at install without asking, and has Android 11 and later let Erevos see which launcher is in use. Other
  launchers stay as they were: the guide says so, and how to keep the dot for some notices only.
- **Public posts in the Nostr tab**: the home's Nostr tab shows first **Posts**, the public posts (kind 1) and shares
  (kind 6) of the people the space's key follows, newest first, 30 a page, older ones as the list comes to its end and
  the newest when it is pulled down, with **Chats** one tap away (`components/nostr-feed.tsx`, `lib/nostr-feed.ts`).
  The follow list (kind 3) is looked up as **Show the people you follow** does, and where they write (NIP-65) in asks
  of 200 keys of the relays that gather lists; the posts are asked of the look-up relays and of up to 8 of the relays
  they write on, each for those who write there. A page takes each event once and checked, a shared post once, and
  stops at the oldest time a relay that sent all it was asked for sent, so paging with `until` skips nothing. Names
  (kind 0) are asked only for the people shown, no picture or link is fetched, nothing is kept, and all goes through
  Tor as the space says, with the space's own key only. Tapping who wrote a post offers their posts or a chat.
- **Backups keep what closed chats need**: a backup also holds each slot's queues for its hidden chats' notices and
  rings (`erevos.watch.<n>`, `erevos.ring.<n>`), each space's door (`erevos.door.<n>`) and the phone's door key, so
  after a restore, on another phone too, **Ring calls when closed**, **Say when a message comes** and **Also while
  another space is open** go on as they were. Restoring a backup from before leaves the phone's as they are.
- **Open another space from the search**: another space's password typed in **Search chats** and sent opens it, as
  **Lock now** and its password do (lock/hidden.ts `searchOpens`): every search tries every pocket of the open space
  and every space's slot, so it takes as long whatever is typed, counted as hidden chats' PINs are; the open space's
  own password counts as wrong and the panic password does nothing there. The switch closes the open space and
  unmounts its screens before the other opens (app/_layout.tsx).
- **A dot for unread messages elsewhere, if you want it**: off unless turned on. Hidden chats with **Receive while
  closed** get **Dot for unread messages**: while one of their chats or groups has a message unread, or one of their
  own Matrix, XMPP or Nostr chats had one since they were last open, a small dot shows on the magnifier of **Search
  chats**. A space with **Also while another space is open** gets **Dot in the other spaces**: once a message came to
  it while closed, a dot shows on the padlock at the top of the open space's chats until it opens. Never how many, nor
  where (lib/unread-signs.ts). The space's switch is kept in its door (lock/doors.ts `sign`, `came`), which says no
  more than the notice does, at the same size; the place's in its own data, read through the key **Receive while
  closed** already keeps, so places that only say a message came get no dot.
- **Joining takes only the invite**: on a phone with no relay yet, **New chat** shows one way in, **I have an
  invite**; signing in with LPHL, **Start without a relay** and the relay's settings are under **For advanced users**.
  An invite to the relay made here, by hand, for someone new, by SMS or offered to a contact by itself, now gives the
  relay a line name of 10 random letters and digits (lib/e2e.ts `lineFor`), and the name typed for it stays in the
  space's sealed E2E data, the last 100 (`lines`), which the list of invites shows (`lineName`). Before, the relay's
  file of tokens had the typed name, or the phone number of an SMS invite. Taking a relay invite no longer says the
  name the relay gave, which means nothing to them now.
- **Invited phones stay**: on the relay, a line an invite made stands on its own once it is in the file of tokens:
  whatever takes out its inviter's line (that one's own inviter, the LPHL check, the operator deleting it by hand), it
  stays, and so do the lines it invited. Taking back a used invite cuts off that one phone alone. Who invited whom is
  kept only in the invites, for the inviter's list, taking back, the count of the 100 and signing in again
  (crates/erevos-relay `invites.rs`, `tokens.rs`; `Invites::finish_moves` at start). An open invite whose inviter's
  line is gone still lets no one in. Lines the old relay refused for a gone inviter but had not yet written out come
  back on update. Needs the relay updated.
- **Hidden chats on your linked devices**: each place of hidden chats links on its own, from inside it, to the same
  place on a computer or in a browser, with **Linked devices** under its list (on the device, in a place opened with
  its PIN, empty, with a relay queue of its own). The place has links of its own (`lib/devices.ts` `placeLinks`),
  opened with its chats as it opens or receives while closed (`lib/place-chats.ts` `joinPlaceChats`), sealed with the
  place's key under its own holder in `erevos-devices`, and its own account signs its own device list, so its contacts
  write to the device's place directly. Its chats, messages, groups, calls, Chat with myself and its own Matrix, XMPP
  and Nostr accounts go there as a space's go to its devices. Nothing of it shows in the space, on its screens or on
  its linked devices: the file holds a value of the same size for every place of every space, written or not, and each
  space writes its own as it opens, so the file is there whichever places link. Closed with **Receive while closed**
  off, a place's link does not run, and what the other side sends waits on the relay (14 days). On the device's place,
  new groups, group calls and moving a chat in or out stay on the phone. See docs/multi-device.md, Hidden places.
- **Move a chat to another space**: in a chat's **Details** in a space, **Move to another space** asks for the other
  space's password, tried as the search tries it (`lock/hidden.ts` `searchOpens`, every slot in the same time, its wrong
  tries counted with the search's), and moves the chat there as into hidden chats (`lock/move-chat.ts`): the contact,
  its messages, look and imported chats go into that space's sealed data, nothing of it stays, and the contact keeps the
  identity key they know the chat by, so the safety number stays the same. That space is not opened; its relay queue
  tells their phone at once to write there. The row shows in every space. A move into a space linked to a phone, or from
  a linked device, is refused. A move, into hidden chats too, no longer replaces a chat that the chats it goes into have
  with the same contact (`checkMove`); one a move cut short left there goes on moving. See docs/threat-model.md.
- **Backups bring the phone back as it was**: photos, files and voice messages (`erevos-file-*`, `erevos-voice-*`) go in
  parts of at most 4 MB, made and read one at a time, never all in memory: files beside the backup
  (`<stem>.part<n>.erevos`, the stem made unique where the folder cannot be listed), or uploads of their own to the
  server, padded to a whole multiple of one size, under random names as long as the backup's (the server can still count
  them by their size). Each part is sealed with a key the backup's key gives and holds the backup's random id and its
  number, so a part swapped, reordered, dropped or taken from another backup opens nothing; restoring reads them all
  before anything is put in place, and when one is missing or damaged it names it and offers to restore the rest without
  it, keeping the phone's own photos, files and voice messages. Automatic backups keep the 3 newest with their parts, in
  the folder (also the desktop app's and Sailfish's) and on the server, which deletes what an upload cut short before
  the next one. A backup also holds the panic password's entry, the portable settings (applied at once), the Phone
  module's quick replies and call rules (a group's only where this phone has a group of that title and account), each
  space's SMS data in full and the SIMs chosen for calls (put back on the same phone only, as SIM ids are the phone's
  own), the copies waiting for contacts' other devices and the space's own carried packets, and automatic backups' and
  their server's settings without the folder; the linked LoRa radio keeps its own settings. The restore is marked before
  the first file is written. An SMS for later whose time passed before the restore is held for the owner to send or
  delete. After a restore Android opens Permissions for the modules on. The web app saves the files one tap at a time
  and says so when they were not all saved. Backups from before still open. One holding an entry of a kind this Erevos
  does not know is refused, with nothing changed, telling the owner to update Erevos to the latest version first
  (`NewerBackupError`); keystore entries are written as kind 7 (`KIND_SECRET`), so an Erevos from before 6.0.0, which
  looks for the lock as kind 0, says a new backup is no backup rather than restore it without its parts.

### Under the hood

## 4.0.0-rc.10 (2026-11-02)

### For you

### Under the hood

- **Erevos no longer stops when only the SMS or the Contacts are open**: from them, a contact's chat, an SMS, another
  icon or a screen that asks for the password again made Erevos say "Erevos could not open: Maximum call stack size
  exceeded" (reported on the Pixel, 4.0.0-rc.9). The password screen kept the link to open after it by telling the
  screens that were going, which took it at once and asked again, without end. It now keeps it quietly, and that
  password opens all of Erevos, then the screen. When Erevos cannot open, **Try again** starts it again.
- **Each icon opens what it names**: after Erevos was opened by the SMS icon, or from the recent apps, another icon,
  the widget or a notice could sometimes show the SMS instead (reported on the Pixel, 4.0.0-rc.9). Android keeps the
  link Erevos first started with as its intent, which React Native reads when Erevos's screens start again, Expo drops
  a link that comes while Erevos is still starting, and Back closed Erevos when the SMS, Contacts or Phone icon had
  opened it, so the next icon started its screens again with only the SMS showing for a moment. Now the link that
  brings Erevos back becomes its intent (plugins/with-latest-intent.js), a link Erevos is opened with again from the
  recent apps is not opened again, Back on its first screen puts Erevos behind as Home does, and with only the SMS or
  the Contacts open another icon asks for the password as when Erevos is locked, then opens what it names.

## 4.0.0-rc.9 (2026-11-01)

### For you

- **Only the Contacts**: with Erevos locked, the Contacts icon, the widget's Contacts button and the notice of a
  birthday still ask for the password, but then open only the contacts: their list, a contact's card (without your
  chats and calls with them), editing, groups, duplicates, the SIM and importing. A chat, an SMS, Settings or the orange
  padlock **Unlock everything** asks for the password again, then opens all of Erevos.
- **Old private messages in Nostr chats**: Erevos now also reads private messages sent the older way (NIP-04, kind 4),
  which Damus, Primal and many apps still send and keep, past and new, and shows them in the same chats. It reads them
  on the relays where your messages arrive and on up to four more: those a brought key's other app reads (its kind
  10002 list) and relay.damus.io, nos.lol and relay.primal.net. The relays see who wrote such a message to whom;
  Erevos itself still sends only the NIP-17 way.
- **Public posts in Nostr chats**: in a chat with one person, **Public posts** shows what they post for everyone
  (kind 1) and the posts they shared again (kind 6), newest first, thirty at a time, each checked. Read only, looked up
  when it opens, through Tor as the space's way says, and never kept; no pictures or links are opened, and a content
  warning covers a post until tapped. An account that only posts for everyone, such as a project's, has its posts there.

## 4.0.0-rc.8 (2026-11-01)

### For you

- **Only the SMS**: with Erevos locked, the SMS icon, the widget's SMS button and the notice of a new SMS still ask for
  the password, but then open only the SMS: their list, their conversations, Archived, Spam, Trash and New SMS.
  Anything else, and the orange padlock **Unlock everything**, asks for the password again, then opens all of Erevos.

### Under the hood

- **Nostr chats with a key brought from another app get their messages again**: Erevos reads where that app said the
  key's messages arrive (its kind 10050 list), as that app does, instead of its own three relays, and says that list
  again as the key's newest; it reads those relays from their start, fetches once what relays named in older lists still
  keep, and reads a relay again when it stops sending. Before, such a key could show its chats with no past messages
  and get no new ones, as Erevos's own list had taken the place of the other app's.

## 4.0.0-rc.7 (2026-11-01)

### For you

- **Licence** in Settings → General: under which licence Erevos is free software (AGPL-3.0-or-later), its three
  additional terms, that it comes with no warranty, and who made it, as AUTHORS.md says; in the guide too, in all
  its languages.
- **Contact** in Settings → General: adds the maker of Erevos as a contact, from the contact link that comes with
  the app, to write to in Erevos itself, end-to-end encrypted, with no phone number and no email.
- **A new sticker set, Angry Eyes**: 24 faces of big yellow eyes on a black disc, drawn by the maintainer, each with
  the moves he gave it (blinking, glancing, shaking, crying, dozing off), played once as the sticker shows, as the
  other sets are.

### Under the hood

- The calculator in place of Erevos's icon opens again: in 4.0.0-rc.6 it closed as soon as it was tapped, because it set the colour of the phone's bars before its screen existed.
- **Show the people you follow** (Nostr chats) looks for your follow list on more relays: also on relays that
  gather such lists and on up to eight of the relays your key writes on, and it waits longer for each, as through Tor
  they answer slower. When it finds no one, it now says why, whose list it looked for, and how each relay answered.

## 4.0.0-rc.6 (2026-10-31)

### For you

- **Panic password**: with the password lock on, **Settings** → **Privacy and security** → **Panic button** →
  **Set the panic password** sets a password of its own that, typed on the lock screen, wipes Erevos as **Wipe
  everything now** does, while the screen shows **Wrong password**. It must open no space, nothing kept shows whether
  one is set, and checking it takes as long as any password. See [Panic button](#panic).
- **Calculator in place of Erevos**: on Android, under **Settings** → **Appearance** → **Launcher icons**, a
  calculator that works can take the place of Erevos's icon among the phone's apps; your code of 4 to 12 digits, then
  **=**, opens Erevos, which asks for its password as always. **Show Erevos's icon again** brings it back. See
  [Appearance](#appearance).
- **Start when the phone turns on**: on Android, under **Settings** → **Notifications** → **In the background**,
  Erevos can start by itself after the phone turns on, with no space open, so the spaces set to say a message came
  while closed already say "New message", never which space or what. Off unless you choose it. See [Chat through a relay](#relay).
- **Chat with myself on your linked devices too**: a note, photo, file, voice message or reminder written on the phone
  or a linked device goes to the others, end-to-end encrypted, and so do a reminder changed or seen and a note
  deleted; of two changes to one note the later stays. Those written before go once, both ways. Hidden chats' notes
  never go. See [Linked devices](#devices).

### Under the hood

- **The wait after wrong passwords goes by a clock no one can set**: `lock/tries.ts` measured it by the date and
  time, so moving the phone's clock forward ended it. It now measures it on Android's time since the phone started
  (`clock` in `modules/erevos-device`, `SystemClock.elapsedRealtime` with Android's count of starts), and in the web
  app and on a computer on the page's own clock; after a restart, when the time waited cannot be known, the wait starts
  again from its beginning. A wait kept by an older version is measured anew the same way.
- **The panic password is checked as one more slot**: `lock/config.ts` keeps it in `erevos.lock-panic`, shaped like a
  password slot whose key opens nothing, random from the first start until one is set, and compares every password
  with it as with the slots (PBKDF2, then Argon2id), so the time of a check is the same set or not.
- **Notices open Erevos itself also behind the calculator**: `MainActivity` now has Android's `INFO` category, so what
  opens Erevos from a notice finds it while its launcher icons are off (`plugins/with-launcher-icons.js`). The
  calculator (`CalculatorActivity` in `modules/erevos-icons`) is a task of its own and keeps only a salted SHA-256 of
  its code.
- **Starting with the phone**: a receiver for `BOOT_COMPLETED` and `MY_PACKAGE_REPLACED` (`BootStart.kt` in
  `modules/erevos-call`) starts the receiving service and, in it, a task with no screen (`index.js`,
  `startBootNotices` in `lib/background.ts`) that waits on the closed spaces' doors until a space opens.
- **Chat with myself between devices**: each change to a note is stamped after every stamp known there (`v` in
  `lock/myself-data.ts`), a deleted note leaves its stamp, and a `notes` envelope (`lib/link-wire.ts`) carries them
  between the phone and its linked devices, and directly between the devices (`tellNotes` in `lib/devices.ts`). A
  device is told every note once, after it said it takes them, then what changed there since, by stamp
  (`notesTold`). Photos and files go on the relay as a chat's do; a voice message's sound goes in the envelope.

- **People you follow on Nostr, found where your other app keeps them**: with a key brought from another Nostr app,
  **Show the people you follow** found no list (on the Pixel, 4.0.0-rc.5): it looked only on the space's relays and
  the look-up ones. `nostrDmFollows` (`lib/nostr-dm-store.ts`) now also reads the key's own relay list (NIP-65, kind
  10002, `writesOf` in `lib/nostr-dm.ts`) and looks for the follow list on up to 4 relays it writes on; when no relay
  answers at all, it says so under the button, not that no list was found.
- **Your Nostr name keeps the rest of your profile**: Erevos wrote its profile (kind 0) with the name alone, when the
  name changed and once a week, over what another app of a brought key had put there (picture, banner, about). It
  now reads the key's newest profile first (`profileFieldsOf`), changes only the name in it and signs it a second
  later than that one; it writes no profile while no relay answers, nor over one it cannot read.
- **Screens come down when no keyboard is open, in every case**: the home screen's list still ended a hand above
  the bottom with no keyboard open (on the Pixel, 4.0.0-rc.5): the keyboard library can keep part of a keyboard's
  height when its animation is cut off, or tell of a keyboard again when a field takes the focus with none open,
  and the screen put down by Android's word was lifted again by that height. `KeyboardPaddedView`
  (`components/keyboard.tsx`) now looks again 0.6 s after every change of the library's height, as well as after
  the keyboard goes and when Erevos comes back, and asks the window itself (`keyboardShown` in
  `modules/erevos-device`, Android 11 and later; React Native's `Keyboard` before): with no keyboard shown, the
  screen comes down. An answer overtaken by a later move counts for nothing.

## 4.0.0-rc.5 (2026-10-31)

### For you

- **New chat opens hidden chats sooner**: hold **New chat** down for a moment, not a whole second, and the field for a PIN of hidden chats opens; on Android the phone buzzes once as it opens. See [Hidden chats](#hidden).
- **People you follow on Nostr**: under New chat in Nostr chats, **Show the people you follow** lists the people your Nostr key follows, with their names; tap one to write to them. See [Chats with other Nostr apps](#nostr-chats).

### Under the hood

- **Who makes Erevos, and its licence**: About Erevos now names its maker, and every file of Erevos's source code says whose it is and under which licence; the AGPL-3.0 licence has three added terms (keep the maker's name, mark a changed version, give it another name). See [What Erevos is](#about).

## 4.0.0-rc.4 (2026-10-30)

### For you

- **Numbers on the home chips**: each chip above the chats (**All messages**, **SMS**, **Erevos**, **Matrix**,
  **XMPP**, **Nostr**) shows how many messages are not read in it, as a small number after its name (99+ above 99,
  nothing when there are none). Muted chats and groups are left out, as they are of the number on the icon, and so is
  what is typed in the search (`app/index.tsx`, `lib/inbox.ts`, `components/ui.tsx`). See [Getting started](#start).
- **Open a photo full screen in Matrix, XMPP and Nostr chats**: a photo shown in a Matrix, XMPP or Nostr chat opens on
  the whole screen when tapped, with the zoom, the turning with the phone and the **Save** buttons of a contact's chat;
  holding it still opens the message's menu (`components/attachment.tsx`, `components/matrix-message.tsx`,
  `components/network-file.tsx`). See [Matrix](#matrix), [XMPP](#xmpp) and
  [Chats with other Nostr apps](#nostr-chats).
- **Who got and who read your messages in groups**: in a group that is not public, each of your messages shows **✓**
  once sent, **✓✓** once it reached the phone of every member who was in the group when it was sent, and **✓✓✓** once
  every one of them read it, as in a contact's chat. Each member's phone says so in a quiet, end-to-end encrypted group
  message that only the sender gets: that the message came (a couple of seconds after, with the others that came
  meanwhile), and that it was read (once the group is on the screen). Hold one of your messages and choose **Who read
  it** for who read it and when, whose phone it reached and when, and who has neither yet, under **Not yet**; a member
  whose Erevos is older says nothing and stays there, so the message stays at **✓**. Public groups have no marks, and a
  linked computer shows the same ones (`lib/groups.ts`, `lib/group-parts.ts`, `components/group-messages.tsx`,
  `components/who-read.tsx`, `lib/link-wire.ts`). See [Chat through a relay](#relay) and [Group chats](#groups).
- **Who read your messages in Matrix**: your messages in a Matrix chat show **✓** once the homeserver took them and
  **✓✓✓** once every other member read them, as each one's Matrix app tells their homeserver (read receipts,
  `m.receipt`). Matrix has no receipt for a message that reached a phone, so there is no **✓✓**. **Who read it**, held
  down on a message of yours, lists who read it and when, and who has not (the first 100). A Matrix app can be set to
  send no read receipts, and its member then shows as not having read (`readersOf` and `readByAll` in `lib/matrix.ts`,
  `app/matrix-chat.tsx`, `components/matrix-message.tsx`, `components/who-read.tsx`). See [Matrix](#matrix).

### Under the hood

- **Quiet group messages for the marks**: the `seen` group message, with which a member's phone tells a sender that its
  messages came or were read, goes only to the senders concerned and is batched (that messages came, a couple of seconds
  after, with the others that came meanwhile; that they were read, as the group is read). Each such message skips one
  of this phone's MLS keys for the members it does not go to, and they accept a jump of 1000 at most
  (`crates/erevos-group`): so after 300 such messages to some members only (`APART_MOST`), the next goes to all, and no
  member falls behind. Groups let go of when their space closes (`Groups.close`) send nothing more, so two copies never
  seal for one group. Linked devices get who a message came to and who read it with the message's other marks
  (`lib/link-wire.ts`). See [Group chats](#groups).

## 4.0.0-rc.3 (2026-10-30)

### For you

- **Linking a computer is clearer**: on a computer or in a browser, **Linked devices** starts with **Link to my
  phone**; when it asks for a relay, LPHL's is filled in and **Sign in with LPHL** sits under the token, so the
  computer gets a token of its own and none has to be copied from the phone; a line says the QR code shows once **Link
  to my phone** is tapped (`app/devices.tsx`). See [Linked devices](#devices).
- **Matrix, XMPP and Nostr on a linked computer**: **Matrix, XMPP and Nostr accounts too**, when linking, and **Send
  the accounts**, for a computer linked already, give it this space's accounts through the link, end-to-end encrypted.
  It signs in to XMPP as a new resource with an OMEMO device of its own and takes the Nostr chats' key with its relays;
  for Matrix it signs in with a one-use login token when the homeserver gives the phone one (`login/get_token`),
  otherwise it asks for the password once, then takes the account's cross-signing keys and key backup from the phone,
  so it is trusted without a Security Key and opens the messages from before. A computer keeps an account it has
  already, tries again what it could not bring each time it opens, and signs out of what it brought once unlinked;
  hidden places' accounts never go (`lib/linked-accounts.ts`, `lib/devices.ts`, `lib/link-wire.ts`). See [Linked
  devices](#devices).
- **Matrix: threads, polls, places and link previews**: **Reply in thread** in a message's menu opens the thread on a
  screen of its own, and a message with answers counts them; **Poll** (voted in its bubble, ended by its maker) and
  **Location** sit under the message box; the first link in a message goes with a preview when previews are on, never
  through Tor or in a hidden place (`lib/matrix-parts.ts`, `app/matrix-chat.tsx`, `components/matrix-message.tsx`).
  See [Matrix](#matrix).
- **Matrix: pins, forwarding, favourites and finding**: **Pin** and **Unpin** a message (a bar over the chat goes to
  it), **Forward** a copy to another chat (a chat not encrypted says so beside its name, as its server reads the copy),
  hold a chat for **Make a favourite**, **Low priority** or **Leave and forget**, **Find a group** among a server's
  public rooms and in the spaces you are in, and **Search messages** kept on the phone (`lib/matrix-rooms.ts`,
  `components/matrix-find.tsx`). See [Matrix](#matrix).
- **Matrix: make an account and look after devices**: **Make a new account** on a server that allows it, asking, when
  the server does, for its terms, a registration token or a step on its own page; **Devices** lists, renames and
  signs out the account's other devices (`lib/matrix-account.ts`, `components/matrix-register.tsx`,
  `components/matrix-devices.tsx`). See [Matrix](#matrix).
- **Older Matrix calls**: one-to-one calls as FluffyChat, Nheko and Element on a computer make them (`m.call.*`,
  version 1) ring here and can be made from here, encrypted in encrypted rooms, on the same call screen
  (`lib/matrix-voip.ts`). See [Matrix](#matrix).
- **XMPP: make an account, change the password, delete it, find groups**: in-band registration (XEP-0077), a new
  password, deleting the account for good, groups the server lists and a search of public channels
  (XEP-0433, search.jabber.network), **Location** as a geo: link, and link previews (XEP-0511) in chats written
  without encryption (`lib/xmpp.ts`, `lib/xmpp-muc.ts`, `lib/xmpp-links.ts`, `components/xmpp-*.tsx`). See [XMPP](#xmpp).
- **Delete me from everywhere**: Settings → Privacy and security → Delete me from everywhere deletes what the servers keep
  for the open space and stops it, and your phone keeps everything (`app/forget-me.tsx`, `lib/forget-me.ts`). It deletes
  every queue the space and its hidden places keep on the relays with the messages in them, the messages a relay holds
  for you to send later, files waiting there, and invites nobody used, and, through Tor, asks the Nostr relays to forget
  the keys your chats read on (a request to vanish, NIP-62); on request it also signs out of Matrix and XMPP and
  deletes the Nostr account made here. The screen's lists count the space's own queues only: the hidden places' are
  cleared but counted apart and never shown, as the lists would tell that the space has hidden chats. The space then
  reaches no relay and no Nostr relay until **Start again**, which makes new queues and tells contacts quietly. Files
  sent through a file server and what other people keep stay. See [Delete me from everywhere](#forget).
- **Every chat opens the same way, with the same arrows**: the Erevos chats, groups, SMS conversations and the Matrix,
  XMPP and Nostr chats all open at their last message with the message bar under it, and have the round arrows to the
  chat's start, to where you left off (the first message that was new when it opened, a double tick) and to its end
  (`components/thread-arrows.tsx`, `components/network-thread.tsx`, `lib/left-off.ts`). The Matrix, XMPP and Nostr
  screens scroll their head, thread and message bar together, so they follow what comes while read at the end, and
  hold their place while earlier messages load. See [Getting started](#start).
- **Bold, italic, code and hidden words**: marks typed around words, as in WhatsApp and Signal (`*bold*`, `_italic_`,
  `~struck~`, backticks for code, three for a block, `||hidden||`), show so in chats and groups (`lib/text-style.ts`,
  `components/linked-text.tsx`). A mark counts only where it starts and ends a word, never inside a web address or
  code; hidden words show a grey bar until tapped, each part apart, and are ▒▒▒ in the home screen's line, a quote
  and the search's lines (`plainWords`). Nothing travels beside the words: an Erevos from before shows the marks.
  See [Chat through a relay](#relay).
- **Hidden photo**: **+** → **Hidden photo** sends a photo marked `hidden` in what it says of itself
  (`lock/attachment-files.ts`, like a sticker's mark, kept only on a photo that is not a sticker); it shows blurred,
  with **Hidden photo · tap to see it**, until opened on its own (`components/attachment.tsx`), and in the lists of
  **Media, links and files** (`components/chat-media.tsx`). In contacts' chats, groups and through Nostr; forwarded, it
  stays hidden. An Erevos from before shows it as any photo.
- **Safety message**: under **+** in a contact's chat (hidden chats too), words that go only if the owner does not
  open Erevos for 6 or 12 hours, 1, 2 or 3 days or a week (`lib/safety.ts`). It is held by the relay as a message sent
  for later (`LATER`, no relay change); while Erevos shows past its password (`ownerLooks`, never in the background
  nor behind the password screen) it is held anew, at most every half hour, to go that long from then, and the one held
  before is taken back (`rearmSafety` in `lib/waiting.ts`, kept as `z` in `lock/history.ts`). It is sealed once and
  held anew as the same packets (`c`, `Resend`), so no key of the conversation is spent each time; "looking" also
  needs a touch, click or key in the last 10 minutes (`ownerTouched`); holding anew and deleting take turns
  (`inTurn`), and a deleted one is never held again. One no relay holds yet is put off too. See
  [Chat through a relay](#relay).
- **Name a member in a group with @**: typing **@** offers the members whose names start so, above the message box;
  the message carries who was named, by identity (`named`, at most 32, `lib/mentions.ts`), and a member named is told
  of it even in a group they muted (`messageCame`'s `named`, for the open space's groups and hidden places'). Only
  whole names count. An Erevos from before ignores the field. See [Group chats](#groups).
- **Reply, change, react and delete in XMPP chats**: holding a message in an XMPP chat or group opens the same menu
  as in a Matrix chat (`app/xmpp-chat.tsx`): **Reply** (XEP-0461, with the quote other apps show, XEP-0428), **Edit**
  (XEP-0308), **Delete** for everyone (XEP-0424, the older fastened form read too) and reactions (XEP-0444), sent and
  read as Conversations, Dino, Gajim, Monal and Kaidan do (`lib/xmpp-actions.ts`). The words of a reply and of a change
  go encrypted as the chat is; which message each is about, and a reaction's emoji, go as those apps send them, not
  encrypted. Only a message's writer may change or take it back (in a group, by their address when the room says it,
  else by their name there); in a group, a reaction, a reply and a deletion name the message by the room's id
  (XEP-0359, kept as `sid`). **typing…** shows while the other person's app says they write (XEP-0085). See [XMPP](#xmpp).
- **See who is writing in a Matrix chat**: `m.typing` from the sync's `ephemeral` part shows **typing…** under the
  chat (`matrixTyping` in `lib/matrix.ts`, trusted a minute without news). See [Matrix](#matrix).
- **Check a Matrix device by QR code** (`lib/matrix-qr.ts`, `lib/matrix-verify.ts`): requests and readies offer
  `m.qr_code.show.v1`, `m.qr_code.scan.v1` and `m.reciprocate.v1` beside `m.sas.v1`; both sides then choose. The code
  is the spec's (MATRIX, version 2, modes 0, 1 and 2), made only from keys this device trusts; a photographed code's
  second key has to be this side's own, and what it proves is trusted only after both sides sent done. Photos are read
  as bytes (`readQrPhotoBytes`: ZXing's byte segments on Android, jsQR's `binaryData` on the web). Before, an Erevos
  that asked started the emoji at once; now it waits for the choice, unless the other app offers no code.
- **A closed space tells of XMPP messages** (`lib/xmpp-push.ts`, `crates/erevos-relay/src/xmpp_push.rs`): the relay is
  the account's push app server (XEP-0357). It listens on port 5269 with STARTTLS, as XMPP servers reach each other, when
  `EREVOS_RELAY_XMPP_PUSH` names it, and counts one message in the news of the queue each publish's node names, keeping
  nothing; a phone asks for the name with the new `XMPP_PUSH` request. The space enables the push at its server (node =
  the queue's sender id), the door names the queue (`XMPP_PUSH_GROUP`), and it is asked of the server again at each
  session. Hetzner and the release only on Nekten's word: see `deploy/relay/README.md` ("XMPP notices"). See [XMPP](#xmpp).
- **Sign in to Matrix with single sign-on** (Android): `loginWays` reads the server's `/login` flows; `ssoLink` opens
  `/login/sso/redirect[/{idp}]` in the browser, which comes back to `erevos://matrix-sso` with a `loginToken`, then
  `signInWithToken` logs in with `m.login.token` (`app/matrix-sso.tsx`, `matrixSsoStart`/`matrixSsoFinish`). A
  sign-in waits 10 minutes, for the same space and key only. Cross-signing keys are made only when the server takes
  them without asking again (MSC3967). See [Matrix](#matrix).
- **Run an XMPP group**: an admin sets the subject (a `subject` message), takes members out (affiliation `none`; in a
  channel, role `none` by nick) or bars them (`outcast`); the owner renames the group (its settings form, and the
  bookmark) and makes members admins (`removeFromXmppGroup`, `setXmppGroupAdmin`, `renameXmppGroup` in
  `lib/xmpp-muc.ts`). **Run the group** and the buttons under each member show only to those who may. See [XMPP](#xmpp).
- **Profile pictures on Matrix and XMPP**: Matrix rooms and chats with one person show their picture (`m.room.avatar`,
  members' `avatar_url`: `roomAvatar` in `lib/matrix.ts`), XMPP contacts theirs (XEP-0084, `lib/xmpp-avatar.ts`: the
  note's SHA-1 is checked on the bytes, one at another address or over 256 KB is none), in the chat list
  (`components/network-picture.tsx`). **Choose a photo** / **Remove** on each account's screen set ours (Matrix
  `/profile/{user}/avatar_url` after an upload; XMPP publishes the data and the note in our PEP). Pictures are fetched
  as shown and kept in memory only; they are not encrypted, as in every app of those networks.
- **Say when I am writing** (XMPP and Matrix): a switch on each account's screen, off at first, so the others see
  **typing…** while you write (`components/say-typing.tsx`): XEP-0085 `composing`/`paused` with `no-store`, only to a
  contact who sees your presence and never in a group (`sendXmppTyping`), and Matrix `PUT /rooms/{id}/typing`
  (`sendTyping`). Said at most every 10 seconds, stopped 5 seconds after the last key. It goes through the server not
  encrypted, which the switch says. See [XMPP](#xmpp) and [Matrix](#matrix).
- **Block someone on XMPP**: **Block** / **Unblock** at the bottom of an XMPP chat, through the server (XEP-0191,
  `blockXmpp` in `lib/xmpp.ts`), so every app of the account is spared; the block list is read at each sign-in and
  follows the server's pushes from the account's other apps; what the archive still holds of someone blocked, and their
  requests, are dropped here too. See [XMPP](#xmpp).
- **Voice messages in XMPP chats**: the microphone of a Matrix chat (`components/matrix-voice.tsx`) under an XMPP
  chat's box too; the recording goes as a file through HTTP upload, encrypted as the chat is (`aesgcm://`), as
  Conversations sends one, and plays with **Play**. See [XMPP](#xmpp).
- **Matrix groups from Erevos**: **New group** on the Matrix screen (`createGroup` in `lib/matrix.ts`: `private_chat`,
  its name, Megolm from the start, the IDs written invited, at most 50), **Join a group** by `#alias:server` or room
  ID, and **Invite** in a group's chat (`inviteToRoom`; the homeserver refuses it for one who may not). Typing **@** in
  a group offers its members (`lib/mentions.ts`), and a message names those written whole in `m.mentions`, inside the
  encryption, so Element and others tell them. See [Matrix](#matrix).
- **The panic button on a computer and on Sailfish OS**: **Settings** → **Privacy and security** → **Panic button**
  wipes Erevos there too. The shell does it (`/__wipe`, `desktop/main.js` and `sailfish/src/shellserver.cpp`, behind
  the page's token as every shell path): the keystore, the sealed files, the page's own storage and the rest of the
  data folder, and, when chosen on the screen, the backups Erevos named in their folder. The computer then starts again
  as new; Sailfish OS closes, and its helper stops waiting at the relay. See [Panic button](#panic).

### Under the hood

- **Every relay queue on one list**: `lib/server-queues.ts` gathers every queue a space or hidden place keeps, and
  `checks/forget-me.check.ts` fails when a file makes queues and is not named there, so none is left behind by
  Delete me from everywhere. A stopped space (`lib/relay.ts`) asks a relay for nothing but to delete.
- **The panic button says when it refused**: a wipe asked by the trusted panic app while the switch was off, or by the
  app signed with another key, was refused with no trace (review of 2026-10-29). The time is now kept (`refused` in
  `Panic.kt`), and the panic screen says it in red, with **Got it**. An app moved to a new key by APK key rotation
  stays trusted (`hasSigningCertificate` finds the old key in its signing history); one signed otherwise can be
  trusted again as it is now, after a warning. See [Panic button](#panic).
- **Sailfish OS's firewall**: it already lets ports 1024–65535 in, so the same Wi-Fi's port 47905 needs no rule; the
  guide no longer says it may, and `sailfish/README.md` has the rule for a firewall made stricter by hand.
- **The release key's certificate SHA-256 in the README**, to check a downloaded APK with.
- **The home screen's chips stay on one line**: once a **Nostr** chip joined **All messages**, **SMS**, **Erevos**,
  **Matrix** and **XMPP** (on the Pixel, 4.0.0-rc.2), **Names** went to a line of its own and the chips moved as they
  came and went. They are now one line that slides to the side (`strip`, a horizontal `ScrollView` in
  `app/index.tsx`, reaching the list's sides), and the chosen tab's chip is scrolled into sight when it is tapped or
  swiped to. See [Getting started](#start).
- **Screens come down when the keyboard is gone**: back from another app that had its keyboard open, the home
  screen's buttons floated where the keyboard had been, over the chats (on the Pixel, 4.0.0-rc.2), until a keyboard
  opened again: the keyboard library kept the height of a keyboard that went without its animation, even after the
  1.21.14 resync. `KeyboardPaddedView` (`components/keyboard.tsx`, home, chats, SMS, contacts, groups, Chat with
  myself) now also hears Android itself: once React Native's `Keyboard` has said for 0.6 s that it is down (after
  `keyboardDidHide`, or as Erevos comes back), the screen ends at the bottom, and follows the library again as soon as
  the keyboard moves. Android's word comes as the keyboard starts to go, so the screen still moves down with it.

## 4.0.0-rc.2 (2026-10-29)

### For you

- **See what you type in a password or a PIN**: every secret field (the lock's password, the second password,
  backups' and backup pieces' passwords, a chat's PIN, the hidden chats' PIN, relay and home relay tokens, Matrix,
  XMPP and Nostr passwords and keys) has an eye at its end that shows what is typed and hides it again. They all go
  through `Input` in `components/ui.tsx`, which draws it (`EyeIcon`); hidden again each time the field shows anew, and
  still never offered to the password manager. Shown, it asks for no spelling or corrections, and on Android uses the
  `visible-password` keyboard, which keeps no words. See [Password lock](#lock).
- **Link for a website**: under **New chat** → **Your contact link**, **Link for a website** gives a link to put on a
  web page, such as a contact page, with a name for it: `https://erevos-web.lphl.nekten.eu/c#<the contact link>`
  (`contactPageLink` in `lib/contact-code.ts`). Its page in the web app (`pwa/c/`, signed with the rest, served as
  `/i/` is) reads the link on the device, offers Erevos (the APK on Android, the web app on an iPhone, the computer
  app) and opens `erevos://contact?…` or, in the web app, `/contact?…`; pasted in New chat, the app takes it too.
  It has no place on the relay in it (no `lend`), lasts as long as the contact link (New contact link ends it), and
  whoever adds it writes a message request first. The Add a contact screen now reads the whole link, backup relays
  and Nostr included, and shows the name it gives. Needs the next web publish for the page. See [Chat through a
  relay](#relay).

### Under the hood

- **A chat read as it opens stays read**: a chat opened right after its message came, from its notice or the home
  screen, shows its messages at once, only to read, while the look at the relay that brought them ends, which through
  Tor can take tens of seconds. Read then and left before the chat had opened, they still counted as unread on the
  home screen, as they were marked read only once it had. Now they are marked read as they show, in the history the
  home screen counts from (`openingChats` in `app/chat.tsx`); their phone hears that they were read with the chat's
  first look once it is open, and not if it is left before.
- **An update's download that stalls is tried again**: on Android, when the connection brings nothing for a while as
  the new version's APK downloads (`SocketTimeoutException`, a reset connection), Erevos starts the download again by
  itself, from the start, three times in all (`DOWNLOAD_TRIES`, `stalled` in `lib/updates.ts`), and then says so in
  words, in the app's language, instead of Android's own message in English. A download that cannot work, such as
  one with no network or to a full phone, still says why at once. See [Updates](#updates).
- **The relay stops on `SIGTERM` even with nowhere to log**: everything the relay logs goes through `elog!`, which
  drops a line it cannot write. `eprintln!` panicked when stderr was a closed pipe, which ended the thread that stops
  the relay on `SIGTERM` after it had kept the queues' news, so the relay went on running until killed, and could end
  a push thread the same way. Under systemd stderr goes to journald, which keeps it, so this did not arise there.

## 4.0.0-rc.1 (2026-10-29)

### For you

- **Hidden chats with phones nearby**: hidden chats used only their relay or Nostr; now, while a place is open, or
  receives while closed, its chats also reach a contact's phone over the same links as the space's (Bluetooth, Wi-Fi
  Aware, Wi-Fi Direct, the same Wi-Fi). What comes on the links opens in the space's chats first, as before; what opens
  in none of them is tried in the open space's places that are open or receive (`lib/place-nearby.ts`
  `unopenedNearby`, from `lib/receiver.ts`, the space's chat screen, the hidden chat screen and
  `lib/place-receiver.ts`), and what none takes is kept in memory unopened, as for another space, until such a place
  opens (`openHeldIn`). Where a place heard its contacts is its own (`lib/nearby.ts` `NearHeard`, `placeNear`), in
  memory only while its chat screen or its receiver holds it, never in the space's `heard`, so nothing the space shows
  or sends says that a hidden contact is near. A place's packets go as the space's do (`Nearby.offer`, and `deliver`
  with the place's `NearHeard` for what its receiver says back): on the contact's link when the place heard them there,
  the relay's copy then unwaited; otherwise the small ones to every phone linked, and the relay is still waited for, so
  what waits goes again and shows once by its tag (`lib/waiting.ts` `handOverHidden`, `SendPlace.near`). Never carried,
  never over LoRa or by SMS, nothing new advertised and nothing written: the links' nonces stay as they were. Groups of
  hidden chats still go through the relay only, and calls in hidden chats are set up as before
  (`checks/place-nearby.check.ts`).
- **The same Wi-Fi on Sailfish OS**: the Sailfish shell links with Erevos phones and computers on the same Wi-Fi or a
  hotspot (`sailfish/src/lanlink.cpp`, the protocol of `desktop/lan.js` and `LanLink.kt`, with a new nonce each start),
  and answers `/__lan` as the desktop shell does, so the page's `lib/radio.ts` drives it the same way (`HAS_LINKS` on
  Sailfish OS too). Checked on a computer with Qt 5 against `desktop/lan.js` over real UDP broadcasts and TCP
  (`sailfish/lan-check/run.sh`); not yet on a phone, and the phone's firewall may need port 47905 open.

- **Backup pieces with friends**: **Settings** → **Data and devices** → **Backup pieces** (`app/backup-pieces.tsx`)
  splits the backups' password, and the WebDAV server's address, user and app password when one is set, with Shamir's
  secret sharing over GF(256) (`lib/shamir.ts`, written here, no new dependency) into 2 of 3, 2 of 4, 3 of 4 or 3 of 5
  pieces (`lib/backup-pieces.ts`). The secret split is always 320 bytes, padded with random bytes and ended with 16
  bytes of its own SHA-256, inside the split, so no piece gives anything to test a guessed password against; a piece
  is its version, k, x, a random 8-byte set id drawn anew for each split, its share and a 4-byte hash of the piece,
  which catches one mistyped. With automatic backups on, the password typed is checked against their key first
  (`lock/backup.ts` `isBackupPassword`). Each piece goes to a contact chosen beside words that never hold it (`piece`,
  `lib/chat-parts.ts`), as a waiting message of their chat (`lib/pieces-kept.ts`, `lib/waiting.ts`); until it went the
  piece waits apart (`E2EData.pieces.out`), then is deleted, so the giver's phone keeps only the set id, k, n and to
  whom. The friend's Erevos keeps it apart from the chat (`pieces.held`), never from a message request, and shows it
  as a QR code, copies it, or gives it back in the chat; pieces of one's own split come back to `pieces.back`. Put
  together from codes scanned or pasted, any k that fit give the password, and **Restore from that server** lists the
  backups there (`checks/backup-pieces.check.ts`: GF(256) against bitwise multiplication, every k-subset of every
  split, k - 1 refused, uniform share values for every secret, forged and mixed pieces, the full trip through three
  chats with the real core).

- **Panic button**: **Settings** → **Privacy and security** → **Panic button** (`app/panic.tsx`, `lib/panic.ts`)
  wipes everything Erevos keeps on the device, on Android and in the web app. On Android, Android clears Erevos's data
  as **Clear storage** does (`ActivityManager.clearApplicationUserData`, `Panic.kt`): every space and hidden chat with
  keys, contacts, history and files, the lock, the Matrix, XMPP and Nostr accounts, the relay tokens, automatic
  backups' key, settings and server credentials, and the Android Keystore keys; when chosen, the `erevos-backup-*`
  files in the automatic backups' folder go first. In the web app, the whole IndexedDB database goes, with the key
  that sealed its secrets, and the Web Push subscription. Erevos is also a PanicKit responder (`PanicActivity.kt`,
  `info.guardianproject.panic.action.TRIGGER`, `CONNECT`, `DISCONNECT`): a panic app such as Ripple asks with
  CONNECT, the owner says yes on the panic screen after the password, and only then, and only while **A panic app may
  wipe Erevos** is on, does a TRIGGER from that package, named by Android through `getCallingActivity` and signed with
  the certificates hashed when it was trusted, wipe; any other request does nothing and is told nothing
  (`checks/panic.check.ts`). Not on the desktop app or Sailfish OS.

- **Erevos to a phone nearby, with no internet**: **Settings** → **General** → **Give Erevos to a phone nearby**
  (`app/give-app.tsx`, `lib/give-app.ts`) serves the APK Android installed (`applicationInfo.sourceDir`; refused when
  installed as split APKs) from a small HTTP server on the phone (`ApkServer.kt`, `NearbyApk.kt`): IPv4 only, a random
  128-bit path, only to peers inside the subnet of a Wi-Fi, hotspot or USB tethering interface (never mobile data),
  four at a time, GET and HEAD only, stopped after ten minutes, 30 refused requests, **Stop** or leaving the screen.
  Its page has no script (`default-src 'none'`) and shows the package's SHA-256 and its signing certificates'. The QR
  code holds `http://<address>:<port>/<token>/#sha256=<hex>` (`lib/nearby-link.ts`), so any camera opens the page,
  while the hash, after `#`, never goes over the network. An Erevos with **Updates** takes it under **From a phone
  nearby**: over a raw socket (Android's HTTP clients refuse cleartext), only from a private IPv4 address, at most
  400 MB, kept only when its SHA-256 is the code's, `getPackageArchiveInfo` names this package, its signing
  certificates are this Erevos's and its version code is higher; then Android's installer opens as for an update
  (`checks/give-app.check.ts`).

- **Introduce two contacts to each other**: in a contact's chat details, **Introduce to a contact** and **Ask both**
  (`lib/intros.ts`). The phone that introduces (R) asks each of the two in its own chat with them, inside the
  end-to-end encryption, with words an older Erevos shows as they are (`intro` step `ask`, `lib/chat-parts.ts`), each
  seeing the name R gave the other. Each answers **Say yes** or **Say no**. The second one's yes carries its contact
  link and a new invite secret (`lib/welcome.ts`, kept 7 days under the name R gave the first); R checks the link is
  that contact's own key, and only once both said yes passes it to the first (`go`), keeping nothing of it after.
  The first adds it with the secret, so the second's phone takes them at once instead of as a message request. R
  learns nothing of the first and, of the second, only the link it chose to give; neither learns whether the other
  said no. Steps for an introduction this phone did not make or say yes to, from someone else, from a message request,
  or again, do nothing; R could still pass off another key, so the new contact's safety number is checked as any
  (`checks/intros.check.ts`, with the real core). Kept with the chats (`E2EData.intros`), a week at most.
- **A list of home relays in the contact link**: **Settings** → **Relay and networks** → **Home relay** takes up to
  three, each with a queue of its own (`SpaceData.spare.more`, `lib/spare.ts` `setSpareRelays`, `homeRelays`); each
  is looked at, and this phone's own sends go through the first one ready when its relay is down. The contact link
  names the others after the first as `sid2`/`srelay2`/`srk2` and `sid3`/... (`lib/contact-code.ts`), but only while
  the link stays within 2550 characters (`LINK_MOST`), so it and an invite around it still fit one QR code; every
  message says them all inside the encryption (`Spare.more`, at most two, each relay once), so a contact also learns
  those the link left out. A contact tries the main queue, then each home relay in order, through its own relay and
  then through its own first home relay (`contactTarget`). An Erevos before this reads the link and the messages as
  before and uses only the first home relay; hidden places keep one home relay each. Checked with real relays in
  `checks/spare.check.ts`.
- **Check a contact in person with QR codes**: under **Safety number** in a contact's details, each phone shows a QR
  code; **Take a photo of their code** (or **Choose a photo of their code**) checks the other phone's, and the contact
  is marked **Checked in person** with the day, until **Take the mark off**. The code is `EREVOSV1:` and the SHA-256
  of a label, the identity key of the phone that shows it (as the other knows it) and the one it holds for the other,
  in that order (`lib/verify-code.ts`): a key someone in between gave either phone makes it differ, a photo of the
  phone's own code is told apart and checks nothing, and the keys themselves are not in it. Each phone marks only what
  it saw itself; nothing is sent, so a contact cannot claim to be checked. A later version's code (`EREVOSV2:`) is
  said to be from a newer Erevos, never read as an older one. Not a link, so a camera app opens nothing. The mark
  (`Contact.verified`) is kept with the contact, moves with the chat into or out of hidden chats, and is not shared
  with linked devices (`checks/verify-code.check.ts`).
- **Encrypted SMS when nothing else works** (Android, off unless turned on): when the relay, Nostr, the phones nearby
  and LoRa all fail, a text or a delete to an Erevos contact whose phone number is linked goes as data SMS to Erevos's
  SMS port (the invite port, told apart by its first byte), so no SMS app shows them: the same end-to-end encrypted
  packets the relay carries, nothing sealed anew, in pieces of 133 bytes (`lib/sms-packets.ts`: 'P', version, a 4-byte
  id that is the start of the whole's SHA-256, index, count), 3 SMS for a short text and at most 10, so the first
  message of a conversation, photos, files, voice messages, marks and calls never go so. On for every contact with a
  number under **Settings** → **Phone and SMS** → **SMS** → **SMS when nothing else works**, or for one in the chat's
  **Details**; kept in the space's SMS state, not in backups. The phone that gets them keeps the pieces in the app's
  own storage (at most 96, 32 from one number, two hours), puts them together (a whole whose digest does not match is
  dropped, as is a message that does not come whole in 30 minutes; at most 12 wait), opens them as what comes from a
  phone nearby, and forgets them; a message taken twice opens once. Marks go back through the relay or Nostr once
  they can be reached. The message menu says **Went by SMS** / **Came by SMS** (route `sms`), and the note under the
  messages says what it costs and what the phone company sees. Both phones need Erevos as the SMS app; sending waits
  for the phone to say each piece went. Hidden chats never use it. `checks/sms-way.check.ts`.
- **Spam SMS come quietly** (Android): an SMS that Spam's built-in rule catches (from a phone number that is in none
  of the phone's contacts and was never answered, with a link and words that try to fool, read as the filter reads
  them: look-alike letters and invisible marks folded) is kept and goes to **Spam** as before, but the phone shows no
  notice for it and the app plays no sound (`onSms` carries `spam`). Only the built-in phrases are on the phone
  (`BuiltInSpam.kt`, kept equal to `lib/sms-folders.ts` by `checks/sms-folders.check.ts` and
  `checks/built-in-spam.json`); the owner's words, rules and marks stay encrypted in the space, so their spam still
  has a notice, and a number marked **Not spam** or let through but not in the phone's contacts comes quietly too when
  it sends such words. The only thing kept outside the space is whether the **Spam filter** is on, as the space
  opened last says, so with it off every SMS has its notice. Contacts', answered numbers' and short codes' notices
  are as before; without the contacts permission nothing is held back.
- **Backups to your own server from a computer and the web app too**: in the desktop app, automatic backups can go to a
  WebDAV server as on Android, and **Restore from a server** works there too. The app's shell sends each request
  (a new path, /__webdav: https only, only PROPFIND, PUT, GET and DELETE, only the Authorization, Depth and
  Content-Type headers, no cookies, no redirects), because a page may not read such a server's answers (CORS). In the
  web app, which makes no backups by itself, **Send a backup now** sends one there with a password typed each time,
  and **Restore from a server** lists and opens them; a browser reaches only a server set to let the web app in
  (CORS), which Nextcloud is not as it comes, and says so when it is not let in. Neither has Tor for it, so a space
  sending Everything through Tor sends none from there. Not on Sailfish OS. The web app's and the desktop's content
  security policies are unchanged (they already let the page reach any https address).
- **Restore a backup straight from your server**: under **Settings** → **Data and devices** → **Backups**,
  **Restore from a server** lists the backups in the folder automatic backups go to, or in one you give with its user
  name and password (on a new phone), newest first; the one chosen is downloaded, through Tor as the space says, and
  opened with its password as a file is. Only names Erevos gives are shown, nothing is written on the server, and a
  password typed for it is not kept. Before, it had to be downloaded by hand and chosen under **Restore a backup**.
  Through Tor a backup over 64 MB does not come.
- **Backups to your own server through Tor** (Android): automatic backups sent to a WebDAV server now go as the
  space's choice under **Settings** → **Relay and networks** → **Tor** says, as Matrix does: with Everything only
  through Tor, with Messages through Tor once it is ready and straight while it starts or when it fails, with Nothing
  straight. Before, a space sending Everything through Tor sent none. A backup made as Erevos opens first waits up to
  two minutes for Tor, and **To a server too** says whether the server sees the phone's address now.
- **Media, links and files in groups too**: in a group's details, a list of its photos, videos, voice messages,
  music, files and links, each kind apart under its months, with a calendar, as in a contact's chat. A tap opens or
  plays; held, each goes to its message.
- **Every message says which way it went**: hold a message and its menu says whether it went or came through the relay,
  through Nostr, to a phone nearby or over LoRa. Messages from before say nothing.
- **More battery saved in the background, if you choose** (Android): under **Settings** → **Notifications** →
  **In the background**, **Only the waste** stays the default. **And nearby phones** also turns off the radios for
  phones nearby (Bluetooth, Wi-Fi Aware, Wi-Fi Direct and the same Wi-Fi) while Erevos is in the background, so a
  phone nearby reaches you only while Erevos shows. **And sleep** also lets the phone sleep: Erevos holds no wake lock
  and looks at your relay about once a minute, so a message or a call can be a minute or two late.
- **Photos, files and voice messages with no relay**: when there is no relay between you and your contact and they
  read on Nostr, a voice message goes through Nostr like a text, in as many wraps as it takes. A photo up to 3 MB goes
  in pieces of 32 KB, each in a wrap, sent before the message that offers it; the other phone keeps them until all
  have come, four days at most. A larger photo, a video or any other file, up to 20 MB, goes as one blob, encrypted on
  the phone, to a Blossom file server through Tor, which keeps only what it cannot read. Calls and groups still need
  a relay. Before, only texts went so.
- **A new sticker set, Takis**: a caricature in a dark suit and a purple tie with dots, in 24 moods
  that move, as Tux and the aikidoka do.
- **Erevos's icon keeps the number of messages not read** (Android): the notice for messages went as soon as Erevos
  opened, and the launcher's number or dot on Erevos's icon with it, though messages were still not read. Now, leaving
  Erevos with messages not read in the open space's chats and groups, a notice without sound says how many, and counts
  on with those it tells of after, until you read them; a muted chat's are left out, and a hidden chat's as you leave.
  The launcher shows it on the icon, as a number, or on some phones, such as Pixels, as a dot. **Settings** →
  **Notifications** → **Number on the icon**, the web app's switch, turns it off: the notice then tells only of what
  came since Erevos was last open, as before.
- **Notifications for each chat**: on Android, a chat's details, and a group's, have **Notifications**. **Muted** for
  8 hours, 1 week or **Always**, its messages make no sound and show no notice, and Erevos's icon does not count them;
  the list still shows them, with a struck-through bell, and its calls still ring. **Message sound** and **Ringtone**
  give its messages and its calls a sound of their own, from Android's own list of sounds, or **Without sound**. Kept
  on this phone only, with the chat. Hidden chats can only be muted: a sound of their own would tell which chat it is.
- **The user guide is in every language of the app**: German, Spanish, French, Italian, Portuguese and
  Serbo-Croatian join Greek and English, with the same parts, and each names the buttons as the app shows them
  in that language. Until now the guide showed in English in those languages. Android's own call screen and
  notices still show in English there, and the guide says so.
- **Location finds where you are, indoors too**: **Location** under **+** looked only by satellite when
  Erevos might use the precise location, which indoors finds nothing in 30 seconds, and said so only in a
  small line under the chat; with only the approximate location allowed, a phone without Google's network
  location was said to have its location off. The phone now looks on every way it has at once (satellite,
  its network location, and from Android 12 Android's own mix of them) for up to a minute, and takes the
  nearest place it finds. A sheet opens at once and says it is looking; when nothing comes in time, it offers
  the place the phone found in the last ten minutes, saying how long ago, or says why none was found, with
  **Try again** and a button to the phone's setting that changes it. Closing the sheet stops the look.
- **What's new in two parts**: each version in **What's new**, and each release here, says first what changes
  **for you**, what you see and use, then what changed **under the hood**: fixes, speed, battery and security
  inside.
- **The web app's icon counts what is not read**: on an iPhone or iPad (16.4 or later), Erevos on the home
  screen showed no number on its icon. With notifications while closed on for the space, the icon now shows how
  many messages the space you had open has not read, also once Erevos is closed, and goes up with each one a
  push tells of. A hidden chat never counts; a space with notifications off adds none of its own, though pushes
  for another space with them on still count. **Settings** → **Notifications** → **Number on the icon** turns it
  off. Also on a Mac with Safari's Add to Dock, and in the web app installed from Chrome or Edge on Windows,
  macOS or ChromeOS.
- **The web app's notifications, more dependable**: no **New message** banner shows over Erevos while it is open on
  the screen, and in Chrome, Firefox and Edge every notice sounds, not only the first after Erevos was last open.
  When the browser changes its push address, as Chrome may now and then, or the push service drops it, Erevos gives
  your relay the new one by itself as it comes back on the screen: until now notifications stopped until it was
  started again. A push that comes late, held back by its push service while the phone was offline, no longer counts
  again the messages you read meanwhile. **Settings** → **Notifications** → **Notifications while closed** says when
  the browser or the phone does not allow them, and when your relay could not be told yet that they are off, which
  Erevos tells it as soon as it can reach it; also that spaces on different relays share the browser's
  notifications, and that a message request may show only once Erevos opens. The permissions screen now leads there,
  not to **Lock**. The banner, a dropped address and a late push of a round never shown before need the relay
  updated.
- **Permissions checks every notice Erevos uses** (Android): **Settings** → **General** → **Permissions** looked only
  at the "Calls" and "Messages" notices, so with "Messages without sound", "Messages with a chat's own sound" or
  "Reminders" turned off in Android's settings, nothing showed for them, the number on the icon went too, and it
  still said all was allowed. Now the message notice counts as off when any of its three is, with a button to the
  one that is off, and the reminder notice has a row of its own once a reminder came. **Exact times** says it is for
  reminders too.
- **Hidden chats say what their switches need**: **Say when a message comes** and **Ring calls when closed** were
  saved as on while **Settings** → **Notifications** → **In the background** let them do nothing, and nothing said
  so. Each now says under it, while that is so, which setting it needs.
- **Truer words about notices**: the hints in **Settings** → **Notifications** and in hidden chats, and the guide, now
  give the notices' own words ("Erevos – Ready for calls and messages", "Incoming call" or "Incoming video call",
  **Reminder**), and say that hidden chats with **Receive while closed** come as the space's chats do, that their
  switches work with Erevos showing too, that a closed space that goes through Tor says nothing while the open one
  has no Tor ready, that a message sent without sound sounds in the notices of closed chats, that a message request
  sounds as any message does, that a computer shows no notices, and that after **Force stop** no notice says Erevos
  stopped.
- **Photos open on the whole screen**: a photo tapped in a chat, a group, Chat with myself, an imported chat or
  **Media, links and files** now shows edge to edge on black, turned as the phone is. Two fingers or a double tap zoom
  in, one finger moves it while zoomed, and a tap hides or shows its size and **Save** and **Close**. It is decoded at
  about twice the screen's size, so a very big photo, such as one of 50 megapixels, opens as a small one does instead
  of being drawn whole. Erevos also turns with the phone while the phone's **Auto-rotate** is on (it was held upright),
  and a photo shown on its own turns with it even when **Auto-rotate** is off.

- **Matrix accounts in Erevos**: under **Settings** → **Relay and networks** → **Matrix**, a space signs in to a
  Matrix account as a new device named Erevos, and chats with people who use Element or another Matrix app: invites
  with **Join** and **Decline**, **New chat** with a Matrix ID, and text both ways, end-to-end encrypted with Matrix's
  own Olm and Megolm through vodozemac. Erevos talks to the Matrix server itself, with no bridge in between, and sets
  up cross-signing for an account that has none. These chats are not anonymous, and say so: the Matrix server sees
  who talks with whom, and when. The sign-in is kept sealed in that space only, not in its hidden chats nor in
  backups yet. Photos and files go too, up to 50 MB, encrypted on the phone before upload as Matrix does it
  (AES-256-CTR, checked by SHA-256 on the way back), so Element and others open them; a photo you get is fetched only
  when you tap **Show photo**.
- **Every network's chats on the home screen**: once you sign in to Matrix, its chats are in the list with the Erevos
  chats and the SMS, newest first, each marked **Matrix**, with an invite at the top; the **Matrix** chip shows them
  alone, as **SMS** and **Erevos** do, and there **New chat** starts a Matrix chat. The space's Matrix account syncs
  while the space is open.
- **Check Matrix devices by emoji**: **Check by emoji**, in a chat with one person, and **Check this device with
  another of yours**, on the Matrix screen, show both sides seven pictures (m.sas.v1, hkdf-hmac-sha256.v2), as Element
  does, so either app can start it. Once both say they match, the device's key and the account's master key are taken
  as theirs, and, when this device made the account's cross-signing keys, signed, so Element shows them as checked.
  The check's one-use key never leaves memory.
- **Matrix Security Key and key backup**: under **Settings** → **Relay and networks** → **Matrix**, the Security Key
  (or Security Phrase) Element made opens the account's secret storage (m.secret_storage.v1.aes-hmac-sha2): its
  cross-signing keys, taken only when they match the account's, sign this device; its key backup
  (m.megolm_backup.v1.curve25519-aes-sha2) gives the keys of the messages shown locked, and takes the room keys this
  device makes or gets. An account with none gets both here, with a new Security Key to write down; Erevos keeps it
  nowhere.
- **Matrix through Tor**: on Android, everything Matrix sends and fetches follows the space's choice under
  **Settings** → **Relay and networks** → **Tor**: with **Messages** through Tor once it is ready, and straight while
  it starts or when it fails; with **Everything** only through Tor; with **Nothing** straight. Each homeserver gets a
  Tor circuit of its own, apart from the relays'. The Matrix screen says which way it goes now.
- **XMPP accounts in Erevos**: under **Settings** → **Relay and networks** → **XMPP**, a space signs in to an XMPP
  account, as a new device, and chats with people who use Conversations, Monal, Gajim, Dino or another XMPP app. Erevos
  talks to the XMPP server itself, with no bridge in between; the sign-in is SCRAM, which also proves the server knows
  the password. Messages are encrypted with OMEMO 0.3, to each of the person's devices and to the account's other
  devices, which read along; Erevos's own code, checked against python-oldmemo both ways, not audited. A person whose
  apps have no OMEMO gets nothing unless you choose **Write without encryption** for that chat. The keys of their
  devices are listed under the chat, and a key that changed says so. Delivery and read marks, what came while Erevos
  was closed (from the server's archive), people who ask to add you (**Accept**, **Decline**), and the chats in the home
  list under an **XMPP** chip of their own. These chats are not anonymous, and say so: the XMPP server sees who talks
  with whom, and when. On Android the connection follows the space's choice under **Tor**, with a circuit of its own
  per server; the web app and the computer connect through the server's WebSocket, straight. Text, calls, photos,
  files and groups (below), and OMEMO 2 (below) for the apps that have it.

- **Voice and video calls with people on XMPP**: the two tiles at the top of an XMPP chat call the person, on the same
  call screen as Erevos's own calls, and their calls ring here the same way while the space is open; someone not in
  the account's contacts shows only as a missed call. Erevos calls as Conversations does: XEP-0353 rings all their
  devices, the one that answers gets the call with Jingle (XEP-0166/0167, ICE-UDP, DTLS-SRTP, bundled, with addresses
  that come one at a time), and an end is told with both. Older apps that start with Jingle at once ring too. Each call
  leaves one line in its chat: its length, or why it did not happen. The call goes through the space's call relay, else
  the XMPP server's TURN server (XEP-0215), and only through it, so the other side does not learn this phone's
  address; with neither, it goes straight. The key fingerprint that proves the call passes through the XMPP servers as
  it is, not end-to-end encrypted, and a call never goes through Tor. Checked against Chromium's WebRTC and a real
  Prosody, not yet with Conversations on a phone.
- **Voice and video calls with people on Matrix** (Android): the two tiles at the top of a Matrix chat call by voice
  or with video, with Element Call, the call app Element and Element X use (0.28.0, carried inside the app, its files
  served from the app itself, with its telemetry, its error reports and its own config left out). It opens in a window
  of its own, which Back or leaving Erevos makes small (picture in picture), and its earpiece or loudspeaker switch
  moves Erevos's own call sound. Erevos is its host through the Matrix Widget API, as Element is: it lets it into the
  call's room only, to send and read a call's events there and nothing else (its own member state, now or delayed with
  MSC4140 so a lost phone leaves the call by itself, its ring, its decline, its media keys encrypted as the room is,
  and to-device through Olm), answers who the account is to the media server with an OpenID token, and names that
  server from the homeserver (MSC4143) or its .well-known. Calls to you ring as Erevos's own do while the space is
  open (MSC4075 rings that mention you; up to two minutes), stop when the caller leaves, or when another of your
  devices answers or turns them down, and **Decline** tells the caller (MSC4310). Each call leaves one line in its
  chat; a ring missed while Erevos was closed leaves its line when the space next syncs. Sound and picture are
  end-to-end encrypted, per person, and go through the media server (LiveKit) the Matrix server names, never through
  Tor; what Element Call asks of the Matrix server goes through Erevos, so through Tor as Matrix does, and its own
  requests to a Matrix server are refused. Older one-to-one Matrix calls (m.call.*, as FluffyChat makes them) do not
  ring here. While a Matrix call is on or ringing, another call, Erevos's own or one on XMPP, does not ring, and the
  other way round: it shows as missed. Checked against a homeserver played in the checks with the real core, and the
  real Element Call in Chromium up to the media server; not yet on a phone with Element X.
- **Voice and video calls with people on Matrix, in the web app and on the computer** (Windows, macOS, Linux): the two
  tiles at the top of a Matrix chat call with Element Call there too, as on Android, and its window opens over the app.
  Its back arrow, or the Escape key, makes it small in a corner over Erevos, so Erevos can be used during the call, and
  a tap on the small window brings it back to full size; until Element Call first speaks, a **Close** button under it
  ends the call, should it never start. What it says to the Matrix server goes through Erevos, as on Android, and it
  reaches no tracker. In the web app Element Call comes from a second address of its own
  (erevos-call.lphl.nekten.eu), and on the computer from a separate part of the app (app://element-call), so it can
  read nothing of Erevos, its keys and chats included; the web app checks its files against the same signed release as
  its own before it runs it, which makes the first call a moment longer. The browser or the computer asks once for the
  camera and the microphone, on the computer only the call window may use the camera, and where the sound goes is the
  browser's or the computer's to choose. Sailfish OS has no Matrix calls.
- **Chats with people on other Nostr apps**: under **Settings** → **Relay and networks** → **Nostr chats**, a space
  gets a Nostr key of its own (made there, or brought from another app as its nsec) and chats one to one or in groups
  with people who use Damus, Amethyst, Primal, 0xchat or another app that speaks NIP-17. Each message is a kind 14 sealed by the
  sender (kind 13, NIP-44) and wrapped by a one-time key (kind 1059, NIP-59), times set back up to two days, sent only
  to the relays the reader names (their kind 10050), with a copy to the space's own for its other apps. The space's own
  list (relay.damus.io, nos.lol, relay.primal.net unless changed, three at most) and the name it gives itself, if any,
  go out when changed and once a week. Only the connection that reads the space's relays answers a relay that asks who
  reads (NIP-42); sending and looking people up never say. Keys as people write them: npub, nprofile, nostr: links,
  and name@domain (NIP-05). On Android through Tor as the space's Tor way says, elsewhere straight. A stranger cannot
  fill the space with chats: past 300, one with nothing of ours makes room. Chats are in the home list under a
  **Nostr** chip. The key and the chats are kept encrypted in the space only, not in hidden chats or backups yet.
  Checked against NIP-17's and NIP-19's own examples and against nostr-tools both ways; not yet with a Nostr app on a
  phone.
- **Photos, files, reactions and groups in Nostr chats**: **Photo** and **File** send one of up to 20 MB as NIP-17
  does (kind 15): encrypted on the phone with AES-256-GCM by a key and nonce made for it alone, put on the first Blossom
  server that takes it (blossom.primal.net, blossom.band, nostr.download unless the space lists its own), the upload
  signed by a one-time key so the server cannot tell whose it is, and on Android through Tor as the chats go. One that
  comes is fetched only when asked for, checked against its hash, then opened, with any nonce length, as some apps send
  16 bytes. Reactions (kind 7, NIP-25): hold a message for six, and each person's last one shows under it, also one that
  came before its message. Groups as NIP-17 makes them: the people a message names, up to 20 others, with a name any
  member can change; **New group** makes one from the space's chats, and a message from another app to several people
  opens one. Not yet: files encrypted otherwise than with AES-GCM.
  Checked with a Blossom server played in the checks; not yet against the real ones.
- **Photos and files in XMPP chats**: **Photo** and **File** send one of up to 50 MB, or less when the XMPP server
  takes less, through the server's HTTP upload (XEP-0363), as Conversations, Monal, Gajim and Dino share them. In an
  encrypted chat the file is encrypted on the phone with AES-256-GCM by a key and IV made for it alone and put on the
  server under a random name, and the message, encrypted with OMEMO as any other, holds only its aesgcm:// link with
  the key (XEP-0454), so the server keeps what it cannot read. In a chat written without encryption it goes as it is,
  its link also out of band (XEP-0066). One that comes is fetched only when asked for, on Android through Tor as the
  chat goes, and an encrypted one opens only if nothing in it changed. A sound that comes in an XMPP or Nostr chat now
  plays with **Play**. Checked with an upload service played in the checks; not yet with a real server.
- **Groups on XMPP**: under **Settings** → **Relay and networks** → **XMPP**, **New group** makes a private group on the
  XMPP server from a name and the account's contacts, who are invited, and **Join a group** joins one by its address,
  with its password if it asks for one. A private group is for its members only and shows everyone's address to
  everyone, as Conversations' private groups do, and every message in it is encrypted with OMEMO to each member's
  devices (and to the account's other devices), so the group's server keeps only what it cannot read; a member with no
  OMEMO app is marked and cannot read it, and when nobody in the group has one the chat offers **Write without
  encryption**. Any other group is a channel: not encrypted, and it says so, and it tells only of messages that name
  you. Under a private group are its **Members** with their keys to compare, and its admin can **Add people**.
  Invitations from the account's contacts show on the XMPP screen and at the top of the home list, with **Join** and
  **Decline**; anyone else's are not shown. The groups are kept in the account's bookmarks (XEP-0402), so its other XMPP
  apps join and leave the same ones, and what a group's archive holds comes when it is joined. Checked with a group
  service played in the checks; not yet with a real server or with Conversations on a phone.
- **Reactions, replies, edits, deleting, older messages and voice messages in Matrix chats**: a message held down opens
  its menu: a reaction at the top, **Reply**, **Copy**, and for one of yours **Edit** and **Delete**. A reaction goes as
  a plain `m.reaction`, as Element sends it, because its relation is readable to the homeserver anyway and an encrypted
  one would wake the other's phone as a message does; tapping one under a message reacts the same or takes ours back (a
  redaction). An answer shows the message it answers over its words, and a tap goes to it; one from an older app, which
  also copies the message into its words, is read without the copy. Only the original sender's `m.replace` changes a
  message, so nobody else can edit it for them, and a changed message says **Edited**. **Delete** sends an
  `m.room.redaction` for everyone in the room after a confirmation, and what the message said is gone from the chat. A
  room with more history offers **Load earlier messages** (`/messages?dir=b`, page by page, the chat staying where it
  was read); a message still locked there may open from the key backup later, and a reaction or change that comes before
  its message waits for it, up to 400. The microphone under the message box records a voice message while it is held, a
  minute at most, and sends it as Element does: an `m.audio` with `org.matrix.msc3245.voice` and its duration, encrypted
  like any file in an encrypted room (AAC from a phone, Opus from the web app and the computer); one that comes plays
  with **Play**, fetched when it is played. Checked with the homeserver played in the checks, two people through each
  other; not yet with Element on a phone.
- **Video added to a voice call with someone on XMPP**: **Add video**, on the call screen, turns the camera on and sends
  the other side the video as Jingle's `content-add`, as Conversations does. The other person is asked first (the
  name wants to turn on video, with **Not now** and **Turn on video**) and can say no, which leaves the call as it was
  (`content-reject`); a yes (`content-accept`) turns their camera on too. Either side can add it, once the call is
  connected, and not while another request is open. Checked with the other side played in the checks; not yet with
  Conversations on a phone.
- **Voice messages and replies in Nostr chats**: the microphone under the message box records a voice message while it is
  held, a minute at most. It goes as a NIP-17 file (kind 15, an audio file encrypted on the phone and put on the
  space's file server) with a `duration` tag in seconds; one that comes with a length plays with **Play** and shows how
  long it lasts, fetched when it is played. Holding a message opens its menu: the reactions, **Reply** and **Copy**. A
  reply goes as a kind 14 whose `e` tag is marked `reply` (`["e", id, "", "reply"]`), the tag marked `reply` winning
  over the first `e` tag when a message has several, so other Nostr apps show it as an answer; the answer shows the
  message it answers over its words, and a tap goes to it. A photo, file or voice message sent while a message shows
  over the field answers it too: its kind 15 carries the same `e` tag (`nostrDmSendFile(key, file, replyTo)`).
  Checked with relays and a file server played in the checks; not yet with a Nostr app on a phone.
- **Matrix voice messages show their waveform**: a voice message carries its waveform as Element sends and draws one
  (MSC3246: `waveform` in `org.matrix.msc1767.audio`, at most 100 values of 0 to 1024): the recorder samples how loud
  it is ten times a second (`isMeteringEnabled` in `app/lib/audio.ts` and `app/lib/audio.web.ts`), and each value is the
  loudest of its stretch (`waveformOf` in `app/lib/voice.ts`). One that comes with a waveform shows it in 40 bars under
  **Play**, coloured as it plays (`VoiceClip` in `app/components/matrix-voice.tsx`). Checked in
  `app/checks/matrix.check.ts` (sent, read back the same, drawn in fewer bars, and a broken one drawn as none); not
  yet on a phone. Video thumbnails stay out: a video, as a photo, is fetched only when tapped.
- **OMEMO 2 in XMPP chats**: Erevos also speaks OMEMO 2 (XEP-0384 version 0.8, `urn:xmpp:omemo:2`), as Kaidan and
  the other apps built on QXmpp do, beside OMEMO 0.3: each device gets the version its app has, and a message to someone
  with both kinds carries both. One identity serves both, its OMEMO 2 form the Ed25519 key it signs with, with its own
  signed pre-key and 100 pre-keys published in `urn:xmpp:omemo:2:bundles`; the payload is an SCE envelope (XEP-0420),
  padded, and one that says it is from someone else or for another chat is not opened. The XMPP screen shows this
  device's key both ways, the second as Kaidan shows it. The core is checked against python-twomemo both ways
  (`docs/xmpp-checks/twomemo-cross.py`), the rest with apps of each kind played in the checks; not yet with Kaidan on a
  phone.
- **Hidden chats can have their own Matrix, XMPP and Nostr accounts**: under the list of a place of hidden chats,
  **Matrix**, **XMPP** and **Nostr** open the same screens as the space's (`app/matrix.tsx`, `app/xmpp.tsx`,
  `app/nostr-chats.tsx` and their chats) for an account of that place alone: a Matrix and an XMPP sign-in and a Nostr
  key, each kept encrypted with the place's key in the place's own value of the network's file (the holders `hidden` and
  `hidden1` to `hidden3` of `lock/sealed-file.ts`), apart from the space's, which never sees them. They connect while
  the hidden chats are open, and, as the hidden chats themselves do, while they are closed too if **Receive while
  closed** is on (`lib/place-networks.ts` follows `receivingPlaces` of `lib/place-receiver.ts`; each store runs one
  account per place, `lib/place-lives.ts`): then a message there makes the notice say only "New message"
  (`onPlaceNetworkMessage`), and on Android a Matrix or XMPP call rings "Incoming call" with no name and waits for the
  PIN, which on the ring screen answers it (`placeNetworkRang`; `hold`/`promote` in `lib/xmpp-calls.ts` and
  `lib/matrix-calls.ts`); one not opened in time, or ended, is kept as missed, and an XMPP group call that comes then
  is kept as missed. With it off, they are let go of as the hidden chats close, and nothing comes while they are
  closed. Their chats are rows of the hidden chats' list and nowhere else: no number on Erevos's icon, nothing on the
  home list, and no notification settings; and, for Matrix, no notice while the space is closed. Their Matrix and
  XMPP chats call as the space's do, from the place's account (`MatrixCall.place` in `lib/matrix-calls.ts`,
  `xmppPlaceCalls` in `lib/xmpp-calls.ts`): a call to it while the hidden chats are open rings with the phone's
  ringtone, they stay open through the call, and one still on as they close ends (checked in
  `app/checks/matrix-calls.check.ts`, `app/checks/xmpp-calls.check.ts` and `app/checks/xmpp-muji.check.ts`). A screen opened from the hidden chats says so under its title and shows the place's
  account while it is on top (`lib/network-place.ts`); the user guide, What's new and `docs/` say it. The stores are
  checked with `app/checks/place-networks.check.ts`, against the servers played in the checks and with the real core;
  not yet on a phone.
- **Matrix, XMPP and Nostr in backups**: a backup now holds the Matrix, XMPP and Nostr accounts of the space and of each
  hidden place: their files `erevos-matrix`, `erevos-xmpp` and `erevos-nostr-dm` and the pages their values take
  (`TEXT_FILES` in `app/lock/backup.ts`), each still encrypted with the key of its space or place; an older Erevos
  leaves them out of what it restores. Restored, a **Nostr** key and its chats come back as they were. An **XMPP**
  account comes back with its sign-in, contacts, chats and the keys it knows of others, and goes on as a new device of
  the account (`renewDevice` in `app/lib/xmpp.ts`, run by `app/lib/xmpp-store.ts` as the account loads after a restore
  it has not been through: `app/lock/restored.ts` marks each restore and the account keeps the mark it last went past):
  the same identity key, so contacts' apps still know its key, but a new OMEMO device id, resource, signed pre-key and
  one-time pre-keys (and OMEMO 2 bundle), every session with a person dropped so each conversation begins again, their
  device lists asked for again, and the old device taken off the account's device lists, OMEMO 0.3 and OMEMO 2 alike,
  once it connects; a message encrypted to the old device after the backup cannot be read by it. A **Matrix** account is
  let go of on the phone (`app/lib/matrix-store.ts`): its state is dropped and never signed out with `/logout`, which
  would end the device on the phone the backup came from, and the Matrix screen says to sign in again, as a new device,
  where the Security Key opens the messages from before. Why: the sessions as the backup kept them would use again
  message keys used since, which the others refuse (stale ratchets), and the phone the backup came from may still be
  using the device. Checked in `app/checks/backup.check.ts` (the files and their pages come back, and the restoring
  phone's own go), `app/checks/xmpp.check.ts` (a restored account becomes a new device, keeps its chats and its
  identity, the old device leaves the lists, and messages go both ways) and `app/checks/matrix.check.ts` (it is let go
  of, no `/logout` is sent, and it signs in again); not yet on a phone.
- **Notices for Matrix, XMPP and Nostr messages**: a message in a space's chat on Matrix, XMPP or Nostr shows the
  same notice as Erevos's own, with its sound, says nothing of who or what, and counts in the number on Erevos's icon
  (Android, the web app and the computer); in the chat on the screen it only sounds, and read there or on another
  device of the account it no longer counts. What an account takes in as it is signed in to (Matrix's first sync, the
  XMPP archive's newest page, what the relays keep for a Nostr key brought along) tells of nothing. On Android,
  **Notifications** at the bottom of such a chat mutes it for 8 hours, a week or always, or gives it a sound of its
  own; a muted chat is not counted, and its row shows the struck-through bell. An XMPP or Matrix call rings with
  its chat's ringtone. A chat is read only while Erevos shows it, so what comes with the chat left open behind other apps still
  tells of itself. While the space is locked, or Android stopped Erevos, nothing comes: these servers send no push.
- **A closed space tells of Matrix messages** (Android): the Matrix screen's **While this space is closed** has
  **Say a message came**, off until chosen. Then, while another space is open with **Also while another space is
  open** on, the closed space says "New message" when something comes on its Matrix account, as for its own chats, never
  what, from whom or in which chat, and a call does not ring. The space makes a queue of its own at its relay and sets a
  pusher on the Matrix server whose push key is that queue's id, at the relay's `/_matrix/push/v1/notify`, in the
  format `event_id_only`: the server posts the room's and the event's ids and the counts, never words or names, and
  the relay counts one message in the queue's news and keeps nothing, which the closed space's door asks of as of its
  contacts' queues. The pusher is checked at each start and set again, or moved with the space to another relay; it
  is taken off with **No notice** or on signing out. The Matrix server learns the relay's address, the relay when
  messages come for that queue. Needs the relay updated (it answers Matrix pushes on its WebSocket port, unless
  `EREVOS_RELAY_MATRIX_PUSH=off`; behind Apache the path needs proxy lines of its own, see `deploy/relay/README.md`).
- **Calls ring in the web app, on the computer and on Sailfish OS**: a call that came while Erevos was open showed
  only its screen, with no sound, as only Android had a ringtone. The page now plays a ring of its own, two short
  rings every 3 seconds, made by the browser, and vibrates where the phone can, until the call is answered or ends; a
  chat whose ring is set to none stays silent. A browser lets a page sound only once it was touched, so a call that
  comes before any touch since Erevos opened shows without sound, and an iPhone on silent makes none.
- **Automatic backups to your own server too** (Android): under **Settings** → **Data and devices** → **Backups**, with
  automatic backups on, **Add a server** sends each one also to a folder on a server you choose that speaks WebDAV,
  such as your own Nextcloud, with an app password made for Erevos alone. Off until you add one. What goes there is
  sealed with the backup's password, which never leaves the phone; it has no Erevos header, its few header numbers are
  masked, it is padded inside the seal to a Padmé size, and it goes under a random name, so the file looks like random
  bytes and says neither that it is Erevos's nor exactly how much it holds. The server keeps the 3 newest. It still
  sees the account, when one comes and roughly how big it is, and, without Tor, the phone's address. Restore by
  downloading one and choosing it under **Restore a backup**; Erevos from before this version does not open such a
  file. Google Drive is left out on purpose.

- **Erevos on a computer keeps running with its window closed**: closing its window quit it, so nothing came, and no
  call rang, until it was opened again, and while it ran nothing told of a message outside its window. It now stays in
  the system tray (on a Mac, in the Dock), unless turned off under **Settings** → **Notifications** → **In the
  background**: it goes on waiting at the relay, a call rings, with no click first, and brings the window back, and a
  notification says how many messages the open space has not read, never who or what, never a hidden or muted chat's,
  while the window is closed, hidden or behind another. The tray's icon opens it again or quits it; where the desktop
  shows no tray, starting Erevos again brings the window back.
- **Erevos on Sailfish OS tells of messages and calls while it is closed**: once it was out of sight or closed, nothing
  told of a message and no call rang until it was opened again. Now, with a space open, a small helper of its own
  (`erevos-watch`, in the same package) waits at the relay for it meanwhile, on the space's queues and its contacts',
  without taking anything: a notification says how many messages came, never who or what, and a call rings with the
  phone's ringtone, as the profile sets it, for 45 seconds at most; a tap on either opens Erevos. It asks the relay in
  a channel to the relay's key once the relay proved it, as the app does. Locking the space stops it; after a restart
  it waits again once Erevos opens the space. Not yet tried on a phone.
- **Erevos names the open-source work it is built on**: **Settings** → **General** → **About Erevos**, and the guide's
  first part, have a new part, **Made with others' open source**: Erevos is free software (AGPL-3.0-or-later), built on
  open-source work by others, and the main parts are named with their makers and licences: Element Call, Arti, lyrebird,
  Snowflake and WebTunnel, vodozemac, OpenMLS, the RustCrypto and dalek-cryptography libraries, React Native, Expo and
  react-native-webrtc, Electron, and the Inter fonts. Every package with its licence is in `CREDITS.md`, which comes
  with Erevos's source code.
- **Group calls in XMPP groups**: a private XMPP group's tiles start a voice or video call in it, a call started in one
  of the account's groups rings, and one going on can be joined. They are made as Dino makes them (MUJI, XEP-0272, rung
  with Call Invites, XEP-0482), so they work with Dino's: each call has a room of its own, only for the group's members,
  and each phone connects straight to each other one through the call relay or the XMPP server's TURN server. A hidden
  chats' own account calls in its groups too, while they are open.
- **Answer a hidden call with Answer**: on the hidden ring screen ("Incoming call" with no name,
  `components/hidden-ring-screen.tsx`), **Answer** now opens the PIN field, as the small sign does, instead of
  saying "The call could not connect" and ending: someone who answered by habit could not take the call. Whoever
  taps it without the PIN gets no further than the PIN field.

### Under the hood

- **Downloads stop at 100 MB**: an answer over plain HTTPS was taken whole into memory (`response.arrayBuffer()`), and
  a contact picks the address of a Nostr file (Blossom) or an XMPP file, so a server answering without end could crash
  the app. `lib/net-http.ts` now reads every answer as a stream (`readCapped`, `fetchCapped`) and stops it, aborting
  the request, as soon as it passes `HTTP_MOST` (100 MB) or the caller's own cap: before reading anything when
  `Content-Length` says more, and as the bytes come when it says nothing (chunked) or says less than comes. Callers
  with a cap of their own pass it: Nostr files `NOSTR_BLOB_MOST` (`NOSTR_FILE_MOST`, 20 MB, and 64 KB), XMPP files
  `XMPP_FILE_MOST` and 16 bytes, NIP-05 lookups and XMPP's host-meta and DNS-over-HTTPS 1 MB. Matrix (`lib/matrix.ts`)
  and link previews (`lib/make-preview.ts`, 2 MB) read the same way. GETs on Android go through `expo/fetch`
  (`lib/net-fetch.native.ts`), which streams; React Native's own fetch, left for PUT, POST and PROPFIND to servers the
  owner chose, has no stream, so for those only `Content-Length` is weighed before the whole answer. Through Tor the
  core's 64 MB cap stays, and the answer is weighed against the caller's cap after. A backup restored from a server
  now comes up to 100 MB, not 200 MB (`CLOUD_RESTORE_MOST`), with an error that names the limit, and one the server
  lists as larger is not downloaded; a backup file opened by hand still goes up to 200 MB. The desktop shell's
  `/__webdav` reads the server's answer the same way, 100 MB at most, and answers 413 past it (`desktop/main.js`).
  Checked against a local server sending more than the cap with and without `Content-Length`
  (`checks/net-http.check.ts`).
- **Pieces of photos through Nostr kept per space and per hidden place, encrypted**: the pieces of a photo that comes
  through Nostr wait for the rest, and for the message that offers it, no longer in one store for the whole phone (an
  index in the clear, with when each came, and a file named by each piece's hash), but in the encrypted storage of the
  space or hidden place whose key they came for (`lib/nostr-pieces.ts`, `lock/nostr-pieces-data.ts`): which pieces it
  holds and when they came are in its sealed value of `erevos-nostr-pieces`, one per space and hidden place, the same
  size used or not, and each piece lies in two pages sealed with its key, the size of the history's pages and among
  them. So neither whether a hidden place waits for a photo nor how many pieces shows outside its password, and no
  place sees another's. The limits hold in each place: a thousand pieces (32 MB), four days. A piece that comes while
  no place can take it is held in memory only, 128 at most, until the place whose photo names it takes it. Pieces an
  Erevos from before kept go into the first place whose photo names them, or are deleted once four days old. Backups
  hold them with their pages; a wipe deletes them with the rest (`checks/nostr-pieces.check.ts`).
- **BLE beacons that change** (Android): the 4-byte nonce a phone advertises for others nearby to find it, which
  decides which of two phones dials, was drawn once per run of the app (`kotlin.random.Random`) and so followed the
  phone from place to place across Android's own address changes. It now comes from `SecureRandom` and changes every
  9 to 12 minutes (`BleLink.kt` `ROTATE_MS`, `ROTATE_JITTER_MS`), the beacon starting again with it, which on Android
  8 and later also gives a new random advertising address; links that are up stay up, and addresses not seen for 30
  minutes are forgotten. It stays four bytes in the same service data and under the same test company id with the
  same service UUID, so phones with an older Erevos (one nonce per run) and new ones still find each other and still
  agree on who dials; just after a change, a pair may wait for the next scan, or open a second link that the nearby
  layer drops as it does any copy. The service UUID still says a phone with Erevos is near
  (`checks/ble-beacon.check.ts` reads the Kotlin; it compiles against Android's API, not run on a phone yet).
- **A relay restart no longer brings a false notice**: a relay that restarted forgot what had come into each queue
  since its phone last found it empty, so a hidden chat or a closed space with messages waiting, already told of,
  said **New message** for them once more. Stopped as `systemctl stop` or `restart` stop it, the relay now keeps that
  beside its journal until it starts again, and takes it back only if the journal is still exactly as it left it;
  after a crash it starts afresh as before, so a phone may tell of a message twice, but never misses one. Its log also
  says why a forward to another relay, or a file's chunk taken through it, failed, never which relay, queue or file,
  and names a line of its file of tokens by the first 12 hex digits of its token's SHA-256, never by the user name in
  it. Your relay needs an update for it.
- **The spam filter reads words as they look**: a scam text that swaps a letter for a look-alike of another alphabet
  (a Cyrillic а in a Latin word), full-width or styled letters, or a mark that shows nothing inside a word, no longer
  gets past it. Who sends is never compared so.
- **A contact you delete no longer comes back from an old ask**: in a group, a member you asked for their contact
  link, or who asked for yours, and whom you then deleted as a contact before Erevos looked at the relay again, could
  be added again by that old ask. Deleting them now lets go of it at once.
- **A chat locked with its own PIN stays locked**: a contact's Erevos starts a new conversation with the chat about
  once a month, once given newer keys, and the chat then lost its PIN and opened without one; a public group joined
  again lost its own too. Both keep it now.
- **A contact's SMS no longer stay counted as new**: a contact's chat marked their SMS read only when one
  not read showed among its messages. One older than the SMS that show, or in the Trash, stayed unread on
  the phone, and the home screen kept counting it on their row however often the chat was opened. Opening
  the chat now reads every one of theirs that the phone counts not read, as the SMS screen does.
- **A message no longer waits when Tor cannot reach the relay**: with the Tor way **Messages**, a message
  whose send Tor could not take to the relay (its exit timed out, say) was marked waiting until a later look,
  with Tor's own English words under it, though the Tor screen says a message never waits for Tor. It now goes
  straight at once, as those after it do for a minute; with **Everything** it still waits for Tor. A Tor
  timeout now says that the relay did not answer in time, in the app's language.
- **Background notices no longer stop after a network change**: a wait at the relay (for a message, for
  news of a queue, or on many queues at once on its `/read` path) whose connection died on the way, as when
  the phone went from Wi-Fi to mobile data or the relay restarted, was taken for the answer of a relay from
  before, which does not know the request, and the relay was not asked to wait again for the whole run.
  Contacts' messages were then read only every tenth look, up to ten minutes late in the background, and the
  notices of hidden chats and closed spaces and the hidden rings said nothing until Erevos was restarted. A
  relay that answered such a request this run is now never taken for one from before, one taken for it is
  asked again after ten minutes, and the wait on the contacts' queues tries again too.
- **A call hung up at once no longer rings**: when the hang-up came in the same look as the call, it was read
  while the call still waited for the call relay, so it was dropped: the phone rang 45 seconds for a call
  nobody was on, said **Missed call**, and answering said **The call could not connect**. The same for a group
  call that everyone left at once. The hang-up is now kept until the call is read, and the call is missed
  quietly.
- **A hidden call rings once**: a hidden place with **Receive while closed** and a ring queue from before rang
  twice for one call, as the ring on the queue stayed after the place's receiver rang and rang again once the
  first ring ended; and a call taken while hidden chats were open rang the phone again as they closed. A ring
  that came while the place was open or a ring showed is now dropped, not rung.
- **A member's contact link no longer says New message**: the answer to a contact link asked from a group
  only adds the contact and writes a grey line, which raised a sounding **New message** notice with nothing
  unread behind it.
- **The birthday notice and the phone's incoming-call notice no longer replace each other**: both had the
  same notice number, so a phone call removed the day's birthday notice for good, and a birthday at 9:00 took
  **Answer** and **Decline** off a ringing call's notice.
- **A closed space tells of its contacts' messages too**: with **Also while another space is open**, a closed
  space waited at its relay on four queues only (its own, its contact link's, its groups' and its public
  groups'), so since each contact writes to a queue of their own it told only of group messages and the first
  messages of new contacts, though the guide and the setting say every message. Its door now keeps its
  contacts' queues too, up to 64, and asks about them on the relay's `/read` path with no token, as the open
  space reads them, through Tor in the same groups of eight, each on a way named for that space. The door
  follows the contacts as they take a queue of their own or are deleted, and every door, open or shut, has
  the same size whatever it keeps; doors from before are sealed again at it. A space that goes through Tor
  is still asked only through Tor, even when Tor goes to rest while it is asked, and its waits ask again at
  once when the phone's network changes. Someone who examines the phone with tools may find how many
  contacts a space that asked for this has: the guide says so.
- **The relay's pushes to the web app, sturdier** (needs the relay updated): a push the push service could not take
  just then (429 or 5xx), or that did not reach it, is sent again a little later, a few times, where it was lost
  until the next message (one it refuses, a 403 say, is logged and not sent again); a call that rings goes before the
  messages waiting their turn for the same browser; an address the service says is gone is dropped for all its
  queues at once, and the web app told to make a new one; each push says, encrypted for the browser, when it was
  sent, so a late one is known; the relay logs a push the service refused, how many push addresses it keeps and for
  how many queues, and when pushes stop; a message held for later that goes as the relay starts pushes too; whoever
  runs the relay can allow another push service (`EREVOS_RELAY_PUSH_SERVICES`); and writing the push addresses to
  disk no longer holds up messages. A web app from before shows the updated relay's pushes with no number until it
  is updated, so the web app goes first.
- **Calls ring as they should** (Android): with Do Not Disturb on, a call played its ringtone and woke the screen
  though its notice was held back; it now rings only when its notice may break through. A phone whose clock was some
  minutes off took a call as missed and never rang; Erevos now judges a call's age by the relay's clock, once the
  relay is updated. The ringtone played once on Android 7 and 8; it now rings to the end. An **Incoming call**
  notice stayed after Android stopped Erevos in the middle of a ring; it now goes. A second call that came while the
  first was being set up could take its place; it is now told busy, and the same call coming twice rings once. A
  screen that failed as a call came no longer keeps the call screen from showing, and a ring stops only when the
  call it rang for is answered, turned down or gone.
- **Hidden calls**: one turned down or unanswered left Erevos over the lock screen until the space closed; one that
  came while the space's password screen showed was only a notice, and now shows its screen over the password, whose
  small sign steps aside for it; its notice shows only while Erevos is not on screen; and a place that receives
  while closed no longer rings again from its ring queue of before.
- **Notices come again at once after a change of network**: moving from Wi-Fi to mobile data, or back, Erevos waited
  up to a minute on the old connection before it looked again, for the space, its hidden places and the closed
  spaces. And when Android refused to start receiving as Erevos left the screen, it received nothing until the space
  closed; a quiet notice now says so, and it starts again as soon as Erevos shows.
- **Hidden chats' notices tell each message once**: what came after a place last looked is told once it closes; a call
  is told as a message only when it did not ring, and their messages are told at once, not after the ring's wait; a
  place whose queue the relay lost keeps its switch on and waits on its queue again as it opens or moves; nothing is
  told before it is known which places receive while closed; a count of hidden or closed-space messages changes the
  notice once; and a place's groups tell only as its contacts' messages do.
- **Hidden chats close while Erevos is away**: after 30 seconds in the background they closed only once Erevos came
  back, so a call to them meanwhile rang as if they were open, with no PIN to answer it. A timer now closes them,
  never during a call or while a photo or a file is picked.
- **A voice message counts once**: the relay counted it on its first part and the phone on each, and one that went
  again whole after only some of it went was told twice. Both now count it once, on its last part.
- **The number on the icon counts only what is still there**: a message deleted for everyone before it was read, or
  read on a linked computer, stayed counted in the messages notice and on Erevos's icon until Erevos was opened.
- **Messages sent for later**: a notice of one that came before its time was told at its time though its space had
  closed; such notices now go as the space closes and are set again as it opens, without sound when it was sent so.
- **SMS**: one from the number whose chat shows put up a notice; it now only sounds there, as Erevos's messages do.
  SMS were marked read when their screen was behind another app; now only while it shows, and the SMS notice goes
  once none is unread. In Android's notification settings they were called Messages, like Erevos's messages; now
  SMS.
- **Reminders**: one seen in Chat with myself stayed on the notice; it now goes from it. A hidden place's reminders
  stayed set on the phone after a new PIN started it empty, or it was removed; now they go with it. Birthday
  reminders could come up to an hour late; now at 9:00.
- **Nostr reads as soon as Tor is ready**: a reader that waited for Tor asked again only after its pause, up to
  minutes later.
- **Erevos's notices show its mark** in the status bar: the receiving, call, messages and update notices showed a
  plain square.
- **Notices are asked for with receiving off too**: with **Say a message came** on and **Only while Erevos shows**,
  Android's question for notices never came, so messages made no notice; it now comes, and **Permissions** waits for
  it before it reads what is allowed.
- **Test releases before a version**: a release can be named as in 4.0.0-rc.1 (also -alpha.<n> and -beta.<n>). The
  release workflow accepts it and puts it after 3.x and before 4.0.0 (with no version given, the one after it is
  4.0.0-rc.2); the Sailfish RPM's version is 4.0.0~rc.1, since RPM allows no "-"; Updates, the notice of a new
  version and What's new read it and put it in the same order (lib/version-name.ts, checks/release-version.check.ts
  runs the workflow's own script). Erevos 3.4.2 and before still offer it, under 0.1.<build>, but tell no notice of
  it.
- **A call to a slow phone rings in full**: a call from the web app on an iPhone to an Android that took its offer
  more than 45 seconds after it went rang there and stopped at once, as the caller had given up already. The caller
  now waits for the other phone to say it rings as long as that phone may still ring for the offer (OFFER_FRESH_MS,
  a minute) and 15 seconds more (RINGING_BACK_MS), and once it rings there, RING_MS from then. What the contacts'
  queue watch found is read before a look's sends and between them, in the receiver and the chat screen
  (QueueMove.readCame), as those can take tens of seconds through Tor; and the watch's waits end and ask again at
  once after a change of network (ContactWatch.renew), as a wait on the network gone could hang for minutes, with
  nothing heard meanwhile.
- **The web app and the computer reach Matrix, XMPP and Nostr servers over HTTPS**: the page policy of both
  (connect-src) allowed only WebSocket connections and the page's own address, so the browser refused every HTTPS request
  they made to another server, while Android, which has no page policy, was not held back. It now allows HTTPS too, so
  Matrix sign-in, XMPP server discovery and file sharing (HTTP upload), and Nostr files (Blossom) and name lookups
  (NIP-05) work in the web app and on the computer.
- **Hidden chats show at once**: as the PIN opens them, the chat screen shows the place's chats and contacts at
  once, only to read, while a look of its receiver under way ends (`holdPlace`), as the space's own chat does; that
  look also ends between its sends (`lookPlace` checks `stop` after `sendPending`, `sendKeys` and `sendCopies`), which
  may each go through Tor. Before, the list stayed empty until the whole look had ended.

## 3.4.2 (2026-10-27)

### For you

- **The SMS field keeps its width on a small screen**: **Photo** and **Send** beside it are round buttons, as in a
  chat, not words, which with large letters left the field a narrow column.

### Under the hood

- **A message sent while a chat opens waits for it**: it shows at once as **Sending…** and goes as soon as the
  chat is open, a voice message too. Until now it said **This build cannot encrypt**, as a chat opens only once a
  look at the relay under way ends, and a new phone's first looks can take a while; what else cannot wait says the
  chats are still opening.
- **What is read as a chat opens stays read**: read in those moments, a contact's messages were read on the screen
  only, so the home screen still counted them as new and their phone was not told.
- **Samsung phones no longer ask to turn off their own sharing for Erevos**: Samsung asks so when an app uses Wi-Fi
  Direct or Wi-Fi Aware, so on a Samsung phone both stay off until turned on under **Nearby, with no internet**,
  which has a new **Look with Wi-Fi Aware** switch on every Android phone. Bluetooth and the same Wi-Fi work as
  before.

## 3.4.1 (2026-10-27)

### For you

- **Send answers at once**: pressing it gives a short buzz, empties the field and shows the
  message at once, marked **Sending…** until the relay or their phone takes it, so a second press
  has nothing to send twice. If it can neither go nor wait, its words go back in the field. An
  edit on its way, and a note in Chat with myself, are not sent twice either.

### Under the hood

- **The screen no longer stays pushed up** with no keyboard on it: the keyboard library
  (react-native-keyboard-controller) is now 1.21.14, which notices a keyboard that closed without
  its usual animation, behind a sheet, a dialog, the share sheet or another app. 1.21.9 kept its
  height, and every screen stayed lifted by it.
- **Importing a chat with its photos no longer freezes Erevos**: reading, sealing and keeping a
  .zip's files never let the screen draw, so a large Telegram export held the app still until it
  was done. It now draws and takes taps between chunks, says how many files and what share of
  them are in, and **Cancel** stops it, keeping none of them.
- **A chat moved into hidden chats takes its imported chats along**, kept only in its chat there,
  and brings them back if it moves back. Before, they stayed in the space, linked to no one. A
  change to the imported chats is now made on what the phone holds then, so a screen opened
  earlier never puts back one that moved, or drops one that came in meanwhile.

## 3.4.0 (2026-10-26)

### For you

- **Two new sticker sets of 24 moods, as emoji are**: **Tux**, the penguin of Linux as he is
  drawn (the CC0 drawing of the logos collection), and **Aikido**, an aikidoka in keikogi and a
  wide pleated hakama (who also bows, sits calm in seiza, holds a bokken and rolls). Both move a
  little, as the other sets do. Stickers can now be drawn in curves too (react-native-svg).
- **Transparency, in the guide**: a new part, **Transparency**, says what the server behind Erevos keeps and for how long
  (messages that wait, files, queues, access lines, push addresses), what it does not keep (no list of connections),
  who else sees something, and that no authority has asked for anything. It goes out inside every release, so each
  release says it again, signed with the release.
- **What's new, in the app**: **Settings** → **General** → **What's new**, and a button under the version in
  **Updates**, say in short what each version changed, in every language of the app, the newest first, by its number
  alone, with **This version** beside the one installed. Each release adds its own.
- **A group video call from the top of the group**: a blue camera beside the green handset starts one, as in a
  contact's chat; **Video call** under **⋯** stays. While a call is going on, only its own button shows, to join it.
- **Hidden chats, more like the others**: they close by themselves once Erevos was in the background for more than 30
  seconds, not at once, and never during a call or while a photo or a file is picked for them, so a photo, a file or
  a QR code from a photo now comes to them. While open, a message plays the sound for new messages; in the background
  before they close, a notice says "New message" if the place's **Say when a message comes** is on. A hidden chat's
  details have **Link previews**, a switch of their own for that place, off unless turned on.
- **Hidden chats that receive while closed**: a switch at the top of each place, **Receive while closed**, on for new
  places and off for those set before, has its hidden chats receive while the space is open, as its other chats do,
  with Erevos in the background too: their contacts see at once that a message came, a notice says only "New
  message", and on Android a call rings with "Incoming call" and no name, answered with the PIN; a call that ended
  before the PIN opened them shows as missed. For it, the place's key is kept encrypted with the space, among a random
  one for each other place, so opening the space does not show which places receive, but whoever opens the space and
  copies what the phone keeps could open that place with no PIN. With it on, **Say when a message comes** and **Ring
  calls when closed** are not needed and do not show. Backups keep the switch.
- **Hidden chats wait and import too**: what cannot go now waits there as in your other chats, marked **Waiting**, and
  goes by itself through their relay only, never to the phone nearby or over LoRa: while they are open, or, with
  **Receive while closed** on, while the space is open. **Send later** no longer needs the relay to answer when you
  schedule. A chat exported from Telegram, WhatsApp or Viber can be imported in a hidden chat's details: kept with
  that place, encrypted with its key, it shows only in that chat.
- **Hidden chats listed like your chats, with a Chat with myself of their own**: they open on a list as the home
  screen's, the newest first, each with what was said last, when, and how many are not read; at its top, each place
  has its own Chat with myself, encrypted with that place's key. Its reminders show there once the PIN opens it, and
  the phone tells them at their time, in a notice that says only **Reminder**, only while **Receive while closed** is on.
- **Hidden chats that receive while closed read Nostr too**: what their contacts send through Nostr is read while the
  place is closed, as what comes through their relay, and the sender sees at once that it came. In hidden chats, a
  contact can also be added from a photo of their QR code, and a hidden contact can be given a photo.
- **Hidden chats with no relay, through Nostr**: as the space's chats with no relay, their contact link and QR code
  say where they read on Nostr, with a key of that place alone, and texts, reactions, what waited and the marks that a
  message came go there, while they are open or, with **Receive while closed** on, closed. Photos, voice messages and
  calls still need a relay.
- **Groups in hidden chats**: **New group** under a place's list makes a private group with its contacts, kept with
  the place and encrypted with its key, listed among its chats and shown inside them, with photos, files, voice
  messages and calls. It goes through the place's relay only, to a queue of its own there, and is read while the place
  is closed if **Receive while closed** is on; its calls ring only while the place is open, and one started while it
  is closed shows as missed. None has a PIN of its own, and none is public.
- **No test version line**: the home screen no longer ends saying this is a test version; the guide's opening note
  keeps that nothing has been audited yet, with what is protected today.
- **The contacts menu in hidden chats**: their contacts screen has a menu with only what is theirs: a .vcf file
  imported into them, sealed and never in the phone's contacts; the contacts shown, or one on its card, saved as a
  .vcf file; and a contact's QR code read from a photo. An Erevos ID typed or read there adds them to the hidden chats,
  never to the space's, and one handed over as they close is added to no other chats. They stay open while a folder is
  picked.

### Under the hood

- **The web app can be built again and checked**: `scripts/reproduce-web.sh <version>` builds a release's web app
  from its commit and checks that every file comes out the same as the published one, and as what the web server
  serves (docs/reproducible-builds.md). The published 3.3.2 does, all 78 files. One Rust version for every build
  (`rust-toolchain.toml`), and no paths of the build machine in the core any more.
- **The Android app, ready to be checked the same way**: `scripts/reproduce-apk.sh <version>` (and the workflow
  `reproduce-apk`, by hand) builds a release's APK unsigned and checks it against the published one apart from its
  signature, as F-Droid does. Not tried yet.

- **The relay proves its own key**: once Erevos knows your relay's key, every connection to it starts with a check that
  only the relay holding that key can pass, and the token and everything after it go encrypted to that key, inside
  TLS. So someone in between with a certificate for the relay's name cannot pass for it, and a renewed certificate
  changes nothing. **How you connect now** says whether your relay proved its key; once it has, the space never reaches
  it without the check, and **It has a new key** is there for when its operator gave it one. A relay older than this
  works as before. The same in the web app, on a computer, on Sailfish OS and through Tor. The relay needs updating
  for it.
- **One wait at the relay for all of a space's queues** (needs the relay updated): in the background, Erevos waits on
  the space's queue, its contact link's and its groups' in one wait, where it held one connection for each, and reads
  them on a path of the relay that needs no token, so the token, which names the phone, is not on those connections.
  Through Tor, those connections go on circuits of their own. A relay from before this is waited on as before.
- **Nothing shows behind a chat's PIN**: with glass, a wallpaper or a style that draws its own scene, the messages of a
  chat or group locked with a PIN could be seen through the PIN screen. Now none of them is drawn until the PIN is
  typed, and the PIN screen lies on a dense frost over the look's background, which lets nothing through.
- **A relay queue for each contact** (needs the relay updated): each kept contact writes to a queue of their own, said
  only inside the encrypted messages, so the relay cannot tell from where messages go that two contacts write to the
  same phone, and deleting or blocking someone deletes only their queue; the own queue moves only when they knew it.
  The contact link's queue is for first messages. Contacts from before get one in turn, a few at a time, quietly, and
  an Erevos of theirs from before takes it too. They are read on the relay's path with no token, waited on while the
  space is open, and through Tor in groups of eight, each on circuits of its own. Hidden chats and linked computers
  keep one queue for everyone, for now. The web app has a queue for each contact too, without Tor, so it waits on its
  contacts' queues together from one address; with notifications while closed on, each contact's queue pushes too,
  all with the browser's one push address, and a push service sees a push for each contact who wrote, 15 seconds
  apart.
- **A deleted or blocked contact's queue goes at once**, not with the next look at the relay.

## 3.3.2 (2026-10-25)

### For you

- **The plain call button for more contacts**: the orange keypad at the top of a contact's chat now shows also when no
  number is linked to them in Erevos but they are connected to one of your contacts that has one (**Connect to one of
  my contacts**), on that contact's mobile number first. Before, only a number linked to them in Erevos counted, so some
  contacts had the keypad and others did not.

## 3.3.1 (2026-10-25)

### For you

- **Viber chats come in**: a Viber chat saved as an .html file by the Android app **Backup Text for Viber** (Viber
  itself exports none) comes in with **Import a file**, in **Settings** → **Data and devices** → **Imported chats** or
  in a chat's **Details**. Only the words come, with Viber's emoticons as emoji. Your own messages, which the file
  leaves unnamed, come in as **Me**, already picked as you; messages from a phone whose clock said 1970 come in with
  no time.

## 3.3.0 (2026-10-25)

### For you

- **Invite by SMS, to someone with no Erevos yet**: on Android, the card of a contact who is not in Erevos has **Invite
  by SMS**: an SMS to their number with a short link, written in the SMS app for you to send. The link's page on LPHL's
  web server offers them Erevos, the app on Android or the web app on an iPhone, and opens the invite in it. They tap
  **Join**: their phone joins your relay with access of its own, and you are each other's contacts, linked to that
  number, with no message request. The invite is after the **#** in the link, which no web server is sent; it is for
  one person, for two days, and an invite to the relay no phone used is taken back once they end. The QR code and
  **Share the invite** stay as they are.
- **A handset that looks like one**: the white handset on the green tiles (Phone on the home screen, the call at the top
  of a chat and a group) is drawn as the phone widget draws it, no longer as a ring that looked like a tool.
- **Begin with no relay, through Nostr**: a phone with no relay, invite or LPHL account taps **Start without a relay**
  on **New chat**: its QR code and contact link now say where it reads on Nostr, so whoever adds it writes to it there,
  over Tor. With no relay between two phones, texts, stickers, reactions, edits and the marks that a message came or
  was read all go through Nostr, the first message too; a text not said to have come goes again once a day, for two
  weeks. Photos, voice messages, files and calls still need a relay or the other phone nearby.
- **Told when a new version is out**: on Android, once a day, Erevos asks LPHL's server (which runs the relay too)
  whether a new version is out, and when one is, **Erevos** shows at the top of the chats, pinned, saying **Erevos X is
  out**, with a notice too; tapping either opens **Updates**. It counts only once the release computer has signed the
  build and its name. A space asks only while it uses LPHL's relay and does not send everything through Tor; GitHub is
  still asked only when you tap **Check for updates**. **Settings** → **General** → **Updates** → **Tell me when a new
  version is out** turns it off. Not in the F-Droid build.
- **A chat locked with a PIN**: a chat's **Details** (a group's: its name at the top) have **Lock with a PIN**. It
  then opens only with its PIN and locks again once you leave it, or Erevos is away more than half a minute. The list
  shows its name with a lock and **Locked with a PIN**, and nothing of its messages shows in the search, **Starred
  messages** or **Imported chats**. The PIN is kept only as Argon2id of it, and wrong ones make the next try wait.
  Moved into hidden chats, it asks nothing there; moved back, the same PIN asks again. Where the space has a password,
  **Forgot the PIN?** takes it off with that password.
- **A plain call from a chat**: a contact's chat with their number linked, and an SMS conversation, have an orange
  keypad at the top that opens a keypad with the number typed (Erevos's Phone when it is the phone app, else the phone's
  own), for a call on the mobile network, not encrypted. Not in hidden chats, nor on a computer.
- **New chat, easy for everyone**: at the top, **How you connect now** says in plain words how your contacts reach you
  (through your relay, through Nostr with no relay, or only nearby) and what works that way. A phone with no relay
  chooses among three big cards: **I have an invite**, **Sign in with LPHL** (one tap opens the browser) and **Start
  without a relay**. With a relay, **Add a contact** and **Your contact link** come first. **Nearby, with no
  internet**, **Blocked contacts** and **For advanced users** (the relay's address, token, second relay and invites)
  stay closed until tapped. **Relay and new contacts** and **Relay settings** are gone.

### Under the hood

- **An invite by SMS taken more ways**: a link pasted as the address bar can show it, with **/i/#**, is taken as the
  link itself is; and a web app from before the invite page, which opens itself at that address, takes the invite
  there too. On an iPhone with iOS 26, the steps to add the web app say that **Share** is under **•••**.

- **Nostr relays that refuse a Tor exit are tried through another**: some Nostr relays refuse some Tor exits (relay.damus.io
  answers them with HTTP 403), and some exits cannot reach a relay (nos.lol timed out), while Tor kept using the same
  exit for minutes, so every try failed again. Now each Nostr relay is reached on Tor circuits of its own, never
  shared with another, and after a failure the next try goes through another exit. No exit carries what goes to two
  relays any more, so none can tell it is one phone's. The **Nostr** screen says why a relay failed without the
  Android words around it.
- **A relay comes by itself**: a phone with a relay that lets it invite sends a contact with no relay an invite to it,
  once, inside the chat, whether they first met through Nostr or nearby (Bluetooth, Wi-Fi, a QR code). The other phone
  takes it by itself and tells its contacts where it reads now. It counts as one of the inviter's invites, and none
  goes to a message request; one from a request waits until it is accepted.
- **No message held back by a dead connection**: a question to the relay with no answer in time (a wait there its
  seconds and 30 more, anything else 45 seconds, a part of a file 2 minutes) now counts as failed and is asked again.
  Before, a connection that died on the way, as when the phone's network slept or changed, could leave Erevos waiting
  on it for good, receiving nothing in the background until it was opened.

## 3.2.1 (2026-10-25)

### For you

- **Edit a message you sent**: hold one of your messages, then **Edit**, up to a day after you sent it. Its words go
  in the field under **Edit message**; change them and send. Both phones show the new words with **Edited** beside the
  time, and so do your linked devices. In a group, every member sees them. Only words are edited, not stickers,
  places, polls, voice messages, photos, files or forwarded words. A message that still waits to go simply goes with
  the new words. An Erevos from before this keeps the old words.
- **Nostr says what it did**: the note under the messages says **Sent through Nostr** when a Nostr relay took a text;
  it said "through the relay" before, even then. The **Nostr** screen has **What the relays did last**: for each relay,
  whether it took the last text and how many seconds after, or why not, and whether this phone reads on it, kept until
  Erevos closes. The guide says how to try Nostr with two phones side by side (Bluetooth and same Wi-Fi off).
- **Coloured call buttons**: at the top of a chat, the video call is a blue tile with a white camera and the voice call
  a green tile with a white handset, as **Phone** is on the home screen; a group's call is the green tile too.

## 3.2.0 (2026-10-25)

### For you

- **Arrows to a chat's start and end**: scrolled up a little, a chat, a group and an SMS conversation show two round
  arrows at the lower right. The upper one goes to the very start (a long chat is then drawn from its first messages,
  with **Show later messages** under them), the lower one back to the end. Writing a message goes back to the end too.
- **Earlier messages come by themselves**: scrolling up a long chat brings its earlier messages, and those imported from
  Telegram or WhatsApp, without tapping **Show earlier messages**; what is read stays in its place.
- **Imported messages as if always in Erevos**: in a contact's chat, what came from Telegram or WhatsApp is drawn as
  Erevos's own messages are, in bubbles with tails, under day headings, with their times. Photos load as you scroll to
  them (no more tapping each), stickers show as stickers, voice messages and songs play right in the chat, holding one
  offers **Copy** and **Open**, and **Search in this chat** finds them. The **Imported chats** viewer loads the photos
  on the screen as it scrolls too.
- **Dogs instead of cats**: the stickers' third set is now **Dogs**, 24 moving dogs (a Dalmatian among them). Cat
  stickers already sent or received still show.
- **Screenshots in Settings**: **Settings** → **Privacy and security** → **Screenshots** turns Erevos's screen privacy
  on or off, so screenshots and screen recordings work when you want them. Hidden chats always stay out of them.
- **Hidden chats from New chat, sooner**: holding **New chat** down for a second (was a second and a half) opens the
  field for the PIN.
- **Coloured shortcuts on the home screen**: at the top, **Phone** is a green tile with a handset, **Contacts** a violet
  one with a person (the colours of their icons on the phone's home screen) and the lock an orange one. Phone and
  Contacts left the menu under the three dots, where they were twice.
- **Chat with myself and Remind me**: **Chat with myself** is always first in the chats, with a pin, in every space:
  notes, links, photos, files and voice messages that go to no one, kept on this phone, encrypted in the space.
  **Remind me**, an orange bell beside **New chat**, writes a reminder for a time you pick; in the chat, **+** →
  **Remind me**, or holding the send arrow, does too. At its time, on Android, a notice says only **Reminder**, with
  Erevos closed and locked too, and opens Chat with myself after the password; until the chat is opened, the reminder
  shows on its row with a count. Backups take its notes and voice messages. Needs the new Android app for the notice.
- **Media, links and files, with a calendar**: a chat's details have **Media, links and files**, where its photos (in a
  grid), videos, voice messages, music, files and links are each under their own tab, the newest first under their
  months, those imported from Telegram or WhatsApp too. A tap opens, plays or saves; held, **Show in chat** goes to
  the message. A calendar goes to a day that has any, and **Go to a day**, in the details too, goes to a day's first
  message in the chat itself.
- **Import a chat from inside the chat**: a contact's chat has **Imported chats** in its details, with **Import a chat
  here**, which brings a Telegram or WhatsApp export straight into that chat (asking which one, when the file holds
  several). An imported chat that goes on there can be **Kept only in the chat**, out of **Settings** → **Data and
  devices** → **Imported chats**, or shown there too again, **Unlinked** or **Deleted**, all from the chat's details.
- **A closed space can say a message came**: in a space, **Settings** → **Notifications** → **In the background** now
  offers **Also while another space is open** (off unless chosen). Then, while another space is open on Android, it
  says only "New message", or how many, with the same notice, never which space. The phone keeps only the addresses of
  its queues outside its password, and asks its relay only how many came, through Tor when that space goes through Tor.
- **Which way a message went**: holding a message shows **Went through Nostr** or **Came through Nostr** when a Nostr
  relay carried it, so that Nostr can be tested.
- **Support Erevos**: **Settings** → **General** → **Support Erevos** lists the ways to help with the running costs:
  Liberapay, PayPal, and a Monero and a Bitcoin address, each with its QR code, **Copy address** and **Open in a
  wallet**. Each opens
  outside Erevos only when tapped; Erevos sends nothing and does not know who gave. The guide's **Who pays** says so.
- **Who makes it, and why**: the guide's first part ends with who makes Erevos, for whom, why, and who pays, also
  opened from **Settings** → **General** → **About Erevos**.
- **The guide says why**: almost every part of the **User guide** now ends with a **Why** that says what the way it
  works protects, or why it was chosen: from why hidden chats have four places instead of a key for each chat, to why
  only the sender's phone fetches a link's preview. A few names in it now match the app (**Safety number**, **Appear
  offline**, **Disappearing messages**), and its questions say that an iPhone can use Erevos from the browser.

## 3.1.2 (2026-10-25)

### For you

- **Settings, in groups**: the home screen's **⋯** keeps only the places (**New group**, **Public groups**,
  **Starred messages**, **Nearby phones**, **Contacts**, **Phone**, **User guide**) and, last, **Settings**, named in
  English too in the other languages. Settings has a search at the top that finds a setting by its words and says
  where it is, the **Language · Γλώσσα** row, and eight groups: **General** (Language, Updates, Permissions),
  **Appearance** (Style and colours, Wallpaper, Messages, Launcher icons, Widget), **Notifications** (In the
  background, or the web app's Notifications while closed), **Privacy and security** (Lock and second password, Hidden
  chats, This web app), **Relay and networks** (Relay, Home relay, Tor, Nostr, LoRa radio), **Phone and SMS** (Phone,
  and SMS with its nine parts), **Data and devices** (Backups, Linked devices, Imported chats) and **For testing**.
  Each part of Appearance, of the lock screen and of SMS opens alone, with its own title; what a device cannot do does
  not show on it. **Relay** opens the New chat screen with the relay's settings already open. Notes in the app that
  sent you to the menu now give the way through Settings.

## 3.1.1 (2026-10-24)

### Under the hood

- **Check for updates says what stopped an update** (Android): that the web app's server, which holds the release
  computer's signature, could not be reached (with the reason), that the release computer has not signed the new
  version yet, or that the signature there does not match it. Before, all three gave the same note.
- **Invite someone gives access to your relay, or says why not**: a phone that uses a token typed in, such as the
  relay's one for all, makes no invite now, and says to sign in to the relay first (below the **Token**, in **Relay
  settings**). Such an invite used to make you contacts only, and the relay then refused the new phone.
- **The relay's token for all becomes a token of the phone's own** (needs the relay updated): a phone with the
  relay's one token typed in trades it at once, by itself, for a token of its own there, says so, and can then invite
  others. Whoever runs the relay sees it as a line of its own in the file of tokens ("came with the relay's token"),
  so they can take that one phone out, and change the relay's token, without cutting off the others; 50 such phones a
  day at most. **Invite someone** does the same first. Hidden chats keep the token typed in for them. The guide has a
  new part, Ways in to the relay, with the three ways and every limit.
- **A relay refused through Tor says why** (Android): the note gives the reason, such as a wrong token or the relay
  out of reach, where it said only that a call to ErevosCore.torRequest had been rejected.

## 3.1.0 (2026-10-24)

### For you

- **Hidden chats open from New chat too**: hold **New chat** down for a second and a half, type the PIN and tap
  **Open**. It shows the same in every space, and a wrong PIN only closes it, as a search that finds nothing.
- **Search contacts in the Phone** (Android): a search at the top finds a contact by name or number, in the phone's
  contacts and, with Erevos unlocked, in those kept only in Erevos and your Erevos contacts, never in hidden chats.
  Tap a number to call it, or hold it down to put it on the keypad.
- **New chat shows how to add a contact first**: the relay's own settings (its address, token, second relay, invites
  and queue) are closed under **Relay settings** until you tap it; your contact link, its QR code and adding a contact
  show at once, as before. **Hide relay** is now **Hide relay and new contacts**.
- **Share to Erevos from other apps** (Android): Erevos is now in other apps' **Share**, such as the browser's for a
  link. **Send to** lists your chats, groups and SMS conversations, recent ones first, with a search, never hidden
  chats. Words and links open in the message field of the one you pick, to read and send there; a photo or file goes
  as soon as that chat or group opens. Before, Erevos took only SMS links from other apps.
- **Every new message sounds, also while Erevos shows** (Android): the notice that says how many messages came now
  sounds for each message, not only the first, and shows while you use Erevos too. In the chat or group you have open
  only the sound plays, and opening a chat takes what came there off the count. Typing, and that a message came or
  was read, still make none, nor does a message sent without sound. Hidden chats that say when a message comes say so
  at once too, unless that place is open. **Say a message came** or **No notice** now shows with **Only while Erevos
  shows** as well.

### Under the hood

- **Less battery in the background** (Android): Erevos waits at the relay a minute at a time, also for what comes to
  your contact link and your public groups, and asks nothing more when nothing came, where before it asked about
  ten times a minute. Tor sends the reduced padding Tor made for phones (every 9 to 14 seconds, none to the phone).
  Looking for phones nearby in the background: Wi-Fi Direct every ten minutes instead of two, Wi-Fi Aware a minute
  in every five, and on the same Wi-Fi Erevos hears the others twenty seconds in every two minutes, so a phone
  nearby may be found a few minutes later. A Wi-Fi Aware link that ended no longer keeps the Wi-Fi awake. Nothing
  changes while Erevos shows.
- **Erevos no longer closes by itself** (Android) when part of a screen is redrawn elsewhere while a screen is still
  sliding away, as could happen back from choosing a photo for a sticker, and again when Erevos opened after
  cropping it. Android said "The specified child already has a parent".
- **Hidden chats' notices are right again** (Android): messages already told of no longer show "New message" again
  when Android closes Erevos in the background and starts it anew, nor do the ones you read while the hidden chats
  were open once they close. A text to hidden chats whose bell their relay did not take (Nostr) is now counted when
  it goes through the relay five minutes later, where before it made no notice at all.
- **A call shows over the screen saver** (Android): while the phone showed its screen saver (as while charging), a
  call rang but its screen did not show. Now the call notice shows then too, also with Erevos open under it, and the
  screen wakes, which ends the screen saver; so does a screen that is off.
- **SMS settings say how the list works now**: an SMS conversation is pinned, archived, marked as spam, blocked or
  deleted by holding it down, as a swipe to the side goes to the tab beside; they still said to swipe it.

## 3.0.0 (2026-10-24)

### For you

- **Each launcher icon opens what it names** (Android): **Erevos**'s own icon opens its chats (the **Erevos** tab),
  or leaves the chat you had open, instead of whatever Erevos showed last, such as the SMS after SMS's icon or the
  Phone after Phone's. **SMS** opens the SMS list again also when Erevos showed it before and you went to another
  tab, **Phone** opens the keypad (with missed calls the widget's button opens **Recents**), and the widget's
  buttons do the same each time they are tapped. A tel: link with the same number a second time types it again.
- **Messages go through Tor by default** (Android): under **Tor**, **What goes through Tor** is now **Messages**,
  **Everything** or **Nothing** instead of a switch, and **Messages** unless you change it. With **Messages**, what
  you write and what tells your contacts something (such as that a message was read) goes to the relay through Tor,
  so the relay does not see your phone's IP address for it; pictures, files and voice messages go straight, which is
  faster. A message never waits for Tor: while Tor starts, or for a minute after it could not reach the relay, it
  goes straight. **Everything** is the old switch turned on: files too, and nothing without Tor. A space that had Tor
  on keeps **Everything**; one that had it off gets **Messages**.
- **Texts through Nostr** (Android): under **Nostr**, on unless changed, what you write to a contact whose Erevos
  reads on Nostr too goes through three public Nostr relays, through Tor, instead of through your relay. It is
  end-to-end encrypted as always and wrapped once more (NIP-59) for a Nostr key your contact made for that chat
  alone, by a key made for that message alone, so the Nostr relays see neither who wrote it nor to whom, and your
  relay does not see it. Should your contact's phone not say within five minutes that it came, it goes through your
  relay as well, and they see it once; while Tor starts, or when no Nostr relay takes it, it goes through your
  relay at once. Hidden chats read on Nostr while they are open, and still show **New message** when closed: with
  each text through Nostr your contact also sends your relay a bell that says nothing. Pictures, files, voice
  messages, calls, reactions, the marks that a message came or was read, texts sent for later, and whatever goes to
  contacts on an iPhone or a computer stay on your relay. Each space has its own list of Nostr relays: the first
  three unless changed, up to five, your own too. With Tor off for a space, Nostr is not used. Nothing changes on
  the relay. Tor's connections also no longer hold up the app's other work while they wait.

## 2.0.3 (2026-10-23)

### For you

- **One invite for everything**: **Invite someone**, in the chats, makes one QR code or link for
  someone new, for one person and 7 days. Their phone scans or opens it in Erevos and taps
  **Join**: it gets access of its own to your relay and a queue there, typing nothing, and you are
  each other's contacts at once, with no message request, named as each of you typed. A phone with
  no relay yet shows **Start with an invite** instead of the relay settings (with **Sign in with
  LPHL** and **Set it up yourself** under it), so a new user never sees the words relay and token.
  The access is an invite to the relay, so it takes a relay that invites; without one the invite
  still makes you contacts.
- **Spam rules on who sends, and why** (Android, SMS): under **Spam filter**, **Senders** takes a
  sender's name (as shops and banks send) or a number with * for anything (`+4470*`, `1234*`),
  **To Spam** or **Let through**: a sender let through is never caught by the filter's rules, though
  a number marked as spam or blocked still is. **Send numbers from abroad to Spam** catches every
  number written with another country code than yours, which Erevos takes from the numbers you
  answer. Each conversation in Spam now says why it is there: blocked, marked, which rule, abroad,
  which of your words, or a link and which words that try to fool.
- **480 stickers in 20 sets of 24**: the nine sets grew to 24 each, and eleven new ones came:
  Cats, Dinosaurs, Monsters, Robots, Love, Greece, Sports, Music, On the move, Flowers and plants,
  and Fruit and veg. All but Words and Treats move. As before each phone draws them and only a
  sticker's name travels, so an Erevos from before shows a new one's emoji.
- **Copy code** for one-time codes (Android, SMS): an SMS that says it holds a code, in any of
  the app's languages, gets **Copy code** under it in the chat and on its notice, which does not
  show the code (and on Android 12 and later asks to unlock first). Only the code's digits are
  copied, marked sensitive so Android shows no preview; a phone number, an amount, a date or a
  time is never taken for one.

### Under the hood

- **Chats are lighter on older phones**: typing redraws only the message bar, not the whole chat
  with its thread; a message of the thread draws again only when it changes (a voice message
  playing redraws its own line, once a second); a long chat opens at its latest 100 messages, with
  **Show earlier messages** above them, and going to an earlier one (from the search, a starred
  message or the one a message answers) brings it, and a chat shows its messages as it opens,
  without first waiting for a look at the relay under way. Messages, files and pictures go through native
  base64 and UTF-8 where the phone has them, and the open space's history and queues are kept
  open instead of read again every few seconds, as are the SMS invites unless something changed
  them. Groups' message bar too.
- **QR codes show at once**, on older phones too: each is one picture now, made in a fraction of
  the time, instead of a view for each stretch of modules (about 11,000 for a contact's code) and a
  slow search for its mask. It looks and scans the same, and letters beyond English go into it as
  UTF-8.
- **Locked, Erevos still receives** (password lock): when it locks, after 30 seconds away or with
  **Lock now**, the password screen comes in front of the open space, which goes on behind it, so
  messages and calls still come, with their notices, and a call shows over the password screen.
  Before, the space closed as the password screen showed, and Erevos left there received nothing,
  with no notice saying so. Its screens still close, hidden chats too, and the call screen still
  loses its contacts' names; another space's password closes it first, nothing of it kept. When
  the space does close (after a backup is restored) and Erevos leaves the screen with the password
  asked, a quiet notice says "Locked" (Android).
- **Contacts open faster** (Android): the phone's contacts show as soon as Android gives them, and
  at once when you come back, while they are read again; those kept only in Erevos and the chats'
  Erevos contacts join them a moment later. Putting them in order by name no longer takes seconds
  with many contacts, and the search no longer reads every contact again at each letter.
- **Hidden chats' notice counts only messages** (Android, **Say when a message comes**): while a
  place is closed, the notice says "New message", or how many came, each message once, as for the
  other chats. Before, anything that came for the place made it, also that a message of yours came
  to them or was read, and after that one it said nothing more until you opened the place, so a
  real answer could pass in silence. A call that rang (**Ring calls when closed**) makes none; one
  that did not ring counts as a message. The relay counts what comes into a queue by the byte each
  send carries, as it does for the web app's notice, and tells the phone how many (`NEWS`); it
  needs the relay updated, and an older one only says that something waits, as before.
- **The relay tries every address of a push service** (web app notices): one after the other, all
  within the same 15 seconds, so an address that does not answer, such as an IPv6 one on a server
  whose IPv6 does not work, no longer loses the notice. Its service (`deploy/relay`) starts it at most 5 times
  in 5 minutes, and not again when it refuses its settings, instead of every 2 seconds for ever.
- **The relay tries every address of another relay and of the sign-in provider** as well, for
  forwards, files kept on another relay and **Sign in with** checks. It also keeps less in its log
  and is safer on a power cut: of a sign-in the provider refused it logs only the error's code word,
  never other text a browser sent; its debug output leaves out secrets, tokens and who signed in;
  its keys (its own and the one for web app notices) are written whole or not at all, so a stop
  while it makes one no longer leaves a short key that refuses every later start; a file part or a message sent for later, once stored, stays after
  a power cut; and a line with letters other than English ones in the file of revoked lending
  tickets no longer stops it.

## 2.0.2 (2026-10-23)

### For you

- **Launcher icons fill the launcher's shape** (Android 8 and later), as FASOULI's do, in every colour,
  instead of a small square inside a pale tile.

### Under the hood

- **Swipes on tabs only change the tab**: on a screen with tabs a sideways swipe always moves between
  them; past the first or last tab it gives a little and comes back, instead of going back a screen.
  SMS conversations in the home list no longer swipe to archive or delete: hold one down for both.

## 2.0.1 (2026-10-23)

### For you

- **Launcher icons of their own colour** (Android): Erevos red, Phone green, SMS blue and Contacts
  violet, so they can be told apart at a glance. **SMS** is a new icon of its own, which opens the SMS
  list as the widget's button does.
- **Choose each icon's colour** (Android, **Appearance** → **Launcher icons**): red, orange, green,
  blue, violet or dark, for each of the four. It is the phone's choice, not a space's, as the icons
  show before Erevos is unlocked. After a change some launchers take the icon off the home screen:
  add it again from the list of apps. After this update Erevos's own icon may need adding again once.
- **Rearrange the widget's buttons** (Android, **Appearance** → **Widget**): move each of its four
  buttons with ↑ and ↓, with the widget drawn as it will look; **First order** puts back Phone, SMS,
  Messages and Contacts.
- **Swipe to go back** on every screen: swipe right anywhere, as with the back arrow. **Swipe to the
  side** between tabs: **All messages**, **SMS** and **Erevos** on the home screen, **Keypad**,
  **Recents** and **Favourites** in the Phone, the filters in Contacts and the sticker sets. An SMS
  conversation in the list keeps its own swipes.

## 2.0.0 (2026-10-22)

### For you

- **A new Erevos contact can take the name of one of your contacts**: adding someone by their
  Erevos ID, from a scanned link (**Add and connect to one of my contacts**) or under **Relay and
  new contacts** (**Connect to one of my contacts**, under the note that they were added), lets you
  choose one of your contacts, the phone's or those kept only in Erevos (in hidden chats only
  theirs, never the phone's). The two are linked, and the chat takes that contact's name instead of
  "contact 1a2b3c4d" in the chat list, the chat, the search and calls. An Erevos contact that is no
  contact yet has the same on its card. **Add to Erevos** and **Choose from my Erevos chats** on a
  contact's card name the chat too, and a card linked before to a nameless Erevos contact names it
  once opened. A name you gave in Erevos is never changed. On a linked computer the name goes to
  the phone too.

- **Sign in to the relay with LPHL**: on a relay whose operator set up an OpenID Connect provider
  (`EREVOS_RELAY_OIDC_ISSUER` and the rest, such as LPHL's Authentik), **Sign in with LPHL** shows
  under the token in **Relay and new contacts**. It opens the provider's sign-in page in the
  browser, where the name and password are typed, never in Erevos; the relay's page then shows six
  digits of its own making, typed back in Erevos under **Code from the page** (coming back puts you
  there) with **Finish signing in**, and the phone claims a token of its own over the WebSocket with
  them and a secret it made first, so no token is ever in an address, and a sign-in link someone
  sends gives nothing to a phone that did not sign in itself. Five wrong codes end the sign-in. The
  relay adds the line `lphl:<user name>` for it (signing in again on the phone replaces it, when its
  token is the one it got from that relay; 10 phones at most for one account) and every hour
  refreshes the account's token, checks it is still active and asks userinfo whose it is, taking
  the line out once the account is closed or disabled, is not in the group the operator names
  (`EREVOS_RELAY_OIDC_GROUP`), or the provider could not be asked for 3 days and then failed two
  more checks of that line an hour apart: no line goes for another's check, nor all at once after
  the relay was off or the clock moved. It keeps only the account's id, user name and refresh
  token, sealed with a key from the client secret, and writes that down before the line, with a
  mark while a line is to go, so a restart before it is out of the file takes it out again. One
  browser starts 10 sign-ins a minute at most, told by `X-Forwarded-For` from a proxy on the same
  machine. The pages are on `/signin/`, which a proxy in front passes as plain HTTP; Erevos opens
  them only over https on the relay's own host.

- **Invites to the relay**: on a relay whose operator turns invites on (`EREVOS_RELAY_INVITES=on`,
  with a file of phones' own tokens), a phone with a token of its own has **Invite to the relay**
  under its token in **Relay and new contacts**. It names who the invite is for and shows a QR
  code, good for one phone for 7 days; the phone that scans it (with its camera, a photo of it in
  Erevos, or its link pasted) makes a token of its own, keeps it sealed in its space with the
  relay's address, and makes its queue there, typing nothing. The relay keeps only a fingerprint
  of the invite and of the token, and adds a line for the phone to its file of tokens, named as
  typed, made safe and unique, saying who invited it. The inviter lists their invites and takes
  back one waiting, or the phone that took one. A phone let in by an invite uses the relay only as
  long as the phone that invited it: once that one's line goes (taken back, signed out, or taken out
  of the file by hand), the lines it invited go too, and theirs, and a connection a phone has open
  is closed at its next request once its line is gone, and a message it sent for later no longer
  goes. That goes by the token, so a line put in place of another with a new token cuts what the
  old one invited; `erevos-relay free-line NAME`, run with the relay stopped, frees a line from its
  inviter. The relay never writes the file of tokens because it read it: it takes refused lines out
  of it only once the file stayed unchanged for a minute and is as it read it, so a save it reads
  halfway loses no line, and who invited whom stays through a failed write or a restart, signing in
  again too. At most 5 waiting at once and 10 a day for each phone, and 100 phones let in by invite
  on the relay (`EREVOS_RELAY_MAX_INVITED`). An invite names a wss:// relay, or a ws:// one on a
  home network only. The relay refuses a file of tokens that is a symbolic link. Older relays and
  phones are unchanged: the button does not show.

- **Permissions in the web app** (menu → Permissions): what the browser lets Erevos do, each with
  why and the browser's own question, or where its setting is once it no longer asks: running from
  the home screen, notifications while closed for a space that turned them on, the microphone, the
  camera, and keeping its data for good (Safari may clear it otherwise; a backup is the safety
  net). It knows an iPhone or iPad, Chrome and the browsers made from it, Firefox and Safari on a
  Mac. After each new signed release it opens by itself when something messages, calls or the data
  need is missing. A browser cannot tell battery saving, so it is not there. On Android the screen
  now also reads the message notice, whether the call notice pops up, battery use set to
  Restricted and pausing when unused (these open it by itself too), the message sound, notices on
  the lock screen and calls through Do Not Disturb, and says when the phone is on silent or
  vibrate, or battery saver or Do Not Disturb is on.

- **The web app's notice says how many**: while Erevos is closed, its one notice says how many
  messages came since it was last open, such as "3 new messages", in the app's language, or "Call"
  when only a call rang, and opening Erevos starts again. The relay counts what the sending phones
  marked as messages (below) and puts the count in the push, encrypted for the browser and always
  the same size, so the push service (Apple's on an iPhone) sees only that something came, and
  when. Receipts, typing and new keys push nothing, and messages read on the screen end a push
  still waiting. At most one push every 15 seconds goes to a browser, for all its spaces on one
  relay. With a relay or a sender's Erevos older than 2.0.0, or a message other phones carried to
  the relay, there is no number: the notice says "New message", or "New messages" once more came,
  until Erevos is open again. The browser keeps a short tag of each queue that pushed, to count
  each message once, only until Erevos next opens or closes: until then, how many there are may
  show more than one space. An iPhone keeps every notice, so the older ones are closed once the new
  one shows (an iPhone keeps those less than 30 seconds old).

- **Hidden chats can ring their contacts' calls while closed** (**Ring calls when closed**,
  Android): turned on at the top of a place, a call from one of its contacts then makes the phone
  ring and show "Incoming call" with no name, as the other chats do, though the place is shut and
  Erevos is in the background. On the ringing screen a small, discreet sign opens a PIN field; the
  right PIN opens the place and answers, a plain Answer cannot connect, and Decline stops the ring
  (about 45 seconds). Like the message notice it needs **Receive and ring** and a relay that waits,
  and the space keeps a ring queue for each of its 4 places, those not ringing made for nothing on
  the same relay, so opening the space gives nothing away; the relay is asked only whether a ring
  waits there, never what, and a caller sends only random bytes of a call's size, never opened. The
  call's own offer waits on the chat's message queue until the PIN opens it. A contact you deleted
  can still make it ring but never connect; a call from a linked computer rings only while the
  hidden chats are open. Backups do not keep it.

- **A new chat screen**: one bar at the top with the contact's picture and name, whether they are
  online, nearby or typing, and buttons for a video and a voice call, with ⋯ (⋮ on Android) set
  apart for the chat's details. Under the messages, one floating bar: **+** opens, where the
  keyboard was, what to send (photo, camera, file, sticker, location, poll) and how the next message
  goes (disappearing, Talkie, send later, and as an SMS for a contact with a number); the smiley
  opens the stickers, the stopwatch makes the next message disappear, and the microphone, held,
  records a voice message. Slide left to drop it; under a second sends nothing, and TalkBack starts
  and stops it with a tap. With something typed it is the send arrow, which held sends without
  sound, later, disappearing or as an SMS. A disappearing message can now be a voice message (a
  walkie-talkie one too), photo, file, sticker, place or poll, sent now or later. Groups have the
  same bars, with their video call under ⋯. Switches show their knob when off on dark glass, and a
  light color of your own takes dark text on its buttons in the dark too.

- **Add a contact from a photo of their QR code**: under the contact link field in **Relay and new
  contacts**, **Take a photo of the QR code** and **Choose a photo of the QR code** read it and add
  them at once (not in hidden chats, which a photo would close). The computer app, the web app and
  the Sailfish OS app read QR codes from a photo now too, with **Choose a photo of the QR code**,
  which on an iPhone offers the camera as well; until now they could not. There, photos sent at a
  smaller size, contacts' pictures, your own stickers and wallpapers now also work in older browsers
  (an older Safari, Sailfish OS), which refused them. A button's long label goes on two lines on a
  narrow phone instead of out of the screen.

- **The Phone screen fits a small phone**: on a short screen (360×640 to 360×800) the keypad no
  longer runs up over the tabs and the "Erevos is not the phone app" card. That card shows only its
  title there, with a > that opens the phone settings; the keys, the number and Call shrink to what
  is left, down to 70%, and scroll past that. The title stays on one line, the three tabs share one
  row, and "Type a phone number." goes as soon as one is typed.

- **Add as contact in a group**: in a group's members list (**⋯**), **Add as contact** under a
  member who is not your contact asks them, in a message only they get, for their contact link, and
  gives them yours. On their phone the ask shows once, at the top of the group, to **Send** or
  **Don’t**; once they send it you are each other's contacts, with a chat of your own and no message
  request on either side. Don't, or no answer, tells you nothing, and after a week you can ask
  again. A member who is your contact already is never changed by it, and nothing of it reaches
  hidden chats: once you are each other's contacts, in any group or by a contact link, what was
  asked in your other groups goes, so nothing left over adds them again after their chat is deleted
  or moved into hidden chats. A member taken out of the group asks nothing more, and when two
  members show the same key no contact link goes to either or is taken from either. **Name** under a
  contact who has no name yet gives them one, on a linked device too. Not in public groups, and
  asking is for the phone that holds the account; an Erevos from before drops the ask. An admin now
  adds a contact only by a key package that is theirs: one that says it is someone else does not
  join. A phone joins a group only when its admin is the contact who asked it in.

- **Stickers in sets, that move, and your own**: 48 built-in stickers in five sets (Moons, Animals,
  Celebrations, Words and Treats). The moons, animals and celebrations move a little for a few
  seconds as they come and when tapped, then rest, and stay still with the phone's reduce motion
  setting; the words show in the app's language. Each phone draws them, and only a sticker's name
  travels. **Mine** holds stickers made from a photo: cut square, 512 by 512 and about 100 KB at
  most, with nothing but the picture, kept sealed in the space or the hidden chats they were made
  in, up to 100. They go end-to-end encrypted as photos do, marked as stickers, in chats and
  groups; an Erevos from before shows them as photos. **Add to my stickers** keeps one you were sent.

- **SMS in the Erevos chat**: with a contact whose number is linked to them, or is on their contact
  card, the chat shows the SMS and MMS with that number among its messages, by time, each edged and
  marked SMS (not encrypted), with its ✓ marks and photos. They are read from the phone's SMS,
  never kept in the chat's history; held down, one is copied, forwarded or deleted as in the SMS
  conversation, and the chat's search finds them. Only the conversation with that one number, only
  while Erevos is the SMS app or may read SMS, and never in hidden chats; the latest 50 first, and
  **Show earlier SMS** for more. New ones show as they come, also while another app is the SMS
  app: the chat and the SMS conversation hear when Android's SMS store changes, and read it again
  as Erevos comes back.
  **Plain SMS** in the chat's details opens the SMS conversation itself, to write one there, and
  **+** → **Send as SMS** (or **As SMS**, holding the send arrow) sends what is typed as a plain
  SMS, naming the SIM when there are two, and saying so first when the message was to disappear
  or to answer one, which an SMS cannot. Before, once a number was linked, its SMS could no longer be reached from the chat. The
  home screen's **Erevos** list keeps a contact whose last message was an SMS, which it used to
  drop. No hidden SMS invite goes to an Erevos contact's number any more, linked or on their
  contact card.

- **An F-Droid build** (`EREVOS_DISTRIBUTION=fdroid`): F-Droid updates it, so its Updates screen
  says so and has no Check for updates, and it may not install packages. The release APK keeps
  both. No build's manifest names Google Play services any more: expo-image-picker's hint to
  Google Play, to install its photo picker on Android 10 and older, is left out.

- **Permissions** (Android, menu → Permissions): what Android lets Erevos do for calls and messages
  in the background (notices, the call notice, calls over the lock screen, battery saving, Data
  Saver, the microphone) and for other things (camera, phones nearby, contacts, exact times), each
  with why and a button for Android's own question or setting. On Huawei, Honor, Xiaomi, OPPO,
  realme, OnePlus, vivo, Samsung and ASUS it also says where the maker's own background setting is,
  and opens it. After each new version, and the first time, it opens by itself when calls need
  something. Also under Lock and second password → In the background → All permissions.

- **Serbo-Croatian** (Srpskohrvatski): the whole app, in Latin letters and ijekavian, in words
  understood alike in Croatia, Bosnia and Herzegovina, Montenegro and Serbia. A phone in Serbian,
  Croatian, Bosnian or Montenegrin starts in it. A count takes the form its last digits ask for
  (1 kontakt, 2 kontakta, 5 kontakata, 21 kontakt), and dates are written as in Bosnia unless the
  phone itself writes Croatian, Bosnian or Serbian in Latin letters. The user guide shows in
  English, and Android's notices too, as in the other languages besides Greek.

- **Version numbers**: the next release is 2.0.0, and each one after it the next number (2.0.1,
  2.0.2…) unless it is given one when started (Actions, release, Run workflow, version). Every
  release still has its own build number, the run's, so Android installs it over the one before.
  Updates → Check for updates in 0.1.16 and before offers 2.0.0 as **0.1.<build>** (the only kind
  of number they read); it is 2.0.0 all the same, and shows as 2.0.0 once installed.

### Under the hood

- **An update of the phone's WebView no longer closes Erevos** while it receives in the
  background, which took its notice away and with it calls and messages until you opened it. Erevos
  keeps no cookies, so its relay connections no longer load the WebView (and hold less memory).
  When Android closes Erevos all the same while it receives, for memory say, a quiet notice says so
  from then on: open Erevos and the space to receive again.
- **Deleting or blocking a contact gives you a new relay queue**: **Delete contact** and **Block
  contact** in a chat's details forget them and their chat, and Erevos makes a new queue at once,
  which your other contacts are told quietly, in a message with nothing in it, and again 7, 14 and
  21 days later while they have not written there; what they wrote to the old one still shows for 14
  days. The one deleted is not told and nothing they send there shows; your contact link stays, so
  they can still ask to talk again, unless blocked: then what they send is dropped, a request too,
  until **Unblock** under **Blocked contacts**, and adding them again from their link asks you to
  unblock them first; nothing else adds them, neither their answer to an invite by SMS nor their
  contact link in a group. **Block** sits beside **Refuse** on a request, and moves your queue only
  while your link still names it, as a request knows only your link. The note says in how many of
  your groups they still are. What you scheduled for them is taken back from the relay, at once or
  as soon as it answers, and what you scheduled for a contact whose queue moved is held again for
  their new one. When junk fills your queue it moves the same way, at most once a day, and junk on
  the queue your link names gives you a new link, as **New contact link** under **Relay and new
  contacts** does: the old links and QR codes work 14 days more; when the relay has lost that queue,
  the new link comes the same way, and the old ones stop at once. Your groups and public groups each
  say a queue of their own from now on, so a member no longer learns the one in your link, and a
  group admin says it with new keys, which members take only if it is still the same admin. On a
  linked computer, deleting or blocking goes to the phone, which moves the places of its list and
  asks the computer to move its own, and tells the computer who is blocked: adding them there from
  their link asks to unblock them as the phone does, and **Unblock** unblocks them on the phone too.
  A backup put back, one from before this version too, says a newer queue than any your contacts
  hold, and each is told it, so none keeps writing to a queue you no longer read. A flood of
  made-up requests counts as junk, while a batch of real ones still comes. In hidden chats only
  that place moves, its ring queue at once, as it does after three rings within a day that brought
  no call within two minutes of your answer, and its contacts learn the new one as they learn a
  moved queue. A linked computer never rings a contact's ring queue itself, so a call from it rings
  their closed hidden chats only once they are open, as the phone does not pass it on to that
  queue.

- Each send now tells the relay what it carries: a message someone reads (a text, a voice message
  in its parts, a photo or file, a sticker, place or poll, a group's message), or word between
  phones (that it came or was read, typing, reactions, new keys, a group's own changes, what goes
  between linked devices), which pushes nothing; a call that rings, a group's call that starts
  too, pushes as a call, counted as no message. What waits for the relay, or is sent for later,
  says it when it goes, and so does a contact's message the phone passes on to a linked computer,
  and each group message, however many reach it at once. What a linked device writes goes to the
  phone as word between them, as it is the account's own, and the phone counts it once as it
  passes it on, a voice message too when one of its parts had to wait. A message carried by phones
  nearby says it when this phone hands its own copy to the relay; a phone carrying it for another
  cannot know, so says nothing. What 0.1.16 kept waiting for a linked computer says nothing either
  when it goes after the update, so it still pushes. So a relay that counts can say in a closed web
  app's push how many messages came (above). The relay sees these marks on every system,
  notifications on or not: which packets are messages, and when a call starts.

- **Newer keys every month**: each chat's account makes new prekeys (X25519 and ML-KEM-768) every
  30 days and gives them to its contacts inside their chats, whose Erevos starts a new conversation
  with them; keys older than the last three are thrown away. So a phone or backup taken later no
  longer opens, even with a quantum computer, what was said in conversations those keys started.
  The safety number stays the same, and contact links keep working. Contacts on 0.1.16 and before
  stay in the conversation they have.

- Linked devices make keys of their own, and the phone signs the list of them with the account's
  key, a first step towards linked devices that work with the phone off. Nothing changes yet in
  what they do; devices linked before need no linking again.

- Linked devices reach each other directly: with the phone off, each still shows what the others
  write, read, react to and change in contacts, and the contacts get it once the phone is back, as
  before. One that missed the first message of another gets a new one a day or more later. With a
  phone or device from before, everything goes through the phone as now.

- Contacts on this version write to each linked device too, so a computer gets their messages and
  answers them with the phone off, also once the phone's queue on the relay is full: what they try
  again reaches the computer all the same, once however often it is tried, and a voice message
  reaches it whole, however long. A computer that was off for longer than the relay keeps messages,
  or missed a contact's first message to it, still gets what they write after, as their Erevos
  starts again with it a day or more later, then ever less often, until it answers; after a contact
  deletes the account and adds it again, the computer starts again with their devices too. Each
  message shows once, even after it disappeared, when it comes again within 30 days (up to 2000
  from one contact, the oldest that came twice giving way first), as each keeps for 30 days which
  messages came and on what day, not what they said, in a backup made meanwhile too; it counts once
  in an Android device's notice, and a voice message sent again after only part of it went is put
  together once. What came and was read shows on all, also what a call or a message sent for later
  says was read. Only a linked device of the account takes what is written to it, so a list
  naming someone else's account on this version has it read nothing. Under the safety number, a
  chat's details say when the list of the contact's devices last changed. A phone put back from a
  backup gives its contacts a new list, without the computers linked since, also when its clock is
  behind the lost one's, once they write to it; a computer unlinked is left out of the list they
  are given the next time the phone reaches the relay, even while the relay makes no new queue. Each
  contact seals what they write to each device with a key no other contact has, so a relay that
  works with one of them opens none of the others'. A device whose queue on the relay is full keeps
  no other contact or device out of what waits to go, and a reaction, pin or vote a computer writes
  through the phone goes to a contact's devices once it reaches the contact. Hidden chats write to a
  contact's devices too, and to the contact look like the chats of a phone that never linked a
  device; while a contact's queue is full, what they write still reaches the contact's devices and
  is tried again for their phone while hidden chats stay open. A chat moved into hidden chats or out
  of them writes only to the contact's phone until it goes back, and tells the contact's devices
  first, who can tell from it, if it gave them its list, that it went into hidden chats. With contacts, phones or devices from before,
  everything goes through the phone as now. What they write to each device, and what a computer
  writes to them itself, tells the relay what it carries as the phone's messages do, for a closed
  web app's notice to count; the phone passes a contact's message on quiet to a computer they wrote
  it to as well.

- **Group keys made new every week**: in every group, private or public, the admin's phone makes
  its own keys new, and each member's phone asks the admin to put it in anew with new ones. So keys
  taken from a phone once stop reading the group within a week. Members see no one leave or join.
  An admin on 0.1.16 and before does not do it, and its members stay as before.

- **Android updates need the release computer's signature**: Check for updates installs an APK
  only once `deploy/web/publish.sh` on the release computer has signed its build and SHA-256 with
  the web app's offline key (`android-update.json`, served beside the web app). Until then it says
  the version is out but not signed yet. Whoever took over the GitHub account alone can no longer
  get an APK installed this way.

- **Builds**: every GitHub action the workflows use is pinned to a commit (its version in a
  comment), so a moved tag in an action's repository cannot change what runs beside the signing key.
  Each build checks the locked Rust crates (`cargo audit`, with what passes and why in
  `.cargo/audit.toml`) and the app's packages (`npm audit`, failing on a critical one) for known
  advisories. Updated for them: rustls-webpki and webpki-roots (the relay's and Tor's TLS),
  ml-kem 0.3.3 and fflate 0.8.3.

- **Relay**: closes connections left quiet for 5 minutes or slow in their handshake, and takes at
  most 512 at once (128 without a token). `FORWARD` and `FILE_VIA` refuse addresses that are not
  on the public internet, unless `EREVOS_RELAY_PRIVATE_PEERS=allow`. At most 100,000 queues, and
  queues no one has read for 180 days are removed. A relay that panics while holding a lock stops,
  for its service manager to start it again. Its journal changes shape: an older relay no longer
  reads it. See [deploy/relay/README.md](deploy/relay/README.md).
- **A token for each phone** (relay): `erevos-relay new-token NAME` makes one, and the relay keeps
  only its hash in the file `EREVOS_RELAY_TOKENS` names, beside its one token. Deleting a phone's
  line takes its access back, from the next connection on, without touching the others.
- **Lent places** are off unless the relay's operator turns them on (`EREVOS_RELAY_LEND=on`). A
  lent place may put 50 MB of files a day, its counts last across restarts, and the operator can
  revoke a ticket in a file. Lent tokens are longer, so those given before stop working. In the
  app, a ticket goes into a contact link only when you turn on **Share a place on my relay with
  this link**, for the link shown then.
- **After a backup is restored**, each chat skips ahead past the sending keys used since the
  backup, so no message key is used twice.
- **No link starts a call** any more: a call starts only from a tap inside Erevos.
- **Screen privacy** (Android): while hidden chats are open, and while a space with a password lock
  is open unless turned off, Erevos stays out of screenshots and of the recent-apps preview.
- Hidden chats' contact names no longer show on the call screen or in call notices.
- **Backup passwords** need at least 12 characters.
- **Argon2id** after PBKDF2 for passwords, PINs and backups, so each guess costs memory as well as
  time. The lock's slots and hidden chats' PINs get it at the next start, without their passwords;
  automatic backups at their next run. Backups made from now on open only in this version or later.
- **Stored sizes**: every space's and hidden chats' value in a sealed file is the same size, used or
  not; what is larger goes to pages among the history's.
- **Messages sealed for the relay**: once each phone has had a message from the other, every
  message in a chat is sealed once more for the phone it goes to, so the relay can no longer tell
  from them which conversation they belong to, and the phone opens each in one chat only instead of
  trying it in all. An older Erevos does not seal, and its messages are read as before.
- An old first message a relay sends again is refused however many new contacts came since.
- A group's keeper cannot leave or take itself out, and hands the group only to a member who stays.
- An MMS with a length past its end is refused at once. A new fingerprint key opens only while the
  phone is unlocked.
- **The desktop app on Linux with no keyring** keeps no keys, and says how to start one, unless
  started with `--plain-secrets`; then it keeps them as before, readable by your user.
- The guide says at the top of SMS that Erevos does not encrypt SMS and MMS.
- **Carrying messages for phones nearby** is off unless turned on, and then goes only to relays on
  the internet over TLS (`wss://`).
- A README that matches the code, this changelog, and a threat model (`docs/threat-model.md`).
- **The keyboard** no longer covers the end of the list while you search the chats on the home
  screen or the contacts: the list ends above it, and **New chat**, **New contact** and Undo
  float above it, as Undo now does in an SMS conversation too. The fields in a chat's details
  scroll above it. The Phone opened while Erevos is locked, and the password and error screens,
  start below the status bar, as the other screens do.

## 0.1.16 (2026-10-20)

### For you

- Imported Telegram and WhatsApp chats bring their photos, videos, voice messages and files, up to
  1 GB each. An export larger than the phone's memory can be read.
- A phone with no relay of its own can chat over the internet through a place lent on its
  contact's relay. That relay must run this version.

### Under the hood

- Adding a link whose relay gives no place adds the contact for nearby use, instead of refusing it.

## 0.1.14 (2026-10-20)

### For you

- Hidden chats: a chat's Details has **Move back to my chats**.

### Under the hood

- Erevos keeps receiving messages and ringing for calls after you swipe it away from the recent
  apps.
- The Phone and Contacts icons open the keypad and the contacts every time.

## 0.1.12 (2026-10-20)

### For you

- Hidden chats can say that a message came (**Say when a message comes**, Android), with the same
  "New message" notice as other chats.

### Under the hood

- The home menu no longer goes under the status bar.
- Reading a QR code from a photo works again.
- No more Bluetooth crashes on Android 17, and a Bluetooth scan Android refuses starts again later.
- Long lists no longer close Erevos on Android.

## 0.1.11 (2026-10-20)

### For you

- The Phone can open without the password, if you allow it in the phone settings.
- A home-screen widget: Phone, SMS, Messages and Contacts, with how many are new.
- The chat list can show only SMS or only Erevos chats.
- **Names** above the list shows contact names on SMS, also of contacts kept only in Erevos. Off
  unless turned on.

### Under the hood

- Recents show at once.

## 0.1.10 (2026-10-20)

### For you

- A link Erevos opens with (the Phone and Contacts icons, `tel:` links, an SMS notice, a scanned
  code) waits for the password and then opens, instead of being lost.
- Phone and Contacts have their own icons, and buttons on the home screen.
- A contact can have an Erevos ID: paste their contact link or read their QR code from a photo.
- **Add to contacts** for a number that is no contact, from its SMS or its calls.

## 0.1.8 (2026-10-19)

### For you

- German, French, Spanish, Italian and Portuguese.
- **Linked devices**: link a computer or a browser to the phone by QR code.
- **Public groups**, joined by a link or QR code, with admins.
- Messages: replies, reactions, pins, stars, polls, stickers, sending a place, forwarding, search
  in a chat and in all chats, exporting a chat, and "typing…".
- Link previews, off unless turned on. Links in chats and SMS can be tapped, and ask before they
  open.
- **Send later**, held on the relay (it needs an updated relay), and SMS later.
- Photos, files and voice messages in group chats, and the same message menu there.
- Erevos can be the phone app (its own call screen, two SIMs, Recents with filters, blocking) and
  the contacts app (groups, birthdays, duplicates, `.vcf` files, the SIM card, contacts kept only in
  Erevos).
- SMS: drafts, a few seconds to take one back, sending again, forwarding, pin, archive, Trash, a
  spam filter and blocked numbers.
- Tor bridges (obfs4, Snowflake, or your own).
- Fingerprint or face unlock on Android, off unless turned on.
- Material You style on Android 12 and later.
- Windows: an installer and a portable `.exe`.
- Backups can hold the phone's SMS and MMS. A backup from a newer Erevos opens, leaving out what
  this one does not know.

## 0.1.7 (2026-10-19)

### For you

- SMS notices while Erevos runs in the background, and **Allow notifications** when Android holds
  them back.

### Under the hood

- No crash when a phone knocks over Wi-Fi Aware on Android 17.

## 0.1.6 (2026-10-19)

### Under the hood

- Nothing new on the phone. The web app is now built with every release, at the same version, and
  signed on the release computer.

## 0.1.5 (2026-10-19)

### For you

- The whole app in English or Greek: Home → Menu → Language. The first start follows the phone's
  language.

### Under the hood

- SMS: Android now counts Erevos as the SMS app, and Erevos says how to choose it in Default apps.

## 0.1.4 (2026-10-19)

### For you

- Web app: notifications while it is closed, through Web Push, off unless turned on.
- **Check for updates** works on a computer and on Sailfish OS.
- SMS: Erevos says when Android holds back reading the SMS and how to allow it, and one MMS it
  cannot read no longer empties the list.

### Under the hood

- Linux: the icon shows in the launcher and the task bar.
- Typing a relay address no longer closes Erevos.

## 0.1.2 (2026-10-19)

The first release with a signed Android app in the public download repository, and the first that
**Check for updates** finds. Packages: Android, Linux and Sailfish OS. It had:

### For you

- 1:1 chats through a relay, end-to-end encrypted (PQXDH, then the double ratchet), with marks for
  sent, came and read, online status, appearing offline, and message requests.
- Voice messages, photos and files, voice and video calls, a walkie-talkie, and calls without
  internet on the same Wi-Fi.
- Group chats (MLS), group voice and video calls.
- Disappearing messages.
- A second password for a second space, and hidden chats: four places per space, each with its own
  PIN.
- Backups, by hand and automatic.
- Imports of Telegram and WhatsApp chats (text only).
- Nearby without internet: Bluetooth, Wi-Fi Aware, the same Wi-Fi, Wi-Fi Direct and LoRa, with
  messages carried by phones nearby.
- Tor on Android, a second relay to send through, and a spare relay.
- Receiving and ringing in the background on Android.
- Erevos as the phone's SMS app, with MMS and two SIMs.
- The desktop app, the web app and Sailfish OS, built from the same code.
- A user guide in English and Greek. The app itself was in English.
