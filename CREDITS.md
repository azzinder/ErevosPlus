# Credits

Erevos is free software (AGPL-3.0-or-later, see [LICENSE](LICENSE)) and is built on open-source work by many other people and projects. This file names them, with their licences: first the parts Erevos could not do without, then the works that were copied in rather than installed, then every package.

## Main parts

Makers and licences are as the projects' own packages and files state them.

<!-- main:start -->
| Project | Maker | Licence | What Erevos uses it for |
| --- | --- | --- | --- |
| [Element Call](https://github.com/element-hq/element-call) (`@element-hq/element-call-embedded`) | Element (New Vector Ltd) | AGPL-3.0, or a commercial licence from Element. Its source files say `AGPL-3.0-only OR LicenseRef-Element-Commercial`; its package.json names no licence | Matrix calls, shown in a frame of their own |
| [LiveKit client](https://github.com/livekit/client-sdk-js), inside Element Call | LiveKit, Inc. | Apache-2.0 | The media connection of Matrix calls |
| [Matrix JS SDK](https://github.com/matrix-org/matrix-js-sdk), inside Element Call | The Matrix.org Foundation | Apache-2.0 | Matrix in Element Call |
| [Arti](https://gitlab.torproject.org/tpo/core/arti) (`arti-client`, the `tor-*` crates) | The Tor Project | MIT OR Apache-2.0 | The Tor connection inside the app |
| [lyrebird](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/lyrebird) | The Tor Project; written by Yawning Angel | BSD-2-Clause and BSD-3-Clause; two of its packages (meeklite, x25519ell2) are GPL-3.0-or-later | Tor bridges (obfs4, meek and the two below) on Android |
| [Snowflake](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake) | The Tor Project (Serene Han, Arlo Breault) | BSD-3-Clause | A Tor bridge that goes through WebRTC |
| [WebTunnel](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel) | The Tor Project | MIT | A Tor bridge that looks like a visit to a website |
| [Pion WebRTC](https://github.com/pion/webrtc) (`pion/webrtc`), inside Snowflake | The Pion community | MIT | WebRTC for Snowflake |
| [vodozemac](https://github.com/matrix-org/vodozemac) | The Matrix.org Foundation | Apache-2.0 | End-to-end encryption in Matrix chats (Olm and Megolm) |
| [OpenMLS](https://github.com/openmls/openmls) | The OpenMLS Authors | MIT | The encryption of group chats (MLS) |
| [RustCrypto](https://github.com/RustCrypto) crates (`chacha20poly1305`, `aes-gcm`, `sha2`, `hkdf`, `hmac`, `ml-kem`, `argon2`, `k256`, `p256` and others) | The RustCrypto Developers | MIT OR Apache-2.0 | The ciphers, hashes, key derivation and signatures of the core |
| [dalek-cryptography](https://github.com/dalek-cryptography) crates (`ed25519-dalek`, `x25519-dalek`, `curve25519-dalek`) | Isis Agora Lovecruft, Henry de Valence and contributors | BSD-3-Clause | Signatures and key agreement (Ed25519, X25519) |
| [rustls](https://github.com/rustls/rustls) | Joseph Birr-Pixton and the rustls contributors | Apache-2.0 OR ISC OR MIT | Secure (TLS) connections to relays and servers |
| [webpki-roots](https://github.com/rustls/webpki-roots) | The rustls project, from Mozilla's list of certificate authorities | CDLA-Permissive-2.0 | Which servers' certificates to trust |
| [Tokio](https://github.com/tokio-rs/tokio) | The Tokio Contributors | MIT | The asynchronous runtime of the Tor connection |
| [tungstenite](https://github.com/snapview/tungstenite-rs) and [tokio-tungstenite](https://github.com/snapview/tokio-tungstenite) | Alexey Galakhov, Daniel Abramov and contributors | tungstenite MIT OR Apache-2.0; tokio-tungstenite MIT | WebSocket connections to relays |
| [React Native](https://reactnative.dev) and React | Meta Platforms, Inc. and affiliates | MIT | The app itself: one codebase for phones, the web and the computer |
| [react-native-web](https://github.com/necolas/react-native-web) | Nicolas Gallagher and Meta | MIT | Runs the app in a browser and on the computer |
| [Expo](https://github.com/expo/expo) | 650 Industries, Inc. (Expo) | MIT | Builds the app, and gives it the phone's files, sounds, photos and secure storage |
| [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc) and the WebRTC library it carries | React Native WebRTC Community; WebRTC by Google, built for Android by Jitsi | MIT; WebRTC is BSD-3-Clause | Voice and video calls on phones |
| [react-native-quick-crypto](https://github.com/margelo/react-native-quick-crypto) | Margelo | MIT; it carries OpenSSL (Apache-2.0) on Android | Fast cryptography on phones |
| [@noble/ciphers](https://github.com/paulmillr/noble-ciphers) and [@noble/hashes](https://github.com/paulmillr/noble-hashes) | Paul Miller | MIT | Encryption and hashing in the app's JavaScript |
| [fflate](https://github.com/101arrowz/fflate) | Arjun Barrett | MIT | Reading the zip files of chat exports |
| [jsQR](https://github.com/cozmo/jsQR) | Cosmo Wolfe | Apache-2.0 | Reading a QR code from a picture in the web app |
| [ZXing](https://github.com/zxing/zxing) | The ZXing authors | Apache-2.0 | Reading a QR code from a photo on Android |
| [libphonenumber](https://github.com/google/libphonenumber) and its geocoder | Google LLC and the libphonenumber authors | Apache-2.0 | Saying where an unknown caller's number is from, and whether it is a mobile, offline on Android |
| [AndroidX Media3](https://github.com/androidx/media) (`media3-exoplayer`, `media3-session`, `media3-ui`) | The Android Open Source Project | Apache-2.0 | Playing the Collection's music and videos on Android, with the screen off and on the lock screen |
| [AndroidX CameraX](https://developer.android.com/jetpack/androidx/releases/camera) (`camera-core`, `camera-video`, `camera-extensions` and the rest) | The Android Open Source Project | Apache-2.0 | Erevos's own camera on Android, with the night, HDR and portrait the phone's maker offers through CameraX Extensions, where it has them |
| [hls.js](https://github.com/video-dev/hls.js) | The hls.js authors (video-dev) | Apache-2.0 | Playing HLS streams (TV channels, radio) in the desktop app and a browser, where the browser cannot by itself |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | Kazuhiko Arase | MIT | Drawing the QR codes of the donation page |
| [react-native-svg](https://github.com/react-native-community/react-native-svg) | Horcrux and the React Native community | MIT | Drawing the stickers |
| [Electron](https://github.com/electron/electron) | The Electron contributors (a project of the OpenJS Foundation) | MIT; it carries Chromium (BSD-3-Clause, The Chromium Authors) and Node.js (MIT) | The computer app |
| [Inter and Inter Tight](https://github.com/rsms/inter) | The Inter Project Authors (Rasmus Andersson) | SIL OFL 1.1 | The fonts of the Modernist and Nocturne looks |
<!-- main:end -->

## Other works

Copied into Erevos or used by it, but not installed as packages.

<!-- other:start -->
- **Fonts: Inter and Inter Tight.** Copyright The Inter Project Authors ([Inter](https://github.com/rsms/inter) and [Inter Tight](https://github.com/rsms/inter-tight), by Rasmus Andersson), under the SIL Open Font License 1.1. The app carries the font files that Expo packages as `@expo-google-fonts/inter` and `@expo-google-fonts/inter-tight` (MIT for the packaging, OFL for the fonts; the licence text is in each package as `LICENSE_FONT`) and loads them in `app/theme/fonts.ts`.
- **Stickers: Tux.** Tux, the Linux penguin, was drawn by Larry Ewing with The GIMP, who allows the image to be used and modified provided that he and The GIMP are acknowledged. Erevos's Tux stickers (`app/lib/sticker-tux.ts`) are cut from the vector drawing in the [logos collection](https://github.com/gilbarbara/logos) by Gil Barbara and its contributors, which the comment at the top of that file records as CC0 1.0. Nothing is downloaded: each phone draws the stickers itself.
- **Matrix emoji for checking a chat.** The 64 pictures and their names (`app/lib/sas-emoji.ts`) are the table in the [Matrix specification](https://github.com/matrix-org/matrix-spec) (`data-definitions/sas-emoji.json`, Apache-2.0, by The Matrix.org Foundation); the Greek names are added here.
- **Installed on a relay, not shipped.** `deploy/relay/install.sh` installs [coturn](https://github.com/coturn/coturn) (the TURN server for calls, BSD-3-Clause, by the Coturn project) and [Caddy](https://github.com/caddyserver/caddy) (TLS certificates and the web front, Apache-2.0, by the Caddy authors) from the server's own package sources.
- **Test data.** The NIP-44 test vectors (`crates/erevos-nostr/tests/nip44.vectors.json`, from [paulmillr/nip44](https://github.com/paulmillr/nip44), MIT, by Paul Miller) and the example messages of NIP-17 (`nip17-*.json`, from the [Nostr NIPs](https://github.com/nostr-protocol/nips)). Only the tests use them; they are not part of the app.
- **Models downloaded when asked for.** Not in the app: each is downloaded from Erevos's own server only when its owner asks, and checked against its SHA-256 (`crates/erevos-speech`). The speech model is OpenAI's [Whisper small](https://github.com/openai/whisper) (MIT, by OpenAI), its weights made 8-bit by `examples/make_model.rs`. The translation models are [OPUS-MT](https://github.com/Helsinki-NLP/Opus-MT) by Jörg Tiedemann and the Language Technology Research Group at the University of Helsinki (CC-BY 4.0): `opus-mt-grk-en`, `opus-mt-en-el`, `opus-mt-de-en`, `opus-mt-en-de`, `opus-mt-es-en`, `opus-mt-en-es`, `opus-mt-fr-en`, `opus-mt-en-fr`, `opus-mt-it-en` and `opus-mt-en-it`, as Hugging Face keeps them, their weights made 8-bit by `examples/make_translation.rs`, otherwise unchanged; trained on the [OPUS](https://opus.nlpl.eu) corpora.
<!-- other:end -->

## Every package

Every package the lockfiles hold, by part of Erevos, with its version, its licence as the package states it and a link to its source when it has one. This part is written by `node scripts/credits.mjs`: do not edit it by hand.

<!-- generated:start -->

### The app's JavaScript packages

Everything in `app/package-lock.json` that is not only for development: the packages the app is made of, and the tools Expo builds it with. 609 packages.

| Package | Version | Licence |
| --- | --- | --- |
| [2g](https://github.com/kitten/2g) | 1.0.1 | MIT |
| [@babel/code-frame](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/compat-data](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/core](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/generator](https://github.com/babel/babel) | 7.29.14 | MIT |
| [@babel/helper-annotate-as-pure](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-compilation-targets](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-create-class-features-plugin](https://github.com/babel/babel) | 7.29.13 | MIT |
| [@babel/helper-create-regexp-features-plugin](https://github.com/babel/babel) | 7.29.10 | MIT |
| [@babel/helper-define-polyfill-provider](https://github.com/babel/babel-polyfills) | 0.6.8 | MIT |
| [@babel/helper-globals](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-member-expression-to-functions](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-module-imports](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-module-transforms](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-optimise-call-expression](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-plugin-utils](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-remap-async-to-generator](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-replace-supers](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-skip-transparent-expression-wrappers](https://github.com/babel/babel) | 7.29.13 | MIT |
| [@babel/helper-string-parser](https://github.com/babel/babel) | 7.29.14 | MIT |
| [@babel/helper-validator-identifier](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-validator-option](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helper-wrap-function](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/helpers](https://github.com/babel/babel) | 7.29.10 | MIT |
| [@babel/parser](https://github.com/babel/babel) | 7.29.14 | MIT |
| [@babel/plugin-proposal-decorators](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-proposal-export-default-from](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-syntax-decorators](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-syntax-dynamic-import](https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-dynamic-import) | 7.8.3 | MIT |
| [@babel/plugin-syntax-export-default-from](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-syntax-flow](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-syntax-jsx](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-syntax-nullish-coalescing-operator](https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-nullish-coalescing-operator) | 7.8.3 | MIT |
| [@babel/plugin-syntax-optional-chaining](https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-optional-chaining) | 7.8.3 | MIT |
| [@babel/plugin-syntax-typescript](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-arrow-functions](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-async-generator-functions](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-async-to-generator](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-block-scoping](https://github.com/babel/babel) | 7.29.12 | MIT |
| [@babel/plugin-transform-class-properties](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-class-static-block](https://github.com/babel/babel) | 7.29.14 | MIT |
| [@babel/plugin-transform-classes](https://github.com/babel/babel) | 7.29.11 | MIT |
| [@babel/plugin-transform-destructuring](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-export-namespace-from](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-flow-strip-types](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-for-of](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-logical-assignment-operators](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-modules-commonjs](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-named-capturing-groups-regex](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-nullish-coalescing-operator](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-object-rest-spread](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-optional-catch-binding](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-optional-chaining](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-parameters](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-private-methods](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-private-property-in-object](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-react-display-name](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-react-jsx](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-react-jsx-development](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-react-jsx-self](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-react-jsx-source](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-react-pure-annotations](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-regenerator](https://github.com/babel/babel) | 7.29.8 | MIT |
| [@babel/plugin-transform-runtime](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-shorthand-properties](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-template-literals](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/plugin-transform-typescript](https://github.com/babel/babel) | 7.29.9 | MIT |
| [@babel/plugin-transform-unicode-regex](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/preset-typescript](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/runtime](https://github.com/babel/babel) | 7.29.10 | MIT |
| [@babel/template](https://github.com/babel/babel) | 7.29.7 | MIT |
| [@babel/traverse](https://github.com/babel/babel) | 7.29.14 | MIT |
| [@babel/types](https://github.com/babel/babel) | 7.29.14 | MIT |
| [@craftzdog/react-native-buffer](https://github.com/craftzdog/react-native-buffer) | 6.1.2 | MIT |
| [@element-hq/element-call-embedded](https://github.com/element-hq/element-call) | 0.28.2 | AGPL-3.0-only OR LicenseRef-Element-Commercial |
| [@expo-google-fonts/inter](https://github.com/expo/google-fonts) | 0.4.2 | MIT AND OFL-1.1 |
| [@expo-google-fonts/inter-tight](https://github.com/expo/google-fonts) | 0.4.2 | MIT AND OFL-1.1 |
| [@expo/cli](https://github.com/expo/expo) | 58.1.21 | MIT |
| [@expo/code-signing-certificates](https://github.com/expo/code-signing-certificates) | 0.0.7 | MIT |
| [@expo/config](https://github.com/expo/expo) | 58.0.12 | MIT |
| [@expo/config-plugins](https://github.com/expo/expo) | 58.0.13 | MIT |
| [@expo/config-types](https://github.com/expo/expo) | 58.0.3 | MIT |
| [@expo/devcert](https://github.com/expo/devcert) | 1.2.2 | MIT |
| [@expo/devtools](https://github.com/expo/expo) | 58.0.2 | MIT |
| [@expo/dom-webview](https://github.com/expo/expo) | 58.0.2 | MIT |
| [@expo/env](https://github.com/expo/expo) | 2.6.0 | MIT |
| [@expo/fingerprint](https://github.com/expo/expo) | 0.21.10 | MIT |
| [@expo/image-utils](https://github.com/expo/expo) | 0.12.7 | MIT |
| [@expo/inline-modules](https://github.com/expo/expo) | 0.2.10 | MIT |
| [@expo/json-file](https://github.com/expo/expo) | 11.2.1 | MIT |
| [@expo/local-build-cache-provider](https://github.com/expo/expo) | 58.0.12 | MIT |
| [@expo/log-box](https://github.com/expo/expo) | 58.0.15 | MIT |
| [@expo/log-box-utils](https://github.com/expo/expo) | 58.0.2 | MIT |
| [@expo/metro](https://github.com/expo/expo-metro) | 58.0.0 | MIT |
| [@expo/metro-config](https://github.com/expo/expo) | 58.0.23 | MIT |
| [@expo/metro-file-map](https://github.com/expo/expo) | 58.0.6 | MIT |
| [@expo/metro-runtime](https://github.com/expo/expo) | 58.0.17 | MIT |
| @expo/modules-macros-linux-arm64 | 0.33.0 | MIT |
| [@expo/modules-macros-linux-x64](https://github.com/expo/expo-modules-macros) | 0.33.0 | MIT |
| @expo/modules-macros-win32-arm64 | 0.33.0 | MIT |
| @expo/modules-macros-win32-x64 | 0.33.0 | MIT |
| [@expo/osascript](https://github.com/expo/expo) | 2.8.1 | MIT |
| [@expo/package-manager](https://github.com/expo/expo) | 1.14.2 | MIT |
| [@expo/platforms](https://github.com/expo/expo) | 58.0.1 | MIT |
| [@expo/plist](https://github.com/expo/expo) | 0.10.2 | MIT |
| [@expo/prebuild-config](https://github.com/expo/expo) | 58.0.20 | MIT |
| [@expo/require-utils](https://github.com/expo/expo) | 58.0.6 | MIT |
| [@expo/router-server](https://github.com/expo/expo) | 58.0.23 | MIT |
| [@expo/schema-utils](https://github.com/expo/expo) | 58.0.3 | MIT |
| @expo/sdk-runtime-versions | 1.0.1 | MIT |
| [@expo/spawn-async](https://github.com/expo/spawn-async) | 1.8.0 | MIT |
| [@expo/sudo-prompt](https://github.com/expo/sudo-prompt) | 9.3.2 | MIT |
| @expo/ws-tunnel | 2.0.1 | MIT |
| [@expo/xcpretty](https://github.com/expo/expo) | 4.4.7 | MIT |
| [@isaacs/ttlcache](https://github.com/isaacs/ttlcache) | 1.4.1 | ISC |
| [@jest/schemas](https://github.com/jestjs/jest) | 29.6.3 | MIT |
| [@jest/types](https://github.com/jestjs/jest) | 29.6.3 | MIT |
| [@jridgewell/gen-mapping](https://github.com/jridgewell/sourcemaps) | 0.3.13 | MIT |
| [@jridgewell/remapping](https://github.com/jridgewell/sourcemaps) | 2.3.5 | MIT |
| [@jridgewell/resolve-uri](https://github.com/jridgewell/resolve-uri) | 3.1.2 | MIT |
| [@jridgewell/source-map](https://github.com/jridgewell/sourcemaps) | 0.3.11 | MIT |
| [@jridgewell/sourcemap-codec](https://github.com/jridgewell/sourcemaps) | 1.6.0 | MIT |
| [@jridgewell/trace-mapping](https://github.com/jridgewell/sourcemaps) | 0.3.31 | MIT |
| [@noble/ciphers](https://github.com/paulmillr/noble-ciphers) | 2.4.0 | MIT |
| [@noble/hashes](https://github.com/paulmillr/noble-hashes) | 2.4.0 | MIT |
| @noxcturnal/noxcturnal-darwin-arm64 | 0.1.14 | MIT |
| @noxcturnal/noxcturnal-darwin-x64 | 0.1.14 | MIT |
| @noxcturnal/noxcturnal-linux-arm64-gnu | 0.1.14 | MIT |
| @noxcturnal/noxcturnal-linux-arm64-musl | 0.1.14 | MIT |
| [@noxcturnal/noxcturnal-linux-x64-gnu](https://github.com/expo/noxcturnal) | 0.1.14 | MIT |
| [@noxcturnal/noxcturnal-linux-x64-musl](https://github.com/expo/noxcturnal) | 0.1.14 | MIT |
| @noxcturnal/noxcturnal-win32-arm64-msvc | 0.1.14 | MIT |
| @noxcturnal/noxcturnal-win32-x64-msvc | 0.1.14 | MIT |
| [@oxc-project/types](https://github.com/oxc-project/oxc) | 0.154.0 | MIT |
| [@radix-ui/primitive](https://github.com/radix-ui/primitives) | 1.2.0 | MIT |
| [@radix-ui/react-collection](https://github.com/radix-ui/primitives) | 1.2.0 | MIT |
| [@radix-ui/react-compose-refs](https://github.com/radix-ui/primitives) | 1.1.5 | MIT |
| [@radix-ui/react-context](https://github.com/radix-ui/primitives) | 1.3.0 | MIT |
| [@radix-ui/react-direction](https://github.com/radix-ui/primitives) | 1.2.0 | MIT |
| [@radix-ui/react-id](https://github.com/radix-ui/primitives) | 1.1.4 | MIT |
| [@radix-ui/react-presence](https://github.com/radix-ui/primitives) | 1.1.11 | MIT |
| [@radix-ui/react-primitive](https://github.com/radix-ui/primitives) | 2.2.0 | MIT |
| [@radix-ui/react-roving-focus](https://github.com/radix-ui/primitives) | 1.2.1 | MIT |
| [@radix-ui/react-slot](https://github.com/radix-ui/primitives) | 1.5.0 | MIT |
| [@radix-ui/react-tabs](https://github.com/radix-ui/primitives) | 1.2.1 | MIT |
| [@radix-ui/react-use-callback-ref](https://github.com/radix-ui/primitives) | 1.1.5 | MIT |
| [@radix-ui/react-use-controllable-state](https://github.com/radix-ui/primitives) | 1.3.0 | MIT |
| [@radix-ui/react-use-effect-event](https://github.com/radix-ui/primitives) | 0.0.5 | MIT |
| [@radix-ui/react-use-is-hydrated](https://github.com/radix-ui/primitives) | 0.1.3 | MIT |
| [@radix-ui/react-use-layout-effect](https://github.com/radix-ui/primitives) | 1.1.4 | MIT |
| [@react-native-masked-view/masked-view](https://github.com/react-native-masked-view/masked-view) | 0.3.2 | MIT |
| [@react-native/asset-utils](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/babel-plugin-codegen](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/babel-preset](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/codegen](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/community-cli-plugin](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/debugger-frontend](https://github.com/react/react-native) | 0.88.1 | BSD-3-Clause |
| [@react-native/debugger-shell](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/dev-middleware](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/gradle-plugin](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/js-polyfills](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/metro-babel-transformer](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/metro-config](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/normalize-colors](https://github.com/facebook/react-native) | 0.74.89 | MIT |
| [@react-native/normalize-colors](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@react-native/virtualized-lists](https://github.com/react/react-native) | 0.88.1 | MIT |
| [@sinclair/typebox](https://github.com/sinclairzx81/sinclair-typebox) | 0.27.12 | MIT |
| [@types/istanbul-lib-coverage](https://github.com/DefinitelyTyped/DefinitelyTyped) | 2.0.6 | MIT |
| [@types/istanbul-lib-report](https://github.com/DefinitelyTyped/DefinitelyTyped) | 3.0.3 | MIT |
| [@types/istanbul-reports](https://github.com/DefinitelyTyped/DefinitelyTyped) | 3.0.4 | MIT |
| [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped) | 26.6.6 | MIT |
| [@types/react](https://github.com/DefinitelyTyped/DefinitelyTyped) | 19.3.0 | MIT |
| [@types/react-test-renderer](https://github.com/DefinitelyTyped/DefinitelyTyped) | 19.3.1 | MIT |
| [@types/yargs](https://github.com/DefinitelyTyped/DefinitelyTyped) | 17.0.35 | MIT |
| [@types/yargs-parser](https://github.com/DefinitelyTyped/DefinitelyTyped) | 21.0.3 | MIT |
| [@ungap/structured-clone](https://github.com/ungap/structured-clone) | 1.4.0 | ISC |
| [@xmldom/xmldom](https://github.com/xmldom/xmldom) | 0.8.15 | MIT |
| [@xmldom/xmldom](https://github.com/xmldom/xmldom) | 0.9.12 | MIT |
| [abort-controller](https://github.com/mysticatea/abort-controller) | 3.0.0 | MIT |
| [accepts](https://github.com/jshttp/accepts) | 1.3.8 | MIT |
| [accepts](https://github.com/jshttp/accepts) | 2.0.0 | MIT |
| [acorn](https://github.com/acornjs/acorn) | 8.19.0 | MIT |
| [agent-base](https://github.com/TooTallNate/proxy-agents) | 7.1.4 | MIT |
| [agent-cli-detector](https://github.com/expo/agent-cli-detector) | 0.1.7 | MIT |
| [anser](https://github.com/IonicaBizau/anser) | 1.4.10 | MIT |
| [ansi-escapes](https://github.com/sindresorhus/ansi-escapes) | 4.3.2 | MIT |
| [ansi-regex](https://github.com/chalk/ansi-regex) | 4.1.1 | MIT |
| [ansi-regex](https://github.com/chalk/ansi-regex) | 5.0.1 | MIT |
| [ansi-styles](https://github.com/chalk/ansi-styles) | 3.2.1 | MIT |
| [ansi-styles](https://github.com/chalk/ansi-styles) | 4.3.0 | MIT |
| [ansi-styles](https://github.com/chalk/ansi-styles) | 5.2.0 | MIT |
| [arg](https://github.com/vercel/arg) | 5.0.2 | MIT |
| [argparse](https://github.com/nodeca/argparse) | 2.0.1 | Python-2.0 |
| [asap](https://github.com/kriskowal/asap) | 2.0.6 | MIT |
| [available-typed-arrays](https://github.com/inspect-js/available-typed-arrays) | 1.0.7 | MIT |
| [babel-plugin-polyfill-corejs2](https://github.com/babel/babel-polyfills) | 0.4.17 | MIT |
| [babel-plugin-polyfill-corejs3](https://github.com/babel/babel-polyfills) | 0.13.0 | MIT |
| [babel-plugin-polyfill-regenerator](https://github.com/babel/babel-polyfills) | 0.6.8 | MIT |
| [babel-plugin-react-compiler](https://github.com/facebook/react) | 1.0.0 | MIT |
| [babel-plugin-react-native-web](https://github.com/necolas/react-native-web) | 0.21.4 | MIT |
| [babel-plugin-syntax-hermes-parser](https://github.com/facebook/hermes) | 0.36.1 | MIT |
| [babel-plugin-transform-flow-enums](https://github.com/facebook/flow) | 0.0.2 | MIT |
| [babel-preset-expo](https://github.com/expo/expo) | 58.0.26 | MIT |
| [balanced-match](https://github.com/juliangruber/balanced-match) | 4.0.4 | MIT |
| [base64-js](https://github.com/beatgammit/base64-js) | 1.5.1 | MIT |
| [baseline-browser-mapping](https://github.com/web-platform-dx/baseline-browser-mapping) | 2.11.34 | Apache-2.0 |
| [big-integer](https://github.com/peterolson/BigInteger.js) | 1.6.52 | Unlicense |
| [boolbase](https://github.com/fb55/boolbase) | 1.0.0 | ISC |
| [bplist-creator](https://github.com/nearinfinity/node-bplist-creator) | 0.1.0 | MIT |
| [bplist-parser](https://github.com/nearinfinity/node-bplist-parser) | 0.3.1 | MIT |
| [bplist-parser](https://github.com/nearinfinity/node-bplist-parser) | 0.3.2 | MIT |
| [brace-expansion](https://github.com/juliangruber/brace-expansion) | 5.0.12 | MIT |
| [braces](https://github.com/micromatch/braces) | 3.0.3 | MIT |
| [browserslist](https://github.com/browserslist/browserslist) | 4.29.5 | MIT |
| [bser](https://github.com/facebook/watchman) | 2.1.2 | MIT |
| [buffer](https://github.com/feross/buffer) | 6.0.3 | MIT |
| [buffer-from](https://github.com/LinusU/buffer-from) | 1.1.2 | MIT |
| [bytes](https://github.com/visionmedia/bytes.js) | 3.1.2 | MIT |
| [call-bind](https://github.com/ljharb/call-bind) | 1.0.9 | MIT |
| [call-bind-apply-helpers](https://github.com/ljharb/call-bind-apply-helpers) | 1.0.2 | MIT |
| [call-bound](https://github.com/ljharb/call-bound) | 1.0.4 | MIT |
| [camelcase](https://github.com/sindresorhus/camelcase) | 6.3.0 | MIT |
| [caniuse-lite](https://github.com/browserslist/caniuse-lite) | 1.0.30001820 | CC-BY-4.0 |
| [chalk](https://github.com/chalk/chalk) | 2.4.2 | MIT |
| [chalk](https://github.com/chalk/chalk) | 4.1.2 | MIT |
| [ci-info](https://github.com/watson/ci-info) | 3.9.0 | MIT |
| [cli-cursor](https://github.com/sindresorhus/cli-cursor) | 2.1.0 | MIT |
| [cli-spinners](https://github.com/sindresorhus/cli-spinners) | 2.9.2 | MIT |
| [client-only](https://reactjs.org) | 0.0.1 | MIT |
| [cliui](https://github.com/yargs/cliui) | 8.0.1 | ISC |
| [clone](https://github.com/pvorb/node-clone) | 1.0.4 | MIT |
| [color-convert](https://github.com/Qix-/color-convert) | 1.9.3 | MIT |
| [color-convert](https://github.com/Qix-/color-convert) | 2.0.1 | MIT |
| [color-name](https://github.com/dfcreative/color-name) | 1.1.3 | MIT |
| [color-name](https://github.com/colorjs/color-name) | 1.1.4 | MIT |
| [commander](https://github.com/tj/commander.js) | 2.20.3 | MIT |
| [commander](https://github.com/tj/commander.js) | 7.2.0 | MIT |
| [commander](https://github.com/tj/commander.js) | 12.1.0 | MIT |
| [compressible](https://github.com/jshttp/compressible) | 2.0.18 | MIT |
| [compression](https://github.com/expressjs/compression) | 1.8.2 | MIT |
| [connect](https://github.com/senchalabs/connect) | 3.7.0 | MIT |
| [content-type](https://github.com/jshttp/content-type) | 2.1.0 | MIT |
| [convert-source-map](https://github.com/thlorenz/convert-source-map) | 2.0.0 | MIT |
| [core-js-compat](https://github.com/zloirock/core-js) | 3.51.0 | MIT |
| [cross-fetch](https://github.com/lquixada/cross-fetch) | 3.2.0 | MIT |
| [cross-spawn](https://github.com/moxystudio/node-cross-spawn) | 7.0.6 | MIT |
| [css-in-js-utils](https://github.com/robinweser/css-in-js-utils) | 3.1.0 | MIT |
| [css-select](https://github.com/fb55/css-select) | 5.2.2 | BSD-2-Clause |
| [css-tree](https://github.com/csstree/csstree) | 1.1.3 | MIT |
| [css-what](https://github.com/fb55/css-what) | 6.2.2 | BSD-2-Clause |
| [csstype](https://github.com/frenic/csstype) | 3.2.3 | MIT |
| [debug](https://github.com/visionmedia/debug) | 2.6.9 | MIT |
| [debug](https://github.com/visionmedia/debug) | 3.2.7 | MIT |
| [debug](https://github.com/debug-js/debug) | 4.3.4 | MIT |
| [debug](https://github.com/debug-js/debug) | 4.4.3 | MIT |
| [defaults](https://github.com/sindresorhus/node-defaults) | 1.0.4 | MIT |
| [define-data-property](https://github.com/ljharb/define-data-property) | 1.1.4 | MIT |
| [define-lazy-prop](https://github.com/sindresorhus/define-lazy-prop) | 2.0.0 | MIT |
| [depd](https://github.com/dougwilson/nodejs-depd) | 2.0.0 | MIT |
| [destroy](https://github.com/stream-utils/destroy) | 1.2.0 | MIT |
| [detect-libc](https://github.com/lovell/detect-libc) | 2.1.2 | Apache-2.0 |
| [dnssd-advertise](https://github.com/kitten/dnssd-advertise) | 1.1.6 | MIT |
| [dom-serializer](https://github.com/cheeriojs/dom-serializer) | 2.0.0 | MIT |
| [domelementtype](https://github.com/fb55/domelementtype) | 2.3.0 | BSD-2-Clause |
| [domhandler](https://github.com/fb55/domhandler) | 5.0.3 | BSD-2-Clause |
| [domutils](https://github.com/fb55/domutils) | 3.2.2 | BSD-2-Clause |
| [dunder-proto](https://github.com/es-shims/dunder-proto) | 1.0.1 | MIT |
| [ee-first](https://github.com/jonathanong/ee-first) | 1.1.1 | MIT |
| [electron-to-chromium](https://github.com/Kilian/electron-to-chromium) | 1.5.467 | ISC |
| [emoji-regex](https://github.com/mathiasbynens/emoji-regex) | 8.0.0 | MIT |
| [encodeurl](https://github.com/pillarjs/encodeurl) | 1.0.2 | MIT |
| [encodeurl](https://github.com/pillarjs/encodeurl) | 2.0.1 | MIT |
| [entities](https://github.com/fb55/entities) | 4.5.0 | BSD-2-Clause |
| [error-stack-parser](https://github.com/stacktracejs/error-stack-parser) | 2.1.4 | MIT |
| [es-define-property](https://github.com/ljharb/es-define-property) | 1.0.1 | MIT |
| [es-errors](https://github.com/ljharb/es-errors) | 1.3.0 | MIT |
| [es-object-atoms](https://github.com/ljharb/es-object-atoms) | 1.1.2 | MIT |
| [escalade](https://github.com/lukeed/escalade) | 3.2.0 | MIT |
| [escape-html](https://github.com/component/escape-html) | 1.0.3 | MIT |
| [escape-string-regexp](https://github.com/sindresorhus/escape-string-regexp) | 1.0.5 | MIT |
| [etag](https://github.com/jshttp/etag) | 1.8.1 | MIT |
| [event-target-shim](https://github.com/mysticatea/event-target-shim) | 5.0.1 | MIT |
| [events](https://github.com/Gozala/events) | 3.3.0 | MIT |
| [expo](https://github.com/expo/expo) | 58.0.26 | MIT |
| [expo-asset](https://github.com/expo/expo) | 58.0.21 | MIT |
| [expo-audio](https://github.com/expo/expo) | 58.0.12 | MIT |
| [expo-constants](https://github.com/expo/expo) | 58.0.16 | MIT |
| [expo-crypto](https://github.com/expo/expo) | 58.0.8 | MIT |
| [expo-file-system](https://github.com/expo/expo) | 58.0.14 | MIT |
| [expo-font](https://github.com/expo/expo) | 58.0.12 | MIT |
| [expo-glass-effect](https://github.com/expo/expo) | 58.0.5 | MIT |
| [expo-image-loader](https://github.com/expo/expo) | 58.0.3 | MIT |
| [expo-image-manipulator](https://github.com/expo/expo) | 58.0.16 | MIT |
| [expo-image-picker](https://github.com/expo/expo) | 58.0.10 | MIT |
| [expo-intent-launcher](https://github.com/expo/expo) | 58.0.3 | MIT |
| [expo-keep-awake](https://github.com/expo/expo) | 58.0.4 | MIT |
| [expo-linking](https://github.com/expo/expo) | 58.0.17 | MIT |
| [expo-modules-autolinking](https://github.com/expo/expo) | 58.1.0 | MIT |
| [expo-modules-cli](https://github.com/expo/expo) | 0.5.0 | MIT |
| [expo-modules-core](https://github.com/expo/expo) | 58.1.0 | MIT |
| [expo-modules-jsi](https://github.com/expo/expo) | 58.0.23 | MIT |
| [expo-modules-macros](https://github.com/expo/expo-modules-macros) | 0.33.0 | MIT |
| [expo-router](https://github.com/expo/expo) | 58.0.32 | MIT |
| [expo-secure-store](https://github.com/expo/expo) | 58.0.3 | MIT |
| [expo-server](https://github.com/expo/expo) | 58.1.0 | MIT |
| [expo-status-bar](https://github.com/expo/expo) | 58.0.5 | MIT |
| [exponential-backoff](https://github.com/coveooss/exponential-backoff) | 3.1.3 | Apache-2.0 |
| [fb-dotslash](https://github.com/facebook/dotslash) | 0.5.8 | (MIT OR Apache-2.0) |
| [fb-watchman](https://github.com/facebook/watchman) | 2.0.4 | MIT |
| [fbjs](https://github.com/facebook/fbjs) | 3.0.5 | MIT |
| [fbjs-css-vars](https://github.com/facebook/fbjs) | 1.0.2 | MIT |
| [fdir](https://github.com/thecodrr/fdir) | 6.5.0 | MIT |
| [fetch-nodeshim](https://github.com/kitten/fetch-nodeshim) | 0.4.10 | MIT |
| [fflate](https://github.com/101arrowz/fflate) | 0.8.3 | MIT |
| [fill-range](https://github.com/jonschlinkert/fill-range) | 7.1.1 | MIT |
| [finalhandler](https://github.com/pillarjs/finalhandler) | 1.1.2 | MIT |
| [flow-enums-runtime](https://github.com/facebook/flow) | 0.0.6 | MIT |
| [flow-estree](https://github.com/facebook/flow) | 0.327.0 | MIT |
| [flow-estree](https://github.com/facebook/flow) | 0.331.0 | MIT |
| [flow-estree](https://github.com/facebook/flow) | 0.336.0 | MIT |
| [flow-parser](https://github.com/facebook/flow) | 0.327.0 | MIT |
| [flow-parser](https://github.com/facebook/flow) | 0.331.0 | MIT |
| [flow-parser](https://github.com/facebook/flow) | 0.336.0 | MIT |
| [for-each](https://github.com/Raynos/for-each) | 0.3.5 | MIT |
| [fresh](https://github.com/jshttp/fresh) | 0.5.2 | MIT |
| [function-bind](https://github.com/Raynos/function-bind) | 1.1.2 | MIT |
| [generator-function](https://github.com/TimothyGu/generator-function) | 2.0.1 | MIT |
| [gensync](https://github.com/loganfsmyth/gensync) | 1.0.0-beta.2 | MIT |
| [get-caller-file](https://github.com/stefanpenner/get-caller-file) | 2.0.5 | ISC |
| [get-intrinsic](https://github.com/ljharb/get-intrinsic) | 1.3.0 | MIT |
| [get-proto](https://github.com/ljharb/get-proto) | 1.0.1 | MIT |
| [gopd](https://github.com/ljharb/gopd) | 1.2.0 | MIT |
| [graceful-fs](https://github.com/isaacs/node-graceful-fs) | 4.2.11 | ISC |
| [has-flag](https://github.com/sindresorhus/has-flag) | 3.0.0 | MIT |
| [has-flag](https://github.com/sindresorhus/has-flag) | 4.0.0 | MIT |
| [has-property-descriptors](https://github.com/inspect-js/has-property-descriptors) | 1.0.2 | MIT |
| [has-symbols](https://github.com/inspect-js/has-symbols) | 1.1.0 | MIT |
| [has-tostringtag](https://github.com/inspect-js/has-tostringtag) | 1.0.2 | MIT |
| [hasown](https://github.com/inspect-js/hasOwn) | 2.0.4 | MIT |
| [hermes-compiler](https://github.com/facebook/hermes) | 260318099.0.5 | MIT |
| [hermes-estree](https://github.com/facebook/hermes) | 0.36.1 | MIT |
| [hermes-parser](https://github.com/facebook/hermes) | 0.36.1 | MIT |
| [hls.js](https://github.com/video-dev/hls.js) | 1.7.4 | Apache-2.0 |
| [hosted-git-info](https://github.com/npm/hosted-git-info) | 7.0.2 | ISC |
| [http-errors](https://github.com/jshttp/http-errors) | 2.0.1 | MIT |
| [https-proxy-agent](https://github.com/TooTallNate/proxy-agents) | 7.0.6 | MIT |
| [hyphenate-style-name](https://github.com/rexxars/hyphenate-style-name) | 1.1.0 | BSD-3-Clause |
| [ieee754](https://github.com/feross/ieee754) | 1.2.1 | BSD-3-Clause |
| [ignore](https://github.com/kaelzhang/node-ignore) | 5.3.2 | MIT |
| [inherits](https://github.com/isaacs/inherits) | 2.0.4 | ISC |
| [inline-style-prefixer](https://github.com/robinweser/inline-style-prefixer) | 7.0.1 | MIT |
| [invariant](https://github.com/zertosh/invariant) | 2.2.4 | MIT |
| [is-arguments](https://github.com/inspect-js/is-arguments) | 1.2.0 | MIT |
| [is-callable](https://github.com/inspect-js/is-callable) | 1.2.7 | MIT |
| [is-core-module](https://github.com/inspect-js/is-core-module) | 2.17.0 | MIT |
| [is-docker](https://github.com/sindresorhus/is-docker) | 2.2.1 | MIT |
| [is-fullwidth-code-point](https://github.com/sindresorhus/is-fullwidth-code-point) | 3.0.0 | MIT |
| [is-generator-function](https://github.com/inspect-js/is-generator-function) | 1.1.2 | MIT |
| [is-number](https://github.com/jonschlinkert/is-number) | 7.0.0 | MIT |
| [is-regex](https://github.com/inspect-js/is-regex) | 1.2.1 | MIT |
| [is-typed-array](https://github.com/inspect-js/is-typed-array) | 1.1.15 | MIT |
| [is-wsl](https://github.com/sindresorhus/is-wsl) | 2.2.0 | MIT |
| [isexe](https://github.com/isaacs/isexe) | 2.0.0 | ISC |
| [jest-get-type](https://github.com/jestjs/jest) | 29.6.3 | MIT |
| [jest-util](https://github.com/jestjs/jest) | 29.7.0 | MIT |
| [jest-validate](https://github.com/jestjs/jest) | 29.7.0 | MIT |
| [jest-worker](https://github.com/jestjs/jest) | 29.7.0 | MIT |
| [jimp-compact](https://github.com/nuxt-community/jimp-compact) | 0.16.1 | MIT |
| [js-tokens](https://github.com/lydell/js-tokens) | 4.0.0 | MIT |
| [js-yaml](https://github.com/nodeca/js-yaml) | 4.3.2 | MIT |
| [jsc-safe-url](https://github.com/robhogan/jsc-safe-url) | 0.2.4 | 0BSD |
| [jsesc](https://github.com/mathiasbynens/jsesc) | 3.1.0 | MIT |
| [json5](https://github.com/json5/json5) | 2.2.3 | MIT |
| [jsqr](https://github.com/cozmo/jsQR) | 1.4.0 | Apache-2.0 |
| [kleur](https://github.com/lukeed/kleur) | 3.0.3 | MIT |
| [lan-network](https://github.com/kitten/lan-network) | 0.2.1 | MIT |
| [leven](https://github.com/sindresorhus/leven) | 3.1.0 | MIT |
| [lightningcss](https://github.com/parcel-bundler/lightningcss) | 1.33.0 | MPL-2.0 |
| lightningcss-android-arm64 | 1.33.0 | MPL-2.0 |
| lightningcss-darwin-arm64 | 1.33.0 | MPL-2.0 |
| lightningcss-darwin-x64 | 1.33.0 | MPL-2.0 |
| lightningcss-freebsd-x64 | 1.33.0 | MPL-2.0 |
| lightningcss-linux-arm-gnueabihf | 1.33.0 | MPL-2.0 |
| lightningcss-linux-arm64-gnu | 1.33.0 | MPL-2.0 |
| lightningcss-linux-arm64-musl | 1.33.0 | MPL-2.0 |
| [lightningcss-linux-x64-gnu](https://github.com/parcel-bundler/lightningcss) | 1.33.0 | MPL-2.0 |
| [lightningcss-linux-x64-musl](https://github.com/parcel-bundler/lightningcss) | 1.33.0 | MPL-2.0 |
| lightningcss-win32-arm64-msvc | 1.33.0 | MPL-2.0 |
| lightningcss-win32-x64-msvc | 1.33.0 | MPL-2.0 |
| [lodash.debounce](https://github.com/lodash/lodash) | 4.0.8 | MIT |
| [lodash.throttle](https://github.com/lodash/lodash) | 4.1.1 | MIT |
| [log-symbols](https://github.com/sindresorhus/log-symbols) | 2.2.0 | MIT |
| [loose-envify](https://github.com/zertosh/loose-envify) | 1.4.0 | MIT |
| [lru-cache](https://github.com/isaacs/node-lru-cache) | 5.1.1 | ISC |
| [lru-cache](https://github.com/isaacs/node-lru-cache) | 10.4.3 | ISC |
| [makeerror](https://github.com/daaku/nodejs-makeerror) | 1.0.12 | BSD-3-Clause |
| [math-intrinsics](https://github.com/es-shims/math-intrinsics) | 1.1.0 | MIT |
| [mdn-data](https://github.com/mdn/data) | 2.0.14 | CC0-1.0 |
| [memoize-one](https://github.com/alexreardon/memoize-one) | 5.2.1 | MIT |
| [memoize-one](https://github.com/alexreardon/memoize-one) | 6.0.0 | MIT |
| [merge-stream](https://github.com/grncdr/merge-stream) | 2.0.0 | MIT |
| [metro](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-babel-transformer](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-babel-transformer](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-cache](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-cache](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-cache-key](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-cache-key](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-config](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-config](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-core](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-core](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-file-map](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-file-map](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-minify-terser](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-minify-terser](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-resolver](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-resolver](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-runtime](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-runtime](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-source-map](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-source-map](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-symbolicate](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-symbolicate](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-transform-plugins](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-transform-plugins](https://github.com/react/metro) | 0.87.2 | MIT |
| [metro-transform-worker](https://github.com/react/metro) | 0.87.1 | MIT |
| [metro-transform-worker](https://github.com/react/metro) | 0.87.2 | MIT |
| [micromatch](https://github.com/micromatch/micromatch) | 4.0.8 | MIT |
| [mime](https://github.com/broofa/node-mime) | 1.6.0 | MIT |
| [mime-db](https://github.com/jshttp/mime-db) | 1.52.0 | MIT |
| [mime-db](https://github.com/jshttp/mime-db) | 1.54.0 | MIT |
| [mime-types](https://github.com/jshttp/mime-types) | 2.1.35 | MIT |
| [mime-types](https://github.com/jshttp/mime-types) | 3.0.2 | MIT |
| [mimic-fn](https://github.com/sindresorhus/mimic-fn) | 1.2.0 | MIT |
| [minimatch](https://github.com/isaacs/minimatch) | 10.2.6 | BlueOak-1.0.0 |
| [ms](https://github.com/zeit/ms) | 2.0.0 | MIT |
| [ms](https://github.com/zeit/ms) | 2.1.2 | MIT |
| [ms](https://github.com/vercel/ms) | 2.1.3 | MIT |
| [multitars](https://github.com/expo/multitars) | 1.0.2 | MIT |
| [nanoid](https://github.com/ai/nanoid) | 3.3.20 | MIT |
| [negotiator](https://github.com/jshttp/negotiator) | 0.6.3 | MIT |
| [negotiator](https://github.com/jshttp/negotiator) | 0.6.4 | MIT |
| [negotiator](https://github.com/jshttp/negotiator) | 1.1.0 | MIT |
| [nitro-core](https://github.com/margelo/nitro) | 0.37.2 | MIT |
| [node-fetch](https://github.com/bitinn/node-fetch) | 2.7.0 | MIT |
| [node-forge](https://github.com/digitalbazaar/forge) | 1.4.3 | (BSD-3-Clause OR GPL-2.0) |
| [node-int64](https://github.com/broofa/node-int64) | 0.4.0 | MIT |
| [node-releases](https://github.com/chicoxyzzy/node-releases) | 2.0.61 | MIT |
| [noxcturnal](https://github.com/expo/noxcturnal) | 0.1.14 | MIT |
| [npm-package-arg](https://github.com/npm/npm-package-arg) | 11.0.3 | ISC |
| [nth-check](https://github.com/fb55/nth-check) | 2.1.1 | BSD-2-Clause |
| [nullthrows](https://github.com/zertosh/nullthrows) | 1.1.1 | MIT |
| [ob1](https://github.com/react/metro) | 0.87.1 | MIT |
| [ob1](https://github.com/react/metro) | 0.87.2 | MIT |
| [object-assign](https://github.com/sindresorhus/object-assign) | 4.1.1 | MIT |
| [on-finished](https://github.com/jshttp/on-finished) | 2.3.0 | MIT |
| [on-finished](https://github.com/jshttp/on-finished) | 2.4.2 | MIT |
| [on-headers](https://github.com/jshttp/on-headers) | 1.1.0 | MIT |
| [onetime](https://github.com/sindresorhus/onetime) | 2.0.1 | MIT |
| [open](https://github.com/sindresorhus/open) | 8.4.2 | MIT |
| [ora](https://github.com/sindresorhus/ora) | 3.4.0 | MIT |
| [parse-png](https://github.com/kevva/parse-png) | 2.1.0 | MIT |
| [parseurl](https://github.com/pillarjs/parseurl) | 1.3.3 | MIT |
| [path-key](https://github.com/sindresorhus/path-key) | 3.1.1 | MIT |
| [path-parse](https://github.com/jbgutierrez/path-parse) | 1.0.7 | MIT |
| [picocolors](https://github.com/alexeyraspopov/picocolors) | 1.1.1 | ISC |
| [picomatch](https://github.com/micromatch/picomatch) | 2.3.2 | MIT |
| [picomatch](https://github.com/micromatch/picomatch) | 4.0.7 | MIT |
| [plist](https://github.com/TooTallNate/node-plist) | 3.1.1 | MIT |
| [pngjs](https://github.com/lukeapage/pngjs2) | 3.4.0 | MIT |
| [possible-typed-array-names](https://github.com/ljharb/possible-typed-array-names) | 1.1.0 | MIT |
| [postcss](https://github.com/postcss/postcss) | 8.5.33 | MIT |
| [postcss-value-parser](https://github.com/TrySound/postcss-value-parser) | 4.2.0 | MIT |
| [pretty-format](https://github.com/jestjs/jest) | 29.7.0 | MIT |
| [proc-log](https://github.com/npm/proc-log) | 4.2.0 | ISC |
| [process](https://github.com/shtylman/node-process) | 0.11.10 | MIT |
| [progress](https://github.com/visionmedia/node-progress) | 2.0.3 | MIT |
| [promise](https://github.com/then/promise) | 7.3.1 | MIT |
| [promise](https://github.com/then/promise) | 8.3.0 | MIT |
| [prompts](https://github.com/terkelg/prompts) | 2.4.2 | MIT |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | 2.0.4 | MIT |
| [range-parser](https://github.com/jshttp/range-parser) | 1.2.1 | MIT |
| [react](https://github.com/react/react) | 19.3.0 | MIT |
| [react-devtools-core](https://github.com/facebook/react) | 6.1.5 | MIT |
| [react-dom](https://github.com/react/react) | 19.3.0 | MIT |
| [react-fast-compare](https://github.com/FormidableLabs/react-fast-compare) | 3.2.3 | MIT |
| [react-freeze](https://github.com/software-mansion/react-freeze) | 1.0.4 | MIT |
| [react-is](https://github.com/facebook/react) | 18.3.1 | MIT |
| [react-is](https://github.com/react/react) | 19.3.1 | MIT |
| [react-native](https://github.com/react/react-native) | 0.88.1 | MIT |
| [react-native-drawer-layout](https://github.com/react-navigation/react-navigation) | 4.2.13 | MIT |
| [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler) | 3.5.0 | MIT |
| [react-native-is-edge-to-edge](https://github.com/zoontek/react-native-edge-to-edge) | 1.3.1 | MIT |
| [react-native-keyboard-controller](https://github.com/kirillzyusko/react-native-keyboard-controller) | 1.22.9 | MIT |
| [react-native-nitro-modules](https://github.com/margelo/nitro) | 0.37.2 | MIT |
| [react-native-quick-base64](https://github.com/craftzdog/react-native-quick-base64) | 3.0.1 | MIT |
| [react-native-quick-crypto](https://github.com/margelo/react-native-quick-crypto) | 1.1.10 | MIT |
| [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) | 4.7.1 | MIT |
| [react-native-safe-area-context](https://github.com/appandflow/react-native-safe-area-context) | 5.11.1 | MIT |
| [react-native-screens](https://github.com/software-mansion/react-native-screens) | 4.30.1 | MIT |
| [react-native-svg](https://github.com/software-mansion/react-native-svg) | 15.16.0 | MIT |
| [react-native-web](https://github.com/necolas/react-native-web) | 0.21.4 | MIT |
| [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc) | 155.0.1 | MIT |
| [react-native-worklets](https://github.com/software-mansion/react-native-reanimated) | 0.13.0 | MIT |
| [react-refresh](https://github.com/facebook/react) | 0.14.2 | MIT |
| [readable-stream](https://github.com/nodejs/readable-stream) | 4.7.0 | MIT |
| [regenerate](https://github.com/mathiasbynens/regenerate) | 1.5.0 | MIT |
| [regenerate-unicode-properties](https://github.com/mathiasbynens/regenerate-unicode-properties) | 10.3.0 | MIT |
| [regenerator-runtime](https://github.com/facebook/regenerator/tree/main/packages/runtime) | 0.13.11 | MIT |
| [regexpu-core](https://github.com/mathiasbynens/regexpu-core) | 6.5.3 | MIT |
| [regjsgen](https://github.com/bnjmnt4n/regjsgen) | 0.8.0 | MIT |
| [regjsparser](https://github.com/jviereck/regjsparser) | 0.13.4 | BSD-2-Clause |
| [require-directory](https://github.com/troygoode/node-require-directory) | 2.1.1 | MIT |
| resolve | 1.22.13 | MIT |
| [resolve-from](https://github.com/sindresorhus/resolve-from) | 5.0.0 | MIT |
| [resolve-workspace-root](https://github.com/byCedric/resolve-workspace-root) | 2.0.1 | MIT |
| [restore-cursor](https://github.com/sindresorhus/restore-cursor) | 2.0.0 | MIT |
| [safe-buffer](https://github.com/feross/safe-buffer) | 5.2.1 | MIT |
| [safe-regex-test](https://github.com/ljharb/safe-regex-test) | 1.1.0 | MIT |
| [sandbox-cli-detector](https://github.com/davidmokos/sandbox-cli-detector) | 0.2.0 | MIT |
| [sax](https://github.com/isaacs/sax-js) | 1.6.1 | BlueOak-1.0.0 |
| [scheduler](https://github.com/react/react) | 0.28.0 | MIT |
| [semver](https://github.com/npm/node-semver) | 6.3.1 | ISC |
| [semver](https://github.com/npm/node-semver) | 7.8.5 | ISC |
| [semver](https://github.com/npm/node-semver) | 7.8.6 | ISC |
| [send](https://github.com/pillarjs/send) | 0.19.2 | MIT |
| [serialize-error](https://github.com/sindresorhus/serialize-error) | 2.1.0 | MIT |
| [serve-static](https://github.com/expressjs/serve-static) | 1.16.3 | MIT |
| [server-only](https://reactjs.org) | 0.0.1 | MIT |
| [set-function-length](https://github.com/ljharb/set-function-length) | 1.2.2 | MIT |
| [setimmediate](https://github.com/YuzuJS/setImmediate) | 1.0.5 | MIT |
| [setprototypeof](https://github.com/wesleytodd/setprototypeof) | 1.2.0 | ISC |
| [sf-symbols-typescript](https://github.com/nandorojo/typescript-sf-symbols) | 2.2.0 | MIT |
| [shebang-command](https://github.com/kevva/shebang-command) | 2.0.0 | MIT |
| [shebang-regex](https://github.com/sindresorhus/shebang-regex) | 3.0.0 | MIT |
| [shell-quote](https://github.com/ljharb/shell-quote) | 1.12.0 | MIT |
| [signal-exit](https://github.com/tapjs/signal-exit) | 3.0.7 | ISC |
| [simple-plist](https://github.com/wollardj/simple-plist) | 1.3.1 | MIT |
| [sisteransi](https://github.com/terkelg/sisteransi) | 1.0.5 | MIT |
| [slugify](https://github.com/simov/slugify) | 1.6.9 | MIT |
| [source-map](https://github.com/mozilla/source-map) | 0.5.7 | BSD-3-Clause |
| [source-map](https://github.com/mozilla/source-map) | 0.6.1 | BSD-3-Clause |
| [source-map-js](https://github.com/7rulnik/source-map-js) | 1.2.2 | BSD-3-Clause |
| [source-map-support](https://github.com/evanw/node-source-map-support) | 0.5.21 | MIT |
| [stackframe](https://github.com/stacktracejs/stackframe) | 1.3.4 | MIT |
| [stacktrace-parser](https://github.com/errwischt/stacktrace-parser) | 0.1.11 | MIT |
| [standard-navigation](https://github.com/react-navigation/standard-navigation) | 0.0.5 | MIT |
| [statuses](https://github.com/jshttp/statuses) | 1.5.0 | MIT |
| [statuses](https://github.com/jshttp/statuses) | 2.0.2 | MIT |
| [stream-buffers](https://github.com/samcday/node-stream-buffer) | 2.2.0 | Unlicense |
| [string-width](https://github.com/sindresorhus/string-width) | 4.2.3 | MIT |
| [string_decoder](https://github.com/nodejs/string_decoder) | 1.3.0 | MIT |
| [strip-ansi](https://github.com/chalk/strip-ansi) | 5.2.0 | MIT |
| [strip-ansi](https://github.com/chalk/strip-ansi) | 6.0.1 | MIT |
| [structured-headers](https://github.com/evert/structured-header) | 0.4.1 | MIT |
| [styleq](https://github.com/necolas/styleq) | 0.1.3 | MIT |
| [supports-color](https://github.com/chalk/supports-color) | 5.5.0 | MIT |
| [supports-color](https://github.com/chalk/supports-color) | 7.2.0 | MIT |
| [supports-color](https://github.com/chalk/supports-color) | 8.1.1 | MIT |
| [supports-hyperlinks](https://github.com/jamestalmage/supports-hyperlinks) | 2.3.0 | MIT |
| [supports-preserve-symlinks-flag](https://github.com/inspect-js/node-supports-preserve-symlinks-flag) | 1.0.0 | MIT |
| [terminal-link](https://github.com/sindresorhus/terminal-link) | 2.1.1 | MIT |
| [terser](https://github.com/terser/terser) | 5.51.2 | BSD-2-Clause |
| [throat](https://github.com/ForbesLindesay/throat) | 5.0.0 | MIT |
| [tinyglobby](https://github.com/SuperchupuDev/tinyglobby) | 0.2.17 | MIT |
| [tmpl](https://github.com/daaku/nodejs-tmpl) | 1.0.5 | BSD-3-Clause |
| [to-regex-range](https://github.com/micromatch/to-regex-range) | 5.0.1 | MIT |
| [toidentifier](https://github.com/component/toidentifier) | 1.0.1 | MIT |
| [toqr](https://github.com/kitten/toqr) | 0.1.1 | MIT |
| [tr46](https://github.com/Sebmaster/tr46.js) | 0.0.3 | MIT |
| [type-fest](https://github.com/sindresorhus/type-fest) | 0.7.1 | (MIT OR CC0-1.0) |
| [type-fest](https://github.com/sindresorhus/type-fest) | 0.21.3 | (MIT OR CC0-1.0) |
| [typescript](https://github.com/microsoft/TypeScript) | 6.0.3 | Apache-2.0 |
| [ua-parser-js](https://github.com/faisalman/ua-parser-js) | 1.0.41 | MIT |
| [undici-types](https://github.com/nodejs/undici) | 8.9.0 | MIT |
| [unicode-canonical-property-names-ecmascript](https://github.com/mathiasbynens/unicode-canonical-property-names-ecmascript) | 2.0.1 | MIT |
| [unicode-match-property-ecmascript](https://github.com/mathiasbynens/unicode-match-property-ecmascript) | 2.0.0 | MIT |
| [unicode-match-property-value-ecmascript](https://github.com/mathiasbynens/unicode-match-property-value-ecmascript) | 2.2.1 | MIT |
| [unicode-property-aliases-ecmascript](https://github.com/mathiasbynens/unicode-property-aliases-ecmascript) | 2.2.0 | MIT |
| [unpipe](https://github.com/stream-utils/unpipe) | 1.0.0 | MIT |
| [update-browserslist-db](https://github.com/browserslist/update-db) | 1.3.4 | MIT |
| [use-latest-callback](https://github.com/satya164/use-latest-callback) | 0.2.6 | MIT |
| [util](https://github.com/browserify/node-util) | 0.12.5 | MIT |
| [utils-merge](https://github.com/jaredhanson/utils-merge) | 1.0.1 | MIT |
| [validate-npm-package-name](https://github.com/npm/validate-npm-package-name) | 5.0.1 | ISC |
| [vary](https://github.com/jshttp/vary) | 1.1.2 | MIT |
| [vlq](https://github.com/Rich-Harris/vlq) | 1.0.1 | MIT |
| [walker](https://github.com/daaku/nodejs-walker) | 1.0.8 | Apache-2.0 |
| [warn-once](https://github.com/satya164/warn-once) | 0.1.1 | MIT |
| [wcwidth](https://github.com/timoxley/wcwidth) | 1.0.1 | MIT |
| [webidl-conversions](https://github.com/jsdom/webidl-conversions) | 3.0.1 | BSD-2-Clause |
| [whatwg-fetch](https://github.com/github/fetch) | 3.6.20 | MIT |
| [whatwg-url](https://github.com/jsdom/whatwg-url) | 5.0.0 | MIT |
| [whatwg-url-minimum](https://github.com/expo/whatwg-url-minimum) | 0.2.0 | MIT |
| [which](https://github.com/isaacs/node-which) | 2.0.2 | ISC |
| [which-typed-array](https://github.com/inspect-js/which-typed-array) | 1.1.24 | MIT |
| [wrap-ansi](https://github.com/chalk/wrap-ansi) | 7.0.0 | MIT |
| [ws](https://github.com/websockets/ws) | 7.5.13 | MIT |
| [ws](https://github.com/websockets/ws) | 8.23.0 | MIT |
| [xcode](https://github.com/apache/cordova-node-xcode) | 4.0.0 | Apache-2.0 |
| [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) | 0.6.0 | MIT |
| [xmlbuilder](https://github.com/oozcitak/xmlbuilder-js) | 11.0.1 | MIT |
| [xmlbuilder](https://github.com/oozcitak/xmlbuilder-js) | 15.1.1 | MIT |
| [y18n](https://github.com/yargs/y18n) | 5.0.8 | ISC |
| [yallist](https://github.com/isaacs/yallist) | 3.1.1 | ISC |
| [yargs](https://github.com/yargs/yargs) | 17.7.3 | MIT |
| [yargs-parser](https://github.com/yargs/yargs-parser) | 21.1.1 | ISC |

### The computer app

Electron, which the computer app runs on, and the packages it needs (`desktop/package-lock.json`). The tools that pack the app (electron-builder) are not part of it. 13 packages.

| Package | Version | Licence |
| --- | --- | --- |
| @electron-internal/extract-zip | 1.0.5 | BSD-2-Clause |
| @electron/get | 5.1.0 | MIT |
| @types/node | 24.19.2 | MIT |
| debug | 4.4.3 | MIT |
| electron | 44.10.0 | MIT |
| env-paths | 3.0.0 | MIT |
| graceful-fs | 4.2.11 | ISC |
| ms | 2.1.3 | MIT |
| progress | 2.0.3 | MIT |
| semver | 7.8.5 | ISC |
| sumchecker | 3.0.1 | Apache-2.0 |
| undici | 7.30.1 | MIT |
| undici-types | 7.24.6 | MIT |

### Rust crates

The core of the app, the relay and the Tor connection are written in Rust. Every crate in `Cargo.lock` but Erevos's own. 681 crates.

| Crate | Version | Licence |
| --- | --- | --- |
| [adler2](https://github.com/oyvindln/adler2) | 2.0.1 | 0BSD OR MIT OR Apache-2.0 |
| [aead](https://github.com/RustCrypto/traits) | 0.5.2 | MIT OR Apache-2.0 |
| [aead](https://github.com/RustCrypto/traits) | 0.6.1 | MIT OR Apache-2.0 |
| [aes](https://github.com/RustCrypto/block-ciphers) | 0.8.4 | MIT OR Apache-2.0 |
| [aes](https://github.com/RustCrypto/block-ciphers) | 0.9.4 | MIT OR Apache-2.0 |
| [aes-gcm](https://github.com/RustCrypto/AEADs) | 0.10.3 | Apache-2.0 OR MIT |
| [ahash](https://github.com/tkaitchuck/ahash) | 0.8.12 | MIT OR Apache-2.0 |
| [aho-corasick](https://github.com/BurntSushi/aho-corasick) | 1.1.5 | Unlicense OR MIT |
| [allocator-api2](https://github.com/zakarumych/allocator-api2) | 0.2.21 | MIT OR Apache-2.0 |
| [amplify](https://github.com/rust-amplify/rust-amplify) | 4.9.0 | MIT |
| [amplify_derive](https://github.com/rust-amplify/amplify-derive) | 4.0.1 | Apache-2.0 |
| [amplify_num](https://github.com/rust-amplify/amplify-num) | 0.5.4 | Apache-2.0 |
| [amplify_syn](https://github.com/rust-amplify/amplify-derive) | 2.0.1 | Apache-2.0 |
| [android_system_properties](https://github.com/nical/android_system_properties) | 0.1.6 | MIT OR Apache-2.0 |
| [anyhow](https://github.com/dtolnay/anyhow) | 1.0.104 | MIT OR Apache-2.0 |
| [argon2](https://github.com/RustCrypto/password-hashes/tree/master/argon2) | 0.5.3 | MIT OR Apache-2.0 |
| [arrayvec](https://github.com/bluss/arrayvec) | 0.7.8 | MIT OR Apache-2.0 |
| [arti-client](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [ascii](https://github.com/tomprogrammer/rust-ascii) | 1.1.0 | Apache-2.0 OR MIT |
| [asn1-rs](https://github.com/rusticata/asn1-rs) | 0.7.2 | MIT OR Apache-2.0 |
| [asn1-rs-derive](https://github.com/rusticata/asn1-rs) | 0.6.0 | MIT OR Apache-2.0 |
| [asn1-rs-impl](https://github.com/rusticata/asn1-rs) | 0.2.0 | MIT OR Apache-2.0 |
| [async-compression](https://github.com/Nullus157/async-compression) | 0.4.52 | MIT OR Apache-2.0 |
| [async-trait](https://github.com/dtolnay/async-trait) | 0.1.92 | MIT OR Apache-2.0 |
| [async_executors](https://github.com/najamelan/async_executors) | 0.7.0 | Unlicense |
| [asynchronous-codec](https://github.com/mxinden/asynchronous-codec) | 0.7.0 | MIT |
| [atomic](https://github.com/Amanieu/atomic-rs) | 0.5.3 | Apache-2.0 OR MIT |
| [atomic](https://github.com/Amanieu/atomic-rs) | 0.6.1 | Apache-2.0 OR MIT |
| [autocfg](https://github.com/cuviper/autocfg) | 1.5.1 | Apache-2.0 OR MIT |
| [base16ct](https://github.com/RustCrypto/formats/tree/master/base16ct) | 0.2.0 | Apache-2.0 OR MIT |
| [base16ct](https://github.com/RustCrypto/formats) | 1.0.0 | Apache-2.0 OR MIT |
| [base64](https://github.com/marshallpierce/rust-base64) | 0.13.1 | MIT OR Apache-2.0 |
| [base64](https://github.com/marshallpierce/rust-base64) | 0.22.1 | MIT OR Apache-2.0 |
| [base64](https://github.com/marshallpierce/rust-base64) | 0.23.1 | MIT OR Apache-2.0 |
| [base64ct](https://github.com/RustCrypto/formats) | 1.8.3 | Apache-2.0 OR MIT |
| [bincode](https://github.com/bincode-org/bincode) | 2.0.1 | MIT |
| [bindgen](https://github.com/rust-lang/rust-bindgen) | 0.72.1 | BSD-3-Clause |
| [bit-set](https://github.com/contain-rs/bit-set) | 0.8.0 | Apache-2.0 OR MIT |
| [bit-vec](https://github.com/contain-rs/bit-vec) | 0.8.0 | Apache-2.0 OR MIT |
| [bitflags](https://github.com/bitflags/bitflags) | 2.13.2 | MIT OR Apache-2.0 |
| [bitvec](https://github.com/bitvecto-rs/bitvec) | 1.1.1 | MIT |
| [blake2](https://github.com/RustCrypto/hashes) | 0.10.6 | MIT OR Apache-2.0 |
| [blanket](https://github.com/althonos/blanket) | 0.3.0 | MIT |
| [blind-rsa-signatures](https://github.com/jedisct1/rust-blind-rsa-signatures) | 0.18.0 | MIT |
| [block-buffer](https://github.com/RustCrypto/utils) | 0.10.4 | MIT OR Apache-2.0 |
| [block-buffer](https://github.com/RustCrypto/utils) | 0.12.1 | MIT OR Apache-2.0 |
| [block-padding](https://github.com/RustCrypto/utils) | 0.4.2 | MIT OR Apache-2.0 |
| [bs58](https://github.com/Nullus157/bs58-rs) | 0.5.1 | MIT OR Apache-2.0 |
| [bstr](https://github.com/BurntSushi/bstr) | 1.13.1 | MIT OR Apache-2.0 |
| [bumpalo](https://github.com/fitzgen/bumpalo) | 3.20.4 | MIT OR Apache-2.0 |
| [by_address](https://github.com/mbrubeck/by_address) | 1.2.1 | MIT OR Apache-2.0 |
| [bytemuck](https://github.com/Lokathor/bytemuck) | 1.25.2 | Zlib OR Apache-2.0 OR MIT |
| [bytemuck_derive](https://github.com/Lokathor/bytemuck) | 1.12.1 | Zlib OR Apache-2.0 OR MIT |
| [byteorder](https://github.com/BurntSushi/byteorder) | 1.5.0 | Unlicense OR MIT |
| [bytes](https://github.com/tokio-rs/bytes) | 1.12.2 | MIT |
| [candle-core](https://github.com/huggingface/candle) | 0.11.1 | MIT OR Apache-2.0 |
| [candle-nn](https://github.com/huggingface/candle) | 0.11.1 | MIT OR Apache-2.0 |
| [caret](https://gitlab.torproject.org/tpo/core/arti) | 0.11.1 | MIT OR Apache-2.0 |
| [castaway](https://github.com/sagebind/castaway) | 0.2.4 | MIT |
| [cbc](https://github.com/RustCrypto/block-modes) | 0.2.1 | MIT OR Apache-2.0 |
| [cc](https://github.com/rust-lang/cc-rs) | 1.11.2 | MIT OR Apache-2.0 |
| [cesu8](https://github.com/emk/cesu8-rs) | 1.1.0 | Apache-2.0 OR MIT |
| [cexpr](https://github.com/jethrogb/rust-cexpr) | 0.6.0 | Apache-2.0 OR MIT |
| [cfg-if](https://github.com/rust-lang/cfg-if) | 1.0.5 | MIT OR Apache-2.0 |
| [cfg_aliases](https://github.com/katharostech/cfg_aliases) | 0.2.2 | MIT |
| [chacha20](https://github.com/RustCrypto/stream-ciphers) | 0.9.1 | Apache-2.0 OR MIT |
| [chacha20](https://github.com/RustCrypto/stream-ciphers) | 0.10.2 | MIT OR Apache-2.0 |
| [chacha20poly1305](https://github.com/RustCrypto/AEADs/tree/master/chacha20poly1305) | 0.10.1 | Apache-2.0 OR MIT |
| [chacha20poly1305](https://github.com/RustCrypto/AEADs) | 0.11.0 | Apache-2.0 OR MIT |
| [chrono](https://github.com/chronotope/chrono) | 0.4.45 | MIT OR Apache-2.0 |
| [cipher](https://github.com/RustCrypto/traits) | 0.4.4 | MIT OR Apache-2.0 |
| [cipher](https://github.com/RustCrypto/traits) | 0.5.2 | MIT OR Apache-2.0 |
| [clang-sys](https://github.com/KyleMayes/clang-sys) | 1.9.1 | Apache-2.0 |
| [cmov](https://github.com/RustCrypto/utils) | 0.5.4 | Apache-2.0 OR MIT |
| [coarsetime](https://github.com/jedisct1/rust-coarsetime) | 0.1.38 | BSD-2-Clause |
| [combine](https://github.com/Marwes/combine) | 4.6.9 | MIT |
| [compact_str](https://github.com/ParkMyCar/compact_str) | 0.9.1 | MIT |
| [compression-codecs](https://github.com/Nullus157/async-compression) | 0.4.47 | MIT OR Apache-2.0 |
| [compression-core](https://github.com/Nullus157/async-compression) | 0.4.34 | MIT OR Apache-2.0 |
| [const-oid](https://github.com/RustCrypto/formats/tree/master/const-oid) | 0.9.6 | Apache-2.0 OR MIT |
| [const-oid](https://github.com/RustCrypto/formats) | 0.10.3 | Apache-2.0 OR MIT |
| [constant_time_eq](https://codeberg.org/cesarb/constant_time_eq) | 0.6.1 | CC0-1.0 OR MIT-0 OR Apache-2.0 |
| [convert_case](https://github.com/rutrum/convert-case) | 0.10.0 | MIT |
| [cookie-factory](https://github.com/rust-bakery/cookie-factory) | 0.3.3 | MIT |
| [core-foundation-sys](https://github.com/servo/core-foundation-rs) | 0.8.7 | MIT OR Apache-2.0 |
| [core-models](https://github.com/cryspen/libcrux) | 0.0.7 | Apache-2.0 |
| [cpubits](https://github.com/RustCrypto/utils) | 0.1.1 | MIT OR Apache-2.0 |
| [cpufeatures](https://github.com/RustCrypto/utils) | 0.2.17 | MIT OR Apache-2.0 |
| [cpufeatures](https://github.com/RustCrypto/utils) | 0.3.1 | MIT OR Apache-2.0 |
| [crabgrind](https://github.com/2dav/crabgrind) | 0.2.6 | MIT |
| [crc32fast](https://github.com/srijs/rust-crc32fast) | 1.5.5 | MIT OR Apache-2.0 |
| [crossbeam-deque](https://github.com/crossbeam-rs/crossbeam) | 0.8.8 | MIT OR Apache-2.0 |
| [crossbeam-epoch](https://github.com/crossbeam-rs/crossbeam) | 0.9.21 | MIT OR Apache-2.0 |
| [crossbeam-queue](https://github.com/crossbeam-rs/crossbeam) | 0.3.14 | MIT OR Apache-2.0 |
| [crossbeam-utils](https://github.com/crossbeam-rs/crossbeam) | 0.8.23 | MIT OR Apache-2.0 |
| [crunchy](https://github.com/eira-fransham/crunchy) | 0.2.4 | MIT |
| [crypto-bigint](https://github.com/RustCrypto/crypto-bigint) | 0.5.5 | Apache-2.0 OR MIT |
| [crypto-bigint](https://github.com/RustCrypto/crypto-bigint) | 0.7.11 | Apache-2.0 OR MIT |
| [crypto-common](https://github.com/RustCrypto/traits) | 0.1.7 | MIT OR Apache-2.0 |
| [crypto-common](https://github.com/RustCrypto/traits) | 0.2.2 | MIT OR Apache-2.0 |
| [crypto-primes](https://github.com/entropyxyz/crypto-primes) | 0.7.0 | Apache-2.0 OR MIT |
| [ct-codecs](https://github.com/jedisct1/rust-ct-codecs) | 1.1.8 | MIT |
| [ctr](https://github.com/RustCrypto/block-modes) | 0.9.2 | MIT OR Apache-2.0 |
| [ctr](https://github.com/RustCrypto/block-modes) | 0.10.1 | MIT OR Apache-2.0 |
| [ctutils](https://github.com/RustCrypto/utils) | 0.4.8 | Apache-2.0 OR MIT |
| [curve25519-dalek](https://github.com/dalek-cryptography/curve25519-dalek/tree/main/curve25519-dalek) | 4.1.3 | BSD-3-Clause |
| [curve25519-dalek](https://github.com/dalek-cryptography/curve25519-dalek/tree/main/curve25519-dalek) | 5.0.0 | BSD-3-Clause |
| [curve25519-dalek-derive](https://github.com/dalek-cryptography/curve25519-dalek) | 0.1.1 | MIT OR Apache-2.0 |
| [daachorse](https://github.com/daac-tools/daachorse) | 3.0.3 | MIT OR Apache-2.0 |
| [darling](https://github.com/TedDriggs/darling) | 0.14.4 | MIT |
| [darling](https://github.com/TedDriggs/darling) | 0.20.11 | MIT |
| [darling](https://github.com/TedDriggs/darling) | 0.21.3 | MIT |
| [darling](https://github.com/TedDriggs/darling) | 0.24.1 | MIT |
| [darling_core](https://github.com/TedDriggs/darling) | 0.14.4 | MIT |
| [darling_core](https://github.com/TedDriggs/darling) | 0.20.11 | MIT |
| [darling_core](https://github.com/TedDriggs/darling) | 0.21.3 | MIT |
| [darling_core](https://github.com/TedDriggs/darling) | 0.24.1 | MIT |
| [darling_macro](https://github.com/TedDriggs/darling) | 0.14.4 | MIT |
| [darling_macro](https://github.com/TedDriggs/darling) | 0.20.11 | MIT |
| [darling_macro](https://github.com/TedDriggs/darling) | 0.21.3 | MIT |
| [darling_macro](https://github.com/TedDriggs/darling) | 0.24.1 | MIT |
| [dary_heap](https://github.com/hanmertens/dary_heap) | 0.3.9 | MIT OR Apache-2.0 |
| [data-encoding](https://github.com/ia0/data-encoding) | 2.11.1 | MIT |
| [der](https://github.com/RustCrypto/formats/tree/master/der) | 0.7.10 | Apache-2.0 OR MIT |
| [der](https://github.com/RustCrypto/formats) | 0.8.3 | Apache-2.0 OR MIT |
| [der-parser](https://github.com/rusticata/der-parser) | 10.0.0 | MIT OR Apache-2.0 |
| [deranged](https://github.com/jhpratt/deranged) | 0.5.9 | MIT OR Apache-2.0 |
| [derive-deftly](https://gitlab.torproject.org/Diziet/rust-derive-deftly) | 1.14.0 | MIT |
| [derive-deftly-macros](https://gitlab.torproject.org/Diziet/rust-derive-deftly) | 1.14.0 | MIT |
| [derive-new](https://github.com/nrc/derive-new) | 0.7.0 | MIT |
| [derive_builder](https://github.com/colin-kiegel/rust-derive-builder) | 0.20.2 | MIT OR Apache-2.0 |
| [derive_builder_core](https://github.com/colin-kiegel/rust-derive-builder) | 0.20.2 | MIT OR Apache-2.0 |
| [derive_builder_core_fork_arti](https://github.com/ijackson/rust-derive-builder) | 0.11.2 | MIT OR Apache-2.0 |
| [derive_builder_fork_arti](https://github.com/ijackson/rust-derive-builder) | 0.11.2 | MIT OR Apache-2.0 |
| [derive_builder_macro](https://github.com/colin-kiegel/rust-derive-builder) | 0.20.2 | MIT OR Apache-2.0 |
| [derive_builder_macro_fork_arti](https://github.com/ijackson/rust-derive-builder) | 0.11.2 | MIT OR Apache-2.0 |
| [derive_more](https://github.com/JelteF/derive_more) | 2.1.1 | MIT |
| [derive_more-impl](https://github.com/JelteF/derive_more) | 2.1.1 | MIT |
| [digest](https://github.com/RustCrypto/traits) | 0.10.7 | MIT OR Apache-2.0 |
| [digest](https://github.com/RustCrypto/traits) | 0.11.3 | MIT OR Apache-2.0 |
| [directories](https://github.com/soc/directories-rs) | 6.0.0 | MIT OR Apache-2.0 |
| [dirs](https://github.com/soc/dirs-rs) | 6.0.0 | MIT OR Apache-2.0 |
| [dirs-sys](https://github.com/dirs-dev/dirs-sys-rs) | 0.5.0 | MIT OR Apache-2.0 |
| [displaydoc](https://github.com/yaahc/displaydoc) | 0.2.7 | MIT OR Apache-2.0 |
| [downcast-rs](https://github.com/marcianx/downcast-rs) | 2.0.2 | MIT OR Apache-2.0 |
| [dyn-clone](https://github.com/dtolnay/dyn-clone) | 1.0.20 | MIT OR Apache-2.0 |
| [dyn-stack](https://codeberg.org/sarah-quinones/dyn-stack) | 0.13.2 | MIT |
| [dyn-stack-macros](https://github.com/kitegi/dynstack) | 0.1.3 | MIT |
| [ecdsa](https://github.com/RustCrypto/signatures/tree/master/ecdsa) | 0.16.9 | Apache-2.0 OR MIT |
| [ed25519](https://github.com/RustCrypto/signatures/tree/master/ed25519) | 2.2.3 | Apache-2.0 OR MIT |
| [ed25519](https://github.com/RustCrypto/signatures) | 3.0.0 | Apache-2.0 OR MIT |
| [ed25519-dalek](https://github.com/dalek-cryptography/curve25519-dalek/tree/main/ed25519-dalek) | 2.2.0 | BSD-3-Clause |
| [ed25519-dalek](https://github.com/dalek-cryptography/curve25519-dalek/tree/main/ed25519-dalek) | 3.0.0 | BSD-3-Clause |
| [educe](https://github.com/magiclen/educe) | 0.4.23 | MIT |
| [either](https://github.com/rayon-rs/either) | 1.19.0 | MIT OR Apache-2.0 |
| [elliptic-curve](https://github.com/RustCrypto/traits/tree/master/elliptic-curve) | 0.13.8 | Apache-2.0 OR MIT |
| [enum-as-inner](https://github.com/bluejekyll/enum-as-inner) | 0.6.1 | MIT OR Apache-2.0 |
| [enum-ordinalize](https://github.com/magiclen/enum-ordinalize) | 3.1.15 | MIT |
| [enum_dispatch](https://gitlab.com/antonok/enum_dispatch) | 0.3.13 | MIT OR Apache-2.0 |
| [enumset](https://github.com/Lymia/enumset) | 1.1.15 | MIT OR Apache-2.0 |
| [enumset_derive](https://github.com/Lymia/enumset) | 0.15.1 | MIT OR Apache-2.0 |
| [equivalent](https://github.com/indexmap-rs/equivalent) | 1.0.3 | Apache-2.0 OR MIT |
| [errno](https://github.com/lambda-fairy/rust-errno) | 0.3.15 | MIT OR Apache-2.0 |
| [esaxx-rs](https://github.com/Narsil/esaxx-rs) | 0.1.10 | Apache-2.0 |
| [event-listener](https://github.com/smol-rs/event-listener) | 5.4.2 | Apache-2.0 OR MIT |
| [extend](https://github.com/davidpdrsn/extend) | 1.2.0 | MIT |
| [fallible-iterator](https://github.com/sfackler/rust-fallible-iterator) | 0.3.0 | MIT OR Apache-2.0 |
| [fallible-streaming-iterator](https://github.com/sfackler/fallible-streaming-iterator) | 0.1.9 | MIT OR Apache-2.0 |
| [fancy-regex](https://github.com/fancy-regex/fancy-regex) | 0.17.0 | MIT |
| [fastrand](https://github.com/smol-rs/fastrand) | 2.5.0 | Apache-2.0 OR MIT |
| [ff](https://github.com/zkcrypto/ff) | 0.13.1 | MIT OR Apache-2.0 |
| [fiat-crypto](https://github.com/mit-plv/fiat-crypto) | 0.2.9 | MIT OR Apache-2.0 OR BSD-1-Clause |
| [fiat-crypto](https://github.com/mit-plv/fiat-crypto) | 0.3.0 | MIT OR Apache-2.0 OR BSD-1-Clause |
| [figment](https://github.com/SergioBenitez/Figment) | 0.10.19 | MIT OR Apache-2.0 |
| [filetime](https://github.com/alexcrichton/filetime) | 0.2.30 | MIT OR Apache-2.0 |
| [find-msvc-tools](https://github.com/rust-lang/cc-rs) | 0.1.15 | MIT OR Apache-2.0 |
| [flate2](https://github.com/rust-lang/flate2-rs) | 1.1.11 | MIT OR Apache-2.0 |
| [float8](https://github.com/EricLBuehler/float8) | 0.7.0 | MIT |
| [fluid-let](https://github.com/ilammy/fluid-let) | 1.0.0 | MIT |
| [fnv](https://github.com/servo/rust-fnv) | 1.0.7 | Apache-2.0 OR MIT |
| [foldhash](https://github.com/orlp/foldhash) | 0.1.5 | Zlib |
| [foldhash](https://github.com/orlp/foldhash) | 0.2.0 | Zlib |
| [form_urlencoded](https://github.com/servo/rust-url) | 1.2.3 | MIT OR Apache-2.0 |
| [fs-mistrust](https://gitlab.torproject.org/tpo/core/arti) | 0.16.1 | MIT OR Apache-2.0 |
| [fslock-guard](https://gitlab.torproject.org/tpo/core/arti) | 0.9.1 | MIT OR Apache-2.0 |
| [funty](https://github.com/myrrlyn/funty) | 2.0.0 | MIT |
| [futures](https://github.com/rust-lang/futures-rs) | 0.3.34 | MIT OR Apache-2.0 |
| [futures-channel](https://github.com/rust-lang/futures-rs) | 0.3.34 | MIT OR Apache-2.0 |
| [futures-core](https://github.com/rust-lang/futures-rs) | 0.3.34 | MIT OR Apache-2.0 |
| [futures-executor](https://github.com/rust-lang/futures-rs) | 0.3.34 | MIT OR Apache-2.0 |
| [futures-io](https://github.com/rust-lang/futures-rs) | 0.3.34 | MIT OR Apache-2.0 |
| [futures-macro](https://github.com/rust-lang/futures-rs) | 0.3.34 | MIT OR Apache-2.0 |
| [futures-rustls](https://github.com/quininer/futures-rustls) | 0.26.0 | MIT OR Apache-2.0 |
| [futures-sink](https://github.com/rust-lang/futures-rs) | 0.3.34 | MIT OR Apache-2.0 |
| [futures-task](https://github.com/rust-lang/futures-rs) | 0.3.34 | MIT OR Apache-2.0 |
| [futures-util](https://github.com/rust-lang/futures-rs) | 0.3.34 | MIT OR Apache-2.0 |
| [gemm](https://github.com/sarah-ek/gemm) | 0.19.0 | MIT |
| [gemm-c32](https://github.com/sarah-ek/gemm) | 0.19.0 | MIT |
| [gemm-c64](https://github.com/sarah-ek/gemm) | 0.19.0 | MIT |
| [gemm-common](https://github.com/sarah-ek/gemm) | 0.19.0 | MIT |
| [gemm-f16](https://github.com/sarah-ek/gemm) | 0.19.0 | MIT |
| [gemm-f32](https://github.com/sarah-ek/gemm) | 0.19.0 | MIT |
| [gemm-f64](https://github.com/sarah-ek/gemm) | 0.19.0 | MIT |
| [generic-array](https://github.com/fizyk20/generic-array) | 0.14.7 | MIT |
| [getrandom](https://github.com/rust-random/getrandom) | 0.2.17 | MIT OR Apache-2.0 |
| [getrandom](https://github.com/rust-random/getrandom) | 0.3.4 | MIT OR Apache-2.0 |
| [getrandom](https://github.com/rust-random/getrandom) | 0.4.3 | MIT OR Apache-2.0 |
| [getset](https://github.com/jbaublitz/getset) | 0.1.7 | MIT |
| [ghash](https://github.com/RustCrypto/universal-hashes) | 0.5.1 | Apache-2.0 OR MIT |
| [glob](https://github.com/rust-lang/glob) | 0.3.4 | MIT OR Apache-2.0 |
| glob-match | 0.2.1 | MIT |
| [group](https://github.com/zkcrypto/group) | 0.13.0 | MIT OR Apache-2.0 |
| [half](https://github.com/VoidStarKat/half-rs) | 2.7.1 | MIT OR Apache-2.0 |
| [hashbrown](https://github.com/rust-lang/hashbrown) | 0.12.3 | MIT OR Apache-2.0 |
| [hashbrown](https://github.com/rust-lang/hashbrown) | 0.15.5 | MIT OR Apache-2.0 |
| [hashbrown](https://github.com/rust-lang/hashbrown) | 0.16.1 | MIT OR Apache-2.0 |
| [hashbrown](https://github.com/rust-lang/hashbrown) | 0.17.1 | MIT OR Apache-2.0 |
| [hashlink](https://github.com/djc/hashlink) | 0.12.2 | MIT OR Apache-2.0 |
| [hax-lib](https://github.com/hacspec/hax) | 0.3.7 | Apache-2.0 |
| [hax-lib-macros](https://github.com/hacspec/hax) | 0.3.7 | Apache-2.0 |
| [hax-lib-macros-types](https://github.com/hacspec/hax) | 0.3.7 | Apache-2.0 |
| [heck](https://github.com/withoutboats/heck) | 0.5.0 | MIT OR Apache-2.0 |
| [hermit-abi](https://github.com/hermit-os/hermit-rs) | 0.5.3 | MIT OR Apache-2.0 |
| [hex](https://github.com/KokaKiwi/rust-hex) | 0.4.3 | MIT OR Apache-2.0 |
| [hkdf](https://github.com/RustCrypto/KDFs) | 0.12.4 | MIT OR Apache-2.0 |
| [hkdf](https://github.com/RustCrypto/KDFs) | 0.13.0 | MIT OR Apache-2.0 |
| [hmac](https://github.com/RustCrypto/MACs) | 0.12.1 | MIT OR Apache-2.0 |
| [hmac](https://github.com/RustCrypto/MACs) | 0.13.0 | MIT OR Apache-2.0 |
| [hmac-sha256](https://github.com/jedisct1/rust-hmac-sha256) | 1.1.15 | ISC |
| [hmac-sha512](https://github.com/jedisct1/rust-hmac-sha512) | 1.1.13 | ISC |
| [hostname-validator](https://github.com/pop-os/hostname-validator) | 1.1.1 | MIT |
| [hpke](https://github.com/rozbb/rust-hpke) | 0.14.1 | MIT OR Apache-2.0 |
| [hpke-rs](https://github.com/celabshq/libcrux) | 0.7.0 | MPL-2.0 |
| [hpke-rs-crypto](https://github.com/celabshq/libcrux) | 0.7.0 | MPL-2.0 |
| [hpke-rs-libcrux](https://github.com/celabshq/libcrux) | 0.7.0 | MPL-2.0 |
| [hpke-rs-rust-crypto](https://github.com/celabshq/libcrux) | 0.7.0 | MPL-2.0 |
| [http](https://github.com/hyperium/http) | 1.5.0 | MIT OR Apache-2.0 |
| [httparse](https://github.com/seanmonstar/httparse) | 1.10.1 | MIT OR Apache-2.0 |
| [httpdate](https://github.com/pyfisch/httpdate) | 1.0.3 | MIT OR Apache-2.0 |
| [humantime](https://github.com/chronotope/humantime) | 2.4.0 | MIT OR Apache-2.0 |
| [humantime-serde](https://github.com/jean-airoldie/humantime-serde) | 1.1.1 | MIT OR Apache-2.0 |
| [hybrid-array](https://github.com/RustCrypto/hybrid-array) | 0.4.15 | MIT OR Apache-2.0 |
| [iana-time-zone](https://github.com/strawlab/iana-time-zone) | 0.1.65 | MIT OR Apache-2.0 |
| [iana-time-zone-haiku](https://github.com/strawlab/iana-time-zone) | 0.1.2 | MIT OR Apache-2.0 |
| [icu_collections](https://github.com/unicode-org/icu4x) | 2.4.0 | Unicode-3.0 |
| [icu_locale_core](https://github.com/unicode-org/icu4x) | 2.4.0 | Unicode-3.0 |
| [icu_normalizer](https://github.com/unicode-org/icu4x) | 2.4.0 | Unicode-3.0 |
| [icu_normalizer_data](https://github.com/unicode-org/icu4x) | 2.4.0 | Unicode-3.0 |
| [icu_properties](https://github.com/unicode-org/icu4x) | 2.4.0 | Unicode-3.0 |
| [icu_properties_data](https://github.com/unicode-org/icu4x) | 2.4.0 | Unicode-3.0 |
| [icu_provider](https://github.com/unicode-org/icu4x) | 2.4.0 | Unicode-3.0 |
| [ident_case](https://github.com/TedDriggs/ident_case) | 1.0.1 | MIT OR Apache-2.0 |
| [idna](https://github.com/servo/rust-url) | 1.1.0 | MIT OR Apache-2.0 |
| [idna_adapter](https://github.com/hsivonen/idna_adapter) | 1.2.2 | Apache-2.0 OR MIT |
| [imara-diff](https://github.com/pascalkuthe/imara-diff) | 0.2.0 | Apache-2.0 |
| [indexmap](https://github.com/bluss/indexmap) | 1.9.3 | Apache-2.0 OR MIT |
| [indexmap](https://github.com/indexmap-rs/indexmap) | 2.14.2 | Apache-2.0 OR MIT |
| [inotify](https://github.com/hannobraun/inotify-rs) | 0.11.5 | ISC |
| [inotify-sys](https://github.com/hannobraun/inotify-sys) | 0.1.8 | ISC |
| [inout](https://github.com/RustCrypto/utils) | 0.1.4 | MIT OR Apache-2.0 |
| [inout](https://github.com/RustCrypto/utils) | 0.2.6 | MIT OR Apache-2.0 |
| [inventory](https://github.com/dtolnay/inventory) | 0.3.25 | MIT OR Apache-2.0 |
| [ipnet](https://github.com/krisprice/ipnet) | 2.12.2 | MIT OR Apache-2.0 |
| [iprange](https://github.com/sticnarf/iprange-rs) | 0.6.7 | MIT |
| [itertools](https://github.com/rust-itertools/itertools) | 0.13.0 | MIT OR Apache-2.0 |
| [itertools](https://github.com/rust-itertools/itertools) | 0.14.0 | MIT OR Apache-2.0 |
| [itertools](https://github.com/rust-itertools/itertools) | 0.15.0 | MIT OR Apache-2.0 |
| [itoa](https://github.com/dtolnay/itoa) | 1.0.19 | MIT OR Apache-2.0 |
| [jiff](https://github.com/BurntSushi/jiff) | 0.2.46 | Unlicense OR MIT |
| [jiff-core](https://github.com/BurntSushi/jiff) | 0.1.8 | Unlicense OR MIT |
| [jiff-static](https://github.com/BurntSushi/jiff) | 0.2.46 | Unlicense OR MIT |
| [jiff-tzdb](https://github.com/BurntSushi/jiff) | 0.1.10 | Unlicense OR MIT |
| [jiff-tzdb-platform](https://github.com/BurntSushi/jiff) | 0.1.3 | Unlicense OR MIT |
| [jni](https://github.com/jni-rs/jni-rs) | 0.21.1 | MIT OR Apache-2.0 |
| [jni-sys](https://github.com/jni-rs/jni-sys) | 0.3.1 | MIT OR Apache-2.0 |
| [jni-sys](https://github.com/jni-rs/jni-sys) | 0.4.1 | MIT OR Apache-2.0 |
| [jni-sys-macros](https://github.com/jni-rs/jni-sys) | 0.4.1 | MIT OR Apache-2.0 |
| [jobserver](https://github.com/rust-lang/jobserver-rs) | 0.1.35 | MIT OR Apache-2.0 |
| [js-sys](https://github.com/wasm-bindgen/wasm-bindgen/tree/master/crates/js-sys) | 0.3.106 | MIT OR Apache-2.0 |
| [k256](https://github.com/RustCrypto/elliptic-curves/tree/master/k256) | 0.13.4 | Apache-2.0 OR MIT |
| [keccak](https://github.com/RustCrypto/sponges) | 0.2.2 | Apache-2.0 OR MIT |
| [kem](https://github.com/RustCrypto/traits) | 0.3.0 | Apache-2.0 OR MIT |
| [kqueue](https://gitlab.com/rust-kqueue/rust-kqueue) | 1.2.1 | MIT |
| [kqueue-sys](https://gitlab.com/rust-kqueue/rust-kqueue-sys) | 1.1.2 | MIT |
| [lazy_static](https://github.com/rust-lang-nursery/lazy-static.rs) | 1.5.1 | MIT OR Apache-2.0 |
| [libc](https://github.com/rust-lang/libc) | 0.2.191 | MIT OR Apache-2.0 |
| [libcrux-aead](https://github.com/cryspen/libcrux) | 0.0.9 | Apache-2.0 |
| [libcrux-aes](https://github.com/cryspen/libcrux) | 0.0.9 | Apache-2.0 |
| [libcrux-chacha20poly1305](https://github.com/cryspen/libcrux) | 0.0.9 | Apache-2.0 |
| [libcrux-curve25519](https://github.com/cryspen/libcrux) | 0.0.8 | Apache-2.0 |
| [libcrux-ecdh](https://github.com/cryspen/libcrux) | 0.0.8 | Apache-2.0 |
| [libcrux-hacl-rs](https://github.com/cryspen/libcrux) | 0.0.5 | Apache-2.0 |
| [libcrux-hkdf](https://github.com/cryspen/libcrux) | 0.0.8 | Apache-2.0 |
| [libcrux-hmac](https://github.com/cryspen/libcrux) | 0.0.8 | Apache-2.0 |
| [libcrux-intrinsics](https://github.com/cryspen/libcrux) | 0.0.8 | Apache-2.0 |
| [libcrux-kem](https://github.com/cryspen/libcrux) | 0.0.9 | Apache-2.0 |
| [libcrux-macros](https://github.com/cryspen/libcrux) | 0.0.3 | Apache-2.0 |
| [libcrux-ml-kem](https://github.com/cryspen/libcrux) | 0.0.10 | Apache-2.0 |
| [libcrux-p256](https://github.com/cryspen/libcrux) | 0.0.8 | Apache-2.0 |
| [libcrux-platform](https://github.com/cryspen/libcrux) | 0.0.3 | Apache-2.0 |
| [libcrux-poly1305](https://github.com/cryspen/libcrux) | 0.0.6 | Apache-2.0 |
| [libcrux-secrets](https://github.com/cryspen/libcrux) | 0.0.6 | Apache-2.0 |
| [libcrux-sha2](https://github.com/cryspen/libcrux) | 0.0.8 | Apache-2.0 |
| [libcrux-sha3](https://github.com/cryspen/libcrux) | 0.0.10 | Apache-2.0 |
| [libcrux-traits](https://github.com/cryspen/libcrux) | 0.0.8 | Apache-2.0 |
| [libloading](https://github.com/nagisa/rust_libloading) | 0.8.9 | ISC |
| [liblzma](https://github.com/portable-network-archive/liblzma-rs) | 0.4.9 | MIT OR Apache-2.0 |
| [liblzma-sys](https://github.com/portable-network-archive/liblzma-rs) | 0.4.9 | MIT OR Apache-2.0 |
| [libm](https://github.com/rust-lang/compiler-builtins) | 0.2.16 | MIT |
| [libredox](https://gitlab.redox-os.org/redox-os/libredox) | 0.1.25 | MIT |
| [libsqlite3-sys](https://github.com/rusqlite/rusqlite) | 0.38.2 | MIT |
| [linux-raw-sys](https://github.com/sunfishcode/linux-raw-sys) | 0.12.1 | Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT |
| [litemap](https://github.com/unicode-org/icu4x) | 0.8.3 | Unicode-3.0 |
| [lock_api](https://github.com/Amanieu/parking_lot) | 0.4.14 | MIT OR Apache-2.0 |
| [log](https://github.com/rust-lang/log) | 0.4.35 | MIT OR Apache-2.0 |
| [macro_rules_attribute](https://github.com/danielhenrymantilla/macro_rules_attribute-rs) | 0.2.3 | Apache-2.0 OR MIT OR Zlib |
| [macro_rules_attribute-proc_macro](https://github.com/danielhenrymantilla/macro_rules_attribute-rs) | 0.2.3 | Apache-2.0 OR MIT OR Zlib |
| [matrix-pickle](https://github.com/matrix-org/matrix-pickle) | 0.2.3 | Apache-2.0 |
| [matrix-pickle-derive](https://github.com/matrix-org/matrix-pickle) | 0.2.3 | Apache-2.0 |
| [memchr](https://github.com/BurntSushi/memchr) | 2.8.3 | Unlicense OR MIT |
| [memmap2](https://github.com/RazrFalcon/memmap2-rs) | 0.9.12 | MIT OR Apache-2.0 |
| [minimal-lexical](https://github.com/Alexhuszagh/minimal-lexical) | 0.2.1 | MIT OR Apache-2.0 |
| [miniz_oxide](https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide) | 0.9.1 | MIT OR Zlib OR Apache-2.0 |
| [mio](https://github.com/tokio-rs/mio) | 1.2.5 | MIT |
| [ml-dsa](https://github.com/RustCrypto/signatures) | 0.1.2 | Apache-2.0 OR MIT |
| [ml-kem](https://github.com/RustCrypto/KEMs) | 0.3.4 | Apache-2.0 OR MIT |
| [module-lattice](https://github.com/RustCrypto/KEMs) | 0.2.4 | Apache-2.0 OR MIT |
| [monostate](https://github.com/dtolnay/monostate) | 0.1.18 | MIT OR Apache-2.0 |
| [monostate-impl](https://github.com/dtolnay/monostate) | 0.1.18 | MIT OR Apache-2.0 |
| [nix](https://github.com/nix-rust/nix) | 0.32.0 | MIT |
| [nom](https://github.com/Geal/nom) | 7.1.3 | MIT |
| [nonany](https://github.com/rick-de-water/nonany) | 0.3.0 | MIT OR Apache-2.0 |
| [notify](https://github.com/notify-rs/notify) | 8.2.2 | CC0-1.0 |
| [notify-types](https://github.com/notify-rs/notify) | 2.3.1 | MIT OR Apache-2.0 |
| [ntapi](https://github.com/MSxDOS/ntapi) | 0.4.3 | Apache-2.0 OR MIT |
| [num-bigint](https://github.com/rust-num/num-bigint) | 0.4.8 | MIT OR Apache-2.0 |
| [num-bigint-dig](https://github.com/dignifiedquire/num-bigint) | 0.8.6 | MIT OR Apache-2.0 |
| [num-complex](https://github.com/rust-num/num-complex) | 0.4.6 | MIT OR Apache-2.0 |
| [num-conv](https://github.com/jhpratt/num-conv) | 0.2.2 | MIT OR Apache-2.0 |
| [num-integer](https://github.com/rust-num/num-integer) | 0.1.47 | MIT OR Apache-2.0 |
| [num-iter](https://github.com/rust-num/num-iter) | 0.1.46 | MIT OR Apache-2.0 |
| [num-traits](https://github.com/rust-num/num-traits) | 0.2.19 | MIT OR Apache-2.0 |
| [num_cpus](https://github.com/seanmonstar/num_cpus) | 1.17.0 | MIT OR Apache-2.0 |
| [num_enum](https://github.com/illicitonion/num_enum) | 0.7.6 | BSD-3-Clause OR MIT OR Apache-2.0 |
| [num_enum_derive](https://github.com/illicitonion/num_enum) | 0.7.6 | BSD-3-Clause OR MIT OR Apache-2.0 |
| [objc2-core-foundation](https://github.com/madsmtm/objc2) | 0.3.2 | Zlib OR Apache-2.0 OR MIT |
| [objc2-io-kit](https://github.com/madsmtm/objc2) | 0.3.2 | Zlib OR Apache-2.0 OR MIT |
| [once_cell](https://github.com/matklad/once_cell) | 1.21.4 | MIT OR Apache-2.0 |
| [oneshot-fused-workaround](https://gitlab.torproject.org/tpo/core/arti) | 0.8.1 | MIT OR Apache-2.0 |
| [opaque-debug](https://github.com/RustCrypto/utils) | 0.3.1 | MIT OR Apache-2.0 |
| [openmls](https://github.com/openmls/openmls) | 0.9.2 | MIT |
| [openmls_basic_credential](https://github.com/openmls/openmls/tree/main/basic_credential) | 0.6.0 | MIT |
| [openmls_memory_storage](https://github.com/openmls/openmls/tree/main/memory_storage) | 0.6.0 | MIT |
| [openmls_rust_crypto](https://github.com/openmls/openmls/tree/main/openmls_rust_crypto) | 0.6.0 | MIT |
| [openmls_serialization_helpers](https://github.com/openmls/openmls/tree/main/serialization_helpers) | 0.1.0 | MIT |
| [openmls_traits](https://github.com/openmls/openmls/tree/main/traits) | 0.6.0 | MIT |
| [option-ext](https://github.com/soc/option-ext) | 0.2.0 | MPL-2.0 |
| [ordered-float](https://github.com/reem/rust-ordered-float) | 2.10.1 | MIT |
| [os_str_bytes](https://github.com/dylni/os_str_bytes) | 6.6.1 | MIT OR Apache-2.0 |
| [p256](https://github.com/RustCrypto/elliptic-curves/tree/master/p256) | 0.13.2 | Apache-2.0 OR MIT |
| [p384](https://github.com/RustCrypto/elliptic-curves/tree/master/p384) | 0.13.1 | Apache-2.0 OR MIT |
| [p521](https://github.com/RustCrypto/elliptic-curves/tree/master/p521) | 0.13.3 | Apache-2.0 OR MIT |
| [parking](https://github.com/smol-rs/parking) | 2.2.1 | Apache-2.0 OR MIT |
| [parking_lot](https://github.com/Amanieu/parking_lot) | 0.12.5 | MIT OR Apache-2.0 |
| [parking_lot_core](https://github.com/Amanieu/parking_lot) | 0.9.12 | MIT OR Apache-2.0 |
| [password-hash](https://github.com/RustCrypto/traits/tree/master/password-hash) | 0.5.0 | MIT OR Apache-2.0 |
| [paste](https://github.com/dtolnay/paste) | 1.0.15 | MIT OR Apache-2.0 |
| [pastey](https://github.com/as1100k/pastey) | 0.2.3 | MIT OR Apache-2.0 |
| [pem-rfc7468](https://github.com/RustCrypto/formats/tree/master/pem-rfc7468) | 0.7.0 | Apache-2.0 OR MIT |
| [pem-rfc7468](https://github.com/RustCrypto/formats) | 1.0.0 | Apache-2.0 OR MIT |
| [percent-encoding](https://github.com/servo/rust-url) | 2.3.2 | MIT OR Apache-2.0 |
| [phf](https://github.com/rust-phf/rust-phf) | 0.14.0 | MIT |
| [phf_generator](https://github.com/rust-phf/rust-phf) | 0.14.0 | MIT |
| [phf_macros](https://github.com/rust-phf/rust-phf) | 0.14.0 | MIT |
| [phf_shared](https://github.com/rust-phf/rust-phf) | 0.14.0 | MIT |
| [pin-project](https://github.com/taiki-e/pin-project) | 1.1.13 | Apache-2.0 OR MIT |
| [pin-project-internal](https://github.com/taiki-e/pin-project) | 1.1.13 | Apache-2.0 OR MIT |
| [pin-project-lite](https://github.com/taiki-e/pin-project-lite) | 0.2.17 | Apache-2.0 OR MIT |
| [pkcs1](https://github.com/RustCrypto/formats/tree/master/pkcs1) | 0.7.5 | Apache-2.0 OR MIT |
| [pkcs1](https://github.com/RustCrypto/formats) | 0.8.0-rc.4 | Apache-2.0 OR MIT |
| [pkcs8](https://github.com/RustCrypto/formats/tree/master/pkcs8) | 0.10.2 | Apache-2.0 OR MIT |
| [pkcs8](https://github.com/RustCrypto/formats) | 0.11.0 | Apache-2.0 OR MIT |
| [pkg-config](https://github.com/rust-lang/pkg-config-rs) | 0.3.34 | MIT OR Apache-2.0 |
| [poly1305](https://github.com/RustCrypto/universal-hashes) | 0.8.0 | Apache-2.0 OR MIT |
| [poly1305](https://github.com/RustCrypto/universal-hashes) | 0.9.1 | Apache-2.0 OR MIT |
| [polyval](https://github.com/RustCrypto/universal-hashes) | 0.6.2 | Apache-2.0 OR MIT |
| [polyval](https://github.com/RustCrypto/universal-hashes) | 0.7.3 | Apache-2.0 OR MIT |
| [portable-atomic](https://github.com/taiki-e/portable-atomic) | 1.15.0 | Apache-2.0 OR MIT |
| [portable-atomic-util](https://github.com/taiki-e/portable-atomic-util) | 0.2.8 | Apache-2.0 OR MIT |
| [postage](https://github.com/austinjones/postage-rs) | 0.5.0 | MIT |
| [potential_utf](https://github.com/unicode-org/icu4x) | 0.1.6 | Unicode-3.0 |
| [powerfmt](https://github.com/jhpratt/powerfmt) | 0.2.1 | MIT OR Apache-2.0 |
| [ppv-lite86](https://github.com/cryptocorrosion/cryptocorrosion) | 0.2.21 | MIT OR Apache-2.0 |
| [prettyplease](https://github.com/dtolnay/prettyplease) | 0.2.37 | MIT OR Apache-2.0 |
| [primeorder](https://github.com/RustCrypto/elliptic-curves/tree/master/primeorder) | 0.13.6 | Apache-2.0 OR MIT |
| [proc-macro-crate](https://github.com/bkchr/proc-macro-crate) | 3.5.0 | MIT OR Apache-2.0 |
| [proc-macro-error-attr2](https://github.com/GnomedDev/proc-macro-error-2) | 2.0.0 | MIT OR Apache-2.0 |
| [proc-macro-error2](https://github.com/GnomedDev/proc-macro-error-2) | 2.0.1 | MIT OR Apache-2.0 |
| [proc-macro2](https://github.com/dtolnay/proc-macro2) | 1.0.107 | MIT OR Apache-2.0 |
| [prost](https://github.com/tokio-rs/prost) | 0.14.6 | Apache-2.0 |
| [prost-derive](https://github.com/tokio-rs/prost) | 0.14.6 | Apache-2.0 |
| [pulp](https://github.com/sarah-quinones/pulp) | 0.22.3 | MIT |
| [pulp-wasm-simd-flag](https://github.com/sarah-quinones/pulp) | 0.1.1 | MIT |
| [pwd-grp](https://gitlab.torproject.org/tpo/core/rust-pwd-grp) | 1.0.2 | MIT |
| [quote](https://github.com/dtolnay/quote) | 1.0.47 | MIT OR Apache-2.0 |
| [r-efi](https://github.com/r-efi/r-efi) | 5.3.0 | MIT OR Apache-2.0 OR LGPL-2.1-or-later |
| [r-efi](https://github.com/r-efi/r-efi) | 6.0.0 | MIT OR Apache-2.0 OR LGPL-2.1-or-later |
| [radium](https://github.com/bitvecto-rs/radium) | 0.7.0 | MIT |
| [rand](https://github.com/rust-random/rand) | 0.8.8 | MIT OR Apache-2.0 |
| [rand](https://github.com/rust-random/rand) | 0.9.5 | MIT OR Apache-2.0 |
| [rand](https://github.com/rust-random/rand) | 0.10.4 | MIT OR Apache-2.0 |
| [rand_chacha](https://github.com/rust-random/rand) | 0.3.1 | MIT OR Apache-2.0 |
| [rand_chacha](https://github.com/rust-random/rand) | 0.9.0 | MIT OR Apache-2.0 |
| [rand_chacha](https://github.com/rust-random/rand) | 0.10.0 | MIT OR Apache-2.0 |
| [rand_core](https://github.com/rust-random/rand) | 0.6.4 | MIT OR Apache-2.0 |
| [rand_core](https://github.com/rust-random/rand) | 0.9.5 | MIT OR Apache-2.0 |
| [rand_core](https://github.com/rust-random/rand_core) | 0.10.1 | MIT OR Apache-2.0 |
| [rand_distr](https://github.com/rust-random/rand_distr) | 0.5.1 | MIT OR Apache-2.0 |
| [rand_jitter](https://github.com/rust-random/rngs) | 0.6.1 | MIT OR Apache-2.0 |
| [rangemap](https://github.com/jeffparsons/rangemap) | 1.8.0 | MIT OR Apache-2.0 |
| [raw-cpuid](https://github.com/gz/rust-cpuid) | 11.6.0 | MIT |
| [rayon](https://github.com/rayon-rs/rayon) | 1.12.0 | MIT OR Apache-2.0 |
| [rayon-cond](https://github.com/cuviper/rayon-cond) | 0.4.0 | Apache-2.0 OR MIT |
| [rayon-core](https://github.com/rayon-rs/rayon) | 1.13.0 | MIT OR Apache-2.0 |
| [rdrand](https://github.com/nagisa/rust_rdrand) | 0.9.0 | ISC |
| [reborrow](https://github.com/sarah-ek/reborrow) | 0.5.5 | MIT |
| [redox_syscall](https://gitlab.redox-os.org/redox-os/syscall) | 0.5.18 | MIT |
| [redox_users](https://gitlab.redox-os.org/redox-os/users) | 0.5.3 | MIT |
| [ref-cast](https://github.com/dtolnay/ref-cast) | 1.0.27 | MIT OR Apache-2.0 |
| [ref-cast-impl](https://github.com/dtolnay/ref-cast) | 1.0.27 | MIT OR Apache-2.0 |
| [regex](https://github.com/rust-lang/regex) | 1.13.2 | MIT OR Apache-2.0 |
| [regex-automata](https://github.com/rust-lang/regex) | 0.4.19 | MIT OR Apache-2.0 |
| [regex-syntax](https://github.com/rust-lang/regex) | 0.8.12 | MIT OR Apache-2.0 |
| [reseeding_rng](https://github.com/LiosK/reseeding_rng-rs) | 0.10.7 | Apache-2.0 |
| [retry-error](https://gitlab.torproject.org/tpo/core/arti) | 0.14.1 | MIT OR Apache-2.0 |
| [rfc6979](https://github.com/RustCrypto/signatures/tree/master/rfc6979) | 0.4.0 | Apache-2.0 OR MIT |
| [ring](https://github.com/briansmith/ring) | 0.17.14 | Apache-2.0 AND ISC |
| [rsa](https://github.com/RustCrypto/RSA) | 0.9.10 | MIT OR Apache-2.0 |
| [rsa](https://github.com/RustCrypto/RSA) | 0.10.0-rc.18 | MIT OR Apache-2.0 |
| rsqlite-vfs | 0.1.1 | MIT |
| [rusqlite](https://github.com/rusqlite/rusqlite) | 0.40.2 | MIT |
| [rustc-hash](https://github.com/rust-lang/rustc-hash) | 2.1.3 | Apache-2.0 OR MIT |
| [rustc_version](https://github.com/djc/rustc-version-rs) | 0.4.1 | MIT OR Apache-2.0 |
| [rusticata-macros](https://github.com/rusticata/rusticata-macros) | 4.1.0 | MIT OR Apache-2.0 |
| [rustix](https://github.com/bytecodealliance/rustix) | 1.1.6 | Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT |
| [rustls](https://github.com/rustls/rustls) | 0.23.46 | Apache-2.0 OR ISC OR MIT |
| [rustls-pki-types](https://github.com/rustls/pki-types) | 1.16.0 | MIT OR Apache-2.0 |
| [rustls-webpki](https://github.com/rustls/webpki) | 0.103.17 | ISC |
| [rustversion](https://github.com/dtolnay/rustversion) | 1.0.23 | MIT OR Apache-2.0 |
| [ryu](https://github.com/dtolnay/ryu) | 1.0.23 | Apache-2.0 OR BSL-1.0 |
| [safelog](https://gitlab.torproject.org/tpo/core/arti) | 0.10.1 | MIT OR Apache-2.0 |
| [safetensors](https://github.com/huggingface/safetensors) | 0.8.0 | Apache-2.0 |
| [same-file](https://github.com/BurntSushi/same-file) | 1.0.6 | Unlicense OR MIT |
| [sanitize-filename](https://github.com/kardeiz/sanitize-filename) | 0.6.0 | MIT |
| [saturating-time](https://gitlab.torproject.org/tpo/core/arti) | 0.6.0 | MIT OR Apache-2.0 |
| [schemars](https://github.com/GREsau/schemars) | 0.9.0 | MIT |
| [schemars](https://github.com/GREsau/schemars) | 1.2.3 | MIT |
| [scopeguard](https://github.com/bluss/scopeguard) | 1.2.0 | MIT OR Apache-2.0 |
| [sec1](https://github.com/RustCrypto/formats/tree/master/sec1) | 0.7.3 | Apache-2.0 OR MIT |
| [semver](https://github.com/dtolnay/semver) | 1.0.28 | MIT OR Apache-2.0 |
| [seq-macro](https://github.com/dtolnay/seq-macro) | 0.3.6 | MIT OR Apache-2.0 |
| [serde](https://github.com/serde-rs/serde) | 1.0.229 | MIT OR Apache-2.0 |
| [serde-value](https://github.com/arcnmx/serde-value) | 0.7.0 | MIT |
| [serde_bytes](https://github.com/serde-rs/bytes) | 0.11.19 | MIT OR Apache-2.0 |
| [serde_core](https://github.com/serde-rs/serde) | 1.0.229 | MIT OR Apache-2.0 |
| [serde_derive](https://github.com/serde-rs/serde) | 1.0.229 | MIT OR Apache-2.0 |
| [serde_ignored](https://github.com/dtolnay/serde-ignored) | 0.1.14 | MIT OR Apache-2.0 |
| [serde_json](https://github.com/serde-rs/json) | 1.0.154 | MIT OR Apache-2.0 |
| [serde_spanned](https://github.com/toml-rs/toml) | 0.6.9 | MIT OR Apache-2.0 |
| [serde_spanned](https://github.com/toml-rs/toml) | 1.1.3 | MIT OR Apache-2.0 |
| [serde_with](https://github.com/jonasbb/serde_with) | 3.24.0 | MIT OR Apache-2.0 |
| [serde_with_macros](https://github.com/jonasbb/serde_with) | 3.24.0 | MIT OR Apache-2.0 |
| [serdect](https://github.com/RustCrypto/formats) | 0.4.3 | Apache-2.0 OR MIT |
| [sha1](https://github.com/RustCrypto/hashes) | 0.10.7 | MIT OR Apache-2.0 |
| [sha1](https://github.com/RustCrypto/hashes) | 0.11.0 | MIT OR Apache-2.0 |
| [sha2](https://github.com/RustCrypto/hashes) | 0.10.9 | MIT OR Apache-2.0 |
| [sha2](https://github.com/RustCrypto/hashes) | 0.11.1 | MIT OR Apache-2.0 |
| [sha3](https://github.com/RustCrypto/hashes) | 0.12.0 | MIT OR Apache-2.0 |
| [shake](https://github.com/RustCrypto/XOFs) | 0.1.0 | MIT OR Apache-2.0 |
| [shellexpand](https://gitlab.com/ijackson/rust-shellexpand) | 3.1.2 | MIT OR Apache-2.0 |
| [shlex](https://github.com/comex/rust-shlex) | 1.3.0 | MIT OR Apache-2.0 |
| [shlex](https://github.com/comex/rust-shlex) | 2.0.1 | MIT OR Apache-2.0 |
| [signal-hook-registry](https://github.com/vorner/signal-hook) | 1.4.8 | MIT OR Apache-2.0 |
| [signature](https://github.com/RustCrypto/traits/tree/master/signature) | 2.2.0 | Apache-2.0 OR MIT |
| [signature](https://github.com/RustCrypto/traits) | 3.0.0 | Apache-2.0 OR MIT |
| [simd-adler32](https://github.com/mcountryman/simd-adler32) | 0.3.10 | MIT |
| [siphasher](https://github.com/jedisct1/rust-siphash) | 1.0.4 | MIT OR Apache-2.0 |
| [slab](https://github.com/tokio-rs/slab) | 0.4.12 | MIT |
| [slotmap](https://github.com/orlp/slotmap) | 1.1.1 | Zlib |
| [slotmap-careful](https://gitlab.torproject.org/tpo/core/arti) | 0.9.1 | MIT OR Apache-2.0 |
| [smallvec](https://github.com/servo/rust-smallvec) | 1.16.5 | MIT OR Apache-2.0 |
| [socket2](https://github.com/rust-lang/socket2) | 0.6.5 | MIT OR Apache-2.0 |
| [spin](https://github.com/mvdnes/spin-rs) | 0.9.9 | MIT |
| [spki](https://github.com/RustCrypto/formats/tree/master/spki) | 0.7.3 | Apache-2.0 OR MIT |
| [spki](https://github.com/RustCrypto/formats) | 0.8.1 | Apache-2.0 OR MIT |
| [spm_precompiled](https://github.com/huggingface/spm_precompiled) | 0.1.4 | Apache-2.0 |
| [sponge-cursor](https://github.com/RustCrypto/utils) | 0.1.0 | MIT OR Apache-2.0 |
| [sqlite-wasm-rs](https://github.com/Spxg/sqlite-wasm-rs) | 0.5.5 | MIT |
| [ssh-cipher-fork-arti](https://github.com/RustCrypto/SSH/tree/master/ssh-cipher) | 0.2.0 | Apache-2.0 OR MIT |
| [ssh-encoding-fork-arti](https://github.com/RustCrypto/SSH/tree/master/ssh-encoding) | 0.2.0 | Apache-2.0 OR MIT |
| [ssh-key-fork-arti](https://github.com/RustCrypto/SSH/tree/master/ssh-key) | 0.6.7 | Apache-2.0 OR MIT |
| [stable_deref_trait](https://github.com/storyyeller/stable_deref_trait) | 1.2.1 | MIT OR Apache-2.0 |
| [static_assertions](https://github.com/nvzqz/static-assertions-rs) | 1.1.0 | MIT OR Apache-2.0 |
| [strobe-rs](https://github.com/rozbb/strobe-rs) | 0.13.0 | MIT OR Apache-2.0 |
| [strsim](https://github.com/dguo/strsim-rs) | 0.10.0 | MIT |
| [strsim](https://github.com/rapidfuzz/strsim-rs) | 0.11.1 | MIT |
| [strum](https://github.com/Peternator7/strum) | 0.28.0 | MIT |
| [strum_macros](https://github.com/Peternator7/strum) | 0.28.0 | MIT |
| [subtle](https://github.com/dalek-cryptography/subtle) | 2.6.1 | BSD-3-Clause |
| [syn](https://github.com/dtolnay/syn) | 1.0.109 | MIT OR Apache-2.0 |
| [syn](https://github.com/dtolnay/syn) | 2.0.119 | MIT OR Apache-2.0 |
| [syn](https://github.com/dtolnay/syn) | 3.0.10 | MIT OR Apache-2.0 |
| [sync_wrapper](https://github.com/Actyx/sync_wrapper) | 1.0.2 | Apache-2.0 |
| [synstructure](https://github.com/mystor/synstructure) | 0.13.2 | MIT |
| [synstructure](https://github.com/mystor/synstructure) | 0.14.0 | MIT |
| [sysctl](https://github.com/johalun/sysctl-rs) | 0.6.0 | MIT |
| [sysinfo](https://github.com/GuillaumeGomez/sysinfo) | 0.38.4 | MIT |
| [tap](https://github.com/myrrlyn/tap) | 1.0.1 | MIT |
| [tempfile](https://github.com/Stebalien/tempfile) | 3.27.0 | MIT OR Apache-2.0 |
| [thiserror](https://github.com/dtolnay/thiserror) | 1.0.69 | MIT OR Apache-2.0 |
| [thiserror](https://github.com/dtolnay/thiserror) | 2.0.21 | MIT OR Apache-2.0 |
| [thiserror-impl](https://github.com/dtolnay/thiserror) | 1.0.69 | MIT OR Apache-2.0 |
| [thiserror-impl](https://github.com/dtolnay/thiserror) | 2.0.21 | MIT OR Apache-2.0 |
| [time](https://github.com/time-rs/time) | 0.3.55 | MIT OR Apache-2.0 |
| [time-core](https://github.com/time-rs/time) | 0.1.9 | MIT OR Apache-2.0 |
| [time-macros](https://github.com/time-rs/time) | 0.2.32 | MIT OR Apache-2.0 |
| [tinystr](https://github.com/unicode-org/icu4x) | 0.8.5 | Unicode-3.0 |
| [tinyvec](https://github.com/Lokathor/tinyvec) | 1.13.3 | Zlib OR Apache-2.0 OR MIT |
| [tls_codec](https://github.com/RustCrypto/formats) | 0.5.0 | Apache-2.0 OR MIT |
| [tls_codec_derive](https://github.com/RustCrypto/formats) | 0.5.0 | Apache-2.0 OR MIT |
| [tokenizers](https://github.com/huggingface/tokenizers) | 0.23.2 | Apache-2.0 |
| [tokio](https://github.com/tokio-rs/tokio) | 1.54.1 | MIT |
| [tokio-macros](https://github.com/tokio-rs/tokio) | 2.7.2 | MIT |
| [tokio-rustls](https://github.com/rustls/tokio-rustls) | 0.26.6 | MIT OR Apache-2.0 |
| [tokio-tungstenite](https://github.com/snapview/tokio-tungstenite) | 0.30.0 | MIT |
| [tokio-util](https://github.com/tokio-rs/tokio) | 0.7.20 | MIT |
| [toml](https://github.com/toml-rs/toml) | 0.8.23 | MIT OR Apache-2.0 |
| [toml](https://github.com/toml-rs/toml) | 1.2.1+spec-1.1.0 | MIT OR Apache-2.0 |
| [toml_datetime](https://github.com/toml-rs/toml) | 0.6.11 | MIT OR Apache-2.0 |
| [toml_datetime](https://github.com/toml-rs/toml) | 1.1.3+spec-1.1.0 | MIT OR Apache-2.0 |
| [toml_edit](https://github.com/toml-rs/toml) | 0.22.27 | MIT OR Apache-2.0 |
| [toml_edit](https://github.com/toml-rs/toml) | 0.25.19+spec-1.1.0 | MIT OR Apache-2.0 |
| [toml_parser](https://github.com/toml-rs/toml) | 1.1.5+spec-1.1.0 | MIT OR Apache-2.0 |
| [toml_write](https://github.com/toml-rs/toml) | 0.1.2 | MIT OR Apache-2.0 |
| [toml_writer](https://github.com/toml-rs/toml) | 1.2.0+spec-1.1.0 | MIT OR Apache-2.0 |
| [tor-async-utils](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-basic-utils](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-bytes](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-cell](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-cert](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-chanmgr](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-checkable](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-circmgr](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-config](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-config-path](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-consdiff](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-dirclient](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-dircommon](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-dirmgr](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-error](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-general-addr](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-guardmgr](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-hsclient](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-hscrypto](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-key-forge](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-keymgr](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-linkspec](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-llcrypto](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-log-ratelim](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-memquota](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-memquota-cost](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-netdir](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-netdoc](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-persist](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-proto](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-protover](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-ptmgr](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-relay-selection](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-rtcompat](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-socksproto](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tor-units](https://gitlab.torproject.org/tpo/core/arti) | 0.48.0 | MIT OR Apache-2.0 |
| [tracing](https://github.com/tokio-rs/tracing) | 0.1.44 | MIT |
| [tracing-attributes](https://github.com/tokio-rs/tracing) | 0.1.31 | MIT |
| [tracing-core](https://github.com/tokio-rs/tracing) | 0.1.36 | MIT |
| [tungstenite](https://github.com/snapview/tungstenite-rs) | 0.30.0 | MIT OR Apache-2.0 |
| [typed-index-collections](https://github.com/zheland/typed-index-collections) | 3.5.0 | MIT OR Apache-2.0 |
| [typed-path](https://github.com/chipsenkbeil/typed-path) | 0.13.0 | MIT OR Apache-2.0 |
| [typenum](https://github.com/paholg/typenum) | 1.20.1 | MIT OR Apache-2.0 |
| [uncased](https://github.com/SergioBenitez/uncased) | 0.9.10 | MIT OR Apache-2.0 |
| [unicode-ident](https://github.com/dtolnay/unicode-ident) | 1.0.27 | (MIT OR Apache-2.0) AND Unicode-3.0 |
| [unicode-normalization-alignments](https://github.com/n1t0/unicode-normalization) | 0.1.12 | MIT OR Apache-2.0 |
| [unicode-segmentation](https://github.com/unicode-rs/unicode-segmentation) | 1.13.3 | MIT OR Apache-2.0 |
| [unicode-xid](https://github.com/unicode-rs/unicode-xid) | 0.2.6 | MIT OR Apache-2.0 |
| [unicode_categories](https://github.com/swgillespie/unicode-categories) | 0.1.1 | MIT OR Apache-2.0 |
| [universal-hash](https://github.com/RustCrypto/traits) | 0.5.1 | MIT OR Apache-2.0 |
| [universal-hash](https://github.com/RustCrypto/traits) | 0.6.1 | MIT OR Apache-2.0 |
| [untrusted](https://github.com/briansmith/untrusted) | 0.9.0 | ISC |
| [unty](https://github.com/bincode-org/unty) | 0.0.4 | MIT OR Apache-2.0 |
| [url](https://github.com/servo/rust-url) | 2.5.9 | MIT OR Apache-2.0 |
| [utf8_iter](https://github.com/hsivonen/utf8_iter) | 1.1.0 | Apache-2.0 OR MIT |
| [utf_types](https://github.com/hsivonen/utf_types) | 1.0.0 | Apache-2.0 OR MIT |
| [uuid](https://github.com/uuid-rs/uuid) | 1.29.3 | Apache-2.0 OR MIT |
| [vcpkg](https://github.com/mcgoo/vcpkg-rs) | 0.2.15 | MIT OR Apache-2.0 |
| [version_check](https://github.com/SergioBenitez/version_check) | 0.9.5 | MIT OR Apache-2.0 |
| [visibility](https://github.com/danielhenrymantilla/visibility.rs) | 0.1.1 | Zlib OR MIT OR Apache-2.0 |
| [vodozemac](https://github.com/matrix-org/vodozemac) | 0.11.2 | Apache-2.0 |
| [void](https://github.com/reem/rust-void) | 1.0.2 | MIT |
| [walkdir](https://github.com/BurntSushi/walkdir) | 2.5.0 | Unlicense OR MIT |
| [wasi](https://github.com/bytecodealliance/wasi) | 0.11.1+wasi-snapshot-preview1 | Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT |
| [wasip2](https://github.com/bytecodealliance/wasi-rs) | 1.0.4+wasi-0.2.12 | Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT |
| [wasix](https://github.com/wasix-org/wasix-abi-rust) | 0.13.2 | Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT |
| [wasm-bindgen](https://github.com/wasm-bindgen/wasm-bindgen) | 0.2.129 | MIT OR Apache-2.0 |
| [wasm-bindgen-macro](https://github.com/wasm-bindgen/wasm-bindgen/tree/master/crates/macro) | 0.2.129 | MIT OR Apache-2.0 |
| [wasm-bindgen-macro-support](https://github.com/wasm-bindgen/wasm-bindgen/tree/main/crates/macro-support) | 0.2.129 | MIT OR Apache-2.0 |
| [wasm-bindgen-shared](https://github.com/wasm-bindgen/wasm-bindgen/tree/master/crates/shared) | 0.2.129 | MIT OR Apache-2.0 |
| [weak-table](https://github.com/tov/weak-table-rs) | 0.4.0 | MIT |
| [web-time](https://github.com/daxpedda/web-time) | 1.1.0 | MIT OR Apache-2.0 |
| [web-time-compat](https://gitlab.torproject.org/tpo/core/arti) | 0.3.1 | MIT OR Apache-2.0 |
| [webpki-roots](https://github.com/rustls/webpki-roots) | 0.26.11 | CDLA-Permissive-2.0 |
| [webpki-roots](https://github.com/rustls/webpki-roots) | 1.0.12 | CDLA-Permissive-2.0 |
| [winapi](https://github.com/retep998/winapi-rs) | 0.3.9 | MIT OR Apache-2.0 |
| [winapi-i686-pc-windows-gnu](https://github.com/retep998/winapi-rs) | 0.4.0 | MIT OR Apache-2.0 |
| [winapi-util](https://github.com/BurntSushi/winapi-util) | 0.1.11 | Unlicense OR MIT |
| [winapi-x86_64-pc-windows-gnu](https://github.com/retep998/winapi-rs) | 0.4.0 | MIT OR Apache-2.0 |
| [windows](https://github.com/microsoft/windows-rs) | 0.62.2 | MIT OR Apache-2.0 |
| [windows-collections](https://github.com/microsoft/windows-rs) | 0.3.2 | MIT OR Apache-2.0 |
| [windows-core](https://github.com/microsoft/windows-rs) | 0.62.2 | MIT OR Apache-2.0 |
| [windows-future](https://github.com/microsoft/windows-rs) | 0.3.2 | MIT OR Apache-2.0 |
| [windows-implement](https://github.com/microsoft/windows-rs) | 0.60.2 | MIT OR Apache-2.0 |
| [windows-interface](https://github.com/microsoft/windows-rs) | 0.59.3 | MIT OR Apache-2.0 |
| [windows-link](https://github.com/microsoft/windows-rs) | 0.2.1 | MIT OR Apache-2.0 |
| [windows-numerics](https://github.com/microsoft/windows-rs) | 0.3.1 | MIT OR Apache-2.0 |
| [windows-result](https://github.com/microsoft/windows-rs) | 0.4.1 | MIT OR Apache-2.0 |
| [windows-strings](https://github.com/microsoft/windows-rs) | 0.5.1 | MIT OR Apache-2.0 |
| [windows-sys](https://github.com/microsoft/windows-rs) | 0.45.0 | MIT OR Apache-2.0 |
| [windows-sys](https://github.com/microsoft/windows-rs) | 0.52.0 | MIT OR Apache-2.0 |
| [windows-sys](https://github.com/microsoft/windows-rs) | 0.59.0 | MIT OR Apache-2.0 |
| [windows-sys](https://github.com/microsoft/windows-rs) | 0.61.2 | MIT OR Apache-2.0 |
| [windows-targets](https://github.com/microsoft/windows-rs) | 0.42.2 | MIT OR Apache-2.0 |
| [windows-targets](https://github.com/microsoft/windows-rs) | 0.52.6 | MIT OR Apache-2.0 |
| [windows-threading](https://github.com/microsoft/windows-rs) | 0.2.1 | MIT OR Apache-2.0 |
| [windows_aarch64_gnullvm](https://github.com/microsoft/windows-rs) | 0.42.2 | MIT OR Apache-2.0 |
| [windows_aarch64_gnullvm](https://github.com/microsoft/windows-rs) | 0.52.6 | MIT OR Apache-2.0 |
| [windows_aarch64_msvc](https://github.com/microsoft/windows-rs) | 0.42.2 | MIT OR Apache-2.0 |
| [windows_aarch64_msvc](https://github.com/microsoft/windows-rs) | 0.52.6 | MIT OR Apache-2.0 |
| [windows_i686_gnu](https://github.com/microsoft/windows-rs) | 0.42.2 | MIT OR Apache-2.0 |
| [windows_i686_gnu](https://github.com/microsoft/windows-rs) | 0.52.6 | MIT OR Apache-2.0 |
| [windows_i686_gnullvm](https://github.com/microsoft/windows-rs) | 0.52.6 | MIT OR Apache-2.0 |
| [windows_i686_msvc](https://github.com/microsoft/windows-rs) | 0.42.2 | MIT OR Apache-2.0 |
| [windows_i686_msvc](https://github.com/microsoft/windows-rs) | 0.52.6 | MIT OR Apache-2.0 |
| [windows_x86_64_gnu](https://github.com/microsoft/windows-rs) | 0.42.2 | MIT OR Apache-2.0 |
| [windows_x86_64_gnu](https://github.com/microsoft/windows-rs) | 0.52.6 | MIT OR Apache-2.0 |
| [windows_x86_64_gnullvm](https://github.com/microsoft/windows-rs) | 0.42.2 | MIT OR Apache-2.0 |
| [windows_x86_64_gnullvm](https://github.com/microsoft/windows-rs) | 0.52.6 | MIT OR Apache-2.0 |
| [windows_x86_64_msvc](https://github.com/microsoft/windows-rs) | 0.42.2 | MIT OR Apache-2.0 |
| [windows_x86_64_msvc](https://github.com/microsoft/windows-rs) | 0.52.6 | MIT OR Apache-2.0 |
| [winnow](https://github.com/winnow-rs/winnow) | 0.7.15 | MIT |
| [winnow](https://github.com/winnow-rs/winnow) | 1.0.5 | MIT |
| [wit-bindgen](https://github.com/bytecodealliance/wit-bindgen) | 0.57.1 | Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT |
| [writeable](https://github.com/unicode-org/icu4x) | 0.6.4 | Unicode-3.0 |
| [wyz](https://github.com/myrrlyn/wyz) | 0.5.1 | MIT |
| [x-wing](https://github.com/RustCrypto/KEMs/tree/master/x-wing) | 0.1.1 | Apache-2.0 OR MIT |
| [x25519-dalek](https://github.com/dalek-cryptography/curve25519-dalek/tree/main/x25519-dalek) | 2.0.1 | BSD-3-Clause |
| [x25519-dalek](https://github.com/dalek-cryptography/curve25519-dalek/tree/main/x25519-dalek) | 3.0.0 | BSD-3-Clause |
| [yoke](https://github.com/unicode-org/icu4x) | 0.8.4 | Unicode-3.0 |
| [yoke-derive](https://github.com/unicode-org/icu4x) | 0.8.4 | Unicode-3.0 |
| [zerocopy](https://github.com/google/zerocopy) | 0.8.63 | BSD-2-Clause OR Apache-2.0 OR MIT |
| [zerocopy-derive](https://github.com/google/zerocopy) | 0.8.63 | BSD-2-Clause OR Apache-2.0 OR MIT |
| [zerofrom](https://github.com/unicode-org/icu4x) | 0.1.8 | Unicode-3.0 |
| [zerofrom-derive](https://github.com/unicode-org/icu4x) | 0.1.8 | Unicode-3.0 |
| [zeroize](https://github.com/RustCrypto/utils) | 1.9.2 | Apache-2.0 OR MIT |
| [zeroize_derive](https://github.com/RustCrypto/utils) | 1.5.0 | Apache-2.0 OR MIT |
| [zerotrie](https://github.com/unicode-org/icu4x) | 0.2.5 | Unicode-3.0 |
| [zerovec](https://github.com/unicode-org/icu4x) | 0.11.9 | Unicode-3.0 |
| [zerovec-derive](https://github.com/unicode-org/icu4x) | 0.11.7 | Unicode-3.0 |
| [zip](https://github.com/zip-rs/zip2) | 9.7.0 | MIT |
| [zlib-rs](https://github.com/trifectatechfoundation/zlib-rs) | 0.6.8 | Zlib |
| [zmij](https://github.com/dtolnay/zmij) | 1.0.23 | MIT |
| [zstd](https://github.com/gyscos/zstd-rs) | 0.14.4 | BSD-3-Clause |
| [zstd-safe](https://github.com/gyscos/zstd-rs) | 8.3.0 | BSD-3-Clause |
| [zstd-sys](https://github.com/gyscos/zstd-rs) | 2.1.3+zstd.1.5.7 | BSD-3-Clause AND BSD-2-Clause |

### Go modules for the Tor bridges

The Android app's Tor bridges are lyrebird, built from these modules (`transports/go.mod`). Licences are read from the modules themselves. 65 modules.

| Module | Version | Licence |
| --- | --- | --- |
| [filippo.io/edwards25519](https://pkg.go.dev/filippo.io/edwards25519) | v1.2.0 | BSD-3-Clause |
| [github.com/andybalholm/brotli](https://github.com/andybalholm/brotli) | v1.0.6 | MIT |
| [github.com/aws/aws-sdk-go-v2](https://github.com/aws/aws-sdk-go-v2) | v1.40.0 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/config](https://github.com/aws/aws-sdk-go-v2) | v1.32.1 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/credentials](https://github.com/aws/aws-sdk-go-v2) | v1.19.1 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/feature/ec2/imds](https://github.com/aws/aws-sdk-go-v2) | v1.18.14 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/internal/configsources](https://github.com/aws/aws-sdk-go-v2) | v1.4.14 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/internal/endpoints/v2](https://github.com/aws/aws-sdk-go-v2) | v2.7.14 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/internal/ini](https://github.com/aws/aws-sdk-go-v2) | v1.8.4 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/service/internal/accept-encoding](https://github.com/aws/aws-sdk-go-v2) | v1.13.3 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/service/internal/presigned-url](https://github.com/aws/aws-sdk-go-v2) | v1.13.14 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/service/signin](https://github.com/aws/aws-sdk-go-v2) | v1.0.1 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/service/sqs](https://github.com/aws/aws-sdk-go-v2) | v1.42.16 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/service/sso](https://github.com/aws/aws-sdk-go-v2) | v1.30.4 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/service/ssooidc](https://github.com/aws/aws-sdk-go-v2) | v1.35.9 | Apache-2.0 |
| [github.com/aws/aws-sdk-go-v2/service/sts](https://github.com/aws/aws-sdk-go-v2) | v1.41.1 | Apache-2.0 |
| [github.com/aws/smithy-go](https://github.com/aws/smithy-go) | v1.23.2 | Apache-2.0 |
| [github.com/dchest/siphash](https://github.com/dchest/siphash) | v1.2.3 | CC0-1.0 |
| [github.com/golang/mock](https://github.com/golang/mock) | v1.6.0 | Apache-2.0 |
| [github.com/google/uuid](https://github.com/google/uuid) | v1.6.0 | BSD-3-Clause |
| [github.com/klauspost/compress](https://github.com/klauspost/compress) | v1.18.0 | BSD-3-Clause AND Apache-2.0 AND MIT |
| [github.com/klauspost/cpuid/v2](https://github.com/klauspost/cpuid) | v2.2.6 | MIT |
| [github.com/klauspost/reedsolomon](https://github.com/klauspost/reedsolomon) | v1.12.0 | MIT |
| [github.com/miekg/dns](https://github.com/miekg/dns) | v1.1.65 | BSD-3-Clause |
| [github.com/patrickmn/go-cache](https://github.com/patrickmn/go-cache) | v2.1.0+incompatible | MIT |
| [github.com/pion/datachannel](https://github.com/pion/datachannel) | v1.6.0 | MIT |
| [github.com/pion/dtls/v3](https://github.com/pion/dtls) | v3.1.2 | MIT |
| [github.com/pion/ice/v4](https://github.com/pion/ice) | v4.2.0 | MIT |
| [github.com/pion/interceptor](https://github.com/pion/interceptor) | v0.1.43 | MIT |
| [github.com/pion/logging](https://github.com/pion/logging) | v0.2.4 | MIT |
| [github.com/pion/mdns/v2](https://github.com/pion/mdns) | v2.1.0 | MIT |
| [github.com/pion/randutil](https://github.com/pion/randutil) | v0.1.0 | MIT |
| [github.com/pion/rtcp](https://github.com/pion/rtcp) | v1.2.16 | MIT |
| [github.com/pion/rtp](https://github.com/pion/rtp) | v1.10.1 | MIT |
| [github.com/pion/sctp](https://github.com/pion/sctp) | v1.9.2 | MIT |
| [github.com/pion/sdp/v3](https://github.com/pion/sdp) | v3.0.17 | MIT |
| [github.com/pion/srtp/v3](https://github.com/pion/srtp) | v3.0.10 | MIT |
| [github.com/pion/stun/v3](https://github.com/pion/stun) | v3.1.1 | MIT |
| [github.com/pion/transport/v4](https://github.com/pion/transport) | v4.0.1 | MIT |
| [github.com/pion/turn/v4](https://github.com/pion/turn) | v4.1.4 | MIT |
| [github.com/pion/webrtc/v4](https://github.com/pion/webrtc) | v4.2.3-securityfix | MIT |
| [github.com/pkg/errors](https://github.com/pkg/errors) | v0.9.1 | BSD-2-Clause |
| [github.com/realclientip/realclientip-go](https://github.com/realclientip/realclientip-go) | v1.0.0 | 0BSD |
| [github.com/refraction-networking/utls](https://github.com/refraction-networking/utls) | v1.8.2 | BSD-3-Clause |
| [github.com/theodorsm/covert-dtls](https://github.com/theodorsm/covert-dtls) | v1.5.0 | MIT |
| [github.com/tjfoc/gmsm](https://github.com/tjfoc/gmsm) | v1.4.1 | Apache-2.0 |
| [github.com/txthinking/runnergroup](https://github.com/txthinking/runnergroup) | v0.0.0-20210608031112-152c7c4432bf | MIT |
| [github.com/txthinking/socks5](https://github.com/txthinking/socks5) | v0.0.0-20251011041537-5c31f201a10e | MIT |
| [github.com/wlynxg/anet](https://github.com/wlynxg/anet) | v0.0.5 | BSD-3-Clause |
| [github.com/xtaci/kcp-go/v5](https://github.com/xtaci/kcp-go) | v5.6.24 | MIT |
| [github.com/xtaci/smux](https://github.com/xtaci/smux) | v1.5.56 | MIT |
| [gitlab.com/yawning/edwards25519-extra](https://gitlab.com/yawning/edwards25519-extra) | v0.0.0-20231005122941-2149dcafc266 | BSD-3-Clause |
| [gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/goptlib](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/goptlib) | v1.6.0 | CC0-1.0 |
| [gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/lyrebird](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/lyrebird) | v0.0.0-20261006105937-89d54872b176 | BSD-2-Clause AND BSD-3-Clause AND GPL-3.0-or-later |
| [gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/ptutil](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/ptutil) | v0.0.0-20250815012447-418f76dcf315 | BSD-3-Clause |
| [gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake/v2](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/snowflake) | v2.14.1 | BSD-3-Clause |
| [gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel](https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/webtunnel) | v0.0.7 | MIT |
| [golang.org/x/crypto](https://pkg.go.dev/golang.org/x/crypto) | v0.57.0 | BSD-3-Clause |
| [golang.org/x/mod](https://pkg.go.dev/golang.org/x/mod) | v0.41.0 | BSD-3-Clause |
| [golang.org/x/net](https://pkg.go.dev/golang.org/x/net) | v0.59.0 | BSD-3-Clause |
| [golang.org/x/sync](https://pkg.go.dev/golang.org/x/sync) | v0.23.0 | BSD-3-Clause |
| [golang.org/x/sys](https://pkg.go.dev/golang.org/x/sys) | v0.48.0 | BSD-3-Clause |
| [golang.org/x/text](https://pkg.go.dev/golang.org/x/text) | v0.42.0 | BSD-3-Clause |
| [golang.org/x/time](https://pkg.go.dev/golang.org/x/time) | v0.10.0 | BSD-3-Clause |
| [golang.org/x/tools](https://pkg.go.dev/golang.org/x/tools) | v0.49.0 | BSD-3-Clause |

### Android libraries

Libraries that Erevos's own Android code declares (`group:name`). React Native and Expo also bring Google's AndroidX libraries (Apache-2.0) when the Android app is built. React Native WebRTC brings the WebRTC library (BSD-3-Clause, built by Jitsi) and React Native Quick Crypto brings OpenSSL (Apache-2.0). 17 libraries.

| Library | Version | Licence |
| --- | --- | --- |
| [androidx.camera:camera-camera2](https://developer.android.com/jetpack/androidx/releases/camera) | 1.6.0 | Apache-2.0 |
| [androidx.camera:camera-core](https://developer.android.com/jetpack/androidx/releases/camera) | 1.6.0 | Apache-2.0 |
| [androidx.camera:camera-extensions](https://developer.android.com/jetpack/androidx/releases/camera) | 1.6.0 | Apache-2.0 |
| [androidx.camera:camera-lifecycle](https://developer.android.com/jetpack/androidx/releases/camera) | 1.6.0 | Apache-2.0 |
| [androidx.camera:camera-video](https://developer.android.com/jetpack/androidx/releases/camera) | 1.6.0 | Apache-2.0 |
| [androidx.camera:camera-view](https://developer.android.com/jetpack/androidx/releases/camera) | 1.6.0 | Apache-2.0 |
| [androidx.media3:media3-exoplayer](https://github.com/androidx/media) | 1.8.0 | Apache-2.0 |
| [androidx.media3:media3-exoplayer-hls](https://github.com/androidx/media) | 1.8.0 | Apache-2.0 |
| [androidx.media3:media3-session](https://github.com/androidx/media) | 1.8.0 | Apache-2.0 |
| [androidx.media3:media3-ui](https://github.com/androidx/media) | 1.8.0 | Apache-2.0 |
| androidx.webkit:webkit | 1.12.1 | see its source |
| [com.google.zxing:core](https://github.com/zxing/zxing) | 3.5.3 | Apache-2.0 |
| [com.googlecode.libphonenumber:geocoder](https://github.com/google/libphonenumber) | 3.43 | Apache-2.0 |
| [com.googlecode.libphonenumber:libphonenumber](https://github.com/google/libphonenumber) | 9.0.43 | Apache-2.0 |
| org.jetbrains.kotlinx:kotlinx-coroutines-android | 1.9.0 | see its source |
| org.jitsi:webrtc | 155.+ | see its source |
| org.sessionfoundation:libsession-util-android | 1.1.0-58-gc5c6c89 | see its source |

<!-- generated:end -->

## Keeping this list

After adding or updating a dependency, run `node scripts/credits.mjs` and commit the change to this file with it. `npm run check` in `app/` fails until the list matches the lockfiles (`node scripts/credits.mjs --check` says what differs). Main parts and Other works are written by hand: add a project there when it deserves a line of its own, and a work that is copied in rather than installed always does.
