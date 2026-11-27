// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Call } from '../lib/call';
import { GAP_FILLED, readQuality, secondsBetween, type Quality, type SoundTotals } from '../lib/call-quality';
import { callPermissions } from '../lib/call-permissions';
import { callClock } from '../lib/calls';
import { headsetIn, soundInHeadset, soundName, soundShort, useCallSound } from '../lib/call-sound';
import { press } from '../lib/haptics';
import type { CallEnd } from '../lib/call-signal';
import { t, mark } from '../lib/i18n';
import { CallVideo } from './call-video';
import { PersonIcon } from './icons';
import { KeyFace } from './key-face';
import { Button, Sheet, Text } from './ui';

// A call over the whole chat, in every style: dark, as the picture shows best on it. Shows the other
// phone's picture or their face drawn from their key, our own camera in a corner, how the call
// stands, and its buttons. It closes itself a moment after the call ends. A call that rings is
// answered with the camera, or with voice only: a video call so answered shows their picture and
// sends none, until the camera is turned on where the call's way can. Where it can (an Erevos call
// with a phone that takes it, an XMPP or a Matrix one), video is added to a voice call from here,
// and their asking to add it is asked here: a yes turns the camera on, and the sound to the
// speaker, unless a headset has it. Flip shows with more than one camera, or while it is not known
// how many there are. With a headset connected, Speaker becomes where the sound goes (CallSound).

// Long buzz, pause, again, while a call rings here.
export const RING = [0, 900, 1100];
// How long the screen stays after a call ends, milliseconds.
export const ENDED_SHOWN = 2500;

const ENDS: Record<CallEnd, { ours: string; theirs: string }> = {
  hangup: { ours: mark('Call ended'), theirs: mark('They hung up') },
  decline: { ours: mark('Turned down'), theirs: mark('They turned it down') },
  busy: { ours: mark('Call ended'), theirs: mark('They are in another call') },
  missed: { ours: mark('Call ended'), theirs: mark('Not answered') },
  failed: { ours: mark('The call could not connect'), theirs: mark('The call could not connect on their phone') },
  taken: { ours: mark('Call ended'), theirs: mark('Answered on another device') },
};

/** How a call stands, in a few words. */
export function callStatus(call: Call, now: number): string {
  switch (call.state) {
    case 'calling':
      return t('Calling…');
    case 'ringing':
      return t('Ringing…');
    case 'incoming':
      return call.video ? t('Incoming video call') : t('Incoming voice call');
    case 'connecting':
      return t('Connecting…');
    case 'connected':
      return callClock(now - call.connectedAt);
    case 'ended': {
      const ended = call.ended ?? { reason: 'hangup', byUs: true };
      // Answered, or turned down, on another device of the account (lib/devices.ts).
      if (ended.elsewhere) return ended.reason === 'decline' ? t('Turned down') : t('Answered on another device');
      // Theirs, not answered here.
      if (ended.reason === 'missed' && !call.outgoing) return t('Missed call');
      // Straight between the two phones, with no call relay, and never connected (lib/direct.ts).
      if (call.failedDirect) return t('The call could not connect directly');
      return t(ended.byUs ? ENDS[ended.reason].ours : ENDS[ended.reason].theirs);
    }
  }
}

export function CallScreen({ call, identity, name, nameless = false, encryption, notice, speaker, onSpeaker, onAnswer, onClose }: {
  call: Call;
  /** A hidden contact's call answered without the PIN: no name, and a plain face in place of theirs. */
  nameless?: boolean;
  /** The contact's identity key, hex, for their face. */
  identity: string;
  name: string;
  /** What the call's encryption is, when not Erevos's own end-to-end one (an XMPP call's). */
  encryption?: string;
  /** Said under the call while it rings here: who will see this phone's internet address once it is answered (lib/ip-warning.ts). */
  notice?: string;
  speaker: boolean;
  onSpeaker: (on: boolean) => void;
  /** Answers the call that rings here, with the camera or (false) voice only, once they may be used. */
  onAnswer: (video: boolean) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [now, setNow] = useState(Date.now());
  const { state } = call;
  // How the call connects (lib/call-quality.ts), shown while the screen was held down; and of the
  // readings so far, how many had a gap in their sound.
  const [details, setDetails] = useState(false);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [gaps, setGaps] = useState(0);
  const totals = useRef<SoundTotals | null>(null);

  // Read every QUALITY_EVERY while connected, so the gaps are counted from the start.
  useEffect(() => {
    if (state !== 'connected') return;
    let active = true;
    const read = async () => {
      const report = await call.stats();
      if (!active || !report) return;
      const got = readQuality(report, totals.current);
      totals.current = got.totals ?? totals.current;
      if (got.filled !== null && got.filled > GAP_FILLED) setGaps((n) => n + 1);
      setQuality(got);
    };
    const timer = setInterval(() => void read().catch(() => undefined), QUALITY_EVERY);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [state]);

  // The time shown while connected.
  useEffect(() => {
    if (state !== 'connected') return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (state !== 'incoming') return;
    Vibration.vibrate(RING, true);
    return () => Vibration.cancel();
  }, [state]);

  useEffect(() => {
    if (state !== 'ended') return;
    const timer = setTimeout(onClose, ENDED_SHOWN);
    return () => clearTimeout(timer);
  }, [state]);

  // Video added to a voice call comes in the same streams: their views are made anew once it has,
  // and ours as the camera turns to another.
  const theirVideos = call.remote?.getVideoTracks().length ?? 0;
  const camera = call.local?.getVideoTracks()[0];
  // Their picture, once one comes: none from a video call they answered with voice only.
  const theirs = call.video && call.remote && theirVideos > 0 && state === 'connected';
  const ours = call.video && call.local && camera && !call.cameraOff && state !== 'ended';
  // A camera facing away is not mirrored.
  const mirror = camera?.getSettings?.().facingMode !== 'environment';
  const withVideo = (turnOn: () => Promise<void>) =>
    void callPermissions(true).then(async (granted) => {
      if (!granted) {
        if (call.askingVideo) call.declineVideo();
        return;
      }
      await turnOn();
      if (call.hasCamera && !soundInHeadset()) onSpeaker(true);
    });

  return (
    <View style={styles.screen}>
      {/* Their sound plays through this too in a browser, so it is there in a voice call as well. */}
      {/* Each picture is made anew as it moves between the whole screen and the corner: Android's
          view of a call's picture, resized, drew ours at no size at all once theirs came (a Pixel's
          log, 2026-11-20), so each side saw only the other. */}
      {call.remote ? <CallVideo key={`theirs-${theirVideos}-${theirs ? 'whole' : 'unseen'}`} stream={call.remote} style={theirs ? StyleSheet.absoluteFill : styles.unseen} /> : null}
      {ours ? (
        <CallVideo
          key={`ours-${camera?.id ?? 1}-${theirs ? 'corner' : 'whole'}`}
          stream={call.local!}
          own
          mirror={mirror}
          style={[styles.own, { top: insets.top + 16 }, theirs ? null : styles.ownWhole]}
        />
      ) : null}
      {/* Held down, the screen shows how the call connects; it says nothing of it otherwise. */}
      <Pressable style={StyleSheet.absoluteFill} onLongPress={() => setDetails(true)} delayLongPress={800} accessible={false} />
      <View style={[styles.top, { paddingTop: insets.top + (theirs ? 16 : 72) }]} pointerEvents="none">
        {theirs ? null : nameless ? (
          <View style={styles.nameless}>
            <PersonIcon color="rgba(255,255,255,0.32)" size={48} />
          </View>
        ) : (
          <KeyFace identity={identity} name={name} size={112} />
        )}
        <Text variant="title" color="#FFFFFF" style={styles.shadow} numberOfLines={1}>
          {name}
        </Text>
        <Text variant="body" color="rgba(255,255,255,0.8)" style={styles.shadow}>
          {callStatus(call, now)}
        </Text>
        {state === 'connected' || state === 'connecting' ? (
          <Text variant="caption" color="rgba(255,255,255,0.6)" style={styles.shadow}>
            {encryption ?? t('End-to-end encrypted')}
          </Text>
        ) : null}
        {state === 'incoming' && notice ? (
          <Text variant="caption" color="rgba(255,255,255,0.8)" style={[styles.shadow, styles.notice]}>
            {notice}
          </Text>
        ) : null}
      </View>
      {details ? <CallDetails call={call} quality={quality} gaps={gaps} top={insets.top + 16} onClose={() => setDetails(false)} /> : null}
      <View style={[styles.buttons, { paddingBottom: insets.bottom + 28 }]}>
        {call.askingVideo ? (
          <View style={styles.asking}>
            <Text variant="body" color="#FFFFFF" style={[styles.shadow, { textAlign: 'center' }]}>
              {t('{name} wants to turn on video', { name })}
            </Text>
            <View style={styles.row}>
              <Round title={t('Not now')} onPress={() => call.declineVideo()} />
              <Round title={t('Turn on video')} color="#2E7D32" onPress={() => withVideo(() => call.acceptVideo())} />
            </View>
          </View>
        ) : null}
        {state === 'incoming' ? (
          <>
            <Round title={t('Decline')} color="#C62828" onPress={() => call.decline()} />
            <Round title={t('Answer')} color="#2E7D32" onPress={() => onAnswer(false)} />
            {call.canAnswerWithVideo ? <Round title={t('Answer with video')} color="#2E7D32" onPress={() => onAnswer(true)} /> : null}
          </>
        ) : state === 'ended' ? null : (
          <>
            <Round title={call.muted ? t('Unmute') : t('Mute')} on={call.muted} onPress={() => call.setMuted(!call.muted)} />
            <CallSound speaker={speaker} onSpeaker={onSpeaker} />
            {call.hasCamera ? (
              <Round title={call.cameraOff ? t('Camera on') : t('Camera off')} on={call.cameraOff} onPress={() => call.setCameraOff(!call.cameraOff)} />
            ) : call.video && (call.canTurnCameraOn || call.addingVideo) ? (
              // A video call answered with voice only: the camera goes on now.
              <Round title={t('Camera on')} on onPress={() => withVideo(() => call.turnCameraOn())} />
            ) : null}
            {call.hasCamera && !call.cameraOff && call.cameras !== 1 ? <Round title={t('Flip')} onPress={() => call.switchCamera()} /> : null}
            {!call.video && (call.canAddVideo || call.addingVideo) ? (
              <Round title={call.addingVideo ? t('Asking…') : t('Add video')} on={call.addingVideo} onPress={() => withVideo(() => call.addVideo())} />
            ) : null}
            <Round title={t('End')} color="#C62828" onPress={() => call.hangUp()} />
          </>
        )}
      </View>
    </View>
  );
}

/** How often how the call connects is read while it is connected, milliseconds. */
export const QUALITY_EVERY = 2000;

const shown = (n: number | null) => (n === null ? '–' : String(n));

/** How the call connects, as last read (lib/call-quality.ts): a tap closes it. */
function CallDetails({ call, quality, gaps, top, onClose }: { call: Call; quality: Quality | null; gaps: number; top: number; onClose: () => void }) {
  const rang = call.outgoing ? secondsBetween(call.madeAt, call.ringingAt) : null;
  const connected = secondsBetween(call.answeredAt, call.connectedAt);
  const lines = [
    ...(rang !== null ? [t('Rang after {n} s', { n: String(rang) })] : []),
    ...(connected !== null ? [t('Connected {n} s after the answer', { n: String(connected) })] : []),
    ...(quality
      ? [
          t('Sound lost: {n}%', { n: shown(quality.lost) }),
          t('Sound filled in: {n}%', { n: shown(quality.filled) }),
          t('Moments with gaps: {n}', { n: String(gaps) }),
          t('Jitter: {n} ms', { n: shown(quality.jitter) }),
          t('There and back: {n} ms', { n: shown(quality.rtt) }),
          t('Way: {way}', { way: quality.way || '–' }),
        ]
      : [t('Not measured yet')]),
  ];
  return (
    <Pressable style={[styles.details, { top }]} onPress={onClose} accessibilityRole="button" accessibilityHint={t('Tap to close')}>
      <Text variant="body" color="#FFFFFF">
        {t('How the call connects')}
      </Text>
      {lines.map((line) => (
        <Text key={line} variant="caption" color="rgba(255,255,255,0.85)">
          {line}
        </Text>
      ))}
      <Text variant="caption" color="rgba(255,255,255,0.6)">
        {t('Tap to close')}
      </Text>
    </Pressable>
  );
}

/**
 * Where the call's sound goes. With no headset connected, Speaker, on or off, as the phone says
 * where it is now (lib/call-sound.ts); with one, where it goes now (Phone, Speaker, Headphones or
 * Bluetooth), and a tap lists them all, a Bluetooth headset by its name, to choose.
 */
export function CallSound({ speaker, onSpeaker }: { speaker: boolean; onSpeaker: (on: boolean) => void }) {
  const { outputs, current, choose } = useCallSound();
  const [choosing, setChoosing] = useState(false);
  if (!headsetIn(outputs)) {
    const on = current ? current.kind === 'speaker' : speaker;
    return <Round title={t('Speaker')} on={on} onPress={() => onSpeaker(!on)} />;
  }
  return (
    <>
      <Round title={current ? soundShort(current) : t('Audio output')} on={current?.kind === 'speaker'} onPress={() => setChoosing(true)} />
      <Sheet visible={choosing} onClose={() => setChoosing(false)} title={t('Audio output')}>
        {outputs.map((output) => (
          <Button
            key={output.id}
            title={output.id === current?.id ? `✓ ${soundName(output)}` : soundName(output)}
            kind={output.id === current?.id ? 'primary' : 'secondary'}
            onPress={() => {
              choose(output.id);
              setChoosing(false);
            }}
          />
        ))}
      </Sheet>
    </>
  );
}

export function Round({ title, onPress, on = false, color }: { title: string; onPress: () => void; on?: boolean; color?: string }) {
  return (
    <Pressable
      onPress={() => {
        press();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected: on }}
      style={({ pressed }) => [
        styles.round,
        { backgroundColor: color ?? (on ? '#FFFFFF' : 'rgba(255,255,255,0.16)'), opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text variant="label" color={!color && on ? '#111111' : '#FFFFFF'} style={{ fontSize: 13, textAlign: 'center' }}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nameless: { width: 112, height: 112, borderRadius: 56, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  screen: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#0B0B0D', zIndex: 100, elevation: 100 },
  unseen: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  own: { position: 'absolute', right: 16, width: 108, height: 160, borderRadius: 14, overflow: 'hidden', zIndex: 2 },
  // Before their picture comes, ours fills the screen behind the name.
  ownWhole: { top: 0, right: 0, left: 0, bottom: 0, width: undefined, height: undefined, borderRadius: 0, opacity: 0.55, zIndex: 0 },
  top: { alignItems: 'center', gap: 8, paddingHorizontal: 24 },
  shadow: { textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  notice: { textAlign: 'center', maxWidth: 420, marginTop: 8 },
  buttons: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14, paddingHorizontal: 16 },
  asking: { width: '100%', alignItems: 'center', gap: 10, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 14 },
  details: { position: 'absolute', left: 16, maxWidth: 320, padding: 14, gap: 4, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 3 },
  round: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
});
