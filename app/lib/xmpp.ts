// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { accountTorOf, effectiveTor, type AccountTor } from './account-tor';
import { sha1 } from '@noble/hashes/legacy.js';

import type { ChatNotify } from '../lock/chat-notify';
import type { ChatPin } from '../lock/chat-pin';
import type { Look } from '../theme/look';
import type { ChatRules } from './chat-rules';
import { randomBytes, toBase64, toHex, utf8Encode } from './crypto';
import { deviceLine } from './call-lines';
import type { Preview } from './chat-parts';
import type { ChatWriting } from './chat-writing';
import { t } from './i18n';
import { bare, domainOf, isXmppId, newXmppId, NS, XmppError } from './xmpp-base';
import { cleanStatus, isOn, type NetPresence } from './net-presence';
import { connectXmpp, type XmppLink, type XmppServer } from './xmpp-net';
import {
  nameFor,
  NS_CHATSTATES,
  NS_CORRECT,
  NS_FALLBACK,
  NS_REACTIONS,
  NS_RETRACT,
  pinned,
  react,
  reactionsOf,
  replaceOf,
  replyOf,
  replyParts,
  retract,
  RETRACT_BODY,
  retractOf,
  targetOf,
  toggled,
  typingOf,
  withoutQuote,
  wroteIt,
  type Writer,
} from './xmpp-actions';
import { avatarOf, NS_AVATAR_META, publishXmppAvatar, removeXmppAvatar, type XmppAvatar } from './xmpp-avatar';
import { fileOfText, findUpload, NS_OOB, oobOf, textOfFile, type XmppFile, type XmppUpload } from './xmpp-files';
import { enterRooms, groupPeople, mentions, NS_DATA, NS_MUC_USER, refreshRoom, roomOf, takeBookmarks, takeInvite, takeRoomPresence, type XmppInvite, type XmppMuc, type XmppRoom } from './xmpp-muc';
import type { XmppPushTo } from './xmpp-push';
import {
  bundleElement,
  bundleNode,
  bundleOf,
  deviceListElement,
  devicesOf,
  DEVICES_NODE,
  HINT_BODY,
  itemOf,
  itemsElement,
  keptPreKeys,
  keyFor,
  newOwnOmemo,
  NoOmemoError,
  OMEMO,
  omemoCall,
  PRE_KEYS,
  publishElement,
  usePreKey,
  type OmemoDevice,
  type OmemoPeople,
  type OwnOmemo,
  type PreKey,
  type SignedPreKey,
} from './xmpp-omemo';
import {
  BUNDLE_ITEMS,
  bundle2Element,
  bundle2Of,
  BUNDLES2_NODE,
  DEVICES2_NODE,
  devices2Of,
  devices2With,
  encrypted2Element,
  envelope,
  itemElement,
  key2For,
  newOwnOmemo2,
  OMEMO2,
  openEnvelope,
  publish2Element,
  type OwnOmemo2,
} from './xmpp-omemo2';
import { previewElement, previewOf } from './xmpp-links';
import { pickMechanism, startSasl } from './xmpp-sasl';
import { child, children, el, find, render, textOf, type XmlElement } from './xmpp-xml';
import { editionName } from './edition';

// An XMPP (Jabber) account in Erevos (docs/xmpp.md): signing in, the contacts (roster), and chats
// with one person or a group (lib/xmpp-muc.ts), encrypted with OMEMO (lib/xmpp-omemo.ts) as
// Conversations, Monal, Gajim and Dino do, or OMEMO 2 (lib/xmpp-omemo2.ts) to the devices that
// have it, as Kaidan's. The connection is lib/xmpp-net.ts's; lib/xmpp-store.ts keeps it running for the open
// space and keeps the account sealed in it (lock/xmpp-data.ts).
//
// What a chat holds is kept here, as on the other networks: the latest KEEP_MESSAGES of each.
// Messages that came while the phone was away are fetched from the server's archive (MAM,
// XEP-0313) when it connects again; ones sent from the account's other devices come as carbons
// (XEP-0280).


/** How many messages each chat keeps. */
export const KEEP_MESSAGES = 300;
/** How many message ids are remembered, so one that comes twice shows once. */
const KEEP_SEEN = 3000;
/** Pages of the archive fetched when connecting again, 50 messages each. */
const MOST_PAGES = 20;
/** How long a person's device list is trusted before it is fetched again. */
const DEVICES_FRESH_MS = 24 * 3600_000;
/** How long after a device's bundle could not be had it is tried again. */
const RETRY_DEVICE_MS = 3600_000;

export type XmppMessage = {
  id: string;
  mine: boolean;
  text: string;
  at: number;
  encrypted: boolean;
  /** An encrypted message this device cannot open. */
  locked?: boolean;
  state?: 'sending' | 'sent' | 'received' | 'read' | 'failed';
  /** It asked to be marked as read (XEP-0333), and to whom that goes. */
  markable?: string;
  /** A call's line (lib/xmpp-calls.ts), kept here only: its text in English, shown by lib/call-lines.ts. */
  call?: true;
  /** A photo or file (lib/xmpp-files.ts): where it is, and its key when encrypted. Its text is then empty. */
  file?: XmppFile;
  /** In a group: the name of whoever wrote it there. */
  by?: string;
  /** In a group: the address of whoever wrote it, when the room says it. */
  who?: string;
  /** In a group: the id the room gave it (XEP-0359), which reactions, answers and takings back there name. */
  sid?: string;
  /** The message it answers (XEP-0461), by its id here, or as it was named when that is not here. */
  replyTo?: string;
  /** When its writer changed its words after it went (XEP-0308). */
  edited?: number;
  /** Taken back by its writer (XEP-0424): its words are gone. */
  deleted?: true;
  /** Reactions to it (XEP-0444): each one's emoji, by their address (ours by the account's), or by `/name` in a group that does not say it. */
  reacted?: Record<string, string[]>;
  /** The preview of a link in its words, as its sender's phone made it (lib/xmpp-links.ts); only beside words not encrypted. */
  preview?: Preview;
  /**
   * A copy of a message from another chat: one we forwarded, or one that came marked so (XEP-0297),
   * which only a message not encrypted can be.
   */
  forwarded?: true;
};

export type XmppChat = {
  jid: string;
  /** «Through Tor» for this chat: the whole account then goes only through Tor (one connection carries every chat). Off when missing. */
  tor?: true;
  messages: XmppMessage[];
  unread: number;
  lastAt: number;
  /** The time of the newest message read here or on another device of the account (markXmppRead, a
   *  read mark of ours, or one we sent): what comes from before it, from the archive after a restart
   *  or as a group's history, is not counted as new. Missing while nothing was read. */
  readAt?: number;
  /** The person chose to write without encryption, to someone whose app has none. */
  plain?: boolean;
  /** Its own notifications (lock/chat-notify.ts), kept on this device only. */
  notify?: ChatNotify;
  /** Its own look (theme/look.ts), kept on this device only; missing while it takes the space's. */
  look?: Look;
  /** The PIN it opens with, as kept, and its screenshots blocked (lib/chat-protect.ts), on this device only. */
  pin?: ChatPin;
  shots?: true;
  /** A group (lib/xmpp-muc.ts), its address the chat's. */
  room?: XmppRoom;
  /** Messages pinned on this device only, by their ids, the latest last: XMPP has no pins its apps share (lib/xmpp-actions.ts). */
  pins?: string[];
  /** Its disappearing messages and those deleted on this device only (lib/xmpp-rules.ts), kept here only. */
  rules?: ChatRules;
};

export type XmppContact = {
  jid: string;
  name?: string;
  subscription: 'none' | 'to' | 'from' | 'both' | 'remove';
  /** We asked to see them, and they have not answered yet. */
  asked?: boolean;
};

export type XmppState = {
  /** The account's bare JID, such as name@example.org. */
  jid: string;
  password: string;
  resource: string;
  /** A server given by hand, when the domain's own DNS does not say. */
  server?: XmppServer;
  omemo: OwnOmemo;
  people: OmemoPeople;
  /** This device's OMEMO 2, made as it first signs in with it, and the devices of OMEMO 2 we know. */
  omemo2?: OwnOmemo2;
  people2?: OmemoPeople;
  chats: Record<string, XmppChat>;
  roster: Record<string, XmppContact>;
  /** People who asked to add us. */
  requests: string[];
  /** The archive id of the newest message fetched or seen. */
  archived?: string;
  seen: string[];
  /** The server's HTTP upload service, as last found (lib/xmpp-files.ts). */
  upload?: XmppUpload;
  /** Invitations to groups, from contacts (lib/xmpp-muc.ts). */
  invites?: XmppInvite[];
  /** The server's group service, as last found. */
  muc?: XmppMuc;
  /** The restore of a backup this account last went past (lib/xmpp-store.ts, renewDevice): '' for none. */
  restored?: string;
  /** Addresses the account blocks (XEP-0191), as its server last said: nothing of theirs reaches it. */
  blocked?: string[];
  /** Whether the others are told when we write (XEP-0085): off unless turned on, as the server sees it. */
  sayTyping?: true;
  /** Profile pictures as their notes last said (lib/xmpp-avatar.ts), by bare address, ours too. */
  avatars?: Record<string, XmppAvatar>;
  /** Where the server pushes while the space is closed, once asked to (lib/xmpp-push.ts). */
  push?: XmppPushTo;
  /** Each chat's draft, and the messages held to go later, on this device only (lib/chat-writing.ts). */
  writing?: ChatWriting;
  /** Contacts the account appears offline to (lib/xmpp-rules.ts), by bare address in small letters. */
  unseenBy?: string[];
  /** The account's Tor choice (lib/account-tor.ts): Off when missing; `true`, as the first switch
   *  kept it, is Always. A chat «Through Tor» makes it Always while on (xmppTorWay). Calls never go through Tor. */
  tor?: AccountTor | true;
};

/** The Tor choice that counts for the account now: its own, or Always while any of its chats goes «Through Tor». */
export function xmppTorWay(state: Pick<XmppState, 'tor' | 'chats'>): AccountTor {
  return effectiveTor(accountTorOf(state.tor), Object.values(state.chats).some((chat) => chat.tor === true));
}

// They live in lib/xmpp-base, which lib/xmpp-muc takes without taking this file.
export { bare, domainOf, isXmppId, newXmppId, NS, XmppError };
const newId = newXmppId;

/** A chat's name: the one in the contacts, or a group's own, or the part before the @. */
export function nameOf(state: XmppState, jid: string): string {
  return state.roster[jid]?.name?.trim() || state.chats[jid]?.room?.name?.trim() || jid.slice(0, jid.indexOf('@')) || jid;
}

// ---- the connection ----

type Pending = { resolve: (answer: XmlElement) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> };

/** A signed-in connection: IQ answers are matched to their questions as they come; everything
 *  else waits in `inbox` for the store to take. */
export class XmppConnection {
  readonly link: XmppLink;
  readonly fullJid: string;
  private pending = new Map<string, Pending>();
  private inbox: XmlElement[] = [];
  private closed = false;
  private onStanza: (() => void) | null = null;
  lastHeard = Date.now();

  private constructor(link: XmppLink, fullJid: string) {
    this.link = link;
    this.fullJid = fullJid;
  }

  /** Connects, signs in and binds a resource. */
  static async open(state: Pick<XmppState, 'jid' | 'password' | 'resource' | 'server' | 'tor'> & { chats?: XmppState['chats'] }, connect: typeof connectXmpp = connectXmpp): Promise<XmppConnection> {
    const domain = domainOf(state.jid);
    const local = state.jid.slice(0, state.jid.indexOf('@'));
    const link = await connect(domain, state.server, xmppTorWay({ tor: state.tor, chats: state.chats ?? {} }));
    try {
      await link.open(domain);
      let features = await expect(link, 'features');
      const offered = children(child(features, 'mechanisms', NS.sasl), 'mechanism').map((m) => textOf(m).trim());
      const mechanism = pickMechanism(offered, link.secure);
      if (!mechanism) throw new XmppError(t('The XMPP server offers no safe way to sign in.'));
      const sasl = startSasl(mechanism, local, state.password);
      await link.send(render(el('auth', { xmlns: NS.sasl, mechanism }, sasl.first || '=')));
      let answered = false;
      // Whether the server proved it knows the password (SCRAM's last step): a success without it
      // is refused, as whoever took the server's place could send one.
      let proved = false;
      for (;;) {
        const step = await expect(link, 'challenge', 'success', 'failure');
        if (step.name === 'failure') {
          const condition = step.children.find((c): c is XmlElement => typeof c !== 'string' && c.name !== 'text')?.name ?? '';
          throw new XmppError(condition === 'not-authorized' ? t('The XMPP server says the name or the password is wrong.') : t('The XMPP server refused the sign-in ({reason}).', { reason: condition || '?' }), condition);
        }
        if (step.name === 'challenge') {
          // A last challenge carries the server's proof, before an empty success.
          if (answered) {
            sasl.finish(textOf(step).trim());
            proved = true;
            await link.send(render(el('response', { xmlns: NS.sasl })));
            continue;
          }
          answered = true;
          await link.send(render(el('response', { xmlns: NS.sasl }, sasl.answer(textOf(step).trim()))));
          continue;
        }
        const last = textOf(step).trim();
        if (mechanism !== 'PLAIN' && !proved && last && last !== '=') {
          sasl.finish(last);
          proved = true;
        }
        if (mechanism !== 'PLAIN' && !proved) throw new XmppError(t('The XMPP server did not prove it knows the password: it may not be the real one.'));
        break;
      }
      await link.open(domain);
      features = await expect(link, 'features');
      if (!child(features, 'bind', NS.bind)) throw new XmppError(t('The XMPP server did not let Erevos in.'));
      const connection = new XmppConnection(link, state.jid);
      connection.pump();
      const bound = await connection.iq('set', undefined, el('bind', { xmlns: NS.bind }, el('resource', {}, state.resource)));
      const fullJid = textOf(find(bound, `bind|${NS.bind}`, 'jid')).trim();
      (connection as { fullJid: string }).fullJid = fullJid || `${state.jid}/${state.resource}`;
      const session = child(features, 'session', NS.session);
      if (session && !child(session, 'optional')) await connection.iq('set', undefined, el('session', { xmlns: NS.session }));
      return connection;
    } catch (error) {
      link.close();
      throw error;
    }
  }

  /** Reads what comes, until the connection closes: answers go to their questions, the rest waits. */
  private pump(): void {
    void (async () => {
      try {
        while (!this.closed) {
          const events = await this.link.read(30_000);
          if (events.length) this.lastHeard = Date.now();
          for (const event of events) {
            if (event.kind === 'close') throw new XmppError(t('The XMPP server closed the connection.'));
            if (event.kind !== 'stanza') continue;
            const stanza = event.element;
            if (stanza.name === 'error' && stanza.ns === NS.streams) {
              const condition = stanza.children.find((c): c is XmlElement => typeof c !== 'string' && c.name !== 'text')?.name ?? '';
              throw new XmppError(condition === 'conflict' ? t('This XMPP account signed in elsewhere as this device.') : t('The XMPP server ended the connection ({reason}).', { reason: condition || '?' }), condition);
            }
            const waiting = stanza.name === 'iq' && (stanza.attrs.type === 'result' || stanza.attrs.type === 'error') ? this.pending.get(stanza.attrs.id ?? '') : undefined;
            if (waiting) {
              this.pending.delete(stanza.attrs.id);
              clearTimeout(waiting.timer);
              if (stanza.attrs.type === 'result') waiting.resolve(stanza);
              else waiting.reject(stanzaError(stanza));
              continue;
            }
            this.inbox.push(stanza);
          }
          if (this.inbox.length) this.onStanza?.();
        }
      } catch (error) {
        this.fail(error instanceof Error ? error : new Error(String(error)));
      }
    })();
  }

  private failure: Error | null = null;

  private fail(error: Error): void {
    if (this.closed) return;
    this.closed = true;
    this.failure = error;
    for (const waiting of this.pending.values()) {
      clearTimeout(waiting.timer);
      waiting.reject(error);
    }
    this.pending.clear();
    this.link.close();
    this.onStanza?.();
  }

  get isOpen(): boolean {
    return !this.closed;
  }

  /** Why it closed, once it has. */
  get error(): Error | null {
    return this.failure;
  }

  /** Called when stanzas wait in the inbox, or the connection closed. */
  listen(onStanza: () => void): void {
    this.onStanza = onStanza;
    if (this.inbox.length || this.closed) onStanza();
  }

  take(): XmlElement[] {
    return this.inbox.splice(0);
  }

  async send(stanza: XmlElement): Promise<void> {
    if (this.closed) throw this.failure ?? new XmppError(t('The connection to the XMPP server is closed.'));
    // Each stanza says its namespace, as XMPP over WebSocket needs (RFC 7395).
    await this.link.send(render(stanza.ns ? stanza : { ...stanza, ns: NS.client }));
  }

  /** An IQ and its answer; an error answer throws, with its condition. */
  iq(type: 'get' | 'set', to: string | undefined, payload: XmlElement, wait = 30_000): Promise<XmlElement> {
    const id = newId();
    return new Promise<XmlElement>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new XmppError(t('The XMPP server did not answer in time.'), 'timeout'));
      }, wait);
      this.pending.set(id, { resolve, reject, timer });
      this.send(el('iq', { xmlns: NS.client, type, id, to }, payload)).catch((error: unknown) => {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    for (const waiting of this.pending.values()) clearTimeout(waiting.timer);
    this.pending.clear();
    this.link.close();
  }
}

/** The next stanza named one of `names` (anything else before it is an error). */
async function expect(link: XmppLink, ...names: string[]): Promise<XmlElement> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const events = await link.read(Math.max(1, deadline - Date.now()));
    for (const event of events) {
      if (event.kind === 'close') throw new XmppError(t('The XMPP server closed the connection.'));
      if (event.kind !== 'stanza') continue;
      if (event.element.name === 'error' && event.element.ns === NS.streams) {
        const condition = event.element.children.find((c): c is XmlElement => typeof c !== 'string' && c.name !== 'text')?.name ?? '';
        throw new XmppError(t('The XMPP server ended the connection ({reason}).', { reason: condition || '?' }), condition);
      }
      if (names.includes(event.element.name)) return event.element;
    }
  }
  throw new XmppError(t('The XMPP server did not answer in time.'), 'timeout');
}

function stanzaError(stanza: XmlElement): XmppError {
  const error = child(stanza, 'error');
  const condition = error?.children.find((c): c is XmlElement => typeof c !== 'string' && c.ns === NS.stanzas && c.name !== 'text')?.name ?? '';
  const text = textOf(child(error, 'text', NS.stanzas)).trim();
  return new XmppError(text || t('The XMPP server refused the request ({reason}).', { reason: condition || '?' }), condition);
}

// ---- signing in ----

/** Signs in for the first time: answers the account, with this device's new OMEMO keys; `tor`, its Tor choice from the start. */
export async function signInXmpp(jid: string, password: string, server?: XmppServer, connect?: typeof connectXmpp, tor: AccountTor = 'never'): Promise<{ state: XmppState; connection: XmppConnection }> {
  const account = bare(jid.trim());
  if (!isXmppId(account)) throw new XmppError(t('Write an XMPP address, such as name@example.org.'));
  const resource = `Erevos.${toHex(randomBytes(3))}`;
  const connection = await XmppConnection.open({ jid: account, password, resource, server, tor }, connect);
  try {
    const state: XmppState = { jid: account, password, resource, server, omemo: await newOwnOmemo(), people: {}, chats: {}, roster: {}, requests: [], seen: [], tor };
    return { state, connection };
  } catch (error) {
    connection.close();
    throw error;
  }
}

const NS_REGISTER = 'jabber:iq:register';

/** Why a new account could not be made, and, when the server named one, the page where it can be. */
export class XmppRegisterError extends XmppError {
  readonly page?: string;

  constructor(message: string, condition: string, page?: string) {
    super(message, condition);
    this.page = page;
  }
}

/**
 * Makes a new account on its server before signing in (XEP-0077, In-Band Registration), over the
 * same encrypted connection a sign-in has, then signs in to it as signInXmpp does. A server that
 * asks for more than a name and a password, such as a captcha, or makes accounts only on its
 * website, is said so, with its page when it names one.
 */
export async function registerXmpp(jid: string, password: string, server?: XmppServer, connect: typeof connectXmpp = connectXmpp, tor: AccountTor = 'never'): Promise<{ state: XmppState; connection: XmppConnection }> {
  const account = bare(jid.trim());
  if (!isXmppId(account)) throw new XmppError(t('Write an XMPP address, such as name@example.org.'));
  if (password.length < 8) throw new XmppError(t('Choose a password of at least 8 characters.'));
  const domain = domainOf(account);
  const local = account.slice(0, account.indexOf('@'));
  const link = await connect(domain, server, tor);
  try {
    if (!link.secure) throw new XmppError(t('The XMPP server offers no safe way to sign in.'));
    await link.open(domain);
    await expect(link, 'features');
    const ask = async (type: 'get' | 'set', ...payload: XmlElement[]): Promise<XmlElement> => {
      const id = newId();
      await link.send(render(el('iq', { xmlns: NS.client, type, id, to: domain }, el('query', { xmlns: NS_REGISTER }, ...payload))));
      for (;;) {
        const answer = await expect(link, 'iq');
        if (answer.attrs.id !== id) continue;
        if (answer.attrs.type === 'result') return answer;
        const failed = stanzaError(answer);
        const page = textOf(find(answer, `query|${NS_REGISTER}`, 'x|jabber:x:oob', 'url')).trim();
        const reason =
          failed.condition === 'conflict'
            ? t('That name is someone\u2019s already on this server.')
            : failed.condition === 'not-allowed' || failed.condition === 'service-unavailable' || failed.condition === 'feature-not-implemented'
              ? t('This XMPP server makes no accounts here. Make one on its website, then sign in here.')
              : failed.message;
        throw new XmppRegisterError(reason, failed.condition, /^https:\/\//.test(page) ? page : undefined);
      }
    };
    const form = child(await ask('get'), 'query', NS_REGISTER);
    const page = textOf(find(form, 'x|jabber:x:oob', 'url')).trim();
    const data = child(form, 'x', NS_DATA);
    // What it asks for besides a name and a password, as a form (a captcha, an e-mail address), Erevos cannot give here.
    const asked = data
      ? children(data, 'field').filter((f) => f.attrs.type !== 'hidden' && f.attrs.type !== 'fixed' && !['username', 'password'].includes(f.attrs.var ?? '') && child(f, 'required'))
      : children(form).filter((f) => !['username', 'password', 'instructions', 'registered', 'x'].includes(f.name));
    if (!child(form, 'username') && !data) throw new XmppRegisterError(t('This XMPP server makes no accounts here. Make one on its website, then sign in here.'), 'not-allowed', /^https:\/\//.test(page) ? page : undefined);
    if (asked.length) throw new XmppRegisterError(t('This XMPP server asks for more than a name and a password, such as a captcha. Make the account on its website, then sign in here.'), 'not-acceptable', /^https:\/\//.test(page) ? page : undefined);
    if (data) {
      const type = textOf(child(children(data, 'field').find((f) => f.attrs.var === 'FORM_TYPE'), 'value'));
      await ask(
        'set',
        el(
          'x',
          { xmlns: NS_DATA, type: 'submit' },
          type ? el('field', { var: 'FORM_TYPE', type: 'hidden' }, el('value', {}, type)) : null,
          el('field', { var: 'username' }, el('value', {}, local)),
          el('field', { var: 'password' }, el('value', {}, password)),
        ),
      );
    } else await ask('set', el('username', {}, local), el('password', {}, password));
  } finally {
    link.close();
  }
  return signInXmpp(account, password, server, connect, tor);
}

/** Gives the account a new password (XEP-0077): the server takes it at once, and the next sign-in needs it. */
export async function changeXmppPassword(state: XmppState, connection: XmppConnection, password: string): Promise<void> {
  if (password.length < 8) throw new XmppError(t('Choose a password of at least 8 characters.'));
  const local = state.jid.slice(0, state.jid.indexOf('@'));
  await connection.iq('set', domainOf(state.jid), el('query', { xmlns: NS_REGISTER }, el('username', {}, local), el('password', {}, password)));
  state.password = password;
}

/** Deletes the account on its server (XEP-0077): its contacts, archive and groups go with it there, and it cannot be brought back. */
export async function deleteXmppAccount(state: XmppState, connection: XmppConnection): Promise<void> {
  await connection.iq('set', domainOf(state.jid), el('query', { xmlns: NS_REGISTER }, el('remove')));
  connection.close();
}

// ---- after signing in ----

const CAPS_NODE = 'https://erevos-web.lphl.nekten.eu';
// Calls (lib/xmpp-calls.ts) as Conversations looks for them before it shows its call buttons.
const CALL_FEATURES = [
  NS.jmi,
  NS.jingle,
  'urn:xmpp:jingle:apps:rtp:1',
  'urn:xmpp:jingle:apps:rtp:audio',
  'urn:xmpp:jingle:apps:rtp:video',
  'urn:xmpp:jingle:transports:ice-udp:1',
  'urn:xmpp:jingle:apps:dtls:0',
];
// `+notify` asks for changes of the device lists, of the account's own bookmarks (its groups), and
// of profile pictures.
const FEATURES = [NS.caps, NS.discoInfo, NS.receipts, NS.markers, NS.ping, `${DEVICES_NODE}+notify`, `${DEVICES2_NODE}+notify`, `${NS.bookmarks}+notify`, `${NS_AVATAR_META}+notify`, 'http://jabber.org/protocol/muc', ...CALL_FEATURES].sort();

/** Entity capabilities (XEP-0115): what this app can do, as a hash its contacts' servers know. */
export function capsVer(): string {
  const text = `client/phone//Erevos<${FEATURES.map((f) => `${f}<`).join('')}`;
  return toBase64(sha1(utf8Encode(text)));
}

/** What comes after signing in: the contacts, carbons, this device's OMEMO keys on the server,
 *  presence, what the archive holds that this device has not seen, and the groups. */
export async function startSession(state: XmppState, connection: XmppConnection): Promise<void> {
  const roster = await connection.iq('get', undefined, el('query', { xmlns: NS.roster }));
  takeRoster(state, child(roster, 'query', NS.roster), true);
  forgetPresence(state);
  await connection.iq('set', undefined, el('enable', { xmlns: NS.carbons })).catch(() => undefined);
  // Whom the account blocks, as its other apps may have changed it; a server without blocking keeps none.
  const blocklist = await connection.iq('get', undefined, el('blocklist', { xmlns: NS.blocking })).catch(() => null);
  if (blocklist) takeBlocked(state, child(blocklist, 'blocklist', NS.blocking), 'block', true);
  await publishOmemo(state, connection).catch(() => undefined);
  await connection.send(el('presence', {}, el('c', { xmlns: NS.caps, hash: 'sha-1', node: CAPS_NODE, ver: capsVer() })));
  // To those it appears offline to, at once after (RFC 6121 directed presence, lib/xmpp-rules.ts).
  for (const jid of state.unseenBy ?? []) await connection.send(el('presence', { to: jid, type: 'unavailable' })).catch(() => undefined);
  await fetchArchive(state, connection);
  await enterRooms(state, connection);
}

/** Makes sure this device is in the account's OMEMO device lists, and its bundles are on the server:
 *  OMEMO 2's even when OMEMO 0.3's cannot be, and the other way round. */
export async function publishOmemo(state: XmppState, connection: XmppConnection): Promise<void> {
  try {
    await publishOmemo1(state, connection);
  } finally {
    await publishOmemo2(state, connection).catch(() => undefined);
  }
  // The device it was before a restore is off the lists now; its OMEMO 2 bundle goes too.
  for (const old of state.omemo.gone ?? []) {
    await connection.iq('set', undefined, el('pubsub', { xmlns: 'http://jabber.org/protocol/pubsub' }, el('retract', { node: BUNDLES2_NODE, notify: 'true' }, el('item', { id: String(old) })))).catch(() => undefined);
  }
  delete state.omemo.gone;
}

/**
 * After a backup was restored here, this device goes on as a new device of the account (docs/xmpp.md).
 * Its conversations as the backup kept them would use again message keys used since, which the others
 * refuse, and the phone it was made on may still be using its device id and its resource. So it keeps
 * the account, the contacts, the chats and the keys it knows of others, and its identity, so their
 * apps still know its key; it takes a new device id, resource, signed pre-keys and one-time pre-keys,
 * begins every conversation again, and takes the old device off the account's lists once connected.
 */
export async function renewDevice(state: XmppState): Promise<void> {
  const own = state.omemo;
  const old = own.device;
  let device = old;
  while (device === old) device = (new DataView(randomBytes(4).buffer).getUint32(0) % (2 ** 31 - 1)) + 1;
  const signedPreKey = await omemoCall<SignedPreKey>({ op: 'signed_pre_key_new', identity: own.identity, id: own.signedPreKey.id + 1 });
  const { pre_keys } = await omemoCall<{ pre_keys: PreKey[] }>({ op: 'pre_keys_new', start: own.nextPreKey, count: PRE_KEYS });
  state.omemo = { device, identity: own.identity, signedPreKey, preKeys: pre_keys, nextPreKey: own.nextPreKey + PRE_KEYS, published: false, gone: [...(own.gone ?? []), old] };
  if (state.omemo2) state.omemo2 = await newOwnOmemo2(own.identity);
  state.resource = `Erevos.${toHex(randomBytes(3))}`;
  for (const people of [state.people, state.people2 ?? {}]) {
    delete people[state.jid]?.devices[String(old)];
    for (const person of Object.values(people)) {
      for (const known of Object.values(person.devices)) {
        delete known.session;
        delete known.failedAt;
      }
      // Their lists are asked for again, with the bundles of their devices.
      person.fetchedAt = 0;
    }
  }
}

async function publishOmemo1(state: XmppState, connection: XmppConnection): Promise<void> {
  const own = state.omemo;
  let listed: number[] = [];
  try {
    listed = devicesOf(itemOf(await connection.iq('get', state.jid, itemsElement(DEVICES_NODE)), 'list'));
  } catch (error) {
    // No list yet: one is made.
    if (!(error instanceof XmppError) || error.condition !== 'item-not-found') throw error;
  }
  takeDeviceList(state, state.jid, listed);
  if (!own.published) await publishWithFallback(connection, bundleNode(own.device), bundleElement(own));
  const gone = own.gone ?? [];
  if (!listed.includes(own.device) || listed.some((d) => gone.includes(d))) {
    await publishWithFallback(connection, DEVICES_NODE, deviceListElement([...listed.filter((d) => d !== own.device && !gone.includes(d)), own.device]));
  }
  own.published = true;
}

/** The same for OMEMO 2, made for this device the first time. Its bundles share one node, an item
 *  each, so the node is asked to keep many (some servers allow fewer). */
async function publishOmemo2(state: XmppState, connection: XmppConnection): Promise<void> {
  if (!state.omemo2) {
    const made = await newOwnOmemo2(state.omemo.identity);
    state.omemo2 ??= made;
  }
  const own = state.omemo2;
  const device = state.omemo.device;
  let list: XmlElement | undefined;
  try {
    list = itemOf(await connection.iq('get', state.jid, itemsElement(DEVICES2_NODE)), 'devices', OMEMO2);
  } catch (error) {
    if (!(error instanceof XmppError) || error.condition !== 'item-not-found') throw error;
  }
  takeDeviceList(state, state.jid, devices2Of(list), true);
  if (!own.published) {
    for (const [i, most] of BUNDLE_ITEMS.entries()) {
      try {
        await connection.iq('set', undefined, publish2Element(BUNDLES2_NODE, bundle2Element(own), String(device), most));
        break;
      } catch (error) {
        if (i === BUNDLE_ITEMS.length - 1 || !(error instanceof XmppError) || !['precondition-not-met', 'not-acceptable', 'bad-request', 'policy-violation'].includes(error.condition)) throw error;
      }
    }
  }
  const gone = state.omemo.gone ?? [];
  const listed = devices2Of(list);
  if (!listed.includes(device) || listed.some((d) => gone.includes(d))) {
    const kept = gone.reduce<XmlElement | undefined>((left, old) => devices2With(left, old, false), list);
    await publishWithFallback(connection, DEVICES2_NODE, devices2With(kept, device));
  }
  own.published = true;
  // From now on OMEMO 2 is written to the devices that have it.
  own.live = true;
}

/** Publishes as open to all; a server that does not take publish options gets it without them. */
async function publishWithFallback(connection: XmppConnection, node: string, item: XmlElement): Promise<void> {
  try {
    await connection.iq('set', undefined, publishElement(node, item));
  } catch (error) {
    if (error instanceof XmppError && (error.condition === 'precondition-not-met' || error.condition === 'feature-not-implemented' || error.condition === 'bad-request')) {
      await connection.iq('set', undefined, publishElement(node, item, 'current', false));
    } else throw error;
  }
}

/** Fetches what the archive has after the last message seen, or the newest page the first time. */
export async function fetchArchive(state: XmppState, connection: XmppConnection): Promise<void> {
  for (let page = 0; page < MOST_PAGES; page++) {
    const set = el('set', { xmlns: NS.rsm }, el('max', {}, '50'), state.archived ? el('after', {}, state.archived) : el('before'));
    let fin: XmlElement | undefined;
    try {
      fin = child(await connection.iq('set', undefined, el('query', { xmlns: NS.mam, queryid: newId() }, set), 60_000), 'fin', NS.mam);
    } catch (error) {
      // An archive id the server no longer has: start again from its newest page.
      if (error instanceof XmppError && error.condition === 'item-not-found' && state.archived) {
        state.archived = undefined;
        continue;
      }
      return;
    }
    const last = textOf(find(fin, `set|${NS.rsm}`, 'last')).trim();
    const first = !state.archived;
    if (last) state.archived = last;
    if (first || fin?.attrs.complete === 'true' || !last) return;
  }
}

// ---- what comes ----

/** What calls need of what comes (lib/xmpp-calls.ts): the messages that ring and answer a call
 *  (XEP-0353), and Jingle's questions (XEP-0166), which the hook answers; and for group calls
 *  (lib/xmpp-muji.ts), their invitations (XEP-0482) and the presence of their rooms (XEP-0272). */
export type CallHook = {
  /** A call message: `mine` when it is from this account, as a carbon of another device's or the
   *  accept it tells its devices; `live` unless it came from the archive. */
  message(state: XmppState, connection: XmppConnection, message: XmlElement, how: { at: number; live: boolean; mine: boolean }): void;
  iq(state: XmppState, connection: XmppConnection, iq: XmlElement): Promise<void>;
  /** A group call's invitation, or an answer to one, from a person or in a group; `live` unless it
   *  came from an archive or a group's history. */
  invite?(state: XmppState, connection: XmppConnection, message: XmlElement, how: { at: number; live: boolean }): void;
  /** A presence: true when it is of a group call's room, and so taken. */
  presence?(state: XmppState, connection: XmppConnection, presence: XmlElement): boolean;
};

/** A group call's invitation, or an answer to one (XEP-0482, and the older form), in `message`. */
const callInviteOf = (message: XmlElement) => message.children.find((c): c is XmlElement => typeof c !== 'string' && (c.ns === NS.callInvites || c.ns === NS.callMessage));

let callHook: CallHook | null = null;

/** Who hears of calls: lib/xmpp-calls.ts, or none (then a Jingle question is said no to). */
export function setCallHook(hook: CallHook | null): void {
  callHook = hook;
}

export type Taken = {
  /** Chats that changed. */
  chats: string[];
  /** This device used up pre-keys: its bundle goes to the server again. */
  republish: boolean;
};

/** Takes one stanza that came: messages, carbons, archived messages, receipts, contacts, OMEMO
 *  device lists, and questions to answer. */
export async function takeStanza(state: XmppState, connection: XmppConnection, stanza: XmlElement, taken: Taken): Promise<void> {
  const from = stanza.attrs.from ?? '';
  if (stanza.name === 'iq') return answerIq(state, connection, stanza, taken);
  if (stanza.name === 'presence') {
    if (callHook?.presence?.(state, connection, stanza)) return;
    if (await takeRoomPresence(state, connection, stanza, taken)) return;
    return takePresence(state, connection, stanza);
  }
  if (stanza.name !== 'message') return;
  const ownServer = !from || bare(from) === state.jid || from === domainOf(state.jid);
  // An archived message, fetched by fetchArchive, or from a group's own archive.
  const result = child(stanza, 'result', NS.mam);
  if (result && (ownServer || (!from.includes('/') && roomOf(state, from)))) {
    const forwarded = child(result, 'forwarded', NS.forward);
    const inner = child(forwarded, 'message', NS.client) ?? child(forwarded, 'message');
    const how = { at: stampOf(forwarded), archiveId: result.attrs.id, live: false };
    if (inner && !ownServer) await takeGroupMessage(state, connection, inner, how, taken);
    else if (inner) await takeMessage(state, connection, inner, how, taken);
    return;
  }
  // A carbon: a message of ours sent from another device, or one to another of our devices.
  const carbon = child(stanza, 'sent', NS.carbons) ?? child(stanza, 'received', NS.carbons);
  if (carbon) {
    if (bare(from) !== state.jid) return; // Only our own server may send carbons.
    const inner = child(child(carbon, 'forwarded', NS.forward), 'message', NS.client) ?? child(child(carbon, 'forwarded', NS.forward), 'message');
    if (inner) await takeMessage(state, connection, inner, { at: Date.now(), live: true }, taken);
    return;
  }
  const event = child(stanza, 'event', NS.pubsubEvent);
  if (event) {
    const items = child(event, 'items');
    // The account's groups changed in another of its apps.
    if (items?.attrs.node === NS.bookmarks && bare(from || state.jid) === state.jid) {
      await takeBookmarks(state, connection, items, taken);
      return;
    }
    if (items?.attrs.node === NS_AVATAR_META && from) {
      const item = children(items, 'item').at(-1);
      if (item) takeAvatar(state, bare(from), avatarOf(child(item, 'metadata', NS_AVATAR_META)));
      return;
    }
    if (items?.attrs.node === DEVICES_NODE && from) {
      takeDeviceList(state, bare(from), devicesOf(itemOf(stanza, 'list')));
      if (bare(from) === state.jid && !devicesOf(itemOf(stanza, 'list')).includes(state.omemo.device)) {
        // Our device fell out of our own list (another app wrote it): it goes back in.
        await publishOmemo(state, connection).catch(() => undefined);
      }
    }
    if (items?.attrs.node === DEVICES2_NODE && from) {
      const ids = devices2Of(itemOf(stanza, 'devices', OMEMO2));
      takeDeviceList(state, bare(from), ids, true);
      if (bare(from) === state.jid && state.omemo2?.live && !ids.includes(state.omemo.device)) await publishOmemo(state, connection).catch(() => undefined);
    }
    return;
  }
  if (stanza.attrs.type === 'groupchat') {
    await takeGroupMessage(state, connection, stanza, { at: stampOf(stanza), live: true }, taken);
    return;
  }
  await takeMessage(state, connection, stanza, { at: stampOf(stanza), live: true }, taken);
}

function takeAvatar(state: XmppState, jid: string, avatar: XmppAvatar | null): void {
  const avatars = (state.avatars ??= {});
  if (avatar) avatars[jid] = avatar;
  else delete avatars[jid];
}

function stampOf(element: XmlElement | undefined): number {
  const stamp = child(element, 'delay', NS.delay)?.attrs.stamp;
  const at = stamp ? Date.parse(stamp) : NaN;
  return Number.isFinite(at) ? at : Date.now();
}

function remember(state: XmppState, key: string): boolean {
  if (state.seen.includes(key)) return false;
  state.seen.push(key);
  if (state.seen.length > KEEP_SEEN) state.seen.splice(0, state.seen.length - KEEP_SEEN);
  return true;
}

function chatOf(state: XmppState, jid: string): XmppChat {
  return (state.chats[jid] ??= { jid, messages: [], unread: 0, lastAt: 0 });
}

/**
 * The chat is read up to `at`, here or on another device of the account: only what came after
 * still counts as not read, and nothing from before is counted again.
 */
export function readUpTo(chat: XmppChat, at: number): void {
  chat.readAt = Math.max(chat.readAt ?? 0, at);
  const after = chat.messages.filter((m) => !m.mine && m.at > chat.readAt!).length;
  chat.unread = Math.min(chat.unread, after);
}

function addMessage(chat: XmppChat, message: XmppMessage): void {
  chat.messages.push(message);
  chat.messages.sort((a, b) => a.at - b.at);
  if (chat.messages.length > KEEP_MESSAGES) chat.messages.splice(0, chat.messages.length - KEEP_MESSAGES);
  chat.lastAt = Math.max(chat.lastAt, message.at);
}

/**
 * A reaction or a taking back (lib/xmpp-actions.ts), from `by` (who reacts) written by `writer`
 * (who may take back only their own): put on the message it names, in a chat already here. Says
 * whether the stanza was one, so nothing else is made of it.
 */
function takeAction(state: XmppState, message: XmlElement, jid: string, group: boolean, writer: Writer, by: string, taken: Taken): boolean {
  const chat = state.chats[jid];
  const reactions = reactionsOf(message);
  if (reactions) {
    const target = chat ? targetOf(chat.messages, reactions.id, group) : undefined;
    if (target && react(target, by, reactions.emojis)) taken.chats.push(jid);
    return true;
  }
  const gone = retractOf(message);
  if (gone) {
    const target = chat ? targetOf(chat.messages, gone, group) : undefined;
    if (target && wroteIt(target, writer, group) && retract(target)) taken.chats.push(jid);
    return true;
  }
  return false;
}

/** New words for a message here of the same writer (XEP-0308): put in it. Says whether it was one. */
function takeChange(chat: XmppChat, message: XmlElement, text: string, at: number, group: boolean, writer: Writer): boolean {
  const replaced = replaceOf(message);
  const target = replaced ? targetOf(chat.messages, replaced, group) : undefined;
  if (!target || target.deleted || target.file || target.locked || !wroteIt(target, writer, group) || fileOfText(text)) return false;
  if (target.text !== text) {
    target.text = text;
    target.edited = at;
  }
  return true;
}

// Who is writing now, by chat, and when they said it: kept here only.
const typingAt = new Map<string, number>();
const typingListeners = new Set<() => void>();
/** How long one shows as writing after they said it, unless they say they stopped. */
export const TYPING_SHOWS = 30_000;

function setTyping(jid: string, typing: boolean): void {
  const was = typingAt.has(jid);
  if (typing) typingAt.set(jid, Date.now());
  else typingAt.delete(jid);
  if (was !== typing || typing) typingListeners.forEach((listener) => listener());
}

/** Whether the person of a chat is writing now, as their app says. */
export function xmppTyping(jid: string, now = Date.now()): boolean {
  const at = typingAt.get(jid);
  return at !== undefined && now - at < TYPING_SHOWS;
}

/** Told each time someone starts or stops writing. */
export function onXmppTyping(listener: () => void): () => void {
  typingListeners.add(listener);
  return () => typingListeners.delete(listener);
}

/**
 * Tells a contact we write, or stopped, when the account says so (state.sayTyping): only in a chat
 * with one person who may see our presence and to whom we do not appear offline (lib/xmpp-rules.ts),
 * never in a group, and never kept by the server.
 */
export async function sendXmppTyping(state: XmppState, connection: XmppConnection, peer: string, typing: boolean): Promise<boolean> {
  if (!state.sayTyping || state.chats[peer]?.room || state.blocked?.includes(peer) || state.unseenBy?.includes(peer.toLowerCase())) return false;
  if (!['both', 'from'].includes(state.roster[peer]?.subscription ?? '')) return false;
  await connection.send(el('message', { to: peer, type: 'chat', id: newId() }, el(typing ? 'composing' : 'paused', { xmlns: NS_CHATSTATES }), el('no-store', { xmlns: NS.hints })));
  return true;
}

async function takeMessage(state: XmppState, connection: XmppConnection, message: XmlElement, how: { at: number; archiveId?: string; live: boolean }, taken: Taken): Promise<void> {
  const type = message.attrs.type ?? 'normal';
  if (type === 'groupchat' || type === 'headline') return;
  // An invitation to a group: kept to answer, not a chat message.
  if (takeInvite(state, message)) {
    if (how.archiveId) state.archived = how.archiveId;
    taken.chats.push('');
    return;
  }
  // An error from a group, about a message of ours there.
  if (type === 'error' && roomOf(state, message.attrs.from ?? '')) {
    const chat = state.chats[bare(message.attrs.from ?? '')];
    const failed = chat.messages.find((m) => m.mine && m.id === message.attrs.id);
    if (failed) {
      failed.state = 'failed';
      taken.chats.push(chat.jid);
    }
    return;
  }
  const from = bare(message.attrs.from ?? state.jid);
  const to = bare(message.attrs.to ?? state.jid);
  const mine = from === state.jid;
  // A call rung, answered or ended (XEP-0353): for the calls, once, and not a chat message.
  const call = message.children.find((c): c is XmlElement => typeof c !== 'string' && c.ns === NS.jmi);
  if (call) {
    if (how.archiveId) state.archived = how.archiveId;
    if (callHook && remember(state, `call|${message.attrs.from ?? ''}|${call.name}|${call.attrs.id ?? ''}`)) callHook.message(state, connection, message, { at: how.at, live: how.live, mine });
    return;
  }
  // A group call's invitation, or an answer to one: for the group calls, once.
  const invite = callInviteOf(message);
  if (invite) {
    if (how.archiveId) state.archived = how.archiveId;
    if (callHook?.invite && remember(state, `call|${message.attrs.from ?? ''}|${invite.name}|${invite.attrs.id ?? ''}`)) callHook.invite(state, connection, message, { at: how.at, live: how.live && !child(message, 'delay', NS.delay) });
    return;
  }
  const peer = mine ? to : from;
  if (!peer.includes('@') || peer === state.jid) return;
  // From someone blocked, as the archive may still give it: nothing.
  if (!mine && isBlocked(state, peer)) return;
  const id = message.attrs.id ?? '';
  const originId = child(message, 'origin-id', NS.sid)?.attrs.id;
  if (how.archiveId) state.archived = how.archiveId;

  if (type === 'error') {
    const chat = state.chats[peer];
    const failed = chat?.messages.find((m) => m.mine && m.id === id);
    if (failed) {
      failed.state = 'failed';
      taken.chats.push(peer);
    }
    return;
  }
  // Receipts and read marks for our messages.
  const receipt = child(message, 'received', NS.receipts)?.attrs.id ?? child(message, 'received', NS.markers)?.attrs.id;
  const displayed = child(message, 'displayed', NS.markers)?.attrs.id;
  // Another device of ours read the chat up to that message (its read mark, as a carbon): so it
  // is read here too, all but what came after it.
  if (displayed && mine) {
    const chat = state.chats[peer];
    if (chat) {
      // The message it names; one not here (gone from this phone, or named otherwise) by the time of
      // the mark itself: everything before it was read.
      const named = chat.messages.find((m) => !m.mine && m.id === displayed);
      readUpTo(chat, named ? named.at : how.at);
      taken.chats.push(peer);
    }
  }
  for (const [mark, state2] of [
    [receipt, 'received'],
    [displayed, 'read'],
  ] as const) {
    if (!mark || mine) continue;
    const chat = state.chats[peer];
    const target = chat?.messages.find((m) => m.mine && m.id === mark);
    if (target && target.state !== 'read') {
      target.state = state2;
      // Read marks mean everything before was read too.
      if (state2 === 'read') for (const m of chat.messages) if (m.mine && m.at <= target.at && m.state !== 'failed') m.state = 'read';
      taken.chats.push(peer);
    }
  }

  // A reaction, or a message taken back: about a message already here, never a message of its own.
  if (takeAction(state, message, peer, false, { mine }, mine ? state.jid : peer, taken)) return;
  // Whether they are writing: shown a while (xmppTyping), never kept.
  const typing = mine ? null : typingOf(message);
  if (typing !== null) setTyping(peer, typing);

  const encrypted = encryptedOf(state, message);
  const body = textOf(child(message, 'body')).trim();
  // A file sent as it is names its link out of band too (XEP-0066); an encrypted one only in its text.
  const oob = encrypted ? undefined : textOf(child(child(message, 'x', NS_OOB), 'url')).trim() || undefined;
  if (!encrypted && !body) return;
  if ((originId || id) && !remember(state, `${from}|${originId || id}`)) return;
  // Whom an OMEMO 2 envelope must say it is for.
  const to2 = mine ? peer : state.jid;

  // An OMEMO message without a payload only moves the ratchet on (or carries a key for
  // something else): it is read, when it is for this device, and never shown.
  if (encrypted && !child(encrypted, 'payload', encrypted.ns)) {
    if (!mine) await openOmemo(state, connection, from, encrypted, taken, how.live, to2);
    return;
  }
  let text = body;
  let locked = false;
  if (encrypted) {
    const opened = await openOmemo(state, connection, from, encrypted, taken, how.live, to2);
    if (opened === 'empty') return;
    if (opened === null) {
      // Our own message from this device, archived: nothing in it is for this device.
      if (mine && state.chats[peer]?.messages.some((m) => m.id === (originId || id))) return;
      locked = true;
      text = '';
    } else text = opened;
  }
  const chat = chatOf(state, peer);
  if ((originId || id) && chat.messages.some((m) => m.id === (originId || id) && m.mine === mine)) return;
  const answers = replyOf(message);
  if (answers && !locked) text = withoutQuote(message, text);
  if (!mine) setTyping(peer, false);
  // New words for a message of the same writer: it changes, and nothing new comes. One whose
  // message is not here shows as a message of its own.
  if (!locked && takeChange(chat, message, text, how.at, false, { mine })) {
    taken.chats.push(peer);
    return;
  }
  const markable = !mine && child(message, 'markable', NS.markers) ? (message.attrs.from ?? from) : undefined;
  const file = locked ? null : fileOfText(text, oob);
  addMessage(chat, {
    id: originId || id || newId(),
    mine,
    text: file ? '' : text,
    at: how.at,
    encrypted: Boolean(encrypted),
    locked: locked || undefined,
    state: mine ? 'sent' : undefined,
    markable,
    ...(file ? { file } : {}),
    ...(answers ? { replyTo: targetOf(chat.messages, answers, false)?.id ?? answers } : {}),
    ...(!encrypted && !file && previewOf(message) ? { preview: previewOf(message)! } : {}),
    ...(!encrypted && child(message, 'forwarded', NS.forward) ? { forwarded: true as const } : {}),
  });
  // One from before what was read already (the archive again after a restart, a message deleted
  // here coming back) is not new.
  if (mine) readUpTo(chat, how.at);
  else if (how.at > (chat.readAt ?? 0)) chat.unread += 1;
  taken.chats.push(peer);
  // A receipt, when they asked and they are among the contacts (others do not learn we are here),
  // and we do not appear offline to them (lib/xmpp-rules.ts).
  if (how.live && !mine && id && child(message, 'request', NS.receipts) && ['both', 'from'].includes(state.roster[peer]?.subscription ?? '') && !state.unseenBy?.includes(peer.toLowerCase())) {
    await connection.send(el('message', { to: message.attrs.from, id: newId() }, el('received', { xmlns: NS.receipts, id }))).catch(() => undefined);
  }
}

/**
 * Takes a message of a group the account is in, as it comes or from the group's archive: who
 * wrote it, by their name there; opened with OMEMO by the device that wrote it, whoever that is
 * among the members, in a private group. Our own come back as the room passes them on: one sent
 * from here is already in the chat; one from another of our devices is ours. In a private group
 * every message from someone else counts as not read; in a channel, only those that name us.
 */
async function takeGroupMessage(state: XmppState, connection: XmppConnection, message: XmlElement, how: { at: number; archiveId?: string; live: boolean }, taken: Taken): Promise<void> {
  const from = message.attrs.from ?? '';
  const jid = bare(from);
  const chat = state.chats[jid];
  const room = chat?.room;
  if (!room || message.attrs.type !== 'groupchat') return;
  if (how.archiveId) room.archived = how.archiveId;
  const slash = from.indexOf('/');
  const nick = slash >= 0 ? from.slice(slash + 1) : '';
  // A call in the group, or an answer to one: for the group calls, once, and not a chat message.
  const invite = callInviteOf(message);
  if (invite) {
    if (nick && callHook?.invite && remember(state, `call|${from}|${invite.name}|${invite.attrs.id ?? ''}`)) callHook.invite(state, connection, message, { at: how.at, live: how.live && !child(message, 'delay', NS.delay) });
    return;
  }
  const encrypted = encryptedOf(state, message);
  const body = textOf(child(message, 'body')).trim();
  const subject = child(message, 'subject');
  if (subject && !body && !encrypted) {
    room.subject = textOf(subject).trim().slice(0, 300) || undefined;
    taken.chats.push(jid);
    return;
  }
  // The room's own words (as "this room is now archived") have no one who wrote them. One that
  // says its settings changed (104) has its name and description read again.
  if (!nick) {
    if (how.live && children(child(message, 'x', NS_MUC_USER), 'status').some((s) => s.attrs.code === '104')) {
      await refreshRoom(connection, room, jid).catch(() => undefined);
      taken.chats.push(jid);
    }
    return;
  }
  const stanzaId = children(message, 'stanza-id', NS.sid).find((s) => bare(s.attrs.by ?? '') === jid)?.attrs.id || how.archiveId;
  const ownId = child(message, 'origin-id', NS.sid)?.attrs.id || message.attrs.id || '';
  // One sent from here, back from the room.
  const sentHere = ownId ? chat.messages.find((m) => m.mine && m.id === ownId) : undefined;
  const keys = [stanzaId ? `${jid}|${stanzaId}` : '', ownId ? `${from}|${ownId}` : ''].filter(Boolean);
  const seen = keys.some((key) => state.seen.includes(key));
  for (const key of keys) remember(state, key);
  if (sentHere) {
    if (sentHere.state === 'sending') sentHere.state = 'sent';
    // The room's id for it, which reactions and answers to it name.
    if (stanzaId && !sentHere.sid) {
      sentHere.sid = stanzaId;
      taken.chats.push(jid);
    }
    return;
  }
  if (seen) return;
  const item = child(child(message, 'x', 'http://jabber.org/protocol/muc#user'), 'item');
  const real = room.occupants[nick] || bare(item?.attrs.jid ?? '');
  const writer = real.includes('@') ? real : '';
  const mine = writer ? writer === state.jid : nick === room.nick;
  const said: Writer = { mine, ...(writer ? { who: writer } : {}), nick };
  if (takeAction(state, message, jid, true, said, mine ? state.jid : writer || `/${nick}`, taken)) return;
  if (!encrypted && !body) return;
  if (encrypted && !child(encrypted, 'payload', encrypted.ns)) {
    const sender = mine ? state.jid : writer || (await senderOf(state, connection, room, encrypted));
    if (sender && !mine) await openOmemo(state, connection, sender, encrypted, taken, how.live, jid);
    return;
  }
  let text = body;
  let locked = false;
  if (encrypted) {
    const sender = mine ? state.jid : writer || (await senderOf(state, connection, room, encrypted));
    const opened = sender ? await openOmemo(state, connection, sender, encrypted, taken, how.live, jid) : null;
    if (opened === 'empty') return;
    if (opened === null) {
      locked = true;
      text = '';
    } else text = opened;
  }
  const answers = replyOf(message);
  if (answers && !locked) text = withoutQuote(message, text);
  if (!locked && takeChange(chat, message, text, how.at, true, said)) {
    taken.chats.push(jid);
    return;
  }
  const oob = encrypted ? undefined : textOf(child(child(message, 'x', NS_OOB), 'url')).trim() || undefined;
  const file = locked ? null : fileOfText(text, oob);
  addMessage(chat, {
    id: ownId || stanzaId || newId(),
    mine,
    text: file ? '' : text,
    at: how.at,
    encrypted: Boolean(encrypted),
    locked: locked || undefined,
    state: mine ? 'sent' : undefined,
    by: nick.slice(0, 100),
    ...(writer ? { who: writer } : {}),
    ...(stanzaId ? { sid: stanzaId } : {}),
    ...(file ? { file } : {}),
    ...(answers ? { replyTo: targetOf(chat.messages, answers, true)?.id ?? answers } : {}),
    ...(!encrypted && !file && previewOf(message) ? { preview: previewOf(message)! } : {}),
    ...(!encrypted && child(message, 'forwarded', NS.forward) ? { forwarded: true as const } : {}),
  });
  if (mine) readUpTo(chat, how.at);
  else if (how.at > Math.max(room.readTo ?? 0, chat.readAt ?? 0) && (room.private || mentions(text, room.nick))) chat.unread += 1;
  taken.chats.push(jid);
}

/** Who among a private group's people has the device that wrote an OMEMO message, when the room did not say. */
async function senderOf(state: XmppState, connection: XmppConnection, room: XmppRoom, encrypted: XmlElement): Promise<string> {
  const two = encrypted.ns === OMEMO2;
  const sid = child(encrypted, 'header', encrypted.ns)?.attrs.sid ?? '';
  const people = groupPeople(state, room);
  const has = (jid: string) => Boolean(peopleIn(state, two)[jid]?.devices[sid]);
  const found = people.find(has);
  if (found) return found;
  for (const jid of people) {
    await devicesFor(state, connection, jid).catch(() => undefined);
    if (has(jid)) return jid;
  }
  return '';
}

/** The <encrypted> of a message: OMEMO 2's when it has a key for this device, else OMEMO 0.3's, else whichever it has. */
function encryptedOf(state: XmppState, message: XmlElement): XmlElement | undefined {
  const two = child(message, 'encrypted', OMEMO2);
  const one = child(message, 'encrypted', OMEMO);
  if (two && key2For(two, state.jid, state.omemo.device)) return two;
  return one ?? two;
}

/** The devices we know of in one OMEMO version: 0.3's, or OMEMO 2's. */
function peopleIn(state: XmppState, two: boolean): OmemoPeople {
  return two ? (state.people2 ??= {}) : state.people;
}

/** Opens an OMEMO message to this device: its text, 'empty' for one that only moved the ratchet
 *  on, or null when nothing in it is for this device or it does not open. `to` is whom an OMEMO 2
 *  message must say it was written to: us, the person ours went to, or the group. */
async function openOmemo(state: XmppState, connection: XmppConnection, from: string, encrypted: XmlElement, taken: Taken, live: boolean, to: string): Promise<string | 'empty' | null> {
  if (encrypted.ns === OMEMO2) return openOmemo2(state, connection, from, encrypted, taken, live, to);
  const header = child(encrypted, 'header', OMEMO);
  const sid = Number(header?.attrs.sid);
  const ours = keyFor(encrypted, state.omemo.device);
  if (!ours || !Number.isInteger(sid)) return null;
  const devices = (state.people[from] ??= { fetchedAt: 0, devices: {} }).devices;
  const device = (devices[String(sid)] ??= { listed: false });
  const payload = textOf(child(encrypted, 'payload', OMEMO)).trim();
  const iv = textOf(child(header, 'iv', OMEMO)).trim();
  try {
    const answer = await withEither(device, (session) =>
      omemoCall<{ session: unknown; text: string | null; identity: string; used_pre_key: number | null }>({
        op: 'decrypt',
        identity: state.omemo.identity,
        signed_pre_keys: [state.omemo.signedPreKey],
        pre_keys: keptPreKeys(state.omemo),
        session,
        key: ours.key,
        prekey: ours.prekey,
        payload: payload || null,
        iv: iv || null,
      }),
    );
    takeIdentity(state, to === state.jid ? from : to, from, sid, device, answer.identity, answer.session);
    delete device.failedAt;
    if (answer.used_pre_key !== null) {
      if (await replacePreKey(state, answer.used_pre_key)) taken.republish = true;
      // An empty message back completes the session, so their next ones are short (XEP-0384).
      if (live) await sendEmpty(state, connection, from, sid, false).catch(() => undefined);
    }
    return answer.text ?? 'empty';
  } catch {
    return null;
  }
}

/** The same for OMEMO 2, whose words come in an SCE envelope that must say who wrote it, to whom. */
async function openOmemo2(state: XmppState, connection: XmppConnection, from: string, encrypted: XmlElement, taken: Taken, live: boolean, to: string): Promise<string | 'empty' | null> {
  const sid = Number(child(encrypted, 'header', OMEMO2)?.attrs.sid);
  const ours = key2For(encrypted, state.jid, state.omemo.device);
  const own = state.omemo2;
  if (!ours || !own || !Number.isInteger(sid)) return null;
  const devices = (peopleIn(state, true)[from] ??= { fetchedAt: 0, devices: {} }).devices;
  const device = (devices[String(sid)] ??= { listed: false });
  const payload = textOf(child(encrypted, 'payload', OMEMO2)).trim();
  try {
    const answer = await withEither(device, (session) =>
      omemoCall<{ session: unknown; text: string | null; identity: string; used_pre_key: number | null }>({
        op: 'two_decrypt',
        identity: state.omemo.identity,
        signed_pre_keys: [own.signedPreKey],
        pre_keys: keptPreKeys(own),
        session,
        key: ours.key,
        kex: ours.kex,
        payload: payload || null,
      }),
    );
    takeIdentity(state, to === state.jid ? from : to, from, sid, device, answer.identity, answer.session);
    delete device.failedAt;
    if (answer.used_pre_key !== null) {
      if (await replacePreKey2(own, answer.used_pre_key)) taken.republish = true;
      if (live) await sendEmpty(state, connection, from, sid, true).catch(() => undefined);
    }
    if (answer.text === null) return 'empty';
    const words = openEnvelope(answer.text, from, to);
    if (words === null) return null;
    return words || 'empty';
  } catch {
    return null;
  }
}

/** Opens with the device's session, and when that fails and it came with another key not accepted
 *  yet, with the session under that key. */
async function withEither<T>(device: OmemoDevice, open: (session: unknown) => Promise<T>): Promise<T> {
  try {
    return await open(device.session ?? null);
  } catch (error) {
    if (!device.pending) throw error;
    return open(device.pending.session);
  }
}

/**
 * A device's identity key and session, as a message or its bundle brought them. A device that comes
 * with another key than the one first seen may be someone else's under its ID (a server can put
 * anything in a list or a bundle), so the first key and its session stay: the new ones are kept
 * aside until the person accepts them in the chat's devices (acceptXmppDevice), nothing is
 * encrypted to it meanwhile, and the chat `chat` says so, once for each key it comes with.
 */
function takeIdentity(state: XmppState, chat: string, owner: string, id: number | string, device: OmemoDevice, identity: string, session: unknown): void {
  if (!device.identity || device.identity === identity) {
    device.identity = identity;
    device.session = session;
    return;
  }
  const again = device.pending?.identity === identity;
  device.pending = { identity, session };
  device.changed = true;
  if (!again) addCallLine(state, chat, false, deviceLine('changed', owner), `key ${owner} ${id} ${identity}`);
}

/** Takes the other key a device of `jid` came with as its own, as the person accepted it after
 *  comparing it: from now on what is written goes to it again, under that key. */
export function acceptXmppDevice(state: XmppState, jid: string, id: string, two: boolean): void {
  const device = peopleIn(state, two)[jid]?.devices[id];
  if (!device?.pending) return;
  device.identity = device.pending.identity;
  device.session = device.pending.session;
  delete device.pending;
}

/** A one-time pre-key a message used goes off the bundle, kept a while, and a new one takes its place: whether the bundle changed. */
async function replacePreKey2(own: OwnOmemo2, used: number): Promise<boolean> {
  if (!usePreKey(own, used)) return false;
  const { pre_keys } = await omemoCall<{ pre_keys: PreKey[] }>({ op: 'two_pre_keys_new', start: own.nextPreKey, count: 1 });
  own.preKeys.push(...pre_keys);
  own.nextPreKey += 1;
  own.published = false;
  return true;
}

async function replacePreKey(state: XmppState, used: number): Promise<boolean> {
  const own = state.omemo;
  if (!usePreKey(own, used)) return false;
  const { pre_keys } = await omemoCall<{ pre_keys: PreKey[] }>({ op: 'pre_keys_new', start: own.nextPreKey, count: 1 });
  own.preKeys.push(...pre_keys);
  own.nextPreKey += 1;
  own.published = false;
  return true;
}

// A device new in a list that came after the first is written to, as a contact's new phone should
// be, but the next chat written to says so (targetsFor): a server can add one to any list.
function takeDeviceList(state: XmppState, jid: string, ids: number[], two = false): void {
  const person = (peopleIn(state, two)[jid] ??= { fetchedAt: 0, devices: {} });
  const before = person.fetchedAt > 0;
  person.fetchedAt = Date.now();
  for (const device of Object.values(person.devices)) device.listed = false;
  for (const id of ids) (person.devices[String(id)] ??= before ? { listed: true, unsaid: true } : { listed: true }).listed = true;
}

/** The most addresses kept as blocked. */
const MOST_BLOCKED = 1000;

/** A block list, or a block or unblock of some addresses (an unblock of none is of all), as the server says them. */
function takeBlocked(state: XmppState, list: XmlElement | undefined, how: 'block' | 'unblock', whole: boolean): void {
  const named = children(list, 'item', NS.blocking)
    .map((item) => bare(item.attrs.jid ?? '').toLowerCase())
    .filter(Boolean);
  let blocked = whole ? [] : [...(state.blocked ?? [])];
  if (how === 'block') blocked.push(...named.filter((jid) => !blocked.includes(jid)));
  else blocked = named.length ? blocked.filter((jid) => !named.includes(jid)) : [];
  blocked = blocked.slice(-MOST_BLOCKED);
  if (blocked.length) state.blocked = blocked;
  else delete state.blocked;
  // One blocked asks nothing any more.
  state.requests = state.requests.filter((jid) => !blocked.includes(jid));
}

/** Whether the account blocks `jid` (an address, or a whole server by its name). */
export function isBlocked(state: XmppState, jid: string): boolean {
  const who = bare(jid).toLowerCase();
  return !!state.blocked?.some((b) => b === who || b === domainOf(who));
}

/** Blocks someone, or lets them through again (XEP-0191): their messages, calls and requests no longer reach any app of the account. */
export async function blockXmpp(state: XmppState, connection: XmppConnection, jid: string, block: boolean): Promise<void> {
  const who = bare(jid).toLowerCase();
  if (!who.includes('@') || who === state.jid) throw new XmppError(t('Write an XMPP address, such as name@example.org.'));
  const item = el(block ? 'block' : 'unblock', { xmlns: NS.blocking }, el('item', { xmlns: NS.blocking, jid: who }));
  await connection.iq('set', undefined, item).catch((error: unknown) => {
    throw error instanceof XmppError && error.condition === 'service-unavailable' ? new XmppError(t('Your XMPP server cannot block anyone.')) : error;
  });
  takeBlocked(state, item, block ? 'block' : 'unblock', false);
}

/** Puts our profile picture on the server for our contacts (lib/xmpp-avatar.ts), or takes it away with null. */
export async function setXmppAvatar(state: XmppState, connection: XmppConnection, picture: { bytes: Uint8Array; type: string } | null): Promise<void> {
  try {
    takeAvatar(state, state.jid, picture ? await publishXmppAvatar(connection, picture.bytes, picture.type) : (await removeXmppAvatar(connection), null));
  } catch (error) {
    throw error instanceof XmppError && ['service-unavailable', 'feature-not-implemented'].includes(error.condition) ? new XmppError(t('Your XMPP server cannot keep a profile picture.')) : error;
  }
}

function takeRoster(state: XmppState, query: XmlElement | undefined, whole: boolean): void {
  if (whole) state.roster = {};
  for (const item of children(query, 'item', NS.roster)) {
    const jid = bare(item.attrs.jid ?? '');
    if (!jid.includes('@')) continue;
    const subscription = (item.attrs.subscription ?? 'none') as XmppContact['subscription'];
    if (subscription === 'remove') {
      delete state.roster[jid];
      continue;
    }
    state.roster[jid] = { jid, name: item.attrs.name, subscription, asked: item.attrs.ask === 'subscribe' || undefined };
    if (subscription === 'both' || subscription === 'from') state.requests = state.requests.filter((r) => r !== jid);
  }
}

async function takePresence(state: XmppState, connection: XmppConnection, presence: XmlElement): Promise<void> {
  const from = bare(presence.attrs.from ?? '');
  if (!from.includes('@') || from === state.jid) return;
  // One the account appears offline to, coming online, may have been told otherwise by their server: told again.
  if (presence.attrs.type === undefined && state.unseenBy?.includes(from.toLowerCase()) && !isOn(xmppPresence(state, from))) {
    await connection.send(el('presence', { to: from, type: 'unavailable' })).catch(() => undefined);
  }
  if (presence.attrs.type === undefined || presence.attrs.type === 'unavailable') return takeOnline(state, presence.attrs.from ?? '', presence);
  if (presence.attrs.type === 'subscribe') {
    if (isBlocked(state, from)) return;
    // Someone we added ourselves may see us at once; others ask first.
    const contact = state.roster[from];
    if (contact && (contact.asked || contact.subscription === 'to' || contact.subscription === 'both')) {
      await connection.send(el('presence', { to: from, type: 'subscribed' })).catch(() => undefined);
    } else if (!state.requests.includes(from)) state.requests.push(from);
  }
  if (presence.attrs.type === 'unsubscribe') state.requests = state.requests.filter((r) => r !== from);
}

// ---- who is online ----

// Contacts' presence, by account, then bare address, then resource: in memory only, never kept
// in the account's file (saveXmpp) or a backup, and forgotten as a new session begins.
const presences = new WeakMap<XmppState, Map<string, Map<string, NetPresence>>>();
const NS_IDLE = 'urn:xmpp:idle:1';
const SHOW_RANK: Record<NetPresence['show'], number> = { online: 3, busy: 2, away: 1, offline: 0 };

/** Forgets every contact's presence: the server sends it again to a new session. */
export function forgetPresence(state: XmppState): void {
  presences.delete(state);
}

/** A contact's presence (RFC 6121): from a contact we may see (subscription to or both), never blocked. */
function takeOnline(state: XmppState, full: string, presence: XmlElement): void {
  const jid = bare(full);
  const contact = state.roster[jid];
  if (!contact || (contact.subscription !== 'to' && contact.subscription !== 'both') || isBlocked(state, jid)) return;
  const slash = full.indexOf('/');
  const resource = slash >= 0 ? full.slice(slash + 1) : '';
  let all = presences.get(state);
  if (!all) presences.set(state, (all = new Map()));
  const theirs = all.get(jid) ?? new Map<string, NetPresence>();
  all.set(jid, theirs);
  if (presence.attrs.type === 'unavailable') {
    theirs.delete(resource);
    // Gone from their last device: they were last seen now.
    if (![...theirs.values()].some((p) => p.show !== 'offline')) {
      theirs.clear();
      theirs.set('', { show: 'offline', status: cleanStatus(textOf(child(presence, 'status'))), lastActive: Date.now() });
    }
    return;
  }
  const said = textOf(child(presence, 'show')).trim();
  const show: NetPresence['show'] = said === 'away' || said === 'xa' ? 'away' : said === 'dnd' ? 'busy' : 'online';
  const since = Date.parse(child(presence, 'idle', NS_IDLE)?.attrs.since ?? '');
  theirs.delete('');
  theirs.set(resource, { show, status: cleanStatus(textOf(child(presence, 'status'))), ...(Number.isFinite(since) ? { lastActive: since } : {}) });
}

/** Whether a contact is online, as their devices say: the most present of them, or null when not heard of. */
export function xmppPresence(state: XmppState, jid: string): NetPresence | null {
  const theirs = presences.get(state)?.get(bare(jid));
  if (!theirs?.size) return null;
  return [...theirs.values()].sort((a, b) => SHOW_RANK[b.show] - SHOW_RANK[a.show])[0] ?? null;
}

/** The addresses of the contacts online now. */
export function xmppOnline(state: XmppState): string[] {
  return [...(presences.get(state)?.keys() ?? [])].filter((jid) => isOn(xmppPresence(state, jid)));
}

async function answerIq(state: XmppState, connection: XmppConnection, iq: XmlElement, taken: Taken): Promise<void> {
  const type = iq.attrs.type;
  if (type !== 'get' && type !== 'set') return;
  const from = iq.attrs.from ?? '';
  const reply = (payload?: XmlElement) => connection.send(el('iq', { type: 'result', id: iq.attrs.id, to: from || undefined }, payload ?? null));
  const query = iq.children.find((c): c is XmlElement => typeof c !== 'string');
  // Roster changes come only from our own server.
  if (type === 'set' && query?.ns === NS.roster && (!from || bare(from) === state.jid)) {
    takeRoster(state, query, false);
    taken.chats.push('');
    return reply();
  }
  if (type === 'get' && query?.name === 'ping' && query.ns === NS.ping) return reply();
  // Someone blocked or unblocked in another app of the account: from our own server only.
  if (type === 'set' && query?.ns === NS.blocking && (query.name === 'block' || query.name === 'unblock') && (!from || bare(from) === state.jid)) {
    takeBlocked(state, query, query.name, false);
    taken.chats.push('');
    return reply();
  }
  if (type === 'set' && query?.name === 'jingle' && query.ns === NS.jingle && callHook) return callHook.iq(state, connection, iq);
  if (type === 'get' && query?.name === 'query' && query.ns === NS.discoInfo) {
    return reply(
      el('query', { xmlns: NS.discoInfo, node: query.attrs.node }, el('identity', { category: 'client', type: 'phone', name: editionName() }), ...FEATURES.map((f) => el('feature', { var: f }))),
    );
  }
  return connection.send(
    el('iq', { type: 'error', id: iq.attrs.id, to: from || undefined }, el('error', { type: 'cancel' }, el('service-unavailable', { xmlns: NS.stanzas }))),
  );
}

// ---- what goes ----

/** Their device lists, OMEMO 0.3's and OMEMO 2's, fetched again when old. */
async function devicesFor(state: XmppState, connection: XmppConnection, jid: string, fresh = false): Promise<void> {
  const fetchedAt = Math.min(state.people[jid]?.fetchedAt ?? 0, state.people2?.[jid]?.fetchedAt ?? 0);
  if (!fresh && Date.now() - fetchedAt < DEVICES_FRESH_MS) return;
  const fetch = async (two: boolean) => {
    try {
      const answer = await connection.iq('get', jid, itemsElement(two ? DEVICES2_NODE : DEVICES_NODE));
      takeDeviceList(state, jid, two ? devices2Of(itemOf(answer, 'devices', OMEMO2)) : devicesOf(itemOf(answer, 'list')), two);
    } catch (error) {
      if (error instanceof XmppError && ['item-not-found', 'service-unavailable', 'forbidden', 'not-authorized', 'subscription-required'].includes(error.condition)) {
        takeDeviceList(state, jid, [], two);
        return;
      }
      throw error;
    }
  };
  const two = fetch(true).catch((error: unknown) => error);
  await fetch(false);
  const failed = await two;
  if (failed) throw failed;
}

/** Looks up the device lists of `jids` not looked up lately, so their keys show before anything is written. */
export async function lookUpDevices(state: XmppState, connection: XmppConnection, jids: string[]): Promise<void> {
  for (const jid of jids) await devicesFor(state, connection, jid).catch(() => undefined);
}

/** Sessions with every device of `jids` that has none yet, from their bundles: in OMEMO 2 with those
 *  that have it (once ours is on the server), in OMEMO 0.3 with the others. `chat` is the chat
 *  written to, which says so when a bundle comes with another key. */
async function sessionsFor(state: XmppState, connection: XmppConnection, jids: string[], chat: string): Promise<void> {
  if (state.omemo2?.live) {
    for (const jid of jids) {
      for (const [id, device] of Object.entries(state.people2?.[jid]?.devices ?? {})) {
        if (!device.listed || device.session || device.pending || (jid === state.jid && Number(id) === state.omemo.device)) continue;
        if (device.failedAt && Date.now() - device.failedAt < RETRY_DEVICE_MS) continue;
        try {
          const bundle = bundle2Of(itemOf(await connection.iq('get', jid, itemElement(BUNDLES2_NODE, id)), 'bundle', OMEMO2));
          if (!bundle) throw new Error('no bundle');
          const { session } = await omemoCall<{ session: { identity: string } }>({ op: 'two_session_start', identity: state.omemo.identity, bundle });
          takeIdentity(state, chat, jid, id, device, session.identity, session);
        } catch {
          device.failedAt = Date.now();
        }
      }
    }
  }
  for (const jid of jids) {
    for (const [id, device] of Object.entries(state.people[jid]?.devices ?? {})) {
      if (!device.listed || device.session || device.pending || (jid === state.jid && Number(id) === state.omemo.device)) continue;
      if (twoFor(state, jid, id)) continue;
      if (device.failedAt && Date.now() - device.failedAt < RETRY_DEVICE_MS) continue;
      try {
        const bundle = bundleOf(itemOf(await connection.iq('get', jid, itemsElement(bundleNode(Number(id)))), 'bundle'));
        if (!bundle) throw new Error('no bundle');
        const { session } = await omemoCall<{ session: { identity: string } }>({ op: 'session_start', identity: state.omemo.identity, bundle });
        takeIdentity(state, chat, jid, id, device, session.identity, session);
      } catch {
        device.failedAt = Date.now();
      }
    }
  }
}

/** Whom a message in the chat `jid` is encrypted for: the person, or a private group's people. */
function peopleOf(state: XmppState, jid: string): string[] {
  const room = state.chats[jid]?.room;
  return room ? groupPeople(state, room) : [jid];
}

/** Whether a device is written to in OMEMO 2: it has it, ours is on the server, and there is a session. */
function twoFor(state: XmppState, jid: string, id: string): boolean {
  const device = state.people2?.[jid]?.devices[id];
  return Boolean(state.omemo2?.live && device?.listed && device.session);
}

type Target = { jid: string; id: string; two: boolean };

/**
 * The devices a message to `peers` is encrypted for: theirs and our others, each in OMEMO 2 when
 * it has it, else in OMEMO 0.3. Throws NoOmemoError when none of them has any (`name` saying who).
 */
async function targetsFor(state: XmppState, connection: XmppConnection, peers: string[], name: string, only?: { id: number; two: boolean }, fetched = false): Promise<Target[]> {
  for (const peer of peers) await devicesFor(state, connection, peer).catch(() => undefined);
  await devicesFor(state, connection, state.jid);
  await sessionsFor(state, connection, [...peers, state.jid], name);
  const targets: Target[] = [];
  let held = '';
  for (const jid of [...peers, state.jid]) {
    const ids = new Set([...Object.keys(state.people[jid]?.devices ?? {}), ...Object.keys(state.people2?.[jid]?.devices ?? {})]);
    for (const id of ids) {
      if (jid === state.jid && Number(id) === state.omemo.device) continue;
      const two = twoFor(state, jid, id);
      const device = two ? state.people2![jid].devices[id] : state.people[jid]?.devices[id];
      if (!device?.session || !device.listed) continue;
      if (only !== undefined && (jid !== peers[0] || Number(id) !== only.id || two !== only.two)) continue;
      // Its key changed, and the person has not accepted the new one.
      if (device.pending) {
        if (jid !== state.jid) held = jid;
        continue;
      }
      targets.push({ jid, id, two });
    }
  }
  // New devices are written to, and the chat says so, once for each.
  for (const { jid, id } of targets) {
    const listed = [state.people[jid]?.devices[id], state.people2?.[jid]?.devices[id]];
    if (!listed.some((device) => device?.unsaid)) continue;
    for (const device of listed) if (device) delete device.unsaid;
    addCallLine(state, name, false, deviceLine('new', jid), `device ${jid} ${id}`);
  }
  if (!targets.some((d) => d.jid !== state.jid)) {
    // Their only devices changed their keys: that is no reason to offer writing without encryption.
    if (held) throw new XmppError(t('A device of {who} changed its key: your messages do not go to it.', { who: held }));
    // Lists fetched a while ago may be out of date: once more, freshly.
    // Once: a fetch that fails (their server unreachable) leaves the list as old as it was, and
    // asking again at once would ask for ever.
    const stale = peers.filter((peer) => Date.now() - (state.people[peer]?.fetchedAt ?? 0) > 60_000);
    if (only === undefined && stale.length && !fetched) {
      for (const peer of stale) await devicesFor(state, connection, peer, true).catch(() => undefined);
      return targetsFor(state, connection, peers, name, only, true);
    }
    throw new NoOmemoError(name);
  }
  return targets;
}

/**
 * The <encrypted> for `peers`' devices and our others, in a message to `to` (the person or the
 * group), with `text` or none for an empty one: OMEMO 2's for the devices that have it, OMEMO
 * 0.3's for the others, one or both.
 */
async function encryptFor(state: XmppState, connection: XmppConnection, peers: string[], to: string, text: string | null, only?: { id: number; two: boolean }): Promise<XmlElement[]> {
  const targets = await targetsFor(state, connection, peers, to, only);
  const out: XmlElement[] = [];
  const twos = targets.filter((d) => d.two);
  if (twos.length) {
    const answer = await omemoCall<{ payload: string | null; keys: { key: string; kex: boolean; session: unknown }[] }>({
      op: 'two_encrypt',
      text: text === null ? undefined : envelope(text, state.jid, to),
      sessions: twos.map((d) => state.people2![d.jid].devices[d.id].session),
    });
    twos.forEach((d, i) => {
      state.people2![d.jid].devices[d.id].session = answer.keys[i].session;
    });
    out.push(encrypted2Element(state.omemo.device, twos.map((d, i) => ({ jid: d.jid, id: d.id, key: answer.keys[i].key, kex: answer.keys[i].kex })), answer.payload));
  }
  const ones = targets.filter((d) => !d.two);
  if (ones.length) {
    const answer = await omemoCall<{ payload: string | null; iv: string; keys: { key: string; prekey: boolean; session: unknown }[] }>({
      op: 'encrypt',
      text: text ?? undefined,
      sessions: ones.map((d) => state.people[d.jid].devices[d.id].session),
    });
    ones.forEach((d, i) => {
      state.people[d.jid].devices[d.id].session = answer.keys[i].session;
    });
    out.push(
      el(
        'encrypted',
        { xmlns: OMEMO },
        el(
          'header',
          { sid: state.omemo.device },
          ...ones.map((d, i) => el('key', { rid: d.id, prekey: answer.keys[i].prekey ? 'true' : undefined }, answer.keys[i].key)),
          el('iv', {}, answer.iv),
        ),
        answer.payload ? el('payload', {}, answer.payload) : null,
      ),
    );
  }
  return out;
}

async function sendEmpty(state: XmppState, connection: XmppConnection, peer: string, device: number, two: boolean): Promise<void> {
  const encrypted = await encryptFor(state, connection, [peer], peer, null, { id: device, two });
  await connection.send(el('message', { to: peer, type: 'chat', id: newId() }, ...encrypted, el('store', { xmlns: NS.hints })));
}

/** Sends `text` to `peer`, encrypted with OMEMO unless the chat chose otherwise. Throws
 *  NoOmemoError when their apps have no OMEMO keys and the chat has not chosen to send plain. */
/** Sends words; with `preview`, the preview of a link in them, which goes only in a chat without encryption. */
export async function sendXmppText(state: XmppState, connection: XmppConnection, peer: string, text: string, preview?: Preview | null): Promise<XmppMessage> {
  return sendBody(state, connection, peer, text, undefined, { preview });
}

/**
 * Before a file goes to `peer`: whether it is encrypted (the chat is), and the server's upload
 * service, found once. Throws NoOmemoError when the chat is encrypted and their apps have no OMEMO,
 * so nothing is uploaded for nothing, and an error when the server takes no files.
 */
export async function prepareXmppFile(state: XmppState, connection: XmppConnection, peer: string): Promise<{ encrypt: boolean; service: XmppUpload }> {
  const chat = chatOf(state, peer);
  const encrypt = !plainIn(chat);
  if (chat.room && !chat.room.joined) throw new XmppError(chat.room.problem || t('Not in this group yet: joining it.'));
  if (encrypt) await targetsFor(state, connection, peopleOf(state, peer), peer);
  const service = await findUpload(connection, domainOf(state.jid), state.upload);
  if (!service) throw new XmppError(t('Your XMPP server takes no files.'));
  state.upload = service;
  return { encrypt, service };
}

/** Sends a file already uploaded (lib/xmpp-files.ts): its link, encrypted as the chat is, out of band too when it is not. */
export async function sendXmppFile(state: XmppState, connection: XmppConnection, peer: string, file: XmppFile): Promise<XmppMessage> {
  return sendBody(state, connection, peer, textOfFile(file), file);
}

/** Whether a chat is written without encryption: chosen so, or a group that is not private. */
export function plainIn(chat: XmppChat): boolean {
  return Boolean(chat.plain) || (chat.room !== undefined && !chat.room.private);
}

/** What a message sent is besides its words: an answer to one here, new words for one of ours, or a copy of one from another chat. */
type Sending = { reply?: XmppMessage; replace?: XmppMessage; preview?: Preview | null; forward?: boolean };

async function sendBody(state: XmppState, connection: XmppConnection, peer: string, text: string, file?: XmppFile, how: Sending = {}): Promise<XmppMessage> {
  const chat = chatOf(state, peer);
  const room = chat.room;
  if (room && !room.joined) throw new XmppError(room.problem || t('Not in this group yet: joining it.'));
  const plain = plainIn(chat);
  const id = newId();
  const preview = plain && !file && !how.replace && how.preview ? how.preview : null;
  const forward = !!how.forward && !how.reply && !how.replace;
  const message: XmppMessage = {
    id,
    mine: true,
    text: file ? '' : text,
    at: Date.now(),
    encrypted: !plain,
    state: 'sending',
    ...(file ? { file } : {}),
    ...(room ? { by: room.nick } : {}),
    ...(preview ? { preview } : {}),
    ...(forward ? { forwarded: true as const } : {}),
  };
  // An answer goes with the quote other apps show (lib/xmpp-actions.ts), and says what it answers.
  const answered = how.reply;
  const answerId = answered ? nameFor(answered, !!room) : undefined;
  if (answered && !answerId) throw new XmppError(t('This message cannot be answered yet. Try again in a moment.'));
  const answerTo = !answered ? '' : room ? (answered.mine ? `${peer}/${room.nick}` : answered.by ? `${peer}/${answered.by}` : '') : answered.mine ? state.jid : peer;
  const answer = answered && answerId ? replyParts(answerTo, answerId, answered.file ? answered.file.name : answered.text) : null;
  if (answered) message.replyTo = answered.id;
  const words = answer ? answer.quote + text : text;
  // A group has no receipts nor read marks: the room passes the message back once it has it. A
  // change asks for neither.
  const type = room ? 'groupchat' : 'chat';
  const replace = how.replace;
  const extras = [
    room || replace ? null : el('request', { xmlns: NS.receipts }),
    room || replace ? null : el('markable', { xmlns: NS.markers }),
    el('origin-id', { xmlns: NS.sid, id }),
    replace ? el('replace', { xmlns: NS_CORRECT, id: replace.id }) : null,
    ...(answer?.elements ?? []),
  ];
  let stanza: XmlElement;
  if (plain) {
    const oob = file && !file.fragment ? oobOf(file) : null;
    // A copy goes inside a forwarded element too (XEP-0297), for the apps that show one as such;
    // its words beside it are what the others show. Who wrote it first is not said.
    const forwarded = forward ? el('forwarded', { xmlns: NS.forward }, el('message', { xmlns: NS.client }, el('body', {}, words), oob)) : null;
    stanza = el('message', { to: peer, type, id }, el('body', {}, words), oob, preview ? previewElement(preview) : null, forwarded, ...extras);
  } else {
    const encrypted = await encryptFor(state, connection, peopleOf(state, peer), peer, words);
    stanza = el(
      'message',
      { to: peer, type, id },
      ...encrypted,
      el('encryption', { xmlns: NS.eme, namespace: encrypted.some((e) => e.ns === OMEMO) ? OMEMO : OMEMO2, name: 'OMEMO' }),
      el('store', { xmlns: NS.hints }),
      el('body', {}, HINT_BODY),
      ...extras,
    );
  }
  remember(state, `${state.jid}|${id}`);
  // New words go into the message they change, once the server has them.
  if (replace) {
    await connection.send(stanza);
    replace.text = text;
    replace.edited = message.at;
    return replace;
  }
  addMessage(chat, message);
  // Writing in it, everything in it was seen.
  chat.unread = 0;
  chat.readAt = Math.max(chat.readAt ?? 0, chat.lastAt);
  try {
    await connection.send(stanza);
    if (!room) message.state = 'sent';
  } catch (error) {
    message.state = 'failed';
    throw error;
  }
  return message;
}

/**
 * Sends a copy of a message from another chat, marked as forwarded: its words, or its file already
 * on a server (lib/xmpp-files.ts linkFits), encrypted as this chat is. In a chat written without
 * encryption the copy goes inside a forwarded element too (XEP-0297); an encrypted one has nothing
 * outside its encryption to say it, so there it goes as a plain copy, marked as forwarded only here.
 */
export async function forwardXmpp(state: XmppState, connection: XmppConnection, peer: string, what: { text: string } | { file: XmppFile }): Promise<XmppMessage> {
  if ('file' in what) return sendBody(state, connection, peer, textOfFile(what.file), what.file, { forward: true });
  return sendBody(state, connection, peer, what.text, undefined, { forward: true });
}

/** Whether a message can go to another chat as a copy: words or a file, opened, sent and not taken back. */
export function forwardable(message: XmppMessage): boolean {
  return !message.deleted && !message.locked && !message.call && message.state !== 'sending' && message.state !== 'failed' && (!!message.file || !!message.text.trim());
}

/** Pins a message of a chat on this device only, or unpins it (lib/xmpp-actions.ts). */
export function pinXmpp(state: XmppState, peer: string, id: string, on: boolean): void {
  const chat = state.chats[peer];
  if (!chat) return;
  const pins = pinned(chat.pins, chat.messages, id, on);
  if (pins.length) chat.pins = pins;
  else delete chat.pins;
}

/** Keeps how long a sound of a chat lasts, read from it once it was fetched (lib/xmpp-voice.ts); here only. */
export function heardXmpp(state: XmppState, peer: string, id: string, ms: number): boolean {
  const file = state.chats[peer]?.messages.find((m) => m.id === id)?.file;
  if (!file || file.duration || !(ms > 0 && ms <= 24 * 3600_000)) return false;
  file.duration = Math.round(ms);
  return true;
}

/** The message of a chat `id` names, here: a reaction, an answer or a taking back needs one. */
function messageIn(state: XmppState, peer: string, id: string): XmppMessage {
  const found = state.chats[peer]?.messages.find((m) => m.id === id);
  if (!found || found.deleted || found.call) throw new XmppError(t('This message is not here any more.'));
  return found;
}

/** Answers a message of the chat with `text`, encrypted as the chat is. */
export async function replyXmppText(state: XmppState, connection: XmppConnection, peer: string, text: string, to: string): Promise<XmppMessage> {
  return sendBody(state, connection, peer, text, undefined, { reply: messageIn(state, peer, to) });
}

/** Gives a message of ours new words, encrypted as the chat is (XEP-0308). */
export async function changeXmppText(state: XmppState, connection: XmppConnection, peer: string, id: string, text: string): Promise<void> {
  const target = messageIn(state, peer, id);
  if (!target.mine || target.file || target.locked || target.state === 'sending' || target.state === 'failed') throw new XmppError(t('Only your own words can be changed.'));
  if (target.text === text) return;
  await sendBody(state, connection, peer, text, undefined, { replace: target });
}

/** Reacts to a message with `emoji`, or takes our reaction back when it is ours already (XEP-0444). */
export async function reactXmpp(state: XmppState, connection: XmppConnection, peer: string, id: string, emoji: string): Promise<void> {
  const chat = state.chats[peer];
  const target = messageIn(state, peer, id);
  const name = nameFor(target, !!chat?.room);
  if (!name) throw new XmppError(t('This message cannot be answered yet. Try again in a moment.'));
  if (chat?.room && !chat.room.joined) throw new XmppError(chat.room.problem || t('Not in this group yet: joining it.'));
  const ours = toggled(target.reacted?.[state.jid] ?? [], emoji);
  await connection.send(
    el(
      'message',
      { to: peer, type: chat?.room ? 'groupchat' : 'chat', id: newId() },
      el('reactions', { xmlns: NS_REACTIONS, id: name }, ...ours.map((e) => el('reaction', {}, e))),
      el('store', { xmlns: NS.hints }),
    ),
  );
  react(target, state.jid, ours);
}

/** Takes a message of ours back, for everyone in the chat (XEP-0424): their apps that can, remove it. */
export async function retractXmpp(state: XmppState, connection: XmppConnection, peer: string, id: string): Promise<void> {
  const chat = state.chats[peer];
  const target = messageIn(state, peer, id);
  if (!target.mine) throw new XmppError(t('Only your own messages can be deleted for everyone.'));
  if (target.state === 'sending' || target.state === 'failed') {
    // It never went: it only leaves this chat.
    if (chat) chat.messages = chat.messages.filter((m) => m !== target);
    return;
  }
  const name = nameFor(target, !!chat?.room);
  if (!name) throw new XmppError(t('This message cannot be answered yet. Try again in a moment.'));
  if (chat?.room && !chat.room.joined) throw new XmppError(chat.room.problem || t('Not in this group yet: joining it.'));
  await connection.send(
    el(
      'message',
      { to: peer, type: chat?.room ? 'groupchat' : 'chat', id: newId() },
      el('retract', { xmlns: NS_RETRACT, id: name }),
      el('fallback', { xmlns: NS_FALLBACK, for: NS_RETRACT }),
      el('body', {}, RETRACT_BODY),
      el('store', { xmlns: NS.hints }),
    ),
  );
  retract(target);
}

/** Marks a chat as read here, and tells them, when their last message asked (XEP-0333). */
export async function markXmppRead(state: XmppState, connection: XmppConnection | null, peer: string): Promise<void> {
  const chat = state.chats[peer];
  if (!chat) return;
  chat.unread = 0;
  // Read up to its newest message: what the archive or the group gives again from before is not new.
  chat.readAt = Math.max(chat.readAt ?? 0, chat.lastAt, ...chat.messages.map((m) => m.at));
  const last = [...chat.messages].reverse().find((m) => !m.mine);
  // Nothing says it was read to one we appear offline to (lib/xmpp-rules.ts).
  if (last?.markable && connection?.isOpen && !state.unseenBy?.includes(peer.toLowerCase())) {
    const to = last.markable;
    delete last.markable;
    await connection.send(el('message', { to, type: 'chat', id: newId() }, el('displayed', { xmlns: NS.markers, id: last.id }), el('store', { xmlns: NS.hints }))).catch(() => undefined);
  }
}

/** Adds someone to the contacts and asks to see them; accepting a request does the same. */
export async function addXmppContact(state: XmppState, connection: XmppConnection, jid: string, name?: string): Promise<void> {
  const who = bare(jid);
  if (!isXmppId(who)) throw new XmppError(t('Write an XMPP address, such as name@example.org.'));
  await connection.iq('set', undefined, el('query', { xmlns: NS.roster }, el('item', { jid: who, name: name || undefined })));
  if (state.requests.includes(who)) await connection.send(el('presence', { to: who, type: 'subscribed' }));
  await connection.send(el('presence', { to: who, type: 'subscribe' }));
  state.requests = state.requests.filter((r) => r !== who);
  state.roster[who] ??= { jid: who, subscription: 'none' };
  state.roster[who].asked = true;
  chatOf(state, who);
}

/** The most characters of a name we give a contact. */
export const XMPP_CONTACT_NAME = 64;

/**
 * Names a contact as we see them, or takes our name away with an empty one: the name of their item in
 * the account's contacts on its server (RFC 6121, roster), so the account's other apps show it too,
 * and they are not told. The contacts are asked for first, so the item goes back with its groups as
 * they are: a change carries all of an item, and groups left out would be taken off it.
 */
export async function renameXmppContact(state: XmppState, connection: XmppConnection, jid: string, name: string): Promise<void> {
  const who = bare(jid);
  const answer = await connection.iq('get', undefined, el('query', { xmlns: NS.roster }));
  const query = child(answer, 'query', NS.roster);
  takeRoster(state, query, true);
  const item = children(query, 'item', NS.roster).find((i) => bare(i.attrs.jid ?? '') === who);
  if (!item) throw new XmppError(t('They are not in your XMPP contacts.'));
  const named = name.trim().slice(0, XMPP_CONTACT_NAME);
  const groups = children(item, 'group').map((g) => textOf(g));
  await connection.iq('set', undefined, el('query', { xmlns: NS.roster }, el('item', { jid: who, name: named || undefined }, ...groups.map((g) => el('group', {}, g)))));
  // The server tells every app of the account the item changed; this one now.
  if (state.roster[who]) {
    if (named) state.roster[who].name = named;
    else delete state.roster[who].name;
  }
}

/** Says no to someone who asked to add us. */
export async function declineXmppRequest(state: XmppState, connection: XmppConnection, jid: string): Promise<void> {
  await connection.send(el('presence', { to: jid, type: 'unsubscribed' }));
  state.requests = state.requests.filter((r) => r !== jid);
}

/** A call's line in the chat with `jid`, kept here only; one with the same `id` is replaced. A
 *  missed call counts as not read. */
export function addCallLine(state: XmppState, jid: string, mine: boolean, text: string, id: string, at = Date.now()): void {
  const chat = chatOf(state, jid);
  const missed = !mine && text.includes('Missed ');
  const before = chat.messages.find((m) => m.call && m.id === id);
  if (before) {
    // A missed call that was answered on another device after all is no longer one to look at.
    if (!before.mine && before.text.includes('Missed ') && !missed && chat.unread > 0) chat.unread -= 1;
    before.text = text;
    before.mine = mine;
    return;
  }
  addMessage(chat, { id, mine, text, at, encrypted: true, call: true });
  if (missed) chat.unread += 1;
}

/** Removes a chat here; the contact stays in the account. */
export function forgetXmppChat(state: XmppState, jid: string): void {
  delete state.chats[jid];
}

/** Leaves the account: takes this device out of its OMEMO device lists, and its OMEMO 2 bundle off, and closes. */
export async function signOutXmpp(state: XmppState, connection: XmppConnection | null): Promise<void> {
  if (!connection?.isOpen) return;
  const device = state.omemo.device;
  try {
    const listed = devicesOf(itemOf(await connection.iq('get', state.jid, itemsElement(DEVICES_NODE)), 'list'));
    if (listed.includes(device)) await publishWithFallback(connection, DEVICES_NODE, deviceListElement(listed.filter((d) => d !== device)));
  } catch {
    // Signing out goes on.
  }
  if (state.omemo2) {
    try {
      const list = itemOf(await connection.iq('get', state.jid, itemsElement(DEVICES2_NODE)), 'devices', OMEMO2);
      if (devices2Of(list).includes(device)) await publishWithFallback(connection, DEVICES2_NODE, devices2With(list, device, false));
      await connection.iq('set', undefined, el('pubsub', { xmlns: 'http://jabber.org/protocol/pubsub' }, el('retract', { node: BUNDLES2_NODE, notify: 'true' }, el('item', { id: String(device) }))));
    } catch {
      // As above.
    }
  }
  connection.close();
}

/** Chats, newest first. */
export function xmppChatList(state: XmppState): XmppChat[] {
  return Object.values(state.chats).sort((a, b) => b.lastAt - a.lastAt);
}

/** The fingerprints of a person's devices, as OMEMO apps show them, whether each changed, and
 *  whether its new key waits to be accepted (acceptXmppDevice): an
 *  OMEMO 2 one (`two`) for each device that has OMEMO 2, as Kaidan shows it. */
export function xmppDevices(state: XmppState, jid: string): { id: string; identity?: string; changed?: boolean; pending?: true; listed: boolean; two?: true; checked?: true }[] {
  // One that came with another key shows that key, the one to compare before accepting it; one
  // checked in person by its code says so while its key is still the one checked (lib/xmpp-rules.ts).
  const shown = (id: string, d: OmemoDevice) => ({
    id,
    identity: d.pending?.identity ?? d.identity,
    changed: d.changed,
    ...(d.pending ? { pending: true as const } : {}),
    listed: d.listed,
    ...(d.checked && d.checked === d.identity && !d.pending ? { checked: true as const } : {}),
  });
  return [
    ...Object.entries(state.people[jid]?.devices ?? {}).map(([id, d]) => shown(id, d)),
    ...Object.entries(state.people2?.[jid]?.devices ?? {}).map(([id, d]) => ({ ...shown(id, d), two: true as const })),
  ];
}

export function sendKeepAlive(connection: XmppConnection): Promise<XmlElement> {
  return connection.iq('get', undefined, el('ping', { xmlns: NS.ping }), 60_000);
}
