// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { askFirstServer, isLphl, readFirstServer, takeFirstServer, useFirstServer, type FirstServer, type OpenRefusal } from '../lib/open-place';
import { t, plural } from '../lib/i18n';
import { MODE_NAMES } from '../lib/modes';
import { myNameAt } from '../lib/my-name';
import { lacking, type Check } from '../lib/permission-checks';
import { HAS_CHECKS, readChecks } from '../lib/permissions';
import { spaceGroupsAt } from '../lib/space-groups';
import { radius, space, withAlpha } from '../theme/colors';
import { useColors } from '../theme/context';

import { checkTitle } from './check-card';
import { CheckIcon, ChevronIcon, GlobeIcon, PersonIcon } from './icons';
import { useMode } from './mode-picker';
import { Button, Card, Text } from './ui';

// The home screen of a space with no chats yet, once Erevos's own chats are on (app/index.tsx): what
// is ready, and the first person to add: someone beside you (their QR code, or yours), or someone
// far away (a link). In the app's own colours, as the rest of the home screen. A small pill says the
// mode and the server, its dot warning when there is none; then, above the two ways, where LPHL's
// server gave no place, why, with a way to try again or to choose another server, and with no
// server at all (an invite that was not taken, or an Erevos from before), LPHL's to take with one
// tap; under them, on a free place a server gave by itself (an open place), its limits for a day;
// and where permissions are checked, the first one still missing.

// Why LPHL's open server gave no place.
function refusalText(why: OpenRefusal): string {
  switch (why) {
    case 'off':
      return t('It takes no new phones now.');
    case 'full':
      return t('It is full.');
    case 'day':
      return t('Its places for today are taken: try again tomorrow.');
    case 'address':
      return t('Too many from this connection today: try again tomorrow.');
  }
}

// A server's host.
function hostOf(url: string): string {
  try {
    return new URL(url).host || url;
  } catch {
    return url;
  }
}

/** Where LPHL's server gave no place, why, with a way to try again or to choose another server:
 *  on the first home, and above the chats of a space whose free place it let go and cannot give
 *  again now (app/index.tsx, lib/open-place.ts). Nothing otherwise. */
export function NoPlaceCard({ server }: { server: FirstServer }) {
  const colors = useColors();
  if (server.kind !== 'refused' && server.kind !== 'failed') return null;
  return (
    <Card style={{ alignSelf: 'stretch' }}>
      <Text variant="caption" color={colors.warning}>
        {server.kind === 'refused' ? t('LPHL’s server gave no place. {why}', { why: refusalText(server.why) }) : t('LPHL’s server gave no place. {why}', { why: t('Erevos could not reach it now. It tries again by itself each time Erevos opens.') })}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        <Button title={t('Try again')} compact onPress={() => void takeFirstServer()} />
        <Button title={t('Another server')} kind="secondary" compact onPress={() => router.push('/chat?setup=relay')} />
      </View>
    </Card>
  );
}

// A large card to press: a tile, what it is, and a chevron.
function Door({ icon, title, line, onPress }: { icon: ReactNode; title: string; line: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${line}`} style={({ pressed }) => ({ alignSelf: 'stretch', opacity: pressed ? 0.8 : 1 })}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: withAlpha(colors.primary, 0.14) }}>{icon}</View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">{title}</Text>
          <Text variant="caption" tone="muted">
            {line}
          </Text>
        </View>
        <ChevronIcon color={colors.textFaint} />
      </Card>
    </Pressable>
  );
}

/** What the home screen shows with no chats yet: Ready, and the two ways to add the first person. */
export function FirstHome() {
  const colors = useColors();
  const mode = useMode();
  const server = useFirstServer();
  const [name, setName] = useState('');
  const [checks, setChecks] = useState<Check[]>([]);
  useEffect(() => {
    void myNameAt(spaceGroupsAt)
      .then(setName)
      .catch(() => undefined);
  }, []);
  // What is missing now, and the server, read again on coming back to the screen: a chat may have
  // joined one meanwhile.
  useFocusEffect(
    useCallback(() => {
      void readFirstServer().catch(() => undefined);
      if (!HAS_CHECKS) return;
      let active = true;
      void readChecks()
        .then((found) => active && setChecks(found))
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );
  const missing = checks.filter(lacking);
  // A server, or LPHL's on its way: the dot is green; with none, or none given, it warns, and what
  // to do about it comes first, above the two ways to add someone.
  const served = server.kind === 'ready' || server.kind === 'waiting' || server.kind === 'taking';
  const where = server.kind === 'ready' ? (isLphl(server.url) ? 'LPHL' : hostOf(server.url)) : served ? 'LPHL' : t('no server');
  // The asterisks mark the name in the title: none may come from the name itself.
  const title = name ? t('Ready, *{name}*', { name: name.replace(/\*/g, '') }) : t('Ready');
  const parts = title.split('*');
  return (
    <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.xl, paddingHorizontal: space.xl, alignSelf: 'stretch' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.md, backgroundColor: colors.surface }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: served ? colors.success : colors.warning }} />
        <Text variant="caption" tone="muted">
          {t('{mode} · {server}', { mode: MODE_NAMES[mode], server: where })}
        </Text>
      </View>
      <View style={{ marginTop: space.xl, marginBottom: space.md }}>
        <View
          style={{ width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.border }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <CheckIcon color={colors.onPrimary} size={44} />
        </View>
      </View>
      <Text variant="title" style={{ textAlign: 'center' }} accessibilityRole="header">
        {parts.map((part, i) => (i % 2 === 1 ? <Text key={i} variant="title" color={colors.accentText}>{part}</Text> : part))}
      </Text>
      <Text tone="muted" style={{ textAlign: 'center' }}>
        {t('Add your first person.')}
      </Text>
      {server.kind === 'none' ? (
        <Card style={{ alignSelf: 'stretch' }}>
          <Text variant="caption" tone="muted">
            {t('No server yet. LPHL’s is free, and gives you a place by itself.')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            <Button title={t('Use LPHL’s server')} compact onPress={() => void askFirstServer().catch(() => undefined)} />
            <Button title={t('Another server')} kind="secondary" compact onPress={() => router.push('/chat?setup=relay')} />
          </View>
        </Card>
      ) : null}
      <NoPlaceCard server={server} />
      <View style={{ alignSelf: 'stretch', gap: space.md, marginTop: space.sm }}>
        <Door icon={<PersonIcon color={colors.primary} size={24} />} title={t('They are beside me')} line={t('They scan your QR code, or you scan theirs')} onPress={() => router.push('/chat?setup=near')} />
        <Door icon={<GlobeIcon color={colors.primary} size={24} />} title={t('They are far away')} line={t('Send them a link')} onPress={() => router.push('/chat?setup=invite')} />
      </View>
      {server.kind === 'ready' && server.open ? (
        <Text variant="caption" tone="muted" style={{ textAlign: 'center' }}>
          {server.lphl ? t('Free on LPHL’s server: up to 20 new contacts, 50 MB of files and 30 calls through it each day.') : t('A free place on this server, with limits for each day.')}
        </Text>
      ) : null}
      {missing.length > 0 ? (
        <Pressable onPress={() => router.push('/permissions')} accessibilityRole="button" hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginTop: space.sm })}>
          <Text variant="caption" tone="muted" style={{ textAlign: 'center' }}>
            {plural(missing.length, '{n} permission missing', '{n} permissions missing')} ·{' '}
            <Text variant="label" color={colors.accentText}>
              {checkTitle(missing[0].id)}
            </Text>
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
