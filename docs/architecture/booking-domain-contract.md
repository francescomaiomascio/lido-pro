# Booking Domain Contract

BOOKING.1 defines the canonical Booking boundary for LidoPro from the current implementation. It does not introduce a second booking system. The existing selected-item, customer assignment, reservation period, account, tariff, registry, and active layout responsibilities remain the baseline.

## Foundation Rule

Before creating new structures:

1. Inventory the existing implementation.
2. Decide what to extend, rename, move, or remove.
3. Avoid a parallel layer when a similar responsibility already exists.
4. Give every new file a clear boundary reason.

## Current-Code Inventory

| Concept | Current implementation | Current responsibility | Source of truth now | BOOKING.2+ direction |
| --- | --- | --- | --- | --- |
| Beach item / posto | `src/lib/types/beach.ts`, `src/lib/db/beachRepository.ts`, `src/lib/services/beachLayoutService.ts`, `src/components/beach/*` | Operational place identity, type, status, usage type, active assignment/account/reservation projection. | Keep `BeachItem` and active layout repositories. | Booking links to beach item by id and does not own layout geometry or item status. |
| Selected item state | `src/lib/state/beachViewState.ts`, `src/components/beach/BeachMap.svelte`, `src/components/operational/OperationalBottomPanel.svelte` | Drives the operator workflow after a posto is selected. | Keep UI selection state outside Booking. | Map selection remains a UI state that can load or create a booking draft. |
| Assigned customer | `src/lib/types/customer.ts`, `src/lib/services/customerService.ts`, `src/components/operational/editors/CustomerInlineEditor.svelte`, `src/components/customers/*` | Search, create, and assign an existing customer to a beach item. | Keep customer tables and assignment records. | Booking references `customerId`; request pairing prevents accidental duplicates. |
| Period | `src/lib/types/reservation.ts`, `src/lib/reservations/periodRules.ts`, `src/components/operational/editors/PeriodInlineEditor.svelte`, `docs/architecture/reservation-period-model.md` | Daily/seasonal date claim over one item. | Keep `reservations` as the runtime period claim until migration. | Booking period becomes canonical and preserves daily, multi-day, seasonal, and custom periods. |
| Reservation / booking record | `src/lib/types/reservation.ts`, `src/lib/db/reservationRepository.ts`, `src/lib/services/reservationService.ts` | Existing active reservation record with item, customer, assignment, account, dates, status. | Keep as current runtime record. | Rename or migrate to booking tables only with an explicit data migration plan. |
| Account / folio / conto | `src/lib/types/account.ts`, `src/lib/db/accountRepository.ts`, `src/components/accounts/*`, `src/components/operational/BookingSheet.svelte`, `docs/architecture/account-payment-model.md` | Expected total, paid amount, residual, payments, schedules. | Keep accounts/payments as money source. | Booking links to a folio/account; payment records remain attached to folio/account. |
| Account lines / extras | `src/lib/types/extraItem.ts`, `src/lib/db/extraItemRepository.ts`, `src/components/extras/*` | Extra catalog, included items, and account extra rows. | Keep account extra rows. | Pricing snapshots can include extras without moving extra ownership into Booking. |
| Articoli / pricing rule | `src/lib/types/tariff.ts`, `src/lib/db/tariffRepository.ts`, `src/lib/services/tariffService.ts`, `docs/architecture/tariff-catalog-model.md` | Operator-configured tariff rules and price suggestions. | Keep tariff rules as live catalog. | Confirmed booking stores a pricing snapshot so later Articoli/pricing edits do not rewrite totals silently. |
| Registry event / movement | `src/lib/types/registry.ts`, `src/lib/services/registryService.ts`, `src/components/registry/*` | Read-model over reservations and accounts for storico/registro. | Keep current registry projection. | Booking mutations emit or link registry events when the event store exists. |
| Active layout | `src/lib/layout/*`, `src/lib/map-canvas/parametric/*`, `src/lib/services/beachLayoutService.ts` | Local-first active layout and parametric layout projection. | Keep layout modules. | Booking reads active layout availability; it does not mutate layout geometry. |
| Dashboard booking metrics | `src/components/dashboard/homeOperationalModel.ts`, `src/components/dashboard/HomeReservationsPanel.svelte`, `src/components/dashboard/HomeAccountsPanel.svelte` | Derived active reservations, open accounts, residuals, missing account/customer/period indicators. | Keep dashboard model as projection. | Dashboard consumes booking/request/folio availability projections after repository work. |
| SQLite adapter/repositories | `src/lib/db/schema.ts`, `src/lib/db/sqliteAdapter.ts`, `src/lib/db/database.ts`, `src/lib/db/*Repository.ts` | Local-first persistence for layout, customers, accounts, reservations, tariffs, registry projections. | Keep adapter boundary. | BOOKING.2 owns schema/repository changes; BOOKING.1 adds no migration. |
| Seed/default beach layout | `src/lib/db/seed.ts`, `src/lib/layout/initialBeachLayout.ts`, `src/lib/layout/metricBeachLayout.ts` | Initial beach layout, demo/default data, imported parametric layout. | Keep seed and layout services. | Booking seed data is not added until tables and migration policy exist. |

## Usage Modes

Usage modes describe the acting surface and authority model. They are not a split between current and later code.

`BookingUsageMode`:

- `operator_app`: bagnino/operator manually creates, edits, confirms, corrects, and overrides. This mode is authoritative for operational workflow.
- `client_web`: client checks availability and sends a booking request. It can initiate payment only when policy enables it.
- `client_app`: smartphone/tablet client surface for own bookings, requests, services, bar attachments, payments, and updates from operator-side changes.
- `sync_cloud`: propagates state across devices, accounts, and tenants while preserving local-first offline operation.
- `import_ai`: imported or AI-prepared draft actions. These require operator review unless a trusted policy is explicitly introduced.

## Source Model

Every booking, request, or mutation records its source:

- `operator`
- `client_web`
- `client_app`
- `import`
- `ai_draft`
- `sync`
- `system`

Operator changes must be visible to client-facing surfaces through booking state and sync projection. Client-originated requests must not silently mutate active operations without policy or operator confirmation.

## Canonical Entities

The TypeScript contract is in `src/lib/booking/bookingDomain.types.ts`.

- `Booking`: canonical record connecting workspace, source, status, customer, beach item, period, folio/account, pricing snapshot, timestamps, deletion marker, and sync fields.
- `BookingRequest`: client/import/AI request before operator acceptance or policy conversion. It stores customer payload, requested period, requested item/type/extras, request state, and pairing state.
- `BookingPeriod`: daily, multi-day, seasonal, or custom date/time scope.
- `BookingAssignment`: booking-to-item assignment with assignment status.
- `BookingConflict`: availability, item, period, customer, folio, or policy conflict.
- `CustomerPairingCandidate`: possible existing customer match with score, reasons, and decision.
- `PricingSnapshot`: confirmed calculation boundary from Articoli/pricing rules plus extras/manual override.
- `FolioLink`: booking-to-conto relationship and folio state.
- `RegistryEventLink`: booking-to-registry event relationship.
- `AvailabilityQuery` and `AvailabilityResult`: typed availability boundary for query/repository work.

All persisted booking entities must include or plan for `id`, `workspaceId`, `source`, `createdAt`, `updatedAt`, optional `deletedAt`, optional `syncState`, optional `remoteId`, optional `version`, and optional device/operator fields when the account model exists.

## Booking States

Canonical booking states:

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

Current operator app minimum active set:

- `draft`
- `confirmed`
- `active`
- `completed`
- `cancelled`

State rules:

- `client_web` and `client_app` requests start as `requested` or `pending_operator_review`.
- `operator_app` can create `draft` or `confirmed`.
- `confirmed` bookings affect availability.
- `active` bookings represent operational current-day usage.
- `completed` bookings can link to a paid/closed folio.
- `cancelled` bookings release availability unless policy says otherwise.

## Request And Pairing States

Booking request states:

- `new`
- `needs_pairing`
- `matched`
- `availability_pending`
- `operator_review`
- `accepted`
- `rejected`
- `expired`
- `converted_to_booking`

Pairing states:

- `unpaired`
- `candidates_found`
- `matched_existing`
- `new_customer_required`
- `manually_resolved`
- `rejected`

Customer pairing flow:

1. `BookingRequest` receives customer payload.
2. Pairing evaluates candidates by phone, email, name, previous booking, and manual note.
3. Operator decides: match existing, create new, leave unpaired, or reject request.
4. Accepted request converts to a booking with an existing or explicitly created customer.

A client request must not create duplicate customers automatically.

BOOKING.4 implements this as a local-first Customer Pairing Engine. Request payloads are normalized and scored against existing `customers`, candidates are stored in `booking_customer_pairing_candidates`, and operator decisions are recorded on `booking_requests`. Customer creation is allowed only through the existing customer service after an explicit `create_new` decision, and the resulting customer id is recorded on the request without mutating any existing customer automatically. See [Booking Customer Pairing](booking-customer-pairing.md).

BOOKING.5 makes the existing Spiaggia selected-item workflow the canonical Operator Booking Flow. `operatorBookingService` prepares and validates drafts, checks BOOKING.3 availability before confirmation/update, delegates the established reservation/account transaction to the current flow, and returns lightweight Registro event intent metadata without writing fake registry rows. Current `reservations.status = active` still represents the confirmed/active operator booking state; the contract-level `confirmed` split is deferred. Account/Folio remains backed by current `accounts`, and pricing still uses current Articoli pricing suggestions until BOOKING.7 snapshots harden the pricing boundary. See [Operator Booking Flow](operator-booking-flow.md).

BOOKING.6 adds the Clienti-first operator entry point without changing the persistence owner. `customerBookingService` starts from an existing selected customer, searches real availability through BOOKING.3, assigns the customer to the selected active-layout item through the existing customer service, and confirms through `operatorBookingService`. The flow refreshes the customer profile read model after confirmation and can open Spiaggia focused on the booked item. See [Client-first Booking Flow](client-first-booking-flow.md).

BOOKING.6.5 adds the shared reservation lifecycle foundation before pricing snapshots. `bookingPeriodService` normalizes daily, multi-day, seasonal, and custom periods for operator and future client surfaces. `reservationLifecycleService` proposes/applies operator period changes and cancellations through the existing reservation repository, uses the Availability Engine with `excludeReservationId`, previews account impact without rewriting payments, creates `booking_change_requests` for client modes instead of direct mutation, appends lifecycle events through `booking_status_events`, and exposes `ClientBookingProjection` for future web/app surfaces. See [Booking Reservation Lifecycle](booking-reservation-lifecycle.md).

BOOKING.7 adds the Articoli Pricing Snapshot boundary. `pricingSnapshotService` builds snapshots from existing tariff suggestions, current reservation period/item context, included equipment, and account extras where available. The operator booking/account path creates a locked snapshot when an account-backed booking is prepared, and existing snapshots are not rewritten silently by later Articoli pricing changes. Snapshot reprice support is service-level and explicit; account/payment mutation remains deferred to BOOKING.8 / FOLIO.1. See [Booking Pricing Snapshot](booking-pricing-snapshot.md).

BOOKING.8 adds the Folio / Conto service boundary over the existing account system. `folioService` normalizes account totals, paid amount, residual, status, payment count, pricing snapshot links, and manual-review requirements into `FolioSummary`. Current `accounts`, `payments`, and `account_extra_items` remain runtime persistence; folio lines are currently derived previews from pricing snapshot lines and account extras, not a new persisted ledger table. Payments remain append-style records and cancellation with existing payments returns manual-review / reversal warnings instead of deleting or rewriting payment history. See [Booking Folio Engine](booking-folio-engine.md).

BOOKING.9 adds the Registro event foundation. `registry_events` is the append-style operational diary for persisted booking, lifecycle, folio, payment, and pricing actions, while the current Registro UI/read-model remains stable. Events use dedupe keys where needed and link to reservations or booking requests through `booking_registry_event_links` when available. See [Booking Registro Events](booking-registro-events.md).

BOOKING.10 adds the operator-side Booking Inbox. The Clienti workspace can review real `booking_requests` and `booking_change_requests`, refresh pairing, match or explicitly create customers, inspect availability/account-impact state, reject or leave requests pending, convert new booking requests through the existing customer/operator booking flow, and apply change/cancellation requests through the lifecycle service. It is not a client app, public web booking UI, or cloud sync surface. See [Booking Inbox](booking-inbox.md).

SPIAGGIA.1 clarifies the active layout relationship for Booking. Operator booking flows consume the protected `activeLayoutProjection` through the operational Spiaggia read model; Studio drafts and layout previews remain design inputs until controlled publication. Booking, availability, account, and customer operations must not depend on an unaccepted Studio draft. See [Spiaggia Active Layout Boundary](spiaggia-active-layout-boundary.md).

## Availability Contract

Availability is central to Booking. BOOKING.3 implements the local-first engine behind these functions:

- `getItemAvailability(itemId, period)`
- `getAvailableItems(period, filters)`
- `getAvailabilityForDate(date)`
- `getAvailabilityForRange(startDate, endDate, filters)`
- `detectBookingConflicts(bookingDraft)`
- `canConfirmBooking(bookingDraft)`

Availability must support:

- daily booking
- multi-day booking
- seasonal booking
- custom/operator-agreed period
- item-specific booking
- item-type availability
- conflict detection

Daily availability has priority and must be efficient and reliable.

Seasonal bookings are often agreed directly with the operator, but they still exist in the model and still block or affect availability for their relevant periods.

BOOKING.3 implementation files:

- `src/lib/booking/availability.types.ts`
- `src/lib/booking/availabilityDate.ts`
- `src/lib/booking/availabilityRepository.ts`
- `src/lib/booking/availabilityService.ts`
- `src/lib/services/availabilityService.ts`

The engine reads existing `reservations`, active layout items, and `availability_locks`. It does not seed fake data, create UI, or replace the existing reservation write flow.

See `docs/architecture/booking-availability-engine.md` for blocking policy, lock handling, overlap rules, proof cases, and limitations.

## Articoli / Pricing Boundary

Booking uses Articoli/pricing rules to calculate price before confirmation, but a confirmed booking must not depend only on live pricing values.

When a booking is confirmed or converted from a request:

1. Calculate from `tariff_rules`, included items, extras, and operator context.
2. Create `PricingSnapshot`.
3. Link the snapshot to booking and folio/account.
4. Preserve confirmed totals when Articoli/pricing rules change later.

Allowed operations:

- operator manual override
- recalculation before confirmation
- explicit reprice action after confirmation

BOOKING.1 does not implement the full pricing engine.

## Folio / Account Boundary

Current UI already has conto da preparare, residuals, account status, payments, and account panels. Booking connects to that model; it does not replace it.

Canonical relationship:

```text
Booking
  -> Folio / Conto
  -> Folio lines / account extra rows
  -> Payment records
  -> Registry events
```

Folio states:

- `to_prepare`
- `open`
- `partial`
- `paid`
- `cancelled`
- `closed`
- `manual_review`

Client web/app payment path, contractually:

1. Payment intent or payment record is accepted by policy.
2. Payment record is attached to folio/account.
3. Folio/account balance and status update.
4. Booking payment state projection updates.
5. Registry event is emitted.
6. Operator app sees the updated state.

No payment gateway is implemented in BOOKING.1.

## Registry Event Boundary

Important booking mutations now emit or link registro events through the BOOKING.9 event store. Current `registryService` remains a projection over reservations/accounts and is not replaced.

Event types:

- `booking_created`
- `booking_confirmed`
- `booking_period_changed`
- `booking_cancelled`
- `booking_completed`
- `booking_change_requested`
- `booking_change_accepted`
- `booking_change_rejected`
- `customer_paired`
- `folio_created`
- `folio_updated`
- `folio_manual_review_required`
- `payment_recorded`
- `credit_or_refund_required`
- `pricing_snapshot_created`
- `pricing_reprice_required`
- `availability_conflict_detected`

Integration point: repositories/services that create or mutate booking, folio/account, pricing snapshot, customer pairing, and payment records.

## Integration Map

- Spiaggia: item availability, item assignment, selected item UI, active layout projection.
- Clienti: customer profile, pairing, booking history.
- Articoli: price rules, included/extras, pricing snapshot.
- Registro: operational event history and read model.
- Conti: folio/account, residual, payments.
- Dashboard: active bookings, pending requests, open accounts, conflicts, today availability.
- Bar: orders/services can attach to folio/customer/booking; Bar remains a separate operational domain.

## BOOKING.2 Persistence Mapping

BOOKING.2 keeps `reservations` as the current persisted operator-side Booking table. It does not create a duplicate `bookings` table.

Current runtime ownership remains:

- `reservations`: current booking persistence for operator-created reservations.
- `customers`: customer identity source.
- `accounts`: current Conto/Folio persistence until Folio refactor.
- `payments`: current payment records.
- `tariff_rules`, `extra_item_catalog`, `account_extra_items`, `tariff_included_items`: current Articoli pricing and extra inputs.

BOOKING.2 adds supplementary tables:

- `booking_requests`
- `booking_status_events`
- `booking_conflicts`
- `availability_locks`
- `pricing_snapshots`
- `booking_folio_links`
- `booking_registry_event_links`

These tables are persistence foundations only. Current operator UI, selected-item workflow, customer assignment, period editor, account/payment behavior, tariff suggestions, active layout, Canvas, and registry projections remain unchanged.

BOOKING.3 will use this foundation for the availability engine, especially `reservations`, `booking_conflicts`, and `availability_locks`.

See `docs/architecture/booking-schema-map.md` for the detailed table ownership and migration map.

## Safety Rules For This Wave

- No active layout mutation.
- No live Canvas changes.
- No UI behavior changes.
- No duplicate booking subsystem.
- No fake cloud, client app, payment gateway, or Bar data.
- No duplicate customer, account, registry, pricing, layout, or booking subsystem.

## BOOKING.4 Implementation Note

BOOKING.4 now:

- use `booking_requests` and customer payloads as pairing inputs;
- avoid automatic duplicate customer creation;
- produce pairing candidates and record operator decisions;
- remain separate from the availability engine until Booking Inbox/operator acceptance combines both signals;
- avoid changing active layout or Canvas behavior.

## Manual Proof Cases

- Existing audit: this document lists inspected current files and concepts; no duplicate subsystem is created.
- Usage modes: `operator_app`, `client_web`, `client_app`, `sync_cloud`, and `import_ai` are defined as modes.
- Availability: daily availability is prioritized; seasonal booking is included and operator-friendly.
- Customer pairing: request-to-customer matching is defined and duplicate customer avoidance is explicit.
- Folio/payment: client payment update path is contractual only; no gateway is implemented.
- Articoli snapshot: confirmed booking pricing snapshot boundary is defined.
- Registro: booking event types are defined.
- Safety: no active layout, live Canvas, UI, or current business logic change is introduced.
