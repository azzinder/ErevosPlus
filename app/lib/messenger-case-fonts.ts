// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';

import type { CaseFont } from './messenger-case-look';
import type { StyleName } from '../theme/colors';
import { styleFontFiles } from '../theme/fonts';
import type { FontChoice } from '../theme/look';

/**
 * The style's own letters (Inter, Inter Tight) as files on the phone, for Messenger's case to give
 * Meta's page (lib/messenger-case-look.ts); none for a style in the phone's letters, for a look in
 * a serif, monospace or the phone's sans, or while they are not there yet.
 */
export function useCaseFonts(style: StyleName, font: FontChoice): CaseFont[] {
  const [fonts, setFonts] = useState<CaseFont[]>([]);
  useEffect(() => {
    let live = true;
    const files = font === 'style' ? styleFontFiles(style) : null;
    if (!files) {
      setFonts([]);
      return;
    }
    Promise.all(
      files.map(async ({ weight, source }) => {
        const asset = await Asset.fromModule(source as number).downloadAsync();
        return { weight, file: asset.localUri ?? '' };
      }),
    )
      .then((got) => {
        // Only files on this phone (file://…); the case serves them from there alone.
        const here = got.filter((f) => f.file.startsWith('file:///')).map((f) => ({ weight: f.weight, file: decodeURIComponent(f.file.slice('file://'.length)) }));
        if (live) setFonts(here.length === got.length ? here : []);
      })
      .catch(() => {
        if (live) setFonts([]);
      });
    return () => {
      live = false;
    };
  }, [style, font]);
  return fonts;
}
