# XMPP accounts in Erevos

Erevos can hold an XMPP (Jabber) account, so people can write to friends who use Conversations,
Monal, Gajim, Dino, Cheogram, Kaidan or any other XMPP app. Erevos talks to the person's XMPP server
itself, as those apps do: messages are encrypted on the phone with OMEMO and opened on the other
person's devices. No bridge sits in between.

## What XMPP chats do not have

XMPP chats are not anonymous, and the app says so on them. The server sees the account, its
contacts, who talks with whom and when, and the phone's address unless it goes through Tor. The
other person's server sees the same of the chats with its people. None of Erevos's own protections
apply: no queue per contact, no padding to one size, no Nostr, no relay hops. What stays private
is what is written, once OMEMO encrypts it.

## How it is built

- `crates/erevos-xmpp`: OMEMO 0.3 (XEP-0384 version 0.3, namespace
  `eu.siacs.conversations.axolotl`), the version Conversations, Monal, Gajim, Dino and Cheogram
  all speak. It is the Signal protocol as libsignal had it in 2016: X3DH with XEdDSA signatures to
  begin, then the Double Ratchet, with libsignal's message format (protobuf, version byte 0x33,
  8-byte HMAC), keys (HKDF info `WhisperText`, `WhisperRatchet`, `WhisperMessageKeys`) and limits
  (2000 skipped messages, 5 receiving chains). A message's text is encrypted once with
  AES-128-GCM; its key and tag go to each device through its ratchet. Like the rest of the core
  it keeps nothing between calls: one JSON request in, one JSON answer out (`op`: `identity_new`,
  `signed_pre_key_new`, `pre_keys_new`, `session_start`, `encrypt`, `decrypt`, `sign`, `verify`,
  `file_encrypt`, `file_decrypt`). Beside it, `omemo2.rs` is OMEMO 2 (below), its ops named
  `two_*`.
- `crates/erevos-ffi` passes it on as one call, `xmpp`, through JNI and WebAssembly.
- `crates/erevos-tor` opens the connection to the server on Android (`net_open`, `net_write`,
  `net_read`, `net_close` in the FFI): TLS straight away (XEP-0368, port 5223, ALPN
  `xmpp-client`) or STARTTLS on port 5222, straight or through Tor with a circuit of its own per
  server. The TLS is rustls with Mozilla's roots (webpki-roots), checked for the XMPP domain.
- `app/lib/xmpp-net.ts` finds the server: the SRV records `_xmpps-client._tcp` and
  `_xmpp-client._tcp` asked over DNS-over-HTTPS (through Tor when the space goes through Tor), and
  the domain itself on 5222 when there are none. In the web app, where no socket can be opened,
  it uses the server's WebSocket (RFC 7395), found in its `/.well-known/host-meta` (XEP-0156). A
  server written on the sign-in screen (host, host:port, or a `wss://` address) is used as given.
  With the Tor way Messages, a server Tor cannot reach is tried straight; with Everything, never.
  Each account has a Tor choice of its own (`XmppState.tor`, lib/account-tor.ts): **Off** by default
  (straight), **As the space** (the space's way above), or **Always** (only through Tor, Tor started
  for it with lib/tor.ts `ensureTor`). A chat's **Through Tor** (`XmppChat.tor`) makes the whole
  account Always while on (`xmppTorWay`), as one connection carries every chat. When it must not go
  straight (Always, or As the space with Everything) the connection, the SRV look-up and its files
  (lib/net-http.ts `accountHttp`) never do, and a WebSocket server is refused. The earlier switch's
  kept `true` reads as Always. Calls stay outside Tor.
- `app/lib/xmpp-xml.ts` reads the stream in pieces cut anywhere; `app/lib/xmpp-sasl.ts` signs in
  with SCRAM-SHA-256 or SCRAM-SHA-1 (RFC 5802, RFC 7677), which also proves the server knows the
  password, or with PLAIN only inside TLS.
- `app/lib/xmpp.ts` is the account: resource binding, the roster and presence subscriptions,
  Message Carbons (XEP-0280) so other apps of the same account read along, the Message Archive
  (XEP-0313, since the last message read, so nothing comes twice), delivery receipts (XEP-0184),
  read marks (XEP-0333), OMEMO device lists and bundles in PEP (published open to anyone, as
  OMEMO needs), entity capabilities (XEP-0115) with `+notify` for device lists, and answers to
  pings and disco#info. A message goes to every device of the person and to the account's own
  other devices; when the person has none with OMEMO, nothing is sent unless the chat chooses to
  write without encryption. Used one-time pre-keys are replaced and published again; the used
  one is kept three days (50 at most), so someone who took it from the bundle before the new one
  was out, as another did, still begins a session that opens (both versions).
- `app/lib/xmpp-files.ts`: photos and files, below.
- `app/lib/xmpp-muc.ts`: groups, below.
- `app/lib/xmpp-store.ts` keeps the open space's account connected while the space is open
  (again after a pause that grows, a ping after 4 minutes of silence), and keeps it encrypted in
  the space (`app/lock/xmpp-data.ts`, file `erevos-xmpp`), which backups hold (Backups, below). A
  hidden place can have an account of its own (Hidden chats, below).

Our own code, not audited. It is checked against python-oldmemo (the OMEMO 0.3 of Gajim's and
Slixmpp's library) both ways: a message python-oldmemo sent is one of the crate's tests, and
`docs/xmpp-checks/oldmemo-cross.py` runs a conversation between the two:

```
python3 -m venv /tmp/omemo && /tmp/omemo/bin/pip install oldmemo xmlschema
cargo build -p erevos-xmpp --example omemo-call
/tmp/omemo/bin/python docs/xmpp-checks/oldmemo-cross.py target/debug/examples/omemo-call
```

## Checks it makes

- A bundle's signed pre-key counts only when its signature is the identity key's (XEdDSA, the
  sign bit read from the signature as libsignal does, so older clients' signatures count too).
- A message counts only when its MAC, over both identity keys and the message, is right; a state
  changes only then.
- A message number read once does not open again; one more than 2000 ahead is refused.
- A first message read again (from the archive) is read by the session it began, and does not
  use up another pre-key.
- A carbon copy counts only when it comes from the account itself; anyone else's is dropped.
- SCRAM asks for between 4096 and 1,000,000 rounds, and the server's own proof must be right.

`app/checks/xmpp.check.ts` runs two accounts and a second device against a small server written
for it: the stream in pieces, SCRAM's RFC examples, a wrong password, OMEMO both ways, carbons,
receipts, read marks, the archive read once, a person with no OMEMO, and photos and files both ways,
encrypted and as they are, through an upload service played there (only the slot's allowed headers
sent, a changed file not opened, one too large not sent, a server without the service said so). It was also run by hand
against Prosody 0.12 over its WebSocket: sign-in, roster both ways, OMEMO
both ways, receipts and the archive.

`app/checks/xmpp-muc.check.ts` plays groups on the same server, which also has a group service and bookmarks: a private
group made and set up members only and not anonymous, its people invited and joining, all writing with OMEMO to every
member's devices and reading each other with the server keeping only ciphertext, a second device of the account joining
by the bookmarks and reading along, what came while a device was away read from the group's archive once, a member
without OMEMO, a channel written as it is whose history counts as read and that tells only of what names the account,
groups joined and left in another app of the account, invitations only from contacts (and one said no to), and photos in
a private group opened by every member. Not run against a real server yet.

## OMEMO 2

OMEMO 2 is version 0.8 of XEP-0384, namespace `urn:xmpp:omemo:2`, which Kaidan and the other apps
built on QXmpp speak. Erevos speaks it beside 0.3, to each device that has it, and 0.3 to the
others, so one message can carry both.

- **One identity.** OMEMO 2 says an identity as an Ed25519 key; this device's is the Edwards form
  of its Curve25519 identity with the sign bit 0, the key XEdDSA signs with, so both versions show
  one device with one key. Its fingerprint looks different in each, so the XMPP screen shows both,
  the second marked as Kaidan shows it. OMEMO 2 has its own signed pre-key and 100 one-time
  pre-keys, replaced as they are used.
- **The core** (`crates/erevos-xmpp/src/omemo2.rs`, ops `two_identity`, `two_signed_pre_key_new`,
  `two_pre_keys_new`, `two_session_start`, `two_encrypt`, `two_decrypt`): the ratchet of 0.3 with
  OMEMO 2's derivations (`OMEMO X3DH`, `OMEMO Root Chain`, `OMEMO Message Key Material`), its
  protobuf messages (`OMEMOKeyExchange`, `OMEMOAuthenticatedMessage`, `OMEMOMessage`, a 16-byte
  MAC over both identities and the message) and its payload: AES-256-CBC with a 16-byte HMAC, both
  from one 32-byte key through HKDF (`OMEMO Payload`), that key and the HMAC going to each device.
- **On the server** (`app/lib/xmpp-omemo2.ts`): the device list in the PEP node
  `urn:xmpp:omemo:2:devices` (item `current`, other devices' labels kept as they are), and each
  device's bundle as one item of `urn:xmpp:omemo:2:bundles`, its id the device's, the node asked to
  keep `max` items, else 1000, 100 or 10, as QXmpp asks. Both are published open to anyone.
- **The payload** is an SCE envelope (XEP-0420): the `<body>`, random padding of 0 to 149 bytes, the
  time, and who it is from and to. One that comes counts only when its `from` is the sender's
  address and its `to` is this account (or, for a copy of our own from another device, the other
  person; in a group, the group), so an envelope cannot be passed on as another chat's.
- **Which version** (`app/lib/xmpp.ts`): a device gets OMEMO 2 when it is in the person's OMEMO 2
  list and this device's own OMEMO 2 bundle has been on the server once; else 0.3. A message to
  someone with both kinds of device carries both `<encrypted>` elements, and its `<encryption>`
  (XEP-0380) names 0.3 when 0.3 is in it. A message that comes is read in OMEMO 2 when it has a key
  for this device there, else in 0.3. Signing out takes this device out of both lists, and its
  OMEMO 2 bundle off the server.

Checked against python-twomemo (the OMEMO 2 of Gajim's and Slixmpp's library) both ways, with
`docs/xmpp-checks/twomemo-cross.py`: a session begun by each side, messages both ways, an empty
one that only moves the ratchet on, a bundle with a wrong signature refused, and one identity seen
the same by both:

```
python3 -m venv /tmp/omemo && /tmp/omemo/bin/pip install twomemo==2.1.0 xmlschema
cargo build -p erevos-xmpp --example omemo-call
/tmp/omemo/bin/python -I docs/xmpp-checks/twomemo-cross.py target/debug/examples/omemo-call
```

`app/checks/xmpp.check.ts` has an account with one device that speaks only OMEMO 2, one with only
0.3, and one with a device of each: each reads the other, and the server sees one version or both
as the devices ask. The XML and the envelope follow QXmpp's code; not yet tried with Kaidan on a
phone.

## Screens

- `app/xmpp.tsx`, under Settings → Relay and networks → XMPP: signing in (address, password, and a server
  only when DNS does not find it), then the people who asked to add the account (Accept, Decline) and the groups that
  invited it (Join, Decline), a new chat with an address, **New group** (a name and the contacts to invite, ticked as
  chips; it says the group is private and encrypted with OMEMO for every member), **Join a group** (an address such as
  `name@conference.example.org`, and a password if it asks; it says a group that is not private, a channel, is not
  encrypted), the chats and groups (a group is marked as a private group or a channel, and its last message says who
  wrote it), the contacts the account has without a chat, this device's OMEMO fingerprint, and signing out. It says the
  chats are not anonymous, and on Android whether the connection goes through Tor.
- `app/xmpp-chat.tsx`: two tiles at the top that call the person (video, voice; see Calls), the messages,
  with delivery and read marks, each call's line, a locked message that could not be opened here, a photo or
  file with **Show photo**, **Play** (a sound) and **Save** (`components/network-file.tsx`, as Nostr chats have it),
  **Photo** and **File** under the message box, and below the chat the fingerprints of the person's devices, with a note for a key that
  changed. A device that comes with another identity keeps its old identity and session: the new
  pair waits as `pending`, the chat says a device changed its key, and nothing goes to that device
  until **Accept** in the device sheet (`acceptXmppDevice`); its messages under the new key still
  open. A device that appears in a later list is written to, and the chat says a new device came, once. A person with no OMEMO gets nothing until the chat chooses **Write without encryption**
  (`plain` in `XmppChat`); **Encrypt again** goes back. **Remove this chat** removes it here only.
  A group (`room` in `XmppChat`) is the same screen with its own words, and call tiles only in a private group the
  account is in (group calls, below): its name and address, a line
  saying a private group is encrypted with OMEMO for every member and not anonymous, or that a channel is not
  encrypted and that everyone in it, and the servers, can read it, a status line while it is being joined or when the
  room did not let the account in (`room.problem`), its subject, and for each message the name of whoever wrote it, with
  only its time (no delivery or read marks: the room passes a message back once it has it) and Sending… or Not sent. When
  nobody in a private group has an OMEMO app Erevos can find, the same choice is offered (**Write without
  encryption**). Below a private group are its **Members**, each with the fingerprints of their devices as a chat
  has them, and a note on one with no OMEMO keys found (they are looked up as the group opens), who
  cannot read what is encrypted; for an admin of the room, **Add people** picks from the account's contacts who are not
  members yet. A channel says it tells only of messages that name the account. **Leave the group** replaces **Remove
  this chat**, and says the account's other XMPP apps leave it too.
- The home list (`xmppInboxRows` in `app/lib/inbox.ts`): each chat and group is a row, `network: 'xmpp'` with `xmpp:` and
  the address as its identity, in the XMPP chip beside the SMS, Erevos and Matrix ones, a group's last message with
  its writer's name before it; a person who asked to add the account, and a group that invited it, is a row at the
  top until answered (`invited: true`, opening the XMPP screen). The chip shows once the space has an account.

## Groups

Group chats as Conversations, Monal, Gajim and Dino have them (`app/lib/xmpp-muc.ts`): rooms of a multi-user chat
service (MUC, XEP-0045), which each device of the account joins by itself.

- **Private groups and channels.** A room is a private group when it says in disco#info that it is members only
  (`muc_membersonly`) and non-anonymous (`muc_nonanonymous`); every other room is a channel. A private group is what
  Conversations calls a private group: only its members can join, and everyone in it sees everyone's real address, which
  is what lets OMEMO write to each member. A channel is written as it is, with no encryption, and says so wherever it
  shows.
- **Encryption in a private group.** A message is a `groupchat` message with OMEMO 0.3, encrypted to every device of
  every member and to the account's own other devices, like a message to one person but to many (one AES-128-GCM key,
  wrapped for each device through its ratchet). The members are the room's affiliation lists (owner, admin and member,
  asked with XEP-0045 §9.5) and the real addresses of those in the room (`jid` in the presence, `Room.occupants`); their
  device lists are fetched as the group's screen opens and as a message is written, and their sessions started then,
  as for one person. A message that
  comes is opened for the device that wrote it: the sender is the real address in the presence, or, when the room does
  not say, whichever member has a device with the id in the message's header. One who has no OMEMO device is left out
  and marked; when nobody has one, nothing is sent unless the chat chooses to write without encryption, as for a
  person. Someone who joins later cannot read what came before: it shows as locked. A message the room passes back
  (every room does) marks the one sent from here as sent; a group has no delivery receipts or read marks.
- **Making a group.** The server's group service is found by disco#items on the account's domain (an item whose
  identity is `conference`/`text`) and kept a day. The room is `<16 random hex characters>@<service>`, made by joining
  it and then submitted its owner form (XEP-0045 §10.1.3), with only the fields the room offers: the name, persistent,
  members only, non-anonymous, not listed, no password, not moderated, subject changeable only by admins, archived
  (`muc#roomconfig_enablearchiving` or `mam`), and, for ejabberd, `muc#roomconfig_getmemberlist` so members may see who the
  members are. The people chosen get the member affiliation and a mediated invitation. The account owns the room.
- **Joining a group.** By an address typed, or as an invitation asked: disco#info on the room says whether it is
  private, has an archive (MAM) and what it is called; then the presence to `room/nick`, with the password if there is
  one. The nickname is the account's name before the `@`, with a `_` more when the room says it is taken. Why
  a room did not let the account in comes as the presence error (members only, forbidden, a password asked, no such
  room), or as the status codes of an unavailable presence (banned, taken out, the server stopped), and shows on the
  group's screen. A room is joined again on each connection.
- **Bookmarks (XEP-0402).** The groups the account is in are items of its `urn:xmpp:bookmarks:1` node, with
  `autojoin`, the nickname and the password, published open to the account only (`access_model` whitelist; a server that
  refuses the options gets the item without them). On each start the node is read and its groups joined, and
  `urn:xmpp:bookmarks:1+notify` in the capabilities has the server tell of changes: a group joined in another app is
  joined here, one left there (autojoin off, or the item retracted) is left here, and **Leave the group** retracts the
  item, so the account's other apps leave it too. Leaving does not take the account off a private group's member list; an
  admin of the room does that.
- **Invitations.** Through the room (XEP-0045 §7.8.2, `<invite>` in a message from the room) or straight from the person
  (XEP-0249, `jabber:x:conference`). Only an invitation from one of the account's contacts is kept, since anyone can
  invite anyone, with its reason (up to 300 characters) and the password it carries; it is shown with the room's
  address and who invited. **Join** joins with that password; **Decline** answers through the room (`<decline>`) and
  drops it.
- **What came before.** A room with an archive (MAM, XEP-0313, on the room's own address) is read after the last message
  seen, 50 at a time, its newest page the first time; the presence then asks for no history. A room without one gives, in
  the join presence, what came since the last message (`history since`), or its last 20 the first time. What was there
  before the account joined counts as read.
- **What counts as not read.** In a private group, every message from someone else; in a channel, only those that name
  the account's nickname as a word of their own (`mentions`), so a busy channel does not fill the number on Erevos's icon
  or make a notice for each message. Messages from the account's own devices never count. Notices, the icon's number and
  a chat's own sounds work as for any chat.
- **What the servers see.** The room's server sees the room, who is in it with their addresses (a private group's
  members are public to each other by design), who writes and when, and the account's server sees its bookmarks, so
  which groups it is in. In a private group they keep only ciphertext, in the room's archive too; in a channel they keep
  and can read the text. None of Erevos's own protections apply.
- **Files.** Photos and files go to a group as to a chat, through the account's server's upload service: encrypted on the
  phone in a private group, and sent as they are in a channel.
- **Not yet.** Changing a group's name or subject, removing or banning someone, roles, private messages inside a room,
  and a room's other settings: an admin does them in another app.

## Calls

One-to-one voice and video calls, as Conversations, Monal and Dino make them, on the same call
screen as Erevos's own (`app/lib/xmpp-calls.ts`, a `CallPlace` of `app/lib/calls.ts`; the call is
`app/lib/call.ts`'s):

- **Ringing (XEP-0353):** a call of ours is a `<propose>` to the person's bare address, with an
  `<description media>` per kind, so it rings on all their devices. The first `<proceed>` names the
  device that has the call; it alone gets the `session-initiate`. A `<retract>` takes ours back,
  `<reject>` turns theirs down (with a Jingle reason: `decline`, `busy`), and `<finish>` tells both
  archives the call ended. Answering theirs sends `<proceed>` to their device and `<accept>` to our
  own bare address, so our other devices stop ringing; theirs doing so stops the ring here
  (`endedElsewhere`). The ring's id is the Jingle session's id.
- **The session (XEP-0166, XEP-0167):** `session-initiate` carries the caller's description,
  `session-accept` the answer, `session-terminate` the end, `session-info` with `<ringing>` the ring
  for an app that started with Jingle at once, and `transport-info` addresses that come one at a
  time (`Call.addCandidates`, held until the description is set). Anything else is said no to
  (`feature-not-implemented` with `unsupported-info`), and a session nobody knows here gets
  `item-not-found` with `unknown-session`. Either side can add video to a voice call with Jingle's
  `content-add`; the other is asked first and answers `content-accept` or `content-reject`.
- **Descriptions (`app/lib/jingle-sdp.ts`):** WebRTC's SDP to Jingle and back: one content per media
  section, named by its `mid`; payload types with their parameters (a nameless one, as RED's
  `111/111`, kept) and RTCP feedback (XEP-0293); header extensions and `extmap-allow-mixed`
  (XEP-0294); sources, their `msid` and groups (XEP-0339); the BUNDLE group (XEP-0338); ICE-UDP
  (XEP-0176) with the DTLS fingerprint and `setup` (XEP-0320). Only UDP addresses given as numbers
  pass: a `.local` name or a host name is dropped, as it would be looked up. An app that names no
  stream gets one per call, so sound and picture play together.
- **Rings without an offer:** a ring has no description, so the call rings with none and
  `CallEvents.offer` asks for it as it is answered: `<proceed>`, then the `session-initiate` it
  waits for. So an answer always goes through a call relay when there is one.
- **The way it goes:** the space's own call relay first, else the XMPP server's TURN server
  (XEP-0215 `extdisco:2`, with the credentials it gives), always with `iceTransportPolicy: 'relay'`,
  so the other side never learns this phone's address; with neither, straight. Media never goes
  through Tor.
- **Who may ring:** people in the account's contacts with a subscription; anyone else's call is
  only a missed line. A ring from the archive, or older than a minute, is a missed line too.
- **What it does not protect:** the descriptions, the DTLS fingerprint with them, go through the
  XMPP servers as they are, so those servers could put themselves in between; XMPP apps do the same.
  The guide says so.
- **Each call has one line** in its chat (`call: true` in `XmppMessage`, kept in English and shown
  by `app/lib/call-lines.ts`), by the call's id, so a missed ring and its end do not make two.
- **Caps:** the features say Jingle, RTP audio and video, ICE-UDP, DTLS and XEP-0353, which is what
  Conversations looks for before it shows its call buttons.

`app/checks/jingle-sdp.check.ts` turns a Chromium offer to Jingle and back, with the directions for
each side, an app that names no stream, and transport-info. `app/checks/xmpp-calls.check.ts` plays
the other side as Conversations does, stanza by stanza, through the checks' server
(`app/checks/xmpp-server.ts`): a call of ours through the server's TURN to the device that answers,
theirs answered and hung up, turned down, taken back, answered on another device of ours, rung while
in another call, a stranger's, an older app's, and a session nobody knows. `docs/xmpp-checks/jingle-browser.ts`
connects two of Chromium's own WebRTC peers whose descriptions and addresses go through Jingle XML on
the way (sound, sound and picture, addresses one at a time). The same flows were also run by hand
against Prosody 0.12 with `mod_turn_external`. Not yet tried with Conversations, Monal or Dino on a
phone.

## Group calls

Voice and video calls in a private group, as Dino makes them, so they work with Dino's
(`app/lib/xmpp-muji.ts`, a `GroupCallPlace` of `app/lib/group-calls.ts`; the call is
`app/lib/group-call.ts`'s mesh, the same as Erevos's own group calls, on the same screen):

- **The call's room (MUJI, XEP-0272):** each call has a room of its own on the account's group
  service, named with 8 random hex digits (`%08x@` the service, as Dino names them). The phone that
  starts it joins it, which makes it, and sets it up from the form the room gives, with only the
  fields it has: `persistentroom` 0, `membersonly` 1, `whois` anyone, `allowinvites` 1,
  `publicroom` 0. Each person in the group (its members and those in it) is made an owner of it, one
  question each, so they may join it.
- **Joining:** each one joins with a random hex name and `<muji><preparing/></muji>` in its
  presence, waits until the room lets it in, then until everyone getting ready there is ready (or
  gone, at most 15 seconds), then says in its presence what it takes: one `<content>` per media with
  a `<description>` and its payload types. A phone that joins a room with people in it says the
  payload types the first of them said, of those WebRTC takes (opus, PCMU, PCMA, G722,
  telephone-event, VP8, VP9, H264, AV1), as they said them, since Dino keeps only what everyone says
  exactly alike; in an empty room, opus 111 and VP8 96. A room that answers our joining with status
  201 was gone, and joining it made a new one: the call is over, and that is said.
- **The connections:** whoever joins starts a Jingle session (XEP-0166, XEP-0167) with each one
  ready in the room, at the address the room gives for them (`whois` anyone), with
  `<muji room>` in the `<jingle>` element; those already in it wait for that. On the call's side this
  is `GroupCall.receive` with `join` from each one ready, which makes it offer to them. A session that
  comes with a `<muji room>` of the call going on here is answered (`session-accept`) only once its
  sender is ready in the room, which only the group's members may join; one that comes first waits
  for that up to 10 seconds, then is ended. One for any other room is said no to (`item-not-found`
  with `unknown-session`). `transport-info` adds addresses (`GroupCall.addCandidates`, held until
  the connection and its description are there), `session-terminate` or leaving the room drops that
  person, `session-info` is answered and nothing more, and the rest is said no to. More than seven
  others in the room: the call is full.
- **The way it goes:** as a call with one person: our call relay, else the XMPP server's TURN
  server, with `iceTransportPolicy: 'relay'`, and for answers too, whatever the offer has
  (`relayAlways`), as Dino tells its addresses after its offer; with neither, straight.
- **Ringing (Call Invites, XEP-0482):** a call started here is told in the group as a `groupchat`
  message with `<invite xmlns='urn:xmpp:call-invites:0' id video multi='true'>` and inside it
  `<muji room>`, with the older `<propose xmlns='urn:xmpp:call-message:1'>` beside it holding the
  same, and a `<store>` hint, as Dino sends both. An invitation in a group the account is in rings
  here (`groupCallSignal` with `start`), from anyone in it but ourselves; one sent to us alone
  (`chat`, as Dino asks someone into a call it makes a group call of) rings only from a contact.
  Answering it says `<accept id><muji room/></accept>` in both forms where it came from (the group,
  or the person's address); turning it down says `<reject>`; ending a call says `<left>` (in the
  older form `<finish>`), or `<retract>` for one started here that nobody joined. Their `<retract>`
  stops the ring (a missed call), and an `<accept>` or `<reject>` of another device of ours, while it
  rings here, stops it too (`GroupCall.endedElsewhere`, a line that it was answered on another
  device). `<left>` and `<finish>` are not needed: who is in the call is what its room says. An
  invitation from an archive or a group's history, or older than a minute, is a missed line.
- **Joining later:** a call that rang here and was not joined, or was left, can be joined while it
  goes on: each minute the phone asks its room what it is (disco#info); while it is there, the call
  goes on (`here`), and once it is gone (`item-not-found`), it is over. A call is looked after for
  12 hours at most.
- **The messages it takes** come through `CallHook.invite` and `CallHook.presence` in
  `app/lib/xmpp.ts` (an invitation in either form, in a chat or a group, once, not a chat message;
  a presence from a call's room, before the rooms of the groups), and its Jingle questions through
  `CallHook.iq`, before those of calls with one person.
- **What it does not protect:** as with one person, the descriptions with the DTLS fingerprints, and
  the invitations, go through the XMPP servers as they are, not end-to-end encrypted; and the call's
  room tells the group service who is in the call and when.
- **Hidden places:** a hidden place's own account has its group calls apart, as its calls
  (`xmppPlaceGroupCalls`): they ring while its hidden chats are open, with the phone's ringtone, and
  as they close the call ends and the place's calls are forgotten. While they are closed and receive,
  one that comes is kept as missed in its group (`closedInvite`).

`app/checks/xmpp-muji.check.ts` plays Dino stanza by stanza through the checks' server, which keeps
what each one says in its presence in a room and drops a room that is not kept once it is empty: a
call started here, its room and owners, its invitation, someone joining it through the server's TURN
only with an address told after, and leaving; Dino's call rung and answered here, with what it takes
said back, a session to the one ready in it, and one who comes later and calls us before we see them
ready; taken back, from the history, from a stranger, answered on another device; turned down and
joined later, then over when its room is gone, and one whose room went before it was joined; and a
hidden place's call that ends as its chats close. Not yet tried with Dino itself.

## Photos and files

As Conversations, Monal, Gajim and Dino share them:

1. The server's upload service (XEP-0363) is found by disco#info on the account's domain, then on each
   item disco#items gives; it is kept a day, with the largest file it takes (`max-file-size`).
2. In a chat encrypted with OMEMO the file is encrypted on the phone with AES-256-GCM, by a key and a
   12-byte IV made for it alone (the crate's `file_encrypt`), and asked a slot for under a random name with
   its ending, as `application/octet-stream`. In a chat written without encryption it goes as it is, under
   its own name.
3. It is put with an HTTPS PUT to the slot's address, with only the `Authorization`, `Cookie` and `Expires`
   headers the slot gives (XEP-0363 §4), and the message says where to fetch it: encrypted, its
   `aesgcm://` link with the IV and key as the fragment (XEP-0454), inside the OMEMO payload like any text;
   as it is, its `https://` link as the body and in an out-of-band element (XEP-0066).
4. A message whose whole text is an `aesgcm://` link (a 12- or 16-byte IV), or an `https://` link that its
   out-of-band element names too (in an unencrypted message only), is a file, with its name and type from
   the link. It is fetched only when asked for, and an encrypted one opens only when its GCM tag is right.

Up to 50 MB (`XMPP_FILE_MOST`), less when the service says less. Uploads and fetches go through Tor as the
chat does (`app/lib/net-http.ts`, as Nostr's files). A file fetched is kept in memory while the space is
open (`app/lib/file-cache.ts`), not on the phone.

## Notices

Each change of the account says how many messages each chat has not read, and one who asks to add
the account counts as one, to `app/lib/network-notices.ts`: what went up came, and shows the same
notice as a message in Erevos's own chats (`app/lib/background.ts`), with its sound; what went down
was read, here or on another device of the account (its read marks, as carbons). The number on
Erevos's icon counts them (`app/lib/unread.ts`), the computer's notice too. What the archive gives
just after signing in (`fresh`) tells of nothing. A chat has notifications of its own (`notify`, as
`app/lock/chat-notify.ts` keeps them), set from **Notifications** at the bottom of its screen on
Android; a muted one is left out, and a call rings with the chat's ringtone. A chat is marked read
only while Erevos shows it.

## Notices while the space is closed

On Android, **Say a message came** under **While this space is closed** on the XMPP screen
(`ClosedPush` in `app/xmpp.tsx`; `xmppSetPush`, `xmppPushOn` and `keepPush` in `app/lib/xmpp-store.ts`)
has the space tell of XMPP messages while another space is open, as `app/lib/matrix-push.ts` does for
Matrix. The relay is the account's push app server (XEP-0357; `crates/erevos-relay/src/xmpp_push.rs`):
`XMPP_PUSH` asks it for its name, the space makes a queue there of its own and sends the account's
server `<enable xmlns='urn:xmpp:push:0' jid='<relay name>' node='<the queue's sender id in hex>'/>`
(`app/lib/xmpp-push.ts`; no form, so the server sends what it sends anyway, and the relay reads past it). While
no app of the account is online, the server publishes to that node for each message, over a
server-to-server stream to port 5269 of the relay's name with STARTTLS; the relay counts one message in the
queue's news and keeps nothing, and answers `item-not-found` for a node that is no queue, so the server stops. The
door names the queue (`XMPP_PUSH_GROUP` in `app/lib/closed-notices.ts`) and says "New message", never which
chat; the push is asked of the server again at each session. Checked in `app/checks/xmpp-push.check.ts` against
the real relay and the server played in the checks, and in the relay's own tests. The relay needs a name, a
certificate and an open port 5269 (`deploy/relay/README.md`, "XMPP notices"); not yet tried against a real XMPP
server.

## Hidden chats

Each place of hidden chats can sign in to an XMPP account of its own, apart from the space's, that
nothing outside its hidden chats shows.

- `app/lib/place-networks.ts` runs the place's account (`followXmppPlaces`, each place's in
  `app/lib/place-lives.ts`) while its hidden chats are open, and while they are closed too if they
  receive while closed (`receivingPlaces` in `app/lib/place-receiver.ts`): then it stays connected
  whenever the space is open, as the place's relay queue is read, and its server sees it connected
  from the phone's address beside the space's account. Otherwise it disconnects as they close, and a
  closed place receives nothing. Its sign-in and keys are kept encrypted with the place's key, in the
  place's own value of `erevos-xmpp`: the holders `hidden` and `hidden1` to `hidden3` of
  `app/lock/sealed-file.ts` (`hiddenHolder(pocket)`), beside the space's `space`, which never sees them.
- `app/lib/network-place.ts`: `app/xmpp.tsx` and `app/xmpp-chat.tsx` read a `hidden=1` route param
  (`useNetworkWhere`), show the place's account (`xmppNow('place')`), say under the title that it is
  the hidden chats' own, and while they are on top what is done goes to that account; the chat they
  open takes the param on (`whereParams`). The hidden chats' list (`app/app/chat.tsx`) has **XMPP**
  under it, and lists the place's chats (`xmppInboxRows`), which open with `hidden=1`
  (`components/chat-row.tsx`).
- While its hidden chats are closed and receive (**Receive while closed**), a message to it makes the
  notice say "New message", as for the place's other chats (`hearing` with the place, then
  `onPlaceNetworkMessage` in `app/lib/network-notices.ts`, which `app/lib/background.ts` hears, on
  Android only); while they are open, it sounds as theirs do. Nothing else of it tells outside them:
  no number on Erevos's icon or the home list, and no notification settings.
- Its calls are its own, a place of calls apart from the space's (`xmppPlaceCalls` in
  `app/lib/xmpp-calls.ts`, each call's session marked `place`): the tiles of its chats call from its
  account, and a call to it while the hidden chats are open rings with the phone's ringtone, named as
  its contacts name the caller. The hidden chats stay open through the call (`app/app/chat.tsx`), and a
  call still on as they close ends (`watch` in `XmppCallsSpace`). While they are closed and receive, a
  call from one of its contacts is held (`hold`, `XmppCallsSpace.closed`): nothing is said back, the
  phone rings "Incoming call" with no name (`placeNetworkRang`, the hidden ring screen), and once the
  PIN opens the place within the minute it rings there (`promote`), answered at once when the PIN was
  typed on the ring screen (`takeHeldXmppCall`, `components/call-host.tsx`). One taken back, ended,
  answered on another device or not opened in time is kept as missed, or as its device said. A group
  call that comes then is kept as missed (`closedInvite` in `app/lib/xmpp-muji.ts`), as the place's own
  groups' are. Checked in `app/checks/xmpp-calls.check.ts` and `app/checks/xmpp-muji.check.ts`.
- `app/checks/place-networks.check.ts` checks the stores against the server played in the checks,
  with the real core; not yet on a phone.

## Backups

The account is in the backups (`app/lock/backup.ts`): the file `erevos-xmpp`, the space's and each
hidden place's, with the pages its value takes. Restored, it comes back with its sign-in, contacts,
chats, the keys it knows of other people and its identity, and goes on as a new device of the
account (`renewDevice` in `app/lib/xmpp.ts`, run by `app/lib/xmpp-store.ts` as the account loads
after a restore it has not been through: `app/lock/restored.ts` marks each restore outside the
backup, and the account keeps the mark it last went past). As the backup kept them, its sessions
would use again message keys used since, which the others refuse, and the phone the backup came from
may still be using its device id and its resource.

- **Kept:** the identity key, so contacts' apps still know its key, and with it the contacts, the
  chats and the keys it knows of other people's devices.
- **New:** the device id, the resource, the signed pre-key and the one-time pre-keys, and the OMEMO 2
  bundle. Every session with a person is dropped, so each conversation begins again, and their
  device lists are asked for again with the bundles of their devices.
- **Old device:** once the account connects, the old device id leaves its OMEMO 0.3 and OMEMO 2
  device lists and its OMEMO 2 bundle is retracted (`OwnOmemo.gone`, in `app/lib/xmpp-omemo.ts`).
  A message encrypted to the old device after the backup cannot be read by the restored one.

`app/checks/xmpp.check.ts` checks it against the server played in the checks, with the real core: a
restored account becomes a new device, keeps its chats and its identity, the old device leaves the
lists, and messages go both ways. `app/checks/backup.check.ts` checks that the file and its pages
come back and that those of the phone it is restored on go. Not yet on a phone.

## Replies, changes, reactions and deleting

`lib/xmpp-actions.ts`, used by `lib/xmpp.ts` and the menu of `app/xmpp-chat.tsx`:

- **Reply** (XEP-0461): `<reply to id>` and the quote other apps show, with `<fallback for='urn:xmpp:reply:0'>`
  naming its characters (XEP-0428), so a reply that comes is shown without it. Without a usable range, leading `>`
  lines are left out.
- **Edit** (XEP-0308): `<replace id>` with the new words, encrypted as the chat is; a change whose message is not here
  shows as a message of its own.
- **Delete for everyone** (XEP-0424 `urn:xmpp:message-retract:1`, and the older one inside `urn:xmpp:fasten:0`, read
  only): with the fallback body the XEP gives, for apps that cannot.
- **Reactions** (XEP-0444): each person's whole choice replaces theirs from before, at most 20 a message.
- One-to-one, all name a message by its writer's id. In a group, a reaction, a reply and a deletion name it by the
  room's id (XEP-0359 `stanza-id`, kept as `sid`, filled in for our own messages when the room passes them back);
  a change by its writer's id, as XEP-0308 says.
- Only a message's writer may change or delete it: one-to-one, the same side; in a group, the same address when the
  room says it (not anonymous), else the same name there.
- The words of a reply and of a change are encrypted as the chat is. Which message each is about, and a reaction's
  emoji, are not, as Conversations, Dino and Gajim send them: the servers see them, and a server could make up a
  deletion or a reaction, as it could hold back a message. Encrypting them (inside OMEMO 2's SCE) would leave them
  unread by the apps people use.
- **Writing** (XEP-0085): `composing` from the other person shows **typing…** for 30 seconds or until they stop;
  Erevos sends `composing` and `paused` (with `no-store`) only when **Say when I am writing** is on, which it is not
  at first, as it tells the server each time one writes; only in a chat with one person who sees our presence
  (`sendXmppTyping`), never in a group.

## Running a group

An admin (`room.admin`, from our own presence) sets the subject with a `subject` message, takes a member out or bars
them with an `admin` IQ (affiliation `none` or `outcast`; in a channel without a member list, role `none` by nick), and
the owner (`room.owner`) renames the group through its settings form (`muc#roomconfig_roomname`, also kept in our
bookmark) and makes members admins (affiliation `admin`/`member`). An admin cannot take out another admin; the server
enforces it too. A private group's messages are written with OMEMO to `room.members`, so a member taken out stops
receiving them from then on.

## Profile pictures

XEP-0084, as Conversations, Dino, Gajim, Monal and Kaidan keep them (`lib/xmpp-avatar.ts`): the picture is an item of
`urn:xmpp:avatar:data` in the account's PEP, named by the SHA-1 of its bytes, and `urn:xmpp:avatar:metadata` says its
type and size. Erevos asks for changes of the note (`urn:xmpp:avatar:metadata+notify` in its capabilities), keeps what
it said in `state.avatars`, and fetches the bytes only when a picture is shown (`xmppAvatar` in `lib/xmpp-store.ts`),
checking them against the SHA-1 and keeping them in memory only. A note with a `url` instead of bytes, or over 256 KB,
is none. **Choose a photo** publishes the data and then the note; **Remove** publishes an empty note. Nothing is
encrypted: the server sees the picture.

## Blocking

XEP-0191 on the account's server: `blockXmpp` blocks or unblocks one address; the block list is fetched at each
sign-in and the server's pushes (from the account's other apps) are taken, from our own server only. Messages from
someone blocked that the archive still gives, and their contact requests, are dropped here too. A server without
blocking says so on the screen. Blocking works on whole addresses, and a whole server blocked in another app is
honoured too.

## Accounts, groups to find, places, previews

- A new account (`registerXmpp`, XEP-0077): the legacy `username`/`password` form or a data form, over the same
  connection a sign-in has. A captcha, or an out-of-band page (`jabber:x:oob`), is refused with the page named
  (`XmppRegisterError`); a taken name, a missing in-band registration and a short password (under 8) are said so.
  `changeXmppPassword` and `deleteXmppAccount` use `jabber:iq:register` on the signed-in account; deleting closes the
  connection and the account is forgotten here.
- Groups: `serverChannels` lists the server's group service by `disco#items` (those it lets anyone find);
  `searchChannels` asks `api@search.jabber.network` (XEP-0433) with a filled form, which learns the words and the
  server's name; MIX results (`xep0369`) are left out.
- Places: a message whose body is only a `geo:` URI, as Conversations sends one, shows as a place; sending one is that
  body, encrypted as the chat is.
- Link previews: XEP-0511 (`rdf:Description` with `og:` properties, `lib/xmpp-links.ts`), sent only in a chat written
  without encryption and when the space's previews switch is on, never through Tor, without the picture; read on
  messages from unencrypted chats only. An encrypted chat sends none.
- `checks/xmpp-more.check.ts` checks all of these against the server played in the checks.

## Not yet

- Moving a call to another device, and a call with one person that Dino makes into a group call
  while it goes on: it stays a call with that one person here (the invitation shows as missed while
  in another call).
- OMEMO 2 with Kaidan on a phone: so far only against python-twomemo and the server played in the
  checks.
- Photos and files against a real upload service: so far only the one played in the checks.
- Replies, changes, reactions and deleting against Conversations, Dino and Gajim on a phone: so far only against
  the server played in the checks (`checks/xmpp-actions.check.ts`).
- Moderators deleting others' messages in a group (XEP-0425).
- Notices while the space is closed against a real XMPP server (Prosody, ejabberd) and a relay on the internet.
