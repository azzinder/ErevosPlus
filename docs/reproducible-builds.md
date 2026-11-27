# Reproducible builds

Whether a file Erevos publishes can be built again from the source and come out the same, byte for
byte, so that anyone can check that it was built from the code it says, and nothing else.

## Where it stands

| What | Reproducible | Checked how |
| --- | --- | --- |
| **Web app** (`erevos-web.tar.gz`, what the release key signs and the web server serves) | Yes | `scripts/reproduce-web.sh`. The published 3.3.2 came out the same, all 78 files, built again on another machine on 2026-10-26. |
| **Desktop apps** (Linux, Windows, macOS) | Their app inside is the same web build; the packages around it are not checked yet | |
| **Android APK** | Not yet: 3.3.2, built before the path fixes below, came out different on 2026-10-26 | `scripts/reproduce-apk.sh`, or on GitHub `.github/workflows/reproduce-apk.yml` (by hand), which now lists in its log the files that differ. |
| **F-Droid APK** (`erevos-android-fdroid.apk`, `erevos-lite-android-fdroid.apk`) | Built as F-Droid builds it, for F-Droid to compare with its own build: see below. Erevos's, yes: on 2026-11-27 it came out the same, byte for byte, in three builds on three machines, two of them with two processors, and the signature of one, copied onto another, verified. Erevos Lite's, yes: the same day it came out the same, byte for byte, in two builds on two machines, one of them with two processors, and the signature of one, copied onto the other, verified | On GitHub `.github/workflows/fdroid-build.yml` (by hand): two builds on two machines, compared, and one's signature copied onto the other as F-Droid does. |
| **Sailfish RPM** | Not yet | |
| **Relay** | Not checked; whoever runs one builds it from the source anyway | |

The check needs no secret: the source and the public download repository have everything.

## Check the web app

On Linux, with git, Node 22, rustup and wasm-bindgen-cli at the version `crates/erevos-ffi` pins:

    scripts/reproduce-web.sh 3.3.2 https://erevos-web.lphl.nekten.eu

It downloads that release's web app, checks it against the release's `SHA256SUMS`, builds the
commit it names with the same steps as `.github/workflows/release.yml`, and compares every file's
SHA-256 with the published one and with the `release.json` the server gives out. That
`release.json` is the list the release key signs, which `node pwa/release.mjs verify <address>`
checks; so the two together tie what the server serves to the source.

## Check the Android app

    scripts/reproduce-apk.sh 3.3.2 [folder to build in]

It downloads that release's APK, checks it against `SHA256SUMS`, builds the commit `version.json`
names, unsigned (`EREVOS_UNSIGNED=1`, see `app/plugins/with-release-signing.js`), with the same
steps as the release's apk job, then copies the published APK's signature onto it with
`apksigcopier compare`: the signature verifies only if every other byte is the same. It needs
what that job needs (Node 22, Java 21, rustup with cargo-ndk, Go, the Android SDK) and
apksigcopier. React Native's modules are C++ built with CMake, which keeps the folder it was built
in, so build in the folder GitHub's runner used, `/home/runner/work/Erevos/Erevos`. The workflow
`reproduce-apk` does all this on a fresh GitHub runner, started by hand; it uses about as many
Actions minutes as a release's Android build.

## The F-Droid APK

Each release of Erevos also carries `erevos-android-fdroid.apk`, and each of Erevos Lite
`erevos-lite-android-fdroid.apk`: the F-Droid build (`EREVOS_DISTRIBUTION=fdroid`: no Check for
updates, no permission to install packages), built from the release's commit exactly as F-Droid
builds it. `scripts/fdroid-build.sh` takes the edition's recipe in `deploy/fdroid/`, the one
F-Droid's list of apps carries, and runs F-Droid's own `fdroid build` on it in F-Droid's build
server image (`registry.gitlab.com/fdroid/fdroidserver:buildserver-trixie`), as F-Droid's user,
in F-Droid's folder (`/home/vagrant/build/app.erevos`): the same Debian, Java, SDK, NDK and paths
as F-Droid's own build, so React Native's CMake builds keep the same folder in both. The recipe
pins what Debian does not: Node by its version and SHA-256, Rust and Go as the source names them,
Expo's template by its exact version, and Expo's modules built from their source. On GitHub's
machines a release takes Maven Central's files from Google's copy of it, the same files at the same
paths, those the Gradle Plugin Portal would send on to Maven Central too
(`scripts/maven-central-mirror.gradle`), as Maven Central at times refuses those machines;
F-Droid's own build takes them from Maven Central.

That job holds no key. The next one signs the APK with the release key, adding an APK Signature
Scheme v2 signature, as Gradle signs the release APK, and nothing else (`scripts/fdroid-sign.sh`,
where only the SDK's apksigner sees the key); the step after it, the key gone, checks that with
`apksigcopier compare`, installed by its SHA-256 (`scripts/apksigcopier-requirements.txt`).
F-Droid's recipe names that file (`Binaries`) and the key (`AllowedAPKSigningKeys`): F-Droid builds
the same commit, copies the file's signature onto its own build and, when it verifies, every other
byte being the same, hands out the signed file. Erevos from F-Droid and from the releases then share
one key, as Erevos+ does: each installs over the other, everything kept. What the F-Droid build has
not (Check for updates, From a phone nearby, Google Drive) then stops: Backups says so of backups
to Google Drive left from before (`lib/google-drive.ts` driveLeftBehind), and an Erevos not from
F-Droid asks before it installs F-Droid's from a phone nearby (`lib/give-app.ts`).

The workflow `fdroid-build` (by hand) checks this before a release: it builds an edition's F-Droid
APK twice, on two of GitHub's machines, the first as a release does, the second with fewer
processors and with Maven Central's files from Maven Central itself, as F-Droid does, compares the
two (`scripts/apk-compare.py`), then signs the first with a key made for the test and copies that
signature onto the second, as F-Droid checks a release. Given a published F-Droid APK's address, it
compares the first with that one too.

## What makes it the same

- **One Rust**: `rust-toolchain.toml` names the exact version. It moves forward by hand.
- **No machine paths in the core**: `app/scripts/build-web-core.mjs` maps Cargo's folder and the
  checkout to fixed names (`--remap-path-prefix`). Releases built before that hold
  `/home/runner/.cargo`, GitHub's, in their core's panic messages; the script builds those with
  `CARGO_HOME` there, which needs that folder to be writable.
- **No machine paths in the Android core**: `app/modules/erevos-core/android/build.gradle` maps
  Cargo's folder, the checkout and the NDK to fixed names, for Rust and for the C that build
  scripts compile. Lyrebird (Go) is built with `-trimpath` and no build id.
- **Locked packages**: `npm ci` from `app/package-lock.json`, `cargo` from `Cargo.lock`.
- **The inputs a release names**: its number and build (`EREVOS_VERSION`, `EREVOS_BUILD`, which
  the app shows) and the web app's release number (`--version` of `pwa/build.mjs`), all read back
  from the release itself.
- `release.json` says when it was made (`created`), the one field that differs from build to
  build; the check compares the files it lists, not that field.

## Next

Run `reproduce-apk` on the first release built with the Android path fixes, and make the APK
Updates installs the same in any folder too (React Native's CMake builds keep theirs). Put the
recipes in F-Droid's list of apps (fdroiddata). Then the desktop packages and the Sailfish RPM.
