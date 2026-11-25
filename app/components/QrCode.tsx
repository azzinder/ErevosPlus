// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useMemo } from 'react';
import { Image, PixelRatio, StyleSheet } from 'react-native';
import { toBase64 } from '../lib/crypto';
import { qrPng } from '../lib/qr';
import { t } from '../lib/i18n';

// Dark modules on white with a quiet zone of four modules, as scanners expect, even in the
// app's dark theme. One picture at the screen's own pixels (lib/qr.ts), so it shows sharp and is
// light to draw even on an older phone, made once while the screen shows it.
//
// A module is never under two of the screen's pixels, so a code of many modules comes out wider
// than it was asked on a screen of few pixels. `fixed` holds it to the size asked, for a small
// picture of the code that is tapped to show it large, and is not what a camera reads.
export function QrCode({ text, size = 260, fixed = false }: { text: string | Uint8Array; size?: number; fixed?: boolean }) {
  const ratio = PixelRatio.get();
  const shown = useMemo(() => {
    const { png, size: pixels } = qrPng(text, Math.floor(size * ratio));
    return { uri: `data:image/png;base64,${toBase64(png)}`, side: fixed ? size : pixels / ratio };
  }, [text, size, ratio, fixed]);
  return (
    <Image
      source={{ uri: shown.uri }}
      style={[styles.code, { width: shown.side, height: shown.side }]}
      fadeDuration={0}
      accessible
      accessibilityLabel={t('QR code')}
    />
  );
}

const styles = StyleSheet.create({
  code: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },
});
