// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! Tokens of their own for each phone, beside the relay's one token.
//!
//! The operator keeps a file (`EREVOS_RELAY_TOKENS`) of one token's SHA-256 a
//! line, in hex, and after it, if they like, a name for whose phone it is:
//!
//! ```text
//! # Nekten's Pixel
//! 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08 pixel
//! ```
//!
//! `erevos-relay new-token NAME` makes a token and prints it, for the phone,
//! with its line, for the file. A connection whose token's SHA-256 is on a
//! line uses the relay as one with the relay's token does. Taking the line out
//! takes the phone's access back, without changing anyone else's: the file is
//! read again whenever it changes, and from then on the token is refused. The
//! relay never keeps the tokens themselves, so the file tells no one how to
//! connect. Blank lines and lines that start with `#` are left out; a file
//! that is not there holds no tokens.
//!
//! The relay adds lines itself too, for a phone invited by another (see
//! `invites.rs`), signed in with a provider (see `signin.rs`) or given an
//! open place (see `open.rs`), and takes them out again when the phone that
//! invited it takes its invite back, the provider no longer lets the account
//! in, or the open place went unused. It writes the whole file again then,
//! through a file beside it and a rename (`journal::write_whole_then`),
//! keeping every other line as it was, so the folder the file is in must be
//! one the relay can write. What it adds says where the line came from, after
//! the name:
//!
//! ```text
//! 3b7c0e5a8d16...91e1 maria # invited by pixel on 2026-10-21
//! 5d41402abc4b...e2a0 lphl:nekten # signed in with LPHL on 2026-10-21
//! 9c56cc51b374...7f03 open-5f3a9c01 # open place on 2026-11-26
//! ```
//!
//! A line named `open-` and more is an open place's, whoever wrote it, and
//! the relay names no other line so (`open::not_open`).
//!
//! A line an invite made stands on its own once it is in the file, as a line
//! the operator wrote does: whatever takes out the line of the phone that
//! invited it (its own inviter, the provider's check, the operator deleting
//! it by hand), it stays, and so do the lines it invited. Taking a line out
//! takes out that line alone. Who invited whom is kept by `invites.rs` only,
//! for each phone's invites.
//!
//! Reading the file never writes it, so a save of the operator's under way,
//! read halfway, is never written over with its first half. A line the relay
//! took out when the file could not be written is refused all the same
//! (`refused`), and taken out of the file only when the relay writes the file
//! anyway (`add`, `remove`) or in its hourly look (`prune`), and then only
//! once the file has stayed as it is for `SETTLE` (or is as the relay itself
//! wrote it), and only if it is still as read just before, by its time,
//! length and inode. That is kept in memory only, so after a restart the line
//! is in force again until whatever took it out does so again: the provider's
//! check keeps its record for that (see `signin.rs`), and an invite taken
//! back stays until then. Since the relay writes the file through a rename,
//! its path must be the file itself: the relay refuses to start, or to write,
//! when it is a symbolic link (`plain_file`).

use std::collections::{HashMap, HashSet};
use std::fs;
use std::io::{self, ErrorKind};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant, SystemTime};

use rand::RngCore;
use sha2::{Digest, Sha256};

use crate::journal;
use crate::lock::lock;
use crate::open;

const TOKENS_LOCK: &str = "lock of the phones' tokens";

/// How long the file must have stayed as it is before the relay takes lines
/// out of force out of it, or takes a line missing from it as gone: an edit
/// being saved is over long before.
pub const SETTLE: Duration = Duration::from_secs(60);

/// Times the relay reads the file again for a change of its own when the
/// file changed while it was read or before it was written.
const TRIES: usize = 3;

/// When the file was last changed, how long it is and which file it is (its
/// inode): together they tell whether it changed since it was read.
type Stamp = (SystemTime, u64, u64);

pub struct Tokens {
    path: PathBuf,
    seen: Mutex<Seen>,
}

#[derive(Default)]
struct Seen {
    /// The file's stamp as last read; `None` when it was not there.
    stamp: Option<Stamp>,
    /// Whether it was read at all yet.
    read: bool,
    /// When the relay first saw the file as `stamp` says, by its own clock.
    since: Option<Instant>,
    /// The file's stamp as the relay itself last wrote it.
    wrote: Option<Stamp>,
    /// Whether the relay already said it cannot read the file, so it says so
    /// once until the file can be read again, not on every connection.
    complained: bool,
    /// Each token's SHA-256 with a line in the file, with the name on its
    /// line ('' when it has none).
    all: HashMap<[u8; 32], String>,
    /// Those whose line is in force: all but the refused.
    hashes: HashMap<[u8; 32], String>,
    /// Lines the relay took out, refused whether or not that could be
    /// written yet; each goes from here once the file is written without it.
    refused: HashSet<[u8; 32]>,
}

/// A phone whose token is on a line of the file: the token's SHA-256 and the
/// name on its line.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Phone {
    pub hash: [u8; 32],
    pub name: String,
}

impl Tokens {
    /// The tokens in the file at `path`, read when first asked.
    pub fn new(path: PathBuf) -> Tokens {
        Tokens {
            path,
            seen: Mutex::default(),
        }
    }

    /// Whether `token` is on a line of the file, reading it again if it
    /// changed since.
    #[cfg(test)]
    pub fn has(&self, token: &str) -> bool {
        self.find(token).is_some()
    }

    /// The phone whose token `token` is, if it is on a line of the file,
    /// reading it again if it changed since.
    pub fn find(&self, token: &str) -> Option<Phone> {
        let hash: [u8; 32] = Sha256::digest(token.as_bytes()).into();
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        self.refresh(&mut seen);
        seen.hashes.get(&hash).map(|name| Phone {
            hash,
            name: name.clone(),
        })
    }

    /// Whether the token whose SHA-256 is `hash` is on a line of the file.
    pub fn holds(&self, hash: &[u8; 32]) -> bool {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        self.refresh(&mut seen);
        seen.hashes.contains_key(hash)
    }

    /// Whether the file has a line for the token whose SHA-256 is `hash`, in
    /// force or not.
    pub fn in_file(&self, hash: &[u8; 32]) -> bool {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        self.refresh(&mut seen);
        seen.all.contains_key(hash)
    }

    /// Whether the line of the token whose SHA-256 is `hash` is surely gone
    /// from the file: not in it as read once the file had stayed as it is for
    /// `SETTLE`, or as the relay wrote it, so not halfway through a save. Never
    /// while the file is not there.
    pub fn gone(&self, hash: &[u8; 32]) -> bool {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        self.refresh(&mut seen);
        !seen.all.contains_key(hash) && seen.settled(seen.stamp)
    }

    /// How many lines the file has now, in force or not.
    pub fn lines_in_file(&self) -> usize {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        self.refresh(&mut seen);
        seen.all.len()
    }

    /// The tokens' SHA-256s of the lines named `name`, in force or not, the
    /// case of its letters aside.
    pub fn named(&self, name: &str) -> Vec<[u8; 32]> {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        self.refresh(&mut seen);
        let name = name.to_lowercase();
        seen.all
            .iter()
            .filter(|(_, named)| named.to_lowercase() == name)
            .map(|(hash, _)| *hash)
            .collect()
    }

    /// The name on the line of the token whose SHA-256 is `hash`, if the file
    /// has that line.
    pub fn name_of(&self, hash: &[u8; 32]) -> Option<String> {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        self.refresh(&mut seen);
        seen.hashes.get(hash).cloned()
    }

    /// Each line in force: its token's SHA-256 and the name on it.
    pub fn lines(&self) -> Vec<([u8; 32], String)> {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        self.refresh(&mut seen);
        seen.hashes
            .iter()
            .map(|(hash, name)| (*hash, name.clone()))
            .collect()
    }

    /// Reads the file again, changed or not, and writes it again without the
    /// lines the relay took out when that could not be written. Only once the
    /// file has stayed as it is for `SETTLE`, and only if it did not change
    /// since it was read. The relay calls this now and then.
    pub fn prune(&self) {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        seen.read = false;
        self.refresh(&mut seen);
        if !seen.read || !seen.settled(seen.stamp) {
            return;
        }
        // Lines taken out that are gone from the file need refusing no more.
        let Seen { all, refused, .. } = &mut *seen;
        refused.retain(|hash| all.contains_key(hash));
        if seen.hashes.len() == seen.all.len() {
            return;
        }
        if let Err(e) = self.rewrite(&mut seen, |_| Ok(())) {
            elog!(
                "erevos-relay: cannot take the lines out of force out of {} now, so they are only refused until the next try: {e}",
                self.path.display()
            );
        }
    }

    /// Adds a line for the token whose SHA-256 is `hash`, named `name`, and
    /// `note` after it as a comment. With `unique`, a name another line has
    /// already gets `-2`, `-3` and so on after it. With `instead`, the line of
    /// that token goes in the same write. Returns the name written, which is
    /// never an open place's (`open::not_open`). The file is read again first,
    /// so a line the operator just added stays; one for `hash` already there is
    /// an error (`AlreadyExists`), and nothing is written.
    pub fn add(
        &self,
        hash: &[u8; 32],
        name: &str,
        unique: bool,
        note: &str,
        instead: Option<&[u8; 32]>,
    ) -> io::Result<String> {
        let name = open::not_open(name);
        self.add_named(hash, note, instead, |taken| {
            let mut written = name.clone();
            let mut n = 1;
            while unique && taken.contains(&written.to_lowercase()) {
                n += 1;
                written = open::not_open(&format!("{name}-{n}"));
            }
            written
        })
    }

    /// Adds a line for the token whose SHA-256 is `hash`, for an open place
    /// (see `open.rs`): named `open-` and 8 random hex digits that no other
    /// line has, with `note` after it as a comment. Returns the name written.
    /// As for `add`, one for `hash` already there is an error
    /// (`AlreadyExists`), and nothing is written.
    pub fn add_open(&self, hash: &[u8; 32], note: &str) -> io::Result<String> {
        self.add_named(hash, note, None, |taken| loop {
            let name = open::new_name();
            if !taken.contains(&name) {
                break name;
            }
        })
    }

    /// Adds a line for the token whose SHA-256 is `hash`, with `note` after
    /// it, named as `name` says from the names other lines have (in lower
    /// case), in place of the line of `instead` if given, all in one write.
    fn add_named(
        &self,
        hash: &[u8; 32],
        note: &str,
        instead: Option<&[u8; 32]>,
        name: impl Fn(&[String]) -> String,
    ) -> io::Result<String> {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        let written = self.rewrite(&mut seen, |lines| {
            if lines.iter().any(|line| line_hash(line) == Some(*hash)) {
                return Err(io::Error::new(
                    ErrorKind::AlreadyExists,
                    "a line for that token is in the file already",
                ));
            }
            lines.retain(|line| !matches!(instead, Some(gone) if line_hash(line) == Some(*gone)));
            let taken: Vec<String> = lines
                .iter()
                .filter_map(|line| line_name(line))
                .map(|name| name.to_lowercase())
                .collect();
            let written = name(&taken);
            lines.push(format!("{} {written} # {note}", to_hex(hash)));
            Ok(written)
        })?;
        // The relay put it in itself, so it is wanted whatever it refused before.
        seen.refused.remove(hash);
        seen.force();
        Ok(written)
    }

    /// Takes out the line of the token whose SHA-256 is `hash`, and no other:
    /// the lines it invited stay. False when the file has no such line. The
    /// line is refused from now on, even when the file cannot be written now:
    /// the next look writes it out (`prune`).
    pub fn remove(&self, hash: &[u8; 32]) -> io::Result<bool> {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        seen.refused.insert(*hash);
        seen.force();
        let found = self.rewrite(&mut seen, |lines| {
            let before = lines.len();
            lines.retain(|line| line_hash(line) != Some(*hash));
            Ok(lines.len() != before)
        })?;
        // Not in a file read once it stayed as it is: nothing is left to refuse.
        self.refresh(&mut seen);
        if !seen.all.contains_key(hash) && seen.settled(seen.stamp) {
            seen.refused.remove(hash);
        }
        Ok(found)
    }

    /// Writes the file again from what it holds now, with `change` made to its
    /// lines and, when the file has stayed as it is for `SETTLE`, without the
    /// lines refused. The file is read again first, so no line written since
    /// is lost, and written only if it is still as read then; when it changed
    /// meanwhile, all that is done again, `TRIES` times at most. Nothing is
    /// written when nothing changed.
    fn rewrite<T>(
        &self,
        seen: &mut Seen,
        mut change: impl FnMut(&mut Vec<String>) -> io::Result<T>,
    ) -> io::Result<T> {
        let mut tries = 0;
        loop {
            let again = |e: &io::Error, tries: &mut usize| {
                *tries += 1;
                let more = e.kind() == ErrorKind::Interrupted && *tries < TRIES;
                if more {
                    thread::sleep(Duration::from_millis(50));
                }
                more
            };
            let (text, stamp) = match self.read_now() {
                Ok(read) => read,
                Err(e) if again(&e, &mut tries) => continue,
                Err(e) => return Err(e),
            };
            let before: Vec<String> = text.lines().map(str::to_string).collect();
            let mut lines = before.clone();
            let out = change(&mut lines)?;
            if seen.settled(stamp) {
                lines.retain(|line| {
                    line_hash(line).is_none_or(|hash| !seen.refused.contains(&hash))
                });
            }
            if lines == before {
                return Ok(out);
            }
            match self.write(seen, &lines, stamp) {
                Ok(()) => return Ok(out),
                Err(e) if again(&e, &mut tries) => continue,
                Err(e) => return Err(e),
            }
        }
    }

    /// The file as it is now, and its stamp; empty, with none, when it is not
    /// there. An error (`Interrupted`) when it changed while it was read.
    fn read_now(&self) -> io::Result<(String, Option<Stamp>)> {
        let before = stamp_of(&self.path)?;
        let text = match fs::read_to_string(&self.path) {
            Ok(text) => text,
            Err(e) if e.kind() == ErrorKind::NotFound => String::new(),
            Err(e) => return Err(e),
        };
        let after = stamp_of(&self.path)?;
        if before != after {
            return Err(io::Error::new(
                ErrorKind::Interrupted,
                "the file changed while it was read",
            ));
        }
        Ok((text, after))
    }

    /// Writes `lines` as the whole file, if the file is still as `read` says
    /// it was, and reads it back. An error (`Interrupted`) when it changed
    /// since.
    fn write(&self, seen: &mut Seen, lines: &[String], read: Option<Stamp>) -> io::Result<()> {
        plain_file(&self.path)?;
        let mut text = lines.join("\n");
        text.push('\n');
        let mut wrote = None;
        journal::write_whole_then(&self.path, text.as_bytes(), |file| {
            if stamp_of(&self.path)? != read {
                return Err(io::Error::new(
                    ErrorKind::Interrupted,
                    "the file changed since it was read",
                ));
            }
            // A rename keeps the time, length and inode of the file it puts in place.
            wrote = Some(stamped(&file.metadata()?));
            Ok(())
        })?;
        seen.wrote = wrote;
        let kept: HashSet<[u8; 32]> = lines.iter().filter_map(|line| line_hash(line)).collect();
        seen.refused.retain(|hash| kept.contains(hash));
        seen.read = false;
        self.refresh(seen);
        Ok(())
    }

    /// The file as it is now, each line as written; empty when it is not
    /// there. An error when it cannot be read, or changed while it was read.
    pub fn text(&self) -> io::Result<String> {
        self.read_now().map(|(text, _)| text)
    }

    /// How many tokens the file holds now, reading it if it changed.
    pub fn count(&self) -> usize {
        let mut seen = lock(&self.seen, TOKENS_LOCK);
        self.refresh(&mut seen);
        seen.hashes.len()
    }

    /// Reads the file again if it changed since, or was not read yet. Never
    /// writes it.
    fn refresh(&self, seen: &mut Seen) {
        let stamp = match stamp_of(&self.path) {
            Ok(stamp) => stamp,
            Err(e) => {
                // Unreadable for now: the tokens read last stay as they were.
                seen.complain(&format!(
                    "cannot look at the phones' tokens in {}: {e}",
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
                        "cannot read the phones' tokens in {}: {e}",
                        self.path.display()
                    ));
                    return;
                }
            },
        };
        let mut all = HashMap::new();
        for (n, line) in text.lines().enumerate() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            match line_hash(line) {
                Some(hash) => {
                    all.insert(hash, line_name(line).unwrap_or_default().to_string());
                }
                None => elog!(
                    "erevos-relay: line {} of {} does not start with a token's SHA-256 (64 hex characters), left out",
                    n + 1,
                    self.path.display()
                ),
            }
        }
        if stamp != seen.stamp || seen.since.is_none() {
            seen.since = Some(Instant::now());
        }
        seen.all = all;
        // The stamp from before the read: a change while it was read is read at the next look.
        seen.stamp = stamp;
        seen.read = true;
        seen.complained = false;
        seen.force();
        elog!(
            "erevos-relay: {} phones' tokens in {}",
            seen.hashes.len(),
            self.path.display()
        );
    }
}

impl Seen {
    fn complain(&mut self, what: &str) {
        if !self.complained {
            elog!("erevos-relay: {what}");
            self.complained = true;
        }
    }

    /// Works out the lines in force from the lines read and the lines refused.
    fn force(&mut self) {
        self.hashes = self
            .all
            .iter()
            .filter(|(hash, _)| !self.refused.contains(*hash))
            .map(|(hash, name)| (*hash, name.clone()))
            .collect();
    }

    /// Whether the file, as `stamp` says it is, has stayed as it is for
    /// `SETTLE`, by its time or the relay's clock, or is as the relay wrote it.
    fn settled(&self, stamp: Option<Stamp>) -> bool {
        let Some(stamp) = stamp else {
            return false;
        };
        let old = SystemTime::now()
            .duration_since(stamp.0)
            .is_ok_and(|age| age >= SETTLE);
        let seen_long =
            self.stamp == Some(stamp) && self.since.is_some_and(|since| since.elapsed() >= SETTLE);
        self.wrote == Some(stamp) || old || seen_long
    }
}

/// The stamp of the file at `path`; `None` when it is not there.
fn stamp_of(path: &Path) -> io::Result<Option<Stamp>> {
    match fs::metadata(path) {
        Ok(meta) => Ok(Some(stamped(&meta))),
        Err(e) if e.kind() == ErrorKind::NotFound => Ok(None),
        Err(e) => Err(e),
    }
}

fn stamped(meta: &fs::Metadata) -> Stamp {
    #[cfg(unix)]
    let inode = std::os::unix::fs::MetadataExt::ino(meta);
    #[cfg(not(unix))]
    let inode = 0;
    (
        meta.modified().unwrap_or(SystemTime::UNIX_EPOCH),
        meta.len(),
        inode,
    )
}

/// An error when `path` is a symbolic link: the relay writes the file through
/// a file beside it and a rename, which would put a file of its own where the
/// link was, so it never writes through one.
pub fn plain_file(path: &Path) -> io::Result<()> {
    match fs::symlink_metadata(path) {
        Ok(meta) if meta.file_type().is_symlink() => Err(io::Error::new(
            ErrorKind::InvalidInput,
            format!(
                "{} is a symbolic link; the relay writes this file, so it must be the file itself",
                path.display()
            ),
        )),
        _ => Ok(()),
    }
}

/// The SHA-256 a line of the file starts with, if it is one.
pub(crate) fn line_hash(line: &str) -> Option<[u8; 32]> {
    let line = line.trim();
    if line.starts_with('#') {
        return None;
    }
    line.split_whitespace().next().and_then(hash_of)
}

/// The name on a line of the file, after the SHA-256, if it has one.
pub(crate) fn line_name(line: &str) -> Option<&str> {
    line_hash(line)?;
    line.split_whitespace()
        .nth(1)
        .filter(|name| !name.starts_with('#'))
}

fn hash_of(hex: &str) -> Option<[u8; 32]> {
    if hex.len() != 64 || !hex.is_ascii() {
        return None;
    }
    let mut hash = [0u8; 32];
    for (i, byte) in hash.iter_mut().enumerate() {
        *byte = u8::from_str_radix(&hex[2 * i..2 * i + 2], 16).ok()?;
    }
    Some(hash)
}

pub fn to_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

/// A line as the log names it: the first 12 hex digits of its token's
/// SHA-256, which start the line in the file, never the name after it, so
/// the log holds no one's name (`grep ^<these> <file>` finds the line).
pub fn short(line: &[u8; 32]) -> String {
    to_hex(&line[..6])
}

/// A new token for a phone, and its line for the file, with `name` after it.
pub fn new_token(name: &str) -> (String, String) {
    let mut bytes = [0u8; 32];
    rand::rngs::OsRng.fill_bytes(&mut bytes);
    let token = to_hex(&bytes);
    let hash = to_hex(&Sha256::digest(token.as_bytes()));
    let name: String = name.split_whitespace().collect::<Vec<_>>().join("-");
    let line = if name.is_empty() {
        hash
    } else {
        format!("{hash} {name}")
    };
    (token, line)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    struct TempPath(PathBuf);

    impl TempPath {
        fn new(name: &str) -> TempPath {
            let mut bytes = [0u8; 8];
            rand::rngs::OsRng.fill_bytes(&mut bytes);
            TempPath(std::env::temp_dir().join(format!("erevos-tokens-{name}-{}", to_hex(&bytes))))
        }
    }

    impl Drop for TempPath {
        fn drop(&mut self) {
            let _ = fs::remove_file(&self.0);
        }
    }

    // Writes the file and makes sure it reads as changed, even within one
    // tick of the clock.
    fn write(path: &PathBuf, text: &str, n: u64) {
        fs::write(path, text).unwrap();
        let file = fs::File::options().write(true).open(path).unwrap();
        file.set_modified(SystemTime::UNIX_EPOCH + Duration::from_secs(1_000_000 + n))
            .unwrap();
    }

    #[test]
    fn a_phone_with_a_token_on_the_list_comes_in_until_its_line_goes() {
        let path = TempPath::new("list");
        let tokens = Tokens::new(path.0.clone());
        let (pixel, pixel_line) = new_token("Nekten's Pixel");
        let (other, other_line) = new_token("");
        assert_eq!(pixel.len(), 64);
        assert!(pixel_line.ends_with(" Nekten's-Pixel"));
        assert!(!other_line.contains(' '));
        // No file yet: no phone's token.
        assert!(!tokens.has(&pixel));
        write(
            &path.0,
            &format!("# phones\n\n{pixel_line}\n{other_line}\nnot a hash\n"),
            1,
        );
        assert!(tokens.has(&pixel));
        assert!(tokens.has(&other));
        assert_eq!(tokens.count(), 2);
        // A token is not its hash, nor another's.
        assert!(!tokens.has(pixel_line.split(' ').next().unwrap()));
        assert!(!tokens.has(&new_token("").0));
        // The Pixel's line taken out: its token is refused, the other's still taken.
        write(&path.0, &format!("{other_line}\n"), 2);
        assert!(!tokens.has(&pixel));
        assert!(tokens.has(&other));
        // The file gone: none.
        fs::remove_file(&path.0).unwrap();
        assert!(!tokens.has(&other));
    }

    #[test]
    fn the_relay_adds_and_takes_out_lines_keeping_the_rest() {
        let path = TempPath::new("written");
        let tokens = Tokens::new(path.0.clone());
        let (pixel, pixel_line) = new_token("pixel");
        let operator = format!("# Nekten's phones\n\n{pixel_line}\n  # an old one\nnot a hash\n");
        write(&path.0, &operator, 1);
        let maria: [u8; 32] = Sha256::digest(b"maria's token").into();
        let anna: [u8; 32] = Sha256::digest(b"anna's token").into();
        assert_eq!(
            tokens
                .add(
                    &maria,
                    "maria",
                    true,
                    "invited by pixel on 2026-10-21",
                    None
                )
                .unwrap(),
            "maria"
        );
        assert_eq!(
            tokens
                .add(&anna, "PIXEL", true, "invited by pixel", None)
                .unwrap(),
            "PIXEL-2"
        );
        let text = fs::read_to_string(&path.0).unwrap();
        assert_eq!(
            text,
            format!(
                "{operator}{} maria # invited by pixel on 2026-10-21\n{} PIXEL-2 # invited by pixel\n",
                to_hex(&maria),
                to_hex(&anna)
            )
        );
        assert!(tokens.has("maria's token") && tokens.has(&pixel));
        assert_eq!(tokens.name_of(&maria).as_deref(), Some("maria"));
        assert_eq!(
            tokens.find(&pixel).map(|p| p.name),
            Some("pixel".to_string())
        );
        // Taken out: only that line goes.
        assert!(tokens.remove(&maria).unwrap());
        assert!(!tokens.remove(&maria).unwrap());
        assert!(!tokens.has("maria's token") && tokens.has("anna's token"));
        assert_eq!(
            fs::read_to_string(&path.0).unwrap(),
            format!("{operator}{} PIXEL-2 # invited by pixel\n", to_hex(&anna))
        );
        // Not unique, and in place of another line, in one write.
        let again: [u8; 32] = Sha256::digest(b"anna's new token").into();
        assert_eq!(
            tokens
                .add(&again, "PIXEL-2", false, "again", Some(&anna))
                .unwrap(),
            "PIXEL-2"
        );
        assert!(!tokens.has("anna's token") && tokens.has("anna's new token"));
        // A file that is not there yet is made.
        fs::remove_file(&path.0).unwrap();
        tokens.add(&maria, "maria", true, "new", None).unwrap();
        assert!(tokens.has("maria's token"));
        assert_eq!(tokens.count(), 1);
    }

    #[test]
    fn a_line_an_invite_made_stays_when_its_inviter_s_line_goes_and_one_taken_out_goes_alone() {
        let path = TempPath::new("invited");
        let tokens = Tokens::new(path.0.clone());
        let line = |token: &str| -> [u8; 32] { Sha256::digest(token.as_bytes()).into() };
        let (pixel, maria, anna, other) =
            (line("pixel"), line("maria"), line("anna"), line("other"));
        write(
            &path.0,
            &format!(
                "# phones\n{} pixel\n{} maria # invited by pixel\n{} anna # invited by maria\n{} other\n",
                to_hex(&pixel),
                to_hex(&maria),
                to_hex(&anna),
                to_hex(&other)
            ),
            1,
        );
        assert!(tokens.has("pixel") && tokens.has("maria") && tokens.has("anna"));
        // The operator deletes Pixel's line by hand: Maria's stays, and Anna's, whom Maria invited.
        let without = format!(
            "# phones\n{} maria # invited by pixel\n{} anna # invited by maria\n{} other\n",
            to_hex(&maria),
            to_hex(&anna),
            to_hex(&other)
        );
        write(&path.0, &without, 2);
        assert!(!tokens.has("pixel"));
        assert!(tokens.has("maria") && tokens.has("anna") && tokens.has("other"));
        assert_eq!(tokens.count(), 3);
        // The hourly look leaves them in the file.
        tokens.prune();
        assert_eq!(fs::read_to_string(&path.0).unwrap(), without);
        assert!(tokens.gone(&pixel) && !tokens.gone(&maria) && !tokens.gone(&anna));
        // Taken out by the relay, as an invite taken back or the provider's check does: that line alone.
        assert!(tokens.remove(&maria).unwrap());
        assert!(!tokens.has("maria") && tokens.has("anna") && tokens.has("other"));
        assert_eq!(
            fs::read_to_string(&path.0).unwrap(),
            format!(
                "# phones\n{} anna # invited by maria\n{} other\n",
                to_hex(&anna),
                to_hex(&other)
            )
        );
        // A line put in place of another, as signing in again does, takes out that one alone too.
        let (signed, again) = (line("signed in"), line("signed in again"));
        tokens
            .add(&signed, "lphl:x", true, "signed in", None)
            .unwrap();
        tokens
            .add(&again, "lphl:x", false, "signed in again", Some(&signed))
            .unwrap();
        assert!(!tokens.has("signed in") && tokens.has("signed in again"));
        assert!(tokens.has("anna") && tokens.has("other"));
        tokens.remove(&again).unwrap();
        assert!(tokens.has("anna") && tokens.has("other"));
        assert_eq!(tokens.count(), 2);
    }

    #[test]
    fn a_line_for_a_token_already_there_is_refused_and_nothing_is_written() {
        let path = TempPath::new("twice");
        let tokens = Tokens::new(path.0.clone());
        let maria: [u8; 32] = Sha256::digest(b"maria").into();
        tokens.add(&maria, "maria", true, "first", None).unwrap();
        let before = fs::read_to_string(&path.0).unwrap();
        let e = tokens
            .add(&maria, "someone", true, "again", None)
            .unwrap_err();
        assert_eq!(e.kind(), ErrorKind::AlreadyExists);
        assert_eq!(fs::read_to_string(&path.0).unwrap(), before);
    }

    #[test]
    fn only_an_open_place_s_line_is_named_as_one() {
        let path = TempPath::new("open");
        let tokens = Tokens::new(path.0.clone());
        let line = |token: &str| -> [u8; 32] { Sha256::digest(token.as_bytes()).into() };
        // A name typed for an invite, or a provider's, is never an open place's.
        assert_eq!(tokens.add(&line("a"), "Open-maria", true, "invited", None).unwrap(), "Openmaria");
        assert_eq!(tokens.add(&line("b"), "open", true, "invited", None).unwrap(), "open");
        assert_eq!(tokens.add(&line("c"), "open", true, "invited", None).unwrap(), "open2");
        assert_eq!(tokens.add(&line("d"), "open-:x", false, "signed in", None).unwrap(), "open:x");
        // An open place's has a name no other line has, with its note.
        let first = tokens.add_open(&line("e"), "open place on 2026-11-26").unwrap();
        let second = tokens.add_open(&line("f"), "open place on 2026-11-26").unwrap();
        assert!(open::is_open(&first) && open::is_open(&second) && first != second);
        let text = fs::read_to_string(&path.0).unwrap();
        assert!(text.ends_with(&format!(
            "{} {first} # open place on 2026-11-26\n{} {second} # open place on 2026-11-26\n",
            to_hex(&line("e")),
            to_hex(&line("f"))
        )));
        assert_eq!(text.lines().filter(|l| line_name(l).is_some_and(open::is_open)).count(), 2);
        assert_eq!(tokens.text().unwrap(), text);
        // One for a token already there is refused, and nothing is written.
        let e = tokens.add_open(&line("a"), "again").unwrap_err();
        assert_eq!(e.kind(), ErrorKind::AlreadyExists);
        assert_eq!(fs::read_to_string(&path.0).unwrap(), text);
    }

    #[cfg(unix)]
    #[test]
    fn a_file_of_tokens_that_is_a_link_is_never_written() {
        let path = TempPath::new("target");
        let link = TempPath::new("link");
        let pixel: [u8; 32] = Sha256::digest(b"pixel").into();
        let maria: [u8; 32] = Sha256::digest(b"maria").into();
        write(
            &path.0,
            &format!("{} pixel\n{} maria\n", to_hex(&pixel), to_hex(&maria)),
            1,
        );
        std::os::unix::fs::symlink(&path.0, &link.0).unwrap();
        let e = plain_file(&link.0).unwrap_err();
        assert!(e.to_string().contains("symbolic link"), "{e}");
        assert!(plain_file(&path.0).is_ok());
        assert!(plain_file(&path.0.with_extension("none")).is_ok());
        let tokens = Tokens::new(link.0.clone());
        assert!(tokens.has("pixel"));
        let e = tokens
            .add(&Sha256::digest(b"anna").into(), "anna", true, "new", None)
            .unwrap_err();
        assert_eq!(e.kind(), ErrorKind::InvalidInput);
        // A line taken out cannot be written out through the link, but is refused all the same.
        assert!(tokens.remove(&pixel).is_err());
        assert!(!tokens.has("pixel") && tokens.has("maria"));
        tokens.prune();
        assert!(!tokens.has("pixel") && tokens.has("maria"));
        assert!(fs::symlink_metadata(&link.0)
            .unwrap()
            .file_type()
            .is_symlink());
        let text = fs::read_to_string(&path.0).unwrap();
        assert!(text.contains(&to_hex(&pixel)) && text.contains(&to_hex(&maria)));
        // The file itself in the link's place: the next look writes it out, and only it.
        fs::remove_file(&link.0).unwrap();
        fs::rename(&path.0, &link.0).unwrap();
        tokens.prune();
        assert_eq!(
            fs::read_to_string(&link.0).unwrap(),
            format!("{} maria\n", to_hex(&maria))
        );
        assert!(!tokens.has("pixel") && tokens.has("maria"));
    }

    #[test]
    fn a_save_read_halfway_loses_no_line_and_a_file_changed_since_it_was_read_is_not_written() {
        let path = TempPath::new("halfway");
        let tokens = Tokens::new(path.0.clone());
        let line = |token: &str| -> [u8; 32] { Sha256::digest(token.as_bytes()).into() };
        let (pixel, maria, other) = (line("pixel"), line("maria"), line("other"));
        let first = format!("# phones\n{} maria # invited by pixel\n", to_hex(&maria));
        let rest = format!("{} pixel\n{} other\n", to_hex(&pixel), to_hex(&other));
        write(&path.0, &format!("{first}{rest}"), 1);
        assert!(tokens.has("maria") && tokens.has("pixel") && tokens.has("other"));
        // Other's line taken out when the file could not be written: refused until a look writes it out.
        {
            let mut seen = lock(&tokens.seen, TOKENS_LOCK);
            seen.refused.insert(other);
            seen.force();
        }
        assert!(!tokens.has("other"));
        // The operator saves the file in place (nano, cat >), and the relay reads it halfway through.
        fs::write(&path.0, &first).unwrap();
        assert!(tokens.has("maria") && !tokens.has("pixel"));
        assert!(
            !tokens.gone(&pixel),
            "a file just changed may be halfway saved"
        );
        tokens.prune();
        assert_eq!(
            fs::read_to_string(&path.0).unwrap(),
            first,
            "nothing written"
        );
        // The rest comes: every line is there, and in force again but Other's, still refused.
        let mut file = fs::File::options().append(true).open(&path.0).unwrap();
        std::io::Write::write_all(&mut file, rest.as_bytes()).unwrap();
        drop(file);
        assert!(tokens.has("maria") && tokens.has("pixel") && !tokens.has("other"));
        tokens.prune();
        assert_eq!(
            fs::read_to_string(&path.0).unwrap(),
            format!("{first}{rest}")
        );
        // A write from a read the file changed since is refused, and leaves the file as it is.
        let (text, stamp) = tokens.read_now().unwrap();
        let more = format!("{first}{rest}{} anna\n", to_hex(&line("anna")));
        fs::write(&path.0, &more).unwrap();
        let lines: Vec<String> = text.lines().map(str::to_string).collect();
        let mut seen = lock(&tokens.seen, TOKENS_LOCK);
        let e = tokens.write(&mut seen, &lines, stamp).unwrap_err();
        assert_eq!(e.kind(), ErrorKind::Interrupted);
        drop(seen);
        assert_eq!(fs::read_to_string(&path.0).unwrap(), more);
        assert!(!path.0.with_extension("tmp").exists());
        // The relay's own changes read the file again and keep that line.
        tokens.remove(&other).unwrap();
        assert!(tokens.has("anna") && !tokens.has("other"));
        // A line missing from a file left as it is for a minute is gone; from a file not there, never.
        write(&path.0, &first, 2);
        assert!(tokens.gone(&pixel) && !tokens.gone(&maria));
        write(&path.0, "# nothing\n", 3);
        assert!(tokens.gone(&pixel) && tokens.lines_in_file() == 0);
        fs::remove_file(&path.0).unwrap();
        assert!(!tokens.gone(&pixel));
    }
}
