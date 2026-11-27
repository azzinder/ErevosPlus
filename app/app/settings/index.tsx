// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { ModePicker } from '../../components/mode-picker';
import { LanguageSheet, languageTitle, openLeaf, SettingsCard, SettingsRow, settingsPlace } from '../../components/settings-list';
import { useModules } from '../../lib/modules';
import { Input, Page, Text } from '../../components/ui';
import { LANG_LABELS, lang, t } from '../../lib/i18n';
import { directHere, groupsHere, itemsHere, searchSettings } from '../../lib/settings';
import { space } from '../../theme/colors';

/** Settings: the three modes at the top (lib/modes.ts: SPEED, ANONYMOUS, INVISIBLE), the language, the groups of settings, and a search through all of them (lib/settings.ts). */
export default function SettingsScreen() {
  // Read again when a module is turned on or off (lib/modules.ts).
  const modules = useModules();
  const place = useMemo(() => settingsPlace(), [modules]);
  const [query, setQuery] = useState('');
  const [languages, setLanguages] = useState(false);
  const hits = useMemo(() => searchSettings(query, place, t), [query, place]);
  const searching = query.trim().length > 0;

  return (
    <Page>
      <Text variant="title">{t('Settings')}</Text>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={t('Search the settings')}
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        accessibilityLabel={t('Search the settings')}
      />
      {searching ? (
        hits.length === 0 ? (
          <Text tone="muted" style={{ textAlign: 'center', paddingVertical: space.lg }}>
            {t('No setting has “{query}” in it.', { query: query.trim() })}
          </Text>
        ) : (
          <SettingsCard>
            {hits.map(({ leaf, path }) => (
              <SettingsRow
                key={`${path.join('/')}/${leaf.id}`}
                title={leaf.language ? languageTitle() : t(leaf.title)}
                detail={path.join(' › ')}
                onPress={() => openLeaf(leaf, () => setLanguages(true))}
              />
            ))}
          </SettingsCard>
        )
      ) : (
        <View style={{ gap: space.md }}>
          {directHere(place) ? <ModePicker more={() => router.push('/direct')} /> : null}
          <SettingsCard>
            {[<SettingsRow key="language" icon="globe" title={languageTitle()} detail={LANG_LABELS[lang()]} onPress={() => setLanguages(true)} />]}
          </SettingsCard>
          <SettingsCard inset={60}>
            {groupsHere(place).map((group) => (
              <SettingsRow
                key={group.id}
                icon={group.icon}
                title={t(group.title)}
                detail={itemsHere(group, place)
                  .map((item) => t(item.title))
                  .join(', ')}
                onPress={() => router.push({ pathname: '/settings/[group]', params: { group: group.id } })}
              />
            ))}
          </SettingsCard>
        </View>
      )}
      <LanguageSheet visible={languages} onClose={() => setLanguages(false)} />
    </Page>
  );
}
