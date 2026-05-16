# Wave 3.2 - Flat Product UI + Map Controls Refactor

## Purpose

Wave 3.2 removes the dashboard/card-stack feeling and turns the map into the primary operational work surface.

## User Feedback Addressed

- Too many cards inside cards.
- Too many visible borders and shadows.
- Duplicate status/count/filter controls.
- Map dimensions were visible in the primary UI.
- Sidebar felt like a debug panel.
- Map needed real zoom, pan, fit, and reset controls.

## Visual System Changes

- Flattened topbar, command strip, map, list, inspector, and menu.
- Replaced boxed rows with simple dividers where possible.
- Removed repeated shadows and heavy nested borders.
- Kept strong selected states and clear touch targets.

## Redundancy Removal

- App name appears only in the topbar.
- View selection appears only in the topbar.
- Search appears only in the topbar.
- Status/count controls appear only in the command strip.
- Map dimensions are no longer shown in the primary map.
- Diagnostics remain only in `Menu -> Diagnostica`.

## Topbar Changes

- One clean topbar row.
- Integrated tabs, quiet search field, and simple menu button.
- No separate card around each topbar control.

## Command Strip Changes

- Status summary chips are now clickable filters.
- Management type filter remains in the same compact strip.
- Removed the separate status filter row from the visible workflow.

## Map Surface Changes

- Removed map header and legend row.
- Map fills the workspace as an operational surface.
- Technical dimensions moved to `Menu -> Info spiaggia`.
- Search/filter result count appears only as a small overlay when active.

## Zoom / Pan / Fit

Added:

- `src/components/beach/BeachMapControls.svelte`
- `src/lib/layout/mapViewportState.ts`
- `src/lib/layout/mapTransform.ts`

Controls:

- Zoom -
- Zoom +
- Fit
- Reset

Mouse wheel zoom and pointer drag pan are supported. Tapping an item still selects it. Item coordinates remain metric data; zoom and pan are render-only transforms.

## Detail Inspector Changes

- Right panel is flatter and uses simple sections/dividers.
- Field rows are no longer boxed cards.
- Notes, actions, history, and technical details are more compact.

## Menu Changes

- Menu sheet is a simple side panel.
- Info spiaggia contains beach dimensions and counts.
- Diagnostica contains database/schema/adapter details.

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
- `.git` directory is absent.

## Non-Goals

- No customers.
- No accounts.
- No payments.
- No reservations.
- No backup/export/import.
- No layout edit or item dragging.
- No database schema change.
- No UI libraries or cloud services.

## Next Wave Recommendation

WAVE 4 - Customer Assignment Foundation.
