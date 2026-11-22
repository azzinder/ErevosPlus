// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.calls

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import org.webrtc.RendererCommon
import org.webrtc.SurfaceViewRenderer

/** The screen of a Session call: who, how long, the video, and the buttons. */
class SessionCallActivity : Activity() {
    companion object {
        /** Starts a call from a Session chat (asks for the microphone, and the camera for video, first). */
        fun start(context: Context, thread: Long, name: String, video: Boolean) {
            context.startActivity(
                Intent(context, SessionCallActivity::class.java)
                    .putExtra("thread", thread).putExtra("name", name).putExtra("video", video),
            )
        }
    }

    private val main = Handler(Looper.getMainLooper())
    private lateinit var remote: SurfaceViewRenderer
    private lateinit var local: SurfaceViewRenderer
    private lateinit var who: TextView
    private lateinit var info: TextView
    private lateinit var incoming: LinearLayout
    private lateinit var during: LinearLayout
    private lateinit var muteB: Button
    private lateinit var speakerB: Button
    private lateinit var videoB: Button
    private var renderersReady = false
    private val watcher: () -> Unit = { show() }
    private val tick = object : Runnable {
        override fun run() {
            show()
            main.postDelayed(this, 1000)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true) }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val root = FrameLayout(this).apply { setBackgroundColor(Color.rgb(16, 18, 24)) }
        remote = SurfaceViewRenderer(this)
        local = SurfaceViewRenderer(this)
        root.addView(remote, FrameLayout.LayoutParams(-1, -1))
        root.addView(local, FrameLayout.LayoutParams(dp(110), dp(160), Gravity.TOP or Gravity.END).apply { setMargins(0, dp(48), dp(16), 0) })
        val top = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(16), dp(72), dp(16), 0)
        }
        who = TextView(this).apply { textSize = 26f; setTextColor(Color.WHITE); gravity = Gravity.CENTER }
        info = TextView(this).apply { textSize = 16f; setTextColor(Color.rgb(200, 200, 210)); gravity = Gravity.CENTER }
        top.addView(who)
        top.addView(info)
        root.addView(top, FrameLayout.LayoutParams(-1, -2, Gravity.TOP))
        incoming = row(
            button(SessionCalls.text("decline"), Color.rgb(200, 50, 50)) { SessionCalls.decline() },
            button(SessionCalls.text("answer"), Color.rgb(40, 160, 80)) { if (askFor(false)) SessionCalls.accept() },
        )
        muteB = button(SessionCalls.text("mute"), Color.rgb(60, 64, 76)) { SessionCalls.toggleMute() }
        speakerB = button(SessionCalls.text("speaker"), Color.rgb(60, 64, 76)) { SessionCalls.toggleSpeaker() }
        videoB = button(SessionCalls.text("camera"), Color.rgb(60, 64, 76)) { if (askFor(true)) SessionCalls.toggleVideo() }
        val flip = button("↺", Color.rgb(60, 64, 76)) { SessionCalls.flipCamera() }
        val end = button(SessionCalls.text("hangUp"), Color.rgb(200, 50, 50)) { SessionCalls.hangUp() }
        during = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(row(muteB, speakerB, videoB, flip))
            addView(row(end))
        }
        root.addView(incoming, FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM).apply { bottomMargin = dp(48) })
        root.addView(during, FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM).apply { bottomMargin = dp(32) })
        setContentView(root)

        val thread = intent.getLongExtra("thread", 0L)
        if (thread != 0L && SessionCalls.state == SessionCalls.State.IDLE) {
            val video = intent.getBooleanExtra("video", false)
            if (!askFor(video)) {
                pendingStart = Triple(thread, intent.getStringExtra("name").orEmpty(), video)
            } else {
                SessionCalls.call(thread, intent.getStringExtra("name").orEmpty(), video)
            }
        }
    }

    private var pendingStart: Triple<Long, String, Boolean>? = null
    private var pendingAccept = false
    private var pendingVideo = false

    /** Asks for the microphone (and the camera for video); true if already allowed. */
    private fun askFor(video: Boolean): Boolean {
        val need = listOfNotNull(
            Manifest.permission.RECORD_AUDIO.takeIf { checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED },
            Manifest.permission.CAMERA.takeIf { video && checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED },
        )
        if (need.isEmpty()) return true
        if (SessionCalls.state == SessionCalls.State.INCOMING) pendingAccept = true
        if (video && SessionCalls.state != SessionCalls.State.IDLE && SessionCalls.state != SessionCalls.State.INCOMING) pendingVideo = true
        requestPermissions(need.toTypedArray(), 1)
        return false
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, results: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, results)
        val micOk = checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
        pendingStart?.let { (t, n, v) ->
            pendingStart = null
            if (micOk) SessionCalls.call(t, n, v && checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) else finish()
        }
        if (pendingAccept) { pendingAccept = false; if (micOk) SessionCalls.accept() }
        if (pendingVideo) { pendingVideo = false; if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) SessionCalls.toggleVideo() }
    }

    override fun onStart() {
        super.onStart()
        SessionCalls.watchers.add(watcher)
        main.post(tick)
        show()
    }

    override fun onStop() {
        SessionCalls.watchers.remove(watcher)
        main.removeCallbacks(tick)
        super.onStop()
    }

    override fun onDestroy() {
        SessionCalls.localView.target = null
        SessionCalls.remoteView.target = null
        if (renderersReady) { runCatching { local.release() }; runCatching { remote.release() } }
        super.onDestroy()
    }

    private fun show() {
        val s = SessionCalls.state
        if (!renderersReady) SessionCalls.eglContext()?.let { ctx ->
            remote.init(ctx, null)
            remote.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
            local.init(ctx, null)
            local.setMirror(true)
            local.setZOrderMediaOverlay(true)
            SessionCalls.remoteView.target = remote
            SessionCalls.localView.target = local
            renderersReady = true
        }
        if (s == SessionCalls.State.IDLE) {
            if (pendingStart != null) return
            info.text = SessionCalls.endText.ifBlank { SessionCalls.text("ended") }
            incoming.visibility = View.GONE
            during.visibility = View.GONE
            main.postDelayed({ finish() }, 1500)
            return
        }
        who.text = SessionCalls.name.ifBlank { "Session" }
        info.text = when (s) {
            SessionCalls.State.INCOMING -> SessionCalls.text("ringing")
            SessionCalls.State.OUTGOING -> SessionCalls.text("calling")
            SessionCalls.State.CONNECTING -> SessionCalls.text("connecting")
            SessionCalls.State.CONNECTED -> {
                val secs = ((System.currentTimeMillis() - SessionCalls.connectedAt) / 1000).coerceAtLeast(0)
                "%d:%02d".format(secs / 60, secs % 60)
            }
            else -> ""
        }
        incoming.visibility = if (s == SessionCalls.State.INCOMING) View.VISIBLE else View.GONE
        during.visibility = if (s == SessionCalls.State.INCOMING) View.GONE else View.VISIBLE
        muteB.text = if (SessionCalls.muted) SessionCalls.text("unmute") else SessionCalls.text("mute")
        speakerB.text = if (SessionCalls.speaker) SessionCalls.text("earpiece") else SessionCalls.text("speaker")
        videoB.text = if (SessionCalls.videoOn) SessionCalls.text("cameraOff") else SessionCalls.text("camera")
        local.visibility = if (SessionCalls.videoOn) View.VISIBLE else View.INVISIBLE
        remote.visibility = if (SessionCalls.remoteVideo) View.VISIBLE else View.INVISIBLE
    }

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    private fun button(text: String, color: Int, onClick: () -> Unit) = Button(this).apply {
        this.text = text
        setTextColor(Color.WHITE)
        setBackgroundColor(color)
        isAllCaps = false
        setOnClickListener { onClick() }
    }

    private fun row(vararg views: View) = LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER
        setPadding(dp(8), dp(4), dp(8), dp(4))
        views.forEach { addView(it, LinearLayout.LayoutParams(0, dp(56), 1f).apply { setMargins(dp(4), 0, dp(4), 0) }) }
    }
}
