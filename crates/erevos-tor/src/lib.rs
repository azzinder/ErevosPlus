// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! Relay requests through Tor, with Arti, for the apps' "Through Tor" switch.
//!
//! The app speaks to its relay over WebSocket: one binary request, one binary
//! reply. Through Tor, the same WebSocket runs over a Tor stream instead of
//! the phone's own connection, so neither the relay nor anyone watching the
//! phone's network sees both ends: the relay sees a Tor exit (or nothing, for
//! a relay's `.onion` address), and the network sees only Tor. A `wss://`
//! relay is reached with TLS inside the Tor stream, so the exit sees only
//! encrypted bytes.
//!
//! The functions block, for the app's background threads: they run on a Tokio
//! runtime of their own. Tor starts on the first request, or with [`start`],
//! and keeps its state (guards, the directory) in the folders given.
//!
//! Nostr relays speak another way ([`text_open`]): text frames both ways,
//! and the relay sends events whenever they come, so what it says waits in
//! a queue of its own until [`text_next`] takes it.
//!
//! XMPP servers are reached on a plain TCP connection of their own ([`stream_open`]), straight or
//! through Tor, in TLS from the start or after XMPP's STARTTLS: bytes both ways, what the server
//! sends waiting in a queue until [`stream_read`] takes it.
//!
//! Where Tor is blocked it can go through bridges instead ([`Bridges`]): plain
//! ones, or ones a pluggable transport hides (obfs4, Snowflake, WebTunnel,
//! meek), which the lyrebird program the app carries speaks. With bridges, Tor
//! never connects to its relays straight: when no bridge answers, nothing goes.
//!
//! Not audited.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex, OnceLock};
use std::time::Duration;

use arti_client::config::pt::TransportConfigBuilder;
use arti_client::config::{
    BoolOrAuto, BridgeConfigBuilder, CfgPath, PtTransportName, Reconfigure, TorClientConfig, TorClientConfigBuilder,
};
use arti_client::{DormantMode, IsolationToken, StreamPrefs, TorClient};
use futures_util::{SinkExt, StreamExt};
use tokio::io::{AsyncRead, AsyncWrite};
use tokio::runtime::Runtime;
use tokio_rustls::rustls::pki_types::ServerName;
use tokio_rustls::rustls::{ClientConfig, RootCertStore};
use tokio_rustls::TlsConnector;
use tokio_tungstenite::tungstenite::client::IntoClientRequest;
use tokio_tungstenite::tungstenite::http::HeaderValue;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::WebSocketStream;
use tor_config::PaddingLevel;
use tor_rtcompat::PreferredRuntime;

pub type Result<T> = std::result::Result<T, String>;

mod socks;
pub use socks::{socks_close, socks_open, Door};

/// How long a connection or a reply may take through Tor before it is given up.
const WAIT: Duration = Duration::from_secs(90);

trait Io: AsyncRead + AsyncWrite + Unpin + Send {}
impl<T: AsyncRead + AsyncWrite + Unpin + Send> Io for T {}

type Socket = WebSocketStream<Box<dyn Io>>;

static RUNTIME: OnceLock<Runtime> = OnceLock::new();
static CLIENT: Mutex<Option<Running>> = Mutex::new(None);
static SESSIONS: OnceLock<Mutex<HashMap<u64, Arc<tokio::sync::Mutex<Socket>>>>> = OnceLock::new();
static TEXTS: OnceLock<Mutex<HashMap<u64, Arc<Text>>>> = OnceLock::new();
static NOSTR_WAYS: OnceLock<Mutex<HashMap<String, IsolationToken>>> = OnceLock::new();
static NAMED_WAYS: OnceLock<Mutex<HashMap<String, IsolationToken>>> = OnceLock::new();
static STREAMS: OnceLock<Mutex<HashMap<u64, Arc<Stream>>>> = OnceLock::new();
static NEXT: AtomicU64 = AtomicU64::new(1);

fn runtime() -> Result<&'static Runtime> {
    if let Some(runtime) = RUNTIME.get() {
        return Ok(runtime);
    }
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .thread_name("erevos-tor")
        .enable_all()
        .build()
        .map_err(|e| e.to_string())?;
    Ok(RUNTIME.get_or_init(|| runtime))
}

fn sessions() -> &'static Mutex<HashMap<u64, Arc<tokio::sync::Mutex<Socket>>>> {
    SESSIONS.get_or_init(|| Mutex::new(HashMap::new()))
}

fn texts() -> &'static Mutex<HashMap<u64, Arc<Text>>> {
    TEXTS.get_or_init(|| Mutex::new(HashMap::new()))
}

// Each Nostr relay's connections go on circuits of their own, never shared with another relay's
// or the app's relay's, so no exit carries two of them and none can tell they are one phone's.
// After a connection there fails, the next goes on new circuits, through another exit most
// likely: the last one may be an exit the relay refuses (as some refuse Tor exits, with HTTP 403)
// or one that cannot reach it, and Tor would keep using it for minutes.
fn nostr_ways() -> std::sync::MutexGuard<'static, HashMap<String, IsolationToken>> {
    NOSTR_WAYS.get_or_init(|| Mutex::new(HashMap::new())).lock().unwrap_or_else(|e| e.into_inner())
}

/// The circuits a Nostr relay's connections go on now.
fn nostr_way(host: &str) -> IsolationToken {
    *nostr_ways().entry(host.to_string()).or_insert_with(IsolationToken::new)
}

/// A connection on `way` to `host` failed: the next one goes on new circuits, unless that happened already.
fn nostr_way_failed(host: &str, way: IsolationToken) {
    let mut ways = nostr_ways();
    if ways.get(host) == Some(&way) {
        ways.remove(host);
    }
}

// The ways the app names (`open_on`): a phone with a queue for each contact reads them in groups,
// each group's connections on circuits of their own, so the relay sees each group come from
// another exit, and no exit carries two groups. After a connection on one fails, the next goes on
// new circuits, as for Nostr's.
fn named_ways() -> std::sync::MutexGuard<'static, HashMap<String, IsolationToken>> {
    NAMED_WAYS.get_or_init(|| Mutex::new(HashMap::new())).lock().unwrap_or_else(|e| e.into_inner())
}

/// A connection of Nostr's kind: what is sent goes on `sink`, and what the relay says waits in
/// `frames`, put there by `reader` as it comes, until the relay closes the connection.
struct Text {
    sink: tokio::sync::Mutex<futures_util::stream::SplitSink<Socket, Message>>,
    frames: tokio::sync::Mutex<tokio::sync::mpsc::Receiver<String>>,
    reader: tokio::task::JoinHandle<()>,
    /// The relay's host, and the circuits the connection went on.
    way: (String, IsolationToken),
}

/// The running Tor, and the bridges it was started with.
struct Running {
    tor: Arc<TorClient<PreferredRuntime>>,
    bridges: Bridges,
}

/// How Tor reaches its network: straight to its relays, or only through bridges.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Bridges {
    /// Bridge lines, as bridges.torproject.org gives them, such as
    /// `obfs4 192.0.2.1:443 <fingerprint> cert=… iat-mode=0`. None: no bridges.
    pub lines: Vec<String>,
    /// The lyrebird program, for the lines that name a pluggable transport.
    pub transports: Option<PathBuf>,
}

/// The pluggable transports lyrebird speaks, as bridge lines name them.
pub const TRANSPORTS: [&str; 4] = ["obfs4", "snowflake", "webtunnel", "meek_lite"];

/// The pluggable transport a bridge line names, if any: its first word, unless that is the address.
fn transport_of(line: &str) -> Option<&str> {
    let first = line.split_whitespace().next()?;
    let address = first.contains(':') || first.parse::<std::net::IpAddr>().is_ok();
    (!address).then_some(first)
}

/// Arti's configuration: its folders, and the bridges if there are any.
fn configure(state_dir: &Path, cache_dir: &Path, bridges: &Bridges) -> Result<TorClientConfig> {
    let mut config = TorClientConfigBuilder::from_directories(state_dir, cache_dir);
    // An app's own folders belong to it alone, but not in the way Arti checks for on a desktop.
    config.storage().permissions().dangerously_trust_everyone();
    // The padding Tor sends between real cells, to hide when it talks, wakes a phone's radio every
    // few seconds: the reduced padding Tor made for phones, with none from the guard to this one.
    config.channel().padding(PaddingLevel::Reduced);
    if bridges.lines.is_empty() {
        config.bridges().enabled(BoolOrAuto::Explicit(false));
        return config.build().map_err(|e| e.to_string());
    }
    // Only through the bridges, never straight to Tor's relays, even when none of them answers.
    config.bridges().enabled(BoolOrAuto::Explicit(true));
    for line in &bridges.lines {
        if let Some(name) = transport_of(line) {
            if !TRANSPORTS.contains(&name) {
                return Err(format!("Erevos has no {name} for its bridges"));
            }
            if bridges.transports.is_none() {
                return Err("This build of Erevos has no obfs4, Snowflake, WebTunnel or meek: only plain bridges work in it".to_string());
            }
        }
        let bridge: BridgeConfigBuilder = line.parse().map_err(|e| format!("not a bridge line: {e}"))?;
        config.bridges().bridges().push(bridge);
    }
    if let Some(path) = &bridges.transports {
        let protocols = TRANSPORTS.iter().map(|name| name.parse::<PtTransportName>()).collect::<std::result::Result<Vec<_>, _>>();
        let mut transport = TransportConfigBuilder::default();
        transport
            .protocols(protocols.map_err(|e| e.to_string())?)
            .path(CfgPath::new_literal(path.clone()))
            // Started only when a bridge needs it.
            .run_on_startup(false);
        config.bridges().transports().push(transport);
    }
    config.build().map_err(|e| e.to_string())
}

/// Starts Tor, keeping its state in `state_dir` and what it downloads in
/// `cache_dir`, through `bridges` if there are any. Connecting to Tor goes on
/// in the background; a request made meanwhile waits for it. Starting again
/// with the same bridges does nothing, and with others changes them in place:
/// the circuits made before are dropped. If that fails, Tor stops, so nothing
/// goes the way it went before.
pub fn start(state_dir: &Path, cache_dir: &Path, bridges: Bridges) -> Result<()> {
    let mut client = CLIENT.lock().map_err(|_| "tor state lost".to_string())?;
    if client.as_ref().is_some_and(|running| running.bridges == bridges) {
        return Ok(());
    }
    let runtime = runtime()?;
    let _inside = runtime.enter();
    let config = configure(state_dir, cache_dir, &bridges);
    // The connections open the way Tor went before are closed, and made again the new way.
    if client.is_some() {
        if let Ok(mut map) = sessions().lock() {
            map.clear();
        }
    }
    let tor = match (client.take(), config) {
        (Some(running), Ok(config)) => match running.tor.reconfigure(&config, Reconfigure::AllOrNothing) {
            Ok(()) => running.tor,
            Err(e) => {
                let_go(&running.tor);
                return Err(e.to_string());
            }
        },
        (None, Ok(config)) => TorClient::builder().config(config).create_unbootstrapped().map_err(|e| e.to_string())?,
        (running, Err(e)) => {
            if let Some(running) = running {
                let_go(&running.tor);
            }
            return Err(e);
        }
    };
    let bootstrapping = tor.clone();
    runtime.spawn(async move {
        // Its progress shows in status(); a failure is tried again by the next request.
        let _ = bootstrapping.bootstrap().await;
    });
    *client = Some(Running { tor, bridges });
    Ok(())
}

/// Stops Tor and closes every connection through it.
pub fn stop() {
    if let Ok(mut map) = sessions().lock() {
        map.clear();
    }
    if let Ok(mut client) = CLIENT.lock() {
        if let Some(running) = client.take() {
            let_go(&running.tor);
        }
    }
}

/// A Tor no longer used: its background work sleeps, as a start still under way may keep it a while.
fn let_go(tor: &TorClient<PreferredRuntime>) {
    tor.set_dormant(DormantMode::Soft);
}

/// How far Tor is: "off", or Arti's own words for its progress, and whether it carries traffic.
pub fn status() -> (String, bool) {
    match CLIENT.lock().ok().and_then(|c| c.as_ref().map(|running| running.tor.clone())) {
        None => ("off".to_string(), false),
        Some(tor) => {
            let status = tor.bootstrap_status();
            (status.to_string(), status.ready_for_traffic())
        }
    }
}

fn client() -> Result<Arc<TorClient<PreferredRuntime>>> {
    CLIENT
        .lock()
        .map_err(|_| "tor state lost".to_string())?
        .as_ref()
        .map(|running| running.tor.clone())
        .ok_or_else(|| "Tor is not started".to_string())
}

/// Where a relay is, from its address: `ws://` or `wss://`, a host, a port and a path.
#[derive(Debug, PartialEq, Eq)]
pub struct Address {
    pub tls: bool,
    pub host: String,
    pub port: u16,
}

pub fn parse(url: &str) -> Result<Address> {
    let (tls, rest) = if let Some(rest) = url.strip_prefix("wss://") {
        (true, rest)
    } else if let Some(rest) = url.strip_prefix("ws://") {
        (false, rest)
    } else {
        return Err(format!("not a relay address: {url}"));
    };
    let authority = rest.split(['/', '?', '#']).next().unwrap_or_default();
    let (host, port) = match authority.rsplit_once(':') {
        Some((host, port)) if !host.ends_with(']') || authority.starts_with('[') => {
            let port = port.parse::<u16>().map_err(|_| format!("not a port: {port}"))?;
            (host, port)
        }
        _ => (authority, if tls { 443 } else { 80 }),
    };
    let host = host.trim_start_matches('[').trim_end_matches(']');
    if host.is_empty() {
        return Err(format!("no host in {url}"));
    }
    Ok(Address { tls, host: host.to_string(), port })
}

/// The subprotocols a connection with a channel to the relay's own key offers
/// (crates/erevos-relay, `CHANNEL_PROTOCOL`): its token goes inside, so none
/// is given here.
const CHANNEL_PROTOCOLS: &str = "erevos, erevos-channel";

async fn connect(tor: Arc<TorClient<PreferredRuntime>>, url: String, token: String, way: Option<IsolationToken>, channel: bool) -> Result<Socket> {
    let address = parse(&url)?;
    let io = stream_to(tor, &address, way).await?;
    let mut request = url.as_str().into_client_request().map_err(|e| e.to_string())?;
    if !token.is_empty() {
        let value = HeaderValue::from_str(&format!("Bearer {token}")).map_err(|e| e.to_string())?;
        request.headers_mut().insert("Authorization", value);
    }
    if channel {
        request.headers_mut().insert("Sec-WebSocket-Protocol", HeaderValue::from_static(CHANNEL_PROTOCOLS));
    }
    let (socket, _) = tokio_tungstenite::client_async(request, io).await.map_err(|e| {
        if token.is_empty() {
            format!("the relay at {url} refused the connection through Tor: {e}")
        } else {
            format!("cannot reach the relay at {url}, or the token is wrong: {e}")
        }
    })?;
    Ok(socket)
}

/// A stream to `address` through Tor, in TLS when it asks for it, on the circuits of `way` if given.
async fn stream_to(tor: Arc<TorClient<PreferredRuntime>>, address: &Address, way: Option<IsolationToken>) -> Result<Box<dyn Io>> {
    let mut prefs = StreamPrefs::new();
    if let Some(way) = way {
        prefs.set_isolation(way);
    }
    let stream = tor
        .connect_with_prefs((address.host.as_str(), address.port), &prefs)
        .await
        .map_err(|e| format!("cannot reach {} through Tor: {e}", address.host))?;
    Ok(if address.tls {
        let mut roots = RootCertStore::empty();
        roots.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());
        let config = ClientConfig::builder().with_root_certificates(roots).with_no_client_auth();
        let name = ServerName::try_from(address.host.clone()).map_err(|e| e.to_string())?;
        let tls = TlsConnector::from(Arc::new(config))
            .connect(name, stream)
            .await
            .map_err(|e| format!("TLS with {} failed: {e}", address.host))?;
        Box::new(tls)
    } else {
        Box::new(stream)
    })
}

async fn call_on(socket: &mut Socket, bytes: Vec<u8>) -> Result<Vec<u8>> {
    socket.send(Message::binary(bytes)).await.map_err(|e| e.to_string())?;
    loop {
        match socket.next().await {
            Some(Ok(Message::Binary(reply))) => return Ok(reply.to_vec()),
            Some(Ok(Message::Close(_))) | None => return Err("the relay closed the connection".to_string()),
            Some(Ok(_)) => continue,
            Some(Err(e)) => return Err(e.to_string()),
        }
    }
}

/// Opens a connection to the relay at `url` through Tor, with `token` as a
/// bearer token if not empty. Returns its handle for [`call`] and [`close`].
pub fn open(url: &str, token: &str) -> Result<u64> {
    open_with(url, token, None, false)
}

/// Opens a connection to the relay at `url` through Tor for a channel to the
/// relay's own key (erevos_core::relay_channel), which the app then makes on
/// it with [`call`]: its hello first, its token in the first message after.
pub fn open_channel(url: &str) -> Result<u64> {
    open_with(url, "", None, true)
}

/// Opens a connection as [`open`] does, or for a channel as [`open_channel`]
/// does, on the circuits the app names `way`: every connection of one name
/// goes the same way, and none of another name's. After one fails, the next
/// of that name goes on new circuits.
pub fn open_on(url: &str, token: &str, way: &str, channel: bool) -> Result<u64> {
    let token_of_way = *named_ways().entry(way.to_string()).or_insert_with(IsolationToken::new);
    let opened = open_with(url, token, Some(token_of_way), channel);
    if opened.is_err() {
        let mut ways = named_ways();
        if ways.get(way) == Some(&token_of_way) {
            ways.remove(way);
        }
    }
    opened
}

fn open_with(url: &str, token: &str, way: Option<IsolationToken>, channel: bool) -> Result<u64> {
    let tor = client()?;
    let (url, token) = (url.to_string(), token.to_string());
    let socket = runtime()?.block_on(async move {
        tokio::time::timeout(WAIT, connect(tor, url, token, way, channel))
            .await
            .map_err(|_| "Tor took too long to reach the relay".to_string())?
    })?;
    let id = NEXT.fetch_add(1, Ordering::Relaxed);
    sessions().lock().map_err(|_| "tor state lost".to_string())?.insert(id, Arc::new(tokio::sync::Mutex::new(socket)));
    Ok(id)
}

/// Sends one request on an open connection and returns the relay's reply.
pub fn call(id: u64, bytes: &[u8]) -> Result<Vec<u8>> {
    let socket = sessions()
        .lock()
        .map_err(|_| "tor state lost".to_string())?
        .get(&id)
        .cloned()
        .ok_or_else(|| "the connection through Tor is closed".to_string())?;
    let bytes = bytes.to_vec();
    let reply = runtime()?.block_on(async move {
        let mut socket = socket.lock().await;
        tokio::time::timeout(WAIT, call_on(&mut socket, bytes))
            .await
            .map_err(|_| "the relay did not answer through Tor in time".to_string())?
    });
    if reply.is_err() {
        close(id);
    }
    reply
}

/// Closes a connection. Closing one already closed does nothing.
pub fn close(id: u64) {
    let socket = sessions().lock().ok().and_then(|mut map| map.remove(&id));
    if let (Some(socket), Ok(runtime)) = (socket, runtime()) {
        runtime.spawn(async move {
            let _ = socket.lock().await.close(None).await;
        });
    }
}

/// The most frames of a Nostr relay's that wait to be taken: past it, its
/// connection is read no further until some are, so a relay that sends and
/// sends fills no more than this of the phone's memory.
const TEXT_BACKLOG: usize = 256;

/// Opens a connection to the Nostr relay at `url` through Tor. Returns its
/// handle for [`text_send`], [`text_next`] and [`text_close`].
pub fn text_open(url: &str) -> Result<u64> {
    text_open_on(url, None)
}

/// [`text_open`], on circuits of their own for `chat` when given: a chat the user sends through Tor
/// on its own (app/lib/nostr-dm-net.ts), whose connections share no exit with the others'.
pub fn text_open_on(url: &str, chat: Option<&str>) -> Result<u64> {
    let tor = client()?;
    let host = match chat {
        Some(chat) => format!("chat {chat} {}", parse(url)?.host),
        None => parse(url)?.host,
    };
    let way = nostr_way(&host);
    let url = url.to_string();
    let runtime = runtime()?;
    let socket = runtime
        .block_on(async move {
            tokio::time::timeout(WAIT, connect(tor, url, String::new(), Some(way), false))
                .await
                .map_err(|_| "Tor took too long to reach the relay".to_string())?
        })
        .inspect_err(|_| nostr_way_failed(&host, way))?;
    let (sink, mut stream) = socket.split();
    let (sender, frames) = tokio::sync::mpsc::channel(TEXT_BACKLOG);
    let reader = runtime.spawn(async move {
        while let Some(Ok(message)) = stream.next().await {
            match message {
                Message::Text(text) => {
                    if sender.send(text.to_string()).await.is_err() {
                        break;
                    }
                }
                Message::Close(_) => break,
                _ => continue,
            }
        }
    });
    let text = Text { sink: tokio::sync::Mutex::new(sink), frames: tokio::sync::Mutex::new(frames), reader, way: (host, way) };
    let id = NEXT.fetch_add(1, Ordering::Relaxed);
    texts().lock().map_err(|_| "tor state lost".to_string())?.insert(id, Arc::new(text));
    Ok(id)
}

fn text_of(id: u64) -> Result<Arc<Text>> {
    texts()
        .lock()
        .map_err(|_| "tor state lost".to_string())?
        .get(&id)
        .cloned()
        .ok_or_else(|| "the connection through Tor is closed".to_string())
}

/// Sends one text frame on a Nostr relay's connection.
pub fn text_send(id: u64, text: &str) -> Result<()> {
    let connection = text_of(id)?;
    let way = connection.way.clone();
    let text = text.to_string();
    let sent = runtime()?.block_on(async move {
        let mut sink = connection.sink.lock().await;
        tokio::time::timeout(WAIT, sink.send(Message::text(text)))
            .await
            .map_err(|_| "the relay did not take it through Tor in time".to_string())?
            .map_err(|e| e.to_string())
    });
    if sent.is_err() {
        nostr_way_failed(&way.0, way.1);
        text_close(id);
    }
    sent
}

/// The next text frame the relay sent, waiting up to `wait` for one: None
/// when none came in that time. Once the relay has closed the connection and
/// all it said is taken, an error.
pub fn text_next(id: u64, wait: Duration) -> Result<Option<String>> {
    let connection = text_of(id)?;
    let way = connection.way.clone();
    let next = runtime()?.block_on(async move {
        let mut frames = connection.frames.lock().await;
        match tokio::time::timeout(wait, frames.recv()).await {
            Err(_) => Ok(None),
            Ok(Some(text)) => Ok(Some(text)),
            Ok(None) => Err("the relay closed the connection".to_string()),
        }
    });
    if next.is_err() {
        nostr_way_failed(&way.0, way.1);
        text_close(id);
    }
    next
}

/// Closes a Nostr relay's connection. Closing one already closed does nothing.
pub fn text_close(id: u64) {
    let connection = texts().lock().ok().and_then(|mut map| map.remove(&id));
    if let (Some(connection), Ok(runtime)) = (connection, runtime()) {
        connection.reader.abort();
        runtime.spawn(async move {
            let _ = connection.sink.lock().await.close().await;
        });
    }
}

/// One request on a connection of its own, as the app sends most of them.
pub fn request(url: &str, token: &str, bytes: &[u8]) -> Result<Vec<u8>> {
    let id = open(url, token)?;
    let reply = call(id, bytes);
    close(id);
    reply
}

/// The most an answer over HTTP through Tor may be: a Matrix file of 50 MB, with room to spare.
const MOST_HTTP: usize = 64 * 1024 * 1024;

/// How long one request over HTTP through Tor may take in all, a file of 50 MB on a slow circuit;
/// it is given up sooner when nothing moves for WAIT.
const HTTP_WAIT: Duration = Duration::from_secs(600);

/// One HTTP/1.1 request through Tor, as a Matrix homeserver is asked (app/lib/matrix.ts): each
/// homeserver's on circuits of its own, new ones after a failure, as a Nostr relay's. `headers`
/// go as they are, but for Host, Connection and Content-Length, set here. Answers the status and
/// the body.
pub fn http(method: &str, url: &str, headers: &[(String, String)], body: &[u8]) -> Result<(u16, Vec<u8>)> {
    http_on(method, url, headers, body, None)
}

/// [`http`], on circuits of their own for `chat` when given, as [`text_open_on`].
pub fn http_on(method: &str, url: &str, headers: &[(String, String)], body: &[u8], chat: Option<&str>) -> Result<(u16, Vec<u8>)> {
    let (tls, rest) = match (url.strip_prefix("https://"), url.strip_prefix("http://")) {
        (Some(rest), _) => (true, rest),
        (None, Some(rest)) => (false, rest),
        _ => return Err(format!("not a web address: {url}")),
    };
    let address = parse(&format!("{}://{rest}", if tls { "wss" } else { "ws" }))?;
    let path = match rest.find(['/', '?', '#']) {
        Some(i) if rest[i..].starts_with('/') => rest[i..].split('#').next().unwrap_or("/").to_string(),
        Some(i) if rest[i..].starts_with('?') => format!("/{}", rest[i..].split('#').next().unwrap_or_default()),
        _ => "/".to_string(),
    };
    if !method.bytes().all(|b| b.is_ascii_uppercase()) || path.bytes().any(|b| b <= b' ') {
        return Err("not a request that can be sent".to_string());
    }
    let mut head = format!("{method} {path} HTTP/1.1\r\n");
    let host = if address.host.contains(':') { format!("[{}]", address.host) } else { address.host.clone() };
    let default_port = if tls { 443 } else { 80 };
    if address.port == default_port {
        head.push_str(&format!("Host: {host}\r\n"));
    } else {
        head.push_str(&format!("Host: {host}:{}\r\n", address.port));
    }
    head.push_str(&format!("Connection: close\r\nContent-Length: {}\r\n", body.len()));
    for (name, value) in headers {
        let lower = name.to_ascii_lowercase();
        if matches!(lower.as_str(), "host" | "connection" | "content-length" | "transfer-encoding") {
            continue;
        }
        if name.is_empty() || name.bytes().any(|b| !b.is_ascii_graphic() || b == b':') || value.bytes().any(|b| b == b'\r' || b == b'\n') {
            return Err(format!("not a header that can be sent: {name}"));
        }
        head.push_str(&format!("{name}: {value}\r\n"));
    }
    head.push_str("\r\n");
    let tor = client()?;
    let key = match chat {
        Some(chat) => format!("chat {chat} {}", address.host),
        None => format!("matrix {}", address.host),
    };
    let way = nostr_way(&key);
    let body = body.to_vec();
    runtime()?
        .block_on(async move {
            tokio::time::timeout(HTTP_WAIT, async move {
                use tokio::io::{AsyncReadExt, AsyncWriteExt};
                let stalled = |_| "the server stopped answering through Tor".to_string();
                let mut io = tokio::time::timeout(WAIT, stream_to(tor, &address, Some(way))).await.map_err(stalled)??;
                tokio::time::timeout(WAIT, io.write_all(head.as_bytes())).await.map_err(stalled)?.map_err(|e| e.to_string())?;
                for piece in body.chunks(64 * 1024) {
                    tokio::time::timeout(WAIT, io.write_all(piece)).await.map_err(stalled)?.map_err(|e| e.to_string())?;
                }
                tokio::time::timeout(WAIT, io.flush()).await.map_err(stalled)?.map_err(|e| e.to_string())?;
                let mut raw = Vec::new();
                let mut piece = vec![0u8; 64 * 1024];
                loop {
                    match tokio::time::timeout(WAIT, io.read(&mut piece)).await.map_err(stalled)? {
                        Ok(0) => break,
                        Ok(n) => {
                            raw.extend_from_slice(&piece[..n]);
                            if raw.len() > MOST_HTTP {
                                return Err("the answer is too large".to_string());
                            }
                        }
                        // A server that closes without TLS's goodbye: what came is the answer.
                        Err(e) if e.kind() == std::io::ErrorKind::UnexpectedEof && !raw.is_empty() => break,
                        Err(e) => return Err(e.to_string()),
                    }
                }
                http_answer(&raw)
            })
            .await
            .map_err(|_| "Tor took too long to reach the server".to_string())?
        })
        .inspect_err(|_| nostr_way_failed(&key, way))
}

/// An HTTP/1.1 answer read whole: its status and its body, put together if it came in chunks.
fn http_answer(raw: &[u8]) -> Result<(u16, Vec<u8>)> {
    let end = raw.windows(4).position(|w| w == b"\r\n\r\n").ok_or("no answer from the server")?;
    let head = std::str::from_utf8(&raw[..end]).map_err(|_| "a broken answer from the server")?;
    let mut lines = head.split("\r\n");
    let status = lines
        .next()
        .and_then(|line| line.split(' ').nth(1))
        .and_then(|code| code.parse::<u16>().ok())
        .ok_or("a broken answer from the server")?;
    let mut chunked = false;
    let mut length = None;
    for line in lines {
        let Some((name, value)) = line.split_once(':') else { continue };
        let (name, value) = (name.trim().to_ascii_lowercase(), value.trim());
        if name == "transfer-encoding" && value.to_ascii_lowercase().contains("chunked") {
            chunked = true;
        } else if name == "content-length" {
            length = value.parse::<usize>().ok();
        }
    }
    let rest = &raw[end + 4..];
    if !chunked {
        return Ok((status, rest[..length.unwrap_or(rest.len()).min(rest.len())].to_vec()));
    }
    let mut body = Vec::new();
    let mut at = 0;
    loop {
        // A chunk's size line, or the chunk itself, may be missing when the server cuts the
        // answer short: then it is an error, never a slice past the end.
        let line_end = rest.get(at..).and_then(|r| r.windows(2).position(|w| w == b"\r\n")).ok_or("a broken answer from the server")? + at;
        let size_text = std::str::from_utf8(&rest[at..line_end]).map_err(|_| "a broken answer from the server")?;
        let size = usize::from_str_radix(size_text.split(';').next().unwrap_or_default().trim(), 16).map_err(|_| "a broken answer from the server")?;
        at = line_end + 2;
        if size == 0 {
            return Ok((status, body));
        }
        let piece = rest.get(at..at.checked_add(size).ok_or("a broken answer from the server")?).ok_or("the answer was cut short")?;
        if body.len() + size > MOST_HTTP {
            return Err("the answer is too large".to_string());
        }
        body.extend_from_slice(piece);
        at += size + 2;
    }
}

/// An XMPP server's connection (app/lib/xmpp-net.ts), or a web server's (a station played through
/// Tor, TorHttpDataSource.kt): what is written goes on `writer`, and what the server sends waits in
/// `chunks`, put there by `reader` as it comes (STREAM_BACKLOG pieces at most), until it closes.
struct Stream {
    writer: tokio::sync::Mutex<tokio::io::WriteHalf<Box<dyn Io>>>,
    chunks: tokio::sync::Mutex<tokio::sync::mpsc::Receiver<Vec<u8>>>,
    reader: tokio::task::JoinHandle<()>,
    /// Through Tor: the circuits it went on, by the name they are kept under.
    way: Option<(String, IsolationToken)>,
}

fn streams() -> std::sync::MutexGuard<'static, HashMap<u64, Arc<Stream>>> {
    STREAMS.get_or_init(|| Mutex::new(HashMap::new())).lock().unwrap_or_else(|e| e.into_inner())
}

/// How a connection gets its TLS: an XMPP server's, or a web server's.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Tls {
    /// In TLS from the first byte (XEP-0368, `_xmpps-client`), with ALPN `xmpp-client`.
    Direct,
    /// In the clear until XMPP's STARTTLS (RFC 6120), then in TLS.
    StartTls,
    /// In TLS from the first byte with no ALPN, as a web server is asked over HTTP/1.1: a radio
    /// station or a TV channel of the Collection played through Tor (its Play through Tor), whose
    /// HTTP the app speaks itself (TorHttpDataSource.kt).
    Https,
}

/// What a connection's server sent waits for the app in at most this many pieces (16 KB each):
/// then nothing more is read from it until some is taken, so a stream that goes on without end
/// while nothing takes it (a radio station paused) does not fill the phone's memory.
const STREAM_BACKLOG: usize = 64;

/// The most the server may say before TLS begins.
const MOST_BEFORE_TLS: usize = 64 * 1024;

/// TLS over `io` for the XMPP domain `domain`, whose name the certificate must carry (RFC 7590).
async fn tls_for<S: AsyncRead + AsyncWrite + Unpin + Send + 'static>(io: S, domain: &str, alpn: bool) -> Result<Box<dyn Io>> {
    let mut roots = RootCertStore::empty();
    roots.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());
    let mut config = ClientConfig::builder().with_root_certificates(roots).with_no_client_auth();
    if alpn {
        config.alpn_protocols = vec![b"xmpp-client".to_vec()];
    }
    let name = ServerName::try_from(domain.to_string()).map_err(|e| e.to_string())?;
    let tls = TlsConnector::from(Arc::new(config)).connect(name, io).await.map_err(|e| format!("TLS with {domain} failed: {e}"))?;
    Ok(Box::new(tls))
}

/// XMPP's STARTTLS on a connection still in the clear: opens the stream, asks for TLS when the
/// server offers it, and waits for its yes. The app opens the stream again once in TLS.
async fn starttls<S: AsyncRead + AsyncWrite + Unpin>(io: &mut S, domain: &str) -> Result<()> {
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    async fn until(io: &mut (impl AsyncRead + Unpin), seen: &mut Vec<u8>, done: impl Fn(&str) -> bool) -> Result<String> {
        let mut piece = [0u8; 4096];
        loop {
            let text = String::from_utf8_lossy(seen).to_string();
            if done(&text) {
                return Ok(text);
            }
            if seen.len() > MOST_BEFORE_TLS {
                return Err("the XMPP server says too much before TLS".into());
            }
            let n = io.read(&mut piece).await.map_err(|e| e.to_string())?;
            if n == 0 {
                return Err("the XMPP server closed the connection".into());
            }
            seen.extend_from_slice(&piece[..n]);
        }
    }
    let open = format!("<?xml version='1.0'?><stream:stream to='{domain}' version='1.0' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams'>");
    io.write_all(open.as_bytes()).await.map_err(|e| e.to_string())?;
    io.flush().await.map_err(|e| e.to_string())?;
    let mut seen = Vec::new();
    let features = until(io, &mut seen, |t| t.contains("</stream:features>") || t.contains("<stream:features/>") || t.contains("</stream:stream>")).await?;
    if !features.contains("urn:ietf:params:xml:ns:xmpp-tls") {
        return Err("the XMPP server offers no TLS".into());
    }
    io.write_all(b"<starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'/>").await.map_err(|e| e.to_string())?;
    io.flush().await.map_err(|e| e.to_string())?;
    let mut seen = Vec::new();
    let answer = until(io, &mut seen, |t| t.contains("<proceed") || t.contains("<failure") || t.contains("</stream:stream>")).await?;
    if answer.contains("<proceed") {
        Ok(())
    } else {
        Err("the XMPP server refused TLS".into())
    }
}

/// Opens a connection to the XMPP server `host`:`port` for the XMPP domain `domain`, or with
/// [`Tls::Https`] to the web server `host`:`port` named `domain`, in TLS as `tls` says, through Tor
/// when `tor` (on circuits of the domain's own, new ones after a failure). Returns its handle for
/// [`stream_write`], [`stream_read`] and [`stream_close`].
pub fn stream_open(host: &str, port: u16, domain: &str, tls: Tls, tor: bool) -> Result<u64> {
    if domain.is_empty() || domain.contains(['\'', '"', '<', '>', '&', ' ']) {
        return Err(format!("not a domain: {domain}"));
    }
    let runtime = runtime()?;
    let way = tor.then(|| {
        let name = format!("{} {domain}", if tls == Tls::Https { "web" } else { "xmpp" });
        let token = nostr_way(&name);
        (name, token)
    });
    let tor_client = if tor { Some(client()?) } else { None };
    let (host, domain_owned, way_inner) = (host.to_string(), domain.to_string(), way.as_ref().map(|w| w.1));
    let opened = runtime.block_on(async move {
        tokio::time::timeout(WAIT, async move {
            let mut plain: Box<dyn Io> = match tor_client {
                Some(tor) => {
                    let mut prefs = StreamPrefs::new();
                    if let Some(way) = way_inner {
                        prefs.set_isolation(way);
                    }
                    let stream = tor.connect_with_prefs((host.as_str(), port), &prefs).await.map_err(|e| format!("cannot reach {host} through Tor: {e}"))?;
                    Box::new(stream)
                }
                None => {
                    let stream = tokio::net::TcpStream::connect((host.as_str(), port)).await.map_err(|e| format!("cannot reach {host}: {e}"))?;
                    let _ = stream.set_nodelay(true);
                    Box::new(stream)
                }
            };
            match tls {
                Tls::Direct => tls_for(plain, &domain_owned, true).await,
                Tls::Https => tls_for(plain, &domain_owned, false).await,
                Tls::StartTls => {
                    starttls(&mut plain, &domain_owned).await?;
                    tls_for(plain, &domain_owned, false).await
                }
            }
        })
        .await
        .map_err(|_| "the XMPP server took too long to answer".to_string())?
    });
    let io = match opened {
        Ok(io) => io,
        Err(e) => {
            if let Some((name, token)) = &way {
                nostr_way_failed(name, *token);
            }
            return Err(e);
        }
    };
    let (mut read, write) = tokio::io::split(io);
    let (sender, chunks) = tokio::sync::mpsc::channel(STREAM_BACKLOG);
    let reader = runtime.spawn(async move {
        use tokio::io::AsyncReadExt;
        let mut piece = vec![0u8; 16 * 1024];
        loop {
            match read.read(&mut piece).await {
                Ok(0) | Err(_) => break,
                Ok(n) => {
                    if sender.send(piece[..n].to_vec()).await.is_err() {
                        break;
                    }
                }
            }
        }
    });
    let stream = Stream { writer: tokio::sync::Mutex::new(write), chunks: tokio::sync::Mutex::new(chunks), reader, way };
    let id = NEXT.fetch_add(1, Ordering::Relaxed);
    streams().insert(id, Arc::new(stream));
    Ok(id)
}

fn stream_of(id: u64) -> Result<Arc<Stream>> {
    streams().get(&id).cloned().ok_or_else(|| "the connection to the XMPP server is closed".to_string())
}

fn stream_failed(id: u64, stream: &Stream) {
    if let Some((name, token)) = &stream.way {
        nostr_way_failed(name, *token);
    }
    stream_close(id);
}

/// Sends bytes on an XMPP server's connection.
pub fn stream_write(id: u64, bytes: &[u8]) -> Result<()> {
    let stream = stream_of(id)?;
    let bytes = bytes.to_vec();
    let inner = stream.clone();
    let sent = runtime()?.block_on(async move {
        use tokio::io::AsyncWriteExt;
        let mut writer = inner.writer.lock().await;
        tokio::time::timeout(WAIT, async {
            writer.write_all(&bytes).await?;
            writer.flush().await
        })
        .await
        .map_err(|_| "the XMPP server did not take it in time".to_string())?
        .map_err(|e| e.to_string())
    });
    if sent.is_err() {
        stream_failed(id, &stream);
    }
    sent
}

/// What the server sent since, waiting up to `wait` for something: None when nothing came in
/// that time. Once the server has closed the connection and all it said is taken, an error.
pub fn stream_read(id: u64, wait: Duration) -> Result<Option<Vec<u8>>> {
    let stream = stream_of(id)?;
    let inner = stream.clone();
    let next = runtime()?.block_on(async move {
        let mut chunks = inner.chunks.lock().await;
        match tokio::time::timeout(wait, chunks.recv()).await {
            Err(_) => Ok(None),
            Ok(None) => Err("the XMPP server closed the connection".to_string()),
            Ok(Some(mut bytes)) => {
                // What else came meanwhile goes too, in one answer.
                while let Ok(more) = chunks.try_recv() {
                    bytes.extend_from_slice(&more);
                }
                Ok(Some(bytes))
            }
        }
    });
    if next.is_err() {
        stream_failed(id, &stream);
    }
    next
}

/// Closes an XMPP server's connection. Closing one already closed does nothing.
pub fn stream_close(id: u64) {
    let stream = streams().remove(&id);
    if let (Some(stream), Ok(runtime)) = (stream, runtime()) {
        stream.reader.abort();
        runtime.spawn(async move {
            use tokio::io::AsyncWriteExt;
            let _ = stream.writer.lock().await.shutdown().await;
        });
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn xmpp_starttls_waits_for_the_servers_yes() {
        use tokio::io::{AsyncReadExt, AsyncWriteExt};
        let runtime = tokio::runtime::Builder::new_current_thread().enable_all().build().unwrap();
        runtime.block_on(async {
            for (offers, answers, ok) in [(true, "<proceed xmlns='urn:ietf:params:xml:ns:xmpp-tls'/>", true), (true, "<failure xmlns='urn:ietf:params:xml:ns:xmpp-tls'/>", false), (false, "", false)] {
                let (mut ours, mut server) = tokio::io::duplex(4096);
                let serve = tokio::spawn(async move {
                    let mut piece = [0u8; 1024];
                    let n = server.read(&mut piece).await.unwrap();
                    assert!(String::from_utf8_lossy(&piece[..n]).contains("to='example.org'"));
                    let tls = if offers { "<starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'><required/></starttls>" } else { "" };
                    // The features come in two pieces, as a network may cut them.
                    server.write_all(b"<?xml version='1.0'?><stream:stream from='example.org' id='1' version='1.0' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams'><stream:features>").await.unwrap();
                    server.write_all(format!("{tls}</stream:features>").as_bytes()).await.unwrap();
                    if offers {
                        let n = server.read(&mut piece).await.unwrap();
                        assert!(String::from_utf8_lossy(&piece[..n]).contains("<starttls"));
                        server.write_all(answers.as_bytes()).await.unwrap();
                    }
                    server
                });
                assert_eq!(super::starttls(&mut ours, "example.org").await.is_ok(), ok);
                drop(serve.await.unwrap());
            }
        });
    }

    use super::*;

    #[test]
    fn reads_http_answers() {
        let plain = b"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 2\r\n\r\n{}extra";
        assert_eq!(http_answer(plain).unwrap(), (200, b"{}".to_vec()));
        let chunked = b"HTTP/1.1 404 Not Found\r\nTransfer-Encoding: chunked\r\n\r\n4\r\nWiki\r\n5;x=1\r\npedia\r\n0\r\n\r\n";
        assert_eq!(http_answer(chunked).unwrap(), (404, b"Wikipedia".to_vec()));
        assert_eq!(http_answer(b"HTTP/1.1 204 No Content\r\n\r\n").unwrap(), (204, vec![]));
        assert!(http_answer(b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n9\r\nWiki").is_err());
        // A chunk cut off right after its bytes, with no line end: an error, no slice past the end.
        assert!(http_answer(b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n4\r\nWiki").is_err());
        assert!(http_answer(b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n4\r\nWiki\r").is_err());
        assert!(http_answer(b"garbage").is_err());
    }

    #[test]
    fn reads_relay_addresses() {
        let at = |tls, host: &str, port| Address { tls, host: host.to_string(), port };
        assert_eq!(parse("wss://relay.example.org").unwrap(), at(true, "relay.example.org", 443));
        assert_eq!(parse("ws://relay:7879").unwrap(), at(false, "relay", 7879));
        assert_eq!(parse("wss://relay.example.org:8443/erevos?x=1").unwrap(), at(true, "relay.example.org", 8443));
        assert_eq!(parse("ws://abcdefghijklmnop.onion/sealed").unwrap(), at(false, "abcdefghijklmnop.onion", 80));
        assert_eq!(parse("ws://[::1]:7879").unwrap(), at(false, "::1", 7879));
        assert!(parse("http://relay").is_err());
        assert!(parse("ws://:7879").is_err());
        assert!(parse("ws://relay:port").is_err());
    }

    const OBFS4: &str = "obfs4 192.0.2.10:443 0123456789ABCDEF0123456789ABCDEF01234567 cert=YXJlIGZyZXF1ZW50bHkgZnVsbCBvZiBsaXR0bGUgbWVzc2FnZXMgeW91IGNhbiBmaW5kLg iat-mode=0";
    const PLAIN: &str = "192.0.2.20:9001 0123456789ABCDEF0123456789ABCDEF01234567";

    fn configured(lines: &[&str], transports: Option<&str>) -> Result<TorClientConfig> {
        let dir = std::env::temp_dir().join("erevos-tor-check");
        let bridges = Bridges {
            lines: lines.iter().map(|line| line.to_string()).collect(),
            transports: transports.map(PathBuf::from),
        };
        configure(&dir.join("state"), &dir.join("cache"), &bridges)
    }

    #[test]
    fn each_nostr_relay_has_circuits_of_its_own_new_after_a_failure() {
        let damus = nostr_way("relay.damus.io.check");
        assert_eq!(nostr_way("relay.damus.io.check"), damus);
        assert_ne!(nostr_way("nos.lol.check"), damus);
        nostr_way_failed("relay.damus.io.check", damus);
        let next = nostr_way("relay.damus.io.check");
        assert_ne!(next, damus);
        // A failure on the circuits before, told late, leaves the new ones be.
        nostr_way_failed("relay.damus.io.check", damus);
        assert_eq!(nostr_way("relay.damus.io.check"), next);
    }

    #[test]
    fn goes_through_bridges_only_when_given() {
        assert!(configured(&[], None).is_ok());
        assert!(configured(&[PLAIN], None).is_ok());
        assert!(configured(&[OBFS4, PLAIN], Some("/data/app/lib/arm64/liblyrebird.so")).is_ok());
        // A transport the app does not carry is never left to Tor to go around.
        let err = configured(&[OBFS4], None).unwrap_err();
        assert!(err.contains("no obfs4"), "{err}");
        let err = configured(&["conjure 192.0.2.30:443 0123456789ABCDEF0123456789ABCDEF01234567"], Some("/x")).unwrap_err();
        assert!(err.contains("no conjure"), "{err}");
        assert!(configured(&["obfs4 not-a-bridge"], Some("/x")).is_err());
        assert_eq!(transport_of(OBFS4), Some("obfs4"));
        assert_eq!(transport_of(PLAIN), None);
        assert_eq!(transport_of("[2001:db8::1]:443 0123456789ABCDEF0123456789ABCDEF01234567"), None);
    }

    #[test]
    fn reads_the_bridges_the_app_comes_with() {
        // app/lib/bridges.ts BUILT_IN, as the app sends them.
        let app = include_str!("../../../app/lib/bridges.ts");
        let stun = app.split("const STUN =\n  '").nth(1).and_then(|rest| rest.split('\'').next()).unwrap();
        let lines: Vec<String> = app
            .lines()
            .map(|line| line.trim().trim_end_matches(','))
            .filter(|line| line.starts_with("'obfs4 ") || line.starts_with("`snowflake "))
            .map(|line| line.trim_matches(['\'', '`']).replace("${STUN}", stun))
            .collect();
        assert_eq!(lines.len(), 9);
        let lines: Vec<&str> = lines.iter().map(String::as_str).collect();
        assert!(configured(&lines, Some("/x")).is_ok());
        for line in lines {
            assert!(line.parse::<BridgeConfigBuilder>().is_ok(), "{line}");
        }
    }

    #[test]
    fn says_when_tor_is_off() {
        stop();
        assert_eq!(status(), ("off".to_string(), false));
        assert!(request("ws://relay:7879", "", b"x").unwrap_err().contains("not started"));
        assert!(call(12345, b"x").is_err());
        close(12345);
        assert!(text_open("wss://relay.example.org").unwrap_err().contains("not started"));
        assert!(text_send(12345, "[]").is_err());
        assert!(text_next(12345, Duration::from_millis(1)).is_err());
        text_close(12345);
    }
}
