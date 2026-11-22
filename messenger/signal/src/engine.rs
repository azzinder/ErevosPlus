// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

//! The Signal engine: one thread of its own, where presage runs (its futures are not Send),
//! taking calls from the app and sending events back.

use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::rc::Rc;
use std::str::FromStr;
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use base64::engine::general_purpose::STANDARD as B64;
use base64::Engine as _;
use futures::channel::oneshot as fut_oneshot;
use futures::{pin_mut, StreamExt};
use presage::libsignal_service::configuration::SignalServers;
use presage::libsignal_service::content::{Content, ContentBody};
use presage::libsignal_service::prelude::phonenumber::PhoneNumber;
use presage::libsignal_service::profile_name::ProfileName;
use presage::libsignal_service::protocol::ServiceId;
use presage::libsignal_service::sender::AttachmentSpec;
use presage::manager::{Confirmation, Registered, RegistrationOptions};
use presage::model::contacts::Contact;
use presage::model::groups::Group;
use presage::model::identity::OnNewIdentity;
use presage::model::messages::Received;
use presage::proto::data_message::{Delete, PinMessage, PollCreate, PollVote, Quote, Reaction, UnpinMessage};
use presage::proto::{receipt_message, AttachmentPointer, DataMessage, GroupContextV2, ReceiptMessage};
use presage::store::{ContentsStore, StateStore, Thread};
use presage::Manager;
use presage_store_sqlite::SqliteStore;
use serde::Deserialize;
use serde_json::{json, Value};
use tokio::sync::{mpsc, oneshot};
use uuid::Uuid;

use crate::events::{self, Pending};
use crate::keys;
use crate::Listener;

type Store = SqliteStore;
type Ready = Manager<Store, Registered>;

/// A call from the app: its op, its arguments, and where the answer goes.
struct Call {
    op: String,
    args: String,
    reply: oneshot::Sender<String>,
}

/// The app's handle on the engine. Calls block until the engine answers.
pub struct Engine {
    calls: mpsc::UnboundedSender<Call>,
}

impl Engine {
    /// Starts the engine's thread. `dir` holds the encrypted database and fetched media.
    pub fn new(dir: PathBuf, listener: Arc<dyn Listener>) -> Engine {
        let (tx, rx) = mpsc::unbounded_channel();
        std::thread::Builder::new()
            .name("erevos-signal".into())
            // presage's futures are large (more so unoptimised): a roomy stack.
            .stack_size(32 * 1024 * 1024)
            .spawn(move || {
                let rt = tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build()
                    .expect("signal runtime");
                let local = tokio::task::LocalSet::new();
                local.block_on(&rt, run(dir, listener, rx));
            })
            .expect("signal thread");
        Engine { calls: tx }
    }

    /// One call: `op` with JSON `args`; answers `{"ok": …}` or `{"error": "…"}`.
    pub fn call(&self, op: &str, args: &str) -> String {
        let (reply, answer) = oneshot::channel();
        if self.calls.send(Call { op: op.to_string(), args: args.to_string(), reply }).is_err() {
            return json!({"error": "signal engine stopped"}).to_string();
        }
        answer.blocking_recv().unwrap_or_else(|_| json!({"error": "no answer"}).to_string())
    }
}

async fn run(dir: PathBuf, listener: Arc<dyn Listener>, mut rx: mpsc::UnboundedReceiver<Call>) {
    let inner = Rc::new(Inner::new(dir, listener));
    while let Some(call) = rx.recv().await {
        let inner = inner.clone();
        tokio::task::spawn_local(async move {
            let answer = match inner.call(&call.op, &call.args).await {
                Ok(v) => json!({"ok": v}),
                Err(e) => json!({"error": e}),
            };
            let _ = call.reply.send(answer.to_string());
        });
    }
}

/// Where the account is.
enum Account {
    /// Not opened yet (no key given), or opened and not registered.
    None,
    /// Waiting for the code sent by SMS or call.
    Confirming(Manager<Store, Confirmation>),
    /// Registered or linked: messages flow.
    Ready(Ready),
}

/// A chat as the engine knows it.
#[derive(Clone)]
struct Chat {
    thread: Thread,
    name: String,
    group: bool,
    last_ms: u64,
    snippet: String,
    /// Messages from others not yet marked read: (sender, timestamp).
    unread: Vec<(Uuid, u64)>,
    /// The newest message marked read, here or on another device of the account: one that comes
    /// again (a redelivery after a reconnect) is not unread anew.
    read_to: u64,
    pinned: String,
    /// Disappearing messages: seconds (0 = off) and the timer's version.
    expire: u32,
    expire_version: u32,
}

/// A poll's state: its options and each voter's choice.
#[derive(Default)]
struct Poll {
    thread: i64,
    options: Vec<String>,
    votes: HashMap<Uuid, Vec<u32>>,
}

struct Inner {
    dir: PathBuf,
    listener: Arc<dyn Listener>,
    store: RefCell<Option<Store>>,
    account: RefCell<Account>,
    self_uuid: RefCell<Uuid>,
    chats: RefCell<HashMap<i64, Chat>>,
    people: RefCell<HashMap<i64, Uuid>>,
    names: RefCell<HashMap<Uuid, String>>,
    polls: RefCell<HashMap<String, Poll>>,
    /// Our own reaction on each message, to take it back.
    my_reactions: RefCell<HashMap<String, String>>,
    /// Profiles being fetched, so each is asked once.
    asking: RefCell<HashSet<Uuid>>,
    receiving: RefCell<bool>,
    /// The receiving task, stopped when Signal is removed.
    receiver: RefCell<Option<tokio::task::JoinHandle<()>>>,
    log: RefCell<Vec<String>>,
    /// Each contact's identity key as last seen, both hashed: a change means a new safety number.
    identities: RefCell<Option<HashMap<String, String>>>,
    /// Whether the account sends read receipts, as its primary phone last said (Signal's setting);
    /// None until it says, kept in settings.json.
    read_receipts: RefCell<Option<Option<bool>>>,
    /// Whom our replies carry our PNI signature to: those who wrote to our phone number and have
    /// not yet written to this account itself. Kept in pni-signature.json.
    pni_signed: RefCell<Option<HashSet<Uuid>>>,
}

#[derive(Deserialize, Default)]
#[serde(default)]
struct Args {
    key: String,
    phone: String,
    captcha: String,
    voice: bool,
    code: String,
    name: String,
    thread: i64,
    text: String,
    id: String,
    emoji: String,
    to: Vec<i64>,
    path: String,
    thumb: String,
    mime: String,
    caption: String,
    #[serde(rename = "asSticker")]
    as_sticker: bool,
    #[serde(rename = "durationMs")]
    duration_ms: i64,
    w: u32,
    h: u32,
    #[serde(rename = "replyTo")]
    reply_to: String,
    question: String,
    options: Vec<String>,
    poll: i64,
    selected: Vec<i64>,
    query: String,
    person: i64,
    people: Vec<i64>,
    title: String,
    admin: bool,
    /// setProxy: socks5h://user:pass@127.0.0.1:port (Tor), or empty for direct.
    url: String,
    #[serde(rename = "given")]
    given: String,
    family: String,
}

fn now_ms() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

fn err<E: std::fmt::Display>(e: E) -> String {
    e.to_string()
}

impl Inner {
    fn new(dir: PathBuf, listener: Arc<dyn Listener>) -> Inner {
        Inner {
            dir,
            listener,
            store: RefCell::new(None),
            account: RefCell::new(Account::None),
            self_uuid: RefCell::new(Uuid::nil()),
            chats: RefCell::new(HashMap::new()),
            people: RefCell::new(HashMap::new()),
            names: RefCell::new(HashMap::new()),
            polls: RefCell::new(HashMap::new()),
            my_reactions: RefCell::new(HashMap::new()),
            asking: RefCell::new(HashSet::new()),
            receiving: RefCell::new(false),
            receiver: RefCell::new(None),
            log: RefCell::new(Vec::new()),
            identities: RefCell::new(None),
            read_receipts: RefCell::new(None),
            pni_signed: RefCell::new(None),
        }
    }

    fn emit(&self, v: Value) {
        self.listener.on_event(v.to_string());
    }

    fn note(&self, line: impl Into<String>) {
        let line = line.into();
        let mut log = self.log.borrow_mut();
        log.push(line.clone());
        if log.len() > 400 {
            log.drain(..100);
        }
        drop(log);
        self.emit(json!({"type": "log", "line": format!("signal: {line}")}));
    }

    fn manager(&self) -> Result<Ready, String> {
        match &*self.account.borrow() {
            Account::Ready(m) => Ok(m.clone()),
            _ => Err("not signed in".into()),
        }
    }

    fn store(&self) -> Result<Store, String> {
        self.store.borrow().clone().ok_or_else(|| "not started".to_string())
    }

    async fn call(self: &Rc<Self>, op: &str, args: &str) -> Result<Value, String> {
        let a: Args = if args.trim().is_empty() { Args::default() } else { serde_json::from_str(args).map_err(err)? };
        match op {
            "open" => self.open(&a.key).await,
            "loggedIn" => Ok(json!(matches!(&*self.account.borrow(), Account::Ready(_)))),
            "register" => self.register(&a).await,
            "confirm" => self.confirm(&a.code).await,
            "link" => self.link(&a.name).await,
            "start" => self.start().await,
            "logout" => self.logout().await,
            "log" => Ok(json!(self.log.borrow().join("\n"))),
            "setProfile" => self.set_profile(&a.given, &a.family).await,
            "messages" => self.messages(a.thread).await,
            "sendText" => self.send_text(a.thread, &a.text, &a.reply_to).await,
            "sendMedia" => self.send_media(&a).await,
            "react" => self.react(&a.id, &a.emoji).await,
            "unsend" => self.unsend(&a.id).await,
            "edit" => self.edit(&a.id, &a.text).await,
            "renameGroup" => self.change_group(a.thread, crate::groups::Change::Title(a.title.clone())).await,
            "removeMember" => {
                let u = self.person_uuid(a.person)?;
                self.change_group(a.thread, crate::groups::Change::Remove(u)).await
            }
            "setAdmin" => {
                let u = self.person_uuid(a.person)?;
                self.change_group(a.thread, crate::groups::Change::Admin(u, a.admin)).await
            }
            "addMembers" => {
                let people = a.people.iter().map(|p| self.person_uuid(*p)).collect::<Result<Vec<_>, _>>()?;
                self.change_group(a.thread, crate::groups::Change::Invite(people)).await
            }
            "deleteForMe" => self.delete_for_me(&a.id).await,
            "forward" => self.forward(&a.id, &a.to).await,
            "markRead" => self.mark_read(a.thread).await,
            "markAllRead" => self.mark_all_read().await,
            "createPoll" => self.create_poll(a.thread, &a.question, &a.options).await,
            "votePoll" => self.vote_poll(a.poll, &a.selected).await,
            "pin" => self.pin(&a.id, true).await,
            "unpin" => self.pin(&a.id, false).await,
            "members" => self.members(a.thread).await,
            "contacts" => self.contacts().await,
            "searchPeople" => self.search_people(&a.query).await,
            "startChat" => self.start_chat(a.person, &a.id, &a.name).await,
            "callSend" => {
                let send: crate::calls::Send = serde_json::from_str(args).map_err(err)?;
                self.call_send(&send).await
            }
            "callRelays" => self.call_relays().await,
            "callPeer" => self.call_peer(a.person),
            "setProxy" => self.set_proxy(&a.url).await,
            _ => Err(format!("unknown op {op:?}")),
        }
    }

    // ---- account ----

    /// Opens the encrypted database with the key the app keeps in the Android Keystore.
    async fn open(self: &Rc<Self>, key: &str) -> Result<Value, String> {
        if self.store.borrow().is_some() {
            return Ok(json!({"registered": matches!(&*self.account.borrow(), Account::Ready(_))}));
        }
        if key.len() < 32 {
            return Err("missing database key".into());
        }
        std::fs::create_dir_all(&self.dir).map_err(err)?;
        let path = self.dir.join("signal.db");
        let url = format!("sqlite://{}", path.display());
        let store = SqliteStore::open_with_passphrase(&url, Some(key), OnNewIdentity::Trust).await.map_err(err)?;
        let registered = store.is_registered().await;
        *self.store.borrow_mut() = Some(store.clone());
        if registered {
            match Manager::load_registered(store).await {
                Ok(m) => {
                    *self.self_uuid.borrow_mut() = m.registration_data().service_ids.aci;
                    *self.account.borrow_mut() = Account::Ready(m);
                }
                Err(e) => self.note(format!("load: {e}")),
            }
        }
        Ok(json!({"registered": matches!(&*self.account.borrow(), Account::Ready(_))}))
    }

    /// Asks Signal to send a code to `phone` (by SMS, or a call). A captcha is needed first:
    /// the app opens signalcaptchas.org and passes the signalcaptcha:// token it gives.
    async fn register(self: &Rc<Self>, a: &Args) -> Result<Value, String> {
        let store = self.store()?;
        let phone = PhoneNumber::from_str(a.phone.trim()).map_err(|_| "invalid phone number".to_string())?;
        let captcha = a.captcha.trim();
        let m = Manager::register(
            store,
            RegistrationOptions {
                signal_servers: SignalServers::Production,
                phone_number: phone,
                use_voice_call: a.voice,
                captcha: if captcha.is_empty() { None } else { Some(captcha) },
                force: true,
            },
        )
        .await
        .map_err(|e| match e {
            presage::Error::CaptchaRequired => "captcha required".to_string(),
            e => e.to_string(),
        })?;
        *self.account.borrow_mut() = Account::Confirming(m);
        Ok(json!(true))
    }

    async fn confirm(self: &Rc<Self>, code: &str) -> Result<Value, String> {
        let m = match std::mem::replace(&mut *self.account.borrow_mut(), Account::None) {
            Account::Confirming(m) => m,
            other => {
                *self.account.borrow_mut() = other;
                return Err("no code was asked".into());
            }
        };
        let digits: String = code.chars().filter(|c| c.is_ascii_digit()).collect();
        match m.clone().confirm_verification_code(&digits).await {
            Ok(ready) => {
                *self.self_uuid.borrow_mut() = ready.registration_data().service_ids.aci;
                *self.account.borrow_mut() = Account::Ready(ready);
                Ok(json!(true))
            }
            Err(e) => {
                // Keep waiting for the right code.
                *self.account.borrow_mut() = Account::Confirming(m);
                Err(e.to_string())
            }
        }
    }

    /// Links this phone as another device of an existing Signal account: the link URL comes
    /// as a "signalLink" event (shown as a QR code), and "signalLinked" once scanned.
    async fn link(self: &Rc<Self>, name: &str) -> Result<Value, String> {
        let store = self.store()?;
        let (tx, rx) = fut_oneshot::channel::<url::Url>();
        let me = self.clone();
        let device = if name.trim().is_empty() { "Erevos".to_string() } else { name.trim().to_string() };
        tokio::task::spawn_local(async move {
            let shown = me.clone();
            tokio::task::spawn_local(async move {
                if let Ok(url) = rx.await {
                    shown.emit(json!({"type": "signalLink", "url": url.to_string()}));
                }
            });
            match Manager::link_secondary_device(store, SignalServers::Production, device, tx).await {
                Ok(mut m) => {
                    // Ask the main phone for its contacts at once, so chats get their names.
                    if let Err(e) = m.request_contacts().await {
                        me.note(format!("contacts sync: {e}"));
                    }
                    *me.self_uuid.borrow_mut() = m.registration_data().service_ids.aci;
                    *me.account.borrow_mut() = Account::Ready(m);
                    me.emit(json!({"type": "signalLinked"}));
                }
                Err(e) => me.emit(json!({"type": "signalLinkFailed", "error": e.to_string()})),
            }
        });
        Ok(json!(true))
    }

    /// Removes Signal from this phone: the registration, and then every file (messages, media,
    /// known safety numbers). The database key file is the app's and goes with its folder too.
    async fn logout(self: &Rc<Self>) -> Result<Value, String> {
        // Stop receiving first, so nothing arrives and writes media while the files go.
        if let Some(h) = self.receiver.borrow_mut().take() {
            h.abort();
        }
        *self.receiving.borrow_mut() = false;
        *self.account.borrow_mut() = Account::None;
        self.chats.borrow_mut().clear();
        self.people.borrow_mut().clear();
        self.names.borrow_mut().clear();
        *self.identities.borrow_mut() = None;
        let store = self.store.borrow_mut().take();
        if let Some(mut store) = store {
            // If this fails, the files below still go, and with them the registration.
            if let Err(e) = store.clear_registration().await {
                self.note(format!("clear registration: {e}"));
            }
            drop(store);
        }
        if let Ok(entries) = std::fs::read_dir(&self.dir) {
            for e in entries.flatten() {
                let p = e.path();
                let name = e.file_name().to_string_lossy().to_string();
                if name.starts_with("signal.db") || name == "identities.json" || name == "media" || name == "db.key" {
                    let _ = if p.is_dir() { std::fs::remove_dir_all(&p) } else { std::fs::remove_file(&p) };
                }
            }
        }
        Ok(json!(true))
    }

    async fn set_profile(self: &Rc<Self>, given: &str, family: &str) -> Result<Value, String> {
        let mut m = self.manager()?;
        let name = ProfileName {
            given_name: given.trim().to_string(),
            family_name: if family.trim().is_empty() { None } else { Some(family.trim().to_string()) },
        };
        m.update_profile(name, None, None).await.map_err(err)?;
        Ok(json!(true))
    }

    // ---- start and receiving ----

    /// Lists the chats and starts receiving.
    async fn start(self: &Rc<Self>) -> Result<Value, String> {
        let m = self.manager()?;
        let me = *self.self_uuid.borrow();
        self.load_chats(&m).await;
        if !*self.receiving.borrow() {
            *self.receiving.borrow_mut() = true;
            let inner = self.clone();
            let h = tokio::task::spawn_local(async move { inner.receive_forever().await });
            *self.receiver.borrow_mut() = Some(h);
        }
        Ok(json!({"self": keys::person(&me), "phone": m.registration_data().phone_number.to_string()}))
    }

    async fn load_chats(self: &Rc<Self>, m: &Ready) {
        let store = m.store().clone();
        if let Ok(contacts) = store.contacts().await {
            for c in contacts.flatten() {
                let name = if c.name.is_empty() {
                    c.phone_number.as_ref().map(|p| p.to_string()).unwrap_or_default()
                } else {
                    c.name.clone()
                };
                if !name.is_empty() {
                    self.names.borrow_mut().insert(c.uuid, name);
                }
                self.people.borrow_mut().insert(keys::person(&c.uuid), c.uuid);
                self.touch_chat(m, Thread::Contact(ServiceId::Aci(c.uuid.into()))).await;
            }
        }
        if let Ok(groups) = store.groups().await {
            for (mk, g) in groups.flatten() {
                for member in &g.members {
                    let u: Uuid = member.aci.into();
                    self.people.borrow_mut().insert(keys::person(&u), u);
                }
                self.touch_chat(m, Thread::Group(mk)).await;
            }
        }
    }

    fn key_of(thread: &Thread) -> i64 {
        match thread {
            Thread::Contact(sid) => keys::person(&sid.raw_uuid()),
            Thread::Group(mk) => keys::group(mk),
        }
    }

    /// Makes sure a chat is known, with its name and last message, and tells the app.
    async fn touch_chat(self: &Rc<Self>, m: &Ready, thread: Thread) -> i64 {
        let key = Self::key_of(&thread);
        if !self.chats.borrow().contains_key(&key) {
            let (name, group) = match &thread {
                Thread::Contact(sid) => (self.name_of(&sid.raw_uuid()), false),
                Thread::Group(mk) => (
                    m.store().group(*mk).await.ok().flatten().map(|g| g.title).unwrap_or_default(),
                    true,
                ),
            };
            let mut chat = Chat { thread: thread.clone(), name, group, last_ms: 0, snippet: String::new(), unread: vec![], read_to: 0, pinned: String::new(), expire: 0, expire_version: 0 };
            if let Ok(msgs) = m.store().messages(&thread, ..).await {
                let list: Vec<Content> = msgs.flatten().filter(|c| matches!(c.body, ContentBody::DataMessage(_) | ContentBody::SynchronizeMessage(_))).collect();
                if let Some(last) = list.last() {
                    chat.last_ms = last.metadata.client_timestamp.timestamp_millis().max(0) as u64;
                    chat.snippet = snippet_of(last);
                }
                // The disappearing timer as the latest real message carried it.
                for c in list.iter().rev() {
                    let dm = match &c.body {
                        ContentBody::DataMessage(dm) => Some(dm),
                        ContentBody::SynchronizeMessage(sync) => events::sent_of(sync).map(|(dm, _)| dm),
                        _ => None,
                    };
                    if let Some(dm) = dm.filter(|dm| dm.reaction.is_none() && dm.delete.is_none()) {
                        chat.expire = dm.expire_timer.unwrap_or(0);
                        chat.expire_version = dm.expire_timer_version.unwrap_or(0);
                        break;
                    }
                }
            }
            self.chats.borrow_mut().insert(key, chat);
        }
        self.emit_chat(key);
        key
    }

    fn emit_chat(&self, key: i64) {
        let chats = self.chats.borrow();
        let Some(c) = chats.get(&key) else { return };
        self.emit(json!({"type": "thread", "thread": {
            "key": key, "name": if c.name.is_empty() { "Signal".to_string() } else { c.name.clone() },
            "snippet": c.snippet, "lastMs": c.last_ms, "encrypted": true, "group": c.group,
            "unread": !c.unread.is_empty(), "pinned": c.pinned, "network": "signal",
        }}));
    }

    async fn receive_forever(self: Rc<Self>) {
        let mut wait = 2u64;
        loop {
            let Ok(mut m) = self.manager() else {
                tokio::time::sleep(Duration::from_secs(10)).await;
                continue;
            };
            match m.receive_messages().await {
                Ok(stream) => {
                    self.emit(json!({"type": "status", "network": "signal", "status": "συνδέθηκε"}));
                    wait = 2;
                    pin_mut!(stream);
                    while let Some(item) = stream.next().await {
                        match item {
                            Received::QueueEmpty => self.note("caught up"),
                            Received::Contacts => {
                                let m2 = m.clone();
                                self.load_chats(&m2).await;
                            }
                            Received::DecryptionError(sid) => self.note(format!("could not decrypt a message from {}", sid.service_id_string())),
                            Received::Content(content) => {
                                if let ContentBody::CallMessage(cm) = &content.body {
                                    self.take_call(&m, &content, cm).await;
                                } else {
                                    self.take(&m, &content, true).await;
                                }
                            }
                        }
                    }
                    self.note("connection closed");
                }
                Err(e) => self.note(format!("receive: {e}")),
            }
            self.emit(json!({"type": "status", "network": "signal", "status": "επανασύνδεση"}));
            tokio::time::sleep(Duration::from_secs(wait)).await;
            wait = (wait * 2).min(120);
        }
    }

    // ---- reading messages ----

    fn name_of(&self, u: &Uuid) -> String {
        self.names.borrow().get(u).cloned().unwrap_or_default()
    }

    /// Fetches a person's Signal profile name once, in the background.
    fn ask_profile(self: &Rc<Self>, m: &Ready, u: Uuid) {
        self.ask_profile_with(m, u, None);
    }

    /// Same, with the profile key a message of theirs carried (`given`), for when the store has
    /// none yet. When it cannot be had now (no key yet, the network), it is asked again with their
    /// next message, never left nameless for the rest of the run.
    fn ask_profile_with(self: &Rc<Self>, m: &Ready, u: Uuid, given: Option<[u8; 32]>) {
        if u.is_nil() || self.names.borrow().contains_key(&u) || !self.asking.borrow_mut().insert(u) {
            return;
        }
        let me = self.clone();
        let mut m = m.clone();
        tokio::task::spawn_local(async move {
            let sid = ServiceId::Aci(u.into());
            let kept = m.store().profile_key(&sid).await.ok().flatten();
            let Some(pk) = kept.or_else(|| given.map(presage::libsignal_service::prelude::ProfileKey::create)) else {
                me.asking.borrow_mut().remove(&u);
                me.note("profile: no key yet");
                return;
            };
            if kept.is_none() {
                let _ = m.store().clone().upsert_profile_key(&u, pk).await;
            }
            match m.retrieve_profile_by_uuid(u, pk).await {
                Ok(p) => {
                    let name = p.name.map(|n| {
                        let family = n.family_name.unwrap_or_default();
                        format!("{} {}", n.given_name, family).trim().to_string()
                    });
                    if let Some(name) = name.filter(|n| !n.is_empty()) {
                        me.names.borrow_mut().insert(u, name.clone());
                        // Keep it as a contact, so the chat is listed on the next start.
                        let mut store = m.store().clone();
                        let _ = store
                            .save_contact(&Contact {
                                uuid: u,
                                phone_number: None,
                                name: name.clone(),
                                verified: Default::default(),
                                profile_key: pk.get_bytes().to_vec(),
                                expire_timer: 0,
                                expire_timer_version: 2,
                                inbox_position: 0,
                                avatar: None,
                            })
                            .await;
                        let key = keys::person(&u);
                        if let Some(c) = me.chats.borrow_mut().get_mut(&key) {
                            c.name = name;
                        }
                        me.emit_chat(key);
                    }
                }
                Err(e) => {
                    me.asking.borrow_mut().remove(&u);
                    me.note(format!("profile: {e}"));
                }
            }
        });
    }

    fn media_dir(&self) -> PathBuf {
        self.dir.join("media")
    }

    fn media_path(&self, message_id: &str, index: usize, p: &AttachmentPointer) -> PathBuf {
        let safe: String = message_id.chars().map(|c| if c.is_ascii_alphanumeric() { c } else { '_' }).collect();
        let ext = p
            .file_name
            .as_deref()
            .and_then(|n| Path::new(n).extension().and_then(|e| e.to_str()).map(|e| e.to_string()))
            .or_else(|| {
                p.content_type
                    .as_deref()
                    .and_then(|m| mime_guess::get_mime_extensions_str(m))
                    .and_then(|e| e.first().map(|s| s.to_string()))
            })
            .unwrap_or_else(|| "bin".into());
        self.media_dir().join(format!("{safe}-{index}.{ext}"))
    }

    /// One decrypted message: tell the app, fetch its media, keep chats and polls up to date.
    /// `live` is false while history is replayed for the screen.
    /// Tells in the chat when someone's safety number changed (a new phone, a reinstall, or someone
    /// in between). Signal keeps the conversation going either way; this only makes it visible.
    async fn check_identity(self: &Rc<Self>, m: &Ready, sender: Uuid, key: i64) {
        use presage::libsignal_service::protocol::{DeviceId, IdentityKeyStore, ProtocolAddress};
        use presage::store::Store as _;
        use sha2::{Digest, Sha256};
        let Ok(device) = DeviceId::try_from(1u32) else { return };
        let addr = ProtocolAddress::new(sender.to_string(), device);
        let Ok(Some(identity)) = m.store().aci_protocol_store().get_identity(&addr).await else { return };
        let who = hex::encode(Sha256::digest(sender.as_bytes()));
        let now = hex::encode(Sha256::digest(&identity.serialize()));
        let file = self.dir.join("identities.json");
        let changed = {
            let mut cache = self.identities.borrow_mut();
            let map = cache.get_or_insert_with(|| {
                std::fs::read(&file).ok().and_then(|b| serde_json::from_slice(&b).ok()).unwrap_or_default()
            });
            let before = map.insert(who, now.clone());
            let changed = before.as_ref().is_some_and(|b| *b != now);
            if before.as_deref() != Some(now.as_str()) {
                if let Ok(b) = serde_json::to_vec(&*map) {
                    let _ = std::fs::write(&file, b);
                }
            }
            changed
        };
        if changed {
            let ms = now_ms();
            let name = self.name_of(&sender);
            self.emit(json!({"type": "message", "message": {
                "thread": key, "id": format!("sg:info:{ms}:{sender}"), "sender": keys::person(&sender), "name": name,
                "text": format!("🔐 Ο κωδικός ασφαλείας του/της {} άλλαξε. Συνήθως σημαίνει νέο κινητό ή νέα εγκατάσταση. Αν δεν το περίμενες, έλεγξέ το μαζί του/της από κοντά ή από άλλο δρόμο.", if name.is_empty() { "επαφής".to_string() } else { name.clone() }),
                "ms": ms, "mine": false, "encrypted": true,
            }}));
        }
    }

    async fn take(self: &Rc<Self>, m: &Ready, content: &Content, live: bool) {
        // Read on another device of the account (the phone this one is linked to, or a linked one):
        // read here too, so it neither counts nor notifies.
        if let ContentBody::SynchronizeMessage(sync) = &content.body {
            if !sync.read.is_empty() {
                self.read_elsewhere(&sync.read);
            }
            if let Some(on) = receipts_of(sync) {
                self.set_read_receipts(on);
            }
        }
        let me_now = *self.self_uuid.borrow();
        let Some(thread) = thread_of_content(content, &me_now) else {
            if let ContentBody::ReceiptMessage(_) = &content.body {
                // Delivery and read receipts: not shown yet.
            }
            return;
        };
        let key = self.touch_chat(m, thread.clone()).await;
        let me = *self.self_uuid.borrow();
        let sender = content.metadata.sender.raw_uuid();
        self.people.borrow_mut().insert(keys::person(&sender), sender);
        if sender != me {
            if live {
                self.note_reached_by(sender, &content.metadata.destination);
            }
            self.ask_profile_with(m, sender, profile_key_of(content));
            if live {
                self.check_identity(m, sender, key).await;
            }
        }
        let reading = {
            let names = self.names.borrow();
            let name_of = |u: &Uuid| names.get(u).cloned().unwrap_or_default();
            let local = |id: &str, i: usize, p: &AttachmentPointer| {
                let path = self.media_path(id, i, p);
                path.exists().then(|| format!("file://{}", path.display()))
            };
            events::read(content, key, &me, &name_of, &local)
        };
        for ev in &reading.events {
            if ev["type"] == "pinned" {
                if let Some(c) = self.chats.borrow_mut().get_mut(&key) {
                    c.pinned = ev["id"].as_str().unwrap_or_default().to_string();
                }
            }
            self.emit(ev.clone());
        }
        if let Some((id, question, options)) = reading.poll {
            let mut polls = self.polls.borrow_mut();
            let p = polls.entry(id).or_default();
            p.thread = key;
            p.options = options;
            let _ = question;
        }
        if let Some((poll_id, voter, chosen)) = reading.vote {
            self.polls.borrow_mut().entry(poll_id.clone()).or_default().votes.insert(voter, chosen);
            self.emit_poll(&poll_id);
        }
        if let Some((secs, version)) = reading.expire {
            if let Some(c) = self.chats.borrow_mut().get_mut(&key) {
                // A newer timer (or an old client's, which has no version) wins.
                if version == 0 || version >= c.expire_version {
                    c.expire = secs;
                    c.expire_version = version.max(c.expire_version);
                }
            }
        }
        if let Some(msg) = &reading.message {
            let ms = msg["ms"].as_u64().unwrap_or(0);
            let mine = msg["mine"].as_bool().unwrap_or(false);
            if let Some(c) = self.chats.borrow_mut().get_mut(&key) {
                if ms >= c.last_ms {
                    c.last_ms = ms;
                    c.snippet = msg["text"].as_str().unwrap_or_default().to_string();
                    if c.snippet.is_empty() {
                        c.snippet = "📎".into();
                    }
                }
                if live && !mine && ms > c.read_to && !c.unread.contains(&(sender, ms)) {
                    c.unread.push((sender, ms));
                }
            }
            self.emit_chat(key);
        }
        for p in reading.pending {
            self.fetch_later(m, key, content.clone(), p);
        }
    }

    // ---- calls (src/calls.rs; the call itself is RingRTC's, in the app) ----

    /// A call message from someone: to the app, with what RingRTC needs to take it.
    async fn take_call(self: &Rc<Self>, m: &Ready, content: &Content, cm: &presage::proto::CallMessage) {
        use presage::libsignal_service::protocol::{IdentityKeyStore, ProtocolAddress};
        use presage::store::Store as _;
        let sender = content.metadata.sender.raw_uuid();
        if sender == *self.self_uuid.borrow() {
            // Our own other devices' calls are theirs.
            return;
        }
        let device = content.metadata.sender_device;
        let protocol = m.store().aci_protocol_store();
        let addr = ProtocolAddress::new(sender.to_string(), device);
        let their = protocol.get_identity(&addr).await.ok().flatten().map(|k| B64.encode(k.public_key().public_key_bytes())).unwrap_or_default();
        let mine = protocol.get_identity_key_pair().await.ok().map(|k| B64.encode(k.public_key().public_key_bytes())).unwrap_or_default();
        let sent = content.metadata.server_timestamp.timestamp_millis().max(0) as u64;
        let person = keys::person(&sender);
        self.people.borrow_mut().insert(person, sender);
        self.ask_profile(m, sender);
        let name = self.name_of(&sender);
        let uuid = sender.to_string();
        let from = crate::calls::From {
            uuid: &uuid,
            person,
            name: &name,
            device: u32::from(device),
            my_device: u32::from(m.device_id()),
            age_secs: now_ms().saturating_sub(sent) / 1000,
            their_identity: their,
            my_identity: mine,
        };
        match crate::calls::read(cm, &from) {
            Some(ev) => self.emit(ev),
            None => self.note("a call message not for this device"),
        }
    }

    /// Sends one of RingRTC's messages to someone.
    async fn call_send(self: &Rc<Self>, s: &crate::calls::Send) -> Result<Value, String> {
        let mut m = self.manager()?;
        let uuid = Uuid::parse_str(s.uuid.trim()).map_err(err)?;
        let cm = crate::calls::build(s)?;
        m.send_message(ServiceId::Aci(uuid.into()), ContentBody::CallMessage(cm), now_ms()).await.map_err(err)?;
        Ok(json!(true))
    }

    /// Who a call with a person is between: their ACI and name, ours, and this device's id.
    fn call_peer(self: &Rc<Self>, person: i64) -> Result<Value, String> {
        let m = self.manager()?;
        let them = self.person_uuid(person)?;
        let me = *self.self_uuid.borrow();
        Ok(json!({
            "uuid": them.to_string(), "name": self.name_of(&them), "person": person.to_string(),
            "me": me.to_string(), "myDevice": u32::from(m.device_id()),
        }))
    }

    /// Sets the proxy every connection to Signal goes through (Erevos's Tor), or none (`url`
    /// empty): kept connections are let go of and receiving starts again, so all go the new way.
    /// Signal's calls are RingRTC's, over UDP, and never go this way.
    async fn set_proxy(self: &Rc<Self>, url: &str) -> Result<Value, String> {
        let url = url.trim();
        if !url.is_empty() {
            let u = url::Url::parse(url).map_err(err)?;
            if !matches!(u.scheme(), "socks5" | "socks5h") {
                return Err("only a SOCKS5 proxy".into());
            }
        }
        let next = (!url.is_empty()).then(|| url.to_string());
        if presage::libsignal_service::proxy::proxy() == next {
            return Ok(json!(false));
        }
        presage::libsignal_service::proxy::set_proxy(next);
        self.note(if url.is_empty() { "connections go direct" } else { "connections go through the proxy" });
        if let Ok(m) = self.manager() {
            m.drop_connections().await;
            let was = self.receiver.borrow_mut().take();
            if let Some(h) = was {
                h.abort();
                let inner = self.clone();
                let h = tokio::task::spawn_local(async move { inner.receive_forever().await });
                *self.receiver.borrow_mut() = Some(h);
            }
        }
        Ok(json!(true))
    }

    /// Signal's TURN servers for a call, with their short-lived passwords.
    async fn call_relays(self: &Rc<Self>) -> Result<Value, String> {
        let m = self.manager()?;
        let list = m.calling_relays().await.map_err(err)?;
        Ok(json!(list
            .into_iter()
            .map(|t| {
                // The addresses by IP first, named by the hostname for TLS, as Signal's app does.
                let mut urls = t.urls_with_ips.clone();
                urls.extend(t.urls.iter().cloned());
                json!({"urls": urls, "username": t.username, "password": t.password, "hostname": t.hostname.unwrap_or_default()})
            })
            .collect::<Vec<_>>()))
    }

    fn emit_poll(&self, poll_id: &str) {
        let polls = self.polls.borrow();
        let Some(p) = polls.get(poll_id) else { return };
        let mut votes = serde_json::Map::new();
        for (voter, chosen) in &p.votes {
            votes.insert(keys::person(voter).to_string(), json!(chosen.iter().map(|i| *i as i64).collect::<Vec<_>>()));
        }
        let options: Vec<Value> = p.options.iter().enumerate().map(|(i, o)| json!({"id": i as i64, "text": o})).collect();
        self.emit(json!({"type": "pollState", "poll": keys::poll(poll_id), "options": options, "votes": votes}));
    }

    /// Downloads one attachment, keeps it in media/, and sends the message again with it.
    fn fetch_later(self: &Rc<Self>, m: &Ready, key: i64, content: Content, p: Pending) {
        let me = self.clone();
        let m = m.clone();
        tokio::task::spawn_local(async move {
            match m.get_attachment(&p.pointer).await {
                Ok(data) => {
                    let path = me.media_path(&p.message_id, p.index, &p.pointer);
                    if std::fs::create_dir_all(me.media_dir()).is_ok() && std::fs::write(&path, data).is_ok() {
                        // Shown again, now with the file.
                        let self_uuid = *me.self_uuid.borrow();
                        let reading = {
                            let names = me.names.borrow();
                            let name_of = |u: &Uuid| names.get(u).cloned().unwrap_or_default();
                            let local = |id: &str, i: usize, pp: &AttachmentPointer| {
                                let path = me.media_path(id, i, pp);
                                path.exists().then(|| format!("file://{}", path.display()))
                            };
                            events::read(&content, key, &self_uuid, &name_of, &local)
                        };
                        if let Some(msg) = reading.message {
                            me.emit(json!({"type": "message", "message": msg}));
                        }
                    }
                }
                Err(e) => me.note(format!("attachment: {e}")),
            }
        });
    }

    /// The chat's history, sent as events (newest last).
    async fn messages(self: &Rc<Self>, key: i64) -> Result<Value, String> {
        let m = self.manager()?;
        let thread = self.thread_of(key)?;
        let msgs: Vec<Content> = m.store().messages(&thread, ..).await.map_err(err)?.flatten().collect();
        let skip = msgs.len().saturating_sub(300);
        for c in msgs.iter().skip(skip) {
            self.take(&m, c, false).await;
        }
        Ok(json!(msgs.len() - skip))
    }

    fn thread_of(&self, key: i64) -> Result<Thread, String> {
        if let Some(c) = self.chats.borrow().get(&key) {
            return Ok(c.thread.clone());
        }
        if let Some(u) = self.people.borrow().get(&key) {
            return Ok(Thread::Contact(ServiceId::Aci((*u).into())));
        }
        Err("chat not found".into())
    }

    // ---- sending ----

    /// Sends a data message to a chat (one person or a group), and shows it.
    async fn send(self: &Rc<Self>, key: i64, mut dm: DataMessage) -> Result<Value, String> {
        let mut m = self.manager()?;
        let thread = self.thread_of(key)?;
        let ts = now_ms();
        dm.timestamp = Some(ts);
        // Our messages follow the chat's disappearing timer (not reactions or deletes).
        if dm.reaction.is_none() && dm.delete.is_none() {
            if let Some(c) = self.chats.borrow().get(&key) {
                if c.expire > 0 {
                    dm.expire_timer = Some(c.expire);
                    dm.expire_timer_version = Some(c.expire_version.max(1));
                }
            }
        }
        match &thread {
            Thread::Contact(sid) => m.send_message_signed(*sid, dm.clone(), ts, self.pni_signed_to(sid)).await.map_err(err)?,
            Thread::Group(mk) => {
                let revision = m.store().group(*mk).await.ok().flatten().map(|g: Group| g.revision).unwrap_or(0);
                dm.group_v2 = Some(GroupContextV2 { master_key: Some(mk.to_vec()), revision: Some(revision), ..Default::default() });
                m.send_message_to_group(mk, dm.clone(), ts).await.map_err(err)?
            }
        }
        let me = *self.self_uuid.borrow();
        let id = keys::message_id(ts, &me);
        // Show it at once from the store, where presage kept it as sent.
        match m.store().message(&thread, ts).await {
            Ok(Some(content)) => self.take_sent(&m, key, &content).await,
            _ => self.note("sent message not found in the store"),
        }
        Ok(json!({"id": id, "ms": ts}))
    }

    async fn take_sent(self: &Rc<Self>, m: &Ready, key: i64, content: &Content) {
        let me = *self.self_uuid.borrow();
        let reading = {
            let names = self.names.borrow();
            let name_of = |u: &Uuid| names.get(u).cloned().unwrap_or_default();
            let local = |id: &str, i: usize, p: &AttachmentPointer| {
                let path = self.media_path(id, i, p);
                path.exists().then(|| format!("file://{}", path.display()))
            };
            events::read(content, key, &me, &name_of, &local)
        };
        for ev in &reading.events {
            self.emit(ev.clone());
        }
        if let Some((id, _q, options)) = reading.poll {
            let mut polls = self.polls.borrow_mut();
            let p = polls.entry(id).or_default();
            p.thread = key;
            p.options = options;
        }
        if let Some(msg) = &reading.message {
            if let Some(c) = self.chats.borrow_mut().get_mut(&key) {
                c.last_ms = msg["ms"].as_u64().unwrap_or(c.last_ms);
                c.snippet = msg["text"].as_str().unwrap_or("📎").to_string();
            }
            self.emit_chat(key);
        }
        let _ = m;
    }

    fn quote_for(&self, reply_to: &str) -> Option<Quote> {
        let (ts, author) = keys::parse_message_id(reply_to)?;
        Some(Quote {
            id: Some(ts),
            author_aci: Some(author.to_string()),
            author_aci_binary: Some(author.as_bytes().to_vec()),
            r#type: Some(0),
            ..Default::default()
        })
    }

    async fn send_text(self: &Rc<Self>, key: i64, text: &str, reply_to: &str) -> Result<Value, String> {
        let dm = DataMessage { body: Some(text.to_string()), quote: self.quote_for(reply_to), ..Default::default() };
        self.send(key, dm).await
    }

    async fn send_media(self: &Rc<Self>, a: &Args) -> Result<Value, String> {
        let m = self.manager()?;
        let data = tokio::fs::read(&a.path).await.map_err(err)?;
        let thumb = if a.thumb.is_empty() { None } else { tokio::fs::read(&a.thumb).await.ok() };
        let name = if a.name.is_empty() { Path::new(&a.path).file_name().map(|n| n.to_string_lossy().to_string()) } else { Some(a.name.clone()) };
        let spec = AttachmentSpec {
            content_type: if a.mime.is_empty() { "application/octet-stream".into() } else { a.mime.clone() },
            length: data.len(),
            file_name: name,
            preview: thumb,
            voice_note: if a.voice { Some(true) } else { None },
            // Erevos stickers go as borderless pictures: Signal shows them without a bubble.
            borderless: if a.as_sticker { Some(true) } else { None },
            width: if a.w > 0 { Some(a.w) } else { None },
            height: if a.h > 0 { Some(a.h) } else { None },
            caption: if a.caption.is_empty() { None } else { Some(a.caption.clone()) },
            blur_hash: None,
        };
        let pointer = m.upload_attachment(spec, data.clone()).await.map_err(err)?.map_err(|e| format!("{e:?}"))?;
        let dm = DataMessage {
            body: if a.caption.is_empty() { None } else { Some(a.caption.clone()) },
            attachments: vec![pointer.clone()],
            quote: self.quote_for(&a.reply_to),
            ..Default::default()
        };
        let res = self.send(a.thread, dm).await?;
        // Keep our own copy, so it shows (and forwards) without downloading it again.
        if let Some(id) = res["id"].as_str() {
            let path = self.media_path(id, 0, &pointer);
            if std::fs::create_dir_all(self.media_dir()).is_ok() && std::fs::write(&path, &data).is_ok() {
                if let Ok(thread) = self.thread_of(a.thread) {
                    if let Some((ts, _)) = keys::parse_message_id(id) {
                        if let Ok(Some(c)) = m.store().message(&thread, ts).await {
                            self.take_sent(&m, a.thread, &c).await;
                        }
                    }
                }
            }
        }
        Ok(res)
    }

    /// Which chat a message is in, from its id.
    async fn chat_of(&self, m: &Ready, id: &str) -> Result<(i64, Thread, u64, Uuid), String> {
        let (ts, author) = keys::parse_message_id(id).ok_or("message not found")?;
        let thread = m
            .store()
            .thread_for_sender_and_timestamp(&ServiceId::Aci(author.into()), ts)
            .await
            .map_err(err)?
            .ok_or("message not found")?;
        Ok((Self::key_of(&thread), thread, ts, author))
    }

    async fn react(self: &Rc<Self>, id: &str, emoji: &str) -> Result<Value, String> {
        let m = self.manager()?;
        let (key, _thread, ts, author) = self.chat_of(&m, id).await?;
        let previous = self.my_reactions.borrow().get(id).cloned().unwrap_or_default();
        let remove = emoji.is_empty();
        let reaction = Reaction {
            emoji: Some(if remove { previous } else { emoji.to_string() }),
            remove: Some(remove),
            target_author_aci: Some(author.to_string()),
            target_author_aci_binary: Some(author.as_bytes().to_vec()),
            target_sent_timestamp: Some(ts),
        };
        self.send(key, DataMessage { reaction: Some(reaction), ..Default::default() }).await?;
        if remove {
            self.my_reactions.borrow_mut().remove(id);
        } else {
            self.my_reactions.borrow_mut().insert(id.to_string(), emoji.to_string());
        }
        Ok(json!(true))
    }

    /// Deletes our own message for everyone.
    async fn unsend(self: &Rc<Self>, id: &str) -> Result<Value, String> {
        let m = self.manager()?;
        let (key, thread, ts, author) = self.chat_of(&m, id).await?;
        if author != *self.self_uuid.borrow() {
            return Err("only your own messages can be unsent".into());
        }
        self.send(key, DataMessage { delete: Some(Delete { target_sent_timestamp: Some(ts) }), ..Default::default() }).await?;
        let mut store = m.store().clone();
        let _ = store.delete_message(&thread, ts).await;
        self.emit(json!({"type": "deleted", "thread": key, "id": id}));
        Ok(json!(true))
    }

    /// Changes the text of one of our own messages, for everyone (as Signal's own apps do).
    async fn edit(self: &Rc<Self>, id: &str, text: &str) -> Result<Value, String> {
        if text.trim().is_empty() {
            return Err("empty text".into());
        }
        let mut m = self.manager()?;
        let (key, thread, ts, author) = self.chat_of(&m, id).await?;
        if author != *self.self_uuid.borrow() {
            return Err("only your own messages can be edited".into());
        }
        let now = now_ms();
        let mut dm = DataMessage { body: Some(text.to_string()), timestamp: Some(now), ..Default::default() };
        if let Some(c) = self.chats.borrow().get(&key) {
            if c.expire > 0 {
                dm.expire_timer = Some(c.expire);
                dm.expire_timer_version = Some(c.expire_version.max(1));
            }
        }
        let body = ContentBody::EditMessage(presage::proto::EditMessage { target_sent_timestamp: Some(ts), data_message: Some(dm.clone()) });
        match &thread {
            Thread::Contact(sid) => m.send_message_signed(*sid, body, now, self.pni_signed_to(sid)).await.map_err(err)?,
            Thread::Group(mk) => {
                let revision = m.store().group(*mk).await.ok().flatten().map(|g: Group| g.revision).unwrap_or(0);
                dm.group_v2 = Some(GroupContextV2 { master_key: Some(mk.to_vec()), revision: Some(revision), ..Default::default() });
                let body = ContentBody::EditMessage(presage::proto::EditMessage { target_sent_timestamp: Some(ts), data_message: Some(dm) });
                m.send_message_to_group(mk, body, now).await.map_err(err)?
            }
        }
        self.emit(json!({"type": "edited", "thread": key, "id": id, "text": text}));
        Ok(json!(true))
    }

    async fn delete_for_me(self: &Rc<Self>, id: &str) -> Result<Value, String> {
        let m = self.manager()?;
        let (key, thread, ts, _) = self.chat_of(&m, id).await?;
        let mut store = m.store().clone();
        store.delete_message(&thread, ts).await.map_err(err)?;
        self.emit(json!({"type": "deleted", "thread": key, "id": id, "forMe": true}));
        Ok(json!(true))
    }

    /// Forwards a message: the same text and the same (already uploaded) attachments.
    async fn forward(self: &Rc<Self>, id: &str, to: &[i64]) -> Result<Value, String> {
        let m = self.manager()?;
        let (_, thread, ts, _) = self.chat_of(&m, id).await?;
        let content = m.store().message(&thread, ts).await.map_err(err)?.ok_or("message not found")?;
        let src = match content.body {
            ContentBody::DataMessage(dm) => dm,
            ContentBody::SynchronizeMessage(s) => events::sent_of(&s).map(|(dm, _)| dm.clone()).ok_or("nothing to forward")?,
            _ => return Err("nothing to forward".into()),
        };
        let mut done = 0;
        let mut last = String::new();
        for &dst in to {
            if !keys::is_signal(dst) {
                last = "Signal messages can be forwarded to Signal chats only".into();
                continue;
            }
            let dm = DataMessage {
                body: src.body.clone(),
                attachments: src.attachments.clone(),
                sticker: src.sticker.clone(),
                flags: Some(8), // FORWARD
                ..Default::default()
            };
            match self.send(dst, dm).await {
                Ok(_) => done += 1,
                Err(e) => last = e,
            }
        }
        if done == 0 && !last.is_empty() {
            return Err(last);
        }
        Ok(json!(done))
    }

    /// What another device of the account read: each chat with one of those messages is read up to it.
    fn read_elsewhere(&self, reads: &[presage::proto::sync_message::Read]) {
        let seen: Vec<(Uuid, u64)> = reads.iter().filter_map(read_of).collect();
        let changed: Vec<i64> = self
            .chats
            .borrow_mut()
            .iter_mut()
            .filter_map(|(k, c)| seen.iter().fold(false, |any, (s, ts)| read_up_to(c, *s, *ts) || any).then_some(*k))
            .collect();
        for key in changed {
            self.emit_chat(key);
        }
    }

    fn pni_file(&self) -> PathBuf {
        self.dir.join("pni-signature.json")
    }

    fn with_pni_signed<T>(&self, job: impl FnOnce(&mut HashSet<Uuid>) -> T) -> T {
        let mut kept = self.pni_signed.borrow_mut();
        let set = kept.get_or_insert_with(|| {
            std::fs::read(self.pni_file()).ok().and_then(|b| serde_json::from_slice::<HashSet<Uuid>>(&b).ok()).unwrap_or_default()
        });
        job(set)
    }

    /// Whom a message reached us through: our phone number (PNI), so our replies carry our PNI
    /// signature until they write to this account itself (ACI), as Signal's apps do.
    fn note_reached_by(&self, sender: Uuid, destination: &ServiceId) {
        let changed = self.with_pni_signed(|set| match pni_need(destination) {
            Some(true) => set.insert(sender),
            Some(false) => set.remove(&sender),
            None => false,
        });
        if changed {
            let list = self.with_pni_signed(|set| serde_json::to_vec(&*set).ok());
            if let Some(b) = list {
                let _ = std::fs::write(self.pni_file(), b);
            }
        }
    }

    fn pni_signed_to(&self, to: &ServiceId) -> bool {
        let u = to.raw_uuid();
        self.with_pni_signed(|set| set.contains(&u))
    }

    fn settings_file(&self) -> PathBuf {
        self.dir.join("settings.json")
    }

    /// Whether read receipts go to the others: as the account's setting says; on (Signal's own
    /// default, and what Erevos did before) until the primary phone has said.
    fn read_receipts_on(&self) -> bool {
        let mut kept = self.read_receipts.borrow_mut();
        let on = kept.get_or_insert_with(|| {
            std::fs::read(self.settings_file())
                .ok()
                .and_then(|b| serde_json::from_slice::<Value>(&b).ok())
                .and_then(|v| v["readReceipts"].as_bool())
        });
        on.unwrap_or(true)
    }

    fn set_read_receipts(&self, on: bool) {
        *self.read_receipts.borrow_mut() = Some(Some(on));
        let _ = std::fs::write(self.settings_file(), json!({ "readReceipts": on }).to_string());
        self.note(if on { "read receipts on" } else { "read receipts off" });
    }

    /// Read receipts for what came in this chat since the last time.
    async fn mark_read(self: &Rc<Self>, key: i64) -> Result<Value, String> {
        let unread = match self.chats.borrow_mut().get_mut(&key) {
            Some(c) => {
                c.read_to = c.unread.iter().map(|(_, ts)| *ts).max().unwrap_or(0).max(c.read_to);
                std::mem::take(&mut c.unread)
            }
            None => return Ok(json!(false)),
        };
        self.emit_chat(key);
        if unread.is_empty() {
            return Ok(json!(true));
        }
        let mut m = self.manager()?;
        // Our own other devices (the phone this one is linked to): read there too.
        if let Err(e) = m.send_read_sync(read_syncs(&unread)).await {
            self.note(format!("read sync: {e}"));
        }
        // The others: a read receipt, only when the account sends them (Signal's own setting).
        if !self.read_receipts_on() {
            return Ok(json!(true));
        }
        let mut by_sender: HashMap<Uuid, Vec<u64>> = HashMap::new();
        for (s, ts) in unread {
            by_sender.entry(s).or_default().push(ts);
        }
        for (s, timestamps) in by_sender {
            let receipt = ReceiptMessage { r#type: Some(receipt_message::Type::Read as i32), timestamp: timestamps };
            if let Err(e) = m.send_message(ServiceId::Aci(s.into()), receipt, now_ms()).await {
                self.note(format!("read receipt: {e}"));
            }
        }
        Ok(json!(true))
    }

    async fn mark_all_read(self: &Rc<Self>) -> Result<Value, String> {
        let keys: Vec<i64> = self.chats.borrow().iter().filter(|(_, c)| !c.unread.is_empty()).map(|(k, _)| *k).collect();
        let n = keys.len();
        for k in keys {
            self.mark_read(k).await?;
        }
        Ok(json!(n))
    }

    async fn create_poll(self: &Rc<Self>, key: i64, question: &str, options: &[String]) -> Result<Value, String> {
        if question.trim().is_empty() || options.len() < 2 {
            return Err("a poll needs a question and two options".into());
        }
        let dm = DataMessage {
            poll_create: Some(PollCreate { question: Some(question.trim().to_string()), allow_multiple: Some(true), options: options.to_vec() }),
            ..Default::default()
        };
        self.send(key, dm).await
    }

    async fn vote_poll(self: &Rc<Self>, poll: i64, selected: &[i64]) -> Result<Value, String> {
        let (poll_id, key) = {
            let polls = self.polls.borrow();
            let (id, p) = polls.iter().find(|(id, _)| keys::poll(id) == poll).ok_or("poll not found")?;
            (id.clone(), p.thread)
        };
        let (ts, author) = keys::parse_message_id(&poll_id).ok_or("poll not found")?;
        let me = *self.self_uuid.borrow();
        let count = {
            let mut polls = self.polls.borrow_mut();
            let p = polls.get_mut(&poll_id).ok_or("poll not found")?;
            let chosen: Vec<u32> = selected.iter().filter(|i| **i >= 0).map(|i| *i as u32).collect();
            p.votes.insert(me, chosen);
            p.votes.len() as u32
        };
        let chosen: Vec<u32> = selected.iter().filter(|i| **i >= 0).map(|i| *i as u32).collect();
        let dm = DataMessage {
            poll_vote: Some(PollVote {
                target_author_aci_binary: Some(author.as_bytes().to_vec()),
                target_sent_timestamp: Some(ts),
                option_indexes: chosen,
                vote_count: Some(count),
            }),
            ..Default::default()
        };
        self.send(key, dm).await?;
        self.emit_poll(&poll_id);
        Ok(json!(true))
    }

    async fn pin(self: &Rc<Self>, id: &str, on: bool) -> Result<Value, String> {
        let m = self.manager()?;
        let (key, _, ts, author) = self.chat_of(&m, id).await?;
        let dm = if on {
            DataMessage {
                pin_message: Some(PinMessage {
                    target_author_aci_binary: Some(author.as_bytes().to_vec()),
                    target_sent_timestamp: Some(ts),
                    pin_duration: Some(presage::proto::data_message::pin_message::PinDuration::PinDurationForever(true)),
                }),
                ..Default::default()
            }
        } else {
            DataMessage {
                unpin_message: Some(UnpinMessage { target_author_aci_binary: Some(author.as_bytes().to_vec()), target_sent_timestamp: Some(ts) }),
                ..Default::default()
            }
        };
        self.send(key, dm).await?;
        if let Some(c) = self.chats.borrow_mut().get_mut(&key) {
            c.pinned = if on { id.to_string() } else { String::new() };
        }
        self.emit(json!({"type": "pinned", "thread": key, "id": if on { id } else { "" }}));
        self.emit_chat(key);
        Ok(json!(true))
    }

    // ---- people and groups ----

    async fn members(self: &Rc<Self>, key: i64) -> Result<Value, String> {
        let m = self.manager()?;
        let Thread::Group(mk) = self.thread_of(key)? else { return Ok(json!([])) };
        let g = m.store().group(mk).await.map_err(err)?.ok_or("group not found")?;
        let me = *self.self_uuid.borrow();
        let mut out = Vec::new();
        for member in &g.members {
            let u: Uuid = member.aci.into();
            self.people.borrow_mut().insert(keys::person(&u), u);
            self.ask_profile(&m, u);
            out.push(json!({
                "id": keys::person(&u), "name": self.name_of(&u),
                "admin": format!("{:?}", member.role).eq_ignore_ascii_case("administrator"),
                "me": u == me,
            }));
        }
        Ok(Value::Array(out))
    }

    fn person_uuid(&self, key: i64) -> Result<Uuid, String> {
        self.people.borrow().get(&key).copied().ok_or_else(|| "person not found".to_string())
    }

    /// Changes the group's name, members or admins, and tells its members.
    async fn change_group(self: &Rc<Self>, key: i64, change: crate::groups::Change) -> Result<Value, String> {
        if let crate::groups::Change::Title(t) = &change {
            if t.trim().is_empty() {
                return Err("empty name".into());
            }
        }
        let mut m = self.manager()?;
        let Thread::Group(mk) = self.thread_of(key)? else { return Err("not a group".into()) };
        let revision = m.store().group(mk).await.map_err(err)?.ok_or("group not found")?.revision;
        let (revision, signed) = crate::groups::apply(&m, mk, revision, change).await?;
        // The members' apps learn of it from the signed change in the group context.
        let ts = now_ms();
        let dm = DataMessage {
            timestamp: Some(ts),
            group_v2: Some(GroupContextV2 { master_key: Some(mk.to_vec()), revision: Some(revision), group_change: Some(signed), ..Default::default() }),
            ..Default::default()
        };
        if let Err(e) = m.send_message_to_group(&mk, dm, ts).await {
            self.note(format!("group change notice: {e}"));
        }
        if let Ok(Some(g)) = m.store().group(mk).await {
            if let Some(c) = self.chats.borrow_mut().get_mut(&key) {
                c.name = g.title.clone();
            }
        }
        self.emit_chat(key);
        self.emit(json!({"type": "members", "thread": key}));
        Ok(json!(true))
    }

    async fn contacts(self: &Rc<Self>) -> Result<Value, String> {
        let m = self.manager()?;
        let mut out = Vec::new();
        for c in m.store().contacts().await.map_err(err)?.flatten() {
            let name = if c.name.is_empty() { c.phone_number.as_ref().map(|p| p.to_string()).unwrap_or_default() } else { c.name.clone() };
            if name.is_empty() || c.uuid == *self.self_uuid.borrow() {
                continue;
            }
            out.push(json!({"id": keys::person(&c.uuid), "name": name, "network": "signal"}));
        }
        Ok(Value::Array(out))
    }

    /// Finds people by name among the known ones, and by Signal username (with a dot and
    /// digits, as "name.42").
    async fn search_people(self: &Rc<Self>, query: &str) -> Result<Value, String> {
        let q = query.trim().trim_start_matches('@');
        let mut out = Vec::new();
        let lower = q.to_lowercase();
        for (u, name) in self.names.borrow().iter() {
            if !lower.is_empty() && name.to_lowercase().contains(&lower) {
                out.push(json!({"id": keys::person(u), "name": name, "network": "signal"}));
            }
        }
        if let Some(e164) = self.phone_of(q) {
            let mut m = self.manager()?;
            match m.discover_contacts_by_phone_number([e164.as_str()]).await {
                Ok(found) => {
                    for (_, sid) in found {
                        if let Some(ServiceId::Aci(aci)) = sid {
                            let u: Uuid = aci.into();
                            self.people.borrow_mut().insert(keys::person(&u), u);
                            let name = self.names.borrow_mut().entry(u).or_insert_with(|| e164.clone()).clone();
                            self.ask_profile(&m, u);
                            out.push(json!({"id": keys::person(&u), "name": name, "network": "signal"}));
                        }
                    }
                }
                Err(e) => self.note(format!("phone lookup: {e}")),
            }
        } else if q.contains('.') {
            let mut m = self.manager()?;
            match m.lookup_username(q).await {
                Ok(Some(aci)) => {
                    let u: Uuid = aci.into();
                    self.people.borrow_mut().insert(keys::person(&u), u);
                    self.names.borrow_mut().entry(u).or_insert_with(|| format!("@{q}"));
                    out.push(json!({"id": keys::person(&u), "name": format!("@{q}"), "network": "signal"}));
                }
                Ok(None) => {}
                Err(e) => self.note(format!("username: {e}")),
            }
        }
        Ok(Value::Array(out))
    }

    /// A phone number as Signal wants it (+ and country code), or None if the text is not one.
    /// Without a country code, ours is used (and a leading 0 dropped).
    fn phone_of(&self, q: &str) -> Option<String> {
        let digits: String = q.chars().filter(|c| !matches!(c, ' ' | '-' | '(' | ')' | '.' | '/')).collect();
        let (plus, rest) = if let Some(r) = digits.strip_prefix('+') {
            (true, r.to_string())
        } else if let Some(r) = digits.strip_prefix("00") {
            (true, r.to_string())
        } else {
            (false, digits.clone())
        };
        if rest.len() < 6 || rest.len() > 15 || !rest.chars().all(|c| c.is_ascii_digit()) || q.contains('.') && !plus {
            return None;
        }
        if plus {
            return Some(format!("+{rest}"));
        }
        let own = self.manager().ok()?.registration_data().phone_number.code().value();
        Some(format!("+{own}{}", rest.trim_start_matches('0')))
    }

    async fn start_chat(self: &Rc<Self>, person: i64, id: &str, name: &str) -> Result<Value, String> {
        let m = self.manager()?;
        let key = if person != 0 { person } else { id.parse::<i64>().map_err(|_| "person not found".to_string())? };
        let u = *self.people.borrow().get(&key).ok_or("person not found")?;
        if !name.is_empty() {
            self.names.borrow_mut().entry(u).or_insert_with(|| name.to_string());
        }
        let k = self.touch_chat(&m, Thread::Contact(ServiceId::Aci(u.into()))).await;
        self.ask_profile(&m, u);
        Ok(json!({"key": k, "thread": k}))
    }
}

fn snippet_of(c: &Content) -> String {
    let dm = match &c.body {
        ContentBody::DataMessage(dm) => Some(dm),
        ContentBody::SynchronizeMessage(s) => events::sent_of(s).map(|(dm, _)| dm),
        _ => None,
    };
    match dm {
        Some(dm) if dm.body.as_deref().is_some_and(|b| !b.is_empty()) => dm.body.clone().unwrap_or_default(),
        Some(dm) if !dm.attachments.is_empty() => "📎".into(),
        _ => String::new(),
    }
}

/// The chat a message belongs to. As presage, except for our own messages sent from here, which it
/// keeps as a DataMessage from us to them: theirs is the chat, not one with ourselves (which made a
/// second, nameless chat of the same person when the chat was shown again).
fn thread_of_content(content: &Content, me: &Uuid) -> Option<Thread> {
    let dm = match &content.body {
        ContentBody::DataMessage(dm) => Some(dm),
        ContentBody::EditMessage(e) => e.data_message.as_ref(),
        _ => None,
    };
    let ours_to_one = dm.is_some_and(|dm| dm.group_v2.is_none())
        && content.metadata.sender.raw_uuid() == *me
        && !me.is_nil()
        && content.metadata.destination.raw_uuid() != *me
        && !content.metadata.destination.raw_uuid().is_nil();
    if ours_to_one {
        return Some(Thread::Contact(content.metadata.destination));
    }
    Thread::try_from(content).ok()
}

/// Whether a message to `destination` means our replies need our PNI signature: Some(true) when it
/// came to our phone number (PNI), Some(false) when to this account (ACI), None when unknown.
fn pni_need(destination: &ServiceId) -> Option<bool> {
    if destination.raw_uuid().is_nil() {
        return None;
    }
    Some(matches!(destination, ServiceId::Pni(_)))
}

/// The profile key a message from someone carries, with which their name can be read.
fn profile_key_of(content: &Content) -> Option<[u8; 32]> {
    let dm = match &content.body {
        ContentBody::DataMessage(dm) => dm,
        _ => return None,
    };
    dm.profile_key.as_deref().and_then(|k| <[u8; 32]>::try_from(k).ok())
}

/// The reads to tell our other devices for these messages read here: the newest of each sender.
fn read_syncs(unread: &[(Uuid, u64)]) -> Vec<presage::proto::sync_message::Read> {
    let mut newest: HashMap<Uuid, u64> = HashMap::new();
    for (s, ts) in unread {
        let n = newest.entry(*s).or_default();
        *n = (*n).max(*ts);
    }
    let mut list: Vec<(Uuid, u64)> = newest.into_iter().collect();
    list.sort();
    list.into_iter()
        .map(|(s, ts)| presage::proto::sync_message::Read { sender_aci: Some(s.to_string()), timestamp: Some(ts), sender_aci_binary: Some(s.as_bytes().to_vec()) })
        .collect()
}

/// The account's read-receipts setting, when this sync is its configuration.
fn receipts_of(sync: &presage::proto::SyncMessage) -> Option<bool> {
    match &sync.content {
        Some(presage::proto::sync_message::Content::Configuration(c)) => c.read_receipts,
        _ => None,
    }
}

/// A read another device of the account tells of: whose message, and its time.
fn read_of(r: &presage::proto::sync_message::Read) -> Option<(Uuid, u64)> {
    let ts = r.timestamp?;
    let sender = match (&r.sender_aci_binary, &r.sender_aci) {
        (Some(b), _) if b.len() == 16 => Uuid::from_slice(b).ok()?,
        (_, Some(s)) => Uuid::parse_str(s).ok()?,
        _ => return None,
    };
    Some((sender, ts))
}

/// A chat read up to `sender`'s message at `ts`, if that message is one of the chat's not read:
/// it and all before it are read, as Signal does. Whether the chat changed.
fn read_up_to(c: &mut Chat, sender: Uuid, ts: u64) -> bool {
    if !c.unread.contains(&(sender, ts)) {
        // Not this chat's, or read already.
        return false;
    }
    c.unread.retain(|(_, t)| *t > ts);
    c.read_to = c.read_to.max(ts);
    true
}

#[cfg(test)]
mod read_tests {
    use super::*;

    fn chat(unread: Vec<(Uuid, u64)>) -> Chat {
        Chat {
            thread: Thread::Contact(ServiceId::Aci(Uuid::nil().into())),
            name: String::new(),
            group: false,
            last_ms: unread.iter().map(|u| u.1).max().unwrap_or(0),
            snippet: String::new(),
            unread,
            read_to: 0,
            pinned: String::new(),
            expire: 0,
            expire_version: 0,
        }
    }

    #[test]
    fn a_read_on_the_phone_clears_this_chat_up_to_it() {
        let a = Uuid::from_u128(1);
        let b = Uuid::from_u128(2);
        let mut c = chat(vec![(a, 10), (b, 20), (a, 30)]);
        assert!(read_up_to(&mut c, b, 20));
        assert_eq!(c.unread, vec![(a, 30)]);
        assert_eq!(c.read_to, 20);
        assert!(read_up_to(&mut c, a, 30));
        assert!(c.unread.is_empty());
    }

    #[test]
    fn a_read_of_another_chat_changes_nothing() {
        let a = Uuid::from_u128(1);
        let mut c = chat(vec![(a, 10)]);
        assert!(!read_up_to(&mut c, Uuid::from_u128(9), 10));
        assert_eq!(c.unread, vec![(a, 10)]);
    }

    fn content(sender: Uuid, destination: Uuid, dm: DataMessage) -> Content {
        use presage::libsignal_service::content::Metadata;
        Content {
            metadata: Metadata {
                sender: ServiceId::Aci(sender.into()),
                sender_device: 1u32.try_into().unwrap(),
                destination: ServiceId::Aci(destination.into()),
                server_guid: None,
                client_timestamp: Default::default(),
                server_timestamp: Default::default(),
                needs_receipt: false,
                unidentified_sender: false,
                was_plaintext: false,
                pni_verified: None,
            },
            body: ContentBody::DataMessage(dm),
        }
    }

    #[test]
    fn our_sent_message_shown_again_stays_in_their_chat() {
        let me = Uuid::from_u128(1);
        let them = Uuid::from_u128(2);
        let dm = DataMessage { body: Some("Τι έγινε;".into()), ..Default::default() };
        let ours = thread_of_content(&content(me, them, dm.clone()), &me).unwrap();
        assert_eq!(Inner::key_of(&ours), keys::person(&them));
        let theirs = thread_of_content(&content(them, me, dm.clone()), &me).unwrap();
        assert_eq!(Inner::key_of(&theirs), keys::person(&them));
        // A note to ourselves stays ours.
        let note = thread_of_content(&content(me, me, dm), &me).unwrap();
        assert_eq!(Inner::key_of(&note), keys::person(&me));
    }

    #[test]
    fn a_message_to_our_number_asks_for_our_pni_signature() {
        let u = Uuid::from_u128(5);
        assert_eq!(pni_need(&ServiceId::Pni(u.into())), Some(true));
        assert_eq!(pni_need(&ServiceId::Aci(u.into())), Some(false));
        assert_eq!(pni_need(&ServiceId::Aci(Uuid::nil().into())), None);
    }

    #[test]
    fn a_message_carries_the_profile_key_for_their_name() {
        let me = Uuid::from_u128(1);
        let them = Uuid::from_u128(2);
        let with = DataMessage { body: Some("hi".into()), profile_key: Some(vec![7; 32]), ..Default::default() };
        assert_eq!(profile_key_of(&content(them, me, with)), Some([7; 32]));
        let short = DataMessage { profile_key: Some(vec![7; 3]), ..Default::default() };
        assert_eq!(profile_key_of(&content(them, me, short)), None);
    }

    #[test]
    fn what_is_read_here_goes_to_our_devices_as_the_newest_of_each_sender() {
        let a = Uuid::from_u128(1);
        let b = Uuid::from_u128(2);
        let reads = read_syncs(&[(a, 10), (b, 20), (a, 30)]);
        let got: Vec<_> = reads.iter().filter_map(read_of).collect();
        assert_eq!(got, vec![(a, 30), (b, 20)]);
        assert!(read_syncs(&[]).is_empty());
    }

    #[test]
    fn the_read_receipts_setting_comes_from_the_configuration_sync() {
        use presage::proto::sync_message::{Configuration, Content};
        let mut sync = presage::proto::SyncMessage::default();
        assert_eq!(receipts_of(&sync), None);
        sync.content = Some(Content::Configuration(Configuration { read_receipts: Some(false), ..Default::default() }));
        assert_eq!(receipts_of(&sync), Some(false));
    }

    #[test]
    fn the_sender_is_read_from_binary_or_text() {
        let a = Uuid::from_u128(7);
        let bin = presage::proto::sync_message::Read { sender_aci: None, timestamp: Some(5), sender_aci_binary: Some(a.as_bytes().to_vec()) };
        let text = presage::proto::sync_message::Read { sender_aci: Some(a.to_string()), timestamp: Some(6), sender_aci_binary: None };
        let none = presage::proto::sync_message::Read { sender_aci: None, timestamp: Some(6), sender_aci_binary: None };
        assert_eq!(read_of(&bin), Some((a, 5)));
        assert_eq!(read_of(&text), Some((a, 6)));
        assert_eq!(read_of(&none), None);
    }
}
