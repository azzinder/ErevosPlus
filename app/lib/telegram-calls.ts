// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Telegram voice and video calls in the ErevosGram build. TDLib does the calling (createCall, acceptCall,
// discardCall, and the key it agrees on with the other phone, shown as four emoji to compare);
// the sound goes through NTgCalls in its own class loader (modules/erevos-telegram, Calls.kt),
// which this starts once TDLib says the call is ready, and between the two goes the signaling,
// both ways, through TDLib. One call at a time on the phone, whichever space it is in. In a video
// call each side turns its own camera on or off; the pictures are drawn by the module itself
// (TelegramVideoView), never passed through here.
//
// Telegram calls are Telegram's own encryption, end to end between the two phones (the emoji say
// so when they match); the ErevosGram encryption is only for messages.

/** How a call stands, from TDLib's callState and how the sound connects. */
export type TgCallStage = 'ringing' | 'calling' | 'connecting' | 'talking' | 'ended';

export type TgCall = {
  id: number;
  userId: number;
  outgoing: boolean;
  video: boolean;
  stage: TgCallStage;
  /** The four emoji of the call's key, to compare aloud; once the key is agreed. */
  emojis: string[];
  /** When the sound connected (ms), for the call's length. */
  since: number | null;
  muted: boolean;
  /** This phone's camera is on in the call. */
  camera: boolean;
  /** The other phone's camera is on: their picture shows. */
  remoteVideo: boolean;
  /** Why it ended: missed, declined, disconnected, hung up, or TDLib's error. */
  why: string;
};

/** What NTgCalls offers, as the module gives it; replaced in the checks. */
export type CallsNativeLike = {
  callProtocol(): Promise<string>;
  callStart(userId: number, outgoing: boolean, ready: string, camera: boolean): Promise<void>;
  /** This phone's camera into the call or out of it (the module's camera); absent in the checks' stand-in. */
  callCamera?(on: boolean): Promise<void>;
  callSwitchCamera?(): Promise<void>;
  callSignal(userId: number, data: string): Promise<void>;
  callMute(on: boolean): Promise<void>;
  callStop(): Promise<void>;
};

type Raw = Record<string, unknown>;

/** A TDLib `call` read into what the screen shows; null when it is not one. */
export function readCall(raw: unknown, before?: TgCall): TgCall | null {
  const c = raw as Raw | null;
  if (!c || typeof c.id !== 'number') return null;
  const state = (c.state ?? {}) as Raw;
  const kind = String(state['@type'] ?? '');
  const outgoing = c.is_outgoing === true;
  const call: TgCall = {
    id: c.id,
    userId: Number(c.user_id ?? 0),
    outgoing,
    video: c.is_video === true,
    stage: outgoing ? 'calling' : 'ringing',
    emojis: before?.emojis ?? [],
    since: before?.since ?? null,
    muted: before?.muted ?? false,
    camera: before?.camera ?? false,
    remoteVideo: before?.remoteVideo ?? false,
    why: '',
  };
  switch (kind) {
    case 'callStatePending':
      // Not answered yet: still ringing.
      call.stage = outgoing ? 'calling' : 'ringing';
      break;
    case 'callStateExchangingKeys':
      call.stage = 'connecting';
      break;
    case 'callStateReady':
      call.stage = before?.stage === 'talking' ? 'talking' : 'connecting';
      call.emojis = Array.isArray(state.emojis) ? (state.emojis as unknown[]).map(String) : [];
      break;
    case 'callStateHangingUp':
      call.stage = 'ended';
      call.why = 'hung up';
      break;
    case 'callStateDiscarded':
      call.stage = 'ended';
      call.why = discardWhy((state.reason as Raw | undefined)?.['@type']);
      break;
    case 'callStateError':
      call.stage = 'ended';
      call.why = String(((state.error as Raw | undefined)?.message as string | undefined) ?? 'error');
      break;
    default:
      call.stage = before?.stage ?? call.stage;
  }
  return call;
}

function discardWhy(type: unknown): string {
  switch (type) {
    case 'callDiscardReasonMissed':
      return 'missed';
    case 'callDiscardReasonDeclined':
      return 'declined';
    case 'callDiscardReasonDisconnected':
      return 'disconnected';
    default:
      return 'hung up';
  }
}

/** TDLib's callProtocol when the module cannot say: what NTgCalls 3 speaks. */
export const FALLBACK_PROTOCOL = { '@type': 'callProtocol', udp_p2p: true, udp_reflector: true, min_layer: 65, max_layer: 92, library_versions: ['10.0.0', '11.0.0'] };

/**
 * One space's Telegram calls: told TDLib's updates, it asks TDLib (`request`) and the sound
 * (`native`). The sound is the phone's, one call at a time, so a second call while one goes on
 * is declined as busy.
 */
export class TelegramCalls {
  private calls = new Map<number, TgCall>();
  private readonly request: (body: Raw) => Promise<Raw>;
  private readonly native: () => CallsNativeLike | null;
  private readonly changed: () => void;
  private readonly now: () => number;
  /** The call whose sound is open (or opening) on this phone. */
  private sound: number | null = null;
  /** The camera asked for by the call we start, until its first update says its id. */
  private cameraOut = false;

  constructor(request: (body: Raw) => Promise<Raw>, native: () => CallsNativeLike | null, changed: () => void, now: () => number = Date.now) {
    this.request = request;
    this.native = native;
    this.changed = changed;
    this.now = now;
  }

  /** The call going on now, or ringing, or the one that just ended (until it is let go of). */
  current(): TgCall | null {
    let last: TgCall | null = null;
    for (const c of this.calls.values()) {
      if (c.stage !== 'ended') return c;
      last = c;
    }
    return last;
  }

  /** Lets go of an ended call, once its screen has shown how it ended. */
  forget(id: number): void {
    const c = this.calls.get(id);
    if (c && c.stage === 'ended' && this.calls.delete(id)) this.changed();
  }

  /** Reads one of TDLib's updates; says whether it was about calls. */
  take(update: Raw): boolean {
    if (update['@type'] === 'updateCall') {
      const raw = update.call as Raw;
      const id = Number(raw?.id);
      const before = this.calls.get(id);
      const call = readCall(raw, before);
      if (!call) return true;
      // A second call while one goes on: busy.
      const other = [...this.calls.values()].find((c) => c.id !== id && c.stage !== 'ended');
      if (!before && other && !call.outgoing && call.stage === 'ringing') {
        void this.request({ '@type': 'discardCall', call_id: id, is_disconnected: false, invite_link: '', duration: 0, is_video: false, connection_id: '0' }).catch(() => undefined);
        return true;
      }
      if (!before && call.outgoing) call.camera = this.cameraOut;
      this.calls.set(id, call);
      const state = (raw.state ?? {}) as Raw;
      if (state['@type'] === 'callStateReady' && this.sound !== id) void this.open(call, state);
      if (call.stage === 'ended' && this.sound === id) void this.close();
      this.changed();
      return true;
    }
    if (update['@type'] === 'updateNewCallSignalingData') {
      const call = this.calls.get(Number(update.call_id));
      const native = this.native();
      if (call && native && typeof update.data === 'string') void native.callSignal(call.userId, update.data).catch(() => undefined);
      return true;
    }
    return false;
  }

  /** What the sound says: signaling to pass to the other phone, or how it connects. */
  fromSound(kind: string, data: string): void {
    const id = this.sound;
    const call = id === null ? undefined : this.calls.get(id);
    if (!call) return;
    if (kind === 'signal') {
      void this.request({ '@type': 'sendCallSignalingData', call_id: call.id, data }).catch(() => undefined);
      return;
    }
    if (kind === 'video') {
      call.remoteVideo = data === 'on';
      this.changed();
      return;
    }
    if (kind !== 'state') return;
    if (data === 'CONNECTED' && call.stage !== 'talking') {
      call.stage = 'talking';
      call.since = this.now();
      this.changed();
    } else if (data === 'FAILED' || data === 'TIMEOUT') {
      void this.hangUp(call.id, true);
    }
  }

  private async protocol(): Promise<Raw> {
    const native = this.native();
    if (!native) return FALLBACK_PROTOCOL;
    try {
      return JSON.parse(await native.callProtocol()) as Raw;
    } catch {
      return FALLBACK_PROTOCOL;
    }
  }

  /** Calls someone, with this phone's camera on when `video` (the camera permission given). */
  async call(userId: number, video = false): Promise<void> {
    if ([...this.calls.values()].some((c) => c.stage !== 'ended')) throw new Error('busy');
    this.cameraOut = video;
    const answer = await this.request({ '@type': 'createCall', user_id: userId, protocol: await this.protocol(), is_video: video });
    // The call comes with its updateCall; its id is in the answer too.
    void answer;
  }

  /** Answers a call that rings, with this phone's camera on when `camera` (the camera permission given). */
  async answer(id: number, camera = false): Promise<void> {
    const call = this.calls.get(id);
    if (call) call.camera = camera;
    await this.request({ '@type': 'acceptCall', call_id: id, protocol: await this.protocol() });
  }

  /** Turns this phone's camera on in the call going on, or off (the camera permission given). */
  async camera(on: boolean): Promise<void> {
    const call = this.current();
    if (!call || call.stage === 'ended') return;
    call.camera = on;
    if (this.sound === call.id) await this.native()?.callCamera?.(on);
    this.changed();
  }

  /** The front camera or the back one. */
  async switchCamera(): Promise<void> {
    await this.native()?.callSwitchCamera?.();
  }

  /** Hangs up, declines or cancels; `lost` when the sound could not connect. */
  async hangUp(id: number, lost = false): Promise<void> {
    const call = this.calls.get(id);
    const duration = call?.since ? Math.round((this.now() - call.since) / 1000) : 0;
    if (this.sound === id) await this.close();
    await this.request({ '@type': 'discardCall', call_id: id, is_disconnected: lost, invite_link: '', duration, is_video: !!call?.video, connection_id: '0' }).catch(() => undefined);
  }

  async mute(on: boolean): Promise<void> {
    const call = this.current();
    if (!call || call.stage === 'ended') return;
    call.muted = on;
    await this.native()?.callMute(on);
    this.changed();
  }

  /** The space closes: its call ends with it. */
  async stop(): Promise<void> {
    for (const c of this.calls.values()) if (c.stage !== 'ended') await this.hangUp(c.id);
    if (this.sound !== null) await this.close();
    this.calls.clear();
  }

  private async open(call: TgCall, ready: Raw): Promise<void> {
    const native = this.native();
    if (!native) return;
    this.sound = call.id;
    try {
      await native.callStart(call.userId, call.outgoing, JSON.stringify(ready), call.camera);
      if (call.muted) await native.callMute(true);
    } catch {
      if (this.sound === call.id) await this.hangUp(call.id, true);
    }
  }

  private async close(): Promise<void> {
    this.sound = null;
    await this.native()?.callStop().catch(() => undefined);
  }
}
