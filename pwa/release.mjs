// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Erevos web app's release key, and the signatures made with it (README.md).
//
//   node pwa/release.mjs keygen <private key file> [public key file]
//       Makes a new Ed25519 key. The private half goes to the file, encrypted with a passphrase
//       you type, readable by you only; the public half to pwa/release-key.pub, for the
//       repository (or to the file given). Shows the key's fingerprint, which the app shows too.
//   node pwa/release.mjs sign <web app> <private key file> [--android <build> <sha256>] [--sums <SHA256SUMS>]
//       Signs <web app>/release.json (made by pwa/build.mjs) into release.sig, after checking that
//       the service worker there carries this key's public half. With --android, also signs the
//       statement that names the Android app of the same release, by its build and SHA-256, into
//       <web app>/android-update.json, which the server serves beside the web app: Check for
//       updates installs an APK only when it is signed so (app/lib/update-signature.ts).
//       It signs Erevos's own channel's statement too (android-update-erevos.json), which names
//       the release; see `channel`.
//   node pwa/release.mjs channel <folder> <private key file> <channel> <name> <build> <sha256>
//       Signs the statement of an Android release of a channel (erevos, erevos-beta, erevos-plus,
//       erevos-plus-beta, lite, lite-beta; plus and plus-beta for Erevos+ 7.x and its bridge only:
//       app/lib/update-channel.ts wireOf), by its channel, name, build and SHA-256, into
//       <folder>/android-update-<channel>.json, which the server serves beside the web app
//       (deploy/web/publish-android.sh): Check for updates installs a release of that channel only
//       when it is signed so (app/lib/update-signature.ts).
//       With --sums, also signs the release's SHA256SUMS by its name into <web app>/SHA256SUMS.sig,
//       served beside it with the list itself.
//   node pwa/release.mjs sums <folder> <private key file> <release name> <SHA256SUMS> [public key file]
//       Signs a release's SHA256SUMS again, alone, after a package added later rewrote it
//       (deploy/web/publish-sums.sh).
//   node pwa/release.mjs verify-sums <SHA256SUMS> <SHA256SUMS.sig, or https://address> [public key file]
//       Checks that a SHA256SUMS is the one the release key signed, and for which release.
//   node pwa/release.mjs verify <web app folder, or https://address> [public key file]
//       Checks a release, in a folder or as a server serves it: the signature, every file's hash,
//       and that the service worker carries the key. From a server, Element Call's files
//       (/element-call/) are read from the release's second origin (`origins.call`), which must
//       give the same release.json, release.sig and service worker; one that gives no release at
//       all (not set up yet) is only warned of, as Matrix calls cannot start from it. Anyone can
//       run it.
//
// The passphrase can also come from EREVOS_RELEASE_PASSPHRASE (for tests; on your own computer,
// typing it is better).
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(here, 'release-key.pub');

function fail(text) {
  console.error(text);
  process.exit(1);
}

/** As the service worker shows it: the first 128 bits of the SHA-256 of the raw public key. */
export function fingerprint(raw) {
  return createHash('sha256').update(raw).digest('hex').slice(0, 32).match(/.{4}/g).join(' ');
}

function rawPublic(key) {
  return (key.type === 'public' ? key : createPublicKey(key)).export({ format: 'der', type: 'spki' }).subarray(-32);
}

function publicFromRaw(raw) {
  // An Ed25519 SubjectPublicKeyInfo is this 12-byte prefix and the 32-byte key.
  return createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), raw]), format: 'der', type: 'spki' });
}

async function passphrase(question) {
  if (process.env.EREVOS_RELEASE_PASSPHRASE) return process.env.EREVOS_RELEASE_PASSPHRASE;
  if (!process.stdin.isTTY) fail('Type the passphrase in a terminal, or set EREVOS_RELEASE_PASSPHRASE.');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  // Nothing typed is shown.
  rl._writeToOutput = (text) => {
    if (text.includes(question)) process.stdout.write(text);
  };
  const answer = await new Promise((resolve) => rl.question(question, resolve));
  rl.close();
  process.stdout.write('\n');
  return answer;
}

async function keygen(file, publicFile = PUBLIC) {
  if (!file) fail('usage: node pwa/release.mjs keygen <private key file> [public key file]');
  if (fs.existsSync(file)) fail(`${file} is already there. A new key would lock every installed web app out of updates; move the old one away first if you mean it.`);
  const first = await passphrase('Passphrase for the release key: ');
  if (first.length < 12) fail('Use a passphrase of 12 characters or more.');
  if ((await passphrase('Once more: ')) !== first) fail('The two passphrases differ.');
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, privateKey.export({ format: 'pem', type: 'pkcs8', cipher: 'aes-256-cbc', passphrase: first }), { mode: 0o600 });
  const raw = rawPublic(publicKey);
  fs.writeFileSync(publicFile, `${raw.toString('base64')}\n`);
  console.log(`Private key: ${file} (keep it, and a copy offline; without it no update can be signed)`);
  console.log(`Public key:  ${publicFile}${publicFile === PUBLIC ? ' (commit it)' : ''}`);
  console.log(`Fingerprint: ${fingerprint(raw)}`);
}

/** What the release key signs for the Android app, as app/lib/update-signature.ts statementOf makes it. */
export const androidStatement = (build, sha256) => `erevos android update v1\nbuild ${build}\nsha256 ${sha256}\n`;

/** The channels an Android release is published in (app/lib/update-channel.ts). */
export const CHANNELS = ['erevos', 'erevos-beta', 'plus', 'plus-beta', 'erevos-plus', 'erevos-plus-beta', 'lite', 'lite-beta'];
const NAME = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(alpha|beta|rc)\.[1-9]\d*)?$/;

/** What the release key signs for a channel's Android release, as app/lib/update-signature.ts channelStatementOf makes it. */
export const channelStatement = (channel, name, build, sha256) =>
  `erevos android update v2\nchannel ${channel}\nname ${name}\nbuild ${build}\nsha256 ${sha256}\n`;
const CHANNEL_STATEMENT = /^erevos android update v2\nchannel (erevos|erevos-beta|plus|plus-beta|erevos-plus|erevos-plus-beta|lite|lite-beta)\nname ([0-9a-z.-]{1,40})\nbuild [1-9]\d*\nsha256 [0-9a-f]{64}\n$/;

function channelUsage() {
  fail('usage: node pwa/release.mjs channel <folder> <private key file> <erevos|erevos-beta|plus|plus-beta|erevos-plus|erevos-plus-beta|lite|lite-beta> <name, e.g. 3.1.0> <build> <sha256, lowercase hex>');
}

function writeChannel(dir, key, channel, name, build, sha256) {
  const statement = channelStatement(channel, name, Number(build), sha256);
  const signature = sign(null, Buffer.from(statement), key).toString('base64');
  fs.writeFileSync(path.join(dir, `android-update-${channel}.json`), `${JSON.stringify({ statement, signature })}\n`);
  console.log(`Signed the Android release of ${channel}: ${name}, build ${build}, SHA-256 ${sha256}.`);
}

async function signChannel(dir, file, channel, name, build, sha256) {
  if (!dir || !file || !CHANNELS.includes(channel) || !NAME.test(name ?? '') || !/^[1-9]\d*$/.test(build ?? '') || !/^[0-9a-f]{64}$/.test(sha256 ?? '')) channelUsage();
  if (!fs.statSync(dir, { throwIfNoEntry: false })?.isDirectory()) fail(`${dir} is not a folder.`);
  const key = createPrivateKey({ key: fs.readFileSync(file), passphrase: await passphrase('Passphrase for the release key: ') });
  writeChannel(dir, key, channel, name, build, sha256);
}

/** What the release key signs for a release's SHA256SUMS: its name and the list's own SHA-256. */
export const sumsStatement = (name, sha256) => `erevos release sums v1\nname ${name}\nsha256 ${sha256}\n`;
const SUMS_STATEMENT = /^erevos release sums v1\nname ([0-9a-z.-]{1,40})\nsha256 ([0-9a-f]{64})\n$/;

const SIGN_USAGE = 'usage: node pwa/release.mjs sign <web app> <private key file> [--android <build> <sha256, lowercase hex>] [--sums <SHA256SUMS>]';

async function signRelease(dir, file, ...more) {
  if (!dir || !file) fail(SIGN_USAGE);
  let android = null;
  let androidArgs = null;
  let sums = null;
  for (let i = 0; i < more.length; ) {
    if (more[i] === '--android' && !android) {
      const [build, sha256] = more.slice(i + 1, i + 3);
      if (!/^[1-9]\d*$/.test(build ?? '') || !/^[0-9a-f]{64}$/.test(sha256 ?? '')) fail(SIGN_USAGE);
      android = androidStatement(Number(build), sha256);
      androidArgs = [build, sha256];
      i += 3;
    } else if (more[i] === '--sums' && !sums && more[i + 1]) {
      sums = fs.readFileSync(more[i + 1]);
      i += 2;
    } else fail(SIGN_USAGE);
  }
  const key = createPrivateKey({ key: fs.readFileSync(file), passphrase: await passphrase('Passphrase for the release key: ') });
  const raw = rawPublic(key);
  const worker = fs.readFileSync(path.join(dir, 'sw.js'), 'utf8');
  if (!worker.includes(`'${raw.toString('base64')}'`)) fail('The service worker in that build carries another public key. Build it with this key (pwa/release-key.pub).');
  const body = fs.readFileSync(path.join(dir, 'release.json'));
  const release = JSON.parse(body);
  fs.writeFileSync(path.join(dir, 'release.sig'), `${sign(null, body, key).toString('base64')}\n`);
  console.log(`Signed release ${release.version} (${Object.keys(release.files).length} files) with ${fingerprint(raw)}.`);
  if (android) {
    const signature = sign(null, Buffer.from(android), key).toString('base64');
    fs.writeFileSync(path.join(dir, 'android-update.json'), `${JSON.stringify({ statement: android, signature })}\n`);
    console.log(`Signed the Android app of the same release: ${android.trim().split('\n').slice(1).join(', ')}.`);
    // The same, as Erevos's own channel says it, with the release's name.
    if (NAME.test(release.label ?? '')) writeChannel(dir, key, 'erevos', release.label, ...androidArgs);
  }
  // The release's SHA256SUMS, signed by its name, served beside the web app: whoever downloads a
  // package by hand can check that the list of hashes is the release's own (verify-sums), not
  // one put beside a changed package.
  if (sums) {
    if (!NAME.test(release.label ?? '')) fail('That build has no release name to sign SHA256SUMS by.');
    writeSums(dir, key, release.label, sums);
  }
}

function writeSums(dir, key, name, sums) {
  const statement = sumsStatement(name, createHash('sha256').update(sums).digest('hex'));
  fs.writeFileSync(path.join(dir, 'SHA256SUMS'), sums);
  fs.writeFileSync(path.join(dir, 'SHA256SUMS.sig'), `${JSON.stringify({ statement, signature: sign(null, Buffer.from(statement), key).toString('base64') })}\n`);
  console.log(`Signed the SHA256SUMS of ${name}.`);
}

/**
 * Signs a release's SHA256SUMS again, alone, into <folder>/SHA256SUMS.sig: after a package was
 * added to the release later (release-macos.yml, release-android.yml), which rewrites the list
 * (deploy/web/publish-sums.sh). The key is checked against the repository's public half.
 */
async function signSums(dir, file, name, sumsFile, publicFile = PUBLIC) {
  if (!dir || !file || !NAME.test(name ?? '') || !sumsFile) fail('usage: node pwa/release.mjs sums <folder> <private key file> <release name, e.g. 3.0.0-beta.1> <SHA256SUMS> [public key file]');
  const sums = fs.readFileSync(sumsFile);
  const key = createPrivateKey({ key: fs.readFileSync(file), passphrase: await passphrase('Passphrase for the release key: ') });
  const expected = Buffer.from(fs.readFileSync(publicFile, 'utf8').trim(), 'base64');
  if (!rawPublic(key).equals(expected)) fail(`That is not the release key (${fingerprint(expected)}).`);
  fs.mkdirSync(dir, { recursive: true });
  writeSums(dir, key, name, sums);
}

/**
 * Checks a release's SHA256SUMS against its signature (SHA256SUMS.sig, from the web app's server
 * or a file): that the release key signed this very list, and for which release. Anyone can run it.
 */
async function verifySums(sumsFile, from, keyFile = PUBLIC) {
  if (!sumsFile || !from) fail('usage: node pwa/release.mjs verify-sums <SHA256SUMS> <SHA256SUMS.sig, or the web app\'s https://address> [public key file]');
  const raw = Buffer.from(fs.readFileSync(keyFile, 'utf8').trim(), 'base64');
  const sums = fs.readFileSync(sumsFile);
  const signed = /^https?:\/\//.test(from) ? await readStatement(from, 'SHA256SUMS.sig') : fs.readFileSync(from);
  if (!signed) fail('No SHA256SUMS.sig there.');
  const { statement, signature } = JSON.parse(signed.toString());
  const [, name, sha256] = SUMS_STATEMENT.exec(statement ?? '') ?? [];
  if (!name) fail('SHA256SUMS.sig does not say what it should.');
  if (!verify(null, Buffer.from(statement), publicFromRaw(raw), Buffer.from(signature ?? '', 'base64'))) fail(`SHA256SUMS.sig is NOT SIGNED with the key ${fingerprint(raw)}.`);
  if (createHash('sha256').update(sums).digest('hex') !== sha256) fail(`That SHA256SUMS is NOT the one signed for ${name}.`);
  console.log(`OK: SHA256SUMS of ${name}, signed with ${fingerprint(raw)}. Now check the files with it: sha256sum -c SHA256SUMS`);
}

async function read(from, name) {
  if (/^https?:\/\//.test(from)) {
    const response = await fetch(new URL(name, from.endsWith('/') ? from : `${from}/`), { cache: 'no-store' });
    if (!response.ok) throw new Error(`${name}: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }
  return fs.readFileSync(path.join(from, name));
}

/**
 * A statement of the release (android-update*.json), or null where there is none. A server answers
 * an address it has no file for with the app's page (index.html, as install.sh's settings do), so
 * what starts as HTML, never as JSON, is no statement either.
 */
async function readStatement(from, name) {
  const bytes = await read(from, name).catch(() => null);
  return bytes && !/^\s*</.test(bytes.subarray(0, 64).toString()) ? bytes : null;
}

async function verifyRelease(from, keyFile = PUBLIC) {
  if (!from) fail('usage: node pwa/release.mjs verify <web app folder, or https://address> [public key file]');
  const raw = Buffer.from(fs.readFileSync(keyFile, 'utf8').trim(), 'base64');
  const body = await read(from, 'release.json');
  const signature = Buffer.from((await read(from, 'release.sig')).toString().trim(), 'base64');
  if (!verify(null, body, publicFromRaw(raw), signature)) fail(`NOT SIGNED with the key ${fingerprint(raw)}.`);
  const release = JSON.parse(body);
  const wrong = [];
  // Element Call's origin, where its frame comes from: its worker checks the same release there.
  // A server not set up for it yet gives no release there: the app is still served as signed, and
  // Element Call cannot start from an address that gives nothing, so that is told, not failed.
  let call = /^https?:\/\//.test(from) && release.origins ? release.origins.call : from;
  if (call !== from) {
    if (!(await read(call, 'release.json').catch(() => null))) {
      console.error(`WARNING: ${call} gives no release, so Matrix calls in the web app cannot start yet: serve it as deploy/web/install.sh does (pwa/README.md, Matrix calls). Element Call's files were not checked.`);
      call = null;
    } else {
      for (const name of ['release.json', 'release.sig', 'sw.js']) {
        const there = await read(call, name).catch(() => null);
        if (!there || !there.equals(await read(from, name))) wrong.push(`${call}/${name} (not the same as ${from}'s)`);
      }
    }
  }
  for (const [name, hash] of Object.entries(release.files)) {
    if (call === null && name.startsWith('/element-call/')) continue;
    const bytes = await read(name.startsWith('/element-call/') ? call : from, name.slice(1));
    if (createHash('sha256').update(bytes).digest('hex') !== hash) wrong.push(name);
    if (name === '/sw.js' && !bytes.toString().includes(`'${raw.toString('base64')}'`)) wrong.push('/sw.js (another key)');
  }
  if (wrong.length) fail(`Signed release ${release.version}, but these files differ from it:\n  ${wrong.join('\n  ')}`);
  // The Android app's statement, where there is one.
  const android = await readStatement(from, 'android-update.json');
  if (android) {
    const { statement, signature: signed } = JSON.parse(android);
    if (!/^erevos android update v1\nbuild [1-9]\d*\nsha256 [0-9a-f]{64}\n$/.test(statement ?? '')) fail('android-update.json does not say what it should.');
    if (!verify(null, Buffer.from(statement), publicFromRaw(raw), Buffer.from(signed ?? '', 'base64'))) fail(`android-update.json is NOT SIGNED with the key ${fingerprint(raw)}.`);
    console.log(`OK: the Android app, ${statement.trim().split('\n').slice(1).join(', ')}.`);
  }
  for (const channel of CHANNELS) {
    const text = await readStatement(from, `android-update-${channel}.json`);
    if (!text) continue;
    const { statement, signature: signed } = JSON.parse(text);
    if (CHANNEL_STATEMENT.exec(statement ?? '')?.[1] !== channel) fail(`android-update-${channel}.json does not say what it should.`);
    if (!verify(null, Buffer.from(statement), publicFromRaw(raw), Buffer.from(signed ?? '', 'base64'))) fail(`android-update-${channel}.json is NOT SIGNED with the key ${fingerprint(raw)}.`);
    console.log(`OK: the Android release of ${channel}, ${statement.trim().split('\n').slice(2).join(', ')}.`);
  }
  console.log(`OK: release ${release.version}${release.label ? ` (${release.label})` : ''} from ${release.created} (commit ${release.commit ?? 'unknown'}), ${Object.keys(release.files).length} files, signed with ${fingerprint(raw)}.`);
  console.log(`SHA-256 of release.json: ${createHash('sha256').update(body).digest('hex')}`);
}

// Run as a command; imported (by the checks), only what it exports.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...rest] = process.argv.slice(2);
  if (command === 'keygen') await keygen(...rest);
  else if (command === 'sign') await signRelease(...rest);
  else if (command === 'channel') await signChannel(...rest);
  else if (command === 'verify') await verifyRelease(...rest);
  else if (command === 'verify-sums') await verifySums(...rest);
  else if (command === 'sums') await signSums(...rest);
  else fail('usage: node pwa/release.mjs keygen|sign|channel|sums|verify|verify-sums …');
}
