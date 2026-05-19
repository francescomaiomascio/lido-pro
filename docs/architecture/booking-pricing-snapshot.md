# Booking Pricing Snapshot

Wave: BOOKING.7
Date: 2026-05-19

## Purpose

BOOKING.7 captures the economic basis used by an operator booking. Articoli pricing rules remain mutable and continue to calculate current suggestions, but a booking/account needs a durable snapshot of the price used at the time economics become concrete.

Rule:

```text
Articoli / current tariff rules
-> booking calculation
-> pricing snapshot
-> account / future folio
-> later Articoli changes do not silently rewrite the past
```

This wave does not redesign Articoli, implement a payment gateway, refactor Folio, or create another pricing engine.

## Current Pricing Inputs

Current pricing is owned by:

- `src/lib/db/tariffRepository.ts`
- `src/lib/services/tariffService.ts`
- `src/lib/types/tariff.ts`

The existing tariff suggestion path is:

```text
BeachItem + reservationType + date
-> suggestPriceForItem
-> PriceSuggestion
```

`PriceSuggestion` exposes:

- matched tariff rule when available;
- suggested amount in cents;
- reason and confidence.

If confidence is `none`, the system must not invent a price. Snapshot creation records manual-review state through warnings and a zero/manual base when no explicit override exists.

## Current Account Behavior

Current account preparation is owned by `bookingFlowService.ensureAccountForReservation`.

Today it:

- asks `suggestPriceForItem`;
- multiplies daily price by day count;
- creates an account if one does not exist;
- preserves an existing account;
- avoids recalculating paid/manual accounts destructively.

BOOKING.7 keeps this behavior stable and creates the snapshot alongside it.

## Snapshot Creation Point

The first safe integration is account preparation:

```text
savePeriodAndEnsureAccount
-> create/update reservation
-> ensure account
-> create pricing snapshot if one does not exist
```

This means:

- selecting a customer does not create a snapshot;
- checking availability does not create a snapshot;
- changing date fields does not create a snapshot;
- preparing/confirming the booking account creates the locked snapshot.

This matches current operator-app behavior because the account is where the booking becomes economically meaningful today.

## Snapshot Service

BOOKING.7 adds:

- `src/lib/booking/pricingSnapshot.types.ts`
- `src/lib/booking/pricingSnapshotService.ts`

Core functions:

- `buildPricingSnapshot(input)`
- `createPricingSnapshot(input)`
- `getPricingSnapshotForReservation(reservationId)`
- `listPricingSnapshotsForReservation(reservationId)`
- `voidPricingSnapshot(snapshotId, reason)`
- `supersedePricingSnapshot(oldSnapshotId, newInput)`
- `compareSnapshotToCurrentPricing(reservationId)`

`buildPricingSnapshot` wraps current tariff logic. It does not duplicate tariff rule matching.

Repository support also exposes explicit link helpers:

- `linkPricingSnapshotToReservation(reservationId, snapshotId)`
- `linkPricingSnapshotToAccount(accountId, snapshotId)`

These helpers update the existing `pricing_snapshots` row. They do not create a second snapshot table or a parallel booking model.

## Snapshot Contents

A snapshot includes:

- reservation link;
- optional account link;
- source and status;
- period type and scope;
- base item line from the current tariff suggestion;
- included equipment lines when current included-item data exposes them;
- account extra lines when an account exists and extras are present;
- manual override metadata when explicitly provided;
- calculated total.

Snapshot lines are stored as JSON in `pricing_snapshots.lines_json`. Included items and extras are not faked.

Manual account amounts are represented only when explicit operator input exists. The snapshot stores manual override metadata with `enabled`, `amountCents`, `reason`, `source`, and `previousAmountCents` when available. No inferred discount or hidden tariff-rule mutation is created.

## Persistence

`pricing_snapshots` existed from BOOKING.2. BOOKING.7 adds only additive columns:

- `account_id`
- `source`
- `status`
- `discounts_total`
- `lines_json`

SQLite/native and browser-memory adapters both support:

- create snapshot;
- get by id;
- get latest non-voided snapshot for reservation;
- list snapshots for reservation;
- update snapshot status;
- link snapshot to reservation/account through existing columns.

## Reprice Boundary

Snapshots are locked when created for an account-backed booking.

Later tariff changes do not mutate:

- locked snapshots;
- existing account totals;
- payments.

Explicit reprice is represented by service-level support:

- `compareSnapshotToCurrentPricing` previews current-vs-snapshot difference;
- `supersedePricingSnapshot` marks the old snapshot superseded and creates a new one;
- no folio/account rewrite happens automatically.

BOOKING.8 / FOLIO.1 will own final folio reprice application rules.

## Account/Folio Relation

When an account exists, the snapshot stores `accountId`. The account total behavior remains the same as before this wave.

BOOKING.7 does not:

- delete payments;
- rewrite paid totals;
- delete extras;
- change payment state;
- introduce final folio lines.

## Deferred

- ARTICOLI.1: user-facing module naming from Listino to Articoli is complete; broader Articoli module hardening remains separate.
- BOOKING.8 / FOLIO.1: final Folio/Conto engine, account line policy, and explicit reprice application.
- BOOKING.9 / REGISTRO.1: append-only Registro event integration.
- Payment/refund gateway.
- Client web/app pricing UI.
