# Wave 6 - Reservations / Booking Foundation

## Purpose

Wave 6 adds local reservation periods on top of beach items, customers, assignments, accounts, and payments.

It answers:

- who reserved this place
- for which period
- whether the place is already reserved in those dates
- whether the reservation is daily or seasonal

## Schema v5

Schema version is now `5`.

New table:

- `reservations`

The migration is idempotent and does not reset beach items, customers, assignments, accounts, or payments.

## Map Preservation

This wave does not modify the original beach map.

Unchanged:

- 58 beach items
- item codes
- row labels and indexes
- metric coordinates
- item sizes
- beach size `31m x 28m`
- seed generation

Reservations reference existing `item_id`, `customer_id`, optional assignment id, and optional account id.

## Period Rules

Dates are stored as ISO date strings: `YYYY-MM-DD`.

Date ranges are inclusive.

Defaults:

- daily: today -> today
- seasonal: June 1 -> August 31 of the current year

## Overlap Validation

A conflict exists when:

- the reservation is for the same item
- reservation is active
- status is `draft` or `active`
- date ranges overlap

Cancelled and completed reservations do not block new periods.

Conflict message:

`Il posto è già prenotato in questo periodo.`

## Customer Assignment Integration

Reservation type defaults from the active assignment:

- daily assignment -> daily reservation
- seasonal assignment -> seasonal reservation

The app does not silently create reservations during assignment. The operator confirms the period in the `Periodo` section.

## Account Boundary

A reservation may link to the active account if one exists.

Wave 6 does not create payments, update tariffs, or change account totals automatically.

## UI Behavior

The selected item inspector includes a `Periodo` section.

If no customer is assigned:

- shows `Assegna prima un cliente per creare una prenotazione.`

If no active reservation exists:

- shows `Nessuna prenotazione attiva`
- action: `Crea prenotazione`

If a reservation exists:

- shows type, date range, status, and notes
- actions: modify period, cancel reservation

Map/list indicators show reservation state without changing the layout.

## Non-goals

- No full calendar UI.
- No tariff editor.
- No extra items.
- No invoices or receipts.
- No online payments.
- No cloud sync.

## Validation Results

- `npm run check`: passed.
- `npm run build`: passed.
- `npm run cap:sync`: passed.
- `npx cap sync android`: passed with Node 24 on PATH.

## Next Wave

WAVE 7 - Tariff Catalog + Price Suggestion Foundation
