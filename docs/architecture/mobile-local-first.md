# Mobile Local-First Architecture

## Local-First Rule

LidoPro runs as a local Android app. The app must remain usable without network access and without remote services.

## Android Tablet And Phone Support

The primary target is Android tablet in landscape orientation. Android phone is supported with a simplified layout, full-width beach stage, and bottom action bar.

The canonical Android development and validation workflow is documented in [Android Capacitor workflow](../platform/android-capacitor-workflow.md).

## SQLite Future Role

SQLite will become the source of truth for local beach data in Wave 1. It will store beach items, coordinates, status, codes, and later customer and booking records.

## Backup Future Role

Backup is a later local-first capability. It should export local data in a user-controlled way before any remote or automated sync is considered.

## No-Cloud Rule

No Firebase, Supabase, remote database, hosted auth, or fake cloud behavior is allowed in the current architecture.

## UI Simplicity Rule

The UI must stay touch-first, readable, and practical for older non-technical users. Controls should use large tap targets, clear labels, strong spacing, and no hover-only behavior.

Technical diagnostics must stay out of the primary workflow. They can be available from a menu, but normal users should see beach operations first.

Operational status, notes, and lightweight history are local-first data. They must be written locally before any future sync/export feature is considered.
