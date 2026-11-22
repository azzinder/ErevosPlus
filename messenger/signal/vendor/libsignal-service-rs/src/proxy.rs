// Erevos: one proxy for all of Signal's connections (messenger/signal/vendor/README-erevos.md).

//! The proxy every connection to Signal goes through, if one is set: a SOCKS5 address such as
//! `socks5h://user:pass@127.0.0.1:9150` (Tor). Set before the connections are made; with none set,
//! connections go direct and never follow the process's proxy variables.

use std::sync::RwLock;

static PROXY: RwLock<Option<String>> = RwLock::new(None);

/// Sets the proxy for the connections made from now on; None for direct ones.
pub fn set_proxy(url: Option<String>) {
    *PROXY.write().unwrap_or_else(|e| e.into_inner()) = url.filter(|u| !u.trim().is_empty());
}

/// The proxy set now, if any.
pub fn proxy() -> Option<String> {
    PROXY.read().unwrap_or_else(|e| e.into_inner()).clone()
}

/// A closed door: nothing listens on port 9 of this phone, so a connection made through it fails.
const CLOSED: &str = "http://127.0.0.1:9";

/// The proxy set now, as reqwest takes it, or None for direct. A proxy set that reqwest cannot
/// take gives the closed door, so the connections fail rather than go direct.
pub fn reqwest_proxy() -> Option<reqwest::Proxy> {
    let url = proxy()?;
    Some(
        reqwest::Proxy::all(url.as_str())
            .or_else(|_| reqwest::Proxy::all(CLOSED))
            .expect("the closed door is a valid proxy"),
    )
}
