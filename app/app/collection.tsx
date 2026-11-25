// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, BackHandler, FlatList, Image, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollectionGate } from '../components/collection-gate';
import { NowPlayingScreen } from '../components/collection-now-playing';
import { NowPlaying } from '../components/collection-player';
import { AddToPlaylistSheet, PlaylistScreen } from '../components/collection-playlist';
import { AddStationSheet, StationsList } from '../components/collection-radio';
import { AddChannelsSheet, ChannelsList } from '../components/collection-tv';
import { CollectionEdit } from '../components/collection-edit';
import { ErevosCamera } from '../components/erevos-camera';
import { CollectionViewer, addedText } from '../components/collection-viewer';
import { BackIcon, CameraIcon, CheckIcon, CloseIcon, FileIcon, FolderIcon, MoveIcon, MusicIcon, PhotoIcon, PlusIcon, SearchIcon, SendIcon, TrashIcon, MoreIcon, GearIcon, VideoIcon } from '../components/icons';
import { Button, Chip, Input, Sheet, Text } from '../components/ui';
import { fileSize } from '../lib/attachments';
import { choose, confirm } from '../lib/alert';
import { CAN_COLLECT, CAN_PICK_GALLERY, CAN_TAKE_PHOTO, importFromFiles } from '../lib/collection-import';
import { TooLargeToSaveError, memoryUri, mostSavedOut, onCollectionMemoryDropped, releaseMemoryUri } from '../lib/collection-memory';
import { CAN_EDIT, editPhoto, type Cut, type Turn } from '../lib/collection-edit';
import { cleanedPhoto, itemPlace } from '../lib/collection-export';
import { copyToSend, dropOpened, openBytesWithOtherApp, openWithOtherApp } from '../lib/collection-out';
import { placeShown, usePlayer } from '../lib/collection-play';
import { useCollectionPlace } from '../lib/collection-place';
import { enterHiddenScreen } from '../lib/hidden-contacts';
import { fileLook, folderTiles, folderTilesFor, gridEntries, inFolder, isPhoto, playKind, search, tabOf, type FileLook, type FileTab, type GridEntry } from '../lib/collection-view';
import { locale, t } from '../lib/i18n';
import { saveBytes, saveFile } from '../lib/save-file';
import { dropShared, handShared, type SharedFile } from '../lib/share-in';
import { isPicking } from '../lib/picking';
import { keepPrivate } from '../lib/screen-privacy';
import { SHELL } from '../lib/shell';
import {
  addFolder,
  addPlaylist,
  addToPlaylist,
  deleteFolder,
  deleteItems,
  loadCollection,
  moveItems,
  openThumb,
  renameFolder,
  renameItem,
  type Collection,
  type CollectionFolder,
  type CollectionItem,
} from '../lock/collection-data';
import { RELOCK_MS } from '../lock/chat-pin';
import { isPasswordLocked, loadLockConfig } from '../lock/config';
import { space, radius, withAlpha, type Colors } from '../theme/colors';
import { useColors, useStyles } from '../theme/context';

// The Collection: the open space's own photos, files and folders, or a hidden place's own (`hidden`),
// kept encrypted apart from the chats (lock/collection-data.ts). Tabs across the top: Photos as a
// grid by month, Videos, Music and the other Files as lists (lib/collection-view.ts tabOf), each with
// the folders that hold any of its files above it (Files the empty ones too), and Music its playlists
// (components/collection-playlist.tsx), which songs chosen or a song's menu are added to; Radio has
// the place's internet radio stations instead of files (components/collection-radio.tsx), and TV
// its TV channels, from IPTV lists (components/collection-tv.tsx). A tap opens one (components/
// collection-viewer.tsx); held down it starts choosing, to move, send or delete several; + brings
// in a photo from the camera or a file from the phone (lib/collection-import.ts), and deletes a
// photo or video picked from the gallery there when the owner chose so. While music of the
// Collection plays (lib/collection-play.ts), a bar at the bottom shows it. The screen keeps out of
// screenshots, and closes with the space: its keys go with it, and so do the links that let
// another app read a file (lib/collection-out.ts).
//
// In the desktop app (SHELL 'electron') + brings in a file from the computer, read a piece at a
// time as it is encrypted (lib/collection-import.web.ts); there is no camera, saving goes to the
// computer through its own save dialog, and nothing opens with another app. What is shown is held
// decrypted in the page's memory only (lib/collection-memory.ts): when the space locks or the panic
// button is pressed it all goes, the file open closes and the small pictures are opened again.
//
// In a browser (an iPhone's home-screen app too) and on Sailfish OS the same, with the browser's own
// file picker, each piece of the file read as it is encrypted (File.slice), its chunks kept in the
// browser's storage or the shell's folder. A browser that runs out of room keeps nothing of the
// file (lock/collection-data.ts CollectionStorageFullError). What is opened or saved out is held
// whole in memory, so there at most 256 MB (lib/collection-memory.ts).

const DESK = SHELL === 'electron';
// A browser, an iPhone's or a computer's: this device, whichever it is.
const BROWSER = Platform.OS === 'web' && !SHELL;
// Where picking a file may never say it was cancelled (Sailfish OS's browser engine): the screen
// shows its progress once the file is read, not while the picker is open.
const BUSY_AT_ONCE = Platform.OS !== 'web';
// The largest file saved out from here.
const MOST_SAVED_OUT = mostSavedOut();

// Radio: the place's internet radio stations (components/collection-radio.tsx), not files; TV its channels (components/collection-tv.tsx).
type Tab = FileTab | 'radio' | 'tv';
// A new playlist's `id` is 'add' when it takes the files being added to a playlist (listing).
type Naming = { what: 'folder' | 'rename-folder' | 'rename-file' | 'playlist'; id: string; text: string } | null;

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

// The small pictures shown, by file id, as addresses an Image can show: kept while the screen is
// open, so a grid scrolled again does not open them again, and let go of when it closes.
const thumbs = new Map<string, string>();
function dropThumbs() {
  for (const uri of thumbs.values()) releaseMemoryUri(uri);
  thumbs.clear();
}

function Thumb({ item, size }: { item: CollectionItem; size: number }) {
  const colors = useColors();
  const [uri, setUri] = useState<string | null>(thumbs.get(item.id) ?? null);
  useEffect(() => {
    if (uri || !item.thumb) return;
    let active = true;
    openThumb(item)
      .then((bytes) => {
        if (!bytes) return;
        const made = memoryUri(bytes, 'image/jpeg');
        thumbs.set(item.id, made);
        if (active) setUri(made);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [item.id]);
  return uri ? (
    <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" accessibilityIgnoresInvertColors />
  ) : (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', backgroundColor: withAlpha(colors.text, 0.08) }}>
      <PhotoIcon color={colors.textFaint} size={26} />
    </View>
  );
}

// Where the space has a password, the Collection asks for it again each time it opens, and once
// Erevos was away more than RELOCK_MS (the owner's word, 2026-11-16): until then nothing of it is
// read (components/collection-gate.tsx). Not in hidden chats, which close as soon as Erevos is
// left and are opened with their own PIN.
export default function CollectionScreen() {
  const { hidden } = useLocalSearchParams<{ hidden?: string }>();
  const [open, setOpen] = useState<boolean | null>(hidden === '1' ? true : null);
  useEffect(() => {
    if (hidden === '1') return;
    let live = true;
    loadLockConfig().then(
      (config) => live && setOpen((was) => was ?? !isPasswordLocked(config)),
      () => live && setOpen((was) => was ?? false),
    );
    return () => {
      live = false;
    };
  }, [hidden]);
  useEffect(() => {
    if (hidden === '1') return;
    let left = 0;
    let picked = false;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        left ||= Date.now();
        picked ||= isPicking();
        return;
      }
      const away = left ? Date.now() - left : 0;
      // Away to take a photo or pick a file for the Collection (lib/picking.ts): not left, however long.
      const wasPicking = picked || isPicking();
      left = 0;
      picked = false;
      if (away > RELOCK_MS && !wasPicking) loadLockConfig().then((config) => isPasswordLocked(config) && setOpen(false), () => undefined);
    });
    return () => subscription.remove();
  }, [hidden]);
  if (open === null) return null;
  if (!open) {
    return (
      <CollectionGate
        onOpen={() => setOpen(true)}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
      />
    );
  }
  return <OpenCollection />;
}

function OpenCollection() {
  const colors = useColors();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { hidden, to, camera } = useLocalSearchParams<{ hidden?: string; to?: string; camera?: string }>();
  const inHidden = hidden === '1';
  // Opened from a chat's "+" (app/chat.tsx) to pick photos or files for it: a tap chooses, and Send
  // hands them to that chat, which sends them as it shows again (lib/share-in.ts).
  const pickFor = typeof to === 'string' && /^contact:[0-9a-f]{64}$/.test(to) ? to : null;
  const handing = useRef(false);
  const place = useCollectionPlace(inHidden);
  // Counted among the screens over the hidden chats, to go back to them from a picker opened here.
  useEffect(() => (inHidden ? enterHiddenScreen() : undefined), [inHidden]);
  const [data, setData] = useState<Collection | null>(null);
  const [tab, setTab] = useState<Tab>('photos');
  const [folder, setFolder] = useState<string>('');
  const [query, setQuery] = useState<string | null>(null);
  const [chosen, setChosen] = useState<ReadonlySet<string>>(new Set());
  const [adding, setAdding] = useState(false);
  // Erevos's own camera open, taking straight into the Collection.
  const [filming, setFilming] = useState(false);
  // Opened by the Camera's icon or the Camera shortcut on Erevos's icon (modules/erevos-collection,
  // CameraOpenActivity.kt): the camera at once, once the Collection is open. Taken off the address
  // so going back to the Collection does not open it again.
  useEffect(() => {
    if (camera !== '1' || inHidden || !CAN_TAKE_PHOTO) return;
    setFilming(true);
    router.setParams({ camera: undefined });
  }, [camera, inHidden]);
  // The photo being turned and cut.
  const [editing, setEditing] = useState<CollectionItem | null>(null);
  const [moving, setMoving] = useState<string[] | null>(null);
  const [naming, setNaming] = useState<Naming>(null);
  const [menu, setMenu] = useState<{ folder?: CollectionFolder; item?: CollectionItem; top?: boolean } | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const [busy, setBusy] = useState<{ done: number; count: number } | null>(null);
  const [note, setNote] = useState('');
  // Counts each time what was held in memory went (the space locked), so the small pictures open again.
  const [fresh, setFresh] = useState(0);
  const player = usePlayer();
  const [nowPlaying, setNowPlaying] = useState(false);
  // The playlist open, by id; and the files being added to a playlist, while its sheet shows.
  const [openList, setOpenList] = useState<string | null>(null);
  const [listing, setListing] = useState<string[] | null>(null);
  const [addingStation, setAddingStation] = useState(false);
  const [addingChannels, setAddingChannels] = useState(false);
  // The list playing may keep where it got to in this place again, once it is open.
  useEffect(() => placeShown(place), [place]);
  const musicBar = !!player?.active && !player.video;

  // Always out of screenshots and the recent apps preview while it is shown.
  useEffect(() => {
    keepPrivate('collection', true);
    return () => keepPrivate('collection', false);
  }, []);
  // Everything held in memory went (the space locked, in the desktop app): the file open closes.
  useEffect(
    () =>
      onCollectionMemoryDropped(() => {
        thumbs.clear();
        setViewing(null);
        setFresh((n) => n + 1);
      }),
    [],
  );
  // The pictures, and the links that let other apps read files, go as the screen closes.
  useEffect(
    () => () => {
      dropThumbs();
      dropOpened();
    },
    [],
  );

  const reload = useCallback(async () => {
    if (!place) {
      setData(null);
      dropThumbs();
      return;
    }
    try {
      setData(await loadCollection(place));
    } catch (error) {
      setNote(errorText(error));
    }
  }, [place]);
  useEffect(() => {
    void reload();
  }, [reload]);

  const searching = query !== null;
  const choosing = chosen.size > 0;
  const there: Collection = data ?? { items: [], folders: [], gone: [], backup: true };
  const folderNow = there.folders.find((f) => f.id === folder);
  // A folder deleted, or moved out from under the screen, is the top again.
  useEffect(() => {
    if (data && folder && !folderNow) setFolder('');
  }, [data, folder, folderNow]);

  const shownItems = useMemo(() => {
    const items = searching ? search(there.items, query ?? '') : inFolder(there, folder);
    return items;
  }, [data, folder, query]);
  const photos = useMemo(() => shownItems.filter(isPhoto), [shownItems]);
  const files = useMemo(() => shownItems.filter((i) => tabOf(i) === 'files'), [shownItems]);
  const videos = useMemo(() => shownItems.filter((i) => tabOf(i) === 'videos'), [shownItems]);
  const music = useMemo(() => shownItems.filter((i) => tabOf(i) === 'music'), [shownItems]);
  // The files of the tab shown, which a tap opens among.
  const listed = tab === 'photos' ? photos : tab === 'videos' ? videos : tab === 'music' ? music : tab === 'files' ? files : [];
  const entries = useMemo(() => gridEntries(photos), [photos]);
  const tiles = useMemo(() => (tab === 'radio' || tab === 'tv' ? [] : folderTilesFor(there, tab)), [data, tab]);
  const allFolders = useMemo(() => folderTiles(there), [data]);
  const side = Math.floor((Math.min(width, 760) - 2) / 3);

  // Back leaves the choosing, the search, the folder, then the screen.
  const back = useCallback(() => {
    if (choosing) setChosen(new Set());
    else if (searching) setQuery(null);
    else if (folder) setFolder('');
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [choosing, searching, folder]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (viewing !== null || adding || moving || naming || menu || openList || listing || addingStation || addingChannels) return false;
      if (choosing || searching || folder) {
        back();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [back, choosing, searching, folder, viewing, adding, moving, naming, menu, openList, listing, addingStation, addingChannels]);

  // Runs a change to the Collection, then reads it again; its failure is said.
  async function change(run: () => Promise<unknown>) {
    try {
      await run();
    } catch (error) {
      setNote(errorText(error));
    }
    await reload();
  }

  async function bringIn(get: (progress: (done: number, count: number) => void) => Promise<CollectionItem | null>) {
    if (!place || busy) return;
    setAdding(false);
    setNote('');
    if (BUSY_AT_ONCE) setBusy({ done: 0, count: 1 });
    try {
      const added = await get((done, count) => setBusy({ done, count }));
      if (added) setTab(tabOf(added));
    } catch (error) {
      setNote(t('Not added. {error}', { error: errorText(error) }));
    }
    setBusy(null);
    await reload();
  }

  const toggle = (id: string) =>
    setChosen((was) => {
      const next = new Set(was);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  function open(item: CollectionItem) {
    if (choosing || pickFor) {
      toggle(item.id);
      return;
    }
    // A photo opens among the photos shown; any other file on its own.
    setViewing(listed.findIndex((i) => i.id === item.id));
  }

  async function removeItems(ids: string[]) {
    if (!place) return;
    if (!(await confirm(t('Delete the chosen files?'), t('They are deleted from the Collection for good.'), t('Delete')))) return;
    setChosen(new Set());
    await change(() => deleteItems(place, ids));
  }

  // A hidden place's files go to that place's own chats only, through a picker of their own.
  function send(ids: string[]) {
    setViewing(null);
    setChosen(new Set());
    if (pickFor) {
      void sendToChat(pickFor, ids);
      return;
    }
    router.push(`${inHidden ? '/collection-send' : '/share'}?collection=${ids.join(',')}`);
  }

  // Plain copies, or sources read from the encrypted chunks, handed to the chat that asked, which
  // deletes each as it sends it; then back to that chat.
  async function sendToChat(chat: string, ids: string[]) {
    const items = there.items.filter((i) => ids.includes(i.id));
    if (items.length === 0 || handing.current) return;
    handing.current = true;
    setNote('');
    const copies: SharedFile[] = [];
    try {
      for (const item of items) copies.push(await copyToSend(item));
    } catch (error) {
      copies.forEach(dropShared);
      handing.current = false;
      setNote(errorText(error));
      return;
    }
    handShared(chat, copies);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  // What leaves the Collection: a photo without where and when it was taken (unless the place
  // keeps them, exportWhole), and the warning, said with the question, when what goes as it is
  // says where it was taken.
  async function readyToLeave(item: CollectionItem): Promise<{ cleaned: Uint8Array | null; words: string }> {
    const cleaned = there.exportWhole ? null : await cleanedPhoto(item);
    if (cleaned) return { cleaned, words: t('Where and when the photo was taken, and the phone, are taken out of this copy.') };
    return { cleaned: null, words: (await itemPlace(item)) === 'yes' ? t('It says where it was taken, and that goes with it.') : '' };
  }

  async function saveToPhone(item: CollectionItem) {
    if (item.file.size > MOST_SAVED_OUT) {
      setNote(new TooLargeToSaveError().message);
      return;
    }
    const { cleaned, words } = await readyToLeave(item);
    // What is saved is outside the Collection, in the open.
    const asked = t('The file leaves the Collection without encryption, and other apps will see it. Continue?');
    if (!(await choose(DESK ? t('Save to the computer?') : BROWSER ? t('Save to this device?') : t('Save to the phone?'), words ? `${words} ${asked}` : asked, t('Cancel'), t('Save')))) return;
    try {
      const saved = cleaned ? await saveBytes(item.file.name, item.file.mime, cleaned) : await saveFile(item.file);
      if (saved) setNote(t('Saved as {name}. It is outside Erevos now: anyone who has the folder can read it.', { name: saved }));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  async function openWith(item: CollectionItem) {
    const { cleaned, words } = await readyToLeave(item);
    const asked = t('The file goes to another app, outside the Collection and without encryption, and that app may keep a copy of it. Continue?');
    if (!(await choose(t('Open with another app?'), words ? `${words} ${asked}` : asked, t('Cancel'), t('Open')))) return;
    try {
      if (cleaned) await openBytesWithOtherApp(item, cleaned);
      else await openWithOtherApp(item);
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // A photo turned and cut is kept as a new photo next to it; the viewer shows the new one.
  async function saveEdited(item: CollectionItem, turn: Turn, cut: Cut) {
    if (!place) return;
    try {
      await editPhoto(place, item, turn, cut);
      setEditing(null);
      setViewing(null);
      setNote(t('Saved as a new photo. The one it came from stays as it was.'));
    } catch (error) {
      setEditing(null);
      setNote(errorText(error));
    }
    await reload();
  }

  async function deleteOne(item: CollectionItem) {
    if (!place) return;
    if (!(await confirm(t('Delete this file?'), t('It is deleted from the Collection for good.'), t('Delete')))) return;
    await change(() => deleteItems(place, [item.id]));
  }

  async function saveName() {
    if (!place || !naming) return;
    const { what, id, text } = naming;
    setNaming(null);
    await change(async () => {
      if (what === 'playlist') {
        // Made from Add to a playlist: the files go into it; otherwise it opens, empty.
        const ids = id === 'add' ? (listing ?? []) : [];
        setListing(null);
        setChosen(new Set());
        const made = await addPlaylist(place, text, ids);
        if (id !== 'add') setOpenList(made.id);
      } else if (what === 'folder') await addFolder(place, text);
      else if (what === 'rename-folder') await renameFolder(place, id, text);
      else await renameItem(place, id, text);
    });
  }

  async function moveTo(to: string) {
    if (!place || !moving) return;
    const ids = moving;
    setMoving(null);
    setChosen(new Set());
    await change(() => moveItems(place, ids, to));
  }

  // A folder made while choosing where to move to takes the files into it.
  async function newFolderForMove(text: string) {
    if (!place || !moving) return;
    const ids = moving;
    setMoving(null);
    setNaming(null);
    setChosen(new Set());
    await change(async () => {
      const made = await addFolder(place, text);
      await moveItems(place, ids, made.id);
    });
  }

  async function addToList(id: string) {
    if (!place || !listing) return;
    const ids = listing;
    setListing(null);
    setChosen(new Set());
    await change(() => addToPlaylist(place, id, ids));
  }

  async function removeFolder(f: CollectionFolder) {
    if (!place) return;
    if (!(await confirm(t('Delete the folder “{name}”?', { name: f.name }), t('Its files stay in the Collection, outside any folder.'), t('Delete')))) return;
    await change(() => deleteFolder(place, f.id));
  }

  if (inHidden && !place) {
    return (
      <View style={[styles.screen, styles.closed, { paddingTop: insets.top + space.xl }]}>
        <Text tone="muted">{t('The hidden chats are closed.')}</Text>
        <Button title={t('Back')} kind="secondary" compact onPress={back} />
      </View>
    );
  }
  if (!CAN_COLLECT) {
    return (
      <View style={[styles.screen, styles.closed, { paddingTop: insets.top + space.xl }]}>
        <Text tone="muted">{t('The Collection is on the phone only.')}</Text>
      </View>
    );
  }

  const header = choosing ? (
    <View style={styles.bar}>
      <IconTap label={t('Cancel')} onPress={() => setChosen(new Set())}>
        <CloseIcon color={colors.text} size={22} />
      </IconTap>
      <Text variant="heading" style={styles.grow}>
        {t('{n} selected', { n: chosen.size })}
      </Text>
      <Pressable onPress={() => setChosen(new Set(listed.map((i) => i.id)))} accessibilityRole="button" hitSlop={8}>
        <Text variant="label" color={colors.primary}>
          {t('All')}
        </Text>
      </Pressable>
    </View>
  ) : searching ? (
    <View style={styles.bar}>
      <IconTap label={t('Back')} onPress={back}>
        <BackIcon color={colors.text} size={24} />
      </IconTap>
      <View style={styles.grow}>
        <Input value={query ?? ''} onChangeText={setQuery} placeholder={t('Search the Collection')} accessibilityLabel={t('Search the Collection')} autoFocus autoCorrect={false} />
      </View>
    </View>
  ) : (
    <View style={styles.bar}>
      <IconTap label={t('Back')} onPress={back}>
        <BackIcon color={colors.text} size={24} />
      </IconTap>
      <View style={styles.grow}>
        <Text variant="heading" numberOfLines={1}>
          {folderNow ? folderNow.name : t('Collection')}
        </Text>
        <Text variant="caption" tone="muted">
          {pickFor ? t('Tap what to send, then Send') : t('Encrypted collection')}
        </Text>
      </View>
      <IconTap label={folderNow ? t('Folder options') : t('More')} onPress={() => setMenu(folderNow ? { folder: folderNow } : { top: true })}>
        <MoreIcon color={colors.text} size={20} />
      </IconTap>
      <IconTap label={t('Search')} onPress={() => setQuery('')}>
        <SearchIcon color={colors.text} size={20} />
      </IconTap>
    </View>
  );

  const top = (
    <View>
      {!folder && !searching && tiles.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiles}>
          {tiles.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => (choosing ? undefined : setFolder(f.id))}
              onLongPress={() => (choosing ? undefined : setMenu({ folder: f }))}
              accessibilityRole="button"
              accessibilityLabel={`${f.name}, ${f.count}`}
              style={({ pressed }) => [styles.tile, pressed && { opacity: 0.7 }]}
            >
              <FolderIcon color={colors.primary} size={22} />
              <Text variant="label" numberOfLines={1}>
                {f.name}
              </Text>
              <Text variant="caption" tone="muted">
                {f.count}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {tab === 'music' && !folder && !searching ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiles}>
          <Pressable
            onPress={() => (choosing ? undefined : setNaming({ what: 'playlist', id: '', text: '' }))}
            accessibilityRole="button"
            accessibilityLabel={t('New playlist')}
            style={({ pressed }) => [styles.tile, pressed && { opacity: 0.7 }]}
          >
            <PlusIcon color={colors.primary} size={22} />
            <Text variant="label" numberOfLines={1}>
              {t('New playlist')}
            </Text>
          </Pressable>
          {(there.playlists ?? []).map((l) => (
            <Pressable
              key={l.id}
              onPress={() => (choosing ? undefined : setOpenList(l.id))}
              accessibilityRole="button"
              accessibilityLabel={`${l.name}, ${l.items.length}`}
              style={({ pressed }) => [styles.tile, pressed && { opacity: 0.7 }]}
            >
              <MusicIcon color={colors.primary} size={22} />
              <Text variant="label" numberOfLines={1}>
                {l.name}
              </Text>
              <Text variant="caption" tone="muted">
                {l.items.length}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} keyboardShouldPersistTaps="handled">
        <Chip label={t('Photos')} count={photos.length} selected={tab === 'photos'} onPress={() => setTab('photos')} />
        <Chip label={t('Videos')} count={videos.length} selected={tab === 'videos'} onPress={() => setTab('videos')} />
        <Chip label={t('Music')} count={music.length} selected={tab === 'music'} onPress={() => setTab('music')} />
        <Chip label={t('Radio')} count={(there.stations ?? []).length} selected={tab === 'radio'} onPress={() => setTab('radio')} />
        <Chip label={t('TV')} count={(there.channels ?? []).length} selected={tab === 'tv'} onPress={() => setTab('tv')} />
        <Chip label={t('Files')} count={files.length} selected={tab === 'files'} onPress={() => setTab('files')} />
      </ScrollView>
      {note ? (
        <Pressable onPress={() => setNote('')} accessibilityRole="button" accessibilityLabel={t('Close')}>
          <Text variant="caption" color={colors.warning} style={styles.note}>
            {note}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  const empty = (text: string) => (
    <Text tone="muted" style={styles.empty}>
      {searching ? t('Nothing found.') : text}
    </Text>
  );

  const renderEntry = ({ item: entry }: { item: GridEntry }) =>
    entry.kind === 'month' ? (
      <Text variant="overline" tone="muted" style={styles.month}>
        {new Date(entry.at).toLocaleDateString(locale(), { month: 'long', year: 'numeric' })}
      </Text>
    ) : (
      <View style={styles.gridRow}>
        {entry.items.map((item) => {
          const on = chosen.has(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => open(item)}
              onLongPress={() => toggle(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.file.name}
              accessibilityState={{ selected: on }}
              style={[styles.cell, { width: side, height: side }, on && { borderColor: colors.primary, borderWidth: 3 }]}
            >
              <Thumb item={item} size={on ? side - 6 : side} />
              {choosing ? (
                <View style={[styles.mark, on && { backgroundColor: colors.primary, borderColor: colors.primary }]}>{on ? <CheckIcon color={colors.onPrimary} size={14} /> : null}</View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    );

  const bottomRoom = insets.bottom + 96;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header}
      {tab === 'photos' ? (
        <FlatList
          key={`photos-${fresh}`}
          data={entries}
          keyExtractor={(e) => (e.kind === 'month' ? e.month : e.key)}
          renderItem={renderEntry}
          ListHeaderComponent={top}
          ListEmptyComponent={empty(CAN_TAKE_PHOTO ? t('No photos yet. Tap + to take one.') : DESK ? t('No photos yet. Click + to add one.') : t('No photos yet. Add one with +.'))}
          contentContainerStyle={{ paddingBottom: bottomRoom }}
          keyboardShouldPersistTaps="handled"
          windowSize={7}
          initialNumToRender={8}
        />
      ) : tab === 'radio' ? (
        <StationsList
          header={top}
          stations={searching ? [] : (there.stations ?? [])}
          place={place}
          hidden={inHidden}
          options={{ showTitle: there.showTitle === true, stopOnLock: there.stopOnLock === true, tor: there.playTor === true }}
          onAdd={() => setAddingStation(true)}
          onChanged={() => void reload()}
          onPlaying={() => setNowPlaying(true)}
          bottom={bottomRoom}
        />
      ) : tab === 'tv' ? (
        <ChannelsList
          header={top}
          channels={searching ? [] : (there.channels ?? [])}
          place={place}
          hidden={inHidden}
          options={{ showTitle: there.showTitle === true, stopOnLock: there.stopOnLock === true, tor: there.playTor === true }}
          showLogos={there.showLogos === true}
          tor={there.listsTor === true}
          onAdd={() => setAddingChannels(true)}
          onChanged={() => void reload()}
          bottom={bottomRoom}
        />
      ) : (
        <FlatList
          data={listed}
          keyExtractor={(i) => i.id}
          ListHeaderComponent={top}
          ListEmptyComponent={empty(
            tab === 'videos'
              ? t('No videos yet. Add one with +.')
              : tab === 'music'
                ? t('No music yet. Add some with +.')
                : DESK
                  ? t('No files yet. Click + to add one.')
                  : BROWSER
                    ? t('No files yet. Add one with +.')
                    : t('No files yet. Tap + to add one.'),
          )}
          contentContainerStyle={{ paddingBottom: bottomRoom }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <FileRow
              item={item}
              on={chosen.has(item.id)}
              choosing={choosing}
              onPress={() => open(item)}
              onLongPress={() => toggle(item.id)}
              onMenu={() => setMenu({ item })}
              colors={colors}
            />
          )}
        />
      )}

      {busy ? (
        <View style={[styles.busy, { bottom: insets.bottom + 90 }]}>
          <Text variant="label">{busy.count > 1 ? t('Encrypting… {done} of {count}', { done: busy.done, count: busy.count }) : t('Encrypting…')}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round((busy.done / Math.max(1, busy.count)) * 100)}%` }]} />
          </View>
        </View>
      ) : null}

      {!choosing && musicBar ? (
        <View style={{ paddingBottom: insets.bottom }}>
          <NowPlaying state={player} onOpen={() => setNowPlaying(true)} />
        </View>
      ) : null}

      {choosing ? (
        <View style={[styles.actions, { paddingBottom: Math.max(space.md, insets.bottom) }]}>
          {pickFor ? null : (
            <ActionTile label={t('Move')} onPress={() => setMoving([...chosen])}>
              <MoveIcon color={colors.text} size={22} />
            </ActionTile>
          )}
          {tab === 'music' && !pickFor ? (
            <ActionTile label={t('Playlist')} onPress={() => setListing([...chosen])}>
              <MusicIcon color={colors.text} size={22} />
            </ActionTile>
          ) : null}
          <ActionTile label={t('Send')} onPress={() => send([...chosen])}>
            <SendIcon color={colors.text} cut={colors.sheet} size={22} />
          </ActionTile>
          {pickFor ? null : (
            <ActionTile label={t('Delete')} danger onPress={() => void removeItems([...chosen])}>
              <TrashIcon color={colors.danger} size={22} />
            </ActionTile>
          )}
        </View>
      ) : (
        <Pressable
          onPress={() => (tab === 'radio' ? setAddingStation(true) : tab === 'tv' ? setAddingChannels(true) : setAdding(true))}
          accessibilityRole="button"
          accessibilityLabel={tab === 'radio' ? t('Add a station') : tab === 'tv' ? t('Add channels') : t('Add to the Collection')}
          style={({ pressed }) => [styles.fab, { bottom: Math.max(space.lg, insets.bottom + space.sm) + (musicBar ? 72 : 0) }, pressed && { opacity: 0.85 }]}
        >
          <PlusIcon color={colors.onPrimary} size={26} />
        </Pressable>
      )}

      <Sheet visible={adding} onClose={() => setAdding(false)} title={t('Add to the Collection')}>
        {CAN_TAKE_PHOTO ? (
          <AddRow
            icon={<CameraIcon color={colors.primary} size={22} />}
            title={t('Camera')}
            text={t('Photos and videos straight here, with Erevos’s own camera: no other app sees them, and they never go to the gallery.')}
            onPress={() => {
              setAdding(false);
              setNote('');
              setFilming(true);
            }}
            colors={colors}
          />
        ) : null}
        {CAN_PICK_GALLERY ? (
          <AddRow
            icon={<PhotoIcon color={colors.primary} size={22} />}
            title={t('From the gallery')}
            text={there.deleteOriginals ? t('Many photos and videos at once, encrypted, then deleted from the gallery.') : t('Many photos and videos at once, encrypted as they come in.')}
            onPress={() => void bringIn((p) => importFromFiles(place!, folder, p, { deleteOriginal: there.deleteOriginals === true, told: setNote, gallery: true }))}
            colors={colors}
          />
        ) : null}
        <AddRow icon={<FileIcon color={colors.primary} size={22} />} title={DESK ? t('From the computer’s files') : BROWSER ? t('From this device’s files') : t('From the phone’s files')} text={t('Photos and files, encrypted as they come in.')} onPress={() => void bringIn((p) => importFromFiles(place!, folder, p, { deleteOriginal: there.deleteOriginals === true, told: setNote }))} colors={colors} />
        <AddRow
          icon={<FolderIcon color={colors.primary} size={22} />}
          title={t('New folder')}
          onPress={() => {
            setAdding(false);
            setNaming({ what: 'folder', id: '', text: '' });
          }}
          colors={colors}
        />
      </Sheet>

      <Sheet visible={moving !== null && naming === null} onClose={() => setMoving(null)} title={t('Move to…')}>
        <AddRow icon={<FolderIcon color={colors.textMuted} size={22} />} title={t('No folder')} text={t('At the top of the Collection')} onPress={() => void moveTo('')} colors={colors} />
        {allFolders.map((f) => (
          <AddRow key={f.id} icon={<FolderIcon color={colors.primary} size={22} />} title={f.name} onPress={() => void moveTo(f.id)} colors={colors} />
        ))}
        <AddRow icon={<FolderIcon color={colors.primary} size={22} />} title={t('New folder')} onPress={() => setNaming({ what: 'folder', id: 'move', text: '' })} colors={colors} />
      </Sheet>

      <Sheet
        visible={naming !== null}
        onClose={() => setNaming(null)}
        title={naming?.what === 'playlist' ? t('New playlist') : naming?.what === 'folder' ? t('New folder') : naming?.what === 'rename-folder' ? t('Rename the folder') : t('Rename')}
      >
        <Input
          value={naming?.text ?? ''}
          onChangeText={(text) => setNaming((n) => (n ? { ...n, text } : n))}
          placeholder={naming?.what === 'playlist' ? t('Playlist name') : naming?.what === 'rename-file' ? t('Name') : t('Folder name')}
          accessibilityLabel={naming?.what === 'playlist' ? t('Playlist name') : naming?.what === 'rename-file' ? t('Name') : t('Folder name')}
          autoFocus
          maxLength={60}
          onSubmitEditing={() => (naming?.id === 'move' && naming.what === 'folder' ? void newFolderForMove(naming.text) : void saveName())}
        />
        <Button
          title={t('Save')}
          disabled={!naming?.text.trim()}
          onPress={() => (naming?.id === 'move' && naming.what === 'folder' ? void newFolderForMove(naming.text) : void saveName())}
        />
      </Sheet>

      <Sheet visible={menu !== null} onClose={() => setMenu(null)} title={menu?.folder?.name ?? menu?.item?.file.name}>
        {menu?.folder || menu?.top ? (
          <AddRow
            icon={<GearIcon color={colors.primary} size={22} />}
            title={t('Collection settings')}
            onPress={() => {
              setMenu(null);
              router.push(inHidden ? '/collection-settings?hidden=1' : '/collection-settings');
            }}
            colors={colors}
          />
        ) : null}
        {menu?.folder ? (
          <>
            <AddRow
              icon={<FolderIcon color={colors.primary} size={22} />}
              title={t('Rename the folder')}
              onPress={() => {
                const f = menu.folder!;
                setMenu(null);
                setNaming({ what: 'rename-folder', id: f.id, text: f.name });
              }}
              colors={colors}
            />
            <AddRow
              icon={<TrashIcon color={colors.danger} size={22} />}
              title={t('Delete the folder')}
              onPress={() => {
                const f = menu.folder!;
                setMenu(null);
                void removeFolder(f);
              }}
              colors={colors}
            />
          </>
        ) : menu?.item ? (
          <>
            <AddRow
              icon={<MoveIcon color={colors.primary} size={22} />}
              title={t('Move')}
              onPress={() => {
                const i = menu.item!;
                setMenu(null);
                setMoving([i.id]);
              }}
              colors={colors}
            />
            {playKind(menu.item) === 'audio' ? (
              <AddRow
                icon={<MusicIcon color={colors.primary} size={22} />}
                title={t('Add to a playlist')}
                onPress={() => {
                  const i = menu.item!;
                  setMenu(null);
                  setListing([i.id]);
                }}
                colors={colors}
              />
            ) : null}
            <AddRow
              icon={<SendIcon color={colors.primary} cut={colors.popover} size={22} />}
              title={t('Send')}
              onPress={() => {
                const i = menu.item!;
                setMenu(null);
                send([i.id]);
              }}
              colors={colors}
            />
            <AddRow
              icon={<FileIcon color={colors.primary} size={22} />}
              title={t('Rename')}
              onPress={() => {
                const i = menu.item!;
                setMenu(null);
                setNaming({ what: 'rename-file', id: i.id, text: i.file.name });
              }}
              colors={colors}
            />
            <AddRow
              icon={<TrashIcon color={colors.danger} size={22} />}
              title={t('Delete')}
              onPress={() => {
                const i = menu.item!;
                setMenu(null);
                void removeItems([i.id]);
              }}
              colors={colors}
            />
          </>
        ) : null}
      </Sheet>

      <CollectionViewer
        items={listed}
        start={viewing}
        canSend
        onClose={() => setViewing(null)}
        onSend={(item) => send([item.id])}
        onSave={(item) => void saveToPhone(item)}
        onDelete={(item) => void deleteOne(item)}
        onOpenWith={(item) => void openWith(item)}
        onEdit={CAN_EDIT ? setEditing : undefined}
        playOptions={{ showTitle: there.showTitle === true, stopOnLock: there.stopOnLock === true, place }}
      />
      <CollectionEdit item={editing} onClose={() => setEditing(null)} onSave={saveEdited} />
      {CAN_TAKE_PHOTO ? (
        <ErevosCamera
          visible={filming}
          place={place}
          folder={folder}
          onClose={() => {
            setFilming(false);
            void reload();
          }}
          onAdded={(item) => setTab(tabOf(item))}
        />
      ) : null}
      <AddToPlaylistSheet
        visible={listing !== null && naming === null}
        playlists={there.playlists ?? []}
        onPick={(id) => void addToList(id)}
        onNew={() => setNaming({ what: 'playlist', id: 'add', text: '' })}
        onClose={() => setListing(null)}
      />
      <PlaylistScreen
        playlist={there.playlists?.find((l) => l.id === openList) ?? null}
        collection={there}
        place={place}
        options={{ showTitle: there.showTitle === true, stopOnLock: there.stopOnLock === true }}
        onClose={() => setOpenList(null)}
        onChanged={() => void reload()}
        onPlaying={() => {
          setOpenList(null);
          setNowPlaying(true);
        }}
      />
      <AddStationSheet visible={addingStation} place={place} tor={there.listsTor === true} playTor={there.playTor === true} onClose={() => setAddingStation(false)} onAdded={() => void reload()} />
      <AddChannelsSheet visible={addingChannels} place={place} tor={there.listsTor === true} playTor={there.playTor === true} onClose={() => setAddingChannels(false)} onAdded={() => void reload()} />
      <NowPlayingScreen visible={nowPlaying} onClose={() => setNowPlaying(false)} />
    </View>
  );
}

function IconTap({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => [{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.6 }]}>
      {children}
    </Pressable>
  );
}

function ActionTile({ label, onPress, danger, children }: { label: string; onPress: () => void; danger?: boolean; children: ReactNode }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [{ flex: 1, alignItems: 'center', gap: 4 }, pressed && { opacity: 0.6 }]}>
      {children}
      <Text variant="caption" color={danger ? colors.danger : colors.textMuted}>
        {label}
      </Text>
    </Pressable>
  );
}

function AddRow({ icon, title, text, onPress, colors }: { icon: ReactNode; title: string; text?: string; onPress: () => void; colors: Colors }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm }, pressed && { opacity: 0.6 }]}
    >
      <View style={{ width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: withAlpha(colors.primary, 0.14) }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{title}</Text>
        {text ? (
          <Text variant="caption" tone="muted">
            {text}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// What colours a file's icon: PDFs and text warm, the others quiet.
function lookColor(look: FileLook, colors: Colors): string {
  return look === 'pdf' ? colors.danger : look === 'text' ? colors.primary : look === 'archive' ? colors.success : colors.textMuted;
}

function FileRow({ item, on, choosing, onPress, onLongPress, onMenu, colors }: { item: CollectionItem; on: boolean; choosing: boolean; onPress: () => void; onLongPress: () => void; onMenu: () => void; colors: Colors }) {
  const tint = lookColor(fileLook(item), colors);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, backgroundColor: on ? withAlpha(colors.primary, 0.14) : 'transparent' }, pressed && { opacity: 0.7 }]}
    >
      <View style={{ width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: withAlpha(tint, 0.16) }}>
        {on ? <CheckIcon color={colors.primary} size={20} /> : playKind(item) === 'audio' ? <MusicIcon color={tint} size={22} /> : playKind(item) === 'video' ? <VideoIcon color={tint} size={22} /> : <FileIcon color={tint} size={22} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {item.file.name}
        </Text>
        <Text variant="caption" tone="muted">
          {fileSize(item.file.size)} · {addedText(item.added)}
        </Text>
      </View>
      {!choosing ? (
        <Pressable onPress={onMenu} accessibilityRole="button" accessibilityLabel={t('More')} hitSlop={8}>
          <MoreIcon color={colors.textMuted} size={20} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.ground },
    closed: { alignItems: 'center', gap: space.md, padding: space.xl },
    grow: { flex: 1 },
    bar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm, minHeight: 56 },
    tiles: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.sm },
    tile: { width: 112, gap: 2, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    chips: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.sm },
    note: { paddingHorizontal: space.lg, paddingBottom: space.sm },
    empty: { textAlign: 'center', padding: space.xl },
    month: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm },
    gridRow: { flexDirection: 'row', gap: 1, marginBottom: 1, paddingHorizontal: 0 },
    cell: { overflow: 'hidden', borderColor: 'transparent', borderWidth: 0 },
    mark: { position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
    busy: { position: 'absolute', left: space.lg, right: 96, gap: 6, padding: space.md, borderRadius: radius.md, backgroundColor: colors.popover, borderWidth: 1, borderColor: colors.border },
    track: { height: 4, borderRadius: 2, backgroundColor: withAlpha(colors.text, 0.12), overflow: 'hidden' },
    fill: { height: 4, backgroundColor: colors.primary },
    fab: { position: 'absolute', right: space.lg, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, boxShadow: '0px 4px 12px rgba(0,0,0,0.35)' },
    actions: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingTop: space.md, backgroundColor: colors.sheet, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  });
