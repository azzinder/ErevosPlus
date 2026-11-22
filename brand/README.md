# Erevos+ brand

The Erevos+ mark is Erevos's (a white L with a red speech bubble holding a keyhole); what sets Erevos+ apart is
its app icon's tile, purple to blue from the top left (`#946def` → `#655ee0` → `#3450d7`), where Erevos's is dark,
and the name **Erevos+** in the lockups and the app. The files keep Erevos's names, so the code that takes them is
the same in both editions. The launcher's default icon (the `red` alias) is the purple one in Erevos+; the other
colours are Erevos's.

- `erevos-app-icon-dark.svg`, `erevos-app-icon-light.svg`: the app icon, on its dark or light tile.
- `erevos-mark-on-dark.svg`, `erevos-mark-on-light.svg`: the mark alone, for a dark or light background.
- `erevos-lockup-dark.svg`, `erevos-lockup-light.svg`: the mark with the name.
- `png/`: the icon drawn at every size Android, iOS, Sailfish OS and the web ask for.

Where they are used:

- The phone app (`app/app.json`): `app/assets/icon/` holds `icon.png` (iOS), `android-square.png`
  (Android before 8: a square icon of its own on red) and `android-adaptive-foreground.png` +
  `android-adaptive-background.png` (Android 8 and later: the mark over red, filling the launcher's own
  shape, as FASOULI's does); the launcher's icons, Erevos's and Phone's, SMS's and Contacts's, in each
  colour the owner can choose, are adaptive icons in the modules' `res/mipmap-anydpi-v26` (with
  `res/mipmap-*dpi` PNGs for older Android)), the web favicon, and `maskable.png` (the two adaptive layers together, for the web app's
  maskable icon).
- Android's notices (`app/modules/erevos-call` and `app/modules/erevos-device`,
  `res/drawable/*_notice.xml`): the mark's two paths, the L and the bubble with its keyhole, in white
  with no fill effects, as Android draws a notice's small icon from its shape alone.
- The web app (`pwa/build.mjs`) takes its icons from `png/web/`, `png/ios/icon-180.png` and
  `app/assets/icon/maskable.png`.
- The Sailfish OS app (`sailfish/build-web.sh`) takes `png/sailfish/`.
- The desktop app (`desktop/icon.png`, the 1024 icon): electron-builder makes the Linux and macOS
  icons from it.

None of the files carries metadata. Keep it that way when adding new ones.
