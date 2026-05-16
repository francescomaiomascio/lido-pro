# Wave 8B - Visual System / Menu / Onboarding / Responsive Pass

## Purpose

Wave 8B refines the app shell and visual system without changing schema or business logic.

Focus areas:

- topbar rebuild
- menu redesign
- onboarding / empty state inside the bottom panel
- neutral and dark theme consistency
- floating focus card polish
- bottom panel visual cleanup
- responsive behavior for tablet and phone

## Visual Problems Solved

- topbar was still too basic and loosely aligned
- menu felt like a stack of old buttons instead of a structured app sheet
- no-item-selected state was too empty and non-guiding
- surfaces used similar but inconsistent greys
- floating card still felt partially like a detached sidebar
- tablet and phone behavior needed clearer hierarchy

## Topbar Changes

- title area now includes `Beach BDF` with a smaller product subtitle
- `Mappa / Lista` are grouped as a proper segmented control
- search is integrated in the central area
- `Filtri` and `Menu` are consistent action buttons
- spacing and materials were normalized to a single chrome row

## Menu Changes

Menu is now organized as a structured app sheet with sections:

- Gestione
- Spiaggia
- Sistema

Rows are action-oriented and include short supporting copy.

The filter action now opens a dedicated filter sheet instead of relying on an ad hoc legacy popover pattern.

## Intro Banner Behavior

When no item is selected, the bottom operational panel shows an intro banner:

- app title
- short operational guidance
- quick actions for lista, filtri, tariffe, extra
- quiet local/offline context

No SQLite or development diagnostics are shown there.

## Theme Behavior

- neutral remains the default theme
- dark theme remains available
- tokens were refined for:
  - app background
  - topbar
  - menu sheet
  - filter sheet
  - floating focus card
  - bottom panel
  - list rows
- no schema or data behavior was changed

## Floating Card Polish

The floating focus card now behaves more like embedded map context:

- lighter elevated surface
- compact title/status layout
- shorter supporting rows
- one clear primary CTA
- less visual weight than the previous legacy card feel

On phone the card remains suppressed in favor of the bottom panel flow.

## Bottom Panel Polish

- cleaner header and tabs
- more coherent active/inactive tab language
- intro state for no selection
- forms inherit more consistent visual tokens
- primary and destructive actions are more distinct

## Responsive Behavior

Tablet landscape:

- topbar stays on one row
- map remains primary
- floating focus card stays compact
- menu and filter sheet behave like structured overlays

Phone portrait:

- topbar compresses without horizontal overflow
- search becomes narrower
- filter sheet becomes a bottom sheet
- menu becomes a full-height sheet
- bottom panel remains the primary workflow surface

## Map Preservation Checks

Wave 8B does not modify:

- beach item seed
- item coordinates
- item count
- codes
- row labels
- layout size
- map geometry

The 58-item beach layout remains unchanged.

## Validation Results

Commands run:

```txt
pwd
node -v
npm -v
npm run check
npm run build
npm run cap:sync
npx cap sync android
```

Results:

- `npm run check` passed
- `npm run build` passed
- `npm run cap:sync` passed
- direct Android sync with Node 24 path passed

## Non-Goals

- no new DB schema
- no new business feature
- no backup/export/import
- no report/PDF
- no map item redesign
- no coordinate editing
- no cloud
- no GitHub
- no UI library

## Next Wave

Recommended next wave:

```txt
WAVE 9 - Backup / Export / Import
```
