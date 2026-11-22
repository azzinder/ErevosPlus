// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

//! Signal calls: the messages that set a call up, both ways.
//!
//! The call itself (sound, pictures, its keys) is RingRTC's, Signal's own calling library, which
//! the app runs (app/modules/erevos-messenger, SignalCalls). RingRTC speaks in opaque bytes: an
//! offer, an answer, ICE candidates, a hangup or busy, and opaque group messages. They travel as
//! Signal's `CallMessage`, encrypted like any other Signal message; this module reads them into
//! events for the app and builds them from what the app asks to send.
//!
//! The app's JSON carries bytes as base64.

use base64::engine::general_purpose::STANDARD as B64;
use base64::Engine as _;
use presage::proto::call_message::{self, Answer, Busy, Hangup, IceUpdate, Offer, Opaque};
use presage::proto::CallMessage;
use serde::Deserialize;
use serde_json::{json, Value};

/// What the app asks to send: one of RingRTC's messages.
#[derive(Deserialize, Default, Debug)]
#[serde(default)]
pub struct Send {
    /// The other person's ACI.
    pub uuid: String,
    /// "offer", "answer", "ice", "hangup", "busy" or "opaque".
    pub kind: String,
    /// The call's id (RingRTC's CallId), as text: a u64 does not fit JavaScript's numbers.
    #[serde(rename = "callId")]
    pub call_id: String,
    /// The other's device the message is for; 0 or absent: all of their devices.
    pub device: u32,
    /// Offer: true for a video call.
    pub video: bool,
    /// Offer, answer, ice (each candidate), opaque: RingRTC's bytes, base64.
    pub opaque: String,
    pub candidates: Vec<String>,
    /// Hangup: "normal", "accepted", "declined", "busy" or "needPermission", and the device it names.
    #[serde(rename = "hangupType")]
    pub hangup_type: String,
    #[serde(rename = "hangupDevice")]
    pub hangup_device: u32,
    /// Opaque: whether it must be handled now (a ring) or may be dropped.
    pub urgent: bool,
}

fn bytes(s: &str) -> Result<Vec<u8>, String> {
    B64.decode(s.trim()).map_err(|e| format!("bad base64: {e}"))
}

fn id_of(s: &str) -> Result<u64, String> {
    s.trim().parse::<u64>().map_err(|_| "bad call id".to_string())
}

fn hangup_type(word: &str) -> call_message::hangup::Type {
    use call_message::hangup::Type;
    match word {
        "accepted" => Type::HangupAccepted,
        "declined" => Type::HangupDeclined,
        "busy" => Type::HangupBusy,
        "needPermission" => Type::HangupNeedPermission,
        _ => Type::HangupNormal,
    }
}

fn hangup_word(t: i32) -> &'static str {
    use call_message::hangup::Type;
    match Type::try_from(t).unwrap_or(Type::HangupNormal) {
        Type::HangupNormal => "normal",
        Type::HangupAccepted => "accepted",
        Type::HangupDeclined => "declined",
        Type::HangupBusy => "busy",
        Type::HangupNeedPermission => "needPermission",
    }
}

/// The `CallMessage` for what the app asks to send.
pub fn build(s: &Send) -> Result<CallMessage, String> {
    let mut cm = CallMessage::default();
    if s.device > 0 {
        cm.destination_device_id = Some(s.device);
    }
    match s.kind.as_str() {
        "offer" => {
            let kind = if s.video { call_message::offer::Type::OfferVideoCall } else { call_message::offer::Type::OfferAudioCall };
            cm.offer = Some(Offer { id: Some(id_of(&s.call_id)?), r#type: Some(kind as i32), opaque: Some(bytes(&s.opaque)?) });
        }
        "answer" => {
            cm.answer = Some(Answer { id: Some(id_of(&s.call_id)?), opaque: Some(bytes(&s.opaque)?) });
        }
        "ice" => {
            let id = id_of(&s.call_id)?;
            if s.candidates.is_empty() {
                return Err("no candidates".into());
            }
            cm.ice_update = s.candidates.iter().map(|c| Ok(IceUpdate { id: Some(id), opaque: Some(bytes(c)?) })).collect::<Result<_, String>>()?;
        }
        "hangup" => {
            cm.hangup = Some(Hangup {
                id: Some(id_of(&s.call_id)?),
                r#type: Some(hangup_type(&s.hangup_type) as i32),
                device_id: Some(s.hangup_device),
            });
        }
        "busy" => {
            cm.busy = Some(Busy { id: Some(id_of(&s.call_id)?) });
        }
        "opaque" => {
            let urgency = if s.urgent { call_message::opaque::Urgency::HandleImmediately } else { call_message::opaque::Urgency::Droppable };
            cm.opaque = Some(Opaque { data: Some(bytes(&s.opaque)?), urgency: Some(urgency as i32) });
        }
        other => return Err(format!("unknown call message: {other}")),
    }
    Ok(cm)
}

/// Who a call message came from and where it stands, as the app needs it for RingRTC.
pub struct From<'a> {
    pub uuid: &'a str,
    /// The person's chat key.
    pub person: i64,
    pub name: &'a str,
    pub device: u32,
    /// This phone's own device id.
    pub my_device: u32,
    /// How long ago the server took it, seconds: RingRTC ignores an offer that is too old.
    pub age_secs: u64,
    /// The two identity keys (32 bytes each, base64), the sender's and ours: RingRTC binds the
    /// call's keys to them, as Signal does.
    pub their_identity: String,
    pub my_identity: String,
}

/// The event for one received call message; None when it is for another of our devices, or empty.
pub fn read(cm: &CallMessage, from: &From) -> Option<Value> {
    if let Some(d) = cm.destination_device_id {
        if d != 0 && d != from.my_device {
            return None;
        }
    }
    let mut ev = json!({
        "type": "signalCall", "network": "signal",
        "uuid": from.uuid, "person": from.person.to_string(), "name": from.name,
        "device": from.device, "myDevice": from.my_device, "ageSecs": from.age_secs,
        "theirIdentity": from.their_identity, "myIdentity": from.my_identity,
    });
    let o = ev.as_object_mut()?;
    if let Some(offer) = &cm.offer {
        o.insert("kind".into(), json!("offer"));
        o.insert("callId".into(), json!(offer.id?.to_string()));
        o.insert("video".into(), json!(offer.r#type == Some(call_message::offer::Type::OfferVideoCall as i32)));
        o.insert("opaque".into(), json!(B64.encode(offer.opaque.as_deref()?)));
    } else if let Some(answer) = &cm.answer {
        o.insert("kind".into(), json!("answer"));
        o.insert("callId".into(), json!(answer.id?.to_string()));
        o.insert("opaque".into(), json!(B64.encode(answer.opaque.as_deref()?)));
    } else if !cm.ice_update.is_empty() {
        let id = cm.ice_update.iter().find_map(|i| i.id)?;
        let list: Vec<String> = cm.ice_update.iter().filter(|i| i.id == Some(id)).filter_map(|i| i.opaque.as_deref().map(|b| B64.encode(b))).collect();
        if list.is_empty() {
            return None;
        }
        o.insert("kind".into(), json!("ice"));
        o.insert("callId".into(), json!(id.to_string()));
        o.insert("candidates".into(), json!(list));
    } else if let Some(h) = &cm.hangup {
        o.insert("kind".into(), json!("hangup"));
        o.insert("callId".into(), json!(h.id?.to_string()));
        o.insert("hangupType".into(), json!(hangup_word(h.r#type.unwrap_or(0))));
        o.insert("hangupDevice".into(), json!(h.device_id.unwrap_or(0)));
    } else if let Some(b) = &cm.busy {
        o.insert("kind".into(), json!("busy"));
        o.insert("callId".into(), json!(b.id?.to_string()));
    } else if let Some(op) = &cm.opaque {
        o.insert("kind".into(), json!("opaque"));
        o.insert("opaque".into(), json!(B64.encode(op.data.as_deref()?)));
    } else {
        return None;
    }
    Some(ev)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn from() -> From<'static> {
        From { uuid: "u", person: -5, name: "N", device: 2, my_device: 1, age_secs: 3, their_identity: "a".into(), my_identity: "b".into() }
    }

    #[test]
    fn offer_both_ways() {
        let s = Send { uuid: "u".into(), kind: "offer".into(), call_id: "18446744073709551615".into(), device: 2, video: true, opaque: B64.encode([1, 2, 3]), ..Default::default() };
        let cm = build(&s).unwrap();
        assert_eq!(cm.destination_device_id, Some(2));
        // Addressed to device 2: our device 1 does not take it.
        assert!(read(&cm, &from()).is_none());
        let mut cm = cm;
        cm.destination_device_id = Some(1);
        let ev = read(&cm, &from()).unwrap();
        assert_eq!(ev["kind"], "offer");
        assert_eq!(ev["callId"], "18446744073709551615");
        assert_eq!(ev["video"], true);
        assert_eq!(ev["opaque"], B64.encode([1, 2, 3]));
        assert_eq!(ev["person"], "-5");
    }

    #[test]
    fn ice_hangup_busy_opaque() {
        let ice = build(&Send { kind: "ice".into(), call_id: "7".into(), candidates: vec![B64.encode([9]), B64.encode([8])], ..Default::default() }).unwrap();
        let ev = read(&ice, &from()).unwrap();
        assert_eq!(ev["kind"], "ice");
        assert_eq!(ev["candidates"].as_array().unwrap().len(), 2);
        let h = build(&Send { kind: "hangup".into(), call_id: "7".into(), hangup_type: "declined".into(), hangup_device: 3, ..Default::default() }).unwrap();
        let ev = read(&h, &from()).unwrap();
        assert_eq!(ev["hangupType"], "declined");
        assert_eq!(ev["hangupDevice"], 3);
        let b = build(&Send { kind: "busy".into(), call_id: "7".into(), ..Default::default() }).unwrap();
        assert_eq!(read(&b, &from()).unwrap()["kind"], "busy");
        let o = build(&Send { kind: "opaque".into(), opaque: B64.encode([4]), urgent: true, ..Default::default() }).unwrap();
        assert_eq!(o.opaque.as_ref().unwrap().urgency, Some(call_message::opaque::Urgency::HandleImmediately as i32));
        assert_eq!(read(&o, &from()).unwrap()["kind"], "opaque");
        assert!(build(&Send { kind: "ice".into(), call_id: "7".into(), ..Default::default() }).is_err());
        assert!(build(&Send { kind: "offer".into(), call_id: "x".into(), ..Default::default() }).is_err());
    }
}
