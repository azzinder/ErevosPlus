// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevoscollection

import android.app.Activity
import android.content.Context
import android.content.IntentSender
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.DocumentsContract
import android.provider.MediaStore
import android.util.Base64
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.IOException
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean

// What the Collection (lock/collection-data.ts) asks of Android itself, reading its files where
// they lie, encrypted (SealedFile.kt), never from a plain copy:
// - opening a file with another app through a link that streams it (CollectionProvider.kt);
// - showing a PDF a page at a time from a memory file (PdfPages.kt);
// - playing music and videos with Media3, the list going on with the screen off (Playing.kt,
//   PlayerService.kt), and the video shown in a view of its own (VideoView.kt);
// - asking Android to delete a photo or video from the phone's gallery once it is in the
//   Collection, which Android has the owner confirm (Android 11 and later);
// - bringing a picked file in, encrypted into chunks as it is read from Android's link, with no
//   plain copy in the cache first (Sealer.kt);
// - a photo or file another app shared, encrypted the same way as it came (ShareActivity.kt,
//   SharedIn.kt), handed to Send to, which keeps it in the Collection or sends it to a chat.
// A file comes from JavaScript as the catalogue keeps it: its id, its key in hex, its chunk size,
// how many chunks and its size. JavaScript's string of the key cannot be zeroed; the bytes made
// from it here are kept only as long as the file is open, and zeroed then.
class ErevosCollectionModule : Module() {
  private val main = Handler(Looper.getMainLooper())

  private val context: Context?
    get() = appContext.reactContext

  // The gallery's delete waiting for the owner's answer in Android's dialog.
  private var deleting: Promise? = null

  // The files being encrypted now (sealFromUri), by job, each with its cancel.
  private val sealing = ConcurrentHashMap<String, AtomicBoolean>()

  // The space locks a while after Erevos leaves the screen (app/_layout.tsx): then what it opened
  // here goes, even if JavaScript does not run then.
  private val lockLater = Runnable { lockNow() }

  private fun lockNow() {
    OpenFiles.forgetAll()
    PdfPages.closeAll()
    Playing.onMain { Playing.locked(context) }
  }

  override fun definition() = ModuleDefinition {
    Name("ErevosCollection")

    // The player's state as it changes (Playing.state): never a file's name. And how far a file
    // being encrypted has come (sealFromUri).
    Events("onPlayer", "onSeal")

    OnCreate {
      Playing.onState = { state -> runCatching { sendEvent("onPlayer", state) } }
    }

    OnDestroy {
      Playing.onState = null
      main.removeCallbacks(lockLater)
    }

    // The owner's answer to Android's dialog: whether the gallery's originals were deleted.
    OnActivityResult { _, payload ->
      if (payload.requestCode != DELETE_REQUEST) return@OnActivityResult
      val promise = deleting ?: return@OnActivityResult
      deleting = null
      promise.resolve(if (payload.resultCode == Activity.RESULT_OK) "deleted" else "kept")
    }

    // A link another app can open the file by, streamed as it is decrypted, and its token, to
    // forget it. The link is the app's package and ".collection", the token, and the file's name.
    Function("openWith") { file: Map<String, Any?>, name: String, mime: String ->
      val app = context ?: throw IllegalStateException("No app")
      val (token, uri) = OpenFiles.add(app.packageName, sealed(file), name, mime)
      mapOf("token" to token, "uri" to uri.toString())
    }

    // The same for a chat's file, its bytes given here (base64) and held in memory only, until the
    // link is forgotten, the space locks or closes, or the panic button: nothing is written plain.
    Function("openBytesWith") { data: String, name: String, mime: String ->
      val app = context ?: throw IllegalStateException("No app")
      val bytes = Base64.decode(data, Base64.NO_WRAP)
      val (token, uri) = OpenFiles.addBytes(app.packageName, bytes, name, mime)
      mapOf("token" to token, "uri" to uri.toString())
    }

    // Forgets one link: the other app can no longer read it.
    Function("forget") { token: String ->
      OpenFiles.forget(token)
    }

    // Forgets every link and closes every PDF: the Collection's screen closed.
    Function("forgetAll") {
      OpenFiles.forgetAll()
      PdfPages.closeAll()
    }

    // The space locked or closed: what forgetAll forgets, and the list playing stops only when
    // the owner chose so.
    Function("locked") {
      main.removeCallbacks(lockLater)
      lockNow()
    }

    // The space locks in `ms` unless Erevos shows again first (-1): what `locked` does happens then.
    Function("lockAfter") { ms: Double ->
      main.removeCallbacks(lockLater)
      if (ms >= 0) main.postDelayed(lockLater, ms.toLong())
    }

    // The panic button: everything stops and every key here goes, at once.
    Function("panic") {
      main.removeCallbacks(lockLater)
      OpenFiles.forgetAll()
      PdfPages.closeAll()
      Playing.onMain { Playing.panic(context) }
      // A file being brought in stops, and what it wrote goes; so does a file shared, waiting.
      for (cancel in sealing.values) cancel.set(true)
      context?.let { SharedIn.panic(it) }
    }

    // Whether a PDF can be shown here: Android 11 and later, which have memory files.
    Function("pdfAvailable") { PdfPages.available }

    // Opens a PDF: a handle to its pages and how many there are.
    AsyncFunction("pdfOpen") { file: Map<String, Any?> ->
      val app = context ?: throw IllegalStateException("No app")
      // Its key goes as soon as the PDF is in its memory file.
      val sealed = sealed(file)
      try {
        val (handle, pages) = PdfPages.open(sealed, app.filesDir)
        mapOf("handle" to handle, "pages" to pages)
      } finally {
        sealed.close()
      }
    }

    // One page as a picture `width` pixels wide: base64 PNG, or JPEG ("jpeg"), and its size.
    AsyncFunction("pdfPage") { handle: String, index: Int, width: Int, format: String ->
      PdfPages.page(handle, index, width, format)
    }

    Function("pdfClose") { handle: String ->
      PdfPages.close(handle)
    }

    // Whether a station or a channel plays through Tor here (`tor` in playList, TorHttpDataSource.kt).
    Function("canPlayThroughTor") { TorHttpDataSource.available() }

    // Plays the list from `start`: each item a file as above with its name, type and whether it
    // is a video. `showTitle`: the notice shows the file's name, else `neutral`. `stopOnLock`:
    // the list stops when the space locks. `stopLabel`: the word on the notice's Stop.
    AsyncFunction("playList") { list: List<Map<String, Any?>>, start: Int, options: Map<String, Any?> ->
      val app = context ?: throw IllegalStateException("No app")
      val items = mutableListOf<Playing.Item>()
      try {
        for (entry in list) {
          val name = entry["name"] as? String ?: ""
          val mime = entry["mime"] as? String ?: ""
          // An internet radio station, or a TV channel (`video`): only by an https link
          // (lib/collection-radio.ts, lib/collection-tv.ts).
          val url = entry["url"] as? String
          if (url != null) {
            val link = Uri.parse(url)
            if (link.scheme != "https" || link.host.isNullOrEmpty() || link.userInfo != null || url.length > 2048) throw IllegalArgumentException("Only https links")
            // Play through Tor: only through it, or not at all.
            val tor = entry["tor"] == true
            if (tor && !TorHttpDataSource.available()) throw IllegalStateException("This build of Erevos has no Tor")
            items += Playing.Item(null, name, mime, entry["video"] == true, url = url, tor = tor)
            continue
          }
          val resume = (entry["resume"] as? Number)?.toLong() ?: 0L
          // A video's subtitles (an .srt or .vtt file of the Collection), as a file above with its type.
          @Suppress("UNCHECKED_CAST")
          val given = entry["subtitles"] as? Map<String, Any?>
          val file = sealed(entry)
          val subtitles = try {
            given?.let { sealed(it) }
          } catch (e: Exception) {
            file.close()
            throw e
          }
          items += Playing.Item(file, name, mime, entry["video"] == true, resume, subtitles, given?.get("mime") as? String ?: "")
        }
      } catch (e: Exception) {
        for (item in items) {
          item.file?.close()
          item.subtitles?.close()
        }
        throw e
      }
      Playing.stopOnLock = options["stopOnLock"] == true
      Playing.stopLabel = options["stopLabel"] as? String ?: ""
      Playing.play(app, items, start, options["showTitle"] == true, options["neutral"] as? String ?: "")
      Playing.state()
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("pause") { Playing.pause() }.runOnQueue(Queues.MAIN)
    AsyncFunction("resume") { Playing.resume() }.runOnQueue(Queues.MAIN)
    AsyncFunction("next") { Playing.next() }.runOnQueue(Queues.MAIN)
    AsyncFunction("previous") { Playing.previous() }.runOnQueue(Queues.MAIN)

    // To `index` in the list (-1 for the one playing), `ms` from its start.
    AsyncFunction("seek") { index: Int, ms: Double -> Playing.seek(index, ms.toLong()) }.runOnQueue(Queues.MAIN)

    AsyncFunction("stop") { Playing.stop(context) }.runOnQueue(Queues.MAIN)

    // Whether the player stops when the space locks, changed while a list plays.
    Function("setStopOnLock") { on: Boolean -> Playing.stopOnLock = on }

    AsyncFunction("playerState") { Playing.state() }.runOnQueue(Queues.MAIN)

    // The player's screen: the list in an order of its own, repeated ("off", "all", "one"), and
    // how fast it plays (0.5 to 2).
    AsyncFunction("setShuffle") { on: Boolean -> Playing.setShuffle(on) }.runOnQueue(Queues.MAIN)
    AsyncFunction("setRepeat") { mode: String -> Playing.setRepeat(mode) }.runOnQueue(Queues.MAIN)
    AsyncFunction("setSpeed") { speed: Double -> Playing.setSpeed(speed.toFloat()) }.runOnQueue(Queues.MAIN)

    // A video's subtitles shown, or not.
    AsyncFunction("setSubtitles") { on: Boolean -> Playing.setSubtitles(on) }.runOnQueue(Queues.MAIN)

    // Where the files of the list got to since last asked, by their place in it, to keep sealed in
    // the catalogue (lib/collection-play.ts): taken, they are forgotten here.
    AsyncFunction("takePositions") { Playing.takePositions() }.runOnQueue(Queues.MAIN)

    // The cover inside the file playing, base64, or null, for the player's screen inside Erevos.
    AsyncFunction("playerArtwork") { Playing.artwork() }.runOnQueue(Queues.MAIN)

    // Whether Android can delete a photo or video from the gallery for Erevos: Android 11 and later.
    Function("canDeleteFromGallery") { Build.VERSION.SDK_INT >= Build.VERSION_CODES.R }

    // Asks Android to delete from the gallery the photos and videos picked by these links, once
    // they are in the Collection; Android shows its own dialog, where the owner confirms.
    // "deleted", "kept" (the owner said no), "none" (no link is the gallery's own), or
    // "unavailable" (Android before 11).
    AsyncFunction("deleteFromGallery") { uris: List<String>, promise: Promise ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
        promise.resolve("unavailable")
        return@AsyncFunction
      }
      val app = context ?: throw IllegalStateException("No app")
      val activity = appContext.currentActivity ?: throw IllegalStateException("No activity")
      if (deleting != null) throw IllegalStateException("A delete is being asked already")
      val media = uris.mapNotNull { galleryUri(app, Uri.parse(it)) }.distinct()
      if (media.isEmpty()) {
        promise.resolve("none")
        return@AsyncFunction
      }
      val request = MediaStore.createDeleteRequest(app.contentResolver, media)
      deleting = promise
      try {
        activity.startIntentSenderForResult(request.intentSender, DELETE_REQUEST, null, 0, 0, 0)
      } catch (e: IntentSender.SendIntentException) {
        deleting = null
        promise.reject("ERR_GALLERY", e.message, e)
      }
    }.runOnQueue(Queues.MAIN)

    // Encrypts the file a link names (a content:// link the file picker gave) into the
    // Collection's chunks as it is read, with no plain copy (Sealer.kt), on a thread of its own, as
    // a file can take minutes. `expected` is the size the picker said, only for the progress, told
    // as "onSeal" events with `job`. Resolves with the file as the catalogue keeps it: its id, its
    // key in hex, its chunk size, how many chunks and its size; the key's bytes are zeroed here
    // then. Rejects ERR_CANCELLED (sealCancel), ERR_TOO_LARGE or ERR_SEAL, with nothing left.
    AsyncFunction("sealFromUri") { uri: String, expected: Double, job: String, promise: Promise ->
      val app = context ?: throw IllegalStateException("No app")
      val link = Uri.parse(uri)
      if (link.scheme != "content") throw IllegalArgumentException("Only a content link")
      val cancel = AtomicBoolean(false)
      if (sealing.putIfAbsent(job, cancel) != null) throw IllegalStateException("That job runs already")
      Thread({
        try {
          val input = app.contentResolver.openInputStream(link) ?: throw IOException("Cannot read the file")
          var told = 0L
          val sealed = input.use {
            Sealer(app.filesDir).seal(it, expected.toLong(), { done, count ->
              val now = System.currentTimeMillis()
              if (now - told >= PROGRESS_EVERY_MS || done == count) {
                told = now
                runCatching { sendEvent("onSeal", mapOf("job" to job, "done" to done, "count" to count)) }
              }
            }, { cancel.get() })
          }
          val key = Sealer.handOver(sealed.key)
          promise.resolve(mapOf("id" to sealed.id, "key" to key, "chunk" to sealed.chunk, "count" to sealed.count, "size" to sealed.size.toDouble()))
        } catch (e: Sealer.Cancelled) {
          promise.reject("ERR_CANCELLED", "Cancelled", e)
        } catch (e: Sealer.TooLarge) {
          promise.reject("ERR_TOO_LARGE", e.message, e)
        } catch (e: Throwable) {
          promise.reject("ERR_SEAL", e.message ?: "The file could not be read", e)
        } finally {
          sealing.remove(job)
        }
      }, "erevos-collection-seal").start()
    }

    // Stops a sealFromUri before its next chunk; what it wrote is deleted.
    Function("sealCancel") { job: String -> sealing[job]?.set(true) }

    // The first `length` bytes of the file a content:// link names (1 MiB at most), base64: enough
    // of a photo's header to tell its size (lib/photo.ts photoSize), without reading the rest.
    AsyncFunction("readHead") { uri: String, length: Int ->
      val app = context ?: throw IllegalStateException("No app")
      val link = Uri.parse(uri)
      if (link.scheme != "content") throw IllegalArgumentException("Only a content link")
      val buffer = ByteArray(length.coerceIn(0, MOST_HEAD))
      var at = 0
      app.contentResolver.openInputStream(link)?.use { input ->
        while (at < buffer.size) {
          val got = input.read(buffer, at, buffer.size - at)
          if (got < 0) break
          at += got
        }
      } ?: throw IOException("Cannot read the file")
      Base64.encodeToString(buffer.copyOf(at), Base64.NO_WRAP)
    }

    // The photo or file another app shared, waiting encrypted (SharedIn.kt), by the id its link
    // gave: as the catalogue keeps a file (its key in hex), with a photo's size as it shows and its
    // small picture (base64 JPEG, "" if none); null when it is not the one waiting.
    Function("sharedFile") { id: String ->
      SharedIn.get(id)?.let { file ->
        mapOf(
          "id" to file.id,
          "key" to file.key.joinToString("") { "%02x".format(it) },
          "chunk" to file.chunk,
          "count" to file.count,
          "size" to file.size.toDouble(),
          "w" to file.w,
          "h" to file.h,
          "thumb" to (file.thumb?.let { Base64.encodeToString(it, Base64.NO_WRAP) } ?: ""),
        )
      }
    }

    // The Collection takes the shared file's chunks as its own: its key here goes, the chunks stay.
    Function("sharedKeep") { id: String ->
      context?.let { SharedIn.keep(it, id) }
    }

    // The shared file was sent, or left: its chunks and key go.
    Function("sharedDrop") { id: String ->
      context?.let { SharedIn.drop(it, id) }
    }

    // The words Send to's encrypting screen shows (ShareActivity.kt), in the language Erevos is in:
    // kept on the phone, as that screen shows before any space is open. Words only, nothing secret.
    Function("setShareTexts") { texts: Map<String, String> ->
      context?.let { ShareActivity.keepTexts(it, texts) }
    }

    // The video of the list playing (VideoView.kt).
    View(VideoView::class) {}
  }

  // A file as JavaScript gives it: checked, with its key copied into bytes of its own.
  private fun sealed(file: Map<String, Any?>): SealedFile {
    val id = file["id"] as? String ?: throw IllegalArgumentException("No id")
    val key = file["key"] as? String ?: throw IllegalArgumentException("No key")
    val chunk = (file["chunk"] as? Number)?.toInt() ?: throw IllegalArgumentException("No chunk size")
    val count = (file["count"] as? Number)?.toInt() ?: throw IllegalArgumentException("No count")
    val size = (file["size"] as? Number)?.toLong() ?: throw IllegalArgumentException("No size")
    return SealedFile.of(id, key, chunk, count, size)
  }

  // The gallery's own link for a picked photo or video: a MediaStore link as it is, or the
  // MediaStore link of a document the file picker gave (Android 10 and later); null for anything
  // else, which is not deleted.
  // The gallery's own link for a file picked by `uri`, or null when the gallery does not have it.
  // The file picker gives links of several kinds: the gallery's own (media/.../images/media/7), a
  // document of Images or of the phone's storage (mapped by MediaStore.getMediaUri, to the images,
  // video or files table), or one of the photo picker (media/picker/..., media/picker_get_content/...),
  // which cannot be deleted itself: its photo is found in the gallery by its id, and taken only when
  // its name and size there are the same as the picked file's, so no other photo is ever asked for.
  private fun galleryUri(context: Context, uri: Uri): Uri? {
    val media = when {
      uri.authority == MediaStore.AUTHORITY -> uri
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && DocumentsContract.isDocumentUri(context, uri) ->
        runCatching { MediaStore.getMediaUri(context, uri) }.getOrNull()
      else -> null
    } ?: return null
    if (media.authority != MediaStore.AUTHORITY) return null
    val path = media.pathSegments
    val first = path.firstOrNull() ?: return null
    if (first.startsWith("picker")) return pickedInGallery(context, media)
    return if (path.contains("images") || path.contains("video") || path.contains("file")) media else null
  }

  // The photo picker's photo, as the gallery has it: only one on this phone (its own provider), by
  // the id at the link's end, and only when the gallery's name and size match the picked one's.
  private fun pickedInGallery(context: Context, picked: Uri): Uri? {
    if (!picked.pathSegments.contains("com.android.providers.media.photopicker")) return null
    val id = picked.lastPathSegment?.toLongOrNull() ?: return null
    val resolver = context.contentResolver
    val columns = arrayOf(MediaStore.MediaColumns.DISPLAY_NAME, MediaStore.MediaColumns.SIZE)
    fun nameAndSize(link: Uri): Pair<String?, Long>? =
      runCatching {
        resolver.query(link, columns, null, null, null)?.use { row ->
          if (row.moveToFirst()) Pair(row.getString(0), row.getLong(1)) else null
        }
      }.getOrNull()
    val shown = nameAndSize(picked) ?: return null
    val gallery = MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL, id)
    val there = nameAndSize(gallery) ?: return null
    return if (shown.first != null && shown == there) gallery else null
  }

  companion object {
    private const val DELETE_REQUEST = 0x4572
    private const val PROGRESS_EVERY_MS = 100L
    private const val MOST_HEAD = 1024 * 1024
  }
}
