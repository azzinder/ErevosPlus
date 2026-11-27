// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router } from 'expo-router';
import { Platform } from 'react-native';

import { t } from '../lib/i18n';
import type { Check, CheckId, Maker } from '../lib/permission-checks';
import { BROWSER, fix, IOS_OTHER_BROWSER, makerDone } from '../lib/permissions';
import type { Browser } from '../lib/web-permission-checks';
import { useColors } from '../theme/context';

import { Button, Card, Row, Text } from './ui';

// One item of the permissions check (app/permissions.tsx, and the first start's steps,
// app/first-steps.tsx): what it is, why it matters, how it is now, and the button that asks for it.

const WEB = Platform.OS === 'web';

/** What the check `id` is called. */
export function checkTitle(id: CheckId): string {
  switch (id) {
    case 'notices':
      return t('Notices');
    case 'calls':
      return t('The call notice');
    case 'messages':
      return t('The message notice');
    case 'fullScreen':
      return t('Calls over the lock screen');
    case 'battery':
      return t('Running on battery');
    case 'restricted':
      return t('Running in the background');
    case 'unused':
      return t('Pausing when unused');
    case 'data':
      return t('Mobile data in the background');
    case 'maker':
      return t("The phone maker's own setting");
    case 'microphone':
      return t('Microphone');
    case 'messageSound':
      return t('Sound for new messages');
    case 'lockScreen':
      return t('Notices on the lock screen');
    case 'dnd':
      return t('Calls through Do Not Disturb');
    case 'ringer':
      return t('The ringer');
    case 'saver':
      return t('Battery saver');
    case 'camera':
      return t('Camera');
    case 'nearby':
      return t('Phones nearby');
    case 'contacts':
      return t('Contacts');
    case 'alarms':
      return t('Exact times');
    case 'reminders':
      return t('The reminder notice');
    case 'home':
      return t('On the home screen');
    case 'push':
      return t('Notifications while closed');
    case 'storage':
      return t('Keeping the data');
  }
}

function why(id: CheckId, browser: Browser | null): string {
  switch (id) {
    case 'notices':
      return t('For "Incoming call" to show while Erevos is closed, with its buttons, and for the notice that messages came. Without notices a call may not ring at all on some phones.');
    case 'calls':
      return t('For a call to show, with its buttons: the "Calls" notices must be on, and set to pop up on the screen. Otherwise a call rings, but nothing shows to answer it from.');
    case 'messages':
      return t('For the notice that a message came while Erevos is closed, which also keeps the number on Erevos\'s icon. With the "Messages", "Messages without sound" or "Messages with a chat\'s own sound" notices turned off, messages still come, but nothing says so, or only for some.');
    case 'fullScreen':
      return t('So a call fills the screen over the lock screen, as a phone call does.');
    case 'battery':
      return t("Android's battery saving stops apps a while after they go to the background. Left out of it, Erevos keeps waiting for calls and messages.");
    case 'restricted':
      return t("With Erevos's battery use set to Restricted, Android does not let it run in the background at all: nothing comes and nothing rings while it is closed.");
    case 'unused':
      return t('Android pauses an app that is not opened for a few months, and takes back its permissions. Left out of it, Erevos keeps waiting for calls and messages however long it stays in the background.');
    case 'data':
      return t('Data Saver cuts mobile data to apps in the background: on mobile data nothing comes while Erevos is closed.');
    case 'maker':
      return t("Some phone makers stop apps in the background with a setting of their own, beyond Android's, and Erevos cannot see it.");
    case 'microphone':
      return t('For calls and voice messages. Without it a call can be answered but you are not heard.');
    case 'messageSound':
      return t('For the notice that a message came to make a sound. The "Messages" notices can be set to show silently, or have no sound chosen.');
    case 'lockScreen':
      return t('For "Incoming call" and "New message" to show on a locked phone. They never say who: on a locked phone the message notice says only "Erevos".');
    case 'dnd':
      return t('While Do Not Disturb is on, a call from Erevos rings and pops up only if its calls may break through it. Whether they should is yours to choose.');
    case 'ringer':
      return t('The phone is on silent or vibrate, or its ring volume is off: a call shows, but its ringtone does not sound.');
    case 'saver':
      return t('Battery saver is on now. While it is on, Android holds back apps in the background more, and calls and messages may come late.');
    case 'camera':
      return WEB ? t('For video calls.') : t('For video calls, photos and reading QR codes.');
    case 'nearby':
      return t('For chats with phones nearby over Bluetooth and Wi-Fi, without internet.');
    case 'contacts':
      return t("For the names of the phone's contacts in Phone, SMS and Contacts.");
    case 'alarms':
      return t('For SMS sent later, and the reminders of Chat with myself, to come at the minute they are set for.');
    case 'reminders':
      return t('For the notice that says "Reminder", or how many, at a reminder\'s time while Erevos is closed. With the "Reminders" notices turned off, nothing shows.');
    case 'home':
      return browser === 'iphone'
        ? t('On an iPhone, only Erevos added to the home screen can show notifications while it is closed. And Safari clears what a site keeps in a tab after 7 days without a visit, but not what an app on the home screen keeps.')
        : t('Installed, Erevos opens in a window of its own, as an app does, and the browser keeps its data more readily.');
    case 'push':
      return t('When messages come, or a call rings, while Erevos is closed, your server sends a push and Erevos shows how many messages came since you last opened it, such as "3 new messages", or "Call" when only a call rang. With a server or a sender\'s Erevos older than 2.0.0, or a message that other phones carried to the server, it shows no number until you open it. Turned on for each space under Settings → Notifications → Notifications while closed, never for hidden chats.');
    case 'storage':
      return t("Without it, the browser may clear Erevos's data when the device runs low on space, Safari above all, and your chats would be gone with it. A backup (Settings → Data and devices → Backups) is the safety net.");
  }
}

/** Where the maker keeps its setting, as its phones of the last years name it. */
function makerSteps(maker: Maker): string {
  switch (maker) {
    case 'huawei':
      return t('On this phone (Huawei or Honor): Settings → Battery → App launch → Erevos. Turn off Manage automatically, and keep Auto-launch, Secondary launch and Run in background on.');
    case 'xiaomi':
      return t('On this phone (Xiaomi): Security → Autostart → Erevos on. Then Settings → Apps → Erevos → Battery saver → No restrictions.');
    case 'oppo':
      return t('On this phone (OPPO, realme or OnePlus): Settings → Apps → Erevos → Battery usage. Allow background activity and auto launch.');
    case 'vivo':
      return t('On this phone (vivo): Settings → Battery → Background power consumption → Erevos: allow. Then i Manager → Autostart → Erevos on.');
    case 'samsung':
      return t('On this phone (Samsung): Settings → Battery → Background usage limits. Erevos must not be in Sleeping apps or Deep sleeping apps; add it to Never sleeping apps.');
    case 'asus':
      return t('On this phone (ASUS): Mobile Manager → Auto-start Manager → Erevos: allow.');
  }
}

/** How to add the web app to the home screen, where the browser has no question for it now. */
function installSteps(browser: Browser): string {
  switch (browser) {
    case 'iphone':
      return t('In Safari, tap Share (on iOS 26, under •••), then Add to Home Screen, and open Erevos from there. It keeps its data apart from this tab: make a backup here first (Settings → Data and devices → Backups), and restore it there.');
    case 'chromium':
      return t("In the browser's menu (⋮): Add to Home screen, or Install. On a computer, also the install icon at the right of the address bar.");
    case 'firefox':
      return t("In Firefox's menu (⋮): Add to Home screen, or Install.");
    case 'safari':
      return t('In Safari: File → Add to Dock. It keeps its data apart from this window: make a backup here first (Settings → Data and devices → Backups), and restore it there.');
    case 'other':
      return t("In this browser's menu: Install, or Add to Home screen.");
  }
}

/** Where to allow what the browser was once refused: it does not ask again. */
function siteSteps(id: CheckId, browser: Browser): string {
  switch (browser) {
    case 'iphone':
      return id === 'push'
        ? t('On the iPhone: Settings → Notifications → Erevos → Allow Notifications.')
        : IOS_OTHER_BROWSER
          ? t("On the iPhone: Settings → Apps → this browser (Chrome, Firefox, Edge…) → Microphone or Camera on, then allow this site in the browser's own site settings. Then open Erevos again.")
          : id === 'camera'
            ? t('On the iPhone: Settings → Apps → Safari → Camera (on older iOS, Settings → Safari): Ask or Allow. Then close Erevos and open it again.')
            : t('On the iPhone: Settings → Apps → Safari → Microphone (on older iOS, Settings → Safari): Ask or Allow. Then close Erevos and open it again.');
    case 'chromium':
      return t("Tap the icon left of the address, or ⋮ → Settings → Site settings, then this site, and set it to Allow (an app on an Android home screen: its page in Android's settings). Then open Erevos again.");
    case 'firefox':
      return t('Tap the icon left of the address and take the block away, or Settings → Privacy & Security → Permissions. Then open Erevos again.');
    case 'safari':
      return t('In Safari: Settings → Websites, that permission, then this site: Allow. Then open Erevos again.');
    case 'other':
      return t("In this browser's settings for this site, allow it. Then open Erevos again.");
  }
}

/** How to change it, where no button does it all, for a check that is not allowed. */
function steps(check: Check, maker: Maker | null, browser: Browser | null): string | null {
  if (check.id === 'maker') return maker ? makerSteps(maker) : null;
  if (check.state === 'ok' || check.state === 'ask') return null;
  switch (check.id) {
    case 'restricted':
      return t("On Erevos's page in Android's settings: Battery (or App battery usage) → Unrestricted, or at least Optimised.");
    case 'unused':
      return t("On Erevos's page in Android's settings, turn off Pause app activity if unused (on Android 11: Permissions → Remove permissions if app isn't used).");
    case 'lockScreen':
      return t("In Erevos's notice settings, let them show on the lock screen. If it is off for the whole phone: Android's Settings → Notifications → Notifications on lock screen (named differently on some phones).");
    case 'dnd':
      return t('In the "Calls" notice settings, turn on Override Do Not Disturb; on some phones, add Erevos to the apps allowed in Do Not Disturb instead.');
  }
  if (!browser || check.asks || check.state === 'note') return null;
  if (check.id === 'home') return installSteps(browser);
  if (check.id === 'push' && check.state === 'none') return t('This browser cannot show notifications for a closed web app. On an iPhone, add Erevos to the home screen first.');
  if (check.id === 'push' || check.id === 'microphone' || check.id === 'camera') return siteSteps(check.id, browser);
  return null;
}

function action(check: Check): string {
  switch (check.id) {
    case 'notices':
    case 'microphone':
    case 'camera':
    case 'nearby':
    case 'contacts':
    case 'storage':
      return t('Allow');
    case 'home':
      return t('Install');
    case 'push':
      return check.state === 'note' ? t('Open the setting') : t('Allow');
    default:
      return t('Open the setting');
  }
}

export function CheckCard({ check, maker, onChanged }: { check: Check; maker: Maker | null; onChanged: () => void }) {
  const colors = useColors();
  const label = (): { label: string; color: string } => {
    switch (check.state) {
      case 'ok':
        return { label: check.id === 'maker' ? t('Checked') : check.id === 'home' ? t('Installed') : t('Allowed'), color: colors.success };
      case 'missing':
        return { label: check.id === 'home' ? t('Not installed') : t('Not allowed'), color: colors.danger };
      case 'yours':
        return { label: check.id === 'maker' ? t('Check it yourself') : t('Cannot be read'), color: colors.warning };
      case 'ask':
        return { label: t('Asked when first used'), color: colors.textMuted };
      case 'none':
        return { label: t('Not in this browser'), color: check.needed ? colors.danger : colors.textMuted };
      case 'note':
        return {
          label:
            check.id === 'push'
              ? t('Off in this space')
              : check.id === 'ringer'
                ? t('Silent or vibrate')
                : check.id === 'dnd'
                  ? t('Not allowed, Do Not Disturb is on')
                  : t('On now'),
          color: check.id === 'push' ? colors.textMuted : check.id === 'dnd' ? colors.danger : colors.warning,
        };
    }
  };
  const state = label();
  const how = steps(check, maker, BROWSER);
  // On the web the off notifications are turned on under Settings → Notifications, which says what the push service sees.
  const press = () => (check.id === 'push' && check.state === 'note' ? router.push('/security?part=push') : void fix(check.id).then(onChanged));
  return (
    <Card>
      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text variant="bodyStrong" style={{ flexShrink: 1 }}>
          {checkTitle(check.id)}
        </Text>
        <Text variant="label" color={state.color}>
          {state.label}
        </Text>
      </Row>
      <Text variant="caption" tone="muted" style={hint}>
        {why(check.id, BROWSER)}
      </Text>
      {how ? (
        <Text variant="caption" style={hint}>
          {how}
        </Text>
      ) : null}
      {check.state !== 'ok' && (check.asks ?? true) ? (
        <Row wrap>
          <Button title={action(check)} kind="secondary" compact onPress={press} />
          {check.id === 'maker' ? <Button title={t('I did it')} kind="ghost" compact onPress={() => void makerDone(true).then(onChanged)} /> : null}
        </Row>
      ) : check.id === 'maker' ? (
        <Row wrap>
          <Button title={t('Mark as not done')} kind="ghost" compact onPress={() => void makerDone(false).then(onChanged)} />
        </Row>
      ) : null}
    </Card>
  );
}

// Hints read better a little larger and looser than captions.
const hint = { fontSize: 14, lineHeight: 20 };
