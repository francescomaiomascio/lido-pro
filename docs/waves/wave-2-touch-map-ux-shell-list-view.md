# Wave 2 - Touch Map + UX Shell + List View

## Purpose

Wave 2 turns the Wave 1 proof screen into a product-style beach workflow for a non-technical user. The app now centers on map/list navigation, item selection, status changes, and a hidden diagnostics area.

## UX Problems Solved From Wave 1

- Removed prominent SQLite, fallback, and wave labels from the normal workflow.
- Replaced the diagnostic right panel with selected item details.
- Added real topbar navigation for `Mappa` and `Lista`.
- Moved diagnostics behind `Menu -> Diagnostica`.
- Added item selection and status actions.
- Added a readable list view with filters and search.
- Kept the map scrollable and pannable in constrained viewports.
- Verified umbrella labels keep the `O1` / `O2` prefix.

## Files Changed

- `src/app/AppShell.svelte`
- `src/components/layout/AppTopBar.svelte`
- `src/components/layout/AppMenuSheet.svelte`
- `src/components/layout/ViewSwitcher.svelte`
- `src/components/layout/DiagnosticsPanel.svelte`
- `src/components/beach/BeachMap.svelte`
- `src/components/beach/BeachMapItem.svelte`
- `src/components/beach/BeachItemDetailPanel.svelte`
- `src/components/beach/BeachItemList.svelte`
- `src/components/beach/BeachListRow.svelte`
- `src/components/beach/BeachLegend.svelte`
- `src/components/beach/BeachSearchBar.svelte`
- `src/lib/state/beachViewState.ts`
- `src/lib/format/beachLabels.ts`
- `src/lib/services/beachLayoutService.ts`
- `src/styles/shell.css`
- `src/styles/beach-map.css`
- `src/styles/beach-list.css`
- `src/styles/panels.css`
- `src/styles/base.css`
- `src/styles/responsive.css`

## Map Behavior

- Renders all active beach items from the loaded beach state.
- Uses metric coordinates as source of truth.
- Converts meters to rendered percentages through `layoutMath.ts`.
- Keeps the 31m x 28m map ratio.
- Uses button elements for touch selection.
- Dims non-matching items during search.
- Preserves scroll/pan behavior for smaller viewports.

## List Behavior

- Provides `Tutti`, `Palme`, `Ombrelloni`, and `Palmette` filters.
- Search applies to code, translated type, and translated status.
- Rows show code, type, status, row, number, and an `Apri` action.
- Opening a row selects the item and returns to the map workflow.

## Detail Panel Behavior

- Tablet/landscape: persistent right detail panel.
- Phone/narrow viewport: selected item appears as a bottom drawer.
- Empty state says: `Tocca una palma o un ombrellone per vedere i dettagli.`
- Status actions update the selected item through the existing repository/service layer.
- Technical coordinates are hidden behind `Mostra dettagli tecnici`.

## Diagnostics Relocation

Diagnostics now live in `Menu -> Diagnostica` and show:

- adapter mode
- loaded item count
- layout size
- database name `beach_bdf.db`
- schema version
- browser fallback warning when applicable

## Responsive Behavior

- Topbar remains fixed.
- Main workflow avoids page-level horizontal overflow.
- Map viewport scrolls internally.
- Detail panel becomes a bottom drawer on phone-sized screens.
- List view uses card rows instead of a dense table.

## Validation Results

```sh
pwd
node -v
npm -v
npm run check
npm run build
npm run cap:sync
npx cap sync android
curl -I http://localhost:5173/
node --experimental-strip-types -e "import('./src/lib/layout/metricBeachLayout.ts').then(({createInitialMetricBeachItems}) => console.log(createInitialMetricBeachItems().length))"
```

Results:

- `npm run check`: passed with 0 errors and 0 warnings.
- `npm run build`: passed.
- `npm run cap:sync`: passed.
- Direct `npx cap sync android`: passed.
- Dev server responded with HTTP 200.
- Seed validation: 58 total items, `O1-01` and `O2-10` labels present.

## Android Result

Android sync passes. Android Studio was not opened in this wave because the manual task box did not require it, and previous validation showed Android Studio was not installed at `/Applications/Android Studio.app`.

## Non-Goals

- No customers.
- No accounts.
- No payments.
- No reservations.
- No backup/export/import.
- No drag or layout edit mode.
- No login.
- No cloud services.
- No Firebase, Supabase, Ionic UI, Tailwind, Bootstrap, Material UI, Electron, Tauri, Next.js, or SvelteKit.
- No Git repository initialization.

## Next Wave Recommendation

WAVE 3 - Item Details + Operational Status Workflow.
