# Beach BDF local database

Wave 3 uses SQLite schema version 2 for the metric beach layout and operational status workflow.

- Native Android uses `@capacitor-community/sqlite`.
- Browser development uses an in-memory fallback only so Vite can render the app locally.
- The production source of truth is SQLite data stored in meters, not pixels.
- Beach items support `operational_note`, `status_updated_at`, and light status events.
- `resetSeedForDevelopmentOnly()` is a development helper and must not be exposed in normal UI.
