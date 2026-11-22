<!-- SPDX-FileCopyrightText: 2026 azzinder -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->

# erevos-telegram

Telegram through [TDLib](https://github.com/tdlib/td) (Boost Software License 1.0), only in the
ErevosGram build of Erevos for Android. See docs/erevosgram.md.

- `EREVOS_TELEGRAM=1` when building takes `android/src/full` and TDLib from `tdlib/` (built by
  `scripts/build-tdlib.sh`); the Telegram API id and hash come from `EREVOS_TG_API_ID` and
  `EREVOS_TG_API_HASH`.
- Every other build, the F-Droid one too, takes `android/src/stub`: no TDLib, no Telegram code.
