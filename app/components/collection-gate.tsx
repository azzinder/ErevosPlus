// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { t } from '../lib/i18n';
import { biometricOffered, BiometricError, confirmWithBiometric } from '../lock/biometric';
import { ownSpaceKey } from '../lock/config';
import { currentSpace } from '../lock/keys';
import { biometricSealer } from '../modules/erevos-biometric';
import { space } from '../theme/colors';
import { useTheme } from '../theme/context';

import { Backdrop, useBackdropSpec } from './backdrop';
import { BackIcon, LockIcon } from './icons';
import { PasswordSheet } from './PasswordSheet';
import { Button, Text } from './ui';

// What the Collection shows before it opens, where the space has a password (the owner's word,
// 2026-11-16): the password that opens this space, or a fingerprint or face where that unlocks
// Erevos, each time it opens and once Erevos was away a while (app/collection.tsx). Nothing of
// the Collection is read meanwhile. Wrong passwords count as on the lock screen (lock/tries.ts).
export function CollectionGate({ onOpen, onBack }: { onOpen: () => void; onBack: () => void }) {
  const { colors, scheme } = useTheme();
  const spec = useBackdropSpec();
  const solid = /^#[0-9a-f]{6}$/i.test(colors.ground) ? colors.ground : scheme === 'dark' ? '#000000' : '#FFFFFF';
  const [asking, setAsking] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Where a fingerprint or face unlocks Erevos, it is asked first, and the password is the other
  // way; otherwise the field for the password shows at once.
  useEffect(() => {
    let live = true;
    biometricOffered(biometricSealer).then(
      (on) => {
        if (!live) return;
        setBiometric(on);
        if (on) void fingerprint();
        else setAsking(true);
      },
      () => live && setAsking(true),
    );
    return () => {
      live = false;
    };
    // Once, as it shows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function withPassword(password: string): Promise<boolean> {
    if (!(await ownSpaceKey(currentSpace().space, password))) return false;
    onOpen();
    return true;
  }

  async function fingerprint() {
    setError(null);
    try {
      if (await confirmWithBiometric(biometricSealer, { title: t('Open the Collection'), cancel: t('Use password') }, currentSpace().key)) {
        onOpen();
        return;
      }
      setError(t('Type the password that opens this space.'));
      setAsking(true);
    } catch (e) {
      if (!(e instanceof BiometricError && e.reason === 'cancelled')) setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: solid }]}>
      <Backdrop spec={spec}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: spec ? colors.sheet : solid }]} />
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={t('Back')} hitSlop={8} style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}>
          <BackIcon color={colors.text} size={24} />
        </Pressable>
        <View style={styles.middle}>
          <LockIcon color={colors.textMuted} size={48} />
          <Text variant="title" style={styles.center}>
            {t('Collection')}
          </Text>
          <Text tone="muted" style={styles.center}>
            {t('The Collection asks for the password that opens this space each time it opens.')}
          </Text>
          {error ? (
            <Text variant="label" color={colors.danger} style={styles.center}>
              {error}
            </Text>
          ) : null}
          <Button title={t('Type the password')} onPress={() => setAsking(true)} />
          {biometric ? <Button title={t('Fingerprint or face')} kind="secondary" onPress={fingerprint} /> : null}
        </View>
        <PasswordSheet
          visible={asking}
          title={t('The password that opens this space')}
          repeat={false}
          submitLabel={t('Open')}
          onClose={() => setAsking(false)}
          onSubmit={withPassword}
        />
      </Backdrop>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { position: 'absolute', top: space.md, left: space.md, padding: space.xs, zIndex: 1 },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl },
  center: { textAlign: 'center' },
});
