// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! The few pages a browser sees while signing in (see `signin.rs`), in the
//! languages of the app, picked by the browser's `Accept-Language`. They load
//! nothing else, run no script, and tell the browser to keep none of them.
//!
//! Not audited.

/// A language of the app.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Lang {
    En,
    El,
    De,
    Es,
    Fr,
    It,
    Pt,
    Sh,
}

/// The first language of the app in the browser's `Accept-Language`, else
/// English.
pub fn lang(accept: &str) -> Lang {
    for part in accept.split(',') {
        let mut fields = part.split(';');
        let tag = fields
            .next()
            .unwrap_or_default()
            .trim()
            .to_ascii_lowercase();
        if fields.any(|f| {
            f.trim()
                .strip_prefix("q=")
                .is_some_and(|q| q.trim().parse::<f32>() == Ok(0.0))
        }) {
            continue;
        }
        let base = tag.split(['-', '_']).next().unwrap_or_default();
        let found = match base {
            "en" => Lang::En,
            "el" => Lang::El,
            "de" => Lang::De,
            "es" => Lang::Es,
            "fr" => Lang::Fr,
            "it" => Lang::It,
            "pt" => Lang::Pt,
            // Serbian, Croatian, Bosnian and Montenegrin, as in the app.
            "sr" | "hr" | "bs" | "sh" | "cnr" => Lang::Sh,
            _ => continue,
        };
        return found;
    }
    Lang::En
}

/// What the pages say. `{user}` is the user name, `{name}` the provider's.
pub struct Words {
    code: &'static str,
    title: &'static str,
    pub user: &'static str,
    pub type_code: &'static str,
    pub only: &'static str,
    /// The button that takes the code back to Erevos on this phone, when it started the sign-in so.
    pub open_app: &'static str,
    /// Below it: what to do when the button opens nothing.
    pub or_type: &'static str,
    pub refused: &'static str,
    pub gone: &'static str,
    pub failed: &'static str,
    pub cancelled: &'static str,
    pub busy: &'static str,
}

pub fn words(lang: Lang) -> &'static Words {
    match lang {
        Lang::En => &EN,
        Lang::El => &EL,
        Lang::De => &DE,
        Lang::Es => &ES,
        Lang::Fr => &FR,
        Lang::It => &IT,
        Lang::Pt => &PT,
        Lang::Sh => &SH,
    }
}

const EN: Words = Words {
    code: "en",
    title: "Erevos server",
    user: "You signed in to {name} as {user}.",
    type_code: "Type this code in Erevos, where you tapped Sign in with {name}:",
    only: "Type it only in Erevos on your own phone. Give it to no one, even if they ask: whoever types it uses this server as you.",
    open_app: "Open Erevos",
    or_type: "If Erevos does not open, type this code in it, where you tapped Sign in with {name}:",
    refused: "{name} let you in, but this account may not use this server. Ask whoever runs it.",
    gone: "This sign-in is no longer good. Start again in Erevos.",
    failed: "The sign-in did not work: {name} could not be reached, or did not let it through. Start again in Erevos.",
    cancelled: "The sign-in was cancelled. Start again in Erevos if you like.",
    busy: "Too many sign-ins were started from here just now. Wait a minute, then start again in Erevos.",
};

const EL: Words = Words {
    code: "el",
    title: "Server του Erevos",
    user: "Συνδέθηκες στο {name} ως {user}.",
    type_code: "Γράψε αυτόν τον αριθμό στο Erevos, εκεί που πάτησες «Σύνδεση με {name}»:",
    only: "Γράψ' τον μόνο στο Erevos του δικού σου τηλεφώνου. Μην τον δώσεις σε κανέναν, ακόμα κι αν σου τον ζητήσει: όποιος τον γράψει χρησιμοποιεί αυτόν τον server ως εσύ.",
    open_app: "Άνοιγμα του Erevos",
    or_type: "Αν δεν ανοίξει το Erevos, γράψε σε αυτό αυτόν τον αριθμό, εκεί που πάτησες «Σύνδεση με {name}»:",
    refused: "Το {name} σε άφησε να μπεις, αλλά αυτός ο λογαριασμός δεν μπορεί να χρησιμοποιεί αυτόν τον server. Ρώτα όποιον τον τρέχει.",
    gone: "Αυτή η σύνδεση δεν ισχύει πια. Ξεκίνα ξανά από το Erevos.",
    failed: "Η σύνδεση δεν έγινε: το {name} δεν απάντησε ή δεν την επέτρεψε. Ξεκίνα ξανά από το Erevos.",
    cancelled: "Η σύνδεση ακυρώθηκε. Ξεκίνα ξανά από το Erevos αν θέλεις.",
    busy: "Ξεκίνησαν πάρα πολλές συνδέσεις από εδώ μόλις τώρα. Περίμενε ένα λεπτό και ξεκίνα ξανά από το Erevos.",
};

const DE: Words = Words {
    code: "de",
    title: "Erevos-Server",
    user: "Du hast dich bei {name} als {user} angemeldet.",
    type_code: "Gib diesen Code in Erevos ein, wo du auf „Mit {name} anmelden“ getippt hast:",
    only: "Gib ihn nur in Erevos auf deinem eigenen Telefon ein. Gib ihn niemandem, auch wenn jemand danach fragt: Wer ihn eingibt, nutzt diesen Server als du.",
    open_app: "Erevos öffnen",
    or_type: "Wenn sich Erevos nicht öffnet, gib diesen Code dort ein, wo du auf „Mit {name} anmelden“ getippt hast:",
    refused: "{name} hat dich angemeldet, aber dieses Konto darf diesen Server nicht nutzen. Frag, wer ihn betreibt.",
    gone: "Diese Anmeldung gilt nicht mehr. Fang in Erevos neu an.",
    failed: "Die Anmeldung hat nicht geklappt: {name} war nicht erreichbar oder hat sie nicht zugelassen. Fang in Erevos neu an.",
    cancelled: "Die Anmeldung wurde abgebrochen. Fang in Erevos neu an, wenn du willst.",
    busy: "Von hier wurden gerade zu viele Anmeldungen begonnen. Warte eine Minute und fang dann in Erevos neu an.",
};

const ES: Words = Words {
    code: "es",
    title: "Servidor de Erevos",
    user: "Iniciaste sesión en {name} como {user}.",
    type_code: "Escribe este código en Erevos, donde tocaste «Iniciar sesión con {name}»:",
    only: "Escríbelo solo en Erevos en tu propio teléfono. No se lo des a nadie, aunque te lo pida: quien lo escriba usa este servidor como tú.",
    open_app: "Abrir Erevos",
    or_type: "Si Erevos no se abre, escribe este código en él, donde tocaste «Iniciar sesión con {name}»:",
    refused: "{name} te dejó entrar, pero esta cuenta no puede usar este servidor. Pregunta a quien lo gestiona.",
    gone: "Este inicio de sesión ya no vale. Empieza de nuevo en Erevos.",
    failed: "El inicio de sesión no funcionó: no se pudo contactar con {name}, o no lo permitió. Empieza de nuevo en Erevos.",
    cancelled: "Se canceló el inicio de sesión. Empieza de nuevo en Erevos si quieres.",
    busy: "Se empezaron demasiados inicios de sesión desde aquí hace un momento. Espera un minuto y empieza de nuevo en Erevos.",
};

const FR: Words = Words {
    code: "fr",
    title: "Serveur Erevos",
    user: "Connexion à {name} réussie, en tant que {user}.",
    type_code: "Tape ce code dans Erevos, là où tu as touché « Se connecter avec {name} » :",
    only: "Tape-le seulement dans Erevos sur ton propre téléphone. Ne le donne à personne, même si on te le demande : qui le tape utilise ce serveur en ton nom.",
    open_app: "Ouvrir Erevos",
    or_type: "Si Erevos ne s’ouvre pas, tape ce code dedans, là où tu as touché « Se connecter avec {name} » :",
    refused: "{name} a accepté la connexion, mais ce compte ne peut pas utiliser ce serveur. Demande à la personne qui le gère.",
    gone: "Cette connexion n’est plus valable. Recommence dans Erevos.",
    failed: "La connexion n’a pas marché : {name} était injoignable ou ne l’a pas autorisée. Recommence dans Erevos.",
    cancelled: "La connexion a été annulée. Recommence dans Erevos si tu veux.",
    busy: "Trop de connexions ont été lancées d’ici à l’instant. Attends une minute, puis recommence dans Erevos.",
};

const IT: Words = Words {
    code: "it",
    title: "Server di Erevos",
    user: "Hai fatto l’accesso a {name} come {user}.",
    type_code: "Scrivi questo codice in Erevos, dove hai toccato «Accedi con {name}»:",
    only: "Scrivilo solo in Erevos sul tuo telefono. Non darlo a nessuno, anche se te lo chiede: chi lo scrive usa questo server a nome tuo.",
    open_app: "Apri Erevos",
    or_type: "Se Erevos non si apre, scrivi questo codice lì dove hai toccato «Accedi con {name}»:",
    refused: "{name} ha accettato l’accesso, ma questo account non può usare questo server. Chiedi a chi lo gestisce.",
    gone: "Questo accesso non vale più. Ricomincia da Erevos.",
    failed: "L’accesso non è riuscito: {name} non era raggiungibile o non l’ha permesso. Ricomincia da Erevos.",
    cancelled: "L’accesso è stato annullato. Ricomincia da Erevos se vuoi.",
    busy: "Da qui sono stati avviati troppi accessi poco fa. Aspetta un minuto, poi ricomincia da Erevos.",
};

const PT: Words = Words {
    code: "pt-BR",
    title: "Servidor do Erevos",
    user: "Você entrou no {name} como {user}.",
    type_code: "Digite este código no Erevos, onde você tocou em “Entrar com {name}”:",
    only: "Digite só no Erevos do seu próprio celular. Não passe para ninguém, mesmo que peçam: quem digitar usa este servidor como você.",
    open_app: "Abrir o Erevos",
    or_type: "Se o Erevos não abrir, digite este código nele, onde você tocou em “Entrar com {name}”:",
    refused: "O {name} deixou você entrar, mas esta conta não pode usar este servidor. Pergunte a quem cuida dele.",
    gone: "Este login não vale mais. Comece de novo no Erevos.",
    failed: "O login não deu certo: não foi possível falar com {name}, ou ele não permitiu. Comece de novo no Erevos.",
    cancelled: "O login foi cancelado. Comece de novo no Erevos, se quiser.",
    busy: "Muitos logins foram iniciados daqui agora há pouco. Espere um minuto e comece de novo no Erevos.",
};

const SH: Words = Words {
    code: "sh",
    title: "Erevos server",
    user: "Prijavili ste se na {name} kao {user}.",
    type_code: "Upišite ovaj kôd u Erevos, tamo gdje ste dodirnuli „Prijava preko {name}“:",
    only: "Upišite ga samo u Erevos na svom telefonu. Ne dajte ga nikome, čak ni ako ga traži: ko ga upiše, koristi ovaj server kao vi.",
    open_app: "Otvorite Erevos",
    or_type: "Ako se Erevos ne otvori, upišite ovaj kôd u njega, tamo gdje ste dodirnuli „Prijava preko {name}“:",
    refused: "{name} vas je prijavio, ali ovaj račun ne smije koristiti ovaj server. Pitajte onoga ko ga vodi.",
    gone: "Ova prijava više ne važi. Počnite ponovo u Erevosu.",
    failed: "Prijava nije uspjela: {name} nije bio dostupan ili je nije dopustio. Počnite ponovo u Erevosu.",
    cancelled: "Prijava je otkazana. Počnite ponovo u Erevosu ako želite.",
    busy: "Odavde je upravo započeto previše prijava. Sačekajte minut, pa počnite ponovo u Erevosu.",
};

/// `text` safe inside HTML.
pub fn escape(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    for c in text.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#39;"),
            c => out.push(c),
        }
    }
    out
}

/// `text` with `{user}` and `{name}` filled in, made safe for HTML.
pub fn fill(text: &str, user: &str, name: &str) -> String {
    escape(&text.replace("{user}", user).replace("{name}", name))
}

/// A whole page around `inner` (HTML).
pub fn page(lang: Lang, inner: &str) -> String {
    let words = words(lang);
    format!(
        "<!doctype html><html lang=\"{}\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>{}</title><style>body{{font:17px/1.5 system-ui,sans-serif;max-width:32rem;margin:2rem auto;padding:0 1rem;color:#1d1d1f;background:#fff}}@media(prefers-color-scheme:dark){{body{{color:#eee;background:#141414}}}}.code{{font:600 2.2rem ui-monospace,monospace;letter-spacing:.08em;margin:1rem 0}}button{{font:inherit;padding:.6rem 1.6rem;border-radius:.5rem}}.open{{display:inline-block;font-weight:600;padding:.8rem 1.8rem;border-radius:.6rem;background:#c62828;color:#fff;text-decoration:none}}</style></head><body><h1>{}</h1>{inner}</body></html>",
        words.code,
        escape(words.title),
        escape(words.title)
    )
}

/// A page that only says `text`.
pub fn message(lang: Lang, text: &str, name: &str) -> String {
    page(lang, &format!("<p>{}</p>", fill(text, "", name)))
}

/// The page for a sign-in as `user`: the `code` to type in Erevos, and to
/// give no one else.
/// The code's page for a phone that started the sign-in in Erevos (`to=app`): a button that hands
/// `digits` back to Erevos on this phone, erevos://signin?code=, with the code to type below it in
/// case nothing opens. Only the six digits go in the link: they claim nothing without the claim
/// secret, which only the phone that started holds, so an app that took the link gets nothing.
pub fn code_to_app(lang: Lang, user: &str, name: &str, code: &str, digits: &str) -> String {
    let words = words(lang);
    let link = if digits.len() == 6 && digits.bytes().all(|b| b.is_ascii_digit()) {
        format!("erevos://signin?code={digits}")
    } else {
        String::new()
    };
    page(
        lang,
        &format!(
            "<p>{}</p><p><a class=\"open\" href=\"{}\">{}</a></p><p>{}</p><p class=\"code\">{}</p><p>{}</p>",
            fill(words.user, user, name),
            escape(&link),
            escape(words.open_app),
            fill(words.or_type, user, name),
            escape(code),
            fill(words.only, user, name)
        ),
    )
}

pub fn code(lang: Lang, user: &str, name: &str, code: &str) -> String {
    let words = words(lang);
    page(
        lang,
        &format!(
            "<p>{}</p><p><strong>{}</strong></p><p class=\"code\">{}</p><p>{}</p>",
            fill(words.user, user, name),
            fill(words.type_code, user, name),
            escape(code),
            fill(words.only, user, name)
        ),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_browser_s_first_language_of_the_app_is_taken() {
        assert_eq!(lang("el-GR,el;q=0.9,en;q=0.8"), Lang::El);
        assert_eq!(lang("nl-NL, de;q=0.7, en;q=0.5"), Lang::De);
        assert_eq!(lang("sr-Latn-RS"), Lang::Sh);
        assert_eq!(lang("pt-PT"), Lang::Pt);
        assert_eq!(lang("el;q=0, fr"), Lang::Fr);
        assert_eq!(lang(""), Lang::En);
        assert_eq!(lang("ja"), Lang::En);
    }

    #[test]
    fn the_page_for_a_phone_hands_only_the_six_digits_back_to_erevos() {
        let page = code_to_app(Lang::El, "me", "LPHL", "123 456", "123456");
        assert!(page.contains("href=\"erevos://signin?code=123456\""));
        assert!(page.contains("Άνοιγμα του Erevos"));
        assert!(page.contains("<p class=\"code\">123 456</p>"));
        assert!(!page.contains("<script"));
        // Anything but six digits gives no link.
        assert!(code_to_app(Lang::En, "me", "LPHL", "x", "12\"><b").contains("href=\"\""));
    }

    #[test]
    fn what_comes_from_outside_is_escaped() {
        let page = code(Lang::En, "<b>me</b>", "LP\"HL", "1<2 456");
        assert!(page.contains("as &lt;b&gt;me&lt;/b&gt;."));
        assert!(page.contains("Sign in with LP&quot;HL:"));
        assert!(page.contains("<p class=\"code\">1&lt;2 456</p>"));
        assert!(!page.contains("<script") && !page.contains("<form"));
    }
}
