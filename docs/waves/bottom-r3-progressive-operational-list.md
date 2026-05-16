# BOTTOM.R3 — Progressive Operational List

## Purpose

Trasformare il pannello selezionato in una lista operativa progressiva unica: etichetta a sinistra, stato al centro, azione a destra, editor dentro la riga attiva.

## Why The Previous Setup Failed

Gli editor inline erano compatti, ma si aprivano ancora fuori dal contesto della riga. Il pannello restava una sequenza di messaggio, azione ed editor separato.

## Progressive List Model

La vista selezionata ora usa:

- `OperationalProgressiveList.svelte`
- `OperationalStepRow.svelte`
- `operationalRows.ts`

Le righe sono Cliente, Periodo, Tariffa, Conto, Pagamenti, Extra, Registro e Tecnico.

## Row Model

Ogni riga definisce:

- chiave;
- label;
- valore;
- abilitazione;
- azione;
- motivo di disabilitazione;
- editor associato.

## One Expanded Row Rule

Lo stato `activeTab` continua a governare un solo editor attivo alla volta. Cliccando una riga si chiude la precedente e l'editor appare subito sotto la riga corretta.

## Row Behavior

- Cliente: assegna/cambia con ricerca inline.
- Periodo: si abilita solo dopo cliente.
- Tariffa: mostra il suggerimento tariffario senza aprire il catalogo globale.
- Conto: si abilita dopo cliente e periodo.
- Pagamenti: si abilita con conto aperto.
- Extra: si abilita con conto aperto.
- Registro: apre il registro filtrato.
- Tecnico: riga secondaria con coordinate e ID.

## Responsive Behavior

Tablet e desktop usano tre colonne orizzontali; su telefono label e valore si impilano mantenendo l'azione leggibile e senza overflow.

## Validation Results

- `npm run check`: pass
- `npm run build`: pass
- `npm run cap:sync`: pass
- `npx cap sync android`: pass

## Data And Map Preservation

La wave non modifica schema DB, seed, `beach_items`, coordinate, count 58, clienti, prenotazioni, conti, pagamenti, tariffe o extra.

## Next Recommended Wave

BOTTOM.R4 — Progressive List Visual Polish / Tablet Phone QA
