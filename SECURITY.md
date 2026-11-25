# Security

Erevos has **not been audited**. No one outside the project has reviewed the code or the
cryptography yet. Do not rely on it to protect anyone.

## Reporting a problem

Please report anything that could weaken what [docs/threat-model.md](docs/threat-model.md) says
Erevos protects, privately, through GitHub: the repository's **Security** tab, **Report a
vulnerability**. Do not open a public issue for it.

Say what you found, which version or commit, and how to see it happen. You will get an answer
within 7 days. A fix goes into the next release, and the report is credited in
[CHANGELOG.md](CHANGELOG.md) unless you ask not to be named.

## Versions

Only the latest release gets fixes. Every release goes out on every platform at the same version,
so there is no older line to patch.

## What counts

- Reading, changing, replaying or dropping messages unseen, by a relay, a contact, or anyone on the
  network.
- Learning more than the threat model says from what is stored on a device, a backup or a relay.
- Telling that a second space or hidden chats exist, beyond what the threat model says.
- Getting a phone to install an update, or a browser to run a web app release, that the release
  computer did not sign.
- Taking over, crashing or filling a relay from outside, or using it as a proxy into a private
  network.

What the threat model lists as out of scope (a compromised operating system, process memory, a
global observer) is not a vulnerability, but a report that shows it matters more than it says is
welcome.

## For reviewers

[docs/security-review.md](docs/security-review.md) is a map of the code for a review: what each
part does, where its cryptography is, how to build and test it, and the places that most need a
second look.

An AI-assisted review of November 2026, what it found, what was fixed and what it did not cover:
[docs/ai-review-2026-11.md](docs/ai-review-2026-11.md). It does not change what this page says
first: Erevos has not been audited.
