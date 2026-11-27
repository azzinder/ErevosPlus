// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { EDITION, type Edition } from './edition';

// Erevos's first start, as its design of 26-11 has it: five steps, four in Erevos Lite, each
// screen in the edition's own colours. Before the first space opens (components/setup.tsx): the
// welcome, with a name and the language, then What will you use?, the modules, where there is a
// choice. Once it is open (app/first-steps.tsx): How visible are you?, the three modes, with the
// server LPHL gives by itself (lib/open-place.ts); every permission, in five groups
// (lib/permission-groups.ts); and Keep it safe, the password lock and automatic backups. Then the
// home screen says what is ready (app/index.tsx). Moving from another phone, the steps after the
// restore are the permissions and Keep it safe: the mode comes with the backup. Self-contained, so
// the checks run it under Node.

/** A step of the first start. */
export type StartStep = 'welcome' | 'modules' | 'mode' | 'permissions' | 'keep';

/**
 * The steps, in order. `choice`: there are modules to choose from (not in Erevos Lite, nor on a
 * device with Erevos's own chats alone). `restored`: a backup brought the mode. `checks`: there
 * are permissions to look at here (Android, the web app in a browser; not the computer app).
 */
export function startSteps({ choice, restored = false, checks }: { choice: boolean; restored?: boolean; checks: boolean }): StartStep[] {
  const steps: StartStep[] = ['welcome'];
  if (choice) steps.push('modules');
  if (!restored) steps.push('mode');
  if (checks) steps.push('permissions');
  steps.push('keep');
  return steps;
}

/** Where `step` is among `steps`, for the dots: its number from 1, and how many there are. */
export function stepAt(steps: readonly StartStep[], step: StartStep): { n: number; of: number } {
  return { n: steps.indexOf(step) + 1, of: steps.length };
}

/** A pair of colours a tile, an emblem or a button is drawn with, from the first to the second. */
export type Pair = readonly [string, string];

/** The first start's colours: the edition's own, over a warm dark or light ground. */
export type StartLook = {
  dark: boolean;
  /** The ground, from its top to its bottom. */
  ground: Pair;
  /** The edition's light at the top of each screen. */
  hue: string;
  /** Glass cards, a stronger one, and their edges. */
  glass: string;
  glassStrong: string;
  line: string;
  text: string;
  muted: string;
  faint: string;
  /** Allowed, and who does not see the address. */
  ok: string;
  /** A warning, and who sees the address. */
  warn: string;
  /** The edition's colour, the main button's two, a lighter one for words, and what is written on it. */
  primary: string;
  button: Pair;
  highlight: string;
  onPrimary: string;
  /** The glow under the main button and the app's icon. */
  glow: string;
  /** What a sheet is drawn over. */
  scrim: string;
};

// Erevos and Erevos Lite: red, as their icon; Erevos+: violet to blue, as its own.
const ACCENTS: Record<Edition, { primary: string; button: Pair; highlight: string; glow: string; hue: string }> = {
  erevos: { primary: '#F0472A', button: ['#F0472A', '#B81E05'], highlight: '#FF8A6E', glow: 'rgba(236, 48, 19, 0.30)', hue: 'rgba(236, 48, 19, 0.26)' },
  lite: { primary: '#F0472A', button: ['#F0472A', '#B81E05'], highlight: '#FF8A6E', glow: 'rgba(236, 48, 19, 0.30)', hue: 'rgba(236, 48, 19, 0.26)' },
  plus: { primary: '#8B6CF0', button: ['#8B6CF0', '#3450D7'], highlight: '#B9A6FF', glow: 'rgba(101, 94, 224, 0.38)', hue: 'rgba(120, 100, 240, 0.30)' },
};

/** The first start's colours for `edition`, dark or light as the phone is. */
export function startLook(dark: boolean, edition: Edition = EDITION): StartLook {
  const accent = ACCENTS[edition];
  const ground = dark
    ? {
        ground: ['#15110C', '#0B0907'] as const,
        glass: 'rgba(255, 240, 215, 0.055)',
        glassStrong: 'rgba(255, 240, 215, 0.09)',
        line: 'rgba(255, 230, 190, 0.12)',
        text: '#F7F1E7',
        muted: '#C3B9AB',
        faint: '#9C9284',
        ok: '#86C2B4',
        warn: '#F09A78',
        scrim: 'rgba(0, 0, 0, 0.55)',
      }
    : {
        ground: ['#F3EADB', '#FBF7F0'] as const,
        glass: 'rgba(255, 255, 255, 0.75)',
        glassStrong: '#FFFFFF',
        line: 'rgba(120, 90, 40, 0.14)',
        text: '#1C1712',
        muted: '#65594C',
        faint: '#8E8274',
        ok: '#2F7D6E',
        warn: '#B8431F',
        scrim: 'rgba(28, 23, 18, 0.45)',
      };
  return { dark, ...ground, hue: accent.hue, primary: accent.primary, button: accent.button, highlight: accent.highlight, onPrimary: '#FFFFFF', glow: accent.glow };
}

/** The tiles' colours, each from its first to its second, the same dark or light. */
export const TILES = {
  gold: ['#E8B45A', '#A8701A'],
  teal: ['#5FB8A6', '#21685B'],
  blue: ['#6E9EE6', '#2D4F8C'],
  violet: ['#A487E0', '#56398F'],
  rose: ['#EE8E73', '#A2432A'],
  green: ['#7CC47A', '#2F7A3A'],
  slate: ['#8F9AAF', '#465065'],
} as const satisfies Record<string, Pair>;

export type Tile = keyof typeof TILES;
