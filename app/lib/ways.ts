// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { plural, t } from './i18n';
import type { LoraStatus } from './lora';
import type { TorWay } from './relay';

// The Ways screen (app/ways.tsx): each way the open space's messages go out by, one card each,
// with how it is now in a sentence, a short figure, and a line under it, full when the way works,
// faint when it is on but reaches no one now, and dashed when it is off; and above them, how many
// of the space's own messages wait to go. Only the space's: never its hidden chats, nor whether it
// has any. Self-contained on purpose (but for i18n), so it runs under plain Node for checks.

export type WayId = 'relay' | 'nostr' | 'nearby' | 'lora' | 'sms' | 'tor';

/** How a way's line shows: it works, it is on and reaches no one now, or it is off. */
export type WayLook = 'up' | 'trying' | 'off';

export type Way = { id: WayId; title: string; line: string; figure: string; look: WayLook; href: string };

/** What the screen knows of each way now; null for a way this device does not have. */
export type WaysInput = {
  /** The space's relay: its address ('' with none), when it last answered and when it could not be reached (0 for never), its home relay's address, and whether sends go through a second relay. */
  relay: { url: string; answered: number; failed: number; spare: string; via: boolean };
  /** Whether the space's texts go through Nostr, on how many relays, and on how many of them it reads now. */
  nostr: { on: boolean; relays: number; reading: number } | null;
  /** Phones nearby linked now, which ways it looks on, and how many messages of others it carries. */
  nearby: { phones: number; bluetooth: boolean; lan: boolean; direct: boolean; carried: number } | null;
  /** The LoRa radio: whether one is set, how its link is, and its name. */
  lora: { set: boolean; status: LoraStatus; name: string } | null;
  /** SMS as the last way: whether Erevos is the SMS app, and for how many contacts it is on. */
  sms: { app: boolean; contacts: number } | null;
  /** Which of the space's requests go through Tor, and whether Tor is ready. */
  tor: { way: TorWay; ready: boolean } | null;
};

/** A relay's address as shown: without its scheme, path or port. */
export function hostOf(url: string): string {
  return url
    .trim()
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '');
}

function relayWay({ url, answered, failed, spare, via }: WaysInput['relay']): Way {
  const base = { id: 'relay' as const, title: t('Server'), href: '/chat?setup=relay' };
  if (!url.trim()) return { ...base, line: t('No server yet. Contacts reach you only nearby or through Nostr.'), figure: t('none'), look: 'off' };
  const figure = hostOf(url);
  const more = [spare.trim() ? t('Home server: {host}.', { host: hostOf(spare) }) : '', via ? t('Sends go through a second server first.') : ''].filter(Boolean).join(' ');
  const with_ = (line: string) => (more ? `${line} ${more}` : line);
  if (answered > 0 && answered >= failed) return { ...base, line: with_(t('It answers.')), figure, look: 'up' };
  if (failed > 0) return { ...base, line: with_(t('It cannot be reached now. Erevos tries again by itself.')), figure, look: 'trying' };
  return { ...base, line: with_(t('Not asked yet in this run.')), figure, look: 'trying' };
}

function nostrWay({ on, relays, reading }: NonNullable<WaysInput['nostr']>): Way {
  const base = { id: 'nostr' as const, title: 'Nostr', href: '/nostr' };
  if (!on || relays === 0) return { ...base, line: t('Off: your texts do not go through Nostr.'), figure: t('off'), look: 'off' };
  const figure = `${reading}/${relays}`;
  if (reading === 0) return { ...base, line: t('None of its servers answers now.'), figure, look: 'trying' };
  return { ...base, line: plural(relays, '{reading} of {n} Nostr server answers.', '{reading} of {n} Nostr servers answer.', { reading }), figure, look: 'up' };
}

function nearbyWay({ phones, bluetooth, lan, direct, carried }: NonNullable<WaysInput['nearby']>): Way {
  const base = { id: 'nearby' as const, title: t('Nearby'), href: '/chat?setup=nearby' };
  const on = [bluetooth ? 'Bluetooth' : '', lan ? t('the same Wi-Fi') : '', direct ? 'Wi-Fi Direct' : ''].filter(Boolean);
  const carries = carried > 0 ? ` ${plural(carried, 'You carry {n} encrypted message of others.', 'You carry {n} encrypted messages of others.')}` : '';
  if (on.length === 0) return { ...base, line: `${t('It looks for no phone nearby.')}${carries}`, figure: t('off'), look: 'off' };
  const looks = t('Looks for phones by {ways}.', { ways: on.join(', ') });
  const figure = plural(phones, '{n} phone', '{n} phones');
  if (phones === 0) return { ...base, line: `${looks} ${t('No phone with Erevos is near now.')}${carries}`, figure, look: 'trying' };
  return { ...base, line: `${looks}${carries}`, figure, look: 'up' };
}

function loraWay({ set, status, name }: NonNullable<WaysInput['lora']>): Way {
  const base = { id: 'lora' as const, title: 'LoRa', href: '/lora' };
  if (!set || status === 'off') return { ...base, line: t('No radio set.'), figure: t('off'), look: 'off' };
  if (status === 'up') return { ...base, line: t('Linked to {name}. Texts only.', { name }), figure: t('linked'), look: 'up' };
  if (status === 'down') return { ...base, line: t('The radio is not linked. Erevos tries again by itself.'), figure: t('not linked'), look: 'trying' };
  return { ...base, line: t('Linking to the radio…'), figure: '…', look: 'trying' };
}

function smsWay({ app, contacts }: NonNullable<WaysInput['sms']>): Way {
  const base = { id: 'sms' as const, title: 'SMS', href: '/sms-settings?part=last' };
  if (!app) return { ...base, line: t('Erevos is not the SMS app, so nothing goes by SMS.'), figure: t('off'), look: 'off' };
  if (contacts === 0) return { ...base, line: t('Off for every contact.'), figure: t('off'), look: 'off' };
  return {
    ...base,
    line: t('Texts only, encrypted, when nothing else takes them. The phone company sees who wrote to whom.'),
    figure: plural(contacts, '{n} contact', '{n} contacts'),
    look: 'up',
  };
}

function torWay({ way, ready }: NonNullable<WaysInput['tor']>): Way {
  const base = { id: 'tor' as const, title: 'Tor', href: '/tor' };
  if (way === 'off') return { ...base, line: t('Off: the servers see your IP address.'), figure: t('off'), look: 'off' };
  const what = way === 'all' ? t('Everything goes through Tor.') : t('Your messages go through Tor.');
  if (!ready) return { ...base, line: `${what} ${t('Tor is starting…')}`, figure: '…', look: 'trying' };
  return { ...base, line: what, figure: t('on'), look: 'up' };
}

/** The ways out, in order, with the sentence above them and how many of the space's own messages wait to go. */
export function waysNow(input: WaysInput, waiting: number): { lead: string; waiting: string; ways: Way[] } {
  const ways: Way[] = [relayWay(input.relay)];
  if (input.nostr) ways.push(nostrWay(input.nostr));
  if (input.nearby) ways.push(nearbyWay(input.nearby));
  if (input.lora) ways.push(loraWay(input.lora));
  if (input.sms) ways.push(smsWay(input.sms));
  if (input.tor) ways.push(torWay(input.tor));
  // Tor is no way out of its own: it covers the relay and Nostr.
  const out = ways.filter((way) => way.id !== 'tor' && way.look === 'up').map((way) => way.title);
  const lead = out.length === 0 ? t('Nothing takes messages now. They wait, and go by themselves once a way opens.') : t('Messages go out by {ways}.', { ways: listOf(out) });
  const left = waiting > 0 ? plural(waiting, '{n} of your messages waits to go.', '{n} of your messages wait to go.') : t('Nothing of yours waits to go.');
  return { lead, waiting: left, ways };
}

// "a", "a and b", "a, b and c", in the language shown.
function listOf(items: string[]): string {
  if (items.length < 2) return items.join('');
  return t('{some} and {last}', { some: items.slice(0, -1).join(', '), last: items[items.length - 1] });
}
