# LidoPro local database

LidoPro uses SQLite for local-first beach layout and operational workflows.

- Native Android uses `@capacitor-community/sqlite`.
- Browser development uses an in-memory fallback only so Vite can render the app locally.
- The production source of truth is SQLite data stored in meters, not pixels.
- Beach items support `operational_note`, `status_updated_at`, and light status events.
- `resetSeedForDevelopmentOnly()` is a development helper and must not be exposed in normal UI.
