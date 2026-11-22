// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

//! A SOCKS5 door into this Tor, for the engines that speak to their networks themselves and know
//! no other way in: Signal's, Telegram's. Only on 127.0.0.1, at a port the system picks, and only
//! for who says the password made at random when it opened, so another app on the phone cannot go
//! through it, nor reach anything on the phone or its network through it. The user name each
//! engine gives names its circuits: two names never share one, so no exit sees Signal's and
//! Telegram's together. Only CONNECT, to a host name (the exit looks it up) or a public address.
//! Not audited.

use std::collections::HashMap;
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};
use std::sync::{Mutex, OnceLock};

use arti_client::{DangerouslyIntoTorAddr, IntoTorAddr, IsolationToken, StreamPrefs, TorAddr};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};

use crate::{client, runtime, Result, WAIT};

/// Where the door is and what opens it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Door {
    pub port: u16,
    pub password: String,
}

struct Open {
    door: Door,
    accept: tokio::task::JoinHandle<()>,
}

static OPEN: Mutex<Option<Open>> = Mutex::new(None);
static WAYS: OnceLock<Mutex<HashMap<String, IsolationToken>>> = OnceLock::new();

// Each user name's circuits, kept while the door is open.
fn way_of(name: &str) -> IsolationToken {
    *WAYS.get_or_init(|| Mutex::new(HashMap::new())).lock().unwrap_or_else(|e| e.into_inner()).entry(name.to_string()).or_insert_with(IsolationToken::new)
}

fn random_password() -> Result<String> {
    let mut bytes = [0u8; 24];
    getrandom::getrandom(&mut bytes).map_err(|e| e.to_string())?;
    Ok(bytes.iter().map(|b| format!("{b:02x}")).collect())
}

/// Opens the door, or gives the one open. Tor need not be ready: a connection made before waits
/// for it, or fails if Tor is not started.
pub fn socks_open() -> Result<Door> {
    let mut open = OPEN.lock().map_err(|_| "socks state lost".to_string())?;
    if let Some(it) = open.as_ref() {
        if !it.accept.is_finished() {
            return Ok(it.door.clone());
        }
    }
    let runtime = runtime()?;
    let listener = runtime.block_on(TcpListener::bind((Ipv4Addr::LOCALHOST, 0))).map_err(|e| format!("cannot open the Tor door: {e}"))?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();
    let password = random_password()?;
    let wanted = password.clone();
    let accept = runtime.spawn(async move {
        loop {
            let Ok((socket, from)) = listener.accept().await else { continue };
            if !from.ip().is_loopback() {
                continue;
            }
            let wanted = wanted.clone();
            tokio::spawn(async move {
                let _ = serve(socket, &wanted).await;
            });
        }
    });
    let door = Door { port, password };
    *open = Some(Open { door: door.clone(), accept });
    Ok(door)
}

/// Closes the door: what goes through it now goes on, nothing new comes in.
pub fn socks_close() {
    if let Ok(mut open) = OPEN.lock() {
        if let Some(it) = open.take() {
            it.accept.abort();
        }
    }
    if let Some(ways) = WAYS.get() {
        ways.lock().unwrap_or_else(|e| e.into_inner()).clear();
    }
}

const VERSION: u8 = 5;
const USER_PASSWORD: u8 = 2;
const NO_METHOD: u8 = 0xff;
const CONNECT: u8 = 1;

// Replies (RFC 1928): succeeded, general failure, not allowed, host unreachable, command not supported, address type not supported.
const OK: u8 = 0;
const FAILED: u8 = 1;
const NOT_ALLOWED: u8 = 2;
const UNREACHABLE: u8 = 4;
const NO_COMMAND: u8 = 7;
const NO_ADDRESS_TYPE: u8 = 8;

async fn reply(socket: &mut TcpStream, code: u8) -> std::io::Result<()> {
    socket.write_all(&[VERSION, code, 0, 1, 0, 0, 0, 0, 0, 0]).await
}

/// Whether two passwords are the same, taking as long whatever differs.
fn same(a: &[u8], b: &[u8]) -> bool {
    a.len() == b.len() && a.iter().zip(b).fold(0u8, |d, (x, y)| d | (x ^ y)) == 0
}

/// An address the exit may be asked for: a host name, or a public IP address; never one of the
/// phone's own or of its network.
pub fn public(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => !(v4.is_private() || v4.is_loopback() || v4.is_link_local() || v4.is_unspecified() || v4.is_broadcast() || v4.is_multicast() || v4.octets()[0] == 100 && (v4.octets()[1] & 0xc0) == 64),
        IpAddr::V6(v6) => !(v6.is_loopback() || v6.is_unspecified() || v6.is_multicast() || (v6.segments()[0] & 0xfe00) == 0xfc00 || (v6.segments()[0] & 0xffc0) == 0xfe80) && v6.to_ipv4_mapped().is_none_or(|v4| public(IpAddr::V4(v4))),
    }
}

async fn serve(mut socket: TcpStream, password: &str) -> std::io::Result<()> {
    let _ = socket.set_nodelay(true);
    // Greeting: only a user name and password will do.
    let mut head = [0u8; 2];
    socket.read_exact(&mut head).await?;
    if head[0] != VERSION {
        return Ok(());
    }
    let mut methods = vec![0u8; head[1] as usize];
    socket.read_exact(&mut methods).await?;
    if !methods.contains(&USER_PASSWORD) {
        return socket.write_all(&[VERSION, NO_METHOD]).await;
    }
    socket.write_all(&[VERSION, USER_PASSWORD]).await?;
    // RFC 1929: the user name names the circuits, the password opens the door.
    let mut v = [0u8; 2];
    socket.read_exact(&mut v).await?;
    let mut name = vec![0u8; v[1] as usize];
    socket.read_exact(&mut name).await?;
    let mut length = [0u8; 1];
    socket.read_exact(&mut length).await?;
    let mut given = vec![0u8; length[0] as usize];
    socket.read_exact(&mut given).await?;
    let name = String::from_utf8(name).unwrap_or_default();
    if v[0] != 1 || name.is_empty() || !same(&given, password.as_bytes()) {
        return socket.write_all(&[1, 1]).await;
    }
    socket.write_all(&[1, 0]).await?;
    // The request.
    let mut request = [0u8; 4];
    socket.read_exact(&mut request).await?;
    if request[0] != VERSION {
        return Ok(());
    }
    if request[1] != CONNECT {
        return reply(&mut socket, NO_COMMAND).await;
    }
    let target: std::result::Result<TorAddr, u8> = match request[3] {
        1 => {
            let mut ip = [0u8; 6];
            socket.read_exact(&mut ip).await?;
            let addr = IpAddr::V4(Ipv4Addr::new(ip[0], ip[1], ip[2], ip[3]));
            let port = u16::from_be_bytes([ip[4], ip[5]]);
            if public(addr) { (addr, port).into_tor_addr_dangerously().map_err(|_| NOT_ALLOWED) } else { Err(NOT_ALLOWED) }
        }
        4 => {
            let mut ip = [0u8; 18];
            socket.read_exact(&mut ip).await?;
            let mut octets = [0u8; 16];
            octets.copy_from_slice(&ip[..16]);
            let addr = IpAddr::V6(Ipv6Addr::from(octets));
            let port = u16::from_be_bytes([ip[16], ip[17]]);
            if public(addr) { (addr, port).into_tor_addr_dangerously().map_err(|_| NOT_ALLOWED) } else { Err(NOT_ALLOWED) }
        }
        3 => {
            let mut length = [0u8; 1];
            socket.read_exact(&mut length).await?;
            let mut host = vec![0u8; length[0] as usize + 2];
            socket.read_exact(&mut host).await?;
            let port = u16::from_be_bytes([host[host.len() - 2], host[host.len() - 1]]);
            host.truncate(host.len() - 2);
            match String::from_utf8(host) {
                // A name that is an address is held to the same as one given as an address.
                Ok(host) => match host.trim_matches(['[', ']']).parse::<IpAddr>() {
                    Ok(ip) if !public(ip) => Err(NOT_ALLOWED),
                    Ok(ip) => (ip, port).into_tor_addr_dangerously().map_err(|_| NOT_ALLOWED),
                    Err(_) => (host.as_str(), port).into_tor_addr().map_err(|_| NOT_ALLOWED),
                },
                Err(_) => Err(NOT_ALLOWED),
            }
        }
        _ => Err(NO_ADDRESS_TYPE),
    };
    let target = match target {
        Ok(target) => target,
        Err(code) => return reply(&mut socket, code).await,
    };
    let tor = match client() {
        Ok(tor) => tor,
        Err(_) => return reply(&mut socket, FAILED).await,
    };
    let mut prefs = StreamPrefs::new();
    prefs.set_isolation(way_of(&name));
    let stream = match tokio::time::timeout(WAIT, tor.connect_with_prefs(target, &prefs)).await {
        Ok(Ok(stream)) => stream,
        _ => return reply(&mut socket, UNREACHABLE).await,
    };
    reply(&mut socket, OK).await?;
    let mut stream = stream;
    let _ = tokio::io::copy_bidirectional(&mut socket, &mut stream).await;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_public_addresses() {
        for ip in ["127.0.0.1", "10.1.2.3", "192.168.178.29", "172.16.0.1", "169.254.1.1", "100.64.0.1", "0.0.0.0", "::1", "fe80::1", "fd00::1", "::ffff:192.168.1.1"] {
            assert!(!public(ip.parse().unwrap()), "{ip}");
        }
        for ip in ["149.154.167.51", "2001:67c:4e8:f004::a", "13.248.212.111"] {
            assert!(public(ip.parse().unwrap()), "{ip}");
        }
    }

    #[test]
    fn passwords_compare_whole() {
        assert!(same(b"abc", b"abc"));
        assert!(!same(b"abc", b"abd"));
        assert!(!same(b"abc", b"ab"));
    }

    #[test]
    fn the_door_refuses_a_wrong_password_and_what_is_not_socks5() {
        let door = socks_open().unwrap();
        assert_eq!(socks_open().unwrap(), door);
        runtime().unwrap().block_on(async {
            let mut s = TcpStream::connect((Ipv4Addr::LOCALHOST, door.port)).await.unwrap();
            s.write_all(&[5, 1, 0]).await.unwrap();
            let mut answer = [0u8; 2];
            s.read_exact(&mut answer).await.unwrap();
            assert_eq!(answer, [5, NO_METHOD]);
            let mut s = TcpStream::connect((Ipv4Addr::LOCALHOST, door.port)).await.unwrap();
            s.write_all(&[5, 1, 2, 1, 1, b'a', 3, b'b', b'a', b'd']).await.unwrap();
            let mut answer = [0u8; 4];
            s.read_exact(&mut answer).await.unwrap();
            assert_eq!(answer, [5, 2, 1, 1]);
            // Right password, but an address of the phone's network: refused before any Tor.
            let mut s = TcpStream::connect((Ipv4Addr::LOCALHOST, door.port)).await.unwrap();
            let mut hello = vec![5, 1, 2, 1, 6];
            hello.extend_from_slice(b"signal");
            hello.push(door.password.len() as u8);
            hello.extend_from_slice(door.password.as_bytes());
            hello.extend_from_slice(&[5, 1, 0, 1, 192, 168, 1, 1, 0, 80]);
            s.write_all(&hello).await.unwrap();
            let mut answer = [0u8; 2 + 2 + 10];
            s.read_exact(&mut answer).await.unwrap();
            assert_eq!(&answer[..4], &[5, 2, 1, 0]);
            assert_eq!(answer[5], NOT_ALLOWED);
        });
        socks_close();
    }
}
