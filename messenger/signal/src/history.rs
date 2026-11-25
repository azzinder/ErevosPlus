// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! Signal's history in Erevos+'s backups: what the chats showed, to read again after a restore.
//!
//! A backup carries the chats' messages as the screens showed them (text, who, when, and the names
//! of their files, the files themselves beside), never what makes the account: no identity key, no
//! ratchet or session, no profile or group key. An account that came back from old keys would break
//! the new messages, and two phones with one account are cut off by Signal. So after a restore one
//! signs in to Signal anew, and the old history is kept apart from presage's store (which takes no
//! messages it did not receive), read-only, in `kept/` of the engine's folder: `kept.json` and the
//! files in `kept/media`. Each chat shows its kept messages before its own, with the same ids, so
//! nothing shows twice; a chat that is not there any more (a group one is not in again) shows as one
//! to read only.

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

/// The kind of history this engine writes and reads; a newer one is read as far as it is understood.
pub const VERSION: u32 = 1;

/// The most messages a chat keeps, its newest.
pub const MAX_PER_CHAT: usize = 5000;

/// A chat of the history: its key (as the screens know it), name, and for a one-to-one chat the
/// person's ACI, so it is the same chat again once they write or are written to.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Default)]
#[serde(default)]
pub struct KeptChat {
    pub key: i64,
    pub name: String,
    pub group: bool,
    pub person: String,
}

/// Signal's history as a backup carries it and the engine keeps it.
#[derive(Serialize, Deserialize, Clone, Debug, Default)]
#[serde(default)]
pub struct History {
    pub v: u32,
    pub chats: Vec<KeptChat>,
    /// Messages as the screens take them (events.rs), their files named `kept:<file>`.
    pub messages: Vec<Value>,
}

/// A file name as kept: letters, digits, `_`, `-` and `.`, never a path or `..`.
pub fn safe_name(name: &str) -> bool {
    !name.is_empty() && name.len() <= 200 && name != "." && name != ".." && name.chars().all(|c| c.is_ascii_alphanumeric() || matches!(c, '_' | '-' | '.'))
}

/// The file a message's attachment url names in the engine's media folder, if it is one.
fn media_file(url: &str, media: &Path) -> Option<String> {
    let path = url.strip_prefix("file://")?;
    let path = Path::new(path);
    if path.parent()? != media {
        return None;
    }
    let name = path.file_name()?.to_str()?.to_string();
    safe_name(&name).then_some(name)
}

/// A shown message as the history keeps it: its files' urls `kept:<file>` (or none, when it had no
/// file here). The files it names are added to `files`.
pub fn to_kept(mut msg: Value, media: &Path, files: &mut HashSet<String>) -> Value {
    if let Some(atts) = msg.get_mut("attachments").and_then(Value::as_array_mut) {
        for a in atts {
            let url = a["url"].as_str().unwrap_or_default().to_string();
            let kept = media_file(&url, media).map(|name| {
                files.insert(name.clone());
                format!("kept:{name}")
            });
            let kept = kept.unwrap_or_default();
            a["url"] = json!(kept);
            a["playUrl"] = json!(kept);
        }
    }
    msg
}

/// A kept message as the screens take it: its files' urls in `media` where they are, else none.
pub fn to_shown(mut msg: Value, media: &Path) -> Value {
    if let Some(atts) = msg.get_mut("attachments").and_then(Value::as_array_mut) {
        for a in atts {
            let url = a["url"].as_str().unwrap_or_default().to_string();
            let shown = url
                .strip_prefix("kept:")
                .filter(|n| safe_name(n))
                .map(|n| media.join(n))
                .filter(|p| p.exists())
                .map(|p| format!("file://{}", p.display()))
                .unwrap_or_default();
            a["url"] = json!(shown.clone());
            a["playUrl"] = json!(shown);
        }
    }
    msg
}

/// What a chat's events say of its messages, folded: each message once (the last word on it), with
/// its edits; those deleted are gone. Reactions, polls and the like are not history.
pub fn fold(events: impl IntoIterator<Item = Value>) -> Vec<Value> {
    let mut order: Vec<String> = Vec::new();
    let mut by_id: HashMap<String, Value> = HashMap::new();
    for ev in events {
        match ev["type"].as_str() {
            Some("message") => {
                let msg = ev["message"].clone();
                let Some(id) = msg["id"].as_str().map(str::to_string) else { continue };
                if !by_id.contains_key(&id) {
                    order.push(id.clone());
                }
                by_id.insert(id, msg);
            }
            Some("edited") => {
                if let Some(m) = ev["id"].as_str().and_then(|id| by_id.get_mut(id)) {
                    m["text"] = ev["text"].clone();
                }
            }
            Some("deleted") => {
                if let Some(id) = ev["id"].as_str() {
                    by_id.remove(id);
                }
            }
            _ => {}
        }
    }
    order.into_iter().filter_map(|id| by_id.remove(&id)).collect()
}

/// Whether a message, as kept, is one: an id of Signal's (sg:…), a chat's key, a time, and only
/// `kept:` files.
fn good_message(m: &Value) -> bool {
    let id_ok = m["id"].as_str().is_some_and(|id| id.starts_with("sg:") && id.len() <= 200);
    let atts_ok = m["attachments"].as_array().is_none_or(|atts| {
        atts.iter().all(|a| {
            let url = a["url"].as_str().unwrap_or_default();
            url.is_empty() || url.strip_prefix("kept:").is_some_and(safe_name)
        })
    });
    id_ok && m["thread"].is_i64() && m["ms"].is_u64() && atts_ok
}

/// A history as read from a backup or the engine's folder, checked: only what is one of its own,
/// each chat once, each message once and in a chat of it, by time, at most MAX_PER_CHAT a chat.
pub fn checked(h: History) -> History {
    let mut seen = HashSet::new();
    let chats: Vec<KeptChat> = h.chats.into_iter().filter(|c| c.key != 0 && seen.insert(c.key)).collect();
    let keys: HashSet<i64> = chats.iter().map(|c| c.key).collect();
    let mut ids = HashSet::new();
    let mut messages: Vec<Value> = h
        .messages
        .into_iter()
        .filter(|m| good_message(m) && keys.contains(&m["thread"].as_i64().unwrap_or(0)))
        .filter(|m| ids.insert(m["id"].as_str().unwrap_or_default().to_string()))
        .collect();
    messages.sort_by_key(|m| m["ms"].as_u64().unwrap_or(0));
    let mut per: HashMap<i64, usize> = HashMap::new();
    for m in &messages {
        *per.entry(m["thread"].as_i64().unwrap_or(0)).or_default() += 1;
    }
    let mut skip: HashMap<i64, usize> = per.into_iter().map(|(k, n)| (k, n.saturating_sub(MAX_PER_CHAT))).collect();
    messages.retain(|m| {
        let s = skip.entry(m["thread"].as_i64().unwrap_or(0)).or_default();
        if *s > 0 {
            *s -= 1;
            false
        } else {
            true
        }
    });
    History { v: VERSION, chats, messages }
}

/// Two histories as one (a restore onto what an earlier one left, or what a chat shows now onto what
/// was kept): the later's chat names and messages win where both have them.
pub fn merge(earlier: History, later: History) -> History {
    let mut chats = earlier.chats;
    for c in later.chats {
        match chats.iter_mut().find(|e| e.key == c.key) {
            Some(e) => {
                if !c.name.is_empty() {
                    e.name = c.name;
                }
                if !c.person.is_empty() {
                    e.person = c.person;
                }
                e.group |= c.group;
            }
            None => chats.push(c),
        }
    }
    let later_ids: HashSet<String> = later.messages.iter().filter_map(|m| m["id"].as_str().map(str::to_string)).collect();
    let mut messages: Vec<Value> = earlier.messages.into_iter().filter(|m| m["id"].as_str().is_none_or(|id| !later_ids.contains(id))).collect();
    messages.extend(later.messages);
    checked(History { v: VERSION, chats, messages })
}

/// The files a history's messages name.
pub fn files_of(h: &History) -> HashSet<String> {
    let mut out = HashSet::new();
    for m in &h.messages {
        for a in m["attachments"].as_array().into_iter().flatten() {
            if let Some(n) = a["url"].as_str().and_then(|u| u.strip_prefix("kept:")).filter(|n| safe_name(n)) {
                out.insert(n.to_string());
            }
        }
    }
    out
}

/// Where the engine keeps the history: `kept/` of its folder.
pub fn kept_dir(engine_dir: &Path) -> PathBuf {
    engine_dir.join("kept")
}

pub fn kept_media(engine_dir: &Path) -> PathBuf {
    kept_dir(engine_dir).join("media")
}

/// The history the engine keeps, or an empty one.
pub fn load(engine_dir: &Path) -> History {
    std::fs::read(kept_dir(engine_dir).join("kept.json"))
        .ok()
        .and_then(|b| serde_json::from_slice::<History>(&b).ok())
        .map(checked)
        .unwrap_or_default()
}

/// Keeps a history, written whole then put in place, so a broken write leaves the one before.
pub fn save(engine_dir: &Path, h: &History) -> Result<(), String> {
    let dir = kept_dir(engine_dir);
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let bytes = serde_json::to_vec(h).map_err(|e| e.to_string())?;
    let tmp = dir.join("kept.json.new");
    std::fs::write(&tmp, bytes).map_err(|e| e.to_string())?;
    std::fs::rename(&tmp, dir.join("kept.json")).map_err(|e| e.to_string())
}

/// The kept files no message names any more go.
pub fn drop_unnamed(engine_dir: &Path, h: &History) {
    let named = files_of(h);
    if let Ok(entries) = std::fs::read_dir(kept_media(engine_dir)) {
        for e in entries.flatten() {
            let name = e.file_name().to_string_lossy().to_string();
            if !named.contains(&name) {
                let _ = std::fs::remove_file(e.path());
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn msg(id: &str, thread: i64, ms: u64, text: &str, url: &str) -> Value {
        json!({"thread": thread, "id": id, "sender": 1, "name": "Ada", "text": text, "ms": ms, "mine": false, "encrypted": true,
            "attachments": if url.is_empty() { json!([]) } else { json!([{"kind": "image", "url": url, "playUrl": url, "mime": "image/jpeg", "name": "a.jpg"}]) }})
    }

    #[test]
    fn files_become_kept_names_and_back() {
        let media = Path::new("/data/signal/media");
        let mut files = HashSet::new();
        let k = to_kept(msg("sg:1:x", -5, 1, "hi", "file:///data/signal/media/sg_1_x-0.jpg"), media, &mut files);
        assert_eq!(k["attachments"][0]["url"], "kept:sg_1_x-0.jpg");
        assert!(files.contains("sg_1_x-0.jpg"));
        // A file elsewhere is never named, nor carried.
        let other = to_kept(msg("sg:2:x", -5, 2, "", "file:///etc/passwd"), media, &mut files);
        assert_eq!(other["attachments"][0]["url"], "");
        assert_eq!(files.len(), 1);
        // Shown again only where the file is.
        let shown = to_shown(k, Path::new("/nowhere"));
        assert_eq!(shown["attachments"][0]["url"], "");
    }

    #[test]
    fn edits_and_deletes_fold_into_the_messages() {
        let evs = vec![
            json!({"type": "message", "message": msg("sg:1:a", -5, 1, "one", "")}),
            json!({"type": "message", "message": msg("sg:2:a", -5, 2, "two", "")}),
            json!({"type": "edited", "id": "sg:1:a", "text": "one!"}),
            json!({"type": "deleted", "thread": -5, "id": "sg:2:a"}),
            json!({"type": "reaction", "id": "sg:1:a"}),
        ];
        let out = fold(evs);
        assert_eq!(out.len(), 1);
        assert_eq!(out[0]["text"], "one!");
    }

    #[test]
    fn what_is_not_of_a_history_is_left_out() {
        let h = History {
            v: 1,
            chats: vec![KeptChat { key: -5, name: "Ada".into(), group: false, person: String::new() }, KeptChat { key: -5, ..Default::default() }],
            messages: vec![
                msg("sg:1:a", -5, 1, "ok", "kept:a.jpg"),
                msg("sg:1:a", -5, 1, "twice", ""),
                msg("sg:2:a", -9, 2, "no such chat", ""),
                msg("x:3", -5, 3, "not Signal's", ""),
                msg("sg:4:a", -5, 4, "a path", "kept:../../signal.db"),
            ],
        };
        let c = checked(h);
        assert_eq!(c.chats.len(), 1);
        assert_eq!(c.messages.len(), 1);
        assert_eq!(c.messages[0]["text"], "ok");
        assert_eq!(files_of(&c), HashSet::from(["a.jpg".to_string()]));
    }

    #[test]
    fn a_second_restore_adds_without_doubling() {
        let a = History { v: 1, chats: vec![KeptChat { key: -5, name: "Ada".into(), ..Default::default() }], messages: vec![msg("sg:1:a", -5, 1, "one", "")] };
        let b = History {
            v: 1,
            chats: vec![KeptChat { key: -5, name: "Ada L".into(), ..Default::default() }, KeptChat { key: -7, name: "Group".into(), group: true, ..Default::default() }],
            messages: vec![msg("sg:1:a", -5, 1, "one", ""), msg("sg:2:b", -7, 2, "two", "")],
        };
        let m = merge(a, b);
        assert_eq!(m.chats.len(), 2);
        assert_eq!(m.chats[0].name, "Ada L");
        assert_eq!(m.messages.len(), 2);
    }

    #[test]
    fn it_is_kept_and_read_back_whole() {
        let dir = std::env::temp_dir().join(format!("erevos-signal-history-{}", std::process::id()));
        let h = checked(History { v: 1, chats: vec![KeptChat { key: -5, name: "Ada".into(), ..Default::default() }], messages: vec![msg("sg:1:a", -5, 1, "one", "kept:a.jpg")] });
        save(&dir, &h).unwrap();
        std::fs::create_dir_all(kept_media(&dir)).unwrap();
        std::fs::write(kept_media(&dir).join("a.jpg"), b"x").unwrap();
        std::fs::write(kept_media(&dir).join("stray.bin"), b"x").unwrap();
        drop_unnamed(&dir, &h);
        let back = load(&dir);
        assert_eq!(back.messages.len(), 1);
        assert!(kept_media(&dir).join("a.jpg").exists());
        assert!(!kept_media(&dir).join("stray.bin").exists());
        let _ = std::fs::remove_dir_all(&dir);
    }
}
