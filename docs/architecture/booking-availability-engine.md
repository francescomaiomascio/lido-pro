# Booking Availability Engine

Wave: BOOKING.3
Date: 2026-05-18

## Purpose

The Availability Engine answers whether an active Spiaggia item is available for a period by reading real local data:

- current `reservations`
- current active layout items
- `availability_locks`

It does not create fake bookings, fake requests, fake locks, or UI state. It does not replace the existing reservation write flow.

## Current Baseline

Before BOOKING.3, availability existed as `checkItemAvailability(itemId, startDate, endDate)` in the SQLite adapter and browser-memory adapter. It checked date overlap against active/draft reservations for one item.

BOOKING.3 keeps that compatibility path but adds a canonical service layer:

- `src/lib/booking/availability.types.ts`
- `src/lib/booking/availabilityDate.ts`
- `src/lib/booking/availabilityRepository.ts`
- `src/lib/booking/availabilityService.ts`
- `src/lib/services/availabilityService.ts`

`src/lib/db/reservationRepository.ts` now delegates its exported compatibility `checkItemAvailability` function to the canonical engine.

## Input / Output Contracts

Primary query type:

- `AvailabilityQuery`
- `AvailabilityPeriod`
- `AvailabilityFilter`

Primary results:

- `ItemAvailability`
- `AvailabilityResult`
- `AvailabilityConflict`
- `ConfirmabilityResult`

Main service functions:

- `checkItemAvailability`
- `getAvailableItems`
- `getAvailabilityForDate`
- `getAvailabilityForRange`
- `detectBookingConflicts`
- `canConfirmBooking`
- `explainAvailability`

## Blocking Status Policy

Current persisted reservation states are narrower than the BOOKING.1 domain contract.

Blocking now:

- `active`

Non-blocking now:

- `draft`
- `cancelled`
- `completed`

Canonical future blocking states from the domain contract:

- `confirmed`
- `active`

Canonical future pending states:

- `requested`
- `pending_operator_review`

Policy:

- `operator_app` may treat pending/requested as warnings once those states are persisted.
- `client_web` and `client_app` should treat active locks and policy-held requests as unavailable once request flows exist.
- No silent policy is invented in BOOKING.3; the policy lives in code constants and this document.

## Lock Handling

`availability_locks` are read by the engine.

Blocking:

- `status = active`
- not expired
- overlapping the queried period

Ignored:

- `released`
- `expired`
- `converted`
- active locks whose `expires_at` is in the past
- locks tied to the same excluded request/reservation

BOOKING.3 does not create locks during normal operator flow.

## Period Rules

The engine uses date-only comparisons for daily and multi-day beach bookings unless explicit times are introduced later.

Supported period types:

- `daily`
- `multi_day`
- `seasonal`
- `custom`

Rules:

- daily: `startDate` only or `startDate = endDate`
- multi-day: inclusive `startDate` / `endDate`
- seasonal: broad inclusive range, often operator-created
- custom: arbitrary inclusive range, operator-controlled

Overlap rule:

```text
a.startDate <= b.endDate AND b.startDate <= a.endDate
```

This keeps seasonal reservations blocking for all overlapping daily/range checks.

## Item Filtering

The engine filters from existing active layout items.

Supported filters:

- item id
- item type/kind
- row key
- item status
- customer id for reservation queries
- include maintenance override
- include locks override

No new item category model is introduced.

Maintenance items block availability unless `includeMaintenance` is explicitly true.

## Conflict Persistence

Read-only availability calls return in-memory conflicts and do not write rows.

`detectBookingConflicts({ persist: true })` and `canConfirmBooking({ persistConflicts: true })` can explicitly persist blocking conflicts through `booking_conflicts`.

This avoids flooding the database during normal reads.

## Proof Cases

Expected behavior:

- Same item, same day active reservation: unavailable with `overlapping_reservation`.
- Same item, different non-overlapping date: available.
- Overlapping multi-day range: unavailable.
- Seasonal reservation overlapping daily query: unavailable.
- Cancelled reservation: non-blocking.
- Maintenance item: unavailable unless maintenance override is true.
- Active unexpired lock: unavailable with `active_lock`.
- Expired lock: ignored.
- `excludeReservationId`: allows editing an existing reservation without self-conflict.

## Relationship To BOOKING.4

BOOKING.4 customer pairing will use this engine after a request is paired or prepared enough to evaluate:

- requested period
- requested item or item type
- customer identity decision

Pairing remains separate. Availability does not create or merge customers.

## Relationship To WEBBOOKING.1

Future public availability should call this engine through an API adapter. It must not query UI state.

Public/client modes may apply stricter lock/request policy than `operator_app`, but the source data remains:

- reservations
- active layout items
- availability locks
- request policy once implemented

## Limitations

- Existing reservation writes inside the SQLite adapter still use the legacy internal overlap guard to preserve current behavior.
- The exported reservation repository compatibility check delegates to the canonical engine.
- Pending/requested booking states are not runtime reservation states yet.
- Item type availability is based on current active layout items only.
- Zone filtering is reserved; current active item data does not expose a zone id.
- No UI availability overlay is implemented.
- No web booking API is implemented.
- No fake requests, locks, or conflicts are seeded.
