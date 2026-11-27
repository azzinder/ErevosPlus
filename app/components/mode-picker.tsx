// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { confirm } from '../lib/alert';
import { currentCall } from '../lib/call';
import { canTor } from '../lib/core';
import { directNow, directOf, onDirect, setDirect } from '../lib/direct';
import { currentGroupCall } from '../lib/group-call';
import { tap } from '../lib/haptics';
import { mark, t } from '../lib/i18n';
import { inMatrixCall } from '../lib/matrix-calls';
import { MODE_NAMES, MODES, modeChange, modeNow, type Mode } from '../lib/modes';
import { nostrOf, setNostr } from '../lib/nostr';
import { applyTor } from '../lib/tor';
import { loadCurrentSpaceData, updateCurrentSpaceData } from '../lock/space-data';
import { radius, space, withAlpha } from '../theme/colors';
import { useColors } from '../theme/context';
import { CloseIcon, PhoneIcon } from './icons';
import { Card, Text, TextButton } from './ui';

// The three modes (lib/modes.ts): how much of this phone's internet address the open space shows,
// as Settings shows them at its top and their screen (app/direct.tsx) does, in the words of the
// first start's third screen. Each says who sees the address, and how calls go.

/** What each mode says: who sees the address, and how calls go (the first start's third screen shows them too). */
export const modeSays: Record<Mode, { line: string; calls: string; server: boolean; contacts: boolean }> = {
  speed: { line: mark('The servers and your contacts see your address.'), calls: mark('Calls go straight · the fastest'), server: true, contacts: true },
  anonymous: { line: mark('Only the server sees it, never your contacts.'), calls: mark('Calls through a server'), server: true, contacts: false },
  invisible: { line: mark('No one sees it. Everything goes through Tor.'), calls: mark('No voice or video calls'), server: false, contacts: false },
};

/** Whether Direct connections are on now (SPEED, lib/direct.ts directNow), read again when they may have changed. */
export function useDirectNow(): boolean {
  const [on, setOn] = useState(directNow);
  useEffect(() => {
    const read = () => setOn(directNow());
    read();
    return onDirect(read);
  }, []);
  return on;
}

/** The open space's mode now, read again when it may have changed: Direct connections, the Tor way, or Nostr's own Tor switch. */
export function useMode(): Mode {
  const [mode, setMode] = useState(modeNow);
  useEffect(() => {
    const read = () => setMode(modeNow());
    read();
    return onDirect(read);
  }, []);
  return mode;
}

/**
 * Chooses `mode` for the open space: keeps what it says (lib/modes.ts modeChange) and sets it going,
 * Tor last, as it may take a while to start. Throws when the space could not keep it, or Tor could
 * not start through the bridges chosen.
 */
export async function chooseMode(mode: Mode): Promise<void> {
  const data = await loadCurrentSpaceData();
  const next = modeChange(data, mode);
  await updateCurrentSpaceData(next);
  setDirect(directOf(next));
  if (next.nostr !== data.nostr) setNostr(nostrOf(next.nostr), next.nostr.tor === true);
  if (next.tor !== data.tor) await applyTor(next.tor, data.bridges);
}

/** Asks before INVISIBLE, here and as everything is sent through Tor on its screen (app/tor.tsx): it is slower, has no calls, and ends a call going on. */
export function askInvisible(): Promise<boolean> {
  const call = !!currentCall() || !!currentGroupCall() || inMatrixCall();
  const said = t('Everything of this space then goes through Tor: messages and files come and go slower, and the first start of Tor takes a while. Until Tor is ready, nothing goes. There are no voice or video calls.');
  return confirm(t('Choose INVISIBLE?'), call ? `${said} ${t('The call going on ends.')}` : said, t('Choose'));
}

// Asks first what is not plain from the card: INVISIBLE (askInvisible), and SPEED, which turns off a
// Tor chosen on its own screen.
async function asked(mode: Mode): Promise<boolean> {
  if (mode === 'invisible') return askInvisible();
  if (mode !== 'speed') return true;
  const data = await loadCurrentSpaceData();
  if (data.tor === 'off' && data.nostr.tor !== true) return true;
  return confirm(t('Choose SPEED?'), t('Tor is then turned off for this space, Nostr through Tor too, and the servers and your contacts see your internet address.'), t('Choose'));
}

// Who sees the address, in two marks: the server, and the contacts.
function Sees({ who, sees }: { who: string; sees: boolean }) {
  const colors = useColors();
  const color = sees ? colors.warning : colors.success;
  return (
    <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: withAlpha(color, 0.14) }}>
      <Text variant="caption" color={color} style={{ fontSize: 11, fontWeight: '700', textDecorationLine: sees ? 'none' : 'line-through' }}>
        {who}
      </Text>
    </View>
  );
}

// One mode, as a choice in a list: its name, who sees the address, and how calls go; faint where it
// cannot be had here (INVISIBLE where this build has no Tor).
function ModeRow({ mode, chosen, faint, onPress }: { mode: Mode; chosen: boolean; faint: boolean; onPress: () => void }) {
  const colors = useColors();
  const says = modeSays[mode];
  const name = MODE_NAMES[mode];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: chosen }}
      accessibilityLabel={`${name}. ${t(says.line)} ${t(says.calls)}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: space.md,
        padding: space.md,
        borderRadius: radius.md,
        borderWidth: chosen ? 1.5 : 1,
        borderColor: chosen ? colors.primary : colors.border,
        backgroundColor: chosen ? withAlpha(colors.primary, 0.12) : 'transparent',
        opacity: (faint ? 0.5 : 1) * (pressed ? 0.75 : 1),
      })}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="bodyStrong" style={{ letterSpacing: 1.4 }}>
          {name}
        </Text>
        <Text variant="caption" tone="muted">
          {t(says.line)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 4 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Sees who={t('server')} sees={says.server} />
          <Sees who={t('contacts')} sees={says.contacts} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {mode === 'invisible' ? <CloseIcon color={colors.textMuted} size={14} /> : <PhoneIcon color={colors.textMuted} size={14} />}
          <Text variant="caption" style={{ fontWeight: '600' }}>
            {t(says.calls)}
          </Text>
        </View>
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          marginTop: 2,
          borderWidth: chosen ? 7 : 2,
          borderColor: chosen ? colors.primary : colors.border,
          backgroundColor: chosen ? colors.onPrimary : 'transparent',
        }}
      />
    </Pressable>
  );
}

/**
 * The three in their card, at the top of Settings and on their screen: the open space's chosen, and,
 * when `more` is given (Settings), the way to their screen.
 */
export function ModePicker({ more }: { more?: () => void }) {
  const colors = useColors();
  const mode = useMode();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  async function choose(next: Mode) {
    if (next === mode || busy) return;
    tap();
    setNote('');
    // Everything through a Tor this build does not have would leave nothing going at all.
    if (next === 'invisible' && !canTor()) {
      setNote(t('INVISIBLE needs Tor, which this device does not have.'));
      return;
    }
    if (!(await asked(next))) return;
    setBusy(true);
    try {
      await chooseMode(next);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <Text variant="heading">{t('How visible are you?')}</Text>
      <View accessibilityRole="radiogroup" style={{ gap: space.sm }}>
        {MODES.map((each) => (
          <ModeRow key={each} mode={each} chosen={mode === each} faint={each === 'invisible' && !canTor()} onPress={() => void choose(each)} />
        ))}
      </View>
      <Text variant="caption" tone="muted">
        {t('Messages are always encrypted. Each space has its own choice.')}
      </Text>
      {note ? (
        <Text variant="caption" color={colors.warning}>
          {note}
        </Text>
      ) : null}
      {more ? <TextButton title={t('What it changes')} onPress={more} /> : null}
    </Card>
  );
}
