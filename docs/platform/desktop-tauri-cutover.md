# Desktop Tauri Cutover

LidoPro Desktop is now the preferred local development runtime for the product.

The frontend remains Svelte and Vite. Tauri v2 provides the desktop shell for macOS development and the same architecture prepares Linux desktop packaging. Android remains on Capacitor.

## Runtime Decision

- Primary desktop shell: Tauri v2.
- Primary local command: `npm run app:dev`.
- Single Vite endpoint: `http://localhost:5173`.
- Browser/server command: `npm run dev:server`, retained as a preview/fallback for fast UI inspection.
- Android command path: Capacitor remains active through `npm run cap:sync:android`, `npm run cap:open:android`, and `npm run cap:run:android`.
- Linux desktop: prepared in scripts and docs, but validation must run on Linux or CI before claiming Linux packages are tested.

Browser mode must not be described as the product runtime. Browser storage fallback is only a development fallback and is not production persistence.

## Preflight Results

Collected on macOS development machine during DESKTOP.R1.

| Check | Result |
| --- | --- |
| Default shell Node | `v14.18.1` |
| Default shell npm | `6.14.15` |
| Project npm via nvm | `10.8.1` with Node `v22.3.0` |
| Rust | `rustc 1.93.0 (254b59607 2026-01-19) (Homebrew)` |
| Cargo | `cargo 1.93.0 (Homebrew)` |
| Tauri CLI | `tauri-cli 2.11.2` |
| macOS | `26.3`, build `25D125` |
| Xcode command line tools | `/Applications/Xcode.app/Contents/Developer` |
| Vite dev command | `npm run dev:server` / `vite --host 0.0.0.0 --port 5173 --strictPort` |
| Build output | `dist` |
| Capacitor app id | `it.lidopro.app` |
| Capacitor web dir | `dist` |

Current frontend dependencies require a newer Node line than the default shell Node. Use the repository Node version from `.nvmrc` before running validation and packaging commands.

## Tauri Configuration

Tauri source lives in `src-tauri/`.

Current desktop identity:

- Product name: `LidoPro`
- Window title: `LidoPro`
- Identifier: `com.francescomaiomascio.lidopro`
- Frontend dev URL: `http://localhost:5173`
- Frontend dist path: `../dist`
- Initial window: `1360 x 900`
- Minimum window: `960 x 680`

The app icon set was generated from the LidoPro brand icon asset.

## Development Commands

```sh
npm run desktop:dev
```

Alias for `npm run app:dev`.

```sh
npm run app:dev
```

Runs one Vite dev server at `http://localhost:5173` and opens LidoPro Desktop through Tauri.

```sh
npm run desktop:build
```

Builds a local unsigned desktop app bundle. This is a development artifact, not a customer release build.

```sh
npm run desktop:build:mac
```

Runs the same Tauri build through a macOS-named operational alias. This is a local unsigned development artifact, not a customer release build.

```sh
npm run dev:server
```

Runs browser preview/fallback only.

## Boundaries

DESKTOP.R1 does not add:

- Electron;
- cloud services;
- account/auth services;
- payment provider SDKs;
- iOS packaging;
- signing or notarization credentials;
- production release artifacts;
- desktop durable SQLite if not already available.

Product behavior, Android behavior, and the protected active layout are unchanged.
