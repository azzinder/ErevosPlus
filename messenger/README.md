<!--
SPDX-FileCopyrightText: 2026 azzinder

SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Erevos Messenger

Facebook Messenger for Erevos, spoken by the app itself on the device. There is
no bridge server in between; only Meta's own servers are contacted.

**Phase 0** (this code): a small Android test app to find out whether this
works well enough: sign-in, chat list, text in normal and encrypted chats,
battery use, and how often Meta asks for checks. After phase 0 the engine moves
into Erevos as a module, next to Matrix, XMPP and Nostr.

- `core/` — the engine in Go. One call, `Call(op, json) → json`, plus events as
  JSON (see `docs/api.md`). It uses `messagix` and the encrypted-chat code from
  [mautrix-meta](https://github.com/mautrix/meta) (AGPL-3.0-or-later).
- `android/` — the test app (Kotlin, no Google libraries). Sign-in happens in a
  web view of messenger.com; the app keeps only the session cookies, never the
  password.
- `.github/workflows/android.yml` — builds the APK, started by hand only.
- `signal/` — Signal, in Rust: [presage](https://github.com/whisperfish/presage)
  over libsignal, with an SQLCipher store whose key is sealed by the Android
  Keystore. A new account with a phone number (SMS or call, after Signal's
  captcha), or this phone linked to the Signal of another phone with a QR code.
  Loaded by the app as `liberevos_signal.so`; its keys are between -2^62 and 0,
  its message ids start with `sg:`.
- `android/.../session/` — Session, in Kotlin over the official
  `libsession-util-android`: a new account with 13 recovery words (or one
  brought back with them), onion requests through three service nodes,
  one-to-one chats with replies, reactions, unsend, attachments (10 MB) and
  ONS names. Groups are not there yet. Its keys are below -2^62, its message
  ids start with `ss:`. The account and chats are kept sealed by the Keystore.

Not in phase 0: photos, files, voice, reactions, replies, groups management,
history, a locked key store (phase 0 keeps the encrypted-chat keys in an
unlocked SQLite file in the app's private folder). Calls are not possible:
Meta's call protocol is closed.

Messenger here does not go over Tor: Meta locks accounts that sign in over Tor
much more often. Use a second account for testing.

## Licence

AGPL-3.0-or-later. See `LICENSE`.
