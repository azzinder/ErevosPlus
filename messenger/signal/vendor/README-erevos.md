<!--
SPDX-FileCopyrightText: 2026 azzinder
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# libsignal-service-rs, vendored

`libsignal-service-rs/` is [libsignal-service-rs](https://github.com/whisperfish/libsignal-service-rs)
(AGPL-3.0) at commit `7a7526741dfd9ad4c4894717f22651eb0506fb7e`, the one presage `4b81740` uses,
taken in by `[patch]` in `../Cargo.toml`. Left out: `.github/` and `rust-toolchain`. Changed, only so
that Signal can go through Erevos's Tor (each change is marked `Erevos:`):

- `src/proxy.rs` (new): `set_proxy(Some("socks5h://user:pass@127.0.0.1:port"))`, or `None` for direct.
- `src/push_service/mod.rs`: the one HTTP client (REST, the message websocket, attachments, groups,
  profiles) goes through that proxy, else direct with `no_proxy()`, never the process's proxy variables.
- `src/websocket/directory.rs`: contact discovery by phone number (CDSI, libsignal-net) goes through it too.
- `Cargo.toml`: reqwest's `socks` feature.

When presage moves to a newer libsignal-service-rs, take that commit again and make the same changes.

# presage, vendored

`presage/` is presage's own crate (AGPL-3.0) at commit `4b81740`, also taken in by `[patch]`, changed
only where marked `Erevos:` in `src/manager/registered.rs`: link previews are fetched through the same
proxy (else direct), `drop_connections()` lets the kept websockets go when the proxy changes, and
`send_read_sync()` tells the account's other devices what was read here, and `send_message_signed()`
adds our PNI signature for someone who wrote to our phone number (presage issue 252). Its
`reqwest` takes `socks` instead of `system-proxy`; its tests and dev-dependencies are left out.

# libsqlite3-sys and sqlcipher-crypto-provider, vendored

`libsqlite3-sys/` and `sqlcipher-crypto-provider/` are from the rusqlite fork presage uses,
[whisperfish/rusqlite](https://github.com/whisperfish/rusqlite) (MIT, see each `LICENSE`) at commit
`2a42b3354c9194700d08aa070f70a131a470e7dc`, taken in by `[patch]` in `../Cargo.toml`. Changed only so
that it builds for Android: in `libsqlite3-sys/src/sqlcipher_custom_crypto.rs` the three functions
that hand SQLCipher a name (`get_provider_name`, `get_cipher`, `get_provider_version`) return
`*const c_char` instead of `*const i8`; on arm64 Android `c_char` is unsigned. Left out: the
crates' `README.md`. Both bundled sources stay: the app uses SQLCipher, while sqlx's macros build
plain SQLite on the build machine.

When presage moves to a newer revision, check whether the fork has the fix and drop these copies if so.
