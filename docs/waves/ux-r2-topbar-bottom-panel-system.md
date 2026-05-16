## UX.R2 — Topbar + Bottom Operational Panel System

### Purpose

This wave hardens the product shell and the selected-item workflow without changing database schema or beach map geometry.

Focus:

- topbar/app chrome
- expandable search
- hamburger menu
- bottom operational panel structure
- customer / period / account / payment separation

### Topbar changes

- Visible product name updated to `Spiaggia BDF`
- Search changed from always-open field to compact expandable search
- `Menu` text replaced by compact hamburger button
- `Filtri` kept in topbar without creating a second command bar
- `Mappa / Lista` remain the primary navigation in a single row

### Expandable search

- Collapsed state shows a compact search trigger
- Expanded state shows search field with inline close action
- Placeholder: `Cerca posto, cliente, stato`
- Existing live filtering behavior is preserved for map and list

### Hamburger menu behavior

- Topbar uses a hamburger trigger instead of a text menu button
- Global management entries remain in the menu
- Menu global panels (`Clienti`, `Tariffe`, `Extra`) are mounted in a dedicated management sheet area
- Global panels are mutually exclusive and no longer reopen incorrectly from the local close action

### Bottom panel changes

- Header simplified to compact tabs + expand/collapse action only
- Selected item context removed from tab header
- Tabs are thinner and better suited to tablet/phone widths
- Item context now lives inside `Overview`

### Overview tab redesign

`Overview` now contains:

- selected item identity: type, code, status
- operational summary:
  - Cliente
  - Periodo
  - Tariffa
  - Conto
  - Saldo
  - Extra
- compact note preview/editor instead of a large textarea by default

### Cliente tab rule

Cliente tab now handles only selected-item assignment:

- search existing customer
- assign
- change
- remove

Creation/editing of customers is no longer part of the selected-item workflow.

If no customer is available, the UI directs the operator to:

- `Menu > Clienti`

### Periodo tab rule

`Giornaliero / Stagionale` now belongs to `Periodo`, not `Cliente`.

`Periodo` owns:

- reservation type
- start date
- end date
- reservation create/update/cancel

If no customer is assigned, `Periodo` stops the workflow with a prerequisite message.

### Conto / Pagamenti relationship

- `Conto` handles total, tariff suggestion, account state, create/edit
- `Pagamenti` handles payment list and payment registration
- `Pagamenti` requires an active account first
- Payment UI no longer appears as a first-class action when no account exists

### Responsive behavior

- Topbar remains single-row on tablet widths
- Bottom-panel tabs remain compact and scrollable where needed
- Expandable search stays controlled on narrow widths
- Overview content is more readable in one tablet view

### Data and map preservation

No schema changes.

No reseed.

No modifications to:

- beach item count
- coordinates
- item codes
- map geometry
- customers
- assignments
- accounts
- payments
- reservations
- tariffs
- extras

### Validation

Commands run:

- `npm run check`
- `npm run build`
- `npm run cap:sync`

### Next recommended wave

`UX.R3 — Menu / Global Management Sheets`
