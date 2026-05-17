# REPO.CANON.R1 - Repository Canonization

## Purpose

REPO.CANON.R1 documents and hardens the LidoPro repository structure before more platform, feature, or publication work.

The goal is not to change product behavior. The goal is to make the repository readable, source-available/public-preparable, and clear about what is canonical source versus generated output.

## Canonical Root Structure

```text
lido-pro/
├── android/          # Capacitor Android native shell
├── asset-lab/        # internal asset generation pipeline
├── docs/             # product, platform, repo, legal, commercial, wave docs
├── public/           # static public assets
├── scripts/          # local validation/build/helper scripts
├── src/              # Svelte application source
├── src-tauri/        # Tauri Desktop shell
├── package.json
├── package-lock.json
├── capacitor.config.ts
├── vite.config.ts
├── tsconfig*.json
├── README.md
├── LICENSE.md
├── COMMERCIAL.md
├── NOTICE.md
├── TRADEMARK.md
├── SECURITY.md
└── CONTRIBUTING.md
```

## Generated Artifact Policy

Generated/local folders and release artifacts must stay out of commits:

- `node_modules/`
- `dist/`
- `android/**/build/`
- `src-tauri/target/`
- `src-tauri/gen/schemas/`
- local databases
- local backups/exports
- release bundles such as `.dmg`, `.app`, `.apk`, `.aab`, `.AppImage`, `.deb`, `.rpm`

## Naming Policy

Use:

- `LidoPro` for product-facing text.
- `lido-pro` for the repository.
- `LidoPro Desktop` for Tauri desktop.
- `LidoPro Mobile` for Android/mobile.
- `Lido Studio` / `Studio Mappa` for the design/map module.

Historical `Beach BDF` references are allowed only in old wave docs and migration context.

## Validation Scope

This wave validates:

- repository structure docs;
- `.gitignore` coverage;
- generated artifact tracking status;
- script naming clarity;
- public release checklist additions;
- scan script reporting.

## Non-Goals

- No UI redesign.
- No product behavior changes.
- No database schema changes.
- No app id or bundle id migration.
- No cloud/payment/account/auth implementation.
- No repository publishing.
- No generated release artifact promotion.
