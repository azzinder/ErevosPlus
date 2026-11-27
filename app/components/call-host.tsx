// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';
import { AppState, Modal } from 'react-native';

import { callAudio } from '../modules/erevos-call';
import { ask } from '../lib/alert';
import { callsOther, currentCall, type Call } from '../lib/call';
import { callPermissions } from '../lib/call-permissions';
import { ringKeeper } from '../lib/call-ringing';
import { chatNotify } from '../lib/chat-notices';
import { callSignal, closeCall, CONTACT_PREFIX, endCall, onCallChange, shownCall } from '../lib/calls';
import { directSaysNothing } from '../lib/direct';
import { hiddenRinging, setHiddenRinging, takeHiddenAnswer } from '../lib/hidden-ring';
import { onMessage, setReceiverPace } from '../lib/receiver';
import { currentGroupCall, type GroupCall } from '../lib/group-call';
import { closeGroupCall, endGroupCall, groupCallSignal, onGroupCallChange, shownGroupCall } from '../lib/group-calls';
import { memberName } from '../lib/groups';
import { sha256Bytes, toHex, utf8Encode } from '../lib/crypto';
import { learnSpaceNames, spaceCalls } from '../lib/space-calls';
import { onSpaceGroupCall, spaceGroupCalls } from '../lib/space-groups';
import { rtc } from '../lib/webrtc';
import { MATRIX_VOIP_PREFIX, matrixPlaceVoip, watchMatrixVoip } from '../lib/matrix-voip';
import { takeHeldXmppCall, watchXmppCalls, xmppCalls, xmppPlaceCalls, XMPP_PREFIX } from '../lib/xmpp-calls';
import { xmppGroupCalls } from '../lib/xmpp-muji';
import { elementCall } from '../lib/element-call-window';
import { answerMatrixCall, declineMatrixCall, inMatrixCall, onMatrixCallChange, shownMatrixCall, watchMatrixCalls, type MatrixCall } from '../lib/matrix-calls';
import { shownRoomName } from '../lib/matrix';
import { matrixCallAccount, matrixNow } from '../lib/matrix-store';
import { t } from '../lib/i18n';
import { ipGoneOn, ipSaid, ipWarningText, type IpWarning } from '../lib/ip-warning';
import { forgetPublicMedia } from '../lib/public-fetch';
import { CallScreen } from './call-screen';
import { callIpWarning, hiddenKeep, ipGate } from './ip-warning';
import { GroupCallScreen } from './group-call-screen';
import { MatrixRingScreen } from './matrix-ring';

// How often the relay is looked at: often during a call, whose signals should not wait.
const LOOK_EVERY = 3000;
const LOOK_IN_CALL = 700;

// The open space's calls, whatever shows, and while no screen shows (lib/space-running.ts): their
// signals taken, a contact's call that the receiver opens rung, and the relay looked at more
// often during one. On Android a contact's call rings with the phone's ringtone, and while Erevos
// is in the background (lib/background.ts) also with a notice that says only "Incoming call",
// over the lock screen; tapping it brings Erevos up to answer. A group's call (lib/group-calls.ts)
// rings the same way, and so does a call on XMPP or Matrix. A chat or group of the space, or its XMPP
// chat or Matrix room, given a ringtone of its own, or none (lock/chat-notify.ts), rings with it;
// hidden chats ring with the phone's, which tells no one's. Each is answered with the camera or
// with voice only, and the sound goes to the loudspeaker or the earpiece as answered.
// Returns how to stop, which ends the call, as the space closes.
export function watchCalls(): () => void {
  // A ringtone or notice that fails does not stop the call screen, nor the others that hear of the call.
  const audio = (play: () => void) => {
    try {
      play();
    } catch {
      // As said.
    }
  };
  // The ringtone of `chat`, as it has one of its own, or the phone's; with the notice too in the background.
  const ring = (video: boolean, chat: string) => {
    const tone = chat ? chatNotify(chat)?.ring : undefined;
    if (tone === undefined) audio(() => callAudio?.ring?.(video, AppState.currentState !== 'active'));
    else audio(() => callAudio?.ring?.(video, AppState.currentState !== 'active', tone));
  };
  const keeper = ringKeeper(
    {
      ring,
      start: (video) => audio(() => callAudio?.start(video)),
      stopRinging: () => audio(() => callAudio?.stopRinging?.()),
      stop: () => audio(() => callAudio?.stop()),
      showOverLock: (on) => audio(() => callAudio?.showOverLock?.(on)),
    },
    { ringing: () => !!hiddenRinging(), end: () => setHiddenRinging(null) },
  );
  setReceiverPace(() => (currentCall() || currentGroupCall() ? LOOK_IN_CALL : LOOK_EVERY));
  const stopGroupChange = onGroupCallChange(() => {
    const shown = shownGroupCall();
    const call = shown?.call ?? null;
    // An XMPP group's call rings as its chat says too (`xmpp:` and the group's address); a hidden place's with the phone's.
    keeper.group(call, !call ? '' : shown?.place === spaceGroupCalls ? `group:${call.group}` : shown?.place === xmppGroupCalls ? `xmpp:${call.group}` : '', !!currentCall());
  });
  const stopGroupSignals = onSpaceGroupCall((group, from, signal) => void groupCallSignal(spaceGroupCalls, group, from, signal, rtc).catch(() => undefined));
  const stopChange = onCallChange(() => {
    const shown = shownCall();
    const call = shown?.call ?? null;
    // An XMPP call rings as its chat says too: its peer is the chat's home row (`xmpp:` and the address).
    keeper.contact(call, !call ? '' : shown?.place === spaceCalls ? `chat:${call.peer.slice(CONTACT_PREFIX.length)}` : shown?.place === xmppCalls ? call.peer : '');
  });
  const stopMessages = onMessage((received) => {
    if (!received.call) return;
    void callSignal(spaceCalls, `${CONTACT_PREFIX}${received.identity}`, received.call, received.request, rtc, received.from);
  });
  // Calls of the space's XMPP account (lib/xmpp-calls.ts), on the same screen.
  const stopXmpp = watchXmppCalls(rtc);
  // The older one-to-one Matrix calls, as FluffyChat makes them (lib/matrix-voip.ts), on the same screen too.
  const stopVoip = watchMatrixVoip(rtc, matrixCallAccount);
  // Calls of its Matrix account (lib/matrix-calls.ts), in Element Call's own window: they ring here
  // as the others do, and Erevos's own do not ring meanwhile.
  const element = elementCall();
  const stopMatrix = element ? watchMatrixCalls(element.window, element.space) : () => undefined;
  callsOther(inMatrixCall);
  let rangMatrix: MatrixCall | null = null;
  let openMatrix: MatrixCall | null = null;
  const stopMatrixChange = onMatrixCallChange(() => {
    const call = shownMatrixCall();
    if (call?.state === 'incoming' && rangMatrix !== call) {
      rangMatrix = call;
      // With its room's ringtone, as the room has one of its own (Notifications in the Matrix chat);
      // a hidden place's with the phone's, which tells no one's.
      ring(call.video, call.place ? '' : `matrix:${call.roomId}`);
    }
    if (rangMatrix && (call !== rangMatrix || call.state !== 'incoming')) {
      rangMatrix = null;
      audio(() => callAudio?.stopRinging?.());
    }
    if (call?.state === 'open' && openMatrix !== call) {
      openMatrix = call;
      audio(() => callAudio?.start(call.camera ?? call.video));
    }
    if (openMatrix && (call !== openMatrix || call.state !== 'open')) {
      openMatrix = null;
      audio(() => callAudio?.stop());
    }
  });
  return () => {
    stopMatrixChange();
    stopMatrix();
    element?.stop();
    callsOther(() => false);
    stopChange();
    stopMessages();
    stopGroupChange();
    stopGroupSignals();
    setReceiverPace(() => LOOK_EVERY);
    endCall();
    endGroupCall();
    // After the call's end, which still goes to the other person.
    stopXmpp();
    forgetPublicMedia();
    stopVoip();
    audio(() => callAudio?.stopRinging?.());
    audio(() => callAudio?.stop());
    audio(() => callAudio?.showOverLock?.(false));
  };
}

// The call screen over whatever screen shows, while the space is open (watchCalls). The chat
// screen hands over the calls it opens itself. A call that rang while no screen showed shows as
// soon as the screens are there again.
export function CallHost() {
  const [, setShown] = useState(0);
  const [speaker, setSpeaker] = useState(false);
  const known = useRef<Call | null>(null);
  // A contact's call ringing here through a call relay, before its warning was said (lib/ip-warning.ts):
  // said under it while it rings, and kept as said once it is answered.
  const [ringWarning, setRingWarning] = useState<{ call: Call; warning: IpWarning } | null>(null);
  const knownGroup = useRef<GroupCall | null>(null);
  const [names, setNames] = useState<{ group: string; contacts: { identity: string; name: string }[]; said?: Readonly<Record<string, string>> }>({ group: '', contacts: [] });

  // A hidden place's Matrix call that rang with no name while it was closed, and rings in it now
  // that the PIN on the ring screen opened it (lib/matrix-calls.ts): answered at once, as below.
  const heldMatrix = useRef<MatrixCall | null>(null);
  useEffect(
    () =>
      onMatrixCallChange(() => {
        const matrix = shownMatrixCall();
        if (matrix?.state === 'incoming' && matrix.held && heldMatrix.current !== matrix) {
          heldMatrix.current = matrix;
          if (takeHiddenAnswer()) {
            callAudio?.stopRinging?.();
            void callPermissions(matrix.video).then((granted) => {
              if (!granted) return declineMatrixCall(matrix);
              try {
                answerMatrixCall(matrix);
              } catch {
                declineMatrixCall(matrix);
              }
            });
          }
        }
        setShown((n) => n + 1);
      }),
    [],
  );

  useEffect(() => {
    const groupChanged = () => {
      const shown = shownGroupCall();
      const call = shown?.call ?? null;
      if (shown && call && call !== knownGroup.current) {
        knownGroup.current = call;
        setSpeaker(call.video);
        // Named as its group is: the space's, or a hidden place's while its chats are open (lib/place-groups.ts).
        void shown.place
          .names?.(call.group)
          .then((named) => setNames({ group: named.group || t('Group'), contacts: named.contacts, said: named.said }))
          .catch(() => undefined);
      }
      setShown((n) => n + 1);
    };
    const changed = () => {
      const shown = shownCall();
      const call = shown?.call ?? null;
      if (call && call !== known.current) {
        known.current = call;
        setSpeaker(call.video);
        // An Erevos contact's call, of the space or of hidden chats (their own place keeps it), through a call relay.
        const ours = shown?.place === spaceCalls || !!shown?.place.ipKeep;
        if (call.state === 'incoming' && call.throughRelay && ours && call.peer.startsWith(CONTACT_PREFIX)) {
          const keep = shown?.place === spaceCalls ? undefined : (shown?.place.ipKeep?.() ?? 'memory');
          const identity = call.peer.slice(CONTACT_PREFIX.length);
          // Not said while Direct connections cover it (lib/direct.ts): never for hidden chats, nor for a chat set to go only through Tor.
          void (shown?.place.torChat?.(identity) ?? Promise.resolve(false))
            .catch(() => false)
            .then(async (tor) => {
              const warning = callIpWarning(identity, keep, tor);
              if (directSaysNothing(warning) || (await ipSaid(warning))) return;
              if (known.current === call) setRingWarning({ call, warning });
            });
        }
        if (shown?.place === spaceCalls) void learnSpaceNames().then(() => setShown((n) => n + 1), () => undefined);
        // A hidden call just opened by its PIN on the ring screen (lib/hidden-ring.ts): the owner
        // already chose to answer it, so it is answered at once. Never a call of the space's; of a
        // hidden place's XMPP account, only one that rang while the place was closed (lib/xmpp-calls.ts).
        const hidden = shown?.place === xmppPlaceCalls ? takeHeldXmppCall(call.id) : shown?.place !== spaceCalls && shown?.place !== xmppCalls;
        if (call.state === 'incoming' && hidden && takeHiddenAnswer()) {
          callAudio?.stopRinging?.();
          void callPermissions(call.video).then((granted) => (granted ? (setSpeaker(call.video), callAudio?.start(call.video), call.answer()) : call.decline()));
        }
      }
      setShown((n) => n + 1);
    };
    groupChanged();
    changed();
    const stopGroupChange = onGroupCallChange(groupChanged);
    const stopChange = onCallChange(changed);
    return () => {
      stopGroupChange();
      stopChange();
    };
  }, []);

  const group = shownGroupCall();
  if (group) {
    const { call } = group;
    // With the camera, in a video call, or with voice only.
    const joinCall = (video: boolean) => {
      const camera = video && call.video;
      void callPermissions(camera).then((granted) => {
        if (!granted) {
          call.decline();
          return;
        }
        callAudio?.stopRinging?.();
        setSpeaker(camera);
        callAudio?.start(camera);
        void call.answer(camera);
      });
    };
    return (
      <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
        <GroupCallScreen
          call={call}
          groupName={names.group || t('Group')}
          name={(identity) => group.place.name?.(identity) ?? memberName(identity, names.contacts, (i) => names.said?.[i] ?? '')}
          speaker={speaker}
          onSpeaker={(on) => {
            setSpeaker(on);
            callAudio?.setSpeaker(on);
          }}
          onAnswer={joinCall}
          onClose={() => closeGroupCall(call)}
        />
      </Modal>
    );
  }

  // A Matrix call that rings; answered, it goes on in Element Call's window.
  const matrix = shownMatrixCall();
  if (matrix?.state === 'incoming') {
    const room = matrixNow(matrix.place ? 'place' : 'space').state?.rooms[matrix.roomId];
    // Element Call starts with the camera on, or off, as answered.
    const answerMatrix = (video: boolean) => {
      // Calls never go through Tor: said once for the room before the first answered (lib/ip-warning.ts); not gone on, it keeps ringing.
      void ipGate({ network: 'Matrix', act: 'call', of: `matrix:${matrix.roomId}`, ...(matrix.place ? { keep: hiddenKeep() } : {}) }).then((go) => go && answerMatrixNow(video));
    };
    const answerMatrixNow = (video: boolean) => {
      void callPermissions(video).then((granted) => {
        if (!granted) {
          declineMatrixCall(matrix);
          return;
        }
        try {
          answerMatrixCall(matrix, video);
        } catch (error) {
          declineMatrixCall(matrix);
          ask(t('Matrix'), error instanceof Error ? error.message : String(error), [{ text: t('OK') }]);
        }
      });
    };
    return (
      <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
        <MatrixRingScreen call={matrix} name={(room && shownRoomName(room)) || matrix.from || t('Matrix')} onAnswer={answerMatrix} onDecline={() => declineMatrixCall(matrix)} />
      </Modal>
    );
  }

  const shown = shownCall();
  if (!shown) return null;
  const { call, place } = shown;

  const warned = ringWarning?.call === call ? ringWarning.warning : null;

  // With the camera, or voice only: a voice call answered with it asks for video once it connects.
  function answer(video: boolean) {
    // An older Matrix call (lib/matrix-voip.ts): never through Tor, said once for the room first.
    if (call.peer.startsWith(MATRIX_VOIP_PREFIX)) {
      void ipGate({ network: 'Matrix', act: 'call', of: `matrix:${call.peer.slice(MATRIX_VOIP_PREFIX.length)}`, ...(shown?.place === matrixPlaceVoip ? { keep: hiddenKeep() } : {}) }).then((go) => go && answerNow(video));
      return;
    }
    answerNow(video);
  }

  function answerNow(video: boolean) {
    void callPermissions(video).then((granted) => {
      if (!granted) {
        call.decline();
        return;
      }
      // Answered with its warning said: not said again for that chat.
      if (warned) void ipGoneOn(warned).catch(() => undefined);
      setSpeaker(video);
      callAudio?.start(video);
      void call.answer(video);
    });
  }

  function changeSpeaker(on: boolean) {
    setSpeaker(on);
    callAudio?.setSpeaker(on);
  }

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
      <CallScreen
        call={call}
        identity={call.peer.startsWith(XMPP_PREFIX) ? toHex(sha256Bytes(utf8Encode(call.peer))) : call.peer.slice(CONTACT_PREFIX.length)}
        name={place.nameless ? '' : place.name(call.peer)}
        nameless={!!place.nameless}
        encryption={call.peer.startsWith(XMPP_PREFIX) ? t('Encrypted, but its key passes through the XMPP servers') : undefined}
        notice={warned ? ipWarningText(warned).message : undefined}
        speaker={speaker}
        onSpeaker={changeSpeaker}
        onAnswer={answer}
        onClose={() => {
          closeCall(call);
          // A call straight between the two phones that never connected: why, and what helps, said once its screen is gone.
          if (call.failedDirect) ask(t('The call could not connect directly'), directFailedText(), [{ text: t('OK') }]);
        }}
      />
    </Modal>
  );
}

/** Why a call straight between the two phones could not connect, and what helps, in plain words (lib/direct.ts). */
export function directFailedText(): string {
  return t(
    'With no call server between you two, the call goes straight from phone to phone, and one of the two networks let nothing in from outside, as mobile networks often do. Try again from another network, such as a Wi-Fi. Through a call server, a call connects from any network: see Server, under Settings, Server and networks.',
  );
}
