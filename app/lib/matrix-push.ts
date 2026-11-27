// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { utf8Decode, utf8Encode } from './crypto';
import { t } from './i18n';
import { call, type MatrixState } from './matrix';
import { netHttp, type Http } from './net-http';
import { createQueue, deleteQueue, fromHex, sameRelay, toHex, type Relay } from './relay';
import { editionName } from './edition';

// A closed space says a message came on its Matrix account (docs/matrix.md), when asked to on the
// Matrix screen: off until then. The space's relay is its Matrix push gateway (crates/erevos-relay
// matrix_push.rs). The space makes a queue there of its own for this, and sets a pusher on its
// homeserver whose push key is that queue's sender id, at the relay's /_matrix/push/v1/notify, in
// the format event_id_only: for each message the homeserver would tell of, it posts the room's and
// the event's ids and how many are not read, never what was written or by whom, and the relay
// counts one message in the queue's news and keeps nothing. While the space is closed and another
// is open, its door asks of that queue as of its contacts' (lib/closed-notices.ts doorOf), and says
// "New message". It cannot say which chat, nor ring for a call: only the space's key opens what came.
// The homeserver learns the relay's address; the relay learns when messages come for that queue.

/** The pusher's app id, the same for every account: the push key tells them apart. */
export const MATRIX_PUSH_APP = 'app.erevos';
/** Where a push gateway is asked, as the Matrix spec fixes it. */
export const NOTIFY_PATH = '/_matrix/push/v1/notify';

/** The queue a space's Matrix account is pushed to: at its relay, by its ids in hex. */
export type MatrixPush = { url: string; recipientHex: string; senderHex: string };

/**
 * The gateway of the relay at `url`: its host over https:// (http:// for a relay at a ws:// address,
 * as on a home network, which a homeserver on the internet cannot reach), at NOTIFY_PATH, as
 * homeservers take only that path. Null for an address that is neither.
 */
export function gatewayOf(url: string): string | null {
  const found = /^(wss?):\/\/([^/?#\s]+)/i.exec(url.trim());
  if (!found) return null;
  return `${found[1].toLowerCase() === 'wss' ? 'https' : 'http'}://${found[2].toLowerCase()}${NOTIFY_PATH}`;
}

let http: Http = netHttp;

/** For the checks: how the gateway is reached; null for the usual way. */
export function setMatrixPushHttp(next: Http | null): void {
  http = next ?? netHttp;
}

/**
 * Whether the relay's gateway takes pushes for the queue `senderHex` names: asked with a notification
 * of a count alone, which wakes nothing. False when it says the queue is gone, or answers as no
 * gateway (a relay from before, or a proxy in front that does not pass the path on). Throws when it
 * cannot be reached.
 */
export async function gatewayKnows(gateway: string, senderHex: string): Promise<boolean> {
  const asked = { notification: { counts: { unread: 0 }, devices: [{ app_id: MATRIX_PUSH_APP, pushkey: senderHex }] } };
  const answer = await http('POST', gateway, { 'Content-Type': 'application/json' }, utf8Encode(JSON.stringify(asked)));
  if (answer.status !== 200) return false;
  try {
    const rejected = (JSON.parse(utf8Decode(answer.bytes)) as { rejected?: unknown }).rejected;
    return Array.isArray(rejected) && !rejected.includes(senderHex);
  } catch {
    return false;
  }
}

// The pusher for `push`, or the one that takes it off with no gateway. Its language says nothing of
// the phone's: with event_id_only the homeserver writes no words.
function pusher(push: MatrixPush, gateway: string | null): Record<string, unknown> {
  return gateway
    ? {
        kind: 'http',
        app_id: MATRIX_PUSH_APP,
        pushkey: push.senderHex,
        app_display_name: editionName(),
        device_display_name: editionName(),
        lang: 'en',
        data: { url: gateway, format: 'event_id_only' },
        append: false,
      }
    : // Taken off: a kind of null removes the pusher.
      { kind: null, app_id: MATRIX_PUSH_APP, pushkey: push.senderHex };
}

/**
 * Makes the space's queue for pushes at `relay` (its own relay, with its token), checks that the
 * relay takes pushes for it, and sets the pusher on the homeserver. Nothing is left behind when a
 * step fails.
 */
export async function startMatrixPush(state: MatrixState, relay: Relay): Promise<MatrixPush> {
  const gateway = gatewayOf(relay.url);
  if (!gateway) throw new Error(t('This space has no queue at a server yet: it can say nothing while closed.'));
  const ids = await createQueue(relay);
  const push: MatrixPush = { url: relay.url, recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  try {
    // The relay answered for the queue a moment ago: one that cannot be asked here does not take pushes.
    if (!(await gatewayKnows(gateway, push.senderHex).catch(() => false))) throw new Error(t('Your server does not take Matrix notices yet: it needs updating.'));
    await call(state, 'POST', '/pushers/set', pusher(push, gateway));
  } catch (error) {
    await deleteQueue(relay, ids.recipientId).catch(() => undefined);
    throw error;
  }
  return push;
}

/** Takes the pusher off the homeserver and, with `relay` (the push's own, with its token), deletes the queue. Either may fail unseen. */
export async function stopMatrixPush(state: MatrixState, push: MatrixPush, relay?: Relay): Promise<void> {
  await call(state, 'POST', '/pushers/set', pusher(push, null)).catch(() => undefined);
  if (relay && sameRelay(relay.url, push.url)) await deleteQueue(relay, fromHex(push.recipientHex)).catch(() => undefined);
}

/** Whether the homeserver still has the pusher, at the push's gateway: one rejected by the gateway is gone. */
export async function pusherKept(state: MatrixState, push: MatrixPush): Promise<boolean> {
  const answer = (await call(state, 'GET', '/pushers')) as { pushers?: { app_id?: unknown; pushkey?: unknown; data?: { url?: unknown } }[] };
  const gateway = gatewayOf(push.url);
  return (answer.pushers ?? []).some((p) => p.app_id === MATRIX_PUSH_APP && p.pushkey === push.senderHex && p.data?.url === gateway);
}

/**
 * The push as it should be now that the space reads at `relay`: the same while its relay is, the
 * gateway knows its queue and the homeserver has its pusher; the pusher set again when only that
 * went; a new queue and pusher when the space moved to another relay or the queue is gone, the old
 * pusher taken off.
 */
export async function keepMatrixPush(state: MatrixState, push: MatrixPush, relay: Relay): Promise<MatrixPush> {
  const gateway = gatewayOf(push.url);
  if (gateway && sameRelay(push.url, relay.url) && (await gatewayKnows(gateway, push.senderHex))) {
    if (!(await pusherKept(state, push))) await call(state, 'POST', '/pushers/set', pusher(push, gateway));
    return push;
  }
  const next = await startMatrixPush(state, relay);
  await stopMatrixPush(state, push, relay);
  return next;
}
