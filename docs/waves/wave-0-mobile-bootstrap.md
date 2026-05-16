# Wave 0 - Mobile Bootstrap

## Purpose

Wave 0 prepares the local Android mobile foundation for Beach BDF. It does not implement customer, booking, account, or real beach-management workflows yet.

## Stack

- Svelte
- Vite
- TypeScript
- Capacitor Android
- Capacitor Community SQLite plugin prepared
- Custom responsive CSS
- Local-only architecture

## Commands Run

```sh
pwd
ls -la
npm create vite@latest . -- --template svelte-ts
npm install
npm install @capacitor/core @capacitor/android @capacitor/filesystem @capacitor/dialog @capacitor/toast @capacitor-community/sqlite
npm install -D @capacitor/cli
npx cap init "Beach BDF" "it.beachbdf.app"
npm run build
npx cap add android
npx cap sync android
node -v
npm -v
java -version
adb version
nvm --version
npm run check
npm run dev
curl -I http://localhost:5173/
```

## Resulting Structure

```txt
src/
  app/
  components/
    beach/
    layout/
    ui/
  lib/
    config/
    db/
    layout/
    platform/
    types/
  styles/
docs/
  architecture/
  waves/
android/
capacitor.config.ts
package.json
vite.config.ts
```

## Android Status

- `capacitor.config.ts` exists.
- App id is `it.beachbdf.app`.
- App name is `Beach BDF`.
- Web output dir is `dist`.
- `android/` platform exists.
- `npx cap sync android` passed.
- `npm run check` passed with 0 errors and 0 warnings.
- Dev server responded with HTTP 200 at `http://localhost:5173/`.
- Java is available: OpenJDK 21.0.5.
- ADB is available: Android Debug Bridge 36.0.0.
- Active shell Node during validation was `v20.20.2`.
- `.nvmrc` is set to `24` for the requested Node 24 LTS target.
- `nvm` is not available in the current shell, so Node was not switched automatically.

## Intentionally Not Implemented

- No login.
- No cloud dependency.
- No remote database.
- No customer management.
- No account management.
- No booking workflow.
- No real SQLite schema or inserts.
- No GitHub repository initialization.
- No Ionic, Tailwind, Bootstrap, Material UI, Firebase, Supabase, Next.js, Electron, or Tauri.

## Pass/Fail Checklist

- PASS: `package.json` exists.
- PASS: `npm install` completed.
- PASS: `npm run build` passed.
- PASS: `capacitor.config.ts` exists.
- PASS: `android/` platform exists.
- PASS: `npx cap sync android` passed.
- PASS: responsive app shell exists and responds in browser.
- PASS: required `src/` folder structure exists.
- PASS: `docs/waves/wave-0-mobile-bootstrap.md` exists.
- PASS: `docs/architecture/mobile-local-first.md` exists.
- PASS: no GitHub repo initialized.
- PASS: no cloud dependency added.
- PASS: no business feature implemented.
