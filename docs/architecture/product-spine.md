# LidoPro Product Spine

## 0. Purpose

LidoPro is a local-first operational platform for beach establishments.

It is not only a beach map. It is a product spine connecting:

- Spiaggia
- Studio
- Booking
- Clienti
- Articoli
- Conti/Folio
- Registro
- Servizi
- Staff
- Client App
- Web Booking
- Landing Web
- Cloud/Account/Sync
- AI Integration

The operator app remains authoritative. Client web/app modes request, pay, and receive updates through controlled booking, customer, account, and registry flows.

Status vocabulary:

- DONE
- CURRENT
- NEXT
- TODO
- WAIT
- BLOCKED
- PARTIAL
- PLACEHOLDER
- MISSING

Canonical naming:

- Product: LidoPro
- Layout module/user-facing: Spiaggia
- Pricing/catalog module: Articoli
- `Listino`: internal concept inside Articoli, not a top-level module
- Servizi: top-level operational macro for service workflows
- Bar: sub-area inside Servizi

## 1. Usage Modes

### operator_app

Operator app for bagnino/commerciale. The operator can create, modify, confirm, assign, collect, correct, and override according to policy.

### client_web

Public booking web mode. The client sees availability, sends booking requests, may pay if enabled, and receives status updates.

### client_app

Smartphone/tablet client mode. The client sees bookings, account/folio status, services, requests, service orders, and profile data.

### sync_cloud

Account, tenant/lido, backup, sync, multi-device, notifications, and API boundary.

### import_ai

AI/import prepares drafts. Operator confirms. System validates. Only then data can be written.

Rule: do not describe features as present app vs future app. Describe each capability by usage mode and implementation status.

## 2. Core Operational Chain

```text
Cliente
-> Booking / Richiesta
-> Disponibilita
-> Posto / Periodo
-> Articoli / Pricing Snapshot
-> Conto / Folio
-> Pagamento
-> Registro
-> Dashboard
-> Web/App cliente
```

Rule: Booking is not a table. Booking is an operational transaction connecting customer, place, period, availability, pricing, folio, payment, registry, dashboard, and client-facing status.

## 3. Studio -> Spiaggia Pipeline

```text
Studio Project Draft
-> Sketch parametrico
-> Layout Preview
-> Verifica
-> Pubblicazione controllata
-> Layout attivo Spiaggia
-> Booking operativo
-> Conti / Registro / Dashboard
```

Rules:

- Studio does not directly mutate Spiaggia active layout.
- Studio produces drafts, previews, verification results, and controlled publication.
- Spiaggia consumes `activeLayoutProjection`.
- Operational booking, account, and customer activity remains protected from unsafe layout publication.

## 4. Current Tracker

```text
CURRENT
- BOOKING.4 - Customer Pairing

NEXT
- SPIAGGIA.1 - Active Layout Projection Boundary
- ARTICOLI.1 - Rename UI module Listino -> Articoli

SUPPORT NEXT
- FOLIO.1 - Folio/account boundary
- REGISTRO.1 - Booking event boundary

WAIT
- HOME.FINAL
- Client App UI
- Web Booking UI
- Cloud backend
- ChatDock runtime
- Servizi runtime
- Staff persistence
```

## 5. Macro Areas

### 5.1 Home

Status: PARTIAL / WAIT

Purpose: operational dashboard and final cockpit.

Current reality:

- Home starts the app.
- It uses some real data projections.
- It still mixes real data with placeholder statuses for Servizi, Staff, Studio, and catalog.
- It should not be final-rebuilt until Booking, Folio, Registro, Servizi, Staff, and Studio emit real projections.

Consegne:

- [WAIT] HOME.FINAL.1 - Dashboard booking-driven.
- [WAIT] HOME.FINAL.2 - Spiaggia + Servizi live cockpit.
- [WAIT] HOME.FINAL.3 - Conti / Pagamenti / Registro live.
- [WAIT] HOME.FINAL.4 - Richieste cliente / pairing / warning.
- [WAIT] HOME.FINAL.5 - Studio publication gate.

Blocked by:

- Booking repository/read model
- Folio/account event model
- Registry event integration
- Servizi storage/runtime
- Staff storage/runtime
- Studio publication projection

Rule: do not keep rebuilding Home before data domains are real.

### 5.2 Spiaggia

Status: PARTIAL

Purpose: operational active beach workspace.

Current reality:

- Active layout renders map/list.
- Selected item opens the operational panel.
- Customer, period, account, payments, extras, and registry context are already connected.
- Canvas Studio/edit affordance is still too close to the operational Canvas.

Consegne:

- [NEXT] SPIAGGIA.1 - Active Layout Projection Boundary.
- [TODO] SPIAGGIA.2 - Booking-aware Selected Item Panel.
- [TODO] SPIAGGIA.3 - Disponibilita visuale su Canvas operativo.
- [TODO] SPIAGGIA.4 - Modifiche operative leggere.
- [TODO] SPIAGGIA.5 - Pubblicazione Studio -> Layout attivo.

Rules:

- Spiaggia = operativita.
- Studio = progettazione.
- Do not let the active Canvas become the structural design editor.

### 5.3 Studio

Status: PARTIAL / BLOCKED

Purpose: parametric design, sketch, drafts, preview, verification, controlled publication.

Current reality:

- Studio loads/creates a parametric draft from active layout.
- Sketch canvas exists.
- Perimeter, areas, tracks, object parameters, constraints, and preview state exist.
- Multiple Studio surfaces/code paths still coexist.
- End-to-end safe publication workflow is not proven.

Consegne:

- [BLOCKED] STUDIO.1 - Sketch Canvas Consolidation. Blocked by SPIAGGIA.1.
- [TODO] STUDIO.2 - Aree funzionali + tracciati.
- [TODO] STUDIO.3 - Ingombri / footprint / vincoli dimensionali.
- [TODO] STUDIO.4 - Layout Preview Generator.
- [TODO] STUDIO.5 - Verifica collisioni / distanze / capienza / disponibilita.
- [TODO] STUDIO.6 - Pubblicazione controllata verso Layout attivo.
- [TODO] STUDIO.7 - Rimozione vecchie superfici duplicate.

Rule: Studio produces draft/preview/verification. Studio does not directly mutate active operational Spiaggia.

### 5.4 Booking

Status: PARTIAL

Purpose: central operational transaction.

Current reality:

- Runtime has `Reservation`, `reservationService`, `bookingFlowService`, item/date availability, and operator flow selected item -> customer -> period -> account.
- Booking is not yet centralized.
- `BookingRequest` persistence exists as a local-first foundation for future inbox/web/client/import flows.
- Customer pairing runtime exists for deterministic request-to-customer candidate scoring and explicit operator decisions.
- Pricing snapshot, folio link, registry link, conflict, status event, and availability lock persistence exists as additive BOOKING.2 tables.
- Confirmation flow still uses existing `reservations`; request inbox and conversion are not active yet.

Consegne:

- [DONE] BOOKING.1 - Domain Contract / Usage Modes.
- [DONE] BOOKING.2 - SQLite Tables / Local-first Schema. Existing `reservations` remain current booking persistence; supplementary request/event/conflict/lock/snapshot/link tables are additive.
- [DONE] BOOKING.3 - Availability Engine. Local-first service evaluates availability from existing `reservations` and `availability_locks`; no UI/web/client flow yet.
- [DONE] BOOKING.4 - Customer Pairing. Local-first engine scores request payloads against existing customers, stores pairing candidates, and records explicit operator decisions without silent customer creation.
- [DONE] BOOKING.5 - Operator Booking Flow. Existing Spiaggia selected-item workflow is backed by `operatorBookingService`, validates availability before writes, and preserves current reservation/account/payment/extras behavior.
- [CURRENT] BOOKING.6 - Client-first Booking Flow.
- [TODO] BOOKING.7 - Articoli Pricing Snapshot.
- [TODO] BOOKING.8 - Folio / Conto Engine.
- [TODO] BOOKING.9 - Registro Event Integration.
- [TODO] BOOKING.10 - Booking Inbox / Richieste cliente.

Rules:

- Daily availability is priority.
- Seasonal/custom periods are supported and often operator-driven.
- Operator app commands.
- Web/client app requests and receives updates.

### 5.5 Clienti

Status: PARTIAL

Purpose: single customer identity and operational history.

Current reality:

- Customer create/update/search exists.
- Assignment exists.
- Customer profile aggregates assignment, reservation, account, payments, extras, and history.
- Request pairing foundation exists in Booking; no customer-facing merge UI or inbox workflow exists yet.

Consegne:

- [TODO] CLIENTI.1 - Customer Profile / Booking History hardening.
- [TODO] CLIENTI.2 - Customer Pairing Foundation after BOOKING.4.
- [TODO] CLIENTI.3 - Duplicate detection.
- [TODO] CLIENTI.4 - Merge assistito.
- [TODO] CLIENTI.5 - Customer token / client identity link for web/app.
- [TODO] CLIENTI.6 - Stable links to booking, folio, registry.

Rule: Cliente is the shared customer archive. Web/app requests must not auto-create duplicate customers.

### 5.6 Articoli

Status: PARTIAL

Purpose: catalog of operational items, services, extras, equipment, and price rules.

Current reality:

- Live UI still says `Listino`.
- Runtime id `priceList` is stale but can be kept internal until a safe rename.
- Tariff rules, extra item catalog, included items, and account extras exist.
- Price suggestions feed the booking/account flow.
- Pricing snapshots are missing.
- Stock/inventory overrides are still localStorage/presentational.

Consegne:

- [NEXT] ARTICOLI.1 - Rename UI module Listino -> Articoli. First produce/execute a controlled rename map.
- [TODO] ARTICOLI.2 - Catalogo Articoli Spiaggia / Servizi / Extra.
- [TODO] ARTICOLI.3 - Pricing rules: daily / multi-day / seasonal / custom.
- [TODO] ARTICOLI.4 - Pricing Snapshot per Booking.
- [TODO] ARTICOLI.5 - Copertura prezzi / articoli mancanti.
- [TODO] ARTICOLI.6 - Articoli -> righe conto / folio lines.
- [TODO] ARTICOLI.7 - Move inventory/stock overrides from localStorage to persistence.

Rules:

- Articoli is the top-level product module.
- Listino is an internal pricing/catalog view.
- Servizi consumes Articoli for service items and orders.

### 5.7 Conti / Folio

Status: PARTIAL

Purpose: accounts, balances, payments, folio lines, corrections.

Current reality:

- Account model exists.
- Payments insert and recalculate balance.
- Account extras recalculate totals.
- Close/cancel exists.
- Folio terminology is not runtime canonical.
- No online payment/client payment path.
- No append-only adjustment/storno model.

Consegne:

- [TODO] FOLIO.1 - Folio Model / Account states.
- [TODO] FOLIO.2 - Booking -> Conto automatico.
- [TODO] FOLIO.3 - Righe conto da Articoli / Extra / Servizi.
- [TODO] FOLIO.4 - Pagamento manuale operatore.
- [TODO] FOLIO.5 - Pagamento cliente web/app -> conto aggiornato.
- [TODO] FOLIO.6 - Storni / rettifiche append-only.
- [TODO] FOLIO.7 - Registry Event Link.

Rules:

- Payment and ledger changes are append/storno/rettifica.
- No blind destructive update for financial events.

### 5.8 Registro

Status: PARTIAL

Purpose: operational journal and audit surface.

Current reality:

- Registry UI exists.
- Registry is a read model/projection over reservations, accounts, customers, items, payments, and extras.
- No real event store.
- No booking/account/payment event emission.
- No append-only audit log.

Consegne:

- [TODO] REGISTRO.1 - Booking Event Integration.
- [TODO] REGISTRO.2 - Conto / pagamento / storno events.
- [TODO] REGISTRO.3 - Servizi events.
- [TODO] REGISTRO.4 - Staff events.
- [TODO] REGISTRO.5 - Origini: Spiaggia / Servizi / Studio / Sistema / Cliente.
- [TODO] REGISTRO.6 - Audit operativo append-only.

Rule: Registro becomes the operational diary, not only a projected report.

### 5.9 Servizi

Status: PLACEHOLDER

Purpose: operational services domain.

Servizi contains:

- Bar
- comande
- service requests
- extra service flows
- future rentals/noleggi
- links to customer, booking, folio, and registry

Current reality:

- The former dedicated Bar macro was only a disabled topbar item and Home placeholder.
- No workspace, route, repository, order/comanda model, catalog boundary, folio link, or registry link exists.
- Bar is now represented as the first sub-area under Servizi.

Consegne:

- [TODO] SERVIZI.1 - Servizi Workspace Foundation.
- [TODO] SERVIZI.2 - Servizi catalog boundary inside Articoli.
- [TODO] SERVIZI.3 - Bar sub-area foundation.
- [TODO] SERVIZI.4 - Comanda locale.
- [TODO] SERVIZI.5 - Servizio/Comanda -> cliente / booking / folio.
- [TODO] SERVIZI.6 - Registro eventi Servizi.
- [TODO] SERVIZI.7 - Pagamento / saldo / folio condiviso.
- [TODO] SERVIZI.8 - Home status reale for Servizi.

Rules:

- Servizi is the top-level macro.
- Bar is not a top-level macro.
- Bar is one service area.
- Do not fake comande/incassi.
- Do not hide Servizi inside Articoli.
- Servizi uses Articoli, Clienti, Folio, and Registro.

### 5.10 Staff / Dipendenti

Status: PLACEHOLDER

Purpose: operational staff domain.

Current reality:

- Topbar module exists.
- UI shell exists.
- Data is an in-memory empty array.
- No repository/service/SQLite/persistence.
- Actions are disabled.

Consegne:

- [TODO] STAFF.1 - Staff Storage / Domain Contract.
- [TODO] STAFF.2 - Ruoli e assegnazioni Spiaggia / Servizi.
- [TODO] STAFF.3 - Presenza / turno placeholder operativo.
- [TODO] STAFF.4 - Registro eventi Staff.
- [TODO] STAFF.5 - Dashboard staff status reale.

Rules:

- Staff = operational: who works, where, role, state.
- No fake payroll, contracts, legal HR, or timekeeping.

### 5.11 Client App

Status: MISSING / WAIT

Purpose: smartphone/tablet client mode.

Current reality:

- Current repo is operator-app only.
- No client app shell exists.

Consegne:

- [WAIT] CLIENTAPP.1 - Client App Shell smartphone/tablet.
- [TODO] CLIENTAPP.2 - Le mie prenotazioni.
- [TODO] CLIENTAPP.3 - Richiedi prenotazione.
- [TODO] CLIENTAPP.4 - Conto / Pagamenti.
- [TODO] CLIENTAPP.5 - Servizi / Extra.
- [TODO] CLIENTAPP.6 - Profilo cliente.

Blocked by:

- BookingRequest
- Customer identity/pairing
- Folio
- Sync/account or customer token boundary

Rule: Client App is a usage mode, not distant future. Do not build UI before request/status/account boundaries.

### 5.12 Web Booking

Status: MISSING / WAIT

Purpose: public booking mode for customer.

Current reality:

- No public web booking routes/API.

Consegne:

- [WAIT] WEBBOOKING.1 - Public Booking Contract after BOOKING.3/4.
- [TODO] WEBBOOKING.2 - Availability API Adapter.
- [TODO] WEBBOOKING.3 - Booking Request Status / Token cliente.
- [TODO] WEBBOOKING.4 - Customer Pairing Inbox.
- [TODO] WEBBOOKING.5 - Pagamento cliente -> Folio / Registro.

Blocked by:

- Availability engine
- BookingRequest persistence
- Customer pairing
- Cloud/API boundary

Rule: client requests. Operator or policy confirms. State returns to the client.

### 5.13 Landing Web

Status: MISSING / WAIT

Purpose: public product site for LidoPro.

Current reality:

- No landing site/routes.

Consegne:

- [WAIT] WEB.1 - Landing LidoPro prodotto.
- [TODO] WEB.2 - Pages: Spiaggia, Servizi, Booking, Studio, AI, Cloud.
- [TODO] WEB.3 - Demo / richiesta pilot.
- [TODO] WEB.4 - Area pubblica lido.
- [TODO] WEB.5 - Booking pubblico per singolo lido.
- [TODO] WEB.6 - Account / onboarding commerciale.

Rule: Landing sells LidoPro. Web Booking serves the lido's final customer.

### 5.14 Cloud / Account / Sync

Status: PLACEHOLDER

Purpose: tenant, auth, sync, backup, multi-device, API, storage.

Current reality:

- Local account menu exists.
- System panel describes providers/sync as planned.
- No tenant table, auth, remote storage, outbox, sync metadata, API/backend.
- Current tables lack tenant/workspace/sync fields.

Consegne:

- [WAIT] CLOUD.R0 - Storage and Sync Readiness Audit.
- [TODO] CLOUD.R1 - Tenant Metadata Foundation.
- [TODO] CLOUD.R2 - Sync Metadata Migration.
- [TODO] CLOUD.R3 - Repository Write Boundary.
- [TODO] CLOUD.R4 - Local Outbox Tracking.
- [TODO] CLOUD.R5 - Mock Sync Engine.
- [TODO] CLOUD.R6 - Auth / Tenant Shell.
- [TODO] CLOUD.R7 - Backend Bootstrap.
- [TODO] CLOUD.R8 - Initial Upload.
- [TODO] CLOUD.R9 - Pull Snapshot to New Device.
- [TODO] CLOUD.R10 - Bidirectional Incremental Sync.
- [TODO] CLOUD.R11 - Conflict Rules.
- [TODO] CLOUD.R12 - Roles / Audit / Security.

Rules:

- SQLite remains the operational engine.
- Cloud syncs, authorizes, replicates, stores, and exposes APIs.
- Do not start with cloud before repository/outbox readiness.

### 5.15 AI Integration

Status: WAIT

Purpose: operator-only AI assistant.

Current reality:

- No ChatDock.
- No local LAN AI adapter.
- No cloud AI gateway.
- No Qwen/local model config.
- No typed action draft contract.

Consegne:

- [WAIT] AI.1 - AI Integration Boundary / Operator-only Policy.
- [TODO] AI.2 - Typed Action Draft Contract.
- [TODO] AI.3 - Local LAN AI Adapter Contract.
- [TODO] AI.4 - ChatDock Shell.
- [TODO] AI.5 - AI -> Booking/Cliente/Folio draft integration.
- [TODO] AI.6 - Import assistant: Articoli, clienti, prenotazioni.
- [TODO] AI.7 - Studio assistant: layout draft suggestions.
- [TODO] AI.8 - Cloud AI Gateway boundary.

Rules:

- AI only for `operator_app` initially.
- No AI in client app/web booking for now.
- AI proposes.
- Operator confirms.
- System validates.
- Only then data writes.
- Local LAN testing may target Qwen 3.5 9B Q8_0 or another configured local model.

## 6. Implementation Order

PHASE 1 - Spine Normalization

1. PRODUCT.SPINE.1 - this wave
2. ARTICOLI.1 - Listino -> Articoli rename map/UI rename
3. SPIAGGIA.1 - Active Layout Projection Boundary

PHASE 2 - Booking Core

4. BOOKING.2 - SQLite schema/repository grounded in reservations/accounts
5. FOLIO.1 - Folio/account boundary design
6. REGISTRO.1 - event boundary design
7. BOOKING.3 - Availability Engine
8. BOOKING.4 - Customer Pairing

PHASE 3 - Operator Flows

9. BOOKING.5 - Operator Booking Flow in Spiaggia
10. BOOKING.6 - Client-first Booking Flow
11. BOOKING.7 - Pricing Snapshot
12. BOOKING.8 - Folio / Conto Engine
13. BOOKING.9 - Registro Event Integration
14. BOOKING.10 - Booking Inbox

PHASE 4 - Domain Foundations

15. STAFF.1 - Staff storage/domain contract
16. SERVIZI.1 - Servizi workspace foundation
17. ARTICOLI.2 - Catalogo Spiaggia/Servizi/Extra
18. SPIAGGIA.2 - Booking-aware selected item panel

PHASE 5 - External Modes

19. WEBBOOKING.1 - Public booking contract
20. CLIENTAPP.1 - Client app shell
21. CLOUD.R0 - Storage/sync readiness audit
22. AI.1 - Operator-only AI boundary

PHASE 6 - Studio + Publication

23. STUDIO.1 - Sketch/Studio consolidation
24. STUDIO.2-6 - preview, verifica, pubblicazione

PHASE 7 - Final Home

25. HOME.FINAL - dashboard realmente data-driven

## 7. Rules

1. Inventory the existing implementation first.
2. Then modify, extend, or delete what already exists.
3. Do not create disconnected parallel systems.
4. Do not distinguish present/future; distinguish usage modes.
5. Operator app commands; web/app client modes request, pay, and receive updates.
6. Local SQLite remains primary; cloud syncs and shares.
7. AI proposes, operator confirms, system validates.
8. Final Home waits for real data.
9. Servizi is the macro; Bar is a sub-area.
10. Articoli is the macro; Listino is an internal concept.
