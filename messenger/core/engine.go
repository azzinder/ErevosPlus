// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// Package core is the Messenger engine of Erevos: it speaks Messenger itself,
// on the device, through messagix (from mautrix-meta). Nothing goes through a
// third-party server; only Meta's own servers are contacted.
//
// The whole surface is one call, Call(op, json) → json, plus events sent to a
// Listener as JSON, so the Android/desktop side never touches Meta's types and
// updates of the library don't reach the screens. Shapes are in docs/api.md.
package core

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/rs/zerolog"
	"go.mau.fi/util/exhttp"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/proto/waCommon"
	"go.mau.fi/whatsmeow/proto/waConsumerApplication"
	"go.mau.fi/whatsmeow/store"
	"go.mau.fi/whatsmeow/store/sqlstore"
	waTypes "go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
	"google.golang.org/protobuf/proto"

	"go.mau.fi/mautrix-meta/pkg/messagix"
	"go.mau.fi/mautrix-meta/pkg/messagix/cookies"
	"go.mau.fi/mautrix-meta/pkg/messagix/methods"
	"go.mau.fi/mautrix-meta/pkg/messagix/socket"
	"go.mau.fi/mautrix-meta/pkg/messagix/table"
	"go.mau.fi/mautrix-meta/pkg/messagix/types"
	"go.mau.fi/mautrix-meta/pkg/messagix/useragent"

	_ "modernc.org/sqlite" // pure Go, no cgo: phase 0 only, replaced by a locked store
)

// Listener gets every event as one JSON object with a "type" field.
type Listener interface {
	OnEvent(eventJSON string)
}

// Engine is one Messenger account.
type Engine struct {
	dataDir  string
	listener Listener
	log      zerolog.Logger

	mu sync.Mutex
	// proxy is the SOCKS door (socks5://127.0.0.1:port) every connection of
	// this account goes through, or "" for straight. torOnly is kept on disk:
	// while it is set the engine never connects straight, even before the
	// host has told it the door of this run.
	proxy    string
	torOnly  bool
	client   *messagix.Client
	e2ee     *whatsmeow.Client
	device   *store.Device
	devices  *sqlstore.Container
	selfID   int64
	cancel   context.CancelFunc
	threads  map[int64]*Thread
	contacts map[int64]string
	members  map[int64][]int64
	// e2eeOf maps a chat's old (open) key to its encrypted (Armadillo) key;
	// openOf is the reverse. Meta moved these chats to encryption.
	e2eeOf map[int64]int64
	openOf map[int64]int64
	// sent keeps the messages already shown, so attachments that arrive in a
	// later table can be added to them.
	sent     map[string]*Message
	backfill sync.Once
	// page tracks the chats that came in while a page of older chats is
	// being fetched: how many, and the oldest (where the next page starts).
	page pageState
	// people: everyone Meta told us about (chats, contact list), for a new chat.
	people map[int64]*Person
	// waRefs: chat and sender of each encrypted message, to react to it,
	// answer it, take it back or mark it read. rawThread: the key Meta itself
	// uses for an open message (before it is shown under its encrypted chat).
	waRefs    map[string]waRef
	rawThread map[string]int64
	// unreadWA: encrypted messages not yet marked read, per chat.
	unreadWA map[int64][]string
	// admins: group admins per chat.
	admins map[int64]map[int64]bool
	// readMs: up to when each chat was read here (marked read, or written in),
	// kept on disk (read.json). Meta often sends a chat again with an older read
	// mark (an encrypted chat's is not moved by marking it read, and a reconnect
	// or a restart sends every chat again): that does not make it unread. Nil
	// until first used.
	readMs map[int64]int64
	// pendingRead: chats read here while not connected, to tell Meta once
	// connected.
	pendingRead map[int64]bool

	logMu sync.Mutex
	logs  []string
}

// Thread is one chat as the screens see it.
type Thread struct {
	Key       int64  `json:"key"`
	Name      string `json:"name"`
	Snippet   string `json:"snippet,omitempty"`
	LastMs    int64  `json:"lastMs"`
	Encrypted bool   `json:"encrypted"`
	Group     bool   `json:"group"`
	// E2EEKey is the encrypted chat that continues this one, if any.
	E2EEKey int64 `json:"e2eeKey,omitempty"`
	// Unread: something came after the owner last read the chat.
	Unread bool `json:"unread"`
	// Pinned is the id of the pinned message, if any.
	Pinned string `json:"pinned,omitempty"`
}

// Attachment is a photo, video, voice, file, sticker or link preview.
// URLs are Meta's own signed links; they expire after some hours.
type Attachment struct {
	Kind    string `json:"kind"` // image, video, audio, file, sticker, link
	URL     string `json:"url,omitempty"`
	PlayURL string `json:"playUrl,omitempty"`
	Mime    string `json:"mime,omitempty"`
	W       int64  `json:"w,omitempty"`
	H       int64  `json:"h,omitempty"`
	Name    string `json:"name,omitempty"`
	Title   string `json:"title,omitempty"`
	Link    string `json:"link,omitempty"`
}

// Message is one message as the screens see it.
type Message struct {
	Thread    int64  `json:"thread"`
	ID        string `json:"id"`
	Sender    int64  `json:"sender"`
	Name      string `json:"name,omitempty"`
	Text      string `json:"text"`
	Ms        int64  `json:"ms"`
	Mine      bool   `json:"mine"`
	Encrypted bool   `json:"encrypted"`
	Forwarded bool   `json:"forwarded,omitempty"`
	Edited    bool   `json:"edited,omitempty"`
	// StickerID lets a sticker seen in a chat be sent again.
	StickerID int64  `json:"stickerId,omitempty"`
	ReplyTo   *Quote `json:"replyTo,omitempty"`

	Attachments []*Attachment `json:"attachments,omitempty"`
}

// Quote is the message a reply answers.
type Quote struct {
	ID     string `json:"id"`
	Text   string `json:"text,omitempty"`
	Sender int64  `json:"sender,omitempty"`
	Name   string `json:"name,omitempty"`
}

// NewEngine opens (or creates) the account kept in dataDir, which must be the
// app's private folder.
func NewEngine(dataDir string, listener Listener) *Engine {
	return &Engine{
		dataDir:  dataDir,
		listener: listener,
		log:      zerolog.New(os.Stderr).With().Timestamp().Str("c", "erevos-messenger").Logger().Level(zerolog.InfoLevel),
		threads:  map[int64]*Thread{},
		contacts: map[int64]string{},
		members:  map[int64][]int64{},
		e2eeOf:   map[int64]int64{},
		openOf:   map[int64]int64{},
		people:   map[int64]*Person{},
		sent:     map[string]*Message{},

		waRefs:    map[string]waRef{},
		rawThread: map[string]int64{},
		unreadWA:  map[int64][]string{},
		admins:    map[int64]map[int64]bool{},
	}
}

// Call runs one operation. It always returns JSON: {"ok":...} or {"error":"..."}.
func (e *Engine) Call(op string, args string) string {
	var out any
	var err error
	func() {
		defer func() {
			if r := recover(); r != nil {
				err = fmt.Errorf("panic in %s: %v", op, r)
			}
		}()
		out, err = e.call(op, []byte(args))
	}()
	if err != nil {
		b, _ := json.Marshal(map[string]string{"error": err.Error()})
		return string(b)
	}
	b, merr := json.Marshal(map[string]any{"ok": out})
	if merr != nil {
		b, _ = json.Marshal(map[string]string{"error": merr.Error()})
	}
	return string(b)
}

func (e *Engine) call(op string, args []byte) (any, error) {
	switch op {
	case "version":
		return "0.0.1-phase0", nil
	case "userAgent":
		// The sign-in web view must look like the same browser messagix
		// imitates, or Meta sees two different "devices" for one session.
		return useragent.UserAgent, nil
	case "login":
		var a struct {
			Cookies map[string]string `json:"cookies"`
		}
		if err := json.Unmarshal(args, &a); err != nil {
			return nil, err
		}
		return nil, e.login(a.Cookies)
	case "webHost":
		// "www.facebook.com", or "www.messenger.com" for an older sign-in.
		return e.webHost(), nil
	case "webCookies":
		// The sign-in cookies, for the in-app page used for calls (webHost).
		c, err := e.loadCookies()
		if err != nil {
			return nil, err
		}
		out := map[string]string{}
		for k, v := range c.GetAll() {
			if v != "" {
				out[string(k)] = v
			}
		}
		return out, nil
	case "loggedIn":
		_, err := os.Stat(e.path("cookies.json"))
		return err == nil, nil
	case "start":
		return e.start()
	case "fetch":
		// {url, path}: saves a picture, video or file of an open chat to path,
		// the same way out as the account (through Tor when it is set), so the
		// host never fetches Meta's links straight itself.
		var a struct {
			URL  string `json:"url"`
			Path string `json:"path"`
		}
		if err := json.Unmarshal(args, &a); err != nil {
			return nil, err
		}
		return a.Path, e.fetch(a.URL, a.Path)
	case "setProxy":
		// {url: "socks5://127.0.0.1:port" or "", torOnly: bool}. A running
		// account reconnects through the new way at once.
		var a struct {
			URL     string `json:"url"`
			TorOnly bool   `json:"torOnly"`
		}
		if err := json.Unmarshal(args, &a); err != nil {
			return nil, err
		}
		return e.setProxy(a.URL, a.TorOnly)
	case "stop":
		e.stop()
		return nil, nil
	case "threads":
		return e.threadList(), nil
	case "messages":
		var a struct {
			Thread int64 `json:"thread"`
		}
		if err := json.Unmarshal(args, &a); err != nil {
			return nil, err
		}
		return nil, e.fetchMessages(a.Thread)
	case "log":
		e.logMu.Lock()
		defer e.logMu.Unlock()
		return append([]string(nil), e.logs...), nil
	case "note":
		var a struct {
			Text string `json:"text"`
		}
		if err := json.Unmarshal(args, &a); err != nil {
			return nil, err
		}
		e.note("%s", a.Text)
		return nil, nil
	case "contacts":
		return e.contactList()
	case "searchPeople":
		var a struct {
			Query string `json:"query"`
		}
		if err := json.Unmarshal(args, &a); err != nil {
			return nil, err
		}
		return e.searchPeople(a.Query)
	case "startChat":
		var a struct {
			ID   int64  `json:"id"`
			Name string `json:"name"`
		}
		if err := json.Unmarshal(args, &a); err != nil {
			return nil, err
		}
		return e.startChat(a.ID, a.Name)
	case "sendText":
		var a struct {
			Thread  int64  `json:"thread"`
			Text    string `json:"text"`
			ReplyTo string `json:"replyTo"`
		}
		if err := json.Unmarshal(args, &a); err != nil {
			return nil, err
		}
		out, err := e.sendText(a.Thread, a.Text, a.ReplyTo)
		if err == nil {
			// Writing in a chat reads it.
			e.mu.Lock()
			e.readHere(time.Now().UnixMilli(), a.Thread)
			e.mu.Unlock()
		}
		return out, err
	case "logout":
		e.stop()
		e.mu.Lock()
		e.readMs = map[int64]int64{}
		e.mu.Unlock()
		_ = os.Remove(e.path("read.json"))
		_ = os.Remove(e.path("cookies.json"))
		_ = os.Remove(e.path("e2ee.db"))
		_ = os.Remove(e.path("account.json"))
		_ = os.Remove(e.path("platform"))
		return nil, nil
	}
	return e.callMore(op, args)
}

// readMark is up to when the chat `key` was read here, 0 if never. Caller holds mu.
func (e *Engine) readMark(key int64) int64 {
	if e.readMs == nil {
		e.readMs = map[int64]int64{}
		if b, err := os.ReadFile(e.path("read.json")); err == nil {
			_ = json.Unmarshal(b, &e.readMs)
		}
	}
	return e.readMs[key]
}

// readHere marks the chats `keys` read up to `ms` here and keeps it on disk.
// Caller holds mu.
func (e *Engine) readHere(ms int64, keys ...int64) {
	changed := false
	for _, key := range keys {
		if ms > e.readMark(key) {
			e.readMs[key] = ms
			changed = true
		}
	}
	if !changed || os.MkdirAll(e.dataDir, 0o700) != nil {
		return
	}
	if b, err := json.Marshal(e.readMs); err == nil && os.WriteFile(e.path("read.json.new"), b, 0o600) == nil {
		_ = os.Rename(e.path("read.json.new"), e.path("read.json"))
	}
}

// lastIsMine is whether a chat's last message (its snippet's sender) is ours.
// Caller holds mu.
func (e *Engine) lastIsMine(sender int64) bool {
	return sender != 0 && e.selfID != 0 && sender == e.selfID
}

// unreadAfter is whether the chat `key` has something not read: Meta's read
// mark `w` is before its last activity `last`, and it was not read here since.
// Caller holds mu.
func (e *Engine) unreadAfter(key, w, last int64) bool {
	return w < last && e.readMark(key) < last
}

// note keeps the last lines of what happened, for the test app's log screen.
// It never holds message text or cookies.
func (e *Engine) note(format string, a ...any) {
	line := time.Now().Format("15:04:05 ") + fmt.Sprintf(format, a...)
	e.log.Info().Msg(line)
	e.logMu.Lock()
	e.logs = append(e.logs, line)
	if len(e.logs) > 400 {
		e.logs = e.logs[len(e.logs)-400:]
	}
	e.logMu.Unlock()
}

// tableSummary names the non-empty parts of a table, e.g. "LSUpsertMessage×3".
func tableSummary(t *table.LSTable) string {
	v := reflect.ValueOf(t).Elem()
	out := ""
	for i := 0; i < v.NumField(); i++ {
		f := v.Field(i)
		if f.Kind() == reflect.Slice && f.Len() > 0 {
			out += fmt.Sprintf(" %s×%d", v.Type().Field(i).Name, f.Len())
		}
	}
	if out == "" {
		return " (empty)"
	}
	return out
}

func (e *Engine) path(name string) string { return filepath.Join(e.dataDir, name) }

func (e *Engine) emit(v any) {
	if e.listener == nil {
		return
	}
	b, err := json.Marshal(v)
	if err == nil {
		e.listener.OnEvent(string(b))
	}
}

// login keeps the cookies of a facebook.com sign-in done by the user in the
// app's web view. The password is never seen here. Meta sends messenger.com
// to facebook.com/messages, so every new sign-in is a Facebook one.
func (e *Engine) login(values map[string]string) error {
	for _, name := range cookies.FBRequiredCookies {
		if values[string(name)] == "" {
			return fmt.Errorf("missing cookie %s: sign in again", name)
		}
	}
	c := &cookies.Cookies{Platform: types.Facebook}
	m := map[cookies.MetaCookieName]string{}
	for k, v := range values {
		m[cookies.MetaCookieName(k)] = v
	}
	c.UpdateValues(m)
	if err := e.saveCookies(c); err != nil {
		return err
	}
	return os.WriteFile(e.path("platform"), []byte("facebook"), 0o600)
}

// platform is where the kept sign-in was made: facebook.com for every new
// one; an older messenger.com one (no platform file) stays Messenger until
// it fails, and then the user signs in again at facebook.com.
func (e *Engine) platform() types.Platform {
	if b, err := os.ReadFile(e.path("platform")); err == nil && strings.TrimSpace(string(b)) == "facebook" {
		return types.Facebook
	}
	return types.Messenger
}

// webHost is the site of the kept sign-in, for the in-app call page.
func (e *Engine) webHost() string {
	if e.platform() == types.Facebook {
		return "www.facebook.com"
	}
	return "www.messenger.com"
}

func (e *Engine) saveCookies(c *cookies.Cookies) error {
	b, err := json.Marshal(c)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(e.dataDir, 0o700); err != nil {
		return err
	}
	return os.WriteFile(e.path("cookies.json"), b, 0o600)
}

func (e *Engine) loadCookies() (*cookies.Cookies, error) {
	b, err := os.ReadFile(e.path("cookies.json"))
	if err != nil {
		return nil, errors.New("not signed in")
	}
	c := &cookies.Cookies{}
	if err := json.Unmarshal(b, c); err != nil {
		return nil, err
	}
	c.Platform = e.platform()
	return c, nil
}

type account struct {
	DeviceID uint16 `json:"deviceId"`
}

// start loads the inbox, opens the Messenger socket and then the encrypted one.
func (e *Engine) start() (any, error) {
	e.mu.Lock()
	defer e.mu.Unlock()
	if e.client != nil {
		return "already", nil
	}
	ck, err := e.loadCookies()
	if err != nil {
		return nil, err
	}
	if e.torOnly || e.loadTorOnly() {
		e.torOnly = true
		if e.proxy == "" {
			e.emit(map[string]any{"type": "fatal", "error": "tor needed", "tor": true})
			return nil, errors.New("tor needed: this account never goes straight and Tor is not ready")
		}
	}
	cli := messagix.NewClient(ck, e.log.With().Str("c", "messagix").Logger(), &messagix.Config{})
	if e.proxy != "" {
		if err := cli.GetHTTP().SetProxy(e.proxy); err != nil {
			return nil, err
		}
	}
	ctx, cancel := context.WithCancel(context.Background())
	user, initial, err := cli.LoadMessagesPage(ctx)
	if err != nil {
		cancel()
		e.note("load inbox failed: %v", err)
		signIn := isSignInError(err)
		msg := err.Error()
		if signIn && e.platform() == types.Messenger {
			// An old messenger.com sign-in: Meta now wants facebook.com.
			msg = "sign in again: Messenger moved to facebook.com"
		}
		e.emit(map[string]any{"type": "fatal", "error": msg, "signIn": signIn})
		return nil, err
	}
	e.client = cli
	e.cancel = cancel
	e.selfID = user.GetFBID()
	cli.SetEventHandler(e.onMetaEvent)
	e.note("inbox loaded, self=%d, initial:%s", e.selfID, tableSummary(initial))
	e.takeTable(initial)
	if err := cli.Connect(ctx); err != nil {
		return nil, err
	}
	return map[string]any{"self": e.selfID, "name": user.GetName()}, nil
}

func isSignInError(err error) bool {
	s := err.Error()
	for _, w := range []string{"token", "login", "checkpoint", "challenge", "consent", "suspended", "user ID"} {
		if containsFold(s, w) {
			return true
		}
	}
	return false
}

func containsFold(s, sub string) bool {
	if len(sub) > len(s) {
		return false
	}
	for i := 0; i+len(sub) <= len(s); i++ {
		ok := true
		for j := 0; j < len(sub); j++ {
			a, b := s[i+j], sub[j]
			if a >= 'A' && a <= 'Z' {
				a += 32
			}
			if b >= 'A' && b <= 'Z' {
				b += 32
			}
			if a != b {
				ok = false
				break
			}
		}
		if ok {
			return true
		}
	}
	return false
}

// fetch downloads one https link the engine gave out, through the account's way.
func (e *Engine) fetch(link, path string) error {
	u, err := url.Parse(link)
	if err != nil || u.Scheme != "https" {
		return errors.New("only https links")
	}
	e.mu.Lock()
	way, torOnly := e.proxy, e.torOnly || e.loadTorOnly()
	e.mu.Unlock()
	if torOnly && way == "" {
		return errors.New("tor needed: this account never goes straight and Tor is not ready")
	}
	cs, err := exhttp.SensibleClientSettings.WithProxy(way)
	if err != nil {
		return err
	}
	cs = cs.WithGlobalTimeout(10 * time.Minute)
	resp, err := cs.Compile().Get(link)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed: %s", resp.Status)
	}
	tmp := path + ".part"
	f, err := os.OpenFile(tmp, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o600)
	if err != nil {
		return err
	}
	if _, err := io.Copy(f, io.LimitReader(resp.Body, 4<<30)); err != nil {
		f.Close()
		os.Remove(tmp)
		return err
	}
	if err := f.Close(); err != nil {
		os.Remove(tmp)
		return err
	}
	return os.Rename(tmp, path)
}

func (e *Engine) loadTorOnly() bool {
	_, err := os.Stat(e.path("tor-only"))
	return err == nil
}

// setProxy changes the way out. Only socks5 to this phone is taken: the door
// is our own Tor, never someone else's server.
func (e *Engine) setProxy(addr string, torOnly bool) (any, error) {
	if addr != "" {
		u, err := url.Parse(addr)
		if err != nil || u.Scheme != "socks5" || (u.Hostname() != "127.0.0.1" && u.Hostname() != "localhost") || u.Port() == "" {
			return nil, fmt.Errorf("proxy must be socks5://127.0.0.1:port")
		}
	}
	if torOnly {
		if err := os.MkdirAll(e.dataDir, 0o700); err != nil {
			return nil, err
		}
		if err := os.WriteFile(e.path("tor-only"), nil, 0o600); err != nil {
			return nil, err
		}
	} else {
		_ = os.Remove(e.path("tor-only"))
	}
	e.mu.Lock()
	changed := e.proxy != addr
	e.proxy, e.torOnly = addr, torOnly
	running := e.client != nil
	mustStop := running && torOnly && addr == ""
	e.mu.Unlock()
	if mustStop {
		e.stop()
		e.emit(map[string]any{"type": "fatal", "error": "tor needed", "tor": true})
		return "stopped", nil
	}
	if running && changed {
		e.stop()
		return e.start()
	}
	return nil, nil
}

func (e *Engine) stop() {
	e.mu.Lock()
	defer e.mu.Unlock()
	if e.e2ee != nil {
		e.e2ee.Disconnect()
		e.e2ee = nil
	}
	if e.client != nil {
		e.client.Disconnect()
		e.client = nil
	}
	if e.cancel != nil {
		e.cancel()
		e.cancel = nil
	}
}

func (e *Engine) onMetaEvent(ctx context.Context, raw any) {
	switch evt := raw.(type) {
	case *table.LSTable:
		e.note("table:%s", tableSummary(evt))
		e.mu.Lock()
		e.takeTable(evt)
		e.mu.Unlock()
	case *messagix.ConnectedEvent:
		e.emit(map[string]any{"type": "connected"})
		e.backfill.Do(func() { go e.backfillThreads() })
		// Chats read here before the connection: Meta is told now.
		e.mu.Lock()
		var pending []int64
		for k := range e.pendingRead {
			pending = append(pending, k)
		}
		e.mu.Unlock()
		if len(pending) > 0 {
			go func() {
				for _, k := range pending {
					_ = e.markRead(k)
				}
			}()
		}
		go func() {
			if err := e.connectE2EE(); err != nil {
				e.note("encrypted chats: %v", err)
				e.emit(map[string]any{"type": "e2eeError", "error": err.Error()})
			}
		}()
	case *messagix.ReconnectedEvent:
		e.emit(map[string]any{"type": "connected"})
	case *messagix.TransientDisconnectEvent:
		e.note("disconnected: %v", evt.Err)
		e.emit(map[string]any{"type": "disconnected"})
	case *messagix.PermanentErrorEvent:
		e.note("permanent error: %v", evt.Err)
		e.emit(map[string]any{"type": "fatal", "error": evt.Err.Error(), "signIn": true})
	}
	if c := e.client; c != nil {
		if ck := c.GetCookies(); ck != nil {
			_ = e.saveCookies(ck) // Meta refreshes cookies now and then
		}
	}
}

type pageState struct {
	count    int
	oldestMs int64
	oldestK  int64
	lastAt   time.Time
}

// seen counts one chat for the page being fetched. Caller holds mu.
func (p *pageState) seen(key, ms int64) {
	p.count++
	p.lastAt = time.Now()
	if ms > 0 && (p.oldestMs == 0 || ms < p.oldestMs) {
		p.oldestMs, p.oldestK = ms, key
	}
}

// takeTable turns a Lightspeed table into threads and messages. Caller holds mu.
func (e *Engine) takeTable(t *table.LSTable) {
	if t == nil {
		return
	}
	for _, r := range t.LSUpsertSyncGroupThreadsRange {
		e.note("range group=%d parent=%d more=%v minKey=%d minMs=%d", r.SyncGroup, r.ParentThreadKey, r.HasMoreBefore, r.MinThreadKey, r.MinLastActivityTimestampMS)
	}
	for _, th := range t.LSUpdateOrInsertThread {
		e.page.seen(th.ThreadKey, th.LastActivityTimestampMs)
	}
	for _, th := range t.LSDeleteThenInsertThread {
		e.page.seen(th.ThreadKey, th.LastActivityTimestampMs)
	}
	for _, c := range t.LSVerifyContactRowExists {
		if c.Name != "" {
			e.contacts[c.ContactId] = c.Name
		}
		e.notePerson(c.ContactId, c.Name, c.ProfilePictureUrl, c.ContactViewerRelationship)
	}
	for _, c := range t.LSDeleteThenInsertContact {
		if c.Name != "" {
			e.contacts[c.Id] = c.Name
		}
		e.notePerson(c.Id, c.Name, c.GetAvatarURL(), c.ContactViewerRelationship)
	}
	for _, l := range t.LSCreateOpenToE2EEThreadLink {
		e.e2eeOf[l.OpenThreadID] = l.ArmadilloThreadID
		e.openOf[l.ArmadilloThreadID] = l.OpenThreadID
		e.note("link open=%d encrypted=%d history=%v", l.OpenThreadID, l.ArmadilloThreadID, l.ShowOpenMessageHistory)
		if th := e.threads[l.OpenThreadID]; th != nil && th.E2EEKey != l.ArmadilloThreadID {
			th.E2EEKey = l.ArmadilloThreadID
			th.Encrypted = true
			e.emit(map[string]any{"type": "thread", "thread": th})
		}
	}
	for _, p := range t.LSAddParticipantIdToGroupThread {
		known := false
		for _, id := range e.members[p.ThreadKey] {
			known = known || id == p.ContactId
		}
		if !known {
			e.members[p.ThreadKey] = append(e.members[p.ThreadKey], p.ContactId)
		}
		if e.admins[p.ThreadKey] == nil {
			e.admins[p.ThreadKey] = map[int64]bool{}
		}
		e.admins[p.ThreadKey][p.ContactId] = p.IsAdmin || p.IsSuperAdmin
		if p.Nickname != "" && e.contacts[p.ContactId] == "" {
			e.contacts[p.ContactId] = p.Nickname
		}
	}
	for _, p := range t.LSRemoveParticipantFromThread {
		list := e.members[p.ThreadKey]
		for i, id := range list {
			if id == p.ParticipantId {
				e.members[p.ThreadKey] = append(list[:i:i], list[i+1:]...)
				break
			}
		}
		delete(e.admins[p.ThreadKey], p.ParticipantId)
		e.emit(map[string]any{"type": "members", "thread": e.shownKey(p.ThreadKey)})
	}
	// Chats Meta moved to encryption come from sync group 95 as "hybrid"
	// threads: an old key (ThreadKey) and the encrypted key (ThreadJID).
	hybrid := map[int64]*table.LSVerifyHybridThreadExists{}
	for _, h := range t.LSVerifyHybridThreadExists {
		hybrid[h.ThreadKey] = h
		e.linkHybrid(h.ThreadKey, h.ThreadJID)
	}
	for _, m := range t.LSUpdateThreadAuthorityAndMappingWithOTIDFromJID {
		e.linkHybrid(m.ThreadKey, m.ThreadJID)
	}
	for _, th := range t.LSUpdateOrInsertThread {
		// Show the chat under its encrypted key: for these chats it is the
		// old open chat, which still has the earlier history.
		key := th.ThreadKey
		enc := key
		if to := e.openOf[key]; to != 0 {
			key, enc = to, to
		} else if !th.ThreadType.IsWhatsApp() {
			enc = e.e2eeOf[key]
		}
		group := !th.ThreadType.IsOneToOne()
		last := th.LastActivityTimestampMs
		if h := hybrid[th.ThreadKey]; h != nil {
			group = h.IsGroupThread || group
			if h.LastActivityTimestampMS > last {
				last = h.LastActivityTimestampMS
			}
		}
		cur := e.threads[key]
		if cur == nil {
			cur = &Thread{Key: key, Group: group}
			e.threads[key] = cur
		}
		if th.ThreadName != "" {
			cur.Name = th.ThreadName
		}
		if last >= cur.LastMs {
			cur.LastMs = last
			if th.Snippet != "" {
				cur.Snippet = th.Snippet
			}
		}
		if enc != 0 {
			cur.Encrypted = true
			cur.E2EEKey = enc
		}
		if w := th.LastReadWatermarkTimestampMs; w > 0 {
			cur.Unread = e.unreadAfter(key, w, last)
		}
		if e.lastIsMine(th.SnippetSenderContactId) && last >= cur.LastMs {
			// The last word in it is ours (from here or another device): read.
			e.readHere(last, key)
			cur.Unread = false
		}
		if cur.Name == "" {
			cur.Name = e.nameFromMembers(key, cur.Group)
		}
		if cur.Name == "" {
			cur.Name = e.nameFromMembers(th.ThreadKey, cur.Group)
		}
		if cur.Name == "" && !cur.Group {
			if n := e.contacts[enc]; n != "" {
				cur.Name = n
			} else if s := th.SnippetSenderContactId; s != 0 && s != e.selfID {
				cur.Name = e.contacts[s]
			}
		}
		e.note("hybrid thread %d encrypted=%d group=%v", key, enc, cur.Group)
		e.emit(map[string]any{"type": "thread", "thread": cur})
	}
	for _, th := range t.LSDeleteThenInsertThread {
		cur := &Thread{
			Key:       th.ThreadKey,
			Name:      th.ThreadName,
			Snippet:   th.Snippet,
			LastMs:    th.LastActivityTimestampMs,
			Encrypted: th.ThreadType.IsWhatsApp(),
			Group:     !th.ThreadType.IsOneToOne(),
		}
		if w := th.LastReadWatermarkTimestampMs; w > 0 {
			cur.Unread = e.unreadAfter(th.ThreadKey, w, th.LastActivityTimestampMs)
		}
		if e.lastIsMine(th.SnippetSenderContactId) {
			e.readHere(th.LastActivityTimestampMs, th.ThreadKey)
			cur.Unread = false
		}
		if k := e.e2eeOf[th.ThreadKey]; k != 0 {
			cur.E2EEKey = k
			cur.Encrypted = true
		}
		if open := e.openOf[th.ThreadKey]; open != 0 && open != th.ThreadKey {
			// Encrypted continuation of an older chat: show it as that chat.
			if o := e.threads[open]; o != nil {
				o.Encrypted = true
				o.E2EEKey = th.ThreadKey
				if th.LastActivityTimestampMs >= o.LastMs {
					o.LastMs = th.LastActivityTimestampMs
					if th.Snippet != "" {
						o.Snippet = th.Snippet
					}
					if w := th.LastReadWatermarkTimestampMs; w > 0 {
						o.Unread = e.unreadAfter(open, w, th.LastActivityTimestampMs)
					}
					if e.lastIsMine(th.SnippetSenderContactId) {
						e.readHere(th.LastActivityTimestampMs, open, th.ThreadKey)
						o.Unread = false
					}
				}
				e.emit(map[string]any{"type": "thread", "thread": o})
				continue
			}
		}
		if cur.Encrypted && th.ThreadType.IsWhatsApp() {
			cur.E2EEKey = th.ThreadKey
		}
		if prev := e.threads[th.ThreadKey]; prev != nil {
			if prev.LastMs > cur.LastMs {
				cur.LastMs, cur.Snippet, cur.Unread = prev.LastMs, prev.Snippet, prev.Unread
			}
			cur.Pinned = prev.Pinned
		}
		if cur.Name == "" {
			if old := e.threads[th.ThreadKey]; old != nil && old.Name != "" {
				cur.Name = old.Name
			} else {
				cur.Name = e.nameFromMembers(th.ThreadKey, cur.Group)
			}
		}
		e.note("thread %d type=%d group=%v encrypted=%v", th.ThreadKey, th.ThreadType, cur.Group, cur.Encrypted)
		e.threads[th.ThreadKey] = cur
		e.emit(map[string]any{"type": "thread", "thread": cur})
	}
	// Threads that had no name before their members/contacts arrived.
	for key, th := range e.threads {
		if th.Name == "" {
			if n := e.nameFromMembers(key, th.Group); n != "" {
				th.Name = n
				e.emit(map[string]any{"type": "thread", "thread": th})
			}
		}
	}
	atts := collectAttachments(t)
	var msgs []*Message
	for _, m := range t.LSInsertMessage {
		e.rawThread[m.MessageId] = m.ThreadKey
		if m.IsUnsent {
			e.emit(map[string]any{"type": "deleted", "thread": e.shownKey(m.ThreadKey), "id": m.MessageId})
			continue
		}
		msgs = append(msgs, &Message{Thread: m.ThreadKey, ID: m.MessageId, Sender: m.SenderId, Text: m.Text, Ms: m.TimestampMs,
			Forwarded: m.IsForwarded, Edited: m.EditCount > 0, StickerID: m.StickerId,
			ReplyTo: e.openQuote(m.ReplySourceId, m.ReplyMessageText, m.ReplySnippet, m.ReplyToUserId)})
	}
	for _, m := range t.LSUpsertMessage {
		e.rawThread[m.MessageId] = m.ThreadKey
		if m.IsUnsent {
			e.emit(map[string]any{"type": "deleted", "thread": e.shownKey(m.ThreadKey), "id": m.MessageId})
			continue
		}
		msgs = append(msgs, &Message{Thread: m.ThreadKey, ID: m.MessageId, Sender: m.SenderId, Text: m.Text, Ms: m.TimestampMs,
			Forwarded: m.IsForwarded, Edited: m.EditCount > 0, StickerID: m.StickerId,
			ReplyTo: e.openQuote(m.ReplySourceId, m.ReplyMessageText, m.ReplySnippet, m.ReplyToUserId)})
	}
	for _, msg := range msgs {
		msg.Name = e.contacts[msg.Sender]
		msg.Mine = msg.Sender == e.selfID
		if open := e.openOf[msg.Thread]; open != 0 {
			msg.Thread = open
		}
		if old := e.sent[msg.ID]; old != nil && len(old.Attachments) > 0 && len(atts[msg.ID]) == 0 {
			msg.Attachments = old.Attachments
		}
		msg.Attachments = append(msg.Attachments, atts[msg.ID]...)
		delete(atts, msg.ID)
		if msg.ID != "" {
			e.sent[msg.ID] = msg
		}
		e.emit(map[string]any{"type": "message", "message": msg})
	}
	// Attachments for messages that came in an earlier table: send the message again.
	for id, list := range atts {
		if old := e.sent[id]; old != nil {
			old.Attachments = append(old.Attachments, list...)
			e.emit(map[string]any{"type": "message", "message": old})
		}
	}
	e.takeChanges(t)
}

// linkHybrid records that Meta's hybrid key fb stands for the encrypted
// chat enc: messages and updates for fb go to enc. Caller holds mu.
func (e *Engine) linkHybrid(fb, enc int64) {
	if fb == 0 || enc == 0 || fb == enc {
		return
	}
	e.openOf[fb] = enc
	e.e2eeOf[enc] = enc
	if old := e.threads[fb]; old != nil {
		delete(e.threads, fb)
		if e.threads[enc] == nil {
			old.Key = enc
			e.threads[enc] = old
		}
		e.emit(map[string]any{"type": "threadGone", "key": fb})
	}
	if th := e.threads[enc]; th != nil && th.E2EEKey != enc {
		th.E2EEKey = enc
		th.Encrypted = true
		e.emit(map[string]any{"type": "thread", "thread": th})
	}
}

func kindOf(mime string) string {
	switch {
	case strings.HasPrefix(mime, "image/"):
		return "image"
	case strings.HasPrefix(mime, "video/"):
		return "video"
	case strings.HasPrefix(mime, "audio/"):
		return "audio"
	}
	return "file"
}

// collectAttachments groups a table's attachments by message id.
func collectAttachments(t *table.LSTable) map[string][]*Attachment {
	out := map[string][]*Attachment{}
	for _, a := range t.LSInsertAttachment {
		mime := a.PlayableUrlMimeType
		if mime == "" {
			mime = a.PreviewUrlMimeType
		}
		out[a.MessageId] = append(out[a.MessageId], &Attachment{
			Kind: kindOf(mime), URL: a.PreviewUrl, PlayURL: a.PlayableUrl, Mime: mime,
			W: a.PreviewWidth, H: a.PreviewHeight, Name: a.Filename, Title: a.TitleText, Link: a.ActionUrl,
		})
	}
	for _, a := range t.LSInsertBlobAttachment {
		mime := a.PlayableUrlMimeType
		if mime == "" {
			mime = a.PreviewUrlMimeType
		}
		out[a.MessageId] = append(out[a.MessageId], &Attachment{
			Kind: kindOf(mime), URL: a.PreviewUrl, PlayURL: a.PlayableUrl, Mime: mime,
			W: a.PreviewWidth, H: a.PreviewHeight, Name: a.Filename, Title: a.TitleText,
		})
	}
	for _, a := range t.LSInsertStickerAttachment {
		url := a.PreviewUrl
		if url == "" {
			url = a.ImageUrl
		}
		out[a.MessageId] = append(out[a.MessageId], &Attachment{
			Kind: "sticker", URL: url, PlayURL: a.PlayableUrl, Mime: a.PlayableUrlMimeType,
			W: a.PreviewWidth, H: a.PreviewHeight,
		})
	}
	for _, a := range t.LSInsertXmaAttachment {
		out[a.MessageId] = append(out[a.MessageId], &Attachment{
			Kind: "link", URL: a.PreviewUrl, Mime: a.PreviewUrlMimeType,
			W: a.PreviewWidth, H: a.PreviewHeight, Title: a.TitleText, Link: a.ActionUrl,
		})
	}
	return out
}

// backfillThreads pages through older chats: first the encrypted ones (sync
// group 95, where Meta keeps the chats moved to encryption), then the rest.
// A page answers with tasks only; its chats come a moment later on the socket.
// Meta does not always move its page marker, so each next page starts from
// the oldest chat that came, until a page brings nothing older.
func (e *Engine) backfillThreads() {
	ctx := context.Background()
	for _, group := range []int64{95, 1} {
		e.mu.Lock()
		cli := e.client
		e.mu.Unlock()
		if cli == nil {
			return
		}
		wctx, cancel := context.WithTimeout(ctx, 15*time.Second)
		if err := cli.WaitForInitialThreadRange(wctx, group); err != nil {
			e.note("thread range %d: %v", group, err)
		}
		cancel()
		var refKey, refMs int64
		for batch := 0; batch < 40; batch++ {
			ks := cli.GetSyncGroupKeyStore(group)
			if ks == nil {
				e.note("group %d: no page marker", group)
				break
			}
			e.note("group %d page %d: more=%v minKey=%d minMs=%d parent=%d", group, batch, ks.HasMoreBefore, ks.MinThreadKey, ks.MinLastActivityTimestampMs, ks.ParentThreadKey)
			// The first page starts from the newest chat, as Messenger on the web
			// does, so the newest encrypted chats are not skipped; then from the
			// oldest chat that came.
			key, ms := int64(0), int64(9999999999999)
			if refMs != 0 {
				key, ms = refKey, refMs
			}
			e.mu.Lock()
			e.page = pageState{}
			e.mu.Unlock()
			gen := cli.ThreadRangeGeneration(group)
			fctx, fcancel := context.WithTimeout(ctx, 30*time.Second)
			tbl, err := cli.ExecuteTasks(fctx, &socket.FetchThreadsTask{
				ParentThreadKey:            ks.ParentThreadKey,
				ReferenceThreadKey:         key,
				ReferenceActivityTimestamp: ms,
				Cursor:                     cli.GetCursor(group),
				SyncGroup:                  int(group),
			})
			fcancel()
			if err != nil {
				e.note("more threads %d: %v", group, err)
				break
			}
			if tbl != nil {
				e.mu.Lock()
				e.takeTable(tbl)
				e.mu.Unlock()
			}
			// Wait for the chats: until the marker moves, or 2 s after the last
			// chat came, or 20 s.
			start := time.Now()
			for time.Since(start) < 20*time.Second {
				time.Sleep(500 * time.Millisecond)
				e.mu.Lock()
				p := e.page
				e.mu.Unlock()
				if cli.ThreadRangeGeneration(group) > gen && (p.count > 0 || time.Since(start) > 5*time.Second) {
					break
				}
				if p.count > 0 && time.Since(p.lastAt) > 2*time.Second {
					break
				}
			}
			e.mu.Lock()
			p := e.page
			e.mu.Unlock()
			e.note("group %d page %d: %d chats, oldest %d at %d", group, batch, p.count, p.oldestK, p.oldestMs)
			if p.count == 0 || p.oldestMs == 0 || (refMs != 0 && p.oldestMs >= refMs) {
				break
			}
			refKey, refMs = p.oldestK, p.oldestMs
			time.Sleep(time.Second)
		}
	}
	e.note("thread backfill done")
}

// Person is someone a new chat can be started with.
type Person struct {
	ID      int64  `json:"id"`
	Name    string `json:"name"`
	Picture string `json:"picture,omitempty"`
	Friend  bool   `json:"friend,omitempty"`
}

// notePerson keeps what Meta said about someone. Caller holds mu.
func (e *Engine) notePerson(id int64, name, pic string, rel table.ContactViewerRelationship) {
	if id == 0 || id == e.selfID {
		return
	}
	p := e.people[id]
	if p == nil {
		p = &Person{ID: id}
		e.people[id] = p
	}
	if name != "" {
		p.Name = name
	}
	if pic != "" {
		p.Picture = pic
	}
	if rel == table.FACEBOOK_FRIEND || rel == table.CONTACT_OF_VIEWER {
		p.Friend = true
	}
}

// contactList asks Meta for the contact list (as Messenger on the web does for a new
// message) and returns the friends and contacts it knows, with everyone the owner has a
// one-to-one chat with, by name.
func (e *Engine) contactList() ([]Person, error) {
	e.mu.Lock()
	cli := e.client
	e.mu.Unlock()
	if cli == nil {
		return nil, errors.New("not started")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	resp, err := cli.ExecuteTasks(ctx, &socket.GetContactsTask{Limit: 1000})
	cancel()
	if err != nil {
		e.note("contact list: %v", err)
	} else if resp != nil {
		e.note("contact list:%s", tableSummary(resp))
		e.mu.Lock()
		e.takeTable(resp)
		e.mu.Unlock()
	}
	// Part of the answer can come a moment later on the socket.
	time.Sleep(1500 * time.Millisecond)
	e.mu.Lock()
	defer e.mu.Unlock()
	out := []Person{}
	for id, p := range e.people {
		th := e.threads[id]
		if p.Name == "" || (!p.Friend && (th == nil || th.Group)) {
			continue
		}
		out = append(out, *p)
	}
	sort.Slice(out, func(i, j int) bool { return strings.ToLower(out[i].Name) < strings.ToLower(out[j].Name) })
	e.note("contact list: %d people", len(out))
	return out, nil
}

// searchPeople asks Meta for people matching query (as the "new message" search does).
func (e *Engine) searchPeople(query string) ([]Person, error) {
	e.mu.Lock()
	cli := e.client
	e.mu.Unlock()
	if cli == nil {
		return nil, errors.New("not started")
	}
	query = strings.TrimSpace(query)
	if query == "" {
		return []Person{}, nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	resp, err := cli.ExecuteTasks(ctx, &socket.SearchUserTask{
		Query: query,
		SupportedTypes: []table.SearchType{
			table.SearchTypeContact, table.SearchTypeGroup, table.SearchTypePage, table.SearchTypeNonContact,
			table.SearchTypeIGContactFollowing, table.SearchTypeIGContactNonFollowing,
			table.SearchTypeIGNonContactFollowing, table.SearchTypeIGNonContactNonFollowing,
			table.SearchTypeCommunityMessagingThread,
		},
		SurfaceType: 5,
	})
	if err != nil {
		return nil, err
	}
	out := []Person{}
	seen := map[int64]bool{}
	for _, r := range resp.LSInsertSearchResult {
		can := r.CanViewerMessage || (r.OtherUserId != 0 && r.BlockedByViewerStatus == 0)
		id := r.GetFBID()
		if !r.ThreadType.IsOneToOne() || !can || id == 0 || id == e.selfID || seen[id] {
			continue
		}
		seen[id] = true
		out = append(out, Person{ID: id, Name: r.DisplayName, Picture: r.ProfilePicUrl})
	}
	e.note("search: %d people", len(out))
	return out, nil
}

// startChat opens a chat with one person, encrypted as Messenger makes new chats now, and
// lists it. An existing chat with them is simply returned.
func (e *Engine) startChat(id int64, name string) (map[string]any, error) {
	e.mu.Lock()
	cli := e.client
	if th := e.threads[id]; th != nil {
		e.mu.Unlock()
		return map[string]any{"key": id}, nil
	}
	e.mu.Unlock()
	if cli == nil {
		return nil, errors.New("not started")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if _, err := cli.ExecuteTasks(ctx, &socket.CreateThreadTask{ThreadFBID: id, SyncGroup: 1}); err != nil {
		e.note("create chat: %v", err)
	}
	resp, err := cli.ExecuteTasks(ctx, &socket.CreateWhatsAppThreadTask{
		WAJID:            id,
		OfflineThreadKey: methods.GenerateEpochID(),
		ThreadType:       table.ENCRYPTED_OVER_WA_ONE_TO_ONE,
		FolderType:       table.INBOX,
		BumpTimestampMS:  time.Now().UnixMilli(),
	})
	if err != nil {
		return nil, err
	}
	if resp != nil && len(resp.LSIssueNewTask) > 0 {
		tasks := make([]socket.Task, len(resp.LSIssueNewTask))
		for i, t := range resp.LSIssueNewTask {
			tasks[i] = t
		}
		if _, err := cli.ExecuteTasks(ctx, tasks...); err != nil {
			e.note("create encrypted chat subtasks: %v", err)
		}
	}
	e.mu.Lock()
	defer e.mu.Unlock()
	if name != "" {
		e.contacts[id] = name
	}
	th := e.threads[id]
	if th == nil {
		th = &Thread{Key: id, Name: name, LastMs: time.Now().UnixMilli()}
		e.threads[id] = th
	}
	th.Encrypted = true
	th.E2EEKey = id
	e.e2eeOf[id] = id
	e.note("new chat %d", id)
	e.emit(map[string]any{"type": "thread", "thread": th})
	return map[string]any{"key": id}, nil
}

// nameFromMembers names a chat after its people when Meta gives no name.
// Caller holds mu.
func (e *Engine) nameFromMembers(key int64, group bool) string {
	if !group {
		if n := e.contacts[key]; n != "" {
			return n
		}
	}
	names := ""
	count := 0
	for _, id := range e.members[key] {
		if id == e.selfID {
			continue
		}
		if n := e.contacts[id]; n != "" {
			if count < 3 {
				if names != "" {
					names += ", "
				}
				names += n
			}
			count++
		}
	}
	if count > 3 {
		names += fmt.Sprintf(" +%d", count-3)
	}
	return names
}

// fetchMessages asks Meta for the latest messages of a chat; they arrive as
// "message" events.
func (e *Engine) fetchMessages(thread int64) error {
	e.mu.Lock()
	cli := e.client
	e.mu.Unlock()
	if cli == nil {
		return errors.New("not started")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := cli.WaitUntilCanSendMessages(ctx, 15*time.Second); err != nil {
		return err
	}
	resp, err := cli.ExecuteTasks(ctx, &socket.FetchMessagesTask{
		ThreadKey:            thread,
		Direction:            0,
		ReferenceTimestampMs: time.Now().UnixMilli(),
		ReferenceMessageId:   "",
		SyncGroup:            1,
		Cursor:               cli.GetCursor(1),
	})
	if err != nil {
		e.note("fetch %d failed: %v", thread, err)
		return err
	}
	e.note("fetch %d:%s", thread, tableSummary(resp))
	e.mu.Lock()
	e.takeTable(resp)
	e.mu.Unlock()
	return nil
}

func (e *Engine) threadList() []*Thread {
	e.mu.Lock()
	defer e.mu.Unlock()
	out := make([]*Thread, 0, len(e.threads))
	for _, t := range e.threads {
		out = append(out, t)
	}
	return out
}

// connectE2EE opens the encrypted-chat socket (Meta's Signal-based system,
// carried over WhatsApp's protocol), registering this device the first time.
func (e *Engine) connectE2EE() error {
	ctx := context.Background()
	e.mu.Lock()
	cli := e.client
	e.mu.Unlock()
	if cli == nil {
		return errors.New("not started")
	}
	if e.devices == nil {
		dsn := "file:" + e.path("e2ee.db") + "?_pragma=foreign_keys(1)&_pragma=busy_timeout(5000)"
		c, err := sqlstore.New(ctx, "sqlite", dsn, waLog.Noop)
		if err != nil {
			return fmt.Errorf("open key store: %w", err)
		}
		e.devices = c
	}
	var acc account
	if b, err := os.ReadFile(e.path("account.json")); err == nil {
		_ = json.Unmarshal(b, &acc)
	}
	var dev *store.Device
	var err error
	if acc.DeviceID != 0 {
		dev, err = e.devices.GetDevice(ctx, waTypes.JID{User: strconv.FormatInt(e.selfID, 10), Device: acc.DeviceID, Server: waTypes.MessengerServer})
		if err != nil {
			return err
		}
	}
	if dev == nil {
		dev = e.devices.NewDevice()
		cli.SetDevice(dev)
		if err := cli.RegisterE2EE(ctx, e.selfID); err != nil {
			return fmt.Errorf("register encrypted device: %w", err)
		}
		if err := dev.Save(ctx); err != nil {
			return err
		}
		acc.DeviceID = dev.ID.Device
		b, _ := json.Marshal(acc)
		if err := os.WriteFile(e.path("account.json"), b, 0o600); err != nil {
			return err
		}
	} else {
		cli.SetDevice(dev)
	}
	wa, err := cli.PrepareE2EEClient()
	if err != nil {
		return err
	}
	e.mu.Lock()
	way := e.proxy
	e.mu.Unlock()
	// Always set: "" turns off whatsmeow's reading of https_proxy, so the
	// encrypted chats and their media go exactly the way the account says.
	if err := wa.SetProxyAddress(way); err != nil {
		return err
	}
	wa.AddEventHandler(e.onE2EEEvent)
	if err := wa.Connect(); err != nil {
		return err
	}
	e.mu.Lock()
	e.e2ee = wa
	e.device = dev
	e.mu.Unlock()
	return nil
}

func (e *Engine) onE2EEEvent(raw any) {
	switch evt := raw.(type) {
	case *events.Connected:
		e.note("encrypted chats connected")
		e.emit(map[string]any{"type": "e2eeConnected"})
	case *events.FBMessage:
		e.onFBMessage(evt)
	case *events.Receipt:
		e.onReceipt(evt)
	case *events.Disconnected:
		e.note("encrypted chats disconnected")
	case *events.UndecryptableMessage:
		e.note("undecryptable message in %s", evt.Info.Chat)
		e.emit(map[string]any{"type": "undecryptable", "chat": evt.Info.Chat.User})
	case *events.LoggedOut:
		e.emit(map[string]any{"type": "fatal", "error": "encrypted chats signed out", "signIn": true})
	}
}

// onReceipt takes our own reads from another device (Messenger's app, the
// web): the encrypted messages read there are read here too.
func (e *Engine) onReceipt(evt *events.Receipt) {
	if !evt.IsFromMe || (evt.Type != waTypes.ReceiptTypeRead && evt.Type != waTypes.ReceiptTypeReadSelf) {
		return
	}
	e.mu.Lock()
	defer e.mu.Unlock()
	key := e.shownKeyOfChat(evt.Chat)
	read := map[string]bool{}
	var upTo int64
	for _, id := range evt.MessageIDs {
		read[id] = true
		if m := e.sent[id]; m != nil && m.Ms > upTo {
			upTo = m.Ms
		}
	}
	if ts := evt.Timestamp.UnixMilli(); ts > upTo {
		upTo = ts
	}
	left := e.unreadWA[key][:0]
	for _, id := range e.unreadWA[key] {
		if !read[id] {
			left = append(left, id)
		}
	}
	if len(left) == 0 {
		delete(e.unreadWA, key)
	} else {
		e.unreadWA[key] = left
	}
	e.readHere(upTo, key)
	if th := e.threads[key]; th != nil && th.Unread && len(left) == 0 && e.readMark(key) >= th.LastMs {
		th.Unread = false
		e.emit(map[string]any{"type": "thread", "thread": th})
	}
}

func (e *Engine) sendText(thread int64, text, replyTo string) (any, error) {
	e.mu.Lock()
	cli, wa := e.client, e.e2ee
	th := e.threads[thread]
	e.mu.Unlock()
	if cli == nil {
		return nil, errors.New("not started")
	}
	otid := time.Now().UnixMilli()<<22 | int64(time.Now().Nanosecond()&0x3fffff)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if th != nil && th.Encrypted {
		if wa == nil {
			return nil, errors.New("encrypted chats are not connected yet")
		}
		target := thread
		if th.E2EEKey != 0 {
			target = th.E2EEKey
		}
		jid := waTypes.JID{User: strconv.FormatInt(target, 10), Server: waTypes.MessengerServer}
		if th.Group {
			jid.Server = waTypes.GroupServer
		}
		msg := &waConsumerApplication.ConsumerApplication{
			Payload: &waConsumerApplication.ConsumerApplication_Payload{
				Payload: &waConsumerApplication.ConsumerApplication_Payload_Content{
					Content: &waConsumerApplication.ConsumerApplication_Content{
						Content: &waConsumerApplication.ConsumerApplication_Content_MessageText{
							MessageText: &waCommon.MessageText{Text: proto.String(text)},
						},
					},
				},
			},
		}
		res, err := e.sendWA(ctx, wa, jid, msg, replyTo, otid)
		if err == nil {
			e.echoOwn(thread, res, text, replyTo, nil, nil)
		}
		return res, err
	}

	if err := cli.WaitUntilCanSendMessages(ctx, 15*time.Second); err != nil {
		return nil, err
	}
	task := &socket.SendMessageTask{
		ThreadId:         thread,
		Otid:             otid,
		Source:           table.MESSENGER_INBOX_IN_THREAD,
		InitiatingSource: table.FACEBOOK_INBOX,
		SendType:         table.TEXT,
		SyncGroup:        1,
		Text:             text,
	}
	if replyTo != "" {
		task.ReplyMetaData = &socket.ReplyMetaData{ReplyMessageId: replyTo, ReplySourceType: 1}
	}
	return e.runSend(ctx, cli, thread, otid, task)
}

// runSend sends one message task to an open chat and returns the id Meta gave it.
func (e *Engine) runSend(ctx context.Context, cli *messagix.Client, thread, otid int64, task *socket.SendMessageTask) (any, error) {
	if err := cli.WaitUntilCanSendMessages(ctx, 15*time.Second); err != nil {
		return nil, err
	}
	task.ThreadId = e.openKeyOf(thread)
	resp, err := cli.ExecuteTasks(ctx, task, &socket.ThreadMarkReadTask{ThreadId: task.ThreadId, SyncGroup: 1})
	if err != nil {
		e.note("send to %d failed: %v", thread, err)
		return nil, err
	}
	e.note("sent to %d:%s", thread, tableSummary(resp))
	e.mu.Lock()
	e.takeTable(resp)
	e.mu.Unlock()
	otidStr := strconv.FormatInt(otid, 10)
	id := ""
	if resp != nil {
		for _, r := range resp.LSReplaceOptimsiticMessage {
			if r.OfflineThreadingId == otidStr {
				id = r.MessageId
			}
		}
	}
	return map[string]any{"id": id, "ms": time.Now().UnixMilli()}, nil
}
