// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

//! Signal for the Erevos messenger app.
//!
//! The same shape as the Messenger engine (core/, Go): one call, `call(op, json) → json`,
//! and events sent to a listener as JSON. The screens therefore show Signal chats with the
//! same code as Messenger chats. Underneath is presage, which builds on Signal's own
//! libsignal; the account, keys and messages are kept in an SQLCipher database on the phone,
//! its key held by the Android Keystore (the app passes it in, sealed there).
//!
//! Chats and people get numeric keys, as Messenger's: a Signal chat's key is negative
//! (see [keys]), so the app can tell which engine a chat belongs to.

pub mod calls;
pub mod engine;
pub mod events;
pub mod groups;
pub mod keys;

#[cfg(target_os = "android")]
mod android;

use std::sync::OnceLock;

/// Where events go: the app's listener, or a test's.
pub trait Listener: Send + Sync {
    fn on_event(&self, json: String);
}

static RUNTIME: OnceLock<tokio::runtime::Runtime> = OnceLock::new();

/// One runtime for the whole library, with a few worker threads.
pub fn runtime() -> &'static tokio::runtime::Runtime {
    RUNTIME.get_or_init(|| {
        tokio::runtime::Builder::new_multi_thread()
            .worker_threads(2)
            .thread_name("erevos-signal")
            .enable_all()
            .build()
            .expect("tokio runtime")
    })
}
