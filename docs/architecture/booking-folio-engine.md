# Booking Folio Engine

Wave: BOOKING.8
Date: 2026-05-19

## Purpose

BOOKING.8 defines the Folio / Conto engine over the existing account system. It does not replace accounts and it does not introduce a second payment model.

Canonical rule:

```text
Booking
-> Pricing Snapshot
-> Account / Conto
-> Folio summary and line preview
-> Payments
-> Residual and status
```

Current `accounts` remain the runtime persistence for Conto. `Folio` is the canonical domain name for the booking-linked economic ledger.

## Current Account Model

Current account ownership remains:

- `src/lib/types/account.ts`
- `src/lib/db/accountRepository.ts`
- `src/lib/services/accountService.ts`
- `src/components/accounts/*`
- selected-item booking account/payment editors

The `accounts` table stores item, customer, assignment, total, paid amount, residual balance, status, notes, active flag, and timestamps.

Current account statuses map to Folio status:

- no account or zero total -> `to_prepare`
- `open` -> `open`
- paid amount with residual -> `partial`
- residual at or below zero -> `paid`
- `cancelled` -> `cancelled`
- ambiguous or unsafe cases -> `manual_review`

## Current Payment Model

Payments remain append-style records in `payments`.

BOOKING.8 does not:

- edit old payments;
- delete payments;
- rewrite payment method or notes;
- create a payment gateway;
- create client web/app payment flows.

Corrections, reversals, credit, and refund flows are deferred to future Folio and Registro work.

BOOKING.9 records persisted payment insertions as Registro events. The event is a diary entry over the existing payment row; it does not change payment persistence or edit prior payments.

## Current Extras Behavior

Current extra ownership remains:

- `extra_item_catalog`
- `account_extra_items`
- `tariff_included_items`
- `extraItemService`

Account extras already recalculate account totals through existing services. BOOKING.8 reads extras into folio line previews where useful and does not duplicate extra rows.

## Snapshot Relation

BOOKING.8 consumes BOOKING.7 pricing snapshots.

When preparing a folio for a booking:

- existing reservation/account links are reused;
- an existing pricing snapshot is reused;
- if a snapshot is missing and enough reservation context exists, `pricingSnapshotService` creates one;
- account totals are preserved through current account behavior;
- payments are not changed.

`FolioSummary` exposes the linked `pricingSnapshotId`, pricing availability, manual-review requirement, payment count, line count, and normalized status.

BOOKING.9 can append folio and pricing-related Registro events from persisted operations such as folio preparation, folio update, manual-review requirement, and pricing snapshot creation.

## Service Boundary

BOOKING.8 adds:

- `src/lib/booking/folio.types.ts`
- `src/lib/booking/folioStatus.ts`
- `src/lib/booking/folioService.ts`

Core operations:

- `getFolioSummary(accountId)`
- `getFolioForReservation(reservationId)`
- `prepareFolioForBooking(input)`
- `rebuildFolioLinesFromSnapshot(input)`
- `registerManualPayment(input)`
- `applyManualAdjustment(input)`
- `cancelFolioForReservation(input)`

These functions compose existing account, payment, reservation, extra, booking-folio-link, and pricing-snapshot services.

## Persistence Decision

No `folio_lines` table is added in BOOKING.8.

Reason:

- `accounts` already persist totals and status;
- `payments` already persist payment records;
- `account_extra_items` already persist extra rows;
- pricing snapshot lines already preserve the economic basis from Articoli rules;
- adding persisted folio lines now would risk duplicating extras before FOLIO.1 finalizes account-line ownership.

`FolioLine` is currently a service-level preview derived from pricing snapshot lines and current account extras. The preview marks metadata with its persistence source, such as `pricing_snapshots` or `account_extra_items`.

Persistent folio lines are deferred to FOLIO.1 / ARTICOLI.6 if the product needs append-only ledger rows.

## Cancellation and Account Impact

`cancelFolioForReservation` is conservative:

- if no payment exists, the current account can be cancelled through existing account behavior;
- if payments exist, the service returns manual-review warnings and does not delete or alter payments;
- refund, credit, and reversal mechanics remain deferred.

This aligns with BOOKING.6.5 account-impact previews.

## Deferred

- Payment gateway and client payment intent flows.
- Append-only reversal/storno records.
- Persistent `folio_lines`.
- Final Folio UI rebuild.
- Event-first Registro UI and acknowledgement workflow.
- Client app/web account visibility.
