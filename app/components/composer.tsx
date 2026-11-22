// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useIsFocused } from 'expo-router';
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { ActivityIndicator, BackHandler, Keyboard, Modal, Platform, Pressable, ScrollView, TextInput, View, useWindowDimensions, type AccessibilityActionEvent, type GestureResponderEvent, type NativeSyntheticEvent, type TextInputKeyPressEvent, type TextStyle, type HostInstance, type TextInputInstance } from 'react-native';

import { withDictated } from '../lib/dictate';
import { press, tap } from '../lib/haptics';
import { t } from '../lib/i18n';
import { setMicMode, useMicMode, type MicMode } from '../lib/mic-mode';
import { QUALITIES, qualityNote } from '../lib/photo-quality';
import type { PhotoQuality } from '../lib/pick-photo';
import { canWriteOut } from '../lib/speech';
import { radius, shape, space, withAlpha, type Colors } from '../theme/colors';
import { useTheme } from '../theme/context';
import { glassLift, glassSide } from '../theme/glass';

import { DictateSheet } from './dictate-sheet';
import { useGlassBlur } from './glass';
import {
  BackIcon,
  CameraIcon,
  ChevronIcon,
  CheckIcon,
  CloseIcon,
  DictateIcon,
  FileIcon,
  LaterIcon,
  LockIcon,
  MicIcon,
  PencilIcon,
  PersonIcon,
  PhotoIcon,
  PlaceIcon,
  PlusIcon,
  PollIcon,
  QuietIcon,
  SendIcon,
  ShieldIcon,
  SmileIcon,
  SmsIcon,
  StopwatchIcon,
  TalkieIcon,
} from './icons';
import { dismissKeyboard } from './keyboard';
import { buttonColors, Chip, fontStyle, Text, Toggle } from './ui';

// The message bar under a chat's thread, a contact's (app/chat.tsx) or a group's (components/group-chat.tsx):
// one floating bar of glass with "+" for the panel under it, the field, the sticker button at the
// field's end, the stopwatch for a message that disappears (contacts' chats only), and one round
// button: the microphone, held to record a voice message, which turns into the send arrow once
// something is typed. Held down, the arrow offers more ways to send (without sound, later, …),
// which TalkBack offers as actions too. What the next message is (an answer to one, sent later,
// Talkie, disappearing) shows in strips inside the top of the bar, the answer above the rest.
//
// "+" opens the panel where the keyboard would be, so the bar and what is typed stay in view: what
// to send (photo, camera, file, sticker, place, poll) as a grid of tiles, then how it goes, as rows.
// While the panel is open "+" is a cross that closes it, and tapping the field closes it too.
//
// The microphone records only while it is held. Sliding left lets go of the recording; a press
// just after the arrow turned back into the microphone (a double tap on send) does nothing, and a
// screen reader starts and stops recording with a tap each, as holding is hard with one.

/** How long after the send arrow turns back into the microphone a press on it does nothing, ms. */
const MIC_REST_MS = 600;
// Let go of the microphone sooner than this, where it can also write, and it was a tap: its menu opens.
const MIC_TAP_MS = 250;

// What the microphone can do, in its menu (lib/mic-mode.ts).
const MIC_MODES: { mode: MicMode; icon: ComponentType<{ color: string; size?: number }>; title: () => string; hint: () => string }[] = [
  { mode: 'voice', icon: MicIcon, title: () => t('Voice message'), hint: () => t('Hold the microphone to record, and let go to send.') },
  { mode: 'write', icon: DictateIcon, title: () => t('Speak to write'), hint: () => t('Hold the microphone, and the words go into the field.') },
];
/** How far left the finger slides, holding the microphone, to let go of the recording, px. */
const CANCEL_SLIDE = 96;
/** The bar's corners where the style rounds them; square styles keep theirs. */
const BAR_ROUND = 26;

/** The icons the panel's tiles and rows, and the send arrow's menu, are drawn with. */
export type ComposerIcon = 'photo' | 'camera' | 'file' | 'sticker' | 'place' | 'poll' | 'timer' | 'talkie' | 'later' | 'sms' | 'quiet' | 'collection' | 'contact';

const ICONS: Record<ComposerIcon, ComponentType<{ color: string; size?: number }>> = {
  photo: PhotoIcon,
  camera: CameraIcon,
  file: FileIcon,
  sticker: SmileIcon,
  place: PlaceIcon,
  poll: PollIcon,
  timer: StopwatchIcon,
  talkie: TalkieIcon,
  later: LaterIcon,
  sms: SmsIcon,
  quiet: QuietIcon,
  collection: LockIcon,
  contact: PersonIcon,
};

/** Something to send, a tile of the panel's grid. */
export interface ComposerTile {
  key: string;
  title: string;
  icon: ComposerIcon;
  onPress: () => void;
}

/** A way for the next message to go, a row of the panel under its tiles. */
export interface ComposerWay {
  key: string;
  title: string;
  /** One line under the title, cut short where it does not fit, so what matters goes first. */
  description: string;
  icon: ComposerIcon;
  /** A grey tile, not the accent's: the one way that is not end-to-end encrypted (an SMS). */
  plain?: boolean;
  /** What it is set to, beside its arrow ("Off", "1 hour"). */
  value?: string;
  /** A switch in place of the arrow, on or off. */
  on?: boolean;
  onPress: () => void;
}

/** A way to send what is typed, in the send arrow's menu. */
export interface SendWay {
  key: string;
  title: string;
  icon: ComposerIcon;
  /** Said by a screen reader, and nowhere else. */
  hint?: string;
  onPress: () => void;
}

/** The microphone: `start` once it is pressed, `stop` once let go, or `stop(true)` to let the recording go. */
export interface VoiceControl {
  /** While it records (the recorder is ready). */
  recording: boolean;
  start: () => void;
  stop: (cancel: boolean) => void;
}

/** The next message disappears, `seconds` after it is read, until turned off. */
export interface Vanish {
  on: boolean;
  seconds: number;
  /** The times it can be, and how each is said. */
  choices: number[];
  label: (seconds: number) => string;
  onToggle: () => void;
  onChoose: (seconds: number) => void;
}

/** The message of ours the bar gives new words, by its line, and how to stop editing it. */
export interface Editing {
  line: string;
  onClose: () => void;
}

/** The message the next one answers, and who wrote it. */
export interface Answering {
  name: string;
  line: string;
  onPress: () => void;
  onClose: () => void;
}

/** A tint of the accent, or Nocturne's wash where the style draws lines instead of fills. */
function tint(colors: Colors, alpha: number): string {
  return shape.lines ? colors.surfacePressed : withAlpha(colors.primary, alpha);
}

/** A round button the size of a finger: 44 across at least. */
export function IconButton({ label, onPress, onLongPress, children, state, role = 'button', width = 44, disabled }: {
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
  children: ReactNode;
  state?: { checked?: boolean; expanded?: boolean };
  role?: 'button' | 'switch';
  width?: number;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={state}
      style={({ pressed }) => ({
        width,
        height: 44,
        borderRadius: radius.pill > 100 ? 22 : radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? colors.surfacePressed : 'transparent',
        opacity: disabled ? 0.45 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

/**
 * The round Send of a bar of its own, as the chat bar's (app/sms.tsx): it leaves the field the
 * width a word would take, on a narrow phone with large letters too. `busy`: a spinner in its place.
 */
export function SendDisc({ onPress, onLongPress, disabled, busy }: { onPress: () => void; onLongPress?: () => void; disabled?: boolean; busy?: boolean }) {
  const { colors } = useTheme();
  const button = buttonColors('primary', colors);
  return (
    <Pressable
      onPress={
        disabled
          ? undefined
          : () => {
              press();
              onPress();
            }
      }
      onLongPress={onLongPress}
      delayLongPress={350}
      disabled={(disabled && !onLongPress) || busy}
      accessibilityRole="button"
      accessibilityLabel={t('Send')}
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
      style={({ pressed }) => [
        disc(button.line),
        { backgroundColor: pressed ? button.pressed : button.bg, opacity: disabled ? 0.45 : 1 },
        shape.glow && !disabled ? { boxShadow: `0px 0px 14px ${withAlpha(colors.primary, 0.55)}` } : null,
      ]}
    >
      {busy ? <ActivityIndicator color={button.fg} /> : <SendIcon color={button.fg} cut={button.line ? 'transparent' : button.bg} size={22} />}
    </Pressable>
  );
}

/** A strip inside the top of the bar: what the next message is. `first`: the topmost, rounded as the bar. */
function Strip({ first, icon, children, onClose, closeLabel }: {
  first: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  closeLabel: string;
}) {
  const { colors } = useTheme();
  const top = Math.max(0, Math.min(BAR_ROUND, radius.xl) - 4);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        minHeight: 40,
        paddingLeft: space.md,
        borderTopLeftRadius: first ? top : Math.min(10, radius.md),
        borderTopRightRadius: first ? top : Math.min(10, radius.md),
        borderBottomLeftRadius: Math.min(10, radius.md),
        borderBottomRightRadius: Math.min(10, radius.md),
        backgroundColor: tint(colors, 0.18),
      }}
    >
      {icon}
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
        style={({ pressed }) => ({ width: 44, height: 44, marginVertical: -2, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
      >
        <CloseIcon color={colors.accentText} size={18} />
      </Pressable>
    </View>
  );
}

/** A minute and its seconds: 0:07. */
const clockOf = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

export interface ComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  maxLength: number;
  /** Enter sends what is typed (a contact's chat), or starts a new line (a group). */
  enterSends?: boolean;
  onSend: () => void;
  /** Held down, the send arrow offers these; so do TalkBack's actions on it. */
  sendWays?: SendWay[];
  voice: VoiceControl;
  /** Talkie is on: the microphone's hold plays on their phone as it comes, until `onOff`. */
  talkie?: { on: boolean; onOff: () => void } | null;
  vanish?: Vanish | null;
  answering?: Answering | null;
  /** The bar edits one of ours: what it sends gives that message new words. */
  editing?: Editing | null;
  /** The next photo, file or voice message goes later: `line` says when. */
  later?: { line: string; onCancel: () => void } | null;
  onSticker?: () => void;
  /** What "+" opens under the bar (ComposerPanel). */
  panel?: ReactNode;
  panelOpen: boolean;
  onPanel: (open: boolean) => void;
}

export function Composer({
  value,
  onChangeText,
  placeholder,
  maxLength,
  enterSends = false,
  onSend,
  sendWays = [],
  voice,
  talkie,
  vanish,
  answering,
  editing,
  later,
  onSticker,
  panel,
  panelOpen,
  onPanel,
}: ComposerProps) {
  const { colors, look, scheme } = useTheme();
  const blur = useGlassBlur();
  const window = useWindowDimensions();
  const input = useRef<TextInputInstance>(null);
  const bar = useRef<HostInstance>(null);
  const canSend = value.trim().length > 0;
  const button = buttonColors('primary', colors);
  // Dictation (components/dictate-sheet.tsx): open, and what is in the field as the words come.
  const [dictating, setDictating] = useState(false);
  const typed = useRef(value);
  typed.current = value;
  const canDictate = canWriteOut();
  // What the microphone does when held (lib/mic-mode.ts): a tap on it opens a menu to choose.
  // With Talkie on, or where nothing can be written out, it only records, as before.
  const micMode = useMicMode();
  const micChooses = canDictate && !talkie?.on;
  const micWrites = micChooses && micMode === 'write';
  // A press is a tap until it is held this long; then it records, or listens to write.
  const pressing = useRef<ReturnType<typeof setTimeout> | null>(null);
  function dictated(words: string) {
    onChangeText(withDictated(typed.current, words, maxLength));
    // The field takes the keyboard, so the words can be changed at once.
    setTimeout(() => input.current?.focus(), 350);
  }
  // While the microphone is held (or, for a screen reader, on), from when, and how far it slid left.
  const [holding, setHolding] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [since, setSince] = useState(0);
  const [now, setNow] = useState(0);
  const [slide, setSlide] = useState(0);
  const held = useRef({ on: false, tapped: false, ignored: false, x: 0 });
  // A press on the microphone before then does nothing (just after sending).
  const restUntil = useRef(0);
  const sent = useRef(canSend);
  const [menuAt, setMenuAt] = useState<{ bottom: number; right: number } | null>(null);
  // Which menu shows there: the ways to send (Send held), or what the microphone does (tapped).
  const [menuOf, setMenuOf] = useState<'send' | 'mic'>('send');
  const [choosing, setChoosing] = useState(false);
  // The field's height on the web, where it does not grow by itself.
  const [fieldHeight, setFieldHeight] = useState(44);

  useEffect(() => {
    if (sent.current && !canSend) restUntil.current = Date.now() + MIC_REST_MS;
    sent.current = canSend;
    if (!value) setFieldHeight(44);
  }, [canSend, value]);

  // The recording's time, while it records.
  useEffect(() => {
    if (!holding) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [holding]);

  // Stopped by the chat (a minute is the most), while still held: the bar shows the field again.
  const wasRecording = useRef(false);
  useEffect(() => {
    if (wasRecording.current && !voice.recording && held.current.on) {
      held.current.on = false;
      held.current.tapped = false;
      setHolding(false);
      setTapped(false);
    }
    wasRecording.current = voice.recording;
    if (voice.recording) setSince(Date.now());
  }, [voice.recording]);

  useEffect(() => {
    if (!vanish?.on) setChoosing(false);
  }, [vanish?.on]);

  // Android's back closes the panel first, as it closed the sheet that was there before it, but
  // only on the screen in view: a screen opened over this one (a group's details, the SMS
  // conversation) goes back as usual, and once this one shows again back closes its panel. The
  // latest `onPanel` is read when back is pressed, so a new one each render adds nothing again.
  const focused = useIsFocused();
  const closePanel = useRef(onPanel);
  closePanel.current = onPanel;
  useEffect(() => {
    if (!panelOpen || !focused) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      closePanel.current(false);
      return true;
    });
    return () => back.remove();
  }, [panelOpen, focused]);

  function openPanel(open: boolean) {
    if (open) {
      Keyboard.dismiss();
      input.current?.blur();
    }
    onPanel(open);
  }

  function buzz() {
    tap();
  }

  // Starts recording, held (`tapped` false) or for a screen reader, on until tapped again.
  function begin(tap: boolean) {
    if (Date.now() < restUntil.current) {
      held.current.ignored = true;
      return;
    }
    held.current = { ...held.current, on: true, tapped: tap, ignored: false };
    setHolding(true);
    setTapped(tap);
    setSlide(0);
    setSince(Date.now());
    setNow(Date.now());
    buzz();
    voice.start();
  }

  // Lets go: sends what was recorded, or with `cancel` lets it go.
  function end(cancel: boolean) {
    if (held.current.ignored) {
      held.current.ignored = false;
      return;
    }
    if (!held.current.on) return;
    held.current = { ...held.current, on: false, tapped: false };
    setHolding(false);
    setTapped(false);
    setSlide(0);
    if (cancel) buzz();
    voice.stop(cancel);
  }

  const mic = {
    onStartShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (event: GestureResponderEvent) => {
      held.current.x = event.nativeEvent.pageX;
      if (held.current.tapped) return;
      if (!micChooses) {
        begin(false);
        return;
      }
      // Just after a send (a double tap on Send), a tap opens no menu and a hold records nothing.
      if (Date.now() < restUntil.current) {
        held.current.ignored = true;
        return;
      }
      // Held a moment: it records, or listens to write; let go before, it was a tap (onResponderRelease).
      if (pressing.current) clearTimeout(pressing.current);
      pressing.current = setTimeout(() => {
        pressing.current = null;
        if (micWrites) {
          buzz();
          setDictating(true);
        } else begin(false);
      }, MIC_TAP_MS);
    },
    onResponderMove: (event: GestureResponderEvent) => {
      if (!held.current.on || held.current.tapped) return;
      const dx = Math.min(0, event.nativeEvent.pageX - held.current.x);
      setSlide(dx);
      if (dx < -CANCEL_SLIDE) end(true);
    },
    onResponderRelease: () => {
      if (pressing.current) {
        clearTimeout(pressing.current);
        pressing.current = null;
        openMenu('mic');
        return;
      }
      if (held.current.tapped) return;
      end(false);
    },
    // Taken away by the system (a call, the notification shade): the recording goes. Before the
    // microphone was ready (its permission asked the first time), it was too short, and says to hold.
    onResponderTerminate: () => {
      if (pressing.current) {
        clearTimeout(pressing.current);
        pressing.current = null;
        return;
      }
      if (!held.current.tapped) end(voice.recording);
    },
  };

  function onMicAction(event: AccessibilityActionEvent) {
    const name = event.nativeEvent.actionName;
    if (name === 'activate') {
      if (held.current.on) end(false);
      else if (micWrites) setDictating(true);
      else begin(true);
    } else if (name === 'cancel') end(true);
    else if (name === 'choose') openMenu('mic');
  }

  // Chosen in the microphone's menu: kept for every bar; to write, it listens at once too.
  function chooseMic(mode: MicMode) {
    setMenuAt(null);
    setMicMode(mode);
    if (mode === 'write') setDictating(true);
  }

  // The menu opens over the bar where it sits once the keyboard has closed: measured while the
  // keyboard is still going down, it would float a keyboard's height above the arrow.
  function openMenu(of: 'send' | 'mic' = 'send') {
    if (of === 'send' && sendWays.length === 0) return;
    setMenuOf(of);
    press();
    const fallback = { bottom: 96, right: space.sm };
    void dismissKeyboard().then(() => {
      if (!bar.current) {
        setMenuAt(fallback);
        return;
      }
      bar.current.measureInWindow((x, y, width, height) => {
        if (!width && !height) setMenuAt(fallback);
        else setMenuAt({ bottom: Math.max(space.sm, window.height - y + 6), right: Math.max(space.sm, window.width - (x + width)) });
      });
    });
  }

  function onSendAction(event: AccessibilityActionEvent) {
    const name = event.nativeEvent.actionName;
    if (name === 'longpress') openMenu();
    else sendWays.find((way) => way.key === name)?.onPress();
  }

  // On a computer Enter sends and Shift+Enter starts a new line; on a phone the keyboard's own key sends.
  function onKeyPress(event: TextInputKeyPressEvent) {
    const key = event.nativeEvent as TextInputKeyPressEvent['nativeEvent'] & { shiftKey?: boolean; isComposing?: boolean };
    if (key.key !== 'Enter' || key.shiftKey || key.isComposing) return;
    (event as unknown as { preventDefault: () => void }).preventDefault();
    onSend();
  }

  const lift = look.look === 'glass' ? glassLift(glassSide(scheme)) : `0px 2px 12px ${withAlpha('#000000', scheme === 'dark' ? 0.4 : 0.12)}`;
  const barRadius = radius.pill > 100 ? BAR_ROUND : radius.pill;
  const strips: ReactNode[] = [];
  if (editing) {
    strips.push(
      <Strip key="edit" first={strips.length === 0} icon={<PencilIcon color={colors.accentText} size={18} />} onClose={editing.onClose} closeLabel={t('Cancel')}>
        <View style={{ paddingVertical: 4 }}>
          <Text variant="label" color={colors.accentText} numberOfLines={1} style={{ fontSize: 13 }}>
            {t('Edit message')}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {editing.line}
          </Text>
        </View>
      </Strip>,
    );
  }
  if (answering) {
    strips.push(
      <Strip key="answer" first={strips.length === 0} onClose={answering.onClose} closeLabel={t('Cancel')}>
        <Pressable
          onPress={answering.onPress}
          accessibilityRole="button"
          accessibilityHint={t('Goes to the message it answers')}
          style={{ borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: space.sm, paddingVertical: 4 }}
        >
          <Text variant="label" color={colors.accentText} numberOfLines={1} style={{ fontSize: 13 }}>
            {answering.name}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {answering.line || t('The message is not on this phone.')}
          </Text>
        </Pressable>
      </Strip>,
    );
  }
  if (later) {
    strips.push(
      <Strip key="later" first={strips.length === 0} icon={<LaterIcon color={colors.accentText} size={18} />} onClose={later.onCancel} closeLabel={t('Cancel')}>
        <Text variant="caption" color={colors.accentText} numberOfLines={2} style={stripText}>
          {later.line}
        </Text>
      </Strip>,
    );
  }
  if (talkie?.on) {
    strips.push(
      <Strip key="talkie" first={strips.length === 0} icon={<TalkieIcon color={colors.accentText} size={18} />} onClose={talkie.onOff} closeLabel={t('Turn Talkie off')}>
        <Text variant="caption" color={colors.accentText} numberOfLines={1} style={stripText}>
          {t('Talkie is on')}
        </Text>
      </Strip>,
    );
  }
  if (vanish?.on) {
    // The sentence around the time, in the language's own order: "Disappears [1 hour ▾] after it is read".
    const [before, after = ''] = t('Disappears {time} after it is read', { time: '\u0000' }).split('\u0000');
    strips.push(
      <Strip key="vanish" first={strips.length === 0} icon={<StopwatchIcon color={colors.accentText} size={18} />} onClose={vanish.onToggle} closeLabel={t('Turn off disappearing')}>
        {choosing ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, alignItems: 'center', paddingVertical: 4 }} keyboardShouldPersistTaps="handled">
            {vanish.choices.map((seconds) => (
              <Chip
                key={seconds}
                label={vanish.label(seconds)}
                selected={seconds === vanish.seconds}
                onPress={() => {
                  vanish.onChoose(seconds);
                  setChoosing(false);
                }}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            {before.trim() ? (
              <Text variant="caption" color={colors.accentText} style={stripText}>
                {before.trim()}
              </Text>
            ) : null}
            <Pressable
              onPress={() => setChoosing(true)}
              accessibilityRole="button"
              accessibilityLabel={t('Disappears {time} after it is read', { time: vanish.label(vanish.seconds) })}
              accessibilityHint={t('Changes how long')}
              hitSlop={{ top: 8, bottom: 8 }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                height: 28,
                marginHorizontal: 4,
                paddingLeft: 10,
                paddingRight: 6,
                borderRadius: radius.chip > 100 ? 14 : radius.chip,
                backgroundColor: pressed ? colors.surfacePressed : tint(colors, 0.3),
              })}
            >
              <Text variant="label" color={colors.accentText} style={{ fontSize: 13 }}>
                {vanish.label(vanish.seconds)}
              </Text>
              <ChevronIcon color={colors.accentText} size={14} down />
            </Pressable>
            {after.trim() ? (
              <Text variant="caption" color={colors.accentText} style={stripText}>
                {after.trim()}
              </Text>
            ) : null}
          </View>
        )}
      </Strip>,
    );
  }

  const talkieOn = !!talkie?.on;
  const elapsed = voice.recording ? now - since : 0;
  return (
    <View>
      <View
        ref={bar}
        style={[
          {
            marginHorizontal: space.sm,
            marginTop: space.xs,
            marginBottom: space.sm,
            padding: 4,
            gap: 4,
            borderRadius: barRadius,
            backgroundColor: colors.sheet,
            borderWidth: 1,
            borderColor: colors.border,
            boxShadow: lift,
          },
          blur,
        ]}
      >
        {strips}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          {holding ? (
            <View style={{ flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingLeft: space.md }} accessibilityLiveRegion="polite">
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger }} />
              <Text variant="bodyStrong" style={{ minWidth: 44, fontVariant: ['tabular-nums'] }}>
                {clockOf(elapsed)}
              </Text>
              {tapped ? (
                <Pressable onPress={() => end(true)} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: space.sm }}>
                  <Text variant="label" color={colors.accentText}>
                    {t('Cancel')}
                  </Text>
                </Pressable>
              ) : (
                <Text
                  variant="caption"
                  tone="muted"
                  numberOfLines={1}
                  style={{ flex: 1, transform: [{ translateX: slide * 0.6 }], opacity: Math.max(0.25, 1 + slide / CANCEL_SLIDE) }}
                >
                  {`‹  ${t('Slide left to cancel')}`}
                </Text>
              )}
            </View>
          ) : (
            <>
              <IconButton label={panelOpen ? t('Close') : t('Attach and more')} onPress={() => openPanel(!panelOpen)} state={{ expanded: panelOpen }}>
                {panelOpen ? <CloseIcon color={colors.text} size={20} /> : <PlusIcon color={colors.text} size={20} />}
              </IconButton>
              <View style={{ flex: 1, minWidth: 0 }}>
                <TextInput
                  ref={input}
                  value={value}
                  onChangeText={onChangeText}
                  accessibilityLabel={placeholder}
                  maxLength={maxLength}
                  multiline
                  onFocus={() => {
                    if (panelOpen) onPanel(false);
                  }}
                  submitBehavior={enterSends ? 'submit' : undefined}
                  returnKeyType={enterSends ? 'send' : 'default'}
                  onSubmitEditing={
                    enterSends
                      ? () => {
                          press();
                          onSend();
                        }
                      : undefined
                  }
                  onKeyPress={enterSends && Platform.OS === 'web' ? onKeyPress : undefined}
                  onContentSizeChange={(event) => setFieldHeight(Math.min(140, Math.max(44, Math.ceil(event.nativeEvent.contentSize.height))))}
                  style={[
                    {
                      minHeight: 44,
                      maxHeight: 140,
                      paddingTop: 11,
                      paddingBottom: 11,
                      paddingHorizontal: 4,
                      color: colors.text,
                      fontSize: 16,
                      lineHeight: 22,
                      textAlignVertical: 'center',
                    },
                    Platform.OS === 'web' ? ({ height: fieldHeight, outlineStyle: 'none', resize: 'none' } as unknown as TextStyle) : null,
                    fontStyle('400'),
                  ]}
                />
                {/* What the field is for, on one line and cut short where the name is long: a
                    placeholder of the field's own would wrap, and make the empty bar two lines tall. */}
                {value ? null : (
                  <View
                    pointerEvents="none"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={{ position: 'absolute', left: 4, right: 4, top: 0, height: 44, justifyContent: 'center' }}
                  >
                    <Text numberOfLines={1} color={colors.textFaint} style={{ fontSize: 16, lineHeight: 22, fontWeight: '400' }}>
                      {talkieOn ? t('Hold to talk') : placeholder}
                    </Text>
                  </View>
                )}
              </View>
              {onSticker ? (
                <IconButton
                  label={t('Send a sticker')}
                  onPress={() => {
                    // The stickers open over the thread, with the panel closed, in a group as in a contact's chat.
                    if (panelOpen) onPanel(false);
                    onSticker();
                  }}
                >
                  <SmileIcon color={colors.textMuted} size={22} />
                </IconButton>
              ) : null}
              {vanish ? (
                <IconButton label={t('Disappearing message')} onPress={vanish.onToggle} role="switch" state={{ checked: vanish.on }}>
                  {vanish.on ? (
                    <View style={{ width: 36, height: 36, borderRadius: radius.pill > 100 ? 18 : radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: tint(colors, 0.34) }}>
                      <StopwatchIcon color={colors.accentText} size={22} />
                    </View>
                  ) : (
                    <StopwatchIcon color={colors.textMuted} size={22} />
                  )}
                </IconButton>
              ) : null}
            </>
          )}
          {canSend && !holding ? (
            <Pressable
              onPress={() => {
                // Felt at once, as the press is taken, before the message shows.
                buzz();
                onSend();
              }}
              onLongPress={sendWays.length > 0 ? () => openMenu() : undefined}
              delayLongPress={350}
              accessibilityRole="button"
              accessibilityLabel={t('Send')}
              accessibilityHint={sendWays.length > 0 ? t('Hold for more ways to send') : undefined}
              accessibilityActions={sendWays.length > 0 ? [{ name: 'longpress', label: t('More ways to send') }, ...sendWays.map((way) => ({ name: way.key, label: way.title }))] : undefined}
              onAccessibilityAction={onSendAction}
              style={({ pressed }) => [
                disc(button.line),
                { backgroundColor: pressed ? button.pressed : button.bg },
                shape.glow ? { boxShadow: `0px 0px 14px ${withAlpha(colors.primary, 0.55)}` } : null,
              ]}
            >
              <SendIcon color={button.fg} cut={button.line ? 'transparent' : button.bg} size={22} />
            </Pressable>
          ) : (
            <View
              {...mic}
              accessible
              accessibilityRole="button"
              accessibilityLabel={holding ? t('Stop and send') : talkieOn ? t('Talk with Talkie') : micWrites ? t('Speak to write') : t('Record a voice message')}
              accessibilityHint={holding ? undefined : talkieOn ? t('Hold while you talk; it plays on their phone as it comes.') : micWrites ? t('Hold to speak, and the words go into the field. Tap to choose a voice message instead.') : micChooses ? t('Hold to record, and let go to send. Tap to choose speaking to write instead.') : t('Hold to record, and let go to send.')}
              accessibilityState={{ busy: holding }}
              accessibilityActions={[
                { name: 'activate', label: holding ? t('Stop and send') : micWrites ? t('Speak to write') : t('Start recording') },
                ...(holding ? [{ name: 'cancel', label: t('Cancel recording') }] : []),
                ...(micChooses && !holding ? [{ name: 'choose', label: t('What the microphone does') }] : []),
              ]}
              onAccessibilityAction={onMicAction}
              style={[
                disc(button.line),
                { backgroundColor: holding ? colors.primaryPressed : button.bg, transform: [{ scale: holding ? 1.12 : 1 }] },
                shape.glow ? { boxShadow: `0px 0px 14px ${withAlpha(colors.primary, 0.55)}` } : null,
              ]}
            >
              {talkieOn ? <TalkieIcon color={holding ? colors.onPrimary : button.fg} size={22} /> : micWrites ? <DictateIcon color={button.fg} size={22} /> : <MicIcon color={holding ? colors.onPrimary : button.fg} size={22} />}
            </View>
          )}
        </View>
      </View>
      {panelOpen && panel ? panel : null}
      {/* Mounted only while open, so a bar holds no second recorder for it. */}
      {dictating ? <DictateSheet open onWords={dictated} onClose={() => setDictating(false)} /> : null}
      <Modal visible={menuAt !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setMenuAt(null)}>
        {/* A light dim under the menu, so it reads over the thread. */}
        <Pressable style={{ flex: 1, backgroundColor: withAlpha('#000000', scheme === 'dark' ? 0.32 : 0.16) }} onPress={() => setMenuAt(null)} accessibilityLabel={t('Close')} />
        {menuAt ? (
          <View
            accessibilityRole="menu"
            style={[
              {
                position: 'absolute',
                bottom: menuAt.bottom,
                right: menuAt.right,
                minWidth: 232,
                maxWidth: window.width - 2 * space.lg,
                borderRadius: Math.min(radius.lg, 18),
                overflow: 'hidden',
                // On the ground, so what is behind it does not show through the glass.
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                boxShadow: lift,
              },
              blur,
            ]}
          >
            <View style={{ paddingVertical: 6, backgroundColor: colors.popover }}>
              {menuOf === 'mic'
                ? MIC_MODES.map((mode) => {
                    const Icon = mode.icon;
                    const on = micMode === mode.mode;
                    return (
                      <Pressable
                        key={mode.mode}
                        onPress={() => chooseMic(mode.mode)}
                        accessibilityRole="menuitem"
                        accessibilityState={{ selected: on }}
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: space.md,
                          minHeight: 56,
                          paddingVertical: space.sm,
                          paddingHorizontal: space.lg,
                          backgroundColor: pressed ? colors.surfacePressed : 'transparent',
                        })}
                      >
                        <Icon color={colors.accentText} size={22} />
                        <View style={{ flexShrink: 1, gap: 2 }}>
                          <Text variant="bodyStrong" style={{ fontSize: 15 }}>
                            {mode.title()}
                          </Text>
                          <Text variant="caption" tone="faint">
                            {mode.hint()}
                          </Text>
                        </View>
                        <View style={{ width: 20, marginLeft: 'auto' }}>{on ? <CheckIcon color={colors.accentText} size={20} /> : null}</View>
                      </Pressable>
                    );
                  })
                : null}
              {menuOf === 'send' && sendWays.map((way) => {
                const Icon = ICONS[way.icon];
                return (
                  <Pressable
                    key={way.key}
                    onPress={() => {
                      setMenuAt(null);
                      way.onPress();
                    }}
                    accessibilityRole="menuitem"
                    accessibilityHint={way.hint}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: space.md,
                      minHeight: 48,
                      paddingHorizontal: space.lg,
                      backgroundColor: pressed ? colors.surfacePressed : 'transparent',
                    })}
                  >
                    <Icon color={colors.accentText} size={22} />
                    <Text variant="bodyStrong" style={{ flexShrink: 1, fontSize: 15 }}>
                      {way.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

/**
 * What is typed in a message bar, kept by the bar itself (DraftComposer): typing then draws the
 * bar again, not the whole chat around it, which with a long thread is slow on an older phone.
 * The chat reads it and changes it through this; `useDraft` says when it empties or fills.
 */
export class DraftBox {
  private typed: string;
  /** The bar showing it, told of each change. */
  shown: ((text: string) => void) | null = null;
  /** Told when it empties or fills. */
  emptied: (empty: boolean) => void = () => undefined;

  constructor(typed: string) {
    this.typed = typed;
  }

  /** What is typed now. */
  text(): string {
    return this.typed;
  }

  /** Puts `next` in the bar, or what it makes of what is typed. */
  set(next: string | ((typed: string) => string)): void {
    const text = typeof next === 'function' ? next(this.typed) : next;
    if (text === this.typed) return;
    const was = !this.typed.trim();
    this.typed = text;
    this.shown?.(text);
    if (was !== !text.trim()) this.emptied(!text.trim());
  }
}

/** A message bar's DraftBox, starting with `initial`, and whether nothing is typed in it. */
export function useDraft(initial: () => string): { draft: DraftBox; empty: boolean } {
  const [draft] = useState(() => new DraftBox(initial()));
  const [empty, setEmpty] = useState(() => !draft.text().trim());
  draft.emptied = setEmpty;
  return { draft, empty };
}

/** The message bar (Composer), with what is typed kept in `draft`. */
export function DraftComposer({ draft, onChangeText, ...rest }: Omit<ComposerProps, 'value' | 'onChangeText'> & { draft: DraftBox; onChangeText?: (text: string) => void }) {
  const [value, setValue] = useState(() => draft.text());
  useEffect(() => {
    draft.shown = setValue;
    setValue(draft.text());
    return () => {
      if (draft.shown === setValue) draft.shown = null;
    };
  }, [draft]);
  return (
    <Composer
      {...rest}
      value={value}
      onChangeText={(text) => {
        draft.set(text);
        onChangeText?.(text);
      }}
    />
  );
}

const stripText: TextStyle = { fontSize: 13, lineHeight: 17, fontWeight: '500' };

/** The round button's shape: a disc, a square where the style is square, outlined where it draws lines. */
function disc(line?: string) {
  return {
    width: 44,
    height: 44,
    marginLeft: 2,
    borderRadius: radius.pill > 100 ? 22 : radius.pill,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: line ? 1 : 0,
    borderColor: line,
  };
}

/**
 * What "+" opens under the bar: the tiles of what to send, how photos go, then the ways the next
 * message can go, each a row with one line on what it does, and `foot` last. With `page`, that
 * instead (choosing when it goes, say), with a way back to the rest.
 */
export function ComposerPanel({ tiles, quality, ways = [], foot, page }: {
  tiles: ComposerTile[];
  quality?: { value: PhotoQuality; onChange: (quality: PhotoQuality) => void };
  ways?: ComposerWay[];
  foot?: string;
  page?: { title: string; onBack: () => void; children: ReactNode } | null;
}) {
  const { colors } = useTheme();
  const window = useWindowDimensions();
  const [qualities, setQualities] = useState(false);
  const rows: ComposerTile[][] = [];
  for (let i = 0; i < tiles.length; i += 3) rows.push(tiles.slice(i, i + 3));
  const square = Math.min(16, radius.lg);
  const shown = QUALITIES.find((q) => q.value === quality?.value);
  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        overflow: 'hidden',
      }}
    >
      <ScrollView
        style={{ maxHeight: Math.max(280, Math.round(window.height * 0.52)), backgroundColor: colors.popover, borderTopWidth: 1, borderColor: colors.border, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }}
        contentContainerStyle={{ paddingTop: space.sm, paddingBottom: space.md }}
        keyboardShouldPersistTaps="handled"
      >
        {page ? (
          <View style={{ gap: space.sm, paddingHorizontal: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: -space.sm }}>
              <IconButton label={t('Back')} onPress={page.onBack}>
                <BackIcon color={colors.text} size={22} />
              </IconButton>
              <Text variant="heading" style={{ flex: 1 }}>
                {page.title}
              </Text>
            </View>
            {page.children}
          </View>
        ) : (
          <>
            <Kicker title={t('What to send')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <ShieldIcon color={colors.success} size={11} />
                <Text variant="caption" tone="faint" style={{ fontSize: 12 }}>
                  {t('encrypted')}
                </Text>
              </View>
            </Kicker>
            <View style={{ paddingHorizontal: space.sm }}>
              {rows.map((row, r) => (
                <View key={r} style={{ flexDirection: 'row' }}>
                  {row.map((tile) => {
                    const Icon = ICONS[tile.icon];
                    return (
                      <Pressable
                        key={tile.key}
                        onPress={tile.onPress}
                        accessibilityRole="button"
                        accessibilityLabel={tile.title}
                        style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 6, paddingVertical: space.sm, borderRadius: square, backgroundColor: pressed ? colors.surfacePressed : 'transparent' })}
                      >
                        <View style={{ width: 52, height: 52, borderRadius: square, alignItems: 'center', justifyContent: 'center', backgroundColor: tint(colors, 0.22) }}>
                          <Icon color={colors.accentText} size={26} />
                        </View>
                        <Text variant="caption" numberOfLines={1} style={{ fontSize: 13, color: colors.text }}>
                          {tile.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {/* A row short of three keeps the tiles where the others are. */}
                  {Array.from({ length: 3 - row.length }, (_, i) => (
                    <View key={`gap-${i}`} style={{ flex: 1 }} />
                  ))}
                </View>
              ))}
            </View>
            {quality ? (
              <View style={{ paddingHorizontal: space.lg, gap: space.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <Text variant="caption" tone="muted" style={{ flex: 1 }}>
                    {t('Photo quality')}
                  </Text>
                  <Pressable
                    onPress={() => setQualities((open) => !open)}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('Photo quality')}: ${shown ? t(shown.label) : ''}`}
                    accessibilityState={{ expanded: qualities }}
                    style={{ minHeight: 44, justifyContent: 'center' }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 2,
                        height: 32,
                        paddingLeft: 12,
                        paddingRight: 8,
                        borderRadius: radius.chip > 100 ? 16 : radius.chip,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceAlt,
                      }}
                    >
                      <Text variant="label" style={{ fontSize: 13 }}>
                        {shown ? t(shown.label) : ''}
                      </Text>
                      <ChevronIcon color={colors.textMuted} size={14} down={!qualities} />
                    </View>
                  </Pressable>
                </View>
                {qualities && quality ? (
                  <View style={{ gap: space.xs, paddingBottom: space.xs }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                      {QUALITIES.map(({ value, label }) => (
                        <Chip key={label} label={t(label)} selected={quality.value === value} onPress={() => quality.onChange(value)} />
                      ))}
                    </View>
                    <Text variant="caption" tone="muted">
                      {qualityNote(quality.value)}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
            {ways.length > 0 ? <Kicker title={t('How it goes')} /> : null}
            {ways.map((way) => {
              const Icon = ICONS[way.icon];
              const switched = way.on !== undefined;
              return (
                <Pressable
                  key={way.key}
                  onPress={way.onPress}
                  accessibilityRole={switched ? 'switch' : 'button'}
                  accessibilityState={switched ? { checked: way.on } : undefined}
                  accessibilityLabel={way.value ? `${way.title}: ${way.value}` : way.title}
                  accessibilityHint={way.description}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    minHeight: 56,
                    paddingVertical: 6,
                    paddingLeft: space.lg,
                    paddingRight: space.lg,
                    backgroundColor: pressed ? colors.surfacePressed : 'transparent',
                  })}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: Math.min(12, radius.lg),
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: way.plain ? colors.surfaceAlt : tint(colors, 0.22),
                    }}
                  >
                    <Icon color={way.plain ? colors.textMuted : colors.accentText} size={22} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                    <Text variant="bodyStrong" numberOfLines={1} style={{ fontSize: 15 }}>
                      {way.title}
                    </Text>
                    <Text variant="caption" tone="muted" numberOfLines={1}>
                      {way.description}
                    </Text>
                  </View>
                  {switched ? (
                    <Toggle on={!!way.on} />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 0, maxWidth: '40%' }}>
                      {way.value ? (
                        <Text variant="caption" tone="faint" numberOfLines={1} style={{ fontSize: 13 }}>
                          {way.value}
                        </Text>
                      ) : null}
                      <ChevronIcon color={colors.textFaint} size={18} />
                    </View>
                  )}
                </Pressable>
              );
            })}
            {foot ? (
              <Text variant="caption" tone="faint" style={{ marginTop: space.sm, marginHorizontal: space.lg, paddingTop: space.sm, borderTopWidth: 1, borderColor: colors.border }}>
                {foot}
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

/** The name of a group of the panel, with what goes at its right. */
function Kicker({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: space.sm, paddingBottom: space.xs, paddingHorizontal: space.lg }}>
      <Text variant="overline" tone="muted">
        {title}
      </Text>
      {children}
    </View>
  );
}
