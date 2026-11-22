// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

//! What a Signal message means for the screens: the same events the Messenger engine sends
//! (docs/api.md), made from one decrypted [Content].

use presage::libsignal_service::content::{Content, ContentBody, DataMessage};
use presage::proto::{sync_message, AttachmentPointer};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::keys;

/// One attachment that still has to be fetched and decrypted.
#[derive(Clone)]
pub struct Pending {
    pub message_id: String,
    pub index: usize,
    pub pointer: AttachmentPointer,
}

/// What one Content gives: events to send now, attachments to fetch, and, for a message
/// someone else wrote, that it can be marked read.
#[derive(Default)]
pub struct Reading {
    pub events: Vec<Value>,
    pub pending: Vec<Pending>,
    /// The message shown, if this Content was one.
    pub message: Option<Value>,
    /// A poll vote: (poll message id, voter, chosen option indexes).
    pub vote: Option<(String, Uuid, Vec<u32>)>,
    /// A new poll: (message id, question, options).
    pub poll: Option<(String, String, Vec<String>)>,
    /// The chat's disappearing timer as this message carries it: (seconds, version).
    pub expire: Option<(u32, u32)>,
}

/// "1 ημέρα", "5 λεπτά"… for a disappearing timer.
pub fn timer_text(secs: u32) -> String {
    let (n, one, many) = if secs % 604_800 == 0 {
        (secs / 604_800, "εβδομάδα", "εβδομάδες")
    } else if secs % 86_400 == 0 {
        (secs / 86_400, "ημέρα", "ημέρες")
    } else if secs % 3_600 == 0 {
        (secs / 3_600, "ώρα", "ώρες")
    } else if secs % 60 == 0 {
        (secs / 60, "λεπτό", "λεπτά")
    } else {
        (secs, "δευτερόλεπτο", "δευτερόλεπτα")
    };
    format!("{n} {}", if n == 1 { one } else { many })
}

/// Who wrote a message, and whether it was us.
pub struct Author {
    pub uuid: Uuid,
    pub name: String,
    pub mine: bool,
}

/// Turns one decrypted Content into what the screens show. `thread` is the chat's key;
/// `name_of` names a person; `local` says where an attachment already fetched is kept.
pub fn read(
    content: &Content,
    thread: i64,
    self_uuid: &Uuid,
    name_of: &dyn Fn(&Uuid) -> String,
    local: &dyn Fn(&str, usize, &AttachmentPointer) -> Option<String>,
) -> Reading {
    let sender = content.metadata.sender.raw_uuid();
    match &content.body {
        ContentBody::DataMessage(dm) => {
            let author = Author { uuid: sender, name: name_of(&sender), mine: sender == *self_uuid };
            let ts = dm.timestamp.unwrap_or_else(|| content.metadata.timestamp_ms());
            data_message(dm, ts, thread, &author, self_uuid, name_of, local)
        }
        ContentBody::SynchronizeMessage(sync) => {
            // Our own message, sent from another of our devices.
            if let Some((dm, timestamp)) = sent_of(sync) {
                let author = Author { uuid: *self_uuid, name: name_of(self_uuid), mine: true };
                let ts = dm.timestamp.or(timestamp).unwrap_or_else(|| content.metadata.timestamp_ms());
                return data_message(dm, ts, thread, &author, self_uuid, name_of, local);
            }
            Reading::default()
        }
        ContentBody::EditMessage(edit) => {
            let (Some(target), Some(dm)) = (edit.target_sent_timestamp, &edit.data_message) else {
                return Reading::default();
            };
            let id = keys::message_id(target, &sender);
            let mut r = Reading::default();
            r.events.push(json!({"type": "edited", "id": id, "text": dm.body.clone().unwrap_or_default()}));
            r
        }
        _ => Reading::default(),
    }
}

/// Our own message sent from another of our devices, and its timestamp.
pub fn sent_of(sync: &presage::proto::SyncMessage) -> Option<(&DataMessage, Option<u64>)> {
    match &sync.content {
        Some(sync_message::Content::Sent(sent)) => sent.message.as_ref().map(|dm| (dm, sent.timestamp)),
        _ => None,
    }
}

trait TimestampMs {
    fn timestamp_ms(&self) -> u64;
}

impl TimestampMs for presage::libsignal_service::content::Metadata {
    fn timestamp_ms(&self) -> u64 {
        self.client_timestamp.timestamp_millis().max(0) as u64
    }
}

fn uuid_of(binary: &Option<Vec<u8>>, text: &Option<String>) -> Option<Uuid> {
    if let Some(b) = binary {
        if let Ok(u) = Uuid::from_slice(b) {
            return Some(u);
        }
    }
    text.as_deref().and_then(|s| Uuid::parse_str(s).ok())
}

fn data_message(
    dm: &DataMessage,
    ts: u64,
    thread: i64,
    author: &Author,
    self_uuid: &Uuid,
    name_of: &dyn Fn(&Uuid) -> String,
    local: &dyn Fn(&str, usize, &AttachmentPointer) -> Option<String>,
) -> Reading {
    let mut r = Reading::default();
    let actor = keys::person(&author.uuid);

    if let Some(re) = &dm.reaction {
        if let (Some(target_ts), Some(target)) = (re.target_sent_timestamp, uuid_of(&re.target_author_aci_binary, &re.target_author_aci)) {
            let emoji = if re.remove.unwrap_or(false) { String::new() } else { re.emoji.clone().unwrap_or_default() };
            r.events.push(json!({
                "type": "reaction", "thread": thread, "id": keys::message_id(target_ts, &target),
                "actor": actor, "name": author.name, "emoji": emoji, "mine": author.mine,
            }));
        }
        return r;
    }
    if let Some(del) = &dm.delete {
        if let Some(target_ts) = del.target_sent_timestamp {
            r.events.push(json!({"type": "deleted", "thread": thread, "id": keys::message_id(target_ts, &author.uuid)}));
        }
        return r;
    }
    if let Some(pin) = &dm.pin_message {
        if let (Some(target_ts), Some(target)) = (pin.target_sent_timestamp, uuid_of(&pin.target_author_aci_binary, &None)) {
            r.events.push(json!({"type": "pinned", "thread": thread, "id": keys::message_id(target_ts, &target)}));
        }
        return r;
    }
    if dm.unpin_message.is_some() {
        r.events.push(json!({"type": "pinned", "thread": thread, "id": ""}));
        return r;
    }
    if let Some(vote) = &dm.poll_vote {
        if let (Some(target_ts), Some(target)) = (vote.target_sent_timestamp, uuid_of(&vote.target_author_aci_binary, &None)) {
            r.vote = Some((keys::message_id(target_ts, &target), author.uuid, vote.option_indexes.clone()));
        }
        return r;
    }

    let id = keys::message_id(ts, &author.uuid);
    let mut text = dm.body.clone().unwrap_or_default();
    let timer = dm.expire_timer.unwrap_or(0);
    r.expire = Some((timer, dm.expire_timer_version.unwrap_or(0)));
    let timer_update = dm.flags.unwrap_or(0) & 2 != 0; // DataMessage.Flags.EXPIRATION_TIMER_UPDATE
    if timer_update {
        text = if timer == 0 {
            "⏱ Τα μηνύματα δεν εξαφανίζονται πια".to_string()
        } else {
            format!("⏱ Τα μηνύματα εξαφανίζονται μετά από {}", timer_text(timer))
        };
    }
    let mut atts: Vec<Value> = Vec::new();

    for (i, p) in dm.attachments.iter().enumerate() {
        let mime = p.content_type.clone().unwrap_or_default();
        let voice = p.flags.unwrap_or(0) & 1 != 0; // AttachmentPointer.Flags.VOICE_MESSAGE
        let borderless = p.flags.unwrap_or(0) & 2 != 0; // BORDERLESS: shown like a sticker
        let kind = if borderless && mime.starts_with("image/") {
            "sticker"
        } else if mime.starts_with("image/") {
            "image"
        } else if mime.starts_with("video/") {
            "video"
        } else if mime.starts_with("audio/") {
            "audio"
        } else {
            "file"
        };
        let url = local(&id, i, p);
        if url.is_none() {
            r.pending.push(Pending { message_id: id.clone(), index: i, pointer: p.clone() });
        }
        let url = url.unwrap_or_default();
        atts.push(json!({
            "kind": kind, "url": url, "playUrl": url, "mime": mime,
            "w": p.width.unwrap_or(0), "h": p.height.unwrap_or(0),
            "name": p.file_name.clone().unwrap_or_default(),
            "title": if voice { "voice" } else { "" },
        }));
        if let Some(caption) = &p.caption {
            if text.is_empty() {
                text = caption.clone();
            }
        }
    }
    if let Some(st) = &dm.sticker {
        if let Some(p) = &st.data {
            let i = dm.attachments.len();
            let url = local(&id, i, p);
            if url.is_none() {
                r.pending.push(Pending { message_id: id.clone(), index: i, pointer: p.clone() });
            }
            let url = url.unwrap_or_default();
            atts.push(json!({"kind": "sticker", "url": url, "playUrl": url, "mime": p.content_type.clone().unwrap_or_default(),
                "w": p.width.unwrap_or(0), "h": p.height.unwrap_or(0), "name": "", "title": st.emoji.clone().unwrap_or_default()}));
        }
    }
    for pv in &dm.preview {
        atts.push(json!({"kind": "link", "url": "", "playUrl": "", "mime": "", "w": 0, "h": 0, "name": "",
            "title": pv.title.clone().unwrap_or_default(), "link": pv.url.clone().unwrap_or_default()}));
    }
    for c in &dm.contact {
        let name = c.name.as_ref().map(|n| {
            let given = n.given_name.clone().unwrap_or_default();
            let family = n.family_name.clone().unwrap_or_default();
            format!("{given} {family}").trim().to_string()
        });
        let phone = c.number.first().and_then(|p| p.value.clone()).unwrap_or_default();
        atts.push(json!({"kind": "contact", "url": "", "playUrl": "", "mime": "", "w": 0, "h": 0, "name": "",
            "title": format!("{} {}", name.unwrap_or_default(), phone).trim().to_string()}));
    }

    if let Some(pc) = &dm.poll_create {
        let question = pc.question.clone().unwrap_or_default();
        let options: Vec<Value> = pc.options.iter().enumerate().map(|(i, o)| json!({"id": i as i64, "text": o})).collect();
        r.poll = Some((id.clone(), question.clone(), pc.options.clone()));
        r.events.push(json!({"type": "poll", "thread": thread, "id": id, "poll": keys::poll(&id), "question": question, "options": options}));
        if text.is_empty() {
            text = format!("📊 {question}");
        }
    }

    let reply_to = dm.quote.as_ref().and_then(|q| {
        let qid = q.id?;
        let qa = uuid_of(&q.author_aci_binary, &q.author_aci)?;
        Some(json!({
            "id": keys::message_id(qid, &qa), "text": q.text.clone().unwrap_or_default(),
            "sender": keys::person(&qa), "name": if qa == *self_uuid { String::new() } else { name_of(&qa) },
        }))
    });

    if text.is_empty() && atts.is_empty() && dm.group_v2.as_ref().and_then(|g| g.group_change.as_ref()).is_some() {
        text = "ℹ️ Η ομάδα άλλαξε".to_string();
    }
    if text.is_empty() && atts.is_empty() {
        // Nothing to show (a profile key update, an expiry change, a call update…).
        return r;
    }

    let mut msg = json!({
        "thread": thread, "id": id, "sender": actor, "name": author.name, "text": text,
        "ms": ts, "mine": author.mine, "encrypted": true,
    });
    if !atts.is_empty() {
        msg["attachments"] = Value::Array(atts);
    }
    if let Some(q) = reply_to {
        msg["replyTo"] = q;
    }
    if timer > 0 && !timer_update {
        msg["expiresIn"] = json!(timer);
        // Signal's clock starts when a message is read: ours at sending, others' when seen here.
        msg["expireFrom"] = json!(if author.mine { "send" } else { "read" });
    }
    r.events.push(json!({"type": "message", "message": msg.clone()}));
    r.message = Some(msg);
    r
}
