// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, Stack, useGlobalSearchParams, useRootNavigationState, usePathname, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Linking, Platform, View } from 'react-native';

import { AlertHost } from '../components/alert-host';
import { CallHost, watchCalls } from '../components/call-host';
import { SignalCallHost } from '../components/signal-call';
import { TelegramCallHost } from '../components/telegram-call';
import { ErevosCamera } from '../components/erevos-camera';
import { HiddenRingHost } from '../components/hidden-ring-screen';
import { ScreenBackdrop, useBackdropSpec } from '../components/backdrop';
import { KeyboardProvider } from '../components/keyboard';
import { SwipeBack } from '../components/swipe-back';
import { Button, Text } from '../components/ui';
import { startBackground, syncBootStart } from '../lib/background';
import { CHECK_MS as BACKUP_CHECK_MS, checkAutoBackup, runAutoBackup } from '../lib/backup-folder';
import { forgetBackupMaking } from '../lib/backup-making';
import { currentCall } from '../lib/call';
import { endCall, onCallChange } from '../lib/calls';
import { forgetOffered } from '../lib/contact-code';
import { armCurtain, awayClock, awayLong, CURTAIN_END, curtainBack, curtainDown, liftCurtain, lowerCurtain, type CurtainBack } from '../lib/curtain';
import { cryptoReady, setupCrypto } from '../lib/crypto-setup';
import { forgetLinks } from '../lib/devices';
import { directOf, setDirect } from '../lib/direct';
import { endGroupCall } from '../lib/group-calls';
import { hiddenAnswerEndsAt, hiddenRingHoldsLock, onHiddenRingingChange } from '../lib/hidden-ring';
import { tellShareTexts } from '../lib/share-texts';
import { lang as currentLang, loadLang, t, useLang, type Lang } from '../lib/i18n';
import { iconNumberOn, onIconNumberChange } from '../lib/icon-number';
import { startIntegrityAlarm } from '../lib/integrity';
import { startNearbyLinks } from '../lib/nearby-links';
import { startSmsWay } from '../lib/sms-way';
import { dropLink, hrefLink, keepLink, linkHref, linkMove, linkParts, lockingKeepsLink, onLinkHeld, ONLY_SCREENS, onlyPartOf, peekLink, RELOCK_MS, screenLink, screenParams, setupKeepsLink, takeLink, type OnlyPart } from '../lib/open-link';
import { phoneOpensLocked } from '../lib/phone-open';
import { forgetHistory } from '../lib/phone-log';
import { noticeLanguage, noticeSeen } from '../lib/push-notice';
import { refreshKnownNames, watchKnownNames } from '../lib/known-names';
import { forgetSpaceMover } from '../lib/queue-move';
import { setAppShown, startReceiver } from '../lib/receiver';
import { placeShown, spaceShown } from '../lib/last-seen';
import { onHiddenPlaceChange, openHiddenPlace } from '../lib/hidden-contacts';
import { ownerTouched } from '../lib/safety';
import { awakeWhile } from '../lib/sleep-look';
import { stopReleases, watchReleases } from '../lib/release-look';
import { startSmsLater } from '../lib/sms-later';
import { startChatLater } from '../lib/chat-later';
import { startSmsNotices } from '../lib/sms-notices';
import { clearCameraCache } from '../lib/camera-cache';
import { takeDrops } from '../lib/camera-drops';
import { spaceCollection } from '../lib/collection-place';
import { StickerImageHost } from '../lib/sticker-image';
import { forgetSmsLink } from '../lib/sms-relay';
import { forgetSpaceChats, shareLastSeen } from '../lib/space-chats';
import { forgetPlaceChats } from '../lib/place-chats';
import { startPlaceReceiver } from '../lib/place-receiver';
import { startShellWatch } from '../lib/shell-watch';
import { keepSpaceRunning, onSpaceGatedChange, restartSpaceRunning, setSpaceGated, spaceGated, stopSpaceRunning } from '../lib/space-running';
import { watchStoppedPlaces } from '../lib/forget-me';
import { relayStopped, setRelayStopped } from '../lib/relay';
import { forgetRelayLine } from '../lib/relay-line';
import { forgetSpare } from '../lib/spare';
import { callAudio } from '../modules/erevos-call';
import { cameraView } from '../modules/erevos-collection';
import { clearKnownNames, forgetKnownNamesAfter } from '../modules/erevos-phone';
import { refreshWidget, setIconNumbers } from '../modules/erevos-widget';
import { forgetSpaceGroups } from '../lib/space-groups';
import { startPublicDoors } from '../lib/space-public-groups';
import { applyTor, leaveTor, setTorMemory } from '../lib/tor';
import { nostrOf, setNostr } from '../lib/nostr';
import { runMatrix, stopMatrix } from '../lib/matrix-store';
import { forgetSigns } from '../lib/unread-signs';
import { runXmpp, stopXmpp } from '../lib/xmpp-store';
import { runTelegram, setTelegramNative, stopTelegram } from '../lib/telegram-store';
import { telegramNative } from '../modules/erevos-telegram';
import { messengerNative } from '../modules/erevos-messenger';
import type { MsgService } from '../lib/messenger';
import { messengerInFront, setMessengerNative, startMessenger, stopMessenger } from '../lib/messenger-store';
import { runNostrDm, stopNostrDm } from '../lib/nostr-dm-store';
import { startLinkedAccounts } from '../lib/linked-accounts';
// Gives the phone's SMS to the space's linked devices, once turned on (lib/sms-share.ts sets its hand in lib/devices.ts).
import '../lib/sms-share';
import { startChunkChannel } from '../lib/chunk-channel';
import { followModuleIcons } from '../lib/module-icons';
import { loadModules, moduleOn, MSG_MODULES, modulesChosen, onModulesChange, screenModule, setModules, useModules } from '../lib/modules';
import { bringsServer } from '../lib/invite-server';
import { retryFirstServer, wantFirstServer } from '../lib/open-place';
import { keepSetupAfter } from '../lib/setup-after';
import { watchPlaceNetworks } from '../lib/place-networks';
import { forgetTextInvite } from '../lib/text-invite';
import { forgetWays } from '../lib/ways-read';
import { forgetWelcome } from '../lib/welcome';
import { dropKey, forgetDropKey, publishDropKey } from '../lock/camera-drop';
import { hardenLock, loadLockConfig, type LockConfig, type Unlocked } from '../lock/config';
import { LockContext, useLock, type LockState } from '../lock/context';
import { PasswordGate } from '../lock/gate';
import { prepareHidden } from '../lock/hidden';
import { forgetOpenedQueues } from '../lock/queues-data';
import { currentSpace, loadOpenKey, setCurrentSpace } from '../lock/keys';
import { firstSpaceKey, firstStart, loadSpaceData, updateCurrentSpaceData, updateSpaceData } from '../lock/space-data';
import { ModuleOff } from '../components/module-off';
import { Setup, type SetupChoice } from '../components/setup';
import { MovedOut, MoveFound } from '../components/moved-out';
import { movedOut, onMovedOut, placeCarried, tellMoveTaken, waitingMove, type FoundMove } from '../lib/edition-move';
import type { UpdateEdition } from '../lib/update-channel';
import { radius, shape, space as gap } from '../theme/colors';
import { ThemeProvider, useTheme } from '../theme/context';
import { ensureStyleFonts } from '../theme/fonts';
import { loadSettingsShared, lookFrom, lookToShare, onSettingCame, onSettingNow, settingChanged, shareLanguage } from '../lib/sync/settings';
import { DEFAULT_LOOK, loadLockScreenLook, saveLockScreenLook, TEXT_SCALE, type Look } from '../theme/look';
import { keepPrivate, loadScreenPrivacy } from '../lib/screen-privacy';
import { closeWebPages, webPageInFront, webPagesLeftAt, webPagesLook } from '../lib/web-pages';
import { useCaseFonts } from '../lib/messenger-case-fonts';
import { messengerCaseLook } from '../lib/messenger-case-look';
import { collectionLockAfter, collectionLocked } from '../lib/collection-play';
import { collectionServerOpened, stopCollectionServers } from '../lib/collection-webdav';
import { sweepPendingChunks } from '../lib/pending-chunks';
import { PhoneView } from './phone';

setupCrypto();
// Erevos keeps no cookies, so its relay connections do not load the phone's WebView, which Android
// would close Erevos with at each update of it, in the background too (modules/erevos-call, NoCookies).
callAudio?.noCookies?.();

// Lock again after the app has been in the background this long.
const RELOCK_AFTER_MS = 30_000;
// How often Erevos+ looks whether one of its own web pages is still in front, while it is out of sight.
const PAGE_LOOK_MS = 1_000;
// A password screen asked for (gate) that has not come after this long: Erevos starts again from
// the password, with the space closed, sooner than stay under the phone's cover (lib/curtain.ts).
const GATE_STUCK_MS = 8_000;
// The phone's cover still over an open space this long after Erevos came back: it locks.
const COVER_LEFT_MS = 5_000;
// An automatic backup, when one is due, waits this long after a space opens, so the chats show first.
// Then, while it is open, Erevos looks every BACKUP_CHECK_MS whether one is due, and as it goes to
// the background, before it locks (lib/backup-folder.ts); never with no space open.
const BACKUP_AFTER_MS = 10_000;

// Whether this start made sure every space has its hidden chats slot and entry (lock/hidden.ts).
let hiddenPrepared = false;
let pendingSwept = false;

type Phase =
  | { kind: 'loading' }
  // Erevos's very first start: a name, and which modules to use (components/setup.tsx); the rest once the space is open (app/first-steps.tsx).
  | { kind: 'setup' }
  // `behind`: the space that goes on behind the password screen, until its password opens it again.
  | { kind: 'locked'; config: LockConfig; behind?: number }
  // `only`: the password was given for the SMS or the Contacts, which alone show; any other screen asks for it again.
  | { kind: 'open'; space: number; passwordLock: boolean; only?: OnlyPart }
  // This app moved to another edition (lib/edition-move.ts): no space opens, until the move is called off.
  | { kind: 'moved'; to: UpdateEdition; taken: boolean }
  // Set up already, and another edition made a move for it: asked before anything opens.
  | { kind: 'move-found'; move: FoundMove };

// The space that was open when Android took the screens away (Erevos swiped away from the recent
// apps), its look, and since when Erevos was away. The space goes on without them
// (lib/space-running.ts), and the screens that start again find it as after the background.
// `gated`: the password screen showed in front of it, and shows again.
// `only`: only the SMS or the Contacts showed (Phase), and only they show again.
let left: { space: number; passwordLock: boolean; look: Look; at: number; gated: boolean; only?: OnlyPart } | null = null;

// Shows the password screen when the lock is on, and the app once a space is open. The space
// decides what the chat finds on the phone (lock/space-data.ts) and how the app looks
// (theme/look.ts), and the screens start afresh in each space, so nothing of one shows in another.
// The password screen shows the look last used. With the password lock, locking puts the password
// screen in front of the open space, which goes on behind it, taking messages and ringing calls
// (lib/space-running.ts): its screens go, and with them the hidden chats. Its password shows it
// again; another space's closes it first. On Android the phone itself covers such a space's
// screens as they go out of sight, and keeps them covered when Erevos comes back after the lock's
// time, until the password screen is drawn: nothing of the space shows before it (lib/curtain.ts).
// Where the app goes on running out of sight, it locks there at its time, and the password screen
// is ready as Erevos comes back. A password given for the SMS (their icon, the widget's
// SMS button, an SMS notice) or the Contacts (their icon, the widget's button) shows only them; any
// other screen asks for it again, and then shows. What the Collection has open in Android (links
// other apps read its files by, PDFs, lib/collection-play.ts) goes when the space locks or closes,
// even while Erevos is in the background; its music plays on unless the owner chose otherwise.
export default function RootLayout() {
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [look, setLook] = useState<Look>(DEFAULT_LOOK);
  const [error, setError] = useState<string | null>(null);
  const phaseRef = useRef(phase);
  const lookRef = useRef(look);
  const backgroundAt = useRef<number | null>(null);
  // The password screen came from only the SMS or the Contacts, for something else: the password opens all.
  const wantsAll = useRef(false);
  const relockAfterCall = useRef(false);
  // The password screen was asked for and is not there yet (gate): the phone's cover stays, and
  // nothing asks for it again. `gateRun` tells one asking from the next.
  const gating = useRef(false);
  const gateRun = useRef(0);
  // What the phone counted as the screens came back (lib/curtain.ts), taken once and kept until
  // Erevos is told it is in front.
  const backTaken = useRef<CurtainBack | null>(null);
  // Another space to open, its password just given in the open one (LockState.openSpace): it opens
  // once the screens of the one that closed are gone.
  const switching = useRef<Unlocked | null>(null);
  // Not now to a move another edition made: Erevos opens as before, this once.
  const skipMoveAsk = useRef(false);
  const lang = useLang();
  // The words of Send to's encrypting screen follow the language (lib/share-texts.ts).
  useEffect(() => {
    if (Platform.OS === 'android') tellShareTexts();
  }, [lang]);
  // What the Collection's camera left unencrypted in the cache, if Erevos stopped before it was kept.
  useEffect(() => {
    if (Platform.OS === 'android') clearCameraCache();
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    lookRef.current = look;
  }, [look]);
  // A space with a password lock keeps its screens out of screenshots and the recent apps
  // preview, unless turned off in Lock (lib/screen-privacy.ts).
  const privateLock = phase.kind === 'open' && phase.passwordLock;
  useEffect(() => {
    let live = true;
    if (!privateLock) keepPrivate('lock', false);
    else void loadScreenPrivacy().then((on) => live && keepPrivate('lock', on)).catch(() => undefined);
    return () => {
      live = false;
    };
  }, [privateLock]);

  const fail = useCallback((e: unknown) => {
    stopSpaceRunning();
    setError(e instanceof Error ? e.message : String(e));
  }, []);

  // A look is shown once its style's fonts are ready, so no screen shows without them.
  const show = useCallback(async (next: Look) => {
    await ensureStyleFonts(next.style);
    setLook(next);
  }, []);

  const openSpace = useCallback(
    async (space: number, passwordLock: boolean, key: Uint8Array, only?: OnlyPart) => {
      setCurrentSpace(space, key);
      const data = await loadSpaceData(space, key);
      // A stopped space reaches no relay, nor Nostr, until it starts again (lib/forget-me.ts).
      setRelayStopped(data.stopped > 0);
      // Tor starts in the background, unless the space's way is Nothing (the default), through
      // the space's bridges if it has any; until it is ready, the way 'messages' sends straight,
      // and the way 'all' waits for it.
      // Automatic bridges learn, in this space's own settings, the way that works on each kind of network.
      const spaceKey = key.slice();
      setTorMemory(
        () => callAudio?.networkKind?.() ?? 'other',
        (bridges) => updateSpaceData(space, spaceKey, { bridges }).then(() => undefined),
      );
      // Direct connections (lib/direct.ts), on unless turned off: off, and kept off, in a space where
      // anything goes through Tor, so that turning Tor off later connects nothing directly unasked.
      const direct = directOf(data);
      setDirect(direct);
      if (direct !== data.direct) updateSpaceData(space, spaceKey, { direct }).catch(() => undefined);
      applyTor(data.tor, data.bridges).catch(() => undefined);
      // Its texts go through Nostr unless it says not, the way its Tor way says (lib/nostr.ts).
      setNostr(nostrOf(data.nostr), data.nostr.tor === true);
      const kept = data.look ?? (await loadLockScreenLook());
      await show(kept);
      setPhase({ kind: 'open', space, passwordLock, only });
      saveLockScreenLook(kept).catch(() => undefined);
      setTimeout(() => void runAutoBackup().catch(() => undefined), BACKUP_AFTER_MS);
      // The Collection copied to its server, when it has one (lib/collection-webdav.ts).
      collectionServerOpened();
      // A place on LPHL's open server the first start still wants is taken now (lib/open-place.ts).
      void retryFirstServer().catch(() => undefined);
      // What the camera took for this space while Erevos was locked comes in, and it takes for
      // this space from now on (lock/camera-drop.ts).
      cameraFollows(passwordLock);
      // A new Erevos is told at the top of the chats (lib/release-look.ts).
      watchReleases();
    },
    [show],
  );

  const start = useCallback(async () => {
    // Nothing of the space that was open stays in memory, nor its screens: they start afresh
    // once a space opens (after a backup is restored too).
    closeSpace();
    wantsAll.current = false;
    // A link Erevos came back with opens after the password (lib/open-link.ts).
    lockingKeepsLink();
    setPhase({ kind: 'loading' });
    // The keystore holds the same entries whatever is in use: made once per start, beside the
    // rest, since the password screen need not wait for them.
    if (!hiddenPrepared) {
      hiddenPrepared = true;
      void cryptoReady().then(() => prepareHidden()).catch(() => undefined);
    }
    // What an import was still writing when Erevos stopped last time (lib/pending-chunks.ts): once
    // per start, before any import can begin.
    if (!pendingSwept) {
      pendingSwept = true;
      void sweepPendingChunks().catch(() => undefined);
    }
    // On a computer the core loads beside the app, and nothing that needs it opens before it.
    await cryptoReady();
    // Password slots from before Argon2id get it now, while the password screen shows (after a
    // backup is restored too); whatever changes the lock waits for it.
    void hardenLock().catch(() => undefined);
    void syncBootStart().catch(() => undefined);
    await loadLang();
    // Moved to another edition (lib/edition-move.ts): nothing opens here, so that nothing comes in
    // that it does not get; a move not taken within a day goes, and Erevos opens as before.
    const moved = movedOut();
    if (moved) {
      // Nor does it go on receiving in the background, nor tell of messages there.
      try {
        callAudio?.stopReceiving?.();
      } catch {
        // A build from before it.
      }
      await show(await loadLockScreenLook());
      setPhase({ kind: 'moved', ...moved });
      return;
    }
    // Which parts of Erevos run (lib/modules.ts): every one, until the owner chooses.
    await loadModules();
    followModuleIcons();
    const config = await loadLockConfig();
    // A move taken here whose edition could not be told so then, and what it carried for the
    // engines that could not go in place then (lib/edition-move.ts): before any space opens.
    void tellMoveTaken();
    await placeCarried();
    const setUp = config.direct !== null || config.slots.length > 0 || modulesChosen() || !(await firstStart());
    // A move another edition made for this one, set up already: asked first (the first start's setup asks itself).
    const found = setUp && !skipMoveAsk.current ? await waitingMove() : null;
    skipMoveAsk.current = false;
    if (found) {
      await show(await loadLockScreenLook());
      setPhase({ kind: 'move-found', move: found });
      return;
    }
    if (config.direct !== null) {
      // The lock was turned off in a later space: that one opens directly, with its key from the keystore.
      await openSpace(config.direct, false, await loadOpenKey(config.direct));
    } else if (config.slots.length > 0) {
      await show(await loadLockScreenLook());
      setPhase({ kind: 'locked', config });
    } else if (!modulesChosen() && (await firstStart())) {
      // The very first start: the modules first, then the first space opens.
      await show(await loadLockScreenLook());
      setPhase({ kind: 'setup' });
    } else {
      await openSpace(0, false, await firstSpaceKey());
    }
  }, [openSpace, show]);

  // The first start's modules were chosen: kept, then Erevos opens with them, and the setup goes
  // on in the space (app/first-steps.tsx). An invite that opened Erevos for the first time opens
  // once that is done, however long it took (lib/setup-after.ts).
  const setupDone = useCallback(
    async ({ modules, name, restore, linkPhone }: SetupChoice) => {
      await setModules(modules);
      const invite = peekLink() ?? undefined;
      // Erevos's own chats, for a new start: the first space takes a place on LPHL's open server
      // once its mode is chosen (lib/open-place.ts), unless the invite it opened with brings a server.
      if (modules.includes('erevos') && !restore && !linkPhone && !bringsServer(invite)) await wantFirstServer(0).catch(() => undefined);
      const kept = await keepSetupAfter({ name, modules, ...(restore ? { restore: 'wanted' as const } : {}), ...(linkPhone ? { linkPhone } : {}), ...(invite ? { invite } : {}) }).then(
        () => true,
        () => false,
      );
      if (kept) {
        dropLink();
        keepLink('erevos://first-steps');
      } else setupKeepsLink();
      await start();
    },
    [start],
  );

  // The password screen in front of the open space, which goes on behind it. Its contacts' names
  // leave the call screen, and a link Erevos came back with opens after the password; or `link`,
  // when given ('' for none): the screen that asked for the password again, with only the SMS or the Contacts open.
  const gate = useCallback(
    async (space: number, link?: string) => {
      // Covered first, at once: the password screen takes a moment to make (lib/curtain.ts).
      lowerCurtain();
      gating.current = true;
      const run = ++gateRun.current;
      setTimeout(() => {
        if (gating.current && gateRun.current === run) start().catch(fail);
      }, GATE_STUCK_MS);
      setSpaceGated(true);
      clearKnownNames();
      collectionLocked();
      closeWebPages();
      stopCollectionServers();
      lockingKeepsLink();
      // Asked for again with only the SMS or the Contacts open: the password then opens all.
      wantsAll.current = link !== undefined;
      if (link !== undefined) {
        dropLink();
        if (link) keepLink(link);
      }
      const config = await loadLockConfig();
      if (config.direct !== null || config.slots.length === 0) return start();
      setPhase({ kind: 'locked', config, behind: space });
    },
    [start, fail],
  );

  // The phone's cover goes once a screen that is not the space's is drawn under it: the password
  // screen, or whatever else shows in its place (Shell marks each with CurtainEnd).
  useEffect(() => {
    if (error === null && phase.kind === 'open') return;
    gating.current = false;
    liftCurtain(true);
  }, [phase, error]);

  // Locks the space that shows: behind the password screen with the password lock, otherwise as Erevos starts.
  const relock = useCallback(() => {
    const current = phaseRef.current;
    return current.kind === 'open' && current.passwordLock ? gate(current.space) : start();
  }, [gate, start]);

  // A password typed or a fingerprint given: the space behind the password screen shows again, or,
  // for another, it closes and that one opens. Given for the SMS or the Contacts, it shows only them.
  const unlocked = useCallback(
    async ({ space, key }: { space: number; key: Uint8Array }) => {
      const current = phaseRef.current;
      const behind = current.kind === 'locked' ? current.behind : undefined;
      // A password asked for again, from only the SMS or the Contacts, opens all of the space.
      const only = wantsAll.current ? undefined : (onlyPartOf(peekLink()) ?? undefined);
      wantsAll.current = false;
      if (behind !== undefined && behind === space && spaceGated() && sameKey(openKey(), key)) {
        setSpaceGated(false);
        forgetKnownNamesAfter(-1);
        void refreshKnownNames();
        setPhase({ kind: 'open', space, passwordLock: true, only });
        collectionServerOpened();
        // What the camera took in front of the password screen comes in.
        cameraFollows(true);
        return;
      }
      if (behind !== undefined) closeSpace();
      await openSpace(space, true, key, only);
    },
    [openSpace],
  );

  // Back to the space that went on without its screens, as from the background: while the lock
  // would not have closed it yet, or a call rings or goes on, which locks once it ends. Otherwise
  // the password screen comes in front of it.
  const goOn = useCallback(
    async (was: NonNullable<typeof left>) => {
      await show(was.look);
      if (was.passwordLock && awayClock() - was.at > RELOCK_AFTER_MS) relockAfterCall.current = true;
      else if (was.passwordLock) {
        forgetKnownNamesAfter(-1);
        collectionLockAfter(-1);
      }
      setPhase({ kind: 'open', space: was.space, passwordLock: was.passwordLock, only: was.only });
    },
    [show],
  );

  useEffect(() => {
    const was = left;
    left = null;
    let open: number | null = null;
    try {
      open = currentSpace().space;
    } catch {
      // No space is open.
    }
    if (was === null || was.space !== open) start().catch(fail);
    else if (!was.gated && (!was.passwordLock || awayClock() - was.at <= RELOCK_AFTER_MS || currentCall() !== null || hiddenRingHoldsLock()))
      // Only the SMS or the Contacts showed, and another icon or a notice brings Erevos back: the
      // password first, as when it is locked, which then opens what that one names. The part
      // showed a moment before otherwise.
      void (was.only ? linkStartedWith() : Promise.resolve(undefined))
        .then((href) => (href === undefined || onlyPartOf(href) === was.only ? goOn(was) : show(was.look).then(() => gate(was.space))))
        .catch(fail);
    else
      show(was.look)
        .then(() => gate(was.space))
        .catch(fail);
  }, [start, goOn, gate, show, fail]);

  // Android took the screens away, Erevos swiped away from the recent apps: the open space goes
  // on, ready for messages and calls, and a call ends, as it would have no screen.
  useEffect(
    () => () => {
      const current = phaseRef.current;
      const at = backgroundAt.current ?? awayClock();
      if (current.kind === 'open') left = { space: current.space, passwordLock: current.passwordLock, look: lookRef.current, at, gated: false, only: current.only };
      else if (current.kind === 'locked' && current.behind !== undefined && spaceGated()) left = { space: current.behind, passwordLock: true, look: lookRef.current, at, gated: true };
      else left = null;
      endCall();
      endGroupCall();
    },
    [],
  );

  // Android's notices, shown while the app is closed, say it in the app's language too.
  useEffect(() => {
    callAudio?.setLanguage?.(lang);
    // The widget's words follow the app's language (modules/erevos-widget).
    refreshWidget();
    // So does the web app's notice while it is closed (pwa/sw.js).
    noticeLanguage(lang);
  }, [lang]);

  // The launchers that show a number on each icon apart (Huawei's and Honor's, modules/erevos-widget)
  // follow Number on the icon, also while Erevos is closed: told it as Erevos starts and as it changes.
  useEffect(() => {
    const tell = () => void iconNumberOn().then(setIconNumbers);
    tell();
    return onIconNumberChange(tell);
  }, []);

  // The web app's notice tells of what came since Erevos was last on the screen: from nothing again
  // when it shows, and when it leaves (not when it opens in a tab out of sight).
  useEffect(() => {
    if (AppState.currentState === 'active') noticeSeen();
    const subscription = AppState.addEventListener('change', () => noticeSeen());
    return () => subscription.remove();
  }, []);

  // The web app's service worker refused code from the server: said at once, locked or open.
  useEffect(() => startIntegrityAlarm(), []);

  // While a space is open, Erevos looks now and then whether an automatic backup is due.
  const spaceOpen = phase.kind === 'open';
  useEffect(() => {
    // In the battery mode Sleep the phone is not let sleep early while one is made (lib/sleep-look.ts).
    if (!spaceOpen) return;
    const timer = setInterval(() => void awakeWhile(checkAutoBackup()).catch(() => undefined), BACKUP_CHECK_MS);
    return () => clearInterval(timer);
  }, [spaceOpen]);

  useEffect(() => {
    let lockTimer: ReturnType<typeof setTimeout> | null = null;
    let coverTimer: ReturnType<typeof setTimeout> | null = null;
    // Erevos+: one of its own web pages in front (Messenger in its case, Facebook, a sign-in page:
    // lib/web-pages.ts) puts Erevos's own screen out of sight, but the owner is still in Erevos.
    // The lock's time away does not run then; it counts from when the last page left.
    let inPage = false;
    let pageSeen = false;
    let pageTimer: ReturnType<typeof setInterval> | null = null;
    const stopPage = () => {
      if (pageTimer) clearInterval(pageTimer);
      pageTimer = null;
    };
    const followPage = () => {
      const current = phaseRef.current;
      if (AppState.currentState === 'active' || gating.current || current.kind !== 'open' || !current.passwordLock) {
        stopPage();
        return;
      }
      if (webPageInFront()) {
        if (!inPage) {
          inPage = true;
          pageSeen = true;
          if (lockTimer) clearTimeout(lockTimer);
          lockTimer = null;
          forgetKnownNamesAfter(-1);
          collectionLockAfter(-1);
        }
        pageTimer ??= setInterval(followPage, PAGE_LOOK_MS);
        return;
      }
      if (!inPage) return;
      // The last page left, and Erevos is still out of sight: from then, as if it had just gone.
      inPage = false;
      stopPage();
      const now = awayClock();
      const left = Math.min(webPagesLeftAt() ?? now, now);
      backgroundAt.current = left;
      const rest = Math.max(0, RELOCK_AFTER_MS - (now - left));
      forgetKnownNamesAfter(rest);
      collectionLockAfter(rest);
      lockTimer = setTimeout(lockAway, rest);
    };
    // The lock's time has passed with Erevos still out of sight, where the app goes on running
    // there (it takes messages in the background): it locks now, behind the phone's cover, so the
    // password screen is ready as Erevos comes back. Back already: decided as it is told so, below.
    const lockAway = () => {
      lockTimer = null;
      const current = phaseRef.current;
      if (backgroundAt.current === null || gating.current || current.kind !== 'open' || !current.passwordLock) return;
      if (webPageInFront()) {
        followPage();
        return;
      }
      backTaken.current ??= curtainBack();
      if (backTaken.current) return;
      if (currentCall() || hiddenRingHoldsLock()) relockAfterCall.current = true;
      else gate(current.space).catch(fail);
    };
    const subscription = AppState.addEventListener('change', (state) => {
      const current = phaseRef.current;
      if (state === 'background') {
        backgroundAt.current = awayClock();
        backTaken.current = null;
        // What was read here is no longer new on the widget.
        refreshWidget();
        // An automatic backup that is due is made now, while the space is still open.
        if (current.kind === 'open') void checkAutoBackup().catch(() => undefined);
        // The names of the space's contacts go when it would lock, even if the app does not run
        // then; so does what the Collection has open, in Android.
        if (current.kind === 'open' && current.passwordLock) {
          forgetKnownNamesAfter(RELOCK_AFTER_MS);
          collectionLockAfter(RELOCK_AFTER_MS);
          if (lockTimer) clearTimeout(lockTimer);
          lockTimer = setTimeout(lockAway, RELOCK_AFTER_MS);
          // A page of Erevos+'s own may be coming to the front as Erevos's screen goes: looked at
          // now and in a moment, as Android puts it there just after.
          inPage = false;
          pageSeen = false;
          followPage();
          setTimeout(followPage, PAGE_LOOK_MS);
        }
      }
      if (state !== 'active') return;
      if (lockTimer) clearTimeout(lockTimer);
      lockTimer = null;
      stopPage();
      // Back from a page of its own: the time away is from when it left, not from when Erevos's
      // screen went (the phone's own count is of that screen alone).
      const fromPage = pageSeen;
      const pageLeft = inPage ? webPagesLeftAt() : null;
      inPage = false;
      pageSeen = false;
      // How long Erevos was away: by the phone's count where it keeps one, on the clock nobody can
      // set, which is what it kept its cover by (lib/curtain.ts); else by the app's own.
      const counted = backTaken.current ?? curtainBack();
      backTaken.current = null;
      const back = fromPage ? null : counted;
      const since = fromPage && pageLeft !== null ? Math.min(pageLeft, awayClock()) : backgroundAt.current;
      backgroundAt.current = null;
      if (back === null && since === null) return;
      // Locked already, or locking: the cover goes with the password screen.
      if (gating.current || current.kind !== 'open' || !current.passwordLock) return;
      // The cover is never left over an open space: one still there in a while locks it.
      if (coverTimer) clearTimeout(coverTimer);
      coverTimer = setTimeout(() => {
        coverTimer = null;
        const now = phaseRef.current;
        if (AppState.currentState !== 'active' || !curtainDown() || gating.current || now.kind !== 'open') return;
        if (now.passwordLock) gate(now.space).catch(fail);
        else liftCurtain(false);
      }, COVER_LEFT_MS);
      if (!awayLong(back, since === null ? null : awayClock() - since, RELOCK_AFTER_MS)) {
        forgetKnownNamesAfter(-1);
        collectionLockAfter(-1);
        liftCurtain(false);
        return;
      }
      // A call that rang in the background, or goes on, would lose its screen behind the password:
      // it locks once the call ends. So does a hidden call that rings, or that its PIN answered
      // and that has not come yet (lib/hidden-ring.ts).
      if (currentCall() || hiddenRingHoldsLock()) {
        relockAfterCall.current = true;
        liftCurtain(false);
      } else gate(current.space).catch(fail);
    });
    let answerTimer: ReturnType<typeof setTimeout> | null = null;
    const relockWhenDone = () => {
      if (answerTimer) clearTimeout(answerTimer);
      answerTimer = null;
      if (!relockAfterCall.current || currentCall()) return;
      if (hiddenRingHoldsLock()) {
        // The PIN answered a hidden call that has not come: once it no longer waits, it locks.
        const ends = hiddenAnswerEndsAt();
        if (ends !== null) answerTimer = setTimeout(relockWhenDone, Math.max(0, ends - Date.now()) + 50);
        return;
      }
      relockAfterCall.current = false;
      if (phaseRef.current.kind === 'open') relock().catch(fail);
    };
    const stopCalls = onCallChange(relockWhenDone);
    const stopRings = onHiddenRingingChange(relockWhenDone);
    return () => {
      subscription.remove();
      stopCalls();
      stopRings();
      if (answerTimer) clearTimeout(answerTimer);
      if (lockTimer) clearTimeout(lockTimer);
      if (coverTimer) clearTimeout(coverTimer);
      stopPage();
    };
  }, [gate, relock, fail]);

  // Erevos could not open: it starts again, from the password, with nothing of before in memory.
  const retry = useCallback(() => {
    setError(null);
    start().catch(fail);
  }, [start, fail]);

  // This app has just moved to another edition (app/updates.tsx): the space closes, and only that shows.
  useEffect(() => onMovedOut(() => void start().catch(fail)), [start, fail]);

  // Not now to a move another edition made (components/moved-out.tsx): Erevos opens as before.
  const moveLater = useCallback(() => {
    skipMoveAsk.current = true;
    start().catch(fail);
  }, [start, fail]);

  // A look changed on the Appearance screen: kept in the open space, and copied for the password screen.
  const keepLook = useCallback(async (next: Look) => {
    setLook(next);
    if (phaseRef.current.kind !== 'open') return;
    // To the account's other devices too, as they share the settings (lib/sync/settings.ts).
    settingChanged('look', lookToShare(next));
    await Promise.all([updateCurrentSpaceData({ look: next }), saveLockScreenLook(next)]);
  }, []);

  // The settings the account's devices share: the language, and the open space's look, which a
  // look chosen on another device replaces here (lib/sync/settings.ts).
  useEffect(() => {
    void loadSettingsShared().catch(() => undefined);
    const stopLanguage = shareLanguage();
    const stopLastSeen = shareLastSeen();
    const stopNow = onSettingNow('look', () => (phaseRef.current.kind === 'open' ? lookToShare(lookRef.current) : undefined));
    const stopCame = onSettingCame('look', async (value) => {
      if (phaseRef.current.kind !== 'open') return;
      const next = lookFrom(value, lookRef.current);
      if (!next || JSON.stringify(next) === JSON.stringify(lookRef.current)) return;
      await show(next);
      await Promise.all([updateCurrentSpaceData({ look: next }), saveLockScreenLook(next)]);
    });
    return () => {
      stopLanguage();
      stopLastSeen();
      stopNow();
      stopCame();
    };
  }, [show]);

  const lockState = useMemo<LockState>(
    () => ({
      space: phase.kind === 'open' ? phase.space : 0,
      passwordLock: phase.kind === 'open' && phase.passwordLock,
      setPasswordLock: (on) => {
        setPhase((p) => (p.kind === 'open' ? { ...p, passwordLock: on } : p));
        // The lock was turned on or off in the open space: the locked camera takes for it from
        // now on, or for none, without waiting for the space to open again.
        cameraFollows(on);
      },
      lockNow: () => {
        relock().catch(fail);
      },
      closeNow: () => {
        start().catch(fail);
      },
      openSpace: (other) => {
        // Nothing of the open space stays, nor its screens, before the other opens.
        closeSpace();
        wantsAll.current = false;
        switching.current = other;
        setPhase({ kind: 'loading' });
      },
      only: phase.kind === 'open' ? (phase.only ?? null) : null,
      unlockAll: (link) => {
        const current = phaseRef.current;
        if (current.kind === 'open' && current.passwordLock) gate(current.space, link ?? '').catch(fail);
      },
    }),
    [phase, start, relock, openSpace, gate, fail],
  );

  // The other space a password given in the open one opens, now that nothing of the one before shows.
  useEffect(() => {
    const other = switching.current;
    if (phase.kind !== 'loading' || !other) return;
    switching.current = null;
    openSpace(other.space, true, other.key).catch(fail);
  }, [phase, openSpace, fail]);

  // Keyboard tracking for every screen and sheet, the password screen too (components/keyboard.tsx).
  return (
    <KeyboardProvider>
      <ThemeProvider look={look} onChange={keepLook}>
        {/* A touch anywhere says the owner is there, for safety messages (lib/safety.ts). */}
        <View style={{ flex: 1 }} onTouchStart={() => ownerTouched()}>
          <Shell lang={lang} phase={phase} error={error} lockState={lockState} onUnlock={unlocked} onRetry={retry} onMoveLater={moveLater} onSetup={(choice) => setupDone(choice).catch(fail)} />
        </View>
      </ThemeProvider>
    </KeyboardProvider>
  );
}

function Shell({ lang, phase, error, lockState, onUnlock, onRetry, onMoveLater, onSetup }: {
  lang: Lang;
  phase: Phase;
  error: string | null;
  lockState: LockState;
  onUnlock: (space: { space: number; key: Uint8Array }) => Promise<void>;
  /** Starts again after Erevos could not open: from the password, as when it starts. */
  onRetry: () => void;
  /** Not now to a move another edition made for this app. */
  onMoveLater: () => void;
  /** What the first start's setup chose. */
  onSetup: (choice: SetupChoice) => void;
}) {
  const { colors, scheme, look } = useTheme();
  const spec = useBackdropSpec();
  // A screen of a module that is off shows that it is off instead (lib/modules.ts).
  const modules = useModules();
  const bar = <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
  // Erevos+'s web pages (Messenger in its case, Facebook) wear the same colours in their bar, and
  // Meta's page in the case the whole look: its colours, dark or light, letters, text size, bubbles
  // and what lies behind the screens (lib/messenger-case-look.ts).
  const caseFonts = useCaseFonts(look.style, look.font);
  // The backdrop is made anew each render: the page is told again only when it changes.
  const specKey = JSON.stringify(spec);
  useEffect(
    () =>
      webPagesLook({
        bar: colors.surface,
        text: colors.text,
        accent: colors.primary,
        dark: scheme === 'dark',
        page: messengerCaseLook(colors, scheme, shape.face ?? shape.family, {
          textScale: TEXT_SCALE[look.textSize],
          bubbles: look.bubbles,
          squareCorner: radius.sm === 0 ? 0 : 4,
          glow: shape.glow,
          backdrop: spec,
          fonts: caseFonts,
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors, scheme, look.textSize, look.bubbles, specKey, caseFonts],
  );
  // While a space with a password lock shows, the phone covers its screens as they go out of sight
  // (lib/curtain.ts), in the look's ground colour. Not while a call rings or goes on, nor a hidden
  // one: its screen shows at once as Erevos comes back, and the space locks when it ends.
  const covered = phase.kind === 'open' && phase.passwordLock && !error;
  const ground = colors.ground;
  useEffect(() => {
    if (!covered) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const arm = () => {
      if (timer) clearTimeout(timer);
      timer = null;
      const holds = !!currentCall() || hiddenRingHoldsLock();
      armCurtain(holds ? null : RELOCK_AFTER_MS, ground);
      // A hidden call its PIN answered stops holding the lock by itself, with nothing said (lib/hidden-ring.ts).
      const ends = hiddenAnswerEndsAt();
      if (holds && ends !== null) timer = setTimeout(arm, Math.max(0, ends - Date.now()) + 50);
    };
    arm();
    const stopCalls = onCallChange(arm);
    const stopRings = onHiddenRingingChange(arm);
    return () => {
      stopCalls();
      stopRings();
      if (timer) clearTimeout(timer);
      armCurtain(null, ground);
    };
  }, [covered, ground]);

  if (error) {
    return (
      <ScreenBackdrop>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: gap.xl, gap: gap.sm, backgroundColor: colors.ground }}>
          <Text variant="heading" style={{ textAlign: 'center' }}>
            {t('Erevos could not open')}
          </Text>
          <Text tone="muted" style={{ textAlign: 'center' }}>
            {error}
          </Text>
          <Button title={t('Try again')} kind="secondary" compact onPress={onRetry} />
        </View>
        <CurtainEnd />
        {bar}
      </ScreenBackdrop>
    );
  }
  if (phase.kind === 'loading') {
    return (
      <ScreenBackdrop>
        <View style={{ flex: 1, backgroundColor: colors.ground }} />
        <CurtainEnd />
        {bar}
      </ScreenBackdrop>
    );
  }
  if (phase.kind === 'moved') {
    return (
      <ScreenBackdrop>
        <MovedOut key={lang} to={phase.to} taken={phase.taken} onChanged={onRetry} />
        <CurtainEnd />
        <AlertHost />
        {bar}
      </ScreenBackdrop>
    );
  }
  if (phase.kind === 'move-found') {
    return (
      <ScreenBackdrop>
        <MoveFound key={lang} move={phase.move} onDone={onRetry} onLater={onMoveLater} />
        <CurtainEnd />
        <AlertHost />
        {bar}
      </ScreenBackdrop>
    );
  }
  if (phase.kind === 'setup') {
    return (
      <ScreenBackdrop>
        <Setup key={lang} onDone={onSetup} />
        <CurtainEnd />
        <AlertHost />
        {bar}
      </ScreenBackdrop>
    );
  }
  if (phase.kind === 'locked') {
    return (
      <ScreenBackdrop>
        <Locked lang={lang} config={phase.config} onUnlock={onUnlock} />
        {/* A call to the space behind the password screen shows over it, a hidden one too. */}
        {phase.behind !== undefined ? <CallHost key={`call-${phase.behind}`} /> : null}
        {phase.behind !== undefined ? <TelegramCallHost key={`telegram-call-${phase.behind}`} /> : null}
        {/* Signal's calls are the phone's, not a space's: they show over the password screen too. */}
        <SignalCallHost />
        {phase.behind !== undefined ? <HiddenRingHost key={`ring-${phase.behind}`} locked /> : null}
        <CurtainEnd />
        <AlertHost />
        {bar}
      </ScreenBackdrop>
    );
  }
  // Each screen shows its own title, so the header only carries the back arrow. The home screen
  // has no header. The screens start afresh in a new language too (lib/i18n.ts), on the home
  // screen, where its menu changes it. Under a backdrop (Nocturne's glow, the glass's wallpaper) every screen lies on
  // it, and the header is drawn over it: the glass's dense pane, or see-through.
  const headerColor = !spec ? colors.sheet : spec.kind === 'wall' ? colors.sheet : 'transparent';
  return (
    <LockContext.Provider value={lockState}>
      <StickerImageHost />
      <Stack
        key={`${phase.space}-${lang}`}
        // A chat draws its own backdrop, in its own look (theme/chat-theme.tsx), and goes back by a
        // swipe in its own way, as its back arrow does; so do a group, Chat with myself, a chat
        // on Matrix, XMPP or Nostr and an SMS conversation (components/chat-look.tsx). Every other screen goes back by a
        // swipe to the right (components/swipe-back.tsx).
        // With only the SMS or the Contacts open, any other screen asks for the password first, and shows nothing of itself.
        // A screen of a module that is off shows only that it is off (lib/modules.ts).
        screenLayout={({ children, route }) => {
          const part = screenModule(route.name);
          return phase.only && !ONLY_SCREENS[phase.only].has(route.name) ? (
            <AskAgain link={screenLink(route.name, route.params as Record<string, unknown> | undefined)} />
          ) : part && !modules.has(part) ? (
            <ScreenBackdrop>
              <SwipeBack>
                <ModuleOff module={part} bare={HEADERLESS.has(route.name)} />
              </SwipeBack>
            </ScreenBackdrop>
          ) : OWN_LOOK.has(route.name) ? (
            children
          ) : (
            <ScreenBackdrop>
              <SwipeBack>{children}</SwipeBack>
            </ScreenBackdrop>
          );
        }}
        screenOptions={{
          title: '',
          headerStyle: { backgroundColor: headerColor },
          headerTransparent: spec !== null,
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.ground },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        {/* A group draws its own bar at the top, with its back arrow, as a chat does. */}
        <Stack.Screen name="group" options={{ headerShown: false }} />
        {/* Chat with myself draws its own bar too. */}
        <Stack.Screen name="myself" options={{ headerShown: false }} />
        {/* The Collection draws its own bar too, with its back arrow and search. */}
        <Stack.Screen name="collection" options={{ headerShown: false }} />
        {/* The first start's steps in the space draw their own, with no way back past them but their own. */}
        <Stack.Screen name="first-steps" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
      <OpenLink key={`link-${phase.space}-${lang}`} />
      <Receiver space={phase.space} />
      <CallHost key={`call-${phase.space}`} />
      <TelegramCallHost key={`telegram-call-${phase.space}`} />
      <SignalCallHost />
      <HiddenRingHost key={`ring-${phase.space}`} />
      <AlertHost />
      {bar}
    </LockContext.Provider>
  );
}

// The mark on every screen that is not a space's: once it is drawn, the phone's cover over the
// space's screens goes (lib/curtain.ts, Curtain.kt finds it by its name). It takes no room and no touch.
function CurtainEnd() {
  return <View nativeID={CURTAIN_END} pointerEvents="none" collapsable={false} style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1 }} />;
}

// The screens that draw their own bar, so have no header (below).
const HEADERLESS = new Set(['index', 'chat', 'group', 'myself', 'collection', 'first-steps']);

// The chats' screens, which each draw their backdrop in the chat's own look (above).
const OWN_LOOK = new Set(['chat', 'group', 'myself', 'matrix-chat', 'xmpp-chat', 'nostr-chat', 'sms', 'telegram-chat', 'messenger-chat', 'signal-chat', 'session-chat']);

// How long before Erevos goes to the background a call made on the locked Phone may be, for it to
// be what took Erevos there.
const CALL_LEAVES_MS = 10_000;

// With Erevos locked: the password screen, or the Phone, when a link asks for it and it opens
// without the password (lib/phone-open.ts): its icon, a tel: link, the notice of a missed call.
// Or the camera, when its icon or shortcut asks for it and it opens without the password
// (lock/camera-drop.ts): it takes for the space opened last, with no key of it in hand, and shows
// nothing of what was taken, nor of the Collection, nor any other screen; closed, or back, the
// password screen shows, and the password then opens the Collection, where what was taken is.
// Any other link waits for the password. Back from the background after Erevos would have locked,
// the password screen shows again, unless a call made on the Phone took it there, or the Phone's
// link brought it back; the camera closes as Erevos leaves the screen.
function Locked({ lang, config, onUnlock }: { lang: Lang; config: LockConfig; onUnlock: (space: { space: number; key: Uint8Array }) => Promise<void> }) {
  const [phone, setPhone] = useState<Record<string, string> | null>(null);
  // The camera open: the public key it seals what it takes for.
  const [camera, setCamera] = useState<Uint8Array | null>(null);
  const opens = useRef(false);
  const sealTo = useRef<Uint8Array | null>(null);
  const took = useRef(false);
  const linkAt = useRef(0);
  const calledAt = useRef(0);
  const awayAt = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    const look = () => {
      const href = peekLink();
      if (!href) return;
      const { path, params } = linkParts(href);
      if (path === '/phone' && opens.current) {
        takeLink();
        linkAt.current = Date.now();
        setCamera(null);
        setPhone(screenParams(href, linkAt.current));
        return;
      }
      if (path === '/collection' && params.camera === '1' && sealTo.current) {
        takeLink();
        took.current = false;
        setPhone(null);
        setCamera(sealTo.current);
        return;
      }
      setPhone(null);
      setCamera(null);
    };
    void phoneOpensLocked().then((on) => {
      if (!active) return;
      // Not while the Phone is off (lib/modules.ts).
      opens.current = on && moduleOn('phone');
      look();
    });
    void lockedCameraKey().then((key) => {
      if (!active) return;
      sealTo.current = key;
      look();
    });
    const stop = onLinkHeld(look);
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'background') awayAt.current = Date.now();
      if (state !== 'active' || awayAt.current === null) return;
      const left = awayAt.current;
      awayAt.current = null;
      const now = Date.now();
      if (now - left > RELOCK_AFTER_MS && left - calledAt.current > CALL_LEAVES_MS && now - linkAt.current > RELOCK_MS) setPhone(null);
    });
    return () => {
      active = false;
      stop();
      app.remove();
    };
  }, []);

  if (phone) {
    return <PhoneView params={phone} locked={{ onOpen: () => setPhone(null), onCalled: () => (calledAt.current = Date.now()) }} />;
  }
  if (camera) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <ErevosCamera
          visible
          place={null}
          folder=""
          sealTo={camera}
          onTaken={() => {
            took.current = true;
          }}
          onClose={() => {
            // What was taken is in the Collection once the password is given: it opens there.
            if (took.current) keepLink('erevos://collection');
            took.current = false;
            setCamera(null);
          }}
        />
      </View>
    );
  }
  return <PasswordGate key={lang} config={config} onUnlock={onUnlock} />;
}

// Whether Erevos's camera is in this build (Android, with the Collection's module).
const CAMERA_HERE = Platform.OS === 'android' && cameraView() !== null;

// The public key the camera seals for while Erevos is locked, or null when it waits for the
// password as every other link does: no camera here, the Collection off (lib/modules.ts), turned
// off in the Collection's settings, or no space opened yet (lock/camera-drop.ts).
async function lockedCameraKey(): Promise<Uint8Array | null> {
  return CAMERA_HERE && moduleOn('collection') ? dropKey() : null;
}

// A space opened, or shows again from behind the password screen: what the camera took for it
// while Erevos was locked comes into its Collection (lib/camera-drops.ts), and, behind a password,
// the locked camera takes for it from now on. A space that opens without a password has no
// password screen for the camera to open in front of, so no key is kept for it.
function cameraFollows(passwordLock: boolean): void {
  if (!CAMERA_HERE || !moduleOn('collection')) return;
  let place: ReturnType<typeof spaceCollection>;
  try {
    place = spaceCollection();
  } catch {
    return;
  }
  void (passwordLock ? publishDropKey(place.key) : forgetDropKey()).catch(() => undefined);
  void takeDrops(place).catch(() => undefined);
}

// With only the SMS or the Contacts open, a screen of the rest of the space: the password again, to open all of it,
// then that screen.
function AskAgain({ link }: { link: string }) {
  const { unlockAll } = useLock();
  const { colors } = useTheme();
  useEffect(() => {
    unlockAll(link);
  }, [unlockAll, link]);
  return <View style={{ flex: 1, backgroundColor: colors.ground }} />;
}

// The link Erevos's screens start with on Android, as a screen (lib/open-link.ts linkHref): the
// same one the router holds (app/+native-intent.ts). Undefined for none, or the home screen alone.
async function linkStartedWith(): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  const url = await Promise.race([Linking.getInitialURL().catch(() => null), new Promise<null>((done) => setTimeout(() => done(null), 500))]);
  return (url && linkHref(url)) || undefined;
}

// Opens the screen a link names, held while the password screen showed (lib/open-link.ts), once
// the screens are there, and each link that comes while the space is open. The home screen is
// under every other: back to it, not a second one. It, the Phone and Contacts, as the launcher's
// icons and the widget open them, show the link's tab again each time, also the same link after
// the owner chose another tab; another screen that shows already only takes the link's details.
// Erevos's own icon leaves one of its chats open. With only the SMS or the Contacts open, a link to anything else
// asks for the password again, as when Erevos is locked, then opens what it names (alone, for the SMS or the Contacts).
function OpenLink() {
  const ready = useRootNavigationState()?.key;
  const lock = useLock();
  const lockNow = useRef(lock);
  lockNow.current = lock;
  const pathname = usePathname();
  const { hidden } = useGlobalSearchParams<{ hidden?: string }>();
  const here = useRef({ path: pathname, hidden: false });
  here.current = { path: pathname, hidden: hidden === '1' };
  useEffect(() => {
    if (!ready) return;
    const open = () => {
      const href = takeLink();
      if (!href) return;
      const only = lockNow.current.only;
      if (only && onlyPartOf(href) !== only) {
        // An icon, the widget or a notice, for something else: the password again, as when Erevos
        // is locked (the Phone may open without it), which then opens what the link names, alone
        // when it is the SMS or the Contacts. Kept quietly, so this does not take it again.
        keepLink(hrefLink(href));
        lockNow.current.lockNow();
        return;
      }
      const { path, params } = linkParts(href);
      // With only the Contacts open, the home screen is the Contacts: their icon again goes back to it.
      if (only === 'contacts' && path === '/contacts' && !params.add) {
        if (here.current.path !== '/') router.dismissTo('/' as Href);
        return;
      }
      const move = linkMove(href, here.current);
      if (move === 'back') router.dismissTo({ pathname: path, params: screenParams(href) } as Href);
      else if (move === 'params') router.setParams(params);
      else if (move === 'push') router.push(href as Href);
    };
    open();
    return onLinkHeld(open);
  }, [ready]);
  return null;
}

// Takes the space's messages while it is open, whatever screen shows (lib/receiver.ts), from the
// relay, from phones nearby (lib/nearby-links.ts) and by SMS when that is on (lib/sms-way.ts), and those of its hidden chats that receive
// while closed (lib/place-receiver.ts), and tells it whether the app shows: only then
// do contacts hear the phone is open. SMS sent for later go from here too (lib/sms-later.ts), and
// the phone learns which SMS conversations have notifications of their own (lib/sms-notices.ts); the
// doors of the public groups the space owns are looked at (lib/space-public-groups.ts), and its
// calls ring (components/call-host.tsx). While the space is open, a call from a number linked to
// one of its contacts, or kept only in Erevos, shows their name (lib/known-names.ts). On Android,
// it goes on while Erevos is in the background, so a call rings (lib/background.ts); on Sailfish
// OS a helper waits at the relay for it then (lib/shell-watch.ts). All of it stops when the space
// closes, not with the screens (lib/space-running.ts).
function Receiver({ space }: { space: number }) {
  useEffect(() => {
    keepSpaceRunning(space, () => {
      // Only what the modules on use runs (lib/modules.ts): Erevos's own chats and calls, its
      // phone's names, the SMS sent for later, and the Matrix, XMPP and Nostr chats.
      const erevos = moduleOn('erevos');
      // Messenger, Signal and Session are the phone's: they run with its first space (lib/messenger-store.ts).
      const msg = space === 0 ? MSG_MODULES.filter((m) => moduleOn(m)) : [];
      const chats = erevos || moduleOn('nostr') || moduleOn('matrix') || moduleOn('xmpp') || moduleOn('telegram') || msg.length > 0;
      // A stopped space (lib/forget-me.ts) waits at no relay: its queues there are gone.
      const relays = !erevos ? [] : relayStopped() ? [watchStoppedPlaces()] : [startReceiver(), startPlaceReceiver(), startPublicDoors(), startShellWatch()];
      return [
        ...relays,
        ...(erevos ? [startNearbyLinks(), startSmsWay(), startLinkedAccounts(), startChunkChannel(), watchPlaceNetworks()] : []),
        ...(moduleOn('sms') ? [startSmsLater(), startSmsNotices()] : []),
        ...(moduleOn('phone') ? [watchKnownNames()] : []),
        // Receiving and ringing in the background, for what brings messages and calls; the phone's
        // calls and the SMS come through Android itself.
        ...(chats ? [startBackground()] : []),
        followAppShown(),
        ...(erevos || moduleOn('matrix') || moduleOn('xmpp') ? [watchCalls()] : []),
        ...(moduleOn('matrix') ? [startMatrix()] : []),
        ...(moduleOn('xmpp') ? [startXmpp()] : []),
        ...(moduleOn('telegram') ? [startTelegram()] : []),
        ...(msg.length ? [startMsgServices(msg)] : []),
        ...(moduleOn('nostr') ? [startNostrChats()] : []),
        // What the Matrix, XMPP and Nostr chats hold to send later goes at its time (lib/chat-later.ts).
        ...(moduleOn('matrix') || moduleOn('xmpp') || moduleOn('nostr') ? [startChatLater()] : []),
      ];
    });
    // A module turned on or off: what runs follows it.
    return onModulesChange(() => restartSpaceRunning());
  }, [space]);
  return null;
}

// The open space's Telegram runs while the space stays open, once it signed in (the ErevosGram
// build, lib/telegram-store.ts).
function startTelegram(): () => void {
  runTelegram();
  return stopTelegram;
}

// TDLib, in the ErevosGram build only (modules/erevos-telegram); null in every other.
setTelegramNative(telegramNative, currentLang);

// Messenger, Signal and Session run while the first space stays open (Erevos+ for Android,
// lib/messenger-store.ts), behind the password screen too: they stop only as the space closes.
function startMsgServices(on: readonly MsgService[]): () => void {
  void startMessenger(on);
  const shown = AppState.addEventListener('change', (state) => messengerInFront(state === 'active'));
  return () => {
    shown.remove();
    void stopMessenger();
  };
}

// The engines, in Erevos+ for Android only (modules/erevos-messenger); null in every other.
setMessengerNative(messengerNative);

// The open space's Matrix account syncs while the space stays open (lib/matrix-store.ts).
function startMatrix(): () => void {
  runMatrix();
  return stopMatrix;
}

// The open space's XMPP account stays connected while the space stays open (lib/xmpp-store.ts).
function startXmpp(): () => void {
  runXmpp();
  return stopXmpp;
}

// The open space's chats with other Nostr apps are read while the space stays open (lib/nostr-dm-store.ts).
// Its hidden places' own accounts run while their hidden chats are open (lib/place-networks.ts).
function startNostrChats(): () => void {
  runNostrDm();
  return stopNostrDm;
}

// The space shows while Erevos does and the password screen is not in front of it.
function followAppShown(): () => void {
  const follow = () => {
    const shown = AppState.currentState === 'active' && !spaceGated();
    setAppShown(shown);
    // When this space was last open, for its contacts' "last seen" (lib/last-seen.ts).
    let space: number | null = null;
    try {
      space = shown ? currentSpace().space : null;
    } catch {
      space = null;
    }
    spaceShown(space);
  };
  // While a hidden place's chats are open, only the place counts as open (lib/last-seen.ts).
  const hidden = onHiddenPlaceChange(() => {
    const open = openHiddenPlace();
    placeShown(open ? { space: open.space, pocket: open.pocket } : null);
  });
  follow();
  const subscription = AppState.addEventListener('change', follow);
  const gated = onSpaceGatedChange(follow);
  return () => {
    subscription.remove();
    gated();
    hidden();
  };
}

// Nothing of the space that was open stays in memory: what goes on for it stops, and its key and
// what was read of it go.
function closeSpace(): void {
  collectionLocked();
  closeWebPages();
  stopCollectionServers();
  stopSpaceRunning();
  setCurrentSpace(null);
  forgetSpaceChats();
  forgetPlaceChats();
  forgetSigns();
  forgetSpaceMover();
  forgetOffered();
  forgetLinks();
  forgetSpaceGroups();
  forgetSmsLink();
  forgetSpare();
  clearKnownNames();
  forgetHistory();
  forgetOpenedQueues();
  forgetWelcome();
  forgetTextInvite();
  forgetBackupMaking();
  leaveTor();
  setNostr(null);
  // With no space open nothing connects directly unasked (lib/direct.ts).
  setDirect(false);
  setRelayStopped(false);
  stopReleases();
  forgetRelayLine();
  forgetWays();
}

function openKey(): Uint8Array | null {
  try {
    return currentSpace().key;
  } catch {
    return null;
  }
}

function sameKey(a: Uint8Array | null, b: Uint8Array): boolean {
  return a !== null && a.length === b.length && a.every((byte, i) => byte === b[i]);
}
