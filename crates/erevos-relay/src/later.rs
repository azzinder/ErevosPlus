// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! Requests held for later (`LATER`, see `server.rs`): a phone's message sent
//! for later is handed to the relay with the time it should go, so it goes
//! then though the phone is off by then. Each is a whole `SEND`, `FORWARD` or
//! `SEALED_SEND` request, already end-to-end encrypted, kept with its time
//! and a random 16-byte id from the phone, which may drop it before then
//! (`UNLATER`). The relay sees when each goes, as it would see it come then;
//! it learns nothing more than a message sent then would tell it. A request
//! held on a phone's own token (see `tokens.rs`) goes only while that phone
//! still has its line: `server.rs` keeps in memory which phone held it, as
//! the connection that brought it said, and nothing of that on disk, so one
//! held before a restart goes whatever became of the line since.
//!
//! The relay runs each request at its time, as if it came then. One that
//! cannot go then (the other relay is down, the queue is full) is tried again
//! later, waiting longer each time, until `ttl` after its time, as a message
//! nobody takes expires; one whose queue is gone is dropped. Requests for the
//! same time go in the order they came, so the packets of one voice message
//! stay in order.
//!
//! With a folder, each request is a file named by its id in hex: its time
//! (8-byte Unix seconds), its place in the order (8 bytes), then the request.
//! It is written as a `.part` file first and renamed once whole, as chunks
//! are (see `files.rs`); `.part` files left over are removed when the store
//! opens. Without a folder, requests live in memory and are lost when the
//! relay stops.
//!
//! Not audited.

use std::collections::{BTreeMap, HashMap};
use std::fs::{self, File, OpenOptions};
use std::io::{self, ErrorKind, Read, Write};
use std::path::{Path, PathBuf};

use crate::journal;
use crate::queue::{system_now, DEFAULT_TTL};

pub type HeldId = [u8; 16];

/// Requests the relay holds at most, so phones cannot fill it.
pub const MAX_HELD: usize = 10_000;

/// Bytes all held requests may take together.
pub const HELD_CAP: u64 = 256 << 20;

/// How far ahead a request may be held: a year and a little, as a message
/// can be sent for later up to a year ahead.
pub const MAX_AHEAD: u64 = 400 * 24 * 60 * 60;

/// The first wait before a request that could not go is tried again, and the
/// longest, seconds.
const FIRST_RETRY: u64 = 60;
const LONGEST_RETRY: u64 = 60 * 60;

const PART: &str = ".part";

#[derive(Debug, PartialEq, Eq)]
pub enum HeldError {
    /// The relay holds `MAX_HELD` requests or `HELD_CAP` bytes already.
    Full,
    /// The request could not be written to the folder, so nothing changed.
    Storage,
}

/// A request whose time came, to run now.
pub struct Due {
    pub id: HeldId,
    pub request: Vec<u8>,
}

struct Item {
    id: HeldId,
    /// When it should go, Unix seconds.
    at: u64,
    request: Vec<u8>,
    tries: u32,
}

/// Makes the removal of the file at `path` itself durable, so a request
/// taken back or gone does not come back after a power cut. One that could
/// not be made so is said.
fn gone_for_good(path: &Path) {
    if let Err(e) = journal::sync_dir(path) {
        elog!("erevos-relay: a request removed may come back after a power cut: {e}");
    }
}

pub struct Held {
    dir: Option<PathBuf>,
    /// By when to run next and the order they came.
    items: BTreeMap<(u64, u64), Item>,
    by_id: HashMap<HeldId, (u64, u64)>,
    /// Taken out to run, and not back yet.
    running: HashMap<HeldId, Item>,
    order: u64,
    used: u64,
    ttl: u64,
    clock: fn() -> u64,
}

impl Default for Held {
    fn default() -> Self {
        Held::in_memory(DEFAULT_TTL)
    }
}

fn hex(id: &HeldId) -> String {
    id.iter().map(|b| format!("{b:02x}")).collect()
}

fn from_hex(name: &str) -> Option<HeldId> {
    if name.len() != 32
        || !name
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return None;
    }
    let mut id = [0u8; 16];
    for (i, byte) in id.iter_mut().enumerate() {
        *byte = u8::from_str_radix(&name[i * 2..i * 2 + 2], 16).ok()?;
    }
    Some(id)
}

fn storage(e: io::Error) -> HeldError {
    elog!("erevos-relay: cannot use the folder of requests held for later: {e}");
    HeldError::Storage
}

impl Held {
    /// Requests kept in memory, tried until `ttl` seconds after their time.
    pub fn in_memory(ttl: u64) -> Held {
        Held {
            dir: None,
            items: BTreeMap::new(),
            by_id: HashMap::new(),
            running: HashMap::new(),
            order: 0,
            used: 0,
            ttl,
            clock: system_now,
        }
    }

    /// Opens the requests kept in the folder `dir`, making the folder if it
    /// is not there. Expired ones and unfinished writes in it are removed;
    /// files with other names are left alone.
    pub fn open(dir: &Path, ttl: u64) -> io::Result<Held> {
        Held::open_clocked(dir, ttl, system_now)
    }

    fn open_clocked(dir: &Path, ttl: u64, clock: fn() -> u64) -> io::Result<Held> {
        let mut builder = fs::DirBuilder::new();
        builder.recursive(true);
        #[cfg(unix)]
        std::os::unix::fs::DirBuilderExt::mode(&mut builder, 0o700);
        builder.create(dir)?;
        let mut held = Held {
            dir: Some(dir.to_path_buf()),
            clock,
            ..Held::in_memory(ttl)
        };
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let Some(name) = entry.file_name().to_str().map(str::to_owned) else {
                continue;
            };
            if name.ends_with(PART) && from_hex(name.trim_end_matches(PART)).is_some() {
                fs::remove_file(entry.path())?;
                continue;
            }
            let Some(id) = from_hex(&name) else {
                continue;
            };
            let mut bytes = Vec::new();
            File::open(entry.path())?.read_to_end(&mut bytes)?;
            if bytes.len() < 16 {
                fs::remove_file(entry.path())?;
                continue;
            }
            let at = u64::from_be_bytes(bytes[..8].try_into().expect("8 bytes"));
            let order = u64::from_be_bytes(bytes[8..16].try_into().expect("8 bytes"));
            if held.expired(at) {
                fs::remove_file(entry.path())?;
                continue;
            }
            held.order = held.order.max(order + 1);
            held.place(at, order, id, bytes[16..].to_vec(), 0);
        }
        Ok(held)
    }

    fn expired(&self, at: u64) -> bool {
        at.saturating_add(self.ttl) <= (self.clock)()
    }

    fn path(&self, id: &HeldId) -> Option<PathBuf> {
        self.dir.as_ref().map(|dir| dir.join(hex(id)))
    }

    fn place(&mut self, next: u64, order: u64, id: HeldId, request: Vec<u8>, tries: u32) {
        self.used += request.len() as u64;
        self.by_id.insert(id, (next, order));
        let at = next;
        self.items.insert(
            (next, order),
            Item {
                id,
                at,
                request,
                tries,
            },
        );
    }

    /// How many requests it holds.
    pub fn len(&self) -> usize {
        self.items.len() + self.running.len()
    }

    /// Whether it holds the request with `id`, waiting or running.
    pub fn holds(&self, id: &HeldId) -> bool {
        self.by_id.contains_key(id) || self.running.contains_key(id)
    }

    /// Holds `request` to run at `at` (Unix seconds). One with an id it
    /// holds already is taken as given again, and changes nothing.
    pub fn hold(&mut self, id: HeldId, at: u64, request: Vec<u8>) -> Result<(), HeldError> {
        if self.by_id.contains_key(&id) || self.running.contains_key(&id) {
            return Ok(());
        }
        let size = request.len() as u64;
        if self.len() >= MAX_HELD || self.used + size > HELD_CAP {
            return Err(HeldError::Full);
        }
        let order = self.order;
        if let Some(path) = self.path(&id) {
            write_request(&path, at, order, &request).map_err(storage)?;
        }
        self.order += 1;
        self.place(at, order, id, request, 0);
        Ok(())
    }

    /// Drops the request with `id`. False if it holds none: it went, is
    /// going now, or never came.
    pub fn drop_held(&mut self, id: &HeldId) -> Result<bool, HeldError> {
        let Some(key) = self.by_id.get(id).copied() else {
            return Ok(false);
        };
        if let Some(path) = self.path(id) {
            match fs::remove_file(&path) {
                Ok(()) => gone_for_good(&path),
                Err(e) if e.kind() == ErrorKind::NotFound => {}
                Err(e) => return Err(storage(e)),
            }
        }
        self.by_id.remove(id);
        if let Some(item) = self.items.remove(&key) {
            self.used -= item.request.len() as u64;
        }
        Ok(true)
    }

    /// When the next request should run, Unix seconds, if it holds any.
    pub fn next(&self) -> Option<u64> {
        self.items.keys().next().map(|(at, _)| *at)
    }

    /// Takes out the requests whose time came, in order, to run. Each is
    /// then `went` or `failed`.
    pub fn take_due(&mut self) -> Vec<Due> {
        let now = (self.clock)();
        let mut due = Vec::new();
        while let Some((&(next, order), _)) = self.items.iter().next() {
            if next > now {
                break;
            }
            let item = self.items.remove(&(next, order)).expect("the first item");
            self.by_id.remove(&item.id);
            due.push(Due {
                id: item.id,
                request: item.request.clone(),
            });
            self.running.insert(item.id, item);
        }
        due
    }

    /// A request taken out went, or never will (its queue is gone): it is
    /// forgotten.
    pub fn went(&mut self, id: &HeldId) {
        let Some(item) = self.running.remove(id) else {
            return;
        };
        self.used -= item.request.len() as u64;
        if let Some(path) = self.path(id) {
            match fs::remove_file(&path) {
                Ok(()) => gone_for_good(&path),
                Err(e) if e.kind() == ErrorKind::NotFound => {}
                // Run again after a restart, the other phone takes it as one it has.
                Err(e) => elog!("erevos-relay: cannot remove a request that went: {e}"),
            }
        }
    }

    /// A request taken out could not go now: it is tried again later, or
    /// forgotten once it expired.
    pub fn failed(&mut self, id: &HeldId) {
        let Some(item) = self.running.remove(id) else {
            return;
        };
        if self.expired(item.at) {
            self.running.insert(*id, item);
            self.went(id);
            return;
        }
        let tries = item.tries + 1;
        let wait = FIRST_RETRY
            .saturating_mul(1 << tries.min(16).saturating_sub(1))
            .min(LONGEST_RETRY);
        let next = (self.clock)() + wait;
        let order = self.order;
        self.order += 1;
        // Its bytes were still counted while it ran: `went` is what takes them off.
        self.by_id.insert(*id, (next, order));
        self.items.insert((next, order), Item { tries, ..item });
    }
}

/// Writes the request after its time and order to a `.part` file, then puts
/// it in place.
fn write_request(path: &Path, at: u64, order: u64, request: &[u8]) -> io::Result<()> {
    let mut part = path.as_os_str().to_owned();
    part.push(PART);
    let part = PathBuf::from(part);
    let written = (|| {
        let mut options = OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        std::os::unix::fs::OpenOptionsExt::mode(&mut options, 0o600);
        let mut file = options.open(&part)?;
        file.write_all(&at.to_be_bytes())?;
        file.write_all(&order.to_be_bytes())?;
        file.write_all(request)?;
        file.sync_all()?;
        drop(file);
        fs::rename(&part, path)?;
        journal::sync_dir(path)
    })();
    if written.is_err() {
        let _ = fs::remove_file(&part);
    }
    written
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::Cell;

    // Each test runs on its own thread, so each has its own clock.
    thread_local! {
        static NOW: Cell<u64> = const { Cell::new(1_000_000) };
    }

    fn clock() -> u64 {
        NOW.with(Cell::get)
    }

    fn wait(seconds: u64) {
        NOW.with(|now| now.set(now.get() + seconds));
    }

    fn folder(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("erevos-held-{name}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        dir
    }

    fn id(n: u8) -> HeldId {
        [n; 16]
    }

    #[test]
    fn requests_run_at_their_time_in_the_order_they_came() {
        let start = clock();
        let mut held = Held::in_memory(DEFAULT_TTL);
        held.clock = clock;
        held.hold(id(1), start + 20, b"b".to_vec()).unwrap();
        held.hold(id(2), start + 10, b"a".to_vec()).unwrap();
        held.hold(id(3), start + 20, b"c".to_vec()).unwrap();
        assert!(held.take_due().is_empty());
        assert_eq!(held.next(), Some(start + 10));
        wait(25);
        let due: Vec<Vec<u8>> = held.take_due().into_iter().map(|d| d.request).collect();
        assert_eq!(due, vec![b"a".to_vec(), b"b".to_vec(), b"c".to_vec()]);
        assert_eq!(held.len(), 3);
        for n in 1..=3 {
            held.went(&id(n));
        }
        assert_eq!(held.len(), 0);
        assert_eq!(held.used, 0);
    }

    #[test]
    fn a_request_is_dropped_before_its_time_but_not_after() {
        let start = clock();
        let mut held = Held::in_memory(DEFAULT_TTL);
        held.clock = clock;
        held.hold(id(1), start + 5, b"x".to_vec()).unwrap();
        held.hold(id(2), start + 5, b"y".to_vec()).unwrap();
        assert_eq!(held.drop_held(&id(1)), Ok(true));
        assert_eq!(held.drop_held(&id(1)), Ok(false));
        wait(10);
        let due = held.take_due();
        assert_eq!(due.len(), 1);
        assert_eq!(held.drop_held(&id(2)), Ok(false));
    }

    #[test]
    fn the_same_id_again_changes_nothing() {
        let start = clock();
        let mut held = Held::in_memory(DEFAULT_TTL);
        held.clock = clock;
        held.hold(id(1), start + 5, b"x".to_vec()).unwrap();
        held.hold(id(1), start + 50, b"other".to_vec()).unwrap();
        assert_eq!(held.len(), 1);
        assert_eq!(held.next(), Some(start + 5));
    }

    #[test]
    fn one_that_cannot_go_is_tried_again_until_it_expires() {
        let start = clock();
        let mut held = Held::in_memory(100);
        held.clock = clock;
        held.hold(id(1), start, b"x".to_vec()).unwrap();
        assert_eq!(held.take_due().len(), 1);
        held.failed(&id(1));
        assert_eq!(held.next(), Some(start + FIRST_RETRY));
        assert!(held.take_due().is_empty());
        wait(FIRST_RETRY);
        assert_eq!(held.take_due().len(), 1);
        held.failed(&id(1));
        assert_eq!(held.next(), Some(clock() + 2 * FIRST_RETRY));
        wait(2 * FIRST_RETRY);
        assert_eq!(held.take_due().len(), 1);
        // Past its time and the ttl: forgotten.
        held.failed(&id(1));
        assert_eq!(held.len(), 0);
    }

    #[test]
    fn one_tried_again_counts_its_bytes_once() {
        let start = clock();
        let mut held = Held::in_memory(100);
        held.clock = clock;
        held.hold(id(1), start, b"four".to_vec()).unwrap();
        assert_eq!(held.used, 4);
        assert_eq!(held.take_due().len(), 1);
        assert_eq!(held.used, 4);
        held.failed(&id(1));
        assert_eq!(held.used, 4);
        wait(FIRST_RETRY);
        assert_eq!(held.take_due().len(), 1);
        held.went(&id(1));
        assert_eq!(held.used, 0);
    }

    #[test]
    fn too_many_bytes_are_refused() {
        let mut held = Held::in_memory(DEFAULT_TTL);
        held.used = HELD_CAP - 1;
        assert_eq!(held.hold(id(1), 1, vec![0; 2]), Err(HeldError::Full));
    }

    // Regression: acknowledgement of a scheduled SEND and removal of its
    // held file are separate durable operations. A restart in between can
    // repeat the same encrypted payload; consumers must be replay-safe.
    #[test]
    fn restart_between_send_and_went_can_deliver_the_same_payload_twice() {
        let root = folder("scheduled-send-crash-window");
        let held_dir = root.join("held");
        let journal_path = root.join("queues.journal");
        let start = clock();
        let queue = {
            let mut held = Held::open_clocked(&held_dir, DEFAULT_TTL, clock).unwrap();
            let mut store = crate::queue::Store::open(&journal_path).unwrap();
            let queue = store.create().unwrap();
            held.hold(id(7), start, b"ciphertext".to_vec()).unwrap();
            let due = held.take_due();
            assert_eq!(due.len(), 1);
            store.send(&queue.sender_id, due[0].request.clone()).unwrap();
            // Simulate process death after journaled SEND, before held.went().
            // Neither `held` nor `store` writes a shutdown marker here.
            queue
        };
        let mut store = crate::queue::Store::open(&journal_path).unwrap();
        let mut held = Held::open_clocked(&held_dir, DEFAULT_TTL, clock).unwrap();
        let due = held.take_due();
        assert_eq!(due.len(), 1, "still-present held file is retried");
        store.send(&queue.sender_id, due[0].request.clone()).unwrap();
        held.went(&id(7));
        assert_eq!(store.receive(&queue.recipient_id).unwrap().unwrap(), b"ciphertext");
        assert_eq!(store.receive(&queue.recipient_id).unwrap().unwrap(), b"ciphertext");
        assert_eq!(store.receive(&queue.recipient_id).unwrap(), None);
        drop(held);
        drop(store);
        let _ = fs::remove_dir_all(&root);
    }

    // Failure injection via the actual filesystem, not a mock: a path
    // collision at the temporary write target must not mutate the index.
    #[test]
    fn blocked_partial_write_does_not_create_a_scheduled_request() {
        let dir = folder("blocked-part");
        let mut held = Held::open_clocked(&dir, DEFAULT_TTL, clock).unwrap();
        let part = dir.join(format!("{}{PART}", hex(&id(9))));
        fs::create_dir(&part).unwrap();
        let before = held.used;
        assert_eq!(held.hold(id(9), clock() + 5, b"x".to_vec()), Err(HeldError::Storage));
        assert_eq!(held.used, before);
        assert!(!held.holds(&id(9)));
        assert_eq!(held.next(), None);
        drop(held);
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn requests_survive_a_restart_and_go_once_they_went() {
        let dir = folder("restart");
        let start = clock();
        {
            let mut held = Held::open_clocked(&dir, DEFAULT_TTL, clock).unwrap();
            held.hold(id(1), start + 10, b"first".to_vec()).unwrap();
            held.hold(id(2), start + 10, b"second".to_vec()).unwrap();
            held.hold(id(3), start + 10, b"dropped".to_vec()).unwrap();
            held.drop_held(&id(3)).unwrap();
        }
        fs::write(dir.join(format!("{}{PART}", hex(&id(9)))), b"half").unwrap();
        fs::write(dir.join("other"), b"left alone").unwrap();
        let mut held = Held::open_clocked(&dir, DEFAULT_TTL, clock).unwrap();
        assert_eq!(held.len(), 2);
        assert!(!dir.join(format!("{}{PART}", hex(&id(9)))).exists());
        assert!(dir.join("other").exists());
        wait(10);
        let due = held.take_due();
        assert_eq!(
            due.iter().map(|d| d.request.clone()).collect::<Vec<_>>(),
            vec![b"first".to_vec(), b"second".to_vec()]
        );
        held.went(&id(1));
        held.hold(id(4), clock() + 5, b"after".to_vec()).unwrap();
        drop(held);
        let held = Held::open_clocked(&dir, DEFAULT_TTL, clock).unwrap();
        // The second was taken out but never went: it is held again, before the new one.
        assert_eq!(held.len(), 2);
        assert!(held.by_id.contains_key(&id(2)));
        let _ = fs::remove_dir_all(&dir);
    }
}
