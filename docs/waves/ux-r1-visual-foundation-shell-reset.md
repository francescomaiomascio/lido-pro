# UX.R1 — Visual Foundation + Shell Reset

## Purpose

Rifondare la base visiva dell'app senza toccare dati, schema o logiche operative.

## Problems addressed

- topbar poco solida e troppo “pill-based”
- bottoni tutti uguali e troppo invasivi
- superfici troppo morbide e ripetitive
- menu e filtri con effetto card-stack
- bottom panel ancora grezzo
- form fields incoerenti
- baseline responsive fragile su tablet/telefono

## Token system

Aggiornati:

- `src/styles/tokens.css`
- `src/styles/base.css`

Nuovi gruppi principali:

- app background / background soft
- surface / soft / muted / elevated
- text primary / secondary / muted
- primary / success / warning / danger
- field background / field border
- radius small / medium / large
- spacing scale
- shadow soft / raised

Tema di default: `neutral`, con direzione piu` scura e professionale.

## Topbar reset

Refactor della topbar in:

- `src/components/layout/AppTopBar.svelte`
- `src/styles/shell.css`

Migliorie:

- titolo piu` stabile
- sottotitolo piu` leggero
- nav `Mappa / Lista` piu` compatta
- search piu` corta e meno invasiva
- `Filtri` e `Menu` integrati come app chrome

## Button system

Creato foglio centralizzato:

- `src/styles/buttons.css`

Varianti normalizzate:

- primary
- secondary
- ghost
- danger
- compact

## Form reset

Creato foglio centralizzato:

- `src/styles/forms.css`

Normalizzati:

- input
- textarea
- select
- labels
- focus states
- disabled / readonly states

Applicato ai form gia` presenti: clienti, prenotazioni, conti, pagamenti, tariffe, extra.

## Surface / panel reset

Aggiornati:

- `src/styles/shell.css`
- `src/styles/panels.css`
- `src/styles/beach-list.css`

Direzione applicata:

- meno bordi pesanti
- meno card annidate
- meno bottoni oversize
- piu` sezioni e divisori
- pannelli e sheet piu` sobri
- focus card piu` integrata

## Menu / filter light pass

Nessuna modifica di feature. Solo normalizzazione visiva:

- migliore gerarchia dei blocchi
- contrasto e spaziature piu` coerenti
- riduzione del look “stack di card”

## Bottom panel light pass

Nessun redesign funzionale completo in questa wave.
Migliorati:

- header
- tab row
- densita` dei controlli
- contrasto delle superfici
- consistenza con il nuovo sistema bottoni/form

## Responsive baseline

Migliorata la base per:

- tablet landscape
- tablet portrait
- phone portrait

Questa wave non ricostruisce ancora la lista.
Quel lavoro resta per `UX.R4 — List View Rebuild`.

## Intentionally not changed

- geometria mappa
- item graphics interni della mappa
- coordinate e seed
- clienti / assegnazioni / conti / pagamenti / prenotazioni
- logiche tariffarie
- logiche extra
- schema DB

## Validation

Eseguiti:

- `npm run check`
- `npm run build`

## Next

`UX.R2 — Bottom Panel System`
