// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { File, Paths } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatTorSwitch } from './account-tor';
import { ipGate } from './ip-warning';
import { ChatScreen } from './chat-look';
import { KeyboardAwareScrollView } from './keyboard';
import { LinkedText } from './linked-text';
import { NetworkChatNotify, useNetworkChatShown } from './network-chat-notify';
import { MessageMenu, type MenuAction } from './message-menu';
import { Quote, Reactions } from './message-parts';
import { SessionCallButtons, SessionGroupButton } from './session-more';
import { MicButton, RecordingLine, useVoiceCapture } from './matrix-voice';
import { usePhotoQuality } from './network-carry';
import { XmppStickerSheet } from './xmpp-stickers';
import { Button, Input, OptionList, Row, Sheet, Text } from './ui';
import { ComposerPanel, IconButton } from './composer';
import { beforePanel, usePanelBack } from './panel-close';
import { CloseIcon, MoreIcon, OptionsIcon, PlusIcon } from './icons';
import { PhoneSign, ShortcutTile, VideoSign } from './shortcut-tile';
import { ask, confirm } from '../lib/alert';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { t } from '../lib/i18n';
import { SERVICE_NAMES, type MsgMessage, type MsgService } from '../lib/messenger';
import { accountThroughTor } from '../lib/account-tor';
import { messengerMedia, messengerMediaThroughTor, messengerNow, msgTorNow, msgDelete, msgNotifyOf, msgOpenChat, msgReact, msgReadChat, msgSetNotify, msgSend, msgSendFile, onMessengerChange, msgChatTor, msgSetChatTor, signalCallStart } from '../lib/messenger-store';
import { callPermissions } from '../lib/call-permissions';
import { SignalVideoView } from '../modules/erevos-messenger';
import { mimeOfName } from '../lib/matrix-media';
import { CAN_OPEN_FILE, openFileWith } from '../lib/open-with';
import { saveBytes } from '../lib/save-file';
import { pickFile, TooLargeError } from '../lib/pick-file';
import type { StickerToSend } from '../lib/sticker-send';
import { voiceNamed } from '../lib/group-media';
import { CAN_TAKE_PHOTOS, pickPhoto } from '../lib/pick-photo';
import { currentSpace } from '../lock/keys';
import { openOwnSticker, type OwnSticker, type StickerPlace } from '../lock/sticker-data';
import { space } from '../theme/colors';
import { softBubble } from '../theme/bubbles';
import { useTheme } from '../theme/context';

// A Messenger, Signal or Session chat (app/messenger-chat.tsx, app/signal-chat.tsx,
// app/session-chat.tsx), in the space's look: its messages as the engine gives them
// (lib/messenger-store.ts), with their photos, files, answers and reactions; a message held
// down can be answered, reacted to, copied, or deleted here or for everyone; text and files go.

/** Most a file sent may weigh: Messenger's and Signal's limit is about 100 MB, Session's 10 MB. */
const FILE_MOST: Record<MsgService, number> = { messenger: 100_000_000, signal: 100_000_000, session: 10_000_000 };

/** What each service is, said under the chat's name. */
function aboutOf(service: MsgService, encrypted: boolean): string {
  if (service === 'messenger') return encrypted ? t('Messenger · end-to-end encrypted, Meta knows who talks with whom') : t('Messenger · not end-to-end encrypted: Meta can read it');
  if (service === 'signal') return t('Signal · end-to-end encrypted, with phone numbers');
  return t('Session · end-to-end encrypted, no phone numbers, through onion routing');
}

/** A message in one line, for the menu and an answer's quote. */
function lineOf(m: Pick<MsgMessage, 'text' | 'attachments'>): string {
  if (m.text) return m.text;
  const a = m.attachments[0];
  if (!a) return '';
  if (a.kind === 'image') return t('Photo');
  if (a.kind === 'video') return t('Video');
  if (a.kind === 'audio') return a.title === 'voice' ? t('Voice message') : t('Audio');
  if (a.kind === 'sticker') return t('Sticker');
  return a.name || a.title || t('File');
}

export function MsgChatScreen({ service }: { service: MsgService }) {
  return (
    <ChatScreen chat={null} header>
      <MsgChat service={service} />
    </ChatScreen>
  );
}

function MsgChat({ service }: { service: MsgService }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { key: given } = useLocalSearchParams<{ key?: string }>();
  const key = typeof given === 'string' ? given : '';
  const [, setTick] = useState(0);
  useEffect(() => onMessengerChange(() => setTick((n) => n + 1)), []);
  // Until its messages are first asked for, an empty chat says it is loading, not that it has none.
  const [opening, setOpening] = useState(true);
  useEffect(() => {
    if (!key) return;
    setOpening(true);
    void msgOpenChat(service, key).finally(() => setOpening(false));
  }, [service, key]);
  // While it shows, what comes in it only sounds (lib/background.ts), and is read at once.
  const shown = useNetworkChatShown(key ? `${service}:${key}` : undefined);
  const state = messengerNow(service);
  const chat = state.threads[key];
  const unreadHere = !!chat?.unread;
  useEffect(() => {
    if (shown && key && unreadHere) void msgReadChat(service, key).catch(() => undefined);
  }, [shown, service, key, unreadHere]);
  const messages = state.messages[key] ?? [];
  const [draft, setDraft] = useState('');
  const [replyId, setReplyId] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // «+»: a file, or a sticker (the sheet below).
  const [more, setMore] = useState(false);
  const [adding, setAdding] = useState(false);
  usePanelBack(adding, () => setAdding(false));
  const [stickering, setStickering] = useState(false);
  const stickerPlace = useMemo<StickerPlace | null>(() => {
    try {
      return { holder: 'space', ...currentSpace() };
    } catch {
      return null;
    }
  }, []);
  const [note, setNote] = useState('');
  const scroll = useRef<{ scrollToEnd(o?: { animated?: boolean }): void } | null>(null);
  const count = messages.length;
  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: false });
  }, [count]);

  const fail = (e: unknown) => setNote(e instanceof Error ? e.message : String(e));
  const photos = usePhotoQuality();
  const voice = useVoiceCapture({ send: (audio) => sendVoice(audio), say: setNote });

  // «Through Tor» for this chat, which puts the whole account through Tor (one connection for all
  // its chats). For Messenger, first said that Meta may ask to confirm, or lock for a while, an
  // account that comes through Tor; stopped there, nothing changes and nothing goes.
  const chatTorOn = async () => {
    if (
      service === 'messenger' &&
      !msgChatTor(service, key) &&
      !(await confirm(t('Account through Tor'), t('The whole Messenger account then goes through Tor, not only this chat. Meta may ask to confirm, or lock for a while, an account that comes through Tor.')))
    )
      throw new Error(t('Not through Tor.'));
    await msgSetChatTor(service, key, true);
  };

  // Before what this chat sends goes without Tor: said once (lib/ip-warning.ts), with the account
  // through Tor (this chat's «Through Tor») as the way not to show the address.
  const sendGate = () =>
    accountThroughTor(msgTorNow(service), true)
      ? Promise.resolve(true)
      : ipGate({ network: SERVICE_NAMES[service], act: 'send', of: `${service}:${key}`, own: true }, { label: t('Account through Tor'), run: chatTorOn });

  /** Calls this chat's person on Signal, once the microphone (and the camera, for video) is allowed. */
  function startCall(video: boolean) {
    setNote('');
    void (async () => {
      if (!(await ipGate({ network: 'Signal', act: 'call', of: `signal:${key}` }))) return;
      if (!(await callPermissions(video))) throw new Error(video ? t('Allow the microphone and the camera for a video call.') : t('Allow the microphone to call.'));
      await signalCallStart(key, video);
    })().catch(fail);
  }
  const answered = replyId ? messages.find((m) => m.id === replyId) : undefined;
  const menuMessage = menuFor ? messages.find((m) => m.id === menuFor) : undefined;

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setNote('');
    try {
      if (!(await sendGate())) return;
      await msgSend(service, key, text, replyId ?? undefined);
      setDraft('');
      setReplyId(null);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  // The engines take a file on the phone: it waits in the cache until it went.
  async function sendBytes(bytes: Uint8Array, name: string, mime: string) {
    const file = new File(Paths.cache, `out-${Date.now()}-${name.replace(/[^\w.-]/g, '_')}`);
    file.create();
    file.writeSync(bytes);
    try {
      await msgSendFile(service, key, decodeURI(file.uri.replace(/^file:\/\//, '')), mime, name);
    } finally {
      file.delete();
    }
  }

  // A sticker, Erevos's own (drawn here) or one made from a photo: it goes as its picture, as a photo
  // goes, which every Messenger, Signal and Session app shows.
  async function sendSticker(picture: { bytes: Uint8Array; mime: string } | null) {
    setStickering(false);
    setNote('');
    try {
      if (!picture) throw new Error(t('This sticker\'s picture is gone.'));
      if (!(await sendGate())) return;
      setBusy(true);
      await sendBytes(picture.bytes, picture.mime === 'image/png' ? 'sticker.png' : 'sticker.jpg', picture.mime === 'image/png' ? 'image/png' : 'image/jpeg');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  // A photo from the phone's photos or its camera, in the quality chosen for photos (as in the other chats).
  // "+" opens and closes the panel under the field; open, the end of the chat comes into view.
  function openAdding(open: boolean) {
    if (open) beforePanel();
    setAdding(open);
    if (open) setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  }

  async function sendPhoto(from: 'photos' | 'camera') {
    setAdding(false);
    setNote('');
    try {
      if (!(await sendGate())) return;
      const photo = await pickPhoto(from, photos.quality);
      if (!photo) return;
      setBusy(true);
      await sendBytes(photo.bytes, photo.name, photo.mime);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  // A voice message: held on the microphone, sent when let go (components/matrix-voice.tsx), as a sound file.
  async function sendVoice(audio: Uint8Array) {
    setNote('');
    try {
      if (!(await sendGate())) return;
      setBusy(true);
      const { name, mime } = voiceNamed(audio);
      await sendBytes(audio, name, mime);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function sendFile() {
    setAdding(false);
    setNote('');
    try {
      if (!(await sendGate())) return;
      const picked = await pickFile(FILE_MOST[service]);
      if (!picked) return;
      setBusy(true);
      await sendBytes(picked.bytes, picked.name, mimeOfName(picked.name));
    } catch (e) {
      fail(e instanceof TooLargeError ? new Error(t('That file is too large for {service}.', { service: SERVICE_NAMES[service] })) : e);
    } finally {
      setBusy(false);
    }
  }

  function remove(m: MsgMessage) {
    const choices = m.mine
      ? [
          { text: t('Delete for everyone'), style: 'destructive' as const, onPress: () => void msgDelete(service, m.id, true).catch(fail) },
          { text: t('Delete for me'), onPress: () => void msgDelete(service, m.id, false).catch(fail) },
        ]
      : [{ text: t('Delete for me'), style: 'destructive' as const, onPress: () => void msgDelete(service, m.id, false).catch(fail) }];
    ask(t('Delete this message?'), '', [{ text: t('Cancel'), style: 'cancel' }, ...choices]);
  }

  const actions = (m: MsgMessage): MenuAction[] => [
    { title: t('Reply'), onPress: () => setReplyId(m.id) },
    ...(CAN_COPY && m.text ? [{ title: t('Copy'), onPress: () => void copyText(m.text) }] : []),
    { title: t('Delete'), danger: true, onPress: () => remove(m) },
  ];

  // A chat not on the list yet (opened from Facebook, or a person just tapped) shows at once, and
  // its messages come as they are asked for.
  if (!key || !state.signedIn) {
    return (
      <View style={{ flex: 1, padding: space.xl, gap: space.md, backgroundColor: colors.ground }}>
        <Text tone="muted">{key ? t('Not signed in to {service} on this phone.', { service: SERVICE_NAMES[service] }) : t('This chat is not here yet.')}</Text>
        <Button title={t('Open {service}', { service: SERVICE_NAMES[service] })} kind="secondary" compact onPress={() => router.push(`/${service}`)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* The bar at the top stays while the chat scrolls, as in Erevos's own chats and Telegram's. */}
      <View style={{ backgroundColor: colors.ground }}>
        <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: space.xl - 4, paddingTop: space.sm, paddingBottom: space.xs, gap: space.xs }}>
          <Row>
            <Text variant="title" numberOfLines={2} style={{ flex: 1 }}>
              {chat?.name || SERVICE_NAMES[service]}
            </Text>
            {/* Signal's 1:1 calls (components/signal-call.tsx), where this build has them. */}
            {service === 'signal' && chat && !chat.group && SignalVideoView ? (
              <>
                <ShortcutTile label={t('Video call')} tint="blue" onPress={() => startCall(true)}>
                  <VideoSign />
                </ShortcutTile>
                <ShortcutTile label={t('Voice call')} tint="green" onPress={() => startCall(false)}>
                  <PhoneSign />
                </ShortcutTile>
              </>
            ) : null}
            {/* The chat's options (notifications, «Through Tor»), also beside the field (#54). */}
            {key ? (
              <IconButton label={t('Chat options')} onPress={() => setMore(true)}>
                <MoreIcon color={colors.text} />
              </IconButton>
            ) : null}
          </Row>
          <Text variant="caption" tone="muted">
            {aboutOf(service, chat?.encrypted ?? service !== 'messenger')}
          </Text>
          {service === 'session' && chat ? (
            chat.group ? (
              <SessionGroupButton chatKey={key} title={chat.name || SERVICE_NAMES.session} onLeft={() => router.back()} />
            ) : (
              <SessionCallButtons chatKey={key} name={chat.name} onError={fail} />
            )
          ) : null}
        </View>
      </View>
      <KeyboardAwareScrollView
        ref={scroll as never}
        style={{ flex: 1, backgroundColor: colors.ground }}
        contentContainerStyle={{ flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: space.xl - 4, paddingBottom: insets.bottom + space.xl, gap: space.md }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={space.xl}
      >
        {messages.length === 0 ? (
          <Text variant="caption" tone="faint">
            {opening ? t('Loading…') : t('No messages here yet.')}
          </Text>
        ) : null}
        <View style={{ gap: space.md }}>
          {messages.map((m) => (
            <Bubble key={m.id} service={service} message={m} group={!!chat?.group} quoted={m.replyTo ? (messages.find((x) => x.id === m.replyTo!.id) ?? null) : null} onMenu={() => setMenuFor(m.id)} onSign={(sign) => void msgReact(service, m.id, sign).catch(fail)} />
          ))}
        </View>
        {/* A short chat keeps the field at the bottom of the screen, not under its last message (#61). */}
        <View style={{ flexGrow: 1, marginTop: -space.md }} />
        {answered ? <Quote name={answered.mine ? t('You') : answered.name} line={lineOf(answered)} onClose={() => setReplyId(null)} /> : null}
        {note ? (
          <Text variant="caption" color={colors.danger}>
            {note}
          </Text>
        ) : null}
        <Row>
          {voice.recording ? (
            <View style={{ flex: 1 }}>
              <RecordingLine />
            </View>
          ) : (
            <>
              <IconButton label={adding ? t('Close') : t('Attach and more')} onPress={() => openAdding(!adding)} state={{ expanded: adding }} disabled={busy}>
                {adding ? <CloseIcon color={colors.text} size={20} /> : <PlusIcon color={colors.text} size={20} />}
              </IconButton>
              <Input style={{ flex: 1 }} value={draft} onChangeText={setDraft} onFocus={() => setAdding(false)} placeholder={t('Message')} multiline />
            </>
          )}
          {/* The chat's options, beside the field, where a long chat keeps them in reach (#54, as #44). */}
          {key ? (
            <IconButton label={t('Chat options')} onPress={() => setMore(true)}>
              <OptionsIcon color={colors.text} size={22} />
            </IconButton>
          ) : null}
          {draft.trim() && !voice.recording ? (
            <Button title={t('Send')} compact disabled={busy} loading={busy} onPress={() => void send()} />
          ) : (
            <MicButton voice={voice} disabled={busy} />
          )}
        </Row>
        {/* What "+" opens under the field, as in Erevos's own chats (#59). */}
        {adding && !voice.recording ? (
          <ComposerPanel
            encrypted={chat?.encrypted ?? service !== 'messenger'}
            quality={{ value: photos.quality, onChange: photos.choose }}
            tiles={[
              { key: 'photo', title: t('Photo'), icon: 'photo', onPress: () => void sendPhoto('photos') },
              ...(CAN_TAKE_PHOTOS ? [{ key: 'camera', title: t('Camera'), icon: 'camera' as const, onPress: () => void sendPhoto('camera') }] : []),
              { key: 'file', title: t('File'), icon: 'file', onPress: () => void sendFile() },
              ...(stickerPlace
                ? [
                    {
                      key: 'sticker',
                      title: t('Sticker'),
                      icon: 'sticker' as const,
                      onPress: () => {
                        setAdding(false);
                        setStickering(true);
                      },
                    },
                  ]
                : []),
            ]}
          />
        ) : null}
      </KeyboardAwareScrollView>
      <Sheet visible={more} onClose={() => setMore(false)} title={t('Chat options')}>
        <View style={{ gap: space.md }}>
          {/* Its own notifications, muted or with a sound of its own (lock/msg-own-data.ts). */}
          {key ? (
            <OptionList title={t('This chat')}>
              <NetworkChatNotify notify={msgNotifyOf(service, key)} calls={service !== 'messenger' && !chat?.group} onChange={(next) => msgSetNotify(service, key, next)} />
            </OptionList>
          ) : null}
          {/* «Through Tor»: each service has one connection for all its chats, so it takes the whole account (lib/account-tor.ts). */}
          {key ? <ChatTorSwitch network={SERVICE_NAMES[service]} on={msgChatTor(service, key)} onChange={(on) => void (on ? chatTorOn() : msgSetChatTor(service, key, false)).catch(fail)} /> : null}
        </View>
      </Sheet>
      <XmppStickerSheet
        visible={stickering}
        onClose={() => setStickering(false)}
        place={stickerPlace}
        onPick={(sticker: OwnSticker) => void openOwnSticker(sticker).then((bytes) => sendSticker(bytes ? { bytes, mime: bytes[0] === 0x89 ? 'image/png' : 'image/jpeg' } : null), fail)}
        onBuiltIn={(sticker: StickerToSend) => void sendSticker(sticker)}
      />
      <MessageMenu
        visible={!!menuMessage}
        onClose={() => setMenuFor(null)}
        line={menuMessage ? lineOf(menuMessage) : ''}
        reaction={menuMessage ? Object.entries(menuMessage.reactions).find(([who]) => who === 'me')?.[1] : undefined}
        onReact={menuMessage ? (emoji) => void msgReact(service, menuMessage.id, emoji).catch(fail) : undefined}
        actions={menuMessage ? actions(menuMessage) : []}
      />
    </View>
  );
}

// Where a Messenger picture or file fetched through Tor is kept on the phone, by its link.
function torCacheOf(url: string): File {
  let h = 0x811c9dc5;
  for (let i = 0; i < url.length; i++) h = Math.imul(h ^ url.charCodeAt(i), 0x01000193) >>> 0;
  return new File(Paths.cache, `erevos-msg-tor-${h.toString(16)}-${url.length.toString(16)}`);
}

async function throughEngine(url: string): Promise<File> {
  const file = torCacheOf(url);
  if (!file.exists) await messengerMedia(url, decodeURIComponent(file.uri.replace(/^file:\/\//, '')));
  return file;
}

/**
 * A picture of a chat: straight from its link, or, while Messenger goes through Tor, fetched by
 * its engine the same way (lib/messenger-store.ts messengerMedia), never by the app straight.
 */
function MsgImage({ service, url, label, height }: { service: MsgService; url: string; label: string; height: number }) {
  const viaEngine = service === 'messenger' && messengerMediaThroughTor();
  const [uri, setUri] = useState<string | null>(viaEngine ? null : url);
  useEffect(() => {
    if (!viaEngine) {
      setUri(url);
      return;
    }
    let on = true;
    setUri(null);
    throughEngine(url).then(
      (file) => on && setUri(file.uri),
      () => undefined,
    );
    return () => {
      on = false;
    };
  }, [url, viaEngine]);
  if (!uri) {
    return (
      <View style={{ width: 220, height, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="caption" tone="muted">
          {t('Through Tor…')}
        </Text>
      </View>
    );
  }
  return <Image source={{ uri }} accessibilityLabel={label} style={{ width: 220, height, borderRadius: 8 }} resizeMode="cover" />;
}

// A file of a chat: a link someone shared opens as it is; a file is handed to the app the phone
// opens its kind with (a PDF reader), from memory (lib/open-with.ts): read where the engine keeps
// it (Signal, Session), or fetched, while Messenger goes through Tor by its engine. Where that
// cannot be, it is saved on the phone or opened from its link, as before.
async function openAttachment(service: MsgService, a: { url: string; link: string; name: string; title: string; mime: string }): Promise<void> {
  const name = a.name || a.title || 'file';
  if (a.link || !a.url) {
    if (a.link || a.url) await Linking.openURL(a.link || a.url);
    return;
  }
  const viaEngine = service === 'messenger' && messengerMediaThroughTor();
  const bytes = async (): Promise<Uint8Array> => {
    if (a.url.startsWith('file://')) return new File(a.url).bytes();
    if (viaEngine) return (await throughEngine(a.url)).bytes();
    const answer = await fetch(a.url);
    if (!answer.ok) throw new Error(t('The file could not be fetched.'));
    return new Uint8Array(await answer.arrayBuffer());
  };
  if (CAN_OPEN_FILE) {
    await openFileWith(name, a.mime, await bytes());
    return;
  }
  if (viaEngine || a.url.startsWith('file://')) {
    await saveBytes(name, a.mime, await bytes());
    return;
  }
  await Linking.openURL(a.url);
}

function Bubble({ service, message, group, quoted, onMenu, onSign }: { service: MsgService; message: MsgMessage; group: boolean; quoted: MsgMessage | null; onMenu: () => void; onSign: (sign: string) => void }) {
  const { colors, look } = useTheme();
  const mine = message.mine;
  const signs = Object.values(message.reactions);
  return (
    <Pressable onLongPress={onMenu} delayLongPress={300} accessibilityRole="text" accessibilityHint={t('Hold for more')}>
      <View style={[{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: space.sm + 2, gap: 4 }, softBubble(look.bubbles, colors, mine)]}>
        {group && !mine && message.name ? (
          <Text variant="caption" tone="muted">
            {message.name}
          </Text>
        ) : null}
        {message.replyTo ? <Quote name={message.replyTo.name || (quoted?.mine ? t('You') : '')} line={quoted ? lineOf(quoted) : message.replyTo.text} /> : null}
        {message.forwarded ? (
          <Text variant="caption" tone="faint">
            {t('Forwarded')}
          </Text>
        ) : null}
        {message.attachments.map((a, i) =>
          (a.kind === 'image' || a.kind === 'sticker') && a.url ? (
            <MsgImage key={i} service={service} url={a.url} label={a.kind === 'sticker' ? t('Sticker') : t('Photo')} height={a.w && a.h ? Math.min(320, (220 * a.h) / a.w) : 220} />
          ) : (
            <Pressable key={i} onPress={() => void openAttachment(service, a).catch((error: unknown) => ask(t('Open'), error instanceof Error ? error.message : String(error), [{ text: t('OK') }]))} accessibilityRole="link">
              <Text variant="label">{a.title && a.title !== 'voice' ? a.title : lineOf({ text: '', attachments: [a] })}</Text>
            </Pressable>
          ),
        )}
        {message.text ? (
          // In a Text: plain words with no link come back bare, and bare words outside a Text never show.
          <Text>
            <LinkedText text={message.text} />
          </Text>
        ) : null}
        <Text variant="caption" tone="faint">
          {new Date(message.ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {message.edited ? ` · ${t('edited')}` : ''}
        </Text>
      </View>
      {signs.length ? <Reactions signs={signs} mineSide={mine} onSign={onSign} /> : null}
    </Pressable>
  );
}
