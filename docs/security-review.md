# Security review guide

A map of Erevos for someone reviewing its security. It says where each part is, which
cryptography it uses, how to build and test it, and which places most need a second look. What
Erevos means to protect, and from whom, is in [threat-model.md](threat-model.md); the features are
in the [README](../README.md). Every source file starts with a comment that says what it does and
what it trusts, so this page points to those rather than repeating them.

The exact formats, key derivations and nonce handling (PQXDH, the double ratchet, sealed packets,
the relay channel and queues, two-hop sending, MLS groups, password slots) are in
[protocol.md](protocol.md), and the state diagrams of the ratchet, conversations, the lock screen
with the panic password, hidden chats and group membership in [state-machines.md](state-machines.md).

**Not audited.** Nothing here has been checked by anyone outside the project. What an AI-assisted
review of November 2026 found, and what was fixed, is in [ai-review-2026-11.md](ai-review-2026-11.md).

## Suggested scope

A first review fits best on the parts every platform shares and every message passes through:

| Part | Where | Size (lines) | Why first |
| --- | --- | --- | --- |
| Conversation crypto | `crates/erevos-core` | ~3,200 Rust | PQXDH, double ratchet, padding, two-hop sealing. Every 1:1 message. |
| Core as the apps call it | `crates/erevos-ffi` | ~1,600 Rust | The only way JavaScript reaches the core (JNI and WebAssembly). |
| Groups | `crates/erevos-group` | ~1,200 Rust | MLS through OpenMLS, keeper-only commits, public group rules. |
| Relay | `crates/erevos-relay` | ~22,000 Rust | Faces the internet: queues, tokens, invites, OpenID Connect sign-in, files, Web Push, forwarding. |
| App protocol layer | `app/lib/e2e.ts`, `app/lib/sealed-packet.ts`, `app/lib/attachments.ts`, `app/lib/device-list.ts`, `app/lib/queue-move.ts` | TypeScript | What the app builds on top of the core: contacts, the extra sealing for the relay, files, linked devices, queue moves. |
| Storage on the device | `app/lock/` and `app/lib/crypto.ts` | TypeScript | Password slots, sealed files and pages, backups. |

This is the plain Erevos, built with `EREVOS_EDITION=erevos` (`lite` until 3.0.0) ([editions.md](editions.md)): the chats
with Matrix, XMPP and other Nostr apps (`crates/erevos-matrix`, `crates/erevos-xmpp`, the Nostr
chats) are not built into it and belong to Erevos+, outside this scope.

Left for later: Nostr (`crates/erevos-nostr`), Tor (`crates/erevos-tor`), imports
(`crates/erevos-import`), nearby radios (`app/lib/nearby.ts` and the Android modules), calls
(WebRTC), the SMS app and the desktop and Sailfish shells.

## Cryptography in use

| What | Primitive | Code |
| --- | --- | --- |
| Starting a 1:1 conversation | PQXDH: X25519 and ML-KEM-768 (FIPS 203), HKDF-SHA256, info `Erevos PQXDH v1`. One-time prekeys exist in the core but the app does not use them yet. | `crates/erevos-core/src/pqxdh.rs`, `conversation.rs` |
| Prekey bundle signature | Ed25519 (`verify_strict`), over `erevos prekey bundle v1` and every key in the bundle | `pqxdh.rs` `transcript` |
| Other signed statements (device lists) | Ed25519 over `erevos signed v1\0`, a context, `\0`, the message | `pqxdh.rs` `signed_statement` |
| Messages | Double ratchet: HKDF-SHA256 root chain, HMAC-SHA256 chain keys, ChaCha20-Poly1305 with key and nonce from HKDF of the message key. AD = both identity keys (initiator first) and the 40-byte header. `MAX_SKIP` 1000, 2000 skipped keys kept. | `ratchet.rs`, `conversation.rs` |
| Post-quantum ratchet | ML-KEM-768 epochs, keys and ciphertexts sent in 96-byte pieces in a 110-byte authenticated field of every packet; each message key mixed with its epoch's key by HKDF-SHA256. On once both sides' Erevos say they read it. Starts over in a later generation after a restore. Spec: [spqr.md](spqr.md). | `spqr.rs`, `conversation.rs` |
| Padding | ISO/IEC 7816-4 to 256, 1024, 4096 or 16384 bytes | `padding.rs` |
| Safety number | SHA-512 over `erevos safety number v1` and both X25519 identity keys, sorted; 60 digits | `conversation.rs` `safety_number` |
| Packets sealed again for the relay | AES-256-GCM, a key per contact derived from the account and the contact's identity, 16-byte HMAC mark of the nonce to find the sender | `app/lib/sealed-packet.ts` |
| Two-hop sending | X25519 to the destination relay's key, a fresh key per request, ChaCha20-Poly1305 with a zero nonce | `crates/erevos-core/src/relay_seal.rs` |
| Files | AES-256-GCM per chunk, a key per file, chunk index and length inside the sealed chunk | `app/lib/attachments.ts` |
| Groups | MLS (RFC 9420), OpenMLS 0.9, `MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519`. Not post-quantum. | `crates/erevos-group` |
| Storage and backups | PBKDF2-SHA256 200,000 rounds then Argon2id (32 MiB, 3 passes), AES-256-GCM, @noble libraries with native AES-GCM and PBKDF2 where there are | `app/lib/crypto.ts`, `app/lock/` |
| Nostr | secp256k1, BIP-340, NIP-44 v2 and NIP-59 gift wraps, written here on k256 and chacha20 | `crates/erevos-nostr` |
| Web Push | RFC 8291 (P-256 ECDH, AES-128-GCM), VAPID | `crates/erevos-relay/src/push.rs` |
| Updates and web releases | Ed25519, key kept offline on the release computer | `app/lib/update-signature.ts`, `pwa/README.md`, `deploy/web/publish.sh` |

## Places that most need a second look

These are choices made on purpose, each with its reason in the code, where a reviewer's view
would help most.

1. **No one-time prekeys in the app.** The core can make and use them (`pqxdh.rs`), but the app's
   contact links do not carry them yet. A contact link holds one bundle for good, so a relay can replay a
   first message. The app ignores first messages it has seen (the last 100, and each contact's
   last 16: `app/lib/e2e.ts`). Prekeys are renewed every 30 days inside each chat (`Contact.renew`).
2. **Two identity keys.** The account signs with Ed25519 and does Diffie-Hellman with a separate
   X25519 key. The bundle's signature does not prove that its maker holds the X25519 key it names,
   and the safety number covers only the X25519 key. Bundles used to check signed statements are
   taken only from inside a conversation (`PrekeyBundle::verify_signed`).
3. **Ratchet headers in the clear** on a conversation's first packets, before the extra sealing
   for the relay starts (`app/lib/sealed-packet.ts`).
4. **Restoring a backup** skips 900 sending keys per conversation so that no message key and nonce
   is used twice (`RESTORE_SKIP`). More than 900 messages sent between backup and restore would
   meet used keys.
5. **Zero nonce** in two-hop sealing, safe only while every request uses a new X25519 key
   (`relay_seal.rs`). The sender refuses a non-contributory X25519 result; the relay's
   `RelayKey::open` does not check it.
6. **Secrets in JavaScript memory.** The core keeps nothing between calls; the app holds the
   conversations' state in JavaScript between them, where it cannot be wiped.
7. **Groups**: only the keeper commits; a member's keys are made new by the keeper removing and
   adding it each week; public groups carry their rules in a group context extension.
8. **Linked devices**: the phone signs a list of four endpoints that contacts then write to
   ([multi-device.md](multi-device.md), [linked-devices.md](linked-devices.md)).
9. **The relay's paths without a token** (`/sealed`, `/files`, `/join`), the OpenID Connect
   sign-in (`signin.rs`), invites (`invites.rs`) and forwarding to other hosts (`peers.rs`).
10. **The hidden spaces**: slots and pages are meant to look the same used or not
    (`app/lock/sealed-file.ts`, `app/lock/history.ts`); timing and file changes may still tell.

## Build and test

Everything runs on Linux. The Rust crates:

    cargo test --workspace

The app's checks (73 files in `app/checks/`) run the real core in WebAssembly against real
relays. They need Node 22, Rust with the `wasm32-unknown-unknown` target, and wasm-bindgen-cli
0.2.129:

    cd app
    npm ci
    npm run typecheck
    node checks/build-core.mjs
    cargo build -p erevos-relay
    npm run check

A relay to try things against, on this machine:

    cargo run -p erevos-relay -- 127.0.0.1:7878 127.0.0.1:7879

Its settings are all environment variables, listed at the top of
`crates/erevos-relay/src/main.rs`; its protocol, request by request, at the top of
`crates/erevos-relay/src/server.rs`. The desktop app (Electron, the same app with the core in
WebAssembly) is the quickest way to run two clients side by side; see the README's Build section.

CI runs `cargo audit` and `npm audit` on every push to main (`.github/workflows/rust.yml`,
`app.yml`). Known advisories that are ignored, and why, are in `.cargo/audit.toml`.
