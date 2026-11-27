// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! Erevos relay: holds one-way message queues for offline delivery.
//!
//! Usage: `erevos-relay [TCP_ADDR] [WS_ADDR]`. The defaults are
//! `127.0.0.1:7878` for TCP and `127.0.0.1:7879` for WebSocket. Both front
//! ends share one store. This binary speaks plain TCP and plain WebSocket
//! (`ws://`), so put the WebSocket behind a TLS proxy before it leaves the
//! local network.
//!
//! Set `EREVOS_RELAY_TOKEN` to require `Authorization: Bearer <token>` (or,
//! from a browser, the token as a subprotocol) on WebSocket connections. Without it, anyone who can reach the WebSocket port
//! can use the relay. The TCP front end has no token, so keep it on
//! `127.0.0.1` anywhere others can reach the machine.
//!
//! Set `EREVOS_RELAY_TOKENS` to a file of the phones' tokens of their own, so
//! that each phone's access can be taken back alone (see `tokens.rs`): one
//! token's SHA-256 a line, read again when the file changes, taken beside
//! `EREVOS_RELAY_TOKEN`. `erevos-relay new-token NAME` makes one, printing the
//! token for the phone and the line for the file. A phone whose line goes is
//! cut off at its next request, on a connection already open too.
//!
//! Set `EREVOS_RELAY_INVITES=on` beside it to let every phone with a token of
//! its own invite more phones, one an invite (see `invites.rs`): an invite is a
//! QR code with the relay's address and a secret, good for one phone for 7
//! days, and the phone that takes it gets a line of its own in the file, named
//! as the inviter typed and saying who invited it. That line stands on its
//! own: when the inviter's line goes, for whatever reason, it stays, and so do
//! the lines it invited. The inviter taking back the invite the phone took
//! takes out that phone's line alone. `erevos-relay free-line NAME`, run with
//! the relay stopped, drops the invite that made a line, so that its inviter
//! no longer takes it back, and it no longer counts among the phones let in
//! by invite. The relay lets in at most
//! `EREVOS_RELAY_MAX_INVITED` phones by invite at once (100 unless set),
//! counting invites still open. The relay then writes the file itself, through
//! a file beside it and a rename, so the file must be in a folder the relay can
//! write (with the systemd unit in `deploy/relay`, `/var/lib/erevos-relay/`,
//! not `/etc`), and must be the file itself: the relay does not start when the
//! path is a symbolic link. The invites are kept in `<file>.invites`, and read
//! even with invites off, so that, turned on again, each phone has the invites
//! it made, also one signed in again meanwhile.
//! While invites are on, a phone that came with `EREVOS_RELAY_TOKEN` asks once
//! for a line of its own, which the relay adds as one of the operator's, 50 a
//! day at most, so changing that token later cuts off no phone that has one.
//! Off unless set.
//!
//! Set `EREVOS_RELAY_OIDC_ISSUER` beside it to let phones sign in with an
//! OpenID Connect provider for a token of their own (see `signin.rs`), with
//! `EREVOS_RELAY_OIDC_CLIENT_ID` and `EREVOS_RELAY_OIDC_CLIENT_SECRET` (a
//! confidential client whose redirect URI is `<public URL>/signin/callback`),
//! `EREVOS_RELAY_PUBLIC_URL` (where browsers reach the relay, as
//! `https://erevos.example.org`) and `EREVOS_RELAY_OIDC_NAME` (the name on
//! the app's button and before each line's name, `OIDC` unless set). The
//! WebSocket port then answers the browser's requests on `/signin/` too, so
//! a proxy in front must pass that path as plain HTTP. The page there shows a
//! code, which the person types in Erevos. Each phone that signs in gets a
//! line `<name>:<user name>`, and every hour the relay asks the provider
//! whether the account may still sign in, taking the line out when it may not,
//! or when the provider could not say so for 72 hours and then at two more
//! checks of that line an hour apart. One browser may start 10 sign-ins a
//! minute, told by its address, or by the last one in `X-Forwarded-For` when
//! the connection comes from a proxy on this machine. Set
//! `EREVOS_RELAY_OIDC_GROUP` to let in only accounts in that group, as the
//! provider's userinfo names them in `groups` (Authentik does for the
//! `profile` scope), at sign-in and at every check. What the check needs is
//! kept in `<file>.signins`, the refresh tokens sealed with a key made from the
//! client secret; a line named `<name>:` with no record there is said at
//! start. Off unless set.
//!
//! Coupons (see `coupons.rs`) give a phone of one relay a token on another,
//! through Tor, without either relay knowing which phone it is: a backup
//! relay for a space that never learns whose space it is. Set
//! `EREVOS_RELAY_COUPON_KEY` to the file of a key made with
//! `erevos-relay new-coupon-key FILE` (readable by the relay's user alone),
//! and the phones with tokens of their own here may each have 2 coupons a day,
//! and 6 in 30 days, signed, blind. Set `EREVOS_RELAY_COUPON_ISSUERS` to a file with the public
//! keys of the relays whose coupons this one takes, one on each line as
//! `new-coupon-key` writes it in `FILE.pub` (it needs `EREVOS_RELAY_TOKENS`
//! too): a phone with one gets a line `spare` in the file of tokens, which
//! lasts 90 days, at most `EREVOS_RELAY_MAX_COUPONS` of them at once (2000
//! unless set). Each coupon is taken once, kept in `<file>.coupons`. Both are
//! read at start. Off unless set. Set `EREVOS_RELAY_PAIR` to the address of
//! a relay that takes this one's coupons (`wss://…`, or up to 3 apart by
//! spaces), with `EREVOS_RELAY_COUPON_KEY`: the phones that may have coupons
//! signed here are told it, and a space of theirs with no home relay takes it
//! as its home relay by itself, only through Tor (see `coupons.rs`).
//!
//! Set `EREVOS_RELAY_OPEN=on` beside `EREVOS_RELAY_TOKENS` to give a phone
//! with no place here one by itself, as the app asks at first start (see
//! `open.rs`): an open place, a line the relay adds to the file, named
//! `open-` and 8 hex digits. It gives at most `EREVOS_RELAY_OPEN_PLACES` at
//! once (1000 unless set), `EREVOS_RELAY_OPEN_DAY` a day (100 unless set),
//! and `EREVOS_RELAY_OPEN_PER_ADDRESS` a day to one address (3 unless set),
//! an IPv6 address counted by its /48, and the address counted in memory
//! only, by a keyed hash, never written or logged. Behind a proxy on this
//! machine, the proxy must set `X-Forwarded-For`, as for signing in, or all
//! phones count as one address, which the relay says in its log, once an
//! hour at most. Each open place may make `EREVOS_RELAY_OPEN_QUEUES` queues
//! (20 unless set), put or fetch `EREVOS_RELAY_OPEN_FILES_MB` megabytes of
//! files through the relay (50 unless set), take credentials for the call
//! relay `EREVOS_RELAY_OPEN_CALLS` times (30 unless set) and have the relay
//! connect to another relay for it `EREVOS_RELAY_OPEN_FORWARDS` times (5000
//! unless set) a day; past that, it is told its day is full. It may have
//! `EREVOS_RELAY_OPEN_QUEUED_MB` megabytes of messages waiting in its queues
//! (8 unless set) and `EREVOS_RELAY_OPEN_LATER` messages sent for later (20
//! unless set) at once, and all open places together at most half of the
//! messages waiting, the files and the messages sent for later the relay
//! holds. It may not invite, lend or have coupons signed. One whose token
//! connects on none of `EREVOS_RELAY_OPEN_UNUSED_DAYS` days (60 unless set)
//! is taken out of the file, and one whose token never connects after the
//! day it was made, `EREVOS_RELAY_OPEN_FIRST_DAYS` days after that day (7
//! unless set). Days are UTC days. What is counted is kept in
//! `<file>.open`. With the setting off, or set to anything but `on`, no new
//! ones are given, and lines named `open-…` stay open places, with these
//! limits. The relay does not start with it on and no
//! `EREVOS_RELAY_TOKENS`. Off unless set.
//! `erevos-relay open-places` says, from the file and `<file>.open` alone,
//! how many open places there are, how many were made today and in the last
//! 7 days, and how many were used (their token connected, or they were made)
//! today and in the last 7 and 30 days.
//!
//! Each connection has a thread of its own, so the relay takes at most
//! `EREVOS_RELAY_MAX_CONNECTIONS` at once (512 unless set), both front ends
//! together, and of those at most `EREVOS_RELAY_MAX_TOKENLESS_CONNECTIONS`
//! (128 unless set) on the paths that need no token (`/sealed`, `/files`
//! and `/join`), and apart from those at most
//! `EREVOS_RELAY_MAX_READING_CONNECTIONS` (256 unless set) on `/read`, where
//! phones read their queues with no token. Past that, a new connection is
//! closed at once. A connection
//! that sends nothing for five minutes is closed (see `server.rs`).
//!
//! Set `EREVOS_RELAY_JOURNAL` to a file path to keep queues and waiting
//! messages there, so they survive a restart. Without it, they live in memory
//! only and are lost when the relay stops. Stopped with `SIGTERM` or
//! `SIGINT`, the relay keeps what came into each queue since its phone last
//! found it empty in `<journal>.news` until it next starts (see `stop.rs`),
//! so a phone is not told again of messages it was told of already.
//!
//! Each record of the journal is checked as it is read back: one the disk
//! changed is reported, and the journal as it was kept beside it. An older
//! relay does not read a journal written now; to go back to one, stop this
//! relay and run `erevos-relay downgrade-journal`, which writes it again as
//! older relays read it, with nothing left out (see `journal.rs`).
//!
//! Messages nobody takes expire after 14 days. Set `EREVOS_RELAY_TTL_DAYS`
//! to change that.
//!
//! The relay holds at most `EREVOS_RELAY_MAX_QUEUES` queues (100000 unless
//! set), places lent among them; past that, a phone asking for a new one is
//! told the relay is full. A queue its phone has not taken from or waited on
//! for `EREVOS_RELAY_QUEUE_DAYS` (180 unless set) expires, with what waits in
//! it (see `queue.rs`).
//!
//! Waiting messages are held in memory, at most `EREVOS_RELAY_QUEUED_MB`
//! megabytes of them (1024 unless set), and of that at most
//! `EREVOS_RELAY_QUEUED_PER_PHONE_MB` (64 unless set) in the queues one phone
//! made with a token of its own or a lent one; past either, a send is told the
//! relay is full. A journal that holds more is read back without its oldest
//! messages past it, said in one line (see `queue.rs`).
//!
//! Set `EREVOS_RELAY_KEY` to a file path to give the relay a key for sealed
//! sends (two-hop sending, see `server.rs`). The file is made on first start
//! and must be kept: phones put the public key in their contact links.
//! Without it, the relay still forwards for its own phones but cannot take
//! sealed sends from other relays.
//!
//! A forward (and taking a file through this relay) goes only to relays at
//! addresses on the internet, not to this machine or its network (see
//! `peers.rs`). Set `EREVOS_RELAY_PRIVATE_PEERS=allow` where relays reach
//! each other at private addresses, as on a home network.
//!
//! Set `EREVOS_RELAY_LEND=on` on a relay with a key to lend places to phones
//! that have no relay of their own (see `lend.rs`): its phones put a ticket
//! in their contact links, and whoever adds them without a relay takes a
//! queue here with it. Off unless set. How many places each ticket gave and
//! what each place used today are kept in `<key file>.lent-counts`. A new key
//! takes back every place lent; to take back the places of one ticket only,
//! put its nonce on a line of `EREVOS_RELAY_LEND_REVOKED` (`<key
//! file>.revoked` unless set), which the relay reads again when it changes.
//!
//! Set `EREVOS_RELAY_FILES` to a folder to keep the chunks of files that
//! phones send (see `files.rs`) there. Without it, they live in memory and are
//! lost when the relay stops. `EREVOS_RELAY_FILES_MB` sets how much room they
//! may take together: 1024 MB on disk unless set, 256 MB in memory. Chunks
//! nobody takes expire like messages.
//!
//! Set `EREVOS_RELAY_PUSH_KEY` to a file path to let web apps ask for a
//! push when a message comes (Web Push, see `push.rs`). The key is made
//! there on first start and must be kept; the push addresses are kept beside
//! it, in `<file>.addresses`, and the browsers' keys for them in
//! `<file>.addresses.keys`. `EREVOS_RELAY_PUSH_SUBJECT` is the `mailto:` or
//! `https:` address push services may write to about the relay. Only
//! addresses of Apple's, Google's, Mozilla's and Microsoft's push services
//! are taken; set `EREVOS_RELAY_PUSH_SERVICES` to more, each an `https:`
//! origin and the `/` after it (`https://push.example.org/`), separated by
//! commas or spaces.
//!
//! The WebSocket port also takes Matrix homeservers' pushes, on
//! `/_matrix/push/v1/notify` (see `matrix_push.rs`), so that a space closed on
//! a phone can say a message came on its Matrix account: each counts one
//! message in the news of a queue the space made for it, and nothing is kept.
//! A proxy in front must pass that path as plain HTTP. Set
//! `EREVOS_RELAY_MATRIX_PUSH=off` to answer none. On unless set.
//!
//! Set `EREVOS_RELAY_XMPP_PUSH` to the relay's DNS name, with
//! `EREVOS_RELAY_XMPP_PUSH_CERT` and `EREVOS_RELAY_XMPP_PUSH_KEY` (its
//! certificate chain and key, PEM), to take XMPP servers' pushes too (see
//! `xmpp_push.rs`): on port 5269, or `EREVOS_RELAY_XMPP_PUSH_ADDR`, with
//! STARTTLS, as XMPP servers reach each other. Off unless set.
//!
//! Messages sent for later (see `later.rs`) are kept in the folder
//! `EREVOS_RELAY_LATER`, or else in `<journal>.later` beside the journal,
//! until they go. Without either, they live in memory and are lost when the
//! relay stops.
//!
//! Set `EREVOS_TURN_URLS` (comma-separated `turn:` addresses) and
//! `EREVOS_TURN_SECRET` (the `static-auth-secret` of the coturn beside the
//! relay) to hand phones credentials for calls through it (see `turn.rs`).
//! Without them, phones can only call directly, on the same network.

/// `eprintln!` that never panics: a line to stderr, dropped if it cannot be
/// written. `eprintln!` panics when stderr is gone (a closed pipe, a stopped
/// terminal), which would end the thread that logs, so the stop on `SIGTERM`
/// (`stop.rs`) or a push thread. Everything the relay logs goes through this.
/// In unit tests it stays `eprintln!`, which the test harness captures.
#[cfg(not(test))]
macro_rules! elog {
    ($($arg:tt)*) => {{
        use std::io::Write as _;
        let _ = writeln!(std::io::stderr(), $($arg)*);
    }};
}
#[cfg(test)]
macro_rules! elog {
    ($($arg:tt)*) => { eprintln!($($arg)*) };
}

mod connect;
mod coupons;
mod files;
mod invites;
mod journal;
mod later;
mod lend;
mod lock;
mod matrix_push;
mod oidc;
mod open;
mod pages;
mod peers;
mod push;
mod queue;
mod server;
mod signin;
mod stop;
mod tokens;
mod turn;
mod xmpp_push;

use std::env;
use std::fs;
use std::io;
use std::net::TcpListener;
use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Arc;
use std::thread;
use std::time::Duration;

use erevos_core::relay_seal::RelayKey;
use files::FileStore;
use later::Held;
use queue::Store;
use server::{Limits, Shared};
use turn::Turn;

/// The whole number in the environment variable `name`, or `default` when it
/// is not set. `None`, after saying why, when it is set to anything but a
/// whole number of at least `least`.
fn number(name: &str, default: u64, least: u64) -> Option<u64> {
    match env::var(name) {
        Ok(text) if !text.is_empty() => match text.parse::<u64>() {
            Ok(n) if n >= least => Some(n),
            _ => {
                elog!("erevos-relay: {name} must be a whole number, at least {least}");
                None
            }
        },
        _ => Some(default),
    }
}

/// The limits of open places, from their settings (see `open.rs`). `None`,
/// after saying why, when one is set to anything but a whole number of at
/// least what it may be.
fn open_limits() -> Option<open::Limits> {
    let places = number("EREVOS_RELAY_OPEN_PLACES", open::DEFAULT_PLACES, 1)?;
    let day = number("EREVOS_RELAY_OPEN_DAY", open::DEFAULT_DAY, 1)?;
    let per_address = number("EREVOS_RELAY_OPEN_PER_ADDRESS", open::DEFAULT_PER_ADDRESS, 1)?;
    let unused_days = number("EREVOS_RELAY_OPEN_UNUSED_DAYS", open::DEFAULT_UNUSED_DAYS, 1)?;
    // 0 would take out a place on the day it was made, before its phone could come back.
    let first_days = number("EREVOS_RELAY_OPEN_FIRST_DAYS", open::DEFAULT_FIRST_DAYS, 1)?;
    let files_mb = number("EREVOS_RELAY_OPEN_FILES_MB", open::DEFAULT_FILES_MB, 0)?;
    let calls = number("EREVOS_RELAY_OPEN_CALLS", open::DEFAULT_CALLS, 0)?;
    let queues = number("EREVOS_RELAY_OPEN_QUEUES", open::DEFAULT_QUEUES, 1)?;
    let forwards = number("EREVOS_RELAY_OPEN_FORWARDS", open::DEFAULT_FORWARDS, 0)?;
    // 0 would let no message wait in an open place's queues: its phone could be sent nothing.
    let queued_mb = number("EREVOS_RELAY_OPEN_QUEUED_MB", open::DEFAULT_QUEUED_MB, 1)?;
    let later = number("EREVOS_RELAY_OPEN_LATER", open::DEFAULT_LATER, 0)?;
    let at_most = |n: u64| u32::try_from(n).unwrap_or(u32::MAX);
    Some(open::Limits {
        places: places.try_into().unwrap_or(usize::MAX),
        day: at_most(day),
        per_address: at_most(per_address),
        unused_days,
        first_days,
        file_bytes: files_mb.saturating_mul(1 << 20),
        calls: at_most(calls),
        queues: at_most(queues),
        forwards: at_most(forwards),
        queued: usize::try_from(queued_mb.saturating_mul(1 << 20)).unwrap_or(usize::MAX),
        later: later.try_into().unwrap_or(usize::MAX),
    })
}

/// `erevos-relay open-places`: how many open places the file of tokens
/// (`EREVOS_RELAY_TOKENS`) holds, how many of them were made today and in the
/// last 7 days, and how many were used (their token connected, or they were
/// made) today and in the last 7 and 30 days (UTC days, today among them),
/// from that file and `<file>.open` alone (see `open.rs`). It names no place,
/// token or address. It reads only, so the relay may run meanwhile.
fn open_places() -> ExitCode {
    let Some(path) = env::var("EREVOS_RELAY_TOKENS")
        .ok()
        .filter(|path| !path.is_empty())
    else {
        elog!("erevos-relay: open-places needs EREVOS_RELAY_TOKENS set to the file of tokens the relay uses");
        return ExitCode::FAILURE;
    };
    let text = match fs::read_to_string(&path) {
        Ok(text) => text,
        Err(e) if e.kind() == io::ErrorKind::NotFound => String::new(),
        Err(e) => {
            elog!("erevos-relay: cannot read the file of tokens {path}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let counts = format!("{path}.open");
    let kept = match fs::read(&counts) {
        Ok(bytes) => Some(bytes),
        Err(e) if e.kind() == io::ErrorKind::NotFound => None,
        Err(e) => {
            elog!("erevos-relay: cannot read the counts of open places {counts}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_or(0, |d| d.as_secs());
    let Some(tally) = open::tally(&text, kept.as_deref(), now) else {
        elog!("erevos-relay: {counts} is not a file of counts of open places");
        return ExitCode::FAILURE;
    };
    println!("Open places in {path}: {}", tally.places);
    println!(
        "Made today: {}; in the last 7 days: {}",
        tally.made_today, tally.made_week
    );
    println!(
        "Used today: {}; in the last 7 days: {}; in the last 30 days: {}",
        tally.used_today, tally.used_week, tally.used_month
    );
    println!("(UTC days, today among them. A place counts as used on the day it was made too.)");
    ExitCode::SUCCESS
}

/// Reads the relay key from `path`, or makes one there if the file does not exist.
fn load_key(path: &Path) -> io::Result<RelayKey> {
    match fs::read(path) {
        Ok(bytes) => {
            let bytes: [u8; 32] = bytes.try_into().map_err(|_| {
                io::Error::new(io::ErrorKind::InvalidData, "a relay key is 32 bytes")
            })?;
            Ok(RelayKey::from_secret_bytes(bytes))
        }
        Err(e) if e.kind() == io::ErrorKind::NotFound => {
            // Written beside it and renamed: a stop halfway leaves no short key.
            let key = RelayKey::generate();
            journal::write_whole(path, &key.to_secret_bytes())?;
            Ok(key)
        }
        Err(e) => Err(e),
    }
}

/// `erevos-relay new-coupon-key FILE`: makes a key for coupons in `FILE`,
/// readable by its owner alone, and its public key in hex in `FILE.pub`, for
/// the `EREVOS_RELAY_COUPON_ISSUERS` file of the relays that take its coupons.
/// Never writes over a file that is there.
fn new_coupon_key(path: Option<String>) -> ExitCode {
    let Some(path) = path.filter(|p| !p.trim().is_empty()) else {
        elog!("erevos-relay: new-coupon-key needs the file to write the key to, as in erevos-relay new-coupon-key /var/lib/erevos-relay/coupon.key");
        return ExitCode::FAILURE;
    };
    let public = format!("{path}.pub");
    for file in [&path, &public] {
        if Path::new(file).exists() {
            elog!("erevos-relay: {file} is there already; the relay never writes over a key");
            return ExitCode::FAILURE;
        }
    }
    let (pem, hex) = match coupons::new_key() {
        Ok(made) => made,
        Err(e) => {
            elog!("erevos-relay: cannot make a key: {e}");
            return ExitCode::FAILURE;
        }
    };
    let written = (|| -> io::Result<()> {
        use std::io::Write as _;
        let mut options = fs::OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let mut file = options.open(&path)?;
        file.write_all(pem.as_bytes())?;
        file.sync_all()?;
        fs::write(&public, format!("{hex}\n"))
    })();
    if let Err(e) = written {
        elog!("erevos-relay: cannot write the key: {e}");
        return ExitCode::FAILURE;
    }
    println!("The key for coupons is in {path}: set EREVOS_RELAY_COUPON_KEY={path} on this relay.");
    println!("Its public key is in {public}: add its line to the EREVOS_RELAY_COUPON_ISSUERS file of each relay that takes this relay's coupons.");
    ExitCode::SUCCESS
}

/// `erevos-relay free-line NAME`: drops the invite that made the line named
/// `name` in the file of tokens (`EREVOS_RELAY_TOKENS`), so that the phone
/// that invited it no longer lists it or takes it back, it no longer counts
/// among the phones let in by invite, and it is as a line the operator wrote.
/// Run with the relay stopped, since a running relay writes its own invites
/// over the file; as root, the file of invites stays its owner's.
fn free_line(name: &str) -> ExitCode {
    let Some(path) = env::var("EREVOS_RELAY_TOKENS")
        .ok()
        .filter(|path| !path.is_empty())
    else {
        elog!("erevos-relay: free-line needs EREVOS_RELAY_TOKENS set to the file of tokens the relay uses");
        return ExitCode::FAILURE;
    };
    if name.is_empty() {
        elog!("erevos-relay: free-line needs the name on the line, as in erevos-relay free-line maria");
        return ExitCode::FAILURE;
    }
    let lines = tokens::Tokens::new(PathBuf::from(&path)).named(name);
    let line = match lines.as_slice() {
        [line] => *line,
        [] => {
            elog!("erevos-relay: no line of {path} is named {name:?}");
            return ExitCode::FAILURE;
        }
        _ => {
            elog!(
                "erevos-relay: {} lines of {path} are named {name:?}; give all but one another name first",
                lines.len()
            );
            return ExitCode::FAILURE;
        }
    };
    let kept = PathBuf::from(format!("{path}.invites"));
    let owner = owner_of(&kept);
    let invites = match invites::Invites::open(&kept, false, usize::MAX) {
        Ok(invites) => invites,
        Err(e) => {
            elog!(
                "erevos-relay: cannot read the invites {}: {e}",
                kept.display()
            );
            return ExitCode::FAILURE;
        }
    };
    match invites.free(&line) {
        Ok(by) if by.is_empty() => {
            println!(
                "No invite kept in {} made the line {name:?}: no other phone may take it back already.",
                kept.display()
            );
            ExitCode::SUCCESS
        }
        Ok(by) => {
            give_back(&kept, owner);
            println!(
                "The line {name:?} is no longer an invite of the line that invited it ({}), which can no longer take it back. Start the relay again.",
                by.join(", ")
            );
            ExitCode::SUCCESS
        }
        Err(e) => {
            elog!(
                "erevos-relay: cannot write the invites {}: {e}",
                kept.display()
            );
            ExitCode::FAILURE
        }
    }
}

/// `erevos-relay downgrade-journal [FILE]`: writes the journal in `FILE`, or
/// in the file `EREVOS_RELAY_JOURNAL` names, again as relays from before
/// journal records were checked read it, for going back to one (see
/// `journal.rs`), and keeps the file as it was beside it. Run with the relay
/// stopped, since a running relay goes on writing to the file as it was; as
/// root, the journal stays its owner's.
fn downgrade_journal(file: Option<String>) -> ExitCode {
    let Some(path) = file
        .filter(|p| !p.trim().is_empty())
        .or_else(|| env::var("EREVOS_RELAY_JOURNAL").ok().filter(|p| !p.is_empty()))
    else {
        elog!("erevos-relay: downgrade-journal needs the journal, as in erevos-relay downgrade-journal /var/lib/erevos-relay/queues.journal, or EREVOS_RELAY_JOURNAL set");
        return ExitCode::FAILURE;
    };
    let path = PathBuf::from(path);
    let owner = owner_of(&path);
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_or(0, |d| d.as_secs());
    match journal::downgrade(&path, now) {
        Ok(journal::Downgraded::Already) => {
            println!(
                "{} is written as older relays read it already: nothing to do.",
                path.display()
            );
            ExitCode::SUCCESS
        }
        Ok(journal::Downgraded::Done {
            records,
            skipped,
            kept,
        }) => {
            give_back(&path, owner);
            give_back(&kept, owner);
            if skipped.damaged {
                println!(
                    "{} is damaged {} bytes before its end: only the records before were written again.",
                    path.display(),
                    skipped.skipped
                );
            } else if skipped.skipped > 0 {
                println!(
                    "The last {} bytes of {} were a record cut short or damaged, most likely written in part, left out.",
                    skipped.skipped,
                    path.display()
                );
            }
            println!(
                "{} now holds its {records} {} as older relays read them; the file as it was is kept in {}. Start the older relay now.",
                path.display(),
                if records == 1 { "record" } else { "records" },
                kept.display()
            );
            ExitCode::SUCCESS
        }
        Err(e) => {
            elog!(
                "erevos-relay: cannot write the journal {} again: {e}",
                path.display()
            );
            ExitCode::FAILURE
        }
    }
}

/// Who owns the file at `path`, if it is there.
#[cfg(unix)]
fn owner_of(path: &Path) -> Option<(u32, u32)> {
    use std::os::unix::fs::MetadataExt;
    fs::metadata(path).ok().map(|meta| (meta.uid(), meta.gid()))
}

#[cfg(not(unix))]
fn owner_of(_: &Path) -> Option<(u32, u32)> {
    None
}

/// Gives the file at `path`, written again, back to `owner` when it is now
/// another's: written by root for the relay's own user, it must stay that
/// user's.
#[cfg(unix)]
fn give_back(path: &Path, owner: Option<(u32, u32)>) {
    if let Some((uid, gid)) = owner.filter(|owner| owner_of(path) != Some(*owner)) {
        // lchown: a link put there since changes the link, never what it points to.
        if let Err(e) = std::os::unix::fs::lchown(path, Some(uid), Some(gid)) {
            elog!(
                "erevos-relay: cannot give {} back to its owner: {e}",
                path.display()
            );
        }
    }
}

#[cfg(not(unix))]
fn give_back(_: &Path, _: Option<(u32, u32)>) {}

fn main() -> ExitCode {
    if env::args().nth(1).as_deref() == Some("new-token") {
        let name = env::args().skip(2).collect::<Vec<_>>().join(" ");
        let (token, line) = tokens::new_token(&name);
        println!("The phone's token, to type in its Relay settings:\n{token}\n");
        println!("Its line, to add to the file EREVOS_RELAY_TOKENS names (the relay keeps only this):\n{line}");
        return ExitCode::SUCCESS;
    }
    if env::args().nth(1).as_deref() == Some("free-line") {
        return free_line(&env::args().skip(2).collect::<Vec<_>>().join(" "));
    }
    if env::args().nth(1).as_deref() == Some("new-coupon-key") {
        return new_coupon_key(env::args().nth(2));
    }
    if env::args().nth(1).as_deref() == Some("downgrade-journal") {
        return downgrade_journal(env::args().nth(2));
    }
    if env::args().nth(1).as_deref() == Some("open-places") {
        return open_places();
    }
    // Before any thread starts, so that every one has them blocked.
    let signals = stop::block();
    let tcp_addr = env::args()
        .nth(1)
        .unwrap_or_else(|| "127.0.0.1:7878".to_string());
    let ws_addr = env::args()
        .nth(2)
        .unwrap_or_else(|| "127.0.0.1:7879".to_string());
    // Bind before opening the journal: a second relay on the same ports stops
    // here, before it could rewrite the file the first one is writing.
    let tcp = match TcpListener::bind(&tcp_addr) {
        Ok(l) => l,
        Err(e) => {
            elog!("erevos-relay: cannot listen on {tcp_addr}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let ws = match TcpListener::bind(&ws_addr) {
        Ok(l) => l,
        Err(e) => {
            elog!("erevos-relay: cannot listen on {ws_addr}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let token = env::var("EREVOS_RELAY_TOKEN")
        .ok()
        .filter(|t| !t.is_empty())
        .map(|t| Arc::from(t.as_str()));
    let phones = env::var("EREVOS_RELAY_TOKENS")
        .ok()
        .filter(|path| !path.is_empty());
    if token.is_none() && phones.is_none() {
        elog!("erevos-relay: no EREVOS_RELAY_TOKEN or EREVOS_RELAY_TOKENS set, the WebSocket accepts anyone");
    }
    let ttl = match env::var("EREVOS_RELAY_TTL_DAYS") {
        Ok(days) if !days.is_empty() => match days.parse::<u64>() {
            Ok(days) if days > 0 => days * 24 * 60 * 60,
            _ => {
                elog!("erevos-relay: EREVOS_RELAY_TTL_DAYS must be a whole number of days, at least 1");
                return ExitCode::FAILURE;
            }
        },
        _ => queue::DEFAULT_TTL,
    };
    let Some(max_queues) = number(
        "EREVOS_RELAY_MAX_QUEUES",
        queue::DEFAULT_MAX_QUEUES as u64,
        1,
    ) else {
        return ExitCode::FAILURE;
    };
    let Some(queue_days) = number(
        "EREVOS_RELAY_QUEUE_DAYS",
        queue::DEFAULT_QUEUE_TTL / queue::DAY,
        1,
    ) else {
        return ExitCode::FAILURE;
    };
    let (max_queues, queue_ttl) = (
        max_queues.try_into().unwrap_or(usize::MAX),
        queue_days.saturating_mul(queue::DAY),
    );
    let Some(queued_mb) = number("EREVOS_RELAY_QUEUED_MB", (queue::DEFAULT_MAX_BYTES >> 20) as u64, 1) else {
        return ExitCode::FAILURE;
    };
    let Some(share_mb) = number(
        "EREVOS_RELAY_QUEUED_PER_PHONE_MB",
        (queue::DEFAULT_SHARE >> 20) as u64,
        1,
    ) else {
        return ExitCode::FAILURE;
    };
    let mb = |n: u64| usize::try_from(n.saturating_mul(1 << 20)).unwrap_or(usize::MAX);
    let (queued, share) = (mb(queued_mb), mb(share_mb));
    // Read before the store is made, which counts the open places' messages waiting apart.
    let Some(open_limits) = open_limits() else {
        return ExitCode::FAILURE;
    };
    let store = match env::var("EREVOS_RELAY_JOURNAL") {
        Ok(path) if !path.is_empty() => match Store::open_with(Path::new(&path), ttl, queued) {
            Ok(store) => {
                elog!("erevos-relay: keeping queues in {path}");
                store
            }
            Err(e) => {
                elog!("erevos-relay: cannot open the journal {path}: {e}");
                return ExitCode::FAILURE;
            }
        },
        _ => {
            elog!(
                "erevos-relay: no EREVOS_RELAY_JOURNAL set, queues are lost when the relay stops"
            );
            Store::with_ttl(ttl)
        }
    };
    let store = store
        .with_queue_limits(max_queues, queue_ttl)
        .with_byte_limits(queued, share)
        .with_open_share(open_limits.queued);
    elog!(
        "erevos-relay: holding {max_queues} queues at most, each until its phone leaves it unused for {queue_days} days"
    );
    elog!(
        "erevos-relay: holding {queued_mb} MB of waiting messages at most, {share_mb} MB in the queues of one phone"
    );
    let key = match env::var("EREVOS_RELAY_KEY") {
        Ok(path) if !path.is_empty() => match load_key(Path::new(&path)) {
            Ok(key) => Some(key),
            Err(e) => {
                elog!("erevos-relay: cannot use the key file {path}: {e}");
                return ExitCode::FAILURE;
            }
        },
        _ => {
            elog!(
                "erevos-relay: no EREVOS_RELAY_KEY set, sealed sends from other relays are refused"
            );
            None
        }
    };
    let turn = match (env::var("EREVOS_TURN_URLS"), env::var("EREVOS_TURN_SECRET")) {
        (Ok(urls), Ok(secret)) if !urls.is_empty() || !secret.is_empty() => {
            match Turn::new(&urls, &secret) {
                Some(turn) => Some(turn),
                None => {
                    elog!("erevos-relay: EREVOS_TURN_URLS needs turn: or turns: addresses, at most {}, and EREVOS_TURN_SECRET a secret", turn::MAX_URLS);
                    return ExitCode::FAILURE;
                }
            }
        }
        _ => {
            elog!("erevos-relay: no EREVOS_TURN_URLS and EREVOS_TURN_SECRET set, calls cannot go through a call relay");
            None
        }
    };
    let cap = match env::var("EREVOS_RELAY_FILES_MB") {
        Ok(mb) if !mb.is_empty() => match mb.parse::<u64>() {
            Ok(mb) => Some(mb << 20),
            Err(_) => {
                elog!(
                    "erevos-relay: EREVOS_RELAY_FILES_MB must be a whole number of megabytes"
                );
                return ExitCode::FAILURE;
            }
        },
        _ => None,
    };
    let files = match env::var("EREVOS_RELAY_FILES") {
        Ok(dir) if !dir.is_empty() => {
            match FileStore::open(Path::new(&dir), cap.unwrap_or(files::DEFAULT_CAP), ttl) {
                Ok(files) => {
                    elog!(
                        "erevos-relay: keeping files in {dir}, {} MB now",
                        files.used() >> 20
                    );
                    files
                }
                Err(e) => {
                    elog!("erevos-relay: cannot open the file folder {dir}: {e}");
                    return ExitCode::FAILURE;
                }
            }
        }
        _ => {
            elog!("erevos-relay: no EREVOS_RELAY_FILES set, files are kept in memory and lost when the relay stops");
            FileStore::in_memory(cap.unwrap_or(files::DEFAULT_MEMORY_CAP), ttl)
        }
    };
    let held_dir = env::var("EREVOS_RELAY_LATER")
        .ok()
        .filter(|dir| !dir.is_empty())
        .or_else(|| {
            env::var("EREVOS_RELAY_JOURNAL")
                .ok()
                .filter(|path| !path.is_empty())
                .map(|path| format!("{path}.later"))
        });
    let held = match &held_dir {
        Some(dir) => {
            match Held::open(Path::new(dir), ttl) {
                Ok(held) => {
                    elog!(
                        "erevos-relay: keeping messages sent for later in {dir}, {} now",
                        held.len()
                    );
                    held
                }
                Err(e) => {
                    elog!("erevos-relay: cannot open the folder for messages sent for later {dir}: {e}");
                    return ExitCode::FAILURE;
                }
            }
        }
        None => {
            elog!("erevos-relay: messages sent for later are kept in memory and lost when the relay stops");
            Held::in_memory(ttl)
        }
    };
    let Some(connections) = number(
        "EREVOS_RELAY_MAX_CONNECTIONS",
        server::DEFAULT_MAX_CONNECTIONS as u64,
        1,
    ) else {
        return ExitCode::FAILURE;
    };
    let Some(tokenless) = number(
        "EREVOS_RELAY_MAX_TOKENLESS_CONNECTIONS",
        server::DEFAULT_MAX_TOKENLESS as u64,
        1,
    ) else {
        return ExitCode::FAILURE;
    };
    let Some(reading) = number(
        "EREVOS_RELAY_MAX_READING_CONNECTIONS",
        server::DEFAULT_MAX_READING as u64,
        1,
    ) else {
        return ExitCode::FAILURE;
    };
    let private_peers = match env::var("EREVOS_RELAY_PRIVATE_PEERS").as_deref() {
        Ok("allow") => {
            elog!("erevos-relay: EREVOS_RELAY_PRIVATE_PEERS=allow, forwards may go to relays on this machine and its network");
            true
        }
        Ok("" | "deny") | Err(_) => false,
        Ok(_) => {
            elog!("erevos-relay: EREVOS_RELAY_PRIVATE_PEERS must be allow or deny");
            return ExitCode::FAILURE;
        }
    };
    let matrix_push = match env::var("EREVOS_RELAY_MATRIX_PUSH").as_deref() {
        Ok("" | "on") | Err(_) => {
            elog!(
                "erevos-relay: Matrix homeservers may push to {}",
                matrix_push::NOTIFY_PATH
            );
            true
        }
        Ok("off") => {
            elog!("erevos-relay: EREVOS_RELAY_MATRIX_PUSH=off, Matrix homeservers' pushes are not taken");
            false
        }
        Ok(_) => {
            elog!("erevos-relay: EREVOS_RELAY_MATRIX_PUSH must be on or off");
            return ExitCode::FAILURE;
        }
    };
    let limits = Limits {
        connections: connections.try_into().unwrap_or(usize::MAX),
        tokenless: tokenless.try_into().unwrap_or(usize::MAX),
        reading: reading.try_into().unwrap_or(usize::MAX),
        private_peers,
        matrix_push,
        ..Limits::default()
    };
    elog!(
        "erevos-relay: taking {} connections at once, {} of them on the paths that need no token, and {} reading queues",
        limits.connections,
        limits.tokenless.min(limits.connections),
        limits.reading.min(limits.connections)
    );
    elog!("erevos-relay listening on tcp {tcp_addr} and ws {ws_addr}");
    let store = Shared::new(store, files, key, turn, limits);
    if let Some(signals) = signals {
        stop::wait(signals, Arc::clone(&store));
    }
    let inviting = match invites::wanted(env::var("EREVOS_RELAY_INVITES").ok().as_deref()) {
        Ok(on) => on,
        Err(e) => {
            elog!("erevos-relay: {e}");
            return ExitCode::FAILURE;
        }
    };
    let Some(most_invited) = number("EREVOS_RELAY_MAX_INVITED", invites::MAX_INVITED as u64, 1)
    else {
        return ExitCode::FAILURE;
    };
    if let Some(path) = &phones {
        // The relay writes the file through a rename, which would put a file where a link was.
        if let Err(e) = tokens::plain_file(Path::new(path)) {
            elog!("erevos-relay: cannot use the phones' tokens: {e}");
            return ExitCode::FAILURE;
        }
        let tokens = tokens::Tokens::new(PathBuf::from(path));
        // Read now, so how many it holds, and a line it cannot read, is said at start.
        tokens.count();
        let _ = store.tokens.set(tokens);
    }
    let open_setting = env::var("EREVOS_RELAY_OPEN").ok();
    let giving = open::wanted(open_setting.as_deref());
    match &phones {
        Some(path) => {
            // Lines named open-… are open places whatever the setting, so they are counted always.
            let kept = format!("{path}.open");
            match open::OpenPlaces::open(giving, open_limits, Path::new(&kept)) {
                Ok(open) => {
                    let limits = open.limits();
                    if open.on() {
                        elog!(
                            "erevos-relay: a phone with no place here takes an open place by itself, {} at most at once, {} a day, {} a day to one address; each may make {} queues, move {} MB of files through the relay, take credentials for calls {} times and have the relay connect to another {} times a day, keep {} MB of messages waiting and {} messages sent for later at once, and goes when unused for {} days, or {} days after the day it was made when not used again; all of them together keep at most half of the messages waiting, the files and the messages sent for later the relay holds; counted in {kept}",
                            limits.places,
                            limits.day,
                            limits.per_address,
                            limits.queues,
                            limits.file_bytes >> 20,
                            limits.calls,
                            limits.forwards,
                            // Never more than a phone's share (see `queue.rs`).
                            limits.queued.min(share) >> 20,
                            limits.later,
                            limits.unused_days,
                            limits.first_days
                        );
                    } else {
                        elog!("erevos-relay: no EREVOS_RELAY_OPEN=on set, no open places are given; those in the file, if any, keep their limits, counted in {kept}");
                    }
                    let _ = store.open.set(open);
                }
                Err(e) => {
                    elog!("erevos-relay: cannot read the counts of open places {kept}: {e}");
                    return ExitCode::FAILURE;
                }
            }
        }
        None if giving => {
            elog!("erevos-relay: EREVOS_RELAY_OPEN=on needs EREVOS_RELAY_TOKENS, the file the relay adds the open places' lines to");
            return ExitCode::FAILURE;
        }
        None => {}
    }
    if let Some(other) = open_setting.as_deref().filter(|v| !matches!(*v, "" | "on" | "off")) {
        elog!("erevos-relay: EREVOS_RELAY_OPEN is {other:?}, not on, so no open places are given");
    }
    let kept_invites = phones.as_ref().map(|path| format!("{path}.invites"));
    match (&kept_invites, inviting) {
        // Invites kept from before, with invites off now, still say who invited whom.
        (Some(kept), on) if on || Path::new(kept).exists() => {
            let most = most_invited.try_into().unwrap_or(usize::MAX);
            match invites::Invites::open(Path::new(kept), on, most) {
                Ok(invites) => {
                    if on {
                        elog!("erevos-relay: phones with tokens of their own may invite others, {most} at most let in by invite, {} invites kept in {kept}", invites.len());
                    } else {
                        elog!("erevos-relay: invites are off, but the invites made before stay kept in {kept}, for when they are on again");
                    }
                    if let Some(tokens) = store.tokens.get() {
                        // A phone signed in again just before the relay stopped gets its invites now.
                        invites.finish_moves(tokens);
                    }
                    let _ = store.invites.set(invites);
                }
                Err(e) => {
                    elog!("erevos-relay: cannot read the invites {kept}: {e}");
                    return ExitCode::FAILURE;
                }
            }
        }
        (None, true) => elog!(
            "erevos-relay: EREVOS_RELAY_INVITES=on but no EREVOS_RELAY_TOKENS set, nobody may invite"
        ),
        _ => {}
    }
    let signing = match oidc::Config::from(|name| env::var(name).ok()) {
        Ok(config) => config,
        Err(e) => {
            elog!("erevos-relay: {e}");
            return ExitCode::FAILURE;
        }
    };
    match (&phones, signing) {
        (Some(path), Some(config)) => {
            let kept = format!("{path}.signins");
            let name = config.name.clone();
            match signin::SignIn::open(config, Some(PathBuf::from(&kept))) {
                Ok(signin) => {
                    elog!("erevos-relay: phones may sign in with {name} for tokens of their own, {} signed in, kept in {kept}", signin.len());
                    if let Some(tokens) = store.tokens.get() {
                        // Lines the relay was taking out when it stopped go now, not at the first look.
                        signin.cut_pending(tokens);
                    }
                    for line in store.tokens.get().map(|t| signin.unrecorded(t)).unwrap_or_default() {
                        elog!("erevos-relay: the line {} is named as a sign-in with {name}, but {kept} has no record of it, so it is never checked with {name}: take it out unless you wrote it yourself", tokens::short(&line));
                    }
                    let _ = store.signin.set(signin);
                    let checked = Arc::clone(&store);
                    thread::spawn(move || server::run_signin_checks(checked));
                }
                Err(e) => {
                    elog!("erevos-relay: cannot read the sign-ins {kept}: {e}");
                    return ExitCode::FAILURE;
                }
            }
        }
        (None, Some(_)) => elog!(
            "erevos-relay: EREVOS_RELAY_OIDC_ISSUER is set but no EREVOS_RELAY_TOKENS, nobody may sign in"
        ),
        (_, None) => {}
    }
    let Some(most_coupons) = number("EREVOS_RELAY_MAX_COUPONS", coupons::MAX_LINES as u64, 1) else {
        return ExitCode::FAILURE;
    };
    let issuer = match env::var("EREVOS_RELAY_COUPON_KEY").ok().filter(|v| !v.trim().is_empty()) {
        Some(path) => match coupons::read_issuer(Path::new(&path)) {
            Ok(issuer) => Some(issuer),
            Err(e) => {
                elog!("erevos-relay: cannot use the key for coupons: {e}");
                return ExitCode::FAILURE;
            }
        },
        None => None,
    };
    let trusted = match env::var("EREVOS_RELAY_COUPON_ISSUERS").ok().filter(|v| !v.trim().is_empty()) {
        Some(_) if phones.is_none() => {
            elog!("erevos-relay: EREVOS_RELAY_COUPON_ISSUERS is set but no EREVOS_RELAY_TOKENS, no coupon is taken");
            Vec::new()
        }
        Some(path) => match coupons::read_issuers(Path::new(&path)) {
            Ok(keys) => keys,
            Err(e) => {
                elog!("erevos-relay: cannot read the issuers of coupons: {e}");
                return ExitCode::FAILURE;
            }
        },
        None => Vec::new(),
    };
    if issuer.is_some() || !trusted.is_empty() {
        let kept = phones.as_ref().map(|path| PathBuf::from(format!("{path}.coupons")));
        let signs = issuer.is_some();
        let takes = trusted.len();
        let most = most_coupons.try_into().unwrap_or(usize::MAX);
        match coupons::Coupons::open(issuer, trusted, kept.as_deref(), most) {
            Ok(coupons) => {
                if signs {
                    elog!("erevos-relay: phones with tokens of their own may have coupons signed, for a token on another relay");
                }
                if takes > 0 {
                    elog!("erevos-relay: coupons of {takes} issuers are taken, {most} lines from coupons at most");
                }
                let _ = store.coupons.set(coupons);
            }
            Err(e) => {
                elog!("erevos-relay: cannot read the coupons: {e}");
                return ExitCode::FAILURE;
            }
        }
    }
    if let Some(value) = env::var("EREVOS_RELAY_PAIR").ok().filter(|v| !v.trim().is_empty()) {
        match coupons::pair_of(&value) {
            Ok(pair) => {
                if store.coupons.get().is_some_and(|coupons| coupons.signs()) {
                    elog!(
                        "erevos-relay: phones with tokens of their own are told to take {} as their home relay, through Tor",
                        pair.join(", ")
                    );
                } else {
                    elog!("erevos-relay: EREVOS_RELAY_PAIR is set but no EREVOS_RELAY_COUPON_KEY, no phone is told it");
                }
                let _ = store.pair.set(pair);
            }
            Err(e) => {
                elog!("erevos-relay: EREVOS_RELAY_PAIR: {e}");
                return ExitCode::FAILURE;
            }
        }
    }
    let lending = match lend::wanted(env::var("EREVOS_RELAY_LEND").ok().as_deref()) {
        Ok(on) => on,
        Err(e) => {
            elog!("erevos-relay: {e}");
            return ExitCode::FAILURE;
        }
    };
    match (&store.key, lending) {
        (Some(key), true) => {
            // Lending needs the key, so what it keeps goes beside the key's file.
            let key_path = env::var("EREVOS_RELAY_KEY").unwrap_or_default();
            let counts = format!("{key_path}.lent-counts");
            let revoked = env::var("EREVOS_RELAY_LEND_REVOKED")
                .ok()
                .filter(|path| !path.is_empty())
                .unwrap_or_else(|| format!("{key_path}.revoked"));
            let list = lend::Revoked::new(PathBuf::from(&revoked));
            match lend::Lend::open(key, Path::new(&counts), list) {
                Ok(lend) => {
                    elog!("erevos-relay: lending places to phones without a relay, counting them in {counts}, revoked tickets in {revoked}");
                    // Read now, so what it holds, and a line it cannot read, is said at start.
                    if let Some(revoked) = lend.revoked() {
                        revoked.count();
                    }
                    let _ = store.lend.set(lend);
                }
                Err(e) => {
                    elog!("erevos-relay: cannot read the counts of lent places {counts}: {e}");
                    return ExitCode::FAILURE;
                }
            }
        }
        (None, true) => elog!(
            "erevos-relay: EREVOS_RELAY_LEND=on but no EREVOS_RELAY_KEY set, no places are lent"
        ),
        (_, false) => elog!(
            "erevos-relay: no EREVOS_RELAY_LEND=on set, no places are lent to phones without a relay"
        ),
    }
    // Before the requests held for later run: a message they send pushes too.
    match env::var("EREVOS_RELAY_PUSH_KEY") {
        Ok(path) if !path.is_empty() => {
            let key = match push::load_key(Path::new(&path)) {
                Ok(key) => key,
                Err(e) => {
                    elog!("erevos-relay: cannot use the push key file {path}: {e}");
                    return ExitCode::FAILURE;
                }
            };
            let subject = match env::var("EREVOS_RELAY_PUSH_SUBJECT")
                .ok()
                .filter(|s| s.starts_with("mailto:") || s.starts_with("https://"))
            {
                Some(subject) => subject,
                None => {
                    elog!("erevos-relay: no EREVOS_RELAY_PUSH_SUBJECT set, or not a mailto: or https: address, so push services are given mailto:erevos-relay@invalid");
                    "mailto:erevos-relay@invalid".to_string()
                }
            };
            let mut allowed: Vec<String> =
                push::PUSH_SERVICES.iter().map(|s| s.to_string()).collect();
            let more = env::var("EREVOS_RELAY_PUSH_SERVICES").unwrap_or_default();
            for service in more
                .split(|c: char| c == ',' || c.is_whitespace())
                .filter(|s| !s.is_empty())
            {
                if push::is_service(service) {
                    elog!("erevos-relay: push addresses at {service} are taken too");
                    allowed.push(service.to_string());
                } else {
                    elog!("erevos-relay: EREVOS_RELAY_PUSH_SERVICES: {service:?} is not an https: origin ending in /, so it is left out");
                }
            }
            let addresses = format!("{path}.addresses");
            match push::Push::new(key, subject, allowed, Some(addresses.clone().into())) {
                Ok(push) => {
                    elog!(
                        "erevos-relay: web apps may ask for notifications, {} push addresses for {} queues kept in {addresses}",
                        push.addresses(),
                        push.len()
                    );
                    let _ = store.push.set(push);
                }
                Err(e) => {
                    elog!("erevos-relay: cannot read the push addresses beside {path}: {e}");
                    return ExitCode::FAILURE;
                }
            }
        }
        _ => elog!(
            "erevos-relay: no EREVOS_RELAY_PUSH_KEY set, web apps cannot ask for notifications"
        ),
    }
    match env::var("EREVOS_RELAY_XMPP_PUSH") {
        Ok(domain) if !domain.is_empty() => {
            let path = |name: &str| env::var(name).ok().filter(|p| !p.is_empty());
            let (Some(cert), Some(key)) = (
                path("EREVOS_RELAY_XMPP_PUSH_CERT"),
                path("EREVOS_RELAY_XMPP_PUSH_KEY"),
            ) else {
                elog!("erevos-relay: EREVOS_RELAY_XMPP_PUSH needs EREVOS_RELAY_XMPP_PUSH_CERT and EREVOS_RELAY_XMPP_PUSH_KEY, its certificate chain and key in PEM");
                return ExitCode::FAILURE;
            };
            let push = match xmpp_push::XmppPush::new(&domain, cert.into(), key.into()) {
                Ok(push) => Arc::new(push),
                Err(e) => {
                    elog!("erevos-relay: cannot take XMPP pushes as {domain}: {e}");
                    return ExitCode::FAILURE;
                }
            };
            let addr = path("EREVOS_RELAY_XMPP_PUSH_ADDR")
                .unwrap_or_else(|| xmpp_push::DEFAULT_ADDR.to_string());
            let listener = match TcpListener::bind(&addr) {
                Ok(listener) => listener,
                Err(e) => {
                    elog!("erevos-relay: cannot listen for XMPP pushes on {addr}: {e}");
                    return ExitCode::FAILURE;
                }
            };
            elog!(
                "erevos-relay: XMPP servers may push to {} on {addr}",
                push.domain()
            );
            let _ = store.xmpp_push.set(Arc::clone(&push));
            let xmpp_store = Arc::clone(&store);
            thread::spawn(move || xmpp_push::serve(listener, push, xmpp_store));
        }
        _ => elog!("erevos-relay: no EREVOS_RELAY_XMPP_PUSH set, XMPP servers cannot push"),
    }
    *store.held() = held;
    let held_store = Arc::clone(&store);
    thread::spawn(move || server::run_held(held_store));
    let sweep_store = Arc::clone(&store);
    thread::spawn(move || loop {
        thread::sleep(Duration::from_secs(60 * 60));
        server::sweep(&sweep_store);
    });
    let ws_store = Arc::clone(&store);
    thread::spawn(move || server::serve_ws(ws, ws_store, token));
    server::serve(tcp, store)
}
