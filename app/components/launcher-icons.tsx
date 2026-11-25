// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { mark, t } from '../lib/i18n';
import {
  calculatorOff,
  calculatorOn,
  cameraIconOn,
  LAUNCHER_COLORS,
  LAUNCHER_ICONS,
  launcherColors,
  setCalculator,
  setCameraIcon,
  setLauncherColor,
  type LauncherColor,
  type LauncherIcon,
} from '../modules/erevos-icons';
import { radius, space, type Colors } from '../theme/colors';
import { useStyles, useTheme } from '../theme/context';
import { PasswordSheet } from './PasswordSheet';
import { Button, Card, Row, SectionTitle, Text } from './ui';
import { EDITION, editionName, inEdition } from '../lib/edition';
import { cameraOpensLocked } from '../lock/camera-drop';

// Appearance → Launcher icons: the colour of each of Erevos's icons in the phone's apps (Erevos,
// Phone, SMS, Contacts, Camera), each drawn in every colour to pick from. Android only, and the
// phone's choice, not a space's (modules/erevos-icons). The Camera's is off at first: a button puts
// it among the phone's apps. Below them, a working calculator can stand in place of Erevos's icon
// (CalculatorChoice): its code, then =, opens Erevos.

const ICON_LABELS: Record<LauncherIcon, string> = { erevos: editionName(), phone: mark('Phone'), sms: 'SMS', contacts: mark('Contacts'), camera: mark('Camera') };
const COLOR_LABELS: Record<LauncherColor, string> = {
  // Erevos+'s first colour is its own purple: it says the app's name.
  red: EDITION === 'plus' ? 'Erevos+' : mark('Red'),
  orange: mark('Orange'),
  green: mark('Green'),
  blue: mark('Blue'),
  violet: mark('Violet'),
  dark: mark('Dark'),
};

// Each icon in each colour, as the launcher draws it (modules/*/res/mipmap-*), made small.
const PICTURES: Record<LauncherIcon, Record<LauncherColor, ImageSourcePropType>> = {
  erevos: {
    red: require('../assets/icon/launcher/erevos-red.png'),
    orange: require('../assets/icon/launcher/erevos-orange.png'),
    green: require('../assets/icon/launcher/erevos-green.png'),
    blue: require('../assets/icon/launcher/erevos-blue.png'),
    violet: require('../assets/icon/launcher/erevos-violet.png'),
    dark: require('../assets/icon/launcher/erevos-dark.png'),
  },
  phone: {
    red: require('../assets/icon/launcher/phone-red.png'),
    orange: require('../assets/icon/launcher/phone-orange.png'),
    green: require('../assets/icon/launcher/phone-green.png'),
    blue: require('../assets/icon/launcher/phone-blue.png'),
    violet: require('../assets/icon/launcher/phone-violet.png'),
    dark: require('../assets/icon/launcher/phone-dark.png'),
  },
  sms: {
    red: require('../assets/icon/launcher/sms-red.png'),
    orange: require('../assets/icon/launcher/sms-orange.png'),
    green: require('../assets/icon/launcher/sms-green.png'),
    blue: require('../assets/icon/launcher/sms-blue.png'),
    violet: require('../assets/icon/launcher/sms-violet.png'),
    dark: require('../assets/icon/launcher/sms-dark.png'),
  },
  contacts: {
    red: require('../assets/icon/launcher/contacts-red.png'),
    orange: require('../assets/icon/launcher/contacts-orange.png'),
    green: require('../assets/icon/launcher/contacts-green.png'),
    blue: require('../assets/icon/launcher/contacts-blue.png'),
    violet: require('../assets/icon/launcher/contacts-violet.png'),
    dark: require('../assets/icon/launcher/contacts-dark.png'),
  },
  camera: {
    red: require('../assets/icon/launcher/camera-red.png'),
    orange: require('../assets/icon/launcher/camera-orange.png'),
    green: require('../assets/icon/launcher/camera-green.png'),
    blue: require('../assets/icon/launcher/camera-blue.png'),
    violet: require('../assets/icon/launcher/camera-violet.png'),
    dark: require('../assets/icon/launcher/camera-dark.png'),
  },
};

/** The Launcher icons section, or nothing where the phone offers no choice; `titled` false on a screen of its own. */
export function LauncherIcons({ titled = true }: { titled?: boolean }) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [chosen, setChosen] = useState(launcherColors);
  const [cameraOn, setCameraOn] = useState(cameraIconOn);
  // Whether the camera opens before the password (lock/camera-drop.ts), as its words then say.
  const [cameraFirst, setCameraFirst] = useState(false);
  useEffect(() => {
    let live = true;
    cameraOpensLocked().then(
      (on) => live && setCameraFirst(on),
      () => {},
    );
    return () => {
      live = false;
    };
  }, []);
  if (!chosen) return null;
  // An icon this app has; the Camera's only where the Collection is part of the edition, never in Erevos Lite.
  const shown = (icon: LauncherIcon) => chosen[icon] !== undefined && (icon !== 'camera' || inEdition('collection'));

  function toggleCamera() {
    if (cameraOn === null) return;
    if (setCameraIcon(!cameraOn)) setCameraOn(cameraIconOn());
  }

  function choose(icon: LauncherIcon, color: LauncherColor) {
    if (chosen?.[icon] === color) return;
    if (setLauncherColor(icon, color)) setChosen(launcherColors());
  }

  return (
    <>
      {titled ? <SectionTitle title={t('Launcher icons')} /> : null}
      <Text variant="caption" tone="muted" style={styles.hint}>
        {t("The color of each icon among the phone's apps. It is the phone's, not each space's, as the icons show before Erevos is unlocked.")}
      </Text>
      {LAUNCHER_ICONS.filter(shown).map((icon) => (
        <Card key={icon}>
          <Text variant="bodyStrong">{t(ICON_LABELS[icon])}</Text>
          <View style={styles.row}>
            {LAUNCHER_COLORS.map((color) => {
              const selected = chosen[icon] === color;
              return (
                <Pressable
                  key={color}
                  onPress={() => choose(icon, color)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${t(ICON_LABELS[icon])}: ${t(COLOR_LABELS[color])}`}
                  style={[styles.choice, { borderColor: selected ? colors.text : 'transparent' }]}
                >
                  <Image source={PICTURES[icon][color]} style={styles.picture} />
                </Pressable>
              );
            })}
          </View>
          {icon === 'camera' && cameraOn !== null ? (
            <>
              <Text variant="caption" tone="muted" style={styles.hint}>
                {cameraFirst
                  ? t("Erevos's camera at a tap, even while Erevos and the Collection are locked: what it takes shows only after the password, in the Collection (Open the camera without the password, in its settings). Holding Erevos's icon down also offers Camera. Neither shows while the Collection is off or the calculator stands in place of Erevos.")
                  : t("Erevos's camera at a tap, behind Erevos's password and the Collection's, as from the Collection. Holding Erevos's icon down also offers Camera. Neither shows while the Collection is off or the calculator stands in place of Erevos.")}
              </Text>
              <Row wrap>
                <Button
                  title={cameraOn ? t("Take the Camera off the phone's apps") : t("Put the Camera among the phone's apps")}
                  kind={cameraOn ? 'secondary' : 'primary'}
                  compact
                  onPress={toggleCamera}
                />
              </Row>
            </>
          ) : null}
        </Card>
      ))}
      <Text variant="caption" tone="muted" style={styles.hint}>
        {t('After a change some launchers take the icon off the home screen: add it again from the list of apps. The change shows within a few seconds.')}
      </Text>
      <CalculatorChoice />
    </>
  );
}

/** The fewest and most digits of the calculator's code. */
const CODE = /^\d{4,12}$/;

// A calculator that works, among the phone's apps in place of Erevos's icon, on or off; its code
// opens Erevos. Nothing where this build cannot.
function CalculatorChoice() {
  const styles = useStyles(makeStyles);
  const [on, setOn] = useState(calculatorOn);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  if (on === null) return null;

  async function save(code: string) {
    if (!CODE.test(code)) throw new Error(t('Use digits only, 4 to 12 of them.'));
    if (!setCalculator(code)) throw new Error(t('The calculator could not be set. Try again.'));
    const was = on;
    setOn(calculatorOn());
    setAsking(false);
    setNote(was ? t('New code saved.') : t("Done. Within a few seconds Erevos's icon leaves the phone's apps, and the calculator takes its place: open Erevos from it from now on."));
  }

  function off() {
    if (!calculatorOff()) return;
    setOn(calculatorOn());
    setNote(t("Erevos's icon is back among the phone's apps."));
  }

  return (
    <Card>
      <Text variant="bodyStrong">{t('Calculator in place of Erevos')}</Text>
      <Text variant="caption" tone="muted" style={styles.hint}>
        {t("A calculator that works shows among the phone's apps instead of Erevos's icon. Type your code in it, then =, and Erevos opens, asking for its password as always. Only the icon is hidden: Android's list of apps, the notices and the recent apps still say Erevos.")}
      </Text>
      {on ? <Text>{t('On: the calculator stands in place of Erevos.')}</Text> : null}
      <Row wrap>
        {on ? (
          <>
            <Button title={t('Change the code')} compact onPress={() => setAsking(true)} />
            <Button title={t("Show Erevos's icon again")} kind="secondary" compact onPress={off} />
          </>
        ) : (
          <Button title={t('Put the calculator in its place')} compact onPress={() => setAsking(true)} />
        )}
      </Row>
      {note ? (
        <Text variant="caption" tone="muted" style={styles.hint}>
          {note}
        </Text>
      ) : null}
      <PasswordSheet
        visible={asking}
        title={t('Calculator code')}
        repeat
        hint={t('Digits only, 4 to 12 of them. Type them in the calculator, then =.')}
        submitLabel={t('Save')}
        onClose={() => setAsking(false)}
        onSubmit={save}
      />
    </Card>
  );
}

const makeStyles = (_colors: Colors) =>
  StyleSheet.create({
    hint: {
      fontSize: 14,
      lineHeight: 20,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: space.sm,
    },
    choice: {
      padding: 3,
      borderWidth: 2,
      borderRadius: radius.sm,
    },
    picture: {
      width: 40,
      height: 40,
      borderRadius: 2,
    },
  });
