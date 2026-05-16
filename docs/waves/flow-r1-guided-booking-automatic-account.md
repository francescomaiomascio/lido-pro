# FLOW.R1 — Guided Booking Flow + Automatic Account

## Purpose

FLOW.R1 turns the bottom panel into a guided operational flow:

1. assign customer
2. set period
3. create/update the account automatically from tariff data
4. show due, paid and balance
5. manage payments and paid extras on the generated account

Map data is preserved. This wave does not alter `beach_items`, item count, coordinates, item codes, or the 31m x 28m layout.

## Customer Assignment Flow

The customer editor is compact and direct. Rows primarily show the customer name, with phone/email as secondary text. Tapping a row assigns the customer without a separate per-row assign button, closes the customer step, shows the `Cliente assegnato` toast, and advances to `Periodo`.

## Period And Account Automation

Saving a period now calls the booking flow service. The service creates or updates the reservation, infers the tariff from item type and reservation type, creates the account if missing, links the reservation to the account, and recalculates the balance from existing payments.

Seasonal umbrella defaults to the tariff rule `Ombrellone stagionale`, currently 600,00 €.

## Tariff/Internal Account Behavior

Tariff is no longer a visible operational row. It appears only inside the economy editor as a suggestion such as `Da tariffario: Ombrellone stagionale · 600,00 €`.

Accounts remain editable. Existing payments are preserved. If an account already has payments, tariff changes do not silently overwrite the due amount.

## Included Equipment Model

Schema v8 adds `tariff_included_items`. Included equipment is seeded as configurable data:

- palm seasonal: Lettino x2, Sdraio x1, Poltroncina x1
- small_palm seasonal: Lettino x2, Sdraio x1, Poltroncina x1
- umbrella seasonal: Lettino x1, Sdraio x1

`Poltroncina` is also seeded into `extra_item_catalog` when missing. Included equipment does not increase account totals.

## Payment Schedule Foundation

Schema v8 adds:

- `payment_schedules`
- `payment_installments`

The backend exposes a manual/monthly/custom schedule foundation. Advanced schedule UI is deferred.

## Payment Progress UI

The economy editor shows due, paid, balance, and a compact progress bar such as `300,00 € / 600,00 €` and `50%`.

## Toast Behavior

Persistent success bars are replaced by `AppToast.svelte` and `toastState.ts`. Toasts are small, non-blocking, and auto-dismiss after roughly 1500 ms.

## Validation Results

Executed:

- `pwd` -> `/Users/francescomaiomascio/Developer/beach-bdf`
- `node -v` -> `v20.20.2`
- `npm -v` -> `10.8.2`
- `npm run check` -> passed
- `npm run build` -> passed
- `npm run cap:sync` -> passed; the script builds and runs `npx cap sync android` with the Node 24 path

Static preservation check:

- `BEACH_WIDTH_M = 31`
- `BEACH_DEPTH_M = 28`
- row counts remain 8 + 9 + 9 + 8 + 11 + 10 + 3 = 58

## Next Recommended Wave

`PAYMENTS.R1 — Installments / Rate Schedule UI`

Alternative: `REGISTRY.UI.R1 — Registro UX / Visual Hardening`
