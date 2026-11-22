// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package core

import (
	"testing"
	"time"

	waTypes "go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
)

// A chat read here stays read when Meta sends it again with an older read
// mark, also after a restart; something after the read makes it unread again.
func TestReadHereKept(t *testing.T) {
	dir := t.TempDir()
	e := NewEngine(dir, nil)
	e.mu.Lock()
	if !e.unreadAfter(7, 100, 200) {
		t.Fatal("never read here: Meta's word counts")
	}
	e.readHere(250, 7, 8)
	if e.unreadAfter(7, 100, 200) || e.unreadAfter(8, 100, 250) {
		t.Fatal("read here after its last activity: not unread")
	}
	if !e.unreadAfter(7, 100, 300) {
		t.Fatal("activity after the read: unread")
	}
	e.readHere(200, 7)
	e.mu.Unlock()

	again := NewEngine(dir, nil)
	again.mu.Lock()
	defer again.mu.Unlock()
	if again.readMark(7) != 250 || again.readMark(8) != 250 || again.readMark(9) != 0 {
		t.Fatalf("read marks after a restart: %v", again.readMs)
	}
	if again.unreadAfter(7, 100, 240) {
		t.Fatal("after a restart, a chat read here is still read")
	}
}

// Read while not connected (Erevos just started): kept all the same, and Meta
// is told once connected.
func TestReadWhileNotConnected(t *testing.T) {
	dir := t.TempDir()
	e := NewEngine(dir, &quiet{})
	e.mu.Lock()
	e.threads[7] = &Thread{Key: 7, LastMs: 500, Unread: true}
	e.mu.Unlock()
	if err := e.markRead(7); err != nil {
		t.Fatal(err)
	}
	e.mu.Lock()
	defer e.mu.Unlock()
	if e.threads[7].Unread || !e.pendingRead[7] {
		t.Fatalf("unread=%v pending=%v", e.threads[7].Unread, e.pendingRead)
	}
	if e.unreadAfter(7, 100, 500) {
		t.Fatal("Meta's older mark as it connects makes it unread again")
	}
	again := NewEngine(dir, &quiet{})
	again.mu.Lock()
	defer again.mu.Unlock()
	if again.unreadAfter(7, 100, 500) {
		t.Fatal("after a restart it is unread again")
	}
}

// Our own reads on another device read the encrypted messages here too.
func TestOwnReadElsewhere(t *testing.T) {
	e := NewEngine(t.TempDir(), &quiet{})
	e.mu.Lock()
	e.threads[7] = &Thread{Key: 7, LastMs: 900, Unread: true}
	e.unreadWA[7] = []string{"a", "b"}
	e.sent["b"] = &Message{ID: "b", Ms: 900}
	e.mu.Unlock()
	chat := waTypes.JID{User: "7", Server: waTypes.MessengerServer}
	e.onReceipt(&events.Receipt{MessageSource: waTypes.MessageSource{Chat: chat, IsFromMe: false}, MessageIDs: []string{"a", "b"}, Type: waTypes.ReceiptTypeRead, Timestamp: time.UnixMilli(950)})
	if !e.threads[7].Unread {
		t.Fatal("someone else's read receipt is not ours")
	}
	e.onReceipt(&events.Receipt{MessageSource: waTypes.MessageSource{Chat: chat, IsFromMe: true}, MessageIDs: []string{"a"}, Type: waTypes.ReceiptTypeReadSelf, Timestamp: time.UnixMilli(800)})
	if !e.threads[7].Unread {
		t.Fatal("one of two read: still unread")
	}
	e.onReceipt(&events.Receipt{MessageSource: waTypes.MessageSource{Chat: chat, IsFromMe: true}, MessageIDs: []string{"b"}, Type: waTypes.ReceiptTypeRead, Timestamp: time.UnixMilli(950)})
	if e.threads[7].Unread || len(e.unreadWA[7]) != 0 {
		t.Fatal("all read elsewhere: read here")
	}
}

// The last word ours (sent from another device): the chat is read.
func TestLastIsMine(t *testing.T) {
	e := NewEngine(t.TempDir(), &quiet{})
	if e.lastIsMine(5) {
		t.Fatal("unknown self")
	}
	e.selfID = 5
	if !e.lastIsMine(5) || e.lastIsMine(6) || e.lastIsMine(0) {
		t.Fatal("lastIsMine")
	}
}
