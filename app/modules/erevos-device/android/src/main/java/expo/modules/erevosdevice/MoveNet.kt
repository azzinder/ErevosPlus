// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosdevice

import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.os.ParcelFileDescriptor
import android.os.Process
import android.os.SystemClock
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileNotFoundException
import java.io.FileOutputStream
import java.io.IOException
import java.security.KeyStore
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import kotlin.concurrent.thread

/**
 * What a move carries beside its backup (lib/edition-move.ts): the folders an edition's own engines
 * keep outside it, which no backup holds, so that the edition moved to goes on with the same
 * accounts and signs in to nothing again. Which ones, each module of the edition says in its
 * manifest, as meta-data named erevos.move.carry.<module>: entries split by «;», each
 * `files:<path>` (under the app's files) or `nobackup:<path>` (under its no-backup files), a «*»
 * for any one name in it; or `sealed:<alias>:files:<path>`, one file sealed with the Keystore key
 * `alias` (AES-GCM, its 12-byte nonce first), which only this app on this phone opens: it goes
 * opened, and the edition moved to seals it again with a key of its own. An edition that says none
 * carries nothing.
 *
 * Nothing waits on the phone for it: MoveProvider streams it (move-net) to the edition moved to,
 * which alone may ask, as for the move's files; only once this app moved out (moved-out.json), and
 * only from a process started after that, in which none of its engines ran, so every file is whole
 * and none of them changes as it goes. An older process is ended instead, and asked again. The edition
 * moved to writes it beside its own (move-net-in), only where its own manifest says it carries the
 * same, and puts it in place once the backup was restored, before any engine of its own opened: at
 * once when none did in this process yet, else at its next start (or as lib/edition-move.ts
 * placeCarried asks again). The edition moved from is told the move was taken as the backup restored:
 * all of it is here by then. The stream ends with `end`, so a
 * cut one is never put in place.
 */
internal object MoveNet {
  const val NAME = "move-net"
  private const val META = "erevos.move.carry."
  private const val IN = "move-net-in"
  private const val READY = "ready"
  private const val END = "end"
  // A name in a carry: plain, as the module wrote it.
  private val PART = Regex("^(\\*|[A-Za-z0-9][A-Za-z0-9._-]{0,120})$")

  /** One carry: `root` f (files) or n (no-backup files), its path, and the Keystore alias of a sealed file. */
  data class Carry(val root: String, val path: List<String>, val alias: String?)

  fun carries(context: Context): List<Carry> {
    val meta = try {
      context.packageManager.getApplicationInfo(context.packageName, PackageManager.GET_META_DATA).metaData
    } catch (_: Exception) {
      null
    } ?: return emptyList()
    return meta.keySet().filter { it.startsWith(META) }.sorted().flatMap { key ->
      meta.getString(key).orEmpty().split(';').mapNotNull { parse(it.trim()) }
    }
  }

  fun parse(spec: String): Carry? {
    var rest = spec
    var alias: String? = null
    if (rest.startsWith("sealed:")) {
      val after = rest.removePrefix("sealed:")
      val i = after.indexOf(':')
      if (i <= 0) return null
      alias = after.substring(0, i)
      rest = after.substring(i + 1)
    }
    val root = when {
      rest.startsWith("files:") -> "f"
      rest.startsWith("nobackup:") -> "n"
      else -> return null
    }
    val path = rest.substringAfter(':').split('/')
    if (path.isEmpty() || !path.all { PART.matches(it) }) return null
    if (alias != null && "*" in path) return null
    return Carry(root, path, alias)
  }

  private fun base(context: Context, root: String): File = if (root == "f") context.filesDir else context.noBackupFilesDir

  // A name of a file in a carried folder: anything a folder may hold but a way out of it.
  private fun fileName(name: String) = name.isNotEmpty() && name != "." && name != ".." && name.length <= 255 && name.none { it == '/' || it == '\\' || it == '\u0000' }

  // The paths `carry` names under `base`, its «*» each matched with what is there.
  private fun expand(base: File, carry: Carry): List<List<String>> {
    var found = listOf(emptyList<String>())
    for (part in carry.path) {
      found = found.flatMap { at ->
        if (part != "*") listOf(at + part)
        else File(base, at.joinToString("/")).listFiles().orEmpty().map { it.name }.filter { PART.matches(it) && it != "*" }.sorted().map { at + it }
      }
    }
    return found.filter { File(base, it.joinToString("/")).exists() }
  }

  // Whether `path` is `carry`'s, or within it.
  private fun under(path: List<String>, carry: Carry): Boolean =
    path.size >= carry.path.size && carry.path.indices.all { carry.path[it] == "*" || carry.path[it] == path[it] }

  private fun sealedAt(carries: List<Carry>, root: String, path: List<String>): Carry? =
    carries.firstOrNull { it.alias != null && it.root == root && it.path == path }

  /** The bytes this app carries in a move: an estimate for the room the edition moved to needs. */
  fun size(context: Context): Long {
    var size = 0L
    for (carry in carries(context)) {
      if (carry.alias != null) continue
      val base = base(context, carry.root)
      for (path in expand(base, carry)) size += File(base, path.joinToString("/")).walkTopDown().filter { it.isFile }.sumOf { it.length() }
    }
    return size
  }

  // --- The edition moved from: MoveProvider's move-net. ---

  private fun processStarted(): Long = System.currentTimeMillis() - (SystemClock.elapsedRealtime() - Process.getStartElapsedRealtime())

  /** The stream of what this app carries, for the edition moved to (MoveProvider). */
  fun open(context: Context): ParcelFileDescriptor {
    val moved = File(context.filesDir, "moved-out.json")
    if (!moved.isFile || !File(Move.outDir(context), "move.json").isFile) throw FileNotFoundException("No move")
    // This process ran before the move: its engines may be open. It ends, and the next ask starts one anew.
    if (processStarted() <= moved.lastModified() + 1000) {
      Handler(Looper.getMainLooper()).postDelayed({ Process.killProcess(Process.myPid()) }, 300)
      throw FileNotFoundException("Busy")
    }
    val (read, write) = ParcelFileDescriptor.createReliablePipe()
    thread(name = "erevos-move-net") {
      try {
        val zip = ZipOutputStream(BufferedOutputStream(FileOutputStream(write.fileDescriptor), 1 shl 16))
        zip.setLevel(1)
        write(context, zip)
        zip.putNextEntry(ZipEntry(END))
        zip.closeEntry()
        zip.finish()
        zip.flush()
        write.close()
      } catch (e: Exception) {
        runCatching { write.closeWithError(e.message ?: "The move could not be read") }
      }
    }
    return read
  }

  private fun write(context: Context, zip: ZipOutputStream) {
    val carries = carries(context)
    for (carry in carries) {
      val base = base(context, carry.root)
      if (carry.alias != null) {
        val file = File(base, carry.path.joinToString("/"))
        if (!file.isFile) continue
        // Opened here: should it not open, nothing goes, rather than an account without its key.
        val plain = Sealing.open(carry.alias, file.readBytes())
        zip.putNextEntry(ZipEntry("s/${carry.root}/${carry.path.joinToString("/")}"))
        zip.write(plain)
        zip.closeEntry()
        plain.fill(0)
        continue
      }
      for (path in expand(base, carry)) {
        val top = File(base, path.joinToString("/"))
        for (file in top.walkTopDown().filter { it.isFile }) {
          val rel = path + file.relativeTo(top).invariantSeparatorsPath.split('/').filter { it.isNotEmpty() }
          if (!rel.all(::fileName) || sealedAt(carries, carry.root, rel) != null) continue
          zip.putNextEntry(ZipEntry("p/${carry.root}/${rel.joinToString("/")}"))
          BufferedInputStream(FileInputStream(file)).use { it.copyTo(zip) }
          zip.closeEntry()
        }
      }
    }
  }

  // --- The edition moved to. ---

  private fun staging(context: Context) = File(context.filesDir, IN)

  /**
   * Takes what `pkg` carries into move-net-in, sealed files sealed again with this app's own keys:
   * its bytes. Nothing of it is in place yet (place). Throws, with nothing kept, should any of it
   * not come whole.
   */
  fun take(context: Context, pkg: String, authority: String): Long {
    val carries = carries(context)
    val dir = staging(context)
    dir.deleteRecursively()
    if (carries.isEmpty()) return 0
    dir.mkdirs()
    try {
      var pfd: ParcelFileDescriptor? = null
      for (attempt in 0 until 10) {
        pfd = try {
          context.contentResolver.openFileDescriptor(Uri.parse("content://$authority/$NAME"), "r")
        } catch (e: FileNotFoundException) {
          if (attempt == 9) throw e
          Thread.sleep(800)
          null
        }
        if (pfd != null) break
      }
      val fd = pfd ?: throw FileNotFoundException(NAME)
      var size = 0L
      var ended = false
      fd.use {
        ZipInputStream(BufferedInputStream(FileInputStream(fd.fileDescriptor), 1 shl 16)).let { zip ->
          while (true) {
            val entry = zip.nextEntry ?: break
            if (ended) throw IOException("The move goes on after its end")
            if (entry.name == END) {
              ended = true
              continue
            }
            val parts = entry.name.split('/')
            if (parts.size < 3 || (parts[0] != "p" && parts[0] != "s") || (parts[1] != "f" && parts[1] != "n")) throw IOException("Not of a move: ${entry.name}")
            val root = parts[1]
            val path = parts.drop(2)
            if (entry.isDirectory || !path.all(::fileName)) throw IOException("Not of a move: ${entry.name}")
            val sealed = sealedAt(carries, root, path)
            // Only where this app carries the same: nothing anywhere else of its own.
            if (parts[0] == "s" && sealed == null) throw IOException("Not carried here: ${entry.name}")
            if (parts[0] == "p" && (sealed != null || carries.none { it.alias == null && it.root == root && under(path, it) })) throw IOException("Not carried here: ${entry.name}")
            val target = File(File(dir, root), path.joinToString("/"))
            target.parentFile?.mkdirs()
            if (sealed != null) {
              val plain = zip.readBytes()
              target.writeBytes(Sealing.seal(sealed.alias!!, plain))
              size += plain.size
              plain.fill(0)
            } else {
              FileOutputStream(target).use { out -> size += zip.copyTo(out) }
            }
          }
        }
        // Ended with an error on the other side (a file that would not read): nothing is kept.
        fd.checkError()
      }
      if (!ended) throw IOException("The move was cut short")
      File(dir, READY).writeText("1")
      return size
    } catch (e: Exception) {
      dir.deleteRecursively()
      throw e
    }
  }

  /** Deletes what a move carried and did not put in place (its backup did not restore). */
  fun drop(context: Context): Boolean = staging(context).let { !it.exists() || it.deleteRecursively() }

  /** Whether what a move carried waits to be put in place. */
  fun pending(context: Context): Boolean = File(staging(context), READY).isFile

  /**
   * Puts in place what a move carried (take), unless an engine of this app is open in this process
   * (`busy`): then at the next start (ErevosDeviceModule's OnCreate). Whether it is in place now.
   */
  fun place(context: Context, busy: Boolean = engineOpen()): Boolean {
    val dir = staging(context)
    if (!dir.isDirectory) return true
    if (!File(dir, READY).isFile) {
      // From a move that did not end: none of it is used.
      dir.deleteRecursively()
      return true
    }
    if (busy) return false
    val carries = carries(context)
    // Each folder carried, then each sealed file not within one, in the place of this app's own.
    val tops = carries.filter { it.alias == null } +
      carries.filter { s -> s.alias != null && carries.none { d -> d.alias == null && d.root == s.root && under(s.path, d) } }
    for (carry in tops) {
      val from = File(dir, carry.root)
      for (path in expand(from, carry)) {
        val source = File(from, path.joinToString("/"))
        val target = File(base(context, carry.root), path.joinToString("/"))
        if (target.exists() && !target.deleteRecursively()) throw IOException("Could not replace ${path.joinToString("/")}")
        target.parentFile?.mkdirs()
        if (!source.renameTo(target)) {
          source.copyRecursively(target, overwrite = true)
          source.deleteRecursively()
        }
      }
    }
    dir.deleteRecursively()
    return true
  }

  /** Whether an engine of this app opened in this process (the modules say so: engineOpened). */
  fun engineOpen(): Boolean = System.getProperty(ENGINE) == "1"

  /** Said by a module as it opens an engine whose files a move carries. */
  const val ENGINE = "erevos.move.engine-open"

  /** Whether an engine may open now: not while this app moved out, nor while a move's carry waits to be put in place. */
  fun mayOpen(context: Context): Boolean = !File(context.filesDir, "moved-out.json").exists() && !pending(context)
}

/** The Keystore's sealing as the engines' own (KeyWrap): AES-256-GCM, the 12-byte nonce first. */
internal object Sealing {
  private fun key(alias: String, make: Boolean): SecretKey {
    val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    (ks.getKey(alias, null) as SecretKey?)?.let { return it }
    if (!make) throw IOException("No key $alias")
    val gen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
    gen.init(
      KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setKeySize(256)
        .build(),
    )
    return gen.generateKey()
  }

  fun open(alias: String, blob: ByteArray): ByteArray {
    val c = Cipher.getInstance("AES/GCM/NoPadding")
    c.init(Cipher.DECRYPT_MODE, key(alias, false), GCMParameterSpec(128, blob, 0, 12))
    return c.doFinal(blob, 12, blob.size - 12)
  }

  fun seal(alias: String, plain: ByteArray): ByteArray {
    val c = Cipher.getInstance("AES/GCM/NoPadding")
    c.init(Cipher.ENCRYPT_MODE, key(alias, true))
    return c.iv + c.doFinal(plain)
  }
}
