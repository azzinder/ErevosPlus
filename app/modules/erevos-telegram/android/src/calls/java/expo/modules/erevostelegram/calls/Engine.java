// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevostelegram.calls;

import android.content.Context;
import android.util.Base64;

import io.github.pytgcalls.ConnectionInfo;
import io.github.pytgcalls.NTgCalls;
import io.github.pytgcalls.VideoRotation;
import io.github.pytgcalls.media.AudioDescription;
import io.github.pytgcalls.media.DeviceInfo;
import io.github.pytgcalls.media.MediaDescription;
import io.github.pytgcalls.media.MediaDevices;
import io.github.pytgcalls.media.MediaSource;
import io.github.pytgcalls.media.StreamDevice;
import io.github.pytgcalls.media.StreamMode;
import io.github.pytgcalls.media.StreamStatus;
import io.github.pytgcalls.media.VideoDescription;
import io.github.pytgcalls.models.Frame;
import io.github.pytgcalls.models.FrameData;
import io.github.pytgcalls.p2p.Protocol;
import io.github.pytgcalls.p2p.RTCServer;

import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * The sound and pictures of a Telegram call, through NTgCalls (LGPL-3.0, unchanged from Maven Central)
 * and its own WebRTC. It lives in its own class loader (CallsLoader.kt), apart from the WebRTC of
 * Erevos's own calls (react-native-webrtc): both have classes named org.webrtc.*, and each must
 * meet only its own native library. So this class speaks only in plain Java and Android types,
 * JSON text and bytes, never in classes of either WebRTC.
 *
 * TDLib does the calling (who calls, answering, hanging up, the key); this opens the sound with
 * the key TDLib agreed on, and passes the signaling both ways ("signal" with bytes) and how the
 * connection stands ("state" with CONNECTING, CONNECTED, FAILED, TIMEOUT or CLOSED). One call at a
 * time. Every method is called from one thread (the module's), but frames.
 *
 * Video: the camera is the app's (its own WebRTC, outside this room), which hands each picture here
 * as plain I420 bytes (sendFrame). The other's pictures go out the same way, as "frame" with an
 * Object[] { byte[] I420, width, height, rotation in degrees }, and whether their camera is on as
 * "video" with "on" or "off".
 */
public final class Engine {
    private final NTgCalls ntg;
    private volatile long user = 0;
    private boolean muted = false;
    private volatile boolean camera = false;
    private AudioDescription mic = null;
    private final List<byte[]> early = new ArrayList<>();
    private static final int WIDTH = 640;
    private static final int HEIGHT = 480;
    private static final int FPS = 30;

    public Engine(Context context, BiConsumer<String, Object> events) {
        org.webrtc.ContextUtils.initialize(context.getApplicationContext());
        ntg = new NTgCalls();
        ntg.onSignalingData((userId, data) -> {
            if (userId == user) events.accept("signal", data);
        });
        ntg.onConnectionChange((userId, info) -> {
            if (userId == user) events.accept("state", info.state.name());
        });
        ntg.onFrames((userId, mode, device, frames) -> {
            if (userId != user || mode != StreamMode.PLAYBACK || device != StreamDevice.CAMERA || frames.isEmpty()) return;
            Frame f = frames.get(frames.size() - 1);
            events.accept("frame", new Object[] { f.data, f.frame_data.width, f.frame_data.height, degrees(f.frame_data.rotation) });
        });
        ntg.onRemoteSourceChange((userId, source) -> {
            if (userId == user && source.device == StreamDevice.CAMERA) events.accept("video", source.state == StreamStatus.ACTIVE ? "on" : "off");
        });
    }

    /** What this phone can speak, as TDLib's callProtocol in JSON. */
    public static String protocol() throws JSONException {
        Protocol p = NTgCalls.getProtocol();
        JSONObject o = new JSONObject();
        o.put("@type", "callProtocol");
        o.put("udp_p2p", p.udp_p2p);
        o.put("udp_reflector", p.udp_reflector);
        o.put("min_layer", p.min_layer);
        o.put("max_layer", p.max_layer);
        o.put("library_versions", new JSONArray(p.library_versions));
        return o.toString();
    }

    /**
     * Opens the sound of the call with `userId`, once TDLib says it is ready: `ready` is its
     * callStateReady as JSON (servers, key, protocol, p2p), `outgoing` whether this phone called.
     */
    public void start(long userId, boolean outgoing, String ready, boolean withCamera) throws JSONException {
        camera = withCamera;
        if (user == userId) return;
        if (user != 0) stop();
        JSONObject s = new JSONObject(ready);
        byte[] key = Base64.decode(s.getString("encryption_key"), Base64.DEFAULT);
        List<RTCServer> servers = new ArrayList<>();
        JSONArray list = s.optJSONArray("servers");
        for (int i = 0; list != null && i < list.length(); i++) servers.add(server(list.getJSONObject(i)));
        List<String> versions = new ArrayList<>();
        JSONArray v = s.getJSONObject("protocol").optJSONArray("library_versions");
        for (int i = 0; v != null && i < v.length(); i++) versions.add(v.getString(i));
        String custom = s.optString("custom_parameters", "");

        ntg.createP2pCall(userId);
        user = userId;
        MediaDevices devices = NTgCalls.getMediaDevices();
        String mic = first(devices.microphone, "{\"is_microphone\":true}");
        String out = first(devices.speaker, "{\"is_microphone\":false}");
        // What goes: the microphone, and the camera's pictures while it is on. What comes: the
        // other's voice, on this phone's speaker, and their pictures as frames.
        this.mic = new AudioDescription(MediaSource.DEVICE, 48000, 2, mic, true);
        ntg.setStreamSources(userId, StreamMode.CAPTURE, new MediaDescription(this.mic, null, camera ? cameraSource() : null, null));
        ntg.setStreamSources(userId, StreamMode.PLAYBACK, new MediaDescription(new AudioDescription(MediaSource.DEVICE, 48000, 2, out, true), null, new VideoDescription(MediaSource.EXTERNAL, 0, 0, FPS, "", true), null));
        ntg.skipExchange(userId, key, outgoing);
        java.util.Arrays.fill(key, (byte) 0);
        ntg.connectP2p(userId, servers, versions, s.optBoolean("allow_p2p", false), custom.trim().isEmpty() ? null : custom);
        if (muted) ntg.mute(userId);
        for (byte[] data : early) ntg.sendSignalingData(userId, data);
        early.clear();
    }

    /** Signaling from the other phone, through TDLib; kept until the sound is open. */
    public void signal(long userId, byte[] data) {
        if (user != userId) {
            early.add(data);
            return;
        }
        ntg.sendSignalingData(userId, data);
    }

    /** Turns this phone's camera into the call, or out of it. Its frames come by sendFrame. */
    public void camera(boolean on) {
        camera = on;
        if (user == 0 || mic == null) return;
        ntg.setStreamSources(user, StreamMode.CAPTURE, new MediaDescription(mic, null, on ? cameraSource() : null, null));
    }

    /** One picture of this phone's camera, I420 planes one after another without padding. */
    public void sendFrame(byte[] data, int width, int height, int rotation, long ms) {
        long to = user;
        if (to == 0 || !camera) return;
        try {
            ntg.sendExternalFrame(to, StreamDevice.CAMERA, data, new FrameData(ms, rotationOf(rotation), width, height));
        } catch (RuntimeException ignored) {
            // The call closed between two frames.
        }
    }

    private static VideoDescription cameraSource() {
        return new VideoDescription(MediaSource.EXTERNAL, WIDTH, HEIGHT, FPS, "", true);
    }

    private static VideoRotation rotationOf(int degrees) {
        switch (degrees) {
            case 90: return VideoRotation.VIDEO_ROTATION_90;
            case 180: return VideoRotation.VIDEO_ROTATION_180;
            case 270: return VideoRotation.VIDEO_ROTATION_270;
            default: return VideoRotation.VIDEO_ROTATION_0;
        }
    }

    private static int degrees(VideoRotation r) {
        if (r == VideoRotation.VIDEO_ROTATION_90) return 90;
        if (r == VideoRotation.VIDEO_ROTATION_180) return 180;
        if (r == VideoRotation.VIDEO_ROTATION_270) return 270;
        return 0;
    }

    public void mute(boolean on) {
        muted = on;
        if (user == 0) return;
        if (on) ntg.mute(user);
        else ntg.unmute(user);
    }

    /** Closes the sound of the call. */
    public void stop() {
        early.clear();
        muted = false;
        camera = false;
        mic = null;
        if (user == 0) return;
        long was = user;
        user = 0;
        try {
            ntg.stop(was);
        } catch (RuntimeException ignored) {
            // Already closed.
        }
    }

    private static String first(List<DeviceInfo> list, String otherwise) {
        return list == null || list.isEmpty() ? otherwise : list.get(0).metadata;
    }

    /** One of TDLib's callServer in JSON, as NTgCalls takes it. */
    private static RTCServer server(JSONObject o) throws JSONException {
        JSONObject t = o.getJSONObject("type");
        long id = Long.parseLong(o.get("id").toString());
        String v4 = o.optString("ip_address", "");
        String v6 = o.optString("ipv6_address", "");
        int port = o.optInt("port");
        switch (t.optString("@type")) {
            case "callServerTypeTelegramReflector":
                return new RTCServer(id, v4, v6, port, null, null, true, false, t.optBoolean("is_tcp"), Base64.decode(t.optString("peer_tag", ""), Base64.DEFAULT));
            case "callServerTypeWebrtc":
                return new RTCServer(id, v4, v6, port, t.optString("username"), t.optString("password"), t.optBoolean("supports_turn"), t.optBoolean("supports_stun"), false, null);
            default:
                return new RTCServer(id, v4, v6, port, null, null, false, false, false, null);
        }
    }
}
