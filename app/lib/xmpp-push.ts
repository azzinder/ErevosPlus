// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { t } from './i18n';
import { createQueue, deleteQueue, fromHex, isQueueNotFound, NO_NEWS, sameRelay, toHex, waitForNews, xmppPushName, type Relay } from './relay';
import type { XmppConnection, XmppState } from './xmpp';
import { child, children, el } from './xmpp-xml';

// A closed space says a message came on its XMPP account (docs/xmpp.md), when asked to on the XMPP
// screen: off until then. As for Matrix (lib/matrix-push.ts), the space's relay stands in for a push
// service: it is the account's push app server (XEP-0357, crates/erevos-relay xmpp_push.rs). The
// space makes a queue there of its own for this, and asks its XMPP server to push to the relay's
// name with that queue's sender id as the node. While no app of the account is online (the space is
// closed, and no other app of it is on), the server publishes to the node for each message, and the
// relay counts one message in the queue's news and keeps nothing. While the space is closed and
// another is open, its door asks of that queue (lib/closed-notices.ts doorOf), and says "New
// message". It cannot say which chat, nor ring for a call. No form is sent with it, so a server
// that would put the sender or the words in a push (as Prosody does when told to) is asked for
// nothing more than it sends anyway; the relay reads past it. The server learns the relay's name;
// the relay learns when messages come for that queue.

const NS_PUSH = 'urn:xmpp:push:0';
const NS_DISCO_INFO = 'http://jabber.org/protocol/disco#info';

/** The queue a space's XMPP account is pushed to: at its relay, by its ids in hex, and the name the relay takes pushes as. */
export type XmppPushTo = { url: string; recipientHex: string; senderHex: string; jid: string };

/** Whether the account's server pushes (XEP-0357): its own address says so in its features. */
export async function serverPushes(state: XmppState, connection: XmppConnection): Promise<boolean> {
  const info = await connection.iq('get', state.jid, el('query', { xmlns: NS_DISCO_INFO }));
  return children(child(info, 'query', NS_DISCO_INFO), 'feature').some((f) => f.attrs.var === NS_PUSH);
}

const enable = (push: XmppPushTo) => el('enable', { xmlns: NS_PUSH, jid: push.jid, node: push.senderHex });
const disable = (push: XmppPushTo) => el('disable', { xmlns: NS_PUSH, jid: push.jid, node: push.senderHex });

/**
 * Makes the space's queue for pushes at `relay` (its own relay, with its token), and asks the XMPP
 * server to push there. Nothing is left behind when a step fails.
 */
export async function startXmppPush(state: XmppState, connection: XmppConnection, relay: Relay): Promise<XmppPushTo> {
  const jid = await xmppPushName(relay);
  if (!jid) throw new Error(t('Your server does not take XMPP notices yet: it needs updating.'));
  if (!(await serverPushes(state, connection).catch(() => false))) throw new Error(t('Your XMPP server does not send notices to apps that are away.'));
  const ids = await createQueue(relay);
  const push: XmppPushTo = { url: relay.url, recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId), jid };
  try {
    await connection.iq('set', undefined, enable(push));
  } catch (error) {
    await deleteQueue(relay, ids.recipientId).catch(() => undefined);
    throw error;
  }
  return push;
}

/** Asks the XMPP server to push there no more and, with `relay` (the push's own, with its token), deletes the queue. Either may fail unseen. */
export async function stopXmppPush(push: XmppPushTo, connection: XmppConnection | null, relay?: Relay): Promise<void> {
  if (connection?.isOpen) await connection.iq('set', undefined, disable(push)).catch(() => undefined);
  if (relay && sameRelay(relay.url, push.url)) await deleteQueue(relay, fromHex(push.recipientHex)).catch(() => undefined);
}

/** Whether the relay still has the push's queue: false when it says it is gone. Throws when it cannot be reached. */
async function queueKept(push: XmppPushTo, relay: Relay): Promise<boolean> {
  try {
    await waitForNews(relay, fromHex(push.recipientHex), 0, NO_NEWS);
    return true;
  } catch (error) {
    if (isQueueNotFound(error)) return false;
    throw error;
  }
}

/**
 * The push as it should be now that the space reads at `relay`, asked again of the server at each
 * session, as Conversations does (a server may have let go of it, as when the relay refused a push):
 * the same while its relay is, takes pushes under the same name, and has its queue; a new queue
 * when the space moved to another relay or the queue is gone, the old one let go of.
 */
export async function keepXmppPush(state: XmppState, connection: XmppConnection, push: XmppPushTo, relay: Relay): Promise<XmppPushTo> {
  if (sameRelay(push.url, relay.url) && (await xmppPushName(relay)) === push.jid && (await queueKept(push, relay))) {
    await connection.iq('set', undefined, enable(push));
    return push;
  }
  const next = await startXmppPush(state, connection, relay);
  await stopXmppPush(push, connection, relay);
  return next;
}
