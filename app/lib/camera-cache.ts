// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Collection's camera (components/erevos-camera.tsx, CameraPreview.kt) records a video into the
// app's cache, in its folder "Camera", and lib/collection-camera.ts deletes each file as soon as it
// is encrypted (a photo never touches the storage). A file Erevos had no time to encrypt (the battery ran out, Android stopped Erevos while
// it recorded) stays there unencrypted: it goes as Erevos starts, when nothing is recording.

import { Directory, Paths } from 'expo-file-system';

/** The folder of the camera's files, in the cache. */
export const CAMERA_FOLDER = 'Camera';

/** Deletes what the camera left in the cache; how many files went. Never throws. */
export function clearCameraCache(): number {
  try {
    const folder = new Directory(Paths.cache, CAMERA_FOLDER);
    if (!folder.exists) return 0;
    const count = folder.list().length;
    folder.delete();
    return count;
  } catch {
    return 0;
  }
}
