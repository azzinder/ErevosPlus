// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A server of one's own, for a phone with no relay yet (New chat, I have a server of my own,
// components/own-server.tsx): the address as someone types it who was told "relay.example.org" and
// a code, with no need to know what wss:// is. Its address and code are the relay's address and
// token, as under For advanced users: this is the same setting, asked in plain words.
// Self-contained on purpose (but for lib/relay-host.ts), so it can run under plain Node for checks.

import { hostOf, isLoopback, isPrivate } from './relay-host';

/**
 * The relay address someone typed for a server of their own: `wss://` and the host when no scheme
 * was typed, an https:// address taken as its wss://, and http:// as ws://. Without TLS (ws://)
 * only on a private network or this computer, where a relay at home is: anywhere else the address
 * and the code would cross the internet in the open. Null for anything else.
 */
export function ownServerAddress(typed: string): string | null {
  let text = typed.trim();
  if (!text || /\s/.test(text)) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) text = `wss://${text}`;
  text = text.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://').replace(/^wss?:\/\//i, (scheme) => scheme.toLowerCase());
  text = text.replace(/^(wss?:\/\/.+?)\/+$/, '$1');
  if (!/^wss?:\/\/[^\s/?#@]+(\/[^\s?#]*)?$/.test(text)) return null;
  const host = hostOf(text);
  if (!host) return null;
  if (text.startsWith('ws://') && !isLoopback(host) && !isPrivate(host)) return null;
  return text;
}
