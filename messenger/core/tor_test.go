// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package core

import (
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strconv"

	"go.mau.fi/util/exhttp"

	"strings"
	"testing"
)

type quiet struct{ events []string }

func (q *quiet) OnEvent(s string) { q.events = append(q.events, s) }

func TestProxyOnlyOurOwnSocks(t *testing.T) {
	e := NewEngine(t.TempDir(), &quiet{})
	for _, bad := range []string{"http://127.0.0.1:9050", "socks5://10.0.0.1:9050", "socks5://127.0.0.1", "socks5://evil.example:9050"} {
		if _, err := e.setProxy(bad, false); err == nil {
			t.Errorf("%s was taken", bad)
		}
	}
	if _, err := e.setProxy("socks5://127.0.0.1:9050", false); err != nil {
		t.Fatal(err)
	}
}

func TestTorOnlyNeverStraight(t *testing.T) {
	dir := t.TempDir()
	e := NewEngine(dir, &quiet{})
	if err := e.login(map[string]string{"c_user": "1", "xs": "x", "datr": "d"}); err != nil {
		t.Skip("cookie names changed:", err)
	}
	if _, err := e.setProxy("", true); err != nil {
		t.Fatal(err)
	}
	// A new run of the app: the door is not known yet, the rule is kept.
	e2 := NewEngine(dir, &quiet{})
	if _, err := e2.start(); err == nil || !strings.Contains(err.Error(), "tor needed") {
		t.Fatalf("started straight: %v", err)
	}
	if err := e2.fetch("https://example.org/x", dir+"/x"); err == nil || !strings.Contains(err.Error(), "tor needed") {
		t.Fatalf("fetched straight: %v", err)
	}
	if _, err := e2.setProxy("", false); err != nil {
		t.Fatal(err)
	}
	if e2.loadTorOnly() {
		t.Fatal("tor-only kept after turning it off")
	}
}

// A tiny SOCKS5 door that wants a user and password, like Erevos's.
func socksDoor(t *testing.T, user, pw string) (addr string, used *bool) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { ln.Close() })
	ok := false
	go func() {
		for {
			c, err := ln.Accept()
			if err != nil {
				return
			}
			go func(c net.Conn) {
				defer c.Close()
				b := make([]byte, 512)
				io.ReadFull(c, b[:2])
				io.ReadFull(c, b[:b[1]])
				c.Write([]byte{5, 2})
				io.ReadFull(c, b[:2])
				u := make([]byte, b[1])
				io.ReadFull(c, u)
				io.ReadFull(c, b[:1])
				p := make([]byte, b[0])
				io.ReadFull(c, p)
				if string(u) != user || string(p) != pw {
					c.Write([]byte{1, 1})
					return
				}
				c.Write([]byte{1, 0})
				io.ReadFull(c, b[:4])
				var host string
				switch b[3] {
				case 3:
					io.ReadFull(c, b[:1])
					h := make([]byte, b[0])
					io.ReadFull(c, h)
					host = string(h)
				case 1:
					io.ReadFull(c, b[:4])
					host = net.IP(b[:4]).String()
				}
				io.ReadFull(c, b[:2])
				port := int(b[0])<<8 | int(b[1])
				up, err := net.Dial("tcp", net.JoinHostPort(host, strconv.Itoa(port)))
				if err != nil {
					c.Write([]byte{5, 1, 0, 1, 0, 0, 0, 0, 0, 0})
					return
				}
				defer up.Close()
				ok = true
				c.Write([]byte{5, 0, 0, 1, 0, 0, 0, 0, 0, 0})
				go io.Copy(up, c)
				io.Copy(c, up)
			}(c)
		}
	}()
	return ln.Addr().String(), &ok
}

func TestDoorWithPassword(t *testing.T) {
	addr, used := socksDoor(t, "erevos", "s3cret")
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("hi")) }))
	defer srv.Close()
	dir := t.TempDir()
	e := NewEngine(dir, &quiet{})
	door := "socks5://erevos:s3cret@" + addr
	if _, err := e.setProxy(door, true); err != nil {
		t.Fatal(err)
	}
	// The test server's own certificate: trust it for this run only.
	old := http.DefaultTransport.(*http.Transport).TLSClientConfig
	defer func() { http.DefaultTransport.(*http.Transport).TLSClientConfig = old }()
	cs, _ := exhttp.SensibleClientSettings.WithProxy(door)
	c := cs.Compile()
	c.Transport.(*http.Transport).TLSClientConfig = srv.Client().Transport.(*http.Transport).TLSClientConfig
	resp, err := c.Get(srv.URL)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if !*used {
		t.Fatal("did not go through the door")
	}
	if _, err := e.setProxy("socks5://erevos:wrong@"+addr, false); err != nil {
		t.Fatal(err)
	}
	cs, _ = exhttp.SensibleClientSettings.WithProxy("socks5://erevos:wrong@" + addr)
	if _, err := cs.Compile().Get(srv.URL); err == nil {
		t.Fatal("wrong password went through")
	}
}
