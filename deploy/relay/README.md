# Running the relay on a server

This sets up the relay on a Debian or Ubuntu server so phones can reach it from
anywhere, as `wss://<domain>`. The relay itself runs the same on any Linux with
systemd: where another web server sits in front, such as Apache on Arch, the
parts that differ say how.

- The relay listens on `127.0.0.1` only. Caddy sits in front of it, gets a TLS
  certificate from Let's Encrypt and renews it.
- A random token is required on every connection from a phone. Only the two
  paths other relays use need none: `/sealed`, which takes nothing but sealed
  messages for this relay's own queues, and `/files`, which hands out or
  deletes a chunk of a file only to whoever knows its id; and `/join`, where a
  phone with an invite or a sign-in takes a token of its own (see
  [Invites](#invites) and [Signing in with an account](#signing-in-with-an-account)). With lending turned
  on (see [Lending places](#lending-places)), a phone may also come with a
  ticket from a contact link or with the lent token it got for it.
- Queues and waiting messages are kept on disk, so a restart or a reboot loses
  nothing, and a phone is not told again of messages it was told of before.
- No request is logged, by the relay or by Caddy. The relay's log names no
  phone and no one: a line of the file of tokens is named by the first 12
  hex digits of its token's SHA-256, and a forward or a file fetch that
  failed by why only, never by the address it went to.
- A call relay (coturn) runs beside it, so calls go between phones without
  either learning the other's IP address. Phones get credentials for it from
  the relay, so only phones with the token can use it.

## What you need

- A server (VPS) running Debian 12 or later, or Ubuntu 22.04 or later, with a
  public IP address and SSH access as root or as a user who can use `sudo`.
- A domain or subdomain whose DNS A record points at that IP address. Without
  one, `<ip-with-dashes>.sslip.io` names the same address (for `203.0.113.7`,
  `203-0-113-7.sslip.io`). Let's Encrypt usually issues certificates for those
  names, but its limits are shared with everyone who uses them.
- Ports 80 and 443 open to the internet, including in the provider's firewall
  if it has one. Port 80 is only used to get the certificate.
- For calls, port 3478 (UDP and TCP) and the UDP ports 50000 to 50999 open as
  well. A server whose public IP address is not on its own network card (the
  provider maps it, as AWS and Google Cloud do) also needs
  `external-ip=<public IP>/<private IP>` added to `/etc/turnserver.conf`.

## Install or update

From your checkout, on the commit you want to run:

    deploy/relay/deploy.sh root@203.0.113.7 relay.example.org

This copies the source to the server and runs `install.sh` there, which
installs Caddy and Rust, builds the relay, creates the token and starts both
services. Run it again to update. The token and the queues are kept.

Without a domain, leave it out: the server then uses
`<ip-with-dashes>.sslip.io` by itself.

### From a phone, with no computer

You need a way into the server's shell (an SSH app, or the provider's web
console) and a GitHub token that can read this repository: on GitHub,
Settings, Developer settings, Fine-grained tokens, Generate new token, only
this repository, Contents read-only, expiring tomorrow. Then, as root on the
server, paste this; it asks for the token without showing it:

    read -rp 'GitHub token: ' -s t; echo; curl -fsSL -H "Authorization: Bearer $t" https://api.github.com/repos/azzinder/erevos/tarball/main -o /root/erevos.tgz && rm -rf /root/erevos-relay-src && mkdir /root/erevos-relay-src && tar -xzf /root/erevos.tgz -C /root/erevos-relay-src --strip-components=1 && sh /root/erevos-relay-src/deploy/relay/install.sh; unset t

Delete the token on GitHub afterwards. Paste the same line again to update.

Already on the server with the source? Run `sudo sh deploy/relay/install.sh
relay.example.org` from the top of it instead.

## In the app

- Relay address: `wss://relay.example.org`
- Token: the part after `EREVOS_RELAY_TOKEN=` in the output of
  `sudo cat /etc/erevos-relay.env` on the server.

Every phone uses the same address. With only the relay's token, every phone
uses that one too; give each phone a token of its own instead (see
[Phones' own tokens](#phones-own-tokens)) to take one phone's access back
without touching the others. Do not post a token where others can read it.

To change the relay's token, run `sudo rm /etc/erevos-relay.env` on the
server, run the install again, and type the new token into every phone that
used it.

## Phones' own tokens

Each phone can have a token of its own, beside the relay's one, which keeps
working. Add a line to `/etc/erevos-relay.env`:

    EREVOS_RELAY_TOKENS=/etc/erevos-relay.tokens

and restart. Then, for each phone, run on the server:

    erevos-relay new-token Nekten-Pixel

It prints the phone's token, to type into its Relay settings as the token, and
a line to add to `/etc/erevos-relay.tokens`:

    echo '<the line it printed>' | sudo tee -a /etc/erevos-relay.tokens

The file holds only each token's SHA-256 and the name you gave, so reading it
does not let anyone connect. The relay reads it again whenever it changes,
with no restart, and says in its log how many tokens it holds. To take a
phone's access back, delete its line: from then on its token is refused, as a
wrong one is, and a connection it has open is closed at its next request. A
message it sent for later on its token waits while its line is refused, and is
dropped once the line is gone; the relay knows which phone sent it only in
memory, so one sent before the relay last started goes all the same.
Lines that start with `#` are left out. The relay must be able to read the
file: if its log says it cannot, run `sudo chmod 644 /etc/erevos-relay.tokens`.
The file must be the file itself, not a symbolic link to it: the relay writes
it through a new file and a rename (for invites and sign-ins), which would put
a file of its own where the link was, so it does not start with a link there,
and says so in its log. A folder on the way may be a link, as
`/var/lib/erevos-relay` is.

Once every phone has its own, remove `EREVOS_RELAY_TOKEN` from
`/etc/erevos-relay.env` and restart: then only the phones on the list come in.

To have phones invite others instead of making each token yourself, or sign in
with an account, the file goes in the relay's own folder: see
[Invites](#invites).

## Invites

A phone with a token of its own can invite more phones, each invite for one
phone, so you need not make every token yourself. Off unless you turn it on.
The relay then writes the file of tokens itself, so the file has to be in a
folder the relay may write in, and the service may write only in its own. The
service runs as a temporary user (`DynamicUser`), so systemd keeps that folder
at `/var/lib/private/erevos-relay`, which the service sees as
`/var/lib/erevos-relay`. Stop the relay, then put the file there:

    sudo systemctl stop erevos-relay

- With a file of tokens already in `/etc` (see
  [Phones' own tokens](#phones-own-tokens)), move it:

      sudo mv /etc/erevos-relay.tokens /var/lib/private/erevos-relay/phones.tokens

- With none yet, make one, with a line for your own phone so that it can
  invite (`new-token` prints the token to type into the phone):

      erevos-relay new-token Nekten-Pixel
      echo '<the line it printed>' | sudo tee -a /var/lib/private/erevos-relay/phones.tokens

  For sign-ins alone you may leave it empty: `sudo touch
  /var/lib/private/erevos-relay/phones.tokens`.

In `/etc/erevos-relay.env`, set these two lines (replacing an
`EREVOS_RELAY_TOKENS` line there already):

    EREVOS_RELAY_TOKENS=/var/lib/erevos-relay/phones.tokens
    EREVOS_RELAY_INVITES=on

then `sudo systemctl start erevos-relay`. Its log then says how many tokens it
holds, that phones with tokens of their own may invite others, how many it lets
in by invite at most, and how many invites it keeps. More `erevos-relay
new-token` lines go in with `sudo tee -a
/var/lib/private/erevos-relay/phones.tokens`.

In the app, a phone using one of the file's tokens has **Invite to the relay**
under its token. Each invite lasts 7 days and lets one phone in; a phone may
have 5 waiting at once and make 10 a day, and the relay holds 10,000 at most.
The relay lets in 100 phones by invite at most (`EREVOS_RELAY_MAX_INVITED`),
counting the invites still waiting, so that it never lets in more: past that a
phone is told it can make no invite now.
The QR code is a link with the relay's address and the invite's secret. The
relay keeps only the secret's SHA-256, the name typed, which phone made it
and when it expires, in `phones.tokens.invites` beside the file, so a restart
keeps them. The phone that takes it makes its own token and gives the relay
only its SHA-256, on the `/join` path, which needs no token; the relay adds
its line to the file:

    3f5c...e1 maria # invited by nekten-pixel on 2026-10-21

The name is the one typed, made safe for the line: lower case, Greek and
Cyrillic letters in Latin ones, `-` for spaces, at most 32 characters, and
`-2`, `-3` after it when the file has it already. The part after `#` is a
comment; the relay leaves every line and comment as it is, so add your own
notes there too. The phone that invited sees its invites in the app, and can
take back one still waiting or the phone that took one, which takes that line
out, and only that line: the phones it invited in turn keep theirs. Lent
places invite nobody.

A phone that comes with the relay's own token (`EREVOS_RELAY_TOKEN`), typed
in, cannot invite with it: Erevos asks the relay once, by itself, for a line
of its own, and from then on uses only that. The relay adds the line, as one
of yours, with the name the phone gave itself in invites (`phone` when none):

    9a01...c4 anna # came with the relay's token on 2026-10-24

So you can hand out the relay's token as before, and every phone that comes
with it still has a line you can delete alone. To take such a phone out,
delete its line, and change `EREVOS_RELAY_TOKEN` in `/etc/erevos-relay.env`
(then restart), so that it cannot come back with the old token: the phones
with lines of their own go on as they are, and only a phone that has not been
opened since it came, or has an Erevos from before, needs the new token. The
relay adds such lines only while invites are on, and 50 a day at most, so a
token that went where it should not cannot fill the file; they do not count
among the phones let in by invite. Hidden chats keep the relay's token.

A phone let in by an invite keeps the relay when the phone that invited it
loses it: when a phone's line goes, for whatever reason (its inviter took it
back, its sign-in was ended, or you deleted it), the phones it invited keep
their lines, and so do the ones those invited. A phone's inviter can still
cut it off, by taking back the invite it took, and that cuts off that one
phone. An invite still waiting whose inviter's line is gone lets no one in.
For this the relay keeps, in `phones.tokens.invites`, which phone's invite
each invited line came from, for as long as that line is in the file: keep
that file with the file of tokens, as without it no phone can take back the
phones it invited, and they no longer count toward
`EREVOS_RELAY_MAX_INVITED`. Turned off again, invites are still kept: the
relay reads `phones.tokens.invites`, makes no invites and takes none, and each
phone has its invites again once they are on again.

The relay never writes the file because it read it. A line it takes out (an
invite taken back, a sign-in ended) when the file cannot be written (the
folder cannot be written, say) is refused all the same, and taken out of the
file when the relay writes it anyway (an invite taken or taken back, a phone
signing in or signed out), or at its hourly sweep, and then only once the
file has stayed as it is for a minute (or is as the relay itself wrote it)
and is still, by its time, size and inode, as the relay read it a moment
before. So a save of yours that the relay reads halfway through (`nano` and
`cat >` write the file in place) loses no line: what the half it read lacks is
only refused until the rest is there. An invite is forgotten only once its
line is gone from a file that stayed as it is for a minute, so its inviter
still lists it, and can take it back, after a line refused, a write that
failed or a restart. A restart forgets a refusal not yet written out,
so the line works again until whatever took it out does so again: a sign-in's
record keeps it marked and takes it out again at start, and an invite whose
taking back could not be written stays, for its inviter to take back again. A
line replaced by signing in again on the same phone keeps its invites, to list
and take back, also when the relay stops halfway: the move is written down in
`phones.tokens.invites` before the new line goes in, and finished at the next
start.

Who invited whom goes by each token's SHA-256, not by the name on its line.
Putting a new token's line in place of a line of yours (a new `new-token` for
the same phone) makes another line: the phones the old one invited keep the
relay, but the phone with the new line no longer lists them or takes them
back, and the old line's invites still waiting let no one in. To have an
invited phone's line be as one you wrote, which no phone takes back, free it
from its inviter, with the relay stopped, since a running relay writes its own
copy of the invites over the file:

    sudo systemctl stop erevos-relay
    sudo env EREVOS_RELAY_TOKENS=/var/lib/private/erevos-relay/phones.tokens erevos-relay free-line maria
    sudo systemctl start erevos-relay

`maria` is the name on the line, in any case. The relay forgets the invite that
made it: the line is then as one you wrote, no longer counts toward
`EREVOS_RELAY_MAX_INVITED`, and its inviter no longer lists it or takes it
back. The folder the service sees as `/var/lib/erevos-relay` is
`/var/lib/private/erevos-relay`, readable by root only, as the service runs as
a temporary user (`DynamicUser`); run as root, `free-line` leaves
`phones.tokens.invites` to that user. Or run it as that user, in the folder as
the service sees it, with the settings of `/etc/erevos-relay.env`:

    sudo systemd-run --wait --pipe --quiet -p DynamicUser=yes -p User=erevos-relay \
        -p StateDirectory=erevos-relay -p EnvironmentFile=/etc/erevos-relay.env \
        /usr/local/bin/erevos-relay free-line maria

The relay also forgets an invite once its hourly sweep finds the line gone
from the file, so a line put back from a backup after that is as one you
wrote; put back before, it is still its inviter's to take back.

To take a phone off, delete its line, as for any token. A phone taken off can
no longer invite, and its invites still waiting let no one in, but the phones
it invited keep the relay, and the ones those invited: to take them off too,
delete their lines as well (each says `invited by` and the name of the line
that invited it). A connection a phone has open is closed at its next
request once its line is gone. The relay writes the file through a new file
and a rename, reads it again before each change, and writes only if the file
did not change meanwhile, so lines you add with `tee -a` or an editor are kept.
Only an editor left open over a change of the relay's and saved after it puts
the old file back: an invited phone's line is then lost, and, unless you put
it back before the next hourly sweep, it needs a new invite. The relay refuses
an invite, or a sign-in, for a token whose line is in the file already.

Behind Caddy nothing else is needed. Behind another web server, `/join` must
reach the relay as a WebSocket, as `/sealed` and `/files` do. Invites name the
relay by the address the inviting phone uses: the phone that takes one takes it
only for a `wss://` relay, or a `ws://` one on its own network (such as
`ws://192.168.1.10:7879`), never `ws://` across the internet.

## Signing in with an account

Phones can also sign in with an account at an OpenID Connect provider you
trust, such as LPHL's Authentik, and get a token of their own that way, with
no token typed in Erevos: the name and password go to the provider's page in
the browser only, and that page then shows a six-digit code, which the person
types in Erevos on the phone that started the sign-in. Every hour the relay
asks the provider whether each account may still sign in, and takes the
phone's line out once it may not. It needs the file of tokens in the relay's
own folder, put there as for [Invites](#invites) (invites themselves may stay
off, and the file may start empty), a client at the provider, a few settings,
and the `/signin/` path passed to the relay as plain HTTP.

### At the provider (Authentik)

In Authentik's admin interface:

1. **Applications → Providers → Create**, type **OAuth2/OpenID Provider**:
   - Name: `Erevos relay`.
   - Authorization flow: `default-provider-authorization-implicit-consent`
     (or the explicit one, to ask people each time).
   - Client type: **Confidential**. Keep the Client ID and Client Secret
     Authentik makes; they go in the settings below.
   - Redirect URIs/Origins: **Strict**,
     `https://erevos.lphl.nekten.eu/signin/callback` (where the field takes
     only regular expressions,
     `^https://erevos\.lphl\.nekten\.eu/signin/callback$`).
   - Signing key: any. The relay takes the ID token straight from Authentik's
     token endpoint, over TLS and with the client secret, and does not check
     its signature.
   - Advanced protocol settings, Scopes: `authentik default OAuth Mapping:
     OpenID 'openid'`, `... 'profile'` and `... 'offline_access'`. The last
     gives the refresh token the hourly check needs (an Authentik with no
     such mapping gives one without it). The `profile` one also gives
     `groups`, the names of the account's groups, which
     `EREVOS_RELAY_OIDC_GROUP` below needs. Email is not needed.
   - Subject mode: the default, **Based on the User's hashed ID**.
   - Refresh Token validity: the default (`days=30`) is enough, since every
     hourly check gets a new one.
2. **Applications → Applications → Create**: Name `Erevos`, Slug `erevos`,
   Provider: the one above, no launch URL. Under its **Policy / Group / User
   Bindings**, bind the group whose members may use the relay; with no
   binding, every account may. A binding stops new sign-ins only: to have
   the hourly check take off an account that leaves the group too, name the
   group in `EREVOS_RELAY_OIDC_GROUP` as well.
3. The provider's page shows its **OpenID Configuration Issuer**,
   `https://lphl.nekten.eu/application/o/erevos/` if Authentik answers at
   `lphl.nekten.eu`: that is `EREVOS_RELAY_OIDC_ISSUER`.

Any other provider works the same way: a confidential client with the
authorization code flow (the relay uses PKCE), that redirect URI, the scopes
`openid profile offline_access`, refresh tokens and userinfo (with a `groups`
list of names, for `EREVOS_RELAY_OIDC_GROUP`).

### On the relay

Add to `/etc/erevos-relay.env`, beside
`EREVOS_RELAY_TOKENS=/var/lib/erevos-relay/phones.tokens`:

    EREVOS_RELAY_OIDC_ISSUER=https://lphl.nekten.eu/application/o/erevos/
    EREVOS_RELAY_OIDC_CLIENT_ID=<the Client ID>
    EREVOS_RELAY_OIDC_CLIENT_SECRET=<the Client Secret>
    EREVOS_RELAY_OIDC_NAME=LPHL
    EREVOS_RELAY_PUBLIC_URL=https://erevos.lphl.nekten.eu

and, to let in only the members of one group (checked at sign-in and at every
hourly check), its name as Authentik shows it:

    EREVOS_RELAY_OIDC_GROUP=erevos

and run `sudo systemctl restart erevos-relay`. Its log then says that phones
may sign in with LPHL, and how many are signed in. A setting missing or wrong
stops it at start with a line saying which. The file is readable by root
only, which keeps the client secret from others on the server.

`EREVOS_RELAY_PUBLIC_URL` must be on the same host as the relay's address in
the app (`wss://erevos.lphl.nekten.eu` here): the app opens a sign-in page only
over `https://` on the relay's own host. The log also names, at start, any
line of the file named as a sign-in (`lphl:` here) that has no record in
`phones.tokens.signins`: such a line is never checked with the provider, so
take it out unless you wrote it yourself. The log names a line by the first
12 hex digits it starts with, never by the user name in it: `grep
^9b74c9897bac /var/lib/erevos-relay/phones.tokens` shows which line that is.

### In front of the relay

The browser comes to the relay's pages, `/signin/start` and
`/signin/callback`, as plain HTTPS on the same address as the WebSocket.
Behind Caddy nothing is needed: it passes every path. Behind Apache, add these
two lines to the site's virtual host (on the LPHL server,
`87-erevos.conf`), above the line that passes the WebSocket on, since Apache
takes the first `ProxyPass` that matches:

    ProxyPass        /signin/ http://127.0.0.1:7879/signin/
    ProxyPassReverse /signin/ http://127.0.0.1:7879/signin/

They need `mod_proxy_http` beside `mod_proxy`:

- On Debian or Ubuntu (`apache2`, sites in `/etc/apache2/sites-available`):
  `sudo a2enmod proxy_http` if `apache2ctl -M | grep proxy_http` shows
  nothing, then `sudo apachectl configtest && sudo systemctl reload apache2`.
- On Arch (`httpd`, settings in `/etc/httpd`, virtual hosts in the files
  `/etc/httpd/conf/httpd.conf` includes): there is no `a2enmod`. If
  `httpd -M | grep proxy_http` shows nothing, take the `#` off (or add) the
  line `LoadModule proxy_http_module modules/mod_proxy_http.so` in
  `/etc/httpd/conf/httpd.conf`, beside the one for `mod_proxy.so`. Then
  `sudo httpd -t && sudo systemctl reload httpd`.

To see it work:

    curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "https://erevos.lphl.nekten.eu/signin/start?claim=$(printf '%064d' 0)"

answers `302` and Authentik's authorize address; a `404` or `500` is Apache's,
not the relay's. A relay from before this change also had a `/signin/confirm`
page; nothing posts to it any more, and the lines above cover what is left.

One browser may start 10 sign-ins a minute; past that it gets a page asking it
to wait a minute (`429`). The relay tells browsers apart by their address: the
connection's, or, when the connection comes from this machine (`127.0.0.1` or
`::1`), as it does from Apache or Caddy in front, the last address in
`X-Forwarded-For`. Apache's `ProxyPass` sets that header itself, adding the
address it took the request from after any the browser sent, and so does
Caddy: nothing to add for it. Through a proxy on another machine, every
browser counts as that proxy. Run the `curl` above more than 10 times a minute
and it answers `429` too.

### What it keeps and does

- Each phone that signs in gets a line of its own in the file of tokens,
  named after the provider and the user name, made safe as invites' names
  are, with `-2`, `-3` for more phones of the same account, 10 at most:

      9b74c9897bac770ffc029102a200c5de...c1 lphl:nekten # signed in with LPHL on 2026-10-21

  Signing in again on the same phone replaces its line, and the new line has
  the invites of the old one, to list and take back.
- The page the provider sends the browser back to shows a six-digit code the
  relay made, and the phone claims its token with it: someone who sends a
  sign-in link and signs in with it themselves sees the code, so the phone
  that made the link, which has not got it, gets nothing. Five wrong codes end
  the sign-in.
- `/var/lib/erevos-relay/phones.tokens.signins` holds, for each such line,
  the account's id at the provider (`sub`), the user name, when it was last
  checked and last answered, and the provider's refresh token, sealed with a
  key made from the client secret, so a copy of the folder alone holds none
  that can be used. The record is written before the line goes in the file of
  tokens, and taken back if the line cannot go in. A file left by a test
  build from before the code was shown on the page is not read (the log says
  it cannot read the sign-ins, and the relay stops): delete it, and sign the
  phones in again. One from a later test build is read, and written in the
  newer form at the next change.
- Every hour, for each line: a refresh (Authentik gives a new refresh token
  each time, which the relay writes at once), introspection (Authentik says a
  token is not active once its account is disabled) and userinfo. When the
  provider refuses (the account closed, disabled or deleted, its tokens
  revoked, or the refresh token expired), or the account is not in
  `EREVOS_RELAY_OIDC_GROUP`, the line goes, and from then on the phone is
  refused, as a wrong token is, a connection it has open being closed at its
  next request; the phones it invited keep the relay (see [Invites](#invites)).
  When the provider cannot be reached, or answers with an
  error of its own (`invalid_client` for a client secret it no longer takes,
  a failing discovery, a 5xx), the line stays, is checked again an hour later,
  and the log says so; once a line has gone 72 hours with no check that went
  through, and then two more checks of that line fail, an hour apart or more,
  it goes all the same. Each line goes only for its own checks: one check that
  fails among many, a relay that was off for days, or a clock put forward takes
  no other line out, and no line goes at the first check after them; a clock
  put back counts each time ahead of it as now, so no check stops. A line the
  relay cannot take out of the file at that moment is refused all the same,
  keeps its record, marked to go, and is taken out at the next check, or when
  the relay starts again.
- To take one phone off, delete its line, as for any token: once the file has
  stayed without it for a minute, the relay forgets its record and revokes its
  refresh token at the provider. To take a
  person off, disable or delete their account in Authentik; taking them out of
  the application's bindings stops new sign-ins only, so delete their lines
  too, or take them out of the group named in `EREVOS_RELAY_OIDC_GROUP`, which
  the hourly check reads.
- A new client secret signs every phone out at its next check, since the
  sealed refresh tokens cannot be read with it: they sign in again.
- The provider sees each sign-in, and the relay's hourly checks of each phone
  of an account, from the server's address. Nothing tells it of spaces, chats
  or contacts. A person who signs in from two spaces of one phone shows the
  relay two lines of one account.
- Sign-ins under way are kept in memory only, for 10 minutes, and at most 4096
  at each step, the oldest going first past that, 10 a minute from one
  browser: a restart in the middle of one means starting again.

## Where things are

- `/usr/local/bin/erevos-relay`: the relay.
- `/etc/systemd/system/erevos-relay.service`: the service.
- `/etc/erevos-relay.env`: the token, and the secret the relay shares with the
  call relay, readable by root only.
- `/etc/turnserver.conf`: the call relay's settings, with that secret. If the
  file was there before, the original is kept as `turnserver.conf.orig`.
- `/var/lib/erevos-relay/queues.journal`: queues and waiting messages. A
  message nobody takes expires after 14 days (`EREVOS_RELAY_TTL_DAYS`, see
  [Settings](#settings), changes that), and only the hour it came is kept. The
  service runs as a temporary user, so systemd keeps the file under
  `/var/lib/private/erevos-relay/`.
- `/var/lib/erevos-relay/queues.journal.news`: only while the relay is
  stopped, after a stop with `systemctl stop` or `restart` (`SIGTERM`): what
  came into each queue since its phone last found it empty, by kind (how many
  messages, calls, and sends that did not say), and the journal's length and
  SHA-256 then. The relay takes it back and deletes it as it starts, so a
  phone is not told again of messages it was told of before the restart. It
  is taken only if the journal is exactly as it was at the stop; otherwise,
  and after a crash, each queue with something waiting counts it as one new
  message, so a phone may tell of it once more, but never misses one.
- `/var/lib/erevos-relay/relay.key`: the relay's key for sealed sends from
  other relays (two-hop sending), made on first start, in the same private
  place. Keep it: phones that send through a second relay seal to it, and a
  new key only means they fetch it again.
- `/var/lib/erevos-relay/files/`: the chunks of photos and files that phones
  send, encrypted on the phone, one file per chunk, in the same private place.
  The contact deletes them once it has them; the rest expire like messages.
  They may take 1024 MB together (`EREVOS_RELAY_FILES_MB` changes that);
  past it, phones are told the relay is full.
- `/var/lib/erevos-relay/phones.tokens` and
  `/var/lib/erevos-relay/phones.tokens.invites`, with invites turned on (or on
  before): see [Invites](#invites). `/var/lib/erevos-relay/phones.tokens.signins`, only
  with signing in set up: see [Signing in with an account](#signing-in-with-an-account).
- `/var/lib/erevos-relay/relay.key.lent-counts` and
  `/var/lib/erevos-relay/relay.key.revoked`, only with lending turned on: see
  [Lending places](#lending-places).
- `/var/lib/erevos-relay/push.key`, `push.key.addresses` and
  `push.key.addresses.keys`: the relay's key for pushes to web apps, and the
  browsers' push addresses, in the same private place: see
  [Notifications for the web app](#notifications-for-the-web-app).
- `/etc/caddy/erevos-relay.caddy`: the Caddy site, imported from
  `/etc/caddy/Caddyfile`. If that file was the one the package ships, the
  original is kept as `Caddyfile.orig`.

`journalctl -u erevos-relay` shows the relay's start-up lines and errors,
among them a forward to another relay, or a file's chunk taken through it,
that failed: why (the name could not be looked up, it could not be reached,
an HTTP status, a timeout), never which relay, queue or file, at most one
line a minute of each, counting the ones not said in between.
`systemctl status erevos-relay caddy coturn` shows whether all three run.

If a part of the relay fails while it holds the queues or the files, the relay
stops with a line saying so rather than run on half broken, and systemd
starts it again two seconds later. It reads its queues and files back as after
any restart. systemd starts it at most 5 times in 5 minutes, counting the
starts you make yourself; past that it stays stopped until you start it:
`sudo systemctl reset-failed erevos-relay`, then
`sudo systemctl start erevos-relay` (once the 5 minutes have passed, the start
alone does). A relay that refuses its settings or its files at start is not
started again: mend what its last line names, then
`sudo systemctl restart erevos-relay`.

## Settings

The relay takes its settings from `/etc/erevos-relay.env`, one `NAME=value`
line each. An update keeps the lines you add there (the service file itself is
replaced on every update). After a change, run
`sudo systemctl restart erevos-relay`; `journalctl -u erevos-relay` then shows
what it took. A value it cannot take stops it at start, with a line saying
which. The ones below are all optional.

| Setting | Unless set | What it does |
| --- | --- | --- |
| `EREVOS_RELAY_TOKENS` | none | The file of the phones' own tokens. |
| `EREVOS_RELAY_INVITES` | `off` | `on` lets phones with a token of their own invite more phones (see [Invites](#invites)). |
| `EREVOS_RELAY_MAX_INVITED` | 100 | Phones let in by invite, all together, counting invites still waiting. |
| `EREVOS_RELAY_OIDC_ISSUER` | none | The OpenID Connect provider phones may sign in with (see [Signing in with an account](#signing-in-with-an-account)). |
| `EREVOS_RELAY_OIDC_CLIENT_ID` | none | Its client's id. Needed with the issuer. |
| `EREVOS_RELAY_OIDC_CLIENT_SECRET` | none | Its client's secret. Needed with the issuer. |
| `EREVOS_RELAY_OIDC_NAME` | `OIDC` | The provider's name, on the app's button and before each line's name. |
| `EREVOS_RELAY_PUBLIC_URL` | none | Where browsers reach the relay, such as `https://erevos.lphl.nekten.eu`, on the host of the relay's address. Needed with the issuer. |
| `EREVOS_RELAY_OIDC_GROUP` | none | A group the account must be in, in userinfo's `groups`, at sign-in and every hourly check. |
| `EREVOS_RELAY_TTL_DAYS` | 14 | Days a message, or a chunk of a file, waits for its contact. |
| `EREVOS_RELAY_FILES_MB` | 1024 | Room for chunks of files, all together. |
| `EREVOS_RELAY_MAX_CONNECTIONS` | 512 | Connections at once. |
| `EREVOS_RELAY_MAX_TOKENLESS_CONNECTIONS` | 128 | Of those, connections at once on `/sealed`, `/files` and `/join`. |
| `EREVOS_RELAY_MAX_READING_CONNECTIONS` | 256 | Of those, connections at once on `/read`, where phones read their queues, a group of contacts on each, with no token. |
| `EREVOS_RELAY_PRIVATE_PEERS` | `deny` | `allow` lets forwards go to relays at private addresses. |
| `EREVOS_RELAY_MAX_QUEUES` | 100000 | Queues the relay holds. |
| `EREVOS_RELAY_QUEUE_DAYS` | 180 | Days a queue lasts once its phone stops using it. |
| `EREVOS_RELAY_QUEUED_MB` | 1024 | Room for waiting messages, all together, held in memory (see [Queues](#queues)). |
| `EREVOS_RELAY_QUEUED_PER_PHONE_MB` | 64 | Of that, room for the messages waiting in the queues one phone made with a token of its own or a lent one. |
| `EREVOS_RELAY_OPEN` | `off` | `on` gives a place to a phone that has none here, as the app asks at its first start (see [Open places](#open-places)). Needs `EREVOS_RELAY_TOKENS` in a folder the relay may write in. |
| `EREVOS_RELAY_OPEN_PLACES`, `_DAY`, `_PER_ADDRESS` | 1000, 100, 3 | Open places at once, new ones a day, and new ones a day to one address. |
| `EREVOS_RELAY_OPEN_UNUSED_DAYS`, `_FIRST_DAYS` | 60, 7 | Days with no connection after which an open place goes; for one that never connected again after the day it was made, days after that day. |
| `EREVOS_RELAY_OPEN_QUEUES`, `_FILES_MB`, `_CALLS`, `_FORWARDS` | 20, 50, 30, 5000 | What each open place may do a day: new queues, megabytes of files put or fetched, credentials for calls, and connections to other relays. |
| `EREVOS_RELAY_OPEN_QUEUED_MB`, `_LATER` | 8, 20 | What each open place may keep at once: megabytes of messages waiting in its queues, and messages held for later. |
| `EREVOS_RELAY_LEND` | `off` | `on` lends places to phones that have no relay. |
| `EREVOS_RELAY_COUPON_KEY` | none | This relay's key for coupons, from `erevos-relay new-coupon-key` (see [Coupons for a second relay](#coupons-for-a-second-relay)). Needs `EREVOS_RELAY_TOKENS`. |
| `EREVOS_RELAY_COUPON_ISSUERS` | none | The file of the public keys of the relays whose coupons this one takes, one on each line. Needs `EREVOS_RELAY_TOKENS` in a folder the relay may write in. |
| `EREVOS_RELAY_MAX_COUPONS` | 2000 | Lines from coupons, all together. |
| `EREVOS_RELAY_PAIR` | none | The address of the relay that takes this one's coupons (`wss://…`, up to 3 apart by spaces): this relay's phones take it as their home relay by themselves, only through Tor. Needs `EREVOS_RELAY_COUPON_KEY`. |
| `EREVOS_RELAY_LEND_REVOKED` | `relay.key.revoked` beside the key | The file of revoked tickets. |
| `EREVOS_RELAY_PUSH_SUBJECT` | `mailto:erevos-relay@invalid` | Where push services may write about the relay; the installer sets it to `https://<domain>`. One that is not a `mailto:` or `https:` address is not taken, and the log says so. |
| `EREVOS_RELAY_PUSH_SERVICES` | none | More push services whose addresses are taken (see [Notifications for the web app](#notifications-for-the-web-app)). One that is not an `https:` origin and its `/` is left out, and the log says so. |
| `EREVOS_RELAY_MATRIX_PUSH` | `on` | `off` stops the relay from taking Matrix pushes (see [Matrix notices](#matrix-notices)). |
| `EREVOS_RELAY_XMPP_PUSH` | none | The relay's DNS name, to take XMPP servers' pushes (see [XMPP notices](#xmpp-notices)); needs the two below. |
| `EREVOS_RELAY_XMPP_PUSH_CERT`, `EREVOS_RELAY_XMPP_PUSH_KEY` | none | The certificate chain and its key for that name, in PEM, readable by the relay. |
| `EREVOS_RELAY_XMPP_PUSH_ADDR` | `0.0.0.0:5269` | Where it listens for XMPP servers. |

## Connections

Each connection costs the relay a thread, so it takes only so many at once:
512, both ways in together, of which at most 128 on the paths that need no
token (`/sealed`, `/files` and `/join`), so that connections from anyone cannot take
the places your own phones need. Past the first number a new connection is
closed as soon as it comes; past the second the relay answers it with 503 and
closes it. Phones try again later by themselves. Behind Caddy, every phone's
connection is one connection to the relay too.

A connection that sends nothing for five minutes is closed (a WebSocket is
told so first), and so is one whose WebSocket handshake is not over 30 seconds
after it came, or that takes nothing of a reply for a minute. The app never
leaves a connection quiet that long: most carry one request and close once it
is answered, a phone waiting for messages included (the relay waits then, up
to a minute, not the phone), and one that carries a file's chunks sends the
next as soon as it has it ready.

Raising `EREVOS_RELAY_MAX_CONNECTIONS` far, past a thousand or so, also needs
more open files than systemd gives a service by default. Run
`sudo systemctl edit erevos-relay` and put these two lines in what it opens;
an update leaves them in place:

    [Service]
    LimitNOFILE=8192

## Relays on a private network

A phone's message to a contact on another relay goes through this relay
(two-hop sending), and so does a file taken from another relay: the phone names
that relay, and this one connects to it. The relay connects only to addresses
on the public internet, not to itself, to the machines on its network, to
`169.254.169.254` where cloud providers keep their metadata, or to any other
private, shared, link-local, multicast or reserved address. It looks the name
up once and connects to the address it checked. A phone that names such an
address is told the other relay cannot be reached, as when it is down.

If you run relays that reach each other at private addresses, a home relay at
`192.168.x.x` and another on the same network say, add
`EREVOS_RELAY_PRIVATE_PEERS=allow`. Phones on the network may then have the
relay connect to anything on it, so only do that where you trust them.

## Queues

The relay holds at most 100000 queues (`EREVOS_RELAY_MAX_QUEUES`). Past that,
a phone that asks for a new one is told the relay is full, and nothing else
changes. A queue whose phone has not taken from it or waited on it for 180
days (`EREVOS_RELAY_QUEUE_DAYS`) expires, with whatever waits in it; messages
sent to it do not keep it, so nobody can keep a queue alive by sending to it.
The relay notes only the day a queue was last used, and writes it down at most
once a day. Queues already in the journal from before count as used the day
the new relay first starts.

Waiting messages are held in memory as well as in the journal, so the relay
holds at most 1024 MB of them (`EREVOS_RELAY_QUEUED_MB`), each counting its
length and 64 bytes more, and of that at most 64 MB in the queues one phone
made with a token of its own, from a coupon or an invite say, or a lent one
(`EREVOS_RELAY_QUEUED_PER_PHONE_MB`), so one phone cannot fill the relay for
everyone. Past either, a send to such a queue is told the relay is full, as
for a full queue, and goes again later. Which phone made a queue is kept in
memory only: queues read back after a restart, and those made with the relay's
one token, count only in the whole. Give the machine more memory than
`EREVOS_RELAY_QUEUED_MB`, with room for the rest of the relay. A journal that
holds more, from before the cap or from a time it
was set higher, is read back without its oldest messages past it, and the log
says how many went, so the relay starts instead of running out of memory again
at every start.

A phone that keeps what it takes asks the relay to keep each message until it
says it has it (see `RECEIVE` with `HOLD`, and `ACK`, in
`crates/erevos-relay/src/server.rs`): a message whose reply is lost with its
connection, through Tor or as the phone's network changes, is handed over again
at the next look instead of being lost. Older phones take as before, and the
app takes as before from an older relay.

The journal is written so that an older relay does not take it: put back in
place of this one, an older relay stops at start with a line saying the file is
not a journal, rather than cutting it short.

Each record of the journal ends with a check (CRC-32C, `EREVOSJ3`), so a record
the disk changed is found as the relay reads the journal back at start. What
comes before it is read; the journal as it was is kept beside it, in
`queues.journal.damaged-<time>`, before the relay writes it again without what
came after, and the log says so. A record cut short at the end, as a stop in the
middle of a write leaves it, is skipped as before and not kept beside. Damage in
the last record, or a damaged length that runs past the end of the file, looks the
same and is skipped the same way; the log calls it cut short or damaged. A journal written by an
older relay is read as it is and checked from the first start of this one.

To go back to a relay from before the checks, stop this one, write the journal
again as the older relay reads it, and start that one:

```sh
systemctl stop erevos-relay
/usr/local/bin/erevos-relay downgrade-journal /var/lib/erevos-relay/queues.journal
```

`downgrade-journal` leaves out no queue or message and keeps the file as it was
in `queues.journal.j3-<time>`. Run as root, it gives both files back to the
journal's owner, the relay's service user. Without the file named, it takes
`EREVOS_RELAY_JOURNAL`.

What came into each queue since its phone last found it empty (its news, which
the app asks for to tell of messages while a hidden chat or a space is
closed) is kept in memory, and at a stop with `SIGTERM` in
`queues.journal.news` beside the journal, never in the journal itself. An
older relay leaves that file alone and reads the journal as before, so going
back to it loses nothing; the news then start afresh, and phones may tell
once more of messages waiting. The next start of a newer relay finds the
journal changed since, so it leaves the old news out and deletes them.

## Notifications for the web app

A web app closed on an iPhone learns of a message only from a push: it gives
the relay a push address, made by the browser, and the relay sends a push
there through the browser's push service when a message comes. The push
service sees when a push goes to each browser, always of the same size, but
not what came or from whom.

- `EREVOS_RELAY_PUSH_KEY` names the relay's key for pushes,
  `/var/lib/erevos-relay/push.key` with the service file here. The relay
  makes it on first start. Keep the file: the browsers make their addresses
  for that key, so with a new key the push services refuse the pushes
  (403), and a closed web app is told of nothing until it is next opened,
  when it makes a new address for the new key by itself. Without the
  setting, web apps are told the relay sends no notifications.
- `EREVOS_RELAY_PUSH_SUBJECT` is the `mailto:` or `https:` address the push
  services may write to about the relay. The installer sets it to
  `https://<domain>`.
- The push addresses are kept beside the key, in `push.key.addresses`, and
  the browsers' keys for them in `push.key.addresses.keys`. An address lets
  whoever has it push to that browser, so the log names only its push
  service, never the address.
- Only addresses of Apple's push service (Safari, and the web app on an
  iPhone), Google's FCM (Chrome and the browsers built on it), Mozilla's
  (Firefox) and Microsoft's WNS (Edge on Windows) are taken. A browser that
  uses another one, a Firefox set up with a push server of its own say,
  cannot turn notifications on until you add its push service to
  `EREVOS_RELAY_PUSH_SERVICES` in `/etc/erevos-relay.env`, each an `https:`
  origin and the `/` after it, separated by commas or spaces:

      EREVOS_RELAY_PUSH_SERVICES=https://push.example.org/

  The relay then sends requests there for any web app that gives such an
  address, so add only services you trust.

At most one push goes to a browser every 15 seconds, for whichever of its
queues; what comes meanwhile goes in the next one, a call that rings before
the messages. While the web app takes its messages on the screen, a push
waits 15 seconds and does not go if the app shows the message in that time.
A push the push service cannot take now (429 or 5xx), or that does not get
through, is tried again 15 seconds later, then 30, 60 and 120, five tries in
all. When the push service says an address is gone (404 or 410), the relay
drops it from every queue that had it, and tells a web app that gives it
again to make a new one: for a week, kept in memory only, so not after the
relay restarts. Each push says, encrypted for the browser, when it was sent,
so a push its service held back while the phone was offline counts nothing
the app took from the relay meanwhile. A web app from before this relay shows its pushes
with no number until it is updated: publish the web app first.

`journalctl -u erevos-relay` shows at start how many push addresses the
relay holds, for how many queues, and each push service you added, and
then, at most once an hour for each push service and status:

- `<service> refused a push (403)`: the push is not tried again. A 403 most
  often means a clock that is off, or an address made for another key.
- `<service> could not take a push now (503), it is tried again`, and
  `a push to <service> could not be sent: ...`, when the relay did not reach
  it.
- `a push to <service> did not get through in 5 tries, it waits for the
  next message`.
- `<service> says a push address is gone (410), its queues push no more`.

`the pushes stopped` means no web app is told of a message until the relay
starts again: run `sudo systemctl restart erevos-relay`.

## Matrix notices

A space signed in to Matrix can ask, on the app's Matrix screen, to say "New message" while it is
closed (and another space is open) when something comes on its Matrix account. For it the relay is
the account's Matrix push gateway: the Matrix server posts to
`https://<relay address>/_matrix/push/v1/notify`, as the Matrix spec fixes the path, with the
room's and the event's ids and how many are not read, never words or names. The push key is the id
of a queue the space made for this alone; the relay counts one message in that queue's news, which
the space's door asks of as of its contacts' queues, and stores nothing and writes nothing to its
journal. A key it does not know, or of a queue that is gone, it answers as rejected, and the Matrix
server then drops that pusher.

The relay answers these on its WebSocket port, on that path only, with no token, and counts them
among the connections on `/sealed`, `/files` and `/join`. `EREVOS_RELAY_MATRIX_PUSH=off` turns it
off: the path is then closed as any other plain request, and the app says the relay needs updating.

Behind Caddy nothing is needed. Behind Apache, the path needs lines of its own, as `/signin/` does
(see [In front of the relay](#in-front-of-the-relay)): above the line that passes the WebSocket on,

    ProxyPass        /_matrix/push/ http://127.0.0.1:7879/_matrix/push/
    ProxyPassReverse /_matrix/push/ http://127.0.0.1:7879/_matrix/push/

and, if the virtual host forbids plain requests with a `RewriteRule` (as the LPHL server's
`RewriteRule ^ - [F]` does), an exception for it beside the one for `/signin/`, just before the
first `RewriteCond` or `RewriteRule`:

    RewriteRule ^/_matrix/push/ - [L]

Then `sudo httpd -t && sudo systemctl reload httpd` (on Debian or Ubuntu,
`sudo apachectl configtest && sudo systemctl reload apache2`). To see it work:

    curl -s -X POST -H 'Content-Type: application/json' -d '{"notification":{"counts":{"unread":0},"devices":[{"app_id":"app.erevos","pushkey":"00"}]}}' https://erevos.lphl.nekten.eu/_matrix/push/v1/notify

answers `{"rejected":["00"]}`, from the relay; a `403`, `404` or an empty answer is Apache's, or a
relay from before this change.

## XMPP notices

As for Matrix, a space signed in to XMPP can ask, on the app's XMPP screen, to say "New message"
while it is closed. For it the relay is the account's push app server (XEP-0357): the space makes a
queue for this alone and asks its XMPP server to push to the relay's name, with that queue's sender
id as the node. While no app of the account is online, the XMPP server then publishes to the node
for each message, and the relay counts one message in that queue's news. What the publish says (a
count, and on some servers who wrote and what) is read past and kept nowhere. A node that is no
queue here is refused, and the XMPP server stops pushing to it.

XMPP servers reach an app server as they reach each other: on port 5269 of its name, with
STARTTLS. So the relay listens there itself, with a certificate for its name; Apache is not in
the way. The relay takes what the other server says it is as said (nothing here is worth more than
a node's secret) and never opens a connection of its own. Off unless `EREVOS_RELAY_XMPP_PUSH` is
set. To turn it on (on a relay installed with `install.sh`):

1. Let 5269 in: `sudo ufw allow 5269/tcp`, or the firewall in use.
2. The relay runs as a user systemd makes for it, so it is handed the certificate by systemd
   rather than reading it under `/etc/letsencrypt`: `sudo systemctl edit erevos-relay`, and in
   what it opens, with the relay's name in place of `erevos.example.org`:

       [Service]
       LoadCredential=xmpp-cert:/etc/letsencrypt/live/erevos.example.org/fullchain.pem
       LoadCredential=xmpp-key:/etc/letsencrypt/live/erevos.example.org/privkey.pem
       Environment=EREVOS_RELAY_XMPP_PUSH=erevos.example.org
       Environment=EREVOS_RELAY_XMPP_PUSH_CERT=/run/credentials/erevos-relay.service/xmpp-cert
       Environment=EREVOS_RELAY_XMPP_PUSH_KEY=/run/credentials/erevos-relay.service/xmpp-key

   then `sudo systemctl restart erevos-relay`. The log says `XMPP servers may push to …`.
3. systemd hands the certificate over at each start, so a renewed one needs a restart: a certbot
   deploy hook, `/etc/letsencrypt/renewal-hooks/deploy/erevos-xmpp.sh` (mode 755):

       #!/bin/sh
       systemctl restart erevos-relay

To see it work from another machine: `openssl s_client -starttls xmpp-server -xmpphost
erevos.example.org -connect erevos.example.org:5269` shows the certificate.

## Open places

A relay can give a place to a phone that has none here, by itself, as the app
asks at its first start: no invite, no account, nothing to type. Off unless you
turn it on. The relay then adds lines to the file of tokens itself, so the file
has to be in the relay's own folder, as for [Invites](#invites). With
`EREVOS_RELAY_TOKENS=/var/lib/erevos-relay/phones.tokens` set, add to
`/etc/erevos-relay.env`:

    EREVOS_RELAY_OPEN=on

and restart. The relay does not start with it on and no file of tokens. Its
log then says how many open places it gives and its limits for them.

The phone makes a token of its own and sends only its SHA-256, on `/join`. The
relay adds a line for it, named `open-` and 8 hex digits, with the day it was
made:

    3b7c0e5a8d16...91e1 open-5f3a9c01 # open place on 2026-11-26

An open place is for the phone's own chats: its queues, contacts here and on
other relays, messages held for later and calls. It may not invite, lend or
have coupons signed. Each day (days are UTC days), each one may make 20 queues,
put or fetch 50 MB of files through the relay, take credentials for the call
relay 30 times and have the relay connect to another relay for it 5000 times;
past that the relay answers that its day is full, and the app says it goes on
tomorrow. At once it may have 8 MB of messages waiting in its queues and 20
messages held for later, and all open places together at most half of the
messages waiting, the files and the messages held for later that the relay
keeps, so that they never fill it for the phones with places of their own.

The relay gives 1000 open places at most, 100 new ones a day and 3 a day to
one internet address, an IPv6 one counted by its first 48 bits, its whole
network. It counts the addresses in memory only, under a keyed hash, for the
day, and never writes or logs them. It takes out the line of a place whose
token connected on none of the last 60 days, and of one that never connected
again after the day it was made, 7 days after that day. Its queues stay as any
queue does (see [Queues](#queues)): a phone whose place was taken out asks for
it again by itself, with the same token, and finds them as they were. What it
counts of each place is kept beside the file of tokens, in the same name with
`.open` after it. Every line named `open-` is an open place's, one you wrote
too. Turned off again, no new ones are given, and those in the file stay open
places, with their limits.

Behind a proxy on the same machine, the proxy must pass each phone's address on
in `X-Forwarded-For`, or every phone counts as one address, the proxy's, and
the 3 a day are soon taken: the relay says so in its log, once an hour at most.
Apache's `ProxyPass` and Caddy set it themselves (see
[In front of the relay](#in-front-of-the-relay)). Behind nginx, the `location`
that passes the WebSocket on needs this line too:

    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

To see how they are used:

    sudo env EREVOS_RELAY_TOKENS=/var/lib/private/erevos-relay/phones.tokens erevos-relay open-places

says, from the file and its `.open` alone, how many open places there are, how
many were made today and in the last 7 days, and how many were used (their
token connected, or they were made) today and in the last 7 and 30 days.

## Lending places

A relay can lend places to phones that have no relay of their own. Off unless
you turn it on: add `EREVOS_RELAY_LEND=on` to `/etc/erevos-relay.env` and
restart. It needs the relay's key, which the installer sets up.

With lending on, a phone with the token asks the relay for a ticket and puts it
in its contact link. Whoever adds that contact with no relay of their own takes
a place here with it: a queue, and a lent token that goes where the token goes
from then on. A ticket lasts 30 days and gives at most 4 places. With a lent
token a phone may:

- use its queue as a phone with the token does, waiting on it included, and
  make 4 more queues a day;
- put 50 MB of files a day, and take, keep and delete chunks;
- send to contacts on this relay;
- ask for a push to a web app.

It may not have this relay connect anywhere for it (forward a message, take a
file from another relay, or hold a message for later), take credentials for
the call relay, or ask for tickets of its own. It reaches contacts on other
relays itself, at their `/sealed` and `/files` paths, as anyone may. How many
places each ticket
gave and what each place used today are kept in
`/var/lib/private/erevos-relay/relay.key.lent-counts`, so a restart does not
start them again.

A new relay key takes back every place lent, but also makes every phone that
sends through a second relay fetch the key again. To take back the places of
one ticket only, put its nonce on a line of
`/var/lib/private/erevos-relay/relay.key.revoked` (or the file named by
`EREVOS_RELAY_LEND_REVOKED`). The ticket is the `lend=` part of the contact
link: `ticket.` and then, in hex, 16 characters for when it expires, 32 for
its nonce and 32 for its code. The nonce is the 32 in the middle; the whole
ticket on a line works too. For example:

    echo 0123456789abcdef0123456789abcdef | sudo tee -a /var/lib/private/erevos-relay/relay.key.revoked

The relay reads the file again whenever it changes, with no restart, and
says in its log how many tickets it holds and any line it cannot read. From
the next connection on, the ticket takes no more places and every place it
gave is refused, as a wrong token is; a connection already open goes on until
it ends, five minutes after its last request at most. The queues those places
made stay until they expire unused. Lines that start with `#` are left out, so
you can note why. Taking a line out gives the places back. The relay must be
able to read the file: if its log says it cannot, run
`sudo chmod 644 /var/lib/private/erevos-relay/relay.key.revoked`.

## Coupons for a second relay

With two relays, each space can use one as its own relay, reached straight,
and the other as its home relay, reached **only through Tor**. A phone then
takes its token on the home relay with a coupon from its own relay, and
neither relay can tell whose that token is: the first signs the coupon blind
(it sees a scrambled message only), the second takes the coupon through Tor,
with no token and no address, and gives a token for it. Each coupon is taken
once. The phone takes it some minutes after it was signed, at random within
the hour, so the two relays' times do not match; still, with few phones, whoever
runs both relays could guess by the times alone.

A token from a coupon lasts 90 days, on a line named `spare`; the phone takes a
new one on a day picked at random between day 30 and day 60. It may do what a phone with a token of its own does, but
it may not invite phones or have coupons signed. The relay takes 2,000 such lines
at most (`EREVOS_RELAY_MAX_COUPONS`) and removes each one at its end. A phone
with a token of its own may have 2 coupons signed a day and 6 in 30 days (counted
while the relay runs), and the relay signs 1,000 a day at most.

On each relay, with the relay stopped, make its key for coupons in the folder
of the service (see [Invites](#invites) for why there):

    sudo systemctl stop erevos-relay
    sudo erevos-relay new-coupon-key /var/lib/private/erevos-relay/coupon.key

It writes the key, readable by its owner alone, and its public key, one line of
hex, in `coupon.key.pub` beside it. It never writes over a key already there.
Then put the **other** relay's `coupon.key.pub` line into a file of issuers on
this one, such as `/var/lib/private/erevos-relay/coupon.issuers` (one key on
each line, `#` starting a note, 4 at most). The public key is no secret: copy
it as you like. In `/etc/erevos-relay.env`:

    EREVOS_RELAY_COUPON_KEY=/var/lib/erevos-relay/coupon.key
    EREVOS_RELAY_COUPON_ISSUERS=/var/lib/erevos-relay/coupon.issuers

Both need `EREVOS_RELAY_TOKENS`, in the folder of the service as for invites,
since the relay writes the lines of coupons into that file. Then
`sudo systemctl start erevos-relay`; its log says that phones may have coupons
signed and how many issuers' coupons it takes. Which coupons were taken, and
till when their lines last, are kept in `phones.tokens.coupons` beside the
file of tokens.

So that each space takes the other relay as its home relay by itself, with
nothing to type on the phone, name it on this one, in `/etc/erevos-relay.env`:

    EREVOS_RELAY_PAIR=wss://other-relay.example.org

The relay then tells it to each phone that may have coupons signed here, and
every phone gets the same answer. A space with no home relay takes it as its
home relay, only through Tor, with its token from a coupon, on Android, where
Erevos has Tor. **Automatically from your relay**, on the space's **Home
relay** screen, turns this off; removing the home relay by hand turns it off
too. A space whose home relay was set so follows the pair when it changes,
and never takes its own relay as its home relay. Its log says which relays the
phones are told. Up to 3 relays may be named, apart by spaces; a space takes
the first that is not its own relay.

A relay may have only one of the two: the key alone signs coupons for another
relay, the issuers alone take them. A new key makes the coupons already signed,
and not yet taken, useless where the old public key is taken out; the tokens
already given last their days. To stop taking a relay's coupons, take its line
out of the issuers file and restart; to take back one token, delete its line
from the file of tokens.

In the app, under **Settings → Relay and networks → Home relay**, the home relay is
set with **Only through Tor** on and no token typed.

## What the server can see

Whoever runs the server can see the IP addresses that connect, the queue ids,
when messages arrive and how big they are, and for files the number of chunks
and their size class. Messages and files are encrypted end to end, so the
server cannot read them. During a call it sees the IP addresses of the phones
in it, when the call starts and ends, and how much passes, but not what is
said or shown: calls are end-to-end encrypted too. With lending on, it can
also see how many places each ticket gave and how much each place used today,
but not which queue is whose. With signing in set up, it sees each signed-in
phone's user name at the provider, and the provider sees each sign-in and
each hourly check (the relay's log names a line by the start of its token's
SHA-256, not by that name). With Matrix notices asked for, it sees when a Matrix
server tells of a message for a queue, and that server's address, but not
which room, from whom or what. Run the relay on a server you control, and keep
its disk encrypted if the provider offers it.

## Remove

    sudo systemctl disable --now erevos-relay
    sudo rm /etc/systemd/system/erevos-relay.service /usr/local/bin/erevos-relay /etc/erevos-relay.env
    sudo rm -r /var/lib/erevos-relay /var/lib/private/erevos-relay
    sudo rm /etc/caddy/erevos-relay.caddy
    sudo systemctl disable --now coturn
    sudo rm /etc/turnserver.conf

Then delete the `import /etc/caddy/erevos-relay.caddy` line from
`/etc/caddy/Caddyfile` and run `sudo systemctl reload caddy`.
