# BOTTOM.R1 — Operational Console Redesign

## Purpose

BOTTOM.R1 replaces the old tabbed bottom panel with a single adaptive operational console for the selected beach place.

## Why The Tab Bar Was Removed

The previous `Overview / Cliente / Periodo / Tariffa / Conto / Pagamenti / Extra / Storico / Tecnico` model split one workflow into many page-like tabs. The bottom panel is now a working console: it summarizes the selected place and exposes the next actions directly.

## Compact State Behavior

When no item is selected, or when the selected panel is collapsed, the panel behaves like a compact dock. It shows:

- Spiaggia BDF
- total places
- local/offline status
- backup not configured
- quick actions for list, filters, tariffs, and extras

## Expanded State Behavior

Selecting a map item expands the panel automatically. Selecting a different item updates the console content without changing map data.

## Module Layout

The expanded console uses compact modules:

- Cliente
- Periodo
- Economico
- Dotazioni
- Storico breve
- Tecnico as collapsed secondary disclosure

## Cliente Module

The module shows assigned customer summary when present, or a compact empty state with an assignment action. Customer creation remains in Menu/Settings > Clienti.

## Periodo Module

The module summarizes the active reservation when present. It exposes period editing only after an explicit action.

## Economico Module

Tariffa, Conto, and Pagamenti are unified into Economico. The module shows suggested tariff, totals, paid amount, balance, account state, payment count, and last payment when available.

## Dotazioni Module

Dotazioni summarizes included items and account extras. The global extra catalog remains in Menu/Settings > Extra.

## Storico/Tecnico Behavior

Storico breve shows only compact recent activity and links to the Registro. Tecnico is collapsed by default and exposes item id, layout id, coordinates, and dimensions only when opened.

## Responsive Behavior

Desktop uses a three-column console grid. Tablet narrows to two columns. Phone uses one column and allows controlled bottom-sheet scrolling when unavoidable.

## Data/Map Preservation Checks

BOTTOM.R1 does not modify:

- `beach_items`
- seed data
- coordinates
- 58-item layout count
- map geometry
- database schema

## Validation Results

Validation commands are expected for every delivery:

- `pwd`
- `node -v`
- `npm -v`
- `npm run check`
- `npm run build`
- `npm run cap:sync`
- `npx cap sync android`

## Next Recommended Wave

BOTTOM.R2 — Module Forms / Inline Editors Hardening
