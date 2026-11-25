<!--
SPDX-FileCopyrightText: 2026 azzinder
SPDX-License-Identifier: AGPL-3.0-or-later
Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.
-->

# Editions: Erevos+, Erevos and Erevos Lite

One codebase gives the editions of the app. Each is an app of its own, signed with the same
release key: Erevos is `app.erevos`, Erevos+ `app.erevos.plus` (from 3.1.0; its 7.x were
`app.erevos`), and Erevos Lite `app.erevos.lite`. So they can be side by side on a phone, each with
its own data, and going from one to another is a move, not an update (below). The second number of
a version says the edition: 3.0.x Erevos, 3.1.x Erevos+, 3.2.x Erevos Lite.

| Edition | `EREVOS_EDITION` | Modules | Where |
|---|---|---|---|
| **Erevos+** | `plus` (default) | Erevos, Phone, SMS, Collection, Nostr, Matrix, XMPP, Telegram (with TDLib: `EREVOS_TELEGRAM=1`, docs/erevosgram.md), Messenger, Signal, Session | Android, web |
| **Erevos** | `erevos` | Erevos, Phone, SMS, Collection | Android, Linux, Windows, macOS, Sailfish OS, web |
| **Erevos Lite** | `lite` | Erevos | Android |

Until 3.0.0 the plain Erevos was built as `lite`. That name is Erevos Lite's now, so every workflow
and script names the plain Erevos `erevos`.

## What the edition changes

- `app/app.config.js` reads `EREVOS_EDITION`; `erevos` and `lite` are kept as `extra.edition`
  (`app/lib/edition.ts`). The package and the name under the icon are the edition's: **Erevos+**,
  **Erevos** or **Erevos Lite**.
- `app/lib/modules.ts`: `modulesHere()` gives only the edition's modules, so the first start,
  Settings → Modules, the home screen and the menus offer nothing else. A module an edition
  does not have is never part of a choice made there (`known`), so it is on after moving to one that has it.
  Erevos Lite has one module, so its first start has no step for them and Settings has no Modules.
- The core (`crates/erevos-ffi`): Matrix, XMPP and chats with other Nostr apps are behind the
  `networks` feature. `app/modules/erevos-core/android/build.gradle` builds it without them for
  every edition but Erevos+; asked anyway, they answer that they are in Erevos+. Nostr for Erevos's
  own messages (relays carrying sealed packets) is in all three.
- Erevos Lite: `app/plugins/with-edition-modules.js` leaves the Phone's and the SMS's native modules
  (`erevos-phone`, `erevos-sms`) out of the app (`expoAutolinking.exclude` in settings.gradle), so
  neither their code nor the permissions of their manifests (calls, call log, SMS, MMS) are in it.
  Their JavaScript finds no native module, as in a browser. The Collection's native module stays,
  as chats open files with another app and play videos through it, but the Collection is not
  offered: what its manifest declares for the Collection's camera, the Camera's icon among the
  phone's apps and the activity it opens, is removed as the manifests are merged
  (`CAMERA_NOT_IN_LITE`), so Erevos Lite has no Camera icon and no Camera shortcut. The guide leaves out their sections (`EREVOS_SECTIONS`) and, in the others, what speaks
  of them, marked in the sources of every language (`{~…}`, `{~…|…}`, `- [~]` and `[~]`, read by
  `editionSource` in lib/guide.ts; checks/guide.check.ts holds every language to the English
  shape and to what Erevos Lite keeps); What's new their lines (`inErevosLite`), under Erevos Lite's own numbers (`asLite`);
  the widget and Appearance → Launcher icons their icons. Chat photos, video calls and the QR
  scanner keep the camera permission.
- Erevos Lite has no payment requests of Fasouli's: `erevos://pay` only opens it, and a request a
  contact sends shows as its words, with no **Paid**.
- Releases: Erevos Lite has its own workflow (`.github/workflows/release-lite.yml`, by hand, version
  3.2.x) and its own download repository, `azzinder/erevos-lite-releases` (secret
  `LITE_RELEASES_TOKEN`); the release computer signs it with `deploy/web/publish-android.sh`.
  Before each, CHANGELOG.md gets its `## 3.2.x (date)` and app/lib/whats-new.ts its entry (the
  workflow checks both): Erevos Lite's What's new shows what Erevos brought since its last release
  under its new one, and Erevos and Erevos+ never list a 3.2.x release. Should a run stop after its
  release is made, Re-run failed jobs finishes it with the same build.

- Messenger, Signal and Session: `messenger/` (from azzinder/erevos-messenger, with its history) holds their
  engines; `app/modules/erevos-messenger` builds them (Go with gomobile, Rust with cargo-ndk, Session's Kotlin over
  libsession-util-android) and compiles the engines' Kotlin straight from `messenger/android`, so its test app and
  Erevos+ carry the same engines. The plain Erevos and Erevos Lite take the module's stub. In the app: `lib/messenger.ts` (state,
  64-bit keys kept as text), `lib/messenger-store.ts`, `components/msg-account.tsx`, `components/msg-chat.tsx`. Their
  accounts are the phone's and show in its first space (space 0).
- Telegram: `app/modules/erevos-telegram`, only with `EREVOS_TELEGRAM=1`, which only Erevos+ takes.

## In a browser

Each edition has a web app of its own (`pwa/build.mjs --edition`, by default `EREVOS_EDITION`):

| Edition | Web app (`release.json` `app`) | Address | Element Call | On the server |
|---|---|---|---|---|
| **Erevos+** | `erevosplus-web` | erevosplus-web.lphl.nekten.eu | erevosplus-call.lphl.nekten.eu | `/var/www/erevosplus-web` |
| **Erevos** | `erevos-web` | erevos-web.lphl.nekten.eu | none (`--no-element-call`) | `/var/www/erevos-web` |

Different addresses are different origins, so the browser keeps their data apart, and a worker
(`pwa/sw.js`) takes only releases of its own web app, even though one key signs both. In a browser
Erevos+ has Erevos, Matrix (with calls), XMPP (on servers with a WebSocket), Nostr and the
Collection; the Phone, the SMS, Telegram, Messenger, Signal and Session need Android.

## Moving between them

Updates (`app/updates.tsx`) offers **Erevos Lite**, **Erevos** and **Erevos+**. A release of the
edition installed is an update. Another edition's is a move (`app/lib/edition-move.ts`,
`modules/erevos-device` `Move.kt`):

1. The edition moved from makes a backup for the move (as Backups does, `lock/backup.ts`) into its
   own folder for moves, with a random password kept beside it in `move.json`, then downloads the
   other edition's APK from its channel (`app/lib/updates.ts`), checks its size, SHA-256 and the
   release computer's signature, and Android installs it beside this one. If the other is on the
   phone already, nothing downloads.
2. The edition moved to, at its first start, finds the move through Android: Move.kt's provider
   (`<package>.move`) answers only an app signed with its own key (`checkSignatures`), and Android
   11 and later show the other editions only to an app that names them (`<queries>`). It copies the
   files, restores the backup and tells the other, which deletes them. A move waits a day. An
   edition set up already asks at its start (`app/_layout.tsx`, `components/moved-out.tsx`), as
   what it brings takes the place of everything it has; Not now is kept for that move.
3. From the moment the move is made, the edition moved from opens no space and receives nothing,
   also in the background (`moved-out.json`, `app/lib/move-state.ts`): only the move shows, with
   **Call the move off**. Once taken, it offers **Delete everything here** (as the panic wipe) and
   **Uninstall**. A move not taken within a day goes, and it opens as before.
4. The phone's SMS and calls stay in Android's own stores; the edition moved to is made the SMS and
   phone app again, if wanted. Before anything is written, the free room is checked.

What a module the edition moved to does not have stays in its data, unused, and is there again
after a move back. A build signed with another key (F-Droid's) cannot take a move: Backups does
the same by hand.

Each edition reads its own releases: Erevos and Erevos+ in `azzinder/erevos-releases` (Erevos+
from 3.1.0 under `channel-erevos-plus` and `channel-erevos-plus-beta`, signed as `erevos-plus`:
`wireOf` in `app/lib/update-channel.ts`), Erevos Lite in `azzinder/erevos-lite-releases`.

The Erevos+ 7.x apps are `app.erevos` and read `channel-plus` and `channel-plus-beta`, where an
`app.erevos.plus` would install as a second, empty app. Only the bridge goes there: an Erevos+ 3.1.x
built with `EREVOS_BRIDGE=1`, so still `app.erevos`, which a 7.x takes as an update keeping
everything, and which then offers the move to `app.erevos.plus` (it reads `erevos-plus`). `version.json` says the
release's Android app (`package`); for older ones `packageOf` (`app/lib/update-channel.ts`) knows it.
