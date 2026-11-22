// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosdevice

import android.content.ContentProvider
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.database.MatrixCursor
import android.net.Uri
import android.os.Binder
import android.os.ParcelFileDescriptor
import android.os.Process
import java.io.File
import java.io.FileNotFoundException

/**
 * Moving from one edition of Erevos to another on the same phone (lib/edition-move.ts): Erevos,
 * Erevos+ and Erevos Lite are apps of their own (app.erevos, app.erevos.plus, app.erevos.lite),
 * each with its own data, signed with the same key. The one moved from makes a backup for the move
 * into files/move-out (as Backups does, sealed with a password of its own, which it keeps beside
 * it, in move.json); the one moved to reads it through this provider and restores it.
 *
 * The provider answers only an app signed with this one's key (PackageManager.checkSignatures
 * against the caller's uid): another app on the phone gets nothing, not even whether a move waits.
 * No permission of our own is declared, so a build signed with another key (F-Droid's) installs
 * beside ours without clashing; it just cannot take a move, and a backup does it instead.
 * The files are served read-only, by name; the one moved to deletes them when done.
 */
class MoveProvider : ContentProvider() {
  override fun onCreate(): Boolean = true

  private fun allowed(): Boolean {
    val app = context ?: return false
    val caller = Binder.getCallingUid()
    if (caller == Process.myUid()) return true
    return app.packageManager.checkSignatures(caller, Process.myUid()) == PackageManager.SIGNATURE_MATCH
  }

  override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor {
    if (!allowed() || mode != "r") throw SecurityException("Not for this app")
    val file = Move.outFile(context ?: throw FileNotFoundException(), uri.lastPathSegment ?: "") ?: throw FileNotFoundException()
    return ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
  }

  // The files that wait, with their sizes.
  override fun query(uri: Uri, projection: Array<out String>?, selection: String?, selectionArgs: Array<out String>?, sortOrder: String?): Cursor? {
    if (!allowed()) return null
    val cursor = MatrixCursor(arrayOf("name", "size"))
    for (file in Move.outDir(context ?: return cursor).listFiles().orEmpty()) if (file.isFile) cursor.addRow(arrayOf<Any>(file.name, file.length()))
    return cursor
  }

  // The one moved to took it all: the move's files go.
  override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int {
    if (!allowed()) return 0
    return if (Move.clear(context ?: return 0)) 1 else 0
  }

  override fun getType(uri: Uri): String = "application/octet-stream"
  override fun insert(uri: Uri, values: ContentValues?): Uri? = null
  override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<out String>?): Int = 0
}

internal object Move {
  /** The three editions' packages: the one moved from is looked for among them. */
  val PACKAGES = listOf("app.erevos", "app.erevos.plus", "app.erevos.lite")
  private val NAME = Regex("^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$")

  fun outDir(context: Context): File = File(context.filesDir, "move-out")

  /** A file of the move by its name, or null for a name that is not one (no paths) or not there. */
  fun outFile(context: Context, name: String): File? {
    if (!NAME.matches(name)) return null
    val file = File(outDir(context), name)
    return if (file.isFile) file else null
  }

  fun clear(context: Context): Boolean {
    val dir = outDir(context)
    return !dir.exists() || dir.deleteRecursively()
  }

  private fun authority(pkg: String) = "$pkg.move"

  /** Whether `pkg` is installed and signed as this app is. */
  fun sibling(context: Context, pkg: String): Boolean {
    if (pkg == context.packageName || pkg !in PACKAGES) return false
    val pm = context.packageManager
    return try {
      pm.getPackageInfo(pkg, 0)
      pm.checkSignatures(context.packageName, pkg) == PackageManager.SIGNATURE_MATCH
    } catch (_: PackageManager.NameNotFoundException) {
      false
    }
  }

  /** Whether `pkg` is installed at all, however signed. */
  fun installed(context: Context, pkg: String): Boolean = try {
    context.packageManager.getPackageInfo(pkg, 0)
    true
  } catch (_: PackageManager.NameNotFoundException) {
    false
  }

  /** Opens the edition `pkg`, when it is one of the three and installed: whether it opened. */
  fun open(context: Context, pkg: String): Boolean {
    if (pkg == context.packageName || pkg !in PACKAGES) return false
    val intent = context.packageManager.getLaunchIntentForPackage(pkg) ?: return false
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return try {
      context.startActivity(intent)
      true
    } catch (_: Exception) {
      false
    }
  }

  /** The other editions on the phone, signed as this one, whose move waits: each one's package and move.json. */
  fun sources(context: Context): List<Map<String, String>> = PACKAGES.filter { sibling(context, it) }.mapNotNull { pkg ->
    try {
      context.contentResolver.openInputStream(Uri.parse("content://${authority(pkg)}/move.json"))?.use { input ->
        val text = input.readBytes().toString(Charsets.UTF_8)
        if (text.length > 64 * 1024) null else mapOf("pkg" to pkg, "move" to text)
      }
    } catch (_: Exception) {
      // None waits there, or it is an Erevos from before moves.
      null
    }
  }

  /** Copies the move's file `name` from `pkg` to `path` (a file of this app's own): its size. */
  fun copy(context: Context, pkg: String, name: String, path: String): Long {
    if (!sibling(context, pkg) || !NAME.matches(name)) throw SecurityException("Not a move")
    val target = File(path.removePrefix("file://"))
    target.parentFile?.mkdirs()
    val input = context.contentResolver.openInputStream(Uri.parse("content://${authority(pkg)}/$name")) ?: throw FileNotFoundException(name)
    input.use { from -> target.outputStream().use { to -> return from.copyTo(to) } }
  }

  /** Tells `pkg` that its move was taken, so it deletes its files. */
  fun done(context: Context, pkg: String): Boolean {
    if (!sibling(context, pkg)) return false
    return try {
      context.contentResolver.delete(Uri.parse("content://${authority(pkg)}/all"), null, null) > 0
    } catch (_: Exception) {
      false
    }
  }
}
