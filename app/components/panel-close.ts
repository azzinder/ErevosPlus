// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useIsFocused } from 'expo-router';
import { useEffect, useRef } from 'react';
import { BackHandler, Keyboard } from 'react-native';

// The "+" panel of another network's chat (app/telegram-chat.tsx, components/msg-chat.tsx), as
// Erevos's own (components/composer.tsx): opening it puts the keyboard away, or the panel would
// open behind it, and Android's back closes it first, only on the screen in view.

/** Puts the keyboard away before the panel opens. */
export function beforePanel(): void {
  Keyboard.dismiss();
}

/** While `open`, Android's back calls `close` instead of leaving the chat. */
export function usePanelBack(open: boolean, close: () => void): void {
  const focused = useIsFocused();
  const latest = useRef(close);
  latest.current = close;
  useEffect(() => {
    if (!open || !focused) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      latest.current();
      return true;
    });
    return () => back.remove();
  }, [open, focused]);
}
