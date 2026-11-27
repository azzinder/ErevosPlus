// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! Invites to the relay: a phone with a token of its own (`tokens.rs`) lets
//! one more phone in, with a token of that phone's own.
//!
//! Off unless the operator turns it on (`EREVOS_RELAY_INVITES=on`, which also
//! needs `EREVOS_RELAY_TOKENS`). A phone whose token is on a line of the file
//! asks for an invite with a name (`INVITE`) and shows it as a QR code: the
//! relay's address and a secret of 32 random bytes. The phone that scans it
//! makes a token for itself and gives the secret and its token's SHA-256 on
//! the `/join` path (`REDEEM`), which needs no token. The relay then adds a
//! line for that token to the file, with the name made safe (`safe_name`)
//! and a comment saying who invited it and when, so the operator sees who let
//! whom in, and deleting the line takes that phone's access back alone, as for
//! any line. The token itself never comes to the relay but as that phone's
//! token on its connections.
//!
//! An invite lasts `INVITE_DAYS` and takes one phone. The same secret with the
//! same token's SHA-256 is answered again, so a phone whose answer was lost on
//! the way asks again; with another one it is refused. The relay keeps only
//! each secret's SHA-256, the name, who invited (their token's SHA-256 and
//! their line's name then), when it was made and expires, and once it is used
//! the new line's SHA-256 and when: in a small file beside the file of tokens
//! (`open`), written whole on every change, so a restart keeps them.
//!
//! A phone sees only its own invites (`INVITES`) and takes back only those
//! (`UNINVITE`): one not used yet goes, and one used takes the line of the
//! phone it let in out of the file, cutting that phone off, and that phone
//! alone: the phones it invited in turn keep their lines. A phone may have
//! `MAX_OPEN` invites open at once and make `MAX_A_DAY` a day, and the relay
//! lets in at most `EREVOS_RELAY_MAX_INVITED` phones by invite (`MAX_INVITED`
//! unless set), counting the invites still open. An invite whose inviter's
//! line is gone from the file lets no one in.
//!
//! A line an invite made stands on its own once it is in the file of tokens
//! (see `tokens.rs`): whatever takes out the inviter's line (its own inviter,
//! the provider's check, the operator deleting it by hand), the line it
//! invited stays, and so do the lines that one invited. Who invited whom is
//! kept here only, in each used invite, for the inviter's list of its
//! invites, its taking one back, and the count of the phones let in by
//! invite. A used invite goes only once its line is surely gone from the file
//! (`sweep`), not while the line is only refused, or the file could not be
//! read or written: so a line in the file always has the invite that says who
//! invited it, and a failed write never keeps its inviter from taking it back
//! again. A line signed in again in place of another (`signin.rs`) keeps the
//! other's invites: the move is written down before the new line goes in
//! (`moving`), and finished after (`moved`), or at the next start when the
//! relay stopped in between (`finish_moves`), so no stop leaves them with the
//! old line, where no phone lists them or takes them back, and the open ones
//! let no one in. `erevos-relay free-line NAME`, run with the relay stopped,
//! drops the invite that made a line (`free`), which is the operator's own
//! from then on: its inviter no longer lists it or takes it back, and it no
//! longer counts among the phones let in by invite. The invites are read even
//! with invites off, when they were on before, so a line signed in again
//! meanwhile still has its invites once they are on again.
//!
//! A phone that came with the relay's one token, which every phone may have,
//! cannot invite with it, but asks once for a line of its own (`OWN`, see
//! `own`), and from then on uses the relay, and invites, with that. The
//! relay adds the line as one of the operator's own, with the name the phone
//! gave and a comment saying it came with the relay's token and when, so the
//! operator takes that phone out alone by deleting its line, and then changes
//! the relay's token, which the phones with lines of their own no longer use,
//! so it lets no one in again. Only while invites are on, and at most
//! `MAX_OWN_A_DAY` lines a day, so a token that went where it should not
//! cannot fill the file.
//!
//! Not audited.

use std::collections::HashMap;
use std::fs;
use std::io::{self, ErrorKind};
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use rand::RngCore;
use sha2::{Digest, Sha256};

use crate::journal;
use crate::lock::lock;
use crate::tokens::{to_hex, Phone, Tokens};

/// How long an invite lasts, days.
pub const INVITE_DAYS: u64 = 7;
/// Invites one phone may have open at once.
pub const MAX_OPEN: usize = 5;
/// Invites one phone may make a day, taken back or not.
pub const MAX_A_DAY: u32 = 10;
/// Invites the relay keeps at once, open and used, so they cannot fill its
/// memory.
pub const MAX_INVITES: usize = 10_000;
/// Phones the relay lets in by invite at once, counting the invites still
/// open, unless `EREVOS_RELAY_MAX_INVITED` says otherwise.
pub const MAX_INVITED: usize = 100;
/// Longest name a phone may type for an invite, bytes.
pub const MAX_TYPED: usize = 64;
/// Lines the relay adds a day for phones that came with its one token
/// (`own`), all of them together.
pub const MAX_OWN_A_DAY: u32 = 50;
/// Longest name made safe for the file.
const MAX_NAME: usize = 32;
const DAY: u64 = 24 * 60 * 60;
/// The first bytes of the file of invites, so the relay never reads or
/// overwrites a file that is something else.
const HEADER: &[u8; 8] = b"EREVOSI1";
const INVITES_LOCK: &str = "lock of the invites";
const OWNED_LOCK: &str = "lock of the day's lines for the relay's token";

/// Whether invites are on, from the value of `EREVOS_RELAY_INVITES`: `on`
/// turns them on; unset, empty or `off` leaves them off. Anything else is an
/// error.
pub fn wanted(setting: Option<&str>) -> Result<bool, String> {
    match setting {
        Some("on") => Ok(true),
        None | Some("" | "off") => Ok(false),
        Some(other) => Err(format!(
            "EREVOS_RELAY_INVITES must be on or off, not {other:?}"
        )),
    }
}

/// One invite, by its secret's SHA-256.
#[derive(Clone, Debug, PartialEq, Eq)]
struct Invite {
    hash: [u8; 32],
    /// The name for the line, made safe.
    name: String,
    /// The SHA-256 of the inviting phone's token, and the name on its line.
    by: [u8; 32],
    by_name: String,
    made: u64,
    expires: u64,
    /// Once used: when, and the SHA-256 of the token its line is for.
    used: Option<(u64, [u8; 32])>,
}

impl Invite {
    /// What the inviter knows it by: the first half of its secret's SHA-256,
    /// which lets no one in.
    fn id(&self) -> [u8; 16] {
        self.hash[..16].try_into().expect("16 bytes")
    }

    /// The id of the invite whose secret is `secret`.
    #[cfg(test)]
    fn id_of(secret: &[u8; 32]) -> [u8; 16] {
        Sha256::digest(secret)[..16].try_into().expect("16 bytes")
    }
}

/// An invite as its inviter sees it: its id, the name, when it expires, and
/// when it was used (0 while it is not).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Listed {
    pub id: [u8; 16],
    pub name: String,
    pub expires: u64,
    pub used: u64,
}

#[derive(Debug, PartialEq, Eq)]
pub enum InviteError {
    /// The phone has `MAX_OPEN` open, made `MAX_A_DAY` today, the relay keeps
    /// `MAX_INVITES`, or it let in all the phones by invite it may.
    Full,
    /// Not written to the file, so nothing changed.
    Storage,
}

#[derive(Debug, PartialEq, Eq)]
pub enum OwnError {
    /// The relay does not invite.
    Off,
    /// The relay added `MAX_OWN_A_DAY` such lines today.
    Full,
    /// The line could not be written, so nothing changed.
    Storage,
}

#[derive(Debug, PartialEq, Eq)]
pub enum RedeemError {
    /// No such invite now: never made, expired, taken back, its inviter's
    /// line is gone, or the relay let in all the phones by invite it may.
    NotFound,
    /// Another phone took it.
    Used,
    /// The file has a line for that token already, so nothing changed.
    Taken,
    /// The line could not be written, so nothing changed.
    Storage,
}

#[derive(Clone, Default, Debug, PartialEq, Eq)]
struct State {
    invites: Vec<Invite>,
    /// The day `made` counts (days since 1970), and how many each phone made
    /// that day, by its token's SHA-256.
    day: u64,
    made: HashMap<[u8; 32], u32>,
    /// The invites of the first line that go to the second, once the second
    /// is in the file of tokens: written down before it goes in.
    moving: Vec<([u8; 32], [u8; 32])>,
}

impl State {
    /// The file of invites: its header, the day, each phone's count that day
    /// (its token's SHA-256 and 4 bytes) after their number (4 bytes), then
    /// each invite after theirs: its secret's SHA-256, the inviter's token's,
    /// when it was made, expires and was used (8 bytes each, 0 while not), the
    /// used line's SHA-256 (zeros while not), and its name and the inviter's,
    /// each after a 1-byte length. Then, only while a move is under way, their
    /// number (4 bytes) and each line moved from and to (32 bytes each): a
    /// file with none is as before.
    fn encode(&self) -> Vec<u8> {
        let mut out =
            Vec::with_capacity(8 + 8 + 4 + 36 * self.made.len() + 4 + 200 * self.invites.len());
        out.extend_from_slice(HEADER);
        out.extend_from_slice(&self.day.to_be_bytes());
        out.extend_from_slice(&(self.made.len() as u32).to_be_bytes());
        for (by, count) in &self.made {
            out.extend_from_slice(by);
            out.extend_from_slice(&count.to_be_bytes());
        }
        out.extend_from_slice(&(self.invites.len() as u32).to_be_bytes());
        for invite in &self.invites {
            out.extend_from_slice(&invite.hash);
            out.extend_from_slice(&invite.by);
            out.extend_from_slice(&invite.made.to_be_bytes());
            out.extend_from_slice(&invite.expires.to_be_bytes());
            let (at, line) = invite.used.unwrap_or((0, [0; 32]));
            out.extend_from_slice(&at.to_be_bytes());
            out.extend_from_slice(&line);
            put_short(&mut out, &invite.name);
            put_short(&mut out, &invite.by_name);
        }
        if !self.moving.is_empty() {
            out.extend_from_slice(&(self.moving.len() as u32).to_be_bytes());
            for (old, new) in &self.moving {
                out.extend_from_slice(old);
                out.extend_from_slice(new);
            }
        }
        out
    }

    /// Reads back what `encode` wrote, at most `MAX_INVITES` of them.
    fn decode(bytes: &[u8]) -> Option<State> {
        let mut r = bytes.strip_prefix(HEADER)?;
        let mut state = State {
            day: u64_at(take(&mut r, 8)?),
            ..State::default()
        };
        for _ in 0..u32_at(take(&mut r, 4)?) {
            let entry = take(&mut r, 32 + 4)?;
            state.made.insert(
                entry[..32].try_into().expect("32 bytes"),
                u32_at(&entry[32..]),
            );
        }
        for _ in 0..u32_at(take(&mut r, 4)?) {
            let entry = take(&mut r, 32 + 32 + 8 + 8 + 8 + 32)?;
            let at = u64_at(&entry[80..88]);
            let invite = Invite {
                hash: entry[..32].try_into().expect("32 bytes"),
                by: entry[32..64].try_into().expect("32 bytes"),
                made: u64_at(&entry[64..72]),
                expires: u64_at(&entry[72..80]),
                used: (at != 0).then(|| (at, entry[88..].try_into().expect("32 bytes"))),
                name: take_short(&mut r)?,
                by_name: take_short(&mut r)?,
            };
            if state.invites.len() < MAX_INVITES {
                state.invites.push(invite);
            }
        }
        if !r.is_empty() {
            for _ in 0..u32_at(take(&mut r, 4)?) {
                let entry = take(&mut r, 64)?;
                state.moving.push((
                    entry[..32].try_into().expect("32 bytes"),
                    entry[32..].try_into().expect("32 bytes"),
                ));
            }
        }
        r.is_empty().then_some(state)
    }

    /// Starts the day's counts again if `now` is on another day than they count.
    fn today(&mut self, now: u64) -> bool {
        let today = now / DAY;
        if self.day == today {
            return false;
        }
        self.day = today;
        self.made.clear();
        true
    }
}

pub struct Invites {
    state: Mutex<State>,
    /// Where the invites are kept; in memory only without it.
    path: Option<PathBuf>,
    /// Whether phones may make and take invites, or the invites are only
    /// kept for who invited whom.
    on: bool,
    /// Phones let in by invite at most, counting the invites still open.
    most: usize,
    /// The day (Unix days) and the lines added that day by `own`. In memory
    /// only: a restart starts the day's count again.
    owned: Mutex<(u64, u32)>,
}

impl Invites {
    /// Invites kept in memory only, lost when the relay stops.
    #[cfg(test)]
    pub fn in_memory() -> Invites {
        Invites {
            state: Mutex::default(),
            path: None,
            on: true,
            most: MAX_INVITED,
            owned: Mutex::default(),
        }
    }

    /// The invites kept in the file at `path`, read back now if it is there,
    /// letting in at most `most` phones; with `on` false, only kept for who
    /// invited whom. A file there that is not one of invites is left alone,
    /// and an error.
    pub fn open(path: &Path, on: bool, most: usize) -> io::Result<Invites> {
        let state = match fs::read(path) {
            Ok(bytes) => State::decode(&bytes).ok_or_else(|| {
                io::Error::new(
                    ErrorKind::InvalidData,
                    format!("{} is not a file of invites", path.display()),
                )
            })?,
            Err(e) if e.kind() == ErrorKind::NotFound => State::default(),
            Err(e) => return Err(e),
        };
        Ok(Invites {
            state: Mutex::new(state),
            path: Some(path.to_path_buf()),
            on,
            most,
            owned: Mutex::default(),
        })
    }

    /// Whether phones may make and take invites now.
    pub fn on(&self) -> bool {
        self.on
    }

    /// How many invites are kept now, open and used.
    pub fn len(&self) -> usize {
        lock(&self.state, INVITES_LOCK).invites.len()
    }

    /// Finishes a move left by a relay that stopped between `moving` and
    /// `moved`: to the new line if its line is in `tokens`' file, the write
    /// that put it there having taken the old one out, else not at all; with
    /// no line in the file, as when it cannot be read now, at the next start.
    /// The relay calls this when it starts.
    pub fn finish_moves(&self, tokens: &Tokens) {
        let left = lock(&self.state, INVITES_LOCK).moving.clone();
        if left.is_empty() || tokens.lines_in_file() == 0 {
            return;
        }
        for (old, new) in left {
            if tokens.in_file(&new) {
                self.moved(&old, &new);
            } else {
                self.not_moved(&old, &new);
            }
        }
    }

    /// The lines invites made, each with the line of the phone that invited
    /// it, by their tokens' SHA-256s.
    #[cfg(test)]
    fn edges(&self) -> HashMap<[u8; 32], [u8; 32]> {
        lock(&self.state, INVITES_LOCK)
            .invites
            .iter()
            .filter_map(|i| i.used.map(|(_, line)| (line, i.by)))
            .collect()
    }

    /// The phones let in by invite that `tokens` still lets in, and the
    /// invites still open that may let more in.
    fn counted(state: &State, tokens: &Tokens, now: u64) -> usize {
        state
            .invites
            .iter()
            .filter(|i| match i.used {
                Some((_, line)) => tokens.holds(&line),
                None => i.expires > now && tokens.holds(&i.by),
            })
            .count()
    }

    /// Writes the invites down, if they are kept.
    fn save(&self, state: &State) -> io::Result<()> {
        match &self.path {
            Some(path) => journal::write_whole(path, &state.encode()),
            None => Ok(()),
        }
    }

    /// A new invite from the phone `by`, for a phone named `typed`, lasting
    /// `INVITE_DAYS` from `now`: its secret, and when it expires.
    pub fn make(
        &self,
        by: &Phone,
        typed: &str,
        tokens: &Tokens,
        now: u64,
    ) -> Result<([u8; 32], u64), InviteError> {
        let mut state = lock(&self.state, INVITES_LOCK);
        state.today(now);
        let open = state
            .invites
            .iter()
            .filter(|i| i.by == by.hash && i.used.is_none() && i.expires > now)
            .count();
        let made = state.made.get(&by.hash).copied().unwrap_or(0);
        if open >= MAX_OPEN
            || made >= MAX_A_DAY
            || state.invites.len() >= MAX_INVITES
            || Invites::counted(&state, tokens, now) >= self.most
        {
            return Err(InviteError::Full);
        }
        let mut secret = [0u8; 32];
        rand::rngs::OsRng.fill_bytes(&mut secret);
        let expires = now + INVITE_DAYS * DAY;
        let mut next = state.clone();
        next.invites.push(Invite {
            hash: Sha256::digest(secret).into(),
            name: safe_name(typed),
            by: by.hash,
            by_name: by.name.clone(),
            made: now,
            expires,
            used: None,
        });
        next.made.insert(by.hash, made + 1);
        self.save(&next).map_err(|_| InviteError::Storage)?;
        *state = next;
        Ok((secret, expires))
    }

    /// The invites the phone whose token's SHA-256 is `by` made, oldest first,
    /// leaving out used ones whose line is gone from `tokens`.
    pub fn list(&self, by: &[u8; 32], tokens: &Tokens, now: u64) -> Vec<Listed> {
        let state = lock(&self.state, INVITES_LOCK);
        state
            .invites
            .iter()
            .filter(|i| &i.by == by)
            .filter(|i| match i.used {
                Some((_, line)) => tokens.holds(&line),
                None => i.expires > now,
            })
            .map(|i| Listed {
                id: i.id(),
                name: i.name.clone(),
                expires: i.expires,
                used: i.used.map_or(0, |(at, _)| at),
            })
            .collect()
    }

    /// Takes back the invite `id` of the phone `by`: one not used goes, and
    /// one used takes its phone's line out of `tokens` too, that line alone:
    /// the phones it invited in turn keep theirs. False when that phone made
    /// no such invite.
    pub fn take_back(&self, by: &[u8; 32], id: &[u8; 16], tokens: &Tokens) -> io::Result<bool> {
        let mut state = lock(&self.state, INVITES_LOCK);
        let Some(at) = state
            .invites
            .iter()
            .position(|i| &i.by == by && &i.id() == id)
        else {
            return Ok(false);
        };
        if let Some((_, line)) = state.invites[at].used {
            tokens.remove(&line)?;
        }
        let mut next = state.clone();
        next.invites.remove(at);
        self.save(&next)?;
        *state = next;
        Ok(true)
    }

    /// Lets in the phone whose token's SHA-256 is `line` with the invite whose
    /// secret is `secret`: adds its line to `tokens`, which stands on its own
    /// from then on, and returns the name on it. The same `line` again for the
    /// same invite returns its name again. The invite is written down as used
    /// before the line goes in, so a line in the file always has the invite
    /// that says who invited it; if the line cannot go in, the invite is open
    /// again.
    pub fn redeem(
        &self,
        secret: &[u8; 32],
        line: &[u8; 32],
        tokens: &Tokens,
        now: u64,
    ) -> Result<String, RedeemError> {
        let hash: [u8; 32] = Sha256::digest(secret).into();
        let mut state = lock(&self.state, INVITES_LOCK);
        let Some(at) = state.invites.iter().position(|i| i.hash == hash) else {
            return Err(RedeemError::NotFound);
        };
        let invite = state.invites[at].clone();
        match invite.used {
            Some((_, used)) if &used == line && tokens.holds(line) => {
                return Ok(tokens.name_of(line).unwrap_or(invite.name))
            }
            Some(_) => return Err(RedeemError::Used),
            None => {}
        }
        if !self.on
            || invite.expires <= now
            || !tokens.holds(&invite.by)
            || Invites::counted(&state, tokens, now) > self.most
        {
            return Err(RedeemError::NotFound);
        }
        if tokens.holds(line) {
            return Err(RedeemError::Taken);
        }
        let by = if invite.by_name.is_empty() {
            to_hex(&invite.by[..4])
        } else {
            invite.by_name.clone()
        };
        let note = format!("invited by {by} on {}", date(now));
        let mut next = state.clone();
        next.invites[at].used = Some((now, *line));
        self.save(&next).map_err(|_| RedeemError::Storage)?;
        let name = match tokens.add(line, &invite.name, true, &note, None) {
            Ok(name) => name,
            Err(e) => {
                if let Err(e) = self.save(&state) {
                    // Used here and in the file of invites, with no line: it lets
                    // no one else in, which is the safe way to be wrong.
                    elog!("erevos-relay: cannot write the invites: {e}");
                    *state = next;
                }
                return Err(if e.kind() == ErrorKind::AlreadyExists {
                    RedeemError::Taken
                } else {
                    RedeemError::Storage
                });
            }
        };
        next.invites[at].name = name.clone();
        if let Err(e) = self.save(&next) {
            // The name kept is the one asked for, shown to the inviter only.
            elog!("erevos-relay: cannot write the invites: {e}");
        }
        *state = next;
        Ok(name)
    }

    /// Adds a line to `tokens` for the token whose SHA-256 is `line`, of a
    /// phone that came with the relay's one token, named after `typed` made
    /// safe (`phone` when nothing is left of it): the operator's own, as a
    /// line typed in is, so it is no one's invite and counts in no one's.
    /// Returns the name written; the same again for a token already on a line.
    pub fn own(
        &self,
        typed: &str,
        line: &[u8; 32],
        tokens: &Tokens,
        now: u64,
    ) -> Result<String, OwnError> {
        if !self.on {
            return Err(OwnError::Off);
        }
        // The answer was lost on the way: the phone asks again with the same token.
        if tokens.holds(line) {
            return tokens.name_of(line).ok_or(OwnError::Storage);
        }
        let mut owned = lock(&self.owned, OWNED_LOCK);
        if owned.0 != now / DAY {
            *owned = (now / DAY, 0);
        }
        if owned.1 >= MAX_OWN_A_DAY {
            return Err(OwnError::Full);
        }
        let safe = safe_name(typed);
        let name = if safe.is_empty() {
            "phone"
        } else {
            safe.as_str()
        };
        let note = format!("came with the relay's token on {}", date(now));
        match tokens.add(line, name, true, &note, None) {
            Ok(written) => {
                owned.1 += 1;
                Ok(written)
            }
            Err(_) => Err(OwnError::Storage),
        }
    }

    /// Writes down, before the line `new` goes in the file of tokens in place
    /// of `old`'s (the same phone signed in again, see `signin.rs`), that the
    /// invites of `old` are to be `new`'s: so a relay that stops before
    /// `moved` or `not_moved` finishes it at its next start (`finish_moves`),
    /// and the phone keeps the phones `old` invited to list and take back, and
    /// its open invites. An error when that cannot be written; then the line
    /// must not go in.
    pub fn moving(&self, old: &[u8; 32], new: &[u8; 32]) -> io::Result<()> {
        let mut state = lock(&self.state, INVITES_LOCK);
        if !state.invites.iter().any(|i| &i.by == old) && !state.made.contains_key(old) {
            return Ok(());
        }
        let mut next = state.clone();
        next.moving.push((*old, *new));
        self.save(&next)?;
        *state = next;
        Ok(())
    }

    /// The invites of the phone whose line was `old` are the line `new`'s from
    /// now on, used and open, with that day's count: `new`'s line went in the
    /// file of tokens in place of `old`'s, so the phone still lists and takes
    /// back the phones it invited, and its open invites still let one in.
    /// Kept so even when it cannot be written now, as the file of tokens has
    /// the new line: the move written down by `moving` is finished at the next
    /// start then.
    pub fn moved(&self, old: &[u8; 32], new: &[u8; 32]) {
        let mut state = lock(&self.state, INVITES_LOCK);
        if !state.moving.contains(&(*old, *new))
            && !state.invites.iter().any(|i| &i.by == old)
            && !state.made.contains_key(old)
        {
            return;
        }
        for invite in state.invites.iter_mut().filter(|i| &i.by == old) {
            invite.by = *new;
        }
        if let Some(made) = state.made.remove(old) {
            *state.made.entry(*new).or_default() += made;
        }
        state.moving.retain(|move_| move_ != &(*old, *new));
        if let Err(e) = self.save(&state) {
            elog!("erevos-relay: cannot write the invites, so the next start finishes moving them: {e}");
        }
    }

    /// The line `new` did not go in place of `old`'s: the invites stay `old`'s.
    pub fn not_moved(&self, old: &[u8; 32], new: &[u8; 32]) {
        let mut state = lock(&self.state, INVITES_LOCK);
        if !state.moving.contains(&(*old, *new)) {
            return;
        }
        state.moving.retain(|move_| move_ != &(*old, *new));
        if let Err(e) = self.save(&state) {
            elog!("erevos-relay: cannot write the invites, so the next start leaves them as they were: {e}");
        }
    }

    /// Drops the used invites that made the line `line`, so the phone that
    /// invited it no longer lists it or takes it back, and it no longer counts
    /// among the phones let in by invite, and returns the inviters' names: for
    /// `erevos-relay free-line`, with the relay stopped, since a running relay
    /// writes its own invites over these.
    pub fn free(&self, line: &[u8; 32]) -> io::Result<Vec<String>> {
        let mut state = lock(&self.state, INVITES_LOCK);
        let made = |i: &Invite| i.used.is_some_and(|(_, used)| &used == line);
        let by: Vec<String> = state
            .invites
            .iter()
            .filter(|i| made(i))
            .map(|i| {
                if i.by_name.is_empty() {
                    to_hex(&i.by[..4])
                } else {
                    i.by_name.clone()
                }
            })
            .collect();
        if by.is_empty() {
            return Ok(by);
        }
        let mut next = state.clone();
        next.invites.retain(|i| !made(i));
        self.save(&next)?;
        *state = next;
        Ok(by)
    }

    /// Takes out of `tokens` the lines taken out when the file could not be
    /// written (`prune`), then drops invites that expired unused, used ones
    /// whose line is surely gone from the file of tokens (`Tokens::gone`), and
    /// the counts of a day gone by. A line still in the file stays invited,
    /// even refused, so a line that could not be written out, or a file read
    /// halfway through a save, keeps who invited it; a file of tokens with no
    /// line at all, as when it is not there for a moment, drops no used
    /// invite either. The relay calls this now and then.
    pub fn sweep(&self, tokens: &Tokens, now: u64) {
        tokens.prune();
        let mut state = lock(&self.state, INVITES_LOCK);
        let before = state.invites.len();
        let new_day = state.today(now);
        let none = tokens.lines_in_file() == 0;
        state.invites.retain(|i| match i.used {
            Some((_, line)) => none || !tokens.gone(&line),
            None => i.expires > now,
        });
        if new_day || state.invites.len() != before {
            if let Err(e) = self.save(&state) {
                elog!("erevos-relay: cannot write the invites: {e}");
            }
        }
    }
}

/// `typed` made safe for a line of the file: lower case, Greek and Cyrillic
/// letters written in Latin ones and marks taken off Latin ones (Μαρία is
/// `maria`), spaces, `_` and `.` as `-`, anything else left out, at most
/// `MAX_NAME` characters, and `phone` when nothing is left. Never an open
/// place's name (`open::not_open`): `Open Maria` is `openmaria`.
pub fn safe_name(typed: &str) -> String {
    let lower = typed.to_lowercase();
    let chars: Vec<char> = lower.chars().collect();
    let mut out = String::new();
    let mut i = 0;
    while i < chars.len() {
        let pair: String = chars[i..chars.len().min(i + 2)].iter().collect();
        let both = match pair.as_str() {
            "ου" | "ού" => Some("ou"),
            "αυ" | "αύ" => Some("av"),
            "ευ" | "εύ" => Some("ev"),
            "γγ" => Some("ng"),
            _ => None,
        };
        if let Some(latin) = both {
            out.push_str(latin);
            i += 2;
            continue;
        }
        let c = chars[i];
        i += 1;
        match c {
            'a'..='z' | '0'..='9' => out.push(c),
            ' ' | '-' | '_' | '.' | '\t' => {
                if !out.is_empty() && !out.ends_with('-') {
                    out.push('-');
                }
            }
            _ => out.push_str(latin_of(c)),
        }
    }
    let mut name: String = out.trim_end_matches('-').chars().take(MAX_NAME).collect();
    while name.ends_with('-') {
        name.pop();
    }
    if name.is_empty() {
        "phone".to_string()
    } else {
        crate::open::not_open(&name)
    }
}

/// A letter's Latin, '' for anything that has none.
fn latin_of(c: char) -> &'static str {
    match c {
        // Greek.
        'α' | 'ά' => "a",
        'β' => "v",
        'γ' => "g",
        'δ' => "d",
        'ε' | 'έ' => "e",
        'ζ' => "z",
        'η' | 'ή' => "i",
        'θ' => "th",
        'ι' | 'ί' | 'ϊ' | 'ΐ' => "i",
        'κ' => "k",
        'λ' => "l",
        'μ' => "m",
        'ν' => "n",
        'ξ' => "x",
        'ο' | 'ό' => "o",
        'π' => "p",
        'ρ' => "r",
        'σ' | 'ς' => "s",
        'τ' => "t",
        'υ' | 'ύ' | 'ϋ' | 'ΰ' => "y",
        'φ' => "f",
        'χ' => "ch",
        'ψ' => "ps",
        'ω' | 'ώ' => "o",
        // Cyrillic.
        'а' => "a",
        'б' => "b",
        'в' => "v",
        'г' => "g",
        'д' => "d",
        'ђ' => "dj",
        'е' | 'ё' | 'э' => "e",
        'ж' => "z",
        'з' => "z",
        'и' => "i",
        'й' | 'ј' => "j",
        'к' => "k",
        'л' => "l",
        'љ' => "lj",
        'м' => "m",
        'н' => "n",
        'њ' => "nj",
        'о' => "o",
        'п' => "p",
        'р' => "r",
        'с' => "s",
        'т' => "t",
        'ћ' | 'ц' | 'ч' => "c",
        'у' => "u",
        'ф' => "f",
        'х' => "h",
        'џ' => "dz",
        'ш' => "s",
        'щ' => "sc",
        'ы' => "y",
        'ю' => "ju",
        'я' => "ja",
        // Latin with marks.
        'à' | 'á' | 'â' | 'ã' | 'ä' | 'å' | 'ā' | 'ą' | 'ă' => "a",
        'æ' => "ae",
        'ç' | 'ć' | 'č' => "c",
        'ď' | 'ð' => "d",
        'đ' => "dj",
        'è' | 'é' | 'ê' | 'ë' | 'ē' | 'ę' | 'ě' => "e",
        'ì' | 'í' | 'î' | 'ï' | 'ī' | 'ı' => "i",
        'ł' => "l",
        'ñ' | 'ń' | 'ň' => "n",
        'ò' | 'ó' | 'ô' | 'õ' | 'ö' | 'ø' | 'ō' | 'ő' => "o",
        'œ' => "oe",
        'ř' => "r",
        'ś' | 'š' | 'ş' | 'ș' => "s",
        'ß' => "ss",
        'ť' | 'ţ' | 'ț' => "t",
        'ù' | 'ú' | 'û' | 'ü' | 'ū' | 'ů' | 'ű' => "u",
        'ý' | 'ÿ' => "y",
        'ź' | 'ż' | 'ž' => "z",
        'þ' => "th",
        _ => "",
    }
}

/// The day of `secs` (Unix seconds) as `yyyy-mm-dd`, in UTC.
pub fn date(secs: u64) -> String {
    // Howard Hinnant's days_from_civil, the other way round.
    let days = (secs / DAY) as i64 + 719_468;
    let era = days.div_euclid(146_097);
    let doe = days.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = yoe + era * 400 + i64::from(month <= 2);
    format!("{year:04}-{month:02}-{day:02}")
}

/// The next `n` bytes of `r`, taken off it.
fn take<'a>(r: &mut &'a [u8], n: usize) -> Option<&'a [u8]> {
    let (head, rest) = r.split_at_checked(n)?;
    *r = rest;
    Some(head)
}

fn take_short(r: &mut &[u8]) -> Option<String> {
    let len = *take(r, 1)?.first()? as usize;
    String::from_utf8(take(r, len)?.to_vec()).ok()
}

/// A name after its 1-byte length, cut to 255 bytes where a letter ends: the
/// name on an operator's line may be longer.
fn put_short(out: &mut Vec<u8>, text: &str) {
    let mut end = text.len().min(255);
    while !text.is_char_boundary(end) {
        end -= 1;
    }
    out.push(end as u8);
    out.extend_from_slice(&text.as_bytes()[..end]);
}

fn u32_at(bytes: &[u8]) -> u32 {
    u32::from_be_bytes(bytes.try_into().expect("4 bytes"))
}

fn u64_at(bytes: &[u8]) -> u64 {
    u64::from_be_bytes(bytes.try_into().expect("8 bytes"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::time::{Duration, SystemTime};

    const NOW: u64 = 1_800_000_000;

    /// A fresh path in the system temp directory, removed with what is
    /// written beside it when dropped.
    struct TempPath(PathBuf);

    impl TempPath {
        fn new(what: &str) -> TempPath {
            static NEXT: AtomicUsize = AtomicUsize::new(0);
            let n = NEXT.fetch_add(1, Ordering::Relaxed);
            let path = std::env::temp_dir().join(format!(
                "erevos-invites-test-{}-{n}.{what}",
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

    /// A file of tokens with one phone of its own on it, `pixel`.
    fn phones(path: &TempPath) -> (Tokens, Phone) {
        let (token, line) = crate::tokens::new_token("pixel");
        fs::write(&path.0, format!("# phones\n{line}\n")).unwrap();
        let tokens = Tokens::new(path.0.clone());
        let pixel = tokens.find(&token).unwrap();
        (tokens, pixel)
    }

    fn hash(byte: u8) -> [u8; 32] {
        [byte; 32]
    }

    #[test]
    fn invites_are_off_unless_turned_on() {
        assert_eq!(wanted(None), Ok(false));
        assert_eq!(wanted(Some("")), Ok(false));
        assert_eq!(wanted(Some("off")), Ok(false));
        assert_eq!(wanted(Some("on")), Ok(true));
        assert!(wanted(Some("yes")).is_err());
    }

    #[test]
    fn a_name_is_made_safe_lower_case_and_in_latin_letters() {
        assert_eq!(safe_name("Μαρία"), "maria");
        assert_eq!(safe_name("Γιώργος Παπαδόπουλος"), "giorgos-papadopoulos");
        assert_eq!(safe_name("Θοδωρής"), "thodoris");
        assert_eq!(safe_name("Ευάγγελος"), "evangelos");
        assert_eq!(safe_name("Ψυχή"), "psychi");
        assert_eq!(safe_name("José Müller"), "jose-muller");
        assert_eq!(safe_name("Đorđe Šarić"), "djordje-saric");
        assert_eq!(safe_name("Ђорђе"), "djordje");
        assert_eq!(safe_name("  Anna_B.  "), "anna-b");
        assert_eq!(safe_name("lphl:nekten"), "lphlnekten");
        assert_eq!(safe_name("# a comment\nnext"), "a-commentnext");
        assert_eq!(safe_name("😀"), "phone");
        assert_eq!(safe_name("Open Maria"), "openmaria");
        assert_eq!(safe_name("open-"), "open");
        assert_eq!(safe_name(""), "phone");
        assert_eq!(safe_name(&"a".repeat(80)).len(), MAX_NAME);
        assert_eq!(safe_name(&format!("{}-b", "a".repeat(31))), "a".repeat(31));
    }

    #[test]
    fn a_day_is_written_as_its_date() {
        assert_eq!(date(0), "1970-01-01");
        assert_eq!(date(951_782_400), "2000-02-29");
        assert_eq!(date(1_792_540_800 + 12 * 3600), "2026-10-21");
    }

    #[test]
    fn an_invite_lets_one_phone_in_with_a_line_of_its_own() {
        let path = TempPath::new("tokens");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::in_memory();
        let (secret, expires) = invites.make(&pixel, "Μαρία", &tokens, NOW).unwrap();
        assert_eq!(expires, NOW + 7 * DAY);
        let (maria, _) = crate::tokens::new_token("");
        let line: [u8; 32] = Sha256::digest(maria.as_bytes()).into();
        assert_eq!(
            invites.redeem(&secret, &line, &tokens, NOW + 60),
            Ok("maria".to_string())
        );
        assert!(tokens.has(&maria));
        let text = fs::read_to_string(&path.0).unwrap();
        assert!(text.starts_with("# phones\n"), "the operator's lines stay");
        assert!(text.ends_with(&format!(
            "{} maria # invited by pixel on {}\n",
            to_hex(&line),
            date(NOW + 60)
        )));
        // Asked again, as when the answer was lost: the same, and no second line.
        assert_eq!(
            invites.redeem(&secret, &line, &tokens, NOW + 61),
            Ok("maria".to_string())
        );
        assert_eq!(tokens.count(), 2);
        // Another phone with it is refused.
        assert_eq!(
            invites.redeem(&secret, &hash(9), &tokens, NOW + 62),
            Err(RedeemError::Used)
        );
        // A secret that is not one, or a changed one.
        assert_eq!(
            invites.redeem(&[1; 32], &hash(9), &tokens, NOW),
            Err(RedeemError::NotFound)
        );
        let listed = invites.list(&pixel.hash, &tokens, NOW + 62);
        assert_eq!(listed.len(), 1);
        assert_eq!(
            (listed[0].name.as_str(), listed[0].used),
            ("maria", NOW + 60)
        );
        // Another phone sees none of pixel's.
        assert!(invites.list(&hash(3), &tokens, NOW).is_empty());
    }

    #[test]
    fn a_second_maria_gets_a_name_of_her_own() {
        let path = TempPath::new("tokens");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::in_memory();
        for (n, wanted) in [(1u8, "maria"), (2, "maria-2"), (3, "maria-3")] {
            let (secret, _) = invites.make(&pixel, "Maria", &tokens, NOW).unwrap();
            assert_eq!(
                invites.redeem(&secret, &hash(n), &tokens, NOW),
                Ok(wanted.to_string())
            );
        }
        // Named after a line the operator wrote, too.
        fs::write(
            &path.0,
            format!(
                "{}\n{} anna\n",
                fs::read_to_string(&path.0).unwrap().trim_end(),
                to_hex(&hash(7))
            ),
        )
        .unwrap();
        let file = fs::File::options().write(true).open(&path.0).unwrap();
        file.set_modified(SystemTime::UNIX_EPOCH + Duration::from_secs(3_000_000))
            .unwrap();
        let (secret, _) = invites.make(&pixel, "ANNA", &tokens, NOW).unwrap();
        assert_eq!(
            invites.redeem(&secret, &hash(8), &tokens, NOW),
            Ok("anna-2".to_string())
        );
    }

    #[test]
    fn an_invite_expires_after_seven_days_and_dies_with_its_inviter() {
        let path = TempPath::new("tokens");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::in_memory();
        let (late, expires) = invites.make(&pixel, "late", &tokens, NOW).unwrap();
        assert_eq!(
            invites.redeem(&late, &hash(1), &tokens, expires),
            Err(RedeemError::NotFound)
        );
        invites.sweep(&tokens, expires);
        assert_eq!(invites.len(), 0);
        // Pixel's line taken out: its open invites let no one in.
        let (secret, _) = invites.make(&pixel, "orphan", &tokens, NOW).unwrap();
        tokens.remove(&pixel.hash).unwrap();
        assert_eq!(
            invites.redeem(&secret, &hash(2), &tokens, NOW),
            Err(RedeemError::NotFound)
        );
    }

    #[test]
    fn a_phone_has_so_many_open_and_makes_so_many_a_day() {
        let path = TempPath::new("tokens");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::in_memory();
        let made: Vec<_> = (0..MAX_OPEN)
            .map(|_| invites.make(&pixel, "x", &tokens, NOW).unwrap())
            .collect();
        assert_eq!(
            invites.make(&pixel, "x", &tokens, NOW),
            Err(InviteError::Full)
        );
        // Another phone has its own.
        let other = Phone {
            hash: hash(5),
            name: String::new(),
        };
        assert!(invites.make(&other, "x", &tokens, NOW).is_ok());
        // Taken back, one more may be made, but not past the day's.
        let listed = invites.list(&pixel.hash, &tokens, NOW);
        for one in &listed {
            assert!(invites.take_back(&pixel.hash, &one.id, &tokens).unwrap());
        }
        assert!(!invites
            .take_back(&pixel.hash, &listed[0].id, &tokens)
            .unwrap());
        for _ in MAX_OPEN as u32..MAX_A_DAY {
            let (secret, _) = invites.make(&pixel, "x", &tokens, NOW).unwrap();
            invites
                .take_back(&pixel.hash, &Invite::id_of(&secret), &tokens)
                .unwrap();
        }
        assert_eq!(
            invites.make(&pixel, "x", &tokens, NOW),
            Err(InviteError::Full)
        );
        // The next day starts again.
        assert!(invites.make(&pixel, "x", &tokens, NOW + DAY).is_ok());
        // A taken-back invite lets no one in.
        assert_eq!(
            invites.redeem(&made[0].0, &hash(1), &tokens, NOW),
            Err(RedeemError::NotFound)
        );
    }

    #[test]
    fn taking_back_a_used_invite_cuts_its_phone_off() {
        let path = TempPath::new("tokens");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::in_memory();
        let (secret, _) = invites.make(&pixel, "maria", &tokens, NOW).unwrap();
        let (maria, _) = crate::tokens::new_token("");
        let line: [u8; 32] = Sha256::digest(maria.as_bytes()).into();
        invites.redeem(&secret, &line, &tokens, NOW).unwrap();
        assert!(tokens.has(&maria));
        // Only the phone that invited may.
        assert!(!invites
            .take_back(&hash(4), &Invite::id_of(&secret), &tokens)
            .unwrap());
        assert!(tokens.has(&maria));
        assert!(invites
            .take_back(&pixel.hash, &Invite::id_of(&secret), &tokens)
            .unwrap());
        assert!(!tokens.has(&maria));
        assert!(tokens.holds(&pixel.hash), "the inviter stays");
        // The operator deleting the line takes it out of the list too.
        let (secret, _) = invites.make(&pixel, "anna", &tokens, NOW).unwrap();
        invites.redeem(&secret, &hash(6), &tokens, NOW).unwrap();
        assert_eq!(invites.list(&pixel.hash, &tokens, NOW).len(), 1);
        tokens.remove(&hash(6)).unwrap();
        assert!(invites.list(&pixel.hash, &tokens, NOW).is_empty());
        invites.sweep(&tokens, NOW);
        assert_eq!(invites.len(), 0);
    }

    #[test]
    fn the_invites_survive_a_restart() {
        let path = TempPath::new("tokens");
        let kept = TempPath::new("invites");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        let (open, _) = invites.make(&pixel, "Ελένη", &tokens, NOW).unwrap();
        let (used, _) = invites.make(&pixel, "maria", &tokens, NOW).unwrap();
        invites.redeem(&used, &hash(1), &tokens, NOW).unwrap();
        drop(invites);
        let again = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        let listed = again.list(&pixel.hash, &tokens, NOW);
        assert_eq!(
            listed.iter().map(|l| l.name.as_str()).collect::<Vec<_>>(),
            ["eleni", "maria"]
        );
        assert_eq!(
            again.redeem(&open, &hash(2), &tokens, NOW),
            Ok("eleni".to_string())
        );
        assert_eq!(
            again.redeem(&used, &hash(3), &tokens, NOW),
            Err(RedeemError::Used)
        );
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            assert_eq!(
                fs::metadata(&kept.0).unwrap().permissions().mode() & 0o777,
                0o600
            );
        }
        // A file that is not one of invites is left alone, and the relay told.
        fs::write(&kept.0, b"something else").unwrap();
        assert!(Invites::open(&kept.0, true, MAX_INVITED).is_err());
        assert_eq!(fs::read(&kept.0).unwrap(), b"something else");
        // Whole files only.
        let state = State {
            day: 3,
            ..State::default()
        };
        let bytes = state.encode();
        assert_eq!(State::decode(&bytes), Some(state.clone()));
        assert_eq!(State::decode(&bytes[..bytes.len() - 1]), None);
        // A move under way comes after, only then.
        let moving = State {
            moving: vec![(hash(1), hash(2))],
            ..state
        };
        let more = moving.encode();
        assert_eq!(more.len(), bytes.len() + 4 + 64);
        assert_eq!(State::decode(&more), Some(moving));
        assert_eq!(State::decode(&more[..more.len() - 1]), None);
    }

    /// The token's SHA-256 of a phone that took `secret` with the token `token`.
    fn took(invites: &Invites, secret: &[u8; 32], token: &str, tokens: &Tokens) -> [u8; 32] {
        let line: [u8; 32] = Sha256::digest(token.as_bytes()).into();
        invites.redeem(secret, &line, tokens, NOW).unwrap();
        line
    }

    /// Deletes the line of `line` from the file of tokens by hand, as the
    /// operator does, and leaves the file so for a minute; returns the file
    /// as it is then.
    fn delete_by_hand(path: &TempPath, line: &[u8; 32]) -> String {
        let without: String = fs::read_to_string(&path.0)
            .unwrap()
            .lines()
            .filter(|l| !l.starts_with(&to_hex(line)))
            .map(|l| format!("{l}\n"))
            .collect();
        fs::write(&path.0, &without).unwrap();
        let file = fs::File::options().write(true).open(&path.0).unwrap();
        file.set_modified(SystemTime::UNIX_EPOCH + Duration::from_secs(4_000_000))
            .unwrap();
        without
    }

    #[test]
    fn the_phones_a_line_invited_stay_when_it_is_deleted_and_a_take_back_cuts_off_one_alone() {
        let path = TempPath::new("tokens");
        let kept = TempPath::new("invites");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        // Pixel invites Maria, who invites Anna, who invites Eleni.
        let (secret, _) = invites.make(&pixel, "maria", &tokens, NOW).unwrap();
        let maria = took(&invites, &secret, "maria's token", &tokens);
        let as_maria = Phone {
            hash: maria,
            name: "maria".into(),
        };
        let (to_anna, _) = invites.make(&as_maria, "anna", &tokens, NOW).unwrap();
        let anna = took(&invites, &to_anna, "anna's token", &tokens);
        let as_anna = Phone {
            hash: anna,
            name: "anna".into(),
        };
        let (secret, _) = invites.make(&as_anna, "eleni", &tokens, NOW).unwrap();
        let eleni = took(&invites, &secret, "eleni's token", &tokens);
        let (from_pixel, _) = invites.make(&pixel, "nikos", &tokens, NOW).unwrap();
        let (from_maria, _) = invites.make(&as_maria, "ioanna", &tokens, NOW).unwrap();

        // After a restart, so that nothing kept in memory only holds them.
        drop(invites);
        let tokens = Tokens::new(path.0.clone());
        let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        invites.finish_moves(&tokens);

        // The operator deletes Pixel's line by hand: Maria's phone stays, and Anna's, whom Maria
        // invited, and Eleni's, whom Anna invited.
        let without = delete_by_hand(&path, &pixel.hash);
        assert!(!tokens.holds(&pixel.hash));
        assert!(tokens.has("maria's token"));
        assert!(tokens.has("anna's token") && tokens.has("eleni's token"));
        // The sweep leaves their lines in the file, and who invited each.
        invites.sweep(&tokens, NOW);
        assert_eq!(fs::read_to_string(&path.0).unwrap(), without);
        let edges = invites.edges();
        assert_eq!(
            (edges[&maria], edges[&anna], edges[&eleni]),
            (pixel.hash, maria, anna)
        );
        // Pixel's invite still open lets no one in; Maria's lets one more in.
        assert_eq!(
            invites.redeem(&from_pixel, &hash(1), &tokens, NOW),
            Err(RedeemError::NotFound)
        );
        assert_eq!(
            invites.redeem(&from_maria, &hash(2), &tokens, NOW),
            Ok("ioanna".to_string())
        );

        // Maria takes back Anna's invite: Anna's phone is cut off, and only it; Eleni's, whom
        // Anna invited, stays.
        assert!(invites
            .take_back(&maria, &Invite::id_of(&to_anna), &tokens)
            .unwrap());
        assert!(!tokens.has("anna's token"));
        assert!(tokens.has("maria's token") && tokens.has("eleni's token"));
        assert!(tokens.holds(&hash(2)));
        assert_eq!(tokens.count(), 3);
        // Eleni still counts among the phones let in by invite, as Maria and Ioanna do.
        invites.sweep(&tokens, NOW);
        assert_eq!(invites.edges().get(&eleni), Some(&anna));
        assert_eq!(
            Invites::counted(&lock(&invites.state, INVITES_LOCK), &tokens, NOW),
            3
        );
    }

    #[test]
    fn taking_back_an_invite_cuts_off_the_phone_it_let_in_and_not_those_that_one_invited() {
        let path = TempPath::new("tokens");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::in_memory();
        let (to_maria, _) = invites.make(&pixel, "maria", &tokens, NOW).unwrap();
        let maria = took(&invites, &to_maria, "maria's token", &tokens);
        let as_maria = Phone {
            hash: maria,
            name: "maria".into(),
        };
        let (secret, _) = invites.make(&as_maria, "anna", &tokens, NOW).unwrap();
        let anna = took(&invites, &secret, "anna's token", &tokens);
        let as_anna = Phone {
            hash: anna,
            name: "anna".into(),
        };
        let (secret, _) = invites.make(&as_anna, "eleni", &tokens, NOW).unwrap();
        took(&invites, &secret, "eleni's token", &tokens);
        let (open, _) = invites.make(&as_maria, "nikos", &tokens, NOW).unwrap();
        assert!(tokens.has("eleni's token"));
        assert!(invites
            .take_back(&pixel.hash, &Invite::id_of(&to_maria), &tokens)
            .unwrap());
        assert!(!tokens.has("maria's token"));
        assert!(tokens.has("anna's token") && tokens.has("eleni's token"));
        assert!(tokens.holds(&pixel.hash));
        assert_eq!(tokens.count(), 3);
        // Maria's invite still open lets no one in, and Anna's phone still has the one it made.
        assert_eq!(
            invites.redeem(&open, &hash(1), &tokens, NOW),
            Err(RedeemError::NotFound)
        );
        assert_eq!(invites.list(&anna, &tokens, NOW).len(), 1);
    }

    #[test]
    fn a_phone_signed_in_again_keeps_the_phones_it_invited() {
        let path = TempPath::new("tokens");
        let kept = TempPath::new("invites");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        let (secret, _) = invites.make(&pixel, "maria", &tokens, NOW).unwrap();
        took(&invites, &secret, "maria's token", &tokens);
        let (open, _) = invites.make(&pixel, "anna", &tokens, NOW).unwrap();
        // Pixel's line in place of itself, as a phone signing in again with its old token.
        let again: [u8; 32] = Sha256::digest(b"pixel again").into();
        invites.moving(&pixel.hash, &again).unwrap();
        tokens
            .add(&again, "pixel", false, "again", Some(&pixel.hash))
            .unwrap();
        invites.moved(&pixel.hash, &again);
        assert!(!tokens.holds(&pixel.hash) && tokens.has("maria's token"));
        // Its open invite still lets one in, and its day's count came along.
        assert_eq!(
            invites.redeem(&open, &hash(1), &tokens, NOW),
            Ok("anna".to_string())
        );
        assert_eq!(invites.list(&again, &tokens, NOW).len(), 2);
        // Also after a restart: the new line takes back the phone the old one let in.
        drop(invites);
        let tokens = Tokens::new(path.0.clone());
        let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        invites.finish_moves(&tokens);
        assert_eq!(invites.list(&again, &tokens, NOW).len(), 2);
        assert!(invites
            .take_back(&again, &Invite::id_of(&secret), &tokens)
            .unwrap());
        assert!(!tokens.has("maria's token") && tokens.holds(&hash(1)));
        // Its own line taken out, the phone it let in stays.
        tokens.remove(&again).unwrap();
        assert!(tokens.holds(&hash(1)));
    }

    #[test]
    fn a_relay_stopped_while_a_phone_signs_in_again_moves_its_invites_at_the_next_start() {
        for written in [false, true] {
            let path = TempPath::new("tokens");
            let kept = TempPath::new("invites");
            let (tokens, pixel) = phones(&path);
            let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
            let (secret, _) = invites.make(&pixel, "maria", &tokens, NOW).unwrap();
            let maria = took(&invites, &secret, "maria's token", &tokens);
            let again: [u8; 32] = Sha256::digest(b"pixel again").into();
            invites.moving(&pixel.hash, &again).unwrap();
            if written {
                tokens
                    .add(&again, "pixel", false, "again", Some(&pixel.hash))
                    .unwrap();
            }
            // The relay stops here, before the move is finished, and starts again.
            drop((invites, tokens));
            let tokens = Tokens::new(path.0.clone());
            let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
            invites.finish_moves(&tokens);
            let inviter = if written { again } else { pixel.hash };
            assert_eq!(invites.edges().get(&maria), Some(&inviter), "{written}");
            assert_eq!(invites.list(&inviter, &tokens, NOW).len(), 1, "{written}");
            assert!(tokens.has("maria's token"), "{written}");
            // Finished, and written down so.
            let state = lock(&invites.state, INVITES_LOCK).clone();
            assert!(state.moving.is_empty());
            assert_eq!(
                Invites::open(&kept.0, true, MAX_INVITED).unwrap().edges()[&maria],
                inviter
            );
            // Signed in again, but its new line could not go in: the invites stay the old line's.
            let other: [u8; 32] = Sha256::digest(b"pixel once more").into();
            invites.moving(&inviter, &other).unwrap();
            invites.not_moved(&inviter, &other);
            assert_eq!(invites.edges()[&maria], inviter);
            assert!(lock(&invites.state, INVITES_LOCK).moving.is_empty());
        }
    }

    #[test]
    fn a_used_invite_stays_while_its_line_is_in_the_file_read_halfway_or_refused() {
        let path = TempPath::new("tokens");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::in_memory();
        let (secret, _) = invites.make(&pixel, "maria", &tokens, NOW).unwrap();
        let maria = took(&invites, &secret, "maria's token", &tokens);
        let whole = fs::read_to_string(&path.0).unwrap();
        // The operator saves the file in place, and the sweep reads it halfway, before Maria's line.
        let half: String = whole
            .lines()
            .filter(|line| !line.starts_with(&to_hex(&maria)))
            .map(|line| format!("{line}\n"))
            .collect();
        fs::write(&path.0, &half).unwrap();
        assert!(!tokens.has("maria's token"));
        invites.sweep(&tokens, NOW);
        assert_eq!(invites.edges().get(&maria), Some(&pixel.hash));
        // The whole file: Maria comes in again, still by Pixel's invite.
        fs::write(&path.0, &whole).unwrap();
        assert!(tokens.has("maria's token"));
        // Pixel's line deleted by hand: Maria's stays, and so does her invite.
        delete_by_hand(&path, &pixel.hash);
        invites.sweep(&tokens, NOW);
        assert!(tokens.has("maria's token"));
        assert_eq!(invites.edges().get(&maria), Some(&pixel.hash));
        // Pixel's line put back, and its invite taken back when the file cannot be written (a
        // link): Maria is refused, and stays invited.
        fs::write(&path.0, &whole).unwrap();
        #[cfg(unix)]
        {
            let target = path.0.with_extension("real");
            fs::rename(&path.0, &target).unwrap();
            std::os::unix::fs::symlink(&target, &path.0).unwrap();
            assert!(invites
                .take_back(&pixel.hash, &Invite::id_of(&secret), &tokens)
                .is_err());
            assert!(!tokens.has("maria's token"));
            invites.sweep(&tokens, NOW);
            assert_eq!(invites.edges().get(&maria), Some(&pixel.hash));
            assert_eq!(invites.len(), 1);
            fs::remove_file(&path.0).unwrap();
            fs::rename(&target, &path.0).unwrap();
            // The file itself again, left so for a minute: the sweep writes Maria's line out, and
            // only then drops her invite.
            let file = fs::File::options().write(true).open(&path.0).unwrap();
            file.set_modified(SystemTime::UNIX_EPOCH + Duration::from_secs(5_000_000))
                .unwrap();
            invites.sweep(&tokens, NOW);
            assert!(!tokens.in_file(&maria) && tokens.holds(&pixel.hash));
            assert!(invites.edges().is_empty());
        }
    }

    #[test]
    fn a_line_freed_is_no_longer_its_inviter_s_to_take_back_nor_counted() {
        let path = TempPath::new("tokens");
        let kept = TempPath::new("invites");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        let (secret, _) = invites.make(&pixel, "maria", &tokens, NOW).unwrap();
        let maria = took(&invites, &secret, "maria's token", &tokens);
        drop(invites);
        // As `erevos-relay free-line maria` does, with the relay stopped.
        let offline = Invites::open(&kept.0, false, MAX_INVITED).unwrap();
        assert_eq!(offline.free(&maria).unwrap(), ["pixel"]);
        assert!(offline.free(&maria).unwrap().is_empty());
        drop(offline);
        let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        invites.finish_moves(&tokens);
        assert!(invites.list(&pixel.hash, &tokens, NOW).is_empty());
        assert!(!invites
            .take_back(&pixel.hash, &Invite::id_of(&secret), &tokens)
            .unwrap());
        assert!(tokens.has("maria's token"));
        assert_eq!(
            Invites::counted(&lock(&invites.state, INVITES_LOCK), &tokens, NOW),
            0
        );
    }

    #[test]
    fn the_relay_lets_in_so_many_phones_by_invite() {
        let path = TempPath::new("tokens");
        let kept = TempPath::new("invites");
        let (tokens, pixel) = phones(&path);
        let invites = Invites::open(&kept.0, true, 3).unwrap();
        let (first, _) = invites.make(&pixel, "a", &tokens, NOW).unwrap();
        let (second, _) = invites.make(&pixel, "b", &tokens, NOW).unwrap();
        invites.make(&pixel, "c", &tokens, NOW).unwrap();
        // Open ones count, so they cannot go past it when taken.
        assert_eq!(
            invites.make(&pixel, "d", &tokens, NOW),
            Err(InviteError::Full)
        );
        took(&invites, &first, "a's token", &tokens);
        assert_eq!(
            invites.make(&pixel, "d", &tokens, NOW),
            Err(InviteError::Full)
        );
        // One taken back, or a phone let in whose line goes, leaves room for one more.
        invites
            .take_back(&pixel.hash, &Invite::id_of(&second), &tokens)
            .unwrap();
        assert!(invites.make(&pixel, "d", &tokens, NOW).is_ok());
        let a: [u8; 32] = Sha256::digest(b"a's token").into();
        tokens.remove(&a).unwrap();
        let (fifth, _) = invites.make(&pixel, "e", &tokens, NOW).unwrap();
        // The operator lowers it: an invite made before lets no one in past it.
        drop(invites);
        let lower = Invites::open(&kept.0, true, 1).unwrap();
        assert_eq!(
            lower.redeem(&fifth, &hash(5), &tokens, NOW),
            Err(RedeemError::NotFound)
        );
        // With invites off, they are kept for who invited whom only.
        drop(lower);
        let off = Invites::open(&kept.0, false, MAX_INVITED).unwrap();
        assert!(!off.on());
        assert_eq!(
            off.redeem(&fifth, &hash(5), &tokens, NOW),
            Err(RedeemError::NotFound)
        );
    }

    #[cfg(unix)]
    #[test]
    fn an_invite_is_written_used_before_its_line_goes_in_and_open_again_if_it_cannot() {
        let path = TempPath::new("tokens");
        let link = TempPath::new("link");
        let kept = TempPath::new("invites");
        let (_, pixel) = phones(&path);
        std::os::unix::fs::symlink(&path.0, &link.0).unwrap();
        let tokens = Tokens::new(link.0.clone());
        let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        let (secret, _) = invites.make(&pixel, "maria", &tokens, NOW).unwrap();
        // The file of tokens cannot be written (a link): no line, and the invite is open again, also on disk.
        assert_eq!(
            invites.redeem(&secret, &hash(1), &tokens, NOW),
            Err(RedeemError::Storage)
        );
        assert!(!tokens.holds(&hash(1)));
        assert_eq!(invites.list(&pixel.hash, &tokens, NOW)[0].used, 0);
        assert_eq!(
            Invites::open(&kept.0, true, MAX_INVITED)
                .unwrap()
                .list(&pixel.hash, &tokens, NOW)[0]
                .used,
            0
        );
        // A token whose line is in the file already is refused, and the invite stays open.
        let tokens = Tokens::new(path.0.clone());
        assert_eq!(
            invites.redeem(&secret, &pixel.hash, &tokens, NOW),
            Err(RedeemError::Taken)
        );
        assert_eq!(tokens.count(), 1);
        // The file of invites cannot be written: no line goes in either.
        fs::remove_file(&kept.0).unwrap();
        fs::create_dir(&kept.0).unwrap();
        assert_eq!(
            invites.redeem(&secret, &hash(1), &tokens, NOW),
            Err(RedeemError::Storage)
        );
        assert!(!tokens.holds(&hash(1)));
        fs::remove_dir(&kept.0).unwrap();
        assert_eq!(
            invites.redeem(&secret, &hash(1), &tokens, NOW),
            Ok("maria".to_string())
        );
    }

    #[test]
    fn a_long_name_on_an_operator_s_line_is_kept_cut_where_a_letter_ends() {
        let path = TempPath::new("tokens");
        let kept = TempPath::new("invites");
        let long = "Μ".repeat(200);
        let (token, line) = crate::tokens::new_token(&long);
        fs::write(&path.0, format!("{line}\n")).unwrap();
        let tokens = Tokens::new(path.0.clone());
        let phone = tokens.find(&token).unwrap();
        assert_eq!(phone.name.len(), 400);
        let invites = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        let (secret, _) = invites.make(&phone, "maria", &tokens, NOW).unwrap();
        drop(invites);
        // The relay still opens what it wrote.
        let again = Invites::open(&kept.0, true, MAX_INVITED).unwrap();
        let state = lock(&again.state, INVITES_LOCK).clone();
        assert_eq!(state.invites[0].by_name, "Μ".repeat(127));
        assert_eq!(
            again.redeem(&secret, &hash(1), &tokens, NOW),
            Ok("maria".to_string())
        );
        assert!(fs::read_to_string(&path.0)
            .unwrap()
            .contains(&format!("maria # invited by {} on", "Μ".repeat(127))));
        let mut out = Vec::new();
        put_short(&mut out, "aΜ");
        assert_eq!(out, [3, b'a', 0xce, 0x9c]);
    }

    #[test]
    fn a_phone_with_the_relay_s_token_gets_a_line_of_its_own_once() {
        let path = TempPath::new("tokens");
        let (tokens, _) = phones(&path);
        let invites = Invites::in_memory();
        let (anna, _) = crate::tokens::new_token("");
        let line: [u8; 32] = Sha256::digest(anna.as_bytes()).into();
        assert_eq!(
            invites.own("Άννα", &line, &tokens, NOW),
            Ok("anna".to_string())
        );
        assert!(tokens.has(&anna));
        let text = fs::read_to_string(&path.0).unwrap();
        assert!(text.starts_with("# phones\n"), "the operator's lines stay");
        assert!(text.ends_with(&format!(
            "{} anna # came with the relay's token on {}\n",
            to_hex(&line),
            date(NOW)
        )));
        // Asked again, as when the answer was lost: the same, and no second line.
        assert_eq!(
            invites.own("Άννα", &line, &tokens, NOW + 1),
            Ok("anna".to_string())
        );
        assert_eq!(tokens.count(), 2);
        // Its line is the operator's own: it may invite, and its invites count as its.
        let phone = tokens.find(&anna).unwrap();
        assert!(invites.make(&phone, "maria", &tokens, NOW).is_ok());
        // A name with nothing left of it, and another phone with the same name.
        assert_eq!(
            invites.own("😀", &hash(1), &tokens, NOW),
            Ok("phone".to_string())
        );
        assert_eq!(
            invites.own("anna", &hash(2), &tokens, NOW),
            Ok("anna-2".to_string())
        );
    }

    #[test]
    fn lines_for_the_relay_s_token_are_few_a_day_and_none_while_invites_are_off() {
        let path = TempPath::new("tokens");
        let (tokens, _) = phones(&path);
        let invites = Invites::in_memory();
        for n in 0..MAX_OWN_A_DAY {
            let mut line = [0u8; 32];
            line[..4].copy_from_slice(&n.to_be_bytes());
            line[31] = 1;
            assert!(invites.own("phone", &line, &tokens, NOW).is_ok());
        }
        assert_eq!(
            invites.own("one more", &hash(7), &tokens, NOW),
            Err(OwnError::Full)
        );
        // One already on a line is answered still.
        let mut first = [0u8; 32];
        first[31] = 1;
        assert_eq!(
            invites.own("phone", &first, &tokens, NOW),
            Ok("phone".to_string())
        );
        // The next day, more.
        assert!(invites
            .own("one more", &hash(7), &tokens, NOW + DAY)
            .is_ok());

        let kept = TempPath::new("invites");
        let off = Invites::open(&kept.0, false, MAX_INVITED).unwrap();
        assert_eq!(off.own("phone", &hash(8), &tokens, NOW), Err(OwnError::Off));
        assert!(!tokens.holds(&hash(8)));
    }
}
