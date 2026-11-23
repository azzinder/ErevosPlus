// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! One-way queues in the style of SimpleX's SMP: each queue has a sender id
//! and a separate recipient id, so the relay cannot link the two from what a
//! client asks for, and senders cannot read or delete what they sent.
//!
//! A store opened from a journal (see `journal.rs`) writes every change to
//! disk before applying it, so queues and waiting messages survive a restart.
//! `Store::default()` keeps everything in memory only.
//!
//! A message nobody takes expires after `ttl` (14 days unless set), as on
//! Session's nodes, so the relay does not keep it forever. The relay notes
//! only the hour each message came, not the second.
//!
//! The store holds at most `max_queues` queues (100000 unless set), places
//! lent to phones without a relay among them; past that, a new one is
//! refused with `Full`. A queue its recipient has not used (taken from,
//! waited on) for `queue_ttl` (180 days unless set) expires, with whatever
//! waits in it, so queues of phones that are gone do not fill the relay.
//! Sending to a queue does not count, so a sender cannot keep one alive. The
//! relay notes only the day a queue was last used, and writes it down at most
//! once a day a queue. A queue from a journal written before relays noted
//! that counts as used the day it was read back.
//!
//! Each queue also keeps, in memory, what came into it since its recipient
//! last found it empty, by what each send said it carries (`News`): so a
//! phone can be told how many messages wait in a queue it cannot read now, as
//! hidden chats' while they are closed, and not of word between phones.
//!
//! A relay stopped cleanly (see `stop.rs`) keeps the news of every queue that
//! has some in `<journal>.news`, with the journal's length and SHA-256 as it
//! was then, and takes them back at the next start: so a phone that was told
//! of a round is not told of it again as new. The file is taken back only
//! when the journal is still exactly the one it was kept with, and removed
//! before anything else happens, so news kept once are never taken back after
//! the queues changed. Older relays leave the file alone, and do not write it.
//! Otherwise, after a crash say, a queue with something waiting counts it as
//! one send that did not say, in a new round: a phone may be told of messages
//! twice, and never misses one.
//!
//! Each message counts its length and `KEEPING` bytes against what the store
//! holds: at most `max_bytes` in all (1 GiB unless set), and of that at most
//! `share` (64 MiB unless set) in the queues one phone made with a token of its
//! own or a lent one, so one phone cannot fill the relay for everyone. Past
//! either, a send is refused with `Full`, as for a full queue. Which phone made
//! a queue is kept in memory only, as which phone held a request for later
//! is: a queue read back from the journal, or made with the relay's own
//! token, counts in the whole only. A journal that holds more than
//! `max_bytes`, from before the cap or from a time it was set higher, is read
//! back without the oldest messages past it, so the relay starts rather than
//! running out of memory at every start.
//!
//! A phone that keeps what it takes (`take`) is handed the oldest message
//! with its number and the message stays, handed over again at each take,
//! until the phone says it has it (`ack`). So a message whose reply was lost
//! with the connection is not lost with it; a phone may be handed one twice,
//! and its chats take it once. Only the oldest is ever out, so at most one
//! message a queue waits so for its phone, whatever the connections.

use std::collections::{hash_map, BTreeMap, HashMap, VecDeque};
use std::io;
use std::io::{ErrorKind, Read};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use rand::RngCore;
use sha2::{Digest, Sha256};

use crate::journal::{self, Journal, Record};

pub type QueueId = [u8; 24];

/// Messages a queue holds before it refuses more, so one sender cannot fill
/// the relay.
pub const MAX_QUEUED: usize = 1000;

/// Bytes the store holds in all unless set (`EREVOS_RELAY_QUEUED_MB`).
pub const DEFAULT_MAX_BYTES: usize = 1024 << 20;
/// Bytes the queues one phone made hold unless set
/// (`EREVOS_RELAY_QUEUED_PER_PHONE_MB`).
pub const DEFAULT_SHARE: usize = 64 << 20;
/// Bytes each message counts beyond its length: what keeping it costs, so
/// that a flood of empty messages counts too.
pub const KEEPING: usize = 64;

/// What a message of `len` bytes counts against the caps.
fn cost(len: usize) -> usize {
    len + KEEPING
}

/// Who made a queue, for its share of the bytes queued: the SHA-256 of a
/// phone's own token, or what stands for a lent one (see `server.rs`).
pub type Owner = [u8; 32];

/// How long a message waits for its recipient before it expires.
pub const DEFAULT_TTL: u64 = 14 * 24 * 60 * 60;
/// Queues the relay holds unless set (`EREVOS_RELAY_MAX_QUEUES`).
pub const DEFAULT_MAX_QUEUES: usize = 100_000;
/// How long a queue its recipient does not use lasts unless set
/// (`EREVOS_RELAY_QUEUE_DAYS`).
pub const DEFAULT_QUEUE_TTL: u64 = 180 * DAY;
pub(crate) const HOUR: u64 = 60 * 60;
pub(crate) const DAY: u64 = 24 * HOUR;

/// Unix seconds now. A clock before 1970 counts as 1970.
pub(crate) fn system_now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |d| d.as_secs())
}

#[derive(Debug, PartialEq, Eq)]
pub enum QueueError {
    NotFound,
    Full,
    /// The change could not be written to the journal, so nothing changed.
    Storage,
}

struct Queue {
    sender_id: QueueId,
    /// Oldest first, each with the hour it came.
    messages: VecDeque<(u64, Vec<u8>)>,
    /// The day its recipient last used it, Unix seconds at its start.
    used: u64,
    /// What came since its recipient last found it empty.
    news: News,
    /// The number of its oldest message, which a phone that keeps what it
    /// takes gives back to have it deleted (`ack`). Random where the queue
    /// was made or read back, and one more for each message that goes, so a
    /// number from before a restart names nothing after it.
    first: u64,
    /// Who made it, in memory only: none for a queue read back from the
    /// journal, or made with the relay's own token.
    owner: Option<Owner>,
    /// While the journal is read back only: how many of the messages at its
    /// front were emptied to keep under `max_bytes`. They keep their places,
    /// so the records that take them later take the right ones.
    dropped: usize,
}

impl Queue {
    fn new(sender_id: QueueId, used: u64, owner: Option<Owner>) -> Queue {
        Queue {
            sender_id,
            messages: VecDeque::new(),
            used,
            news: News::default(),
            first: rand::rngs::OsRng.next_u64(),
            owner,
            dropped: 0,
        }
    }

    /// Bytes its messages count against the caps.
    fn bytes(&self) -> usize {
        self.messages
            .iter()
            .skip(self.dropped)
            .map(|(_, msg)| cost(msg.len()))
            .sum()
    }
}

/// Bytes held in all, and in the queues of each phone that made some.
#[derive(Default)]
struct Usage {
    total: usize,
    by_owner: HashMap<Owner, usize>,
}

impl Usage {
    fn add(&mut self, owner: Option<Owner>, n: usize) {
        self.total += n;
        if let Some(owner) = owner {
            *self.by_owner.entry(owner).or_default() += n;
        }
    }

    fn sub(&mut self, owner: Option<Owner>, n: usize) {
        self.total = self.total.saturating_sub(n);
        if let Some(hash_map::Entry::Occupied(mut e)) = owner.map(|o| self.by_owner.entry(o)) {
            let left = e.get().saturating_sub(n);
            if left == 0 {
                e.remove();
            } else {
                *e.get_mut() = left;
            }
        }
    }

    fn of(&self, owner: &Owner) -> usize {
        self.by_owner.get(owner).copied().unwrap_or(0)
    }
}

/// Takes the oldest message out of `q`, and what it counted out of `usage`.
fn pop(usage: &mut Usage, q: &mut Queue) -> Option<Vec<u8>> {
    let (_, msg) = q.messages.pop_front()?;
    q.first = q.first.wrapping_add(1);
    if q.dropped > 0 {
        q.dropped -= 1;
    } else {
        usage.sub(q.owner, cost(msg.len()));
    }
    Some(msg)
}

/// Every message not emptied yet, by the hour it came, for `drop_oldest`.
fn by_hour(queues: &HashMap<QueueId, Queue>) -> BTreeMap<u64, Vec<QueueId>> {
    let mut hours: BTreeMap<u64, Vec<QueueId>> = BTreeMap::new();
    for (id, q) in queues {
        for (at, _) in q.messages.iter().skip(q.dropped) {
            hours.entry(*at).or_default().push(*id);
        }
    }
    hours
}

/// What a send said it carries.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Said {
    /// A message someone reads.
    Message,
    /// Word between phones, such as that a message came or new keys.
    Quiet,
    /// A call that rings.
    Ring,
    /// It did not say: perhaps a message.
    Unknown,
}

/// What came into a queue since its recipient last found it empty.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct News {
    /// Random, new each time something comes into a queue found empty; 0
    /// while nothing came since.
    pub round: u32,
    /// Messages.
    pub messages: u32,
    /// Sends that did not say what they carry.
    pub unmarked: u32,
    /// Calls that rang.
    pub rings: u32,
}

impl News {
    fn came(&mut self, said: Said) {
        if self.round == 0 {
            self.round = new_round();
        }
        let counted = match said {
            Said::Quiet => return,
            Said::Message => &mut self.messages,
            Said::Ring => &mut self.rings,
            Said::Unknown => &mut self.unmarked,
        };
        *counted = counted.saturating_add(1);
    }
}

fn new_round() -> u32 {
    rand::rngs::OsRng.next_u32().max(1)
}

/// The first bytes of the file of news kept at a stop.
const NEWS_HEADER: &[u8; 8] = b"EREVOSN1";
/// Bytes of each queue's news in it: recipient id, round, messages, sends
/// that did not say, rings.
const NEWS_ENTRY: usize = 24 + 4 * 4;

/// Where the news are kept at a stop, beside the journal at `journal`.
pub fn news_path(journal: &Path) -> PathBuf {
    let mut path = journal.as_os_str().to_owned();
    path.push(".news");
    PathBuf::from(path)
}

/// The length and SHA-256 of the file at `path`.
fn fingerprint(path: &Path) -> io::Result<(u64, [u8; 32])> {
    let mut file = std::fs::File::open(path)?;
    let mut hash = Sha256::new();
    let mut buf = vec![0u8; 64 * 1024];
    let mut len = 0u64;
    loop {
        match file.read(&mut buf) {
            Ok(0) => return Ok((len, hash.finalize().into())),
            Ok(n) => {
                hash.update(&buf[..n]);
                len += n as u64;
            }
            Err(e) if e.kind() == ErrorKind::Interrupted => {}
            Err(e) => return Err(e),
        }
    }
}

/// The news kept at the last stop beside the journal at `journal`, if they
/// were kept for that journal exactly as it is now. The file goes either way,
/// before this returns: news that cannot be removed are not taken, so they
/// are never taken a second time, after the queues changed.
fn take_news(journal: &Path) -> Vec<(QueueId, News)> {
    let path = news_path(journal);
    let bytes = match std::fs::read(&path) {
        Ok(bytes) => bytes,
        Err(e) if e.kind() == ErrorKind::NotFound => return Vec::new(),
        Err(e) => {
            elog!("erevos-relay: cannot read the news kept at the last stop, so they start afresh: {e}");
            let _ = std::fs::remove_file(&path);
            return Vec::new();
        }
    };
    if let Err(e) = std::fs::remove_file(&path).and_then(|()| journal::sync_dir(&path)) {
        elog!("erevos-relay: cannot remove the news kept at the last stop, so they start afresh: {e}");
        return Vec::new();
    }
    let head = NEWS_HEADER.len() + 8 + 32;
    if bytes.len() < head
        || &bytes[..NEWS_HEADER.len()] != NEWS_HEADER
        || !(bytes.len() - head).is_multiple_of(NEWS_ENTRY)
    {
        elog!("erevos-relay: the news kept at the last stop cannot be read, so they start afresh");
        return Vec::new();
    }
    let len = u64::from_be_bytes(bytes[8..16].try_into().unwrap_or_default());
    let matches = match fingerprint(journal) {
        Ok((now_len, hash)) => now_len == len && hash[..] == bytes[16..48],
        Err(e) if e.kind() == ErrorKind::NotFound => false,
        Err(e) => {
            elog!("erevos-relay: cannot read the journal to check the news kept at the last stop, so they start afresh: {e}");
            return Vec::new();
        }
    };
    if !matches {
        elog!("erevos-relay: the news kept at the last stop are of another journal (changed since, by an older relay say), so they start afresh");
        return Vec::new();
    }
    let word = |b: &[u8]| u32::from_be_bytes([b[0], b[1], b[2], b[3]]);
    (head..bytes.len())
        .step_by(NEWS_ENTRY)
        .map(|at| &bytes[at..at + NEWS_ENTRY])
        .filter_map(|entry| {
            let mut id = [0u8; 24];
            id.copy_from_slice(&entry[..24]);
            let news = News {
                round: word(&entry[24..]),
                messages: word(&entry[28..]),
                unmarked: word(&entry[32..]),
                rings: word(&entry[36..]),
            };
            (news.round != 0).then_some((id, news))
        })
        .collect()
}

pub struct Store {
    queues: HashMap<QueueId, Queue>,
    by_sender: HashMap<QueueId, QueueId>,
    journal: Option<Journal>,
    ttl: u64,
    max_queues: usize,
    queue_ttl: u64,
    max_bytes: usize,
    share: usize,
    usage: Usage,
    /// While the journal is read back past `max_bytes` only: the messages by
    /// the hour they came, and how many were emptied.
    oldest: Option<BTreeMap<u64, Vec<QueueId>>>,
    dropped: usize,
    clock: fn() -> u64,
}

impl Default for Store {
    fn default() -> Self {
        Store {
            queues: HashMap::new(),
            by_sender: HashMap::new(),
            journal: None,
            ttl: DEFAULT_TTL,
            max_queues: DEFAULT_MAX_QUEUES,
            queue_ttl: DEFAULT_QUEUE_TTL,
            max_bytes: DEFAULT_MAX_BYTES,
            share: DEFAULT_SHARE,
            usage: Usage::default(),
            oldest: None,
            dropped: 0,
            clock: system_now,
        }
    }
}

pub struct NewQueue {
    pub recipient_id: QueueId,
    pub sender_id: QueueId,
}

fn random_id() -> QueueId {
    let mut id = [0u8; 24];
    rand::rngs::OsRng.fill_bytes(&mut id);
    id
}

/// Records that rebuild `queues` from nothing: each queue, then its waiting
/// messages oldest first.
fn records(queues: &HashMap<QueueId, Queue>) -> impl Iterator<Item = Record<'_>> {
    queues.iter().flat_map(|(recipient_id, q)| {
        std::iter::once(Record::Create {
            recipient_id: *recipient_id,
            sender_id: q.sender_id,
            used: q.used,
        })
        .chain(q.messages.iter().map(|(at, message)| Record::Send {
            recipient_id: *recipient_id,
            at: *at,
            message,
        }))
    })
}

/// Writes `record` to the journal, if there is one.
fn log(journal: &mut Option<Journal>, record: &Record) -> Result<(), QueueError> {
    let Some(journal) = journal else {
        return Ok(());
    };
    journal.append(record).map_err(|e| {
        elog!("erevos-relay: cannot write the journal: {e}");
        QueueError::Storage
    })
}

impl Store {
    #[cfg(test)]
    pub fn open(path: &Path) -> io::Result<Store> {
        Store::open_with(path, DEFAULT_TTL, DEFAULT_MAX_BYTES)
    }

    /// Opens the store kept in the journal at `path`, or starts an empty one
    /// there if the file does not exist yet, with messages expiring after
    /// `ttl` seconds, holding `max_bytes` at most. The file is rewritten on
    /// the way, which drops received and expired messages and deleted queues
    /// from it, and the oldest messages past `max_bytes`.
    pub fn open_with(path: &Path, ttl: u64, max_bytes: usize) -> io::Result<Store> {
        Store::open_clocked(path, ttl, max_bytes, system_now)
    }

    fn open_clocked(path: &Path, ttl: u64, max_bytes: usize, clock: fn() -> u64) -> io::Result<Store> {
        let mut store = Store {
            ttl,
            max_bytes,
            clock,
            ..Store::default()
        };
        let replayed = journal::replay(path, |record| store.apply(record))?;
        let skipped = replayed.skipped;
        if replayed.damaged {
            // Rewritten below without what comes after the damage: kept as it was first.
            let kept = journal::keep_damaged(path, (store.clock)()).map_err(|e| {
                io::Error::new(
                    e.kind(),
                    format!("{} is damaged {skipped} bytes before its end, and cannot be kept as it is before it is rewritten without them: {e}", path.display()),
                )
            })?;
            elog!(
                "erevos-relay: {} is damaged {skipped} bytes before its end: what comes before was read, what comes after was not; the file as it was is kept in {}",
                path.display(),
                kept.display()
            );
        } else if skipped > 0 {
            elog!(
                "erevos-relay: skipped {skipped} bytes at the end of {}: its last record is cut short or damaged, most likely by a write that did not finish",
                path.display()
            );
        }
        if store.dropped > 0 {
            elog!(
                "erevos-relay: {} holds more messages than the {} MiB the relay keeps (EREVOS_RELAY_QUEUED_MB), so its {} oldest were dropped",
                path.display(),
                max_bytes >> 20,
                store.dropped
            );
        }
        for q in store.queues.values_mut() {
            q.messages.drain(..q.dropped);
            q.dropped = 0;
        }
        store.oldest = None;
        let kept = take_news(path);
        let mut taken = 0;
        for (id, news) in kept {
            if let Some(q) = store.queues.get_mut(&id) {
                q.news = news;
                taken += 1;
            }
        }
        if taken > 0 {
            elog!("erevos-relay: took back the news of {taken} queues, kept at the last stop");
        }
        store.drop_expired();
        store.journal = Some(Journal::create(path, records(&store.queues))?);
        Ok(store)
    }

    /// An in-memory store whose messages expire after `ttl` seconds.
    pub fn with_ttl(ttl: u64) -> Store {
        Store {
            ttl,
            ..Store::default()
        }
    }

    /// The same store, holding at most `max` queues, each expiring once its
    /// recipient has not used it for `ttl` seconds.
    pub fn with_queue_limits(self, max: usize, ttl: u64) -> Store {
        Store {
            max_queues: max,
            queue_ttl: ttl,
            ..self
        }
    }

    /// The same store, holding at most `most` bytes of messages in all, and
    /// `share` in the queues one phone made.
    pub fn with_byte_limits(self, most: usize, share: usize) -> Store {
        Store {
            max_bytes: most,
            share,
            ..self
        }
    }

    /// The hour that holds now, the time noted for a message that comes now.
    fn hour(&self) -> u64 {
        ((self.clock)() / HOUR * HOUR).max(1)
    }

    /// The day that holds now, the time noted for a queue used now.
    fn today(&self) -> u64 {
        ((self.clock)() / DAY * DAY).max(1)
    }

    /// Notes that the queue's recipient used it today, in the journal too the
    /// first time a day. A failed write is said and left: the day is kept in
    /// memory and goes into the next rewrite of the journal, and a day
    /// missing after a restart only lets the queue expire a little sooner.
    fn touch(&mut self, recipient_id: &QueueId) {
        let today = self.today();
        let Some(q) = self.queues.get_mut(recipient_id) else {
            return;
        };
        if q.used >= today {
            return;
        }
        q.used = today;
        let _ = log(
            &mut self.journal,
            &Record::Used {
                recipient_id: *recipient_id,
                day: today,
            },
        );
    }

    /// Whether the store has room for one more queue.
    pub fn has_room(&self) -> bool {
        self.queues.len() < self.max_queues
    }

    /// Removes every queue its recipient has not used for `queue_ttl`, with
    /// what waits in it, and returns their recipient ids. The relay calls this
    /// now and then.
    pub fn expire_queues(&mut self) -> Vec<QueueId> {
        let now = (self.clock)();
        let old: Vec<QueueId> = self
            .queues
            .iter()
            .filter(|(_, q)| q.used.saturating_add(self.queue_ttl) <= now)
            .map(|(id, _)| *id)
            .collect();
        let mut gone = Vec::with_capacity(old.len());
        for id in old {
            if self.delete(&id).is_err() {
                break;
            }
            gone.push(id);
        }
        gone
    }

    fn expired(&self, at: u64) -> bool {
        at.saturating_add(self.ttl) <= (self.clock)()
    }

    /// Drops expired messages from memory only, while opening: the journal
    /// written right after leaves them out.
    fn drop_expired(&mut self) {
        let (now, ttl) = ((self.clock)(), self.ttl);
        for q in self.queues.values_mut() {
            let owner = q.owner;
            let usage = &mut self.usage;
            q.messages.retain(|(at, msg)| {
                let keep = at.saturating_add(ttl) > now;
                if !keep {
                    usage.sub(owner, cost(msg.len()));
                }
                keep
            });
        }
    }

    /// Removes expired messages from the front of one queue, noting each in
    /// the journal as taken.
    fn expire_queue(&mut self, recipient_id: &QueueId) -> Result<(), QueueError> {
        loop {
            let Some(q) = self.queues.get(recipient_id) else {
                return Ok(());
            };
            match q.messages.front() {
                Some((at, _)) if self.expired(*at) => {}
                _ => return Ok(()),
            }
            log(
                &mut self.journal,
                &Record::Receive {
                    recipient_id: *recipient_id,
                },
            )?;
            if let Some(q) = self.queues.get_mut(recipient_id) {
                pop(&mut self.usage, q);
            }
        }
    }

    /// Removes every expired message. The relay calls this now and then, so
    /// messages for queues nobody looks at go too. Returns how many went.
    pub fn expire(&mut self) -> usize {
        let ids: Vec<QueueId> = self.queues.keys().copied().collect();
        let before: usize = self.queues.values().map(|q| q.messages.len()).sum();
        for id in ids {
            if self.expire_queue(&id).is_err() {
                break;
            }
        }
        let after: usize = self.queues.values().map(|q| q.messages.len()).sum();
        self.tidy();
        before - after
    }

    /// Applies a record read back from the journal.
    fn apply(&mut self, record: Record) {
        match record {
            Record::Create {
                recipient_id,
                sender_id,
                used,
            } => {
                // A record from before relays noted the day counts from now.
                let used = if used == 0 { self.today() } else { used };
                if let Some(old) = self.queues.insert(recipient_id, Queue::new(sender_id, used, None)) {
                    self.usage.sub(old.owner, old.bytes());
                }
                self.by_sender.insert(sender_id, recipient_id);
            }
            Record::Used { recipient_id, day } => {
                if let Some(q) = self.queues.get_mut(&recipient_id) {
                    q.used = q.used.max(day);
                }
            }
            Record::Send {
                recipient_id,
                at,
                message,
            } => {
                // A record from before relays noted the time counts from now.
                let at = if at == 0 { self.hour() } else { at };
                if let Some(q) = self.queues.get_mut(&recipient_id) {
                    q.messages.push_back((at, message.to_vec()));
                    self.usage.add(q.owner, cost(message.len()));
                    if let Some(hours) = &mut self.oldest {
                        hours.entry(at).or_default().push(recipient_id);
                    }
                    if self.usage.total > self.max_bytes {
                        self.drop_oldest();
                    }
                }
            }
            Record::Receive { recipient_id } => {
                if let Some(q) = self.queues.get_mut(&recipient_id) {
                    pop(&mut self.usage, q);
                }
            }
            Record::Delete { recipient_id } => {
                if let Some(q) = self.queues.remove(&recipient_id) {
                    self.usage.sub(q.owner, q.bytes());
                    self.by_sender.remove(&q.sender_id);
                }
            }
        }
    }

    /// While the journal is read back past `max_bytes`: empties the oldest
    /// messages, by the hour each came, until the rest fit. An emptied message
    /// keeps its place in its queue until the records are all read, as a
    /// record that takes it may come later.
    fn drop_oldest(&mut self) {
        let hours = self.oldest.get_or_insert_with(|| by_hour(&self.queues));
        while self.usage.total > self.max_bytes {
            let Some(mut entry) = hours.first_entry() else {
                // Each hour was gone through: what is left is listed again
                // (a clock set back can leave a message behind a newer one).
                *hours = by_hour(&self.queues);
                if hours.is_empty() {
                    return;
                }
                continue;
            };
            let hour = *entry.key();
            let id = entry.get_mut().pop();
            if entry.get().is_empty() {
                entry.remove();
            }
            let Some(q) = id.and_then(|id| self.queues.get_mut(&id)) else {
                continue;
            };
            // Listed for a message taken since, maybe: then only one as old.
            if let Some((at, msg)) = q.messages.get_mut(q.dropped) {
                if *at <= hour {
                    let msg = std::mem::take(msg);
                    self.usage.sub(q.owner, cost(msg.len()));
                    q.dropped += 1;
                    self.dropped += 1;
                }
            }
        }
    }

    /// A new queue, or `Full` when the store holds `max_queues` already.
    #[cfg(test)]
    pub fn create(&mut self) -> Result<NewQueue, QueueError> {
        self.create_for(None)
    }

    /// A new queue made by `owner`, whose share of the bytes queued it counts
    /// in, or `Full` when the store holds `max_queues` already.
    pub fn create_for(&mut self, owner: Option<Owner>) -> Result<NewQueue, QueueError> {
        if !self.has_room() {
            return Err(QueueError::Full);
        }
        let recipient_id = random_id();
        let sender_id = random_id();
        let used = self.today();
        log(
            &mut self.journal,
            &Record::Create {
                recipient_id,
                sender_id,
                used,
            },
        )?;
        self.queues
            .insert(recipient_id, Queue::new(sender_id, used, owner));
        self.by_sender.insert(sender_id, recipient_id);
        self.tidy();
        Ok(NewQueue {
            recipient_id,
            sender_id,
        })
    }

    /// The queue a sender id sends to, if it is here.
    pub fn recipient_of(&self, sender_id: &QueueId) -> Option<QueueId> {
        self.by_sender.get(sender_id).copied()
    }

    /// Queues `msg` as a send that did not say what it carries.
    #[cfg(test)]
    pub fn send(&mut self, sender_id: &QueueId, msg: Vec<u8>) -> Result<(), QueueError> {
        self.send_said(sender_id, msg, Said::Unknown)
    }

    /// Queues `msg`, counted in the queue's news as `said` says.
    pub fn send_said(
        &mut self,
        sender_id: &QueueId,
        msg: Vec<u8>,
        said: Said,
    ) -> Result<(), QueueError> {
        let rid = *self.by_sender.get(sender_id).ok_or(QueueError::NotFound)?;
        self.expire_queue(&rid)?;
        let at = self.hour();
        let q = self.queues.get_mut(&rid).ok_or(QueueError::NotFound)?;
        let cost = cost(msg.len());
        if q.messages.len() >= MAX_QUEUED
            || self.usage.total + cost > self.max_bytes
            || q.owner.is_some_and(|owner| self.usage.of(&owner) + cost > self.share)
        {
            return Err(QueueError::Full);
        }
        log(
            &mut self.journal,
            &Record::Send {
                recipient_id: rid,
                at,
                message: &msg,
            },
        )?;
        q.messages.push_back((at, msg));
        self.usage.add(q.owner, cost);
        q.news.came(said);
        self.tidy();
        Ok(())
    }

    /// Counts one message in the queue's news, keeping nothing: a Matrix
    /// homeserver's push (see `matrix_push.rs`), which says only that
    /// something came. Nothing waits in the queue for it, and nothing is
    /// written to the journal; the count is kept at a clean stop, as all news
    /// are, and goes at a crash.
    pub fn wake(&mut self, sender_id: &QueueId) -> Result<(), QueueError> {
        let rid = *self.by_sender.get(sender_id).ok_or(QueueError::NotFound)?;
        self.expire_queue(&rid)?;
        let q = self.queues.get_mut(&rid).ok_or(QueueError::NotFound)?;
        q.news.came(Said::Message);
        Ok(())
    }

    /// Hands over the oldest message and deletes it from the relay.
    pub fn receive(&mut self, recipient_id: &QueueId) -> Result<Option<Vec<u8>>, QueueError> {
        self.expire_queue(recipient_id)?;
        self.touch(recipient_id);
        let q = self
            .queues
            .get_mut(recipient_id)
            .ok_or(QueueError::NotFound)?;
        if q.messages.is_empty() {
            // What comes from now on counts from nothing.
            q.news = News::default();
            return Ok(None);
        }
        log(
            &mut self.journal,
            &Record::Receive {
                recipient_id: *recipient_id,
            },
        )?;
        let msg = pop(&mut self.usage, q);
        self.tidy();
        Ok(msg)
    }

    /// Hands over the oldest message with its number, and keeps it: handed
    /// over again at each take until the recipient says it has it (`ack`).
    /// With `kept`, the message of that number is deleted first, as `ack`
    /// does, so a phone that takes one after another says it has each with
    /// the next take.
    pub fn take(
        &mut self,
        recipient_id: &QueueId,
        kept: Option<u64>,
    ) -> Result<Option<(u64, Vec<u8>)>, QueueError> {
        if let Some(number) = kept {
            self.ack(recipient_id, number)?;
        }
        self.expire_queue(recipient_id)?;
        self.touch(recipient_id);
        let q = self
            .queues
            .get_mut(recipient_id)
            .ok_or(QueueError::NotFound)?;
        match q.messages.front() {
            Some((_, msg)) => Ok(Some((q.first, msg.clone()))),
            None => {
                // What comes from now on counts from nothing.
                q.news = News::default();
                Ok(None)
            }
        }
    }

    /// Deletes the message numbered `number`, which `take` handed over, if
    /// it is still the oldest in the queue. One that went already, or a
    /// number from before a restart, leaves the queue as it is: saying it
    /// twice is harmless.
    pub fn ack(&mut self, recipient_id: &QueueId, number: u64) -> Result<(), QueueError> {
        self.expire_queue(recipient_id)?;
        self.touch(recipient_id);
        let q = self.queues.get(recipient_id).ok_or(QueueError::NotFound)?;
        if q.messages.is_empty() || q.first != number {
            return Ok(());
        }
        log(
            &mut self.journal,
            &Record::Receive {
                recipient_id: *recipient_id,
            },
        )?;
        if let Some(q) = self.queues.get_mut(recipient_id) {
            pop(&mut self.usage, q);
        }
        self.tidy();
        Ok(())
    }

    /// Whether a message waits in the queue. Nothing is taken. Asked by the
    /// queue's recipient, so it counts as a use.
    pub fn has_waiting(&mut self, recipient_id: &QueueId) -> Result<bool, QueueError> {
        self.expire_queue(recipient_id)?;
        self.touch(recipient_id);
        let q = self.queues.get(recipient_id).ok_or(QueueError::NotFound)?;
        Ok(!q.messages.is_empty())
    }

    /// What came into the queue since its recipient last found it empty.
    /// Nothing is taken. Asked by the queue's recipient, so it counts as a
    /// use. What waits from before a restart whose news were not kept counts
    /// as one send that did not say.
    pub fn news(&mut self, recipient_id: &QueueId) -> Result<News, QueueError> {
        self.expire_queue(recipient_id)?;
        self.touch(recipient_id);
        let q = self
            .queues
            .get_mut(recipient_id)
            .ok_or(QueueError::NotFound)?;
        if q.news.round == 0 && !q.messages.is_empty() {
            q.news.came(Said::Unknown);
        }
        Ok(q.news)
    }

    /// Keeps the news of every queue that has some beside the journal, with
    /// the journal's length and SHA-256 as it is now, for the next start to
    /// take back (see `take_news`). Called at a clean stop, holding the lock
    /// until the process ends, so nothing changes after. `None` for a store
    /// with no journal, which keeps nothing; else how many queues' news.
    pub fn keep_news(&self) -> io::Result<Option<usize>> {
        let Some(journal) = &self.journal else {
            return Ok(None);
        };
        let (len, hash) = fingerprint(journal.path())?;
        let mut out = NEWS_HEADER.to_vec();
        out.extend_from_slice(&len.to_be_bytes());
        out.extend_from_slice(&hash);
        let mut kept = 0;
        for (id, q) in &self.queues {
            if q.news.round == 0 {
                continue;
            }
            out.extend_from_slice(id);
            for n in [q.news.round, q.news.messages, q.news.unmarked, q.news.rings] {
                out.extend_from_slice(&n.to_be_bytes());
            }
            kept += 1;
        }
        journal::write_whole(&news_path(journal.path()), &out)?;
        Ok(Some(kept))
    }

    pub fn delete(&mut self, recipient_id: &QueueId) -> Result<(), QueueError> {
        if !self.queues.contains_key(recipient_id) {
            return Err(QueueError::NotFound);
        }
        log(
            &mut self.journal,
            &Record::Delete {
                recipient_id: *recipient_id,
            },
        )?;
        if let Some(q) = self.queues.remove(recipient_id) {
            self.usage.sub(q.owner, q.bytes());
            self.by_sender.remove(&q.sender_id);
        }
        self.tidy();
        Ok(())
    }

    /// Rewrites the journal when most of it is received messages and deleted
    /// queues. A failed rewrite keeps the old file, which is still correct.
    fn tidy(&mut self) {
        let Some(journal) = self.journal.as_mut() else {
            return;
        };
        if !journal.due() {
            return;
        }
        let live = journal::size(records(&self.queues));
        if let Err(e) = journal.tidy(live, records(&self.queues)) {
            elog!("erevos-relay: cannot rewrite the journal, keeping the old one: {e}");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;
    use std::sync::atomic::{AtomicUsize, Ordering};

    #[test]
    fn delivers_in_order_and_deletes_on_receive() {
        let mut s = Store::default();
        let q = s.create().unwrap();
        s.send(&q.sender_id, b"one".to_vec()).unwrap();
        s.send(&q.sender_id, b"two".to_vec()).unwrap();
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"one");
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"two");
        assert_eq!(s.receive(&q.recipient_id).unwrap(), None);
    }

    #[test]
    fn ids_are_not_interchangeable() {
        let mut s = Store::default();
        let q = s.create().unwrap();
        assert_eq!(s.receive(&q.sender_id), Err(QueueError::NotFound));
        assert_eq!(s.send(&q.recipient_id, vec![1]), Err(QueueError::NotFound));
    }

    #[test]
    fn full_and_deleted_queues() {
        let mut s = Store::default();
        let q = s.create().unwrap();
        for _ in 0..MAX_QUEUED {
            s.send(&q.sender_id, vec![0]).unwrap();
        }
        assert_eq!(s.send(&q.sender_id, vec![0]), Err(QueueError::Full));
        s.delete(&q.recipient_id).unwrap();
        assert_eq!(s.send(&q.sender_id, vec![0]), Err(QueueError::NotFound));
    }

    #[test]
    fn news_counts_what_each_send_said_until_the_queue_is_found_empty() {
        let mut s = Store::default();
        let q = s.create().unwrap();
        assert_eq!(s.news(&q.recipient_id).unwrap(), News::default());
        // Word between phones starts a round and counts nothing.
        s.send_said(&q.sender_id, b"seen".to_vec(), Said::Quiet)
            .unwrap();
        let first = s.news(&q.recipient_id).unwrap();
        assert_ne!(first.round, 0);
        assert_eq!((first.messages, first.unmarked, first.rings), (0, 0, 0));
        s.send_said(&q.sender_id, b"hello".to_vec(), Said::Message)
            .unwrap();
        s.send_said(&q.sender_id, b"call".to_vec(), Said::Ring)
            .unwrap();
        s.send(&q.sender_id, b"old".to_vec()).unwrap();
        s.send_said(&q.sender_id, b"again".to_vec(), Said::Message)
            .unwrap();
        let now = s.news(&q.recipient_id).unwrap();
        assert_eq!(
            now,
            News {
                round: first.round,
                messages: 2,
                unmarked: 1,
                rings: 1
            }
        );
        // Taking messages leaves the count; finding the queue empty ends the round.
        for _ in 0..5 {
            assert!(s.receive(&q.recipient_id).unwrap().is_some());
        }
        assert_eq!(s.news(&q.recipient_id).unwrap(), now);
        assert_eq!(s.receive(&q.recipient_id).unwrap(), None);
        assert_eq!(s.news(&q.recipient_id).unwrap(), News::default());
        s.send_said(&q.sender_id, b"next".to_vec(), Said::Message)
            .unwrap();
        let next = s.news(&q.recipient_id).unwrap();
        assert_ne!(next.round, 0);
        assert_eq!((next.messages, next.unmarked, next.rings), (1, 0, 0));
        assert_eq!(s.news(&q.sender_id), Err(QueueError::NotFound));
    }

    #[test]
    fn what_waits_from_before_a_restart_counts_as_one_send_that_did_not_say() {
        let path = TempPath::new();
        let (full, empty) = {
            let mut s = Store::open(&path.0).unwrap();
            let full = s.create().unwrap();
            let empty = s.create().unwrap();
            s.send_said(&full.sender_id, b"one".to_vec(), Said::Message)
                .unwrap();
            s.send_said(&full.sender_id, b"two".to_vec(), Said::Message)
                .unwrap();
            (full, empty)
        };
        let mut s = Store::open(&path.0).unwrap();
        let news = s.news(&full.recipient_id).unwrap();
        assert_ne!(news.round, 0);
        assert_eq!((news.messages, news.unmarked, news.rings), (0, 1, 0));
        // Asked again, the same round.
        assert_eq!(s.news(&full.recipient_id).unwrap(), news);
        assert_eq!(s.news(&empty.recipient_id).unwrap(), News::default());
    }

    #[test]
    fn news_kept_at_a_clean_stop_come_back_once() {
        let path = TempPath::new();
        let news_file = news_path(&path.0);
        let (full, emptied, before) = {
            let mut s = Store::open(&path.0).unwrap();
            let full = s.create().unwrap();
            let emptied = s.create().unwrap();
            s.send_said(&full.sender_id, b"one".to_vec(), Said::Message)
                .unwrap();
            s.send_said(&full.sender_id, b"call".to_vec(), Said::Ring)
                .unwrap();
            s.send(&full.sender_id, b"old".to_vec()).unwrap();
            s.wake(&full.sender_id).unwrap();
            s.send_said(&emptied.sender_id, b"x".to_vec(), Said::Message)
                .unwrap();
            assert!(s.receive(&emptied.recipient_id).unwrap().is_some());
            assert_eq!(s.receive(&emptied.recipient_id).unwrap(), None);
            let before = s.news(&full.recipient_id).unwrap();
            assert_eq!(s.keep_news().unwrap(), Some(1));
            (full, emptied, before)
        };
        assert!(news_file.exists());
        let mut s = Store::open(&path.0).unwrap();
        // Taken back as they were, and the file is gone.
        assert!(!news_file.exists());
        assert_eq!(s.news(&full.recipient_id).unwrap(), before);
        assert_eq!(s.news(&emptied.recipient_id).unwrap(), News::default());
        // A message after the restart counts on in the same round, so the
        // phone that heard `before` is told of exactly one more.
        s.send_said(&full.sender_id, b"two".to_vec(), Said::Message)
            .unwrap();
        let after = s.news(&full.recipient_id).unwrap();
        assert_eq!(after.round, before.round);
        assert_eq!(after.messages, before.messages + 1);
        drop(s);
        // Stopped without keeping them (a crash): a new round, never the old
        // one with counts that could be behind.
        let mut s = Store::open(&path.0).unwrap();
        let fresh = s.news(&full.recipient_id).unwrap();
        assert_ne!(fresh.round, before.round);
        assert_eq!((fresh.messages, fresh.unmarked, fresh.rings), (0, 1, 0));
    }

    #[test]
    fn news_kept_for_a_journal_that_changed_since_are_left_out() {
        let path = TempPath::new();
        let news_file = news_path(&path.0);
        let (q, before, kept) = {
            let mut s = Store::open(&path.0).unwrap();
            let q = s.create().unwrap();
            s.send_said(&q.sender_id, b"one".to_vec(), Said::Message)
                .unwrap();
            let before = s.news(&q.recipient_id).unwrap();
            s.keep_news().unwrap();
            (q, before, std::fs::read(&news_file).unwrap())
        };
        // What an older relay would do: start, take a message in, and leave
        // the file of news as it was.
        {
            let mut s = Store::open(&path.0).unwrap();
            s.send_said(&q.sender_id, b"two".to_vec(), Said::Message)
                .unwrap();
        }
        std::fs::write(&news_file, &kept).unwrap();
        let mut s = Store::open(&path.0).unwrap();
        assert!(!news_file.exists());
        let news = s.news(&q.recipient_id).unwrap();
        assert_ne!(news.round, before.round);
        assert_eq!((news.messages, news.unmarked), (0, 1));
        drop(s);

        // A file that is not news is removed and left out too.
        std::fs::write(&news_file, b"EREVOSN1 but cut").unwrap();
        let mut s = Store::open(&path.0).unwrap();
        assert!(!news_file.exists());
        assert_eq!(s.news(&q.recipient_id).unwrap().unmarked, 1);
    }

    #[test]
    fn a_store_with_no_journal_keeps_no_news() {
        let mut s = Store::default();
        let q = s.create().unwrap();
        s.send(&q.sender_id, b"one".to_vec()).unwrap();
        assert_eq!(s.keep_news().unwrap(), None);
    }

    /// A fresh path in the system temp directory, removed when dropped.
    struct TempPath(PathBuf);

    impl TempPath {
        fn new() -> TempPath {
            static NEXT: AtomicUsize = AtomicUsize::new(0);
            let n = NEXT.fetch_add(1, Ordering::Relaxed);
            let path = std::env::temp_dir().join(format!(
                "erevos-relay-test-{}-{n}.journal",
                std::process::id()
            ));
            let _ = std::fs::remove_file(&path);
            TempPath(path)
        }
    }

    impl TempPath {
        /// The files beside it named `<it>.<ending>` with an ending that starts with `start`.
        fn beside(&self, start: &str) -> Vec<PathBuf> {
            let prefix = format!("{}.{start}", self.0.file_name().unwrap().to_string_lossy());
            let mut found: Vec<PathBuf> = std::fs::read_dir(self.0.parent().unwrap())
                .unwrap()
                .flatten()
                .filter(|entry| entry.file_name().to_string_lossy().starts_with(&prefix))
                .map(|entry| entry.path())
                .collect();
            found.sort();
            found
        }
    }

    impl Drop for TempPath {
        fn drop(&mut self) {
            let _ = std::fs::remove_file(&self.0);
            let _ = std::fs::remove_file(news_path(&self.0));
            for kept in self.beside("") {
                let _ = std::fs::remove_file(kept);
            }
        }
    }

    #[test]
    fn queues_and_waiting_messages_survive_a_restart() {
        let path = TempPath::new();
        let (kept, gone) = {
            let mut s = Store::open(&path.0).unwrap();
            let kept = s.create().unwrap();
            let gone = s.create().unwrap();
            s.send(&kept.sender_id, b"one".to_vec()).unwrap();
            s.send(&kept.sender_id, b"two".to_vec()).unwrap();
            s.send(&kept.sender_id, b"three".to_vec()).unwrap();
            assert_eq!(s.receive(&kept.recipient_id).unwrap().unwrap(), b"one");
            s.delete(&gone.recipient_id).unwrap();
            (kept, gone)
        };
        let mut s = Store::open(&path.0).unwrap();
        assert_eq!(s.receive(&kept.recipient_id).unwrap().unwrap(), b"two");
        s.send(&kept.sender_id, b"four".to_vec()).unwrap();
        assert_eq!(s.receive(&kept.recipient_id).unwrap().unwrap(), b"three");
        assert_eq!(s.receive(&kept.recipient_id).unwrap().unwrap(), b"four");
        assert_eq!(s.receive(&kept.recipient_id).unwrap(), None);
        assert_eq!(s.send(&gone.sender_id, vec![1]), Err(QueueError::NotFound));
        assert_eq!(s.receive(&gone.recipient_id), Err(QueueError::NotFound));
    }

    #[test]
    fn opening_drops_what_was_received_from_the_file() {
        let path = TempPath::new();
        {
            let mut s = Store::open(&path.0).unwrap();
            let q = s.create().unwrap();
            for _ in 0..50 {
                s.send(&q.sender_id, vec![7; 1000]).unwrap();
                s.receive(&q.recipient_id).unwrap().unwrap();
            }
        }
        let before = std::fs::metadata(&path.0).unwrap().len();
        drop(Store::open(&path.0).unwrap());
        let after = std::fs::metadata(&path.0).unwrap().len();
        assert!(before > 50 * 1000);
        // The queue alone, with the day it was last used, and its check.
        assert_eq!(after, (journal::HEADER.len() + 1 + 24 + 24 + 8 + 4) as u64);
    }

    #[test]
    fn a_record_cut_short_is_skipped() {
        let path = TempPath::new();
        let q = {
            let mut s = Store::open(&path.0).unwrap();
            let q = s.create().unwrap();
            s.send(&q.sender_id, b"whole".to_vec()).unwrap();
            q
        };
        // What a crash in the middle of the next SEND would leave.
        let mut torn = vec![2u8];
        torn.extend_from_slice(&q.recipient_id);
        torn.extend_from_slice(&100u32.to_be_bytes());
        torn.extend_from_slice(b"part");
        let mut file = std::fs::OpenOptions::new()
            .append(true)
            .open(&path.0)
            .unwrap();
        std::io::Write::write_all(&mut file, &torn).unwrap();
        drop(file);

        let mut s = Store::open(&path.0).unwrap();
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"whole");
        assert_eq!(s.receive(&q.recipient_id).unwrap(), None);
    }

    /// A journal holding one queue with three messages, "one", "two" and
    /// "three", and where each record of it starts.
    fn three_messages(path: &Path) -> (NewQueue, Vec<usize>) {
        let q = {
            let mut s = Store::open(path).unwrap();
            let q = s.create().unwrap();
            for message in [b"one".as_slice(), b"two", b"three"] {
                s.send(&q.sender_id, message.to_vec()).unwrap();
            }
            q
        };
        let bytes = std::fs::read(path).unwrap();
        assert_eq!(&bytes[..8], journal::HEADER);
        // CREATE_AT, then each SEND_AT: its tag, ids, time, length and words, and the check.
        let mut starts = vec![8];
        let mut at = 8 + 1 + 24 + 24 + 8 + 4;
        for message in [b"one".as_slice(), b"two", b"three"] {
            starts.push(at);
            at += 1 + 24 + 8 + 4 + message.len() + 4;
        }
        assert_eq!(at, bytes.len());
        (q, starts)
    }

    #[test]
    fn a_damaged_record_is_found_and_the_journal_kept_as_it_was() {
        let path = TempPath::new();
        let (q, starts) = three_messages(&path.0);
        let mut bytes = std::fs::read(&path.0).unwrap();
        // A bit the disk changed in the words "two".
        bytes[starts[3] - 4 - 1] ^= 0x10;
        std::fs::write(&path.0, &bytes).unwrap();

        let mut s = Store::open(&path.0).unwrap();
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"one");
        assert_eq!(s.receive(&q.recipient_id).unwrap(), None);
        let kept = path.beside("damaged-");
        assert_eq!(kept.len(), 1);
        assert_eq!(std::fs::read(&kept[0]).unwrap(), bytes);
    }

    #[test]
    fn the_last_record_written_in_part_is_skipped_and_nothing_kept() {
        let path = TempPath::new();
        let (q, _) = three_messages(&path.0);
        let mut bytes = std::fs::read(&path.0).unwrap();
        let last = bytes.len() - 4 - 1;
        bytes[last] ^= 0x10;
        std::fs::write(&path.0, &bytes).unwrap();

        let mut s = Store::open(&path.0).unwrap();
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"one");
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"two");
        assert_eq!(s.receive(&q.recipient_id).unwrap(), None);
        assert!(path.beside("damaged-").is_empty());
    }

    #[test]
    fn a_journal_from_before_records_were_checked_still_opens_and_is_checked_after() {
        let path = TempPath::new();
        let mut old = journal::J2_HEADER.to_vec();
        let (recipient, sender) = ([5u8; 24], [6u8; 24]);
        old.push(6);
        old.extend_from_slice(&recipient);
        old.extend_from_slice(&sender);
        old.extend_from_slice(&(fixed_now() / DAY * DAY).to_be_bytes());
        old.push(5);
        old.extend_from_slice(&recipient);
        old.extend_from_slice(&(fixed_now() - 60).to_be_bytes());
        old.extend_from_slice(&5u32.to_be_bytes());
        old.extend_from_slice(b"hello");
        std::fs::write(&path.0, &old).unwrap();
        drop(Store::open_clocked(&path.0, DEFAULT_TTL, DEFAULT_MAX_BYTES, fixed_now).unwrap());
        let bytes = std::fs::read(&path.0).unwrap();
        assert_eq!(&bytes[..8], journal::HEADER);
        assert_eq!(bytes.len(), old.len() + 2 * 4);
        let mut s = Store::open_clocked(&path.0, DEFAULT_TTL, DEFAULT_MAX_BYTES, fixed_now).unwrap();
        assert_eq!(s.receive(&recipient).unwrap().unwrap(), b"hello");
    }

    #[test]
    fn a_journal_written_again_for_an_older_relay_keeps_every_record() {
        let path = TempPath::new();
        let (q, _) = three_messages(&path.0);
        let checked = std::fs::read(&path.0).unwrap();
        let journal::Downgraded::Done { records, skipped, kept } = journal::downgrade(&path.0, 1).unwrap() else {
            panic!("not written again");
        };
        assert_eq!((records, skipped), (4, journal::Replayed::default()));
        assert_eq!(std::fs::read(&kept).unwrap(), checked);
        let bytes = std::fs::read(&path.0).unwrap();
        assert_eq!(&bytes[..8], journal::J2_HEADER);
        // Each record as before, without its check.
        assert_eq!(bytes.len(), checked.len() - 4 * 4);
        assert_eq!(journal::downgrade(&path.0, 2).unwrap(), journal::Downgraded::Already);

        // Read by this relay too, and checked again when it rewrites it.
        let mut s = Store::open(&path.0).unwrap();
        for message in [b"one".as_slice(), b"two", b"three"] {
            assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), message);
        }
        drop(s);
        assert_eq!(&std::fs::read(&path.0).unwrap()[..8], journal::HEADER);
    }

    #[test]
    fn a_file_that_is_not_a_journal_is_left_alone() {
        let path = TempPath::new();
        std::fs::write(&path.0, b"something else entirely").unwrap();
        assert!(Store::open(&path.0).is_err());
        assert_eq!(std::fs::read(&path.0).unwrap(), b"something else entirely");
    }

    #[test]
    fn the_journal_is_rewritten_once_mostly_dead() {
        let path = TempPath::new();
        let mut s = Store::open(&path.0).unwrap();
        let q = s.create().unwrap();
        // About 6 MiB through the queue, all received, so the file must have
        // been rewritten on the way instead of holding all of it.
        for _ in 0..100 {
            s.send(&q.sender_id, vec![1; 64 * 1024]).unwrap();
            s.receive(&q.recipient_id).unwrap().unwrap();
        }
        let len = s.journal.as_ref().unwrap().len();
        assert!(len < 5 << 20, "journal is {len} bytes");
        assert_eq!(len, std::fs::metadata(&path.0).unwrap().len());
        s.send(&q.sender_id, b"after".to_vec()).unwrap();
        drop(s);
        let mut s = Store::open(&path.0).unwrap();
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"after");
    }

    use std::sync::atomic::AtomicU64;

    static NOW: AtomicU64 = AtomicU64::new(1_800_000_000);
    fn fake_now() -> u64 {
        NOW.load(Ordering::SeqCst)
    }

    // One test moves the fake clock, so all of them that use it run in this one.
    #[test]
    fn messages_expire_after_the_ttl() {
        let day = 24 * 60 * 60;
        let mut s = Store {
            clock: fake_now,
            ..Store::with_ttl(14 * day)
        };
        let q = s.create().unwrap();
        s.send(&q.sender_id, b"old".to_vec()).unwrap();
        NOW.fetch_add(10 * day, Ordering::SeqCst);
        s.send(&q.sender_id, b"newer".to_vec()).unwrap();
        NOW.fetch_add(5 * day, Ordering::SeqCst);
        // "old" is 15 days old now, "newer" 5.
        assert_eq!(s.expire(), 1);
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"newer");
        assert_eq!(s.receive(&q.recipient_id).unwrap(), None);

        // An expired message is never handed over, even before a sweep.
        s.send(&q.sender_id, b"gone".to_vec()).unwrap();
        NOW.fetch_add(15 * day, Ordering::SeqCst);
        assert_eq!(s.receive(&q.recipient_id).unwrap(), None);

        // A full queue makes room as its old messages expire.
        for _ in 0..MAX_QUEUED {
            s.send(&q.sender_id, vec![0]).unwrap();
        }
        assert_eq!(s.send(&q.sender_id, vec![0]), Err(QueueError::Full));
        NOW.fetch_add(15 * day, Ordering::SeqCst);
        assert_eq!(s.send(&q.sender_id, b"room".to_vec()), Ok(()));
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"room");

        // Kept on disk with the hour it came, and expired on the way back in.
        let path = TempPath::new();
        let q = {
            let mut s = Store::open_clocked(&path.0, 14 * day, DEFAULT_MAX_BYTES, fake_now).unwrap();
            let q = s.create().unwrap();
            s.send(&q.sender_id, b"first".to_vec()).unwrap();
            NOW.fetch_add(7 * day, Ordering::SeqCst);
            s.send(&q.sender_id, b"second".to_vec()).unwrap();
            q
        };
        NOW.fetch_add(8 * day, Ordering::SeqCst);
        let mut s = Store::open_clocked(&path.0, 14 * day, DEFAULT_MAX_BYTES, fake_now).unwrap();
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"second");
        assert_eq!(s.receive(&q.recipient_id).unwrap(), None);

        // Only the hour is kept, not the second.
        let at = s.hour();
        assert_eq!(at % 3600, 0);
        assert!(at <= fake_now() && fake_now() - at < 3600);
    }

    #[test]
    fn a_journal_from_before_expiry_still_opens() {
        let path = TempPath::new();
        let mut old = journal::OLD_HEADER.to_vec();
        let (recipient, sender) = ([1u8; 24], [2u8; 24]);
        old.push(1);
        old.extend_from_slice(&recipient);
        old.extend_from_slice(&sender);
        old.push(2);
        old.extend_from_slice(&recipient);
        old.extend_from_slice(&5u32.to_be_bytes());
        old.extend_from_slice(b"hello");
        std::fs::write(&path.0, &old).unwrap();
        let mut s = Store::open(&path.0).unwrap();
        assert_eq!(s.receive(&recipient).unwrap().unwrap(), b"hello");
    }

    #[test]
    fn the_store_holds_so_many_queues() {
        let mut s = Store::default().with_queue_limits(2, DEFAULT_QUEUE_TTL);
        let first = s.create().unwrap();
        s.create().unwrap();
        assert!(!s.has_room());
        assert_eq!(s.create().err(), Some(QueueError::Full));
        s.delete(&first.recipient_id).unwrap();
        assert!(s.has_room());
        s.create().unwrap();
    }

    fn fixed_now() -> u64 {
        1_800_000_000
    }

    #[test]
    fn a_queue_from_before_queues_expired_counts_as_used_the_day_it_is_read_back() {
        let path = TempPath::new();
        let mut old = journal::OLD_HEADER.to_vec();
        let (recipient, sender) = ([3u8; 24], [4u8; 24]);
        old.push(1);
        old.extend_from_slice(&recipient);
        old.extend_from_slice(&sender);
        std::fs::write(&path.0, &old).unwrap();
        let s = Store::open_clocked(&path.0, DEFAULT_TTL, DEFAULT_MAX_BYTES, fixed_now).unwrap();
        let day = fixed_now() / DAY * DAY;
        assert_eq!(s.queues[&recipient].used, day);
        drop(s);
        // Written back with that day, under the header older relays do not take.
        let bytes = std::fs::read(&path.0).unwrap();
        assert_eq!(&bytes[..8], journal::HEADER);
        assert_ne!(journal::HEADER, journal::OLD_HEADER);
        assert_eq!(&bytes[bytes.len() - 12..bytes.len() - 4], &day.to_be_bytes());
    }

    static QUEUE_NOW: AtomicU64 = AtomicU64::new(1_800_000_000);
    fn queue_now() -> u64 {
        QUEUE_NOW.load(Ordering::SeqCst)
    }

    // One test moves this clock, so all of them that use it run in this one.
    #[test]
    fn queues_their_recipients_leave_unused_expire() {
        let path = TempPath::new();
        let open = || {
            Store::open_clocked(&path.0, DEFAULT_TTL, DEFAULT_MAX_BYTES, queue_now)
                .unwrap()
                .with_queue_limits(DEFAULT_MAX_QUEUES, 180 * DAY)
        };
        let written = |s: &Store| s.journal.as_ref().unwrap().len();
        let mut s = open();
        let used = s.create().unwrap();
        let sent_to = s.create().unwrap();

        // Used again the day it was made: nothing more is written.
        let before = written(&s);
        assert_eq!(s.receive(&used.recipient_id).unwrap(), None);
        assert_eq!(s.has_waiting(&used.recipient_id), Ok(false));
        assert_eq!(written(&s), before);

        // The next day, its first use is written, and only that one.
        QUEUE_NOW.fetch_add(DAY, Ordering::SeqCst);
        assert_eq!(s.has_waiting(&used.recipient_id), Ok(false));
        assert_eq!(written(&s), before + 1 + 24 + 8 + 4);
        assert_eq!(s.receive(&used.recipient_id).unwrap(), None);
        assert_eq!(written(&s), before + 1 + 24 + 8 + 4);
        // Only the day is kept, not the second.
        assert_eq!(s.queues[&used.recipient_id].used % DAY, 0);

        // Sending to a queue is no use of it.
        QUEUE_NOW.fetch_add(100 * DAY, Ordering::SeqCst);
        s.send(&sent_to.sender_id, b"for nobody".to_vec()).unwrap();
        assert_eq!(s.receive(&used.recipient_id).unwrap(), None);
        assert!(s.expire_queues().is_empty());
        drop(s);

        // 181 days after it was made, kept through a restart: the one only
        // sent to goes, with what waits in it; the one used 80 days ago stays.
        QUEUE_NOW.fetch_add(80 * DAY, Ordering::SeqCst);
        let mut s = open();
        assert_eq!(s.expire_queues(), vec![sent_to.recipient_id]);
        assert_eq!(
            s.send(&sent_to.sender_id, vec![1]),
            Err(QueueError::NotFound)
        );
        assert_eq!(s.receive(&used.recipient_id).unwrap(), None);
        drop(s);
        // Its going was written down too.
        let mut s = open();
        assert_eq!(s.receive(&sent_to.recipient_id), Err(QueueError::NotFound));
        assert!(s.expire_queues().is_empty());
        QUEUE_NOW.fetch_add(180 * DAY, Ordering::SeqCst);
        assert_eq!(s.expire_queues(), vec![used.recipient_id]);
        assert_eq!(s.has_waiting(&used.recipient_id), Err(QueueError::NotFound));
    }

    #[test]
    fn a_message_taken_to_keep_stays_until_acknowledged() {
        let mut s = Store::default();
        let q = s.create().unwrap();
        s.send(&q.sender_id, b"one".to_vec()).unwrap();
        s.send(&q.sender_id, b"two".to_vec()).unwrap();
        let (first, msg) = s.take(&q.recipient_id, None).unwrap().unwrap();
        assert_eq!(msg, b"one");
        // Not acknowledged: the same one again, never the next, however
        // often it is asked for, so only one is ever out.
        for _ in 0..3 {
            assert_eq!(
                s.take(&q.recipient_id, None).unwrap(),
                Some((first, b"one".to_vec()))
            );
        }
        // A number that is not the oldest's deletes nothing.
        s.ack(&q.recipient_id, first.wrapping_add(1)).unwrap();
        assert_eq!(s.take(&q.recipient_id, None).unwrap().unwrap().1, b"one");
        s.ack(&q.recipient_id, first).unwrap();
        // Said twice: harmless, the next stays.
        s.ack(&q.recipient_id, first).unwrap();
        let (second, msg) = s.take(&q.recipient_id, None).unwrap().unwrap();
        assert_eq!((second, msg), (first.wrapping_add(1), b"two".to_vec()));
        // Acknowledged with the next take, which then finds it empty.
        assert_eq!(s.take(&q.recipient_id, Some(second)).unwrap(), None);
        assert_eq!(s.receive(&q.recipient_id).unwrap(), None);
        assert_eq!(s.ack(&q.sender_id, 0), Err(QueueError::NotFound));
        assert_eq!(s.usage.total, 0);
    }

    #[test]
    fn a_message_not_acknowledged_is_handed_over_again_after_a_restart() {
        let path = TempPath::new();
        let (q, before) = {
            let mut s = Store::open(&path.0).unwrap();
            let q = s.create().unwrap();
            s.send(&q.sender_id, b"kept".to_vec()).unwrap();
            s.send(&q.sender_id, b"next".to_vec()).unwrap();
            let (number, msg) = s.take(&q.recipient_id, None).unwrap().unwrap();
            assert_eq!(msg, b"kept");
            (q, number)
        };
        let mut s = Store::open(&path.0).unwrap();
        let (number, msg) = s.take(&q.recipient_id, None).unwrap().unwrap();
        assert_eq!(msg, b"kept");
        // A number from before the restart names nothing now.
        s.ack(&q.recipient_id, before).unwrap();
        assert_eq!(s.take(&q.recipient_id, None).unwrap().unwrap().1, b"kept");
        s.ack(&q.recipient_id, number).unwrap();
        drop(s);
        // The acknowledgement was written down.
        let mut s = Store::open(&path.0).unwrap();
        assert_eq!(s.receive(&q.recipient_id).unwrap().unwrap(), b"next");
        assert_eq!(s.receive(&q.recipient_id).unwrap(), None);
    }

    #[test]
    fn the_store_holds_so_many_bytes() {
        let mut s = Store::default().with_byte_limits(3 * cost(100), 100 * cost(100));
        let a = s.create().unwrap();
        let b = s.create().unwrap();
        s.send(&a.sender_id, vec![1; 100]).unwrap();
        s.send(&b.sender_id, vec![2; 100]).unwrap();
        s.send(&b.sender_id, vec![3; 100]).unwrap();
        // Full for every queue, an empty message too, without a crash.
        assert_eq!(s.send(&a.sender_id, vec![4; 100]), Err(QueueError::Full));
        assert_eq!(s.send(&b.sender_id, Vec::new()), Err(QueueError::Full));
        // Room again once one is taken, or its queue deleted.
        s.receive(&a.recipient_id).unwrap().unwrap();
        s.send(&a.sender_id, vec![4; 100]).unwrap();
        assert_eq!(s.send(&a.sender_id, vec![5; 1]), Err(QueueError::Full));
        s.delete(&b.recipient_id).unwrap();
        s.send(&a.sender_id, vec![5; 100]).unwrap();
        assert_eq!(s.usage.total, 2 * cost(100));
    }

    #[test]
    fn journal_replay_follows_documented_memory_only_owner_policy() {
        // Owners are intentionally NOT journalled in this version. Test the
        // documented behavior, without accidentally treating it as persistence.
        let path = TempPath::new();
        let owner = [9u8; 32];
        let old = {
            let mut store = Store::open(&path.0)
                .unwrap()
                .with_byte_limits(5 * cost(100), cost(100));
            let old = store.create_for(Some(owner)).unwrap();
            store.send(&old.sender_id, vec![1; 100]).unwrap();
            assert_eq!(store.usage.of(&owner), cost(100));
            assert_eq!(store.send(&old.sender_id, vec![2; 100]), Err(QueueError::Full));
            old
        };
        let mut reopened = Store::open(&path.0)
            .unwrap()
            .with_byte_limits(5 * cost(100), cost(100));
        assert_eq!(reopened.queues[&old.recipient_id].owner, None);
        assert_eq!(reopened.usage.of(&owner), 0);
        assert_eq!(reopened.usage.total, cost(100));
        // The pre-restart queue is still subject to the global byte cap.
        reopened.send(&old.sender_id, vec![3; 100]).unwrap();
        assert_eq!(reopened.usage.total, 2 * cost(100));
        // A queue created after the restart does have an owner and share cap.
        let fresh = reopened.create_for(Some(owner)).unwrap();
        reopened.send(&fresh.sender_id, vec![4; 100]).unwrap();
        assert_eq!(reopened.usage.of(&owner), cost(100));
        assert_eq!(reopened.send(&fresh.sender_id, vec![5; 100]), Err(QueueError::Full));
        // No change may exceed the global bound, even on the unowned queue.
        reopened.send(&old.sender_id, vec![6; 100]).unwrap();
        reopened.send(&old.sender_id, vec![7; 100]).unwrap();
        assert_eq!(reopened.usage.total, 5 * cost(100));
        assert_eq!(reopened.send(&old.sender_id, vec![8; 100]), Err(QueueError::Full));
    }

    #[test]
    fn journal_replay_keeps_sender_capability_separate_from_recipient() {
        let path = TempPath::new();
        let queue = {
            let mut store = Store::open(&path.0).unwrap();
            let queue = store.create_for(Some([8u8; 32])).unwrap();
            store.send(&queue.sender_id, b"encrypted".to_vec()).unwrap();
            queue
        };
        let mut reopened = Store::open(&path.0).unwrap();
        assert_eq!(reopened.recipient_of(&queue.sender_id), Some(queue.recipient_id));
        assert_eq!(reopened.recipient_of(&queue.recipient_id), None);
        assert_eq!(reopened.receive(&queue.recipient_id).unwrap(), Some(b"encrypted".to_vec()));
        assert_eq!(reopened.receive(&queue.recipient_id).unwrap(), None);
    }

    #[test]
    fn one_phone_fills_only_its_share() {
        let (greedy, other) = ([1u8; 32], [2u8; 32]);
        let mut s = Store::default().with_byte_limits(10 * cost(100), 2 * cost(100));
        let first = s.create_for(Some(greedy)).unwrap();
        let second = s.create_for(Some(greedy)).unwrap();
        s.send(&first.sender_id, vec![0; 100]).unwrap();
        s.send(&second.sender_id, vec![0; 100]).unwrap();
        // Its queues together hold its share: each is full now.
        assert_eq!(s.send(&first.sender_id, vec![0; 100]), Err(QueueError::Full));
        assert_eq!(s.send(&second.sender_id, vec![0; 1]), Err(QueueError::Full));
        // Another phone's queue, and one made with the relay's own token,
        // still take theirs.
        let theirs = s.create_for(Some(other)).unwrap();
        let shared = s.create().unwrap();
        s.send(&theirs.sender_id, vec![0; 100]).unwrap();
        s.send(&theirs.sender_id, vec![0; 100]).unwrap();
        for _ in 0..4 {
            s.send(&shared.sender_id, vec![0; 100]).unwrap();
        }
        // Taken, its share has room again.
        s.receive(&second.recipient_id).unwrap().unwrap();
        s.send(&first.sender_id, vec![0; 100]).unwrap();
        assert_eq!(s.usage.of(&greedy), 2 * cost(100));
        assert_eq!(s.usage.total, 8 * cost(100));
    }

    static FULL_NOW: AtomicU64 = AtomicU64::new(1_800_000_000);
    fn full_now() -> u64 {
        FULL_NOW.load(Ordering::SeqCst)
    }

    // One test moves this clock, so all of them that use it run in this one.
    #[test]
    fn a_journal_past_the_cap_opens_without_its_oldest_messages() {
        let path = TempPath::new();
        let big = DEFAULT_MAX_BYTES;
        let (a, b) = {
            let mut s = Store::open_clocked(&path.0, DEFAULT_TTL, big, full_now).unwrap();
            let (a, b) = (s.create().unwrap(), s.create().unwrap());
            for n in 0..5u8 {
                s.send(&a.sender_id, vec![n; 300]).unwrap();
            }
            FULL_NOW.fetch_add(2 * HOUR, Ordering::SeqCst);
            s.send(&b.sender_id, vec![10; 300]).unwrap();
            FULL_NOW.fetch_add(2 * HOUR, Ordering::SeqCst);
            s.send(&a.sender_id, vec![5; 300]).unwrap();
            // The first is taken after the others came, so its record comes
            // after theirs in the journal.
            assert_eq!(s.receive(&a.recipient_id).unwrap().unwrap(), vec![0; 300]);
            (a, b)
        };
        // Room for three: of the six waiting, the three oldest go, by the
        // hour they came, whichever queue they are in.
        let mut s = Store::open_clocked(&path.0, DEFAULT_TTL, 3 * cost(300), full_now).unwrap();
        assert_eq!(s.usage.total, 3 * cost(300));
        assert_eq!(s.receive(&a.recipient_id).unwrap().unwrap(), vec![4; 300]);
        assert_eq!(s.receive(&a.recipient_id).unwrap().unwrap(), vec![5; 300]);
        assert_eq!(s.receive(&b.recipient_id).unwrap().unwrap(), vec![10; 300]);
        assert_eq!(s.receive(&a.recipient_id).unwrap(), None);
        drop(s);

        // A journal much past the cap, as an attack before it left, opens
        // within it, and the file written back holds no more.
        {
            let mut s = Store::open_clocked(&path.0, DEFAULT_TTL, big, full_now).unwrap();
            for _ in 0..200 {
                let q = s.create().unwrap();
                for _ in 0..10 {
                    s.send(&q.sender_id, vec![7; 4096]).unwrap();
                }
            }
            FULL_NOW.fetch_add(HOUR, Ordering::SeqCst);
            s.send(&a.sender_id, b"newest".to_vec()).unwrap();
        }
        let cap = 64 * cost(4096);
        let mut s = Store::open_clocked(&path.0, DEFAULT_TTL, cap, full_now).unwrap();
        assert!(s.usage.total <= cap);
        assert_eq!(s.usage.total, s.queues.values().map(Queue::bytes).sum::<usize>());
        assert_eq!(s.receive(&a.recipient_id).unwrap().unwrap(), b"newest");
        drop(s);
        assert!(std::fs::metadata(&path.0).unwrap().len() < (cap + 200 * 64) as u64);
    }

    #[cfg(unix)]
    #[test]
    fn only_the_owner_can_read_the_journal() {
        use std::os::unix::fs::PermissionsExt;
        let path = TempPath::new();
        drop(Store::open(&path.0).unwrap());
        let mode = std::fs::metadata(&path.0).unwrap().permissions().mode();
        assert_eq!(mode & 0o777, 0o600);
    }
}
