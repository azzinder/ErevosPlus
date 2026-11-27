// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { PACKAGES, type UpdateEdition } from './update-channel';

// Who Erevos is to Google when it signs in to keep automatic backups in Google Drive
// (lib/google-drive.ts): an OAuth client of the kind Android, one for each edition's app, made in
// Google Cloud's console with the app's package (app.config.js) and the certificate it is signed
// with, with custom URI schemes on, as the sign-in comes back to <package>:/oauth2redirect. A
// client of that kind has no secret. While an edition's is empty, nothing of Google Drive shows in
// it, anywhere.

/** Each edition's Android OAuth client ID, as Google Cloud's console gives it: it ends in
 *  .apps.googleusercontent.com. */
export const DRIVE_CLIENT_IDS: Readonly<Record<UpdateEdition, string>> = {
  erevos: '566865563491-5i6ktv407ht4slhvoushknmfsq0obgtu.apps.googleusercontent.com',
  plus: '566865563491-3gumdkvpcsmd8ms93f7a9j4g4heqeufq.apps.googleusercontent.com',
  lite: '566865563491-0fbffurbjdet8k2tj4rt6jv03eqt8cop.apps.googleusercontent.com',
};

/** The client ID of the app whose Android package is `pkg`, '' for none. By the package, not the
 *  edition: the bridge, Erevos+ built as app.erevos (app.config.js), is the plain Erevos's app to
 *  Google. */
export function driveClientFor(pkg: string, ids: Readonly<Record<UpdateEdition, string>> = DRIVE_CLIENT_IDS): string {
  const edition = (Object.keys(PACKAGES) as UpdateEdition[]).find((each) => PACKAGES[each] === pkg);
  return edition ? ids[edition] : '';
}

/** Whether Google Drive is offered: only on Android, only with a client ID for the app, and never
 *  in the F-Droid build (`fdroid`), which keeps to services anyone may run. */
export function canDrive(os: string, id: string, fdroid = false): boolean {
  return os === 'android' && id !== '' && !fdroid;
}

// React Native and Expo are asked only when they are there, so the checks, in plain Node, can load
// this file.
function platform(): string {
  try {
    return (require('react-native') as typeof import('react-native')).Platform.OS;
  } catch {
    return 'node';
  }
}

function appPackage(): string {
  try {
    const constants = (require('expo-constants') as typeof import('expo-constants')).default;
    return constants.expoConfig?.android?.package ?? '';
  } catch {
    return '';
  }
}

// Whether this is the F-Droid build (EREVOS_DISTRIBUTION=fdroid, as lib/distribution.ts reads it).
function fdroidBuild(): boolean {
  try {
    const constants = (require('expo-constants') as typeof import('expo-constants')).default;
    return constants.expoConfig?.extra?.distribution === 'fdroid';
  } catch {
    return false;
  }
}

/** This app's Android package, which Google's sign-in comes back to. */
export const DRIVE_PACKAGE = appPackage();

/** This app's client ID, '' when it has none. */
export const DRIVE_CLIENT_ID = driveClientFor(DRIVE_PACKAGE);

/** Whether automatic backups can go to Google Drive here. */
export const CAN_DRIVE = canDrive(platform(), DRIVE_CLIENT_ID, fdroidBuild());
