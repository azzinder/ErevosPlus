// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A long link as it shows inside a message that is about to be sent (an invite, on Far away:
// components/welcome-invite.tsx): where it goes, and the two ends of what it carries, with the
// middle left out. A whole invite is some two hundred letters of keys, which say nothing to
// whoever reads the page and push everything else off it. What is sent, copied or drawn as a QR
// code is always the whole link: this is only how it reads on the screen, so it is never shown
// where it can be selected or copied. Self-contained on purpose, so it runs under plain Node for
// checks.

/** How many letters of what the link carries show at each end. */
const ENDS = 4;
/** A link with no # or ? shows this much of its start. */
const START = 24;

/**
 * `link` as it reads on the screen: without https://, whole up to its # or ?, then the first and
 * the last letters of what follows. One short enough to read is left whole.
 */
export function shownLink(link: string): string {
  const plain = link.trim().replace(/^https?:\/\//i, '');
  const mark = plain.search(/[#?]/);
  const head = mark < 0 ? plain.slice(0, START) : plain.slice(0, mark + 1);
  const rest = plain.slice(head.length);
  if (rest.length <= ENDS * 2 + 4) return plain;
  return `${head}${rest.slice(0, ENDS)}…${rest.slice(-ENDS)}`;
}
