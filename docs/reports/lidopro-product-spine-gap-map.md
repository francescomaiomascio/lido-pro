# LidoPro Product Spine Gap Map

Audit wave: PROJECT.AUDIT.0
Date: 2026-05-18

This map compares `docs/architecture/product-spine.md` with the current repository implementation. It reports current state only; it does not update the product spine.

## Home

Status: partial

Current files:

- `src/components/dashboard/LidoProDashboard.svelte`
- `src/components/dashboard/homeOperationalModel.ts`
- `src/components/dashboard/Home*.svelte`
- `src/styles/shell.css`

Real behavior:

- Home starts the app.
- Uses real `layout`, `items`, `summary`, `workspaceSummary`, `runtime`, and `extraCatalog` props.
- Shows beach, accounts, reservations, activity, command actions, and a domain rail.

Placeholders / fake / fixture:

- Bar is hardcoded unconfigured.
- Staff counters are hardcoded zero.
- Studio state is static text.
- Recent activity is synthesized from active accounts/reservations, not a registry event log.

Risks:

- Mixes real and placeholder status in the same dashboard.
- Still uses `Listino` labels.
- Rebuild should wait until Booking/Folio/Registro/Bar/Studio emit real projections.

Next wave:

- `HOME.FINAL` should wait. Short-term: only audit/label placeholder data if needed.

Blocking dependencies:

- Booking repository/read model.
- Folio/account event model.
- Registry event integration.
- Real Bar/Staff storage.
- Studio publication status projection.

## Spiaggia

Status: partial

Current files:

- `src/app/AppShell.svelte`
- `src/components/beach/BeachMap.svelte`
- `src/components/beach/BeachItemList.svelte`
- `src/components/map-canvas/BeachCanvasShell.svelte`
- `src/components/map-canvas/BeachCanvasStage.svelte`
- `src/lib/services/beachLayoutService.ts`
- `src/lib/map-canvas/currentLayoutProjection.ts`
- `src/lib/layout/layoutProjectionBoundary.ts`

Real behavior:

- Renders active layout as map/list.
- Selects a beach item and opens the operational bottom panel.
- Loads assigned customer, current reservation, active account, payments, extras, tariff suggestion, and registry context.
- Displays active layout protected ribbon.

Placeholders / fake / fixture:

- Canvas Studio edit toggle exists inside the operational Canvas surface.
- No visual booking availability overlay yet.

Risks:

- Protected active layout and edit tools are still too close.
- Future booking-aware UI could duplicate current selected-item workflow unless mapped carefully.

Next wave:

- `SPIAGGIA.1 Active Layout Projection Boundary`.

Blocking dependencies:

- Clear Studio publication boundary.
- Booking availability model.
- Decision on Canvas Studio edit affordance in operator map.

## Studio

Status: partial

Current files:

- `src/components/settings/panels/MapStudioSettingsPanel.svelte`
- `src/components/settings/map-studio/MapStudioPanel.svelte`
- `src/components/settings/map-studio/MapStudioSketchCanvas.svelte`
- `src/components/settings/map-studio/dashboard/*`
- `src/components/settings/map-studio/board/*`
- `src/components/settings/map-studio/state/*`
- `src/lib/map-canvas/parametric/*`
- `src/lib/db/sqliteAdapter.ts`

Real behavior:

- Loads or creates parametric draft from active layout.
- Supports project dashboard and sketch canvas.
- Has perimeter, functional areas, tracks, footprints/object parameters, metric constraints, verification/preview/publication state.
- Can calculate and save draft preview elements.
- Repository supports active/draft/archived layout versions.

Placeholders / fake / fixture:

- Backup/status dashboard rows include fixture-like data.
- Publication state exists but full safe operator publication workflow was not proven.

Risks:

- Multiple Studio implementations/surfaces coexist: sketch canvas, board shell, dashboard, active Canvas Studio flyout.
- Active layout publication could collide with operational booking/account state if not bounded.

Next wave:

- `STUDIO.1 Sketch Canvas Consolidation` after `SPIAGGIA.1`, or a dedicated Studio duplication audit.

Blocking dependencies:

- Active layout projection boundary.
- Publication safety rules.
- Booking availability protection.

## Booking

Status: partial

Current files:

- `src/lib/types/reservation.ts`
- `src/lib/db/reservationRepository.ts`
- `src/lib/services/reservationService.ts`
- `src/lib/services/bookingFlowService.ts`
- `src/lib/booking/bookingDomain.types.ts`
- `docs/architecture/booking-domain-contract.md`
- `src/components/operational/*`
- `src/app/AppShell.svelte`

Real behavior:

- Existing `Reservation` records claim item/customer/date period.
- Daily and seasonal periods exist.
- Item date-overlap availability check exists.
- Operator flow connects selected item -> customer -> period -> account -> payment/extras.

Placeholders / fake / fixture:

- No booking request runtime.
- No customer pairing runtime.
- No pricing snapshot persistence.
- No folio/registry event link tables.

Risks:

- Runtime Booking domain is not centralized.
- BOOKING.2 could duplicate `reservations` if migration/refactor plan is weak.
- Shell owns too much of the booking transaction flow.

Next wave:

- `BOOKING.2 SQLite Tables / Local-first Schema`, grounded in existing `reservations`.

Blocking dependencies:

- Migration/deprecation map for `reservations`.
- Account/folio relationship decision.
- Pricing snapshot table design.

## Clienti

Status: partial

Current files:

- `src/lib/types/customer.ts`
- `src/lib/services/customerService.ts`
- `src/lib/services/customerProfileService.ts`
- `src/lib/db/customerRepository.ts`
- `src/components/customers/*`

Real behavior:

- Customer create/update/search exists.
- Beach item assignment exists.
- Customer profile aggregates current assignment, reservation, account, payments, extras, and history.
- Customer workspace has list/detail/edit/create UI.

Placeholders / fake / fixture:

- Disabled shortcuts in empty state.
- No request pairing/merge workflow.

Risks:

- Duplicate customer creation remains possible.
- Pairing from web/app requests is not implemented.

Next wave:

- `CLIENTI.1 Customer Profile / Booking History` is partly underway; safer next is customer pairing foundation after BOOKING.4.

Blocking dependencies:

- BookingRequest model.
- Pairing candidate scoring.
- Duplicate/merge policy.

## Staff / Dipendenti

Status: placeholder

Current files:

- `src/components/employees/EmployeesView.svelte`
- `src/components/employees/EmployeesTable.svelte`
- `src/components/employees/EmployeeDetailPanel.svelte`
- `src/components/employees/employeeModel.ts`
- `src/lib/navigation/lidoproNavigation.ts`

Real behavior:

- Topbar module opens Staff workspace.
- In-memory empty array powers table and summary.
- Filters and detail panel UI exist.

Placeholders / fake / fixture:

- No persisted staff records.
- Create/edit/status/assign actions are disabled.
- No Spiaggia/Bar assignment repository.

Risks:

- UI shell can be mistaken for implemented Staff domain.
- Adding fixture employees would create misleading operational data.

Next wave:

- `STAFF.1 Staff Module Foundation` should start with storage/domain contract, not fake data.

Blocking dependencies:

- Staff table/repository decision.
- Registry event boundary for staff actions.
- Bar/Spiaggia assignment model.

## Bar

Status: planned

Current files:

- `src/lib/navigation/lidoproNavigation.ts`
- `src/components/dashboard/homeOperationalModel.ts`
- `src/components/dashboard/HomeDomainStatusRail.svelte`

Real behavior:

- Disabled topbar item exists.
- Home reports Bar as not configured.

Placeholders / fake / fixture:

- Bar status is hardcoded.
- No Bar workspace, orders, cash desk, catalog link, folio link, or registry link.

Risks:

- Dashboard Bar references could look implemented.
- Articoli catalog may absorb Bar needs without a clear Bar domain boundary.

Next wave:

- `BAR.1 Bar Workspace Foundation` after Articoli/Folio/Registro foundations.

Blocking dependencies:

- Articoli catalog categories.
- Folio line model.
- Registry event model.

## Articoli

Status: partial

Current files:

- `src/components/tariffs/TariffPanel.svelte`
- `src/components/settings/panels/TariffsSettingsPanel.svelte`
- `src/lib/types/tariff.ts`
- `src/lib/types/extraItem.ts`
- `src/lib/services/tariffService.ts`
- `src/lib/services/extraItemService.ts`
- `src/lib/db/tariffRepository.ts`
- `src/lib/db/extraItemRepository.ts`

Real behavior:

- Tariff rules persist.
- Extra item catalog persists.
- Included items exist.
- Account extra rows persist and recalculate account totals.
- Price suggestions are used in booking/account flow.

Placeholders / fake / fixture:

- Inventory/stock overrides use `localStorage`.
- Bar catalog is not modeled separately.

Risks:

- Live UI still says `Listino`; product spine says `Articoli`.
- `priceList` module id is stale.
- Pricing snapshots do not exist.

Next wave:

- `ARTICOLI.1 Rename UI module Listino -> Articoli`, after producing a rename map.

Blocking dependencies:

- Decision whether `priceList` id is renamed or kept internal.
- Booking pricing snapshot schema.
- Folio line schema.

## Conti / Folio

Status: partial

Current files:

- `src/lib/types/account.ts`
- `src/lib/db/accountRepository.ts`
- `src/lib/services/accountService.ts`
- `src/components/accounts/*`
- `src/components/operational/editors/AccountInlineEditor.svelte`
- `src/components/operational/editors/PaymentInlineEditor.svelte`

Real behavior:

- Account model exists.
- Manual account total update exists.
- Payments insert and recalculate balance.
- Account extras contribute to total.
- Close/cancel account methods exist.
- Payment schedules/installments exist in schema/types.

Placeholders / fake / fixture:

- Folio terminology is not runtime canonical yet.
- No online payment/client payment path.
- No append-only adjustment/storno model.

Risks:

- Account total updates are mutable.
- Booking link is still via `reservation.accountId`, not canonical booking/folio link.

Next wave:

- `FOLIO.1 Folio Model / Account states` after BOOKING.2 design.

Blocking dependencies:

- Booking schema.
- Pricing snapshot.
- Registry event model.

## Registro

Status: partial

Current files:

- `src/lib/types/registry.ts`
- `src/lib/services/registryService.ts`
- `src/lib/state/registryFilters.ts`
- `src/components/registry/*`
- `src/components/settings/panels/RegistrySettingsPanel.svelte`

Real behavior:

- Registry UI exists with filters, summary, insights, table, detail panel.
- Registry rows are derived from reservations/accounts/customers/items/payments/extras.
- Open registry request can filter by selected item/customer.

Placeholders / fake / fixture:

- No real event store.
- No booking/account/payment event emission.
- No append-only audit log.

Risks:

- It is a projection/read model, not a source-of-truth operational diary.
- Future event integration must not break current read model.

Next wave:

- `REGISTRO.1 Booking Event Integration`, after booking and folio write boundaries exist.

Blocking dependencies:

- Booking repository write boundary.
- Folio/payment event contract.
- Event table or outbox decision.

## Client App

Status: missing

Current files:

- None found for a separate client app shell.
- Mentions exist in `product-spine.md` and booking contract docs.

Real behavior:

- None.

Placeholders / fake / fixture:

- None in runtime.

Risks:

- Premature UI would be disconnected from BookingRequest, Folio, payments, and sync.

Next wave:

- Wait until booking core/request/status and sync/account boundaries exist.

Blocking dependencies:

- Booking requests.
- Customer identity/pairing.
- Cloud/account or local client token model.

## Web Booking

Status: missing

Current files:

- None found for public web booking routes/API.
- Mentions exist in product/legal docs and booking contract.

Real behavior:

- None.

Placeholders / fake / fixture:

- None in runtime.

Risks:

- Web booking without availability and pairing would mutate operations unsafely.

Next wave:

- `WEBBOOKING.1 Public Booking Contract` after BOOKING.3/4.

Blocking dependencies:

- Availability engine.
- BookingRequest persistence.
- Customer pairing.
- Cloud/API boundary.

## Landing Web

Status: missing

Current files:

- No landing site/routes found.
- Product/legal docs define public claims boundaries.

Real behavior:

- None.

Placeholders / fake / fixture:

- README and brand assets exist, but no app landing product site.

Risks:

- Marketing claims must not imply live cloud, payments, AI, or customer portal before implementation.

Next wave:

- Wait; not on critical path for operator app foundation.

Blocking dependencies:

- Product positioning.
- Public claim checklist.
- Web build/deployment decision.

## Cloud / Account / Sync

Status: placeholder / planned

Current files:

- `src/components/layout/AppAccountMenu.svelte`
- `src/lib/account/localAccountMenu.ts`
- `src/components/settings/panels/SystemSettingsPanel.svelte`
- `src/lib/platform/runtimeTarget.ts`
- SQLite adapter/runtime files.

Real behavior:

- Local account/workspace menu exists.
- Runtime diagnostics report native/web/memory storage.
- Capacitor Android project exists.

Placeholders / fake / fixture:

- Google/Apple/provider/cloud sync/customer portal are disabled/planned labels.
- No auth, tenant, remote storage, outbox, sync metadata, API, or backend.

Risks:

- Current tables lack workspace/sync metadata.
- Cloud retrofit could become invasive if not planned before new booking tables.

Next wave:

- `CLOUD.R0 Storage and Sync Readiness Audit` after booking schema direction is clear, or before any broad schema expansion.

Blocking dependencies:

- Workspace/tenant identity model.
- Outbox/event strategy.
- Sync metadata columns.

## AI Integration

Status: planned

Current files:

- `docs/architecture/product-spine.md`
- `docs/architecture/booking-domain-contract.md`

Real behavior:

- None.

Placeholders / fake / fixture:

- None in runtime.

Risks:

- Adding ChatDock before a typed draft/validation contract could create unsafe direct mutations.
- Client/web AI must remain excluded for now.

Next wave:

- `AI.1 AI Integration Boundary / Operator-only Policy`.

Blocking dependencies:

- Operator shell insertion point.
- Typed action draft contract.
- Domain validators for Booking/Cliente/Conto.
- Local LAN adapter security/privacy policy.
