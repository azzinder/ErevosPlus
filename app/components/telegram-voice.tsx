// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';

import { t } from '../lib/i18n';
import { telegramVoiceCancel, telegramVoiceStart, telegramVoiceStop } from '../lib/telegram-out';
import type { TgVoiceOut } from '../lib/telegram-store';
import { MAX_VOICE_MS } from '../lib/voice';

import type { VoiceControl } from './composer';

// Voice messages for a Telegram chat (app/telegram-chat.tsx): the microphone button of
// components/matrix-voice.tsx (MicButton) is held to record, and letting go sends. The recording is
// made by the ErevosGram build itself in Telegram's own sound format (lib/telegram-out.ts), not by
// the phone's recorder the other chats use. Sliding away lets the recording go, and so does leaving
// the screen. A minute is the most; under a second is taken for a slip of the finger.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

/** Records one voice message at a time: `send` gets it once the microphone is let go, `say` what the screen should tell. */
export function useTelegramVoice({ send, say }: { send: (voice: TgVoiceOut) => Promise<void>; say: (text: string) => void }): VoiceControl {
  const [recording, setRecording] = useState(false);
  const holding = useRef(false);
  const letGo = useRef(false);
  const started = useRef<Promise<boolean> | null>(null);
  const longest = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The screen's latest, for a recording that ends on its own a minute later.
  const latest = useRef({ send, say });
  latest.current = { send, say };

  // Left in the middle of a recording: it goes unsent.
  useEffect(
    () => () => {
      if (longest.current) clearTimeout(longest.current);
      if (started.current) {
        started.current = null;
        holding.current = false;
        void telegramVoiceCancel().catch(() => undefined);
      }
    },
    [],
  );

  function start() {
    holding.current = true;
    letGo.current = false;
    started.current = telegramVoiceStart()
      .then((ok) => {
        if (!ok) {
          latest.current.say(t('Erevos may not use the microphone. Allow it in the phone settings to send voice messages.'));
          return false;
        }
        if (!holding.current) {
          // Let go while the microphone was getting ready: too short to be meant.
          void telegramVoiceCancel().catch(() => undefined);
          if (!letGo.current) latest.current.say(t('Hold to record, and let go to send.'));
          return false;
        }
        setRecording(true);
        longest.current = setTimeout(() => void stop(false), MAX_VOICE_MS);
        return true;
      })
      .catch((error: unknown) => {
        latest.current.say(t('Cannot record. {error}', { error: errorText(error) }));
        return false;
      });
  }

  async function stop(cancel: boolean) {
    holding.current = false;
    letGo.current = cancel;
    if (longest.current) clearTimeout(longest.current);
    longest.current = null;
    const ready = started.current;
    started.current = null;
    if (!ready || !(await ready)) return;
    setRecording(false);
    try {
      if (cancel) {
        await telegramVoiceCancel();
        latest.current.say(t('Recording cancelled.'));
        return;
      }
      const voice = await telegramVoiceStop();
      if (!voice) {
        latest.current.say(t('Hold to record, and let go to send.'));
        return;
      }
      await latest.current.send(voice);
    } catch (error) {
      latest.current.say(t('Not sent. {reason}', { reason: errorText(error) }));
    }
  }

  return { recording, start, stop: (cancel) => void stop(cancel) };
}
