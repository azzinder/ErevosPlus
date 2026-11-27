<!--
SPDX-FileCopyrightText: 2026 azzinder
SPDX-License-Identifier: AGPL-3.0-or-later
Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.
-->

# The servers Erevos talks to

Every server Erevos can reach, what each one sees, and what it keeps. In Greek: [servers.el.md](servers.el.md).
The fine print, for each kind of attacker, is in the [threat model](threat-model.md). **Not audited**: this page says
what the code is meant to do, not what anyone has checked.

None of these servers can read what you write: messages, photos, files and calls are end-to-end encrypted on the
phones. What a server can see is **who connects, when, and how much**.

## At a glance

| Server | When it is used | Sees | Does not see |
|---|---|---|---|
| [Your server](#your-server) | Always, unless you use none | IP addresses, when, sizes, how much each contact writes | What you write, names, numbers, who your contacts are |
| [Your contact's server](#your-contacts-server) | When they use another server | Your server, or your address when you write to them directly | What you write |
| [Call server](#call-server) | Calls, when your server has one | Both phones' IP addresses during a call, how long, how much | The call itself |
| [Nostr servers](#nostr-servers) | Texts, on Android, unless turned off | Your IP address (or a Tor exit), padded sizes, which messages belong to one chat | Who is in the chat, what it says |
| [The web app's server](#the-web-apps-server) | Loading the web app, Check for updates | The IP address that loads it | Anything you do in it |
| [Push services](#push-services) | Web app only, notices while closed | That a notice came, and when | What, or from whom |
| [GitHub](#github) | Only when you tap Check for updates | Your IP address, that a device checks | Anything else |
| [Websites, for link previews](#websites-for-link-previews) | Only with previews on, as you send | Your IP address (or Tor's), when | Who the message is for |
| [Others](#others) | Tor, backups, the radio, LPHL sign-in | See below | |

## Your server

The server holds messages until the other phone takes them. You choose it: LPHL's (`erevos.lphl.nekten.eu`), your
community's, one you run yourself (the program comes with Erevos), or none at all for phones that only meet nearby.

**It sees:**

- The **IP addresses** that write into your queues and yours reading them. With Tor on, a Tor exit instead of yours.
- **When** messages come and are taken, and when your phone waits.
- **Sizes**: every message is one of four fixed sizes, and files go in pieces of fixed sizes.
- **How much and when each contact writes**, because each contact you kept writes to a queue of their own. Not who
  they are, beyond the address that writes.
- Whether a packet is a message someone reads or word between phones, and when a call rings.
- With the web app's notices while closed: a push address for your queues.

**It does not see** what you write, your name, your phone number, your contacts' names, or your list of contacts.

**What LPHL's server keeps, and for how long** (the same table is in the app's guide, under *Transparency*):

| What | For how long |
|---|---|
| Messages that wait, encrypted end to end | Until taken, 14 days at most |
| Photos and files, encrypted, in pieces | Until taken, 14 days at most |
| Messages sent for later, encrypted | Until their time comes |
| Queues: random ids with no name | Until unused for 180 days |
| Access lines: the SHA-256 of each phone's token, and a name (random, or the LPHL user name) | Until the line is taken out |
| Web app push addresses | Until notices are turned off in the web app |

It writes **no log of connections**, and the web server in front of it keeps no access log since 24 October 2026.
Errors are logged, and an error can name an address. The server's folder is **backed up every day**, with the waiting
messages still encrypted. The machine is hosted by **Hetzner**, which runs its network.

A server someone else runs keeps what its operator chooses: the program is the same, its settings and logs are theirs.
A **home server** (Settings → Server and networks → Home server), which contacts write to while yours is down, sees the
same as your server, for what goes through it.

**Delete me from everywhere** (Settings → Privacy and security) deletes what the servers keep for a space, and stops
it.

**Someone between your phone and the server** (your network, or whoever gets a certificate for the server's name): once
the server has proved its own key to your phone, they see only that you connect, when, and how much.

## Your contact's server

When your contact uses another server, your server passes your messages on to theirs. Their server sees your server, not
your address; yours sees which server you send to, not the queue. Two operators who compare their logs can still match
messages by time.

## Call server

A server can have a **call server** beside it (a TURN server, LPHL's has one). Calls then go through it, so neither phone
learns the other's IP address.

- **It sees** both phones' IP addresses during a call, when the call starts, how long it lasts and how much passes.
- **It does not see** the call: voice and video are encrypted end to end between the phones (DTLS-SRTP), with keys
  checked through the encrypted chat.
- It serves only phones the server lets in.
- Calls **never go through Tor**.

Without a call server, a call connects only directly, and then **the other phone sees your IP address**.

## Nostr servers

On Android, texts also go through public Nostr servers (**on, unless turned off**, under **Settings → Server and networks → Nostr**), so a message
still arrives when the server is down. The first ones are `relay.damus.io`, `nos.lol` and `relay.primal.net`; you can
change them. They are **not ours**: they keep what they choose, for as long as they choose.

- Each text is wrapped (NIP-59) by a key made for that message alone, for a key your contact made for that chat
  alone.
- **A Nostr server sees** your IP address (a Tor exit, with Tor on), a padded size, a time moved back by up to an hour,
  and the chat's key: so it can tell which messages go to the same chat, **not who is in it**. It also sees that one
  phone reads several chats' keys together.
- A text not marked as arrived within five minutes also goes through your server.

## The web app's server

`erevos-web.lphl.nekten.eu` serves the web app's files, which are signed: the app refuses to run anything unsigned.
It sees the **IP address of the browser** that loads or updates it. It keeps no access log since 24 October 2026.
Check for updates on Android also asks it for the signed statement of the latest release.

## Push services

Only for the **web app**, and only with notices while closed turned on. The browser's push service (Apple, Google,
Mozilla or Microsoft) gets a push of always the same size, encrypted for your browser.

- **It sees** that a notice came, or a call rang, and when: at most one push every 15 seconds.
- **It does not see** what came or from whom.

The Android app uses **no push service**: it waits at the server itself.

## GitHub

Erevos never looks for updates by itself, since a regular check would tell GitHub every day that this device has
Erevos. Only when you tap **Check for updates** does it read `version.json` from GitHub. GitHub then sees your IP
address and that a device checks. Downloading a release from GitHub is the same.

## Websites, for link previews

Link previews are made by the **sender's phone**, as it sends, and only when previews are on. The phone fetches the
page itself, keeping no cookies. The site sees the phone's IP address and when, as it would from a browser, and
nothing about who the message is for. With the previews' own Tor switch on, the page is fetched only through Tor.
While the space sends everything through Tor, no preview is made at all.

## Others

- **Tor** (Android, off unless turned on): the first Tor node sees your IP address, not where you go; the exit sees
  where you go, not who you are. Only server and Nostr connections use it.
- **Your backup server**, if you set up automatic backups: it gets encrypted files with random names. It can tell them
  apart by size, count them, and see roughly how much each backup holds.
- **Internet radio** in the Collection: the station you play sees your IP address, as would any player. Searching for
  stations asks Radio Browser.
- **LPHL sign-in** (Authentik): sees each sign-in with LPHL, which gives your phone a server token.
- **SMS when nothing else works** (Android, off unless turned on): your phone company sees which number wrote to
  which, when, and how many SMS, never the words.

- **Speech and translation models** (Android, only when you ask for them): downloaded from LPHL's web server, or from
  a web folder you name instead (**Download from another server…**). That server sees your IP address and which model
  you fetch; Erevos checks every file against the hash it knows, and refuses one that differs.

## Your own servers instead of LPHL's

Nothing above needs LPHL. In the app: a server of your own or your group's (**New chat** → **I have no invite** → **I
have a server of my own**; calls come with it), a WebDAV server for backups and the Collection, a web folder for the
models, or no server at all (**Start without a server**). A contact page or an invite by SMS served from another web
server is read when pasted or scanned; only the build's own server and LPHL's open in Erevos by themselves.

Whoever builds Erevos for a community can also change what the app offers first, with two settings of the build
(`app/lib/servers.ts`): `EREVOS_WEB_ORIGIN` (the web server with the contact and invite pages and the models) and
`EREVOS_START_RELAY` (the server a phone with no server yet is offered to sign in at). Erevos's own release notices stay
on LPHL's server, as they go with its release key, and are asked only by phones whose server is LPHL's.

## Out of reach for any server

A server cannot read your messages, but someone who watches **both ends** of the internet at once can match messages
by time and size: Erevos sends no cover traffic. And whoever holds your **unlocked phone** sees what the open space
holds. What a stolen phone or key opens: [stolen-key.md](stolen-key.md).
