// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { timerLabel } from '../lib/chat-screen';
import type { Among } from '../lib/contact-book';
import { t } from '../lib/i18n';
import type { PhotoQuality } from '../lib/pick-photo';
import { CardSheet } from './card-share';
import { ComposerPanel, type ComposerTile, type ComposerWay } from './composer';
import { usePanelBack } from './panel-close';

// What "+" opens in a chat on Matrix, XMPP or Nostr and in an SMS conversation
// (app/matrix-chat.tsx, app/xmpp-chat.tsx, app/nostr-chat.tsx, app/sms.tsx): Erevos's own panel
// (ComposerPanel, components/composer.tsx), under the message field, where these chats had a sheet
// of plain buttons. The chat says what it can send, as tiles, and the ways its next message can
// go; how photos go is chosen in the panel, as in an Erevos chat. A tile closes the panel as it
// is chosen. The panel's «encrypted» mark shows only where what is sent is end-to-end encrypted.
// Android's back closes the panel before it leaves the chat (components/panel-close.ts).

/** A tile of the panel, or nothing where the chat cannot send it. */
export type NetworkTile = ComposerTile | null | false | undefined;

/** The way row that makes the next message disappear, as these chats have it (components/chat-rules.tsx useVanishOnce). */
export function vanishWay(vanish: { on: boolean; seconds: number; toggle: () => void }, close: () => void): ComposerWay {
  return {
    key: 'vanish',
    title: t('Disappearing message'),
    description: t('Disappears {time} after it is sent', { time: timerLabel(vanish.seconds) }),
    icon: 'timer',
    value: vanish.on ? timerLabel(vanish.seconds) : t('Off'),
    // On, it shows over the field, with how long; the panel gives way to it.
    onPress: () => {
      close();
      if (!vanish.on) vanish.toggle();
    },
  };
}

/** The way row that holds what is typed to go later: `ask` opens the choice of when, and says no while nothing is typed. */
export function laterWay(ask: () => void): ComposerWay {
  return { key: 'later', title: t('Send later'), description: t('Goes at the time you choose'), icon: 'later', onPress: ask };
}

export function NetworkPanel({
  open,
  onClose,
  shown = true,
  encrypted,
  tiles,
  ways,
  photos,
  card,
  foot,
  style,
  onLayout,
}: {
  open: boolean;
  onClose: () => void;
  /** Whether the chat shows: its sheets open only then, and back closes the panel only then. */
  shown?: boolean;
  /** Whether what is sent here is end-to-end encrypted: the panel says so only then. */
  encrypted: boolean;
  tiles: NetworkTile[];
  ways?: ComposerWay[];
  /** How photos go, where the chat sends them as chosen (lib/photo-quality.ts). */
  photos?: { quality: PhotoQuality; choose: (quality: PhotoQuality) => void };
  /** A contact card, the last tile: whose contacts it is chosen from, what is said under them, and where it goes. */
  card?: { among: Among; foot?: string; onSend: (card: string) => void } | null;
  foot?: string;
  /** Where the panel sits in the screen. */
  style?: StyleProp<ViewStyle>;
  /** The panel is laid out: the screen brings it into view. */
  onLayout?: () => void;
}) {
  const [carding, setCarding] = useState(false);
  usePanelBack(open && shown, onClose);
  const all: ComposerTile[] = [];
  for (const tile of tiles) {
    if (!tile) continue;
    all.push({
      ...tile,
      onPress: () => {
        onClose();
        tile.onPress();
      },
    });
  }
  if (card) {
    all.push({
      key: 'card',
      title: t('Contact card'),
      icon: 'contact',
      onPress: () => {
        onClose();
        setCarding(true);
      },
    });
  }
  return (
    <>
      {open ? (
        <View style={style} onLayout={onLayout}>
          <ComposerPanel tiles={all} quality={photos ? { value: photos.quality, onChange: photos.choose } : undefined} ways={ways} foot={foot} encrypted={encrypted} />
        </View>
      ) : null}
      {card ? (
        <CardSheet
          visible={carding && shown}
          onClose={() => setCarding(false)}
          onSend={(sent) => {
            setCarding(false);
            card.onSend(sent);
          }}
          among={card.among}
          foot={card.foot}
        />
      ) : null}
    </>
  );
}
