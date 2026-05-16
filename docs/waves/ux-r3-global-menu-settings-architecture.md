## UX.R3 — Global Menu / Settings Architecture

### Purpose

This wave rebuilds the menu as a real global settings shell.

The previous menu appended unrelated content below navigation rows and mixed global management with selected-item workflows. The new structure isolates global sections and keeps the bottom operational panel focused on the selected beach item.

### Problems addressed

- Menu content appended below the navigation list
- Clienti / Tariffe / Extra not isolated as dedicated global views
- Weak tablet/phone behavior
- `Info spiaggia` too vague as a primary section
- Global settings mixed with selected-item workflow

### New settings architecture

The menu now opens a proper settings shell:

- header
- navigation area
- selected content area

Desktop / tablet:

- left navigation
- right content panel
- one selected section at a time

Phone:

- full-screen shell
- navigation list first
- detail panel after selection
- back action returns to section list

### Information architecture

Gestione:

- Clienti
- Tariffe
- Extra

Spiaggia:

- Impostazioni spiaggia
- Disposizione spiaggia
- Filtri

Sistema:

- Lingua
- Tema
- Diagnostica
- Versione app

### Global vs selected-item boundary

Global settings shell owns:

- customer creation and editing
- tariff catalog
- extra catalog
- beach read-only settings
- filters
- language
- theme
- diagnostics
- version

Selected-item workflow remains in the bottom operational panel:

- customer assignment to a place
- reservation/period on the selected place
- account/payment flow for the selected place
- account-specific extras

### Beach settings boundary

`Impostazioni spiaggia` and `Disposizione spiaggia` are intentionally read-only in this wave.

No row regeneration.
No coordinate changes.
No beach item modifications.

The UI explicitly states that layout editing is not active yet.

### Language support scope

Language setting is now stored locally.

Supported languages:

- Italiano
- English
- Español
- Français

In this wave, translation scope is intentionally limited to:

- topbar
- menu/settings shell
- key settings labels

Operational content outside the settings shell remains progressively alignable in later waves.

### Theme support

Theme selection remains global and persisted locally.

Available:

- Neutral
- Dark

### Responsive behavior

Tablet landscape:

- side navigation + content panel
- internal scrolling in navigation/content

Phone:

- full-screen settings shell
- list-first navigation
- detail screen after tap
- direct open to section for contextual actions such as Filtri/Tariffe/Extra

### Data and map preservation

No schema changes.

No reseed.

No modifications to:

- beach item coordinates
- item codes
- map geometry
- customer/account/reservation/tariff/extra data model

### Validation

Commands run:

- `npm run check`
- `npm run build`
- `npm run cap:sync`

### Next recommended wave

`UX.R4 — Bottom Panel Workflow Redesign`
