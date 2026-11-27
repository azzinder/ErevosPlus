// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! The relay's file store, in the style of SimpleX's XFTP. A phone encrypts a
//! file with a key of its own, puts it here in chunks, and gives the chunks'
//! ids and the key to its contact inside an end-to-end message. The contact
//! takes the chunks and deletes them. The relay never sees the key, the
//! file's name, or which chunks make one file.
//!
//! A chunk is found by a random 24-byte id, and whoever knows the id may take
//! or delete it, so the id is the only thing that guards it. A chunk nobody
//! deletes expires after `ttl` (14 days unless set), like messages. The relay
//! notes only the hour each chunk came.
//!
//! With a folder, each chunk is a file named by its id in hex: 8 bytes with
//! the hour it came, then the chunk. It is written as a `.part` file first
//! and renamed once whole, so a crash never leaves half a chunk to hand out;
//! `.part` files left over are removed when the store opens. Deleted chunks
//! are unlinked, not wiped: keep the folder on an encrypted disk. Without a
//! folder, chunks live in memory and are lost when the relay stops.
//!
//! All chunks together may take `cap` bytes. Past that, new chunks are
//! refused with `Full` until others are taken or expire. Of that, the chunks
//! open places put (see `open.rs`), which anyone may take with no invite or
//! account, may take at most half all together, so that however many of them
//! there are, the other half is left to the phones with places of their own;
//! past it, an open place's new chunk is refused with `Full`, and deleting or
//! expiry gives the room back. Which chunks are an open place's is kept in
//! memory only, as which phone made a queue is: after a restart, a chunk read
//! back from the folder counts as anyone's.
//!
//! Not audited.

use std::collections::HashMap;
use std::fs::{self, File, OpenOptions};
use std::io::{self, ErrorKind, Read, Write};
use std::path::{Path, PathBuf};

use rand::RngCore;

use crate::journal;
use crate::queue::{system_now, DEFAULT_TTL, HOUR};

pub type ChunkId = [u8; 24];

/// Largest chunk a phone may put: the app's chunks are exactly 64 KiB,
/// 256 KiB or this.
pub const MAX_CHUNK: usize = 1 << 20;

/// Room for chunks unless set: on disk, and when they are kept in memory.
pub const DEFAULT_CAP: u64 = 1 << 30;
pub const DEFAULT_MEMORY_CAP: u64 = 256 << 20;

const PART: &str = ".part";

#[derive(Debug, PartialEq, Eq)]
pub enum FileError {
    NotFound,
    /// The store holds `cap` bytes already.
    Full,
    /// The chunk could not be written, read or removed on disk.
    Storage,
}

struct Entry {
    /// The hour it came.
    at: u64,
    size: u64,
    /// Whether an open place put it, in memory only.
    open: bool,
}

pub struct FileStore {
    dir: Option<PathBuf>,
    entries: HashMap<ChunkId, Entry>,
    /// The chunks themselves, when there is no folder.
    memory: HashMap<ChunkId, Vec<u8>>,
    used: u64,
    /// Of `used`, what the chunks open places put take.
    open_used: u64,
    cap: u64,
    ttl: u64,
    clock: fn() -> u64,
}

fn hex(id: &ChunkId) -> String {
    id.iter().map(|b| format!("{b:02x}")).collect()
}

fn from_hex(name: &str) -> Option<ChunkId> {
    if name.len() != 48
        || !name
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return None;
    }
    let mut id = [0u8; 24];
    for (i, byte) in id.iter_mut().enumerate() {
        *byte = u8::from_str_radix(&name[i * 2..i * 2 + 2], 16).ok()?;
    }
    Some(id)
}

fn storage(e: io::Error) -> FileError {
    elog!("erevos-relay: cannot use the file store: {e}");
    FileError::Storage
}

impl FileStore {
    /// A store that keeps chunks in memory, `cap` bytes at most.
    pub fn in_memory(cap: u64, ttl: u64) -> FileStore {
        FileStore {
            dir: None,
            entries: HashMap::new(),
            memory: HashMap::new(),
            used: 0,
            open_used: 0,
            cap,
            ttl,
            clock: system_now,
        }
    }

    /// Opens the store kept in the folder `dir`, making the folder if it is
    /// not there. Expired chunks and unfinished writes in it are removed;
    /// files with other names are left alone.
    pub fn open(dir: &Path, cap: u64, ttl: u64) -> io::Result<FileStore> {
        FileStore::open_clocked(dir, cap, ttl, system_now)
    }

    fn open_clocked(dir: &Path, cap: u64, ttl: u64, clock: fn() -> u64) -> io::Result<FileStore> {
        let mut builder = fs::DirBuilder::new();
        builder.recursive(true);
        #[cfg(unix)]
        std::os::unix::fs::DirBuilderExt::mode(&mut builder, 0o700);
        builder.create(dir)?;
        let mut store = FileStore {
            dir: Some(dir.to_path_buf()),
            clock,
            ..FileStore::in_memory(cap, ttl)
        };
        for item in fs::read_dir(dir)? {
            let item = item?;
            let Some(name) = item.file_name().to_str().map(str::to_owned) else {
                continue;
            };
            if name.ends_with(PART) && from_hex(name.trim_end_matches(PART)).is_some() {
                fs::remove_file(item.path())?;
                continue;
            }
            let Some(id) = from_hex(&name) else {
                continue;
            };
            let mut at = [0u8; 8];
            let size = item.metadata()?.len();
            let whole = File::open(item.path())
                .and_then(|mut f| f.read_exact(&mut at))
                .is_ok();
            let at = u64::from_be_bytes(at);
            if !whole || store.expired(at) {
                fs::remove_file(item.path())?;
                continue;
            }
            store.used += size - 8;
            // Whoever put it: which chunks are an open place's is not kept on disk.
            store.entries.insert(
                id,
                Entry {
                    at,
                    size: size - 8,
                    open: false,
                },
            );
        }
        Ok(store)
    }

    /// Bytes all chunks take together.
    pub fn used(&self) -> u64 {
        self.used
    }

    fn hour(&self) -> u64 {
        ((self.clock)() / HOUR * HOUR).max(1)
    }

    fn expired(&self, at: u64) -> bool {
        at.saturating_add(self.ttl) <= (self.clock)()
    }

    fn path(&self, id: &ChunkId) -> Option<PathBuf> {
        self.dir.as_ref().map(|dir| dir.join(hex(id)))
    }

    /// Keeps a chunk and returns its new id, as `put_from` does with its
    /// time to expire starting now (the relay calls `put_from` or `put_open`).
    #[cfg(test)]
    pub fn put(&mut self, chunk: Vec<u8>) -> Result<ChunkId, FileError> {
        self.put_from(chunk, 0)
    }

    /// Keeps a chunk whose time to expire starts at `from` (Unix seconds),
    /// or now if that is sooner, and returns its new id: a file in a message
    /// sent for later stays until a while after the message goes.
    pub fn put_from(&mut self, chunk: Vec<u8>, from: u64) -> Result<ChunkId, FileError> {
        self.keep(chunk, from, false)
    }

    /// Keeps a chunk an open place put (see `open.rs`), as `put_from` does,
    /// while the chunks of all open places together take at most half of
    /// `cap`; past that, `Full`.
    pub fn put_open(&mut self, chunk: Vec<u8>, from: u64) -> Result<ChunkId, FileError> {
        self.keep(chunk, from, true)
    }

    /// Keeps a chunk as `put_from` says, an open place's if `open`.
    fn keep(&mut self, chunk: Vec<u8>, from: u64, open: bool) -> Result<ChunkId, FileError> {
        let size = chunk.len() as u64;
        if self.used + size > self.cap || (open && self.open_used + size > self.cap / 2) {
            return Err(FileError::Full);
        }
        let mut id = [0u8; 24];
        rand::rngs::OsRng.fill_bytes(&mut id);
        let at = self.hour().max(from / HOUR * HOUR);
        match self.path(&id) {
            Some(path) => write_chunk(&path, at, &chunk).map_err(storage)?,
            None => {
                self.memory.insert(id, chunk);
            }
        }
        self.entries.insert(id, Entry { at, size, open });
        self.used += size;
        if open {
            self.open_used += size;
        }
        Ok(id)
    }

    /// The chunk, which stays until it is deleted or expires.
    pub fn get(&mut self, id: &ChunkId) -> Result<Vec<u8>, FileError> {
        let entry = self.entries.get(id).ok_or(FileError::NotFound)?;
        if self.expired(entry.at) {
            self.delete(id)?;
            return Err(FileError::NotFound);
        }
        let Some(path) = self.path(id) else {
            return self.memory.get(id).cloned().ok_or(FileError::NotFound);
        };
        match fs::read(&path) {
            Ok(bytes) if bytes.len() >= 8 => Ok(bytes[8..].to_vec()),
            Ok(_) => Err(FileError::Storage),
            Err(e) if e.kind() == ErrorKind::NotFound => {
                // Removed by hand: forget it.
                self.forget(id);
                Err(FileError::NotFound)
            }
            Err(e) => Err(storage(e)),
        }
    }

    pub fn delete(&mut self, id: &ChunkId) -> Result<(), FileError> {
        if !self.entries.contains_key(id) {
            return Err(FileError::NotFound);
        }
        if let Some(path) = self.path(id) {
            match fs::remove_file(&path) {
                // Durable too, so a chunk deleted does not come back with the power.
                Ok(()) => {
                    if let Err(e) = journal::sync_dir(&path) {
                        elog!("erevos-relay: a chunk deleted may come back after a power cut: {e}");
                    }
                }
                Err(e) if e.kind() == ErrorKind::NotFound => {}
                Err(e) => return Err(storage(e)),
            }
        }
        self.forget(id);
        Ok(())
    }

    /// Forgets the chunk `id`, gone from the folder or to be dropped from
    /// memory, and gives back the room it took.
    fn forget(&mut self, id: &ChunkId) {
        self.memory.remove(id);
        if let Some(entry) = self.entries.remove(id) {
            self.used -= entry.size;
            if entry.open {
                self.open_used -= entry.size;
            }
        }
    }

    /// Removes every expired chunk. The relay calls this now and then.
    /// Returns how many went.
    pub fn expire(&mut self) -> usize {
        let old: Vec<ChunkId> = self
            .entries
            .iter()
            .filter(|(_, entry)| self.expired(entry.at))
            .map(|(id, _)| *id)
            .collect();
        old.iter().filter(|id| self.delete(id).is_ok()).count()
    }
}

/// Writes `chunk` after its hour to a `.part` file, then puts it in place.
fn write_chunk(path: &Path, at: u64, chunk: &[u8]) -> io::Result<()> {
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
        file.write_all(chunk)?;
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

impl Default for FileStore {
    fn default() -> Self {
        FileStore::in_memory(DEFAULT_MEMORY_CAP, DEFAULT_TTL)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};

    /// A fresh folder in the system temp directory, removed when dropped.
    struct TempDir(PathBuf);

    impl TempDir {
        fn new() -> TempDir {
            static NEXT: AtomicUsize = AtomicUsize::new(0);
            let n = NEXT.fetch_add(1, Ordering::Relaxed);
            let path =
                std::env::temp_dir().join(format!("erevos-files-test-{}-{n}", std::process::id()));
            let _ = fs::remove_dir_all(&path);
            TempDir(path)
        }
    }

    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn both(dir: &TempDir) -> [FileStore; 2] {
        [
            FileStore::default(),
            FileStore::open(&dir.0, DEFAULT_CAP, DEFAULT_TTL).unwrap(),
        ]
    }

    #[test]
    fn a_chunk_is_there_until_deleted() {
        let dir = TempDir::new();
        for mut s in both(&dir) {
            let id = s.put(b"chunk".to_vec()).unwrap();
            assert_eq!(s.get(&id).unwrap(), b"chunk");
            assert_eq!(s.get(&id).unwrap(), b"chunk");
            assert_eq!(s.used(), 5);
            s.delete(&id).unwrap();
            assert_eq!(s.get(&id), Err(FileError::NotFound));
            assert_eq!(s.delete(&id), Err(FileError::NotFound));
            assert_eq!(s.used(), 0);
        }
        assert_eq!(fs::read_dir(&dir.0).unwrap().count(), 0);
    }

    #[test]
    fn the_store_refuses_chunks_past_its_cap() {
        let mut s = FileStore::in_memory(10, DEFAULT_TTL);
        let id = s.put(vec![1; 6]).unwrap();
        assert_eq!(s.put(vec![2; 6]), Err(FileError::Full));
        s.delete(&id).unwrap();
        s.put(vec![2; 6]).unwrap();
    }

    #[test]
    fn open_places_chunks_take_half_the_room_at_most() {
        let mut s = FileStore::in_memory(10, DEFAULT_TTL);
        let first = s.put_open(vec![1; 3], 0).unwrap();
        s.put_open(vec![2; 2], 0).unwrap();
        // All open places' chunks together hold half the room: one more is refused.
        assert_eq!(s.put_open(vec![3; 1], 0), Err(FileError::Full));
        assert_eq!(
            s.put_open(vec![3; 1], system_now() + HOUR),
            Err(FileError::Full)
        );
        // The other half is the phones' with places of their own.
        s.put(vec![4; 5]).unwrap();
        assert_eq!(s.put(vec![5; 1]), Err(FileError::Full));
        assert_eq!((s.used(), s.open_used), (10, 5));
        // Deleted, an open place's chunk gives its room back.
        s.delete(&first).unwrap();
        assert_eq!((s.used(), s.open_used), (7, 2));
        let again = s.put_open(vec![6; 3], 0).unwrap();
        assert_eq!(s.put_open(vec![7; 1], 0), Err(FileError::Full));
        assert_eq!(s.get(&again).unwrap(), vec![6; 3]);
        // A phone's chunk deleted makes no room for open places past their half.
        let mut s = FileStore::in_memory(10, DEFAULT_TTL);
        let phones = s.put(vec![8; 4]).unwrap();
        s.put_open(vec![9; 5], 0).unwrap();
        s.delete(&phones).unwrap();
        assert_eq!(s.put_open(vec![9; 1], 0), Err(FileError::Full));
        s.put(vec![8; 5]).unwrap();
    }

    static OPEN_NOW: AtomicU64 = AtomicU64::new(1_800_000_000);
    fn open_now() -> u64 {
        OPEN_NOW.load(Ordering::SeqCst)
    }

    // One test moves this clock, so all of them that use it run in this one.
    #[test]
    fn an_open_place_s_chunks_give_back_their_room_as_they_go_and_are_anyones_after_a_restart() {
        let day = 24 * 60 * 60;
        // Expired, an open place's chunk gives its room back.
        let mut s = FileStore {
            clock: open_now,
            ..FileStore::in_memory(10, 14 * day)
        };
        s.put_open(vec![1; 5], 0).unwrap();
        assert_eq!(s.put_open(vec![2; 1], 0), Err(FileError::Full));
        OPEN_NOW.fetch_add(15 * day, Ordering::SeqCst);
        assert_eq!(s.expire(), 1);
        assert_eq!((s.used(), s.open_used), (0, 0));
        s.put_open(vec![2; 5], 0).unwrap();

        // Kept in a folder: read back after a restart, it counts as anyone's.
        let dir = TempDir::new();
        let id = {
            let mut s = FileStore::open_clocked(&dir.0, 10, 14 * day, open_now).unwrap();
            let id = s.put_open(vec![3; 5], 0).unwrap();
            assert_eq!(s.put_open(vec![4; 1], 0), Err(FileError::Full));
            id
        };
        let mut s = FileStore::open_clocked(&dir.0, 10, 14 * day, open_now).unwrap();
        assert_eq!((s.used(), s.open_used), (5, 0));
        let other = s.put_open(vec![5; 5], 0).unwrap();
        assert_eq!(s.get(&id).unwrap(), vec![3; 5]);
        // Removed by hand, it gives its room back once found gone.
        fs::remove_file(dir.0.join(hex(&other))).unwrap();
        assert_eq!(s.get(&other), Err(FileError::NotFound));
        assert_eq!((s.used(), s.open_used), (5, 0));
        s.delete(&id).unwrap();
        s.put_open(vec![6; 5], 0).unwrap();
        assert_eq!(s.used(), 5);
    }

    // A truncated committed file is not a successful read. This is not an
    // authentication/integrity test: payload integrity belongs to the E2E layer.
    #[test]
    fn truncated_committed_chunk_is_reported_as_storage_failure() {
        let dir = TempDir::new();
        let mut store = FileStore::open(&dir.0, DEFAULT_CAP, DEFAULT_TTL).unwrap();
        let id = store.put(b"encrypted-chunk".to_vec()).unwrap();
        fs::write(dir.0.join(hex(&id)), b"bad").unwrap();
        assert_eq!(store.get(&id), Err(FileError::Storage));
    }

    #[test]
    fn chunks_survive_a_restart_and_unfinished_writes_do_not() {
        let dir = TempDir::new();
        let id = {
            let mut s = FileStore::open(&dir.0, DEFAULT_CAP, DEFAULT_TTL).unwrap();
            s.put(vec![9; 1000]).unwrap()
        };
        let torn = dir.0.join(format!("{}{PART}", hex(&[7; 24])));
        fs::write(&torn, b"half").unwrap();
        let other = dir.0.join("notes.txt");
        fs::write(&other, b"not ours").unwrap();

        let mut s = FileStore::open(&dir.0, DEFAULT_CAP, DEFAULT_TTL).unwrap();
        assert_eq!(s.get(&id).unwrap(), vec![9; 1000]);
        assert_eq!(s.used(), 1000);
        assert!(!torn.exists());
        assert_eq!(fs::read(&other).unwrap(), b"not ours");
    }

    static NOW: AtomicU64 = AtomicU64::new(1_800_000_000);
    fn fake_now() -> u64 {
        NOW.load(Ordering::SeqCst)
    }

    // One test moves the fake clock, so all of them that use it run in this one.
    #[test]
    fn chunks_expire_after_the_ttl() {
        let day = 24 * 60 * 60;
        let dir = TempDir::new();
        let mut s = FileStore::open_clocked(&dir.0, DEFAULT_CAP, 14 * day, fake_now).unwrap();
        let old = s.put(b"old".to_vec()).unwrap();
        NOW.fetch_add(10 * day, Ordering::SeqCst);
        let newer = s.put(b"newer".to_vec()).unwrap();
        let newest = s.put(b"newest".to_vec()).unwrap();
        NOW.fetch_add(5 * day, Ordering::SeqCst);
        assert_eq!(s.get(&old), Err(FileError::NotFound));
        assert_eq!(s.get(&newer).unwrap(), b"newer");
        drop(s);

        // Opening drops what expired while the relay was stopped.
        NOW.fetch_add(10 * day, Ordering::SeqCst);
        let mut s = FileStore::open_clocked(&dir.0, DEFAULT_CAP, 14 * day, fake_now).unwrap();
        assert_eq!(s.used(), 0);
        assert_eq!(s.get(&newest), Err(FileError::NotFound));
        assert_eq!(fs::read_dir(&dir.0).unwrap().count(), 0);

        // And so does the sweep.
        let mut s = FileStore {
            clock: fake_now,
            ..FileStore::in_memory(DEFAULT_MEMORY_CAP, 14 * day)
        };
        s.put(b"a".to_vec()).unwrap();
        NOW.fetch_add(15 * day, Ordering::SeqCst);
        s.put(b"b".to_vec()).unwrap();
        assert_eq!(s.expire(), 1);
        assert_eq!(s.used(), 1);
    }

    #[cfg(unix)]
    #[test]
    fn only_the_owner_can_read_the_chunks() {
        use std::os::unix::fs::PermissionsExt;
        let dir = TempDir::new();
        let mut s = FileStore::open(&dir.0, DEFAULT_CAP, DEFAULT_TTL).unwrap();
        let id = s.put(b"x".to_vec()).unwrap();
        let mode = |p: &Path| fs::metadata(p).unwrap().permissions().mode() & 0o777;
        assert_eq!(mode(&dir.0), 0o700);
        assert_eq!(mode(&dir.0.join(hex(&id))), 0o600);
    }
}
