// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosbiometric

import android.app.Activity
import android.app.KeyguardManager
import android.hardware.biometrics.BiometricManager
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.os.CancellationSignal
import android.os.Handler
import android.os.Looper
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import android.security.keystore.StrongBoxUnavailableException
import android.util.Base64
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.GeneralSecurityException
import java.security.KeyStore
import java.util.concurrent.Executors
import javax.crypto.AEADBadTagException
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

// Unlocking with a fingerprint or face (lock/biometric.ts), on Android 11 and later. A key in the
// Android Keystore, kept in the phone's secure hardware, seals what the app gives it with AES-GCM.
// Android uses the key only right after a strong fingerprint or face check made for that one use,
// and drops it for good when fingerprints or faces are added or removed. A new key is made each
// time unlocking is turned on. The sealed data stays with the app (lock/biometric.ts), and nothing
// leaves the phone.
//
// Where the key is in the phone's separate security chip (StrongBox), each use of it takes a while,
// and the chip lets only a few be started at once. So all of it runs on a thread of its own, never
// on the app's, nor on the one the phone's modules share; and a cipher that was started and then
// not used (the prompt closed, or only whether the key still works was asked) is let go at once
// (letGo, release): Android ends what it started only when it finds the cipher gone, and until
// then the next use of the key waits, for seconds once a few are left so.
class ErevosBiometricModule : Module() {
  private val keystore = Executors.newSingleThreadExecutor { work -> Thread(work, "erevos-biometric").apply { isDaemon = true } }
  private val main = Handler(Looper.getMainLooper())

  override fun definition() = ModuleDefinition {
    Name("ErevosBiometric")

    // Whether the phone can: Android 11 or later, with a strong fingerprint or face set up.
    Function("available") {
      val context = appContext.reactContext
      if (context == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
        false
      } else {
        val manager = context.getSystemService(BiometricManager::class.java)
        manager?.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG) == BiometricManager.BIOMETRIC_SUCCESS
      }
    }

    // "none" with no key, "invalidated" once Android has dropped it, "valid" while it works, and
    // "unknown" when that cannot be told now: while the phone itself is locked (an Erevos call
    // shows over the lock screen, and the key works only on an unlocked phone), or when the
    // Keystore did not answer. Only "none" and "invalidated" turn unlocking off here; a key that
    // stays "unknown" because it is broken is found out when it is used (open, below).
    // Starting a cipher needs no fingerprint, and tells whether the key still works; it is let go
    // at once. Asked only where the setting shows (Lock), never by the password screen, whose
    // button needs nothing of the Keystore (lock/biometric.ts biometricOffered).
    AsyncFunction("keyState") { promise: Promise ->
      keystore.execute {
        val state = keyStateNow()
        letGo()
        promise.resolve(state)
      }
    }

    // Makes a new key in place of any before it, asks for a fingerprint or face, and seals `data`
    // (base64) with it: resolves with the IV and the sealed data, both base64.
    AsyncFunction("seal") { data: String, title: String, cancel: String, promise: Promise ->
      keystore.execute {
        val cipher = try {
          Cipher.getInstance(TRANSFORMATION).apply { init(Cipher.ENCRYPT_MODE, newKey()) }
        } catch (e: Exception) {
          promise.reject("failed", e.message, e)
          letGo()
          return@execute
        }
        authenticate(cipher, title, cancel, promise) { done ->
          val sealed = done.doFinal(Base64.decode(data, Base64.NO_WRAP))
          mapOf("iv" to encode(done.iv), "data" to encode(sealed))
        }
      }
    }

    // Asks for a fingerprint or face and opens what `seal` gave: resolves with the data, base64.
    // Rejects with "invalidated" when the key is gone, Android dropped it, or it does not open what
    // was sealed, and "cancelled" when the prompt was closed. Otherwise with Android's own words:
    // "unusable" when the key could not be used on an unlocked phone (the Keystore did not answer,
    // or the key is broken in a way Android does not call invalidated), and "failed" for the rest
    // (the phone itself locked, the prompt saying no). "invalidated" turns unlocking off at once,
    // "unusable" only after a few in a row (lock/biometric.ts): a broken key never gets better.
    AsyncFunction("open") { iv: String, data: String, title: String, cancel: String, promise: Promise ->
      keystore.execute {
        val cipher = try {
          val key = storedKey()
          if (key == null) {
            promise.reject("invalidated", "No key", null)
            return@execute
          }
          Cipher.getInstance(TRANSFORMATION).apply {
            init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(TAG_BITS, Base64.decode(iv, Base64.NO_WRAP)))
          }
        } catch (e: KeyPermanentlyInvalidatedException) {
          promise.reject("invalidated", e.message, e)
          letGo()
          return@execute
        } catch (e: Exception) {
          // The phone is locked: the key works only on an unlocked phone, so this says nothing of it.
          // Unlocked: the Keystore did not answer, or the key is broken.
          promise.reject(if (phoneLocked()) "failed" else "unusable", e.message, e)
          letGo()
          return@execute
        }
        authenticate(cipher, title, cancel, promise) { done -> encode(done.doFinal(Base64.decode(data, Base64.NO_WRAP))) }
      }
    }

    // Removes the key: what it sealed can never be opened again.
    Function("forget") {
      try {
        KeyStore.getInstance(KEYSTORE).apply { load(null) }.deleteEntry(ALIAS)
      } catch (e: GeneralSecurityException) {
        // Nothing to remove.
      }
      null
    }
  }

  // Shows Android's own fingerprint and face prompt for this one use of the cipher, and resolves
  // with what `use` makes of it once the check passes.
  private fun authenticate(cipher: Cipher, title: String, cancel: String, promise: Promise, use: (Cipher) -> Any?) {
    val activity: Activity? = appContext.currentActivity
    if (activity == null) {
      promise.reject("failed", "Erevos is not showing", null)
      release(cipher)
      return
    }
    activity.runOnUiThread {
      val executor = activity.mainExecutor
      val signal = CancellationSignal()
      var settled = false
      fun settle(body: () -> Unit) {
        if (!settled) {
          settled = true
          body()
        }
      }
      val prompt = BiometricPrompt.Builder(activity)
        .setTitle(title)
        .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
        .setNegativeButton(cancel, executor) { _, _ ->
          settle { promise.reject("cancelled", "Cancelled", null) }
          release(cipher)
        }
        .build()
      val callback = object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
          settle {
            val done = result.cryptoObject?.cipher ?: cipher
            try {
              promise.resolve(use(done))
            } catch (e: AEADBadTagException) {
              // The data was not sealed by this key.
              promise.reject("invalidated", e.message, e)
            } catch (e: KeyPermanentlyInvalidatedException) {
              promise.reject("invalidated", e.message, e)
            } catch (e: Exception) {
              // The check passed and the key still did not do its work.
              promise.reject(if (phoneLocked()) "failed" else "unusable", e.message, e)
            }
          }
        }

        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
          settle {
            val cancelled = errorCode == BiometricPrompt.BIOMETRIC_ERROR_USER_CANCELED ||
              errorCode == BiometricPrompt.BIOMETRIC_ERROR_CANCELED
            promise.reject(if (cancelled) "cancelled" else "failed", errString.toString(), null)
          }
          release(cipher)
        }
      }
      try {
        prompt.authenticate(BiometricPrompt.CryptoObject(cipher), signal, executor, callback)
      } catch (e: Exception) {
        settle { promise.reject("failed", e.message, e) }
        release(cipher)
      }
    }
  }

  // Whether the key is there and still works (keyState, above). The cipher it starts is its own,
  // gone when it returns, so that letGo finds it.
  private fun keyStateNow(): String {
    val locked = phoneLocked()
    return try {
      val key = storedKey()
      when {
        key == null -> "none"
        locked -> "unknown"
        else -> {
          Cipher.getInstance(TRANSFORMATION).init(Cipher.ENCRYPT_MODE, key)
          "valid"
        }
      }
    } catch (e: KeyPermanentlyInvalidatedException) {
      "invalidated"
    } catch (e: Exception) {
      // The Keystore did not answer, in whatever way: the one who asked still gets an answer.
      "unknown"
    }
  }

  // A cipher started and not used keeps what it started in the Keystore until Android finds the
  // cipher itself gone, which it looks for only now and then. Asked to look now: nothing else ends
  // it, as a cipher cannot be told to stop.
  @Suppress("DEPRECATION")
  private fun letGo() {
    runCatching {
      Runtime.getRuntime().gc()
      System.runFinalization()
    }
  }

  // A cipher whose prompt closed with nothing opened. Android's prompt keeps hold of the cipher for
  // as long as the phone's own side keeps the prompt, which can be long, so waiting for the cipher
  // to be gone is not enough. It is given another key first, one that is not in the Keystore: with
  // that it puts down what it had started there, which is then let go. A little later, so that
  // the prompt closes smoothly; the next use of the key does not wait for it.
  private fun release(cipher: Cipher) {
    main.postDelayed({
      keystore.execute {
        runCatching { cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(ByteArray(KEY_BYTES), KeyProperties.KEY_ALGORITHM_AES)) }
        letGo()
      }
    }, LET_GO_AFTER_MS)
  }

  // Whether the phone itself is locked now: the key works only on an unlocked phone.
  private fun phoneLocked(): Boolean =
    appContext.reactContext?.getSystemService(KeyguardManager::class.java)?.isDeviceLocked == true

  private fun storedKey(): SecretKey? {
    val store = KeyStore.getInstance(KEYSTORE).apply { load(null) }
    return store.getKey(ALIAS, null) as? SecretKey
  }

  // A 256-bit AES key that only a strong fingerprint or face check opens, for each single use,
  // only while the phone itself is unlocked, and that Android drops when fingerprints or faces
  // change. In the phone's separate security chip where it has one (StrongBox), else in its
  // secure area.
  private fun newKey(): SecretKey {
    fun spec(strongBox: Boolean) = KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
      .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
      .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
      .setKeySize(256)
      .setUserAuthenticationRequired(true)
      .setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG)
      .setInvalidatedByBiometricEnrollment(true)
      .setUnlockedDeviceRequired(true)
      .setIsStrongBoxBacked(strongBox)
      .build()
    val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE)
    return try {
      generator.init(spec(true))
      generator.generateKey()
    } catch (e: StrongBoxUnavailableException) {
      generator.init(spec(false))
      generator.generateKey()
    }
  }

  private fun encode(bytes: ByteArray): String = Base64.encodeToString(bytes, Base64.NO_WRAP)

  private companion object {
    const val KEYSTORE = "AndroidKeyStore"
    const val ALIAS = "erevos.biometric"
    const val TRANSFORMATION = "AES/GCM/NoPadding"
    const val TAG_BITS = 128
    const val KEY_BYTES = 32
    const val LET_GO_AFTER_MS = 600L
  }
}
