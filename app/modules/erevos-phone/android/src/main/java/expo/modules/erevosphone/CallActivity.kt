// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Outline
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.telecom.Call
import android.telecom.DisconnectCause
import android.telecom.PhoneAccountHandle
import android.telecom.TelecomManager
import android.telecom.VideoProfile
import android.text.InputType
import android.text.TextUtils
import android.view.Gravity
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import android.view.WindowInsets
import android.view.WindowManager
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView

/**
 * The call screen of the phone's calls, built in code: who it is, with their photo, whether the
 * call goes over Wi-Fi or in HD, on which SIM; Answer, Decline and Message (decline with an SMS)
 * while it rings, and Hold and answer while another call is on; then Mute, the keypad, where the sound goes (the earpiece, the
 * loudspeaker, a Bluetooth device, a headset), Hold, Add call, Merge or Swap, and End; a
 * conference lists its people, each with Separate and End where the network allows. It shows
 * over the phone's lock screen and turns the screen on, and needs no unlocking of Erevos: its own
 * task, apart from the app, which stays locked behind its password. While the phone is at the ear
 * the screen goes off.
 */
class CallActivity : Activity() {
  private val main = Handler(Looper.getMainLooper())
  private lateinit var face: FrameLayout
  private lateinit var photo: ImageView
  private lateinit var initial: TextView
  private lateinit var title: TextView
  private lateinit var status: TextView
  private lateinit var marks: TextView
  // The spam list's warning, for a number on it.
  private lateinit var warning: TextView
  private lateinit var other: TextView
  private lateinit var tones: TextView
  private lateinit var people: LinearLayout
  private lateinit var buttons: LinearLayout
  // The picture of a video call (ViLTE), under the words and buttons.
  private lateinit var video: CallVideo
  // What waits for the camera's permission: answering with video, or turning it on.
  private var afterCamera: ((Boolean) -> Unit)? = null
  private var stop: (() -> Unit)? = null
  private var keypad = false
  private var closing = false
  private var proximity: PowerManager.WakeLock? = null
  // What the buttons were built for: they are built again only when that changes.
  private var built = ""
  // What the list of a conference's people was built for.
  private var peopleBuilt = ""
  // The call whose SIM was asked for, so it is asked once.
  private var askedSim: Call? = null
  // The ways the phone can call, read when the screen shows.
  private var accounts: List<Account> = emptyList()
  private val tick = object : Runnable {
    override fun run() {
      render()
      main.postDelayed(this, 1000)
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    overLock()
    video = CallVideo(this, main, ::dp) { call, profile -> askedVideo(call, profile) }
    setContentView(build())
    stop = Calls.listen { render() }
    act(intent)
    render()
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    closing = false
    act(intent)
    render()
  }

  override fun onResume() {
    super.onResume()
    accounts = Sims.accounts(this)
    main.removeCallbacks(tick)
    main.post(tick)
  }

  override fun onPause() {
    main.removeCallbacks(tick)
    super.onPause()
  }

  override fun onDestroy() {
    stop?.invoke()
    stop = null
    video.stop()
    main.removeCallbacksAndMessages(null)
    atEar(false)
    super.onDestroy()
  }

  // The volume keys quiet a call that rings, as on every phone.
  override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
    val volume = keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || keyCode == KeyEvent.KEYCODE_VOLUME_MUTE
    if (volume && Calls.ringing() != null) {
      runCatching { getSystemService(TelecomManager::class.java)?.silenceRinger() }
      return true
    }
    return super.onKeyDown(keyCode, event)
  }

  // Answer, from the notice of a call that rings.
  private fun act(intent: Intent?) {
    if (intent?.action != ANSWER) return
    Calls.find(intent.getIntExtra(CALL, -1))?.let { if (Calls.isRinging(it)) Calls.answer(it) }
  }

  @Suppress("DEPRECATION")
  private fun overLock() {
    if (Build.VERSION.SDK_INT >= 27) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
    }
  }

  private fun say(en: String, el: String, vararg args: String) = Words.say(this, en, el, *args)

  private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

  private fun text(size: Float, color: Int, bold: Boolean = false): TextView =
    TextView(this).apply {
      textSize = size
      setTextColor(color)
      gravity = Gravity.CENTER
      if (bold) typeface = Typeface.DEFAULT_BOLD
    }

  private fun build(): View {
    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
    }
    // Drawn under the phone's bars, kept clear of them.
    root.setOnApplyWindowInsetsListener { view, insets ->
      if (Build.VERSION.SDK_INT >= 30) {
        val bars = insets.getInsets(WindowInsets.Type.systemBars())
        view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
      } else {
        @Suppress("DEPRECATION")
        view.setPadding(insets.systemWindowInsetLeft, insets.systemWindowInsetTop, insets.systemWindowInsetRight, insets.systemWindowInsetBottom)
      }
      insets
    }
    val top = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(24), dp(48), dp(24), 0)
    }
    face = FrameLayout(this).apply {
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(FACE)
      }
      outlineProvider = object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline) = outline.setOval(0, 0, view.width, view.height)
      }
      clipToOutline = true
    }
    initial = text(44f, INK, true)
    photo = ImageView(this).apply { scaleType = ImageView.ScaleType.CENTER_CROP }
    face.addView(initial, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    face.addView(photo, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    top.addView(face, LinearLayout.LayoutParams(dp(112), dp(112)).apply { bottomMargin = dp(16) })
    title = text(28f, INK, true).apply {
      maxLines = 2
      ellipsize = TextUtils.TruncateAt.END
    }
    status = text(16f, MUTED)
    marks = text(13f, FAINT)
    other = text(14f, INK).apply {
      background = GradientDrawable().apply {
        cornerRadius = dp(20).toFloat()
        setColor(SOFT)
      }
      setPadding(dp(16), dp(10), dp(16), dp(10))
    }
    tones = text(28f, INK).apply {
      maxLines = 1
      ellipsize = TextUtils.TruncateAt.START
    }
    top.addView(title, wrap())
    top.addView(status, wrap(6))
    top.addView(marks, wrap(4))
    warning = text(14f, WARN_INK, true).apply {
      background = GradientDrawable().apply {
        cornerRadius = dp(12).toFloat()
        setColor(WARN_FILL)
      }
      setPadding(dp(14), dp(8), dp(14), dp(8))
      visibility = View.GONE
    }
    top.addView(warning, wrap(12))
    top.addView(other, wrap(20))
    top.addView(tones, wrap(16))
    people = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      background = GradientDrawable().apply {
        cornerRadius = dp(16).toFloat()
        setColor(SOFT)
      }
      setPadding(dp(12), dp(4), dp(12), dp(4))
      visibility = View.GONE
    }
    top.addView(people, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(16) })
    root.addView(top, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))
    buttons = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(8), 0, dp(8), dp(28))
    }
    root.addView(buttons, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    // The video, when there is one, under it all.
    val stage = FrameLayout(this).apply { setBackgroundColor(GROUND) }
    stage.addView(video.layer, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    stage.addView(root, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    return stage
  }

  private fun wrap(above: Int = 0) =
    LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply {
      gravity = Gravity.CENTER_HORIZONTAL
      topMargin = dp(above)
    }

  /** A round button with its picture and, below it, what it does. `on`: a setting that is on. */
  private fun round(label: String, glyph: String?, onClick: () -> Unit, fill: Int = SOFT, on: Boolean = false, turn: Float = 0f, sign: String? = null): View {
    val cell = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(0, dp(10), 0, 0)
    }
    val circle = FrameLayout(this).apply {
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(if (on) INK else fill)
      }
      foreground = RippleDrawable(ColorStateList.valueOf(0x40FFFFFF), null, GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(Color.WHITE)
      })
      contentDescription = label
      isClickable = true
      setOnClickListener { onClick() }
    }
    val ink = if (on) GROUND else INK
    if (glyph != null) {
      circle.addView(ImageView(this).apply { setImageDrawable(Glyph(glyph, ink, turn)) }, FrameLayout.LayoutParams(dp(28), dp(28), Gravity.CENTER))
    } else if (sign != null) {
      circle.addView(text(26f, ink).apply { this.text = sign }, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    }
    cell.addView(circle, LinearLayout.LayoutParams(dp(68), dp(68)))
    if (label.isNotEmpty()) {
      cell.addView(
        text(12f, MUTED).apply {
          this.text = label
          maxLines = 2
        },
        LinearLayout.LayoutParams(dp(104), ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(6) },
      )
    }
    return cell
  }

  private fun row(vararg cells: View?) {
    val line = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_HORIZONTAL
    }
    for (cell in cells) if (cell != null) line.addView(cell, LinearLayout.LayoutParams(dp(112), ViewGroup.LayoutParams.WRAP_CONTENT))
    buttons.addView(line, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
  }

  private fun render() {
    // A call that rings while "Call ended" still shows (1.5 s) shows at once, not that dark screen.
    if (closing && Calls.ringing() == null) return
    closing = false
    val ringing = Calls.ringing()
    val front = Calls.front()
    val shown = ringing ?: front
    if (shown == null) {
      ended()
      return
    }
    val state = Calls.state(shown)
    val caller = Callers.of(this, shown)
    val conference = shown.details.hasProperty(Call.Details.PROPERTY_CONFERENCE)
    val name = when {
      conference -> say("Conference call", "Κλήση συνδιάσκεψης")
      caller.name != null -> caller.name
      caller.number.isNotEmpty() -> Callers.shown(this, caller.number)
      else -> Callers.hidden(this, shown) ?: say("Unknown number", "Άγνωστος αριθμός")
    }
    title.text = name
    initial.text = name.firstOrNull { it.isLetterOrDigit() }?.uppercase() ?: ""
    photo.setImageBitmap(caller.photo)
    photo.visibility = if (caller.photo != null) View.VISIBLE else View.GONE
    // A conference lists its people instead of the face, with End or Separate for each.
    val members = if (conference && !keypad && ringing == null) shown.children.filter { Calls.state(it) != Call.STATE_DISCONNECTED } else emptyList()
    // A video call shows the other side's picture instead of the face.
    val videoNow = ringing == null && !keypad && state == Call.STATE_ACTIVE && video.isVideo(shown)
    video.follow(if (ringing == null) shown else null, videoNow)
    face.visibility = if (keypad || members.isNotEmpty() || videoNow) View.GONE else View.VISIBLE
    showPeople(members)
    status.text = statusOf(shown, state)
    val parts = ArrayList<String>()
    if (caller.name != null && caller.number.isNotEmpty() && !conference) parts.add(Callers.shown(this, caller.number))
    // What the number says of itself, for one that is none of the contacts.
    if (!conference) caller.info?.let { parts.add(it) }
    val spam = if (conference) null else caller.spam
    warning.text = if (spam.isNullOrBlank()) say("Possible spam: on your spam list", "Πιθανό spam: στη λίστα spam") else say("Possible spam: {0}", "Πιθανό spam: {0}", spam)
    warning.visibility = if (spam != null && !keypad) View.VISIBLE else View.GONE
    if (conference) shown.children.size.takeIf { it > 0 }?.let { parts.add(say("{0} people", "{0} άτομα", "$it")) }
    if (video.isVideo(shown)) parts.add(say("Video call", "Βιντεοκλήση"))
    if (shown.details.hasProperty(Call.Details.PROPERTY_WIFI)) parts.add(say("Wi-Fi calling", "Κλήση μέσω Wi-Fi"))
    if (shown.details.hasProperty(Call.Details.PROPERTY_HIGH_DEF_AUDIO)) parts.add(say("HD voice", "Φωνή HD"))
    simLabel(shown)?.let { parts.add(it) }
    marks.text = parts.joinToString(" · ")
    marks.visibility = if (parts.isEmpty()) View.GONE else View.VISIBLE

    // The other call: the one on while this rings, or the one on hold, which a tap brings back.
    val second = if (ringing != null) front else Calls.other(shown)
    if (second != null && !keypad) {
      val who = nameOf(second)
      other.visibility = View.VISIBLE
      if (ringing != null) {
        other.text = say("In a call with {0}", "Σε κλήση με: {0}", who)
        other.setOnClickListener(null)
      } else {
        other.text = say("On hold: {0}. Tap to talk.", "Σε αναμονή: {0}. Πάτα για να μιλήσεις.", who)
        other.setOnClickListener { Calls.front()?.let { Calls.swap(it) } }
      }
    } else {
      other.visibility = View.GONE
    }
    tones.visibility = if (keypad) View.VISIBLE else View.GONE

    val route = Calls.route
    val layout = when {
      ringing != null && front != null -> "waiting"
      ringing != null -> "ringing"
      state == Call.STATE_SELECT_PHONE_ACCOUNT -> "sim"
      keypad -> "keypad"
      else -> "call"
    }
    val key = listOf(
      layout, Calls.id(shown), state, Calls.muted, route?.kind, route?.name, Calls.routes.size, Calls.canAdd,
      Calls.canHold(shown), Calls.canMerge(shown), second?.let { Calls.state(it) }, Words.lang(this),
      shown.details.can(Call.Details.CAPABILITY_RESPOND_VIA_TEXT), video.isVideo(shown), video.canVideo(shown),
    ).joinToString("|")
    if (key != built) {
      built = key
      buttons.removeAllViews()
      when (layout) {
        "ringing" -> {
          if (video.isVideo(shown)) {
            row(declineButton(), answerButton(say("Audio only", "Μόνο ήχος")), round(say("Answer with video", "Απάντηση με βίντεο"), Glyph.VIDEO, { answerWithVideo() }, fill = ANSWER_FILL))
          } else {
            row(declineButton(), answerButton(say("Answer", "Απάντηση")))
          }
          row(messageButton(shown))
        }
        "waiting" -> {
          row(declineButton(), answerButton(say("Hold and answer", "Αναμονή και απάντηση")))
          row(messageButton(shown), round(say("End and answer", "Τέλος και απάντηση"), Glyph.CALL, { Calls.ringing()?.let { Calls.endAndAnswer(it) } }))
        }
        "sim" -> row(endButton())
        "keypad" -> keys()
        else -> controls(shown, second)
      }
    }
    if (state == Call.STATE_SELECT_PHONE_ACCOUNT && askedSim !== shown) {
      askedSim = shown
      askSim(shown)
    }
    // At the ear the screen goes off; with the keypad, the loudspeaker or a headset it stays on.
    val talking = ringing == null && (state == Call.STATE_ACTIVE || state == Call.STATE_DIALING || state == Call.STATE_CONNECTING)
    atEar(talking && !keypad && !videoNow && (route == null || route.kind == Calls.EARPIECE))
    if (ringing != null) window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    else window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }

  /** The people of a conference, each with Separate (talk with them alone, the others held) and
   *  End, where the network allows them. Built again only when who or what changes. */
  private fun showPeople(members: List<Call>) {
    val key = members.joinToString(";") {
      listOf(Calls.id(it), nameOf(it), it.details.can(Call.Details.CAPABILITY_SEPARATE_FROM_CONFERENCE), it.details.can(Call.Details.CAPABILITY_DISCONNECT_FROM_CONFERENCE), Words.lang(this)).joinToString("|")
    }
    if (key == peopleBuilt) return
    peopleBuilt = key
    people.removeAllViews()
    people.visibility = if (members.isEmpty()) View.GONE else View.VISIBLE
    for (member in members) {
      val line = LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setPadding(0, dp(8), 0, dp(8))
      }
      val name = text(16f, INK).apply {
        this.text = nameOf(member)
        gravity = Gravity.START or Gravity.CENTER_VERTICAL
        maxLines = 1
        ellipsize = TextUtils.TruncateAt.END
      }
      line.addView(name, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
      if (member.details.can(Call.Details.CAPABILITY_SEPARATE_FROM_CONFERENCE)) {
        line.addView(pill(say("Separate", "Χωριστά"), SOFT) { member.splitFromConference() }, pillPlace())
      }
      if (member.details.can(Call.Details.CAPABILITY_DISCONNECT_FROM_CONFERENCE)) {
        line.addView(pill(say("End", "Τέλος"), END_FILL) { member.disconnect() }, pillPlace())
      }
      people.addView(line, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    }
  }

  private fun pillPlace() =
    LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { marginStart = dp(8) }

  /** A small rounded button with words, for a line of the conference's people. */
  private fun pill(label: String, fill: Int, onClick: () -> Unit): View =
    text(14f, INK, true).apply {
      this.text = label
      background = GradientDrawable().apply {
        cornerRadius = dp(14).toFloat()
        setColor(fill)
      }
      foreground = RippleDrawable(ColorStateList.valueOf(0x40FFFFFF), null, null)
      setPadding(dp(12), dp(6), dp(12), dp(6))
      contentDescription = label
      isClickable = true
      setOnClickListener { onClick() }
    }

  private fun nameOf(call: Call): String {
    if (call.details.hasProperty(Call.Details.PROPERTY_CONFERENCE)) return say("Conference call", "Κλήση συνδιάσκεψης")
    val caller = Callers.of(this, call)
    return caller.name ?: caller.number.takeIf { it.isNotEmpty() }?.let { Callers.shown(this, it) }
      ?: Callers.hidden(this, call) ?: say("Unknown number", "Άγνωστος αριθμός")
  }

  private fun statusOf(call: Call, state: Int): String =
    when (state) {
      Call.STATE_RINGING, Call.STATE_SIMULATED_RINGING ->
        if (video.isVideo(call)) say("Incoming video call", "Εισερχόμενη βιντεοκλήση") else say("Incoming call", "Εισερχόμενη κλήση")
      Call.STATE_SELECT_PHONE_ACCOUNT -> say("Choose the SIM", "Διάλεξε SIM")
      Call.STATE_HOLDING -> say("On hold", "Σε αναμονή")
      Call.STATE_DISCONNECTING -> say("Hanging up…", "Κλείσιμο…")
      Call.STATE_DISCONNECTED -> say("Call ended", "Η κλήση τελείωσε")
      Call.STATE_ACTIVE -> {
        val since = call.details.connectTimeMillis
        if (since > 0) duration((System.currentTimeMillis() - since) / 1000) else ""
      }
      else -> say("Calling…", "Κλήση…")
    }

  /** The SIM a call is on, when the phone has more than one way to call. */
  private fun simLabel(call: Call): String? {
    val handle = call.details.accountHandle ?: return null
    if (accounts.size < 2) return null
    return accounts.firstOrNull { it.handle == handle }?.let(Sims::label)
  }

  // Answers the call that rings with video, once the camera may be used; without it, with sound only.
  private fun answerWithVideo() {
    withCamera { yes -> Calls.ringing()?.let { if (yes) Calls.answerVideo(it) else Calls.answer(it) } }
  }

  // The other side asks to turn video on during the call.
  private fun askedVideo(call: Call, profile: VideoProfile) {
    if (isFinishing || !VideoProfile.isVideo(profile.videoState)) return
    AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
      .setTitle(say("{0} wants to turn video on", "{0} θέλει να ανοίξει βίντεο", nameOf(call)))
      .setPositiveButton(say("Turn video on", "Άνοιγμα βίντεο")) { _, _ -> withCamera { yes -> video.answer(call, profile, yes) } }
      .setNegativeButton(say("Keep to sound", "Μόνο ήχος")) { _, _ -> video.answer(call, profile, false) }
      .setOnCancelListener { video.answer(call, profile, false) }
      .show()
  }

  // Runs `then` once Android says whether the camera may be used, asking it first when needed.
  private fun withCamera(then: (Boolean) -> Unit) {
    if (video.mayUseCamera()) {
      then(true)
      return
    }
    afterCamera = then
    requestPermissions(arrayOf(Manifest.permission.CAMERA), CAMERA_ASK)
  }

  override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    if (requestCode != CAMERA_ASK) return
    val then = afterCamera
    afterCamera = null
    then?.invoke(grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED)
    built = ""
    render()
  }

  private fun answerButton(label: String) =
    round(label, Glyph.CALL, { Calls.ringing()?.let { Calls.answer(it) } }, fill = ANSWER_FILL)

  private fun declineButton() =
    round(say("Decline", "Απόρριψη"), Glyph.CALL, { Calls.ringing()?.reject(false, null) }, fill = END_FILL, turn = 135f)

  private fun endButton() =
    round(say("End", "Τέλος"), Glyph.CALL, { (Calls.front() ?: Calls.ringing())?.disconnect() }, fill = END_FILL, turn = 135f)

  // Declines with an SMS to the caller, when Telecom can send one: it sends it itself, from the
  // phone's SMS, so it shows among the SMS too.
  private fun messageButton(call: Call): View? {
    if (!call.details.can(Call.Details.CAPABILITY_RESPOND_VIA_TEXT) || Callers.number(call).isEmpty()) return null
    return round(say("Message", "Μήνυμα"), Glyph.MESSAGE, { declineWithMessage(call) })
  }

  private fun declineWithMessage(call: Call) {
    val replies = Replies.list(this)
    val choices = replies + say("Write your own…", "Γράψε δικό σου…")
    AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
      .setTitle(say("Decline with a message", "Απόρριψη με μήνυμα"))
      .setItems(choices.toTypedArray()) { _, which ->
        if (which < replies.size) call.reject(true, replies[which]) else writeMessage(call)
      }
      .show()
  }

  private fun writeMessage(call: Call) {
    val field = EditText(this).apply {
      inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES or InputType.TYPE_TEXT_FLAG_MULTI_LINE
      hint = say("Message", "Μήνυμα")
    }
    val frame = FrameLayout(this).apply {
      setPadding(dp(20), dp(8), dp(20), 0)
      addView(field)
    }
    val dialog = AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
      .setTitle(say("Decline with a message", "Απόρριψη με μήνυμα"))
      .setView(frame)
      .setPositiveButton(say("Send", "Αποστολή")) { _, _ ->
        field.text.toString().trim().takeIf { it.isNotEmpty() }?.let { call.reject(true, it) }
      }
      .setNegativeButton(say("Cancel", "Άκυρο"), null)
      .create()
    dialog.window?.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_VISIBLE)
    dialog.show()
    field.requestFocus()
  }

  private fun controls(call: Call, second: Call?) {
    val held = Calls.state(call) == Call.STATE_HOLDING
    val route = Calls.route
    val soundGlyph = if (route?.kind == Calls.BLUETOOTH) Glyph.BLUETOOTH else Glyph.SPEAKER
    val soundOn = route != null && route.kind != Calls.EARPIECE
    val many = Calls.routes.any { it.kind == Calls.BLUETOOTH || it.kind == Calls.WIRED || it.kind == Calls.STREAMING }
    val soundLabel = if (many && route != null) routeName(route) else say("Speaker", "Ηχείο")
    row(
      round(if (Calls.muted) say("Unmute", "Ήχος") else say("Mute", "Σίγαση"), Glyph.MIC, { Calls.mute(!Calls.muted) }, on = Calls.muted),
      round(say("Keypad", "Πληκτρολόγιο"), Glyph.KEYPAD, {
        keypad = true
        built = ""
        render()
      }),
      round(soundLabel, soundGlyph, { sound() }, on = soundOn),
    )
    if (video.isVideo(call)) {
      row(
        round(say("Camera off", "Κλείσιμο κάμερας"), Glyph.VIDEO, { video.ask(call, false) }, on = true),
        round(say("Switch camera", "Αλλαγή κάμερας"), Glyph.FLIP, { video.switchCamera() }),
      )
    } else if (video.canVideo(call) && Calls.state(call) == Call.STATE_ACTIVE) {
      row(round(say("Video", "Βίντεο"), Glyph.VIDEO, { withCamera { yes -> if (yes) video.ask(call, true) } }))
    }
    val merge = Calls.canMerge(call)
    val swap = second != null && Calls.state(second) == Call.STATE_HOLDING
    row(
      if (Calls.canHold(call) || held) round(if (held) say("Resume", "Συνέχεια") else say("Hold", "Αναμονή"), Glyph.PAUSE, { if (held) call.unhold() else call.hold() }, on = held) else null,
      if (Calls.canAdd) round(say("Add call", "Νέα κλήση"), Glyph.ADD, { addCall() }) else null,
      when {
        merge -> round(say("Merge", "Συγχώνευση"), Glyph.MERGE, { Calls.merge(call) })
        swap -> round(say("Swap", "Εναλλαγή"), Glyph.SWAP, { Calls.swap(call) })
        else -> null
      },
    )
    row(endButton())
  }

  // The keypad, for the tones a menu on the line asks for: each key sounds while it is held.
  @SuppressLint("ClickableViewAccessibility")
  private fun keys() {
    val rows = listOf("123", "456", "789", "*0#")
    for (keys in rows) {
      val cells = keys.map { key ->
        round("", null, {}, sign = key.toString()).also { cell ->
          val circle = (cell as LinearLayout).getChildAt(0)
          circle.setOnTouchListener { view, event ->
            val call = Calls.front()
            when (event.action) {
              MotionEvent.ACTION_DOWN -> {
                call?.playDtmfTone(key)
                tones.append(key.toString())
                view.isPressed = true
              }
              MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                call?.stopDtmfTone()
                view.isPressed = false
              }
            }
            true
          }
        }
      }
      row(*cells.toTypedArray())
    }
    row(
      round(say("Hide", "Απόκρυψη"), Glyph.KEYPAD, {
        keypad = false
        built = ""
        render()
      }),
      endButton(),
    )
  }

  private fun routeName(route: Route): String =
    when (route.kind) {
      Calls.EARPIECE -> say("Phone", "Τηλέφωνο")
      Calls.SPEAKER -> say("Speaker", "Ηχείο")
      Calls.WIRED -> say("Headset", "Ακουστικά")
      Calls.BLUETOOTH -> route.name?.takeIf { it.isNotBlank() } ?: "Bluetooth"
      else -> route.name?.takeIf { it.isNotBlank() } ?: say("Elsewhere", "Αλλού")
    }

  // With only the earpiece and the loudspeaker, one tap moves the sound; with a Bluetooth device
  // or a headset, the places to choose from.
  private fun sound() {
    val routes = Calls.routes
    val current = Calls.route
    if (routes.none { it.kind == Calls.BLUETOOTH || it.kind == Calls.WIRED || it.kind == Calls.STREAMING }) {
      val next = if (current?.kind == Calls.SPEAKER) routes.firstOrNull { it.kind != Calls.SPEAKER } else routes.firstOrNull { it.kind == Calls.SPEAKER }
      next?.let { Calls.moveSound(it) }
      return
    }
    val names = routes.map(::routeName).toTypedArray()
    AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
      .setTitle(say("Sound", "Ήχος"))
      .setSingleChoiceItems(names, routes.indexOfFirst { it === current }) { dialog, which ->
        Calls.moveSound(routes[which])
        dialog.dismiss()
      }
      .show()
  }

  // Another call: Erevos's own keypad, which opens once Erevos is unlocked, after the phone.
  private fun addCall() {
    val open = {
      val link = Intent(Intent.ACTION_VIEW, Uri.parse("erevos://phone")).setPackage(packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      runCatching { startActivity(link) }
      Unit
    }
    val keyguard = getSystemService(KeyguardManager::class.java)
    if (Build.VERSION.SDK_INT >= 26 && keyguard?.isKeyguardLocked == true) {
      keyguard.requestDismissKeyguard(this, object : KeyguardManager.KeyguardDismissCallback() {
        override fun onDismissSucceeded() = open()
      })
    } else {
      open()
    }
  }

  // A call made without a SIM chosen, on a phone that asks each time: Telecom waits for one.
  @Suppress("DEPRECATION")
  private fun askSim(call: Call) {
    val offered = call.details.intentExtras?.getParcelableArrayList<PhoneAccountHandle>(Call.AVAILABLE_PHONE_ACCOUNTS)
      ?: call.details.extras?.getParcelableArrayList<PhoneAccountHandle>(Call.AVAILABLE_PHONE_ACCOUNTS)
    val accounts = Sims.accounts(this).filter { offered == null || offered.contains(it.handle) }
    val handles = if (accounts.isNotEmpty()) accounts.map { it.handle } else offered ?: emptyList()
    if (handles.isEmpty()) return
    val names = if (accounts.isNotEmpty()) accounts.map { listOf(Sims.label(it), it.label).filter { l -> l.isNotEmpty() }.distinct().joinToString(" · ") } else handles.map { it.id }
    AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
      .setTitle(say("Call on", "Κλήση από"))
      .setItems(names.toTypedArray()) { _, which -> call.phoneAccountSelected(handles[which], false) }
      .setOnCancelListener { call.disconnect() }
      .show()
  }

  // No call is on any more: why it ended, a moment, then the screen goes.
  private fun ended() {
    val last = Calls.all.lastOrNull { it.parent == null } ?: Calls.ended
    // Telecom's reason, when it says more than that the call ended: busy, no service, and so on.
    val cause = last?.details?.disconnectCause
    val plain = setOf(DisconnectCause.LOCAL, DisconnectCause.REMOTE, DisconnectCause.REJECTED, DisconnectCause.MISSED, DisconnectCause.CANCELED, DisconnectCause.ANSWERED_ELSEWHERE)
    val why = if (cause != null && cause.code !in plain) cause.label?.toString()?.takeIf { it.isNotBlank() } else null
    status.text = listOfNotNull(say("Call ended", "Η κλήση τελείωσε"), why).joinToString(" · ")
    other.visibility = View.GONE
    tones.visibility = View.GONE
    people.visibility = View.GONE
    peopleBuilt = ""
    video.follow(null, false)
    buttons.removeAllViews()
    built = ""
    keypad = false
    atEar(false)
    closing = true
    main.postDelayed({
      if (Calls.live().isEmpty()) {
        finishAndRemoveTask()
      } else {
        closing = false
        render()
      }
    }, 1500)
  }

  private fun atEar(on: Boolean) {
    if (on) {
      if (proximity?.isHeld == true) return
      val power = getSystemService(PowerManager::class.java) ?: return
      if (!power.isWakeLockLevelSupported(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK)) return
      proximity = power.newWakeLock(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK, "erevos:phone").also {
        it.setReferenceCounted(false)
        it.acquire(4 * 60 * 60 * 1000L)
      }
    } else {
      proximity?.let { if (it.isHeld) it.release() }
      proximity = null
    }
  }

  companion object {
    const val ANSWER = "expo.modules.erevosphone.ANSWER"
    const val CALL = "call"
    private const val CAMERA_ASK = 4245
    // Erevos's own call screen's colours (components/call-screen.tsx).
    private const val GROUND = 0xFF0B0B0D.toInt()
    private const val INK = Color.WHITE
    private const val MUTED = 0xCCFFFFFF.toInt()
    private const val FAINT = 0x99FFFFFF.toInt()
    private const val SOFT = 0x29FFFFFF
    private const val FACE = 0xFF2A2520.toInt()
    private const val ANSWER_FILL = 0xFF2E7D32.toInt()
    private const val END_FILL = 0xFFC62828.toInt()
    private const val WARN_FILL = 0xFF3A2E12.toInt()
    private const val WARN_INK = 0xFFFBBF24.toInt()

    fun intent(context: Context): Intent =
      Intent(context, CallActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)

    /** Brings the call screen up, from the service or from Erevos. */
    fun show(context: Context) {
      runCatching { context.startActivity(intent(context)) }
    }

    /** "1:05", "12:40", "1:02:03". */
    fun duration(seconds: Long): String {
      val h = seconds / 3600
      val m = (seconds % 3600) / 60
      val s = seconds % 60
      return if (h > 0) "%d:%02d:%02d".format(h, m, s) else "%d:%02d".format(m, s)
    }
  }
}
