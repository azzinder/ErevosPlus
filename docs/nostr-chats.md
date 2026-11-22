# Chats with other Nostr apps

A space can have a Nostr key of its own and chat, one to one or in groups, with people who use
Damus, Amethyst, Primal, 0xchat or any other Nostr app that sends private messages as NIP-17 asks:
text, photos and files, voice messages, replies and reactions. Erevos talks to
the Nostr relays itself, as those apps do. This is not Erevos's own Nostr way (`app/lib/nostr.ts`,
the guide's "Through Nostr"), which carries Erevos's own chats between Erevos apps; the two share
only the core's Nostr code (`crates/erevos-nostr`).

## What Nostr chats do not have

They are not anonymous, and the app says so on them. The space's key is the same to everyone it
writes to, and anyone who has its npub can write to it. The relays where its messages arrive see
the key read them and, without Tor, from where. None of Erevos's own protections apply: no queue
per contact, no padding to one size, no relay of its own. What stays private is who wrote a
message, when, and what it says.

## How a message goes

As NIP-17 has it, with NIP-44 encryption and NIP-59 wraps:

1. The message is a kind 14 event, not signed (a rumor), its id worked out as any event's, with a
   `p` tag for the person.
2. The rumor is encrypted with NIP-44 from the space's key to the person's, and that is the content
   of a kind 13 event (the seal), signed by the space's key, with no tags.
3. The seal is encrypted with NIP-44 from a key made for this message alone to the person's, and
   that is the content of a kind 1059 event (the wrap), signed by that key, with a `p` tag for the
   person. The seal's and the wrap's times are set back by a random time up to two days.
4. The wrap goes to the relays the person's kind 10050 names, and nowhere else. A second wrap of the
   same rumor, for the space's own key, goes to the space's own relays, so its other apps with the
   key read along.

A wrap that comes is opened the other way, and counts only when the wrap's signature, the seal's
signature and the rumor's id are right, and the seal's key is the rumor's author: anyone else
could otherwise write in someone's name. Kinds other than 14 (text), 15 (a file) and 7 (a reaction)
are let be. A time in the future is shown as now.

## Groups

NIP-17 has no group to make or join: a group is the set of people a message names, its author and
its `p` tags. Each message is wrapped once for each of them and once for the space, as above. So:

- A chat's key is one person's key, or, for two or more others, `groupKey`: the SHA-256 of all the
  members' keys (the space's too), sorted, in hex. Every member's app finds the same group from any
  member's message. More than 20 others (`GROUP_MOST`) is let be.
- Nobody runs it: nobody can be added or taken out. A message to other people is another group.
- Its name is the `subject` tag; the newest one by its rumor's time wins, from any member. Erevos
  sends it with the next message after it was given or changed here (**Name this group**), not with
  each one, as NIP-17 asks: an old name sent late would undo a newer one. A newer name that comes
  first is not sent at all.
- Each message from someone else carries who wrote it (`from`), shown above it.

**New group** on the Nostr chats screen makes one from two or more of the space's one-to-one chats.

## Photos and files

As NIP-17 has them (kind 15), with the file on a Blossom server (BUD-01, BUD-02):

1. The file is encrypted on the phone with AES-256-GCM, by a key and a 12-byte nonce made for it
   alone (`sealFile`, `app/lib/nostr-files.ts`).
2. What is encrypted goes to the first Blossom server that takes it: `PUT /upload`, with an
   `Authorization: Nostr` event (kind 24242, `t` upload, `x` its hash, an `expiration` ten minutes on,
   `server` the host) signed by a key made for this upload alone, so the server cannot tell whose it
   is. The servers are the space's own list, or blossom.primal.net, blossom.band and nostr.download.
   An answer whose `sha256` is not the hash sent is refused. On Android through Tor
   (`torHttp`), as the space's Tor way says, as the chats go.
3. The message is a kind 15 rumor whose content is the file's URL, with `file-type`,
   `encryption-algorithm` `aes-gcm`, `decryption-key`, `decryption-nonce`, `x` (the hash of what is
   encrypted), `ox` (the file's own), `size`, `dim` for a photo and `name`. It goes as a kind 14 does.
4. A file that comes is fetched only when asked for (**Show photo**, **Save**), checked against `x`,
   opened with any nonce length (some apps send 16 bytes), and checked against `ox` when it is said.
   One with another encryption, or no `x`, shows as a file Erevos cannot open.

Up to 20 MB (`NOSTR_FILE_MOST`), what the servers above take without payment. A file fetched is kept
in memory while the space is open, not on the phone.

## Voice messages

A voice message is a file as above (kind 15) that is audio and says how long it lasts: a `duration`
tag, in seconds (`["duration", "3.2"]`; read as milliseconds, kept to a day at most). The microphone
beside the field (`components/matrix-voice.tsx`, shared with Matrix) records it while held, a minute at
most, under a second let go; the sound is AAC (`audio/mp4`, `voice.m4a`) from a phone, or what the
browser records (`audio/ogg`, `audio/webm`) in the web app and on a computer. It is sealed and
uploaded as any file, with the duration in the message (`nostrDmSendFile` takes `durationMs`). One that
comes with `audio/*` and a duration plays as a voice message, with **Play** and its length (0:03),
fetched and opened when asked (`VoiceClip` in `components/matrix-voice.tsx`); an audio file without a
length shows as a file with **Play** and **Save** (`components/network-file.tsx`). Whether another
app plays Erevos's as a voice message or as a sound file is for that app: NIP-17 has no voice kind of
its own. The home list and the chat's quotes say `Voice message, 0:03`.

## Replies

A reply is a kind 14 message with an `e` tag for the message it answers, marked `reply`:
`["e", <id>, "", "reply"]` (`nostrDmSend(key, text, replyTo)`). On a message that comes, the `e` tag
marked `reply` wins; with none marked, the first `e` tag counts, as apps that mark no answer write it.
The answer is kept as `replyTo` and shows the message it answers over its words, which a tap scrolls
to; one not on the phone says so. A message that failed and is sent again keeps its `replyTo`. A
photo, file or voice message sent while a message shows over the field answers it too: its kind 15
message carries the same `e` tag (`nostrDmSendFile(key, file, replyTo)`).

## Reactions

A reaction is a kind 7 rumor (NIP-25) wrapped as a message is, to the same people, its last `e` tag
the message reacted to and `k` its kind; `+` shows as 👍 and `-` as 👎. Each person's last one shows.
One that comes before its message (wraps come in any order) is kept, up to 200, and put on the message
as it comes.

## A chat through Tor by itself

A chat's **Through Tor** (`NostrDmChat.tor`, on this device only) sends everything of that chat
through Tor, whatever the space's Tor way, and never straight: its wraps to their inbox relays and
our own copy, the look-up of where they read (kind 10050), and its Blossom uploads and downloads.
These go on connections of the chat's own (`outTo(…, via)`, the chat's key as `via`), and the core
puts them on circuits of their own: `torTextOpen` takes `url` and the chat after a line break,
`torHttp`'s head a `chat` field (`crates/erevos-tor` `text_open_on` / `http_on`, isolation per
chat and host). Tor is started for it when the space's way did not (`ensureTor`). Reading the
inbox is one connection for all chats, so what comes follows the space's way; the switch says so.

## How it is built

- `crates/erevos-nostr/src/chat.rs`: one JSON request in, one JSON answer out (`op`: `keys_new`,
  `keys_of`, `decode`, `npub`, `nsec`, `nprofile`, `wrap`, `unwrap`, `sign`, `verify`), on top of
  the crate's NIP-44 and event code. NIP-19's bech32 (npub, nsec, nprofile with its relays, a
  `nostr:` before them, a key's hex) is written there by hand, with its checksum. Keeps nothing
  between calls.
- `crates/erevos-ffi` passes it on as one call, `nostrChat`, through JNI and WebAssembly.
- `app/lib/nostr-dm-net.ts`: NIP-01 connections. On Android through Tor on the core's own
  connection (`torText*`, as `app/lib/nostr.ts` uses), while the space's Tor way says so: with
  Messages a relay Tor cannot reach is tried straight, with Everything never. Straight WebSocket
  otherwise, and in the web app and on a computer. A relay that floods (5000 frames not read) is cut
  off. NIP-42: a connection given a way to answer answers a relay's `AUTH`, and asks again for what
  was refused with `auth-required`; one given none never answers. NIP-05 names are looked up at
  `/.well-known/nostr.json`, through Tor when the relays are.
- `app/lib/nostr-dm.ts`: the space's account (key, inbox relays, name, chats, who called themselves
  what, up to when it read all, the wraps it took), what goes out (kind 10050, kind 0 with a name
  only, kind 22242 for NIP-42), and taking a wrap into its chat. 500 messages kept per chat, 5000
  wraps remembered as taken, 300 chats at most: past that, the chat that moved least long ago with
  nothing of ours and no name given makes room, and when none has, a stranger's message waits on
  the relay until there is room.
- `app/lib/nostr-files.ts`: photos and files: encrypting, opening, the kind 15 tags, Blossom uploads
  and fetches.
- `app/lib/nostr-dm-store.ts`: the open space's account while the space is open (started in
  `app/_layout.tsx`, as XMPP is). Each inbox relay has a reading connection of its own, which reads
  wraps for the key from two days before it last read all (the times are set back), again after a
  pause that grows; what came since counts as read every ten minutes. Sending and looking up go on
  other connections, kept a minute after their last use, which never answer `AUTH`. The space's
  kind 10050 and kind 0 go to its own relays and to the relays people look them up on
  (purplepag.es, relay.damus.io, nos.lol, relay.primal.net) when they change and once a week, each
  newer than the last. The kind 0 is the key's newest profile on those relays with only its name
  changed (`profileFieldsOf`), signed a second after it, so a key brought from another app keeps its
  picture and words; none is written while no relay answers, nor over a profile that cannot be read
  (over 64 KB, or not a JSON object). Where someone reads is looked up on those, on the space's own and on the
  relays their nprofile or NIP-05 named, and kept six hours for sending. The people the space's key
  follows (its newest signed kind 3, at most 1000) and their names (kind 0, 200 keys a look-up, two
  look-ups at once) are looked up on the same relays only when New chat is asked to show them
  (`nostrDmFollows`), never kept, with no profile pictures; the kind 3 also on up to 4 relays the
  key's own NIP-65 list (kind 10002, `writesOf`) names for writing, where another app of a brought
  key keeps it. When no relay answers at all, the screen says so rather than that there is no list. Kept encrypted in the space
  (`app/lock/nostr-dm-data.ts`, file `erevos-nostr-dm`), and in backups (`app/lock/backup.ts`, the
  space's and each hidden place's, with the pages their values take): restored, the key and its
  chats come back as they were, since NIP-17 keeps no ratchet that could use a key twice
  (`app/checks/backup.check.ts`; not yet on a phone). A hidden place can have a key of its own
  (Hidden chats, below).

## Checks

- `crates/erevos-nostr` tests: NIP-19's own examples, NIP-17's own example message opened as its
  reader's and as its sender's copy (`tests/nip17-receiver.json`, `tests/nip17-sender.json`), a
  round trip, a seal signed by someone other than the rumor's author refused, signed events.
- `app/checks/nostr-dm.check.ts`, with relays played in `app/checks/nostr-relay.ts` (one that keeps
  wraps for their reader only and asks who reads, as NIP-17 recommends): keys as people write them,
  the NIP-17 example through the app's own code, a message to three people making a group, one to
  too many let be, a note to oneself, a time to come,
  the chats a stranger can make, and two keys writing both ways through each other's inbox relays,
  the space's guarded one asking who reads and told only by the connection that reads; the wraps
  signed by one-time keys, times set back, nothing on the look-up relay; the space's other app
  reading both sides; someone with no kind 10050 told so; the people the space follows, from its
  newest follow list, a changed one counting for nothing, and a newer one found only on a relay its
  NIP-65 list names for writing; a new name keeping the rest of a newer profile from another app; closing and opening the space; a relay
  that goes away read again; a NIP-05 name; the home list's rows; a group of three made, named and
  written in by all, its reactions (one before its message), and a photo through a Blossom server
  played in the check (encrypted there, the upload signed by a one-time key, opened by the others);
  a file another app sent with a 16-byte nonce.
- `app/checks/nostr-feed.check.ts`: the relays a page of the Nostr tab's posts is asked of, and for
  whom; a page from what several relays sent (each event and post once, checked, a share with
  its post, the people not followed and the future let be); paging with until that skips nothing
  behind a relay that sent all it was asked for, and does not stop on a crowded second; then, with
  the real core and the relays played in the checks, the space's follow list, a follow's own relay
  asked for their posts alone, 252 people asked of in asks of 200 at most, two pages, names asked only
  for those shown, nothing kept, and the follow list looked up again once the posts went; and a
  relay that answers the follow list and then cannot be reached keeps the page waiting no longer
  than its reach.
- `docs/nostr-checks/nip17-cross.ts` against nostr-tools, the library many Nostr apps are built on:
  a message Erevos wraps opens there, as the reader's and as the sender's copy; one it wraps opens
  in Erevos; npub, nsec and nprofile read the same both ways; a wrap changed on the way is refused;
  the kinds 10050, 0 and 22242 are signed as it checks them.

```
mkdir /tmp/nt && cd /tmp/nt && npm init -y && npm install nostr-tools@2.10.4
cd app && node checks/build-core.mjs
node --import ./checks/register.mjs ../docs/nostr-checks/nip17-cross.ts /tmp/nt/node_modules/nostr-tools
```

Not yet run with a Nostr app on a phone, nor against the real Blossom servers.

## Old private messages (NIP-04)

Many apps still send and keep private messages the older way: a kind 4 event signed by its author,
with a `p` tag for its reader, its content AES-256-CBC with the raw x coordinate of the two keys'
secp256k1 Diffie-Hellman point as the key, written `<base64>?iv=<base64>`. The core opens them
(`nip04_decrypt` in `crates/erevos-nostr`, the chat op `open_old`, which checks the signature and
the padding) into the same shape as a NIP-17 message, marked `old`, in the same chats. They are read,
never sent: Erevos sends only NIP-17. The reading connection asks for kind 4 to and from the key on
the inbox relays and on up to four more (`readRelays`): two from a brought key's own relay list
(kind 10002, looked up once, `lookForOld`) and the three big public relays. Each relay keeps its own
`oldSent` time, so a new one reads its past once and later only what is new. The relays see who
wrote such a message to whom, and when.

## Public posts

In a chat with one person, **Public posts** (`app/nostr-posts.tsx`) shows what they post for everyone:
kind 1 notes and kind 6 shares whose shared post is inside, each checked (the share's post too), each
once, newest first, `POSTS_AT_ONCE` (30) at a time with `until` for older ones (`postsOf` in
`app/lib/nostr-dm.ts`, `nostrDmPosts` in the store). They are asked of the look-up relays, of up to
three relays the chat was given, and of those their relay list (kind 10002) says they write on, which
is remembered only while Erevos runs. Read only, as the space's Tor way says, never kept; nothing is
fetched for them, so a picture or a link shows as its address. A content warning (NIP-36) covers a
post's words until **Show**; an answer (an `e` tag that is not a mention, NIP-10) says so.

## The posts of the people followed

The home list's **Public** chip (`components/public-feed.tsx`) shows one feed, as the home of Amethyst
or a Telegram channel shows it, of the public posts of the people the space's key follows and the
messages of the public Matrix rooms the space is in (`app/lib/public-feed.ts`); the **Nostr** chip
shows only the chats. The Nostr part of the feed is the public posts (kind 1) and shares (kind 6) of the people the space's key follows,
newest first, `FEED_AT_ONCE` (30) a page, more as the list comes to its end (or **Older posts**), the
newest again when it is pulled down (**Look again** in a browser). Each shows who wrote it, by the
name they gave themselves (kind 0) or one given here, with the start and end of their npub, its time
and its words, its photos inside it and a card for its link, fetched only as the space's **Photos**
choice says (`app/lib/public-fetch.ts`); a share says who shared it. Tapping who wrote one offers
their **Public posts** and **Write to them** (a chat). Under a post: answer (NIP-10), share again
(kind 6), like (kind 7), share a link, and take back one's own (kind 5); **New post** writes one, with
photos put on the space's file server unencrypted (NIP-92 `imeta` tags). These are signed with the
space's key and public (`nostrDmWritePost` and its kin in `app/lib/nostr-dm-store.ts`); tapping a post
opens `app/public-post.tsx` with its answers, likes and shares.

- Who: the space's newest follow list (kind 3), looked up as **Show the people you follow** does
  (`followListOf` in `app/lib/nostr-dm-store.ts`), each time the newest page is asked; where each of
  them writes, from their NIP-65 list (kind 10002, `writesOf`), asked for those not looked up yet, 200
  keys an ask, two asks at once, of the relays that gather lists (purplepag.es, user.kindpag.es,
  indexer.coracle.social) that answered, or of every relay that answered when none of those did.
- Where (`feedRelays` in `app/lib/nostr-feed.ts`): the relays for look-ups and those that gather
  lists (`LOOKUP_RELAYS`, `FOLLOWS_RELAYS`), for everyone; then `FEED_RELAYS_MOST` (8) of the relays
  they write on, each for those who write there, each next one the relay that reaches the most people
  no relay asked reaches yet. Each relay is asked once for each 200 of its people (relays limit the
  size of a filter), two at once, `limit` 30 and `until` for an older page.
- A page (`feedPage`): what all the relays sent, each event once and checked, a share's post too,
  each post once (a post shared, or shared by two, shows once, at its newest share), the people not
  followed, posts more than ten minutes ahead and shares with nothing to show let be. A relay that sent
  as many as it was asked for may keep more, older, which could come before what another relay sent: the
  page stops at the oldest time such a relay sent, so no post is skipped. The next page is asked until
  the oldest second shown, that second too, and each post shows once; a page that brings nothing new
  asks before that second, so a second with more posts than a page holds stops nothing.
- Names: only of the people on a page, 200 keys an ask, of the same relays as the lists, and only
  while the posts show. No profile pictures.
- How long: each relay asked for where people write or for names is reached within 20 s, as for the
  follow list, and only the keys a relay said all it keeps for count as looked up (the others are
  asked again with the next page); a page begins no such ask after `FEED_LOOK_MOST` (two minutes),
  so it comes with what was found by then. Through Tor, the calls that wait go on threads of their
  own (`torIo` in `ErevosCoreModule.kt`), not on the 64 the whole app shares, so twenty relays opened
  at once wait behind nothing.
- Kept: nothing. The posts are held by the screen while they show; the follow list, where they
  write and their names, by the store for the next pages, and forgotten once the posts no longer show
  (the other part, another tab, a search) or the space closes (`nostrDmFeedDone`). As the space's Tor
  way says, on connections that only look up and never answer `AUTH`. Always the space's own key:
  home never shows a hidden place's, and hidden chats have no feed.
- Said plainly: no key yet (with the way to Nostr chats), a key that follows no one, no relay that
  answered, no post found.

## Screens

- `app/nostr-chats.tsx`, under Settings → Relay and networks → Nostr chats: making a key or bringing
  one (its nsec); then the npub (copy, QR code of `nostr:npub…`), a new chat with an npub, nprofile
  or name@domain, the chats, the name others see, the relays where messages arrive (one to three),
  the nsec shown only when asked, and forgetting the key. It says the chats are not anonymous, how
  many of the relays it reads, and on Android whether through Tor.
  **New group** chooses two or more of its chats and a name; **File servers** lists where photos and
  files go, to change.
- `app/nostr-chat.tsx`: the messages, one tick once one of their relays took ours (NIP-17 says
  nothing more), Try again for one none took, a name given here only (a group's, for everyone),
  removing the chat here; in a group who wrote each message; **Photo** and **File**, and a photo or
  file that came with **Show photo**, **Play** (a sound) and **Save** (`components/network-file.tsx`);
  the microphone for voice messages and a voice message that came with **Play** and its length; a
  message held opens its menu (`components/message-menu.tsx`): six reactions to pick from, more behind
  **+**, **Reply** and **Copy**; the reply shows over the field with a ✕ and over the answer in the
  thread, where a tap scrolls to the message; under a message, the reactions it has. In a chat with one
  person, **Public posts** opens `app/nostr-posts.tsx` (above).
- The home list (`nostrInboxRows` in `app/lib/inbox.ts`): each chat is a row, `network: 'nostr'` with
  `nostr:` and the key's hex as its identity, named as given here, or as they call themselves, or by
  the start and end of their npub, in a Nostr chip of its own. The chip shows once the space has a
  key; it shows only the chats. The **Public** chip's feed (above) is rows of the same list, so the
  search over it stays as it is, and a search shows the chats it finds.

## Notices

Each change of the account says how many messages each chat has not read
(`app/lib/network-notices.ts`): what went up came, and shows the same notice as a message in Erevos's
own chats (`app/lib/background.ts`, `messageCame`), with its sound; what went down was read. The number
on Erevos's icon counts them (`app/lib/unread.ts`), the computer's notice too (`app/lib/desktop.ts`).
What a key brought from another app takes from its relays before they first say that was all
(`caught` is 0) tells of nothing. A chat has notifications of its own (`notify`, as
`app/lock/chat-notify.ts` keeps them), set from **Notifications** at the bottom of its screen on
Android; a muted one is left out. Its messages are marked read only while Erevos shows the chat.

## Hidden chats

Each place of hidden chats can have a Nostr key of its own, apart from the space's, that nothing
outside its hidden chats shows.

- `app/lib/place-networks.ts` runs the place's key (`followNostrDmPlaces`, each place's in
  `app/lib/place-lives.ts`) while its hidden chats are open, and while they are closed too if they
  receive while closed (`receivingPlaces` in `app/lib/place-receiver.ts`): then it reads its relays
  whenever the space is open, as the place's relay queue is read. Otherwise it stops as they close, and
  a closed place receives nothing. The key and its chats are kept encrypted with the place's key, in the
  place's own value of `erevos-nostr-dm`: the holders `hidden` and `hidden1` to `hidden3` of
  `app/lock/sealed-file.ts` (`hiddenHolder(pocket)`), beside the space's `space`, which never sees them.
  Its connections are its own, so no relay sees both keys on one.
- `app/lib/network-place.ts`: `app/nostr-chats.tsx` and `app/nostr-chat.tsx` read a `hidden=1` route
  param (`useNetworkWhere`), show the place's key (`nostrDmNow('place')`), say under the title that it
  is the hidden chats' own, and while they are on top what is done goes to it; the chat they open takes
  the param on (`whereParams`). The hidden chats' list (`app/app/chat.tsx`) has **Nostr** under it, and
  lists the place's chats (`nostrInboxRows`), which open with `hidden=1` (`components/chat-row.tsx`).
- While its hidden chats are closed and receive (**Receive while closed**), a message to it makes the
  notice say "New message", as for the place's other chats (`hearing` with the place, then
  `onPlaceNetworkMessage` in `app/lib/network-notices.ts`, which `app/lib/background.ts` hears, on
  Android only); while they are open, it sounds as theirs do. Nothing else of it tells outside them:
  no number on Erevos's icon or the home list, and no notification settings.
- `app/checks/place-networks.check.ts` checks the stores against the relay played in the checks, with
  the real core; not yet on a phone.

## Not yet

Files encrypted otherwise than with AES-GCM, a voice message's waveform, and a key kept by a signer
app (NIP-55) or a remote signer (NIP-46) in place of the nsec.
