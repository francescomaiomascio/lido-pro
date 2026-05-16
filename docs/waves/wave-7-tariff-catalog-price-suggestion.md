# Wave 7 - Tariff Catalog + Price Suggestion Foundation

## Purpose

Wave 7 adds a local editable tariff catalog and uses it to suggest account totals.

Tariffs are data, not hardcoded business logic.

## Schema v6

Schema version is now `6`.

New table:

- `tariff_rules`

The migration is idempotent and does not reset beach items, reservations, customers, accounts, or payments.

## Seed Tariffs

Initial active seasonal tariffs are seeded only when no active tariff rule exists.

- Palma prima fila `P1`: `1500,00 EUR`
- Palma seconda fila `P2`: `1000,00 EUR`
- Palma terza fila `P3`: `800,00 EUR`
- Palma quarta fila `P4`: `700,00 EUR`
- Ombrellone stagionale `O1/O2`: `600,00 EUR`
- Palmetta stagionale `PM`: `800,00 EUR`

Amounts are stored as integer cents.

## Matching Priority

Price suggestion uses:

1. exact `item_type + row_label + reservation_type`
2. fallback `item_type + reservation_type` with no row label
3. no match -> `0` and confidence `none`

## Account Integration

When opening an account, the total is prefilled from the suggested tariff if available.

Existing account totals are not overwritten automatically. If the suggested tariff differs, the UI shows it separately and requires an explicit action.

## UI

Menu -> `Tariffe` opens the tariff panel.

The panel shows active tariff rules with:

- name
- item category
- row/label
- reservation type
- amount
- edit action

## Map Preservation

No map layout, seed, coordinates, codes, or counts were changed.

## Non-goals

- No extra articles.
- No lettini/sdraio/sedie.
- No invoices or receipts.
- No online payments.
- No cloud sync.

## Validation Results

- `npm run check`: passed.
- `npm run build`: passed.
- `npm run cap:sync`: passed.
- `npx cap sync android`: passed with Node 24 on PATH.

## Next Wave

WAVE 8 - Extra Items / Lettini / Sdraio / Sedie Foundation
