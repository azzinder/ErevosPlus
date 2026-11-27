// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package core

// What a chat can do beyond plain text: reactions, replies, taking a message
// back, forwarding, photos/videos/voice/files, stickers, polls, pinned
// messages, read marks and group members. Open chats go through Meta's
// Lightspeed tasks, encrypted chats through the WhatsApp-based protocol.

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"time"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/proto/waArmadilloApplication"
	"go.mau.fi/whatsmeow/proto/waArmadilloXMA"
	"go.mau.fi/whatsmeow/proto/waCommon"
	"go.mau.fi/whatsmeow/proto/waConsumerApplication"
	"go.mau.fi/whatsmeow/proto/waMediaTransport"
	"go.mau.fi/whatsmeow/proto/waMsgApplication"
	waTypes "go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	"google.golang.org/protobuf/proto"

	"go.mau.fi/mautrix-meta/pkg/messagix"
	"go.mau.fi/mautrix-meta/pkg/messagix/httpclient"
	"go.mau.fi/mautrix-meta/pkg/messagix/socket"
	"go.mau.fi/mautrix-meta/pkg/messagix/table"
)

// waRef is where an encrypted message lives and who wrote it.
type waRef struct {
	Chat   waTypes.JID
	Sender waTypes.JID
}

// Member is one person in a group, for the group screen.
type Member struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Admin bool   `json:"admin,omitempty"`
	Me    bool   `json:"me,omitempty"`
}

func (e *Engine) callMore(op string, args []byte) (any, error) {
	var a struct {
		Thread    int64    `json:"thread"`
		ID        string   `json:"id"`
		Emoji     string   `json:"emoji"`
		To        []int64  `json:"to"`
		Path      string   `json:"path"`
		Thumb     string   `json:"thumb"`
		Mime      string   `json:"mime"`
		Name      string   `json:"name"`
		Caption   string   `json:"caption"`
		Voice     bool     `json:"voice"`
		AsSticker bool     `json:"asSticker"`
		Ms        int64    `json:"durationMs"`
		W         int      `json:"w"`
		H         int      `json:"h"`
		ReplyTo   string   `json:"replyTo"`
		Sticker   int64    `json:"sticker"`
		Question  string   `json:"question"`
		Options   []string `json:"options"`
		Poll      int64    `json:"poll"`
		Selected  []int64  `json:"selected"`
		Person    int64    `json:"person"`
		People    []int64  `json:"people"`
		Admin     bool     `json:"admin"`
		Title     string   `json:"title"`
		Text      string   `json:"text"`
	}
	if len(args) > 0 {
		if err := json.Unmarshal(args, &a); err != nil {
			return nil, err
		}
	}
	switch op {
	case "markRead":
		return nil, e.markRead(a.Thread)
	case "markAllRead":
		return e.markAllRead()
	case "react":
		return nil, e.react(a.ID, a.Emoji)
	case "unsend":
		return nil, e.unsend(a.ID)
	case "edit":
		return nil, e.edit(a.ID, a.Text)
	case "deleteForMe":
		return nil, e.deleteForMe(a.ID)
	case "forward":
		return e.forward(a.ID, a.To)
	case "sendMedia":
		return e.sendMedia(a.Thread, mediaArgs{Path: a.Path, Thumb: a.Thumb, Mime: a.Mime, Name: a.Name, Caption: a.Caption,
			Voice: a.Voice, DurationMs: a.Ms, W: a.W, H: a.H, ReplyTo: a.ReplyTo, Sticker: a.AsSticker})
	case "sendSticker":
		return e.sendSticker(a.Thread, a.Sticker)
	case "createPoll":
		return nil, e.openTask(a.Thread, &socket.CreatePollTask{QuestionText: a.Question, ThreadKey: e.openKeyOf(a.Thread), Options: a.Options, SyncGroup: 1})
	case "votePoll":
		sel := slices.Clone(a.Selected)
		slices.Sort(sel)
		return nil, e.openTask(a.Thread, &socket.UpdatePollTask{ThreadKey: e.openKeyOf(a.Thread), PollID: a.Poll, SelectedOptions: slices.Compact(sel), SyncGroup: 1})
	case "members":
		return e.memberList(a.Thread)
	case "renameGroup":
		return nil, e.renameGroup(a.Thread, a.Title)
	case "removeMember":
		return nil, e.changeMembers(a.Thread, []int64{a.Person}, whatsmeow.ParticipantChangeRemove)
	case "addMembers":
		return nil, e.changeMembers(a.Thread, a.People, whatsmeow.ParticipantChangeAdd)
	case "setAdmin":
		action := whatsmeow.ParticipantChangeDemote
		if a.Admin {
			action = whatsmeow.ParticipantChangePromote
		}
		return nil, e.changeMembers(a.Thread, []int64{a.Person}, action)
	}
	return nil, fmt.Errorf("unknown op %q", op)
}

// shownKey is the key a chat is listed under (an encrypted chat that continues
// an older one is shown as that one). Caller holds mu.
func (e *Engine) shownKey(k int64) int64 {
	if o := e.openOf[k]; o != 0 {
		return o
	}
	return k
}

// openKeyOf is the key Meta's open tasks take for a listed chat.
func (e *Engine) openKeyOf(k int64) int64 { return k }

// openQuote builds the quote of an open reply. Caller holds mu.
func (e *Engine) openQuote(id, text, snippet string, sender int64) *Quote {
	if id == "" {
		return nil
	}
	if text == "" {
		text = snippet
	}
	if text == "" {
		if m := e.sent[id]; m != nil {
			text = m.Text
		}
	}
	return &Quote{ID: id, Text: text, Sender: sender, Name: e.contacts[sender]}
}

// takeChanges handles the parts of a table that change messages already shown.
// Caller holds mu.
func (e *Engine) takeChanges(t *table.LSTable) {
	for _, r := range t.LSUpsertReaction {
		e.emit(map[string]any{"type": "reaction", "thread": e.shownKey(r.ThreadKey), "id": r.MessageId,
			"actor": r.ActorId, "name": e.contacts[r.ActorId], "emoji": r.Reaction, "mine": r.ActorId == e.selfID})
	}
	for _, r := range t.LSDeleteReaction {
		e.emit(map[string]any{"type": "reaction", "thread": e.shownKey(r.ThreadKey), "id": r.MessageId,
			"actor": r.ActorId, "emoji": "", "mine": r.ActorId == e.selfID})
	}
	for _, d := range t.LSDeleteMessage {
		e.emit(map[string]any{"type": "deleted", "thread": e.shownKey(d.ThreadKey), "id": d.MessageId})
	}
	for _, ed := range t.LSEditMessage {
		if m := e.sent[ed.MessageID]; m != nil {
			m.Text, m.Edited = ed.Text, true
		}
		e.emit(map[string]any{"type": "edited", "id": ed.MessageID, "text": ed.Text})
	}
	for _, p := range t.LSSetPinnedMessage {
		e.setPinned(e.shownKey(p.ThreadKey), p.MessageId)
	}
	for _, p := range t.LSClearPinnedMessages {
		e.setPinned(e.shownKey(p.ThreadKey), "")
	}
	for _, r := range t.LSMarkThreadRead {
		e.readUpTo(e.shownKey(r.ThreadKey), r.LastReadWatermarkTimestampMs)
	}
	for _, r := range t.LSMarkThreadReadV2 {
		e.readUpTo(e.shownKey(r.ThreadKey), r.LastReadWatermarkTimestampMs)
	}
	e.takePolls(t)
}

func (e *Engine) setPinned(key int64, id string) {
	th := e.threads[key]
	if th == nil || th.Pinned == id {
		return
	}
	th.Pinned = id
	text := ""
	if m := e.sent[id]; m != nil {
		text = m.Text
	}
	e.emit(map[string]any{"type": "pinned", "thread": key, "id": id, "text": text})
	e.emit(map[string]any{"type": "thread", "thread": th})
}

func (e *Engine) readUpTo(key, ms int64) {
	th := e.threads[key]
	if th == nil || ms <= 0 {
		return
	}
	unread := e.unreadAfter(key, ms, th.LastMs)
	if !unread && ms >= th.LastMs {
		// Read up to its end, here or elsewhere: kept, so a later copy of the
		// chat with an older mark does not make it unread again.
		e.readHere(ms, key)
	}
	if th.Unread != unread {
		th.Unread = unread
		e.emit(map[string]any{"type": "thread", "thread": th})
	}
	// Meta's read mark, from here or another device (Messenger's case, the
	// app): the screens count what came on their own, and this is what tells
	// them it was read, even when the chat here was never unread.
	e.emit(map[string]any{"type": "read", "thread": key, "upTo": ms})
}

// takePolls sends what a table says about polls: a new poll with its
// options, and the votes. Caller holds mu.
func (e *Engine) takePolls(t *table.LSTable) {
	if len(t.LSAddPollForThread)+len(t.LSUpdatePollAdminMessageSummary)+len(t.LSVerifyPollExists)+
		len(t.LSAddPollOptionV2)+len(t.LSAddPollVoteV2)+len(t.LSRemovePollVoteV2)+len(t.LSAddPollOption)+len(t.LSAddPollVote) == 0 {
		return
	}
	upserts, inserts := t.WrapMessages()
	all := inserts
	for _, u := range upserts {
		all = append(all, u.Messages...)
	}
	for _, m := range all {
		if m.PollID == 0 {
			continue
		}
		thread := e.shownKey(m.ThreadKey)
		switch m.PollEventType {
		case table.PollEventCreate:
			e.emit(map[string]any{"type": "poll", "thread": thread, "id": m.MessageId, "poll": m.PollID,
				"question": m.PollQuestion, "options": m.PollOptions})
		default:
			if len(m.PollOptions) > 0 {
				e.emit(map[string]any{"type": "pollOptions", "thread": thread, "poll": m.PollID, "options": m.PollOptions})
			}
			for _, v := range m.PollVotes {
				e.emit(map[string]any{"type": "pollVote", "thread": thread, "poll": m.PollID, "actor": v.ContactID, "option": v.OptionID, "on": true})
			}
			for _, v := range m.PollRemovals {
				e.emit(map[string]any{"type": "pollVote", "thread": thread, "poll": m.PollID, "actor": v.ContactID, "option": v.OptionID, "on": false})
			}
		}
	}
	for _, p := range t.WrapPollData() {
		e.emit(map[string]any{"type": "pollState", "poll": p.PollID, "options": p.Options, "votes": p.Votes})
	}
}

// ---- encrypted messages in ----

func (e *Engine) onFBMessage(evt *events.FBMessage) {
	key, _ := strconv.ParseInt(evt.Info.Chat.User, 10, 64)
	sender, _ := strconv.ParseInt(evt.Info.Sender.User, 10, 64)
	e.mu.Lock()
	key = e.shownKey(key)
	name := e.contacts[sender]
	e.waRefs[evt.Info.ID] = waRef{Chat: evt.Info.Chat, Sender: evt.Info.Sender.ToNonAD()}
	e.mu.Unlock()
	mine := evt.Info.IsFromMe
	msg := &Message{Thread: key, ID: evt.Info.ID, Sender: sender, Name: name, Ms: evt.Info.Timestamp.UnixMilli(), Mine: mine, Encrypted: true}
	if qm := evt.FBApplication.GetMetadata().GetQuotedMessage(); qm != nil && qm.GetStanzaID() != "" {
		msg.ReplyTo = e.quoteOf(qm.GetStanzaID(), qm.GetParticipant())
	}
	var download func()
	switch m := evt.Message.(type) {
	case *waConsumerApplication.ConsumerApplication:
		if rev := m.GetPayload().GetApplicationData().GetRevoke(); rev != nil {
			e.emit(map[string]any{"type": "deleted", "thread": key, "id": rev.GetKey().GetID()})
			return
		}
		content := m.GetPayload().GetContent()
		if r := content.GetReactionMessage(); r != nil {
			e.emit(map[string]any{"type": "reaction", "thread": key, "id": r.GetKey().GetID(), "actor": sender,
				"name": name, "emoji": r.GetText(), "mine": mine})
			return
		}
		if ed := content.GetEditMessage(); ed != nil {
			e.emit(map[string]any{"type": "edited", "id": ed.GetKey().GetID(), "text": ed.GetMessage().GetText()})
			return
		}
		msg.Text, download = e.consumerContent(content, msg)
	case *waArmadilloApplication.Armadillo:
		msg.Text = armadilloContent(m.GetPayload().GetContent(), msg)
	default:
		msg.Text = fmt.Sprintf("[%T]", evt.Message)
	}
	if msg.Text == "" && len(msg.Attachments) == 0 && download == nil {
		msg.Text = fmt.Sprintf("[%T]", evt.Message)
	}
	e.note("encrypted message in %s (%T)", evt.Info.Chat, evt.Message)
	e.mu.Lock()
	e.sent[msg.ID] = msg
	// Theirs, after the chat was last read here (not one sent again from before).
	if !mine && msg.Ms > e.readMark(key) {
		e.unreadWA[key] = append(e.unreadWA[key], msg.ID)
		if th := e.threads[key]; th != nil {
			th.Unread = true
			if msg.Ms >= th.LastMs {
				th.LastMs = msg.Ms
				if msg.Text != "" {
					th.Snippet = msg.Text
				}
			}
			e.emit(map[string]any{"type": "thread", "thread": th})
		}
	}
	e.mu.Unlock()
	e.emit(map[string]any{"type": "message", "message": msg})
	if download != nil {
		go download()
	}
}

// quoteOf builds the quote of an encrypted reply.
func (e *Engine) quoteOf(id, participant string) *Quote {
	q := &Quote{ID: id}
	if j, err := waTypes.ParseJID(participant); err == nil {
		q.Sender, _ = strconv.ParseInt(j.User, 10, 64)
	}
	e.mu.Lock()
	defer e.mu.Unlock()
	if m := e.sent[id]; m != nil {
		q.Text, q.Sender = m.Text, m.Sender
		if q.Text == "" && len(m.Attachments) > 0 {
			q.Text = "[" + m.Attachments[0].Kind + "]"
		}
	}
	q.Name = e.contacts[q.Sender]
	return q
}

// consumerContent reads an encrypted message. Media is fetched after the
// message is shown: the returned func downloads it and sends the message again.
func (e *Engine) consumerContent(c *waConsumerApplication.ConsumerApplication_Content, msg *Message) (string, func()) {
	switch {
	case c.GetMessageText() != nil:
		return c.GetMessageText().GetText(), nil
	case c.GetExtendedTextMessage() != nil:
		x := c.GetExtendedTextMessage()
		text := x.GetText().GetText()
		if x.GetMatchedText() != "" || x.GetTitle() != "" {
			msg.Attachments = append(msg.Attachments, &Attachment{Kind: "link", Title: x.GetTitle(), Link: x.GetMatchedText()})
		}
		return text, nil
	case c.GetLocationMessage() != nil:
		l := c.GetLocationMessage()
		lat, lon := l.GetLocation().GetDegreesLatitude(), l.GetLocation().GetDegreesLongitude()
		msg.Attachments = append(msg.Attachments, &Attachment{Kind: "location", Title: strings.TrimSpace(l.GetLocation().GetName() + " " + l.GetAddress()),
			Link: fmt.Sprintf("https://www.openstreetmap.org/?mlat=%.6f&mlon=%.6f#map=16/%.6f/%.6f", lat, lon, lat, lon)})
		return "", nil
	case c.GetLiveLocationMessage() != nil:
		l := c.GetLiveLocationMessage().GetLocation()
		lat, lon := l.GetDegreesLatitude(), l.GetDegreesLongitude()
		msg.Attachments = append(msg.Attachments, &Attachment{Kind: "location", Title: "live",
			Link: fmt.Sprintf("https://www.openstreetmap.org/?mlat=%.6f&mlon=%.6f#map=16/%.6f/%.6f", lat, lon, lat, lon)})
		return "", nil
	case c.GetContactMessage() != nil:
		msg.Attachments = append(msg.Attachments, &Attachment{Kind: "contact"})
		if tr, err := c.GetContactMessage().Decode(); err == nil {
			msg.Attachments[len(msg.Attachments)-1].Title = vcardName(tr.GetIntegral().GetVcard())
		}
		return "", nil
	case c.GetContactsArrayMessage() != nil:
		msg.Attachments = append(msg.Attachments, &Attachment{Kind: "contact", Title: c.GetContactsArrayMessage().GetDisplayName()})
		return "", nil
	case c.GetImageMessage() != nil:
		tr, err := c.GetImageMessage().Decode()
		if err != nil {
			return "", nil
		}
		att := &Attachment{Kind: "image", Mime: tr.GetIntegral().GetTransport().GetAncillary().GetMimetype(),
			W: int64(tr.GetAncillary().GetWidth()), H: int64(tr.GetAncillary().GetHeight())}
		return c.GetImageMessage().GetCaption().GetText(), e.fetchLater(msg, att, tr.GetIntegral().GetTransport(), whatsmeow.MediaImage)
	case c.GetVideoMessage() != nil:
		tr, err := c.GetVideoMessage().Decode()
		if err != nil {
			return "", nil
		}
		att := &Attachment{Kind: "video", Mime: tr.GetIntegral().GetTransport().GetAncillary().GetMimetype(),
			W: int64(tr.GetAncillary().GetWidth()), H: int64(tr.GetAncillary().GetHeight())}
		return c.GetVideoMessage().GetCaption().GetText(), e.fetchLater(msg, att, tr.GetIntegral().GetTransport(), whatsmeow.MediaVideo)
	case c.GetAudioMessage() != nil:
		tr, err := c.GetAudioMessage().Decode()
		if err != nil {
			return "", nil
		}
		att := &Attachment{Kind: "audio", Mime: tr.GetIntegral().GetTransport().GetAncillary().GetMimetype()}
		if c.GetAudioMessage().GetPTT() {
			att.Title = "voice"
		}
		return "", e.fetchLater(msg, att, tr.GetIntegral().GetTransport(), whatsmeow.MediaAudio)
	case c.GetDocumentMessage() != nil:
		tr, err := c.GetDocumentMessage().Decode()
		if err != nil {
			return "", nil
		}
		att := &Attachment{Kind: "file", Mime: tr.GetIntegral().GetTransport().GetAncillary().GetMimetype(), Name: c.GetDocumentMessage().GetFileName()}
		return "", e.fetchLater(msg, att, tr.GetIntegral().GetTransport(), whatsmeow.MediaDocument)
	case c.GetStickerMessage() != nil:
		tr, err := c.GetStickerMessage().Decode()
		if err != nil {
			return "", nil
		}
		att := &Attachment{Kind: "sticker", W: int64(tr.GetAncillary().GetWidth()), H: int64(tr.GetAncillary().GetHeight())}
		if id := tr.GetAncillary().GetReceiverFetchID(); id != "" {
			return "", func() {
				e.mu.Lock()
				cli := e.client
				e.mu.Unlock()
				if cli == nil {
					return
				}
				ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
				defer cancel()
				media, err := cli.FetchReceiverFetchMedia(ctx, id)
				if err != nil {
					e.note("sticker: %v", err)
					return
				}
				att.URL, att.Mime = media.URL, media.MimeType
				e.addAttachment(msg, att)
			}
		}
		att.Mime = tr.GetIntegral().GetTransport().GetAncillary().GetMimetype()
		return "", e.fetchLater(msg, att, tr.GetIntegral().GetTransport(), whatsmeow.MediaImage)
	}
	return "", nil
}

func vcardName(v string) string {
	for _, line := range strings.Split(v, "\n") {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "FN:") {
			return strings.TrimPrefix(line, "FN:")
		}
	}
	return ""
}

// armadilloContent reads Meta's own kinds of encrypted messages: shared links,
// locations, forwarded posts and photo galleries.
func armadilloContent(c *waArmadilloApplication.Armadillo_Content, msg *Message) string {
	if x := c.GetExtendedContentMessage(); x != nil {
		att := &Attachment{Kind: "link", Title: strings.TrimSpace(x.GetTitleText() + "\n" + x.GetSubtitleText())}
		for _, cta := range x.GetCtas() {
			link := cta.GetActionURL()
			if link == "" {
				link = cta.GetNativeURL()
			}
			if link == "" {
				continue
			}
			if u, err := url.Parse(link); err == nil && u.Scheme == "messenger" && u.Host == "location_share" {
				lat, lon := u.Query().Get("lat"), u.Query().Get("long")
				att.Kind = "location"
				link = "https://www.openstreetmap.org/?mlat=" + lat + "&mlon=" + lon + "#map=16/" + lat + "/" + lon
			}
			att.Link = link
			break
		}
		if x.GetTargetType() == waArmadilloXMA.ExtendedContentMessage_FB_STORY_REPLY || x.GetTargetType() == waArmadilloXMA.ExtendedContentMessage_IG_STORY_REPLY {
			att.Kind = "story"
		}
		msg.Attachments = append(msg.Attachments, att)
		return x.GetMessageText()
	}
	if g := c.GetImageGalleryMessage(); g != nil {
		return fmt.Sprintf("[%d]", len(g.GetImages()))
	}
	return ""
}

// fetchLater returns a func that downloads encrypted media to the app's cache
// folder and shows it in the message.
func (e *Engine) fetchLater(msg *Message, att *Attachment, tr *waMediaTransport.WAMediaTransport, kind whatsmeow.MediaType) func() {
	return func() {
		e.mu.Lock()
		wa := e.e2ee
		e.mu.Unlock()
		if wa == nil || tr == nil {
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
		defer cancel()
		data, err := wa.DownloadFB(ctx, tr.GetIntegral(), kind)
		if err != nil {
			e.note("encrypted media: %v", err)
			return
		}
		dir := e.path("media")
		if err := os.MkdirAll(dir, 0o700); err != nil {
			return
		}
		name := filepath.Join(dir, safeName(msg.ID)+extFor(att.Mime, att.Name))
		if err := os.WriteFile(name, data, 0o600); err != nil {
			e.note("encrypted media save: %v", err)
			return
		}
		att.URL = "file://" + name
		att.PlayURL = att.URL
		e.addAttachment(msg, att)
	}
}

func (e *Engine) addAttachment(msg *Message, att *Attachment) {
	e.mu.Lock()
	msg.Attachments = append(msg.Attachments, att)
	e.mu.Unlock()
	e.emit(map[string]any{"type": "message", "message": msg})
}

func safeName(s string) string {
	return strings.Map(func(r rune) rune {
		if r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9' {
			return r
		}
		return '_'
	}, s)
}

func extFor(mime, name string) string {
	if ext := filepath.Ext(name); ext != "" && len(ext) <= 6 {
		return ext
	}
	switch {
	case strings.Contains(mime, "jpeg"):
		return ".jpg"
	case strings.Contains(mime, "png"):
		return ".png"
	case strings.Contains(mime, "webp"):
		return ".webp"
	case strings.Contains(mime, "gif"):
		return ".gif"
	case strings.Contains(mime, "mp4") && strings.HasPrefix(mime, "audio"):
		return ".m4a"
	case strings.Contains(mime, "mp4"):
		return ".mp4"
	case strings.Contains(mime, "ogg"):
		return ".ogg"
	case strings.Contains(mime, "mpeg"):
		return ".mp3"
	case strings.Contains(mime, "pdf"):
		return ".pdf"
	}
	return ".bin"
}

// ---- sending ----

// target is a listed chat as each protocol addresses it.
type target struct {
	cli   *messagix.Client
	wa    *whatsmeow.Client
	th    *Thread
	jid   waTypes.JID
	open  int64
	enc   bool
	group bool
}

func (e *Engine) targetOf(thread int64) (*target, error) {
	e.mu.Lock()
	defer e.mu.Unlock()
	if e.client == nil {
		return nil, errors.New("not started")
	}
	th := e.threads[thread]
	t := &target{cli: e.client, wa: e.e2ee, th: th, open: thread}
	if th != nil && th.Encrypted {
		k := thread
		if th.E2EEKey != 0 {
			k = th.E2EEKey
		}
		t.enc, t.group = true, th.Group
		t.jid = waTypes.JID{User: strconv.FormatInt(k, 10), Server: waTypes.MessengerServer}
		if th.Group {
			t.jid.Server = waTypes.GroupServer
		}
		if t.wa == nil {
			return nil, errors.New("encrypted chats are not connected yet")
		}
	} else if th != nil {
		t.group = th.Group
	}
	return t, nil
}

func newOTID() int64 {
	return time.Now().UnixMilli()<<22 | int64(time.Now().Nanosecond()&0x3fffff)
}

// sendWA sends an encrypted message (optionally as a reply) and remembers it.
func (e *Engine) sendWA(ctx context.Context, wa *whatsmeow.Client, jid waTypes.JID, msg *waConsumerApplication.ConsumerApplication, replyTo string, otid int64) (any, error) {
	meta := &waMsgApplication.MessageApplication_Metadata{}
	if replyTo != "" {
		e.mu.Lock()
		ref, ok := e.waRefs[replyTo]
		e.mu.Unlock()
		q := &waMsgApplication.MessageApplication_Metadata_QuotedMessage{StanzaID: proto.String(replyTo)}
		if ok {
			q.Participant = proto.String(ref.Sender.String())
		}
		meta.QuotedMessage = q
	}
	id := strconv.FormatInt(otid, 10)
	resp, err := wa.SendFBMessage(ctx, jid, msg, meta, whatsmeow.SendRequestExtra{ID: id})
	if err != nil {
		e.note("encrypted send to %s failed: %v", jid, err)
		return nil, err
	}
	e.note("encrypted sent to %s", jid)
	e.mu.Lock()
	e.waRefs[id] = waRef{Chat: jid, Sender: e.selfJID()}
	e.mu.Unlock()
	return map[string]any{"id": id, "ms": resp.Timestamp.UnixMilli()}, nil
}

// selfJID is the owner as a sender of encrypted messages. Caller holds mu.
func (e *Engine) selfJID() waTypes.JID {
	return waTypes.JID{User: strconv.FormatInt(e.selfID, 10), Server: waTypes.MessengerServer}
}

// waKey is the key an encrypted message is addressed by.
func (e *Engine) waKey(id string) (*waCommon.MessageKey, waRef, bool) {
	e.mu.Lock()
	ref, ok := e.waRefs[id]
	self := strconv.FormatInt(e.selfID, 10)
	e.mu.Unlock()
	if !ok {
		return nil, ref, false
	}
	key := &waCommon.MessageKey{RemoteJID: proto.String(ref.Chat.String()), ID: proto.String(id)}
	if ref.Sender.User == self {
		key.FromMe = proto.Bool(true)
	}
	if ref.Chat.Server != waTypes.MessengerServer && ref.Chat.Server != waTypes.DefaultUserServer {
		key.Participant = proto.String(ref.Sender.String())
	}
	return key, ref, true
}

func wrapContent(c *waConsumerApplication.ConsumerApplication_Content) *waConsumerApplication.ConsumerApplication {
	return &waConsumerApplication.ConsumerApplication{
		Payload: &waConsumerApplication.ConsumerApplication_Payload{
			Payload: &waConsumerApplication.ConsumerApplication_Payload_Content{Content: c},
		},
	}
}

func (e *Engine) react(id, emoji string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if key, ref, ok := e.waKey(id); ok {
		e.mu.Lock()
		wa := e.e2ee
		e.mu.Unlock()
		if wa == nil {
			return errors.New("encrypted chats are not connected yet")
		}
		msg := wrapContent(&waConsumerApplication.ConsumerApplication_Content{
			Content: &waConsumerApplication.ConsumerApplication_Content_ReactionMessage{
				ReactionMessage: &waConsumerApplication.ConsumerApplication_ReactionMessage{
					Key: key, Text: proto.String(emoji), SenderTimestampMS: proto.Int64(time.Now().UnixMilli()),
				},
			},
		})
		if _, err := wa.SendFBMessage(ctx, ref.Chat, msg, nil, whatsmeow.SendRequestExtra{ID: strconv.FormatInt(newOTID(), 10)}); err != nil {
			return err
		}
		e.mu.Lock()
		key := e.shownKeyOfChat(ref.Chat)
		e.mu.Unlock()
		e.emit(map[string]any{"type": "reaction", "thread": key, "id": id, "actor": e.selfID, "emoji": emoji, "mine": true})
		return nil
	}
	e.mu.Lock()
	cli, raw := e.client, e.rawThread[id]
	e.mu.Unlock()
	if cli == nil {
		return errors.New("not started")
	}
	if raw == 0 {
		return errors.New("message not found")
	}
	_, err := cli.ExecuteTasks(ctx, &socket.SendReactionTask{
		ThreadKey: raw, TimestampMs: time.Now().UnixMilli(), MessageID: id, ActorID: e.selfID,
		Reaction: emoji, SyncGroup: 1, SendAttribution: table.MESSENGER_INBOX_IN_THREAD,
	})
	return err
}

// shownKeyOfChat is the listed key of an encrypted chat. Caller holds mu.
func (e *Engine) shownKeyOfChat(j waTypes.JID) int64 {
	k, _ := strconv.ParseInt(j.User, 10, 64)
	return e.shownKey(k)
}

// unsend takes a message back for everyone.
func (e *Engine) unsend(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if key, ref, ok := e.waKey(id); ok {
		e.mu.Lock()
		wa := e.e2ee
		e.mu.Unlock()
		if wa == nil {
			return errors.New("encrypted chats are not connected yet")
		}
		msg := &waConsumerApplication.ConsumerApplication{
			Payload: &waConsumerApplication.ConsumerApplication_Payload{
				Payload: &waConsumerApplication.ConsumerApplication_Payload_ApplicationData{
					ApplicationData: &waConsumerApplication.ConsumerApplication_ApplicationData{
						ApplicationContent: &waConsumerApplication.ConsumerApplication_ApplicationData_Revoke{
							Revoke: &waConsumerApplication.ConsumerApplication_RevokeMessage{Key: key},
						},
					},
				},
			},
		}
		if _, err := wa.SendFBMessage(ctx, ref.Chat, msg, &waMsgApplication.MessageApplication_Metadata{},
			whatsmeow.SendRequestExtra{ID: strconv.FormatInt(newOTID(), 10)}); err != nil {
			return err
		}
		e.mu.Lock()
		k := e.shownKeyOfChat(ref.Chat)
		e.mu.Unlock()
		e.emit(map[string]any{"type": "deleted", "thread": k, "id": id})
		return nil
	}
	e.mu.Lock()
	cli, raw := e.client, e.rawThread[id]
	k := e.shownKey(raw)
	e.mu.Unlock()
	if cli == nil {
		return errors.New("not started")
	}
	if _, err := cli.ExecuteTasks(ctx, &socket.DeleteMessageTask{MessageId: id}); err != nil {
		return err
	}
	e.emit(map[string]any{"type": "deleted", "thread": k, "id": id})
	return nil
}

// edit changes the text of one of the owner's own messages, for everyone.
func (e *Engine) edit(id, text string) error {
	if strings.TrimSpace(text) == "" {
		return errors.New("empty text")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if key, ref, ok := e.waKey(id); ok {
		e.mu.Lock()
		wa := e.e2ee
		e.mu.Unlock()
		if wa == nil {
			return errors.New("encrypted chats are not connected yet")
		}
		msg := &waConsumerApplication.ConsumerApplication{
			Payload: &waConsumerApplication.ConsumerApplication_Payload{
				Payload: &waConsumerApplication.ConsumerApplication_Payload_Content{
					Content: &waConsumerApplication.ConsumerApplication_Content{
						Content: &waConsumerApplication.ConsumerApplication_Content_EditMessage{
							EditMessage: &waConsumerApplication.ConsumerApplication_EditMessage{
								Key:         key,
								Message:     &waCommon.MessageText{Text: proto.String(text)},
								TimestampMS: proto.Int64(time.Now().UnixMilli()),
							},
						},
					},
				},
			},
		}
		if _, err := wa.SendFBMessage(ctx, ref.Chat, msg, &waMsgApplication.MessageApplication_Metadata{},
			whatsmeow.SendRequestExtra{ID: strconv.FormatInt(newOTID(), 10)}); err != nil {
			return err
		}
		e.emit(map[string]any{"type": "edited", "id": id, "text": text})
		return nil
	}
	e.mu.Lock()
	cli := e.client
	e.mu.Unlock()
	if cli == nil {
		return errors.New("not started")
	}
	// Meta sometimes answers with the old text and confirms the edit a moment later; the
	// confirmation (or a real refusal) then arrives as an ordinary "edited" event.
	if _, err := cli.ExecuteTasks(ctx, &socket.EditMessageTask{MessageID: id, Text: text}); err != nil {
		return err
	}
	e.emit(map[string]any{"type": "edited", "id": id, "text": text})
	return nil
}

// deleteForMe removes a message from the owner's own view. For encrypted
// chats Meta keeps no copy on its side, so it is removed here only.
func (e *Engine) deleteForMe(id string) error {
	e.mu.Lock()
	cli, raw := e.client, e.rawThread[id]
	_, enc := e.waRefs[id]
	k := e.shownKey(raw)
	e.mu.Unlock()
	if !enc && raw != 0 {
		if cli == nil {
			return errors.New("not started")
		}
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		if _, err := cli.ExecuteTasks(ctx, &socket.DeleteMessageMeOnlyTask{ThreadKey: raw, MessageId: id}); err != nil {
			return err
		}
	}
	e.emit(map[string]any{"type": "deleted", "thread": k, "id": id, "forMe": true})
	return nil
}

// forward sends a message on to other chats: Meta's own forward between open
// chats, otherwise the same text and media again.
func (e *Engine) forward(id string, to []int64) (int, error) {
	e.mu.Lock()
	src := e.sent[id]
	_, enc := e.waRefs[id]
	e.mu.Unlock()
	if src == nil {
		return 0, errors.New("message not found")
	}
	done := 0
	var last error
	for _, dst := range to {
		t, err := e.targetOf(dst)
		if err != nil {
			last = err
			continue
		}
		if !enc && !t.enc {
			ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			otid := newOTID()
			_, err = e.runSend(ctx, t.cli, dst, otid, &socket.SendMessageTask{
				Otid: otid, Source: table.MESSENGER_INBOX_IN_THREAD, InitiatingSource: table.FACEBOOK_INBOX,
				SendType: table.FORWARD, SyncGroup: 1, ForwardedMsgId: id,
			})
			cancel()
		} else {
			err = e.resend(dst, src)
		}
		if err != nil {
			last = err
			continue
		}
		done++
	}
	if done == 0 && last != nil {
		return 0, last
	}
	return done, nil
}

// resend sends a message's text and its downloaded media to another chat.
func (e *Engine) resend(dst int64, src *Message) error {
	sentSomething := false
	for _, a := range src.Attachments {
		if !strings.HasPrefix(a.URL, "file://") {
			continue
		}
		if _, err := e.sendMedia(dst, mediaArgs{Path: strings.TrimPrefix(a.URL, "file://"), Mime: a.Mime, Name: a.Name,
			W: int(a.W), H: int(a.H), Voice: a.Title == "voice"}); err != nil {
			return err
		}
		sentSomething = true
	}
	text := src.Text
	if text == "" {
		for _, a := range src.Attachments {
			if a.Link != "" {
				text = a.Link
				break
			}
			if a.URL != "" && !strings.HasPrefix(a.URL, "file://") {
				text = a.URL
				break
			}
		}
	}
	if text != "" {
		_, err := e.sendText(dst, text, "")
		return err
	}
	if !sentSomething {
		return errors.New("nothing to forward")
	}
	return nil
}

type mediaArgs struct {
	Path, Thumb, Mime, Name, Caption, ReplyTo string
	Voice                                     bool
	// Sticker: an image sent as a sticker (encrypted chats; open chats get it as a picture).
	Sticker    bool
	DurationMs int64
	W, H       int
}

// sendMedia sends a photo, video, voice message or file from a local path.
func (e *Engine) sendMedia(thread int64, a mediaArgs) (any, error) {
	data, err := os.ReadFile(a.Path)
	if err != nil {
		return nil, err
	}
	if a.Name == "" {
		a.Name = filepath.Base(a.Path)
	}
	t, err := e.targetOf(thread)
	if err != nil {
		return nil, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()
	otid := newOTID()
	if !t.enc {
		resp, err := t.cli.GetHTTP().SendMercuryUploadRequest(ctx, e.openKeyOf(thread), &httpclient.MercuryUploadMedia{
			Filename: a.Name, MimeType: a.Mime, MediaData: data, IsVoiceClip: a.Voice,
		})
		if err != nil {
			return nil, err
		}
		fbid := resp.Payload.RealMetadata.GetFbId()
		if fbid == 0 {
			return nil, errors.New("upload got no id")
		}
		task := &socket.SendMessageTask{
			Otid: otid, Source: table.MESSENGER_INBOX_IN_THREAD, InitiatingSource: table.FACEBOOK_INBOX,
			SendType: table.MEDIA, SyncGroup: 1, AttachmentFBIds: []int64{fbid}, Text: a.Caption,
		}
		if a.ReplyTo != "" {
			task.ReplyMetaData = &socket.ReplyMetaData{ReplyMessageId: a.ReplyTo, ReplySourceType: 1}
		}
		return e.runSend(ctx, t.cli, thread, otid, task)
	}
	kind := whatsmeow.MediaDocument
	switch {
	case strings.HasPrefix(a.Mime, "image/") && a.Mime != "image/gif":
		kind = whatsmeow.MediaImage
	case strings.HasPrefix(a.Mime, "video/"):
		kind = whatsmeow.MediaVideo
	case strings.HasPrefix(a.Mime, "audio/"):
		kind = whatsmeow.MediaAudio
	}
	up, err := t.wa.Upload(ctx, data, kind)
	if err != nil {
		return nil, err
	}
	w, h := clamp400(a.W, a.H)
	if w == 0 && kind == whatsmeow.MediaImage {
		w, h = 400, 400
	}
	thumb := &waMediaTransport.WAMediaTransport_Ancillary_Thumbnail{
		ThumbnailWidth: proto.Uint32(uint32(w)), ThumbnailHeight: proto.Uint32(uint32(h)),
	}
	if a.Thumb != "" {
		if td, err := os.ReadFile(a.Thumb); err == nil {
			if tu, err := t.wa.Upload(ctx, td, whatsmeow.MediaImage); err == nil {
				thumb.DownloadableThumbnail = &waMediaTransport.WAMediaTransport_Ancillary_Thumbnail_DownloadableThumbnail{
					FileSHA256: tu.FileSHA256, FileEncSHA256: tu.FileEncSHA256, DirectPath: proto.String(tu.DirectPath),
					MediaKey: tu.MediaKey, MediaKeyTimestamp: proto.Int64(time.Now().Unix()), ObjectID: proto.String(tu.ObjectID),
				}
			}
		}
	}
	fileLength := proto.Uint64(uint64(len(data)))
	if kind == whatsmeow.MediaVideo {
		fileLength = nil
	}
	transport := &waMediaTransport.WAMediaTransport{
		Integral: &waMediaTransport.WAMediaTransport_Integral{
			FileSHA256: up.FileSHA256, MediaKey: up.MediaKey, FileEncSHA256: up.FileEncSHA256,
			DirectPath: proto.String(up.DirectPath), MediaKeyTimestamp: proto.Int64(time.Now().Unix()),
		},
		Ancillary: &waMediaTransport.WAMediaTransport_Ancillary{
			FileLength: fileLength, Mimetype: proto.String(a.Mime), Thumbnail: thumb, ObjectID: proto.String(up.ObjectID),
		},
	}
	caption := &waCommon.MessageText{Text: proto.String(a.Caption)}
	content := &waConsumerApplication.ConsumerApplication_Content{}
	switch {
	case kind == whatsmeow.MediaImage && a.Sticker:
		m := &waConsumerApplication.ConsumerApplication_StickerMessage{}
		err = m.Set(&waMediaTransport.StickerTransport{
			Integral:  &waMediaTransport.StickerTransport_Integral{Transport: transport},
			Ancillary: &waMediaTransport.StickerTransport_Ancillary{Width: proto.Uint32(uint32(a.W)), Height: proto.Uint32(uint32(a.H))},
		})
		content.Content = &waConsumerApplication.ConsumerApplication_Content_StickerMessage{StickerMessage: m}
	case kind == whatsmeow.MediaImage:
		m := &waConsumerApplication.ConsumerApplication_ImageMessage{Caption: caption}
		err = m.Set(&waMediaTransport.ImageTransport{
			Integral:  &waMediaTransport.ImageTransport_Integral{Transport: transport},
			Ancillary: &waMediaTransport.ImageTransport_Ancillary{Width: proto.Uint32(uint32(a.W)), Height: proto.Uint32(uint32(a.H))},
		})
		content.Content = &waConsumerApplication.ConsumerApplication_Content_ImageMessage{ImageMessage: m}
	case kind == whatsmeow.MediaVideo:
		m := &waConsumerApplication.ConsumerApplication_VideoMessage{Caption: caption}
		err = m.Set(&waMediaTransport.VideoTransport{
			Integral: &waMediaTransport.VideoTransport_Integral{Transport: transport},
			Ancillary: &waMediaTransport.VideoTransport_Ancillary{
				Width: proto.Uint32(uint32(a.W)), Height: proto.Uint32(uint32(a.H)),
				Seconds: proto.Uint32(uint32((a.DurationMs + 999) / 1000)), Caption: caption,
				Sidecar: up.StreamingSidecar, IsHd: proto.Bool(false), GifPlayback: proto.Bool(false),
			},
		})
		content.Content = &waConsumerApplication.ConsumerApplication_Content_VideoMessage{VideoMessage: m}
	case kind == whatsmeow.MediaAudio:
		m := &waConsumerApplication.ConsumerApplication_AudioMessage{PTT: proto.Bool(a.Voice)}
		err = m.Set(&waMediaTransport.AudioTransport{
			Integral:  &waMediaTransport.AudioTransport_Integral{Transport: transport},
			Ancillary: &waMediaTransport.AudioTransport_Ancillary{Seconds: proto.Uint32(uint32(a.DurationMs / 1000))},
		})
		content.Content = &waConsumerApplication.ConsumerApplication_Content_AudioMessage{AudioMessage: m}
	default:
		m := &waConsumerApplication.ConsumerApplication_DocumentMessage{FileName: proto.String(a.Name)}
		err = m.Set(&waMediaTransport.DocumentTransport{
			Integral:  &waMediaTransport.DocumentTransport_Integral{Transport: transport},
			Ancillary: &waMediaTransport.DocumentTransport_Ancillary{},
		})
		content.Content = &waConsumerApplication.ConsumerApplication_Content_DocumentMessage{DocumentMessage: m}
	}
	if err != nil {
		return nil, err
	}
	res, err := e.sendWA(ctx, t.wa, t.jid, wrapContent(content), a.ReplyTo, otid)
	if err == nil {
		att := &Attachment{Kind: "file", Mime: a.Mime, Name: a.Name, W: int64(a.W), H: int64(a.H)}
		switch {
		case kind == whatsmeow.MediaImage && a.Sticker:
			att.Kind = "sticker"
		case kind == whatsmeow.MediaImage:
			att.Kind = "image"
		case kind == whatsmeow.MediaVideo:
			att.Kind = "video"
		case kind == whatsmeow.MediaAudio:
			att.Kind = "audio"
			if a.Voice {
				att.Title = "voice"
			}
		}
		e.echoOwn(thread, res, a.Caption, a.ReplyTo, att, data)
	}
	return res, err
}

// echoOwn shows an encrypted message sent from this phone in its own chat:
// Meta does not send it back to the device that sent it. Media is kept as a
// local copy, so it can be opened and forwarded like a received one.
func (e *Engine) echoOwn(thread int64, res any, text, replyTo string, att *Attachment, data []byte) {
	r, ok := res.(map[string]any)
	if !ok {
		return
	}
	id, _ := r["id"].(string)
	ms, _ := r["ms"].(int64)
	if id == "" {
		return
	}
	e.mu.Lock()
	self := e.selfID
	e.mu.Unlock()
	msg := &Message{Thread: thread, ID: id, Sender: self, Text: text, Ms: ms, Mine: true, Encrypted: true}
	if replyTo != "" {
		msg.ReplyTo = e.quoteOf(replyTo, "")
	}
	if att != nil {
		dir := e.path("media")
		name := filepath.Join(dir, safeName(id)+extFor(att.Mime, att.Name))
		if os.MkdirAll(dir, 0o700) == nil && os.WriteFile(name, data, 0o600) == nil {
			att.URL = "file://" + name
			att.PlayURL = att.URL
			msg.Attachments = []*Attachment{att}
		} else {
			// No copy to show: say what was sent rather than leave an empty bubble.
			e.note("own media copy failed")
			if msg.Text == "" {
				msg.Text = "[" + att.Kind + "]"
				if att.Name != "" {
					msg.Text = att.Name
				}
			}
		}
	}
	e.mu.Lock()
	e.sent[id] = msg
	if th := e.threads[thread]; th != nil && ms >= th.LastMs {
		th.LastMs = ms
		if text != "" {
			th.Snippet = text
		}
		e.emit(map[string]any{"type": "thread", "thread": th})
	}
	e.mu.Unlock()
	e.emit(map[string]any{"type": "message", "message": msg})
}

func clamp400(w, h int) (int, int) {
	if w <= 0 || h <= 0 {
		return 0, 0
	}
	if w > h && w > 400 {
		return 400, h * 400 / w
	}
	if h > 400 {
		return w * 400 / h, 400
	}
	return w, h
}

// sendSticker sends again a sticker seen in a chat (open chats only: Meta
// gives no sticker packs to other clients).
func (e *Engine) sendSticker(thread, sticker int64) (any, error) {
	t, err := e.targetOf(thread)
	if err != nil {
		return nil, err
	}
	if t.enc {
		return nil, errors.New("stickers can be sent in open chats only")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	otid := newOTID()
	return e.runSend(ctx, t.cli, thread, otid, &socket.SendMessageTask{
		Otid: otid, Source: table.MESSENGER_INBOX_IN_THREAD, InitiatingSource: table.FACEBOOK_INBOX,
		SendType: table.STICKER, SyncGroup: 1, StickerId: sticker,
	})
}

// openTask runs one task on an open chat and takes its answer.
func (e *Engine) openTask(thread int64, task socket.Task) error {
	t, err := e.targetOf(thread)
	if err != nil {
		return err
	}
	if t.enc {
		return errors.New("Messenger offers this in open chats only")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	resp, err := t.cli.ExecuteTasks(ctx, task)
	if err != nil {
		return err
	}
	if resp != nil {
		e.mu.Lock()
		e.takeTable(resp)
		e.mu.Unlock()
	}
	return nil
}

// ---- read marks ----

func (e *Engine) markRead(thread int64) error {
	e.mu.Lock()
	cli, wa := e.client, e.e2ee
	th := e.threads[thread]
	var fbKeys []int64
	for fb, enc := range e.openOf {
		if enc == thread && fb != thread {
			fbKeys = append(fbKeys, fb)
		}
	}
	if th == nil || cli == nil {
		// Not connected yet (Erevos just started) or the chat not listed yet:
		// read here all the same, kept on disk, so what comes as it connects
		// does not make it unread again; Meta is told once connected.
		var last int64
		if th != nil {
			last = th.LastMs
			th.Unread = false
			e.emit(map[string]any{"type": "thread", "thread": th})
		}
		e.readHere(max(time.Now().UnixMilli(), last), append([]int64{thread}, fbKeys...)...)
		if e.pendingRead == nil {
			e.pendingRead = map[int64]bool{}
		}
		e.pendingRead[thread] = true
		e.mu.Unlock()
		return nil
	}
	delete(e.pendingRead, thread)
	ids := e.unreadWA[thread]
	delete(e.unreadWA, thread)
	refs := map[string]waRef{}
	for _, id := range ids {
		refs[id] = e.waRefs[id]
	}
	th.Unread = false
	// Read up to now, or its last message if the phone's clock is behind.
	e.readHere(max(time.Now().UnixMilli(), th.LastMs), append([]int64{thread}, fbKeys...)...)
	e.emit(map[string]any{"type": "thread", "thread": th})
	pureEnc := th.Encrypted && th.E2EEKey == th.Key
	e.mu.Unlock()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	now := time.Now()
	group := int64(1)
	if pureEnc {
		group = 95
	}
	if _, err := cli.ExecuteTasks(ctx, &socket.ThreadMarkReadTask{ThreadId: thread, LastReadWatermarkTs: now.UnixMilli(), SyncGroup: group}); err != nil {
		e.note("mark read %d: %v", thread, err)
	}
	for _, fb := range fbKeys {
		if _, err := cli.ExecuteTasks(ctx, &socket.ThreadMarkReadTask{ThreadId: fb, LastReadWatermarkTs: now.UnixMilli(), SyncGroup: 95}); err != nil {
			e.note("mark read %d: %v", fb, err)
		}
	}
	if wa != nil && len(ids) > 0 {
		type group struct {
			chat, sender waTypes.JID
			ids          []string
		}
		by := map[string]*group{}
		for id, r := range refs {
			if r.Chat.IsEmpty() {
				continue
			}
			sender := waTypes.EmptyJID
			if r.Chat.Server == waTypes.GroupServer {
				sender = r.Sender
			}
			k := r.Chat.String() + "|" + sender.String()
			if by[k] == nil {
				by[k] = &group{chat: r.Chat, sender: sender}
			}
			by[k].ids = append(by[k].ids, id)
		}
		for _, g := range by {
			if err := wa.MarkRead(ctx, g.ids, now, g.chat, g.sender); err != nil {
				e.note("mark read encrypted: %v", err)
			}
		}
	}
	return nil
}

func (e *Engine) markAllRead() (int, error) {
	e.mu.Lock()
	// Every chat, also those Meta sends later, read up to now.
	e.readHere(time.Now().UnixMilli(), allRead)
	var keys []int64
	for k, th := range e.threads {
		if th.Unread || len(e.unreadWA[k]) > 0 {
			keys = append(keys, k)
		}
	}
	e.mu.Unlock()
	for _, k := range keys {
		if err := e.markRead(k); err != nil {
			return 0, err
		}
	}
	return len(keys), nil
}

// ---- groups ----

func (e *Engine) memberList(thread int64) ([]Member, error) {
	t, err := e.targetOf(thread)
	if err != nil {
		return nil, err
	}
	out := []Member{}
	seen := map[int64]bool{}
	if t.enc && t.group {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		info, err := t.wa.GetGroupInfo(ctx, t.jid)
		cancel()
		if err != nil {
			e.note("group info: %v", err)
		} else {
			e.mu.Lock()
			if info.Name != "" {
				if th := e.threads[thread]; th != nil && th.Name != info.Name {
					th.Name = info.Name
					e.emit(map[string]any{"type": "thread", "thread": th})
				}
			}
			for _, p := range info.Participants {
				id, _ := strconv.ParseInt(p.JID.User, 10, 64)
				if id == 0 || seen[id] {
					continue
				}
				seen[id] = true
				out = append(out, Member{ID: id, Name: e.contacts[id], Admin: p.IsAdmin || p.IsSuperAdmin, Me: id == e.selfID})
			}
			e.mu.Unlock()
		}
	}
	e.mu.Lock()
	defer e.mu.Unlock()
	keys := []int64{thread}
	for fb, enc := range e.openOf {
		if enc == thread && fb != thread {
			keys = append(keys, fb)
		}
	}
	for _, k := range keys {
		for _, id := range e.members[k] {
			if seen[id] {
				continue
			}
			seen[id] = true
			out = append(out, Member{ID: id, Name: e.contacts[id], Admin: e.admins[k][id], Me: id == e.selfID})
		}
	}
	slices.SortFunc(out, func(a, b Member) int {
		if a.Admin != b.Admin {
			if a.Admin {
				return -1
			}
			return 1
		}
		return strings.Compare(strings.ToLower(a.Name), strings.ToLower(b.Name))
	})
	return out, nil
}

func (e *Engine) renameGroup(thread int64, title string) error {
	t, err := e.targetOf(thread)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if t.enc {
		err = t.wa.SetGroupName(ctx, t.jid, title)
	} else {
		_, err = t.cli.ExecuteTasks(ctx, &socket.RenameThreadTask{ThreadKey: thread, ThreadName: title, SyncGroup: 1})
	}
	if err != nil {
		return err
	}
	e.mu.Lock()
	if th := e.threads[thread]; th != nil {
		th.Name = title
		e.emit(map[string]any{"type": "thread", "thread": th})
	}
	e.mu.Unlock()
	return nil
}

func (e *Engine) changeMembers(thread int64, people []int64, action whatsmeow.ParticipantChange) error {
	if len(people) == 0 {
		return nil
	}
	t, err := e.targetOf(thread)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if t.enc {
		jids := make([]waTypes.JID, len(people))
		for i, p := range people {
			jids[i] = waTypes.NewJID(strconv.FormatInt(p, 10), waTypes.MessengerServer)
		}
		resp, err := t.wa.UpdateGroupParticipants(ctx, t.jid, jids, action)
		if err != nil {
			return err
		}
		for _, r := range resp {
			if r.Error != 0 {
				return fmt.Errorf("Meta refused the change (code %d)", r.Error)
			}
		}
	} else {
		var tasks []socket.Task
		switch action {
		case whatsmeow.ParticipantChangeAdd:
			tasks = append(tasks, &socket.AddParticipantsTask{ThreadKey: thread, ContactIDs: people, SyncGroup: 1})
		case whatsmeow.ParticipantChangeRemove:
			for _, p := range people {
				tasks = append(tasks, &socket.RemoveParticipantTask{ThreadID: thread, ContactID: p})
			}
		case whatsmeow.ParticipantChangePromote, whatsmeow.ParticipantChangeDemote:
			admin := 0
			if action == whatsmeow.ParticipantChangePromote {
				admin = 1
			}
			for _, p := range people {
				tasks = append(tasks, &socket.UpdateAdminTask{ThreadKey: thread, ContactID: p, IsAdmin: admin})
			}
		}
		resp, err := t.cli.ExecuteTasks(ctx, tasks...)
		if err != nil {
			return err
		}
		if resp != nil {
			e.mu.Lock()
			e.takeTable(resp)
			e.mu.Unlock()
		}
	}
	e.mu.Lock()
	switch action {
	case whatsmeow.ParticipantChangeRemove:
		for _, p := range people {
			list := e.members[thread]
			for i, id := range list {
				if id == p {
					e.members[thread] = append(list[:i:i], list[i+1:]...)
					break
				}
			}
		}
	case whatsmeow.ParticipantChangeAdd:
		e.members[thread] = append(e.members[thread], people...)
	case whatsmeow.ParticipantChangePromote, whatsmeow.ParticipantChangeDemote:
		if e.admins[thread] == nil {
			e.admins[thread] = map[int64]bool{}
		}
		for _, p := range people {
			e.admins[thread][p] = action == whatsmeow.ParticipantChangePromote
		}
	}
	e.mu.Unlock()
	e.emit(map[string]any{"type": "members", "thread": thread})
	return nil
}
