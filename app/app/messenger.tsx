// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { MsgAccountScreen } from '../components/msg-account';

/** The Messenger account (Erevos+, components/msg-account.tsx). */
export default function MessengerScreen() {
  return <MsgAccountScreen service="messenger" />;
}
