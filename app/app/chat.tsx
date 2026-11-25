// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, BackHandler, Linking, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import { useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { takeCall } from '../lib/call-handoff';
import { CAN_KEEP_PRIVATE, keepPrivate, loadScreenPrivacy } from '../lib/screen-privacy';
import { notYoursToSee } from '../lib/see-once';
import { CAN_DIRECT, canLora, HAS_LINKS, HAS_RADIO, lora, SAMSUNG } from '../lib/radio';
import { CAN_GIVE } from '../lib/give-app';
import { pastedLink } from '../lib/open-link';
import { nearbyOn as nearbyOnNow, nearbySettings, setAwareKept, setCarryingKept, setDirectKept, setLanKept, setNearbyKept } from '../lib/nearby-links';
import { nearby, SMS_LINK, TooLargeForSlowWayError, TooLargeForSmsError, type Delivery, type NearHeard } from '../lib/nearby';
import { openHeldIn, openPlaceNearby, placeNear, unopenedNearby, type PlaceOpener } from '../lib/place-nearby';
import { canWait, dropHeld, handOverHidden, heldAfter, heldFor, keepUnsent, Owed, OwedError, sendWaiting, takeBack, type SendPlace, type Unsent, type Went } from '../lib/waiting';
import { currentCall, soon } from '../lib/call';
import { currentGroupCall } from '../lib/group-call';
import { inMatrixCall, onMatrixCallChange } from '../lib/matrix-calls';
import { callPermissions } from '../lib/call-permissions';
import { callLineMessage, callSignal, endCallsOf, onCallChange, startCall as beginCall, type CallPlace } from '../lib/calls';
import { shownLine } from '../lib/call-lines';
import { onSpaceCallLine, spaceCalls } from '../lib/space-calls';
import { rtc } from '../lib/webrtc';
import { canChangeVoice, clearLeftovers, playVoice, useVoiceRecorder } from '../lib/audio';
import { VOICE_KINDS, VOICE_NAMES, type VoiceKind } from '../lib/voice-change';
import { isWeakSecret, WEAK_SECRET } from '../lib/password-strength';
import { MAX_VOICE_MS, MIN_VOICE_MS, VoiceAssembler } from '../lib/voice';
import { deleteClip, loadClip, saveClip, type VoiceRef } from '../lock/voice-clips';
import { AUTO_TAKE, FileGoneError, fileSize, keepFile, MAX_FILE, offerRef, onRelay, PiecesMissingError, readFile, sendFile, takeFile, takeOffRelay, takesItself, bytesSource, refSource, type FileOffer, type Source } from '../lib/attachments';
import { canRingInBackground, loadMessageNotices, loadRingInBackground, messageCameAt, messageGone, screenOfChat, screenOfHidden, showOnScreen } from '../lib/background';
import { cleanFileName, cleanMime, deleteChunks, mimeOf, type FileKind, type FileMeta, type FileRef } from '../lock/attachment-files';
import { CAN_TAKE_PHOTOS, NoCameraError, pickPhoto, type PhotoQuality } from '../lib/pick-photo';
import { readQrPhoto } from '../lib/read-qr';
import { answerIntro, introduce, introsAsked, introsMade, takeIntro, type IntroSend } from '../lib/intros';
import { keepPieceFrom } from '../lib/pieces-kept';
import { sendsWithPlace } from '../lib/photo-place';
import { pickSource, TooLargeError } from '../lib/pick-file';
import { watchHiddenAway } from '../lib/hidden-away';
import { isPicking } from '../lib/picking';
import { loadPhotoQuality, savePhotoQuality } from '../lib/photo-quality';
import { saveFile, saveText } from '../lib/save-file';
import { chatText, exportName } from '../lib/chat-export';
import { FileViewer, openRefWith, shownOf, useShownPhotos } from '../components/attachment';
import { ComposerPanel, DraftComposer, IconButton, useDraft, type ComposerTile, type ComposerWay, type SendWay } from '../components/composer';
import { ConnectPicker, useCanConnect } from '../components/connect-picker';
import { KeyboardAwareScrollView, KeyboardPaddedView } from '../components/keyboard';
import { PasswordSheet } from '../components/PasswordSheet';
import { ChatStatusBar } from '../components/chat-look';
import { ChatPinGate } from '../components/chat-pin-gate';
import { canNotifyChats, ChatNotifySheet, notifyValue } from '../components/chat-notify-sheet';
import { QrCode } from '../components/QrCode';
import { ContactPicker } from '../components/contact-picker';
import { RelayInvites } from '../components/relay-invites';
import { RelaySignIn } from '../components/relay-signin';
import { WebsiteLink } from '../components/website-link';
import { WelcomeInvite } from '../components/welcome-invite';
import { ConnectStatus, MyQrCard, WayCard } from '../components/connect-cards';
import { Doors, Joined, Rest, type Door } from '../components/new-chat-doors';
import { NearMe } from '../components/near-me';
import { canPairWithCode, TheirCode } from '../components/their-code';
import { RelayKeyNote, useRelayCheck } from '../components/relay-key-note';
import { BackIcon, GlobeIcon, MoreIcon, PlusIcon, ShieldIcon, TimerIcon } from '../components/icons';
import { canDial, DialTile } from '../components/dial-tile';
import { CollectionSign, PhoneSign, ShortcutTile, VideoSign } from '../components/shortcut-tile';
import { AVATAR_COLORS, AVATAR_SIGNS, KeyFace } from '../components/key-face';
import { ThreadArrows, useThreadAway } from '../components/thread-arrows';
import { ThreadFollow } from '../lib/thread-follow';
import { Button, Chip, Field, Input, Page, Row, Sheet, Text, TextButton } from '../components/ui';
import { TorSwitch } from '../components/tor-switch';
import { useGlassBlur } from '../components/glass';
import { LaterPicker } from '../components/later-picker';
import { MessageMenu, type MenuAction } from '../components/message-menu';
import { deleteSms, maySendSms, sendSmsAgain, SmsForward, useChatSms } from '../components/sms-message';
import { UndoBar } from '../components/undo-bar';
import { SwipeBack } from '../components/swipe-back';
import { Pinned } from '../components/message-parts';
import { PLAYS_LAST, StickerPicker } from '../components/stickers';
import { PlaceSheet } from '../components/place-sheet';
import { CardSheet, saveCard } from '../components/card-share';
import { SelectBar, selectAction, useSelection } from '../components/select-bar';
import { PollSheet } from '../components/poll';
import { SpeechSheet } from '../components/speech-sheet';
import { TranslateSheet } from '../components/translate-sheet';
import { canWriteOut } from '../lib/speech';
import { canTranslate } from '../lib/translate';
import { languageOf } from '../lib/translate-ways';
import { acts, checkedChoices, choose as chooseOption, contentOf, editableWords, joinedText, placeWords, pollWords, pollOpen, previewAfterEdit, stillEditable, threadRoots, threadSizes, withoutPreview, type Carried, type Content, type Place, type Poll } from '../lib/chat-parts';
import { cardWords } from '../lib/card-share';
import { firstLink, fitPreview, previewWay } from '../lib/link-preview';
import { CAN_PREVIEW, makePreview } from '../lib/make-preview';
import { CAN_PLACE } from '../lib/place';
import { keepAsSticker, stickerMeta } from '../lib/own-stickers';
import { stickerOf } from '../lib/stickers';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { searchMessages, type Findable } from '../lib/message-search';
import { chatLines, isSmsLine, plainSmsHref, smsFailed, smsLineId, smsFindables } from '../lib/sms-chat';
import { canForward, forwardedTo, forwardToGroup, takeForward, voiceCopy, type Forwardable } from '../lib/forward';
import { isSharedPhoto, readShared, takeShared } from '../lib/share-in';
import { messageLine } from '../lib/message-line';
import { cameAt, canPick, laterLabel, showsAt } from '../lib/later';
import { inTurn, SAFETY_HOURS, safetyDue, stopSafety } from '../lib/safety';
import { ask, choose } from '../lib/alert';
import { fasouliPaidLink, payAmount, takePay, type Pay } from '../lib/pay';
import { contactLink, contactLinkName, offerFor, onContactOffered, parseContact, type ContactCode, type NostrCode, type Offer } from '../lib/contact-code';
import { onInviteOffered, parseInvite, type Invite } from '../lib/relay-invite';
import { forgetOffer, keepOffer, keptOffer, offerOf, takesOffer } from '../lib/relay-offer';
import { onWelcomeOffered, parseWelcome, START_RELAY, type Welcome } from '../lib/welcome';
import { connectReach } from '../lib/connect-reach';
import { oldToken, ownToken, signInRelay } from '../lib/relay-signin';
import { hostOf } from '../lib/relay-host';
import { circuitOf } from '../lib/tor-chats';
import { canGroup, canMatrix, canNostrChat, canRelaySeal, canSealOpen, canTor, canXmpp, hasCore } from '../lib/core';
import { accountLink, changedHere, linkedRole, onLinked, placeLinksNow } from '../lib/devices';
import type { ChatChange } from '../lib/link-wire';
import { BlockedContactError, E2E, ONLINE, toBase64Url, type ContactInfo, type Where, type Erase, type Extra } from '../lib/e2e';
import { sendCopies } from '../lib/fanout';
import { mediaText, SOURCE_LABELS } from '../lib/imports';
import { packMeta, sharable, shareSize, takeAskToShare } from '../lib/chat-share';
import { failed as buzzFailed } from '../lib/haptics';
import { beginShare, driveShares, dropReady, onShares, packCame, readyShare, roundsCame, shareLines, sharingNow, stopShare, takePack, takingCame, type ReadyShare, type ShareWay } from '../lib/share-rounds';
import { chatMedia, dayKey, daysOf, IMPORTED_TAG, importedTag, soundEnding } from '../lib/chat-media';
import { ChatMedia, DayCalendar } from '../components/chat-media';
import { ChatActions, useArrangedChats } from '../components/chat-actions';
import { ChatRow, MyselfRow } from '../components/chat-row';
import { MyselfChat } from '../components/myself-chat';
import { GroupChat } from '../components/group-chat';
import { GroupsWhereProvider, type GroupsWhere } from '../components/groups-at';
import { NewGroupForm } from '../components/new-group';
import { armPlaceReminders, myNotes, onNotesChanged, type Note, type NotesAt } from '../lib/myself';
import { dropChat, type ChatListPlace } from '../lib/chat-list';
import { buildInbox, groupRows, matrixInboxRows, mergeRows, nostrInboxRows, telegramInboxRows, telegramKeptRows, xmppInboxRows, type InboxGroup, type InboxRow } from '../lib/inbox';
import { onTelegramChange, telegramKeptChats, telegramNow, telegramShown } from '../lib/telegram-store';
import { matrixNow, onMatrixChange } from '../lib/matrix-store';
import { nostrDmNow, onNostrDmChange } from '../lib/nostr-dm-store';
import { onXmppChange, xmppNow } from '../lib/xmpp-store';
import { FoundExport, useImportFlow } from '../components/import-flow';
import { Archive, type LinkedMessage } from '../lock/archive';
import { MIN_PIN, openHidden, searchOpens, setHiddenPassword, type HiddenPlace } from '../lock/hidden';
import { loadWatched, rewatchLost, unwatchPocket, wasWatchedQueue, watchPocket } from '../lock/hidden-watch';
import { keepPlace, keepsPlace } from '../lock/hidden-keep';
import { isRingedQueue, loadRinged, moveRingPocket, ringPocket, unringPocket } from '../lock/hidden-ring';
import { CAN_COLLECT, importFromChat } from '../lib/collection-import';
import { useModules } from '../lib/modules';
import { hiddenPlaceOpen } from '../lock/collection-data';
import { hiddenHolder, POCKETS } from '../lock/sealed-file';
import { openOwnSticker, type OwnSticker, type StickerPlace } from '../lock/sticker-data';
import { makeChatPin, opensChat, RELOCK_MS } from '../lock/chat-pin';
import { MAX_SMS_WAY } from '../lock/sms-data';
import type { ChatNotify } from '../lock/chat-notify';
import { checkMove, moveChat } from '../lock/move-chat';
import { ownSpaceKey, SamePasswordError } from '../lock/config';
import { useLock } from '../lock/context';
import { LockedOutError, lockedOutMessage } from '../lock/tries';
import { cleanName, MAX_NAME, type Avatar, type Blocked, type Spare } from '../lock/e2e-data';
import { loadDevicesData } from '../lock/devices-data';
import { placeQueues, type QueueKind } from '../lock/queues-data';
import { onContactsCame } from '../lib/contact-queues';
import { QueueMove, linkOf, placeMoved, spaceMover, tookOf, type MoveWhy, type Took } from '../lib/queue-move';
import { FAKE_RINGS_WITHIN, fakeRings, linkSpare } from '../lib/moves';
import { HIDDEN_ANSWER_MS, HIDDEN_OFFER_MS, hiddenAnswerAt, lapseHiddenAnswer } from '../lib/hidden-ring';
import { savePhoto } from '../lock/avatar-photos';
import { pickAvatar } from '../lib/pick-avatar';
import { takeHidden } from '../lib/hidden-handoff';
import { HiddenCallWaiting } from '../components/hidden-ring-screen';
import { setOpenHiddenPlace, useOpenHiddenPlace } from '../lib/hidden-contacts';
import { giveLinkedName } from '../lib/linked-name';
import { linkCard, onSealedChange, type Place as SealedPlace } from '../lib/sealed-contacts';
import { linkedCardNumber, type Among, type Card as ContactCard } from '../lib/contact-book';
import { History, isTag, newTag, WAITING, withMark, type Mark, type Message as Kept, type Parts, type Route } from '../lock/history';
import { currentSpace } from '../lock/keys';
import { changedRelaySettings, loadCurrentSpaceData, loadHiddenData, loadSpaceData, NO_LENDING, relaySettingsOf, updateCurrentSpaceData, updateHiddenData, updateSpaceData, watchHiddenData, watchSpaceData, type Queue, type RelaySettings, type SpaceData } from '../lock/space-data';
import { isGroupPacket, memberName, noteText, type GroupInfo } from '../lib/groups';
import { groupCallSignal, onGroupCallChange } from '../lib/group-calls';
import { spaceGroups, takeGroupPacket, takeGroupSignal } from '../lib/space-groups';
import {
  askRelayKey,
  borrowPlace,
  callRelay,
  carryTo,
  createQueue,
  fromHex,
  isLentToken,
  isQueueNotFound,
  lendTicket,
  makeInvite,
  receiveMessage,
  redeemInvite,
  relayKey,
  RelayUnreachableError,
  sameRelay,
  sendMessage,
  takeOwnLine,
  throughTor,
  ticketExpires,
  toHex,
  warmCallRelay,
  type CallRelay,
  type HeldAt,
  type Mark as RelayMark,
  type Relay,
} from '../lib/relay';
import { announceReceived, answersAsk, appShown, awayPace, awayQueues, holdReceiver, isNews, lookNow, openNearby, shownPace, takeNearby, takeNostr, tellOpenLater, waitWhileAway, type Waited } from '../lib/receiver';
import { nostrOwnTor, nostrReady, readNostr } from '../lib/nostr';
import { netThroughTor } from '../lib/net-http';
import { callIpWarning, ipGate, IpQuiet } from '../components/ip-warning';
import type { IpKeep } from '../lib/ip-warning';
import { goesInPieces, NOSTR_FILE_LIMIT, NostrFileTooLargeError, offerOnNostr } from '../lib/nostr-send-files';
import { onPiece } from '../lib/nostr-pieces';
import { useNfcShare } from '../lib/nfc-share';
import { answerInvites, answerTextInvite, contactCard, expireTextInvites, linkInviter, refreshSmsLink, spaceSmsLink, takeInviteAnswer } from '../lib/sms-relay';
import { onTextInviteOffered, parseTextInvite, type TextInvite } from '../lib/text-invite';
import { carriedFor, contactTarget, markOf, relayFor, ringOffer, sendSealed, sentMark, setLastSeen, setTellOpen, spaceChats, type SpaceChats } from '../lib/space-chats';
import { placeChats, setPlaceLastSeen, setPlaceTellOpen } from '../lib/place-chats';
import { myNameAt, setMyNameAt } from '../lib/my-name';
import { answerPlaceGroupCalls, placeGroupsAt } from '../lib/place-groups';
import { holdPlace, takePlaceCalls } from '../lib/place-receiver';
import { nostrOnlyWay, nostrReaderOf, onNostrWent, orNostr, sendNostrAgain, sendNostrBackups, type ForNostr } from '../lib/nostr-chats';
import { forgetSpare, hiddenSpare, homeRelays, lookAtSpare, readySpare, setSpareRelay, spaceSpare, spareBackup, spareCode } from '../lib/spare';
import { space } from '../theme/colors';
import { bubbleStyles } from '../theme/bubbles';
import { useColors, useStyles, useTheme } from '../theme/context';
import { ChatTheme, type ChatLook } from '../theme/chat-theme';
import { callAudio } from '../modules/erevos-call';
import { sendSms, smsPacketsReady, type SmsMessage } from '../modules/erevos-sms';
import { ScreenBackdrop } from '../components/backdrop';
import { AppearanceEditor } from './appearance';
import { t, plural, locale } from '../lib/i18n';
import { SCAM_LOOKED, SCAM_SAYS, scamSigns } from '../lib/scam-shield';
import { lastSeenText, onShownEnded } from '../lib/last-seen';
import {
  type Message,
  type Receipts,
  isCallLine,
  LOOK_EVERY,
  LOOK_IN_CALL,
  NOSTR_LOOK,
  NOSTR_LOOK_AWAY,
  NOTE_SHOWN,
  ASK_EVERY,
  TYPING_EVERY,
  TYPING_SHOWS,
  RECEIVE_BATCH,
  TICKET_KEPT,
  LORA_SHOWN,
  CONTACT_PREFIX,
  contactName,
  label,
  errorText,
  NO_CORE,
  TIMERS,
  scheduled,
  timerLabel,
  IMPORTED_PAGE,
  THREAD_PAGE,
  NEAR_PHOTOS,
  useTyped,
} from '../lib/chat-screen';
import { shownAnew } from '../lib/shown-anew';
import { QuickAction, DetailRow, SearchStep, dayOf, dayText, clock, dayLabel, type RowActs, steadyActs, MessageLine, SmsLine, ImportedLine, makeStyles } from '../components/chat-thread-lines';

// Chat with contacts, end-to-end encrypted (lib/e2e.ts), through the relay and, while their phone
// is near, over the radio link too (lib/nearby.ts), where phones nearby may also carry a message
// to the contact's relay when ours cannot be reached. A contact is added from their contact link, which
// carries their public keys: adding it starts the conversation, and they see the contact appear
// when they next look at the relay. The contacts and their conversations are kept sealed
// (lock/e2e-data.ts), with the names given to them, and so are the messages with them
// (lock/history.ts). One message, or all of a chat's, can be deleted here only or on both phones
// (Erase in lib/e2e.ts). Our messages to a contact are marked ✓ once the relay took them, ✓✓ once
// their phone says they came, and ✓✓✓ once it says they were read; theirs are read here while
// their chat shows on the screen. A chat's new messages, or a single one, can disappear on both
// phones a time after they are read (the timer in lib/e2e.ts). Voice messages are recorded while
// the message bar's microphone is held (lib/audio.ts, components/composer.tsx), travel in parts
// (lib/voice.ts), and each one's sound is kept in a sealed file of its own (lock/voice-clips.ts). Photos and files go through the relay's file store
// (lib/attachments.ts): ours are kept here as they went, theirs are taken from the relay at once
// up to AUTO_TAKE, larger ones when tapped. A photo shows from memory only, never written out
// unsealed; Save puts a copy outside Erevos. Voice and video calls to a contact (lib/call.ts) are
// set up with messages through the relay and then go between the phones, through the call relay
// beside our relay when it has one; each call leaves a line in the chat.
//
// Every space also has hidden chats (lock/hidden.ts), opened with their own PIN typed in the home
// screen's search, which every space takes whether it has hidden chats or not, and a chat can move
// into them from its details (lock/move-chat.ts). They are a
// second chat with their own relay queue, account and contacts, over the relay, and to a contact's
// phone nearby once they heard it there themselves (lib/place-nearby.ts: the radio link is the
// phone's, what comes on it opens in the space's chats first, and the space never learns where a
// hidden contact is). The other chats stay open underneath and
// keep receiving. Hidden chats close when the app goes to the background or this screen closes,
// and their messages go with them.
//
// A chat brought in from another messenger (lock/archive.ts) can go on with one of the space's
// contacts: its messages show ahead of theirs, only to read, and a contact without a name takes
// the imported chat's. They are never sent, and stay when this chat's messages are deleted.
//
// While Erevos may read the phone's SMS, the SMS and MMS with a contact's number (linked to them,
// or on a contact card of theirs) show among their messages by time, each marked as a plain SMS
// (lib/sms-chat.ts, components/sms-message.tsx). They stay in the phone's SMS, never in the chat's
// history, and never show in hidden chats. The details open the plain SMS conversation, to write
// one there, and Attach sends what is typed as an SMS.


/** How long a relay address stays the same before its queue is made by itself (#11). */
const AUTO_QUEUE_MS = 3000;
export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // A contact to open with (from the home screen, or an imported chat that goes on with them),
  // hidden chats opened from the home screen's search (their key handed over in memory), or New
  // chat (`setup=1`, which shows the same as with no contact), with For advanced users, the relay's
  // own settings, open (`setup=relay`), its phones nearby open (`setup=nearby`, from Ways and the
  // home screen's Nearby phones while they are off), with Invite someone's QR code (`setup=invite`, the home
  // screen's Invite), or on I have their code (`setup=code`, First steps' I have an invite). `at`:
  // the tag of a message to go to, starred or found. A call to start with the contact comes only
  // from a tap in Erevos (lib/call-handoff.ts), never from the address, which any app or web page
  // can open.
  const { contact, hidden, setup, phone, at } = useLocalSearchParams<{
    contact?: string;
    hidden?: string;
    setup?: string;
    phone?: string;
    at?: string;
  }>();
  const fromSearch = hidden === 'open';
  // A hidden contact's call answered with no PIN (components/hidden-ring-screen.tsx): the place's
  // chats run for the call alone, never shown, and close as it ends.
  const callOnly = hidden === 'call';
  // Drawn again as a call comes and goes, for the waiting screen of a call answered with no PIN.
  const [, setCallsChanged] = useState(0);
  useEffect(() => (callOnly ? onCallChange(() => setCallsChanged((n) => n + 1)) : undefined), [callOnly]);
  const [hiddenPlace, setHiddenPlace] = useState<HiddenPlace | null>(() => (fromSearch || callOnly ? takeHidden() : null));
  const hiddenKey = hiddenPlace?.key ?? null;
  // Hidden chats keep out of screenshots and the recent apps preview while open, as long as
  // Screenshots in Privacy and security is on (the default); turned off, they allow them as the
  // other chats do.
  useEffect(() => {
    if (!hiddenKey) return;
    let live = true;
    let kept = false;
    void loadScreenPrivacy()
      .catch(() => true)
      .then((on) => {
        if (!live || !on) return;
        kept = true;
        keepPrivate('hidden', true);
      });
    return () => {
      live = false;
      if (kept) keepPrivate('hidden', false);
    };
  }, [hiddenKey]);
  // Hidden chats opened from the search close back to the home screen, with their contacts
  // screens over them (app/contacts.tsx).
  const closeHidden = () => {
    setHiddenPlace(null);
    if (fromSearch || callOnly) router.dismissTo('/');
  };
  const [asking, setAsking] = useState(false);
  const initial = typeof contact === 'string' && /^[0-9a-f]{64}$/.test(contact) ? `${CONTACT_PREFIX}${contact}` : null;
  // A number linked by hand from its SMS conversation (app/sms.tsx).
  const linkNumber = initial && typeof phone === 'string' && /^\+?\d{3,20}$/.test(phone) ? phone : '';
  const [initialCall] = useState(() => (initial ? takeCall(contact!) : null));
  // The look of the chat in view (its own, or the space's), as the chat showing says.
  const [chatLook, setChatLook] = useState<ChatLook | null>(null);

  // Hidden chats close once Erevos was away more than RELOCK_MS, as a chat's own PIN locks again,
  // while it is away too, but not in a call (then once it ends), nor while a photo or a file is
  // picked for them (lib/hidden-away.ts).
  useEffect(
    () =>
      watchHiddenAway(
        () => {
          closeHidden();
          setAsking(false);
        },
        {
          onAppState: (listener) => {
            const subscription = AppState.addEventListener('change', listener);
            return () => subscription.remove();
          },
          onCallChange: (listener) => {
            const stopCall = onCallChange(listener);
            const stopGroupCall = onGroupCallChange(listener);
            const stopMatrixCall = onMatrixCallChange(listener);
            return () => {
              stopCall();
              stopGroupCall();
              stopMatrixCall();
            };
          },
          inCall: () => !!(currentCall() || currentGroupCall()) || inMatrixCall(),
          picking: isPicking,
        },
      ),
    [],
  );

  if (Platform.OS === 'ios') {
    return (
      <ScreenBackdrop>
        <Page>
          <BackButton />
          <Text tone="muted">{t('Chat runs on Android and on a computer for now.')}</Text>
        </Page>
      </ScreenBackdrop>
    );
  }

  // The message field rises with the keyboard, and clears the phone's navigation bar without it.
  // The chat has no header of its own: its top row has the back arrow, and it draws its backdrop
  // in its own look from the status bar down.
  return (
    <ChatTheme look={chatLook?.look ?? null} onChange={(look) => chatLook?.save(look)}>
      <ScreenBackdrop>
        <ChatStatusBar />
        <KeyboardPaddedView bottom={insets.bottom} style={layout.screen}>
          <View style={[layout.screen, hiddenKey && layout.gone]}>
            <Chat
              hiddenKey={null}
              initial={initial}
              at={initial && typeof at === 'string' && isTag(at) ? at : null}
              initialCall={initialCall}
              linkNumber={linkNumber}
              relaySettings={setup === 'relay'}
              nearbyOpen={setup === 'nearby'}
              inviteNow={setup === 'invite'}
              codeNow={setup === 'code'}
              shown={!hiddenKey}
              onLook={setChatLook}
            />
          </View>
          {hiddenKey && callOnly ? (
            <View style={layout.gone}>
              <Chat hiddenKey={hiddenKey} pocket={hiddenPlace?.pocket ?? 0} shown={false} callOnly onHidden={closeHidden} onLook={() => undefined} />
            </View>
          ) : null}
          {/* Until the call answered with no PIN comes, the nameless call screen says it connects, with End. */}
          {hiddenKey && callOnly && !currentCall() ? <HiddenCallWaiting onEnd={closeHidden} /> : null}
          {hiddenKey && callOnly ? null : hiddenKey ? (
            <Chat hiddenKey={hiddenKey} pocket={hiddenPlace?.pocket ?? 0} shown onHidden={closeHidden} onChangePassword={() => setAsking(true)} onLook={setChatLook} />
          ) : null}
          <PasswordSheet
            visible={asking}
            title={t('Change hidden chats PIN')}
            repeat
            warnWeak
            submitLabel={t('Save')}
            onClose={() => setAsking(false)}
            onSubmit={async (password) => {
              await setHiddenPassword(currentSpace().space, hiddenPlace?.pocket ?? 0, password, hiddenKey);
              setAsking(false);
            }}
          />
        </KeyboardPaddedView>
      </ScreenBackdrop>
    </ChatTheme>
  );
}

/** Back to the screen before, or home when the chat was opened first; or `onPress`. */
function BackButton({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      accessibilityRole="button"
      accessibilityLabel={t('Back')}
      hitSlop={8}
      style={({ pressed }) => [layout.back, pressed && { opacity: 0.6 }]}
    >
      <BackIcon color={colors.text} size={24} />
    </Pressable>
  );
}

// One chat: the space's own (`hiddenKey` null), or hidden chats, sealed with that key, in the
// space's `pocket` of them.
function Chat({ hiddenKey, pocket = 0, initial = null, at = null, initialCall = null, linkNumber = '', relaySettings = false, nearbyOpen = false, inviteNow = false, codeNow = false, shown, callOnly = false, onHidden, onChangePassword, onLook }: {
  hiddenKey: Uint8Array | null;
  pocket?: number;
  initial?: string | null;
  /** The tag of a message of the `initial` chat to go to once it shows. */
  at?: string | null;
  /** A call to start with the `initial` contact once the chat is loaded. */
  initialCall?: 'voice' | 'video' | null;
  /** A phone number to link to the `initial` contact. */
  linkNumber?: string;
  /** Opens with For advanced users open, the relay's own settings (Settings → Relay). */
  relaySettings?: boolean;
  /** New chat with its phones nearby open, where they are turned on. */
  nearbyOpen?: boolean;
  /** Opens with Invite someone's QR code showing (the home screen's Invite), when this phone can invite. */
  inviteNow?: boolean;
  /** Opens on I have their code: an invite or a link to scan, paste or type (First steps' I have an invite). */
  codeNow?: boolean;
  shown: boolean;
  /** Hidden chats run only for a call answered with no PIN (ChatScreen): its screen shows no name, and they close as it ends. */
  callOnly?: boolean;
  /** Closes the hidden chats. */
  onHidden?: () => void;
  onChangePassword?: () => void;
  /** Told the look of the chat in view while this one shows: its contact's own, or none. */
  onLook: (look: ChatLook | null) => void;
}) {
  // Bumped when a phone nearby links or goes, or a contact is heard nearby (lib/nearby.ts).
  const [, setNearbyChanged] = useState(0);
  // Whether this phone carries messages from phones nearby to their relays (lib/nearby.ts), and
  // whether it looks for Erevos on the same Wi-Fi (lib/radio.ts).
  const [carrying, setCarrying] = useState(true);
  // Whether this phone looks for phones nearby at all: off unless turned on (lib/nearby-links.ts).
  const [nearbyOn, setNearbyOn] = useState(false);
  const [lanOn, setLanOn] = useState(true);
  // Whether this phone makes the preview of a link it sends, in the space's chats (SpaceData.previews),
  // and whether only through Tor (SpaceData.previewsTor).
  const [previews, setPreviews] = useState(false);
  const [previewsTor, setPreviewsTor] = useState(false);
  // Whether the space's contacts see when it was last open, and it sees theirs (SpaceData.lastSeen).
  const [lastSeenOn, setLastSeenOn] = useState(true);
  // With it on, whether they are told, unasked, that Erevos opened (SpaceData.tellOpen).
  const [tellOpenOn, setTellOpenOn] = useState(true);
  // Whether these hidden chats say a message came while they are closed (lock/hidden-watch.ts).
  const [watched, setWatched] = useState(false);
  // Whether these hidden chats receive while closed, as the space's chats do (lock/hidden-keep.ts).
  const [receiving, setReceiving] = useState(false);
  // The name these hidden chats go by (lib/my-name.ts): null until read.
  const [placeName, setPlaceName] = useState<string | null>(null);
  // Whether a dot on the search of the space's chats says these hidden chats have a message unread (SpaceData.sign, lib/unread-signs.ts).
  const [placeSign, setPlaceSign] = useState(false);
  // Whether the Collection is on, for its way in at the top of hidden chats (lib/modules.ts).
  const modules = useModules();
  const watchedNow = useRef(false);
  watchedNow.current = watched || receiving;
  // The links of these chats' own devices (lib/devices.ts): the space's, or these hidden chats' own,
  // which the space's never hear of. What the phone keeps for both, a linked device leaves to it.
  const placeLinked = () => (hiddenKey ? placeLinksNow(currentSpace().space, pocket) : null);
  const linkHere = () => (hiddenKey ? (placeLinked()?.accountLink() ?? null) : accountLink());
  // Whether these chats are still open: false once they close and this screen goes.
  const hiddenOpen = useRef(true);
  useEffect(
    () => () => {
      hiddenOpen.current = false;
    },
    [],
  );
  // These hidden chats' own Chat with myself (components/myself-chat.tsx): whose notes, the phone
  // telling their reminders only while the place receives closed; the notes, for its row at the
  // top of their chats; and whether it shows in place of them.
  const notesAt = useMemo<NotesAt | null>(
    () => (hiddenKey ? { place: { holder: hiddenHolder(pocket), space: currentSpace().space, key: hiddenKey }, arm: receiving } : null),
    [hiddenKey, pocket, receiving],
  );
  const [placeNotes, setPlaceNotes] = useState<Note[] | null>(null);
  const [myselfShown, setMyselfShown] = useState(false);
  // In hidden chats, one of their groups shown over them (components/group-chat.tsx), or a new one being made.
  const [shownGroup, setShownGroup] = useState<string | null>(null);
  const [makingGroup, setMakingGroup] = useState(false);
  const [placeGroupList, setPlaceGroupList] = useState<InboxGroup[]>([]);
  useEffect(() => {
    if (!notesAt) return;
    let live = true;
    const load = () => myNotes(notesAt).then((list) => live && setPlaceNotes(list), () => undefined);
    void load();
    const off = onNotesChanged(() => void load());
    return () => {
      live = false;
      off();
    };
  }, [notesAt]);
  const [watchNote, setWatchNote] = useState('');
  // Whether these hidden chats ring their contacts' calls while closed (lock/hidden-ring.ts), and
  // their ring queue, kept with the place (its own relay). Only set for hidden chats.
  const [ringing, setRinging] = useState(false);
  const [ringQueue, setRingQueue] = useState<Queue | null>(null);
  const [ringNote, setRingNote] = useState('');
  // What Settings → Notifications → In the background lets these hidden chats do while closed, as
  // last read: their switches below save either way, and say so when it lets them do nothing yet.
  const [background, setBackground] = useState<{ on: boolean; notices: boolean } | null>(null);
  // Set while a preview is being made, so the words do not go twice.
  const previewing = useRef(false);
  const editGoing = useRef(false);
  const [directOn, setDirectOn] = useState(!SAMSUNG);
  const [awareOn, setAwareOn] = useState(!SAMSUNG);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(initial);
  // Counts the times a hidden place's chat was opened from outside, so what was handed to it goes even if it was open already.
  const [arrival, setArrival] = useState(0);
  // A chat locked with a PIN of its own (lock/chat-pin.ts) shows only once its PIN is typed, until
  // another chat shows, this one closes, or Erevos was away more than RELOCK_MS. Meanwhile nothing
  // is read or told from it. None asks in hidden chats.
  const [unlocked, setUnlocked] = useState('');
  useEffect(() => setUnlocked((was) => (was === selected ? was : '')), [selected]);
  useEffect(() => {
    let away = 0;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') away = Date.now();
      else if (state === 'active' && away) {
        if (Date.now() - away > RELOCK_MS) setUnlocked('');
        away = 0;
      }
    });
    return () => subscription.remove();
  }, []);
  const gated = !hiddenKey && !!selected && selected !== unlocked && contacts.some((c) => c.locked && `${CONTACT_PREFIX}${c.identity}` === selected);
  // What asks for a PIN in a chat's details: a new one to lock it with, or its own to take it off.
  const [pinAsk, setPinAsk] = useState<'on' | 'off' | null>(null);
  // Whether the chat's own notifications show (Chat details → Notifications).
  const [notifying, setNotifying] = useState(false);
  const lock = useLock();
  const [messages, setMessages] = useState<Message[]>([]);
  // A message passed on from an SMS conversation (lib/forward.ts) starts in the field.
  const { draft, empty: nothingTyped } = useDraft(() => (initial ? (forwardedTo(initial)?.text ?? '') : ''));
  // What was typed in each chat and not sent, while this screen is up: a chat left keeps its words
  // for when it opens again, and another chat never starts with them (a PIN-locked one's least of all).
  const drafts = useRef(new Map<string, string>());
  const draftOf = useRef(selected);
  const [note, setNote] = useState('');
  // With no chat open, New chat's pages (components/new-chat-doors.tsx): its first one asks where
  // the other person is, and each answer, and each of the three small buttons under them, is a
  // page of its own. Opened from elsewhere on one of them (the relay's settings, the phones nearby,
  // the home screen's Invite, First steps' I have an invite), Back leaves New chat as it came, not
  // for its first page.
  const [door, setDoor] = useState<Door>(relaySettings || nearbyOpen ? 'advanced' : inviteNow ? 'far' : codeNow ? 'code' : 'root');
  const doorFromOutside = useRef(relaySettings || nearbyOpen || inviteNow || codeNow);
  const doorNow = useRef(door);
  doorNow.current = door;
  // You are connected, where the doors end: who was just added.
  const [joined, setJoined] = useState<string | null>(null);
  // Near me's own QR code: the contact link's, once an invite could not be made (with no internet, say).
  const [nearPlain, setNearPlain] = useState(false);
  // Under For advanced users: which way in shows what it needs, for a phone with no relay yet, and
  // what opens under Nearby, with no internet.
  const [way, setWay] = useState<'invite' | 'own' | null>(null);
  const [nearbyShown, setNearbyShown] = useState(nearbyOpen);
  // Where a phone with no relay yet signs in: LPHL's relay, or another typed in its place (Another
  // relay…), whose own provider then names the card (components/relay-signin.tsx).
  const [signInAt, setSignInAt] = useState(START_RELAY);
  const [otherRelay, setOtherRelay] = useState<string | null>(null);
  // The chat's details, over the chat: its picture, name, timer, look, safety number, moving it.
  const [details, setDetails] = useState(false);
  // The chat's media, links and files, each kind apart (components/chat-media.tsx), and the
  // calendar that goes to a day of the chat.
  const [mediaOpen, setMediaOpen] = useState(false);
  const [dayPicking, setDayPicking] = useState(false);
  // The chat's own look being chosen, over the chat.
  const [styling, setStyling] = useState(false);
  const insets = useSafeAreaInsets();
  // A narrow phone (360 wide): the top bar's picture is smaller, and "Encrypted" goes without its
  // shield, so the word fits beside the three buttons.
  const narrow = useWindowDimensions().width < 400;
  const [relayUrl, setRelayUrl] = useState('');
  const [relayToken, setRelayToken] = useState('');
  // Our relay's key for sealed sends, put in our link so contacts on other relays can reach us.
  const [ownRelayKey, setOwnRelayKey] = useState('');
  // A ticket for a place on our relay, put in our link for whoever adds us with no relay of their own,
  // only once chosen for the link shown now: each time the chat opens, the link goes without one.
  const [sharePlace, setSharePlace] = useState(false);
  const [ownTicket, setOwnTicket] = useState('');
  const [placeNote, setPlaceNote] = useState('');
  // The second relay for two-hop sending (lib/relay.ts), empty when not used.
  const [viaUrl, setViaUrl] = useState('');
  const [viaToken, setViaToken] = useState('');
  // A lent token works on the relay that lent it only: with another relay typed in, it goes.
  const typedRelay = useTyped(relayUrl, (url) => {
    if (isLentToken(relayToken) && !sameRelay(url, relayUrl)) setRelayToken('');
    setRelayUrl(url);
  });
  const typedToken = useTyped(relayToken, setRelayToken);
  const typedVia = useTyped(viaUrl, setViaUrl);
  const typedViaToken = useTyped(viaToken, setViaToken);
  const [ownQueue, setOwnQueue] = useState<Queue | null>(null);
  // The queue the contact link names, while it is not the own queue (lib/queue-move.ts), and who is
  // blocked here. The moves of this chat's own queue: the space's, or these hidden chats' own.
  const [linkQueue, setLinkQueue] = useState<Queue | null>(null);
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const mover = useRef<QueueMove | null>(null);
  const [contactDraft, setContactDraft] = useState('');
  // Whose contacts these chats' are (lib/sealed-contacts.ts): the space's, or these hidden chats' only.
  const contactsPlace = useMemo<SealedPlace>(() => {
    const { space, key } = currentSpace();
    return { holder: hiddenKey ? hiddenHolder(pocket) : 'space', space, key: hiddenKey ?? key };
  }, [hiddenKey, pocket]);
  // A contact just added here, under Add a contact, that has no name: offered to connect
  // to one of my contacts (components/connect-picker.tsx), whose name it then takes. Its chat shows
  // the offer until another chat shows, it gets a name, or Not now.
  const [connecting, setConnecting] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [pickNote, setPickNote] = useState('');
  // The hidden chats lent to the contacts screens, which are these when hidden (null until they are).
  const hiddenLent = useOpenHiddenPlace();
  const among: Among = hiddenKey ? hiddenLent : 'space';
  const canConnect = useCanConnect(among);
  const [showQr, setShowQr] = useState(false);
  // Whether the relay proved its key (components/relay-key-note.tsx): New chat says how this phone
  // connects only while something needs saying (#11).
  const relayKeyCheck = useRelayCheck(relayUrl.trim());
  // Your contact link in short, as a contact card (lib/sms-relay.ts contactCard): the QR code shown
  // and the link shared, small enough for any camera; null while there is none. `bigQr`: the long
  // link's QR code instead, which works with no internet, near.
  const [card, setCard] = useState<string | null>(null);
  const [bigQr, setBigQr] = useState(false);
  // Link for a website (components/website-link.tsx), from the space's contact link.
  const [webLinking, setWebLinking] = useState(false);
  // An invite's link pasted on a phone with no relay yet.
  // With when their account's linked devices last changed (`devices`, ms), or 0 while it has none this chat knows of.
  // Introductions (lib/intros.ts): changes as one is made, answered or comes. `introducing`: the
  // contact chosen to introduce the open chat's contact to, while choosing.
  const [introTick, setIntroTick] = useState(0);
  const [introducing, setIntroducing] = useState<string | null>(null);
  const [introNote, setIntroNote] = useState('');
  const [safety, setSafety] = useState<{ peer: string; number: string; devices: number; code: string; verified: number; note: string } | null>(null);
  // The contact being named, and the name typed so far.
  const [renaming, setRenaming] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  // The part of the details opened under its row: the picture, the timer, or moving the chat.
  const [opened, setOpened] = useState<'picture' | 'timer' | 'move' | 'space' | 'back' | 'starred' | null>(null);
  // Moving the chat into the hidden chats: the PIN typed, whether new hidden chats are being
  // started with it (asked a second time), what went wrong, and while it moves.
  const [pinDraft, setPinDraft] = useState('');
  const [startingNew, setStartingNew] = useState(false);
  // A short PIN for new hidden chats is taken only once asked for again (components/PasswordSheet.tsx).
  const [weakPinSeen, setWeakPinSeen] = useState<string | null>(null);
  const weakNewPin = startingNew && isWeakSecret(pinDraft);
  // The place, of the space's POCKETS, new hidden chats are started in: the owner remembers which
  // they used, as nothing on the phone can tell.
  const [newPocket, setNewPocket] = useState<number | null>(null);
  const [moveNote, setMoveNote] = useState('');
  // The password of the space a chat moves into (moveToOtherSpace).
  const [passwordDraft, setPasswordDraft] = useState('');
  // That space has no relay yet: whether it is offered this space's (a second tap moves with it).
  const [relayOffer, setRelayOffer] = useState(false);
  const [moving, setMoving] = useState(false);
  const router = useRouter();
  const [e2e, setE2E] = useState<E2E | null>(null);
  // The space's chats as soon as they are open, before a look at the relay under way ends (held):
  // only for this phone's contact link and QR codes, which need no look to end, so New chat shows
  // them at once. Everything else waits for e2e.
  const [earlyE2E, setEarlyE2E] = useState<E2E | null>(null);
  const linkE2E = e2e ?? earlyE2E;
  // Chats imported into this space, or into these hidden chats: theirs, kept only in their chats.
  const [archive, setArchive] = useState<Archive | null>(null);
  // Counts the changes to what was imported made here (lock/archive.ts changes in place).
  const [archiveTick, setArchiveTick] = useState(0);
  // What bringing in a chat from the details has to say.
  const [importSaid, setImportSaid] = useState('');
  const [importedShown, setImportedShown] = useState(IMPORTED_PAGE);
  const [threadShown, setThreadShown] = useState(THREAD_PAGE);
  // Read away from the chat's end (gone to its start with its arrow, or to an early message): the
  // stretch of it drawn, from..to, counted over what was imported and then the thread. Null while
  // the thread is drawn to its end.
  const [stretch, setStretch] = useState<{ from: number; to: number } | null>(null);
  // How many lines the thread had when earlier SMS were asked for, to draw those that come.
  const smsAsked = useRef<number | null>(null);
  // Set when earlier imported messages are shown, so the thread does not jump to its end.
  const holdScroll = useRef(false);
  // Where the thread is read and how tall it is, as last scrolled or laid out; and, while earlier
  // messages are drawn above what is read, where that was, so it stays there.
  const readAt = useRef({ offset: 0, height: 0, seen: 0 });
  const above = useRef<{ offset: number; height: number } | null>(null);
  // Set while more is drawn as the thread nears an end of what shows, or while an arrow goes to an
  // end: nothing more is asked for until the thread has grown.
  const growing = useRef(false);
  // Whether the thread is going to its end by itself (lib/thread-follow.ts), so its scrolling on the
  // way draws no earlier messages; and whether it was at the end once since the chat opened, after
  // which it goes there animated as it grows.
  const follow = useRef(new ThreadFollow());
  const endShown = useRef(false);
  // The next message disappears, this long (seconds) after it is read: the stopwatch in the bar.
  const [vanishing, setVanishing] = useState(false);
  const [vanishFor, setVanishFor] = useState(3600);
  // The message whose menu is open (held down), the one the next is an answer to, and the one just
  // gone to, lit a moment.
  const [menuFor, setMenuFor] = useState<Message | null>(null);
  // Each opening of a message's menu, so each is a menu of its own (components/message-menu.tsx).
  const [menuTurn, setMenuTurn] = useState(0);
  // A voice message being written out (components/speech-sheet.tsx): how its sound is read.
  const [hearing, setHearing] = useState<(() => Promise<Uint8Array | null>) | null>(null);
  // The text of the message being translated (components/translate-sheet.tsx), or null.
  const [translating, setTranslating] = useState<string | null>(null);
  const [replying, setReplying] = useState<Message | null>(null);
  // A thread of the chat shown alone, by the tag of its first message (null: the whole chat), as in a group.
  const [threadRoot, setThreadRoot] = useState<string | null>(null);
  // The message of ours the bar gives new words, while it does (sendEdit).
  const [editing, setEditing] = useState<Message | null>(null);
  // One of the SMS among the messages held down, and the one being passed on (lib/sms-chat.ts).
  const [smsMenuFor, setSmsMenuFor] = useState<SmsMessage | null>(null);
  const [smsForwarding, setSmsForwarding] = useState<SmsMessage | null>(null);
  const [lit, setLit] = useState<number | string | null>(null);
  // Which of the pinned messages shows over the thread, counted from the latest.
  const [pinShown, setPinShown] = useState(0);
  // What is looked for in the chat (null: no search), and which of what it found is gone to, from the latest.
  const [searching, setSearching] = useState<string | null>(null);
  const [searchAt, setSearchAt] = useState(0);
  // Where each message is in the thread, by id, to go to it, and the one to go to once it shows.
  const placed = useRef(new Map<number, number>());
  const smsPlaced = useRef(new Map<string, number>());
  // Where what was imported is laid out, by its place in it; the one to go to once it is.
  const importedPlaced = useRef(new Map<number, number>());
  const importedGoal = useRef<number | null>(null);
  // Where the thread's photos are laid out, by their file's id, and those of them near what shows,
  // read to show them.
  const photoAt = useRef(new Map<string, number>());
  const [nearPhotos, setNearPhotos] = useState<string[]>([]);
  const nearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [importedMenuFor, setImportedMenuFor] = useState<LinkedMessage | null>(null);
  // The imported sound playing (its file's id), as far as `played`.
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const rowDo = useRef<RowActs | null>(null);
  const rowActs = useMemo(() => steadyActs(rowDo), []);
  // The chat's messages chosen to copy, forward or delete together (components/select-bar.tsx), by id.
  const selection = useSelection<number>();
  // Another chat shown ends the choosing and the thread, and so does Back, the choosing first.
  useEffect(() => {
    selection.clear();
    setThreadRoot(null);
  }, [selected]);
  useEffect(() => {
    if (!selection.on && !threadRoot) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selection.on) selection.clear();
      else setThreadRoot(null);
      return true;
    });
    return () => subscription.remove();
  }, [selection.on, threadRoot]);
  // A page of New chat goes back to its first one, with the phone's Back too; a page New chat was
  // opened on from elsewhere leaves it, as it came.
  const doorBack = !selected && door !== 'root' && !doorFromOutside.current;
  function leaveDoor() {
    setDoor('root');
    setJoined(null);
  }
  // To a page from the first one: New chat is its own from then on, wherever it was opened from.
  function openDoor(to: Door) {
    doorFromOutside.current = false;
    setNote('');
    setDoor(to);
  }
  useEffect(() => {
    if (!doorBack || !shown) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      leaveDoor();
      return true;
    });
    return () => subscription.remove();
  }, [doorBack, shown]);
  useEffect(() => {
    if (door !== 'near') setNearPlain(false);
  }, [door]);
  // A chat opened leaves New chat on its first page, for when the chat is left.
  useEffect(() => {
    if (!selected) return;
    doorFromOutside.current = false;
    setDoor('root');
    setJoined(null);
  }, [selected]);
  // How far above the chat's bottom its thread ends, where Undo shows (components/undo-bar.tsx).
  const edges = useRef({ height: 0, end: 0 });
  const [undoAt, setUndoAt] = useState(0);
  const goal = useRef(at);
  const receipts = useRef<Receipts>({});
  // Contacts who asked whether this phone is open, to answer with the next look at the relay.
  const answers = useRef(new Set<string>());
  // Now, a few seconds behind at most: until when a contact shows open is checked against it.
  const [now, setNow] = useState(Date.now());
  const voiceParts = useRef(new VoiceAssembler());
  // In hidden chats: what a contact's phone could not take yet, though it went to their linked
  // devices, tried again for it while they stay open (lib/waiting.ts Owed).
  const owed = useRef(new Owed());
  const recorder = useVoiceRecorder();
  // Walkie-talkie (Talkie): smaller recordings that play as they come where the chat is open.
  const talkRecorder = useVoiceRecorder(true);
  const [talkies, setTalkies] = useState<Set<string>>(new Set());
  // Whether what is recording now is walkie-talkie.
  const recordingTalk = useRef(false);
  // The chat open and seen now, whose walkie-talkie messages play as they come.
  const listening = useRef<string | null>(null);
  // While the microphone is held, and the recording it started.
  const [talking, setTalking] = useState(false);
  const holding = useRef(false);
  const recording = useRef<Promise<boolean> | null>(null);
  const longest = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Let go of on purpose (slid away), so nothing is said of it.
  const letGo = useRef(false);
  // The voice message playing, and how to stop it.
  const [playingId, setPlayingId] = useState<number | null>(null);
  // How far the voice message playing has played, milliseconds.
  const [played, setPlayed] = useState(0);
  const stopPlaying = useRef<(() => void) | null>(null);
  // Where this chat's calls belong (lib/calls.ts): the space's, or these hidden chats', which
  // seal with this chat's own keys and keep their lines here. Its functions use this render's state.
  const latest = useRef({ send: async (_identity: string, _extra: Extra) => undefined as unknown, line: (_message: Kept) => undefined as void, name: (peer: string) => peer, relay: () => Promise.resolve(null as CallRelay | null), me: (): string => '', ipKeep: (): IpKeep | undefined => undefined });
  const hiddenCalls = useRef<CallPlace>({
    send: async (identity, signal) => {
      await latest.current.send(identity, { call: signal });
    },
    callRelay: () => latest.current.relay(),
    line: (peer, mine, text) => latest.current.line(callLineMessage(peer, mine, text, 0)),
    name: (peer) => latest.current.name(peer),
    me: async () => latest.current.me(),
    ipKeep: () => latest.current.ipKeep(),
  });
  hiddenCalls.current.nameless = callOnly;
  const callPlace = hiddenKey ? hiddenCalls.current : spaceCalls;
  // Answered with no PIN: once the call it answered has come and ended, or none came in time, the
  // hidden chats close again, having shown nothing.
  useEffect(() => {
    if (!callOnly) return;
    let had = false;
    const check = () => {
      if (currentCall()) had = true;
      else if (had) onHidden?.();
    };
    const stop = onCallChange(check);
    check();
    const timer = setTimeout(() => {
      if (!had) onHidden?.();
    }, HIDDEN_ANSWER_MS + 15_000);
    return () => {
      stop();
      clearTimeout(timer);
    };
  }, [callOnly]);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [loaded, setLoaded] = useState(false);
  // The relay settings as kept on the phone, as far as this chat knows: read when it opened, saved
  // by it since, or written by another screen meanwhile (followRelay). Null until read.
  const storedRelay = useRef<RelaySettings | null>(null);
  // Contacts from before messages were encrypted (routes) still kept: the next save clears them.
  const routesLeft = useRef(false);
  // What another screen wrote to the relay settings, as the token a sign-in on another screen of
  // this chat gave: taken here too, so this one goes on with it, and never saves the one from before.
  function followRelay(data: SpaceData) {
    setHomeUrl(data.spare.url);
    setHomeToken(data.spare.token);
    const was = storedRelay.current;
    if (!was) return;
    const now = relaySettingsOf(data);
    const changed = changedRelaySettings(was, now);
    storedRelay.current = now;
    if ('url' in changed) setRelayUrl(now.url);
    if ('token' in changed) setRelayToken(now.token);
    if ('via' in changed) setViaUrl(now.via);
    if ('viaToken' in changed) setViaToken(now.viaToken);
    if ('ownQueue' in changed) setOwnQueue(now.ownQueue);
  }
  const nextId = useRef(1);
  const history = useRef<History | null>(null);
  // Whether the look at the relay the receiver beside the other screens had under way ended (held):
  // until then this chat shows, and is used, but takes nothing from the relay itself, so no message
  // is taken by both.
  const [relayFree, setRelayFree] = useState(false);
  // The ids of the messages shown as the history held them, last it was read whole (shownAnew).
  const fromHistory = useRef<Set<number>>(new Set());
  const showWhole = (whole: Message[]) => {
    const was = fromHistory.current;
    fromHistory.current = new Set(whole.map((m) => m.id));
    setMessages((list) => shownAnew(whole, list, was));
  };
  // A message held while the chat opens only to read: its menu opens once the chats are in hand.
  const menuWaiting = useRef<Pick<Message, 'peer' | 'tag' | 'at' | 'mine'> | null>(null);
  useEffect(() => {
    const waiting = menuWaiting.current;
    if (!waiting || !e2e || !history.current) return;
    menuWaiting.current = null;
    const message = messages.find((m) => m.peer === waiting.peer && m.tag === waiting.tag && m.at === waiting.at && m.mine === waiting.mine);
    if (!message) return;
    setNote((was) => (was === t('Erevos is still reading what came. The menu opens in a moment.') ? '' : was));
    setMenuTurn((n) => n + 1);
    setMenuFor(message);
  }, [e2e, messages]);
  // The chats whose messages show at once while the chat opens, only to read (held): what is read
  // then is marked read in their history at once, the one the home screen counts from.
  const openingChats = useRef<SpaceChats | null>(null);
  // The chats once open, whose imported chats shared go and come in rounds (lib/share-rounds.ts)
  // while the screen shows: `sharesClosed` once it no longer does.
  const sharedChats = useRef<SpaceChats | null>(null);
  const sharesClosed = useRef(false);
  // The panel under the message bar ("+"): what to send and how it goes, and choosing when it goes.
  const [attaching, setAttaching] = useState(false);
  const [choosingLater, setChoosingLater] = useState(false);
  // The panel's page for a safety message (lib/safety.ts): how many hours.
  const [choosingSafety, setChoosingSafety] = useState(false);
  const [stickering, setStickering] = useState(false);
  // A message to forward, while its chat is picked, and the space's groups it can go to.
  const [forwarding, setForwarding] = useState<Message[] | null>(null);
  const [forwardGroups, setForwardGroups] = useState<GroupInfo[]>([]);
  // Where the phone was found, to send once it is looked at.
  const [placing, setPlacing] = useState(false);
  const [polling, setPolling] = useState(false);
  // A contact's card being chosen to send (components/card-share.tsx).
  const [sharingCard, setSharingCard] = useState(false);
  // Until when each contact shows typing, and when this phone last said it is typing to each.
  const [typing, setTyping] = useState<Record<string, number>>({});
  const typingSaid = useRef(new Map<string, number>());
  // The time picked under "+" for the next photo, file or voice message, when nothing was typed.
  const [laterFor, setLaterFor] = useState<number | null>(null);
  const [quality, setQuality] = useState<PhotoQuality>('original');
  // How far each file being taken from the relay is, by `${peer}|${tag}`; 'failed' or 'gone' if it did not come.
  const [taking, setTaking] = useState<Record<string, string>>({});
  // Files already tried, so one that failed is taken again only when tapped.
  const tried = useRef(new Set<string>());
  // The photo or file shown on its own, to look at or save; one of an imported message's apart.
  const [viewing, setViewing] = useState<Message | null>(null);
  const [viewingImported, setViewingImported] = useState<FileRef | null>(null);
  const thread = useRef<ScrollViewInstance>(null);
  // Whether the thread shows its end, so it keeps to it as it grows shorter.
  const atEnd = useRef(true);
  // Whether it is away from its start and its end, for the arrows to them, and from where it was left.
  const { away, onScroll: awayOnScroll, spot } = useThreadAway();
  // Where a contact's chat was left: the first of their messages that was new when it opened, taken
  // before they are read.
  const left = useRef<{ peer: string | null; tag: string | null }>({ peer: null, tag: null });
  if (left.current.peer !== selected && messages.length > 0) {
    const first = selected?.startsWith(CONTACT_PREFIX) ? messages.find((m) => m.peer === selected && !m.mine && m.mark < 2) : undefined;
    left.current = { peer: selected, tag: first && first !== messages.find((m) => m.peer === selected) ? first.tag : null };
  }
  const styles = useStyles(makeStyles);
  const { colors, look } = useTheme();
  const barBlur = useGlassBlur();
  // How messages are drawn: the look's bubbles (theme/bubbles.ts).
  const b = useMemo(() => bubbleStyles(look.bubbles, colors, look.textSize), [look.bubbles, colors, look.textSize]);
  // Where this chat's home relay is kept (lib/spare.ts): the space's, or this hidden place's own.
  const spareStore = useMemo(() => (hiddenKey ? hiddenSpare(currentSpace().space, pocket, hiddenKey) : spaceSpare()), [hiddenKey, pocket]);
  // This hidden place's groups (lib/place-groups.ts), the same its receiver has; the space's otherwise (lib/space-groups.ts).
  const placeGroups = useMemo(() => (hiddenKey ? placeGroupsAt(currentSpace().space, pocket, hiddenKey) : null), [hiddenKey, pocket]);
  const takeGroup = (packet: Uint8Array) => (placeGroups ? placeGroups.take(packet) : takeGroupPacket(packet));
  // Its groups listed with its chats, as they change; none shows once it closes or another opens.
  useEffect(() => {
    setShownGroup(null);
    setPlaceGroupList([]);
    if (!placeGroups || !canGroup()) return;
    let active = true;
    let stop = () => undefined as void;
    placeGroups.groups().then(
      (groups) => {
        if (!active) return;
        const read = () => setPlaceGroupList(groups.list());
        read();
        stop = groups.onChange(read);
      },
      () => undefined,
    );
    return () => {
      active = false;
      stop();
    };
  }, [placeGroups]);
  // Their calls ring while these hidden chats are open (lib/place-groups.ts).
  useEffect(
    () =>
      placeGroups
        ? answerPlaceGroupCalls(currentSpace().space, pocket, (group, from, signal) => void groupCallSignal(placeGroups.calls, group, from, signal, rtc).catch(() => undefined))
        : undefined,
    [placeGroups, pocket],
  );
  const [homeUrl, setHomeUrl] = useState('');
  const [homeToken, setHomeToken] = useState('');
  const [homeNote, setHomeNote] = useState('');
  // A hidden place's home relay is let go of when it closes.
  useEffect(() => () => (hiddenKey ? forgetSpare(spareStore) : undefined), [spareStore]);

  // Where contacts reach this chat: our relay and its key, told to them in our link and messages.
  function here(url = relayUrl): Where {
    return { relay: url.trim(), relayKey: url.trim() === relayUrl.trim() ? ownRelayKey : '' };
  }

  // The space's chat sends through its backup relay (lib/spare.ts) when its own cannot be reached.
  function relayTarget(url = relayUrl): Relay | null {
    return relayFor(url, relayToken, viaUrl, viaToken, spareBackup(spareStore));
  }

  // Tells contacts' phones which of their messages came and were read here, and, while the app
  // shows, that this phone is open, as those who asked wait to hear. What the relay cannot take
  // now is told with the next look at it.
  async function sendReceipts(target: Relay | null) {
    // Those due to hear that the app opened, each after a wait of its own (Say when I open Erevos).
    if (e2e) tellOpenLater(e2e, answers.current);
    // What was read is kept with the contact until a message to them says it (E2E.hold): theirs too.
    const due = (e2e?.readDue() ?? []).map((identity) => `${CONTACT_PREFIX}${identity}`);
    for (const peer of new Set([...Object.keys(receipts.current), ...answers.current, ...due])) {
      const { got, read } = receipts.current[peer] ?? { got: [], read: [] };
      delete receipts.current[peer];
      answers.current.delete(peer);
      const identity = peer.slice(CONTACT_PREFIX.length);
      const held = e2e?.heldRead(identity) ?? [];
      try {
        await sendToContact(target, identity, '', { got, read, on: appShown() && !!e2e?.showsNow() ? ONLINE : 0 }, true);
      } catch {
        // Sealed, it is no longer kept: kept again, for the next look.
        if (held.length > 0) await e2e?.hold(identity, 'read', held).catch(() => undefined);
        if (got.length + read.length === 0) continue;
        const now = receipts.current[peer] ?? { got: [], read: [] };
        receipts.current[peer] = { got: [...got, ...now.got], read: [...read, ...now.read] };
      }
    }
  }

  // Gives this chat's newest prekeys to the contacts who have not had them (lib/e2e.ts keysDue),
  // each in a message of its own. What cannot go now goes with the next look at the relay.
  async function sendKeys(target: Relay | null) {
    if (!e2e) return;
    for (const identity of e2e.keysDue()) {
      try {
        await sendToContact(target, identity, '', { keys: true }, true);
        await e2e.keysGiven(identity);
      } catch {
        // Tried again with the next look.
      }
    }
  }

  function receipt(peer: string, kind: 'got' | 'read', tags: string[]) {
    if (tags.length === 0) return;
    // While the chat opens, the same contacts, of the chats that show at once.
    const chats = e2e ?? openingChats.current?.e2e ?? null;
    const contact = chats?.contacts().find((c) => `${CONTACT_PREFIX}${c.identity}` === peer);
    // A message request hears nothing back, not even that its message came, until accepted.
    if (contact?.request) return;
    // A chat that appears offline holds it until it next writes to them.
    if (contact?.hide) {
      chats!.hold(contact.identity, kind, tags).catch(() => {
        // Not kept: their phone is never told.
      });
      return;
    }
    const now = receipts.current[peer] ?? { got: [], read: [] };
    // A message read needs no word that it came.
    const got = kind === 'got' ? [...now.got, ...tags] : now.got.filter((tag) => !tags.includes(tag));
    const say = (read: string[]) => {
      const kept = receipts.current[peer] ?? { got: [], read: [] };
      receipts.current[peer] = { got: kept.got, read: [...kept.read, ...read] };
      // Said with the next look, which does not wait at the relay first.
      lookNow();
    };
    receipts.current[peer] = { got, read: now.read };
    // What was read is kept with the contact, not in memory alone, until a message to them says it:
    // a phone put away right after reading, before the next look, still says it later (E2E.readDue).
    if (kind === 'read' && contact && chats) chats.hold(contact.identity, 'read', tags).then(lookNow, () => say(tags));
    else say(kind === 'read' ? tags : []);
  }

  // Hands the relay the first packets of conversations started here that it has not taken yet:
  // until it does, the contact cannot read anything else from this chat.
  async function sendPending(chats: E2E, target: Relay) {
    for (const { identity, sender, relay, relayKey: key, first } of chats.pending()) {
      try {
        await sendMessage(contactTarget(target, { relay, relayKey: key }), fromHex(sender), first, 'quiet');
        await chats.firstSent(identity);
      } catch {
        // Tried again with the next message, or the next look at the relay.
      }
    }
  }

  // Carries messages from phones nearby to their relays, or no longer (lib/nearby-links.ts).
  function changeCarrying(on: boolean) {
    setCarrying(on);
    setCarryingKept(on).catch(() => setNote(t('Changed until Erevos closes: the phone could not keep it.')));
  }

  // Makes link previews, or no longer, in the space's chats, or in these hidden chats only (lib/make-preview.ts).
  function changePreviews(on: boolean) {
    setPreviews(on);
    (hiddenKey ? updateHiddenData(currentSpace().space, pocket, hiddenKey, { previews: on }) : updateCurrentSpaceData({ previews: on })).catch((error) => setNote(errorText(error)));
  }

  // Fetches the previews' pages only through Tor, or as before, here as changePreviews does.
  function changePreviewsTor(on: boolean) {
    setPreviewsTor(on);
    (hiddenKey ? updateHiddenData(currentSpace().space, pocket, hiddenKey, { previewsTor: on }) : updateCurrentSpaceData({ previewsTor: on })).catch((error) => setNote(errorText(error)));
  }

  // Tells the space's contacts when it was last open, and shows theirs, or neither (lib/last-seen.ts).
  function changeLastSeen(on: boolean) {
    setLastSeenOn(on);
    (hiddenKey ? setPlaceLastSeen(currentSpace().space, pocket, hiddenKey, on) : setLastSeen(on))
      .then(() => setNow(Date.now()))
      .catch((error) => setNote(errorText(error)));
  }

  // Tells the contacts, unasked, that Erevos opened, or only with what goes to them anyway (lib/receiver.ts tellOpenLater).
  function changeTellOpen(on: boolean) {
    setTellOpenOn(on);
    (hiddenKey ? setPlaceTellOpen(currentSpace().space, pocket, hiddenKey, on) : setTellOpen(on)).catch((error) => setNote(errorText(error)));
  }

  // Looks for phones nearby at all, or no longer (lib/nearby-links.ts).
  function changeNearby(on: boolean) {
    setNearbyOn(on);
    setNearbyKept(on).catch(() => setNote(t('Changed until Erevos closes: the phone could not keep it.')));
  }

  // Looks for Erevos on the same Wi-Fi or hotspot too, or no longer (lib/nearby-links.ts).
  function changeLan(on: boolean) {
    setLanOn(on);
    setLanKept(on).catch(() => setNote(t('Changed until Erevos closes: the phone could not keep it.')));
  }

  // Looks for Erevos phones nearby with Wi-Fi Aware too, or no longer.
  function changeAware(on: boolean) {
    setAwareOn(on);
    setAwareKept(on).catch(() => setNote(t('Changed until Erevos closes: the phone could not keep it.')));
  }

  // Makes a Wi-Fi with Erevos phones nearby that share none (Wi-Fi Direct), or no longer.
  function changeDirect(on: boolean) {
    setDirectOn(on);
    setDirectKept(on).catch(() => setNote(t('Changed until Erevos closes: the phone could not keep it.')));
  }

  // You are connected (components/new-chat-doors.tsx) for a contact that has just joined, while New
  // chat shows with no chat open: at once for one added here (`here`), and for one whose phone
  // answered meanwhile (an invite taken, far away) only on the pages that wait for someone. Says
  // whether it shows.
  const selectedNow = useRef(selected);
  selectedNow.current = selected;
  const shownNow = useRef(shown);
  shownNow.current = shown;
  function showJoined(identity: string, here = false): boolean {
    if (selectedNow.current !== null || !shownNow.current) return false;
    const page = doorNow.current;
    if (!here && page !== 'root' && page !== 'near' && page !== 'far' && page !== 'code') return false;
    setJoined(identity);
    setDoor('done');
    return true;
  }

  // Adds a contact from a code: typed or pasted here, or read from a photo of it (`asked`: offering
  // then to connect it to one of my contacts), or handed over (lib/contact-code.ts) with a contact
  // to link it to and the name it takes, which only these chats' own may give (offerFor).
  // Adds the contact of a link. `mine`: the relay, token and queue this phone has just taken for
  // itself, not in this render's state yet (takeWelcome). `hi`: the secret of their invite, said
  // back so they take this phone as a contact at once (lib/welcome.ts). Returns who was added, or null.
  async function acceptContact(code: ContactCode, offered?: Offer, asked = false, mine?: { url: string; token: string; queue: Queue }, hi = ''): Promise<string | null> {
    if (!e2e) {
      setNote(notOpen());
      return null;
    }
    if (code.senderHex === ownQueue?.senderHex || (!!linkQueue && code.senderHex === linkQueue.senderHex)) {
      setNote(t("Not added. That is this chat's own code."));
      return null;
    }
    // Someone blocked here, before a queue or a place on their relay is made for them.
    try {
      await e2e.refuseBlocked(code);
    } catch (error) {
      if (error instanceof BlockedContactError) askToUnblock(error, code, offered, asked);
      else setNote(t('Not added. {error}', { error: errorText(error) }));
      return null;
    }
    const ours = (mine?.url ?? relayUrl).trim();
    if (code.relayUrl && ours && !sameRelay(code.relayUrl, ours) && !code.relayKey) {
      setNote(
        t('Not added. That contact uses the relay at {url}, and its link has no key for that relay. Ask them for a new link from an updated Erevos.', { url: code.relayUrl }),
      );
      return null;
    }
    let url = ours;
    let token = mine?.token ?? relayToken;
    let queue = mine?.queue ?? ownQueue;
    let lent = false;
    let noPlace: unknown = null;
    if (!ours && code.relayUrl) {
      // With no relay of our own, theirs: a place lent there when their link brings a ticket for
      // one (lib/relay.ts), or else the relay as it is, which works when it needs no token (or
      // the one typed here).
      try {
        if (code.lend && !queue) {
          const place = await borrowPlace(code.relayUrl, code.lend);
          token = place.token;
          queue = { recipientHex: toHex(place.queue.recipientId), senderHex: toHex(place.queue.senderId) };
          lent = true;
        } else if (!queue) {
          const ids = await createQueue({ url: code.relayUrl, token: relayToken.trim() || undefined });
          queue = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
        }
        url = code.relayUrl;
        setRelayUrl(url);
        setRelayToken(token);
        setOwnQueue(queue);
      } catch (error) {
        // Neither: they reach this phone nearby only, as one with no relay.
        noPlace = error;
        queue = ownQueue;
      }
    }
    const target = relayFor(url, token, viaUrl, viaToken, spareBackup(spareStore));
    if (!target && !code.key) {
      setNote(t('Not added. Type the relay address in Relay first.'));
      return null;
    }
    try {
      // The contact answers through our own queue, so there has to be one when there is a relay.
      // Without one, they reach this phone nearby only, until it has a queue and tells them.
      if (!queue && target) {
        const ids = await createQueue(target);
        queue = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
        setOwnQueue(queue);
      }
      const { identity, added } = await e2e.addContact(code, queue?.senderHex ?? '', target ? here(url) : here(''), hi);
      const offer = offerFor(offered, contactsPlace);
      // The name of the contact it is linked to, while it has none of its own (lib/linked-name.ts).
      if (offer?.name) await giveLinkedName(e2e, identity, { name: offer.name }).catch(() => '');
      setContacts(e2e.contacts());
      // A contact of the phone's, or one kept only in Erevos, whose Erevos ID this was is linked to it.
      offer?.added?.(identity);
      // Added from New chat, it ends on You are connected, where they get their name; added from a chat, theirs opens.
      if (!showJoined(identity, true)) setSelected(`${CONTACT_PREFIX}${identity}`);
      if (asked && added && canConnect && !e2e.contacts().find((c) => c.identity === identity)?.name) setConnecting(identity);
      if (target) await sendPending(e2e, target);
      // With no relay between the two, the first message goes through Nostr when they read there, in
      // a quiet message with nothing in it: their phone has this contact then too (lib/nostr-chats.ts).
      const onNostr = (!target || !code.senderHex) && e2e.readsOnNostr(identity);
      if (onNostr) await sendToContact(target, identity, '', {}, true).catch(() => undefined);
      const nearbyOnly = !onNostr && (!target || !code.senderHex);
      // Connected as it was added, from the screen a scanned link opens: said after the note.
      const linked = offer?.name && offer.added ? ` ${t('Connected to {name}.', { name: cleanName(offer.name) })}` : '';
      // Nearby only, with phones nearby off here: said, and where to turn them on opened for when it is looked for.
      const nearbyOff = added && nearbyOnly && HAS_LINKS && !nearbyOnNow();
      if (nearbyOff) setNearbyShown(true);
      const turnOn = nearbyOff ? ` ${t('Phones nearby are off on this phone: turn on Look for phones nearby, on New chat, under For advanced users.')}` : '';
      setNote(
        (added
          ? nearbyOnly
            ? noPlace
              ? t('Contact added. Messages to it are end-to-end encrypted. Compare the safety number with theirs. Their relay gave no place: {error}. Until you have a relay, you reach each other nearby only.', {
                  error: errorText(noPlace),
                })
              : t('Contact added. Messages to it are end-to-end encrypted. Compare the safety number with theirs. Until you both have a relay, you reach each other nearby only.')
            : onNostr
              ? t('Contact added. Messages to it are end-to-end encrypted. Compare the safety number with theirs. With no relay between you, texts, stickers, reactions, photos, files and voice messages go through Nostr; calls need a relay or their phone nearby.')
              : lent
                ? t("Contact added. Messages to it are end-to-end encrypted. Compare the safety number with theirs. With no relay of your own, you now have a place on theirs, lent through their link.")
                : t('Contact added. Messages to it are end-to-end encrypted. Compare the safety number with theirs.')
          : t('Already a contact. Where to reach them is updated.')) + turnOn + linked,
      );
      return identity;
    } catch (error) {
      if (error instanceof BlockedContactError) {
        askToUnblock(error, code, offered, asked);
        return null;
      }
      setNote(t('Not added. {error}', { error: errorText(error) }));
      return null;
    }
  }

  // Someone blocked here is added only once unblocked, as the owner says: then added as asked.
  function askToUnblock(blocked: BlockedContactError, code: ContactCode, offered?: Offer, asked = false) {
    ask(t('Blocked contacts'), blocked.message, [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Unblock'),
        onPress: () =>
          void e2e
            ?.unblock(blocked.identity)
            .then(() => {
              setBlocked(e2e.blocked());
              return acceptContact(code, offered, asked);
            })
            .catch((again) => setNote(errorText(again))),
      },
    ]);
  }

  // Takes an invite to a relay (lib/relay-invite.ts) for a token of this phone's own there. A relay
  // already set, or a token of its own, is replaced only once the owner says so.
  async function joinRelay(invite: Invite) {
    const ours = relayUrl.trim();
    const same = !!ours && sameRelay(ours, invite.relayUrl);
    if (ours && (!same || (relayToken.trim() && !isLentToken(relayToken)))) {
      const go = await choose(
        t('Use the relay in the invite?'),
        same
          ? t('This phone has a token for this relay already. The invite gives it one of its own instead.')
          : t('This phone uses the relay at {url}. With the invite it uses the one at {other} instead, and contacts learn your new queue from your next message.', {
              url: ours,
              other: invite.relayUrl,
            }),
        t('Cancel'),
        t('Use it'),
      );
      if (!go) return;
    }
    let token: string;
    let name: string;
    try {
      ({ token, name } = await redeemInvite(invite.relayUrl, invite.code));
    } catch (error) {
      setNote(t('The invite was not taken. {error}', { error: errorText(error) }));
      return;
    }
    // The relay names it as the invite did, with random letters and digits for one made since 6.0.0: not said, as it means nothing to them.
    await tookToken(invite.relayUrl, token, name, false, true);
  }

  // With no relay of its own yet, or only a place lent on one, this phone takes access of its own to
  // the relay an invite for someone new names, and a queue there, typing nothing; a phone with a
  // relay of its own keeps it. Returns the relay, token and queue taken, undefined when it keeps its
  // own, or null when nothing was taken and it has no relay at all (the note says why).
  async function joinInviting(invite: Invite | null): Promise<{ url: string; token: string; queue: Queue } | undefined | null> {
    const ours = relayUrl.trim();
    const lent = isLentToken(relayToken);
    if (!invite || !(!ours || lent || (sameRelay(ours, invite.relayUrl) && !relayToken.trim()))) return undefined;
    const url = invite.relayUrl;
    try {
      const { token } = await redeemInvite(url, invite.code);
      // A queue on another relay, or a lent one, is no use with this access: contacts learn the new one from the next message.
      const keep = !!ours && !lent && sameRelay(ours, url) && ownQueue;
      const ids = keep ? null : await createQueue({ url, token });
      const queue = ids ? { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) } : ownQueue!;
      setRelayUrl(url);
      setRelayToken(token);
      setOwnQueue(queue);
      // Kept at once with the relay and the queue, not only once the chat saves its settings.
      updateCurrentSpaceData({ url, token, ownQueue: queue, ownToken: ownToken(url, token) }).catch(() => {
        // Not kept: signing in there later gives this phone one more line instead of its own again.
      });
      return { url, token, queue };
    } catch (error) {
      // With no relay at all, nothing reaches them: they make a new invite.
      if (ours) return undefined;
      setNote(t('The invite was not taken. {error}', { error: errorText(error) }));
      return null;
    }
  }

  // Takes an invite for someone new, opened from a scanned link (app/welcome.tsx, lib/welcome.ts):
  // joins the inviting phone's relay as above, then the inviting phone is a contact, which takes
  // this one as a contact at once.
  async function takeWelcome(welcome: Welcome) {
    if (!e2e) {
      setNote(notOpen());
      return;
    }
    const mine = await joinInviting(welcome.invite);
    if (mine === null) return;
    const identity = await acceptContact(welcome.contact, { place: contactsPlace, ...(welcome.name ? { name: welcome.name } : {}) }, false, mine, welcome.hi);
    if (identity && mine) {
      const name = e2e.contacts().find((c) => c.identity === identity)?.name;
      setNote(
        name
          ? t('Welcome to Erevos. {name} is your contact now: what you write to each other is end-to-end encrypted.', { name })
          : t('Welcome to Erevos. Whoever invited you is your contact now: what you write to each other is end-to-end encrypted.'),
      );
    }
  }

  // Takes an invite by plain SMS (app/text-invite.tsx, lib/text-invite.ts), `name` what this phone
  // calls whoever sent it: joins their relay as above, then answers with this chat's contact link,
  // with the next look, sealed for them. Their phone adds this one, and its first message is taken
  // as a contact's, no request, named `name` (lib/sms-relay.ts).
  async function takeTextInvite(invite: TextInvite, name: string) {
    if (!e2e) {
      setNote(notOpen());
      return;
    }
    if (!invite.card && invite.expires < Date.now()) {
      setNote(t('An invite lasts only a few days. Ask whoever sent it for a new one.'));
      return;
    }
    if (!canSealOpen()) {
      setNote(t('This Erevos cannot answer an invite by SMS yet: update it, then open the link again.'));
      return;
    }
    // A contact card brings no relay: the answer goes from this phone's own, and theirs comes back there.
    if (invite.card) {
      if (!relayUrl.trim() || !ownQueue) {
        setNote(t('To add them with their contact QR code, your phone needs a relay first: ask them for an invite instead, with Invite on their home screen.'));
        return;
      }
      answerTextInvite(invite, name);
      setNote(
        name
          ? t('{name} is in your chats as soon as their phone answers, in a moment if it is on.', { name })
          : t('They are in your chats as soon as their phone answers, in a moment if it is on.'),
      );
      return;
    }
    const mine = await joinInviting({ relayUrl: invite.relay, code: invite.code });
    if (mine === null) return;
    answerTextInvite(invite, name);
    setNote(
      name
        ? t('Joined. {name} is your contact as soon as their phone hears from yours, in a moment if it is on.', { name })
        : t('Joined. Whoever invited you is your contact as soon as their phone hears from yours, in a moment if it is on.'),
    );
  }

  // An invite to a contact's relay that came in their message (lib/relay-offer.ts), taken by itself
  // while this phone has no relay of its own, or only a place lent on one, once the IP warning for
  // that relay was gone on from (or the space goes all through Tor): access of its own there
  // and a queue, and then its contacts are told quietly where it reads now (tellJoined). Tried once:
  // a contact sends one only once.
  const tellJoined = useRef(false);
  async function takeOffer(invite: Invite, from: string) {
    await forgetOffer().catch(() => undefined);
    if (!e2e || hiddenKey || !takesOffer({ url: relayUrl, token: relayToken }, invite.relayUrl)) return;
    const url = invite.relayUrl;
    const name = cleanName(e2e.contacts().find((c) => c.identity === from)?.name ?? '');
    // Their relay is an address the contact chose: it sees this phone's, so that is said first.
    if (!throughTor() && !(await ipGate({ network: 'Erevos', act: 'relay', of: `relay ${url}` }))) return;
    try {
      const { token } = await redeemInvite(url, invite.code);
      const ids = await createQueue({ url, token });
      const queue = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
      setRelayUrl(url);
      setRelayToken(token);
      setOwnQueue(queue);
      // Kept at once with the relay and the queue, not only once the chat saves its settings.
      updateCurrentSpaceData({ url, token, ownQueue: queue, ownToken: ownToken(url, token) }).catch(() => {
        // Not kept: signing in there later gives this phone one more line instead of its own again.
      });
      tellJoined.current = true;
      setNote(
        name
          ? t('{name} gave you a place on their relay, by itself. Photos, voice messages and calls now go there too, with everyone.', { name })
          : t('A contact gave you a place on their relay, by itself. Photos, voice messages and calls now go there too, with everyone.'),
      );
    } catch (error) {
      setNote(t('An invite to a contact’s relay came, but it was not taken. {error}', { error: errorText(error) }));
    }
  }

  // A token of this phone's own on the relay at `url`, from an invite or a sign-in, named `name`
  // there: it goes where the relay's token goes and is kept sealed with the space's relay settings,
  // with a queue there when this phone has none on that relay. Which token it is, and from which
  // relay, is kept too, so signing in there again names only this one as the phone's before.
  // `first`: signed in from the start, with no relay yet: the note says so in plain words, and the
  // relay's settings stay closed. `invited`: from an invite, so the note leaves the name out.
  async function tookToken(url: string, token: string, name: string, first = false, invited = false) {
    const same = !!relayUrl.trim() && sameRelay(relayUrl.trim(), url);
    setRelayUrl(url);
    setRelayToken(token);
    // The token is kept at once, with which one it is: the relay took the old one's line away, and
    // the chat saving its settings later is no surety, as when it opens again meanwhile.
    const own = { url, token, ownToken: ownToken(url, token) };
    (hiddenKey ? updateHiddenData(currentSpace().space, pocket, hiddenKey, own) : updateCurrentSpaceData(own)).catch(() => {
      // Not kept: signing in again there gives this phone one more line instead of its own again.
    });
    const joined = first
      ? t('You are in, as {name}. Now add your contacts: by their invite, or by the contact link or QR code they give you.', { name })
      : invited
        ? t('This phone now uses the relay at {url}, with a token of its own.', { url })
        : t('This phone now uses the relay at {url}, with a token of its own, named {name} there.', { url, name });
    if (same && ownQueue) {
      setNote(joined);
      return;
    }
    // A queue on another relay is no use on this one: contacts learn the new one from the next message.
    try {
      const ids = await createQueue({ url, token });
      setOwnQueue({ recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) });
      setNote(joined);
    } catch (error) {
      setOwnQueue(null);
      setNote(`${joined} ${t('Its queue could not be made yet: {error}. Tap Create my relay queue.', { error: errorText(error) })}`);
    }
  }

  // The relay's one token, typed in, traded for a token of this phone's own there (lib/relay.ts,
  // takeOwnLine), named there as this phone names itself in invites: then the relay's operator can
  // take this phone out alone, and change the relay's token without cutting it off, and this phone
  // can invite. Null, with nothing changed, when the token is this phone's own already, the relay
  // does not do so, or its settings changed meanwhile. Throws when the relay cannot be reached, or
  // gives no more today. Hidden chats keep theirs: a second line made at the same moment from the
  // same phone would tell the relay whose they are.
  const relayNow = useRef({ url: '', token: '' });
  relayNow.current = { url: relayUrl.trim(), token: relayToken.trim() };
  async function ownLine(url: string, token: string): Promise<Relay | null> {
    if (hiddenKey || !e2e || !token || isLentToken(token)) return null;
    if (oldToken(url, token, (await loadCurrentSpaceData()).ownToken)) return null;
    const own = await takeOwnLine({ url, token }, e2e.invitedAs());
    if (!own || relayNow.current.url !== url || relayNow.current.token !== token) return null;
    setRelayToken(own.token);
    await updateCurrentSpaceData({ token: own.token, ownToken: ownToken(url, own.token) }).catch(() => {
      // Not kept: signing in there later gives this phone one more line instead of its own again.
    });
    setNote(t('This phone now has a token of its own on the relay, named {name} there, in place of the relay’s token: it can invite others now.', { name: own.name }));
    return { url, token: own.token };
  }

  // An invite that came while the chat was closed (lib/receiver.ts), taken once the chat has its
  // settings, unless it came from a request not accepted yet: then once that is.
  useEffect(() => {
    if (!loaded || !e2e || hiddenKey) return;
    loadCurrentSpaceData()
      .then(({ offered }) => {
        const offer = keptOffer(offered);
        if (!offer) return offered.until ? forgetOffer() : undefined;
        if (e2e.contacts().find((c) => c.identity === offer.from)?.request) return;
        return takeOffer(offer, offer.from);
      })
      .catch(() => undefined);
  }, [loaded, e2e]);

  // Asked once a run for each token, and again when Erevos comes back to the front if the relay
  // could not be reached.
  const ownAsked = useRef(new Set<string>());
  useEffect(() => {
    const url = relayUrl.trim();
    const token = relayToken.trim();
    const asked = `${url} ${token}`;
    if (!loaded || !appActive || hiddenKey || !e2e || !url || !token || ownAsked.current.has(asked)) return;
    ownAsked.current.add(asked);
    ownLine(url, token).catch(() => ownAsked.current.delete(asked));
  }, [loaded, appActive, relayUrl, relayToken, e2e]);

  // The links nearby are up while the space is open, whatever screen shows (lib/nearby-links.ts).
  // What comes on them, this screen opens itself while it is open, as it shows it at once; the
  // receiver beside the screens does meanwhile (lib/receiver.ts). Hidden chats are offered what
  // opened in none of the space's chats (below).
  useEffect(() => {
    if (!HAS_LINKS || hiddenKey) return;
    let active = true;
    nearbySettings().then((settings) => {
      if (!active) return;
      setNearbyOn(settings.on);
      setCarrying(settings.carrying);
      setLanOn(settings.lan);
      setDirectOn(settings.direct);
      setAwareOn(settings.aware);
    });
    // A contact heard nearby, or a LoRa radio linked: what waits for them may go now.
    const stopWatching = nearby.onChange(() => {
      setNearbyChanged((n) => n + 1);
      void sendWaitingNow.current(false);
    });
    const stopWatchingLora = lora.onChange(() => setNearbyChanged((n) => n + 1));
    const release = takeNearby((link, packet) => nearbyCame.current(link, packet));
    return () => {
      active = false;
      stopWatching();
      stopWatchingLora();
      release();
    };
  }, []);

  // Opens a packet that came from a phone nearby (`link`), or was kept for this space (no link).
  // One for none of this space's chats is kept for the others.
  const nearbyCame = useRef(async (_link: string | null, _packet: Uint8Array, _nostr?: boolean) => undefined as void);
  nearbyCame.current = async (link, packet, nostr = false) => {
    if (!e2e) {
      if (link) nearby.hold(packet);
      return;
    }
    // A group's message (lib/groups.ts), as on the same Wi-Fi with no internet: the space's, as a
    // hidden place's groups go through the relay only.
    if (isGroupPacket(packet)) {
      const ours = await takeGroupPacket(packet).catch(() => false);
      if (!ours && link) nearby.hold(packet);
      else if (!link) nearby.dropHeld(packet);
      return;
    }
    let received: Awaited<ReturnType<E2E['receive']>>;
    try {
      received = await e2e.receive(packet);
    } catch {
      if (!link) nearby.dropHeld(packet);
      return;
    }
    if (received.kind === 'refused' && received.reason === 'unknown') {
      // Perhaps open hidden chats', or a place's that receives (lib/place-nearby.ts); else kept.
      if (link) await unopenedNearby(link, packet);
      return;
    }
    if (!link) nearby.dropHeld(packet);
    if (received.kind === 'message' && link && link !== SMS_LINK) nearby.heardOn(received.identity, link);
    handle(received, nostr, link === SMS_LINK ? 'sms' : link ? 'nearby' : undefined);
    await sendReceipts(relayTarget());
  };

  // Hidden chats and the phones nearby (lib/place-nearby.ts): while they are open, what came on the
  // links and opened in none of the space's chats is tried here, and, as they open, what was kept
  // so. Where their contacts were heard is theirs alone (nearHeard), in memory, forgotten as they
  // close: the space never learns that one of them is near. Their groups go through the relay only.
  const nearHeard = useRef<NearHeard | null>(null);
  const placeNearbyCame = useRef(async (_link: string | null, _packet: Uint8Array) => false as boolean);
  placeNearbyCame.current = async (link, packet) => {
    if (!e2e || !hiddenKey || isGroupPacket(packet)) return false;
    let received: Awaited<ReturnType<E2E['receive']>>;
    try {
      received = await e2e.receive(packet);
    } catch {
      return false;
    }
    if (received.kind === 'refused' && received.reason === 'unknown') return false;
    if (received.kind === 'message' && link) nearHeard.current?.heardOn(received.identity, link);
    handle(received, false, link ? 'nearby' : undefined);
    await sendReceipts(relayTarget());
    return true;
  };
  useEffect(() => {
    if (!HAS_LINKS || !hiddenKey || !e2e) return;
    const { space } = currentSpace();
    const near = placeNear(space, pocket);
    nearHeard.current = near.heard;
    // A contact heard nearby: what waits for them may go now, on that link.
    const stopHeard = near.heard.onChange(() => {
      setNearbyChanged((n) => n + 1);
      void sendWaitingNow.current(false);
    });
    const stopLinks = nearby.onChange(() => setNearbyChanged((n) => n + 1));
    const open: PlaceOpener = (link, packet) => placeNearbyCame.current(link, packet);
    const stopOpening = openPlaceNearby(space, pocket, open);
    void openHeldIn(open);
    return () => {
      stopOpening();
      stopHeard();
      stopLinks();
      if (nearHeard.current === near.heard) nearHeard.current = null;
      near.release();
    };
  }, [e2e]);

  // What comes on Nostr (lib/nostr.ts): the space's from the receiver, which reads for them while
  // the space is open; a hidden place's read here, while its chats are open.
  useEffect(() => {
    if (!e2e) return;
    const take = (packet: Uint8Array) => nearbyCame.current(null, packet, true);
    if (!hiddenKey) return takeNostr(take);
    // Pieces of photos it reads are kept in its own encrypted storage (lib/nostr-pieces.ts).
    return readNostr(nostrReaderOf(() => e2e, take, () => contactsPlace));
  }, [e2e]);

  // A text a Nostr relay took says so in its menu.
  useEffect(
    () =>
      onNostrWent((identity, tag) => {
        const peer = `${CONTACT_PREFIX}${identity}`;
        setMessages((list) => list.map((m) => (m.peer === peer && m.tag === tag ? { ...m, nostr: true } : m)));
        void history.current?.throughNostr(peer, tag).catch(() => undefined);
      }),
    [],
  );

  // What came nearby for this space while another was open, once its chats are.
  useEffect(() => {
    if (!e2e || hiddenKey) return;
    void (async () => {
      for (const packet of nearby.heldPackets()) await openNearby(null, packet);
    })();
  }, [e2e]);

  // Restores the relay settings and our queue this space keeps on the phone, sealed with its key
  // (lock/space-data.ts), and its account and contacts (lock/e2e-data.ts). Another space finds
  // only its own. The space's own chat takes its messages itself while it is open, so the
  // receiver beside the other screens (lib/receiver.ts) waits meanwhile, and shares its chats;
  // hidden chats that receive while closed do the same with theirs (lib/place-receiver.ts).
  useEffect(() => {
    let active = true;
    const { space, key } = currentSpace();
    const held = hiddenKey ? null : holdReceiver();
    const placeHeld = hiddenKey ? holdPlace(space, pocket) : null;
    // What is written meanwhile, by this chat or by another screen of it beneath or above, as a
    // token a sign-in gave: taken in place of what was read before (followRelay).
    let heard: SpaceData | null = null;
    const follow = (data: SpaceData) => {
      if (!active) return;
      heard = data;
      followRelay(data);
    };
    const unwatch = hiddenKey ? watchHiddenData(space, pocket, hiddenKey, follow) : watchSpaceData(space, key, follow);
    (hiddenKey ? loadHiddenData(space, pocket, hiddenKey) : loadCurrentSpaceData())
      .then((read) => {
        if (!active) return;
        const data = heard ?? read;
        storedRelay.current = relaySettingsOf(data);
        routesLeft.current = Object.keys(data.routes).length > 0;
        setRelayUrl(data.url);
        setRelayToken(data.token);
        setViaUrl(data.via);
        setViaToken(data.viaToken);
        setPreviews(data.previews);
        setPreviewsTor(data.previewsTor === true);
        setLastSeenOn(data.lastSeen);
        setTellOpenOn(data.tellOpen);
        if (hiddenKey) setPlaceSign(data.sign);
        setHomeUrl(data.spare.url);
        setHomeToken(data.spare.token);
        setOwnQueue(data.ownQueue);
        if (hiddenKey) {
          setRingQueue(data.ringQueue);
          // A queue the relay lost leaves the switch on: the place's own queue is waited on again.
          void loadWatched(space, key)
            .then(async (list) => {
              const own = data.ownQueue?.recipientHex;
              const was = wasWatchedQueue(list, pocket, own);
              if (active) setWatched(was);
              if (was && own && list[pocket]?.recipientHex !== own && data.url.trim()) {
                await rewatchLost(space, key, pocket, { url: data.url.trim(), token: data.token.trim(), recipientHex: own });
              }
            })
            .catch(() => undefined);
          void keepsPlace(space, key, pocket, hiddenKey)
            .then((on) => active && setReceiving(on))
            .catch(() => undefined);
          void loadRinged(space, key)
            .then((list) => active && setRinging(isRingedQueue(list, pocket, data.ringQueue?.recipientHex)))
            .catch(() => undefined);
          // A ring that woke the phone waits on the ring queue: drop it, so it does not ring again.
          const ringQ = data.ringQueue;
          if (ringQ && data.url.trim()) {
            void (async () => {
              const relay: Relay = { url: data.url.trim(), token: data.token.trim() || undefined };
              const recipient = fromHex(ringQ.recipientHex);
              for (let i = 0; i < 10 && active; i++) if (!(await receiveMessage(relay, recipient).catch(() => null))) break;
            })();
          }
        }
      })
      .catch(() => {
        // Nothing usable saved. Start empty.
      })
      .then(async () => {
        // Closed while it read: its chats, and a place's links to its devices, are not opened again.
        if (!active) return;
        if (!hasCore()) {
          setNote(t(NO_CORE));
          return;
        }
        const toShown = (m: Kept): Message => ({ ...m, until: m.until ?? 0, lasts: m.lasts ?? 0, mark: m.mark ?? 0, id: nextId.current++ });
        // The space's messages and contacts show at once, only to read, while a look at the relay
        // under way ends (held); what it brought is in them after. So do hidden chats', while a look
        // of the place's receiver ends (placeHeld): it may be sending through Tor, which can take long.
        let early: { kept: Kept[]; ids: Set<number> } | null = null;
        if (held || placeHeld) {
          const open = await (hiddenKey ? placeChats(space, pocket, hiddenKey) : spaceChats()).catch(() => null);
          if (!active) return;
          if (open) {
            const kept = open.history.messages();
            const firsts = kept.filter((m) => !m.until || m.until > Date.now()).map(toShown);
            early = { kept, ids: new Set(firsts.map((m) => m.id)) };
            fromHistory.current = early.ids;
            openingChats.current = open;
            if (!hiddenKey) setEarlyE2E(open.e2e);
            // The contacts first, so a chat locked with its PIN is never marked read before it asks.
            setContacts(open.e2e.contacts());
            setMessages((list) => [...firsts, ...list]);
          }
        }
        // Not waited for: the look under way stops at its next step, and only this chat's own looks
        // at the relay wait for it (relayFree), not the chat. What that look took meanwhile went
        // into the history, not to this chat, which does not hear the receiver: it is shown then
        // (shownAnew), as are the marks and reactions it brought.
        void Promise.all([held, placeHeld]).then(() => {
          if (!active) return;
          setRelayFree(true);
          if (history.current) showWhole(history.current.messages().map(toShown));
        });
        const shared = hiddenKey ? await placeChats(space, pocket, hiddenKey) : await spaceChats();
        const kept = shared.history;
        if (!active) return;
        voiceParts.current = shared.voiceParts;
        history.current = kept;
        sharedChats.current = shared;
        // What disappeared while the chat was closed goes first.
        await kept.expire(Date.now());
        if (!active) return;
        // Ahead of anything the radio brought while it loaded; in place of what showed at once, if
        // the history changed meanwhile.
        if (early?.kept !== kept.messages()) showWhole(kept.messages().map(toShown));
        // With them, which chats are locked with a PIN, so none shows a moment before its PIN asks.
        setContacts(shared.e2e.contacts());
        const chats = shared.e2e;
        // Where its contact link and its old queues are (lib/queue-move.ts), and when its own queue was made, before anything is sealed.
        if (hiddenKey) {
          const queues = placeQueues(space, pocket, hiddenKey);
          const kept = await queues.load();
          if (kept.moved > 0) chats.setQueueAge(kept.moved, kept.now?.queue.senderHex);
          if (kept.now) chats.setLinkOwn(!kept.link);
          mover.current = new QueueMove({
            e2e: chats,
            queues,
            data: spareStore,
            groups: placeGroups?.moves,
            moved: (queue, old, why) => hiddenMoved.current(queue, old, why),
            ring: () => moveRing.current(),
          });
        } else mover.current = spaceMover({ e2e: chats });
        const queues = await mover.current.queues().catch(() => null);
        if (!active) return;
        setLinkQueue(queues?.link?.queue ?? null);
        setBlocked(chats.blocked());
        // What the receiver beside the other screens had to say of a move meanwhile.
        const said = mover.current.said();
        if (said.length > 0) setNote(said.join(' '));
        if (linkNumber && initial?.startsWith(CONTACT_PREFIX)) {
          await chats.linkPhone(initial.slice(CONTACT_PREFIX.length), linkNumber);
          setNote(t('Messages to {number} now go through Erevos, end-to-end encrypted.', { number: linkNumber }));
        }
        setE2E(chats);
        setContacts(chats.contacts());
        (hiddenKey ? Archive.open(hiddenHolder(pocket), space, hiddenKey) : Archive.open('space', space, key))
          .then((imported) => active && setArchive(imported))
          .catch(() => {
            // The chats show without what was imported.
          });
      })
      .catch((error) => {
        if (active) setNote(t('Chats through the relay could not open. {error}', { error: errorText(error) }));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
      unwatch();
      void held?.then((release) => release());
      void placeHeld?.then((release) => release());
    };
  }, []);

  // Hidden chats lend themselves to their contacts screens while open (lib/hidden-contacts.ts):
  // their contacts and messages, a way to open a chat, or call, from a contact card, and to give a
  // contact the name of the one linked to it.
  const pendingCall = useRef<{ peer: string; video: boolean } | null>(initial && initialCall ? { peer: initial, video: initialCall === 'video' } : null);
  useEffect(() => {
    if (!hiddenKey || !loaded || !e2e) return;
    let lending = true;
    setOpenHiddenPlace({
      space: currentSpace().space,
      pocket,
      key: hiddenKey,
      erevos: () => {
        const phones = e2e.phones();
        return e2e
          .contacts()
          .filter((c) => !c.request)
          .map((c) => ({ identity: c.identity, name: c.name, phone: phones.find((p) => p.identity === c.identity)?.phone ?? '' }));
      },
      messages: (identity) => (history.current?.messages() ?? []).filter((m) => m.peer === `${CONTACT_PREFIX}${identity}`),
      open: (identity, call) => {
        const peer = `${CONTACT_PREFIX}${identity}`;
        pendingCall.current = call ? { peer, video: call === 'video' } : null;
        setDetails(false);
        setShownGroup(null);
        setSelected(peer);
        setArrival((n) => n + 1);
      },
      groups: async () => {
        if (!placeGroups || !canGroup()) return [];
        const groups = await placeGroups.groups();
        return groups.list().filter((g) => g.status === 'in').map((g) => ({ id: g.id, name: g.name }));
      },
      // Shown anew, so a group that is open already takes what was handed to it as it opens.
      openGroup: (id) => {
        setDetails(false);
        setShownGroup(null);
        setTimeout(() => setShownGroup(id), 0);
      },
      // Once they have closed, nothing: their chats would save from a copy no screen uses any more.
      takeName: async (identity, name) => {
        if (!lending) return '';
        const given = await giveLinkedName(e2e, identity, { name });
        if (given) setContacts(e2e.contacts());
        return given;
      },
      tells: () => watchedNow.current,
    });
    // The hidden places open now are asked for what a backup leaves out (lock/collection-data.ts).
    const collection = { holder: hiddenHolder(pocket), space: currentSpace().space, key: hiddenKey };
    hiddenPlaceOpen(collection, true);
    return () => {
      lending = false;
      setOpenHiddenPlace(null);
      hiddenPlaceOpen(collection, false);
    };
  }, [hiddenKey, loaded, e2e, placeGroups]);
  // The call asked for starts once its chat is open: also when it was open already, as when a
  // hidden contact's card calls from over its own chat (`open` above counts another arrival).
  useEffect(() => {
    const wanted = pendingCall.current;
    if (!wanted || !loaded || !e2e || selected !== wanted.peer) return;
    pendingCall.current = null;
    void startCall(wanted.video);
  }, [loaded, e2e, selected, arrival]);

  // Another chat starts with its latest imported messages and pinned message, and answers nothing yet.
  // The offer to connect a contact just added stays with its own chat only.
  useEffect(() => {
    if (draftOf.current !== selected) {
      // A message being edited is not a draft: its words stay with it.
      if (draftOf.current) drafts.current.set(draftOf.current, editing ? '' : draft.text());
      draftOf.current = selected;
      draft.set((selected && drafts.current.get(selected)) || '');
    }
    setConnecting((c) => (c && selected === `${CONTACT_PREFIX}${c}` ? c : null));
    setImportedShown(IMPORTED_PAGE);
    setThreadShown(THREAD_PAGE);
    setStretch(null);
    // It opens at its end, whatever was done in the chat before: kept, a scroll held for earlier
    // messages that never came, or the end left there, made it open at a message long read.
    atEnd.current = true;
    holdScroll.current = false;
    above.current = null;
    growing.current = false;
    endShown.current = false;
    importedPlaced.current.clear();
    photoAt.current.clear();
    setNearPhotos([]);
    smsAsked.current = null;
    setReplying(null);
    if (editing) setEditing(null);
    setPinShown(0);
    setSearching(null);
    setAttaching(false);
    setChoosingLater(false);
    setVanishing(false);
  }, [selected]);

  // Typing shows only a few seconds after the last word that it does.
  useEffect(() => {
    const until = Math.max(0, ...Object.values(typing));
    if (until <= Date.now()) return;
    const timer = setTimeout(() => setTyping((now) => Object.fromEntries(Object.entries(now).filter(([, at]) => at > Date.now()))), until - Date.now() + 50);
    return () => clearTimeout(timer);
  }, [typing]);

  // A message gone to is lit a moment.
  useEffect(() => {
    if (lit === null) return;
    const timer = setTimeout(() => setLit(null), 1600);
    return () => clearTimeout(timer);
  }, [lit]);

  // Disappearing messages go from the screen and the phone once their time has come.
  // The screen is not drawn again every few seconds for it: the clock goes when the next thing is
  // due, a message that disappears, one of theirs that shows at its time, or a contact no longer
  // known to be here; and once a minute at least, for what is shown by the day.
  useEffect(() => {
    const from = Date.now();
    let next = from + 60_000;
    for (const m of messages) {
      if (m.until && m.until < next) next = m.until;
      if (!m.mine && m.at > from && m.at < next) next = m.at;
    }
    if (e2e) {
      for (const c of contacts) {
        const until = e2e.onlineUntil(c.identity, from);
        if (until > 0 && until < next) next = until;
      }
    }
    const timer = setTimeout(
      () => {
        const now = Date.now();
        setNow(now);
        setMessages((list) => (list.some((m) => m.until && m.until <= now) ? list.filter((m) => !(m.until && m.until <= now)) : list));
        history.current?.expire(now).catch(() => {
          // Tried again on the next round.
        });
      },
      Math.max(250, next - from + 50),
    );
    return () => clearTimeout(timer);
  }, [messages, contacts, e2e, now]);

  // A note goes after a while. One that is still true, like a relay that cannot be reached, comes
  // back with the next try.
  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => setNote((current) => (current === note ? '' : current)), NOTE_SHOWN);
    return () => clearTimeout(timer);
  }, [note]);

  // Saves the relay settings and our queue whenever they change: only what this chat changed, so
  // one opened before a sign-in on another screen of it never writes the token from before back,
  // which the relay no longer lets in. The look kept beside them stays as it is. Contacts from
  // before messages were encrypted (routes) cannot be written to any more, so they go.
  useEffect(() => {
    if (!loaded) return;
    const now: RelaySettings = { url: relayUrl, token: relayToken, via: viaUrl, viaToken, ownQueue };
    const data: Partial<SpaceData> = storedRelay.current ? changedRelaySettings(storedRelay.current, now) : { ...now };
    if (routesLeft.current) data.routes = {};
    if (Object.keys(data).length === 0) return;
    storedRelay.current = now;
    routesLeft.current = false;
    (hiddenKey ? updateHiddenData(currentSpace().space, pocket, hiddenKey, data) : updateCurrentSpaceData(data)).catch(() => {
      // A failed save only means the next launch starts empty.
    });
  }, [loaded, relayUrl, relayToken, viaUrl, viaToken, ownQueue]);

  // Takes a contact opened from a scanned code, once the saved contacts are loaded so they
  // cannot overwrite it. One offered among hidden chats' screens is theirs only: should they close
  // before their chats take it, no other chats add it.
  useEffect(() => {
    if (!loaded || !shown) return;
    return onContactOffered((code, offer) => {
      if (offer && offer.place.holder !== 'space' && !offerFor(offer, contactsPlace)) return;
      void acceptContact(code, offer);
    });
  }, [loaded, shown, relayUrl, relayToken, ownQueue, e2e]);

  // Takes an invite to a relay opened from a scanned link (app/relay-invite.tsx), once the saved
  // relay settings are loaded so they cannot overwrite it. Hidden chats take none.
  useEffect(() => {
    if (!loaded || !shown || hiddenKey) return;
    return onInviteOffered(currentSpace().space, (invite) => void joinRelay(invite));
  }, [loaded, shown, relayUrl, relayToken, ownQueue]);

  // Takes an invite for someone new opened from a scanned link (app/welcome.tsx), as the above.
  useEffect(() => {
    if (!loaded || !shown || hiddenKey || !e2e) return;
    return onWelcomeOffered(currentSpace().space, (welcome) => void takeWelcome(welcome));
  }, [loaded, shown, relayUrl, relayToken, ownQueue, e2e]);

  // Takes an invite by plain SMS opened from its link (app/text-invite.tsx), as the above.
  useEffect(() => {
    if (!loaded || !shown || hiddenKey || !e2e) return;
    return onTextInviteOffered(currentSpace().space, (invite) => void takeTextInvite(invite, invite.name));
  }, [loaded, shown, relayUrl, relayToken, ownQueue, e2e]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  // A call in hidden chats ends when they close, as they do when Erevos goes to the background.
  // The space's calls go on over the other screens.
  useEffect(() => () => endCallsOf(hiddenCalls.current), []);

  // The lines of the space's calls, kept by lib/space-calls.ts, show here as they come.
  useEffect(() => {
    if (hiddenKey) return;
    return onSpaceCallLine((message) => showCallLine(message));
  }, [hiddenKey]);

  // A contact's messages are read once their chat shows on the screen: their phone is told with
  // the next look at the relay, and the disappearing ones start their time. So too while the chat
  // opens (e2e not there yet), when the messages show only to read as a look at the relay under
  // way ends, which through Tor can take tens of seconds: they are marked in the history they
  // came from (openingChats), which the home screen counts from, even if the chat is left before
  // it opens. Their phone is told with the chat's first look, once open; left before, it is not.
  // One of theirs that came before the time it was sent for (lib/later.ts) shows only then, and is
  // read only then: the clock (`now`) goes at its time. Counted as unread before it, it was marked
  // again and again without end, and the chat was drawn again each time.
  useEffect(() => {
    if (!shown || gated || !appActive || !(e2e || openingChats.current) || !selected?.startsWith(CONTACT_PREFIX)) return;
    const shownBy = Date.now();
    const unread = messages.filter((m) => m.peer === selected && !m.mine && m.mark < 2 && m.at <= shownBy);
    if (unread.length === 0) return;
    const peer = selected;
    // While it opens, only those that show: the look under way may keep more in the history meanwhile.
    markMessages(peer, false, 2, e2e ? null : unread.map((m) => m.tag))
      .then((tags) => receipt(peer, 'read', tags))
      .catch(() => {
        // Read here, but their phone is not told.
      });
  }, [shown, gated, appActive, e2e, selected, messages, now]);

  // While a contact's chat shows, it asks now and then whether their phone is open, saying this
  // one is. A chat that appears offline asks nothing, so it does not learn it either. It asks
  // again when a phone links nearby: the answer says whether it is theirs (lib/nearby.ts).
  const selectedHidden = contacts.some((c) => `${CONTACT_PREFIX}${c.identity}` === selected && c.hide);
  const selectedTor = contacts.some((c) => `${CONTACT_PREFIX}${c.identity}` === selected && c.tor === true);
  const selectedVoice = contacts.find((c) => `${CONTACT_PREFIX}${c.identity}` === selected)?.voice;
  const selectedAccepted = contacts.some((c) => `${CONTACT_PREFIX}${c.identity}` === selected && !c.request);
  const linked = hiddenKey ? 0 : nearby.count();
  useEffect(() => {
    if (!shown || gated || !appActive || !e2e || !selected?.startsWith(CONTACT_PREFIX) || selectedHidden || !selectedAccepted) return;
    const identity = selected.slice(CONTACT_PREFIX.length);
    const ask = () => {
      const target = relayTarget();
      // Said a moment ago already: they know, and answer that.
      if ((!target && linked === 0) || Date.now() - e2e.toldAt(identity) < (ONLINE * 1000) / 3) return;
      sendToContact(target, identity, '', { ask: true, on: ONLINE }).catch(() => {
        // Asked again in a while.
      });
    };
    ask();
    const timer = setInterval(ask, ASK_EVERY);
    return () => clearInterval(timer);
  }, [shown, gated, appActive, e2e, selected, selectedHidden, selectedAccepted, relayUrl, relayToken, viaUrl, viaToken, ownQueue, linked]);

  // Asks our relay for its key once its address is known, and again while it cannot be reached:
  // until then what goes from here names it with no key. A relay without one, or an app whose core
  // cannot seal, leaves the key out of our link: then only contacts on our relay can reach us.
  useEffect(() => {
    const url = relayUrl.trim();
    setOwnRelayKey('');
    if (!url || !canRelaySeal()) return;
    return askRelayKey({ url, token: relayToken.trim() || undefined }, (key) => key && setOwnRelayKey(toBase64Url(key)));
  }, [relayUrl, relayToken]);

  // Once a place is chosen for the link, asks our relay for a ticket for one, so whoever adds us
  // with no relay of their own takes one (lib/relay.ts, lendTicket). A link is passed on, so the
  // ticket is a key to the relay for whoever sees it: never put in by itself. It is kept with the
  // space's data while it has more than a week left, so the link stays the same; then a new one is
  // asked for. A place lent to us lends none on, and hidden chats lend none.
  const canSharePlace = loaded && !hiddenKey && !!relayUrl.trim() && !isLentToken(relayToken);
  useEffect(() => {
    const url = relayUrl.trim();
    setOwnTicket('');
    setPlaceNote('');
    if (!sharePlace || !canSharePlace) return;
    let active = true;
    void (async () => {
      const kept = (await loadCurrentSpaceData()).lend;
      const left = kept.ticket && sameRelay(kept.relay, url) ? ticketExpires(kept.ticket) - Date.now() : 0;
      if (left > TICKET_KEPT) {
        if (active) setOwnTicket(kept.ticket);
        return;
      }
      try {
        const ticket = await lendTicket({ url, token: relayToken.trim() || undefined });
        if (!active) return;
        setOwnTicket(ticket ?? '');
        if (!ticket) setPlaceNote(t('Your relay lends no places: its operator has not turned lending on.'));
        await updateCurrentSpaceData({ lend: ticket ? { relay: url, ticket } : NO_LENDING });
      } catch {
        // The relay cannot be reached: the one kept, while it lasts, and asked again next time.
        if (!active) return;
        if (left > 0) setOwnTicket(kept.ticket);
        else setPlaceNote(t('Your relay cannot be reached, so the link has no place in it.'));
      }
    })().catch(() => undefined);
    return () => {
      active = false;
    };
  }, [sharePlace, canSharePlace, relayUrl, relayToken]);

  // Looks at our own relay queue every few seconds and opens what came. Without the core nothing
  // could open it, so the queue is left alone, and its messages wait on the relay. Started again
  // once our relay's key is known, so what its looks seal, the marks too, says it (here).
  useEffect(() => {
    const url = relayUrl.trim();
    if (!url || !ownQueue || !e2e || !relayFree) return;
    // Taking messages goes straight to our relay; sending goes through the second relay if set.
    const own: Relay = { url, token: relayToken.trim() || undefined };
    let sends = relayFor(url, relayToken, viaUrl, viaToken) ?? own;
    // A call from here starts without asking for the call relay first (lib/relay.ts callRelay).
    warmCallRelay(own);
    const recipient = fromHex(ownQueue.recipientHex);
    const ownSender = ownQueue.senderHex;
    let active = true;
    let busy = false;
    // The note shown while the relay could not be reached, taken back once it answers again.
    let failed: string | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    // In the background: whether the last look waited at the relay, and how many failed in a row (lib/receiver.ts).
    let waited: Waited = false;
    let failures = 0;
    async function look() {
      if (busy || !e2e) return;
      busy = true;
      waited = false;
      // Once the backup relay is ready, sends go through it when ours cannot be reached.
      const backup = spareBackup(spareStore);
      if (backup && !sends.backup) sends = { ...sends, backup: { ...backup, via: sends.via } };
      // One message from our queue (`own`), from one of the others (`old`, lib/queue-move.ts), or
      // from the backup queue: what it was to the junk meter.
      const take = async (bytes: Uint8Array, kind?: QueueKind | 'old', mine = ''): Promise<Took> => {
        if (!e2e) return { junk: false };
        // A group's message (lib/groups.ts): the space's, or this hidden place's.
        if (isGroupPacket(bytes)) return { junk: !(await takeGroup(bytes).catch(() => true)) };
        // An answer to an SMS invite sent from here: their contact link.
        const invited = hiddenKey ? null : await takeInviteAnswer(e2e, bytes, ownSender, here()).catch(() => null);
        if (invited) {
          if (active) setContacts(e2e.contacts());
          if (active) {
            // An invite shown as a QR code or shared as a link has no number: whoever took it joined.
            const added = e2e.contacts().find((c) => c.identity === invited.identity);
            const name = invited.number ? '' : (added?.name ?? '');
            // New chat waiting for them, on Near me or Far away, says so on its last page.
            if (added && !added.request && !invited.number) showJoined(invited.identity);
            setNote(
              invited.card
                ? added?.request
                  ? t('Someone added you with your contact QR code: their chat waits as a message request.')
                  : t('Someone added you with your contact QR code, and is your contact now.')
                : invited.number
                ? t('{number} has Erevos. Messages to that number now go through Erevos, end-to-end encrypted.', { number: invited.number })
                : name
                  ? t('{name} took your invite and is your contact now: what you write to each other is end-to-end encrypted.', { name })
                  : t('Someone took your invite and is your contact now: what you write to each other is end-to-end encrypted.'),
            );
          }
          return { junk: false };
        }
        // Taken from the relay, so kept even if the chat closed meanwhile.
        let received = await e2e.receive(bytes, kind === 'own' ? { onOwn: ownSender } : mine ? { onMine: mine } : { old: kind !== undefined });
        // Someone whose SMS invite was answered here: a contact at once, not a message request.
        const inviter = !hiddenKey && received.kind === 'message' && received.added ? await linkInviter(e2e, received.identity).catch(() => null) : null;
        if (inviter && received.kind === 'message') received = { ...received, request: false };
        handle(received, false, 'relay');
        if (inviter && active) {
          setNote(
            inviter.number
              ? t('{number} has Erevos and is now a contact. Messages to that number go through Erevos.', { number: inviter.number })
              : inviter.name
                ? t('Welcome to Erevos. {name} is your contact now: what you write to each other is end-to-end encrypted.', { name: inviter.name })
                : t('Welcome to Erevos. Whoever invited you is your contact now: what you write to each other is end-to-end encrypted.'),
          );
          // Their invite was answered from New chat (I have their code): it ends on its last page.
          if (!inviter.number && received.kind === 'message') showJoined(received.identity);
        }
        return tookOf(received);
      };
      // Tells a kept contact where this chat reads now, in a quiet message with nothing in it: from
      // the queue and the ring queue kept now, which a move just changed (lib/queue-move.ts).
      const tellNow = async (identity: string) => {
        const { space, key } = currentSpace();
        const data = await (hiddenKey ? loadHiddenData(space, pocket, hiddenKey) : loadCurrentSpaceData());
        const rf = hiddenKey ? (ringing && data.ringQueue ? data.ringQueue.senderHex : '') : undefined;
        const sealed = await e2e.seal(identity, '', data.ownQueue?.senderHex ?? ownSender, { at: here(), rf });
        await handOver(e2e, sends, identity, sealed, [sealed.packet], 'quiet');
      };
      // What came to the backup queue, whether or not our relay answers.
      const spare = () => lookAtSpare(e2e, (bytes) => take(bytes).then(() => undefined), () => !active, spareStore).catch(() => undefined);
      const found = { taken: 0, junk: 0 };
      // What came to a contact's own queue, as a call's offer, is read before the sends and between
      // them, which through Tor can take tens of seconds (QueueMove.readCame).
      const early = () => (active && mover.current ? mover.current.readCame({ own, takeMine: (bytes, r) => take(bytes, 'old', r), stop: () => !active }).catch(() => undefined) : Promise.resolve());
      try {
        await early();
        await sendPending(e2e, sends);
        await early();
        await sendCopies(e2e, sends).catch(() => 0);
        await early();
        // What this phone carries for its relays, from phones nearby or its own (lib/nearby.ts).
        if (!hiddenKey) void nearby.uploadCarried((url, sealed, mark) => carryTo(sends, url, sealed, mark)).catch(() => undefined);
        // An SMS invite sent from the SMS screen since: its answer may be on its way.
        if (!hiddenKey) await refreshSmsLink().catch(() => undefined);
        await early();
        // Out of a call: waits at the relay until something comes, to the other queues there too, or something is to be said (lookNow).
        const others = awayQueues((await mover.current?.queues().catch(() => null)) ?? null, url);
        const answers = () => {
          if (failed === null || !active) return;
          const shown = failed;
          setNote((current) => (current === shown ? t('The relay answers again.') : current));
          failed = null;
        };
        if (!hiddenKey && !currentCall() && !currentGroupCall()) waited = await waitWhileAway(own, recipient, others.map(fromHex));
        // Nothing came to the queue while the wait lasted: it is not asked again.
        if (waited === 'empty') answers();
        for (let i = 0; i < RECEIVE_BATCH && waited !== 'empty' && active; i++) {
          const bytes = await receiveMessage(own, recipient);
          answers();
          if (!bytes) break;
          found.taken++;
          if ((await take(bytes, 'own')).junk) found.junk++;
        }
        await spare();
        // A move due, kept contacts told, the other queues read (lib/queue-move.ts). Moved, the look
        // starts again on the new queue.
        const moved = active && mover.current ? await mover.current.look({ own, found, take, takeMine: (bytes, r) => take(bytes, 'old', r), tell: tellNow, shows: appShown(), waited: waited !== false, stop: () => !active, empty: waited === 'empty' ? others : [] }).catch(() => null) : null;
        if (moved && active) {
          if (moved.notes.length > 0) setNote(moved.notes.join(' '));
          const after = await mover.current!.queues().catch(() => null);
          if (active && after) setLinkQueue(after.link?.queue ?? null);
          if (moved.queue) {
            setOwnQueue(moved.queue);
            return;
          }
        }
        // With the queue the link names as the look left it, never the own queue a move just made.
        const after = await mover.current?.queues().catch(() => null);
        if (!hiddenKey) await answerInvites(e2e, after ? linkOf(after, after.now?.queue ?? ownQueue!).senderHex : ownSender, here(), sends).catch(() => undefined);
        // Invites by plain SMS that are over: their invites to the relay, taken back when unused.
        if (!hiddenKey) await expireTextInvites(own).catch(() => undefined);
        // What waited to go, now that the relay answers.
        void sendWaitingNow.current(true);
        await sendReceipts(sends);
        await sendKeys(sends);
        await relayOffers.current(own, sends);
        // Imported chats shared, going and coming in rounds (lib/share-rounds.ts).
        shareDrive.current(own);
        // Texts that went through Nostr, not said to have come in time, through the relay as well.
        await sendNostrBackups(e2e, sends);
        // To contacts Nostr is the only way to, what is due there again (lib/nostr-chats.ts).
        await sendNostrAgain(e2e);
        await sendCopies(e2e, sends).catch(() => 0);
        // A hidden place's groups: what the relay did not take, and keys due (the space's: lib/receiver.ts).
        await placeGroups?.flush().catch(() => undefined);
        failures = 0;
      } catch (error) {
        failures++;
        await spare();
        if (!active) return;
        if (!isQueueNotFound(error)) {
          failed = errorText(error);
          setNote(failed);
          return;
        }
        // The relay no longer has our queue (deleted, or a relay that keeps queues in memory
        // was restarted). Make a new one so messages can reach us again: contacts are told.
        try {
          const queue = await mover.current?.lost(own);
          if (!active || !queue) return;
          setOwnQueue(queue);
          setNote(t('The relay had lost your queue, so you have a new one. Your contacts are told quietly.'));
        } catch (retry) {
          if (active) setNote(errorText(retry));
        }
      } finally {
        busy = false;
      }
    }
    // Asked to look at once while a look was under way: the next one starts as soon as it ends.
    let again = false;
    function next() {
      const inCall = currentCall() || currentGroupCall();
      timer = setTimeout(
        async () => {
          timer = null;
          await look();
          if (active) next();
        },
        again ? 0 : inCall ? LOOK_IN_CALL : appShown() ? shownPace(waited, LOOK_EVERY) : awayPace(waited, failures),
      );
      again = false;
    }
    next();
    // The copies for contacts' endpoints of what was just sealed go at once (lib/fanout.ts).
    const stopCopies = e2e.onCopies(() => void sendCopies(e2e, sends).catch(() => 0));
    // Shown again: looks at once, not after a wait meant for the background.
    const shown = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !timer) return;
      clearTimeout(timer);
      timer = null;
      void look().finally(() => active && !timer && next());
    });
    // Something came to a contact's own queue (lib/contact-queues.ts): a look at once, or right
    // after the one under way.
    const stopCame = onContactsCame(() => {
      if (!timer) {
        again = true;
        return;
      }
      clearTimeout(timer);
      timer = null;
      void look().finally(() => active && !timer && next());
    });

    return () => {
      active = false;
      shown.remove();
      stopCame();
      stopCopies();
      if (timer) clearTimeout(timer);
    };
  }, [relayUrl, relayToken, viaUrl, viaToken, ownQueue, e2e, ownRelayKey, relayFree]);

  // To each contact with no queue of their own, added here or accepted, once: an invite to this
  // phone's relay, sent by itself in a message with nothing to show, whatever way the two first met
  // (lib/relay-offer.ts). Only while something reaches them now, so no invite is made for nothing:
  // it is one of this phone's invites there (lib/relay.ts makeInvite). Where this phone may invite
  // no one, none goes; nor from hidden chats. And once this phone took one itself, its contacts are
  // told quietly where it reads now.
  const offeredNow = useRef(new Set<string>());
  const relayOffers = useRef((_own: Relay, _sends: Relay) => Promise.resolve());
  relayOffers.current = async (own, sends) => {
    if (!e2e || hiddenKey || !ownQueue) return;
    if (tellJoined.current) {
      tellJoined.current = false;
      for (const contact of e2e.contacts()) if (!contact.request) await sendToContact(sends, contact.identity, '', {}, true).catch(() => undefined);
    }
    if (!own.token || isLentToken(own.token)) return;
    for (const identity of e2e.relayInvitesDue()) {
      if (offeredNow.current.has(identity) || (!nearby.isNear(identity) && !(nostrReady() && e2e.readsOnNostr(identity)))) continue;
      offeredNow.current.add(identity);
      try {
        // The relay sees a name of random letters and digits; the contact's stays here (lib/e2e.ts lineFor).
        const name = e2e.contacts().find((c) => c.identity === identity)?.name || identity.slice(0, 8);
        const made = await makeInvite(own, await e2e.lineFor(name));
        if (!made) return;
        await sendToContact(sends, identity, '', { more: { ri: { r: own.url, c: made.code } } }, true);
        await e2e.relayInviteSent(identity);
      } catch {
        // Tried again the next time Erevos opens.
      }
    }
  };

  // With no relay queue, what goes through Nostr to the contacts it is the only way to (lib/nostr-chats.ts
  // nostrOnlyWay), while Tor is ready: what waited, the marks that messages came and were read, new
  // prekeys, and what is due there again. What comes there is read as with a relay (takeNostr). In
  // hidden chats too, which have no relay then either.
  // As the space or these hidden chats stop showing, those told meanwhile that they were open hear
  // when they closed, at once, while the chats are still open (E2E.closeDue, lib/last-seen.ts).
  const tellClosed = useRef<(since: number, at: number) => void>(() => undefined);
  tellClosed.current = (since, at) => {
    const due = e2e?.closeDue(since, at) ?? [];
    if (due.length === 0) return;
    for (const identity of due) answers.current.add(`${CONTACT_PREFIX}${identity}`);
    void sendReceipts(relayTarget()).catch(() => undefined);
  };
  useEffect(() => onShownEnded((_key, since, at) => tellClosed.current(since, at)), []);
  const nostrLook = useRef(() => Promise.resolve());
  nostrLook.current = async () => {
    if (!e2e || !nostrReady()) return;
    await sendKeys(null);
    await sendNostrAgain(e2e);
    await sendWaitingNow.current(false);
    await sendReceipts(null);
  };
  useEffect(() => {
    if (!e2e || !relayFree || (relayUrl.trim() && ownQueue)) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    function next() {
      timer = setTimeout(
        async () => {
          timer = null;
          await nostrLook.current().catch(() => undefined);
          if (active) next();
        },
        appShown() ? NOSTR_LOOK : NOSTR_LOOK_AWAY,
      );
    }
    next();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [relayUrl, ownQueue, e2e, relayFree]);

  // Calls that came while these hidden chats were closed, and still ring (lib/place-receiver.ts):
  // they ring here, now that the PIN opened them.
  useEffect(() => {
    if (!hiddenKey || !e2e || !loaded) return;
    for (const received of takePlaceCalls(currentSpace().space, pocket)) {
      if (!received.call) continue;
      void callSignal(callPlace, `${CONTACT_PREFIX}${received.identity}`, received.call, received.request, rtc, received.from).then((said) => {
        if (said) setNote(said);
      });
    }
  }, [e2e, loaded]);

  // What one message from the relay, or from a phone nearby, brings.
  function handle(received: Awaited<ReturnType<E2E['receive']>>, nostr = false, route?: Route) {
    if (!e2e) return;
    if (received.kind === 'refused') {
      if (received.reason === 'plain') setNote(t('A message that was not end-to-end encrypted came, and was not shown.'));
      return;
    }
    const peer = `${CONTACT_PREFIX}${received.identity}`;
    // Erevos in the background: the notice says one more came (lib/background.ts), at its time
    // for one sent for later that a relay sent too soon (lib/later.ts), and so it shows.
    const shows = showsAt(received.due);
    // In the chat, one that waited on a relay is put at when it was sent (lib/later.ts cameAt).
    const placed = cameAt(received.due, received.sent);
    // One that came already, from their account and again from one of their endpoints, or through
    // the phone and again directly, is shown once (docs/multi-device.md); so is a part of a voice
    // message that came already, as it goes again whole after only some of it went.
    const twice =
      received.twice || (!!received.tag && !!history.current?.has(peer, received.tag)) || (!!received.voice && voiceParts.current.has(peer, received.voice));
    if (!twice && isNews(received)) {
      if (!hiddenKey) messageCameAt(shows, received.quiet, screenOfChat(received.identity), undefined, received.tag);
      // Open hidden chats sound as the others do while Erevos shows; in the background they say it
      // only if their place says so while closed (Say when a message comes).
      // One that waits for its time tells then only while these chats are still open, or their place says so.
      else if (appShown() || watchedNow.current) messageCameAt(shows, received.quiet, screenOfHidden(pocket), screenOfChat(received.identity), received.tag, () => watchedNow.current || (appShown() && hiddenOpen.current));
    }
    setContacts(e2e.contacts());
    setSelected((current) => current ?? peer);
    if (received.call) {
      void callSignal(callPlace, peer, received.call, received.request, rtc, received.from).then((said) => {
        if (said) setNote(said);
      });
    }
    if (received.group) void (placeGroups ? placeGroups.signal(received.identity, received.group, received.request) : takeGroupSignal(received.identity, received.group, received.request)).catch(() => undefined);
    if (received.online || received.seen) setNow(Date.now());
    const hidden = e2e.contacts().some((c) => c.identity === received.identity && c.hide);
    if (received.ask && !received.request && !hidden && answersAsk(e2e.toldAt(received.identity))) {
      answers.current.add(peer);
      lookNow();
    }
    // What else it is: an answer to one of the chat's messages, a sticker.
    // One sent without sound that waits for its time keeps it, for its notice then (lib/background.ts).
    const parts: { quiet?: boolean } & Parts = { ...(received.quiet && shows > Date.now() ? { quiet: true } : {}), ...(received.re ? { re: received.re } : {}), ...contentOf(received.more), ...(nostr ? { nostr: true } : route ? { route } : {}) };
    // Put together while the history does not hold it, from what came before too, and kept once
    // whole, as the receiver does (lib/receiver.ts).
    if (received.voice && !(received.tag && history.current?.has(peer, received.tag))) {
      const whole = voiceParts.current.add(peer, received.voice);
      const { tag, timer } = received;
      if (whole && !twice) {
        if (whole.talk && listening.current === peer) {
          stopPlaying.current?.();
          stopPlaying.current = playVoice(whole.audio, () => undefined);
        }
        saveClip(whole.audio, whole.ms)
          .then((voice) => {
            // Its other copy, whole meanwhile.
            if (tag && history.current?.has(peer, tag)) return deleteClip(voice.id);
            addMessage(peer, '', false, tag, timer, voice, undefined, 0, placed, parts);
            if (tag) receipt(peer, 'got', [tag]);
          })
          .catch((error) => setNote(t('A voice message came but could not be kept. {error}', { error: errorText(error) })));
      }
    }
    if (received.file && !twice) {
      // Taken from the relay by the effect that watches for files waiting.
      const tag = addMessage(peer, '', false, received.tag, received.timer, undefined, offerRef(received.file), 0, placed, parts);
      receipt(peer, 'got', [tag]);
      // Imported chats shared: kept with the next round of shares (lib/share-rounds.ts).
      if (received.file.history && sharedChats.current) void packCame(sharedChats.current, received.identity, tag).then(() => shareDrive.current(ownRelay()), () => undefined);
    }
    // How far a share is, said by the other phone: taken in with the next round.
    if (received.more.rounds && !received.twice && sharedChats.current) void roundsCame(sharedChats.current, received.identity, received.more.rounds).then(() => shareDrive.current(ownRelay()), () => undefined);
    // Chats shared from here, tapped there: being taken, or did not come; the line says so.
    if (received.more.taking && !received.twice && sharedChats.current) void takingCame(sharedChats.current, received.identity, received.more.taking).catch(() => undefined);
    if (received.text && !twice) {
      addMessage(peer, received.text, false, received.tag, received.timer, undefined, undefined, 0, placed, parts);
      if (received.tag) receipt(peer, 'got', [received.tag]);
    }
    // Marked on the screen at once. A mark the history could not keep is the old one when the chat next opens.
    if (received.got.length > 0) markMessages(peer, true, 1, received.got).catch(() => undefined);
    if (received.read.length > 0) markMessages(peer, true, 2, received.read).catch(() => undefined);
    // Their reaction to one of the chat's messages, or none any more.
    if (received.react) {
      const { tag, emoji } = received.react;
      setMessages((list) => list.map((m) => (m.peer === peer && m.tag === tag ? { ...m, theirReaction: emoji || undefined } : m)));
      history.current?.react(peer, tag, false, emoji).catch(() => undefined);
    }
    // An invite to their relay (lib/relay-offer.ts): taken now, or, from a request, once accepted.
    const offer = hiddenKey || twice ? null : offerOf(received);
    if (offer && !offer.request) void takeOffer(offer, offer.from);
    else if (offer) void keepOffer(offer).catch(() => undefined);
    // A step of an introduction (lib/intros.ts): kept, answered by what follows, the contact it gives added.
    if (received.more.intro && !twice) {
      const chats = e2e;
      const send = (m: IntroSend) => sendToContact(relayTarget(), m.to, '', { more: m.more }, true).then(() => undefined);
      void takeIntro(chats, received.identity, received.more.intro, received.request, send, ownQueue?.senderHex ?? '', here())
        .then((came) => {
          setIntroTick((n) => n + 1);
          if (came?.kind === 'add') {
            setContacts(chats.contacts());
            setNote(t('{name} is now a contact, introduced by {by}. Compare the safety number with theirs.', { name: came.name, by: label(peer, chats.contacts()) }));
          }
        })
        .catch((error) => setNote(errorText(error)));
    }
    // A piece of their backup password, to keep for them, or one of ours given back (lib/pieces-kept.ts).
    if (received.more.piece && !twice) void keepPieceFrom(e2e, received.identity, received.more.piece, received.request).catch(() => null);
    // They type to us now, or wrote: then they no longer do.
    if (received.more.typing) setTyping((now) => ({ ...now, [peer]: Date.now() + TYPING_SHOWS }));
    else if (received.text || received.voice || received.file) setTyping(({ [peer]: _done, ...others }) => others);
    // One of the chat's messages pinned to its top on their phone, or taken down; their vote on a poll.
    const { pin, vote } = received.more;
    if (pin) pinHere(peer, pin.tag, pin.on);
    if (vote) {
      setMessages((list) =>
        list.map((m) => {
          if (m.peer !== peer || m.tag !== vote.tag || !m.poll || m.closed) return m;
          const chose = checkedChoices(vote.chose, m.poll.o.length, !!m.poll.m);
          return chose ? { ...m, theirVote: chose } : m;
        }),
      );
      history.current?.vote(peer, vote.tag, false, vote.chose).catch(() => undefined);
    }
    // They ended one of their polls: it shows how the votes stood, and takes no more.
    const { close } = received.more;
    if (close) {
      const at = Date.now();
      history.current
        ?.close(peer, close.tag, false, at)
        .then((changed) => {
          if (changed) setMessages((list) => list.map((m) => (m.peer === peer && m.tag === close.tag && !m.mine && m.poll ? { ...m, closed: at } : m)));
        })
        .catch(() => undefined);
    }
    // They paid one of our payment requests, as they marked it (lib/pay.ts): once.
    const { settled } = received.more;
    if (settled) {
      const at = Date.now();
      history.current
        ?.paid(peer, settled.tag, false, at)
        .then((changed) => {
          if (!changed) return;
          setMessages((list) => list.map((m) => (m.peer === peer && m.tag === settled.tag && m.mine && m.pay ? { ...m, paid: at } : m)));
          setNote(t('{name} marked your payment request paid.', { name: label(peer, e2e.contacts()) }));
        })
        .catch(() => undefined);
    }
    // New words for one of theirs, as only they change their own: shown as edited.
    const { edit } = received.more;
    if (edit) {
      const at = Date.now();
      history.current
        ?.edit(peer, edit.tag, false, edit.text, at)
        .then((changed) => {
          if (!changed) return;
          setMessages((list) => list.map((m) => (m.peer === peer && m.tag === edit.tag ? { ...m, text: edit.text, edited: at, preview: previewAfterEdit(m.preview, edit.text) } : m)));
          setNote(t('{name} edited a message.', { name: label(peer, e2e.contacts()) }));
        })
        .catch(() => undefined);
    }
    const name = label(peer, e2e.contacts());
    if (received.timerChanged) {
      setNote(
        received.timer
          ? t('{name} set new messages in this chat to disappear {time} after they are read.', { name, time: timerLabel(received.timer) })
          : t('{name} turned disappearing messages off in this chat.', { name }),
      );
    }
    if (received.shotsChanged) {
      setNote(received.noShots ? t('{name} blocked screenshots of this chat, on both phones.', { name }) : t('{name} allowed screenshots of this chat again.', { name }));
    }
    // Once gone, the notice no longer counts it (lib/background.ts).
    const gone = (tag: string | null) => () => void messageGone(screenOfChat(received.identity), tag, !hiddenKey).catch(() => undefined);
    if (received.erase && 'all' in received.erase) {
      void forgetChat(peer).then(gone(null));
      setNote(t('{name} deleted the messages of this chat on both phones.', { name }));
    } else if (received.erase) {
      void forgetMessage({ id: -1, peer, text: '', mine: false, tag: received.erase.tag, until: 0, lasts: 0, mark: 0, at: 0 }).then(gone(received.erase.tag));
      setNote(t('{name} deleted a message on both phones.', { name }));
    }
    if (received.added && received.request) {
      setNote(t('Message request from {name}: they have your contact link. Accept it to answer, or refuse it.', { name }));
    } else if (received.added) {
      setNote(t('New chat with {name}: they added your contact link. Compare the safety number with theirs.', { name }));
    }
  }

  // Shows a message, and keeps it on the phone when it is with a contact, for `timer` seconds once
  // read if it disappears. A contact's message from an Erevos before tags gets one known to this
  // phone only. Returns its tag.
  // A message of ours that waits to go is marked so (`mark`, lib/waiting.ts); one sent for later
  // has the time it should go (`at`), and shows after the others until then, as does theirs sent
  // for later that came before its time, which shows only then. `more`: of ours, the relay that
  // holds it for later, or that it waits to go without sound; of either, its Parts.
  function addMessage(
    peer: string,
    text: string,
    mine: boolean,
    tag = '',
    timer = 0,
    voice?: VoiceRef,
    file?: FileRef,
    mark: Mark = 0,
    at = Date.now(),
    more: { held?: HeldAt; heldFor?: string; quiet?: boolean } & Parts = {},
  ): string {
    const contact = peer.startsWith(CONTACT_PREFIX);
    const kept = contact ? tag || newTag() : '';
    const lasts = contact ? timer : 0;
    // Ours their phone said came, or read, before it went from here (through Nostr): shown so, as kept (History.add).
    const early = mine && contact ? (history.current?.markedEarly(peer, kept) ?? null) : null;
    const marked = early ? withMark({ until: 0, lasts, mark }, early.mark, early.at) : { until: 0, lasts, mark };
    const message = { id: nextId.current++, peer, text, mine, tag: kept, ...marked, at, voice, file, ...more };
    setMessages((list) => {
      const later = list.findIndex((m) => m.at > at);
      return later < 0 ? [...list, message] : [...list.slice(0, later), message, ...list.slice(later)];
    });
    if (contact) {
      history.current?.add({ peer, text, mine, at, tag: kept, lasts, mark, voice, file, ...more }).catch(() => {
        // Shown, but gone when the chat next opens.
      });
    }
    return kept;
  }

  // Raises the mark of a chat's messages, ours or theirs: all of them, or those with `tags`. A
  // disappearing one marked read starts its time. Returns, through the history, the tags raised.
  // When none is raised, the list stays the same one, so nothing that follows it runs again.
  function markMessages(peer: string, mine: boolean, mark: Mark, tags: string[] | null = null): Promise<string[]> {
    const now = Date.now();
    const asked = tags ? new Set(tags) : null;
    setMessages((list) => {
      let raised = false;
      const marked = list.map((m) => {
        if (m.peer !== peer || m.mine !== mine || m.mark >= mark || (asked && !asked.has(m.tag)) || (!mine && m.at > now)) return m;
        raised = true;
        return { ...m, mark, ...(mark === 2 && !m.until && m.lasts ? { until: now + m.lasts * 1000, lasts: 0 } : {}) };
      });
      return raised ? marked : list;
    });
    return (history.current ?? openingChats.current?.history)?.mark(peer, mine, mark, now, tags) ?? Promise.resolve([]);
  }

  // Deleted here, what hidden chats still owe the contact's phone of it never goes.
  // Each says when the chat's history has it.
  function forgetChat(peer: string): Promise<void> {
    setMessages((list) => list.filter((message) => message.peer !== peer));
    owed.current.forget(peer.slice(CONTACT_PREFIX.length));
    return history.current?.clear(peer).catch((error) => setNote(errorText(error))) ?? Promise.resolve();
  }

  function forgetMessage(message: Message): Promise<void> {
    setMessages((list) => list.filter((m) => m.id !== message.id && !(message.tag && m.peer === message.peer && m.tag === message.tag)));
    if (!message.tag) return Promise.resolve();
    owed.current.forget(message.peer.slice(CONTACT_PREFIX.length), message.tag);
    return history.current?.remove(message.peer, message.tag).catch((error) => setNote(errorText(error))) ?? Promise.resolve();
  }

  // What is done on this phone only, which the contact is not told of, the account's linked devices
  // do too (lib/devices.ts): in hidden chats, only their own devices, never the space's.
  function toDevices(peer: string, change: Omit<ChatChange, 'c'>) {
    if (!peer.startsWith(CONTACT_PREFIX)) return;
    changedHere({ c: peer.slice(CONTACT_PREFIX.length), ...change }, hiddenKey ? { space: currentSpace().space, pocket } : null);
  }

  function forgetChatHere(peer: string) {
    forgetChat(peer);
    toDevices(peer, { gone: true });
  }

  function forgetHere(message: Message) {
    forgetMessage(message);
    if (message.tag) toDevices(message.peer, { tag: message.tag, gone: true });
  }

  // Asks the contact's phone to delete messages too, and deletes them here once the relay has
  // taken that. If it cannot, nothing is deleted.
  async function eraseOnBoth(peer: string, erase: Erase, here: () => void) {
    const target = relayTarget();
    if (!target) {
      setNote(t('Not deleted. Type the relay address in Relay first.'));
      return;
    }
    try {
      await sendToContact(target, peer.slice(CONTACT_PREFIX.length), '', { erase });
      here();
      setNote(t("Deleted here. {name}'s phone deletes them too when it next looks at the relay.", { name: label(peer, shownContacts) }));
    } catch (error) {
      setNote(t('Not deleted. {reason}', { reason: notSentReason(error) }));
    }
  }

  function deleteMessages(peer: string) {
    const name = label(peer, shownContacts);
    const kept = !!archive && archive.linked(peer.slice(CONTACT_PREFIX.length)).length > 0;
    const question = kept
      ? t('Delete the messages with {name}? They cannot be brought back. Imported messages stay: delete them in Imported chats.', { name })
      : t('Delete the messages with {name}? They cannot be brought back.', { name });
    ask(t('Delete messages'), question, [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('This phone'), onPress: () => forgetChatHere(peer) },
      { text: t('Both phones'), style: 'destructive', onPress: () => void eraseOnBoth(peer, { all: true }, () => forgetChat(peer)) },
    ]);
  }

  function deleteMessage(message: Message) {
    // One a relay holds for later is taken back from it, if it did not go yet (takeBackHeld).
    if (message.held && message.at > Date.now()) {
      ask(t('Delete message'), t('Delete this message before it goes? The relay that keeps it drops it.'), [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Delete'), style: 'destructive', onPress: () => takeBackHeld(message) },
      ]);
      return;
    }
    // One that waits never reached their phone.
    const both = message.peer.startsWith(CONTACT_PREFIX) && message.tag && message.mark !== WAITING;
    ask(t('Delete message'), t('Delete this message? It cannot be brought back.'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('This phone'), onPress: () => forgetHere(message) },
      ...(both
        ? [{ text: t('Both phones'), style: 'destructive' as const, onPress: () => void eraseOnBoth(message.peer, { tag: message.tag }, () => forgetMessage(message)) }]
        : []),
    ]);
  }

  // Takes one a relay holds for later back from it, if it did not go yet, and deletes it then: where
  // it is held as kept, should it have been held anew since the chat showed it, in turn with a
  // safety message being held anew (lib/safety.ts), which then never is again.
  function takeBackHeld(message: Message) {
    const heldNow = () => history.current?.messages().find((m) => m.peer === message.peer && m.tag === message.tag)?.held ?? message.held!;
    void inTurn(message.tag, async () => {
      const dropped = await takeBack(relayTarget(), heldNow());
      if (dropped) stopSafety(message.tag);
      // And its copies for the endpoints of their account, now or with a later look (lib/fanout.ts).
      if (dropped && e2e && message.peer.startsWith(CONTACT_PREFIX)) {
        await e2e.letGoCopies(message.peer.slice(CONTACT_PREFIX.length), message.tag).catch(() => undefined);
        void dropHeld(e2e, relayTarget()).catch(() => undefined);
      }
      return dropped;
    })
      .then((dropped) => {
        if (dropped) {
          forgetHere(message);
          setNote(t('Deleted. It will not go.'));
        } else {
          setNote(t('It went already. Delete it again to delete it on both phones.'));
          setMessages((list) => list.map((m) => (m.id === message.id ? { ...m, at: Math.min(m.at, Date.now()) } : m)));
        }
      })
      .catch((error) => setNote(t('Not deleted: the relay could not be asked. {reason}', { reason: errorText(error) })));
  }

  // Deletes the messages chosen, after one question, each as Delete does it alone: one a relay holds
  // for later is taken back from it, whichever is chosen; on both phones, those that reached theirs.
  function deleteChosen(list: Message[]) {
    if (list.length === 0) return;
    const held = list.filter((m) => m.held && m.at > Date.now());
    const rest = list.filter((m) => !held.includes(m));
    const both = rest.filter((m) => m.peer.startsWith(CONTACT_PREFIX) && m.tag && m.mark !== WAITING);
    const takeBackAll = () => {
      selection.clear();
      for (const m of held) takeBackHeld(m);
    };
    ask(t('Delete messages'), plural(list.length, 'Delete this message? It cannot be brought back.', 'Delete these {n} messages? They cannot be brought back.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('This phone'),
        onPress: () => {
          takeBackAll();
          for (const m of rest) forgetHere(m);
        },
      },
      ...(both.length > 0
        ? [
            {
              text: t('Both phones'),
              style: 'destructive' as const,
              onPress: () => {
                takeBackAll();
                for (const m of rest) if (!both.includes(m)) forgetHere(m);
                // One by one, as one alone goes: an Erevos from before deletes each.
                void both.reduce((before, m) => before.then(() => eraseOnBoth(m.peer, { tag: m.tag }, () => void forgetMessage(m))), Promise.resolve());
              },
            },
          ]
        : []),
    ]);
  }

  // Whether their phone has the message, so it can be answered there or reacted to: theirs, or ours
  // that went. A call's line is this phone's own.
  const theyHave = (m: Message) => m.peer.startsWith(CONTACT_PREFIX) && !!m.tag && !isCallLine(m.text) && (!m.mine || (m.mark !== WAITING && !scheduled(m)));

  // Whether a message of ours can take new words: words of our own (lib/chat-parts.ts), that went
  // within the last day (EDIT_FOR), or still wait to go. Not one sent for later, which went sealed
  // as it was, to wait at a relay or here.
  const canEdit = (m: Message) =>
    m.mine && m.peer.startsWith(CONTACT_PREFIX) && !!m.tag && !isCallLine(m.text) && editableWords(m) && !m.held && !scheduled(m) && (m.mark === WAITING || stillEditable(m.at, Date.now()));

  // Puts a message of ours in the bar, to give it new words (sendEdit).
  function startEditing(message: Message) {
    setReplying(null);
    setVanishing(false);
    setEditing(message);
    draft.set(message.text);
  }

  function stopEditing() {
    setEditing(null);
    draft.set('');
  }

  // Gives a message of ours the words typed, on both phones: once it went, as an edit their Erevos
  // shows as edited, which goes as a reaction does, once their phone or the relay was handed it, or
  // not at all; while it still waits to go (lib/waiting.ts), as it is, as it goes with them.
  async function sendEdit(message: Message) {
    const text = draft.text().trim();
    if (!text) {
      setNote(t('Type the new words, or delete the message instead.'));
      return;
    }
    if (text === message.text) {
      stopEditing();
      return;
    }
    const waits = history.current?.messages().find((m) => m.peer === message.peer && m.tag === message.tag)?.mark === WAITING;
    if (!waits) {
      // Send pressed again while the edit is on its way does nothing.
      if (editGoing.current) return;
      editGoing.current = true;
      try {
        await sendToContact(relayTarget(), message.peer.slice(CONTACT_PREFIX.length), '', { more: { edit: { tag: message.tag, text } } });
      } catch (error) {
        setNote(t('Not edited. {reason}', { reason: notSentReason(error) }));
        return;
      } finally {
        editGoing.current = false;
      }
    }
    const at = Date.now();
    setMessages((list) =>
      list.map((m) => (m.peer === message.peer && m.tag === message.tag ? { ...m, text, preview: previewAfterEdit(m.preview, text), ...(waits ? {} : { edited: at }) } : m)),
    );
    history.current?.edit(message.peer, message.tag, true, text, at).catch(() => {
      // Shown, but as it was when the chat next opens.
    });
    stopEditing();
    setNote(waits ? t('Edited. It goes with the new words.') : t('Edited on both phones.'));
  }

  // Reacts to a message with an emoji, or takes the reaction back (the same one again), on both
  // phones. It shows once their phone, or the relay, was handed it; if neither can be, nothing changes.
  async function react(message: Message, emoji: string) {
    const next = message.myReaction === emoji ? '' : emoji;
    try {
      await sendToContact(relayTarget(), message.peer.slice(CONTACT_PREFIX.length), '', { react: { tag: message.tag, emoji: next } });
    } catch (error) {
      setNote(notSent(error));
      return;
    }
    setMessages((list) => list.map((m) => (m.peer === message.peer && m.tag === message.tag ? { ...m, myReaction: next || undefined } : m)));
    history.current?.react(message.peer, message.tag, true, next).catch(() => {
      // Shown, but gone when the chat next opens.
    });
  }

  // Pins a message to the top of the chat on both phones, or takes it down, as a reaction goes.
  async function pin(message: Message) {
    const on = !message.pinned;
    try {
      await sendToContact(relayTarget(), message.peer.slice(CONTACT_PREFIX.length), '', { more: { pin: { tag: message.tag, on } } });
    } catch (error) {
      setNote(notSent(error));
      return;
    }
    pinHere(message.peer, message.tag, on);
    if (on) setPinShown(0);
  }

  function pinHere(peer: string, tag: string, on: boolean) {
    const at = on ? Date.now() : 0;
    setMessages((list) => list.map((m) => (m.peer === peer && m.tag === tag ? { ...m, pinned: at || undefined } : m)));
    history.current?.pin(peer, tag, at).catch(() => {
      // Shown, but gone when the chat next opens.
    });
  }

  // Theirs to see once, seen: this phone lets go of its photo, and the message says it was seen.
  function seenOnce(message: Message) {
    const now = Date.now();
    setMessages((list) =>
      list.map((m) => {
        if (m.peer !== message.peer || m.tag !== message.tag) return m;
        const { file: _seen, ...rest } = m;
        return { ...rest, seenOnce: now };
      }),
    );
    history.current?.seeOnce(message.peer, message.tag, now).catch((error) => setNote(errorText(error)));
  }

  // Stars a message, or takes the star off, on this phone only.
  function star(message: Message) {
    const on = !message.starred;
    setMessages((list) => list.map((m) => (m.peer === message.peer && m.tag === message.tag ? { ...m, starred: on || undefined } : m)));
    history.current?.star(message.peer, message.tag, on).catch(() => {
      // Shown, but gone when the chat next opens.
    });
    toDevices(message.peer, { tag: message.tag, starred: on });
  }

  // Goes to one of the chat's messages, by its tag, or to one of the SMS among them, by its id,
  // and lights it a moment.
  function goTo(peer: string, tag: string) {
    if (tag.startsWith(IMPORTED_TAG)) {
      goToImported(Number(tag.slice(IMPORTED_TAG.length)));
      return;
    }
    const target = isSmsLine(tag) ? tag : visible.find((m) => m.peer === peer && m.tag === tag)?.id;
    // Earlier than the lines drawn: drawn with them first, then gone to.
    const index = target === undefined ? -1 : lines.findIndex((line) => (line.kind === 'sms' ? smsLineId(line.sms) === target : line.message.id === target));
    if (index >= 0 && (index < firstLine || index >= lastLine)) {
      holdScroll.current = true;
      setStretch(null);
      setThreadShown(lines.length - index + THREAD_PAGE / 2);
      if (typeof target === 'number') goal.current = tag;
      else setTimeout(() => rowDo.current?.goTo(peer, tag), 600);
      return;
    }
    const y = target === undefined ? undefined : typeof target === 'string' ? smsPlaced.current.get(target) : placed.current.get(target);
    if (target === undefined || y === undefined) {
      setNote(t('That message is not on this phone.'));
      return;
    }
    thread.current?.scrollTo({ y: Math.max(0, y - 96), animated: true });
    setLit(target);
  }

  // Goes to one of what was imported, by its place in it: drawn first with some around it, if it is
  // not, and gone to once it is laid out.
  function goToImported(index: number) {
    if (!(index >= 0 && index < imported.length)) return;
    if (firstLine > 0 || index < firstImported || index >= importedEnd) {
      holdScroll.current = true;
      atEnd.current = false;
      importedGoal.current = index;
      setStretch({ from: Math.max(0, index - THREAD_PAGE / 2), to: Math.min(total, index + THREAD_PAGE / 2) });
      return;
    }
    const y = importedPlaced.current.get(index);
    if (y === undefined) {
      setNote(t('That message is not on this phone.'));
      return;
    }
    thread.current?.scrollTo({ y: Math.max(0, y - 96), animated: true });
    setLit(importedTag(index));
  }

  async function copy(text: string) {
    setNote((await copyText(text)) ? t('Copied. Any app that reads the clipboard can read it now.') : t('Not copied.'));
  }

  // What can be done with a message, in its menu (held down).
  function menuActions(message: Message): MenuAction[] {
    const actions: MenuAction[] = [];
    if (theyHave(message) || (message.mine && message.mark === WAITING)) actions.push({ title: t('Reply'), onPress: () => setReplying(message) });
    if (!threadRoot && message.peer.startsWith(CONTACT_PREFIX) && message.tag && !message.sending && !isCallLine(message.text)) actions.push({ title: t('Reply in thread'), onPress: () => openThread(threadRoots_.get(message.tag) ?? message.tag) });
    if (forwardable(message)) actions.push({ title: t('Forward'), onPress: () => startForward([message]) });
    if (message.peer.startsWith(CONTACT_PREFIX) && message.tag) actions.push({ title: message.starred ? t('Unstar') : t('Star'), onPress: () => star(message) });
    if (theyHave(message)) actions.push({ title: message.pinned ? t('Unpin') : t('Pin'), onPress: () => void pin(message) });
    if (CAN_COPY && message.text && !message.sticker && !message.place && !message.poll && !isCallLine(message.text)) actions.push({ title: t('Copy'), onPress: () => void copy(shownLine(message.text)) });
    if (canTranslate() && message.text && !message.sticker && !message.place && !message.poll && !isCallLine(message.text) && languageOf(shownLine(message.text))) {
      const said = shownLine(message.text);
      actions.push({ title: t('Translate'), onPress: () => setTranslating(said) });
    }
    if (message.voice && canWriteOut()) {
      const voice = message.voice;
      actions.push({ title: t('In words'), onPress: () => setHearing(() => () => loadClip(voice)) });
    }
    if (canEdit(message)) actions.push({ title: t('Edit'), onPress: () => startEditing(message) });
    if (message.mine && pollOpen(message) && theyHave(message)) actions.push({ title: t('End poll'), onPress: () => void endPoll(message) });
    if (message.file?.sticker && !message.file.from) actions.push({ title: t('Add to my stickers'), onPress: () => void addToStickers(message.file!) });
    // A photo or file that is here goes into this chat's own Collection too: the space's, or these hidden chats'.
    if (message.file && !message.file.sticker && !message.file.history && !message.file.once && !message.file.from && CAN_COLLECT && modules.has('collection')) actions.push({ title: t('Save to the Collection'), onPress: () => void saveToCollection(message.file!) });
    if (!message.sending) actions.push(selectAction(() => selection.start(message.id)));
    actions.push({ title: t('Delete'), danger: true, onPress: () => deleteMessage(message) });
    return actions;
  }

  // Copies the words of the messages chosen, one after the other: of several, each with when and whose.
  function copyChosen(list: Message[]) {
    const lines = list.map((m) => ({
      at: m.at,
      who: m.mine ? t('You') : label(m.peer, shownContacts),
      text: m.text && !m.sticker && !m.place && !m.poll && !isCallLine(m.text) ? shownLine(m.text) : messageLine(m),
    }));
    selection.clear();
    void copy(joinedText(lines));
  }

  // Copies a photo or file of the chat, as the same bytes, into the Collection of this chat's place.
  async function saveToCollection(file: FileRef) {
    try {
      await importFromChat(stickerPlace, file);
      setNote(t('Saved to the Collection.'));
    } catch (error) {
      setNote(t('Not added. {error}', { error: errorText(error) }));
    }
  }

  // What can be done with an imported message, held down: it is only to read, so it is copied, or
  // its files opened, to look at or save.
  function importedActions(message: LinkedMessage): MenuAction[] {
    const actions: MenuAction[] = [];
    if (CAN_COPY && message.text) actions.push({ title: t('Copy'), onPress: () => void copy(message.text) });
    for (const file of message.files) actions.push({ title: message.files.length > 1 ? `${t('Open')} · ${file.name}` : t('Open'), onPress: () => setViewingImported(file) });
    return actions;
  }

  // What can be done with one of the SMS among the messages, held down, as on the SMS screen: it is
  // the phone's, so it goes on only as a copy, and is deleted from the phone with Undo.
  function smsActions(m: SmsMessage): MenuAction[] {
    const actions: MenuAction[] = [];
    if (CAN_COPY && m.text) actions.push({ title: t('Copy'), onPress: () => void copy(m.text) });
    actions.push({ title: t('Forward'), onPress: () => setSmsForwarding(m) });
    if (smsFailed(m)) actions.push({ title: t('Send again'), onPress: () => sendSmsLineAgain(m) });
    actions.push({
      title: t('Delete'),
      danger: true,
      onPress: () => {
        const why = deleteSms(m, chatSms.number, chatSms.dropped);
        if (why) setNote(why);
      },
    });
    return actions;
  }

  // One of ours that did not go, or did not reach their phone, goes again, on the SIM it was for.
  function sendSmsLineAgain(m: SmsMessage) {
    sendSmsAgain(m, chatSms.number, -1, { sent: chatSms.reload, note: setNote });
  }

  // Sends what is typed as a plain SMS to their number, once the owner says so: not encrypted, so
  // the phone company can read it. It shows among the messages as an SMS, as the phone keeps it.
  // With two SIMs it says which it goes on. An SMS cannot disappear, nor answer a message: with the
  // stopwatch on, or a message being answered, it says so first, and once it went both are off, as
  // after any message sent.
  async function sendAsSms() {
    const text = draft.text().trim();
    const to = chatSms.number;
    if (!text || !to) return;
    const said = [
      chatSms.simName
        ? t('It goes to {number} on {sim} as a plain SMS, not encrypted: the phone company can read it.', { number: to, sim: chatSms.simName })
        : t('It goes to {number} as a plain SMS, not encrypted: the phone company can read it.', { number: to }),
    ];
    if (vanishing) said.push(t('An SMS cannot disappear: it stays on both phones.'));
    if (replying && replying.peer === selected) said.push(t('It goes without the message it answers.'));
    if (!(await choose(t('Send as SMS?'), said.join(' '), t('Cancel'), t('Send')))) return;
    try {
      await maySendSms();
      await sendSms(to, text, chatSms.sim);
      draft.set((typed) => (typed.trim() === text ? '' : typed));
      setVanishing(false);
      setReplying(null);
      chatSms.reload();
    } catch (error) {
      setNote(t('Not sent. {error}', { error: errorText(error) }));
    }
  }

  // A message send() shows as Sending…, with what it needs to go: `at`, when Send was pressed.
  type Going = { to: string; text: string; lasts: number; quiet: boolean; content?: Content & { text: string }; answer: Parts; answered: Message | null; shown: () => void; at: number };
  // A voice message recorded while the chats were still opening, as sendVoice was given it.
  type Recorded = { audio: Uint8Array; ms: number; talk: boolean; to: string; forwarded: boolean; lasts: number; answer: Parts; at: number };

  // What was sent while the chats were still opening (e2e not there yet): it goes, in turn, once
  // they are, through the functions of the render that has them (sending). Should the screen close
  // first, it waits in the chats' history instead, and goes by itself (lib/waiting.ts keepUnsent).
  const opening = useRef<({ going: Going } | { recorded: Recorded })[]>([]);
  const sending = useRef({ sendShown, sendVoice });
  sending.current = { sendShown, sendVoice };
  useEffect(() => {
    if (!e2e || opening.current.length === 0) return;
    const waiting = opening.current.splice(0);
    void (async () => {
      for (const queued of waiting) {
        const now = sending.current;
        if ('going' in queued) await now.sendShown(queued.going).catch(() => undefined);
        else {
          const { audio, ms, talk, to, forwarded, lasts } = queued.recorded;
          await now.sendVoice(audio, ms, talk, to, forwarded, lasts).catch(() => undefined);
        }
      }
    })();
  }, [e2e]);
  // Closed before the chats opened, it keeps what it had not sent yet (a walkie-talkie message is
  // for now only), in the history its chats read from, whose look at the relay goes on after it.
  useEffect(
    () => () => {
      const left = opening.current.splice(0);
      const kept = history.current ?? openingChats.current?.history;
      if (left.length === 0 || !kept) return;
      const timer = (peer: string) => openingChats.current?.e2e.contacts().find((c) => `${CONTACT_PREFIX}${c.identity}` === peer)?.timer ?? 0;
      const unsent = left.flatMap((queued): Unsent[] => {
        if ('going' in queued) {
          const { to, text, lasts, quiet, content, answer, at } = queued.going;
          return [{ peer: to, at, lasts: lasts || timer(to), parts: { ...answer, ...(content ? contentOf(content) : {}) }, text, quiet }];
        }
        const { audio, ms, talk, to, lasts, answer, at } = queued.recorded;
        return talk ? [] : [{ peer: to, at, lasts: lasts || timer(to), parts: answer, audio, ms }];
      });
      // The home screen shows it waiting.
      void keepUnsent(kept, unsent).then((count) => {
        if (count > 0 && !hiddenKey) announceReceived();
      });
    },
    [],
  );

  // What says that something cannot be done while the chats have not opened: they are still opening,
  // unless this build cannot encrypt at all.
  function notOpen(): string {
    return hasCore() ? t('Your chats are still opening. Try again in a moment.') : t(NO_CORE);
  }

  // Shows ours the moment Send is pressed, marked Sending…, on screen only and with no tag, so
  // nothing acts on it. Returns what takes it away, once what went or waits shows instead.
  function showSending(peer: string, text: string, parts: Parts): () => void {
    const id = nextId.current++;
    const at = Date.now();
    const message: Message = { id, peer, text, mine: true, tag: '', until: 0, lasts: 0, mark: 0, at, sending: true, ...parts };
    setMessages((list) => {
      const later = list.findIndex((m) => m.at > at);
      return later < 0 ? [...list, message] : [...list.slice(0, later), message, ...list.slice(later)];
    });
    return () => setMessages((list) => list.filter((m) => m.id !== id));
  }

  // Keeps what is typed, and tells a contact who shows online that this phone is typing to them,
  // every few seconds at most. Never from a chat that appears offline, nor to a message request.
  function typed(text: string) {
    if (!text.trim() || !selected?.startsWith(CONTACT_PREFIX) || !selectedOnline || !selectedAccepted || !appActive) return;
    const said = typingSaid.current.get(selected) ?? 0;
    if (Date.now() - said < TYPING_EVERY) return;
    typingSaid.current.set(selected, Date.now());
    sendToContact(relayTarget(), selected.slice(CONTACT_PREFIX.length), '', { more: { typing: true } }).catch(() => {
      // Said again with what is typed next.
    });
  }

  // A message that can go to another chat as a copy: one that stays (one that disappears is not
  // copied on), and is here whole. A call's line is the chat's own.
  const forwardable = (message: Message) =>
    message.peer.startsWith(CONTACT_PREFIX) && !!message.tag && !message.lasts && !message.until && !isCallLine(message.text) && canForward(message);

  // Asks where messages go (one, or those chosen): to a contact of this place, or to one of its groups.
  function startForward(list: Message[]) {
    setForwarding(list);
    setForwardGroups([]);
    (placeGroups ? placeGroups.groups() : spaceGroups()).then(
      (groups) => setForwardGroups(groups.list().filter((group) => group.status === 'in')),
      () => setForwardGroups([]),
    );
  }

  // Forwards a message to a contact's chat, and shows that chat: its words, sticker, place or a new
  // poll go anew, and a voice message's sound or a photo's or file's bytes are sent again. One from
  // a group comes as `Forwardable`, its voice message a file that lasts `ms`.
  async function forwardTo(message: Forwardable, peer: string) {
    setForwarding(null);
    setSelected(peer);
    if (message.voice || (message.file && message.ms)) {
      const copy = await voiceCopy(message);
      if (!copy) setNote(t('This voice message\'s sound is gone.'));
      else await sendVoice(copy.audio, copy.ms, false, peer, true);
      return;
    }
    const file = message.file;
    if (file) {
      await sendAttachment(file.kind, async () => ({ name: file.name, mime: file.mime, source: refSource(file), w: file.w, h: file.h, sticker: file.sticker }), peer, true);
      return;
    }
    // A payment request goes on as its words only: it is asked of the one it was sent to.
    const { pay: _request, ...content } = contentOf(message);
    await send(0, false, { ...content, forwarded: true, text: message.text }, peer);
  }

  // Forwards messages to a contact's chat, one after the other, in the order they were sent.
  async function forwardAllTo(list: Message[], peer: string) {
    selection.clear();
    for (const message of [...list].sort((a, b) => a.at - b.at)) await forwardTo(message, peer);
  }

  // A group's messages handed over to forward here (lib/forward.ts), or a photo or file shared from
  // another app (lib/share-in.ts), once the chat can send.
  useEffect(() => {
    if (!e2e || !initial) return;
    // Each one after the other, in the order handed over.
    let handedOn = Promise.resolve();
    for (let message = takeForward(initial); message; message = takeForward(initial)) {
      const one = message;
      handedOn = handedOn.then(() => forwardTo(one, initial));
    }
    const pay = takePay(initial);
    if (pay) void sendPay(pay, initial);
    let sending = Promise.resolve();
    for (let shared = takeShared(initial); shared; shared = takeShared(initial)) {
      const one = shared;
      sending = sending.then(() => sendAttachment(isSharedPhoto(one) ? 'photo' : 'file', () => readShared(one), initial));
    }
  }, [e2e]);

  // Files of these hidden chats' Collection handed over for a contact's chat (lib/hidden-send.ts), sent one after the other once the chat shows;
  // and a radio station's or TV channel's name and link (app/collection-send.tsx), sent as a message's text.
  useEffect(() => {
    if (!hiddenKey || !e2e || !selected?.startsWith(CONTACT_PREFIX)) return;
    const peer = selected;
    let sending = Promise.resolve();
    const said = forwardedTo(peer)?.text;
    if (said) sending = sending.then(() => send(undefined, false, { text: said }, peer));
    for (let shared = takeShared(peer); shared; shared = takeShared(peer)) {
      const one = shared;
      sending = sending.then(() => sendAttachment(isSharedPhoto(one) ? 'photo' : 'file', () => readShared(one), peer));
    }
  }, [e2e, selected, arrival]);

  // Forwards messages to a group, one after the other, then shows the group once they went.
  async function forwardToGroupChat(list: Message[], id: string) {
    setForwarding(null);
    selection.clear();
    setNote(t('Forwarding…'));
    try {
      for (const message of [...list].sort((a, b) => a.at - b.at)) await forwardToGroup(id, message, placeGroups ?? undefined);
    } catch (error) {
      setNote(notSent(error));
      return;
    }
    setNote('');
    setAttaching(false);
    if (placeGroups) setShownGroup(id);
    else router.push(`/group?id=${id}`);
  }

  // Sends a poll, with its question and options as its words for an Erevos from before.
  function sendPoll(poll: Poll) {
    setPolling(false);
    void send(undefined, false, { text: pollWords(poll), poll });
  }

  // Chooses an option of a poll, or takes the choice back, on both phones, as a reaction goes.
  async function vote(message: Message, option: number) {
    if (!pollOpen(message)) return;
    const chose = chooseOption(message.myVote ?? [], option, !!message.poll!.m);
    try {
      await sendToContact(relayTarget(), message.peer.slice(CONTACT_PREFIX.length), '', { more: { vote: { tag: message.tag, chose } } });
    } catch (error) {
      setNote(notSent(error));
      return;
    }
    setMessages((list) => list.map((m) => (m.peer === message.peer && m.tag === message.tag ? { ...m, myVote: chose } : m)));
    history.current?.vote(message.peer, message.tag, true, chose).catch(() => {
      // Shown, but gone when the chat next opens.
    });
  }

  // Ends a poll of ours, on both phones: it takes no more votes. An Erevos from before shows it still open.
  async function endPoll(message: Message) {
    if (!message.mine || !pollOpen(message)) return;
    try {
      await sendToContact(relayTarget(), message.peer.slice(CONTACT_PREFIX.length), '', { more: { close: { tag: message.tag } } });
    } catch (error) {
      setNote(notSent(error));
      return;
    }
    const at = Date.now();
    setMessages((list) => list.map((m) => (m.peer === message.peer && m.tag === message.tag ? { ...m, closed: at } : m)));
    history.current?.close(message.peer, message.tag, true, at).catch(() => {
      // Shown, but open again when the chat next opens.
    });
  }

  // Sends a contact's card, with its name, numbers and emails as its words for an Erevos from before.
  function sendCard(card: string) {
    setSharingCard(false);
    void send(undefined, false, { text: cardWords(card), card });
  }

  // Marks their payment request paid, on both phones, once it is said: it cannot be taken back.
  async function markPaid(message: Message) {
    if (!message.pay || message.mine || message.paid) return;
    const pay = message.pay;
    const sure = await choose(t('Mark it paid?'), t('{name} is told that you paid {amount}. It cannot be taken back.', { name: label(message.peer, e2e?.contacts() ?? []), amount: payAmount(pay, locale()) }), t('Cancel'), t('Paid'));
    if (!sure) return;
    try {
      await sendToContact(relayTarget(), message.peer.slice(CONTACT_PREFIX.length), '', { more: { settled: { tag: message.tag } } });
    } catch (error) {
      setNote(notSent(error));
      return;
    }
    const at = Date.now();
    setMessages((list) => list.map((m) => (m.peer === message.peer && m.tag === message.tag ? { ...m, paid: at } : m)));
    history.current?.paid(message.peer, message.tag, true, at).catch(() => {
      // Shown, but gone when the chat next opens; their phone knows.
    });
  }

  // Our request paid: Fasouli marks its transaction collected, after it asks there.
  function toFasouli(message: Message) {
    const link = message.pay ? fasouliPaidLink(message.pay) : null;
    if (link) Linking.openURL(link).catch(() => setNote(t('Fasouli is not installed on this phone.')));
  }

  // Sends a payment request another app asked for (lib/pay.ts), once the owner says yes here.
  async function sendPay(pay: Pay, peer: string) {
    const amount = payAmount(pay, locale());
    const sure = await choose(t('Send this payment request?'), t('{name} is asked to pay {amount}{what}. Erevos moves no money: the request only says it.', { name: label(peer, e2e?.contacts() ?? []), amount, what: pay.w ? ` · ${pay.w}` : '' }), t('Cancel'), t('Send'));
    if (!sure) return;
    await send(0, false, { text: t('Payment request: {amount}{what}', { amount, what: pay.w ? ` · ${pay.w}` : '' }), pay }, peer);
  }

  // Sends the place found, with where it is as its words for an Erevos from before.
  function sendPlace(place: Place) {
    setPlacing(false);
    void send(undefined, false, { text: placeWords(place), place });
  }

  // Sends a sticker: its name, with its emoji as its words for an Erevos from before.
  function sendSticker(name: string) {
    setStickering(false);
    const sticker = stickerOf(name);
    if (sticker) void send(undefined, false, { text: sticker.emoji, sticker: name });
  }

  // Whose stickers made from photos these are: the space's, or these hidden chats' only.
  const stickerPlace = useMemo<StickerPlace>(() => {
    const { space, key } = currentSpace();
    return { holder: hiddenKey ? hiddenHolder(pocket) : 'space', space, key: hiddenKey ?? key };
  }, [hiddenKey, pocket]);

  // A contact's chat opened from one of these hidden chats' groups, with a message forwarded to it.
  const openFromGroup = useRef((_identity: string) => undefined as void);
  openFromGroup.current = (identity) => {
    const peer = `${CONTACT_PREFIX}${identity}`;
    setShownGroup(null);
    setSelected(peer);
    // Each one after the other, in the order handed over.
    let sending = Promise.resolve();
    for (let message = takeForward(peer); message; message = takeForward(peer)) {
      const one = message;
      sending = sending.then(() => forwardTo(one, peer));
    }
  };
  // Where the group screens find these hidden chats' groups (components/groups-at.tsx): shown here.
  const placeWhere = useMemo<GroupsWhere | null>(
    () =>
      placeGroups && hiddenKey
        ? {
            at: placeGroups,
            stickers: () => stickerPlace,
            previews: async () => (await loadHiddenData(currentSpace().space, pocket, hiddenKey)).previews,
            previewsTor: async () => (await loadHiddenData(currentSpace().space, pocket, hiddenKey)).previewsTor === true,
            openGroup: setShownGroup,
            openContact: (identity) => openFromGroup.current(identity),
            linked: () => placeLinksNow(currentSpace().space, pocket)?.role() === 'linked',
          }
        : null,
    [placeGroups, hiddenKey, pocket, stickerPlace],
  );

  // Sends a sticker made from a photo: as a photo goes, marked as a sticker (lib/own-stickers.ts).
  function sendOwnSticker(sticker: OwnSticker) {
    setStickering(false);
    void sendAttachment('photo', async () => {
      const picture = await openOwnSticker(sticker);
      if (!picture) throw new Error(t('This sticker\'s picture is gone.'));
      const { name, mime, w, h } = stickerMeta(picture);
      return { name, mime, source: bytesSource(picture), w, h, sticker: true };
    });
  }

  // Keeps a sticker that came as one of this place's own.
  async function addToStickers(file: FileRef) {
    try {
      await keepAsSticker(stickerPlace, file);
      setNote(t('Added to your stickers.'));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // The preview of the first link in words typed, when this phone makes them, here (the space's
  // chats, or a hidden place, each with its own switch): only through Tor with their own Tor
  // switch on, else straight and never while the space sends everything through Tor
  // (lib/link-preview.ts previewWay). None if it takes too long.
  async function previewOf(text: string): Promise<Carried> {
    const way = CAN_PREVIEW ? previewWay(previews, previewsTor, throughTor()) : 'none';
    const link = way !== 'none' ? firstLink(text) : null;
    if (!link) return {};
    previewing.current = true;
    setNote(t('Making the link’s preview…'));
    try {
      const made = await makePreview(link, way === 'tor');
      const preview = made && fitPreview(text, made);
      return preview ? { preview } : {};
    } finally {
      previewing.current = false;
      setNote('');
    }
  }

  // What the next message in `peer`'s chat answers, if it answers one: in a thread shown alone,
  // the one answered, or else the thread's first message.
  function answering(peer: string): Parts {
    if (replying && replying.peer === peer && replying.tag) return { re: replying.tag };
    return threadRoot && peer === selected ? { re: threadRoot } : {};
  }

  // Shows a thread of the chat alone, from its first message.
  function openThread(root: string) {
    selection.clear();
    setReplying(null);
    setThreadRoot(root);
  }

  // Seals a message for a contact and hands it to their phone (handOver). Returns the message's
  // tag, how long it lasts, and how it went. `waits`: should it fail, it is tried again as it is.
  async function sendToContact(target: Relay | null, identity: string, text: string, extra: Extra = {}, waits = false): Promise<{ tag: string; timer: number; way: Delivery }> {
    if (!e2e) throw new Error(notOpen());
    // A hidden place that rings says its ring queue (lock/hidden-ring.ts); '' tells contacts it no
    // longer rings. The space's own chats never ring, so they say nothing of one.
    const rf = hiddenKey ? (ringing && ringQueue ? ringQueue.senderHex : '') : undefined;
    const sealed = await e2e.seal(identity, text, ownQueue?.senderHex ?? '', { ...extra, at: here(), rf });
    // What is only a mark, or asks whether their phone is open, is not worth carrying for days.
    const way = await handOver(e2e, target, identity, sealed, [sealed.packet], markOf(text, extra.call), !!text || !!extra.erase, waits);
    // A call to a hidden contact that rings: wake it too, so it rings while its hidden chats are closed.
    if (target && extra.call) void ringOffer(e2e, target, identity, extra.call, sealed.packet.length).catch(() => undefined);
    // Writing, reacting or pinning in a message request accepts it.
    if (text || extra.react || acts(extra.more ?? {})) setContacts(e2e.contacts());
    return { tag: sealed.tag, timer: sealed.timer, way };
  }

  // Hands a contact's packets to their phone, after the first packet of the conversation if the
  // relay has not taken that yet: nearby when they are, and through the relay (lib/nearby.ts),
  // the last packet saying what they carry (`mark`, lib/relay.ts), or, sealed on a linked device for
  // the account's phone, where all goes, quiet (sentMark). When neither, and they went to the phones
  // nearby, those phones may carry them to the contact's relay too (`carried`). Hidden chats go
  // through the relay, or Nostr with no relay between the two, and to the phones nearby with what
  // they heard themselves (nearHeard), never carried (lib/waiting.ts handOverHidden).
  // Once they went, the copies for the
  // endpoints of the contact's account go too (lib/e2e.ts copiesAfter), and, with `waits`, also once
  // the relay could take them only later, as what is tried again as it is goes to those endpoints
  // once: in hidden chats it then throws OwedError, owed to the contact's phone.
  function handOver(
    chats: E2E,
    target: Relay | null,
    identity: string,
    sealed: { sender: string; relay: string; relayKey: string; spare?: Spare | null; first: Uint8Array | null; copies: number; through: boolean } & ForNostr,
    packets: Uint8Array[],
    mark: RelayMark,
    carried = false,
    waits = false,
  ): Promise<Delivery> {
    if (hiddenKey) return handOverHidden(chats, target, identity, { sealed: { ...sealed, spare: sealed.spare ?? null }, packets }, mark, waits, nearHeard.current);
    // Words go through Nostr when they read there (lib/nostr-chats.ts), the relay their backup; with
    // no relay between the two, all goes there, when they read there.
    const relay =
      target && sealed.sender
        ? orNostr(chats, target, identity, sealed, packets, () => sendSealed(target, sealed, packets, sentMark(sealed, mark), () => chats.firstSent(identity)))
        : nostrOnlyWay(chats, identity, sealed, packets);
    const all = sealed.first ? [sealed.first, ...packets] : packets;
    const carry = carried ? () => carriedFor(sealed, all, { url: relayUrl, key: ownRelayKey }, sentMark(sealed, mark)) : null;
    // What is worth carrying is worth LoRa's air time too, when it is small (lib/lora.ts), and,
    // when nothing else took it, an SMS, where the owner turned that on (lib/sms-way.ts).
    return chats.copiesAfter(sealed.copies, nearby.deliver(identity, all, relay, carry, carried), waits);
  }

  // A call's line in the chat, kept with its messages. It needs no read mark, and it disappears
  // with the chat's timer from now.
  // A call's line, kept already, shown in the thread.
  function showCallLine({ peer, text, mine, at, tag, until = 0 }: Kept) {
    setMessages((list) => [...list, { id: nextId.current++, peer, text, mine, tag, until, lasts: 0, mark: 2, at }]);
  }

  latest.current = {
    me: () => e2e?.endpoint()?.id ?? '',
    ipKeep: () => ipKeep().keep,
    send: async (identity, extra) => {
      const target = relayTarget();
      if (!target) throw new Error(t('No relay.'));
      await sendToContact(target, identity, '', extra);
    },
    line: (message) => {
      const timer = e2e?.contacts().find((c) => `${CONTACT_PREFIX}${c.identity}` === message.peer)?.timer ?? 0;
      const kept = { ...message, until: timer ? message.at + timer * 1000 : 0 };
      showCallLine(kept);
      history.current?.add(kept).catch(() => {
        // Shown, but gone when the chat next opens.
      });
    },
    name: (peer) => label(peer, e2e?.contacts() ?? []),
    relay: () => ownCallRelay(),
  };

  // The call relay beside our relay, null if it has none.
  function ownCallRelay(): Promise<CallRelay | null> {
    return callRelay({ url: relayUrl.trim(), token: relayToken.trim() || undefined });
  }

  // Without a call relay, asks before a call that shows each phone's address to the other.
  function callDirectly(): Promise<boolean> {
    return new Promise((resolve) =>
      ask(
        t('Call without a call relay?'),
        t("Your relay has no call relay beside it, so the call would go straight between the phones. That only works on the same Wi-Fi, and each phone sees the other's address on it. With a call relay, neither does."),
        [
          { text: t('Cancel'), style: 'cancel', onPress: () => resolve(false) },
          { text: t('Call'), onPress: () => resolve(true) },
        ],
      ),
    );
  }

  async function startCall(video: boolean) {
    if (!selectedContact) {
      setNote(video ? t('Video calls go to contacts through the relay. Pick one first.') : t('Calls go to contacts through the relay. Pick one first.'));
      return;
    }
    const peer = selectedContact;
    const identity = peer.slice(CONTACT_PREFIX.length);
    if (contacts.find((c) => c.identity === identity)?.request) {
      setNote(t('Accept the message request first. Then you can call.'));
      return;
    }
    if (currentCall() || currentGroupCall()) {
      setNote(t('There is a call already.'));
      return;
    }
    // On the same Wi-Fi or a hotspot, with no internet, a call is set up over the link nearby and
    // goes straight between the two: to the contact's link when heard on one, else to every link.
    const near = nearby.isNear(identity) || nearby.count() > 0;
    if (!e2e || ((!ownQueue || !relayUrl.trim()) && !near)) {
      setNote(e2e ? t('Calls are set up through the relay, or with a contact on the same Wi-Fi. Type the relay address in Relay first.') : notOpen());
      return;
    }
    // Calls never go through Tor: that the call relay sees this phone's internet address is said
    // once for the chat, before (lib/ip-warning.ts). Nearby, the call stays on the same network.
    if (!near && !(await ipGate(callIpWarning(identity, ipKeep().keep)))) return;
    if (!(await callPermissions(video))) {
      setNote(video ? t('A video call needs the camera and the microphone.') : t('A call needs the microphone.'));
      return;
    }
    let relay: CallRelay | null = null;
    if (ownQueue && relayUrl.trim()) {
      try {
        relay = near ? await soon(ownCallRelay(), 4000, null) : await ownCallRelay();
      } catch (error) {
        if (!near) {
          setNote(t('Could not call. {error}', { error: errorText(error) }));
          return;
        }
      }
    }
    if (!relay && !(await callDirectly())) return;
    try {
      beginCall(callPlace, peer, video, relay, rtc);
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // What a message keeps of the way it went (lock/history.ts Parts).
  function wayParts(way: Delivery): Pick<Parts, 'nostr' | 'route'> {
    return way === 'nostr' ? { nostr: true } : { route: way };
  }

  // Where a message's menu says it went or came, when this phone knows.
  function wayLine(m: Message): string | undefined {
    if (m.nostr) return m.mine ? t('Went through Nostr.') : t('Came through Nostr.');
    if (m.route === 'relay') return m.mine ? t('Went through the relay.') : t('Came through the relay.');
    if (m.route === 'nearby') return m.mine ? t('Went to their phone nearby.') : t('Came from a phone nearby.');
    if (m.route === 'lora') return t('Went over LoRa.');
    if (m.route === 'sms') return m.mine ? t('Went by SMS, end-to-end encrypted.') : t('Came by SMS, end-to-end encrypted.');
    if (m.route === 'carried') return t('Went to the phones nearby, which carry it to their relay.');
    if (m.route === 'spread') return t('Went to the phones nearby, in case theirs is one of them.');
    return undefined;
  }

  // What the note under the messages says once something went (`what`: Sent, Voice message sent…).
  function sentNote(way: Delivery, what: string, name: string): string {
    if (way === 'nearby') return t('{what} nearby, end-to-end encrypted.', { what });
    if (way === 'relay') return t('{what} through the relay, end-to-end encrypted.', { what });
    if (way === 'nostr') return t('{what} through Nostr, end-to-end encrypted.', { what });
    if (way === 'sms') {
      return t("{what} by SMS, end-to-end encrypted, as nothing else could take it. The phone company sees that you wrote to {name}'s number, and when, as with any SMS.", { what, name });
    }
    if (way === 'lora') {
      return t("{what} over LoRa, end-to-end encrypted, as the relay could not be reached. It comes if {name}'s Erevos has a radio on the same mesh, within reach.", { what, name });
    }
    if (way === 'carried') {
      return t(
        "{what} to the Erevos phones nearby, end-to-end encrypted, as the relay could not be reached. If {name}'s is not one of them, they hand it to {name}'s relay once they reach the internet, and so does this phone.",
        { what, name },
      );
    }
    return t("{what} to the Erevos phones nearby, end-to-end encrypted, as the relay could not be reached. It comes only if {name}'s is one of them.", { what, name });
  }

  // Why something could not go, without the words that say so.
  function notSentReason(error: unknown): string {
    return isQueueNotFound(error)
      ? t("The relay does not have this contact's queue any more. Ask them to write to you, or for their new contact link.")
      : errorText(error);
  }

  function notSent(error: unknown): string {
    return t('Not sent. {reason}', { reason: notSentReason(error) });
  }

  // In hidden chats: what went to the contact's linked devices, if they have any, but not yet to
  // their phone, which is owed it while hidden chats stay open.
  function owedNote(peer: string, error: OwedError): string {
    return t("Sent to {name}'s linked devices, if they have any, end-to-end encrypted, not yet to their phone ({reason}). While hidden chats stay open, it is tried again for their phone.", {
      name: label(peer, contacts),
      reason: notSentReason(error.reason),
    });
  }

  // Sends the message typed. With `lasts` (seconds), only this one disappears, that long after it
  // is read: unless given, as the stopwatch in the bar says. `quiet`, it comes without sound, also
  // when it has to wait. Given `content`, it sends
  // that instead, a sticker, a place or a poll with its words (its emoji, where it is, or what it
  // asks), or words forwarded, and what is typed stays; with `to`, to that chat, not the one shown.
  // When only LoRa or SMS can take it, and it is too much for them with its link's preview, the
  // words go without the preview rather than wait.
  async function send(lasts = vanishing ? vanishFor : 0, quiet = false, content?: Content & { text: string }, to = selected) {
    if (!content && editing && editing.peer === to) {
      await sendEdit(editing);
      return;
    }
    const text = content ? content.text : draft.text().trim();
    if (!text || !to?.startsWith(CONTACT_PREFIX) || previewing.current) return;
    if (!(await ipBeforeSend(to))) return;
    setVanishing(false);
    if (!e2e && !hasCore()) {
      setNote(t(NO_CORE));
      return;
    }
    // A copy answers nothing.
    const answer = content?.forwarded ? {} : answering(to);
    // Shown at once, with the field emptied, so a second press has nothing to send again. Not sent,
    // the words go back in the field.
    const shown = showSending(to, text, answer);
    const answered = replying;
    if (!content) {
      draft.set('');
      setReplying(null);
    }
    const going: Going = { to, text, lasts, quiet, content, answer, answered, shown, at: Date.now() };
    // The chats still opening (a look at the relay under way ends first), it goes once they are.
    if (!e2e) opening.current.push({ going });
    else await sendShown(going);
  }

  // Sends what send() shows as Sending…, once the chats are open.
  async function sendShown({ to, text, lasts, quiet, content, answer, answered, shown }: Going) {
    // A preview that cannot be made is left out.
    const carried = content ? contentOf(content) : await previewOf(text).catch((): Carried => ({}));
    const parts = { ...answer, ...carried };
    const identity = to.slice(CONTACT_PREFIX.length);
    // Kept with the message should it wait, or be owed to their phone, so what of it went meanwhile is the same message.
    const sealedAs = newTag();
    const extra = { lasts, quiet, ...answer, more: carried, tag: sealedAs };
    try {
      let bare = false;
      const { tag, timer, way } = await sendToContact(relayTarget(), identity, text, extra, true).catch((error: unknown) => {
        if (!(error instanceof TooLargeForSlowWayError) || !carried.preview) throw error;
        // Sealed anew without it, for LoRa or SMS only: the relay just failed.
        bare = true;
        return sendToContact(null, identity, text, { ...extra, more: withoutPreview(carried) }, true);
      });
      shown();
      addMessage(to, text, true, tag, timer, undefined, undefined, 0, Date.now(), { ...(bare ? { ...answer, ...withoutPreview(carried) } : parts), ...wayParts(way) });
      const sent = sentNote(way, quiet ? t('Sent without sound') : t('Sent'), label(to, contacts));
      const said = timer ? t('{sent} It disappears from both phones {time} after it is read.', { sent, time: timerLabel(timer) }) : sent;
      const without = way === 'sms' ? t('It went without the link’s preview, which is too much for SMS.') : t('It went without the link’s preview, which is too much for LoRa.');
      setNote(bare ? `${said} ${without}` : said);
    } catch (error) {
      shown();
      if (error instanceof OwedError && e2e) {
        const chats = e2e;
        addMessage(to, text, true, sealedAs, lasts || timerOf(to), undefined, undefined, 0, Date.now(), parts);
        owed.current.add(identity, sealedAs, async () => {
          const sealed = await chats.seal(identity, text, ownQueue?.senderHex ?? '', { ...extra, at: here() });
          return { sealed, packets: [sealed.packet] };
        });
        setNote(owedNote(to, error));
        return;
      }
      if (!canWait(error)) {
        if (!content && !draft.text().trim()) {
          draft.set(text);
          if (answered) setReplying(answered);
        }
        setNote(notSent(error));
        return;
      }
      // Nothing could take it now: it waits, and goes by itself (lib/waiting.ts).
      addMessage(to, text, true, sealedAs, lasts || timerOf(to), undefined, undefined, WAITING, Date.now(), { quiet, ...parts });
      const reason = waitingReason(error, to, t('It is too long for LoRa.'));
      setNote(
        hiddenKey
          ? withClosedNote(t('Waiting. {reason} It goes by itself once the relay can take it.', { reason }))
          : t('Waiting. {reason} It goes by itself once the relay or their phone nearby can take it.', { reason }),
      );
    }
  }

  // Keeps the message typed to go at `at`, or, with nothing typed, the next photo, file or voice
  // message (laterFor).
  async function sendLater(at: number) {
    const text = draft.text().trim();
    setChoosingLater(false);
    setAttaching(false);
    if (!selected?.startsWith(CONTACT_PREFIX) || !canPick(at)) return;
    if (!text) {
      setLaterFor(at);
      setNote(t('Now pick a photo or file under +, or hold the microphone: it goes on {when}.', { when: laterLabel(at) }));
      return;
    }
    const lasts = takeVanish();
    if (await schedule(selected, at, { text, lasts })) draft.set('');
  }

  // Keeps a message to go at `at`: sealed and handed to the relay at once, to hold till then
  // (lib/waiting.ts, holdLater), so it goes though this phone is off by then. While no relay can
  // take it, it waits here, and goes to the relay with the first look that reaches one (in hidden
  // chats, theirs). Says whether it is kept.
  async function schedule(peer: string, at: number, what: { text?: string; voice?: VoiceRef; file?: FileRef; lasts?: number }, safety = 0): Promise<boolean> {
    if (!e2e) {
      setNote(notOpen());
      return false;
    }
    // How long it lasts once read: the stopwatch's time for it (`lasts`), or else the chat's.
    const { text = '', voice, file, lasts: once = 0 } = what;
    const tag = newTag();
    const lasts = once || timerOf(peer);
    const when = laterLabel(at);
    const parts = answering(peer);
    const heldNote = safety
      ? t('Safety message kept. It goes on {when}, unless you open Erevos before then: each time you do, it moves on to {time} from then. Delete it here to stop it.', { when, time: timerLabel(safety * 3600) })
      : t('Scheduled for {when}. The relay sends it then, even if this phone is off. Until then you can delete it here.', { when });
    addMessage(peer, text, true, tag, lasts, voice, file, WAITING, at, safety ? { ...parts, safety } : parts);
    setReplying(null);
    const went = await sendWaitingNow.current(true);
    setNote(
      went.some((w) => w.peer === peer && w.tag === tag && w.held)
        ? heldNote
        : safety
          ? t('Safety message kept here. It is not safe yet: it goes to the relay once one can be reached. Until then it cannot go without this phone.')
          : t('Scheduled for {when}. It goes to the relay once one can be reached, and from there at that time, even if this phone is off then. Until then you can delete it here.', { when }),
    );
    return true;
  }

  // Keeps the words typed as a safety message (lib/safety.ts): they go `hours` from now, unless
  // Erevos is opened before, which puts them off as many hours again.
  async function sendSafety(hours: number) {
    const text = draft.text().trim();
    setChoosingSafety(false);
    setAttaching(false);
    if (!selected?.startsWith(CONTACT_PREFIX)) return;
    if (!text) {
      setNote(t('Type the safety message first, then choose when it goes.'));
      return;
    }
    if (await schedule(selected, safetyDue(hours), { text }, hours)) draft.set('');
  }

  // The time picked for the next photo, file or voice message, taken once: null when none was, or
  // when it has gone by meanwhile (then said).
  function takeLaterFor(): number | null {
    const at = laterFor;
    if (at === null) return null;
    setLaterFor(null);
    if (canPick(at)) return at;
    setNote(t('That time has gone by. Choose one ahead.'));
    return null;
  }

  // The chat's timer, seconds.
  function timerOf(peer: string): number {
    return e2e?.contacts().find((c) => `${CONTACT_PREFIX}${c.identity}` === peer)?.timer ?? 0;
  }

  // Why a message could not go now: `lora`, what LoRa says of it, when LoRa was the only way.
  function waitingReason(error: unknown, peer: string, lora: string): string {
    // Hidden chats go through the relay, or Nostr, which says why it could not take it, and to
    // their phone when it is near.
    if (hiddenKey && HAS_LINKS && (relayTarget() || !(error instanceof RelayUnreachableError))) {
      const name = label(peer, contacts);
      return relayTarget() ? t("The relay cannot be reached, and {name}'s phone is not near.", { name }) : t("There is no relay, and {name}'s phone is not near.", { name });
    }
    if (hiddenKey) return relayTarget() ? t('The relay cannot be reached.') : error instanceof RelayUnreachableError ? error.message : t('There is no relay.');
    if (error instanceof TooLargeForSmsError) return `${t('It is too long for SMS.')} ${relayTarget() ? t('The relay cannot be reached.') : t('There is no relay.')}`;
    if (error instanceof TooLargeForSlowWayError) return `${lora} ${relayTarget() ? t('The relay cannot be reached.') : t('There is no relay.')}`;
    const name = label(peer, contacts);
    return relayTarget()
      ? t("The relay cannot be reached, and {name}'s phone is not near.", { name })
      : t("There is no relay, and {name}'s phone is not near.", { name });
  }

  // What hidden chats that do not receive while closed add to a note that something waits: only
  // while they are open does it go.
  function withClosedNote(note: string): string {
    return receiving ? note : `${note} ${t('Closed, these hidden chats send nothing: it goes while they are open, unless you turn on Receive while closed at the top.')}`;
  }

  // Asks whether a voice message, photo or file that nothing could take now waits to go by itself.
  function askToWait(what: 'voice' | 'photo' | 'file', reason: string): Promise<boolean> {
    return choose(
      t('Not sent yet'),
      what === 'voice'
        ? t('{reason} The voice message can wait here, marked Waiting, and go by itself once the relay or their phone nearby can take it.', { reason })
        : what === 'photo'
          ? t('{reason} The photo can wait here, marked Waiting, and go by itself once the relay or their phone nearby can take it.', { reason })
          : t('{reason} The file can wait here, marked Waiting, and go by itself once the relay or their phone nearby can take it.', { reason }),
      t('Delete it'),
      t('Keep it waiting'),
    );
  }

  // Where what waits goes from (lib/waiting.ts). `relayUp`: the relay just answered.
  function waitingPlace(relayUp: boolean): SendPlace {
    return { sends: relayTarget(), own: ownRelay(), senderHex: ownQueue?.senderHex ?? '', here: here(), ownKey: ownRelayKey, relayUp, ...(hiddenKey ? { hidden: true, near: nearHeard.current } : {}) };
  }

  // Sends what waits that can go now (lib/waiting.ts), and shows it as gone, or as held by the
  // relay till its time. Says what went. In hidden chats, through the relay, or to their phone near, and what they owe
  // a contact's phone is tried again first (Owed), shown as sent already. In both, what a relay
  // holds for later for a contact whose queue moved is held anew, and what it holds for one deleted
  // or blocked is dropped.
  const sendWaitingNow = useRef((_relayUp: boolean) => Promise.resolve([] as Went[]));
  sendWaitingNow.current = async (relayUp) => {
    const kept = history.current;
    if (!e2e || !kept) return [];
    // With the relay down, hidden chats' wait, but for what goes through Nostr.
    if (hiddenKey && relayUp) await owed.current.retry(e2e, relayTarget()).catch(() => undefined);
    const went = await sendWaiting({ e2e, history: kept }, waitingPlace(relayUp)).catch(() => [] as Went[]);
    if (went.length > 0) {
      setMessages((list) =>
        list.map((m) => {
          const sent = went.find((w) => w.peer === m.peer && w.tag === m.tag);
          if (!sent) return m;
          const gone: Message = { ...m, mark: 0, lasts: sent.lasts, held: sent.held, heldFor: sent.heldFor, quiet: false, ...(sent.at ? { at: sent.at } : {}) };
          if (sent.bare) delete gone.preview;
          return gone;
        }),
      );
    }
    return went;
  };

  // Your contact link, shared: in short, as the contact card, where there is one, a link any app
  // shows as one to tap (lib/sms-relay.ts contactCard); else the whole of it.
  async function shareMine(link: string) {
    const short = cardsHere ? await contactCard(linkE2E?.invitedAs() ?? '').catch(() => null) : null;
    await shareLink(short ?? link);
  }

  async function shareLink(link: string) {
    try {
      // A computer has no share sheet: the link is copied, to paste where it should go.
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(link);
        setNote(t('Contact link copied.'));
        return;
      }
      await Share.share({ message: link });
    } catch (error) {
      setNote(errorText(error));
    }
  }

  async function toggleSafety(peer: string) {
    if (safety?.peer === peer || !e2e) {
      setSafety(null);
      return;
    }
    try {
      const identity = peer.slice(CONTACT_PREFIX.length);
      setSafety({
        peer,
        number: await e2e.safetyNumber(identity),
        devices: e2e.devicesChanged(identity),
        code: e2e.verifyCode(identity),
        verified: e2e.verifiedAt(identity),
        note: '',
      });
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Their phone's check code, photographed or chosen from the photos (lib/verify-code.ts): marks
  // them checked here when it matches. Their phone marks this one by the code this one shows.
  async function verifyFromQr(peer: string, from: 'camera' | 'photos') {
    if (!e2e) return;
    const identity = peer.slice(CONTACT_PREFIX.length);
    const say = (note: string, verified = e2e.verifiedAt(identity)) =>
      setSafety((now) => (now?.peer === peer ? { ...now, note, verified } : now));
    try {
      const text = await readQrPhoto(from);
      if (text === null) return;
      if (!text) {
        say(t('No QR code was found in the photo. Take it again closer, with all of the code in it.'));
        return;
      }
      const result = await e2e.checkVerify(identity, text);
      say(
        result === 'match'
          ? t('It matches: no one is in between. Now let them take a photo of the code on this phone, so their phone checks you too.')
          : result === 'own'
            ? t('That is the code this phone shows. Take a photo of the code on their phone.')
            : result === 'other'
              ? t('It does not match. Someone may be in between, or it is the code of another chat. Compare the safety numbers, and ask them.')
              : result === 'newer'
                ? t('That code is from a newer Erevos. Update Erevos, then take the photo again.')
                : t('That QR code is not a code to check a contact by.'),
      );
    } catch (error) {
      say(error instanceof NoCameraError ? error.message : errorText(error));
    }
  }

  // Introduces the open chat's contact to another one (lib/intros.ts): asks each of the two, in
  // their own chat, with words they see; nothing more happens unless both say yes.
  async function startIntro(peer: string, other: string) {
    if (!e2e) return;
    setIntroNote('');
    const target = relayTarget();
    try {
      const sends = await introduce(e2e, peer.slice(CONTACT_PREFIX.length), other);
      for (const m of sends) {
        const { tag, timer, way } = await sendToContact(target, m.to, m.text, { more: m.more });
        addMessage(`${CONTACT_PREFIX}${m.to}`, m.text, true, tag, timer, undefined, undefined, 0, Date.now(), wayParts(way));
      }
      setIntroducing(null);
      setIntroTick((n) => n + 1);
      setIntroNote(t('Asked both. If both say yes, they become contacts.'));
    } catch (error) {
      setIntroNote(notSent(error));
    }
  }

  // Answers an introduction this chat's contact asked of this phone.
  async function answer(peer: string, i: string, yes: boolean) {
    if (!e2e) return;
    try {
      const m = await answerIntro(e2e, peer.slice(CONTACT_PREFIX.length), i, yes, ownLink ?? '');
      await sendToContact(relayTarget(), m.to, '', { more: m.more }, true);
      setIntroTick((n) => n + 1);
      setNote(yes ? t('Said yes. If the other says yes too, you become contacts.') : t('Said no. The other one is not told.'));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  async function unverify(peer: string) {
    if (!e2e) return;
    const identity = peer.slice(CONTACT_PREFIX.length);
    try {
      await e2e.unverify(identity);
      setSafety((now) => (now?.peer === peer ? { ...now, verified: 0, note: '' } : now));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  function startRenaming(peer: string) {
    if (renaming === peer) {
      setRenaming(null);
      return;
    }
    // The name this phone gives them; the one they go by shows as the field's hint.
    const identity = peer.slice(CONTACT_PREFIX.length);
    setNameDraft(contacts.find((c) => c.identity === identity)?.ownName ?? '');
    setRenaming(peer);
  }

  async function acceptRequest(peer: string) {
    if (!e2e) return;
    try {
      const identity = peer.slice(CONTACT_PREFIX.length);
      await e2e.acceptRequest(identity);
      setContacts(e2e.contacts());
      // An invite to their relay that came with the request: taken now (lib/relay-offer.ts).
      if (!hiddenKey) {
        const offer = keptOffer((await loadCurrentSpaceData()).offered);
        if (offer?.from === identity) await takeOffer(offer, identity);
      }
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Deleting a contact forgets them and their chat here, and gives this chat a new relay queue, which
  // the other contacts are told quietly (lib/queue-move.ts), so they can no longer write to it.
  // Blocking also drops what they send later, a request too. Their phone is not told. Said with it:
  // the groups they share with this phone, where they can still write.
  function deleteContact(peer: string, block: boolean) {
    const name = label(peer, shownContacts);
    ask(
      block ? t('Block contact') : t('Delete contact'),
      block
        ? t('Block {name}? As with deleting, and what they send later is dropped, a request too. You can unblock them under Blocked contacts.', { name })
        : t('Delete {name}? Your chat with them goes from this phone. Erevos gives you a new relay queue and tells your other contacts quietly, so {name} can no longer write to you. With your contact link they can still ask to talk again.', { name }),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: block ? t('Block') : t('Delete'), style: 'destructive', onPress: () => void deleted(peer, name, block) },
      ],
    );
  }

  async function deleted(peer: string, name: string, block: boolean) {
    if (!e2e) return;
    const identity = peer.slice(CONTACT_PREFIX.length);
    const shared = await sharedGroups(identity).catch(() => 0);
    const request = e2e.contacts().some((c) => c.identity === identity && c.request);
    // What a relay holds for later to them goes no more: kept with their removal, and dropped now
    // or with a later look.
    const kept = history.current;
    const held = kept ? heldFor(kept, identity) : [];
    try {
      await e2e.deleteContact(identity, { block, held });
    } catch (error) {
      setNote(errorText(error));
      return;
    }
    // And what a look under way held anew for them meanwhile, before their chat is cleared.
    const more = kept ? await heldAfter({ e2e, history: kept }, identity, held).catch(() => []) : [];
    if (held.length + more.length > 0) void dropHeld(e2e, relayTarget());
    forgetChat(peer);
    setContacts(e2e.contacts());
    setBlocked(e2e.blocked());
    setDetails(false);
    setSelected(null);
    // A message request knows only the queue the contact link names: nothing moves for it, but for
    // one blocked while that is the own queue, before the first move (lib/e2e.ts deleteContact). On
    // a linked computer the phone moves.
    const moves = e2e.moveDue() > 0 || (!request && !!linkHere());
    let said = !moves
      ? block
        ? t('Blocked.')
        : ''
      : block
        ? t('{name} is blocked. Your other contacts learn your new queue as soon as the relay answers.', { name })
        : t('{name} is deleted. Your other contacts learn your new queue as soon as the relay answers.', { name });
    const url = relayUrl.trim();
    // Their own queue goes at once (lib/queue-move.ts dropGone).
    if (url && mover.current) void mover.current.dropGone({ url, token: relayToken.trim() || undefined }).catch(() => undefined);
    if (moves && url && ownQueue && mover.current) {
      try {
        // The link and its QR code name the queue the link names from now on, never the new own one.
        const moved = await mover.current.moveNow({ url, token: relayToken.trim() || undefined });
        if (moved) {
          setLinkQueue(moved.link);
          setOwnQueue(moved.queue);
        }
      } catch {
        said = t('The relay could not be reached, so your queue changes as soon as it can. Until then {name} can still write to it, but nothing they send shows.', { name });
      }
    }
    if (shared > 0) {
      said += `${said ? ' ' : ''}${plural(
        shared,
        '{name} is still in one of your groups, and can write to you there. Leave it, or ask its admin to take them out.',
        '{name} is still in {n} of your groups, and can write to you there. Leave them, or ask their admins to take {name} out.',
        { name, n: shared },
      )}`;
    }
    if (said) setNote(said);
  }

  // The groups of the space, or of these hidden chats, the contact `identity` is in with this phone, by who each member is.
  async function sharedGroups(identity: string): Promise<number> {
    if (!canGroup()) return 0;
    const groups = await (placeGroups ? placeGroups.groups() : spaceGroups());
    let shared = 0;
    for (const group of groups.list()) {
      if (group.status !== 'in') continue;
      if ((await groups.members(group.id).catch(() => [])).some((m) => !m.me && m.about?.id === identity)) shared++;
    }
    return shared;
  }

  async function unblock(identity: string) {
    if (!e2e) return;
    await e2e.unblock(identity).catch((error) => setNote(errorText(error)));
    setBlocked(e2e.blocked());
  }

  // A new contact link: the links and QR codes given before work for the relay's 14 days, then no more.
  function newContactLink() {
    const url = relayUrl.trim();
    if (!url || !ownQueue || !mover.current) {
      setNote(t('Create your relay queue first, on New chat.'));
      return;
    }
    const date = new Date(Date.now() + 14 * 24 * 3600_000).toLocaleDateString(locale());
    ask(t('New contact link'), t('Make a new contact link? The links and QR codes you gave before work until {date}, then no more. Your contacts are not affected.', { date }), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('New contact link'),
        onPress: async () => {
          try {
            const made = await mover.current!.newLink({ url, token: relayToken.trim() || undefined });
            if (made.queue) setOwnQueue(made.queue);
            setLinkQueue((await mover.current!.queues()).link?.queue ?? null);
            setNote(t('You have a new contact link. The links and QR codes you gave before work until {date}.', { date: new Date(made.until).toLocaleDateString(locale()) }));
          } catch (error) {
            setNote(errorText(error));
          }
        },
      },
    ]);
  }

  // Refusing forgets them and their messages here. Their phone is not told.
  function refuseRequest(peer: string) {
    ask(t('Refuse request'), t('Refuse {name}? Their messages go, and anything they send later is not shown.', { name: label(peer, contacts) }), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Refuse'),
        style: 'destructive',
        onPress: async () => {
          if (!e2e) return;
          try {
            await e2e.removeContact(peer.slice(CONTACT_PREFIX.length));
            forgetChat(peer);
            setContacts(e2e.contacts());
            setSelected(null);
          } catch (error) {
            setNote(errorText(error));
          }
        },
      },
    ]);
  }

  async function rename(peer: string) {
    if (!e2e) return;
    try {
      await e2e.rename(peer.slice(CONTACT_PREFIX.length), nameDraft);
      setContacts(e2e.contacts());
      setRenaming(null);
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Starts recording while the microphone is held. Letting go sends it; a minute sends it anyway.
  function startTalking() {
    if (!selectedContact) {
      setNote(t('Voice messages go to contacts through the relay. Pick one first.'));
      return;
    }
    holding.current = true;
    letGo.current = false;
    const talk = talkies.has(selectedContact);
    recordingTalk.current = talk;
    const started = (talk ? talkRecorder : recorder).start().then((ok) => {
      if (!ok) {
        setNote(t('Erevos may not use the microphone. Allow it in the phone settings to send voice messages.'));
        return false;
      }
      if (!holding.current) {
        // Let go while the microphone was getting ready: too short to be meant.
        void (talk ? talkRecorder : recorder).stop().catch(() => undefined);
        if (!letGo.current) setNote(t('Hold to record, and let go to send.'));
        return false;
      }
      setTalking(true);
      longest.current = setTimeout(() => void stopTalking(), MAX_VOICE_MS);
      return true;
    });
    recording.current = started.catch((error) => {
      setNote(t('Cannot record. {error}', { error: errorText(error) }));
      return false;
    });
  }

  // Stops recording and sends it, or, `cancel`led (slid away), lets it go. Under a second is
  // taken for a slip, and is let go too.
  async function stopTalking(cancel = false) {
    holding.current = false;
    letGo.current = cancel;
    if (longest.current) clearTimeout(longest.current);
    longest.current = null;
    const started = recording.current;
    recording.current = null;
    if (!started || !(await started)) return;
    setTalking(false);
    try {
      const talk = recordingTalk.current;
      // The voice changed as the chat says (lib/voice-change.ts); never the walkie-talkie's.
      const change = !talk && e2e && selectedContact?.startsWith(CONTACT_PREFIX) ? e2e.voiceOf(selectedContact.slice(CONTACT_PREFIX.length)) : undefined;
      const recorded = await (talk ? talkRecorder.stop() : recorder.stop(change));
      if (cancel) {
        setNote(t('Recording cancelled.'));
        return;
      }
      if (!recorded || recorded.ms < MIN_VOICE_MS) {
        setNote(t('Hold to record, and let go to send.'));
        return;
      }
      await sendVoice(recorded.audio, recorded.ms, talk, selectedContact, false, takeVanish());
    } catch (error) {
      setNote(t('Not sent. {reason}', { reason: errorText(error) }));
    }
  }

  // How long the next message lasts once read, as the stopwatch says, taken once: it is off again.
  function takeVanish(): number {
    if (!vanishing) return 0;
    setVanishing(false);
    return vanishFor;
  }

  // Walkie-talkie for a chat, on or off: what Voice records then plays on their phone as it comes,
  // when the chat with this phone is open there.
  function toggleTalkie(peer: string) {
    const next = new Set(talkies);
    if (next.has(peer)) next.delete(peer);
    else next.add(peer);
    setTalkies(next);
    setNote(next.has(peer) ? t('Walkie-talkie: hold to talk. It plays on their phone as it comes, if this chat is open there.') : '');
  }

  // Seals a voice message for the contact picked, or for `to` when it is `forwarded` there, hands
  // its parts to their phone in turn (nearby, or through the relay), and keeps its sound sealed. If
  // nothing took all of it, it is not kept.
  async function sendVoice(audio: Uint8Array, ms: number, talk: boolean, to = selectedContact, forwarded = false, lasts = 0) {
    const peer = to;
    if (!peer) return;
    if (!(await ipBeforeSend(peer))) return;
    if (!e2e) {
      // Held while the chats open, then sent as it was recorded.
      if (hasCore()) {
        opening.current.push({ recorded: { audio, ms, talk, to: peer, forwarded, lasts, answer: forwarded ? { forwarded } : answering(peer), at: Date.now() } });
        setNote(t('Your chats are still opening. It goes as soon as they are.'));
      } else setNote(t(NO_CORE));
      return;
    }
    // Picked to go later (laterFor): kept, and handed to the relay for then.
    if (!talk && !forwarded && laterFor !== null) {
      const at = takeLaterFor();
      if (at !== null) await schedule(peer, at, { voice: await saveClip(audio, ms), lasts });
      return;
    }
    const identity = peer.slice(CONTACT_PREFIX.length);
    const parts: Parts = forwarded ? { forwarded } : answering(peer);
    const sealedAs = newTag();
    try {
      const sealed = await e2e.sealVoice(identity, audio, ms, ownQueue?.senderHex ?? '', { lasts, at: here(), talk, re: parts.re, forwarded, tag: sealedAs });
      // In hidden chats, owed to their phone should it take it only later; a walkie-talkie message is for now only.
      const way = await handOver(e2e, relayTarget(), identity, sealed, sealed.packets, 'message', true, !!hiddenKey && !talk);
      addMessage(peer, '', true, sealed.tag, sealed.timer, await saveClip(audio, ms), undefined, 0, Date.now(), { ...parts, ...wayParts(way) });
      setReplying(null);
      // Writing to a message request accepts it.
      setContacts(e2e.contacts());
      setNote(sentNote(way, talk ? t('Walkie-talkie message sent') : t('Voice message sent'), label(peer, contacts)));
    } catch (error) {
      if (error instanceof OwedError) {
        const chats = e2e;
        addMessage(peer, '', true, sealedAs, lasts || timerOf(peer), await saveClip(audio, ms), undefined, 0, Date.now(), parts);
        setReplying(null);
        owed.current.add(identity, sealedAs, async () => {
          const sealed = await chats.sealVoice(identity, audio, ms, ownQueue?.senderHex ?? '', { lasts, at: here(), re: parts.re, forwarded, tag: sealedAs });
          return { sealed, packets: sealed.packets };
        });
        setNote(owedNote(peer, error));
        return;
      }
      // A walkie-talkie message is for now only.
      if (!canWait(error) || talk) {
        setNote(notSent(error));
        return;
      }
      if (!(await askToWait('voice', waitingReason(error, peer, t('LoRa takes only text.'))))) {
        setNote(t('Not sent.'));
        return;
      }
      try {
        addMessage(peer, '', true, sealedAs, lasts || timerOf(peer), await saveClip(audio, ms), undefined, WAITING, Date.now(), parts);
        setReplying(null);
        setNote(
          hiddenKey
            ? withClosedNote(t('The voice message waits, and goes by itself once the relay can take it.'))
            : t('The voice message waits, and goes by itself once the relay or their phone nearby can take it.'),
        );
      } catch (failed) {
        setNote(t('Not sent, and it could not wait. {error}', { error: errorText(failed) }));
      }
    }
  }

  // Plays a voice message, or stops it if it is the one playing.
  async function play(message: Message) {
    stopPlaying.current?.();
    if (playingId === message.id || !message.voice) return;
    try {
      const audio = await loadClip(message.voice);
      if (!audio) {
        setNote(t("This voice message's sound is gone."));
        return;
      }
      setPlayingId(message.id);
      setPlayed(0);
      stopPlaying.current = playVoice(
        audio,
        () => {
          stopPlaying.current = null;
          setPlayingId((current) => (current === message.id ? null : current));
        },
        // In whole seconds, as it shows: the chat draws again once a second, not four times.
        (ms) => setPlayed(Math.floor(ms / 1000) * 1000),
      );
    } catch (error) {
      setNote(t('Cannot play it. {error}', { error: errorText(error) }));
    }
  }

  // Plays a sound that was imported, a voice message or a song, where it is in the thread; or stops
  // it if it is the one playing.
  async function playImported(file: FileRef) {
    stopPlaying.current?.();
    if (playingFile === file.id) return;
    try {
      const audio = await readFile(file);
      if (!audio) {
        setNote(t('This file is not on this phone.'));
        return;
      }
      setPlayingFile(file.id);
      setPlayed(0);
      stopPlaying.current = playVoice(
        audio,
        () => {
          stopPlaying.current = null;
          setPlayingFile((current) => (current === file.id ? null : current));
        },
        (ms) => setPlayed(Math.floor(ms / 1000) * 1000),
        soundEnding(file),
      );
    } catch (error) {
      setNote(t('Cannot play it. {error}', { error: errorText(error) }));
    }
  }

  // Our relay, straight: files go to it and come through it, never through the second relay.
  function ownRelay(): Relay | null {
    const url = relayUrl.trim();
    return url ? { url, token: relayToken.trim() || undefined } : null;
  }

  const takingNow = useRef(new Set<string>());

  // Takes a photo or file that came, from the relay it is on through ours, and keeps it here; by
  // itself (`itself`), never straight from where its sender chose (lib/attachments.ts takesItself).
  async function take(given: Relay | null, peer: string, tag: string, ref: FileRef, itself = false) {
    const own = given ? torOwn(given, peer) : given;
    const key = `${peer}|${tag}`;
    if (takingNow.current.has(key) || !ref.from) return;
    // A file on a server the contact chose, fetched without Tor, shows it this phone's internet
    // address: said once for the chat, before (lib/ip-warning.ts). Taken by itself, it never goes straight.
    const exposed = !itself && !!ref.from.url && !isTorChat(peer) && !nostrOwnTor() && !netThroughTor();
    if (exposed && !(await ipGate({ network: 'Erevos', act: 'file', of: peer.startsWith(CONTACT_PREFIX) ? circuitOf(peer.slice(CONTACT_PREFIX.length)) : peer.slice(0, 64), ...ipKeep() }))) return;
    takingNow.current.add(key);
    tried.current.add(key);
    setTaking((now) => ({ ...now, [key]: '0%' }));
    try {
      // What hidden chats take stays on the relay only while their own devices still take it (lib/devices.ts),
      // which the space's never hear of; with none, it goes from the relay at once.
      // A photo that came in pieces through Nostr is taken from those this place keeps (lib/nostr-pieces.ts).
      const taken = await takeFile(own, ref, (done, count) => setTaking((now) => ({ ...now, [key]: `${Math.floor((done / count) * 100)}%` })), hiddenKey ? (placeLinked() ?? false) : undefined, contactsPlace, itself, isTorChat(peer));
      setMessages((list) => list.map((m) => (m.peer === peer && m.tag === tag ? { ...m, file: taken } : m)));
      // Deleted while it came: its chunks go too.
      if (history.current && !(await history.current.setFile(peer, tag, taken))) await deleteChunks(taken.id, taken.count);
      setTaking(({ [key]: _done, ...rest }) => rest);
    } catch (error) {
      if (error instanceof PiecesMissingError) {
        // Its pieces are still coming through Nostr: taken as the last one comes.
        tried.current.delete(key);
        setTaking((now) => ({ ...now, [key]: `${Math.floor((error.have / error.count) * 100)}%` }));
        return;
      }
      setTaking((now) => ({ ...now, [key]: error instanceof FileGoneError ? 'gone' : 'failed' }));
      // Tapped for: felt as well as said.
      if (!itself) buzzFailed();
      setNote(ref.kind === 'photo' ? t('A photo did not come. {error}', { error: errorText(error) }) : t('A file did not come. {error}', { error: errorText(error) }));
    } finally {
      takingNow.current.delete(key);
    }
  }

  // Photos and files up to AUTO_TAKE still on the relay are taken as soon as they come, or when the
  // chat opens: theirs, and on a linked device the copies of what the phone sent (lib/devices.ts).
  // Pieces of photos come through Nostr in wraps of their own: whenever one came, the photos still
  // missing some are looked at again.
  const [pieceTick, setPieceTick] = useState(0);
  useEffect(() => onPiece(() => setPieceTick((n) => n + 1)), []);

  // A message request's photos and files wait until it is accepted: taken then, as any other.
  const strangers = useMemo(() => new Set(contacts.filter((c) => c.request).map((c) => `${CONTACT_PREFIX}${c.identity}`)), [contacts]);
  useEffect(() => {
    const own = ownRelay();
    if (!loaded) return;
    for (const m of messages) {
      if (!m.file?.from || m.file.history || m.file.size > AUTO_TAKE || tried.current.has(`${m.peer}|${m.tag}`)) continue;
      if (strangers.has(m.peer)) continue;
      // Only a file on a relay needs ours. One from where its sender chose, which would be fetched
      // straight, waits for a tap, as larger ones do, unless Tor takes it now.
      if (!takesItself(own, m.file.from)) continue;
      void take(own, m.peer, m.tag, m.file, true);
    }
  }, [loaded, relayUrl, relayToken, messages, pieceTick, strangers]);

  // Imported chats shared with a contact (lib/chat-share.ts) go and come in rounds (lib/share-rounds.ts):
  // their words at once, their files as the other phone takes them, each look at the relay driving
  // a round, here as beside the other screens (lib/receiver.ts). Through this chat's relay, its
  // contacts told as any quiet word is; what hidden chats take stays on the relay while their own
  // devices still take it, as a message's file does.
  function shareWay(own: Relay | null): ShareWay | null {
    const chats = sharedChats.current;
    if (!chats || !e2e) return null;
    return {
      chats,
      own,
      send: (identity, rounds) => sendToContact(relayTarget(), identity, '', { more: { rounds } }).then(() => undefined),
      stopped: () => sharesClosed.current,
      leave: hiddenKey ? (placeLinked() ?? false) : undefined,
    };
  }
  const shareDrive = useRef((_own: Relay | null) => undefined as void);
  shareDrive.current = (own) => {
    const way = shareWay(own);
    if (way) driveShares(way);
  };
  useEffect(() => {
    sharesClosed.current = false;
    return () => {
      sharesClosed.current = true;
    };
  }, []);

  // Chats a contact shared are kept at once, whatever their size, among this place's imported
  // chats, their files coming after: from a contact taken, not a message request. One kept by
  // nothing yet, as one that came to an Erevos from before, is noted for the next round.
  useEffect(() => {
    const chats = sharedChats.current;
    if (!loaded || !archive || !chats) return;
    const accepted = new Set(contacts.filter((c) => !c.request).map((c) => `${CONTACT_PREFIX}${c.identity}`));
    const noted: Promise<void>[] = [];
    for (const m of messages) {
      if (!m.file?.history || !m.file.from || m.mine || !accepted.has(m.peer) || tried.current.has(`${m.peer}|${m.tag}`)) continue;
      tried.current.add(`${m.peer}|${m.tag}`);
      noted.push(packCame(chats, m.peer.slice(CONTACT_PREFIX.length), m.tag).catch(() => undefined));
    }
    if (noted.length > 0) void Promise.all(noted).then(() => shareDrive.current(ownRelay()));
  }, [loaded, archive, relayUrl, relayToken, messages, contacts]);

  // How far the shares are, on the lines of the messages they went or came in ('Sharing, 40%',
  // 'Files: 3 of 10'), read again a moment after they change; and what changed shown: chats kept,
  // files whole, shares ended.
  const [shareShown, setShareShown] = useState<Record<string, string>>({});
  const [filesTick, setFilesTick] = useState(0);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const place = sharedChats.current?.pieces;
    if (!loaded || !place) return;
    let on = true;
    // A file came whole since: the photos not shown yet are read again.
    let whole = false;
    const read = () => {
      shareTimer.current = null;
      if (whole) setFilesTick((n) => n + 1);
      whole = false;
      void shareLines(place).then((lines) => {
        if (on) setShareShown((now) => (JSON.stringify(now) === JSON.stringify(lines) ? now : lines));
      });
    };
    read();
    const off = onShares((change) => {
      if (change.holder !== place.holder || change.space !== place.space) return;
      const { peer, tag, file, taking: far } = change;
      if (peer && tag && far) {
        if (far === 'failed') {
          buzzFailed();
          tellSharer(peer.slice(CONTACT_PREFIX.length), tag, true);
        }
        setTaking((now) => ({ ...now, [`${peer}|${tag}`]: far }));
        return;
      }
      if (peer && tag) {
        const key = `${peer}|${tag}`;
        if (file) {
          // Kept: its chats among the imported ones, the file itself no longer on the relay.
          setMessages((list) => list.map((m) => (m.peer === peer && m.tag === tag ? { ...m, file } : m)));
          setTaking(({ [key]: _done, ...rest }) => rest);
        } else setTaking((now) => ({ ...now, [key]: 'gone' }));
      }
      if (change.chats) void archive?.reload().then(() => on && setArchiveTick((n) => n + 1), () => undefined);
      else if (peer && !tag) whole = true;
      if (!shareTimer.current) shareTimer.current = setTimeout(read, 1000);
    });
    return () => {
      on = false;
      off();
      if (shareTimer.current) clearTimeout(shareTimer.current);
      shareTimer.current = null;
    };
  }, [loaded, archive]);

  // Our share still going with a message, by its line: stopped once the owner says so, its chunks
  // taken off the relay, and the contact's Erevos deletes what came of it.
  async function stopSharing(message: Message) {
    const place = sharedChats.current?.pieces;
    const identity = message.peer.slice(CONTACT_PREFIX.length);
    const now = place ? await sharingNow(place, identity, message.tag) : null;
    if (!now) return;
    const name = label(message.peer, contacts);
    if (!(await choose(t('Stop sharing'), t('{name} gets no more of it, and their Erevos deletes what came of it.', { name }), t('Cancel'), t('Stop sharing')))) return;
    const way = shareWay(ownRelay());
    if (way) await stopShare(way, now.s).catch((error) => setNote(errorText(error)));
  }

  // What the account's other devices changed in the history while the chat is open (lib/devices.ts):
  // messages brought over or written on another of them, marks raised there, messages deleted there.
  // Hidden chats hear only their own devices.
  useEffect(() => {
    const where = hiddenKey ? { space: currentSpace().space, pocket } : null;
    return onLinked(({ gone }) => {
      const kept = history.current;
      if (!kept) return;
      const now = kept.messages();
      const byTag = new Map(now.filter((m) => m.tag).map((m) => [`${m.peer}|${m.tag}`, m]));
      setMessages((list) => {
        const left = list.filter((m) => !gone.some((g) => g.peer === m.peer && (!g.tag || g.tag === m.tag)));
        const shown = new Set(left.map((m) => `${m.peer}|${m.tag}`));
        const marked = left.map((m) => {
          const there = m.tag ? byTag.get(`${m.peer}|${m.tag}`) : undefined;
          if (!there) return m;
          // What was done to it on another device, or through one: reactions, a pin, votes, a star, new words, paid.
          const done = {
            myReaction: there.myReaction,
            theirReaction: there.theirReaction,
            pinned: there.pinned,
            starred: there.starred,
            myVote: there.myVote,
            theirVote: there.theirVote,
            paid: there.paid,
            text: there.text,
            edited: there.edited,
            preview: there.preview,
          };
          const changed = (Object.keys(done) as (keyof typeof done)[]).some((key) => JSON.stringify(m[key]) !== JSON.stringify(done[key]));
          const next = changed ? { ...m, ...done } : m;
          if ((there.mark ?? 0) <= next.mark) return next;
          return { ...next, mark: there.mark ?? 0, until: next.until || (there.until ?? 0), lasts: next.until ? next.lasts : (there.lasts ?? 0) };
        });
        const added = now
          .filter((m) => m.peer.startsWith(CONTACT_PREFIX) && m.tag && !shown.has(`${m.peer}|${m.tag}`))
          .map((m) => ({ ...m, until: m.until ?? 0, lasts: m.lasts ?? 0, mark: m.mark ?? 0, id: nextId.current++ }));
        return added.length > 0 ? [...marked, ...added].sort((a, b) => a.at - b.at) : marked;
      });
    }, where);
  }, [hiddenKey, pocket]);

  useEffect(() => {
    loadPhotoQuality().then(setQuality, () => undefined);
  }, []);

  function chooseQuality(next: PhotoQuality) {
    setQuality(next);
    savePhotoQuality(next).catch((error) => setNote(errorText(error)));
  }

  type Picked = { name: string; mime: string; source: Source; w?: number; h?: number; sticker?: true; hidden?: true; once?: true; close?: () => void };

  // Sends a photo or file to the contact picked, or to `to` when it is `forwarded` there: its chunks
  // to our relay, then, end-to-end encrypted, where they are and their key. Kept here as it went.
  // If any of it cannot go, nothing is kept. A sticker made from a photo goes as a photo, marked.
  async function sendAttachment(kind: FileKind, get: () => Promise<Picked | null>, to = selectedContact, forwarded = false) {
    const peer = to;
    const target = relayTarget();
    const own = ownRelay();
    // With no relay between the two, a photo goes in pieces through Nostr and any other file to a
    // file server, when the contact reads on Nostr (lib/nostr-send-files.ts).
    const toNostr = peer && e2e && (!target || !own || !ownQueue?.senderHex || !e2e.queueOf(peer.slice(CONTACT_PREFIX.length))?.sender) ? e2e.nostrPlace(peer.slice(CONTACT_PREFIX.length)) : null;
    if (!peer || ((!target || !own) && !toNostr)) {
      setNote(t('Photos and files go to contacts through the relay. Type its address in Relay, and pick a contact.'));
      return;
    }
    if (!(await ipBeforeSend(peer))) return;
    if (!e2e) {
      setNote(notOpen());
      return;
    }
    let picked: Picked | null;
    try {
      picked = await get();
    } catch (error) {
      setNote(
        error instanceof TooLargeError
          ? t('Not sent. Files can be 100 MB at most.')
          : error instanceof NoCameraError
            ? error.message
            : t('Cannot open it. {error}', { error: errorText(error) }),
      );
      return;
    }
    if (!picked) return;
    const what = kind === 'photo' ? 'photo' : 'file';
    const meta: Omit<FileMeta, 'size'> = {
      name: picked.name,
      mime: picked.mime,
      kind,
      ...(picked.w && picked.h ? { w: picked.w, h: picked.h } : {}),
      ...(picked.sticker ? { sticker: true as const } : picked.hidden ? { hidden: true as const, ...(picked.once ? { once: true as const } : {}) } : {}),
    };
    // Picked to go later (laterFor): kept here, and handed to the relay for then.
    const later = forwarded ? null : takeLaterFor();
    if (!forwarded && laterFor !== null && later === null) {
      picked.close?.();
      return;
    }
    // The stopwatch's time goes with it, now or later, and the stopwatch is off again.
    const lasts = forwarded ? 0 : takeVanish();
    if (later !== null) {
      try {
        if (picked.source.size > MAX_FILE) throw new TooLargeError();
        const ref = await keepFile(picked.source, meta, (done, count) => {
          if (count > 1) {
            const percent = Math.floor((done / count) * 100);
            setNote(what === 'photo' ? t('Keeping the photo, {percent}%', { percent }) : t('Keeping the file, {percent}%', { percent }));
          }
        });
        await schedule(peer, later, { file: ref, lasts });
      } catch (error) {
        setNote(error instanceof TooLargeError ? t('Not sent. Files can be 100 MB at most.') : t('Not scheduled. {reason}', { reason: errorText(error) }));
      } finally {
        picked.close?.();
      }
      return;
    }
    let kept: FileRef | null = null;
    let offer: FileOffer | null = null;
    const parts: Parts = forwarded ? { forwarded } : answering(peer);
    const identity = peer.slice(CONTACT_PREFIX.length);
    const sealedAs = newTag();
    try {
      if (picked.source.size > MAX_FILE) throw new TooLargeError();
      setNote(picked.sticker ? t('Sending the sticker…') : what === 'photo' ? t('Sending the photo…') : t('Sending the file…'));
      const progress = (done: number, count: number) => {
        if (count > 1) {
          const percent = Math.floor((done / count) * 100);
          setNote(what === 'photo' ? t('Sending the photo, {percent}%', { percent }) : t('Sending the file, {percent}%', { percent }));
        }
      };
      let sent: { ref: FileRef; offer: FileOffer };
      if (toNostr) {
        const torChat = isTorChat(peer);
        if (!nostrReady(torChat)) throw new RelayUnreachableError(t('Tor is not ready.'));
        if (!goesInPieces(meta, picked.source.size) && picked.source.size > NOSTR_FILE_LIMIT) throw new NostrFileTooLargeError();
        const ref = await keepFile(picked.source, meta);
        try {
          sent = { ref, offer: await offerOnNostr(refSource(ref), meta, toNostr, progress, torChat) };
        } catch (failed) {
          await deleteChunks(ref.id, ref.count).catch(() => undefined);
          throw failed;
        }
      } else sent = await sendFile(torOwn(own!, to), picked.source, meta, progress);
      kept = sent.ref;
      offer = sent.offer;
      const sealed = await e2e.sealFile(identity, sent.offer, ownQueue?.senderHex ?? '', { lasts, at: here(), re: parts.re, forwarded, tag: sealedAs });
      // In hidden chats, owed to their phone should it take it only later.
      const way = await handOver(e2e, target, identity, sealed, [sealed.packet], 'message', false, !!hiddenKey);
      addMessage(peer, '', true, sealed.tag, sealed.timer, undefined, sent.ref, 0, Date.now(), { ...parts, ...wayParts(way) });
      setReplying(null);
      kept = null;
      // Writing to a message request accepts it.
      setContacts(e2e.contacts());
      setNote(
        picked.sticker
          ? toNostr ? t('Sticker sent through Nostr, end-to-end encrypted.') : t('Sticker sent through the relay, end-to-end encrypted.')
          : kind === 'photo'
            ? toNostr ? t('Photo sent through Nostr, end-to-end encrypted.') : t('Photo sent through the relay, end-to-end encrypted.')
            : toNostr ? t('File sent through Nostr, end-to-end encrypted.') : t('File sent through the relay, end-to-end encrypted.'),
      );
    } catch (error) {
      if (error instanceof OwedError && kept && offer) {
        const [chats, given] = [e2e, offer];
        addMessage(peer, '', true, sealedAs, lasts || timerOf(peer), undefined, kept, 0, Date.now(), parts);
        setReplying(null);
        owed.current.add(identity, sealedAs, async () => {
          const sealed = await chats.sealFile(identity, given, ownQueue?.senderHex ?? '', { lasts, at: here(), re: parts.re, forwarded, tag: sealedAs });
          return { sealed, packets: [sealed.packet] };
        });
        setNote(owedNote(peer, error));
        return;
      }
      if (kept) await deleteChunks(kept.id, kept.count).catch(() => undefined);
      if (!canWait(error)) {
        setNote(error instanceof TooLargeError ? t('Not sent. Files can be 100 MB at most.') : notSent(error));
        return;
      }
      // It waits, kept here only, and goes to the relay later (lib/waiting.ts).
      const reason = toNostr
        ? t('Photos and files go through Nostr, which cannot be reached.')
        : nearby.hasSlow() && !hiddenKey
          ? t('Photos and files go through the relay, which cannot be reached, and LoRa takes only text.')
          : t('Photos and files go through the relay, which cannot be reached.');
      if (!(await askToWait(what, reason))) {
        setNote(t('Not sent.'));
        return;
      }
      try {
        const ref = await keepFile(picked.source, meta, (done, count) => {
          if (count > 1) {
            const percent = Math.floor((done / count) * 100);
            setNote(what === 'photo' ? t('Keeping the photo, {percent}%', { percent }) : t('Keeping the file, {percent}%', { percent }));
          }
        });
        addMessage(peer, '', true, newTag(), lasts || timerOf(peer), undefined, ref, WAITING, Date.now(), parts);
        setReplying(null);
        const waits = toNostr
          ? what === 'photo' ? t('The photo waits, and goes by itself once Nostr can take it.') : t('The file waits, and goes by itself once Nostr can take it.')
          : what === 'photo' ? t('The photo waits, and goes by itself once the relay can take it.') : t('The file waits, and goes by itself once the relay can take it.');
        setNote(hiddenKey ? withClosedNote(waits) : waits);
      } catch (failed) {
        setNote(t('Not sent, and it could not wait. {error}', { error: errorText(failed) }));
      }
    } finally {
      picked.close?.();
    }
  }

  // What is picked under "+" opens once the panel has closed.
  function afterSheet(then: () => void) {
    setAttaching(false);
    setChoosingLater(false);
    then();
  }

  // A photo from the gallery or the camera; `hidden`, blurred till tapped; `once`, to see once (lib/see-once.ts).
  function sendPhoto(from: 'photos' | 'camera', hidden = false, once = false) {
    afterSheet(() =>
      void sendAttachment('photo', async () => {
        const photo = await pickPhoto(from, quality);
        return photo && { name: photo.name, mime: photo.mime, source: bytesSource(photo.bytes), w: photo.w, h: photo.h, ...(hidden || once ? { hidden: true as const } : {}), ...(once ? { once: true as const } : {}) };
      }),
    );
  }

  function sendPickedFile() {
    afterSheet(() =>
      void sendAttachment('file', async () => {
        const picked = await pickSource(MAX_FILE, true);
        if (!picked) return null;
        if (!(await sendsWithPlace(picked))) return null;
        const name = cleanFileName(picked.name);
        const said = cleanMime(picked.mime);
        return { name, mime: said === 'application/octet-stream' ? mimeOf(name) : said, source: picked.source, close: picked.close };
      }),
    );
  }

  // The contact who shared chats hears that they are being taken here, or did not come, for their
  // line (lib/share-rounds.ts takingCame); an Erevos from before takes no notice.
  function tellSharer(identity: string, tag: string, missed: boolean) {
    void sendToContact(relayTarget(), identity, '', { more: { taking: { tag, ...(missed ? { f: true as const } : {}) } } }).catch(() => undefined);
  }

  // Chats a contact shared, tapped: from a server the contact chose, without Tor, this phone's
  // internet address shows there, said first as for a file (lib/ip-warning.ts); then coming from
  // the tap on, so the line no longer asks for one (lib/share-rounds.ts says how far).
  async function takeSharedChats(way: ShareWay, message: Message, file: FileRef) {
    const peer = message.peer;
    const identity = peer.slice(CONTACT_PREFIX.length);
    const exposed = !!file.from?.url && !takesItself(way.own, file.from) && !isTorChat(peer) && !nostrOwnTor() && !netThroughTor();
    if (exposed && !(await ipGate({ network: 'Erevos', act: 'file', of: circuitOf(identity), ...ipKeep() }))) return;
    setTaking((now) => ({ ...now, [`${peer}|${message.tag}`]: '0%' }));
    void takePack(way, identity, message.tag);
    tellSharer(identity, message.tag, false);
  }

  // A photo or file tapped: taken from the relay if it is not here yet, otherwise shown on its own.
  function openFile(message: Message) {
    const file = message.file;
    if (!file) return;
    // Chats shared: theirs are kept, tried again with a tap; ours, while their files still go, can
    // stop. The file itself is not one to open.
    if (file.history) {
      const way = file.from && !message.mine ? shareWay(ownRelay()) : null;
      if (way) void takeSharedChats(way, message, file);
      else if (message.mine) void stopSharing(message);
      return;
    }
    // Ours to see once is theirs to see (lib/see-once.ts).
    if (file.once && message.mine) {
      setNote(notYoursToSee());
      return;
    }
    if (file.from) {
      if (strangers.has(message.peer)) {
        setNote(t('Photos and files from someone you have not accepted wait until you accept the request.'));
        return;
      }
      const own = ownRelay();
      if (own || !onRelay(file.from)) void take(own, message.peer, message.tag, file);
      else setNote(t('Type the relay address in Relay first.'));
      return;
    }
    setViewing(message);
  }

  // Writes the chat out as text where the owner picks (lib/chat-export.ts), once they say so.
  // Hidden chats are not written out: a file outside Erevos would show they are there.
  async function exportChat() {
    if (!selectedContact || hiddenKey) return;
    setDetails(false);
    const them = selectedName;
    const asked = t('Its messages are written to a text file, with their times and who wrote them, saved where you choose. The file is not encrypted: anyone who has it, or any app that reads where it is, can read the chat. Photos, files and voice messages are only named, and messages that disappear are left out.');
    if (!(await choose(t('Export this chat?'), asked, t('Cancel'), t('Export')))) return;
    const now = Date.now();
    try {
      const where = await saveText(exportName(them, now), chatText(messages.filter((m) => m.peer === selectedContact), them, now));
      if (where) setNote(t('Saved in {where}. There it is outside Erevos, not sealed.', { where }));
    } catch (error) {
      setNote(t('Not saved. {error}', { error: errorText(error) }));
    }
  }

  async function saveImported(file: FileRef, choose: boolean) {
    try {
      const where = await saveFile(file, choose);
      if (!where) return;
      setViewingImported(null);
      setNote(t('Saved in {where}. There it is outside Erevos, not sealed.', { where }));
    } catch (error) {
      setViewingImported(null);
      setNote(t('Not saved. {error}', { error: errorText(error) }));
    }
  }

  async function saveAttachment(message: Message, choose: boolean) {
    if (!message.file) return;
    try {
      const where = await saveFile(message.file, choose);
      if (!where) return;
      setViewing(null);
      setNote(t('Saved in {where}. There it is outside Erevos, not sealed.', { where }));
    } catch (error) {
      setViewing(null);
      setNote(t('Not saved. {error}', { error: errorText(error) }));
    }
  }

  // Nothing plays, or records, once the chat closes. Sound a closed Erevos left unsealed goes
  // when it opens.
  useEffect(() => {
    clearLeftovers();
    return () => {
      stopPlaying.current?.();
      holding.current = false;
      if (longest.current) clearTimeout(longest.current);
    };
  }, []);

  // Sets how long new messages with a contact last, and tells their phone at once. If the relay
  // cannot take that now, their phone learns it with the next message.
  // Makes this chat appear offline to them, or not. Shown again, what was held goes to them now.
  // Locks the chat on the screen with a new PIN, which stays open meanwhile.
  // Gives the chat on the screen notifications of its own, or the app's again (null).
  async function changeNotify(next: ChatNotify | null) {
    if (!e2e || !selected?.startsWith(CONTACT_PREFIX)) return;
    await e2e.setNotify(selected.slice(CONTACT_PREFIX.length), next);
    setContacts(e2e.contacts());
  }

  async function lockWithPin(pin: string) {
    if (!e2e || !selected?.startsWith(CONTACT_PREFIX)) return;
    const peer = selected;
    await e2e.setPin(peer.slice(CONTACT_PREFIX.length), await makeChatPin(pin));
    setUnlocked(peer);
    setContacts(e2e.contacts());
    setPinAsk(null);
    setNote(t('{name} is locked with a PIN now: it asks for it each time the chat opens.', { name: label(peer, shownContacts) }));
  }

  // Takes the PIN off the chat on the screen, once its PIN is typed.
  async function takePinOff(pin: string): Promise<boolean> {
    if (!e2e || !selected?.startsWith(CONTACT_PREFIX)) return true;
    const identity = selected.slice(CONTACT_PREFIX.length);
    const kept = e2e.pinOf(identity);
    if (kept && !(await opensChat(pin, kept))) return false;
    await e2e.setPin(identity, null);
    setContacts(e2e.contacts());
    setPinAsk(null);
    return true;
  }

  // Takes the PIN off the chat on the screen with the password that opens the space, its PIN forgotten.
  async function forgotPin(password: string): Promise<boolean> {
    if (!e2e || !selected?.startsWith(CONTACT_PREFIX)) return false;
    const peer = selected;
    if (!(await ownSpaceKey(currentSpace().space, password))) return false;
    await e2e.setPin(peer.slice(CONTACT_PREFIX.length), null);
    setUnlocked(peer);
    setContacts(e2e.contacts());
    setNote(t('The PIN of {name} is off.', { name: label(peer, shownContacts) }));
    return true;
  }

  // Opens the chat on the screen, locked with its PIN, once that is typed.
  async function openWithPin(pin: string): Promise<boolean> {
    if (!e2e || !selected?.startsWith(CONTACT_PREFIX)) return false;
    const peer = selected;
    const kept = e2e.pinOf(peer.slice(CONTACT_PREFIX.length));
    if (kept && !(await opensChat(pin, kept))) return false;
    setUnlocked(peer);
    return true;
  }

  // SMS when nothing else works, for one contact (lib/sms-way.ts): kept with the space's SMS state.
  async function changeSmsWay(peer: string, on: boolean) {
    const identity = peer.slice(CONTACT_PREFIX.length);
    try {
      const link = await spaceSmsLink();
      await link.refresh();
      if (!on && link.smsWay.all) {
        setNote(t('SMS is on for every contact with a number. Turn it off in Settings → Phone and SMS → SMS.'));
        return;
      }
      if (!(await link.setSmsWayFor(identity, on))) {
        setNote(t('SMS can be on for {n} contacts one by one at most. Turn it on for all in Settings → Phone and SMS → SMS.', { n: MAX_SMS_WAY }));
        return;
      }
      setSmsWay(link.smsWay);
      setNote(
        on
          ? t("When nothing else can take a text to {name}, it goes by SMS, end-to-end encrypted. Each SMS costs what your plan says, and the phone company sees that you wrote to their number, and when.", { name: label(peer, shownContacts) })
          : t('Messages to {name} no longer go by SMS.', { name: label(peer, shownContacts) }),
      );
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Whether the chat goes only through Tor (lib/tor-chats.ts): its files too, whatever the space's way.
  function isTorChat(peer: string): boolean {
    const identity = peer.startsWith(CONTACT_PREFIX) ? peer.slice(CONTACT_PREFIX.length) : '';
    return !!identity && contacts.some((c) => c.identity === identity && c.tor === true);
  }

  // Our relay as a chat's files go through it: on that chat's own circuits through Tor when it goes only through Tor.
  function torOwn(own: Relay, peer: string): Relay {
    return isTorChat(peer) ? { ...own, torChat: circuitOf(peer.slice(CONTACT_PREFIX.length)) } : own;
  }

  // Before the first of what is sent to a chat that can go without Tor, it is said once, for that
  // chat, that this phone's internet address can be seen, offering Tor for the chat (lib/ip-warning.ts).
  function ipBeforeSend(peer: string): Promise<boolean> {
    if (!peer.startsWith(CONTACT_PREFIX) || isTorChat(peer) || throughTor()) return Promise.resolve(true);
    return ipGate({ network: 'Erevos', act: 'send', of: circuitOf(peer.slice(CONTACT_PREFIX.length)), ...ipKeep() }, { label: t('Through Tor for this chat'), run: () => changeTor(peer, true) });
  }

  // Where the hidden chats keep that a warning was said: in their own data, never the space's,
  // which would name their contacts to the space's password (lib/ip-warning.ts IpKeep).
  function ipKeep(): { keep?: IpKeep } {
    return hiddenKey ? { keep: { space: currentSpace().space, pocket, key: hiddenKey } } : {};
  }

  // The chat goes only through Tor, on circuits of its own, whatever the space's way (lib/tor-chats.ts).
  async function changeTor(peer: string, on: boolean) {
    if (!e2e) return;
    try {
      await e2e.setTor(peer.slice(CONTACT_PREFIX.length), on);
      setContacts(e2e.contacts());
      setNote(on ? t('Messages and files with {name} now go only through Tor. They wait while Tor starts.', { name: label(peer, shownContacts) }) : t('Messages with {name} go as the space’s Tor setting says.', { name: label(peer, shownContacts) }));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // The voice this chat's voice messages go with (lib/voice-change.ts), or the voice as it is.
  async function changeVoice(peer: string, voice: VoiceKind | null) {
    if (!e2e) return;
    try {
      await e2e.setVoice(peer.slice(CONTACT_PREFIX.length), voice);
      setContacts(e2e.contacts());
    } catch (error) {
      setNote(errorText(error));
    }
  }

  async function changeHidden(peer: string, hide: boolean) {
    if (!e2e) return;
    const identity = peer.slice(CONTACT_PREFIX.length);
    try {
      await e2e.setHidden(identity, hide);
      setContacts(e2e.contacts());
    } catch (error) {
      setNote(errorText(error));
      return;
    }
    if (hide) {
      setNote(t('You appear offline to {name}. They see that messages came and were read once you write to them.', { name: label(peer, shownContacts) }));
      return;
    }
    const target = relayTarget();
    try {
      if (!target) throw new Error(t('Type the relay address in Relay first.'));
      await sendToContact(target, identity, '', { on: appShown() ? ONLINE : 0 });
      setNote(t('{name} sees again when you are online, and which messages you read.', { name: label(peer, shownContacts) }));
    } catch {
      setNote(t('{name} sees again when you are online. What you read is told with your next message.', { name: label(peer, shownContacts) }));
    }
  }

  async function changeAvatar(peer: string, avatar: Avatar | null) {
    if (!e2e) return;
    try {
      await e2e.setAvatar(peer.slice(CONTACT_PREFIX.length), avatar);
      setContacts(e2e.contacts());
    } catch (error) {
      setNote(errorText(error));
    }
  }

  /** Gives a contact a photo as their picture, from the phone's photos or its camera. */
  async function choosePhoto(peer: string, from: 'photos' | 'camera') {
    try {
      const bytes = await pickAvatar(from);
      if (!bytes) return;
      const ref = await savePhoto(bytes);
      await changeAvatar(peer, { kind: 'photo', ...ref });
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Moves a contact's chat into the space's hidden chats, which open with `pin` (or start with it,
  // new, when `fresh`): the contact, its messages and its look go there, sealed with their key, and
  // nothing of it stays here (lock/move-chat.ts). Their phone is told at once to write to the
  // hidden chats' relay queue from now on; what it sends before it hears that may not come.
  async function moveToHidden(peer: string, pin: string, fresh: number | null) {
    if (!e2e || !history.current || moving) return;
    if (!hiddenKey && linkedRole() === 'linked') {
      setMoveNote(t("This chat is the phone's: move it into hidden chats there."));
      return;
    }
    const identity = peer.slice(CONTACT_PREFIX.length);
    if (pin.length < MIN_PIN) {
      setMoveNote(t('The PIN needs {n} characters at least.', { n: MIN_PIN }));
      return;
    }
    setMoving(true);
    setMoveNote('');
    // The place's chats, held from their receiver while the chat moves into them.
    let release: (() => void) | null = null;
    try {
      const { space } = currentSpace();
      const place = fresh !== null ? { key: await setHiddenPassword(space, fresh, pin, null), pocket: fresh } : await openHidden(space, pin);
      if (!place) {
        setMoveNote(t('Wrong PIN.'));
        return;
      }
      const { key, pocket } = place;
      // Hidden chats linked to a phone have its chats only: a chat moves into them there.
      if ((await loadDevicesData(space, key, hiddenHolder(pocket)).catch(() => null))?.primary) {
        throw new Error(t("These hidden chats are linked to a phone: move the chat into them there."));
      }
      // Hidden chats reach the relay as the space does until they are given their own settings.
      const data = await loadHiddenData(space, pocket, key);
      const settings = data.url.trim()
        ? { url: data.url, token: data.token, via: data.via, viaToken: data.viaToken }
        : { url: relayUrl, token: relayToken, via: viaUrl, viaToken };
      const target = relayFor(settings.url, settings.token, settings.via, settings.viaToken);
      if (!target) throw new Error(t('Type the relay address in Relay first.'));
      let queue = data.ownQueue;
      if (!queue) {
        const ids = await createQueue(target);
        queue = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
      }
      await updateHiddenData(space, pocket, key, { ...settings, ownQueue: queue });
      // The same chats the place's receiver reads while they receive closed (lib/place-chats.ts),
      // with when their queue was made, before the tell below says it.
      release = await holdPlace(space, pocket);
      const { e2e: hiddenChats, history: hiddenHistory } = await placeChats(space, pocket, key);
      checkMove(identity, e2e, hiddenChats);
      // A contact who knows about devices is told first, by the space's chat, as the hidden chats
      // will say it to one who knows them by the space's identity: nothing of devices. Their devices
      // then stop writing to this account's, and to this account themselves, though their phone is
      // off (docs/multi-device.md).
      const sends = relayTarget();
      if (sends && e2e.record(identity)?.dv !== undefined) {
        await sendToContact(sends, identity, '', { leaving: true })
          .then(() => sendCopies(e2e, sends))
          .catch(() => undefined);
      }
      // Its imported chats go along, into the place's own.
      const hiddenArchive = await Archive.open(hiddenHolder(pocket), space, key);
      await moveChat(identity, { e2e, history: history.current, archive }, { e2e: hiddenChats, history: hiddenHistory, archive: hiddenArchive });
      await dropChat(chatListPlace, identity).catch(() => undefined);
      setMessages((list) => list.filter((m) => m.peer !== peer));
      setContacts(e2e.contacts());
      setPinDraft('');
      setStartingNew(false);
      setNewPocket(null);
      setOpened(null);
      setDetails(false);
      setSelected(null);
      // Where to write from now on, said from the hidden chats.
      try {
        const where = { relay: settings.url.trim(), relayKey: settings.url.trim() === relayUrl.trim() ? ownRelayKey : '' };
        const sealed = await hiddenChats.seal(identity, '', queue.senderHex, { at: where });
        await sendSealed(target, sealed, [sealed.packet], 'quiet', () => hiddenChats.firstSent(identity));
        setNote(t('Moved to the hidden chats. Type their PIN in the search on the home screen to open them.'));
      } catch {
        setNote(t('Moved to the hidden chats. Their phone learns where to write when you next write to them from there.'));
      }
      if (initial) router.canGoBack() ? router.back() : router.replace('/');
    } catch (error) {
      setMoveNote(
        error instanceof SamePasswordError
          ? t('Use another PIN: this one opens Erevos, or other hidden chats.')
          : error instanceof LockedOutError
            ? lockedOutMessage(error.until)
            : t('Not moved. {error}', { error: errorText(error) }),
      );
    } finally {
      release?.();
      setMoving(false);
    }
  }

  // Moves a chat of these hidden chats back among the space's chats: the move into them, the other way.
  async function moveToSpace(peer: string) {
    if (!e2e || !history.current || !hiddenKey || moving) return;
    if (placeLinked()?.role() === 'linked') {
      setMoveNote(t("This chat is the phone's: move it out of the hidden chats there."));
      return;
    }
    const identity = peer.slice(CONTACT_PREFIX.length);
    setMoving(true);
    setMoveNote('');
    try {
      const data = await loadCurrentSpaceData();
      const target = relayFor(data.url, data.token, data.via, data.viaToken);
      if (!target || !data.ownQueue) throw new Error(t("The space's chats have no relay queue yet: create it under Relay there first."));
      const space = await spaceChats();
      checkMove(identity, e2e, space.e2e);
      // A contact who knows about devices is told first, as the move into hidden chats tells them:
      // nothing of devices, as the space's chat will say it to one who knows it by this identity.
      const sends = relayTarget();
      if (sends && e2e.record(identity)?.dv !== undefined) {
        await sendToContact(sends, identity, '', { leaving: true })
          .then(() => sendCopies(e2e, sends))
          .catch(() => undefined);
      }
      const here = currentSpace();
      const spaceArchive = await Archive.open('space', here.space, here.key);
      await moveChat(identity, { e2e, history: history.current, archive }, { e2e: space.e2e, history: space.history, archive: spaceArchive });
      await dropChat(chatListPlace, identity).catch(() => undefined);
      setMessages((list) => list.filter((m) => m.peer !== peer));
      setContacts(e2e.contacts());
      setOpened(null);
      setDetails(false);
      setSelected(null);
      // Where to write from now on, said from the space's chats.
      try {
        const key = await relayKey(target).catch(() => null);
        const sealed = await space.e2e.seal(identity, '', data.ownQueue.senderHex, { at: { relay: data.url.trim(), relayKey: key ? toBase64Url(key) : '' } });
        await sendSealed(target, sealed, [sealed.packet], 'quiet', () => space.e2e.firstSent(identity));
        setNote(t('Moved back to your chats.'));
      } catch {
        setNote(t('Moved back to your chats. Their phone learns where to write when you next write to them from there.'));
      }
    } catch (error) {
      setMoveNote(t('Not moved. {error}', { error: errorText(error) }));
    } finally {
      setMoving(false);
    }
  }

  // Moves a contact's chat into another space, the one `password` opens, as into hidden chats: the
  // contact, its messages, its look and its imported chats go there, sealed with that space's key,
  // and nothing of it stays here (lock/move-chat.ts). That space is not opened: its key serves the
  // move only and is let go of after. The password is tried as the search tries it (lock/hidden.ts
  // searchOpens): every space and PIN, in the same time whatever it is, its wrong tries counted with
  // the search's, so the row says nothing of whether another space exists. Their phone is told at
  // once, from that space's relay queue, to write there from now on.
  async function moveToOtherSpace(peer: string, password: string, shareRelay = false) {
    if (!e2e || !history.current || hiddenKey || moving) return;
    if (linkedRole() === 'linked') {
      setMoveNote(t("This chat is the phone's: move it to another space there."));
      return;
    }
    const identity = peer.slice(CONTACT_PREFIX.length);
    setMoving(true);
    setMoveNote('');
    try {
      const here = currentSpace();
      const found = await searchOpens(here.space, password, false);
      const other = found && 'space' in found ? found.space : null;
      if (!other) {
        setMoveNote(t('Wrong password'));
        return;
      }
      // A space linked to a phone has that phone's chats only: a chat moves into it there.
      if ((await loadDevicesData(other.space, other.key).catch(() => null))?.primary) {
        throw new Error(t('That space is linked to a phone: move the chat into it there.'));
      }
      const data = await loadSpaceData(other.space, other.key);
      const theirs = await E2E.open('space', other.space, other.key);
      checkMove(identity, e2e, theirs);
      // That space's own relay; with none yet, this space's, once the owner says so with a second
      // tap (relayOffer): kept as that space's from then on, as hidden chats keep the space's, though
      // the relay can then tell the two spaces are one phone's.
      let settings = { url: data.url, token: data.token, via: data.via, viaToken: data.viaToken };
      if (!settings.url.trim()) {
        if (!relayUrl.trim()) throw new Error(t('Neither space has a relay yet: set one under Relay in that space first.'));
        if (!shareRelay) {
          setRelayOffer(true);
          return;
        }
        settings = { url: relayUrl, token: relayToken, via: viaUrl, viaToken };
      }
      const target = relayFor(settings.url, settings.token, settings.via, settings.viaToken);
      if (!target) throw new Error(t('Type the relay address in Relay first.'));
      // Its queue there, made now when it has none yet, or when it takes this space's relay.
      let queue = settings.url === data.url ? data.ownQueue : null;
      if (!queue) {
        const ids = await createQueue(target);
        queue = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
      }
      await updateSpaceData(other.space, other.key, { ...settings, ownQueue: queue });
      // A contact who knows about devices is told first, as a move into hidden chats tells them:
      // the other space's chat says nothing of devices to one who knows it by this identity.
      const sends = relayTarget();
      if (sends && e2e.record(identity)?.dv !== undefined) {
        await sendToContact(sends, identity, '', { leaving: true })
          .then(() => sendCopies(e2e, sends))
          .catch(() => undefined);
      }
      const theirHistory = await History.open('space', other.space, other.key);
      const theirArchive = await Archive.open('space', other.space, other.key);
      await moveChat(identity, { e2e, history: history.current, archive }, { e2e: theirs, history: theirHistory, archive: theirArchive });
      await dropChat(chatListPlace, identity).catch(() => undefined);
      setMessages((list) => list.filter((m) => m.peer !== peer));
      setContacts(e2e.contacts());
      setPasswordDraft('');
      setRelayOffer(false);
      setOpened(null);
      setDetails(false);
      setSelected(null);
      // Where to write from now on, said from the other space's chats.
      try {
        const key = await relayKey(target).catch(() => null);
        const sealed = await theirs.seal(identity, '', queue.senderHex, { at: { relay: settings.url.trim(), relayKey: key ? toBase64Url(key) : '' } });
        await sendSealed(target, sealed, [sealed.packet], 'quiet', () => theirs.firstSent(identity));
        setNote(t('Moved to the other space. Open Erevos with its password to write there.'));
      } catch {
        setNote(t('Moved to the other space. Their phone learns where to write when you next write to them from there.'));
      }
      if (initial) router.canGoBack() ? router.back() : router.replace('/');
    } catch (error) {
      setMoveNote(t('Not moved. {error}', { error: errorText(error) }));
    } finally {
      setMoving(false);
    }
  }

  async function changeTimer(peer: string, timer: number) {
    if (!e2e) return;
    const identity = peer.slice(CONTACT_PREFIX.length);
    try {
      await e2e.setTimer(identity, timer);
      setContacts(e2e.contacts());
      setOpened(null);
    } catch (error) {
      setNote(errorText(error));
      return;
    }
    const set = timer
      ? t('New messages in this chat now disappear from both phones {time} after they are read.', { time: timerLabel(timer) })
      : t('New messages in this chat no longer disappear.');
    const target = relayTarget();
    try {
      if (!target) throw new Error(t('Type the relay address in Relay first.'));
      await sendToContact(target, identity, '');
      setNote(set);
    } catch (error) {
      setNote(t("{set} {name}'s phone learns it with your next message. {reason}", { set, name: label(peer, shownContacts), reason: notSentReason(error) }));
    }
  }

  // Blocks screenshots of a chat on both phones, or allows them again: told to them as the timer is.
  async function changeShots(peer: string, on: boolean) {
    if (!e2e) return;
    const identity = peer.slice(CONTACT_PREFIX.length);
    try {
      await e2e.setShots(identity, on);
      setContacts(e2e.contacts());
    } catch (error) {
      setNote(errorText(error));
      return;
    }
    const set = on ? t('Screenshots of this chat are now blocked on both phones.') : t('Screenshots of this chat are allowed again.');
    const target = relayTarget();
    try {
      if (!target) throw new Error(t('Type the relay address in Relay first.'));
      await sendToContact(target, identity, '');
      setNote(set);
    } catch (error) {
      setNote(t("{set} {name}'s phone learns it with your next message. {reason}", { set, name: label(peer, shownContacts), reason: notSentReason(error) }));
    }
  }

  // Saves this hidden place's home relay and makes its queue there, if it can be reached now.
  async function saveHome() {
    setHomeNote('');
    const address = homeUrl.trim();
    if (address && !/^wss?:\/\/[^\s/?#]+(\/[^\s]*)?$/i.test(address)) {
      setHomeNote(t('A relay address starts with ws:// or wss://.'));
      return;
    }
    const space = await loadCurrentSpaceData().catch(() => null);
    if (address && (sameRelay(address, relayUrl) || (space ? homeRelays(space.spare).some((one) => one.url && sameRelay(address, one.url)) : false))) {
      setHomeNote(t('Use another relay than this relay, and than the space’s home relay: one relay seeing both would tie them together.'));
      return;
    }
    try {
      await setSpareRelay(address, homeToken, spareStore);
      if (!address) {
        setHomeNote(t('No home relay for these hidden chats.'));
        return;
      }
      await readySpare(spareStore);
      setHomeNote(t('The queue on the home relay is ready. Contacts learn it from your next message, or from your contact link.'));
    } catch (error) {
      setHomeNote(t('Saved, but the home relay could not be reached: {error}. It is tried again with each look.', { error: errorText(error) }));
    }
  }

  // A new ring queue for these hidden chats, if they ring, made at once with the one before deleted,
  // so whoever rang it can no longer ring this phone (MoveAt.ring: the move's own steps tell kept
  // contacts the new one, and forget the rings that brought no call). Says whether it moved; throws
  // when the relay cannot be reached, so it is tried again with each look.
  const moveRing = useRef(async () => false);
  moveRing.current = async () => {
    if (!hiddenKey || !ringing) return false;
    const { space, key } = currentSpace();
    const url = relayUrl.trim();
    const token = relayToken.trim();
    const before = (await loadHiddenData(space, pocket, hiddenKey)).ringQueue;
    if (!url || !before) return false;
    const made = await moveRingPocket(space, key, pocket, { url, token: token || undefined }, before.recipientHex);
    const ring = { recipientHex: made.recipientHex, senderHex: made.senderHex };
    await updateHiddenData(space, pocket, hiddenKey, { ringQueue: ring });
    setRingQueue(ring);
    return true;
  };

  // What moves with these hidden chats' own queue (lib/queue-move.ts): their own linked devices are
  // told (lib/devices.ts), and the watch slot says the new one. The ring queue moves too, with the
  // move's own steps (MoveAt.ring).
  const hiddenMoved = useRef(async (_queue: Queue, _old: Queue | null, _why: MoveWhy) => undefined as void);
  hiddenMoved.current = async (queue, old, why) => {
    if (!hiddenKey) return;
    const { space, key } = currentSpace();
    await placeMoved(space, pocket, queue, old, why);
    const url = relayUrl.trim();
    if (!url) return;
    // Decided by the slot too: the relay may have lost the old queue before the switch was read.
    const was = watched || (!!old && wasWatchedQueue(await loadWatched(space, key).catch(() => []), pocket, old.recipientHex));
    if (!was) return;
    await watchPocket(space, key, pocket, { url, token: relayToken.trim(), recipientHex: queue.recipientHex }).then(
      () => setWatched(true),
      () => setWatched(false),
    );
  };

  // A ring of this place answered with the PIN that brought no call within HIDDEN_OFFER_MS
  // (lib/hidden-ring.ts), or before these chats closed again, counts against the ring queue: three
  // within a day and it moves (lib/moves.ts fakeRings), so whoever rings it for nothing can no
  // longer. It moves only while they are open.
  useEffect(() => {
    if (!hiddenKey || !loaded) return;
    const { space } = currentSpace();
    const queues = placeQueues(space, pocket, hiddenKey);
    let open = true;
    const moveIfFake = async (rings: number[]) => {
      if (open && fakeRings(rings)) await mover.current?.ringMove();
    };
    void queues
      .load()
      .then((d) => moveIfFake(d.rings))
      .catch(() => undefined);
    const at = hiddenAnswerAt(space, pocket);
    const count = (closing = false) => {
      if (at === null || !lapseHiddenAnswer(at, Date.now(), closing)) return;
      // The ring it answered showed Erevos over the lock screen: with no call, it shows there no more.
      if (!currentCall() && !currentGroupCall()) {
        try {
          callAudio?.showOverLock?.(false);
        } catch {
          // A build from before ringing.
        }
      }
      void queues
        .update((d) => {
          const now = Date.now();
          return { ...d, rings: [...d.rings.filter((ring) => now - ring < FAKE_RINGS_WITHIN), now] };
        })
        .then((d) => moveIfFake(d.rings))
        .catch(() => undefined);
    };
    const timer = at === null ? null : setTimeout(() => count(), Math.max(0, at + HIDDEN_OFFER_MS - Date.now()));
    return () => {
      open = false;
      if (timer) clearTimeout(timer);
      count(true);
    };
  }, [hiddenKey, loaded]);

  // With a relay and no queue on it, the queue is made by itself (#11): the words relay and queue
  // stay under For advanced users. Once for each address, a few seconds after it stops changing, so
  // a half-typed one is not tried; when it fails, the note says why and Create my relay queue
  // under For advanced users tries again.
  const queueTried = useRef(new Set<string>());
  useEffect(() => {
    const url = relayUrl.trim();
    if (!loaded || !url || ownQueue || linkHere() || queueTried.current.has(url)) return;
    const timer = setTimeout(() => {
      queueTried.current.add(url);
      void createOwnQueue();
    }, AUTO_QUEUE_MS);
    return () => clearTimeout(timer);
  }, [loaded, relayUrl, ownQueue]);

  async function createOwnQueue() {
    // What was just typed counts, even before typing paused.
    for (const field of [typedRelay, typedToken, typedVia, typedViaToken]) field.done();
    const target = relayFor(typedRelay.shown, typedToken.shown, typedVia.shown, typedViaToken.shown, spareBackup(spareStore));
    if (!target) {
      setNote(t('Type the relay address first.'));
      return;
    }
    try {
      const ids = await createQueue(target);
      setOwnQueue({ recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) });
      setNote(t('Relay queue created.'));
      // The new queue is the one to say a message came from.
      if (hiddenKey && watched) {
        const { space, key } = currentSpace();
        await watchPocket(space, key, pocket, { url: target.url, token: target.token ?? '', recipientHex: toHex(ids.recipientId) }).catch(() => setWatched(false));
      }
      // The ring queue lives on this relay too: a new relay needs a new ring queue.
      if (hiddenKey && ringing) {
        const { space, key } = currentSpace();
        try {
          const ring = await createQueue(target);
          const queue = { recipientHex: toHex(ring.recipientId), senderHex: toHex(ring.senderId) };
          await ringPocket(space, key, pocket, { url: target.url, token: target.token ?? '', recipientHex: queue.recipientHex, senderHex: queue.senderHex });
          await updateHiddenData(space, pocket, hiddenKey, { ringQueue: queue });
          setRingQueue(queue);
        } catch {
          setRinging(false);
        }
      }
    } catch (error) {
      setNote(errorText(error));
    }
  }

  useEffect(() => {
    if (!placeGroups) {
      setPlaceName(null);
      return;
    }
    let active = true;
    myNameAt(placeGroups).then(
      (name) => active && setPlaceName(name),
      () => active && setPlaceName(''),
    );
    return () => {
      active = false;
    };
  }, [placeGroups]);

  // Saves the name these hidden chats go by, and has their private groups say it.
  async function savePlaceName() {
    if (!placeGroups || placeName === null) return;
    try {
      await setMyNameAt(placeGroups, placeName);
      setPlaceName(await myNameAt(placeGroups));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Has these hidden chats receive while closed, their key kept with the space (lock/hidden-keep.ts), or no longer.
  async function changeReceiving(on: boolean) {
    if (!hiddenKey) return;
    const { space, key } = currentSpace();
    setReceiving(on);
    try {
      await keepPlace(space, key, pocket, on ? hiddenKey : null);
    } catch (error) {
      setReceiving(!on);
      setNote(errorText(error));
      return;
    }
    // Their reminders still to come, told by the phone from now on, or no longer.
    await armPlaceReminders({ holder: hiddenHolder(pocket), space, key: hiddenKey }, on).catch(() => undefined);
  }

  // Has a dot on the search of the space's chats say these hidden chats have a message unread, or no longer.
  function changePlaceSign(on: boolean) {
    if (!hiddenKey) return;
    setPlaceSign(on);
    updateHiddenData(currentSpace().space, pocket, hiddenKey, { sign: on }).catch((error) => {
      setPlaceSign(!on);
      setNote(errorText(error));
    });
  }

  // Has these hidden chats say a message came while they are closed, or no longer.
  async function changeWatched(on: boolean) {
    const { space, key } = currentSpace();
    const url = typedRelay.shown.trim();
    const token = typedToken.shown.trim();
    setWatchNote('');
    try {
      if (on) {
        if (!url || !ownQueue) {
          setWatchNote(t('Create the relay queue of these hidden chats first, below.'));
          return;
        }
        await watchPocket(space, key, pocket, { url, token, recipientHex: ownQueue.recipientHex });
      } else {
        await unwatchPocket(space, key, pocket, url ? { url, token: token || undefined } : null);
      }
      setWatched(on);
    } catch (error) {
      setWatchNote(errorText(error));
    }
  }

  // Has these hidden chats ring their contacts' calls while closed, or no longer. On makes a ring
  // queue on this place's relay (lock/hidden-ring.ts) and says it to contacts; off puts a queue
  // made for nothing in its place and tells contacts it no longer rings.
  async function changeRinging(on: boolean) {
    const { space, key } = currentSpace();
    const url = typedRelay.shown.trim();
    const token = typedToken.shown.trim();
    setRingNote('');
    try {
      if (on) {
        if (!url || !ownQueue) {
          setRingNote(t('Create the relay queue of these hidden chats first, below.'));
          return;
        }
        let queue = ringQueue;
        if (!queue) {
          const ids = await createQueue({ url, token: token || undefined });
          queue = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
        }
        await ringPocket(space, key, pocket, { url, token, recipientHex: queue.recipientHex, senderHex: queue.senderHex });
        await updateHiddenData(space, pocket, hiddenKey!, { ringQueue: queue });
        setRingQueue(queue);
      } else {
        await unringPocket(space, key, pocket, url ? { url, token: token || undefined } : null);
        await updateHiddenData(space, pocket, hiddenKey!, { ringQueue: null });
        setRingQueue(null);
      }
      setRinging(on);
    } catch (error) {
      setRingNote(errorText(error));
    }
  }

  // Whether the text was a link Erevos takes: alone, or in a message pasted whole.
  function addContact(pasted = contactDraft): boolean {
    const text = pastedLink(pasted);
    const welcome = parseWelcome(text);
    if (welcome) {
      setContactDraft('');
      if (hiddenKey) void acceptContact(welcome.contact, undefined, true);
      else void takeWelcome(welcome);
      return true;
    }
    const invite = parseInvite(text);
    if (invite) {
      setContactDraft('');
      if (hiddenKey) setNote(t('An invite to a relay is taken in the chats of the space, not in hidden chats.'));
      else void joinRelay(invite);
      return true;
    }
    // The link of an invite by plain SMS, pasted, as on an iPhone, where the web app cannot open it.
    const byText = parseTextInvite(text);
    if (byText) {
      setContactDraft('');
      if (hiddenKey) setNote(t('An invite by SMS is taken in the chats of the space, not in hidden chats.'));
      else void takeTextInvite(byText, byText.name);
      return true;
    }
    return addContactLink(text);
  }

  // Their contact link, and nothing else, adds them as a contact of these chats. `said`: the name
  // the other phone gave itself beside the link (Near me), for a link that names no one.
  function addContactLink(text: string, said = ''): boolean {
    const code = parseContact(text);
    if (!code) {
      setNote(t('That is not an Erevos contact link.'));
      return false;
    }
    setContactDraft('');
    // A link from a web page names its phone: the name it takes while it has none of its own.
    const name = contactLinkName(text) || said;
    void acceptContact(code, name ? { place: contactsPlace, name } : undefined, true);
    return true;
  }

  // What a pairing hands over, by Near me's pictures or by the code of 8 digits: the other phone's
  // contact link, read as one and as nothing else. Its owner said yes to a contact, so an invite to
  // a relay or a welcome in its place, which a link pasted by hand may be (addContact), is not
  // taken: this phone would join a relay, or take a line there, that no one asked it about.
  function addPaired(link: string, said = ''): boolean {
    return addContactLink(link.trim(), said);
  }

  // The name typed on You are connected, for the contact just added: theirs in these chats from then on.
  async function nameJoined(identity: string, name: string) {
    if (!e2e) return;
    try {
      await e2e.rename(identity, name);
      setContacts(e2e.contacts());
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // The contact just added here, connected to one of my contacts: linked to it, and named after it
  // while it has no name of its own. Hidden chats link only their own (lib/sealed-contacts.ts, linkCard).
  async function connectTo(card: ContactCard) {
    const identity = connecting;
    if (!e2e || !identity) return;
    setPickNote('');
    try {
      // Named only once linked: a phone contact is never linked, nor named after, in hidden chats.
      if (!(await linkCard(contactsPlace, card, identity))) return;
      await giveLinkedName(e2e, identity, card);
      setContacts(e2e.contacts());
      setPicking(false);
      setConnecting(null);
      // After the note that they were added, which may say what their relay gave, not in its place.
      const connected = t('Connected to {name}.', { name: card.name });
      setNote((current) => (current ? `${current} ${connected}` : connected));
    } catch (error) {
      setPickNote(errorText(error));
    }
  }

  // Their QR code, photographed or chosen from the photos, adds them at once (lib/read-qr.ts).
  async function addFromQr(from: 'camera' | 'photos') {
    setNote('');
    try {
      const text = await readQrPhoto(from);
      if (text === null) return;
      if (text && (parseContact(text) || parseInvite(text) || parseWelcome(text) || parseTextInvite(text))) addContact(text);
      else setNote(text ? t('That QR code holds no Erevos ID.') : t('No QR code was found in the photo. Take it again closer, with all of the code in it.'));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Theirs that came before the time it was sent for shows then (lib/later.ts, showsAt).
  // Worked out again only when the messages, the chat or the time (every few seconds) change; and
  // when the same messages show as before (the clock went, another chat changed), it is the same
  // list, so the thread and what is sorted out of it (the details' media) are not done again.
  // None while the chat's PIN is asked for: nothing of it lies under the gate (ChatPinGate).
  const visibleWas = useRef<Message[]>([]);
  const visible = useMemo(() => {
    const shownBy = Date.now();
    const list = gated ? [] : messages.filter((message) => message.peer === selected && (message.mine || message.at <= shownBy));
    const was = visibleWas.current;
    if (list.length === was.length && list.every((message, n) => message === was[n])) return was;
    visibleWas.current = list;
    return list;
  }, [messages, selected, now, gated]);
  // The message each tag names, for the one a message answers.
  const byTag = useMemo(() => {
    const named = new Map<string, Message>();
    for (const m of visible) if (m.tag && !named.has(m.tag)) named.set(m.tag, m);
    return named;
  }, [visible]);
  // Each message's thread, by tag, and how many answers each thread has (lib/chat-parts.ts).
  const threadRoots_ = useMemo(() => threadRoots(visible.filter((m) => m.tag && !m.sending && !isCallLine(m.text))), [visible]);
  const threadAnswers = useMemo(() => threadSizes(threadRoots_), [threadRoots_]);
  // A thread whose first message is gone shows no more.
  useEffect(() => {
    if (threadRoot && !threadRoots_.has(threadRoot)) setThreadRoot(null);
  }, [threadRoot, threadRoots_]);
  // The messages chosen (components/select-bar.tsx), in the thread's order, those still here.
  const chosenMessages = selection.on ? visible.filter((m) => selection.chosen.has(m.id) && !m.sending) : [];
  // What the thread's lines do (MessageLine, SmsLine), with this render's state: the lines keep
  // one object, so one line draws again only when what it shows changes.
  rowDo.current = {
    play: (message) => void play(message),
    open: openFile,
    // Only to read while the chat opens (shown at once, before its history is in hand).
    menu: (message) => {
      if (!history.current || !e2e) {
        // Not ignored: said, and opened as soon as the look at the relay under way ends.
        menuWaiting.current = { peer: message.peer, tag: message.tag, at: message.at, mine: message.mine };
        setNote(t('Erevos is still reading what came. The menu opens in a moment.'));
        return;
      }
      setMenuTurn((n) => n + 1);
      setMenuFor(message);
    },
    goTo,
    vote: (message, option) => history.current && void vote(message, option),
    paid: (message) => history.current && void markPaid(message),
    fasouli: toFasouli,
    placed: (message, y) => {
      placed.current.set(message.id, y);
      if (message.file?.kind === 'photo') photoAt.current.set(message.file.id, y);
      // Opened at this message (a starred one, or one found): gone to once the thread has settled.
      if (goal.current === message.tag) {
        goal.current = null;
        holdScroll.current = true;
        setTimeout(() => goTo(message.peer, message.tag), 400);
      }
    },
    smsAgain: sendSmsLineAgain,
    smsMenu: setSmsMenuFor,
    smsEarlier: () => {
      holdScroll.current = true;
      smsAsked.current = lines.length;
      chatSms.earlier();
    },
    smsPlaced: (id, y) => smsPlaced.current.set(id, y),
    importedPlaced: (index, message, y) => {
      importedPlaced.current.set(index, y);
      for (const file of message.files) if (file.kind === 'photo') photoAt.current.set(file.id, y);
      if (importedGoal.current === index) {
        importedGoal.current = null;
        holdScroll.current = true;
        setTimeout(() => rowDo.current?.goTo(selected ?? '', importedTag(index)), 400);
      }
    },
    importedMenu: setImportedMenuFor,
    importedOpen: setViewingImported,
    importedPlay: (file) => void playImported(file),
    choose: (message) => !message.sending && selection.toggle(message.id),
    saveCard: (card) => saveCard(card, !!hiddenKey),
    thread: openThread,
  };
  // The SMS with their number, among the messages by time (lib/sms-chat.ts): never in hidden chats.
  const smsWith = selected?.startsWith(CONTACT_PREFIX) ? selected.slice(CONTACT_PREFIX.length) : '';
  const chatSms = useChatSms({
    identity: smsWith,
    phone: (smsWith && e2e?.phones().find((p) => p.identity === smsWith)?.phone) || '',
    hidden: !!hiddenKey,
    seen: shown && appActive && !gated,
  });
  // Their number, for a plain call from the top (components/dial-tile.tsx): the one linked to them,
  // else that of the contact linked to them by hand (lib/contact-book.ts). Never in hidden chats.
  const linkedPhone = !hiddenKey && smsWith ? (e2e?.phones().find((p) => p.identity === smsWith)?.phone ?? '') : '';
  const [cardPhone, setCardPhone] = useState({ identity: '', number: '' });
  useEffect(() => {
    if (hiddenKey || !smsWith) return;
    let live = true;
    const look = () =>
      void linkedCardNumber(smsWith)
        .then((number) => live && setCardPhone({ identity: smsWith, number }))
        .catch(() => undefined);
    look();
    const stop = onSealedChange(look);
    return () => {
      live = false;
      stop();
    };
  }, [hiddenKey, smsWith]);
  const cardNumber = !hiddenKey && cardPhone.identity === smsWith ? cardPhone.number : '';
  const dialTo = canDial(linkedPhone) ? linkedPhone : canDial(cardNumber) ? cardNumber : '';
  // A thread shown alone has only its own messages: no SMS, no chats imported.
  const lines = useMemo(
    () => chatLines(threadRoot ? visible.filter((m) => threadRoots_.get(m.tag) === threadRoot || (!!m.sending && !!m.re && threadRoots_.get(m.re) === threadRoot)) : visible, gated || threadRoot ? [] : chatSms.messages, chatSms.more),
    [visible, chatSms.messages, chatSms.more, gated, threadRoot, threadRoots_],
  );
  const selectedIdentity = selected?.startsWith(CONTACT_PREFIX) ? selected.slice(CONTACT_PREFIX.length) : '';
  const imported = useMemo(() => (archive && selectedIdentity && !gated && !threadRoot ? archive.linked(selectedIdentity) : []), [archive, selectedIdentity, archiveTick, gated, threadRoot]);
  const importedChats = useMemo(() => (archive && selectedIdentity ? archive.linkedChats(selectedIdentity) : []), [archive, selectedIdentity, archiveTick]);
  // A chat brought in from the details goes on here at once, kept only in this chat.
  const importFlow = useImportFlow(
    archive,
    setImportSaid,
    async (ids) => {
      for (const id of ids) await archive?.link(id, selectedIdentity, true);
      setArchiveTick((n) => n + 1);
    },
    true,
  );
  // A file picked, or what was said, in one chat's details is not another's. One coming in goes on.
  useEffect(() => {
    setImportSaid('');
    if (!importFlow.busy) importFlow.cancel();
  }, [selected]);
  // Changes what was imported that goes on in this chat: kept only here or not, no longer here, or deleted.
  async function changeImported(run: () => Promise<void> | undefined, said = '') {
    try {
      await run();
      setArchiveTick((n) => n + 1);
      setImportSaid(said);
    } catch (error) {
      setImportSaid(errorText(error));
    }
  }
  const removeImported = (id: string, title: string) =>
    ask(t('Delete imported chat'), t('Delete “{title}” from this phone? It cannot be brought back.', { title }), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Delete'), style: 'destructive', onPress: () => void changeImported(() => archive?.remove(id)) },
    ]);
  // What was imported here that can be shared with this contact: only with a contact taken.
  const sharing = useMemo(() => (archive && selectedIdentity && selectedAccepted ? sharable(archive, selectedIdentity) : []), [archive, selectedIdentity, selectedAccepted, archiveTick]);
  // Asked from Settings → Imported chats, once this chat shows.
  useEffect(() => {
    if (archive && !gated && takeAskToShare(selectedIdentity) && sharing.length > 0) void shareImported();
  }, [archive, sharing, gated, selectedIdentity]);

  // Shares the chats imported here that go on with this contact with them alone (lib/chat-share.ts),
  // once the owner says so: all of them together, every message and every file they kept, through
  // our relay, end-to-end encrypted. Their Erevos keeps the messages at once; the files follow in
  // rounds while both phones run Erevos (lib/share-rounds.ts), whatever their size. Never to a group.
  async function shareImported() {
    const peer = selected;
    const identity = selectedIdentity;
    const chats = sharing;
    if (!peer || !identity || chats.length === 0) return;
    if (!e2e) {
      setNote(notOpen());
      return;
    }
    const own = ownRelay();
    if (!own) {
      setImportSaid(t('Type the relay address in Relay first.'));
      setNote(t('Type the relay address in Relay first.'));
      return;
    }
    const name = label(peer, shownContacts);
    const { count, bytes } = shareSize(chats);
    const told = plural(
      count,
      '{n} message, {size} in all, goes to {name} alone, end-to-end encrypted. Their Erevos keeps it at once in your chat, ahead of the new messages, only to read.',
      '{n} messages, {size} in all, with their photos and files, go to {name} alone, end-to-end encrypted. Their Erevos keeps them at once in your chat, ahead of the new messages, only to read.',
      { name, size: fileSize(bytes) },
    );
    if (!(await choose(t('Share with {name}', { name }), told, t('Cancel'), t('Share')))) return;
    setDetails(false);
    const chatsHere = e2e;
    const target = relayTarget();
    const sealedAs = newTag();
    const rounds = shareWay(own);
    let ready: ReadyShare | null = null;
    let packed: { ref: FileRef; offer: FileOffer } | null = null;
    let begun = false;
    try {
      setNote(t('Sharing, {percent}%', { percent: 0 }));
      ready = await readyShare(identity, chats);
      packed = await sendFile(own, bytesSource(ready.bytes), packMeta(ready.mark));
      // Its files go from now on, as their Erevos takes them, which may say so at once: begun
      // before the words go.
      if (rounds) begun = await beginShare(rounds, ready, sealedAs).then(() => true, () => false);
      const sealed = await chatsHere.sealFile(identity, packed.offer, ownQueue?.senderHex ?? '', { at: here(), tag: sealedAs });
      const way = await handOver(chatsHere, target, identity, sealed, [sealed.packet], 'message', false, !!hiddenKey);
      addMessage(peer, '', true, sealed.tag, sealed.timer, undefined, packed.ref, 0, Date.now(), wayParts(way));
      setContacts(chatsHere.contacts());
      setNote(t('Shared with {name}, end-to-end encrypted.', { name }));
    } catch (error) {
      if (error instanceof OwedError && packed && ready) {
        // In hidden chats, owed to their phone should it take it only later.
        const given = packed.offer;
        addMessage(peer, '', true, sealedAs, timerOf(peer), undefined, packed.ref, 0, Date.now());
        owed.current.add(identity, sealedAs, async () => {
          const sealed = await chatsHere.sealFile(identity, given, ownQueue?.senderHex ?? '', { at: here(), tag: sealedAs });
          return { sealed, packets: [sealed.packet] };
        });
        setNote(owedNote(peer, error));
      } else {
        if (packed) await takeOffRelay(own, packed.offer.ids).catch(() => undefined);
        // Nothing went: neither do its files, of which the contact knows nothing.
        if (rounds && ready && begun) await stopShare(rounds, ready.s, false).catch(() => undefined);
        setNote(notSent(error));
      }
    } finally {
      // Its file is not kept here: the chats are, as they were.
      if (packed) await deleteChunks(packed.ref.id, packed.ref.count).catch(() => undefined);
      if (ready && !begun) await dropReady(ready);
    }
  }
  // Sorted out only while the details or the lists show.
  const media = useMemo(() => (details || mediaOpen ? chatMedia(visible, imported) : []), [details, mediaOpen, visible, imported]);
  const chatDays = useMemo(() => (dayPicking ? daysOf([...imported, ...visible]) : new Set<string>()), [dayPicking, imported, visible]);
  // Goes to a day's first message: of what was imported, which shows first, or of the thread.
  const goToDay = (day: string) => {
    const index = imported.findIndex((message) => message.at > 0 && dayKey(message.at) === day);
    const message = index < 0 ? visible.find((one) => dayKey(one.at) === day) : undefined;
    holdScroll.current = true;
    if (index >= 0) goTo(selected ?? '', importedTag(index));
    else if (message) goTo(message.peer, message.tag);
  };
  // What is drawn of what was imported and of the thread: to the end, the latest THREAD_PAGE lines
  // at first, more once asked for or gone to, and what was imported once all of the thread is; or
  // the stretch read away from the end. `later` is how many come after what is drawn.
  const total = imported.length + lines.length;
  const firstImported = stretch ? Math.min(imported.length, stretch.from) : Math.max(0, imported.length - importedShown);
  const importedEnd = stretch ? Math.min(imported.length, stretch.to) : imported.length;
  const firstLine = stretch ? Math.max(0, stretch.from - imported.length) : Math.max(0, lines.length - threadShown);
  const lastLine = stretch ? Math.min(lines.length, Math.max(0, stretch.to - imported.length)) : lines.length;
  const later = stretch ? Math.max(0, total - stretch.to) : 0;
  useEffect(() => {
    // Earlier SMS that came, as asked, are drawn too.
    const asked = smsAsked.current;
    if (asked !== null && lines.length > asked) {
      smsAsked.current = null;
      setThreadShown((count) => count + lines.length - asked);
      setStretch((drawn) => drawn && { ...drawn, to: drawn.to + lines.length - asked });
    }
    // The chat opened at a message (a starred one, or one found) earlier than the lines drawn.
    const wanted = goal.current;
    const index = wanted ? lines.findIndex((line) => line.kind === 'chat' && line.message.tag === wanted) : -1;
    if (index >= 0 && index < firstLine) setThreadShown(lines.length - index + THREAD_PAGE / 2);
  }, [lines, firstLine]);
  // The messages pinned to the top, the latest first, and the one that shows.
  const pins = visible.filter((m) => m.pinned).sort((a, b) => b.pinned! - a.pinned!);
  const pinnedNow = pins.length > 0 ? pins[pinShown % pins.length] : null;
  const starredHere = visible.filter((m) => m.starred).reverse();
  // What was imported, as the search looks through it: its words, or a file's name.
  const importedFindables = useMemo(
    () =>
      imported.map(({ at, mine, text, files }, i): Findable => ({
        peer: selected ?? '',
        tag: importedTag(i),
        at,
        mine,
        text,
        ...(!text && files[0] ? { file: { kind: files[0].kind, name: files[0].name } } : {}),
      })),
    [imported, selected],
  );
  const hits = searching ? searchMessages([...visible, ...smsFindables(selected ?? '', chatSms.messages), ...importedFindables], searching) : [];
  // Goes to what the search found, the `n`th from the latest.
  const goToHit = (n: number) => {
    const hit = hits[n];
    if (!hit) return;
    setSearchAt(n);
    holdScroll.current = true;
    goTo(hit.peer, hit.tag);
  };
  // The photos drawn, of the thread and of what was imported, by their file's id: those laid out
  // near what shows are read too, so a chat shows its photos as it is scrolled, as they were.
  const drawnPhotos = useMemo(() => {
    const files = new Map<string, FileRef>();
    for (const line of lines.slice(firstLine, lastLine)) {
      const file = line.kind === 'chat' ? line.message.file : undefined;
      if (file?.kind === 'photo' && !file.from && !file.once) files.set(file.id, file);
    }
    if (firstLine === 0) for (const { files: its } of imported.slice(firstImported, importedEnd)) for (const file of its) if (file.kind === 'photo') files.set(file.id, file);
    return files;
  }, [lines, imported, firstLine, lastLine, firstImported, importedEnd]);
  const drawnPhotosNow = useRef(drawnPhotos);
  drawnPhotosNow.current = drawnPhotos;
  // Which of them are near what shows, a moment after the thread is scrolled or laid out.
  const lookNear = () => {
    if (nearTimer.current) return;
    nearTimer.current = setTimeout(() => {
      nearTimer.current = null;
      const { offset, seen } = readAt.current;
      const room = seen || 800;
      const middle = offset + room / 2;
      const near = [...photoAt.current]
        .filter(([id, y]) => drawnPhotosNow.current.has(id) && Math.abs(y - middle) < room * 1.5)
        .sort((one, other) => Math.abs(one[1] - middle) - Math.abs(other[1] - middle))
        .slice(0, NEAR_PHOTOS)
        .map(([id]) => id)
        .sort();
      setNearPhotos((now) => (now.join() === near.join() ? now : near));
    }, 200);
  };
  useEffect(() => () => clearTimeout(nearTimer.current ?? undefined), []);
  // The photos shown: the latest photos and stickers in the thread, those near what shows, and the
  // one looked at on its own.
  const shownPhotos = shownOf(visible.flatMap((m) => (m.file ? [m.file] : [])));
  for (const id of nearPhotos) {
    const file = drawnPhotos.get(id);
    if (file && !shownPhotos.some((shown) => shown.id === id)) shownPhotos.push(file);
  }
  if (viewing?.file?.kind === 'photo' && !viewing.file.from) shownPhotos.push(viewing.file);
  if (viewingImported?.kind === 'photo') shownPhotos.push(viewingImported);
  // Each read into memory to show it (components/attachment.tsx), and read again once a file of
  // chats shared came whole (lib/share-rounds.ts).
  const photos = useShownPhotos(shownPhotos, (error) => setNote(t('Cannot show the photo. {error}', { error: errorText(error) })), filesTick);
  // The chat on the screen, or the hidden place open: what comes there only sounds (lib/background.ts).
  const focused = useIsFocused();
  // Where the link says this chat reads on Nostr, so that who adds it with no relay between the two
  // writes there (lib/e2e.ts linkNostr): asked again each time the chat shows, as the Tor and Nostr
  // settings may have changed meanwhile.
  const [linkNostr, setLinkNostr] = useState<NostrCode | null>(null);
  useEffect(() => {
    if (!linkE2E || !focused) return;
    let active = true;
    linkE2E
      .linkNostr()
      .then((code) => active && setLinkNostr((was) => (was?.k === code?.k && was?.r.join(' ') === code?.r.join(' ') ? was : code)))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [linkE2E, focused]);
  // Read again each time these hidden chats show, as Settings may have changed meanwhile.
  useEffect(() => {
    if (!hiddenKey || !canRingInBackground || !focused) return;
    let active = true;
    Promise.all([loadRingInBackground(), loadMessageNotices()])
      .then(([on, notices]) => active && setBackground({ on, notices }))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [hiddenKey, focused]);
  const onScreen = !shown || !focused || gated ? null : hiddenKey ? screenOfHidden(pocket) : selectedIdentity ? screenOfChat(selectedIdentity) : null;
  useEffect(() => (onScreen ? showOnScreen(onScreen) : undefined), [onScreen]);
  const importedFrom = [...new Set(imported.map((m) => SOURCE_LABELS[m.source]))].join(` ${t('and')} `);
  // In an imported group, each message says who wrote it.
  const importedGroup = useMemo(() => new Set(imported.filter((m) => !m.mine && m.sender).map((m) => m.sender)).size > 1, [imported]);
  // A contact without a name shows as the imported chat that goes on with them.
  const shownContacts = useMemo(
    () => contacts.map((c) => (c.name || !archive ? c : { ...c, name: cleanName(archive.linkedChats(c.identity)[0]?.title ?? '') })),
    [contacts, archive],
  );
  const chips = contacts.map((contact) => `${CONTACT_PREFIX}${contact.identity}`);
  // The place's own Matrix, XMPP and Nostr chats (lib/place-networks.ts) join the list as the space's
  // join home's (app/index.tsx), while these hidden chats are open: their accounts load with them.
  const [placeNetTick, setPlaceNetTick] = useState(0);
  useEffect(() => {
    if (!hiddenKey) return;
    const tick = () => setPlaceNetTick((n) => n + 1);
    const stops = [onMatrixChange(tick), onXmppChange(tick), onNostrDmChange(tick), onTelegramChange(tick)];
    return () => stops.forEach((stop) => stop());
  }, [hiddenKey]);
  const placeMatrix = hiddenKey ? matrixNow('place').state : null;
  const placeXmpp = hiddenKey ? xmppNow('place').state : null;
  const placeNostr = hiddenKey ? nostrDmNow('place').state : null;
  const placeTelegram = hiddenKey ? telegramNow('place').state : null;
  // Hidden chats listed as home lists the space's (app/index.tsx), their groups and their networks'
  // chats among them: the newest first, with what was said last and how many are not read. None is
  // locked with a PIN of its own in them.
  const placeRows = useMemo(() => {
    if (!hiddenKey) return [];
    const name = (identity: string) => memberName(identity, shownContacts);
    let all = mergeRows(
      buildInbox(
        shownContacts.map((c) => ({ ...c, locked: false })),
        messages,
        archive?.chats() ?? [],
        Date.now(),
      ),
      // And their groups, with no PIN of their own either.
      groupRows(
        placeGroupList.map((g) => ({ ...g, locked: false })),
        name,
        (text) => noteText(text, name),
      ),
    );
    if (placeMatrix) all = mergeRows(all, matrixInboxRows(placeMatrix));
    if (placeXmpp) all = mergeRows(all, xmppInboxRows(placeXmpp));
    if (placeNostr) all = mergeRows(all, nostrInboxRows(placeNostr));
    if (placeTelegram) all = mergeRows(all, telegramInboxRows(placeTelegram, (m) => telegramShown(m.chatId, m, 'place')));
    // And the chats of the space's own Telegram kept here (telegramHideChat).
    const kept = hiddenKey ? telegramKeptChats() : [];
    const spaceTelegram = kept.length ? telegramNow('space').state : null;
    if (spaceTelegram) all = mergeRows(all, telegramKeptRows(spaceTelegram, kept, (m) => telegramShown(m.chatId, m, 'space')));
    return all;
  }, [hiddenKey, shownContacts, messages, archive, archiveTick, now, placeGroupList, placeMatrix, placeXmpp, placeNostr, placeTelegram, placeNetTick]);
  // The order of these chats' list, or of the space's, kept where they are (lib/chat-list.ts): in
  // hidden chats, pinned ones at the top and archived ones apart, as home has the space's.
  const chatListPlace = useMemo<ChatListPlace>(() => {
    const { space, key } = currentSpace();
    return hiddenKey ? { holder: hiddenHolder(pocket), space, key: hiddenKey, pocket } : { holder: 'space', space, key };
  }, [hiddenKey, pocket]);
  const placeOrdered = useArrangedChats(hiddenKey ? placeRows : null, hiddenKey ? chatListPlace : null);
  const [placeArchive, setPlaceArchive] = useState(false);
  const [placeTarget, setPlaceTarget] = useState<InboxRow | null>(null);
  const selectedContact = selected?.startsWith(CONTACT_PREFIX) ? selected : null;
  // A message request's first messages, looked at on this phone for what often comes with a scam
  // (lib/scam-shield.ts): only a word of care, nothing is blocked.
  const requestOf = selectedContact ? contacts.find((c) => c.request && `${CONTACT_PREFIX}${c.identity}` === selectedContact) : undefined;
  const requestSigns = requestOf
    ? scamSigns(
        messages.filter((m) => m.peer === selectedContact && !m.mine).slice(0, SCAM_LOOKED).map((m) => m.text),
        requestOf.said || requestOf.name,
        contacts.filter((c) => !c.request && c.identity !== requestOf.identity).map((c) => c.name),
      )
    : [];
  // Photos and files picked in the Collection for this chat ("+" → Collection, app/collection.tsx
  // with `to`), sent one after the other as the chat shows again.
  useEffect(() => {
    if (!focused || !e2e || !selectedContact) return;
    const peer = selectedContact;
    let sending = Promise.resolve();
    for (let shared = takeShared(peer); shared; shared = takeShared(peer)) {
      const one = shared;
      sending = sending.then(() => sendAttachment(isSharedPhoto(one) ? 'photo' : 'file', () => readShared(one), peer));
    }
  }, [focused, e2e, selectedContact]);
  const talkie = selectedContact ? talkies.has(selectedContact) : false;
  listening.current = shown && appActive && !gated ? selectedContact : null;
  const selectedTimer = contacts.find((c) => c.identity === selectedIdentity)?.timer ?? 0;
  const selectedShots = contacts.find((c) => c.identity === selectedIdentity)?.shots ?? false;
  // Under the note that it was added, while its chat shows and it has no name: given one in its details (Rename), it goes.
  const connectShown = shown && !!connecting && selected === `${CONTACT_PREFIX}${connecting}` && canConnect && !contacts.find((c) => c.identity === connecting)?.name;
  // As the thread nears the top of what shows: earlier messages drawn above what is read, the
  // thread's own first and then what was imported, and what is read stays where it is.
  const showEarlier = () => {
    if (growing.current || (firstLine === 0 && firstImported === 0)) return;
    growing.current = true;
    holdScroll.current = true;
    above.current = { ...readAt.current };
    if (stretch) setStretch({ ...stretch, from: Math.max(0, stretch.from - (stretch.from > imported.length ? THREAD_PAGE * 3 : IMPORTED_PAGE * 4)) });
    else if (firstLine > 0) setThreadShown((count) => count + THREAD_PAGE * 3);
    else setImportedShown((count) => count + IMPORTED_PAGE * 4);
  };
  // Where it was left shows for the arrow to it: none without such a place, out of sight if it is not drawn.
  spot.current = () => {
    const { peer, tag } = left.current;
    const id = peer && tag ? visible.find((m) => m.peer === peer && m.tag === tag)?.id : undefined;
    if (id === undefined) return undefined;
    const index = lines.findIndex((line) => line.kind !== 'sms' && line.message.id === id);
    return index < firstLine || index >= lastLine ? null : (placed.current.get(id) ?? null);
  };
  // To the thread's end, by itself: on the way it stays at the end and draws nothing more.
  const toEndBySelf = (animated: boolean) => {
    follow.current.go();
    atEnd.current = true;
    thread.current?.scrollToEnd({ animated });
    // On Android the scroll can run before the rows that grew the thread are on screen, and stop at
    // the end of what was there before: once more a frame later, unless the person took it meanwhile.
    if (!animated) {
      requestAnimationFrame(() => {
        if (atEnd.current && !above.current && !holdScroll.current) thread.current?.scrollToEnd({ animated: false });
      });
    }
  };
  // To the chat's start: the first of what was imported and of the thread are drawn, from the top.
  const toStart = () => {
    growing.current = true;
    setTimeout(() => (growing.current = false), 800);
    atEnd.current = false;
    thread.current?.scrollTo({ y: 0, animated: firstLine === 0 && firstImported === 0 });
    if (firstLine === 0 && firstImported === 0) return;
    holdScroll.current = true;
    setStretch({ from: 0, to: Math.min(total, THREAD_PAGE) });
  };
  // To the chat's end: drawn to it again, if it was read from the start, and gone to.
  const toEnd = () => {
    growing.current = true;
    setTimeout(() => (growing.current = false), 800);
    holdScroll.current = false;
    if (stretch) {
      setStretch(null);
      setThreadShown(THREAD_PAGE);
      setImportedShown(IMPORTED_PAGE);
    }
    toEndBySelf(!stretch);
  };
  // Read away from the end: more of what came after, and drawn to the end once that reaches it.
  const showLater = () => {
    if (growing.current || !stretch) return;
    growing.current = true;
    holdScroll.current = true;
    const to = stretch.to + THREAD_PAGE * 3;
    if (to < total) {
      setStretch({ ...stretch, to });
      return;
    }
    setStretch(null);
    setThreadShown(lines.length - firstLine);
    setImportedShown(imported.length - firstImported);
  };
  // What is written here shows at the thread's end: read from the start, the thread goes back there.
  const newest = lines[lines.length - 1];
  const newestMine = newest?.mine ? (newest.kind === 'sms' ? smsLineId(newest.sms) : newest.message.id) : null;
  useEffect(() => {
    if (newestMine !== null) setStretch(null);
  }, [newestMine]);
  // Without a relay queue the link has only the keys, and where it reads on Nostr: who adds it
  // reaches this phone nearby, or there.
  const ownLink = !linkE2E
    ? null
    : linkHere()
      ? linkHere()
      : ownQueue
      ? contactLink({
          // The queue the link names, which a deletion or a block leaves as it is (lib/queue-move.ts),
          // and while that is the own queue, its backup queue: the one that moves with the own one
          // goes in no link, as the own one does not.
          senderHex: (linkQueue ?? ownQueue).senderHex,
          relayUrl: relayUrl.trim(),
          key: toBase64Url(linkE2E.bundle),
          relayKey: ownRelayKey || undefined,
          spare: linkSpare(linkQueue?.senderHex ?? '', ownQueue.senderHex, spareCode(linkE2E.spare())),
          lend: ownTicket || undefined,
          nostr: linkNostr || undefined,
        })
      : hiddenKey && !linkNostr
        ? null
        : contactLink({ senderHex: '', relayUrl: '', key: toBase64Url(linkE2E.bundle), nostr: linkNostr ?? undefined });
  // A phone with no relay yet, in the space's chats: it starts with an invite, or by signing in,
  // and sees nothing of relays unless it sets one up itself.
  const newcomer = loaded && !hiddenKey && !accountLink() && !relayUrl.trim();
  // With a relay queue, this phone invites someone new (lib/welcome.ts).
  const canWelcome = !hiddenKey && !accountLink() && !!relayUrl.trim() && !!ownQueue && !!ownLink;
  // The contact card, for the space's own chats on the phone: a one-time one, new each time My link
  // or My QR code opens; the first to answer it is a contact at once, anyone after writes a request.
  const cardsHere = canWelcome;
  // The small QR code goes by touching phones too, while it shows (lib/nfc-share.ts).
  // My link, a page of New chat, shows the QR code itself, as My QR code does.
  const qrHere = (showQr || (!selected && door === 'link' && !shownGroup)) && shown;
  const cardNfc = useNfcShare(qrHere && card && !bigQr ? card : null);
  // The one-time card of this opening of My link: made once, the same while it stays open.
  const cardOnce = useRef({ secret: '' });
  useEffect(() => {
    if (!qrHere) cardOnce.current = { secret: '' };
  }, [qrHere]);
  useEffect(() => {
    if (!qrHere || !cardsHere) return;
    let on = true;
    void contactCard(linkE2E?.invitedAs() ?? '', cardOnce.current)
      .then((made) => {
        if (on) setCard(made);
      })
      .catch(() => undefined);
    return () => {
      on = false;
    };
  }, [qrHere, cardsHere, ownQueue, relayUrl, linkE2E]);
  // How this phone reaches its contacts now, said at the top of New chat.
  const reached = connectReach({
    linked: !!linkHere(),
    relayUrl,
    queue: !!ownQueue,
    hidden: !!hiddenKey,
    nostr: !!linkNostr,
    nearby: HAS_LINKS,
    lent: isLentToken(relayToken),
    via: !!viaUrl.trim(),
  });
  // Adding someone by what they gave: their contact link or an invite, pasted, or read from a
  // photo of its QR code.
  // `camera` false where the big Scan above already takes the photo (MeetWays).
  const addTheirsWith = (camera: boolean) => (
    <>
      {/* In hidden chats too: they stay open while a photo is taken or picked (lib/picking.ts). */}
      <Row wrap>
        {camera && CAN_TAKE_PHOTOS ? <Button title={t('Take a photo of the QR code')} compact onPress={() => void addFromQr('camera')} /> : null}
        <Button title={t('Choose a photo of the QR code')} kind="secondary" compact onPress={() => void addFromQr('photos')} />
      </Row>
      <Row>
        <Input
          value={contactDraft}
          onChangeText={setContactDraft}
          placeholder={t('Paste their contact link or invite')}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.grow}
        />
        <Button title={t('Add')} compact onPress={() => addContact()} />
      </Row>
    </>
  );
  const addTheirs = addTheirsWith(true);
  // What is typed at the top of New chat (#12): a contact link or an invite to add, or a name to find
  // among the faces under it.
  const findTyped = contactDraft.trim();
  const draftIsLink = findTyped.includes('://') || findTyped.length > 40;
  const faceChips = findTyped && !draftIsLink ? chips.filter((peer) => (contactName(peer, shownContacts) ?? '').toLowerCase().includes(findTyped.toLowerCase())) : chips;

  const selectedName = selected ? label(selected, shownContacts) : '';
  const selectedOnline = !!selectedIdentity && !selectedHidden && !!e2e && e2e.onlineUntil(selectedIdentity, now) > 0;
  const selectedNearby = !!selectedIdentity && (hiddenKey ? !!nearHeard.current?.isNear(selectedIdentity) : nearby.isNear(selectedIdentity));
  const selectedTyping = !!selected && !selectedHidden && (typing[selected] ?? 0) > Date.now();
  // When they were last open, as they said, while they do not show online (lib/last-seen.ts).
  const selectedSeen = !!selectedIdentity && !!e2e && !selectedOnline ? e2e.lastSeen(selectedIdentity) : 0;
  const subtitle = selectedContact
    ? selectedTyping
      ? t('typing…')
      : selectedOnline
        ? selectedNearby
          ? t('Online · nearby')
          : t('Online')
        : selectedNearby
          ? t('Nearby · end-to-end encrypted')
          : selectedSeen
            ? lastSeenText(selectedSeen, now)
          : selectedTimer
            ? t('End-to-end encrypted · {time} after read', { time: timerLabel(selectedTimer) })
            : t('End-to-end encrypted')
    : '';

  // The bar under the name says less: whether they are typing, online or near, or that it is encrypted
  // (with the stopwatch beside it when the chat's messages disappear). All of it is read out.
  const headerSays = selectedTyping
    ? t('typing…')
    : selectedOnline
      ? selectedNearby
        ? t('Online · nearby')
        : t('Online')
      : selectedNearby
        ? t('Nearby')
        : selectedSeen
          ? lastSeenText(selectedSeen, now)
          : t('Encrypted');

  // What "+" opens under the message bar: what can be sent, as tiles, then how the next message
  // goes, as rows. "Send as SMS" (a chat whose contact has a phone number linked) goes last of the
  // rows and of the send arrow's menu, a plain grey tile, as it is the one way not end-to-end encrypted.
  const tiles: ComposerTile[] = [{ key: 'photo', title: t('Photo'), icon: 'photo', onPress: () => sendPhoto('photos') }];
  if (CAN_TAKE_PHOTOS) tiles.push({ key: 'camera', title: t('Camera'), icon: 'camera', onPress: () => sendPhoto('camera') });
  tiles.push(
    { key: 'hidden-photo', title: t('Hidden photo'), icon: 'photo', onPress: () => sendPhoto('photos', true) },
    { key: 'once-photo', title: t('Photo to see once'), icon: 'photo', onPress: () => sendPhoto('photos', true, true) },
    ...(CAN_TAKE_PHOTOS ? [{ key: 'once-camera', title: t('Camera, to see once'), icon: 'camera' as const, onPress: () => sendPhoto('camera', true, true) }] : []),
    { key: 'file', title: t('File'), icon: 'file', onPress: sendPickedFile },
  );
  // From the Collection: the photos and files kept encrypted in this space, or in these hidden chats.
  if (CAN_COLLECT && modules.has('collection') && selectedContact) {
    const to = selectedContact;
    tiles.push({ key: 'collection', title: t('Collection'), icon: 'collection', onPress: () => afterSheet(() => router.push(`/collection?to=${encodeURIComponent(to)}${hiddenKey ? '&hidden=1' : ''}`)) });
  }
  tiles.push(
    { key: 'sticker', title: t('Sticker'), icon: 'sticker', onPress: () => afterSheet(() => setStickering(true)) },
  );
  if (CAN_PLACE) tiles.push({ key: 'place', title: t('Location'), icon: 'place', onPress: () => afterSheet(() => setPlacing(true)) });
  tiles.push({ key: 'poll', title: t('Poll'), icon: 'poll', onPress: () => afterSheet(() => setPolling(true)) });
  tiles.push({ key: 'card', title: t('Contact card'), icon: 'contact', onPress: () => afterSheet(() => setSharingCard(true)) });
  const ways: ComposerWay[] = selectedContact
    ? [
        {
          key: 'vanish',
          title: t('Disappearing message'),
          description: t('Deleted once it is read'),
          icon: 'timer',
          value: vanishing ? timerLabel(vanishFor) : t('Off'),
          // On, it shows over the field, with how long; the panel gives way to it.
          onPress: () => afterSheet(() => setVanishing(true)),
        },
        {
          key: 'talkie',
          title: t('Talkie'),
          description: t('Your voice plays as soon as it arrives'),
          icon: 'talkie',
          on: talkie,
          onPress: () => toggleTalkie(selectedContact),
        },
        {
          key: 'later',
          title: t('Send later'),
          description: t('Goes at the time you choose'),
          icon: 'later',
          value: laterFor !== null ? laterLabel(laterFor) : undefined,
          onPress: () => setChoosingLater(true),
        },
        {
          key: 'safety',
          title: t('Safety message'),
          description: t('Goes only if you do not open Erevos in time'),
          icon: 'later',
          onPress: () => setChoosingSafety(true),
        },
      ]
    : [];
  if (selectedContact && chatSms.number) {
    ways.push({
      key: 'sms',
      title: t('Send as SMS'),
      description: t('Not encrypted · {number}', { number: chatSms.number }),
      icon: 'sms',
      plain: true,
      onPress: () => (draft.text().trim() ? afterSheet(() => void sendAsSms()) : setNote(t('Type the message first, then send it as an SMS.'))),
    });
  }
  // Held down, the send arrow: what is typed goes without a sound, later, or disappearing.
  const sendWays: SendWay[] = [
    {
      key: 'quiet',
      title: t('Without sound'),
      icon: 'quiet',
      hint: t('Their phone shows it without a sound or vibration. Erevos as a web app cannot tell, nor can the notice of chats that are closed (hidden chats, another space), and these sound as usual.'),
      onPress: () => void send(undefined, true),
    },
    {
      key: 'later',
      title: t('Later…'),
      icon: 'later',
      hint: t('Choose when it goes'),
      onPress: () => {
        setChoosingLater(true);
        setAttaching(true);
      },
    },
    {
      key: 'vanish',
      title: t('Disappear'),
      icon: 'timer',
      hint: t('Choose how long it stays once read, then send'),
      onPress: () => setVanishing(true),
    },
  ];
  if (selectedContact && chatSms.number) {
    sendWays.push({
      key: 'sms',
      title: t('As SMS'),
      icon: 'sms',
      hint: t('A plain SMS to {number}, not encrypted', { number: chatSms.number }),
      onPress: () => void sendAsSms(),
    });
  }

  const selectedLook = contacts.find((c) => c.identity === selectedIdentity)?.look ?? null;
  const selectedLocked = contacts.some((c) => c.identity === selectedIdentity && c.locked);
  const selectedNotify = contacts.find((c) => c.identity === selectedIdentity)?.notify ?? null;
  // Whom SMS is on for when nothing else works (lib/sms-way.ts), read as the details open.
  const [smsWay, setSmsWay] = useState<{ all: boolean; some: readonly string[] } | null>(null);
  const canSmsWay = !hiddenKey && !!linkedPhone && smsPacketsReady();
  useEffect(() => {
    if (!details || !canSmsWay) return;
    let live = true;
    void spaceSmsLink()
      .then(async (link) => {
        await link.refresh();
        if (live) setSmsWay(link.smsWay);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [details, canSmsWay]);
  const selectedSmsWay = !!smsWay && !!selectedIdentity && (smsWay.all || smsWay.some.includes(selectedIdentity));
  // A chat opened with its PIN keeps out of screenshots and the recent apps preview, as hidden chats do.
  const pinOpen = shown && !hiddenKey && selectedLocked && !gated;
  useEffect(() => {
    if (!pinOpen) return;
    keepPrivate('chat', true);
    return () => keepPrivate('chat', false);
  }, [pinOpen]);
  // A chat either phone set to block screenshots keeps out of them, and of the recent apps preview,
  // while it shows (Contact.shots): Android only, as lib/screen-privacy.ts says.
  const shotsBlocked = shown && !!selectedContact && selectedShots;
  useEffect(() => {
    if (!shotsBlocked) return;
    keepPrivate('shots', true);
    return () => keepPrivate('shots', false);
  }, [shotsBlocked]);
  const selectedAvatar = contacts.find((c) => c.identity === selectedIdentity)?.avatar ?? null;
  const said = contacts.find((c) => c.identity === selectedIdentity)?.said ?? '';
  const ownName = contacts.find((c) => c.identity === selectedIdentity)?.ownName ?? '';
  const signAvatar = selectedAvatar?.kind === 'emoji' ? selectedAvatar : null;
  // A group or Chat with myself shown here tells its own look itself, and once it closes the chat
  // tells this one's again.
  const ownChat = (myselfShown && !!notesAt) || (!!shownGroup && !!placeWhere);
  useEffect(() => {
    if (!shown || ownChat) return;
    if (!e2e || !selectedIdentity) {
      onLook(null);
      return;
    }
    onLook({
      look: selectedLook,
      save: async (look) => {
        await e2e.setLook(selectedIdentity, look);
        setContacts(e2e.contacts());
      },
    });
  }, [shown, ownChat, e2e, selectedIdentity, selectedLook, onLook]);

  // Undo shows just above the thread's end.
  const measured = (change: Partial<typeof edges.current>) => {
    edges.current = { ...edges.current, ...change };
    setUndoAt(Math.max(0, edges.current.height - edges.current.end));
  };

  // What the back arrow and a swipe to the right do: from a page of New chat to its first one, out
  // of a chat to the list of them when it was opened from there, out of hidden chats closes them,
  // else the screen before.
  const goBack = doorBack
    ? leaveDoor
    : selected && (hiddenKey || !initial)
      ? () => setSelected(null)
      : hiddenKey && onHidden
        ? onHidden
        : () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (myselfShown && notesAt) {
    return (
      <SwipeBack onBack={() => setMyselfShown(false)}>
        <MyselfChat at={notesAt} onBack={() => setMyselfShown(false)} onLook={onLook} />
      </SwipeBack>
    );
  }

  if (shownGroup && placeWhere) {
    return (
      <SwipeBack onBack={() => setShownGroup(null)}>
        <GroupsWhereProvider value={placeWhere}>
          <GroupChat id={shownGroup} onBack={() => setShownGroup(null)} onLook={onLook} />
        </GroupsWhereProvider>
      </SwipeBack>
    );
  }

  // The relay's address and token, a second relay and invites to it: under For advanced users.
  const relayFields = () => (
    <View style={styles.section}>
      <Text variant="caption" tone="muted">
        {t('A relay of your own, or one whose address and token you were given. Most people need none of this.')}
      </Text>
      <Field label={t('Relay address')}>
        <Input
          value={typedRelay.shown}
          onChangeText={typedRelay.type}
          onBlur={typedRelay.done}
          placeholder="ws://computer-address:7879"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </Field>
      {isLentToken(relayToken) ? (
        <Text variant="caption" tone="muted">
          {t("A place lent on this relay through a contact's link: no token of your own is needed. Type another relay to use that one instead.")}
        </Text>
      ) : (
        <Field label={t('Token (optional)')}>
          <Input
            value={typedToken.shown}
            onChangeText={typedToken.type}
            onBlur={typedToken.done}
            placeholder={t('Token, if the relay needs one')}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
        </Field>
      )}
      {!hiddenKey && relayUrl.trim() ? (
        <RelaySignIn
          url={relayUrl.trim()}
          token={relayToken.trim()}
          onToken={(token, name) => void tookToken(relayUrl.trim(), token, name)}
          onNote={setNote}
        />
      ) : null}
      {!hiddenKey && relayUrl.trim() && relayToken.trim() && !isLentToken(relayToken) ? (
        <RelayInvites relay={{ url: relayUrl.trim(), token: relayToken.trim() }} e2e={e2e} onNote={setNote} />
      ) : null}
      <Field label={t('Second relay (optional)')}>
        <Input
          value={typedVia.shown}
          onChangeText={typedVia.type}
          onBlur={typedVia.done}
          placeholder="wss://another-relay"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </Field>
      {typedVia.shown.trim() ? (
        <Field label={t('Second relay token (optional)')}>
          <Input
            value={typedViaToken.shown}
            onChangeText={typedViaToken.type}
            onBlur={typedViaToken.done}
            placeholder={t('Token, if the second relay needs one')}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
        </Field>
      ) : null}
      <Text variant="caption" tone="muted">
        {t("With a second relay, what you send goes through it first, sealed for your relay. Your relay then never sees your phone's address, and the second relay never sees who a message is for. Taking messages still goes straight to your relay.")}
      </Text>
      <Button title={t('Create my relay queue')} compact onPress={createOwnQueue} />
      {hiddenKey ? (
        <>
          <Field label={t('Home relay for these hidden chats (optional)')}>
            <Input
              value={homeUrl}
              onChangeText={setHomeUrl}
              placeholder="wss://relay.at-home.example"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </Field>
          {homeUrl.trim() ? (
            <Field label={t('Home relay token (optional)')}>
              <Input
                value={homeToken}
                onChangeText={setHomeToken}
                placeholder={t('Token, if the home relay needs one')}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </Field>
          ) : null}
          <Text variant="caption" tone="muted">
            {t("A second relay with a queue of their own, which contacts write to while your relay cannot be reached. It is kept with these hidden chats only, so the space knows nothing of it, and it is looked at while they are open. Use another one than the space's home relay.")}
          </Text>
          <Button title={t('Save home relay')} kind="secondary" compact onPress={() => void saveHome()} />
          {homeNote ? <Text variant="caption" tone="muted">{homeNote}</Text> : null}
        </>
      ) : null}
    </View>
  );

  return (
    <SwipeBack onBack={goBack}>
      <View style={styles.container} onLayout={(event) => measured({ height: event.nativeEvent.layout.height })}>
        <Modal visible={styling && shown} animationType="slide" statusBarTranslucent onRequestClose={() => setStyling(false)}>
          <ScreenBackdrop>
            <View style={{ flex: 1, backgroundColor: colors.ground }}>
              <AppearanceEditor
                title={selectedName ? t('Look of {name}', { name: selectedName }) : t('Look of this chat')}
                top={
                  <View style={styles.section}>
                    <Text variant="caption" tone="muted">
                      {selectedLook
                        ? t('This chat has its own look, kept only on this phone. The rest of the app keeps its own.')
                        : t("This chat follows the app's look. Change anything below to give it its own.")}
                    </Text>
                    <Row wrap>
                      <Button title={t('Done')} compact onPress={() => setStyling(false)} />
                      {selectedLook && e2e ? (
                        <TextButton
                          title={t('Same as the app')}
                          onPress={() => {
                            void e2e.setLook(selectedIdentity, null).then(() => setContacts(e2e.contacts()));
                          }}
                        />
                      ) : null}
                    </Row>
                  </View>
                }
              />
            </View>
          </ScreenBackdrop>
        </Modal>
        <Modal
          visible={details && shown && !!selected}
          animationType="slide"
          statusBarTranslucent
          onRequestClose={() => setDetails(false)}
        >
          <ScreenBackdrop>
            <SwipeBack onBack={() => setDetails(false)}>
              <View style={{ flex: 1, backgroundColor: colors.ground }}>
                <View style={styles.sheetBar}>
                  <BackButton onPress={() => setDetails(false)} />
                  <Text variant="heading" style={styles.grow}>
                    {t('Details')}
                  </Text>
                  <TextButton title={t('Done')} onPress={() => setDetails(false)} />
                </View>
                <KeyboardAwareScrollView
                  contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + space.xl }]}
                  keyboardShouldPersistTaps="handled"
                  bottomOffset={space.xl}
                >
                  <View style={styles.hero}>
                    <Pressable
                      onPress={selectedContact ? () => setOpened((now) => (now === 'picture' ? null : 'picture')) : undefined}
                      accessibilityRole={selectedContact ? 'button' : undefined}
                      accessibilityLabel={selectedContact ? t('Change picture') : undefined}
                    >
                      {selectedContact ? (
                        <KeyFace identity={selectedIdentity} name={contactName(selectedContact, shownContacts) ?? ''} size={104} avatar={selectedAvatar} />
                      ) : null}
                      {selectedContact ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>✎</Text>
                        </View>
                      ) : null}
                    </Pressable>
                    <Text variant="title" numberOfLines={2} style={[styles.heroName, !contactName(selected ?? '', shownContacts) && styles.monoName]}>
                      {selectedName}
                    </Text>
                    <View style={styles.subtitle}>
                      {selectedContact ? <ShieldIcon color={colors.success} size={12} /> : null}
                      {selectedOnline ? <View style={[styles.onlineDot, { backgroundColor: colors.success }]} /> : null}
                      <Text variant="caption" tone="muted">
                        {subtitle}
                      </Text>
                    </View>
                  </View>
                  {selectedContact ? (
                    <>
                      <View style={styles.actions}>
                        <QuickAction title={t('Call')} sign="☏" onPress={() => {
                          setDetails(false);
                          void startCall(false);
                        }} />
                        <QuickAction title={t('Video')} sign="▶" onPress={() => {
                          setDetails(false);
                          void startCall(true);
                        }} />
                        <QuickAction title={t('Rename')} sign="✎" on={renaming === selectedContact} onPress={() => startRenaming(selectedContact)} />
                        <QuickAction title={t('Picture')} sign="☺" on={opened === 'picture'} onPress={() => setOpened((now) => (now === 'picture' ? null : 'picture'))} />
                      </View>
                      {renaming === selectedContact ? (
                        <View style={styles.group}>
                          <Text variant="caption" tone="muted">
                            {t('A name for them, only on this phone.')}
                          </Text>
                          <Row>
                            <Input
                              value={nameDraft}
                              onChangeText={setNameDraft}
                              onSubmitEditing={() => void rename(selectedContact)}
                              placeholder={contacts.find((c) => `${CONTACT_PREFIX}${c.identity}` === selectedContact)?.said || t('Name')}
                              maxLength={MAX_NAME}
                              autoFocus
                              style={styles.grow}
                            />
                            <Button title={t('Save')} compact onPress={() => void rename(selectedContact)} />
                          </Row>
                        </View>
                      ) : null}
                      {said && said !== ownName ? (
                        <Text variant="caption" tone="muted">
                          {t('Calls themselves: {name}', { name: said })}
                        </Text>
                      ) : null}
                      {opened === 'picture' ? (
                        <View style={styles.group}>
                          <Text variant="caption" tone="muted">
                            {t('A picture for them, only on this phone. Without one, their picture is drawn from their key.')}
                          </Text>
                          <View style={styles.signs}>
                            {AVATAR_SIGNS.map((emoji) => (
                              <Pressable
                                key={emoji}
                                onPress={() => void changeAvatar(selectedContact, { kind: 'emoji', emoji, color: signAvatar?.color ?? AVATAR_COLORS[5] })}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: signAvatar?.emoji === emoji }}
                                accessibilityLabel={emoji}
                                style={[styles.sign, signAvatar?.emoji === emoji && styles.signOn]}
                              >
                                <Text style={styles.signText}>{emoji}</Text>
                              </Pressable>
                            ))}
                          </View>
                          {signAvatar ? (
                            <View style={styles.signs}>
                              {AVATAR_COLORS.map((color) => (
                                <Pressable
                                  key={color}
                                  onPress={() => void changeAvatar(selectedContact, { ...signAvatar, color })}
                                  accessibilityRole="radio"
                                  accessibilityState={{ selected: signAvatar.color === color }}
                                  accessibilityLabel={t('Colour {color}', { color })}
                                  style={[styles.swatch, { backgroundColor: color }, signAvatar.color === color && styles.swatchOn]}
                                />
                              ))}
                            </View>
                          ) : null}
                          <Row wrap>
                            <Button title={t('Photo')} kind="secondary" compact onPress={() => void choosePhoto(selectedContact, 'photos')} />
                            {CAN_TAKE_PHOTOS ? <Button title={t('Take photo')} kind="secondary" compact onPress={() => void choosePhoto(selectedContact, 'camera')} /> : null}
                            {selectedAvatar ? <TextButton title={t('Picture from their key')} onPress={() => void changeAvatar(selectedContact, null)} /> : null}
                          </Row>
                        </View>
                      ) : null}
                      <Text variant="overline" tone="muted" style={styles.groupTitle}>
                        {t('Chat')}
                      </Text>
                      <View style={styles.group}>
                        <DetailRow
                          title={t('Search in this chat')}
                          onPress={() => {
                            setDetails(false);
                            setSearching('');
                            setSearchAt(0);
                          }}
                        />
                        <View style={styles.rule} />
                        <DetailRow
                          title={t('Media, links and files')}
                          value={media.length > 0 ? String(media.length) : ''}
                          onPress={() => {
                            setDetails(false);
                            setMediaOpen(true);
                          }}
                        />
                        <View style={styles.rule} />
                        <DetailRow
                          title={t('Go to a day')}
                          onPress={() => {
                            setDetails(false);
                            setDayPicking(true);
                          }}
                        />
                        <View style={styles.rule} />
                        <DetailRow
                          title={t('Disappearing messages')}
                          value={timerLabel(selectedTimer)}
                          open={opened === 'timer'}
                          onPress={() => setOpened((now) => (now === 'timer' ? null : 'timer'))}
                        />
                        {opened === 'timer' ? (
                          <View style={styles.rowMore}>
                            <Text variant="caption" tone="muted">
                              {t('New messages, sent or received, disappear from both phones this long after they are read. Messages already here stay.')}
                            </Text>
                            <Row wrap>
                              {TIMERS.map((timer) => (
                                <Chip key={timer} label={timerLabel(timer)} selected={timer === selectedTimer} onPress={() => void changeTimer(selectedContact, timer)} />
                              ))}
                            </Row>
                          </View>
                        ) : null}
                        <View style={styles.rule} />
                        <DetailRow title={t('Block screenshots')} checked={selectedShots} onPress={() => void changeShots(selectedContact, !selectedShots)} />
                        <Text variant="caption" tone="muted" style={styles.rowMore}>
                          {t('Screenshots and screen recordings of this chat are blocked on both phones, on Android. Either of you can turn it on or off. Erevos on an iPhone, on a computer, in a browser or on Sailfish cannot block them, and nothing stops a photo of the screen taken with another camera.')}
                          {selectedShots && !CAN_KEEP_PRIVATE ? ` ${t('Erevos here cannot block them.')}` : ''}
                        </Text>
                        {canNotifyChats ? (
                          <>
                            <View style={styles.rule} />
                            <DetailRow title={t('Notifications')} value={notifyValue(selectedNotify, !!hiddenKey)} onPress={() => setNotifying(true)} />
                          </>
                        ) : null}
                        {canSmsWay && smsWay ? (
                          <>
                            <View style={styles.rule} />
                            <DetailRow title={t('SMS when nothing else works')} checked={selectedSmsWay} onPress={() => void changeSmsWay(selectedContact, !selectedSmsWay)} />
                            <Text variant="caption" tone="muted" style={styles.rowMore}>
                              {t('Texts go by SMS to their number, end-to-end encrypted, only when the relay, Nostr, the phones nearby and LoRa all fail. Each costs SMS, and the phone company sees who wrote to whom, and when. Both phones need Erevos as the SMS app.')}
                            </Text>
                          </>
                        ) : null}
                        {/* Shown where there is no Tor too while it is on, turned on on the phone or another device, so it can be turned off. */}
                        {canTor() || selectedTor ? (
                          <>
                            <View style={styles.rule} />
                            <DetailRow title={t('Through Tor')} checked={selectedTor} onPress={() => void changeTor(selectedContact, !selectedTor)} />
                            <Text variant="caption" tone="muted" style={styles.rowMore}>
                              {!canTor()
                                ? t('This build of Erevos has no Tor, so this chat sends nothing from here while this is on. Turn it off here, or write from the phone.')
                                : selectedTor
                                  ? t('This chat goes only through Tor, on its own circuits, whatever the space’s Tor setting: the relay does not see your address for it. Slower, and it waits while Tor starts. Calls do not go through Tor.')
                                  : t('This chat goes as the space’s Tor setting says. Turn on to send it only through Tor.')}
                            </Text>
                          </>
                        ) : null}
                        {canChangeVoice() || selectedVoice ? (
                          <>
                            <View style={styles.rule} />
                            <Text variant="label">{t('Change my voice')}</Text>
                            <Row wrap>
                              <Chip label={t('Off')} selected={!selectedVoice} onPress={() => void changeVoice(selectedContact, null)} />
                              {VOICE_KINDS.map((kind) => (
                                <Chip key={kind} label={t(VOICE_NAMES[kind])} selected={selectedVoice === kind} onPress={() => void changeVoice(selectedContact, kind)} />
                              ))}
                            </Row>
                            <Text variant="caption" tone="muted" style={styles.rowMore}>
                              {selectedVoice
                                ? t('Your voice messages in this chat go with your voice changed: it is hard to know by ear, though someone with the recording and time could undo some of it. The walkie-talkie keeps your voice.')
                                : t('Your voice messages in this chat go with your own voice. Change it for someone who should not know your voice.')}
                            </Text>
                          </>
                        ) : null}
                        <View style={styles.rule} />
                        <DetailRow
                          title={t('Appear offline')}
                          checked={selectedHidden}
                          onPress={() => void changeHidden(selectedContact, !selectedHidden)}
                        />
                        <Text variant="caption" tone="muted" style={styles.rowMore}>
                          {selectedHidden
                            ? t('They do not see when you are online, nor that their messages came or were read, until you write. You do not see when they are online either.')
                            : t('They see when you are online, and which of their messages you read.')}
                        </Text>
                        <View style={styles.rule} />
                        <DetailRow title={t('Last seen')} checked={lastSeenOn} onPress={() => changeLastSeen(!lastSeenOn)} />
                        <Text variant="caption" tone="muted" style={styles.rowMore}>
                          {lastSeenOn && hiddenKey
                            ? t('Your contacts here see the exact time you last had these hidden chats open, and you see theirs. It goes end-to-end encrypted to them only, never to the relay. Only in these hidden chats, with a time of their own: the space’s chats have their own switch.')
                            : lastSeenOn
                              ? t('Your contacts see the exact time you last had Erevos open, and you see theirs. It goes end-to-end encrypted to them only, never to the relay. In all chats of this space; hidden chats have their own switch.')
                              : hiddenKey
                                ? t('No one here sees when you last had these hidden chats open, and you see no one’s here either. Those who saw it lose it with your next message.')
                                : t('No one sees when you last had Erevos open, and you see no one’s either. Those who saw it lose it with your next message.')}
                        </Text>
                        {lastSeenOn ? (
                          <>
                            <View style={styles.rule} />
                            <DetailRow title={t('Say when I open and close Erevos')} checked={tellOpenOn} onPress={() => changeTellOpen(!tellOpenOn)} />
                            <Text variant="caption" tone="muted" style={styles.rowMore}>
                              {tellOpenOn
                                ? t('As Erevos opens, the contacts you talked with in the last 30 days, who show their own time too, are told so at once, each after a random wait of up to a minute, at most every 15 minutes. As it closes, those told while it was open are told when it closed. The relay sees that something goes to them then, so it can tell when you open and close Erevos.')
                                : t('Your time goes only with what goes to your contacts anyway: a message, a mark that theirs came or was read, or an answer while they have your chat open. The relay learns nothing new.')}
                            </Text>
                          </>
                        ) : null}
                        {!hiddenKey ? (
                          <>
                            <View style={styles.rule} />
                            <DetailRow title={t('Lock with a PIN')} checked={selectedLocked} onPress={() => setPinAsk(selectedLocked ? 'off' : 'on')} />
                            <Text variant="caption" tone="muted" style={styles.rowMore}>
                              {selectedLocked
                                ? t('It opens only with its PIN, and locks again once you leave it. The list shows its name with a lock, nothing of its messages, and the search finds none of them.')
                                : t('A PIN of its own for this chat, asked each time it opens.')}
                            </Text>
                          </>
                        ) : selectedLocked ? (
                          <>
                            <View style={styles.rule} />
                            <Text variant="caption" tone="muted" style={styles.rowMore}>
                              {t('Its PIN asks nothing while it is in hidden chats, and asks again once it goes back to the chats.')}
                            </Text>
                          </>
                        ) : null}
                        {CAN_PREVIEW ? (
                          <>
                            <View style={styles.rule} />
                            <DetailRow title={t('Link previews')} checked={previews} onPress={() => changePreviews(!previews)} />
                            <Text variant="caption" tone="muted" style={styles.rowMore}>
                              {previewsTor
                                ? previews && hiddenKey
                                  ? t("When you send a link, this phone fetches its page through Tor and sends its title, a line and a small picture inside the message. The site does not see this phone's internet address. Only in the hidden chats of this place.")
                                  : previews
                                    ? t("When you send a link, this phone fetches its page through Tor and sends its title, a line and a small picture inside the message. The site does not see this phone's internet address. In all chats of this space, not in hidden chats.")
                                    : t("Links go as they are. Turned on, this phone fetches a link's page through Tor as you send it, so the site does not see this phone's internet address. The phone that gets it fetches nothing.")
                                : throughTor()
                                ? t('None while this space sends everything through Tor, unless they go through Tor too: turn on Through Tor below.')
                                : previews && hiddenKey
                                  ? t("When you send a link, this phone fetches its page straight from the site and sends its title, a line and a small picture inside the message. The site sees this phone's internet address. Only in the hidden chats of this place.")
                                : previews
                                  ? t("When you send a link, this phone fetches its page straight from the site and sends its title, a line and a small picture inside the message. The site sees this phone's internet address. In all chats of this space, not in hidden chats.")
                                  : t("Links go as they are. Turned on, this phone fetches a link's page as you send it, and the site sees this phone's internet address. The phone that gets it fetches nothing.")}
                            </Text>
                            <View style={styles.rowMore}>
                              <TorSwitch
                                on={previewsTor}
                                onChange={changePreviewsTor}
                                said={previewsTor ? t('Slower, and waits while Tor starts. A page that sends you on elsewhere, or that does not let Tor in, gets no preview.') : undefined}
                              />
                            </View>
                          </>
                        ) : null}
                        <View style={styles.rule} />
                        <DetailRow
                          title={t('Chat look')}
                          value={selectedLook ? t('Its own') : t('Same as the app')}
                          onPress={() => {
                            setDetails(false);
                            setStyling(true);
                          }}
                        />
                        <View style={styles.rule} />
                        <DetailRow
                          title={t('Starred messages')}
                          value={starredHere.length > 0 ? String(starredHere.length) : ''}
                          open={opened === 'starred'}
                          onPress={() => setOpened((now) => (now === 'starred' ? null : 'starred'))}
                        />
                        {opened === 'starred' ? (
                          <View style={styles.rowMore}>
                            {starredHere.length === 0 ? (
                              <Text variant="caption" tone="muted">
                                {t('No starred messages. Press and hold a message in a chat, then tap Star.')}
                              </Text>
                            ) : null}
                            {starredHere.map((m) => (
                              <Pressable
                                key={m.id}
                                onPress={() => {
                                  setDetails(false);
                                  setTimeout(() => goTo(m.peer, m.tag), 300);
                                }}
                                accessibilityRole="button"
                                style={({ pressed }) => [styles.found, pressed && { opacity: 0.6 }]}
                              >
                                <Text numberOfLines={2}>{messageLine(m)}</Text>
                                <Text variant="caption" tone="muted">
                                  {`${m.mine ? t('You') : selectedName} · ${dayLabel(m.at)} ${clock(m.at)}`}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        ) : null}
                        {!hiddenKey ? (
                          <>
                            <View style={styles.rule} />
                            <DetailRow title={t('Export chat')} onPress={() => void exportChat()} />
                          </>
                        ) : null}
                        {chatSms.number ? (
                          <>
                            <View style={styles.rule} />
                            <DetailRow
                              title={t('Plain SMS')}
                              value={chatSms.number}
                              onPress={() => {
                                setDetails(false);
                                setAttaching(false);
                                router.push(plainSmsHref(chatSms.number));
                              }}
                            />
                            <Text variant="caption" tone="muted" style={styles.rowMore}>
                              {t('The SMS with this number show in the chat too, marked SMS. This opens their SMS conversation, to write one when there is no internet, say. An SMS is not encrypted: the phone company can read it.')}
                            </Text>
                          </>
                        ) : null}
                      </View>
                      {archive && selectedIdentity ? (
                        <>
                          <Text variant="overline" tone="muted" style={styles.groupTitle}>
                            {t('Imported chats')}
                          </Text>
                          <View style={styles.group}>
                            {importedChats.map((chat) => {
                              const title = chat.title || SOURCE_LABELS[chat.source];
                              return (
                                <View key={chat.id} style={styles.importedChat}>
                                  <Text variant="bodyStrong">{title}</Text>
                                  <Text variant="caption" tone="muted">
                                    {SOURCE_LABELS[chat.source]}, {plural(chat.count, '{n} message', '{n} messages')}.{' '}
                                    {hiddenKey || chat.inChat ? t('Kept only in this chat.') : t('Also in Settings → Data and devices → Imported chats.')}
                                  </Text>
                                  <Row wrap>
                                    {/* Hidden chats' imports are in no list: they show only in their chat, or are deleted. */}
                                    {hiddenKey ? null : chat.inChat ? (
                                      <TextButton
                                        title={t('Show in Imported chats too')}
                                        onPress={() => void changeImported(() => archive.link(chat.id, selectedIdentity, false))}
                                      />
                                    ) : (
                                      <TextButton title={t('Keep only in the chat')} onPress={() => void changeImported(() => archive.link(chat.id, selectedIdentity, true))} />
                                    )}
                                    {hiddenKey ? null : (
                                      <TextButton
                                        title={t('Unlink')}
                                        onPress={() =>
                                          void changeImported(
                                            () => archive.link(chat.id, ''),
                                            t('It no longer shows in this chat. Settings → Data and devices → Imported chats keeps it.'),
                                          )
                                        }
                                      />
                                    )}
                                    <TextButton title={t('Delete')} onPress={() => removeImported(chat.id, title)} />
                                  </Row>
                                  <View style={styles.rule} />
                                </View>
                              );
                            })}
                            {sharing.length > 0 && !importFlow.found ? (
                              <DetailRow title={t('Share with {name}', { name: selectedName })} onPress={() => void shareImported()} />
                            ) : null}
                            {importFlow.found ? (
                              <FoundExport flow={importFlow} />
                            ) : (
                              <DetailRow title={t('Import a chat here')} value={importFlow.busy ? '…' : ''} onPress={() => void importFlow.pick()} />
                            )}
                            <Text variant="caption" tone="muted" style={styles.rowMore}>
                              {importSaid ||
                                t('A chat exported from Telegram, WhatsApp or Viber, to read here ahead of the new messages, with its photos, videos and voice messages. It stays on this phone, unless you share it with them: then it goes to them alone, end-to-end encrypted.')}
                            </Text>
                          </View>
                        </>
                      ) : null}
                      <Text variant="overline" tone="muted" style={styles.groupTitle}>
                        {t('Privacy')}
                      </Text>
                      <View style={styles.group}>
                        <DetailRow
                          title={t('Safety number')}
                          value={
                            (safety?.peer === selectedContact ? safety.verified : (e2e?.verifiedAt(selectedContact.slice(CONTACT_PREFIX.length)) ?? 0))
                              ? t('Checked in person')
                              : t('End-to-end encrypted')
                          }
                          open={safety?.peer === selectedContact}
                          onPress={() => void toggleSafety(selectedContact)}
                        />
                        {safety?.peer === selectedContact ? (
                          <View style={styles.rowMore}>
                            <Text variant="caption" tone="muted">
                              {t('Compare it with theirs, in person or on a call: if both phones show the same, no one is in between.')}
                            </Text>
                            <Text selectable variant="mono" style={styles.safety}>
                              {safety.number.split(' ').reduce((lines, group, i) => lines + (i === 0 ? '' : i % 4 === 0 ? '\n' : '  ') + group, '')}
                            </Text>
                            <Text variant="caption" tone={safety.verified ? undefined : 'muted'}>
                              {safety.verified
                                ? t('Checked in person on {day}, by the code on their phone.', { day: dayText(safety.verified) })
                                : t('Not checked in person yet.')}
                            </Text>
                            <Text variant="caption" tone="muted">
                              {t('Or check it with codes, side by side: take a photo of the code on their phone, and let them take one of this. Each phone marks the other once it matches; nothing is sent.')}
                            </Text>
                            <QrCode text={safety.code} size={180} />
                            <Row wrap>
                              {CAN_TAKE_PHOTOS ? (
                                <Button title={t('Take a photo of their code')} kind="secondary" compact onPress={() => void verifyFromQr(selectedContact, 'camera')} />
                              ) : null}
                              <Button title={t('Choose a photo of their code')} kind="secondary" compact onPress={() => void verifyFromQr(selectedContact, 'photos')} />
                              {safety.verified ? (
                                <TextButton title={t('Take the mark off')} onPress={() => void unverify(selectedContact)} />
                              ) : null}
                            </Row>
                            {safety.note ? (
                              <Text variant="caption" tone="muted">
                                {safety.note}
                              </Text>
                            ) : null}
                            {safety.devices > 0 ? (
                              <Text variant="caption" tone="muted">
                                {t('The list of their linked devices last changed on {day}. Your messages go to each place in it too, used by a device or not. If they did not link or unlink one then, ask them.', { day: dayText(safety.devices) })}
                              </Text>
                            ) : null}
                          </View>
                        ) : null}
                        <View style={styles.rule} />
                        <DetailRow
                          title={t('Introduce to a contact')}
                          open={introducing !== null}
                          onPress={() => {
                            setIntroducing((now) => (now === null ? '' : null));
                            setIntroNote('');
                          }}
                        />
                        {introducing !== null ? (
                          <View style={styles.rowMore}>
                            <Text variant="caption" tone="muted">
                              {t('Choose whom to introduce them to. Each is asked in your chat with them, and sees the name you gave the other; they become contacts only if both say yes. Neither learns whether the other said no.')}
                            </Text>
                            <ContactPicker
                              contacts={contacts
                                .filter((c) => !c.request && `${CONTACT_PREFIX}${c.identity}` !== selectedContact)
                                .map((c) => ({ identity: c.identity, name: c.name }))}
                              chosen={new Set(introducing ? [introducing] : [])}
                              onToggle={(identity) => setIntroducing((now) => (now === identity ? '' : identity))}
                            />
                            {introducing ? <Button title={t('Ask both')} compact onPress={() => void startIntro(selectedContact, introducing)} /> : null}
                          </View>
                        ) : null}
                        {e2e && introTick >= 0
                          ? introsMade(e2e, selectedContact.slice(CONTACT_PREFIX.length)).map((made) => (
                              <Text key={made.i} variant="caption" tone="muted" style={styles.rowMore}>
                                {made.end === 'went'
                                  ? t('{a} and {b}: both said yes.', { a: label(`${CONTACT_PREFIX}${made.a}`, contacts), b: label(`${CONTACT_PREFIX}${made.b}`, contacts) })
                                  : made.end === 'no'
                                    ? t('{a} and {b}: one said no.', { a: label(`${CONTACT_PREFIX}${made.a}`, contacts), b: label(`${CONTACT_PREFIX}${made.b}`, contacts) })
                                    : t('{a} and {b}: waiting for their answers.', { a: label(`${CONTACT_PREFIX}${made.a}`, contacts), b: label(`${CONTACT_PREFIX}${made.b}`, contacts) })}
                              </Text>
                            ))
                          : null}
                        {introNote ? (
                          <Text variant="caption" tone="muted" style={styles.rowMore}>
                            {introNote}
                          </Text>
                        ) : null}
                        {!hiddenKey ? (
                          <>
                            <View style={styles.rule} />
                            <DetailRow
                              title={t('Move to hidden chats')}
                              open={opened === 'move'}
                              onPress={() => {
                                setOpened((now) => (now === 'move' ? null : 'move'));
                                setMoveNote('');
                                setStartingNew(false);
                                setNewPocket(null);
                              }}
                            />
                            {opened === 'move' ? (
                              <View style={styles.rowMore}>
                                <Text variant="caption" tone="muted">
                                  {t('The chat leaves this list and goes into the hidden chats, sealed with their PIN. To open them, type the PIN in the search on the home screen and press Enter. Nothing shows that they exist.')}
                                </Text>
                                <Input
                                  value={pinDraft}
                                  onChangeText={(text) => {
                                    setPinDraft(text);
                                    setMoveNote('');
                                  }}
                                  placeholder={t('PIN of the hidden chats, {n} or more characters', { n: MIN_PIN })}
                                  secureTextEntry
                                  autoCapitalize="none"
                                  autoCorrect={false}
                                  onSubmitEditing={() => !startingNew && void moveToHidden(selectedContact, pinDraft, null)}
                                />
                                {weakNewPin ? (
                                  <Text variant="caption" tone={weakPinSeen === pinDraft ? undefined : 'muted'} color={weakPinSeen === pinDraft ? colors.danger : undefined}>
                                    {t(WEAK_SECRET)}
                                  </Text>
                                ) : null}
                                {startingNew ? (
                                  <>
                                    <Text variant="caption" tone="muted">
                                      {t('Pick a place for them, 1 to {n}, and remember it: Erevos cannot tell which are used.', { n: POCKETS })}
                                    </Text>
                                    <Row wrap>
                                      {Array.from({ length: POCKETS }, (_, place) => (
                                        <Chip key={place} label={t('Place {n}', { n: place + 1 })} selected={newPocket === place} onPress={() => setNewPocket(place)} />
                                      ))}
                                    </Row>
                                    {newPocket !== null ? (
                                      <Text variant="caption" style={{ color: colors.danger }}>
                                        {t('New hidden chats start in place {n} with this PIN. If that place held hidden chats, they can no longer be opened.', { n: newPocket + 1 })}
                                      </Text>
                                    ) : null}
                                  </>
                                ) : null}
                                {moveNote ? (
                                  <Text variant="caption" style={{ color: colors.danger }}>
                                    {moveNote}
                                  </Text>
                                ) : null}
                                <Row wrap>
                                  <Button
                                    title={weakNewPin && weakPinSeen === pinDraft ? t('Use it anyway') : startingNew ? t('Start and move') : t('Move')}
                                    compact
                                    loading={moving}
                                    disabled={pinDraft.length < MIN_PIN || (startingNew && newPocket === null)}
                                    onPress={() => {
                                      if (weakNewPin && weakPinSeen !== pinDraft) return setWeakPinSeen(pinDraft);
                                      void moveToHidden(selectedContact, pinDraft, startingNew ? newPocket : null);
                                    }}
                                  />
                                  <Button
                                    title={startingNew ? t('Cancel') : t('New hidden chats')}
                                    kind="secondary"
                                    compact
                                    disabled={moving}
                                    onPress={() => {
                                      setStartingNew((on) => !on);
                                      setNewPocket(null);
                                    }}
                                  />
                                </Row>
                                <Text variant="caption" tone="muted">
                                  {t('Their phone is told at once where to write from now on. A message they send in that moment may not come.')}
                                </Text>
                              </View>
                            ) : null}
                            <View style={styles.rule} />
                            <DetailRow
                              title={t('Move to another space')}
                              open={opened === 'space'}
                              onPress={() => {
                                setOpened((now) => (now === 'space' ? null : 'space'));
                                setMoveNote('');
                                setPasswordDraft('');
                                setRelayOffer(false);
                              }}
                            />
                            {opened === 'space' ? (
                              <View style={styles.rowMore}>
                                <Text variant="caption" tone="muted">
                                  {t("The chat leaves this space with its messages, name, picture and look, and goes into the space whose password you type, sealed with that space's key. That space stays closed, and nothing here shows whether there is one. The safety number stays the same.")}
                                </Text>
                                <Input
                                  value={passwordDraft}
                                  onChangeText={(text) => {
                                    setPasswordDraft(text);
                                    setMoveNote('');
                                    setRelayOffer(false);
                                  }}
                                  placeholder={t('Password of the other space')}
                                  secureTextEntry
                                  autoCapitalize="none"
                                  autoCorrect={false}
                                  onSubmitEditing={() => void moveToOtherSpace(selectedContact, passwordDraft)}
                                />
                                {moveNote ? (
                                  <Text variant="caption" style={{ color: colors.danger }}>
                                    {moveNote}
                                  </Text>
                                ) : null}
                                {relayOffer ? (
                                  <Text variant="caption" tone="muted">
                                    {t("That space has no relay yet. It can take this space's relay, and keep it: the relay can then tell that both spaces are on one phone.")}
                                  </Text>
                                ) : null}
                                <Row wrap>
                                  {relayOffer ? (
                                    <Button title={t("Move with this space's relay")} compact loading={moving} onPress={() => void moveToOtherSpace(selectedContact, passwordDraft, true)} />
                                  ) : (
                                    <Button title={t('Move')} compact loading={moving} disabled={passwordDraft.length < MIN_PIN} onPress={() => void moveToOtherSpace(selectedContact, passwordDraft)} />
                                  )}
                                </Row>
                                <Text variant="caption" tone="muted">
                                  {t('Their phone is told at once where to write from now on. A message they send in that moment may not come.')}
                                </Text>
                              </View>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <View style={styles.rule} />
                            <DetailRow
                              title={t('Move back to my chats')}
                              open={opened === 'back'}
                              onPress={() => {
                                setOpened((now) => (now === 'back' ? null : 'back'));
                                setMoveNote('');
                              }}
                            />
                            {opened === 'back' ? (
                              <View style={styles.rowMore}>
                                <Text variant="caption" tone="muted">
                                  {t('The chat leaves the hidden chats with its messages, name, picture and look, and shows again among the chats of this space, which anyone who opens Erevos with its password sees. The safety number stays the same.')}
                                </Text>
                                {moveNote ? (
                                  <Text variant="caption" style={{ color: colors.danger }}>
                                    {moveNote}
                                  </Text>
                                ) : null}
                                <Row wrap>
                                  <Button title={t('Move')} compact loading={moving} onPress={() => void moveToSpace(selectedContact)} />
                                </Row>
                                <Text variant="caption" tone="muted">
                                  {t('Their phone is told at once where to write from now on. A message they send in that moment may not come.')}
                                </Text>
                              </View>
                            ) : null}
                          </>
                        )}
                      </View>
                      <View style={[styles.group, styles.groupGap]}>
                        <DetailRow
                          title={t('Delete messages')}
                          danger
                          onPress={() => {
                            setDetails(false);
                            deleteMessages(selectedContact);
                          }}
                        />
                        <DetailRow title={t('Delete contact')} danger onPress={() => deleteContact(selectedContact, false)} />
                        <DetailRow title={t('Block contact')} danger onPress={() => deleteContact(selectedContact, true)} />
                      </View>
                    </>
                  ) : null}
                </KeyboardAwareScrollView>
              </View>
            </SwipeBack>
          </ScreenBackdrop>
        </Modal>
        <WebsiteLink
          visible={webLinking && shown && !hiddenKey && !!ownLink}
          onClose={() => setWebLinking(false)}
          contactLink={ownLink}
          name={e2e?.invitedAs() ?? ''}
          onNote={setNote}
        />
        <Sheet visible={showQr && shown && !!ownLink} onClose={() => setShowQr(false)} title={t('My QR code')}>
          {ownLink ? <QrCode text={card && !bigQr ? card : ownLink} size={240} /> : null}
          <Text variant="caption" tone="muted">
            {t("Scan it with the other phone's camera and open the link in Erevos. If the camera only shows the text, copy it and paste it under Add a contact, on New chat, on that phone.")}
          </Text>
          {card && !bigQr && cardNfc === 'on' ? (
            <Text variant="caption" tone="muted">
              {t('Or hold the back of their phone to the back of yours: their phone opens your contact link.')}
            </Text>
          ) : card && !bigQr && cardNfc === 'off' ? (
            <Text variant="caption" tone="muted">
              {t('Turn on NFC in Android\'s settings to give it by touching phones too.')}
            </Text>
          ) : null}
          {card ? (
            <>
              <DetailRow title={t('Large QR code, for no internet')} checked={bigQr} onPress={() => setBigQr(!bigQr)} />
              <Text variant="caption" tone="muted">
                {bigQr
                  ? t('The whole contact link, with your keys: it works near, with no internet, but some cameras cannot read it.')
                  : t('Small, so any camera reads it, and good once: the first to scan it is your contact at once; anyone after writes a message request first.')}
              </Text>
            </>
          ) : null}
          <Row wrap>
            <Button title={t('Done')} compact onPress={() => setShowQr(false)} />
            {ownLink ? (
              <Button
                title={Platform.OS === 'web' ? t('Copy my contact link') : t('Share my contact link')}
                kind="secondary"
                compact
                onPress={() => void shareMine(ownLink)}
              />
            ) : null}
          </Row>
        </Sheet>
        {/* The chat's bar, on the bars' glass from the top of the screen, behind the status bar. */}
        <View style={[styles.topBar, { marginTop: -(insets.top + space.sm), paddingTop: insets.top + 2 }, barBlur]}>
          {hiddenKey ? (
            <Text variant="overline" tone="muted" style={styles.kicker}>
              {t('Hidden chats')}
            </Text>
          ) : null}
          {selected && selection.on ? (
            <SelectBar
              count={chosenMessages.length}
              onCancel={selection.clear}
              onAll={() => selection.set(visible.filter((m) => !m.sending).map((m) => m.id))}
              onCopy={CAN_COPY && chosenMessages.length > 0 ? () => copyChosen(chosenMessages) : undefined}
              onForward={chosenMessages.length > 0 && chosenMessages.every(forwardable) ? () => startForward(chosenMessages) : undefined}
              onDelete={chosenMessages.length > 0 ? () => deleteChosen(chosenMessages) : undefined}
            />
          ) : (
            <View style={styles.header}>
              <BackButton onPress={threadRoot ? () => setThreadRoot(null) : goBack} />
              {selected ? (
                <Pressable
                  style={({ pressed }) => [styles.who, pressed && styles.pressed]}
                  onPress={() => setDetails(true)}
                  accessibilityRole="button"
                  accessibilityLabel={selectedContact ? `${selectedName}, ${subtitle}` : selectedName}
                  accessibilityHint={t('Chat details')}
                >
                  <KeyFace identity={selectedIdentity} name={contactName(selected, shownContacts) ?? ''} size={narrow ? 36 : 40} avatar={selectedAvatar} />
                  <View style={styles.grow}>
                    <Text variant="heading" numberOfLines={1} style={[styles.name, !contactName(selected, shownContacts) && styles.monoName]}>
                      {threadRoot ? t('Thread · {name}', { name: selectedName }) : selectedName}
                    </Text>
                    {selectedContact ? (
                      <View style={styles.subtitle}>
                        {selectedOnline ? (
                          <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
                        ) : !selectedTyping && !narrow ? (
                          <ShieldIcon color={colors.success} size={11} />
                        ) : null}
                        {selectedTimer ? <TimerIcon color={colors.textMuted} size={11} /> : null}
                        <Text variant="caption" numberOfLines={1} color={selectedTyping ? colors.accentText : colors.textMuted} style={styles.grow}>
                          {headerSays}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              ) : (
                <Text variant="title" numberOfLines={1} style={styles.grow}>
                  {door === 'near'
                    ? t('Near me')
                    : door === 'far'
                      ? t('Far away')
                      : door === 'code'
                        ? t('I have their code')
                        : door === 'link'
                          ? t('My link')
                          : door === 'blocked'
                            ? t('Blocked contacts')
                            : door === 'advanced'
                              ? t('For advanced users')
                              : hiddenKey
                                ? t('Hidden chats')
                                : t('New chat')}
                </Text>
              )}
              {selectedContact ? (
                <>
                  {dialTo ? <DialTile number={dialTo} onFailed={setNote} /> : null}
                  <ShortcutTile label={t('Video call')} tint="blue" onPress={() => void startCall(true)}>
                    <VideoSign />
                  </ShortcutTile>
                  <ShortcutTile label={t('Voice call')} tint="green" onPress={() => void startCall(false)}>
                    <PhoneSign />
                  </ShortcutTile>
                </>
              ) : null}
              {selected ? (
                // Apart from the calls, so a slip calls no one; upright on Android, as its apps have it.
                <View style={styles.moreGap}>
                  <IconButton label={t('Chat details')} onPress={() => setDetails(true)}>
                    <MoreIcon color={colors.text} size={Platform.OS === 'web' ? 20 : 18} upright={Platform.OS !== 'web'} />
                  </IconButton>
                </View>
              ) : hiddenKey && onChangePassword && door === 'root' ? (
                <View style={styles.headerLinks}>
                  {modules.has('collection') ? (
                    <ShortcutTile label={t('Collection')} tint="blue" onPress={() => router.push('/collection?hidden=1')}>
                      <CollectionSign tint="blue" />
                    </ShortcutTile>
                  ) : null}
                  <TextButton title={t('Contacts')} onPress={() => router.push('/contacts?hidden=1')} />
                  <TextButton title={t('Change PIN')} onPress={onChangePassword} />
                </View>
              ) : null}
            </View>
          )}
        </View>
        {!selected ? (
          <ScrollView key={door} style={styles.top} contentContainerStyle={styles.topContent} keyboardShouldPersistTaps="handled">
            {door === 'root' ? (
              <>
                {/* At the top (#12): a name finds a contact below, a pasted link adds them. Hidden chats list no faces, so there it is for a link only. */}
                {/* Not before the place is read: a phone with no relay would show this screen for a moment, then the newcomer's. */}
                {loaded && !newcomer ? (
                  <Row>
                    <Input
                      value={contactDraft}
                      onChangeText={setContactDraft}
                      placeholder={hiddenKey ? t('Paste their contact link or invite') : t('Name, or paste a link')}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.grow}
                    />
                    {draftIsLink || (hiddenKey && findTyped) ? <Button title={t('Add')} compact onPress={() => addContact()} /> : null}
                  </Row>
                ) : null}
                {hiddenKey ? (
                  // As home lists the space's chats (app/index.tsx), Chat with myself first.
                  <View>
                    {/* What is archived, in place of the list until tapped again. */}
                    {placeOrdered?.archived.length || placeArchive ? (
                      <Row wrap>
                        <Chip label={t('Archived · {n}', { n: placeOrdered?.archived.length ?? 0 })} selected={placeArchive} onPress={() => setPlaceArchive(!placeArchive)} />
                      </Row>
                    ) : null}
                    {placeNotes !== null && !placeArchive ? <MyselfRow notes={placeNotes} onOpen={() => setMyselfShown(true)} /> : null}
                    {((placeArchive ? placeOrdered?.archived : placeOrdered?.list) ?? []).map((row) => (
                      <ChatRow
                        key={row.identity}
                        row={row}
                        now={now}
                        online={!!e2e && contacts.some((c) => c.identity === row.identity && !c.hide) && e2e.onlineUntil(row.identity, now) > 0}
                        hidden
                        onLong={row.invited ? undefined : () => setPlaceTarget(row)}
                        // A network's chat opens its own screen, for the place's account (components/chat-row.tsx).
                        onOpen={
                          row.network
                            ? undefined
                            : () => (row.identity.startsWith('group:') ? setShownGroup(row.identity.slice('group:'.length)) : setSelected(`${CONTACT_PREFIX}${row.identity}`))
                        }
                      />
                    ))}
                    {placeArchive && placeOrdered?.archived.length === 0 ? <Text tone="muted">{t('Nothing archived.')}</Text> : null}
                    {placeRows.length === 0 ? <Text tone="muted">{t('No hidden chats yet. Add a contact below, or move a chat here from its details.')}</Text> : null}
                    <ChatActions target={placeTarget} place={chatListPlace} where="place" onClose={() => setPlaceTarget(null)} onChanged={() => e2e && setContacts(e2e.contacts())} />
                    {(placeWhere && canGroup()) || canMatrix() || canXmpp() || canNostrChat() || hasCore() ? (
                      // The place's own accounts on the networks (lib/place-networks.ts), apart from the space's,
                      // and its own linked devices (app/devices.tsx), which the space's know nothing of. On a
                      // linked device new groups stay on the phone, as the space's do.
                      <Row wrap>
                        {placeWhere && canGroup() && placeLinked()?.role() !== 'linked' ? <Button title={t('New group')} kind="secondary" compact onPress={() => setMakingGroup(true)} /> : null}
                        {canMatrix() ? <Button title="Matrix" kind="secondary" compact onPress={() => router.push({ pathname: '/matrix', params: { hidden: '1' } })} /> : null}
                        {canXmpp() ? <Button title="XMPP" kind="secondary" compact onPress={() => router.push({ pathname: '/xmpp', params: { hidden: '1' } })} /> : null}
                        {canNostrChat() ? <Button title="Nostr" kind="secondary" compact onPress={() => router.push({ pathname: '/nostr-chats', params: { hidden: '1' } })} /> : null}
                        {hasCore() ? <Button title={t('Linked devices')} kind="secondary" compact onPress={() => router.push({ pathname: '/devices', params: { hidden: '1' } })} /> : null}
                      </Row>
                    ) : null}
                  </View>
                ) : faceChips.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.faces} keyboardShouldPersistTaps="handled">
                    {faceChips.map((peer) => {
                      const named = contactName(peer, shownContacts);
                      return (
                        <Pressable
                          key={peer}
                          onPress={() => setSelected(peer)}
                          accessibilityRole="button"
                          accessibilityLabel={label(peer, shownContacts)}
                          style={styles.face}
                        >
                          <View style={styles.ring}>
                            <KeyFace
                              identity={peer.slice(CONTACT_PREFIX.length)}
                              name={named ?? ''}
                              size={48}
                              avatar={contacts.find((c) => `${CONTACT_PREFIX}${c.identity}` === peer)?.avatar}
                            />
                          </View>
                          <Text variant="caption" numberOfLines={1} style={[styles.faceName, !named && styles.monoSmall]}>
                            {named ?? peer.slice(CONTACT_PREFIX.length, CONTACT_PREFIX.length + 8)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                ) : findTyped && !draftIsLink && chips.length > 0 ? (
                  <Text variant="caption" tone="muted">
                    {t('No contact has “{query}” in it.', { query: findTyped })}
                  </Text>
                ) : null}
                {hiddenKey ? (
                  <View style={styles.panel}>
                    {placeName !== null ? (
                      <Field label={t('My name')} hint={t("Starts empty and never takes the space's name. The same name as your space's tells whoever sees both that they are you.")}>
                        <Input
                          value={placeName}
                          onChangeText={setPlaceName}
                          onEndEditing={() => void savePlaceName()}
                          onSubmitEditing={() => void savePlaceName()}
                          placeholder={t('Name')}
                          maxLength={MAX_NAME}
                          autoCorrect={false}
                        />
                      </Field>
                    ) : null}
                    <DetailRow title={t('Receive while closed')} checked={receiving} onPress={() => void changeReceiving(!receiving)} />
                    <Text variant="caption" tone="muted">
                      {receiving
                        ? t('Closed, these hidden chats receive as your other chats do: their contacts see at once that a message came, a notice says only "New message", a call rings with no name, answered with the PIN, and a reminder of their Chat with myself says only "Reminder". For it, their key is kept encrypted with the space, so whoever opens the space and copies what the phone keeps could open them too; the PIN still keeps them out of sight.')
                        : t('Closed, nothing reads these hidden chats: their key is only behind the PIN, and their messages wait on the relay until you open them.')}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {receiving
                        ? t('Their own Matrix, XMPP and Nostr accounts stay connected too: what comes there says only "New message", and a call rings with no name.')
                        : t('Their own Matrix, XMPP and Nostr accounts connect only while they are open.')}
                    </Text>
                    {receiving ? (
                      <>
                        <DetailRow title={t('Dot for unread messages')} checked={placeSign} onPress={() => changePlaceSign(!placeSign)} />
                        <Text variant="caption" tone="muted">
                          {placeSign
                            ? t('While one of these hidden chats has a message unread, a small dot shows on the magnifier of Search chats in this space: never how many, nor where. Whoever sees the space\'s chats sees it too, and may guess there are hidden chats.')
                            : t('Messages unread here show only once you open these hidden chats.')}
                        </Text>
                      </>
                    ) : null}
                    {canRingInBackground && !receiving ? (
                      <>
                        <DetailRow title={t('Say when a message comes')} checked={watched} onPress={() => void changeWatched(!watched)} />
                        <Text variant="caption" tone="muted">
                          {watched
                            ? t('While these hidden chats are closed, with Erevos in the background or showing, a notice says only "New message", or how many came, as for the other chats; that a message came or was read makes none. Whoever sees it and finds nothing new in your chats may guess there are more.')
                            : t('Closed, these hidden chats say nothing: their messages wait on the relay until you open them.')}
                        </Text>
                        {watched && background && !(background.on && background.notices) ? (
                          <Text variant="caption" tone="muted">
                            {t('Nothing says it for now: it needs Receive and ring and Say a message came, under Settings → Notifications → In the background.')}
                          </Text>
                        ) : null}
                        {watchNote ? <Text variant="caption" tone="muted">{watchNote}</Text> : null}
                        <DetailRow title={t('Ring calls when closed')} checked={ringing} onPress={() => void changeRinging(!ringing)} />
                        <Text variant="caption" tone="muted">
                          {ringing
                            ? t('While these hidden chats are closed, with Erevos in the background or on any screen, a call from one of their contacts makes the phone ring and show "Incoming call" with no name. On the ringing screen, tap the small sign and type the PIN to answer. Whoever holds the phone sees a call that is in none of your chats, and may guess there are more.')
                            : t('Closed, these hidden chats do not ring: a call from their contacts rings only while they are open.')}
                        </Text>
                        {ringing && background && !background.on ? (
                          <Text variant="caption" tone="muted">{t('Nothing rings for now: it needs Receive and ring, under Settings → Notifications → In the background.')}</Text>
                        ) : null}
                        {ringNote ? <Text variant="caption" tone="muted">{ringNote}</Text> : null}
                      </>
                    ) : null}
                  </View>
                ) : null}
                {/* How this phone connects, only when something is still missing or for a phone with no relay
                    yet: with everything working New chat starts with its question. */}
                {loaded && (newcomer || reached.reach !== 'ready' || relayKeyCheck === 'none' || relayKeyCheck === 'refused') ? (
                  <ConnectStatus reach={reached.reach} title={reached.title} line={reached.line} detail={reached.detail}>
                    {relayUrl.trim() ? <RelayKeyNote url={relayUrl.trim()} /> : null}
                  </ConnectStatus>
                ) : null}
                {/* Where is the other person (#45): one question, and each answer a page of its own. */}
                {loaded ? (
                  <>
                    <Doors invites={canWelcome} onOpen={openDoor} />
                    <Rest
                      rows={[
                        ...(ownLink ? [{ title: t('My link'), onPress: () => openDoor('link') }] : []),
                        // On a linked computer the phone keeps who is blocked.
                        ...(linkHere()
                          ? []
                          : [{ title: blocked.length > 0 ? t('Blocked contacts · {n}', { n: blocked.length }) : t('Blocked contacts'), onPress: () => openDoor('blocked') }]),
                        { title: t('For advanced users'), onPress: () => openDoor('advanced') },
                      ]}
                    />
                  </>
                ) : null}
              </>
            ) : door === 'near' ? (
              <NearMe
                shown={shown}
                search={HAS_LINKS && !hiddenKey}
                held={!nearbyOn}
                own={() => (ownLink ? { link: ownLink, name: linkE2E?.invitedAs() ?? '' } : null)}
                onJoined={(end) => void addPaired(end.link, end.name)}
                qr={
                  canWelcome && !nearPlain ? (
                    // An invite, which anyone's camera reads and which works with or without Erevos on their phone;
                    // with no internet to make one, this phone's whole contact link, which needs none.
                    <WelcomeInvite
                      visible={shown}
                      inline
                      onPlain={() => setNearPlain(true)}
                      e2e={linkE2E}
                      relay={relayUrl.trim() && relayToken.trim() && !isLentToken(relayToken) ? { url: relayUrl.trim(), token: relayToken.trim() } : null}
                      onOwnLine={(relay) => ownLine(relay.url, relay.token ?? '')}
                      contactLink={ownLink}
                      onNote={setNote}
                    />
                  ) : ownLink ? (
                    <>
                      <QrCode text={ownLink} size={200} />
                      <Text variant="caption" tone="muted" style={styles.centered}>
                        {t('They scan it with the camera, and you are each other’s contacts at once.')}
                      </Text>
                      {newcomer ? (
                        <Text variant="caption" tone="muted" style={styles.centered}>
                          {t('With no relay, messages go through Nostr, or nearby.')}
                        </Text>
                      ) : null}
                    </>
                  ) : null
                }
                ownLink={ownLink}
                canCode={canPairWithCode()}
                onCodeLink={(link) => void addPaired(link)}
                onScan={() => void addFromQr(CAN_TAKE_PHOTOS ? 'camera' : 'photos')}
                onType={() => openDoor('code')}
                onGive={CAN_GIVE && !hiddenKey ? () => router.push('/give-app') : undefined}
              />
            ) : door === 'code' ? (
              <View style={styles.section}>
                {/* A phone with no relay yet: an invite is its way in, scanned, pasted, or from a photo of it. */}
                {newcomer ? <Text tone="muted">{t('Ask someone who has Erevos to show you their QR code. Once you scan it, you are in and you are contacts, typing nothing.')}</Text> : null}
                <TheirCode
                  shown={shown}
                  ownLink={ownLink}
                  canCode={canPairWithCode()}
                  onLink={(link) => void addPaired(link)}
                  draft={contactDraft}
                  onDraft={setContactDraft}
                  onAdd={() => addContact()}
                  onScan={() => void addFromQr(CAN_TAKE_PHOTOS ? 'camera' : 'photos')}
                  onPhoto={CAN_TAKE_PHOTOS ? () => void addFromQr('photos') : undefined}
                />
              </View>
            ) : door === 'far' ? (
              canWelcome ? (
                <WelcomeInvite
                  visible={shown}
                  e2e={linkE2E}
                  relay={relayUrl.trim() && relayToken.trim() && !isLentToken(relayToken) ? { url: relayUrl.trim(), token: relayToken.trim() } : null}
                  onOwnLine={(relay) => ownLine(relay.url, relay.token ?? '')}
                  contactLink={ownLink}
                  onNote={setNote}
                />
              ) : !loaded ? null : ownLink ? (
                // No invite to make here (no relay yet, hidden chats, a linked device): this phone's contact link goes instead.
                <View style={styles.section}>
                  <Text tone="muted">{t('Send them your contact link with any app. They open it in Erevos, or paste it under I have their code, and you are each other’s contacts.')}</Text>
                  <Button title={Platform.OS === 'web' ? t('Copy my contact link') : t('Share my contact link')} onPress={() => void shareMine(ownLink)} />
                  <Text variant="caption" tone="muted">
                    {t('Whoever has it can write to you, so give it to whom you mean to: they add you with it.')}
                  </Text>
                  {newcomer ? (
                    <Text variant="caption" tone="muted">
                      {linkNostr
                        ? t('If they have a relay, an invite to it comes to this phone by itself, and photos, voice messages and calls work too.')
                        : t('With no relay, messages go through Nostr, or nearby.')}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text tone="muted">{t('Getting it ready…')}</Text>
              )
            ) : door === 'done' ? (
              joined ? (
                <Joined
                  face={<KeyFace identity={joined} name={contacts.find((c) => c.identity === joined)?.name ?? ''} size={72} avatar={contacts.find((c) => c.identity === joined)?.avatar} />}
                  name={contacts.find((c) => c.identity === joined)?.name ?? ''}
                  onName={(name) => void nameJoined(joined, name)}
                  onWrite={() => setSelected(`${CONTACT_PREFIX}${joined}`)}
                  onAnother={leaveDoor}
                />
              ) : null
            ) : door === 'link' ? (
              <View style={styles.section}>
                {/* This phone's own QR code and link: whoever scans or opens it adds this phone. With a
                    relay that lets it, the small contact card; the whole link for no internet. */}
                <MyQrCard
                  text={ownLink ? (card && !bigQr ? card : ownLink) : null}
                  onScan={() => void addFromQr(CAN_TAKE_PHOTOS ? 'camera' : 'photos')}
                  shareTitle={Platform.OS === 'web' ? t('Copy') : t('Share')}
                  onShare={() => ownLink && void shareMine(ownLink)}
                  onPhoto={() => void addFromQr('photos')}
                >
                  {card && !bigQr ? (
                    <Text variant="caption" tone="muted" style={styles.centered}>
                      {t('This small code works only when both phones have a relay. Otherwise use Near me, or an invite from Far away.')}
                    </Text>
                  ) : null}
                  {card && !bigQr && cardNfc === 'on' ? (
                    <Text variant="caption" tone="muted" style={styles.centered}>
                      {t('Or hold the back of their phone to the back of yours: their phone opens your contact link.')}
                    </Text>
                  ) : null}
                  {newcomer ? (
                    <Text variant="caption" tone="muted" style={styles.centered}>
                      {t('With no relay, messages go through Nostr, or nearby.')}
                    </Text>
                  ) : null}
                  {card ? <TextButton title={bigQr ? t('Small QR code') : t('Large QR code, for no internet')} onPress={() => setBigQr(!bigQr)} /> : null}
                </MyQrCard>
                {ownLink ? (
                  <View style={styles.panel}>
                    <Text variant="caption" tone="muted">
                      {t('Whoever has it can write to you, so give it to whom you mean to: they add you with it.')}
                    </Text>
                    <Row wrap>
                      {!hiddenKey ? <Button title={t('Link for a website')} kind="secondary" compact onPress={() => setWebLinking(true)} /> : null}
                      {ownQueue && !linkHere() ? <Button title={t('New contact link')} kind="secondary" compact onPress={newContactLink} /> : null}
                    </Row>
                    {ownQueue && canSharePlace ? (
                      <View>
                        <DetailRow
                          title={t('Share a place on my relay with this link')}
                          checked={sharePlace}
                          onPress={() => setSharePlace(!sharePlace)}
                        />
                        <Text variant="caption" tone="muted">
                          {sharePlace
                            ? t('For a month, whoever adds you with this link and has no relay of their own can take a place on your relay. Anyone who sees the link can, so give it only to whom you mean to.')
                            : t('The link has no place on your relay in it. Turn this on for someone with no relay of their own.')}
                        </Text>
                        {placeNote ? <Text variant="caption" tone="muted">{placeNote}</Text> : null}
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : door === 'blocked' ? (
              <View style={styles.section}>
                {blocked.length === 0 ? (
                  <Text variant="caption" tone="muted">
                    {t('No one is blocked.')}
                  </Text>
                ) : (
                  blocked.map((b) => (
                    <Row key={b.identity}>
                      <Text style={[styles.grow, !b.name && styles.monoName]} numberOfLines={1}>
                        {b.name || b.identity.slice(0, 16)}
                      </Text>
                      <TextButton title={t('Unblock')} onPress={() => void unblock(b.identity)} />
                    </Row>
                  ))
                )}
              </View>
            ) : (
              <View style={styles.section}>
                {newcomer ? (
                  <>
                    {/* A phone with no relay yet: the other ways in than an invite, for whoever looks for them. */}
                    <Text variant="caption" tone="muted">
                      {t('Other ways in: signing in to a relay, starting without one, a relay address and token')}
                    </Text>
                    <RelaySignIn url={signInAt} token="" onToken={(token, name) => void tookToken(signInAt, token, name, true)} onNote={setNote} card />
                    {otherRelay === null ? (
                      <Row wrap>
                        <TextButton title={t('Sign in at another relay…')} onPress={() => setOtherRelay('')} />
                        {signInAt !== START_RELAY ? <TextButton title={t('Back to {relay}', { relay: hostOf(START_RELAY) })} onPress={() => setSignInAt(START_RELAY)} /> : null}
                      </Row>
                    ) : null}
                    {otherRelay !== null ? (
                      <Row>
                        <Input
                          value={otherRelay}
                          onChangeText={setOtherRelay}
                          placeholder="relay.example.org"
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="url"
                          style={styles.grow}
                        />
                        <Button
                          title={t('Use')}
                          compact
                          onPress={() => {
                            const url = signInRelay(otherRelay);
                            if (!url) {
                              setNote(t('That is not a relay address. Type it as its operator gave it, such as relay.example.org.'));
                              return;
                            }
                            setSignInAt(url);
                            setOtherRelay(null);
                          }}
                        />
                        <TextButton title={t('Cancel')} onPress={() => setOtherRelay(null)} />
                      </Row>
                    ) : null}
                    {ownLink ? (
                      <WayCard
                        tint="green"
                        sign={<GlobeIcon color="#ffffff" size={20} />}
                        title={t('Start without a relay')}
                        line={
                          linkNostr
                            ? t('Give someone who uses Erevos your QR code or link. Texts go through Nostr.')
                            : t('Give someone who uses Erevos your QR code or link. You reach each other when near, over Wi-Fi or Bluetooth.')
                        }
                        open={way === 'own'}
                        onPress={() => setWay((was) => (was === 'own' ? null : 'own'))}
                      >
                        <Row wrap>
                          <Button title={t('Show my QR code')} compact onPress={() => setShowQr(true)} />
                          <Button
                            title={Platform.OS === 'web' ? t('Copy my contact link') : t('Share my contact link')}
                            kind="secondary"
                            compact
                            onPress={() => void shareMine(ownLink)}
                          />
                        </Row>
                        {linkNostr ? (
                          <Text variant="caption" tone="muted">
                            {t('If they have a relay, an invite to it comes to this phone by itself, and photos, voice messages and calls work too.')}
                          </Text>
                        ) : null}
                        <Text tone="muted">{t('Or add them by their link or QR code:')}</Text>
                        {addTheirs}
                      </WayCard>
                    ) : null}
                  </>
                ) : null}
                <View style={styles.panel}>
                  {HAS_LINKS && !hiddenKey ? (
                    <>
                      <DetailRow title={t('Nearby, with no internet')} open={nearbyShown} onPress={() => setNearbyShown((on) => !on)} />
                      {nearbyShown ? (
                        <View>
                          <DetailRow title={t('Look for phones nearby')} checked={nearbyOn} onPress={() => changeNearby(!nearbyOn)} />
                          <Text variant="caption" tone="muted">
                            {nearbyOn
                              ? t('Erevos phones near this one find each other and talk with no internet, over Bluetooth and the ways below.')
                              : t('Off: Erevos looks for no phone nearby, and everything goes through the relay. Turn it on to chat and call with no internet, beside each other or on the same Wi-Fi.')}
                          </Text>
                          {nearbyOn && HAS_RADIO ? (
                            <>
                              <DetailRow title={t('Look with Wi-Fi Aware')} checked={awareOn} onPress={() => changeAware(!awareOn)} />
                              <Text variant="caption" tone="muted">
                                {awareOn
                                  ? t('Besides Bluetooth, Erevos phones near each other find each other and talk over Wi-Fi Aware, faster and farther, with no internet. Anyone near can tell an Erevos phone is there, not whose.')
                                  : t('Only Bluetooth looks for Erevos phones near this one, and the same Wi-Fi when that is on.')}
                              </Text>
                            </>
                          ) : null}
                          {nearbyOn ? (
                            <>
                          <DetailRow title={t('Find Erevos on the same Wi-Fi')} checked={lanOn} onPress={() => changeLan(!lanOn)} />
                          <Text variant="caption" tone="muted">
                            {lanOn
                              ? t('While a space is open, Erevos phones and computers on the same Wi-Fi or hotspot find each other and talk directly, even with no internet. Anyone on that Wi-Fi can tell an Erevos app is there, not whose.')
                              : HAS_RADIO
                                ? awareOn
                                  ? t('Only Bluetooth and Wi-Fi Aware look for phones nearby.')
                                  : t('Only Bluetooth looks for phones nearby.')
                                : t('Nothing looks for Erevos nearby.')}
                          </Text>
                          {CAN_DIRECT && lanOn ? (
                            <>
                              <DetailRow title={t('Make a Wi-Fi with phones nearby')} checked={directOn} onPress={() => changeDirect(!directOn)} />
                              <Text variant="caption" tone="muted">
                                {directOn
                                  ? t('With no Wi-Fi in common, two Erevos phones near each other make a small Wi-Fi of their own (Wi-Fi Direct): faster than Bluetooth, and calls go over it with no internet. Anyone near can tell an Erevos phone is there and could join that Wi-Fi, getting only sealed bytes.')
                                  : t('Erevos phones meet only on a Wi-Fi they share, or over Bluetooth and Wi-Fi Aware.')}
                              </Text>
                            </>
                          ) : null}
                          {SAMSUNG ? (
                            <Text variant="caption" tone="muted">
                              {t('On a Samsung phone, Wi-Fi Aware and the Wi-Fi with phones nearby stay off until you turn them on: while Erevos uses them, Samsung asks to turn off its own sharing.')}
                            </Text>
                          ) : null}
                            </>
                          ) : null}
                          <DetailRow title={t('Carry messages for others')} checked={carrying} onPress={() => changeCarrying(!carrying)} />
                          <Text variant="caption" tone="muted">
                            {carrying
                              ? t("When the relay cannot be reached, Erevos phones nearby give each other what they could not send, sealed for the contact's relay. This phone keeps those it gets, three days at most, and hands them to that relay through yours. It cannot read them, nor tell who they are from or for: it sees only the relay's address.")
                              : t('Off: this phone keeps nothing for others. What it cannot send, phones nearby carry for you if theirs is on.')}
                          </Text>
                          {carrying ? (
                            <Text variant="caption" tone="muted">
                              {t('It also brings what waits for a phone beside it that has no internet, when that phone asks, never while it goes through Tor: from a relay other than its own only once you say yes, warned that the relay sees this phone\'s internet address. It learns the queue, never what the messages say.')}
                            </Text>
                          ) : null}
                          {canLora() ? (
                            <>
                              <DetailRow title={t('LoRa radio')} value={t(LORA_SHOWN[lora.state().status])} onPress={() => router.push('/lora')} />
                              <Text variant="caption" tone="muted">
                                {t('With a Meshtastic radio, text goes kilometres with no internet, when nothing else takes it.')}
                              </Text>
                            </>
                          ) : null}
                        </View>
                      ) : null}
                    </>
                  ) : null}
                  {relayFields()}
                </View>
              </View>
            )}
          </ScrollView>
        ) : selectedContact && contacts.some((c) => c.request && `${CONTACT_PREFIX}${c.identity}` === selectedContact) ? (
          <View style={styles.panel}>
            <Text>{t('Message request')}</Text>
            <Text variant="caption" tone="muted">
              {t('Someone with your contact link wrote to you. Until you accept, their phone is not told that their messages came or were read. Writing to them accepts too.')}
            </Text>
            {requestSigns.length > 0 ? (
              <View accessibilityRole="alert" style={{ gap: space.xs }}>
                <Text variant="bodyStrong" style={{ color: colors.danger }}>
                  {t('Be careful')}
                </Text>
                {requestSigns.map((sign) => (
                  <Text key={sign} variant="caption">
                    {`•  ${t(SCAM_SAYS[sign])}`}
                  </Text>
                ))}
              </View>
            ) : null}
            <Row wrap>
              <TextButton title={t('Accept')} onPress={() => void acceptRequest(selectedContact)} />
              <TextButton title={t('Refuse')} onPress={() => refuseRequest(selectedContact)} />
              <TextButton title={t('Block')} onPress={() => deleteContact(selectedContact, true)} />
            </Row>
          </View>
        ) : null}
        {selectedContact && e2e && introTick >= 0 && !contacts.some((c) => c.request && `${CONTACT_PREFIX}${c.identity}` === selectedContact)
          ? introsAsked(e2e, selectedContact.slice(CONTACT_PREFIX.length)).map((ask) => (
              <View key={ask.i} style={styles.panel}>
                <Text>{t('{by} would like you to meet {name}', { by: label(selectedContact, contacts), name: ask.name })}</Text>
                <Text variant="caption" tone="muted">
                  {t('If you both say yes, you become contacts, and {name} is named as {by} named them. If you say no, {name} is not told.', { by: label(selectedContact, contacts), name: ask.name })}
                </Text>
                <Row wrap>
                  <TextButton title={t('Say yes')} onPress={() => void answer(selectedContact, ask.i, true)} />
                  <TextButton title={t('Say no')} onPress={() => void answer(selectedContact, ask.i, false)} />
                </Row>
              </View>
            ))
          : null}
        {searching !== null ? (
          <Row style={styles.searchBar}>
            <Input
              value={searching}
              onChangeText={(text) => {
                setSearching(text);
                setSearchAt(0);
              }}
              onSubmitEditing={() => goToHit(searchAt)}
              placeholder={t('Search in this chat')}
              autoFocus
              returnKeyType="search"
              style={styles.grow}
            />
            <Text variant="caption" tone="muted">
              {searching.trim() ? (hits.length > 0 ? t('{n} of {count}', { n: searchAt + 1, count: hits.length }) : t('None')) : ''}
            </Text>
            <SearchStep sign="▲" label={t('Earlier')} onPress={() => goToHit(Math.min(hits.length - 1, searchAt + 1))} />
            <SearchStep sign="▼" label={t('Later')} onPress={() => goToHit(Math.max(0, searchAt - 1))} />
            <SearchStep sign="✕" label={t('Close')} onPress={() => setSearching(null)} />
          </Row>
        ) : null}
        {pinnedNow ? (
          <Pinned
            line={messageLine(pinnedNow)}
            index={pinShown % pins.length}
            count={pins.length}
            onPress={() => {
              goTo(pinnedNow.peer, pinnedNow.tag);
              setPinShown((n) => (n + 1) % pins.length);
            }}
          />
        ) : null}
        <View style={styles.thread} onLayout={(event) => measured({ end: event.nativeEvent.layout.y + event.nativeEvent.layout.height })}>
          <ScrollView
            ref={thread}
            style={styles.thread}
            contentContainerStyle={styles.threadContent}
            onLayout={(event) => {
              readAt.current.seen = event.nativeEvent.layout.height;
              if (atEnd.current) toEndBySelf(false);
            }}
            onContentSizeChange={(_, height) => {
              const was = above.current;
              const grew = height - readAt.current.height;
              readAt.current.height = height;
              lookNear();
              growing.current = false;
              if (was) {
                // Earlier messages came above: what was read stays in its place.
                above.current = null;
                holdScroll.current = false;
                thread.current?.scrollTo({ y: was.offset + height - was.height, animated: false });
              } else if (holdScroll.current) holdScroll.current = false;
              // Read from its start, it stays where it is read. Otherwise at its end: at once when its
              // messages first show (not the empty thread before they are read) and when it grew by a
              // screen or more (the history read in two steps, what was imported), so it never passes
              // over the top of what shows on the way; animated only for a little more at its end.
              else if (!stretch) {
                toEndBySelf(endShown.current && grew < readAt.current.seen);
                if (lines.length > 0 || imported.length > 0) endShown.current = true;
              }
            }}
            onScrollBeginDrag={() => follow.current.take()}
            // Read to the end, the thread stays at its end as the keyboard, the panel under the bar or
            // what the bar shows over the field take room from it.
            onScroll={(event) => {
              const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
              const end = contentOffset.y + layoutMeasurement.height >= contentSize.height - 48;
              // On its own way to the end, it stays at the end and draws nothing more.
              const person = follow.current.person(end);
              atEnd.current = person ? end : true;
              awayOnScroll(event);
              readAt.current = { offset: contentOffset.y, height: contentSize.height, seen: layoutMeasurement.height };
              lookNear();
              if (!person) return;
              // Near the top of what shows, earlier messages come; read from the start, near its
              // bottom, later ones.
              if (contentOffset.y < layoutMeasurement.height) showEarlier();
              else if (later > 0 && contentSize.height - contentOffset.y - layoutMeasurement.height < layoutMeasurement.height) showLater();
            }}
            scrollEventThrottle={100}
          >
            {firstLine > 0 ? (
              <TextButton
                title={t('Show earlier messages ({n} more)', { n: firstLine })}
                onPress={showEarlier}
              />
            ) : (
              // What was imported, before the thread, once all of the thread shows.
              <>
                {firstImported > 0 ? (
                  <TextButton
                    title={t('Show earlier imported messages ({n} more)', { n: firstImported })}
                    onPress={showEarlier}
                  />
                ) : null}
                {imported.length > 0 ? (
                  <Text variant="caption" tone="muted" style={styles.divider}>
                    {t('Imported from {from}: only on this phone, only to read.', { from: importedFrom })}
                  </Text>
                ) : null}
                {imported.slice(firstImported, importedEnd).map((message, k) => {
                  const i = firstImported + k;
                  const before = k === 0 ? undefined : imported[i - 1];
                  const after = imported[i + 1];
                  const newDay = !!message.at && (!before?.at || dayOf(before.at) !== dayOf(message.at));
                  // The last of a run from one side, or one writer of a group, gets the bubble's tail.
                  const tail = !after || after.mine !== message.mine || after.sender !== message.sender || (!!after.at && !!message.at && dayOf(after.at) !== dayOf(message.at));
                  const sender = importedGroup && !message.mine && message.sender && (newDay || before?.sender !== message.sender) ? message.sender : '';
                  const sound = playingFile !== null && message.files.some((file) => file.id === playingFile) ? playingFile : null;
                  return (
                    <ImportedLine
                      key={importedTag(i)}
                      message={message}
                      index={i}
                      sender={sender}
                      newDay={newDay}
                      tail={tail}
                      lit={lit === importedTag(i)}
                      photos={photos}
                      playing={sound}
                      played={sound ? played : 0}
                      styles={styles}
                      b={b}
                      colors={colors}
                      acts={rowActs}
                    />
                  );
                })}
                {imported.length > 0 && importedEnd === imported.length ? (
                  <Text variant="caption" tone="muted" style={styles.divider}>
                    {t('Continued in Erevos')}
                  </Text>
                ) : null}
              </>
            )}
            {selected && visible.length === 0 && imported.length === 0 && chatSms.messages.length === 0 ? (
              <View style={styles.hello}>
                <ShieldIcon color={colors.textFaint} size={28} />
                <Text variant="caption" tone="muted" style={styles.divider}>
                  {t('No messages yet. What you write here is end-to-end encrypted, and kept sealed on this phone.')}
                </Text>
              </View>
            ) : null}
            {lines.slice(firstLine, lastLine).map((line, k) => {
              const i = firstLine + k;
              const before = k === 0 ? undefined : lines[i - 1];
              const after = lines[i + 1];
              const newDay = !before || dayOf(before.at) !== dayOf(line.at);
              // The last of a run from one side gets the bubble's tail, and room after it; an SMS and a
              // message of the chat are never one run.
              const tail = !after || after.mine !== line.mine || after.kind !== line.kind || dayOf(after.at) !== dayOf(line.at);
              if (line.kind === 'sms') {
                const id = smsLineId(line.sms);
                return (
                  <SmsLine key={`sms-${id}`} sms={line.sms} earlier={!!line.earlier} newDay={newDay} tail={tail} lit={lit === id} styles={styles} b={b} colors={colors} acts={rowActs} />
                );
              }
              const message = line.message;
              return (
                <MessageLine
                  key={message.id}
                  message={message}
                  quoted={message.re ? byTag.get(message.re) : undefined}
                  name={selectedName}
                  newDay={newDay}
                  tail={tail}
                  lit={lit === message.id}
                  played={playingId === message.id ? played : null}
                  photo={message.file ? photos[message.file.id] : undefined}
                  taking={taking[`${message.peer}|${message.tag}`] ?? (message.file?.history ? shareShown[`${message.peer}|${message.tag}`] : undefined)}
                  stranger={strangers.has(message.peer)}
                  plays={lines.length - i <= PLAYS_LAST}
                  canAnswer={theyHave(message)}
                  waits={scheduled(message)}
                  choosing={selection.on}
                  chosen={selection.on && selection.chosen.has(message.id)}
                  answers={threadRoot ? 0 : (threadAnswers.get(message.tag) ?? 0)}
                  styles={styles}
                  b={b}
                  colors={colors}
                  acts={rowActs}
                />
              );
            })}
            {later > 0 ? <TextButton title={t('Show later messages ({n} more)', { n: later })} onPress={showLater} /> : null}
          </ScrollView>
          <ThreadArrows
            start={away.start || firstLine > 0 || firstImported > 0}
            end={away.end || later > 0}
            seen={away.seen}
            onSeen={() => left.current.peer && left.current.tag && goTo(left.current.peer, left.current.tag)}
            onStart={toStart}
            onEnd={toEnd}
          />
        </View>
        {note ? <Text variant="caption" style={styles.note}>{note}</Text> : null}
        {connectShown ? (
          <Row wrap>
            <TextButton
              title={t('Connect to one of my contacts')}
              onPress={() => {
                setPickNote('');
                setPicking(true);
              }}
            />
            <TextButton title={t('Not now')} onPress={() => setConnecting(null)} />
          </Row>
        ) : null}
        {selectedContact && !isTorChat(selectedContact) && !throughTor() ? (
          <IpQuiet fix={canTor() ? { label: t('Through Tor for this chat'), run: () => changeTor(selectedContact, true) } : undefined} />
        ) : null}
        {selectedContact ? (
          <View style={styles.dock}>
            <DraftComposer
              draft={draft}
              onChangeText={typed}
              placeholder={t('Message {name}', { name: selectedName })}
              maxLength={4000}
              enterSends
              onSend={() => void send()}
              sendWays={editing ? [] : sendWays}
              voice={{ recording: talking, start: startTalking, stop: (cancel) => void stopTalking(cancel) }}
              talkie={editing ? null : { on: talkie, onOff: () => toggleTalkie(selectedContact) }}
              vanish={
                editing
                  ? null
                  : {
                      on: vanishing,
                      seconds: vanishFor,
                      choices: TIMERS.slice(1),
                      label: timerLabel,
                      onToggle: () => setVanishing((on) => !on),
                      onChoose: setVanishFor,
                    }
              }
              editing={editing && editing.peer === selected ? { line: messageLine(editing), onClose: stopEditing } : null}
              answering={
                !editing && replying && replying.peer === selected
                  ? {
                      name: replying.mine ? t('You') : selectedName,
                      line: messageLine(replying),
                      onPress: () => goTo(replying.peer, replying.tag),
                      onClose: () => setReplying(null),
                    }
                  : null
              }
              later={
                laterFor !== null
                  ? { line: t('The next photo, file or voice message goes on {when}.', { when: laterLabel(laterFor) }), onCancel: () => setLaterFor(null) }
                  : null
              }
              onSticker={() => afterSheet(() => setStickering(true))}
              panel={
                <ComposerPanel
                  tiles={tiles}
                  quality={{ value: quality, onChange: chooseQuality }}
                  ways={ways}
                  foot={t('A file goes as it is, up to 100 MB, with whatever it says inside. The relay keeps it, encrypted, until {name} takes it, 14 days at most.', { name: selectedName })}
                  page={
                    choosingSafety
                      ? {
                          title: t('Safety message'),
                          onBack: () => setChoosingSafety(false),
                          children: (
                            <>
                              <Text variant="caption" tone="muted">
                                {t('What you typed goes to {name} only if you do not open Erevos for:', { name: selectedName })}
                              </Text>
                              <Row wrap>
                                {SAFETY_HOURS.map((hours) => (
                                  <Chip key={hours} label={timerLabel(hours * 3600)} onPress={() => void sendSafety(hours)} />
                                ))}
                              </Row>
                              <Text variant="caption" tone="muted">
                                {t('The relay keeps it and sends it then by itself, even if this phone is lost, off or taken. Each time you open Erevos, past its password, it moves on that long again. Erevos running in the background does not move it. Delete it in the chat to stop it.')}
                              </Text>
                            </>
                          ),
                        }
                      : choosingLater
                      ? {
                          title: t('Send later'),
                          onBack: () => setChoosingLater(false),
                          children: (
                            <>
                              <LaterPicker onPick={(at) => void sendLater(at)} />
                              <Text variant="caption" tone="muted">
                                {nothingTyped ? `${t('With nothing typed, the next photo, file or voice message goes then.')} ` : ''}
                                {hiddenKey
                                  ? t('The relay keeps it and sends it at that time, even if this phone is off then. In hidden chats the relay has to be reachable now.')
                                  : t('The relay keeps it and sends it at that time, even if this phone is off then.')}
                              </Text>
                            </>
                          ),
                        }
                      : null
                  }
                />
              }
              panelOpen={attaching && shown}
              onPanel={(open) => {
                setAttaching(open);
                if (!open) {
                  setChoosingLater(false);
                  setChoosingSafety(false);
                }
              }}
            />
          </View>
        ) : null}
        <MessageMenu
          key={`menu-${menuTurn}`}
          visible={menuFor !== null && shown}
          onClose={() => setMenuFor(null)}
          line={menuFor ? messageLine(menuFor) : ''}
          way={menuFor ? wayLine(menuFor) : undefined}
          reaction={menuFor?.myReaction}
          onReact={menuFor && theyHave(menuFor) ? (emoji) => void react(menuFor, emoji) : undefined}
          actions={menuFor ? menuActions(menuFor) : []}
        />
        <MessageMenu
          visible={importedMenuFor !== null && shown}
          onClose={() => setImportedMenuFor(null)}
          line={importedMenuFor ? importedMenuFor.text.split('\n')[0].trim() || importedMenuFor.files[0]?.name || mediaText(importedMenuFor.media) : ''}
          actions={importedMenuFor ? importedActions(importedMenuFor) : []}
        />
        <MessageMenu
          visible={smsMenuFor !== null && shown}
          onClose={() => setSmsMenuFor(null)}
          line={smsMenuFor ? smsMenuFor.text.split('\n')[0].trim() || t('Picture') : ''}
          actions={smsMenuFor ? smsActions(smsMenuFor) : []}
        />
        <SmsForward
          message={shown ? smsForwarding : null}
          contacts={shownContacts.map((c) => ({ identity: c.identity, name: c.name, request: c.request, phone: e2e?.phones().find((p) => p.identity === c.identity)?.phone }))}
          onClose={() => setSmsForwarding(null)}
          onNote={setNote}
          onChat={(identity, text) => {
            setSelected(`${CONTACT_PREFIX}${identity}`);
            draft.set((typed) => (typed.trim() ? `${typed}\n${text}` : text));
          }}
        />
        <SpeechSheet sound={shown ? hearing : null} onClose={() => setHearing(null)} />
        <TranslateSheet text={shown ? translating : null} onClose={() => setTranslating(null)} />
        <PollSheet visible={polling && shown} onClose={() => setPolling(false)} onSend={sendPoll} />
        <CardSheet visible={sharingCard && shown} onClose={() => setSharingCard(false)} onSend={sendCard} among={among} />
        <PlaceSheet
          visible={placing && shown}
          onClose={() => setPlacing(false)}
          onSend={sendPlace}
          said={t('{name} gets this place once, end-to-end encrypted. Erevos does not follow where you go after.', { name: selectedName })}
        />
        <ConnectPicker visible={picking && shown && !!connecting} among={among} identity={connecting ?? ''} onPick={(card) => void connectTo(card)} onClose={() => setPicking(false)} note={pickNote} />
        <Sheet visible={stickering && shown} onClose={() => setStickering(false)} title={t('Send a sticker')}>
          <StickerPicker onPick={sendSticker} mine={{ place: stickerPlace, onPick: sendOwnSticker }} />
        </Sheet>
        {placeWhere ? (
          <Sheet visible={makingGroup && shown} onClose={() => setMakingGroup(false)} title={t('New group')}>
            <GroupsWhereProvider value={placeWhere}>
              <NewGroupForm
                onMade={(id) => {
                  setMakingGroup(false);
                  setShownGroup(id);
                }}
              />
            </GroupsWhereProvider>
          </Sheet>
        ) : null}
        <Sheet visible={!!forwarding && shown} onClose={() => setForwarding(null)} title={t('Forward to')}>
          {forwarding ? (
            <>
              <Text variant="caption" tone="muted" numberOfLines={2}>
                {forwarding.map((m) => messageLine(m)).join(' · ')}
              </Text>
              {shownContacts
                .filter((c) => !c.request)
                .map((c) => (
                  <TextButton key={c.identity} title={label(`${CONTACT_PREFIX}${c.identity}`, shownContacts)} onPress={() => void forwardAllTo(forwarding, `${CONTACT_PREFIX}${c.identity}`)} />
                ))}
              {forwardGroups.map((group) => (
                <TextButton key={group.id} title={t('{name} (group)', { name: group.name })} onPress={() => void forwardToGroupChat(forwarding, group.id)} />
              ))}
              <Text variant="caption" tone="muted">
                {t('It goes as a copy, sent anew and end-to-end encrypted, marked as forwarded but not from where.')}
              </Text>
            </>
          ) : null}
        </Sheet>
        {shown ? <UndoBar bottom={undoAt + space.sm} /> : null}
        <FileViewer
          file={viewing?.file ?? viewingImported}
          uri={viewing?.file ? photos[viewing.file.id] : viewingImported ? photos[viewingImported.id] : undefined}
          onSave={(choose) => (viewing ? void saveAttachment(viewing, choose) : viewingImported && void saveImported(viewingImported, choose))}
          onOpen={viewing?.file ? () => openRefWith(viewing.file!) : undefined}
          once={!!viewing?.file?.once}
          onClose={() => {
            if (viewing?.file?.once && !viewing.mine) seenOnce(viewing);
            setViewing(null);
            setViewingImported(null);
          }}
        />
        <ChatMedia
          visible={mediaOpen && shown && !!selected}
          items={media}
          name={selectedName}
          onClose={() => setMediaOpen(false)}
          onShow={(item) => {
            holdScroll.current = true;
            goTo(selected ?? '', item.tag);
          }}
        />
        <DayCalendar
          visible={dayPicking && shown && !!selected}
          days={chatDays}
          start={visible[visible.length - 1]?.at ?? imported[imported.length - 1]?.at ?? Date.now()}
          onPick={(day) => {
            setDayPicking(false);
            setTimeout(() => goToDay(day), Platform.OS === 'web' ? 0 : 300);
          }}
          onClose={() => setDayPicking(false)}
        />
        <ChatNotifySheet
          visible={notifying && shown && !!selectedContact}
          onClose={() => setNotifying(false)}
          title={t('Notifications for {name}', { name: selectedName })}
          notify={selectedNotify}
          hidden={!!hiddenKey}
          onChange={changeNotify}
        />
        <PasswordSheet
          visible={pinAsk === 'on' && shown}
          title={t('Lock this chat with a PIN')}
          repeat
          hint={t('Asked each time the chat opens. Only this phone knows it.')}
          submitLabel={t('Lock')}
          onClose={() => setPinAsk(null)}
          onSubmit={lockWithPin}
        />
        <PasswordSheet
          visible={pinAsk === 'off' && shown}
          title={t('Type its PIN to take it off')}
          repeat={false}
          submitLabel={t('Take it off')}
          onClose={() => setPinAsk(null)}
          onSubmit={takePinOff}
        />
        {gated && shown ? (
          <ChatPinGate name={selectedName} active={focused && appActive} open={openWithPin} forgot={lock.passwordLock ? forgotPin : undefined} onBack={goBack} />
        ) : null}
      </View>
    </SwipeBack>
  );
}

const layout = StyleSheet.create({
  screen: {
    flex: 1,
  },
  gone: {
    display: 'none',
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
