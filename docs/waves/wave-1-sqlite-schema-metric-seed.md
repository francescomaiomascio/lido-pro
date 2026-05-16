# Wave 1 - SQLite Schema + Metric Beach Seed

## Purpose

Wave 1 moves the initial beach layout from in-memory grid data to a local SQLite persistence foundation. Coordinates and sizes are modeled in meters so rendering can scale across Android tablet and phone screens.

## Inputs From Wave 0

- Svelte + Vite + TypeScript app exists.
- Capacitor Android platform exists.
- `@capacitor-community/sqlite` and `@capacitor/filesystem` are installed.
- Custom responsive shell exists.
- No GitHub repo is initialized.

## Real Beach Dimensions

- Width: 31 meters.
- Depth: 28 meters.
- Coordinate fields: `x_m`, `y_m`, `width_m`, `height_m`, `rotation_deg`.

## Schema Summary

Database: `beach_bdf.db`

Schema version: `1`

Tables:

- `app_meta`: schema version, beach dimensions, initial seed version.
- `beach_layouts`: active beach layout, seeded as `default-layout`.
- `beach_items`: persisted item records with metric coordinates and status.
- `layout_versions`: initial version record for future layout history.

## Seed Summary

- Layout: `Spiaggia BDF`, 31m x 28m.
- Palms: 34.
- Umbrellas: 21.
- Small palms: 3.
- Total items: 58.
- Seed insertion is guarded by existing `beach_items` count for `default-layout`, so repeated initialization does not duplicate rows.
- Coordinates are approximate starting values, not final survey measurements.

## Commands Run

```sh
pwd
node -v
npm -v
npm run check
npm run build
npm run cap:sync
npx cap sync android
node --experimental-strip-types -e "import('./src/lib/layout/metricBeachLayout.ts').then(({createInitialMetricBeachItems}) => console.log(createInitialMetricBeachItems().length))"
npx cap open android
adb devices
curl -I http://localhost:5173/
```

## Validation Results

- `npm run check`: passed with 0 errors and 0 warnings.
- `npm run build`: passed.
- `npm run cap:sync`: passed.
- Direct `npx cap sync android` with Node 24 PATH: passed.
- Seed generator validation: 58 total, 34 palms, 21 umbrellas, 3 small palms, all coordinates inside 31m x 28m.
- Dev server: `http://localhost:5173/` responded with HTTP 200.
- No `.git` directory exists.
- No cloud dependency was added.

## Android / Native SQLite Status

- Native SQLite adapter exists and uses `@capacitor-community/sqlite`.
- `npx cap sync android` passes when run through Node 24.
- Android Studio launch was not performed because `/Applications/Android Studio.app` was not found.
- `adb devices` started successfully with elevated permission, but no Android device was listed.

## Browser-Dev Fallback Status

Vite browser development uses `BrowserMemoryAdapter`. This fallback is only for local development rendering and is not production persistence.

## Node Status

- Node 24.15.0 was installed with Homebrew.
- The local shell previously used a different Node.js version than the one declared by the project.
- Capacitor scripts prefix Node 24 in PATH so Capacitor 8 can run reliably in this workspace.
- Homebrew auto-update reported an unrelated stash instruction for the external `macos-fuse-t` tap. No project files were affected.

## Non-Goals

- No customers.
- No accounts.
- No payments.
- No bookings.
- No backup/export.
- No drag/edit mode.
- No cloud services.
- No authentication.
- No Firebase, Supabase, Ionic UI, Tailwind, Bootstrap, Material UI, Tauri, Electron, Next.js, or SvelteKit.

## Next Wave Recommendation

WAVE 2 - Touch Beach Map Rendering from Metric Coordinates.
