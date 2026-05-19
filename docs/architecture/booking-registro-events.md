# Booking Registro Events

Wave: BOOKING.9
Date: 2026-05-19

## Purpose

BOOKING.9 introduces the local append-style Registro event foundation for Booking, Reservation Lifecycle, Folio, Payment, and Pricing actions.

It does not replace the current Registro screen and it does not remove the current `registryService` projection model. The existing Registro UI remains a read-model over operational data; `registry_events` is the new durable operational diary that later Registro waves can surface more directly.

Canonical rule:

```text
Persisted operation
-> append RegistryEvent once
-> link to booking/request where available
-> keep existing projections stable
```

No event is emitted from read-only summary, availability, pricing comparison, or projection recalculation paths.

## Current Registro Projection Model

Current Registro ownership remains:

- `src/lib/types/registry.ts`
- `src/lib/services/registryService.ts`
- `src/lib/state/registryFilters.ts`
- `src/components/registry/*`
- `src/components/settings/panels/RegistrySettingsPanel.svelte`

The current model builds visible Registro records from existing reservations, customers, accounts, payments, extras, and active-layout context. BOOKING.9 leaves this behavior stable.

## Event Store Boundary

BOOKING.9 adds:

- `src/lib/registry/registryEvent.types.ts`
- `src/lib/registry/registryEventService.ts`
- `src/lib/db/registryEventRepository.ts`
- additive `registry_events` persistence in SQLite and browser-memory fallback

`RegistryEvent` is append-style operational history. Events can be acknowledged, resolved, or voided, but persisted rows are not rewritten as business facts on refresh.

Idempotency is handled through `dedupeKey` where operations can be repeated by reloads or retries.

## Persistence

The additive table is `registry_events`.

It stores:

- source, type, severity, and status
- human-readable title and optional description
- links to reservation, request, customer, account, payment, item, and pricing snapshot
- amount in cents where relevant
- structured payload JSON
- optional workspace, actor, device, and dedupe metadata

The existing `booking_registry_event_links` table is used when an event relates to a reservation or booking request. The link is supplementary; an event can still exist without a booking link.

No fake registry events are seeded.

## Events Emitted Now

Current safe integrations append events only after real persisted operations:

- `booking_created`
- `booking_confirmed`
- `booking_period_changed`
- `booking_cancelled`
- `booking_change_requested`
- `folio_created`
- `folio_updated`
- `folio_manual_review_required`
- `payment_recorded`
- `credit_or_refund_required`
- `pricing_snapshot_created`

The service boundary also defines:

- `booking_completed`
- `booking_change_accepted`
- `booking_change_rejected`
- `customer_paired`
- `pricing_reprice_required`
- `availability_conflict_detected`

Those remain available for later persisted operations and are not faked.

## Integration Points

Booking and lifecycle:

- customer/operator change requests append request events;
- applied period changes append `booking_period_changed`;
- applied cancellations append `booking_cancelled`;
- cancellation or period-change account impact can append manual-review or credit/refund events.

Folio and payments:

- folio preparation appends `folio_created` or `folio_updated`;
- manual adjustments append `folio_updated`;
- payment insertion appends `payment_recorded`;
- cancellations with existing payments append review/credit/refund requirement events without deleting payments.

Pricing:

- snapshot creation appends `pricing_snapshot_created`;
- reprice comparison remains service-level unless a later explicit persisted action requires an event.

## Current UI Bridge

BOOKING.9 keeps the current Registro UI stable. It does not merge events into the visible Registro screen by default.

`registryEventService.toRegistryRecord` provides a small bridge for a later low-risk merge into the current read-model, but the UI is not redesigned in this wave.

## Deferred

- Registro event-first UI.
- Event filters and acknowledgement workflows in the operator screen.
- Cloud sync / outbox / remote replication.
- Audit roles, security policy, and immutable device identity.
- Payment gateway and online client payment events.
- Service, staff, and Studio event emissions.
- Append-only reversal/storno implementation.

## Manual Proof Expectations

- `registry_events` persists and reads in SQLite and browser-memory fallback.
- Repeated persisted operations with the same `dedupeKey` do not duplicate events.
- Existing Registro projections still load.
- Existing booking, folio, account, payment, pricing snapshot, active layout, and Canvas behavior remains unchanged.
