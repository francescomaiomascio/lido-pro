# BOTTOM.R1.3 — Unified Expanded Console + Compact Dock Cleanup

## Purpose

BOTTOM.R1.3 corregge il pannello operativo basso dopo BOTTOM.R1.2. L'obiettivo e' rimuovere la sensazione di header interno, tabella separata e viste duplicate, trasformando lo stato espanso in un unico dock operativo.

## Problems From R1.2

- Lo stato espanso aveva ancora un blocco identita' separato dal riepilogo.
- Le informazioni su posto, cliente, periodo e saldo erano ripetute.
- Riepilogo e Gestione sembravano ancora viste distinte.
- Azioni come Registro, Gestisci e Gestione creavano rumore.
- Il pannello espanso era troppo basso e lo spazio orizzontale non era sfruttato bene.

## Compact Dock Cleanup

Lo stato compatto resta piccolo e intenzionale:

- nome app;
- totale posti;
- stato offline locale;
- messaggio breve per selezionare un posto;
- una sola azione compatta `+`.

Sono state rimosse le azioni rapide ridondanti come Tariffe ed Extra dal dock compatto.

## Expanded Height Change

Lo stato espanso usa un'altezza piu' generosa su desktop e tablet, circa il 42% della viewport con limiti controllati. Su telefono diventa una bottom sheet piu' alta, senza forzare un mezzo schermo quando non serve.

## Unified Field Layout

Lo stato espanso ora e' un solo blocco:

- identita' del posto;
- stato;
- campi compatti in griglia: Cliente, Periodo, Saldo, Conto, Dotazioni, Ultimo evento;
- azioni operative nella stessa superficie.

Non ci sono piu' tab interne o una tabella separata sotto l'identita'.

## Action Row Behavior

Le azioni sono sempre visibili e legate al posto selezionato:

- Assegna/Cambia cliente;
- Imposta/Modifica periodo;
- Apri/Modifica conto;
- Pagamento;
- Extra;
- Registro;
- comprimi pannello.

Le azioni non disponibili restano visibili ma disabilitate.

## Inline Editor Behavior

Quando l'utente apre un'azione, viene mostrato un solo editor alla volta sotto il blocco compatto. Gli editor riusano i componenti esistenti senza caricare tutte le form insieme.

## Responsive Behavior

- Desktop/tablet: griglia compatta a tre colonne e action row allineata.
- Tablet stretto: blocco unico verticale con azioni sotto.
- Telefono: campi in colonna, azioni wrap, editor scrollabile se necessario.

## Click Reliability Checks

I pulsanti usano `type="button"`. Il pannello resta un layer interattivo sopra la mappa e il contenuto espanso mantiene pointer events sui controlli visibili. Le azioni disabilitate sono non cliccabili e visivamente attenuate.

## Data And Map Preservation

BOTTOM.R1.3 e' una modifica UI. Non cambia:

- schema database;
- seed;
- `beach_items`;
- coordinate;
- count 58;
- dimensione layout 31m x 28m;
- clienti, prenotazioni, conti, pagamenti, tariffe o extra.

## Validation Results

- `npm run check`: pass
- `npm run build`: pass
- `npm run cap:sync`: pass
- `npx cap sync android`: pass

## Next Recommended Wave

BOTTOM.R2 — Inline Editors / Workflow Forms Hardening
