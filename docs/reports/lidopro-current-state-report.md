# LidoPro Current State Report

Audit wave: PROJECT.AUDIT.0
Date: 2026-05-18
Scope: report-only repository audit before further verticalizing `docs/architecture/product-spine.md`.

This report is based on repository inspection and validation commands run in the local workspace. It does not treat roadmap text as implemented behavior.

## Repository Baseline

Status: partial / risky

- Current branch: `main`.
- Active shell Node during the original audit: `v20.20.2`.
- Current project engine requirement: `node >=24.0.0` in `package.json`.
- Node 24 available at `/opt/homebrew/opt/node@24/bin/node` (`v24.15.0`).
- Main stack: Svelte 5, Vite 8, TypeScript, Tauri 2, Capacitor 8, Android, local SQLite through `@capacitor-community/sqlite`, `jeep-sqlite`, and `sql.js`.
- Package scripts include `dev`, `build`, `check`, Tauri build/dev, Capacitor sync/run/open commands, and validation aliases.

Dirty/untracked baseline from `git status --short`:

- Modified: `src/app/AppShell.svelte`, customer panels, dashboard, topbar, system panel, navigation, customer profile service/types, settings/shell CSS.
- Added/untracked from prior waves: `docs/architecture/booking-domain-contract.md`, `docs/architecture/product-spine.md`, `src/lib/booking/bookingDomain.types.ts`, new customer/dashboard/employees files, `src/lib/services/demoOperationsSeedService.ts`.
- No report should assume this is a clean branch. Several audited files are already dirty and appear to contain in-progress product work.

Validation results:

- `npm run check`: passed, 0 errors and 0 warnings.
- `npm run build`: passed.
- `npm run cap:sync`: failed with active shell Node `v20.20.2` because the project now requires Node `>=24.0.0`.
- `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run cap:sync`: passed.
- `PATH=/opt/homebrew/opt/node@24/bin:$PATH npx cap sync android`: passed.
- `git diff --check`: passed before report creation.

Known build warnings:

- Vite externalizes `crypto` for browser compatibility from `jeep-sqlite`.
- Vite reports large chunks above 500 kB.
- Vite plugin timing report appeared on one build pass.

Known validation limitations:

- No native simulator/device responsive validation was run because this audit does not change UI.
- Capacitor validation depends on Node 24 PATH in this environment.
- `npm run cap:sync` and `npx cap sync android` can copy generated web assets into Android; no separate functional Android runtime test was performed.

## Product Spine Status

Status: partial

Implemented:

- `docs/architecture/product-spine.md` exists and is now the canonical product spine file.
- Macro areas listed: Home, Spiaggia, Studio, Booking, Clienti, Articoli, Registro, Conti/Folio, Bar, Staff, Client App, Web Booking, Landing Web, Cloud/Account/Sync, Final Home, AI Integration.
- Current/next markers exist.
- AI Integration exists with operator-only policy, ChatDock plan, local LAN adapter plan, cloud gateway boundary, and the rule that AI proposes, operator confirms, system validates, then writes.
- Cloud/Account/Sync exists as a macro.
- Client App, Web Booking, Landing Web, Staff, Bar, Studio, and Spiaggia are represented.

Partially implemented / stale:

- `product-spine.md` says the topbar/product module should be `Articoli`, but live navigation still uses `Listino` in `src/lib/navigation/lidoproNavigation.ts`, `src/app/AppShell.svelte`, `src/components/dashboard/HomeDomainStatusRail.svelte`, `src/components/dashboard/HomeWorkQueue.svelte`, `src/components/dashboard/homeOperationalModel.ts`, `src/components/tariffs/TariffPanel.svelte`, and CSS class names.
- `BOOKING.1` is marked `DONE`, while `BOOKING.2` is `NEXT`/`CURRENT` depending on section wording. The tracker says `CURRENT - BOOKING.2`, which is consistent after BOOKING.1 completion.
- Product module names and route ids are not yet aligned: `priceList` still represents the future `Articoli` module.

Missing:

- No executable AI Integration code.
- No client app, public web booking, landing web, cloud sync, or tenant implementation.

## Shell / Navigation Status

Status: partial

Implemented:

- Startup screen is the `dashboard` module in `src/app/AppShell.svelte`.
- The shell renders `AppTopBar`, a primary workspace, and the operational bottom panel only for `activeLayout`.
- Topbar modules are configured in `src/lib/navigation/lidoproNavigation.ts`.
- `Layout` has been renamed to `Spiaggia` in live navigation through module id `activeLayout`.
- `Dipendenti`/Staff appears in the topbar as `employees`.
- `Bar` appears in topbar as a disabled planned item.
- `Sistema` is not a primary topbar module; it is opened by utility buttons and the account/avatar menu.
- Account/avatar menu exists through `src/components/layout/AppAccountMenu.svelte` and `src/lib/account/localAccountMenu.ts`; it is local-only and links to `Sistema`.

Partially implemented:

- `Listino` still appears as a user-facing topbar module and page aria label. Canonical `Articoli` is not yet applied to the live shell.
- Shell contains direct orchestration for many domain actions in `AppShell.svelte`: customer assignment, reservation create/update/cancel, account create/update/payment/close, extras, read models. This is functional but centralizes domain workflow in the shell.

Placeholder / planned:

- Bar topbar item is disabled with a planned-module message.
- Account/provider menu entries for Google/Apple/cloud integrations are disabled/planned.

Responsive risks:

- Topbar has many modules and horizontal scroll; it is likely sensitive on small widths.
- `AppShell.svelte` coordinates map, panels, and module pages in one component, increasing regression risk for responsive changes.

## Home Dashboard Status

Status: partial

Implemented:

- Home is rendered by `src/components/dashboard/LidoProDashboard.svelte`.
- Current composition: cockpit header, command bar, beach panel, work queue, domain status rail, accounts panel, reservations panel, activity feed.
- Model is built by `src/components/dashboard/homeOperationalModel.ts`.
- Data sources are mostly real projections from `layout`, `items`, `summary`, `workspaceSummary`, `runtime`, and `extraCatalog`.
- Tables/lists exist for accounts, reservations, activity, and work queue.
- Empty states exist for account/reservation/activity tables.

Partially implemented:

- Home is data-driven for beach items, current reservations, active accounts, residuals, and extra catalog count.
- Bar, Staff, Studio, and some catalog status values are placeholders or derived from static zero/default values.
- Recent activity is synthesized from active accounts and reservations, not from a real registry event stream.
- Work queue includes real-ish checks for maintenance, open balances, missing accounts/customers/periods, plus placeholder Bar and Studio boundary items.

Placeholder / fixture / mock:

- Bar status is hardcoded unconfigured.
- Staff status is hardcoded zero/none in the Home model despite a Staff module shell existing.
- Studio status is static summary text, not driven by live project/draft data.
- Dashboard command `Configura Bar` routes to `priceList` but is disabled.

Risks:

- Home still uses `Listino` labels in rail/work queue/commands.
- Some data is real and some is placeholder in the same surfaces, so future verticalization must label placeholders clearly or replace them.

## Spiaggia / Active Layout Status

Status: partial

Implemented:

- Active layout is rendered in `src/app/AppShell.svelte` under module `activeLayout`.
- Map path: `src/components/beach/BeachMap.svelte` -> `src/components/map-canvas/BeachCanvasShell.svelte` -> `BeachCanvasStage.svelte`.
- List path: `src/components/beach/BeachItemList.svelte` and row components.
- Selected item behavior is real: selecting a canvas item sets `viewState.selectedItemId`, opens the operational panel, loads status events, payments, price suggestion, reservation summary, ledger, and included equipment.
- Operational bottom panel supports customer assignment, period editing, account creation/update, payments, extras, and registry opening.
- Active layout projection merges parametric elements with legacy items in `src/lib/services/beachLayoutService.ts`.
- `src/lib/layout/layoutProjectionBoundary.ts` documents draft/preview/active layout boundaries.

Partially implemented:

- Active layout is described as protected in UI, but `BeachCanvasShell.svelte` includes a Canvas Studio edit toggle/flyout in the operational map. That creates a boundary risk between live operations and editing affordances.
- Canvas element projection sets elements as locked, but map config can enter edit mode for Canvas Studio tools.
- Booking concepts exist through `currentReservation`, assigned customer, active account, period/account panel, and list rows, but they are not yet a canonical Booking domain implementation.

Real data sources:

- `loadBeachState()`, SQLite adapter repositories, active/draft parametric layout bundles, current reservations, active accounts, assigned customers, extra/catalog repositories.

Missing:

- Booking-aware availability overlay on Canvas.
- Formal active-layout publication gate tied to Booking availability.
- Visual conflict/availability status beyond current item status and filters.

## Studio / Parametric / Sketch Status

Status: partial

Implemented:

- Studio entry is `MapStudioSettingsPanel` mounted under module `studioProjects`.
- Studio loads/creates a parametric draft from active layout via `parametricLayoutRepository`.
- `MapStudioPanel.svelte` provides a dashboard or sketch canvas depending on project state.
- Sketch canvas includes command bar, toolbar, viewport, HUD, properties panel, status bar, selection/manipulation state, and project lifecycle.
- Parametric entities exist: perimeter, functional areas, tracks, object parameters, metric constraints, validation/preview/publication states.
- Preview calculation writes draft layout elements through `calculateAndSaveDraft`.
- Active/draft/compare layout view mode exists via `setParametricLayoutViewMode`.
- Layout versions support active/draft/archived in SQLite.

Partially implemented:

- `MapStudioShell.svelte` and board components exist, while `MapStudioPanel.svelte` mounts `MapStudioDashboard` and `MapStudioSketchCanvas`. There are multiple Studio surfaces/code paths, creating duplication/staleness risk.
- Publication is represented by state and repository methods (`activateDraftParametricLayout`) but no audited end-to-end publication workflow was proven in this report.
- Dashboard backup entries in `mapStudioDashboardModel.ts` include fixture-like backup records.

Placeholder / fake:

- Backup UI in Studio appears presentational.
- Some publication/status labels are lifecycle state rather than complete operational gates.

Relationship to active layout:

- Active layout is imported into parametric versions.
- Draft preview can be shown on active layout view mode.
- Active layout can be activated from draft at repository level, but the operator-facing safe publication workflow is not fully established.

## Booking Status

Status: partial

Implemented:

- Existing booking-like model is `Reservation` in `src/lib/types/reservation.ts`.
- Reservation types: `daily` and `seasonal`.
- Reservation statuses: `draft`, `active`, `completed`, `cancelled`.
- Repositories/services: `src/lib/db/reservationRepository.ts`, `src/lib/services/reservationService.ts`, `src/lib/services/bookingFlowService.ts`.
- `bookingFlowService` connects selected item, assigned customer, period, price suggestion, and account creation/update.
- `checkItemAvailability` exists in SQLite adapter and checks date overlap for one item against active/draft reservations.
- Operational UI flow exists through `BookingSheet.svelte`, `PeriodInlineEditor.svelte`, `CustomerInlineEditor.svelte`, account/payment/extra editors, and `OperationalBottomPanel.svelte`.
- BOOKING.1 added type contract in `src/lib/booking/bookingDomain.types.ts` and architecture doc in `docs/architecture/booking-domain-contract.md`.

Partially implemented:

- Booking is not yet a formal runtime domain. It is scattered across reservation types, booking flow service, AppShell handlers, operational components, account/tariff services, and registry projection.
- Availability is item/date overlap only; it is not a full availability engine for filters, item-type availability, seasonal policies, request queues, or conflict objects.
- No `BookingRequest` runtime, request inbox, customer pairing workflow, pricing snapshot persistence, folio link table, or registry event link table exists.

Files likely involved in BOOKING.2:

- `src/lib/db/schema.ts`
- `src/lib/db/migrations.ts`
- `src/lib/db/sqliteAdapter.ts`
- `src/lib/types/db.ts`
- `src/lib/db/reservationRepository.ts`
- `src/lib/services/reservationService.ts`
- `src/lib/services/bookingFlowService.ts`
- `src/lib/booking/bookingDomain.types.ts`
- `src/app/AppShell.svelte`
- operational booking components

Risks:

- A new Booking implementation could duplicate `reservations` unless migration/refactor ownership is explicit.
- Shell-level orchestration currently couples Booking, Account, Customer, Tariff, and Registry flows.

## Clienti Status

Status: partial

Implemented:

- Data model: `src/lib/types/customer.ts` with customer and beach item customer assignment.
- Services/repositories: `customerService`, `customerProfileService`, `customerRepository`.
- Customer workspace: `CustomerRegistryPanel.svelte`, list pane, profile panel, anagrafica form, empty states.
- Customer profile aggregates assignments, reservations, accounts, payments, extras, and current activity.
- Customer history and ledger-like summaries exist as read models.
- Create/update customer works through validation helpers.

Partially implemented:

- Links to reservations/accounts/registry exist as projections, but not as a formal customer identity/pairing system.
- Pairing readiness is low: search/summary can help humans, but no candidate scoring, duplicate detection, merge, or request-pairing workflow exists.

Risks:

- Duplicate customers can still be created manually.
- Customer profile reads across repositories without a dedicated customer domain repository/read-model boundary.

## Staff / Dipendenti Status

Status: placeholder / partial shell

Implemented:

- Topbar integration exists as `employees`.
- UI files exist: `EmployeesView.svelte`, `EmployeesTable.svelte`, `EmployeeDetailPanel.svelte`, `employeeModel.ts`.
- Model fields include name, role, status, phone, email, assigned area, active shift, notes, timestamps.
- Filters exist for search, role, status, assignment.
- Empty table and detail empty states exist.

Placeholder / fixture / mock:

- `EmployeesView.svelte` initializes `employees` as an empty in-memory array.
- No repository, service, SQLite table, seed, or persistence exists.
- New/edit/status/assign buttons are disabled.
- No real assignment to Spiaggia/Bar exists.

Do not fake later:

- Payroll, contracts, legal HR, or timekeeping should remain out of scope unless a real domain is introduced.

## Bar Status

Status: planned / placeholder

Implemented:

- Bar appears as a disabled topbar item.
- Home has Bar status text and an unconfigured domain rail item.
- Product spine includes Bar macro.
- Articoli/Listino has generic item catalog that could later include bar items.

Missing:

- No Bar workspace component, route/module id, repository, order/comanda model, catalog category boundary, folio/account link, or registry event integration.

Risks:

- Home currently references Bar with placeholder values; this must not be interpreted as a working Bar module.
- Dashboard command routes Bar configuration conceptually to Listino/priceList, which may become stale after Articoli rename.

## Articoli / Listino Status

Status: partial with stale naming

Implemented:

- Runtime module id is `priceList`; UI label is still `Listino`.
- `TariffPanel.svelte` combines place tariffs, extra articles, included equipment, inline pricing, stock-like local overrides, and generated asset previews.
- Data model includes `TariffRule`, `ExtraItemCatalogEntry`, `AccountExtraItem`, and `TariffIncludedItem`.
- Services/repositories exist for tariff rules and extra item catalog/account extras.
- Tariff suggestions feed account creation/update through `bookingFlowService` and account UI.
- Account extras recalculate account totals.

Partially implemented:

- Some Articoli behavior exists already, but canonical module naming has not been migrated.
- Inventory/stock overrides are stored in `localStorage`, not SQLite, and are presentational until inventory persistence exists.
- Bar item readiness is conceptual through generic catalog categories, not a Bar-specific catalog boundary.
- Pricing snapshot readiness is missing: confirmed reservations/accounts use current tariff suggestions and account notes, not immutable snapshots.

Stale user-facing names:

- Topbar, page aria label, dashboard rail, work queue labels, system text, Studio notes, CSS class names, and tariff panel shell still use `Listino`.

## Registro / Conti / Payments Status

Status: partial

Implemented:

- Account model exists with type, status, base/extras/total/paid/balance, notes, active/open/close timestamps.
- Payment model exists and is append-only in current repository API: payments are inserted and not edited/deleted.
- Account total update and close/cancel exist.
- Account extras recalculate totals.
- Registry UI exists with filters, summary strip, insights, table, and detail panel.
- `registryService` projects reservation and account records into `RegistryRecord` rows.
- Dashboard consumes active accounts/reservations and synthesized activity.

Partially implemented:

- Registry is a read-model/projection over reservations/accounts, not a true event journal.
- Beach item status events exist separately as `beach_item_status_events`.
- No `booking_created`, `payment_recorded`, `folio_updated`, or append-only adjustment event store exists.
- Account total updates are mutable updates, not append-only adjustments.
- Close account sets `active = 0` but does not create a separate event.

Gaps for booking-driven ledger:

- Folio/account needs clearer Booking link.
- Payments need registry event linkage.
- Reversals/storni need append-only model.
- Pricing snapshots and account lines need durable boundaries.

## Client App / Web Booking / Landing Web Status

Status: missing / planned only

Implemented:

- No route system or separate client app/web booking/landing app was found.
- Product/legal docs mention boundaries and planned surfaces.
- Booking contract includes usage modes and request types.

Missing:

- No client app shell.
- No public booking API adapter.
- No customer request token/status surface.
- No landing website implementation.
- No router or separate public pages.

Conclusion:

- Current repo is operator-app only.

## Cloud / Account / Sync Status

Status: placeholder / planned

Implemented:

- Local account menu and System panel describe local account/workspace/provider boundaries.
- Runtime storage supports native SQLite, web persistent SQLite, and browser memory fallback.
- Capacitor Android project exists.
- System UI lists Google/Apple/cloud sync/customer portal as not connected/not active.

Missing:

- No tenant/workspace table beyond static `DEFAULT_WORKSPACE_NAME`.
- No auth, provider configuration, Supabase/backend adapter, API client, cloud storage, sync outbox, remote ids, sync states, or conflict resolution.
- Current business tables generally lack `workspaceId`, `tenantId`, `remoteId`, `syncState`, `deletedAt`, `deviceId`, and version fields.

Mock/local/planned:

- Backup/provider/cloud labels are UI boundary text only.
- Studio dashboard backup rows include fixture-like values.

## AI Integration Status

Status: planned only

Implemented:

- AI Integration exists in `product-spine.md`.
- Booking domain contract includes `import_ai` and AI/import request source concepts.

Missing:

- No `ChatDock`.
- No local LAN AI adapter.
- No cloud AI gateway.
- No Qwen/local model configuration.
- No AI action draft contract.
- No AI mutation path exists.

Architectural insertion point:

- AI should be inserted as an operator-only shell service/dock that can read safe projections and prepare typed drafts.
- Drafts should pass through domain validators and existing service/repository boundaries before any write.
- It should not be mounted in client app or web booking surfaces.

## Data / Storage / Schema Status

Status: partial

Implemented tables:

- `app_meta`
- `beach_layouts`
- `beach_items`
- `layout_versions`
- `beach_item_status_events`
- `customers`
- `beach_item_customer_assignments`
- `accounts`
- `payments`
- `reservations`
- `tariff_rules`
- `extra_item_catalog`
- `account_extra_items`
- `tariff_included_items`
- `payment_schedules`
- `payment_installments`
- `beach_layout_versions`
- `beach_layout_elements`
- `beach_layout_rows`
- `beach_layout_zones`
- `beach_layout_distance_rules`
- `beach_layout_asset_metrics`

Implemented:

- `src/lib/types/db.ts` defines a broad `BeachDatabaseAdapter`.
- Repositories wrap adapter methods by domain.
- `sqliteAdapter.ts` contains a native/web SQLite adapter and browser-memory fallback adapter.
- Migrations exist through schema version 12.
- Runtime-safe column alters are guarded in `ensureRuntimeColumns`.

Partially implemented / risky:

- `sqliteAdapter.ts` is large and owns many domains directly.
- Browser-memory fallback duplicates much of the native adapter behavior in the same file.
- Some UI/business orchestration still lives in `AppShell.svelte`.
- Sync readiness fields are absent from current operational tables.
- Tenant/workspace fields are absent from current tables.
- Payment schedules exist but are not central in the current audited UI flow.

Migration risks:

- BOOKING.2 must avoid duplicating `reservations`, `accounts`, `customers`, and `tariff_rules`.
- Adding workspace/sync fields later will touch many tables and adapters.

## Duplication / Stale Code Map

Risky / duplicated / unclear:

- Studio vs Layout sources: legacy `beach_items`, parametric `beach_layout_versions/elements`, `MapStudioPanel`, `MapStudioShell`, board components, and operational Canvas Studio tools coexist.
- Active Spiaggia Canvas includes Canvas Studio edit affordances, blurring protected active layout vs Studio.
- `Listino` vs `Articoli`: canonical map says Articoli, live code still uses `Listino` labels and `priceList` module id.
- Dashboard duplicates navigation/actions already present in topbar and module shell.
- Booking/reservation logic is scattered across `Reservation` types, `bookingFlowService`, `reservationService`, `AppShell`, operational components, account/tariff services, and registry read models.
- Customer/account/registry overlap exists in profile services, reservation summaries, registry service, and dashboard model.
- Settings-era panels remain mounted as product modules (`CustomersSettingsPanel`, `TariffsSettingsPanel`, `RegistrySettingsPanel`, `MapStudioSettingsPanel`, `SystemSettingsPanel`).
- Staff exists as a UI shell only, without storage.
- Bar exists only as a disabled topbar item and Home placeholder.

## Final Recommendation

Five highest-risk architectural issues:

1. Booking is not yet a runtime domain; reservation/account/customer/tariff logic is scattered and shell-orchestrated.
2. Active Spiaggia and Studio/edit tooling are not fully separated in the live Canvas surface.
3. `Listino`/`Articoli` naming and responsibility are inconsistent between product spine and live UI/code.
4. SQLite adapter is a broad multi-domain implementation with native and memory behavior in one large file.
5. Home mixes real operational projections with placeholders for Bar, Staff, Studio, and catalog status.

Five safest next waves:

1. BOOKING.2 schema/repository plan grounded in current `reservations`/`accounts`, with no UI change.
2. ARTICOLI.1 rename audit and UI rename plan, then a small controlled rename wave.
3. SPIAGGIA.1 active layout projection boundary to separate operational Canvas from Studio edit affordances.
4. STAFF.1 storage contract or explicitly placeholder-only hardening, before adding Staff data.
5. AI.1 operator-only boundary doc and typed draft contract, with no ChatDock yet.

Five things not to touch yet:

1. Home final rebuild.
2. Public Web Booking and Client App UI.
3. Cloud sync/auth/backend.
4. Real Bar comande/payments.
5. Studio publication activation flow until active layout and booking availability boundaries are clarified.

Recommended updated order before verticalizing `product-spine.md`:

1. Normalize spine status against this report without changing code.
2. BOOKING.2 schema/repository design and migration/deprecation map.
3. SPIAGGIA.1 active-layout projection and Canvas/Studio boundary.
4. ARTICOLI.1 Listino -> Articoli rename and responsibility cleanup.
5. FOLIO/REGISTRO boundary work for append-only events and booking-driven ledger.
6. BOOKING.3 availability engine.
7. BOOKING.4 customer pairing.
8. Staff/Bar only after storage/domain boundaries are explicit.
9. AI only after AI.1 boundary and draft validation contract.
