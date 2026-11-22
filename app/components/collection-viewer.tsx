// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fileSize } from '../lib/attachments';
import { MOST_IN_MEMORY, onCollectionMemoryDropped, openItemUri, releaseMemoryUri } from '../lib/collection-memory';
import { CAN_OPEN_WITH } from '../lib/collection-out';
import { itemPlace } from '../lib/collection-export';
import { CAN_PLAY, playItems, playingFile, usePlayer } from '../lib/collection-play';
import { fileLook, isText, MOST_TEXT, playKind, playListOf } from '../lib/collection-view';
import { utf8Decode } from '../lib/crypto';
import { locale, t } from '../lib/i18n';
import { SHELL } from '../lib/shell';
import { fillItemHere, itemsWhole, openItem, type CollectionItem, type CollectionPlace } from '../lock/collection-data';
import { device } from '../modules/erevos-device';
import { space, withAlpha } from '../theme/colors';
import { useColors } from '../theme/context';
import { ZoomPhoto } from './attachment';
import { FetchNote, useFetching, type Fetching } from './collection-fetch';
import { CollectionPdf } from './collection-pdf';
import { NowPlayingScreen } from './collection-now-playing';
import { PlayerControls, VideoScreen } from './collection-player';
import { BackIcon, ChevronIcon, DownloadIcon, FileIcon, InfoIcon, PencilIcon, SendIcon, TrashIcon } from './icons';
import { Button, Sheet, Text } from './ui';

// One file of the Collection looked at on its own (app/collection.tsx): a photo fills the screen,
// to swipe to the next and to zoom (the chat's own photo zoom, components/attachment.tsx); a text
// file is read here; a PDF is read here a page at a time (components/collection-pdf.tsx); music
// plays here, with the other music shown after it, and a video plays over the whole screen
// (components/collection-player.tsx), all from the encrypted chunks. Any other file shows what it
// is, to open with another app, which the screen asks about first, as the file leaves the
// Collection unencrypted. A photo is read into memory to show, never written out, and let go of
// once it is no longer near. Under it: send it to a chat, save it to the phone, its information,
// and delete it.
//
// In the desktop app the same, each held decrypted in the page's memory only, as a blob: address
// (lib/collection-memory.ts) let go of when it closes: a photo, with arrows and the arrow keys to
// go to the next; a PDF in Chromium's own viewer; music and videos in the page's player (lib/
// collection-desk-player.ts), answered by the shell from their chunks at any size (desktop/play.js). Saving goes to the computer, and nothing is
// opened with another app. When the space locks the player stops and the viewer closes. In a
// browser and on Sailfish OS the same, up to 256 MB, but a PDF is saved to be read elsewhere.
//
// A file whose chunks are not all on this device has them fetched first from its place's server,
// before it shows, plays or opens with another app, with how far that is and Cancel
// (components/collection-fetch.tsx): what came stays, and the next time only the rest comes.

type Props = {
  /** The files that can be swiped between, in the order shown. */
  items: CollectionItem[];
  /** Which of them opens first; null while nothing is shown. */
  start: number | null;
  /** Whether it can be sent to a chat from here (not from a hidden place's Collection). */
  canSend: boolean;
  onClose: () => void;
  onSend: (item: CollectionItem) => void;
  onSave: (item: CollectionItem) => void;
  onDelete: (item: CollectionItem) => void;
  onOpenWith: (item: CollectionItem) => void;
  /** Turning and cutting a photo (components/collection-edit.tsx), where it can be done. */
  onEdit?: (item: CollectionItem) => void;
  /** The place's own choices for its list playing (lock/collection-data.ts). */
  playOptions: { showTitle: boolean; stopOnLock: boolean; place: CollectionPlace | null };
};

/** The day and time a file came, as the phone writes them. */
export const addedText = (at: number) => new Date(at).toLocaleString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });

const DESK = SHELL === 'electron';
// A browser, an iPhone's or a computer's: saving goes to this device, whichever it is.
const BROWSER = Platform.OS === 'web' && !SHELL;
// A pointer has no swipe: on a computer a photo shows alone, with arrows and the arrow keys; on a
// phone the photos are swiped between, with arrows too while the bars show.
const WEB = Platform.OS === 'web';
// How long each photo shows in a slideshow.
export const SLIDE_MS = 4000;

export function CollectionViewer({ items, start, canSend, onClose, onSend, onSave, onDelete, onOpenWith, onEdit, playOptions }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(start ?? 0);
  const [bars, setBars] = useState(true);
  const [info, setInfo] = useState(false);
  const [video, setVideo] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(false);
  const [playNote, setPlayNote] = useState('');
  // The photos shown one after the other, by themselves, from the one in view.
  const [sliding, setSliding] = useState(false);
  // Fetching what is missing of the file before it plays or opens with another app.
  const fetching = useFetching();
  const shown = start !== null;
  useEffect(() => {
    if (start !== null) {
      setIndex(start);
      setBars(true);
    }
    setSliding(false);
  }, [start]);
  // One deleted from here: the next one shows, or the viewer closes when none is left.
  const at = Math.min(index, items.length - 1);
  const item: CollectionItem | undefined = items[at];
  useEffect(() => {
    if (shown && items.length === 0) onClose();
  }, [shown, items.length]);
  const photo = item?.file.kind === 'photo';
  // A photo shown turns with the phone, its auto-rotate on or off; the rest of Erevos follows the setting.
  useEffect(() => {
    if (!shown || !photo) return;
    device?.turnWithPhone?.(true);
    return () => {
      device?.turnWithPhone?.(false);
    };
  }, [shown, photo]);

  const pager = useRef<FlatList<CollectionItem>>(null);
  // What was held in memory went (the space locked): no video stays over the window.
  useEffect(() => onCollectionMemoryDropped(() => setVideo(false)), []);
  // To the photo before or after, by the arrows or the arrow keys.
  const goTo = (to: number) => {
    if (to < 0 || to >= items.length) return;
    setIndex(to);
    if (!WEB) pager.current?.scrollToIndex({ index: to, animated: true });
  };
  // The slideshow: the next photo every SLIDE_MS, the bars hidden; it stops at the last one, or
  // with a tap, Back, or anything other than a photo.
  useEffect(() => {
    if (!sliding || !shown || !photo) return;
    if (at >= items.length - 1) {
      const end = setTimeout(() => setSliding(false), SLIDE_MS);
      return () => clearTimeout(end);
    }
    const next = setTimeout(() => goTo(at + 1), SLIDE_MS);
    return () => clearTimeout(next);
  }, [sliding, shown, photo, at, items.length]);
  useEffect(() => {
    if (!photo) setSliding(false);
  }, [photo]);
  const slide = (on: boolean) => {
    setSliding(on);
    setBars(!on);
  };
  const tapped = () => {
    if (sliding) slide(false);
    else setBars((b) => !b);
  };
  useEffect(() => {
    if (!WEB || !shown || !photo || typeof window === 'undefined') return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goTo(at - 1);
      else if (event.key === 'ArrowRight') goTo(at + 1);
      else if (event.key === 'Escape' && sliding) slide(false);
      else if (event.key === ' ') slide(!sliding);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [shown, photo, at, items.length, sliding]);

  // Another file, or the viewer closed: a fetch for the one before stops, and what came stays.
  useEffect(() => fetching.reset, [item?.id, shown]);

  // The file's chunks all here, those missing fetched first, with how far it is: whether it is whole now.
  async function whenHere(file: CollectionItem, again: () => void): Promise<boolean> {
    setPlayNote('');
    try {
      const done = await fetching.run((options) => fillItemHere(file, options), again);
      if (done === 'stopped') return false;
      if (!done.value) setPlayNote(t('This file is not on this device. It comes from your other devices while one of them has it; a backup restored without it leaves only its name.'));
      return done.value;
    } catch (error) {
      setPlayNote(error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  // Opened with another app, which reads it from its chunks: they are fetched first.
  async function openWith(file: CollectionItem) {
    if (DESK || (await whenHere(file, () => void openWith(file)))) onOpenWith(file);
  }

  // Music plays with the music shown after it; a video with the videos, over the whole screen.
  // The one to play is fetched first if it is not here; others not here are left out of the list.
  async function play(from: CollectionItem) {
    setPlayNote('');
    if (!DESK && !(await whenHere(from, () => void play(from)))) return;
    // Only those of its kind are looked at: they are the list.
    const kind = playKind(from);
    const same = items.filter((i) => playKind(i) === kind);
    const whole = DESK ? items : await itemsWhole(same).catch(() => [from]);
    const { list, start: at } = playListOf(whole.some((i) => i.id === from.id) ? whole : [...whole, from], from);
    try {
      await playItems(playOptions.place, list, at, playOptions);
      if (playKind(from) === 'video') setVideo(true);
      else setNowPlaying(true);
    } catch (error) {
      setPlayNote(error instanceof Error ? error.message : String(error));
    }
  }
  const ink = photo ? '#FFFFFF' : colors.text;
  const faint = photo ? 'rgba(255,255,255,0.7)' : colors.textMuted;

  const act = (icon: ReactNode, label: string, run: () => void, danger = false) => (
    <Pressable key={label} onPress={run} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}>
      {icon}
      <Text variant="caption" color={danger ? colors.danger : faint} style={styles.actionText}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal visible={shown && !!item} animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent supportedOrientations={['portrait', 'landscape-left', 'landscape-right']}>
      {item ? (
        <View style={[styles.screen, { backgroundColor: photo ? '#000000' : colors.ground }]}>
          {photo && WEB ? (
            // On a computer one photo at a time: a pager's scroll there would move the one in view.
            <PhotoPage key={item.id} item={item} width={width} near onTap={tapped} onOpenWith={() => void openWith(item)} />
          ) : photo ? (
            <FlatList
              // Turned, the pages are laid out again at the photo in view.
              key={width}
              ref={pager}
              data={items}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={at}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
              keyExtractor={(i) => i.id}
              onMomentumScrollEnd={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
              windowSize={3}
              renderItem={({ item: page, index: i }) => <PhotoPage item={page} width={width} near={Math.abs(i - at) <= 1} onTap={tapped} onSwipe={(by) => goTo(at + by)} onOpenWith={() => void openWith(page)} />}
            />
          ) : (
            <FilePage item={item} ink={ink} muted={faint} onOpenWith={() => void openWith(item)} onPlay={() => void play(item)} onShowPlayer={() => setNowPlaying(true)} note={playNote} fetching={fetching} />
          )}
          {photo && bars ? (
            <>
              {at > 0 ? (
                <Pressable onPress={() => goTo(at - 1)} accessibilityRole="button" accessibilityLabel={t('Previous')} style={[styles.arrow, { left: space.md }]}>
                  <BackIcon color="#FFFFFF" size={24} />
                </Pressable>
              ) : null}
              {at < items.length - 1 ? (
                <Pressable onPress={() => goTo(at + 1)} accessibilityRole="button" accessibilityLabel={t('Next')} style={[styles.arrow, { right: space.md }]}>
                  <ChevronIcon color="#FFFFFF" size={24} />
                </Pressable>
              ) : null}
            </>
          ) : null}
          {bars || !photo ? (
            <View style={[styles.top, { paddingTop: Math.max(space.sm, insets.top), backgroundColor: photo ? withAlpha('#000000', 0.55) : 'transparent' }]}>
              <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('Back')} hitSlop={8} style={styles.back}>
                <BackIcon color={ink} size={24} />
              </Pressable>
              <View style={styles.titles}>
                <Text variant="bodyStrong" color={ink} numberOfLines={1}>
                  {item.file.name}
                </Text>
                <Text variant="caption" color={faint} numberOfLines={1}>
                  {addedText(item.added)} · {fileSize(item.file.size)}
                </Text>
              </View>
              {photo && items.length > 1 ? (
                <Pressable onPress={() => slide(true)} accessibilityRole="button" accessibilityLabel={t('Slideshow')} hitSlop={8} style={styles.slideButton}>
                  <View style={styles.playShape} />
                  <Text variant="caption" color={ink}>
                    {t('Slideshow')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {bars || !photo ? (
            <View
              style={[
                styles.bottom,
                { paddingBottom: Math.max(space.md, insets.bottom), backgroundColor: photo ? withAlpha('#000000', 0.7) : colors.sheet, borderTopColor: withAlpha(ink, 0.12) },
              ]}
            >
              {canSend ? act(<SendIcon color={ink} cut={photo ? '#000000' : colors.sheet} size={22} />, t('Send to a chat'), () => onSend(item)) : null}
              {act(<DownloadIcon color={ink} size={22} />, DESK ? t('Save to the computer') : BROWSER ? t('Save to this device') : t('Save to phone'), () => onSave(item))}
              {photo && onEdit ? act(<PencilIcon color={ink} size={22} />, t('Edit'), () => onEdit(item)) : null}
              {act(<InfoIcon color={ink} size={22} />, t('Information'), () => setInfo(true))}
              {act(<TrashIcon color={colors.danger} size={22} />, t('Delete'), () => onDelete(item), true)}
            </View>
          ) : null}
          <VideoScreen visible={video} onClose={() => setVideo(false)} />
          <NowPlayingScreen visible={nowPlaying} onClose={() => setNowPlaying(false)} />
          <Sheet visible={info} onClose={() => setInfo(false)} title={t('Information')}>
            <InfoRow label={t('Name')} value={item.file.name} />
            <InfoRow label={t('Type')} value={item.file.mime} />
            <InfoRow label={t('Size')} value={fileSize(item.file.size)} />
            {item.file.w && item.file.h ? <InfoRow label={t('Dimensions')} value={`${item.file.w} × ${item.file.h}`} /> : null}
            <InfoRow label={t('Added')} value={addedText(item.added)} />
            {info ? <PlaceRow item={item} /> : null}
            <Button title={t('Close')} kind="secondary" compact onPress={() => setInfo(false)} />
          </Sheet>
        </View>
      ) : null}
    </Modal>
  );
}

// Whether a photo or video says where it was taken, read from its chunks when Information opens.
function PlaceRow({ item }: { item: CollectionItem }) {
  const [place, setPlace] = useState<string | null>(null);
  const media = item.file.kind === 'photo' || item.file.mime.startsWith('image/') || playKind(item) === 'video';
  useEffect(() => {
    if (!media) return;
    let active = true;
    setPlace(null);
    void itemPlace(item).then((said) => {
      if (active) setPlace(said === 'yes' ? t('Yes: it says where it was taken') : said === 'no' ? t('No') : t('Cannot tell'));
    });
    return () => {
      active = false;
    };
  }, [item.id, media]);
  if (!media) return null;
  return <InfoRow label={t('Place in the file')} value={place ?? t('Looking…')} />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text>{value}</Text>
    </View>
  );
}

// One photo of the pager: read when it is the one in view or next to it, let go of otherwise.
function PhotoPage({ item, width, near, onTap, onSwipe, onOpenWith }: { item: CollectionItem; width: number; near: boolean; onTap: () => void; onSwipe?: (by: 1 | -1) => void; onOpenWith?: () => void }) {
  const [uri, setUri] = useState<string | null>(null);
  const [gone, setGone] = useState(false);
  // A photo this device cannot draw (a HEIC on an older Android, or in a browser): said, with the way to another app.
  const [undrawn, setUndrawn] = useState(false);
  // Fetched from the server when it is not here, with Cancel; Go on opens it again (`round`).
  const fetching = useFetching();
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (!near) return;
    let active = true;
    let made: string | null = null;
    fetching
      .run((options) => openItemUri(item, item.file.mime, undefined, options), () => setRound((r) => r + 1))
      .then((result) => {
        if (result === 'stopped') return;
        const opened = result.value;
        if (!active) {
          if (opened) releaseMemoryUri(opened);
          return;
        }
        if (!opened) {
          setGone(true);
          return;
        }
        made = opened;
        setUri(made);
      })
      .catch(() => active && setGone(true));
    return () => {
      active = false;
      fetching.reset();
      if (made) releaseMemoryUri(made);
      setUri(null);
    };
  }, [near, item.id, round]);
  return (
    <View style={{ width, flex: 1 }}>
      {uri && undrawn ? (
        <View style={styles.center}>
          <Text color="#FFFFFF" style={styles.centered}>
            {t('This device cannot show this photo ({type}).', { type: item.file.mime })}
          </Text>
          {CAN_OPEN_WITH && onOpenWith ? <Button title={t('Open with another app')} kind="secondary" compact onPress={onOpenWith} /> : null}
        </View>
      ) : uri ? (
        <ZoomPhoto uri={uri} w={item.file.w} h={item.file.h} onTap={onTap} onSwipe={onSwipe} onError={() => setUndrawn(true)} />
      ) : (
        <View style={styles.center}>
          {fetching.progress || fetching.stopped ? (
            <FetchNote fetching={fetching} ink="#FFFFFF" muted="rgba(255,255,255,0.7)" />
          ) : (
            <Text color="#FFFFFF" style={styles.centered}>
              {gone ? t('This file is not on this device. It comes from your other devices while one of them has it; a backup restored without it leaves only its name.') : t('Opening the photo…')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// A file that is not a photo: its text if it is text, its pages if a PDF, the player if it plays,
// else what it is, to open with another app (on a computer, to save first to open it elsewhere).
function FilePage({
  item,
  ink,
  muted,
  onOpenWith,
  onPlay,
  onShowPlayer,
  note,
  fetching,
}: {
  item: CollectionItem;
  ink: string;
  muted: string;
  onOpenWith: () => void;
  onPlay: () => void;
  /** Opens the player's screen. */
  onShowPlayer: () => void;
  note: string;
  /** The fetch before it plays or opens with another app. */
  fetching: Fetching;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const readable = isText(item) && item.file.size <= MOST_TEXT;
  const plays = CAN_PLAY ? playKind(item) : null;
  const player = usePlayer(plays !== null);
  const [text, setText] = useState<string | null>(null);
  const [gone, setGone] = useState(false);
  // A text file fetched from the server when it is not here, with Cancel; Go on reads it again (`round`).
  const reading = useFetching();
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (!readable) return;
    let active = true;
    reading
      .run((options) => openItem(item, options), () => setRound((r) => r + 1))
      .then((opened) => {
        if (!active || opened === 'stopped') return;
        if (opened.value) setText(utf8Decode(opened.value));
        else setGone(true);
      })
      .catch(() => active && setGone(true));
    return () => {
      active = false;
      reading.reset();
    };
  }, [item.id, readable, round]);
  const pad = { paddingTop: Math.max(space.sm, insets.top) + 64, paddingBottom: 96 + insets.bottom };
  if (fileLook(item) === 'pdf') return <CollectionPdf item={item} width={width} top={pad.paddingTop} bottom={pad.paddingBottom} ink={ink} muted={muted} onOpenWith={onOpenWith} fetching={fetching} />;
  // The music playing now is this file: its controls.
  const playingThis = !!player?.active && !player.video && playingFile(player.index)?.id === item.id;
  if (readable && text !== null) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={[styles.text, pad]}>
        <Text selectable color={ink}>
          {text}
        </Text>
      </ScrollView>
    );
  }
  return (
    <View style={[styles.center, pad]}>
      <FileIcon color={muted} size={56} />
      <Text variant="heading" color={ink} style={styles.centered}>
        {item.file.name}
      </Text>
      <Text tone="muted" style={styles.centered}>
        {fileLook(item) === 'pdf' ? 'PDF' : item.file.mime} · {fileSize(item.file.size)}
      </Text>
      <FetchNote fetching={reading} ink={ink} muted={muted} />
      <FetchNote fetching={fetching} ink={ink} muted={muted} />
      {gone ? (
        <Text color={colors.danger} style={styles.centered}>
          {t('This file is not on this device. It comes from your other devices while one of them has it; a backup restored without it leaves only its name.')}
        </Text>
      ) : (
        <>
          {playingThis && player ? <PlayerControls state={player} ink={ink} muted={muted} onOpen={onShowPlayer} /> : plays ? <Button title={t('Play')} compact onPress={onPlay} /> : null}
          {note ? (
            <Text color={colors.danger} style={styles.centered}>
              {note}
            </Text>
          ) : null}
          {CAN_OPEN_WITH ? (
            <Button title={t('Open with another app')} kind="secondary" compact onPress={onOpenWith} />
          ) : !plays || item.file.size > MOST_IN_MEMORY ? (
            <Text tone="muted" style={styles.centered}>
              {DESK ? t('To open it with another app, save it to the computer first. That copy is not encrypted.') : t('To open it with another app, save it first. That copy is not encrypted.')}
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl },
  centered: { textAlign: 'center' },
  text: { paddingHorizontal: space.lg },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingBottom: space.sm },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-around', paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth },
  action: { flex: 1, alignItems: 'center', gap: 4, paddingHorizontal: 2 },
  actionText: { textAlign: 'center' },
  infoRow: { gap: 2, paddingVertical: 2 },
  slideButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.sm, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.14)' },
  // A play triangle, of borders.
  playShape: { width: 0, height: 0, borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 10, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#FFFFFF' },
  arrow: { position: 'absolute', top: '50%', marginTop: -22, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
});
