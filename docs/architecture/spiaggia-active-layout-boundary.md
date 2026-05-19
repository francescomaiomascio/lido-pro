# Spiaggia Active Layout Boundary

Wave: SPIAGGIA.1
Date: 2026-05-19

## Purpose

SPIAGGIA.1 clarifies the boundary between the active operational Spiaggia workspace and Studio design/draft workflows.

Spiaggia is the daily operator surface. It consumes a protected `activeLayoutProjection` and exposes operational actions: selection, search, filters, status, booking, customer, period, conto, payments, and availability context.

Studio remains the design workspace. It owns project drafts, parametric setup, layout previews, verification, and future controlled publication.

## Canonical Terms

- `projectDraft`: Studio editable design state.
- `layoutPreview`: generated/verified preview from a Studio draft.
- `activeLayoutProjection`: protected operational layout consumed by Spiaggia.
- `operationalLayoutView`: UI/read model for the Spiaggia Canvas.
- `canvasOperationalTools`: zoom, fit, reset, filters, search, item selection, status and future availability overlays.
- `studioDesignTools`: perimeter, areas, tracks, footprints, constraints, publication, and structural geometry editing.

Rules:

- Spiaggia consumes `activeLayoutProjection`.
- Studio produces `projectDraft` and `layoutPreview`.
- Only a controlled publication workflow can update the active operational projection.
- Spiaggia must not expose `studioDesignTools` as normal operator controls.

## Current Render Path

Current operational path:

```text
AppShell activeLayout module
-> loadActiveOperationalBeachState()
-> loadActiveLayoutProjection()
-> BeachMap
-> activeLayoutProjection
-> operationalLayoutView
-> BeachCanvasShell
-> BeachCanvasStage
```

`BeachCanvasStage` still renders the same active Canvas elements and selection behavior. The input has been clarified as an operational projection rather than a generic draft-capable layout view.

## Active Layout Source

`src/lib/services/beachLayoutService.ts` now exposes:

- `loadActiveLayoutProjection()`
- `loadActiveOperationalBeachState()`

Operational reload paths use `loadActiveOperationalBeachState()` so booking, customer, account, reservation, and extra operations return the protected active projection even if Studio has recently opened a draft/preview view.

The previous mode-aware `loadBeachState({ viewMode })` remains available for Studio/preview contexts, but it is no longer the default operational reload path for Spiaggia.

## Boundary Code

`src/lib/layout/layoutProjectionBoundary.ts` defines:

- `ActiveLayoutProjection`
- `ProjectDraftLayout`
- `LayoutPreviewProjection`
- `OperationalLayoutView`
- `createActiveLayoutProjection`
- `createOperationalLayoutView`
- `isActiveLayoutProjection`
- `describeLayoutProjectionSource`
- `assertOperationalLayoutSource`

`src/lib/layout/operationalLayoutViewModel.ts` prepares future booking-aware overlays with `OperationalLayoutItemView`. It currently includes real item status, reservation id, account id, customer id, and a non-fake `availabilityState: 'not_checked'` placeholder.

## Studio Affordance Demotion

The active Spiaggia Canvas no longer mounts the Canvas Studio toggle, Studio rail, or Studio flyout in normal operation.

Removed from active Spiaggia operation:

- Canvas Studio open/toggle control.
- Studio rail and tool selection.
- Studio flyout with rendering/library/grid/design controls.
- active Canvas edit-mode badge.

Preserved operational controls:

- zoom in/out;
- fit/reset;
- search/filter result count;
- item selection;
- selected item quick action panel;
- map/list switch;
- selected-item booking panel.

The Studio components and draft data remain in the codebase and Studio route.

## Studio And Preview

Studio still owns:

- parametric setup;
- draft creation from active;
- draft calculation;
- preview/diff foundations;
- future controlled publication.

SPIAGGIA.1 does not publish Studio drafts and does not mutate active layout geometry. Draft/preview data is not deleted.

## Booking Preparation

The operational view model prepares later booking-aware overlays without rendering fake markers.

Future SPIAGGIA/BOOKING work can attach:

- BOOKING.3 availability result;
- current reservation/account/customer state;
- conflict markers;
- date/period overlays.

No availability overlay is implemented in this wave.

## Deferred

- STUDIO.6 controlled publication from verified preview to active projection.
- Full Studio preview overlay in a clearly labeled Studio context.
- Booking-aware Canvas availability overlay.
- Conflict marker rendering.
- Active layout projection versioning/sync policy.

## Manual Proof Expectations

- Opening Spiaggia shows the active operational Canvas.
- Selected item behavior and booking panel still work.
- Studio design controls are not normal Spiaggia controls.
- Zoom/search/filter/select/status controls remain operational.
- Studio route remains available and draft data is preserved.
- Active layout geometry, reservations, accounts, and customers are not mutated.
