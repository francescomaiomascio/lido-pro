# Wave 5 - Account / Payment Foundation

## Purpose

Wave 5 adds local accounts and payments on top of the existing customer assignment model.

It answers:

- quanto deve pagare questo cliente/posto?
- quanto ha pagato?
- quanto manca?
- qual e' lo stato del conto?

## Map Preservation

This wave does not modify the original beach map.

Unchanged:

- `beach_items`
- metric coordinates
- item codes
- row labels and indexes
- beach size `31m x 28m`
- seed counts

The account layer references existing `item_id`, `customer_id`, and assignment ids.

## Schema v4

Schema version is now `4`.

New tables:

- `accounts`
- `payments`

`accounts` stores local account state for one item/customer relationship. `payments` stores append-only local payment records.

## Money Rule

Money is stored only as integer cents.

Examples:

- `10000` -> `100,00 EUR`
- `4000` -> `40,00 EUR`

Helpers live in `src/lib/format/money.ts`.

## Status Rules

- total `0` and paid `0` -> `open`
- paid `0` and total `> 0` -> `open`
- paid `> 0` and paid `< total` -> `partial`
- paid `>= total` and total `> 0` -> `paid`
- cancelled -> `cancelled`

Balance is always:

`balance_amount_cents = total_amount_cents - paid_amount_cents`

## UI Behavior

The selected item inspector now includes a `Conto` section.

If no customer is assigned:

- shows `Assegna prima un cliente per creare un conto.`

If a customer exists but no account exists:

- shows `Nessun conto aperto`
- action: `Crea conto`

If an account exists:

- shows total, paid, balance, and account status
- actions: modify total, add payment, view payments, close account

Map/list indicators:

- map shows a small account marker when an item has an account
- list rows show account state or balance

## Browser Fallback

The browser memory adapter supports accounts and payments for development only. Production persistence remains Android/native SQLite.

## Non-goals

- No reservations/calendar.
- No invoices.
- No fiscal receipts.
- No online payments.
- No cloud sync.
- No backup/export/import.

## Validation Results

- `npm run check`: passed.
- `npm run build`: passed.
- `npm run cap:sync`: passed.
- `npx cap sync android`: passed with Node 24 on PATH.

## Next Wave

WAVE 6 - Reservations / Booking Foundation
