// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import * as Linking from "expo-linking";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";

import {
  MIN_BACKUP_PASSWORD,
  PasswordSheet,
} from "../components/PasswordSheet";
import { useMode } from "../components/mode-picker";
import { NextcloudSignIn } from "../components/nextcloud-sign-in";
import { serverTorLine, TorSwitch } from "../components/tor-switch";
import {
  Button,
  Card,
  Chip,
  Field,
  font,
  Input,
  Page,
  Row,
  SectionTitle,
  Sheet,
  Text,
} from "../components/ui";
import { ask, choose as chooseOne, confirm } from "../lib/alert";
import { locale, mark, plural, t } from "../lib/i18n";
import {
  cloudLabel,
  cloudParts,
  cloudServer,
  CLOUD_RESTORE_MOST,
  fetchFromCloud,
  listCloud,
  loadCloudBackup,
  sendToCloud,
  setCloudTor,
  startCloudBackup,
  stopCloudBackup,
  tooLargeText,
  type CloudBackup,
  type CloudFile,
  type CloudServer,
} from "../lib/backup-cloud";
import { canTor } from "../lib/core";
import { FDROID } from "../lib/distribution";
import {
  beginDriveSignIn,
  driveLeftBehind,
  driveParts,
  driveRestoreAccount,
  fetchFromDrive,
  forgetDriveRestore,
  listDrive,
  loadDriveBackup,
  stopDriveBackup,
  takeDriveSignIn,
  type DriveAccount,
  type DriveBackup,
  type DriveFile,
  type DrivePurpose,
} from "../lib/google-drive";
import { CAN_DRIVE } from "../lib/google-drive-ids";
import { onTorReady } from "../lib/relay";
import {
  CAN_AUTO_BACKUP,
  CAN_BACK_UP,
  CAN_CLOUD_BACKUP,
  CAN_CLOUD_RESTORE,
  changeAutoBackup,
  CLOUD_NEEDS_CORS,
  folderLabel,
  KEEP,
  loadAutoBackup,
  partsIn,
  pickFolder,
  pickParts,
  PICKS_PART_FILES,
  checkBackupsNow,
  checkFolderFully,
  checkMadeBackup,
  checkSentBackup,
  folderOfAnotherApp,
  runAutoBackup,
  startAutoBackup,
  stopAutoBackup,
  writeBackup,
  type AutoBackup,
  type PartSource,
} from "../lib/backup-folder";
import {
  backsUpCalls,
  callCounts,
  canBackUpCalls,
  phoneCallsForBackup,
  putPhoneCalls,
  setBacksUpCalls,
} from "../lib/backup-calls";
import {
  checkedWhole,
  loadChecks,
  saveCheck,
  type Checked,
  type Checks,
} from "../lib/backup-check";
import { phoneSettingsForBackup } from "../lib/backup-native";
import { afterRestore, beforeRestore } from "../lib/backup-settings";
import {
  backsUpSms,
  canBackUpSms,
  phoneSmsForBackup,
  setBacksUpSms,
  smsCounts,
  SMS_PICTURES_MB,
} from "../lib/backup-sms";
import { takeHandedServer } from "../lib/backup-pieces";
import { pickFile, TooLargeError } from "../lib/pick-file";
import { SHELL } from "../lib/shell";
import { EDITION } from "../lib/edition";
import {
  keepNetworksForBackup,
  networksRestored,
  type NetworksKept,
} from "../lib/backup-networks";
import { holdReceiver } from "../lib/receiver";
import {
  backupKey,
  backupNative,
  backupPhoneCalls,
  backupPhoneSms,
  DamagedPartError,
  makeBackup,
  openBackup,
  restoreBackup,
  WrongBackupPasswordError,
  type Backup,
  type MissingPartError,
  type PartMade,
} from "../lock/backup";
import { openCollectionSkips, openCollectionsLeftOut } from "../lock/collection-data";
import { useLock } from "../lock/context";
import { phoneStatus } from "../modules/erevos-phone";
import { lostAt, markLost, restoredFromOther } from "../lock/restored";
import { importPhoneSms, smsStatus } from "../modules/erevos-sms";
import { useTheme } from "../theme/context";
import {
  measureAppSpace,
  spaceText,
  wholeBackupAtMost,
  type SpaceRow,
} from "../lib/app-space";
import { canFindLeftovers } from "../lib/leftovers";
import { LeftoversCard } from "../components/leftovers";
import { device as phoneDevice } from "../modules/erevos-device";
import { tellBackupMade, tellBackupSent } from "../lib/backup-notice";
import { beginBackupMaking, clearBackupMadeNote, useBackupMaking, type BackupTold, type MadeNote } from "../lib/backup-making";

// Backups of everything Erevos keeps on the phone or computer (lock/backup.ts): made by hand into a folder the
// owner picks, made by themselves every 6 hours, day or week (lib/backup-folder.ts), and put back. Every
// space shows the same screen and the same settings, and a backup holds every space, so nothing
// here says how many there are. On Android a backup can hold the phone's SMS and MMS too
// (lib/backup-sms.ts), put back into the phone's SMS when it is restored, and its call history and
// blocked numbers (lib/backup-calls.ts), added to the phone's. On Android, automatic
// backups can go to a server too (lib/backup-cloud.ts), once the owner gives one, and a backup there
// can be restored from the server itself; in the desktop app too, and in the web app, which makes
// no backups by itself, one sent there when the owner asks. On Android they can go to Google Drive
// as well (lib/google-drive.ts), once the owner signs in with Google there, each time after a
// warning of what Google learns, and a backup there can be restored from Google Drive itself; in a
// build with no client ID of Google's for the app (lib/google-drive-ids.ts), nothing of it shows. A
// backup's photos, files and voice messages are in parts beside it (lock/backup.ts): restored, they
// are read from where the backup came from, the server or Google Drive, or the folder automatic
// backups go to, else from the folder or files the owner chooses; all of them are there, and open,
// before anything is replaced. Should one be missing or damaged, the screen says which, and the
// owner may restore all the rest without such files: the photos, files and voice messages on the
// phone then stay as they are.
//
// A backup made by hand goes into a folder the owner picks, or to a server (Make a backup → To a
// server), the same as automatic backups go to, which the owner gives there if there is none yet:
// with automatic backups on, one goes there now with their password; otherwise with a password of
// its own. Either is checked right after it is made (lib/backup-folder.ts checkMadeBackup,
// checkSentBackup), and what is said of it names its size in all, the files beside it with it,
// when it began, as its name says, and when it ended, what it holds besides, and what it does not.
//
// The phone a backup came from may be lost or stolen and still on: The old phone was lost marks
// this phone so (lock/restored.ts markLost), and each space and hidden place a backup put back here
// moves every relay queue that phone knows as it next opens (lib/queue-move.ts). The mark is the
// phone's, so the button and what it says are the same in every space. After a restore of a
// backup from another phone, the card points at it; nothing moves until it is pressed.

// What the password sheet is for: a backup made now, automatic backups' password, or a backup to open.
// A backup to open says the server or the Google Drive it came from, if one: its parts are there too.
type Asking =
  | { kind: "make"; folder: string }
  | { kind: "auto"; every: number; folder: string }
  | { kind: "open"; bytes: Uint8Array; name: string; server?: CloudServer; drive?: DriveAccount }
  | { kind: "cloud" }
  | null;

// A backup file larger than this is not one Erevos made: every space's chats are far smaller. One
// from a server comes up to 100 MB only (CLOUD_RESTORE_MOST), as any download (lib/net-http.ts).
// What Erevos+ says of the networks in a backup (#67, #68): what goes in, what does not, and how they come back.
const NETWORKS_LEFT = mark(
  "Session's account and chats go into a backup, sealed with its password and the first space's; a restore puts them back once the first space opens, where this phone has no other Session account. Its photos and files do not go in: Session gives them again while it keeps them. Signal's history goes in too, its chats and messages without their photos and files, but not its link to the account: after a restore, register or link Signal again, and the old messages show beside the new ones, to read only. Messenger's sign-in goes in, sealed the same way, and Telegram's, sealed with its space's: after a restore they are signed in again, and their chats come back as far as each network keeps them. A sign-in so restored is the old phone's own: use it on one phone only. On the old phone delete Erevos+, but do not sign out there, or the new phone is signed out too.",
);
const MAX_BYTES = 200 * 1024 * 1024;

const CHOICES = [
  { label: mark("Off"), every: 0 },
  { label: mark("Every 6 hours"), every: 0.25 },
  { label: mark("Every day"), every: 1 },
  { label: mark("Every week"), every: 7 },
];

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// What Erevos runs on here: the desktop app is the web build, and so are the Sailfish OS app and
// the web app in a browser, on an iPhone or a computer.
const DEVICE =
  Platform.OS !== "web" || SHELL === "sailfish"
    ? "phone"
    : SHELL
      ? "computer"
      : "device";
// The same, as the sentences below name it, translated where it is shown.
const THIS_DEVICE =
  DEVICE === "phone"
    ? mark("this phone")
    : DEVICE === "computer"
      ? mark("this computer")
      : mark("this device");
const PLACES =
  Platform.OS !== "web"
    ? mark(
        "Choose a folder, on the phone, a memory card or a cloud app that shows its folders, then a password for the backup.",
      )
    : SHELL === "sailfish"
      ? mark(
          "Backups go to Documents/Erevos on the phone. Choose a password for the backup; then copy the file from there to a memory card or another device.",
        )
      : SHELL
        ? mark(
            "Choose a folder, on this computer, a USB stick or a folder a cloud app keeps in step, then a password for the backup.",
          )
        : mark(
            "Choose a password for the backup, then where to save the file: on an iPhone in Files, iCloud Drive or another app, on a computer in its downloads.",
          );

export default function Backups() {
  const { closeNow } = useLock();
  const { colors } = useTheme();
  const [auto, setAuto] = useState<AutoBackup | null>(null);
  const [asking, setAsking] = useState<Asking>(null);
  // What the sheet asked last, so its title stays while it closes.
  const asked = useRef<Asking>(null);
  if (asking) asked.current = asking;
  const sheet = asking ?? asked.current;
  const [note, setNote] = useState("");
  const [failed, setFailed] = useState(false);
  // A backup made by hand into a folder, as it goes: what it does now, and how far (0–100) when
  // that is known; and whether the note is about it, said in its own card.
  // A backup into a folder, made here: kept outside the screen (lib/backup-making.ts), so coming
  // back to it while one is made shows how far it is, and then how it ended.
  const { making, note: madeNote } = useBackupMaking();
  const [busyHere, setBusy] = useState(false);
  const busy = busyHere || making !== null;
  const [space, setSpace] = useState<SpaceRow[] | null>(null);
  const [measuring, setMeasuring] = useState(false);
  // A backup sent to the server by hand has a password of its own, so a key of its own: it can
  // name no part of an earlier one, and every part goes again. Its password sheet says so before
  // it starts, with about how much that is where the phone can measure it.
  const [whole, setWhole] = useState<number | null>(null);
  const askingKind = asking?.kind;
  useEffect(() => {
    if (askingKind !== "cloud") return;
    let live = true;
    setWhole(null);
    void wholeBackupAtMost().then(
      (bytes) => {
        if (live) setWhole(bytes);
      },
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [askingKind]);
  // A folder or file picker is open: a second tap opens no second one.
  const picking = useRef(false);
  // Whether backups hold the phone's SMS and MMS, and its calls and blocked numbers.
  const [smsToo, setSmsToo] = useState(false);
  const [callsToo, setCallsToo] = useState(false);
  // The server automatic backups go to as well, and what is typed to add one or to restore from one.
  const [cloud, setCloud] = useState<CloudBackup | null>(null);
  const [checks, setChecks] = useState<Checks>({ folder: null, server: null, drive: null });
  const [checking, setChecking] = useState(false);
  const [fully, setFully] = useState("");
  const stopFull = useRef(false);
  // A server's fields shown: to add one, under To a server too (add) or Make a backup (make), or to restore from one;
  // or, from the first start, the server automatic backups go to (start).
  const [form, setForm] = useState<"add" | "make" | "restore" | "start" | null>(null);
  const adding = form === "add";
  // The backups on a server to restore from, newest first, once listed.
  const [listed, setListed] = useState<{
    server: CloudServer;
    files: CloudFile[];
  } | null>(null);
  const [address, setAddress] = useState("");
  const [user, setUser] = useState("");
  const [secret, setSecret] = useState("");
  // The server's own Tor switch, as the form to add one or to restore from one shows it: the
  // server's when there is one, kept with it (lib/backup-cloud.ts), else this screen's until then.
  const [serverTor, setServerTor] = useState(false);
  // Whether the last backup put back here came from another phone, and when the old phone was said lost since (0: not).
  const [lost, setLost] = useState<{ other: boolean; at: number } | null>(null);
  // Google Drive, which automatic backups go to as well once the owner signed in with Google there.
  const [drive, setDrive] = useState<DriveBackup | null>(null);
  // In F-Droid's build, which has no Google Drive: when the last backup went there, when they went
  // there from an Erevos installed before it (lib/google-drive.ts driveLeftBehind).
  const [driveLeft, setDriveLeft] = useState<{ last: number } | null>(null);
  // The warning before a sign-in with Google, open for what the sign-in is for.
  const [warnDrive, setWarnDrive] = useState<DrivePurpose | null>(null);
  // The backups in a Google Drive to restore from, newest first, once listed, with its account.
  const [driveListed, setDriveListed] = useState<{
    account: DriveAccount;
    files: DriveFile[];
  } | null>(null);
  // In INVISIBLE the warning says that signing in with Google does not go through Tor.
  const mode = useMode();

  useEffect(() => {
    loadAutoBackup().then(setAuto);
    void loadCloudBackup().then((loaded) => {
      setCloud(loaded);
      if (loaded?.tor) setServerTor(true);
    });
    void loadChecks().then(setChecks);
    if (CAN_DRIVE) void loadDriveBackup().then(setDrive);
    else if (FDROID) void driveLeftBehind().then(setDriveLeft);
    void backsUpSms().then(setSmsToo);
    void backsUpCalls().then(setCallsToo);
    void Promise.all([restoredFromOther(), lostAt()]).then(([other, at]) =>
      setLost({ other, at }),
    );
    // The server backup pieces gave back (app/backup-pieces.tsx): its backups listed at once.
    const handed = takeHandedServer();
    if (handed) void listServer(handed);
  }, []);
  // How backups to the server go through Tor changes as Tor becomes ready.
  const [, setTorTick] = useState(0);
  useEffect(() => onTorReady(() => setTorTick((n) => n + 1)), []);
  // Where the first start's last step chose automatic backups to go (app/first-steps.tsx): they
  // begin here at once, every day, into a folder of this device, to a WebDAV server once it is
  // added, or to Google Drive once signed in there, whose warning the first start showed. Not
  // again when they are on already.
  const { start: startAt } = useLocalSearchParams<{ start?: string }>();
  const begun = useRef(false);
  useEffect(() => {
    if (begun.current || !CAN_AUTO_BACKUP || (startAt !== "device" && startAt !== "webdav" && !(startAt === "drive" && CAN_DRIVE))) return;
    begun.current = true;
    void loadAutoBackup().then((on) => {
      if (on) return;
      if (startAt === "device") void choose(1);
      else if (startAt === "drive") void signInDrive("backup");
      else setForm("start");
    });
  }, [startAt]);
  // Back from Google's sign-in (app/oauth2redirect.tsx): automatic backups go on to Google Drive,
  // or begin there, or its backups are listed to restore one.
  useFocusEffect(
    useCallback(() => {
      if (!CAN_DRIVE) return;
      const purpose = takeDriveSignIn();
      if (purpose === "backup") void driveSigned();
      else if (purpose === "restore") {
        const account = driveRestoreAccount();
        if (account) void listDriveBackups(account);
      }
    }, []),
  );

  if (!CAN_BACK_UP) {
    return (
      <Page>
        <Text variant="title">{t("Backups")}</Text>
        <Text tone="muted">
          {t("Backups work on Android and in the desktop app.")}
        </Text>
      </Page>
    );
  }

  // `made`: said of a backup made by hand, in its own card, while its space stays open
  // (lib/backup-making.ts), with what the check right after it found (`checked`), and how to
  // check it again (`again`).
  function say(text: string, bad = false, made: BackupTold | null = null, checked?: MadeNote["checked"], again?: MadeNote["again"]) {
    if (made) {
      made.note(text ? { text, bad, ...(checked ? { checked } : {}), ...(again ? { again } : {}) } : null);
      setNote("");
      return;
    }
    clearBackupMadeNote();
    setNote(text);
    setFailed(bad);
  }

  async function chooseFolder(): Promise<string | null> {
    if (picking.current) return null;
    picking.current = true;
    try {
      const folder = await pickFolder();
      if (!folder) say(t("No folder chosen."));
      return folder;
    } finally {
      picking.current = false;
    }
  }

  async function make() {
    say("");
    const folder = await chooseFolder();
    if (folder) setAsking({ kind: "make", folder });
  }

  async function choose(every: number) {
    say("");
    if (every === (auto?.every ?? 0)) return;
    if (!every) {
      // The server stays, for backups sent by hand (lib/backup-folder.ts).
      await stopAutoBackup();
      setAuto(null);
      setChecks(await loadChecks());
      say(
        t(
          "Automatic backups are off. The ones already made stay in their folder.",
        ),
      );
      return;
    }
    if (auto) {
      setAuto(await changeAutoBackup({ every }));
      say(t("Saved."));
      return;
    }
    const folder = await chooseFolder();
    if (folder) setAsking({ kind: "auto", every, folder });
  }

  async function moveAuto() {
    if (!auto) return;
    say("");
    const folder = await chooseFolder();
    if (!folder) return;
    await changeAutoBackup({ folder });
    await backUpNow();
  }

  // Check again, under what the check of a backup made by hand found: the same backup, once more,
  // its progress shown as a backup's is.
  async function checkMadeAgain() {
    const note = madeNote;
    if (!note?.again || !note.checked) return;
    const told = beginBackupMaking();
    told.making({ step: t("Checking the backup…"), percent: null });
    try {
      const checked = await note.again();
      told.note(checked ? { ...note, checked: { ...note.checked, checked } } : note);
    } finally {
      told.making(null);
    }
  }

  async function checkNow() {
    say("");
    setChecking(true);
    try {
      setChecks(await checkBackupsNow());
    } catch (error) {
      say(errorText(error), true);
    } finally {
      setChecking(false);
    }
  }

  async function checkFully() {
    say("");
    stopFull.current = false;
    setChecking(true);
    setFully(t("Checking the parts: {done} of {count}", { done: 0, count: 0 }));
    try {
      setChecks(
        await checkFolderFully({
          progress: (done, count) =>
            setFully(t("Checking the parts: {done} of {count}", { done, count })),
          stopped: () => stopFull.current,
        }),
      );
    } catch (error) {
      say(errorText(error), true);
    } finally {
      setFully("");
      setChecking(false);
    }
  }

  async function backUpNow() {
    setBusy(true);
    try {
      const { auto: next, cloud: sent, drive: went } = await runAutoBackup(true);
      setAuto(next);
      setCloud(sent);
      setDrive(went);
      setChecks(await loadChecks());
      // What Google Drive got, said after what the folder and the server did.
      const toDrive = went
        ? went.error
          ? t("Not sent to Google Drive. {error}", { error: went.error })
          : t("Sent a backup to Google Drive.")
        : "";
      const sayAll = (text: string, bad = false) =>
        say([text, toDrive].filter(Boolean).join(" "), bad || !!went?.error);
      if (next?.error) sayAll(t("Not made. {error}", { error: next.error }), true);
      else if (next && !next.folder) {
        // No folder here: restored from a backup made elsewhere, or only to the server or Google
        // Drive, as the first start chose; its card says a folder can be chosen too.
        const choosing = t(
          "Automatic backups need a folder on {device}: choose one.",
          { device: t(THIS_DEVICE) },
        );
        if (sent?.error) sayAll(t("Not sent. {error}", { error: sent.error }), true);
        else if (sent)
          sayAll(t("Sent a backup to {server}.", { server: cloudLabel(sent) }));
        else if (went) sayAll("");
        else say(choosing, true);
      } else if (next && sent?.error)
        sayAll(
          t(
            "Made a backup in {folder}, but it did not go to the server. {error}",
            { folder: folderLabel(next.folder), error: sent.error },
          ),
          true,
        );
      else if (next && sent)
        sayAll(
          t("Made a backup in {folder} and sent it to {server}.", {
            folder: folderLabel(next.folder),
            server: cloudLabel(sent),
          }),
        );
      else if (next)
        sayAll(
          t("Made a backup in {folder}.", { folder: folderLabel(next.folder) }),
        );
    } finally {
      setBusy(false);
    }
  }

  async function addServer() {
    // Added from Make a backup: a backup goes there now, and only there. Added from the first
    // start: automatic backups begin, to the server alone until a folder is chosen too.
    const fromMake = form === "make";
    const fromStart = form === "start";
    say("");
    setBusy(true);
    try {
      setCloud(await startCloudBackup(address, user.trim(), secret, serverTor));
      setChecks(await saveCheck("server", null));
      setForm(null);
      setSecret("");
    } catch (error) {
      say(errorText(error), true);
      return;
    } finally {
      setBusy(false);
    }
    if (CAN_AUTO_BACKUP && auto) await (fromMake ? serverNow() : backUpNow());
    else if (CAN_AUTO_BACKUP && fromStart) setAsking({ kind: "auto", every: 1, folder: "" });
    else setAsking({ kind: "cloud" });
  }

  // Make a backup → To a server: with no server yet, its fields first; with automatic backups on,
  // one goes there now with their password; else one with a password of its own.
  function toServer() {
    say("");
    if (!cloud) setForm("make");
    else if (CAN_AUTO_BACKUP && auto) void serverNow();
    else setAsking({ kind: "cloud" });
  }

  // One automatic backup to the server now, none into the folder; checked there as each is.
  async function serverNow() {
    setBusy(true);
    try {
      const { auto: next, cloud: sent } = await runAutoBackup(true, Date.now(), { serverOnly: true });
      setAuto(next);
      setCloud(sent);
      setChecks(await loadChecks());
      if (!sent) return;
      if (sent.error) say(t("Not sent. {error}", { error: sent.error }), true);
      else say(t("Sent a backup to {server}.", { server: cloudLabel(sent) }));
    } catch (error) {
      say(errorText(error), true);
    } finally {
      setBusy(false);
    }
  }

  // The server's own Tor switch: kept with the server when there is one, and shown in its form.
  async function changeServerTor(on: boolean) {
    setServerTor(on);
    if (!cloud) return;
    try {
      const next = await setCloudTor(on);
      if (next) setCloud(next);
    } catch (error) {
      setServerTor(!on);
      say(errorText(error), true);
    }
  }

  async function lostPhone() {
    say("");
    const told = t(
      "Every space and its hidden chats move to new server queues as each next opens here, and your contacts and groups are told quietly. The old queues are read here until each contact writes to the new ones, 14 days at most. The contact links and QR codes you gave before work for 14 days, then no more. What comes through Nostr, XMPP or Matrix still reaches the old phone.",
    );
    if (
      !(await confirm(t("The old phone was lost"), told, t("Move the queues")))
    )
      return;
    const now = Date.now();
    try {
      await markLost(now);
    } catch (error) {
      say(errorText(error), true);
      return;
    }
    setLost((was) => ({ other: was?.other ?? false, at: now }));
  }

  async function stopServer() {
    // Automatic backups with no folder here went only to the server, or to Google Drive too: they
    // stop with it when it was the only place.
    const alone = CAN_AUTO_BACKUP && !!auto && !auto.folder && !drive;
    const told = alone
      ? t(
          "Automatic backups stop too, as they have no folder on {device}. Those already on the server stay there until you delete them.",
          { device: t(THIS_DEVICE) },
        )
      : CAN_AUTO_BACKUP && auto && drive
        ? auto.folder
          ? t(
              "Automatic backups will go only to the folder and Google Drive from now on. Those already on the server stay there until you delete them.",
            )
          : t(
              "Automatic backups will go only to Google Drive from now on. Those already on the server stay there until you delete them.",
            )
        : CAN_AUTO_BACKUP && auto
          ? t(
              "Automatic backups will go only to the folder from now on. Those already on the server stay there until you delete them.",
            )
          : t(
              "Erevos forgets the server and its password here. The backups already on it stay there until you delete them.",
            );
    if (!(await confirm(t("Stop sending to the server"), told))) return;
    await stopCloudBackup();
    setCloud(null);
    if (alone) {
      await stopAutoBackup();
      setAuto(null);
    }
    setChecks(await (alone ? loadChecks() : saveCheck("server", null)));
    say(t("Backups no longer go to the server."));
  }

  // Google's page in the browser, outside Erevos, for automatic backups to Google Drive or a
  // restore from it: the browser comes back to app/oauth2redirect.tsx, then here.
  async function signInDrive(purpose: DrivePurpose) {
    say("");
    try {
      await Linking.openURL(await beginDriveSignIn(purpose));
    } catch (error) {
      say(errorText(error), true);
    }
  }

  // Signed in with Google for automatic backups: they go there now, or begin, every day, with only
  // Google Drive until a folder is chosen too.
  async function driveSigned() {
    const [on, signed] = await Promise.all([loadAutoBackup(), loadDriveBackup()]);
    setAuto(on);
    setDrive(signed);
    setChecks(await saveCheck("drive", null));
    if (!CAN_AUTO_BACKUP || !signed) return;
    if (on) await backUpNow();
    else setAsking({ kind: "auto", every: 1, folder: "" });
  }

  async function stopDrive() {
    // Automatic backups with no folder here and no server went only to Google Drive: they stop with it.
    const alone = CAN_AUTO_BACKUP && !!auto && !auto.folder && !cloud;
    const told = alone
      ? t(
          "Automatic backups stop too, as they have no folder on {device}. Those already in your Google Drive stay there until you delete them.",
          { device: t(THIS_DEVICE) },
        )
      : t(
          "Google takes back Erevos's access to your Google Drive, and Erevos forgets the sign-in here. The backups already there stay until you delete them.",
        );
    if (!(await confirm(t("Stop sending to Google Drive"), told))) return;
    say("");
    setBusy(true);
    let taken: boolean;
    try {
      taken = await stopDriveBackup();
    } finally {
      setBusy(false);
    }
    setDrive(null);
    setDriveLeft(null);
    if (alone) {
      await stopAutoBackup();
      setAuto(null);
    }
    setChecks(await (alone ? loadChecks() : saveCheck("drive", null)));
    if (taken) say(t("Backups no longer go to Google Drive."));
    else
      say(
        t(
          "Backups no longer go to Google Drive, but Google could not be reached to take back Erevos's access: you can take it back in your Google account's security settings.",
        ),
        true,
      );
  }

  // Lists the backups in the Google Drive automatic backups go to, or in the one signed in to for
  // a restore.
  async function listDriveBackups(account: DriveAccount) {
    say("");
    setBusy(true);
    try {
      const files = await listDrive(account);
      if (!files.length) {
        setDriveListed(null);
        say(t("There is no Erevos backup in that Google Drive."), true);
      } else setDriveListed({ account, files });
    } catch (error) {
      say(errorText(error), true);
    } finally {
      setBusy(false);
    }
  }

  // With automatic backups going to Google Drive, its backups at once; else a sign-in with Google
  // for the restore alone, after the warning.
  function restoreFromDrive() {
    say("");
    if (drive) void listDriveBackups(drive);
    else setWarnDrive("restore");
  }

  async function openFromDrive(file: DriveFile) {
    if (!driveListed) return;
    // Google Drive said how large it is: one too large is not downloaded only to be stopped.
    if (file.size > CLOUD_RESTORE_MOST) {
      say(tooLargeText(CLOUD_RESTORE_MOST), true);
      return;
    }
    say("");
    setBusy(true);
    try {
      const { account } = driveListed;
      const bytes = await fetchFromDrive(account, file, CLOUD_RESTORE_MOST);
      setDriveListed(null);
      setAsking({ kind: "open", bytes, name: fileText(file), drive: account });
    } catch (error) {
      say(errorText(error), true);
    } finally {
      setBusy(false);
    }
  }

  async function pickBackup() {
    if (picking.current) return;
    say("");
    picking.current = true;
    try {
      const picked = await pickFile(MAX_BYTES);
      if (picked) setAsking({ kind: "open", ...picked });
    } catch (error) {
      if (error instanceof TooLargeError)
        say(t("That file is not an Erevos backup."), true);
      else
        say(
          t("Could not read that file. {error}", { error: errorText(error) }),
          true,
        );
    } finally {
      picking.current = false;
    }
  }

  // Lists the backups on the server automatic backups go to, or on the one typed in.
  async function listServer(server: CloudServer | null) {
    say("");
    setBusy(true);
    try {
      const chosen = server ?? cloudServer(address, user, secret, serverTor);
      const files = await listCloud(chosen);
      setForm(null);
      setSecret("");
      if (!files.length) {
        setListed(null);
        say(t("There is no Erevos backup in that folder."), true);
      } else setListed({ server: chosen, files });
    } catch (error) {
      say(errorText(error), true);
    } finally {
      setBusy(false);
    }
  }

  function restoreFromServer() {
    if (cloud) void listServer(cloud);
    else setForm("restore");
  }

  async function openFromServer(file: CloudFile) {
    if (!listed) return;
    // The server said how large it is: one too large is not downloaded only to be stopped.
    if (file.size > CLOUD_RESTORE_MOST) {
      say(tooLargeText(CLOUD_RESTORE_MOST), true);
      return;
    }
    say("");
    setBusy(true);
    try {
      const bytes = await fetchFromCloud(
        listed.server,
        file.name,
        CLOUD_RESTORE_MOST,
      );
      setListed(null);
      setAsking({
        kind: "open",
        bytes,
        name: fileText(file),
        server: listed.server,
      });
    } catch (error) {
      say(errorText(error), true);
    } finally {
      setBusy(false);
    }
  }

  // The fields of a server: its folder's address, user name and password.
  const serverFields = (
    <>
      <TorSwitch
        on={serverTor}
        onChange={(on) => void changeServerTor(on)}
        disabled={busy}
        said={serverTorLine(serverTor)}
      />
      <NextcloudSignIn
        folder="backups"
        disabled={busy}
        tor={serverTor}
        onSigned={(server) => {
          setAddress(server.url);
          setUser(server.user);
          setSecret(server.password);
        }}
      />
      <Field
        label={t("Folder address (WebDAV)")}
        hint={t(
          "In Nextcloud: Files → Files settings → WebDAV gives the start; add a folder you made for backups, like …/remote.php/dav/files/NAME/Backups",
        )}
      >
        <Input
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="https://"
          accessibilityLabel={t("Folder address (WebDAV)")}
        />
      </Field>
      <Field label={t("User name")}>
        <Input
          value={user}
          onChangeText={setUser}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t("User name")}
        />
      </Field>
      <Field
        label={t("Password")}
        hint={t(
          "Best an app password made for Erevos alone, in the server's security settings: you can take it back there without changing your own.",
        )}
      >
        <Input
          value={secret}
          onChangeText={setSecret}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t("Password")}
        />
      </Field>
    </>
  );
  const serverReady = !!address.trim() && !!user.trim() && !!secret;

  async function toggleSms() {
    await setBacksUpSms(!smsToo);
    setSmsToo(!smsToo);
  }

  async function toggleCalls() {
    await setBacksUpCalls(!callsToo);
    setCallsToo(!callsToo);
  }

  // Says how far a backup's photos, files and voice messages are, made or put back, as they go.
  const shownPercent = useRef(-1);
  // `made`: a backup into a folder, said in its own card (making).
  function progress(making: boolean, made: BackupTold | null = null) {
    shownPercent.current = -1;
    return (done: number, all: number) => {
      const percent = Math.floor((done * 100) / Math.max(1, all));
      if (percent === shownPercent.current) return;
      shownPercent.current = percent;
      if (making && made) {
        made.making({
          step: t("Encrypting photos, files and voice messages…"),
          percent,
        });
        return;
      }
      say(
        making
          ? t(
              "Making the backup: photos, files and voice messages, {percent}%…",
              { percent },
            )
          : t("Putting back photos, files and voice messages: {percent}%…", {
              percent,
            }),
      );
    };
  }

  // Where a backup's files beside it are, said after it is made.
  function partsText(parts: number): string {
    return parts > 0
      ? ` ${plural(parts, "Its photos, files and voice messages are in {n} more file beside it, with the same start: keep them together.", "Its photos, files and voice messages are in {n} more files beside it, with the same start: keep them together.")}`
      : "";
  }

  // What a restore without some of the backup's files leaves as it is, and does not bring back.
  const withoutText = (n: number) =>
    plural(
      n,
      "Restore everything else without it? The photos, files and voice messages on {device} stay as they are, and those it holds do not come back.",
      "Restore everything else without them? The photos, files and voice messages on {device} stay as they are, and those they hold do not come back.",
      { device: t(THIS_DEVICE) },
    );
  const notThereText = (missing: string[]) =>
    plural(
      missing.length,
      "A file of this backup is not there: {name}.",
      "{n} files of this backup are not there, {name} among them.",
      { name: missing[0] },
    );

  // Asked when a file of the backup is missing or damaged: whether to restore the rest without it.
  const restoreWithout = (error: MissingPartError | DamagedPartError) =>
    chooseOne(
      t("Restore a backup"),
      `${error instanceof DamagedPartError ? t("A file of this backup is damaged, or belongs to another backup: {name}.", { name: error.part }) : notThereText([error.part])} ${withoutText(1)}`,
      t("Cancel"),
      t("Restore the rest"),
    );

  // Where the parts of a backup being opened are: on the server or in the Google Drive it came
  // from, in the folder automatic backups go to, else where the owner chooses. With those not
  // there named, the owner may restore the rest without them (`without`). Null when the owner
  // went back.
  async function findParts(
    names: string[],
    server: CloudServer | undefined,
    fromDrive?: DriveAccount,
  ): Promise<{ source: PartSource | null; without: boolean } | null> {
    const found = async (source: PartSource | null, missing: string[]) => {
      if (!missing.length) return { source, without: false };
      return (await chooseOne(
        t("Restore a backup"),
        `${notThereText(missing)} ${withoutText(missing.length)}`,
        t("Cancel"),
        t("Restore the rest"),
      ))
        ? { source, without: true }
        : null;
    };
    if (server) {
      const there = await cloudParts(server);
      return found(there, there.missing(names));
    }
    if (fromDrive) {
      const there = await driveParts(fromDrive);
      return found(there, there.missing(names));
    }
    // A backup in the folder automatic backups go to has its files beside it there.
    if (auto?.folder) {
      const there = await partsIn(auto.folder).catch(() => null);
      if (there && there.missing(names).length === 0)
        return { source: there, without: false };
    }
    const go = await chooseOne(
      t("Restore a backup"),
      PICKS_PART_FILES
        ? plural(
            names.length,
            "This backup's photos, files and voice messages are in {n} more file beside it, whose name starts as its own or as an earlier backup's. Choose it.",
            "This backup's photos, files and voice messages are in {n} more files beside it, whose names start as its own or as an earlier backup's. Choose them all.",
          )
        : plural(
            names.length,
            "This backup's photos, files and voice messages are in {n} more file beside it. Choose the folder the backup is in.",
            "This backup's photos, files and voice messages are in {n} more files beside it. Choose the folder the backup is in.",
          ),
      t("Cancel"),
      PICKS_PART_FILES ? t("Choose the files") : t("Choose the folder"),
    );
    if (!go || picking.current) return null;
    picking.current = true;
    let picked: PartSource | null;
    try {
      picked = await pickParts(names);
    } finally {
      picking.current = false;
    }
    // None chosen: all of them are not there.
    return picked ? found(picked, picked.missing(names)) : found(null, names);
  }

  // When a backup made by hand began and ended, this phone's time; `named`: its name says when it began.
  function timesText(start: number, end: number, named = true): string {
    const said = t("Began {start}, ended {end}.", {
      start: clockText(start),
      end: clockText(end, start),
    });
    return named ? `${said} ${t("The time in its name is when it began.")}` : said;
  }

  // What a backup made now does not hold: Erevos itself and what it keeps for a while only, and
  // the Collections of the open places that it leaves out (lock/collection-data.ts).
  function notInText(out: { byChoice: boolean; onServer: boolean }): string {
    return [
      t("Not in it: Erevos itself, and what it keeps only for a while, such as its cache and Tor’s files."),
      out.onServer
        ? t("Nor the Collection’s files that are whole on its WebDAV server: a restore fetches them from there.")
        : "",
      out.byChoice ? t("Nor the Collection you keep out of backups.") : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  // What a backup holds of the phone's SMS, said after it is made.
  // Erevos+: what the backup holds of the other networks (#67), and of Session's account as it went in.
  function networksText(kept: NetworksKept): string {
    if (EDITION !== "plus") return "";
    const session =
      kept.kind === "failed"
        ? ` ${t("Session's account is not in this backup: {error}", { error: kept.error })}`
        : "";
    // Signal's history, where it could not be read now: the backup holds it as last kept, and says so (#68).
    const signal = kept.signalFailed
      ? ` ${t("Signal's history could not be read now, so this backup holds it as it was last kept, if at all: {error}", { error: kept.signalFailed })}`
      : "";
    // Messenger's and Telegram's sign-ins, where they could not be read now: as last kept (#68).
    const messenger = kept.messengerFailed
      ? ` ${t("Messenger's sign-in could not be read now, so this backup holds it as it was last kept, if at all: {error}", { error: kept.messengerFailed })}`
      : "";
    const telegram = kept.telegramFailed
      ? ` ${t("Telegram's sign-in could not be read now, so this backup holds it as it was last kept, if at all: {error}", { error: kept.telegramFailed })}`
      : "";
    return ` ${t(NETWORKS_LEFT)}${session}${signal}${messenger}${telegram}`;
  }

  function smsText(sms: Uint8Array | null): string {
    const counts = sms ? smsCounts(sms) : null;
    if (!counts) return "";
    const held = ` ${t("It holds {sms} SMS and {mms} MMS of the phone's.", { sms: counts.sms, mms: counts.mms })}`;
    return counts.left > 0
      ? `${held} ${plural(counts.left, "{n} picture did not fit and stayed out.", "{n} pictures did not fit and stayed out.")}`
      : held;
  }

  // What a backup holds of the phone's calls and blocked numbers, said after it is made.
  function callsText(calls: Uint8Array | null): string {
    const counts = calls ? callCounts(calls) : null;
    if (!counts) return "";
    const held = ` ${plural(counts.calls, "It holds {n} call of the phone's.", "It holds {n} calls of the phone's.")}`;
    return counts.blocked > 0
      ? `${held} ${plural(counts.blocked, "{n} blocked number is in it too.", "{n} blocked numbers are in it too.")}`
      : held;
  }

  async function submit(password: string): Promise<boolean | void> {
    if (!asking) return;
    if (asking.kind === "make") {
      const key = await backupKey(password);
      setAsking(null);
      setBusy(true);
      // What it says is kept while this space stays open, and dropped once it closed.
      const made = beginBackupMaking();
      say("", false, made);
      // When it begins, which its name says too.
      const start = Date.now();
      try {
        made.making({
          step: t("Gathering chats, contacts, SMS, calls and settings…"),
          percent: null,
        });
        const phoneSms = await phoneSmsForBackup();
        const phoneCalls = await phoneCallsForBackup();
        const native = await phoneSettingsForBackup();
        // Erevos+: Session's account, kept sealed for it now where the first space is open.
        const networks = await keepNetworksForBackup();
        const skip = await openCollectionSkips();
        const out = await openCollectionsLeftOut();
        made.making({ step: t("Encrypting and saving…"), percent: null });
        const { name, size, parts, partsSize, where } = await writeBackup(
          asking.folder,
          (part) =>
            makeBackup(key, {
              parts: part,
              phoneSms,
              phoneCalls,
              native,
              progress: progress(true, made),
              skip,
            }),
          start,
        );
        const end = Date.now();
        const folder = where ?? folderLabel(asking.folder);
        // Read back from the folder as it lies there, where its files can be listed: in another
        // app's folder, again a few times while that app may still be sending it on.
        made.making({ step: t("Checking the backup…"), percent: null });
        const target = asking.folder;
        const checked = await checkMadeBackup(target, name, key, Date.now(), {
          waiting: (ms) =>
            made.making({
              step: t("Not all there yet: the folder's app may still be sending it to its server. Checking again in {seconds} seconds…", {
                seconds: Math.round(ms / 1000),
              }),
              percent: null,
            }),
        });
        say(
          [
            parts > 0
              ? plural(
                  parts,
                  "Saved {name} in {folder}, with {n} file beside it: {total} in all.",
                  "Saved {name} in {folder}, with {n} files beside it: {total} in all.",
                  { name, folder, total: spaceText(size + partsSize) },
                )
              : t("Saved {name} in {folder}: {total}.", {
                  name,
                  folder,
                  total: spaceText(size),
                }),
            timesText(start, end),
            (partsText(parts) + smsText(phoneSms) + callsText(phoneCalls)).trim(),
            networksText(networks).trim(),
            notInText(out),
            t("Keep its password: nothing opens the backup without it."),
          ]
            .filter(Boolean)
            .join("\n"),
          false,
          made,
          checked ? { where: folder, checked, later: folderOfAnotherApp(target) } : undefined,
          () => checkMadeBackup(target, name, key, Date.now(), { once: true }),
        );
        // The phone's notice names the backup too: not once the space that made it has closed.
        if (made.kept()) tellBackupMade(name, spaceText(size + partsSize), folder, parts);
      } catch (error) {
        say(errorText(error), true, made);
      } finally {
        made.making(null);
        setBusy(false);
      }
    } else if (asking.kind === "cloud") {
      // A backup sent to the server now, with a password of its own: from the web app, which
      // keeps none for backups, and from Make a backup with no automatic backups on.
      const key = await backupKey(password);
      setAsking(null);
      if (!cloud) return;
      setBusy(true);
      const made = beginBackupMaking();
      say("", false, made);
      const start = Date.now();
      try {
        made.making({
          step: t("Gathering chats, contacts, SMS, calls and settings…"),
          percent: null,
        });
        const phoneSms = await phoneSmsForBackup();
        const phoneCalls = await phoneCallsForBackup();
        const native = await phoneSettingsForBackup();
        // Erevos+: Session's account and Signal's history, kept sealed for it now, as into a folder.
        const networks = await keepNetworksForBackup();
        const skip = await openCollectionSkips();
        const out = await openCollectionsLeftOut();
        made.making({ step: t("Encrypting and sending…"), percent: null });
        // The backup's own size, and its parts', to say and to check there.
        let size = 0;
        let named: PartMade[] = [];
        const sent = await sendToCloud(
          cloud,
          async (parts) => {
            const bytes = await makeBackup(key, {
              parts,
              phoneSms,
              phoneCalls,
              native,
              bare: true,
              progress: progress(true, made),
              skip,
              made: (list) => (named = list),
            });
            size = bytes.length;
            return bytes;
          },
          KEEP,
        );
        setCloud(sent);
        if (sent.error) {
          say(t("Not sent. {error}", { error: sent.error }), true, made);
          return;
        }
        const end = Date.now();
        const total = spaceText(size + named.reduce((sum, part) => sum + part.size, 0));
        made.making({ step: t("Checking the backup…"), percent: null });
        const checked = await checkSentBackup(sent, named, size);
        say(
          [
            named.length > 0
              ? plural(
                  named.length,
                  "Sent a backup to {server}, with {n} file beside it: {total} in all.",
                  "Sent a backup to {server}, with {n} files beside it: {total} in all.",
                  { server: cloudLabel(sent), total },
                )
              : t("Sent a backup to {server}: {total}.", {
                  server: cloudLabel(sent),
                  total,
                }),
            timesText(start, end, false),
            (smsText(phoneSms) + callsText(phoneCalls)).trim(),
            networksText(networks).trim(),
            notInText(out),
            t("Keep its password: nothing opens the backup without it."),
          ]
            .filter(Boolean)
            .join("\n"),
          false,
          made,
          checked ? { where: cloudLabel(sent), checked } : undefined,
          () => checkSentBackup(sent, named, size),
        );
        if (made.kept()) tellBackupSent(cloudLabel(sent), total);
      } catch (error) {
        say(errorText(error), true, made);
      } finally {
        made.making(null);
        setBusy(false);
      }
    } else if (asking.kind === "auto") {
      await startAutoBackup(
        asking.every,
        asking.folder,
        await backupKey(password),
      );
      setAsking(null);
      await backUpNow();
    } else {
      let backup: Backup;
      try {
        backup = await openBackup(asking.bytes, password);
      } catch (error) {
        if (error instanceof WrongBackupPasswordError) return false;
        throw error;
      }
      const opening = asking;
      setAsking(null);
      // Its photos, files and voice messages: every part looked for before anything is asked.
      const names = backup.parts?.names ?? [];
      let parts: { source: PartSource | null; without: boolean } | null = {
        source: null,
        without: false,
      };
      if (names.length) {
        setBusy(true);
        try {
          parts = await findParts(names, opening.server, opening.drive);
        } catch (error) {
          parts = null;
          say(errorText(error), true);
        } finally {
          setBusy(false);
        }
        if (!parts) return;
      }
      const { source, without } = parts;
      // The phone's SMS in it go back into the phone's SMS only while Erevos is the SMS app.
      const sms = backupPhoneSms(backup);
      const putSms = !!sms && canBackUpSms() && !!smsStatus()?.isDefault;
      if (sms && !putSms) {
        const without = await chooseOne(
          t("SMS in this backup"),
          t(
            "This backup also holds the phone's SMS. They go back into the phone's SMS only while Erevos is the SMS app: make it the SMS app under Settings → Phone and SMS → SMS, then restore again. Or restore the rest now, without them.",
          ),
          t("Cancel"),
          t("Without the SMS"),
        );
        if (!without) return;
      }
      // So the phone's calls and blocked numbers, only while Erevos is the phone app.
      const calls = backupPhoneCalls(backup);
      const putCalls =
        !!calls && canBackUpCalls() && !!phoneStatus()?.isDefault;
      if (calls && !putCalls) {
        const withoutCalls = await chooseOne(
          t("Calls in this backup"),
          t(
            "This backup also holds the phone's calls and blocked numbers. They go back only into an Android phone, while Erevos is its phone app: make it the phone app under Settings → Phone and SMS → Phone, then restore again. Or restore the rest now, without them.",
          ),
          t("Cancel"),
          t("Without the calls"),
        );
        if (!withoutCalls) return;
      }
      if (
        await confirm(
          t("Replace everything"),
          t(
            "Every space on {device}, with its contacts, messages and hidden chats, will be replaced by what the backup holds. What is here now and not in the backup is gone for good. Then Erevos opens as it was when the backup was made, with the passwords used then.",
            { device: t(THIS_DEVICE) },
          ),
        )
      ) {
        // Nothing may keep what was here over what the backup brings: the receiver stops first,
        // and starts again with the space as restored.
        const release = await holdReceiver();
        let told = "";
        let toldCalls = "";
        let left: string[] = [];
        setBusy(true);
        try {
          const before = await beforeRestore();
          // A part missing or damaged changes nothing, unless the owner wants the rest without it
          // (lock/backup.ts): else said, and Erevos stays as it was.
          try {
            ({ left } = await restoreBackup(
              backup,
              source?.read ?? null,
              progress(false),
              { without: without ? async () => true : restoreWithout },
            ));
          } catch (error) {
            say(errorText(error), true);
            return;
          }
          // Erevos+: Session's account it held goes back as the first space next opens.
          await networksRestored().catch(() => undefined);
          // The settings it held, followed at once, and the phone module's put back.
          await afterRestore(backupNative(backup), before);
          if (sms && putSms) {
            setBusy(true);
            say(t("Putting the SMS back into the phone…"));
            told = await importPhoneSms(sms).then(
              (put) =>
                t(
                  "{sms} SMS and {mms} MMS went back into the phone's SMS. Those it had already stayed as they were.",
                  { sms: put.sms, mms: put.mms },
                ),
              (error) =>
                t("The SMS could not go back into the phone's SMS: {error}", {
                  error: errorText(error),
                }),
            );
          }
          if (calls && putCalls) {
            setBusy(true);
            say(t("Putting the calls back into the phone…"));
            toldCalls = await putPhoneCalls(calls).then(
              (put) =>
                [
                  plural(
                    put.calls,
                    "{n} call went back into the phone's call history.",
                    "{n} calls went back into the phone's call history.",
                  ),
                  put.blocked > 0
                    ? plural(
                        put.blocked,
                        "{n} number went back into its blocked numbers.",
                        "{n} numbers went back into its blocked numbers.",
                      )
                    : "",
                  t("Those it had already stayed as they were."),
                ]
                  .filter(Boolean)
                  .join(" "),
              (error) =>
                t("The calls could not go back into the phone: {error}", {
                  error: errorText(error),
                }),
            );
          }
          // A sign-in for this restore alone is not needed any more.
          forgetDriveRestore();
          closeNow();
        } finally {
          setBusy(false);
          release();
        }
        // Said once Erevos opens again: which of the backup's files did not come back.
        const leftText = left.length
          ? plural(
              left.length,
              "Restored without {n} file of the backup, {name}: the photos, files and voice messages in it did not come back.",
              "Restored without {n} files of the backup, {name} among them: the photos, files and voice messages in them did not come back.",
              { name: left[0] },
            )
          : "";
        if (leftText || told || toldCalls)
          ask(
            leftText || toldCalls ? t("Restore a backup") : t("SMS"),
            [leftText, told, toldCalls].filter(Boolean).join("\n\n"),
            [{ text: t("OK") }],
          );
      }
    }
  }

  async function changePassword() {
    if (auto)
      setAsking({ kind: "auto", every: auto.every, folder: auto.folder });
  }

  const every = auto?.every ?? 0;
  // Whether automatic backups go to the server; otherwise only those sent by hand do.
  const autoOn = CAN_AUTO_BACKUP && !!auto;
  // When automatic backups with no folder last went to the server or Google Drive.
  const sentLast = Math.max(cloud?.last ?? 0, drive?.last ?? 0);
  // A server's fields, with Connect and Cancel, where a server is added.
  const addForm = (
    <>
      {serverFields}
      <Row wrap>
        <Button
          title={busy ? t("One moment…") : t("Connect")}
          compact
          loading={busy}
          onPress={() => void addServer()}
          disabled={busy || !serverReady}
        />
        <Button
          title={t("Cancel")}
          kind="secondary"
          compact
          onPress={() => setForm(null)}
          disabled={busy}
        />
      </Row>
    </>
  );
  return (
    <Page>
      <Text variant="title">{t("Backups")}</Text>
      <Text variant="caption" tone="muted" style={hint}>
        {t(
          "A backup holds everything Erevos keeps on {device}: every space, with its contacts, messages, photos, files, voice messages, imported chats and hidden chats, each still sealed with its own password, and the settings that go with you to another device. The backup has a password of its own too. Its photos, files and voice messages go in files of their own beside it. An automatic backup also needs files of the ones before it: keep the whole folder.",
          { device: t(THIS_DEVICE) },
        )}
      </Text>
      {EDITION === "plus" ? (
        <Text variant="caption" tone="muted" style={hint}>
          {t(NETWORKS_LEFT)}
        </Text>
      ) : null}

      {form === "start" && !cloud ? (
        <>
          <SectionTitle title={t("Automatic backups to a server")} />
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {t(
                "Add the WebDAV folder they go to, such as one in your Nextcloud. Then choose their password: from then on Erevos sends one by itself every day, encrypted.",
              )}
            </Text>
            {addForm}
          </Card>
        </>
      ) : null}

      <SectionTitle title={t("Make a backup")} />
      <Card>
        <Text variant="caption" tone="muted" style={hint}>
          {t(PLACES)}
        </Text>
        {CAN_CLOUD_BACKUP ? (
          <Text variant="caption" tone="muted" style={hint}>
            {cloud
              ? t("Or to {server}, your server: it gets the backup encrypted, under a random name.", { server: cloudLabel(cloud) })
              : t("Or to a folder on a server of yours over WebDAV, such as Nextcloud: it gets the backup encrypted, under a random name.")}
          </Text>
        ) : null}
        <Row wrap>
          <Button
            title={
              making
                ? t("Making the backup…")
                : DEVICE === "device"
                  ? t("Make a backup")
                  : t("Into a folder")
            }
            compact
            onPress={make}
            disabled={busy}
          />
          {CAN_CLOUD_BACKUP ? (
            <Button
              title={
                cloud
                  ? t("To {server}", { server: cloudLabel(cloud) })
                  : t("To a server (WebDAV)")
              }
              kind="secondary"
              compact
              onPress={toServer}
              disabled={busy || form === "make"}
            />
          ) : null}
        </Row>
        {form === "make" ? addForm : null}
        {making ? (
          <View accessibilityLiveRegion="polite" style={{ gap: 6 }}>
            <Text variant="caption" tone="muted">
              {making.percent === null
                ? making.step
                : `${making.step} ${making.percent}%`}
            </Text>
            <View
              style={{
                height: 6,
                borderRadius: 3,
                overflow: "hidden",
                backgroundColor: colors.border,
              }}
            >
              <View
                style={{
                  height: 6,
                  width: `${making.percent ?? 8}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
            <Text variant="caption" tone="faint">
              {t("Keep Erevos open until it is done: a notice says when.")}
            </Text>
          </View>
        ) : null}
        {madeNote && !making ? (
          <Text
            variant="label"
            color={madeNote.bad ? colors.danger : colors.success}
          >
            {madeNote.text}
          </Text>
        ) : null}
        {madeNote?.checked && !making ? (
          <CheckLine
            where={madeNote.checked.where}
            checked={madeNote.checked.checked}
            later={madeNote.checked.later}
          />
        ) : null}
        {madeNote?.checked && madeNote.again && !making && !checkedWhole(madeNote.checked.checked) ? (
          <Row wrap>
            <Button
              title={t("Check again")}
              kind="secondary"
              compact
              onPress={() => void checkMadeAgain()}
              disabled={busy}
            />
          </Row>
        ) : null}
      </Card>

      {canBackUpSms() ? (
        <>
          <SectionTitle title={t("The phone's SMS")} />
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {t(
                "Backups can hold the phone's SMS and MMS too, with up to {mb} MB of their pictures, sealed with the backup's password. Restoring the backup puts back into the phone's SMS each one it does not have, and deletes none.",
                { mb: SMS_PICTURES_MB },
              )}
            </Text>
            {smsToo && !smsStatus()?.isDefault ? (
              <Text variant="caption" color={colors.danger} style={hint}>
                {t(
                  "Erevos reads them only while it is the SMS app: make it the SMS app under Settings → Phone and SMS → SMS.",
                )}
              </Text>
            ) : null}
            <Row wrap>
              <Button
                title={
                  smsToo ? t("Leave the SMS out") : t("Put the SMS in backups")
                }
                kind="secondary"
                compact
                onPress={toggleSms}
                disabled={busy}
              />
            </Row>
          </Card>
        </>
      ) : null}

      {canBackUpCalls() ? (
        <>
          <SectionTitle title={t("The phone's calls")} />
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {t(
                "Backups can hold the phone's call history too, and Android's own list of blocked numbers, sealed with the backup's password. Restoring the backup adds to the phone each call and blocked number it does not have, and deletes none.",
              )}
            </Text>
            {callsToo && !phoneStatus()?.callLog ? (
              <Text variant="caption" color={colors.danger} style={hint}>
                {t(
                  "Erevos reads them only while Android lets it read the call history: make it the phone app under Settings → Phone and SMS → Phone.",
                )}
              </Text>
            ) : null}
            <Row wrap>
              <Button
                title={
                  callsToo
                    ? t("Leave the calls out")
                    : t("Put the calls in backups")
                }
                kind="secondary"
                compact
                onPress={toggleCalls}
                disabled={busy}
              />
            </Row>
          </Card>
        </>
      ) : null}

      {CAN_AUTO_BACKUP ? null : (
        <Text variant="caption" tone="muted" style={hint}>
          {t(
            "A browser saves a file only when you tap, so here Erevos makes no backups by itself. Make one now and then.",
          )}
        </Text>
      )}

      {CAN_AUTO_BACKUP ? (
        <>
          <SectionTitle title={t("Automatic backups")} />
          <Row wrap>
            {CHOICES.map((choice) => (
              <Chip
                key={choice.every}
                label={t(choice.label)}
                selected={every === choice.every}
                onPress={() => void choose(choice.every)}
                disabled={busy}
              />
            ))}
          </Row>
          {auto && !auto.folder && (cloud || drive) ? (
            <Card>
              <Text variant="bodyStrong">
                {cloud && drive
                  ? t("Only to {server} and Google Drive", { server: cloudLabel(cloud) })
                  : cloud
                    ? t("Only to {server}", { server: cloudLabel(cloud) })
                    : t("Only to Google Drive")}
              </Text>
              <Text variant="caption" tone="muted" style={hint}>
                {sentLast
                  ? t("Last one sent {when}.", { when: whenText(sentLast) })
                  : t("None sent yet.")}{" "}
                {t(
                  "Made while Erevos is open, and as it goes to the background, once the last one is older than that. A folder on {device} as well keeps one more copy close at hand.",
                  { device: t(THIS_DEVICE) },
                )}
              </Text>
              {auto.error ? (
                <Text variant="caption" color={colors.danger} style={hint}>
                  {t(
                    "The last one failed: {error} Erevos tries again next time it opens.",
                    { error: auto.error },
                  )}
                </Text>
              ) : null}
              <Row wrap>
                <Button
                  title={busy ? t("One moment…") : t("Back up now")}
                  kind="secondary"
                  compact
                  onPress={backUpNow}
                  disabled={busy}
                />
                {SHELL === "sailfish" ? null : (
                  <Button
                    title={t("Choose a folder")}
                    kind="secondary"
                    compact
                    onPress={moveAuto}
                    disabled={busy}
                  />
                )}
                <Button
                  title={t("Change password")}
                  kind="secondary"
                  compact
                  onPress={changePassword}
                  disabled={busy}
                />
              </Row>
            </Card>
          ) : auto && !auto.folder ? (
            <Card>
              <Text variant="bodyStrong">
                {t("No folder on {device} yet", { device: t(THIS_DEVICE) })}
              </Text>
              <Text variant="caption" tone="muted" style={hint}>
                {driveLeft && !cloud
                  ? t(
                      "Automatic backups went only to Google Drive, and the Erevos from F-Droid sends none there, so none goes anywhere now. Choose a folder on {device}, or add a server, and they go on there.",
                      { device: t(THIS_DEVICE) },
                    )
                  : t(
                      "These automatic backups came with a backup made on another device, with their password; the folder they went to stays with that device. Choose a folder here, and they go on into it.",
                    )}
                {cloud ? ` ${t("Until then they go only to the server.")}` : ""}
              </Text>
              <Row wrap>
                <Button
                  title={t("Choose a folder")}
                  compact
                  onPress={moveAuto}
                  disabled={busy}
                />
                <Button
                  title={t("Change password")}
                  kind="secondary"
                  compact
                  onPress={changePassword}
                  disabled={busy}
                />
              </Row>
            </Card>
          ) : auto ? (
            <Card>
              <Text variant="bodyStrong">
                {t("Into {folder}", { folder: folderLabel(auto.folder) })}
              </Text>
              <Text variant="caption" tone="muted" style={hint}>
                {auto.last
                  ? t("Last one {when}.", { when: whenText(auto.last) })
                  : t("None made yet.")}{" "}
                {t(
                  "Made while Erevos is open, and as it goes to the background, once the last one is older than that. The folder keeps the {n} newest, with the files they need.",
                  { n: KEEP },
                )}
              </Text>
              {auto.error ? (
                <Text variant="caption" color={colors.danger} style={hint}>
                  {t(
                    "The last one failed: {error} Erevos tries again next time it opens.",
                    { error: auto.error },
                  )}
                </Text>
              ) : null}
              <Row wrap>
                <Button
                  title={busy ? t("One moment…") : t("Back up now")}
                  kind="secondary"
                  compact
                  onPress={backUpNow}
                  disabled={busy}
                />
                {SHELL === "sailfish" ? null : (
                  <Button
                    title={t("Change folder")}
                    kind="secondary"
                    compact
                    onPress={moveAuto}
                    disabled={busy}
                  />
                )}
                <Button
                  title={t("Change password")}
                  kind="secondary"
                  compact
                  onPress={changePassword}
                  disabled={busy}
                />
              </Row>
            </Card>
          ) : (
            <Text variant="caption" tone="muted" style={hint}>
              {t(
                "Erevos can make a backup by itself every 6 hours, day or week, into a folder you choose, with a password you set once.",
              )}
            </Text>
          )}
        </>
      ) : null}

      {CAN_CLOUD_BACKUP ? (
        <>
          <SectionTitle title={t("To a server too")} />
          <Card>
            {cloud ? (
              <>
                <Text variant="bodyStrong">
                  {t("To {server}", { server: cloudLabel(cloud) })}
                </Text>
                <Text variant="caption" tone="muted" style={hint}>
                  {cloud.last
                    ? t("Last one sent {when}.", { when: whenText(cloud.last) })
                    : t("None sent yet.")}{" "}
                  {autoOn
                    ? t(
                        "Each automatic backup goes there too, and the server keeps the {n} newest.",
                        { n: KEEP },
                      )
                    : [
                        t(
                          "Send a backup there now and then; the server keeps the {n} newest.",
                          { n: KEEP },
                        ),
                        byHandText(null),
                      ].join(" ")}
                </Text>
                <TorSwitch
                  on={cloud.tor === true}
                  onChange={(on) => void changeServerTor(on)}
                  disabled={busy}
                  said={serverTorLine(cloud.tor === true)}
                />
                {cloud.error ? (
                  <Text variant="caption" color={colors.danger} style={hint}>
                    {autoOn
                      ? t(
                          "The last one did not go: {error} Erevos tries again next time it opens.",
                          { error: cloud.error },
                        )
                      : t("The last one did not go: {error}", {
                          error: cloud.error,
                        })}
                  </Text>
                ) : null}
                <Row wrap>
                  {autoOn ? null : (
                    <Button
                      title={busy ? t("One moment…") : t("Send a backup now")}
                      kind="secondary"
                      compact
                      onPress={() => setAsking({ kind: "cloud" })}
                      disabled={busy}
                    />
                  )}
                  <Button
                    title={t("Stop sending")}
                    kind="secondary"
                    compact
                    onPress={() => void stopServer()}
                    disabled={busy}
                  />
                </Row>
              </>
            ) : adding ? (
              addForm
            ) : (
              <>
                <Text variant="caption" tone="muted" style={hint}>
                  {!autoOn
                    ? t(
                        "A backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV, each time you send one. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.",
                      )
                    : canTor()
                      ? t(
                          "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, when one comes and roughly how big it is, and your address unless the backup goes through Tor, as the space's Tor setting says. Nothing goes until you add one.",
                        )
                      : t(
                          "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.",
                        )}
                </Text>
                {CLOUD_NEEDS_CORS ? (
                  <Text variant="caption" tone="muted" style={hint}>
                    {t(
                      "In a browser this works only with a server set to let the web app in (CORS), which Nextcloud is not as it comes. The desktop app and Android need nothing of it.",
                    )}
                  </Text>
                ) : null}
                <Row wrap>
                  <Button
                    title={t("Add a server")}
                    kind="secondary"
                    compact
                    onPress={() => setForm("add")}
                    disabled={busy || form === "make"}
                  />
                </Row>
              </>
            )}
          </Card>
        </>
      ) : null}

      {CAN_DRIVE && CAN_AUTO_BACKUP ? (
        <>
          <SectionTitle title={t("To Google Drive too")} />
          <Card>
            {drive ? (
              <>
                <Text variant="bodyStrong">{t("To Google Drive")}</Text>
                <Text variant="caption" tone="muted" style={hint}>
                  {drive.last
                    ? t("Last one sent {when}.", { when: whenText(drive.last) })
                    : t("None sent yet.")}{" "}
                  {autoOn
                    ? t(
                        "Each automatic backup goes there too, into the folder named Erevos, which keeps the {n} newest.",
                        { n: KEEP },
                      )
                    : t(
                        "Automatic backups are off, so none goes there. Turn them on to send one every day.",
                      )}
                </Text>
                {drive.error ? (
                  <Text variant="caption" color={colors.danger} style={hint}>
                    {autoOn
                      ? t(
                          "The last one did not go: {error} Erevos tries again next time it opens.",
                          { error: drive.error },
                        )
                      : t("The last one did not go: {error}", {
                          error: drive.error,
                        })}
                  </Text>
                ) : null}
                <Row wrap>
                  {autoOn ? null : (
                    <Button
                      title={t("Turn on automatic backups")}
                      kind="secondary"
                      compact
                      onPress={() => setAsking({ kind: "auto", every: 1, folder: "" })}
                      disabled={busy}
                    />
                  )}
                  {drive.error ? (
                    <Button
                      title={t("Sign in with Google again")}
                      kind="secondary"
                      compact
                      onPress={() => setWarnDrive("backup")}
                      disabled={busy}
                    />
                  ) : null}
                  <Button
                    title={t("Stop sending")}
                    kind="secondary"
                    compact
                    onPress={() => void stopDrive()}
                    disabled={busy}
                  />
                </Row>
              </>
            ) : (
              <>
                <Text variant="caption" tone="muted" style={hint}>
                  {t(
                    "Each automatic backup can also go to your Google Drive, into a folder named Erevos that Erevos makes there. Google gets random bytes under a random name and cannot open them, but it knows your account, when one comes and how big it is. Nothing goes until you sign in with Google.",
                  )}
                </Text>
                <Row wrap>
                  <Button
                    title={t("Sign in with Google")}
                    kind="secondary"
                    compact
                    onPress={() => setWarnDrive("backup")}
                    disabled={busy}
                  />
                </Row>
              </>
            )}
          </Card>
        </>
      ) : null}

      {driveLeft && CAN_AUTO_BACKUP ? (
        <>
          <SectionTitle title={t("To Google Drive too")} />
          <Card>
            <Text variant="bodyStrong">
              {t("No longer sent to Google Drive")}
            </Text>
            <Text variant="caption" tone="muted" style={hint}>
              {driveLeft.last
                ? `${t("Last one sent {when}.", { when: whenText(driveLeft.last) })} `
                : ""}
              {t(
                "The Erevos from F-Droid keeps to services anyone may run, so it sends no backups to Google Drive. Those already there stay until you delete them. Stop sending also takes back, at Google, Erevos's access to your Google Drive.",
              )}
            </Text>
            <Row wrap>
              <Button
                title={t("Stop sending")}
                kind="secondary"
                compact
                onPress={() => void stopDrive()}
                disabled={busy}
              />
            </Row>
          </Card>
        </>
      ) : null}

      {CAN_AUTO_BACKUP && auto?.hard ? (
        <>
          <SectionTitle title={t("Check the backups")} />
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {t(
                "After each automatic backup Erevos reads it back from the folder: it opens with its password, every part it names is there, of its size, and two of them, picked at random, are read through and open too. Of the server it then only looks at what is listed there, so nothing is downloaded. Check now also downloads the server’s newest backup and ten of its parts, and reads ten in the folder.",
              )}
            </Text>
            {auto.folder ? (
              <CheckLine
                where={folderLabel(auto.folder)}
                checked={checks.folder}
                later={folderOfAnotherApp(auto.folder)}
              />
            ) : null}
            {cloud ? (
              <CheckLine where={cloudLabel(cloud)} checked={checks.server} />
            ) : null}
            {drive ? (
              <>
                <Text variant="caption" tone="muted" style={hint}>
                  {t("Google Drive is checked as a server is.")}
                </Text>
                <CheckLine where="Google Drive" checked={checks.drive} />
              </>
            ) : null}
            <Row wrap>
              <Button
                title={checking ? t("Checking…") : t("Check now")}
                kind="secondary"
                compact
                loading={checking}
                onPress={() => void checkNow()}
                disabled={busy || checking}
              />
              {auto.folder ? (
                <Button
                  title={t("Full check of the folder")}
                  kind="secondary"
                  compact
                  onPress={() => void checkFully()}
                  disabled={busy || checking}
                />
              ) : null}
              {fully ? (
                <Button
                  title={t("Cancel")}
                  kind="secondary"
                  compact
                  onPress={() => (stopFull.current = true)}
                />
              ) : null}
            </Row>
            {fully ? (
              <Text variant="caption" style={hint}>
                {fully}
              </Text>
            ) : (
              <Text variant="caption" tone="muted" style={hint}>
                {t(
                  "The full check reads every part in the folder through and compares it with the SHA-256 the backup wrote down for it. It takes a few minutes for many GB, and nothing leaves the phone.",
                )}
              </Text>
            )}
          </Card>
        </>
      ) : null}

      {phoneDevice?.appSpace ? (
        <>
          <SectionTitle title={t("What takes room")} />
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {t(
                "How much room Erevos takes on {device}, by kind: each automatic backup holds it all. Only the files’ names and sizes are looked at, here, and nothing is sent.",
                { device: t(THIS_DEVICE) },
              )}
            </Text>
            {space ? (
              <>
                <Text variant="bodyStrong" style={hint}>
                  {t("In all: {size}", {
                    size: spaceText(
                      space.reduce((sum, row) => sum + row.bytes, 0),
                    ),
                  })}
                </Text>
                {space.map((row) => (
                  <Text key={row.label} variant="caption" style={hint}>
                    {`${row.label}: ${spaceText(row.bytes)} (${row.files})`}
                  </Text>
                ))}
              </>
            ) : null}
            <Row wrap>
              <Button
                title={
                  measuring
                    ? t("One moment…")
                    : space
                      ? t("Measure again")
                      : t("Measure")
                }
                kind="secondary"
                compact
                disabled={measuring}
                onPress={() => {
                  setMeasuring(true);
                  void measureAppSpace()
                    .then(setSpace, (error) => say(errorText(error), true))
                    .finally(() => setMeasuring(false));
                }}
              />
            </Row>
          </Card>
          {canFindLeftovers() ? (
            <>
              <SectionTitle title={t("Leftovers")} />
              <Card>
                <LeftoversCard
                  onDeleted={() =>
                    void measureAppSpace().then(setSpace, () => undefined)
                  }
                />
              </Card>
            </>
          ) : null}
        </>
      ) : null}

      <SectionTitle title={t("Restore")} />
      <Card>
        <Text variant="caption" tone="muted" style={hint}>
          {t(
            "Puts a backup in place of everything on {device}. Chats that went on after the backup was made start anew by themselves; one with a contact whose Erevos is older may need their contact link again. Use a backup on one device at a time.",
            { device: t(THIS_DEVICE) },
          )}
        </Text>
        <Text variant="caption" tone="muted" style={hint}>
          {t(
            "What stays with each device and comes with no backup: the fingerprint, the folders Erevos may write in, what the phone lets it do and which apps make calls and send SMS. An XMPP account comes back as a new device of itself, and Matrix asks you to sign in again.",
          )}
        </Text>
        <Row wrap>
          <Button
            title={t("Restore a backup")}
            kind="secondary"
            compact
            onPress={pickBackup}
            disabled={busy}
          />
          {CAN_CLOUD_RESTORE ? (
            <Button
              title={t("Restore from a server")}
              kind="secondary"
              compact
              onPress={restoreFromServer}
              disabled={busy || form === "restore"}
            />
          ) : null}
          {CAN_CLOUD_RESTORE && CAN_DRIVE ? (
            <Button
              title={t("Restore from Google Drive")}
              kind="secondary"
              compact
              onPress={restoreFromDrive}
              disabled={busy}
            />
          ) : null}
        </Row>
        {form === "restore" ? (
          <>
            <Text variant="caption" tone="muted" style={hint}>
              {t(
                "The folder on your server that automatic backups went to. The password is used for this restore only and not kept.",
              )}
            </Text>
            {serverFields}
            <Row wrap>
              <Button
                title={busy ? t("One moment…") : t("Look there")}
                compact
                loading={busy}
                onPress={() => void listServer(null)}
                disabled={busy || !serverReady}
              />
              <Button
                title={t("Cancel")}
                kind="secondary"
                compact
                onPress={() => setForm(null)}
                disabled={busy}
              />
            </Row>
          </>
        ) : null}
        {listed ? (
          <>
            <Text variant="caption" tone="muted" style={hint}>
              {t(
                "Backups on {server}, newest first. Choose one, then type its password.",
                { server: cloudLabel(listed.server) },
              )}
            </Text>
            <Row wrap>
              {listed.files.slice(0, SHOWN).map((file) => (
                <Button
                  key={file.name}
                  title={fileText(file)}
                  kind="secondary"
                  compact
                  onPress={() => void openFromServer(file)}
                  disabled={busy}
                />
              ))}
              <Button
                title={t("Cancel")}
                kind="secondary"
                compact
                onPress={() => setListed(null)}
                disabled={busy}
              />
            </Row>
          </>
        ) : null}
        {driveListed ? (
          <>
            <Text variant="caption" tone="muted" style={hint}>
              {t(
                "Backups in Google Drive, newest first. Choose one, then type its password.",
              )}
            </Text>
            <Row wrap>
              {driveListed.files.slice(0, SHOWN).map((file) => (
                <Button
                  key={file.id}
                  title={fileText(file)}
                  kind="secondary"
                  compact
                  onPress={() => void openFromDrive(file)}
                  disabled={busy}
                />
              ))}
              <Button
                title={t("Cancel")}
                kind="secondary"
                compact
                onPress={() => {
                  setDriveListed(null);
                  forgetDriveRestore();
                }}
                disabled={busy}
              />
            </Row>
          </>
        ) : null}
      </Card>

      <SectionTitle title={t("A lost phone")} />
      <Card>
        <Text variant="caption" tone="muted" style={hint}>
          {t(
            "A phone that was lost or stolen and is still on keeps reading the server queues it knew, so messages sent to them may reach it and never come here. This moves every space, with its hidden chats, to new server queues, each as it next opens here.",
          )}
        </Text>
        {lost?.at ? (
          <Text variant="caption" style={hint}>
            {t(
              "The old phone was said lost on {date}. Every space and its hidden chats move to new server queues as each next opens here.",
              { date: new Date(lost.at).toLocaleDateString(locale()) },
            )}
          </Text>
        ) : lost?.other ? (
          <Text variant="caption" style={hint}>
            {t(
              "The backup put back here was made on another phone. If that phone was lost or stolen, tap the button below.",
            )}
          </Text>
        ) : null}
        <Row wrap>
          <Button
            title={t("The old phone was lost")}
            kind="secondary"
            compact
            onPress={() => void lostPhone()}
            disabled={busy}
          />
        </Row>
      </Card>

      {note ? (
        <Text variant="label" color={failed ? colors.danger : colors.success}>
          {note}
        </Text>
      ) : null}

      {CAN_DRIVE ? (
        <DriveWarning
          purpose={warnDrive}
          invisible={mode === "invisible"}
          onSignIn={(purpose) => {
            setWarnDrive(null);
            void signInDrive(purpose);
          }}
          onClose={() => setWarnDrive(null)}
        />
      ) : null}

      <PasswordSheet
        visible={asking !== null}
        title={
          sheet?.kind === "open"
            ? t("Open {name}", { name: sheet.name })
            : sheet?.kind === "auto"
              ? t("Password for automatic backups")
              : t("Password for this backup")
        }
        repeat={sheet?.kind !== "open"}
        least={MIN_BACKUP_PASSWORD}
        hint={[
          t(
            "A backup holds every space and all its chats, and once the file is elsewhere its password is all that guards it: use at least {n} characters, or four words.",
            { n: MIN_BACKUP_PASSWORD },
          ),
          sheet?.kind === "cloud"
            ? [
                byHandText(whole),
                t("The server keeps the {n} newest whole.", { n: KEEP }),
              ].join(" ")
            : "",
        ]
          .filter(Boolean)
          .join("\n\n")}
        submitLabel={sheet?.kind === "open" ? t("Open") : t("Save")}
        onClose={() => setAsking(null)}
        onSubmit={submit}
      />
    </Page>
  );
}

const hint = { fontSize: 14, lineHeight: 20 };

// What a backup sent to the server by hand costs, said before it starts: all of it goes each
// time (`bytes`: about how much, when measured), where automatic backups send only what is new.
function byHandText(bytes: number | null): string {
  return [
    bytes
      ? t(
          "A backup sent by hand goes whole each time, with every photo and file: up to about {size} now.",
          { size: spaceText(bytes) },
        )
      : t("A backup sent by hand goes whole each time, with every photo and file."),
    CAN_AUTO_BACKUP
      ? t("With automatic backups on, only what is new goes each time.")
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// Before each sign-in with Google, what Google then learns, as the first start says it
// (app/first-steps.tsx); in INVISIBLE also that the sign-in is in the browser, outside Tor.
function DriveWarning({
  purpose,
  invisible,
  onSignIn,
  onClose,
}: {
  purpose: DrivePurpose | null;
  invisible: boolean;
  onSignIn: (purpose: DrivePurpose) => void;
  onClose: () => void;
}) {
  // What the sheet was opened for, so it stays while it closes.
  const shown = useRef<DrivePurpose>("backup");
  if (purpose) shown.current = purpose;
  return (
    <Sheet
      visible={purpose !== null}
      onClose={onClose}
      title={t("Before you sign in with Google")}
    >
      {[
        t("The backups leave **encrypted**. Google cannot read them."),
        t(
          "But Google **knows who you are**. It sees that you use Erevos, when you make a backup and how big it is, and may hand that over if asked.",
        ),
        invisible
          ? t(
              "This space is INVISIBLE, but signing in happens **in your browser, outside Erevos**, not through Tor: Google sees your internet address then.",
            )
          : "",
        t("For more privacy, choose **this device** or **WebDAV**."),
      ]
        .filter(Boolean)
        .map((text) => (
          <BoldText key={text} text={text} />
        ))}
      <Button
        title={t("I understand, sign in with Google")}
        onPress={() => onSignIn(shown.current)}
      />
      <Button title={t("Back")} kind="secondary" onPress={onClose} />
    </Sheet>
  );
}

// A text with **bold** words in it, as the first start writes them.
function BoldText({ text }: { text: string }) {
  return (
    <Text variant="caption" tone="muted" style={hint}>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} variant="caption" style={[hint, font("700")]}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

// What the last check of a place found (lib/backup-check.ts). `later`: the folder is another
// app's, which may still have been sending the backup on to its server (lib/backup-folder.ts
// folderOfAnotherApp), so a check that did not find it whole says to look again.
function CheckLine({
  where,
  checked,
  later = false,
}: {
  where: string;
  checked: Checked | null;
  later?: boolean;
}) {
  const { colors } = useTheme();
  if (!checked)
    return (
      <Text variant="caption" tone="muted" style={hint}>
        {t("{place}: not checked yet.", { place: where })}
      </Text>
    );
  const when = whenText(checked.at);
  const whole = checkedWhole(checked);
  const text = checked.error
    ? t("{place}, {when}: {error}", {
        place: where,
        when,
        error: checked.error,
      })
    : !whole
      ? t(
          "{place}, {when}: of its {parts} parts, {missing} are missing and {damaged} are not as made. A restore would lack their photos and files. Back up now, then check again.",
          {
            place: where,
            when,
            parts: checked.parts,
            missing: checked.missing,
            damaged: checked.damaged,
          },
        )
      : checked.opened
        ? t(
            "{place}, {when}: whole. It opens, all {parts} parts are there, and the {read} read through open too.",
            { place: where, when, parts: checked.parts, read: checked.read },
          )
        : t(
            "{place}, {when}: the backup and all {parts} parts are there, each of its size.",
            { place: where, when, parts: checked.parts },
          );
  return (
    <Text
      variant="caption"
      color={whole ? undefined : colors.danger}
      tone={whole ? "muted" : undefined}
      style={hint}
    >
      {whole ? "✓ " : "⚠ "}
      {text}
      {!whole && later
        ? ` ${t("This folder belongs to another app, which may still be sending the backup to its server: check again in a few minutes.")}`
        : ""}
    </Text>
  );
}

function sizeText(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// How many of the backups on a server are offered to restore: it keeps the newest few anyway.
const SHOWN = 10;

// A backup on a server, as the list shows it: when it came and how big it is.
function fileText(file: CloudFile): string {
  const when = file.when
    ? new Date(file.when).toLocaleString(locale(), {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : t("No date");
  return `${when} · ${sizeText(file.size)}`;
}

// The time of `ms`, this phone's, with its day when that is not the day of `since` (else today).
function clockText(ms: number, since = Date.now()): string {
  const day = (at: number) => new Date(at).toDateString();
  return day(ms) === day(since)
    ? new Date(ms).toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" })
    : whenText(ms);
}

function whenText(ms: number): string {
  return new Date(ms).toLocaleString(locale(), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
