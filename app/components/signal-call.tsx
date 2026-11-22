// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';
import { AppState, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { callPermissions } from '../lib/call-permissions';
import { callClock } from '../lib/calls';
import { t } from '../lib/i18n';
import {
  onMessengerChange,
  signalAnswer,
  signalCallNow,
  signalCamera,
  signalFlip,
  signalForgetCall,
  signalHangUp,
  signalMute,
  signalSpeakerChosen,
} from '../lib/messenger-store';
import { signalCallTalks, type SignalCall } from '../lib/signal-calls';
import { callAudio } from '../modules/erevos-call';
import { SignalVideoView } from '../modules/erevos-messenger';
import { Text } from './ui';

// A Signal voice or video call in Erevos+ (lib/signal-calls.ts) over whatever screen shows: who
// calls or is called, how the call stands, its length while talking, with Answer and Decline while
// it rings and Mute, Speaker, Camera and Hang up otherwise. It rings with the phone's ringtone, and
// in the background with the call notice over the lock screen, as Erevos's own calls do
// (modules/erevos-call); the sound goes through the earpiece or the loudspeaker the same way. A
// call that ended says why for a moment, then is forgotten. Mounted at the app's root next to the
// other calls (app/_layout.tsx).
//
// In a video call the other phone's picture fills the screen once their camera is on, this phone's
// own shows small in a corner; Camera turns ours on or off, Switch between the front and the back
// one. Either can be done in a voice call too, which then shows pictures.

// How long a call that ended stays on the screen, milliseconds.
const ENDED_SHOWN = 2000;

// A ringtone or notice that fails does not stop the call screen.
const audio = (job: () => void) => {
  try {
    job();
  } catch {
    // The call goes on without it.
  }
};

function endedWords(why: string): string {
  switch (why) {
    case 'declined':
      return t('Declined');
    case 'busy':
      return t('Busy');
    case 'no answer':
      return t('No answer');
    case 'missed':
      return t('Missed call');
    case 'disconnected':
      return t('Connection lost');
    default:
      return t('Call ended');
  }
}

function stageWords(call: SignalCall, now: number): string {
  switch (call.stage) {
    case 'ringing':
      return t('Incoming Signal call');
    case 'calling':
      return t('Calling…');
    case 'reconnecting':
      return t('Reconnecting…');
    case 'talking':
      return callClock(Math.max(0, now - (call.since ?? now)));
    case 'ended':
      return endedWords(call.why);
  }
}

export function SignalCallHost() {
  const [, setTick] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => onMessengerChange(() => setTick((n) => n + 1)), []);
  const call = signalCallNow();
  const talking = signalCallTalks(call);
  const callId = call?.id;
  const ended = call?.stage === 'ended';
  const ringing = call?.stage === 'ringing';
  const outgoing = !!call?.outgoing;

  useEffect(() => {
    if (!talking) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [talking, callId]);

  // Theirs rings, with the notice over the lock screen when Erevos is not in front; ours goes on
  // without a ring of ours (their phone rings).
  useEffect(() => {
    if (!ringing) return;
    audio(() => callAudio?.ring?.(!!call?.video, AppState.currentState !== 'active'));
    audio(() => callAudio?.showOverLock?.(true));
    return () => audio(() => callAudio?.stopRinging?.());
    // One ring per call that rings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ringing, callId]);

  // The sound of the call: set up as it begins (ours at once, theirs once answered), back after.
  const soundOn = useRef(false);
  const wantSound = !!call && !ended && (talking || (outgoing && call.stage === 'calling'));
  useEffect(() => {
    if (wantSound && !soundOn.current) {
      soundOn.current = true;
      audio(() => callAudio?.start(!!call?.speaker));
    } else if (!wantSound && soundOn.current) {
      soundOn.current = false;
      audio(() => callAudio?.stop());
      audio(() => callAudio?.showOverLock?.(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantSound]);
  useEffect(
    () => () => {
      if (soundOn.current) audio(() => callAudio?.stop());
    },
    [],
  );

  // An ended call is shown a moment, then forgotten.
  useEffect(() => {
    if (!ended || callId === undefined) return;
    const timer = setTimeout(() => signalForgetCall(callId), ENDED_SHOWN);
    return () => clearTimeout(timer);
  }, [ended, callId]);

  if (!call) return null;
  return <SignalCallScreen call={call} now={now} />;
}

function SignalCallScreen({ call, now }: { call: SignalCall; now: number }) {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('');
  const name = call.name || t('Signal');
  const fail = (error: unknown) => setNote(error instanceof Error ? error.message : String(error));

  function answer(camera: boolean) {
    setNote('');
    void callPermissions(camera)
      .then((granted) => (granted ? signalAnswer(camera) : signalHangUp()))
      .catch(fail);
  }

  function camera(on: boolean) {
    setNote('');
    void (async () => {
      if (on && !(await callPermissions(true))) throw new Error(t('Allow the camera to show yourself.'));
      await signalCamera(on);
    })().catch(fail);
  }

  function speaker(on: boolean) {
    signalSpeakerChosen(on);
    audio(() => callAudio?.setSpeaker(on));
  }

  const ringing = call.stage === 'ringing';
  const over = call.stage === 'ended';
  const Video = SignalVideoView;
  // Pictures, once the call goes on: theirs full screen while their camera is on, ours small.
  const pictures = !!Video && !ringing && !over;
  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
      {pictures && Video && call.remoteVideo ? <Video side="remote" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} /> : null}
      {pictures && Video && call.camera ? (
        <Video side="local" style={{ position: 'absolute', width: 112, height: 160, right: 16, top: insets.top + 16, borderRadius: 12, overflow: 'hidden', zIndex: 2 }} />
      ) : null}
      <View
        style={{
          flex: 1,
          backgroundColor: pictures && call.remoteVideo ? 'transparent' : '#101418',
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text variant="title" color="#FFFFFF" style={{ textAlign: 'center' }} numberOfLines={2}>
            {name}
          </Text>
          <Text color="#C9D1D9" accessibilityLiveRegion="polite">
            {stageWords(call, now)}
          </Text>
          {!over ? (
            <Text variant="caption" color="#C9D1D9" style={{ textAlign: 'center' }}>
              {call.video ? t('Signal video call · end-to-end encrypted') : t('Signal voice call · end-to-end encrypted')}
            </Text>
          ) : null}
          {note ? (
            <Text variant="caption" color="#FF8A80" style={{ textAlign: 'center' }}>
              {note}
            </Text>
          ) : null}
        </View>
        {over ? (
          <View />
        ) : ringing ? (
          <View style={{ flexDirection: 'row', gap: 40 }}>
            <Round title={t('Decline')} color="#C62828" onPress={() => void signalHangUp().catch(fail)} />
            <View style={{ gap: 12 }}>
              <Round title={t('Answer')} color="#2E7D32" onPress={() => answer(false)} />
              {call.video && Video ? <Round title={t('Answer with video')} color="#2E7D32" onPress={() => answer(true)} /> : null}
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            {Video ? <Round title={t('Camera')} on={call.camera} onPress={() => camera(!call.camera)} /> : null}
            {Video && call.camera ? <Round title={t('Switch')} onPress={() => void signalFlip().catch(fail)} /> : null}
            <Round title={t('Speaker')} on={call.speaker} onPress={() => speaker(!call.speaker)} />
            <Round title={call.muted ? t('Unmute') : t('Mute')} on={call.muted} onPress={() => void signalMute(!call.muted).catch(fail)} />
            <Round title={t('Hang up')} color="#C62828" onPress={() => void signalHangUp().catch(fail)} />
          </View>
        )}
      </View>
    </Modal>
  );
}

function Round({ title, color, on, onPress }: { title: string; color?: string; on?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={on === undefined ? undefined : { selected: on }}
      style={{ minWidth: 88, minHeight: 56, paddingHorizontal: 16, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: color ?? (on ? '#FFFFFF' : '#2D333B') }}
    >
      <Text variant="bodyStrong" color={!color && on ? '#101418' : '#FFFFFF'}>
        {title}
      </Text>
    </Pressable>
  );
}
