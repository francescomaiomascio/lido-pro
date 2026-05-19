# Booking Inbox

Wave: BOOKING.10
Date: 2026-05-19

## Purpose

BOOKING.10 introduces the operator-side Booking Inbox for customer requests.

The inbox belongs to `operator_app`. It is not the public web booking UI, not the client app, and not a cloud sync surface.

Canonical rule:

```text
Customer request
-> operator review
-> customer pairing
-> availability check
-> accept / reject / leave pending
-> conversion or lifecycle apply through existing services
```

Client-origin requests do not mutate reservations directly. The operator confirms conversion or applies change/cancellation requests.

## Placement

The inbox is mounted inside the Clienti workspace as the `Richieste` tab.

It does not add a new shell/topbar module and does not change Spiaggia, active layout, or Canvas behavior.

Primary files:

- `src/components/customers/BookingRequestInbox.svelte`
- `src/lib/booking/bookingInbox.types.ts`
- `src/lib/booking/bookingInboxService.ts`

## Request Families

The inbox reads two real persistence families:

- `booking_requests`: new booking requests from `client_web`, `client_app`, `import`, or `ai_draft` modes.
- `booking_change_requests`: change/cancellation/service/payment/note requests prepared by the lifecycle foundation.

No fake rows are seeded or synthesized.

## Read Model

`BookingInboxItem` normalizes:

- request kind and source
- status and priority
- customer summary
- requested period and item summary
- pairing state and candidate count
- availability status and conflict count
- account-impact status for change/cancellation requests
- allowed actions and blocking reason

`BookingInboxDetail` adds raw request data, pairing candidates, availability result, account-impact preview, and available actions.

## Pairing Integration

BOOKING.10 uses the BOOKING.4 customer pairing service.

Actions:

- refresh pairing analysis
- match existing customer
- create a new customer explicitly through `customerService.createCustomer`
- leave unpaired/pending
- reject

There is no silent customer creation and no duplicate customer search subsystem.

## Availability Integration

BOOKING.10 uses BOOKING.3 availability services.

For booking requests:

- requested item and period are checked directly when present;
- requested item type can return available options;
- final conversion re-checks the selected item immediately before writing.

For change requests:

- period changes check availability with `excludeReservationId`;
- cancellation requests do not require item availability;
- conflicts block apply/convert actions.

## Conversion Rules

Booking request conversion uses the existing customer-first/operator booking path:

```text
booking_request
-> matched customer
-> final availability recheck
-> confirmCustomerBooking / operator booking flow
-> reservation
-> account / folio where current flow prepares it
-> request marked converted_to_booking
-> Registro event
```

The inbox does not insert directly into `reservations` from the component and does not create a second booking table.

## Change And Cancellation Rules

`booking_change_requests` are applied through `reservationLifecycleService`.

Supported now:

- change period
- cancel booking
- mark other accepted request types as applied foundation-only

Cancellation with existing payment/account impact remains conservative. Payments are not deleted or rewritten; manual review, credit, or refund requirements remain tracked through lifecycle/Registro/Folio foundations.

## Registro Integration

When BOOKING.9 is present, the inbox appends Registro events from persisted actions:

- request rejected
- customer paired / created from request
- request converted
- change request rejected
- lifecycle apply paths for period/cancellation changes

Read-only list/detail loads do not emit events.

## Deferred

- Public web booking request submission UI.
- Client app request UI.
- Cloud sync and remote inbox.
- Payment gateway and client online payments.
- Auto-confirmation policy.
- Event-first Registro UI for inbox events.
- Rich operator queue assignment, SLA, and notification workflows.

## Manual Proof Expectations

- Empty inbox shows `Nessuna richiesta cliente.`
- Real `booking_requests` and `booking_change_requests` appear.
- Pairing candidates can be refreshed and selected.
- New customer creation is explicit.
- Unavailable requests cannot convert silently.
- Conversion uses existing booking services.
- Change/cancellation requests use lifecycle services.
- Existing Clienti and Spiaggia booking flows remain working.
