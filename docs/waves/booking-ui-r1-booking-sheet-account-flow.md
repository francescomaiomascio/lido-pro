# BOOKING.UI.R1 - Scheda Prenotazione Operativa

## Purpose

BOOKING.UI.R1 turns the selected-place bottom panel into a real booking sheet. FLOW.R1 fixed the operational sequence; this wave changes the visible workflow so it reads as customer, period, equipment, account, and payments for the selected beach item.

## Issues Left By FLOW.R1

- The panel still looked like a technical row list.
- `Economia` was the wrong label for the account area.
- Registry and technical details were primary rows instead of secondary actions.
- Customer, period, extras, and payments did not read as one reservation.
- Account state was present, but not composed as the final booking summary.

## Booking Sheet Structure

The expanded selected-item panel now renders `BookingSheet.svelte`.

Structure:

- Compact header with item code, type, status, optional customer, optional balance.
- Header icon actions for registry and technical info.
- Customer block.
- Period block.
- Dotazioni block.
- Conto block with payment progress.
- Compact payment summary under the account area.

No primary `Tariffa`, `Registro`, or `Tecnico` rows are shown in the booking sheet.

## Customer Block

The customer area shows either:

- `Nessun cliente assegnato` with `Assegna cliente`.
- Customer name with `Cambia`.

The inline editor remains compact. Customer row tap still assigns directly, closes the customer step, and advances to `Periodo`.

## Period Block

The period area shows:

- `Assegna prima un cliente` when blocked.
- `Non impostato` when customer exists but reservation is missing.
- Reservation type and Italian date range when present.

Saving the period keeps FLOW.R1 behavior: reservation save plus automatic account ensure from tariff/period/item.

## Dotazioni / Extra

`Dotazioni` summarizes:

- Included equipment from `tariff_included_items`.
- Paid extras from `account_extra_items`.

Included items do not affect account total. Paid extras remain editable through the focused extra editor.

## Conto / Payments

`Conto` replaces `Economia`.

The account block shows:

- Dovuto.
- Pagato.
- Saldo.
- Tariff support text only when relevant.
- Payment count and last payment.
- Payment progress bar.

Payments are handled inside the account flow through `Aggiungi pagamento`; they are not a separate primary row.

## Registry / Technical Actions

Registry and technical details are secondary header actions:

- Registry opens the filtered registry view for item/customer/reservation context.
- Technical info opens a small popover with item id, layout id, coordinates, and dimensions.

Technical details are hidden by default.

## Toast Behavior

This wave does not reintroduce persistent success bars. Existing FLOW.R1 toast behavior remains the success feedback path for customer assignment, reservation/account updates, payments, and extras.

## Responsive Behavior

Desktop and tablet use a compact booking-sheet layout with account information separated from the main customer/period/equipment flow. Narrow widths collapse to one column with one editor open at a time.

## Data / Map Preservation

No map layout, coordinates, seed data, item count, item codes, or beach geometry were changed. This wave is UI refactor only and does not add schema.

## Validation Results

Validation run for this wave:

- `npm run check`
- `npm run build`
- `npm run cap:sync`

## Next Recommended Wave

Recommended next wave:

- `PAYMENTS.R1 - Installments / Rate Schedule UI`

Alternative:

- `BOOKING.UI.R2 - Booking Sheet Polish / Tablet QA`
