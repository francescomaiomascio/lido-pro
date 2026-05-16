# CORE.R1 — Customer Registry + Customer Profile

## Purpose

CORE.R1 turns Settings -> Clienti into a real local customer registry. The global customer area now supports anagrafica creation/editing, customer profile viewing, current activity, reservation history, and account/payment summaries.

## Customer Registry Behavior

- Clienti remains inside the Settings shell.
- The list supports search by name, phone, and email through the existing customer repository search.
- Rows show name, phone, email when present, current activity, and balance status.
- Customer assignment to a beach item remains outside the registry and stays in the selected-item operational panel.

## Customer Profile Read Model

Created:
- `src/lib/types/customerProfile.ts`
- `src/lib/services/customerProfileService.ts`

The read model exposes:
- `getCustomerProfile(customerId)`
- `getCustomerCurrentActivity(customerId)`
- `getCustomerRecentReservations(customerId, limit)`
- `getCustomerReservationHistory(customerId)`
- `getCustomerAccountSummary(customerId)`
- `getCustomerPaymentHistory(customerId, limit?)`
- `searchCustomersWithSummary(query)`

These functions are read/projection functions and do not mutate storage.

## Table Relationships Used

The profile is built from existing tables only:

- `customers`
- `beach_item_customer_assignments`
- `reservations`
- `beach_items`
- `accounts`
- `payments`
- `account_extra_items`

No duplicate history table was introduced.

## Current Activity Logic

The projection checks:
- active reservation whose date range includes today
- active assignment if no current reservation is present
- linked beach item from reservation or assignment
- linked account from reservation account id or matching customer/item account

UI states:
- active reservation with period, posto, account status, and balance
- assignment without reservation
- no active reservation

## Recent History Logic

- Latest reservations are sorted by start date descending.
- Profile preview shows the latest 5 reservations.
- “Vedi storico completo” expands the full reservation list inside the same profile panel.

## Account/Payment Summary Logic

The account summary aggregates:
- total accounts
- open accounts
- paid accounts
- total amount
- paid amount
- open balance

Last payments show:
- amount
- date
- payment method
- linked item code when available

Payments are read-only in the global customer profile.

## UI Behavior

Desktop/tablet:
- left customer search/list
- right customer profile or create/edit detail

Phone/narrow:
- list and detail stack inside the settings content without horizontal overflow.
- create/edit uses the same detail area.

## Persistence Validation

Automated browser reload validation was not run in this environment. Manual validation remains required:
- create customer
- reload browser
- verify customer persists
- edit phone/email
- reload browser
- verify edits persist

If Diagnostics reports memory fallback instead of Web SQLite persistente, that is a blocker.

## Data/Map Preservation

- No schema migration added.
- No `beach_items` seed changes.
- No coordinates, item codes, layout size, item count, or map geometry changed.
- No map rendering code changed.

## Non-Goals

- No backup/export/import.
- No reports or PDFs.
- No analytics dashboard.
- No POS/bar/restaurant integration.
- No beach layout editor.
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
