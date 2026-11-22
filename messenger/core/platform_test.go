// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package core

import (
	"os"
	"testing"

	"go.mau.fi/mautrix-meta/pkg/messagix/types"
)

func TestNewSignInIsFacebookOldStaysMessenger(t *testing.T) {
	dir := t.TempDir()
	e := NewEngine(dir, &quiet{})
	ck := map[string]string{"c_user": "1", "xs": "x", "datr": "d", "fr": "f"}
	if err := e.login(ck); err != nil {
		t.Fatal(err)
	}
	c, err := e.loadCookies()
	if err != nil {
		t.Fatal(err)
	}
	if c.Platform != types.Facebook || e.webHost() != "www.facebook.com" {
		t.Fatalf("new sign-in: %v %s", c.Platform, e.webHost())
	}
	// An older messenger.com sign-in has cookies.json and no platform file.
	os.Remove(e.path("platform"))
	c, _ = e.loadCookies()
	if c.Platform != types.Messenger || e.webHost() != "www.messenger.com" {
		t.Fatalf("old sign-in: %v %s", c.Platform, e.webHost())
	}
}
