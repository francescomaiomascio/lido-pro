# Wave 8 - Bottom Operational Panel + Extra Items Foundation

## Purpose

Wave 8 moves the real work out of the right sidebar and into a bottom operational panel. The sidebar is now an overview of the selected posto, while customer, period, tariff, account, payment, extra, history, and technical workflows live in the bottom panel.

This wave also adds the local foundation for extra articles: Lettino, Sdraio, and Sedia.

## Sidebar Model

The right sidebar is overview-only:

- selected item code/type/status
- customer summary
- reservation/period summary
- account status
- balance
- `Apri pannello operativo`

Long forms and technical details are no longer mounted in the sidebar.

## Bottom Panel

The bottom operational panel is a normal app layout row, not a floating debug drawer. It opens for the selected item and uses internal scrolling.

Tabs:

- Overview
- Cliente
- Periodo
- Tariffa
- Conto
- Pagamenti
- Extra
- Storico
- Tecnico

The map/list workspace resizes above it, so the page itself does not become a long scroll.

## Schema V7

Migration to schema version 7 adds:

- `extra_item_catalog`
- `account_extra_items`

Runtime-safe account columns were added:

- `base_amount_cents`
- `extras_amount_cents`

Existing account totals are preserved by initializing `base_amount_cents` from the current total when needed.

## Extra Catalog

Seeded once if no active extra catalog entries exist:

- Lettino
- Sdraio
- Sedia

Default prices are `0` cents because exact prices were not provided.

## Account Total Behavior

The account model now separates:

- base/tariff amount
- extra amount
- total amount
- paid amount
- balance

Current rule:

```txt
total = base_amount_cents + active account_extra_items total
balance = total - paid
```

Payments remain append-only and are not deleted when extras change.

## Map Preservation

Wave 8 does not modify:

- beach item count
- coordinates
- row labels
- item codes
- beach layout dimensions
- seed layout logic

The original 58-item map remains preserved.

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

- `npm run check`: passed
- `npm run build`: passed
- `npm run cap:sync`: passed
- direct Capacitor Android sync with Node 24 path: passed
- Git repo check: no Git repository initialized

Environment note:

- default shell `node -v` reports Node `v20.20.2`
- the existing `cap:sync` script uses Node 24 path for Capacitor sync

## Non-Goals

- no backup/export/import
- no reports or PDF
- no cloud
- no login
- no GitHub
- no UI kit
- no map layout editing
- no beach item reseed

## Next Wave

Recommended next wave:

```txt
WAVE 9 - Backup / Export / Import
```
