# BOTTOM.REBUILD.2 — Next Action Operational Panel

## Purpose

Ricostruire il bottom panel intorno al prossimo passaggio utile, invece che mostrare sempre tutte le categorie operative.

## State Machine

Il nuovo helper `src/lib/operational/operationalState.ts` calcola questi stati:

- `no_selection`
- `needs_customer`
- `needs_period`
- `needs_account`
- `account_open`
- `account_paid`
- `maintenance`

Ogni stato definisce un solo passo principale e quali dettagli possono essere mostrati.

## Compact State

Quando non c'e' una selezione, il dock resta su una riga:

- Spiaggia BDF
- numero posti
- stato locale
- istruzione breve
- solo pulsante `+`

## Selected State

Il pannello selezionato mostra:

- una sola riga identita' posto;
- una riga meta non ridondante;
- un messaggio contestuale;
- una sola azione primaria;
- solo i dettagli rilevanti per lo stato corrente.

Le righe permanenti Cliente, Periodo, Economico, Dotazioni e Storico non vengono piu' renderizzate.

## Editor Behavior

Gli editor si aprono subito sotto il messaggio e l'azione primaria. Rimane attivo un solo editor alla volta, riusando i componenti esistenti.

## Progressive Disclosure

- `needs_customer`: solo assegnazione cliente.
- `needs_period`: cliente + azione periodo.
- `needs_account`: periodo + apertura conto.
- `account_open`: riepilogo economico, ultimo pagamento, extra e modifica conto.
- `account_paid`: riepilogo economico e accesso registro.

## Technical Details

I dettagli tecnici sono nascosti di default in un disclosure secondario. La nota operativa non occupa piu' il flusso primario del pannello.

## Data And Map Preservation

La wave e' UI-only. Non modifica schema DB, seed, `beach_items`, coordinate, count 58, clienti, prenotazioni, conti, pagamenti, tariffe o extra.

## Validation Results

- `npm run check`: pass
- `npm run build`: pass
- `npm run cap:sync`: pass
- `npx cap sync android`: pass

## Next Recommended Wave

BOTTOM.R2 — Inline Editors / Workflow Forms Hardening
