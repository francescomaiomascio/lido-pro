# BOTTOM.R2 — Inline Editors / Workflow Forms Hardening

## Purpose

Sostituire nel bottom panel le vecchie shell a card con editor operativi compatti, mantenendo invariata la logica di assegnazioni, prenotazioni, conti, pagamenti ed extra.

## Old Embedded Components Problem

Il nuovo pannello next-action stava ancora montando componenti progettati per pannelli completi. Il risultato era un miscuglio di card annidate, pulsanti grandi, spaziature e scroll non coerenti con il nuovo dock.

## New Inline Editor Architecture

Sono stati aggiunti editor dedicati in `src/components/operational/editors/`:

- `CustomerInlineEditor.svelte`
- `PeriodInlineEditor.svelte`
- `AccountInlineEditor.svelte`
- `PaymentInlineEditor.svelte`
- `ExtraInlineEditor.svelte`

Il pannello monta solo uno di questi editor alla volta.

## Customer Editor

Ricerca clienti esistenti, righe compatte con nome e contatto, assegnazione diretta e rimozione/cambio del cliente attuale. La creazione clienti resta fuori dal bottom panel.

## Period Editor

Usa selezione compatta Giornaliero/Stagionale, campi data affiancati e una sola azione di salvataggio. I default restano quelli esistenti del dominio.

## Account Editor

Mostra tariffa suggerita e totale modificabile in una forma breve. Gestisce sia apertura conto sia aggiornamento totale senza timeline pagamenti incorporata.

## Payment Editor

Riduce il flusso a importo, metodo, nota facoltativa e salvataggio. Mantiene la conferma quando il pagamento supera il saldo.

## Extra Editor

Mostra il catalogo attivo in righe compatte con quantita', prezzo e aggiunta. Gli extra gia' collegati restano rimovibili senza caricare il catalogo gestionale globale.

## Styling Rules

`src/styles/operational-editors.css` definisce righe compatte, divisori leggeri, input coerenti e azioni contenute. Nessuna card stack viene montata nel pannello operativo.

## Scroll Rules

Solo liste lunghe di clienti o catalogo extra hanno un contenitore con altezza massima e scroll interno. L'editor resta vicino all'azione che lo ha aperto.

## Responsive Behavior

Tablet e desktop mantengono campi affiancati e azioni compatte; su telefono i campi diventano stacked senza overflow orizzontale.

## Data And Map Preservation

Wave UI-only: nessuna modifica a schema DB, seed, `beach_items`, coordinate, count 58, clienti, prenotazioni, conti, pagamenti, tariffe o extra.

## Validation Results

- `npm run check`: pass
- `npm run build`: pass
- `npm run cap:sync`: pass
- `npx cap sync android`: pass

## Next Recommended Wave

BOTTOM.R3 — Operational Console Polish / Normal User QA
