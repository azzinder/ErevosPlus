// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { KeyboardAvoidingView } from '../components/keyboard';
import { Button, Input, Text, TextButton } from '../components/ui';
import { useColors, useTheme } from '../theme/context';

import { BiometricError, biometricOn, unlockWithBiometric } from './biometric';
import { PanicPasswordError, unlock, type LockConfig, type Unlocked } from './config';
import { LockedOutError, lockedOutMessage } from './tries';
import { editionName, named } from '../lib/edition';
import { t } from '../lib/i18n';
import { wipeNow } from '../lib/panic';
import { biometricSealer } from '../modules/erevos-biometric';
import { openEmergencyDial, phoneStatus } from '../modules/erevos-phone';

// The password screen shown before any space is opened. It looks the same whichever password is
// typed, and the password decides which space opens. Wrong passwords are counted on the phone
// (tries.ts): after a few, the next try must wait. It shows in the look last used (theme/look.ts).
// Where unlocking with a fingerprint or face is on (biometric.ts), a button offers it too; it
// opens only the first password's space, and the password field stays. The panic password, when
// one is set (config.ts), wipes Erevos as the panic button does; until Erevos stops, the screen
// looks as after a wrong password.
export function PasswordGate({ config, onUnlock }: { config: LockConfig; onUnlock: (space: Unlocked) => Promise<void> }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometric, setBiometric] = useState(false);
  const colors = useColors();

  useEffect(() => {
    biometricOn(biometricSealer).then(setBiometric, () => setBiometric(false));
  }, []);

  async function fingerprint() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const space = await unlockWithBiometric(biometricSealer, { title: named(t('Unlock Erevos')), cancel: t('Use password') });
      if (space) {
        setPassword('');
        await onUnlock(space);
        return;
      }
      setBiometric(false);
      setError(t('Unlocking with a fingerprint or face stopped working, so it is off now. Type your password, and turn it on again in Lock.'));
    } catch (e) {
      if (!(e instanceof BiometricError && e.reason === 'cancelled')) setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      // Every slot is tried whatever the password, so the time says nothing about which one opened.
      const space = await unlock(config, password);
      if (space) {
        setPassword('');
        await onUnlock(space);
        return;
      }
      setError(t('Wrong password'));
      setPassword('');
    } catch (e) {
      if (e instanceof PanicPasswordError) {
        setError(t('Wrong password'));
        setPassword('');
        // On Android, Android stops Erevos; in the web app the page starts as new.
        await wipeNow().catch(() => undefined);
        return;
      }
      setError(e instanceof LockedOutError ? lockedOutMessage(e.until) : e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.container, { backgroundColor: colors.ground }]}>
      <View style={styles.column}>
        <Logo />
        <Text variant="title">{editionName()}</Text>
        <Text tone="muted" style={styles.body}>
          {t('Enter your password')}
        </Text>
        <Input
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={submit}
          secureTextEntry
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t('Password')}
          placeholder={t('Password')}
          style={styles.input}
        />
        {error ? (
          <Text variant="label" color={colors.danger} style={styles.stretch}>
            {error}
          </Text>
        ) : null}
        <Button title={t('Unlock')} onPress={submit} disabled={!password} loading={busy} style={styles.stretch} />
        {biometric ? (
          <Button title={t('Fingerprint or face')} kind="secondary" onPress={fingerprint} disabled={busy} style={styles.stretch} />
        ) : null}
        {/* With Erevos the phone app, an emergency call is a tap away, with no password: Android's
            own emergency keypad, which calls only emergency numbers. */}
        {phoneStatus()?.isDefault ? (
          <TextButton
            title={t('Emergency call')}
            onPress={() => {
              if (!openEmergencyDial()) setError(t('Call emergency services from the phone’s own lock screen.'));
            }}
          />
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

// The Erevos mark (brand/), white on a dark look and black on a light one.
const MARK = {
  dark: require('../assets/icon/mark-on-dark.png'),
  light: require('../assets/icon/mark-on-light.png'),
};

export function Logo({ size = 56 }: { size?: number }) {
  const { scheme } = useTheme();
  return (
    <Image
      source={MARK[scheme]}
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  column: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 16,
  },
  body: {
    marginBottom: 12,
  },
  input: {
    alignSelf: 'stretch',
    fontSize: 18,
  },
  stretch: {
    alignSelf: 'stretch',
  },
});
