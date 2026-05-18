# Booking Customer Pairing

Wave: BOOKING.4
Date: 2026-05-18

## Purpose

BOOKING.4 adds the customer pairing engine for future web, client-app, import, and AI booking requests.

The engine compares a `booking_requests.customer_payload_json` payload against existing `customers` and stores scored pairing candidates. It does not create or mutate customer records automatically.

Core rule:

```text
Pairing suggests.
Operator decides.
No duplicate customer is created silently.
```

## Canonical Owners

| Area | Owner |
| --- | --- |
| Customer identity | `customers`, `src/lib/types/customer.ts`, `src/lib/db/customerRepository.ts`, `src/lib/services/customerService.ts` |
| Request payload | `booking_requests.customer_payload_json` |
| Pairing candidates | `booking_customer_pairing_candidates` |
| Pairing decision state | `booking_requests.pairing_status`, `matched_customer_id`, `pairing_decision_json`, `pairing_resolved_at` |
| Availability | BOOKING.3 availability service, separate from customer identity pairing |

No duplicate customer table or customer model is introduced.

## Existing Customer Fields

Current matching can use:

- `customers.full_name`
- `customers.phone`
- `customers.email`
- `customers.notes` only as contextual data, not as a scoring key
- `customers.active`

Current customer search is simple text search across full name, phone, and email. It is appropriate for operator UI search, but pairing needs deterministic normalization because request payloads can format phone and email differently from stored records.

## Duplicate Risks

External requests can arrive with:

- phone numbers formatted with spaces, punctuation, or country prefix;
- email case differences;
- display names split into first/last fields;
- incomplete identity payloads;
- the same returning customer using a new channel.

Auto-creating a new customer from every request would fragment booking history, accounts, payments, and operator context. BOOKING.4 therefore stores candidates and decisions, but only creates a customer through `customerService.createCustomer` when an explicit `create_new` decision is applied.

## Input Payload

The pairing engine accepts:

- `name`
- `fullName`
- `firstName`
- `lastName`
- `phone`
- `email`
- `notes`
- `source`
- `rawPayload`

`fullName` remains compatible with the BOOKING.2 request contract. `name`, split fields, and raw payload support later web/client-app/import adapters without changing the customer table.

## Normalization Rules

Phone normalization:

- trims whitespace;
- removes spaces, hyphens, parentheses, and dots;
- normalizes `00` prefix to `+`;
- strips leading `+39` when safe for Italian numbers.

Email normalization:

- trims;
- lowercases.

Name normalization:

- trims;
- lowercases;
- removes combining accents;
- collapses repeated whitespace.

The engine intentionally avoids a heavy fuzzy-search library and does not destructively rewrite Italian names.

## Scoring Rules

Pairing is deterministic:

| Match | Score |
| --- | ---: |
| Phone exact or normalized | 70 |
| Email exact | 70 |
| Full name exact | 30 |
| Similar first/last name | 15-25 |
| Previous booking hint | 10 |
| Manual hint | 10 |

Reasons are stored with each candidate:

- `phone_exact`
- `phone_normalized`
- `email_exact`
- `name_exact`
- `name_similar`
- `previous_booking`
- `manual_hint`

## Confidence

| Score | Confidence |
| ---: | --- |
| `>= 70` | `high` |
| `>= 40` | `medium` |
| `< 40` | `low` |

A high-confidence phone or email match can be recommended to the operator. Name-only matches can become candidates, but they are not enough for silent matching.

## Request States

When candidates are generated:

- candidates exist: `pairing_status = candidates_found`
- no candidates but enough customer payload exists: `pairing_status = new_customer_required`
- insufficient payload: `pairing_status = unpaired`

When a decision is applied:

- `match_existing`: `pairing_status = matched_existing`, `matched_customer_id` is set
- `create_new`: customer creation is allowed only through `customerService.createCustomer`, then `pairing_status = manually_resolved`; the created customer id is recorded as the matched customer id for the request
- `leave_unpaired`: `pairing_status = unpaired`
- `reject`: `pairing_status = rejected`, request `status = rejected`

All decisions are stored in `pairing_decision_json` with `pairing_resolved_at`.

## Relationship To Booking Inbox

BOOKING.4 does not create the operator inbox UI. The future Booking Inbox should combine:

- pairing state from BOOKING.4;
- availability state from BOOKING.3;
- request status;
- operator decision controls.

The inbox will decide whether to match, create, leave unpaired, reject, or later convert a request into a reservation.

## Relationship To Client App And Web Booking

Client App and Web Booking can submit request payloads later. They must not create customers directly. They should create `booking_requests` and let the pairing engine produce candidates for operator review.

## Availability Relationship

Customer pairing does not confirm availability.

BOOKING.3 answers whether the requested item/period is available. BOOKING.4 answers whether the request identity probably maps to an existing customer. A future acceptance flow must satisfy both concerns before converting a request to an operational reservation.

## Limitations

- No customer pairing UI exists yet.
- No web booking UI exists yet.
- No client app UI exists yet.
- No fake booking requests are seeded.
- Previous booking and manual hints are typed/scored, but no UI feeds them yet.
- `reservations` remains the current persisted booking source.
- `booking_requests` remains a future request foundation until Booking Inbox/operator flows are implemented.
