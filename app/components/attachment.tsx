// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, PanResponder, Platform, Pressable, StyleSheet, View, type ImageStyle, type StyleProp, type TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fileSize, readFile } from '../lib/attachments';
import { t } from '../lib/i18n';
import { photoUri, releaseUri } from '../lib/photo-uri';
import { CAN_OPEN_FILE, openFileWith } from '../lib/open-with';
import { onceLine } from '../lib/see-once';
import { keepPrivate } from '../lib/screen-privacy';
import { doubleTapped, fitted, kept, moved, pinched, WHOLE, type Look, type Point, type Size } from '../lib/photo-zoom';
import { CAN_CHOOSE_FOLDER } from '../lib/save-file';
import { device } from '../modules/erevos-device';
import type { FileRef } from '../lock/attachment-files';
import { radius, space, withAlpha, type Colors } from '../theme/colors';
import { useColors, useStyles } from '../theme/context';
import { Button, Row, Text } from './ui';

// Photos and files in a thread, a contact's (app/chat.tsx) or a group's (components/group-chat.tsx): each in
// its bubble, and the one looked at on its own, to save. They are sent from the panel under the
// message bar (components/composer.tsx). A photo is read into memory to show, never written out
// unsealed, and let go of once it no longer shows. A photo in a Matrix, XMPP or Nostr chat opens in
// the same viewer (OpenPhoto).

/** Photos shown in the thread at once, the latest: each is held whole in memory while shown. The
 *  others show when tapped. A computer has the memory for all of them. */
export const SHOWN_PHOTOS = Platform.OS === 'web' ? 200 : 6;

/** Stickers made from photos shown at once, the latest: they are small, so many more than photos. */
export const SHOWN_STICKERS = Platform.OS === 'web' ? 200 : 40;

/** Of a thread's files, oldest first, the photos here to show: the latest photos, and the latest stickers. */
export function shownOf(files: FileRef[]): FileRef[] {
  // A photo to see once is read only when opened (lib/see-once.ts).
  const here = files.filter((file) => file.kind === 'photo' && !file.from && !file.once);
  return [...here.filter((file) => !file.sticker).slice(-SHOWN_PHOTOS), ...here.filter((file) => file.sticker).slice(-SHOWN_STICKERS)];
}

/** How far a file that is not here yet has come: `state` is how far it is ('40%'), or 'failed' or
 *  'gone' if it did not come. Null once it is here. */
export function comingText(file: FileRef, state?: string): string | null {
  return !file.from
    ? null
    : state === 'stranger'
      ? t('Waits until you accept the request')
      : state === 'gone'
      ? t('No longer on the relay')
      : state === 'failed'
        ? t('Did not come · tap to try again')
        : state
          ? t('Coming, {progress}', { progress: state })
          : t('Tap to take it, {size}', { size: fileSize(file.size) });
}

// A photo or file in the thread: the photo itself once it is here and shown, otherwise what it
// is and how far it has come.
export function Attachment({ file, uri, state, ink, mine }: { file: FileRef; uri?: string; state?: string; ink: StyleProp<TextStyle>; mine?: boolean }) {
  const colors = useColors();
  const status = comingText(file, state);
  if (file.kind === 'photo') {
    const width = 240;
    const height = Math.round(Math.min(320, Math.max(120, file.w && file.h ? (width * file.h) / file.w : 180)));
    // To see once: never drawn in the chat, even blurred (lib/see-once.ts).
    if (file.once)
      return (
        <View style={{ width: 200, borderRadius: radius.md, backgroundColor: withAlpha(colors.text, 0.08), alignItems: 'center', justifyContent: 'center', padding: space.md, gap: 2 }}>
          <Text style={[ink, { fontWeight: '600', textAlign: 'center' }]}>{onceLine(!!mine, false)}</Text>
          {status ? <Text style={[ink, { fontSize: 13, opacity: 0.8, textAlign: 'center' }]}>{status}</Text> : null}
        </View>
      );
    // Hidden till tapped: blurred, and whole only once opened on its own.
    if (uri && file.hidden)
      return (
        <View style={{ width, height, borderRadius: radius.md, overflow: 'hidden' }}>
          <Image source={{ uri }} style={{ width, height }} resizeMode="cover" resizeMethod="resize" blurRadius={40} accessibilityLabel={t('Hidden photo · tap to see it')} />
          <View style={{ ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '600', textAlign: 'center', padding: space.sm }}>{t('Hidden photo · tap to see it')}</Text>
          </View>
        </View>
      );
    return uri ? (
      <Image source={{ uri }} style={{ width, height, borderRadius: radius.md }} resizeMode="cover" resizeMethod="resize" accessibilityLabel={t('Photo')} />
    ) : (
      <View style={{ width, height, borderRadius: radius.md, backgroundColor: withAlpha(colors.text, 0.08), alignItems: 'center', justifyContent: 'center', padding: space.md }}>
        <Text style={[ink, { textAlign: 'center' }]}>{status ?? t('Photo · tap to see it')}</Text>
      </View>
    );
  }
  return (
    <View style={{ gap: 2, minWidth: 160 }}>
      <Text style={[ink, { fontWeight: '600' }]} numberOfLines={2}>
        {file.name}
      </Text>
      <Text style={[ink, { fontSize: 13, opacity: 0.8 }]}>{status ?? t('{size} · tap to save', { size: fileSize(file.size) })}</Text>
    </View>
  );
}

/**
 * The photos shown, by file id, as addresses an Image can show (lib/photo-uri.ts): each of `files`
 * here is read into memory, and let go of once it is no longer one of them, or the screen closes.
 * One not here yet, as a file of chats shared that still comes (lib/share-rounds.ts), is read again
 * each time `again` changes.
 */
export function useShownPhotos(files: FileRef[], onError: (error: unknown) => void, again = 0): Record<string, string> {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const loading = useRef(new Set<string>());
  // A file still coming has the id it will have once here: it is read then.
  const shownKey = files.map((file) => (file.from ? `${file.id}~` : file.id)).join(',');
  useEffect(() => {
    const wanted = new Set(files.map((file) => file.id));
    for (const ref of files) {
      if (ref.from || photosRef.current[ref.id] || loading.current.has(ref.id)) continue;
      loading.current.add(ref.id);
      readFile(ref)
        .then((bytes) => {
          if (bytes) setPhotos((now) => ({ ...now, [ref.id]: photoUri(bytes, ref.mime) }));
        })
        .catch(onError)
        .finally(() => loading.current.delete(ref.id));
    }
    setPhotos((now) => {
      const gone = Object.keys(now).filter((id) => !wanted.has(id));
      if (gone.length === 0) return now;
      const kept = { ...now };
      for (const id of gone) {
        releaseUri(kept[id]);
        delete kept[id];
      }
      return kept;
    });
  }, [shownKey, again]);
  // Photos held in memory go when the screen closes.
  useEffect(
    () => () => {
      for (const uri of Object.values(photosRef.current)) releaseUri(uri);
    },
    [],
  );
  return photos;
}

/** Opens a chat's file with the app the phone offers for its kind (a PDF reader), from memory (lib/open-with.ts). */
export async function openRefWith(ref: FileRef): Promise<void> {
  const bytes = await readFile(ref);
  if (!bytes) throw new Error(t('The file could not be fetched.'));
  await openFileWith(ref.name, ref.mime, bytes);
}

/** What FileViewer reads of a file: a photo of another network's chat is shown without a FileRef. */
export type ViewedFile = Pick<FileRef, 'id' | 'kind' | 'name' | 'size' | 'w' | 'h'>;

/**
 * A photo (`uri` once it is read) or file shown on its own, with how big it is, to save; none while
 * `file` is null. A photo fills the screen, turned as the phone is, even with its auto-rotate off:
 * two fingers or a double tap zoom in, one finger moves it while zoomed, and a tap hides or shows
 * what is around it.
 */
export function FileViewer({ file, uri, onSave, onOpen, onClose, once = false }: { file: ViewedFile | null; uri?: string; onSave: (choose: boolean) => void; onOpen?: () => Promise<void>; onClose: () => void; once?: boolean }) {
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [bars, setBars] = useState(true);
  const [note, setNote] = useState('');
  const id = file?.id;
  useEffect(() => {
    setBars(true);
    setNote('');
  }, [id]);
  // A photo to see once (lib/see-once.ts): kept from screenshots while it shows, where the phone allows.
  const seeingOnce = once && file !== null;
  useEffect(() => {
    if (!seeingOnce) return;
    keepPrivate('once', true);
    return () => keepPrivate('once', false);
  }, [seeingOnce]);
  // A photo shown turns with the phone, its auto-rotate on or off; the rest of Erevos follows the setting.
  const photo = file?.kind === 'photo';
  useEffect(() => {
    if (!photo) return;
    device?.turnWithPhone?.(true);
    return () => {
      device?.turnWithPhone?.(false);
    };
  }, [photo]);
  const tools = once ? (
    <Row wrap style={styles.viewerTools}>
      <Button title={t('Close')} kind="secondary" compact onPress={onClose} />
    </Row>
  ) : (
    <Row wrap style={styles.viewerTools}>
      {onOpen && CAN_OPEN_FILE && file?.kind !== 'photo' ? (
        <Button title={t('Open')} compact onPress={() => void onOpen().catch((error: unknown) => setNote(error instanceof Error ? error.message : String(error)))} />
      ) : null}
      <Button title={t('Save')} compact onPress={() => onSave(false)} />
      {CAN_CHOOSE_FOLDER ? <Button title={t('Save in another folder')} kind="secondary" compact onPress={() => onSave(true)} /> : null}
      <Button title={t('Close')} kind="secondary" compact onPress={onClose} />
    </Row>
  );
  return (
    <Modal
      visible={file !== null}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
      supportedOrientations={['portrait', 'landscape-left', 'landscape-right']}
    >
      {file?.kind === 'photo' ? (
        <View style={styles.photoViewer}>
          {uri ? (
            <ZoomPhoto key={file.id} uri={uri} w={file.w} h={file.h} onTap={() => setBars((shown) => !shown)} />
          ) : (
            <Text color="#FFFFFF" style={styles.opening}>
              {t('Opening the photo…')}
            </Text>
          )}
          {bars ? (
            <View
              style={[
                styles.photoBar,
                { paddingBottom: Math.max(space.lg, insets.bottom), paddingLeft: Math.max(space.lg, insets.left), paddingRight: Math.max(space.lg, insets.right) },
              ]}
            >
              <Text tone="muted" style={styles.centered}>
                {once ? t('To see once: it goes from this phone when you close it.') : `${file.w && file.h ? `${file.w} × ${file.h} · ` : ''}${fileSize(file.size)}`}
              </Text>
              {tools}
            </View>
          ) : null}
        </View>
      ) : file ? (
        <View style={[styles.viewer, { paddingTop: Math.max(space.lg, insets.top), paddingBottom: Math.max(space.lg, insets.bottom) }]}>
          <View style={styles.viewerFile}>
            <Text variant="heading">{file.name}</Text>
            <Text tone="muted">{fileSize(file.size)}</Text>
            {note ? <Text tone="muted">{note}</Text> : null}
          </View>
          {tools}
        </View>
      ) : null}
    </Modal>
  );
}

/**
 * A photo of a Matrix, XMPP or Nostr chat, held in memory as a `data:` address (`uri`): tapped, it
 * opens on the whole screen in FileViewer, to zoom, turn with the phone and save. `w` × `h` are
 * what the network said of its size; without them they are read from the photo as it opens.
 * `onSave` is the chat's own way of saving it: true once it is done, saved or not, which closes the
 * photo, false if the owner went back. `onMenu`: held down, the message's menu.
 */
export function OpenPhoto({ uri, name, size, w, h, style, onSave, onMenu }: {
  uri: string;
  name: string;
  size: number;
  w?: number;
  h?: number;
  style: StyleProp<ImageStyle>;
  onSave: (choose: boolean) => Promise<boolean>;
  onMenu?: () => void;
}) {
  const [open, setOpen] = useState(false);
  // Read from the photo when the network gave no size; zeros if it could not be read.
  const [read, setRead] = useState<Size | null>(null);
  const known = w && h ? { width: w, height: h } : read;
  function show() {
    setOpen(true);
    if (!known) Image.getSize(uri, (width, height) => setRead({ width, height }), () => setRead({ width: 0, height: 0 }));
  }
  return (
    <>
      <Pressable onPress={show} onLongPress={onMenu} accessibilityRole="button" accessibilityLabel={name} style={{ alignSelf: 'flex-start' }}>
        <Image source={{ uri }} style={style} resizeMode="contain" />
      </Pressable>
      <FileViewer
        file={open ? { id: name, kind: 'photo', name, size, w: known?.width || undefined, h: known?.height || undefined } : null}
        // It opens once its size is known: the zoom keeps the photo to its edges.
        uri={known ? uri : undefined}
        onSave={(choose) => void onSave(choose).then((done) => done && setOpen(false))}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** Two taps this close together, in ms, are a double tap. */
const DOUBLE_TAP = 260;
/** A touch that moves less than this, in points, is a tap. */
const TAP_SLOP = 10;

// Decoded at twice the size it shows (Android's resizeMultiplier, which React Native's types leave out).
const ZOOM_ROOM = { resizeMultiplier: 2 } as object;

type Touch = { pageX: number; pageY: number };

// How far a finger goes sideways for a swipe to the next photo.
const SWIPE = 60;

// A photo filling where it is, zoomed and moved by touch (lib/photo-zoom.ts). It is decoded no
// bigger than about twice the screen (resizeMethod "resize"), so a 50-megapixel photo opens as a
// small one does, still sharp when zoomed in.
// `onSwipe`: a quick sideways stroke of one finger on the whole photo, not zoomed in, goes to the
// photo after it (1) or before it (-1), as where photos are swiped between (the Collection).
export function ZoomPhoto({ uri, w, h, onTap, onSwipe, onError }: { uri: string; w?: number; h?: number; onTap: () => void; onSwipe?: (by: 1 | -1) => void; onError?: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const look = useRef<Look>(WHOLE);
  const room = useRef<Size>({ width: 0, height: 0 });
  // Where the touches began, as the look was then: begun again when a finger comes or goes.
  const start = useRef<{ look: Look; touches: Touch[]; moved: boolean } | null>(null);
  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapRef = useRef(onTap);
  tapRef.current = onTap;
  const swipeRef = useRef(onSwipe);
  swipeRef.current = onSwipe;
  useEffect(() => () => clearTimeout(tapTimer.current ?? undefined), []);

  const show = (next: Look, animated = false) => {
    const now = kept(next, room.current, fitted(room.current, w, h));
    look.current = now;
    if (!animated) {
      scale.setValue(now.scale);
      x.setValue(now.x);
      y.setValue(now.y);
      return;
    }
    Animated.parallel([
      Animated.timing(scale, { toValue: now.scale, duration: 180, useNativeDriver: true }),
      Animated.timing(x, { toValue: now.x, duration: 180, useNativeDriver: true }),
      Animated.timing(y, { toValue: now.y, duration: 180, useNativeDriver: true }),
    ]).start();
  };
  // A touch, or the middle of two, from the middle of where the photo is (it fills the screen).
  const middleOf = (touches: Touch[]): Point => ({
    x: touches.reduce((all, touch) => all + touch.pageX, 0) / touches.length - room.current.width / 2,
    y: touches.reduce((all, touch) => all + touch.pageY, 0) / touches.length - room.current.height / 2,
  });
  const apart = (touches: Touch[]) => (touches.length < 2 ? 0 : Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY));
  const copy = (touches: readonly Touch[]) => touches.slice(0, 2).map(({ pageX, pageY }) => ({ pageX, pageY }));

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => look.current.scale <= 1,
      onPanResponderGrant: (event) => {
        start.current = { look: look.current, touches: copy(event.nativeEvent.touches), moved: false };
      },
      onPanResponderMove: (event) => {
        const began = start.current;
        const touches = copy(event.nativeEvent.touches);
        if (!began || touches.length === 0) return;
        if (touches.length !== began.touches.length) {
          start.current = { look: look.current, touches, moved: true };
          return;
        }
        const from = middleOf(began.touches);
        const to = middleOf(touches);
        if (!began.moved && touches.length === 1 && Math.hypot(to.x - from.x, to.y - from.y) < TAP_SLOP) return;
        began.moved = true;
        // Not zoomed in, one finger, with somewhere to swipe to: the photo stays, the stroke is a swipe.
        if (swipeRef.current && touches.length === 1 && began.touches.length === 1 && began.look.scale <= 1) return;
        show(touches.length === 2 && apart(began.touches) > 0 ? pinched(began.look, from, to, apart(began.touches), apart(touches)) : moved(began.look, from, to));
      },
      onPanResponderRelease: (event) => {
        const began = start.current;
        start.current = null;
        if (look.current.scale < 1.05 && look.current.scale !== 1) show(WHOLE, true);
        if (began?.moved && swipeRef.current && began.touches.length === 1 && began.look.scale <= 1) {
          const dx = event.nativeEvent.pageX - began.touches[0].pageX;
          const dy = event.nativeEvent.pageY - began.touches[0].pageY;
          if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.5) swipeRef.current(dx < 0 ? 1 : -1);
          return;
        }
        if (!began || began.moved) return;
        const now = Date.now();
        if (now - lastTap.current >= DOUBLE_TAP) {
          lastTap.current = now;
          tapTimer.current = setTimeout(() => tapRef.current(), DOUBLE_TAP);
          return;
        }
        lastTap.current = 0;
        clearTimeout(tapTimer.current ?? undefined);
        show(doubleTapped(look.current, middleOf([event.nativeEvent])), true);
      },
    }),
  ).current;

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(event) => {
        // Turned: whole again.
        room.current = { width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height };
        show(WHOLE);
      }}
      {...responder.panHandlers}
    >
      <Animated.Image
        source={{ uri }}
        resizeMode="contain"
        resizeMethod="resize"
        {...ZOOM_ROOM}
        onError={onError}
        style={[StyleSheet.absoluteFill, { transform: [{ translateX: x }, { translateY: y }, { scale }] }]}
        accessibilityLabel={t('Photo')}
      />
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    viewer: {
      flex: 1,
      gap: space.md,
      paddingHorizontal: space.lg,
      backgroundColor: colors.ground,
    },
    photoViewer: {
      flex: 1,
      backgroundColor: '#000000',
      justifyContent: 'center',
    },
    opening: {
      textAlign: 'center',
    },
    photoBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      gap: space.sm,
      paddingTop: space.md,
      backgroundColor: withAlpha(colors.ground, 0.85),
    },
    centered: {
      textAlign: 'center',
    },
    viewerFile: {
      flex: 1,
      gap: space.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewerTools: {
      justifyContent: 'center',
    },
  });
