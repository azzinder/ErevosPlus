// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { Button, Field, Input, Row, Text, TextButton } from './ui';
import { t } from '../lib/i18n';
import { loadModelsServer, modelsFolder, modelsHost, modelsOwn, onModelsServer, setModelsServer } from '../lib/models-server';
import { useColors } from '../theme/context';

/** The host the models are downloaded from now (lib/models-server.ts), for the words that say so before a download. */
export function useModelsHost(): string {
  const [host, setHost] = useState(modelsHost());
  useEffect(() => {
    const stop = onModelsServer(() => setHost(modelsHost()));
    void loadModelsServer().then(() => setHost(modelsHost()));
    return stop;
  }, []);
  return host;
}

// Under the words that say where a model is downloaded from (the speech and translation sheets): a
// web folder of one's own instead, for whoever has one, and the way back.
export function ModelsServer() {
  const host = useModelsHost();
  const colors = useColors();
  const [typed, setTyped] = useState<string | null>(null);
  const [problem, setProblem] = useState('');
  const use = async () => {
    const folder = modelsFolder(typed ?? '');
    if (!folder) {
      setProblem(t('That is not a web address. Type the folder as you were given it, such as cloud.example.org/erevos-models.'));
      return;
    }
    await setModelsServer(folder);
    setProblem('');
    setTyped(null);
  };
  if (typed === null) {
    return (
      <Row wrap>
        <TextButton title={t('Download from another server…')} onPress={() => setTyped('')} />
        {modelsOwn() ? <TextButton title={t('Back to the usual server')} onPress={() => void setModelsServer(null)} /> : null}
      </Row>
    );
  }
  return (
    <>
      <Field label={t('Web folder with the models')}>
        <Input value={typed} onChangeText={setTyped} placeholder="cloud.example.org/erevos-models" autoCapitalize="none" autoCorrect={false} keyboardType="url" />
      </Field>
      <Row wrap>
        <Button title={t('Use')} compact disabled={!typed.trim()} onPress={() => void use()} />
        <TextButton title={t('Cancel')} onPress={() => (setTyped(null), setProblem(''))} />
      </Row>
      {problem ? <Text color={colors.danger}>{problem}</Text> : null}
      <Text variant="caption" tone="muted">
        {t('A web folder, yours or your group’s, that holds the same files under the same names. Erevos checks every file after the download and refuses one that was changed. That server, not {host}, then sees your IP address.', { host })}
      </Text>
    </>
  );
}
