<!--
SPDX-FileCopyrightText: 2026 azzinder
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Erevos protocol

The wire formats, key derivations and nonce handling of Erevos, as the code has them, for whoever
reviews it. **Not audited.** Where this page and the code differ, the code is right and this page
is a bug. Every section names the file it comes from.

Diagrams of the states: [state-machines.md](state-machines.md). Who learns what:
[threat-model.md](threat-model.md). Where to start a review: [security-review.md](security-review.md).

Notation: `‖` is concatenation, `be32` a 4-byte big-endian integer, `HKDF(salt, ikm, info, L)` is
HKDF-SHA256 (RFC 5869), `HMAC` is HMAC-SHA256. Sizes are in bytes.

## 1. Primitives

| Use | Primitive | Crate / library |
| --- | --- | --- |
| Key agreement | X25519 | `x25519-dalek` |
| Post-quantum KEM | ML-KEM-768 (FIPS 203) | `ml-kem` |
| Signatures | Ed25519, checked with `verify_strict`; XEdDSA for the binding below | `ed25519-dalek` |
| KDF | HKDF-SHA256 | `hkdf`, `sha2` |
| Message AEAD | ChaCha20-Poly1305 | `chacha20poly1305` |
| Sealed packets (app) | AES-256-GCM, HKDF/HMAC-SHA256 | `@noble/hashes`, platform AES |
| Groups | MLS (RFC 9420), `MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519` | OpenMLS 0.9 |
| Password slots | PBKDF2-SHA256 200,000 rounds, then Argon2id 32 MiB, 3 passes | platform / `@noble/hashes` |

All secrets in the Rust core are zeroized on drop. The core keeps no state between calls: the app
passes each state in as bytes and stores what comes back, sealed (see §9).

## 2. Identity and prekeys

`crates/erevos-core/src/pqxdh.rs`, `bind.rs`, `conversation.rs`

An identity has two key pairs: an Ed25519 key (`verify`) that signs, and an X25519 key (`IKdh`)
used in the handshake. `bind.rs` ties them: an XEdDSA signature by the X25519 identity over the
context `"bind"` and `IKdh ‖ verify`, so a bundle cannot pair someone's X25519 identity with
another's Ed25519 key in places where the binding is checked (linked devices, multi-device
lists).

Prekeys of an account:

- `SPK`: an X25519 signed prekey, also the responder's first ratchet key.
- `PQ`: an ML-KEM-768 encapsulation key (1,184 bytes), signed with the rest.
- `OPK`: optional one-time X25519 prekeys. **The app makes none** (`Account::generate` asks for
  0), because the bundle is in a contact link that several people may use. Replays of a first
  message are refused instead by id (§4).

Bundle transcript, signed by the Ed25519 identity key:

```text
"erevos prekey bundle v1" ‖ IKdh(32) ‖ SPK(32) ‖ PQ(1184) ‖ ( 0x00 | 0x01 ‖ opk_id be32 ‖ OPK(32) )
```

Bundle on the wire (`wire.rs`):

```text
VERSION(1)=1 ‖ verify(32) ‖ IKdh(32) ‖ SPK(32) ‖ PQ(1184) ‖ ( 0x00 | 0x01 ‖ opk_id be32 ‖ OPK(32) ) ‖ sig(64)
```

The bundle signature does not prove that its maker holds `IKdh`. A bundle used to check other
statements is therefore taken only from inside a conversation with that identity, never from a
contact link alone (`verify_signed`).

Other signed statements use a prefix no bundle transcript starts with:

```text
"erevos signed v1\0" ‖ context (non-empty, no zero byte) ‖ 0x00 ‖ message
```

**Prekey rotation (app, `app/lib/e2e.ts`).** The link's prekeys never change, since anyone with
the link starts with them. Every 30 days (`PREKEYS_EVERY`) the account makes new prekeys
(`Account::new_prekeys`) and gives the bundle to each contact inside their conversation (`ak`).
The contact then starts a new conversation with it at once, with a new ML-KEM secret
(`accept_with` on this side). Only the last 3 (`MAX_PREKEYS`) are kept. Older ones are deleted,
and with them what a stolen phone would give of the ML-KEM half of the conversations they
started.

## 3. PQXDH handshake

`crates/erevos-core/src/pqxdh.rs`. This follows Signal's PQXDH, with the differences listed at
the end of this section.

**Initiator A, with B's bundle:**

1. Verify the bundle signature (`verify_strict`). Refuse on failure.
2. Generate an ephemeral X25519 key `EK`.
3. Compute:
   - `DH1 = X25519(IK_A, SPK_B)`
   - `DH2 = X25519(EK, IK_B)`
   - `DH3 = X25519(EK, SPK_B)`
   - `DH4 = X25519(EK, OPK_B)`, only when the bundle has an `OPK`
   - `(ct, pq_ss) = ML-KEM-768.Encaps(PQ_B)`
4. Derive the shared secret:

   ```text
   SK = HKDF(salt = 0x00 × 32,
             ikm  = 0xFF × 32 ‖ DH1 ‖ DH2 ‖ DH3 [‖ DH4] ‖ pq_ss,
             info = "Erevos PQXDH v1",
             L    = 32)
   ```

   The `0xFF × 32` prefix keeps the input apart from any X25519 output, as in X3DH. The `ikm`
   buffer is zeroized after use.
5. Start the ratchet as initiator: `Session::initiator(SK, SPK_B)` (§5).

Initial message (`InitialMessage`, `wire.rs`):

```text
VERSION(1)=1 ‖ IK_A(32) ‖ EK(32) ‖ ct(1088) ‖ ( 0x00 | 0x01 ‖ opk_id be32 )
```

**Responder B:**

1. `pq_ss = ML-KEM-768.Decaps(PQ_B, ct)`. ML-KEM's implicit rejection gives a wrong secret, not
   an error, for a forged `ct`. The first message's AEAD then fails.
2. Compute `DH1..DH3` (and `DH4` if an `opk_id` is named; the one-time key is then **removed**,
   and an unknown id is refused).
3. Compute the same `SK`, and `Session::responder(SK, SPK_B)`.

**Associated data.** The conversation AD is `IK_initiator(32) ‖ IK_responder(32)` (X25519
identity keys), bound into every message tag together with the ratchet header (§5).

**First message id and replays** (`conversation.rs first_message_id`, `app/lib/e2e.ts`). The id
is `SHA-256(handshake bytes)`, the same however often the packet is resent. The app keeps the
last 1,000 ids per chat (`MAX_SEEN`) and the last 64 per contact (`MAX_SEEN_EACH`), and ignores a
first packet whose id it has seen. This replaces one-time prekeys for replay protection.

**Differences from Signal's PQXDH, for reviewers:**

- No one-time prekeys in practice, so no `DH4`. Replays are blocked by first-message id only.
- No last-resort PQ prekey distinct from a one-time PQ prekey: one signed ML-KEM key per prekey
  set.
- The KEM ciphertext and the identity keys are not in the KDF `info`. The identities are in the
  AEAD AD of every message.
- The initiator's identity is authenticated implicitly (`DH1`), and by the 60-digit safety number
  people compare: `H = SHA-512("erevos safety number v1" ‖ min(IK_A, IK_B) ‖ max(IK_A, IK_B))`.
  The first 60 bytes of `H` are cut into 12 chunks of 5 bytes, and each chunk, read as a
  big-endian number, is shown as that number mod 100,000, in 5 digits.

## 4. Conversation packets

`crates/erevos-core/src/conversation.rs`, `padding.rs`

Plaintext is padded first with ISO/IEC 7816-4 (`0x80`, then zeros) to the smallest of 256, 1,024,
4,096 or 16,384 bytes. The largest plaintext is 16,383 bytes.

```text
first:      VERSION(1)=1 ‖ 0x01 ‖ len be32 ‖ handshake(len) ‖ header(40) ‖ ciphertext
following:  VERSION(1)=1 ‖ 0x02 ‖ header(40) ‖ ciphertext
following, post-quantum: VERSION(1)=1 ‖ 0x03 ‖ header(40) ‖ spqr field(110) ‖ ciphertext
```

Once both sides' Erevos can, following packets also go through the post-quantum ratchet, which
mixes a fresh ML-KEM-768 secret into the message keys an epoch at a time: see
[spqr.md](spqr.md).

A first packet always carries a ratchet message, so the responder authenticates the handshake by
opening it. In the app the first message has no text.

**Several conversations per contact** (`app/lib/e2e.ts`). A packet does not say who sent it. A
following packet is tried in each conversation in turn, and a failed try changes nothing (§5).
Both people may start a conversation at the same time, so each contact keeps its last 3
conversations (`MAX_CONVERSATIONS`). Each side sends in the one it last received in, and opens
packets in any of them.

**Restored backups.** A conversation put back from a backup moves its sending chain on by 900 keys
(`RESTORE_SKIP`) before it seals again. Otherwise it would reuse message keys, and with them
key-and-nonce pairs, that it already used after the backup was made. 900 stays below `MAX_SKIP`,
so the other side still opens it. Its post-quantum ratchet starts over in a later generation
([spqr.md](spqr.md)). The app also starts a new conversation with each contact from their newest
prekeys (`E2E.startAnew`).

## 5. Double ratchet

`crates/erevos-core/src/ratchet.rs`. Signal's double ratchet, **without header encryption** (see
§6 for how the header is hidden from the relay).

State: `DHs` (own ratchet key), `DHr` (theirs), `RK`, `CKs`, `CKr`, `Ns`, `Nr`, `PN`, and the
skipped message keys keyed by `(DHr, n)`.

```text
KDF_RK(rk, dh_out) = HKDF(salt = rk, ikm = dh_out, info = "erevos ratchet root v1", L = 64)
                     → (rk' = [0..32], ck = [32..64])
KDF_CK(ck)         = (ck' = HMAC(ck, 0x02), mk = HMAC(ck, 0x01))
Message key/nonce  = HKDF(salt = none, ikm = mk, info = "erevos ratchet message v1", L = 44)
                     → ChaCha20-Poly1305 key = [0..32], nonce = [32..44]
```

**Nonce handling.** Every message key is used once, and both the AEAD key and the 96-bit nonce come
from it. So no nonce is ever reused under one key, unless a message key is used twice. The only way
that could happen is a state put back from a backup. `RESTORE_SKIP` (§4) prevents it unless more
than 900 messages were sent in one sending chain between the backup and the restore.

Header (40 bytes): `DHs_pub(32) ‖ PN be32 ‖ N be32`.

AEAD associated data: `AD(64) ‖ header(40)`, where `AD` is the identity pair from §3.

- **Initiator start:** `DHs` is new, `DHr = SPK_B`, `(RK, CKs) = KDF_RK(SK, DH(DHs, SPK_B))`. It
  can send at once.
- **Responder start:** `DHs = SPK_B`, `RK = SK`, no chains. It cannot send until it has opened a
  message (`NotReady`).
- **Receive:** first try a stored skipped key for `(header.dh, header.n)`. Otherwise, if
  `header.dh ≠ DHr`, skip to `header.pn` in the old receiving chain and take a DH ratchet step
  (new `CKr`, new `DHs`, new `CKs`). Then skip to `header.n` and open.
- **Limits:** at most 1,000 keys skipped in one chain per message (`MAX_SKIP`, else
  `TooManySkipped`). At most 2,000 stored skipped keys, the oldest evicted first
  (`MAX_STORED_SKIPPED`). Counters fail with `ChainExhausted` instead of wrapping.
- **Atomic decrypt:** decrypt works on a copy of the session and keeps it only once the AEAD tag
  checked. A forged, replayed or misdirected packet leaves the session unchanged. A replay of an
  opened message fails, as its key is gone.

## 6. Sealed packets (relay-facing, app)

`app/lib/sealed-packet.ts`

The ratchet header is in the clear, and all contacts of one chat may write to the same queue. So
once two phones have spoken, each packet is sealed once more for the phone it goes to:

```text
packetKey   = HMAC(key = account secret, "erevos packet key v1 " ‖ peer identity hex)
markKey     = HKDF(salt = none, packetKey, info = "erevos packet mark", 32)
sealKey     = HKDF(salt = none, packetKey, info = "erevos packet seal", 32)
sealed      = 0x01 0x04 ‖ mark(16) ‖ nonce(12) ‖ AES-256-GCM(sealKey, nonce, packet) ‖ tag(16)
mark        = HMAC(markKey, nonce)[0..16]
```

- The nonce is 12 random bytes per packet.
- The phone gives each contact its key inside the conversation (`pk`). The key is derived, not
  random, so it survives a restored backup.
- The receiving phone finds whose packet it is with one HMAC per contact, and tries only that
  contact's conversations.
- To the relay a sealed packet is random bytes apart from its length.
- First packets (§4) are never sealed.
- Packets to a contact's linked devices use the same scheme, keyed per contact and per device
  entry (`"erevos entry key v1 "`), so one contact cannot open what another seals for that device.

## 7. Relays

### 7.1 Channel to the relay (`crates/erevos-core/src/relay_channel.rs`)

Inside every connection, whether TLS or not, the phone opens a channel to the relay's long-term
X25519 key `R`. It works like Noise NK, so the relay is pinned by its key and not by its TLS
certificate:

```text
phone → relay:  HELLO(0xEC) ‖ e_p(32)
relay → phone:  e_r(32) ‖ proof(32)

with_relay = X25519(e_p, R)          with_fresh = X25519(e_p, e_r)
PRK        = HKDF-Extract(salt = "erevos relay channel v1", with_relay ‖ with_fresh)
proof      = HKDF-Expand(PRK, e_p ‖ e_r ‖ R ‖ "proof", 32)
k_up       = HKDF-Expand(PRK, e_p ‖ e_r ‖ R ‖ "phone to relay", 32)
k_down     = HKDF-Expand(PRK, e_p ‖ e_r ‖ R ‖ "relay to phone", 32)
```

The phone stops when `proof` does not match. Each message each way is sealed with
ChaCha20-Poly1305 under that way's key. Its nonce is the count of the messages before it that way,
as a 64-bit little-endian number in the first 8 bytes and zeros after. A message out of turn
fails. Low-order keys are refused. The phone learns `R` from a contact link, an invite, the app's
built-in relay, or trust on first use.

### 7.2 Queues (`crates/erevos-relay/src/queue.rs`, `server.rs`)

Each queue is one-way, as in SimpleX SMP. It has a **sender id** and a separate **recipient id**
(24 bytes each), so the relay cannot link the two from requests. Requests are one opcode byte plus
fields. Replies start with a status byte.

| Request | Fields | Effect |
| --- | --- | --- |
| `CREATE` | none | New queue; replies recipient id, sender id, or `FULL` |
| `SEND` | sender id, len be32, message | Appends to the queue |
| `RECEIVE` | recipient id [, mark, `HOLD` [, last number]] | Takes the oldest. With `HOLD` it stays, numbered, until `ACK` |
| `ACK` | recipient id, number(8) | Deletes it if it is still the oldest |
| `WAIT` / `WAIT_ANY` | id(s), seconds | Long-poll, takes nothing |
| `NEWS` / `NEWS_ANY` | id(s), seconds, last heard (16) | Counts only, for closed hidden chats |
| `DELETE` | recipient id | Deletes the queue |
| `FORWARD` | relay address, sealed send | Two-hop sending (§7.3) |
| `SEALED_SEND` | sealed send | Opens it, then acts as `SEND` |

Retention and limits (defaults):

- Messages expire after 14 days. Only the hour of arrival is noted.
- A queue whose recipient has not used it for 180 days expires. Sending does not count, so a
  sender cannot keep a queue alive. Only the day of last use is noted.
- At most 100,000 queues, 1 GiB in all, and 64 MiB per phone token.
- A write-ahead journal (`journal.rs`) keeps queues across restarts.
- With `HOLD`, only the oldest message of a queue is ever out, and it is handed over again until
  acknowledged. A message may arrive twice, and the chat takes it once.

**Queues in the app** (`app/lib/contact-queues.ts`):

- The contact link names a queue for first messages only.
- Each kept contact gets a queue of its own, given to them inside the encrypted messages (`from`).
  The relay cannot tell from where messages go that two contacts write to the same phone, and
  deleting or blocking a contact deletes only their queue.
- Queues are read on the `/read` path, which needs no token, so the token does not tie them
  together. With Tor, they are read in groups, each group over its own circuit.

### 7.3 Two-hop sending (`crates/erevos-core/src/relay_seal.rs`)

The phone gives a request sealed for the contact's relay to its own relay (`FORWARD`). The first
relay sees the phone's address but not the queue. The second sees the queue but only the first
relay's address.

```text
e       = fresh X25519 key        shared = X25519(e, R_dest)   (sender refuses a non-contributory result)
key     = HKDF(salt = none, shared, info = "erevos relay seal v1" ‖ e_pub ‖ R_dest, 32)
sealed  = VERSION(1)=1 ‖ e_pub(32) ‖ ChaCha20-Poly1305(key, nonce = 0, AD = VERSION ‖ e_pub,
                                                      sender_id(24) ‖ message)
```

The nonce is zero because each key seals exactly one request. The overhead is 73 bytes.
Reviewers: `RelayKey::open` on the relay does not itself check `was_contributory()`. A low-order
`e_pub` gives a known shared secret, so anyone could seal to the relay, which is no more than an
ordinary `SEND` allows.

Group messages reuse this seal to a key each member names for itself (`about.seal`), with a
sender id of zeros, so each member's copy looks different on the relay (`app/lib/groups.ts
sealFor`).

## 8. Groups (MLS)

`crates/erevos-group/src/lib.rs`, `app/lib/groups.ts`, `app/lib/group-signal.ts`, [public-groups.md](public-groups.md)

- **Ciphersuite** `MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519`. Every message, commits
  included, is an MLS `PrivateMessage`. Messages from up to 5 past epochs still open.
- **One committer.** The creator is the admin, leaf 0, and the only member whose commits count.
  Members refuse commits from anyone else, so commits never race and no server orders them. In
  public groups the committer is the *keeper* named in a `RULES` group-context extension (type
  `0xf001`: keeper leaf be32, then the app's rules), which MLS binds to each epoch.
- **Joining.** The admin asks a contact for a key package inside their 1:1 conversation. The
  contact answers with one. The admin commits the add and sends the Welcome in the same 1:1
  conversation. After that, everything goes as group messages: MLS-sealed for the group, then
  relay-sealed per member (§7.3), straight to each member's queue.
- **Leaving.** A member asks the admin, who commits the removal.
- **Early messages.** A message from an epoch later than ours is kept (`later`) and tried again
  once the commit arrives.
- **Key renewal (post-compromise security), every 7 days (`RENEW_EVERY`).** The keeper renews its
  own leaf (`self_update`). A member cannot commit, so it is re-added instead:
  1. It sends a key package signed with its existing signature key (`renewal`).
  2. The keeper commits its old leaf out and the new key package in (`renew`).
  3. The member takes the group back from the Welcome (`rejoin`).
  The others see the same member leave and return in one commit.
- **Public groups.** Each member signs with a signing key made for that group alone, so its
  groups cannot be linked by key.
- **No server state.** The member state (signature key and all groups) is serialized after each
  call (`STATE_VERSION 1`) and kept sealed by the app.

## 9. Storage, slots and hidden spaces

`app/lock/config.ts`, `slots.ts`, `hidden.ts`, `tries.ts`, `sealed-file.ts`, `backup.ts`

**Password slots.** There are always at least 4 slots (`SLOTS`) in the OS keystore entry
`erevos.lock`. Slot *i* opens space *i*. Unused slots hold random values of the same shape.

```text
K      = PBKDF2-SHA256(password, salt16, 200,000)
A      = Argon2id(SHA-256(K), hard.salt16, 32 MiB, 3 passes)
check  = SHA-256(A)
key    = Seal_A( Seal_K( hex(spaceKey) ) )
```

- **Unlock** derives `K` for every slot in parallel, then runs Argon2id for every slot one after
  another. All slots are always checked, whichever one matches, so timing does not show how many
  are used. The panic password's slot (`erevos.lock-panic`) is checked in the same pass, as one
  more slot. It is random until one is set, and random again once it is removed.
- **Hidden chats** have 4 pockets in every space (`POCKETS`). Each pocket's PIN is a slot of the
  same kind, in `erevos.hidden-lock[.p]`. They are tried from the home screen's search, which
  also tries every space's password (`searchOpens`).
- **Wrong tries** (`tries.ts`) are counted across restarts. After 5 free tries each further one
  doubles the wait, from 30 s up to 1 hour. The wait runs on a clock the owner cannot set: uptime
  on Android, page lifetime elsewhere. The lock screen and the search keep separate counts. The
  search forgets after 15 minutes and waits at most 5 minutes.
- **Sealed files.** Each space's data is one sealed value per slot, every value the same size.
  History is 16 KB pages mixed for all holders, behind a 64 KB page index.
- **The locked camera** (`camera-drop.ts`). With the password lock, the camera opens with Erevos
  locked and takes for the space opened last. A photo or video goes into chunks as a Collection
  file does, under a random file key. That key, with the file's name, type, size and time, is
  sealed as in 7.3 to `D_pub`, with the 24 bytes that carry the sender id there holding the mark
  `"erevos camera drop v1"` padded with zeros, in a note `erevos-drop-<16 random bytes, hex>`
  beside the chunks. A note is taken only with that mark.

```text
d      = HKDF-SHA256(ikm = spaceKey, salt = none, info = "erevos camera drop v1", 32)
D_pub  = X25519 public key of d    (keystore entry erevos.camera-drop, never in a backup)
note   = { v: 1, files: [{ id, count }...], sealed: relaySeal(D_pub, mark, JSON { file, thumb, at }) }
```

  `d` is made again as the space opens and is kept nowhere, so the locked camera holds no key
  that opens anything, not even what it just took. A note the open space's `d` does not open stays
  for its own space. The switch `erevos.camera-open` is the phone's, the same in every space; a
  backup restored deletes the notes with their chunks, and `D_pub`.

  What waits is not hidden from whoever reads Erevos's folder. A note is a file of its own, and
  says in the clear the ids of its chunks: while one waits for a space, another space that opens
  leaves it and its chunks where they are, so someone shown that other space who also reads the
  folder can tell that there is a space they were not shown. Nothing in the app shows it; the
  search for leftovers counts every note's chunks as named, so it neither shows nor deletes them.
  The guide says so, and that the switch is the way out. When the first space removes its second
  password or turns its lock off, no other space opens any more, and the notes its `d` does not
  open are deleted with their chunks. From any other space, and when a second password is set
  again, a note that does not open may be for a space that still opens, so it stays.

The flows are drawn in [state-machines.md](state-machines.md).
