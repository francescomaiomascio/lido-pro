# Client-first Booking Flow

Wave: BOOKING.6
Date: 2026-05-19

## Purpose

BOOKING.6 adds the second operator entry point into booking:

```text
Clienti
-> selected customer
-> Nuova prenotazione
-> choose period
-> check availability
-> choose available place
-> confirm reservation and conto/account
-> return to customer or open Spiaggia focused on the item
```

This flow reuses the existing Booking, Availability, Customer, Account/Folio, Articoli, and active layout foundations. It does not create a separate booking subsystem.

## Current Clienti Inventory

Canonical Clienti workspace ownership:

- `src/components/customers/CustomerRegistryPanel.svelte` owns the customer workspace shell, selection, list reload, profile reload, create/edit mode, and now the customer-scoped booking flow visibility.
- `src/components/customers/CustomerProfilePanel.svelte` owns the selected profile display and exposes the `Nuova prenotazione` entry action only when a profile exists.
- `src/lib/services/customerProfileService.ts` owns the customer profile read model.
- `src/lib/services/customerService.ts` and `src/lib/db/customerRepository.ts` own customer creation, update, search, assignment, and assignment reads.

Profile structure today:

- anagrafica: full name, phone, email, notes;
- operational links: current customer connections to operational areas;
- current activity: active/current reservation, beach item, and reservation status;
- conto summary: total, paid, balance, current account status, latest payment;
- recent/history reservations: reservation period, item code/type, status, account state, balance, and extras summary.

Reservations, accounts, and history are shown inside `CustomerProfilePanel.svelte` through the `CustomerProfile` and `CustomerReservationSummary` read models produced by `customerProfileService`.

## New Flow Ownership

BOOKING.6 adds:

- `src/lib/booking/customerBookingService.ts`
- `src/components/customers/CustomerBookingFlow.svelte`

The service is the customer-scoped orchestration boundary:

- `prepareCustomerBooking(customerId)`
- `searchAvailableItemsForCustomerBooking(input)`
- `confirmCustomerBooking(input)`
- `reloadCustomerBookingContext(customerId)`

The component is a compact Clienti workspace surface. It coordinates operator input and delegates all persistence and availability decisions to the service boundary.

## Reused Services

The customer-first flow composes existing canonical owners:

- availability: `src/lib/booking/availabilityService.ts`
- selected-item operator write boundary: `src/lib/booking/operatorBookingService.ts`
- reservation/account transaction: `src/lib/services/bookingFlowService.ts`
- customer assignment: `src/lib/services/customerService.ts`
- customer profile reload: `src/lib/services/customerProfileService.ts`
- active layout item read: `src/lib/db/beachRepository.ts`
- Articoli pricing suggestion: `src/lib/services/tariffService.ts`

Reservation persistence remains `reservations`. Account/Folio remains current `accounts` and payment/extras behavior. Pricing snapshot hardening remains deferred to BOOKING.7.

## Flow Details

The operator selects a customer in Clienti, then uses `Nuova prenotazione`.

Supported period choices:

- daily;
- multi-day as a daily reservation with start/end dates;
- seasonal through the existing seasonal defaults.

Unsupported custom period behavior is not exposed because the current reservation runtime only stores `daily` and `seasonal`.

Availability search calls BOOKING.3 `getAvailabilityForRange` and optionally filters by active layout item type:

- `palm`
- `umbrella`
- `small_palm`

The available-place list shows the active layout item, row, kind/type, operational status, availability state, and a non-binding price suggestion when Articoli pricing can provide one.

Confirmation performs a final `checkItemAvailability` before writing. It then assigns the selected customer to the selected item through the existing customer assignment service and confirms through `operatorBookingService`, which validates availability again and delegates to the existing reservation/account transaction.

## Error Model

The service returns typed customer-booking errors:

- `missing_customer`
- `missing_period`
- `no_available_items`
- `unavailable_item`
- `reservation_save_failed`
- `account_prepare_failed`
- `pricing_unavailable`

UI messages remain compact and operator-readable.

## Navigation

After confirmation the flow offers only working actions:

- `Torna al cliente`: closes the booking surface and leaves the refreshed profile visible.
- `Apri in Spiaggia`: switches to the active layout and selects the booked item, using the existing selected-item operator panel.

There is no standalone `Apri conto` action yet because account/folio still lives inside the selected-item console. BOOKING.8 hardens the Folio/Conto service boundary, while a dedicated customer-profile account surface remains deferred.

## Gaps And Deferred Items

- Pricing snapshots are not forced in BOOKING.6; BOOKING.7 owns snapshot hardening.
- Folio/account remains current `accounts`; BOOKING.8 owns the Folio/Conto service boundary over that persistence.
- Registro event write integration is still deferred to BOOKING.9 / REGISTRO.1.
- No public web/client booking UI is introduced.
- No cloud sync or payment gateway is introduced.
- No Studio, Canvas, or active layout geometry behavior changes are introduced.
