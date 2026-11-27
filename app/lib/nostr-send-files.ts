// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { randomBytes, toHex } from './crypto';
import { BLOB_CHUNK, FileTooLargeError, NOSTR_PHOTO_MOST, room, sealBlob, sealChunk, type FileOffer, type Source } from './attachments';
import { NOSTR_PIECE, type FileMeta } from '../lock/attachment-files';
import { t } from './i18n';
import { nostrOwnTor, publishNostr } from './nostr';
import { RelayUnreachableError } from './relay';
import { pieceId, wrapPiece } from './nostr-pieces';
import { FILE_SERVERS, NOSTR_FILE_MOST, uploadBlob } from './nostr-files';
import { signedOnce } from './nostr-dm';

// Photos and files to a contact who reads on Nostr, with no relay to hold them (lib/nostr-chats.ts
// nostrOnlyWay). A photo goes in pieces: each sealed with the file's own key, in a wrap of its own,
// sent to the contact's Nostr relays before the message that offers it (lib/nostr-pieces.ts). A
// larger photo, a video or any file goes to a file server (Blossom, lib/nostr-files.ts) as one
// encrypted blob, put there with a key made for that upload alone, through Tor as the space's Tor
// way says, or always by Nostr's own Tor switch (lib/nostr.ts nostrOwnTor) and for a chat that goes
// only through Tor (`torChat`); only where it is and its key go in the message. The relays and the server see
// encrypted bytes and, of the server, the blob's size.

type Progress = (done: number, count: number) => void;

/** Files go to a file server up to this size: what the servers take for free. */
export const NOSTR_FILE_LIMIT = NOSTR_FILE_MOST;

/** The file is too large for a way with no relay. */
export class NostrFileTooLargeError extends FileTooLargeError {
  constructor() {
    super();
    this.message = t('With no server, files can be {size} MB at most.', { size: String(NOSTR_FILE_LIMIT / (1000 * 1000)) });
  }
}

/** Whether a file of this kind and size goes in pieces, not to a file server. */
export const goesInPieces = (meta: Pick<FileMeta, 'kind'>, size: number): boolean => meta.kind === 'photo' && size <= NOSTR_PHOTO_MOST;

/**
 * Puts a file where a contact who reads on Nostr (`to`) takes it, and answers the offer for them.
 * A photo goes in pieces, which are sent now, to their Nostr relays; anything else to a file
 * server. Throws when no Nostr relay took a piece, or no file server took the blob.
 */
export async function offerOnNostr(source: Source, meta: Omit<FileMeta, 'size'>, to: { k: string; r: string[] }, progress?: Progress, torChat = false): Promise<FileOffer> {
  try {
    return await putOnNostr(source, meta, to, progress, torChat);
  } catch (error) {
    // Nothing could take it now: it can wait, and go later.
    if (error instanceof FileTooLargeError) throw error;
    throw new RelayUnreachableError(t('No Nostr server or file server took it: {reason}', { reason: error instanceof Error ? error.message : String(error) }));
  }
}

async function putOnNostr(source: Source, meta: Omit<FileMeta, 'size'>, to: { k: string; r: string[] }, progress: Progress | undefined, torChat: boolean): Promise<FileOffer> {
  const size = source.size;
  const shared = { name: meta.name, mime: meta.mime, kind: meta.kind, size, ...(meta.w !== undefined ? { w: meta.w } : {}), ...(meta.h !== undefined ? { h: meta.h } : {}), ...(meta.sticker ? { sticker: true as const } : meta.hidden && meta.kind === 'photo' ? { hidden: true as const, ...(meta.once ? { once: true as const } : {}) } : {}) };
  const key = randomBytes(32);
  if (goesInPieces(meta, size)) {
    const piece = room(NOSTR_PIECE);
    const count = Math.max(1, Math.ceil(size / piece));
    const ids: string[] = [];
    for (let n = 0; n < count; n++) {
      const at = n * piece;
      const sealed = sealChunk(key, n, await source.read(at, Math.min(piece, size - at)), NOSTR_PIECE);
      await publishNostr(to, wrapPiece(sealed), torChat);
      ids.push(pieceId(sealed));
      progress?.(n + 1, count);
    }
    return { ...shared, relay: 'nostr', ids: ids.join(''), key: toHex(key), chunk: NOSTR_PIECE, via: 'nostr' };
  }
  if (size > NOSTR_FILE_LIMIT) throw new NostrFileTooLargeError();
  const { blob, x } = sealBlob(key, await source.read(0, size));
  const url = await uploadBlob(FILE_SERVERS, blob, (kind, tags, content) => signedOnce(kind, tags, content), Date.now(), torChat || nostrOwnTor());
  progress?.(1, 1);
  return { ...shared, relay: 'blossom', ids: x.slice(0, 48), key: toHex(key), chunk: BLOB_CHUNK, via: 'blossom', url, x };
}
