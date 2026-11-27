// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { Button, Card, Chip, Page, Row, Text } from '../components/ui';
import { ask } from '../lib/alert';
import { mark, plural, t } from '../lib/i18n';
import { canLora, findRadios, lora, resumeLora, savedRadio, setRadio, setSharing, type SavedRadio } from '../lib/radio';
import type { LoraState } from '../lib/lora';

// LoRa through a Meshtastic radio (lib/lora.ts), off unless a radio is set here: finding one,
// what it means for privacy before it is on, whether the radio may say its name and where it is,
// and how the radio is.

// Meshtastic's regions by their code (config.proto, RegionCode), named as its app names them.
const REGIONS = [
  '',
  'US', 'EU_433', 'EU_868', 'CN', 'JP', 'ANZ', 'KR', 'TW', 'RU', 'IN', 'NZ_865', 'TH', 'LORA_24', 'UA_433',
  'UA_868', 'MY_433', 'MY_919', 'SG_923', 'PH_433', 'PH_868', 'PH_915', 'ANZ_433', 'KZ_433', 'KZ_863',
  'NP_865', 'BR_902', 'ITU1_2M', 'ITU2_2M', 'EU_866', 'EU_874', 'EU_917', 'EU_N_868', 'ITU3_2M', 'ITU1_70CM',
  'ITU2_70CM', 'ITU3_70CM', 'ITU2_125CM',
];

const SHOWN: Record<LoraState['status'], string> = {
  off: mark('Off'),
  connecting: mark('Linking to the radio…'),
  starting: mark('Linked, reading its settings…'),
  up: mark('Linked'),
  down: mark('Not linked'),
};

export default function LoraScreen() {
  const [radio, setRadioShown] = useState<SavedRadio | null | undefined>(undefined);
  const [state, setState] = useState<LoraState>(lora.state());
  // The radios found so far while looking, or null when not looking; and which look this is.
  const [found, setFound] = useState<SavedRadio[] | null>(null);
  const [round, setRound] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    savedRadio()
      .then(setRadioShown)
      .catch(() => setRadioShown(null));
    // Set already, as before Erevos last closed: it links now, if Chat did not yet.
    resumeLora();
    return lora.onChange(() => setState(lora.state()));
  }, []);

  // Looks for radios while the list shows, a few seconds each look.
  const looking = found !== null;
  useEffect(() => {
    if (!looking) return;
    return findRadios((radio) => setFound((list) => (list && !list.some((r) => r.address === radio.address) ? [...list, radio] : list)));
  }, [looking, round]);

  if (!canLora()) {
    return (
      <Page>
        <Text variant="title">{t('LoRa radio')}</Text>
        <Text tone="muted">{t('This build of Erevos has no LoRa yet. It comes with the next build of the app, on Android.')}</Text>
      </Page>
    );
  }

  function look() {
    ask(
      t('Before LoRa is on'),
      [
        t(
          'A LoRa radio is heard kilometres away, and it can be found by its signal. What Erevos sends stays end-to-end encrypted, but anyone with a radio can tell that yours sends, when and how much.',
        ),
        t(
          'Meshtastic radios also say their name to every radio in reach now and then, and where they are if they have GPS or a fixed position. Erevos keeps yours from doing so: it sets its role to Client hidden, turns its GPS off and removes a fixed position, and puts the role and GPS back when you turn LoRa off while it is linked. It still answers a radio that asks its name, so give it a name that says nothing of you, in the Meshtastic app.',
        ),
        t(
          'LoRa takes only text. Photos, voice messages and files do not go over it: they wait in the chat, marked Waiting, and go by themselves once the server or the phone nearby can take them.',
        ),
      ].join('\n\n'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Find my radio'), onPress: () => setFound([]) },
      ],
    );
  }

  async function use(picked: SavedRadio) {
    setNote('');
    try {
      await setRadio(picked);
      setRadioShown(picked);
      setFound(null);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  function share(on: boolean) {
    if (!radio || on === (radio.shares === true)) return;
    const change = () => {
      setNote('');
      setSharing(on)
        .then(() => setRadioShown({ ...radio, shares: on }))
        .catch((error: unknown) => setNote(error instanceof Error ? error.message : String(error)));
    };
    if (!on) {
      change();
      return;
    }
    ask(
      t('Let the radio say where it is?'),
      t(
        'Your radio then says its name to every radio in reach now and then, kilometres away, and where it is if its GPS is on. It says them in the clear, as Meshtastic does: anyone with a radio can read them, without Erevos. They can show where you are, and tie the radio to you.',
      ) +
        '\n\n' +
        t('Even with this off, a radio that sends can be found by its signal, by someone with the gear to look for it.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Let it say them'), style: 'destructive', onPress: change },
      ],
    );
  }

  async function turnOff() {
    setNote('');
    try {
      await setRadio(null);
      setRadioShown(null);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  // Not linked, the radio cannot get back the settings Erevos changed: said first.
  function askTurnOff() {
    if (!radio?.kept || state.status === 'up') {
      void turnOff();
      return;
    }
    ask(
      t('The radio is not linked'),
      t('So it keeps the settings Erevos gave it: role Client hidden, GPS off. Set them back in the Meshtastic app if you want them, or turn LoRa off once the radio is linked.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Turn LoRa off'), onPress: () => void turnOff() },
      ],
    );
  }

  const { status, detail, name, region, transmits, waiting, notQuiet } = state;
  return (
    <Page>
      <Text variant="title">{t('LoRa radio')}</Text>
      <Card>
        <Text variant="bodyStrong">{radio ? t('LoRa: on, {name}', { name: radio.name || radio.address }) : t('LoRa: off')}</Text>
        <Text tone="muted">
          {t(
            'With a Meshtastic LoRa radio linked to this phone by Bluetooth, Erevos reaches Erevos with a radio on the same mesh, kilometres away, with no internet, through the Meshtastic radios between too.',
          )}
        </Text>
        <Text tone="muted">
          {t(
            'It is slow: a message takes seconds on the air, and the law allows a radio only so much air time. So LoRa takes a message only when the server and the phones nearby cannot, and only text and deletes: not voice messages, photos, files, read marks or calls. Voice messages, photos and files wait in the chat, marked Waiting, until the server or a phone nearby can take them. Hidden chats never go over it.',
          )}
        </Text>
        <Text tone="muted">
          {t('While Erevos is linked to the radio, the Meshtastic app cannot be: close it, or disconnect it there first.')}
        </Text>
        {radio === undefined ? null : radio ? (
          <Button title={t('Turn LoRa off')} kind="secondary" onPress={askTurnOff} />
        ) : found === null ? (
          <Button title={t('Find my radio')} onPress={look} />
        ) : null}
      </Card>
      {!radio && found !== null ? (
        <Card>
          <Text variant="bodyStrong">{found.length > 0 ? t('Radios found') : t('Looking for Meshtastic radios…')}</Text>
          <Text tone="muted">{t('Turn the radio on and keep it near. A radio not paired yet asks for its PIN: it shows on its screen, or is 123456.')}</Text>
          <Row wrap>
            {found.map((r) => (
              <Chip key={r.address} label={r.name || r.address} onPress={() => void use(r)} />
            ))}
          </Row>
          <Row wrap>
            <Button title={t('Look again')} kind="secondary" compact onPress={() => setRound((n) => n + 1)} />
            <Button title={t('Cancel')} kind="secondary" compact onPress={() => setFound(null)} />
          </Row>
        </Card>
      ) : null}
      {radio ? (
        <Card>
          <Text variant="bodyStrong">{t(SHOWN[status])}</Text>
          {name ? <Text tone="muted">{t('The radio: {name}', { name })}</Text> : null}
          {status === 'down' && detail ? <Text tone="muted">{detail}</Text> : null}
          {status === 'down' ? <Text variant="caption" tone="faint">{t('Erevos tries again every half a minute while it is open.')}</Text> : null}
          {region === 0 ? <Text tone="muted">{t('Its region is not set, so it sends nothing. Set it in the Meshtastic app.')}</Text> : null}
          {region ? <Text variant="caption" tone="faint">{t('Region: {region}', { region: REGIONS[region] ?? region })}</Text> : null}
          {!transmits ? <Text tone="muted">{t('It does not send: Transmit enabled is off in its LoRa settings, in the Meshtastic app.')}</Text> : null}
          {waiting > 0 ? <Text variant="caption" tone="faint">{plural(waiting, '{n} piece waiting to go', '{n} pieces waiting to go')}</Text> : null}
        </Card>
      ) : null}
      {radio ? (
        <Card>
          <Text variant="bodyStrong">{t('Its name and where it is')}</Text>
          <Row wrap>
            <Chip label={t('Kept quiet')} selected={!radio.shares} onPress={() => share(false)} />
            <Chip label={t('Said to all in reach')} selected={radio.shares === true} onPress={() => share(true)} />
          </Row>
          <Text variant="caption" tone="muted">
            {radio.shares
              ? t('The radio says its name to every radio in reach now and then, and where it is if its GPS is on, in the clear, as Meshtastic does. A fixed position Erevos removed is set again in the Meshtastic app.')
              : t('Erevos keeps the radio from saying its name and where it is to the radios in reach: role Client hidden, GPS off, no fixed position. It still answers a radio that asks its name, so give it a name that says nothing of you, in the Meshtastic app.')}
          </Text>
          {!radio.shares && notQuiet ? (
            <Text tone="muted">
              {t(
                'The radio did not keep these settings, so it may still say its name and where it is. Set them in the Meshtastic app: Device role Client hidden, GPS off, no fixed position.',
              )}
            </Text>
          ) : null}
        </Card>
      ) : null}
      {note ? <Text tone="muted">{note}</Text> : null}
    </Page>
  );
}
