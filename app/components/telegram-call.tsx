// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { callPermissions } from '../lib/call-permissions';
import { callClock } from '../lib/calls';
import { t } from '../lib/i18n';
import { actingWhere, onActingWhere, type NetworkWhere } from '../lib/network-place';
import { nameOf } from '../lib/telegram';
import type { TgCall } from '../lib/telegram-calls';
import { onTelegramChange, telegramAnswer, telegramCallNow, telegramCamera, telegramForgetCall, telegramHangUp, telegramMute, telegramNow, telegramSwitchCamera } from '../lib/telegram-store';
import { TelegramVideoView } from '../modules/erevos-telegram';
import { Text } from './ui';
import { telegramCallGate } from './telegram-ip';

// A Telegram voice or video call (lib/telegram-calls.ts) over whatever screen shows, for the space's account,
// and for a hidden place's while its hidden chats are open (lib/network-place.ts). It shows who calls
// or is called, how the call stands, its length while talking, and the four emoji of its key to
// compare with the other phone (the same four mean no one listens in, Telegram's own call
// encryption), with Answer and Decline while it rings and Mute and Hang up otherwise. A call that
// ended says why for a moment, then is forgotten. Mounted at the app's root next to the other calls
// (app/_layout.tsx).
//
// A video call rings with Answer with video beside Answer. While it goes on, the other phone's
// picture fills the screen once their camera is on, this phone's own shows small in a corner, and
// Camera turns ours on or off, Switch between the front and the back one. Either can be done in a
// voice call too, which then shows pictures.

// How long a call that ended stays on the screen, milliseconds.
const ENDED_SHOWN = 2000;

/** How a call that ended says why. */
function endedWords(why: string): string {
  switch (why) {
    case 'missed':
      return t('Missed');
    case 'declined':
      return t('Declined');
    case 'hung up':
    case '':
      return t('Call ended');
    case 'disconnected':
      return t('Connection lost');
    default:
      return why;
  }
}

function stageWords(call: TgCall, now: number): string {
  switch (call.stage) {
    case 'ringing':
      return t('Incoming Telegram call');
    case 'calling':
      return t('Calling…');
    case 'connecting':
      return t('Connecting…');
    case 'talking':
      return callClock(Math.max(0, now - (call.since ?? now)));
    case 'ended':
      return endedWords(call.why);
  }
}

/** The call to show: the open account's, else the space's. */
function shownTelegramCall(): { call: TgCall; where: NetworkWhere } | null {
  const acting = actingWhere();
  const here = telegramCallNow(acting);
  if (here) return { call: here, where: acting };
  const space = acting === 'space' ? null : telegramCallNow('space');
  return space ? { call: space, where: 'space' } : null;
}

export function TelegramCallHost() {
  const [, setTick] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const again = () => setTick((n) => n + 1);
    const stopCalls = onTelegramChange(again);
    const stopWhere = onActingWhere(again);
    return () => {
      stopCalls();
      stopWhere();
    };
  }, []);

  const shown = shownTelegramCall();
  const call = shown?.call;
  const talking = call?.stage === 'talking';
  const callId = call?.id;
  const ended = call?.stage === 'ended';
  const where = shown?.where;

  useEffect(() => {
    if (!talking) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [talking, callId]);

  // An ended call is shown a moment, then forgotten.
  useEffect(() => {
    if (!ended || callId === undefined) return;
    const timer = setTimeout(() => telegramForgetCall(callId, where), ENDED_SHOWN);
    return () => clearTimeout(timer);
  }, [ended, callId, where]);

  if (!shown || !call) return null;
  return <TelegramCallScreen call={call} where={shown.where} now={now} />;
}

function TelegramCallScreen({ call, where, now }: { call: TgCall; where: NetworkWhere; now: number }) {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('');
  const state = telegramNow(where).state;
  const name = (state && nameOf(state, call.userId)) || t('Telegram');
  const fail = (error: unknown) => setNote(error instanceof Error ? error.message : String(error));

  function answer(camera: boolean) {
    setNote('');
    // Said once before a call (components/telegram-ip.ts): not going on leaves it ringing, to decline or answer.
    void telegramCallGate(call.userId, where)
      .then(async (go) => {
        if (!go) return;
        if (await callPermissions(camera)) await telegramAnswer(call.id, where, camera);
        else await telegramHangUp(call.id, where);
      })
      .catch(fail);
  }

  function camera(on: boolean) {
    setNote('');
    void (async () => {
      if (on && !(await callPermissions(true))) throw new Error(t('Allow the camera to show yourself.'));
      await telegramCamera(on, where);
    })().catch(fail);
  }

  const ringing = call.stage === 'ringing';
  const over = call.stage === 'ended';
  // Pictures, once the call goes on: theirs full screen while their camera is on, ours small.
  const pictures = !!TelegramVideoView && !ringing && !over;
  const Video = TelegramVideoView;
  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
      {pictures && Video && call.remoteVideo ? <Video side="remote" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} /> : null}
      {pictures && Video && call.camera ? (
        <Video side="local" style={{ position: 'absolute', width: 112, height: 160, right: 16, top: insets.top + 16, borderRadius: 12, overflow: 'hidden', zIndex: 2 }} />
      ) : null}
      <View style={{ flex: 1, backgroundColor: pictures && call.remoteVideo ? 'transparent' : '#101418', paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text variant="title" color="#FFFFFF" style={{ textAlign: 'center' }} numberOfLines={2}>
            {name}
          </Text>
          <Text color="#C9D1D9" accessibilityLiveRegion="polite">
            {stageWords(call, now)}
          </Text>
          {call.emojis.length > 0 && !over ? (
            <View style={{ alignItems: 'center', gap: 8, marginTop: 24 }}>
              <Text accessibilityLabel={call.emojis.join(' ')} style={{ fontSize: 40, lineHeight: 52, letterSpacing: 8 }}>
                {call.emojis.join(' ')}
              </Text>
              <Text variant="caption" color="#C9D1D9" style={{ textAlign: 'center' }}>
                {t('Compare these with the other phone: the same means no one listens in.')}
              </Text>
            </View>
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
            <Round title={t('Decline')} color="#C62828" onPress={() => void (async () => telegramHangUp(call.id, where))().catch(fail)} />
            <View style={{ gap: 12 }}>
              <Round title={t('Answer')} color="#2E7D32" onPress={() => answer(false)} />
              {call.video && TelegramVideoView ? <Round title={t('Answer with video')} color="#2E7D32" onPress={() => answer(true)} /> : null}
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            {TelegramVideoView ? <Round title={t('Camera')} on={call.camera} onPress={() => camera(!call.camera)} /> : null}
            {TelegramVideoView && call.camera ? <Round title={t('Switch')} onPress={() => void (async () => telegramSwitchCamera(where))().catch(fail)} /> : null}
            <Round
              title={call.muted ? t('Unmute') : t('Mute')}
              on={call.muted}
              onPress={() => void (async () => telegramMute(!call.muted, where))().catch(fail)}
            />
            <Round title={t('Hang up')} color="#C62828" onPress={() => void (async () => telegramHangUp(call.id, where))().catch(fail)} />
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
      style={{ minWidth: 88, minHeight: 56, paddingHorizontal: 16, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: color ?? (on ? '#FFFFFF' : '#2D333B') }}
    >
      <Text variant="bodyStrong" color={!color && on ? '#101418' : '#FFFFFF'}>
        {title}
      </Text>
    </Pressable>
  );
}
