# Lacquer

Slide a marble through a wooden maze until every groove is coated. Stars pay gems. Spend them on lacquer, boards, pieces, and cloth borders.

## Downloads

Every push to `main` builds:

- **Windows** — Electron installer (`Lacquer-Setup.exe`)
- **Android** — installable APK

Open the [Actions](../../actions/workflows/desktop-android.yml) tab, choose the latest **Windows and Android** run, and download the artifacts. You can also start a build with **Run workflow**.

The APK is signed with the runner’s debug key. Install it with “install unknown apps” enabled. A newer build may ask you to uninstall the previous copy first, because each run uses a fresh debug key.

## Play on the web

```bash
npm install
npm run dev
```

The static shell used by the desktop and Android apps is `npm run build:shell` (output in `shell/dist`).
