// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { createContext, useContext, useId, useMemo, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { startLook, TILES, type StartLook, type Tile } from '../lib/first-start';
import { t } from '../lib/i18n';
import { useTheme } from '../theme/context';

import { KeyboardAwareScrollView, KeyboardPaddedView } from './keyboard';
import { Text } from './ui';

// The first start's look, as its design of 26-11 has it (the mock's screens): a warm ground with
// the edition's own light at the top, and faint stars in the dark only; glass cards; icon tiles in
// gradients; a pill of a button; round back button, dots, toggles and radios. Every colour comes
// from lib/first-start.ts (startLook, TILES). Used by the first start's screens
// (components/setup.tsx, app/first-steps.tsx) only: the home screen after them is in the app's own
// look.

const LookContext = createContext<StartLook | null>(null);

/** The first start's colours, dark or light as the app is. */
export function useStartLook(): StartLook {
  const given = useContext(LookContext);
  const { scheme } = useTheme();
  return useMemo(() => given ?? startLook(scheme === 'dark'), [given, scheme]);
}

// "rgba(r, g, b, a)" or "#rrggbb" as an svg colour and its opacity.
function svgColor(color: string): { color: string; opacity: number } {
  const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(color);
  if (!m) return { color, opacity: 1 };
  return { color: `rgb(${m[1]}, ${m[2]}, ${m[3]})`, opacity: m[4] === undefined ? 1 : Number(m[4]) };
}

// A colour with its alpha scaled (for the tiles' tints and glows).
export function tint(color: string, alpha: number): string {
  const { color: rgb, opacity } = svgColor(color);
  const hex = /^#([0-9a-f]{6})$/i.exec(rgb);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }
  return rgb.replace('rgb(', 'rgba(').replace(')', `, ${opacity * alpha})`);
}

// An id for an svg gradient that is safe in a url(#…) on every platform.
function useGradientId(): string {
  return 'g' + useId().replace(/[^a-zA-Z0-9]/g, '');
}

/** A gradient over the whole of its parent, from `from` to `to` along (x1, y1) → (x2, y2) of it. */
export function Gradient({ from, to, x1 = 0, y1 = 0, x2 = 1, y2 = 1 }: { from: string; to: string; x1?: number; y1?: number; x2?: number; y2?: number }) {
  const id = useGradientId();
  const a = svgColor(from);
  const b = svgColor(to);
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
          <Stop offset="0" stopColor={a.color} stopOpacity={a.opacity} />
          <Stop offset="1" stopColor={b.color} stopOpacity={b.opacity} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

// The faint stars of the dark ground, by their place in percent, size and strength.
const STARS: readonly (readonly [number, number, number, number])[] = [
  [12, 8, 1.2, 0.5],
  [78, 5, 1, 0.45],
  [88, 17, 1.4, 0.4],
  [30, 15, 1, 0.3],
  [60, 11, 1, 0.4],
  [6, 22, 1.2, 0.25],
];

// The ground: from its top colour to its bottom one, with the edition's light at its top, and the stars.
function Ground({ look }: { look: StartLook }) {
  const id = useGradientId();
  const top = svgColor(look.ground[0]);
  const bottom = svgColor(look.ground[1]);
  const hue = svgColor(look.hue);
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={top.color} />
          <Stop offset="0.55" stopColor={bottom.color} />
          <Stop offset="1" stopColor={bottom.color} />
        </LinearGradient>
        <RadialGradient id={`${id}b`} cx="0.5" cy="-0.08" rx="1.2" ry="0.55" fx="0.5" fy="-0.08" gradientUnits="objectBoundingBox">
          <Stop offset="0" stopColor={hue.color} stopOpacity={hue.opacity} />
          <Stop offset="0.62" stopColor={hue.color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}a)`} />
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}b)`} />
      {look.dark ? STARS.map(([x, y, r, o]) => <Circle key={`${x}-${y}`} cx={`${x}%`} cy={`${y}%`} r={r} fill="#FFFFFF" opacity={o} />) : null}
    </Svg>
  );
}

const MAX_WIDTH = 560;

/**
 * A screen of the first start: the ground, a body that scrolls when it is taller than the screen,
 * and a footer (the main button and the link under it) that stays at the bottom, outside the
 * scroll. It ends above the keyboard while one is open.
 */
export function StartScreen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const look = useStartLook();
  const insets = useSafeAreaInsets();
  return (
    <LookContext.Provider value={look}>
      <KeyboardPaddedView inset={insets.bottom} style={{ flex: 1, backgroundColor: look.ground[1] }}>
        <Ground look={look} />
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 16, gap: 12 }}
        >
          {children}
        </KeyboardAwareScrollView>
        {footer ? (
          <View style={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 20, gap: 10 }}>{footer}</View>
        ) : (
          <View style={{ height: insets.bottom }} />
        )}
      </KeyboardPaddedView>
    </LookContext.Provider>
  );
}

/** A field's style on the web without the browser's own focus ring, as components/ui.tsx's fields. */
export const noOutline = (Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as unknown as TextStyle;

/** Text in the first start's colours: `tone` is one of its text colours, or any colour. */
export function L({ children, size = 14, weight = '400', tone = 'text', line, align, style, numberOfLines }: {
  children: ReactNode;
  size?: number;
  weight?: TextStyle['fontWeight'];
  tone?: 'text' | 'muted' | 'faint' | 'ok' | 'warn' | 'primary' | 'highlight' | (string & {});
  line?: number;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const look = useStartLook();
  const color = tone === 'text' ? look.text : tone === 'muted' ? look.muted : tone === 'faint' ? look.faint : tone === 'ok' ? look.ok : tone === 'warn' ? look.warn : tone === 'primary' ? look.primary : tone === 'highlight' ? look.highlight : tone;
  return (
    <Text color={color} numberOfLines={numberOfLines} style={[{ fontSize: size, fontWeight: weight, lineHeight: line ?? Math.round(size * 1.4), textAlign: align }, style]}>
      {children}
    </Text>
  );
}

/** A title whose emphasised part, between single asterisks ('How *visible* are you?'), is in the edition's highlight colour. */
export function Highlighted({ text, size = 27, align = 'center', style }: { text: string; size?: number; align?: TextStyle['textAlign']; style?: StyleProp<TextStyle> }) {
  const look = useStartLook();
  const parts = text.split('*');
  // Text gives each part its own body size, so the highlighted one is told the title's.
  const own = { fontSize: size, fontWeight: '800', letterSpacing: -0.6, lineHeight: Math.round(size * 1.18) } as const;
  return (
    <Text color={look.text} accessibilityRole="header" style={[{ ...own, textAlign: align }, style]}>
      {parts.map((part, i) => (i % 2 === 1 ? <Text key={i} color={look.highlight} style={own}>{part}</Text> : part))}
    </Text>
  );
}

/** A line whose words between double asterisks ('The backups leave **encrypted**.') are bold and in the full text colour. */
export function Bolded({ text, size = 13.5, style }: { text: string; size?: number; style?: StyleProp<TextStyle> }) {
  const look = useStartLook();
  const parts = text.split('**');
  const own = { fontSize: size, lineHeight: Math.round(size * 1.4) };
  return (
    <Text color={look.muted} style={[own, style]}>
      {parts.map((part, i) => (i % 2 === 1 ? <Text key={i} color={look.text} style={{ ...own, fontWeight: '700' }}>{part}</Text> : part))}
    </Text>
  );
}

// The line icons of the design, each as paths (p), rectangles (r: x, y, width, height, radius)
// and circles (c: x, y, radius) in a 24 by 24 square, drawn with a line of `width`.
type Part = readonly ['p', string] | readonly ['r', number, number, number, number, number] | readonly ['c', number, number, number];
type Drawing = { width: number; parts: readonly Part[] };

const ICONS = {
  lock: { width: 2, parts: [['r', 5, 11, 14, 10, 2], ['p', 'M8 11V7a4 4 0 0 1 8 0v4']] },
  id: { width: 2, parts: [['c', 12, 8, 4], ['p', 'M4 21c1-4 4-6 8-6s7 2 8 6'], ['p', 'M3 3l18 18']] },
  qr: { width: 2, parts: [['r', 3, 3, 7, 7, 0], ['r', 14, 3, 7, 7, 0], ['r', 3, 14, 7, 7, 0], ['p', 'M14 14h3v3h-3zM20 14v7h-6']] },
  srv: { width: 2, parts: [['r', 3, 4, 18, 7, 2], ['r', 3, 13, 18, 7, 2], ['p', 'M7 7.5h.01M7 16.5h.01']] },
  chat: { width: 2, parts: [['p', 'M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z']] },
  phone: { width: 2, parts: [['p', 'M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z']] },
  sms: { width: 2, parts: [['r', 3, 4, 18, 13, 2], ['p', 'M8 21l4-4']] },
  col: { width: 2, parts: [['r', 3, 5, 18, 14, 2], ['c', 9, 10, 2], ['p', 'M21 16l-5-5-8 8']] },
  bell: { width: 2, parts: [['p', 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'], ['p', 'M10 21h4']] },
  mic: { width: 2, parts: [['r', 9, 3, 6, 11, 3], ['p', 'M5 11a7 7 0 0 0 14 0M12 18v3']] },
  clock: { width: 2, parts: [['c', 12, 12, 9], ['p', 'M12 7v5l3 2']] },
  bolt: { width: 2, parts: [['p', 'M13 2L4 14h7l-1 8 9-12h-7z']] },
  globe: { width: 2, parts: [['c', 12, 12, 9], ['p', 'M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18']] },
  key: { width: 2, parts: [['c', 8, 15, 4], ['p', 'M11 12l9-9M17 6l3 3']] },
  moon: { width: 1.8, parts: [['p', 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z']] },
  shield: { width: 1.8, parts: [['p', 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'], ['p', 'M9 12l2 2 4-4']] },
  eye: { width: 1.8, parts: [['p', 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z'], ['c', 12, 12, 3]] },
  mask: { width: 1.8, parts: [['p', 'M3 7c3-1 6-1 9 1 3-2 6-2 9-1 0 6-3 10-6 10-2 0-2-2-3-2s-1 2-3 2c-3 0-6-4-6-10z'], ['p', 'M7 11h2M15 11h2']] },
  ghost: { width: 1.8, parts: [['p', 'M5 21V10a7 7 0 0 1 14 0v11l-2.5-2-2.3 2-2.2-2-2.2 2-2.3-2z'], ['p', 'M9.5 10h.01M14.5 10h.01']] },
  drive: { width: 1.8, parts: [['p', 'M8 3h8l6 10-4 7H6l-4-7z'], ['p', 'M8 3l6 10H2M16 3l-6 10 4 7']] },
  phoneD: { width: 1.8, parts: [['r', 6, 2, 12, 20, 3], ['p', 'M11 18h2']] },
  check: { width: 2.4, parts: [['p', 'M5 12l5 5 9-10']] },
  x: { width: 2.2, parts: [['p', 'M6 6l12 12M18 6L6 18']] },
  user: { width: 1.8, parts: [['c', 12, 8, 4], ['p', 'M4 21c1-4 4-6 8-6s7 2 8 6']] },
  back: { width: 2.2, parts: [['p', 'M15 5l-7 7 7 7']] },
  forward: { width: 2.2, parts: [['p', 'M9 5l7 7-7 7']] },
} as const satisfies Record<string, Drawing>;

export type IconName = keyof typeof ICONS;

/** One of the design's line icons, `size` wide, in `color`. */
export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color: string }) {
  const { width, parts } = ICONS[name] as Drawing;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {parts.map((part, i) =>
        part[0] === 'p' ? <Path key={i} d={part[1]} /> : part[0] === 'r' ? <Rect key={i} x={part[1]} y={part[2]} width={part[3]} height={part[4]} rx={part[5]} /> : <Circle key={i} cx={part[1]} cy={part[2]} r={part[3]} />,
      )}
    </Svg>
  );
}

/** A glass card: translucent fill, a 1px edge, rounded 20. */
export function Glass({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const look = useStartLook();
  return <View style={[{ backgroundColor: look.glass, borderColor: look.line, borderWidth: 1, borderRadius: 20 }, style]}>{children}</View>;
}

/** A tile of an icon on a gradient, in one of the design's colours. */
export function Tile({ tile, icon, size = 38, radius, iconSize }: { tile: Tile; icon: IconName; size?: number; radius?: number; iconSize?: number }) {
  const [a, b] = TILES[tile];
  return (
    <View style={{ width: size, height: size, borderRadius: radius ?? Math.round(size * 0.32), overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <Gradient from={a} to={b} />
      {/* In a View of its own, so that on the web the gradient, laid over it, stays under it. */}
      <View>
        <Icon name={icon} size={iconSize ?? Math.round(size / 2)} color="#FFFFFF" />
      </View>
    </View>
  );
}

/** The emblem of a screen: a big tile with two faint rings round it. */
export function Emblem({ tile, icon, size = 92 }: { tile: Tile; icon: IconName; size?: number }) {
  const [a] = TILES[tile];
  const ring = (inset: number, radius: number, alpha: number) => (
    <View pointerEvents="none" style={{ position: 'absolute', top: -inset, left: -inset, right: -inset, bottom: -inset, borderRadius: radius, borderWidth: 1, borderColor: tint(a, alpha) }} />
  );
  return (
    <View style={{ width: size, height: size, borderRadius: Math.round(size * 0.33), alignItems: 'center', justifyContent: 'center', boxShadow: `0px 14px 40px -6px ${a}` }}>
      {ring(Math.round(size * 0.15), Math.round(size * 0.43), 0.35)}
      {ring(Math.round(size * 0.3), Math.round(size * 0.54), 0.15)}
      <Tile tile={tile} icon={icon} size={size} radius={Math.round(size * 0.33)} iconSize={Math.round(size * 0.48)} />
    </View>
  );
}

/** What heads a screen: an emblem, a title (see Highlighted) and a line under it. */
export function Hero({ emblem, title, sub, size = 27, top = 24 }: { emblem?: ReactNode; title: string; sub?: string; size?: number; top?: number }) {
  return (
    <View style={{ alignItems: 'center', gap: 8, paddingTop: 6, paddingBottom: 2 }}>
      {emblem ? <View style={{ marginTop: top, marginBottom: 14 }}>{emblem}</View> : null}
      <Highlighted text={title} size={size} />
      {sub ? (
        <L size={14.5} tone="muted" line={21} align="center" style={{ maxWidth: 330 }}>
          {sub}
        </L>
      ) : null}
    </View>
  );
}

/** The progress dots: `n` of `of`, from 1; the ones before it are paler, the one it is on is long. */
export function Dots({ n, of }: { n: number; of: number }) {
  const look = useStartLook();
  return (
    <View
      style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', paddingTop: 2 }}
      accessible
      accessibilityLabel={t('Step {n} of {m}', { n, m: of })}
    >
      {Array.from({ length: of }, (_, i) => {
        const at = i + 1;
        return (
          <View
            key={at}
            style={{ width: at === n ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: at === n ? look.primary : at < n ? tint(look.primary, 0.55) : look.line }}
          />
        );
      })}
    </View>
  );
}

/** The main button: a pill in the edition's gradient, 54 high. */
export function MainButton({ title, onPress, disabled = false, flex = false }: { title: string; onPress: () => void; disabled?: boolean; flex?: boolean }) {
  const look = useStartLook();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          height: 54,
          borderRadius: 27,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          boxShadow: `0px 10px 24px -8px ${look.glow}`,
        },
        flex ? { flex: 1 } : null,
      ]}
    >
      <Gradient from={look.button[0]} to={look.button[1]} x1={0} y1={0} x2={0} y2={1} />
      <L size={16} weight="800" tone={look.onPrimary} align="center">
        {title}
      </L>
    </Pressable>
  );
}

/** A button with only an edge, as the sheet's Back. */
export function GhostButton({ title, onPress, height = 48 }: { title: string; onPress: () => void; height?: number }) {
  const look = useStartLook();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ height, borderRadius: height / 2, borderWidth: 1.5, borderColor: look.line, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
    >
      <L size={16} weight="800" align="center">
        {title}
      </L>
    </Pressable>
  );
}

/** The round back button, beside the main one. */
export function BackButton({ onPress }: { onPress: () => void }) {
  const look = useStartLook();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('Back')}
      style={({ pressed }) => ({ width: 54, height: 54, borderRadius: 27, borderWidth: 1.5, borderColor: look.line, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
    >
      <Icon name="back" size={22} color={look.text} />
    </Pressable>
  );
}

/** The footer's row: back, and the main button. */
export function NavRow({ onBack, children }: { onBack?: () => void; children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      {onBack ? <BackButton onPress={onBack} /> : null}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

/** The small line under the main button: `text`, then, after a dot, `link` that can be pressed; or the link alone. */
export function FooterLink({ text, link, onPress }: { text?: string; link: string; onPress: () => void }) {
  const look = useStartLook();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', paddingVertical: 2 }}>
      {text ? (
        <L size={13.5} weight="500" tone="muted" align="center">
          {text} ·{' '}
        </L>
      ) : null}
      <Pressable onPress={onPress} accessibilityRole="link" hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        <L size={text ? 13.5 : 14} weight="700" tone={text ? look.primary : look.muted} align="center">
          {link}
        </L>
      </Pressable>
    </View>
  );
}

/** A toggle, for `label`: the edition's gradient while on. Without `onChange` it only shows the state, for a row that is itself the switch. */
export function StartToggle({ on, onChange, label }: { on: boolean; onChange?: (on: boolean) => void; label?: string }) {
  const look = useStartLook();
  const track = { width: 46, height: 28, borderRadius: 14, overflow: 'hidden', backgroundColor: look.line, justifyContent: 'center' } as const;
  const inside = (
    <>
      {on ? <Gradient from={look.button[1]} to={look.button[0]} x1={0} y1={0} x2={1} y2={0} /> : null}
      <View
        style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.3)' }}
      />
    </>
  );
  if (!onChange) {
    return (
      <View style={track} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {inside}
      </View>
    );
  }
  return (
    <Pressable onPress={() => onChange(!on)} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: on }} hitSlop={6} style={track}>
      {inside}
    </Pressable>
  );
}

/** The round mark of a choice: filled in `color` when it is the one chosen. */
export function Radio({ on, color }: { on: boolean; color?: string }) {
  const look = useStartLook();
  return (
    <View
      style={{ width: 22, height: 22, borderRadius: 11, marginTop: 2, borderWidth: on ? 7 : 2, borderColor: on ? (color ?? look.primary) : look.line, backgroundColor: on ? '#FFFFFF' : 'transparent' }}
    />
  );
}

/** The pill with a green dot: how the server is. */
export function StatusPill({ text }: { text: string }) {
  const look = useStartLook();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: look.glass, alignSelf: 'center' }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: look.ok, boxShadow: `0px 0px 8px ${look.ok}` }} />
      <L size={12} tone="muted">
        {text}
      </L>
    </View>
  );
}

/** The ring of what is allowed: `ok` of `all`, written in it. */
export function Ring({ ok, all, size = 64 }: { ok: number; all: number; size?: number }) {
  const look = useStartLook();
  const stroke = 6;
  const r = (size - stroke) / 2;
  const length = 2 * Math.PI * r;
  const share = all > 0 ? Math.min(1, ok / all) : 0;
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessible
      accessibilityLabel={t('{ok} of {all} allowed', { ok, all })}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={look.line} strokeWidth={stroke} fill={look.ground[0]} />
        {share > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={look.primary}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${length * share} ${length}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      <L size={13} weight="800" align="center">{`${ok}/${all}`}</L>
    </View>
  );
}

/** A sheet from the bottom over a scrim: `children` in it. Back (the key, or a tap on the scrim) calls `onClose`. */
export function StartSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const look = useStartLook();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <LookContext.Provider value={look}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: look.scrim }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('Close')} />
          <View
            style={{
              width: '100%',
              maxWidth: MAX_WIDTH,
              alignSelf: 'center',
              backgroundColor: look.ground[0],
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderTopWidth: 1,
              borderColor: look.line,
              paddingTop: 12,
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 22,
              gap: 12,
              boxShadow: '0px -20px 50px rgba(0, 0, 0, 0.5)',
            }}
          >
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: look.line, alignSelf: 'center' }} />
            {children}
          </View>
        </View>
      </LookContext.Provider>
    </Modal>
  );
}
