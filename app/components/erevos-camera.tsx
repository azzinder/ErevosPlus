// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Modal, PanResponder, PermissionsAndroid, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { effectFor, pinchedZoom, troubleOf, zoomName, zoomStops, type CameraMode as Mode, type CameraTrouble } from '../lib/camera-controls';
import { keepPicture, keepRecording } from '../lib/collection-camera';
import { t } from '../lib/i18n';
import { isPicking, whilePicking } from '../lib/picking';
import { type CollectionItem, type CollectionPlace } from '../lock/collection-data';
import { cameraView, type CameraHandle, type CameraProps, type CameraReady } from '../modules/erevos-collection';
import { space } from '../theme/colors';
import { Button, Text } from './ui';

// Erevos's own camera, for the Collection (CameraPreview.kt, lib/collection-camera.ts): no other
// app sees what it takes. A photo is taken into memory, drawn anew as a JPEG with nothing in it
// but its picture (no place, no time, no phone), and encrypted into the Collection: it is never
// written anywhere, not even for a moment. A video is recorded into the app's cache, encrypted
// from there, and that copy deleted as soon as it is in, or fails to be. Where the phone's maker
// offers them (CameraX Extensions), there are night photos, HDR and portraits, made on the phone
// by its own system. A tap focuses there; two fingers zoom, down to the wide lens where there is
// one. The camera stays open for the next one, and closes when Erevos goes to the background,
// and so with the space.

type Quality = CameraProps['quality'];
type Flash = CameraProps['flash'];

// What the owner chose last, kept while Erevos runs (never written anywhere).
const chosen: { quality: Quality; silent: boolean; grid: boolean; timer: 0 | 3 | 10; hdr: boolean; hdrVideo: boolean } = {
  quality: '1080p',
  silent: false,
  grid: false,
  timer: 0,
  hdr: true,
  hdrVideo: false,
};
const QUALITIES: Quality[] = ['720p', '1080p', '2160p'];
const QUALITY_NAMES: Record<Quality, string> = { '720p': 'HD', '1080p': 'Full HD', '2160p': '4K' };

// What went wrong, in the owner's language: never the camera's own English words.
function cameraTrouble(trouble: CameraTrouble): string {
  switch (trouble) {
    case 'open':
      return t('The camera could not be opened. Another app may be using it.');
    case 'stopped':
      return t('The camera stopped. Another app may be using it.');
    case 'not-ready':
      return t('The camera is not ready yet. Try again in a moment.');
    case 'photo':
      return t('The photo could not be taken. Try again.');
    case 'video':
      return t('The video could not be recorded. Try again.');
    case 'keep-photo':
      return t('The photo could not be kept in the Collection.');
    case 'keep-video':
      return t('The video could not be kept in the Collection.');
  }
}

const NONE: CameraReady = { effects: [], minZoom: 1, maxZoom: 1, exposure: false, exposureMin: 0, exposureMax: 0, exposureStep: 0, hdrVideo: false, flash: false, front: true };

type Allowed = 'yes' | 'no' | 'never' | 'asking';

export function ErevosCamera({
  visible,
  place,
  folder,
  onClose,
  onAdded,
}: {
  visible: boolean;
  place: CollectionPlace | null;
  folder: string;
  onClose: () => void;
  onAdded: (item: CollectionItem) => void;
}) {
  const insets = useSafeAreaInsets();
  const Camera = cameraView();
  const camera = useRef<CameraHandle>(null);
  const [allowed, setAllowed] = useState<Allowed>('asking');
  const [mode, setMode] = useState<Mode>('photo');
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<Flash>('off');
  const [can, setCan] = useState<CameraReady>(NONE);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(-1);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [taken, setTaken] = useState(0);
  const [note, setNote] = useState('');
  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0);
  const [focus, setFocus] = useState<{ x: number; y: number } | null>(null);
  const [torch, setTorch] = useState(false);
  const [quality, setQuality] = useState<Quality>(chosen.quality);
  const [silent, setSilent] = useState(chosen.silent);
  const [grid, setGrid] = useState(chosen.grid);
  const [timer, setTimer] = useState<0 | 3 | 10>(chosen.timer);
  const [hdr, setHdr] = useState(chosen.hdr);
  const [hdrVideo, setHdrVideo] = useState(chosen.hdrVideo);
  const [counting, setCounting] = useState(0);
  const [more, setMore] = useState(false);
  const countdown = useRef<ReturnType<typeof setInterval> | null>(null);
  const focusGone = useRef<ReturnType<typeof setTimeout> | null>(null);
  Object.assign(chosen, { quality, silent, grid, timer, hdr, hdrVideo });

  // A tap focuses there; two fingers zoom: apart, in; together, out.
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const moved = useRef(false);
  const now = useRef({ zoom, can });
  now.current = { zoom, can };
  const fingers = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          pinch.current = null;
          moved.current = false;
        },
        onPanResponderMove: (event, gesture) => {
          const touches = event.nativeEvent.touches;
          if (Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8) moved.current = true;
          if (touches.length < 2) return;
          moved.current = true;
          const distance = Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
          const { zoom: z, can: c } = now.current;
          if (!pinch.current) pinch.current = { distance, zoom: z };
          else setZoom(pinchedZoom(pinch.current.zoom, pinch.current.distance, distance, c.minZoom, c.maxZoom));
        },
        onPanResponderRelease: (event) => {
          if (!moved.current && !pinch.current) {
            const x = event.nativeEvent.locationX;
            const y = event.nativeEvent.locationY;
            void camera.current
              ?.focusAt(x, y)
              .then((done) => {
                if (!done) return;
                setFocus({ x, y });
                if (focusGone.current) clearTimeout(focusGone.current);
                focusGone.current = setTimeout(() => setFocus(null), 1500);
              })
              .catch(() => undefined);
          }
          pinch.current = null;
        },
        onPanResponderTerminate: () => {
          pinch.current = null;
        },
      }),
    [],
  );

  async function ask() {
    const status = await whilePicking(() => PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)).catch(() => PermissionsAndroid.RESULTS.DENIED);
    setAllowed(status === PermissionsAndroid.RESULTS.GRANTED ? 'yes' : status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ? 'never' : 'no');
  }

  useEffect(() => {
    if (!visible) return;
    setTaken(0);
    setNote('');
    setReady(false);
    setZoom(1);
    setExposure(0);
    setTorch(false);
    setMore(false);
    setProcessing(-1);
    void PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
      .then((yes) => (yes ? setAllowed('yes') : ask()))
      .catch(() => setAllowed('no'));
  }, [visible]);

  // Leaving Erevos closes the camera: nothing goes on filming behind the lock. Android's question
  // for the camera or the microphone is not leaving it (whilePicking).
  useEffect(() => {
    if (!visible) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && !isPicking()) {
        stopCounting();
        void camera.current?.stopRecording().catch(() => undefined);
        onClose();
      }
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  useEffect(() => {
    if (!recording) return;
    setSeconds(0);
    const ticking = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(ticking);
  }, [recording]);

  // A mode this camera has not (night or portrait on the front one, say) goes back to photo.
  useEffect(() => {
    if (!ready) return;
    if ((mode === 'night' && !can.effects.includes('night')) || (mode === 'portrait' && !can.effects.includes('bokeh'))) setMode('photo');
  }, [ready, can, mode]);

  function stopCounting() {
    if (countdown.current) clearInterval(countdown.current);
    countdown.current = null;
    setCounting(0);
  }

  useEffect(
    () => () => {
      stopCounting();
      if (focusGone.current) clearTimeout(focusGone.current);
    },
    [],
  );

  // The camera is bound again when what it is bound with changes: it says when it is ready.
  function rebinding(change: () => void) {
    setReady(false);
    change();
  }

  // The shutter: at once, or after the timer's seconds, counted down on the screen; a tap while
  // it counts stops it.
  function press() {
    if (counting > 0) {
      stopCounting();
      return;
    }
    const go = () => void (mode === 'video' ? film() : shoot());
    if (timer === 0 || recording) {
      go();
      return;
    }
    let left = timer;
    setCounting(left);
    countdown.current = setInterval(() => {
      left -= 1;
      if (left > 0) {
        setCounting(left);
        return;
      }
      stopCounting();
      go();
    }, 1000);
  }

  async function shoot() {
    if (!camera.current || !place || busy || !ready) return;
    setBusy(true);
    setNote('');
    if (mode === 'night') setProcessing(0);
    try {
      const photo = await camera.current.takePhoto(silent);
      setProcessing(-1);
      const item = await keepPicture(place, folder, photo);
      setTaken((n) => n + 1);
      onAdded(item);
    } catch (error) {
      setNote(cameraTrouble(troubleOf(error, 'photo')));
    }
    setProcessing(-1);
    setBusy(false);
  }

  async function film() {
    if (!camera.current || !place || !ready) return;
    if (recording) {
      void camera.current.stopRecording().catch(() => undefined);
      return;
    }
    setNote('');
    let mic = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).catch(() => false);
    if (!mic) {
      const status = await whilePicking(() => PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)).catch(() => PermissionsAndroid.RESULTS.DENIED);
      mic = status === PermissionsAndroid.RESULTS.GRANTED;
      if (!mic) setNote(t('Erevos may not use the microphone, so the video has no sound. Allow it in the phone settings for sound.'));
    }
    if (!camera.current) return;
    setRecording(true);
    let uri: string | undefined;
    try {
      uri = (await camera.current.record(!mic, silent)).uri;
    } catch (error) {
      setNote(cameraTrouble(troubleOf(error, 'video')));
    }
    setRecording(false);
    if (!uri) return;
    setBusy(true);
    try {
      const item = await keepRecording(place, folder, uri);
      setTaken((n) => n + 1);
      onAdded(item);
    } catch (error) {
      setNote(cameraTrouble(troubleOf(error, 'video')));
    }
    setBusy(false);
  }

  function brighter(step: number) {
    const next = Math.min(can.exposureMax, Math.max(can.exposureMin, exposure + step));
    setExposure(next);
    void camera.current?.setExposure(next).catch(() => undefined);
  }

  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const effect = effectFor(mode, hdr, can.effects);
  const stops = zoomStops(can.minZoom, can.maxZoom);
  const modes: Mode[] = [...(can.effects.includes('night') ? (['night'] as const) : []), ...(can.effects.includes('bokeh') ? (['portrait'] as const) : []), 'photo', 'video'];
  const modeNames: Record<Mode, string> = { night: t('Night'), portrait: t('Portrait'), photo: t('Photo'), video: t('Video') };
  const ev = exposure * can.exposureStep;
  const status = recording
    ? `● ${time}`
    : processing >= 0
      ? processing > 0
        ? t('Hold still… {n}%', { n: processing })
        : t('Hold still…')
      : taken > 0
        ? t('{n} in the Collection', { n: taken })
        : t('Straight into the Collection, encrypted');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        if (!recording) onClose();
      }}
      statusBarTranslucent
    >
      <View style={styles.screen}>
        {allowed === 'yes' && Camera ? (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            facing={facing}
            mode={mode === 'video' ? 'video' : 'photo'}
            effect={effect}
            quality={quality}
            hdrVideo={hdrVideo}
            flash={flash}
            torch={mode === 'video' && torch}
            zoom={zoom}
            onReady={(event) => {
              const told = event.nativeEvent;
              setCan(told);
              setReady(true);
              setExposure(0);
              setZoom((z) => Math.min(told.maxZoom, Math.max(told.minZoom, z)));
            }}
            onFail={(event) => setNote(cameraTrouble(event.nativeEvent.kind === 'stopped' ? 'stopped' : 'open'))}
            onProcessing={(event) => setProcessing(event.nativeEvent.progress)}
          />
        ) : (
          <View style={styles.center}>
            {allowed !== 'asking' ? (
              <Text color="#FFFFFF" style={styles.centered}>
                {t('Erevos may not use the camera. Allow it in the phone settings to take photos.')}
              </Text>
            ) : null}
            {allowed === 'no' ? <Button title={t('Allow the camera')} compact onPress={() => void ask()} /> : null}
          </View>
        )}

        {allowed === 'yes' ? (
          <View style={StyleSheet.absoluteFill} {...fingers.panHandlers}>
            {grid ? (
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                {[1, 2].map((i) => (
                  <View key={`v${i}`} style={[styles.gridLine, { left: `${(i * 100) / 3}%`, top: 0, bottom: 0, width: StyleSheet.hairlineWidth }]} />
                ))}
                {[1, 2].map((i) => (
                  <View key={`h${i}`} style={[styles.gridLine, { top: `${(i * 100) / 3}%`, left: 0, right: 0, height: StyleSheet.hairlineWidth }]} />
                ))}
              </View>
            ) : null}
            {focus ? <View pointerEvents="none" style={[styles.focus, { left: focus.x - 32, top: focus.y - 32 }]} /> : null}
            {counting > 0 ? (
              <View pointerEvents="none" style={styles.center}>
                <Text color="#FFFFFF" style={styles.count}>
                  {counting}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
          <Pressable onPress={onClose} disabled={recording} accessibilityRole="button" accessibilityLabel={t('Close')} style={styles.pill}>
            <Text color="#FFFFFF">{t('Close')}</Text>
          </Pressable>
          <Text color="#FFFFFF" variant="caption" style={styles.middle}>
            {status}
          </Text>
          {mode !== 'video' && can.flash ? (
            <Pressable onPress={() => setFlash((f) => (f === 'off' ? 'on' : f === 'on' ? 'auto' : 'off'))} accessibilityRole="button" style={styles.pill}>
              <Text color="#FFFFFF">{flash === 'off' ? t('Flash off') : flash === 'on' ? t('Flash on') : t('Flash auto')}</Text>
            </Pressable>
          ) : mode === 'video' && can.flash ? (
            <Pressable onPress={() => setTorch((on) => !on)} accessibilityRole="button" style={styles.pill}>
              <Text color="#FFFFFF">{torch ? t('Light on') : t('Light off')}</Text>
            </Pressable>
          ) : (
            <View style={styles.pillRoom} />
          )}
        </View>
        <View style={[styles.tools, { top: insets.top + space.sm + 44 }]}>
          {mode === 'photo' && can.effects.includes('hdr') ? (
            <Pressable onPress={() => rebinding(() => setHdr((on) => !on))} disabled={busy} accessibilityRole="button" style={styles.pill}>
              <Text color="#FFFFFF">{hdr ? t('HDR on') : t('HDR off')}</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => setMore((m) => !m)} disabled={recording} accessibilityRole="button" style={styles.pill}>
            <Text color="#FFFFFF">{more ? t('Fewer') : t('More')}</Text>
          </Pressable>
          {more ? (
            <>
              <Pressable onPress={() => setTimer((s) => (s === 0 ? 3 : s === 3 ? 10 : 0))} accessibilityRole="button" style={styles.pill}>
                <Text color="#FFFFFF">{timer === 0 ? t('Timer off') : t('Timer {n} s', { n: timer })}</Text>
              </Pressable>
              <Pressable onPress={() => setGrid((on) => !on)} accessibilityRole="button" style={styles.pill}>
                <Text color="#FFFFFF">{grid ? t('Grid on') : t('Grid off')}</Text>
              </Pressable>
              <Pressable onPress={() => setSilent((on) => !on)} accessibilityRole="button" style={styles.pill}>
                <Text color="#FFFFFF">{silent ? t('Shutter silent') : t('Shutter sound')}</Text>
              </Pressable>
              {can.exposure ? (
                <View style={styles.row}>
                  <Pressable onPress={() => brighter(-1)} disabled={exposure <= can.exposureMin} accessibilityRole="button" style={styles.pill}>
                    <Text color="#FFFFFF">{t('Darker')}</Text>
                  </Pressable>
                  <Pressable onPress={() => brighter(1)} disabled={exposure >= can.exposureMax} accessibilityRole="button" style={styles.pill}>
                    <Text color="#FFFFFF">{t('Brighter')}</Text>
                  </Pressable>
                </View>
              ) : null}
              {exposure !== 0 ? (
                <Pressable onPress={() => brighter(-exposure)} accessibilityRole="button" style={styles.pill}>
                  <Text color="#FFFFFF">{`☀ ${ev > 0 ? '+' : ''}${ev.toFixed(1)}`}</Text>
                </Pressable>
              ) : null}
              {mode === 'video' ? (
                <Pressable onPress={() => rebinding(() => setQuality((q) => QUALITIES[(QUALITIES.indexOf(q) + 1) % QUALITIES.length]))} accessibilityRole="button" style={styles.pill}>
                  <Text color="#FFFFFF">{QUALITY_NAMES[quality]}</Text>
                </Pressable>
              ) : null}
              {mode === 'video' && can.hdrVideo ? (
                <Pressable onPress={() => rebinding(() => setHdrVideo((on) => !on))} accessibilityRole="button" style={styles.pill}>
                  <Text color="#FFFFFF">{hdrVideo ? t('HDR video on') : t('HDR video off')}</Text>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </View>

        <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
          {note ? (
            <Text color="#FFFFFF" style={[styles.centered, styles.note]}>
              {note}
            </Text>
          ) : null}
          {stops.length > 1 ? (
            <View style={styles.zooms}>
              {stops.map((stop, i) => {
                const next = stops[i + 1] ?? Infinity;
                const on = zoom >= stop - 0.05 && zoom < next - 0.05;
                return (
                  <Pressable key={stop} onPress={() => setZoom(stop)} accessibilityRole="button" accessibilityLabel={t('Zoom {n}', { n: zoomName(stop) })} style={[styles.zoom, on && styles.zoomOn]}>
                    <Text color="#FFFFFF" variant="caption">
                      {on ? zoomName(Math.round(zoom * 10) / 10) : zoomName(stop)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          <View style={styles.modes}>
            {modes.map((m) => (
              <Pressable key={m} disabled={recording || busy} onPress={() => m !== mode && rebinding(() => setMode(m))} accessibilityRole="button" style={[styles.mode, mode === m && styles.modeOn]}>
                <Text color="#FFFFFF" variant="bodyStrong">
                  {modeNames[m]}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.controls}>
            <View style={styles.side} />
            <Pressable
              onPress={press}
              disabled={allowed !== 'yes' || !ready || (busy && !recording)}
              accessibilityRole="button"
              accessibilityLabel={mode !== 'video' ? t('Take a photo') : recording ? t('Stop') : t('Record a video')}
              style={({ pressed }) => [styles.shutter, (busy || !ready) && { opacity: 0.5 }, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.shutterInside, mode === 'video' && styles.shutterVideo, recording && styles.shutterStop]} />
            </Pressable>
            {can.front ? (
              <Pressable
                onPress={() => rebinding(() => setFacing((f) => (f === 'back' ? 'front' : 'back')))}
                disabled={recording || busy}
                accessibilityRole="button"
                accessibilityLabel={t('Turn the camera')}
                style={styles.side}
              >
                <Text color="#FFFFFF" variant="heading">
                  ⟲
                </Text>
              </Pressable>
            ) : (
              <View style={styles.side} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl },
  centered: { textAlign: 'center' },
  top: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md },
  middle: { flex: 1, textAlign: 'center' },
  pill: { paddingHorizontal: space.md, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.45)' },
  pillRoom: { width: 64 },
  row: { flexDirection: 'row', gap: space.sm },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, gap: space.md, paddingTop: space.md, backgroundColor: 'rgba(0,0,0,0.35)' },
  note: { paddingHorizontal: space.lg },
  zooms: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
  zoom: { minWidth: 44, height: 32, paddingHorizontal: space.sm, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  zoomOn: { backgroundColor: 'rgba(255,255,255,0.3)' },
  modes: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: space.sm },
  mode: { paddingHorizontal: space.md, paddingVertical: 4, borderRadius: 14 },
  modeOn: { backgroundColor: 'rgba(255,255,255,0.22)' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  side: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  shutterInside: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  shutterVideo: { backgroundColor: '#E53935' },
  shutterStop: { width: 28, height: 28, borderRadius: 6 },
  tools: { position: 'absolute', right: space.md, alignItems: 'flex-end', gap: space.sm },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.6)' },
  focus: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#FFD54F' },
  count: { fontSize: 96, lineHeight: 110, fontWeight: '700' },
});
