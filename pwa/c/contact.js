// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Erevos web app: the page a contact link for a website opens, /c#<the link's fields>, as on a
// contact page anyone may open (app/lib/contact-code.ts, contactPageLink). The fields are the part
// of the link after #, which the browser never sends to the server: this page reads them on the
// device and sends them nowhere. It shows whom the link adds, and how to add them in Erevos: on
// Android, the app and then erevos://contact?<fields>; on an iPhone, the web app on the home screen,
// which keeps its data apart from Safari, so the link is copied and pasted there; elsewhere, the app
// or the web app. Where this browser's own worker serves the web app, it can hand the link to it at
// /contact?<fields>, which the worker answers without the server. The app reads the link itself
// (lib/contact-code.ts, parseContact) and asks before it adds; this page only shows it.
(() => {
  // What a link holds, as lib/contact-code.ts checks it: the queue's id (48 hex, or none with no
  // relay either), the keys (base64url, up to 4096 characters), and a name (`n`), if any, cut as
  // the app cuts it. The rest the app reads itself.
  const SHORTEST = 20;
  const LONGEST = 6000;
  const MAX_KEY = 4096;
  const NAME_MAX = 40;
  // The link the app takes when pasted: CONTACT_PAGE in lib/contact-code.ts, on any server.
  // This page's own server: LPHL's, or a community's that serves Erevos's pages (lib/servers.ts).
  const ORIGIN = typeof location === 'object' && /^https:\/\//.test(location.origin) ? location.origin : 'https://erevos-web.lphl.nekten.eu';
  const PAGE = `${ORIGIN}/c`;
  const APK = 'https://github.com/azzinder/erevos-releases/releases/latest/download/erevos-android.apk';
  const DOWNLOADS = 'https://github.com/azzinder/erevos-releases/releases/latest';

  /** The name as the app shows it: controls and direction marks, which could turn it around, made spaces. */
  function nameOf(text) {
    const line = text.replace(/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2028\u2029\u2066-\u2069]/g, ' ');
    return [...line.replace(/\s+/g, ' ').trim()].slice(0, NAME_MAX).join('').trim();
  }

  /**
   * What this page shows of a link (the part after #): { data, name }, or null for none, or one cut
   * short.
   */
  function readContact(fragment) {
    const data = String(fragment ?? '')
      .replace(/^#/, '')
      .trim();
    if (data.length < SHORTEST || data.length > LONGEST || /\s/.test(data)) return null;
    const fields = {};
    for (const pair of data.split('&')) {
      const at = pair.indexOf('=');
      if (at <= 0) continue;
      try {
        fields[pair.slice(0, at)] = decodeURIComponent(pair.slice(at + 1).replace(/\+/g, ' '));
      } catch {
        return null;
      }
    }
    const id = String(fields.id ?? '').toLowerCase();
    const relay = String(fields.relay ?? '');
    const key = String(fields.key ?? '');
    if (!key || key.length > MAX_KEY || !/^[A-Za-z0-9_-]+$/.test(key)) return null;
    if (!/^[0-9a-f]{48}$/.test(id) && !(id === '' && !relay)) return null;
    if (relay && !/^wss?:\/\/[^\s/?#]+(\/[^\s]*)?$/i.test(relay)) return null;
    return { data, name: nameOf(String(fields.n ?? '')) };
  }

  // For app/checks/web-contact.check.ts, which reads links the app writes.
  globalThis.erevosReadContact = readContact;
  globalThis.erevosContactPage = PAGE;
  if (typeof document === 'undefined') return;

  const WORDS = {
    en: {
      switchTo: 'Ελληνικά',
      title: 'Erevos contact',
      add: (name) => [null, name, ' on Erevos'],
      aContact: 'Write to me on Erevos',
      what: 'Erevos is an app for messages and calls, end-to-end encrypted.',
      request: 'Your first message reaches them as a message request: once they accept it, you can talk.',
      none: 'There is no contact in this link',
      noneText: 'It may have been cut short: open the whole link from the page you found it on.',
      on: 'Where will you use Erevos?',
      android: 'Android',
      iphone: 'iPhone',
      other: 'Other',
      here: 'If you use Erevos in this browser:',
      openHere: 'Add the contact here',
      install: 'Install Erevos',
      installText: 'If you do not have it yet. It needs Android 7 or later, 64-bit. If Android asks, let your browser install apps.',
      download: 'Download Erevos',
      noInstall: 'Does it not download or install?',
      downloads: 'All downloads',
      inBrowser: 'Erevos in the browser',
      open: 'Add the contact',
      openText: 'Erevos shows the contact and asks before it adds it.',
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
      private: 'The contact is the part of the link after #, which the browser does not send to the server: this page reads it only here, on your device.',
    },
    el: {
      switchTo: 'English',
      title: 'Επαφή στο Erevos',
      add: (name) => [null, name, ' στο Erevos'],
      aContact: 'Γράψε μου στο Erevos',
      what: 'Το Erevos είναι μια εφαρμογή για μηνύματα και κλήσεις, κρυπτογραφημένα από άκρη σε άκρη.',
      request: 'Το πρώτο σου μήνυμα φτάνει ως αίτημα μηνύματος: μόλις το αποδεχτεί, μπορείτε να μιλάτε.',
      none: 'Δεν υπάρχει επαφή σε αυτόν τον σύνδεσμο',
      noneText: 'Μπορεί να κόπηκε: άνοιξε ολόκληρο τον σύνδεσμο από τη σελίδα όπου τον βρήκες.',
      on: 'Πού θα χρησιμοποιήσεις το Erevos;',
      android: 'Android',
      iphone: 'iPhone',
      other: 'Άλλο',
      here: 'Αν χρησιμοποιείς το Erevos σε αυτόν τον browser:',
      openHere: 'Πρόσθεσε την επαφή εδώ',
      install: 'Εγκατάστησε το Erevos',
      installText: 'Αν δεν το έχεις ήδη. Θέλει Android 7 ή νεότερο, 64-bit. Αν το Android ρωτήσει, επίτρεψε στον browser να εγκαθιστά εφαρμογές.',
      download: 'Κατέβασε το Erevos',
      noInstall: 'Δεν κατεβαίνει ή δεν εγκαθίσταται;',
      downloads: 'Όλες οι λήψεις',
      inBrowser: 'Το Erevos στον browser',
      open: 'Πρόσθεσε την επαφή',
      openText: 'Το Erevos δείχνει την επαφή και ρωτά πριν την προσθέσει.',
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
      private: 'Η επαφή είναι το κομμάτι του συνδέσμου μετά το #, που ο browser δεν το στέλνει στον server: αυτή η σελίδα το διαβάζει μόνο εδώ, στη συσκευή σου.',
    },
  };

  const agent = navigator.userAgent;
  const iphone = /iPhone|iPad|iPod/.test(agent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  // The web app's worker serves this page, so it answers /contact too, with no request to the
  // server. Not in Safari on an iPhone: the web app there is the one on the home screen, whose data
  // Safari does not see.
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
  const contact = readContact(window.location.hash);
  const link = contact ? `${PAGE}#${contact.data}` : '';
  // The server sends /c on to /c/: the address bar shows /c again, so a link copied from it, or
  // shared, is one the app takes.
  if (window.location.pathname !== '/c') window.history.replaceState(null, '', `/c${window.location.hash}`);

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
        step(2, words.open, words.openText, anchor(words.open, `erevos://contact?${contact.data}`), make('p', 'note', words.notOpening), copyBlock(words, 'secondary')),
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
    const words = WORDS[lang];
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
    if (!contact) {
      parts.push(make('h1', null, words.none), make('p', 'lead', words.noneText));
    } else {
      const [before, name, after] = contact.name ? words.add(contact.name) : [words.aContact, null, null];
      parts.push(make('h1', null, before, name ? make('bdi', null, name) : null, after), make('p', 'lead', words.what), make('p', 'until', words.request));
      if (here) parts.push(make('section', 'here', make('p', null, words.here), anchor(words.openHere, `/contact?${contact.data}`)));
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
