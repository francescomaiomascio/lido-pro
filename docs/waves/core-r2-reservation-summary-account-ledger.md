# CORE.R2 - Reservation Summary + Account Ledger

## Purpose

CORE.R2 turns the existing reservation/account/payment/extra data into a readable operational summary for one booking chain:

Customer -> Reservation -> Beach item -> Account -> Payments -> Extras.

The wave does not add a general registry, analytics, export, cloud sync, or map editing.

## Reservation Summary Read Model

The reservation summary is implemented as a projection in `src/lib/services/reservationSummaryService.ts`.

It loads the existing reservation, customer, beach item, linked account, payments, extras, tariff suggestion, totals, and timeline. The projection exposes:

- customer identity and contact data
- item code and type
- reservation type, status, start date, and end date
- account status
- total, paid, balance, payment count, and last payment date
- extras summary
- included-items boundary text
- ledger when an account is available

No permanent summary table is created.

## Account Ledger Read Model

The account ledger projection uses the existing account, payments, and account extra item tables.

It exposes:

- account, customer, reservation, and beach item
- base amount
- extras amount
- total due
- paid amount
- open balance
- payment rows
- extra rows
- account status

Payments are shown as ledger rows with amount, date, method, and optional note. Extras are shown with name, quantity, unit amount, total amount, and optional note.

## Table Relationships

The read model follows the existing relationships:

- `customers`
- `reservations`
- `beach_items`
- `accounts`
- `payments`
- `account_extra_items`
- `extra_item_catalog`

When a reservation has no direct `accountId`, the projection tries to associate the non-cancelled account for the same customer and beach item. This is a read fallback only and does not mutate data.

## Included vs Paid Extras Boundary

The current schema tracks account extras and their amount. It does not yet model a separate included/paid distinction for each extra.

CORE.R2 documents that boundary in the projection with `includedState: 'not-modeled'` and the UI copy "Extra collegati al conto. Incluso/pagato non ancora modellato."

## Customer Profile Integration

The customer profile history preview can now open a reservation summary inside the same profile panel. Recent reservations remain compact, while the expanded section shows:

- reservation summary
- linked account ledger
- timeline

This is intentionally not the future global Registro.

## Bottom Panel Integration

The selected beach item bottom panel now receives reservation/account projections from the app shell:

- Overview can show the current reservation summary and account ledger.
- Periodo uses the reservation summary when a current reservation exists.
- Conto uses the ledger when an account exists.
- Pagamenti uses the ledger payment timeline when available.

Existing focused actions remain where they were. Payment creation still belongs to the operational panel, not the global customer profile.

## UI Behavior

The new UI uses compact ledger rows, metric grids, timeline rows, and clear empty states. It avoids duplicated headings and avoids turning the ledger into a long form.

On tablet and desktop, summaries use grids where there is enough width. On phone, the same components stack into one column.

## Data And Map Preservation

No beach layout, item coordinates, item codes, seed data, or map geometry were changed. No schema migration was added.

The expected map baseline remains:

- 58 beach items
- 31m x 28m layout
- existing P/O/PM item codes

## Validation Results

Automated validation completed:

- `pwd`: `<project-directory>`
- `node -v`: `v20.20.2`
- `npm -v`: `10.8.2`
- `npm run check`: passed, 0 errors and 0 warnings
- `npm run build`: passed
- `npm run cap:sync`: passed, Android sync completed

Manual browser reload persistence was not re-run in this pass. It should still be checked with a real customer/reservation/account/payment flow before moving into CORE.R3.

## Next Recommended Wave

CORE.R3 - Registro / Storico Generale
