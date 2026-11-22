// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

//! The engine opens an encrypted database, reports no account, and refuses what needs one.

use std::sync::{Arc, Mutex};

use erevos_signal::engine::Engine;
use erevos_signal::Listener;

struct Events(Mutex<Vec<String>>);

impl Listener for Events {
    fn on_event(&self, json: String) {
        self.0.lock().unwrap().push(json);
    }
}

#[test]
fn opens_an_encrypted_store_without_an_account() {
    let dir = std::env::temp_dir().join(format!("erevos-signal-test-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    let engine = Engine::new(dir.clone(), Arc::new(Events(Mutex::new(Vec::new()))));

    assert!(engine.call("open", r#"{"key":"short"}"#).contains("error"));
    let key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    let opened = engine.call("open", &format!(r#"{{"key":"{key}"}}"#));
    assert_eq!(opened, r#"{"ok":{"registered":false}}"#, "{opened}");
    assert_eq!(engine.call("loggedIn", ""), r#"{"ok":false}"#);
    assert!(engine.call("start", "").contains("not signed in"));
    assert!(engine.call("nope", "").contains("unknown op"));

    // The file on disk is not plain SQLite.
    let head = std::fs::read(dir.join("signal.db")).unwrap();
    assert!(!head.starts_with(b"SQLite format 3"));
    let _ = std::fs::remove_dir_all(&dir);
}

/// Reaches Signal's servers and gets a link address (nothing is linked: no phone scans it).
/// Needs the network, so it runs only when asked: `cargo test -- --ignored`.
#[test]
#[ignore]
fn gets_a_link_address_from_signal() {
    let dir = std::env::temp_dir().join(format!("erevos-signal-link-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    let events = Arc::new(Events(Mutex::new(Vec::new())));
    let engine = Engine::new(dir.clone(), events.clone());
    let key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    engine.call("open", &format!(r#"{{"key":"{key}"}}"#));
    assert_eq!(engine.call("link", r#"{"name":"test"}"#), r#"{"ok":true}"#);
    let mut url = None;
    for _ in 0..60 {
        std::thread::sleep(std::time::Duration::from_millis(500));
        let seen = events.0.lock().unwrap().clone();
        if let Some(e) = seen.iter().find(|e| e.contains("signalLink")) {
            url = Some(e.clone());
            break;
        }
    }
    let url = url.expect("no link address in 30 s");
    assert!(url.contains("sgnl://linkdevice"), "{url}");
    let _ = std::fs::remove_dir_all(&dir);
}
