// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Erevos web app: the page an invite sent by text message opens, /i#<invite>. The invite is the
// part of the link after #, which the browser never sends to the server: this page reads it on the
// device and sends it nowhere. It shows who invites and until when, and how to take the invite in
// Erevos: on Android, the app and then erevos://text-invite?d=<invite>; on an iPhone, the web app on
// the home screen, which keeps its data apart from Safari, so the link is copied and pasted there;
// elsewhere, the app or the web app. Where this browser's own worker serves the web app, it can
// hand the invite to it at /text-invite?d=<invite>, which the worker answers without the server.
// The app reads the invite itself (lib/text-invite.ts) and asks before it joins; this page only
// shows it.
(() => {
  // What an invite holds, as lib/text-invite.ts writes it: version 1; flags (1: a relay key follows,
  // 2: a relay address follows, 4: a contact card); the time it runs out, in seconds (4 bytes; 0 on a
  // card, which never ends); the sender's id (24); the answer key (32); the relay invite code (32),
  // which a card has not; the relay key (32), if flagged; the sender's name, one byte of length and
  // up to 120 bytes of UTF-8; the relay address, if flagged, the rest. In base64url, 84 to 600
  // characters, as the app takes it. A card (the short QR code of Your contact link) adds its owner
  // as a contact for someone who has Erevos already; an invite brings someone new too.
  const VERSION = 1;
  const FLAGS = 0b111;
  const FIXED = 94;
  const CARD_FIXED = 62;
  const RELAY_KEY = 32;
  const NAME_MAX = 120;
  const SHORTEST = 84;
  const LONGEST = 600;
  // The link the app takes when pasted: TEXT_INVITE_PAGE in lib/text-invite.ts, on any server.
  // This page's own server: LPHL's, or a community's that serves Erevos's pages (lib/servers.ts).
  const ORIGIN = typeof location === 'object' && /^https:\/\//.test(location.origin) ? location.origin : 'https://erevos-web.lphl.nekten.eu';
  const PAGE = `${ORIGIN}/i`;
  const APK = 'https://github.com/azzinder/erevos-releases/releases/latest/download/erevos-android.apk';
  const DOWNLOADS = 'https://github.com/azzinder/erevos-releases/releases/latest';

  /** Decodes base64url without padding, or null. */
  function bytesOf(text) {
    if (!/^[A-Za-z0-9_-]+$/.test(text) || text.length % 4 === 1) return null;
    try {
      const plain = atob(text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4));
      return Uint8Array.from(plain, (c) => c.charCodeAt(0));
    } catch {
      return null;
    }
  }

  /** The name as the app shows it: controls and direction marks, which could turn it around, made spaces. */
  function nameOf(bytes) {
    let text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      return '';
    }
    return text
      .replace(/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2028\u2029\u2066-\u2069]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * What this page shows of an invite (the part of the link after #): { data, expires, name }, or
   * { data, card: true, name } for a contact card, or { data, newer: true } for one from a later
   * Erevos, which the app may still read, or null for none, or one cut short.
   */
  function readInvite(fragment) {
    const data = String(fragment ?? '')
      .replace(/^#/, '')
      .trim();
    if (data.length < SHORTEST || data.length > LONGEST) return null;
    const bytes = bytesOf(data);
    if (!bytes || bytes[0] === 0) return null;
    if (bytes[0] !== VERSION || (bytes[1] & ~FLAGS) !== 0) return { data, newer: true };
    const card = (bytes[1] & 4) !== 0;
    let at = (card ? CARD_FIXED : FIXED) + (bytes[1] & 1 ? RELAY_KEY : 0);
    if (bytes.length < at + 1) return null;
    const length = bytes[at];
    at += 1;
    if (length > NAME_MAX || bytes.length < at + length) return null;
    if (!(bytes[1] & 2) && bytes.length !== at + length) return null;
    if (bytes[1] & 2 && bytes.length === at + length) return null;
    const name = nameOf(bytes.subarray(at, at + length));
    if (card) return { data, card: true, name };
    const expires = new DataView(bytes.buffer).getUint32(2);
    return { data, expires, name };
  }

  // For app/checks/web-invite.check.ts, which reads invites the app writes.
  globalThis.erevosReadInvite = readInvite;
  globalThis.erevosInvitePage = PAGE;
  if (typeof document === 'undefined') return;

  const WORDS = {
    en: {
      switchTo: 'Ελληνικά',
      title: 'Erevos invite',
      invites: (name) => [name, ' invites you to Erevos'],
      anInvite: 'An invite to Erevos',
      what: 'Erevos is an app for messages and calls, end-to-end encrypted.',
      until: (date) => `Valid until ${date}.`,
      newer: 'This invite comes from a newer Erevos: open it with the latest version.',
      expired: 'This invite is over',
      expiredText: (date) => `It was valid until ${date}. Ask whoever sent it for a new one.`,
      none: 'There is no invite in this link',
      noneText: 'It may have been cut short: open the whole link from the message, or ask for it again.',
      on: 'Where will you use Erevos?',
      android: 'Android',
      iphone: 'iPhone',
      other: 'Other',
      here: 'If you use Erevos in this browser:',
      openHere: 'Open the invite here',
      install: 'Install Erevos',
      installText: 'If you do not have it yet. It needs Android 7 or later, 64-bit. If Android asks, let your browser install apps.',
      download: 'Download Erevos',
      noInstall: 'Does it not download or install?',
      downloads: 'All downloads',
      inBrowser: 'Erevos in the browser',
      open: 'Open the invite',
      openText: 'Erevos asks you first. You are contacts as soon as the phone that invited you hears from yours.',
      notOpening: 'Does it not open? Copy the link, open Erevos, and paste it as the last step under Other says.',
      webApp: 'On an iPhone, Erevos is a web app: no App Store, no Apple account.',
      copyStep: 'Copy the link',
      copyText: 'You paste it in Erevos at the end.',
      copy: 'Copy link',
      copied: 'Copied',
      notCopied: 'It could not be copied: hold your finger on the link below and copy it.',
      addStep: 'Add Erevos to your Home Screen',
      addText: 'In Safari, tap Share (on iOS 26, inside •••), then Add to Home Screen. If it is there already, go on. It needs iOS 17 or later.',
      pasteHome: 'Open Erevos from your Home Screen',
      open2: 'Open Erevos',
      otherText: 'The app for your computer, or Erevos in the browser, on any device.',
      pasteStep: 'Paste the link',
      pasteText: 'Tap New chat. If you are just starting, tap I have an invite, paste the link and tap Join. Otherwise, paste it where it says Paste their contact link or invite, and tap Add.',
      private: 'The invite is the part of the link after #, which the browser does not send to the server: this page reads it only here, on your device. Whoever has the link can use it, so do not pass it on.',
      card: {
        title: 'Erevos contact',
        invites: (name) => [name, ' on Erevos'],
        anInvite: 'A contact on Erevos',
        until: 'Add this contact in Erevos: they appear in your chats once their phone answers.',
        newcomer: 'This is for someone who uses Erevos already. New to Erevos? Ask them for an invite instead.',
        openHere: 'Open it here',
        open: 'Open in Erevos',
        openText: 'Erevos asks you first, then adds the contact.',
        pasteText: 'Tap New chat, paste the link where it says Paste their contact link or invite, and tap Add.',
        private: 'The contact is the part of the link after #, which the browser does not send to the server: this page reads it only here, on your device.',
      },
    },
    el: {
      switchTo: 'English',
      title: 'Πρόσκληση στο Erevos',
      invites: (name) => [name, ' σε προσκαλεί στο Erevos'],
      anInvite: 'Πρόσκληση στο Erevos',
      what: 'Το Erevos είναι μια εφαρμογή για μηνύματα και κλήσεις, κρυπτογραφημένα από άκρη σε άκρη.',
      until: (date) => `Ισχύει έως ${date}.`,
      newer: 'Αυτή η πρόσκληση είναι από νεότερο Erevos: άνοιξέ την με την τελευταία έκδοση.',
      expired: 'Αυτή η πρόσκληση έληξε',
      expiredText: (date) => `Ίσχυε έως ${date}. Ζήτα καινούργια από όποιον την έστειλε.`,
      none: 'Δεν υπάρχει πρόσκληση σε αυτόν τον σύνδεσμο',
      noneText: 'Μπορεί να κόπηκε: άνοιξε ολόκληρο τον σύνδεσμο από το μήνυμα, ή ζήτα να σου τον στείλουν ξανά.',
      on: 'Πού θα χρησιμοποιήσεις το Erevos;',
      android: 'Android',
      iphone: 'iPhone',
      other: 'Άλλο',
      here: 'Αν χρησιμοποιείς το Erevos σε αυτόν τον browser:',
      openHere: 'Άνοιξε την πρόσκληση εδώ',
      install: 'Εγκατάστησε το Erevos',
      installText: 'Αν δεν το έχεις ήδη. Θέλει Android 7 ή νεότερο, 64-bit. Αν το Android ρωτήσει, επίτρεψε στον browser να εγκαθιστά εφαρμογές.',
      download: 'Κατέβασε το Erevos',
      noInstall: 'Δεν κατεβαίνει ή δεν εγκαθίσταται;',
      downloads: 'Όλες οι λήψεις',
      inBrowser: 'Το Erevos στον browser',
      open: 'Άνοιξε την πρόσκληση',
      openText: 'Το Erevos σε ρωτά πρώτα. Γίνεστε επαφές μόλις το κινητό που σε προσκάλεσε ακούσει το δικό σου.',
      notOpening: 'Δεν ανοίγει; Αντέγραψε τον σύνδεσμο, άνοιξε το Erevos και επικόλλησέ τον όπως λέει το τελευταίο βήμα στο «Άλλο».',
      webApp: 'Στο iPhone, το Erevos είναι web app: χωρίς App Store, χωρίς λογαριασμό Apple.',
      copyStep: 'Αντέγραψε τον σύνδεσμο',
      copyText: 'Θα τον επικολλήσεις στο Erevos στο τέλος.',
      copy: 'Αντιγραφή συνδέσμου',
      copied: 'Αντιγράφηκε',
      notCopied: 'Δεν αντιγράφηκε: κράτα πατημένο τον σύνδεσμο παρακάτω και αντέγραψέ τον.',
      addStep: 'Πρόσθεσε το Erevos στην οθόνη Αφετηρίας',
      addText: 'Στο Safari, πάτα «Κοινή χρήση» (στο iOS 26, μέσα στο •••), μετά «Προσθήκη στην οθόνη Αφετηρίας». Αν είναι ήδη εκεί, προχώρα. Θέλει iOS 17 ή νεότερο.',
      pasteHome: 'Άνοιξε το Erevos από την οθόνη Αφετηρίας',
      open2: 'Άνοιξε το Erevos',
      otherText: 'Την εφαρμογή για τον υπολογιστή σου, ή το Erevos στον browser, σε οποιαδήποτε συσκευή.',
      pasteStep: 'Επικόλλησε τον σύνδεσμο',
      pasteText: 'Πάτα «Νέα συνομιλία». Αν μόλις ξεκινάς, πάτα «Έχω πρόσκληση», επικόλλησε τον σύνδεσμο και πάτα «Συμμετοχή». Αλλιώς, επικόλλησέ τον εκεί που γράφει «Επικόλλησε σύνδεσμο ή πρόσκληση» και πάτα «Προσθήκη».',
      private: 'Η πρόσκληση είναι το κομμάτι του συνδέσμου μετά το #, που ο browser δεν το στέλνει στον server: αυτή η σελίδα το διαβάζει μόνο εδώ, στη συσκευή σου. Όποιος έχει τον σύνδεσμο μπορεί να τον χρησιμοποιήσει, γι’ αυτό μην τον προωθήσεις.',
      card: {
        title: 'Επαφή στο Erevos',
        invites: (name) => [name, ' στο Erevos'],
        anInvite: 'Επαφή στο Erevos',
        until: 'Πρόσθεσε την επαφή στο Erevos: εμφανίζεται στις συνομιλίες σου μόλις απαντήσει το κινητό της.',
        newcomer: 'Αυτό είναι για όσους έχουν ήδη το Erevos. Πρώτη φορά στο Erevos; Ζήτα καλύτερα μια πρόσκληση.',
        openHere: 'Άνοιξέ την εδώ',
        open: 'Άνοιγμα στο Erevos',
        openText: 'Το Erevos σε ρωτά πρώτα και μετά προσθέτει την επαφή.',
        pasteText: 'Πάτα «Νέα συνομιλία», επικόλλησε τον σύνδεσμο εκεί που γράφει «Επικόλλησε σύνδεσμο ή πρόσκληση» και πάτα «Προσθήκη».',
        private: 'Η επαφή είναι το κομμάτι του συνδέσμου μετά το #, που ο browser δεν το στέλνει στον server: αυτή η σελίδα το διαβάζει μόνο εδώ, στη συσκευή σου.',
      },
    },
  };

  const agent = navigator.userAgent;
  const iphone = /iPhone|iPad|iPod/.test(agent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  // The web app's worker serves this page, so it answers /text-invite too, with no request to the
  // server. Not in Safari on an iPhone: the web app there is the one on the home screen, whose data
  // Safari does not see; one Safari ran once before it was added would take the invite instead.
  const here = Boolean(navigator.serviceWorker?.controller) && (standalone || !iphone);

  let lang = 'en';
  for (const wanted of navigator.languages ?? [navigator.language]) {
    const code = String(wanted).slice(0, 2).toLowerCase();
    if (Object.prototype.hasOwnProperty.call(WORDS, code)) {
      lang = code;
      break;
    }
  }
  let platform = /Android/i.test(agent) ? 'android' : iphone ? 'iphone' : 'other';
  const invite = readInvite(window.location.hash);
  const link = invite ? `${PAGE}#${invite.data}` : '';
  // The server sends /i on to /i/: the address bar shows /i again, so a link copied from it, or
  // shared, is one the app takes.
  if (window.location.pathname !== '/i') window.history.replaceState(null, '', `/i${window.location.hash}`);

  function make(tag, className, ...children) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    for (const child of children.flat()) if (child !== null && child !== undefined && child !== false) node.append(child);
    return node;
  }

  function button(label, onClick, kind = 'primary') {
    const node = make('button', `action ${kind}`, label);
    node.type = 'button';
    node.onclick = onClick;
    return node;
  }

  function anchor(label, href, kind = 'primary') {
    const node = make('a', `action ${kind}`, label);
    node.href = href;
    return node;
  }

  function dateOf(seconds) {
    const date = new Date(seconds * 1000);
    try {
      return new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
    } catch {
      return date.toLocaleString();
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Older browsers: a field of its own, and the copy command.
    }
    const field = make('textarea', 'offscreen');
    field.value = text;
    field.setAttribute('readonly', '');
    document.body.append(field);
    field.select();
    field.setSelectionRange(0, text.length);
    let done = false;
    try {
      done = document.execCommand('copy');
    } catch {
      done = false;
    }
    field.remove();
    return done;
  }

  function copyBlock(words, kind = 'primary') {
    const said = make('p', 'said');
    said.setAttribute('aria-live', 'polite');
    const shown = make('p', 'link hidden', link);
    const action = button(
      words.copy,
      async () => {
        const done = await copy(link);
        said.textContent = done ? words.copied : words.notCopied;
        shown.classList.toggle('hidden', done);
      },
      kind,
    );
    return make('div', 'copy', action, said, shown);
  }

  function step(number, title, text, ...actions) {
    return make('li', 'step', make('span', 'number', String(number)), make('div', 'body', make('h3', null, title), text ? make('p', null, text) : null, ...actions));
  }

  function choose(choice) {
    platform = choice;
    render();
  }

  function steps(words) {
    if (platform === 'android') {
      return make(
        'ol',
        'steps',
        step(
          1,
          words.install,
          words.installText,
          anchor(words.download, APK),
          make('p', 'note', words.noInstall),
          make('div', 'row', anchor(words.downloads, DOWNLOADS, 'secondary'), button(words.inBrowser, () => choose('other'), 'secondary')),
        ),
        step(2, words.open, words.openText, anchor(words.open, `erevos://text-invite?d=${invite.data}`), make('p', 'note', words.notOpening), copyBlock(words, 'secondary')),
      );
    }
    if (platform === 'iphone') {
      return make(
        'div',
        null,
        make('p', 'lead intro', words.webApp),
        make('ol', 'steps', step(1, words.copyStep, words.copyText, copyBlock(words)), step(2, words.addStep, words.addText), step(3, words.pasteHome, words.pasteText)),
      );
    }
    return make(
      'ol',
      'steps',
      step(1, words.copyStep, words.copyText, copyBlock(words)),
      step(2, words.open2, words.otherText, make('div', 'row', anchor(words.downloads, DOWNLOADS, 'secondary'), anchor(words.inBrowser, '/', 'secondary'))),
      step(3, words.pasteStep, words.pasteText),
    );
  }

  function render() {
    // A card's own words where it has them, an invite's elsewhere.
    const words = invite && invite.card ? { ...WORDS[lang], ...WORDS[lang].card } : WORDS[lang];
    document.documentElement.lang = lang;
    document.title = words.title;
    const page = document.getElementById('page');
    const top = make(
      'header',
      'top',
      make('div', 'brand', Object.assign(make('img'), { src: '/icon-192.png', alt: '', width: 40, height: 40 }), make('span', null, 'Erevos')),
      button(
        words.switchTo,
        () => {
          lang = lang === 'el' ? 'en' : 'el';
          render();
        },
        'quiet',
      ),
    );
    const parts = [top];
    const expired = invite && !invite.newer && !invite.card && invite.expires * 1000 <= Date.now();
    if (!invite) {
      parts.push(make('h1', null, words.none), make('p', 'lead', words.noneText));
    } else if (expired) {
      parts.push(make('h1', null, words.expired), make('p', 'lead', words.expiredText(dateOf(invite.expires))));
    } else {
      const [name, rest] = invite.name ? words.invites(invite.name) : [null, words.anInvite];
      parts.push(make('h1', null, name ? make('bdi', null, name) : null, rest), make('p', 'lead', words.what));
      if (invite.card) parts.push(make('p', 'until', words.until), make('p', 'note', words.newcomer));
      else parts.push(make('p', 'until', invite.newer ? words.newer : words.until(dateOf(invite.expires))));
      if (here) parts.push(make('section', 'here', make('p', null, words.here), anchor(words.openHere, `/text-invite?d=${invite.data}`)));
      // Opened from the home screen, with its worker, this is the web app itself: nothing to install.
      if (!(standalone && here)) {
        const choices = make('div', 'tabs');
        choices.setAttribute('role', 'group');
        choices.setAttribute('aria-label', words.on);
        for (const choice of ['android', 'iphone', 'other']) {
          const tab = button(words[choice], () => choose(choice), choice === platform ? 'tab chosen' : 'tab');
          tab.setAttribute('aria-pressed', String(choice === platform));
          choices.append(tab);
        }
        parts.push(make('h2', null, words.on), choices, steps(words));
      }
      parts.push(make('p', 'private', words.private));
    }
    page.textContent = '';
    page.append(...parts);
  }

  render();
})();
