# Booking Reservation Lifecycle

Wave: BOOKING.6.5
Date: 2026-05-19

## Purpose

BOOKING.6.5 defines how a booking changes after creation. It prepares the shared lifecycle foundation needed before BOOKING.7 pricing snapshots harden confirmed totals.

The current persisted booking source remains `reservations`. This wave adds lifecycle services, account-impact previews, client change-request persistence, and client-facing projection types without creating web/client UI, cloud sync, payment gateway behavior, or a second booking model.

## Canonical Owners

- Reservation record: `reservations`, `reservationRepository`, and `reservationService`.
- Availability: `src/lib/booking/availabilityService.ts`.
- Account/Folio runtime: current `accounts`, `payments`, extras, and account services.
- Lifecycle policy: `src/lib/booking/reservationLifecyclePolicy.ts`.
- Lifecycle orchestration: `src/lib/booking/reservationLifecycleService.ts`.
- Change requests: additive `booking_change_requests`.
- Lifecycle events: existing `booking_status_events`.
- Shared period logic: `src/lib/booking/bookingPeriodService.ts`.

## Lifecycle States

Canonical lifecycle states:

- `draft`
- `requested`
- `pending_operator_review`
- `confirmed`
- `active`
- `completed`
- `cancelled`
- `rejected`
- `expired`
- `no_show`
- `archived`

Current runtime states remain:

- `draft`
- `active`
- `completed`
- `cancelled`

Runtime mapping:

- `draft` -> `draft`
- `active` -> `active`
- `completed` -> `completed`
- `cancelled` -> `cancelled`

`requested`, `pending_operator_review`, `confirmed`, `rejected`, `expired`, `no_show`, and `archived` are canonical states for future request/client/sync surfaces. They are not forced into the current reservation UI in this wave.

## Mode Differences

`operator_app`:

- can propose and apply allowed period changes directly;
- can propose and apply cancellation directly;
- must still pass availability checks before period mutation;
- must not delete payments or destructively rewrite accounts.

`client_web` and `client_app`:

- can propose changes;
- create `booking_change_requests`;
- do not directly mutate `reservations`;
- wait for later operator review/acceptance before changes apply.

`sync_cloud` and `import_ai`:

- are represented in types and policy boundaries;
- do not introduce active sync or AI mutation behavior in this wave.

## Shared Period Model

The shared period service supports:

- `daily`
- `multi_day`
- `seasonal`
- `custom`

Core operations:

- `normalizeBookingPeriod`
- `validateBookingPeriod`
- `compareBookingPeriods`
- `describeBookingPeriod`
- `periodToAvailabilityPeriod`
- `periodToDisplayLabel`
- `isPeriodEditable`
- `isPeriodChangeAllowed`

Daily remains the priority operational path. Seasonal is supported and usually operator-driven. Custom exists in the contract for direct agreements, but current reservation persistence still maps applied custom periods to the closest supported runtime reservation type.

## Period Change Rules

`proposeReservationPeriodChange`:

1. Loads the current reservation.
2. Normalizes the proposed period.
3. Checks lifecycle policy.
4. Runs the Availability Engine with `excludeReservationId`.
5. Builds an account-impact preview when a conto exists.
6. In client modes, creates a `booking_change_request` instead of mutating the reservation.

`applyReservationPeriodChange`:

1. Re-runs proposal logic without creating another client request.
2. Allows direct apply only for `operator_app` or an accepted change request.
3. Re-checks item availability before write.
4. Updates the existing reservation through the existing repository.
5. Appends lifecycle events.
6. Records account-impact events when relevant.

Blocking availability conflicts stop mutation. The lower-level reservation repository remains a final overlap guard.

## Cancellation Rules

`proposeReservationCancellation`:

- checks reservation policy;
- previews account impact;
- creates a `booking_change_request` in client modes;
- does not mutate reservation state for client requests.

`applyReservationCancellation`:

- allows direct apply only for `operator_app` or an accepted change request;
- cancels through the existing reservation repository;
- appends lifecycle events;
- never deletes payments.

Account impact outcomes:

- `no_account`
- `no_payment_no_balance`
- `residual_to_cancel`
- `credit_required`
- `refund_required`
- `manual_review_required`

If payments exist, the system preserves them and flags credit/refund/manual review work for the operator.

## Account Impact Rules

BOOKING.6.5 introduces preview-only account impact:

- `unchanged`
- `recalculate_needed`
- `residual_changed`
- `credit_required`
- `refund_required`
- `manual_review_required`
- `no_account`
- `no_payment_no_balance`
- `residual_to_cancel`

The service never automatically recalculates final totals, deletes account lines, deletes payments, or issues refunds. BOOKING.7 owns pricing snapshot hardening. BOOKING.8 provides the Folio/Conto service boundary; persistent folio lines and reversal workflows remain deferred.

## Change Requests

`booking_change_requests` is additive and local-first. It stores:

- reservation link;
- optional booking request link;
- source;
- change type;
- request status;
- payload JSON;
- availability preview JSON;
- account impact JSON;
- created/updated/decision metadata.

Supported request types:

- `change_period`
- `change_item`
- `cancel_booking`
- `add_service`
- `remove_service`
- `payment_update`
- `note_update`

No client UI or operator inbox UI is introduced yet.

## Lifecycle Events

Lifecycle events are appended through the existing `booking_status_events` table. In this wave `to_status` can carry lifecycle event names such as:

- `reservation_period_changed`
- `reservation_cancelled`
- `client_change_requested`
- `account_impact_created`
- `refund_or_credit_required`

This is not full Registro emission. BOOKING.9 / REGISTRO.1 owns Registro integration.

## Client-facing Propagation

`ClientBookingProjection` prepares future client surfaces:

- reservation id and canonical status;
- customer-visible status;
- normalized period;
- item summary;
- folio summary;
- payments summary;
- latest update timestamp;
- pending change request.

Rule:

- operator mutation updates the reservation and lifecycle events so future client projections can show the new state;
- client mutation creates a change request and leaves reservation state unchanged until accepted/applied.

## Shared Calendar Contract

Future operator, Clienti-first, web, and app calendars must use the same shared period contract:

- same period normalization;
- same availability query conversion;
- same period display labels;
- same disabled/unavailable day policy from the Availability Engine;
- different permissions by mode.

Permissions:

- `operator_app` may apply allowed changes and resolve conflicts;
- `client_web` and `client_app` may request changes only;
- `sync_cloud` may replicate accepted state when sync exists.

## Deferred

- BOOKING.7: pricing snapshot and reprice rules.
- FOLIO.1 / REGISTRO.1: persistent account line policies, refund/credit/storno workflow, and event emission.
- BOOKING.9 / REGISTRO.1: Registro event integration.
- BOOKING.10: operator Booking Inbox now reviews `booking_change_requests` and applies accepted period/cancellation requests through this lifecycle service. Client-origin requests still do not mutate reservations directly.
- Web Booking / Client App UI.
- Cloud sync.
- Payment gateway/refund gateway.
