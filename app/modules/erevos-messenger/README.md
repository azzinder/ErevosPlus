<!--
SPDX-FileCopyrightText: 2026 azzinder
SPDX-License-Identifier: AGPL-3.0-or-later
Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.
-->

# erevos-messenger

Messenger, Signal and Session inside Erevos+ (docs/editions.md). The engines are those of
`messenger/` at the top of the repository; this module builds them for Android and lets the app
speak to them: `call(service, op, json)` and `onEvent`.

- `src/full`: Erevos+. Needs Go with gomobile/gobind, Rust with cargo-ndk and the
  `aarch64-linux-android` target, and protoc (as `.github/workflows/erevosgram.yml`).
- `src/stub`: the plain Erevos (`EREVOS_EDITION=lite`): nothing of the three is in the APK.

`src/full` compiles the engines' Kotlin straight from `messenger/android` (the headless package
`eu.erevos.messenger.engine` with Signal.kt, Session*.kt and KeyWrap.kt; build.gradle `messengerKotlin`),
so the test app and Erevos+ carry the same engines.

Status: being built (branch `erevos-plus`), never compiled yet.
