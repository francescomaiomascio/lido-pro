# MAP.R4 — Canvas Construction Kit + Settings Visual Hardening

## Summary

MAP.R4 hardens the Canvas map foundation without changing the active beach data. The visible Canvas keeps using the current 58-item layout, while the rendering code gains shared primitives, style tokens, layer ordering, tool contracts, and a state lock.

## Settings UI changes

The Spiaggia settings panels now use shared settings components for a cleaner structure:

- `SettingsSurface`
- `SettingsHeader`
- `SettingsSectionCard`
- `SettingsControlGroup`
- `SettingsMetricGrid`
- `SettingsStatusPill`
- `SettingsFieldRow`

The updated panels keep the existing live controls for grid, background, asset rendering, validation, and work/edit mode, but present them with clearer hierarchy and more compact metrics.

## Render kit

The internal render kit lives in `src/lib/map-canvas/renderKit/` and provides shared drawing utilities for:

- primitives
- shadows
- labels
- surfaces
- markers
- rings
- text sizing and contrast

Renderer files now start to call the kit instead of carrying all drawing details inline.

## Style tokens

`styleTokens.ts` centralizes Canvas colors, grid opacity, shadows, borders, radii, and font sizes. New rendering work should read from these tokens instead of scattering hardcoded colors across renderer files.

## Layer model

`layers.ts` defines the draw order:

- background
- surface
- zones
- walkways
- grid
- assets
- selection
- validation
- debug

The Canvas stage uses this order as the main rendering contract.

## Tool registry

`tools.ts` defines the editor tool skeleton:

- select
- pan
- zoom
- inspect
- move_planned
- add_asset_planned
- zone_planned
- walkway_planned
- validate

Planned tools are declared but disabled. MAP.R4 does not implement drag or editor mutations.

## State lock

`stateLock.ts` documents the protected MAP.R4 state:

- 58 total elements
- P1/P2/P3/P4/O1/O2/PM counts
- 31m x 28m beach size
- preservation rules against DB, seed, and layout mutation

## What remains planned

Still planned for later waves:

- real drag and move tools
- add asset tools
- zone editor
- walkway editor
- undo and redo
- layout saving
- layout versioning
- final beach object rendering

## Preservation rules

MAP.R4 must not modify:

- `beach_items`
- seed data
- current coordinates
- DB schema
- customers, accounts, payments, reservations, tariffs, extras, registry, or analytics

## Next waves

MAP.R5 focuses on Canvas surface quality, background, grid, and map frame.
