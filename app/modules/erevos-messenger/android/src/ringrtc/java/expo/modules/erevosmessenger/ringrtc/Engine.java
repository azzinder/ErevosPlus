// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosmessenger.ringrtc;

import android.content.Context;
import android.util.Base64;
import android.view.View;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.BiConsumer;

import org.json.JSONArray;
import org.json.JSONObject;
import org.signal.ringrtc.AudioConfig;
import org.signal.ringrtc.CallException;
import org.signal.ringrtc.CallId;
import org.signal.ringrtc.CallManager;
import org.signal.ringrtc.CallSummary;
import org.signal.ringrtc.CameraControl;
import org.signal.ringrtc.GroupCall;
import org.signal.ringrtc.HttpHeader;
import org.signal.ringrtc.Log;
import org.signal.ringrtc.NetworkRoute;
import org.signal.ringrtc.Remote;
import org.webrtc.Camera2Enumerator;
import org.webrtc.CameraVideoCapturer;
import org.webrtc.CapturerObserver;
import org.webrtc.EglBase;
import org.webrtc.PeerConnection;
import org.webrtc.RendererCommon;
import org.webrtc.SurfaceTextureHelper;
import org.webrtc.SurfaceViewRenderer;
import org.webrtc.VideoFrame;
import org.webrtc.VideoSink;

/**
 * Signal's 1:1 calls with RingRTC, Signal's own calling library, in a room of its own.
 *
 * RingRTC brings its own WebRTC (org.webrtc.* and libringrtc_rffi.so), and Erevos already has
 * another (react-native-webrtc, org.jitsi:webrtc), with classes of the same names. So this class,
 * RingRTC and its WebRTC are not in the app's dex: the build puts them, as dex, in the asset
 * ringrtc.jar, and SignalCalls.kt loads them with a class loader of their own, as the Telegram
 * calls are (modules/erevos-telegram). Only plain types cross between the two rooms: Context,
 * View, String, boolean and BiConsumer.
 *
 * What it tells the app (`events`): "send" with the JSON of a call message for the Signal engine
 * (its callSend op), "start" with the JSON of a call RingRTC begins (the app then gets Signal's
 * TURN servers and calls proceed), and "state" with the JSON of how the call stands.
 *
 * Every call into it comes on one thread of the app's (SignalCalls.kt); RingRTC's own callbacks
 * come on its threads and only pass events on. The phone's sound for the call (earpiece or
 * loudspeaker) is the app's, as for Erevos's other calls (modules/erevos-call).
 */
public final class Engine implements CallManager.Observer {
  private static final String TAG = "ErevosSignalCalls";

  /** The other side of a call, as RingRTC knows it: their ACI. */
  private static final class Peer implements Remote {
    final String uuid;

    Peer(String uuid) {
      this.uuid = uuid;
    }

    @Override
    public boolean recipientEquals(Remote other) {
      return other instanceof Peer && ((Peer) other).uuid.equals(uuid);
    }
  }

  /** Where RingRTC's pictures go: to the renderer shown now, if any. */
  private static final class Sink implements VideoSink {
    volatile VideoSink target;

    @Override
    public void onFrame(VideoFrame frame) {
      VideoSink t = target;
      if (t != null) t.onFrame(frame);
    }
  }

  private final Context context;
  private final BiConsumer<String, Object> events;
  private final CallManager manager;
  private final EglBase egl;
  private final Sink localSink = new Sink();
  private final Sink remoteSink = new Sink();
  private final Camera camera;
  private final Map<String, Peer> peers = new HashMap<>();

  // The call going on (one at a time), as the app is told it.
  private CallId callId;
  private Peer peer;
  private boolean outgoing;
  private boolean video;
  private boolean cameraOn;
  private boolean muted;
  private boolean remoteVideo;
  private String stage = "";
  private SurfaceViewRenderer localView;
  private SurfaceViewRenderer remoteView;

  public Engine(Context context, BiConsumer<String, Object> events) throws CallException {
    this.context = context.getApplicationContext();
    this.events = events;
    Log.Logger logger = new Log.Logger() {
      @Override public void v(String tag, String message, Throwable t) {}
      @Override public void d(String tag, String message, Throwable t) {}
      @Override public void i(String tag, String message, Throwable t) { android.util.Log.i(TAG, tag + ": " + message); }
      @Override public void w(String tag, String message, Throwable t) { android.util.Log.w(TAG, tag + ": " + message); }
      @Override public void e(String tag, String message, Throwable t) { android.util.Log.e(TAG, tag + ": " + message); }
    };
    CallManager.initialize(this.context, logger, new HashMap<>());
    this.manager = CallManager.createCallManager(this);
    this.egl = EglBase.create();
    this.camera = new Camera(this.context, egl);
  }

  private Peer peerOf(String uuid) {
    Peer p = peers.get(uuid);
    if (p == null) {
      p = new Peer(uuid);
      peers.put(uuid, p);
    }
    return p;
  }

  private static byte[] bytes(String b64) {
    return b64 == null || b64.isEmpty() ? new byte[0] : Base64.decode(b64, Base64.NO_WRAP);
  }

  private static String b64(byte[] b) {
    return Base64.encodeToString(b, Base64.NO_WRAP);
  }

  private static CallId idOf(String text) {
    return new CallId(Long.parseUnsignedLong(text));
  }

  private static String text(CallId id) {
    return Long.toUnsignedString(id.longValue());
  }

  private void send(JSONObject message) {
    events.accept("send", message.toString());
  }

  private void state(String why) {
    try {
      JSONObject s = new JSONObject();
      s.put("stage", stage);
      s.put("callId", callId == null ? "" : text(callId));
      s.put("uuid", peer == null ? "" : peer.uuid);
      s.put("outgoing", outgoing);
      s.put("video", video);
      s.put("camera", cameraOn);
      s.put("muted", muted);
      s.put("remoteVideo", remoteVideo);
      s.put("why", why == null ? "" : why);
      events.accept("state", s.toString());
    } catch (Exception e) {
      android.util.Log.w(TAG, "state: " + e.getMessage());
    }
  }

  // ---- what the app asks ----

  /** Who we are on Signal (our ACI). */
  public void setSelf(String uuid) throws CallException {
    manager.setSelfUuid(UUID.fromString(uuid));
  }

  /** Calls someone; RingRTC then asks to start (onStartCall). */
  public void call(String uuid, boolean withVideo, int myDevice) throws CallException {
    if (callId != null || "calling".equals(stage)) throw new CallException("busy");
    peer = peerOf(uuid);
    outgoing = true;
    video = withVideo;
    cameraOn = withVideo;
    muted = false;
    remoteVideo = false;
    stage = "calling";
    state(null);
    manager.call(peer, withVideo ? CallManager.CallMediaType.VIDEO_CALL : CallManager.CallMediaType.AUDIO_CALL, myDevice);
  }

  /** A call message from the Signal engine (its signalCall event, as JSON). */
  public void receive(String json) throws Exception {
    JSONObject m = new JSONObject(json);
    String kind = m.optString("kind");
    Peer from = peerOf(m.optString("uuid"));
    int device = m.optInt("device", 1);
    switch (kind) {
      case "offer":
        manager.receivedOffer(idOf(m.getString("callId")), from, device, bytes(m.optString("opaque")),
            m.optLong("ageSecs", 0),
            m.optBoolean("video") ? CallManager.CallMediaType.VIDEO_CALL : CallManager.CallMediaType.AUDIO_CALL,
            m.optInt("myDevice", 1), bytes(m.optString("theirIdentity")), bytes(m.optString("myIdentity")));
        break;
      case "answer":
        manager.receivedAnswer(idOf(m.getString("callId")), from, device, bytes(m.optString("opaque")),
            bytes(m.optString("theirIdentity")), bytes(m.optString("myIdentity")));
        break;
      case "ice": {
        JSONArray list = m.optJSONArray("candidates");
        List<byte[]> candidates = new ArrayList<>();
        for (int i = 0; list != null && i < list.length(); i++) candidates.add(bytes(list.getString(i)));
        manager.receivedIceCandidates(idOf(m.getString("callId")), from, device, candidates);
        break;
      }
      case "hangup":
        manager.receivedHangup(idOf(m.getString("callId")), from, device, hangupType(m.optString("hangupType")), m.optInt("hangupDevice", 0));
        break;
      case "busy":
        manager.receivedBusy(idOf(m.getString("callId")), from, device);
        break;
      case "opaque":
        manager.receivedCallMessage(UUID.fromString(from.uuid), device, m.optInt("myDevice", 1), bytes(m.optString("opaque")), m.optLong("ageSecs", 0));
        break;
      default:
        break;
    }
  }

  /**
   * Goes on with the call RingRTC began (outgoing or ringing), with Signal's TURN servers as the
   * engine's callRelays gives them (JSON). Hides our address behind them when `hideIp`.
   */
  public void proceed(String id, String relays, boolean hideIp) throws Exception {
    List<PeerConnection.IceServer> servers = new ArrayList<>();
    JSONArray list = new JSONArray(relays);
    for (int i = 0; i < list.length(); i++) {
      JSONObject r = list.getJSONObject(i);
      JSONArray urls = r.optJSONArray("urls");
      List<String> u = new ArrayList<>();
      for (int j = 0; urls != null && j < urls.length(); j++) u.add(urls.getString(j));
      if (u.isEmpty()) continue;
      PeerConnection.IceServer.Builder b = PeerConnection.IceServer.builder(u).setUsername(r.optString("username")).setPassword(r.optString("password"));
      String host = r.optString("hostname");
      if (!host.isEmpty()) b.setHostname(host);
      servers.add(b.createIceServer());
    }
    AudioConfig audio = new AudioConfig();
    audio.useOboe = false;
    audio.useSoftwareAec = false;
    audio.useSoftwareNs = false;
    audio.useInputLowLatency = true;
    audio.useInputVoiceComm = true;
    manager.proceed(idOf(id), context, egl, audio, localSink, remoteSink, camera, servers, hideIp,
        CallManager.DataMode.NORMAL, null, cameraOn);
  }

  /** The app says the call message RingRTC asked for went out, or did not. */
  public void sent(String id, boolean ok) throws CallException {
    if (ok) manager.messageSent(idOf(id));
    else manager.messageSendFailure(idOf(id));
  }

  /** Answers the call that rings, with this phone's camera on when `withCamera`. */
  public void accept(boolean withCamera) throws CallException {
    if (callId == null) return;
    cameraOn = withCamera;
    manager.acceptCall(callId);
    if (withCamera) manager.setVideoEnable(true);
  }

  /** Hangs up, declines or cancels. */
  public void hangup() throws CallException {
    manager.hangup();
  }

  /** Drops a call RingRTC began that the app cannot take (busy elsewhere). */
  public void drop(String id) throws CallException {
    manager.drop(idOf(id));
  }

  public void mute(boolean on) throws CallException {
    muted = on;
    manager.setAudioEnable(!on);
    state(null);
  }

  /** Turns this phone's camera into the call, or out of it. */
  public void camera(boolean on) throws CallException {
    cameraOn = on;
    manager.setVideoEnable(on);
    state(null);
  }

  public void flip() {
    camera.flip();
  }

  /** A view with the other side's picture ("remote") or ours ("local"), for the call's screen. */
  public View view(Context activity, String side) {
    boolean local = "local".equals(side);
    SurfaceViewRenderer r = new SurfaceViewRenderer(activity);
    r.init(egl.getEglBaseContext(), null);
    r.setMirror(local);
    r.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FILL);
    r.setEnableHardwareScaler(true);
    if (local) {
      r.setZOrderMediaOverlay(true);
      release(localView);
      localView = r;
      localSink.target = r;
    } else {
      release(remoteView);
      remoteView = r;
      remoteSink.target = r;
    }
    return r;
  }

  /** The screen let go of a view. */
  public void forget(View v) {
    if (v == localView) {
      localSink.target = null;
      localView = null;
    }
    if (v == remoteView) {
      remoteSink.target = null;
      remoteView = null;
    }
    if (v instanceof SurfaceViewRenderer) release((SurfaceViewRenderer) v);
  }

  private static void release(SurfaceViewRenderer r) {
    if (r == null) return;
    try {
      r.release();
    } catch (Exception ignored) {
      // Already let go of.
    }
  }

  // ---- RingRTC's callbacks ----

  @Override
  public void onStartCall(Remote remote, CallId id, Boolean isOutgoing, CallManager.CallMediaType type) {
    Peer p = (Peer) remote;
    callId = id;
    peer = p;
    outgoing = Boolean.TRUE.equals(isOutgoing);
    video = type == CallManager.CallMediaType.VIDEO_CALL;
    if (!outgoing) {
      cameraOn = false;
      muted = false;
      remoteVideo = false;
      stage = "incoming";
    }
    try {
      JSONObject s = new JSONObject();
      s.put("callId", text(id));
      s.put("uuid", p.uuid);
      s.put("outgoing", outgoing);
      s.put("video", video);
      events.accept("start", s.toString());
    } catch (Exception e) {
      android.util.Log.w(TAG, "start: " + e.getMessage());
    }
    state(null);
  }

  @Override
  public void onCallEvent(Remote remote, CallManager.CallEvent event) {
    switch (event) {
      case LOCAL_RINGING:
        stage = "ringing";
        break;
      case REMOTE_RINGING:
        stage = "calling";
        break;
      case LOCAL_CONNECTED:
      case REMOTE_CONNECTED:
        stage = "talking";
        break;
      case REMOTE_VIDEO_ENABLE:
        remoteVideo = true;
        break;
      case REMOTE_VIDEO_DISABLE:
        remoteVideo = false;
        break;
      case RECONNECTING:
        stage = "reconnecting";
        break;
      case RECONNECTED:
        stage = "talking";
        break;
      case RECEIVED_OFFER_WHILE_ACTIVE:
      case RECEIVED_OFFER_EXPIRED:
      case RECEIVED_OFFER_WITH_GLARE:
      case GLARE_HANDLING_FAILURE:
        // Another call that could not be taken: missed; the one going on goes on.
        events.accept("missed", remote instanceof Peer ? ((Peer) remote).uuid : "");
        return;
      default:
        break;
    }
    state(null);
  }

  @Override
  public void onCallEnded(Remote remote, CallManager.CallEndReason reason, CallSummary summary) {
    // A call that ended which is not the one shown (a second one, dropped) changes nothing here.
    if (peer != null && remote != null && !peer.recipientEquals(remote) && callId != null) return;
    stage = "ended";
    String why;
    switch (reason) {
      case LOCAL_HANGUP:
      case REMOTE_HANGUP:
      case REMOTE_HANGUP_ACCEPTED:
        why = "hung up";
        break;
      case REMOTE_HANGUP_DECLINED:
        why = "declined";
        break;
      case REMOTE_BUSY:
      case REMOTE_HANGUP_BUSY:
        why = "busy";
        break;
      case TIMEOUT:
        why = outgoing ? "no answer" : "missed";
        break;
      case REMOTE_HANGUP_NEED_PERMISSION:
        why = "needs permission";
        break;
      case CONNECTION_FAILURE:
      case ICE_FAILED_WHILE_CONNECTING:
      case ICE_FAILED_AFTER_CONNECTED:
      case SIGNALING_FAILURE:
        why = "disconnected";
        break;
      default:
        why = reason.name().toLowerCase();
        break;
    }
    state(why);
    camera.stop();
    callId = null;
  }

  @Override
  public void onCallConcluded(Remote remote) {
    // RingRTC let go of the call: nothing more to do.
  }

  @Override
  public void onNetworkRouteChanged(Remote remote, NetworkRoute route) {}

  @Override
  public void onAudioLevels(Remote remote, int captured, int received) {}

  @Override
  public void onLowBandwidthForVideo(Remote remote, boolean low) {}

  private JSONObject message(CallId id, Remote remote, Integer device, Boolean broadcast, String kind) {
    JSONObject m = new JSONObject();
    try {
      m.put("callId", text(id));
      m.put("uuid", ((Peer) remote).uuid);
      m.put("kind", kind);
      // To one of their devices, or all of them.
      m.put("device", Boolean.TRUE.equals(broadcast) || device == null ? 0 : device);
    } catch (Exception ignored) {
      // Plain values: cannot fail.
    }
    return m;
  }

  @Override
  public void onSendOffer(CallId id, Remote remote, Integer device, Boolean broadcast, byte[] opaque, CallManager.CallMediaType type) {
    JSONObject m = message(id, remote, device, broadcast, "offer");
    try {
      m.put("opaque", b64(opaque));
      m.put("video", type == CallManager.CallMediaType.VIDEO_CALL);
    } catch (Exception ignored) {
    }
    send(m);
  }

  @Override
  public void onSendAnswer(CallId id, Remote remote, Integer device, Boolean broadcast, byte[] opaque) {
    JSONObject m = message(id, remote, device, broadcast, "answer");
    try {
      m.put("opaque", b64(opaque));
    } catch (Exception ignored) {
    }
    send(m);
  }

  @Override
  public void onSendIceCandidates(CallId id, Remote remote, Integer device, Boolean broadcast, List<byte[]> candidates) {
    JSONObject m = message(id, remote, device, broadcast, "ice");
    JSONArray list = new JSONArray();
    for (byte[] c : candidates) list.put(b64(c));
    try {
      m.put("candidates", list);
    } catch (Exception ignored) {
    }
    send(m);
  }

  @Override
  public void onSendHangup(CallId id, Remote remote, Integer device, Boolean broadcast, CallManager.HangupType type, Integer hangupDevice) {
    JSONObject m = message(id, remote, device, broadcast, "hangup");
    try {
      m.put("hangupType", hangupWord(type));
      m.put("hangupDevice", hangupDevice == null ? 0 : hangupDevice);
    } catch (Exception ignored) {
    }
    send(m);
  }

  @Override
  public void onSendBusy(CallId id, Remote remote, Integer device, Boolean broadcast) {
    send(message(id, remote, device, broadcast, "busy"));
  }

  @Override
  public void onSendCallMessage(UUID recipient, byte[] opaque, CallManager.CallMessageUrgency urgency) {
    JSONObject m = new JSONObject();
    try {
      m.put("uuid", recipient.toString());
      m.put("kind", "opaque");
      m.put("opaque", b64(opaque));
      m.put("urgent", urgency == CallManager.CallMessageUrgency.HANDLE_IMMEDIATELY);
    } catch (Exception ignored) {
    }
    send(m);
  }

  @Override
  public void onSendCallMessageToGroup(byte[] groupId, byte[] opaque, CallManager.CallMessageUrgency urgency, List<UUID> recipients) {
    // Group calls: not yet.
  }

  @Override
  public void onSendHttpRequest(long requestId, String url, CallManager.HttpMethod method, List<HttpHeader> headers, byte[] body) {
    // Only group calls and call links ask for these: not yet.
    try {
      manager.httpRequestFailed(requestId);
    } catch (CallException ignored) {
    }
  }

  @Override
  public void onGroupCallRingUpdate(byte[] groupId, long ringId, UUID sender, CallManager.RingUpdate update) {}

  private static CallManager.HangupType hangupType(String word) {
    switch (word) {
      case "accepted": return CallManager.HangupType.ACCEPTED;
      case "declined": return CallManager.HangupType.DECLINED;
      case "busy": return CallManager.HangupType.BUSY;
      case "needPermission": return CallManager.HangupType.NEED_PERMISSION;
      default: return CallManager.HangupType.NORMAL;
    }
  }

  private static String hangupWord(CallManager.HangupType type) {
    switch (type) {
      case ACCEPTED: return "accepted";
      case DECLINED: return "declined";
      case BUSY: return "busy";
      case NEED_PERMISSION: return "needPermission";
      default: return "normal";
    }
  }

  /** Lets everything go: the app stops Signal. */
  public void close() {
    try {
      manager.reset();
    } catch (CallException ignored) {
    }
    release(localView);
    release(remoteView);
    camera.stop();
  }

  /** The phone's camera, as RingRTC asks for it: started, stopped, turned to the other side. */
  private static final class Camera implements CameraControl {
    private final Context context;
    private final EglBase egl;
    private CameraVideoCapturer capturer;
    private SurfaceTextureHelper helper;
    private boolean front = true;
    private boolean running;

    Camera(Context context, EglBase egl) {
      this.context = context;
      this.egl = egl;
    }

    private String pick(Camera2Enumerator e, boolean wantFront) {
      for (String name : e.getDeviceNames()) if (e.isFrontFacing(name) == wantFront) return name;
      String[] all = e.getDeviceNames();
      return all.length > 0 ? all[0] : null;
    }

    @Override
    public boolean hasCapturer() {
      return Camera2Enumerator.isSupported(context) && new Camera2Enumerator(context).getDeviceNames().length > 0;
    }

    @Override
    public void initCapturer(CapturerObserver observer) {
      Camera2Enumerator e = new Camera2Enumerator(context);
      String name = pick(e, front);
      if (name == null) return;
      stop();
      capturer = e.createCapturer(name, null);
      helper = SurfaceTextureHelper.create("erevos-signal-camera", egl.getEglBaseContext());
      capturer.initialize(helper, context, observer);
    }

    @Override
    public void setEnabled(boolean on) {
      if (capturer == null) return;
      try {
        if (on && !running) {
          capturer.startCapture(1280, 720, 30);
          running = true;
        } else if (!on && running) {
          capturer.stopCapture();
          running = false;
        }
      } catch (Exception e) {
        android.util.Log.w(TAG, "camera: " + e.getMessage());
      }
    }

    @Override
    public void flip() {
      if (capturer == null) return;
      front = !front;
      capturer.switchCamera(null);
    }

    @Override
    public void setOrientation(Integer degrees) {}

    void stop() {
      setEnabled(false);
      if (capturer != null) {
        capturer.dispose();
        capturer = null;
      }
      if (helper != null) {
        helper.dispose();
        helper = null;
      }
    }
  }
}
