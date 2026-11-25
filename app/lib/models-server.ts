// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Where the speech and translation models are downloaded from (lib/speech.ts, lib/translate.ts):
// LPHL's web server (or the one the build names, lib/servers.ts) unless the owner names a web
// folder of their own that holds the same files under the same names. The core checks every model
// against the SHA-256 it knows before it opens it, so a folder can only give the same files or
// ones that are refused: what changes is who sees the phone's IP address as it downloads. Kept on
// this device, for every space, and in no backup: it says nothing of any chat.

import { secureDelete, secureGet, secureSet } from './secure';
import { WEB_ORIGIN } from './servers';

/** Where the models come from unless the owner names another folder. */
export const MODELS_DEFAULT = `${WEB_ORIGIN}/models/`;

const KEY = 'erevos.models-server';

/**
 * The web folder someone typed, as the address its files are under: https only (the models are
 * checked, but the download would still tell everyone on the way what is fetched), `https://` put
 * before a bare host, one slash at its end, no user name, question mark or #. Null for anything else.
 */
export function modelsFolder(typed: string): string | null {
  let text = typed.trim();
  if (!text || /\s/.test(text)) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) text = `https://${text}`;
  if (!/^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:[0-9]{1,5})?(\/[^\s?#@]*)?$/i.test(text)) return null;
  return `${text.replace(/\/+$/, '')}/`;
}

let at = MODELS_DEFAULT;
let read: Promise<string> | null = null;
const listeners = new Set<() => void>();

/** The folder the models are downloaded from now, as last read or set. */
export function modelsAt(): string {
  return at;
}

/** Its host, as the owner is told before downloading. */
export function modelsHost(): string {
  return new URL(at).host;
}

/** Whether the owner named a folder of their own. */
export function modelsOwn(): boolean {
  return at !== MODELS_DEFAULT;
}

/** Reads the folder the owner named, once: asked before every download, and by the sheets that say where from. */
export function loadModelsServer(): Promise<string> {
  read ??= secureGet(KEY).then(
    (kept) => {
      at = (kept && modelsFolder(kept)) || MODELS_DEFAULT;
      for (const listener of listeners) listener();
      return at;
    },
    () => at,
  );
  return read;
}

/** Names the folder the models come from, or, with null, goes back to the default. Models already here stay. */
export async function setModelsServer(folder: string | null): Promise<void> {
  const next = (folder && modelsFolder(folder)) || MODELS_DEFAULT;
  if (next === MODELS_DEFAULT) await secureDelete(KEY);
  else await secureSet(KEY, next);
  at = next;
  read = Promise.resolve(at);
  for (const listener of listeners) listener();
}

/** Told when the folder is read or changes. */
export function onModelsServer(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}
