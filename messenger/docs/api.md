<!--
SPDX-FileCopyrightText: 2026 azzinder

SPDX-License-Identifier: AGPL-3.0-or-later
-->
# Engine API (phase 0)

`core.NewEngine(dataDir, listener)` then `engine.Call(op, argsJSON)`, which
returns `{"ok": …}` or `{"error": "…"}`.

| op | args | ok |
|---|---|---|
| `version` | – | string |
| `userAgent` | – | browser identity for the sign-in web view |
| `login` | `{"cookies": {"c_user","xs","datr",…}}` | null |
| `loggedIn` | – | bool |
| `start` | – | `{"self": id, "name": "…"}` |
| `stop` | – | null |
| `threads` | – | `[Thread]` |
| `sendText` | `{"thread": key, "text": "…", "replyTo"?: id}` | `{"id","ms"}` |
| `logout` | – | null (forgets cookies and keys) |
| `note` | `{"text"}` | null (adds a line to the test log) |
| `markRead` | `{"thread"}` | null |
| `markAllRead` | – | number of chats marked |
| `react` | `{"id", "emoji"}` | null (`""` removes the reaction) |
| `unsend` | `{"id"}` | null (taken back for everyone) |
| `deleteForMe` | `{"id"}` | null |
| `forward` | `{"id", "to": [key]}` | number of chats it went to |
| `sendMedia` | `{"thread", "path", "mime", "name"?, "caption"?, "voice"?, "durationMs"?, "w"?, "h"?, "thumb"?, "replyTo"?, "asSticker"?}` | `{"id","ms"}` — voice = AAC `.m4a`, as Messenger itself records; asSticker = image sent as a sticker in encrypted chats (as a plain image in open chats) |
| `sendSticker` | `{"thread", "sticker"}` | `{"id","ms"}` — open chats only |
| `createPoll` | `{"thread", "question", "options": […]}` | null — open chats only |
| `votePoll` | `{"thread", "poll", "selected": [optionId]}` | null — the whole choice, not a change |
| `members` | `{"thread"}` | `[{id, name, admin, me}]` |
| `renameGroup` | `{"thread", "title"}` | null |
| `removeMember` / `setAdmin` | `{"thread", "person", "admin"?}` | null |
| `addMembers` | `{"thread", "people": [id]}` | null |

Events (`listener.OnEvent(json)`), each with `type`:

- `connected`, `disconnected`, `e2eeConnected`
- `fatal` `{error, signIn}` — sign in again when `signIn` is true
- `e2eeError` `{error}`
- `thread` `{thread: {key, name, snippet, lastMs, encrypted, group, unread, pinned?}}`
- `threadGone` `{key}` — drop this chat from the list (it moved to another key)
- `message` `{message: {thread, id, sender, name, text, ms, mine, encrypted, forwarded?, edited?, stickerId?, replyTo?: {id, text, sender, name}, attachments?: [{kind, url, playUrl, mime, w, h, name, title, link}]}}` — kinds: image, video, audio (title `voice` for voice messages), file, sticker, link, location, contact, story; encrypted media comes as `file://` once downloaded — sent again (same id) when attachments arrive later; replace, do not add
- `undecryptable` `{chat}`
- `reaction` `{thread, id, actor, name, emoji, mine}` — `emoji` `""` = removed
- `deleted` `{thread, id, forMe?}`
- `edited` `{id, text}`
- `pinned` `{thread, id, text}` — `id` `""` = nothing pinned
- `members` `{thread}` — ask `members` again
- `poll` `{thread, id, poll, question, options: [{id, text}]}`; `pollOptions` `{thread, poll, options}`; `pollVote` `{thread, poll, actor, option, on}`; `pollState` `{poll, options, votes: {actor: [optionId]}}`
