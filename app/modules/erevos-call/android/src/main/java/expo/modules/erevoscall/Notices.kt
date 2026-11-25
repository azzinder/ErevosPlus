// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevoscall

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.Ringtone
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator

// The notices Erevos shows: that it keeps receiving while in the background, or that it stopped,
// as Android closed it or its space locked, a call that rings, and that messages came. None says who: no name, no message,
// only what kind of call, or how many messages. Tapping one opens Erevos, which shows the rest
// only once it is open. On a locked phone the messages notice says only "Erevos".
object Notices {
  const val RECEIVING_ID = 7101
  const val RINGING_ID = 7102
  const val MESSAGES_ID = 7103
  private const val STOPPED_ID = 7104
  private const val RECEIVING_CHANNEL = "erevos-receiving"
  // Started by itself as the phone turned on (BootStart): its notice shows in the status bar, so it
  // is seen to run, where the one while a space is open stays out of it.
  private const val WAITING_CHANNEL = "erevos-waiting"
  const val CALLS_CHANNEL = "erevos-calls"
  const val MESSAGES_CHANNEL = "erevos-messages"
  // The same notice, for messages sent without sound: a channel that never sounds.
  const val QUIET_CHANNEL = "erevos-messages-quiet"
  // The same notice again, for a chat given a sound of its own (Chat details → Notifications):
  // the channel never sounds, and the chat's sound plays from Erevos itself (play), so one notice
  // can sound as each chat says. A channel's sound is fixed once it is made, so one per chat would
  // be needed otherwise, each named in Android's settings.
  const val OWN_CHANNEL = "erevos-messages-own"
  // That Erevos stopped receiving in the background, closed by Android or locked: shows, without sound.
  private const val STOPPED_CHANNEL = "erevos-stopped"

  // The app's language, as the app last set it ("en", "el", "de", "es", "fr", "it", "pt" or
  // "sh"; English until it is set). The other modules read the same (erevos-sms SmsStore.kt).
  private const val LANG_PREFS = "erevos-lang"

  fun setLanguage(context: Context, lang: String) {
    context.getSharedPreferences(LANG_PREFS, Context.MODE_PRIVATE).edit().putString("lang", lang).apply()
    // The channels' names follow, in the phone's notification settings.
    named = null
    channels(context)
  }

  private fun lang(context: Context): String =
    context.getSharedPreferences(LANG_PREFS, Context.MODE_PRIVATE).getString("lang", null) ?: "en"

  // The words in the app's language: `en` and `el` are given at the call, the others come from
  // OTHERS, keyed by the English. `{0}` in a text is put in place by `arg`.
  private fun say(context: Context, en: String, el: String, arg: String? = null): String {
    val lang = lang(context)
    val text = when (lang) {
      "en" -> en
      "el" -> el
      else -> OTHERS[en]?.get(lang) ?: en
    }
    return if (arg != null) text.replace("{0}", arg) else text
  }

  private fun t(de: String, es: String, fr: String, it: String, pt: String, sh: String) =
    mapOf("de" to de, "es" to es, "fr" to fr, "it" to it, "pt" to pt, "sh" to sh)

  // German, Spanish, French, Italian, Portuguese and Serbo-Croatian (Latin script, ijekavian), by the English.
  private val OTHERS: Map<String, Map<String, String>> = mapOf(
    "Receiving in the background" to t("Empfang im Hintergrund", "Recepción en segundo plano", "Réception en arrière-plan", "Ricezione in background", "Recepção em segundo plano", "Primanje u pozadini"),
    "Waiting since the phone turned on" to t("Wartet seit dem Einschalten des Telefons", "En espera desde que se encendió el teléfono", "En attente depuis l’allumage du téléphone", "In attesa da quando il telefono si è acceso", "À espera desde que o telefone foi ligado", "Čeka otkako je telefon uključen"),
    "Calls" to t("Anrufe", "Llamadas", "Appels", "Chiamate", "Chamadas", "Pozivi"),
    "Messages" to t("Nachrichten", "Mensajes", "Messages", "Messaggi", "Mensagens", "Poruke"),
    "Messages without sound" to t("Nachrichten ohne Ton", "Mensajes sin sonido", "Messages sans son", "Messaggi senza suono", "Mensagens sem som", "Poruke bez zvuka"),
    "Messages with a chat's own sound" to t("Nachrichten mit dem Ton des Chats", "Mensajes con el sonido propio del chat", "Messages avec le son propre à la discussion", "Messaggi con il suono proprio della chat", "Mensagens com o som próprio da conversa", "Poruke sa zvukom razgovora"),
    "Not receiving" to t("Kein Empfang", "Sin recepción", "Pas de réception", "Nessuna ricezione", "Sem recepção", "Primanje je isključeno"),
    "Locked: says only that messages came" to t("Gesperrt: sagt nur, dass Nachrichten gekommen sind", "Bloqueado: solo avisa de que llegaron mensajes", "Verrouillé : indique seulement que des messages sont arrivés", "Bloccato: dice solo che sono arrivati messaggi", "Bloqueado: só avisa que chegaram mensagens", "Zaključano: samo javlja da su stigle poruke"),
    "Ready for calls and messages" to t("Bereit für Anrufe und Nachrichten", "Listo para llamadas y mensajes", "Prêt pour les appels et les messages", "Pronto per chiamate e messaggi", "Pronto para chamadas e mensagens", "Spremno za pozive i poruke"),
    "Locked. Open it to receive calls and messages again." to t("Gesperrt. Öffne es, um wieder Anrufe und Nachrichten zu empfangen.", "Bloqueado. Ábrelo para volver a recibir llamadas y mensajes.", "Verrouillé. Ouvre-le pour recevoir de nouveau les appels et les messages.", "Bloccato. Aprilo per ricevere di nuovo chiamate e messaggi.", "Bloqueado. Abra para voltar a receber chamadas e mensagens.", "Zaključano. Otvori ga da opet primaš pozive i poruke."),
    "Closed by Android. Open it to receive calls and messages again." to t("Von Android beendet. Öffne es, um wieder Anrufe und Nachrichten zu empfangen.", "Android lo ha cerrado. Ábrelo para volver a recibir llamadas y mensajes.", "Fermé par Android. Ouvre-le pour recevoir de nouveau les appels et les messages.", "Chiuso da Android. Aprilo per ricevere di nuovo chiamate e messaggi.", "Fechado pelo Android. Abra para voltar a receber chamadas e mensagens.", "Android ga je zatvorio. Otvori ga da opet primaš pozive i poruke."),
    "Incoming video call" to t("Eingehender Videoanruf", "Videollamada entrante", "Appel vidéo entrant", "Videochiamata in arrivo", "Videochamada recebida", "Dolazni videopoziv"),
    "Incoming call" to t("Eingehender Anruf", "Llamada entrante", "Appel entrant", "Chiamata in arrivo", "Chamada recebida", "Dolazni poziv"),
    "Open Erevos to answer" to t("Öffne Erevos, um anzunehmen", "Abre Erevos para responder", "Ouvre Erevos pour répondre", "Apri Erevos per rispondere", "Abra o Erevos para atender", "Otvori Erevos da se javiš"),
    "New message" to t("Neue Nachricht", "Mensaje nuevo", "Nouveau message", "Nuovo messaggio", "Nova mensagem", "Nova poruka"),
    "{0} new messages" to t("{0} neue Nachrichten", "{0} mensajes nuevos", "{0} nouveaux messages", "{0} nuovi messaggi", "{0} novas mensagens", "Nove poruke: {0}"),
  )

  // The language the channels were named in at this start.
  private var named: String? = null

  private fun manager(context: Context) = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

  /** Whether the call notice may show: its channel not turned off. A channel not made yet is made as it should be. */
  fun callsShown(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return true
    val channel = manager(context).getNotificationChannel(CALLS_CHANNEL) ?: return true
    return channel.importance != NotificationManager.IMPORTANCE_NONE
  }

  /** A channel's settings as the owner left them, for the permissions check; made first if it is
   *  not yet, so its screen in the settings opens. Null before Android 8, which has no channels. */
  fun channelState(context: Context, id: String): Map<String, Any>? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return null
    channels(context)
    val channel = manager(context).getNotificationChannel(id) ?: return null
    return mapOf(
      "importance" to channel.importance,
      "sound" to (channel.sound != null),
      "lockScreen" to channel.lockscreenVisibility,
      "bypassDnd" to channel.canBypassDnd(),
    )
  }

  private fun channels(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = manager(context)
    val lang = lang(context)
    if (named != lang) {
      named = lang
      // A channel made again under its id keeps its settings and takes the new name.
      manager.getNotificationChannel(RECEIVING_CHANNEL)?.let { it.name = say(context, "Receiving in the background", "Λήψη στο παρασκήνιο"); manager.createNotificationChannel(it) }
      manager.getNotificationChannel(WAITING_CHANNEL)?.let { it.name = say(context, "Waiting since the phone turned on", "Σε αναμονή από το άνοιγμα του τηλεφώνου"); manager.createNotificationChannel(it) }
      manager.getNotificationChannel(CALLS_CHANNEL)?.let { it.name = say(context, "Calls", "Κλήσεις"); manager.createNotificationChannel(it) }
      manager.getNotificationChannel(MESSAGES_CHANNEL)?.let { it.name = say(context, "Messages", "Μηνύματα"); manager.createNotificationChannel(it) }
      manager.getNotificationChannel(QUIET_CHANNEL)?.let { it.name = say(context, "Messages without sound", "Μηνύματα χωρίς ήχο"); manager.createNotificationChannel(it) }
      manager.getNotificationChannel(OWN_CHANNEL)?.let { it.name = say(context, "Messages with a chat's own sound", "Μηνύματα με δικό τους ήχο"); manager.createNotificationChannel(it) }
      manager.getNotificationChannel(STOPPED_CHANNEL)?.let { it.name = say(context, "Not receiving", "Χωρίς λήψη"); manager.createNotificationChannel(it) }
    }
    if (manager.getNotificationChannel(RECEIVING_CHANNEL) == null) {
      manager.createNotificationChannel(
        NotificationChannel(RECEIVING_CHANNEL, say(context, "Receiving in the background", "Λήψη στο παρασκήνιο"), NotificationManager.IMPORTANCE_MIN).apply {
          setShowBadge(false)
          lockscreenVisibility = Notification.VISIBILITY_SECRET
        },
      )
    }
    if (manager.getNotificationChannel(WAITING_CHANNEL) == null) {
      manager.createNotificationChannel(
        NotificationChannel(WAITING_CHANNEL, say(context, "Waiting since the phone turned on", "Σε αναμονή από το άνοιγμα του τηλεφώνου"), NotificationManager.IMPORTANCE_LOW).apply {
          setSound(null, null as AudioAttributes?)
          enableVibration(false)
          setShowBadge(false)
          lockscreenVisibility = Notification.VISIBILITY_SECRET
        },
      )
    }
    if (manager.getNotificationChannel(CALLS_CHANNEL) == null) {
      // The ringtone plays from the app itself (ErevosCallModule), so the channel stays silent and
      // the sound stops the moment the call is answered or ends.
      manager.createNotificationChannel(
        NotificationChannel(CALLS_CHANNEL, say(context, "Calls", "Κλήσεις"), NotificationManager.IMPORTANCE_HIGH).apply {
          setSound(null, null as AudioAttributes?)
          enableVibration(false)
          lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        },
      )
    }
    if (manager.getNotificationChannel(MESSAGES_CHANNEL) == null) {
      manager.createNotificationChannel(
        NotificationChannel(MESSAGES_CHANNEL, say(context, "Messages", "Μηνύματα"), NotificationManager.IMPORTANCE_DEFAULT).apply {
          setShowBadge(true)
          lockscreenVisibility = Notification.VISIBILITY_PRIVATE
        },
      )
    }
    if (manager.getNotificationChannel(QUIET_CHANNEL) == null) {
      manager.createNotificationChannel(
        NotificationChannel(QUIET_CHANNEL, say(context, "Messages without sound", "Μηνύματα χωρίς ήχο"), NotificationManager.IMPORTANCE_LOW).apply {
          setSound(null, null as AudioAttributes?)
          enableVibration(false)
          setShowBadge(true)
          lockscreenVisibility = Notification.VISIBILITY_PRIVATE
        },
      )
    }
    if (manager.getNotificationChannel(OWN_CHANNEL) == null) {
      manager.createNotificationChannel(
        NotificationChannel(OWN_CHANNEL, say(context, "Messages with a chat's own sound", "Μηνύματα με δικό τους ήχο"), NotificationManager.IMPORTANCE_DEFAULT).apply {
          setSound(null, null as AudioAttributes?)
          enableVibration(false)
          setShowBadge(true)
          lockscreenVisibility = Notification.VISIBILITY_PRIVATE
        },
      )
    }
    if (manager.getNotificationChannel(STOPPED_CHANNEL) == null) {
      manager.createNotificationChannel(
        NotificationChannel(STOPPED_CHANNEL, say(context, "Not receiving", "Χωρίς λήψη"), NotificationManager.IMPORTANCE_LOW).apply {
          setSound(null, null as AudioAttributes?)
          enableVibration(false)
          setShowBadge(false)
          lockscreenVisibility = Notification.VISIBILITY_PRIVATE
        },
      )
    }
  }

  // Opens Erevos where it was, or starts it.
  private fun opening(context: Context, request: Int): PendingIntent? {
    val intent = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
    return PendingIntent.getActivity(context, request, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  }

  @Suppress("DEPRECATION")
  private fun builder(context: Context, channel: String): Notification.Builder =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) Notification.Builder(context, channel) else Notification.Builder(context)

  // `waiting`: started by itself as the phone turned on (BootStart), with no space open, so only the
  // closed spaces that asked for it say a message came.
  fun receiving(context: Context, waiting: Boolean = false): Notification {
    channels(context)
    @Suppress("DEPRECATION")
    return builder(context, if (waiting) WAITING_CHANNEL else RECEIVING_CHANNEL)
      .setSmallIcon(R.drawable.erevos_call_notice)
      .setContentTitle("Erevos")
      .setContentText(
        if (waiting) say(context, "Locked: says only that messages came", "Κλειδωμένο: λέει μόνο ότι ήρθαν μηνύματα")
        else say(context, "Ready for calls and messages", "Έτοιμο για κλήσεις και μηνύματα"),
      )
      .setOngoing(true)
      .setShowWhen(false)
      .setPriority(if (waiting) Notification.PRIORITY_LOW else Notification.PRIORITY_MIN)
      .setVisibility(Notification.VISIBILITY_SECRET)
      .setContentIntent(opening(context, 1))
      .build()
  }

  // Android closed Erevos while it received in the background (ReceiveService), or, `locked`, its
  // space locked and Erevos left the screen with the password asked (lib/background.ts): until it
  // is open again, no call rings and no message comes. On a locked phone it says only "Erevos".
  fun stopped(context: Context, locked: Boolean = false) {
    channels(context)
    @Suppress("DEPRECATION")
    val shown = builder(context, STOPPED_CHANNEL)
      .setSmallIcon(R.drawable.erevos_call_notice)
      .setContentTitle("Erevos")
      .setShowWhen(false)
      .build()
    @Suppress("DEPRECATION")
    val notification = builder(context, STOPPED_CHANNEL)
      .setSmallIcon(R.drawable.erevos_call_notice)
      .setContentTitle("Erevos")
      .setContentText(
        if (locked) say(context, "Locked. Open it to receive calls and messages again.", "Κλειδωμένο. Άνοιξέ το για να λαμβάνεις ξανά κλήσεις και μηνύματα.")
        else say(context, "Closed by Android. Open it to receive calls and messages again.", "Το έκλεισε το Android. Άνοιξέ το για να λαμβάνεις ξανά κλήσεις και μηνύματα."),
      )
      .setPriority(Notification.PRIORITY_LOW)
      .setVisibility(Notification.VISIBILITY_PRIVATE)
      .setPublicVersion(shown)
      .setAutoCancel(true)
      .setContentIntent(opening(context, 4))
      .build()
    runCatching { manager(context).notify(STOPPED_ID, notification) }
  }

  fun clearStopped(context: Context) {
    manager(context).cancel(STOPPED_ID)
  }

  fun ring(context: Context, video: Boolean) = runCatching {
    channels(context)
    val open = opening(context, 2)
    @Suppress("DEPRECATION")
    val notification = builder(context, CALLS_CHANNEL)
      .setSmallIcon(R.drawable.erevos_call_notice)
      .setContentTitle(if (video) say(context, "Incoming video call", "Εισερχόμενη βιντεοκλήση") else say(context, "Incoming call", "Εισερχόμενη κλήση"))
      .setContentText(say(context, "Open Erevos to answer", "Άνοιξε το Erevos για να απαντήσεις"))
      .setCategory(Notification.CATEGORY_CALL)
      .setPriority(Notification.PRIORITY_MAX)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(true)
      .setContentIntent(open)
      .setFullScreenIntent(open, true)
      // Gone once the ring would have ended, should Erevos be closed meanwhile with no one to take it away.
      .apply { if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) setTimeoutAfter(ErevosCallModule.RING_WAKE_MS) }
      .build()
    manager(context).notify(RINGING_ID, notification)
  }

  fun stopRinging(context: Context) {
    manager(context).cancel(RINGING_ID)
  }

  // The channel the messages notice that shows now is on: MESSAGES_CHANNEL once it sounded as the
  // channel says, OWN_CHANNEL or QUIET_CHANNEL while it only showed; null while none shows.
  private var on: String? = null

  // `count` messages came: each one sounds, as the channel says. While only messages sent without
  // sound (`quiet`) came, it shows on the silent channel; one sent without sound only counts. One
  // from a chat with a sound of its own (`sound`, its address) shows without the channel's sound,
  // and its own plays.
  fun messages(context: Context, count: Int, quiet: Boolean, sound: String? = null) {
    channels(context)
    val manager = manager(context)
    // Swiped away, it shows anew.
    val shown = showing(manager, count)
    if (!shown) on = null
    val channel = when {
      quiet -> on ?: QUIET_CHANNEL
      !sound.isNullOrEmpty() -> if (on == MESSAGES_CHANNEL) MESSAGES_CHANNEL else OWN_CHANNEL
      else -> MESSAGES_CHANNEL
    }
    val alert = !quiet && sound.isNullOrEmpty()
    // A notice that showed silently is taken away first, or the one that should sound would not;
    // so is one Erevos does not know about, shown before Android closed it and it started again.
    if (alert && shown && on != MESSAGES_CHANNEL) manager.cancel(MESSAGES_ID)
    // Its sound plays instead of a chat's own that still does.
    if (alert) stopChime()
    show(context, count, channel, !alert)
    on = channel
    if (!quiet && !sound.isNullOrEmpty()) play(context, Uri.parse(sound), OWN_CHANNEL, buzz = true)
    Widget.messages(context, count)
  }

  // Some of the messages it counted were read in Erevos: the notice says how many are left, without
  // sound. One that was swiped away stays away.
  fun recountMessages(context: Context, count: Int) {
    if (count <= 0) return clearMessages(context)
    channels(context)
    if (showing(manager(context), count)) show(context, count, on ?: QUIET_CHANNEL, true)
    Widget.messages(context, count)
  }

  private fun showing(manager: NotificationManager, count: Int) =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) manager.activeNotifications.any { it.id == MESSAGES_ID } else count > 1

  // `silent`: it shows or counts on without sound.
  private fun show(context: Context, count: Int, channel: String, silent: Boolean) {
    val text = if (count == 1) say(context, "New message", "Νέο μήνυμα") else say(context, "{0} new messages", "{0} νέα μηνύματα", count.toString())
    @Suppress("DEPRECATION")
    val locked = builder(context, channel)
      .setSmallIcon(R.drawable.erevos_call_notice)
      .setContentTitle("Erevos")
      .setShowWhen(false)
      .build()
    @Suppress("DEPRECATION")
    val notification = builder(context, channel)
      .setSmallIcon(R.drawable.erevos_call_notice)
      .setContentTitle("Erevos")
      .setContentText(text)
      .setNumber(count)
      .setCategory(Notification.CATEGORY_MESSAGE)
      .setPriority(Notification.PRIORITY_DEFAULT)
      .setVisibility(Notification.VISIBILITY_PRIVATE)
      .setPublicVersion(locked)
      .setOnlyAlertOnce(silent)
      .setAutoCancel(true)
      .setContentIntent(opening(context, 3))
      .build()
    manager(context).notify(MESSAGES_ID, notification)
  }

  // What plays for a message that came where Erevos shows it, or with a chat's own sound.
  private var chiming: Ringtone? = null

  // A message came in the chat or group that shows on the screen: no notice, only the messages
  // channel's own sound, as the owner left it, or the chat's own (`sound`, its address); none
  // while the phone is on silent or vibrate, in Do not disturb, or with Erevos's notices or that
  // channel turned off.
  fun chime(context: Context, sound: String? = null) {
    channels(context)
    if (!sound.isNullOrEmpty()) return play(context, Uri.parse(sound), OWN_CHANNEL, buzz = false)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = manager(context).getNotificationChannel(MESSAGES_CHANNEL) ?: return
      play(context, channel.sound ?: return, MESSAGES_CHANNEL, buzz = false)
    } else {
      play(context, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION), MESSAGES_CHANNEL, buzz = false)
    }
  }

  // Plays `sound` once, as a message's, unless Erevos's notices or `channel` are turned off, or Do
  // not disturb keeps messages quiet; on silent, nothing, and on vibrate only a buzz with `buzz`,
  // as Android does for a notice that sounds. A sound that is gone from the phone plays the
  // messages channel's.
  private fun play(context: Context, sound: Uri, channel: String, buzz: Boolean) {
    val manager = manager(context)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && !manager.areNotificationsEnabled()) return
    val made = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) manager.getNotificationChannel(channel) ?: return else null
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && made!!.importance < NotificationManager.IMPORTANCE_DEFAULT) return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      when (manager.currentInterruptionFilter) {
        NotificationManager.INTERRUPTION_FILTER_ALL, NotificationManager.INTERRUPTION_FILTER_UNKNOWN -> {}
        // Priority only: as for a message's notice, which names no one, when messages from
        // anyone may come through, or the channel may (Erevos among the apps that can interrupt).
        NotificationManager.INTERRUPTION_FILTER_PRIORITY -> if (!(made?.canBypassDnd() == true || messagesThrough(manager))) return
        else -> return
      }
    }
    val audio = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager ?: return
    when (audio.ringerMode) {
      AudioManager.RINGER_MODE_NORMAL -> {}
      AudioManager.RINGER_MODE_VIBRATE -> return if (buzz) buzz(context) else Unit
      else -> return
    }
    runCatching {
      chiming?.stop()
      val fallback = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) manager.getNotificationChannel(MESSAGES_CHANNEL)?.sound else null
      val playing = if (opens(context, sound)) sound else fallback ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
      chiming = playing?.let { RingtoneManager.getRingtone(context, it) }?.apply {
        audioAttributes = AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_NOTIFICATION)
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .build()
        play()
      }
    }
  }

  // Whether Do not disturb lets a call ring, as Android lets the call notice through: always without
  // it; with Priority only, when the Calls channel may break through it or calls from anyone may
  // (the notice names no one); never with Alarms only or Total silence.
  fun callsThrough(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true
    val manager = manager(context)
    return when (manager.currentInterruptionFilter) {
      NotificationManager.INTERRUPTION_FILTER_ALL, NotificationManager.INTERRUPTION_FILTER_UNKNOWN -> true
      NotificationManager.INTERRUPTION_FILTER_PRIORITY -> {
        channels(context)
        val made = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) manager.getNotificationChannel(CALLS_CHANNEL) else null
        made?.canBypassDnd() == true || callsFromAnyone(manager)
      }
      else -> false
    }
  }

  // Whether Do not disturb lets calls from anyone through.
  private fun callsFromAnyone(manager: NotificationManager): Boolean =
    runCatching {
      val policy = manager.notificationPolicy
      policy.priorityCategories and NotificationManager.Policy.PRIORITY_CATEGORY_CALLS != 0 &&
        policy.priorityCallSenders == NotificationManager.Policy.PRIORITY_SENDERS_ANY
    }.getOrDefault(false)

  // Whether Do not disturb lets messages from anyone through.
  private fun messagesThrough(manager: NotificationManager): Boolean =
    Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
      runCatching {
        val policy = manager.notificationPolicy
        policy.priorityCategories and NotificationManager.Policy.PRIORITY_CATEGORY_MESSAGES != 0 &&
          policy.priorityMessageSenders == NotificationManager.Policy.PRIORITY_SENDERS_ANY
      }.getOrDefault(false)

  // Whether the sound at `uri` is still on the phone: not once its file is deleted or the app that
  // gave it is gone, when Android would play its own fallback ring instead. One Erevos may not read
  // itself, the phone's player still can.
  fun opens(context: Context, uri: Uri): Boolean =
    try {
      context.contentResolver.openAssetFileDescriptor(uri, "r")?.use { true } ?: false
    } catch (_: SecurityException) {
      true
    } catch (_: Exception) {
      false
    }

  // A chat's own sound that still plays stops: its notice was opened or went, or a call rings.
  fun stopChime() {
    runCatching { chiming?.stop() }
    chiming = null
  }

  // Two short buzzes, as a message's notice makes on vibrate, and only as the phone's notification
  // vibration allows.
  @Suppress("DEPRECATION")
  private fun buzz(context: Context) {
    runCatching {
      val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return
      if (!vibrator.hasVibrator()) return
      val pattern = longArrayOf(0, 200, 150, 200)
      val attributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1), attributes)
      else vibrator.vibrate(pattern, -1, attributes)
    }
  }

  fun clearMessages(context: Context) {
    on = null
    stopChime()
    manager(context).cancel(MESSAGES_ID)
    Widget.messages(context, 0)
  }
}
