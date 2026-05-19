# Articoli Naming Map

## Purpose

ARTICOLI.1 aligns user-facing product naming without refactoring pricing, persistence, or booking behavior.

The product module is **Articoli**. The word **listino** remains an internal pricing/catalog concept where it describes tariff rules or legacy implementation names.

## Canonical Terms

| Concept | Canonical user-facing term | Internal terms that may remain |
| --- | --- | --- |
| Top-level module | Articoli | `priceList` module id |
| Module page | Articoli | `TariffPanel`, `TariffsSettingsPanel` |
| Pricing rules | Regole prezzo / Tariffe posto | `tariffService`, `tariffRepository`, `tariff_rules` |
| Paid extras | Articoli extra / Extra a pagamento | `extraItemService`, `extra_item_catalog` |
| Included equipment | Dotazioni incluse | `tariff_included_items` |
| CSS shell | Articoli UI | `listino-*` selectors |

## User-Facing Changes In This Wave

- Topbar label changed from `Listino` to `Articoli`.
- Module aria label changed from `Listino` to `Articoli`.
- The current catalog page title changed from `Listino` to `Articoli`.
- Dashboard actions and domain labels now say `Articoli`.
- Studio/library helper copy now points sellable items to `Articoli`.
- New account suggestion copy now uses `Da Articoli` instead of creating new `Da listino` text.

## Internal Names Intentionally Kept

The following names are intentionally retained because they are technical implementation details and renaming them would create avoidable churn:

- `priceList` navigation/module id.
- `TariffPanel.svelte` and `TariffsSettingsPanel.svelte`.
- `tariffService.ts`, `tariffRepository.ts`, and tariff-related types.
- Database tables such as `tariff_rules` and `tariff_included_items`.
- Existing `listino-*` CSS selectors and localStorage keys.
- Historical account notes that may contain `Da listino`.

These names should be treated as legacy/internal until a future technical rename is scoped with tests and migration/deprecation notes.

## Persistence Decision

No database table, column, migration, seed, or repository name is renamed in ARTICOLI.1.

The current tariff and extra-item persistence remains canonical for pricing inputs:

- `tariff_rules`
- `tariff_included_items`
- `extra_item_catalog`
- `account_extra_items`

## Responsibility Boundary

Articoli owns the operator catalog responsibilities:

- beach-place pricing rules;
- included equipment;
- paid extras;
- sellable catalog items;
- price suggestions used by Booking;
- pricing snapshot inputs;
- future service/bar catalog inputs.

Articoli does not own payment processing, folio payment history, booking lifecycle mutation, or Studio layout geometry.

## Deferred

- Technical rename of `priceList` to an `articles`-style runtime id.
- Component/file renames for `TariffPanel` and tariff settings.
- Database/table renames.
- Broader Articoli catalog refactor.
- Servizi and Bar catalog runtime.
- Pricing calculation refactor.
