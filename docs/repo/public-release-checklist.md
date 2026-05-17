# Public Release Checklist

Run this checklist before making the repository public.

## Legal And Commercial Boundary

- [ ] `LICENSE.md` is present and proprietary/source-available.
- [ ] `README.md` says LidoPro is not open source.
- [ ] `COMMERCIAL.md` is present.
- [ ] `NOTICE.md` is present.
- [ ] `TRADEMARK.md` is present.
- [ ] `SECURITY.md` is present.
- [ ] `CONTRIBUTING.md` is present.
- [ ] Commercial use requires written permission.
- [ ] No hosting/SaaS/white-label/resale rights are granted.
- [ ] No production/customer deployment rights are granted.

## Sensitive Files

- [ ] No `node_modules/` folder is tracked.
- [ ] No `dist/` or generated Vite build output is tracked.
- [ ] No Android build output is tracked.
- [ ] No Tauri/Rust `src-tauri/target/` output is tracked.
- [ ] No `.env` files are tracked.
- [ ] No secrets, tokens, API keys, passwords, or private keys are tracked.
- [ ] No certificates, signing keys, keystores, provisioning profiles, or deployment credentials are tracked.
- [ ] No SQLite/database files with real data are tracked.
- [ ] No backup JSON with real data is tracked.
- [ ] No Android/iOS release artifacts are tracked.
- [ ] No desktop release packages are tracked (`.dmg`, `.app`, `.AppImage`, `.deb`, `.rpm`, `.msi`, `.exe`).
- [ ] No generated commercial release packages are tracked.

## Repository Structure

- [ ] Canonical repository name is `lido-pro`.
- [ ] Product-facing docs use `LidoPro`.
- [ ] `src/` is treated as application source.
- [ ] `android/` is treated as the Capacitor Android shell.
- [ ] `src-tauri/` is treated as the Tauri Desktop shell.
- [ ] `asset-lab/` is treated as internal asset tooling.
- [ ] `docs/` is indexed by `docs/README.md`.
- [ ] Generated artifacts are ignored by `.gitignore`.

## Data And Claims

- [ ] No real customer data is present.
- [ ] No payment data is present.
- [ ] No phone numbers, email addresses, customer names, or private establishment details are present unless intentionally fictional/dev.
- [ ] No misleading production-ready claims are present.
- [ ] No fake live cloud/payment/account/customer portal claims are present.
- [ ] No copyrighted third-party assets are present without rights.
- [ ] Remaining `Beach BDF` references are historical/local/private only.
- [ ] Product-facing surfaces use LidoPro terminology.
