# Repository Structure

Canonical repository name:

```text
lido-pro
```

LidoPro uses a lightweight monorepo structure. Svelte/Vite, Capacitor Android, Tauri Desktop, asset tooling, docs, and scripts intentionally live in one repository.

## Canonical Root Folders

| Path | Role |
| --- | --- |
| `src/` | Svelte application source: app shell, components, domain logic, styles, assets, and runtime helpers. |
| `public/` | Static public assets loaded by the frontend, including brand assets and web-visible static files. |
| `android/` | Capacitor Android native shell. This is source for the Android wrapper, not generated output as a whole. |
| `src-tauri/` | Tauri Desktop native shell for LidoPro Desktop. Source/config/icons are canonical; `target/` output is generated. |
| `asset-lab/` | Internal asset generation and rendering pipeline. Output folders are generated unless explicitly promoted. |
| `docs/` | Product, platform, commercial, legal, repository, architecture, and delivery-wave documentation. |
| `scripts/` | Local development, validation, and repository hygiene helper scripts. |

## Canonical Root Files

| Path | Role |
| --- | --- |
| `package.json` / `package-lock.json` | npm project metadata, dependency lockfile, and development scripts. |
| `vite.config.ts` | Svelte/Vite frontend build configuration. |
| `capacitor.config.ts` | Capacitor Android web/native bridge configuration. |
| `tsconfig*.json` | TypeScript project configuration. |
| `README.md` | Public-facing project overview and current development workflow. |
| `LICENSE.md`, `COMMERCIAL.md`, `NOTICE.md`, `TRADEMARK.md`, `SECURITY.md`, `CONTRIBUTING.md` | Proprietary commercial/source-available repository boundary. |

## Generated Or Local-Only Folders

The following are not canonical source and must not be committed:

- `node_modules/`
- `dist/`
- `dist-ssr/`
- `build/`
- `.vite/`
- `.svelte-kit/`
- `android/.gradle/`
- `android/**/build/`
- `android/app/src/main/assets/public/`
- `android/app/src/main/assets/capacitor.config.json`
- `src-tauri/target/`
- `src-tauri/gen/schemas/`
- `asset-lab/output/`
- local backup/export folders
- local databases
- generated release artifacts

## Generated Artifact Status

`git ls-files` was checked during REPO.CANON.R1 for:

- `dist/`
- `node_modules/`
- `android/**/build/`
- `src-tauri/target/`
- `*.db`, `*.sqlite`, `*.sqlite3`
- `*.apk`, `*.aab`, `*.dmg`, `*.AppImage`, `*.deb`, `*.rpm`, `*.msi`, `*.exe`

No tracked generated artifacts were found in those categories. The folders may exist locally after builds and validation, but they are ignored.

## Naming Boundary

Current product-facing naming must use:

- `LidoPro` for the product.
- `lido-pro` for the repository.
- `LidoPro Desktop` for the Tauri desktop shell.
- `LidoPro Mobile` for Android/mobile packaging.
- `Lido Studio` / `Studio Mappa` for the map/design module.

Historical `Beach BDF` or `beach-bdf` references are allowed only in old wave notes, migration notes, or explicitly historical/local context.
