// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tap } from '../lib/haptics';
import { named } from '../lib/edition';
import { findMoves, type FoundMove } from '../lib/edition-move';
import { updateEditionName } from '../lib/update-channel';
import { LANG_LABELS, lang, t } from '../lib/i18n';
import { modulesHere, type Module } from '../lib/modules';
import { linkParts, peekLink } from '../lib/open-link';
import { afterSteps } from '../lib/setup-after';
import { welcomeOf } from '../lib/welcome';
import { MAX_NAME } from '../lock/e2e-data';
import { Logo } from '../lock/gate';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';

import { KeyboardAwareScrollView } from './keyboard';
import { moduleAbout, moduleName } from './module-texts';
import { LanguageSheet, languageTitle } from './settings-list';
import { Button, Card, Chip, Field, Input, Row, SectionTitle, Text, TextButton, Toggle } from './ui';

// Erevos's very first start (app/_layout.tsx), before its first space opens, as an installer is:
// what Erevos is and is not (no identity to give away), an optional name for the contacts, and its
// language; then which of its parts to use (lib/modules.ts), any of them, Erevos's own too, at least
// one for chats. The rest needs the space open, so it follows once it is (app/first-steps.tsx): a
// screen for each part chosen, with what Android should allow for it, the password lock and the
// backups. Moving from another phone skips the name and the parts, which come with the backup; on a
// computer or in a browser, linking it to the phone does too. Nothing is kept until a choice is
// made, and all of it can be changed later in Settings.

/** What the first start's setup chose. */
export type SetupChoice = {
  modules: Module[];
  /** The name for the contacts, or ''. */
  name: string;
  /** Moving from another phone: a backup is restored next. */
  restore: boolean;
  /** A computer or a browser linked to the phone next. */
  linkPhone: boolean;
};

type Step = 'welcome' | 'modules';

// The screens an invite opens (lib/open-link.ts): Erevos opened with one waits to show it.
const INVITES = new Set(['/welcome', '/text-invite', '/contact', '/c', '/i', '/join', '/relay-invite']);

/** Who invites, when Erevos was opened with an invite: their name, or '' when it gives none; null for no invite. */
function inviteFrom(href: string | null): string | null {
  if (!href) return null;
  const { path, params } = linkParts(href);
  if (!INVITES.has(path)) return null;
  return path === '/welcome' ? (welcomeOf(params)?.name ?? '') : '';
}

export function Setup({ onDone }: { onDone: (choice: SetupChoice) => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const here = modulesHere();
  const [step, setStep] = useState<Step>('welcome');
  const [chosen, setChosen] = useState<ReadonlySet<Module>>(() => new Set(here));
  const [name, setName] = useState('');
  const [languages, setLanguages] = useState(false);
  const [invite] = useState(() => inviteFrom(peekLink()));
  // Another edition on this phone that made a move for this one (lib/edition-move.ts).
  const [move, setMove] = useState<FoundMove | null>(null);
  useEffect(() => {
    let active = true;
    void findMoves().then((found) => active && setMove(found[0] ?? null), () => undefined);
    return () => {
      active = false;
    };
  }, []);
  const list = here.filter((m) => chosen.has(m));
  // The Collection alone leaves no chat to open (lib/modules.ts).
  const nothing = list.every((m) => m === 'collection');
  // These two, then a screen for each module chosen, the lock and the backups, and what is done.
  const count = 2 + afterSteps(list).length;
  const at = step === 'welcome' ? 0 : 1;

  function toggle(module: Module) {
    tap();
    setChosen((was) => {
      const next = new Set(was);
      if (next.has(module)) next.delete(module);
      else next.add(module);
      return next;
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ width: '100%', maxWidth: 760, alignSelf: 'center', padding: space.xl - 4, paddingTop: insets.top + space.xl, gap: space.md }}
      >
        <Text variant="overline" tone="muted">
          {t('Setting up Erevos · step {n} of {m}', { n: at + 1, m: count })}
        </Text>
        {step === 'welcome' ? (
          <>
            {invite !== null ? (
              <Card>
                <Text variant="bodyStrong">{invite ? t('{name} invites you to Erevos', { name: invite }) : t('An invite to Erevos')}</Text>
                <Text variant="caption" tone="muted" style={hint}>
                  {t('It opens after the setup: the invite waits for you.')}
                </Text>
              </Card>
            ) : null}
            <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.md }}>
              <Logo size={72} />
              <Text variant="title" style={{ textAlign: 'center' }}>
                {named(t('Welcome to Erevos'))}
              </Text>
            </View>
            {move ? (
              <Card>
                <Text variant="bodyStrong">{t('{edition} is on this phone', { edition: updateEditionName(move.from) })}</Text>
                <Text style={hint}>{t('It made everything ready for this app: every space, with its contacts, messages and settings. Bring it here, then open the spaces with their passwords, as before.', { edition: updateEditionName(move.from) })}</Text>
                <Row wrap>
                  <Button title={t('Bring everything here')} onPress={() => onDone({ modules: here, name: '', restore: true, linkPhone: false })} />
                </Row>
              </Card>
            ) : null}
            <Card>
              <Text variant="bodyStrong">{t('No identity to give away')}</Text>
              <Text style={hint}>{t('No phone number, email, user name or account.')}</Text>
              <Text style={hint}>{t('You add people with a QR code or a link, or they invite you.')}</Text>
              <Text tone="muted" style={hint}>
                {t('Someone new who writes first waits as a message request, until you accept.')}
              </Text>
            </Card>
            <SectionTitle title={t('A name for your contacts · optional')} />
            <Field hint={t('Not a user name: no one searches for it, and it need not be unique. It goes, encrypted, only to those you add, and you can change it any time under Settings → Privacy and security → My name.')}>
              <Input
                value={name}
                onChangeText={setName}
                placeholder={t('Your name')}
                maxLength={MAX_NAME}
                autoCapitalize="words"
                accessibilityLabel={t('A name for your contacts · optional')}
              />
            </Field>
            <SectionTitle title={languageTitle()} />
            <Row wrap>
              <Chip label={LANG_LABELS[lang()]} selected onPress={() => setLanguages(true)} />
            </Row>
          </>
        ) : (
          <>
            <Text variant="title">{t('What will you use?')}</Text>
            <Text tone="muted" style={hint}>
              {t('Choose as many as you like. A short screen for each, with what it needs, follows.')}
            </Text>
            {here.map((module) => (
              <Pressable
                key={module}
                onPress={() => toggle(module)}
                accessibilityRole="switch"
                accessibilityState={{ checked: chosen.has(module) }}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <Card>
                  <Row style={{ alignItems: 'center', gap: space.md }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text variant="bodyStrong">{moduleName(module)}</Text>
                      <Text variant="caption" tone="muted" style={hint}>
                        {moduleAbout(module)}
                      </Text>
                    </View>
                    <Toggle on={chosen.has(module)} />
                  </Row>
                </Card>
              </Pressable>
            ))}
            {nothing ? (
              <Text variant="caption" color={colors.danger}>
                {t('Choose at least one for chats: the Collection alone has nothing to open.')}
              </Text>
            ) : null}
            <Text variant="caption" tone="muted" style={hint}>
              {t('Contacts, the password, the spaces and the backups are always there. Those you leave off do not start at all; turn them on any time in Settings → General → Modules.')}
            </Text>
          </>
        )}
        <Row style={{ justifyContent: 'space-between', marginTop: space.md }}>
          {at > 0 ? <Button title={t('Back')} kind="ghost" compact onPress={() => setStep('welcome')} /> : <View />}
          <Button
            title={t('Next')}
            disabled={step === 'modules' && nothing}
            onPress={() => (step === 'welcome' ? setStep('modules') : onDone({ modules: list, name: name.trim(), restore: false, linkPhone: false }))}
          />
        </Row>
        {step === 'welcome' ? (
          <View style={{ alignItems: 'center', marginTop: space.sm }}>
            {Platform.OS === 'android' ? (
              // The name and the modules come with the backup.
              <TextButton title={t('I already have Erevos on another phone')} onPress={() => onDone({ modules: here, name: '', restore: true, linkPhone: false })} />
            ) : (
              // A computer or a browser beside the phone: the phone's modules are the ones that count.
              <TextButton title={t('Link to my phone')} onPress={() => onDone({ modules: here, name: '', restore: false, linkPhone: true })} />
            )}
          </View>
        ) : null}
        <View style={{ height: insets.bottom + space.lg }} />
      </KeyboardAwareScrollView>
      <LanguageSheet visible={languages} onClose={() => setLanguages(false)} />
    </View>
  );
}

// Hints read better a little larger and looser than captions.
const hint = { fontSize: 14, lineHeight: 20 };
