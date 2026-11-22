// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

//! Numeric keys for Signal chats, people and polls, and message ids.
//!
//! Messenger's keys are positive. Signal's are negative, in [-2^62, -1]; Session's will be
//! below that, in [-2^63, -2^62 - 1]. A key is the first 8 bytes of a SHA-256 of what it
//! stands for, so it is the same on every start and needs no table on disk.

use sha2::{Digest, Sha256};
use uuid::Uuid;

const MASK62: u64 = (1u64 << 62) - 1;

fn hashed(tag: &[u8], bytes: &[u8]) -> u64 {
    let mut h = Sha256::new();
    h.update(tag);
    h.update(bytes);
    let d = h.finalize();
    u64::from_be_bytes(d[..8].try_into().expect("8 bytes"))
}

fn signal_key(tag: &[u8], bytes: &[u8]) -> i64 {
    -1 - (hashed(tag, bytes) & MASK62) as i64
}

/// A person, and their one-to-one chat (the same number).
pub fn person(uuid: &Uuid) -> i64 {
    signal_key(b"erevos-signal-person", uuid.as_bytes())
}

/// A group, by its master key.
pub fn group(master_key: &[u8; 32]) -> i64 {
    signal_key(b"erevos-signal-group", master_key)
}

/// A poll, by the id of the message that started it.
pub fn poll(message_id: &str) -> i64 {
    signal_key(b"erevos-signal-poll", message_id.as_bytes())
}

/// Whether a key is a Signal one.
pub fn is_signal(key: i64) -> bool {
    key < 0 && key >= -(1i64 << 62)
}

/// A message is known by who wrote it and when (the sender's timestamp), as Signal itself
/// addresses messages for replies, reactions and deletes.
pub fn message_id(timestamp: u64, author: &Uuid) -> String {
    format!("sg:{timestamp}:{author}")
}

/// The timestamp and author of a message id made by [message_id].
pub fn parse_message_id(id: &str) -> Option<(u64, Uuid)> {
    let rest = id.strip_prefix("sg:")?;
    let (ts, author) = rest.split_once(':')?;
    Some((ts.parse().ok()?, Uuid::parse_str(author).ok()?))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keys_are_negative_and_stable() {
        let u = Uuid::parse_str("2d6c6f9e-6d1b-4f3a-9a52-0c3f1f2b9d11").unwrap();
        let k = person(&u);
        assert!(is_signal(k));
        assert_eq!(k, person(&u));
        assert!(is_signal(group(&[7u8; 32])));
        assert!(is_signal(poll("sg:1:x")));
        assert!(!is_signal(123));
        assert!(!is_signal(i64::MIN));
    }

    #[test]
    fn message_ids_round_trip() {
        let u = Uuid::parse_str("7f3a3c1e-0b55-4c55-8e0b-3c4f0d0b2a77").unwrap();
        let id = message_id(1_700_000_000_123, &u);
        assert_eq!(parse_message_id(&id), Some((1_700_000_000_123, u)));
        assert_eq!(parse_message_id("123"), None);
    }
}
