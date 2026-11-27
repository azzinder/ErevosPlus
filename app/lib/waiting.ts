// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { Spare, Undropped } from '../lock/e2e-data';
import { newTag, WAITING, type History, type Message, type Parts, type Resend } from '../lock/history';
import { loadClip, saveClip } from '../lock/voice-clips';
import { refSource, uploadFile } from './attachments';
import { offerOnNostr } from './nostr-send-files';
import { contentOf, withoutPreview } from './chat-parts';
import { pieceToGo, pieceWent } from './pieces-kept';
import type { E2E, Where } from './e2e';
import { nearby, NoWayError, TooLargeForSlowWayError, type NearHeard } from './nearby';
import { toBase64, fromBase64 } from './crypto';
import { canHoldAt, canTryLater, CannotHoldError, dropLater, fromHex, isQueueFull, RelayError, sameRelay, sendMessage, sendMessageLater, type HeldAt, type Mark, type Relay } from './relay';
import { circuitOf } from './tor-chats';
import { nostrOnlyWay, orNostr, type ForNostr } from './nostr-chats';
import { nostrReady } from './nostr';
import { carriedFor, contactTarget, sealedTarget, sendSealed, sentMark, type SpaceChats } from './space-chats';
import { t } from './i18n';
import { inTurn, needsRearm, ownerLooks, safetyDue, safetyStopped } from './safety';

type Chats = Pick<SpaceChats, 'e2e' | 'history'>;

// Our messages that wait (lock/history.ts, marked WAITING): nothing could take them when they were
// sent, as the relay could not be reached and the contact's phone was not near, or LoRa was the
// only way and they are not text. They stay in the chat, marked, and go by themselves, oldest
// first and each contact's in order, once the relay or the contact's phone nearby can take them:
// with each look at the relay that answers (the chat screen's, or the receiver's beside the
// screens), and when a contact is heard nearby. A waiting text goes over LoRa too, once a radio
// is linked, and by SMS with a try, when that is on for the contact (lib/sms-way.ts); one too much
// for LoRa or SMS with its link's preview goes there without the preview. Each
// keeps its tag, so it can still be deleted on both phones once it went. What a chat screen showed
// as sending and had not sent yet when it closed, its chats still opening, waits the same way
// (keepUnsent), rather than go with the screen.
//
// Each try seals the message anew, which moves the conversation on, and a contact's phone can skip
// only so many it never got. So a message is tried only when there is a way for it, and after a
// failed try it waits longer each time before the next.
//
// A message sent for later waits the same way, kept with the time it should go as its time, and
// holds back none of that contact's others meanwhile. With the first look at a relay that answers,
// it is sealed and handed to that relay to hold till its time (holdLater): from then on it waits
// there, not here, and goes then though this phone is off. It says when it should show, so their
// phone does not show it sooner. Only while no relay can hold it (none answers, or one from before
// relays held messages) does it wait here, to go with the first look once its time came.
//
// A held message goes to the queue the contact read on when it was held. Should their queue move
// before its time (lib/queue-move.ts), the next look holds it anew for where they read now and
// takes back the one held before (holdAgain), in hidden chats too. Deleting or blocking a contact
// takes back what is held for them (heldFor, dropHeld): what the relay cannot be asked to drop now
// is kept with their removal and asked again with each look. Both go by the messages kept, not by
// what a screen shows.
//
// Hidden chats go through the relay (handOverHidden, SendPlace.hidden), never over LoRa or by SMS,
// nor carried by phones nearby, or, with no relay between the two, through Nostr when the contact
// reads there, as the space's chats do. To a contact heard nearby by the place itself (SendPlace.near,
// lib/place-nearby.ts) they go on that link too, and otherwise to the phones linked nearby, as the
// space's do (lib/nearby.ts deliver): what waits there goes with a look at their relay that answers, or with a look
// at Nostr, while they are open or, when they receive while closed, with the place's
// (lib/place-receiver.ts). But what the relay could not
// take for a contact's account as their queue is full goes to the endpoints of their account all
// the same, as from the space's chats: then it shows as sent, and is owed to their account (Owed),
// tried again in memory only while hidden chats stay open, each contact's in order and longer after
// each failed try, sealed anew with its tag each time, so it is the same message there and no
// endpoint of theirs is copied it again. Closed before it went, their phone never gets it.
//
// Whatever waits is something someone reads (a text, a voice message, a photo or file), so each
// goes to the relay as a message (lib/relay.ts, Mark), however many tries it took: sealed anew each
// time, it says so again. A message held for later says so when it goes. From a linked device what
// is sealed for the account's phone goes quiet, to it, and it says so as it passes it on
// (lib/space-chats.ts, sentMark); what the device writes to a contact itself says so to them.

const CONTACT_PREFIX = 'contact:';
// The first wait after a failed try, and the longest, milliseconds.
const FIRST_WAIT = 30_000;
const LONGEST_WAIT = 30 * 60_000;

/** Whether what failed failed only because nothing could take it now, so it can wait and go later. */
export function canWait(error: unknown): boolean {
  return error instanceof NoWayError || error instanceof TooLargeForSlowWayError || canTryLater(error);
}

/**
 * What a chat screen showed as Sending… and had not sent yet when it closed, as its chats were
 * still opening: words with what they carry (`parts`), or a voice message's sound. `at`: when Send
 * was pressed; `lasts`: seconds once read, 0 for the chat's own time.
 */
export type Unsent = { peer: string; at: number; lasts: number; parts: Parts } & ({ text: string; quiet: boolean } | { audio: Uint8Array; ms: number });

/**
 * Keeps in `history`, marked waiting, what a chat screen that closed had not sent yet (Unsent), so
 * it is not lost with the screen: it goes by itself as the others that wait do (sendWaiting), each
 * with a tag of its own. Says how many it kept.
 */
export async function keepUnsent(history: Pick<History, 'add'>, unsent: Unsent[]): Promise<number> {
  let kept = 0;
  for (const one of unsent) {
    const message: Omit<Message, 'text'> = { ...one.parts, peer: one.peer, mine: true, at: one.at, tag: newTag(), lasts: one.lasts, mark: WAITING };
    try {
      if ('audio' in one) await history.add({ ...message, text: '', voice: await saveClip(one.audio, one.ms) });
      else await history.add({ ...message, text: one.text, quiet: one.quiet });
      kept++;
    } catch {
      // Not kept: gone with the screen, as it would have been.
    }
  }
  return kept;
}

/**
 * Where the space's messages go from, as the chat screen or the receiver knows it: the relay that
 * sends (null without one), our own relay, for photos and files (null without one), our queue's
 * sender id, where contacts reach us, our relay's key (base64url, or empty), and whether the relay
 * answered just now. `hidden`: hidden chats', which go through the relay, never carried nor over
 * LoRa or SMS; `near`: where their contacts were heard nearby (lib/place-nearby.ts).
 */
export type SendPlace = { sends: Relay | null; own: Relay | null; senderHex: string; here: Where; ownKey: string; relayUp: boolean; hidden?: boolean; near?: NearHeard | null };

/**
 * A message that waited and went: its chat, its tag, how long it lasts once read (seconds), and,
 * sent for later, the relay that holds it till its time. `bare`: it went over LoRa without its
 * link's preview.
 */
export type Went = { peer: string; tag: string; lasts: number; held?: HeldAt; heldFor?: string; bare?: true; at?: number };

// Failed tries so far, by tag, and when the next may be.
const tries = new Map<string, { count: number; next: number }>();
// What sendWaiting is doing for each chats' history: the space's, and each hidden place's that receives.
const sending = new WeakMap<object, Promise<Went[]>>();
// What holdAgain is doing for each chats' history.
const holding = new WeakMap<object, Promise<Went[]>>();

/**
 * Sends what waits in the space's chats that can go now, oldest first; a contact's next ones wait
 * while one of theirs cannot go. Marks each that went as the relay took it. Returns those.
 */
export function sendWaiting(chats: Chats, place: SendPlace, now = Date.now()): Promise<Went[]> {
  let run = sending.get(chats.history);
  if (!run) {
    run = sendAll(chats, place, now).finally(() => sending.delete(chats.history));
    sending.set(chats.history, run);
  }
  return run;
}

async function sendAll({ e2e, history }: Chats, place: SendPlace, now: number): Promise<Went[]> {
  const went: Went[] = [];
  if (place.relayUp && place.sends) {
    went.push(...(await holdAgain({ e2e, history }, place, now)));
    if (ownerLooks()) went.push(...(await rearmSafety({ e2e, history }, place, now)));
    await dropHeld(e2e, place.sends, now);
  }
  // Safety messages no relay holds yet are put off too, as the owner looks (lib/safety.ts).
  if (ownerLooks()) {
    for (const message of history.waiting()) {
      if (message.safety && needsRearm(Math.max(message.at, now + 1), message.safety, now)) await history.putOff(message.peer, message.tag, safetyDue(message.safety, now)).catch(() => false);
    }
  }
  const stuck = new Set<string>();
  for (const message of history.waiting()) {
    const { peer, tag } = message;
    if (stuck.has(peer) || !peer.startsWith(CONTACT_PREFIX)) continue;
    const identity = peer.slice(CONTACT_PREFIX.length);
    const tried = tries.get(tag);
    if (message.at > now) {
      if ((tried && tried.next > now) || !place.relayUp || !place.sends) continue;
      try {
        const { lasts, held, heldFor, resend } = await holdLater(e2e, place, identity, message);
        tries.delete(tag);
        if (await history.sent(peer, tag, lasts, { held, heldFor, resend })) went.push({ peer, tag, lasts, held, heldFor });
      } catch {
        const count = (tried?.count ?? 0) + 1;
        tries.set(tag, { count, next: now + Math.min(LONGEST_WAIT, FIRST_WAIT * 2 ** (count - 1)) });
      }
      continue;
    }
    if ((tried && tried.next > now) || !canGo(e2e, place, identity, message)) {
      stuck.add(peer);
      continue;
    }
    try {
      const { lasts, bare } = await sendOne(e2e, place, identity, message);
      tries.delete(tag);
      await pieceWent(e2e, tag).catch(() => undefined);
      if (await history.sent(peer, tag, lasts, { bare })) went.push({ peer, tag, lasts, ...(bare ? { bare: true as const } : {}) });
    } catch (error) {
      const count = (tried?.count ?? 0) + 1;
      tries.set(tag, { count, next: now + Math.min(LONGEST_WAIT, FIRST_WAIT * 2 ** (count - 1)) });
      // Nothing could take it now: the ones after it wait too, so they go in their order. One that
      // failed of itself (its sound gone, say) holds none of the others back.
      if (canWait(error)) stuck.add(peer);
    }
  }
  return went;
}

/** When the next message sent for later and waiting here should go, or 0 if none waits for its time. */
export function nextDue(history: Pick<Chats['history'], 'waiting'>, now = Date.now()): number {
  return history.waiting().reduce((next, m) => (m.at > now && (next === 0 || m.at < next) ? m.at : next), 0);
}

/**
 * Seals a message sent for later, with when it should show, and hands it to the relay that would
 * take it now, to hold till its time (lib/relay.ts, sendMessageLater). A photo or file goes to our
 * relay first, kept there till a while after that time. The conversation's first packet, if the
 * relay has not taken it yet, goes now. Says how long it lasts once read, where it is held, and for
 * which of the contact's queues (their sender id), to hold it anew should they read elsewhere
 * before it goes. Throws when no relay answers or can hold it (CannotHoldError): it can wait here
 * instead.
 *
 * It does not say where we are (our queue, our relay): when it comes, that may have changed since,
 * and their phone goes on writing where we last said.
 */
export async function holdLater(e2e: E2E, place: SendPlace, identity: string, message: Message): Promise<{ lasts: number; held: HeldAt; heldFor: string; resend?: Resend }> {
  const queue = e2e.queueOf(identity);
  const sends = place.sends;
  if (!sends || !queue?.sender) throw new NoWayError();
  const to = contactTarget(sends, queue);
  if (!(await canHoldAt(to.via ?? to))) throw new CannotHoldError(t('the server at {url} cannot keep messages for later: update it', { url: (to.via ?? to).url }));
  const options = { tag: message.tag, lasts: message.lasts ?? 0, due: message.at, re: message.re, forwarded: message.forwarded };
  let sealed: { sender: string; relay: string; relayKey: string; spare: Spare | null; first: Uint8Array | null; timer: number; copies: number; through: boolean };
  let packets: Uint8Array[];
  if (message.voice) {
    const audio = await loadClip(message.voice);
    if (!audio) throw new Error(t("This voice message's sound is gone."));
    const voice = await e2e.sealVoice(identity, audio, message.voice.ms, '', options);
    sealed = voice;
    packets = voice.packets;
  } else if (message.file) {
    if (!place.own) throw new NoWayError();
    // A chat that goes only through Tor sends its files on its own circuits too.
    const offer = await uploadFile(e2e.torChat(identity) ? { ...place.own, torChat: circuitOf(identity) } : place.own, message.file, undefined, message.at);
    const file = await e2e.sealFile(identity, offer, '', options);
    sealed = file;
    packets = [file.packet];
  } else {
    const text = await e2e.seal(identity, message.text, '', { ...options, quiet: message.quiet, more: contentOf(message) });
    sealed = text;
    packets = [text.packet];
  }
  // A chat's that goes only through Tor waits there on its own circuits (sealedTarget), on a linked device too.
  const target = sealedTarget(sends, sealed);
  const held = await e2e.copiesAfter(
    sealed.copies,
    (async () => {
      if (sealed.first) {
        await sendMessage(target, fromHex(sealed.sender), sealed.first, 'quiet');
        await e2e.firstSent(identity);
      }
      return sendMessageLater(target, fromHex(sealed.sender), packets, message.at, sentMark(sealed, 'message'));
    })(),
    true,
  );
  // A safety message keeps its packets, to be held anew as they are (rearmOne).
  const mark = sentMark(sealed, 'message');
  const resend: Resend | undefined = message.safety
    ? { s: sealed.sender, r: sealed.relay, k: sealed.relayKey, p: packets.map(toBase64), ...(mark === 'quiet' ? { m: 'quiet' as const } : {}) }
    : undefined;
  return { lasts: sealed.timer, held, heldFor: queue.sender, ...(resend ? { resend } : {}) };
}

/**
 * Takes back a message sent for later from the relay that holds it, one of `sends` (ours, the
 * second relay, or the backup): true when it now never goes, false when it went already. Throws
 * when that relay cannot be reached, or is no longer set.
 */
export async function takeBack(sends: Relay | null, held: HeldAt): Promise<boolean> {
  const holder = holderOf(sends, held);
  if (!holder) throw new RelayError(t('The server at {url} that keeps it is no longer set here.', { url: held.relay }));
  return dropLater({ url: holder.url, token: holder.token }, held.id);
}

// Which of `sends` holds a message held for later.
function holderOf(sends: Relay | null, held: HeldAt): Relay | undefined {
  return [sends, sends?.via, sends?.backup, sends?.backup?.via].find((relay): relay is Relay => !!relay && sameRelay(relay.url, held.relay));
}

/** What a relay holds for later for a contact (`identity`) that has not gone yet, by the messages kept: to drop when they are deleted or blocked (E2E.deleteContact). */
export function heldFor(history: Pick<History, 'heldLater'>, identity: string, now = Date.now()): Undropped[] {
  const peer = `${CONTACT_PREFIX}${identity}`;
  return history.heldLater(now).flatMap((m) => (m.peer === peer && m.held ? [{ id: m.held.id, relay: m.held.relay, at: m.at }] : []));
}

/**
 * Asks the relay that holds each of ours for later for those deleted or blocked here
 * (E2E.undropped), one of `sends`, to drop it. Each is forgotten once dropped or gone already, when
 * no relay set here holds it, or once its time is past; while the relay cannot be reached it is
 * asked again with the next look.
 */
export async function dropHeld(e2e: E2E, sends: Relay | null, now = Date.now()): Promise<void> {
  const done: string[] = [];
  for (const held of e2e.undropped()) {
    if (held.at <= now || !holderOf(sends, held)) {
      done.push(held.id);
      continue;
    }
    try {
      await takeBack(sends, held);
      done.push(held.id);
    } catch {
      // Asked again with the next look.
    }
  }
  if (done.length > 0) await e2e.dropped(done, now).catch(() => undefined);
}

/**
 * Ours a relay holds for later for a contact who reads elsewhere now, as their queue moved
 * (lib/queue-move.ts): each is held anew for where they read now, and the one held before is
 * taken back, so it does not go to a queue that may be gone by its time. Should that one go all
 * the same, their phone keeps the message once, by its tag. One held before the queue it was held
 * for was kept is let be. Returns those held anew; one that cannot be now is tried again with a
 * later look, longer after each failed try, as each try seals it anew. One already under way for
 * these chats is joined, not run again beside it, so no message is held anew twice. What the relay
 * cannot be asked to take back now, and what was held anew for a contact deleted meanwhile, is kept
 * to drop with a later look (dropHeld).
 */
export function holdAgain(chats: Chats, place: SendPlace, now = Date.now()): Promise<Went[]> {
  const under = holding.get(chats.history);
  if (under) return under;
  const run = holdAll(chats, place, now).finally(() => holding.delete(chats.history));
  holding.set(chats.history, run);
  return run;
}

async function holdAll({ e2e, history }: Chats, place: SendPlace, now: number): Promise<Went[]> {
  const again: Went[] = [];
  for (const message of history.heldLater(now)) {
    const { peer, tag, held, heldFor } = message;
    if (!held || !heldFor || !peer.startsWith(CONTACT_PREFIX)) continue;
    const identity = peer.slice(CONTACT_PREFIX.length);
    const sender = e2e.queueOf(identity)?.sender;
    if (!sender || sender === heldFor) continue;
    const tried = tries.get(tag);
    if (tried && tried.next > now) continue;
    let made: Awaited<ReturnType<typeof holdLater>>;
    try {
      made = await holdLater(e2e, place, identity, message);
    } catch {
      // Held where it was: tried again later.
      const count = (tried?.count ?? 0) + 1;
      tries.set(tag, { count, next: now + Math.min(LONGEST_WAIT, FIRST_WAIT * 2 ** (count - 1)) });
      continue;
    }
    tries.delete(tag);
    const ofIt = (h: HeldAt): Undropped => ({ id: h.id, relay: h.relay, at: message.at });
    // The message deleted meanwhile, or not kept so: the one just held goes no more either.
    if (!(await history.heldAgain(peer, tag, made.held, made.heldFor).catch(() => false))) {
      await letGo(e2e, place.sends, [ofIt(made.held)]);
      continue;
    }
    // The contact deleted or blocked meanwhile: neither goes.
    if (!e2e.record(identity)) {
      await letGo(e2e, place.sends, [ofIt(made.held), ofIt(held)]);
      continue;
    }
    await letGo(e2e, place.sends, [ofIt(held)]);
    again.push({ peer, tag, lasts: made.lasts, held: made.held, heldFor: made.heldFor });
  }
  return again;
}

/**
 * Our safety messages (lib/safety.ts), as the owner looks at Erevos: each is held anew to go its
 * hours from `now`, and the one held before is taken back. One that cannot be held anew now keeps
 * its time, and is tried again with the next look. Returns those held anew, with their new time.
 */
export async function rearmSafety({ e2e, history }: Chats, place: SendPlace, now = Date.now()): Promise<Went[]> {
  const again: Went[] = [];
  for (const seen of history.heldLater(now)) {
    if (!seen.safety || !seen.held || !seen.peer.startsWith(CONTACT_PREFIX)) continue;
    // In turn with deleting it (app/chat.tsx), and with another look: read again once it is its turn.
    const went = await inTurn(seen.tag, async () => {
      const message = history.heldLater(now).find((m) => m.peer === seen.peer && m.tag === seen.tag);
      if (!message?.held || !message.safety || safetyStopped(message.tag) || !needsRearm(message.at, message.safety, now)) return null;
      return rearmOne(e2e, history, place, message, message.held, message.safety, now);
    });
    if (went) again.push(went);
  }
  return again;
}

async function rearmOne(e2e: E2E, history: History, place: SendPlace, message: Message, held: HeldAt, safety: number, now: number): Promise<Went | null> {
  const { peer, tag } = message;
  const identity = peer.slice(CONTACT_PREFIX.length);
  if (!e2e.record(identity)) return null;
  const at = safetyDue(safety, now);
  let made: Awaited<ReturnType<typeof holdLater>>;
  try {
    // As it was sealed, while the contact reads where it was sealed for; sealed anew only after
    // their queue moved.
    const kept = message.resend;
    if (kept && place.sends && e2e.queueOf(identity)?.sender === kept.s) {
      const target = sealedTarget(place.sends, { relay: kept.r, relayKey: kept.k, ...(e2e.torChat(identity) ? { torChat: circuitOf(identity) } : {}) });
      const again = await sendMessageLater(target, fromHex(kept.s), kept.p.map(fromBase64), at, kept.m ?? 'message');
      made = { lasts: message.lasts ?? 0, held: again, heldFor: kept.s, resend: kept };
    } else {
      made = await holdLater(e2e, place, identity, { ...message, at });
    }
  } catch {
    // It keeps its time: the next look tries again.
    return null;
  }
  const ofIt = (h: HeldAt, due: number): Undropped => ({ id: h.id, relay: h.relay, at: due });
  // Deleted meanwhile, no longer one, or held anew by another look: the one just held goes no more.
  if (!(await history.rearmed(peer, tag, at, made.held, made.heldFor, held.id, made.resend).catch(() => false))) {
    await letGo(e2e, place.sends, [ofIt(made.held, at)]);
    return null;
  }
  await letGo(e2e, place.sends, [ofIt(held, message.at)]);
  return { peer, tag, lasts: made.lasts, held: made.held, heldFor: made.heldFor, at };
}

// Takes back each of `held` from the relay of `sends` that holds it. One that relay cannot be asked
// now is kept to drop with a later look (dropHeld); one no relay set here holds is let go of.
async function letGo(e2e: E2E, sends: Relay | null, held: Undropped[]): Promise<void> {
  const left: Undropped[] = [];
  for (const h of held) {
    try {
      await takeBack(sends, h);
    } catch {
      if (holderOf(sends, h)) left.push(h);
    }
  }
  if (left.length > 0) await e2e.keepUndropped(left).catch(() => undefined);
}

/**
 * What a relay holds for later for a contact just deleted, blocked or removed here, as heldFor says,
 * once a holdAgain under way for these chats ended: what that held anew for them meanwhile is among
 * it. Those not among `kept` (kept with the removal already) are kept to drop too (dropHeld), before
 * their chat is cleared. Says those.
 */
export async function heldAfter({ e2e, history }: Chats, identity: string, kept: Undropped[], now = Date.now()): Promise<Undropped[]> {
  await holding.get(history)?.catch(() => undefined);
  const more = heldFor(history, identity, now).filter((h) => !kept.some((k) => k.id === h.id));
  if (more.length > 0) await e2e.keepUndropped(more);
  return more;
}

// Whether there is a way for it now, before sealing it: the relay answers and can reach their
// queue, their phone is near, or, for a text, a LoRa radio is linked, or SMS is on for them
// (lib/sms-way.ts). A photo or file goes to our relay first in any case.
function canGo(e2e: E2E, place: SendPlace, identity: string, message: Message): boolean {
  const queue = e2e.queueOf(identity);
  if (!queue) return false;
  // Photos, files and voice messages go through Nostr too, as the contact's phone puts them together.
  if (place.hidden) return (!message.file && !!place.near?.isNear(identity)) || (place.relayUp && (!message.file || !!place.own) && throughRelay(place, queue)) || throughNostr(e2e, place, identity, queue);
  if (message.file) return (!!place.own && place.relayUp && (nearby.isNear(identity) || throughRelay(place, queue))) || throughNostr(e2e, place, identity, queue);
  return (
    nearby.isNear(identity) ||
    (place.relayUp && throughRelay(place, queue)) ||
    (!message.voice && (nearby.hasSlow() || !!nearby.smsWay?.can(identity))) ||
    throughNostr(e2e, place, identity, queue)
  );
}

// Whether Nostr is the way to them now: no relay between the two, they read there, and Tor is ready (lib/nostr-chats.ts nostrOnlyWay).
function throughNostr(e2e: E2E, place: SendPlace, identity: string, queue: { sender: string }): boolean {
  return (!place.sends || !queue.sender || !place.senderHex) && nostrReady(e2e.torChat(identity)) && e2e.readsOnNostr(identity);
}

function throughRelay(place: SendPlace, queue: { sender: string; relay: string; relayKey: string }): boolean {
  if (!place.sends || !queue.sender) return false;
  try {
    contactTarget(place.sends, queue);
    return true;
  } catch {
    return false;
  }
}

// Seals the message, with its tag, and hands it on as the chat does: nearby when they are, and
// through the relay, after the conversation's first packet if the relay has not taken that yet.
// A text only LoRa could take, but too much for it with its link's preview, is sealed again
// without the preview, for LoRa. Returns how long it lasts once read, and whether it went so (`bare`).
async function sendOne(e2e: E2E, place: SendPlace, identity: string, message: Message): Promise<{ lasts: number; bare: boolean }> {
  const options = { at: place.here, tag: message.tag, lasts: message.lasts ?? 0, re: message.re, forwarded: message.forwarded };
  let sealed: { sender: string; relay: string; relayKey: string; spare: Spare | null; first: Uint8Array | null; tag: string; timer: number; copies: number; through: boolean } & ForNostr;
  let packets: Uint8Array[];
  let worthCarrying = true;
  if (message.voice) {
    const audio = await loadClip(message.voice);
    if (!audio) throw new Error(t("This voice message's sound is gone."));
    const voice = await e2e.sealVoice(identity, audio, message.voice.ms, place.senderHex, options);
    sealed = voice;
    packets = voice.packets;
  } else if (message.file) {
    // On the relay again with each try; what a try left there that did not go expires there. With
    // no relay between the two: in Nostr wraps, or on a file server (lib/nostr-send-files.ts).
    const queue = e2e.queueOf(identity);
    const toNostr = !place.own || !queue?.sender || !place.senderHex || !place.sends ? e2e.nostrPlace(identity) : null;
    // A chat that goes only through Tor sends its files through Tor too, whatever the space's way.
    const tor = e2e.torChat(identity);
    const offer = toNostr ? await offerOnNostr(refSource(message.file), message.file, toNostr, undefined, tor) : await uploadFile(tor ? { ...place.own!, torChat: circuitOf(identity) } : place.own!, message.file);
    const file = await e2e.sealFile(identity, offer, place.senderHex, options);
    sealed = file;
    packets = [file.packet];
    worthCarrying = false;
  } else {
    // A backup piece waits beside its message, never in it (lib/pieces-kept.ts).
    const text = await e2e.seal(identity, message.text, place.senderHex, { ...options, quiet: message.quiet, more: { ...contentOf(message), ...pieceToGo(e2e, message.tag) } });
    sealed = text;
    packets = [text.packet];
  }
  if (place.hidden) {
    await handOverHidden(e2e, place.sends, identity, { sealed, packets }, 'message', false, place.near ?? null);
    return { lasts: sealed.timer, bare: false };
  }
  const sends = place.sends;
  const relay =
    sends && sealed.sender
      ? orNostr(e2e, sends, identity, sealed, packets, () => sendSealed(sends, sealed, packets, sentMark(sealed, 'message'), () => e2e.firstSent(identity)))
      : nostrOnlyWay(e2e, identity, sealed, packets);
  const all = sealed.first ? [sealed.first, ...packets] : packets;
  const carry = worthCarrying ? () => carriedFor(sealed, all, { url: place.own?.url ?? '', key: place.ownKey }, sentMark(sealed, 'message')) : null;
  try {
    await e2e.copiesAfter(sealed.copies, nearby.deliver(identity, all, relay, carry, worthCarrying), true);
  } catch (error) {
    if (!(error instanceof TooLargeForSlowWayError) || !message.preview || message.voice || message.file) throw error;
    const bare = await e2e.seal(identity, message.text, place.senderHex, { ...options, quiet: message.quiet, more: withoutPreview(contentOf(message)) });
    const again = bare.first ? [bare.first, bare.packet] : [bare.packet];
    await e2e.copiesAfter(bare.copies, nearby.deliver(identity, again, null, () => carriedFor(bare, again, { url: place.own?.url ?? '', key: place.ownKey }, sentMark(bare, 'message')), true), true);
    return { lasts: bare.timer, bare: true };
  }
  return { lasts: sealed.timer, bare: false };
}

/**
 * In hidden chats, what the relay could not take for a contact's account as their queue is full, to
 * go again as it is, whose copies went to the endpoints of their account all the same: shown as
 * sent, and owed to their account (Owed). `reason`: what the relay said.
 */
export class OwedError extends Error {
  readonly reason: unknown;

  constructor(reason: unknown) {
    super(reason instanceof Error ? reason.message : String(reason));
    this.reason = reason;
  }
}

/** What hidden chats sealed for a contact, and its packets, in order. */
export type Resealed = { sealed: { sender: string; relay: string; relayKey: string; spare: Spare | null; first: Uint8Array | null; copies: number; through: boolean } & ForNostr; packets: Uint8Array[] };

/**
 * Hands what hidden chats sealed for a contact to the relay, through `target`, after the
 * conversation's first packet if the relay has not taken that yet, the last packet saying what they
 * carry (`mark`), and then the copies for the endpoints of their account (lib/e2e.ts copiesAfter);
 * with no relay between the two, to Nostr when they read there (lib/nostr-chats.ts nostrOnlyWay).
 * With `waits` (it is to go again as it is, with its tag), those go though the relay said their
 * queue is full, and when there were any, it throws OwedError. Otherwise it throws what failed: one
 * with the relay out of reach, say, is not sent, and copies nothing, as hidden chats keep nothing
 * waiting. With `near` (the place's, lib/place-nearby.ts), the phones nearby take them too, as the
 * space's chats hand theirs (lib/nearby.ts offer): to the contact's link alone when the place heard
 * them there, which is then enough, the relay's copy unwaited; otherwise the small ones to every
 * phone linked, in case theirs is one, and the relay is still waited for, failing as it fails, so
 * what waits goes again (their phone shows it once, by its tag). Only with neither relay nor Nostr
 * between the two does that copy stand in. Nothing is carried, nor goes over LoRa or by SMS.
 */
export async function handOverHidden(
  e2e: E2E,
  target: Relay | null,
  identity: string,
  { sealed, packets }: Resealed,
  mark: Mark,
  waits: boolean,
  near: NearHeard | null = null,
): Promise<'relay' | 'nostr' | 'nearby' | 'spread'> {
  if (near) {
    const all = sealed.first ? [sealed.first, ...packets] : packets;
    const way = nearby.offer(identity, all, near);
    const viaRelay = target && sealed.sender ? () => sendSealed(target, sealed, packets, sentMark(sealed, mark), () => e2e.firstSent(identity)) : null;
    if (way === 'direct') {
      // They have it from the link; the relay's copy is only in case it dropped.
      viaRelay?.().catch(() => undefined);
      return e2e.copiesAfter(sealed.copies, Promise.resolve('nearby' as const), waits && 'full');
    }
    // No relay nor Nostr between the two: the copy to the phones nearby is all there is.
    if (way === 'spread' && !viaRelay && !nostrOnlyWay(e2e, identity, sealed, packets)) return e2e.copiesAfter(sealed.copies, Promise.resolve('spread' as const), waits && 'full');
  }
  if (!target || !sealed.sender) {
    const nostr = nostrOnlyWay(e2e, identity, sealed, packets);
    if (!nostr) throw new Error(t('Type the server address in Server first.'));
    return e2e.copiesAfter(sealed.copies, nostr(), waits && 'full');
  }
  try {
    const send = orNostr(e2e, target, identity, sealed, packets, () => sendSealed(target, sealed, packets, sentMark(sealed, mark), () => e2e.firstSent(identity)));
    await e2e.copiesAfter(sealed.copies, send(), waits && 'full');
  } catch (error) {
    throw waits && sealed.copies > 0 && isQueueFull(error) ? new OwedError(error) : error;
  }
  return 'relay';
}

/** What hidden chats owe contacts' accounts (OwedError), in memory only: tried again while they stay open. */
export class Owed {
  private items: { identity: string; tag: string; seal: () => Promise<Resealed>; count: number; next: number }[] = [];
  private trying: Promise<string[]> | null = null;

  /** Owes their account the message with `tag`, sealed again by `seal` for each try. */
  add(identity: string, tag: string, seal: () => Promise<Resealed>, now = Date.now()): void {
    this.items.push({ identity, tag, seal, count: 1, next: now + FIRST_WAIT });
  }

  /** The tags still owed, oldest first. */
  tags(): string[] {
    return this.items.map((item) => item.tag);
  }

  /** Owes their account no more of the contact's message with `tag`, or of any of theirs: deleted here, it never goes. */
  forget(identity: string, tag?: string): void {
    this.items = this.items.filter((item) => item.identity !== identity || (tag !== undefined && item.tag !== tag));
  }

  /**
   * Tries again what is owed and due, through `target`, each contact's in order; one that can no
   * longer go (their queue gone, the contact deleted) is let go of. Says the tags that went.
   */
  retry(e2e: E2E, target: Relay | null, now = Date.now()): Promise<string[]> {
    this.trying ??= this.tryAll(e2e, target, now).finally(() => {
      this.trying = null;
    });
    return this.trying;
  }

  private async tryAll(e2e: E2E, target: Relay | null, now: number): Promise<string[]> {
    const went: string[] = [];
    const stuck = new Set<string>();
    for (const item of [...this.items]) {
      if (stuck.has(item.identity)) continue;
      if (item.next > now) {
        stuck.add(item.identity);
        continue;
      }
      try {
        await handOverHidden(e2e, target, item.identity, await item.seal(), 'message', true);
        this.items = this.items.filter((i) => i !== item);
        went.push(item.tag);
      } catch (error) {
        if (error instanceof OwedError || canTryLater(error)) {
          item.count += 1;
          item.next = now + Math.min(LONGEST_WAIT, FIRST_WAIT * 2 ** (item.count - 1));
          stuck.add(item.identity);
        } else {
          this.items = this.items.filter((i) => i !== item);
        }
      }
    }
    return went;
  }
}
