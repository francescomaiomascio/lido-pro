# Wave 3.3 - Single Topbar + Dark/Neutral Theme + Filter Refactor

## Purpose

Wave 3.3 cleans the upper layout before customer work starts. The app now has one topbar, no second command strip, neutral/dark themes, and filters moved into the side inspector.

## User Feedback Addressed

- Removed the second top strip of totals and filters.
- Added dark/neutral theme support.
- Made search shorter and quieter.
- Moved summary and filters into the sidebar/inspector.
- Kept technical map dimensions out of the primary map UI.
- Preserved map/list/search/status/note/history behavior.

## Theme Changes

Created:

- `src/lib/theme/themeStore.ts`
- `src/lib/theme/themeTokens.ts`

Themes:

- `neutral` default
- `dark`

The app root applies `data-theme`, and the selected theme is saved in `localStorage`.

## Topbar Changes

The single topbar contains:

- Beach BDF
- Mappa / Lista
- compact search
- theme toggle
- Menu

There is no dedicated command strip below it.

## Moved Filters And Summary

Created `src/components/beach/BeachFilterPanel.svelte`.

The side inspector now contains:

- Riepilogo
- Gestione: Tutti / Giornaliero / Stagionale
- Stato: Tutti / Liberi / Occupati / Prenotati / Manutenzione

When an item is selected, the detail inspector remains visible and the filters stay below it in compact form.

## Sidebar/Menu Restructuring

The sidebar uses sections and dividers rather than card stacks. Menu content remains split between user-facing `Info spiaggia` and technical `Diagnostica`.

## Removed Redundancies

- App name appears only in topbar.
- View switch appears only in topbar.
- Search appears only in topbar.
- Status/filter controls are not repeated above the map.
- Map dimensions are not visible in primary map UI.
- Diagnostics remain behind Menu.

## Validation Results

```sh
pwd
PATH=/opt/homebrew/bin:/opt/homebrew/opt/node@24/bin:$PATH node -v
PATH=/opt/homebrew/bin:/opt/homebrew/opt/node@24/bin:$PATH npm -v
npm run check
npm run build
npm run cap:sync
PATH=/opt/homebrew/bin:/opt/homebrew/opt/node@24/bin:$PATH npx cap sync android
curl -I http://localhost:5173/
```

Results:

- `npm run check`: passed with 0 errors and 0 warnings.
- `npm run build`: passed.
- `npm run cap:sync`: passed.
- direct `npx cap sync android`: passed.
- dev server responded with HTTP 200.

## Non-Goals

- No customers.
- No accounts.
- No payments.
- No reservations.
- No database schema change.
- No cloud services.
- No external UI kit.
- No Git repository initialization.

## Next Wave Recommendation

WAVE 4 - Customer Assignment Foundation.
