// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { checkedRules, type VanishStep } from '../lib/chat-rules';
import { phoneId, simsHere } from './restored';
import { sealedFile, type Holder } from './sealed-file';
import { checkedSmsOwn, type SmsOwn } from './sms-own';

// What each space keeps for SMS (lib/sms-invite.ts), sealed like its contacts (sealed-file.ts):
// whether to send SMS invites, the invites sent and not answered yet with the keys that open
// their answers, the invites that came from other Erevos phones, and invite pieces still waiting
// for the rest; whether to show names from the phone's contacts, and the SIM chosen for each number.
// The SMS themselves stay in the phone's SMS store, where every SMS app keeps them; one sent for
// later is kept here instead until it goes (lib/sms-later.ts), so no other app sees it before, and
// Android holds a copy locked with this phone's own key, to send it then with the space locked.
// Whether messages to Erevos contacts may go by SMS, encrypted, when nothing else takes them
// (lib/sms-way.ts): for every contact with a number, or for some; off unless turned on, as it costs
// what SMS cost and tells the phone company who wrote to whom and when.
// The space's own order of its SMS is sealed in ORDER_FILE, never in the phone's store, so no other
// app and no other space sees it (lib/sms-folders.ts): the conversations pinned, archived and put
// in the Trash, what is typed in each and not sent, the names given to groups' conversations, the messages pinned for the owner alone, the
// spam filter's rules and the numbers marked spam or not, and the seconds an SMS waits before it goes, to be taken back. Backups hold that
// file, and this one too from the version that holds photos and files on (lock/backup.ts): all of
// it as it was, these switches with it. An SMS for later whose time came before the backup was
// restored does not go by itself (lib/sms-later.ts): the phone the backup came from may have sent
// it already, so it waits for the owner to send it or delete it. One whose time is still ahead goes
// then, as on the phone it came from. The SIMs chosen, for numbers and for SMS for later, are known
// by the ids this phone gave them, which on another phone name another SIM or none: they count
// only on the phone they were chosen on (`simsOn`, lock/restored.ts), and elsewhere SMS go on the
// phone's default SIM until one is chosen there. What a conversation has of its own, a PIN, its
// screenshots blocked, a look and notifications, is kept here too (sms-own.ts).

export type { Holder };

/** An invite sent to `number`, with the secret that opens its answer. One by plain SMS (lib/text-invite.ts)
 *  also has its invite to the relay (`code`), until it is over or a phone used it, and the name of the
 *  phone's contact it went to, for the contact its answer adds. One shown as a QR code or shared as a
 *  link (Invite someone, components/welcome-invite.tsx) has no number (''), and lasts `days`. */
export type SentInvite = { number: string; secret: string; at: number; code?: string; name?: string; days?: number };
/** An invite answered here, from `number` ('' for one by plain SMS, whose number the link does not
 *  say), whose chat writes from `sender`; `name`, the name that invite gave its phone. */
export type GotInvite = { number: string; sender: string; at: number; name?: string };
export type WaitingPiece = { from: string; data: string; at: number };
/** The SIM (its subscription id) chosen for SMS to a number, or a group's numbers comma-separated. */
export type NumberSim = { number: string; sim: number };
/** An SMS to one number, to go at `at` on `sim` (-1: the phone's default). */
export type LaterSms = { id: string; to: string; text: string; at: number; sim: number };
/** A conversation, by its address (a group's numbers comma-separated), pinned or archived at `at`. */
export type SmsMark = { address: string; at: number };
/** A conversation put in the Trash at `at`: its messages up to `upTo` show no more, and go from
 *  the phone TRASH_DAYS later. */
export type Trashed = { address: string; upTo: number; at: number };
/** What is typed in a conversation and not sent yet. */
export type SmsDraft = { address: string; text: string; at: number };
/** A name of the owner's own for a group's conversation (its numbers comma-separated): MMS have none of their own. */
export type SmsTitle = { address: string; name: string };
/** A message pinned for the owner alone, in a conversation (by its address): SMS have no pins of
 *  their own, so nobody else sees it. Its row in the phone's SMS ("sms:12", lib/sms-chat.ts smsLineId)
 *  and its time, by which it is found again should the rows change (a backup put back). */
export type SmsPin = { address: string; id: string; at: number };
/** A number the owner said sends spam, or does not. */
export type SpamMark = { number: string; spam: boolean; at: number };
/** An SMS a linked device asked this phone to send (lib/sms-share.ts), by its id in the log: taken
 *  (`sending`), and what came of it, so none goes twice. */
export type DeviceAsk = { id: string; at: number; done: 'sending' | 'sent' | 'failed' };
/** A conversation's timer for disappearing messages, as it changed (lib/sms-rules.ts): SMS cannot
 *  delete anything on the other phone, so it deletes this phone's copies only. */
export type SmsVanish = { address: string; steps: VanishStep[] };

/** A one-time contact card's secret, base64url, whether an answer to it came already, and when it was made. */
export type CardOnce = { secret: string; used: boolean; at: number };
/** How many one-time contact cards are kept to open answers with, and how long: an answer to an
 *  older one still comes, as a message request, as long as this. */
export const MAX_CARDS_ONCE = 50;
export const CARDS_ONCE_DAYS = 30;

export type SmsData = {
  /** Send an invite with the first SMS to a number with no contact. */
  invites: boolean;
  sent: SentInvite[];
  got: GotInvite[];
  waiting: WaitingPiece[];
  /** The secret that opens the answers to this chat's contact card (lib/sms-relay.ts contactCard),
   *  base64url, '' until one is made. The card names the queue the contact link names, so a new contact
   *  link lets the cards given before go with that queue. */
  card: string;
  /** The one-time contact cards New chat showed (lib/sms-relay.ts contactCard with once), newest
   *  first, MAX_CARDS_ONCE at most: only the newest, unused, makes whoever answers it a contact at
   *  once; an answer to any other is a message request, as one to `card` is. */
  cardsOnce: CardOnce[];
  /** Show the names the phone's contacts give SMS numbers. Off until the owner turns it on. */
  names: boolean;
  sims: NumberSim[];
  /** The phone `sims` and the SIMs of `later` were chosen on (lock/restored.ts phoneId), '' for
   *  those kept before it was said. */
  simsOn: string;
  /** SMS sent for later, until they go. */
  later: LaterSms[];
  /** Conversations at the top of the list. */
  pinned: SmsMark[];
  /** Conversations out of the list, until a message comes after. */
  archived: SmsMark[];
  trash: Trashed[];
  drafts: SmsDraft[];
  /** Names given to groups' conversations here, for this space's eyes only. */
  titles: SmsTitle[];
  /** Messages pinned over their conversation, for this phone's owner only (Pin for me). */
  messagePins: SmsPin[];
  /** The spam filter: on unless turned off. With `spamLinks`, any number that is no contact and
   *  sends a link goes to Spam; with `spamWords`, any that writes one of them; with `spamFrom`, any
   *  sender a rule there names (lib/sms-folders.ts, senderRule); with `spamAbroad`, any number written
   *  with another country code than `home`. A sender `allowFrom` names never goes by those rules. */
  spam: boolean;
  spamLinks: boolean;
  spamWords: string[];
  spamFrom: string[];
  allowFrom: string[];
  spamAbroad: boolean;
  /** The phone's own country calling code, in digits ("30"), or '' when not known. */
  home: string;
  marks: SpamMark[];
  /** Seconds an SMS waits before it goes, to be taken back: 0, 5 or 10. */
  undo: number;
  /** SMS go without accents, Greek in capitals, when that keeps them in the GSM alphabet (lib/sms-count.ts). Off unless turned on. */
  plain: boolean;
  /** An SMS's notice shows who wrote and what, with Reply and Mark as read, while this space is open (lib/sms-notices.ts). Off unless turned on. */
  notices: boolean;
  /** The owner's quick texts for SMS (app/sms.tsx), or null for the app's own until they change them. */
  quick: string[] | null;
  /** Messages to every Erevos contact with a number go by SMS, encrypted, when nothing else takes them. Off unless turned on. */
  smsWay: boolean;
  /** The contacts (identity, hex) whose messages go so, whatever `smsWay` says. */
  smsWayFor: string[];
  /** The phone's SMS go to the space's linked devices too (docs/sync.md, S8), which can answer
   *  through it. Off unless turned on. */
  devices: boolean;
  /** What the devices asked to send, those taken in the last DEVICE_ASKS_KEPT. */
  fromDevices: DeviceAsk[];
  /** The conversations with something of their own here: a PIN, screenshots blocked, a look, notifications (sms-own.ts). */
  own: SmsOwn[];
  /** The conversations whose messages disappear from this phone, each with its timer. */
  vanish: SmsVanish[];
};

export const EMPTY_SMS: SmsData = {
  invites: true,
  sent: [],
  got: [],
  card: '',
  cardsOnce: [],
  waiting: [],
  names: false,
  sims: [],
  simsOn: '',
  later: [],
  pinned: [],
  archived: [],
  trash: [],
  drafts: [],
  titles: [],
  messagePins: [],
  spam: true,
  spamLinks: false,
  spamWords: [],
  spamFrom: [],
  allowFrom: [],
  spamAbroad: false,
  home: '',
  marks: [],
  undo: 5,
  plain: false,
  notices: false,
  quick: null,
  smsWay: false,
  smsWayFor: [],
  devices: false,
  fromDevices: [],
  own: [],
  vanish: [],
};

/** The rest of the space's SMS data. Backups hold it too, from the version that holds photos and
 *  files on (lock/backup.ts). */
export const FILE = 'erevos-sms';
/** The space's own order of its SMS, in a file of its own that backups hold (lock/backup.ts). */
export const ORDER_FILE = 'erevos-sms-order';
const BLOCK = 4 * 1024;
/** Invites older than this are forgotten, and a number can be invited again. */
export const INVITE_DAYS = 30;
const MAX = 50;
const MAX_SIMS = 300;
/** The SMS that can wait to go later at once, and the longest text of one: as long as a chat's. */
export const MAX_LATER = MAX;
export const LATER_TEXT = 4000;
/** The most quick texts, and the longest one. */
export const MAX_QUICK = 20;
export const QUICK_TEXT = 300;
/** The conversations that can be pinned at once, and those kept archived, in the Trash, with a
 *  draft, and numbers marked; the owner's spam words and sender rules, each this long at most. */
export const MAX_PINS = 10;
const MAX_ARCHIVED = 500;
export const MAX_TRASH = 300;
const MAX_DRAFTS = 100;
/** The groups' conversations given a name here, and the longest name. */
const MAX_TITLES = 100;
export const SMS_TITLE = 64;
/** The messages pinned for the owner, in all conversations together. */
export const MAX_MESSAGE_PINS = 300;
const MAX_MARKS = 500;
export const MAX_WORDS = 50;
export const WORD = 40;
/** Days a conversation stays in the Trash before it goes from the phone. */
export const TRASH_DAYS = 30;
export const UNDO_SECONDS = [0, 5, 10];
/** The contacts SMS can be on for one by one, at most. */
export const MAX_SMS_WAY = 500;
/** What the devices asked to send is kept this long, and this much of it at most: longer than an ask
 *  waits to be sent (lib/sync/sms.ts ASK_LASTS). */
export const DEVICE_ASKS_KEPT = 7 * 24 * 3600 * 1000;
const MAX_DEVICE_ASKS = 500;
/** The conversations with a timer, at most. */
export const MAX_VANISH = 300;

const isText = (v: unknown): v is string => typeof v === 'string';
const isTime = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isNumber = (v: unknown): v is string => isText(v) && v.length > 0 && v.length <= 32;
const isAddress = (v: unknown): v is string => isText(v) && v.length > 0 && v.length <= 400;
const isName = (v: unknown): v is string => isText(v) && v.trim().length > 0 && v.length <= 120;
const list = <T>(v: unknown, ok: (item: Record<string, unknown>) => T | null, max = MAX): T[] =>
  Array.isArray(v) ? v.map((item) => ok((item ?? {}) as Record<string, unknown>)).filter((x): x is T => x !== null).slice(-max) : [];
const words = (v: unknown): string[] => (Array.isArray(v) ? v : []).filter((w): w is string => isText(w) && w.trim().length > 0 && w.length <= WORD).slice(-MAX_WORDS);
const marked = (m: Record<string, unknown>): SmsMark | null => (isAddress(m.address) && isTime(m.at) ? { address: m.address, at: m.at } : null);

export function checked(value: unknown): SmsData {
  const v = (value ?? {}) as Partial<Record<keyof SmsData, unknown>>;
  return {
    invites: v.invites !== false,
    sent: list(v.sent, (s) =>
      (s.number === '' || isNumber(s.number)) && isText(s.secret) && /^[A-Za-z0-9_-]{43}$/.test(s.secret) && isTime(s.at)
        ? {
            number: s.number as string,
            secret: s.secret,
            at: s.at,
            ...(isText(s.code) && /^[0-9a-f]{64}$/.test(s.code) ? { code: s.code } : {}),
            ...(isName(s.name) ? { name: s.name } : {}),
            ...(Number.isInteger(s.days) && (s.days as number) >= 1 && (s.days as number) <= 30 ? { days: s.days as number } : {}),
          }
        : null,
    ),
    card: isText(v.card) && /^[A-Za-z0-9_-]{43}$/.test(v.card) ? v.card : '',
    cardsOnce: list(v.cardsOnce, (c) => (isText(c.secret) && /^[A-Za-z0-9_-]{43}$/.test(c.secret) ? { secret: c.secret, used: c.used === true, at: isTime(c.at) ? c.at : 0 } : null), MAX_CARDS_ONCE),
    got: list(v.got, (g) =>
      (g.number === '' || isNumber(g.number)) && isText(g.sender) && /^[0-9a-f]{48}$/.test(g.sender) && isTime(g.at)
        ? { number: g.number as string, sender: g.sender, at: g.at, ...(isName(g.name) ? { name: g.name } : {}) }
        : null,
    ),
    waiting: list(v.waiting, (w) => (isNumber(w.from) && isText(w.data) && w.data.length <= 400 && isTime(w.at) ? { from: w.from, data: w.data, at: w.at } : null)),
    names: v.names === true,
    sims: (Array.isArray(v.sims) ? v.sims : [])
      .map((item) => (item ?? {}) as Record<string, unknown>)
      .filter((n) => isText(n.number) && n.number.length > 0 && n.number.length <= 400 && Number.isInteger(n.sim) && (n.sim as number) >= 0)
      .map((n) => ({ number: n.number as string, sim: n.sim as number }))
      .slice(-MAX_SIMS),
    simsOn: isText(v.simsOn) && v.simsOn.length <= 64 ? v.simsOn : '',
    later: list(v.later, (l) =>
      isText(l.id) && /^[A-Za-z0-9_-]{1,32}$/.test(l.id) && isNumber(l.to) && isText(l.text) && l.text.length > 0 && l.text.length <= LATER_TEXT && isTime(l.at) && Number.isInteger(l.sim) && (l.sim as number) >= -1
        ? { id: l.id, to: l.to, text: l.text, at: l.at, sim: l.sim as number }
        : null,
    ),
    pinned: list(v.pinned, marked, MAX_PINS),
    archived: list(v.archived, marked, MAX_ARCHIVED),
    trash: list(v.trash, (t) => (isAddress(t.address) && isTime(t.upTo) && isTime(t.at) ? { address: t.address, upTo: t.upTo, at: t.at } : null), MAX_TRASH),
    drafts: list(v.drafts, (d) => (isAddress(d.address) && isText(d.text) && d.text.length > 0 && d.text.length <= LATER_TEXT && isTime(d.at) ? { address: d.address, text: d.text, at: d.at } : null), MAX_DRAFTS),
    titles: list(v.titles, (n) => (isAddress(n.address) && isText(n.name) && n.name.trim().length > 0 && n.name.length <= SMS_TITLE ? { address: n.address, name: n.name } : null), MAX_TITLES),
    messagePins: list(v.messagePins, (p) => (isAddress(p.address) && isText(p.id) && /^(sms|mms):\d{1,19}$/.test(p.id) && isTime(p.at) ? { address: p.address, id: p.id, at: p.at } : null), MAX_MESSAGE_PINS),
    spam: v.spam !== false,
    spamLinks: v.spamLinks === true,
    spamWords: words(v.spamWords),
    spamFrom: words(v.spamFrom),
    allowFrom: words(v.allowFrom),
    spamAbroad: v.spamAbroad === true,
    home: isText(v.home) && /^[1-9][0-9]{0,2}$/.test(v.home) ? v.home : '',
    marks: list(v.marks, (m) => (isNumber(m.number) && typeof m.spam === 'boolean' && isTime(m.at) ? { number: m.number, spam: m.spam, at: m.at } : null), MAX_MARKS),
    undo: UNDO_SECONDS.includes(v.undo as number) ? (v.undo as number) : EMPTY_SMS.undo,
    plain: v.plain === true,
    notices: v.notices === true,
    quick: Array.isArray(v.quick) ? [...new Set(v.quick.filter((q): q is string => isText(q) && q.trim().length > 0 && q.length <= QUICK_TEXT))].slice(0, MAX_QUICK) : null,
    smsWay: v.smsWay === true,
    smsWayFor: [...new Set((Array.isArray(v.smsWayFor) ? v.smsWayFor : []).filter((id): id is string => isText(id) && /^[0-9a-f]{2,128}$/.test(id)))].slice(-MAX_SMS_WAY),
    devices: v.devices === true,
    fromDevices: list(
      v.fromDevices,
      (a) => (isText(a.id) && /^[0-9a-f]{16}$/.test(a.id) && isTime(a.at) && (a.done === 'sending' || a.done === 'sent' || a.done === 'failed') ? { id: a.id, at: a.at, done: a.done } : null),
      MAX_DEVICE_ASKS,
    ),
    own: checkedSmsOwn(v.own),
    vanish: list(
      v.vanish,
      (c) => {
        const steps = isAddress(c.address) ? checkedRules({ vanish: c.steps })?.vanish : undefined;
        return steps ? { address: c.address as string, steps } : null;
      },
      MAX_VANISH,
    ),
  };
}

/** Drops what is older than INVITE_DAYS. */
export function fresh(data: SmsData, now: number): SmsData {
  const after = now - INVITE_DAYS * 24 * 3600 * 1000;
  return { ...data, sent: data.sent.filter((s) => s.at > after), got: data.got.filter((g) => g.at > after), waiting: data.waiting.filter((w) => w.at > after) };
}

// What ORDER_FILE holds of a space's SMS data; FILE holds the rest. `kept` is written with each
// save: from then on the order is ORDER_FILE's, and what FILE kept of it before (as an Erevos before
// ORDER_FILE did) is read no more.
const ORDER = ['pinned', 'archived', 'trash', 'drafts', 'titles', 'messagePins', 'spam', 'spamLinks', 'spamWords', 'spamFrom', 'allowFrom', 'spamAbroad', 'home', 'marks', 'undo'] as const;
type SmsOrder = Pick<SmsData, (typeof ORDER)[number]>;
type KeptOrder = SmsOrder & { kept: boolean };

const orderOf = (data: SmsOrder): SmsOrder => Object.fromEntries(ORDER.map((name) => [name, data[name]])) as SmsOrder;

const store = sealedFile({ name: FILE, empty: EMPTY_SMS, checked, block: BLOCK });
const orders = sealedFile<KeptOrder>({
  name: ORDER_FILE,
  empty: { ...orderOf(EMPTY_SMS), kept: false },
  checked: (value) => ({ ...orderOf(checked(value)), kept: (value as { kept?: unknown } | null)?.kept === true }),
  block: BLOCK,
});

// Counts the saves here, so what read the data can tell whether it changed since without reading
// it again (lib/sms-link.ts): every save goes through saveSmsData.
let saves = 0;

/** How many saves there were so far: the same number again means none since. */
export const smsSaves = (): number => saves;

/** The data was written another way (a backup put back): read again by all that read it. */
export function smsDataChanged(): void {
  saves++;
}

export async function loadSmsData(holder: Holder, space: number, key: Uint8Array): Promise<SmsData> {
  const [data, order] = await Promise.all([store.load(holder, space, key), orders.load(holder, space, key)]);
  const all = order.kept ? { ...data, ...orderOf(order) } : data;
  // SIMs chosen on another phone name none of this one's: the phone's default, until chosen here.
  return (await simsHere(all.simsOn)) ? all : { ...all, sims: [], later: all.later.map((later) => ({ ...later, sim: -1 })) };
}

/** Saves the order first: once it is kept there, FILE's copy of it from before is read no more. The
 *  SIMs in it are this phone's from then on. */
export async function saveSmsData(holder: Holder, space: number, key: Uint8Array, data: SmsData): Promise<void> {
  try {
    await orders.save(holder, space, key, { ...orderOf(data), kept: true });
    await store.save(holder, space, key, { ...data, ...orderOf(EMPTY_SMS), simsOn: await phoneId() });
  } finally {
    saves++;
  }
}
