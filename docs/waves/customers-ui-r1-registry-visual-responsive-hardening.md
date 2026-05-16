# CUSTOMERS.UI.R1 — Customer Registry Visual + Responsive Hardening

## Purpose

This wave hardens the visual and responsive behavior of Settings -> Clienti without changing backend logic, schema, or customer read models.

## Problems Addressed

- Customer rows were too card-like and tall.
- Profile content was too linear.
- Anagrafica, activity, accounts, history, and payments had weak visual hierarchy.
- Phone layout needed a clearer list/detail flow.
- Desktop/tablet layout needed to use width more effectively.

## Layout Changes

- Registry remains inside Settings -> Clienti.
- Desktop/tablet uses a compact left list and structured right profile.
- Profile content uses a two-column grid for anagrafica/history and activity/accounts/payments.
- Phone hides the list when a customer profile is open and shows an internal “Torna alla lista clienti” action.

## Customer List Changes

- Rows are compact, divider-based rows rather than large cards.
- Selected row uses a subtle background plus left accent line.
- Row content shows name, phone/email, current activity, and balance in one compact flow.
- Balance status is text-based instead of heavy nested pills.

## Profile Changes

- Added a stronger “Scheda cliente” context line.
- Header shows customer name, phone, email, and current activity.
- Anagrafica is a label/value field table in display mode.
- Edit mode remains controlled and uses the existing form component.

## Form Changes

- Create/edit form uses a max-width detail area.
- Desktop/tablet fields use two columns where appropriate.
- Notes remain full width.
- Actions stay compact: Annulla and Salva.

## History And Account Summary

- Account summary is a compact metric grid.
- Recent reservations are compact ledger rows.
- Empty states remain short and low-noise.
- Payments are shown as compact rows and remain read-only.

## Responsive Rules

- Tablet landscape keeps list/profile side by side.
- Tablet/narrow widths collapse profile sections to one column.
- Phone uses internal list/detail behavior to avoid a long combined list/profile page.
- No horizontal overflow is expected from the customer registry controls.

## Persistence Validation

Manual browser reload validation was not executed in this environment. Required manual check:
- create customer
- reload browser
- verify customer remains
- edit customer
- reload browser
- verify edits remain

If Diagnostics reports memory fallback instead of Web SQLite persistente, persistence is blocked.

## Data/Map Preservation

- No schema changes.
- No migration changes.
- No map, seed, coordinates, item codes, item count, or layout geometry changes.

## Non-Goals

- No account ledger redesign.
- No general Registro.
- No analytics.
- No backup/export/import.
- No map redesign.
- No cloud.
- No GitHub.
- No UI library.

## Validation Results

- `npm run check`: passed
- `npm run build`: passed
- `npm run cap:sync`: passed

Build still reports the existing Vite browser compatibility warning for `crypto` imported by `jeep-sqlite`.

## Next Recommended Wave

CORE.R2 — Reservation Summary + Account Ledger
