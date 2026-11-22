// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Signing in to a relay with a provider such as LPHL (lib/relay-signin.ts, lib/relay.ts,
// crates/erevos-relay/src/signin.rs): the claim, kept for one space, which pages a relay may send
// the browser to, which token is named as the phone's before, and the whole sign-in against a real
// relay and a provider made here that answers as Authentik does: the browser's start, the
// provider, the relay's page with its code, and the claim with that code over the WebSocket. The
// relay part is skipped, with a note, when it is not built.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

import { ready, relayNote, startRelay } from './real-relay';
import { claimSignIn, createQueue, RelaySession, signInOffer } from '../lib/relay';
import { NO_OWN_TOKEN, endSignIn, isSignInPage, offerSignInCode, oldToken, onSignInCode, ownToken, pendingSignIn, signInLink, signInRelay, startSignIn } from '../lib/relay-signin';

relayNote('the relay sign-in checks');

const sha = (data: string | Buffer) => createHash('sha256').update(data).digest();
const b64url = (data: Buffer | string) => Buffer.from(data).toString('base64url');

test('a sign-in under way is kept for its space and its relay, for 10 minutes', () => {
  const made = startSignIn(4, 'wss://relay.example.org/', 1000);
  assert.match(made.claim, /^[0-9a-f]{64}$/);
  assert.equal(made.hash, sha(Buffer.from(made.claim, 'hex')).toString('hex'));
  assert.ok(!('code' in made), 'the app makes no code: the relay does');
  assert.equal(pendingSignIn(4, 'WSS://relay.example.org', 2000), made, 'the same relay, written otherwise');
  assert.equal(pendingSignIn(5, 'wss://relay.example.org', 2000), null, 'another space has none');
  assert.equal(pendingSignIn(4, 'wss://other.example.org', 2000), null, 'nor another relay');
  assert.equal(signInLink('https://relay.example.org/signin/start', made), `https://relay.example.org/signin/start?claim=${made.hash}`);
  assert.ok(!signInLink('https://relay.example.org/signin/start', made).includes(made.claim), 'the secret stays on the phone');
  assert.equal(pendingSignIn(4, 'wss://relay.example.org', 1000 + 10 * 60 * 1000), null);
  startSignIn(4, 'wss://relay.example.org', 1000);
  endSignIn(4);
  assert.equal(pendingSignIn(4, 'wss://relay.example.org', 2000), null);
});

test("a relay may send the browser only to a page of its own, over https", () => {
  const relay = 'wss://relay.example.org/erevos';
  assert.ok(isSignInPage(relay, 'https://relay.example.org/signin/start'));
  assert.ok(isSignInPage(relay, 'https://RELAY.example.org:8443/signin/start'), 'another port, and capitals');
  assert.ok(isSignInPage('ws://127.0.0.1:7879', 'http://127.0.0.1:9/signin/start'), 'http on this computer, for the checks');
  assert.ok(isSignInPage('ws://[::1]:7879', 'http://[::1]:9/signin/start'));
  for (const start of [
    'https://login.example.com/signin/start',
    'https://relay.example.org.example.com/signin/start',
    'https://relay.example.org@login.example.com/signin/start',
    'http://relay.example.org/signin/start',
    'javascript://relay.example.org/%0aalert(1)',
    'https://relay.example.org',
    '',
  ]) {
    assert.equal(isSignInPage(relay, start), false, start);
  }
  assert.equal(isSignInPage('ws://192.168.1.10:7879', 'http://192.168.1.10:7879/signin/start'), false, 'http only on this computer');
  assert.equal(isSignInPage('ws://127.0.0.1:7879', 'http://localhost:9/signin/start'), false, 'the same host, written the same');
});

test('another relay to sign in at is taken as typed, with or without its scheme, and only as a relay', () => {
  assert.equal(signInRelay('relay.example.org'), 'wss://relay.example.org');
  assert.equal(signInRelay('  wss://relay.example.org/ '), 'wss://relay.example.org');
  assert.equal(signInRelay('https://relay.example.org:8443/erevos'), 'wss://relay.example.org:8443/erevos');
  assert.equal(signInRelay('ws://127.0.0.1:7879'), 'ws://127.0.0.1:7879', 'not encrypted only on this computer, for the checks');
  for (const typed of ['', '   ', 'ws://relay.example.org', 'http://relay.example.org', 'ftp://relay.example.org', 'relay example.org', 'wss://', 'wss://relay.example.org?x=1', 'wss://a@relay.example.org']) {
    assert.equal(signInRelay(typed), null, typed);
  }
});

test('only the token this phone got from the same relay is named as its token before', () => {
  const relay = 'wss://relay.example.org';
  const token = 'ab'.repeat(32);
  const own = ownToken(`${relay}/`, token);
  assert.deepEqual(own, { relay: `${relay}/`, hash: sha(token).toString('hex') });
  assert.equal(oldToken('WSS://relay.example.org', token, own), token, 'the same relay, written otherwise');
  assert.equal(oldToken(relay, 'cd'.repeat(32), own), '', 'a token typed in since');
  assert.equal(oldToken('wss://other.example.org', token, own), '', 'another relay');
  assert.equal(oldToken(relay, token, NO_OWN_TOKEN), '', 'a token this phone never got as its own');
  assert.equal(oldToken(relay, '', own), '');
});

// A provider that answers as Authentik does, over plain HTTP on 127.0.0.1.
type Code = { challenge: string; nonce: string };
const provider = { codes: new Map<string, Code>(), refresh: new Set<string>(), access: new Set<string>(), n: 0, authenticated: false };
let server: Server | null = null;
let issuer = '';

function answer(method: string, path: string, authorization: string, body: string): [number, unknown] {
  const form = new URLSearchParams(body);
  const base = issuer.replace(/\/application\/o\/erevos\/$/, '');
  if (method === 'GET' && path === '/application/o/erevos/.well-known/openid-configuration') {
    return [
      200,
      {
        issuer,
        authorization_endpoint: `${base}/application/o/authorize/`,
        token_endpoint: `${base}/application/o/token/`,
        userinfo_endpoint: `${base}/application/o/userinfo/`,
        introspection_endpoint: `${base}/application/o/introspect/`,
        revocation_endpoint: `${base}/application/o/revoke/`,
      },
    ];
  }
  if (method === 'POST' && path === '/application/o/token/') {
    provider.authenticated = authorization === `Basic ${Buffer.from('erevos-id:erevos-secret').toString('base64')}`;
    if (!provider.authenticated) return [401, { error: 'invalid_client' }];
    let nonce = '';
    if (form.get('grant_type') === 'authorization_code') {
      const code = provider.codes.get(form.get('code') ?? '');
      provider.codes.delete(form.get('code') ?? '');
      if (!code || b64url(sha(form.get('code_verifier') ?? '')) !== code.challenge) return [400, { error: 'invalid_grant' }];
      nonce = code.nonce;
    } else if (!provider.refresh.delete(form.get('refresh_token') ?? '')) {
      return [400, { error: 'invalid_grant' }];
    }
    const n = ++provider.n;
    provider.access.add(`access-${n}`);
    provider.refresh.add(`refresh-${n}`);
    const claims = { iss: issuer, aud: 'erevos-id', sub: 'sub-nekten', nonce, preferred_username: 'Nekten', exp: Math.floor(Date.now() / 1000) + 300 };
    return [200, { access_token: `access-${n}`, refresh_token: `refresh-${n}`, id_token: `e30.${b64url(JSON.stringify(claims))}.sig`, token_type: 'Bearer' }];
  }
  if (method === 'GET' && path === '/application/o/userinfo/') {
    const known = provider.access.has(authorization.replace(/^Bearer /, ''));
    return known ? [200, { sub: 'sub-nekten', preferred_username: 'Nekten' }] : [401, {}];
  }
  if (method === 'POST' && path === '/application/o/introspect/') return [200, { active: provider.access.has(form.get('token') ?? '') }];
  if (method === 'POST' && path === '/application/o/revoke/') {
    provider.refresh.delete(form.get('token') ?? '');
    return [200, {}];
  }
  return [404, {}];
}

/** What the provider does in the browser: signs in, and sends it back to the relay with a code. */
function authorize(location: string): string {
  const query = new URL(location).searchParams;
  assert.equal(query.get('code_challenge_method'), 'S256');
  assert.equal(query.get('scope'), 'openid profile offline_access');
  const code = `code-${++provider.n}`;
  provider.codes.set(code, { challenge: query.get('code_challenge')!, nonce: query.get('nonce')! });
  const back = new URL(query.get('redirect_uri')!);
  back.searchParams.set('code', code);
  back.searchParams.set('state', query.get('state')!);
  return back.toString();
}

// The relay, with a file of tokens and sign-in. Browsers reach it at PUBLIC, which the checks
// change to where it listens, as a proxy in front would.
const PUBLIC = 'http://127.0.0.1:9';
let folder = '';
let file = '';
let url = '';
let pages = '';

before(async () => {
  if (!ready) return;
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const [status, json] = answer(req.method ?? '', req.url ?? '', req.headers.authorization ?? '', body);
      const text = JSON.stringify(json);
      res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(text), Connection: 'close' });
      res.end(text);
    });
  });
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
  issuer = `http://127.0.0.1:${(server.address() as { port: number }).port}/application/o/erevos/`;
  folder = mkdtempSync(join(tmpdir(), 'erevos-relay-signin-'));
  file = join(folder, 'phones.tokens');
  writeFileSync(file, '');
  url = await startRelay(false, '', false, {
    EREVOS_RELAY_TOKENS: file,
    EREVOS_RELAY_OIDC_ISSUER: issuer,
    EREVOS_RELAY_OIDC_CLIENT_ID: 'erevos-id',
    EREVOS_RELAY_OIDC_CLIENT_SECRET: 'erevos-secret',
    EREVOS_RELAY_OIDC_NAME: 'LPHL',
    EREVOS_RELAY_PUBLIC_URL: PUBLIC,
  });
  pages = url.replace(/^ws:/, 'http:');
});

after(() => {
  server?.close();
  if (folder) rmSync(folder, { recursive: true, force: true });
});

const lets = (token: string) =>
  RelaySession.open({ url, token }).then(
    (session) => (session.close(), true),
    () => false,
  );

/** The browser's part, for the sign-in `made`, in Greek: up to the relay's page, and the code it
 *  shows, as the person types it. */
async function inTheBrowser(start: string, made: ReturnType<typeof startSignIn>): Promise<string> {
  const begun = await fetch(signInLink(start, made).replace(PUBLIC, pages), { redirect: 'manual', headers: { 'Accept-Language': 'en' } });
  assert.equal(begun.status, 302);
  const page = await fetch(authorize(begun.headers.get('location')!).replace(PUBLIC, pages), { headers: { 'Accept-Language': 'el' } });
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('cache-control'), 'no-store');
  const html = await page.text();
  assert.ok(html.includes('Συνδέθηκες στο LPHL ως Nekten.'));
  assert.ok(html.includes('Γράψε αυτόν τον αριθμό στο Erevos'));
  assert.ok(!html.includes('<form'), 'nothing to confirm on the page');
  const shown = /<p class="code">(\d{3}) (\d{3})<\/p>/.exec(html);
  assert.ok(shown, html);
  return `${shown[1]} ${shown[2]}`;
}

/** Another six digits than `code`. */
const besides = (code: string) => code.replace(/\d/g, (d) => String((Number(d) + 1) % 10));

test('a phone signs in in the browser and claims a token of its own with the code the page shows', { skip: !ready }, async () => {
  const offer = await signInOffer(url);
  assert.deepEqual(offer, { name: 'LPHL', start: `${PUBLIC}/signin/start` });
  const made = startSignIn(1, url);
  assert.equal(await claimSignIn(url, made.claim, '123456'), null, 'nothing yet');
  const code = await inTheBrowser(offer!.start, made);
  assert.ok(provider.authenticated, 'the relay gave the client secret');
  assert.equal(await claimSignIn(url, made.claim, '12345'), null, 'not six digits: not asked');

  assert.deepEqual(await claimSignIn(url, made.claim, besides(code)), { wrong: 4 });
  const got = await claimSignIn(url, made.claim, code);
  assert.ok(got && 'token' in got);
  assert.equal(got.name, 'lphl:nekten');
  const lines = readFileSync(file, 'utf8');
  assert.ok(lines.includes(`${sha(got.token).toString('hex')} lphl:nekten # signed in with LPHL on `), lines);
  assert.ok(!lines.includes(got.token));
  assert.ok(await lets(got.token));
  await createQueue({ url, token: got.token });

  // Signing in again on the same phone, with its token before: the line is replaced.
  const again = startSignIn(1, url);
  const second = await claimSignIn(url, again.claim, await inTheBrowser(offer!.start, again), got.token);
  assert.ok(second && 'token' in second);
  assert.equal(second.name, 'lphl:nekten');
  assert.equal(await lets(got.token), false);
  assert.ok(await lets(second.token));
  assert.equal(readFileSync(file, 'utf8').split('\n').filter((line) => line.includes('lphl:')).length, 1);

  // Another phone of the same account gets one more line; a claim used is not one any more.
  const other = startSignIn(2, url);
  const third = await claimSignIn(url, other.claim, await inTheBrowser(offer!.start, other));
  assert.ok(third && 'name' in third);
  assert.equal(third.name, 'lphl:nekten-2');
  assert.equal(await claimSignIn(url, made.claim, code), null);
});

test('a sign-in whose code is not typed gives the phone nothing, and 5 wrong codes end it', { skip: !ready }, async () => {
  // As when someone sends a sign-in link and signs in with it in their own browser: they see the
  // code, this phone does not.
  const made = startSignIn(3, url);
  const code = await inTheBrowser(`${PUBLIC}/signin/start`, made);
  const lines = readFileSync(file, 'utf8');
  for (const left of [4, 3, 2, 1, 0]) assert.deepEqual(await claimSignIn(url, made.claim, besides(code)), { wrong: left });
  assert.equal(await claimSignIn(url, made.claim, code), null, 'over, even with the right code');
  assert.equal(readFileSync(file, 'utf8'), lines, 'no line went in');
});

test('a relay without sign-in offers none', { skip: !ready }, async () => {
  const plain = await startRelay();
  assert.equal(await signInOffer(plain), null);
});

test('a relay whose sign-in page is on another host offers none', { skip: !ready }, async () => {
  const elsewhere = join(folder, 'elsewhere.tokens');
  writeFileSync(elsewhere, '');
  const relay = await startRelay(false, '', false, {
    EREVOS_RELAY_TOKENS: elsewhere,
    EREVOS_RELAY_OIDC_ISSUER: issuer,
    EREVOS_RELAY_OIDC_CLIENT_ID: 'erevos-id',
    EREVOS_RELAY_OIDC_CLIENT_SECRET: 'erevos-secret',
    EREVOS_RELAY_OIDC_NAME: 'LPHL',
    EREVOS_RELAY_PUBLIC_URL: 'https://login.example.com',
  });
  assert.equal(await signInOffer(relay), null);
});

test('on a phone the relay page brings the code back, six digits only, to the sign-in that shows or the next one', () => {
  const start = 'https://relay.example.org/signin/start';
  const signIn = startSignIn(9, 'wss://relay.example.org', 1000);
  assert.ok(signInLink(start, signIn, true).endsWith(`claim=${signIn.hash}&to=app`));
  assert.ok(!signInLink(start, signIn).includes('to=app'));
  const got: string[] = [];
  // Held a moment for a sign-in that shows next, never longer.
  offerSignInCode('123456', 1000);
  const stop = onSignInCode((code) => got.push(code), 2000);
  assert.deepEqual(got, ['123456']);
  offerSignInCode('12345');
  offerSignInCode('12a456');
  offerSignInCode('654321');
  assert.deepEqual(got, ['123456', '654321']);
  stop();
  offerSignInCode('111111', 5000);
  assert.deepEqual(onSignInCode(() => assert.fail('too late'), 5000 + 61_000) !== undefined, true);
  endSignIn(9);
});
