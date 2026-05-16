# MENU.R1 — Settings Menu UX Baseline

## Purpose

MENU.R1 turns the existing settings/menu area into a professional management surface. The wave focuses on navigation structure, panel isolation, consistent headers, compact forms, and read-only system/beach information.

## Old Problems

- Settings felt like a flat admin/debug list.
- Navigation and content hierarchy were weak.
- Clienti, Tariffe, and Extra repeated headings and used oversized full-width controls.
- Global management panels were visually too close to selected-item operational workflows.
- Read-only beach information did not clearly separate current data from future configuration.

## New Settings Shell

- Desktop and tablet use a left navigation column and right content region.
- Phone uses the existing navigation-first/detail-second pattern with a back button.
- Content is isolated to the selected section and scrolls inside the settings surface.
- Styling is denser, row-based, and separated by subtle borders.

## Navigation IA

Gestione:
- Clienti
- Tariffe
- Extra
- Registro, shown as planned

Spiaggia:
- Impostazioni spiaggia
- Disposizione spiaggia
- Filtri

Sistema:
- Lingua
- Tema
- Diagnostica
- Versione app

## Global Panel Pattern

Each settings panel now uses a consistent header with:
- title
- short description
- optional right-side primary action

Duplicate immediate headings were removed from the global Clienti, Tariffe, Extra, and Diagnostica paths.

## Clienti Panel

- Provides global customer creation and editing only.
- Keeps assignment, reservation, seasonal/daily choice, and account workflows out of the global customer panel.
- Uses a search/list area and a separate editor area on larger screens.
- Stacks into a usable list-first flow on narrow screens.

## Tariffe Panel

- Uses table-like rows with name, category/fila, period type, amount, and compact edit action.
- Editing happens in a side detail panel on larger screens and stacked below on narrow screens.
- No tariff logic or schema changed.

## Extra Panel

- Shows only the global extra catalog.
- Supports editing default catalog price and creating a catalog item using existing service support.
- Does not mix account-specific extras into settings.

## Beach Settings

Impostazioni spiaggia is read-only and shows:
- Nome spiaggia
- Dimensioni
- Totale posti
- Palme
- Ombrelloni
- Palmette

Planned sections are displayed as inactive:
- Dimensioni modificabili
- Righe e conteggi
- Forma/asimmetrie

## Beach Layout

Disposizione spiaggia is read-only and shows:
- P1: 8
- P2: 9
- P3: 9
- P4: 8
- O1: 11
- O2: 10
- PM: 3

Future actions are disabled:
- Modifica disposizione
- Rigenera griglia
- Sposta elementi

## Language, Theme, Diagnostics, Version

- Language shows current language and the available choices.
- Theme shows current theme and available themes.
- Diagnostics keeps adapter, database, schema, web store state, fallback warning, and browser dev reset.
- Version shows app identity, Android package, database, runtime, and local channel.

## Responsive Behavior

- Desktop and tablet use master/detail settings structure.
- Phone uses full-screen settings with no horizontal overflow target.
- Forms and row actions are compact and avoid unnecessary full-width button bars except on very narrow screens.

## Validation Results

- `pwd`: `<project-directory>`
- `node -v`: `v20.20.2`
- `npm -v`: `10.8.2`
- `npm run check`: passed
- `npm run build`: passed
- `npm run cap:sync`: passed

Build still reports the existing Vite browser-compatibility warning for `crypto` imported by `jeep-sqlite`.

## Map/Data Preservation

- No schema or migration changes.
- No beach item seed changes.
- No coordinate, item code, layout geometry, or map rendering changes.
- The expected map count remains 58 through the unchanged seed and layout path.

## Manual Checks Still Required

- Browser reload persistence after creating/editing a customer.
- Narrow viewport visual pass in an actual browser.
- Confirm Diagnostics reports Web SQLite persistente in the browser.

## Next Recommended Wave

CORE.R1 — Customer Registry + Customer Profile
