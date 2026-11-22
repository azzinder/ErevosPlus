<!--
SPDX-FileCopyrightText: 2026 azzinder
SPDX-License-Identifier: AGPL-3.0-or-later
Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.
-->

# ErevosGram: the Erevos build with Telegram

ErevosGram is Erevos for Android with one more module, **Telegram**. It is the same app: the same
package (`app.erevos`), the same release key and the same data. A phone can go from Erevos to
ErevosGram and back as an ordinary update. Going back only hides the Telegram module, and nothing
else of the phone's Erevos changes.

Every other build has no Telegram code at all: the F-Droid build, desktop, the web app and
Sailfish. Their copy of `app/modules/erevos-telegram` is a stub that says Telegram is not here, so
those builds contain no TDLib, no NTgCalls and no Telegram API keys.

## What it has

- **Telegram through TDLib**, Telegram's own library, built from source by
  `scripts/build-tdlib.sh` at a pinned commit and used through its JSON interface
  (`android/src/full/.../Tdlib.kt`, read by `lib/telegram.ts`).
- **One Telegram account per space**, and one per hidden place.
  - TDLib's folder is `noBackupFilesDir/telegram/<slot>`. The slot is hex derived from the space's
    key, so the folder name does not say which space it belongs to.
  - TDLib encrypts its database with a key derived from the space's key. That key is never kept on
    the phone.
  - A space that never signs in starts no TDLib and leaves no folder (`lib/telegram-store.ts`).
- **ErevosGram encryption in Telegram chats** (`lib/telegram-seal.ts`), word for word the same as
  the ErevosGram app's.
  - The invitation is `EGI1:` and the encrypted messages are `EGM1:`, on the Erevos core's
    conversations (X3DH and Double Ratchet).
  - Erevos and the ErevosGram app talk to each other this way.
  - Telegram sees only the encrypted text.
- **Voice calls**:
  - TDLib does the calling and agrees on the key, shown as four emoji.
  - The sound goes through NTgCalls (`lib/telegram-calls.ts`, `android/src/full/.../Calls.kt`,
    `android/src/calls/.../Engine.java`).
- **Stickers that move** (`android/src/full/.../StickerView.kt`): a .tgs sticker is a gzipped
  Lottie animation, played by Lottie (`com.airbnb.android:lottie`, Apache-2.0, only in this build);
  a .webm one plays muted in a WebView with no JavaScript, as only Chromium draws its see-through parts.

## Two WebRTCs in one app

Erevos's own calls use react-native-webrtc (`org.jitsi:webrtc`). NTgCalls brings its own WebRTC.
Both have Java classes named `org.webrtc.*`, and NTgCalls' native library has those names compiled
in. They cannot share one class loader, so NTgCalls lives in a room of its own:

- At build time (`android/build.gradle`, tasks `tgcallsUnpack`, `tgcallsCompile` and `tgcallsDex`):
  1. The NTgCalls AAR from Maven Central is taken unchanged.
  2. `src/calls` is compiled against it.
  3. d8 turns both into `assets/tgcalls.jar`.
  
  Their classes never enter the app's dex. Their native libraries go into the APK with the app's.
- At run time:
  1. `Calls.kt` copies `tgcalls.jar` read-only into `codeCacheDir`.
  2. It loads the jar with a class loader that takes `org.webrtc.*`, `io.github.pytgcalls.*`,
     `org.jni_zero.*` and the engine from the jar first.
  3. `libntgcalls.so` is loaded from there, so its natives bind to those classes only.
  
  The engine speaks only plain types (`Context`, `BiConsumer`, `String`, `byte[]`), so nothing of
  either WebRTC crosses between the two.

## Building it

Only by hand, with the workflow **erevosgram** (Actions → erevosgram → Run workflow). Give it the
version, and a build number above the phone's.

- It needs the secrets `EREVOS_TG_API_ID` and `EREVOS_TG_API_HASH`: the Telegram API id and hash
  of ErevosGram, from my.telegram.org. They are never kept in the repository.
- It also needs the release key's secrets.
- TDLib is built once and kept in the cache by its commit.

On a computer:

```
scripts/build-tdlib.sh
cd app && EREVOS_TELEGRAM=1 npx expo prebuild --platform android --no-install
cd android && EREVOS_TELEGRAM=1 EREVOS_TG_API_ID=… EREVOS_TG_API_HASH=… ./gradlew assembleRelease
```

`EREVOS_TELEGRAM=1` marks the build as ErevosGram (`extra.edition`). Check for updates then takes
only the release's `erevosgram` APK (`version.json`), never the plain one, which would remove
Telegram. Until releases carry an ErevosGram APK, Check for updates only links to the release page.

## Telegram's terms

- ErevosGram has its own API id (2.1) and says it uses Telegram's API (2.2).
- Its name does not contain "Telegram" (2.3), and it uses no Telegram logo (2.4).
- Store texts name the donations (3.2).
- Sponsored messages in channels (3.3): still to come, as in the ErevosGram app (a switch in
  Settings). Needed before channels are shown.
