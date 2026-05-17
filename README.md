<p align="center">
  <img src="public/brand/lidopro-wordmark-transparent.png" alt="LidoPro logo" width="520">
</p>

# LidoPro

<p align="center">
  <strong>Local-first operating software for beach club operations.</strong>
</p>

<p align="center">
  LidoPro is a proprietary commercial local-first application for beach club operations - from map-based layout planning and service management to local booking, customers, pricing, and account tracking.
</p>

<p align="center">
  <code>Proprietary commercial</code>
  <code>Source-available, not open source</code>
  <code>Local-first</code>
  <code>Tauri Desktop</code>
  <code>Capacitor Android</code>
  <code>Browser preview only</code>
</p>

<p align="center">
  <img src="public/brand/readme/lidopro-map-desktop-preview.png" alt="LidoPro desktop map interface preview" width="920">
</p>

<p align="center">
  <em>LidoPro desktop preview - operational beach map, selected place detail, and local booking/account workflow.</em>
</p>

## Product Overview

LidoPro is built around the beach map as the operational surface. Layout planning, place state, booking activity, customer assignments, pricing, and local account tracking are designed to stay close to the daily work of a beach club rather than live in disconnected screens.

The product is local-first today. Cloud sync, account systems, payment integrations, customer portals, hosted booking, and SaaS operation are controlled commercial product boundaries and are not live unless implemented, configured, reviewed, and explicitly released.

| Domain | Product surface | Current scope |
| --- | --- | --- |
| Layout and map | Lido Studio | local map, beach-place state, layout operations |
| Reservations | Lido Booking | local reservation and assignment workflow |
| Customers | Lido Clienti | registry, assignments, customer activity |
| Pricing | Lido Listino | tariffs, extras, article/catalog foundations |
| Accounts | Local accounts | local ledger and payment-record foundations |
| Desktop runtime | LidoPro Desktop | Tauri development/runtime shell |
| Mobile validation | LidoPro Mobile | Capacitor Android phone/tablet target |

## Commercial and Repository Status

LidoPro is proprietary commercial software. This repository may be public/source-available for transparency, portfolio review, technical review, and evaluation. LidoPro is not open source.

Repository access does not grant rights to copy, modify, redistribute, host, resell, white-label, deploy, sublicense, or use the application commercially. Commercial use, private pilots, deployments, partnerships, licensing, reseller activity, agency delivery, hosted operation, or customer evaluation require prior written permission from Francesco Maiomascio.

Cloud, payment, account, customer portal, hosted booking, and SaaS capabilities are commercial product boundaries and are not live unless implemented, configured, reviewed, and explicitly released.

See [LICENSE.md](LICENSE.md), [COMMERCIAL.md](COMMERCIAL.md), [NOTICE.md](NOTICE.md), [TRADEMARK.md](TRADEMARK.md), [SECURITY.md](SECURITY.md), and [CONTRIBUTING.md](CONTRIBUTING.md).

## Runtime Architecture

```text
Svelte/Vite application
  |- Tauri Desktop        macOS / Linux desktop runtime
  |- Capacitor Android    Android phone/tablet native shell
  |- Capacitor iOS        iPad/iPhone target when intentionally enabled
  `- Browser/Vite         development preview only
```

The product source lives primarily in `src/`. Tauri and Capacitor are native shells around the same product application, not separate product codebases.

## Development and Device Matrix

| Target | Role | Tooling | Command / action | Notes |
| --- | --- | --- | --- | --- |
| macOS Desktop | primary desktop development runtime | Tauri, Rust, Cargo | `npm run app:dev` | preferred daily workflow |
| Linux Desktop | desktop validation/local build target | Tauri, Rust, Cargo, WebKitGTK/native dependencies | `npm run app:dev` / `npm run desktop:build` | validate on Linux before claiming Linux packages |
| Android phone/tablet | primary mobile/operational validation target | Capacitor Android, Android Studio, Android SDK, physical device/emulator | `npm run cap:sync:android` / `npm run cap:open:android` / `npm run cap:run:android` | Android tablet is the main operational field target |
| iPad/iPhone | Apple mobile validation target when enabled | Capacitor iOS, Xcode, iOS Simulator/device | `npx cap add ios` / `npx cap sync ios` / `npx cap open ios` | requires Xcode; not App Store distribution |
| Browser | fast UI/responsive preview only | Vite dev server, browser responsive mode | `npm run dev:server` | not product runtime, not native validation |

## Quick Start

```sh
git clone https://github.com/francescomaiomascio/lido-pro.git
cd lido-pro
nvm install
nvm use
npm install
npm run check
npm run build
npm run app:dev
```

`npm run app:dev` is the canonical local development command. It starts one Vite dev server at `http://localhost:5173` and opens LidoPro Desktop through Tauri against that same endpoint.

## Requirements

| Area | Requirements |
| --- | --- |
| Core | Git, Node.js from [.nvmrc](.nvmrc), npm |
| Desktop | Rust, Cargo, Tauri system dependencies |
| Android | Android Studio, Android SDK, emulator or physical Android device |
| iOS/iPad | macOS, Xcode, Xcode command line tools, Simulator or physical device |
| Linux | WebKitGTK/native Tauri dependencies, build tools |

## Daily Workflow

```text
Daily development:
1. Edit in VS Code.
2. Run npm run app:dev.
3. Use Tauri as the main desktop runtime.
4. Use browser responsive mode only for quick layout checks.
5. Validate Android/tablet through Android Studio or a physical device before closing UI work.
```

## Validation

| Scope | Commands |
| --- | --- |
| Core | `npm run check`, `npm run build`, `git diff --check` |
| Desktop | `npm run app:dev`, `npm run desktop:build` |
| Android | `npm run cap:sync:android`, `npm run cap:open:android`, `npm run cap:run:android` |
| iOS/iPad if configured | `npm run cap:sync:ios`, `npm run cap:open:ios`, `npm run cap:run:ios` |
| Browser preview | `npm run dev:server` |

Do not claim a platform, package, or binary is released unless it has been built, tested, signed/notarized where required, and explicitly approved for distribution.

## Responsive Validation

| Category | Viewports |
| --- | --- |
| Desktop landscape | 1440x900, 1280x800 |
| Tablet landscape | 1180x820, 1138x712, 1024x768 |
| Tablet portrait | 820x1180, 768x1024 |
| Smartphone portrait | 430x932, 390x844, 360x800 |
| Smartphone landscape | 844x390, 932x430 |

Acceptance checks: no horizontal overflow, no clipped primary content, no overlapped text, controls do not cover critical content, panels scroll internally, map/canvas remains usable, primary actions remain reachable, and smartphone layouts are verticalized.

See [docs/platform/responsive-device-matrix.md](docs/platform/responsive-device-matrix.md) and [docs/platform/ui-responsive-checklist.md](docs/platform/ui-responsive-checklist.md).

## Repository Layout

```text
lido-pro/
  src/          Svelte product application
  src-tauri/    Tauri desktop shell
  android/      Capacitor Android shell
  public/       static and brand assets
  asset-lab/    asset generation pipeline
  docs/         product/platform/repo/commercial docs
  scripts/      local helper scripts
```

Generated/local folders such as `node_modules/`, `dist/`, `src-tauri/target/`, `android/**/build/`, local databases, exports, backups, and signing material must not be committed.

## Documentation

- Legal/commercial: [LICENSE.md](LICENSE.md), [COMMERCIAL.md](COMMERCIAL.md), [NOTICE.md](NOTICE.md), [TRADEMARK.md](TRADEMARK.md), [SECURITY.md](SECURITY.md), [CONTRIBUTING.md](CONTRIBUTING.md)
- Product/brand: [docs/product/product-boundary.md](docs/product/product-boundary.md), [docs/brand/lidopro-naming.md](docs/brand/lidopro-naming.md), [docs/commercial/README.md](docs/commercial/README.md)
- Platform: [docs/platform/](docs/platform/)
- Repository: [docs/repo/](docs/repo/)
- Architecture/waves: [docs/architecture/](docs/architecture/), [docs/waves/](docs/waves/), [docs/README.md](docs/README.md)

## Repository Hygiene

Do not commit:

- `.env` files or local secrets
- real customer, booking, account, payment, or business data
- local SQLite databases with real data
- backups or exports with private data
- API keys, signing material, deployment credentials, or payment credentials
- `node_modules/`, `dist/`, or native build outputs
- Android, iOS, Tauri, Linux, or desktop release artifacts

Before making the repository public, run the public release checklist and a manual review for real data, secrets, private assets, and misleading product claims.

## Troubleshooting

- Wrong Node version: run `node -v`, then `nvm use`.
- Missing Rust/Tauri: install Rust, Cargo, and the Tauri prerequisites for the host platform.
- Port `5173` in use: run `lsof -i :5173`, stop the old process, then restart `npm run app:dev`.
- Android validation: Android Studio, Android SDK, and an emulator or physical device are required.
- iOS validation: Xcode and Xcode command line tools are required when iOS is intentionally enabled.
- Browser preview: useful for quick layout checks, but it does not validate native WebView, plugin, SQLite/native storage, package permission, signing, or device-specific behavior.

## Non-Goals / Not Included

Repository access does not include:

- public SaaS service access
- live payment processing unless explicitly implemented and released
- live customer portal unless explicitly implemented and released
- cloud sync/account service unless explicitly implemented and released
- public App Store, Mac App Store, or Linux package distribution
- production/customer deployment rights
- commercial use rights
- sublicensing or redistribution rights

## Commercial Contact

Commercial access, licensing, deployment, private pilots, partnerships, and customer evaluation require written permission from Francesco Maiomascio.

Contact details will be provided through authorized commercial channels.
