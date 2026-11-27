// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { PartMade, PartReader, PartSink } from '../lock/backup';
import { currentSpace } from '../lock/keys';

import {
  askAddress,
  backupsAmong,
  CloudError,
  CLOUD_RESTORE_MOST,
  isBackupName,
  isPartName,
  passing,
  sendBare,
  sentOf,
  tooLargeText,
  tryAgain,
  Unreached,
  type BarePlace,
  type BareSent,
  type CloudAnswer,
  type CloudFile,
  type CloudReuse,
} from './backup-cloud';
import { decryptText, encryptText, randomBytes, sha256Bytes, toBase64Url, toHex, utf8Decode, utf8Encode } from './crypto';
import { CAN_DRIVE, DRIVE_CLIENT_ID, DRIVE_PACKAGE } from './google-drive-ids';
import { t } from './i18n';
import type { HttpMethod } from './net-http';
import { secureDelete, secureGet, secureSet } from './secure';

// Automatic backups (lib/backup-folder.ts) kept in Google Drive too, when the owner wants it, on
// Android only: in a folder named Erevos that Erevos makes in the owner's own Drive. It is off
// until the owner signs in with Google, under Backups or at the first start's last step, each time
// after a warning that Google knows whose the account is (lib/google-drive-ids.ts says whether
// this app can at all).
//
// Google gets what a server gets (lib/backup-cloud.ts): bare backups, random bytes under random
// names, sealed with the backup's password, which never leaves the phone, and their parts, each a
// file of its own; the folder keeps the KEEP newest, with every part one of them names, and each
// backup names again the parts there it can, the same way (sendBare). Google still knows the
// account, that it is Erevos's, when a backup comes and how big it is, and the phone's address
// unless it goes through Tor: every request here goes as backups to a server go, as the open
// space's Tor way says (lib/net-http.ts). A file of up to RESUMABLE_ABOVE goes in one request with
// its name; a larger one in a resumable upload, whose address Google names in a header, which only
// a request that went straight gives back: through Tor it goes in one request too.
//
// The sign-in is OAuth 2.0 for an app on the phone (RFC 8252) with PKCE (RFC 7636), for one thing
// only, drive.file: the files Erevos made there itself, nothing else of the Drive. Erevos opens
// Google's page in the phone's browser, outside Erevos, so it does not go through Tor, and Google
// sends the browser back to <package>:/oauth2redirect (app/oauth2redirect.tsx) with a code. The
// sign-in's mark (state) and the secret its code needs (the verifier) wait for the browser in the
// keystore entry SIGN_IN, sealed with a key the open space's own gives, SIGN_IN_MS at most, and are
// taken at the first answer, whatever it is: a link made elsewhere finds nothing, and no code goes
// twice.
//
// The refresh token that keeps Erevos signed in is kept as a server's password is: in the keystore
// entry DRIVE, outside every space, as automatic backups' own settings, so they reach Google Drive
// whichever space is open, and in each backup, sealed with its password (lock/backup.ts). Access
// tokens, which last an hour, stay in memory only, and a new one is asked for when one ran out or
// Google refuses it. Tokens go only to Google, never in an address, and are never written in a log.
// Stopping takes the refresh token back at Google and forgets it here; the backups there stay.
//
// A backup there can be put back from Google Drive itself, as from a server (listDrive,
// fetchFromDrive, driveParts): with the account automatic backups go to, or after a sign-in for the
// restore alone, whose token stays in memory only.

/** A Google account Erevos may keep files in: the refresh token, and the folder Erevos made there,
 *  '' until it is found or made. */
export type DriveAccount = { refresh: string; folder: string };

/** Where automatic backups go in Google Drive: the account, and what went there, as for a server. */
export type DriveBackup = DriveAccount & BareSent;

/** What a sign-in is for: automatic backups to Google Drive, or a restore from it. */
export type DrivePurpose = 'backup' | 'restore';

/** A backup in Google Drive, as listDrive lists it: with its file's ID there. */
export type DriveFile = CloudFile & { id: string };

/** The app Google's sign-in is for: its client ID, and its Android package, which the browser
 *  comes back to. */
export type DriveClient = { id: string; package: string };

const DRIVE = 'erevos.backup-drive';
const SIGN_IN = 'erevos.drive-sign-in';

/** How long a sign-in waits for the browser to come back, milliseconds. */
export const SIGN_IN_MS = 10 * 60_000;

/** The one thing Erevos asks Google for: the files it made itself in the Drive. */
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

/** A file larger than this goes in a resumable upload; one of up to it, in one request with its
 *  name. */
export const RESUMABLE_ABOVE = 5 * 1024 * 1024;

const AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN = 'https://oauth2.googleapis.com/token';
const REVOKE = 'https://oauth2.googleapis.com/revoke';
const FILES = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
// Where Google's resumable uploads go: an address it names elsewhere is not followed.
const UPLOADS_AT = 'https://www.googleapis.com/';

const FOLDER = 'Erevos';
const FOLDER_TYPE = 'application/vnd.google-apps.folder';
// A file's ID in Drive.
const ID = /^[A-Za-z0-9_-]{1,200}$/;
// The most an answer of the sign-in's or a list's may be: far more than either ever is.
const TOKEN_MOST = 64 * 1024;
const LIST_MOST = 4 * 1024 * 1024;
// The most pages of a thousand files read of the folder.
const MOST_PAGES = 1000;

const OWN: DriveClient | null = CAN_DRIVE ? { id: DRIVE_CLIENT_ID, package: DRIVE_PACKAGE } : null;
let client = OWN;

/** For the checks: an app of their own, or this one's again with null. */
export function setDriveClient(next: DriveClient | null): void {
  client = next ?? OWN;
}

export class DriveError extends CloudError {}

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

function appHere(): DriveClient {
  if (!client) throw new DriveError(t('Google Drive is not in this build of Erevos.'));
  return client;
}

// Where Google sends the browser back: the app's package as the scheme, as Google wants of an
// Android app.
const redirectOf = (app: DriveClient) => `${app.package}:/oauth2redirect`;

// Fields as a form sends them, and an address's query.
const form = (fields: Record<string, string>) =>
  Object.entries(fields)
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('&');

function jsonOf(bytes: Uint8Array): Record<string, unknown> {
  try {
    const value = JSON.parse(utf8Decode(bytes)) as unknown;
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

const textOf = (value: unknown) => (typeof value === 'string' ? value : '');

/** The challenge PKCE sends for `verifier`: its SHA-256, in base64url (RFC 7636, S256). */
export function challengeOf(verifier: string): string {
  return toBase64Url(sha256Bytes(utf8Encode(verifier)));
}

// A sign-in waiting for the browser.
type Pending = { state: string; verifier: string; purpose: DrivePurpose; at: number };

// The key it waits sealed with: one the open space's key gives, so nothing sealed with the one
// opens with the other.
function pendingKey(): Uint8Array {
  const label = utf8Encode('erevos drive sign-in 1\n');
  const { key } = currentSpace();
  const joined = new Uint8Array(label.length + key.length);
  joined.set(label);
  joined.set(key, label.length);
  return sha256Bytes(joined);
}

/**
 * Starts a sign-in with Google for `purpose`: keeps its state and verifier for the browser's
 * return, sealed with the open space's key (one started before is forgotten), and gives the
 * address of Google's page, for the browser (Linking.openURL).
 */
export async function beginDriveSignIn(purpose: DrivePurpose, now = Date.now()): Promise<string> {
  const app = appHere();
  const state = toBase64Url(randomBytes(32));
  const verifier = toBase64Url(randomBytes(32));
  const pending: Pending = { state, verifier, purpose, at: now };
  await secureSet(SIGN_IN, encryptText(pendingKey(), JSON.stringify(pending)));
  return `${AUTH}?${form({
    client_id: app.id,
    redirect_uri: redirectOf(app),
    response_type: 'code',
    scope: DRIVE_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
    code_challenge: challengeOf(verifier),
    code_challenge_method: 'S256',
  })}`;
}

// The sign-in waiting for the browser, taken: gone from the keystore at once, so it is used once.
// Null when there is none, it is too old, or another space's key sealed it.
async function takePending(now: number): Promise<Pending | null> {
  const sealed = await secureGet(SIGN_IN);
  if (sealed === null) return null;
  await secureDelete(SIGN_IN);
  try {
    const pending = JSON.parse(decryptText(pendingKey(), sealed)) as Partial<Pending>;
    if (typeof pending.state !== 'string' || typeof pending.verifier !== 'string' || typeof pending.at !== 'number') return null;
    if (pending.purpose !== 'backup' && pending.purpose !== 'restore') return null;
    if (Math.abs(now - pending.at) > SIGN_IN_MS) return null;
    return { state: pending.state, verifier: pending.verifier, purpose: pending.purpose, at: pending.at };
  } catch {
    return null;
  }
}

// Access tokens, by the refresh token they came with: in memory only, and a minute short of when
// Google says they run out.
const access = new Map<string, { token: string; until: number }>();

// A request to Google's sign-in: its status, and what it said.
async function askToken(fields: Record<string, string>, to = TOKEN): Promise<{ status: number; said: Record<string, unknown> }> {
  const answer = await askAddress('POST', to, { 'Content-Type': 'application/x-www-form-urlencoded' }, utf8Encode(form(fields)), false, TOKEN_MOST);
  return { status: answer.status, said: jsonOf(answer.bytes) };
}

function keepAccess(refresh: string, said: Record<string, unknown>): string {
  const token = textOf(said.access_token);
  const seconds = typeof said.expires_in === 'number' ? said.expires_in : 0;
  if (token) access.set(refresh, { token, until: Date.now() + Math.max(0, seconds - 60) * 1000 });
  return token;
}

// An access token for `account`: the one in memory while it lasts, unless `fresh`, else a new one.
// Throws DriveError when Google no longer takes the refresh token.
async function accessToken(account: DriveAccount, fresh: boolean): Promise<string> {
  const app = appHere();
  const kept = access.get(account.refresh);
  if (!fresh && kept && kept.until > Date.now()) return kept.token;
  access.delete(account.refresh);
  const { status, said } = await askToken({ client_id: app.id, grant_type: 'refresh_token', refresh_token: account.refresh });
  if (status === 400 || status === 401) throw new DriveError(t('Google no longer lets Erevos into your Google Drive. Sign in with Google again.'));
  const token = status === 200 ? keepAccess(account.refresh, said) : '';
  if (!token) throw new DriveError(t('Google Drive answered {status}.', { status }));
  return token;
}

// One request to Google Drive for `account`. One Google refuses, though its token has not run out,
// goes once more with a new one.
async function call(account: DriveAccount, method: HttpMethod, url: string, { headers = {}, body, most }: { headers?: Record<string, string>; body?: Uint8Array; most?: number } = {}): Promise<CloudAnswer> {
  const asked = async (fresh: boolean) => askAddress(method, url, { ...headers, Authorization: `Bearer ${await accessToken(account, fresh)}` }, body, false, most);
  const answer = await asked(false);
  return answer.status === 401 ? asked(true) : answer;
}

// The reason Google Drive gives with an error, as storageQuotaExceeded.
function reasonOf(answer: CloudAnswer): string {
  const error = jsonOf(answer.bytes).error as { errors?: { reason?: unknown }[] } | undefined;
  return textOf(Array.isArray(error?.errors) ? error.errors[0]?.reason : undefined);
}

/** What Google Drive's answer says, in words; null when all went well. */
export function driveStatusText(answer: CloudAnswer): string | null {
  const { status } = answer;
  if (status >= 200 && status < 300) return null;
  if (status === 401) return t('Google no longer lets Erevos into your Google Drive. Sign in with Google again.');
  if (reasonOf(answer) === 'storageQuotaExceeded') return t('Your Google Drive has no room left for it.');
  if (status === 404) return t('That file is not in your Google Drive any more.');
  return t('Google Drive answered {status}.', { status });
}

// Whether Google Drive may take it if asked again: busy, or asked too often for a moment.
const drivePassing = (answer: CloudAnswer) => passing(answer.status) || (answer.status === 403 && /^(?:userR|r)ateLimitExceeded$/.test(reasonOf(answer)));

/** What came back with the browser: Google's code, or why there is none, and the sign-in's mark. */
export type DriveReturn = { state?: string; code?: string; error?: string };

// What a sign-in finished was for, for Backups to go on from (takeDriveSignIn).
let signed: { purpose: DrivePurpose; at: number } | null = null;

// The account a restore signed in to: in memory only, for that restore.
let restoring: DriveAccount | null = null;

/**
 * Finishes the sign-in the browser came back from: the one started here is taken, once, whatever
 * follows, and must be less than SIGN_IN_MS old, of the same space, and of the same `state`; then
 * Google's code goes for the tokens, with its verifier. For automatic backups the refresh token is
 * kept (DRIVE) and the folder found or made; for a restore it stays in memory. Returns what it was
 * for, which Backups takes too (takeDriveSignIn). Throws DriveError with why not.
 */
export async function finishDriveSignIn(back: DriveReturn, now = Date.now()): Promise<DrivePurpose> {
  const app = appHere();
  const pending = await takePending(now);
  if (!pending || typeof back.state !== 'string' || back.state !== pending.state) {
    throw new DriveError(t('This sign-in is not one Erevos started here, or it is more than {minutes} minutes old. Start it again.', { minutes: SIGN_IN_MS / 60_000 }));
  }
  if (back.error) {
    if (back.error === 'access_denied') throw new DriveError(t('You did not allow it at Google, so nothing changed.'));
    throw new DriveError(t('Google did not take the sign-in: {error}. Start it again.', { error: /^[a-z_]{1,40}$/.test(back.error) ? back.error : '?' }));
  }
  if (!back.code) throw new DriveError(t('The browser came back without a sign-in. Start it again.'));
  const { status, said } = await askToken({ client_id: app.id, code: back.code, code_verifier: pending.verifier, grant_type: 'authorization_code', redirect_uri: redirectOf(app) });
  const refresh = textOf(said.refresh_token);
  if (status !== 200 || !refresh || !keepAccess(refresh, said)) {
    const error = textOf(said.error);
    throw new DriveError(t('Google did not take the sign-in: {error}. Start it again.', { error: /^[a-z_]{1,40}$/.test(error) ? error : String(status) }));
  }
  // Only with the Drive's files allowed, which Google's page lets one leave out.
  if (!textOf(said.scope).split(' ').includes(DRIVE_SCOPE)) {
    access.delete(refresh);
    await revoke(refresh);
    throw new DriveError(t('Erevos was not allowed to keep files in your Google Drive. Sign in again and allow it.'));
  }
  if (pending.purpose === 'restore') {
    forgetDriveRestore();
    restoring = { refresh, folder: '' };
  } else {
    const before = await loadDriveBackup();
    if (before && before.refresh !== refresh) access.delete(before.refresh);
    const drive: DriveBackup = before ? { ...before, refresh, error: '' } : { refresh, folder: '', names: [], parts: {}, held: [], unfinished: [], last: 0, error: '' };
    await saveDriveBackup(drive);
    // The folder at once, to be seen there; should Google Drive not answer now, the first backup
    // makes it.
    await folderThere(drive).catch(() => undefined);
  }
  signed = { purpose: pending.purpose, at: now };
  return pending.purpose;
}

/** What the last sign-in that finished was for, once, if it finished in the last SIGN_IN_MS:
 *  Backups goes on with it. */
export function takeDriveSignIn(now = Date.now()): DrivePurpose | null {
  const was = signed;
  signed = null;
  return was && now - was.at <= SIGN_IN_MS ? was.purpose : null;
}

/** The account a restore signed in to, while it is in memory. */
export function driveRestoreAccount(): DriveAccount | null {
  return restoring;
}

/** Forgets the account a restore signed in to, with its access token. */
export function forgetDriveRestore(): void {
  if (restoring) access.delete(restoring.refresh);
  restoring = null;
}

// Takes `token` back at Google: whether it is gone now, as one gone already is.
async function revoke(token: string): Promise<boolean> {
  try {
    const { status, said } = await askToken({ token }, REVOKE);
    return status === 200 || (status === 400 && said.error === 'invalid_token');
  } catch {
    return false;
  }
}

export async function loadDriveBackup(): Promise<DriveBackup | null> {
  if (!client) return null;
  try {
    const value = JSON.parse((await secureGet(DRIVE)) ?? 'null') as Partial<DriveBackup> | null;
    if (!value || typeof value.refresh !== 'string' || !value.refresh || typeof value.folder !== 'string') return null;
    return { refresh: value.refresh, folder: ID.test(value.folder) ? value.folder : '', ...sentOf(value) };
  } catch {
    return null;
  }
}

/**
 * In a build without Google Drive, as F-Droid's (lib/google-drive-ids.ts): when the last automatic
 * backup went to Google Drive (0: none yet), when an Erevos that had it sent them there, as before
 * F-Droid's was installed over it; null when it did not. None goes there from this build, which
 * Backups says, and Stop sending (stopDriveBackup) still takes the access back at Google.
 */
export async function driveLeftBehind(): Promise<{ last: number } | null> {
  if (client) return null;
  try {
    const value = JSON.parse((await secureGet(DRIVE)) ?? 'null') as Partial<DriveBackup> | null;
    if (!value || typeof value.refresh !== 'string' || !value.refresh) return null;
    return { last: sentOf(value).last };
  } catch {
    return null;
  }
}

/** Keeps Google Drive's settings as they are now. */
export async function saveDriveBackup(drive: DriveBackup): Promise<void> {
  await secureSet(DRIVE, JSON.stringify(drive));
}

/**
 * Sends no more backups to Google Drive: takes the refresh token back at Google, then forgets it
 * here, also when Google could not be reached. Whether Google took it back; the backups there stay.
 */
export async function stopDriveBackup(): Promise<boolean> {
  let drive: Partial<DriveBackup> | null = null;
  try {
    drive = JSON.parse((await secureGet(DRIVE)) ?? 'null') as Partial<DriveBackup> | null;
  } catch {
    drive = null;
  }
  const refresh = typeof drive?.refresh === 'string' ? drive.refresh : '';
  const taken = refresh ? await revoke(refresh) : true;
  if (refresh) access.delete(refresh);
  await secureDelete(DRIVE);
  return taken;
}

// A query of Drive's: a name or ID between quotes.
const quoted = (text: string) => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

// The folder Erevos made in the account, by its name, not in the bin: its ID, '' when there is none.
async function foundFolder(account: DriveAccount): Promise<string> {
  const query = form({ q: `name = ${quoted(FOLDER)} and mimeType = ${quoted(FOLDER_TYPE)} and trashed = false`, fields: 'files(id)', spaces: 'drive', orderBy: 'createdTime' });
  const answer = await call(account, 'GET', `${FILES}?${query}`, { most: LIST_MOST });
  const said = driveStatusText(answer);
  if (said) throw new DriveError(said);
  const files = jsonOf(answer.bytes).files;
  const id = Array.isArray(files) && files.length ? textOf((files[0] as { id?: unknown }).id) : '';
  return ID.test(id) ? id : '';
}

// Makes the folder: its ID.
async function madeFolder(account: DriveAccount): Promise<string> {
  const answer = await call(account, 'POST', `${FILES}?fields=id`, {
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: utf8Encode(JSON.stringify({ name: FOLDER, mimeType: FOLDER_TYPE })),
  });
  const said = driveStatusText(answer);
  if (said) throw new DriveError(said);
  const id = textOf(jsonOf(answer.bytes).id);
  if (!ID.test(id)) throw new DriveError(t('Google Drive answered {status}.', { status: answer.status }));
  return id;
}

// The settings with the folder Erevos made in the Drive: the one kept while it is there and not in
// the bin, else the one found by its name, or a new one, and what went to the one before forgotten.
async function folderThere(drive: DriveBackup): Promise<DriveBackup> {
  if (drive.folder) {
    const answer = await call(drive, 'GET', `${FILES}/${drive.folder}?fields=id,trashed`, { most: LIST_MOST });
    if (answer.status !== 404) {
      const said = driveStatusText(answer);
      if (said) throw new DriveError(said);
      if (jsonOf(answer.bytes).trashed !== true) return drive;
    }
  }
  const folder = (await foundFolder(drive)) || (await madeFolder(drive));
  const next: DriveBackup = folder === drive.folder ? drive : { ...drive, folder, names: [], parts: {}, held: [], unfinished: [], last: 0 };
  await saveDriveBackup(next);
  return next;
}

// The account with its folder: the one it has, else the one found by its name ('' when none).
async function withFolder(account: DriveAccount): Promise<DriveAccount> {
  return account.folder ? account : { ...account, folder: await foundFolder(account) };
}

// Every file of the names Erevos gives in the folder, by its name: one name may be there twice, when
// an upload whose answer was lost went again. Throws CloudError with why not.
async function filesIn(account: DriveAccount): Promise<Map<string, DriveFile[]>> {
  const found = new Map<string, DriveFile[]>();
  if (!account.folder) return found;
  let page = '';
  for (let pages = 0; pages < MOST_PAGES; pages++) {
    const query = form({
      q: `${quoted(account.folder)} in parents and trashed = false`,
      fields: 'nextPageToken,files(id,name,size,createdTime)',
      spaces: 'drive',
      pageSize: '1000',
      ...(page ? { pageToken: page } : {}),
    });
    const answer = await call(account, 'GET', `${FILES}?${query}`, { most: LIST_MOST });
    const said = driveStatusText(answer);
    if (said) throw new DriveError(said);
    const listed = jsonOf(answer.bytes);
    for (const each of Array.isArray(listed.files) ? (listed.files as Record<string, unknown>[]) : []) {
      const id = textOf(each?.id);
      const name = textOf(each?.name);
      if (!ID.test(id) || !isBackupName(name)) continue;
      const file = { id, name, size: Number(textOf(each.size)) || 0, when: Date.parse(textOf(each.createdTime)) || 0 };
      found.set(name, [...(found.get(name) ?? []), file]);
    }
    page = textOf(listed.nextPageToken);
    if (!page) break;
  }
  return found;
}

// `bytes` with their name and folder, as one request sends them (a multipart upload).
function multipartOf(account: DriveAccount, name: string, bytes: Uint8Array): { type: string; body: Uint8Array } {
  const boundary = toHex(randomBytes(16));
  const head = utf8Encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: [account.folder] })}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`);
  const tail = utf8Encode(`\r\n--${boundary}--\r\n`);
  const body = new Uint8Array(head.length + bytes.length + tail.length);
  body.set(head);
  body.set(bytes, head.length);
  body.set(tail, head.length + bytes.length);
  return { type: `multipart/related; boundary=${boundary}`, body };
}

function multipart(account: DriveAccount, name: string, bytes: Uint8Array): Promise<CloudAnswer> {
  const { type, body } = multipartOf(account, name, bytes);
  return call(account, 'POST', `${UPLOAD}?uploadType=multipart&fields=id,size`, { headers: { 'Content-Type': type }, body });
}

// A resumable upload: its name first, which gives the address the bytes then go to, that address
// being the upload's key. Without that address, as through Tor, the file goes as a small one does.
async function resumable(account: DriveAccount, name: string, bytes: Uint8Array): Promise<CloudAnswer> {
  const start = await call(account, 'POST', `${UPLOAD}?uploadType=resumable&fields=id,size`, {
    headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'application/octet-stream', 'X-Upload-Content-Length': String(bytes.length) },
    body: utf8Encode(JSON.stringify({ name, parents: [account.folder] })),
  });
  if (driveStatusText(start)) return start;
  if (!start.location?.startsWith(UPLOADS_AT)) return multipart(account, name, bytes);
  return askAddress('PUT', start.location, { 'Content-Type': 'application/octet-stream' }, bytes, false, TOKEN_MOST);
}

// Sends `bytes` into the folder as `name`, again after a while when Google Drive is busy or cannot
// be reached for a moment (tryAgain): the new file, its ID '' should Google not say it. Throws
// CloudError with why not.
async function upload(account: DriveAccount, name: string, bytes: Uint8Array): Promise<DriveFile> {
  let id = '';
  await tryAgain(async () => {
    try {
      const answer = bytes.length > RESUMABLE_ABOVE ? await resumable(account, name, bytes) : await multipart(account, name, bytes);
      const said = driveStatusText(answer);
      if (!said) id = textOf(jsonOf(answer.bytes).id);
      return { said, again: drivePassing(answer) };
    } catch (error) {
      if (!(error instanceof Unreached)) throw error;
      return { said: error.message, again: true };
    }
  });
  return { id: ID.test(id) ? id : '', name, size: bytes.length, when: Date.now() };
}

// Downloads a file, `most` bytes at most: null when it is no longer there.
async function download(account: DriveAccount, file: DriveFile, most: number): Promise<Uint8Array | null> {
  const answer = await call(account, 'GET', `${FILES}/${file.id}?alt=media`, { most });
  if (answer.status === 404) return null;
  const said = driveStatusText(answer);
  if (said) throw new DriveError(said);
  return answer.bytes;
}

// The folder in Google Drive, as sendBare sends to it: listed once, when first needed, and the list
// kept as files go there and are deleted.
function drivePlace(account: DriveAccount): BarePlace {
  let listing: Promise<Map<string, DriveFile[]>> | null = null;
  const there = async () => {
    listing ??= filesIn(account);
    try {
      return await listing;
    } catch (error) {
      listing = null;
      throw error;
    }
  };
  return {
    put: async (name, bytes) => {
      const file = await upload(account, name, bytes);
      const files = await there().catch(() => null);
      if (files && file.id) files.set(name, [...(files.get(name) ?? []), file]);
    },
    gone: async (name) => {
      let files: Map<string, DriveFile[]>;
      try {
        files = await there();
      } catch {
        return false;
      }
      for (const file of files.get(name) ?? []) {
        const status = await call(account, 'DELETE', `${FILES}/${file.id}`).then(
          (answer) => answer.status,
          () => 0,
        );
        if (status !== 404 && (status < 200 || status >= 300)) return false;
        const left = (files.get(name) ?? []).filter((each) => each.id !== file.id);
        if (left.length) files.set(name, left);
        else files.delete(name);
      }
      return true;
    },
    parts: async () => new Map([...(await there())].filter(([name]) => isPartName(name)).map(([name, files]) => [name, files[0].size])),
  };
}

/**
 * Sends a bare backup to Google Drive as sendToCloud does to a server (sendBare): into the folder
 * Erevos made there, made again should it be gone, and what went to the one before then forgotten.
 * Returns the settings as they are after it; one that failed says why in `error`.
 */
export async function sendToDrive(
  drive: DriveBackup,
  make: (part: PartSink, reuse?: CloudReuse) => Promise<Uint8Array>,
  keep: number,
  now = Date.now(),
  book?: Map<string, PartMade[]>,
): Promise<DriveBackup> {
  let start: DriveBackup;
  try {
    start = await folderThere(drive);
  } catch (error) {
    const failed = { ...drive, error: errorText(error) };
    await saveDriveBackup(failed);
    return failed;
  }
  return sendBare(start, drivePlace(start), saveDriveBackup, make, keep, now, book);
}

/**
 * The backups and parts in the folder, with their sizes (-1 where Google Drive does not say them),
 * and each one's bytes, downloaded as asked, at most CLOUD_RESTORE_MOST: to check that a backup
 * there is whole (lib/backup-check.ts), as on a server. Throws CloudError with why not.
 */
export async function driveFiles(account: DriveAccount): Promise<{ sizes: Map<string, number>; read: PartReader }> {
  const there = await filesIn(account);
  return {
    sizes: new Map([...there].map(([name, files]) => [name, files[0].size || -1])),
    read: async (name) => {
      const file = there.get(name)?.[0];
      return file ? download(account, file, CLOUD_RESTORE_MOST) : null;
    },
  };
}

/** The backups in the folder Erevos made in the account's Drive, newest first, without their parts:
 *  none when there is no such folder. Throws CloudError with why not. */
export async function listDrive(account: DriveAccount): Promise<DriveFile[]> {
  const there = await filesIn(await withFolder(account));
  const files = [...there.values()].map((same) => same[0]);
  const backups = new Set(backupsAmong(files).map((file) => file.name));
  return files.filter((file) => backups.has(file.name)).sort((a, b) => b.when - a.when);
}

/** Downloads the backup `file` from Google Drive, at most `most` bytes (CLOUD_RESTORE_MOST at most).
 *  Throws CloudError with why not. */
export async function fetchFromDrive(account: DriveAccount, file: DriveFile, most: number = CLOUD_RESTORE_MOST): Promise<Uint8Array> {
  if (!isBackupName(file.name) || !ID.test(file.id)) throw new CloudError(t('That file is not an Erevos backup.'));
  const cap = Math.min(most, CLOUD_RESTORE_MOST);
  const bytes = await download(account, file, cap);
  if (!bytes) throw new DriveError(t('That file is not in your Google Drive any more.'));
  if (bytes.length > cap) throw new CloudError(tooLargeText(cap));
  return bytes;
}

/**
 * The parts of the backups in the folder, to restore one (lock/backup.ts): which of a backup's
 * parts' names are not there, and each one's bytes, downloaded one at a time as asked, at most
 * CLOUD_RESTORE_MOST bytes. Throws CloudError with why not.
 */
export async function driveParts(account: DriveAccount): Promise<{ missing(names: string[]): string[]; read: PartReader }> {
  const here = await withFolder(account);
  const there = await filesIn(here);
  return {
    missing: (names) => names.filter((name) => !there.has(name)),
    read: async (name) => {
      const file = isPartName(name) ? there.get(name)?.[0] : undefined;
      return file ? download(here, file, CLOUD_RESTORE_MOST) : null;
    },
  };
}
