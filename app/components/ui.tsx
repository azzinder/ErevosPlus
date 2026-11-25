// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, shape, space, withAlpha, type Colors } from '../theme/colors';
import { useColors } from '../theme/context';
import { press, tap } from '../lib/haptics';
import { plural, t } from '../lib/i18n';

import { useGlassBlur, useGlassLift } from './glass';
import { EyeIcon } from './icons';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from './keyboard';

// The app's building blocks in the colours and shapes of the open look, as in LPHL FASOULI
// (src/components/ui.tsx there): text, cards, buttons, chips, fields and sheets.

/** Removes the browser focus ring from text inputs on the web. */
const webNoOutline = (Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as unknown as TextStyle;

/** With a style's own font each weight is its own font file: picks it from the weight. */
export function fontStyle(weight: TextStyle['fontWeight'] | undefined): TextStyle | null {
  // The letters chosen in the look win over the style's (theme/look.ts font).
  const letters = shape.face ?? shape.family;
  // Matrix: the platform's monospace in every weight; Paper: its serif.
  if (letters === 'mono') return { fontFamily: Platform.OS === 'web' ? 'ui-monospace, Menlo, Consolas, monospace' : 'monospace', fontWeight: weight };
  if (letters === 'serif') return { fontFamily: Platform.OS === 'web' ? 'Georgia, "Noto Serif", serif' : 'serif', fontWeight: weight };
  // The phone's own letters, over a style that has its own.
  if (letters === 'sans') return { fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: weight };
  const fonts = shape.fonts;
  if (!fonts) return null;
  const w = Number(weight === 'bold' ? 700 : weight === 'normal' || weight === undefined ? 400 : weight);
  const family = fonts[w >= 700 ? 'bold' : w >= 600 ? 'semibold' : 'regular'];
  // Browsers need a generic fallback, or missing glyphs render in a serif font.
  return { fontFamily: Platform.OS === 'web' ? `${family}, system-ui, sans-serif` : family, fontWeight: 'normal' };
}

/** fontStyle for a style sheet entry. */
export const font = (weight: TextStyle['fontWeight']): TextStyle => fontStyle(weight) ?? { fontWeight: weight };

/** Greek capitals drop the stress accent (tonos): "Ρυθμίσεις" → "ΡΥΘΜΙΣΕΙΣ". */
function greekUpper(text: string): string {
  if (!/[Ͱ-Ͽἀ-῿]/.test(text)) return text;
  return text.normalize('NFD').replace(/́/g, '').normalize('NFC').toUpperCase();
}

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'label' | 'caption' | 'overline' | 'mono';

const VARIANTS: Record<Variant, TextStyle> = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  heading: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400' },
  bodyStrong: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '400' },
  overline: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  // Ids and links, in the platform's monospace whatever the style.
  mono: { fontSize: 12, fontWeight: '400', fontFamily: 'monospace' },
};

/** Nocturne's type (nocturne.css): titles tighter, kickers in the regular weight and spaced wider. */
const NOCTURNE_VARIANTS: Record<Variant, TextStyle> = {
  ...VARIANTS,
  display: { ...VARIANTS.display, letterSpacing: -1.02 },
  title: { ...VARIANTS.title, letterSpacing: -0.84 },
  heading: { ...VARIANTS.heading, letterSpacing: -0.27 },
  overline: { ...VARIANTS.overline, fontWeight: '400', letterSpacing: 1.56 },
};

export function Text({ variant = 'body', color, tone, style, children, ...props }: TextProps & {
  variant?: Variant;
  color?: string;
  tone?: 'muted' | 'faint';
}) {
  const colors = useColors();
  const night = shape.type === 'nocturne';
  // The line styles' kickers are in their own ink (Nocturne's accent's pale end).
  const c =
    color ??
    (shape.ink && variant === 'overline' ? shape.ink.kicker : tone === 'muted' ? colors.textMuted : tone === 'faint' ? colors.textFaint : colors.text);
  const variants = night ? NOCTURNE_VARIANTS : VARIANTS;
  // Neon and Matrix: titles glow in the accent, as lit signs.
  const lit = shape.glow && (variant === 'display' || variant === 'title') ? { textShadowColor: withAlpha(colors.primary, 0.75), textShadowRadius: 12 } : null;
  return (
    <RNText
      {...props}
      style={[
        variants[variant],
        { color: c },
        lit,
        style,
        variant === 'mono' ? null : fontStyle((StyleSheet.flatten(style)?.fontWeight as TextStyle['fontWeight']) ?? variants[variant].fontWeight),
      ]}
    >
      {variant === 'overline' && typeof children === 'string' ? greekUpper(children) : children}
    </RNText>
  );
}

/**
 * A screen's scrolling body on the look's ground, centred on wide screens. The field being typed in
 * is scrolled above the keyboard, and the end clears the phone's navigation bar.
 */
export function Page({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={[
        { width: '100%', maxWidth: 760, alignSelf: 'center', padding: space.xl - 4, paddingBottom: insets.bottom + space.xl, gap: space.md },
        style,
      ]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={space.xl}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const lift = useGlassLift();
  return (
    <View
      style={[
        {
          gap: 10,
          padding: space.lg,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: shape.cardBorder,
          borderColor: colors.border,
        },
        lift,
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'danger';

/** A button's fill, its fill when pressed, its label and its outline, in the open style. */
export function buttonColors(kind: ButtonKind, colors: Colors): { bg: string; pressed: string; fg: string; line?: string } {
  // Nocturne draws lines, not fills: an outlined accent button, the wash when pressed (nocturne.css §3).
  if (shape.lines && (kind === 'primary' || kind === 'secondary')) {
    return kind === 'primary'
      ? { bg: 'transparent', pressed: colors.surfacePressed, fg: colors.accentText, line: colors.primary }
      : { bg: 'transparent', pressed: colors.surfacePressed, fg: colors.text, line: shape.ink?.fieldLine ?? colors.border };
  }
  switch (kind) {
    case 'primary':
      return { bg: colors.primary, pressed: colors.primaryPressed, fg: colors.onPrimary };
    case 'secondary':
      return { bg: colors.surfaceAlt, pressed: colors.surfacePressed, fg: colors.text };
    case 'ghost':
      return { bg: 'transparent', pressed: colors.surfaceAlt, fg: colors.accentText };
    case 'danger':
      return { bg: withAlpha(colors.danger, 0.12), pressed: withAlpha(colors.danger, 0.2), fg: colors.danger };
  }
}

export function Button({ title, onPress, onLongPress, kind = 'primary', disabled, loading, compact, style }: {
  title: string;
  onPress: () => void;
  /** Held down: more ways to do it (Send: later, or without sound), also while it cannot be tapped. */
  onLongPress?: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const c = buttonColors(kind, colors);
  if (useContext(ButtonsAs) === 'rows' && !loading) return <OptionRow title={title} onPress={onPress} onLongPress={onLongPress} disabled={disabled} danger={kind === 'danger'} />;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={
        disabled
          ? undefined
          : () => {
              tap();
              onPress();
            }
      }
      onLongPress={
        onLongPress
          ? () => {
              press();
              onLongPress();
            }
          : undefined
      }
      disabled={(disabled && !onLongPress) || loading}
      style={({ pressed }) => [
        {
          minHeight: compact ? 44 : 52,
          paddingHorizontal: compact ? space.lg : space.xl,
          borderRadius: radius.button,
          backgroundColor: pressed ? c.pressed : c.bg,
          borderWidth: c.line ? 1 : 0,
          borderColor: c.line,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: shape.buttonAlign,
          opacity: disabled ? 0.45 : 1,
          // A long label on a narrow phone goes on two lines instead of out of the screen.
          maxWidth: '100%',
          paddingVertical: 4,
        },
        // Neon and Matrix: a lit button glows in its colour.
        shape.glow && kind === 'primary' && !disabled ? { boxShadow: `0px 0px 14px ${withAlpha(colors.primary, 0.55)}` } : null,
        style,
      ]}
    >
      {({ pressed }) =>
        loading ? (
          <ActivityIndicator color={c.fg} />
        ) : (
          // An outlined label turns to the accent's pale end on the wash, as on the LPHL site.
          <Text variant="label" color={pressed && c.line ? colors.primaryPressed : c.fg} style={{ fontSize: compact ? 15 : 16, flexShrink: 1, textAlign: shape.buttonAlign === 'center' ? 'center' : undefined }}>
            {title}
          </Text>
        )
      }
    </Pressable>
  );
}

/**
 * A switch, drawn: on, it fills with the accent and its knob goes right. Off, its knob is in the
 * muted ink, which shows on every ground (the surface's color would vanish under dark glass). The
 * row it is in says what it switches, as a switch (accessibilityRole="switch", checked).
 */
export function Toggle({ on }: { on: boolean }) {
  const colors = useColors();
  return (
    <View
      style={{
        width: 46,
        height: 28,
        borderRadius: 14,
        padding: 3,
        justifyContent: 'center',
        alignItems: on ? 'flex-end' : 'flex-start',
        backgroundColor: on ? colors.primary : withAlpha(colors.textMuted, 0.3),
      }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: on ? colors.onPrimary : colors.textMuted }} />
    </View>
  );
}

/** A link-like action: the accent as text. */
export function TextButton({ title, onPress, hitSlop = 8 }: { title: string; onPress: () => void; hitSlop?: PressableProps['hitSlop'] }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={hitSlop} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <Text variant="label" color={colors.accentText}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, onLongPress, disabled, mono, fit, count }: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Held down: more to do with it (a folder: rename, delete). */
  onLongPress?: () => void;
  /** Shown but not choosable (no option of a disabled row is shown as chosen). */
  disabled?: boolean;
  /** An id rather than a word. */
  mono?: boolean;
  /** Shares a narrow row with the others: as wide as its label allows, which shrinks to fit. */
  fit?: boolean;
  /** Messages not read, as a small number after the label (99+ above 99); nothing when 0. */
  count?: number;
}) {
  const colors = useColors();
  // The chosen chip's label: the accent's small-text step, or, under Nocturne, its palest step on the wash.
  const ink = shape.ink?.chosen ?? colors.accentText;
  const on = !!selected && !disabled;
  return (
    <Pressable
      onPress={
        onPress
          ? () => {
              tap();
              onPress();
            }
          : undefined
      }
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityLabel={count ? `${label}, ${plural(count, '{n} unread message', '{n} unread messages')}` : undefined}
      accessibilityState={{ selected: on, disabled }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: fit ? 8 : 14,
        minHeight: 38,
        ...(fit ? { flexGrow: 1, flexShrink: 1, justifyContent: 'center' as const } : null),
        borderRadius: radius.chip,
        borderWidth: 1,
        borderColor: on ? colors.primary : colors.border,
        backgroundColor: on ? (shape.lines ? colors.surfacePressed : withAlpha(colors.primary, 0.14)) : pressed ? colors.surfaceAlt : colors.surface,
        opacity: disabled ? 0.45 : 1,
        boxShadow: on && shape.glow ? `0px 0px 10px ${withAlpha(colors.primary, 0.5)}` : undefined,
      })}
    >
      <Text
        variant={mono ? 'mono' : 'label'}
        color={on ? ink : colors.text}
        style={mono || fit ? { fontSize: 13 } : { fontSize: 14 }}
        numberOfLines={fit ? 1 : undefined}
        adjustsFontSizeToFit={fit}
      >
        {label}
      </Text>
      {count ? (
        <View style={{ minWidth: 20, height: 20, paddingHorizontal: 6, marginLeft: 6, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
          <Text variant="caption" color={colors.onPrimary} style={{ fontSize: 12, ...font('700') }}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function Row({ children, style, wrap, onLayout }: { children: ReactNode; style?: StyleProp<ViewStyle>; wrap?: boolean; onLayout?: ViewProps['onLayout'] }) {
  // In a list of options, a row of buttons that wraps is a list of rows, one under the other.
  const rows = useContext(ButtonsAs) === 'rows';
  if (rows && wrap) return <View onLayout={onLayout}>{children}</View>;
  return (
    <View onLayout={onLayout} style={[{ flexDirection: 'row', alignItems: 'center', gap: space.sm }, wrap && { flexWrap: 'wrap' }, style]}>
      {children}
    </View>
  );
}

export function Field({ label, hint, children }: { label?: string; hint?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="label" tone="muted">
          {label}
        </Text>
      ) : null}
      {children}
      {hint ? (
        <Text variant="caption" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** A text field. In a row beside a button, give it `style={{ flex: 1 }}`. A secret one (a
 *  password, PIN or token) is never offered to the phone's password manager: one that kept two
 *  passwords for Erevos would show there is a second space, and one kept the PIN of hidden chats.
 *  It has an eye beside what is typed, which shows it, and hides it again: hidden each time the
 *  field shows anew. Shown, the keyboard still learns nothing of it, as far as the phone lets. */
export function Input({ style, onSubmitEditing, ...inputProps }: TextInputProps) {
  const colors = useColors();
  // The keyboard's Enter, where it acts, is felt.
  const props: TextInputProps = {
    ...inputProps,
    onSubmitEditing: onSubmitEditing
      ? (event) => {
          press();
          onSubmitEditing(event);
        }
      : undefined,
  };
  const [visible, setVisible] = useState(false);
  const secret = !!props.secureTextEntry;
  const look: StyleProp<TextStyle> = [
    {
      minHeight: 50,
      paddingVertical: 12,
      paddingHorizontal: space.md,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: shape.ink?.fieldLine ?? colors.border,
      color: colors.text,
      fontSize: 16,
    },
    fontStyle('400'),
    webNoOutline,
  ];
  if (!secret) return <TextInput placeholderTextColor={colors.textFaint} {...props} style={[look, style]} />;
  // Where the field sits (flex, margins, width) goes to the row that holds it and its eye; how it looks stays with it.
  const { place, rest } = splitPlace(StyleSheet.flatten(style) ?? {});
  return (
    <View style={[{ justifyContent: 'center' }, place]}>
      <TextInput
        placeholderTextColor={colors.textFaint}
        importantForAutofill="no"
        {...props}
        secureTextEntry={!visible}
        autoCorrect={false}
        spellCheck={false}
        // Android's keyboards offer no words and keep none for a field of this kind.
        {...(visible && Platform.OS === 'android' && !props.keyboardType ? { keyboardType: 'visible-password' as const } : {})}
        style={[look, rest, { paddingRight: 52 }]}
      />
      <Pressable
        onPress={() => setVisible((was) => !was)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={visible ? t('Hide what is typed') : t('Show what is typed')}
        style={{ position: 'absolute', right: 6, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
      >
        <EyeIcon color={colors.textFaint} crossed={visible} />
      </Pressable>
    </View>
  );
}

// The keys of a style that say where a view sits, not how it looks.
const PLACE_KEYS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'width', 'minWidth', 'maxWidth',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical', 'marginStart', 'marginEnd',
  'position', 'top', 'bottom', 'left', 'right', 'zIndex',
]);

function splitPlace(style: TextStyle): { place: ViewStyle; rest: TextStyle } {
  const place: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) (PLACE_KEYS.has(key) ? place : rest)[key] = value;
  return { place: place as ViewStyle, rest: rest as TextStyle };
}

/** A section's kicker, above its card. */
export function SectionTitle({ title }: { title: string }) {
  return (
    <Text variant="overline" tone="muted" style={{ marginTop: space.sm, paddingHorizontal: 2 }}>
      {title}
    </Text>
  );
}

// Buttons in a list of options (OptionList) are drawn as its rows: the same buttons, from the same
// parts of a chat (its notices, its timer, its PIN…), in one tidy column wherever they are. A sheet
// opened from one draws its own buttons as buttons again.
const ButtonsAs = createContext<'buttons' | 'rows'>('buttons');

/**
 * A chat's options as a list (#44): every button in it is a row the width of the list, its label at
 * the start and what it is set to (after " · ") at the end, with a line between rows.
 */
export function OptionList({ title, children }: { title?: string; children: ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ gap: 6 }}>
      {title ? <SectionTitle title={title} /> : null}
      <ButtonsAs.Provider value="rows">
        <View style={{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: shape.cardBorder, borderColor: colors.border }}>{children}</View>
      </ButtonsAs.Provider>
    </View>
  );
}

/** One row of an OptionList: tapped, it does what its button would. */
export function OptionRow({ title, onPress, onLongPress, disabled, danger }: { title: string; onPress: () => void; onLongPress?: () => void; disabled?: boolean; danger?: boolean }) {
  const colors = useColors();
  const at = title.lastIndexOf(' · ');
  const label = at > 0 ? title.slice(0, at) : title;
  const value = at > 0 ? title.slice(at + 3) : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={
        disabled
          ? undefined
          : () => {
              tap();
              onPress();
            }
      }
      onLongPress={onLongPress}
      disabled={disabled && !onLongPress}
      style={({ pressed }) => ({
        minHeight: 50,
        paddingHorizontal: space.lg,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        backgroundColor: pressed ? withAlpha(colors.text, 0.06) : 'transparent',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        opacity: disabled ? 0.45 : 1,
      })}
    >
      <Text color={danger ? colors.danger : undefined} style={{ flex: 1 }}>
        {label}
      </Text>
      {value ? (
        <Text variant="caption" tone="muted" numberOfLines={1} style={{ maxWidth: '45%' }}>
          {value}
        </Text>
      ) : null}
      <Text tone="faint" importantForAccessibility="no">
        ›
      </Text>
    </Pressable>
  );
}

/** A sheet that rises from the bottom over a dimmed screen. */
export function Sheet({ visible, onClose, title, children }: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const colors = useColors();
  const blur = useGlassBlur();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* The sheet rises with the keyboard, so its fields stay in sight. One taller than the
          screen stops below the status bar and scrolls. */}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'flex-end', paddingTop: insets.top + space.sm, backgroundColor: colors.overlay }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel={t('Close')} />
        <View
          style={[
            {
              flexShrink: 1,
              gap: 10,
              padding: space.xl - 4,
              paddingBottom: Math.max(space.xxl, insets.bottom + space.lg),
              backgroundColor: colors.popover,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              // Modernist's rules, or the glass's edge, as the site's pop-overs.
              borderWidth: shape.glass ? 1 : shape.cardBorder > 1 ? shape.cardBorder : 0,
              borderBottomWidth: 0,
              borderColor: colors.border,
              width: '100%',
              maxWidth: 760,
              alignSelf: 'center',
            },
            blur,
          ]}
        >
          {title ? (
            <Text variant="heading" style={{ marginBottom: 4 }}>
              {title}
            </Text>
          ) : null}
          <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ gap: 10 }} keyboardShouldPersistTaps="handled">
            <ButtonsAs.Provider value="buttons">{children}</ButtonsAs.Provider>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
