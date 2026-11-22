// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { BackdropSpec } from '../components/backdrop';
import type { Colors } from '../theme/colors';
import { glassHaze, glowLayer, wallLayers } from '../theme/glass';
import type { BubbleShape } from '../theme/look';

/**
 * Erevos's look for Messenger's case (MessengerCaseActivity): Meta's own page, painted in the
 * open space's colours, light or dark as Erevos is, and in its serif or monospace when the look
 * sets one. Meta's page takes its colours from its own CSS variables (light and dark sets,
 * `__fb-light-mode` / `__fb-dark-mode`): `css` sets them, over Meta's, to Erevos's. A name Meta
 * does not use does nothing, so a page Meta changes shows in part in its own colours, never broken.
 */
export interface CaseLook {
  css: string;
  /** The page in its dark set (Erevos dark) or its light one. */
  dark: boolean;
  /** Behind the page and under the phone's bars, #RRGGBB. */
  ground: string;
  /** The page's text size, in percent (the look's text size). */
  textZoom: number;
  /**
   * Our own messages' and theirs' fill as the page computes it ("rgb(r, g, b)"), for the case to
   * find Meta's bubbles and give them the look's shape (classes erevos-mine, erevos-theirs).
   */
  bubbles: { mine: string; theirs: string };
  /** The style's own letters, as files on the phone: served to the page as FONT_URL + index. */
  fonts: string[];
}

/** Where the page asks for the style's letters; the case answers from [CaseLook.fonts] alone. */
export const FONT_URL = 'https://www.facebook.com/__erevos/font/';

/** The look's own letters for the page: each file with the weight it stands for. */
export interface CaseFont {
  weight: number;
  file: string;
}

/** What else of the look the page takes, beyond its colours. */
export interface CaseExtras {
  /** TEXT_SCALE of the look's text size. */
  textScale?: number;
  bubbles?: BubbleShape;
  /** Square bubbles' corner: 4, or 0 where the style has none. */
  squareCorner?: number;
  /** Ours lit (Neon, Matrix): the accent as a line and a glow around a tinted fill. */
  glow?: boolean;
  /** What lies behind the screens (components/backdrop.tsx useBackdropSpec), or null. */
  backdrop?: BackdropSpec | null;
  /** The style's own letters, once on the phone (Inter, Inter Tight); none keeps the phone's. */
  fonts?: CaseFont[];
}

// Only colours go into the page's CSS: #RGB(A)/#RRGGBB(AA), rgb()/rgba() of numbers, transparent.
const COLOUR = /^(transparent|#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(,\s*[\d.]+%?\s*)?\))$/i;

function rgb(colour: string): [number, number, number] | null {
  const hex = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(colour);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/i.exec(colour);
  if (short) return [short[1], short[2], short[3]].map((c) => parseInt(c + c, 16)) as [number, number, number];
  const fn = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(colour);
  if (fn) return [Number(fn[1]), Number(fn[2]), Number(fn[3])].map((c) => Math.max(0, Math.min(255, Math.round(c)))) as [number, number, number];
  return null;
}

const hex = ([r, g, b]: [number, number, number]) => `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Contrast of two colours (WCAG), 1 to 21. */
export function contrast(a: string, b: string): number {
  const x = rgb(a);
  const y = rgb(b);
  if (!x || !y) return 1;
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The accent as the fill of our own messages, which Meta writes in white: the accent itself when
 * white reads on it, else the accent deepened (mixed with black) until it does.
 */
export function ownBubble(accent: string): string {
  const c = COLOUR.test(accent) ? rgb(accent) : null;
  if (!c) return '#0A7CFF';
  for (let k = 0; k <= 20; k++) {
    const mixed = c.map((v) => Math.round(v * (1 - k * 0.04))) as [number, number, number];
    if (contrast(hex(mixed), '#ffffff') >= 4.5) return hex(mixed);
  }
  return '#000000';
}

/** `colour` at `alpha` (0..1), as rgba(); '' if it is not one we can read. */
function faint(colour: string, alpha: number): string {
  const c = COLOUR.test(colour) ? rgb(colour) : null;
  return c ? `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})` : '';
}

/** An opaque #RRGGBB for the bars and behind the page, or `fallback`. */
function solid(colour: string, fallback: string): string {
  const c = COLOUR.test(colour) ? rgb(colour) : null;
  return c ? hex(c) : fallback;
}

/** "rgb(r, g, b)" as the page's computed style writes an opaque colour, or ''. */
function computed(colour: string): string {
  const c = COLOUR.test(colour) ? rgb(colour) : null;
  return c ? `rgb(${c[0]}, ${c[1]}, ${c[2]})` : '';
}

/**
 * What lies behind the screens, as the page's background layers (top first) and the colour under
 * them: Nocturne's glow, the glass's wallpaper and haze, Neon's grid, Matrix's rain, Paper's
 * lines, Aurora's light, or a wallpaper chosen in Appearance. Null: nothing behind the page.
 * A photo of one's own stays in Erevos: the page shows a soft gradient of the accent instead.
 */
export interface CaseLayer {
  image: string;
  /** The tile it repeats in; the whole page if none. */
  size?: string;
  /** Where it lies when it covers only part of the page (it then does not repeat). */
  position?: string;
}

export function caseBackdrop(spec: BackdropSpec | null | undefined): { base: string; layers: CaseLayer[] } | null {
  if (!spec) return null;
  const accent = spec.accent;
  const a = (alpha: number) => faint(accent, alpha);
  const whole = (image: string): CaseLayer => ({ image });
  if (spec.kind === 'glow') return { base: '#161826', layers: [whole(glowLayer(412))] };
  if (spec.kind === 'wall') {
    const wall = wallLayers(spec.side, accent);
    const haze = glassHaze(spec.side);
    // The water lines: 1 px every 12 px over the lowest 38%.
    const water: CaseLayer = { image: `repeating-linear-gradient(to bottom, ${wall.lines} 0px, ${wall.lines} 1px, transparent 1px, transparent 12px)`, size: '100% 38%', position: 'left bottom' };
    return { base: wall.base, layers: [whole(`linear-gradient(${haze}, ${haze})`), ...wall.layers.map(whole), water] };
  }
  if (spec.kind === 'grid') {
    const cyan = (alpha: number) => `rgba(0, 229, 255, ${alpha})`;
    return {
      base: '#07060F',
      layers: [
        whole('radial-gradient(ellipse 90% 32% at 50% 64%, rgba(255, 43, 214, 0.28) 0%, rgba(255, 43, 214, 0) 100%)'),
        { image: `linear-gradient(to bottom, ${cyan(0.16)} 1px, transparent 1px)`, size: '44px 44px' },
        { image: `linear-gradient(to right, ${cyan(0.1)} 1px, transparent 1px)`, size: '44px 44px' },
      ],
    };
  }
  if (spec.kind === 'rain') {
    return {
      base: '#000000',
      layers: [
        whole('linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.35) 100%)'),
        whole('repeating-linear-gradient(to right, rgba(0, 255, 65, 0.06) 0px, rgba(0, 255, 65, 0.06) 9px, transparent 9px, transparent 22px)'),
      ],
    };
  }
  if (spec.kind === 'ruled') {
    return {
      base: '#F5EFE3',
      layers: [
        whole('linear-gradient(to right, transparent 8px, rgba(179, 38, 30, 0.35) 8px, rgba(179, 38, 30, 0.35) 9px, transparent 9px)'),
        whole('repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(31, 79, 163, 0.1) 27px, rgba(31, 79, 163, 0.1) 28px)'),
      ],
    };
  }
  if (spec.kind === 'aurora') {
    const pool = (x: string, y: string, colour: string) => `radial-gradient(ellipse 90% 45% at ${x} ${y}, ${colour} 0%, rgba(246, 247, 251, 0) 100%)`;
    return {
      base: '#F6F7FB',
      layers: [pool('10%', '8%', 'rgba(120, 230, 200, 0.45)'), pool('95%', '35%', 'rgba(170, 140, 255, 0.4)'), pool('25%', '92%', 'rgba(255, 170, 150, 0.38)')].map(whole),
    };
  }
  const p = spec.pattern;
  if (spec.kind !== 'pattern' || !p) return null;
  const dark = p.dark;
  const haze = p.glass ? [whole(`linear-gradient(${glassHaze(spec.side)}, ${glassHaze(spec.side)})`)] : [];
  const base = solid(p.ground, dark ? '#000000' : '#ffffff');
  const ink = a(p.name === 'grid' ? (dark ? 0.14 : 0.12) : p.name === 'stripes' ? (dark ? 0.07 : 0.06) : dark ? 0.32 : 0.28);
  const star = (x: number, y: number, size: number, colour: string) => `radial-gradient(circle at ${x}% ${y}%, ${colour} 0px, ${colour} ${size}px, transparent ${size + 0.6}px)`;
  const white = dark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.35)';
  const tiled = (image: string, size: string): CaseLayer => ({ image, size });
  const layers: Record<string, CaseLayer[]> = {
    dots: [tiled(`radial-gradient(circle, ${ink} 1.4px, transparent 1.9px)`, '22px 22px')],
    grid: [tiled(`linear-gradient(to bottom, ${ink} 1px, transparent 1px)`, '32px 32px'), tiled(`linear-gradient(to right, ${ink} 1px, transparent 1px)`, '32px 32px')],
    stripes: [whole(`repeating-linear-gradient(135deg, ${ink} 0px, ${ink} 12px, transparent 12px, transparent 28px)`)],
    stars: [
      star(8, 12, 1.2, white), star(23, 40, 0.9, white), star(41, 8, 1.6, a(0.6)), star(57, 66, 1, white), star(72, 22, 1.3, white),
      star(88, 51, 1.8, a(0.55)), star(14, 78, 1.1, white), star(33, 91, 1.5, white), star(64, 88, 0.9, a(0.5)), star(92, 84, 1.2, white),
      star(49, 34, 0.8, white), star(79, 70, 1, white),
    ].map((image) => tiled(image, '360px 420px')),
    bokeh: [
      `radial-gradient(circle at 18% 22%, ${a(0.22)} 0px, ${a(0.13)} 60px, transparent 100px)`,
      `radial-gradient(circle at 82% 38%, ${a(0.16)} 0px, ${a(0.1)} 80px, transparent 130px)`,
      `radial-gradient(circle at 35% 78%, ${a(0.2)} 0px, ${a(0.12)} 70px, transparent 115px)`,
      `radial-gradient(circle at 75% 90%, ${a(0.12)} 0px, ${a(0.07)} 50px, transparent 90px)`,
    ].map(whole),
    gradient: [whole(`linear-gradient(160deg, ${a(dark ? 0.34 : 0.26)} 0%, ${a(0.06)} 55%, ${a(dark ? 0.2 : 0.16)} 100%)`)],
    photo: [whole(`linear-gradient(160deg, ${a(dark ? 0.34 : 0.26)} 0%, ${a(0.06)} 55%, ${a(dark ? 0.2 : 0.16)} 100%)`)],
  };
  return { base, layers: [...haze, ...(layers[p.name] ?? [])] };
}

/**
 * The case's look from the open space's colours and scheme, the letters the look sets (`face`:
 * its serif or monospace; else the style's own letters if `extras.fonts` has them, or the phone's
 * sans), and the rest of the look (`extras`): text size, bubbles, what lies behind the screens.
 */
export function messengerCaseLook(colors: Colors, scheme: 'light' | 'dark', face: 'sans' | 'serif' | 'mono' | null = null, extras: CaseExtras = {}): CaseLook {
  const dark = scheme === 'dark';
  const behind = caseBackdrop(extras.backdrop);
  const ground = solid(behind?.base ?? colors.background, solid(colors.background, dark ? '#000000' : '#ffffff'));
  const surface = solid(colors.surface, ground);
  const surfaceAlt = solid(colors.surfaceAlt, surface);
  const pressed = solid(colors.surfacePressed, surfaceAlt);
  const mine = ownBubble(colors.primary);
  // Over a backdrop the page's grounds are see-through and its panes a veil, as Erevos's chats
  // show the wallpaper behind their messages; menus stay solid, to read.
  // (The glass look's panes are see-through already: kept as they are.)
  const veil = (colour: string) => (/^rgba\(/i.test(colour) && COLOUR.test(colour) ? colour : faint(colour, 0.82) || surface);
  const vars: Record<string, string> = {
    // Grounds and cards.
    'web-wash': behind ? 'transparent' : ground,
    'wash': surfaceAlt,
    'messenger-card-background': behind ? 'transparent' : ground,
    'surface-background': behind ? veil(colors.surface) : surface,
    'card-background': behind ? veil(colors.surface) : surface,
    'card-background-flat': behind ? veil(colors.surface) : surface,
    'popover-background': surface,
    'nav-bar-background': behind ? veil(colors.surface) : surface,
    'comment-background': surfaceAlt,
    'input-background': surfaceAlt,
    'chat-composer-input-background-color': surfaceAlt,
    'secondary-button-background': surfaceAlt,
    'secondary-button-background-floating': surface,
    'secondary-button-pressed': pressed,
    'hover-overlay': faint(colors.text, 0.06),
    'press-overlay-pressed': faint(colors.text, 0.12),
    'highlight-bg': colors.primarySoft,
    'divider': colors.border,
    'media-inner-border': colors.border,
    'shadow-2': faint('#000000', dark ? 0.5 : 0.12),
    // Words and icons.
    'primary-text': colors.text,
    'secondary-text': colors.textMuted,
    'placeholder-text': colors.textFaint,
    'disabled-text': colors.textFaint,
    'secondary-button-text': colors.text,
    'primary-icon': colors.text,
    'secondary-icon': colors.textMuted,
    'placeholder-icon': colors.textFaint,
    'disabled-icon': colors.textFaint,
    // The accent.
    'accent': colors.primary,
    'blue-link': colors.accentText,
    'primary-button-background': colors.primary,
    'primary-button-text': colors.onPrimary,
    'primary-button-pressed': colors.primaryPressed,
    'primary-deemphasized-button-background': colors.primarySoft,
    'primary-deemphasized-button-text': colors.accentText,
    'primary-web-focus-indicator': colors.primary,
    // Messages: theirs on the surface, ours in the accent (deepened to read in white).
    'chat-incoming-message-bubble-background-color': surfaceAlt,
    'chat-outgoing-message-bubble-background-color': mine,
    'messenger-reply-background': surfaceAlt,
    'mwp-message-row-background': behind ? 'transparent' : ground,
  };
  const lines = Object.entries(vars)
    .filter(([, value]) => COLOUR.test(value))
    .map(([name, value]) => `--${name}:${value}!important;`)
    .join('');
  // Meta sets its sets on the page and again on some parts of it (menus, the chat's own theme):
  // ours go on all of them.
  let css = `:root,html,body,.__fb-light-mode,.__fb-dark-mode,[class*="__fb-"]{${lines}}`;
  css += `html,body{background-color:${ground}!important;color-scheme:${dark ? 'dark' : 'light'};}`;
  if (behind?.layers.length) {
    const l = behind.layers;
    css += `body{background-image:${l.map((x) => x.image).join(',')}!important;background-size:${l.map((x) => x.size ?? '100% 100%').join(',')}!important;`;
    css += `background-position:${l.map((x) => x.position ?? '0 0').join(',')}!important;background-repeat:${l.map((x) => (x.size && !x.position ? 'repeat' : 'no-repeat')).join(',')}!important;background-attachment:fixed!important;}`;
  }
  const selection = faint(colors.primary, 0.35);
  if (selection) css += `::selection{background:${selection};}`;

  // Letters: the look's serif or monospace, else the style's own, else the page's.
  const every = 'body,body *:not(svg):not(path):not(i)';
  const fonts = face === 'serif' || face === 'mono' ? [] : (extras.fonts ?? []).filter((f) => f.file && Number.isFinite(f.weight));
  if (face === 'serif' || face === 'mono') {
    css += `${every}{font-family:${face === 'serif' ? 'serif' : 'monospace'}!important;}`;
  } else if (fonts.length) {
    css += fonts.map((f, i) => `@font-face{font-family:"Erevos Face";src:url("${FONT_URL}${i}") format("truetype");font-weight:${Math.round(f.weight)};font-display:swap;}`).join('');
    css += `${every}{font-family:"Erevos Face",system-ui,sans-serif!important;}`;
  }

  // Bubbles: Meta's own are round; square and line, or lit ones, are the look's.
  const shape = extras.bubbles ?? 'round';
  const b = '.erevos-mine,.erevos-theirs';
  if (shape === 'square') css += `${b}{border-radius:${Math.max(0, Math.round(extras.squareCorner ?? 4))}px!important;}`;
  if (shape === 'line') {
    css += `${b}{background:transparent!important;border-radius:0!important;}`;
    css += `.erevos-mine{border-right:3px solid ${computed(colors.primary)}!important;padding-right:10px!important;}`;
    css += `.erevos-theirs{border-left:3px solid ${computed(colors.textFaint)}!important;padding-left:10px!important;}`;
    css += `.erevos-mine,.erevos-mine *{color:${computed(colors.text)}!important;}`;
  } else if (extras.glow) {
    css += `.erevos-mine{background:${faint(colors.primary, 0.14)}!important;border:1px solid ${computed(colors.primary)}!important;box-shadow:0 0 12px ${faint(colors.primary, 0.45)}!important;}`;
    css += `.erevos-mine,.erevos-mine *{color:${computed(colors.text)}!important;}`;
  }
  const textZoom = Math.round(Math.max(0.5, Math.min(2, extras.textScale ?? 1)) * 100);
  return { css, dark, ground, textZoom, bubbles: { mine: computed(mine), theirs: computed(surfaceAlt) }, fonts: fonts.map((f) => f.file) };
}
