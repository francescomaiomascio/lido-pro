# Wave 4 - Customer Assignment Foundation

## Purpose

Wave 4 adds the first customer layer to Beach BDF: a customer can be created, edited, searched, assigned to a beach item, and unassigned without deleting history.

This wave answers only: "Questo posto e' di chi?"

## Schema v3

The existing schema version remains `3`. Customer support is added through an idempotent v3 migration because the app already used version 3 for the daily/seasonal item field.

New tables:

- `customers`
- `beach_item_customer_assignments`

`beach_item_customer_assignments` keeps assignment history. Removing a customer from a place deactivates the assignment and sets `unassigned_at`; it does not delete the customer.

## Assignment Rules

- Only one active assignment is allowed per beach item.
- Assigning a customer deactivates any previous active assignment for the same item.
- Assigning a customer to a `free` item changes the item status to `occupied`.
- Unassigning a customer from an `occupied` item changes the item status back to `free`.
- Maintenance status is not forced to free by assignment removal.
- Operational notes remain independent from customer assignment notes.

## UI Changes

- The old customer placeholder in the item inspector is replaced by a real customer section.
- When no customer is assigned, the inspector shows `Nessun cliente assegnato`.
- Actions available from the inspector:
  - `Assegna cliente`
  - `Nuovo cliente`
  - `Cambia cliente`
  - `Modifica cliente`
  - `Rimuovi cliente`
- Customer form fields:
  - `Nome e cognome`
  - `Telefono`
  - `Email`
  - `Note`
- Assignment type:
  - `Giornaliero`
  - `Stagionale`
- Menu -> `Clienti` opens a lightweight customer list with search, create, and edit actions.

## Map And List

- Map items with an assigned customer show a subtle `C` marker.
- List rows show the assigned customer name or `Nessun cliente`.
- Global search now matches assigned customer name and phone.

## Browser Fallback

The browser memory adapter supports customers and active assignments for development only. Production persistence remains Android/native SQLite.

## Non-goals

- No accounts.
- No payments.
- No invoices.
- No booking calendar.
- No cloud sync.
- No authentication.

## Validation Results

- `npm run check`: passed.
- `npm run build`: passed.
- `npm run cap:sync`: passed.
- `npx cap sync android`: requires Node >= 22 when run directly; passed with Node 24 on PATH.

## Next Wave

WAVE 5 - Account / Payment Foundation
