# Wave 3 - Item Details + Operational Status Workflow

## Purpose

Wave 3 makes Beach BDF useful as a daily operational board before customers, accounts, payments, or reservations exist.

## UX Improvements

- Added status summary for total, free, occupied, reserved, and maintenance items.
- Added real status filters that work with search.
- Expanded selected item details with last update, note, future placeholders, actions, and latest changes.
- Added operational note editing.
- Added operational separation between `Giornaliero` and `Stagionale`.
- Added note indicators in map and list.
- Improved umbrella label readability in the UI by displaying umbrella codes as `OMB1-01` while preserving stored code `O1-01`.
- Split user-facing beach info from technical diagnostics in the menu.

## Database Migration v1 -> v2

Schema version is now `2`.

Changes:

- `beach_items.operational_note TEXT`
- `beach_items.status_updated_at TEXT`
- `beach_items.usage_type TEXT NOT NULL DEFAULT 'daily'`
- new `beach_item_status_events` table
- `app_meta.schema_version` writes `2`

The migration is idempotent. Existing seeded rows are not reset or duplicated.

## Status Summary Behavior

Summary is calculated from loaded items:

- Totale
- Liberi
- Occupati
- Prenotati
- Manutenzione

## Filter Behavior

Status filters:

- Tutti
- Liberi
- Occupati
- Prenotati
- Manutenzione

Search and status filters combine. The list is filtered directly; the map dims non-matching items.

Usage filters were added after Wave 3 completion:

- Tutti
- Giornaliero
- Stagionale

They combine with search and status filters.

## Note Behavior

Each beach item can store one operational note. Browser dev stores it in the memory adapter. Android/native stores it in SQLite.

## Status History Behavior

Status changes insert events into `beach_item_status_events` only when the status actually changes. The detail panel shows the latest three events.

## Map/List Updates

- Map items show stronger selected/status visuals.
- Map items show a small `N` marker when a note exists.
- List rows show note presence and compact last update text.
- List order remains operational: palms, umbrellas, small palms; then row and number.

## Diagnostics/Menu Changes

`Info spiaggia` shows user-facing beach facts. `Diagnostica` shows database, schema, adapter, and fallback warning.

## Files Changed

- `src/lib/db/schema.ts`
- `src/lib/db/migrations.ts`
- `src/lib/db/sqliteAdapter.ts`
- `src/lib/db/beachRepository.ts`
- `src/lib/services/beachLayoutService.ts`
- `src/lib/types/beach.ts`
- `src/lib/types/db.ts`
- `src/lib/state/beachFilters.ts`
- `src/lib/state/beachViewState.ts`
- `src/lib/format/beachLabels.ts`
- `src/lib/format/beachStatusLabels.ts`
- `src/lib/format/dateLabels.ts`
- `src/components/beach/*`
- `src/components/layout/AppMenuSheet.svelte`
- `src/styles/beach-map.css`
- `src/styles/beach-list.css`
- `src/styles/panels.css`

## Validation Results

```sh
pwd
PATH=/opt/homebrew/bin:/opt/homebrew/opt/node@24/bin:$PATH node -v
PATH=/opt/homebrew/bin:/opt/homebrew/opt/node@24/bin:$PATH npm -v
npm run check
npm run build
npm run cap:sync
PATH=/opt/homebrew/bin:/opt/homebrew/opt/node@24/bin:$PATH npx cap sync android
curl -I http://localhost:5173/
```

Results:

- `npm run check`: passed with 0 errors and 0 warnings.
- `npm run build`: passed.
- `npm run cap:sync`: passed.
- direct `npx cap sync android`: passed.
- dev server responded with HTTP 200.
- schema version validation returned `2`.
- seed validation returned 58 items and stored umbrella code `O1-01`.
- no `.git` directory exists.

## Non-Goals

- No customers.
- No accounts.
- No payments.
- No reservations.
- No layout drag/edit.
- No backup/export/import.
- No login.
- No cloud services.

## Known Limitations

- Browser dev persistence is still in-memory only.
- Android Studio/device run was not performed; sync passed.
- Status history is intentionally light and limited to latest three events in the panel.

## Next Wave Recommendation

WAVE 4 - Customer Placeholder to Customer Assignment Boundary.
