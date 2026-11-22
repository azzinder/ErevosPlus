// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { ResultCode, startActivityAsync } from 'expo-intent-launcher';
import { PermissionsAndroid } from 'react-native';

import { t } from './i18n';
import { MMS_MAX } from './pick-mms-photo';
import { videoMimeOf } from './video-type';

// A video for an MMS. Erevos does not make a video smaller, so one fits only as the camera records it
// for an MMS: Android's own way to ask the camera app for a video in MMS quality (low quality, up to
// 30 seconds), which most camera apps keep, a few seconds of small picture in about 300 KB. One from
// the phone's videos goes only if it is that small already. On a computer: pick-mms-video.web.ts.

/** The longest video asked of the camera, in seconds. */
export const MMS_VIDEO_SECONDS = 30;

export type MmsVideo = { bytes: Uint8Array; mime: string };

/** The type of a video by its name's ending: 3GP as cameras record for MMS, else MP4. */
export function videoMime(name: string): string {
  const ending = name.toLowerCase().split('?')[0].split('.').pop() ?? '';
  if (ending === '3gp' || ending === '3gpp') return 'video/3gpp';
  if (ending === '3g2') return 'video/3gpp2';
  if (ending === 'webm') return 'video/webm';
  return 'video/mp4';
}

// The bytes of the video at `uri`, when they fit in an MMS, with the type they are. `recorded`: the
// camera app recorded it for an MMS and still made it too big.
async function fitting(uri: string, mime: string, recorded: boolean): Promise<MmsVideo> {
  const file = new File(uri);
  const tooBig = (size: number) =>
    new Error(
      recorded
        ? t('The camera app recorded it too big for an MMS ({size} KB, at most {most} KB): it does not keep to MMS quality. Record a shorter one.', { size: String(Math.round(size / 1024)), most: String(Math.round(MMS_MAX / 1024)) })
        : t('This video is too big for an MMS ({size} KB, at most {most} KB). Record one with Record a video, which asks the camera for MMS quality.', { size: String(Math.round(size / 1024)), most: String(Math.round(MMS_MAX / 1024)) }),
    );
  const size = file.size ?? 0;
  if (size > MMS_MAX) throw tooBig(size);
  const bytes = await file.bytes();
  if (bytes.length > MMS_MAX) throw tooBig(bytes.length);
  return { bytes, mime: videoMimeOf(bytes, mime) };
}

/** Records a video with the phone's camera app, in MMS quality; null if the owner went back. */
export async function recordMmsVideo(): Promise<MmsVideo | null> {
  // Erevos asks for the camera for its calls, so Android lets it ask the camera app only once allowed.
  const answer = await PermissionsAndroid.request('android.permission.CAMERA').catch(() => null);
  if (answer !== PermissionsAndroid.RESULTS.GRANTED) throw new Error(t('Erevos may not use the camera. Allow it in the phone settings to record videos.'));
  const result = await startActivityAsync('android.media.action.VIDEO_CAPTURE', {
    extra: { 'android.intent.extra.videoQuality': 0, 'android.intent.extra.durationLimit': MMS_VIDEO_SECONDS },
  });
  if (result.resultCode !== ResultCode.Success || !result.data) return null;
  return fitting(result.data, videoMime(result.data), true);
}

/** A video from the phone's videos, when it is small enough; null if the owner went back. */
export async function pickMmsVideo(): Promise<MmsVideo | null> {
  const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], allowsEditing: false });
  const asset = picked.canceled ? null : picked.assets[0];
  if (!asset) return null;
  try {
    return await fitting(asset.uri, asset.mimeType || videoMime(asset.fileName ?? asset.uri), false);
  } finally {
    const copy = new File(asset.uri);
    if (asset.uri.startsWith(Paths.cache.uri) && copy.exists) copy.delete();
  }
}
