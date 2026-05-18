# Booking Schema Map

Wave: BOOKING.2
Date: 2026-05-18

## Purpose

BOOKING.2 adds local-first Booking persistence without creating a second runtime booking system.

The current persisted booking source remains `reservations`. New tables are supplementary foundations for requests, status history, conflicts, locks, pricing snapshots, and integration links.

## Existing Tables Reused

| Table | Canonical responsibility now | Reused fields | BOOKING.2 decision |
| --- | --- | --- | --- |
| `reservations` | Persisted operator-side Booking records | `id`, `item_id`, `customer_id`, `assignment_id`, `account_id`, `reservation_type`, `start_date`, `end_date`, `status`, `active`, timestamps | Reused as the current booking table. No `bookings` table was created. |
| `customers` | Customer identity source | `id`, contact fields, active/timestamps | Reused. No duplicate customer model. |
| `accounts` | Current Conto/Folio persistence until Folio refactor | `id`, `item_id`, `customer_id`, amounts, status, timestamps | Reused. Booking/Folio link table is additive. |
| `payments` | Current payment records | `account_id`, amount, method, timestamps | Reused. No payment gateway or new payment model. |
| `tariff_rules` | Current Articoli/Listino pricing input | item type, reservation type, amount, priority, dates | Reused for future pricing snapshots. |
| `extra_item_catalog` | Current extra/service catalog input | name, category, default amount, limits | Reused for future Articoli/Servizi catalog work. |
| `account_extra_items` | Current account extra lines | account link, catalog link, quantity, totals | Reused. |
| `tariff_included_items` | Included equipment/pricing context | tariff/item context and included quantities | Reused. |

## Reservation Mapping

`reservations` maps to canonical Booking as follows:

| Booking concept | Current field |
| --- | --- |
| Booking id | `reservations.id` |
| Beach item / posto | `reservations.item_id` |
| Customer | `reservations.customer_id` |
| Assignment | `reservations.assignment_id` |
| Current folio/account | `reservations.account_id` |
| Period type | `reservations.reservation_type` |
| Period dates | `reservations.start_date`, `reservations.end_date` |
| Current operator status | `reservations.status`, `reservations.active`, `reservations.cancelled_at` |

BOOKING.2 adds additive local-first metadata columns to `reservations`:

- `source`
- `booking_mode`
- `booking_status`
- `period_type`
- `sync_state`
- `remote_id`
- `version`
- `deleted_at`
- `pricing_snapshot_id`
- `folio_id`
- `request_id`

These columns do not replace current runtime behavior. They allow later Booking waves to map existing reservations into the broader domain contract.

## New Supplementary Tables

| Table | Purpose | Active in current UI? |
| --- | --- | --- |
| `booking_requests` | Future client web/app/import booking requests and customer payloads | No |
| `booking_customer_pairing_candidates` | BOOKING.4 scored candidate links from request payloads to existing customers | No |
| `booking_status_events` | Future booking/request status history | No |
| `booking_conflicts` | Future availability conflict records for BOOKING.3 | No |
| `availability_locks` | Future web/app hold/lock flows | No |
| `pricing_snapshots` | Future confirmed-booking pricing freeze for BOOKING.7 | No |
| `booking_folio_links` | Explicit booking-to-account/folio link foundation | No |
| `booking_registry_event_links` | Future event-journal link from booking/request to Registro | No |

No fake request, lock, conflict, snapshot, folio link, or registry link rows are seeded.

## Why No `bookings` Table

The current app already persists real operator booking behavior in `reservations` and connects it to selected beach items, customers, periods, accounts, payments, tariff suggestions, and registry projections.

Creating a separate `bookings` table in BOOKING.2 would duplicate active runtime responsibility and risk diverging from the selected-item operator workflow. A dedicated `bookings` table can only be reconsidered later with a migration/deprecation plan that moves `reservations` safely or reclassifies them as a compatibility view.

## Adapter and Repository Boundary

BOOKING.2 adds:

- `src/lib/booking/bookingPersistence.types.ts`
- `src/lib/db/bookingRepository.ts`
- additive methods on `BeachDatabaseAdapter`
- native SQLite implementations
- browser-memory fallback implementations

Existing `reservationRepository` remains the runtime path for current operator reservations.

BOOKING.4 extends the same boundary with request pairing methods:

- `getBookingRequestById`
- `listPairingCandidates`
- `replacePairingCandidates`
- `updateBookingRequestPairingStatus`
- `resolveBookingRequestPairing`

The candidates table links to existing `customers`; it does not create a second customer source.

## Deferred Cloud/Sync Fields

BOOKING.2 adds or reserves local-first fields where safe:

- `workspace_id` on new request/lock tables
- `sync_state`
- `remote_id`
- `version`
- `deleted_at`

Tenant/workspace enforcement, device identity, outbox, remote sync, auth, and conflict resolution remain deferred to Cloud/Account/Sync waves.

## Risks For BOOKING.3+

- `reservations.status` still has the existing narrow runtime states: `draft`, `active`, `completed`, `cancelled`.
- `booking_status` is additive metadata and is not yet the runtime source of truth.
- Availability is still item/date overlap against active reservations.
- Pricing snapshots are stored but not yet generated by confirmation flow.
- Registro remains a projection/read model, not an append-only event journal.
- Folio terminology still maps to current `accounts` until FOLIO.1.
- Web/app requests exist as persistence and customer-pairing foundations; no request inbox or conversion behavior is active yet.

## Manual Proof Expectations

- Existing DB opens and migrates without dropping or rewriting operational rows.
- Active layout, customers, accounts, payments, and reservations still load through existing paths.
- No duplicate `bookings` table exists.
- New supplementary tables exist in SQLite and browser-memory fallback.
- Current operator flow remains unchanged.
