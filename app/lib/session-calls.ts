// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { t } from './i18n';

// Session's calls in Erevos+ (messenger/.../calls/SessionCalls.kt, its own screen and
// notifications): the words they say, in the app's language, by the keys SessionCalls knows.

/** The call screen's and notifications' words, as SessionCalls.setTexts takes them. */
export function sessionCallTexts(): Record<string, string> {
  return {
    channel: t('Session calls'),
    incoming: t('Session call'),
    missed: t('Missed Session call'),
    ringing: t('Session call…'),
    calling: t('Calling…'),
    connecting: t('Connecting…'),
    notStarted: t('The call did not start:'),
    failed: t('The call failed:'),
    noAnswer: t('No answer.'),
    ended: t('The call ended.'),
    lost: t('The connection was lost.'),
    decline: t('Decline'),
    answer: t('Answer'),
    mute: t('Mute'),
    unmute: t('Microphone'),
    speaker: t('Speaker'),
    earpiece: t('Earpiece'),
    camera: t('Camera'),
    cameraOff: t('Camera off'),
    hangUp: t('Hang up'),
    quietChannel: t('Session calls of muted chats'),
  };
}
