// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Makes the Erevos web app from the web build (npx expo export --platform web, with the core from
// app/scripts/build-web-core.mjs): adds the service worker with the release key's public half,
// the first script (boot.js), the icons and the manifest that let it be added to a home screen,
// the page an invite sent by text message opens (i/), Element Call for Matrix calls
// (element-call/, from pwa/element-call.mjs), and release.json, which lists every file with its
// SHA-256 and the app's two origins. pwa/release.mjs then signs release.json. See README.md.
//
//   node pwa/build.mjs <web build> <out> [--key <public key file>] [--version <n>] [--label <2.0.0>]
//       [--origin <https://app.example.org>] [--call-origin <https://call.example.org>]
//       [--element-call <Element Call's dist> | --no-element-call] [--edition plus|lite]
//
// The key defaults to pwa/release-key.pub. The version, which must grow from one release to the
// next, defaults to the time in seconds. The label names the GitHub release (v2.0.0, v4.0.0-rc.1)
// the web app goes out with, so it carries the same number as the other packages; the app shows it.
// The origin is the address the app is served at; the call origin a second one, on the same server,
// that Element Call's frame comes from, so it can read nothing of the app's (README.md). Element
// Call comes from app/node_modules (npm ci in app/); without it (--no-element-call) the web app
// makes no Matrix calls and needs no second address.
//
// The edition (docs/editions.md) defaults to EREVOS_EDITION, as the web build's own does, else
// Erevos+: the plain Erevos is the web app `erevos-web` at erevos-web.lphl.nekten.eu, Erevos+ the web
// app `erevosplus-web` at erevosplus-web.lphl.nekten.eu, with Element Call at erevosplus-call. Each
// is its own app at its own address: its own storage in the browser, its own folder on the server
// (deploy/web/install.sh), and its worker takes only releases of its own app.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { makeElementCall } from './element-call.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

function fail(text) {
  console.error(text);
  process.exit(2);
}

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  if (at < 0) return fallback;
  const [, value] = args.splice(at, 2);
  return value;
};
const edition = option('--edition', process.env.EREVOS_EDITION || 'plus');
if (edition !== 'plus' && edition !== 'lite') fail(`The edition is "${edition}": only plus and lite are known.`);
const plus = edition === 'plus';
const webApp = plus ? 'erevosplus-web' : 'erevos-web';
const appName = plus ? 'Erevos+' : 'Erevos';
const keyFile = option('--key', path.join(here, 'release-key.pub'));
const version = Number(option('--version', String(Math.floor(Date.now() / 1000))));
const label = option('--label', null);
const appOrigin = option('--origin', plus ? 'https://erevosplus-web.lphl.nekten.eu' : 'https://erevos-web.lphl.nekten.eu');
const callOrigin = option('--call-origin', plus ? 'https://erevosplus-call.lphl.nekten.eu' : 'https://erevos-call.lphl.nekten.eu');
const elementCallDist = option('--element-call', path.join(here, '..', 'app', 'node_modules', '@element-hq', 'element-call-embedded', 'dist'));
const withoutCalls = args.includes('--no-element-call') && args.splice(args.indexOf('--no-element-call'), 1).length > 0;
const [from, out] = args;
if (!from || !out) fail('usage: node pwa/build.mjs <web build> <out> [--key <public key file>] [--version <n>]');
if (!Number.isSafeInteger(version) || version < 1) fail('The version must be a whole number above 0.');
// A release's name, as app/lib/version-name.ts takes it: 2.0.0, or one before it, 4.0.0-rc.1.
const RELEASE_NAME = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(alpha|beta|rc)\.[1-9]\d*)?$/;
if (label !== null && !RELEASE_NAME.test(label)) fail('The label must look like 2.0.0, or 4.0.0-rc.1.');
// Origins: https, or http on this computer for a check.
const ORIGIN = /^(https:\/\/[a-z0-9.-]+|http:\/\/(localhost|127\.0\.0\.1))(:[0-9]{1,5})?$/;
for (const [name, value] of [['--origin', appOrigin], ['--call-origin', callOrigin]]) {
  if (!ORIGIN.test(value)) fail(`${name} must be an origin, like https://app.example.org, with no path.`);
}
if (appOrigin === callOrigin) fail('Element Call needs an origin of its own: --call-origin must differ from --origin.');
if (!withoutCalls && !fs.existsSync(path.join(elementCallDist, 'index.html'))) fail(`No Element Call at ${elementCallDist}: run npm ci in app/, or build with --no-element-call.`);
if (!fs.existsSync(keyFile)) fail(`No public key at ${keyFile}. Make the release key first: node pwa/release.mjs keygen <private key file>`);
const publicKey = fs.readFileSync(keyFile, 'utf8').trim();
if (Buffer.from(publicKey, 'base64').length !== 32) fail(`${keyFile} does not hold an Ed25519 public key (32 bytes, base64).`);
if (!fs.existsSync(path.join(from, 'index.html'))) fail(`${from} has no index.html: is it the web build?`);
if (!fs.existsSync(path.join(from, 'core', 'erevos_ffi_bg.wasm'))) fail(`${from} has no core/erevos_ffi_bg.wasm: build the core first (app/scripts/build-web-core.mjs).`);

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(from, out, { recursive: true });
const write = (name, data) => fs.writeFileSync(path.join(out, name), data);

// The same policy the worker adds to the page, here too in case the page is ever served without it.
const CSP =
  "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: https:; font-src 'self' data:; connect-src 'self' blob: https: ws: wss:; worker-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'";
// The app's page may show one frame: Element Call's, from its origin.
const APP_CSP = withoutCalls ? CSP : `${CSP}; frame-src ${callOrigin}`;

const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
const entries = [...html.matchAll(/<script src="([^"]+)" defer><\/script>/g)];
if (entries.length !== 1) fail('index.html does not have the one app script this expects.');
const head = [
  '<meta name="referrer" content="no-referrer" />',
  '<meta name="theme-color" content="#0D0B09" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  `<meta name="apple-mobile-web-app-title" content="${appName}" />`,
  '<link rel="manifest" href="/manifest.webmanifest" />',
  '<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />',
  '<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
  '<link rel="stylesheet" href="/boot.css" />',
  // Where Element Call's frame comes from (app/lib/element-call-window.web.ts).
  ...(withoutCalls ? [] : [`<meta name="erevos-call" content="${callOrigin}" />`]),
].join('\n    ');
write(
  'index.html',
  html
    .replace('<meta charset="utf-8" />', `<meta charset="utf-8" />\n    <meta http-equiv="Content-Security-Policy" content="${APP_CSP}" />`)
    .replace(/<meta name="viewport" content="[^"]*" \/>/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />')
    .replace('</head>', `  ${head}\n  </head>`)
    .replace(entries[0][0], `<script src="/boot.js" data-entry="${entries[0][1]}"></script>`),
);

write('boot.js', fs.readFileSync(path.join(here, 'boot.js')));
write('boot.css', fs.readFileSync(path.join(here, 'boot.css')));
// The pages of their own, under the same policy: the one an invite sent by text message opens, /i/
// (i/invite.js), and the one a contact link for a website opens, /c/ (c/contact.js, with the
// invite page's style).
for (const [dir, files] of [
  ['i', ['i/invite.js', 'i/invite.css']],
  ['c', ['c/contact.js', 'i/invite.css']],
]) {
  if (fs.existsSync(path.join(out, dir))) fail(`${from} has a ${dir}/ of its own, where a page of Erevos goes.`);
  fs.cpSync(path.join(here, dir), path.join(out, dir), { recursive: true });
  let page = fs.readFileSync(path.join(out, dir, 'index.html'), 'utf8');
  if (!page.includes('<meta charset="utf-8" />')) fail(`pwa/${dir}/index.html has lost its charset line.`);
  // Its script and style named with their hash: the server sends them with no no-cache, so a browser
  // that kept older ones from a visit before fetches these.
  for (const name of files) {
    if (!page.includes(`"/${name}"`)) fail(`pwa/${dir}/index.html no longer loads /${name}.`);
    const hash = createHash('sha256').update(fs.readFileSync(path.join(here, name))).digest('hex').slice(0, 16);
    page = page.replace(`"/${name}"`, `"/${name}?${hash}"`);
  }
  write(`${dir}/index.html`, page.replace('<meta charset="utf-8" />', `<meta charset="utf-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`));
}
// Element Call, which the worker serves only on its own origin.
if (!withoutCalls) {
  if (fs.existsSync(path.join(out, 'element-call'))) fail(`${from} has an element-call/ of its own, where Element Call goes.`);
  try {
    makeElementCall(elementCallDist, path.join(out, 'element-call'));
  } catch (error) {
    fail(error.message);
  }
}
const worker = fs.readFileSync(path.join(here, 'sw.js'), 'utf8');
for (const mark of ['__EREVOS_PUBLIC_KEY__', '__EREVOS_WEB_APP__', '__EREVOS_APP_ORIGIN__', '__EREVOS_CALL_ORIGIN__']) {
  if (!worker.includes(`'${mark}'`)) fail(`pwa/sw.js has lost its mark ${mark}.`);
}
// The same worker on both origins: it serves on each only that origin's files.
write(
  'sw.js',
  worker
    .replace('__EREVOS_PUBLIC_KEY__', publicKey)
    .replace('__EREVOS_WEB_APP__', webApp)
    .replace('__EREVOS_APP_ORIGIN__', withoutCalls ? '' : appOrigin)
    .replace('__EREVOS_CALL_ORIGIN__', withoutCalls ? '' : callOrigin),
);

// Android App Links (app/app.json, autoVerify for /i and /c): Android opens a tapped invite or
// contact link in Erevos straight away only if this site says the app may, for the app signed with
// the release key (the keystore on the DELL). Its certificate's SHA-256, as the release APKs carry
// it in their signing block (read from 7.0.0-rc.1's). Android fetches the file itself, not through
// the worker, and wants it as JSON with no redirect.
const RELEASE_CERTIFICATE = '49:F0:D9:BE:60:09:2F:02:CF:27:C5:24:67:52:55:01:93:A6:7B:81:21:29:BF:53:41:79:53:B7:C8:79:8E:69';
if (fs.existsSync(path.join(out, '.well-known'))) fail(`${from} has a .well-known/ of its own, where Android's App Links file goes.`);
fs.mkdirSync(path.join(out, '.well-known'));
write(
  '.well-known/assetlinks.json',
  `${JSON.stringify(
    [
      // Each edition is an app of its own (app/lib/update-channel.ts PACKAGES), all signed with that key.
      ...['app.erevos', 'app.erevos.plus', 'app.erevos.lite'].map((package_name) => ({
        relation: ['delegate_permission/common.handle_all_urls'],
        target: { namespace: 'android_app', package_name, sha256_cert_fingerprints: [RELEASE_CERTIFICATE] },
      })),
    ],
    null,
    2,
  )}\n`,
);

// The icons are the artwork in brand/, as they are.
const brand = (name) => fs.readFileSync(path.join(here, '..', 'brand', 'png', name));
write('favicon.png', brand('web/icon-32.png'));
write('icon-192.png', brand('web/icon-192.png'));
write('icon-512.png', brand('web/icon-512.png'));
write('apple-touch-icon.png', brand('ios/icon-180.png'));
write('maskable-432.png', fs.readFileSync(path.join(here, '..', 'app', 'assets', 'icon', 'maskable.png')));
write(
  'manifest.webmanifest',
  `${JSON.stringify(
    {
      name: appName,
      short_name: appName,
      id: '/',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      background_color: '#0D0B09',
      theme_color: '#0D0B09',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/maskable-432.png', sizes: '432x432', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  )}\n`,
);

// Every file, with its hash, in a fixed order: the same files give the same release.json.
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
const files = {};
for (const full of walk(out).sort()) {
  const name = `/${path.relative(out, full).split(path.sep).join('/')}`;
  if (name === '/release.json' || name === '/release.sig') continue;
  if (!/^\/[\w.@/-]+$/.test(name)) fail(`${name}: a name the worker would refuse.`);
  files[name] = createHash('sha256').update(fs.readFileSync(full)).digest('hex');
}

let commit = null;
try {
  commit = execFileSync('git', ['-C', here, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
} catch {
  // Not built from a checkout.
}
const release = {
  app: webApp,
  version,
  ...(label ? { label } : {}),
  created: new Date().toISOString(),
  commit,
  ...(withoutCalls ? {} : { origins: { app: appOrigin, call: callOrigin } }),
  files,
};
write('release.json', `${JSON.stringify(release, null, 1)}\n`);
console.log(`${appName} web app (${webApp}), release ${version}${label ? ` (${label})` : ''}, ${Object.keys(files).length} files, in ${out}. Sign it: node pwa/release.mjs sign ${out} <private key file>`);
