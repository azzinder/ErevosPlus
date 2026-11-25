// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { AppState } from 'react-native';

import { currentSpace } from '../lock/keys';
import { loadBatteryMode, onBatteryMode } from './battery-mode';
import { othersCarried, ownCarried } from './carried-store';
import { choose } from './alert';
import { currentCall } from './call';
import { onCallChange } from './calls';
import { forgetBridges, setBridgeAsk } from './bridge';
import { openHiddenPlace } from './hidden-contacts';
import { t } from './i18n';
import { nearby } from './nearby';
import { readForOthers } from './relay';
import { ipWarningText } from './ip-warning';
import { HAS_LINKS, onLinkEvent, resumeLora, SAMSUNG, sendLink, setAwareLinks, setDirectLinks, setLanLinks, setLinksQuiet, startLinks, stopLinks } from './radio';
import { nearbyChanged, openNearby } from './receiver';
import { secureGet, secureSet } from './secure';

// The links to phones nearby while a space is open, whatever screen shows: the radio (Bluetooth,
// Wi-Fi Aware, and a LoRa radio when one is set) and the same Wi-Fi or hotspot (lib/radio.ts). So
// a message, a group's message or a call from a phone nearby comes on the home screen and in the
// group screens too, and while Erevos is in the background, and what waits for a contact goes
// once their phone is near. The links belong to the phone, not to
// a space: what comes on them opens only in the chats of the space open (lib/receiver.ts), and the
// rest is tried in the open hidden chats, or kept a while for the others (lib/place-nearby.ts). What the phone
// carries for relays stays when Erevos closes (lib/carried-store.ts): what it carries for others
// from when the first space opens, and the open space's own while it is. While Erevos is in the
// background the links are kept quieter, to spare the battery (setLinksQuiet), and with a battery mode that asks for it, off (lib/battery-mode.ts).

// Whether this phone carries messages from phones nearby to their relays, whether it looks for
// Erevos on the same Wi-Fi, whether it makes one with Wi-Fi Direct, and whether it looks with
// Wi-Fi Aware: for the whole phone, on unless turned off. On a Samsung phone Wi-Fi Direct and
// Wi-Fi Aware are off unless turned on, as Samsung asks to turn off its own sharing for them.
// And whether it looks for phones nearby at all, Bluetooth, Wi-Fi Aware, the same Wi-Fi and Wi-Fi
// Direct alike: off unless turned on (the owner's word, 2026-11-20), as on the same Wi-Fi the links
// held a call back for up to a minute before it rang. A LoRa radio set stays linked either way.
const NEARBY_KEY = 'erevos.nearby';
const CARRY_KEY = 'erevos.carry';
const LAN_KEY = 'erevos.lan';
const DIRECT_KEY = 'erevos.direct';
const AWARE_KEY = 'erevos.aware';

let othersKept = false;
// The open space's links, started again or stopped as the settings now say; null while none is open.
let applyLinks: (() => Promise<void>) | null = null;
// Whether the links run now; and the switch as turned on or off while Erevos runs, should the phone not keep it.
let linksUp = false;
let nearbyNow: boolean | null = null;
// How many screens ask for the links whatever the switch says (holdNearbyLinks).
let held = 0;
// The switch as last read or set, for screens that say it before reading it (off until then).
let nearbyLast = false;

/** Whether this phone looks for phones nearby, as last read or set (nearbySettings, setNearbyKept). */
export function nearbyOn(): boolean {
  return nearbyLast;
}

/** Keeps the links up until the function it gives is called: from when a space opens until it closes. */
export function startNearbyLinks(): () => void {
  if (!HAS_LINKS) return () => undefined;
  let active = true;
  const { space, key } = currentSpace();
  const stopOwn = nearby.keepOwnIn(ownCarried(space, key));
  const stopNearby = nearby.start(sendLink);
  // The bridge: this phone reads queues for the phones beside it while it carries for others and reaches its relay.
  nearby.readForOthers = readForOthers;
  // Another relay than its own: only once the owner said yes, warned that it sees this phone's address.
  nearby.askServe = async (_link, url) => {
    if (AppState.currentState !== 'active') return false;
    const host = url.replace(/^wss?:\/\//i, '').replace(/\/.*$/, '');
    const { title, message } = ipWarningText({ network: host, act: 'bridge', of: url });
    return choose(title, `${message}\n\n${t('Bring them?')}`, t('No'), t('Yes'));
  };
  setBridgeAsk(
    () => AppState.currentState === 'active',
    async (hidden) => {
      if (!hidden)
        return choose(
          t('A phone near you has internet. Should it bring your messages?'),
          t('It would learn which queue on your relay is yours, never what your messages say, which only this phone opens. Knowing the queue, it could take your messages before they reach you, so Erevos gives you a new queue once you have internet again. Say yes only for a phone you know whose it is, even one that seems to be a contact’s.'),
          t('No'),
          t('Yes'),
        );
      // Hidden chats: asked only while they are on the screen, so the question shows them to no one else.
      const open = openHiddenPlace();
      if (!open || `${open.space}:${open.pocket}` !== hidden) return null;
      return choose(
        t('A phone near you has internet. Should it bring the messages of these hidden chats too?'),
        t('It would learn that this phone has a second queue on the relay, and so that there may be hidden chats here, though never what they say. Knowing the queue, it could take their messages before they reach you, so they get a new queue once you have internet again. Say yes only for a phone you know whose it is.'),
        t('No'),
        t('Yes'),
      );
    },
  );
  const subscriptions = [
    onLinkEvent('onPeer', ({ id, kind }) => {
      if (kind !== 'ble') nearby.linkUp(id); // 'ble' is presence only, not a data link
    }),
    onLinkEvent('onText', ({ peer, text }) => {
      const packet = nearby.frameIn(peer, text);
      if (packet) void openNearby(peer, packet);
    }),
  ];
  // A contact heard nearby, or a LoRa radio linked: what waits for them may go now (lib/waiting.ts).
  const stopWatching = nearby.onChange(nearbyChanged);
  // Quieter in the background, and during a call through the call relay too: looking for phones
  // nearby with Wi-Fi Aware, Wi-Fi Direct and Bluetooth takes the phone's Wi-Fi off its network for
  // moments, which a call's sound heard as gaps. A call direct on the same network keeps them as
  // they are, as it may need them.
  const calm = () => {
    const call = currentCall();
    setLinksQuiet(AppState.currentState !== 'active' || (call !== null && call.state === 'connected' && call.throughRelay));
  };
  calm();
  const stopCalls = onCallChange(calm);
  // With the battery mode Also nearby (or more), the radios are off while Erevos is in the
  // background (lib/battery-mode.ts), and start again as it shows.
  let paused = false;
  // Started as the settings say, or stopped when the links are off or paused; LoRa stays either way.
  const apply = async () => {
    const { on, lan, direct, aware } = await nearbySettings();
    if (!active) return;
    linksUp = (on || held > 0) && !paused;
    if (linksUp) startLinks({ lan, direct, aware });
    else {
      stopLinks();
      resumeLora();
    }
  };
  applyLinks = apply;
  const follow = async () => {
    const want = (await loadBatteryMode()) !== 'normal' && AppState.currentState !== 'active';
    if (!active || want === paused) return;
    paused = want;
    if (want) {
      stopLinks();
      return;
    }
    await apply();
  };
  const quiet = AppState.addEventListener('change', (state) => {
    calm();
    void follow();
  });
  const stopBattery = onBatteryMode(() => void follow());
  void nearbySettings().then(async ({ carrying }) => {
    if (!active) return;
    nearby.setCarrying(carrying);
    if (!othersKept) {
      othersKept = true;
      void nearby.keepOthersIn(othersCarried());
    }
    // Opened in the background (a call, say) with the radios to be off: they stay off.
    paused = (await loadBatteryMode()) !== 'normal' && AppState.currentState !== 'active';
    await apply();
  });
  // What came nearby for this space while another was open.
  void (async () => {
    for (const packet of nearby.heldPackets()) await openNearby(null, packet);
  })();
  return () => {
    active = false;
    if (applyLinks === apply) {
      applyLinks = null;
      linksUp = false;
    }
    subscriptions.forEach((subscription) => subscription.remove());
    stopWatching();
    quiet.remove();
    stopCalls();
    stopBattery();
    setLinksQuiet(false);
    stopNearby();
    nearby.readForOthers = null;
    nearby.askServe = null;
    nearby.setOnline(false);
    forgetBridges();
    stopLinks();
    stopOwn();
  };
}

/**
 * Keeps the links up while a screen needs them, whatever Look for phones nearby says: Near me, on
 * New chat, where two phones beside each other become contacts (lib/near-pair.ts). The function it
 * gives lets go: with the switch off the links stop again then. Links that run already are left as
 * they are, as starting them again would drop them for a moment.
 */
export function holdNearbyLinks(): () => void {
  held += 1;
  if (!linksUp) void applyLinks?.();
  let over = false;
  return () => {
    if (over) return;
    over = true;
    held -= 1;
    if (held === 0 && linksUp && !nearbyLast) void applyLinks?.();
  };
}

/** Whether this phone looks for phones nearby at all (`on`), carries for others, looks on the same Wi-Fi, makes one with Wi-Fi Direct, and looks with Wi-Fi Aware, as last set. */
export async function nearbySettings(): Promise<{ on: boolean; carrying: boolean; lan: boolean; direct: boolean; aware: boolean }> {
  const [near, carry, lan, direct, aware] = await Promise.all([NEARBY_KEY, CARRY_KEY, LAN_KEY, DIRECT_KEY, AWARE_KEY].map((key) => secureGet(key).catch(() => null)));
  // Carrying for others is on unless turned off (the owner's word, 2026-11-16): what phones nearby
  // give it is sealed for their contact's relay, kept three days at most, and handed on through
  // this phone's relay, which a stranger nearby can make it do.
  nearbyLast = nearbyNow ?? near === 'on';
  return { on: nearbyLast, carrying: carry !== 'off', lan: lan !== 'off', direct: SAMSUNG ? direct === 'on' : direct !== 'off', aware: SAMSUNG ? aware === 'on' : aware !== 'off' };
}

/** Looks for phones nearby, or no longer: the links start or stop at once. Throws as setCarryingKept, having started or stopped them. */
export async function setNearbyKept(on: boolean): Promise<void> {
  nearbyNow = on;
  nearbyLast = on;
  await applyLinks?.();
  await secureSet(NEARBY_KEY, on ? 'on' : 'off');
}

/** Carries messages from phones nearby to their relays, or no longer. Throws when the phone could not keep it: it holds until Erevos closes. */
export async function setCarryingKept(on: boolean): Promise<void> {
  nearby.setCarrying(on);
  await secureSet(CARRY_KEY, on ? 'on' : 'off');
}

/** Looks for Erevos on the same Wi-Fi or hotspot too, or no longer. Throws as setCarryingKept. */
export async function setLanKept(on: boolean): Promise<void> {
  if (linksUp) setLanLinks(on);
  await secureSet(LAN_KEY, on ? 'on' : 'off');
}

/** Looks for Erevos phones nearby with Wi-Fi Aware too, or no longer. Throws as setCarryingKept. */
export async function setAwareKept(on: boolean): Promise<void> {
  if (linksUp) setAwareLinks(on);
  await secureSet(AWARE_KEY, on ? 'on' : 'off');
}

/** Makes a Wi-Fi with Erevos phones nearby that share none (Wi-Fi Direct), or no longer. Throws as setCarryingKept. */
export async function setDirectKept(on: boolean): Promise<void> {
  if (linksUp) setDirectLinks(on);
  await secureSet(DIRECT_KEY, on ? 'on' : 'off');
}
