// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { Button, Page, Text } from '../components/ui';
import { finishDriveSignIn } from '../lib/google-drive';
import { CAN_DRIVE } from '../lib/google-drive-ids';
import { t } from '../lib/i18n';

// Where the browser comes back after signing in with Google for Google Drive (app/backup.tsx):
// <package>:/oauth2redirect, with the mark of the sign-in Erevos started (state) and Google's
// one-use code, or why there is none, held until the space is open (lib/open-link.ts). The sign-in
// waiting for it is taken at once, whatever came, and the code goes to Google only with its own
// mark (lib/google-drive.ts); then Backups goes on with it. In a build with no Google Drive, the
// link opens nothing.

const one = (value: string | string[] | undefined) => (typeof value === 'string' ? value : undefined);

// Back to Backups, or to it in place of this screen when the browser came back to a new start.
const toBackups = () => router.dismissTo('/backup' as Href);

export default function OAuthRedirectScreen() {
  const params = useLocalSearchParams<{ state?: string; code?: string; error?: string }>();
  const [problem, setProblem] = useState('');
  // The code is used once, even when the screen is drawn again.
  const used = useRef(false);

  useEffect(() => {
    if (used.current) return;
    used.current = true;
    if (!CAN_DRIVE) {
      if (router.canGoBack()) router.back();
      else router.replace('/');
      return;
    }
    finishDriveSignIn({ state: one(params.state), code: one(params.code), error: one(params.error) }).then(toBackups, (error: unknown) =>
      setProblem(error instanceof Error ? error.message : String(error)),
    );
  }, [params.state, params.code, params.error]);

  if (!CAN_DRIVE) return null;
  return (
    <Page>
      <Text variant="title">Google Drive</Text>
      <Text tone="muted">{problem || t('Signing in…')}</Text>
      {problem ? <Button title={t('Back')} kind="secondary" onPress={toBackups} /> : null}
    </Page>
  );
}
