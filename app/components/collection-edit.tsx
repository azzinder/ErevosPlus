// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Modal, PanResponder, Pressable, StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dragged, turnedCut, WHOLE, wholeCut, type Cut, type Grip, type Turn } from '../lib/photo-cut';
import { openItemUri, releaseMemoryUri } from '../lib/collection-memory';
import { t } from '../lib/i18n';
import { type CollectionItem } from '../lock/collection-data';
import { space } from '../theme/colors';
import { Button, Text } from './ui';

// Turning and cutting a photo of the Collection (lib/collection-edit.ts): the photo, held in
// memory only, shown turned, with a frame to drag by its corners, or by its middle to move it.
// Saved, it becomes a new photo next to this one; this one stays as it was.

// How far from a corner a touch takes that corner, in points.
const CORNER = 36;


export function CollectionEdit({ item, onClose, onSave }: { item: CollectionItem | null; onClose: () => void; onSave: (item: CollectionItem, turn: Turn, cut: Cut) => Promise<void> }) {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [turn, setTurn] = useState<Turn>(0);
  const [cut, setCut] = useState<Cut>(WHOLE);
  const [saving, setSaving] = useState(false);
  const [room, setRoom] = useState({ w: window.width, h: window.height * 0.6 });
  // The photo's sides as the image says them once shown: the Collection knows them only for JPEG and
  // PNG, and a HEIC, WebP, GIF or AVIF would else be taken as square, the frame off the picture.
  const [shown, setShown] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!item) return;
    let active = true;
    let made: string | null = null;
    setTurn(0);
    setCut(WHOLE);
    setFailed(false);
    setShown(null);
    openItemUri(item)
      .then((opened) => {
        if (!active) {
          if (opened) releaseMemoryUri(opened);
          return;
        }
        made = opened;
        if (opened) setUri(opened);
        else setFailed(true);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
      if (made) releaseMemoryUri(made);
      setUri(null);
    };
  }, [item?.id]);

  // The photo as shown, turned: its sides fitted into the room there is.
  const w0 = item?.file.w || shown?.w || 1;
  const h0 = item?.file.h || shown?.h || 1;
  const sideways = turn % 2 === 1;
  const shownW = sideways ? h0 : w0;
  const shownH = sideways ? w0 : h0;
  const scale = Math.min(room.w / Math.max(1, shownW), room.h / Math.max(1, shownH));
  const box = { w: Math.max(1, shownW * scale), h: Math.max(1, shownH * scale) };

  // The frame dragged: where it was when the touch began, and which part was taken.
  const start = useRef<{ cut: Cut; grip: Grip } | null>(null);
  const now = useRef({ cut, box });
  now.current = { cut, box };
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { cut: c, box: b } = now.current;
          const px = event.nativeEvent.locationX;
          const py = event.nativeEvent.locationY;
          const near = (x: number, y: number) => Math.abs(px - x * b.w) <= CORNER && Math.abs(py - y * b.h) <= CORNER;
          const grip: Grip = near(c.x, c.y) ? 'tl' : near(c.x + c.w, c.y) ? 'tr' : near(c.x, c.y + c.h) ? 'bl' : near(c.x + c.w, c.y + c.h) ? 'br' : 'move';
          start.current = { cut: c, grip };
        },
        onPanResponderMove: (_event, gesture) => {
          const began = start.current;
          if (!began) return;
          const { box: b } = now.current;
          setCut(dragged(began.cut, began.grip, gesture.dx / b.w, gesture.dy / b.h));
        },
        onPanResponderRelease: () => {
          start.current = null;
        },
        onPanResponderTerminate: () => {
          start.current = null;
        },
      }),
    [],
  );

  function turnOnce() {
    // The frame turns with the photo, a quarter clockwise.
    setCut(turnedCut);
    setTurn((n) => ((n + 1) % 4) as Turn);
  }

  async function save() {
    if (!item || saving) return;
    setSaving(true);
    try {
      await onSave(item, turn, cut);
    } finally {
      setSaving(false);
    }
  }

  const unchanged = turn === 0 && wholeCut(cut);
  const onRoom = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (Math.abs(width - room.w) > 1 || Math.abs(height - room.h) > 1) setRoom({ w: width, h: height });
  };

  return (
    <Modal visible={item !== null} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.screen, { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.sm }]}>
        <View style={styles.top}>
          <Button title={t('Cancel')} kind="secondary" compact onPress={onClose} />
          <Text variant="bodyStrong" color="#FFFFFF" style={styles.title}>
            {t('Turn and cut')}
          </Text>
          <Button title={saving ? t('Saving…') : t('Save')} compact disabled={unchanged || saving || !uri} onPress={() => void save()} />
        </View>
        <View style={styles.room} onLayout={onRoom}>
          {failed ? (
            <Text color="#FFFFFF" style={styles.centered}>
              {t('This device cannot show this photo ({type}).', { type: item?.file.mime ?? '' })}
            </Text>
          ) : uri ? (
            <View style={{ width: box.w, height: box.h }} {...responder.panHandlers}>
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <Image
                  source={{ uri }}
                  resizeMode="contain"
                  resizeMethod="resize"
                  onError={() => setFailed(true)}
                  onLoad={(event) => {
                    const { width, height } = event.nativeEvent.source;
                    if (width > 0 && height > 0 && (shown?.w !== width || shown?.h !== height)) setShown({ w: width, h: height });
                  }}
                  style={{
                    position: 'absolute',
                    width: sideways ? box.h : box.w,
                    height: sideways ? box.w : box.h,
                    left: sideways ? (box.w - box.h) / 2 : 0,
                    top: sideways ? (box.h - box.w) / 2 : 0,
                    transform: [{ rotate: `${turn * 90}deg` }],
                  }}
                  accessibilityLabel={t('Photo')}
                />
              </View>
              <Shade cut={cut} box={box} />
              <View pointerEvents="none" style={[styles.frame, { left: cut.x * box.w, top: cut.y * box.h, width: cut.w * box.w, height: cut.h * box.h }]}>
                {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
                  <View key={corner} style={[styles.corner, corner[0] === 't' ? { top: -3 } : { bottom: -3 }, corner[1] === 'l' ? { left: -3 } : { right: -3 }]} />
                ))}
              </View>
            </View>
          ) : (
            <Text color="#FFFFFF">{t('Opening the photo…')}</Text>
          )}
        </View>
        <View style={styles.bottom}>
          <Pressable onPress={turnOnce} accessibilityRole="button" style={({ pressed }) => [styles.tool, pressed && { opacity: 0.6 }]}>
            <Text color="#FFFFFF">{t('Turn ↻')}</Text>
          </Pressable>
          <Pressable onPress={() => setCut(WHOLE)} accessibilityRole="button" style={({ pressed }) => [styles.tool, pressed && { opacity: 0.6 }]}>
            <Text color="#FFFFFF">{t('Whole photo')}</Text>
          </Pressable>
        </View>
        <Text variant="caption" color="rgba(255,255,255,0.7)" style={styles.centered}>
          {t('Drag the corners to cut. The photo is saved as a new one; this one stays as it is.')}
        </Text>
      </View>
    </Modal>
  );
}

// The parts of the photo left out, darkened.
function Shade({ cut, box }: { cut: Cut; box: { w: number; h: number } }) {
  const dark = 'rgba(0,0,0,0.55)';
  const top = cut.y * box.h;
  const bottom = (cut.y + cut.h) * box.h;
  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: top, backgroundColor: dark }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: bottom, bottom: 0, backgroundColor: dark }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, width: cut.x * box.w, top, height: bottom - top, backgroundColor: dark }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: (cut.x + cut.w) * box.w, right: 0, top, height: bottom - top, backgroundColor: dark }} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000', gap: space.sm },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md },
  title: { flex: 1, textAlign: 'center' },
  room: { flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: space.md },
  frame: { position: 'absolute', borderWidth: 2, borderColor: '#FFFFFF' },
  corner: { position: 'absolute', width: 18, height: 18, borderColor: '#FFFFFF', borderWidth: 4 },
  bottom: { flexDirection: 'row', justifyContent: 'center', gap: space.lg },
  tool: { paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)' },
  centered: { textAlign: 'center', paddingHorizontal: space.lg },
});
