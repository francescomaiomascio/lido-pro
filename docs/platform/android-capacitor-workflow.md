# Android Capacitor Workflow

This page is the canonical local workflow for opening, syncing, and validating the LidoPro Android shell.

## Canonical Owners

| Area | Owner |
| --- | --- |
| Android native shell | `android/` |
| Capacitor app configuration | `capacitor.config.ts` |
| npm command surface | `package.json` |
| Android Studio launcher resolution | `scripts/cap-open-android.sh` |
| Android live-reload launcher | `scripts/cap-android-dev.sh` |
| Optional local launcher override | `CAPACITOR_ANDROID_STUDIO_PATH` |

Do not create a second Android launcher script or duplicate Android command surface. Extend the existing npm scripts and `scripts/cap-open-android.sh` when launcher behavior needs to change.

## Node Version

Use the repository Node version before running Capacitor commands:

```sh
nvm install
nvm use
node -v
```

The repository targets Node from [.nvmrc](../../.nvmrc). Capacitor CLI 8 requires Node `>=22.0.0`; the current repository engine is stricter and requires Node `>=24.0.0`.

## Sync Android

Run:

```sh
npm run cap:sync:android
```

This builds the Vite app and syncs `dist/` into the Android shell:

```text
dist/ -> android/app/src/main/assets/public
```

The sync can emit Vite chunk-size warnings. Those warnings do not block the Android sync unless the command exits non-zero.

## Open Android Studio

Run:

```sh
npm run cap:open:android
```

This command uses `scripts/cap-open-android.sh` so local Linux installs are resolved consistently. The script first respects `CAPACITOR_ANDROID_STUDIO_PATH`, then checks common install paths such as:

```text
/opt/android-studio/bin/studio.sh
/usr/local/android-studio/bin/studio.sh
```

If Android Studio is installed somewhere else, set:

```sh
export CAPACITOR_ANDROID_STUDIO_PATH=/full/path/to/studio.sh
npm run cap:open:android
```

For persistent local shell configuration, add the export to the user's shell profile, not to repository source. `.env.example` documents the variable only as a non-secret local configuration hint.

## Live Reload Development

For Android tablet/emulator live reload, keep the Vite development server running:

```sh
npm run dev
```

Then, in another terminal, open or run Android in development-server mode:

```sh
npm run cap:open:android:dev
```

or:

```sh
npm run cap:run:android:dev
```

These commands use `scripts/cap-android-dev.sh`, which defaults to the Android Emulator host alias and syncs Capacitor with:

```text
server.url = http://10.0.2.2:5173
server.cleartext = true
```

After the Android app has been opened/run with the dev configuration, Svelte/Vite code changes reload through the Vite server.

For a physical tablet, override the host with the host machine's LAN IP:

```sh
export LIDOPRO_ANDROID_DEV_HOST=192.168.1.20
npm run cap:open:android:dev
```

Production/static Android sync remains:

```sh
npm run cap:sync:android
```

Do not commit a real LAN URL to `capacitor.config.ts`; use the environment-driven dev flow instead.

## Android Studio Project

Open the Capacitor Android project, not the repository root:

```text
/home/mothx/COMPUTER_SCIENCE/DEV_CODE/lido-pro/android
```

After Android Studio opens, wait for Gradle sync. The run configuration should use the `app` module. If Android Studio shows `<no module>`, reopen the `android/` directory and run **File > Sync Project with Gradle Files**.

## Tablet Validation

For tablet validation:

1. Start an Android tablet emulator, such as `Medium Tablet`.
2. Select the `app` run configuration.
3. Select the tablet device.
4. Press Run.

Tablet validation should include the responsive matrix entries in [Responsive device matrix](responsive-device-matrix.md) when UI behavior changes.

## Terminal Run

If an emulator or physical Android device is already available, run:

```sh
npm run cap:run:android
```

Use Android Studio when module selection, Gradle sync, emulator/device state, logs, or responsive inspection need direct IDE control.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `The Capacitor CLI requires NodeJS >=22.0.0` | Run `nvm use` and retry. |
| `Unable to launch Android Studio` | Run `npm run cap:open:android`; if needed, set `CAPACITOR_ANDROID_STUDIO_PATH`. |
| Android Studio shows `<no module>` | Open `android/`, not the repository root, then sync Gradle files. |
| No tablet target appears | Create or start a tablet emulator in Android Studio Device Manager. |
| Android app does not reload code changes | Confirm `npm run dev` is still running. For emulator, use `http://10.0.2.2:5173`; for physical tablet, set `LIDOPRO_ANDROID_DEV_HOST` to the host LAN IP and re-run `npm run cap:open:android:dev`. |

## Boundary

Android remains the native mobile/tablet shell for LidoPro Mobile. Browser preview can help with early layout checks, but it does not validate native WebView behavior, Capacitor plugins, SQLite/native storage, device permissions, Gradle packaging, signing, or tablet emulator behavior.
