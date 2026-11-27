// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! Open places: a phone with no place on this relay takes one by itself, as
//! the app asks at first start, with no invite, ticket or sign-in.
//!
//! Off unless the operator turns it on (`EREVOS_RELAY_OPEN=on`, which needs
//! the file of tokens, `EREVOS_RELAY_TOKENS`). A phone makes a token for
//! itself and gives its SHA-256 on the `/join` path (`OPEN`). The relay adds
//! a line for it to the file of tokens, named `open-` and 8 random hex
//! digits, with the day it was made after it:
//!
//! ```text
//! 3b7c0e5a8d16...91e1 open-5f3a9c01 # open place on 2026-11-26
//! ```
//!
//! and the phone uses the relay with that token from then on.
//!
//! The relay gives so many: at most `places` open places at once, `day` new
//! ones a day, and `per_address` new ones a day to one address (days are UTC
//! days). The address is the one the connection came from, or the last one
//! in `X-Forwarded-For` when it came from a proxy on this machine, as the
//! sign-in pages take it (`signin::client`); an IPv6 address counts as its
//! /48, the block a provider often gives one customer whole, so one customer
//! cannot take the day's places with addresses of their own (the sign-in
//! pages count its /64), and an IPv4 address mapped into IPv6 as that IPv4
//! address. It is counted in memory only, by an HMAC keyed with a secret
//! drawn at start (`Address`), never written or logged, and forgotten at the
//! end of the day or when the relay stops. A proxy on this machine that sends
//! no `X-Forwarded-For` makes every phone count as one address, this
//! machine's: the relay says so in its log, once an hour at most
//! (`unforwarded`).
//!
//! Every line named `open-` and more, in any case, is an open place's,
//! whether open places are on or not, one the operator wrote too: the places
//! given before go on as open places when the setting is turned off. No line
//! the relay adds otherwise is named so (`not_open`). An open place uses its
//! own chats as a phone with a token of its own does, `FORWARD`, `FILE_VIA`
//! and `LATER` too, but hands out no access: it cannot invite, lend, have
//! coupons signed or take a line of the operator's (see `server.rs`). Each
//! may make `queues` queues, put or fetch `file_bytes` bytes of files through
//! the relay, take `calls` credentials for the call relay and have the relay
//! connect to another relay for it `forwards` times a day (a `FORWARD`, a
//! `FILE_VIA`, or a `LATER` that holds a `FORWARD`, each counted when asked,
//! whatever comes of it); past that the relay answers `DAY_FULL`, so the app
//! can say it goes on tomorrow.
//!
//! What open places keep on the relay counts apart from what the phones with
//! places of their own keep, so that a few of them cannot take what the whole
//! relay shares: the messages waiting in the queues each made, at most
//! `queued` bytes, and in all open places' queues together at most half of
//! what the relay holds (see `queue.rs`); the chunks of files they put, at
//! most half of the room for files all together (see `files.rs`); the
//! requests each holds for later, at most `later` at once, and all open
//! places' together at most half of the requests and bytes the relay holds
//! (see `later.rs`). Past those the relay answers `FULL`, as when it is full
//! for everyone. Which queues, chunks and requests are an open place's is
//! kept in memory only, as which phone made a queue is: after a restart those
//! from before count as anyone's.
//!
//! An open place whose token connected on none of the last `unused_days`
//! days goes: the hourly look takes its line out of the file of tokens
//! (`sweep`). One whose token never connected after the day it was made goes
//! sooner, `first_days` days after that day, so places taken and never used
//! again do not hold the relay's places for long. One with no record of its
//! use yet (a line the operator wrote, or one from before the file of counts
//! was lost) counts as used on the day the look first sees it, so losing that
//! file never takes out a place still in use before its phone could connect
//! again. Its queues and files expire by themselves once unused (see
//! `queue.rs` and `files.rs`).
//!
//! What is counted is kept in a small file beside the file of tokens
//! (`<file>.open`), written whole on every change (`journal::write_whole`),
//! so a restart does not start the counts again: the day, how many places
//! were given that day, each open place's line by its token's SHA-256 with
//! the day it was made and the day its token last connected, the day it was
//! made until then (written once a day at most), and what each used that day.
//! Nothing in it says where a phone came from.

use std::collections::HashMap;
use std::fs;
use std::io::{self, ErrorKind};
use std::net::IpAddr;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, MutexGuard};

use hmac::{Hmac, Mac};
use rand::RngCore;
use sha2::Sha256;

use crate::invites;
use crate::journal;
use crate::lock::lock;
use crate::queue;
use crate::signin;
use crate::tokens::{self, Tokens};

/// What every open place's name starts with, before 8 random hex digits.
pub const PREFIX: &str = "open-";
/// What follows `#` on the line of an open place the relay gave, before the
/// day it was made.
const NOTE: &str = "open place on ";
/// Open places at once, unless set (`EREVOS_RELAY_OPEN_PLACES`).
pub const DEFAULT_PLACES: u64 = 1000;
/// New open places a day, unless set (`EREVOS_RELAY_OPEN_DAY`).
pub const DEFAULT_DAY: u64 = 100;
/// New open places a day to one address, unless set
/// (`EREVOS_RELAY_OPEN_PER_ADDRESS`).
pub const DEFAULT_PER_ADDRESS: u64 = 3;
/// Days an open place may go unused before it goes, unless set
/// (`EREVOS_RELAY_OPEN_UNUSED_DAYS`).
pub const DEFAULT_UNUSED_DAYS: u64 = 60;
/// Days after the day it was made that an open place whose token never
/// connected after that day goes, unless set (`EREVOS_RELAY_OPEN_FIRST_DAYS`).
pub const DEFAULT_FIRST_DAYS: u64 = 7;
/// Megabytes of files each open place may put or fetch through the relay a
/// day, unless set (`EREVOS_RELAY_OPEN_FILES_MB`).
pub const DEFAULT_FILES_MB: u64 = 50;
/// Credentials for the call relay each open place may take a day, unless set
/// (`EREVOS_RELAY_OPEN_CALLS`).
pub const DEFAULT_CALLS: u64 = 30;
/// Queues each open place may make a day, unless set
/// (`EREVOS_RELAY_OPEN_QUEUES`).
pub const DEFAULT_QUEUES: u64 = 20;
/// Times a day each open place may have the relay connect to another relay
/// for it, unless set (`EREVOS_RELAY_OPEN_FORWARDS`): many, as a phone that
/// sends everything through its relay (the app's ANONYMOUS mode) forwards
/// every message and receipt to a contact on another relay.
pub const DEFAULT_FORWARDS: u64 = 5000;
/// Megabytes of messages the queues each open place made may hold waiting,
/// unless set (`EREVOS_RELAY_OPEN_QUEUED_MB`).
pub const DEFAULT_QUEUED_MB: u64 = (queue::DEFAULT_OPEN_SHARE >> 20) as u64;
/// Requests for later each open place may hold at once, unless set
/// (`EREVOS_RELAY_OPEN_LATER`).
pub const DEFAULT_LATER: u64 = 20;
const DAY: u64 = 24 * 60 * 60;
/// How many of the first bits of an IPv6 address an open place is counted
/// by (`address`): its /48.
const V6_PREFIX: usize = 48;
/// The least time between two lines saying that a proxy on this machine
/// sends no `X-Forwarded-For` (`unforwarded`), seconds.
const UNFORWARDED_EVERY: u64 = 60 * 60;
/// The first bytes of the file of counts, so the relay never reads or
/// overwrites a file that is something else.
const COUNTS_HEADER: &[u8; 8] = b"EREVOSO1";
/// What the lock here is called if it is poisoned (see `lock.rs`).
const COUNTS_LOCK: &str = "lock of the counts of open places";

/// Whether open places are given, from the value of `EREVOS_RELAY_OPEN`:
/// `on` gives them; unset, or anything else, gives none.
pub fn wanted(setting: Option<&str>) -> bool {
    setting == Some("on")
}

/// Whether the line named `name` is an open place's: its name starts with
/// `open-`, in any case.
pub fn is_open(name: &str) -> bool {
    name.get(..PREFIX.len())
        .is_some_and(|start| start.eq_ignore_ascii_case(PREFIX))
}

/// `name` as a line that is not an open place's may have it: without the
/// dash after the `open` it starts with, so a line the relay names for
/// anything else is never taken for an open place's.
pub fn not_open(name: &str) -> String {
    let mut name = name.to_string();
    while is_open(&name) {
        name.remove(PREFIX.len() - 1);
    }
    name
}

/// A new open place's name: `open-` and 8 random hex digits.
pub fn new_name() -> String {
    let mut bytes = [0u8; 4];
    rand::rngs::OsRng.fill_bytes(&mut bytes);
    format!("{PREFIX}{}", tokens::to_hex(&bytes))
}

/// How many open places the relay gives, and how much each may use, as the
/// operator set it (see the module's doc).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Limits {
    /// Open places at once.
    pub places: usize,
    /// New ones a day.
    pub day: u32,
    /// New ones a day to one address.
    pub per_address: u32,
    /// Days one may connect on none of before it goes.
    pub unused_days: u64,
    /// Days after the day it was made that one whose token never connected
    /// after that day goes.
    pub first_days: u64,
    /// Bytes of files each may put or fetch through the relay a day.
    pub file_bytes: u64,
    /// Credentials for the call relay each may take a day.
    pub calls: u32,
    /// Queues each may make a day.
    pub queues: u32,
    /// Times each may have the relay connect to another relay for it a day.
    pub forwards: u32,
    /// Bytes of messages the queues each made may hold waiting (see
    /// `queue.rs`).
    pub queued: usize,
    /// Requests for later each may hold at once (see `later.rs`).
    pub later: usize,
}

impl Default for Limits {
    fn default() -> Self {
        Limits {
            places: DEFAULT_PLACES as usize,
            day: DEFAULT_DAY as u32,
            per_address: DEFAULT_PER_ADDRESS as u32,
            unused_days: DEFAULT_UNUSED_DAYS,
            first_days: DEFAULT_FIRST_DAYS,
            file_bytes: DEFAULT_FILES_MB << 20,
            calls: DEFAULT_CALLS as u32,
            queues: DEFAULT_QUEUES as u32,
            forwards: DEFAULT_FORWARDS as u32,
            queued: queue::DEFAULT_OPEN_SHARE,
            later: DEFAULT_LATER as usize,
        }
    }
}

/// Where a phone that asks for an open place came from, as `per_address`
/// counts it: an HMAC-SHA256 of the address, cut to 16 bytes, keyed with a
/// secret drawn when the relay starts. So the address itself is kept
/// nowhere, and after a restart the same address counts anew.
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub struct Address([u8; 16]);

/// Why `give` gave no place.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Refused {
    /// Open places are off.
    Off,
    /// The relay holds all the open places it may at once.
    Full,
    /// It gave all the open places it gives a day.
    Day,
    /// The address the phone came from took all it may today.
    Address,
    /// The file of tokens has a line for that token already.
    Taken,
    /// The count or the line could not be written.
    Storage,
}

/// An open place's line, by day (days since 1970, UTC): when it was made (0
/// when that is not known) and when its token last connected (when it was
/// made, until it does).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct Line {
    made: u64,
    used: u64,
}

impl Line {
    /// Whether the open place of this line goes on `today`, as `limits` say:
    /// once its token connected on none of the last `unused_days` days, or,
    /// when the day it was made is known and its token never connected after
    /// that day, once `first_days` days after it, whichever comes first.
    fn goes(&self, today: u64, limits: &Limits) -> bool {
        let unused = today.saturating_sub(self.used) > limits.unused_days;
        let never_back = self.made > 0
            && self.used <= self.made
            && today >= self.made.saturating_add(limits.first_days);
        unused || never_back
    }
}

/// What an open place used in a day.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
struct Used {
    queues: u32,
    bytes: u64,
    calls: u32,
    /// Times the relay connected to another relay for it, or was asked to.
    forwards: u32,
}

/// What the file of counts holds.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
struct Kept {
    /// The day `given` and `today` count (days since 1970, UTC).
    day: u64,
    /// Open places given that day.
    given: u32,
    /// Each open place's line, by its token's SHA-256.
    lines: HashMap<[u8; 32], Line>,
    /// What each open place used that day, by its token's SHA-256.
    today: HashMap<[u8; 32], Used>,
}

impl Kept {
    /// Starts the day's counts again when `today` is not their day.
    fn roll(&mut self, today: u64) {
        if self.day != today {
            self.day = today;
            self.given = 0;
            self.today.clear();
        }
    }

    /// The file of counts: its header, the day (8 bytes) and the places given
    /// that day (4 bytes), then each line's SHA-256, the day it was made and
    /// the day it last connected (8 bytes each) after their number (4 bytes),
    /// then each line's SHA-256, queues made (4 bytes), bytes of files moved
    /// (8 bytes), credentials for calls taken (4 bytes) and forwards (4
    /// bytes) that day after theirs.
    fn encode(&self) -> Vec<u8> {
        let mut out = Vec::with_capacity(
            8 + 8 + 4 + 4 + self.lines.len() * 48 + 4 + self.today.len() * 52,
        );
        out.extend_from_slice(COUNTS_HEADER);
        out.extend_from_slice(&self.day.to_be_bytes());
        out.extend_from_slice(&self.given.to_be_bytes());
        out.extend_from_slice(&(self.lines.len() as u32).to_be_bytes());
        for (hash, line) in &self.lines {
            out.extend_from_slice(hash);
            out.extend_from_slice(&line.made.to_be_bytes());
            out.extend_from_slice(&line.used.to_be_bytes());
        }
        out.extend_from_slice(&(self.today.len() as u32).to_be_bytes());
        for (hash, used) in &self.today {
            out.extend_from_slice(hash);
            out.extend_from_slice(&used.queues.to_be_bytes());
            out.extend_from_slice(&used.bytes.to_be_bytes());
            out.extend_from_slice(&used.calls.to_be_bytes());
            out.extend_from_slice(&used.forwards.to_be_bytes());
        }
        out
    }

    /// Reads back what `encode` wrote, whole files only.
    fn decode(bytes: &[u8]) -> Option<Kept> {
        let mut r = bytes.strip_prefix(COUNTS_HEADER)?;
        let mut kept = Kept {
            day: u64_at(take(&mut r, 8)?),
            given: u32_at(take(&mut r, 4)?),
            ..Kept::default()
        };
        for _ in 0..u32_at(take(&mut r, 4)?) {
            let entry = take(&mut r, 32 + 8 + 8)?;
            kept.lines.insert(
                hash_at(&entry[..32]),
                Line {
                    made: u64_at(&entry[32..40]),
                    used: u64_at(&entry[40..]),
                },
            );
        }
        for _ in 0..u32_at(take(&mut r, 4)?) {
            let entry = take(&mut r, 32 + 4 + 8 + 4 + 4)?;
            kept.today.insert(
                hash_at(&entry[..32]),
                Used {
                    queues: u32_at(&entry[32..36]),
                    bytes: u64_at(&entry[36..44]),
                    calls: u32_at(&entry[44..48]),
                    forwards: u32_at(&entry[48..]),
                },
            );
        }
        r.is_empty().then_some(kept)
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

fn hash_at(bytes: &[u8]) -> [u8; 32] {
    bytes.try_into().expect("32 bytes")
}

#[derive(Default)]
struct Inner {
    kept: Kept,
    /// Open places given today to each address: in memory only, never
    /// written or logged, and none for an address that took none.
    from: HashMap<Address, u32>,
    /// The day `from` counts.
    from_day: u64,
    /// When the relay last said that a proxy on this machine sends no
    /// `X-Forwarded-For` (`unforwarded`), Unix seconds.
    said_unforwarded: Option<u64>,
}

pub struct OpenPlaces {
    on: bool,
    limits: Limits,
    /// The key of the HMAC addresses are counted by: drawn at start, kept
    /// nowhere.
    secret: [u8; 32],
    inner: Mutex<Inner>,
    /// Where the counts are kept; in memory only without it.
    path: Option<PathBuf>,
}

impl OpenPlaces {
    /// Open places as `limits` say, given only when `on`, counted in memory
    /// only.
    pub fn in_memory(on: bool, limits: Limits) -> OpenPlaces {
        let mut secret = [0u8; 32];
        rand::rngs::OsRng.fill_bytes(&mut secret);
        OpenPlaces {
            on,
            limits,
            secret,
            inner: Mutex::default(),
            path: None,
        }
    }

    /// Open places as `in_memory` gives, with their counts kept in the file
    /// at `path`, read back now if it is there. A file at `path` that is not
    /// one of counts of open places is left alone, and an error.
    pub fn open(on: bool, limits: Limits, path: &Path) -> io::Result<OpenPlaces> {
        let kept = match fs::read(path) {
            Ok(bytes) => Kept::decode(&bytes).ok_or_else(|| {
                io::Error::new(
                    ErrorKind::InvalidData,
                    format!("{} is not a file of counts of open places", path.display()),
                )
            })?,
            Err(e) if e.kind() == ErrorKind::NotFound => Kept::default(),
            Err(e) => return Err(e),
        };
        Ok(OpenPlaces {
            inner: Mutex::new(Inner {
                kept,
                ..Inner::default()
            }),
            path: Some(path.to_path_buf()),
            ..OpenPlaces::in_memory(on, limits)
        })
    }

    /// Whether the relay gives open places now.
    pub fn on(&self) -> bool {
        self.on
    }

    pub fn limits(&self) -> Limits {
        self.limits
    }

    fn inner(&self) -> MutexGuard<'_, Inner> {
        lock(&self.inner, COUNTS_LOCK)
    }

    /// Writes the counts down, if they are kept: whether they are now on disk
    /// (true when none are kept). A failed write is said; whoever asked then
    /// gives nothing, as a place or a use given while its count cannot be
    /// kept would be given again after the relay starts again.
    fn save(&self, kept: &Kept) -> bool {
        let Some(path) = &self.path else {
            return true;
        };
        match journal::write_whole(path, &kept.encode()) {
            Ok(()) => true,
            Err(e) => {
                elog!(
                    "erevos-relay: cannot write the counts of open places to {}: {e}",
                    path.display()
                );
                false
            }
        }
    }

    /// How a phone that came from `ip` counts for `per_address`: an IPv4
    /// address as itself, and one mapped into IPv6 as that IPv4 address
    /// (`signin::counted_as`); any other IPv6 address as its /48, wider than
    /// the /64 the sign-in pages count, as a provider often gives one customer
    /// a whole /48, with more /64s in it than any day's places.
    pub fn address(&self, ip: IpAddr) -> Address {
        let mut mac = Hmac::<Sha256>::new_from_slice(&self.secret).expect("any length");
        match signin::counted_as(ip) {
            IpAddr::V4(v4) => {
                mac.update(&[4]);
                mac.update(&v4.octets());
            }
            IpAddr::V6(v6) => {
                let mut octets = v6.octets();
                octets[V6_PREFIX / 8..].fill(0);
                mac.update(&[6]);
                mac.update(&octets);
            }
        }
        let mut address = [0u8; 16];
        address.copy_from_slice(&mac.finalize().into_bytes()[..16]);
        Address(address)
    }

    /// Says in the log, when open places are on, that a connection came to
    /// `/join` from a proxy on this machine that sent no `X-Forwarded-For`:
    /// open places count every phone that comes so as one address, this
    /// machine's, so the first few of a day take all one address may, and the
    /// rest are refused. Said at most once an hour (`UNFORWARDED_EVERY`), at
    /// `now` (Unix seconds), with nothing of the phone or of where it came
    /// from. Whether it was said now.
    pub fn unforwarded(&self, now: u64) -> bool {
        if !self.on {
            return false;
        }
        let mut inner = self.inner();
        if inner
            .said_unforwarded
            .is_some_and(|said| now.saturating_sub(said) < UNFORWARDED_EVERY)
        {
            return false;
        }
        inner.said_unforwarded = Some(now);
        elog!("erevos-relay: a connection came to /join from a proxy on this machine that sent no X-Forwarded-For, so open places count every phone that comes so as one address, this machine's: have the proxy send X-Forwarded-For (said once an hour at most)");
        true
    }

    /// Gives a phone that came `from` an open place: adds a line to `tokens`
    /// for the token whose SHA-256 is `line`, and returns the name on it. The
    /// place is counted, and the count kept, before the line is written, so a
    /// restart never gives it again; a line not written is not counted.
    pub fn give(
        &self,
        line: &[u8; 32],
        from: Address,
        tokens: &Tokens,
        now: u64,
    ) -> Result<String, Refused> {
        if !self.on {
            return Err(Refused::Off);
        }
        let today = now / DAY;
        // Held until the line is written, so two phones at once cannot both take the last place.
        let mut inner = self.inner();
        if tokens.in_file(line) {
            return Err(Refused::Taken);
        }
        let open = tokens
            .lines()
            .iter()
            .filter(|(_, name)| is_open(name))
            .count();
        if open >= self.limits.places {
            return Err(Refused::Full);
        }
        inner.kept.roll(today);
        if inner.kept.given >= self.limits.day {
            return Err(Refused::Day);
        }
        if inner.from_day != today {
            inner.from_day = today;
            inner.from.clear();
        }
        if inner.from.get(&from).copied().unwrap_or(0) >= self.limits.per_address {
            return Err(Refused::Address);
        }
        let before = inner.kept.clone();
        inner.kept.given += 1;
        inner.kept.lines.insert(
            *line,
            Line {
                made: today,
                used: today,
            },
        );
        if !self.save(&inner.kept) {
            inner.kept = before;
            return Err(Refused::Storage);
        }
        match tokens.add_open(line, &format!("{NOTE}{}", invites::date(now))) {
            Ok(name) => {
                *inner.from.entry(from).or_insert(0) += 1;
                Ok(name)
            }
            Err(e) => {
                // Not given: not counted. Should this write fail, the place
                // stays counted on disk for the day, never less than given.
                inner.kept = before;
                let _ = self.save(&inner.kept);
                if e.kind() == ErrorKind::AlreadyExists {
                    Err(Refused::Taken)
                } else {
                    elog!("erevos-relay: cannot add an open place's line to the file of tokens: {e}");
                    Err(Refused::Storage)
                }
            }
        }
    }

    /// Counts a connection with the token of the open place `line` as its use
    /// on the day of `now`: written once a day at most.
    pub fn used(&self, line: &[u8; 32], now: u64) {
        let today = now / DAY;
        let mut inner = self.inner();
        let record = inner
            .kept
            .lines
            .entry(*line)
            .or_insert(Line { made: 0, used: 0 });
        if record.used >= today {
            return;
        }
        record.used = today;
        // Not written: it is kept in memory all the same, and written with the next change.
        let _ = self.save(&inner.kept);
    }

    /// Whether the open place `line` may make one more queue on the day of
    /// `now`, counted if so.
    pub fn may_create(&self, line: &[u8; 32], now: u64) -> bool {
        self.count(
            line,
            now,
            Used {
                queues: 1,
                ..Used::default()
            },
        )
    }

    /// Whether the open place `line` may put or fetch `bytes` more of files
    /// through the relay on the day of `now`, counted if so.
    pub fn may_move(&self, line: &[u8; 32], now: u64, bytes: u64) -> bool {
        self.count(
            line,
            now,
            Used {
                bytes,
                ..Used::default()
            },
        )
    }

    /// Whether the open place `line` may take credentials for the call relay
    /// once more on the day of `now`, counted if so.
    pub fn may_call(&self, line: &[u8; 32], now: u64) -> bool {
        self.count(
            line,
            now,
            Used {
                calls: 1,
                ..Used::default()
            },
        )
    }

    /// Whether the open place `line` may have the relay connect to another
    /// relay for it once more on the day of `now` (a `FORWARD`, a `FILE_VIA`,
    /// or a `LATER` that holds a `FORWARD`), and fetch `bytes` more of files
    /// through it with that, counted together if so. The forward stays
    /// counted whatever comes of it: the relay connects, or tries to, as it
    /// was asked.
    pub fn may_forward(&self, line: &[u8; 32], now: u64, bytes: u64) -> bool {
        self.count(
            line,
            now,
            Used {
                forwards: 1,
                bytes,
                ..Used::default()
            },
        )
    }

    /// Gives back what the `may_` calls counted at `now` for the open place
    /// `line`, when what it was counted for then failed or came to less (the
    /// relay full, a chunk smaller than counted): nothing is lost for the day
    /// to that. Forwards are never given back (see `may_forward`). Nothing
    /// once the day it was counted on is over. A failed write of the counts
    /// leaves them lower in memory only: on disk they stay as counted, never
    /// less than what was used.
    pub fn give_back(&self, line: &[u8; 32], now: u64, queues: u32, bytes: u64, calls: u32) {
        if queues == 0 && bytes == 0 && calls == 0 {
            return;
        }
        let mut inner = self.inner();
        if inner.kept.day != now / DAY {
            return;
        }
        let Some(used) = inner.kept.today.get_mut(line) else {
            return;
        };
        used.queues = used.queues.saturating_sub(queues);
        used.bytes = used.bytes.saturating_sub(bytes);
        used.calls = used.calls.saturating_sub(calls);
        let _ = self.save(&inner.kept);
    }

    fn count(&self, line: &[u8; 32], now: u64, more: Used) -> bool {
        let mut inner = self.inner();
        let before = inner.kept.clone();
        let new_day = inner.kept.day != now / DAY;
        inner.kept.roll(now / DAY);
        let had = inner.kept.today.get(line).copied().unwrap_or_default();
        let after = Used {
            queues: had.queues.saturating_add(more.queues),
            bytes: had.bytes.saturating_add(more.bytes),
            calls: had.calls.saturating_add(more.calls),
            forwards: had.forwards.saturating_add(more.forwards),
        };
        let allowed = after.queues <= self.limits.queues
            && after.bytes <= self.limits.file_bytes
            && after.calls <= self.limits.calls
            && after.forwards <= self.limits.forwards;
        let counted = allowed && more != Used::default();
        if counted {
            inner.kept.today.insert(*line, after);
        }
        if (new_day || counted) && !self.save(&inner.kept) && counted {
            // Not kept: nothing given, and the counts as they were.
            inner.kept = before;
            return false;
        }
        allowed
    }

    /// The hourly look: takes out of `tokens` the lines of the open places
    /// whose token connected on none of the last `unused_days` days (a line
    /// with no record counted from the first look that sees it), or never
    /// connected after the day it was made, `first_days` days after it (see
    /// `Line::goes`), and forgets the records of lines gone from the file, or
    /// no longer named as an open place's.
    pub fn sweep(&self, tokens: &Tokens, now: u64) {
        let today = now / DAY;
        let names: HashMap<[u8; 32], String> = tokens.lines().into_iter().collect();
        // The day each line says it was made, for those with no record of it.
        let made = tokens.text().map(|text| made_days(&text)).unwrap_or_default();
        let mut unused = Vec::new();
        {
            let mut inner = self.inner();
            let before = inner.kept.clone();
            for (hash, name) in &names {
                if !is_open(name) {
                    continue;
                }
                let on_line = made.get(hash).copied().unwrap_or(0);
                // Not seen used yet: counted from now, whatever day is on its line.
                let record = inner.kept.lines.entry(*hash).or_insert(Line {
                    made: on_line,
                    used: today,
                });
                if record.made == 0 {
                    record.made = on_line;
                }
                if record.goes(today, &self.limits) {
                    unused.push(*hash);
                }
            }
            if inner.kept != before {
                let _ = self.save(&inner.kept);
            }
        }
        let mut taken_out = 0;
        for hash in &unused {
            match tokens.remove(hash) {
                Ok(_) => taken_out += 1,
                // Refused all the same; the next look writes it out (`Tokens::prune`).
                Err(e) => elog!(
                    "erevos-relay: cannot take an unused open place's line out of the file of tokens now, so it is only refused until the next try: {e}"
                ),
            }
        }
        if taken_out > 0 {
            elog!(
                "erevos-relay: took out {taken_out} open places unused for more than {} days, or not used again in the {} days after the day they were made",
                self.limits.unused_days,
                self.limits.first_days
            );
        }
        let names: HashMap<[u8; 32], String> = tokens.lines().into_iter().collect();
        let mut inner = self.inner();
        let Kept { lines, today, .. } = &mut inner.kept;
        let had = (lines.len(), today.len());
        lines.retain(|hash, _| match names.get(hash) {
            Some(name) => is_open(name),
            None => !tokens.gone(hash),
        });
        today.retain(|hash, _| lines.contains_key(hash));
        if (lines.len(), today.len()) != had {
            let _ = self.save(&inner.kept);
        }
    }
}

/// The day an open place's line was made, as the relay writes it after the
/// line (`# open place on yyyy-mm-dd`).
fn made_on(line: &str) -> Option<u64> {
    let (_, note) = line.split_once('#')?;
    let date = note.trim().strip_prefix(NOTE)?;
    day_of(date.split_whitespace().next()?)
}

/// The day each open place's line in `text`, the file of tokens, says it was
/// made, by its token's SHA-256.
fn made_days(text: &str) -> HashMap<[u8; 32], u64> {
    text.lines()
        .filter_map(|line| {
            let hash = tokens::line_hash(line)?;
            if !is_open(tokens::line_name(line)?) {
                return None;
            }
            Some((hash, made_on(line)?))
        })
        .collect()
}

/// The day (days since 1970) of a date as `invites::date` writes it,
/// `yyyy-mm-dd`, in UTC.
fn day_of(text: &str) -> Option<u64> {
    let mut parts = text.split('-');
    let (year, month, day) = (parts.next()?, parts.next()?, parts.next()?);
    let digits = |part: &str, len: usize| part.len() == len && part.bytes().all(|b| b.is_ascii_digit());
    if parts.next().is_some() || !digits(year, 4) || !digits(month, 2) || !digits(day, 2) {
        return None;
    }
    let (year, month, day): (i64, i64, i64) = (year.parse().ok()?, month.parse().ok()?, day.parse().ok()?);
    if !(1..=12).contains(&month) || !(1..=31).contains(&day) {
        return None;
    }
    // Howard Hinnant's days_from_civil.
    let year = if month <= 2 { year - 1 } else { year };
    let era = year.div_euclid(400);
    let yoe = year - era * 400;
    let mp = if month > 2 { month - 3 } else { month + 9 };
    let doy = (153 * mp + 2) / 5 + day - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    u64::try_from(era * 146_097 + doe - 719_468).ok()
}

/// What `erevos-relay open-places` says: how many open places the file of
/// tokens holds, and of those how many were made, and how many were used
/// (their token connected, or they were made), today and in the days before
/// (UTC days, today among them).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Tally {
    pub places: usize,
    pub made_today: usize,
    pub made_week: usize,
    pub used_today: usize,
    pub used_week: usize,
    pub used_month: usize,
}

/// Counts the open places in `text`, that of the file of tokens, with
/// what `kept`, the file of counts if there is one, says of them, on the day
/// of `now`. A line with no record is taken as made, and last used, on the
/// day its line says. `None` when `kept` is not a file of counts of open
/// places.
pub fn tally(text: &str, kept: Option<&[u8]>, now: u64) -> Option<Tally> {
    let kept = match kept {
        Some(bytes) => Kept::decode(bytes)?,
        None => Kept::default(),
    };
    let today = now / DAY;
    let within = |day: u64, days: u64| day > 0 && day <= today && today - day < days;
    let mut tally = Tally::default();
    for line in text.lines() {
        let (Some(hash), Some(name)) = (tokens::line_hash(line), tokens::line_name(line)) else {
            continue;
        };
        if !is_open(name) {
            continue;
        }
        tally.places += 1;
        let record = kept.lines.get(&hash);
        let made = record
            .map(|record| record.made)
            .filter(|&day| day > 0)
            .or_else(|| made_on(line))
            .unwrap_or(0);
        let used = record.map_or(made, |record| record.used);
        tally.made_today += usize::from(within(made, 1));
        tally.made_week += usize::from(within(made, 7));
        tally.used_today += usize::from(within(used, 1));
        tally.used_week += usize::from(within(used, 7));
        tally.used_month += usize::from(within(used, 30));
    }
    Some(tally)
}

#[cfg(test)]
mod tests {
    use super::*;
    use sha2::Digest;
    use std::net::{Ipv4Addr, Ipv6Addr};
    use std::sync::atomic::{AtomicUsize, Ordering};

    const NOW: u64 = 1_800_000_000;

    /// A fresh path in the system temp directory, removed when dropped.
    struct TempPath(PathBuf);

    impl TempPath {
        fn new(what: &str) -> TempPath {
            static NEXT: AtomicUsize = AtomicUsize::new(0);
            let n = NEXT.fetch_add(1, Ordering::Relaxed);
            let path = std::env::temp_dir().join(format!(
                "erevos-open-test-{}-{n}.{what}",
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

    fn line(token: &str) -> [u8; 32] {
        Sha256::digest(token.as_bytes()).into()
    }

    fn v4(last: u8) -> IpAddr {
        IpAddr::V4(Ipv4Addr::new(203, 0, 113, last))
    }

    fn small() -> Limits {
        Limits {
            places: 4,
            day: 3,
            per_address: 2,
            unused_days: 10,
            // Past `unused_days`, so a place never used goes by that rule first, as the looks
            // that test it see; `an_open_place_never_used_after_its_day_goes_sooner` sets less.
            first_days: 30,
            file_bytes: 1000,
            calls: 2,
            queues: 2,
            forwards: 3,
            queued: 1000,
            later: 2,
        }
    }

    #[test]
    fn open_places_are_given_only_when_turned_on() {
        assert!(wanted(Some("on")));
        for other in [None, Some(""), Some("off"), Some("ON"), Some("yes")] {
            assert!(!wanted(other));
        }
        let tokens = TempPath::new("off-tokens");
        let tokens = Tokens::new(tokens.0.clone());
        let open = OpenPlaces::in_memory(false, small());
        assert_eq!(
            open.give(&line("a"), open.address(v4(1)), &tokens, NOW),
            Err(Refused::Off)
        );
        assert_eq!(tokens.lines_in_file(), 0);
    }

    #[test]
    fn a_line_is_an_open_place_s_by_its_name_and_no_other_line_is_named_so() {
        assert!(is_open("open-5f3a9c01") && is_open("Open-x") && is_open("OPEN-"));
        assert!(!is_open("open") && !is_open("opened") && !is_open("pixel") && !is_open("ópen-x"));
        assert_eq!(not_open("open-x"), "openx");
        assert_eq!(not_open("OPEN--x"), "OPENx");
        assert_eq!(not_open("open"), "open");
        assert_eq!(not_open("lphl:open-x"), "lphl:open-x");
        let name = new_name();
        assert!(is_open(&name) && name.len() == 13, "{name}");
        assert!(name[5..].bytes().all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase()));
        assert_ne!(new_name(), new_name());
    }

    #[test]
    fn the_day_on_a_line_reads_back_as_written() {
        for now in [0, NOW, NOW + 59 * DAY, 951_782_400, 4_102_444_800] {
            assert_eq!(day_of(&invites::date(now)), Some(now / DAY), "{now}");
        }
        for wrong in ["", "2026-11", "2026-13-01", "2026-00-10", "26-11-26", "2026-11-26-1", "+026-11-26"] {
            assert_eq!(day_of(wrong), None, "{wrong}");
        }
        let hash = tokens::to_hex(&line("a"));
        let text = format!("{hash} open-0a1b2c3d # open place on {}", invites::date(NOW));
        assert_eq!(made_on(&text), Some(NOW / DAY));
        assert_eq!(made_on(&format!("{hash} open-0a1b2c3d")), None);
        assert_eq!(made_on(&format!("{hash} open-0a1b2c3d # by hand")), None);
    }

    #[test]
    fn a_place_is_given_with_a_line_of_its_own_and_once_for_a_token() {
        let path = TempPath::new("given-tokens");
        let tokens = Tokens::new(path.0.clone());
        let open = OpenPlaces::in_memory(true, small());
        let name = open
            .give(&line("phone"), open.address(v4(1)), &tokens, NOW)
            .unwrap();
        assert!(is_open(&name) && name.len() == 13, "{name}");
        assert_eq!(
            fs::read_to_string(&path.0).unwrap(),
            format!(
                "{} {name} # open place on {}\n",
                tokens::to_hex(&line("phone")),
                invites::date(NOW)
            )
        );
        assert!(tokens.has("phone"));
        // The same token again, from another address: the file has its line already.
        assert_eq!(
            open.give(&line("phone"), open.address(v4(2)), &tokens, NOW),
            Err(Refused::Taken)
        );
        // Each place has a name of its own.
        let other = open
            .give(&line("other"), open.address(v4(2)), &tokens, NOW)
            .unwrap();
        assert_ne!(other, name);
        assert_eq!(tokens.count(), 2);
    }

    #[test]
    fn so_many_are_given_at_once_a_day_and_to_one_address() {
        let path = TempPath::new("caps-tokens");
        let tokens = Tokens::new(path.0.clone());
        // A line of the operator's is no open place, and counts for none of the caps.
        let (_, pixel) = tokens::new_token("pixel");
        fs::write(&path.0, format!("{pixel}\n")).unwrap();
        let open = OpenPlaces::in_memory(true, small());
        let (first, second, third) = (open.address(v4(1)), open.address(v4(2)), open.address(v4(3)));
        assert!(first == open.address(v4(1)) && first != second);
        open.give(&line("a"), first, &tokens, NOW).unwrap();
        open.give(&line("b"), first, &tokens, NOW).unwrap();
        // That address took all it may today; another still takes one.
        assert_eq!(open.give(&line("c"), first, &tokens, NOW), Err(Refused::Address));
        open.give(&line("c"), second, &tokens, NOW).unwrap();
        // The day's are given.
        assert_eq!(open.give(&line("d"), third, &tokens, NOW), Err(Refused::Day));
        // The next day, more; the first address again too, up to all at once.
        open.give(&line("d"), first, &tokens, NOW + DAY).unwrap();
        assert_eq!(open.give(&line("e"), second, &tokens, NOW + DAY), Err(Refused::Full));
        assert_eq!(tokens.count(), 5);
        // A place taken out makes room again.
        assert!(tokens.remove(&line("a")).unwrap());
        open.give(&line("e"), second, &tokens, NOW + DAY).unwrap();
        // An IPv6 address counts as its /48, and a mapped IPv4 address as that address.
        let roomy = OpenPlaces::in_memory(true, Limits { places: 100, day: 100, ..small() });
        let at = |text: &str| roomy.address(text.parse::<IpAddr>().unwrap());
        assert!(at("2001:db8:1:2::5") == at("2001:db8:1:2:ffff::9"));
        assert!(at("2001:db8:1:2::5") == at("2001:db8:1:3::5"));
        assert!(at("2001:db8:1:2::5") != at("2001:db8:2:2::5"));
        assert!(at("::ffff:203.0.113.1") == at("203.0.113.1"));
        // Another relay, or this one after a restart, counts the same address apart.
        let again = OpenPlaces::in_memory(true, small());
        assert!(again.address(v4(1)) != first);
        let v6 = IpAddr::V6(Ipv6Addr::new(0x2001, 0xdb8, 1, 2, 0, 0, 0, 5));
        assert!(roomy.address(v6) == at("2001:db8:1:2::77"));
    }

    #[test]
    fn the_addresses_of_one_ipv6_48_take_the_places_of_one_address() {
        let path = TempPath::new("v6-tokens");
        let tokens = Tokens::new(path.0.clone());
        let limits = Limits {
            places: 100,
            day: 100,
            ..small()
        };
        let open = OpenPlaces::in_memory(true, limits);
        // A place for the token `name`, asked for from the address `from`.
        let give = |name: &str, from: &str| {
            let from = open.address(from.parse::<IpAddr>().unwrap());
            open.give(&line(name), from, &tokens, NOW)
        };
        // Two /64s of one /48: the second takes the last place of that address today.
        give("a", "2001:db8:1:2::5").unwrap();
        give("b", "2001:db8:1:3::5").unwrap();
        for other in [
            "2001:db8:1::1",
            "2001:db8:1:ffff:ffff:ffff:ffff:ffff",
            "2001:db8:1:4::",
        ] {
            assert_eq!(give(other, other), Err(Refused::Address), "{other}");
        }
        // The next /48, on either side, is another address.
        give("c", "2001:db8:2::1").unwrap();
        give("d", "2001:db8:0:ffff::1").unwrap();
        // An IPv4 address is counted whole, and one mapped into IPv6 as it.
        give("e", "203.0.113.1").unwrap();
        give("f", "::ffff:203.0.113.1").unwrap();
        assert_eq!(give("g", "203.0.113.1"), Err(Refused::Address));
        give("g", "203.0.113.2").unwrap();
        assert_eq!(tokens.count(), 7);
    }

    #[test]
    fn an_open_place_makes_moves_and_calls_so_much_a_day() {
        let open = OpenPlaces::in_memory(true, small());
        let place = line("place");
        assert!(open.may_create(&place, NOW) && open.may_create(&place, NOW));
        assert!(!open.may_create(&place, NOW));
        assert!(open.may_move(&place, NOW, 990));
        assert!(!open.may_move(&place, NOW, 11));
        assert!(open.may_move(&place, NOW, 10));
        assert!(!open.may_move(&place, NOW, 1));
        assert!(open.may_call(&place, NOW) && open.may_call(&place, NOW));
        assert!(!open.may_call(&place, NOW));
        // Another place counts on its own.
        let other = line("other");
        assert!(open.may_create(&other, NOW) && open.may_move(&other, NOW, 1000) && open.may_call(&other, NOW));
        // What failed is given back the same day, never another day's.
        open.give_back(&place, NOW, 1, 500, 1);
        assert!(open.may_create(&place, NOW) && !open.may_create(&place, NOW));
        assert!(open.may_move(&place, NOW, 500) && !open.may_move(&place, NOW, 1));
        assert!(open.may_call(&place, NOW) && !open.may_call(&place, NOW));
        // The next day starts again.
        assert!(open.may_create(&place, NOW + DAY) && open.may_call(&place, NOW + DAY));
        assert!(open.may_move(&place, NOW + DAY, 1000));
        open.give_back(&place, NOW, 1, 0, 0);
        assert!(open.may_create(&place, NOW + DAY) && !open.may_create(&place, NOW + DAY));
        // None at all where the operator allows none.
        let none = OpenPlaces::in_memory(true, Limits { file_bytes: 0, calls: 0, ..small() });
        assert!(!none.may_move(&place, NOW, 1) && !none.may_call(&place, NOW));
        assert!(none.may_create(&place, NOW));
    }

    #[test]
    fn an_open_place_forwards_so_many_times_a_day_and_none_is_given_back() {
        let open = OpenPlaces::in_memory(true, small());
        let place = line("place");
        // Three a day: one alone, and two that fetch a chunk with it, counted with the day's files.
        assert!(open.may_forward(&place, NOW, 0));
        assert!(open.may_forward(&place, NOW, 400));
        // One that would fetch more than the day's files left is not counted, as a forward either.
        assert!(!open.may_forward(&place, NOW, 601));
        assert!(open.may_forward(&place, NOW, 600));
        assert!(!open.may_forward(&place, NOW, 0));
        // What a fetch came to less than counted is given back; the forward is not.
        open.give_back(&place, NOW, 0, 1000, 0);
        assert!(!open.may_forward(&place, NOW, 0));
        assert!(open.may_move(&place, NOW, 1000));
        // The other uses of the day count apart from forwards.
        assert!(open.may_create(&place, NOW) && open.may_call(&place, NOW));
        // Another place counts on its own, and the next day starts again.
        assert!(open.may_forward(&line("other"), NOW, 0));
        assert!(open.may_forward(&place, NOW + DAY, 0));
        // None where the operator allows none, and the rest as before.
        let limits = Limits {
            forwards: 0,
            ..small()
        };
        let none = OpenPlaces::in_memory(true, limits);
        assert!(!none.may_forward(&place, NOW, 0));
        assert!(
            none.may_create(&place, NOW)
                && none.may_move(&place, NOW, 1)
                && none.may_call(&place, NOW)
        );
    }

    #[test]
    fn the_counts_survive_a_restart() {
        let path = TempPath::new("restart-tokens");
        let state = TempPath::new("restart-open");
        let tokens = Tokens::new(path.0.clone());
        let open = OpenPlaces::open(true, small(), &state.0).unwrap();
        let from = open.address(v4(1));
        open.give(&line("a"), from, &tokens, NOW).unwrap();
        open.give(&line("b"), open.address(v4(2)), &tokens, NOW).unwrap();
        let place = line("a");
        assert!(open.may_create(&place, NOW) && open.may_create(&place, NOW));
        assert!(open.may_move(&place, NOW, 995));
        assert!(open.may_call(&place, NOW));
        assert!(open.may_forward(&place, NOW, 0) && open.may_forward(&place, NOW, 0));
        drop(open);
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mode = fs::metadata(&state.0).unwrap().permissions().mode();
            assert_eq!(mode & 0o777, 0o600);
        }

        let open = OpenPlaces::open(true, small(), &state.0).unwrap();
        assert!(!open.may_create(&place, NOW));
        assert!(!open.may_move(&place, NOW, 6) && open.may_move(&place, NOW, 5));
        assert!(open.may_call(&place, NOW) && !open.may_call(&place, NOW));
        assert!(open.may_forward(&place, NOW, 0) && !open.may_forward(&place, NOW, 0));
        // The day's places too: one more, then none.
        open.give(&line("c"), open.address(v4(3)), &tokens, NOW).unwrap();
        assert_eq!(open.give(&line("d"), open.address(v4(4)), &tokens, NOW), Err(Refused::Day));
        drop(open);
        // The next day starts again.
        let open = OpenPlaces::open(true, small(), &state.0).unwrap();
        assert!(open.may_create(&place, NOW + DAY));
        assert!(open.may_forward(&place, NOW + DAY, 0));
        open.give(&line("d"), open.address(v4(4)), &tokens, NOW + DAY).unwrap();
        drop(open);

        // A file that is not one of counts is left alone, and the relay told.
        fs::write(&state.0, b"something else").unwrap();
        assert!(OpenPlaces::open(true, small(), &state.0).is_err());
        assert_eq!(fs::read(&state.0).unwrap(), b"something else");
    }

    #[test]
    fn nothing_is_given_while_the_counts_cannot_be_kept() {
        let dir = TempPath::new("dir");
        fs::create_dir_all(&dir.0).unwrap();
        let path = TempPath::new("unkept-tokens");
        let tokens = Tokens::new(path.0.clone());
        let open = OpenPlaces::open(true, small(), &dir.0.join("counts")).unwrap();
        let place = line("a");
        open.give(&place, open.address(v4(1)), &tokens, NOW).unwrap();
        assert!(open.may_create(&place, NOW));
        // The disk goes: no place, no use, and no line.
        fs::remove_dir_all(&dir.0).unwrap();
        assert_eq!(
            open.give(&line("b"), open.address(v4(2)), &tokens, NOW),
            Err(Refused::Storage)
        );
        assert!(!tokens.has("b"));
        assert!(!open.may_create(&place, NOW) && !open.may_call(&place, NOW));
        assert!(!open.may_forward(&place, NOW, 0));
        // Back: given again.
        fs::create_dir_all(&dir.0).unwrap();
        open.give(&line("b"), open.address(v4(2)), &tokens, NOW).unwrap();
        assert!(open.may_create(&place, NOW));
        let _ = fs::remove_dir_all(&dir.0);
    }

    #[test]
    fn an_unused_open_place_goes_and_one_used_stays() {
        let path = TempPath::new("sweep-tokens");
        let state = TempPath::new("sweep-open");
        let tokens = Tokens::new(path.0.clone());
        let open = OpenPlaces::open(true, small(), &state.0).unwrap();
        let (used, unused) = (line("used"), line("unused"));
        open.give(&used, open.address(v4(1)), &tokens, NOW).unwrap();
        open.give(&unused, open.address(v4(2)), &tokens, NOW).unwrap();
        // A line of the operator's, never used, is none of the open places'.
        let (_, pixel) = tokens::new_token("pixel");
        let mut file = fs::OpenOptions::new().append(true).open(&path.0).unwrap();
        io::Write::write_all(&mut file, format!("{pixel}\n").as_bytes()).unwrap();
        drop(file);
        // Used on its fifth day, once a day written at most.
        open.used(&used, NOW + 5 * DAY);
        let written = fs::read(&state.0).unwrap();
        open.used(&used, NOW + 5 * DAY + 3600);
        assert_eq!(fs::read(&state.0).unwrap(), written);

        // Ten days unused is not more than ten: both stay.
        open.sweep(&tokens, NOW + 10 * DAY);
        assert!(tokens.has("used") && tokens.has("unused"));
        // Eleven: the one unused since it was made goes, and its record with it.
        open.sweep(&tokens, NOW + 11 * DAY);
        assert!(tokens.has("used") && !tokens.has("unused"));
        assert!(tokens.count() == 2 && !fs::read_to_string(&path.0).unwrap().contains(&tokens::to_hex(&unused)));
        assert!(!open.inner().kept.lines.contains_key(&unused));
        // The one used goes eleven days after it was last used, not before.
        open.sweep(&tokens, NOW + 15 * DAY);
        assert!(tokens.has("used"));
        open.sweep(&tokens, NOW + 16 * DAY);
        assert!(!tokens.has("used"));
        assert!(open.inner().kept.lines.is_empty());
        // The operator's line stays, used or not.
        assert_eq!(tokens.count(), 1);

        // Kept across a restart: the day it was last used counts, not the restart's.
        let kept = line("kept");
        open.give(&kept, open.address(v4(3)), &tokens, NOW + 16 * DAY).unwrap();
        open.used(&kept, NOW + 20 * DAY);
        drop(open);
        let open = OpenPlaces::open(true, small(), &state.0).unwrap();
        open.sweep(&tokens, NOW + 30 * DAY);
        assert!(tokens.has("kept"));
        open.sweep(&tokens, NOW + 31 * DAY);
        assert!(!tokens.has("kept"));
    }

    #[test]
    fn a_line_with_no_record_counts_from_the_first_look_that_sees_it() {
        let path = TempPath::new("unrecorded-tokens");
        let tokens = Tokens::new(path.0.clone());
        let open = OpenPlaces::in_memory(false, small());
        // One the relay gave on its day, before its counts were lost; one written by hand.
        let given = line("given");
        let by_hand = line("by hand");
        fs::write(
            &path.0,
            format!(
                "{} open-0a1b2c3d # open place on {}\n{} open-hand\n",
                tokens::to_hex(&given),
                invites::date(NOW),
                tokens::to_hex(&by_hand)
            ),
        )
        .unwrap();
        // Open places off: those there are open places all the same, and go unused. Both count
        // from the first look that saw them, whatever day is on the line, so a place still in use
        // when the counts were lost is not taken out before its phone connects again.
        open.sweep(&tokens, NOW + 3 * DAY);
        assert!(tokens.has("given") && tokens.has("by hand"));
        open.sweep(&tokens, NOW + 13 * DAY);
        assert!(tokens.has("given") && tokens.has("by hand"));
        // The day on the line is still the day it was made, for the tally.
        assert_eq!(open.inner().kept.lines.get(&given).map(|line| line.made), Some(NOW / DAY));
        open.sweep(&tokens, NOW + 14 * DAY);
        assert!(!tokens.has("given") && !tokens.has("by hand"));
    }

    #[test]
    fn an_open_place_never_used_after_its_day_goes_sooner() {
        let path = TempPath::new("first-tokens");
        let tokens = Tokens::new(path.0.clone());
        let limits = Limits {
            first_days: 3,
            ..small()
        };
        let open = OpenPlaces::in_memory(true, limits);
        let (back, once) = (line("back"), line("once"));
        open.give(&back, open.address(v4(1)), &tokens, NOW).unwrap();
        open.give(&once, open.address(v4(2)), &tokens, NOW).unwrap();
        // Two with no record: one the relay gave that day, its counts lost since, and one
        // written by hand, with no day on its line.
        let mut file = fs::OpenOptions::new().append(true).open(&path.0).unwrap();
        let more = format!(
            "{} open-0a1b2c3d # open place on {}\n{} open-hand\n",
            tokens::to_hex(&line("lost")),
            invites::date(NOW),
            tokens::to_hex(&line("hand"))
        );
        io::Write::write_all(&mut file, more.as_bytes()).unwrap();
        drop(file);
        // The first look sees them that day.
        open.sweep(&tokens, NOW + 3600);
        // One phone comes back the next day; the other connects again only that day.
        open.used(&back, NOW + DAY);
        open.used(&once, NOW + 2 * 3600);
        open.sweep(&tokens, NOW + 2 * DAY);
        assert_eq!(tokens.count(), 4);
        // Three days after the day they were made, those whose token never connected after it go:
        // `once`, and the one whose counts were lost, as the look saw it on that day.
        open.sweep(&tokens, NOW + 3 * DAY);
        assert!(
            tokens.has("back") && !tokens.has("once") && !tokens.has("lost") && tokens.has("hand")
        );
        // The others go once unused for more than ten days, as before: the one written by hand,
        // whose day nobody knows, never sooner.
        open.sweep(&tokens, NOW + 10 * DAY);
        assert!(tokens.has("back") && tokens.has("hand"));
        open.sweep(&tokens, NOW + 11 * DAY);
        assert!(tokens.has("back") && !tokens.has("hand"));
        open.sweep(&tokens, NOW + 12 * DAY);
        assert!(!tokens.has("back"));
    }

    #[test]
    fn a_place_goes_by_whichever_rule_comes_first() {
        let limits = Limits {
            unused_days: 10,
            first_days: 3,
            ..small()
        };
        let record = |made, used| Line { made, used };
        // Never used after the day it was made: three days after that day.
        assert!(!record(100, 100).goes(102, &limits) && record(100, 100).goes(103, &limits));
        // Used after it: more than ten days after that use.
        assert!(!record(100, 101).goes(111, &limits) && record(100, 101).goes(112, &limits));
        // The day it was made not known: by the ten days only.
        assert!(!record(0, 100).goes(110, &limits) && record(0, 100).goes(111, &limits));
        // First days set past the unused ones: those still take out a place never used.
        let late = Limits {
            first_days: 30,
            ..limits
        };
        assert!(!record(100, 100).goes(110, &late) && record(100, 100).goes(111, &late));
    }

    #[test]
    fn a_proxy_that_sends_no_forwarded_for_is_said_once_an_hour() {
        let open = OpenPlaces::in_memory(true, small());
        assert!(open.unforwarded(NOW));
        assert!(!open.unforwarded(NOW + 1));
        assert!(!open.unforwarded(NOW + UNFORWARDED_EVERY - 1));
        assert!(open.unforwarded(NOW + UNFORWARDED_EVERY));
        // A clock set back says nothing more before the hour is over.
        assert!(!open.unforwarded(NOW));
        // Nothing while open places are off: no phone is counted by its address then.
        assert!(!OpenPlaces::in_memory(false, small()).unforwarded(NOW));
    }

    #[test]
    fn the_file_of_counts_holds_nothing_of_an_address() {
        let path = TempPath::new("private-tokens");
        let state = TempPath::new("private-open");
        let tokens = Tokens::new(path.0.clone());
        let open = OpenPlaces::open(true, small(), &state.0).unwrap();
        let addresses = [v4(77), "2001:db8:1:2::5".parse::<IpAddr>().unwrap()];
        for (n, ip) in addresses.iter().enumerate() {
            open.give(&line(&n.to_string()), open.address(*ip), &tokens, NOW).unwrap();
        }
        // The header, the day and its count, then two lines of 48 bytes, and no use yet: nothing else.
        let kept = fs::read(&state.0).unwrap();
        assert_eq!(kept.len(), 8 + 8 + 4 + 4 + 2 * 48 + 4);
        let mut on_lines: Vec<[u8; 32]> = (0..2).map(|n| line(&n.to_string())).collect();
        on_lines.sort();
        let mut read: Vec<[u8; 32]> = Kept::decode(&kept).unwrap().lines.into_keys().collect();
        read.sort();
        assert_eq!(read, on_lines);
        let text = fs::read_to_string(&path.0).unwrap();
        for ip in addresses {
            assert!(!text.contains(&ip.to_string()));
            let octets = match ip {
                IpAddr::V4(v4) => v4.octets().to_vec(),
                IpAddr::V6(v6) => v6.octets()[..8].to_vec(),
            };
            assert!(!kept.windows(octets.len()).any(|w| w == octets.as_slice()));
        }
    }

    #[test]
    fn the_tally_counts_from_the_files_alone() {
        let state = TempPath::new("tally-open");
        let path = TempPath::new("tally-tokens");
        let tokens = Tokens::new(path.0.clone());
        let open = OpenPlaces::open(true, Limits { day: 100, places: 100, per_address: 100, ..small() }, &state.0).unwrap();
        let from = open.address(v4(1));
        // Made 20 days ago and used 3 days ago; made 5 days ago; made today.
        open.give(&line("old"), from, &tokens, NOW - 20 * DAY).unwrap();
        open.used(&line("old"), NOW - 3 * DAY);
        open.give(&line("week"), from, &tokens, NOW - 5 * DAY).unwrap();
        open.give(&line("new"), from, &tokens, NOW).unwrap();
        // One written by hand, and a line that is no open place.
        let (_, pixel) = tokens::new_token("pixel");
        let mut text = fs::read_to_string(&path.0).unwrap();
        text.push_str(&format!("{pixel}\n{} open-hand\n", tokens::to_hex(&line("hand"))));
        let kept = fs::read(&state.0).unwrap();
        let tally = tally(&text, Some(kept.as_slice()), NOW).unwrap();
        assert_eq!(
            tally,
            Tally {
                places: 4,
                made_today: 1,
                made_week: 2,
                used_today: 1,
                used_week: 3,
                used_month: 3,
            }
        );
        // With no file of counts, from the days on the lines.
        let tally = super::tally(&text, None, NOW).unwrap();
        assert_eq!((tally.places, tally.made_week, tally.used_month), (4, 2, 3));
        assert_eq!(super::tally(&text, Some(&b"something else"[..]), NOW), None);
    }

    #[test]
    fn counts_read_back_as_written_and_whole_only() {
        let mut kept = Kept {
            day: NOW / DAY,
            given: 7,
            ..Kept::default()
        };
        for n in 0..50u8 {
            kept.lines.insert([n; 32], Line { made: u64::from(n), used: u64::from(n) + 1 });
            let forwards = u32::from(n) * 100 + 1;
            kept.today.insert(
                [n; 32],
                Used {
                    queues: n.into(),
                    bytes: 1 << n.min(40),
                    calls: 2,
                    forwards,
                },
            );
        }
        let bytes = kept.encode();
        assert_eq!(bytes.len(), 8 + 8 + 4 + 4 + 50 * 48 + 4 + 50 * 52);
        assert_eq!(Kept::decode(&bytes), Some(kept));
        assert_eq!(Kept::decode(&bytes[..bytes.len() - 1]), None);
        assert_eq!(Kept::decode(&[bytes.as_slice(), b"x"].concat()), None);
        assert_eq!(Kept::decode(b"EREVOSL1"), None);
        let mut more = Kept::default().encode();
        more[8 + 8 + 4..8 + 8 + 4 + 4].copy_from_slice(&u32::MAX.to_be_bytes());
        assert_eq!(Kept::decode(&more), None);
    }
}
