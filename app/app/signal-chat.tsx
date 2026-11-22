// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { MsgChatScreen } from '../components/msg-chat';

/** A Signal chat (Erevos+, components/msg-chat.tsx). */
export default function SignalChatScreen() {
  return <MsgChatScreen service="signal" />;
}
