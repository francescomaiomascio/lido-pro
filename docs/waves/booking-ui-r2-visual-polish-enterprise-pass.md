# BOOKING.UI.R2 - Booking Sheet Visual Polish / Enterprise Pass

## Purpose

BOOKING.UI.R2 polishes the booking sheet introduced in BOOKING.UI.R1 without changing booking logic, schema, data, or map behavior.

## Visual Issues Addressed

- Typography was too heavy across labels, values, and action rows.
- Booking blocks still felt like rough prototype sections.
- The account area did not have enough financial hierarchy.
- Dotazioni and extras were readable but not product-grade.
- The technical popover was too bulky.
- Inline editors still looked like dropped-in forms.

## Topbar Refinement

The compact booking context bar remains the primary direction. Styling was tightened around spacing, typography weight, icon button size, and divider rhythm.

## Booking Layout Refinement

The sheet keeps the BOOKING.UI.R1 structure:

- Left: Cliente, Periodo, Dotazioni.
- Right: Conto and payment summary.
- Secondary actions: Registro and Info tecnico as icons.

Spacing and section density were reduced to avoid unused areas and card-like bulk.

## Typography Changes

Labels are now smaller and more muted. Values use medium weight instead of broad heavy bold. Key totals and item identity remain stronger.

## Button / Action Hierarchy

Action buttons are quieter and more aligned with their blocks. Primary editor buttons no longer appear as large heavy green actions by default.

## Conto Block Polish

The account block now presents Dovuto, Pagato, and Saldo in an aligned money grid with tabular numeric styling. Payment progress remains directly below the account summary.

## Dotazioni / Extra Polish

Included equipment is displayed as compact chips. Paid extras remain separated as a concise secondary line. Editing still opens the existing focused extra editor.

## Technical Popover Polish

Technical info is now smaller, tighter, and includes a compact close action. Fields are label/value rows with constrained values to avoid viewport overflow.

## Inline Editor Polish

Customer, period, payment, account, and extra editors received a density pass:

- Smaller labels.
- Tighter rows.
- More restrained action buttons.
- Compact segmented controls.
- More usable extra item row grid.

## Responsive Behavior

Tablet keeps the two-column structure where available and collapses to a compact single column below the tablet threshold. Phone keeps one column, wrapped actions, and stacked money rows.

## Data / Map Preservation

No database schema, beach items, seed data, coordinates, map geometry, item codes, customers, reservations, accounts, payments, tariffs, or extras were changed.

## Validation Results

Run for this wave:

- `pwd`
- `node -v`
- `npm -v`
- `npm run check`
- `npm run build`
- `npm run cap:sync`

## Next Recommended Wave

Recommended:

- `BOOKING.UI.R3 - Tablet / Phone Booking QA`

Alternative:

- `REGISTRY.UI.R1 - Registro UX / Visual Hardening`
