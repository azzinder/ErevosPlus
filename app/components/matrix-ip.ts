// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { t } from '../lib/i18n';
import { matrixActingThroughTor, matrixSetTor } from '../lib/matrix-store';
import { actingWhere } from '../lib/network-place';
import { hiddenKeep, ipGate } from './ip-warning';

/**
 * Before the account on the screen joins `address` (a room's #alias:server or !id:server) without
 * Tor: said once for its server (lib/ip-warning.ts), with Always through Tor for the account as the
 * way not to show the address. True to go on.
 */
export async function matrixJoinGate(address: string): Promise<boolean> {
  if (matrixActingThroughTor()) return true;
  const at = address.indexOf(':');
  const server = (at < 0 ? address : address.slice(at + 1)).trim().toLowerCase().slice(0, 120);
  // A hidden place's account keeps its warnings with its hidden chats, never in the space's data.
  const keep = actingWhere() !== 'space' ? { keep: hiddenKeep() } : {};
  return ipGate({ network: 'Matrix', act: 'join', of: `join:${server}`, ...keep }, { label: t('Always through Tor'), run: () => matrixSetTor('always') });
}
