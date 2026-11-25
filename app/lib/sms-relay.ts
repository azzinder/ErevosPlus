// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The relay side of SMS invites (lib/sms-invite.ts) for the open space's own chats, not its hidden
// ones: opening an answer to an invite sent from here, accepting the first message of someone whose
// invite was answered here, and answering the invites that came. The chat screen does this while it
// is open, the receiver (lib/receiver.ts) otherwise, with the same state (lib/sms-link.ts). Invites
// by plain SMS (lib/text-invite.ts) are made here too, answered the same way, and their invites to
// the relay taken back once they are over unused.

import { contactLink, parseContact } from './contact-code';
import { canRelaySeal, canSealOpen, relaySeal, sealPublic } from './core';
import { fromBase64, randomBytes } from './crypto';
import { BlockedContactError, fromBase64Url, randomLineName, toBase64Url, type E2E, type Where } from './e2e';
import { t } from './i18n';
import { fromHex, listInvites, makeInvite, relayKey, sendMessage, takeBackInvite, type Relay } from './relay';
import { inviteAnswer, plainNumber, sameNumber, type SmsInvite } from './sms-invite';
import { SmsLink } from './sms-link';
import { contactTarget, spaceChats } from './space-chats';
import { spaceLinkSender } from './queue-move';
import { inviteId, TEXT_INVITE_DAYS, textInviteLink, type TextInvite } from './text-invite';
import { currentSpace } from '../lock/keys';
import { loadCurrentSpaceData } from '../lock/space-data';
import { smsConversations } from './sms-chat';
import { smsMessages, smsThreads, takeSmsInvites } from '../modules/erevos-sms';

const DAY = 24 * 3600 * 1000;

let opened: { of: object; link: Promise<SmsLink> } | null = null;
// An invite that came: its number ('' by plain SMS), and whether the owner said yes to it.
type Asked = { from: string; invite: SmsInvite; name?: string; asked?: true };
// Invites that came and could not be answered yet, answered with the next look; one by plain SMS
// taken here has no number (`from` is '') and the name given there to whoever sent it.
let unanswered: Asked[] = [];
// Invites from a number this phone does not know (not a contact, never written to here): the
// sender's number of an SMS can be made up, so none is answered by itself. Each waits for the owner
// to answer it or not (`invitesToAsk`, the home screen asks). Kept in memory, the newest of each number.
let toAsk: Asked[] = [];
const ASK_MOST = 20;
const askWatchers = new Set<() => void>();

/** The numbers whose SMS invites wait for the owner's answer. */
export const invitesToAsk = (): string[] => toAsk.map((item) => item.from);

/** Called when an invite starts or stops waiting for the owner. */
export function onInvitesToAsk(listener: () => void): () => void {
  askWatchers.add(listener);
  return () => askWatchers.delete(listener);
}

/** The owner's answer to the invite from `from`: yes answers it with the next look, no drops it. */
export function answerAsked(from: string, yes: boolean): void {
  const item = toAsk.find((i) => sameNumber(i.from, from));
  toAsk = toAsk.filter((i) => i !== item);
  if (item && yes) unanswered.push({ ...item, asked: true });
  askWatchers.forEach((listener) => listener());
}

// Whether the owner knows `number`: one of the contacts, or a conversation with it where this
// phone wrote. The phone's own contacts not readable: not known.
async function knownNumber(number: string): Promise<boolean> {
  // Loaded only when asked: the contacts' module is the phone's own, not there in the checks.
  const contacts = await import('./contact-book').catch(() => null);
  if ((await contacts?.isContactNumber(number).catch(() => null)) === true) return true;
  for (const address of smsConversations(number, await smsThreads().catch(() => []))) {
    if ((await smsMessages(address).catch(() => [])).some((m) => m.mine)) return true;
  }
  return false;
}

/** The open space's SMS invite state, opened the first time it is asked for. */
export function spaceSmsLink(): Promise<SmsLink> {
  const current = currentSpace();
  if (opened?.of !== current) {
    const link = SmsLink.open(current.space, current.key);
    opened = { of: current, link };
    unanswered = [];
    link.catch(() => {
      if (opened?.link === link) opened = null;
    });
  }
  return opened.link;
}

/** Lets go of the space's SMS state when it closes. */
export function forgetSmsLink(): void {
  opened = null;
  unanswered = [];
}

/** Reads what the SMS screen changed since, as an invite it just sent. */
export async function refreshSmsLink(): Promise<void> {
  await (await spaceSmsLink()).refresh();
}

/**
 * Whether `bytes` from the relay answer an invite sent from here. If so, adds the contact from the
 * link it carries and links the number to it: their first packet goes with the next look. Returns
 * the number and the contact, or null when `bytes` are something else, or the answer of someone
 * blocked here, which is dropped (lib/e2e.ts BlockedContactError).
 */
export async function takeInviteAnswer(e2e: E2E, bytes: Uint8Array, ownSender: string, here: Where): Promise<{ number: string; identity: string; card?: true } | null> {
  const link = await spaceSmsLink();
  if (!link.waiting) return null;
  const answer = await link.openAnswer(bytes);
  const code = answer ? parseContact(answer.link) : null;
  if (!answer || !code || code.senderHex === ownSender) return null;
  let identity: string;
  let added: boolean;
  try {
    ({ identity, added } = await e2e.addContact(code, ownSender, here));
  } catch (error) {
    if (error instanceof BlockedContactError) return null;
    throw error;
  }
  // The contact card: anyone who has it may answer, so whoever did writes a message request, unless
  // it was New chat's one-time card, answered first, in front of this phone (contactCard once).
  if (answer.card) {
    if (added && !answer.once) await e2e.asRequest(identity);
    return { number: '', identity, card: true };
  }
  await e2e.linkPhone(identity, plainNumber(answer.number));
  // An invite by plain SMS went to one of the phone's contacts: the new contact takes their name.
  if (answer.name && !e2e.contacts().find((c) => c.identity === identity)?.ownName) await e2e.rename(identity, answer.name).catch(() => undefined);
  return { number: answer.number, identity };
}

/** After someone new's first message: if this chat answered their SMS invite, they are a contact
 *  without a request, their number is theirs (none for an invite by plain SMS), and they take the
 *  name given them when it was taken, unless they have one. Returns the number ('' for none) and
 *  the contact's name now, or null. */
export async function linkInviter(e2e: E2E, identity: string): Promise<{ number: string; name: string } | null> {
  const sender = e2e.contacts().find((c) => c.identity === identity)?.sender ?? '';
  const got = sender ? (await spaceSmsLink()).answeredFor(sender) : null;
  if (!got) return null;
  await e2e.acceptRequest(identity);
  if (got.number) await e2e.linkPhone(identity, got.number);
  if (got.name && !e2e.contacts().find((c) => c.identity === identity)?.ownName) await e2e.rename(identity, got.name).catch(() => undefined);
  return { number: got.number, name: e2e.contacts().find((c) => c.identity === identity)?.name ?? '' };
}

/**
 * Of the invites kept for the next look, those answered now and those that wait: with SMS invites
 * turned off (`bySms` false) only what the owner took here themselves, a contact QR code or an
 * invite link, which has no number; what came by SMS waits until they are turned on again.
 */
export function invitesDue<T extends { from: string }>(kept: readonly T[], bySms: boolean): { now: T[]; later: T[] } {
  return bySms ? { now: [...kept], later: [] } : { now: kept.filter((item) => !item.from), later: kept.filter((item) => !!item.from) };
}

/** Answers SMS invites from Erevos phones with this chat's contact link, sealed for the inviter: the queue the link names (`linkSender`, lib/queue-move.ts). */
export async function answerInvites(e2e: E2E, linkSender: string, here: Where, sends: Relay): Promise<void> {
  if (!canSealOpen()) return;
  const link = await spaceSmsLink();
  // SMS invites turned off: this phone answers none that came by SMS, so no one becomes a contact
  // from a phone number alone; what came waits and, turned on again, is answered. A contact QR code
  // or an invite link the owner took here themselves (no number) is answered all the same (#35).
  const bySms = link.invites;
  // Taken off the list at once: one added meanwhile waits for the next look.
  const { now: queued, later } = invitesDue(unanswered, bySms);
  unanswered = later;
  let invites: typeof queued;
  try {
    const pieces = bySms ? (await takeSmsInvites()).map((p) => ({ from: p.from, data: fromBase64(p.data), at: p.at })) : [];
    invites = [...queued, ...(pieces.length ? await link.collect(pieces) : [])];
  } catch (error) {
    unanswered.push(...queued);
    throw error;
  }
  for (const item of invites) {
    const { from, invite } = item;
    if (from && e2e.phones().some((p) => sameNumber(p.phone, from))) continue;
    // From a number not known here, and not answered yes by the owner: asked first.
    if (from && !item.asked && !(await knownNumber(from))) {
      toAsk = [...toAsk.filter((i) => !sameNumber(i.from, from)), item].slice(-ASK_MOST);
      askWatchers.forEach((listener) => listener());
      continue;
    }
    try {
      const own = contactLink({ senderHex: linkSender, relayUrl: here.relay, key: toBase64Url(e2e.bundle), relayKey: here.relayKey || undefined });
      const sealed = await relaySeal(invite.key, fromHex(linkSender), inviteAnswer(own));
      // This chat's contact link, which their phone adds: no message (lib/relay.ts, Mark).
      await sendMessage(contactTarget(sends, invite), fromHex(invite.sender), sealed, 'quiet');
      await link.answered(from, invite.sender, item.name ?? '');
    } catch {
      unanswered.push(item);
    }
  }
}

/** Answers an invite by plain SMS taken here, with the next look: by then this phone has joined its
 *  relay, if it does. `name`: what this phone calls whoever sent it. */
export function answerTextInvite(invite: TextInvite, name: string): void {
  // Opened first: opening it for the space anew starts the list afresh.
  void spaceSmsLink().catch(() => undefined);
  unanswered.push({ from: '', invite: { sender: invite.sender, key: invite.key, relay: invite.relay, relayKey: invite.relayKey }, name: name.trim() });
}

/**
 * An invite by plain SMS to `number`, a contact of the phone's named `name`, for its link: with an
 * invite to this phone's relay, so their phone joins it, and what its answer is sealed to. Throws
 * when this phone has no relay of its own to invite to, or its relay lets it invite no one.
 */
export async function makeTextInvite(number: string, name: string): Promise<string> {
  return textInviteLink((await shortInvite(number, name, TEXT_INVITE_DAYS)).invite);
}

/**
 * This chat's contact card: its contact link in short (lib/text-invite.ts, flag 4), a QR code any
 * camera reads and a link that fits an SMS. It holds where to answer (the queue the contact link
 * names), a key to seal the answer to, the relay and the name this phone gives itself, never the
 * keys: whoever takes it answers with their own contact link, this phone adds them (a message
 * request, unless `once`: New chat's one-time card, the same for one opening (its `secret`), which makes the first to answer it a contact
 * at once, and no one after, SmsLink.onceSecret) and writes first, so they get its keys from the
 * conversation. Null with no relay queue yet, or a core that cannot seal: then the long link is the one.
 */
export async function contactCard(name: string, once: false | { secret: string } = false): Promise<string | null> {
  if (!canRelaySeal()) return null;
  const data = await loadCurrentSpaceData();
  if (!data.url || !data.ownQueue) return null;
  const relay: Relay = { url: data.url, token: data.token || undefined };
  const bytes = await relayKey(relay).catch(() => null);
  const link = await spaceSmsLink();
  let secret: Uint8Array;
  if (once) {
    // The same card for the whole of one opening of New chat (`once.secret`, '' at first).
    secret = await link.onceSecret(once.secret);
    once.secret = toBase64Url(secret);
  } else secret = await link.cardSecret();
  return textInviteLink({
    sender: await spaceLinkSender(data.ownQueue),
    key: await sealPublic(secret),
    code: '',
    relay: data.url,
    relayKey: bytes ? toBase64Url(bytes) : '',
    name: name.trim(),
    expires: 0,
    card: true,
  });
}

/** How long an invite shown as a QR code or shared as a link lasts (Invite someone). */
export const QR_INVITE_DAYS = 7;

/** An invite made here as a short link (lib/text-invite.ts): the link's fields, `secret` to name
 *  it later (nameShortInvite) or see whether it still waits, and `line`, its invite to the relay's name there. */
export type ShortInvite = { invite: TextInvite; secret: string; line: string };

/**
 * Invite someone, as a QR code or a link small enough for any camera, and for an SMS: the same
 * invite as one by plain SMS, with no number, for QR_INVITE_DAYS. Its answer adds whoever took it
 * as a contact, named `name` (which may come later, nameShortInvite). Throws as makeTextInvite does,
 * and then the long invite (lib/welcome.ts) is what is left.
 */
export function makeShortInvite(name: string): Promise<ShortInvite> {
  return shortInvite('', name, QR_INVITE_DAYS);
}

/**
 * The newest invite made here as a QR code or a link that no one took yet and that lasts a day more
 * at least, as makeShortInvite made it: shown again rather than another made, as the relay keeps
 * only 5 waiting for each phone and 10 made a day. Null when there is none, or a phone took it.
 */
export async function waitingShortInvite(now = Date.now()): Promise<ShortInvite | null> {
  if (!canRelaySeal()) return null;
  const data = await loadCurrentSpaceData();
  if (!data.url || !data.ownQueue) return null;
  const link = await spaceSmsLink();
  const sent = link.waitingShortInvite(now - (QR_INVITE_DAYS - 1) * DAY);
  if (!sent?.code) return null;
  const relay: Relay = { url: data.url, token: data.token || undefined };
  // Taken by a phone already, though not answered yet: another is made.
  if (relay.token) {
    const listed = await listInvites(relay).catch(() => null);
    const it = listed?.find((l) => l.id === inviteId(sent.code!));
    if (!it || it.used > 0) return null;
  }
  const bytes = await relayKey(relay).catch(() => null);
  const chats = await spaceChats().catch(() => null);
  const secret = fromBase64Url(sent.secret);
  return {
    invite: {
      sender: await spaceLinkSender(data.ownQueue),
      key: await sealPublic(secret),
      code: sent.code,
      relay: data.url,
      relayKey: bytes ? toBase64Url(bytes) : '',
      name: chats?.e2e.invitedAs() ?? '',
      expires: sent.at + QR_INVITE_DAYS * DAY,
    },
    secret: sent.secret,
    line: '',
  };
}

/** Names whom a short invite made here is for: the name its contact takes once it answers. */
export async function nameShortInvite(secret: string, name: string): Promise<void> {
  await (await spaceSmsLink()).nameTextInvite(secret, name);
}

/** Whether a short invite made here still waits for its answer. */
export async function shortInviteWaits(secret: string): Promise<boolean> {
  return (await spaceSmsLink()).textInviteWaits(secret);
}

/**
 * Takes back a short invite made here that no phone used yet: from the relay, so its link lets no
 * one in any more, and forgotten here. False when a phone has used it already: that one may still
 * answer, and is left to.
 */
export async function takeBackShortInvite(short: ShortInvite): Promise<boolean> {
  const data = await loadCurrentSpaceData();
  if (!data.url) return false;
  const relay: Relay = { url: data.url, token: data.token || undefined };
  const id = inviteId(short.invite.code);
  const listed = await listInvites(relay);
  const it = listed?.find((l) => l.id === id);
  if (it && it.used > 0) return false;
  if (it) await takeBackInvite(relay, id);
  await (await spaceSmsLink()).settleTextInvite(short.secret, true);
  return true;
}

async function shortInvite(number: string, name: string, days: number): Promise<ShortInvite> {
  const data = await loadCurrentSpaceData();
  if (!data.url || !data.ownQueue) throw new Error(t('An invite by SMS needs a relay: your phone has none yet.'));
  const relay: Relay = { url: data.url, token: data.token || undefined };
  // The relay has a name of random letters for them, never their number; the name stays here (lib/e2e.ts lineFor).
  const chats = await spaceChats().catch(() => null);
  const line = chats ? await chats.e2e.lineFor(name.trim() || (number ? plainNumber(number) : '')) : randomLineName();
  const access = relay.token ? await makeInvite(relay, line) : null;
  if (!access) {
    throw new Error(t('Your relay does not let this phone invite anyone, so an invite by SMS could not let them in. Invite them with a QR code instead, from New chat.'));
  }
  let key = '';
  if (canRelaySeal()) {
    const bytes = await relayKey(relay).catch(() => null);
    if (bytes) key = toBase64Url(bytes);
  }
  const secret = randomBytes(32);
  const as = chats?.e2e.invitedAs() ?? '';
  const invite: TextInvite = {
    // Its answer comes to the queue the contact link names (lib/queue-move.ts), as an SMS invite's.
    sender: await spaceLinkSender(data.ownQueue),
    key: await sealPublic(secret),
    code: access.code,
    relay: data.url,
    relayKey: key,
    name: as,
    expires: Math.min(Date.now() + days * DAY, access.expires),
  };
  await (await spaceSmsLink()).textInvited(number, secret, access.code, name, days);
  return { invite, secret: toBase64Url(secret), line };
}

/**
 * The invites by plain SMS sent from here that are over: one whose invite to the relay no phone
 * used is taken back from the relay at `own`, with this phone's token, and forgotten; for one used,
 * only the invite to the relay is forgotten, as its phone may still answer. Asks the relay only
 * when one is over.
 */
export async function expireTextInvites(own: Relay, now = Date.now()): Promise<void> {
  const link = await spaceSmsLink();
  const due = link.textInvitesDue(now - TEXT_INVITE_DAYS * DAY);
  if (due.length === 0) return;
  const listed = await listInvites(own);
  for (const sent of due) {
    const id = inviteId(sent.code!);
    const it = listed?.find((l) => l.id === id);
    if (it && it.used === 0) await takeBackInvite(own, id);
    // Listed by no relay that lets this phone invite, the relay forgot it, or it was taken back by hand.
    await link.settleTextInvite(sent.secret, !it || it.used === 0);
  }
}
