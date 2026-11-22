// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// An XMPP account's Tor (lib/account-tor.ts, lib/xmpp-net.ts): Off unless chosen; the first
// switch's `true` read as Always; a chat «Through Tor» makes the whole account Always; and an
// account that must not go straight is never connected straight or over a WebSocket.

import assert from "node:assert/strict";
import { test } from "node:test";

import type { AccountTor } from "../lib/account-tor";
import { XmppConnection, xmppTorWay, type XmppChat } from "../lib/xmpp";
import { connectXmpp, xmppThroughTor, type XmppServer } from "../lib/xmpp-net";

const STOP = new Error("stop here");

function asked() {
  const ways: (AccountTor | undefined)[] = [];
  const connect = async (
    _domain: string,
    _given?: XmppServer,
    way?: AccountTor,
  ) => {
    ways.push(way);
    throw STOP;
  };
  return { ways, connect: connect as typeof connectXmpp };
}

const chat = (jid: string, tor?: true): XmppChat => ({
  jid,
  messages: [],
  unread: 0,
  lastAt: 0,
  ...(tor ? { tor } : {}),
});

test("the way that counts: Off unless chosen, the old switch is Always, and a chat through Tor makes the account Always", () => {
  assert.equal(xmppTorWay({ chats: {} }), "never");
  assert.equal(xmppTorWay({ tor: true, chats: {} }), "always");
  assert.equal(xmppTorWay({ tor: "space", chats: {} }), "space");
  assert.equal(
    xmppTorWay({ tor: "nonsense" as AccountTor, chats: {} }),
    "never",
  );
  assert.equal(
    xmppTorWay({
      tor: "never",
      chats: { a: chat("a@x.org"), b: chat("b@x.org", true) },
    }),
    "always",
  );
  assert.equal(
    xmppTorWay({ tor: "space", chats: { a: chat("a@x.org") } }),
    "space",
  );
});

test("the connection is asked for the way that counts", async () => {
  const base = {
    jid: "ann@example.org",
    password: "secret",
    resource: "Erevos.abc",
  };
  const { ways, connect } = asked();
  await assert.rejects(XmppConnection.open(base, connect), STOP);
  await assert.rejects(
    XmppConnection.open({ ...base, tor: true }, connect),
    STOP,
  );
  await assert.rejects(
    XmppConnection.open({ ...base, tor: "space" }, connect),
    STOP,
  );
  await assert.rejects(
    XmppConnection.open(
      {
        ...base,
        tor: "never",
        chats: { "ben@example.org": chat("ben@example.org", true) },
      },
      connect,
    ),
    STOP,
  );
  assert.deepEqual(ways, ["never", "always", "space", "always"]);
});

test("only through Tor: a WebSocket, or a build that makes no connections of its own, is refused, never gone to straight", async () => {
  // Here (the checks, like the web app) Erevos makes no TCP connections of its own.
  await assert.rejects(
    connectXmpp(
      "example.org",
      { websocket: "wss://example.org/xmpp" },
      "always",
    ),
    /only through Tor/,
  );
  await assert.rejects(
    connectXmpp("example.org", undefined, "always"),
    /only through Tor/,
  );
  assert.equal(xmppThroughTor("always"), false);
});
