// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// CREDITS.md names the open-source work Erevos is built on, with its makers and licences. Its "Main
// parts" and "Other works" are written by hand; its "Every package" is made here from the lockfiles,
// so a change that adds or updates a dependency lists it in the same change.
//
//   node scripts/credits.mjs            rewrites CREDITS.md between <!-- generated:start --> and
//                                       <!-- generated:end -->, and nothing else in it, and then
//                                       app/public/NOTICES.txt, the licence texts every build carries
//                                       (scripts/notices.mjs)
//   node scripts/credits.mjs --check    exits 1, saying what differs, when the packages in the lockfiles
//                                       are not exactly the ones CREDITS.md lists
//
// The check is also app/checks/credits.check.ts, so `npm run check` in app/ fails until the list
// matches. It compares names and versions only, which it reads from files in the repository: no
// network, no cargo, no node_modules. Writing the list also looks up licences and links, and needs
// cargo for the Rust crates (cargo metadata, from the registry cache, fetching a crate the cache
// lacks). What is listed, and where it is read from:
// - the app's JavaScript packages: app/package-lock.json, every entry not marked "dev". npm marks
//   "devOptional" a package that is a development one or an optional one (typescript, which
//   something may take as an optional peer): not only development, so it stays. The licence is the
//   lock's; the link is the repository or homepage in the package's own package.json, which is
//   read from app/node_modules when it is installed;
// - the computer app: desktop/package-lock.json, Electron and the packages it needs. Electron is
//   the app's runtime although it is a development dependency there; electron-builder, which only
//   packs the app, and its tree are not listed;
// - Rust crates: Cargo.lock, all but the workspace's own (the ones with no source);
// - Go modules: the `require` list of transports/go.mod, which lyrebird (the Tor bridges) is built
//   from. A licence is read from the module's LICENSE or COPYING in Go's module cache
//   (`cd transports && go mod download` fills it);
// - Android libraries: those the build.gradle files of the repository declare with a version.
// A licence or link that cannot be found when writing is the one CREDITS.md already has for that
// package, so writing on a machine without node_modules or Go's module cache keeps what was found
// elsewhere; with none, the licence says "see its source".
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const START = '<!-- generated:start -->';
const END = '<!-- generated:end -->';
/** What a licence says when nothing in reach tells. */
const UNKNOWN = 'see its source';

/** The parts of "Every package", in order: what each is, and the words for what it counts. */
export const SECTIONS = [
  {
    id: 'app',
    title: "The app's JavaScript packages",
    unit: 'packages',
    one: 'package',
    first: 'Package',
    about:
      'Everything in `app/package-lock.json` that is not only for development: the packages the app is made of, and the tools Expo builds it with.',
  },
  {
    id: 'desktop',
    title: 'The computer app',
    unit: 'packages',
    one: 'package',
    first: 'Package',
    about:
      'Electron, which the computer app runs on, and the packages it needs (`desktop/package-lock.json`). The tools that pack the app (electron-builder) are not part of it.',
  },
  {
    id: 'cargo',
    title: 'Rust crates',
    unit: 'crates',
    one: 'crate',
    first: 'Crate',
    about: "The core of the app, the relay and the Tor connection are written in Rust. Every crate in `Cargo.lock` but Erevos's own.",
  },
  {
    id: 'go',
    title: 'Go modules for the Tor bridges',
    unit: 'modules',
    one: 'module',
    first: 'Module',
    about:
      "The Android app's Tor bridges are lyrebird, built from these modules (`transports/go.mod`). Licences are read from the modules themselves.",
  },
  {
    id: 'android',
    title: 'Android libraries',
    unit: 'libraries',
    one: 'library',
    first: 'Library',
    about:
      "Libraries that Erevos's own Android code declares (`group:name`). React Native and Expo also bring Google's AndroidX libraries (Apache-2.0) when the Android app is built. React Native WebRTC brings the WebRTC library (BSD-3-Clause, built by Jitsi) and React Native Quick Crypto brings OpenSSL (Apache-2.0).",
  },
];

/** The entry of `table` for `key`, if the table has it of its own (a package may be named "constructor"). */
const own = (table, key) => (Object.hasOwn(table, key) ? table[key] : undefined);

/** The licences of Android libraries, for the ones the repository declares. */
const ANDROID_KNOWN = {
  'com.google.zxing:core': { license: 'Apache-2.0', link: 'https://github.com/zxing/zxing' },
  'com.googlecode.libphonenumber:libphonenumber': { license: 'Apache-2.0', link: 'https://github.com/google/libphonenumber' },
  'com.googlecode.libphonenumber:geocoder': { license: 'Apache-2.0', link: 'https://github.com/google/libphonenumber' },
  'androidx.media3:media3-exoplayer': { license: 'Apache-2.0', link: 'https://github.com/androidx/media' },
  'androidx.media3:media3-session': { license: 'Apache-2.0', link: 'https://github.com/androidx/media' },
  'androidx.media3:media3-ui': { license: 'Apache-2.0', link: 'https://github.com/androidx/media' },
  'androidx.camera:camera-core': { license: 'Apache-2.0', link: 'https://developer.android.com/jetpack/androidx/releases/camera' },
  'androidx.camera:camera-camera2': { license: 'Apache-2.0', link: 'https://developer.android.com/jetpack/androidx/releases/camera' },
  'androidx.camera:camera-lifecycle': { license: 'Apache-2.0', link: 'https://developer.android.com/jetpack/androidx/releases/camera' },
  'androidx.camera:camera-video': { license: 'Apache-2.0', link: 'https://developer.android.com/jetpack/androidx/releases/camera' },
  'androidx.camera:camera-view': { license: 'Apache-2.0', link: 'https://developer.android.com/jetpack/androidx/releases/camera' },
  'androidx.camera:camera-extensions': { license: 'Apache-2.0', link: 'https://developer.android.com/jetpack/androidx/releases/camera' },
};

/** A package that names its licence nowhere in its package.json or the lock. Element Call's source files
 *  say it in their SPDX line, and its folder holds the AGPL and Element's commercial licence. */
const NPM_LICENSES = {
  '@element-hq/element-call-embedded': 'AGPL-3.0-only OR LicenseRef-Element-Commercial',
};

/** Lyrebird's LICENSE files hold BSD licences and the text of the GPL, for two of its packages (meeklite,
 *  x25519ell2), whose sources say "version 3 or any later version", which the text alone does not. */
const GO_LICENSES = {
  'gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/lyrebird': 'BSD-2-Clause AND BSD-3-Clause AND GPL-3.0-or-later',
};

// ---------------------------------------------------------------- what the lockfiles hold

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** The name an entry of package-lock.json is installed under: node_modules/a/node_modules/@b/c is @b/c. */
function npmName(key, entry) {
  return entry.name ?? key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length);
}

/** The packages of a lock for the keys `keys` hold, once for each name and version (a package may sit in
 *  several places), with the key of one place for finding its package.json. */
function npmEntries(lock, keys) {
  const seen = new Map();
  for (const key of [...keys].sort()) {
    const entry = lock.packages[key];
    if (!entry?.version) continue; // a link to a folder of the workspace, not a package
    const name = npmName(key, entry);
    const id = `${name}@${entry.version}`;
    if (!seen.has(id)) seen.set(id, { name, version: entry.version, license: licenseText(entry.license), key });
  }
  return [...seen.values()];
}

/** Where npm finds `name` for the package at `from`: its own node_modules, then each one above. */
function resolveDependency(packages, from, name) {
  let base = from;
  for (;;) {
    const key = `${base ? `${base}/` : ''}node_modules/${name}`;
    if (packages[key]) return key;
    if (!base) return null;
    const cut = base.lastIndexOf('/node_modules/');
    base = cut < 0 ? '' : base.slice(0, cut);
  }
}

function appPackages(root) {
  const lock = readJson(path.join(root, 'app', 'package-lock.json'));
  return npmEntries(lock, Object.keys(lock.packages).filter((key) => key && !lock.packages[key].dev));
}

function desktopPackages(root) {
  const lock = readJson(path.join(root, 'desktop', 'package-lock.json'));
  const first = 'node_modules/electron';
  if (!lock.packages[first]) throw new Error('desktop/package-lock.json does not hold electron');
  const keys = new Set();
  const todo = [first];
  while (todo.length) {
    const key = todo.pop();
    if (keys.has(key) || !lock.packages[key]) continue;
    keys.add(key);
    const entry = lock.packages[key];
    for (const name of Object.keys({ ...entry.dependencies, ...entry.optionalDependencies })) {
      const found = resolveDependency(lock.packages, key, name);
      if (found) todo.push(found);
    }
  }
  return npmEntries(lock, keys);
}

/** Cargo.lock's packages that come from somewhere: a registry or git. The workspace's own have no source. */
function cratePackages(root) {
  const text = fs.readFileSync(path.join(root, 'Cargo.lock'), 'utf8');
  const out = [];
  for (const block of text.split(/^\[\[package\]\]\s*$/m).slice(1)) {
    const field = (name) => new RegExp(`^${name} = "([^"]*)"`, 'm').exec(block)?.[1];
    const [name, version, source] = [field('name'), field('version'), field('source')];
    if (name && version && source) out.push({ name, version });
  }
  return out;
}

/** The modules transports/go.mod requires, whether in a `require ( … )` block or on a line of their own. */
function goModules(root) {
  const out = [];
  let inBlock = false;
  for (const raw of fs.readFileSync(path.join(root, 'transports', 'go.mod'), 'utf8').split('\n')) {
    const line = raw.replace(/\/\/.*$/, '').trim();
    if (line === 'require (') inBlock = true;
    else if (inBlock && line === ')') inBlock = false;
    else {
      const m = (inBlock ? /^(\S+)\s+(v\S+)$/ : /^require\s+(\S+)\s+(v\S+)$/).exec(line);
      if (m) out.push({ name: m[1], version: m[2] });
    }
  }
  return out;
}

// What a walk of the repository leaves out: other people's code, what is built, and what Expo
// makes for a phone build (app/android, app/ios), which is not ours.
const SKIP_DIRS = new Set(['node_modules', 'target', '.git', '.gradle', 'dist', 'build', '.expo', 'web-build']);
const SKIP_PATHS = new Set(['app/android', 'app/ios', 'desktop/web']);

function gradleFiles(root, dir = root) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name) && !SKIP_PATHS.has(path.relative(root, full).split(path.sep).join('/'))) out.push(...gradleFiles(root, full));
    } else if (/^build\.gradle(\.kts)?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** The libraries our build.gradle files declare with a version. Those with none (React Native's own
 *  Android library, whose version React Native sets) come with the npm package that carries them. */
function androidLibraries(root) {
  const seen = new Map();
  const declared = /^\s*(?:implementation|api|compileOnly|runtimeOnly)\s*\(?\s*['"]([\w.-]+):([\w.-]+):([^'"$:@]+)['"]/gm;
  for (const file of gradleFiles(root).sort()) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(declared)) {
      seen.set(`${m[1]}:${m[2]}@${m[3]}`, { name: `${m[1]}:${m[2]}`, version: m[3] });
    }
  }
  return [...seen.values()];
}

/** Every package the repository's lockfiles hold, by part of the list. */
export function lockedPackages(root) {
  return {
    app: appPackages(root),
    desktop: desktopPackages(root),
    cargo: cratePackages(root),
    go: goModules(root),
    android: androidLibraries(root),
  };
}

// ---------------------------------------------------------------- CREDITS.md as it is

const keyOf = (id, name, version) => `${id}\t${name}\t${version}`;

export function creditsText(root) {
  const file = path.join(root, 'CREDITS.md');
  if (!fs.existsSync(file)) throw new Error('CREDITS.md is missing');
  return fs.readFileSync(file, 'utf8');
}

function generatedRange(text) {
  const from = text.indexOf(START);
  const to = text.indexOf(END);
  if (from < 0 || to < from) throw new Error(`CREDITS.md needs ${START} and ${END}, in that order, around the list of every package`);
  return [from, to];
}

/** The packages CREDITS.md lists, by section id, name and version, with the licence and link it gives. */
export function listedPackages(text) {
  const [from, to] = generatedRange(text);
  const rows = new Map();
  let section = null;
  for (const line of text.slice(from + START.length, to).split('\n')) {
    const heading = /^### (.+)$/.exec(line);
    if (heading) {
      section = SECTIONS.find((s) => s.title === heading[1].trim()) ?? null;
      continue;
    }
    if (!section || !line.startsWith('|')) continue;
    const cells = line
      .slice(1, line.lastIndexOf('|'))
      .split(/(?<!\\)\|/)
      .map((cell) => cell.trim());
    if (cells.length < 3 || cells[0] === section.first || /^-+$/.test(cells[0])) continue;
    const linked = /^\[(.+)\]\((.*)\)$/.exec(cells[0]);
    const name = linked ? linked[1] : cells[0];
    rows.set(keyOf(section.id, name, cells[1]), {
      id: section.id,
      name,
      version: cells[1],
      license: cells[2].replace(/\\\|/g, '|'),
      link: linked ? linked[2] : null,
    });
  }
  return rows;
}

/** What differs between the lockfiles and CREDITS.md: `missing` are packages it does not list, `gone`
 *  ones it lists that the lockfiles no longer hold. Each is a line such as "Rust crates: serde 1.0.1". */
export function check(root = ROOT) {
  const have = listedPackages(creditsText(root));
  const locked = lockedPackages(root);
  const want = new Map();
  for (const s of SECTIONS) {
    for (const { name, version } of locked[s.id]) want.set(keyOf(s.id, name, version), `${s.title}: ${name} ${version}`);
  }
  const title = (id) => SECTIONS.find((s) => s.id === id).title;
  return {
    missing: [...want].filter(([key]) => !have.has(key)).map(([, line]) => line).sort(),
    gone: [...have].filter(([key]) => !want.has(key)).map(([, row]) => `${title(row.id)}: ${row.name} ${row.version}`).sort(),
  };
}

// ---------------------------------------------------------------- licences and links

/** A licence as the lock or package.json gives it: a string, or an old-style { type } or list of them. */
function licenseText(value) {
  if (typeof value === 'string') return value.trim() || null;
  if (Array.isArray(value)) return value.map(licenseText).filter(Boolean).join(' OR ') || null;
  if (value && typeof value.type === 'string') return value.type.trim() || null;
  return null;
}

/** SPDX writes OR, and older crates a slash: "MIT/Apache-2.0" is "MIT OR Apache-2.0". */
const spdx = (text) => text.trim().replace(/\s*\/\s*/g, ' OR ').replace(/\s+/g, ' ');

/** A repository or homepage as a web address, or null: git+https://github.com/a/b.git, git@host:a/b.git,
 *  github:a/b and a/b all become https://github.com/a/b. */
function webLink(value) {
  let url = typeof value === 'string' ? value : value?.url;
  if (typeof url !== 'string') return null;
  url = url.trim();
  const short = /^(github|gitlab|bitbucket):(.+)$/.exec(url);
  if (short) url = `https://${short[1]}.${short[1] === 'bitbucket' ? 'org' : 'com'}/${short[2]}`;
  else if (/^[\w.-]+\/[\w.-]+$/.test(url)) url = `https://github.com/${url}`;
  url = url
    .replace(/^git\+/, '')
    .replace(/^git:\/\//, 'https://')
    .replace(/^ssh:\/\/git@/, 'https://')
    .replace(/^git@([^:/]+):/, 'https://$1/')
    .replace(/^http:\/\//, 'https://')
    .replace(/#.*$/, '')
    .replace(/\.git\/?$/, '')
    .replace(/\/+$/, '');
  return /^https:\/\/[^\s()]+$/.test(url) ? url : null;
}

/** The licences a licence file's text grants, by SPDX name: from what it says, which is enough for the
 *  common ones. A text that holds several (a file of notices, one after another, set apart by a ruled
 *  line) gives each once. */
function licensesIn(text) {
  const ids = [];
  for (const block of text.split(/^[ \t]*(?:-{10,}|={10,}|_{10,}|\*{10,}|#{10,}|~{10,})[ \t]*$/m)) {
    const id = licenseOf(block);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

function licenseOf(block) {
  const t = block.toLowerCase().replace(/\s+/g, ' ');
  const has = (...words) => words.every((w) => t.includes(w));
  if (has('apache license', 'version 2.0')) return 'Apache-2.0';
  if (has('mozilla public license', 'version 2.0')) return 'MPL-2.0';
  if (has('gnu affero general public license', 'version 3')) return 'AGPL-3.0-only';
  if (has('gnu lesser general public license', 'version 3')) return 'LGPL-3.0-only';
  if (has('gnu lesser general public license', 'version 2.1')) return 'LGPL-2.1-only';
  if (has('gnu general public license', 'version 3')) return 'GPL-3.0-only';
  if (has('gnu general public license', 'version 2')) return 'GPL-2.0-only';
  if (has('free and unencumbered software released into the public domain')) return 'Unlicense';
  if (has('cc0 1.0 universal')) return 'CC0-1.0';
  if (has('permission is hereby granted, free of charge')) return 'MIT';
  if (has('permission to use, copy, modify, and/or distribute this software for any purpose with or without fee')) {
    return has('provided that the above copyright notice') ? 'ISC' : '0BSD';
  }
  if (has('redistribution and use in source and binary forms')) {
    if (has('all advertising materials')) return 'BSD-4-Clause';
    return has('neither the name') || has('may be used to endorse') ? 'BSD-3-Clause' : 'BSD-2-Clause';
  }
  if (has('altered source versions must be plainly marked')) return 'Zlib';
  return null;
}

/** The licence of a module or crate from the LICENSE, LICENCE, COPYING or UNLICENSE files in `dir` itself:
 *  every licence they hold, joined by AND; null when there is no such file or none is known. */
function licenseInFolder(dir) {
  const ids = [];
  let names;
  try {
    names = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile() && /^(licen[cs]e|copying|unlicen[cs]e)([-._ ].*)?$/i.test(e.name)).map((e) => e.name);
  } catch {
    return null; // not there
  }
  for (const name of names.sort()) {
    for (const id of licensesIn(fs.readFileSync(path.join(dir, name), 'utf8'))) if (!ids.includes(id)) ids.push(id);
  }
  return ids.length ? ids.join(' AND ') : null;
}

// ---------------------------------------------------------------- the details of each part

/** The licence and link CREDITS.md has now for packages, to keep what cannot be found again here. */
function remembered(text) {
  const exact = listedPackages(text);
  const named = new Map();
  for (const row of exact.values()) named.set(`${row.id}\t${row.name}`, row);
  return (id, name, version) => exact.get(keyOf(id, name, version)) ?? named.get(`${id}\t${name}`);
}

function readPackageJson(file) {
  try {
    return readJson(file);
  } catch {
    return null;
  }
}

function describeNpm(entries, folder, id, before) {
  return entries.map((entry) => {
    const pkg = readPackageJson(path.join(folder, entry.key, 'package.json'));
    const old = before(id, entry.name, entry.version);
    return {
      name: entry.name,
      version: entry.version,
      license:
        entry.license ??
        licenseText(pkg?.license ?? pkg?.licenses) ??
        own(NPM_LICENSES, entry.name) ??
        licenseInFolder(path.join(folder, entry.key)) ??
        old?.license ??
        UNKNOWN,
      link: webLink(pkg?.repository) ?? webLink(pkg?.homepage) ?? old?.link ?? null,
    };
  });
}

/** cargo's view of the workspace with every feature on, as Cargo.lock has it. It works from the registry
 *  cache (--offline); crates of other systems (Windows, Android) are not in the cache of a machine that
 *  never built for them, so cargo is asked again, with the network, for those. */
function cargoMetadata(root) {
  const args = ['metadata', '--format-version', '1', '--locked', '--all-features'];
  const run = (extra) => execFileSync('cargo', [...args, ...extra], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 29, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    return JSON.parse(run(['--offline']));
  } catch (offline) {
    if (offline.code === 'ENOENT') throw new Error("cargo is not installed: it is needed to read the Rust crates' licences (https://rustup.rs)");
    process.stderr.write("cargo's cache lacks some crates; fetching them\n");
    try {
      return JSON.parse(run([]));
    } catch (online) {
      throw new Error(`cargo metadata failed:\n${String(online.stderr || online.message).trim()}`);
    }
  }
}

function describeCrates(crates, root, before) {
  const info = new Map(cargoMetadata(root).packages.map((p) => [`${p.name}@${p.version}`, p]));
  return crates.map(({ name, version }) => {
    const pkg = info.get(`${name}@${version}`);
    const old = before('cargo', name, version);
    const file = pkg?.license_file ? licenseInFolder(path.dirname(pkg.manifest_path)) : null;
    return {
      name,
      version,
      license: (pkg?.license ? spdx(pkg.license) : null) ?? file ?? old?.license ?? UNKNOWN,
      link: webLink(pkg?.repository) ?? webLink(pkg?.homepage) ?? old?.link ?? null,
    };
  });
}

/** Go's module cache, or null without Go. */
export function goModuleCache() {
  try {
    return execFileSync('go', ['env', 'GOMODCACHE'], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, GOTOOLCHAIN: 'local' }, stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
  } catch {
    return null;
  }
}

/** Where a Go module lives on the web: its repository on the hosts that have them by owner and name,
 *  else its page on pkg.go.dev, which names the repository and the licence. */
function goLink(module) {
  const parts = module.replace(/\/v\d+$/, '').split('/');
  if (['github.com', 'gitlab.com'].includes(parts[0]) && parts.length >= 3) return `https://${parts.slice(0, 3).join('/')}`;
  if (parts[0] === 'gitlab.torproject.org' && parts.length >= 5) return `https://${parts.slice(0, 5).join('/')}`;
  return `https://pkg.go.dev/${module}`;
}

function describeGo(modules, before) {
  const cache = goModuleCache();
  // The cache keeps a capital letter as ! and the small one, so that case-blind disks do not clash.
  const escaped = (text) => text.replace(/[A-Z]/g, (c) => `!${c.toLowerCase()}`);
  let lacking = 0;
  const rows = modules.map(({ name, version }) => {
    const found = cache ? licenseInFolder(path.join(cache, `${escaped(name)}@${escaped(version)}`)) : null;
    const old = before('go', name, version);
    const stated = own(GO_LICENSES, name);
    if (!found && !stated) lacking++;
    return { name, version, license: stated ?? found ?? old?.license ?? UNKNOWN, link: goLink(name) };
  });
  if (lacking) {
    console.log(`${lacking} of ${modules.length} Go modules have no licence file in Go's module cache${cache ? '' : ' (Go is not installed)'}: run "cd transports && go mod download", then this again`);
  }
  return rows;
}

function describeAndroid(libraries, before) {
  return libraries.map(({ name, version }) => {
    const known = own(ANDROID_KNOWN, name);
    const old = before('android', name, version);
    return { name, version, license: known?.license ?? old?.license ?? UNKNOWN, link: known?.link ?? old?.link ?? null };
  });
}

// ---------------------------------------------------------------- writing the list

const escapeCell = (text) => text.replace(/\s+/g, ' ').replace(/\|/g, '\\|');
const linkTo = (text, url) => (url ? `[${escapeCell(text)}](${url.replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/ /g, '%20')})` : escapeCell(text));

function compareRows(a, b) {
  const [x, y] = [a.name.toLowerCase(), b.name.toLowerCase()];
  if (x !== y) return x < y ? -1 : 1;
  return a.version.localeCompare(b.version, 'en', { numeric: true });
}

function renderList(rowsById) {
  return SECTIONS.map((s) => {
    const rows = [...rowsById[s.id]].sort(compareRows);
    const lines = rows.map((r) => `| ${linkTo(r.name, r.link)} | ${escapeCell(r.version)} | ${escapeCell(r.license)} |`);
    return [`### ${s.title}`, '', `${s.about} ${rows.length} ${rows.length === 1 ? s.one : s.unit}.`, '', `| ${s.first} | Version | Licence |`, '| --- | --- | --- |', ...lines, ''].join('\n');
  }).join('\n');
}

/** Writes the list of every package into CREDITS.md and says what it did. */
export function generate(root = ROOT) {
  const text = creditsText(root);
  const [from, to] = generatedRange(text);
  const before = remembered(text);
  const locked = lockedPackages(root);
  const rows = {
    app: describeNpm(locked.app, path.join(root, 'app'), 'app', before),
    desktop: describeNpm(locked.desktop, path.join(root, 'desktop'), 'desktop', before),
    cargo: describeCrates(locked.cargo, root, before),
    go: describeGo(locked.go, before),
    android: describeAndroid(locked.android, before),
  };
  const next = `${text.slice(0, from + START.length)}\n\n${renderList(rows)}\n${text.slice(to)}`;
  if (next !== text) fs.writeFileSync(path.join(root, 'CREDITS.md'), next);
  console.log(`${next === text ? 'CREDITS.md is up to date' : 'CREDITS.md written'}: ${SECTIONS.map((s) => `${rows[s.id].length} ${rows[s.id].length === 1 ? s.one : s.unit}`).join(', ')}`);
  const unknown = SECTIONS.flatMap((s) => rows[s.id].filter((r) => r.license === UNKNOWN).map((r) => `${s.title}: ${r.name} ${r.version}`));
  if (unknown.length) console.log(`No licence found for ${unknown.length}; they say "${UNKNOWN}":\n  ${unknown.join('\n  ')}`);
}

// ---------------------------------------------------------------- the command

function main(args) {
  const wanted = args.filter((a) => a !== '--check');
  if (wanted.length) {
    console.error('usage: node scripts/credits.mjs [--check]');
    process.exit(2);
  }
  try {
    if (!args.includes('--check')) {
      generate();
      // NOTICES.txt goes with the list: the same packages, with their licence texts (scripts/notices.mjs).
      return import('./notices.mjs').then(({ writeNotices }) => {
        const { packages, own, texts, changed } = writeNotices();
        console.log(`app/public/NOTICES.txt ${changed ? 'written' : 'is up to date'}: ${packages} packages, ${own} with their own licence files, ${texts} licence texts`);
      });
    }
    const { missing, gone } = check();
    if (!missing.length && !gone.length) return console.log('CREDITS.md lists exactly the packages in the lockfiles.');
    const some = (lines) => (lines.length > 40 ? [...lines.slice(0, 40), `… and ${lines.length - 40} more`] : lines).map((line) => `  ${line}`);
    console.error('CREDITS.md does not list the packages in the lockfiles.');
    if (missing.length) console.error(`Not in CREDITS.md (${missing.length}):\n${some(missing).join('\n')}`);
    if (gone.length) console.error(`In CREDITS.md, but not in the lockfiles any more (${gone.length}):\n${some(gone).join('\n')}`);
    console.error('Run: node scripts/credits.mjs');
    process.exit(1);
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
