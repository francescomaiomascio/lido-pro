# File Ownership Map

This map describes ownership by folder and expected change scope. It is a repository hygiene guide, not a permission system.

## Application Source

| Path | Ownership |
| --- | --- |
| `src/app/` | Application shell orchestration and top-level Svelte app composition. |
| `src/components/` | UI components grouped by product surface: layout, map canvas, settings, booking, customers, registry, tariffs. |
| `src/lib/` | Domain logic, services, database adapters, formatting helpers, runtime/platform helpers, pricing, layout math, and map-canvas logic. |
| `src/styles/` | Global styles, feature styles, design tokens, responsive rules, forms, shell, and module-specific CSS. |
| `src/assets/` | Application-consumed assets bundled by Vite, including generated beach assets and asset library material. |

## Native Shells

| Path | Ownership |
| --- | --- |
| `android/` | Capacitor Android native shell and Android build configuration. Keep Android source/config; ignore build output. |
| `src-tauri/` | Tauri Desktop shell, Rust entrypoint, Tauri configuration, permissions, and desktop icons. Keep source/config/icons; ignore generated `target/` and schema output. |

## Local Tooling Scripts

| Path | Ownership |
| --- | --- |
| `scripts/tauri-dev.sh` | Tauri desktop development launcher used by `npm run app:dev`. Extend this script for local Linux WebKitGTK or shell environment fixes instead of changing the product runtime. |
| `scripts/cap-open-android.sh` | Android Studio launcher resolver used by `npm run cap:open:android`. Extend this script for Android Studio path detection instead of duplicating launcher logic. |

## Generated And Runtime Output

| Path or Pattern | Policy |
| --- | --- |
| `dist/` | Vite build output. Do not commit. |
| `node_modules/` | npm dependency install output. Do not commit. |
| `android/**/build/` | Android/Gradle build output. Do not commit. |
| `src-tauri/target/` | Rust/Tauri build output, including `.app` and `.dmg`. Do not commit. |
| `*.db`, `*.sqlite`, `*.sqlite3` | Local databases. Do not commit. |
| `backups/`, `local-backups/`, `exports/`, `local-exports/` | Runtime/export artifacts. Do not commit. |

## Assets

| Path | Ownership |
| --- | --- |
| `asset-lab/` | Internal generation pipeline, manifests, scripts, and source work for assets. |
| `asset-lab/output/` | Generated asset-lab output. Do not commit unless explicitly promoted and reviewed. |
| `src/assets/beach-generated/` | App-consumed generated beach assets that have been promoted into source. |
| `src/assets/beach-library/` | Curated asset library and licensing metadata. |
| `public/brand/` | LidoPro brand assets used by the app, README, favicon, and static public surfaces. |
| `public/assets/` | Static public app assets. |

## Documentation

| Path | Ownership |
| --- | --- |
| `docs/brand/` | Product naming and brand identity rules. |
| `docs/product/` | Product scope, boundaries, and current capability documentation. |
| `docs/platform/` | Desktop, Android, browser preview, storage, macOS, Linux, and future platform boundaries. |
| `docs/repo/` | Repository structure, public/source-available policy, hygiene, release checklist, and scan policy. |
| `docs/legal/` | Commercial/legal boundary notes and distribution state documentation. |
| `docs/commercial/` | Commercial readiness index and product/business boundary notes. |
| `docs/waves/` | Delivery wave records, including historical notes. |
| `docs/architecture/` | Architecture and local-first design notes. |
