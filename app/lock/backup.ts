// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { OWN_FILE as CARRIED } from '../lib/carried-store';
import { decryptBytes, deriveKey, encryptBytes, fromHex, hardCost, hardKey, isHardCost, randomBytes, sameBytes, sha256Bytes, toHex, utf8Decode, utf8Encode, type HardCost } from '../lib/crypto';
import { deleteFile, fileStamps, listFiles, readBytes, readFile, writeBytes, writeFile } from '../lib/files';
import { secureDelete, secureGet, secureSet } from '../lib/secure';
import { t } from '../lib/i18n';

import { FILE as ARCHIVE } from './archive';
import { FILE as CHAT_LIST } from './chat-list-data';
import { PREFIX as ATTACHMENT } from './attachment-files';
import { CAMERA_DROP_KEY, CAMERA_OPEN_KEY, discardDrops } from './camera-drop';
import { ITER, PANIC_KEY } from './config';
import { FILE as COLLECTION } from './collection-data';
import { FILE as CONTACTS } from './contacts-data';
import { prepareDoors } from './doors';
import { FILE as DEVICES } from './devices-data';
import { FILE as E2E } from './e2e-data';
import { FILE as FANOUT } from './fanout-data';
import { FILE as GROUPS } from './group-data';
import { prepareRingEntries } from './hidden-ring';
import { prepareWatchEntries } from './hidden-watch';
import { FILE as HISTORY, PAGE_PREFIX as PAGE } from './history';
import { FILE as MATRIX } from './matrix-data';
import { FILE as MYSELF } from './myself-data';
import { FILE as NOSTR_DM } from './nostr-dm-data';
import { FILE as NOSTR_PIECES } from './nostr-pieces-data';
import { FILE as PHONE } from './phone-data';
import { FILE as PUBLIC_GROUPS } from './public-group-data';
import { prepareQueueEntries } from './queues-data';
import { markRestore, phoneId, thisPhone } from './restored';
import { holdPages, POCKETS } from './sealed-file';
import { FILE as SMS, ORDER_FILE as SMS_ORDER, smsDataChanged } from './sms-data';
import { FILE as STARS } from './stars-data';
import { FILE as STICKERS } from './sticker-data';
import { FILE as SYNC } from './sync-data';
import { PREFIX as AVATAR } from './avatar-photos';
import { PREFIX as VOICE } from './voice-clips';
import { FILE as MSG_OWN } from './msg-own-data';
import { FILE as NETWORKS } from './networks-backup-data';
import { FILE as TELEGRAM } from './telegram-data';
import { FILE as XMPP } from './xmpp-data';

// A backup: everything Erevos keeps on the phone, sealed with a password of its own. It holds the
// keystore entries and the files exactly as they are, each already sealed with its space's key, so
// it is the same whichever spaces are in use and shows nothing more than the phone does: not how
// many spaces there are, nor whether hidden chats are set. Restoring it puts all of it back, in
// place of what the phone had, and the passwords of the spaces open them as before.
//
// The file: MAGIC, the salt (SALT bytes) and PBKDF2 rounds (4 bytes) the password gives a key K
// with, then Argon2id's salt (SALT bytes), memory in KiB and passes (4 bytes each), with which K
// gives the backup's key, then, sealed with that key (AES-256-GCM, lib/crypto.ts), the entries one
// after another: their kind (1 byte), name (2-byte length, then the name) and data (4-byte length,
// then the data). A backup from before Argon2id starts with MAGIC_1 and has no Argon2id: K is its
// key. It still opens; one with MAGIC opens only in an Erevos from Argon2id on.
// An entry of a kind this Erevos does not know is a newer Erevos's: the whole backup is refused,
// with nothing changed, and the owner told to update Erevos first (NewerBackupError). So a newer
// Erevos that adds to what a backup holds gives it an entry of a kind of its own. One of a known
// kind with a name this Erevos does not restore is left out, and the rest restored. The keystore's
// entries are of kind SECRET from 6.0.0 on, KEY before: an Erevos from before 6.0.0, which knows
// only KEY, finds none of the lock's entries in a newer backup and refuses it as no backup, rather
// than restore it without what it does not know (its photos, files and voice messages among them).
// What is damaged, or not sealed with the backup's key, opens nothing.
//
// Photos, files and voice messages (lock/attachment-files.ts, lock/voice-clips.ts) are far more
// than the rest, more than a phone's memory holds at once. So they go in parts, made and read one
// at a time: files of their own beside the backup (lib/backup-place.ts), or uploads of their own
// to a server (lib/backup-cloud.ts), each holding at most PART bytes of them, as entries of kind
// BYTES. A part is sealed with the parts' key (partKey: the backup's key, hashed with PART_LABEL),
// and what it seals starts with the backup's random id (ID bytes) and the part's number (4 bytes,
// from 0), then its entries. So one changed, cut short, missing, put in another's place, or taken
// from another backup, even one sealed with the same key, as automatic backups are, opens nothing.
// The parts are made first and the backup itself last, with an entry of kind PARTS: the id, the
// names of its parts in their order, and the id of the phone it was made on (lock/restored.ts),
// as JSON. A backup cut short before its end has no file naming its parts. Restoring reads every
// part first and writes what it holds; only once all of them opened is anything else put in place,
// so a part missing or damaged leaves the phone as it was, and what the parts wrote goes again.
// Unless the owner wants the rest restored without such parts (RestoreOptions): then the phone's own
// photos, files and voice messages all stay, as the backup's messages may show some of them, and
// the rest is put in place. Otherwise such a backup holds all the photos, files and voice messages
// the phone had: those the phone has and it does not hold are deleted.
//
// Automatic backups are made often, and most of what one holds the one before held too. So an
// automatic backup names again the parts of earlier ones in the same place, sealed with the same
// key (automatic backups keep theirs, lib/backup-folder.ts), whose files are all still on the phone
// as they were (their size and when each was written, lib/files.ts fileStamps), and makes new parts
// only for the rest (MakeOptions.earlier; lib/backup-ledger.ts keeps what each one named). Its
// entry is then of kind SHARED, not PARTS: as JSON, beside each part's name, what binds that part
// (PartRecord): its size and SHA-256, the id of the backup it was made for and its number there,
// the files it holds, and those of them this backup gives from another of its parts instead. So a
// part changed, cut short, missing, put in another's place, taken from another backup or sealed
// with another key still opens nothing. Restoring writes of each part only the files the backup
// gives from it. Only a part whose files the backup holds all is named again, so a Collection kept
// out (see below) leaves the place with the backups that held it, as what the owner deleted does.
// An Erevos from before SHARED does not know its kind, and refuses such a backup with nothing
// changed (NewerBackupError). An automatic backup that names no earlier part has PARTS, saying the
// same of each of its parts, so an Erevos from before restores it as ever. The place keeps the
// newest backups and every part one of them names, and deletes the parts none of them names
// (unneededFiles; lib/backup-cloud.ts on a server). In a folder a part keeps the name it was
// written under, so a backup's parts may start as the name of an earlier backup there.
//
// From PARTS on a backup also holds, so that a restore brings the phone back as it was:
// - the panic password's entry (lock/config.ts), random when none is set, so it says nothing;
// - the phone's own settings that go with its owner to another phone (SETTINGS), applied once
//   restored (lib/backup-settings.ts);
// - how automatic backups are made and the server they go to (lib/backup-folder.ts,
//   lib/backup-cloud.ts), with the key their password gives, but not their folder, which Android
//   let only this phone write in: restored, they keep the folder this phone had for them, and a
//   phone with none asks for one (keptHere);
// - each space's SMS data in full (lock/sms-data.ts): an SMS for later whose time came before the
//   restore waits for the owner to send it or delete it (lib/sms-later.ts), so none goes twice,
//   from this phone and from the one the backup came from; and the SIM chosen for each number
//   called (lock/phone-data.ts);
// - the copies that wait for contacts' other devices (lock/fanout-data.ts) and the space's own
//   packets carried by phones nearby (lib/carried-store.ts), read before the chats' keys and
//   messages so that each is of a message the backup holds. One of them may go twice, from here
//   and from the phone the backup came from: the conversation then refuses it, or its tag shows
//   it was taken (lib/e2e.ts, lib/receiver.ts), so nothing shows twice;
// - on Android, the phone module's own settings (lib/backup-native.ts), as one entry of kind
//   NATIVE: the quick replies to a call and the rules that block calls.
// A backup from before PARTS holds none of these: restoring it leaves the phone's as they are.
// An Erevos from before PARTS opens such a backup and says a newer Erevos made it: it restores the
// rest, without the photos, files and voice messages, as backups were before.
//
// The one exception: a space, or a hidden place, whose owner keeps its Collection out of backups
// (lock/collection-data.ts) names that Collection's chunks to a backup made while it is open, which
// leaves them out (MakeOptions.skip). Nothing else can tell them from a chat's, so the Collections
// of the spaces closed then go in. Restoring such a backup leaves that Collection's files gone.
//
// What no backup holds stays with the phone, as it belongs to it: how many wrong passwords were
// typed, the fingerprint's key in the phone's chip (lock/biometric.ts), the folders Android let
// Erevos write in, what the permissions check saw (lib/permissions.ts), the packets carried for
// strangers with their key (lib/carried-store.ts), when and that a backup was restored here
// (lock/restored.ts), and what automatic backups made where (lib/backup-ledger.ts). Nor the inbox's
// list (lock/inbox-cache.ts), made again from the chats, nor the links to linked devices
// (lock/devices-data.ts), whose conversations' keys must never be used twice, and the account's
// log (lock/sync-data.ts), which a restore deletes (PHONE_FILES). What a phone it is put back on
// needs to ask each linked device to link again goes with the chat (lock/e2e-data.ts Relinks,
// lib/link-again.ts).
//
// When the owner wants it, a backup also holds the phone's SMS and MMS (lib/backup-sms.ts), as
// one entry of its own kind, PHONE_SMS: they are the phone's, not a space's, the same in every
// space. Restoring the backup does not write them anywhere; the backup screen puts them back into
// the phone's SMS. An Erevos from before this kind does not open such a backup. So too the phone's
// call history and Android's own list of blocked numbers (lib/backup-calls.ts), as one entry of
// kind PHONE_CALLS, which the backup screen adds to the phone's: an Erevos from before it says a
// newer Erevos made the backup, and changes nothing.
//
// A backup sent to a server (lib/backup-cloud.ts) is made bare: without MAGIC, and with what
// follows the first salt in the head masked with that salt's SHA-256, so the whole file looks like
// random bytes and says to no one that it is Erevos's, nor its cost. It is padded, inside the
// seal, with an entry of kind PAD, to a size of Padmé's (padme below), so its size tells roughly
// how much it holds and no more. Its parts, which have no head, are padded too, each to the size of
// a full one, so all of them are of one size; one holding a larger entry, to a whole number of
// full ones. So a bare part's size is a whole number of BARE_PART, which a size of Padmé's never
// is, and that is how lib/backup-cloud.ts tells the backups on a server from their parts, whose
// names are of the same kind. openBackup takes either; an Erevos from before bare backups does not
// open one.

const MAGIC_1 = utf8Encode('EREVOS BACKUP 1\n');
const MAGIC = utf8Encode('EREVOS BACKUP 2\n');
const SALT = 16;

// The keystore entries kept, in every space and slot whatever is in use: the lock, the spaces'
// keys, the hidden chats' lock, the password screen's look, and each slot's space and hidden chats,
// with the queues each moved away from and its contact link names (queues-data.ts), and which of
// its hidden chats receive while closed (hidden-keep.ts).
const FIXED = ['erevos.lock', 'erevos.space-keys', 'erevos.hidden-lock', 'erevos.look'];
// The other pockets of hidden chats (hidden.ts): their locks, and their entries in every slot.
const OTHER_POCKETS = Array.from({ length: POCKETS - 1 }, (_, i) => i + 1);
// Slots looked for. There are never this many: SLOTS (slots.ts) unless more second passwords were set.
const MOST_SLOTS = 32;
const SLOTTED = Array.from({ length: MOST_SLOTS }, (_, n) => [
  `erevos.space.${n}`,
  `erevos.hidden.${n}`,
  ...OTHER_POCKETS.map((p) => `erevos.hidden${p}.${n}`),
  `erevos.queues.${n}`,
  ...Array.from({ length: POCKETS }, (_, p) => `erevos.queues${p}.${n}`),
  `erevos.keep.${n}`,
]).flat();
const KEYS = [...FIXED, ...OTHER_POCKETS.map((p) => `erevos.hidden-lock.${p}`), ...SLOTTED];
// What lets closed chats be heard: each slot's queues for its hidden chats' notices and rings
// (hidden-watch.ts, hidden-ring.ts), each space's door (doors.ts) and the phone's door key, each
// as padded as on the phone. So a restore keeps those switches on, on another phone too. A backup
// from before they were in one holds none: restoring it leaves the phone's as they are.
const HEARD = [...Array.from({ length: MOST_SLOTS }, (_, n) => [`erevos.watch.${n}`, `erevos.ring.${n}`, `erevos.door.${n}`]).flat(), 'erevos.doors-key'];
// The phone's own settings, the same in every space, that go with its owner to another phone: the
// language (lib/i18n.ts), the modules on (lib/modules.ts), vibrate on touch (lib/haptics.ts), the
// number on the icon (lib/icon-number.ts), ringing and the messages' notice in the background
// and starting as the phone turns on (lib/background.ts; as a build before 3.0.0-rc.3 kept it,
// and the owner's choice, lib/boot-choice.ts), the battery mode (lib/battery-mode.ts), keeping the screen private
// (lib/screen-privacy.ts), the photos' quality (lib/photo-quality.ts), carrying for phones nearby,
// the same Wi-Fi, Wi-Fi Direct and Wi-Fi Aware (lib/nearby-links.ts), the LoRa radio, which is the
// owner's and not the phone's (lib/radio.ts), whether the Phone opens without the password
// (lib/phone-open.ts), whether the camera does (lock/camera-drop.ts), and whether backups hold the
// phone's SMS (lib/backup-sms.ts) and its calls (lib/backup-calls.ts).
const SETTINGS = [
  'erevos.lang',
  'erevos.modules',
  'erevos.haptics',
  'erevos.icon-number',
  'erevos.ring-background',
  'erevos.message-notices',
  'erevos.boot-start',
  'erevos.boot-choice',
  'erevos.battery',
  'erevos.screen-private',
  'erevos.photo-quality',
  'erevos.carry',
  'erevos.lan',
  'erevos.direct',
  'erevos.aware',
  'erevos.lora',
  'erevos.phone-open',
  CAMERA_OPEN_KEY,
  'erevos.backup-sms',
  'erevos.backup-calls',
];
const AUTO = 'erevos.backup-auto';
const CLOUD = 'erevos.backup-cloud';
const LORA = 'erevos.lora';
// The keystore entries a backup holds from PARTS on: restoring one deletes those it does not hold.
const LATER_KEYS = [PANIC_KEY, ...SETTINGS, AUTO, CLOUD];
// The keystore entries no backup holds and every restore deletes: the copy of one space's speed
// dial numbers that the Phone calls with Erevos locked (lib/phone-open.ts). The spaces are the
// backup's from then on, and the one that kept the copy may not be among them: nothing could take
// it away then. A space that kept it turns it on again. And the public key the camera seals for
// with Erevos locked (lock/camera-drop.ts), which is one space's too: the next space that opens
// gives its own, and what was taken for the old one goes with the restore (discardDrops).
const NEVER_KEPT = ['erevos.phone-speed', CAMERA_DROP_KEY];
// A setting a restore leaves as the phone has it when the backup holds none (one made before the
// setting was): whether the camera opens without the password, which is on unless turned off, so a
// backup that says nothing must not turn it on again.
const STAYS_UNSAID = [CAMERA_OPEN_KEY];

// The sealed files that are text; voice messages' sounds, pictures and stickers' pictures are
// bytes. A file not on the phone is left out, so the backup of a phone that keeps no contacts, or
// made no stickers, in Erevos still opens in older versions. The accounts on Matrix, XMPP and
// Nostr, the spaces' and their hidden places', are among them, with the pages their values take:
// restored, a Nostr key goes on as it was, an XMPP account as a new device of itself, and a Matrix
// one is let go of, to sign in again (lib/xmpp-store.ts, lib/matrix-store.ts). An older Erevos
// leaves them out of what it restores. So are the pieces of photos that came through Nostr and
// wait for their message, each place's (lock/nostr-pieces-data.ts), with their pages. And the
// Collections' catalogues (lock/collection-data.ts), which name their files among the chunks:
// without them a restored phone would hold the chunks and nothing to open them by. And the order of
// the lists of chats, pinned and archived (lock/chat-list-data.ts), the space's and each place's. And
// the messages starred in the chats on Matrix, XMPP and Nostr and in the SMS (lock/stars-data.ts). And
// each place's Telegram of the ErevosGram build (lock/telegram-data.ts): whether it signed in, and the
// ErevosGram encryption's keys; TDLib's own folder is never in a backup, so a restored one signs in
// to Telegram again, with its encrypted chats as they were.
// And Erevos+'s Session account, sealed with the first space's key (lock/networks-backup-data.ts).
const TEXT_FILES = [E2E, HISTORY, ARCHIVE, GROUPS, PUBLIC_GROUPS, SMS_ORDER, CHAT_LIST, CONTACTS, STICKERS, MYSELF, MATRIX, XMPP, NOSTR_DM, NOSTR_PIECES, COLLECTION, STARS, TELEGRAM, MSG_OWN, NETWORKS];
// The sealed files no backup holds, whose values may lie in pages too: the linked devices and the
// account's log (lock/devices-data.ts, lock/sync-data.ts). Restoring deletes every page the backup
// does not hold, theirs among them, so they go with their pages: a restored space links anew, its
// devices asked to from the chat's Relinks.
const PHONE_FILES = [DEVICES, SYNC];
// Those a backup holds from PARTS on, the copies and carried packets first (see above); restoring
// one deletes those it does not hold.
const LATER_FILES = [FANOUT, CARRIED, SMS, PHONE];

const KIND_KEY = 0;
const KIND_TEXT = 1;
const KIND_BYTES = 2;
const KIND_PHONE_SMS = 3;
const PHONE_SMS = 'phone-sms';
// Bytes of nothing, so a bare backup is of one of Padmé's sizes. Skipped when opened.
const KIND_PAD = 4;
const PAD = 'pad';
// The backup's id and its parts' names.
const KIND_PARTS = 5;
const PARTS = 'parts';
// The phone module's own settings (lib/backup-native.ts).
const KIND_NATIVE = 6;
const NATIVE = 'phone';
// A keystore entry, as written from 6.0.0 on; read as KEY (see above).
const KIND_SECRET = 7;
// The phone's call history and blocked numbers (lib/backup-calls.ts).
const KIND_PHONE_CALLS = 8;
const PHONE_CALLS = 'phone-calls';
// The backup's id and its parts, as PARTS, some of them made for earlier backups (see above).
const KIND_SHARED = 9;
// The kinds this Erevos knows: any other is a newer one's.
const KINDS = new Set([KIND_KEY, KIND_TEXT, KIND_BYTES, KIND_PHONE_SMS, KIND_PAD, KIND_PARTS, KIND_NATIVE, KIND_SECRET, KIND_PHONE_CALLS, KIND_SHARED]);
// An entry's kind, name length and data length, and PAD's name.
const PAD_ENTRY = 1 + 2 + 4 + PAD.length;
// What follows MAGIC: the salt, PBKDF2's rounds, Argon2id's salt, memory and passes.
const HEAD = SALT + 4 + SALT + 8;

/** The most bytes of photos, files and voice messages a part holds: what is in memory at once. One
 *  larger than that, which no chunk of a file is, has a part of its own. */
export const PART = 4 * 1024 * 1024;
// The backup's id, and what a part seals before its entries: that id and the part's number.
const ID = 16;
const PART_HEAD = ID + 4;
const PART_LABEL = utf8Encode('erevos backup parts 1\n');
// The most parts a backup names: far more than a phone holds.
const MOST_PARTS = 1_000_000;
// What AES-GCM adds to what it seals: its nonce and tag.
const SEALING = 12 + 16;

/** The size of a full bare part, as sent to a server: every bare part's is a whole number of it. */
export const BARE_PART = PART_HEAD + PART + PAD_ENTRY + SEALING;

type Entry = { kind: number; name: string; data: Uint8Array };

/** What binds a part to the backup that names it, beside its name: its size and SHA-256 (hex), the
 *  id (hex) of the backup it was made for and its number there, the files it holds, and which of
 *  them, by their place in `files`, the backup that names it gives from another part instead. */
export type PartRecord = { size: number; sha: string; id: string; n: number; files: string[]; out: number[] };

/** A part an automatic backup named, as the next one in the same place may name it again: its name
 *  there, what binds it, and each of its files' stamp (lib/files.ts) when it was made, '' where none
 *  was told. The stamps stay on the phone (lib/backup-ledger.ts): no backup holds them. */
export type PartMade = PartRecord & { name: string; stamps: string[] };

/** The parts of a backup, opened: their names in their order, with the backup's id and the key
 *  that opens them, the id of the phone it was made on ('' when it does not say), and what binds
 *  each part, in the same order (null for a backup that does not say, made by hand or before). */
export type BackupParts = { names: string[]; id: Uint8Array; key: Uint8Array; phone: string; made: PartRecord[] | null };

/** What a backup holds, opened: ready to restore. `unknown`: how many entries in it have a name
 *  this Erevos does not restore, left out. `parts`: its photos, files and voice messages,
 *  in parts of their own; null for a backup from before them. */
export type Backup = { entries: Entry[]; size: number; unknown: number; parts: BackupParts | null };

/** Argon2id's salt and cost for a backup's key. */
export type BackupHard = HardCost & { salt: Uint8Array };

/** The key a password gives for backups, with the salt and rounds it came from. `hard` is null
 *  for a backup from before Argon2id. */
// The most a backup file may ask of the phone before its password is known: a file made
// elsewhere, by anyone, could otherwise name a cost that keeps a small phone busy for minutes or
// runs it out of memory. Five times the PBKDF2 rounds and twice the Argon2id cost Erevos makes
// (ITER, HARD): a later Erevos that makes dearer keys raises these first, in a release before.
export const MAX_BACKUP_ITER = 1_000_000;
export const MAX_BACKUP_HARD: HardCost = { m: 64 * 1024, t: 6 };

export type BackupKey = { key: Uint8Array; salt: Uint8Array; iter: number; hard: BackupHard | null };

/** Where each part of a backup being made goes: it keeps the bytes and gives the name they are kept under. */
export type PartSink = (bytes: Uint8Array) => Promise<string>;

/** Where a backup's parts are read from to restore it: the bytes kept under a name, or null when none are. */
export type PartReader = (name: string) => Promise<Uint8Array | null>;

export class NotABackupError extends Error {
  constructor() {
    super(t('That file is not an Erevos backup.'));
  }
}

/** The backup holds what only a newer Erevos knows: it is refused, and nothing changed. */
export class NewerBackupError extends Error {
  constructor() {
    super(t('A newer Erevos made this backup, so this one cannot restore it. Update Erevos to the latest version, then restore it.'));
  }
}

export class WrongBackupPasswordError extends Error {
  constructor() {
    super(t('Wrong password for this backup.'));
  }
}

/** A part of the backup is not where its other files are. Nothing was put in place, unless the
 *  owner wanted the rest without it. */
export class MissingPartError extends Error {
  readonly part: string;

  constructor(part: string) {
    super(t('A file of this backup is missing: {name}. Nothing was changed.', { name: part }));
    this.part = part;
  }
}

/** A part of the backup is damaged, or is another backup's. Nothing was put in place, unless the
 *  owner wanted the rest without it. */
export class DamagedPartError extends Error {
  readonly part: string;

  constructor(part: string) {
    super(t('A file of this backup is damaged, or belongs to another backup: {name}. Nothing was changed.', { name: part }));
    this.part = part;
  }
}

/** A new backup hard cost, with its own salt. */
export const newBackupHard = (): BackupHard => ({ salt: randomBytes(SALT), ...hardCost() });

/** The backup key that K, PBKDF2's key, gives with Argon2id. So automatic backups whose K was kept
 *  from before Argon2id get it without the password (lib/backup-folder.ts). */
export function hardBackupKey(k: Uint8Array, hard: BackupHard): Promise<Uint8Array> {
  return hardKey(k, hard.salt, hard);
}

export async function backupKey(password: string, salt = randomBytes(SALT), iter = ITER, hard: BackupHard | null = newBackupHard()): Promise<BackupKey> {
  const k = await deriveKey(password, salt, iter);
  return { key: hard ? await hardBackupKey(k, hard) : k, salt, iter, hard };
}

/** Whether `password` gives the backup key `kept`, with its salt and cost (automatic backups', lib/backup-folder.ts). */
export async function isBackupPassword(password: string, kept: BackupKey): Promise<boolean> {
  const pbkdf2 = await deriveKey(password, kept.salt, kept.iter);
  const key = kept.hard ? await hardBackupKey(pbkdf2, kept.hard) : pbkdf2;
  return sameBytes(key, kept.key);
}

// The key the parts are sealed with: another than the backup's own, so a part never opens as a
// backup, nor a backup as a part.
function partKey(key: Uint8Array): Uint8Array {
  const joined = new Uint8Array(PART_LABEL.length + key.length);
  joined.set(PART_LABEL);
  joined.set(key, PART_LABEL.length);
  return sha256Bytes(joined);
}

// Automatic backups' settings go in a backup without their folder, which is this phone's, and
// without the last error, said in this phone's language; so does the server's last error.
function portable(name: string, value: string): string {
  if (name !== AUTO && name !== CLOUD) return value;
  try {
    const kept = JSON.parse(value) as Record<string, unknown>;
    return JSON.stringify(name === AUTO ? { ...kept, folder: '', error: '' } : { ...kept, error: '' });
  } catch {
    return value;
  }
}

// A keystore entry of JSON's, or null.
function jsonOf(value: string | null): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value ?? 'null') as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// What of a keystore entry restored stays this phone's (`here`, its entry before the restore):
// automatic backups go on into the folder this phone had for them, or into none, until one is
// chosen, and when it was last written to. Sending to the same server, the phone's list of what it
// sent there stays, so all of it is deleted in its turn. With the same LoRa radio, what this phone
// kept of the radio's own settings from before Erevos changed them stays, to put back (lib/radio.ts).
function keptHere(name: string, value: string, here: string | null): string {
  if (name !== AUTO && name !== CLOUD && name !== LORA) return value;
  const restored = jsonOf(value);
  if (!restored) return value;
  const was = jsonOf(here);
  if (name === LORA) return was && was.address === restored.address && was.kept ? JSON.stringify({ ...restored, kept: was.kept }) : value;
  if (name === AUTO) {
    const folder = typeof was?.folder === 'string' ? was.folder : '';
    const last = folder && typeof was?.last === 'number' ? was.last : restored.last;
    return JSON.stringify({ ...restored, folder, last, error: '' });
  }
  if (!was || was.url !== restored.url) return JSON.stringify({ ...restored, error: '' });
  return JSON.stringify({ ...restored, names: was.names, parts: was.parts, held: was.held, unfinished: was.unfinished, last: was.last, error: '' });
}

// What the backup itself holds: everything but the photos, files and voice messages. The copies
// and carried packets are read before the chats' keys and messages (LATER_FILES). The files are
// read before the pages, and no page is deleted until all are read, so every page a file read
// here names is in the backup, even when the app saves meanwhile.
async function collect(): Promise<Entry[]> {
  const release = holdPages();
  try {
    return await collectHeld();
  } finally {
    await release();
  }
}

async function collectHeld(): Promise<Entry[]> {
  const entries: Entry[] = [];
  for (const name of [...KEYS, ...HEARD, ...LATER_KEYS]) {
    const value = await secureGet(name);
    if (value !== null) entries.push({ kind: KIND_KEY, name, data: utf8Encode(portable(name, value)) });
  }
  for (const name of [FANOUT, CARRIED, ...TEXT_FILES, SMS, PHONE]) {
    const text = await readFile(name);
    if (text !== null) entries.push({ kind: KIND_TEXT, name, data: utf8Encode(text) });
  }
  for (const name of [...(await listFiles(AVATAR)), ...(await listFiles(PAGE))].sort()) {
    const bytes = await readBytes(name);
    if (bytes) entries.push({ kind: KIND_BYTES, name, data: bytes });
  }
  return entries;
}

const entrySize = (entry: Entry, name: Uint8Array) => 1 + 2 + name.length + 4 + entry.data.length;

// The entries one after another, after `head`.
function pack(entries: Entry[], head = new Uint8Array(0)): Uint8Array {
  const names = entries.map((entry) => utf8Encode(entry.name));
  const size = entries.reduce((sum, entry, i) => sum + entrySize(entry, names[i]), head.length);
  const out = new Uint8Array(size);
  out.set(head);
  const view = new DataView(out.buffer);
  let at = head.length;
  entries.forEach((entry, i) => {
    out[at] = entry.kind === KIND_KEY ? KIND_SECRET : entry.kind;
    view.setUint16(at + 1, names[i].length);
    out.set(names[i], at + 3);
    at += 3 + names[i].length;
    view.setUint32(at, entry.data.length);
    out.set(entry.data, at + 4);
    at += 4 + entry.data.length;
  });
  return out;
}

const fileName = (name: string) => /^[a-z0-9-]+$/.test(name);

// A name a backup may restore: one of the keystore entries above, or a file of Erevos's own.
function allowed(kind: number, name: string): boolean {
  if (kind === KIND_KEY) return KEYS.includes(name) || HEARD.includes(name) || LATER_KEYS.includes(name);
  if (kind === KIND_TEXT) return TEXT_FILES.includes(name) || LATER_FILES.includes(name);
  if (kind === KIND_PHONE_SMS) return name === PHONE_SMS;
  if (kind === KIND_PHONE_CALLS) return name === PHONE_CALLS;
  if (kind === KIND_PARTS || kind === KIND_SHARED) return name === PARTS;
  if (kind === KIND_NATIVE) return name === NATIVE;
  return kind === KIND_BYTES && (name.startsWith(VOICE) || name.startsWith(AVATAR) || name.startsWith(PAGE)) && fileName(name);
}

// What a part may hold: photos' and files' chunks, and voice messages.
const inPart = (kind: number, name: string) => kind === KIND_BYTES && (name.startsWith(ATTACHMENT) || name.startsWith(VOICE)) && fileName(name);

function unpack(bytes: Uint8Array, known: (kind: number, name: string) => boolean = allowed): { entries: Entry[]; unknown: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const entries: Entry[] = [];
  let unknown = 0;
  let at = 0;
  while (at < bytes.length) {
    if (at + 3 > bytes.length) throw new NotABackupError();
    if (!KINDS.has(bytes[at])) throw new NewerBackupError();
    const kind = bytes[at] === KIND_SECRET ? KIND_KEY : bytes[at];
    const nameLength = view.getUint16(at + 1);
    at += 3;
    if (at + nameLength + 4 > bytes.length) throw new NotABackupError();
    const name = utf8Decode(bytes.subarray(at, at + nameLength));
    at += nameLength;
    const length = view.getUint32(at);
    at += 4;
    if (at + length > bytes.length) throw new NotABackupError();
    // A name this Erevos does not restore is left out and never written.
    if (kind === KIND_PAD && name === PAD) {
      // Nothing, there for the size.
    } else if (known(kind, name)) entries.push({ kind, name, data: bytes.slice(at, at + length) });
    else unknown++;
    at += length;
  }
  return { entries, unknown };
}

/**
 * Padmé's size for `length` bytes: rounded up so that only its top bits, about log2 of its log2,
 * can differ, which adds 12% at most. Sizes of this kind tell little more than the order of size.
 */
export function padme(length: number): number {
  if (length < 2) return length;
  const e = Math.floor(Math.log2(length));
  const step = 2 ** (e - (Math.floor(Math.log2(e)) + 1));
  return Math.ceil(length / step) * step;
}

// The mask of a bare backup's head after its first salt: SHA-256 of that salt.
function maskHead(head: Uint8Array) {
  const mask = sha256Bytes(head.subarray(0, SALT));
  for (let i = SALT; i < head.length; i++) head[i] ^= mask[i - SALT];
}

// A part: its entries, after the backup's id and its number, sealed with the parts' key. Bare, it
// is padded to the size of a full part, or, holding a larger entry, of a whole number of them.
function sealPart(key: Uint8Array, id: Uint8Array, n: number, entries: Entry[], bare: boolean): Uint8Array {
  const head = new Uint8Array(PART_HEAD);
  head.set(id);
  new DataView(head.buffer).setUint32(ID, n);
  if (bare) {
    const size = PART_HEAD + entries.reduce((sum, entry) => sum + entrySize(entry, utf8Encode(entry.name)), 0) + PAD_ENTRY;
    const to = Math.ceil((size + SEALING) / BARE_PART) * BARE_PART - SEALING;
    entries = [...entries, { kind: KIND_PAD, name: PAD, data: new Uint8Array(to - size) }];
  }
  return encryptBytes(key, pack(entries, head));
}

// The entries of part `n` of the backup `id`, named `name`. Throws DamagedPartError when it is not
// that one. With what binds it (`record`), it is of that size and SHA-256 too, and only the files
// the backup gives from it are given, each of them there.
function openPart(key: Uint8Array, id: Uint8Array, n: number, name: string, bytes: Uint8Array, record: PartRecord | null = null): Entry[] {
  if (record && (bytes.length !== record.size || toHex(sha256Bytes(bytes)) !== record.sha)) throw new DamagedPartError(name);
  let plain: Uint8Array;
  try {
    plain = decryptBytes(key, bytes);
  } catch {
    throw new DamagedPartError(name);
  }
  if (plain.length < PART_HEAD || !sameBytes(plain.subarray(0, ID), id) || new DataView(plain.buffer, plain.byteOffset + ID, 4).getUint32(0) !== n) throw new DamagedPartError(name);
  let entries: Entry[];
  try {
    // What a newer Erevos may put in a part and this one does not know is left out, as in the backup.
    entries = unpack(plain.subarray(PART_HEAD), inPart).entries;
  } catch {
    throw new DamagedPartError(name);
  }
  if (!record) return entries;
  const held = new Set(record.files.filter((_, i) => !record.out.includes(i)));
  const given = entries.filter((entry) => held.has(entry.name));
  if (new Set(given.map((entry) => entry.name)).size !== held.size) throw new DamagedPartError(name);
  return given;
}

const whole = (value: unknown, most: number): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= most;

/** The parts earlier backups named (`backups`, each one's, the newest first) that are still there
 *  whole (`there`), each once, in that order: those the next automatic backup there may name again. */
export function earlierParts(backups: readonly (readonly PartMade[])[], there: (part: PartMade) => boolean): PartMade[] {
  const seen = new Set<string>();
  const parts: PartMade[] = [];
  for (const backup of backups)
    for (const part of backup) {
      if (seen.has(part.name) || !there(part)) continue;
      seen.add(part.name);
      parts.push(part);
    }
  return parts;
}

// The stamps of the files, by their name (lib/files.ts).
async function stampsOf(attachments: string[], voices: string[]): Promise<Map<string, string>> {
  return new Map([...(await fileStamps(attachments, ATTACHMENT)), ...(await fileStamps(voices, VOICE))]);
}

// Makes the parts, a few MB at a time, and gives what each is, in their order. For an automatic
// backup (`earlier` given) first the earlier parts it names again, each with all its files still on
// the phone as they were, none of them left out (`skip`), and holding one at least that no part
// before it holds: a part holding a file deleted, written again or left out since is not named
// again, so what the owner deleted, or keeps out of backups, leaves the place with the backups that
// held it. Of a part named again, the files a part before it holds are not this one's to restore
// (`out`). Then new ones for the rest; a file left out goes in none.
async function makeParts(
  key: Uint8Array,
  id: Uint8Array,
  sink: PartSink,
  { bare, progress, skip, earlier }: { bare: boolean; progress?: (done: number, all: number) => void; skip?: ReadonlySet<string>; earlier?: readonly PartMade[] },
): Promise<PartMade[]> {
  const attachments = (await listFiles(ATTACHMENT)).filter(fileName);
  const voices = (await listFiles(VOICE)).filter(fileName);
  // Each file's stamp, taken before it is read: one written again meanwhile is not named again next time.
  const stamps = earlier ? await stampsOf(attachments, voices) : new Map<string, string>();
  const wanted = [...attachments, ...voices].filter((name) => !skip?.has(name)).sort();
  const made: PartMade[] = [];
  const covered = new Set<string>();
  for (const part of earlier ?? []) {
    if (part.files.length === 0 || part.stamps.length !== part.files.length) continue;
    if (!part.files.every((file, i) => !!part.stamps[i] && stamps.get(file) === part.stamps[i] && !skip?.has(file))) continue;
    const out = part.files.flatMap((file, i) => (covered.has(file) ? [i] : []));
    if (out.length === part.files.length) continue;
    part.files.forEach((file, i) => !out.includes(i) && covered.add(file));
    made.push({ ...part, out });
  }
  const rest = wanted.filter((name) => !covered.has(name));
  const done = wanted.length - rest.length;
  if (done) progress?.(done, wanted.length);
  let held: Entry[] = [];
  let size = 0;
  const flush = async () => {
    if (held.length === 0) return;
    const n = made.length;
    const sealed = sealPart(key, id, n, held, bare);
    const files = held.map((entry) => entry.name);
    held = [];
    size = 0;
    // Its SHA-256 only where the backup says it: one made by hand is as before.
    const record = { size: sealed.length, sha: earlier ? toHex(sha256Bytes(sealed)) : '', id: toHex(id), n, files, out: [], stamps: files.map((file) => stamps.get(file) ?? '') };
    made.push({ ...record, name: await sink(sealed) });
  };
  for (let i = 0; i < rest.length; i++) {
    // One deleted since it was listed is left out, as its message is gone too.
    const data = await readBytes(rest[i]);
    if (data) {
      const entry = { kind: KIND_BYTES, name: rest[i], data };
      const length = entrySize(entry, utf8Encode(entry.name));
      if (size > 0 && size + length > PART) await flush();
      held.push(entry);
      size += length;
    }
    progress?.(done + i + 1, wanted.length);
  }
  await flush();
  return made;
}

/** How a backup is made: where its parts go, and what it holds besides what is on the phone. */
export type MakeOptions = {
  /** Where each part goes, as it is made, in its order. */
  parts: PartSink;
  /** The phone's SMS and MMS (lib/backup-sms.ts). */
  phoneSms?: Uint8Array | null;
  /** The phone's call history and blocked numbers (lib/backup-calls.ts). */
  phoneCalls?: Uint8Array | null;
  /** The phone module's own settings (lib/backup-native.ts). */
  native?: Uint8Array | null;
  /** Made as one sent to a server is: random bytes to look at, the backup of one of Padmé's
   *  sizes and each part of one size. */
  bare?: boolean;
  /** Told, as the parts are made, how many of the photos', files' and voice messages' files went in, of how many. */
  progress?: (done: number, all: number) => void;
  /** The chunk files left out: those of the open places' Collections that stay out of backups (lock/collection-data.ts). */
  skip?: ReadonlySet<string>;
  /** For an automatic backup: the parts of earlier ones in the place its parts go to, sealed with
   *  the same key, the newest first (earlierParts), to name again where it can. Given, even empty,
   *  the backup says what binds each of its parts (PartRecord), and makes a new one take its SHA-256. */
  earlier?: readonly PartMade[];
  /** Told what each part the backup names is, in their order, once they are all made: what the next
   *  automatic backup there may take as `earlier`. */
  made?: (parts: PartMade[]) => void;
};

// What a backup says of a part, as JSON: its out only when it has some.
const recordJson = ({ size, sha, id, n, files, out }: PartRecord) => (out.length ? { size, sha, id, n, files, out } : { size, sha, id, n, files });

/** A backup of everything on the phone, sealed with `key`: its parts go to `parts` first, one at a
 *  time, then the bytes of the backup itself, which names them, are given back. */
export async function makeBackup({ key, salt, iter, hard }: BackupKey, { parts, phoneSms = null, phoneCalls = null, native = null, bare = false, progress, skip, earlier, made }: MakeOptions): Promise<Uint8Array> {
  // Every backup made has Argon2id: a key without it is only for opening old ones.
  if (!hard) throw new Error('a backup is made with Argon2id');
  // The backup itself is read first, then the parts: a photo its messages show is on the phone then.
  const entries = await collect();
  if (phoneSms) entries.push({ kind: KIND_PHONE_SMS, name: PHONE_SMS, data: phoneSms });
  if (phoneCalls) entries.push({ kind: KIND_PHONE_CALLS, name: PHONE_CALLS, data: phoneCalls });
  if (native) entries.push({ kind: KIND_NATIVE, name: NATIVE, data: native });
  const id = randomBytes(ID);
  const phone = await phoneId();
  const named = await makeParts(partKey(key), id, parts, { bare, progress, skip, earlier });
  const names = named.map((part) => part.name);
  // One that names a part of an earlier backup is of a kind an Erevos from before refuses.
  const shared = named.some((part) => part.id !== toHex(id));
  const table = earlier ? { id: toHex(id), names, phone, made: named.map(recordJson) } : { id: toHex(id), names, phone };
  entries.push({ kind: shared ? KIND_SHARED : KIND_PARTS, name: PARTS, data: utf8Encode(JSON.stringify(table)) });
  if (bare) {
    const size = HEAD + SEALING + pack(entries).length + PAD_ENTRY;
    entries.push({ kind: KIND_PAD, name: PAD, data: new Uint8Array(padme(size) - size) });
  }
  const sealed = encryptBytes(key, pack(entries));
  const at = bare ? 0 : MAGIC.length;
  const out = new Uint8Array(at + HEAD + sealed.length);
  const view = new DataView(out.buffer);
  if (!bare) out.set(MAGIC);
  out.set(salt, at);
  view.setUint32(at + SALT, iter);
  out.set(hard.salt, at + SALT + 4);
  view.setUint32(at + SALT + 4 + SALT, hard.m);
  view.setUint32(at + SALT + 4 + SALT + 4, hard.t);
  if (bare) maskHead(out.subarray(0, HEAD));
  out.set(sealed, at + HEAD);
  made?.(named);
  return out;
}

const HEX_ID = /^[0-9a-f]{32}$/;
const HEX_SHA = /^[0-9a-f]{64}$/;

// What a backup says binds each of its `count` parts (PartRecord), checked: null when it is not as
// Erevos says it. What a newer Erevos may add to each is left out.
function recordsOf(value: unknown, count: number): PartRecord[] | null {
  if (!Array.isArray(value) || value.length !== count) return null;
  const records: PartRecord[] = [];
  for (const one of value as unknown[]) {
    const v = (one ?? {}) as Partial<Record<keyof PartRecord, unknown>>;
    if (typeof v.id !== 'string' || !HEX_ID.test(v.id) || typeof v.sha !== 'string' || !HEX_SHA.test(v.sha)) return null;
    if (!whole(v.n, MOST_PARTS) || !whole(v.size, Number.MAX_SAFE_INTEGER) || v.size <= SEALING + PART_HEAD) return null;
    const files = v.files;
    if (!Array.isArray(files) || files.length === 0 || !files.every((file): file is string => typeof file === 'string' && inPart(KIND_BYTES, file))) return null;
    const out = v.out ?? [];
    if (!Array.isArray(out) || !out.every((i) => whole(i, files.length - 1)) || new Set(out).size === files.length) return null;
    records.push({ size: v.size, sha: v.sha, id: v.id, n: v.n, files, out: [...new Set(out as number[])] });
  }
  return records;
}

// The parts a backup's PARTS or SHARED entry names. Throws NotABackupError when it is not one Erevos makes.
function partsOf(entry: Entry, key: Uint8Array): BackupParts {
  try {
    const value = JSON.parse(utf8Decode(entry.data)) as { id?: unknown; names?: unknown; phone?: unknown; made?: unknown };
    const names = value.names;
    if (typeof value.id !== 'string' || !HEX_ID.test(value.id) || !Array.isArray(names) || names.length > MOST_PARTS) throw new NotABackupError();
    // A name of a file or an upload, no path: each place reads only names of its own (lib/backup-place.ts, lib/backup-cloud.ts).
    // eslint-disable-next-line no-control-regex
    if (!names.every((name): name is string => typeof name === 'string' && /^[^/\\\u0000-\u001f]{1,255}$/.test(name))) throw new NotABackupError();
    const phone = typeof value.phone === 'string' && value.phone.length <= 64 ? value.phone : '';
    let made = value.made === undefined ? null : recordsOf(value.made, names.length);
    // SHARED says what binds each part; PARTS only of its own parts, each where the backup put it,
    // and what it says otherwise is not heeded, as an Erevos from before does not heed it either.
    if (entry.kind === KIND_SHARED && !made) throw new NotABackupError();
    if (entry.kind === KIND_PARTS && made?.some((record, n) => record.id !== value.id || record.n !== n || record.out.length > 0)) made = null;
    return { names, id: fromHex(value.id), key: partKey(key), phone, made };
  } catch {
    throw new NotABackupError();
  }
}

/** Opens a backup file with its password, a bare one too. Throws NotABackupError, NewerBackupError or WrongBackupPasswordError. */
export function openBackup(bytes: Uint8Array, password: string): Promise<Backup> {
  return openSealed(bytes, async (salt, iter, hard) => (await backupKey(password, salt, iter, hard)).key);
}

/** Opens a backup file with the key automatic backups keep (lib/backup-folder.ts), without their
 *  password: to check one they made. Throws WrongBackupPasswordError when it is not made with it. */
export function openBackupWithKey(bytes: Uint8Array, kept: Pick<BackupKey, 'key' | 'salt'>): Promise<Backup> {
  return openSealed(bytes, async (salt) => {
    if (!sameBytes(salt, kept.salt)) throw new WrongBackupPasswordError();
    return kept.key;
  });
}

/** Whether part `n` of an opened backup, read back as `bytes`, is the one it names, whole: throws
 *  DamagedPartError when it is not. */
export function checkPart({ names, id, key, made }: BackupParts, n: number, bytes: Uint8Array): void {
  const record = made?.[n] ?? null;
  if (record) openPart(key, fromHex(record.id), record.n, names[n], bytes, record);
  else openPart(key, id, n, names[n], bytes);
}

async function openSealed(bytes: Uint8Array, derive: (salt: Uint8Array, iter: number, hard: BackupHard | null) => Promise<Uint8Array>): Promise<Backup> {
  const old = bytes.length >= MAGIC_1.length && sameBytes(bytes.subarray(0, MAGIC_1.length), MAGIC_1);
  const bare = !old && !(bytes.length >= MAGIC.length && sameBytes(bytes.subarray(0, MAGIC.length), MAGIC));
  const at = bare ? 0 : MAGIC.length;
  const length = old ? SALT + 4 : HEAD;
  if (bytes.length < at + length) throw new NotABackupError();
  const head = bytes.slice(at, at + length);
  if (bare) maskHead(head);
  const view = new DataView(head.buffer);
  const salt = head.slice(0, SALT);
  const iter = view.getUint32(SALT);
  if (iter < 1000 || iter > MAX_BACKUP_ITER) throw new NotABackupError();
  let hard: BackupHard | null = null;
  if (!old) {
    hard = { salt: head.slice(SALT + 4, SALT + 4 + SALT), m: view.getUint32(SALT + 4 + SALT), t: view.getUint32(SALT + 4 + SALT + 4) };
    // A cost no Erevos makes, as a made-up file may name to keep the phone busy.
    if (!isHardCost(hard) || hard.m > MAX_BACKUP_HARD.m || hard.t > MAX_BACKUP_HARD.t) throw new NotABackupError();
  }
  const key = await derive(salt, iter, hard);
  let packed: Uint8Array;
  try {
    packed = decryptBytes(key, bytes.subarray(at + length));
  } catch {
    throw new WrongBackupPasswordError();
  }
  const { entries, unknown } = unpack(packed);
  if (!entries.some((entry) => entry.name === 'erevos.space-keys' || entry.name === 'erevos.lock')) throw new NotABackupError();
  const listed = entries.filter((entry) => entry.kind === KIND_PARTS || entry.kind === KIND_SHARED);
  if (listed.length > 1) throw new NotABackupError();
  const parts = listed.length ? partsOf(listed[0], key) : null;
  return { entries: entries.filter((entry) => entry.kind !== KIND_PARTS && entry.kind !== KIND_SHARED), size: bytes.length, unknown, parts };
}

/** How a backup is restored. */
export type RestoreOptions = {
  /** Asked at the first part missing or damaged, with that error, whether to restore all the rest
   *  without what such parts hold: then the phone's own photos, files and voice messages all stay.
   *  Without it, or answered no, the restore throws the error and the phone stays as it was. */
  without?: (error: MissingPartError | DamagedPartError) => Promise<boolean>;
};

/** What a restore left out: the names of the parts missing or damaged, in their order. */
export type Restored = { left: string[] };

// Writes what the parts hold, each read and opened in turn: the names written, and the parts left
// out. At one missing or damaged, `without` says whether to go on without it and those like it; if
// not, what the parts wrote and the phone had not goes again, and nothing else changed.
async function restoreParts(
  { names, id, key, made }: BackupParts,
  read: PartReader | null,
  progress: ((done: number, all: number) => void) | undefined,
  without: RestoreOptions['without'],
): Promise<{ wrote: Set<string>; fresh: string[]; left: string[] }> {
  const wrote = new Set<string>();
  const left: string[] = [];
  if (names.length === 0) return { wrote, fresh: [], left };
  const had = new Set([...(await listFiles(ATTACHMENT)), ...(await listFiles(VOICE))]);
  let going = false;
  try {
    for (let n = 0; n < names.length; n++) {
      let entries: Entry[] = [];
      // A part made for an earlier backup is bound to that one, and gives only what this one takes from it.
      const record = made?.[n] ?? null;
      try {
        const bytes = read ? await read(names[n]) : null;
        if (!bytes) throw new MissingPartError(names[n]);
        entries = record ? openPart(key, fromHex(record.id), record.n, names[n], bytes, record) : openPart(key, id, n, names[n], bytes);
      } catch (error) {
        if (!(error instanceof MissingPartError || error instanceof DamagedPartError)) throw error;
        // Asked once: the owner who wants the rest without one wants it without the others too.
        if (!going && !(without && (await without(error)))) throw error;
        going = true;
        left.push(names[n]);
      }
      for (const entry of entries) {
        await writeBytes(entry.name, entry.data);
        wrote.add(entry.name);
      }
      progress?.(n + 1, names.length);
    }
  } catch (error) {
    for (const name of wrote) if (!had.has(name)) await deleteFile(name).catch(() => undefined);
    throw error;
  }
  // What the parts wrote that the phone had not: gone again should the rest of the restore fail.
  return { wrote, fresh: [...wrote].filter((name) => !had.has(name)), left };
}

/**
 * Puts a backup in place of everything Erevos keeps on the phone. What the phone had and the
 * backup does not is deleted. Its parts are read with `read`, first, and should one be missing or
 * damaged, it throws MissingPartError or DamagedPartError and the phone stays as it was, unless
 * `without` wants the rest restored without such parts (RestoreOptions). Open again afterwards
 * (the lock reads it all anew).
 */
/** What the phone holds now under each name a backup's entries write: null where it holds nothing. */
type Held = { kind: number; name: string; value: string | Uint8Array | null };

async function heldBefore(entries: readonly Entry[]): Promise<Held[]> {
  const held: Held[] = [];
  for (const { kind, name } of entries) {
    if (kind === KIND_TEXT) held.push({ kind, name, value: await readFile(name) });
    else if (kind === KIND_BYTES) held.push({ kind, name, value: await readBytes(name) });
    else if (kind === KIND_KEY) held.push({ kind, name, value: await secureGet(name) });
  }
  return held;
}

/** Puts back what heldBefore read, each on its own: one that fails does not keep the rest from going back. */
async function putBack(held: readonly Held[]): Promise<void> {
  for (const { kind, name, value } of held) {
    try {
      if (kind === KIND_KEY) await (typeof value === 'string' ? secureSet(name, value) : secureDelete(name));
      else if (value === null) await deleteFile(name);
      else if (typeof value === 'string') await writeFile(name, value);
      else await writeBytes(name, value);
    } catch {
      // As much as can go back does.
    }
  }
}

export async function restoreBackup(
  { entries, parts }: Backup,
  read: PartReader | null = null,
  progress?: (done: number, all: number) => void,
  { without }: RestoreOptions = {},
): Promise<Restored> {
  const keep = new Set(entries.map((entry) => entry.name));
  // The chats' conversations are as they were when the backup was made: each moves past the
  // message keys it may have used since, when its chat next opens. Marked before anything is
  // written, so no SMS for later it puts back goes by itself meanwhile (lock/restored.ts); taken
  // back when the parts changed nothing after all.
  const mine = await thisPhone();
  const undo = await markRestore(Date.now(), !!parts && (!mine || parts.phone !== mine));
  let left: string[] = [];
  let fresh: string[] = [];
  if (parts) {
    try {
      const done = await restoreParts(parts, read, progress, without);
      for (const name of done.wrote) keep.add(name);
      left = done.left;
      fresh = done.fresh;
    } catch (error) {
      await undo();
      throw error;
    }
  }
  // Read before anything else is put in place: what stays this phone's (keptHere).
  const here = new Map([
    [AUTO, await secureGet(AUTO)],
    [CLOUD, await secureGet(CLOUD)],
    [LORA, await secureGet(LORA)],
  ]);
  // What the backup puts in place, all of it before anything is taken away, and what each of those
  // held before: a write that fails (a full phone) puts every one back as it was, so the phone is
  // left as before the restore, never half one and half the other.
  const before = await heldBefore(entries);
  // Without some of its parts, the phone's own photos, files and voice messages all stay: which of
  // them those parts held, and the backup's messages show, nothing says.
  const own = left.length > 0;
  // What the phone had and the backup does not, small enough to hold while the restore goes on
  // (its texts, keys, photos of contacts and pages), read before any of it goes: should one not go
  // (or a write fail), all of it is put back as well, so the phone is as before the restore.
  const gone: Held[] = [];
  for (const name of [...TEXT_FILES, ...PHONE_FILES, ...(parts ? LATER_FILES : [])]) if (!keep.has(name)) gone.push({ kind: KIND_TEXT, name, value: await readFile(name) });
  for (const name of [...(await listFiles(AVATAR)), ...(await listFiles(PAGE))]) if (!keep.has(name)) gone.push({ kind: KIND_BYTES, name, value: await readBytes(name) });
  const heard = HEARD.some((name) => keep.has(name));
  for (const name of [...KEYS, ...(parts ? LATER_KEYS : []), ...(heard ? HEARD : [])]) if (!keep.has(name) && !STAYS_UNSAID.includes(name)) gone.push({ kind: KIND_KEY, name, value: await secureGet(name) });
  for (const name of NEVER_KEPT) gone.push({ kind: KIND_KEY, name, value: await secureGet(name) });
  try {
    for (const entry of entries) {
      if (entry.kind === KIND_TEXT) await writeFile(entry.name, utf8Decode(entry.data));
      if (entry.kind === KIND_BYTES) await writeBytes(entry.name, entry.data);
    }
    for (const entry of entries) if (entry.kind === KIND_KEY) await secureSet(entry.name, keptHere(entry.name, utf8Decode(entry.data), here.get(entry.name) ?? null));
    for (const { kind, name, value } of gone) {
      if (value === null) continue;
      if (kind === KIND_KEY) await secureDelete(name);
      else await deleteFile(name);
    }
  } catch (error) {
    await putBack(before);
    await putBack(gone);
    // The photos, files and voice messages its parts brought go too: unseen, they would only take
    // room, just when the phone is full.
    for (const name of fresh) await deleteFile(name).catch(() => undefined);
    await undo();
    throw error;
  }
  // The phone's own voice messages, photos and files the backup does not name, too big to hold:
  // the restore is done, so one that does not go stays, named by nothing (app/backup.tsx, «Leftovers»).
  for (const name of [...(own ? [] : await listFiles(VOICE)), ...(parts && !own ? await listFiles(ATTACHMENT) : [])]) {
    if (!keep.has(name)) await deleteFile(name).catch(() => undefined);
  }
  // What the camera took with Erevos locked and no space has taken in yet (lock/camera-drop.ts):
  // sealed for a space of before the restore, nothing will open it now.
  await discardDrops().catch(() => undefined);
  // One made before the queues entries were, or that held fewer spaces, has none for some: each is
  // there again, sealed with a random key, before anything opens, so which are used shows nowhere.
  await prepareQueueEntries();
  if (heard) {
    await prepareWatchEntries();
    await prepareRingEntries();
    await prepareDoors();
  }
  smsDataChanged();
  return { left };
}

/** The phone's SMS and MMS a backup holds, or null when it holds none. */
export function backupPhoneSms({ entries }: Backup): Uint8Array | null {
  return entries.find((entry) => entry.kind === KIND_PHONE_SMS)?.data ?? null;
}

/** The phone's call history and blocked numbers a backup holds, or null when it holds none. */
export function backupPhoneCalls({ entries }: Backup): Uint8Array | null {
  return entries.find((entry) => entry.kind === KIND_PHONE_CALLS)?.data ?? null;
}

/** The phone module's settings a backup holds (lib/backup-native.ts), or null when it holds none. */
export function backupNative({ entries }: Backup): Uint8Array | null {
  return entries.find((entry) => entry.kind === KIND_NATIVE)?.data ?? null;
}

/** The name a backup made at `now` gets: the date and time, on this phone's clock. */
export function backupName(now = Date.now()): string {
  const d = new Date(now);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `erevos-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.erevos`;
}

export const BACKUP_PREFIX = 'erevos-backup-';

// In a folder, a backup's file and its parts' files share a stem: the backup's name without its
// ending, erevos-backup-2026-11-04-0312, then .erevos for the backup and .part1.erevos, .part2.erevos…
// for its parts. desktop/backups.js and sailfish/src/shellserver.cpp read them the same way.
const ENDING = '.erevos';
const IN_FOLDER = /^(erevos-backup-[0-9-]+)(\.part[0-9]+)?\.erevos$/;

/** The stem of the files of a backup made at `now`. */
export const backupStem = (now = Date.now()): string => backupName(now).slice(0, -ENDING.length);

/** The stem of a backup made at `now` into a folder whose files cannot be listed: with its seconds
 *  and milliseconds, erevos-backup-2026-11-04-0312-45123, so no other made there has it. */
export function uniqueStem(now = Date.now()): string {
  const d = new Date(now);
  return `${backupStem(now)}-${String(d.getSeconds()).padStart(2, '0')}${String(d.getMilliseconds()).padStart(3, '0')}`;
}

/** The name of a backup's own file, by its stem. */
export const backupFileName = (stem: string): string => stem + ENDING;

/** The name of a backup's part `n` (from 1) in a folder, by its stem. */
export const partFileName = (stem: string, n: number): string => `${stem}.part${n}${ENDING}`;

/** Which backup a file in a folder belongs to, by its name: its stem, and whether it is one of its
 *  parts; null for a file of another kind. */
export function backupFileOf(name: string): { stem: string; part: boolean } | null {
  const found = IN_FOLDER.exec(name);
  return found ? { stem: found[1], part: !!found[2] } : null;
}

/** A stem no file in the folder has (`names`): `stem`, else stem-2, stem-3… for a second backup in the same minute. */
export function freeStem(stem: string, names: string[]): string {
  const taken = new Set(names.map((name) => backupFileOf(name)?.stem));
  let free = stem;
  for (let n = 2; taken.has(free); n++) free = `${stem}-${n}`;
  return free;
}

/**
 * The files of a folder that go once a backup was made into it, keeping the `keep` newest: the
 * older backups with their parts, and the parts of older ones that never ended. Those of a backup
 * newer than the newest whole one, still being made, stay; with `keep` 0 nothing goes. Stems are
 * dates, so the older sort first.
 */
export function staleBackups(names: string[], keep: number): string[] {
  if (keep <= 0) return [];
  const files = names.map((name) => ({ name, of: backupFileOf(name) })).filter((file) => file.of !== null);
  const whole = [...new Set(files.filter((file) => !file.of!.part).map((file) => file.of!.stem))].sort();
  if (whole.length === 0) return [];
  const kept = new Set(whole.slice(-keep));
  const newest = whole[whole.length - 1];
  return files.filter((file) => !kept.has(file.of!.stem) && file.of!.stem < newest).map((file) => file.name);
}

/**
 * The files of a folder that go once an automatic backup was made into it, whose parts may be
 * earlier backups' (see above), keeping the `keep` newest whole backups and every part one of them
 * names: the older backups' own files, and the parts none of the kept ones names. `named` gives the
 * names of the parts a backup names, by its file's name, or null when they are not known here, as
 * of one made by hand, or with another password: it may name any part there, so then no part goes
 * until it is no longer among the newest. The parts of a backup newer than the newest whole one,
 * still being made, stay. With `keep` 0 nothing goes.
 */
export function unneededFiles(names: string[], keep: number, named: (backup: string) => readonly string[] | null): string[] {
  if (keep <= 0) return [];
  const files = names.map((name) => ({ name, of: backupFileOf(name) })).filter((file) => file.of !== null);
  const whole = [...new Set(files.filter((file) => !file.of!.part).map((file) => file.of!.stem))].sort();
  if (whole.length === 0) return [];
  const kept = new Set(whole.slice(-keep));
  const newest = whole[whole.length - 1];
  const needed = new Set<string>();
  let known = true;
  for (const stem of kept) {
    const parts = named(backupFileName(stem));
    if (parts) for (const part of parts) needed.add(part);
    else known = false;
  }
  return files
    .filter(({ name, of }) => of!.stem < newest && (of!.part ? known && !needed.has(name) : !kept.has(of!.stem)))
    .map((file) => file.name);
}
