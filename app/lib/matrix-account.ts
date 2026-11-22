// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A Matrix account's own matters, as Element has them (lib/matrix.ts holds the account): making a
// new account on a homeserver that lets one (/register), and the account's devices, seen, named,
// and signed out from here.
//
// Both may ask more of the person before the homeserver does them (User-Interactive
// Authentication): agreeing to its terms, a registration token, the password, or a step on the
// homeserver's own page, such as a captcha or single sign-on, which the browser opens and Erevos
// never sees. Each such step comes back here as an ask (AuthAsk), which the screen answers and
// tries again with. A step nobody can take here, such as an e-mail address, is said so: the
// account is then made on the homeserver's website, and signed in to here.

import { t } from './i18n';
import { answeredJson, callAnswer, call, enc, MatrixError, newDevice, request, type Json, type MatrixAnswer, type MatrixServer, type MatrixState, type MatrixTor } from './matrix';
import { editionName } from './edition';

/** A step the homeserver asks for before it does what was asked. */
export type AuthAsk = {
  stage: string;
  session: string;
  /** Its terms, for m.login.terms: each document's name and where to read it. */
  terms?: { name: string; url: string }[];
  /** The page on the homeserver where a step is taken that Erevos cannot take itself (a captcha, single sign-on). */
  fallback?: string;
};

/** Steps this phone can take, and those taken on the homeserver's own page. */
const HERE = ['m.login.dummy', 'm.login.terms', 'm.login.registration_token', 'm.login.password'];
const ON_ITS_PAGE = ['m.login.recaptcha', 'm.login.sso'];

/** What may answer an ask: the stage's own fields, with the session added here. */
export type AuthAnswer = Json;

function termsOf(params: Json | undefined): { name: string; url: string }[] {
  const policies = (params?.policies as Record<string, Json> | undefined) ?? {};
  const shown: { name: string; url: string }[] = [];
  for (const policy of Object.values(policies)) {
    if (!policy || typeof policy !== 'object') continue;
    const lang = (policy.en as Json | undefined) ?? (Object.values(policy).find((v) => v && typeof v === 'object') as Json | undefined);
    const url = lang?.url;
    if (typeof url === 'string' && /^https:\/\//.test(url)) shown.push({ name: typeof lang?.name === 'string' ? lang.name.slice(0, 100) : url, url });
  }
  return shown.slice(0, 10);
}

/**
 * Runs a request that may ask for more (`run`, given the answer so far): what it says when done,
 * or the next step asked for. A step of only saying "go on" (m.login.dummy) is taken here at once.
 */
async function interactive(homeserver: string, run: (auth?: Json) => Promise<MatrixAnswer>, auth?: Json): Promise<{ json: Json } | { ask: AuthAsk }> {
  let given = auth;
  for (let round = 0; round < 6; round++) {
    const answer = await run(given);
    if (answer.status !== 401 || !Array.isArray(answer.json.flows)) return { json: answeredJson(answer) };
    // An answer given and not taken, such as a wrong password: said as the homeserver says it.
    if (given && typeof answer.json.errcode === 'string') throw new MatrixError(401, answer.json.errcode, String(answer.json.error ?? t('The Matrix server refused the request.')));
    const session = typeof answer.json.session === 'string' ? answer.json.session : '';
    const done = new Set(Array.isArray(answer.json.completed) ? (answer.json.completed as unknown[]).filter((s): s is string => typeof s === 'string') : []);
    const flows = (answer.json.flows as Json[])
      .map((flow) => (Array.isArray(flow?.stages) ? (flow.stages as unknown[]).filter((s): s is string => typeof s === 'string') : []))
      .filter((stages) => stages.length && stages.every((stage) => HERE.includes(stage) || ON_ITS_PAGE.includes(stage)));
    // The flow with the fewest steps on the homeserver's page, as fewer steps leave Erevos.
    const flow = flows.sort((a, b) => a.filter((s) => ON_ITS_PAGE.includes(s)).length - b.filter((s) => ON_ITS_PAGE.includes(s)).length)[0];
    if (!flow) throw new Error(t('This Matrix server asks for something Erevos cannot give it here, such as an e-mail address. Do it on its website, then sign in here.'));
    const stage = flow.find((s) => !done.has(s));
    // Every step taken, yet still asked: the last answer was not taken.
    if (!stage) throw new MatrixError(401, 'M_FORBIDDEN', String(answer.json.error ?? t('The Matrix server refused the request.')));
    if (stage === 'm.login.dummy') {
      given = { type: stage, session };
      continue;
    }
    const params = (answer.json.params as Record<string, Json> | undefined)?.[stage];
    return {
      ask: {
        stage,
        session,
        ...(stage === 'm.login.terms' ? { terms: termsOf(params) } : {}),
        ...(ON_ITS_PAGE.includes(stage) ? { fallback: `${homeserver}/_matrix/client/v3/auth/${enc(stage)}/fallback/web?session=${enc(session)}` } : {}),
      },
    };
  }
  throw new Error(t('The Matrix server refused the request.'));
}

/** The answer to an ask: for its stage, with what was given (a token, a password), or only the session once its page was done. */
export function authFor(ask: AuthAsk, given: { token?: string; password?: string; userId?: string } = {}): Json {
  switch (ask.stage) {
    case 'm.login.terms':
      return { type: ask.stage, session: ask.session };
    case 'm.login.registration_token':
      return { type: ask.stage, token: given.token ?? '', session: ask.session };
    case 'm.login.password':
      return { type: ask.stage, identifier: { type: 'm.id.user', user: given.userId ?? '' }, password: given.password ?? '', session: ask.session };
    default:
      return { session: ask.session };
  }
}

/** Whether a name is one a Matrix account may have: small letters, digits and ._=-/+ only. */
export function isAccountName(name: string): boolean {
  return /^[a-z0-9._=\-/+]{1,64}$/.test(name);
}

/** Whether the homeserver takes this name for a new account: false when it is someone's already. */
export async function nameFree(homeserver: string, name: string, tor?: MatrixTor): Promise<boolean> {
  const answer = await callAnswer({ homeserver, tor }, 'GET', `/register/available?username=${enc(name)}`);
  if (answer.status === 200) return answer.json.available === true;
  if (answer.json.errcode === 'M_USER_IN_USE') return false;
  answeredJson(answer);
  return true;
}

/**
 * Makes an account `name` with `password` on `homeserver`, as a new device named Erevos with its
 * keys and cross-signing keys, as signing in does; or answers what the homeserver asks for first.
 * A homeserver that makes accounts only on its own website says so.
 */
export async function register(homeserver: string, name: string, password: string, auth?: Json, tor?: MatrixTor): Promise<{ state: MatrixState } | { ask: AuthAsk }> {
  if (!isAccountName(name)) throw new Error(t('A Matrix name has only small letters, digits and . _ = - / +'));
  if (password.length < 8) throw new Error(t('Choose a password of at least 8 characters.'));
  const asked = (given?: Json) => callAnswer({ homeserver, tor }, 'POST', '/register?kind=user', { username: name, password, initial_device_display_name: editionName(), ...(given ? { auth: given } : {}) });
  let done: { json: Json } | { ask: AuthAsk };
  try {
    done = await interactive(homeserver, asked, auth);
  } catch (error) {
    if (error instanceof MatrixError && error.code === 'M_USER_IN_USE') throw new Error(t('That name is someone’s already on this server.'));
    if (error instanceof MatrixError && ((error.code === 'M_FORBIDDEN' && error.status === 403) || error.code === 'M_UNRECOGNIZED' || error.status === 404)) {
      throw new Error(t('This Matrix server makes no accounts here. Make one on its website, then sign in here.'));
    }
    throw error;
  }
  if ('ask' in done) return done;
  if (typeof done.json.access_token !== 'string') throw new Error(t('The account was made, but the server did not sign it in. Sign in with it here.'));
  const state = await newDevice(homeserver, done.json, { type: 'm.login.password', identifier: { type: 'm.id.user', user: name }, password }, tor);
  return { state };
}

/** One of the account's devices, as the homeserver lists it. */
export type AccountDevice = { id: string; name: string; lastSeen?: number; ours: boolean };

/** The account's devices: this one first, then the most recently seen. */
export async function listDevices(state: MatrixState): Promise<AccountDevice[]> {
  const answer = await call(state, 'GET', '/devices');
  const devices: AccountDevice[] = [];
  for (const device of (answer.devices as Json[] | undefined) ?? []) {
    if (typeof device?.device_id !== 'string') continue;
    const seen = typeof device.last_seen_ts === 'number' && device.last_seen_ts > 0 ? device.last_seen_ts : undefined;
    devices.push({
      id: device.device_id,
      name: typeof device.display_name === 'string' && device.display_name.trim() ? device.display_name.trim().slice(0, 100) : device.device_id,
      ...(seen ? { lastSeen: seen } : {}),
      ours: device.device_id === state.deviceId,
    });
  }
  return devices.sort((a, b) => Number(b.ours) - Number(a.ours) || (b.lastSeen ?? 0) - (a.lastSeen ?? 0)).slice(0, 200);
}

/** Gives a device of the account a new name, which the others in its rooms may see. */
export async function renameDevice(state: MatrixState, deviceId: string, name: string): Promise<void> {
  const named = name.trim().slice(0, 100);
  if (!named) throw new Error(t('Give it a name.'));
  await call(state, 'PUT', `/devices/${enc(deviceId)}`, { display_name: named });
}

/**
 * Signs other devices of the account out (/delete_devices): their keys go, and they can no longer
 * read what comes. This one is not among them: signing out does that. The homeserver asks for the
 * password first, or a step on its page.
 */
export async function signOutDevices(state: MatrixState, ids: string[], auth?: Json): Promise<{ done: true } | { ask: AuthAsk }> {
  const others = [...new Set(ids)].filter((id) => id && id !== state.deviceId).slice(0, 100);
  if (!others.length) return { done: true };
  const done = await interactive(state.homeserver, (given) => callAnswer(state, 'POST', '/delete_devices', { devices: others, ...(given ? { auth: given } : {}) }), auth);
  if ('ask' in done) return done;
  for (const id of others) delete state.devices[state.userId]?.[id];
  return { done: true };
}

/**
 * A one-use login token for a new device of the account (spec 1.7, m.login.token), for a device of
 * this phone's own (lib/linked-accounts.ts), so it signs in with no password: only when the
 * homeserver gives one without asking for the password again, as few do. Null otherwise.
 */
export async function loginToken(state: MatrixServer): Promise<string | null> {
  try {
    const answer = await request(state, { method: 'POST', url: `${state.homeserver}/_matrix/client/v1/login/get_token`, body: {} });
    const token = answer.json.login_token;
    return typeof token === 'string' && token.length > 0 && token.length <= 1024 && !/\s/.test(token) ? token : null;
  } catch {
    return null;
  }
}
