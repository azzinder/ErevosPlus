// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

//! Changes to a Signal group (name, members, admins), which presage does not offer: the change
//! is built with libsignal-service's group operations, sent to Signal's storage service as a
//! PATCH (as Signal's own apps do), then announced to the members with the signed change, and
//! the group is fetched again so the local copy is the server's.

use presage::libsignal_service::configuration::{Endpoint, ServiceConfiguration, ServiceCredentials};
use presage::libsignal_service::groups_v2::{decrypt_group, GroupOperations, GroupsManager, InMemoryCredentialsCache, Role};
use presage::libsignal_service::prelude::ProtobufMessage;
use presage::libsignal_service::proto::group_change::actions::{ModifyMemberRoleAction, ModifyTitleAction};
use presage::libsignal_service::proto::group_change::Actions;
use presage::libsignal_service::proto::{GroupChange, GroupChangeResponse};
use presage::libsignal_service::protocol::{Aci, ServiceId};
use presage::libsignal_service::push_service::{HttpAuthOverride, PushService};
use presage::libsignal_service::utils::TryIntoE164;
use presage::libsignal_service::websocket::Unidentified;
use presage::libsignal_service::zkgroup::groups::{GroupMasterKey, GroupSecretParams};
use presage::manager::Registered;
use presage::store::ContentsStore;
use presage::Manager;
use presage_store_sqlite::SqliteStore;
use uuid::Uuid;

type Ready = Manager<SqliteStore, Registered>;

/// One change, as the app asks for it.
pub enum Change {
    Title(String),
    Remove(Uuid),
    Admin(Uuid, bool),
    /// Invited: Signal adds people by invitation unless their profile key credential is at
    /// hand; they accept in their own app.
    Invite(Vec<Uuid>),
}

/// Applies `change` to the group with `master_key`. Returns the new revision and the signed
/// change, to be put in the group context of the message that announces it.
pub async fn apply(m: &Ready, master_key: [u8; 32], current_revision: u32, change: Change) -> Result<(u32, Vec<u8>), String> {
    let data = m.registration_data();
    // The account's password is not public in presage; it is in the serialized registration.
    let raw = serde_json::to_value(data).map_err(|e| e.to_string())?;
    let password = raw.get("password").and_then(|v| v.as_str()).ok_or("no account password")?.to_string();
    let creds = ServiceCredentials {
        aci: Some(data.service_ids.aci),
        pni: Some(data.service_ids.pni),
        phonenumber: (&data.phone_number).try_into_e164().map_err(|e| e.to_string())?,
        password: Some(password),
        device_id: data.device_id.and_then(|d| d.try_into().ok()),
    };
    let servers = data.signal_servers;
    let config: ServiceConfiguration = servers.into();
    let identified = PushService::new(servers, Some(creds), presage::libsignal_service::USER_AGENT);
    let mut unidentified = PushService::new(servers, None, presage::libsignal_service::USER_AGENT);
    let ws = unidentified
        .ws::<Unidentified>("/v1/websocket/", "/v1/keepalive", &[], None)
        .await
        .map_err(|e| e.to_string())?;
    let mut groups = GroupsManager::new(
        data.service_ids.clone(),
        identified.clone(),
        ws,
        InMemoryCredentialsCache::default(),
        config.zkgroup_server_public_params,
    );

    let secret = GroupSecretParams::derive_from_master_key(GroupMasterKey::new(master_key));
    let ops = GroupOperations::new(secret);
    let me = Aci::from(data.service_ids.aci);
    let mut rng = rand::rng();
    // An ACI encrypted with the group's key, as the actions want it (taken from the remove
    // action, which encrypts exactly that).
    let enc = |u: Uuid| ops.build_remove_member_action(Aci::from(u)).map(|a| a.deleted_user_id).map_err(|e| e.to_string());

    let mut actions = Actions { version: current_revision + 1, ..Default::default() };
    match change {
        Change::Title(t) => {
            actions.modify_title = Some(ModifyTitleAction { title: ops.encrypt_title(t.trim(), &mut rng) });
        }
        Change::Remove(u) => {
            actions.delete_members.push(ops.build_remove_member_action(Aci::from(u)).map_err(|e| e.to_string())?);
        }
        Change::Admin(u, admin) => {
            let role = if admin { Role::Administrator } else { Role::Default };
            actions.modify_member_roles.push(ModifyMemberRoleAction { user_id: enc(u)?, role: role.into() });
        }
        Change::Invite(people) => {
            for u in people {
                actions.add_members_pending_profile_key.push(
                    ops.build_add_pending_member_action(ServiceId::Aci(Aci::from(u)), me, Role::Default).map_err(|e| e.to_string())?,
                );
            }
        }
    }

    let auth = groups.get_authorization_for_today(&mut rng, secret).await.map_err(|e| e.to_string())?;
    let resp = identified
        .request(http_patch(), Endpoint::storage("/v1/groups/"), HttpAuthOverride::Identified(auth))
        .map_err(|e| e.to_string())?
        .header("Content-Type", "application/x-protobuf")
        .body(actions.encode_to_vec())
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let status = resp.status();
    let body = resp.bytes().await.map_err(|e| e.to_string())?;
    if !status.is_success() {
        return Err(match status.as_u16() {
            403 => "not allowed (only admins can do this in this group)".into(),
            409 => "the group changed meanwhile, try again".into(),
            _ => format!("group change refused ({status})"),
        });
    }
    // The answer is the signed change (or, from newer servers, wrapped with endorsements).
    let signed = match GroupChangeResponse::decode(body.as_ref()) {
        Ok(r) if r.group_change.as_ref().is_some_and(|c| !c.actions.is_empty()) => r.group_change.unwrap(),
        _ => GroupChange::decode(body.as_ref()).map_err(|e| e.to_string())?,
    };

    // The local copy follows the server.
    let encrypted = groups.fetch_encrypted_group(&mut rng, &master_key).await.map_err(|e| e.to_string())?;
    let group = decrypt_group(&master_key, encrypted).map_err(|e| e.to_string())?;
    let revision = group.version;
    m.store().save_group(master_key, group).await.map_err(|e| e.to_string())?;
    Ok((revision, signed.encode_to_vec()))
}

fn http_patch() -> http::Method {
    http::Method::PATCH
}
