// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevoscore

import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

// The Erevos core (Rust, crates/erevos-ffi in the repository) for JavaScript. Every call runs
// off the JavaScript thread, as the post-quantum key exchange takes a moment on a phone. A
// failing call rejects its promise with the core's message.
class ErevosCoreModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ErevosCore")

    AsyncFunction("accountNew") { ErevosCoreNative.accountNew() }
    AsyncFunction("accountBundle") { account: ByteArray -> ErevosCoreNative.accountBundle(account) }
    AsyncFunction("accountIdentity") { account: ByteArray -> ErevosCoreNative.accountIdentity(account) }
    AsyncFunction("bundleIdentity") { bundle: ByteArray -> ErevosCoreNative.bundleIdentity(bundle) }
    AsyncFunction("accountSign") { account: ByteArray, context: ByteArray, message: ByteArray ->
      ErevosCoreNative.accountSign(account, context, message)
    }
    AsyncFunction("bundleVerify") { bundle: ByteArray, context: ByteArray, message: ByteArray, signature: ByteArray ->
      ErevosCoreNative.bundleVerify(bundle, context, message, signature)
    }
    AsyncFunction("accountBind") { account: ByteArray ->
      ErevosCoreNative.accountBind(account)
    }
    AsyncFunction("bundleBound") { bundle: ByteArray, signature: ByteArray ->
      ErevosCoreNative.bundleBound(bundle, signature)
    }
    AsyncFunction("couponBlind") { spki: ByteArray, nonce: ByteArray ->
      ErevosCoreNative.couponBlind(spki, nonce)
    }
    AsyncFunction("couponFinalize") { spki: ByteArray, blindSignature: ByteArray, secret: ByteArray, randomizer: ByteArray, nonce: ByteArray ->
      ErevosCoreNative.couponFinalize(spki, blindSignature, secret, randomizer, nonce)
    }
    AsyncFunction("conversationStart") { account: ByteArray, bundle: ByteArray, plaintext: ByteArray ->
      ErevosCoreNative.conversationStart(account, bundle, plaintext)
    }
    AsyncFunction("conversationAccept") { account: ByteArray, packet: ByteArray ->
      ErevosCoreNative.conversationAccept(account, packet)
    }
    AsyncFunction("conversationAcceptAny") { account: ByteArray, prekeys: ByteArray, packet: ByteArray ->
      ErevosCoreNative.conversationAcceptAny(account, prekeys, packet)
    }
    AsyncFunction("accountPrekeys") { account: ByteArray -> ErevosCoreNative.accountPrekeys(account) }
    AsyncFunction("conversationSeal") { conversation: ByteArray, plaintext: ByteArray ->
      ErevosCoreNative.conversationSeal(conversation, plaintext)
    }
    AsyncFunction("conversationOpen") { conversation: ByteArray, packet: ByteArray ->
      ErevosCoreNative.conversationOpen(conversation, packet)
    }
    AsyncFunction("conversationPeer") { conversation: ByteArray -> ErevosCoreNative.conversationPeer(conversation) }
    AsyncFunction("conversationRestored") { conversation: ByteArray -> ErevosCoreNative.conversationRestored(conversation) }
    AsyncFunction("conversationEnablePq") { conversation: ByteArray -> ErevosCoreNative.conversationEnablePq(conversation) }
    AsyncFunction("conversationPq") { conversation: ByteArray -> ErevosCoreNative.conversationPq(conversation) }
    AsyncFunction("packetKind") { packet: ByteArray -> ErevosCoreNative.packetKind(packet) }
    AsyncFunction("firstMessageId") { packet: ByteArray -> ErevosCoreNative.firstMessageId(packet) }
    AsyncFunction("safetyNumber") { ours: ByteArray, theirs: ByteArray -> ErevosCoreNative.safetyNumber(ours, theirs) }
    AsyncFunction("importChats") { name: ByteArray, data: ByteArray -> ErevosCoreNative.importChats(name, data) }
    AsyncFunction("relaySeal") { relayKey: ByteArray, senderId: ByteArray, message: ByteArray ->
      ErevosCoreNative.relaySeal(relayKey, senderId, message)
    }
    AsyncFunction("sealPublic") { secret: ByteArray -> ErevosCoreNative.sealPublic(secret) }
    AsyncFunction("pairStart") { code: ByteArray, channel: ByteArray, session: ByteArray -> ErevosCoreNative.pairStart(code, channel, session) }
    AsyncFunction("pairFinish") { secret: ByteArray, session: ByteArray, started: ByteArray, answered: ByteArray, ownStarted: ByteArray ->
      ErevosCoreNative.pairFinish(secret, session, started, answered, ownStarted)
    }
    AsyncFunction("pairConfirm") { key: ByteArray, started: ByteArray -> ErevosCoreNative.pairConfirm(key, started) }
    AsyncFunction("pairConfirmed") { key: ByteArray, started: ByteArray, tag: ByteArray -> ErevosCoreNative.pairConfirmed(key, started, tag) }
    AsyncFunction("voiceChange") { pcm: ByteArray, rate: ByteArray, kind: ByteArray -> ErevosCoreNative.voiceChange(pcm, rate, kind) }
    // Writing out a voice message takes seconds: on a thread of its own, one at a time.
    AsyncFunction("speechText") Coroutine { path: ByteArray, pcm: ByteArray, rate: ByteArray, language: ByteArray ->
      withContext(speechThread) { ErevosCoreNative.speechText(path, pcm, rate, language) }
    }
    AsyncFunction("speechLetGo") Coroutine { nothing: ByteArray -> withContext(speechThread) { ErevosCoreNative.speechLetGo(nothing) } }
    // Translation runs on the same thread as speech: one model at a time works the processor.
    AsyncFunction("translateText") Coroutine { path: ByteArray, from: ByteArray, to: ByteArray, text: ByteArray ->
      withContext(speechThread) { ErevosCoreNative.translateText(path, from, to, text) }
    }
    AsyncFunction("translateLetGo") Coroutine { nothing: ByteArray -> withContext(speechThread) { ErevosCoreNative.translateLetGo(nothing) } }
    AsyncFunction("sealOpen") { secret: ByteArray, sealed: ByteArray -> ErevosCoreNative.sealOpen(secret, sealed) }
    AsyncFunction("relayChannelKeys") { relayKey: ByteArray, secret: ByteArray, answer: ByteArray ->
      ErevosCoreNative.relayChannelKeys(relayKey, secret, answer)
    }
    AsyncFunction("hardKey") { input: ByteArray, salt: ByteArray, cost: ByteArray -> ErevosCoreNative.hardKey(input, salt, cost) }
    AsyncFunction("signatureVerify") { key: ByteArray, message: ByteArray, signature: ByteArray -> ErevosCoreNative.signatureVerify(key, message, signature) }
    // Group chats (crates/erevos-group).
    AsyncFunction("groupNew") { about: ByteArray -> ErevosCoreNative.groupNew(about) }
    AsyncFunction("groupKeyPackage") { state: ByteArray -> ErevosCoreNative.groupKeyPackage(state) }
    AsyncFunction("groupSetAbout") { state: ByteArray, about: ByteArray -> ErevosCoreNative.groupSetAbout(state, about) }
    AsyncFunction("groupCreate") { state: ByteArray -> ErevosCoreNative.groupCreate(state) }
    AsyncFunction("groupAdd") { state: ByteArray, id: ByteArray, keyPackage: ByteArray -> ErevosCoreNative.groupAdd(state, id, keyPackage) }
    AsyncFunction("groupRemove") { state: ByteArray, id: ByteArray, leaf: ByteArray -> ErevosCoreNative.groupRemove(state, id, leaf) }
    AsyncFunction("groupCommitPending") { state: ByteArray, id: ByteArray -> ErevosCoreNative.groupCommitPending(state, id) }
    AsyncFunction("groupJoin") { state: ByteArray, welcome: ByteArray -> ErevosCoreNative.groupJoin(state, welcome) }
    AsyncFunction("groupSeal") { state: ByteArray, id: ByteArray, text: ByteArray -> ErevosCoreNative.groupSeal(state, id, text) }
    AsyncFunction("groupLeave") { state: ByteArray, id: ByteArray -> ErevosCoreNative.groupLeave(state, id) }
    AsyncFunction("groupForget") { state: ByteArray, id: ByteArray -> ErevosCoreNative.groupForget(state, id) }
    AsyncFunction("groupMembers") { state: ByteArray, id: ByteArray -> ErevosCoreNative.groupMembers(state, id) }
    AsyncFunction("groupOf") { message: ByteArray -> ErevosCoreNative.groupOf(message) }
    AsyncFunction("groupOpen") { state: ByteArray, message: ByteArray -> ErevosCoreNative.groupOpen(state, message) }
    // Public groups (docs/public-groups.md).
    AsyncFunction("groupNewSigner") { state: ByteArray -> ErevosCoreNative.groupNewSigner(state) }
    AsyncFunction("groupKeyPackageAs") { state: ByteArray, key: ByteArray, about: ByteArray -> ErevosCoreNative.groupKeyPackageAs(state, key, about) }
    AsyncFunction("groupCreatePublic") { state: ByteArray, key: ByteArray, about: ByteArray, rules: ByteArray ->
      ErevosCoreNative.groupCreatePublic(state, key, about, rules)
    }
    AsyncFunction("groupRules") { state: ByteArray, id: ByteArray -> ErevosCoreNative.groupRules(state, id) }
    AsyncFunction("groupCommit") { state: ByteArray, id: ByteArray, keyPackages: ByteArray, removes: ByteArray, rules: ByteArray ->
      ErevosCoreNative.groupCommit(state, id, keyPackages, removes, rules)
    }
    AsyncFunction("groupPackageAbout") { keyPackage: ByteArray -> ErevosCoreNative.groupPackageAbout(keyPackage) }
    AsyncFunction("groupEpoch") { message: ByteArray -> ErevosCoreNative.groupEpoch(message) }
    AsyncFunction("groupRenewal") { state: ByteArray, id: ByteArray, about: ByteArray -> ErevosCoreNative.groupRenewal(state, id, about) }
    AsyncFunction("groupRenew") { state: ByteArray, id: ByteArray, leaf: ByteArray, keyPackage: ByteArray ->
      ErevosCoreNative.groupRenew(state, id, leaf, keyPackage)
    }
    AsyncFunction("groupSelfUpdate") { state: ByteArray, id: ByteArray -> ErevosCoreNative.groupSelfUpdate(state, id) }
    AsyncFunction("groupSelfUpdateAs") { state: ByteArray, id: ByteArray, about: ByteArray -> ErevosCoreNative.groupSelfUpdateAs(state, id, about) }
    AsyncFunction("groupRejoin") { state: ByteArray, id: ByteArray, welcome: ByteArray -> ErevosCoreNative.groupRejoin(state, id, welcome) }

    // Relay requests through Tor (crates/erevos-tor), through the bridges given one per line, if
    // any. Tor keeps its state in the app's own folders. The pluggable transports for bridges
    // (lyrebird) come as a program named like a native library, as Android runs a program only
    // from where it unpacks those (this module's build.gradle); a build without it has only
    // plain bridges, and Tor says so rather than going without them.
    AsyncFunction("torStart") { bridges: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("No app context")
      val state = File(context.filesDir, "tor").apply { mkdirs() }
      val cache = File(context.cacheDir, "tor").apply { mkdirs() }
      val lyrebird = File(context.applicationInfo.nativeLibraryDir, "liblyrebird.so")
      val transports = if (lyrebird.canExecute()) lyrebird.path else ""
      tor {
        ErevosCoreNative.torStart(state.path.toByteArray(), cache.path.toByteArray(), bridges.toByteArray(), transports.toByteArray())
      }
      Unit
    }
    AsyncFunction("torStatus") { tor { ErevosCoreNative.torStatus() } }
    AsyncFunction("torStop") { tor { ErevosCoreNative.torStop() } }
    // The SOCKS5 door into Tor for Signal's and Telegram's engines: {"port", "password"} as JSON.
    AsyncFunction("torSocks") { tor { ErevosCoreNative.torSocks() } }
    AsyncFunction("torSocksClose") { tor { ErevosCoreNative.torSocksClose() } }
    // What waits on the network goes off the queue every module's calls share (torIo).
    AsyncFunction("torRequest") Coroutine { url: String, token: String, message: ByteArray ->
      torIo { ErevosCoreNative.torRequest(url.toByteArray(), token.toByteArray(), message) }
    }
    AsyncFunction("torHttp") Coroutine { head: String, body: ByteArray -> torIo { ErevosCoreNative.torHttp(head.toByteArray(), body) } }
    AsyncFunction("torOpen") Coroutine { url: String, token: String -> torIo { ErevosCoreNative.torOpen(url.toByteArray(), token.toByteArray()) } }
    AsyncFunction("torOpenChannel") Coroutine { url: String -> torIo { ErevosCoreNative.torOpenChannel(url.toByteArray()) } }
    AsyncFunction("torOpenOn") Coroutine { url: String, token: String, way: String, channel: Boolean ->
      torIo { ErevosCoreNative.torOpenOn(url.toByteArray(), token.toByteArray(), way.toByteArray(), byteArrayOf(if (channel) 1 else 0)) }
    }
    AsyncFunction("torCall") Coroutine { id: ByteArray, message: ByteArray -> torIo { ErevosCoreNative.torCall(id, message) } }
    AsyncFunction("torClose") Coroutine { id: ByteArray -> torIo { ErevosCoreNative.torClose(id) } }
    // Nostr relays through Tor: text frames both ways, and what the relay says waits until asked for.
    AsyncFunction("torTextOpen") Coroutine { url: String -> torIo { ErevosCoreNative.torTextOpen(url.toByteArray()) } }
    AsyncFunction("torTextSend") Coroutine { id: ByteArray, frame: String -> torIo { ErevosCoreNative.torTextSend(id, frame.toByteArray()) } }
    AsyncFunction("torTextNext") Coroutine { id: ByteArray, wait: ByteArray -> torIo { String(ErevosCoreNative.torTextNext(id, wait)) } }
    AsyncFunction("torTextClose") Coroutine { id: ByteArray -> torIo { ErevosCoreNative.torTextClose(id) } }
    // XMPP servers' connections, straight or through Tor (lib/xmpp-net.ts).
    AsyncFunction("netOpen") Coroutine { head: String -> torIo { ErevosCoreNative.netOpen(head.toByteArray()) } }
    AsyncFunction("netWrite") Coroutine { id: ByteArray, bytes: ByteArray -> torIo { ErevosCoreNative.netWrite(id, bytes) } }
    AsyncFunction("netRead") Coroutine { id: ByteArray, wait: ByteArray -> torIo { ErevosCoreNative.netRead(id, wait) } }
    AsyncFunction("netClose") Coroutine { id: ByteArray -> torIo { ErevosCoreNative.netClose(id) } }

    // Nostr for message text (crates/erevos-nostr).
    AsyncFunction("nostrSecret") { ErevosCoreNative.nostrSecret() }
    AsyncFunction("nostrPublic") { secret: ByteArray -> ErevosCoreNative.nostrPublic(secret) }
    AsyncFunction("nostrWrap") { to: ByteArray, bytes: ByteArray, now: ByteArray -> String(ErevosCoreNative.nostrWrap(to, bytes, now)) }
    AsyncFunction("nostrUnwrap") { secret: ByteArray, event: String -> ErevosCoreNative.nostrUnwrap(secret, event.toByteArray()) }
    // Matrix accounts (crates/erevos-matrix): one JSON request, its JSON answer.
    AsyncFunction("matrix") { request: ByteArray -> ErevosCoreNative.matrix(request) }
    // XMPP accounts' OMEMO (crates/erevos-xmpp): one JSON request, its JSON answer.
    AsyncFunction("xmpp") { request: ByteArray -> ErevosCoreNative.xmpp(request) }
    // Chats with other Nostr apps (crates/erevos-nostr chat): one JSON request, its JSON answer.
    AsyncFunction("nostrChat") { request: ByteArray -> ErevosCoreNative.nostrChat(request) }
  }
}

// A core built without Tor has none of its functions.
private inline fun <T> tor(call: () -> T): T =
  try {
    call()
  } catch (_: UnsatisfiedLinkError) {
    throw IllegalStateException("This build of Erevos has no Tor.")
  }

// Expo runs every module's async calls on one thread, one after another, and a relay's answer
// through Tor can take a minute (a wait, lib/relay.ts waitForMessage): those go on threads of
// their own, so the others do not wait behind them. Each such call keeps its thread while it
// waits: the relays' waits, each Nostr relay's next frame (lib/nostr-dm-net.ts), the opens under
// way. Dispatchers.IO lends at most 64 threads to all the app's waits, Expo's own too, and once
// they are taken a call waits behind the others' waits before it even starts: the Nostr tab's
// posts, which open some twenty relays at once, then waited minutes for each step. These go on
// TOR_THREADS of their own, beyond those 64, as Dispatchers.IO lends a view of it.
private const val TOR_THREADS = 256
private val torThreads = Dispatchers.IO.limitedParallelism(TOR_THREADS)

private suspend fun <T> torIo(call: () -> T): T = withContext(torThreads) { tor(call) }

// Voice messages written out (crates/erevos-speech), one after another, off Expo's one thread.
private val speechThread = Dispatchers.Default.limitedParallelism(1)

// The JNI functions in crates/erevos-ffi/src/android.rs. The library is built into the app by
// this module's build.gradle.
internal object ErevosCoreNative {
  init {
    System.loadLibrary("erevos_ffi")
  }

  @JvmStatic external fun accountNew(): ByteArray
  @JvmStatic external fun accountBundle(account: ByteArray): ByteArray
  @JvmStatic external fun accountIdentity(account: ByteArray): ByteArray
  @JvmStatic external fun bundleIdentity(bundle: ByteArray): ByteArray
  @JvmStatic external fun accountSign(account: ByteArray, context: ByteArray, message: ByteArray): ByteArray
  @JvmStatic external fun bundleVerify(bundle: ByteArray, context: ByteArray, message: ByteArray, signature: ByteArray): ByteArray
  @JvmStatic external fun accountBind(account: ByteArray): ByteArray
  @JvmStatic external fun couponBlind(spki: ByteArray, nonce: ByteArray): ByteArray
  @JvmStatic external fun couponFinalize(spki: ByteArray, blindSignature: ByteArray, secret: ByteArray, randomizer: ByteArray, nonce: ByteArray): ByteArray
  @JvmStatic external fun bundleBound(bundle: ByteArray, signature: ByteArray): ByteArray
  @JvmStatic external fun conversationStart(account: ByteArray, bundle: ByteArray, plaintext: ByteArray): ByteArray
  @JvmStatic external fun conversationAccept(account: ByteArray, packet: ByteArray): ByteArray
  @JvmStatic external fun conversationAcceptAny(account: ByteArray, prekeys: ByteArray, packet: ByteArray): ByteArray
  @JvmStatic external fun accountPrekeys(account: ByteArray): ByteArray
  @JvmStatic external fun conversationSeal(conversation: ByteArray, plaintext: ByteArray): ByteArray
  @JvmStatic external fun conversationOpen(conversation: ByteArray, packet: ByteArray): ByteArray
  @JvmStatic external fun conversationPeer(conversation: ByteArray): ByteArray
  @JvmStatic external fun conversationRestored(conversation: ByteArray): ByteArray
  @JvmStatic external fun conversationEnablePq(conversation: ByteArray): ByteArray
  @JvmStatic external fun conversationPq(conversation: ByteArray): ByteArray
  @JvmStatic external fun packetKind(packet: ByteArray): Int
  @JvmStatic external fun firstMessageId(packet: ByteArray): ByteArray
  @JvmStatic external fun safetyNumber(ours: ByteArray, theirs: ByteArray): String
  @JvmStatic external fun importChats(name: ByteArray, data: ByteArray): ByteArray
  @JvmStatic external fun relaySeal(relayKey: ByteArray, senderId: ByteArray, message: ByteArray): ByteArray
  @JvmStatic external fun sealPublic(secret: ByteArray): ByteArray
  @JvmStatic external fun pairStart(code: ByteArray, channel: ByteArray, session: ByteArray): ByteArray
  @JvmStatic external fun pairFinish(secret: ByteArray, session: ByteArray, started: ByteArray, answered: ByteArray, ownStarted: ByteArray): ByteArray
  @JvmStatic external fun pairConfirm(key: ByteArray, started: ByteArray): ByteArray
  @JvmStatic external fun pairConfirmed(key: ByteArray, started: ByteArray, tag: ByteArray): ByteArray
  @JvmStatic external fun voiceChange(pcm: ByteArray, rate: ByteArray, kind: ByteArray): ByteArray
  @JvmStatic external fun speechText(path: ByteArray, pcm: ByteArray, rate: ByteArray, language: ByteArray): ByteArray
  @JvmStatic external fun speechLetGo(nothing: ByteArray): ByteArray
  @JvmStatic external fun translateText(path: ByteArray, from: ByteArray, to: ByteArray, text: ByteArray): ByteArray
  @JvmStatic external fun translateLetGo(nothing: ByteArray): ByteArray
  @JvmStatic external fun sealOpen(secret: ByteArray, sealed: ByteArray): ByteArray
  @JvmStatic external fun relayChannelKeys(relayKey: ByteArray, secret: ByteArray, answer: ByteArray): ByteArray
  @JvmStatic external fun hardKey(input: ByteArray, salt: ByteArray, cost: ByteArray): ByteArray
  @JvmStatic external fun signatureVerify(key: ByteArray, message: ByteArray, signature: ByteArray): ByteArray
  @JvmStatic external fun groupNew(about: ByteArray): ByteArray
  @JvmStatic external fun groupKeyPackage(state: ByteArray): ByteArray
  @JvmStatic external fun groupSetAbout(state: ByteArray, about: ByteArray): ByteArray
  @JvmStatic external fun groupCreate(state: ByteArray): ByteArray
  @JvmStatic external fun groupAdd(state: ByteArray, id: ByteArray, keyPackage: ByteArray): ByteArray
  @JvmStatic external fun groupRemove(state: ByteArray, id: ByteArray, leaf: ByteArray): ByteArray
  @JvmStatic external fun groupCommitPending(state: ByteArray, id: ByteArray): ByteArray
  @JvmStatic external fun groupJoin(state: ByteArray, welcome: ByteArray): ByteArray
  @JvmStatic external fun groupSeal(state: ByteArray, id: ByteArray, text: ByteArray): ByteArray
  @JvmStatic external fun groupLeave(state: ByteArray, id: ByteArray): ByteArray
  @JvmStatic external fun groupForget(state: ByteArray, id: ByteArray): ByteArray
  @JvmStatic external fun groupMembers(state: ByteArray, id: ByteArray): ByteArray
  @JvmStatic external fun groupOf(message: ByteArray): ByteArray
  @JvmStatic external fun groupOpen(state: ByteArray, message: ByteArray): ByteArray
  @JvmStatic external fun groupNewSigner(state: ByteArray): ByteArray
  @JvmStatic external fun groupKeyPackageAs(state: ByteArray, key: ByteArray, about: ByteArray): ByteArray
  @JvmStatic external fun groupCreatePublic(state: ByteArray, key: ByteArray, about: ByteArray, rules: ByteArray): ByteArray
  @JvmStatic external fun groupRules(state: ByteArray, id: ByteArray): ByteArray
  @JvmStatic external fun groupCommit(state: ByteArray, id: ByteArray, keyPackages: ByteArray, removes: ByteArray, rules: ByteArray): ByteArray
  @JvmStatic external fun groupPackageAbout(keyPackage: ByteArray): ByteArray
  @JvmStatic external fun groupEpoch(message: ByteArray): ByteArray
  @JvmStatic external fun groupRenewal(state: ByteArray, id: ByteArray, about: ByteArray): ByteArray
  @JvmStatic external fun groupRenew(state: ByteArray, id: ByteArray, leaf: ByteArray, keyPackage: ByteArray): ByteArray
  @JvmStatic external fun groupSelfUpdate(state: ByteArray, id: ByteArray): ByteArray
  @JvmStatic external fun groupSelfUpdateAs(state: ByteArray, id: ByteArray, about: ByteArray): ByteArray
  @JvmStatic external fun groupRejoin(state: ByteArray, id: ByteArray, welcome: ByteArray): ByteArray
  @JvmStatic external fun torStart(stateDir: ByteArray, cacheDir: ByteArray, bridges: ByteArray, transports: ByteArray): ByteArray
  @JvmStatic external fun torStatus(): String
  @JvmStatic external fun torStop()
  @JvmStatic external fun torSocks(): String
  @JvmStatic external fun torSocksClose()
  @JvmStatic external fun torRequest(url: ByteArray, token: ByteArray, message: ByteArray): ByteArray
  @JvmStatic external fun torHttp(head: ByteArray, body: ByteArray): ByteArray
  @JvmStatic external fun torOpen(url: ByteArray, token: ByteArray): ByteArray
  @JvmStatic external fun torOpenChannel(url: ByteArray): ByteArray
  @JvmStatic external fun torOpenOn(url: ByteArray, token: ByteArray, way: ByteArray, channel: ByteArray): ByteArray
  @JvmStatic external fun torCall(id: ByteArray, message: ByteArray): ByteArray
  @JvmStatic external fun torClose(id: ByteArray): ByteArray
  @JvmStatic external fun torTextOpen(url: ByteArray): ByteArray
  @JvmStatic external fun torTextSend(id: ByteArray, frame: ByteArray): ByteArray
  @JvmStatic external fun torTextNext(id: ByteArray, wait: ByteArray): ByteArray
  @JvmStatic external fun torTextClose(id: ByteArray): ByteArray
  @JvmStatic external fun netOpen(head: ByteArray): ByteArray
  @JvmStatic external fun netWrite(id: ByteArray, bytes: ByteArray): ByteArray
  @JvmStatic external fun netRead(id: ByteArray, wait: ByteArray): ByteArray
  @JvmStatic external fun netClose(id: ByteArray): ByteArray
  @JvmStatic external fun nostrSecret(): ByteArray
  @JvmStatic external fun nostrPublic(secret: ByteArray): ByteArray
  @JvmStatic external fun nostrWrap(to: ByteArray, bytes: ByteArray, now: ByteArray): ByteArray
  @JvmStatic external fun nostrUnwrap(secret: ByteArray, event: ByteArray): ByteArray
  @JvmStatic external fun matrix(request: ByteArray): ByteArray
  @JvmStatic external fun xmpp(request: ByteArray): ByteArray
  @JvmStatic external fun nostrChat(request: ByteArray): ByteArray
}
