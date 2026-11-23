// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { Redirect, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { EDITION } from '../lib/edition';
import { payOfLink } from '../lib/pay';

import { SendTo } from './share';

// A payment request another app asks to send, as Fasouli does (erevos://pay?…, lib/pay.ts): Send
// to, with only Erevos chats, after the password; the chat picked asks before it goes. Erevos Lite
// sends none (docs/editions.md): the link only opens it.
export default function PayScreen() {
  if (EDITION === 'lite') return <Redirect href="/" />;
  return <AskedPay />;
}

function AskedPay() {
  const params = useLocalSearchParams<{ a?: string; d?: string; c?: string; w?: string; r?: string }>();
  const pay = useMemo(() => payOfLink(params), [params.a, params.d, params.c, params.w, params.r]);
  return <SendTo pay={pay} />;
}
