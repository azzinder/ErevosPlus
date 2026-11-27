# Erevos: the full overview

The short introduction is in the [README](../README.md); this page is the long version of what Erevos does, how it works and how to build it.

One private place for your conversations and your files: chats and calls with no phone number, no email and no
account, over the internet or without it, with Matrix, XMPP and Nostr too, and an encrypted Collection for your
photos, videos, music and documents.

**Not audited.** This is early work. No one outside the project has reviewed the code or the
cryptography. Do not rely on it to protect anyone yet.

- [docs/threat-model.md](threat-model.md): who Erevos protects you from, and what each one
  still learns.
- [SECURITY.md](../SECURITY.md): how to report a problem, and
  [docs/security-review.md](security-review.md): a map of the code for a security review.
- [CHANGELOG.md](../CHANGELOG.md): what each release changed.
- [docs/reproducible-builds.md](reproducible-builds.md): which published files can be built again from the source
  and come out the same (the web app can), and how to check.
- **Transparency**: what the server behind Erevos keeps, for how long, and what has been asked of it, in the user
  guide's Transparency part (`app/guide/en.ts`, `#transparency`), renewed with every release.
- [docs/linked-devices.md](linked-devices.md), [docs/public-groups.md](public-groups.md),
  [docs/matrix.md](matrix.md), [docs/xmpp.md](xmpp.md) and
  [docs/nostr-chats.md](nostr-chats.md): design notes.

## What it does

- **Chats** with contacts added from a link or a QR code. The link holds public keys and where to
  reach you, on a relay or on Nostr, never a phone number or a name. Someone new who writes first
  waits as a request, and hears nothing back until you accept. Chats show marks for sent, came and
  read, and when a contact is online or typing, unless a chat is set to appear offline. Every chat,
  those with people on Matrix, XMPP and Nostr too, opens at its last message, with round arrows to
  its start, to where you left off and to its end. A chat or a group can be locked with a PIN of
  its own, and locks again when you leave it.
- **Checking and introducing contacts.** Besides comparing a safety number, two phones can scan
  each other's QR codes under **Safety number**; each marks the contact **Checked in person**, with
  the day, on its own phone only. Nothing is sent, so a contact cannot claim to be checked.
  **Introduce to a contact** asks two of your contacts, each in its own chat with you, and only if
  both say yes do they become contacts (a week to answer, at most). Whoever introduces could pass
  someone else off, so the new contact's safety number is checked as any other.
- **Voice messages, photos and files.** A photo or file is encrypted with a key of its own, in
  chunks of one size per file, and put on the relay's file store. Only its key and where it is go
  in the chat. With no relay between two contacts they go another way (see Nostr below).
- **Groups**, private and public (anyone with a public group's link can ask to join). A private
  group can be made inside a hidden place too. Typing **@** names a member, who is told of the
  message even in a group they muted.
- **Voice and video calls** with a contact, group calls (sound for up to 8 people, pictures for up
  to 4), and a walkie-talkie in chats. Calls with people on Matrix and XMPP are below.
- **Disappearing messages**, replies, reactions, pins, stars, polls, stickers, sending a place,
  forwarding, search, and exporting a chat as text.
- **Edit a message you sent**, up to a day after sending it. Both phones show the new words with
  **Edited**, and so do your linked devices and every member of a group. Only words can be edited,
  not stickers, places, polls, voice messages, photos, files or forwarded words. A phone with an
  older Erevos keeps the old words.
- **How words look.** Marks typed around words show so in chats and groups: `*bold*`, `_italic_`,
  `~struck~`, backticks for code, and `||hidden||`, a grey bar until tapped. **Hidden photo**, under
  **+**, sends a photo that shows blurred until tapped. Nothing travels beside the words, so an
  Erevos from before shows the marks as typed and the photo as any photo.
- **Safety message.** Under **+** in a contact's chat: words that go only if you do not open Erevos
  for 6 or 12 hours, 1, 2 or 3 days or a week. The relay holds them as a message sent for later and
  sends them by itself, even if the phone is lost, off or taken; each time you open Erevos, past its
  password, they move on again. To your contact they come as an ordinary message.
- **Which way each message went**: hold a message and its menu says whether it went or came through
  the relay, through Nostr, to or from a phone nearby, over LoRa or by SMS. Messages from before
  say nothing.
- **Chat with myself and reminders**: a chat with no one else, first in every space and in every
  place of hidden chats, for notes, links, photos, files and voice messages. They stay encrypted
  in the space and go to no one but your own linked devices (a hidden place's go nowhere).
  **Remind me** sets a time; on Android a notice then says only **Reminder**, never what it is
  about, with Erevos closed and locked too.
- **Media, links and files**: a chat's details, and a group's, list its photos, videos, voice
  messages, music, files and links, each kind apart under its months, with a calendar. Chats
  imported from other apps are in it too. A photo opens on the whole screen, with zoom.
- **Link previews**, off unless the sender turns them on. The sender's phone fetches the page and
  the preview goes inside the message.
- **Send later.** The relay holds the message and sends it at its time, even if the phone is off
  by then.
- **Notifications you can steer.** On Android a chat or a group can be muted for 8 hours, 1 week or
  always, or given a message sound and a ringtone of its own (hidden chats can only be muted).
  Erevos's icon shows how many messages are not read, as a number or, on some phones, a dot; the
  web app's icon does too where the browser allows it (an iPhone or iPad from iOS 16.4, with
  notifications while closed on). Under **In the background** you choose how much battery Erevos
  saves: by default only the waste, or also the radios for phones nearby, or also letting the
  phone sleep, so that a message or a call can come a minute or two late.
- **Home relays**: up to three relays besides the main one, each with a queue of its own, which
  contacts write to while the main relay cannot be reached. Your own sends go through the first one
  that is ready when your relay is down. The contact link names the extra ones only while it stays
  short enough for one QR code; every message says them all, so a contact learns those the link
  left out. A contact on an older Erevos uses only the first. Each hidden place can have a home
  relay of its own.
- **A second password** opens a second space, with its own contacts, chats and relay queue. Nothing
  in the app shows that it exists.
- **Hidden chats**: four places in every space, each opened by typing its PIN into the home
  screen's search, or by holding **New chat**. Each has its own keys and its own relay queue, and
  its own Chat with myself, private groups, imports, and Matrix, XMPP and Nostr accounts. They
  close by themselves once Erevos has been in the background for 30 seconds. With **Receive while
  closed**, on for new places, a place goes on receiving while the space is open, and tells only
  "New message"; the cost is that its key is then kept with the space, so whoever copies what the
  phone keeps could open it without the PIN.
- **Linked devices**: a computer or browser linked to the phone by QR code, up to four. The phone
  stays the account and passes messages on to them. On a computer, **Link to my phone** comes first,
  with LPHL's relay and its sign-in at hand when a relay is asked for. The space's Matrix, XMPP and
  Nostr accounts can go along, end-to-end encrypted, each signed in there as a new device of its own.
- **Matrix, XMPP and Nostr accounts inside Erevos**, with no bridge: under **Settings** → **Relay
  and networks** a space signs in to a Matrix or an XMPP account, or makes (or brings) a Nostr key,
  and chats with people on Element, Conversations, Monal, Gajim, Dino, Damus, Amethyst and other
  apps. Their chats are in the home list under chips of their own, each marked, and they are **not
  anonymous**: a Matrix or XMPP server sees who talks with whom, and when, and a Nostr key is the
  same to everyone you write to. Matrix is encrypted with Olm and Megolm (vodozemac), XMPP with
  OMEMO 0.3 and OMEMO 2 (Erevos's own code, not audited; a private XMPP group is encrypted, a
  channel is not), Nostr chats with NIP-17. All three carry text, photos and files (up to 50 MB on
  Matrix, and on XMPP when the server takes so much, 20 MB on Nostr, fetched only when you tap),
  voice messages, reactions and replies, and all three have groups. Matrix also has edits, deleting,
  threads, polls, places, link previews, pins, forwarding, favourites, finding public groups and
  spaces, a search of the messages on the phone, new accounts, the account's devices, checking a
  device by emoji or by QR code, a Security Key and, on Android, single sign-on. XMPP has edits,
  deleting for everyone, blocking, new accounts, a new password, finding groups and running one,
  places and, in chats without encryption, link previews. Matrix and XMPP show profile pictures and
  can say when you write, off at first. They come while the space is open, not when it is closed or
  Android has stopped Erevos, as these servers send no push to the phone; Matrix and XMPP can have a
  closed space say "New message", through your relay, if it is set up for it. On Android they
  follow the space's Tor choice; in the web app and on a computer they go straight. Each hidden
  place can have accounts of its own, and backups hold them (a Matrix account signs in again, as a
  new device).
- **Calls with people on Matrix and XMPP.** Matrix: voice and video with Element Call, carried
  inside Erevos and shown in a window of its own, on Android, in the web app and on a computer
  (none on Sailfish OS). Sound and picture are end-to-end encrypted and go through the media server
  the Matrix server names, which sees the phone's address; never through Tor. Older one-to-one
  Matrix calls, as FluffyChat, Nheko and Element on a computer make them, ring here and can be made
  from here, encrypted in encrypted rooms. XMPP: voice and video calls as Conversations makes them,
  **Add video** in a voice call, and group calls in private groups as Dino makes them, up to eight
  people. The call is encrypted (DTLS-SRTP), but the fingerprint of its key passes through the XMPP
  servers as it is, so those servers could put themselves in between; it goes through the space's
  call relay or the XMPP server's TURN server, or straight with neither, never through Tor. A hidden
  place's own accounts call too, while its chats are open.
- **Erevos's own way through Nostr**, for when there is no relay between two contacts (Android): a
  phone with no relay taps **Start without a server**, and its contact link and QR code say where it
  reads on Nostr. Texts, stickers, reactions, edits and the marks go through public Nostr relays
  (three unless changed, five at most), through Tor when the space's Tor is on and straight when it
  is off, sealed once more for a key made for that chat alone, so the relays see neither who wrote
  nor to whom. A voice message goes the same way, in as
  many wraps as it takes. A photo up to 3 MB goes in pieces of 32 KB, each in a wrap, which the
  other phone keeps four days at most until all have come. A bigger photo, a video or any other
  file, up to 20 MB, goes as one blob, encrypted on the phone, to a Blossom file server, through Tor as the
  space's Tor choice says, which keeps only what it cannot read. Calls and groups still need a relay or the phone nearby.
  When your contact has a relay that lets them invite, their Erevos sends yours an invite to it by
  itself, once. With a relay, texts go through Nostr too unless turned off, to a contact whose
  Erevos reads on Nostr as well (not on an iPhone or a computer), and the relay is the backup if a
  text is not said to have come. Hidden chats do this as well, with a key of each place's own.
- **Nearby, without internet** (Android): Bluetooth LE, Wi-Fi Aware, the same Wi-Fi or hotspot,
  Wi-Fi Direct, and a Meshtastic LoRa radio. The desktop app and Sailfish OS have the same Wi-Fi
  too. A message that cannot go yet waits, marked in the chat, until there is a way. When the relay
  cannot be reached, other Erevos phones nearby can carry a sealed message to the contact's relay;
  carrying for others is on unless turned off. Hidden chats use them too while they are open or
  receive while closed, never carried and never over LoRa or by SMS, and the space never learns
  that a hidden contact is near.
- **Give Erevos to a phone nearby** (Android), with no internet: **Settings** → **General** serves
  the app from a small web server on the phone, to phones on the same Wi-Fi, hotspot or USB
  tethering (never mobile data), for ten minutes at most, four at a time, under a random address. A
  QR code opens a page with **Download Erevos** that shows the package's SHA-256 and its signing
  certificates, to compare. An Erevos with **Updates** takes it under **From a phone nearby**, up
  to 400 MB, and installs it only if its SHA-256 is the code's, it is signed with the same
  certificate and it is newer. An Erevos installed in parts, as some stores do, cannot be given.
- **Encrypted SMS when nothing else works** (Android, off unless turned on): when the relay, Nostr,
  the phones nearby and LoRa all fail, a text or a delete to an Erevos contact whose phone number is
  linked goes as data SMS, which no SMS app shows: the same end-to-end encrypted message the relay
  would have carried, in 3 SMS for a short text and at most 10. The first message to a contact,
  photos, files, voice messages, reactions, marks and calls never go so; they wait. Both phones
  need Erevos as the SMS app, each SMS costs what your plan says, and the phone company sees which
  number wrote to which, when, and how many SMS, never what. Never in hidden chats.
- **Tor** (Android only), per space: off unless you turn it on (**Nothing**), as it makes messages
  slower, and turning it on asks first. Then what you write goes through Tor (**Messages**), or
  everything, with bridges (obfs4, Snowflake and others) for where Tor is blocked. The same choice
  carries Nostr relays and file servers, Matrix, XMPP, and backups sent to your own server. With
  **Messages** a message never waits for Tor: while Tor starts, it goes straight.
- **Phone, SMS and contacts** (Android): Erevos can be the phone's SMS app (SMS and MMS, with a spam
  filter you can set), its phone app and its contacts app, with a home-screen widget.
- **Backups**: sealed with their own password, holding every space with its photos, files and
  voice messages, its Chat with myself and its Matrix, XMPP and Nostr accounts, with the panic
  password and the settings that go with you, so a restore brings the phone back as it was; the
  photos, files and voice messages go in files of their own beside the backup. Made by hand, or
  automatically every day or week into a folder you choose: on the phone, a memory card, or a
  cloud app that shows its folders in Android's folder picker; on a computer, any folder. The web
  app in a browser makes them by hand only. They can also hold the phone's SMS and MMS.
- **Backups to your own server too**: with automatic backups on (Android and the desktop app), each
  also goes to a folder on a WebDAV server, such as your own Nextcloud, with an app password made
  for Erevos alone. Each file looks like random bytes, under a random name, of a padded size, the
  photos, files and voice messages in uploads of their own, each a multiple of one size, and the
  server keeps the 3 newest; it still sees your account, when one comes, how many uploads and
  roughly how big,
  and your address unless it goes through Tor, which on Android follows the space's choice.
  **Restore from a server** lists the backups there (on a new phone, with the server's user name
  and password), downloads one the same way and opens it with its password; it works in the
  desktop app and the web app too. Through Tor no file of a backup over 64 MB comes, and straight none
  over 100 MB; a file chosen by hand goes up to 200 MB. The web app has **Send a backup now**, with
  a password typed each time, to a server set to let the web app in (Nextcloud is not as it
  comes). The desktop app and the web app have no Tor for it. Google Drive is left out on purpose.
- **Backup pieces with friends**: the backups' password, and the server's address, user name and
  app password when one is set, can be split with Shamir's secret sharing (Erevos's own code, no
  new dependency) into 2 of 3, 2 of 4, 3 of 4 or 3 of 5 pieces. Each piece goes to a contact as a
  message in your chat with them; they keep it apart from the chat, and show it as a QR code, copy
  it or give it back. Any k of the n pieces put together give the password back; fewer give
  nothing to test a guess against. Enough friends together can open your backups if they also get
  the file.
- **Panic button** (Android, the web app, a computer and Sailfish OS): under **Settings** →
  **Privacy and security**, one tap wipes everything Erevos keeps on the device: every space and
  hidden chat, the lock, the Matrix, XMPP and Nostr accounts, the relay tokens, the settings and
  credentials of automatic backups, and the keys in the Android Keystore; the backup files in the
  automatic backups' folder go first when you choose. A panic app such as Ripple can ask for it
  (PanicKit), but only an app you said yes to after the password, while **A panic app may wipe
  Erevos** is on; a request it was refused is said on the panic screen. It cannot reach backups you
  copied elsewhere or sent to a server, what the relay holds until it expires, or what your contacts
  have. A panic app exists only on Android; on a computer and on Sailfish OS the app's shell does
  the wipe: a computer then starts again as new, and Sailfish OS closes.
- **Delete me from everywhere**: under **Settings** → **Privacy and security**, one tap deletes what
  the servers keep for the open space and stops it; the phone keeps everything. It deletes every
  queue the space and its hidden places keep on the relays with the messages in them, the messages
  a relay holds for you to send later, files waiting there, and invites nobody used, and asks
  the Nostr relays to forget the keys your chats read on (NIP-62), through Tor when it is on; on request it also
  signs out of Matrix and XMPP and deletes the Nostr account made here. The space reaches no relay
  until **Start again**, which makes new queues and tells contacts quietly. It cannot reach your
  contacts' phones, Nostr relays that do not do as asked, files sent through a file server, or
  the Matrix and XMPP servers.
- **Invites**: **Invite someone** makes one QR code or link for one person and 7 days. On a relay
  that invites, their phone gets access of its own and a queue there with nothing typed, and you are
  contacts at once, with no message request. On Android a contact who is not in Erevos yet can be
  invited by SMS: a short link, good for 2 days, whose page offers them the app or the web app; the
  invite is after the # in the link, which no web server is sent.
- **Link for a website**: under **Your contact link**, a link that does not expire, to put on a web
  page such as a contact page. Its page offers Erevos to whoever has none yet, then adds you; what
  they send comes as a message request, and it gives no one a place on your relay.
- **Share to Erevos** (Android): Erevos is in other apps' Share menu. **Send to** lists your chats,
  groups and SMS conversations, never hidden chats; words and links open in the message field, a
  photo or file goes as soon as that chat opens.
- **Imports** from Telegram and WhatsApp exports, with their photos, videos, voice messages and
  files since 0.1.16, and Viber chats saved as .html by the Android app Backup Text for Viber,
  with their words. Imported chats stay on the phone, marked as imported. A chat's details have
  **Import a chat here**, also in a hidden place, where the import is kept with that place.
- **Updates in the app**: Updates → Check for updates reads `version.json` from the public
  release repository, only when you tap it. On Android it downloads the APK (one that stalls is
  tried again, three times in all), checks its size and SHA-256 against `version.json`, and opens
  Android's installer, but only once the release computer has signed that build. Also on Android, a space on LPHL's relay that does not send everything
  through Tor asks that server once a day whether a new version is out and says so at the top of
  the chats; it can be turned off, and it is not in the F-Droid build. **What's new** says what each
  version changed, in the app's language. Test versions such as 4.0.0-rc.1 install and update like
  any other.
- **Fingerprint or face unlock** (Android), off unless turned on. It opens only the first
  password's space.
- **Eight languages**: English, Greek, German, French, Spanish, Italian, Portuguese and
  Serbo-Croatian. The first start follows the phone's language, and Home → ⋯ → Settings →
  Language switches it. The user guide is in all eight. Android's notices and call screen are in
  Greek or English only.

## How it works

### Contacts and relays

- A relay holds one-way queues. A sender writes with a queue's sender id, the owner reads with its
  recipient id. There are no user accounts on the relay.
- Each space has a queue on its relay (and one on each of its home relays, if it has any), which
  its contact link names, for first messages. Each kept contact then writes to a queue of their
  own, said only inside the encrypted messages, so a relay cannot tell from where messages go that
  two contacts write to the same phone, and deleting or blocking someone deletes only their queue.
  These queues are read on a path of the relay that needs no token, so the token, which names the
  phone, does not tie them together; through Tor, eight at a time, each group on circuits of its
  own. The space's own queue stays for contacts who have none of their own yet, and for an older
  Erevos or relay. Each hidden place has a queue of its own, which all its contacts write to, for
  now, and so does each linked computer. Each space with a relay also keeps four more queues on it
  for hidden chats that say a message came: the queue of each place that asked for it, and queues
  no one writes to for the others.
- When you and a contact use **different relays**, messages go through two of them: your relay
  sees your IP address but not which queue the message is for, and the contact's relay sees the
  queue but only your relay's address. When you both use **the same relay**, it sees your IP
  address and the queue together, unless you set a second relay to send through, or use Tor. Without
  Tor, your own relay also sees the address your phone reads your queue from. See
  [docs/threat-model.md](threat-model.md) for what each relay learns.
- A relay can lend places to phones that have no relay of their own. Lending is off unless the
  relay's operator turns it on (`EREVOS_RELAY_LEND=on`). A ticket for a place goes into a contact
  link only when you choose to share a place for that link. A lent place may put 50 MB of files a
  day, and the operator can revoke tickets in a file.
- The relay closes connections left quiet for 5 minutes, or slow to finish their handshake, and
  takes at most 512 at once (128 on the paths that need no token). It holds at most 100,000 queues,
  and removes the ones no one has read for 180 days. Messages nobody takes expire after 14 days.
  `FORWARD` and `FILE_VIA` refuse addresses that are not on the public internet, unless
  `EREVOS_RELAY_PRIVATE_PEERS=allow`.

### Encryption

- 1:1 chats start with PQXDH (X25519 and ML-KEM-768), then use the double ratchet. Once each phone
  has had a message from the other, every packet is sealed once more for the phone it goes to
  (AES-256-GCM, with a key that phone gave inside the chat, and a 16-byte mark only the two can
  match), so a relay cannot tell from a packet which conversation in a queue it belongs to, and the
  phone opens it in that one contact's conversation instead of trying every contact. A
  conversation's first message, and any sent before the answer comes, still show the ratchet header
  (its public key and counters). An unsealed packet is tried in the conversations of contacts who
  seal at most 5 times an hour.
- Accounts have **no one-time prekeys**: the keys in a contact link never change, and several people
  may use one link. So a relay could replay a conversation's first message. The app remembers the
  ids of the last 100 first messages it accepted, and each contact's last 16, and ignores one it
  has seen.
- Each account also makes **newer prekeys** (a signed X25519 prekey and an ML-KEM-768 key) every 30
  days, and gives them to each contact inside their chat. The contact's Erevos then starts a new
  conversation with them, a new PQXDH, and both move to it once one answers there; the safety
  number stays the same. Each phone keeps its last three, and throws older ones away, with the
  ML-KEM secrets of the conversations they started. The contact link's own prekeys are kept for as
  long as the account, for anyone new who has the link. Contacts on an older Erevos stay in the
  conversation they have. Each renewal is a first packet the relay can see, once a month per contact.
- Every message is padded to one of four sizes: 256, 1024, 4096 or 16384 bytes.
- Each pair of contacts has a safety number to compare.
- A backup holds each chat's ratchet as it was then, and the phone used later keys since. So after
  a restore, each chat skips 900 sending keys ahead before it sends, so that no message key (which
  also gives the nonce) is used twice. More than 900 messages sent to one contact between the backup
  and the restore would still meet used keys.
- **Groups** use MLS (RFC 9420) through OpenMLS, with the classical ciphersuite
  `MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519`. Group messages are **not** post-quantum. Only the
  group's keeper (its maker, or a public group's owner) commits. Every week each phone's keys in
  each group are made new: the keeper's with a commit of its own, a member's by the keeper putting
  it in anew, in one commit, with a key package the member gives for that. So a member whose group
  keys leak heals within a week, once the keeper's Erevos does this too; members on an older one
  see the same member as before.

### Calls

- Calls use WebRTC. The call is set up with signals sent inside the chat's end-to-end encryption,
  including the fingerprint of the key that encrypts the call (DTLS-SRTP).
- When the relay has a call relay (TURN), calls go only through it, so neither phone learns the
  other's IP address. The server running it sees both. Without a call relay, the phones offer their
  own addresses, and each sees the other's; this usually works only on the same network.
- Calls with people on Matrix and XMPP are not set up that way. A Matrix call is Element Call's:
  sound and picture are end-to-end encrypted per person and go through the media server the Matrix
  server names. An XMPP call's key fingerprint passes through the XMPP servers as it is, not
  end-to-end encrypted, so those servers could put themselves in between.
- No link starts a call. A link from another app or a web page may open a chat; a call starts only
  from a tap inside Erevos.

### Tor

- Tor (Arti, inside the app) carries the connections to relays and, by the same choice, to Nostr
  relays and file servers, Matrix and XMPP servers, and the WebDAV server of backups; only on
  Android. A new space has Tor off (**Nothing**), and then the relay and the Nostr relays see the
  phone's address; a space made before keeps its choice. With **Everything** there is no falling
  back to a direct connection. With **Messages**, files and voice messages go straight, and a
  message never waits for Tor: while Tor starts, or for a minute after it could not reach the
  relay, it goes straight.
- Calls do not go through Tor. Calls go direct or through the call relay (for Matrix, through the
  media server the Matrix server names). Link previews are not made while everything goes through
  Tor, and the update check refuses to run then.

### On the device

- Each space has its own random key, which seals everything it keeps. Behind a password, the key is
  kept only sealed by it. A space without a password lock keeps its key in the OS keystore, so
  whoever can read the keystore can open it. Passwords and PINs are stretched with PBKDF2-SHA256,
  200,000 rounds, and then Argon2id (32 MiB, 3 passes), so every guess costs memory as well as time;
  backups the same. Slots and automatic backups from before Argon2id get it at the next start or
  backup, without the password. Passwords and PINs need at least 4 characters; backup passwords
  need at least 12.
  Wrong passwords make the next try wait, but that does not slow down someone who has copied the
  stored data: see [docs/threat-model.md](threat-model.md).
- The lock keeps at least four password slots, and every space keeps a slot for each of its four
  hidden places. The unused ones hold random data shaped like used ones, and unlocking tries all of
  them. So neither the stored data nor the time it takes shows how many are in use.
- Message history is kept in sealed pages of 16 KB (a few times that for one very long message),
  the pages of every space and every hidden place side by side. The rest of what a space keeps
  (contacts, conversations, groups and more) is in files holding a value of the same size for every
  space and hidden place, used or not; a value larger than that goes to pages like the history's,
  among them. Values an older version kept in whole blocks keep their size until their space next saves
  them.
- Turning the password lock off inside a second space writes, unsealed, which space opens by
  itself. So whoever can read the phone's stored data then knows the phone has a space before it.
- On Android, Erevos stays out of screenshots, screen recordings and the recent-apps preview while
  hidden chats are open, always, and while a space with a password lock is open, unless **Screen
  privacy** is turned off in its security settings.
- Photos sent as photos lose their metadata: JPEG and PNG are cleaned (location, phone, time,
  thumbnails, motion-photo video), and other kinds are made into a new JPEG. Videos and anything
  sent as a file go as they are.
- **SMS and MMS** in SMS-app mode, the call log and the phone's contacts live in Android's own
  stores, as for any phone app. Erevos does not encrypt them.

## Platforms

- **Android**: the full app. The release APK is for 64-bit ARM.
- **iPhone**: the web app (`pwa/`), from Safari. The native iOS build has no chat ("Chat runs on
  Android and on a computer for now").
- **Linux, Windows and macOS**: the desktop app (`desktop/`), the web build with the core in
  WebAssembly, in Electron. No Bluetooth, SMS or Tor there; the same Wi-Fi works. Closing its
  window leaves it running in the system tray (on a Mac, in the Dock), unless turned off: it goes
  on waiting at the relay, rings calls with a ring of its own and says how many messages are not
  read. Matrix calls and the panic button work there.
- **Any browser**: the web app. Its releases are signed with an offline Ed25519 key, and its
  service worker runs only signed releases. See [pwa/README.md](../pwa/README.md) for what that
  protects and what it does not. Calls ring while it is open; the panic button and Matrix calls
  work there.
- **Sailfish OS**: the web build in Sailfish WebView, packaged as an RPM; the same Wi-Fi works. A
  small helper of its own tells of messages and calls while it is closed. No Matrix calls. Not yet
  tested on a phone. See [sailfish/README.md](../sailfish/README.md).

## Tried on phones

Erevos is tested with checks on every change, but only some of it has been tried by hand on real
phones (a Pixel and two other Android phones) and computers:

- **Tried**: a second password's space, hidden chats, QR contacts, chats through a relay and its
  home relay (once the spare relay), sealed history, disappearing messages and the marks, voice
  messages, photos and files, 1:1 voice and video calls, backups, Telegram and WhatsApp imports
  (before their media came along), chats over Bluetooth between two phones, SMS-app mode, looks and
  themes, the Linux desktop app, and Web Push to the web app on an iPhone.
- **Not tried yet**: groups and group calls, the walkie-talkie, calls without internet, ringing and
  receiving in the background, MMS and two SIMs, Tor, the same Wi-Fi, Wi-Fi Direct, LoRa, carrying
  for others, linked devices, the language switch, the Sailfish app, imports with media,
  lent places, appearing offline in a chat, end-to-end encryption over the nearby links, a message
  waiting for a way to go, a hidden place's own home relay, and everything new in 4.0.0-rc.1, which
  the [changelog](../CHANGELOG.md) lists: Matrix, XMPP and Nostr chats and calls, the accounts of
  hidden places, Erevos's own way through Nostr, backups to a server and in pieces, the panic
  button, giving Erevos to a phone nearby, encrypted SMS, more than one home relay, and the tray
  on a computer.


- `app/`: the Expo app (React Native, expo-router), for Android, the web app, the desktop app and
  Sailfish. `app/lib` holds the chat logic, `app/lock` what is kept sealed on the device,
  `app/modules` the Android native modules.
- `crates/erevos-core`: protocol and crypto: PQXDH, the double ratchet, padding, two-hop sealing for
  relays (`relay_seal.rs`), byte encodings and frames. `mesh.rs` is a store-and-forward design with
  routing tags that the apps do not use; nearby messages are handled in `app/lib/nearby.ts`.
- `crates/erevos-ffi`: the core as the apps call it, through JNI on Android and WebAssembly
  elsewhere. It keeps nothing between calls.
- `crates/erevos-group`: group chats, MLS through OpenMLS.
- `crates/erevos-import`: reads Telegram and WhatsApp exports.
- `crates/erevos-matrix`: Matrix encryption (Olm and Megolm through vodozemac); the app talks to
  the Matrix server (`app/lib/matrix*.ts`).
- `crates/erevos-nostr`: Nostr events (NIP-01 signing, NIP-44 encryption, NIP-59 wrapping) for
  Erevos's own way through Nostr and for chats with other Nostr apps.
- `crates/erevos-xmpp`: OMEMO 0.3 and OMEMO 2 for XMPP accounts; the app talks to the XMPP server
  (`app/lib/xmpp*.ts`).
- `crates/erevos-tor`: connections through Tor with Arti, for Android: relays, Nostr relays and the
  servers of Matrix and XMPP.
- `crates/erevos-relay`: the relay server: queues over TCP and WebSocket, an optional bearer
  token, an optional journal on disk, a file store, two-hop forwarding, messages held for later,
  Web Push for the web app, credentials for a call relay, lent places, a push gateway for Matrix
  and, when named, a push app server for XMPP.
- `deploy/relay`: scripts that run the relay on a Debian or Ubuntu server behind Caddy, with TLS
  from Let's Encrypt and a call relay (coturn). See its [README](deploy/relay/README.md).
- `deploy/web`: scripts that sign the web app and serve it from your own server.
- `desktop/`: the Electron app.
- `pwa/`: the web app's service worker, build and signing tools.
- `sailfish/`: the Sailfish OS shell.
- `transports/`: the Go module for lyrebird, Tor's pluggable transports for bridges.

## Build

The Rust crates:

    cargo test

The app's checks and the desktop app need Node 22, Rust with the `wasm32-unknown-unknown` target
and wasm-bindgen-cli 0.2.129 (`cargo install wasm-bindgen-cli --version 0.2.129 --locked`).

The app's checks, from `app/` (they run the real core in WebAssembly and real relays):

    npm ci
    npm run typecheck
    node checks/build-core.mjs
    cargo build -p erevos-relay
    npm run check

The desktop app, from `app/`:

    npm ci
    node scripts/build-web-core.mjs
    EXPO_PUBLIC_SHELL=electron npx expo export --clear --platform web --output-dir ../desktop/web
    node ../pwa/element-call.mjs node_modules/@element-hq/element-call-embedded/dist ../desktop/web/element-call
    cd ../desktop && npm ci && npx electron .

The Android app is built by `.github/workflows/android.yml` (pull requests and by hand) and by the
release workflow: `npx expo prebuild --platform android`, then Gradle, with cargo-ndk and Go for
lyrebird.
With `EREVOS_DISTRIBUTION=fdroid` set for the prebuild and Gradle, it is the F-Droid build, which
F-Droid updates: Updates has no **Check for updates** and the app may not install packages
(`app/app.config.js`). The releases build it as F-Droid builds it (`scripts/fdroid-build.sh`,
`deploy/fdroid/`) and sign it apart with the release key (`scripts/fdroid-sign.sh`), so that
F-Droid hands out that signed APK (docs/reproducible-builds.md). Every build leaves out the Google Play services entry that expo-image-picker
puts in the manifest (`app/plugins/with-no-gms-entry.js`).

## Releases

`.github/workflows/release.yml` (workflow `release`) builds every package and publishes them as a
GitHub release, named by the version given when it is started by hand, else the next number after
the latest release (`v2.0.1` after `v2.0.0`): the Android APK, Linux (Arch package and AppImage),
the macOS disk image, Windows (installer and portable .exe), the Sailfish OS RPM and the web app,
with `SHA256SUMS`. A package whose job fails is left out and the others still go. The workflow is
set to run every night at 02:30 UTC when main has changed, while it is enabled on GitHub, and by
hand (Actions, release, Run workflow). The five newest releases stay. Some run numbers have no
release; [CHANGELOG.md](../CHANGELOG.md) lists the ones there are. A build's number is the run's,
unless an Erevos+ build already took it or one above it: Erevos and Erevos+ are the same app to
Android and install over each other, so every build of either has a number above all before it.

A test release before a version is named as in `4.0.0-rc.1` (a release candidate; also
`-alpha.<n>` and `-beta.<n>`): it comes after 3.x and before 4.0.0, the one after it is
`4.0.0-rc.2`, and it goes out as the latest release like any other, so **Check for updates**
finds it. The Sailfish RPM's version is `4.0.0~rc.1`, since RPM allows no "-".

The web app comes unsigned: the release computer, which holds the web release key, signs it and
serves it with `deploy/web/publish.sh` (see [pwa/README.md](../pwa/README.md)).

The APK is signed with Erevos's own release key, made once with
`scripts/make-release-keystore.sh`, which names the four Actions secrets it needs. Without them the
release goes out without an APK. Android installs a release only over an app signed with the same
key, so a phone with a build from a computer (signed with the debug key) has to uninstall it first:
make a backup before.

The release key's certificate (`CN=Erevos, O=LPHL, C=GR`) has this SHA-256, the same in every release
APK; check a download with `apksigner verify --print-certs erevos-android.apk`, or on the phone with
an app such as AppVerifier:

```
49:F0:D9:BE:60:09:2F:02:CF:27:C5:24:67:52:55:01:93:A6:7B:81:21:29:BF:53:41:79:53:B7:C8:79:8E:69
```

Each release also goes to the public repository `azzinder/erevos-releases` when the Actions secret
`RELEASES_TOKEN` (a token that may write releases there) is set, with a `version.json` that
**Updates → Check for updates** in the app reads. The app never asks GitHub by itself. On Android
it downloads the APK, checks its size and SHA-256 and opens Android's installer, but only once the
release computer has signed that build (`android-update.json`, written by `deploy/web/publish.sh`);
elsewhere it opens the release page. Apart from that, on Android a space on LPHL's relay that does
not send everything through Tor asks that server once a day whether a new version is out (off with
**Tell me when a new version is out**; not in the F-Droid build), and it counts only once the
release computer has signed the build and its name.

The repository variable `EREVOS_MACOS` set to `off` leaves the Mac out (a Mac minute counts as ten),
and `EREVOS_WINDOWS` set to `off` leaves Windows out (a Windows minute counts as two). The macOS app
is signed ad hoc, not by Apple; 4.0.0-rc.6 is the first release with one. A release that went out
without it gets it later from **Actions → release-macos → Run workflow** with its version: built from the
release's commit, with its build number, and added to its files, SHA256SUMS and notes on both
repositories. The Windows files are not signed: that needs a code signing
certificate, so Windows' SmartScreen warns before the first start.

## Built with others' open source

Erevos stands on the work of many other projects: Element Call for Matrix calls, Arti and The Tor Project's bridges for Tor, vodozemac and OpenMLS for encryption, the RustCrypto and dalek crates, rustls, React Native, Expo and Electron, among others. [CREDITS.md](../CREDITS.md) names every package it uses, with its maker and licence. A change that adds or updates a dependency runs `node scripts/credits.mjs` and commits the result with it; `npm run check` in `app/` fails otherwise.

## Licence

AGPL-3.0-or-later, with additional terms under its section 7: keep "Erevos, by azzinder", mark a changed version as changed, and give it another name. Who makes Erevos and how, and the terms in full: [AUTHORS.md](../AUTHORS.md). Every file says whose it is and under which licence, the [REUSE](https://reuse.software) way (`reuse lint`; `npm run check` fails on a file without it).
