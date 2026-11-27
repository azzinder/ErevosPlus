// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.calls

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Handler
import android.os.Looper
import eu.erevos.messenger.engine.EngineHost
import eu.erevos.messenger.session.Session
import java.nio.ByteBuffer
import java.util.UUID
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import org.json.JSONArray
import org.json.JSONObject
import org.webrtc.AudioSource
import org.webrtc.AudioTrack
import org.webrtc.Camera2Enumerator
import org.webrtc.CameraVideoCapturer
import org.webrtc.DataChannel
import org.webrtc.DefaultVideoDecoderFactory
import org.webrtc.DefaultVideoEncoderFactory
import org.webrtc.EglBase
import org.webrtc.IceCandidate
import org.webrtc.MediaConstraints
import org.webrtc.MediaStream
import org.webrtc.PeerConnection
import org.webrtc.PeerConnectionFactory
import org.webrtc.RtpReceiver
import org.webrtc.SdpObserver
import org.webrtc.SessionDescription
import org.webrtc.SurfaceTextureHelper
import org.webrtc.VideoFrame
import org.webrtc.VideoSink
import org.webrtc.VideoSource
import org.webrtc.VideoTrack
import org.webrtc.audio.JavaAudioDeviceModule

/**
 * Session calls, one at a time, as the official Session apps make them: WebRTC with Session's
 * own TURN servers, the offer, answer and network candidates sent as Session call messages
 * (PRE_OFFER rings, OFFER, ANSWER, ICE_CANDIDATES, END_CALL), and a "signaling" data channel
 * that says when the camera goes on or off and when the other side hangs up. Everything here
 * runs on the main thread except the WebRTC work ([rtc]) and the sending ([send]).
 */
object SessionCalls {
    /**
     * What the call screen and its notifications say, by key. Greek here; a host app in another
     * language gives its own words with [setTexts] (Erevos+ gives its t() words).
     */
    private val texts = mutableMapOf(
        "channel" to "Κλήσεις Session",
        "incoming" to "Κλήση Session",
        "missed" to "Αναπάντητη κλήση Session",
        "ringing" to "Κλήση Session…",
        "calling" to "Καλεί…",
        "connecting" to "Συνδέεται…",
        "notStarted" to "Η κλήση δεν ξεκίνησε:",
        "failed" to "Η κλήση απέτυχε:",
        "noAnswer" to "Δεν απάντησε.",
        "ended" to "Η κλήση τελείωσε.",
        "lost" to "Η σύνδεση χάθηκε.",
        "decline" to "Απόρριψη",
        "answer" to "Απάντηση",
        "mute" to "Σίγαση",
        "unmute" to "Μικρόφωνο",
        "speaker" to "Ηχείο",
        "earpiece" to "Ακουστικό",
        "camera" to "Κάμερα",
        "cameraOff" to "Χωρίς κάμερα",
        "hangUp" to "Κλείσιμο",
        "quietChannel" to "Κλήσεις Session από συνομιλίες σε σίγαση",
    )

    fun text(key: String): String = synchronized(texts) { texts[key].orEmpty() }

    /** Words of the host app in place of the Greek ones (keys as above; others are left). */
    fun setTexts(words: JSONObject) {
        synchronized(texts) { words.keys().forEach { k -> if (k in texts) words.optString(k).takeIf { it.isNotBlank() }?.let { texts[k] = it } } }
        if (::app.isInitialized) channel()
    }

    enum class State { IDLE, INCOMING, OUTGOING, CONNECTING, CONNECTED }

    var state = State.IDLE
        private set
    var thread = 0L
        private set
    var name = ""
        private set
    var muted = false
        private set
    var speaker = false
        private set
    var videoOn = false
        private set
    var remoteVideo = false
        private set
    /** When the call connected (ms), for the timer. */
    var connectedAt = 0L
        private set
    /** Why the last call ended, shown for a moment. */
    var endText = ""
        private set

    /** Screens that want a call when anything above changes (main thread). */
    val watchers = mutableSetOf<() -> Unit>()

    /** Where the video goes: the call screen sets the renderers. */
    val localView = Proxy()
    val remoteView = Proxy()

    class Proxy : VideoSink {
        @Volatile var target: VideoSink? = null
        override fun onFrame(frame: VideoFrame) {
            target?.onFrame(frame)
        }
    }

    private const val CHANNEL = "session-calls"
    /** Calls of muted chats: shown, never ringing nor opening over the lock screen. */
    private const val QUIET = "session-calls-quiet"
    private const val NOTE_ID = 7301
    private val main = Handler(Looper.getMainLooper())
    private val rtc = Executors.newSingleThreadExecutor()
    private val send = Executors.newSingleThreadExecutor()
    private lateinit var app: Context

    private var callId = ""
    private var pendingOffer: String? = null

    /** Calls off (INVISIBLE, set by the app): a call that comes does not ring. */
    @Volatile var callsOff = false
    /** The last call missed so, said once for its preOffer and offer both. */
    private var missedOff = ""
    private var acceptWhenOffer = false
    private val pendingIn = ArrayList<IceCandidate>()
    private val pendingOut = ArrayList<IceCandidate>()
    private var flushQueued = false
    private var ringtone: Ringtone? = null
    private var previousAudioMode = AudioManager.MODE_NORMAL

    // WebRTC (touched on [rtc] only, except reads of the descriptions)
    @Volatile private var egl: EglBase? = null
    private var factory: PeerConnectionFactory? = null
    @Volatile private var pc: PeerConnection? = null
    private var dc: DataChannel? = null
    private var audioSource: AudioSource? = null
    private var audioTrack: AudioTrack? = null
    private var videoSource: VideoSource? = null
    private var videoTrack: VideoTrack? = null
    private var capturer: CameraVideoCapturer? = null
    private var textures: SurfaceTextureHelper? = null
    private var capturing = false
    /** This call's peer connection is Unified Plan (no Plan B in the WebRTC at hand). */
    @Volatile private var unified = false

    fun init(context: Context) {
        app = context.applicationContext
        channel()
    }

    private fun channel() {
        val nm = app.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(CHANNEL, text("channel"), NotificationManager.IMPORTANCE_HIGH))
        nm.createNotificationChannel(
            NotificationChannel(QUIET, text("quietChannel"), NotificationManager.IMPORTANCE_LOW).apply { setSound(null, null) },
        )
    }

    /** Each chat's own notification choice, from the host app: muted until (ms, 0 = for ever), and its own ringtone. */
    private class Choice(val mutedUntil: Long?, val ring: String?)
    private val choices = HashMap<Long, Choice>()

    /**
     * The host app's notification choices of Session chats, as JSON: chat key (text) → muted until
     * (ms; 0 or less for ever), or → {"until": ms, "ring": "content://… ringtone"} where both are
     * optional and a ring of "" is no ringtone (the call still shows over the lock screen). Chats left out ring as usual. Replaces the choices given before.
     */
    fun setChoices(json: JSONObject) {
        val next = HashMap<Long, Choice>()
        for (k in json.keys()) {
            val key = k.toLongOrNull() ?: continue
            when (val v = json.opt(k)) {
                is Number -> next[key] = Choice(v.toLong(), null)
                is JSONObject -> next[key] = Choice(if (v.has("until")) v.optLong("until") else null, if (v.has("ring")) v.optString("ring") else null)
            }
        }
        synchronized(choices) { choices.clear(); choices.putAll(next) }
    }

    private fun choiceOf(thread: Long): Choice? = synchronized(choices) { choices[thread] }

    /** Whether the chat is muted now. */
    private fun mutedNow(thread: Long): Boolean {
        val until = choiceOf(thread)?.mutedUntil ?: return false
        return until <= 0L || until > System.currentTimeMillis()
    }

    /** The EGL context the call screen draws video with. */
    fun eglContext(): EglBase.Context? = egl?.eglBaseContext

    private fun changed() = watchers.toList().forEach { it() }

    // ---- what the person does ----

    /** Calls the person of a Session chat. */
    fun call(thread: Long, name: String, video: Boolean): Boolean {
        if (state != State.IDLE) return false
        this.thread = thread
        this.name = name
        callId = UUID.randomUUID().toString()
        state = State.OUTGOING
        endText = ""
        muted = false
        videoOn = video
        speaker = video
        remoteVideo = false
        begin()
        val id = callId
        rtc.execute {
            runCatching {
                setUp(video)
                val offer = fix(await { o -> pc!!.createOffer(o, MediaConstraints()) })
                await<Unit> { o -> pc!!.setLocalDescription(o, offer) }
                signal(id, "preOffer")
                signal(id, "offer", listOf(offer.description))
            }.onFailure { e -> main.post { if (callId == id) end("${text("notStarted")} ${e.message}", tell = true) } }
        }
        // Nobody answers: give up after a minute.
        main.postDelayed({ if (callId == id && state == State.OUTGOING) end(text("noAnswer"), tell = true) }, 60_000)
        changed()
        return true
    }

    /** Answers the ringing call. */
    fun accept() {
        if (state != State.INCOMING) return
        stopRing()
        state = State.CONNECTING
        val offer = pendingOffer
        if (offer == null) { acceptWhenOffer = true; changed(); return }
        answer(offer)
        changed()
    }

    fun decline() {
        if (state == State.IDLE) return
        end("", tell = true)
    }

    fun hangUp() = decline()

    fun toggleMute() {
        muted = !muted
        val m = muted
        rtc.execute { audioTrack?.setEnabled(!m) }
        changed()
    }

    fun toggleSpeaker() {
        speaker = !speaker
        audio().isSpeakerphoneOn = speaker
        changed()
    }

    fun toggleVideo() {
        videoOn = !videoOn
        val on = videoOn
        if (on && !speaker) toggleSpeaker()
        rtc.execute {
            videoTrack?.setEnabled(on)
            camera(on)
            dc?.send(DataChannel.Buffer(ByteBuffer.wrap(JSONObject().put("video", on).toString().toByteArray()), false))
        }
        changed()
    }

    fun flipCamera() {
        rtc.execute { capturer?.switchCamera(null) }
    }

    // ---- what the other side sends (main thread) ----

    fun onSignal(e: JSONObject) {
        val id = e.optString("callId")
        val sdps = e.optJSONArray("sdps") ?: JSONArray()
        when (e.optString("kind")) {
            "preOffer" -> ring(e, id)
            "offer" -> {
                val sdp = sdps.optString(0).ifEmpty { return }
                when {
                    state == State.IDLE -> { ring(e, id); if (callId == id) pendingOffer = sdp }
                    id != callId -> {}
                    state == State.INCOMING || (state == State.CONNECTING && pc == null) -> {
                        pendingOffer = sdp
                        if (acceptWhenOffer) { acceptWhenOffer = false; answer(sdp) }
                    }
                    pc != null -> rtc.execute {
                        // A new offer during the call: the network changed, start the paths again.
                        runCatching {
                            await<Unit> { o -> pc!!.setRemoteDescription(o, SessionDescription(SessionDescription.Type.OFFER, sdp)) }
                            val a = fix(await { o -> pc!!.createAnswer(o, MediaConstraints().apply { mandatory.add(MediaConstraints.KeyValuePair("IceRestart", "true")) }) })
                            await<Unit> { o -> pc!!.setLocalDescription(o, a) }
                            signal(id, "answer", listOf(a.description))
                        }
                    }
                }
            }
            "answer" -> {
                if (id != callId || state != State.OUTGOING) return
                val sdp = sdps.optString(0).ifEmpty { return }
                state = State.CONNECTING
                changed()
                rtc.execute {
                    runCatching {
                        await<Unit> { o -> pc!!.setRemoteDescription(o, SessionDescription(SessionDescription.Type.ANSWER, sdp)) }
                        main.post { addPendingIn(); flushOut() }
                    }.onFailure { err -> main.post { if (callId == id) end("${text("failed")} ${err.message}", tell = true) } }
                }
            }
            "ice" -> {
                if (id != callId) return
                val lines = e.optJSONArray("lines") ?: JSONArray()
                val mids = e.optJSONArray("mids") ?: JSONArray()
                if (lines.length() != sdps.length() || mids.length() != sdps.length()) return
                for (i in 0 until sdps.length()) pendingIn.add(IceCandidate(mids.optString(i), lines.optInt(i), sdps.optString(i)))
                addPendingIn()
            }
            "end" -> if (id == callId && state != State.IDLE) {
                val missed = state == State.INCOMING
                val quiet = mutedNow(thread)
                end(if (state == State.OUTGOING) text("noAnswer") else text("ended"), tell = false)
                if (missed) missedNote(e.optString("name"), quiet)
            }
        }
    }

    private fun ring(e: JSONObject, id: String) {
        // Calls off (INVISIBLE): it does not ring and nothing is answered, so nothing of this
        // phone's address goes to the caller; it shows as missed.
        if (callsOff && state == State.IDLE) {
            if (id != missedOff) { missedOff = id; missedNote(e.optString("name"), mutedNow(e.optLong("thread"))) }
            return
        }
        if (state != State.IDLE) {
            // Already in a call: tell the caller we cannot answer.
            if (id != callId) { val t = e.optLong("thread"); send.execute { runCatching { sendTo(t, id, "end") } } }
            return
        }
        callId = id
        thread = e.optLong("thread")
        name = e.optString("name")
        state = State.INCOMING
        endText = ""
        muted = false
        videoOn = false
        speaker = false
        remoteVideo = false
        pendingOffer = null
        acceptWhenOffer = false
        begin()
        // A muted chat's call is only shown: no ringtone, nothing over the lock screen.
        val quiet = mutedNow(thread)
        if (!quiet) startRing(choiceOf(thread)?.ring)
        showIncoming(quiet)
        // Not answered in a minute: stop ringing.
        main.postDelayed({ if (callId == id && state == State.INCOMING) { end("", tell = true); missedNote(name, quiet) } }, 60_000)
        changed()
    }

    private fun answer(offer: String) {
        val id = callId
        rtc.execute {
            runCatching {
                setUp(false)
                await<Unit> { o -> pc!!.setRemoteDescription(o, SessionDescription(SessionDescription.Type.OFFER, offer)) }
                val a = fix(await { o -> pc!!.createAnswer(o, MediaConstraints()) })
                await<Unit> { o -> pc!!.setLocalDescription(o, a) }
                signal(id, "answer", listOf(a.description))
                main.post { addPendingIn(); flushOut() }
            }.onFailure { err -> main.post { if (callId == id) end("${text("failed")} ${err.message}", tell = true) } }
        }
    }

    // ---- the call's life ----

    private fun begin() {
        Session.urgent = true
        Session.pollNow()
        pendingIn.clear()
        pendingOut.clear()
    }

    private fun end(text: String, tell: Boolean) {
        val id = callId
        val t = thread
        val was = state
        if (tell && was != State.IDLE) {
            rtc.execute {
                runCatching { dc?.send(DataChannel.Buffer(ByteBuffer.wrap("{\"hangup\":true}".toByteArray()), false)) }
            }
            send.execute { runCatching { sendTo(t, id, "end") } }
        }
        state = State.IDLE
        callId = ""
        endText = text
        pendingOffer = null
        acceptWhenOffer = false
        pendingIn.clear()
        pendingOut.clear()
        connectedAt = 0L
        Session.urgent = false
        stopRing()
        app.getSystemService(NotificationManager::class.java).cancel(NOTE_ID)
        runCatching {
            val am = audio()
            am.isSpeakerphoneOn = false
            am.mode = previousAudioMode
        }
        rtc.execute { tearDown() }
        changed()
    }

    private fun addPendingIn() {
        val p = pc ?: return
        if (p.localDescription == null || p.remoteDescription == null) return
        val list = pendingIn.toList()
        pendingIn.clear()
        rtc.execute { list.forEach { runCatching { pc?.addIceCandidate(it) } } }
    }

    /** Our network candidates, a few at a time, once both descriptions are set. */
    private fun flushOut() {
        if (flushQueued) return
        flushQueued = true
        main.postDelayed({
            flushQueued = false
            val p = pc ?: return@postDelayed
            if (p.localDescription == null || p.remoteDescription == null || pendingOut.isEmpty()) return@postDelayed
            val list = pendingOut.toList()
            pendingOut.clear()
            val id = callId
            send.execute {
                runCatching {
                    Session.call(
                        "callSend",
                        JSONObject().put("thread", thread).put("callId", id).put("kind", "ice")
                            .put("sdps", JSONArray(list.map { it.sdp })).put("lines", JSONArray(list.map { it.sdpMLineIndex }))
                            .put("mids", JSONArray(list.map { it.sdpMid })),
                    )
                }
            }
        }, 300)
    }

    private fun signal(id: String, kind: String, sdps: List<String> = emptyList()) {
        val t = thread
        val r = CompletableFuture<JSONObject>()
        send.execute {
            r.complete(runCatching { sendTo(t, id, kind, sdps) }.getOrElse { JSONObject().put("error", it.message) })
        }
        val res = r.get(60, TimeUnit.SECONDS)
        if (res.has("error")) throw IllegalStateException(res.optString("error"))
    }

    private fun sendTo(thread: Long, id: String, kind: String, sdps: List<String> = emptyList()): JSONObject =
        Session.call("callSend", JSONObject().put("thread", thread).put("callId", id).put("kind", kind).put("sdps", JSONArray(sdps)))

    // ---- WebRTC (on [rtc]) ----

    private val observer = object : PeerConnection.Observer {
        override fun onSignalingChange(s: PeerConnection.SignalingState?) {}
        override fun onIceConnectionChange(s: PeerConnection.IceConnectionState?) {
            main.post {
                when (s) {
                    PeerConnection.IceConnectionState.CONNECTED, PeerConnection.IceConnectionState.COMPLETED -> if (state == State.CONNECTING || state == State.OUTGOING) {
                        state = State.CONNECTED
                        if (connectedAt == 0L) connectedAt = System.currentTimeMillis()
                        changed()
                    }
                    PeerConnection.IceConnectionState.FAILED -> if (state != State.IDLE) end(text("lost"), tell = true)
                    else -> {}
                }
            }
        }
        override fun onIceConnectionReceivingChange(b: Boolean) {}
        override fun onIceGatheringChange(s: PeerConnection.IceGatheringState?) {}
        override fun onIceCandidate(c: IceCandidate) {
            main.post { pendingOut.add(c); flushOut() }
        }
        override fun onIceCandidatesRemoved(c: Array<out IceCandidate>?) {}
        override fun onAddStream(stream: MediaStream) {
            stream.audioTracks.forEach { it.setEnabled(true) }
            stream.videoTracks.firstOrNull()?.let { it.setEnabled(true); it.addSink(remoteView) }
        }
        override fun onRemoveStream(s: MediaStream?) {}
        override fun onDataChannel(d: DataChannel?) {}
        override fun onRenegotiationNeeded() {}
        override fun onAddTrack(r: RtpReceiver?, s: Array<out MediaStream>?) {
            // Unified Plan gives tracks, not streams.
            if (!unified) return
            when (val track = r?.track()) {
                is AudioTrack -> track.setEnabled(true)
                is VideoTrack -> { track.setEnabled(true); track.addSink(remoteView) }
                else -> {}
            }
        }
    }

    private fun setUp(video: Boolean) {
        if (factory == null) {
            PeerConnectionFactory.initialize(PeerConnectionFactory.InitializationOptions.builder(app).createInitializationOptions())
            val e = EglBase.create()
            egl = e
            factory = PeerConnectionFactory.builder()
                .setVideoEncoderFactory(DefaultVideoEncoderFactory(e.eglBaseContext, true, true))
                .setVideoDecoderFactory(DefaultVideoDecoderFactory(e.eglBaseContext))
                .setAudioDeviceModule(
                    JavaAudioDeviceModule.builder(app).setUseHardwareAcousticEchoCanceler(true)
                        .setUseHardwareNoiseSuppressor(true).createAudioDeviceModule(),
                )
                .createPeerConnectionFactory()
        }
        val f = factory!!
        main.post {
            runCatching {
                val am = audio()
                previousAudioMode = am.mode
                am.mode = AudioManager.MODE_IN_COMMUNICATION
                am.isSpeakerphoneOn = speaker
            }
        }
        // As the official apps: two of Session's TURN servers, Plan B, one stream.
        val servers = listOf("freyr", "angus", "hereford", "holstein", "brahman").shuffled().take(2).map {
            PeerConnection.IceServer.builder("turn:$it.getsession.org").setUsername("session202111").setPassword("053c268164bc7bd7").createIceServer()
        }
        fun config(semantics: PeerConnection.SdpSemantics) = PeerConnection.RTCConfiguration(servers).apply {
            bundlePolicy = PeerConnection.BundlePolicy.MAXBUNDLE
            rtcpMuxPolicy = PeerConnection.RtcpMuxPolicy.REQUIRE
            sdpSemantics = semantics
        }
        val constraints = MediaConstraints().apply { optional.add(MediaConstraints.KeyValuePair("DtlsSrtpKeyAgreement", "true")) }
        // A WebRTC without Plan B (a host app's older or newer build) makes no peer connection
        // with it: then Unified Plan, which with one audio and one video track speaks to Plan B.
        val planB = runCatching { f.createPeerConnection(config(PeerConnection.SdpSemantics.PLAN_B), constraints, observer) }.getOrNull()
        unified = planB == null
        val p = planB ?: f.createPeerConnection(config(PeerConnection.SdpSemantics.UNIFIED_PLAN), constraints, observer)
            ?: throw IllegalStateException("no peer connection")
        pc = p
        p.setAudioPlayout(true)
        p.setAudioRecording(true)
        val stream = f.createLocalMediaStream("ARDAMS")
        val aSrc = f.createAudioSource(MediaConstraints())
        audioSource = aSrc
        val aTrack = f.createAudioTrack("ARDAMSa0", aSrc)
        aTrack.setEnabled(!muted)
        audioTrack = aTrack
        stream.addTrack(aTrack)
        if (unified) p.addTrack(aTrack, listOf(stream.id))
        val enumerator = Camera2Enumerator(app)
        val cam = enumerator.deviceNames.firstOrNull { enumerator.isFrontFacing(it) } ?: enumerator.deviceNames.firstOrNull()
        if (cam != null) {
            val cap = enumerator.createCapturer(cam, null)
            val vSrc = f.createVideoSource(false)
            val helper = SurfaceTextureHelper.create("erevos-session-camera", egl!!.eglBaseContext)
            cap.initialize(helper, app, vSrc.capturerObserver)
            capturer = cap
            textures = helper
            videoSource = vSrc
            val vTrack = f.createVideoTrack("ARDAMSv0", vSrc)
            vTrack.addSink(localView)
            vTrack.setEnabled(video)
            videoTrack = vTrack
            stream.addTrack(vTrack)
            if (unified) p.addTrack(vTrack, listOf(stream.id))
            camera(video)
        }
        if (!unified) p.addStream(stream)
        val channel = p.createDataChannel("signaling", DataChannel.Init().apply { ordered = true; negotiated = true; id = 548 })
        channel.registerObserver(object : DataChannel.Observer {
            override fun onBufferedAmountChange(l: Long) {}
            override fun onStateChange() {}
            override fun onMessage(buffer: DataChannel.Buffer) {
                val bytes = ByteArray(buffer.data.remaining()).also { buffer.data.get(it) }
                val o = runCatching { JSONObject(String(bytes)) }.getOrNull() ?: return
                main.post {
                    if (o.has("video")) { remoteVideo = o.optBoolean("video"); changed() }
                    if (o.optBoolean("hangup") && state != State.IDLE) end(text("ended"), tell = false)
                }
            }
        })
        dc = channel
    }

    private fun camera(on: Boolean) {
        val cap = capturer ?: return
        if (on && !capturing) { cap.startCapture(1280, 720, 30); capturing = true }
        if (!on && capturing) { runCatching { cap.stopCapture() }; capturing = false }
    }

    private fun tearDown() {
        runCatching { camera(false) }
        runCatching { capturer?.dispose() }
        runCatching { textures?.dispose() }
        runCatching { videoSource?.dispose() }
        runCatching { audioSource?.dispose() }
        runCatching { dc?.dispose() }
        runCatching { pc?.close(); pc?.dispose() }
        capturer = null; textures = null; videoSource = null; videoTrack = null; audioSource = null; audioTrack = null; dc = null; pc = null
    }

    /** The official apps add cbr=1 to Opus and leave out the audio-level extension. */
    private fun fix(d: SessionDescription): SessionDescription = SessionDescription(
        d.type,
        d.description.replace("(a=fmtp:111 ((?!cbr=).)*)\r?\n".toRegex(), "$1;cbr=1\r\n")
            .replace(".+urn:ietf:params:rtp-hdrext:ssrc-audio-level.*\r?\n".toRegex(), ""),
    )

    /** Waits for one WebRTC description step. */
    private fun <T> await(start: (SdpObserver) -> Unit): T {
        val f = CompletableFuture<Any?>()
        start(object : SdpObserver {
            override fun onCreateSuccess(d: SessionDescription?) { f.complete(d) }
            override fun onSetSuccess() { f.complete(Unit) }
            override fun onCreateFailure(e: String?) { f.completeExceptionally(IllegalStateException(e)) }
            override fun onSetFailure(e: String?) { f.completeExceptionally(IllegalStateException(e)) }
        })
        @Suppress("UNCHECKED_CAST")
        return f.get(30, TimeUnit.SECONDS) as T
    }

    // ---- ringing and notifications ----

    private fun audio() = app.getSystemService(AudioManager::class.java)

    private fun startRing(own: String?) {
        // The chat's calls ring with no sound.
        if (own == "") return
        runCatching {
            // The chat's own ringtone when it has one that still plays; else the phone's.
            val chosen = own?.let { runCatching { RingtoneManager.getRingtone(app, android.net.Uri.parse(it)) }.getOrNull() }
            ringtone = (chosen ?: RingtoneManager.getRingtone(app, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)))?.also {
                if (android.os.Build.VERSION.SDK_INT >= 28) it.isLooping = true
                it.play()
            }
        }
    }

    private fun stopRing() {
        runCatching { ringtone?.stop() }
        ringtone = null
    }

    private fun showIncoming(quiet: Boolean) {
        val open = PendingIntent.getActivity(
            app, 0, Intent(app, SessionCallActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val b = android.app.Notification.Builder(app, if (quiet) QUIET else CHANNEL)
            .setSmallIcon(android.R.drawable.sym_call_incoming)
            .setContentTitle(name.ifBlank { "Session" })
            .setContentText(text("incoming"))
            .setCategory(android.app.Notification.CATEGORY_CALL)
            .setContentIntent(open)
            .setOngoing(true)
        if (!quiet) b.setFullScreenIntent(open, true)
        val n = b.build()
        runCatching { app.getSystemService(NotificationManager::class.java).notify(NOTE_ID, n) }
        // In front already: open the call screen at once (a muted chat's call waits to be tapped).
        if (!quiet && EngineHost.appInFront()) runCatching { app.startActivity(Intent(app, SessionCallActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
    }

    private fun missedNote(who: String, quiet: Boolean) {
        val n = android.app.Notification.Builder(app, if (quiet) QUIET else CHANNEL)
            .setSmallIcon(android.R.drawable.sym_call_missed)
            .setContentTitle(text("missed"))
            .setContentText(who.ifBlank { "Session" })
            .setAutoCancel(true)
            .build()
        runCatching { app.getSystemService(NotificationManager::class.java).notify(NOTE_ID + 1, n) }
    }
}
