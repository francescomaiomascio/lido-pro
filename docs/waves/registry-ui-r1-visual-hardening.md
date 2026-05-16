# REGISTRY.UI.R1 - Registro UX / Visual Hardening

## Purpose

REGISTRY.UI.R1 hardens the existing Registro interface after CORE.R3. The goal is visual and responsive clarity only: keep the registry projection intact, but make the screen read like a professional operational ledger.

## Visual Issues Addressed

The CORE.R3 Registro worked, but the composition was too heavy:

- filters, summary, table, detail, and empty states competed in the same space
- filters consumed too much vertical height
- summary metrics looked like bulky cards
- rows felt closer to admin cards than ledger rows
- detail occupied attention even before a user selected a row
- mobile and tablet views needed a stronger list/detail hierarchy

## Layout Changes

The Registro now follows this hierarchy:

1. Header with title, subtitle, record count, and mobile filter trigger
2. Compact filter bar
3. Compact metric strip
4. Ledger table/list
5. Detail area only after a row is selected

The panel no longer auto-selects the first row after loading or filtering. This keeps the ledger focused until the user explicitly opens a record.

## Filter Compaction

Common filters stay visible on desktop/tablet:

- Anno
- Cliente
- Conto
- Reset

Advanced filters are collapsed behind "Filtri avanzati":

- Dal
- Al
- Posto
- Tipo
- Prenotazione
- Saldo aperto
- Solo pagati
- Prenotazioni attive

On narrow screens, the whole filter area is hidden behind the "Filtri" action.

## Summary Strip

The summary area is now a compact strip with subtle separators instead of large boxed metric cards.

Metrics remain:

- Prenotazioni
- Clienti
- Dovuto
- Incassato
- Saldo aperto
- Conti aperti

## Table / List Behavior

Desktop and tablet use dense ledger rows with aligned money columns:

- Cliente
- Posto / extra
- Periodo
- Totale
- Pagato
- Saldo
- Stato

Phone uses stacked rows with the same data, avoids horizontal overflow, and opens detail as a list/detail state.

## Detail Behavior

When no row is selected, Registro shows only a small hint:

"Seleziona una riga per vedere il dettaglio."

When a row is selected, detail uses the existing reservation/account ledger components. On phone, the selected detail replaces the list and exposes an "Indietro" action.

## Responsive Behavior

Desktop:

- compact filters
- horizontal summary strip
- spreadsheet-like rows
- side detail when selected

Tablet:

- denser table/list behavior
- detail stacks below when width is constrained

Phone:

- filters collapsed
- list first
- detail view after row tap
- no horizontal table overflow

## Non-Goals

Not included:

- backup/export/import
- analytics charts
- PDF/report
- new business logic
- schema changes
- map/editor work
- cloud
- GitHub
- UI library

## Data And Map Preservation

No database schema, seed, beach items, coordinates, item codes, layout size, map geometry, or registry read-model storage changed.

Expected preserved baseline:

- 58 beach items
- 31m x 28m layout
- existing item codes

## Validation Results

Automated validation:

- `pwd`: `<project-directory>`
- `node -v`: `v20.20.2`
- `npm -v`: `10.8.2`
- `npm run check`: passed, 0 errors and 0 warnings

Build and Capacitor sync are reported in the final delivery message.

## Next Recommended Wave

BACKUP.R1 - Backup / Export / Import
