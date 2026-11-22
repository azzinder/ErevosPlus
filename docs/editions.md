<!--
SPDX-FileCopyrightText: 2026 azzinder
SPDX-License-Identifier: AGPL-3.0-or-later
Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.
-->

# Editions: Erevos+ and Erevos

One codebase gives two editions of the app. They are the same package (`app.erevos`) with the
same release key and the same data, so a phone can go from one to the other as an ordinary
update and keeps everything.

| Edition | `EREVOS_EDITION` | Modules |
|---|---|---|
| **Erevos+** | `plus` (default) | Erevos, Phone, SMS, Collection, Nostr, Matrix, XMPP, Telegram (with TDLib: `EREVOS_TELEGRAM=1`, docs/erevosgram.md), Messenger, Signal, Session |
| **Erevos** | `lite` | Erevos, Phone, SMS, Collection |

## What the edition changes

- `app/app.config.js` reads `EREVOS_EDITION`; `lite` is kept as `extra.edition` (`app/lib/edition.ts`). The name
  under the icon is the edition's: **Erevos+**, or **Erevos** for the plain one.
- `app/lib/modules.ts`: `modulesHere()` gives only the edition's modules, so the first start,
  Settings → Modules, the home screen and the menus offer nothing else. A module the plain Erevos
  does not have is never part of a choice made there (`known`), so it is on after moving to Erevos+.
- The core (`crates/erevos-ffi`): Matrix, XMPP and chats with other Nostr apps are behind the
  `networks` feature. `app/modules/erevos-core/android/build.gradle` builds it without them when
  `EREVOS_EDITION=lite`; asked anyway, they answer that they are in Erevos+. Nostr for Erevos's own
  messages (relays carrying sealed packets) is in both.

- Messenger, Signal and Session: `messenger/` (from azzinder/erevos-messenger, with its history) holds their
  engines; `app/modules/erevos-messenger` builds them (Go with gomobile, Rust with cargo-ndk, Session's Kotlin over
  libsession-util-android) and compiles the engines' Kotlin straight from `messenger/android`, so its test app and
  Erevos+ carry the same engines. The plain Erevos takes the module's stub. In the app: `lib/messenger.ts` (state,
  64-bit keys kept as text), `lib/messenger-store.ts`, `components/msg-account.tsx`, `components/msg-chat.tsx`. Their
  accounts are the phone's and show in its first space (space 0).
- Telegram: `app/modules/erevos-telegram`, only with `EREVOS_TELEGRAM=1`, which the plain Erevos refuses.

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

- Erevos+ → Erevos: the chats, accounts and settings of the other networks stay on the phone,
  unused. Nothing is deleted.
- Erevos → Erevos+: they are there again; modules the plain Erevos did not have are on.
