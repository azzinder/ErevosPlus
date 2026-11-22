// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Linking phone numbers to Erevos contacts through SMS invites (lib/sms-invite.ts), for one space:
// what was sent and is waiting for an answer, what came and was answered. The chat screen does the
// relay side (answering an invite, opening an answer, accepting the first message that follows);
// this keeps the state, sealed in the space (lock/sms-data.ts).

import { withTimer } from './chat-rules';
import { canSealOpen, sealOpen, sealPublic } from './core';
import { fromBase64, randomBytes, toBase64 } from './crypto';
import { fromBase64Url, toBase64Url } from './e2e';
import { collectInvites, invitePieces, plainNumber, readInviteAnswer, sameNumber, type InvitePiece, type SmsInvite } from './sms-invite';
import { CARDS_ONCE_DAYS, DEVICE_ASKS_KEPT, fresh, MAX_CARDS_ONCE, LATER_TEXT, loadSmsData, MAX_LATER, MAX_MESSAGE_PINS, MAX_PINS, MAX_QUICK, MAX_SMS_WAY, MAX_TRASH, MAX_VANISH, MAX_WORDS, QUICK_TEXT, saveSmsData, SMS_TITLE, smsSaves, UNDO_SECONDS, WORD, type DeviceAsk, type LaterSms, type SentInvite, type SmsData, type SmsPin } from '../lock/sms-data';
import { smsSpamFilter, type Sim } from '../modules/erevos-sms';
import { sameAddress, sameConversation, smsAddress, smsNumbers } from './sms-group';
import { senderRule } from './sms-folders';
import { smsOwnOf, withSmsOwn, type SmsOwnChange } from './chat-protect';
import { smsNoticesRead } from './sms-notices';
import type { SmsOwn } from '../lock/sms-own';
import { TEXT_INVITE_DAYS } from './text-invite';

const DAY_MS = 24 * 3600 * 1000;

/** Where this chat can be reached, for an invite. */
export type Own = { senderHex: string; relay: string; relayKey: string };

export class SmsLink {
  private readonly space: number;
  private readonly key: Uint8Array;
  private data: SmsData;
  // The saves there were when it was read (smsSaves): with none since, it is as on the phone.
  private seen: number;

  private constructor(space: number, key: Uint8Array, data: SmsData, seen: number) {
    this.space = space;
    this.key = key;
    this.data = data;
    this.seen = seen;
    smsSpamFilter(data.spam);
    smsNoticesRead(space, data);
  }

  static async open(space: number, key: Uint8Array): Promise<SmsLink> {
    const seen = smsSaves();
    return new SmsLink(space, key, fresh(await loadSmsData('space', space, key), Date.now()), seen);
  }

  /** Reads what another screen may have changed since, if it did: the chat asks at each look. */
  async refresh(): Promise<void> {
    if (smsSaves() === this.seen) return;
    const seen = smsSaves();
    this.data = fresh(await loadSmsData('space', this.space, this.key), Date.now());
    this.seen = seen;
    smsSpamFilter(this.data.spam);
    smsNoticesRead(this.space, this.data);
  }

  // Changes the data as it is on the phone now: the chat and the SMS screen each keep one.
  private async update(change: (data: SmsData) => SmsData): Promise<void> {
    await this.refresh();
    const data = change(this.data);
    try {
      await saveSmsData('space', this.space, this.key, data);
    } finally {
      // Read again next time, in case another saved meanwhile.
      this.seen = -1;
    }
    this.data = data;
  }

  get invites(): boolean {
    return this.data.invites;
  }

  /** Whether messages to Erevos contacts with a number go by SMS when nothing else takes them: for all (`all`), and for which besides. */
  get smsWay(): { all: boolean; some: readonly string[] } {
    return { all: this.data.smsWay, some: this.data.smsWayFor };
  }

  /** Whether messages to this contact go by SMS when nothing else takes them. */
  smsWayOn(identity: string): boolean {
    return this.data.smsWay || this.data.smsWayFor.includes(identity);
  }

  /** Lets messages to every contact with a number go by SMS last, or no longer; one by one stays as it was. */
  setSmsWay(on: boolean): Promise<void> {
    return this.update((d) => ({ ...d, smsWay: on }));
  }

  /** Lets messages to one contact go by SMS last, or no longer. False, and nothing changed, when MAX_SMS_WAY are on already. */
  async setSmsWayFor(identity: string, on: boolean): Promise<boolean> {
    let done = true;
    await this.update((d) => {
      const others = d.smsWayFor.filter((id) => id !== identity);
      done = !on || others.length < MAX_SMS_WAY;
      return done ? { ...d, smsWayFor: on ? [...others, identity] : others } : d;
    });
    return done;
  }

  setInvites(on: boolean): Promise<void> {
    return this.update((d) => ({ ...d, invites: on }));
  }

  /** Whether SMS numbers show the names the phone's contacts give them. */
  get names(): boolean {
    return this.data.names;
  }

  setNames(on: boolean): Promise<void> {
    return this.update((d) => ({ ...d, names: on }));
  }

  /** Whether an SMS's notice shows who wrote and what, with Reply and Mark as read (lib/sms-notices.ts). */
  get notices(): boolean {
    return this.data.notices;
  }

  async setNotices(on: boolean): Promise<void> {
    await this.update((d) => ({ ...d, notices: on }));
    smsNoticesRead(this.space, this.data);
  }

  /** Whether the phone's SMS go to the space's linked devices too (lib/sms-share.ts). */
  get devices(): boolean {
    return this.data.devices;
  }

  setDevices(on: boolean): Promise<void> {
    return this.update((d) => ({ ...d, devices: on }));
  }

  /** What became of an SMS a device asked to send (its id in the log), or null for one never taken. */
  deviceAsk(id: string): DeviceAsk['done'] | null {
    return this.data.fromDevices.find((a) => a.id === id)?.done ?? null;
  }

  /** Keeps what became of an SMS a device asked to send: taken before it goes, so it never goes twice. */
  setDeviceAsk(id: string, done: DeviceAsk['done'], now = Date.now()): Promise<void> {
    return this.update((d) => ({
      ...d,
      fromDevices: [...d.fromDevices.filter((a) => a.id !== id && a.at > now - DEVICE_ASKS_KEPT), { id, at: now, done }],
    }));
  }

  /** The SIM chosen for `number` (or a group's numbers, comma-separated), or -1. */
  simFor(number: string): number {
    return this.data.sims.find((s) => sameAddress(s.number, number))?.sim ?? -1;
  }

  /** Sends to `number` on `sim` from now on; -1 forgets the choice. */
  setSim(number: string, sim: number): Promise<void> {
    const plain = smsAddress(smsNumbers(number));
    return this.update((d) => ({ ...d, sims: [...d.sims.filter((s) => !sameAddress(s.number, plain)), ...(sim >= 0 ? [{ number: plain, sim }] : [])] }));
  }

  /** The SMS sent for later that have not gone yet, the soonest first (lib/sms-later.ts). */
  get later(): LaterSms[] {
    return [...this.data.later].sort((a, b) => a.at - b.at);
  }

  /** Keeps an SMS to go later. False, and nothing kept, when MAX_LATER already wait. */
  async addLater(sms: Omit<LaterSms, 'id'>): Promise<boolean> {
    let kept = false;
    const id = toBase64Url(randomBytes(9));
    await this.update((d) => {
      kept = d.later.length < MAX_LATER;
      return kept ? { ...d, later: [...d.later, { ...sms, id }] } : d;
    });
    return kept;
  }

  /** Forgets an SMS sent for later: it went, or was cancelled. */
  removeLater(id: string): Promise<void> {
    return this.update((d) => ({ ...d, later: d.later.filter((l) => l.id !== id) }));
  }

  /** The space's SMS data as it is now: its folders, drafts and spam rules (lib/sms-folders.ts). */
  get state(): Readonly<SmsData> {
    return this.data;
  }

  /** Pins a conversation at the top of the list, or takes the pin away. False, and nothing
   *  changed, when MAX_PINS are pinned already. */
  async pin(address: string, on: boolean): Promise<boolean> {
    let done = true;
    await this.update((d) => {
      const others = d.pinned.filter((p) => !sameConversation(p.address, address));
      done = !on || others.length < MAX_PINS;
      return done ? { ...d, pinned: on ? [...others, { address, at: Date.now() }] : others } : d;
    });
    return done;
  }

  /** Takes a conversation out of the list, unpinned, until a message comes from them after `at`;
   *  or puts it back. */
  archive(address: string, on: boolean, at = Date.now()): Promise<void> {
    return this.update((d) => ({
      ...d,
      pinned: on ? d.pinned.filter((p) => !sameConversation(p.address, address)) : d.pinned,
      archived: [...d.archived.filter((a) => !sameConversation(a.address, address)), ...(on ? [{ address, at }] : [])],
    }));
  }

  /** Forgets that these conversations were archived: a message brought them back. */
  unarchive(addresses: string[]): Promise<void> {
    return this.update((d) => ({ ...d, archived: d.archived.filter((a) => !addresses.some((address) => sameConversation(a.address, address))) }));
  }

  /** Puts a conversation in the Trash, its messages up to `upTo`, unpinned and out of the Archive.
   *  False, and nothing changed, when MAX_TRASH are there already. */
  async trash(address: string, upTo: number, at = Date.now()): Promise<boolean> {
    let done = true;
    await this.update((d) => {
      const others = d.trash.filter((t) => !sameConversation(t.address, address));
      done = others.length < MAX_TRASH;
      if (!done) return d;
      const other = (a: { address: string }) => !sameConversation(a.address, address);
      return { ...d, trash: [...others, { address, upTo, at }], pinned: d.pinned.filter(other), archived: d.archived.filter(other) };
    });
    return done;
  }

  /** Takes a conversation out of the Trash: it is back, or it went from the phone. */
  untrash(address: string): Promise<void> {
    return this.update((d) => ({ ...d, trash: d.trash.filter((t) => !sameConversation(t.address, address)) }));
  }

  /** The messages of a conversation pinned for the owner alone, the latest pinned last. */
  messagePins(address: string): SmsPin[] {
    return this.data.messagePins.filter((p) => sameConversation(p.address, address));
  }

  /** Pins a message of a conversation for the owner alone (`id` its row, "sms:12", and `at` its
   *  time), or takes the pin away. Past MAX_MESSAGE_PINS, the one pinned first goes. */
  pinMessage(address: string, message: { id: string; at: number }, on: boolean): Promise<void> {
    return this.update((d) => {
      const others = d.messagePins.filter((p) => !(p.id === message.id && sameConversation(p.address, address)));
      return { ...d, messagePins: on ? [...others, { address, id: message.id, at: message.at }].slice(-MAX_MESSAGE_PINS) : others };
    });
  }

  /** Gives a group's conversation a name of the owner's own, or takes it away with an empty one. */
  setTitle(address: string, name: string): Promise<void> {
    const named = name.trim().slice(0, SMS_TITLE);
    return this.update((d) => ({ ...d, titles: [...d.titles.filter((n) => !sameConversation(n.address, address)), ...(named ? [{ address, name: named }] : [])] }));
  }

  /** What is typed in a conversation and not sent, or nothing. */
  draftFor(address: string): string {
    return this.data.drafts.find((d) => sameConversation(d.address, address))?.text ?? '';
  }

  /** Keeps what is typed in a conversation; nothing typed forgets it. */
  setDraft(address: string, text: string): Promise<void> {
    const kept = text.trim() ? text.slice(0, LATER_TEXT) : '';
    if (kept === this.draftFor(address)) return Promise.resolve();
    return this.update((d) => ({ ...d, drafts: [...d.drafts.filter((x) => !sameConversation(x.address, address)), ...(kept ? [{ address, text: kept, at: Date.now() }] : [])] }));
  }

  /** What a conversation has of its own here (lib/chat-protect.ts): its PIN, its screenshots
   *  blocked, its look, its notifications; null for none. */
  own(address: string): SmsOwn | null {
    return smsOwnOf(this.data.own, address);
  }

  /** Changes what a conversation has of its own; the phone learns its notifications at once (lib/sms-notices.ts). */
  async setOwn(address: string, change: SmsOwnChange): Promise<void> {
    await this.update((d) => ({ ...d, own: withSmsOwn(d.own, address, change) }));
    smsNoticesRead(this.space, this.data);
  }

  /** Says a number sends spam (true), or does not (false), whatever the filter thinks; null leaves
   *  it to the filter again. */
  markSpam(number: string, spam: boolean | null): Promise<void> {
    return this.update((d) => ({ ...d, marks: [...d.marks.filter((m) => !sameConversation(m.number, number)), ...(spam === null ? [] : [{ number, spam, at: Date.now() }])] }));
  }

  setSpam(on: boolean): Promise<void> {
    return this.update((d) => ({ ...d, spam: on })).then(() => smsSpamFilter(on));
  }

  setSpamLinks(on: boolean): Promise<void> {
    return this.update((d) => ({ ...d, spamLinks: on }));
  }

  /** Adds a word that sends an SMS to Spam. False when it is no word, or MAX_WORDS are kept. */
  async addSpamWord(word: string): Promise<boolean> {
    const kept = word.trim().replace(/\s+/g, ' ');
    if (!kept || kept.length > WORD) return false;
    let done = true;
    await this.update((d) => {
      if (d.spamWords.some((w) => w.toLowerCase() === kept.toLowerCase())) return d;
      done = d.spamWords.length < MAX_WORDS;
      return done ? { ...d, spamWords: [...d.spamWords, kept] } : d;
    });
    return done;
  }

  removeSpamWord(word: string): Promise<void> {
    return this.update((d) => ({ ...d, spamWords: d.spamWords.filter((w) => w !== word) }));
  }

  /** Adds a rule on who sends (lib/sms-folders.ts, senderRule): to Spam, or always let through
   *  (`allow`), out of the other list. False when it is no rule, or MAX_WORDS are kept there. */
  async addSenderRule(typed: string, allow: boolean): Promise<boolean> {
    const rule = senderRule(typed);
    if (!rule) return false;
    let done = true;
    await this.update((d) => {
      const same = (r: string) => r.toLowerCase() === rule.toLowerCase();
      const into = allow ? d.allowFrom : d.spamFrom;
      if (into.some(same)) return d;
      done = into.length < MAX_WORDS;
      if (!done) return d;
      const spamFrom = allow ? d.spamFrom.filter((r) => !same(r)) : [...d.spamFrom, rule];
      const allowFrom = allow ? [...d.allowFrom, rule] : d.allowFrom.filter((r) => !same(r));
      return { ...d, spamFrom, allowFrom };
    });
    return done;
  }

  /** Takes a rule on who sends out of both lists. */
  removeSenderRule(rule: string): Promise<void> {
    return this.update((d) => ({ ...d, spamFrom: d.spamFrom.filter((r) => r !== rule), allowFrom: d.allowFrom.filter((r) => r !== rule) }));
  }

  /** Sends numbers from abroad to Spam, or not; `home`, the phone's own country code in digits, is
   *  kept as given when it is one. */
  setSpamAbroad(on: boolean, home: string): Promise<void> {
    const code = home.replace(/\D/g, '');
    return this.update((d) => ({ ...d, spamAbroad: on, home: /^[1-9][0-9]{0,2}$/.test(code) ? code : d.home }));
  }

  /** Sets a conversation's timer for disappearing messages (lib/sms-rules.ts), in seconds (0:
   *  messages stay), for messages from `now` on. False, and nothing changed, when MAX_VANISH
   *  conversations have one already. */
  async setVanish(address: string, after: number, now = Date.now()): Promise<boolean> {
    let done = true;
    await this.update((d) => {
      const others = d.vanish.filter((v) => !sameConversation(v.address, address));
      const steps = withTimer({ vanish: d.vanish.find((v) => sameConversation(v.address, address))?.steps }, after, now)?.vanish ?? [];
      done = !steps.length || others.length < MAX_VANISH;
      return done ? { ...d, vanish: [...others, ...(steps.length ? [{ address, steps }] : [])] } : d;
    });
    return done;
  }

  /** Seconds an SMS waits before it goes, to be taken back. */
  get undo(): number {
    return this.data.undo;
  }

  setUndo(seconds: number): Promise<void> {
    return this.update((d) => ({ ...d, undo: UNDO_SECONDS.includes(seconds) ? seconds : d.undo }));
  }

  /** Whether SMS go without accents, Greek in capitals, to cost fewer (lib/sms-count.ts). */
  get plain(): boolean {
    return this.data.plain;
  }

  setPlain(on: boolean): Promise<void> {
    return this.update((d) => ({ ...d, plain: on }));
  }

  /** The owner's quick texts, or null for the app's own until they change them. */
  get quick(): string[] | null {
    return this.data.quick;
  }

  setQuick(list: string[]): Promise<void> {
    const kept = [...new Set(list.map((q) => q.trim()).filter((q) => q.length > 0 && q.length <= QUICK_TEXT))].slice(0, MAX_QUICK);
    return this.update((d) => ({ ...d, quick: kept }));
  }

  /** Whether the first SMS to `number` should carry an invite: invites are on, the core can open
   *  the answer, and the number was not invited, nor invited this chat, lately. */
  wantsInvite(number: string): boolean {
    return (
      this.data.invites &&
      canSealOpen() &&
      !this.data.sent.some((s) => sameNumber(s.number, number)) &&
      !this.data.got.some((g) => sameNumber(g.number, number))
    );
  }

  /** Sends an invite to `number`, a data SMS for each piece, and keeps the key that opens the answer. */
  async invite(number: string, own: Own, send: (number: string, piece: Uint8Array) => Promise<void>): Promise<void> {
    const secret = randomBytes(32);
    const invite: SmsInvite = { sender: own.senderHex, key: await sealPublic(secret), relay: own.relay, relayKey: own.relayKey };
    const pieces = invitePieces(invite, randomBytes(4));
    await this.update((d) => ({ ...d, sent: [...d.sent, { number: plainNumber(number), secret: toBase64Url(secret), at: Date.now() }] }));
    for (const piece of pieces) await send(number, piece);
  }

  /** The invites complete with `pieces` and the ones kept waiting, from numbers not answered yet. */
  async collect(pieces: InvitePiece[]): Promise<{ from: string; invite: SmsInvite }[]> {
    let invites: { from: string; invite: SmsInvite }[] = [];
    await this.update((d) => {
      const kept = d.waiting.map((w) => ({ from: w.from, data: fromBase64(w.data), at: w.at }));
      const collected = collectInvites([...kept, ...pieces]);
      invites = collected.invites;
      return { ...d, waiting: collected.waiting.map((w) => ({ from: w.from, data: toBase64(w.data), at: w.at })) };
    });
    return invites.filter((i) => !this.data.got.some((g) => g.sender === i.invite.sender));
  }

  /** Remembers that the invite from `number` was answered, so the first message from `sender` is
   *  accepted and linked to the number; '' for an invite by plain SMS, whose link says no number,
   *  and `name` the name it gave its phone. */
  answered(number: string, sender: string, name = ''): Promise<void> {
    const got = { number: number ? plainNumber(number) : '', sender, at: Date.now(), ...(name.trim() ? { name: name.trim() } : {}) };
    return this.update((d) => ({ ...d, got: [...d.got.filter((g) => g.sender !== sender), got] }));
  }

  /** The invite this chat answered, for a contact who writes from `sender`: its number ('' when it
   *  came by plain SMS) and the name it gave its phone (''); null when it answered none of theirs. */
  answeredFor(sender: string): { number: string; name: string } | null {
    const got = this.data.got.find((g) => g.sender === sender);
    return got ? { number: got.number, name: got.name ?? '' } : null;
  }

  /** Keeps an invite by plain SMS sent to `number`, a contact of the phone's named `name`: the secret
   *  that opens its answer, and its invite to the relay, to take back once it is over unused. */
  textInvited(number: string, secret: Uint8Array, code: string, name: string, days = TEXT_INVITE_DAYS): Promise<void> {
    const sent: SentInvite = {
      number: number ? plainNumber(number) : '',
      secret: toBase64Url(secret),
      at: Date.now(),
      code,
      ...(name.trim() ? { name: name.trim() } : {}),
      ...(days !== TEXT_INVITE_DAYS ? { days } : {}),
    };
    return this.update((d) => ({ ...d, sent: [...d.sent, sent] }));
  }

  /** Names, or names again, whom an invite sent here and still waiting is for: the name its answer's contact takes. */
  nameTextInvite(secret: string, name: string): Promise<void> {
    const named = name.trim();
    return this.update((d) => ({
      ...d,
      sent: d.sent.map((s) => {
        if (s.secret !== secret) return s;
        const { name: _name, ...rest } = s;
        return named ? { ...rest, name: named } : rest;
      }),
    }));
  }

  /** The newest invite made here as a QR code or a link (no number, makeShortInvite) that still
   *  waits, with its invite to the relay, made after `since`; null when there is none. */
  waitingShortInvite(since: number): SentInvite | null {
    const waiting = this.data.sent.filter((s) => !s.number && s.code && s.at > since);
    return waiting.length > 0 ? waiting.reduce((a, b) => (b.at > a.at ? b : a)) : null;
  }

  /** Whether the invite sent here whose secret is `secret` still waits for its answer. */
  textInviteWaits(secret: string): boolean {
    return this.data.sent.some((s) => s.secret === secret);
  }

  /** The invites by plain SMS sent here at `before` or earlier whose invite to the relay is still kept:
   *  `before` is TEXT_INVITE_DAYS ago, and an invite that lasts longer (`days`) is over that much later. */
  textInvitesDue(before: number): SentInvite[] {
    return this.data.sent.filter((s) => s.code && s.at + ((s.days ?? TEXT_INVITE_DAYS) - TEXT_INVITE_DAYS) * DAY_MS <= before);
  }

  /** An invite by plain SMS is over: `forget` drops it, as nothing can answer it; otherwise only its
   *  invite to the relay goes, as a phone used it and may still answer. */
  settleTextInvite(secret: string, forget: boolean): Promise<void> {
    return this.update((d) => ({
      ...d,
      sent: forget ? d.sent.filter((s) => s.secret !== secret) : d.sent.map((s) => (s.secret === secret ? { number: s.number, secret: s.secret, at: s.at, ...(s.name ? { name: s.name } : {}) } : s)),
    }));
  }

  /** Whether any invite sent from here still waits for its answer. */
  get waiting(): boolean {
    return this.data.sent.length > 0 || !!this.data.card || this.data.cardsOnce.length > 0;
  }

  /** The secret of this chat's contact card, made the first time it is asked for. */
  async cardSecret(): Promise<Uint8Array> {
    if (!this.data.card) {
      const made = toBase64Url(randomBytes(32));
      await this.update((d) => (d.card ? d : { ...d, card: made }));
    }
    return fromBase64Url(this.data.card);
  }

  /** A one-time contact card's secret, for New chat's QR code: `keep`, the one this opening of New
   *  chat made already, while it is the newest and unused; else a new one, and the cards shown
   *  before it no longer make whoever answers them a contact at once (openAnswer). The older ones
   *  are kept CARDS_ONCE_DAYS, MAX_CARDS_ONCE at most, so an answer to one still comes, as a request. */
  async onceSecret(keep = '', now = Date.now()): Promise<Uint8Array> {
    const newest = this.data.cardsOnce[0];
    if (keep && newest?.secret === keep && !newest.used) return fromBase64Url(keep);
    const made = toBase64Url(randomBytes(32));
    const since = now - CARDS_ONCE_DAYS * DAY_MS;
    await this.update((d) => ({ ...d, cardsOnce: [{ secret: made, used: false, at: now }, ...d.cardsOnce.filter((c) => c.at > since)].slice(0, MAX_CARDS_ONCE) }));
    return fromBase64Url(made);
  }

  /** Whether an answer to the one-time card `secret` makes its sender a contact at once, and marks it
   *  used: only the newest card, the first time. Exported for the checks. */
  async takeOnce(secret: string): Promise<boolean> {
    const at = this.data.cardsOnce.findIndex((c) => c.secret === secret);
    if (at < 0) return false;
    const once = at === 0 && !this.data.cardsOnce[at].used;
    await this.update((d) => ({ ...d, cardsOnce: d.cardsOnce.map((c) => (c.secret === secret ? { ...c, used: true } : c)) }));
    return once;
  }

  /** Opens an answer to an invite sent from here: the number invited, its contact link, and the
   *  name of the phone's contact it went to ('' but for an invite by plain SMS). Null when `bytes`
   *  answers none of them. The invite is then done; an answer to the contact card (`card`) leaves the
   *  card as it is, as it is for anyone who has it; one to the newest one-time card, the first time,
   *  is `once`. */
  async openAnswer(bytes: Uint8Array): Promise<{ number: string; link: string; name: string; card?: true; once?: true } | null> {
    if (!canSealOpen() || bytes[0] !== 1) return null;
    if (this.data.card) {
      let link: string | null = null;
      try {
        link = readInviteAnswer((await sealOpen(fromBase64Url(this.data.card), bytes)).message);
      } catch {
        // Not an answer to the card.
      }
      if (link) return { number: '', link, name: '', card: true };
    }
    for (const shown of this.data.cardsOnce) {
      let link: string | null = null;
      try {
        link = readInviteAnswer((await sealOpen(fromBase64Url(shown.secret), bytes)).message);
      } catch {
        continue;
      }
      if (!link) continue;
      return (await this.takeOnce(shown.secret)) ? { number: '', link, name: '', card: true, once: true } : { number: '', link, name: '', card: true };
    }
    for (const sent of this.data.sent) {
      let link: string | null;
      try {
        link = readInviteAnswer((await sealOpen(fromBase64Url(sent.secret), bytes)).message);
      } catch {
        continue;
      }
      if (!link) continue;
      await this.update((d) => ({ ...d, sent: d.sent.filter((s) => s.secret !== sent.secret) }));
      return { number: sent.number, link, name: sent.name ?? '' };
    }
    return null;
  }
}

/** The SIM an SMS to a number goes on: the one chosen for it, else the one its last message came
 *  on, if still in the phone; else -1, the phone's default. With one SIM, always -1. */
export function chooseSim(sims: Sim[], chosen: number, lastCame: number): number {
  if (sims.length < 2) return -1;
  if (sims.some((s) => s.id === chosen)) return chosen;
  if (sims.some((s) => s.id === lastCame)) return lastCame;
  return -1;
}

/** "SIM 1", "SIM 2", for a SIM's subscription id; empty when unknown. */
export function simLabel(sims: Sim[], id: number | undefined): string {
  const sim = sims.find((s) => s.id === id);
  return sim ? `SIM ${sim.slot + 1}` : '';
}
