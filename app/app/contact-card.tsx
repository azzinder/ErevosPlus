// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, PermissionsAndroid, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ConnectPicker, useCanConnect } from '../components/connect-picker';
import { ContactFace, forgetPhoneContactPhoto, useCardPhoto } from '../components/contact-face';
import { ErevosIdInput, erevosIdText, readErevosId } from '../components/erevos-id';
import { ShieldIcon } from '../components/icons';
import { KeyFace } from '../components/key-face';
import { QrCode } from '../components/QrCode';
import { Button, Card, Page, Row, Sheet, Text, TextButton } from '../components/ui';
import { handOverCall } from '../lib/call-handoff';
import { confirm } from '../lib/alert';
import { amongPlace, byName, cardErevos, cardHref, erevosCard, erevosPeople, groupsByTitle, nameErevos, phoneCard, sealedCard, type Among, type Card as ContactCard } from '../lib/contact-book';
import { offerContact } from '../lib/contact-code';
import { saveVCards, vcfName } from '../lib/contact-files';
import { birthdayComing, birthdayLabel, callsWith, fillText, historyLines, kindLabel, parseBirthday, phoneSave, whenText, type Entry, type ErevosPerson, type HistoryLine } from '../lib/contacts';
import { fromBase64 } from '../lib/crypto';
import { enterHiddenScreen, hiddenScreens, useOpenHiddenPlace, type OpenHiddenPlace } from '../lib/hidden-contacts';
import { EDITION } from '../lib/edition';
import { t } from '../lib/i18n';
import { linkedName } from '../lib/linked-name';
import { moduleOn } from '../lib/modules';
import { pickAvatar } from '../lib/pick-avatar';
import { CAN_TAKE_PHOTOS } from '../lib/pick-photo';
import { linkCard, linkPhoneContact, linkSealed, loadPlace, onSealedChange, placeOf, removeSealed, saveSealed, setSealedPhoto, spacePlace, starSealed, type Place } from '../lib/sealed-contacts';
import { spaceChats } from '../lib/space-chats';
import { smsAddress, smsNumbers } from '../lib/sms-group';
import { sameNumber } from '../lib/sms-invite';
import { makeTextInvite } from '../lib/sms-relay';
import { qrVCard } from '../lib/vcard';
import { loadPhoto, savePhoto } from '../lock/avatar-photos';
import type { ContactLink } from '../lock/contacts-data';
import { useLock } from '../lock/context';
import {
  addToPhoneGroup,
  onContactsEvent,
  phoneContact,
  phoneContactPhoto,
  phoneGroups,
  pickRingtone,
  removeFromPhoneGroup,
  removePhoneContacts,
  ringtoneName,
  savePhoneContact,
  setPhoneContactPhoto,
  starPhoneContact,
  type PhoneGroup,
} from '../modules/erevos-contacts';
import { callHistory, phoneReady } from '../modules/erevos-phone';
import { smsMessages, smsReady, smsStatus, smsThreads } from '../modules/erevos-sms';
import { radius, space, type Colors } from '../theme/colors';
import { useStyles, useTheme } from '../theme/context';

// One contact, whole: its photo and name, then every number, email and address, its birthday and
// note, and its groups. A number calls (Linking's tel: goes to the phone app) or writes an SMS in
// Erevos. The star makes it a favourite, in Android's contacts, which every phone app lists. Its
// photo, from the phone's photos or the camera, is kept there too, 720 points square, as Android
// shows it large when they call; and its own ringtone, picked in Android's picker. Its QR code is
// its vCard, which another phone's camera reads as a contact to add.
//
// A contact kept only in Erevos (`sealed`, lib/sealed-contacts.ts) has the same, but for groups
// and a ringtone, which are Android's: its star and photo are sealed with it. A phone contact can
// move into Erevos, and one kept in Erevos out to the phone's contacts. Among the hidden chats'
// screens (`hidden`), it is one of theirs, never one of the phone's, and shows nothing once they
// close; a photo is picked or taken there too, and its .vcf file saved in a folder picked, as they
// stay open meanwhile (lib/picking.ts).
//
// A contact that is an Erevos contact (linked by hand, kept sealed with the space's or hidden
// chats' contacts, or by a number linked to it in Erevos) shows its chat, a call and a video call
// through Erevos, and the start of its key as its Erevos ID; an Erevos contact that no contact is
// has a card of its own (`erevos`). One that is none yet takes their Erevos ID, their contact link
// pasted or read from their QR code (components/erevos-id.tsx): the chats add them (the hidden
// chats' own beneath these screens, for one of theirs), and the contact is linked to them. An
// Erevos contact without a name of its own takes the name of the contact linked to it
// (lib/linked-name.ts): when they are linked here, or as the card opens. One
// of the chats with a card of its own can be connected to one of my contacts
// (components/connect-picker.tsx). Below, its history: its calls in the phone's call log, its SMS,
// and its messages in Erevos.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));
const PHOTO_SIDE = 720;
// A sealed photo is kept smaller: the phone never shows it on a call.
const SEALED_SIDE = 512;

export default function ContactCardScreen() {
  const params = useLocalSearchParams<{ id?: string; sealed?: string; erevos?: string; hidden?: string }>();
  const id = Number(params.id ?? 0);
  const sealedId = typeof params.sealed === 'string' ? params.sealed : '';
  const erevosId = typeof params.erevos === 'string' && /^[0-9a-f]{64}$/.test(params.erevos) ? params.erevos : '';
  const hidden = params.hidden === '1';
  const hiddenOpen = useOpenHiddenPlace();
  // With only the Contacts open (app/_layout.tsx), the card shows no history: its calls, SMS and
  // Erevos messages are the rest of Erevos, behind the password.
  const contactsOnly = useLock().only === 'contacts';
  // Whose chats its Erevos contact is in: the open hidden chats' among their screens, else the space's.
  const among: Among = hidden ? hiddenOpen : 'space';
  const canConnect = useCanConnect(among);
  const navigation = useNavigation();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [card, setCard] = useState<ContactCard | null>(null);
  const [gone, setGone] = useState(false);
  const [groups, setGroups] = useState<PhoneGroup[]>([]);
  const [choosingGroups, setChoosingGroups] = useState(false);
  const [choosingPhoto, setChoosingPhoto] = useState(false);
  const [showingQr, setShowingQr] = useState(false);
  const [linking, setLinking] = useState(false);
  // One of my contacts being chosen, to connect this Erevos contact to.
  const [connecting, setConnecting] = useState(false);
  // An Erevos ID being pasted, and what is wrong with it.
  const [erevosCode, setErevosCode] = useState('');
  const [idNote, setIdNote] = useState('');
  const [inviting, setInviting] = useState(false);
  // The Erevos contacts it may be, and which phone contacts were linked to one by hand.
  const [people, setPeople] = useState<ErevosPerson[]>([]);
  const [links, setLinks] = useState<ContactLink[]>([]);
  const [note, setNote] = useState('');
  const [tone, setTone] = useState('');
  const photo = useCardPhoto(card, true);
  const ringtone = card?.phone?.ringtone ?? '';
  // The Erevos contact it last gave its name to, as its card opened.
  const named = useRef('');

  useEffect(() => (hidden ? enterHiddenScreen() : undefined), [hidden]);

  // Where a sealed contact is: the hidden chats while they are open, else the space.
  const place = useMemo((): Place | null => {
    if (!sealedId) return null;
    if (hidden) return hiddenOpen ? placeOf(hiddenOpen) : null;
    try {
      return spacePlace();
    } catch {
      return null;
    }
  }, [sealedId, hidden, hiddenOpen]);

  useEffect(() => {
    let active = true;
    setTone('');
    ringtoneName(ringtone)
      .then((name) => active && setTone(name))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [ringtone]);

  const load = useCallback(() => {
    const found = erevosPeople(hidden ? hiddenOpen : null).then((list) => {
      setPeople(list);
      return list;
    });
    if (erevosId) {
      found
        .then((list) => {
          const person = list.find((p) => p.identity === erevosId);
          setCard(person ? erevosCard(person) : null);
          setGone(!person);
        })
        .catch((error) => setNote(errorText(error)));
      return;
    }
    if (sealedId) {
      if (!place) {
        setCard(null);
        return;
      }
      Promise.all([loadPlace(place), found])
        .then(([data, list]) => {
          const kept = data.contacts.find((c) => c.id === sealedId);
          const c = kept ? sealedCard(kept) : null;
          setCard(c ? { ...c, erevos: cardErevos(c, [], list) } : null);
          setGone(!kept);
        })
        .catch((error) => setNote(errorText(error)));
      return;
    }
    // A phone contact is never shown, linked or named among the hidden chats' screens, even by a
    // link that asks for one there: their contacts never touch the phone's.
    if (!(id > 0) || hidden) {
      setGone(true);
      return;
    }
    const spaceLinks = (async () => (await loadPlace(spacePlace())).links)().catch((): ContactLink[] => []);
    Promise.all([phoneContact(id), spaceLinks, found])
      .then(([c, linked, list]) => {
        const shown = c ? phoneCard(c) : null;
        setLinks(linked);
        setCard(shown ? { ...shown, erevos: cardErevos(shown, linked, list) } : null);
        setGone(!c);
      })
      .catch((error) => setNote(errorText(error)));
    phoneGroups()
      .then((found) => setGroups(groupsByTitle(found)))
      .catch(() => undefined);
  }, [id, sealedId, erevosId, place, hidden, hiddenOpen]);

  useFocusEffect(
    useCallback(() => {
      load();
      const changed = sealedId || erevosId ? null : onContactsEvent('onContactsChanged', load);
      const sealed = onSealedChange(load);
      return () => {
        changed?.remove();
        sealed();
      };
    }, [load, sealedId, erevosId]),
  );

  // A contact linked to an Erevos contact without a name of its own gives it its name as its card
  // opens, once (lib/linked-name.ts), so contacts linked before this did are named too.
  useEffect(() => {
    if (!card?.erevos || (!card.phone && !card.sealed) || named.current === card.erevos) return;
    const person = people.find((p) => p.identity === card.erevos);
    if (!person || !linkedName(person.name, card)) return;
    named.current = card.erevos;
    void nameErevos(among, card.erevos, card).then((given) => given && load(), () => undefined);
  }, [card, people, among]);

  const close = () => (router.canGoBack() ? router.back() : router.replace(hidden ? '/contacts?hidden=1' : '/contacts'));

  if (hidden && !hiddenOpen) {
    return (
      <Page>
        <Text tone="muted">{t('The hidden chats are closed.')}</Text>
      </Page>
    );
  }
  if (gone) {
    return (
      <Page>
        <Text tone="muted">{sealedId ? t('This contact is no longer kept in Erevos.') : t('This contact is no longer on the phone.')}</Text>
        <Button title={t('Close')} kind="secondary" onPress={close} />
      </Page>
    );
  }
  if (!card) return <Page>{note ? <Text tone="muted">{note}</Text> : null}</Page>;

  async function star() {
    if (!card) return;
    setNote('');
    try {
      if (card.sealed && place) await starSealed(place, card.sealed.id, !card.starred);
      else if (card.phone) await starPhoneContact(card.phone.id, !card.starred);
      setCard({ ...card, starred: !card.starred });
    } catch (error) {
      setNote(errorText(error));
    }
  }

  async function remove() {
    if (!card) return;
    const question = card.sealed
      ? t('Delete {name}? It is kept only in Erevos, and cannot be brought back.', { name: card.name })
      : t('Delete {name} from the phone? It goes from every account it is kept in, and cannot be brought back.', { name: card.name });
    if (!(await confirm(t('Delete contact'), question, t('Delete')))) return;
    try {
      if (card.sealed && place) await removeSealed(place, card.sealed.id);
      else if (card.phone) await removePhoneContacts([card.phone.id]);
      close();
    } catch (error) {
      setNote(errorText(error));
    }
  }

  async function changePhoto(from: 'photos' | 'camera' | null) {
    if (!card) return;
    setNote('');
    try {
      const bytes = from ? await pickAvatar(from, card.sealed ? SEALED_SIDE : PHOTO_SIDE) : null;
      if (from && !bytes) return;
      if (card.sealed && place) {
        await setSealedPhoto(place, card.sealed.id, bytes);
      } else if (card.phone) {
        await setPhoneContactPhoto(card.phone.id, bytes);
        forgetPhoneContactPhoto(card.phone.id);
      }
      setChoosingPhoto(false);
      load();
    } catch (error) {
      setNote(errorText(error));
    }
  }

  async function chooseRingtone() {
    if (!card?.phone) return;
    setNote('');
    try {
      if ((await pickRingtone(card.phone.id)) !== null) load();
    } catch (error) {
      setNote(errorText(error));
    }
  }

  async function saveFile() {
    if (!card) return;
    setNote('');
    try {
      const saved = await saveVCards([card], vcfName(card.name));
      if (saved) setNote(t('Saved as {name}. The file is outside Erevos: anyone who has it can read this contact.', { name: saved }));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // A phone contact sealed in the space instead, with its star and photo, and taken out of
  // Android's contacts, where other apps and its account no longer see it.
  async function moveIntoErevos() {
    if (!card?.phone) return;
    if (!(await confirm(t('Keep only in Erevos'), t("Move {name} into Erevos? It is sealed in this space and deleted from the phone's contacts, from every account it is kept in: other apps no longer see it, and the phone no longer shows its name when it calls.", { name: card.name }), t('Move')))) return;
    setNote('');
    try {
      const base64 = card.phone.photo ? await phoneContactPhoto(card.phone.id, true).catch(() => null) : null;
      const ref = base64 ? await savePhoto(fromBase64(base64)) : null;
      const kept = await saveSealed(spacePlace(), null, card, { starred: card.starred, photo: ref, erevos: card.erevos });
      await removePhoneContacts([card.phone.id]);
      await linkPhoneContact(spacePlace(), card.phone.lookup, '').catch(() => undefined);
      router.replace(`/contact-card?sealed=${kept}`);
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // A sealed contact put in Android's contacts on this phone, and no longer kept in Erevos.
  async function moveToPhone() {
    if (!card?.sealed || !place) return;
    if (!(await confirm(t("Move to the phone's contacts"), t("Move {name} to the phone's contacts? Every app allowed to read them sees it there, and it is no longer kept in Erevos.", { name: card.name }), t('Move')))) return;
    setNote('');
    try {
      const made = await savePhoneContact(phoneSave(card, null, null, card.starred));
      const bytes = card.sealed.photo ? await loadPhoto(card.sealed.photo).catch(() => null) : null;
      if (bytes) await setPhoneContactPhoto(made, bytes).catch(() => undefined);
      const lookup = card.sealed.erevos ? (await phoneContact(made).catch(() => null))?.lookup : '';
      if (lookup) await linkPhoneContact(place, lookup, card.sealed.erevos).catch(() => undefined);
      await removeSealed(place, card.sealed.id);
      router.replace(`/contact-card?id=${made}`);
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // In a group, or out of it, in Android's contacts: in the contact's raw contact of the group's account.
  async function toggleGroup(group: PhoneGroup) {
    if (!card?.phone) return;
    setNote('');
    const inIt = card.groups.includes(group.id);
    try {
      if (inIt) await removeFromPhoneGroup(group.id, card.phone.id);
      else if (!(await addToPhoneGroup(group.id, card.phone.id))) {
        setNote(t('{name} is kept in another account than the group {group}, so it cannot join it.', { name: card.name, group: group.title }));
        return;
      }
      setCard({ ...card, groups: inIt ? card.groups.filter((g) => g !== group.id) : [...card.groups, group.id] });
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Links it to an Erevos contact by hand, which takes its name if it has none of its own, or no
  // longer with ''.
  async function link(identity: string) {
    if (!card) return;
    setNote('');
    try {
      if (card.sealed && place) await linkSealed(place, card.sealed.id, identity);
      else if (card.phone) await linkPhoneContact(spacePlace(), card.phone.lookup, identity);
      if (identity) await nameErevos(among, identity, card).catch(() => '');
      setLinking(false);
      load();
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // Adds the Erevos contact an Erevos ID names to the space's chats, which open with it, and links
  // this contact to it once it is added, which then takes its name if it has none of its own.
  function addErevos() {
    if (!card) return;
    setIdNote('');
    const code = readErevosId(erevosCode);
    if (!code) {
      setIdNote(t('That is not an Erevos ID: an Erevos ID is a contact link starting with erevos://contact'));
      return;
    }
    const sealed = card.sealed && place ? { place, id: card.sealed.id } : null;
    const lookup = card.phone?.lookup ?? '';
    if (!sealed && !lookup) return;
    if (hidden) {
      if (!sealed) return;
      offerContact(code, { place: sealed.place, name: card.name, added: (identity) => void linkSealed(sealed.place, sealed.id, identity).catch(() => undefined) });
      setErevosCode('');
      router.dismiss(hiddenScreens());
      return;
    }
    const into = spacePlace();
    offerContact(code, {
      place: into,
      name: card.name,
      added: (identity) => {
        void (sealed ? linkSealed(sealed.place, sealed.id, identity) : linkPhoneContact(into, lookup, identity)).catch(() => undefined);
      },
    });
    setErevosCode('');
    router.push('/chat');
  }

  // An Erevos contact of the chats made one with a contact I have: linked to it, named after it while
  // it has no name of its own, and shown as that contact's card.
  async function connect(chosen: ContactCard) {
    const into = amongPlace(among);
    if (!card?.erevos || !into) return;
    setNote('');
    try {
      if (!(await linkCard(into, chosen, card.erevos))) return;
      await nameErevos(among, card.erevos, chosen).catch(() => '');
      setConnecting(false);
      // Only while this card still shows: one gone back from meanwhile leaves the screen now in view.
      if (navigation.isFocused()) router.replace(cardHref({ ...chosen, erevos: card.erevos }, hidden));
    } catch (error) {
      setNote(errorText(error));
    }
  }

  // An invite by plain SMS to `number` (lib/text-invite.ts), written for them in the SMS app to send
  // or not: Erevos's own when it is the phone's SMS app, else the phone's.
  async function inviteBySms(number: string) {
    if (!card || inviting) return;
    setInviting(true);
    setIdNote('');
    try {
      const link = await makeTextInvite(number, card.name);
      const text = t('Join me on Erevos, for messages and calls only we can read: {link}', { link });
      const to = smsAddress(smsNumbers(number));
      if (smsReady() && smsStatus()?.isDefault && moduleOn('sms')) router.push(`/sms?to=${encodeURIComponent(to)}&text=${encodeURIComponent(text)}&plain=1`);
      else await Linking.openURL(`sms:${to}?body=${encodeURIComponent(text)}`);
    } catch (error) {
      setIdNote(t('No invite now. {error}', { error: errorText(error) }));
    } finally {
      setInviting(false);
    }
  }

  // Its chat in Erevos, or a call there: the hidden chats' own beneath these screens, or the space's.
  function erevos(call?: 'voice' | 'video') {
    if (!card?.erevos) return;
    if (hidden) {
      hiddenOpen?.open(card.erevos, call);
      router.dismiss(hiddenScreens());
      return;
    }
    if (call) handOverCall(card.erevos, call);
    router.push(`/chat?contact=${card.erevos}`);
  }

  const call = (number: string) => void Linking.openURL(`tel:${number.replace(/[^\d+*#,;]/g, '')}`).catch((error) => setNote(errorText(error)));
  // In Erevos while its SMS are on (lib/modules.ts), else in the phone's SMS app.
  const sms = (number: string) =>
    moduleOn('sms') ? router.push(`/sms?to=${encodeURIComponent(smsAddress(smsNumbers(number)))}&plain=1`) : void Linking.openURL(`sms:${smsAddress(smsNumbers(number))}`).catch((error) => setNote(errorText(error)));
  const first = card.phones[0]?.value;
  const birthday = parseBirthday(card.birthday);
  const editHref = card.sealed ? `/contact-edit?sealed=${card.sealed.id}${hidden ? '&hidden=1' : ''}` : `/contact-edit?id=${card.phone?.id ?? 0}`;
  // Only an Erevos contact, in the chats: no contact of the phone's or kept in Erevos is it.
  const onlyChat = !card.phone && !card.sealed;
  const person = people.find((p) => p.identity === card.erevos);
  const byHand = card.sealed ? card.sealed.erevos !== '' && card.sealed.erevos === card.erevos : links.some((l) => l.lookup === card.phone?.lookup && l.identity === card.erevos);

  return (
    <Page>
      <View style={styles.top}>
        {onlyChat ? (
          <KeyFace identity={card.erevos} name={person?.name} size={96} />
        ) : (
          <Pressable onPress={() => setChoosingPhoto(true)} accessibilityRole="button" accessibilityLabel={photo ? t('Change photo') : t('Add a photo')}>
            <ContactFace name={card.name} uri={photo} size={96} />
          </Pressable>
        )}
        <Text variant="title" style={styles.center}>
          {card.name}
        </Text>
        {card.company || card.title ? (
          <Text tone="muted" style={styles.center}>
            {[card.title, card.company].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
        {card.sealed ? (
          <Text variant="caption" tone="muted" style={styles.center}>
            {hidden ? t('Kept only in these hidden chats, sealed.') : t('Kept only in Erevos, sealed in this space. Not in the phone\'s contacts.')}
          </Text>
        ) : null}
        {onlyChat ? (
          <Text variant="caption" tone="muted" style={styles.center}>
            {canConnect
              ? t('A contact of your Erevos chats. Add it to your contacts, or connect it to one you have, to give it a name, numbers and more.')
              : t('A contact of your Erevos chats. Add it to your contacts to give it numbers, an email and more.')}
          </Text>
        ) : (
          <Pressable onPress={() => void star()} accessibilityRole="button" accessibilityLabel={card.starred ? t('Remove from favourites') : t('Add to favourites')} hitSlop={8}>
            <Text variant="heading" color={card.starred ? colors.accentText : colors.textFaint}>
              {card.starred ? `★ ${t('Favourite')}` : `☆ ${t('Add to favourites')}`}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Erevos's own chats and calls only while they are on (lib/modules.ts). */}
      {!moduleOn('erevos') ? null : card.erevos ? (
        <Card>
          <Row>
            <ShieldIcon color={colors.success} size={14} />
            <Text variant="label" tone="muted" style={styles.grow}>
              {t('In Erevos')}
            </Text>
          </Row>
          {!onlyChat && person?.name && person.name !== card.name ? <Text>{t('The Erevos contact {name}', { name: person.name })}</Text> : null}
          <Text variant="caption" tone="muted" selectable>
            {t('Erevos ID: {id}', { id: erevosIdText(card.erevos) })}
          </Text>
          <Row wrap>
            <Button title={t('Message')} compact onPress={() => erevos()} />
            <Button title={t('Call')} kind="secondary" compact onPress={() => erevos('voice')} />
            <Button title={t('Video')} kind="secondary" compact onPress={() => erevos('video')} />
          </Row>
          <Text variant="caption" tone="muted">
            {t('End-to-end encrypted, through Erevos instead of the phone company.')}
          </Text>
          {onlyChat ? null : byHand ? (
            <TextButton title={t('Not this Erevos contact')} onPress={() => void link('')} />
          ) : (
            <Text variant="caption" tone="faint">
              {t('One of its numbers is linked to this Erevos contact, in its chat.')}
            </Text>
          )}
        </Card>
      ) : (
        <Card>
          <Row>
            <ShieldIcon color={colors.textFaint} size={14} />
            <Text variant="label" tone="muted" style={styles.grow}>
              {t('Erevos ID')}
            </Text>
          </Row>
          <Text variant="caption" tone="muted">
            {hidden
              ? t("The contact link their Erevos shows, under Copy my contact link or as their QR code, or choose them among these hidden chats' contacts. Added here, they join these hidden chats, and this card shows their chat and calls.")
              : t('The contact link their Erevos shows, under Copy my contact link or as their QR code. Added here, they join your Erevos chats, and this card shows their chat and calls, end-to-end encrypted.')}
          </Text>
          <ErevosIdInput value={erevosCode} onChange={setErevosCode} onNote={setIdNote} />
          {erevosCode.trim() ? <Button title={t('Add to Erevos')} compact onPress={addErevos} /> : null}
          {people.length > 0 ? <Button title={t('Choose from my Erevos chats')} kind="secondary" compact onPress={() => setLinking(true)} /> : null}
          {/* Erevos Lite sends no SMS, invites neither (docs/editions.md). */}
          {!hidden && Platform.OS === 'android' && EDITION !== 'lite' && first ? (
            <>
              <Button title={t('Invite by SMS')} kind="secondary" compact loading={inviting} onPress={() => void inviteBySms(first)} />
              <Text variant="caption" tone="muted">
                {t('No Erevos yet? An SMS with a link: it offers them Erevos, and once they join you are each other’s contacts, end-to-end encrypted. For one person, for two days.')}
              </Text>
            </>
          ) : null}
          {idNote ? <Text tone="muted">{idNote}</Text> : null}
        </Card>
      )}

      {first ? (
        <Row wrap style={styles.actions}>
          <Button title={t('Call')} compact onPress={() => call(first)} />
          <Button title="SMS" kind="secondary" compact onPress={() => sms(first)} />
        </Row>
      ) : null}

      {card.phones.length > 0 ? (
        <Card>
          {card.phones.map((p, i) => (
            <EntryRow key={`p${i}`} entry={p} onPress={() => call(p.value)} side={t('SMS')} onSide={() => sms(p.value)} />
          ))}
        </Card>
      ) : null}
      {card.emails.length > 0 ? (
        <Card>
          {card.emails.map((e, i) => (
            <EntryRow key={`e${i}`} entry={e} onPress={() => void Linking.openURL(`mailto:${e.value}`).catch(() => undefined)} />
          ))}
        </Card>
      ) : null}
      {card.addresses.length > 0 ? (
        <Card>
          {card.addresses.map((a, i) => (
            <EntryRow key={`a${i}`} entry={a} onPress={() => void Linking.openURL(`geo:0,0?q=${encodeURIComponent(a.value)}`).catch(() => undefined)} />
          ))}
        </Card>
      ) : null}
      {card.birthday ? (
        <Card>
          <Text variant="label" tone="muted">
            {t('Birthday')}
          </Text>
          <Text>{birthday ? birthdayLabel(birthday) : card.birthday}</Text>
          {birthday ? (
            <Text variant="caption" tone="muted">
              {birthdayComing(birthday, new Date())}
            </Text>
          ) : null}
        </Card>
      ) : null}
      {card.note ? (
        <Card>
          <Text variant="label" tone="muted">
            {t('Note')}
          </Text>
          <Text selectable>{card.note}</Text>
        </Card>
      ) : null}

      {card.phone ? (
        <Card>
          <Text variant="label" tone="muted">
            {t('Groups')}
          </Text>
          <Text tone={card.groups.length ? undefined : 'muted'}>
            {groups
              .filter((g) => card.groups.includes(g.id))
              .map((g) => g.title)
              .join(', ') || t('In no group')}
          </Text>
          <Button title={t('Choose groups')} kind="secondary" compact onPress={() => setChoosingGroups(true)} />
        </Card>
      ) : null}

      {card.phone ? (
        <Card>
          <Text variant="label" tone="muted">
            {t('Ringtone')}
          </Text>
          <Text tone={ringtone ? undefined : 'muted'}>{ringtone ? tone || t('A ringtone of its own') : t("The phone's own")}</Text>
          <Button title={t('Choose ringtone')} kind="secondary" compact onPress={() => void chooseRingtone()} />
        </Card>
      ) : null}

      {contactsOnly ? null : <ContactHistory card={card} hiddenOpen={hidden ? hiddenOpen : null} onCall={call} onSms={sms} onErevos={() => erevos()} />}

      {onlyChat ? (
        <Row wrap>
          <Button
            title={t('Add to contacts')}
            kind="secondary"
            compact
            onPress={() => router.push(`/contact-edit?fill=${encodeURIComponent(fillText(card))}&erevos=${card.erevos}${hidden ? '&hidden=1' : ''}`)}
          />
          {canConnect ? (
            <Button
              title={t('Connect to one of my contacts')}
              kind="secondary"
              compact
              onPress={() => {
                setNote('');
                setConnecting(true);
              }}
            />
          ) : null}
        </Row>
      ) : (
        <Row wrap>
          <Button title={t('Edit')} kind="secondary" compact onPress={() => router.push(editHref)} />
          <Button title={t('QR code')} kind="secondary" compact onPress={() => setShowingQr(true)} />
          <Button title={t('Save as a .vcf file')} kind="secondary" compact onPress={() => void saveFile()} />
          {card.phone ? <Button title={t('Keep only in Erevos')} kind="secondary" compact onPress={() => void moveIntoErevos()} /> : null}
          {card.sealed && !hidden ? <Button title={t("Move to the phone's contacts")} kind="secondary" compact onPress={() => void moveToPhone()} /> : null}
          <Button title={t('Delete')} kind="danger" compact onPress={() => void remove()} />
        </Row>
      )}
      {note ? <Text tone="muted">{note}</Text> : null}

      <Sheet visible={linking} onClose={() => setLinking(false)} title={t('Link to an Erevos contact')}>
        <Text tone="muted">{t("The same person in your Erevos chats: this card then shows their chat and calls. The link is sealed in Erevos, never in the phone's contacts.")}</Text>
        <Text variant="caption" tone="muted">
          {t("An Erevos contact without a name of its own takes this contact's name.")}
        </Text>
        {byName(people.map(erevosCard)).map((p) => (
          <Pressable key={p.key} onPress={() => void link(p.erevos)} accessibilityRole="button" style={({ pressed }) => [styles.pick, pressed && styles.pressed]}>
            <KeyFace identity={p.erevos} name={p.given} size={36} />
            <View style={styles.grow}>
              <Text>{p.name}</Text>
              {p.phones[0] ? (
                <Text variant="caption" tone="muted">
                  {p.phones[0].value}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}
        {note ? <Text tone="muted">{note}</Text> : null}
        <Button title={t('Cancel')} kind="secondary" compact onPress={() => setLinking(false)} />
      </Sheet>

      <ConnectPicker visible={connecting} among={among} identity={card.erevos} onPick={(chosen) => void connect(chosen)} onClose={() => setConnecting(false)} note={note} />

      <Sheet visible={choosingGroups} onClose={() => setChoosingGroups(false)} title={t('Groups')}>
        {groups.length === 0 ? <Text tone="muted">{t('No groups yet. Make one under Groups in the menu of Contacts.')}</Text> : null}
        {groups.map((g) => {
          const on = card.groups.includes(g.id);
          return (
            <Pressable key={g.id} onPress={() => void toggleGroup(g)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={({ pressed }) => [styles.pick, (pressed || on) && styles.pressed]}>
              <View style={styles.grow}>
                <Text>{g.title}</Text>
                {g.account.name ? (
                  <Text variant="caption" tone="muted">
                    {g.account.name}
                  </Text>
                ) : null}
              </View>
              <Text variant="bodyStrong" color={on ? colors.accentText : colors.textFaint}>
                {on ? '✓' : '○'}
              </Text>
            </Pressable>
          );
        })}
        {note ? <Text tone="muted">{note}</Text> : null}
        <Button title={t('Done')} compact onPress={() => setChoosingGroups(false)} />
      </Sheet>

      <Sheet visible={showingQr} onClose={() => setShowingQr(false)} title={card.name}>
        {showingQr ? <ContactQr card={card} /> : null}
        <Button title={t('Done')} compact onPress={() => setShowingQr(false)} />
      </Sheet>

      <Sheet visible={choosingPhoto} onClose={() => setChoosingPhoto(false)} title={t('Photo')}>
        <Text tone="muted">
          {card.sealed
            ? t('The photo is sealed with the contact, in a file of its own: only Erevos shows it.')
            : t("The photo is kept with the contact in Android's contacts, where the phone shows it when they call, and its account (Google) syncs it.")}
        </Text>
        <Row wrap>
          <Button title={t('Choose a photo')} compact onPress={() => void changePhoto('photos')} />
          {CAN_TAKE_PHOTOS ? <Button title={t('Take photo')} kind="secondary" compact onPress={() => void changePhoto('camera')} /> : null}
        </Row>
        {card.phone?.photo || card.sealed?.photo ? <TextButton title={t('Remove the photo')} onPress={() => void changePhoto(null)} /> : null}
        {note ? <Text tone="muted">{note}</Text> : null}
      </Sheet>
    </Page>
  );
}

/**
 * The contact's history, the newest first: its calls in the phone's call log (once Erevos may read
 * it), its SMS (the conversations with one of its numbers), and its messages in Erevos. Read on
 * the phone, shown only here.
 */
function ContactHistory({ card, hiddenOpen, onCall, onSms, onErevos }: {
  card: ContactCard;
  hiddenOpen: OpenHiddenPlace | null;
  onCall: (number: string) => void;
  onSms: (number: string) => void;
  onErevos: () => void;
}) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [lines, setLines] = useState<HistoryLine[] | null>(null);
  // Whether Android lets Erevos read the call history, as the phone module said when it was read.
  const [callsAllowed, setCallsAllowed] = useState(true);
  const [askedCalls, setAskedCalls] = useState(0);
  const numbers = card.phones.map((p) => p.value);
  const asked = `${numbers.join('\n')}\n${card.erevos}`;

  useEffect(() => {
    let active = true;
    void (async () => {
      // The phone's call history, as the Phone screen reads it (modules/erevos-phone), of its numbers only.
      const history = numbers.length > 0 ? await callHistory().catch(() => ({ allowed: true, calls: [] })) : { allowed: true, calls: [] };
      const calls = callsWith(history.calls, numbers).slice(0, 50);
      // Only conversations there are: asking for one by its number would start it.
      const threads = smsReady() && numbers.length > 0 ? await smsThreads(500).catch(() => []) : [];
      const own = threads.filter((th) => smsNumbers(th.address).length === 1 && numbers.some((n) => sameNumber(n, th.address)));
      const sms = await Promise.all(own.map(async (th) => ({ number: th.address, messages: await smsMessages(th.address, 50).catch(() => []) })));
      const peer = `contact:${card.erevos}`;
      const erevos = !card.erevos
        ? []
        : hiddenOpen
          ? hiddenOpen.messages(card.erevos)
          : await spaceChats()
              .then((chats) => chats.history.messages().filter((m) => m.peer === peer))
              .catch(() => []);
      if (!active) return;
      setCallsAllowed(history.allowed);
      setLines(historyLines(calls, sms, erevos, Date.now()));
    })();
    return () => {
      active = false;
    };
  }, [asked, askedCalls, hiddenOpen]);

  async function allowCalls() {
    await PermissionsAndroid.request('android.permission.READ_CALL_LOG').catch(() => null);
    setAskedCalls((n) => n + 1);
  }

  if (!lines) return null;
  const now = Date.now();
  return (
    <Card>
      <Text variant="label" tone="muted">
        {t('History')}
      </Text>
      {lines.length === 0 ? <Text tone="muted">{t('No calls or messages with this contact yet.')}</Text> : null}
      {lines.map((line) => (
        <Pressable
          key={line.key}
          onPress={() => (line.kind === 'erevos' ? onErevos() : line.kind === 'sms' ? onSms(line.number) : onCall(line.number))}
          accessibilityRole="button"
          style={({ pressed }) => [styles.line, pressed && styles.pressed]}
        >
          <Text variant="caption" tone="muted">
            {[line.kind === 'call' ? t('Call') : line.kind === 'sms' ? t('SMS') : t('Chat'), whenText(line.at, now), line.mine ? t('You') : ''].filter(Boolean).join(' · ')}
          </Text>
          <Text numberOfLines={2} color={line.missed ? colors.danger : undefined}>
            {line.text}
          </Text>
        </Pressable>
      ))}
      {Platform.OS === 'android' && phoneReady() && !callsAllowed && numbers.length > 0 ? (
        <>
          <Text variant="caption" tone="faint">
            {t("Its calls show here once Erevos may read the phone's call log. Erevos only shows them, and keeps no copy.")}
          </Text>
          <TextButton title={t('Show calls')} onPress={() => void allowCalls()} />
        </>
      ) : null}
    </Card>
  );
}

/** The contact's vCard as a QR code, shorter when it would be too long, or why there is none. */
function ContactQr({ card }: { card: ContactCard }) {
  const qr = useMemo(() => qrVCard(card), [card]);
  if (!qr) return <Text tone="muted">{t('This contact holds too much for a QR code. Save it as a .vcf file instead.')}</Text>;
  return (
    <>
      <QrCode text={qr.text} size={300} />
      <Text variant="caption" tone="muted">
        {qr.whole
          ? t("Another phone's camera reads it as a contact to add: its name, numbers, emails, addresses and note, without its photo. Whoever sees the code can read it.")
          : t("Another phone's camera reads it as a contact to add, without its photo, and without its note or addresses, which do not fit. Whoever sees the code can read it.")}
      </Text>
    </>
  );
}

/** A number, an email or an address: its kind above it; tapped, it is used. */
function EntryRow({ entry, onPress, side, onSide }: { entry: Entry; onPress: () => void; side?: string; onSide?: () => void }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.entry}>
      <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.entryMain, pressed && styles.pressed]}>
        <Text variant="caption" tone="muted">
          {kindLabel(entry)}
        </Text>
        <Text selectable>{entry.value}</Text>
      </Pressable>
      {side && onSide ? (
        <Pressable onPress={onSide} accessibilityRole="button" hitSlop={6} style={({ pressed }) => [styles.side, pressed && styles.pressed]}>
          <Text variant="label" color={colors.accentText}>
            {side}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    top: {
      alignItems: 'center',
      gap: space.sm,
      paddingVertical: space.md,
    },
    center: {
      textAlign: 'center',
    },
    actions: {
      justifyContent: 'center',
    },
    entry: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
    },
    entryMain: {
      flex: 1,
      gap: 2,
      paddingVertical: 4,
      paddingHorizontal: space.xs,
      borderRadius: radius.md,
    },
    side: {
      paddingVertical: space.sm,
      paddingHorizontal: space.md,
      borderRadius: radius.md,
    },
    pressed: {
      backgroundColor: colors.surfacePressed,
    },
    grow: {
      flex: 1,
    },
    line: {
      gap: 2,
      paddingVertical: 4,
      paddingHorizontal: space.xs,
      borderRadius: radius.md,
    },
    pick: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      padding: space.sm,
      borderRadius: radius.md,
    },
  });
