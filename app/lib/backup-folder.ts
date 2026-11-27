// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { earlierParts, hardBackupKey, isBackupPassword, makeBackup, newBackupHard, unneededFiles, type BackupKey, type MakeOptions, type PartMade } from '../lock/backup';

import { cloudFiles, loadCloudBackup, saveCloudBackup, sendToCloud, type CloudBackup } from './backup-cloud';
import { phoneCallsForBackup } from './backup-calls';
import { drivePlace, folderPlace, loadLedger, saveLedger, serverPlace, type Book, type Ledger } from './backup-ledger';
import { phoneSettingsForBackup } from './backup-native';
import { AUTO_SAMPLE, checkBackup, checkedWhole, checkListed, checkNewestSent, checkProblem, checkServer, HAND_SAMPLE, loadChecks, newestIn, saveCheck, type Checked, type CheckProgress, type Checks } from './backup-check';
import { backupFilesIn, deleteBackupFiles, listBackupFiles, writeBackup } from './backup-place';
import { phoneSmsForBackup } from './backup-sms';
import { driveFiles, loadDriveBackup, saveDriveBackup, sendToDrive, type DriveBackup } from './google-drive';
import { t } from './i18n';
import { panicFolderChanged } from './panic';
import { fromBase64, isHardCost, toBase64, type HardCost } from './crypto';
import { secureDelete, secureGet, secureSet } from './secure';
import { openCollectionSkips } from '../lock/collection-data';

export { backupFilesIn, CAN_AUTO_BACKUP, CAN_BACK_UP, CAN_CLOUD_BACKUP, CAN_CLOUD_RESTORE, CLOUD_NEEDS_CORS, folderLabel, partsIn, pickFolder, pickParts, PICKS_PART_FILES, writeBackup, type PartSource, type Written } from './backup-place';

// Backups (lock/backup.ts) written to a folder the owner picks (lib/backup-place.ts): on the
// phone with Android's folder picker, on a computer in the desktop app.
//
// Automatic backups are made while a space is open, once the last one is older than the time
// chosen (every 6 hours, day or week): a while after the space opens, then whenever Erevos looks
// again, every CHECK_MS (app/_layout.tsx), and as it goes to the background, before it locks. Never
// by a task in the background with no space open: only an open space knows which Collections stay
// out of backups (lock/collection-data.ts). They go into the folder chosen, which keeps the KEEP
// newest, with every part one of them names (lock/backup.ts): each names again the parts of the
// ones before that it can, those lib/backup-ledger.ts says they named and the folder still lists,
// and writes new ones only for the rest, so one made often costs little. Their
// settings are kept in the keystore entry AUTO, outside every space, with the key their password
// gives, so they need no password each time. Whichever space opens, the setting is the same, and
// the backups are of all of them. Settings from before Argon2id kept PBKDF2's key: the next
// automatic backup gives it Argon2id (lock/backup.ts), without the password, and keeps that key
// instead. When the owner gave a server (lib/backup-cloud.ts), each automatic backup goes there
// too, bare, on the phone and in the desktop app, naming again the parts there in the same way,
// and one the server missed goes the next time, even when the folder's is not due. When the owner
// signed in with Google on Android (lib/google-drive.ts), each goes to Google Drive too, in the
// same way. One that failed is tried again when a space opens, and by the looks between only after
// RETRY_MS. Where the folder's files cannot be listed (Sailfish OS), each backup there is whole, as
// before.
//
// Backups hold AUTO, with its key, but not its folder, which only this phone may write in: a
// backup restored on another phone leaves automatic backups on with no folder ('') until the
// owner chooses one there, and meanwhile only the server and Google Drive get them, when there are
// any. Automatic backups set to go only to Google Drive have no folder either.
//
// A server is the owner's apart from automatic backups: a backup made by hand can go there too,
// with a password of its own (app/backup.tsx), and turning automatic backups off leaves it set,
// with what is there. Each backup made by hand is checked as it is made, as automatic ones are
// (checkMadeBackup): read back from the folder, opened with its password, every file beside it
// there, and two of them read through. In a folder of another app's, such as DAVx5's, a check
// that does not find it whole looks again a few times over four minutes first (settled): that app
// may still be sending it to its server, and gives back what its server has meanwhile.

/** How automatic backups are made. `every` is days, a quarter of one for every 6 hours, 0 when
 *  off; `last` milliseconds, 0 if never. `hard` is Argon2id's salt and cost, null in settings from
 *  before it. */
export type AutoBackup = {
  every: number;
  folder: string;
  key: string;
  salt: string;
  iter: number;
  hard: (HardCost & { salt: string }) | null;
  last: number;
  error: string;
};

const hardOf = (value: unknown): AutoBackup['hard'] =>
  !!value && typeof (value as { salt?: unknown }).salt === 'string' && isHardCost(value as Partial<HardCost>)
    ? (value as NonNullable<AutoBackup['hard']>)
    : null;

const AUTO = 'erevos.backup-auto';
const DAY = 24 * 3600 * 1000;
export const KEEP = 3;

/** How often Erevos looks, while a space is open, whether an automatic backup is due. */
export const CHECK_MS = 15 * 60 * 1000;

// How long those looks wait to try again after a run that failed.
const RETRY_MS = 60 * 60 * 1000;

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

export async function loadAutoBackup(): Promise<AutoBackup | null> {
  try {
    const value = JSON.parse((await secureGet(AUTO)) ?? 'null') as Partial<AutoBackup> | null;
    if (!value || typeof value.folder !== 'string' || typeof value.key !== 'string' || typeof value.salt !== 'string') return null;
    return {
      every: typeof value.every === 'number' ? value.every : 0,
      folder: value.folder,
      key: value.key,
      salt: value.salt,
      iter: typeof value.iter === 'number' ? value.iter : 0,
      hard: hardOf(value.hard),
      last: typeof value.last === 'number' ? value.last : 0,
      error: typeof value.error === 'string' ? value.error : '',
    };
  } catch {
    return null;
  }
}

/**
 * Turns automatic backups on, every `every` days into the folder at `folder` (its uri), with the
 * key of their password. Setting them again, with a new password, starts them anew.
 */
export async function startAutoBackup(every: number, folder: string, { key, salt, iter, hard }: BackupKey): Promise<AutoBackup> {
  const auto: AutoBackup = {
    every,
    folder,
    key: toBase64(key),
    salt: toBase64(salt),
    iter,
    hard: hard && { salt: toBase64(hard.salt), m: hard.m, t: hard.t },
    last: 0,
    error: '',
  };
  await secureSet(AUTO, JSON.stringify(auto));
  panicFolderChanged(folder);
  return auto;
}

export async function changeAutoBackup(patch: Partial<Pick<AutoBackup, 'every' | 'folder'>>): Promise<AutoBackup | null> {
  const auto = await loadAutoBackup();
  if (!auto) return null;
  const next = { ...auto, ...patch, error: '' };
  await secureSet(AUTO, JSON.stringify(next));
  if (patch.folder !== undefined && patch.folder !== auto.folder) await saveCheck('folder', null);
  panicFolderChanged(next.folder);
  return next;
}

/** Stops automatic backups. The server stays, for backups sent by hand, with those already there;
 *  Google Drive stays signed in, to send to again once they are on, and to restore from. */
export async function stopAutoBackup(): Promise<void> {
  await secureDelete(AUTO);
  await saveCheck('folder', null);
  await saveCheck('server', null);
  await saveCheck('drive', null);
  panicFolderChanged('');
}

/** Automatic backups' settings, the server's and Google Drive's, as they are after a run. */
export type AutoRun = { auto: AutoBackup | null; cloud: CloudBackup | null; drive: DriveBackup | null };

let running: Promise<AutoRun> | null = null;

// When the last run that failed ended, 0 after one that did not: the looks between wait RETRY_MS after it.
let failedAt = 0;

// The waits before the check right after a backup into another app's folder (folderOfAnotherApp)
// looks again, while it does not find the backup whole: such an app, as DAVx5's WebDAV folders,
// takes each file at once and sends it to its server after, and until then gives back an empty or
// short file (#75). Four minutes in all; after that, the backup's screen offers Check again.
const SETTLE_MS: readonly number[] = [15_000, 30_000, 45_000, 60_000, 90_000];
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
let settleWaits = SETTLE_MS;
let settlePause = sleep;

/** For the checks: the waits before each look again, and how one is waited; null for the usual. */
export function setSettleWaits(waits: readonly number[] | null, pause: (ms: number) => Promise<void> = sleep): void {
  settleWaits = waits ?? SETTLE_MS;
  settlePause = pause;
}

// Android's own storage: the phone's memory and its cards, and Downloads.
const OWN_STORAGE = new Set(['com.android.externalstorage.documents', 'com.android.providers.downloads.documents']);

/** Whether `folder` is kept by another app than Android's own storage, as one of DAVx5's, of a
 *  cloud app's or of a drive's that Android's picker showed: what is written there may reach that
 *  app's server only a while after, and read back short until then. */
export function folderOfAnotherApp(folder: string): boolean {
  const authority = /^content:\/\/([^/]+)\//i.exec(folder)?.[1]?.toLowerCase();
  return !!authority && !OWN_STORAGE.has(authority);
}

// What `check` finds, looked at again after each of settleWaits while it is not whole, where the
// folder is another app's; `waiting` is told each wait, before it. Each look's time is `now` and
// the waits since.
async function settled(folder: string, check: (at: number) => Promise<Checked | null>, now: number, waiting?: (ms: number) => void): Promise<Checked | null> {
  let at = now;
  let checked = await check(at);
  if (!folderOfAnotherApp(folder)) return checked;
  for (const ms of settleWaits) {
    if (!checked || checkedWhole(checked)) break;
    waiting?.(ms);
    await settlePause(ms);
    at += ms;
    checked = await check(at);
  }
  return checked;
}

// An automatic backup into its folder: it names again the parts of the backups there that it can,
// whose names and sizes the folder still lists, and the folder then keeps the KEEP newest backups
// and every part one of them names. `book` is what the ledger says of that folder, and is told of
// what this one named and what went. Where the folder's files cannot be listed, it is whole, and
// the folder keeps the newest by their names (lock/backup.ts staleBackups).
async function intoFolder(folder: string, key: BackupKey, options: Omit<MakeOptions, 'parts'>, now: number, book: Book): Promise<void> {
  const there = await listBackupFiles(folder);
  if (!there) {
    await writeBackup(folder, (parts) => makeBackup(key, { ...options, parts }), now, KEEP);
    return;
  }
  // The backups there this phone made, the newest first: their names sort by when they were made.
  const backups = [...there.keys()].filter((name) => book.has(name)).sort().reverse();
  const earlier = earlierParts(
    backups.map((name) => book.get(name)!),
    (part) => there.has(part.name) && (there.get(part.name) === -1 || there.get(part.name) === part.size),
  );
  let made: PartMade[] = [];
  const written = await writeBackup(folder, (parts) => makeBackup(key, { ...options, parts, earlier, made: (named) => (made = named) }), now, 0);
  book.set(written.name, made);
  const after = (await listBackupFiles(folder)) ?? there;
  const gone = new Set(unneededFiles([...after.keys()], KEEP, (name) => book.get(name)?.map((part) => part.name) ?? null));
  await deleteBackupFiles(folder, [...gone]);
  // The book keeps the backups still there.
  for (const name of [...book.keys()]) if (!after.has(name) || gone.has(name)) book.delete(name);
}

// A place's book in the ledger, made if it has none yet.
function bookOf(ledger: Ledger, place: string): Book {
  const book = ledger.get(place) ?? new Map();
  ledger.set(place, book);
  return book;
}

/**
 * Makes an automatic backup if one is due (or `now` anyway, with `force`), and sends one to the
 * server and to Google Drive if they have not the newest. Returns the settings as they are after
 * it; a backup that failed says why in `error`, and is tried again next time. With `checking`, as
 * when Erevos looks now and then whether one is due, one that failed is tried again only after
 * RETRY_MS. With `serverOnly`, one goes to the server now, and none into the folder or to Google
 * Drive (Make a backup → To a server).
 */
export function runAutoBackup(force = false, now = Date.now(), { checking = false, serverOnly = false }: { checking?: boolean; serverOnly?: boolean } = {}): Promise<AutoRun> {
  running ??= (async () => {
    let auto = await loadAutoBackup();
    let cloud = await loadCloudBackup();
    let drive = await loadDriveBackup();
    if (!auto || !auto.every) return { auto, cloud, drive };
    if (checking && failedAt && now - failedAt < RETRY_MS) return { auto, cloud, drive };
    const every = auto.every * DAY;
    const due = !serverOnly && !!auto.folder && (force || now - auto.last >= every);
    // Without a folder, the server's and Google Drive's go by themselves, as often.
    const cloudDue = !!cloud && (serverOnly || due || cloud.last < auto.last || (!auto.folder && (force || now - cloud.last >= every)));
    const driveDue = !!drive && !serverOnly && (due || drive.last < auto.last || (!auto.folder && (force || now - drive.last >= every)));
    if (!due && !cloudDue && !driveDue) return { auto, cloud, drive };
    try {
      let hard = auto.hard;
      if (!hard) {
        const fresh = newBackupHard();
        hard = { salt: toBase64(fresh.salt), m: fresh.m, t: fresh.t };
        auto = { ...auto, key: toBase64(await hardBackupKey(fromBase64(auto.key), fresh)), hard };
        await secureSet(AUTO, JSON.stringify(auto));
      }
      // With the phone's SMS and calls, when the owner wants them (lib/backup-sms.ts,
      // lib/backup-calls.ts), and the phone module's settings.
      const phoneSms = await phoneSmsForBackup();
      const phoneCalls = await phoneCallsForBackup();
      const native = await phoneSettingsForBackup();
      // Erevos+: Session's account, kept sealed for it now where the first space is open (lib/backup-networks.ts).
      // Loaded here, not with this file: what it brings needs the app around it.
      await (await import('./backup-networks')).keepNetworksForBackup(now);
      // Without the open space's Collection when its owner keeps it out of backups.
      const skip = await openCollectionSkips();
      const key = { key: fromBase64(auto.key), salt: fromBase64(auto.salt), iter: auto.iter, hard: { ...hard, salt: fromBase64(hard.salt) } };
      // What the backups made before named, in the places they go to now: only those are kept.
      const ledger = await loadLedger(key.key);
      const places = new Set([...(auto.folder ? [folderPlace(auto.folder)] : []), ...(cloud ? [serverPlace(cloud.url)] : []), ...(drive ? [drivePlace(drive.folder)] : [])]);
      for (const place of [...ledger.keys()]) if (!places.has(place)) ledger.delete(place);
      if (due) {
        try {
          const book = bookOf(ledger, folderPlace(auto.folder));
          await intoFolder(auto.folder, key, { phoneSms, phoneCalls, native, skip }, now, book);
          // One the check after it does not find whole counts as failed: it says why, and the
          // next comes as after a failed one, making again what is missing. Into another app's
          // folder, only once that app had time to send it on (settled).
          const folder = auto.folder;
          const checked = await settled(folder, (at) => checkFolder(folder, key, book, AUTO_SAMPLE, at), now);
          const problem = checked ? checkProblem(checked) : '';
          auto = problem ? { ...auto, error: problem } : { ...auto, last: now, error: '' };
        } catch (error) {
          auto = { ...auto, error: errorText(error) };
        }
        await secureSet(AUTO, JSON.stringify(auto));
      }
      if (cloud && cloudDue) {
        const book = bookOf(ledger, serverPlace(cloud.url));
        const before = cloud.last;
        // The backup's own size, which the server is to list too.
        let size: number | undefined;
        cloud = await sendToCloud(
          cloud,
          async (parts, reuse) => {
            const bytes = await makeBackup(key, { parts, phoneSms, phoneCalls, native, bare: true, skip, ...reuse });
            size = bytes.length;
            return bytes;
          },
          KEEP,
          now,
          book,
        );
        const sent = cloud.names[cloud.names.length - 1];
        if (!cloud.error && sent) {
          // What the server lists of it: nothing is downloaded after each one.
          let checked: Checked;
          try {
            checked = checkListed((await cloudFiles(cloud)).sizes, sent, book.get(sent) ?? [], now, size);
          } catch (error) {
            checked = { at: now, parts: 0, read: 0, missing: 0, damaged: 0, opened: false, error: errorText(error) };
          }
          await saveCheck('server', checked);
          // Not whole there: failed, as one that did not go, and sent again next time.
          const problem = checkProblem(checked);
          if (problem) {
            cloud = { ...cloud, last: before, error: problem };
            await saveCloudBackup(cloud);
          }
        }
      }
      if (drive && driveDue) {
        // Google Drive as the server, and checked after it the same way.
        const was = drive.folder;
        const book = bookOf(ledger, drivePlace(was));
        const before = drive.last;
        let size: number | undefined;
        drive = await sendToDrive(
          drive,
          async (parts, reuse) => {
            const bytes = await makeBackup(key, { parts, phoneSms, phoneCalls, native, bare: true, skip, ...reuse });
            size = bytes.length;
            return bytes;
          },
          KEEP,
          now,
          book,
        );
        // A folder made there anew, as when the one before was deleted: the book goes with it.
        if (drive.folder !== was) {
          ledger.delete(drivePlace(was));
          ledger.set(drivePlace(drive.folder), book);
        }
        const sent = drive.names[drive.names.length - 1];
        if (!drive.error && sent) {
          let checked: Checked;
          try {
            checked = checkListed((await driveFiles(drive)).sizes, sent, book.get(sent) ?? [], now, size);
          } catch (error) {
            checked = { at: now, parts: 0, read: 0, missing: 0, damaged: 0, opened: false, error: errorText(error) };
          }
          await saveCheck('drive', checked);
          const problem = checkProblem(checked);
          if (problem) {
            drive = { ...drive, last: before, error: problem };
            await saveDriveBackup(drive);
          }
        }
      }
      await saveLedger(key.key, ledger);
    } catch (error) {
      auto = { ...auto, error: errorText(error) };
      await secureSet(AUTO, JSON.stringify(auto));
    }
    failedAt = auto.error || cloud?.error || drive?.error ? now : 0;
    return { auto, cloud, drive };
  })().finally(() => {
    running = null;
  });
  return running;
}

// Checks the newest backup in the folder (lib/backup-check.ts), reading `sample` of its parts
// whole, and keeps what it found. A check that fails says so there, not as the backup's error.
async function checkFolder(folder: string, key: BackupKey, book: Book | undefined, sample: number | 'all', now: number, how: CheckProgress = {}): Promise<Checked | null> {
  try {
    // Where the folder's files cannot be listed (Sailfish OS, a browser), nothing is checked.
    const files = await backupFilesIn(folder);
    if (!files) return null;
    const name = newestIn(files.sizes.keys(), book);
    const checked = name ? await checkBackup(files, name, key, sample, now, Math.random, how) : { at: now, parts: 0, read: 0, missing: 0, damaged: 0, opened: false, error: t('There is no backup there.') };
    await saveCheck('folder', checked);
    return checked;
  } catch (error) {
    const checked = { at: now, parts: 0, read: 0, missing: 0, damaged: 0, opened: false, error: errorText(error) };
    await saveCheck('folder', checked);
    return checked;
  }
}

/**
 * Checks now the newest automatic backup in the folder, on the server and in Google Drive
 * (lib/backup-check.ts): each read back and opened with their key, every part there, of its size,
 * and HAND_SAMPLE of them read whole. The server's and Google Drive's backup and those parts are
 * downloaded. Returns what was found.
 */
export async function checkBackupsNow(now = Date.now()): Promise<Checks> {
  if (running) await running.catch(() => undefined);
  const auto = await loadAutoBackup();
  const cloud = await loadCloudBackup();
  const drive = await loadDriveBackup();
  if (auto?.hard) {
    const key = { key: fromBase64(auto.key), salt: fromBase64(auto.salt), iter: auto.iter, hard: { ...auto.hard, salt: fromBase64(auto.hard.salt) } };
    const ledger = await loadLedger(key.key);
    if (auto.folder) await checkFolder(auto.folder, key, ledger.get(folderPlace(auto.folder)), HAND_SAMPLE, now);
    if (cloud) {
      const checked = await checkServer(cloud, key, HAND_SAMPLE, now);
      if (checked) await saveCheck('server', checked);
    }
    if (drive) {
      const checked = await checkNewestSent(drive.names, () => driveFiles(drive), key, HAND_SAMPLE, now);
      if (checked) await saveCheck('drive', checked);
    }
  }
  return loadChecks();
}

/**
 * Checks every part of the newest automatic backup in the folder, each by its SHA-256, read through
 * on the phone (lib/backup-check.ts): told how many are done, and stopped when `how` says so.
 * Returns what was found.
 */
export async function checkFolderFully(how: CheckProgress = {}, now = Date.now()): Promise<Checks> {
  if (running) await running.catch(() => undefined);
  const auto = await loadAutoBackup();
  if (auto?.hard && auto.folder) {
    const key = { key: fromBase64(auto.key), salt: fromBase64(auto.salt), iter: auto.iter, hard: { ...auto.hard, salt: fromBase64(auto.hard.salt) } };
    const ledger = await loadLedger(key.key);
    await checkFolder(auto.folder, key, ledger.get(folderPlace(auto.folder)), 'all', now, how);
  }
  return loadChecks();
}

/**
 * Checks a backup just made by hand into `folder`, named `name`, as an automatic one is after it
 * (lib/backup-check.ts): read back and opened with `key`, every file beside it there, of its size,
 * and AUTO_SAMPLE of them read through and opened. Null where the folder's files cannot be listed
 * (Sailfish OS, a browser). What it finds is the caller's to say: it is kept nowhere. In another
 * app's folder, looked at again a few times while not whole (settled), `waiting` told each wait;
 * with `once`, as Check again asks, looked at once.
 */
export async function checkMadeBackup(
  folder: string,
  name: string,
  key: Pick<BackupKey, 'key' | 'salt'>,
  now = Date.now(),
  { waiting, once = false }: { waiting?: (ms: number) => void; once?: boolean } = {},
): Promise<Checked | null> {
  const check = (at: number) => checkMadeOnce(folder, name, key, at);
  return once ? check(now) : settled(folder, check, now, waiting);
}

async function checkMadeOnce(folder: string, name: string, key: Pick<BackupKey, 'key' | 'salt'>, now: number): Promise<Checked | null> {
  try {
    const files = await backupFilesIn(folder);
    if (!files) return null;
    return await checkBackup(files, name, key, AUTO_SAMPLE, now);
  } catch (error) {
    return { at: now, parts: 0, read: 0, missing: 0, damaged: 0, opened: false, error: errorText(error) };
  }
}

/**
 * Checks a backup just sent to the server by hand, as an automatic one is after it: the server
 * lists it, of `size`, and every part it named (`made`), of their sizes. Nothing is downloaded.
 * Null when it did not go.
 */
export async function checkSentBackup(cloud: CloudBackup, made: readonly PartMade[], size: number, now = Date.now()): Promise<Checked | null> {
  const sent = cloud.names[cloud.names.length - 1];
  if (cloud.error || !sent) return null;
  try {
    return checkListed((await cloudFiles(cloud)).sizes, sent, made, now, size);
  } catch (error) {
    return { at: now, parts: made.length, read: 0, missing: 0, damaged: 0, opened: false, error: errorText(error) };
  }
}

/** Makes an automatic backup if one is due, as Erevos looks now and then while a space is open. */
export function checkAutoBackup(): Promise<AutoRun> {
  return runAutoBackup(false, Date.now(), { checking: true });
}

/**
 * Whether `password` is automatic backups' own: the key it gives, with their salt and cost, is
 * the one kept. Null when there are no automatic backups to compare with.
 */
export async function isAutoBackupPassword(password: string): Promise<boolean | null> {
  const auto = await loadAutoBackup();
  if (!auto) return null;
  const hard = auto.hard && { salt: fromBase64(auto.hard.salt), m: auto.hard.m, t: auto.hard.t };
  return isBackupPassword(password, { key: fromBase64(auto.key), salt: fromBase64(auto.salt), iter: auto.iter, hard });
}
