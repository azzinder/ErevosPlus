// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! Signing in with an OpenID Connect provider, such as LPHL's Authentik, for
//! a token of a phone's own (see `tokens.rs`), with no token typed or passed
//! on, and the password typed only at the provider.
//!
//! 1. The phone makes a claim secret and opens the system browser at
//!    `<EREVOS_RELAY_PUBLIC_URL>/signin/start?claim=<its SHA-256 in hex>`.
//! 2. The relay sends the browser on to the provider (the authorization code
//!    flow with PKCE, S256), which sends it back to `/signin/callback` with a
//!    code. The relay takes the tokens for it, reads who signed in (`sub` from
//!    the ID token and userinfo, and the user name), and shows a page with a
//!    code of six random digits, to type in Erevos. A start link someone else
//!    made for their own claim gets them nothing: the code is on the page of
//!    whoever signed in, and `MAX_TRIES` wrong ones end the sign-in.
//!    A phone that started with `&to=app` gets a button on that page too,
//!    `erevos://signin?code=<the six digits>`, so a tap takes the code back to
//!    Erevos instead of typing it: the digits alone claim nothing without the
//!    claim secret, which never leaves the phone that started.
//! 3. Back in Erevos, the person types the code, and the phone gives it with
//!    the claim secret and the SHA-256 of a token it made, on the `/join` path
//!    (`CLAIM`, see `server.rs`). The relay adds a line for it to the file of
//!    tokens, named after the provider and the user name, unique, saying how
//!    it came:
//!
//! ```text
//! 5d41402abc4b...e2a lphl:nekten # signed in with LPHL on 2026-10-21
//! ```
//!
//! No relay token is ever in an address: only the claim secret's SHA-256 is,
//! and the provider's code, which is good once and bound to the relay by
//! PKCE. The token is made on the phone, and only its SHA-256 travels, over
//! the WebSocket. Signing in again on the same phone gives the SHA-256 of its
//! old token too, and the new line takes the place of the old one when that
//! is a line of the same account, the old one's invites being the new one's
//! from then on (see `invites.rs`). A token whose line is in the file already
//! is refused.
//!
//! For each line the relay keeps what the hourly check needs, in
//! `<file of tokens>.signins`, written before the line goes in, so no line of
//! a sign-in is ever without one: the account's `sub`, the user name, when it
//! was last checked and last found good, and the provider's refresh token,
//! sealed with AES-256-GCM under a key made from the client secret, so a copy
//! of the relay's folder alone holds none that can be used. Every hour it
//! refreshes the token (keeping the new one at once, as Authentik rotates
//! them), asks whether the new access token is active (introspection, when
//! the provider has it) and asks userinfo whose it is, and, with
//! `EREVOS_RELAY_OIDC_GROUP` set, whether the account is in that group. A
//! refresh the provider refuses (`invalid_grant`: the account closed,
//! disabled or deleted, its tokens revoked, the refresh token expired), an
//! access token that is not active, a userinfo that refuses it, names another
//! account or leaves out the group, all take the line out, and the phone is
//! refused at once, on connections open too; the phones it invited keep their
//! lines (see `invites.rs`). A provider that cannot be asked,
//! for whatever reason (down, a wrong client secret, discovery failing), keeps
//! the line until it has gone `MAX_UNCHECKED` without a good check and then
//! failed twice more, at checks an hour apart or more: then the line goes too.
//! Each line is cut only for its own checks that failed, so one that failed,
//! a relay that was off for days or a clock put forward never takes out the
//! others, and a time ahead of the clock counts as now, so a clock put back
//! stops no check. A line that cannot be taken out of the file now is refused
//! all the same and tried again at each look, its record kept and marked, so
//! a restart in between cuts it again (`cut_pending`). A line the operator
//! took out loses its record, once the file has stayed without it for a
//! minute, and its refresh token is revoked at the provider. A new client
//! secret makes the sealed tokens unreadable: those phones lose their lines at
//! their next check and sign in again.
//!
//! Sign-ins under way are kept in memory only, for 10 minutes, `MAX_FLOWS` of
//! them at each step, the oldest going for a new one: a restart in the middle
//! of one means starting again. One browser starts `MAX_STARTS` a minute at
//! most, told by its address: the connection's, or, from a proxy on the same
//! machine, the last address in `X-Forwarded-For`, which Apache and Caddy set
//! themselves.
//!
//! Not audited.

use std::collections::HashMap;
use std::fs;
use std::io::{self, ErrorKind, Read, Write};
use std::net::{IpAddr, Ipv6Addr, SocketAddr, TcpStream};
use std::path::PathBuf;
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant};

use aes_gcm::aead::{AeadInPlace, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce, Tag};
use hkdf::Hkdf;
use rand::RngCore;
use serde_json::Value;
use sha2::{Digest, Sha256};

use crate::invites::{date, safe_name, Invites};
use crate::journal;
use crate::lock::lock;
use crate::oidc::{self, Config, Failure, Provider};
use crate::pages::{self, Lang};
use crate::push::b64url;
use crate::tokens::{short, Tokens};

/// How long a sign-in may take, from the start in the browser to the claim,
/// seconds.
const FLOW_SECS: u64 = 10 * 60;
/// Sign-ins under way at once, at each step.
const MAX_FLOWS: usize = 4096;
/// Sign-ins one browser's address may start a minute.
const MAX_STARTS: u32 = 10;
/// Phones the relay keeps signed in at most.
pub const MAX_SIGNINS: usize = 1_000;
/// Phones one account may have signed in.
pub const MAX_PHONES: usize = 10;
/// How often each line is checked with the provider, seconds.
pub const CHECK_EVERY: u64 = 3600;
/// How often the relay looks for lines due a check.
pub const LOOK_EVERY: Duration = Duration::from_secs(5 * 60);
/// How long a line stays with no good check, seconds: then it goes, whatever
/// kept the provider from answering, once two more checks of its own failed,
/// `CHECK_EVERY` apart or more.
pub const MAX_UNCHECKED: u64 = 72 * 3600;
/// Checks that may fail in one look before the rest wait for the next: those
/// past `MAX_UNCHECKED` are still asked after one failed, each for itself, up
/// to so many.
const FAILED_A_LOOK: usize = 5;
/// Wrong codes a sign-in takes before it ends.
pub const MAX_TRIES: u8 = 5;
/// The longest user name kept, in characters.
const MAX_USER: usize = 64;
/// The longest `sub` and refresh token kept, bytes; a provider's are far
/// shorter.
const MAX_SUB: usize = 255;
const MAX_REFRESH: usize = 8 * 1024;
const MAX_REQUEST_HEAD: usize = 8 * 1024;
const MAX_FORM: usize = 4 * 1024;
const HEADER: &[u8; 8] = b"EREVOSS3";
/// The header of the file before records had `failed` and `cut`, still read.
const HEADER_2: &[u8; 8] = b"EREVOSS2";
const SIGNIN_LOCK: &str = "lock of the sign-ins";

/// A sign-in sent on to the provider, by its `state`.
struct Flow {
    claim: [u8; 32],
    verifier: String,
    nonce: String,
    made: u64,
    /// Started in Erevos on a phone (`to=app`): the code's page has a button back to it.
    app: bool,
}

/// A sign-in the provider let through, waiting for the phone to claim it with
/// the code its page showed.
#[derive(Clone)]
struct Done {
    sub: String,
    user: String,
    refresh: String,
    /// The six digits the page showed, in ASCII.
    code: [u8; 6],
    /// Wrong codes given so far.
    tries: u8,
    made: u64,
}

/// A claim answered, so the same claim again, whose answer was lost, gets it
/// again.
struct Claimed {
    line: [u8; 32],
    name: String,
    made: u64,
}

/// A line that came from a sign-in, with what the hourly check needs. Its
/// `Debug` leaves out who signed in and the refresh token, sealed as it is.
#[derive(Clone, PartialEq)]
struct Record {
    line: [u8; 32],
    sub: String,
    user: String,
    made: u64,
    /// When it was last checked, and last found good.
    checked: u64,
    verified: u64,
    /// When a check first failed once it was `MAX_UNCHECKED` without a good
    /// one; 0 while none did.
    failed: u64,
    /// Whether its line is to go: the relay took it out, or tries to.
    cut: bool,
    /// The refresh token, sealed: nonce, then ciphertext and tag.
    sealed: Vec<u8>,
}

impl std::fmt::Debug for Record {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Record")
            .field("made", &self.made)
            .field("checked", &self.checked)
            .field("verified", &self.verified)
            .field("failed", &self.failed)
            .field("cut", &self.cut)
            .finish_non_exhaustive()
    }
}

#[derive(Default)]
struct State {
    flows: HashMap<String, Flow>,
    /// By the claim's SHA-256.
    ready: HashMap<[u8; 32], Done>,
    claimed: HashMap<[u8; 32], Claimed>,
    records: Vec<Record>,
    /// Sign-ins started this minute by each browser's address: since when,
    /// and how many.
    starts: HashMap<IpAddr, (u64, u32)>,
}

impl State {
    fn expire(&mut self, now: u64) {
        let live = |made: u64| made + FLOW_SECS > now;
        self.flows.retain(|_, f| live(f.made));
        self.ready.retain(|_, d| live(d.made));
        self.claimed.retain(|_, c| live(c.made));
        self.starts.retain(|_, (since, _)| *since + 60 > now);
    }
}

/// Makes room in `map` for one more, at most `MAX_FLOWS`, by dropping the
/// oldest: whoever starts many sign-ins only pushes the oldest out.
fn room<K: Clone + Eq + std::hash::Hash, V>(map: &mut HashMap<K, V>, made: impl Fn(&V) -> u64) {
    while map.len() >= MAX_FLOWS {
        let Some(oldest) = map
            .iter()
            .min_by_key(|(_, v)| made(v))
            .map(|(k, _)| k.clone())
        else {
            return;
        };
        map.remove(&oldest);
    }
}

/// Why a claim was not answered with a line.
#[derive(Debug, PartialEq)]
pub enum ClaimError {
    /// Nothing was signed in with that claim, yet or any more.
    NotFound,
    /// Not the code the page showed; so many tries are left, and at none the
    /// sign-in is over.
    Wrong(u8),
    /// The account has all the phones it may, or the relay all the sign-ins.
    Full,
    /// The file has a line for that token already.
    Taken,
    /// The line could not be written.
    Storage,
}

pub struct SignIn {
    provider: Provider,
    /// What starts each line's name: the provider's name, made safe.
    prefix: String,
    key: [u8; 32],
    path: Option<PathBuf>,
    state: Mutex<State>,
}

/// How far the provider's clock may be ahead of or behind the relay's, for `exp`.
const CLOCK_SKEW: u64 = 5 * 60;

/// Whether an ID token's claims are for this sign-in (OpenID Connect Core 3.1.3.7): from the
/// provider (`iss`), for this client (`aud`, and `azp` when it names others too, or names any
/// party at all), with this flow's `nonce`, not expired (`exp`, required) and naming someone (`sub`).
fn id_token_fits(claims: &Value, issuer: &str, client_id: &str, nonce: &str, now: u64) -> bool {
    let from = claims["iss"].as_str().unwrap_or_default();
    let (audience, others) = match &claims["aud"] {
        Value::String(one) => (one == client_id, false),
        Value::Array(all) => (
            all.iter().any(|a| a.as_str() == Some(client_id)),
            all.iter().any(|a| a.as_str() != Some(client_id)),
        ),
        _ => (false, false),
    };
    let party = match claims.get("azp") {
        Some(azp) => azp.as_str() == Some(client_id),
        None => !others,
    };
    let fresh = claims["exp"]
        .as_f64()
        .is_some_and(|exp| exp.is_finite() && exp + CLOCK_SKEW as f64 > now as f64);
    from.trim_end_matches('/') == issuer.trim_end_matches('/')
        && audience
        && party
        && fresh
        && claims["nonce"].as_str() == Some(nonce)
        && !claims["sub"].as_str().unwrap_or_default().is_empty()
}

impl SignIn {
    /// Sign-ins with the provider `config` names, the lines' records kept in
    /// `path` (none: in memory only, for checks).
    pub fn open(config: Config, path: Option<PathBuf>) -> io::Result<SignIn> {
        let records = match &path {
            Some(path) => match fs::read(path) {
                Ok(bytes) => decode(&bytes).ok_or_else(|| {
                    io::Error::new(ErrorKind::InvalidData, "not a file of sign-ins")
                })?,
                Err(e) if e.kind() == ErrorKind::NotFound => Vec::new(),
                Err(e) => return Err(e),
            },
            None => Vec::new(),
        };
        let mut key = [0u8; 32];
        Hkdf::<Sha256>::new(
            Some(b"erevos relay sign-in"),
            config.client_secret.as_bytes(),
        )
        .expand(b"refresh tokens", &mut key)
        .expect("32 bytes is a length HKDF gives");
        Ok(SignIn {
            prefix: safe_name(&config.name),
            provider: Provider::new(config),
            key,
            path,
            state: Mutex::new(State {
                records,
                ..State::default()
            }),
        })
    }

    /// The provider's name, for the app's button.
    pub fn name(&self) -> &str {
        &self.provider.config.name
    }

    /// Where the app opens the browser.
    pub fn start_url(&self) -> String {
        self.provider.config.start_url()
    }

    /// Lines that came from a sign-in.
    pub fn len(&self) -> usize {
        lock(&self.state, SIGNIN_LOCK).records.len()
    }

    fn save(&self, records: &[Record]) -> io::Result<()> {
        match &self.path {
            Some(path) => journal::write_whole(path, &encode(records)?),
            None => Ok(()),
        }
    }

    /// The names of the lines of `tokens` named as this provider's sign-ins
    /// that have no record, so the hourly check never asks about them: written
    /// by hand, or left from a relay that stopped at the wrong moment. The
    /// relay says so when it starts.
    pub fn unrecorded(&self, tokens: &Tokens) -> Vec<[u8; 32]> {
        let state = lock(&self.state, SIGNIN_LOCK);
        let prefix = format!("{}:", self.prefix);
        let mut lines: Vec<[u8; 32]> = tokens
            .lines()
            .into_iter()
            .filter(|(line, name)| {
                name.starts_with(&prefix) && !state.records.iter().any(|r| &r.line == line)
            })
            .map(|(line, _)| line)
            .collect();
        lines.sort();
        lines
    }

    /// Answers a browser's request for a sign-in page on `stream`, which
    /// comes from `peer`; then the connection ends.
    pub fn serve(
        &self,
        stream: &mut (impl Read + Write),
        peer: IpAddr,
        now: u64,
    ) -> io::Result<()> {
        let page = match read_request(stream) {
            Ok(request) => self.answer(&request, client(peer, &request.forwarded_for), now),
            Err(e) if e.kind() == ErrorKind::InvalidData => Page {
                status: 400,
                location: None,
                body: pages::message(Lang::En, pages::words(Lang::En).gone, self.name()),
            },
            Err(e) => return Err(e),
        };
        stream.write_all(&page.bytes())?;
        stream.flush()
    }

    /// The page for `request`, from the browser at `client`.
    fn answer(&self, request: &Incoming, client: IpAddr, now: u64) -> Page {
        let (path, query) = request
            .target
            .split_once('?')
            .unwrap_or((&request.target, ""));
        let query = oidc::fields(query);
        let lang = pages::lang(&request.accept_language);
        match request.method.as_str() {
            "GET" if path.ends_with("/signin/start") => self.start(&query, lang, client, now),
            "GET" if path.ends_with("/signin/callback") => self.callback(&query, lang, now),
            _ => self.say(404, lang, pages::words(lang).gone),
        }
    }

    fn say(&self, status: u16, lang: Lang, text: &str) -> Page {
        Page {
            status,
            location: None,
            body: pages::message(lang, text, self.name()),
        }
    }

    /// `/signin/start?claim=<hex>`: sends the browser on to the provider,
    /// `MAX_STARTS` times a minute at most for the browser at `client`.
    fn start(&self, query: &HashMap<String, String>, lang: Lang, client: IpAddr, now: u64) -> Page {
        let words = pages::words(lang);
        let Some(claim) = query.get("claim").and_then(|c| unhex32(c)) else {
            return self.say(400, lang, words.gone);
        };
        let client = counted_as(client);
        {
            let mut state = lock(&self.state, SIGNIN_LOCK);
            state.expire(now);
            if !state.starts.contains_key(&client) {
                room(&mut state.starts, |(since, _)| *since);
            }
            let (_, started) = state.starts.entry(client).or_insert((now, 0));
            if *started >= MAX_STARTS {
                return self.say(429, lang, words.busy);
            }
            *started += 1;
        }
        let verifier = b64url(&random::<32>());
        let challenge = b64url(&Sha256::digest(verifier.as_bytes()));
        let id = b64url(&random::<32>());
        let nonce = b64url(&random::<16>());
        {
            let mut state = lock(&self.state, SIGNIN_LOCK);
            state.expire(now);
            room(&mut state.flows, |f| f.made);
            state.flows.insert(
                id.clone(),
                Flow {
                    claim,
                    verifier,
                    nonce: nonce.clone(),
                    made: now,
                    app: query.get("to").is_some_and(|to| to == "app"),
                },
            );
        }
        match self.provider.authorize_url(&id, &nonce, &challenge) {
            Ok(url) => Page {
                status: 302,
                location: Some(url),
                body: String::new(),
            },
            Err(e) => {
                elog!(
                    "erevos-relay: cannot start a sign-in with {}: {e}",
                    self.name()
                );
                lock(&self.state, SIGNIN_LOCK).flows.remove(&id);
                self.say(502, lang, words.failed)
            }
        }
    }

    /// `/signin/callback?code=...&state=...`: takes the tokens for the code
    /// and shows the code to type in Erevos.
    fn callback(&self, query: &HashMap<String, String>, lang: Lang, now: u64) -> Page {
        let words = pages::words(lang);
        let flow = query.get("state").and_then(|id| {
            let mut state = lock(&self.state, SIGNIN_LOCK);
            state.expire(now);
            state.flows.remove(id)
        });
        let Some(flow) = flow else {
            return self.say(400, lang, words.gone);
        };
        if let Some(error) = query.get("error") {
            if error == "access_denied" {
                return self.say(200, lang, words.cancelled);
            }
            elog!(
                "erevos-relay: {} did not let a sign-in through: {}",
                self.name(),
                error_word(error)
            );
            return self.say(502, lang, words.failed);
        }
        let who = query
            .get("code")
            .ok_or_else(|| Failure::Later("no code".to_string()))
            .and_then(|code| self.who(code, &flow));
        let (sub, user, refresh) = match who {
            Ok(who) => who,
            Err(Failure::Refused(why)) => {
                elog!(
                    "erevos-relay: {} let a sign-in through that may not use the relay: {why}",
                    self.name()
                );
                return self.say(403, lang, words.refused);
            }
            Err(e) => {
                elog!(
                    "erevos-relay: a sign-in with {} did not work: {e}",
                    self.name()
                );
                return self.say(502, lang, words.failed);
            }
        };
        let code = new_code();
        {
            let mut state = lock(&self.state, SIGNIN_LOCK);
            state.expire(now);
            // The first sign-in for a claim is the one it gets: someone who saw the claim's
            // SHA-256 in the address cannot put an account of theirs in its place.
            if state.ready.contains_key(&flow.claim) || state.claimed.contains_key(&flow.claim) {
                return self.say(400, lang, words.gone);
            }
            room(&mut state.ready, |d| d.made);
            state.ready.insert(
                flow.claim,
                Done {
                    sub,
                    user: user.clone(),
                    refresh,
                    code,
                    tries: 0,
                    made: now,
                },
            );
        }
        let shown = String::from_utf8_lossy(&code);
        let spaced = format!("{} {}", &shown[..3], &shown[3..]);
        Page {
            status: 200,
            location: None,
            body: if flow.app {
                pages::code_to_app(lang, &user, self.name(), &spaced, &shown)
            } else {
                pages::code(lang, &user, self.name(), &spaced)
            },
        }
    }

    /// Who signed in with `code`: their `sub`, user name and refresh token.
    fn who(&self, code: &str, flow: &Flow) -> Result<(String, String, String), Failure> {
        let config = &self.provider.config;
        let got = self.provider.exchange(code, &flow.verifier)?;
        let refresh = got.refresh.ok_or_else(|| {
            Failure::Later("it gave no refresh token: let the client have offline_access".into())
        })?;
        let claims = got
            .id_token
            .as_deref()
            .and_then(oidc::id_claims)
            .ok_or_else(|| Failure::Later("it gave no ID token".into()))?;
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_or(0, |d| d.as_secs());
        if !id_token_fits(&claims, &config.issuer, &config.client_id, &flow.nonce, now) {
            return Err(Failure::Later(
                "its ID token is not for this sign-in".into(),
            ));
        }
        let sub = claims["sub"].as_str().unwrap_or_default().to_string();
        if sub.len() > MAX_SUB || refresh.len() > MAX_REFRESH {
            return Err(Failure::Later(
                "its sub or refresh token is too long to keep".into(),
            ));
        }
        let info = self.provider.userinfo(&got.access)?;
        if info["sub"].as_str() != Some(&sub) {
            return Err(Failure::Later("userinfo names another account".into()));
        }
        if !config.in_group(&info) {
            return Err(Failure::Refused(format!(
                "the account is not in the group {:?}",
                config.group.as_deref().unwrap_or_default()
            )));
        }
        let user: String = ["preferred_username", "nickname"]
            .iter()
            .find_map(|name| info[*name].as_str().or(claims[*name].as_str()))
            .filter(|user| !user.trim().is_empty())
            .unwrap_or(sub.as_str())
            .trim()
            .chars()
            .take(MAX_USER)
            .collect();
        Ok((sub, user, refresh))
    }

    /// The phone's claim: adds the line for the token whose SHA-256 is `line`,
    /// to the account signed in with `secret` whose page showed `code`, and
    /// returns its name. With `old`, the SHA-256 of the phone's token before,
    /// its line goes when it is one of the same account's, and the phones it
    /// invited are the new line's (`invites`). The record goes down before the
    /// line goes in, and is taken back if the line cannot go in.
    #[allow(clippy::too_many_arguments)]
    pub fn claim(
        &self,
        secret: &[u8; 32],
        line: &[u8; 32],
        old: &[u8; 32],
        code: &[u8; 6],
        tokens: &Tokens,
        invites: Option<&Invites>,
        now: u64,
    ) -> Result<String, ClaimError> {
        let claim: [u8; 32] = Sha256::digest(secret).into();
        let mut state = lock(&self.state, SIGNIN_LOCK);
        state.expire(now);
        if let Some(claimed) = state.claimed.get(&claim) {
            return if &claimed.line == line && tokens.holds(line) {
                Ok(claimed.name.clone())
            } else {
                Err(ClaimError::NotFound)
            };
        }
        let Some(done) = state.ready.get_mut(&claim) else {
            return Err(ClaimError::NotFound);
        };
        if !same(&done.code, code) {
            done.tries += 1;
            let left = MAX_TRIES.saturating_sub(done.tries);
            if left == 0 {
                state.ready.remove(&claim);
            }
            return Err(ClaimError::Wrong(left));
        }
        let done = done.clone();
        let instead = state
            .records
            .iter()
            .find(|r| &r.line == old && r.sub == done.sub && tokens.holds(&r.line))
            .cloned();
        let others = state
            .records
            .iter()
            .filter(|r| r.sub == done.sub && Some(r.line) != instead.as_ref().map(|i| i.line))
            .filter(|r| tokens.holds(&r.line))
            .count();
        if others >= MAX_PHONES || (instead.is_none() && state.records.len() >= MAX_SIGNINS) {
            return Err(ClaimError::Full);
        }
        if tokens.holds(line) {
            return Err(ClaimError::Taken);
        }
        let before = state.records.clone();
        let mut records: Vec<Record> = before.iter().filter(|r| &r.line != line).cloned().collect();
        records.push(Record {
            line: *line,
            sub: done.sub,
            user: done.user.clone(),
            made: now,
            checked: now,
            verified: now,
            failed: 0,
            cut: false,
            sealed: seal(&self.key, line, &done.refresh),
        });
        self.save(&records).map_err(|e| {
            elog!("erevos-relay: cannot write the sign-ins: {e}");
            ClaimError::Storage
        })?;
        let undo = |why: ClaimError| {
            if let Err(e) = self.save(&before) {
                // A record with no line is forgotten at its first check.
                elog!("erevos-relay: cannot write the sign-ins: {e}");
            }
            why
        };
        // The move of the old line's invites is written down before the new line goes in, so a
        // relay that stops in between finishes it at its next start, and the phone keeps them all.
        let moving = match (&instead, invites) {
            (Some(old), Some(invites)) => {
                if let Err(e) = invites.moving(&old.line, line) {
                    elog!("erevos-relay: cannot write the invites: {e}");
                    return Err(undo(ClaimError::Storage));
                }
                Some((invites, old.line))
            }
            _ => None,
        };
        let wanted = format!("{}:{}", self.prefix, safe_name(&done.user));
        let note = format!("signed in with {} on {}", self.name(), date(now));
        let added = tokens.add(
            line,
            &wanted,
            true,
            &note,
            instead.as_ref().map(|i| &i.line),
        );
        let name = match added {
            Ok(name) => name,
            Err(e) => {
                if let Some((invites, old)) = moving {
                    invites.not_moved(&old, line);
                }
                return Err(undo(if e.kind() == ErrorKind::AlreadyExists {
                    ClaimError::Taken
                } else {
                    ClaimError::Storage
                }));
            }
        };
        if let Some((invites, old)) = moving {
            invites.moved(&old, line);
        }
        // The record of the line replaced goes now that its line has gone.
        records.retain(|r| Some(r.line) != instead.as_ref().map(|i| i.line));
        if let Err(e) = self.save(&records) {
            elog!("erevos-relay: cannot write the sign-ins: {e}");
        }
        state.records = records;
        state.ready.remove(&claim);
        state.claimed.insert(
            claim,
            Claimed {
                line: *line,
                name: name.clone(),
                made: now,
            },
        );
        drop(state);
        if let Some(refresh) = instead.and_then(|old| unseal(&self.key, &old.line, &old.sealed)) {
            self.provider.revoke(&refresh);
        }
        Ok(name)
    }

    /// Checks with the provider each line last checked `CHECK_EVERY` ago or
    /// more, oldest first, one at a time. Once one could not be checked now,
    /// the rest are asked about only if gone `MAX_UNCHECKED` with no good
    /// check, each for itself, until `FAILED_A_LOOK` failed; the others wait
    /// for the next look, so a provider that is down is asked a few times a
    /// look rather than once a line, and no line is cut for another's check.
    /// Lines to cut that could not be taken out of the file before are tried
    /// again. A time ahead of the clock, as after the clock was put back,
    /// counts as now. The relay calls this now and then (`LOOK_EVERY`).
    pub fn check(&self, tokens: &Tokens, now: u64) {
        let due: Vec<[u8; 32]> = {
            let mut state = lock(&self.state, SIGNIN_LOCK);
            state.expire(now);
            let mut records = state.records.clone();
            let mut ahead = false;
            for record in &mut records {
                for at in [
                    &mut record.checked,
                    &mut record.verified,
                    &mut record.failed,
                ] {
                    if *at > now {
                        *at = now;
                        ahead = true;
                    }
                }
            }
            if ahead {
                if let Err(e) = self.save(&records) {
                    elog!("erevos-relay: cannot write the sign-ins: {e}");
                }
                state.records = records;
            }
            let mut due: Vec<&Record> = state
                .records
                .iter()
                .filter(|r| r.cut || r.checked + CHECK_EVERY <= now)
                .collect();
            due.sort_by_key(|r| r.checked);
            due.iter().map(|r| r.line).collect()
        };
        let mut failed = 0;
        for line in due {
            if !self.check_one(&line, tokens, now, failed) {
                failed += 1;
            }
        }
    }

    /// Cuts again the lines marked to go whose line is still in the file: the
    /// relay stopped before it could take them out. The relay calls this
    /// when it starts.
    pub fn cut_pending(&self, tokens: &Tokens) {
        let cut: Vec<[u8; 32]> = lock(&self.state, SIGNIN_LOCK)
            .records
            .iter()
            .filter(|r| r.cut)
            .map(|r| r.line)
            .collect();
        for line in cut {
            self.cut(&line, tokens);
        }
    }

    /// Checks `line`, after `failed` checks that could not be done in this
    /// look; false when the provider could not answer now.
    fn check_one(&self, line: &[u8; 32], tokens: &Tokens, now: u64, failed: usize) -> bool {
        let Some(record) = self.record(line) else {
            return true;
        };
        let refresh = unseal(&self.key, line, &record.sealed);
        if tokens.gone(line) {
            // The operator took the line out, or the relay did.
            self.forget(line);
            if let Some(refresh) = refresh {
                self.provider.revoke(&refresh);
            }
            return true;
        }
        if record.cut {
            self.cut(line, tokens);
            return true;
        }
        if !tokens.holds(line) {
            // In the file but refused, or read halfway through a save: asked about at the next look.
            return true;
        }
        let Some(refresh) = refresh else {
            elog!(
                "erevos-relay: the refresh token of the sign-in of the line {} cannot be read (was the client secret changed?), so the line goes and its phone signs in again",
                short(line)
            );
            self.cut(line, tokens);
            return true;
        };
        let overdue = record.verified + MAX_UNCHECKED <= now;
        if failed > 0 && (!overdue || failed >= FAILED_A_LOOK) {
            return true;
        }
        match self.verify(line, &record, &refresh) {
            Ok(()) => {
                self.update(line, |r| {
                    r.checked = now;
                    r.verified = now;
                    r.failed = 0;
                });
                true
            }
            Err(Failure::Refused(why)) => {
                elog!(
                    "erevos-relay: {} no longer lets the line {} in ({why}), so it goes",
                    self.name(),
                    short(line)
                );
                self.cut(line, tokens);
                true
            }
            Err(Failure::Later(why))
                if overdue && record.failed != 0 && record.failed + CHECK_EVERY <= now =>
            {
                elog!(
                    "erevos-relay: the sign-in of the line {} was not found good for {} hours, and {} still cannot be asked, at checks an hour apart ({why}), so the line goes",
                    short(line),
                    MAX_UNCHECKED / 3600,
                    self.name()
                );
                self.cut(line, tokens);
                false
            }
            Err(Failure::Later(why)) => {
                elog!(
                    "erevos-relay: cannot check the sign-in of the line {} with {} now, trying again in an hour: {why}",
                    short(line),
                    self.name()
                );
                self.update(line, |r| {
                    r.checked = now;
                    if overdue && r.failed == 0 {
                        r.failed = now;
                    }
                });
                false
            }
        }
    }

    /// Asks the provider whether the account of `record` may still sign in:
    /// a refresh, whose new refresh token is kept at once, then
    /// introspection, when the provider has it, and userinfo.
    fn verify(&self, line: &[u8; 32], record: &Record, refresh: &str) -> Result<(), Failure> {
        let got = self.provider.refresh(refresh)?;
        // The new refresh token first: the provider takes no other from now on.
        if let Some(new) = got.refresh.as_deref().filter(|new| *new != refresh) {
            if new.len() > MAX_REFRESH {
                return Err(Failure::Refused(
                    "its refresh token is too long to keep".into(),
                ));
            }
            self.update(line, |r| r.sealed = seal(&self.key, line, new));
        }
        if self.provider.active(&got.access)? == Some(false) {
            return Err(Failure::Refused("its token is not active".into()));
        }
        let info = self.provider.userinfo(&got.access)?;
        if info["sub"].as_str() != Some(&record.sub) {
            return Err(Failure::Refused("userinfo names another account".into()));
        }
        if !self.provider.config.in_group(&info) {
            return Err(Failure::Refused(format!(
                "not in the group {:?}",
                self.provider.config.group.as_deref().unwrap_or_default()
            )));
        }
        Ok(())
    }

    fn record(&self, line: &[u8; 32]) -> Option<Record> {
        let state = lock(&self.state, SIGNIN_LOCK);
        state.records.iter().find(|r| &r.line == line).cloned()
    }

    /// Makes `change` to the record of `line`, and writes the records down.
    fn update(&self, line: &[u8; 32], change: impl FnOnce(&mut Record)) {
        let mut state = lock(&self.state, SIGNIN_LOCK);
        let mut records = state.records.clone();
        let Some(record) = records.iter_mut().find(|r| &r.line == line) else {
            return;
        };
        change(record);
        if let Err(e) = self.save(&records) {
            elog!("erevos-relay: cannot write the sign-ins: {e}");
        }
        state.records = records;
    }

    /// Drops the record of `line`, whose line is gone.
    fn forget(&self, line: &[u8; 32]) {
        let mut state = lock(&self.state, SIGNIN_LOCK);
        let mut records = state.records.clone();
        records.retain(|r| &r.line != line);
        if let Err(e) = self.save(&records) {
            elog!("erevos-relay: cannot write the sign-ins: {e}");
        }
        state.records = records;
    }

    /// Takes `line` out of the file of tokens, and no other line, and then
    /// its record. The record is marked to go and written down first,
    /// and kept until the line is surely out of the file: when the file
    /// cannot be written, the file of tokens refuses the line meanwhile, each
    /// look tries again, and a relay restarted before then cuts it again
    /// (`cut_pending`).
    fn cut(&self, line: &[u8; 32], tokens: &Tokens) {
        self.update(line, |r| r.cut = true);
        match tokens.remove(line) {
            Ok(_) if tokens.gone(line) => self.forget(line),
            Ok(_) => {}
            Err(e) => elog!("erevos-relay: cannot take a line out of the file of tokens now, so it is refused until the next look takes it out: {e}"),
        }
    }
}

/// A new code for a sign-in's page: six random digits, in ASCII.
fn new_code() -> [u8; 6] {
    let n = u64::from_be_bytes(random::<8>()) % 1_000_000;
    let mut code = [0u8; 6];
    for (i, digit) in code.iter_mut().enumerate() {
        *digit = b'0' + (n / 10u64.pow(5 - i as u32) % 10) as u8;
    }
    code
}

/// Whether `a` and `b` are the same, taking as long whatever they hold.
fn same(a: &[u8; 6], b: &[u8; 6]) -> bool {
    a.iter().zip(b).fold(0u8, |diff, (x, y)| diff | (x ^ y)) == 0
}

/// Whether a connection to the WebSocket port asks for a sign-in page: its
/// request line, read without taking it, so a WebSocket handshake goes on as
/// before. Waits for the line until `deadline`.
pub fn is_page(stream: &TcpStream, deadline: Instant) -> io::Result<bool> {
    let mut buf = [0u8; 512];
    loop {
        let left = deadline.saturating_duration_since(Instant::now());
        if left.is_zero() {
            return Err(ErrorKind::TimedOut.into());
        }
        stream.set_read_timeout(Some(left))?;
        let n = stream.peek(&mut buf)?;
        if n == 0 {
            return Ok(false);
        }
        let seen = &buf[..n];
        let end = seen.windows(2).position(|w| w == b"\r\n");
        if end.is_some() || n == buf.len() {
            return Ok(page_line(&seen[..end.unwrap_or(n)]));
        }
        thread::sleep(Duration::from_millis(10));
    }
}

fn page_line(line: &[u8]) -> bool {
    let line = String::from_utf8_lossy(line);
    let mut parts = line.split(' ');
    matches!(parts.next(), Some("GET" | "POST"))
        && parts.next().is_some_and(|target| {
            target
                .split('?')
                .next()
                .unwrap_or_default()
                .contains("/signin/")
        })
}

/// A browser's request, as much of it as the pages need.
struct Incoming {
    method: String,
    target: String,
    accept_language: String,
    /// Every `X-Forwarded-For` it came with, as one list.
    forwarded_for: String,
    body: Vec<u8>,
}

/// The address of the browser a request on a connection from `peer` came
/// from: `peer`, unless that is this machine, a proxy in front of the relay,
/// which puts the address it took the request from last in
/// `X-Forwarded-For` (Apache adds it after any the request came with, Caddy
/// sets it), so that one is taken.
fn client(peer: IpAddr, forwarded_for: &str) -> IpAddr {
    let forwarded = forwarded_for.rsplit(',').next().and_then(|last| {
        let last = last.trim();
        last.parse::<IpAddr>()
            .ok()
            .or_else(|| last.parse::<SocketAddr>().ok().map(|addr| addr.ip()))
    });
    match forwarded {
        Some(ip) if peer.is_loopback() => ip,
        _ => peer,
    }
}

/// The address `ip` counts as for `MAX_STARTS`: an IPv6 address as its /64,
/// which one machine may have whole.
fn counted_as(ip: IpAddr) -> IpAddr {
    match ip {
        IpAddr::V6(v6) => match v6.to_ipv4_mapped() {
            Some(v4) => IpAddr::V4(v4),
            None => {
                let s = v6.segments();
                IpAddr::V6(Ipv6Addr::new(s[0], s[1], s[2], s[3], 0, 0, 0, 0))
            }
        },
        v4 => v4,
    }
}

fn read_request(stream: &mut impl Read) -> io::Result<Incoming> {
    let invalid = |why: &str| io::Error::new(ErrorKind::InvalidData, why.to_string());
    let mut data = Vec::new();
    let mut buf = [0u8; 2048];
    loop {
        let n = stream.read(&mut buf)?;
        if n == 0 {
            return Err(ErrorKind::UnexpectedEof.into());
        }
        data.extend_from_slice(&buf[..n]);
        let mut headers = [httparse::EMPTY_HEADER; 64];
        let mut request = httparse::Request::new(&mut headers);
        let at = match request.parse(&data).map_err(|_| invalid("not HTTP"))? {
            httparse::Status::Complete(at) => at,
            httparse::Status::Partial if data.len() < MAX_REQUEST_HEAD => continue,
            httparse::Status::Partial => return Err(invalid("HTTP head too long")),
        };
        let header = |name: &str| {
            request
                .headers
                .iter()
                .find(|h| h.name.eq_ignore_ascii_case(name))
                .map(|h| String::from_utf8_lossy(h.value).to_string())
                .unwrap_or_default()
        };
        let forwarded_for: Vec<String> = request
            .headers
            .iter()
            .filter(|h| h.name.eq_ignore_ascii_case("x-forwarded-for"))
            .map(|h| String::from_utf8_lossy(h.value).to_string())
            .collect();
        let length: usize = match header("content-length").trim() {
            "" => 0,
            text => text.parse().map_err(|_| invalid("bad Content-Length"))?,
        };
        if length > MAX_FORM {
            return Err(invalid("too long"));
        }
        let mut incoming = Incoming {
            method: request.method.unwrap_or_default().to_string(),
            target: request.path.unwrap_or_default().to_string(),
            accept_language: header("accept-language"),
            forwarded_for: forwarded_for.join(","),
            body: data[at..].to_vec(),
        };
        while incoming.body.len() < length {
            let n = stream.read(&mut buf)?;
            if n == 0 {
                return Err(ErrorKind::UnexpectedEof.into());
            }
            incoming.body.extend_from_slice(&buf[..n]);
        }
        incoming.body.truncate(length);
        return Ok(incoming);
    }
}

/// A page's answer.
struct Page {
    status: u16,
    location: Option<String>,
    body: String,
}

impl Page {
    fn bytes(&self) -> Vec<u8> {
        let reason = match self.status {
            200 => "OK",
            302 => "Found",
            400 => "Bad Request",
            403 => "Forbidden",
            404 => "Not Found",
            429 => "Too Many Requests",
            502 => "Bad Gateway",
            _ => "Service Unavailable",
        };
        let location = self
            .location
            .as_ref()
            .map(|url| format!("Location: {url}\r\n"))
            .unwrap_or_default();
        format!(
            "HTTP/1.1 {} {reason}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nCache-Control: no-store\r\nContent-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'\r\nReferrer-Policy: no-referrer\r\nX-Content-Type-Options: nosniff\r\nX-Frame-Options: DENY\r\n{location}Connection: close\r\n\r\n{}",
            self.status,
            self.body.len(),
            self.body
        )
        .into_bytes()
    }
}

fn random<const N: usize>() -> [u8; N] {
    let mut bytes = [0u8; N];
    rand::rngs::OsRng.fill_bytes(&mut bytes);
    bytes
}

fn unhex32(text: &str) -> Option<[u8; 32]> {
    let text = text.trim();
    if text.len() != 64 || !text.is_ascii() {
        return None;
    }
    let mut out = [0u8; 32];
    for (i, byte) in out.iter_mut().enumerate() {
        *byte = u8::from_str_radix(&text[2 * i..2 * i + 2], 16).ok()?;
    }
    Some(out)
}

fn seal(key: &[u8; 32], line: &[u8; 32], refresh: &str) -> Vec<u8> {
    let nonce = random::<12>();
    let mut body = refresh.as_bytes().to_vec();
    let tag = Aes256Gcm::new(key.into())
        .encrypt_in_place_detached(Nonce::from_slice(&nonce), line, &mut body)
        .expect("a refresh token is far below what AES-GCM seals");
    [&nonce[..], &body, &tag].concat()
}

fn unseal(key: &[u8; 32], line: &[u8; 32], sealed: &[u8]) -> Option<String> {
    if sealed.len() < 12 + 16 {
        return None;
    }
    let (nonce, rest) = sealed.split_at(12);
    let (body, tag) = rest.split_at(rest.len() - 16);
    let mut body = body.to_vec();
    Aes256Gcm::new(key.into())
        .decrypt_in_place_detached(
            Nonce::from_slice(nonce),
            line,
            &mut body,
            Tag::from_slice(tag),
        )
        .ok()?;
    String::from_utf8(body).ok()
}

/// `bytes` after their 2-byte length; an error past what that holds, so a
/// file is never written that cannot be read back.
fn put(out: &mut Vec<u8>, bytes: &[u8]) -> io::Result<()> {
    let len = u16::try_from(bytes.len()).map_err(|_| {
        io::Error::new(ErrorKind::InvalidInput, "too long for the file of sign-ins")
    })?;
    out.extend_from_slice(&len.to_be_bytes());
    out.extend_from_slice(bytes);
    Ok(())
}

/// The file of sign-ins: its header and the number of records (4 bytes),
/// then each record's line, when it was made, checked, found good and first
/// failed once overdue (8 bytes each), whether it is to go (1 byte), and its
/// `sub`, user name and sealed refresh token, each after a 2-byte length. A
/// file with the header before (`HEADER_2`) has neither `failed` nor `cut`.
fn encode(records: &[Record]) -> io::Result<Vec<u8>> {
    let mut out = HEADER.to_vec();
    out.extend_from_slice(&(records.len() as u32).to_be_bytes());
    for r in records {
        out.extend_from_slice(&r.line);
        out.extend_from_slice(&r.made.to_be_bytes());
        out.extend_from_slice(&r.checked.to_be_bytes());
        out.extend_from_slice(&r.verified.to_be_bytes());
        out.extend_from_slice(&r.failed.to_be_bytes());
        out.push(u8::from(r.cut));
        put(&mut out, r.sub.as_bytes())?;
        put(&mut out, r.user.as_bytes())?;
        put(&mut out, &r.sealed)?;
    }
    Ok(out)
}

fn decode(bytes: &[u8]) -> Option<Vec<Record>> {
    let (mut r, newer) = match bytes.strip_prefix(HEADER) {
        Some(r) => (r, true),
        None => (bytes.strip_prefix(HEADER_2)?, false),
    };
    let mut take = |n: usize| -> Option<&[u8]> {
        let (head, rest) = (r.get(..n)?, r.get(n..)?);
        r = rest;
        Some(head)
    };
    let count = u32::from_be_bytes(take(4)?.try_into().ok()?);
    let mut records = Vec::new();
    for _ in 0..count {
        let line: [u8; 32] = take(32)?.try_into().ok()?;
        let made = u64::from_be_bytes(take(8)?.try_into().ok()?);
        let checked = u64::from_be_bytes(take(8)?.try_into().ok()?);
        let verified = u64::from_be_bytes(take(8)?.try_into().ok()?);
        let (failed, cut) = if newer {
            let failed = u64::from_be_bytes(take(8)?.try_into().ok()?);
            let cut = match take(1)? {
                [0] => false,
                [1] => true,
                _ => return None,
            };
            (failed, cut)
        } else {
            (0, false)
        };
        let mut text = || -> Option<Vec<u8>> {
            let n = u16::from_be_bytes(take(2)?.try_into().ok()?) as usize;
            Some(take(n)?.to_vec())
        };
        let sub = String::from_utf8(text()?).ok()?;
        let user = String::from_utf8(text()?).ok()?;
        let sealed = text()?;
        records.push(Record {
            line,
            sub,
            user,
            made,
            checked,
            verified,
            failed,
            cut,
            sealed,
        });
    }
    r.is_empty().then_some(records)
}

/// The error a provider sent back with a browser, as the journal takes it:
/// any browser can send any text there, so only a short code word of `a-z`
/// and `_`, as OAuth's error codes are, and else that it was not one.
fn error_word(error: &str) -> &str {
    let word = error.bytes().all(|b| b.is_ascii_lowercase() || b == b'_');
    if word && !error.is_empty() && error.len() <= 40 {
        error
    } else {
        "an error that is not a code word"
    }
}

#[cfg(test)]
pub mod tests {
    use super::*;

    use std::collections::HashSet;
    use std::net::TcpListener;
    use std::sync::Arc;

    use crate::tokens::to_hex;

    /// A provider for checks, over plain HTTP on 127.0.0.1, that does what
    /// Authentik does with the requests the relay makes.
    pub struct Fake {
        pub url: String,
        pub state: Arc<Mutex<FakeState>>,
    }

    #[derive(Default)]
    pub struct FakeState {
        pub sub: String,
        pub user: String,
        codes: HashMap<String, (String, String)>,
        pub refresh: HashSet<String>,
        access: HashMap<String, String>,
        /// The refresh is refused, as for an account closed.
        pub refuse: bool,
        /// Introspection says no token is active, as for an account disabled.
        pub inactive: bool,
        /// Userinfo answers with this, when set.
        pub userinfo_status: Option<u16>,
        /// The token endpoint answers 503, as when down.
        pub down: bool,
        /// The next so many token requests answer 503, as when one times out.
        pub fail: u32,
        pub revoked: Vec<String>,
        /// Whether the last token request came with the right client secret.
        pub authenticated: bool,
        /// The token endpoint answers 401 `invalid_client`, as when the client
        /// secret was changed there.
        pub unauthorized: bool,
        /// The account's groups, in userinfo's `groups`, when set.
        pub groups: Option<Vec<String>>,
        /// Token requests so far.
        pub asked: u32,
        n: u32,
    }

    impl Fake {
        pub fn start() -> Fake {
            let listener = TcpListener::bind("127.0.0.1:0").unwrap();
            let url = format!("http://127.0.0.1:{}", listener.local_addr().unwrap().port());
            let state = Arc::new(Mutex::new(FakeState {
                sub: "sub-1".into(),
                user: "Nekten".into(),
                ..FakeState::default()
            }));
            let (served, base) = (Arc::clone(&state), url.clone());
            thread::spawn(move || {
                for stream in listener.incoming() {
                    let Ok(mut stream) = stream else { continue };
                    let (state, base) = (Arc::clone(&served), base.clone());
                    thread::spawn(move || {
                        if let Ok(request) = read_fake(&mut stream) {
                            let (status, body) = fake_answer(&state, &base, &request);
                            let _ = stream.write_all(
                                format!(
                                    "HTTP/1.1 {status} X\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
                                    body.len()
                                )
                                .as_bytes(),
                            );
                        }
                    });
                }
            });
            Fake { url, state }
        }

        pub fn config(&self, public_url: &str) -> Config {
            Config {
                issuer: format!("{}/application/o/erevos/", self.url),
                client_id: "erevos-id".into(),
                client_secret: "erevos-secret".into(),
                public_url: public_url.to_string(),
                name: "LPHL".into(),
                group: None,
            }
        }

        /// What the provider does in the browser: the person signs in, and it
        /// sends them back with a code. Returns that address.
        pub fn authorize(&self, location: &str) -> String {
            let (_, query) = location.split_once('?').unwrap();
            let q = oidc::fields(query);
            assert_eq!(q["response_type"], "code");
            assert_eq!(q["client_id"], "erevos-id");
            assert_eq!(q["scope"], oidc::SCOPES);
            assert_eq!(q["code_challenge_method"], "S256");
            let mut state = self.state.lock().unwrap();
            state.n += 1;
            let code = format!("code-{}", state.n);
            state.codes.insert(
                code.clone(),
                (q["code_challenge"].clone(), q["nonce"].clone()),
            );
            format!(
                "{}?{}",
                q["redirect_uri"],
                oidc::form(&[("code", &code), ("state", &q["state"])])
            )
        }
    }

    pub struct FakeRequest {
        method: String,
        path: String,
        authorization: String,
        body: String,
    }

    fn read_fake(stream: &mut TcpStream) -> io::Result<FakeRequest> {
        let mut data = Vec::new();
        let mut buf = [0u8; 4096];
        loop {
            let n = stream.read(&mut buf)?;
            if n == 0 {
                return Err(ErrorKind::UnexpectedEof.into());
            }
            data.extend_from_slice(&buf[..n]);
            let mut headers = [httparse::EMPTY_HEADER; 32];
            let mut request = httparse::Request::new(&mut headers);
            let parsed = request
                .parse(&data)
                .map_err(|_| io::Error::from(ErrorKind::InvalidData))?;
            let httparse::Status::Complete(at) = parsed else {
                continue;
            };
            let header = |name: &str| {
                request
                    .headers
                    .iter()
                    .find(|h| h.name.eq_ignore_ascii_case(name))
                    .map(|h| String::from_utf8_lossy(h.value).to_string())
                    .unwrap_or_default()
            };
            let length: usize = header("content-length").parse().unwrap_or(0);
            let (method, path) = (
                request.method.unwrap_or_default(),
                request.path.unwrap_or_default(),
            );
            let mut fake = FakeRequest {
                method: method.to_string(),
                path: path.to_string(),
                authorization: header("authorization"),
                body: String::new(),
            };
            let mut body = data[at..].to_vec();
            while body.len() < length {
                let n = stream.read(&mut buf)?;
                if n == 0 {
                    break;
                }
                body.extend_from_slice(&buf[..n]);
            }
            fake.body = String::from_utf8_lossy(&body).to_string();
            return Ok(fake);
        }
    }

    fn fake_answer(state: &Mutex<FakeState>, base: &str, request: &FakeRequest) -> (u16, String) {
        let issuer = format!("{base}/application/o/erevos/");
        let mut s = state.lock().unwrap();
        let form = oidc::fields(&request.body);
        let basic = format!("Basic {}", oidc_basic("erevos-id", "erevos-secret"));
        match (request.method.as_str(), request.path.as_str()) {
            ("GET", "/application/o/erevos/.well-known/openid-configuration") => (
                200,
                serde_json::json!({
                    "issuer": issuer,
                    "authorization_endpoint": format!("{base}/application/o/authorize/"),
                    "token_endpoint": format!("{base}/application/o/token/"),
                    "userinfo_endpoint": format!("{base}/application/o/userinfo/"),
                    "introspection_endpoint": format!("{base}/application/o/introspect/"),
                    "revocation_endpoint": format!("{base}/application/o/revoke/"),
                    "token_endpoint_auth_methods_supported": ["client_secret_post", "client_secret_basic"],
                })
                .to_string(),
            ),
            ("POST", "/application/o/token/") => {
                s.asked += 1;
                s.authenticated = request.authorization == basic;
                if !s.authenticated || s.unauthorized {
                    return (401, r#"{"error":"invalid_client"}"#.into());
                }
                if s.down {
                    return (503, String::new());
                }
                if s.fail > 0 {
                    s.fail -= 1;
                    return (503, String::new());
                }
                let grant = form.get("grant_type").cloned().unwrap_or_default();
                let nonce = if grant == "authorization_code" {
                    let Some((challenge, nonce)) = form.get("code").and_then(|c| s.codes.remove(c)) else {
                        return (400, r#"{"error":"invalid_grant"}"#.into());
                    };
                    let verifier = form.get("code_verifier").cloned().unwrap_or_default();
                    if b64url(&Sha256::digest(verifier.as_bytes())) != challenge
                        || !form.get("redirect_uri").is_some_and(|r| r.ends_with("/signin/callback"))
                    {
                        return (400, r#"{"error":"invalid_grant"}"#.into());
                    }
                    Some(nonce)
                } else if grant == "refresh_token" {
                    let old = form.get("refresh_token").cloned().unwrap_or_default();
                    if s.refuse || !s.refresh.remove(&old) {
                        return (400, r#"{"error":"invalid_grant"}"#.into());
                    }
                    None
                } else {
                    return (400, r#"{"error":"unsupported_grant_type"}"#.into());
                };
                s.n += 1;
                let (access, refresh) = (format!("access-{}", s.n), format!("refresh-{}", s.n));
                let sub = s.sub.clone();
                s.access.insert(access.clone(), sub.clone());
                s.refresh.insert(refresh.clone());
                let mut reply = serde_json::json!({
                    "access_token": access,
                    "refresh_token": refresh,
                    "token_type": "Bearer",
                    "expires_in": 300,
                });
                if let Some(nonce) = nonce {
                    let claims = serde_json::json!({
                        "iss": issuer, "aud": "erevos-id", "sub": sub, "nonce": nonce,
                        "preferred_username": s.user,
                        "exp": std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs()
                            + 300,
                    });
                    reply["id_token"] = Value::String(format!(
                        "eyJhbGciOiJSUzI1NiJ9.{}.signature",
                        b64url(claims.to_string().as_bytes())
                    ));
                }
                (200, reply.to_string())
            }
            ("GET", "/application/o/userinfo/") => {
                if let Some(status) = s.userinfo_status {
                    return (status, String::new());
                }
                let token = request.authorization.strip_prefix("Bearer ").unwrap_or_default();
                match s.access.get(token) {
                    Some(sub) => {
                        let mut info = serde_json::json!({"sub": sub, "preferred_username": s.user});
                        if let Some(groups) = &s.groups {
                            info["groups"] = serde_json::json!(groups);
                        }
                        (200, info.to_string())
                    }
                    None => (401, String::new()),
                }
            }
            ("POST", "/application/o/introspect/") => {
                let known = form.get("token").is_some_and(|t| s.access.contains_key(t));
                (200, serde_json::json!({"active": known && !s.inactive}).to_string())
            }
            ("POST", "/application/o/revoke/") => {
                let token = form.get("token").cloned().unwrap_or_default();
                s.refresh.remove(&token);
                s.revoked.push(token);
                (200, String::new())
            }
            _ => (404, String::new()),
        }
    }

    fn oidc_basic(id: &str, secret: &str) -> String {
        // The same as the relay sends, made here another way.
        let text = format!("{id}:{secret}");
        let table = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let mut out = String::new();
        for chunk in text.as_bytes().chunks(3) {
            let b = [
                chunk[0],
                *chunk.get(1).unwrap_or(&0),
                *chunk.get(2).unwrap_or(&0),
            ];
            let n = (b[0] as u32) << 16 | (b[1] as u32) << 8 | b[2] as u32;
            for i in 0..4 {
                out.push(if i <= chunk.len() {
                    table[(n >> (18 - 6 * i) & 63) as usize] as char
                } else {
                    '='
                });
            }
        }
        out
    }

    /// What a browser gets for `GET target` from `signin`, each time from
    /// an address of its own.
    fn browse(signin: &SignIn, method: &str, target: &str, body: &str, now: u64) -> Page {
        static NEXT: std::sync::atomic::AtomicU32 = std::sync::atomic::AtomicU32::new(1);
        let n = NEXT.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        browse_from(
            signin,
            IpAddr::from(n.to_be_bytes()),
            method,
            target,
            body,
            now,
        )
    }

    /// What a browser at `client` gets for `GET target` from `signin`.
    fn browse_from(
        signin: &SignIn,
        client: IpAddr,
        method: &str,
        target: &str,
        body: &str,
        now: u64,
    ) -> Page {
        signin.answer(
            &Incoming {
                method: method.into(),
                target: target.into(),
                accept_language: "en".into(),
                forwarded_for: String::new(),
                body: body.as_bytes().to_vec(),
            },
            client,
            now,
        )
    }

    /// The browser's part of a sign-in for the claim `secret`, up to the page
    /// the provider sends it back to.
    fn sign_in_page(signin: &SignIn, fake: &Fake, secret: &[u8; 32], now: u64) -> Page {
        let claim = to_hex(&Sha256::digest(secret));
        let start = browse(
            signin,
            "GET",
            &format!("/signin/start?claim={claim}"),
            "",
            now,
        );
        assert_eq!(start.status, 302);
        let back = fake.authorize(start.location.as_deref().unwrap());
        let target = back.strip_prefix("https://erevos.example.org").unwrap();
        browse(signin, "GET", target, "", now)
    }

    /// The whole sign-in in the browser for the claim `secret`; returns the
    /// page with the code.
    fn sign_in(signin: &SignIn, fake: &Fake, secret: &[u8; 32], now: u64) -> String {
        let page = sign_in_page(signin, fake, secret, now);
        assert_eq!(page.status, 200, "{}", page.body);
        page.body
    }

    /// The code a page shows, as the person types it.
    fn code_on(page: &str) -> [u8; 6] {
        let at = page.find("<p class=\"code\">").unwrap() + 16;
        let digits: Vec<u8> = page[at..at + 7]
            .bytes()
            .filter(u8::is_ascii_digit)
            .collect();
        digits.try_into().unwrap()
    }

    /// Signs in in the browser for the claim `secret`: the code to type.
    fn signed_in(signin: &SignIn, fake: &Fake, secret: &[u8; 32], now: u64) -> [u8; 6] {
        let page = sign_in(signin, fake, secret, now);
        assert!(page.contains("Type this code in Erevos"));
        code_on(&page)
    }

    /// Signs in for the claim `secret`, and claims a line for `token` with the
    /// code the page showed, in place of `old`'s.
    fn claimed(
        signin: &SignIn,
        fake: &Fake,
        tokens: &Tokens,
        secret: &[u8; 32],
        token: &str,
        old: &[u8; 32],
        now: u64,
    ) -> Result<String, ClaimError> {
        let code = signed_in(signin, fake, secret, now);
        signin.claim(secret, &line_of(token), old, &code, tokens, None, now)
    }

    fn setup() -> (Fake, SignIn, Tokens, tempdir::Dir) {
        let fake = Fake::start();
        let dir = tempdir::Dir::new();
        let tokens = Tokens::new(dir.path().join("phones.tokens"));
        let signin = SignIn::open(
            fake.config("https://erevos.example.org"),
            Some(dir.path().join("phones.tokens.signins")),
        )
        .unwrap();
        (fake, signin, tokens, dir)
    }

    mod tempdir {
        pub struct Dir(std::path::PathBuf);
        impl Dir {
            pub fn new() -> Dir {
                let mut bytes = [0u8; 8];
                rand::RngCore::fill_bytes(&mut rand::rngs::OsRng, &mut bytes);
                let path = std::env::temp_dir().join(format!(
                    "erevos-signin-{}",
                    bytes.iter().map(|b| format!("{b:02x}")).collect::<String>()
                ));
                std::fs::create_dir_all(&path).unwrap();
                Dir(path)
            }
            pub fn path(&self) -> &std::path::Path {
                &self.0
            }
        }
        impl Drop for Dir {
            fn drop(&mut self) {
                let _ = std::fs::remove_dir_all(&self.0);
            }
        }
    }

    const NOW: u64 = 1_790_000_000;
    const NONE: [u8; 32] = [0; 32];

    fn line_of(token: &str) -> [u8; 32] {
        Sha256::digest(token.as_bytes()).into()
    }

    #[test]
    fn an_id_token_must_be_fresh_and_for_this_client_alone() {
        let now = 1_800_000_000u64;
        let good = serde_json::json!({
            "iss": "https://id.example/app/", "aud": "erevos-id", "sub": "u1",
            "nonce": "n1", "exp": now + 60,
        });
        assert!(id_token_fits(&good, "https://id.example/app", "erevos-id", "n1", now));
        let with = |key: &str, value: Value| {
            let mut claims = good.clone();
            claims[key] = value;
            claims
        };
        // Expired, past the allowed skew; without exp at all.
        assert!(!id_token_fits(&with("exp", (now - CLOCK_SKEW - 1).into()), "https://id.example/app", "erevos-id", "n1", now));
        assert!(id_token_fits(&with("exp", (now - 10).into()), "https://id.example/app", "erevos-id", "n1", now));
        let mut no_exp = good.clone();
        no_exp.as_object_mut().unwrap().remove("exp");
        assert!(!id_token_fits(&no_exp, "https://id.example/app", "erevos-id", "n1", now));
        // Several audiences: only with azp naming this client.
        let many = with("aud", serde_json::json!(["erevos-id", "other"]));
        assert!(!id_token_fits(&many, "https://id.example/app", "erevos-id", "n1", now));
        let mut named = many.clone();
        named["azp"] = "erevos-id".into();
        assert!(id_token_fits(&named, "https://id.example/app", "erevos-id", "n1", now));
        named["azp"] = "other".into();
        assert!(!id_token_fits(&named, "https://id.example/app", "erevos-id", "n1", now));
        // Another nonce, issuer or client; no sub.
        assert!(!id_token_fits(&good, "https://id.example/app", "erevos-id", "n2", now));
        assert!(!id_token_fits(&good, "https://other.example/app", "erevos-id", "n1", now));
        assert!(!id_token_fits(&good, "https://id.example/app", "other", "n1", now));
        assert!(!id_token_fits(&with("sub", "".into()), "https://id.example/app", "erevos-id", "n1", now));
    }

    #[test]
    fn the_journal_takes_only_a_code_word_of_an_error_and_no_secret_or_name() {
        assert_eq!(error_word("server_error"), "server_error");
        for sent in ["", "Bad", "x\nerevos-relay: fake", "ä", &"a".repeat(41)] {
            assert_eq!(error_word(sent), "an error that is not a code word");
        }
        let record = Record {
            line: NONE,
            sub: "sub-of-maria".to_string(),
            user: "maria".to_string(),
            made: 1,
            checked: 2,
            verified: 3,
            failed: 0,
            cut: false,
            sealed: b"sealed-refresh".to_vec(),
        };
        let said = format!("{record:?}");
        assert!(said.contains("checked: 2"));
        assert!(!said.contains("maria") && !said.contains("sealed"));
    }

    #[test]
    fn a_code_is_six_random_digits_compared_whole() {
        let codes: HashSet<[u8; 6]> = (0..50).map(|_| new_code()).collect();
        assert!(codes.len() > 40, "random");
        assert!(codes.iter().all(|c| c.iter().all(u8::is_ascii_digit)));
        assert!(same(b"012345", b"012345"));
        assert!(!same(b"012345", b"012346") && !same(b"012345", b"112345"));
    }

    #[test]
    fn a_phone_signs_in_and_gets_a_line_of_its_own() {
        let (fake, signin, tokens, dir) = setup();
        let secret = [1u8; 32];
        // Not claimed before the provider lets it through.
        assert_eq!(
            signin.claim(
                &secret,
                &line_of("t1"),
                &NONE,
                b"000000",
                &tokens,
                None,
                NOW
            ),
            Err(ClaimError::NotFound)
        );
        let page = sign_in(&signin, &fake, &secret, NOW);
        assert!(
            fake.state.lock().unwrap().authenticated,
            "the client secret went with the code"
        );
        assert!(page.contains("You signed in to LPHL as Nekten."));
        assert!(page.contains("Type this code in Erevos, where you tapped Sign in with LPHL:"));
        assert!(!page.contains("<form"), "nothing to confirm in the browser");
        let code = code_on(&page);
        // Another claim secret gets nothing, even with the code.
        assert_eq!(
            signin.claim(&[9u8; 32], &line_of("t1"), &NONE, &code, &tokens, None, NOW),
            Err(ClaimError::NotFound)
        );
        let name = signin
            .claim(&secret, &line_of("t1"), &NONE, &code, &tokens, None, NOW)
            .unwrap();
        assert_eq!(name, "lphl:nekten");
        assert!(tokens.has("t1"));
        let file = fs::read_to_string(dir.path().join("phones.tokens")).unwrap();
        assert_eq!(
            file,
            format!(
                "{} lphl:nekten # signed in with LPHL on 2026-09-21\n",
                to_hex(&line_of("t1"))
            )
        );
        // The answer lost: the same claim with the same token answers again, another token does not.
        assert_eq!(
            signin
                .claim(
                    &secret,
                    &line_of("t1"),
                    &NONE,
                    &code,
                    &tokens,
                    None,
                    NOW + 5
                )
                .unwrap(),
            "lphl:nekten"
        );
        assert_eq!(
            signin.claim(
                &secret,
                &line_of("t2"),
                &NONE,
                &code,
                &tokens,
                None,
                NOW + 5
            ),
            Err(ClaimError::NotFound)
        );
        // What is kept holds no refresh token in clear, and comes back after a restart.
        let kept = fs::read(dir.path().join("phones.tokens.signins")).unwrap();
        let refresh = fake
            .state
            .lock()
            .unwrap()
            .refresh
            .iter()
            .next()
            .unwrap()
            .clone();
        assert!(!kept.windows(refresh.len()).any(|w| w == refresh.as_bytes()));
        let again = SignIn::open(
            fake.config("https://erevos.example.org"),
            Some(dir.path().join("phones.tokens.signins")),
        )
        .unwrap();
        assert_eq!(again.len(), 1);
        let record = again.record(&line_of("t1")).unwrap();
        assert_eq!((record.checked, record.verified), (NOW, NOW));
        assert_eq!(
            unseal(&again.key, &line_of("t1"), &record.sealed).as_deref(),
            Some(refresh.as_str())
        );
    }

    #[test]
    fn a_phone_that_started_in_erevos_gets_a_button_back_with_the_same_code() {
        let (fake, signin, _tokens, _dir) = setup();
        let secret = [7u8; 32];
        let claim = to_hex(&Sha256::digest(secret));
        let start = browse(
            &signin,
            "GET",
            &format!("/signin/start?claim={claim}&to=app"),
            "",
            NOW,
        );
        assert_eq!(start.status, 302);
        let back = fake.authorize(start.location.as_deref().unwrap());
        let target = back.strip_prefix("https://erevos.example.org").unwrap();
        let page = browse(&signin, "GET", target, "", NOW);
        assert_eq!(page.status, 200, "{}", page.body);
        let code = code_on(&page.body);
        let link = format!(
            "href=\"erevos://signin?code={}\"",
            String::from_utf8_lossy(&code)
        );
        assert!(page.body.contains(&link), "{}", page.body);
        // Started without it, as on a computer: only the code to type.
        let other = sign_in(&signin, &fake, &[8u8; 32], NOW);
        assert!(!other.contains("erevos://"));
    }

    #[test]
    fn a_wrong_code_is_refused_and_five_end_the_sign_in() {
        let (fake, signin, tokens, _dir) = setup();
        // A start link someone sent to another person, who signed in with it:
        // its maker has the claim secret, but the code is on that person's page.
        let theirs = [1u8; 32];
        let code = signed_in(&signin, &fake, &theirs, NOW);
        let guess = if &code == b"000000" {
            *b"000001"
        } else {
            *b"000000"
        };
        for left in (0..MAX_TRIES).rev() {
            assert_eq!(
                signin.claim(&theirs, &line_of("t"), &NONE, &guess, &tokens, None, NOW),
                Err(ClaimError::Wrong(left))
            );
        }
        // Over: not even the right code takes it now.
        assert_eq!(
            signin.claim(&theirs, &line_of("t"), &NONE, &code, &tokens, None, NOW),
            Err(ClaimError::NotFound)
        );
        assert_eq!(tokens.count(), 0);
        // A wrong code typed by mistake leaves it to the right one.
        let secret = [2u8; 32];
        let code = signed_in(&signin, &fake, &secret, NOW);
        let mut wrong = code;
        wrong[5] = b'0' + (wrong[5] - b'0' + 1) % 10;
        assert_eq!(
            signin.claim(&secret, &line_of("t"), &NONE, &wrong, &tokens, None, NOW),
            Err(ClaimError::Wrong(MAX_TRIES - 1))
        );
        assert_eq!(
            signin
                .claim(&secret, &line_of("t"), &NONE, &code, &tokens, None, NOW)
                .unwrap(),
            "lphl:nekten"
        );
    }

    #[test]
    fn a_sign_in_is_good_for_ten_minutes_and_its_steps_only_once() {
        let (fake, signin, tokens, _dir) = setup();
        let secret = [2u8; 32];
        let claim = to_hex(&Sha256::digest(secret));
        let start = browse(
            &signin,
            "GET",
            &format!("/signin/start?claim={claim}"),
            "",
            NOW,
        );
        let back = fake.authorize(start.location.as_deref().unwrap());
        let target = back
            .strip_prefix("https://erevos.example.org")
            .unwrap()
            .to_string();
        // Too late: the flow is gone.
        assert_eq!(
            browse(&signin, "GET", &target, "", NOW + FLOW_SECS).status,
            400
        );
        let code = signed_in(&signin, &fake, &secret, NOW);
        assert!(signin
            .claim(
                &secret,
                &line_of("late"),
                &NONE,
                &code,
                &tokens,
                None,
                NOW + FLOW_SECS
            )
            .is_err());
        // The provider's answer is taken once.
        let other = to_hex(&Sha256::digest([3u8; 32]));
        let start = browse(
            &signin,
            "GET",
            &format!("/signin/start?claim={other}"),
            "",
            NOW,
        );
        let back = fake.authorize(start.location.as_deref().unwrap());
        let target = back
            .strip_prefix("https://erevos.example.org")
            .unwrap()
            .to_string();
        assert_eq!(browse(&signin, "GET", &target, "", NOW).status, 200);
        assert_eq!(browse(&signin, "GET", &target, "", NOW).status, 400);
        assert_eq!(
            browse(&signin, "GET", "/signin/start?claim=nothex", "", NOW).status,
            400
        );
        assert_eq!(
            browse(
                &signin,
                "GET",
                "/signin/callback?state=unknown&code=x",
                "",
                NOW
            )
            .status,
            400
        );
        assert_eq!(browse(&signin, "GET", "/signin/other", "", NOW).status, 404);
        assert_eq!(
            browse(&signin, "POST", "/signin/confirm", "confirm=00", NOW).status,
            404,
            "there is nothing to confirm in the browser any more"
        );
        // Cancelled at the provider.
        let start = browse(
            &signin,
            "GET",
            &format!("/signin/start?claim={claim}"),
            "",
            NOW,
        );
        let q = oidc::fields(
            start
                .location
                .as_deref()
                .unwrap()
                .split_once('?')
                .unwrap()
                .1,
        );
        let cancelled = browse(
            &signin,
            "GET",
            &format!("/signin/callback?error=access_denied&state={}", q["state"]),
            "",
            NOW,
        );
        assert!(cancelled.body.contains("cancelled"));
    }

    #[test]
    fn sign_ins_past_the_most_at_once_push_out_the_oldest() {
        let (fake, signin, tokens, _dir) = setup();
        let start = |secret: &[u8; 32], now: u64| {
            let claim = to_hex(&Sha256::digest(secret));
            let start = browse(
                &signin,
                "GET",
                &format!("/signin/start?claim={claim}"),
                "",
                now,
            );
            assert_eq!(start.status, 302, "never busy");
            fake.authorize(start.location.as_deref().unwrap())
                .strip_prefix("https://erevos.example.org")
                .unwrap()
                .to_string()
        };
        let first = start(&[0u8; 32], NOW);
        let mut last = String::new();
        for i in 1..=MAX_FLOWS as u64 {
            last = start(
                &(i as u32).to_be_bytes().repeat(8).try_into().unwrap(),
                NOW + i,
            );
        }
        assert_eq!(browse(&signin, "GET", &first, "", NOW + 300).status, 400);
        assert_eq!(browse(&signin, "GET", &last, "", NOW + 300).status, 200);
        // So with sign-ins the provider let through, waiting for their claim.
        let oldest = [1u8; 32];
        let code = signed_in(&signin, &fake, &oldest, NOW);
        for i in 1..MAX_FLOWS as u64 {
            signed_in(
                &signin,
                &fake,
                &(i as u32 + 1000)
                    .to_be_bytes()
                    .repeat(8)
                    .try_into()
                    .unwrap(),
                NOW + i,
            );
        }
        assert_eq!(
            signin.claim(
                &oldest,
                &line_of("t"),
                &NONE,
                &code,
                &tokens,
                None,
                NOW + 300
            ),
            Err(ClaimError::NotFound)
        );
    }

    #[test]
    fn a_browser_starts_ten_sign_ins_a_minute_at_most() {
        let (_fake, signin, _tokens, _dir) = setup();
        let start = |client: IpAddr, n: u8, now: u64| {
            let claim = to_hex(&Sha256::digest([n; 32]));
            browse_from(
                &signin,
                client,
                "GET",
                &format!("/signin/start?claim={claim}"),
                "",
                now,
            )
        };
        let one: IpAddr = "198.51.100.7".parse().unwrap();
        for n in 0..MAX_STARTS as u8 {
            assert_eq!(start(one, n, NOW + u64::from(n)).status, 302);
        }
        let busy = start(one, 99, NOW + 30);
        assert_eq!(busy.status, 429);
        assert!(busy
            .body
            .contains("Too many sign-ins were started from here just now"));
        assert!(busy
            .bytes()
            .starts_with(b"HTTP/1.1 429 Too Many Requests\r\n"));
        // Another browser is not held up, and a minute later this one starts again.
        assert_eq!(
            start("198.51.100.8".parse().unwrap(), 1, NOW + 30).status,
            302
        );
        assert_eq!(start(one, 99, NOW + 60).status, 302);
        // One machine's IPv6 addresses count as one.
        let mut six = 0;
        for n in 0..=MAX_STARTS as u16 {
            let address: IpAddr = format!("2001:db8:1:2::{n:x}").parse().unwrap();
            if start(address, n as u8, NOW).status == 429 {
                six += 1;
            }
        }
        assert_eq!(six, 1);
    }

    /// A connection's stream, read from `input`, written to `output`.
    struct Wire {
        input: io::Cursor<Vec<u8>>,
        output: Vec<u8>,
    }

    impl Read for Wire {
        fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
            self.input.read(buf)
        }
    }

    impl Write for Wire {
        fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
            self.output.write(buf)
        }

        fn flush(&mut self) -> io::Result<()> {
            Ok(())
        }
    }

    #[test]
    fn behind_a_proxy_on_this_machine_the_browser_is_told_by_x_forwarded_for() {
        let local: IpAddr = "127.0.0.1".parse().unwrap();
        let far: IpAddr = "198.51.100.1".parse().unwrap();
        // Apache adds the address it took the request from after any the request came with.
        assert_eq!(
            client(local, "203.0.113.9, 198.51.100.7"),
            "198.51.100.7".parse::<IpAddr>().unwrap()
        );
        assert_eq!(
            client("::1".parse().unwrap(), "198.51.100.7:4711"),
            "198.51.100.7".parse::<IpAddr>().unwrap()
        );
        assert_eq!(client(local, ""), local);
        assert_eq!(client(local, "nonsense"), local);
        // From anywhere else, what the request says is not taken.
        assert_eq!(client(far, "203.0.113.9"), far);
        assert_eq!(
            counted_as("2001:db8:1:2:3:4:5:6".parse().unwrap()),
            "2001:db8:1:2::".parse::<IpAddr>().unwrap()
        );
        assert_eq!(counted_as("::ffff:198.51.100.1".parse().unwrap()), far);
        assert_eq!(counted_as(far), far);
        // Read from the request itself, every X-Forwarded-For it has.
        let (_fake, signin, _tokens, _dir) = setup();
        let ask = |n: u8, forwarded: &str| {
            let claim = to_hex(&Sha256::digest([n; 32]));
            let mut wire = Wire {
                input: io::Cursor::new(
                    format!("GET /signin/start?claim={claim} HTTP/1.1\r\nHost: erevos.example.org\r\nX-Forwarded-For: 203.0.113.9\r\nX-Forwarded-For: {forwarded}\r\n\r\n")
                        .into_bytes(),
                ),
                output: Vec::new(),
            };
            signin.serve(&mut wire, local, NOW).unwrap();
            String::from_utf8(wire.output).unwrap()
        };
        for n in 0..MAX_STARTS as u8 {
            assert!(ask(n, "198.51.100.7").starts_with("HTTP/1.1 302 "));
        }
        assert!(ask(99, "198.51.100.7").starts_with("HTTP/1.1 429 "));
        assert!(ask(99, "198.51.100.8").starts_with("HTTP/1.1 302 "));
    }

    #[test]
    fn signing_in_again_on_a_phone_replaces_its_line_and_another_phone_gets_one_more() {
        let (fake, signin, tokens, dir) = setup();
        assert_eq!(
            claimed(&signin, &fake, &tokens, &[1u8; 32], "first", &NONE, NOW).unwrap(),
            "lphl:nekten"
        );
        assert_eq!(
            claimed(&signin, &fake, &tokens, &[2u8; 32], "second", &NONE, NOW).unwrap(),
            "lphl:nekten-2"
        );
        // The first phone again, with its old token: its line is replaced, and the old refresh token revoked.
        let name = claimed(
            &signin,
            &fake,
            &tokens,
            &[3u8; 32],
            "first again",
            &line_of("first"),
            NOW,
        )
        .unwrap();
        assert_eq!(name, "lphl:nekten");
        assert!(!tokens.has("first") && tokens.has("first again") && tokens.has("second"));
        assert_eq!(signin.len(), 2);
        assert_eq!(fake.state.lock().unwrap().revoked.len(), 1);
        // Another account's old token is not its to replace.
        fake.state.lock().unwrap().sub = "sub-2".into();
        fake.state.lock().unwrap().user = "Μαρία".into();
        assert_eq!(
            claimed(
                &signin,
                &fake,
                &tokens,
                &[4u8; 32],
                "maria",
                &line_of("second"),
                NOW
            )
            .unwrap(),
            "lphl:maria"
        );
        assert!(tokens.has("second"));
        // A line the operator wrote is never replaced.
        fs::write(
            dir.path().join("phones.tokens"),
            format!(
                "{}\n{} pixel\n",
                fs::read_to_string(dir.path().join("phones.tokens"))
                    .unwrap()
                    .trim_end(),
                to_hex(&line_of("pixel"))
            ),
        )
        .unwrap();
        assert_eq!(
            claimed(
                &signin,
                &fake,
                &tokens,
                &[5u8; 32],
                "maria 2",
                &line_of("pixel"),
                NOW
            )
            .unwrap(),
            "lphl:maria-2"
        );
        assert!(tokens.has("pixel"));
    }

    #[test]
    fn signing_in_again_keeps_the_phones_a_line_invited_and_a_line_cut_leaves_them_in() {
        let (fake, signin, tokens, _dir) = setup();
        let invites = Invites::in_memory();
        claimed(&signin, &fake, &tokens, &[1u8; 32], "first", &NONE, NOW).unwrap();
        let first = crate::tokens::Phone {
            hash: line_of("first"),
            name: "lphl:nekten".into(),
        };
        let (secret, _) = invites.make(&first, "maria", &tokens, NOW).unwrap();
        invites
            .redeem(&secret, &line_of("maria"), &tokens, NOW)
            .unwrap();
        let maria = crate::tokens::Phone {
            hash: line_of("maria"),
            name: "maria".into(),
        };
        let (secret, _) = invites.make(&maria, "anna", &tokens, NOW).unwrap();
        invites
            .redeem(&secret, &line_of("anna"), &tokens, NOW)
            .unwrap();
        assert!(tokens.has("maria") && tokens.has("anna"));
        // Signed in again on the same phone: Maria's phone stays, now the new line's invite.
        let code = signed_in(&signin, &fake, &[2u8; 32], NOW);
        signin
            .claim(
                &[2u8; 32],
                &line_of("again"),
                &line_of("first"),
                &code,
                &tokens,
                Some(&invites),
                NOW,
            )
            .unwrap();
        assert!(!tokens.has("first") && tokens.has("again") && tokens.has("maria"));
        assert_eq!(invites.list(&line_of("again"), &tokens, NOW).len(), 1);
        assert!(invites.list(&line_of("first"), &tokens, NOW).is_empty());
        // The account closed: its line goes at the hourly check, and only it: Maria's phone
        // stays, and Anna's, whom Maria invited.
        fake.state.lock().unwrap().refuse = true;
        signin.check(&tokens, NOW + CHECK_EVERY);
        assert!(!tokens.has("again"));
        assert!(tokens.has("maria") && tokens.has("anna"));
        invites.sweep(&tokens, NOW + CHECK_EVERY);
        assert!(tokens.has("maria") && tokens.has("anna"));
        assert_eq!(invites.list(&line_of("maria"), &tokens, NOW).len(), 1);
    }

    #[test]
    fn a_token_whose_line_is_in_the_file_already_is_refused() {
        let (fake, signin, tokens, dir) = setup();
        fs::write(
            dir.path().join("phones.tokens"),
            format!("{} pixel\n", to_hex(&line_of("pixel"))),
        )
        .unwrap();
        assert_eq!(
            claimed(&signin, &fake, &tokens, &[1u8; 32], "pixel", &NONE, NOW),
            Err(ClaimError::Taken)
        );
        assert_eq!(signin.len(), 0, "nothing kept for it");
        assert_eq!(
            tokens.lines(),
            vec![(line_of("pixel"), "pixel".to_string())]
        );
        claimed(&signin, &fake, &tokens, &[2u8; 32], "mine", &NONE, NOW).unwrap();
        assert_eq!(
            claimed(&signin, &fake, &tokens, &[3u8; 32], "mine", &NONE, NOW),
            Err(ClaimError::Taken)
        );
        assert_eq!(signin.len(), 1);
    }

    #[cfg(unix)]
    #[test]
    fn the_record_goes_down_before_the_line_and_is_taken_back_if_the_line_cannot_go_in() {
        let (fake, signin, tokens, dir) = setup();
        let kept = dir.path().join("phones.tokens.signins");
        // The record cannot be written: no line either.
        fs::create_dir(&kept).unwrap();
        assert_eq!(
            claimed(&signin, &fake, &tokens, &[1u8; 32], "one", &NONE, NOW),
            Err(ClaimError::Storage)
        );
        assert!(!tokens.has("one"));
        fs::remove_dir(&kept).unwrap();
        // The line cannot be written, through a link: the record is taken back, also on disk.
        let target = dir.path().join("real.tokens");
        fs::write(&target, "").unwrap();
        let link = dir.path().join("link.tokens");
        std::os::unix::fs::symlink(&target, &link).unwrap();
        let through = Tokens::new(link);
        assert_eq!(
            claimed(&signin, &fake, &through, &[2u8; 32], "two", &NONE, NOW),
            Err(ClaimError::Storage)
        );
        assert_eq!(signin.len(), 0);
        let again = SignIn::open(
            fake.config("https://erevos.example.org"),
            Some(kept.clone()),
        )
        .unwrap();
        assert_eq!(again.len(), 0);
        // A line named as a sign-in with no record is told at start.
        claimed(&signin, &fake, &tokens, &[3u8; 32], "three", &NONE, NOW).unwrap();
        let file = dir.path().join("phones.tokens");
        let text = fs::read_to_string(&file).unwrap();
        fs::write(
            &file,
            format!(
                "{text}{} lphl:by-hand\n{} pixel\n",
                to_hex(&line_of("by hand")),
                to_hex(&line_of("pixel"))
            ),
        )
        .unwrap();
        let fresh = Tokens::new(file);
        assert_eq!(signin.unrecorded(&fresh), [line_of("by hand")]);
    }

    #[test]
    fn an_account_signs_in_ten_phones_at_most() {
        let (fake, signin, tokens, _dir) = setup();
        for i in 0..MAX_PHONES as u8 {
            claimed(
                &signin,
                &fake,
                &tokens,
                &[10 + i; 32],
                &format!("p{i}"),
                &NONE,
                NOW,
            )
            .unwrap();
        }
        let code = signed_in(&signin, &fake, &[99u8; 32], NOW);
        assert_eq!(
            signin.claim(
                &[99u8; 32],
                &line_of("one more"),
                &NONE,
                &code,
                &tokens,
                None,
                NOW
            ),
            Err(ClaimError::Full)
        );
        // Signing in again on one of them still replaces its line.
        assert!(signin
            .claim(
                &[99u8; 32],
                &line_of("p0 again"),
                &line_of("p0"),
                &code,
                &tokens,
                None,
                NOW
            )
            .is_ok());
    }

    #[test]
    fn every_hour_the_provider_says_whether_the_account_may_still_come_in() {
        let (fake, signin, tokens, dir) = setup();
        claimed(&signin, &fake, &tokens, &[1u8; 32], "one", &NONE, NOW).unwrap();
        let first = fake
            .state
            .lock()
            .unwrap()
            .refresh
            .iter()
            .next()
            .unwrap()
            .clone();

        // Not due yet: nothing is asked.
        signin.check(&tokens, NOW + CHECK_EVERY - 1);
        assert!(fake.state.lock().unwrap().refresh.contains(&first));
        // Due: the refresh token is rotated, and the new one kept, also after a restart.
        signin.check(&tokens, NOW + CHECK_EVERY);
        assert!(tokens.has("one"));
        let second = fake
            .state
            .lock()
            .unwrap()
            .refresh
            .iter()
            .next()
            .unwrap()
            .clone();
        assert_ne!(first, second);
        let again = SignIn::open(
            fake.config("https://erevos.example.org"),
            Some(dir.path().join("phones.tokens.signins")),
        )
        .unwrap();
        let record = again.record(&line_of("one")).unwrap();
        assert_eq!(
            unseal(&again.key, &line_of("one"), &record.sealed),
            Some(second)
        );
        assert_eq!(
            (record.checked, record.verified),
            (NOW + CHECK_EVERY, NOW + CHECK_EVERY)
        );

        // The provider down: the line stays, and is asked again an hour later.
        fake.state.lock().unwrap().down = true;
        signin.check(&tokens, NOW + 2 * CHECK_EVERY);
        assert!(tokens.has("one"));
        fake.state.lock().unwrap().down = false;
        signin.check(&tokens, NOW + 2 * CHECK_EVERY + 60);
        let record = signin.record(&line_of("one")).unwrap();
        assert_eq!(
            (record.checked, record.verified),
            (NOW + 2 * CHECK_EVERY, NOW + CHECK_EVERY)
        );

        // Disabled: introspection says the token is not active, and the line goes.
        fake.state.lock().unwrap().inactive = true;
        signin.check(&tokens, NOW + 3 * CHECK_EVERY);
        assert!(!tokens.has("one"));
        assert_eq!(signin.len(), 0);
    }

    #[test]
    fn a_line_not_found_good_for_three_days_goes_whatever_kept_the_provider_from_answering() {
        let (fake, signin, tokens, _dir) = setup();
        for (i, token) in ["a", "b"].iter().enumerate() {
            claimed(
                &signin,
                &fake,
                &tokens,
                &[i as u8 + 1; 32],
                token,
                &NONE,
                NOW,
            )
            .unwrap();
        }
        // Down for three days: kept until then, each look asking once.
        fake.state.lock().unwrap().down = true;
        let mut at = NOW + CHECK_EVERY;
        while at < NOW + MAX_UNCHECKED {
            let asked = fake.state.lock().unwrap().asked;
            signin.check(&tokens, at);
            assert!(tokens.has("a") && tokens.has("b"), "{}", at - NOW);
            assert!(fake.state.lock().unwrap().asked <= asked + 2);
            at += CHECK_EVERY;
        }
        // Three days on, each is asked for itself, and one check of its own that failed is not enough.
        let asked = fake.state.lock().unwrap().asked;
        signin.check(&tokens, NOW + MAX_UNCHECKED);
        assert!(tokens.has("a") && tokens.has("b"));
        assert_eq!(fake.state.lock().unwrap().asked, asked + 2);
        // Failed again an hour later: they go.
        signin.check(&tokens, NOW + MAX_UNCHECKED + CHECK_EVERY);
        assert!(!tokens.has("a") && !tokens.has("b"));
        assert_eq!(signin.len(), 0);

        // A wrong client secret at the provider (invalid_client) is the same; a good check starts the three days again.
        let (fake, signin, tokens, _dir) = setup();
        claimed(&signin, &fake, &tokens, &[1u8; 32], "c", &NONE, NOW).unwrap();
        fake.state.lock().unwrap().unauthorized = true;
        signin.check(&tokens, NOW + MAX_UNCHECKED - 1);
        assert!(tokens.has("c"));
        fake.state.lock().unwrap().unauthorized = false;
        signin.check(&tokens, NOW + MAX_UNCHECKED - 1 + CHECK_EVERY);
        fake.state.lock().unwrap().unauthorized = true;
        signin.check(&tokens, NOW + MAX_UNCHECKED + CHECK_EVERY);
        assert!(tokens.has("c"));
        signin.check(&tokens, NOW + 2 * MAX_UNCHECKED - 1 + CHECK_EVERY);
        assert!(tokens.has("c"));
        signin.check(&tokens, NOW + 2 * MAX_UNCHECKED - 1 + 2 * CHECK_EVERY);
        assert!(!tokens.has("c"));
    }

    /// Lines signed in for `names`, at `NOW`.
    fn lines_for(signin: &SignIn, fake: &Fake, tokens: &Tokens, names: &[&str]) {
        for (i, token) in names.iter().enumerate() {
            claimed(signin, fake, tokens, &[i as u8 + 1; 32], token, &NONE, NOW).unwrap();
        }
    }

    #[test]
    fn one_check_that_fails_among_many_takes_no_line_out() {
        let (fake, signin, tokens, _dir) = setup();
        let names = ["a", "b", "c", "d", "e", "f", "g"];
        lines_for(&signin, &fake, &tokens, &names);
        // Three days with no check (the relay was off), then one request times out.
        fake.state.lock().unwrap().fail = 1;
        signin.check(&tokens, NOW + MAX_UNCHECKED + 60);
        assert!(names.iter().all(|n| tokens.has(n)));
        let failed: Vec<u64> = names
            .iter()
            .map(|n| signin.record(&line_of(n)).unwrap().failed)
            .collect();
        assert_eq!(failed.iter().filter(|f| **f != 0).count(), 1);
        assert!(names
            .iter()
            .filter(|n| signin.record(&line_of(n)).unwrap().failed == 0)
            .all(|n| signin.record(&line_of(n)).unwrap().verified == NOW + MAX_UNCHECKED + 60));
        // The one that failed is asked again an hour later, and found good.
        signin.check(&tokens, NOW + MAX_UNCHECKED + 60 + CHECK_EVERY);
        assert!(names.iter().all(|n| tokens.has(n)));
        assert!(names
            .iter()
            .all(|n| signin.record(&line_of(n)).unwrap().failed == 0));
    }

    #[test]
    fn after_the_relay_was_off_for_three_days_each_line_needs_two_failed_checks_of_its_own() {
        let (fake, signin, tokens, _dir) = setup();
        let names = ["a", "b", "c", "d", "e", "f", "g"];
        lines_for(&signin, &fake, &tokens, &names);
        // Back after four days, or with the clock put forward, the provider answering: all found good.
        signin.check(&tokens, NOW + 96 * 3600);
        assert!(names.iter().all(|n| tokens.has(n)));
        // Off for four days more, and the provider down when it is back: nothing goes in the first look.
        fake.state.lock().unwrap().down = true;
        let back = NOW + 192 * 3600;
        let asked = fake.state.lock().unwrap().asked;
        signin.check(&tokens, back);
        assert!(names.iter().all(|n| tokens.has(n)));
        assert_eq!(
            fake.state.lock().unwrap().asked,
            asked + FAILED_A_LOOK as u32,
            "a few asked a look, each for itself"
        );
        // The next looks ask the rest; none goes before failing twice, an hour apart.
        let mut at = back;
        while at < back + CHECK_EVERY {
            at += LOOK_EVERY.as_secs();
            signin.check(&tokens, at);
            assert!(
                names.iter().all(|n| tokens.has(n)) || at >= back + CHECK_EVERY,
                "{}",
                at - back
            );
        }
        while at < back + 3 * CHECK_EVERY {
            at += LOOK_EVERY.as_secs();
            signin.check(&tokens, at);
        }
        assert!(names.iter().all(|n| !tokens.has(n)));
        assert_eq!(signin.len(), 0);
    }

    #[test]
    fn a_clock_put_back_stops_no_check() {
        let (fake, signin, tokens, _dir) = setup();
        claimed(&signin, &fake, &tokens, &[1u8; 32], "a", &NONE, NOW).unwrap();
        // A month back: what was ahead of the clock counts as now, and is written down so.
        let back = NOW - 30 * 24 * 3600;
        signin.check(&tokens, back);
        let record = signin.record(&line_of("a")).unwrap();
        assert_eq!((record.checked, record.verified), (back, back));
        let asked = fake.state.lock().unwrap().asked;
        signin.check(&tokens, back + CHECK_EVERY);
        assert_eq!(fake.state.lock().unwrap().asked, asked + 1);
        // So three days of the provider down still take it out.
        fake.state.lock().unwrap().down = true;
        signin.check(&tokens, back + CHECK_EVERY + MAX_UNCHECKED);
        signin.check(&tokens, back + 2 * CHECK_EVERY + MAX_UNCHECKED);
        assert!(!tokens.has("a"));
    }

    #[cfg(unix)]
    #[test]
    fn a_line_that_cannot_be_taken_out_now_keeps_its_record_and_goes_at_the_next_look() {
        let (fake, signin, tokens, dir) = setup();
        claimed(&signin, &fake, &tokens, &[1u8; 32], "one", &NONE, NOW).unwrap();
        // The file becomes a link, which the relay never writes through.
        let file = dir.path().join("phones.tokens");
        let target = dir.path().join("real.tokens");
        fs::rename(&file, &target).unwrap();
        std::os::unix::fs::symlink(&target, &file).unwrap();
        fake.state.lock().unwrap().refuse = true;
        signin.check(&tokens, NOW + CHECK_EVERY);
        assert!(!tokens.has("one"), "refused all the same");
        assert!(fs::read_to_string(&target)
            .unwrap()
            .contains(&to_hex(&line_of("one"))));
        assert_eq!(signin.len(), 1, "its record kept");
        // The next look tries again, without asking the provider.
        let asked = fake.state.lock().unwrap().asked;
        signin.check(&tokens, NOW + CHECK_EVERY + 300);
        assert_eq!((signin.len(), fake.state.lock().unwrap().asked), (1, asked));
        // A restart meanwhile forgets the refusal, but the record says to cut the line, and it is at once.
        let fresh = Tokens::new(file.clone());
        assert!(fresh.has("one"));
        let again = SignIn::open(
            fake.config("https://erevos.example.org"),
            Some(dir.path().join("phones.tokens.signins")),
        )
        .unwrap();
        assert!(again.record(&line_of("one")).unwrap().cut);
        again.cut_pending(&fresh);
        assert!(!fresh.has("one"));
        fs::remove_file(&file).unwrap();
        fs::rename(&target, &file).unwrap();
        signin.check(&tokens, NOW + CHECK_EVERY + 600);
        assert!(!tokens.has("one"));
        assert_eq!(signin.len(), 0);
        assert_eq!(fake.state.lock().unwrap().asked, asked);
    }

    #[test]
    fn with_a_group_set_the_account_must_be_in_it_at_sign_in_and_every_check() {
        let fake = Fake::start();
        let dir = tempdir::Dir::new();
        let tokens = Tokens::new(dir.path().join("phones.tokens"));
        let mut config = fake.config("https://erevos.example.org");
        config.group = Some("erevos".into());
        let signin = SignIn::open(config, None).unwrap();
        // Not in it, or no groups said: refused, with a page that says so.
        for groups in [None, Some(vec!["family".to_string()])] {
            fake.state.lock().unwrap().groups = groups;
            let page = sign_in_page(&signin, &fake, &[1u8; 32], NOW);
            assert_eq!(page.status, 403);
            assert!(page.body.contains("this account may not use this relay"));
        }
        fake.state.lock().unwrap().groups = Some(vec!["family".into(), "erevos".into()]);
        claimed(&signin, &fake, &tokens, &[2u8; 32], "in", &NONE, NOW).unwrap();
        signin.check(&tokens, NOW + CHECK_EVERY);
        assert!(tokens.has("in"));
        // Taken out of the group: the line goes at the next check.
        fake.state.lock().unwrap().groups = Some(vec!["family".into()]);
        signin.check(&tokens, NOW + 2 * CHECK_EVERY);
        assert!(!tokens.has("in"));
    }

    #[test]
    fn a_refused_refresh_or_userinfo_takes_the_line_out_and_a_line_taken_out_drops_its_record() {
        let (fake, signin, tokens, _dir) = setup();
        for (i, token) in ["a", "b", "c"].iter().enumerate() {
            claimed(
                &signin,
                &fake,
                &tokens,
                &[i as u8 + 1; 32],
                token,
                &NONE,
                NOW,
            )
            .unwrap();
        }
        // The operator takes out c's line: its record goes, and its refresh token is revoked.
        tokens.remove(&line_of("c")).unwrap();
        fake.state.lock().unwrap().userinfo_status = Some(401);
        signin.check(&tokens, NOW + CHECK_EVERY);
        // Userinfo refusing takes a and b out.
        assert!(!tokens.has("a") && !tokens.has("b"));
        assert_eq!(signin.len(), 0);
        assert_eq!(fake.state.lock().unwrap().revoked.len(), 1);

        let (fake, signin, tokens, _dir) = setup();
        claimed(&signin, &fake, &tokens, &[1u8; 32], "closed", &NONE, NOW).unwrap();
        fake.state.lock().unwrap().refuse = true;
        signin.check(&tokens, NOW + CHECK_EVERY);
        assert!(!tokens.has("closed"));
    }

    #[test]
    fn the_first_account_signed_in_for_a_claim_is_the_one_it_gets() {
        let (fake, signin, tokens, _dir) = setup();
        let secret = [1u8; 32];
        let ours = sign_in(&signin, &fake, &secret, NOW);
        // Someone who saw the claim's SHA-256 signs in with an account of theirs for it.
        fake.state.lock().unwrap().sub = "sub-other".into();
        fake.state.lock().unwrap().user = "other".into();
        let theirs = sign_in_page(&signin, &fake, &secret, NOW);
        assert_eq!(theirs.status, 400);
        assert!(!theirs.body.contains("class=\"code\""));
        assert_eq!(
            signin
                .claim(
                    &secret,
                    &line_of("ours"),
                    &NONE,
                    &code_on(&ours),
                    &tokens,
                    None,
                    NOW
                )
                .unwrap(),
            "lphl:nekten"
        );
    }

    #[test]
    fn a_provider_that_is_down_is_asked_once_a_look() {
        let (fake, signin, tokens, _dir) = setup();
        for (i, token) in ["a", "b"].iter().enumerate() {
            claimed(
                &signin,
                &fake,
                &tokens,
                &[i as u8 + 1; 32],
                token,
                &NONE,
                NOW,
            )
            .unwrap();
        }
        fake.state.lock().unwrap().down = true;
        signin.check(&tokens, NOW + CHECK_EVERY);
        let checked = |token: &str| signin.record(&line_of(token)).unwrap().checked;
        assert_eq!((checked("a"), checked("b")), (NOW + CHECK_EVERY, NOW));
        fake.state.lock().unwrap().down = false;
        signin.check(&tokens, NOW + CHECK_EVERY + 300);
        assert_eq!(
            (checked("a"), checked("b")),
            (NOW + CHECK_EVERY, NOW + CHECK_EVERY + 300)
        );
        assert!(tokens.has("a") && tokens.has("b"));
    }

    #[test]
    fn a_new_client_secret_signs_the_phones_out() {
        let (fake, signin, tokens, dir) = setup();
        claimed(&signin, &fake, &tokens, &[1u8; 32], "one", &NONE, NOW).unwrap();
        let mut config = fake.config("https://erevos.example.org");
        config.client_secret = "a new secret".into();
        let other = SignIn::open(config, Some(dir.path().join("phones.tokens.signins"))).unwrap();
        other.check(&tokens, NOW + CHECK_EVERY);
        assert!(!tokens.has("one"));
    }

    #[test]
    fn sign_in_pages_are_told_from_websocket_handshakes() {
        assert!(page_line(b"GET /signin/start?claim=ab HTTP/1.1"));
        assert!(page_line(b"POST /erevos/signin/confirm HTTP/1.1"));
        assert!(!page_line(b"GET / HTTP/1.1"));
        assert!(!page_line(b"GET /join HTTP/1.1"));
        assert!(!page_line(b"GET /join?x=/signin/ HTTP/1.1"));
        assert!(!page_line(b"PUT /signin/start HTTP/1.1"));
    }

    #[test]
    fn the_records_read_back_as_written() {
        let mut records = vec![Record {
            line: [3u8; 32],
            sub: "s".into(),
            user: "Μαρία".into(),
            made: 1,
            checked: 2,
            verified: 3,
            failed: 4,
            cut: true,
            sealed: vec![1, 2, 3],
        }];
        let bytes = encode(&records).unwrap();
        assert_eq!(decode(&bytes).unwrap(), records);
        // A file from before `failed` and `cut` reads as none failed, none to cut.
        let mut older = HEADER_2.to_vec();
        older.extend_from_slice(&1u32.to_be_bytes());
        older.extend_from_slice(&[3u8; 32]);
        for n in [1u64, 2, 3] {
            older.extend_from_slice(&n.to_be_bytes());
        }
        for text in [&b"s"[..], "Μαρία".as_bytes(), &[1, 2, 3]] {
            put(&mut older, text).unwrap();
        }
        let read = decode(&older).unwrap();
        assert_eq!((read[0].failed, read[0].cut), (0, false));
        assert_eq!(read[0].user, "Μαρία");
        let mut bad = bytes.clone();
        bad[8 + 4 + 32 + 32] = 2;
        assert!(decode(&bad).is_none(), "cut is 0 or 1");
        assert!(decode(&bytes[..bytes.len() - 1]).is_none());
        assert!(decode(&[&bytes[..], b"more"].concat()).is_none());
        assert!(decode(&[&HEADER[..], b"\0\0\0\x01short"].concat()).is_none());
        assert!(decode(b"something else").is_none());
        // What a file cannot hold is never written.
        records[0].sealed = vec![0; u16::MAX as usize + 1];
        assert!(encode(&records).is_err());
    }
}
