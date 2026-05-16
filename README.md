# Beach BDF

Beach BDF is a local-first management application for beach facilities, built with Svelte, TypeScript, Vite and Capacitor Android.

The project focuses on operational workflows such as beach layout management, reservations, customer registry, account ledgers, tariffs, extras and mobile-ready local persistence.

## Technology

- Svelte 5
- TypeScript
- Vite
- Capacitor Android
- SQLite support through Capacitor Community SQLite and sql.js
- Custom responsive CSS system

## Requirements

- Node.js version declared in `.nvmrc`
- npm
- Android Studio, only for Android builds and device testing

## Quick Start

```sh
npm install
npm run dev
```

For validation:

```sh
npm run check
npm run build
```

For Android synchronization:

```sh
npm run cap:sync
```

## Documentation

- Setup and clone instructions: [`SETUP.md`](SETUP.md)
- Architecture notes: [`docs/architecture`](docs/architecture)
- Delivery waves: [`docs/waves`](docs/waves)

## Repository Policy

The repository tracks source code, documentation, configuration and curated assets required to build the application.

Private files, environment files, dependency folders, build outputs, generated web bundles and native build artifacts are intentionally excluded.
