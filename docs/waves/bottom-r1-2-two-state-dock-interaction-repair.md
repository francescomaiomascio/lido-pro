# BOTTOM.R1.2 — Two-State Bottom Dock + Interaction Repair

## Purpose

BOTTOM.R1.2 replaces the intermediate section/module layout with a cleaner two-state bottom dock.

## Problems From BOTTOM.R1/R1.1

The earlier redesign removed the old tab bar but still looked like an internal dashboard, with too many visible section labels and a second-header feeling.

## Closed Dock Behavior

With no selected item, the panel is a compact dock showing:

- Spiaggia BDF
- 58 places
- local/offline state
- a short prompt
- quick actions for list, filters, tariffs, and extras

## Selected Expanded Behavior

Selecting a map item expands the dock automatically and shows an integrated identity line with item code, type, status, customer, period, and balance.

## Riepilogo/Gestione Model

The selected state has only two internal modes:

- Riepilogo: read-only operational summary
- Gestione: compact action rows and one focused editor at a time

## Click Repair Checklist

- Visible buttons use `type="button"`.
- Disabled actions are disabled only when the workflow dependency is missing.
- Only one editor is opened at a time.
- The old multi-tab navigation is not rendered.

## Responsive Behavior

Desktop and tablet use compact rows and grid summaries. Narrow screens stack rows without horizontal overflow.

## Validation Results

Run for delivery:

- `pwd`
- `node -v`
- `npm -v`
- `npm run check`
- `npm run build`
- `npm run cap:sync`
- `npx cap sync android`

## Data/Map Preservation Checks

No DB schema, seed, map geometry, coordinates, or 58-item layout data should be modified by this wave.

## Next Recommended Wave

BOTTOM.R2 — Inline Editors / Workflow Forms Hardening
