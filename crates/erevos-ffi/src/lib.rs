// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! The Erevos core as the apps call it: byte arrays in, byte arrays out, and
//! nothing kept here between calls. The app keeps what comes back, sealed in
//! its own storage, and passes it in again. So the same calls work through
//! JNI on Android (feature `android`) and through WebAssembly in a browser or
//! under Node for the app's checks (feature `web`).
//!
//! A call that returns several values returns one byte array of parts, each a
//! 4-byte big-endian length followed by its bytes.
//!
//! Not audited.

use erevos_core::coupon;
use erevos_core::conversation::{self, Account, Conversation, Kind};
use erevos_core::pqxdh::{PrekeyBundle, Prekeys};

#[cfg(feature = "android")]
mod android;
#[cfg(feature = "web")]
mod web;

/// Errors cross as their message, the same through JNI and WebAssembly.
pub type Result<T> = std::result::Result<T, String>;

fn fail(e: erevos_core::Error) -> String {
    e.to_string()
}

/// Joins values into one array of length-prefixed parts.
pub fn parts(items: &[&[u8]]) -> Vec<u8> {
    let mut out = Vec::with_capacity(items.iter().map(|i| 4 + i.len()).sum());
    for item in items {
        out.extend_from_slice(&(item.len() as u32).to_be_bytes());
        out.extend_from_slice(item);
    }
    out
}

/// The values of an array of length-prefixed parts.
fn unparts(bytes: &[u8]) -> Result<Vec<&[u8]>> {
    let mut out = Vec::new();
    let mut rest = bytes;
    while !rest.is_empty() {
        let len = rest.get(..4).map(|l| u32::from_be_bytes(l.try_into().unwrap()) as usize).ok_or("damaged parts")?;
        out.push(rest.get(4..4 + len).ok_or("damaged parts")?);
        rest = &rest[4 + len..];
    }
    Ok(out)
}

/// A new account's secret keys.
pub fn account_new() -> Vec<u8> {
    Account::generate().to_secret_bytes().to_vec()
}

/// The account's signed public keys, for a contact link.
pub fn account_bundle(account: &[u8]) -> Result<Vec<u8>> {
    Ok(Account::from_secret_bytes(account).map_err(fail)?.bundle().to_bytes())
}

/// The account's identity key.
pub fn account_identity(account: &[u8]) -> Result<Vec<u8>> {
    Ok(Account::from_secret_bytes(account).map_err(fail)?.identity_key().to_vec())
}

/// Checks a bundle from a contact link and returns its identity key.
pub fn bundle_identity(bundle: &[u8]) -> Result<Vec<u8>> {
    let bundle = PrekeyBundle::from_bytes(bundle).map_err(fail)?;
    bundle.verify().map_err(fail)?;
    Ok(bundle.identity_dh.to_bytes().to_vec())
}

/// The account's Ed25519 signature of `message` under `context` (the list of
/// its linked devices), for its contacts to check with `bundle_verify`.
pub fn account_sign(account: &[u8], context: &[u8], message: &[u8]) -> Result<Vec<u8>> {
    let account = Account::from_secret_bytes(account).map_err(fail)?;
    Ok(account.sign(context, message).map_err(fail)?.to_vec())
}

/// Checks a bundle, then that its identity key signed `message` under
/// `context`: the bundle's identity key when it did, nothing when it did not.
pub fn bundle_verify(bundle: &[u8], context: &[u8], message: &[u8], signature: &[u8]) -> Result<Vec<u8>> {
    let bundle = PrekeyBundle::from_bytes(bundle).map_err(fail)?;
    match bundle.verify_signed(context, message, signature) {
        Ok(()) => Ok(bundle.identity_dh.to_bytes().to_vec()),
        Err(erevos_core::Error::BadSignature) => Ok(Vec::new()),
        Err(error) => Err(fail(error)),
    }
}

/// The account's X25519 identity saying that its bundle's Ed25519 key is its
/// own (erevos_core::bind), for contacts to check with `bundle_bound`.
pub fn account_bind(account: &[u8]) -> Result<Vec<u8>> {
    Ok(Account::from_secret_bytes(account).map_err(fail)?.bind().to_vec())
}

/// Blinds the coupon of `nonce` (32 bytes) for the issuer whose public key is
/// `spki` (erevos_core::coupon): the blinded message, then the secret, each
/// after a 2-byte length, then the 32-byte message randomizer.
pub fn coupon_blind(spki: &[u8], nonce: &[u8]) -> Result<Vec<u8>> {
    let nonce: [u8; coupon::NONCE] = nonce.try_into().map_err(|_| "malformed input".to_string())?;
    let blinded = coupon::blind(spki, &nonce).map_err(fail)?;
    let mut out = Vec::with_capacity(4 + blinded.message.len() + blinded.secret.len() + coupon::RANDOMIZER);
    for part in [&blinded.message, &blinded.secret] {
        out.extend_from_slice(&(part.len() as u16).to_be_bytes());
        out.extend_from_slice(part);
    }
    out.extend_from_slice(&blinded.randomizer);
    Ok(out)
}

/// Unblinds the issuer's blind signature of a coupon: its signature, checked
/// against the issuer's key.
pub fn coupon_finalize(spki: &[u8], blind_signature: &[u8], secret: &[u8], randomizer: &[u8], nonce: &[u8]) -> Result<Vec<u8>> {
    let nonce: [u8; coupon::NONCE] = nonce.try_into().map_err(|_| "malformed input".to_string())?;
    let randomizer: [u8; coupon::RANDOMIZER] = randomizer.try_into().map_err(|_| "malformed input".to_string())?;
    coupon::finalize(spki, blind_signature, secret, &randomizer, &nonce).map_err(fail)
}

/// Checks a bundle, then that its X25519 identity said its Ed25519 key is its
/// own: the bundle's identity key when it did, nothing when it did not.
pub fn bundle_bound(bundle: &[u8], signature: &[u8]) -> Result<Vec<u8>> {
    let bundle = PrekeyBundle::from_bytes(bundle).map_err(fail)?;
    match bundle.verify_bound(signature) {
        Ok(()) => Ok(bundle.identity_dh.to_bytes().to_vec()),
        Err(erevos_core::Error::BadSignature) => Ok(Vec::new()),
        Err(error) => Err(fail(error)),
    }
}

/// Starts a conversation: the conversation, then the first packet.
pub fn conversation_start(account: &[u8], bundle: &[u8], plaintext: &[u8]) -> Result<Vec<u8>> {
    let account = Account::from_secret_bytes(account).map_err(fail)?;
    let bundle = PrekeyBundle::from_bytes(bundle).map_err(fail)?;
    let (conversation, packet) = conversation::start(&account, &bundle, plaintext).map_err(fail)?;
    Ok(parts(&[&conversation.to_secret_bytes(), &packet]))
}

/// Opens a first packet: the conversation it starts, then the plaintext.
pub fn conversation_accept(account: &[u8], packet: &[u8]) -> Result<Vec<u8>> {
    // The account has no one-time prekeys, so accepting leaves it unchanged.
    let mut account = Account::from_secret_bytes(account).map_err(fail)?;
    let (conversation, plaintext) = conversation::accept(&mut account, packet).map_err(fail)?;
    Ok(parts(&[&conversation.to_secret_bytes(), &plaintext]))
}

/// Fresh prekeys signed by the account, for its contacts to start their
/// next conversations with: their secret, then their bundle.
pub fn account_prekeys(account: &[u8]) -> Result<Vec<u8>> {
    let account = Account::from_secret_bytes(account).map_err(fail)?;
    let (prekeys, bundle) = account.new_prekeys();
    Ok(parts(&[&prekeys.to_secret_bytes(), &bundle.to_bytes()]))
}

/// Opens a first packet as `conversation_accept` does, trying each of the
/// account's newer prekeys (`prekeys`, parts of what `account_prekeys` gave)
/// in turn, then those of its contact link.
pub fn conversation_accept_any(account: &[u8], prekeys: &[u8], packet: &[u8]) -> Result<Vec<u8>> {
    let mut account = Account::from_secret_bytes(account).map_err(fail)?;
    for secret in unparts(prekeys)? {
        let mut keys = Prekeys::from_secret_bytes(secret).map_err(fail)?;
        if let Ok((conversation, plaintext)) = conversation::accept_with(&account, &mut keys, packet) {
            return Ok(parts(&[&conversation.to_secret_bytes(), &plaintext]));
        }
    }
    let (conversation, plaintext) = conversation::accept(&mut account, packet).map_err(fail)?;
    Ok(parts(&[&conversation.to_secret_bytes(), &plaintext]))
}

/// Seals a message: the conversation as it is now, then the packet.
pub fn conversation_seal(conversation: &[u8], plaintext: &[u8]) -> Result<Vec<u8>> {
    let mut conversation = Conversation::from_secret_bytes(conversation).map_err(fail)?;
    let packet = conversation.seal(plaintext).map_err(fail)?;
    Ok(parts(&[&conversation.to_secret_bytes(), &packet]))
}

/// A conversation put back from a backup, made safe to seal in again: its
/// sending chain moved past the keys it may have sealed with since then.
pub fn conversation_restored(conversation: &[u8]) -> Result<Vec<u8>> {
    let mut conversation = Conversation::from_secret_bytes(conversation).map_err(fail)?;
    conversation.restored().map_err(fail)?;
    Ok(conversation.to_secret_bytes().to_vec())
}

/// The conversation with the post-quantum ratchet on (erevos_core::spqr), once
/// the other side's Erevos says it reads its messages. On already, as it was.
pub fn conversation_enable_pq(conversation: &[u8]) -> Result<Vec<u8>> {
    let mut conversation = Conversation::from_secret_bytes(conversation).map_err(fail)?;
    conversation.enable_pq();
    Ok(conversation.to_secret_bytes().to_vec())
}

/// Whether the conversation's post-quantum ratchet is on: one byte, 1 or 0.
pub fn conversation_pq(conversation: &[u8]) -> Result<Vec<u8>> {
    Ok(vec![u8::from(Conversation::from_secret_bytes(conversation).map_err(fail)?.pq().is_some())])
}

/// Opens a following packet: the conversation as it is now, then the
/// plaintext. A packet from someone else fails.
pub fn conversation_open(conversation: &[u8], packet: &[u8]) -> Result<Vec<u8>> {
    let mut conversation = Conversation::from_secret_bytes(conversation).map_err(fail)?;
    let plaintext = conversation.open(packet).map_err(fail)?;
    Ok(parts(&[&conversation.to_secret_bytes(), &plaintext]))
}

/// The other person's identity key.
pub fn conversation_peer(conversation: &[u8]) -> Result<Vec<u8>> {
    Ok(Conversation::from_secret_bytes(conversation).map_err(fail)?.peer().to_vec())
}

/// 1 for a first packet, 2 for a following one, 0 for bytes that are neither.
pub fn packet_kind(packet: &[u8]) -> u8 {
    match conversation::kind(packet) {
        Ok(Kind::First) => 1,
        Ok(Kind::Following) => 2,
        Err(_) => 0,
    }
}

/// The id of the handshake in a first packet, to tell a replayed one.
pub fn first_message_id(packet: &[u8]) -> Result<Vec<u8>> {
    Ok(conversation::first_message_id(packet).map_err(fail)?.to_vec())
}

/// Chats exported from another messenger (crates/erevos-import), for the
/// app as UTF-8 JSON: a list of `{source, title, skipped, messages}`, each
/// message `{at, local, sender, text, attachments, paths}`. `at` is in
/// seconds, on the exporting phone's clock when `local`; `attachments` names
/// the kind of each file, and `paths` where each is in the export, relative to
/// its folder, for the app to bring in from a zip with them. `name` is the
/// file's name, UTF-8.
pub fn import_chats(name: &[u8], data: &[u8]) -> Result<Vec<u8>> {
    use erevos_import::{AttachmentKind, Source, Time};
    let chats = erevos_import::read(&String::from_utf8_lossy(name), data).map_err(|e| e.to_string())?;
    let json: Vec<serde_json::Value> = chats
        .iter()
        .map(|chat| {
            let messages: Vec<serde_json::Value> = chat
                .messages
                .iter()
                .map(|m| {
                    let (at, local) = match m.sent_at {
                        Some(Time::Unix(at)) => (Some(at), false),
                        Some(Time::Local(at)) => (Some(at), true),
                        None => (None, false),
                    };
                    let attachments: Vec<&str> = m
                        .attachments
                        .iter()
                        .map(|a| match a.kind {
                            AttachmentKind::Photo => "photo",
                            AttachmentKind::Video => "video",
                            AttachmentKind::Voice => "voice",
                            AttachmentKind::Sticker => "sticker",
                            AttachmentKind::File => "file",
                        })
                        .collect();
                    let paths: Vec<String> =
                        m.attachments.iter().map(|a| a.path.to_string_lossy().replace('\\', "/")).collect();
                    serde_json::json!({
                        "at": at, "local": local, "sender": m.sender, "text": m.text, "attachments": attachments,
                        "paths": paths,
                    })
                })
                .collect();
            let source = match chat.source {
                Source::Telegram => "telegram",
                Source::Viber => "viber",
                Source::WhatsApp => "whatsapp",
            };
            serde_json::json!({ "source": source, "title": chat.title, "skipped": chat.skipped, "messages": messages })
        })
        .collect();
    serde_json::to_vec(&json).map_err(|e| e.to_string())
}

/// Seals a send to a contact's relay, to go through this phone's own relay
/// first (two-hop sending, erevos_core::relay_seal). `relay_key` is from the
/// contact's link, `sender_id` is the queue's sender id.
pub fn relay_seal(relay_key: &[u8], sender_id: &[u8], message: &[u8]) -> Result<Vec<u8>> {
    let relay_key = <[u8; 32]>::try_from(relay_key).map_err(|_| "a relay key is 32 bytes".to_string())?;
    let sender_id = <[u8; 24]>::try_from(sender_id).map_err(|_| "a sender id is 24 bytes".to_string())?;
    erevos_core::relay_seal::seal(&relay_key, &sender_id, message).map_err(fail)
}

/// Pairing by a short code (erevos_core::cpace): this side's secret scalar (32
/// bytes) and the share it sends (32 bytes), for the `code`, `channel` and
/// `session` both sides know.
pub fn pair_start(code: &[u8], channel: &[u8], session: &[u8]) -> Result<Vec<u8>> {
    let (secret, share) = erevos_core::cpace::start(code, channel, session);
    Ok([secret.as_slice(), &share].concat())
}

/// The pairing's shared key (64 bytes) from this side's `secret`, the
/// `session`, both shares (the one who started first), and `own_started`
/// ([1] if this side started, else [0]). Fails for a share that is not a point.
pub fn pair_finish(secret: &[u8], session: &[u8], started: &[u8], answered: &[u8], own_started: &[u8]) -> Result<Vec<u8>> {
    let own = own_started.first() == Some(&1);
    Ok(erevos_core::cpace::finish(secret, session, started, answered, own).map_err(fail)?.to_vec())
}

/// The tag that proves a side holds the pairing's `key` (`started`: [1] for the
/// one who started, [0] for the other), 32 bytes.
pub fn pair_confirm(key: &[u8], started: &[u8]) -> Result<Vec<u8>> {
    Ok(erevos_core::cpace::confirm(key, started.first() == Some(&1)).to_vec())
}

/// Empty when `tag` is the proof of the side `started` says for `key`, checked
/// in constant time; fails when it is not (a wrong code).
pub fn pair_confirmed(key: &[u8], started: &[u8], tag: &[u8]) -> Result<Vec<u8>> {
    if erevos_core::cpace::confirmed(key, started.first() == Some(&1), tag) {
        Ok(Vec::new())
    } else {
        Err("the code is not the same on both phones".into())
    }
}

/// A voice message's voice changed (erevos_core::voice_shift): `pcm` 16-bit
/// little-endian mono samples, `rate` 4 bytes big-endian samples a second,
/// `kind` [1] deeper or [2] higher. The samples back, as many.
pub fn voice_change(pcm: &[u8], rate: &[u8], kind: &[u8]) -> Result<Vec<u8>> {
    let rate = <[u8; 4]>::try_from(rate).map_err(|_| "rate: 4 bytes")?;
    let kind = *kind.first().ok_or("kind: 1 byte")?;
    erevos_core::voice_shift::change(pcm, u32::from_be_bytes(rate), kind).map_err(fail)
}

/// The words of a voice message (erevos_speech), written out on the phone: `path` the model
/// file (UTF-8), checked against the SHA-256 the app knows the first time it is opened; `pcm`
/// 16-bit little-endian mono samples; `rate` 4 bytes big-endian samples a second; `language` a
/// code such as "el" (UTF-8), or empty for the one heard. The words back, UTF-8. The model stays
/// open for the next, till `speech_let_go`.
#[cfg(feature = "speech")]
pub fn speech_text(path: &[u8], pcm: &[u8], rate: &[u8], language: &[u8]) -> Result<Vec<u8>> {
    let path = std::str::from_utf8(path).map_err(|_| "path: UTF-8")?;
    let language = std::str::from_utf8(language).map_err(|_| "language: UTF-8")?;
    let rate = u32::from_be_bytes(<[u8; 4]>::try_from(rate).map_err(|_| "rate: 4 bytes")?);
    let mut open = SPEECH.lock().unwrap_or_else(|failed| {
        // A call that failed midway (a panic, caught where the core is called) left the model as it
        // was then: it is let go of, and opened anew, so the next try works without a restart.
        let mut open = failed.into_inner();
        *open = None;
        SPEECH.clear_poison();
        open
    });
    if open.as_ref().map(|(at, _)| at.as_str()) != Some(path) {
        *open = None;
        let model = erevos_speech::open(std::path::Path::new(path), erevos_speech::MODEL_SHA256).map_err(|e| e.to_string())?;
        *open = Some((path.to_string(), model));
    }
    let (_, model) = open.as_mut().expect("opened above");
    Ok(erevos_speech::transcribe(model, pcm, rate, language).map_err(|e| e.to_string())?.into_bytes())
}

/// Lets go of the speech model and the memory it holds (about 1.5 GB).
#[cfg(feature = "speech")]
pub fn speech_let_go(_nothing: &[u8]) -> Result<Vec<u8>> {
    if let Ok(mut open) = SPEECH.lock() {
        *open = None;
    }
    Ok(Vec::new())
}

#[cfg(feature = "speech")]
static SPEECH: std::sync::Mutex<Option<(String, erevos_speech::Model)>> = std::sync::Mutex::new(None);

/// `text` (UTF-8) translated on the phone (erevos_speech::Translator) from `from` into `to`
/// (codes such as "el", "en"), with the model file at `path` (UTF-8), checked against the SHA-256
/// erevos_speech::TRANSLATIONS has for them the first time it is opened. The translation back,
/// UTF-8. The two models used last stay open, as a way through English takes two, till
/// `translate_let_go`.
#[cfg(feature = "speech")]
pub fn translate_text(path: &[u8], from: &[u8], to: &[u8], text: &[u8]) -> Result<Vec<u8>> {
    let path = std::str::from_utf8(path).map_err(|_| "path: UTF-8")?;
    let from = std::str::from_utf8(from).map_err(|_| "from: UTF-8")?;
    let to = std::str::from_utf8(to).map_err(|_| "to: UTF-8")?;
    let text = std::str::from_utf8(text).map_err(|_| "text: UTF-8")?;
    let mut open = TRANSLATORS.lock().unwrap_or_else(|failed| {
        // As for the speech model above: the models are opened anew after a call that failed midway.
        let mut open = failed.into_inner();
        open.clear();
        TRANSLATORS.clear_poison();
        open
    });
    let at = match open.iter().position(|(at, _)| at == path) {
        Some(i) => i,
        None => {
            let model = erevos_speech::open_translation(std::path::Path::new(path), from, to).map_err(|e| e.to_string())?;
            if open.len() >= 2 {
                open.remove(0);
            }
            open.push((path.to_string(), model));
            open.len() - 1
        }
    };
    let (_, model) = &mut open[at];
    if model.languages() != (from, to) {
        return Err("the translation model open is for other languages".into());
    }
    Ok(model.translate(text).map_err(|e| e.to_string())?.into_bytes())
}

/// Lets go of the translation models and the memory they hold (about 300 MB each).
#[cfg(feature = "speech")]
pub fn translate_let_go(_nothing: &[u8]) -> Result<Vec<u8>> {
    if let Ok(mut open) = TRANSLATORS.lock() {
        open.clear();
    }
    Ok(Vec::new())
}

#[cfg(feature = "speech")]
static TRANSLATORS: std::sync::Mutex<Vec<(String, erevos_speech::Translator)>> = std::sync::Mutex::new(Vec::new());

/// The public key for a 32-byte secret, for others to seal to with `relay_seal`
/// (an SMS invite's key, which opens the answer to it).
pub fn seal_public(secret: &[u8]) -> Result<Vec<u8>> {
    let secret = <[u8; 32]>::try_from(secret).map_err(|_| "a secret key is 32 bytes".to_string())?;
    Ok(erevos_core::relay_seal::RelayKey::from_secret_bytes(secret).public().to_vec())
}

/// Opens what `relay_seal` sealed to the public key of `secret`: the 24-byte
/// sender id, then the message.
pub fn seal_open(secret: &[u8], sealed: &[u8]) -> Result<Vec<u8>> {
    let secret = <[u8; 32]>::try_from(secret).map_err(|_| "a secret key is 32 bytes".to_string())?;
    let (sender, message) = erevos_core::relay_seal::RelayKey::from_secret_bytes(secret).open(sealed).map_err(fail)?;
    Ok([sender.as_slice(), &message].concat())
}

/// The keys of a channel to a relay (erevos_core::relay_channel), once the
/// relay's `answer` to the hello made with `secret` (`HELLO`, then the public
/// key `seal_public` gives for it) proves the relay holds the secret key of
/// `relay_key`: 32 bytes for phone to relay, then 32 for relay to phone. Fails
/// when it does not.
pub fn relay_channel_keys(relay_key: &[u8], secret: &[u8], answer: &[u8]) -> Result<Vec<u8>> {
    let relay_key = <[u8; 32]>::try_from(relay_key).map_err(|_| "a relay key is 32 bytes".to_string())?;
    let secret = <[u8; 32]>::try_from(secret).map_err(|_| "a secret key is 32 bytes".to_string())?;
    let (opening, _) = erevos_core::relay_channel::Opening::with_secret(&relay_key, secret);
    let (to_relay, to_phone) = opening.keys(answer).map_err(fail)?;
    Ok([to_relay, to_phone].concat())
}

/// Whether `signature` is the Ed25519 signature of `message` by the public
/// key `key`: one byte, 1 or 0. Keys and signatures of the wrong size fail.
pub fn signature_verify(key: &[u8], message: &[u8], signature: &[u8]) -> Result<Vec<u8>> {
    match erevos_core::verify_signature(key, message, signature) {
        Ok(()) => Ok(vec![1]),
        Err(erevos_core::Error::BadSignature) => Ok(vec![0]),
        Err(error) => Err(fail(error)),
    }
}

/// The most memory and passes `hard_key` takes, so a file that names its own
/// cost (a backup) cannot make the phone run out of memory or time.
const HARD_MOST_KIB: u32 = 256 * 1024;
const HARD_MOST_PASSES: u32 = 16;

/// Argon2id (one lane, 32 bytes) of `input` with `salt`, for the keys that
/// come from passwords and PINs (app/lib/crypto.ts). `cost` is the memory in
/// KiB and the passes, each 4 bytes big-endian.
pub fn hard_key(input: &[u8], salt: &[u8], cost: &[u8]) -> Result<Vec<u8>> {
    let cost = <[u8; 8]>::try_from(cost).map_err(|_| "a cost is 8 bytes".to_string())?;
    let memory = u32::from_be_bytes([cost[0], cost[1], cost[2], cost[3]]);
    let passes = u32::from_be_bytes([cost[4], cost[5], cost[6], cost[7]]);
    if memory > HARD_MOST_KIB || passes > HARD_MOST_PASSES {
        return Err("that cost is more than Erevos takes".to_string());
    }
    let params = argon2::Params::new(memory, passes, 1, Some(32)).map_err(|e| e.to_string())?;
    let mut out = vec![0u8; 32];
    argon2::Argon2::new(argon2::Algorithm::Argon2id, argon2::Version::V0x13, params)
        .hash_password_into(input, salt, &mut out)
        .map_err(|e| e.to_string())?;
    Ok(out)
}

/// Relay requests through Tor (erevos_tor), with byte arrays in and out as
/// the JNI calls take them: paths and addresses are UTF-8, a connection's
/// handle is 8 bytes, big-endian. Bridges come one per line, and the
/// pluggable transports program as its path, empty when there is none.
#[cfg(feature = "tor")]
pub mod tor {
    use super::Result;

    fn text(bytes: &[u8]) -> Result<&str> {
        std::str::from_utf8(bytes).map_err(|_| "not UTF-8".to_string())
    }

    fn handle(bytes: &[u8]) -> Result<u64> {
        Ok(u64::from_be_bytes(bytes.try_into().map_err(|_| "a handle is 8 bytes".to_string())?))
    }

    pub fn start(state_dir: &[u8], cache_dir: &[u8], bridges: &[u8], transports: &[u8]) -> Result<Vec<u8>> {
        let bridges = erevos_tor::Bridges {
            lines: text(bridges)?.lines().map(str::trim).filter(|line| !line.is_empty()).map(String::from).collect(),
            transports: Some(text(transports)?).filter(|path| !path.is_empty()).map(std::path::PathBuf::from),
        };
        erevos_tor::start(text(state_dir)?.as_ref(), text(cache_dir)?.as_ref(), bridges)?;
        Ok(Vec::new())
    }

    pub fn open(url: &[u8], token: &[u8]) -> Result<Vec<u8>> {
        Ok(erevos_tor::open(text(url)?, text(token)?)?.to_be_bytes().to_vec())
    }

    /// A connection for a channel to the relay's own key: its handle.
    pub fn open_channel(url: &[u8]) -> Result<Vec<u8>> {
        Ok(erevos_tor::open_channel(text(url)?)?.to_be_bytes().to_vec())
    }

    /// A connection on the circuits named `way`, for a channel when `channel` is 1: its handle.
    pub fn open_on(url: &[u8], token: &[u8], way: &[u8], channel: &[u8]) -> Result<Vec<u8>> {
        Ok(erevos_tor::open_on(text(url)?, text(token)?, text(way)?, channel == [1])?.to_be_bytes().to_vec())
    }

    pub fn call(id: &[u8], message: &[u8]) -> Result<Vec<u8>> {
        erevos_tor::call(handle(id)?, message)
    }

    pub fn close(id: &[u8]) -> Result<Vec<u8>> {
        erevos_tor::close(handle(id)?);
        Ok(Vec::new())
    }

    pub fn request(url: &[u8], token: &[u8], message: &[u8]) -> Result<Vec<u8>> {
        erevos_tor::request(text(url)?, text(token)?, message)
    }

    /// One HTTP request through Tor (a Matrix homeserver's): `head` is JSON, `{"method", "url",
    /// "headers": {name: value}, "chat"?}` (a chat's name for circuits of its own). Answers the status
    /// in 2 bytes, big-endian, then the body.
    pub fn http(head: &[u8], body: &[u8]) -> Result<Vec<u8>> {
        let head: serde_json::Value = serde_json::from_slice(head).map_err(|e| e.to_string())?;
        let field = |name: &str| head.get(name).and_then(serde_json::Value::as_str).ok_or_else(|| format!("no {name}"));
        let headers: Vec<(String, String)> = head
            .get("headers")
            .and_then(serde_json::Value::as_object)
            .map(|all| all.iter().filter_map(|(k, v)| Some((k.clone(), v.as_str()?.to_string()))).collect())
            .unwrap_or_default();
        let chat = head.get("chat").and_then(serde_json::Value::as_str).filter(|chat| !chat.is_empty());
        let (status, mut answer) = erevos_tor::http_on(field("method")?, field("url")?, &headers, body, chat)?;
        let mut out = status.to_be_bytes().to_vec();
        out.append(&mut answer);
        Ok(out)
    }

    /// A Nostr relay's connection through Tor, for text frames: its handle. `url`, or `url` and a
    /// chat's name after a line break, for circuits of that chat's own.
    pub fn text_open(url: &[u8]) -> Result<Vec<u8>> {
        let (url, chat) = match text(url)?.split_once('\n') {
            Some((url, chat)) if !chat.is_empty() => (url, Some(chat)),
            Some((url, _)) => (url, None),
            None => (text(url)?, None),
        };
        Ok(erevos_tor::text_open_on(url, chat)?.to_be_bytes().to_vec())
    }

    pub fn text_send(id: &[u8], frame: &[u8]) -> Result<Vec<u8>> {
        erevos_tor::text_send(handle(id)?, text(frame)?)?;
        Ok(Vec::new())
    }

    /// The next frame the relay sent, waiting up to `wait` milliseconds (8 bytes, big-endian):
    /// empty when none came, as a Nostr relay sends no empty frame.
    pub fn text_next(id: &[u8], wait: &[u8]) -> Result<Vec<u8>> {
        let wait = u64::from_be_bytes(wait.try_into().map_err(|_| "a wait is 8 bytes".to_string())?);
        Ok(erevos_tor::text_next(handle(id)?, std::time::Duration::from_millis(wait.min(120_000)))?.unwrap_or_default().into_bytes())
    }

    pub fn text_close(id: &[u8]) -> Result<Vec<u8>> {
        erevos_tor::text_close(handle(id)?);
        Ok(Vec::new())
    }

    /// An XMPP server's connection, straight or through Tor: `head` is JSON, `{"host", "port",
    /// "domain", "tls": "direct" or "starttls", "tor": true or false}`; or, with "tls": "https", a
    /// web server's in TLS with no ALPN, for HTTP/1.1 (a station played through Tor). Its handle.
    pub fn net_open(head: &[u8]) -> Result<Vec<u8>> {
        let head: serde_json::Value = serde_json::from_slice(head).map_err(|e| e.to_string())?;
        let field = |name: &str| head.get(name).and_then(serde_json::Value::as_str).ok_or_else(|| format!("no {name}"));
        let port = head.get("port").and_then(serde_json::Value::as_u64).and_then(|p| u16::try_from(p).ok()).ok_or("no port")?;
        let tls = match field("tls")? {
            "direct" => erevos_tor::Tls::Direct,
            "starttls" => erevos_tor::Tls::StartTls,
            "https" => erevos_tor::Tls::Https,
            other => return Err(format!("no TLS called {other}")),
        };
        let tor = head.get("tor").and_then(serde_json::Value::as_bool).unwrap_or(false);
        Ok(erevos_tor::stream_open(field("host")?, port, field("domain")?, tls, tor)?.to_be_bytes().to_vec())
    }

    pub fn net_write(id: &[u8], bytes: &[u8]) -> Result<Vec<u8>> {
        erevos_tor::stream_write(handle(id)?, bytes)?;
        Ok(Vec::new())
    }

    /// What the server sent, waiting up to `wait` milliseconds (8 bytes, big-endian) for
    /// something: empty when nothing came.
    pub fn net_read(id: &[u8], wait: &[u8]) -> Result<Vec<u8>> {
        let wait = u64::from_be_bytes(wait.try_into().map_err(|_| "a wait is 8 bytes".to_string())?);
        Ok(erevos_tor::stream_read(handle(id)?, std::time::Duration::from_millis(wait.min(120_000)))?.unwrap_or_default())
    }

    pub fn net_close(id: &[u8]) -> Result<Vec<u8>> {
        erevos_tor::stream_close(handle(id)?);
        Ok(Vec::new())
    }

    /// Tor's progress as JSON: {"text": ..., "ready": ...}.
    pub fn status() -> String {
        let (text, ready) = erevos_tor::status();
        serde_json::json!({ "text": text, "ready": ready }).to_string()
    }

    pub fn stop() {
        erevos_tor::stop();
    }

    /// The SOCKS5 door into Tor for Signal's and Telegram's engines (erevos_tor::socks_open), as
    /// JSON: {"port": ..., "password": ...}. Each engine names its own circuits by its user name.
    pub fn socks_open() -> Result<String> {
        let door = erevos_tor::socks_open()?;
        Ok(serde_json::json!({ "port": door.port, "password": door.password }).to_string())
    }

    pub fn socks_close() {
        erevos_tor::socks_close();
    }
}

/// Nostr for message text (crates/erevos-nostr): the keys each contact gets of its own, and the
/// events that carry sealed packets to Nostr relays.
pub mod nostr {
    use super::Result;

    /// A new secret key, 32 bytes.
    pub fn secret() -> Result<Vec<u8>> {
        Ok(erevos_nostr::new_secret().to_vec())
    }

    /// The public key of `secret`, 32 bytes, as Nostr writes keys (x only).
    pub fn public(secret: &[u8]) -> Result<Vec<u8>> {
        Ok(erevos_nostr::public_key(secret)?.to_vec())
    }

    /// An event for the key `to` carrying `bytes`, made at `now` (seconds, 8 bytes big-endian): its JSON.
    pub fn wrap(to: &[u8], bytes: &[u8], now: &[u8]) -> Result<Vec<u8>> {
        let now = u64::from_be_bytes(now.try_into().map_err(|_| "a time is 8 bytes".to_string())?);
        Ok(erevos_nostr::wrap(to, bytes, now)?.into_bytes())
    }

    /// What an event for the key of `secret` carried: its id (32 bytes), its time (8 bytes,
    /// big-endian), then the bytes.
    pub fn unwrap(secret: &[u8], event: &[u8]) -> Result<Vec<u8>> {
        let event = std::str::from_utf8(event).map_err(|_| "not UTF-8".to_string())?;
        let opened = erevos_nostr::unwrap(secret, event)?;
        let id: Vec<u8> = (0..32).map(|i| u8::from_str_radix(&opened.id[i * 2..i * 2 + 2], 16).unwrap_or(0)).collect();
        Ok([id.as_slice(), &opened.created_at.to_be_bytes(), &opened.bytes].concat())
    }
}

/// Matrix accounts in Erevos (crates/erevos-matrix, docs/matrix.md): one JSON request in, its
/// JSON answer out, for all of Matrix's encryption.
pub fn matrix(request: &[u8]) -> Result<Vec<u8>> {
    networks::matrix(request)
}

/// XMPP accounts in Erevos (crates/erevos-xmpp, docs/xmpp.md): one JSON request in, its JSON
/// answer out, for OMEMO.
pub fn xmpp(request: &[u8]) -> Result<Vec<u8>> {
    networks::xmpp(request)
}

/// Chats with other Nostr apps (crates/erevos-nostr chat, docs/nostr-chats.md): one JSON request
/// in, its JSON answer out, for NIP-17's messages and NIP-19's keys.
pub fn nostr_chat(request: &[u8]) -> Result<Vec<u8>> {
    networks::nostr_chat(request)
}

/// Matrix, XMPP and chats with other Nostr apps, in Erevos+ (the `networks` feature).
#[cfg(feature = "networks")]
mod networks {
    use super::Result;

    pub fn matrix(request: &[u8]) -> Result<Vec<u8>> {
        erevos_matrix::call(request)
    }

    pub fn xmpp(request: &[u8]) -> Result<Vec<u8>> {
        erevos_xmpp::call(request)
    }

    pub fn nostr_chat(request: &[u8]) -> Result<Vec<u8>> {
        erevos_nostr::chat::call(request)
    }
}

/// The plain Erevos (built without the `networks` feature, docs/editions.md) has no Matrix, XMPP
/// nor chats with other Nostr apps: their modules are not offered there, so nothing asks; if
/// something does, it is told so instead of the app stopping.
#[cfg(not(feature = "networks"))]
mod networks {
    use super::Result;

    fn not_here(what: &str) -> Result<Vec<u8>> {
        Err(format!("{what} is in Erevos+, not in this Erevos"))
    }

    pub fn matrix(_request: &[u8]) -> Result<Vec<u8>> {
        not_here("Matrix")
    }

    pub fn xmpp(_request: &[u8]) -> Result<Vec<u8>> {
        not_here("XMPP")
    }

    pub fn nostr_chat(_request: &[u8]) -> Result<Vec<u8>> {
        not_here("Nostr chats")
    }
}

/// The safety number of two identity keys.
pub fn safety_number(ours: &[u8], theirs: &[u8]) -> Result<String> {
    let key = |b: &[u8]| <[u8; 32]>::try_from(b).map_err(|_| "an identity key is 32 bytes".to_string());
    Ok(conversation::safety_number(&key(ours)?, &key(theirs)?))
}

/// Group chats (crates/erevos-group): a member's state goes in and comes back out with every
/// call that changes it, like a conversation's. A leaf is a 4-byte big-endian number.
mod group {
    use super::{parts, Result};
    use erevos_group::{Member, Opened};

    fn fail(e: erevos_group::Error) -> String {
        e.to_string()
    }

    fn member(state: &[u8]) -> Result<Member> {
        Member::from_bytes(state).map_err(fail)
    }

    fn leaf(bytes: &[u8]) -> Result<u32> {
        Ok(u32::from_be_bytes(bytes.try_into().map_err(|_| "a leaf is 4 bytes".to_string())?))
    }

    /// A new member's state, saying `about` of itself.
    pub fn group_new(about: &[u8]) -> Result<Vec<u8>> {
        Ok(Member::new(about).map_err(fail)?.to_bytes())
    }

    /// The state, then a key package for an admin to add this member with.
    pub fn group_key_package(state: &[u8]) -> Result<Vec<u8>> {
        let member = member(state)?;
        let package = member.key_package().map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &package]))
    }

    /// The state, with what this member says about itself in groups it joins from now on.
    pub fn group_set_about(state: &[u8], about: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        member.set_about(about);
        Ok(member.to_bytes())
    }

    /// The state, then the new group's id.
    pub fn group_create(state: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let id = member.create().map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &id]))
    }

    /// The state, the commit for the members already in, and the welcome for the new one.
    pub fn group_add(state: &[u8], id: &[u8], key_package: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let (commit, welcome) = member.add(id, &[key_package]).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &commit, &welcome]))
    }

    /// The state, then the commit that takes the member at `leaf` out.
    pub fn group_remove(state: &[u8], id: &[u8], leaf_bytes: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let commit = member.remove(id, &[leaf(leaf_bytes)?]).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &commit]))
    }

    /// The state, then the commit for what members asked, empty when there is nothing to commit.
    pub fn group_commit_pending(state: &[u8], id: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let commit = member.commit_pending(id).map_err(fail)?.unwrap_or_default();
        Ok(parts(&[&member.to_bytes(), &commit]))
    }

    /// The state, then the id of the group the welcome joins.
    pub fn group_join(state: &[u8], welcome: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let id = member.join(welcome).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &id]))
    }

    /// The state, then a key package for the keeper to put this member in the group anew with,
    /// saying `about`, so its keys are new.
    pub fn group_renewal(state: &[u8], id: &[u8], about: &[u8]) -> Result<Vec<u8>> {
        let member = member(state)?;
        let package = member.renewal(id, about).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &package]))
    }

    /// The state, the commit, then the welcome that put the member at `leaf` in anew with the key
    /// package it gave for that. Keeper only.
    pub fn group_renew(state: &[u8], id: &[u8], leaf_bytes: &[u8], key_package: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let (commit, welcome) = member.renew(id, leaf(leaf_bytes)?, key_package).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &commit, &welcome]))
    }

    /// The state, then the commit that gives the keeper's own leaf new keys. Keeper only.
    pub fn group_self_update(state: &[u8], id: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let commit = member.self_update(id, None).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &commit]))
    }

    /// As `group_self_update`, the leaf saying `about` of itself from then on.
    pub fn group_self_update_as(state: &[u8], id: &[u8], about: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let commit = member.self_update(id, Some(about)).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &commit]))
    }

    /// The state with the group taken back from the keeper's welcome after this member's renewal.
    pub fn group_rejoin(state: &[u8], id: &[u8], welcome: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        member.rejoin(id, welcome).map_err(fail)?;
        Ok(member.to_bytes())
    }

    /// The state, then the sealed message.
    pub fn group_seal(state: &[u8], id: &[u8], text: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let message = member.seal(id, text).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &message]))
    }

    /// The state, then the message asking the admin to take this member out.
    pub fn group_leave(state: &[u8], id: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let message = member.leave(id).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &message]))
    }

    /// The state without the group.
    pub fn group_forget(state: &[u8], id: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        member.forget(id).map_err(fail)?;
        Ok(member.to_bytes())
    }

    /// The group's members as UTF-8 JSON: `{own, members: [{leaf, about, key}]}`, `about` as
    /// UTF-8, `key` (the key the member signs with) in hex.
    pub fn group_members(state: &[u8], id: &[u8]) -> Result<Vec<u8>> {
        let (seats, own) = member(state)?.members(id).map_err(fail)?;
        let hex = |bytes: &[u8]| bytes.iter().map(|b| format!("{b:02x}")).collect::<String>();
        let members: Vec<serde_json::Value> = seats
            .iter()
            .map(|seat| serde_json::json!({ "leaf": seat.leaf, "about": String::from_utf8_lossy(&seat.about), "key": hex(&seat.key) }))
            .collect();
        serde_json::to_vec(&serde_json::json!({ "own": own, "members": members })).map_err(|e| e.to_string())
    }

    // Public groups (docs/public-groups.md).

    // The values of an array of length-prefixed parts.
    fn split(bytes: &[u8]) -> Result<Vec<&[u8]>> {
        let mut out = Vec::new();
        let mut rest = bytes;
        while !rest.is_empty() {
            let len = rest.get(..4).map(|l| u32::from_be_bytes(l.try_into().unwrap()) as usize).ok_or("damaged parts")?;
            out.push(rest.get(4..4 + len).ok_or("damaged parts")?);
            rest = &rest[4 + len..];
        }
        Ok(out)
    }

    /// The state, then a new key to sign with in one public group (its public half).
    pub fn group_new_signer(state: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let key = member.new_signer().map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &key]))
    }

    /// The state, then a key package to ask to join a public group with, signed with `key` (from
    /// `group_new_signer`) and saying `about`.
    pub fn group_key_package_as(state: &[u8], key: &[u8], about: &[u8]) -> Result<Vec<u8>> {
        let member = member(state)?;
        let package = member.key_package_as(key, about).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &package]))
    }

    /// The state, then the id of a new public group, signed in with `key`, saying `about`, with
    /// the app's first `rules`.
    pub fn group_create_public(state: &[u8], key: &[u8], about: &[u8], rules: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let id = member.create_public(key, about, rules).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &id]))
    }

    /// The group's epoch now (8 bytes), its keeper's leaf, then its rules: empty for a private group.
    pub fn group_rules(state: &[u8], id: &[u8]) -> Result<Vec<u8>> {
        let rules = member(state)?.rules(id).map_err(fail)?;
        Ok(parts(&[&rules.epoch.to_be_bytes(), &rules.keeper.to_be_bytes(), &rules.rules]))
    }

    /// The state, the commit, then the welcome (empty without adds): the keeper's one commit of
    /// `key_packages` (as parts) to add, the leaves in `removes` (4 bytes each) to take out, and
    /// with `rules` not empty, a keeper's leaf (4 bytes) and the rules after it.
    pub fn group_commit(state: &[u8], id: &[u8], key_packages: &[u8], removes: &[u8], rules: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let packages = split(key_packages)?;
        if !removes.len().is_multiple_of(4) {
            return Err("a leaf is 4 bytes".to_string());
        }
        let leaves: Vec<u32> = removes.chunks(4).map(|l| u32::from_be_bytes(l.try_into().unwrap())).collect();
        let rules = match rules.len() {
            0 => None,
            1..=3 => return Err("a leaf is 4 bytes".to_string()),
            _ => Some((leaf(&rules[..4])?, &rules[4..])),
        };
        let (commit, welcome) = member.commit(id, &packages, &leaves, rules).map_err(fail)?;
        Ok(parts(&[&member.to_bytes(), &commit, &welcome]))
    }

    /// What a key package says about its member, then the key it signs with, once its signatures hold.
    pub fn group_package_about(key_package: &[u8]) -> Result<Vec<u8>> {
        let (about, key) = Member::package_about(key_package).map_err(fail)?;
        Ok(parts(&[&about, &key]))
    }

    /// The epoch a group message was sent in (8 bytes), without opening it.
    pub fn group_epoch(message: &[u8]) -> Result<Vec<u8>> {
        Ok(Member::epoch_of(message).map_err(fail)?.to_be_bytes().to_vec())
    }

    /// The id of the group a message is for.
    pub fn group_of(message: &[u8]) -> Result<Vec<u8>> {
        Member::group_of(message).map_err(fail)
    }

    /// Opens a group message: the state, then one byte for what it was, the group's id, the
    /// sender's leaf, what the sender says about itself, and the text. The byte: 1 a message,
    /// 2 the group changed, 3 this member was taken out, 4 a member asks to leave, 5 to try again
    /// after the next commit, 6 this member was put in anew and waits for its welcome, 0 nothing
    /// to show.
    pub fn group_open(state: &[u8], message: &[u8]) -> Result<Vec<u8>> {
        let mut member = member(state)?;
        let opened = member.open(message).map_err(fail)?;
        let none: &[u8] = &[];
        let (kind, id, sender, about, text) = match &opened {
            Opened::Message { group, sender, about, text } => (1u8, group.as_slice(), *sender, about.as_slice(), text.as_slice()),
            Opened::Changed { group } => (2, group.as_slice(), 0, none, none),
            Opened::Removed { group } => (3, group.as_slice(), 0, none, none),
            Opened::Leaving { group, sender } => (4, group.as_slice(), *sender, none, none),
            Opened::Later { group } => (5, group.as_slice(), 0, none, none),
            Opened::Renewing { group } => (6, group.as_slice(), 0, none, none),
            Opened::Nothing => (0, none, 0, none, none),
        };
        Ok(parts(&[&member.to_bytes(), &[kind], id, &sender.to_be_bytes(), about, text]))
    }
}

pub use group::*;

#[cfg(test)]
mod no_panic;

#[cfg(test)]
mod tests {
    use super::*;

    fn split(bytes: &[u8]) -> Vec<Vec<u8>> {
        let mut out = Vec::new();
        let mut rest = bytes;
        while !rest.is_empty() {
            let len = u32::from_be_bytes(rest[..4].try_into().unwrap()) as usize;
            out.push(rest[4..4 + len].to_vec());
            rest = &rest[4 + len..];
        }
        out
    }

    #[test]
    fn a_coupon_goes_round_through_the_calls() {
        let issuer = coupon::Issuer::generate().unwrap();
        let nonce = [9u8; 32];
        let packed = coupon_blind(issuer.public_spki(), &nonce).unwrap();
        let len = |at: usize| u16::from_be_bytes([packed[at], packed[at + 1]]) as usize;
        let message = &packed[2..2 + len(0)];
        let at = 2 + message.len();
        let secret = &packed[at + 2..at + 2 + len(at)];
        let randomizer = &packed[at + 2 + secret.len()..];
        assert_eq!(randomizer.len(), 32);
        let signed = issuer.sign(message).unwrap();
        let signature = coupon_finalize(issuer.public_spki(), &signed, secret, randomizer, &nonce).unwrap();
        coupon::verify(issuer.public_spki(), &signature, randomizer.try_into().unwrap(), &nonce).unwrap();
        assert!(coupon_finalize(issuer.public_spki(), &signed, secret, randomizer, &[1u8; 32]).is_err());
        assert!(coupon_blind(issuer.public_spki(), &[0u8; 31]).is_err());
    }

    #[test]
    fn hard_keys_are_argon2id() {
        let cost = |m: u32, t: u32| [m.to_be_bytes(), t.to_be_bytes()].concat();
        // The same as @noble/hashes gives, which the app falls back on without the core.
        let key = hard_key(&[1; 32], &[2; 16], &cost(32, 3)).unwrap();
        let hex: String = key.iter().map(|b| format!("{b:02x}")).collect();
        assert_eq!(hex, "30e0b44b7e23423b7282859ea36f02825b5828dde3c25f124d59d42d7235e132");
        assert_eq!(key, hard_key(&[1; 32], &[2; 16], &cost(32, 3)).unwrap());
        assert_ne!(key, hard_key(&[1; 32], &[3; 16], &cost(32, 3)).unwrap());
        assert_ne!(key, hard_key(&[1; 32], &[2; 16], &cost(64, 3)).unwrap());
        assert!(hard_key(&[1; 32], &[2; 16], &cost(256 * 1024 + 1, 1)).is_err());
        assert!(hard_key(&[1; 32], &[2; 16], &cost(64, 17)).is_err());
        assert!(hard_key(&[1; 32], &[2; 16], &[0; 7]).is_err());
        assert!(hard_key(&[1; 32], &[2; 4], &cost(64, 1)).is_err());
    }

    #[test]
    fn checks_signatures() {
        // RFC 8032, test 2: one byte signed.
        let unhex = |h: &str| (0..h.len()).step_by(2).map(|i| u8::from_str_radix(&h[i..i + 2], 16).unwrap()).collect::<Vec<u8>>();
        let key = unhex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c");
        let signature = unhex("92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00");
        assert_eq!(signature_verify(&key, &[0x72], &signature).unwrap(), vec![1]);
        assert_eq!(signature_verify(&key, &[0x73], &signature).unwrap(), vec![0]);
        let mut other = signature.clone();
        other[0] ^= 1;
        assert_eq!(signature_verify(&key, &[0x72], &other).unwrap(), vec![0]);
        assert!(signature_verify(&key[..31], &[0x72], &signature).is_err());
        assert!(signature_verify(&key, &[0x72], &signature[..63]).is_err());
    }

    #[test]
    fn accounts_sign_what_their_bundles_check() {
        let account = account_new();
        let bundle = account_bundle(&account).unwrap();
        let signature = account_sign(&account, b"devices", b"list").unwrap();
        assert_eq!(signature.len(), 64);
        assert_eq!(bundle_verify(&bundle, b"devices", b"list", &signature).unwrap(), account_identity(&account).unwrap());
        assert!(bundle_verify(&bundle, b"devices", b"other", &signature).unwrap().is_empty());
        let other = account_bundle(&account_new()).unwrap();
        assert!(bundle_verify(&other, b"devices", b"list", &signature).unwrap().is_empty());
        assert!(bundle_verify(&bundle, b"devices", b"list", &signature[..10]).is_err());
        assert!(bundle_verify(&bundle[..20], b"devices", b"list", &signature).is_err());
        assert!(account_sign(&account, b"", b"list").is_err());
        let bound = account_bind(&account).unwrap();
        assert_eq!(bundle_bound(&bundle, &bound).unwrap(), account_identity(&account).unwrap());
        assert!(bundle_bound(&other, &bound).unwrap().is_empty());
        assert!(bundle_bound(&bundle, &bound[..10]).is_err());
    }

    #[test]
    fn first_packets_open_with_newer_prekeys_or_the_links() {
        let (alice, bob) = (account_new(), account_new());
        let made = split(&account_prekeys(&bob).unwrap());
        let (secret, bundle) = (&made[0], &made[1]);
        assert_eq!(bundle_identity(bundle).unwrap(), account_identity(&bob).unwrap());
        let older = split(&account_prekeys(&bob).unwrap());
        let first = split(&conversation_start(&alice, bundle, b"hi").unwrap())[1].clone();
        // Found among the newer ones, in any place, and not without them.
        let kept = parts(&[&older[0], secret]);
        assert_eq!(split(&conversation_accept_any(&bob, &kept, &first).unwrap())[1], b"hi");
        assert!(conversation_accept_any(&bob, &parts(&[&older[0]]), &first).is_err());
        assert!(conversation_accept(&bob, &first).is_err());
        // The link's bundle still works, with or without newer ones.
        let by_link = split(&conversation_start(&alice, &account_bundle(&bob).unwrap(), b"link").unwrap())[1].clone();
        assert_eq!(split(&conversation_accept_any(&bob, &kept, &by_link).unwrap())[1], b"link");
        assert_eq!(split(&conversation_accept_any(&bob, &[], &by_link).unwrap())[1], b"link");
        assert!(conversation_accept_any(&bob, &[0, 0, 0, 9, 1], &by_link).is_err());
    }

    #[test]
    fn seals_for_a_relay() {
        let relay = erevos_core::relay_seal::RelayKey::generate();
        let sealed = relay_seal(&relay.public(), &[3; 24], b"hi").unwrap();
        assert_eq!(relay.open(&sealed).unwrap(), ([3; 24], b"hi".to_vec()));
        assert!(relay_seal(&[1; 31], &[3; 24], b"hi").is_err());
        assert!(relay_seal(&relay.public(), &[3; 23], b"hi").is_err());
    }

    #[test]
    fn opens_what_was_sealed_to_a_secret() {
        let secret = [9u8; 32];
        let sealed = relay_seal(&seal_public(&secret).unwrap(), &[3; 24], b"hi").unwrap();
        assert_eq!(seal_open(&secret, &sealed).unwrap(), [[3u8; 24].as_slice(), b"hi"].concat());
        assert!(seal_open(&[8; 32], &sealed).is_err());
        assert!(seal_public(&[1; 31]).is_err());
    }

    #[test]
    fn a_relay_channel_opens_only_with_the_relays_proof() {
        let relay = erevos_core::relay_seal::RelayKey::generate();
        let secret = [5u8; 32];
        let hello = [&[erevos_core::relay_channel::HELLO][..], &seal_public(&secret).unwrap()].concat();
        let (answer, _) = erevos_core::relay_channel::accept(&relay, &hello).unwrap();
        let keys = relay_channel_keys(&relay.public(), &secret, &answer).unwrap();
        let (opening, same) = erevos_core::relay_channel::Opening::with_secret(&relay.public(), secret);
        assert_eq!(same.to_vec(), hello);
        let (to_relay, to_phone) = opening.keys(&answer).unwrap();
        assert_eq!(keys, [to_relay, to_phone].concat());
        let other = erevos_core::relay_seal::RelayKey::generate();
        assert!(relay_channel_keys(&other.public(), &secret, &answer).is_err());
        assert!(relay_channel_keys(&relay.public(), &secret, &answer[1..]).is_err());
    }

    #[test]
    fn imports_a_chat_as_json() {
        let text = "17/10/2026, 09:06 - Μαρία: γεια\n17/10/2026, 09:07 - Nekten: IMG-1.jpg (file attached)";
        let json: serde_json::Value =
            serde_json::from_slice(&import_chats("WhatsApp Chat with Μαρία.txt".as_bytes(), text.as_bytes()).unwrap())
                .unwrap();
        assert_eq!(json[0]["source"], "whatsapp");
        assert_eq!(json[0]["title"], "Μαρία");
        assert_eq!(json[0]["messages"][0]["text"], "γεια");
        assert_eq!(json[0]["messages"][0]["local"], true);
        assert_eq!(json[0]["messages"][0]["at"], 1_792_227_960);
        assert_eq!(json[0]["messages"][1]["attachments"][0], "photo");
        assert_eq!(json[0]["messages"][1]["paths"][0], "IMG-1.jpg");
        assert!(import_chats(b"x.html", b"<html>").unwrap_err().contains("result.json"));
    }

    #[test]
    fn two_accounts_talk_through_bytes_only() {
        let alice = account_new();
        let bob = account_new();
        let link = account_bundle(&bob).unwrap();
        assert_eq!(bundle_identity(&link).unwrap(), account_identity(&bob).unwrap());

        let started = split(&conversation_start(&alice, &link, b"hello").unwrap());
        assert_eq!(packet_kind(&started[1]), 1);
        let accepted = split(&conversation_accept(&bob, &started[1]).unwrap());
        assert_eq!(accepted[1], b"hello");
        assert_eq!(conversation_peer(&accepted[0]).unwrap(), account_identity(&alice).unwrap());
        assert_eq!(first_message_id(&started[1]).unwrap().len(), 32);

        let reply = split(&conversation_seal(&accepted[0], b"hi").unwrap());
        assert_eq!(packet_kind(&reply[1]), 2);
        let opened = split(&conversation_open(&started[0], &reply[1]).unwrap());
        assert_eq!(opened[1], b"hi");
        assert!(conversation_open(&started[0], &[1, 2, 3]).is_err());
        assert_eq!(packet_kind(b"{\"from\":\"\"}"), 0);

        let ours = account_identity(&alice).unwrap();
        let theirs = account_identity(&bob).unwrap();
        assert_eq!(safety_number(&ours, &theirs).unwrap(), safety_number(&theirs, &ours).unwrap());
        assert!(safety_number(&ours, &[0; 3]).is_err());
    }

    #[test]
    fn a_group_talks_through_bytes_only() {
        let alice = group_new(b"{\"a\":1}").unwrap();
        let bob = group_new(b"bob").unwrap();
        let [alice, id]: [Vec<u8>; 2] = split(&group_create(&alice).unwrap()).try_into().unwrap();
        let [bob, package]: [Vec<u8>; 2] = split(&group_key_package(&bob).unwrap()).try_into().unwrap();
        let [alice, _commit, welcome]: [Vec<u8>; 3] = split(&group_add(&alice, &id, &package).unwrap()).try_into().unwrap();
        let [bob, joined]: [Vec<u8>; 2] = split(&group_join(&bob, &welcome).unwrap()).try_into().unwrap();
        assert_eq!(joined, id);

        let [_bob, message]: [Vec<u8>; 2] = split(&group_seal(&bob, &id, b"hi").unwrap()).try_into().unwrap();
        assert_eq!(group_of(&message).unwrap(), id);
        let opened = split(&group_open(&alice, &message).unwrap());
        assert_eq!(opened[1], [1]);
        assert_eq!(opened[2], id);
        assert_eq!(opened[3], 1u32.to_be_bytes());
        assert_eq!(opened[4], b"bob");
        assert_eq!(opened[5], b"hi");

        let members: serde_json::Value = serde_json::from_slice(&group_members(&opened[0], &id).unwrap()).unwrap();
        assert_eq!(members["own"], 0);
        assert_eq!(members["members"][0]["about"], "{\"a\":1}");
        assert_eq!(members["members"][1]["leaf"], 1);

        let [alice, commit]: [Vec<u8>; 2] = split(&group_remove(&opened[0], &id, &1u32.to_be_bytes()).unwrap()).try_into().unwrap();
        assert!(!commit.is_empty());
        assert!(group_remove(&alice, &id, &[1]).is_err());
        let [alice, nothing]: [Vec<u8>; 2] = split(&group_commit_pending(&alice, &id).unwrap()).try_into().unwrap();
        assert!(nothing.is_empty());
        assert!(group_members(&group_forget(&alice, &id).unwrap(), &id).is_err());
    }

    #[test]
    fn a_public_group_goes_through_bytes_only() {
        let [alice, key]: [Vec<u8>; 2] = split(&group_new_signer(&group_new(b"a").unwrap()).unwrap()).try_into().unwrap();
        let [alice, id]: [Vec<u8>; 2] = split(&group_create_public(&alice, &key, b"alice", b"{}").unwrap()).try_into().unwrap();
        let [bob, bob_key]: [Vec<u8>; 2] = split(&group_new_signer(&group_new(b"b").unwrap()).unwrap()).try_into().unwrap();
        let [bob, package]: [Vec<u8>; 2] = split(&group_key_package_as(&bob, &bob_key, b"bob").unwrap()).try_into().unwrap();
        assert_eq!(split(&group_package_about(&package).unwrap()), [b"bob".to_vec(), bob_key.clone()]);

        let rules = [&0u32.to_be_bytes()[..], b"{\"v\":1}"].concat();
        let [alice, commit, welcome]: [Vec<u8>; 3] =
            split(&group_commit(&alice, &id, &parts(&[&package]), &[], &rules).unwrap()).try_into().unwrap();
        assert!(!commit.is_empty());
        let [bob, _]: [Vec<u8>; 2] = split(&group_join(&bob, &welcome).unwrap()).try_into().unwrap();
        assert_eq!(split(&group_rules(&bob, &id).unwrap()), [1u64.to_be_bytes().to_vec(), 0u32.to_be_bytes().to_vec(), b"{\"v\":1}".to_vec()]);
        let members: serde_json::Value = serde_json::from_slice(&group_members(&bob, &id).unwrap()).unwrap();
        assert_eq!(members["members"][1]["key"], bob_key.iter().map(|b| format!("{b:02x}")).collect::<String>());

        let [_, message]: [Vec<u8>; 2] = split(&group_seal(&bob, &id, b"hi").unwrap()).try_into().unwrap();
        assert_eq!(group_epoch(&message).unwrap(), 1u64.to_be_bytes());
        // Taking out Bob, with no new rules and no welcome.
        let [_, _, welcome]: [Vec<u8>; 3] = split(&group_commit(&alice, &id, &[], &1u32.to_be_bytes(), &[]).unwrap()).try_into().unwrap();
        assert!(welcome.is_empty());
        assert!(group_commit(&alice, &id, &[], &[1, 2], &[]).is_err());
    }

    #[test]
    fn a_member_renews_its_keys_through_bytes_only() {
        let alice = group_new(b"alice").unwrap();
        let [alice, id]: [Vec<u8>; 2] = split(&group_create(&alice).unwrap()).try_into().unwrap();
        let [bob, package]: [Vec<u8>; 2] = split(&group_key_package(&group_new(b"bob").unwrap()).unwrap()).try_into().unwrap();
        let [alice, _, welcome]: [Vec<u8>; 3] = split(&group_add(&alice, &id, &package).unwrap()).try_into().unwrap();
        let [bob, _]: [Vec<u8>; 2] = split(&group_join(&bob, &welcome).unwrap()).try_into().unwrap();

        let [bob, package]: [Vec<u8>; 2] = split(&group_renewal(&bob, &id, b"bob, renewed").unwrap()).try_into().unwrap();
        let [alice, commit, welcome]: [Vec<u8>; 3] = split(&group_renew(&alice, &id, &1u32.to_be_bytes(), &package).unwrap()).try_into().unwrap();
        // The commit first: Bob waits for the welcome (6).
        let opened = split(&group_open(&bob, &commit).unwrap());
        assert_eq!((opened[1].as_slice(), opened[2].as_slice()), (&[6u8][..], id.as_slice()));
        let bob = group_rejoin(&opened[0], &id, &welcome).unwrap();
        let [alice, commit]: [Vec<u8>; 2] = split(&group_self_update(&alice, &id).unwrap()).try_into().unwrap();
        let opened = split(&group_open(&bob, &commit).unwrap());
        assert_eq!(opened[1], [2]);
        let [bob, message]: [Vec<u8>; 2] = split(&group_seal(&opened[0], &id, b"hi").unwrap()).try_into().unwrap();
        let opened = split(&group_open(&alice, &message).unwrap());
        assert_eq!((opened[1].as_slice(), opened[4].as_slice(), opened[5].as_slice()), (&[1u8][..], &b"bob, renewed"[..], &b"hi"[..]));
        assert!(group_renew(&alice, &id, &[1], &package).is_err());
        // The keeper says where it reads now with its next keys.
        let [alice, commit]: [Vec<u8>; 2] = split(&group_self_update_as(&opened[0], &id, b"alice, moved").unwrap()).try_into().unwrap();
        let bob = split(&group_open(&bob, &commit).unwrap()).swap_remove(0);
        let [_, message]: [Vec<u8>; 2] = split(&group_seal(&alice, &id, b"here").unwrap()).try_into().unwrap();
        let opened = split(&group_open(&bob, &message).unwrap());
        assert_eq!((opened[4].as_slice(), opened[5].as_slice()), (&b"alice, moved"[..], &b"here"[..]));
    }

    #[test]
    fn a_damaged_bundle_is_refused() {
        let mut link = account_bundle(&account_new()).unwrap();
        link[40] ^= 1;
        assert_eq!(bundle_identity(&link).unwrap_err(), "prekey bundle signature is invalid");
        assert!(bundle_identity(&link[..100]).is_err());
    }
}
