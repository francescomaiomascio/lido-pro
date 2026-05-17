# LidoPro

<p align="center">
  <img src="public/brand/lidopro-wordmark-transparent.png" alt="LidoPro logo" width="520">
</p>

LidoPro is a proprietary commercial local-first application for managing beach club operations, from layout planning to local booking, customers, pricing, and account tracking.

## Status

| Area | Status |
| --- | --- |
| Product | Proprietary commercial software |
| Repository | Public/source-available when published, not open source |
| Runtime model | Local-first |
| Main desktop shell | Tauri Desktop |
| Mobile shell | Capacitor Android |
| iOS/iPad | Packaging and validation target when intentionally enabled |
| Browser | Development preview only |
| Commercial release | Not generally available from repository access |

## Public Repository / Commercial Product Status

LidoPro is proprietary commercial software.

This repository may be public/source-available for transparency, portfolio review, technical review, and evaluation. LidoPro is not open source.

Repository access does not grant permission to copy, modify, redistribute, host, resell, white-label, deploy, sublicense, or use the application commercially.

Commercial use, private pilots, deployments, partnerships, licensing, reseller activity, agency delivery, hosted operation, or customer evaluation require prior written permission from Francesco Maiomascio.

Cloud, payment, account, customer portal, hosted booking, and SaaS capabilities are commercial product boundaries. They must only be described as live when implemented, configured, reviewed, and explicitly released.

Legal and commercial boundary files:

- [LICENSE.md](LICENSE.md)
- [COMMERCIAL.md](COMMERCIAL.md)
- [NOTICE.md](NOTICE.md)
- [TRADEMARK.md](TRADEMARK.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

## What LidoPro Does

LidoPro is being built as a local-first operating system for beach club management.

Current local-first areas:

- **Lido Studio / Studio Mappa**: layout planning, beach map work, and design operations.
- **Lido Booking**: local reservations and operational beach-place workflows.
- **Lido Clienti**: customer registry, assignments, and customer activity.
- **Lido Listino**: pricing, catalog, extras, and tariff foundations.
- **Local accounts**: local ledger, payment records, and account tracking foundations.
- **Local-first storage**: development/local persistence model with native-shell boundaries.

Commercial product boundaries:

- **Lido Pay**: payment integrations and commercial payment workflows. Not live unless explicitly implemented and released.
- **Lido Cloud**: cloud sync, accounts, customer portal, hosted booking, and multi-device operation. Not live unless explicitly implemented and released.
- **Multi-device and customer-facing flows**: commercial roadmap boundaries, not implied by repository access.

## Platform Model

| Platform | Runtime | Tooling | Current status | Main command / action |
| --- | --- | --- | --- | --- |
| macOS Desktop | Tauri | Rust, Cargo, Tauri | Primary desktop development runtime | `npm run app:dev` |
| Linux Desktop | Tauri | Rust, Cargo, WebKitGTK/native Linux dependencies | Prepared validation target | `npm run app:dev`, `npm run desktop:build` |
| Android phone/tablet | Capacitor Android | Android Studio, Android SDK, physical device or emulator | Native mobile validation target | `npm run cap:sync:android`, `npm run cap:open:android`, `npm run cap:run:android` |
| iPhone/iPad | iOS native shell when configured | Xcode, iOS Simulator, Apple tooling | Packaging/validation target, not primary until enabled | `npm install @capacitor/ios`, `npx cap add ios`, `npx cap sync ios`, `npx cap open ios` |
| Browser | Vite dev server | Browser responsive mode | Preview/fallback only, not product runtime | `npm run dev:server` |

## Development Philosophy

VS Code is the main editor. `npm run app:dev` is the canonical local development command. It starts one Vite dev server at `http://localhost:5173` and opens LidoPro Desktop through Tauri against that same endpoint.

Tauri Desktop is the preferred local desktop runtime. Browser mode exists for fast UI inspection only and should not be treated as the product runtime.

Android Studio is used for Android SDK, emulator, and device build/run work. Xcode is required for iPhone/iPad simulator or device validation when the iOS platform is intentionally added.

Responsive validation is mandatory for UI work. Desktop-only validation is insufficient. UI changes must check desktop, tablet landscape, tablet portrait, phone portrait, and phone landscape behavior.

## Requirements

Core:

- Git
- Node.js version declared in [.nvmrc](.nvmrc)
- npm
- VS Code or equivalent editor

Desktop / Tauri:

- Rust
- Cargo
- Tauri dependencies
- macOS or Linux native dependencies

Android:

- Android Studio
- Android SDK
- Android platform tools
- Emulator or physical Android phone/tablet

iOS/iPad:

- macOS
- Xcode
- Xcode command line tools
- iOS Simulator or physical iPhone/iPad
- Apple Developer account only for signing/distribution, not for local simulator basics

Linux:

- Linux desktop environment
- WebKitGTK/Tauri system dependencies
- build tools
- package tooling later for AppImage/deb if needed

## Installation

Clone the repository and enter the project directory. Use the placeholder URL until the public remote is finalized.

```sh
git clone https://github.com/<owner>/lido-pro.git
cd lido-pro
```

Use the Node.js version declared by the repository:

```sh
nvm install
nvm use
npm install
node -v
```

Verify the project:

```sh
npm run check
npm run build
```

If you do not use `nvm`, install the version shown in [.nvmrc](.nvmrc) with your preferred Node version manager.

## Running LidoPro Desktop on macOS

Run the desktop app in development mode:

```sh
npm run app:dev
```

This is the preferred workflow. Tauri starts the Vite dev server through `src-tauri/tauri.conf.json`, then loads `http://localhost:5173` inside the desktop window. The browser can manually preview the same endpoint while `app:dev` is running.

`desktop:dev` remains available as an alias:

```sh
npm run desktop:dev
```

Build an unsigned local app bundle:

```sh
npm run desktop:build
```

Run the macOS-named desktop build alias:

```sh
npm run desktop:build:mac
```

For now `desktop:build`, `desktop:build:mac`, `desktop:build:linux`, and `tauri:build` all run `tauri build`. The separate names are operational/documentation aliases for target-specific workflows. Desktop builds are unsigned/local unless release signing and notarization are explicitly configured. This repository does not provide public signed or notarized binaries.

## Running on Linux Desktop

Linux uses the same Tauri runtime model, but Linux package validation must happen on Linux or CI with the correct native dependencies.

```sh
npm run app:dev
npm run desktop:build
```

Linux may require WebKitGTK and other Tauri system dependencies. Do not treat AppImage or deb packages as released unless they are actually produced, tested, and explicitly approved for distribution.

Browser preview is not the Linux product runtime.

## Running Android Tablet / Smartphone

Build the web app and synchronize Capacitor:

```sh
npm run cap:sync:android
npm run cap:open:android
npm run cap:run:android
```

VS Code remains the editor. Android Studio is required for SDK, emulator, and device management. On low-RAM Macs, a physical Android device is recommended over a heavy emulator.

Use tablet and phone profiles for responsive validation. Browser responsive mode is not enough for Android validation because it does not validate native WebView, plugin, storage, permission, or device behavior.

## Running iPad / iPhone

iOS/iPad support is a packaging and validation target. If `ios/` is not present, the platform has not been intentionally added yet.

Setup path when the project explicitly enables iOS:

```sh
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
npx cap open ios
```

Xcode is required. iPad/iPhone validation must happen through Xcode Simulator or a physical device. Local simulator testing is different from App Store distribution. Signing, provisioning, TestFlight, App Store, and certificate work are release tasks, not repository setup.

## Browser Preview

Run the Vite development server only:

```sh
npm run dev:server
```

The same command is available through:

```sh
npm run web:dev
npm run dev
```

Browser preview is available at `http://localhost:5173`. It is for quick UI and responsive inspection only. It is not production persistence and not the product runtime. Browser responsive mode does not validate native WebView behavior, Capacitor/Tauri plugin behavior, SQLite/native storage behavior, permissions, or device constraints.

## Validation

Core validation:

| Purpose | Command |
| --- | --- |
| Type/Svelte check | `npm run check` |
| Production web build | `npm run build` |
| Whitespace/diff safety | `git diff --check` |

Capacitor:

| Purpose | Command |
| --- | --- |
| Build and sync configured platforms | `npm run cap:sync` |
| Build and sync Android | `npm run cap:sync:android` |
| Open Android Studio | `npm run cap:open:android` |
| Build and run Android target | `npm run cap:run:android` |
| Build and sync iOS if configured | `npm run cap:sync:ios` |
| Open Xcode if iOS is configured | `npm run cap:open:ios` |
| Build and run iOS target if configured | `npm run cap:run:ios` |

Desktop:

| Purpose | Command |
| --- | --- |
| Tauri desktop dev | `npm run app:dev` |
| Tauri desktop dev alias | `npm run desktop:dev` |
| Tauri desktop build | `npm run desktop:build` |
| macOS-named desktop build alias | `npm run desktop:build:mac` |
| Linux-named desktop build alias | `npm run desktop:build:linux` |
| Direct Tauri build alias | `npm run tauri:build` |

Optional per target:

- `npx cap sync ios` if iOS is configured.
- Android Studio run on emulator or physical device.
- Xcode run on iPad/iPhone simulator or physical device.

## Responsive Validation Matrix

Responsive validation is mandatory for UI changes.

| Category | Viewports |
| --- | --- |
| Desktop | 1440 x 900, 1280 x 800 |
| Tablet landscape | 1180 x 820, 1138 x 712, 1024 x 768 |
| Tablet portrait | 820 x 1180, 768 x 1024 |
| Phone portrait | 430 x 932, 390 x 844, 360 x 800 |
| Phone landscape | 844 x 390, 932 x 430 |

Acceptance checks:

- no horizontal overflow
- no clipped content
- no overlapped text
- no controls covering critical content
- bottom sheets and panels scroll internally
- primary actions remain reachable
- map/canvas surfaces remain visible and operable
- tablet portrait is not desktop squeezed
- smartphone portrait is verticalized

See [docs/platform/responsive-device-matrix.md](docs/platform/responsive-device-matrix.md) and [docs/platform/ui-responsive-checklist.md](docs/platform/ui-responsive-checklist.md).

## Repository Layout

```text
lido-pro/
  android/
  asset-lab/
  docs/
  public/
  scripts/
  src/
  src-tauri/
  README.md
  LICENSE.md
  COMMERCIAL.md
  NOTICE.md
  TRADEMARK.md
  SECURITY.md
  CONTRIBUTING.md
```

Folder roles:

- `src/`: Svelte product application source.
- `public/`: static public assets loaded by the frontend, including brand assets.
- `android/`: Capacitor Android native shell.
- `src-tauri/`: Tauri Desktop native shell.
- `asset-lab/`: internal asset generation and rendering pipeline.
- `docs/`: product, platform, commercial, legal, repository, architecture, and wave documentation.
- `scripts/`: local development, validation, and repository helper scripts.

Generated/local folders and artifacts must not be committed:

- `node_modules/`
- `dist/`
- `android/**/build/`
- `src-tauri/target/`
- local databases
- local exports/backups
- release artifacts
- signing material

## Documentation Map

Commercial/legal:

- [LICENSE.md](LICENSE.md)
- [COMMERCIAL.md](COMMERCIAL.md)
- [NOTICE.md](NOTICE.md)
- [TRADEMARK.md](TRADEMARK.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

Product:

- [docs/product/product-boundary.md](docs/product/product-boundary.md)
- [docs/brand/lidopro-naming.md](docs/brand/lidopro-naming.md)

Platform:

- [docs/platform/desktop-tauri-cutover.md](docs/platform/desktop-tauri-cutover.md)
- [docs/platform/development-workflows.md](docs/platform/development-workflows.md)
- [docs/platform/macos-desktop-workflow.md](docs/platform/macos-desktop-workflow.md)
- [docs/platform/linux-desktop-packaging.md](docs/platform/linux-desktop-packaging.md)
- [docs/platform/desktop-storage-boundary.md](docs/platform/desktop-storage-boundary.md)
- [docs/platform/responsive-device-matrix.md](docs/platform/responsive-device-matrix.md)
- [docs/platform/ui-responsive-checklist.md](docs/platform/ui-responsive-checklist.md)

Repository:

- [docs/repo/public-commercial-repo-policy.md](docs/repo/public-commercial-repo-policy.md)
- [docs/repo/public-release-checklist.md](docs/repo/public-release-checklist.md)
- [docs/repo/repository-hygiene.md](docs/repo/repository-hygiene.md)
- [docs/repo/repository-naming.md](docs/repo/repository-naming.md)
- [docs/repo/repository-structure.md](docs/repo/repository-structure.md)
- [docs/repo/file-ownership-map.md](docs/repo/file-ownership-map.md)
- [docs/repo/asset-directory-policy.md](docs/repo/asset-directory-policy.md)

Commercial readiness:

- [docs/commercial/README.md](docs/commercial/README.md)

Waves and architecture:

- [docs/waves/](docs/waves/)
- [docs/architecture/](docs/architecture/)
- [docs/README.md](docs/README.md)

## Repository Hygiene

The repository tracks source code, documentation, configuration, and curated assets required to build the application.

Do not commit:

- `.env` files or local secrets
- real customer, booking, account, payment, or business data
- SQLite database files with real data
- backups or exports with private data
- API keys, deployment credentials, signing keys, keystores, certificates, or payment credentials
- generated Android/iOS/Tauri release artifacts
- `node_modules/`
- `dist/`
- Android native build outputs
- Tauri/Rust build outputs
- local editor or operating system files

Before making the repository public, run the public release checklist and a manual review for real data, secrets, private assets, and misleading product claims.

## Troubleshooting

Wrong Node version:

- Run `node -v`.
- Use `nvm use`.
- Capacitor requires Node.js 22 or newer.
- On Apple Silicon Macs with Homebrew Node 24, ensure the Node 24 path is active before Capacitor/Tauri validation.

Tauri/Rust missing:

- Install Rust and Cargo.
- Install the Tauri system prerequisites for the host platform.
- Run `npm run app:dev` again after dependencies are available.

Port `5173` already in use:

- `app:dev` uses one strict Vite endpoint: `http://localhost:5173`.
- Stop any old server before restarting the app.

```sh
lsof -i :5173
kill <PID>
```

Android Studio missing SDK/device:

- Install Android Studio and Android SDK.
- Configure an emulator or connect a physical Android device.
- On low-RAM Macs, prefer Tauri Desktop plus a physical Android device over a heavy emulator.

Xcode required for iOS:

- Install Xcode and Xcode command line tools.
- Use Xcode Simulator or a physical device for iPad/iPhone validation.
- Signing and App Store distribution require separate release work.

Browser preview limitations:

- Browser preview is not native validation.
- It does not validate native WebView, plugin, SQLite/native storage, package permission, signing, or device-specific behavior.

## Non-Goals / Not Included From Repository Access

Repository access does not include:

- public SaaS service access
- live payment processing unless explicitly implemented and released
- live customer portal unless explicitly implemented and released
- cloud sync/account service unless explicitly implemented and released
- App Store or Mac App Store release
- Linux package release
- production/customer deployment rights
- commercial use rights
- open-source license rights

## Commercial Contact

Commercial access, licensing, deployment, private pilots, partnerships, and customer evaluation require written permission from Francesco Maiomascio.

Contact details will be provided through authorized commercial channels.
