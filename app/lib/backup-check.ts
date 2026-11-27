// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import {
  backupFileOf,
  checkPart,
  DamagedPartError,
  openBackupWithKey,
  WrongBackupPasswordError,
  type BackupKey,
  type PartMade,
  type PartReader,
} from "../lock/backup";
import { cloudFiles, type CloudBackup } from "./backup-cloud";
import type { Book } from "./backup-ledger";
import { t } from "./i18n";
import { secureGet, secureSet } from "./secure";

// Whether the newest automatic backup in each place it goes to is there whole, as a restore would
// need it (lib/backup-folder.ts, lib/backup-cloud.ts, lib/google-drive.ts).
//
// After each automatic backup, by itself: in the folder, the backup is read back and opened with
// automatic backups' key, every part it names is there, of its size, and a few of them, picked at
// random, are read whole and opened. On a server and in Google Drive only what costs no download:
// the backup and every part it named are listed there, of their sizes. Checked by hand, the backup
// there is downloaded and opened too, and a few of its parts, as in the folder. Every part read
// whole would be the whole backup again, many GB on a server: a few at random find a place that
// damages or cuts what it is given, and the sizes find one missing or cut short.
//
// What was found stays on the phone (CHECKED), in no backup: only the place, when, how many parts,
// and what was wrong.

/** What a check of the newest backup in one place found. `parts`: how many it names; `read`: how
 *  many of them were read whole; `missing` and `damaged`: how many are not there, or not as made;
 *  `opened`: whether the backup itself was read back and opened; `error`: why it could not be
 *  checked, or what is wrong with the backup itself, '' when nothing. */
export type Checked = {
  at: number;
  parts: number;
  read: number;
  missing: number;
  damaged: number;
  opened: boolean;
  error: string;
};

/** The last check of each place: the folder's, the server's, and Google Drive's. */
export type Checks = { folder: Checked | null; server: Checked | null; drive: Checked | null };

const CHECKED = "erevos.backup-checked";

/** How many parts a check reads whole: after each automatic backup, and when checked by hand. */
export const AUTO_SAMPLE = 2;
export const HAND_SAMPLE = 10;

/** Whether a check found the backup whole. */
export const checkedWhole = (checked: Checked): boolean =>
  !checked.error && checked.missing === 0 && checked.damaged === 0;

/** What a check that did not find the backup whole says, as an automatic backup that failed says
 *  why: the screen shows it, and the next one comes after an hour (lib/backup-folder.ts). '' when whole. */
export function checkProblem(checked: Checked): string {
  if (checkedWhole(checked)) return "";
  return checked.error
    ? t("The check after it found a problem: {error}", { error: checked.error })
    : t(
        "The check after it found {missing} of its {parts} parts missing and {damaged} damaged.",
        {
          missing: checked.missing,
          parts: checked.parts,
          damaged: checked.damaged,
        },
      );
}

function checkedOf(value: unknown): Checked | null {
  const v = value as Partial<Checked> | null;
  if (!v || typeof v !== "object") return null;
  const n = (x: unknown) =>
    typeof x === "number" && Number.isFinite(x) && x >= 0 ? x : 0;
  return {
    at: n(v.at),
    parts: n(v.parts),
    read: n(v.read),
    missing: n(v.missing),
    damaged: n(v.damaged),
    opened: v.opened === true,
    error: typeof v.error === "string" ? v.error : "",
  };
}

export async function loadChecks(): Promise<Checks> {
  try {
    const value = JSON.parse((await secureGet(CHECKED)) ?? "null") as Partial<
      Record<keyof Checks, unknown>
    > | null;
    return {
      folder: checkedOf(value?.folder),
      server: checkedOf(value?.server),
      drive: checkedOf(value?.drive),
    };
  } catch {
    return { folder: null, server: null, drive: null };
  }
}

/** Keeps what a check found in a place; null forgets it, as when backups no longer go there. */
export async function saveCheck(
  place: keyof Checks,
  checked: Checked | null,
): Promise<Checks> {
  const checks = { ...(await loadChecks()), [place]: checked };
  await secureSet(CHECKED, JSON.stringify(checks));
  return checks;
}

/** A place's backup files: their sizes (-1 where not said) and each one's bytes, read as asked. */
export type BackupFiles = {
  sizes: Map<string, number>;
  read: PartReader;
  /** Each file's size and SHA-256 (hex), read through where it is, without bringing it here: null
   *  for one that cannot be read. Where there is no such way, each part is read here instead. */
  sha?: (names: string[]) => Promise<({ size: number; sha: string } | null)[]>;
};

/** How a check goes: told how many parts are checked, of how many, and asked whether to stop. */
export type CheckProgress = {
  progress?: (done: number, all: number) => void;
  stopped?: () => boolean;
};

// How many parts' SHA-256 are asked for at once, between looks at Cancel and the progress.
const SHA_BATCH = 8;

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// Up to `count` of `items`, picked at random.
function pick<T>(items: T[], count: number, random: () => number): T[] {
  const left = [...items];
  const picked: T[] = [];
  while (picked.length < count && left.length)
    picked.push(left.splice(Math.floor(random() * left.length), 1)[0]);
  return picked;
}

/**
 * Checks the backup `name` among `files`: read back and opened with `key`, every part it names
 * there, of its size, and `sample` of them read whole and opened. With "all", every part there is
 * checked: by its SHA-256 where the backup says it and the place can tell it, else read and opened.
 */
export async function checkBackup(
  files: BackupFiles,
  name: string,
  key: Pick<BackupKey, "key" | "salt">,
  sample: number | "all",
  now = Date.now(),
  random: () => number = Math.random,
  { progress, stopped }: CheckProgress = {},
): Promise<Checked> {
  const checked: Checked = {
    at: now,
    parts: 0,
    read: 0,
    missing: 0,
    damaged: 0,
    opened: false,
    error: "",
  };
  let bytes: Uint8Array | null;
  try {
    bytes = files.sizes.has(name) ? await files.read(name) : null;
  } catch (error) {
    return { ...checked, error: errorText(error) };
  }
  if (!bytes)
    return { ...checked, error: t("The backup itself is not there.") };
  // Empty, as another app's folder gives a file back before that app sent it to its server (#75).
  if (bytes.length === 0)
    return { ...checked, error: t("The backup itself is still empty there.") };
  let parts;
  try {
    parts = (await openBackupWithKey(bytes, key)).parts;
  } catch (error) {
    return {
      ...checked,
      error:
        error instanceof WrongBackupPasswordError
          ? t(
              "It is not made with the automatic backups’ password, so it cannot be checked here.",
            )
          : t("The backup itself is damaged: {error}", {
              error: errorText(error),
            }),
    };
  }
  checked.opened = true;
  if (!parts) return checked;
  checked.parts = parts.names.length;
  const there: number[] = [];
  parts.names.forEach((part, n) => {
    const size = files.sizes.get(part);
    const record = parts.made?.[n];
    if (size === undefined) checked.missing++;
    else if (size >= 0 && record && size !== record.size) checked.damaged++;
    else there.push(n);
  });
  const chosen = sample === "all" ? there : pick(there, sample, random);
  let done = 0;
  const stop = () =>
    stopped?.()
      ? {
          ...checked,
          error: t("Stopped after {done} of {count} parts.", {
            done,
            count: chosen.length,
          }),
        }
      : null;
  progress?.(0, chosen.length);
  const sha = files.sha;
  const bySha =
    sample === "all" && sha ? chosen.filter((n) => parts.made?.[n]) : [];
  for (let i = 0; i < bySha.length; i += SHA_BATCH) {
    const stoppedHere = stop();
    if (stoppedHere) return stoppedHere;
    const batch = bySha.slice(i, i + SHA_BATCH);
    let sums;
    try {
      sums = await sha!(batch.map((n) => parts.names[n]));
    } catch (error) {
      return { ...checked, error: errorText(error) };
    }
    batch.forEach((n, j) => {
      const sum = sums[j];
      const record = parts.made![n];
      if (!sum) checked.missing++;
      else if (sum.size !== record.size || sum.sha !== record.sha)
        checked.damaged++;
      else checked.read++;
    });
    done += batch.length;
    progress?.(done, chosen.length);
  }
  const summed = new Set(bySha);
  for (const n of chosen.filter((n) => !summed.has(n))) {
    const stoppedHere = stop();
    if (stoppedHere) return stoppedHere;
    try {
      const part = await files.read(parts.names[n]);
      if (!part) checked.missing++;
      else {
        checkPart(parts, n, part);
        checked.read++;
      }
    } catch (error) {
      if (error instanceof DamagedPartError) checked.damaged++;
      else return { ...checked, error: errorText(error) };
    }
    progress?.(++done, chosen.length);
  }
  return checked;
}

/**
 * Checks, by what the server lists, that the backup `name` sent there and every part it named (as
 * the ledger says, `made`) are there, of their sizes: nothing is downloaded. With `size`, the
 * backup's own, which it is to be there too.
 */
export function checkListed(
  sizes: Map<string, number>,
  name: string,
  made: readonly PartMade[],
  now = Date.now(),
  size?: number,
): Checked {
  const checked: Checked = {
    at: now,
    parts: made.length,
    read: 0,
    missing: 0,
    damaged: 0,
    opened: false,
    error: "",
  };
  if (!sizes.has(name))
    return { ...checked, error: t("The backup itself is not there.") };
  const listed = sizes.get(name) ?? -1;
  if (size !== undefined && listed >= 0 && listed !== size)
    return { ...checked, error: t("The backup itself is there, but not of the size it was sent with.") };
  for (const part of made) {
    const size = sizes.get(part.name);
    if (size === undefined) checked.missing++;
    else if (size >= 0 && size !== part.size) checked.damaged++;
  }
  return checked;
}

/** The newest backup in a folder this phone's automatic backups made, as the ledger's book there
 *  says, else the newest there by its name; null when there is none. */
export function newestIn(
  names: Iterable<string>,
  book: Book | undefined,
): string | null {
  const backups = [...names]
    .filter((name) => backupFileOf(name)?.part === false)
    .sort();
  const made = backups.filter((name) => book?.has(name));
  return (made.length ? made : backups).pop() ?? null;
}

/** Checks the newest backup sent to the server, downloading it and `sample` of its parts. */
export function checkServer(
  cloud: CloudBackup,
  key: Pick<BackupKey, "key" | "salt">,
  sample: number,
  now = Date.now(),
): Promise<Checked | null> {
  return checkNewestSent(cloud.names, () => cloudFiles(cloud), key, sample, now);
}

/** Checks the newest of the backups `names` sent to a place, downloading it and `sample` of its
 *  parts from the place's `files`: a server's (checkServer), or Google Drive's. */
export async function checkNewestSent(
  names: readonly string[],
  files: () => Promise<BackupFiles>,
  key: Pick<BackupKey, "key" | "salt">,
  sample: number,
  now = Date.now(),
): Promise<Checked | null> {
  const name = names[names.length - 1];
  if (!name) return null;
  try {
    return await checkBackup(await files(), name, key, sample, now);
  } catch (error) {
    return {
      at: now,
      parts: 0,
      read: 0,
      missing: 0,
      damaged: 0,
      opened: false,
      error: errorText(error),
    };
  }
}
