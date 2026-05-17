# Desktop Storage Boundary

LidoPro is local-first, but each runtime has a separate persistence boundary.

## Current Runtime Storage

| Runtime | Current behavior |
| --- | --- |
| Capacitor Android | Native SQLite path through `@capacitor-community/sqlite`. |
| Browser preview | Web SQLite / browser fallback for development inspection only. |
| Tauri desktop | Tauri shell is introduced first. Durable desktop SQLite must be verified or implemented explicitly before it is claimed as the desktop production persistence path. |

## Android Native SQLite

Android remains the validated native mobile persistence direction. `npm run cap:sync:android` must continue to pass.

## Browser Preview

Browser mode is not the primary product runtime. Any browser memory or web-store fallback is temporary development behavior. It must not be documented as production persistence.

## Tauri Desktop

DESKTOP.R1 introduces LidoPro Desktop as a shell and runtime target. It does not silently create a new durable desktop database adapter.

Before desktop persistence is considered complete, a later storage wave must define and validate:

- desktop database file location;
- backup/export behavior;
- migration path from browser dev data, if any;
- schema migration behavior;
- reset/recovery behavior;
- macOS and Linux filesystem permissions;
- commercial customer data handling.

## Risk Boundary

Do not claim desktop production SQLite until the desktop adapter has been implemented and tested. If a Tauri run still uses browser fallback behavior, diagnostics and docs must treat it as temporary.
