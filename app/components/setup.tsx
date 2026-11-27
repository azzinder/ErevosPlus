// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { BackHandler, Image, Platform, Pressable, TextInput, View } from 'react-native';

import { tap } from '../lib/haptics';
import { editionName, EDITION } from '../lib/edition';
import { findMoves, type FoundMove } from '../lib/edition-move';
import { startSteps, stepAt, type StartStep } from '../lib/first-start';
import { updateEditionName } from '../lib/update-channel';
import { LANG_LABELS, lang, t } from '../lib/i18n';
import { modulesHere, type Module } from '../lib/modules';
import { linkParts, peekLink } from '../lib/open-link';
import { HAS_CHECKS } from '../lib/permissions';
import { welcomeOf } from '../lib/welcome';
import { MAX_NAME } from '../lock/e2e-data';
import { useStartLook, Dots, Emblem, FooterLink, Glass, Hero, Icon, L, MainButton, NavRow, noOutline, StartScreen, StartToggle, Tile, type IconName } from './first-start-look';
import { moduleAbout, moduleName } from './module-texts';
import { LanguageSheet, languageTitle } from './settings-list';
import type { Tile as TileColour } from '../lib/first-start';

// Erevos's very first start (app/_layout.tsx), before its first space opens, in the first start's
// look (components/first-start-look.tsx, lib/first-start.ts): the welcome, with what Erevos is and
// is not (no identity to give away), an optional name for the contacts, and its language; then
// What will you use?, the modules (lib/modules.ts), any of them, Erevos's own too, at least one for
// chats. The rest needs the space open, so it follows once it is (app/first-steps.tsx): how
// visible you are, every permission, the password lock and the backups. Moving from another phone
// skips the name and the modules, which come with the backup; on a computer or in a browser,
// linking it to the phone does too. Nothing is kept until a choice is made, and all of it can be
// changed later in Settings.

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

type Step = Extract<StartStep, 'welcome' | 'modules'>;

// The screens an invite opens (lib/open-link.ts): Erevos opened with one waits to show it.
const INVITES = new Set(['/welcome', '/text-invite', '/contact', '/c', '/i', '/join', '/relay-invite']);

/** Who invites, when Erevos was opened with an invite: their name, or '' when it gives none; null for no invite. */
function inviteFrom(href: string | null): string | null {
  if (!href) return null;
  const { path, params } = linkParts(href);
  if (!INVITES.has(path)) return null;
  return path === '/welcome' ? (welcomeOf(params)?.name ?? '') : '';
}

// The four main modules start on, with their tiles; any other (Erevos+'s networks) starts off.
const MAIN: readonly Module[] = ['erevos', 'phone', 'sms', 'collection'];
const MODULE_TILES: Partial<Record<Module, { tile: TileColour; icon: IconName }>> = {
  erevos: { tile: 'gold', icon: 'chat' },
  phone: { tile: 'teal', icon: 'phone' },
  sms: { tile: 'blue', icon: 'sms' },
  collection: { tile: 'violet', icon: 'col' },
};

function moduleLine(module: Module): string {
  switch (module) {
    case 'erevos':
      return t('Messages, groups and calls');
    case 'phone':
      return t('Your mobile calls here too');
    case 'sms':
      return t('Your SMS with your chats');
    case 'collection':
      return t('Encrypted photos and files');
    default:
      return moduleAbout(module);
  }
}

// A small label over a group.
function GroupLabel({ children }: { children: string }) {
  return (
    <L size={12} weight="800" tone="muted" style={{ letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 2 }}>
      {children}
    </L>
  );
}

export function Setup({ onDone }: { onDone: (choice: SetupChoice) => void }) {
  const look = useStartLook();
  const here = modulesHere();
  const [step, setStep] = useState<Step>('welcome');
  const [chosen, setChosen] = useState<ReadonlySet<Module>>(() => new Set(here.filter((m) => MAIN.includes(m))));
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
  // Android's back key goes back to the welcome from the modules.
  useEffect(() => {
    if (step !== 'modules') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setStep('welcome');
      return true;
    });
    return () => subscription.remove();
  }, [step]);
  const list = here.filter((m) => chosen.has(m));
  // The Collection alone leaves no chat to open (lib/modules.ts).
  const nothing = list.every((m) => m === 'collection');
  // With one module only (Erevos Lite, lib/edition.ts, or a device with Erevos's own chats alone)
  // there is nothing to choose: no step for the modules.
  const single = here.length === 1;
  // The same steps app/first-steps.tsx counts, for the dots (the welcome has none).
  const steps = startSteps({ choice: !single, restored: false, checks: HAS_CHECKS });
  const at = stepAt(steps, 'modules');
  const mains = here.filter((m) => MAIN.includes(m));
  const others = here.filter((m) => !MAIN.includes(m));

  function toggle(module: Module) {
    tap();
    setChosen((was) => {
      const next = new Set(was);
      if (next.has(module)) next.delete(module);
      else next.add(module);
      return next;
    });
  }

  const moveHere = () => onDone({ modules: here, name: '', restore: true, linkPhone: false });

  if (step === 'welcome') {
    return (
      <>
        <StartScreen
          footer={
            <>
              <MainButton title={t('Get started')} onPress={() => (single ? onDone({ modules: list, name: name.trim(), restore: false, linkPhone: false }) : setStep('modules'))} />
              {Platform.OS === 'android' ? (
                // The name and the modules come with the backup.
                <FooterLink text={t('I already have Erevos on another phone')} link={t('Move it here')} onPress={moveHere} />
              ) : (
                // A computer or a browser beside the phone: the phone's modules are the ones that count.
                <FooterLink link={t('Link to my phone')} onPress={() => onDone({ modules: here, name: '', restore: false, linkPhone: true })} />
              )}
            </>
          }
        >
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 4 }}>
            <Pressable
              onPress={() => setLanguages(true)}
              accessibilityRole="button"
              accessibilityLabel={`${languageTitle()}: ${LANG_LABELS[lang()]}`}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                height: 30,
                paddingHorizontal: 12,
                borderRadius: 15,
                backgroundColor: look.glass,
                borderWidth: 1,
                borderColor: look.line,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Icon name="globe" size={14} color={look.text} />
              <L size={12.5} weight="700">
                {LANG_LABELS[lang()]}
              </L>
            </Pressable>
          </View>
          {invite !== null ? (
            <Glass style={{ padding: 14, gap: 4 }}>
              <L size={15} weight="700">
                {invite ? t('{name} invites you to Erevos', { name: invite }) : t('An invite to Erevos')}
              </L>
              <L size={12.5} tone="muted" line={17}>
                {t('It opens after the setup: the invite waits for you.')}
              </L>
            </Glass>
          ) : null}
          <View style={{ alignItems: 'center', gap: 8, paddingTop: 6 }}>
            <Image
              source={require('../assets/icon/icon.png')}
              style={{ width: 112, height: 112, borderRadius: 28, marginTop: 18, boxShadow: `0px 18px 50px -8px ${look.glow}` }}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            <View style={{ marginTop: 14, alignSelf: 'stretch' }}>
              <Hero title={t('Welcome to {app}', { app: `*${editionName()}*` })} sub={t('You talk with whoever you want. No one else listens.')} />
            </View>
          </View>
          {move ? (
            <Glass style={{ padding: 14, gap: 8 }}>
              <L size={15} weight="700">
                {t('{edition} is on this phone', { edition: updateEditionName(move.from) })}
              </L>
              <L size={12.5} tone="muted" line={17}>
                {t('It made everything ready for this app: every space, with its contacts, messages and settings. Bring it here, then open the spaces with their passwords, as before.', { edition: updateEditionName(move.from) })}
              </L>
              <MainButton title={t('Bring everything here')} onPress={moveHere} />
            </Glass>
          ) : null}
          <Glass style={{ paddingVertical: 4 }}>
            {(
              [
                ['slate', 'id', t('No number, email or account'), t('You give nothing to start.')],
                ['teal', 'shield', t('Everything encrypted'), t('Messages and calls for the two of you alone.')],
                ['blue', 'qr', t('You add people by QR code or link'), t('No one finds you unless you want.')],
              ] as const
            ).map(([tile, icon, title, line]) => (
              <View key={title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14 }}>
                <Tile tile={tile} icon={icon} />
                <View style={{ flex: 1 }}>
                  <L size={15} weight="700">
                    {title}
                  </L>
                  <L size={12.5} tone="muted" line={17}>
                    {line}
                  </L>
                </View>
              </View>
            ))}
          </Glass>
          <View
            style={{ height: 50, borderRadius: 16, backgroundColor: look.glass, borderWidth: 1, borderColor: look.line, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 }}
          >
            <Icon name="user" size={18} color={look.primary} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('Your name (optional)')}
              placeholderTextColor={look.faint}
              maxLength={MAX_NAME}
              autoCapitalize="words"
              accessibilityLabel={t('Your name (optional)')}
              style={[{ flex: 1, height: 50, fontSize: 15, color: look.text, paddingVertical: 0 }, noOutline]}
            />
          </View>
        </StartScreen>
        <LanguageSheet visible={languages} onClose={() => setLanguages(false)} />
      </>
    );
  }

  const row = (module: Module) => {
    const on = chosen.has(module);
    const look_ = MODULE_TILES[module] ?? { tile: 'slate' as const, icon: 'globe' as const };
    // Erevos+'s own chats are called by its name (lib/edition.ts).
    const title = module === 'erevos' ? t('Erevos chats') : moduleName(module);
    return (
      <Pressable
        key={module}
        onPress={() => toggle(module)}
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityState={{ checked: on }}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <Glass style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 }}>
          <Tile tile={look_.tile} icon={look_.icon} />
          <View style={{ flex: 1 }}>
            <L size={15} weight="700">
              {title}
            </L>
            <L size={12.5} tone="muted" line={17}>
              {moduleLine(module)}
            </L>
          </View>
          <StartToggle on={on} />
        </Glass>
      </Pressable>
    );
  };

  return (
    <StartScreen
      footer={
        <NavRow onBack={() => setStep('welcome')}>
          <MainButton title={t('Continue')} disabled={nothing} onPress={() => onDone({ modules: list, name: name.trim(), restore: false, linkPhone: false })} />
        </NavRow>
      }
    >
      <Dots n={at.n} of={at.of} />
      <Hero
        emblem={<Emblem tile={EDITION === 'plus' ? 'violet' : 'blue'} icon="chat" />}
        title={t('What will you use?')}
        sub={t('What you leave off does not run at all. Change them any time.')}
      />
      {mains.map(row)}
      {others.length ? (
        <>
          <GroupLabel>{t('Other networks')}</GroupLabel>
          {others.map(row)}
        </>
      ) : null}
      {nothing ? (
        <L size={12.5} tone="warn" line={17}>
          {t('Choose at least one for chats: the Collection alone has nothing to open.')}
        </L>
      ) : null}
    </StartScreen>
  );
}
