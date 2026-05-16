# CORE.R3 - Registro / Storico Generale

## Purpose

CORE.R3 adds a real global Registro under Settings -> Gestione. The Registro is the management surface for reading historical operational data across customers, reservations, beach items, accounts, payments, extras, and balances.

It is intentionally global. It is not part of the selected beach item bottom panel and it is not a customer-only profile view.

## Settings Navigation Change

Gestione now includes:

1. Clienti
2. Registro
3. Tariffe
4. Extra

The Registro label is Italian UI copy. Its subtitle is "Storico prenotazioni, conti e saldi".

## Read Model / Projection Design

The read model lives in `src/lib/services/registryService.ts` and uses existing tables through existing repositories:

- customers
- reservations
- beach_items
- accounts
- payments
- account_extra_items

No permanent registry or summary table was added. Registro records are runtime projections.

Each record exposes customer, item, reservation, account, total, paid, balance, payments count, last payment date, extras summary, and notes. Reservation rows remain visible even when no account is linked, so incomplete operational data is not hidden.

## Filters

Filters live in `src/lib/state/registryFilters.ts`.

Supported filters:

- year
- date range
- customer search
- direct customer id filter for profile linkage
- item search
- direct item id filter for operational linkage
- reservation type
- reservation status
- account status
- only open balance
- only paid
- only active reservations

Default behavior uses the current year and otherwise keeps records broadly visible.

## Summary Strip

The Registro summary strip shows:

- Prenotazioni
- Clienti
- Totale dovuto
- Incassato
- Saldo aperto
- Conti aperti

Money values use the existing euro formatter.

## Table / List Behavior

Desktop and tablet use a compact ledger-like table with:

- Cliente
- Posto / extra
- Periodo
- Totale
- Pagato
- Saldo
- Stato

Phone collapses the same data into stacked tappable rows without horizontal scrolling.

## Detail Behavior

Selecting a row opens a detail panel. Detail reuses existing CORE.R2 components:

- ReservationLedgerPanel
- AccountLedgerPanel
- ReservationSummaryCard
- PaymentTimeline
- ExtraItemsSummary

The detail can show reservation plus account ledger, or an account-only ledger when a record has no reservation.

## Customer Profile Link

Customer profile now includes "Apri nel Registro". It opens Settings -> Registro and applies a customer filter through the registry open event, without creating storage or duplicating data.

## Bottom Panel Link

The operational overview includes "Vedi nel Registro". It opens Registro filtered by the selected item and, when present, the selected customer/reservation context.

## Data And Map Preservation

No beach graphics, canvas, asset engine, layout editor, coordinates, item codes, seed data, item count, or map geometry were changed.

Expected preserved map baseline:

- 58 beach items
- 31m x 28m layout
- existing item codes

## Non-Goals

Not included in CORE.R3:

- analytics charts
- PDF/export
- backup/export/import
- POS/bar/restaurant integration
- beach layout editor
- map redesign
- cloud
- GitHub
- UI library
- schema change

## Validation Results

Automated validation:

- `npm run check`: passed, 0 errors and 0 warnings

Build, Capacitor sync, and manual browser persistence validation are tracked in the final delivery report for this wave.

## Next Recommended Wave

BACKUP.R1 - Backup / Export / Import

Reason: Registro now makes business data visible enough that the next practical risk is protecting and moving local data.
