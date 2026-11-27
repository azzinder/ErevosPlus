// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Automatic backups to Google Drive (lib/google-drive.ts), with a Google of the checks' own: the
// sign-in's PKCE challenge, its mark checked and its code used once, an access token asked for
// again when Google refuses one, backups sent in one request or in a resumable upload, listed,
// downloaded and deleted there as on a server, and checked by what is listed after they went.
// Without a client ID for the app (lib/google-drive-ids.ts) nothing of it shows; the browser's way
// back opens its own screen in each edition.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { test } from 'node:test';

import { BARE_PART, type PartMade, type PartSink } from '../lock/backup';
import { setCurrentSpace } from '../lock/keys';
import { checkedWhole, checkListed } from '../lib/backup-check';
import { CloudError, partName, setCloudHttp, setCloudRetry, type CloudAnswer, type CloudHttp } from '../lib/backup-cloud';
import { randomBytes, utf8Decode, utf8Encode } from '../lib/crypto';
import {
  beginDriveSignIn,
  challengeOf,
  DRIVE_SCOPE,
  DriveError,
  driveFiles,
  driveLeftBehind,
  driveParts,
  driveRestoreAccount,
  fetchFromDrive,
  finishDriveSignIn,
  forgetDriveRestore,
  listDrive,
  loadDriveBackup,
  RESUMABLE_ABOVE,
  sendToDrive,
  setDriveClient,
  SIGN_IN_MS,
  stopDriveBackup,
  takeDriveSignIn,
  type DriveBackup,
} from '../lib/google-drive';
import { CAN_DRIVE, canDrive, DRIVE_CLIENT_ID, DRIVE_CLIENT_IDS, driveClientFor } from '../lib/google-drive-ids';
import { hrefLink, linkHref } from '../lib/open-link';
import { PACKAGES } from '../lib/update-channel';
import { NEXT, VERSIONS, whatsNewOf } from '../lib/whats-new';

import { store } from './secure-memory';

const CLIENT = 'checks-client.apps.googleusercontent.com';
const PACKAGE = 'app.erevos.plus';
const REDIRECT = 'app.erevos.plus:/oauth2redirect';
const NOW = Date.UTC(2026, 10, 1, 12);
const SPACE_KEY = randomBytes(32);
// The keystore's entries: the sign-in waiting for the browser, and Google Drive's settings.
const SIGN_IN = 'erevos.drive-sign-in';
const DRIVE = 'erevos.backup-drive';

const read = (file: string) => readFileSync(join(import.meta.dirname, '..', file), 'utf8');

// An answer of Google's, as JSON.
const answer = (status: number, value?: unknown, location?: string): CloudAnswer => ({
  status,
  bytes: utf8Encode(value === undefined ? '' : JSON.stringify(value)),
  ...(location ? { location } : {}),
});
const driveError = (status: number, reason: string) => answer(status, { error: { code: status, errors: [{ reason }] } });

type Stored = { id: string; name: string; parents: string[]; folder: boolean; bytes: Uint8Array; created: number; trashed: boolean };

// Google as far as Erevos uses it: the sign-in, with its codes and tokens, and a Drive with files.
class Google {
  // Every request, as it came.
  readonly asked: { method: string; url: string; headers: Record<string, string> }[] = [];
  // The forms the sign-in got for tokens, and the tokens taken back.
  readonly forms: URLSearchParams[] = [];
  readonly revoked: string[] = [];
  readonly files = new Map<string, Stored>();
  // Every code and token given, to look for where none may be.
  readonly given: string[] = [];
  readonly ways = { multipart: 0, resumable: 0 };
  refreshed = 0;
  // What the owner allowed on Google's page.
  scope = DRIVE_SCOPE;
  // Whether a resumable upload's address comes back: only to a request that went straight.
  location = true;
  // What the next uploads are answered with before one is taken.
  busy: { status: number; reason: string }[] = [];
  // Google cannot be reached.
  down = false;
  private readonly codes = new Map<string, { challenge: string; redirect: string }>();
  // Each refresh token, with the access tokens it gave.
  private readonly grants = new Map<string, Set<string>>();
  private readonly uploads = new Map<string, { name: string; parents: string[]; length: number }>();
  private count = 0;

  // The owner says yes on the page `address` opened: what the browser comes back with.
  consent(address: string): { state: string; code: string } {
    const page = new URL(address);
    assert.equal(`${page.origin}${page.pathname}`, 'https://accounts.google.com/o/oauth2/v2/auth');
    const asked = page.searchParams;
    assert.equal(asked.get('client_id'), CLIENT);
    assert.equal(asked.get('scope'), DRIVE_SCOPE);
    assert.equal(asked.get('code_challenge_method'), 'S256');
    const code = `4/0Achecks-${++this.count}`;
    this.given.push(code);
    this.codes.set(code, { challenge: asked.get('code_challenge') ?? '', redirect: asked.get('redirect_uri') ?? '' });
    return { state: asked.get('state') ?? '', code };
  }

  // Every access token given so far runs out.
  expire(): void {
    for (const tokens of this.grants.values()) tokens.clear();
  }

  // The owner takes Erevos's access back in their Google account.
  forget(): void {
    this.grants.clear();
  }

  folder(): Stored | undefined {
    return [...this.files.values()].find((file) => file.folder && !file.trashed);
  }

  inFolder(): Stored[] {
    const folder = this.folder();
    return folder ? [...this.files.values()].filter((file) => file.parents.includes(folder.id) && !file.trashed) : [];
  }

  readonly http: CloudHttp = async (method, url, headers, body, _most, tor) => {
    assert.ok(!tor);
    this.asked.push({ method, url, headers });
    if (this.down) throw new Error('No network');
    const at = new URL(url);
    if (at.origin === 'https://oauth2.googleapis.com') {
      assert.equal(method, 'POST');
      assert.equal(headers.Authorization, undefined);
      assert.equal(headers['Content-Type'], 'application/x-www-form-urlencoded');
      const fields = new URLSearchParams(utf8Decode(body!));
      assert.ok(!fields.has('client_secret'));
      if (at.pathname === '/revoke') {
        assert.deepEqual([...fields.keys()], ['token']);
        return this.revoke(fields.get('token') ?? '');
      }
      assert.equal(at.pathname, '/token');
      assert.equal(fields.get('client_id'), CLIENT);
      this.forms.push(fields);
      return fields.get('grant_type') === 'authorization_code' ? this.exchange(fields) : this.refresh(fields);
    }
    assert.equal(at.origin, 'https://www.googleapis.com');
    // The rest of a resumable upload: its address is its key.
    if (method === 'PUT') return this.resume(at, headers, body!);
    if (!this.allowed(headers.Authorization)) return driveError(401, 'authError');
    const path = at.pathname;
    if (path === '/drive/v3/files' && method === 'GET') return this.list(at.searchParams);
    if (path === '/drive/v3/files' && method === 'POST') {
      assert.equal(at.searchParams.get('fields'), 'id');
      const made = JSON.parse(utf8Decode(body!)) as { name: string; mimeType: string };
      assert.deepEqual(made, { name: 'Erevos', mimeType: 'application/vnd.google-apps.folder' });
      return this.add(made.name, ['root'], new Uint8Array(0), true);
    }
    const one = /^\/drive\/v3\/files\/([\w-]+)$/.exec(path);
    if (one) {
      const file = this.files.get(one[1]);
      if (!file) return driveError(404, 'notFound');
      if (method === 'DELETE') {
        this.files.delete(file.id);
        return answer(204);
      }
      if (at.searchParams.get('alt') === 'media') return { status: 200, bytes: file.bytes };
      assert.equal(at.searchParams.get('fields'), 'id,trashed');
      return answer(200, { id: file.id, trashed: file.trashed });
    }
    assert.equal(path, '/upload/drive/v3/files');
    assert.equal(method, 'POST');
    assert.equal(at.searchParams.get('fields'), 'id,size');
    const busy = this.busy.shift();
    if (busy) return driveError(busy.status, busy.reason);
    if (at.searchParams.get('uploadType') === 'multipart') return this.multipart(headers, body!);
    assert.equal(at.searchParams.get('uploadType'), 'resumable');
    assert.equal(headers['X-Upload-Content-Type'], 'application/octet-stream');
    const { name, parents } = JSON.parse(utf8Decode(body!)) as { name: string; parents: string[] };
    const session = `upload-${++this.count}`;
    this.uploads.set(session, { name, parents, length: Number(headers['X-Upload-Content-Length']) });
    return answer(200, {}, this.location ? `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=${session}` : undefined);
  };

  private token(kind: string): string {
    const token = `${kind}-${++this.count}-${randomBytes(4).join('')}`;
    this.given.push(token);
    return token;
  }

  private access(refresh: string): string {
    const token = this.token('ya29.access');
    this.grants.get(refresh)?.add(token);
    return token;
  }

  private exchange(fields: URLSearchParams): CloudAnswer {
    assert.deepEqual([...fields.keys()].sort(), ['client_id', 'code', 'code_verifier', 'grant_type', 'redirect_uri']);
    const code = fields.get('code') ?? '';
    const asked = this.codes.get(code);
    // A code goes once.
    this.codes.delete(code);
    const verifier = fields.get('code_verifier') ?? '';
    assert.match(verifier, /^[\w.~-]{43,128}$/);
    // The verifier whose SHA-256 the page was given, as Google checks it.
    if (!asked || createHash('sha256').update(verifier).digest('base64url') !== asked.challenge || fields.get('redirect_uri') !== asked.redirect) return answer(400, { error: 'invalid_grant' });
    const refresh = this.token('1//refresh');
    this.grants.set(refresh, new Set());
    return answer(200, { access_token: this.access(refresh), expires_in: 3599, refresh_token: refresh, scope: this.scope, token_type: 'Bearer' });
  }

  private refresh(fields: URLSearchParams): CloudAnswer {
    assert.equal(fields.get('grant_type'), 'refresh_token');
    const refresh = fields.get('refresh_token') ?? '';
    if (!this.grants.has(refresh)) return answer(400, { error: 'invalid_grant' });
    this.refreshed++;
    return answer(200, { access_token: this.access(refresh), expires_in: 3599, scope: this.scope, token_type: 'Bearer' });
  }

  // A token taken back takes the whole grant with it, as at Google.
  private revoke(token: string): CloudAnswer {
    this.revoked.push(token);
    for (const [refresh, tokens] of this.grants) {
      if (refresh !== token && !tokens.has(token)) continue;
      this.grants.delete(refresh);
      return answer(200, {});
    }
    return answer(400, { error: 'invalid_token' });
  }

  private allowed(authorization: string | undefined): boolean {
    const token = /^Bearer (.+)$/.exec(authorization ?? '')?.[1] ?? '';
    return [...this.grants.values()].some((tokens) => tokens.has(token));
  }

  private list(asked: URLSearchParams): CloudAnswer {
    assert.equal(asked.get('spaces'), 'drive');
    const q = asked.get('q') ?? '';
    if (q === "name = 'Erevos' and mimeType = 'application/vnd.google-apps.folder' and trashed = false") {
      const found = [...this.files.values()].filter((file) => file.folder && file.name === 'Erevos' && !file.trashed).sort((a, b) => a.created - b.created);
      return answer(200, { files: found.map((file) => ({ id: file.id })) });
    }
    const parent = /^'([\w-]+)' in parents and trashed = false$/.exec(q)?.[1];
    assert.ok(parent, q);
    assert.equal(asked.get('fields'), 'nextPageToken,files(id,name,size,createdTime)');
    // Two to a page, so more than one is read.
    const all = [...this.files.values()].filter((file) => file.parents.includes(parent) && !file.trashed);
    const from = Number(asked.get('pageToken') ?? 0);
    const page = all.slice(from, from + 2);
    return answer(200, {
      ...(from + 2 < all.length ? { nextPageToken: String(from + 2) } : {}),
      files: page.map((file) => ({ id: file.id, name: file.name, size: String(file.bytes.length), createdTime: new Date(file.created).toISOString() })),
    });
  }

  private multipart(headers: Record<string, string>, body: Uint8Array): CloudAnswer {
    const boundary = /^multipart\/related; boundary=([0-9a-f]+)$/.exec(headers['Content-Type'] ?? '')?.[1];
    assert.ok(boundary);
    const [before, meta, media, after] = Buffer.from(body).toString('latin1').split(`--${boundary}`);
    assert.equal(before, '');
    assert.equal(after, '--\r\n');
    const json = '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n';
    const octets = '\r\nContent-Type: application/octet-stream\r\n\r\n';
    assert.ok(meta.startsWith(json) && meta.endsWith('\r\n'));
    assert.ok(media.startsWith(octets) && media.endsWith('\r\n'));
    const { name, parents } = JSON.parse(meta.slice(json.length, -2)) as { name: string; parents: string[] };
    this.ways.multipart++;
    return this.add(name, parents, new Uint8Array(Buffer.from(media.slice(octets.length, -2), 'latin1')));
  }

  private resume(at: URL, headers: Record<string, string>, body: Uint8Array): CloudAnswer {
    assert.equal(at.pathname, '/upload/drive/v3/files');
    assert.equal(headers.Authorization, undefined);
    const id = at.searchParams.get('upload_id') ?? '';
    const upload = this.uploads.get(id);
    if (!upload) return driveError(404, 'notFound');
    this.uploads.delete(id);
    assert.equal(body.length, upload.length);
    this.ways.resumable++;
    return this.add(upload.name, upload.parents, body);
  }

  private add(name: string, parents: string[], bytes: Uint8Array, folder = false): CloudAnswer {
    const id = `file-${++this.count}`;
    this.files.set(id, { id, name, parents, folder, bytes, created: NOW + this.count * 1000, trashed: false });
    return answer(200, folder ? { id } : { id, size: String(bytes.length) });
  }
}

// A Google of its own for a check, with nothing of Google Drive kept yet.
function fresh(): Google {
  const google = new Google();
  setCloudHttp(google.http);
  setCloudRetry([1, 1]);
  setDriveClient({ id: CLIENT, package: PACKAGE });
  setCurrentSpace(0, SPACE_KEY);
  store.delete(SIGN_IN);
  store.delete(DRIVE);
  forgetDriveRestore();
  takeDriveSignIn();
  return google;
}

function done(google: Google): void {
  // No code or token in any address, and no access token kept anywhere.
  for (const { url } of google.asked) for (const token of google.given) assert.ok(!url.includes(token), url);
  const kept = [...store.values()].join('\n');
  for (const token of google.given.filter((each) => each.startsWith('ya29.'))) assert.ok(!kept.includes(token));
  setCloudHttp(null);
  setCloudRetry([2_000, 10_000, 30_000, 60_000, 120_000, 300_000]);
  setDriveClient(null);
}

async function signedIn(google: Google): Promise<DriveBackup> {
  assert.equal(await finishDriveSignIn(google.consent(await beginDriveSignIn('backup', NOW)), NOW), 'backup');
  const drive = await loadDriveBackup();
  assert.ok(drive);
  return drive;
}

test('the challenge is the verifier’s SHA-256, in base64url (RFC 7636, S256)', () => {
  // RFC 7636's own example.
  assert.equal(challengeOf('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
});

test('Google’s page is asked for drive.file alone, with a mark of the sign-in and its challenge', async () => {
  const google = fresh();
  try {
    const page = new URL(await beginDriveSignIn('backup', NOW));
    assert.equal(`${page.origin}${page.pathname}`, 'https://accounts.google.com/o/oauth2/v2/auth');
    const asked = page.searchParams;
    assert.deepEqual([...asked.keys()].sort(), ['access_type', 'client_id', 'code_challenge', 'code_challenge_method', 'prompt', 'redirect_uri', 'response_type', 'scope', 'state']);
    assert.equal(asked.get('client_id'), CLIENT);
    assert.equal(asked.get('redirect_uri'), REDIRECT);
    assert.equal(asked.get('response_type'), 'code');
    assert.equal(asked.get('scope'), 'https://www.googleapis.com/auth/drive.file');
    assert.equal(asked.get('access_type'), 'offline');
    assert.equal(asked.get('prompt'), 'consent');
    assert.equal(asked.get('code_challenge_method'), 'S256');
    const state = asked.get('state') ?? '';
    assert.match(state, /^[\w-]{43}$/);
    assert.match(asked.get('code_challenge') ?? '', /^[\w-]{43}$/);
    // What waits for the browser is sealed with the space: the mark is not in it as it is.
    const sealed = store.get(SIGN_IN) ?? '';
    assert.ok(sealed && !sealed.includes(state));
    // Each sign-in has a mark and a challenge of its own, and nothing went to Google yet.
    const again = new URL(await beginDriveSignIn('backup', NOW)).searchParams;
    assert.notEqual(again.get('state'), state);
    assert.notEqual(again.get('code_challenge'), asked.get('code_challenge'));
    assert.equal(google.asked.length, 0);
  } finally {
    done(google);
  }
});

test('a sign-in goes on once, with its verifier, and keeps the refresh token and the folder', async () => {
  const google = fresh();
  try {
    const back = google.consent(await beginDriveSignIn('backup', NOW));
    assert.equal(await finishDriveSignIn(back, NOW + 60_000), 'backup');
    // The code went once, with the verifier of the challenge Google's page had (checked there).
    assert.equal(google.forms.length, 1);
    assert.equal(google.forms[0].get('redirect_uri'), REDIRECT);
    assert.equal(store.has(SIGN_IN), false);
    // Kept as a server's password is: the refresh token, with the folder Erevos made, named Erevos.
    const drive = await loadDriveBackup();
    assert.ok(drive);
    assert.ok(google.given.includes(drive.refresh));
    assert.equal(drive.folder, google.folder()?.id);
    assert.deepEqual(drive.names, []);
    // Backups goes on from it once.
    assert.equal(takeDriveSignIn(NOW + 61_000), 'backup');
    assert.equal(takeDriveSignIn(NOW + 61_000), null);
    // The same way back again is refused: the sign-in is gone, and the code does not go again.
    await assert.rejects(finishDriveSignIn(back, NOW + 62_000), DriveError);
    assert.equal(google.forms.length, 1);
    // A new sign-in keeps the folder and what went there, with the new token.
    const before = google.folder()?.id;
    const again = await signedIn(google);
    assert.notEqual(again.refresh, drive.refresh);
    assert.equal(again.folder, before);
    assert.equal([...google.files.values()].filter((file) => file.folder).length, 1);
  } finally {
    done(google);
  }
});

test('a way back with another mark, none, an old one or one of another space is refused, and its code never goes', async () => {
  const google = fresh();
  try {
    // Another mark: refused, and the sign-in it was not is gone with it.
    let back = google.consent(await beginDriveSignIn('backup', NOW));
    await assert.rejects(finishDriveSignIn({ ...back, state: 'another-mark' }, NOW), DriveError);
    assert.equal(store.has(SIGN_IN), false);
    await assert.rejects(finishDriveSignIn(back, NOW), DriveError);
    // No mark.
    back = google.consent(await beginDriveSignIn('backup', NOW));
    await assert.rejects(finishDriveSignIn({ code: back.code }, NOW), DriveError);
    // Older than SIGN_IN_MS.
    back = google.consent(await beginDriveSignIn('backup', NOW));
    await assert.rejects(finishDriveSignIn(back, NOW + SIGN_IN_MS + 1), /more than 10 minutes old/);
    // Begun in another space.
    back = google.consent(await beginDriveSignIn('backup', NOW));
    setCurrentSpace(1, randomBytes(32));
    await assert.rejects(finishDriveSignIn(back, NOW), DriveError);
    setCurrentSpace(0, SPACE_KEY);
    // None begun.
    await assert.rejects(finishDriveSignIn(back, NOW), DriveError);
    // The owner said no at Google, or the browser came back with nothing.
    back = google.consent(await beginDriveSignIn('backup', NOW));
    await assert.rejects(finishDriveSignIn({ state: back.state, error: 'access_denied' }, NOW), /did not allow it/);
    back = google.consent(await beginDriveSignIn('backup', NOW));
    await assert.rejects(finishDriveSignIn({ state: back.state }, NOW), DriveError);
    // Not one code went to Google, and nothing is kept.
    assert.equal(google.forms.length, 0);
    assert.equal(await loadDriveBackup(), null);
    assert.equal(takeDriveSignIn(NOW), null);
  } finally {
    setCurrentSpace(0, SPACE_KEY);
    done(google);
  }
});

test('without the Drive’s files allowed nothing is kept, and the access is taken back', async () => {
  const google = fresh();
  try {
    google.scope = 'openid';
    await assert.rejects(finishDriveSignIn(google.consent(await beginDriveSignIn('backup', NOW)), NOW), /not allowed to keep files/);
    assert.equal(google.revoked.length, 1);
    assert.equal(await loadDriveBackup(), null);
  } finally {
    done(google);
  }
});

test('a sign-in for a restore stays in memory, and makes nothing there', async () => {
  const google = fresh();
  try {
    assert.equal(await finishDriveSignIn(google.consent(await beginDriveSignIn('restore', NOW)), NOW), 'restore');
    assert.equal(await loadDriveBackup(), null);
    assert.equal(store.has(DRIVE), false);
    assert.equal(takeDriveSignIn(NOW), 'restore');
    const account = driveRestoreAccount();
    assert.ok(account);
    assert.deepEqual(await listDrive(account), []);
    assert.equal(google.folder(), undefined);
    forgetDriveRestore();
    assert.equal(driveRestoreAccount(), null);
  } finally {
    done(google);
  }
});

test('an access token Google refuses is asked for again, once; one taken back at Google says to sign in again', async () => {
  const google = fresh();
  try {
    const drive = await signedIn(google);
    // The sign-in's own access token lasts.
    await listDrive(drive);
    assert.equal(google.refreshed, 0);
    // Refused (401): a new one, and the same request again.
    google.expire();
    assert.deepEqual(await listDrive(drive), []);
    assert.equal(google.refreshed, 1);
    await listDrive(drive);
    assert.equal(google.refreshed, 1);
    // Taken back in the owner's Google account.
    google.forget();
    await assert.rejects(listDrive(drive), /Sign in with Google again/);
  } finally {
    done(google);
  }
});

test('backups go in one request, or a resumable upload above 5 MB, and the oldest go', async () => {
  const google = fresh();
  const contents = new Map<string, Uint8Array>();
  const partsOf: string[][] = [];
  let made: Uint8Array = new Uint8Array(0);
  // A backup with `parts` full parts and its own `size`, as lock/backup.ts makes one bare: each
  // part BARE_PART bytes, which tells parts from backups in a listing.
  const backup = (parts: number, size: number) => async (part: PartSink) => {
    const names: string[] = [];
    partsOf.push(names);
    for (let n = 0; n < parts; n++) {
      const bytes = randomBytes(BARE_PART);
      const name = await part(bytes);
      contents.set(name, bytes);
      names.push(name);
    }
    made = randomBytes(size);
    return made;
  };
  const sent = (drive: DriveBackup) => {
    contents.set(drive.names[drive.names.length - 1], made);
    return drive;
  };
  const there = () =>
    google
      .inFolder()
      .map((file) => file.name)
      .sort();
  try {
    let drive = await signedIn(google);
    // Two parts and the backup, each in one request with its name; Google busy, then too often
    // asked, for a moment: asked again.
    google.busy = [
      { status: 503, reason: 'backendError' },
      { status: 403, reason: 'userRateLimitExceeded' },
    ];
    drive = sent(await sendToDrive(drive, backup(2, 3000), 2, NOW));
    assert.equal(drive.error, '');
    assert.equal(drive.names.length, 1);
    assert.deepEqual(google.ways, { multipart: 3, resumable: 0 });
    assert.deepEqual(there(), [...partsOf[0], drive.names[0]].sort());
    for (const file of google.inFolder()) assert.deepEqual(file.bytes, contents.get(file.name));
    // A Drive with no room left says so, and nothing more is kept of it.
    google.busy = [{ status: 403, reason: 'storageQuotaExceeded' }];
    const full = await sendToDrive(drive, backup(1, 10), 2, NOW + 1);
    partsOf.pop();
    assert.equal(full.error, 'Your Google Drive has no room left for it.');
    assert.deepEqual(full.names, drive.names);
    assert.deepEqual(full.unfinished, []);
    assert.equal(google.inFolder().length, 3);
    // Above 5 MB: a resumable upload, its bytes to the address Google gave.
    drive = sent(await sendToDrive(full, backup(1, RESUMABLE_ABOVE + 1), 2, NOW + 2));
    assert.equal(drive.error, '');
    assert.deepEqual(google.ways, { multipart: 4, resumable: 1 });
    // Without that address, as through Tor: in one request too. The oldest backup goes, with its parts.
    google.location = false;
    drive = sent(await sendToDrive(drive, backup(0, RESUMABLE_ABOVE + 2), 2, NOW + 3));
    assert.equal(drive.error, '');
    assert.deepEqual(google.ways, { multipart: 5, resumable: 1 });
    assert.equal(drive.names.length, 2);
    assert.deepEqual(there(), [...partsOf[1], ...drive.names].sort());
    for (const file of google.inFolder()) assert.deepEqual(file.bytes, contents.get(file.name));

    // Listed newest first, without the parts, also where the folder is found by its name, as a
    // restore on another phone finds it; each one downloaded whole.
    const listed = await listDrive({ refresh: drive.refresh, folder: '' });
    assert.deepEqual(
      listed.map((file) => file.name),
      [...drive.names].reverse(),
    );
    for (const file of listed) assert.deepEqual(await fetchFromDrive(drive, file), contents.get(file.name));
    await assert.rejects(fetchFromDrive(drive, { ...listed[0], name: 'erevos.json' }), CloudError);
    // The parts of one, for its restore.
    const parts = await driveParts({ refresh: drive.refresh, folder: '' });
    const nowhere = partName('0'.repeat(32), 7);
    assert.deepEqual(parts.missing([...partsOf[1], nowhere]), [nowhere]);
    assert.deepEqual(await parts.read(partsOf[1][0]), contents.get(partsOf[1][0]));
    assert.equal(await parts.read(nowhere), null);

    // The check after it: the backup and each part it named are listed, of their sizes.
    const newest = drive.names[0];
    const named: PartMade[] = partsOf[1].map((name, n) => ({ name, size: contents.get(name)!.length, sha: '', id: '', n, files: [], out: [], stamps: [] }));
    const files = await driveFiles(drive);
    assert.ok(checkedWhole(checkListed(files.sizes, newest, named, NOW, contents.get(newest)!.length)));
    assert.deepEqual(await files.read(newest), contents.get(newest));
    // A part cut short there, or gone, is found.
    const part = [...google.files.values()].find((file) => file.name === partsOf[1][0])!;
    part.bytes = part.bytes.slice(1);
    const cut = checkListed((await driveFiles(drive)).sizes, newest, named, NOW, contents.get(newest)!.length);
    assert.equal(cut.damaged, 1);
    google.files.delete(part.id);
    const gone = checkListed((await driveFiles(drive)).sizes, newest, named, NOW);
    assert.equal(gone.missing, 1);
    assert.ok(!checkedWhole(gone));
  } finally {
    done(google);
  }
});

test('a folder put in the bin is made again, and what went to it is forgotten', async () => {
  const google = fresh();
  try {
    let drive = await signedIn(google);
    drive = await sendToDrive(drive, async () => randomBytes(100), 2, NOW);
    assert.equal(drive.names.length, 1);
    const old = drive.folder;
    google.files.get(old)!.trashed = true;
    drive = await sendToDrive(drive, async () => randomBytes(100), 2, NOW + 1);
    assert.equal(drive.error, '');
    assert.notEqual(drive.folder, old);
    assert.equal(drive.folder, google.folder()?.id);
    assert.equal(drive.names.length, 1);
    assert.deepEqual((await loadDriveBackup())?.folder, drive.folder);
  } finally {
    done(google);
  }
});

test('stopping takes the access back at Google and forgets it here, also when Google cannot be reached', async () => {
  const google = fresh();
  try {
    let drive = await signedIn(google);
    drive = await sendToDrive(drive, async () => randomBytes(100), 2, NOW);
    assert.equal(await stopDriveBackup(), true);
    assert.deepEqual(google.revoked, [drive.refresh]);
    assert.equal(await loadDriveBackup(), null);
    // The backups there stay.
    assert.equal(google.inFolder().length, 1);
    await signedIn(google);
    google.down = true;
    assert.equal(await stopDriveBackup(), false);
    assert.equal(await loadDriveBackup(), null);
    assert.equal(store.has(DRIVE), false);
  } finally {
    done(google);
  }
});

test('without a client ID for the app nothing of Google Drive is offered', async () => {
  assert.equal(canDrive('android', ''), false);
  assert.equal(canDrive('ios', CLIENT), false);
  assert.equal(canDrive('web', CLIENT), false);
  assert.equal(canDrive('android', CLIENT), true);
  // Never in the F-Droid build, which keeps to services anyone may run.
  assert.equal(canDrive('android', CLIENT, true), false);
  assert.ok(read('lib/google-drive-ids.ts').includes('canDrive(platform(), DRIVE_CLIENT_ID, fdroidBuild())'));
  // Each edition's app by its package: the bridge, Erevos+ built as app.erevos, is the plain Erevos's.
  const ids = { erevos: 'e.apps.googleusercontent.com', plus: 'p.apps.googleusercontent.com', lite: 'l.apps.googleusercontent.com' };
  assert.equal(driveClientFor('app.erevos', ids), ids.erevos);
  assert.equal(driveClientFor('app.erevos.plus', ids), ids.plus);
  assert.equal(driveClientFor('app.erevos.lite', ids), ids.lite);
  assert.equal(driveClientFor('app.erevos.plus', { ...ids, plus: '' }), '');
  assert.equal(driveClientFor('app.other', ids), '');
  assert.equal(driveClientFor('', ids), '');
  // Each one as Google Cloud's console gives it: one for each edition's app, the three from one project.
  const own = Object.values(DRIVE_CLIENT_IDS);
  for (const id of own) assert.match(id, /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/);
  assert.equal(new Set(own).size, own.length);
  assert.equal(new Set(own.map((id) => id.split('-')[0])).size, 1);
  // Here, as in a build with none: nothing is kept, loaded or asked.
  assert.equal(DRIVE_CLIENT_ID, '');
  assert.equal(CAN_DRIVE, false);
  setDriveClient(null);
  store.set(DRIVE, JSON.stringify({ refresh: 'kept', folder: 'folder', names: [], parts: {}, held: [], unfinished: [], last: 0, error: '' }));
  try {
    assert.equal(await loadDriveBackup(), null);
    await assert.rejects(beginDriveSignIn('backup', NOW), DriveError);
  } finally {
    store.delete(DRIVE);
  }
  // Not on the first start's last step, nor under Backups, nor in What's new.
  const steps = read('app/first-steps.tsx');
  assert.ok(steps.includes("...(CAN_DRIVE ? [{ id: 'drive' as const,"));
  assert.equal(steps.split("id: 'drive'").length, 2);
  const backups = read('app/backup.tsx');
  assert.ok(backups.includes('!(startAt === "drive" && CAN_DRIVE)'));
  assert.ok(backups.includes('{CAN_DRIVE && CAN_AUTO_BACKUP ? ('));
  assert.ok(backups.includes('{CAN_CLOUD_RESTORE && CAN_DRIVE ? ('));
  assert.ok(backups.includes('if (CAN_DRIVE) void loadDriveBackup().then(setDrive);'));
  assert.ok(read('app/oauth2redirect.tsx').includes('if (!CAN_DRIVE) return null;'));
  for (const edition of ['erevos', 'plus', 'lite'] as const) {
    const lines = whatsNewOf(VERSIONS, NEXT, '3.0.0-rc.4', edition, false).flatMap((v) => [...v.forYou, ...v.underTheHood]);
    assert.ok(!lines.some((line) => line.includes('Google Drive')), edition);
  }
  assert.ok(whatsNewOf(VERSIONS, NEXT, '3.0.0-rc.4', 'erevos', true).some((v) => v.forYou.some((line) => line.includes('Google Drive'))));
});

test('in the F-Droid build, backups to Google Drive from an Erevos before it show, go nowhere, and can still be stopped', async () => {
  // Here, as in the F-Droid build, there is no app of Google's: what an Erevos installed before it kept
  // is read only to show it under Backups.
  setDriveClient(null);
  assert.equal(await driveLeftBehind(), null);
  store.set(DRIVE, JSON.stringify({ refresh: 'kept', folder: 'folder', names: [], parts: {}, held: [], unfinished: [], last: NOW, error: '' }));
  try {
    assert.deepEqual(await driveLeftBehind(), { last: NOW });
    // Automatic backups do not load it, so nothing goes there.
    assert.equal(await loadDriveBackup(), null);
    // In a build with Google Drive these are its own settings, shown as they are, not as left behind.
    setDriveClient({ id: CLIENT, package: PACKAGE });
    assert.equal(await driveLeftBehind(), null);
  } finally {
    setDriveClient(null);
    store.delete(DRIVE);
  }
  for (const kept of ['not json', JSON.stringify({ refresh: '', folder: 'folder' }), JSON.stringify({ folder: 'folder' })]) {
    store.set(DRIVE, kept);
    try {
      assert.equal(await driveLeftBehind(), null, kept);
    } finally {
      store.delete(DRIVE);
    }
  }
  // Stop sending takes the access back at Google there too, with no app of Google's.
  const google = fresh();
  try {
    const drive = await signedIn(google);
    setDriveClient(null);
    assert.deepEqual(await driveLeftBehind(), { last: 0 });
    assert.equal(await stopDriveBackup(), true);
    assert.deepEqual(google.revoked, [drive.refresh]);
    assert.equal(await driveLeftBehind(), null);
  } finally {
    done(google);
  }
  // Backups reads it only in the F-Droid build and shows it with Stop sending, which forgets it; where
  // the automatic backups went only there, it says that none goes anywhere now.
  const backups = read('app/backup.tsx');
  assert.ok(backups.includes('if (CAN_DRIVE) void loadDriveBackup().then(setDrive);\n    else if (FDROID) void driveLeftBehind().then(setDriveLeft);'));
  const at = backups.indexOf('{driveLeft && CAN_AUTO_BACKUP ? (');
  assert.ok(at > 0);
  const card = backups.slice(at, backups.indexOf(') : null}', at));
  assert.ok(card.includes('onPress={() => void stopDrive()}'));
  assert.ok(card.includes('"The Erevos from F-Droid keeps to services anyone may run, so it sends no backups to Google Drive.'));
  assert.ok(backups.includes('    setDrive(null);\n    setDriveLeft(null);'));
  assert.ok(backups.includes('{driveLeft && !cloud\n                  ? t(\n                      "Automatic backups went only to Google Drive, and the Erevos from F-Droid sends none there'));
});

test('Backups warns before every sign-in with Google, as the first start does', () => {
  const backups = read('app/backup.tsx');
  // Begun only from the warning, or from the first start, which showed it.
  assert.equal(backups.match(/void signInDrive\(/g)?.length, 2);
  assert.ok(backups.includes('else if (startAt === "drive") void signInDrive("backup");'));
  assert.ok(backups.includes('void signInDrive(purpose);'));
  assert.ok(backups.includes('onPress={() => setWarnDrive("backup")}'));
  assert.ok(backups.includes('else setWarnDrive("restore");'));
  // The same words as the first start's warning, with INVISIBLE's in both.
  const steps = read('app/first-steps.tsx');
  for (const words of [
    'The backups leave **encrypted**. Google cannot read them.',
    'But Google **knows who you are**. It sees that you use Erevos, when you make a backup and how big it is, and may hand that over if asked.',
    'This space is INVISIBLE, but signing in happens **in your browser, outside Erevos**, not through Tor: Google sees your internet address then.',
    'For more privacy, choose **this device** or **WebDAV**.',
  ]) {
    assert.ok(backups.includes(`"${words}"`), words);
    assert.ok(steps.includes(`t('${words}')`), words);
  }
});

test('the browser’s way back opens its own screen, in each edition', () => {
  assert.equal(linkHref('app.erevos:/oauth2redirect?state=a&code=4%2F0Ab'), '/oauth2redirect?state=a&code=4%2F0Ab');
  assert.equal(linkHref('app.erevos.plus:/oauth2redirect?state=a&code=b&scope=x'), '/oauth2redirect?state=a&code=b&scope=x');
  assert.equal(linkHref('app.erevos.lite://oauth2redirect/?error=access_denied&state=a'), '/oauth2redirect?error=access_denied&state=a');
  assert.equal(linkHref('app.erevos.plus:/oauth2redirect'), '/oauth2redirect');
  assert.equal(linkHref('/oauth2redirect?state=a&code=b'), '/oauth2redirect?state=a&code=b');
  assert.equal(linkHref('com.example:/oauth2redirect?code=b'), '');
  assert.equal(linkHref('app.erevos.plus:/elsewhere?code=b'), '');
  // Held for after the password, the same.
  assert.equal(linkHref(hrefLink('/oauth2redirect?state=a&code=b')), '/oauth2redirect?state=a&code=b');
  assert.ok(existsSync(join(import.meta.dirname, '..', 'app', 'oauth2redirect.tsx')));
  // Each edition's app opens it by its own package (app.config.js), as Google sends it back.
  const require = createRequire(import.meta.url);
  const appConfig = require('../app.config.js') as (input: { config: Record<string, unknown> }) => {
    android: { package: string; intentFilters: unknown[] };
  };
  const config = JSON.parse(read('app.json')).expo;
  const was = process.env.EREVOS_EDITION;
  try {
    for (const [edition, pkg] of Object.entries(PACKAGES)) {
      process.env.EREVOS_EDITION = edition;
      const built = appConfig({ config });
      assert.equal(built.android.package, pkg);
      assert.deepEqual(built.android.intentFilters.at(-1), { action: 'VIEW', category: ['BROWSABLE', 'DEFAULT'], data: [{ scheme: pkg }] });
      // The F-Droid build has no Google Drive, so no way back from Google's page either.
      process.env.EREVOS_DISTRIBUTION = 'fdroid';
      const fdroid = appConfig({ config });
      delete process.env.EREVOS_DISTRIBUTION;
      assert.deepEqual(fdroid.android.intentFilters, built.android.intentFilters.slice(0, -1));
    }
  } finally {
    delete process.env.EREVOS_DISTRIBUTION;
    if (was === undefined) delete process.env.EREVOS_EDITION;
    else process.env.EREVOS_EDITION = was;
  }
});
