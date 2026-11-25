// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { ReactNode } from 'react';
import { View } from 'react-native';

// Small line icons drawn with views, in one colour, so they follow every look without an icon font.

type Props = { color: string; size?: number };

export function PlusIcon({ color, size = 22 }: Props) {
  const bar = Math.max(2, Math.round(size / 10));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size * 0.8, height: bar, borderRadius: bar, backgroundColor: color }} />
      <View style={{ position: 'absolute', width: bar, height: size * 0.8, borderRadius: bar, backgroundColor: color }} />
    </View>
  );
}

export function SearchIcon({ color, size = 18 }: Props) {
  const line = Math.max(1.5, size / 10);
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ width: size * 0.7, height: size * 0.7, borderRadius: size, borderWidth: line, borderColor: color }} />
      <View
        style={{
          position: 'absolute',
          width: size * 0.38,
          height: line,
          borderRadius: line,
          backgroundColor: color,
          right: -size * 0.02,
          bottom: size * 0.12,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function LockIcon({ color, size = 20 }: Props) {
  const line = Math.max(1.5, size / 10);
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderTopLeftRadius: size,
          borderTopRightRadius: size,
          borderWidth: line,
          borderBottomWidth: 0,
          borderColor: color,
          marginTop: size * 0.04,
        }}
      />
      <View style={{ width: size * 0.78, height: size * 0.5, borderRadius: size * 0.12, backgroundColor: color, marginTop: -1 }} />
    </View>
  );
}

/** Three dots in a row, or, `upright`, one above another (Android's ⋮). */
export function MoreIcon({ color, size = 20, upright = false }: Props & { upright?: boolean }) {
  const dot = Math.max(3, size / 5);
  return (
    <View style={{ width: size, height: size, flexDirection: upright ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: dot, height: dot, borderRadius: dot, backgroundColor: color }} />
      ))}
    </View>
  );
}

/** Two sliders: a chat's options, beside the field (#44). */
export function OptionsIcon({ color, size = 22 }: Props) {
  const bar = Math.max(2, Math.round(size / 11));
  const knob = Math.max(6, Math.round(size / 3.2));
  const line = (top: number, at: number) => (
    <View style={{ position: 'absolute', top, left: 0, right: 0, height: knob, justifyContent: 'center' }}>
      <View style={{ height: bar, borderRadius: bar, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: at, width: knob, height: knob, borderRadius: knob, backgroundColor: color }} />
    </View>
  );
  return (
    <View style={{ width: size, height: size }}>
      {line(size * 0.12, size * 0.55)}
      {line(size * 0.58, size * 0.12)}
    </View>
  );
}

/** A clock face: for chats whose messages disappear. */
export function TimerIcon({ color, size = 14 }: Props) {
  const line = Math.max(1.2, size / 10);
  return (
    <View style={{ width: size, height: size, borderRadius: size, borderWidth: line, borderColor: color, alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: line, height: size * 0.32, top: size * 0.14, backgroundColor: color }} />
      <View
        style={{
          position: 'absolute',
          width: size * 0.26,
          height: line,
          top: size * 0.44,
          left: size * 0.44,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/** A shield: for end-to-end encryption. */
export function ShieldIcon({ color, size = 14 }: Props) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View style={{ width: size * 0.8, height: size * 0.5, backgroundColor: color, borderTopLeftRadius: size * 0.1, borderTopRightRadius: size * 0.1 }} />
      <View
        style={{
          width: size * 0.57,
          height: size * 0.57,
          backgroundColor: color,
          marginTop: -size * 0.3,
          transform: [{ rotate: '45deg' }],
          borderBottomRightRadius: size * 0.12,
        }}
      />
    </View>
  );
}

/** A pushpin, leaning: for a conversation pinned at the top of the list. */
export function PinIcon({ color, size = 14 }: Props) {
  const line = Math.max(1.5, size / 9);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', transform: [{ rotate: '35deg' }] }}>
      <View style={{ width: size * 0.56, height: size * 0.18, borderRadius: line, backgroundColor: color }} />
      <View style={{ width: size * 0.34, height: size * 0.3, backgroundColor: color }} />
      <View style={{ width: size * 0.7, height: size * 0.16, borderRadius: line, backgroundColor: color }} />
      <View style={{ width: line, height: size * 0.36, backgroundColor: color }} />
    </View>
  );
}

/** A handset: for the Phone. Half a ring from its top left to its bottom right, a cup at each end. */
export function PhoneIcon({ color, size = 20 }: Props) {
  const line = Math.max(2, size / 9);
  const ring = size * 0.84;
  const at = (size - ring) / 2;
  // The ends of the ring's middle line, up left and down right of its centre.
  const reach = ((ring - line) / 2) * Math.SQRT1_2;
  const cup = { length: size * 0.34, width: line * 1.7 };
  const cupAt = (sign: 1 | -1) => {
    // From an end, half a cup's length towards the centre.
    const inward = ((cup.length - cup.width) / 2) * Math.SQRT1_2;
    const x = size / 2 + sign * (reach - inward);
    const y = size / 2 + sign * (reach - inward);
    return { left: x - cup.length / 2, top: y - cup.width / 2 };
  };
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: at,
          top: at,
          width: ring,
          height: ring,
          borderRadius: ring,
          borderWidth: line,
          borderColor: 'transparent',
          borderLeftColor: color,
          borderBottomColor: color,
        }}
      />
      {([-1, 1] as const).map((sign) => (
        <View
          key={sign}
          style={{ position: 'absolute', ...cupAt(sign), width: cup.length, height: cup.width, borderRadius: cup.width, backgroundColor: color, transform: [{ rotate: '45deg' }] }}
        />
      ))}
    </View>
  );
}

/** A head and shoulders: for contacts. */
export function PersonIcon({ color, size = 20 }: Props) {
  const line = Math.max(1.5, size / 10);
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View style={{ width: size * 0.44, height: size * 0.44, borderRadius: size, borderWidth: line, borderColor: color, marginTop: size * 0.02 }} />
      <View
        style={{
          width: size * 0.84,
          height: size * 0.4,
          borderTopLeftRadius: size * 0.42,
          borderTopRightRadius: size * 0.42,
          borderBottomLeftRadius: line,
          borderBottomRightRadius: line,
          borderWidth: line,
          borderColor: color,
          marginTop: size * 0.08,
        }}
      />
    </View>
  );
}

// The chat's own icons (its header, its message bar and the panel under "+"), each drawn on a grid
// of 24 and scaled to `size`, from boxes alone: borders, rounded corners and turns.

type Box = { x: number; y: number; w: number; h: number };

/** A box at (x, y) on the grid of 24, `w` by `h`, scaled by `k`. */
const box = (k: number, { x, y, w, h }: Box) => ({ position: 'absolute' as const, left: x * k, top: y * k, width: w * k, height: h * k });

function Grid({ size, children }: { size: number; children: ReactNode }) {
  return <View style={{ width: size, height: size }}>{children}</View>;
}

/** A filled box with rounded ends, on the grid. */
function Bar({ k, color, x, y, w, h, r = 1 }: Box & { k: number; color: string; r?: number }) {
  return <View style={[box(k, { x, y, w, h }), { borderRadius: r * k, backgroundColor: color }]} />;
}

/** A filled dot `d` across, its corner at (x, y). */
function Dot({ k, color, x, y, d }: { k: number; color: string; x: number; y: number; d: number }) {
  return <View style={[box(k, { x, y, w: d, h: d }), { borderRadius: d * k, backgroundColor: color }]} />;
}

/** A chevron pointing left: back. */
export function BackIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 9.5, y: 6.5, w: 11, h: 11 }), { borderLeftWidth: 2.3 * k, borderBottomWidth: 2.3 * k, borderColor: color, borderRadius: 1.5 * k, transform: [{ rotate: '45deg' }] }]} />
    </Grid>
  );
}

/** A chevron: pointing right (a row that opens more), or down (a choice that opens). */
export function ChevronIcon({ color, size = 16, down = false }: Props & { down?: boolean }) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View
        style={[
          box(k, down ? { x: 7.5, y: 4.5, w: 9, h: 9 } : { x: 6, y: 7.5, w: 9, h: 9 }),
          { borderTopWidth: 2.4 * k, borderRightWidth: 2.4 * k, borderColor: color, borderRadius: k, transform: [{ rotate: down ? '135deg' : '45deg' }] },
        ]}
      />
    </Grid>
  );
}

/** To one end of a thread: a chevron against a bar, up to its start, or down to its end. */
export function EdgeIcon({ color, size = 24, up = false }: Props & { up?: boolean }) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <Bar k={k} color={color} x={5} y={up ? 6.6 : 15} w={14} h={2.4} r={1.2} />
      <View
        style={[
          box(k, { x: 7.5, y: up ? 12.5 : 2.5, w: 9, h: 9 }),
          { borderTopWidth: 2.4 * k, borderRightWidth: 2.4 * k, borderColor: color, borderRadius: k, transform: [{ rotate: up ? '-45deg' : '135deg' }] },
        ]}
      />
    </Grid>
  );
}

/** A double tick: what was seen, as the marks beside a message say; the arrow to where a chat was last seen. */
export function SeenIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      {[3.5, 9.5].map((x) => (
        <View
          key={x}
          style={[
            box(k, { x, y: 5.5, w: 6, h: 11 }),
            { borderBottomWidth: 2.4 * k, borderRightWidth: 2.4 * k, borderColor: color, borderRadius: k, transform: [{ rotate: '45deg' }] },
          ]}
        />
      ))}
    </Grid>
  );
}

/** A cross: to close or turn off. */
export function CloseIcon({ color, size = 20 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      {['45deg', '-45deg'].map((rotate) => (
        <View key={rotate} style={[box(k, { x: 4, y: 10.9, w: 16, h: 2.2 }), { borderRadius: 1.1 * k, backgroundColor: color, transform: [{ rotate }] }]} />
      ))}
    </Grid>
  );
}

/** An eye: what is typed shows; `crossed`, it is hidden again. */
export function EyeIcon({ color, size = 22, crossed = false }: Props & { crossed?: boolean }) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 2, y: 6, w: 20, h: 12 }), { borderRadius: 10 * k, borderWidth: 2 * k, borderColor: color }]} />
      <Dot k={k} color={color} x={8.5} y={8.5} d={7} />
      {crossed ? <View style={[box(k, { x: 1, y: 10.9, w: 22, h: 2.2 }), { borderRadius: 1.1 * k, backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} /> : null}
    </Grid>
  );
}

/** A camera on its side, its lens a wedge: a video call. */
export function VideoIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 1.5, y: 6, w: 15, h: 12 }), { borderWidth: 2.1 * k, borderColor: color, borderRadius: 3.5 * k }]} />
      <View
        style={[
          box(k, { x: 16.5, y: 7.5, w: 0, h: 0 }),
          { borderTopWidth: 4.5 * k, borderBottomWidth: 4.5 * k, borderRightWidth: 6 * k, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: color },
        ]}
      />
    </Grid>
  );
}

/** A stopwatch: the clock face of TimerIcon with a crown, for a message that disappears. */
export function StopwatchIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 3.5, y: 4.5, w: 17, h: 17 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 17 * k }]} />
      <Bar k={k} color={color} x={9.5} y={1.2} w={5} h={2} />
      <Bar k={k} color={color} x={11} y={2.5} w={2} h={3} r={0} />
      <Bar k={k} color={color} x={11} y={8} w={2} h={5.6} />
      <Bar k={k} color={color} x={11} y={11.6} w={4.6} h={2} />
      <View style={[box(k, { x: 17.2, y: 4.6, w: 3, h: 2 }), { borderRadius: k, backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
    </Grid>
  );
}

/** A smiling face: stickers. */
export function SmileIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 2.5, y: 2.5, w: 19, h: 19 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 19 * k }]} />
      <Dot k={k} color={color} x={8.2} y={8.6} d={2.6} />
      <Dot k={k} color={color} x={13.2} y={8.6} d={2.6} />
      <View
        style={[
          box(k, { x: 7.4, y: 7.6, w: 9.2, h: 8.8 }),
          { borderWidth: 2 * k, borderColor: 'transparent', borderBottomColor: color, borderRadius: 9.2 * k },
        ]}
      />
    </Grid>
  );
}

/** A microphone: hold to record. */
export function MicIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <Bar k={k} color={color} x={8.5} y={2} w={7} h={12} r={3.5} />
      <View
        style={[
          box(k, { x: 5, y: 8.5, w: 14, h: 8.5 }),
          { borderWidth: 2 * k, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: 7 * k, borderBottomRightRadius: 7 * k },
        ]}
      />
      <Bar k={k} color={color} x={11} y={16.5} w={2} h={4} r={0} />
      <Bar k={k} color={color} x={8} y={19.8} w={8} h={2} />
    </Grid>
  );
}

/** A small microphone beside lines of writing: words spoken into the field (dictation). */
export function DictateIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <Bar k={k} color={color} x={3.5} y={2} w={6} h={11} r={3} />
      <View
        style={[
          box(k, { x: 1, y: 8, w: 12, h: 8 }),
          { borderWidth: 2 * k, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: 6 * k, borderBottomRightRadius: 6 * k },
        ]}
      />
      <Bar k={k} color={color} x={6} y={16} w={2} h={4} r={0} />
      <Bar k={k} color={color} x={3.5} y={19.8} w={7} h={2} />
      <Bar k={k} color={color} x={15} y={5} w={8} h={2} />
      <Bar k={k} color={color} x={15} y={10.5} w={8} h={2} />
      <Bar k={k} color={color} x={15} y={16} w={5.5} h={2} />
    </Grid>
  );
}

/** Two notes joined by a beam: music. */
export function MusicIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <Bar k={k} color={color} x={8} y={3} w={12} h={3.5} r={1} />
      <Bar k={k} color={color} x={8} y={3} w={2} h={14} r={0} />
      <Bar k={k} color={color} x={18} y={3} w={2} h={12} r={0} />
      <Dot k={k} color={color} x={3.5} y={14.5} d={6.5} />
      <Dot k={k} color={color} x={13.5} y={12.5} d={6.5} />
    </Grid>
  );
}

/** A paper dart: send. `cut` is the color behind it, for the notch in its tail. */
export function SendIcon({ color, cut, size = 24 }: Props & { cut: string }) {
  const k = size / 24;
  const wedge = (x: number, y: number, half: number, long: number, fill: string) => (
    <View
      style={[
        box(k, { x, y, w: 0, h: 0 }),
        { borderTopWidth: half * k, borderBottomWidth: half * k, borderLeftWidth: long * k, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: fill },
      ]}
    />
  );
  return (
    <Grid size={size}>
      {wedge(3.5, 3.2, 8.8, 18.5, color)}
      {wedge(3.5, 8.6, 3.4, 6.2, cut)}
    </Grid>
  );
}

/** A walkie-talkie: Talkie. */
export function TalkieIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 6.5, y: 6, w: 12, h: 16 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 3 * k }]} />
      <Bar k={k} color={color} x={8} y={1.5} w={2} h={6} />
      <Bar k={k} color={color} x={9.5} y={10} w={6} h={2} />
      <Bar k={k} color={color} x={9.5} y={13.5} w={6} h={2} />
    </Grid>
  );
}

/** A picture with a hill and the sun: a photo from the phone. */
export function PhotoIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 2, y: 4, w: 20, h: 16 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 3.5 * k, overflow: 'hidden' }]}>
        <View style={[box(k, { x: -0.5, y: 7, w: 9, h: 9 }), { backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
        <View style={[box(k, { x: 6.5, y: 8.5, w: 8, h: 8 }), { backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
        <Dot k={k} color={color} x={10.6} y={2} d={3.4} />
      </View>
    </Grid>
  );
}

/** A camera: a photo taken now. */
export function CameraIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 7.5, y: 3.2, w: 9, h: 4 }), { borderTopLeftRadius: 2 * k, borderTopRightRadius: 2 * k, backgroundColor: color }]} />
      <View style={[box(k, { x: 2, y: 6.5, w: 20, h: 14.5 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 3.5 * k }]} />
      <View style={[box(k, { x: 8, y: 9.6, w: 8, h: 8 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 8 * k }]} />
    </Grid>
  );
}

/** A page with its corner turned: a file. */
export function FileIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View
        style={[
          box(k, { x: 4.5, y: 2, w: 15, h: 20 }),
          { borderWidth: 2 * k, borderColor: color, borderRadius: 2.5 * k, borderTopRightRadius: 7 * k },
        ]}
      />
      <Bar k={k} color={color} x={8.5} y={10} w={7} h={2} />
      <Bar k={k} color={color} x={8.5} y={14} w={5} h={2} />
    </Grid>
  );
}

/** A map pin: where you are. */
export function PlaceIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View
        style={[
          box(k, { x: 5, y: 3, w: 14, h: 14 }),
          { borderWidth: 2.2 * k, borderColor: color, borderRadius: 7 * k, borderBottomLeftRadius: 0, transform: [{ rotate: '-45deg' }] },
        ]}
      />
      <Dot k={k} color={color} x={10} y={8} d={4} />
    </Grid>
  );
}

/** Three bars of a chart: a poll. */
export function PollIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <Bar k={k} color={color} x={3.5} y={10} w={4} h={10} r={2} />
      <Bar k={k} color={color} x={10} y={4} w={4} h={16} r={2} />
      <Bar k={k} color={color} x={16.5} y={13} w={4} h={7} r={2} />
    </Grid>
  );
}

/** A pencil: a message's words edited. */
export function PencilIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 0, y: 0, w: 24, h: 24 }), { transform: [{ rotate: '-45deg' }] }]}>
        <View style={[box(k, { x: 7, y: 9, w: 15, h: 6 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 1.5 * k }]} />
        <Bar k={k} color={color} x={17} y={9} w={2} h={6} r={0} />
        <View style={[box(k, { x: 2.5, y: 10.5, w: 5, h: 3 }), { borderTopLeftRadius: 3 * k, borderBottomLeftRadius: 3 * k, backgroundColor: color }]} />
      </View>
    </Grid>
  );
}

/** A calendar page: to send later. */
export function LaterIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 3, y: 4.5, w: 18, h: 17 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 3.5 * k }]} />
      <Bar k={k} color={color} x={3} y={9} w={18} h={2} r={0} />
      <Bar k={k} color={color} x={7.5} y={2} w={2} h={5} />
      <Bar k={k} color={color} x={14.5} y={2} w={2} h={5} />
      {[7, 10.8, 14.6].map((x) => (
        <Dot key={x} k={k} color={color} x={x} y={13.5} d={2.6} />
      ))}
    </Grid>
  );
}

/** A speech bubble with three dots: an SMS. */
export function SmsIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 2, y: 3.5, w: 20, h: 14.5 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 4.5 * k }]} />
      <View style={[box(k, { x: 5, y: 16.5, w: 0, h: 0 }), { borderTopWidth: 5.5 * k, borderRightWidth: 5 * k, borderTopColor: color, borderRightColor: 'transparent' }]} />
      {[6.8, 10.75, 14.7].map((x) => (
        <Dot key={x} k={k} color={color} x={x} y={9.6} d={2.5} />
      ))}
    </Grid>
  );
}

/** A bell struck through: without sound. */
export function QuietIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View
        style={[
          box(k, { x: 6, y: 3.5, w: 12, h: 13 }),
          { borderWidth: 2 * k, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 6 * k, borderTopRightRadius: 6 * k },
        ]}
      />
      <Bar k={k} color={color} x={3.5} y={15.5} w={17} h={2} />
      <Dot k={k} color={color} x={10.3} y={18.6} d={3.4} />
      <View style={[box(k, { x: 1.5, y: 10.9, w: 21, h: 2.2 }), { borderRadius: 1.1 * k, backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
    </Grid>
  );
}

/** A bell: notifications. */
export function BellIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View
        style={[
          box(k, { x: 6, y: 3.5, w: 12, h: 13 }),
          { borderWidth: 2 * k, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 6 * k, borderTopRightRadius: 6 * k },
        ]}
      />
      <Bar k={k} color={color} x={3.5} y={15.5} w={17} h={2} />
      <Dot k={k} color={color} x={10.3} y={18.6} d={3.4} />
    </Grid>
  );
}

/** A cog: the general settings. Eight teeth around a ring. */
export function GearIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      {[0, 45, 90, 135].map((angle) => (
        <View key={angle} style={[box(k, { x: 10, y: 1.5, w: 4, h: 21 }), { transform: [{ rotate: `${angle}deg` }] }]}>
          <View style={{ height: 4 * k, borderRadius: k, backgroundColor: color }} />
          <View style={{ flex: 1 }} />
          <View style={{ height: 4 * k, borderRadius: k, backgroundColor: color }} />
        </View>
      ))}
      <View style={[box(k, { x: 4.5, y: 4.5, w: 15, h: 15 }), { borderWidth: 4 * k, borderColor: color, borderRadius: 15 * k }]} />
    </Grid>
  );
}

/** A circle half filled: the look, light and dark. */
export function ContrastIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 2.5, y: 2.5, w: 19, h: 19 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 19 * k, overflow: 'hidden' }]}>
        <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', backgroundColor: color }} />
      </View>
    </Grid>
  );
}

/** Four bars rising: the ways messages go, the relay and the networks. */
export function SignalIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      {[6, 10, 14.5, 19].map((h, i) => (
        <Bar key={h} k={k} color={color} x={2.5 + i * 5} y={21 - h} w={3.5} h={h} />
      ))}
    </Grid>
  );
}

/** A television: a screen on a stand, for TV channels. */
export function TvIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 2, y: 4, w: 20, h: 13.5 }), { borderWidth: 2.1 * k, borderColor: color, borderRadius: 3 * k }]} />
      <Bar k={k} color={color} x={10.9} y={17.5} w={2.2} h={2.5} r={0} />
      <Bar k={k} color={color} x={7} y={19.6} w={10} h={2.1} />
    </Grid>
  );
}

/** Three layers stacked: the data kept, backups and devices. */
export function StackIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      {[2.5, 9, 15.5].map((y) => (
        <View key={y} style={[box(k, { x: 3, y, w: 18, h: 6 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 3 * k }]} />
      ))}
    </Grid>
  );
}

/** A globe, its meridian and equator: the language. */
export function GlobeIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 2.5, y: 2.5, w: 19, h: 19 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 19 * k }]} />
      <View style={[box(k, { x: 7.5, y: 2.5, w: 9, h: 19 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 9 * k }]} />
      <Bar k={k} color={color} x={3} y={11} w={18} h={2} r={0} />
    </Grid>
  );
}

/** A folder with its tab: a folder of the Collection. */
export function FolderIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 2, y: 5, w: 9, h: 5 }), { borderWidth: 2 * k, borderColor: color, borderTopLeftRadius: 2.5 * k, borderTopRightRadius: 2.5 * k, borderBottomWidth: 0 }]} />
      <View style={[box(k, { x: 2, y: 7.5, w: 20, h: 13 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 2.5 * k, borderTopLeftRadius: 0 }]} />
    </Grid>
  );
}

/** An arrow down into a tray: save to the phone. */
export function DownloadIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <Bar k={k} color={color} x={11} y={3} w={2} h={11} />
      <View style={[box(k, { x: 7.2, y: 7.2, w: 9.6, h: 9.6 }), { borderRightWidth: 2 * k, borderBottomWidth: 2 * k, borderColor: color, transform: [{ rotate: '45deg' }] }]} />
      <View style={[box(k, { x: 3.5, y: 15, w: 17, h: 6 }), { borderWidth: 2 * k, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: 2.5 * k, borderBottomRightRadius: 2.5 * k }]} />
    </Grid>
  );
}

/** A circled i: information. */
export function InfoIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 2.5, y: 2.5, w: 19, h: 19 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 20 * k }]} />
      <Dot k={k} color={color} x={10.8} y={6.6} d={2.4} />
      <Bar k={k} color={color} x={10.9} y={10.4} w={2.2} h={7} />
    </Grid>
  );
}

/** A bin: delete. */
export function TrashIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <Bar k={k} color={color} x={3.5} y={5.5} w={17} h={2} />
      <View style={[box(k, { x: 9, y: 2.5, w: 6, h: 3 }), { borderWidth: 2 * k, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 1.5 * k, borderTopRightRadius: 1.5 * k }]} />
      <View style={[box(k, { x: 5.5, y: 7.5, w: 13, h: 14 }), { borderWidth: 2 * k, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: 3 * k, borderBottomRightRadius: 3 * k }]} />
      <Bar k={k} color={color} x={10} y={11} w={1.8} h={6.5} />
      <Bar k={k} color={color} x={12.4} y={11} w={1.8} h={6.5} />
    </Grid>
  );
}

/** A folder with an arrow into it: move to a folder. */
export function MoveIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <FolderIcon color={color} size={size} />
      <Bar k={k} color={color} x={8} y={13} w={8} h={2} />
      <View style={[box(k, { x: 11.2, y: 11, w: 5, h: 5 }), { borderTopWidth: 2 * k, borderRightWidth: 2 * k, borderColor: color, transform: [{ rotate: '45deg' }] }]} />
    </Grid>
  );
}

/** A tick: chosen. */
export function CheckIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 7, y: 3.5, w: 6.5, h: 12.5 }), { borderRightWidth: 2.4 * k, borderBottomWidth: 2.4 * k, borderColor: color, transform: [{ rotate: '40deg' }] }]} />
    </Grid>
  );
}

/** Two sheets, one over the other: copy. */
export function CopyIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 3, y: 3, w: 12, h: 14 }), { borderTopWidth: 2 * k, borderLeftWidth: 2 * k, borderColor: color, borderTopLeftRadius: 2.5 * k }]} />
      <View style={[box(k, { x: 8, y: 7.5, w: 13, h: 14 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 2.5 * k }]} />
    </Grid>
  );
}

/** An arrow to the right: forward. */
export function ForwardIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <Bar k={k} color={color} x={3} y={11} w={17} h={2} />
      <View style={[box(k, { x: 11, y: 7.5, w: 9, h: 9 }), { borderTopWidth: 2 * k, borderRightWidth: 2 * k, borderColor: color, transform: [{ rotate: '45deg' }] }]} />
    </Grid>
  );
}

/** A box with a tick: choose them all. */
export function AllIcon({ color, size = 24 }: Props) {
  const k = size / 24;
  return (
    <Grid size={size}>
      <View style={[box(k, { x: 3, y: 3, w: 18, h: 18 }), { borderWidth: 2 * k, borderColor: color, borderRadius: 4 * k }]} />
      <View style={[box(k, { x: 9.3, y: 6, w: 4.6, h: 9.2 }), { borderRightWidth: 2.2 * k, borderBottomWidth: 2.2 * k, borderColor: color, transform: [{ rotate: '40deg' }] }]} />
    </Grid>
  );
}
