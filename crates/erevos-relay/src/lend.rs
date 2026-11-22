// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! Places lent on this relay to phones that have no relay of their own.
//!
//! Off unless the operator turns it on (`EREVOS_RELAY_LEND=on`, which also
//! needs a relay key). A phone with the relay's token asks for a ticket
//! (`LEND`) and puts it in its contact link. A phone with no relay that adds
//! that contact gives the ticket where a token goes and asks for a place
//! (`BORROW`): a queue, and a token of its own for it from then on (a lent
//! token). With a lent token a phone uses its queue as one with the relay's
//! token does, with less allowed: it cannot have the relay connect anywhere
//! (`FORWARD`, `FILE_VIA`, `LATER`), take credentials for the call relay, or
//! lend on. It sends to contacts on other relays straight to their `/sealed`
//! path and takes their files from their `/files` path. Each lent token may
//! make `MAX_QUEUES` more queues and put `MAX_FILE_BYTES` of files a day.
//!
//! Neither tickets nor lent tokens are written down: each carries a code, an
//! HMAC-SHA256 cut to 16 bytes, keyed with a secret drawn from the relay's key
//! (`EREVOS_RELAY_KEY`). So they last across restarts, and a new key takes
//! them all back. A ticket lasts `TICKET_DAYS` and gives at most `MAX_BORROWS`
//! places. How many places each ticket gave, and what each lent token made
//! and put today, are kept in a small file beside the key (`open`), written
//! whole on every change, so a restart does not start the counts again.
//!
//! The operator can take back one ticket without a new key: its nonce goes on
//! a line of its own in the file of revoked tickets (`Revoked`). That ticket
//! takes no more places, and every lent token it gave is refused from the next
//! connection on, since a lent token carries its ticket's nonce. The queues
//! those places made stay until they expire unused (see `queue.rs`).
//!
//! Their text, which goes where a token goes:
//! - a ticket: `ticket.` and, in hex, when it expires (8 bytes, Unix
//!   seconds), a random nonce (16 bytes) and the code (16 bytes). A contact
//!   link carries it whole as its `lend=` parameter, so the ticket's nonce is
//!   the 32 hex characters after the first 16 there;
//! - a lent token: `lent.` and, in hex, the nonce of the ticket it came with
//!   (16 bytes), a random nonce of its own (16 bytes) and the code (16 bytes).

use std::collections::{HashMap, HashSet};
use std::fs;
use std::io::{self, ErrorKind};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::SystemTime;

use hmac::{Hmac, Mac};
use rand::RngCore;
use sha2::Sha256;

use erevos_core::relay_seal::RelayKey;

use crate::journal;
use crate::lock::lock;

pub type Nonce = [u8; 16];

/// How long a ticket lasts, days.
pub const TICKET_DAYS: u64 = 30;
/// Places one ticket gives.
pub const MAX_BORROWS: u32 = 4;
/// Queues a lent token may make a day, besides the one it came with.
pub const MAX_QUEUES: u32 = 4;
/// Bytes of files a lent token may put a day: a few photos and voice
/// messages, not the relay's whole file store.
pub const MAX_FILE_BYTES: u64 = 50 << 20;
/// Most tickets, and most lent tokens, counted at once, so the counts cannot
/// fill the relay's memory. Past it, new ones are refused until old ones go.
const MAX_COUNTED: usize = 100_000;
const DAY: u64 = 24 * 60 * 60;
const TICKET: &str = "ticket.";
const LENT: &str = "lent.";
const CODE_LEN: usize = 16;
// What a code is for, so a ticket's cannot serve as a lent token's.
const FOR_TICKET: u8 = 1;
const FOR_LENT: u8 = 2;
/// The first bytes of the file of counts, so the relay never reads or
/// overwrites a file that is something else.
const COUNTS_HEADER: &[u8; 8] = b"EREVOSL1";
/// What the locks here are called if one is poisoned (see `lock.rs`).
const COUNTS_LOCK: &str = "lock of the counts of lent places";
const REVOKED_LOCK: &str = "lock of the revoked tickets";

/// Whether lending is on, from the value of `EREVOS_RELAY_LEND`: `on` turns
/// it on; unset, empty or `off` leaves it off. Anything else is an error.
pub fn wanted(setting: Option<&str>) -> Result<bool, String> {
    match setting {
        Some("on") => Ok(true),
        None | Some("" | "off") => Ok(false),
        Some(other) => Err(format!(
            "EREVOS_RELAY_LEND must be on or off, not {other:?}"
        )),
    }
}

/// What a ticket or a lent token lets a connection do.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Pass {
    /// A ticket that expires at `expires` (Unix seconds): `BORROW` only.
    Ticket { nonce: Nonce, expires: u64 },
    /// A lent token, by its own nonce.
    Lent(Nonce),
}

#[derive(Default, Debug, Clone, PartialEq, Eq)]
struct Counts {
    /// Places each ticket gave, with when it expires.
    borrowed: HashMap<Nonce, (u64, u32)>,
    /// The day `made` counts (days since 1970).
    day: u64,
    /// Queues made and bytes of files put that day, by lent token.
    made: HashMap<Nonce, (u32, u64)>,
}

impl Counts {
    /// Counts `queues` more queues and `bytes` more of files for the lent
    /// token `nonce` in `made`, if that stays within a day's.
    fn add(made: &mut HashMap<Nonce, (u32, u64)>, nonce: Nonce, queues: u32, bytes: u64) -> bool {
        if !made.contains_key(&nonce) && made.len() >= MAX_COUNTED {
            return false;
        }
        let (made, put) = made.entry(nonce).or_insert((0, 0));
        if *made + queues > MAX_QUEUES || *put + bytes > MAX_FILE_BYTES {
            return false;
        }
        *made += queues;
        *put += bytes;
        true
    }

    /// The file of counts: its header, the day, then each ticket's nonce,
    /// expiry (8 bytes) and places given (4 bytes) after their number (4
    /// bytes), then each lent token's nonce, queues made (4 bytes) and bytes
    /// put (8 bytes) after theirs.
    fn encode(&self) -> Vec<u8> {
        let mut out =
            Vec::with_capacity(8 + 8 + 4 + self.borrowed.len() * 28 + 4 + self.made.len() * 28);
        out.extend_from_slice(COUNTS_HEADER);
        out.extend_from_slice(&self.day.to_be_bytes());
        out.extend_from_slice(&(self.borrowed.len() as u32).to_be_bytes());
        for (nonce, (expires, given)) in &self.borrowed {
            out.extend_from_slice(nonce);
            out.extend_from_slice(&expires.to_be_bytes());
            out.extend_from_slice(&given.to_be_bytes());
        }
        out.extend_from_slice(&(self.made.len() as u32).to_be_bytes());
        for (nonce, (made, put)) in &self.made {
            out.extend_from_slice(nonce);
            out.extend_from_slice(&made.to_be_bytes());
            out.extend_from_slice(&put.to_be_bytes());
        }
        out
    }

    /// Reads back what `encode` wrote, at most `MAX_COUNTED` of each.
    fn decode(bytes: &[u8]) -> Option<Counts> {
        let mut r = bytes.strip_prefix(COUNTS_HEADER)?;
        let mut counts = Counts {
            day: u64_at(take(&mut r, 8)?),
            ..Counts::default()
        };
        for _ in 0..u32_at(take(&mut r, 4)?) {
            let entry = take(&mut r, 16 + 8 + 4)?;
            if counts.borrowed.len() < MAX_COUNTED {
                counts.borrowed.insert(
                    nonce_at(&entry[..16]),
                    (u64_at(&entry[16..24]), u32_at(&entry[24..])),
                );
            }
        }
        for _ in 0..u32_at(take(&mut r, 4)?) {
            let entry = take(&mut r, 16 + 4 + 8)?;
            if counts.made.len() < MAX_COUNTED {
                counts.made.insert(
                    nonce_at(&entry[..16]),
                    (u32_at(&entry[16..20]), u64_at(&entry[20..])),
                );
            }
        }
        r.is_empty().then_some(counts)
    }
}

/// The next `n` bytes of `r`, taken off it.
fn take<'a>(r: &mut &'a [u8], n: usize) -> Option<&'a [u8]> {
    let (head, rest) = r.split_at_checked(n)?;
    *r = rest;
    Some(head)
}

fn u32_at(bytes: &[u8]) -> u32 {
    u32::from_be_bytes(bytes.try_into().expect("4 bytes"))
}

fn u64_at(bytes: &[u8]) -> u64 {
    u64::from_be_bytes(bytes.try_into().expect("8 bytes"))
}

fn nonce_at(bytes: &[u8]) -> Nonce {
    bytes.try_into().expect("16 bytes")
}

/// The file of revoked tickets an operator keeps: one ticket's nonce a line,
/// in hex (or the whole ticket, `ticket.` and all), with blank lines and lines
/// that start with `#` left out. It is read again whenever its modification
/// time or length changes, so a line added takes effect at the next connection,
/// without a restart. A file that is not there revokes nothing.
pub struct Revoked {
    path: PathBuf,
    seen: Mutex<Seen>,
}

#[derive(Default)]
struct Seen {
    /// When the file was last changed and how long it was, as last read;
    /// `None` when it was not there.
    stamp: Option<(SystemTime, u64)>,
    /// Whether it was read at all yet.
    read: bool,
    /// Whether the relay already said it cannot read the file, so it says so
    /// once until the file can be read again, not on every connection.
    complained: bool,
    nonces: HashSet<Nonce>,
}

impl Revoked {
    /// The revoked tickets in the file at `path`, read when first asked.
    pub fn new(path: PathBuf) -> Revoked {
        Revoked {
            path,
            seen: Mutex::default(),
        }
    }

    /// Whether the ticket with `nonce` is revoked, reading the file again if
    /// it changed since.
    fn has(&self, nonce: &Nonce) -> bool {
        let mut seen = lock(&self.seen, REVOKED_LOCK);
        self.refresh(&mut seen);
        seen.nonces.contains(nonce)
    }

    /// How many tickets are revoked now, reading the file if it changed.
    pub fn count(&self) -> usize {
        let mut seen = lock(&self.seen, REVOKED_LOCK);
        self.refresh(&mut seen);
        seen.nonces.len()
    }

    fn refresh(&self, seen: &mut Seen) {
        let stamp = match fs::metadata(&self.path) {
            Ok(meta) => Some((
                meta.modified().unwrap_or(SystemTime::UNIX_EPOCH),
                meta.len(),
            )),
            Err(e) if e.kind() == ErrorKind::NotFound => None,
            Err(e) => {
                // Unreadable for now: what was revoked stays revoked.
                seen.complain(&format!(
                    "cannot look at the revoked tickets in {}: {e}",
                    self.path.display()
                ));
                return;
            }
        };
        if seen.read && stamp == seen.stamp {
            return;
        }
        let text = match stamp {
            None => String::new(),
            Some(_) => match fs::read_to_string(&self.path) {
                Ok(text) => text,
                Err(e) => {
                    seen.complain(&format!(
                        "cannot read the revoked tickets in {}: {e}",
                        self.path.display()
                    ));
                    return;
                }
            },
        };
        seen.nonces.clear();
        for (n, line) in text.lines().enumerate() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            match revoked_nonce(line) {
                Some(nonce) => {
                    seen.nonces.insert(nonce);
                }
                None => elog!(
                    "erevos-relay: line {} of {} is not a ticket's nonce (32 hex characters) or a ticket, left out",
                    n + 1,
                    self.path.display()
                ),
            }
        }
        if seen.read || !seen.nonces.is_empty() {
            elog!(
                "erevos-relay: {} tickets revoked in {}",
                seen.nonces.len(),
                self.path.display()
            );
        }
        seen.stamp = stamp;
        seen.read = true;
        seen.complained = false;
    }
}

impl Seen {
    /// Says `what` went wrong with the file, unless it was said already since
    /// the file was last read.
    fn complain(&mut self, what: &str) {
        if !self.complained {
            elog!("erevos-relay: {what}");
            self.complained = true;
        }
    }
}

/// The ticket's nonce on a line of the file of revoked tickets: the nonce in
/// hex, or the whole ticket.
fn revoked_nonce(line: &str) -> Option<Nonce> {
    let line = line.to_ascii_lowercase();
    let hex = match line.strip_prefix(TICKET) {
        Some(ticket) if ticket.len() == 2 * (8 + 16 + CODE_LEN) => ticket.get(16..48)?,
        Some(_) => return None,
        None => line.as_str(),
    };
    unhex(hex)?.try_into().ok()
}

pub struct Lend {
    secret: [u8; 32],
    counts: Mutex<Counts>,
    /// Where the counts are kept; in memory only without it.
    state: Option<PathBuf>,
    revoked: Option<Revoked>,
}

impl Lend {
    /// Lending keyed with a secret drawn from the relay's key, counting in
    /// memory only, with no tickets revoked.
    pub fn new(key: &RelayKey) -> Lend {
        let mut mac = Hmac::<Sha256>::new_from_slice(&key.to_secret_bytes()).expect("any length");
        mac.update(b"erevos-relay lending");
        Lend {
            secret: mac.finalize().into_bytes().into(),
            counts: Mutex::default(),
            state: None,
            revoked: None,
        }
    }

    /// Lending as `new` gives, with its counts kept in the file at `state`
    /// (read back now if it is there) and the tickets revoked in `revoked`.
    /// A file at `state` that is not one of counts is left alone, and an
    /// error.
    pub fn open(key: &RelayKey, state: &Path, revoked: Revoked) -> io::Result<Lend> {
        let counts = match fs::read(state) {
            Ok(bytes) => Counts::decode(&bytes).ok_or_else(|| {
                io::Error::new(
                    ErrorKind::InvalidData,
                    format!("{} is not a file of counts of lent places", state.display()),
                )
            })?,
            Err(e) if e.kind() == ErrorKind::NotFound => Counts::default(),
            Err(e) => return Err(e),
        };
        Ok(Lend {
            counts: Mutex::new(counts),
            state: Some(state.to_path_buf()),
            revoked: Some(revoked),
            ..Lend::new(key)
        })
    }

    /// The file of revoked tickets, if there is one.
    pub fn revoked(&self) -> Option<&Revoked> {
        self.revoked.as_ref()
    }

    fn counts(&self) -> std::sync::MutexGuard<'_, Counts> {
        lock(&self.counts, COUNTS_LOCK)
    }

    /// Writes the counts down, if they are kept: whether they are now on disk
    /// (true when none are kept). A failed write is said; whoever asked then
    /// gives nothing, as a place or a quota given while its count cannot be
    /// kept would be given again after the relay starts again.
    fn save(&self, counts: &Counts) -> bool {
        let Some(path) = &self.state else {
            return true;
        };
        match journal::write_whole(path, &counts.encode()) {
            Ok(()) => true,
            Err(e) => {
                elog!(
                    "erevos-relay: cannot write the counts of lent places to {}: {e}",
                    path.display()
                );
                false
            }
        }
    }

    fn is_revoked(&self, ticket: &Nonce) -> bool {
        self.revoked.as_ref().is_some_and(|r| r.has(ticket))
    }

    fn code(&self, kind: u8, fields: &[u8]) -> [u8; CODE_LEN] {
        let mut mac = Hmac::<Sha256>::new_from_slice(&self.secret).expect("any length");
        mac.update(&[kind]);
        mac.update(fields);
        let mut code = [0u8; CODE_LEN];
        code.copy_from_slice(&mac.finalize().into_bytes()[..CODE_LEN]);
        code
    }

    /// A new ticket, lasting `TICKET_DAYS` from `now` (Unix seconds).
    pub fn ticket(&self, now: u64) -> String {
        let mut fields = Vec::with_capacity(8 + 16);
        fields.extend_from_slice(&(now + TICKET_DAYS * DAY).to_be_bytes());
        fields.extend_from_slice(&random_nonce());
        let code = self.code(FOR_TICKET, &fields);
        format!("{TICKET}{}{}", hex(&fields), hex(&code))
    }

    /// A new lent token, for a place on the ticket `ticket`.
    fn lent_token(&self, ticket: &Nonce) -> String {
        let mut fields = Vec::with_capacity(16 + 16);
        fields.extend_from_slice(ticket);
        fields.extend_from_slice(&random_nonce());
        let code = self.code(FOR_LENT, &fields);
        format!("{LENT}{}{}", hex(&fields), hex(&code))
    }

    /// What `token` lets do: a ticket made here that has not expired at
    /// `now`, or a lent token made here, unless its ticket is revoked.
    /// `None` for anything else.
    pub fn check(&self, token: &str, now: u64) -> Option<Pass> {
        if let Some(rest) = token.strip_prefix(TICKET) {
            let bytes = unhex(rest)?;
            if bytes.len() != 8 + 16 + CODE_LEN {
                return None;
            }
            let (fields, code) = bytes.split_at(8 + 16);
            if !same(code, &self.code(FOR_TICKET, fields)) {
                return None;
            }
            let expires = u64::from_be_bytes(fields[..8].try_into().expect("8 bytes"));
            let nonce: Nonce = fields[8..].try_into().expect("16 bytes");
            return (expires > now && !self.is_revoked(&nonce))
                .then_some(Pass::Ticket { nonce, expires });
        }
        let bytes = unhex(token.strip_prefix(LENT)?)?;
        if bytes.len() != 16 + 16 + CODE_LEN {
            return None;
        }
        let (fields, code) = bytes.split_at(16 + 16);
        if !same(code, &self.code(FOR_LENT, fields)) {
            return None;
        }
        let ticket: Nonce = fields[..16].try_into().expect("16 bytes");
        let own: Nonce = fields[16..].try_into().expect("16 bytes");
        (!self.is_revoked(&ticket)).then_some(Pass::Lent(own))
    }

    /// One place on the ticket `nonce`, which expires at `expires`: the lent
    /// token for it, or `None` when the ticket gave all its places.
    pub fn borrow(&self, nonce: Nonce, expires: u64, now: u64) -> Option<String> {
        {
            let mut counts = self.counts();
            counts.borrowed.retain(|_, (until, _)| *until > now);
            if !counts.borrowed.contains_key(&nonce) && counts.borrowed.len() >= MAX_COUNTED {
                return None;
            }
            let before = counts.clone();
            let (_, given) = counts.borrowed.entry(nonce).or_insert((expires, 0));
            if *given >= MAX_BORROWS {
                return None;
            }
            *given += 1;
            if !self.save(&counts) {
                *counts = before;
                return None;
            }
        }
        Some(self.lent_token(&nonce))
    }

    /// Whether the lent token `nonce` may make one more queue today, counted
    /// if so.
    pub fn may_create(&self, nonce: Nonce, now: u64) -> bool {
        self.count(nonce, now, 1, 0)
    }

    /// Whether the lent token `nonce` may put `bytes` more of files today,
    /// counted if so.
    pub fn may_put(&self, nonce: Nonce, now: u64, bytes: u64) -> bool {
        self.count(nonce, now, 0, bytes)
    }

    fn count(&self, nonce: Nonce, now: u64, queues: u32, bytes: u64) -> bool {
        let mut counts = self.counts();
        let before = counts.clone();
        let today = now / DAY;
        let new_day = counts.day != today;
        if new_day {
            counts.day = today;
            counts.made.clear();
        }
        let allowed = Counts::add(&mut counts.made, nonce, queues, bytes);
        let used = allowed && (queues > 0 || bytes > 0);
        if (new_day || used) && !self.save(&counts) && used {
            // Not kept: nothing given, and the counts as they were.
            *counts = before;
            return false;
        }
        allowed
    }
}

fn random_nonce() -> Nonce {
    let mut nonce = [0u8; 16];
    rand::rngs::OsRng.fill_bytes(&mut nonce);
    nonce
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

/// Lowercase hex only, as `hex` writes it.
fn unhex(text: &str) -> Option<Vec<u8>> {
    if !text.len().is_multiple_of(2)
        || !text
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return None;
    }
    (0..text.len())
        .step_by(2)
        .map(|at| u8::from_str_radix(&text[at..at + 2], 16).ok())
        .collect()
}

/// Compares without stopping at the first difference, so timing does not show
/// how much of a code matched.
fn same(a: &[u8], b: &[u8]) -> bool {
    a.len() == b.len() && a.iter().zip(b).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::time::Duration;

    const NOW: u64 = 1_800_000_000;

    /// A fresh path in the system temp directory, removed when dropped.
    struct TempPath(PathBuf);

    impl TempPath {
        fn new(what: &str) -> TempPath {
            static NEXT: AtomicUsize = AtomicUsize::new(0);
            let n = NEXT.fetch_add(1, Ordering::Relaxed);
            let path = std::env::temp_dir().join(format!(
                "erevos-lend-test-{}-{n}.{what}",
                std::process::id()
            ));
            let _ = fs::remove_file(&path);
            TempPath(path)
        }
    }

    impl Drop for TempPath {
        fn drop(&mut self) {
            let _ = fs::remove_file(&self.0);
        }
    }

    fn ticket_pass(lend: &Lend, ticket: &str) -> (Nonce, u64) {
        match lend.check(ticket, NOW) {
            Some(Pass::Ticket { nonce, expires }) => (nonce, expires),
            other => panic!("not a ticket: {other:?}"),
        }
    }

    #[test]
    fn lending_is_off_unless_turned_on() {
        assert_eq!(wanted(None), Ok(false));
        assert_eq!(wanted(Some("")), Ok(false));
        assert_eq!(wanted(Some("off")), Ok(false));
        assert_eq!(wanted(Some("on")), Ok(true));
        assert!(wanted(Some("yes")).is_err());
        assert!(wanted(Some("ON")).is_err());
    }

    #[test]
    fn a_ticket_gives_its_places_until_it_expires() {
        let lend = Lend::new(&RelayKey::generate());
        let ticket = lend.ticket(NOW);
        assert!(ticket.starts_with("ticket.") && ticket.len() == 7 + 80);
        let (nonce, expires) = ticket_pass(&lend, &ticket);
        assert_eq!(expires, NOW + TICKET_DAYS * DAY);
        assert_eq!(lend.check(&ticket, expires), None);
        let tokens: Vec<String> = (0..MAX_BORROWS)
            .map(|_| lend.borrow(nonce, expires, NOW).expect("a place"))
            .collect();
        assert_eq!(lend.borrow(nonce, expires, NOW), None);
        // Each place has its own token, which carries its ticket's nonce.
        for token in &tokens {
            assert!(token.starts_with("lent.") && token.len() == 5 + 96);
            assert_eq!(&token[5..37], &ticket[7 + 16..7 + 48]);
            assert!(matches!(lend.check(token, NOW), Some(Pass::Lent(_))));
        }
        assert_ne!(tokens[0], tokens[1]);
        assert_ne!(lend.check(&tokens[0], NOW), lend.check(&tokens[1], NOW));
        // Another ticket gives its own.
        let (nonce, expires) = ticket_pass(&lend, &lend.ticket(NOW));
        assert!(lend.borrow(nonce, expires, NOW).is_some());
    }

    #[test]
    fn only_what_this_relay_made_is_taken() {
        let lend = Lend::new(&RelayKey::generate());
        let other = Lend::new(&RelayKey::generate());
        let ticket = lend.ticket(NOW);
        let (nonce, expires) = ticket_pass(&lend, &ticket);
        let token = lend.borrow(nonce, expires, NOW).unwrap();
        assert_eq!(other.check(&ticket, NOW), None);
        assert_eq!(other.check(&token, NOW), None);
        // Changed anywhere, or in capitals.
        let mut changed = ticket.clone().into_bytes();
        changed[10] = if changed[10] == b'0' { b'1' } else { b'0' };
        assert_eq!(
            lend.check(std::str::from_utf8(&changed).unwrap(), NOW),
            None
        );
        let mut changed = token.clone().into_bytes();
        changed[8] = if changed[8] == b'0' { b'1' } else { b'0' };
        assert_eq!(
            lend.check(std::str::from_utf8(&changed).unwrap(), NOW),
            None
        );
        assert_eq!(
            lend.check(&token.to_uppercase().replace("LENT.", "lent."), NOW),
            None
        );
        // A ticket's code does not make a lent token, nor the other way.
        let code = &ticket[7 + 48..];
        let nonce_hex = &ticket[7 + 16..7 + 48];
        assert_eq!(
            lend.check(&format!("lent.{nonce_hex}{nonce_hex}{code}"), NOW),
            None
        );
        assert_eq!(lend.check(&format!("lent.{nonce_hex}{code}"), NOW), None);
        assert_eq!(lend.check("lent.", NOW), None);
        assert_eq!(lend.check("the relay's token", NOW), None);
        // The same key makes the same codes, as after a restart.
        let key = RelayKey::generate();
        let first = Lend::new(&RelayKey::from_secret_bytes(key.to_secret_bytes()));
        let again = Lend::new(&key);
        assert!(again.check(&first.ticket(NOW), NOW).is_some());
    }

    #[test]
    fn a_lent_token_makes_and_puts_so_much_a_day() {
        // 50 MB of files a day, not the whole file store.
        assert_eq!(MAX_FILE_BYTES, 50 * 1024 * 1024);
        let lend = Lend::new(&RelayKey::generate());
        let nonce = [7u8; 16];
        for _ in 0..MAX_QUEUES {
            assert!(lend.may_create(nonce, NOW));
        }
        assert!(!lend.may_create(nonce, NOW));
        assert!(lend.may_put(nonce, NOW, MAX_FILE_BYTES - 10));
        assert!(!lend.may_put(nonce, NOW, 11));
        assert!(lend.may_put(nonce, NOW, 10));
        assert!(!lend.may_put(nonce, NOW, 1));
        // Another lent token counts on its own.
        assert!(lend.may_create([8u8; 16], NOW));
        assert!(lend.may_put([8u8; 16], NOW, MAX_FILE_BYTES));
        // The next day starts again.
        assert!(lend.may_create(nonce, NOW + DAY));
        assert!(lend.may_put(nonce, NOW + DAY, MAX_FILE_BYTES));
        assert!(!lend.may_put(nonce, NOW + DAY, 1));
    }

    /// Writes `text` as the file of revoked tickets, and makes sure it reads
    /// as changed even on a file system that keeps whole seconds only.
    fn write_revoked(path: &Path, text: &str) {
        static WRITES: AtomicUsize = AtomicUsize::new(0);
        fs::write(path, text).unwrap();
        let file = fs::File::options().write(true).open(path).unwrap();
        let n = WRITES.fetch_add(1, Ordering::Relaxed) as u64;
        file.set_modified(SystemTime::UNIX_EPOCH + Duration::from_secs(1_000_000 + n))
            .unwrap();
    }

    #[test]
    fn nothing_is_given_while_the_counts_cannot_be_kept() {
        let dir = TempPath::new("dir");
        fs::create_dir_all(&dir.0).unwrap();
        let state = dir.0.join("counts");
        let list = TempPath::new("revoked");
        let key = RelayKey::generate();
        let lend = Lend::open(&key, &state, Revoked::new(list.0.clone())).unwrap();
        let (nonce, expires) = ticket_pass(&lend, &lend.ticket(NOW));
        let token = lend.borrow(nonce, expires, NOW).unwrap();
        let Some(Pass::Lent(own)) = lend.check(&token, NOW) else {
            panic!("not a lent token");
        };
        assert!(lend.may_create(own, NOW));
        let kept = lend.counts().clone();
        // The disk goes: no place, no quota, and the counts stay as they were kept.
        fs::remove_dir_all(&dir.0).unwrap();
        assert_eq!(lend.borrow(nonce, expires, NOW), None);
        assert!(!lend.may_create(own, NOW));
        assert!(!lend.may_put(own, NOW, 10));
        assert_eq!(*lend.counts(), kept);
        // Back: given again.
        fs::create_dir_all(&dir.0).unwrap();
        assert!(lend.may_create(own, NOW));
        assert!(lend.borrow(nonce, expires, NOW).is_some());
        let _ = fs::remove_dir_all(&dir.0);
    }

    #[test]
    fn a_revoked_ticket_and_the_places_it_gave_are_refused() {
        let state = TempPath::new("counts");
        let list = TempPath::new("revoked");
        let key = RelayKey::generate();
        let lend = Lend::open(&key, &state.0, Revoked::new(list.0.clone())).unwrap();
        let ticket = lend.ticket(NOW);
        let kept = lend.ticket(NOW);
        let (nonce, expires) = ticket_pass(&lend, &ticket);
        let token = lend.borrow(nonce, expires, NOW).unwrap();
        let (kept_nonce, kept_expires) = ticket_pass(&lend, &kept);
        let kept_token = lend.borrow(kept_nonce, kept_expires, NOW).unwrap();
        // No file yet: nothing is revoked.
        assert_eq!(lend.revoked().unwrap().count(), 0);

        // Its nonce, as the operator finds it in the contact link's ticket.
        let nonce_hex = &ticket[7 + 16..7 + 48];
        write_revoked(
            &list.0,
            &format!("# taken back\n\n{nonce_hex}\nnot a nonce\n"),
        );
        assert_eq!(lend.check(&ticket, NOW), None);
        assert_eq!(lend.check(&token, NOW), None);
        assert_eq!(lend.revoked().unwrap().count(), 1);
        // Other tickets and their places go on.
        assert!(lend.check(&kept, NOW).is_some());
        assert!(lend.check(&kept_token, NOW).is_some());

        // The whole ticket on a line, in capitals too, revokes it as well.
        write_revoked(&list.0, &format!("{}\n", kept.to_uppercase()));
        assert_eq!(lend.check(&kept, NOW), None);
        assert_eq!(lend.check(&kept_token, NOW), None);
        // Taken off the list, the first works again: read again as it changed.
        assert!(lend.check(&ticket, NOW).is_some());
        assert!(lend.check(&token, NOW).is_some());

        // No file at all revokes nothing.
        fs::remove_file(&list.0).unwrap();
        assert!(lend.check(&kept_token, NOW).is_some());
        // Read at start, too.
        write_revoked(&list.0, &format!("{nonce_hex}\n"));
        let again = Lend::open(&key, &state.0, Revoked::new(list.0.clone())).unwrap();
        assert_eq!(again.check(&token, NOW), None);
        assert!(again.check(&kept_token, NOW).is_some());
    }

    #[test]
    fn a_line_of_the_revoked_file_with_other_letters_is_passed_over() {
        // As long as a ticket, with a letter of two bytes across where its nonce starts.
        let line = format!(
            "{TICKET}{}é{}",
            "0".repeat(15),
            "0".repeat(2 * (8 + 16 + CODE_LEN) - 17)
        );
        assert_eq!(line.len(), TICKET.len() + 2 * (8 + 16 + CODE_LEN));
        assert_eq!(revoked_nonce(&line), None);
        let ticket = format!("{TICKET}{}", "ab".repeat(8 + 16 + CODE_LEN));
        assert_eq!(revoked_nonce(&ticket), Some([0xab; 16]));
    }

    #[test]
    fn a_file_of_revoked_tickets_that_cannot_be_read_keeps_what_was_revoked() {
        let list = TempPath::new("revoked-unreadable");
        let revoked = Revoked::new(list.0.clone());
        write_revoked(&list.0, &format!("{}\n", "ab".repeat(16)));
        assert_eq!(revoked.count(), 1);

        // A folder in its place cannot be read as the file: the relay says so
        // once, not on every connection, and the ticket stays revoked.
        fs::remove_file(&list.0).unwrap();
        fs::create_dir(&list.0).unwrap();
        assert_eq!(revoked.count(), 1);
        assert!(lock(&revoked.seen, REVOKED_LOCK).complained);
        assert_eq!(revoked.count(), 1);

        // Readable again, it is read, and a later failure is said again.
        fs::remove_dir(&list.0).unwrap();
        write_revoked(&list.0, "");
        assert_eq!(revoked.count(), 0);
        assert!(!lock(&revoked.seen, REVOKED_LOCK).complained);
    }

    #[test]
    fn the_counts_survive_a_restart() {
        let state = TempPath::new("counts");
        let list = TempPath::new("revoked");
        let key = RelayKey::generate();
        let open = || Lend::open(&key, &state.0, Revoked::new(list.0.clone())).unwrap();
        let lend = open();
        let ticket = lend.ticket(NOW);
        let (nonce, expires) = ticket_pass(&lend, &ticket);
        for _ in 0..MAX_BORROWS - 1 {
            lend.borrow(nonce, expires, NOW).unwrap();
        }
        let place = [9u8; 16];
        for _ in 0..MAX_QUEUES {
            assert!(lend.may_create(place, NOW));
        }
        assert!(lend.may_put(place, NOW, MAX_FILE_BYTES - 5));
        drop(lend);

        let lend = open();
        assert!(lend.borrow(nonce, expires, NOW).is_some());
        assert_eq!(lend.borrow(nonce, expires, NOW), None);
        assert!(!lend.may_create(place, NOW));
        assert!(!lend.may_put(place, NOW, 6));
        assert!(lend.may_put(place, NOW, 5));
        drop(lend);
        // The next day the day's counts start again; the ticket's do not.
        let lend = open();
        assert!(lend.may_create(place, NOW + DAY));
        assert_eq!(lend.borrow(nonce, expires, NOW + DAY), None);
        drop(lend);
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mode = fs::metadata(&state.0).unwrap().permissions().mode();
            assert_eq!(mode & 0o777, 0o600);
        }

        // A file that is not one of counts is left alone, and the relay told.
        fs::write(&state.0, b"something else").unwrap();
        assert!(Lend::open(&key, &state.0, Revoked::new(list.0.clone())).is_err());
        assert_eq!(fs::read(&state.0).unwrap(), b"something else");
    }

    #[test]
    fn counts_read_back_stay_within_the_bound() {
        let mut counts = Counts {
            day: NOW / DAY,
            ..Counts::default()
        };
        for n in 0..MAX_COUNTED as u32 + 10 {
            let mut nonce = [0u8; 16];
            nonce[..4].copy_from_slice(&n.to_be_bytes());
            counts.borrowed.insert(nonce, (NOW + DAY, 1));
            counts.made.insert(nonce, (1, 100));
        }
        let back = Counts::decode(&counts.encode()).unwrap();
        assert_eq!(back.borrowed.len(), MAX_COUNTED);
        assert_eq!(back.made.len(), MAX_COUNTED);
        assert_eq!(back.day, counts.day);
        // Whole files only.
        let small = Counts {
            day: 3,
            ..Counts::default()
        };
        let bytes = small.encode();
        assert_eq!(Counts::decode(&bytes), Some(small));
        assert_eq!(Counts::decode(&bytes[..bytes.len() - 1]), None);
        assert_eq!(Counts::decode(&[bytes.as_slice(), b"x"].concat()), None);
    }
}
