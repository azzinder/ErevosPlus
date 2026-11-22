// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevostelegram

import android.content.Context
import android.media.MediaRecorder
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Base64
import java.io.File

// A Telegram voice message, recorded as Telegram's own are: Ogg with Opus in it, on Android 10 and
// later (MediaRecorder has no Opus before; there it is AAC, which Telegram sends as a voice message
// too but some of its apps play less well). Expo's recorder has no Opus at all, so the ErevosGram
// build records here. The file goes in the cache folder "tg-voice" until it is sent; what is left
// there (a recording that was not sent) goes with the next one. The microphone must be allowed.
object Voice {
  private const val BARS = 100
  private const val KEEP_MS = 24L * 60 * 60 * 1000

  private var recorder: MediaRecorder? = null
  private var file: File? = null
  private var opus = false
  private var startedAt = 0L
  private val levels = ArrayList<Int>()
  private val main = Handler(Looper.getMainLooper())

  // How loud it is, ten times a second while it records: for the waveform Telegram shows.
  private val sampling = object : Runnable {
    override fun run() {
      val r = recorder ?: return
      runCatching { levels += r.maxAmplitude }
      main.postDelayed(this, 100)
    }
  }

  @Synchronized
  fun start(context: Context): Boolean {
    if (recorder != null) return true
    val dir = File(context.cacheDir, "tg-voice").apply { mkdirs() }
    val now = System.currentTimeMillis()
    dir.listFiles()?.forEach { if (now - it.lastModified() > KEEP_MS) it.delete() }
    opus = Build.VERSION.SDK_INT >= 29
    val out = File(dir, "voice-${System.nanoTime()}.${if (opus) "ogg" else "m4a"}")
    val r = if (Build.VERSION.SDK_INT >= 31) MediaRecorder(context) else @Suppress("DEPRECATION") MediaRecorder()
    return try {
      r.setAudioSource(MediaRecorder.AudioSource.MIC)
      if (opus) {
        r.setOutputFormat(MediaRecorder.OutputFormat.OGG)
        r.setAudioEncoder(MediaRecorder.AudioEncoder.OPUS)
        r.setAudioSamplingRate(48000)
        r.setAudioEncodingBitRate(32000)
      } else {
        r.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
        r.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
        r.setAudioSamplingRate(44100)
        r.setAudioEncodingBitRate(64000)
      }
      r.setAudioChannels(1)
      r.setOutputFile(out.path)
      r.prepare()
      r.start()
      recorder = r
      file = out
      levels.clear()
      startedAt = SystemClock.elapsedRealtime()
      main.postDelayed(sampling, 100)
      true
    } catch (e: Exception) {
      runCatching { r.release() }
      out.delete()
      false
    }
  }

  /**
   * Stops: the file's path, how long it is in seconds, its waveform (base64 of Telegram's 5-bit bars)
   * and whether it is Opus. Null when it failed or was shorter than a second, and then no file stays.
   */
  @Synchronized
  fun stop(): Map<String, Any>? {
    val r = recorder ?: return null
    val f = file
    val ms = SystemClock.elapsedRealtime() - startedAt
    recorder = null
    file = null
    main.removeCallbacks(sampling)
    val ok = runCatching { r.stop() }.isSuccess
    runCatching { r.release() }
    if (!ok || f == null || ms < 1000) {
      f?.delete()
      return null
    }
    return mapOf(
      "path" to f.path,
      "seconds" to ((ms + 500) / 1000).toInt(),
      "waveform" to Base64.encodeToString(waveform(levels), Base64.NO_WRAP),
      "opus" to opus,
    )
  }

  /** Lets the recording go: nothing of it stays. */
  @Synchronized
  fun cancel() {
    val r = recorder ?: return
    recorder = null
    main.removeCallbacks(sampling)
    runCatching { r.stop() }
    runCatching { r.release() }
    file?.delete()
    file = null
  }

  /** Up to 100 bars of 0–31, packed five bits each, low bits first, as Telegram's apps write them. */
  fun waveform(levels: List<Int>): ByteArray {
    if (levels.isEmpty()) return ByteArray(0)
    val count = minOf(BARS, levels.size)
    val bars = IntArray(count) { i ->
      val from = i * levels.size / count
      val to = maxOf(from + 1, (i + 1) * levels.size / count)
      levels.subList(from, to).max()
    }
    val peak = bars.max().coerceAtLeast(1)
    val out = ByteArray((count * 5 + 7) / 8)
    bars.forEachIndexed { i, level ->
      val v = (level.toLong() * 31 / peak).toInt() and 31
      val bit = i * 5
      val at = bit / 8
      val shifted = v shl (bit % 8)
      out[at] = (out[at].toInt() or (shifted and 0xFF)).toByte()
      if (shifted > 0xFF && at + 1 < out.size) out[at + 1] = (out[at + 1].toInt() or (shifted shr 8)).toByte()
    }
    return out
  }
}
