// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.session

import android.app.Application
import android.util.Base64
import eu.erevos.messenger.engine.cell
import eu.erevos.messenger.engine.getValue
import eu.erevos.messenger.engine.setValue
import com.google.protobuf.ByteString
import eu.erevos.messenger.KeyWrap
import java.io.File
import java.security.MessageDigest
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import javax.crypto.Cipher
import javax.crypto.Mac
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import network.loki.messenger.libsession_util.ED25519
import network.loki.messenger.libsession_util.GroupInfoConfig
import network.loki.messenger.libsession_util.GroupKeysConfig
import network.loki.messenger.libsession_util.GroupMembersConfig
import network.loki.messenger.libsession_util.Namespace
import network.loki.messenger.libsession_util.Hash
import network.loki.messenger.libsession_util.SessionEncrypt
import network.loki.messenger.libsession_util.encrypt.Attachments
import network.loki.messenger.libsession_util.pro.BackendRequests
import network.loki.messenger.libsession_util.protocol.SessionProtocol
import network.loki.messenger.libsession_util.util.GroupMember
import network.loki.messenger.libsession_util.util.MultiEncrypt
import org.json.JSONArray
import org.json.JSONObject
import org.session.protos.SessionProtos

/**
 * Session in the app: one account made on this phone (or brought back with its 13 words), its
 * one-to-one chats and the groups it was invited to, kept sealed by the Android Keystore. Its keys are below -2^62 (Signal's are
 * between -2^62 and 0, Messenger's positive), and its message ids start with "ss:".
 */
object Session {
    var available = false
        private set
    var ready: Boolean by cell(false)
    var selfId = 0L
    var status: String by cell("")

    private lateinit var app: Application
    private lateinit var dir: File
    private lateinit var net: SessionNet
    private var emit: (JSONObject) -> Unit = {}
    private val lock = Any()
    private val work = Executors.newScheduledThreadPool(3)
    private val log = ArrayDeque<String>()

    private var account: SessionAccount? = null
    private var myName = ""
    private var lastHash = ""
    private val seen = LinkedHashSet<String>()
    /**
     * Messages taken away here (deleted, unsent, gone after their timer). A swarm can hand them
     * out again (a node that does not know our last hash sends all it keeps, about 14 days), and
     * they must not come back as new.
     */
    private val gone = LinkedHashSet<String>()
    private val chats = LinkedHashMap<String, Chat>()
    private val names = HashMap<String, String>()
    private val byKey = HashMap<Long, String>()
    /** Groups (ids "03…"), whose chats are in [chats] under the same id. */
    private val groups = LinkedHashMap<String, Group>()
    private var polling: Thread? = null
    @Volatile private var running = false
    /** Which polling is wanted: one started before a stop sees another number and ends (stopPolling). */
    @Volatile private var generation = 0

    /** While a call is being set up or is on, new messages are read every second. */
    @Volatile var urgent = false
    private val wake = Object()

    /** Reads new messages now instead of after the pause. */
    fun pollNow() = synchronized(wake) { wake.notifyAll() }

    private class Chat(val id: String) {
        var name = ""
        var lastMs = 0L
        var snippet = ""
        var unread = false
        /**
         * The time of the newest message of theirs that was read here. As in Session's own apps
         * (last_read in its config), a message at or before it is read even when it comes again.
         */
        var readMs = 0L
        /** They wrote first and we have not answered yet: our first reply also accepts the request. */
        var theyAsked = false
        var answered = false
        /** Disappearing messages: 0 off, 1 after read, 2 after send; and the seconds. */
        var expireType = 0
        var expireSecs = 0
        /** The message pinned in this chat (kept on this phone only: Session has no pins). */
        var pinned = ""
        val messages = ArrayList<Msg>()
    }

    /**
     * A Session group we were invited to. Its state (name, members, the keys its messages are
     * encrypted with) is three configs kept in the group's own swarm, read with the member key
     * the invitation brought ([auth]); only this poller's thread and the senders touch them, each
     * under the group's own lock.
     */
    private class Group(val id: String, val auth: ByteArray) {
        /** We said yes: polled, and our first message was preceded by the answer to the admin. */
        @Volatile var accepted = false
        @Volatile var answered = false
        var inviter = ""
        /** Destroyed by its admins, or we were removed: no longer polled. */
        @Volatile var gone = false
        /** The group's own secret key (64 bytes) when we are one of its admins. */
        @Volatile var admin: ByteArray? = null
        /** Polls in a row refused (401): our member key was revoked. */
        var refused = 0
        /** The last message hash read in each of the group's namespaces (under [lock]). */
        val last = HashMap<Int, String>()
        @Volatile var dInfo: ByteArray? = null
        @Volatile var dMembers: ByteArray? = null
        @Volatile var dKeys: ByteArray? = null
        var info: GroupInfoConfig? = null
        var members: GroupMembersConfig? = null
        var keys: GroupKeysConfig? = null
        val pub32: ByteArray get() = SessionNet.hex(id.drop(2))
        val pub33: ByteArray get() = SessionNet.hex(id)
    }

    private fun isGroup(id: String) = id.length == 66 && id.startsWith("03")

    private class Msg(
        val id: String, val sender: String, var text: String, val ms: Long, val mine: Boolean,
        var atts: JSONArray, val replyTo: JSONObject?,
    ) {
        val reactions = LinkedHashMap<String, String>()
        /** Seconds until it disappears (0 = never), counted from sending or from reading. */
        var expires = 0L
        var expireFromRead = false
    }

    fun init(app: Application, onEvent: (JSONObject) -> Unit) {
        this.app = app
        dir = File(app.filesDir, "session")
        emit = onEvent
        net = SessionNet(app) { note(it) }
        available = runCatching {
            // Loads libsession_util.so; a phone without it (a build that left it out) has no Session.
            ED25519.generate(ByteArray(32))
            true
        }.getOrElse { note("library: ${it.message}"); false }
    }

    /** Whether a chat or person key belongs to Session. */
    fun isKey(key: Long): Boolean = key < -(1L shl 62)

    /** An account is on this phone (cheap: nothing opened). */
    fun hasAccount(): Boolean = ::dir.isInitialized && File(dir, "state.bin").exists()

    fun keyOf(id: String): Long {
        val d = MessageDigest.getInstance("SHA-256").digest(("erevos-session:" + id).toByteArray())
        var v = 0L
        for (i in 0 until 8) v = (v shl 8) or (d[i].toLong() and 0xff)
        val k = Long.MIN_VALUE + (v and ((1L shl 62) - 1))
        synchronized(lock) { byKey[k] = id }
        return k
    }

    private fun idOf(key: Long): String? = synchronized(lock) { byKey[key] }

    private fun note(line: String) {
        synchronized(log) {
            log.addLast(line)
            while (log.size > 300) log.removeFirst()
        }
    }

    // ---- the calls ----

    fun call(op: String, a: JSONObject = JSONObject()): JSONObject = try {
        JSONObject().put("ok", run(op, a) ?: JSONObject.NULL)
    } catch (e: Exception) {
        note("$op: ${e.message}")
        JSONObject().put("error", e.message ?: e.javaClass.simpleName)
    }

    private fun run(op: String, a: JSONObject): Any? {
        // Tor's door for all Session sends (SessionNet.setProxy): set before open, so nothing goes straight first.
        if (op == "setProxy") { SessionNet.setProxy(a.optString("url"), a.optBoolean("required")); return true }
        if (!available) throw IllegalStateException("Session is not available")
        return when (op) {
            "open" -> { open(); JSONObject().put("registered", ready) }
            "loggedIn" -> JSONObject().put("registered", ready)
            "create" -> create(a.optString("name"))
            "restore" -> restore(a.optString("words"), a.optString("name"))
            "words" -> Mnemonic(app).encode(me().seed)
            "sessionId" -> me().id
            "start" -> start()
            "logout" -> { logout(); true }
            "backupState" -> backupState()
            "restoreState" -> { restoreState(a.optString("state")); true }
            "log" -> synchronized(log) { log.joinToString("\n") }
            "setProfile" -> { synchronized(lock) { myName = a.optString("given").trim() }; save(); true }
            "messages" -> messages(a.optLong("thread"))
            "sendText" -> sendText(a.optLong("thread"), a.optString("text"), a.optString("replyTo"))
            "sendMedia" -> sendMedia(a)
            "react" -> react(a.optString("id"), a.optString("emoji"))
            "unsend" -> unsend(a.optString("id"))
            "deleteForMe" -> deleteForMe(a.optString("id"))
            "forward" -> forward(a.optString("id"), a.optJSONArray("to") ?: JSONArray())
            "markRead" -> { markRead(a.optLong("thread")); true }
            "markAllRead" -> { markAll(); true }
            "contacts" -> contacts()
            "searchPeople" -> search(a.optString("query"))
            "startChat" -> startChat(a)
            "members" -> members(a.optLong("thread"))
            "createGroup" -> createGroup(a.optString("title"), a.optJSONArray("people") ?: JSONArray())
            "renameGroup" -> { renameGroup(groupFor(a.optLong("thread")), a.optString("title")); true }
            "addMembers" -> { addMembers(groupFor(a.optLong("thread")), peopleOf(a.optJSONArray("people") ?: JSONArray())); true }
            "removeMember" -> { removeMember(groupFor(a.optLong("thread")), personOf(a.optLong("person"))); true }
            "setAdmin" -> { promote(groupFor(a.optLong("thread")), personOf(a.optLong("person")), a.optBoolean("admin")); true }
            "leaveGroup" -> { leaveGroup(groupFor(a.optLong("thread"))); true }
            "createPoll" -> createPoll(a.optLong("thread"), a.optString("question"), a.optJSONArray("options") ?: JSONArray())
            "votePoll" -> { votePoll(a.optLong("poll"), a.optJSONArray("selected") ?: JSONArray()); true }
            "callSend" -> { callSend(a); true }
            "pin" -> { pin(a.optString("id"), true); true }
            "unpin" -> { pin(a.optString("id"), false); true }
            else -> throw IllegalStateException("unknown op $op")
        }
    }

    private fun me(): SessionAccount = account ?: throw IllegalStateException("not signed in")

    // ---- account ----

    private val stateFile get() = File(dir, "state.bin")

    @Synchronized
    private fun open() {
        if (account != null) return
        if (!stateFile.exists()) return
        // A kept account that does not open is an error, never "no account": making a new one
        // over it would lose its seed.
        val raw = runCatching { String(unseal(stateFile.readBytes())) }
            .getOrElse { throw IllegalStateException("Ο λογαριασμός Session δεν ανοίγει (Keystore): ${it.message}") }
        val o = JSONObject(raw)
        synchronized(lock) {
            account = SessionAccount(SessionNet.hex(o.getString("seed")))
            myName = o.optString("name")
            lastHash = o.optString("lastHash")
            o.optJSONArray("seen")?.let { for (i in 0 until it.length()) seen.add(it.getString(i)) }
            o.optJSONArray("gone")?.let { for (i in 0 until it.length()) gone.add(it.getString(i)) }
            o.optJSONObject("names")?.let { n -> n.keys().forEach { names[it] = n.getString(it) } }
            val cs = o.optJSONArray("chats") ?: JSONArray()
            for (i in 0 until cs.length()) {
                val c = cs.getJSONObject(i)
                val chat = Chat(c.getString("id")).apply {
                    name = c.optString("name"); lastMs = c.optLong("lastMs"); snippet = c.optString("snippet")
                    unread = c.optBoolean("unread"); readMs = c.optLong("readMs"); theyAsked = c.optBoolean("theyAsked"); answered = c.optBoolean("answered")
                    expireType = c.optInt("expireType"); expireSecs = c.optInt("expireSecs"); pinned = c.optString("pinned")
                }
                val ms = c.optJSONArray("messages") ?: JSONArray()
                for (j in 0 until ms.length()) {
                    val m = ms.getJSONObject(j)
                    val msg = Msg(
                        m.getString("id"), m.getString("sender"), m.optString("text"), m.optLong("ms"), m.optBoolean("mine"),
                        m.optJSONArray("atts") ?: JSONArray(), m.optJSONObject("replyTo"),
                    )
                    m.optJSONObject("reactions")?.let { r -> r.keys().forEach { msg.reactions[it] = r.getString(it) } }
                    msg.expires = m.optLong("expires")
                    msg.expireFromRead = m.optBoolean("fromRead")
                    chat.messages.add(msg)
                }
                chats[chat.id] = chat
            }
            val gs = o.optJSONArray("groups") ?: JSONArray()
            for (i in 0 until gs.length()) {
                val j = gs.getJSONObject(i)
                val g = Group(j.getString("id"), SessionNet.hex(j.getString("auth"))).apply {
                    accepted = j.optBoolean("accepted"); answered = j.optBoolean("answered")
                    inviter = j.optString("inviter"); gone = j.optBoolean("gone")
                    admin = j.optString("admin").takeIf { it.isNotEmpty() }?.let { SessionNet.hex(it) }
                    j.optJSONObject("last")?.let { l -> l.keys().forEach { k -> k.toIntOrNull()?.let { last[it] = l.getString(k) } } }
                    dInfo = j.optString("dInfo").takeIf { it.isNotEmpty() }?.let { Base64.decode(it, Base64.NO_WRAP) }
                    dMembers = j.optString("dMembers").takeIf { it.isNotEmpty() }?.let { Base64.decode(it, Base64.NO_WRAP) }
                    dKeys = j.optString("dKeys").takeIf { it.isNotEmpty() }?.let { Base64.decode(it, Base64.NO_WRAP) }
                }
                groups[g.id] = g
            }
        }
        ready = true
    }

    private fun create(name: String): JSONObject {
        if (account != null || stateFile.exists()) throw IllegalStateException("there is already a Session account here")
        val acc = SessionAccount.create()
        synchronized(lock) {
            account = acc
            myName = name.trim()
        }
        saveNow()
        ready = true
        return JSONObject().put("id", acc.id).put("words", Mnemonic(app).encode(acc.seed))
    }

    private fun restore(words: String, name: String): JSONObject {
        if (account != null || stateFile.exists()) throw IllegalStateException("there is already a Session account here")
        val seed = Mnemonic(app).decode(words) ?: throw IllegalArgumentException("wrong words")
        val acc = SessionAccount(seed)
        synchronized(lock) {
            account = acc
            myName = name.trim()
            lastHash = ""
        }
        saveNow()
        ready = true
        return JSONObject().put("id", acc.id)
    }

    /**
     * Stops polling and waits for it a while, so a start after it never has two at once; one still
     * in a request then ends as it comes back, as its number is no longer the one wanted.
     */
    private fun stopPolling() {
        running = false
        generation++
        val was = polling
        polling = null
        was?.interrupt()
        synchronized(wake) { wake.notifyAll() }
        if (was != null && was !== Thread.currentThread()) runCatching { was.join(10_000L) }
    }

    private fun logout() {
        stopPolling()
        synchronized(lock) {
            account = null
            chats.clear(); groups.clear(); names.clear(); seen.clear(); lastHash = ""; myName = ""
        }
        dir.deleteRecursively()
        fileKey = null
        ready = false
    }

    /**
     * The file key: random, kept sealed by the Keystore (one small unseal per start), so saving a
     * long history is plain AES-GCM rather than a Keystore call over the whole file.
     */
    private var fileKey: ByteArray? = null

    @Synchronized
    private fun fileKey(): ByteArray {
        fileKey?.let { return it }
        val f = File(dir, "data.key")
        val k = if (f.exists()) {
            runCatching { KeyWrap.unwrap(f.readBytes()) }
                .getOrElse { throw IllegalStateException("Το κλειδί του Session δεν ανοίγει (Keystore): ${it.message}") }
        } else {
            dir.mkdirs()
            ByteArray(32).also { java.security.SecureRandom().nextBytes(it) }.also { f.writeBytes(KeyWrap.wrap(it)) }
        }
        fileKey = k
        return k
    }

    private fun seal(plain: ByteArray): ByteArray {
        val iv = ByteArray(12).also { java.security.SecureRandom().nextBytes(it) }
        val c = Cipher.getInstance("AES/GCM/NoPadding")
        c.init(Cipher.ENCRYPT_MODE, SecretKeySpec(fileKey(), "AES"), javax.crypto.spec.GCMParameterSpec(128, iv))
        return iv + c.doFinal(plain)
    }

    private fun unseal(data: ByteArray): ByteArray {
        val c = Cipher.getInstance("AES/GCM/NoPadding")
        c.init(Cipher.DECRYPT_MODE, SecretKeySpec(fileKey(), "AES"), javax.crypto.spec.GCMParameterSpec(128, data, 0, 12))
        return c.doFinal(data, 12, data.size - 12)
    }

    private val saveSoon = Runnable { saveNow() }
    private var saveTask: java.util.concurrent.ScheduledFuture<*>? = null

    private fun save() {
        synchronized(lock) {
            saveTask?.cancel(false)
            saveTask = work.schedule(saveSoon, 2, TimeUnit.SECONDS)
        }
    }

    private fun saveNow() {
        val text = stateText() ?: return
        runCatching {
            dir.mkdirs()
            val tmp = File(dir, "state.tmp")
            tmp.writeBytes(seal(text.toByteArray()))
            tmp.renameTo(stateFile)
        }.onFailure { note("save: ${it.message}") }
    }

    // ---- backups (Erevos+'s lib/backup-networks.ts) ----

    /**
     * The whole account as it is kept, in the clear, for a backup that seals it with its own
     * password: the seed, names, chats with their messages and the groups with their keys. Media
     * files are not in it (they come again from Session while it keeps them). Null with no account.
     */
    private fun backupState(): String? {
        open()
        // What waits to be saved is saved now, so the backup and the phone keep the same.
        synchronized(lock) { saveTask?.cancel(false) }
        saveNow()
        return stateText()
    }

    /**
     * Puts an account from a backup back on this phone, sealed with this phone's Keystore. Only
     * where there is no account, or the same one (same seed): another account here is never
     * replaced ("other-account"), as its seed would be lost. It is written beside the kept state
     * first and put in its place in one rename, so a failure leaves this phone's as it was; the
     * media folder stays, the same account's. The next open() starts it.
     */
    @Synchronized
    private fun restoreState(text: String) {
        val o = JSONObject(text)
        val seed = o.getString("seed")
        SessionAccount(SessionNet.hex(seed))
        val here = synchronized(lock) { account?.seed }?.let { SessionNet.hexOf(it) }
            ?: if (stateFile.exists()) {
                runCatching { JSONObject(String(unseal(stateFile.readBytes()))).getString("seed") }
                    .getOrElse { throw IllegalStateException("the Session account here does not open") }
            } else null
        if (here != null && !here.equals(seed, ignoreCase = true)) throw IllegalStateException("other-account")
        dir.mkdirs()
        val tmp = File(dir, "restore.tmp")
        tmp.writeBytes(seal(text.toByteArray()))
        stopPolling()
        synchronized(lock) {
            saveTask?.cancel(false)
            account = null
            chats.clear(); groups.clear(); names.clear(); seen.clear(); gone.clear(); lastHash = ""; myName = ""
        }
        ready = false
        if (!tmp.renameTo(stateFile)) {
            tmp.delete()
            throw IllegalStateException("could not keep the Session account")
        }
    }

    /** The state as saveNow() keeps it, in the clear; null with no account. */
    private fun stateText(): String? {
        return synchronized(lock) {
            val acc = account ?: return null
            val o = JSONObject().put("seed", SessionNet.hexOf(acc.seed)).put("name", myName).put("lastHash", lastHash)
            o.put("seen", JSONArray(seen.toList().takeLast(KEEP_SEEN)))
            o.put("gone", JSONArray(gone.toList().takeLast(KEEP_SEEN)))
            o.put("names", JSONObject(names as Map<*, *>))
            val cs = JSONArray()
            for (c in chats.values) {
                val ms = JSONArray()
                for (m in c.messages.takeLast(1000)) {
                    ms.put(
                        JSONObject().put("id", m.id).put("sender", m.sender).put("text", m.text).put("ms", m.ms)
                            .put("mine", m.mine).put("atts", m.atts).put("replyTo", m.replyTo ?: JSONObject.NULL)
                            .put("reactions", JSONObject(m.reactions as Map<*, *>)).put("expires", m.expires).put("fromRead", m.expireFromRead),
                    )
                }
                cs.put(
                    JSONObject().put("id", c.id).put("name", c.name).put("lastMs", c.lastMs).put("snippet", c.snippet)
                        .put("unread", c.unread).put("readMs", c.readMs).put("theyAsked", c.theyAsked).put("answered", c.answered)
                        .put("expireType", c.expireType).put("expireSecs", c.expireSecs).put("pinned", c.pinned).put("messages", ms),
                )
            }
            val gs = JSONArray()
            fun b64(b: ByteArray?) = b?.let { Base64.encodeToString(it, Base64.NO_WRAP) } ?: ""
            for (g in groups.values) {
                gs.put(
                    JSONObject().put("id", g.id).put("auth", SessionNet.hexOf(g.auth)).put("accepted", g.accepted)
                        .put("answered", g.answered).put("inviter", g.inviter).put("gone", g.gone)
                        .put("admin", g.admin?.let { SessionNet.hexOf(it) } ?: "")
                        .put("last", JSONObject(g.last.mapKeys { it.key.toString() } as Map<*, *>))
                        .put("dInfo", b64(g.dInfo)).put("dMembers", b64(g.dMembers)).put("dKeys", b64(g.dKeys)),
                )
            }
            o.put("chats", cs).put("groups", gs).toString()
        }
    }

    // ---- start and receiving ----

    private fun start(): JSONObject {
        open()
        val acc = me()
        selfId = keyOf(acc.id)
        val all = synchronized(lock) { chats.keys.toList() }
        all.forEach { emitChat(it) }
        if (!running) {
            running = true
            val gen = generation
            polling = Thread({ pollForever(gen) }, "erevos-session").apply { isDaemon = true; start() }
        }
        return JSONObject().put("self", selfId).put("id", acc.id)
    }

    private fun pollForever(gen: Int) {
        var wait = 3_000L
        var wasOk = false
        while (running && gen == generation) {
            try {
                pollOnce()
                if (!wasOk) emit(JSONObject().put("type", "status").put("network", "session").put("status", "συνδέθηκε"))
                wasOk = true
                // Often while the app is on screen; less often behind, for battery and data.
                wait = when {
                    urgent -> 1_000L
                    eu.erevos.messenger.engine.EngineHost.appInFront() -> 3_000L
                    else -> 30_000L
                }
            } catch (e: InterruptedException) {
                return
            } catch (e: Exception) {
                note("poll: ${e.message}")
                if (wasOk) emit(JSONObject().put("type", "status").put("network", "session").put("status", "επανασύνδεση"))
                wasOk = false
                wait = (wait * 2).coerceAtMost(60_000L)
            }
            try { synchronized(wake) { wake.wait(if (urgent) 1_000L else wait) } } catch (_: InterruptedException) { return }
        }
    }

    private fun pollOnce() {
        val acc = me()
        do {
            val ts = net.now()
            val sig = ED25519.sign(ed25519PrivateKey = acc.edSecret, message = "retrieve$ts".toByteArray())
            val p = JSONObject().put("pubkey", acc.id).put("pubkey_ed25519", acc.edPublicHex)
                .put("timestamp", ts).put("signature", Base64.encodeToString(sig, Base64.NO_WRAP))
            val from = synchronized(lock) { lastHash }
            if (from.isNotEmpty()) p.put("last_hash", from)
            val r = net.toSwarm(acc.id, "retrieve", p)
            val list = r.optJSONArray("messages") ?: JSONArray()
            for (i in 0 until list.length()) {
                val m = list.getJSONObject(i)
                val hash = m.optString("hash")
                val fresh = synchronized(lock) {
                    seen.add(hash).also { while (seen.size > KEEP_SEEN) seen.remove(seen.first()) }
                }
                if (fresh) runCatching { take(Base64.decode(m.optString("data"), Base64.DEFAULT), hash) }.onFailure { note("message: ${it.message}") }
                synchronized(lock) { lastHash = hash }
            }
            if (list.length() > 0) save()
        } while (r.optBoolean("more") && running)
        pollGroups()
    }

    private val proKey: ByteArray by lazy { SessionNet.hex(BackendRequests.proBackendPubKeyHex()) }

    private fun take(data: ByteArray, hash: String) {
        val acc = me()
        val env = SessionProtocol.decodeFor1o1(myEd25519PrivKey = acc.edSecret, payload = data, proBackendPubKey = proKey)
        val senderKey = env.senderX25519PubKey.data
        val sender = if (senderKey.size == 33) SessionNet.hexOf(senderKey) else "05" + SessionNet.hexOf(senderKey)
        handle(SessionProtos.Content.parseFrom(env.contentPlainText.data), sender, env.timestamp.toEpochMilli(), null, hash)
    }

    /** One decrypted message, from a one-to-one chat ([group] null) or from a group. */
    private fun handle(c: SessionProtos.Content, sender: String, ts: Long, group: String?, hash: String) {
        val acc = me()
        val fromMe = sender == acc.id
        if (c.hasDataMessage()) {
            val dm = c.dataMessage
            if (dm.hasProfile() && dm.profile.displayName.isNotBlank() && !fromMe) setName(sender, dm.profile.displayName)
            if (dm.hasGroupUpdateMessage()) {
                groupUpdate(dm.groupUpdateMessage, sender, ts, group, hash)
                return
            }
            // Our own message from another device carries the chat in syncTarget.
            val chatId = group ?: if (fromMe) dm.syncTarget.ifEmpty { return } else sender
            if (dm.hasReaction()) {
                val r = dm.reaction
                val target = "ss:${r.id}:${r.author}"
                val emoji = if (r.action == SessionProtos.DataMessage.Reaction.Action.REMOVE) "" else r.emoji
                val m = synchronized(lock) {
                    findMsg(target)?.also { if (emoji.isEmpty()) it.reactions.remove(sender) else it.reactions[sender] = emoji }
                }
                emit(JSONObject().put("type", "reaction").put("id", target).put("actor", keyOf(sender)).put("emoji", emoji))
                m?.let { emitVotes(it) }
                save()
                return
            }
            // The sender's disappearing setting for this chat comes with each of its messages
            // (a group's own setting is in its info config, read when polling).
            val type = if (c.hasExpirationType()) c.expirationType.number else 0
            val secs = if (c.hasExpirationTimer()) c.expirationTimer else 0
            val timerUpdate = dm.flags and 2 != 0 // DataMessage.Flags.EXPIRATION_TIMER_UPDATE
            if (group == null && (c.hasExpirationType() || timerUpdate)) {
                synchronized(lock) {
                    chats.getOrPut(chatId) { Chat(chatId).apply { name = names[chatId].orEmpty() } }.let {
                        it.expireType = if (secs > 0) type else 0
                        it.expireSecs = secs
                    }
                }
            }
            val text = if (timerUpdate) {
                if (secs == 0) "⏱ Τα μηνύματα δεν εξαφανίζονται πια" else "⏱ Τα μηνύματα εξαφανίζονται μετά από ${timerText(secs)}"
            } else dm.body
            val atts = JSONArray()
            dm.attachmentsList.forEachIndexed { i, p -> atts.put(attJson(p, "")) }
            if (text.isEmpty() && atts.length() == 0) return
            val reply = if (dm.hasQuote()) {
                val q = dm.quote
                JSONObject().put("id", "ss:${q.id}:${q.author}").put("text", q.text)
                    .put("sender", keyOf(q.author)).put("name", if (q.author == acc.id) "" else nameOf(q.author))
            } else null
            val id = "ss:$ts:$sender"
            val msg = Msg(id, sender, text, ts, fromMe, atts, reply)
            if (!timerUpdate && secs > 0 && type != 0) {
                msg.expires = secs.toLong()
                // "After read" (1) starts when he sees it; "after send" (2) at once.
                msg.expireFromRead = type == 1 && !fromMe
            }
            addMessage(chatId, msg, incoming = !fromMe)
            dm.attachmentsList.forEachIndexed { i, p -> fetch(chatId, id, i, p) }
        }
        if (c.hasUnsendRequest()) {
            val u = c.unsendRequest
            if (u.author == sender) {
                val id = "ss:${u.timestamp}:${u.author}"
                val chatId = synchronized(lock) {
                    chats.values.firstOrNull { ch -> (group == null || ch.id == group) && ch.messages.removeIf { it.id == id } }?.id
                        .also { forget(id) }
                }
                if (chatId != null) emit(JSONObject().put("type", "deleted").put("thread", keyOf(chatId)).put("id", id))
                save()
            }
        }
        if (group == null && c.hasCallMessage() && !fromMe) takeCall(c.callMessage, sender, ts)
        if (group == null && c.hasMessageRequestResponse()) {
            val r = c.messageRequestResponse
            if (r.hasProfile() && r.profile.displayName.isNotBlank()) setName(sender, r.profile.displayName)
            synchronized(lock) { chats[sender]?.answered = true }
        }
    }

    // ---- groups: receiving ----

    /** Whether an admin of [groupId] signed [text] (invitations and the notices of changes are). */
    private fun signedByGroup(groupId: String, text: String, sig: ByteString): Boolean =
        runCatching { ED25519.verify(ed25519PublicKey = SessionNet.hex(groupId.drop(2)), message = text.toByteArray(), signature = sig.toByteArray()) }
            .getOrDefault(false)

    private fun groupUpdate(u: SessionProtos.GroupUpdateMessage, sender: String, ts: Long, group: String?, hash: String) {
        val acc = me()
        if (u.hasInviteMessage()) {
            if (group == null && sender != acc.id) invited(u.inviteMessage, sender, ts)
            return
        }
        if (u.hasPromoteMessage()) {
            if (group == null && sender != acc.id) promoted(u.promoteMessage, sender, ts)
            return
        }
        if (group == null) return
        val who = if (sender == acc.id) "Εσύ" else nameOf(sender)
        fun list(ids: List<String>) = ids.joinToString(", ") { if (it == acc.id) "εσένα" else nameOf(it) }
        val text = when {
            u.hasInfoChangeMessage() -> {
                val m = u.infoChangeMessage
                if (!signedByGroup(group, "INFO_CHANGE${m.type.number}$ts", m.adminSignature)) return
                when (m.type) {
                    SessionProtos.GroupUpdateInfoChangeMessage.Type.NAME -> "✏ $who: νέο όνομα ομάδας «${m.updatedName}»"
                    SessionProtos.GroupUpdateInfoChangeMessage.Type.AVATAR -> "🖼 $who άλλαξε την εικόνα της ομάδας"
                    SessionProtos.GroupUpdateInfoChangeMessage.Type.DISAPPEARING_MESSAGES ->
                        if (m.updatedExpiration == 0) "⏱ $who: τα μηνύματα δεν εξαφανίζονται πια"
                        else "⏱ $who: τα μηνύματα εξαφανίζονται μετά από ${timerText(m.updatedExpiration)}"
                    else -> return
                }
            }
            u.hasMemberChangeMessage() -> {
                val m = u.memberChangeMessage
                if (!signedByGroup(group, "MEMBER_CHANGE${m.type.number}$ts", m.adminSignature)) return
                val people = list(m.memberSessionIdsList)
                when (m.type) {
                    SessionProtos.GroupUpdateMemberChangeMessage.Type.ADDED -> "➕ $who πρόσθεσε: $people"
                    SessionProtos.GroupUpdateMemberChangeMessage.Type.REMOVED -> "➖ $who αφαίρεσε: $people"
                    SessionProtos.GroupUpdateMemberChangeMessage.Type.PROMOTED -> "⭐ $who έκανε διαχειριστή: $people"
                    else -> return
                }
            }
            u.hasMemberLeftMessage() || u.hasMemberLeftNotificationMessage() -> "🚪 $who έφυγε από την ομάδα"
            u.hasInviteResponse() && u.inviteResponse.isApproved -> "👋 $who μπήκε στην ομάδα"
            else -> return
        }
        addMessage(group, Msg("ss:$ts:$sender", sender, text, ts, sender == acc.id, JSONArray(), null), incoming = sender != acc.id)
        // What an admin of ours does about it: mark the newcomer accepted, take out who left.
        val g = synchronized(lock) { groups[group] } ?: return
        if (g.admin == null || sender == acc.id) return
        if (u.hasInviteResponse() && u.inviteResponse.isApproved) {
            work.execute {
                runCatching {
                    val changed = synchronized(g) {
                        keysOf(g)
                        g.members!!.get(sender)?.let { m ->
                            val st = g.members!!.status(m)
                            if (st != GroupMember.Status.INVITE_ACCEPTED && !m.isAdminOrBeingPromoted(st)) {
                                m.setInviteAccepted(); g.members!!.set(m); true
                            } else false
                        } ?: false
                    }
                    if (changed) pushConfigs(g)
                }.onFailure { note("group accept: ${it.message}") }
            }
        } else if (u.hasMemberLeftMessage()) {
            work.execute { runCatching { dropMembers(g, listOf(sender), notice = false) }.onFailure { note("group left: ${it.message}") } }
        }
    }

    /**
     * Made an admin: the message carries the group's own key seed, which must give the group's
     * id. Kept, the configs reloaded with it, and our row marked as having accepted.
     */
    private fun promoted(m: SessionProtos.GroupUpdatePromoteMessage, from: String, ts: Long) {
        val acc = me()
        val pair = runCatching { ED25519.generate(m.groupIdentitySeed.toByteArray()) }.getOrNull() ?: return
        val id = "03" + SessionNet.hexOf(pair.pubKey.data)
        val g = synchronized(lock) { groups[id] }
        if (g == null || g.gone) {
            note("promotion for a group we are not in")
            return
        }
        g.admin = pair.secretKey.data
        synchronized(g) {
            keysOf(g).loadAdminKey(pair.secretKey.data)
            g.members!!.get(acc.id)?.let { me -> me.setPromotionAccepted(); g.members!!.set(me) }
            dumpAll(g)
        }
        g.accepted = true
        addMessage(id, Msg("ss:$ts:$from", from, "⭐ ${nameOf(from)} σε έκανε διαχειριστή της ομάδας.", ts, false, JSONArray(), null), incoming = true)
        work.execute { runCatching { pushConfigs(g) }.onFailure { note("group promoted: ${it.message}") } }
        emit(JSONObject().put("type", "members").put("thread", keyOf(id)))
    }

    private fun dumpAll(g: Group) {
        g.dInfo = g.info!!.dump(); g.dMembers = g.members!!.dump(); g.dKeys = g.keys!!.dump()
    }

    /**
     * An invitation, signed by the group's key: the group is kept with the member key it brought.
     * From someone we already talk with it is accepted at once; otherwise it waits as a chat that
     * says who invited us, and our first message there accepts it (as one-to-one requests do).
     */
    private fun invited(m: SessionProtos.GroupUpdateInviteMessage, inviter: String, ts: Long) {
        val acc = me()
        val id = m.groupSessionId.lowercase()
        if (!isGroup(id)) return
        if (!signedByGroup(id, "INVITE${acc.id}$ts", m.adminSignature)) { note("invite: bad signature"); return }
        val known = synchronized(lock) { chats[inviter]?.let { c -> c.answered || c.messages.any { it.mine } } ?: false }
        val fresh = synchronized(lock) {
            val old = groups[id]
            if (old != null && !old.gone) {
                false
            } else {
                // A new invitation after being removed starts over with the new member key.
                groups[id] = Group(id, m.memberAuthData.toByteArray()).apply { this.inviter = inviter; accepted = known }
                names.putIfAbsent(id, m.name)
                chats.getOrPut(id) { Chat(id) }.name = m.name.ifEmpty { names[id].orEmpty() }
                true
            }
        }
        if (!fresh) {
            // Already in it: the admin may have lost our answer and invited again; answer again.
            synchronized(lock) { groups[id] }?.takeIf { it.accepted }?.let { g -> work.execute { runCatching { answerInvite(g, force = true) } } }
            return
        }
        val text = if (known) "📨 ${nameOf(inviter)} σε πρόσθεσε στην ομάδα «${m.name}»."
        else "📨 ${nameOf(inviter)} σε προσκαλεί στην ομάδα «${m.name}». Γράψε ένα μήνυμα εδώ για να μπεις."
        addMessage(id, Msg("ss:$ts:$inviter", inviter, text, ts, false, JSONArray(), null), incoming = true)
        save()
        if (known) synchronized(lock) { groups[id] }?.let { g -> work.execute { runCatching { answerInvite(g) }.onFailure { note("group answer: ${it.message}") } } }
    }

    /** The current keys of a group, made from its saved state the first time (under the group's lock). */
    private fun keysOf(g: Group): GroupKeysConfig {
        g.keys?.let { return it }
        fun make(useDumps: Boolean): GroupKeysConfig {
            val info = GroupInfoConfig(g.pub32, g.admin, if (useDumps) g.dInfo else null)
            val mem = GroupMembersConfig(g.pub32, g.admin, if (useDumps) g.dMembers else null)
            val keys = GroupKeysConfig(me().edSecret, g.pub32, g.admin, if (useDumps) g.dKeys else null, info, mem)
            g.info = info; g.members = mem; g.keys = keys
            return keys
        }
        return runCatching { make(true) }.getOrElse {
            // A saved state that does not load is read again from the swarm.
            note("group state: ${it.message}")
            synchronized(lock) { g.last.clear() }
            make(false)
        }
    }

    /** Reads one namespace of a group's swarm from where we stopped, signed with our member key. */
    private fun groupRetrieve(g: Group, ns: Int): List<JSONObject> {
        val out = ArrayList<JSONObject>()
        do {
            val ts = net.now()
            val p = JSONObject().put("pubkey", g.id).put("namespace", ns).put("timestamp", ts)
            authInto(g, "retrieve$ns$ts".toByteArray(), p)
            synchronized(lock) { g.last[ns] }?.let { p.put("last_hash", it) }
            val r = net.toSwarm(g.id, "retrieve", p)
            val list = r.optJSONArray("messages") ?: JSONArray()
            for (i in 0 until list.length()) out.add(list.getJSONObject(i))
            if (list.length() > 0) synchronized(lock) { g.last[ns] = list.getJSONObject(list.length() - 1).optString("hash") }
        } while (r.optBoolean("more") && running && out.size < 5000)
        return out
    }

    private fun data(m: JSONObject): ByteArray = Base64.decode(m.optString("data"), Base64.DEFAULT)

    private fun pollGroups() {
        val list = synchronized(lock) { groups.values.filter { it.accepted && !it.gone } }
        for (g in list) {
            if (!running) return
            runCatching { pollGroup(g); g.refused = 0 }.onFailure {
                note("group ${g.id.take(8)}: ${it.message}")
                // Refused again and again: our member key was revoked, we were removed.
                if (it is SessionNet.NetError && it.code == 401 && ++g.refused >= 5) removedFrom(g, destroyed = false)
            }
        }
    }

    private fun pollGroup(g: Group) {
        val acc = me()
        // Keys first: they open the other two configs and the messages.
        val keyMsgs = groupRetrieve(g, Namespace.GROUP_KEYS())
        val infoMsgs = groupRetrieve(g, Namespace.GROUP_INFO())
        val memberMsgs = groupRetrieve(g, Namespace.GROUP_MEMBERS())
        var name: String
        var destroyed: Boolean
        var expiry: Long
        var people: List<Triple<String, String, Boolean>>
        synchronized(g) {
            val keys = keysOf(g)
            for (m in keyMsgs) {
                runCatching { keys.loadKey(data(m), m.optString("hash"), m.optLong("timestamp")) }.onFailure { note("group keys: ${it.message}") }
            }
            val info = g.info!!
            val members = g.members!!
            if (infoMsgs.isNotEmpty()) {
                runCatching { info.merge(infoMsgs.map { it.optString("hash") to data(it) }.toTypedArray()) }.onFailure { note("group info: ${it.message}") }
            }
            if (memberMsgs.isNotEmpty()) {
                runCatching { members.merge(memberMsgs.map { it.optString("hash") to data(it) }.toTypedArray()) }.onFailure { note("group members: ${it.message}") }
            }
            if (keyMsgs.isNotEmpty() || infoMsgs.isNotEmpty() || memberMsgs.isNotEmpty()) {
                g.dInfo = info.dump(); g.dMembers = members.dump(); g.dKeys = keys.dump()
            }
            name = info.getName().orEmpty()
            destroyed = info.isDestroyed()
            expiry = info.getExpiryTimer()
            people = members.all().map { Triple(it.accountId(), it.name, it.admin) }
        }
        var changed = false
        synchronized(lock) {
            for ((id, n, _) in people) if (n.isNotBlank() && id != acc.id) names.putIfAbsent(id, n)
            val c = chats.getOrPut(g.id) { Chat(g.id) }
            if (name.isNotEmpty() && c.name != name) { c.name = name; names[g.id] = name; changed = true }
            val secs = expiry.coerceIn(0, Int.MAX_VALUE.toLong()).toInt()
            if (c.expireSecs != secs) { c.expireSecs = secs; c.expireType = if (secs > 0) 2 else 0 }
        }
        if (changed) emitChat(g.id)
        if (keyMsgs.isNotEmpty() || memberMsgs.isNotEmpty()) emit(JSONObject().put("type", "members").put("thread", keyOf(g.id)))
        if (destroyed || (people.isNotEmpty() && people.none { it.first == acc.id }) || kicked(g)) {
            removedFrom(g, destroyed)
            return
        }
        val msgs = groupRetrieve(g, Namespace.GROUP_MESSAGES())
        for (m in msgs) {
            val hash = m.optString("hash")
            val fresh = synchronized(lock) { seen.add(hash).also { while (seen.size > KEEP_SEEN) seen.remove(seen.first()) } }
            if (!fresh) continue
            runCatching {
                val env = synchronized(g) {
                    SessionProtocol.decodeForGroup(
                        payload = data(m), myEd25519PrivKey = acc.edSecret, groupEd25519PublicKey = g.pub32,
                        groupEd25519PrivateKeys = keysOf(g).groupKeys().toTypedArray(), proBackendPubKey = proKey,
                    )
                }
                val senderKey = env.senderX25519PubKey.data
                val sender = if (senderKey.size == 33) SessionNet.hexOf(senderKey) else "05" + SessionNet.hexOf(senderKey)
                handle(SessionProtos.Content.parseFrom(env.contentPlainText.data), sender, env.timestamp.toEpochMilli(), g.id, hash)
            }.onFailure { note("group message: ${it.message}") }
        }
        if (keyMsgs.isNotEmpty() || infoMsgs.isNotEmpty() || memberMsgs.isNotEmpty() || msgs.isNotEmpty()) save()
    }

    private fun removedFrom(g: Group, destroyed: Boolean) {
        if (g.gone) return
        g.gone = true
        val now = net.now()
        addMessage(g.id, Msg("ss:$now:${g.id}", g.id, if (destroyed) "⛔ Η ομάδα διαλύθηκε." else "⛔ Δεν είσαι πια μέλος αυτής της ομάδας.", now, false, JSONArray(), null), incoming = true)
        save()
    }

    /** Whether an admin left word, in the group's "revoked" namespace, that we were removed. */
    private fun kicked(g: Group): Boolean {
        if (g.admin != null) return false
        val acc = me()
        val mine = SessionNet.hex(acc.id.drop(2))
        for (m in runCatching { groupRetrieve(g, Namespace.REVOKED_GROUP_MESSAGES()) }.getOrDefault(emptyList())) {
            val d = runCatching {
                MultiEncrypt.decryptForMultipleSimple(encoded = data(m), ed25519SecretKey = acc.edSecret, senderPubKey = g.pub32, domain = MultiEncrypt.KICKED_DOMAIN)
            }.getOrNull() ?: continue
            if (d.size < 33 || !d.copyOfRange(0, 32).contentEquals(mine)) continue
            val gen = String(d.copyOfRange(32, d.size)).toIntOrNull() ?: continue
            if (gen >= synchronized(g) { keysOf(g).currentGeneration() }) return true
        }
        return false
    }

    // ---- groups: answering and members ----

    /**
     * Tells the group's admins we accepted (they mark us so in the members list), once; [force]
     * answers again when an admin invites us anew. Reads the group first: the answer is encrypted
     * with its keys.
     */
    private fun answerInvite(g: Group, force: Boolean = false) {
        if (g.answered && !force) return
        if (synchronized(g) { keysOf(g).groupKeys().isEmpty() }) pollGroup(g)
        val ts = net.now()
        val dm = SessionProtos.DataMessage.newBuilder().setTimestamp(ts).setGroupUpdateMessage(
            SessionProtos.GroupUpdateMessage.newBuilder().setInviteResponse(
                SessionProtos.GroupUpdateInviteResponseMessage.newBuilder().setIsApproved(true),
            ),
        )
        profile()?.let { dm.profile = it }
        deliver(g.id, ts, SessionProtos.Content.newBuilder().setDataMessage(dm))
        g.answered = true
        save()
    }

    /** Accepts a waiting invitation (our first message there does it). */
    private fun acceptGroup(id: String) {
        val g = synchronized(lock) { groups[id] } ?: return
        if (g.gone) throw IllegalStateException("δεν είσαι πια μέλος αυτής της ομάδας")
        if (!g.accepted) {
            g.accepted = true
            save()
        }
        answerInvite(g)
    }

    private fun members(key: Long): JSONArray {
        val out = JSONArray()
        val id = idOf(key) ?: return out
        val g = synchronized(lock) { groups[id] } ?: return out
        val acc = me()
        class Row(val id: String, val name: String, val admin: Boolean, val waiting: Boolean, val failed: Boolean)
        val people = synchronized(g) {
            keysOf(g)
            val ms = g.members!!
            ms.all().map { m ->
                val st = ms.status(m)
                val waiting = st == GroupMember.Status.INVITE_SENT || st == GroupMember.Status.INVITE_NOT_SENT ||
                    st == GroupMember.Status.INVITE_SENDING || st == GroupMember.Status.INVITE_UNKNOWN
                Row(m.accountId(), m.name, m.admin, waiting, st == GroupMember.Status.INVITE_FAILED)
            }
        }
        for (r in people) {
            val pid = r.id
            val shown = if (pid == acc.id) myName else r.name.ifBlank { nameOf(pid) }
            val state = when { r.failed -> " · η πρόσκληση δεν στάλθηκε"; r.waiting && pid != acc.id -> " · προσκλήθηκε"; else -> "" }
            out.put(
                JSONObject().put("id", keyOf(pid)).put("name", shown + state).put("admin", r.admin).put("me", pid == acc.id)
                    // The same without the Greek note, for a host app that says it in its own words.
                    .put("person", shown).put("invited", r.waiting && pid != acc.id).put("inviteFailed", r.failed),
            )
        }
        return out
    }

    // ---- groups: as an admin ----

    private const val CONFIG_TTL = 30L * 24 * 60 * 60 * 1000

    private fun b64(b: ByteArray): String = Base64.encodeToString(b, Base64.NO_WRAP)

    /** Signs a swarm request for a group: with the group's own key as admin, else with our member key. */
    private fun authInto(g: Group, text: ByteArray, p: JSONObject) {
        val admin = g.admin
        if (admin != null) {
            p.put("signature", b64(ED25519.sign(ed25519PrivateKey = admin, message = text)))
        } else {
            val a = synchronized(g) { keysOf(g).subAccountSign(text, g.auth) }
            p.put("subaccount", a.subAccount).put("subaccount_sig", a.subAccountSig).put("signature", a.signature)
        }
    }

    /** Stores one message in a namespace of the group's swarm; the hash and time it got. */
    private fun storeIn(g: Group, ns: Int, data: ByteArray, ttl: Long): Pair<String, Long> {
        val now = net.now()
        val p = JSONObject().put("pubkey", g.id).put("namespace", ns).put("data", b64(data))
            .put("ttl", ttl).put("timestamp", now).put("sig_timestamp", now)
        authInto(g, "store$ns$now".toByteArray(), p)
        val r = net.toSwarm(g.id, "store", p)
        return r.optString("hash") to r.optLong("t", now).let { if (it > 0) it else now }
    }

    private fun adminCall(g: Group, method: String, tokens: List<ByteArray>) {
        val now = net.now()
        val p = JSONObject().put("pubkey", g.id).put("timestamp", now)
            .put(if (method == "revoke_subaccount") "revoke" else "unrevoke", JSONArray(tokens.map { b64(it) }))
        authInto(g, tokens.fold("$method$now".toByteArray()) { acc, t -> acc + t }, p)
        net.toSwarm(g.id, method, p)
    }

    /**
     * Sends what changed in the group's configs (keys first, then members and info) and confirms
     * it, as the official apps do; only admins can.
     */
    private fun pushConfigs(g: Group) {
        if (g.admin == null) return
        var mp: network.loki.messenger.libsession_util.util.ConfigPush? = null
        var ip: network.loki.messenger.libsession_util.util.ConfigPush? = null
        var kp: ByteArray? = null
        synchronized(g) {
            keysOf(g)
            if (g.members!!.needsPush()) mp = g.members!!.push()
            if (g.info!!.needsPush()) ip = g.info!!.push()
            kp = g.keys!!.pendingConfig()
        }
        val k = kp?.let { storeIn(g, Namespace.GROUP_KEYS(), it, CONFIG_TTL) }
        val mHashes = mp?.let { push -> push.messages.map { storeIn(g, Namespace.GROUP_MEMBERS(), it.data, CONFIG_TTL).first } }
        val iHashes = ip?.let { push -> push.messages.map { storeIn(g, Namespace.GROUP_INFO(), it.data, CONFIG_TTL).first } }
        synchronized(g) {
            mHashes?.let { g.members!!.confirmPushed(mp!!.seqNo, it.toTypedArray()) }
            iHashes?.let { g.info!!.confirmPushed(ip!!.seqNo, it.toTypedArray()) }
            if (k != null) g.keys!!.pendingConfig()?.let { pending -> g.keys!!.loadKey(pending, k.first, k.second) }
            dumpAll(g)
        }
        save()
        emit(JSONObject().put("type", "members").put("thread", keyOf(g.id)))
    }

    private fun groupFor(key: Long): Group {
        val id = idOf(key) ?: throw IllegalStateException("chat not found")
        val g = synchronized(lock) { groups[id] } ?: throw IllegalStateException("not a group")
        if (g.gone) throw IllegalStateException("δεν είσαι πια μέλος αυτής της ομάδας")
        return g
    }

    private fun adminOf(g: Group): ByteArray =
        g.admin ?: throw IllegalStateException("μόνο οι διαχειριστές της ομάδας το κάνουν αυτό")

    private fun personOf(key: Long): String =
        (idOf(key) ?: throw IllegalStateException("person not found")).takeIf { it.startsWith("05") } ?: throw IllegalStateException("not a person")

    private fun peopleOf(a: JSONArray): List<String> {
        val acc = me()
        return (0 until a.length()).mapNotNull { i -> idOf(a.optLong(i)) ?: a.optString(i).lowercase().takeIf { it.matches(Regex("05[0-9a-f]{64}")) } }
            .filter { it.startsWith("05") && it != acc.id }.distinct()
    }

    /** A change notice to the group, signed with the group's key so the apps believe it. */
    private fun notice(g: Group, ts: Long, u: SessionProtos.GroupUpdateMessage.Builder) {
        val dm = SessionProtos.DataMessage.newBuilder().setTimestamp(ts).setGroupUpdateMessage(u)
        profile()?.let { dm.profile = it }
        deliver(g.id, ts, SessionProtos.Content.newBuilder().setDataMessage(dm))
        handle(SessionProtos.Content.newBuilder().setDataMessage(dm).build(), me().id, ts, g.id, "")
    }

    private fun memberNotice(g: Group, type: SessionProtos.GroupUpdateMemberChangeMessage.Type, ids: List<String>) {
        val ts = net.now()
        val sig = ED25519.sign(ed25519PrivateKey = adminOf(g), message = "MEMBER_CHANGE${type.number}$ts".toByteArray())
        notice(
            g, ts,
            SessionProtos.GroupUpdateMessage.newBuilder().setMemberChangeMessage(
                SessionProtos.GroupUpdateMemberChangeMessage.newBuilder().setType(type).addAllMemberSessionIds(ids.sorted())
                    .setAdminSignature(ByteString.copyFrom(sig)),
            ),
        )
    }

    /** Invitations, one to each person's own swarm, with a member key made for them. */
    private fun sendInvites(g: Group, ids: List<String>) {
        val admin = adminOf(g)
        val failed = ArrayList<String>()
        for (pid in ids) {
            val r = runCatching {
                val (name, auth) = synchronized(g) { keysOf(g); g.info!!.getName().orEmpty() to g.keys!!.makeSubAccount(pid, true, false) }
                val ts = net.now()
                val sig = ED25519.sign(ed25519PrivateKey = admin, message = "INVITE$pid$ts".toByteArray())
                val dm = SessionProtos.DataMessage.newBuilder().setTimestamp(ts).setGroupUpdateMessage(
                    SessionProtos.GroupUpdateMessage.newBuilder().setInviteMessage(
                        SessionProtos.GroupUpdateInviteMessage.newBuilder().setGroupSessionId(g.id).setName(name)
                            .setMemberAuthData(ByteString.copyFrom(auth)).setAdminSignature(ByteString.copyFrom(sig)),
                    ),
                )
                profile()?.let { dm.profile = it }
                deliver(pid, ts, SessionProtos.Content.newBuilder().setDataMessage(dm))
            }
            if (r.isFailure) { failed += pid; note("invite: ${r.exceptionOrNull()?.message}") }
            synchronized(g) {
                g.members!!.get(pid)?.let { m ->
                    val st = g.members!!.status(m)
                    if (st != GroupMember.Status.INVITE_ACCEPTED && !m.isAdminOrBeingPromoted(st)) {
                        if (r.isFailure) m.setInviteFailed() else m.setInviteSent()
                        g.members!!.set(m)
                    }
                }
            }
        }
        runCatching { pushConfigs(g) }
        if (failed.size == ids.size && ids.isNotEmpty()) throw IllegalStateException("οι προσκλήσεις δεν στάλθηκαν")
    }

    /** A new group with us as its only admin and these people invited. */
    private fun createGroup(title: String, people: JSONArray): JSONObject {
        val acc = me()
        val name = title.trim().ifEmpty { throw IllegalArgumentException("χρειάζεται όνομα") }
        val ids = peopleOf(people)
        if (ids.isEmpty()) throw IllegalArgumentException("διάλεξε τουλάχιστον ένα άτομο")
        val pair = ED25519.generate(ByteArray(32).also { java.security.SecureRandom().nextBytes(it) })
        val id = "03" + SessionNet.hexOf(pair.pubKey.data)
        val g = Group(id, ByteArray(0)).apply { admin = pair.secretKey.data; accepted = true; answered = true }
        val now = net.now()
        synchronized(g) {
            keysOf(g)
            val info = g.info!!
            val members = g.members!!
            info.setName(name)
            info.setCreated(now / 1000)
            for (pid in ids) {
                members.set(members.getOrConstruct(pid).apply { synchronized(lock) { names[pid] }?.let { n -> setName(n) }; setInvited() })
            }
            members.set(members.getOrConstruct(acc.id).apply { setName(myName); setPromotionAccepted() })
            g.keys!!.rekey(info.pointer, members.pointer)
        }
        pushConfigs(g)
        synchronized(lock) {
            groups[id] = g
            names[id] = name
            chats.getOrPut(id) { Chat(id) }.apply { this.name = name; lastMs = now }
        }
        emitChat(id)
        save()
        sendInvites(g, ids)
        runCatching { memberNotice(g, SessionProtos.GroupUpdateMemberChangeMessage.Type.ADDED, ids) }.onFailure { note("group notice: ${it.message}") }
        return JSONObject().put("key", keyOf(id)).put("thread", keyOf(id))
    }

    private fun renameGroup(g: Group, title: String) {
        val admin = adminOf(g)
        val name = title.trim().ifEmpty { throw IllegalArgumentException("χρειάζεται όνομα") }
        synchronized(g) { keysOf(g); g.info!!.setName(name) }
        pushConfigs(g)
        synchronized(lock) { chats[g.id]?.name = name; names[g.id] = name }
        emitChat(g.id)
        val ts = net.now()
        val type = SessionProtos.GroupUpdateInfoChangeMessage.Type.NAME
        val sig = ED25519.sign(ed25519PrivateKey = admin, message = "INFO_CHANGE${type.number}$ts".toByteArray())
        notice(
            g, ts,
            SessionProtos.GroupUpdateMessage.newBuilder().setInfoChangeMessage(
                SessionProtos.GroupUpdateInfoChangeMessage.newBuilder().setType(type).setUpdatedName(name)
                    .setAdminSignature(ByteString.copyFrom(sig)),
            ),
        )
    }

    private fun addMembers(g: Group, ids: List<String>) {
        adminOf(g)
        if (ids.isEmpty()) throw IllegalArgumentException("κανένα άτομο")
        val tokens = synchronized(g) {
            keysOf(g)
            val members = g.members!!
            for (pid in ids) {
                val old = members.get(pid)
                val st = old?.let { members.status(it) }
                val m = old ?: members.getOrConstruct(pid).apply { synchronized(lock) { names[pid] }?.let { n -> setName(n) } }
                if (st != GroupMember.Status.INVITE_ACCEPTED && !(old?.isAdminOrBeingPromoted(st ?: GroupMember.Status.INVITE_UNKNOWN) ?: false)) m.setInvited()
                members.set(m)
            }
            g.keys!!.rekey(g.info!!.pointer, members.pointer)
            ids.map { g.keys!!.getSubAccountToken(it, true, false) }
        }
        // Someone removed earlier gets a working member key again.
        runCatching { adminCall(g, "unrevoke_subaccount", tokens) }.onFailure { note("unrevoke: ${it.message}") }
        pushConfigs(g)
        sendInvites(g, ids)
        runCatching { memberNotice(g, SessionProtos.GroupUpdateMemberChangeMessage.Type.ADDED, ids) }.onFailure { note("group notice: ${it.message}") }
    }

    /**
     * Takes people out: their member keys revoked, word left for them in the group's "revoked"
     * namespace, then the members list and a new key without them.
     */
    private fun dropMembers(g: Group, ids: List<String>, notice: Boolean) {
        val admin = adminOf(g)
        val (tokens, generation) = synchronized(g) {
            keysOf(g)
            ids.map { g.keys!!.getSubAccountToken(it, true, false) } to g.keys!!.currentGeneration()
        }
        adminCall(g, "revoke_subaccount", tokens)
        runCatching {
            val word = MultiEncrypt.encryptForMultipleSimple(
                messages = Array(ids.size) { SessionNet.hex(ids[it].drop(2)) + generation.toString().toByteArray() },
                recipients = Array(ids.size) { SessionNet.hex(ids[it].drop(2)) },
                ed25519SecretKey = admin, domain = MultiEncrypt.KICKED_DOMAIN,
            )
            storeIn(g, Namespace.REVOKED_GROUP_MESSAGES(), word, 14L * 24 * 60 * 60 * 1000)
        }.onFailure { note("kick word: ${it.message}") }
        synchronized(g) {
            for (pid in ids) g.members!!.erase(pid)
            g.keys!!.rekey(g.info!!.pointer, g.members!!.pointer)
        }
        pushConfigs(g)
        if (notice) runCatching { memberNotice(g, SessionProtos.GroupUpdateMemberChangeMessage.Type.REMOVED, ids) }.onFailure { note("group notice: ${it.message}") }
    }

    private fun removeMember(g: Group, pid: String) {
        if (pid == me().id) throw IllegalStateException("για να φύγεις, «Αποχώρηση από την ομάδα»")
        dropMembers(g, listOf(pid), notice = true)
    }

    /** Makes someone an admin: they get the group's key seed in their own swarm. Session has no way back. */
    private fun promote(g: Group, pid: String, admin: Boolean) {
        val key = adminOf(g)
        if (!admin) throw IllegalStateException("το Session δεν αφαιρεί διαχειριστές")
        val name = synchronized(g) {
            keysOf(g)
            g.members!!.get(pid)?.let { m -> m.setPromoted(); g.members!!.set(m) } ?: throw IllegalStateException("δεν είναι μέλος")
            g.info!!.getName().orEmpty()
        }
        val ts = net.now()
        val dm = SessionProtos.DataMessage.newBuilder().setTimestamp(ts).setGroupUpdateMessage(
            SessionProtos.GroupUpdateMessage.newBuilder().setPromoteMessage(
                SessionProtos.GroupUpdatePromoteMessage.newBuilder().setGroupIdentitySeed(ByteString.copyFrom(key, 0, 32)).setName(name),
            ),
        )
        profile()?.let { dm.profile = it }
        val r = runCatching { deliver(pid, ts, SessionProtos.Content.newBuilder().setDataMessage(dm)) }
        synchronized(g) {
            g.members!!.get(pid)?.let { m -> if (r.isFailure) m.setPromotionFailed() else m.setPromotionSent(); g.members!!.set(m) }
        }
        pushConfigs(g)
        r.getOrThrow()
        runCatching { memberNotice(g, SessionProtos.GroupUpdateMemberChangeMessage.Type.PROMOTED, listOf(pid)) }.onFailure { note("group notice: ${it.message}") }
    }

    /**
     * Leaves: the members see it, and an admin takes us out of the list. The last admin cannot
     * leave (the group would have no one to manage it); they make someone else admin first.
     */
    private fun leaveGroup(g: Group) {
        val acc = me()
        if (g.admin != null) {
            val others = synchronized(g) { keysOf(g); g.members!!.all().count { it.admin && it.accountId() != acc.id } }
            if (others == 0) throw IllegalStateException("είσαι ο μόνος διαχειριστής: κάνε πρώτα κάποιον άλλον διαχειριστή")
        }
        if (g.accepted) {
            for (b in listOf(
                SessionProtos.GroupUpdateMessage.newBuilder().setMemberLeftNotificationMessage(SessionProtos.GroupUpdateMemberLeftNotificationMessage.getDefaultInstance()),
                SessionProtos.GroupUpdateMessage.newBuilder().setMemberLeftMessage(SessionProtos.GroupUpdateMemberLeftMessage.getDefaultInstance()),
            )) {
                val ts = net.now()
                val dm = SessionProtos.DataMessage.newBuilder().setTimestamp(ts).setGroupUpdateMessage(b)
                runCatching { deliver(g.id, ts, SessionProtos.Content.newBuilder().setDataMessage(dm)) }.onFailure { note("leave: ${it.message}") }
            }
        }
        g.gone = true
        val now = net.now()
        addMessage(g.id, Msg("ss:$now:${acc.id}", acc.id, "🚪 Αποχώρησες από την ομάδα.", now, true, JSONArray(), null), incoming = false)
        save()
    }

    private fun setName(id: String, name: String) {
        val changed = synchronized(lock) {
            val old = names[id]
            names[id] = name
            chats[id]?.name = name
            old != name
        }
        if (changed) { emitChat(id); save() }
    }

    private fun nameOf(id: String): String = synchronized(lock) { names[id] } ?: short(id)

    private fun short(id: String) = id.take(6) + "…" + id.takeLast(4)

    private fun timerText(secs: Int): String {
        val (n, one, many) = when {
            secs % 604_800 == 0 -> Triple(secs / 604_800, "εβδομάδα", "εβδομάδες")
            secs % 86_400 == 0 -> Triple(secs / 86_400, "ημέρα", "ημέρες")
            secs % 3_600 == 0 -> Triple(secs / 3_600, "ώρα", "ώρες")
            secs % 60 == 0 -> Triple(secs / 60, "λεπτό", "λεπτά")
            else -> Triple(secs, "δευτερόλεπτο", "δευτερόλεπτα")
        }
        return "$n ${if (n == 1) one else many}"
    }

    private fun findMsg(id: String): Msg? = chats.values.firstNotNullOfOrNull { c -> c.messages.firstOrNull { it.id == id } }

    private fun addMessage(chatId: String, m: Msg, incoming: Boolean) {
        synchronized(lock) {
            val c = chats.getOrPut(chatId) { Chat(chatId).apply { name = names[chatId].orEmpty() } }
            if (m.id in gone || c.messages.any { it.id == m.id }) return
            c.messages.add(m)
            c.messages.sortBy { it.ms }
            if (m.ms >= c.lastMs) {
                c.lastMs = m.ms
                c.snippet = m.text.ifEmpty { "📎" }
            }
            if (incoming && isNew(m.ms, c.readMs)) {
                c.unread = true
                if (!c.answered && c.messages.none { it.mine }) c.theyAsked = true
            }
        }
        emitChat(chatId)
        emitMessage(chatId, m)
        save()
    }

    private fun emitChat(chatId: String) {
        val o = synchronized(lock) {
            val c = chats[chatId] ?: return
            JSONObject().put("key", keyOf(c.id)).put("name", c.name.ifEmpty { names[c.id] ?: short(c.id) })
                .put("snippet", c.snippet).put("lastMs", c.lastMs).put("encrypted", true).put("group", isGroup(c.id))
                .put("unread", c.unread).put("pinned", c.pinned).put("network", "session")
        }
        emit(JSONObject().put("type", "thread").put("thread", o))
    }

    private fun emitMessage(chatId: String, m: Msg) {
        val poll = pollIn(m.text)
        if (poll != null) {
            val pid = pollKey(m.id)
            val opts = JSONArray()
            poll.second.forEachIndexed { i, t -> opts.put(JSONObject().put("id", i + 1).put("text", t)) }
            emit(JSONObject().put("type", "poll").put("poll", pid).put("id", m.id).put("question", poll.first).put("options", opts))
        }
        val o = JSONObject().put("thread", keyOf(chatId)).put("id", m.id).put("sender", keyOf(m.sender))
            .put("name", if (m.mine) "" else nameOf(m.sender)).put("text", if (poll != null) "" else m.text).put("ms", m.ms)
            .put("mine", m.mine).put("encrypted", true)
        if (m.atts.length() > 0) o.put("attachments", m.atts)
        m.replyTo?.let { o.put("replyTo", it) }
        if (m.expires > 0) o.put("expiresIn", m.expires).put("expireFrom", if (m.expireFromRead) "read" else "send")
        emit(JSONObject().put("type", "message").put("message", o))
        if (poll != null) emitVotes(m)
    }

    // ---- calls ----

    /**
     * A call message (WebRTC, as the official apps send it): handed to the app as a "sessionCall"
     * event. Only from people we talk with (the official apps ring only for accepted contacts),
     * and not when older than 15 minutes.
     */
    private fun takeCall(m: SessionProtos.CallMessage, sender: String, ts: Long) {
        if (ts + 15 * 60 * 1000 < net.now()) return
        val known = synchronized(lock) { chats[sender]?.let { c -> c.answered || c.messages.any { it.mine } } ?: false }
        if (!known) {
            if (m.type == SessionProtos.CallMessage.Type.PRE_OFFER) note("call from someone not accepted yet: ignored")
            return
        }
        val kind = when (m.type) {
            SessionProtos.CallMessage.Type.PRE_OFFER -> "preOffer"
            SessionProtos.CallMessage.Type.OFFER -> "offer"
            SessionProtos.CallMessage.Type.ANSWER -> "answer"
            SessionProtos.CallMessage.Type.ICE_CANDIDATES -> "ice"
            SessionProtos.CallMessage.Type.END_CALL -> "end"
            else -> return
        }
        emit(
            JSONObject().put("type", "sessionCall").put("kind", kind).put("callId", m.uuid)
                .put("thread", keyOf(sender)).put("name", nameOf(sender)).put("ms", ts)
                .put("sdps", JSONArray(m.sdpsList)).put("lines", JSONArray(m.sdpMLineIndexesList)).put("mids", JSONArray(m.sdpMidsList)),
        )
    }

    /** Sends one call message: kind preOffer, offer, answer, ice or end, with its SDPs. */
    private fun callSend(a: JSONObject) {
        val to = chatFor(a.optLong("thread"))
        if (isGroup(to)) throw IllegalStateException("Session calls are one-to-one")
        val type = when (a.optString("kind")) {
            "preOffer" -> SessionProtos.CallMessage.Type.PRE_OFFER
            "offer" -> SessionProtos.CallMessage.Type.OFFER
            "answer" -> SessionProtos.CallMessage.Type.ANSWER
            "ice" -> SessionProtos.CallMessage.Type.ICE_CANDIDATES
            "end" -> SessionProtos.CallMessage.Type.END_CALL
            else -> throw IllegalArgumentException("unknown call message")
        }
        val m = SessionProtos.CallMessage.newBuilder().setType(type).setUuid(a.getString("callId"))
        fun strings(k: String) = a.optJSONArray(k)?.let { j -> (0 until j.length()).map { j.optString(it) } }.orEmpty()
        m.addAllSdps(strings("sdps"))
        m.addAllSdpMids(strings("mids"))
        a.optJSONArray("lines")?.let { j -> for (i in 0 until j.length()) m.addSdpMLineIndexes(j.optInt(i)) }
        deliver(to, net.now(), SessionProtos.Content.newBuilder().setCallMessage(m))
    }

    // ---- polls and pins ----

    /**
     * Session has no polls: a poll is a message official apps read as text (the question, then
     * one line per option starting 1️⃣, 2️⃣ …), and a vote is a reaction with that number, so
     * people on the official apps can vote too. One vote each (Session keeps one reaction).
     */
    private val keycaps = listOf("1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟")
    private val pollIds = HashMap<Long, String>()

    private fun pollIn(text: String): Pair<String, List<String>>? {
        if (!text.startsWith("📊 ")) return null
        val lines = text.lines()
        val opts = ArrayList<String>()
        for (l in lines.drop(1)) {
            val i = opts.size
            when {
                i < keycaps.size && l.startsWith(keycaps[i] + " ") -> opts += l.removePrefix(keycaps[i] + " ").trim()
                l.isBlank() || l.startsWith("↳") -> {}
                else -> return null
            }
        }
        return if (opts.size >= 2) lines[0].removePrefix("📊 ").trim() to opts else null
    }

    private fun pollKey(msgId: String): Long {
        val d = MessageDigest.getInstance("SHA-256").digest(("erevos-session-poll:" + msgId).toByteArray())
        var v = 0L
        for (i in 0 until 8) v = (v shl 8) or (d[i].toLong() and 0xff)
        val k = v and Long.MAX_VALUE
        synchronized(lock) { pollIds[k] = msgId }
        return k
    }

    private fun emitVotes(m: Msg) {
        val n = pollIn(m.text)?.second?.size ?: return
        val votes = JSONObject()
        synchronized(lock) {
            for ((who, emoji) in m.reactions) {
                val i = keycaps.indexOf(emoji)
                if (i in 0 until n) votes.put(keyOf(who).toString(), JSONArray().put(i + 1))
            }
        }
        emit(JSONObject().put("type", "pollState").put("poll", pollKey(m.id)).put("votes", votes))
    }

    private fun createPoll(key: Long, question: String, options: JSONArray): JSONObject {
        val q = question.trim().replace('\n', ' ')
        val opts = (0 until options.length()).map { options.optString(it).trim().replace('\n', ' ') }.filter { it.isNotEmpty() }.distinct()
        if (q.isEmpty() || opts.size < 2) throw IllegalArgumentException("χρειάζονται ερώτηση και δύο επιλογές")
        if (opts.size > keycaps.size) throw IllegalArgumentException("έως ${keycaps.size} επιλογές")
        val text = buildString {
            append("📊 ").append(q)
            opts.forEachIndexed { i, o -> append('\n').append(keycaps[i]).append(' ').append(o) }
            append("\n↳ Ψήφισε με αντίδραση: ").append(keycaps.take(opts.size).joinToString(" "))
        }
        return sendText(key, text, "")
    }

    private fun votePoll(poll: Long, selected: JSONArray) {
        val id = synchronized(lock) { pollIds[poll] } ?: throw IllegalStateException("poll not found")
        val choice = (0 until selected.length()).map { selected.optInt(it) }.lastOrNull { it in 1..keycaps.size }
        val mine = synchronized(lock) { findMsg(id)?.reactions?.get(me().id) }
        if (choice == null) {
            if (mine != null && mine in keycaps) react(id, "")
        } else {
            react(id, keycaps[choice - 1])
        }
        synchronized(lock) { findMsg(id) }?.let { emitVotes(it) }
    }

    /** Pins on this phone only (Session has no pins), one per chat. */
    private fun pin(id: String, on: Boolean) {
        val chatId = chatOfMsg(id)
        synchronized(lock) { chats[chatId]?.pinned = if (on) id else "" }
        emit(JSONObject().put("type", "pinned").put("thread", keyOf(chatId)).put("id", if (on) id else ""))
        emitChat(chatId)
        save()
    }

    private fun messages(key: Long): Int {
        val chatId = idOf(key) ?: return 0
        val list = synchronized(lock) { chats[chatId]?.messages?.takeLast(300)?.toList() } ?: return 0
        for (m in list) {
            emitMessage(chatId, m)
            for ((who, emoji) in synchronized(lock) { m.reactions.toMap() }) {
                emit(JSONObject().put("type", "reaction").put("id", m.id).put("actor", keyOf(who)).put("emoji", emoji))
            }
        }
        return list.size
    }

    // ---- attachments ----

    private fun attJson(p: SessionProtos.AttachmentPointer, url: String): JSONObject {
        val mime = p.contentType
        val voice = p.flags and 1 != 0
        val kind = when {
            mime.startsWith("image/") -> "image"
            mime.startsWith("video/") -> "video"
            mime.startsWith("audio/") -> "audio"
            else -> "file"
        }
        return JSONObject().put("kind", kind).put("url", url).put("playUrl", url).put("mime", mime)
            .put("w", p.width).put("h", p.height).put("name", p.fileName).put("title", if (voice) "voice" else "")
    }

    private fun mediaFile(id: String, i: Int): File =
        File(dir, "media/" + id.replace(Regex("[^A-Za-z0-9]"), "_") + "_" + i)

    private fun fetch(chatId: String, id: String, i: Int, p: SessionProtos.AttachmentPointer) {
        val f = mediaFile(id, i)
        if (f.exists()) { setAtt(chatId, id, i, p, f); return }
        work.execute {
            try {
                val url = p.url
                val fileId = url.substringAfter("/file/").substringBefore('#').substringBefore('?')
                val frag = url.substringAfter('#', "")
                val fragments = frag.split('&')
                val serverEd = fragments.firstOrNull { it.startsWith("p=") }?.substringAfter("p=") ?: SessionNet.FILE_ED
                val host = url.substringAfter("://").substringBefore('/').substringBefore(':')
                val (code, body) = net.server(host, serverEd, "GET", "/file/$fileId", null)
                if (code !in 200..299) throw IllegalStateException("file server $code")
                val plain = if ("d" in fragments || "d=" in fragments) {
                    val out = ByteArray(Attachments.decryptedMaxSizeOrNull(body.size.toLong())?.toInt() ?: throw IllegalStateException("too small"))
                    val n = Attachments.decryptBytes(key = p.key.toByteArray(), cipherIn = body, plainOut = out)
                    out.copyOf(n.toInt())
                } else {
                    legacyDecrypt(body, p.key.toByteArray(), if (p.hasDigest()) p.digest.toByteArray() else null, p.size)
                }
                f.parentFile?.mkdirs()
                f.writeBytes(plain)
                setAtt(chatId, id, i, p, f)
            } catch (e: Exception) {
                note("download: ${e.message}")
            }
        }
    }

    private fun setAtt(chatId: String, id: String, i: Int, p: SessionProtos.AttachmentPointer, f: File) {
        val m = synchronized(lock) {
            val m = findMsg(id) ?: return
            if (i < m.atts.length()) m.atts.put(i, attJson(p, "file://" + f.absolutePath))
            m
        }
        emitMessage(chatId, m)
        save()
    }

    /** The older attachments: AES-CBC with HMAC-SHA256 (Signal's), then padding cut to the real size. */
    private fun legacyDecrypt(data: ByteArray, key: ByteArray, digest: ByteArray?, size: Int): ByteArray {
        require(key.size == 64 && data.size > 16 + 32)
        if (digest != null && !MessageDigest.isEqual(MessageDigest.getInstance("SHA-256").digest(data), digest)) {
            throw IllegalStateException("digest")
        }
        val mac = Mac.getInstance("HmacSHA256").apply { init(SecretKeySpec(key, 32, 32, "HmacSHA256")) }
        val body = data.copyOfRange(0, data.size - 32)
        if (!MessageDigest.isEqual(mac.doFinal(body), data.copyOfRange(data.size - 32, data.size))) throw IllegalStateException("mac")
        val c = Cipher.getInstance("AES/CBC/PKCS5Padding")
        c.init(Cipher.DECRYPT_MODE, SecretKeySpec(key, 0, 32, "AES"), IvParameterSpec(body, 0, 16))
        val plain = c.doFinal(body, 16, body.size - 16)
        return if (size in 1..plain.size) plain.copyOf(size) else plain
    }

    private fun upload(bytes: ByteArray): Pair<String, ByteArray> {
        if (bytes.size > 10_000_000) throw IllegalArgumentException("Session takes files up to 10 MB")
        val acc = me()
        val out = ByteArray(Attachments.encryptedSize(bytes.size.toLong()).toInt())
        val key = Attachments.encryptBytes(seed = acc.edSecret.copyOf(32), plaintextIn = bytes, cipherOut = out, domain = Attachments.Domain.Attachment)
        val (code, body) = net.server(
            SessionNet.FILE_HOST, SessionNet.FILE_ED, "POST", "/file", out,
            JSONObject().put("Content-Disposition", "attachment").put("Content-Type", "application/octet-stream"),
        )
        if (code !in 200..299) throw IllegalStateException("file server $code")
        val fileId = JSONObject(String(body)).getString("id")
        return "http://${SessionNet.FILE_HOST}/file/$fileId#d" to key
    }

    // ---- sending ----

    private fun profile(): SessionProtos.LokiProfile? = myName.takeIf { it.isNotEmpty() }?.let {
        SessionProtos.LokiProfile.newBuilder().setDisplayName(it).build()
    }

    /** Encrypts a Content for one person and stores it in their swarm. */
    private fun deliver(to: String, ts: Long, content: SessionProtos.Content.Builder): Long {
        if (isGroup(to)) return deliverToGroup(to, ts, content)
        val acc = me()
        content.sigTimestamp = ts
        // Visible messages follow the chat's disappearing setting; they also live no longer in the swarm.
        // Call messages matter for minutes only (as in the official apps).
        var ttl = if (content.hasCallMessage()) 5L * 60 * 1000 else 14L * 24 * 60 * 60 * 1000
        var expires = 0L
        if (content.hasDataMessage() && !content.dataMessage.hasReaction() && !content.dataMessage.hasGroupUpdateMessage()) {
            val (type, secs) = synchronized(lock) { chats[to]?.let { it.expireType to it.expireSecs } ?: (0 to 0) }
            if (type != 0 && secs > 0) {
                content.expirationType = SessionProtos.Content.ExpirationType.forNumber(type)
                content.expirationTimer = secs
                expires = secs.toLong()
                if (type == 2) ttl = minOf(ttl, secs * 1000L)
            }
        }
        val plain = content.build().toByteArray()
        val payload = SessionProtocol.encodeFor1o1(
            plaintext = plain, myEd25519PrivKey = acc.edSecret, timestampMs = ts,
            recipientPubKey = SessionNet.hex(to), proRotatingEd25519PrivKey = null,
        )
        val p = JSONObject().put("pubkey", to).put("data", Base64.encodeToString(payload, Base64.NO_WRAP))
            .put("ttl", ttl).put("timestamp", ts)
        net.toSwarm(to, "store", p)
        return expires
    }

    /**
     * Encrypts a Content with a group's current key and stores it in the group's swarm, signed
     * with our member key. Disappearing follows the group's setting (always after sending).
     */
    private fun deliverToGroup(to: String, ts: Long, content: SessionProtos.Content.Builder): Long {
        val acc = me()
        val g = synchronized(lock) { groups[to] } ?: throw IllegalStateException("group not found")
        if (g.gone) throw IllegalStateException("δεν είσαι πια μέλος αυτής της ομάδας")
        content.sigTimestamp = ts
        var ttl = 14L * 24 * 60 * 60 * 1000
        var expires = 0L
        if (content.hasDataMessage() && !content.dataMessage.hasReaction() && !content.dataMessage.hasGroupUpdateMessage()) {
            val secs = synchronized(lock) { chats[to]?.expireSecs ?: 0 }
            if (secs > 0) {
                content.expirationType = SessionProtos.Content.ExpirationType.DELETE_AFTER_SEND
                content.expirationTimer = secs
                expires = secs.toLong()
                ttl = minOf(ttl, secs * 1000L)
            }
        }
        val plain = content.build().toByteArray()
        val ns = Namespace.GROUP_MESSAGES()
        val payload = synchronized(g) {
            val keys = keysOf(g)
            if (keys.groupKeys().isEmpty()) throw IllegalStateException("η ομάδα δεν έχει διαβαστεί ακόμα, δοκίμασε σε λίγο")
            SessionProtocol.encodeForGroup(
                plaintext = plain, myEd25519PrivKey = acc.edSecret, timestampMs = ts,
                groupEd25519PublicKey = g.pub33, groupEd25519PrivateKey = keys.groupEncKey(), proRotatingEd25519PrivKey = null,
            )
        }
        storeIn(g, ns, payload, ttl)
        return expires
    }

    /** Our first answer to someone who wrote first also accepts their request. */
    private fun acceptIfAsked(to: String) {
        if (isGroup(to)) { acceptGroup(to); return }
        val ask = synchronized(lock) { chats[to]?.let { it.theyAsked && !it.answered } ?: false }
        if (!ask) return
        val b = SessionProtos.MessageRequestResponse.newBuilder().setIsApproved(true)
        profile()?.let { b.profile = it }
        deliver(to, net.now(), SessionProtos.Content.newBuilder().setMessageRequestResponse(b))
        synchronized(lock) { chats[to]?.answered = true }
    }

    private fun chatFor(key: Long): String = idOf(key) ?: throw IllegalStateException("chat not found")

    private fun quoteOf(replyTo: String): SessionProtos.DataMessage.Quote? {
        if (!replyTo.startsWith("ss:")) return null
        val (ts, author) = replyTo.removePrefix("ss:").split(':', limit = 2).let { (it[0].toLongOrNull() ?: return null) to it.getOrElse(1) { "" } }
        val text = synchronized(lock) { findMsg(replyTo)?.text }.orEmpty()
        return SessionProtos.DataMessage.Quote.newBuilder().setId(ts).setAuthor(author).setText(text).build()
    }

    private fun replyJson(replyTo: String): JSONObject? {
        val q = quoteOf(replyTo) ?: return null
        return JSONObject().put("id", replyTo).put("text", q.text).put("sender", keyOf(q.author))
            .put("name", if (q.author == me().id) "" else nameOf(q.author))
    }

    private fun sendText(key: Long, text: String, replyTo: String): JSONObject {
        val to = chatFor(key)
        val ts = net.now()
        acceptIfAsked(to)
        val dm = SessionProtos.DataMessage.newBuilder().setBody(text).setTimestamp(ts)
        quoteOf(replyTo)?.let { dm.quote = it }
        profile()?.let { dm.profile = it }
        val expires = deliver(to, ts, SessionProtos.Content.newBuilder().setDataMessage(dm))
        val id = "ss:$ts:${me().id}"
        addMessage(to, Msg(id, me().id, text, ts, true, JSONArray(), replyJson(replyTo)).also { it.expires = expires }, incoming = false)
        return JSONObject().put("id", id).put("ms", ts)
    }

    private fun sendMedia(a: JSONObject): JSONObject {
        val to = chatFor(a.optLong("thread"))
        val src = File(a.getString("path"))
        val bytes = src.readBytes()
        val mime = a.optString("mime").ifEmpty { "application/octet-stream" }
        val voice = mime.startsWith("audio/") && (a.optBoolean("voice") || a.optLong("durationMs") > 0)
        val (url, key) = upload(bytes)
        val ptr = SessionProtos.AttachmentPointer.newBuilder()
            .setId(0).setContentType(mime).setKey(ByteString.copyFrom(key)).setSize(bytes.size)
            .setFileName(a.optString("name").ifEmpty { src.name }).setUrl(url)
            .setWidth(a.optInt("w")).setHeight(a.optInt("h"))
        if (voice) ptr.flags = 1
        a.optString("caption").takeIf { it.isNotEmpty() }?.let { ptr.caption = it }
        val ts = net.now()
        acceptIfAsked(to)
        val dm = SessionProtos.DataMessage.newBuilder().setTimestamp(ts).addAttachments(ptr)
        a.optString("caption").takeIf { it.isNotEmpty() }?.let { dm.body = it }
        quoteOf(a.optString("replyTo"))?.let { dm.quote = it }
        profile()?.let { dm.profile = it }
        val expires = deliver(to, ts, SessionProtos.Content.newBuilder().setDataMessage(dm))
        val id = "ss:$ts:${me().id}"
        // Our own copy, kept here, so the picture shows without downloading it again.
        val f = mediaFile(id, 0)
        f.parentFile?.mkdirs()
        src.copyTo(f, overwrite = true)
        val atts = JSONArray().put(attJson(ptr.build(), "file://" + f.absolutePath))
        addMessage(to, Msg(id, me().id, a.optString("caption"), ts, true, atts, replyJson(a.optString("replyTo"))).also { it.expires = expires }, incoming = false)
        return JSONObject().put("id", id).put("ms", ts)
    }

    private fun parts(id: String): Pair<Long, String> {
        val rest = id.removePrefix("ss:")
        return (rest.substringBefore(':').toLongOrNull() ?: throw IllegalArgumentException("bad id")) to rest.substringAfter(':')
    }

    private fun chatOfMsg(id: String): String =
        synchronized(lock) { chats.values.firstOrNull { c -> c.messages.any { it.id == id } }?.id } ?: throw IllegalStateException("message not found")

    private fun react(id: String, emoji: String): Boolean {
        val (ts, author) = parts(id)
        val to = chatOfMsg(id)
        val r = SessionProtos.DataMessage.Reaction.newBuilder().setId(ts).setAuthor(author)
            .setEmoji(emoji.ifEmpty { synchronized(lock) { findMsg(id)?.reactions?.get(me().id) }.orEmpty() })
            .setAction(if (emoji.isEmpty()) SessionProtos.DataMessage.Reaction.Action.REMOVE else SessionProtos.DataMessage.Reaction.Action.REACT)
        val now = net.now()
        deliver(to, now, SessionProtos.Content.newBuilder().setDataMessage(SessionProtos.DataMessage.newBuilder().setTimestamp(now).setReaction(r)))
        synchronized(lock) { findMsg(id)?.let { if (emoji.isEmpty()) it.reactions.remove(me().id) else it.reactions[me().id] = emoji } }
        save()
        return true
    }

    private fun unsend(id: String): Boolean {
        val (ts, author) = parts(id)
        if (author != me().id) throw IllegalStateException("only your own messages")
        val to = chatOfMsg(id)
        deliver(to, net.now(), SessionProtos.Content.newBuilder().setUnsendRequest(
            SessionProtos.UnsendRequest.newBuilder().setTimestamp(ts).setAuthor(author),
        ))
        return deleteForMe(id)
    }

    private fun deleteForMe(id: String): Boolean {
        val chatId = chatOfMsg(id)
        synchronized(lock) {
            chats[chatId]?.messages?.removeIf { it.id == id }
            forget(id)
        }
        mediaFile(id, 0).parentFile?.listFiles { f -> f.name.startsWith(id.replace(Regex("[^A-Za-z0-9]"), "_") + "_") }?.forEach { it.delete() }
        emit(JSONObject().put("type", "deleted").put("thread", keyOf(chatId)).put("id", id).put("forMe", true))
        save()
        return true
    }

    private fun forward(id: String, to: JSONArray): Boolean {
        val m = synchronized(lock) { findMsg(id) } ?: throw IllegalStateException("message not found")
        var sent = 0
        for (i in 0 until to.length()) {
            val key = to.getLong(i)
            if (!isKey(key)) continue
            val local = (0 until m.atts.length()).map { m.atts.getJSONObject(it) }.firstOrNull { it.optString("url").startsWith("file://") }
            if (local != null) {
                sendMedia(JSONObject().put("thread", key).put("path", local.getString("url").removePrefix("file://"))
                    .put("mime", local.optString("mime")).put("name", local.optString("name"))
                    .put("w", local.optInt("w")).put("h", local.optInt("h")).put("caption", m.text))
                sent++
            } else if (m.text.isNotEmpty()) {
                sendText(key, m.text, "")
                sent++
            }
        }
        if (sent == 0) throw IllegalStateException("nothing to forward to these chats")
        return true
    }

    /** Must hold [lock]. */
    private fun forget(id: String) {
        gone.add(id)
        while (gone.size > KEEP_SEEN) gone.remove(gone.first())
    }

    /** Must hold [lock]: the chat read up to its newest message of theirs. */
    private fun read(c: Chat) {
        c.unread = false
        c.readMs = maxOf(c.readMs, c.messages.filter { !it.mine }.maxOfOrNull { it.ms } ?: 0L)
    }

    // A read is written at once, not 2 s later: closed before that, the chat came back unread.
    private fun markRead(key: Long) {
        val chatId = idOf(key) ?: return
        synchronized(lock) { chats[chatId]?.let { read(it) } }
        emitChat(chatId)
        work.execute(saveSoon)
    }

    private fun markAll() {
        val ids = synchronized(lock) { chats.values.filter { it.unread }.onEach { read(it) }.map { it.id } }
        ids.forEach { emitChat(it) }
        work.execute(saveSoon)
    }

    private fun contacts(): JSONArray {
        val out = JSONArray()
        synchronized(lock) {
            for (c in chats.values) if (!isGroup(c.id)) out.put(JSONObject().put("id", keyOf(c.id)).put("name", c.name.ifEmpty { names[c.id] ?: short(c.id) }).put("network", "session"))
        }
        return out
    }

    /** A Session ID (66 hex characters starting 05) or an ONS name. */
    private fun search(query: String): JSONArray {
        val q = query.trim().lowercase()
        val out = JSONArray()
        synchronized(lock) {
            for (c in chats.values) {
                if (isGroup(c.id)) continue
                val n = c.name.ifEmpty { names[c.id].orEmpty() }
                if (n.lowercase().contains(q) || c.id.startsWith(q)) out.put(JSONObject().put("id", keyOf(c.id)).put("name", n.ifEmpty { short(c.id) }).put("network", "session"))
            }
        }
        if (q.matches(Regex("05[0-9a-f]{64}"))) {
            if ((0 until out.length()).none { out.getJSONObject(it).getLong("id") == keyOf(q) }) {
                out.put(JSONObject().put("id", keyOf(q)).put("name", nameOf(q)).put("network", "session"))
            }
        } else if (q.length in 3..64 && q.matches(Regex("[a-z0-9_-]+"))) {
            runCatching { ons(q) }.getOrNull()?.let { id ->
                synchronized(lock) { names.putIfAbsent(id, q) }
                out.put(JSONObject().put("id", keyOf(id)).put("name", q).put("network", "session"))
            }
        }
        return out
    }

    private fun ons(name: String): String? {
        val all = net.nodes()
        val hash = Hash.hash32(name.toByteArray())
        val r = net.rpc(
            all.random(), "oxend_request",
            JSONObject().put("endpoint", "ons_resolve").put(
                "params", JSONObject().put("type", 0).put("name_hash", Base64.encodeToString(hash, Base64.NO_WRAP)),
            ),
        )
        val res = r.optJSONObject("result") ?: return null
        val value = res.optString("encrypted_value").ifEmpty { return null }
        val nonce = res.optString("nonce")
        return SessionEncrypt.decryptOnsResponse(
            lowercaseName = name, ciphertext = SessionNet.hex(value), nonce = nonce.takeIf { it.isNotEmpty() }?.let { SessionNet.hex(it) },
        ).takeIf { it.startsWith("05") }
    }

    private fun startChat(a: JSONObject): JSONObject {
        val key = a.optLong("person").takeIf { it != 0L } ?: a.optString("id").toLongOrNull() ?: 0L
        val id = idOf(key) ?: a.optString("id").lowercase().takeIf { it.matches(Regex("05[0-9a-f]{64}")) }
            ?: throw IllegalStateException("person not found")
        val name = a.optString("name")
        synchronized(lock) {
            if (name.isNotEmpty() && !name.contains('…')) names.putIfAbsent(id, name)
            chats.getOrPut(id) { Chat(id).apply { this.name = names[id].orEmpty(); lastMs = net.now() } }
        }
        emitChat(id)
        save()
        return JSONObject().put("key", keyOf(id)).put("thread", keyOf(id))
    }

    /** What an event of the engine's own means for the Session screens; false if it is not one. */
    fun takeOwn(e: JSONObject): Boolean {
        if (e.optString("type") == "status" && e.optString("network") == "session") {
            status = e.optString("status")
            return true
        }
        return false
    }
}

/** Swarm message hashes, and taken-away message ids, kept so a swarm handing them out again changes nothing. */
private const val KEEP_SEEN = 5000

/** A message of theirs makes its chat unread only when it is after what was read there. */
private fun isNew(ms: Long, readMs: Long) = ms > readMs
