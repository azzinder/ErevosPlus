# AI-assisted security review, November 2026

[Ελληνικά](ai-review-2026-11.el.md)

**What it was.** A security review of the Erevos source made with an AI model (ChatGPT), using the
VIDOC Security Review workflows (code review, validation of suspected findings, reports), Security
Advisory Scout (OSV, NVD, FIRST EPSS, CISA KEV) and Authorized Security Review. These are workflows
that run on the source they are given; the VIDOC one does not connect to Vidoc's platform or
scanning service.
**What it was not.** An audit, a certification, or a review by a person outside the project.

**What was reviewed.** azzinder/Erevos main `6afe952e` (22 November 2026), then Erevos 3.0.0-beta.2
(`b49c6bb9`, 22 November) and the 3.0.0-rc.1 line (`f27c8d94`). Mostly static reading, plus some
tests the review wrote; we ran the Rust and app tests ourselves.

**How findings were handled.** Each one was checked in the code first. Three did not hold as
written: missing JWT signature check (allowed by OpenID Connect Core 3.1.3.7 for a token from the
token endpoint over TLS), the size limit for chunked HTTP bodies (the limit applies to the bytes
received, about 260 KiB at most), and an unpinned Rust version (`rust-toolchain.toml` pins it).

## Fixed

| ID | What | Fixed in |
| --- | --- | --- |
| LOCK-01 | Wrong-password counter could miss counts with checks in parallel (home search, hidden door, several web tabs) | 3.0.0-beta.2 |
| BACKUP-01 | A backup from someone else could ask for a very costly key derivation | 3.0.0-beta.2 |
| BACKUP-02 | A failed restore could leave a mix of old and new data | 3.0.0-beta.2 |
| OIDC-01/02 | Relay sign-in did not check the ID token's `exp`, nor `azp` when `aud` has several | 3.0.0-beta.2 |
| LEND-01 | A failed save of lending counters did not stop lending | 3.0.0-beta.2 |
| CI-01 | High-severity npm advisories did not fail the build | 3.0.0-beta.2 |
| SUPPLY-02 | SHA256SUMS of the downloads was not signed | 3.0.0-beta.2 |
| BACKUP-03 | A failure while cleaning up after a restore could leave things half done | 3.0.0-rc.1 |
| LEND-02 | After a lent ticket expired, one open connection could borrow without limit | 3.0.0-rc.1 |
| LEND-04 | Lending quota was charged before the action succeeded | 3.0.0-rc.1 |
| SCHEDULE-02 | A `LATER` with an id already in use could change who held it | 3.0.0-rc.1 |
| STORAGE-02 | A deleted file on a relay could come back after a power cut (no directory sync) | 3.0.0-rc.1 |

Reduced: **LOCK-02** (a 4-digit PIN can be guessed offline by someone who has a backup and its
password). The minimum stays 4 characters, but a weak password or PIN now needs a second
confirmation, and the guide says why.

Added after the review: a test that a relay looks a name up once and connects only to addresses
that passed its filter (DNS rebinding), on main after 3.0.0-rc.1.

## Not changed, and why

| ID | What | Why |
| --- | --- | --- |
| SUPPLY-01 | Windows and macOS builds are not signed with a paid publisher certificate | Yearly cost; the APK and in-app updates are signed |
| SUPPLY-04 | Reproducing the APK runs by hand, not after every release | Kept manual on purpose for now |
| SUPPLY-05 | No SBOM or build provenance | Not done yet |
| TURN-01 | TURN credentials last 12 hours | Shorter only after testing long calls |
| QUEUE-01, SCHEDULE-01 | Which queues and scheduled sends belong to the same phone is kept only in the relay's memory, so an overall limit is not kept per phone across restarts | On purpose: the relay's disk does not show which queues belong together |
| SCHEDULE-03 | A scheduled send can arrive twice after a crash | At least once by design; the app drops the copy as it drops replays |
| Dependency advisories | `rsa`, `libcrux-kem`, `crypto-bigint`, `libsqlite3-sys` | Each listed in `.cargo/audit.toml` with the reason it is not reachable or not built; waiting on upstream |

## Not covered

- Timing of PIN checks measured on a real phone.
- DNS rebinding against a real resolver in a lab (the relay behaviour is tested with a fake one).
- Power-cut tests on real hardware.
- Fuzzing, and a review by a person with cryptography experience.

Found something? See [SECURITY.md](../SECURITY.md).
