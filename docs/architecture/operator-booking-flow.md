# Operator Booking Flow

Wave: BOOKING.5
Date: 2026-05-18

## Purpose

BOOKING.5 makes the existing Spiaggia selected-item workflow the canonical operator booking flow.

The operator still starts from the active beach item:

```text
select beach item
-> assign customer
-> choose period
-> check availability
-> apply current Articoli pricing suggestion
-> create or update reservation
-> create or preserve conto/account link
-> expose registry event intent for later Registro integration
```

No separate booking wizard, booking screen, or duplicate booking system is introduced.

## Current Flow Baseline

The current runtime flow is owned by:

- `src/app/AppShell.svelte`: selected-item state, operational handlers, reloads, toast/error feedback.
- `src/components/operational/BookingSheet.svelte`: existing operator panel surface.
- `src/components/operational/editors/CustomerInlineEditor.svelte`: customer assignment.
- `src/components/operational/editors/PeriodInlineEditor.svelte`: period selection.
- `src/components/operational/editors/AccountInlineEditor.svelte`: conto amount creation/update.
- `src/components/operational/editors/PaymentInlineEditor.svelte`: payments.
- `src/components/operational/editors/ExtraInlineEditor.svelte`: extra items.
- `src/lib/services/bookingFlowService.ts`: legacy orchestration for reservation + account creation.
- `src/lib/services/reservationService.ts` and `src/lib/db/reservationRepository.ts`: current reservation persistence.

The persisted booking source remains `reservations`.

## Canonical Boundary

BOOKING.5 adds:

- `src/lib/booking/operatorBookingService.ts`

This service is now the canonical operator booking boundary for:

- `prepareOperatorBooking`
- `validateOperatorBookingDraft`
- `confirmOperatorBooking`
- `updateOperatorBookingPeriod`
- `cancelOperatorBooking`
- `linkOperatorBookingAccount`

`bookingFlowService.savePeriodAndEnsureAccount` is still reused internally for the established reservation/account transaction. It is wrapped rather than duplicated. Future waves can move the remaining legacy orchestration fully behind `operatorBookingService`.

## Availability Integration

The operator boundary uses BOOKING.3:

- `checkItemAvailability`
- `canConfirmBooking`
- `detectBookingConflicts`

When editing an existing reservation, the current reservation id is passed as `excludeReservationId` so self-conflict is ignored.

Blocking conflicts stop confirmation/update before the write path. The UI now shows a compact availability state in the existing period editor:

- `Disponibile`
- `Verifica disponibilita`
- `Conflitto disponibilita`
- `Periodo gia occupato`

The persistence layer still retains its lower-level overlap guard as a final safety net.

## Status Mapping

Current runtime reservation statuses are:

- `draft`
- `active`
- `completed`
- `cancelled`

The canonical booking contract includes `confirmed`, but current operator persistence still uses `active` as the operational confirmed/active booking state. BOOKING.5 documents this mapping without forcing a migration.

Future work may split `confirmed` and `active` when the request inbox and client flow need a richer lifecycle.

## Account / Folio Boundary

BOOKING.5 preserves the current conto/account behavior:

- if no active account exists, the existing account creation path prepares one;
- if an account exists, it is preserved;
- if payments exist, totals are not destructively recalculated by the operator booking flow;
- extras remain owned by the existing extra item service.

BOOKING.8 now provides the Folio / Conto service boundary over the existing account system. Persistent folio lines and final Folio UI terminology remain deferred to FOLIO.1.

## Pricing / Articoli Boundary

The flow continues to use current tariff suggestions from Articoli pricing services.

The account amount can be generated from the current suggestion or entered manually. Pricing snapshot persistence exists from BOOKING.2, but BOOKING.5 does not force snapshot creation. BOOKING.7 will harden pricing snapshots.

## Registro Boundary

BOOKING.5 does not rewrite Registro and does not create fake registry rows.

The operator service returns lightweight registry event intent metadata for confirm/update/cancel results. Append-only Registro integration remains deferred to BOOKING.9 / REGISTRO.1.

## Error Model

The operator service exposes typed safe errors:

- `missing_item`
- `missing_customer`
- `missing_period`
- `unavailable_period`
- `pricing_unavailable`
- `account_link_failed`
- `reservation_save_failed`

UI copy remains compact and Italian-first.

## Deferred

- No Booking Inbox UI.
- No web booking UI.
- No client app UI.
- No customer pairing UI.
- No cloud sync.
- No payment gateway.
- No active layout or Canvas redesign.
- No fake bookings, customers, or payments.
