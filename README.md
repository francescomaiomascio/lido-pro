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

## Setup

Clone the repository and enter the project directory. The directory name is detected from the repository URL, so no local path needs to be edited:

```sh
repo_url="https://github.com/francescomaiomascio/beach-bdf.git"
git clone "$repo_url"
cd "$(basename -s .git "$repo_url")"
```

Use the Node.js version declared by the repository:

```sh
nvm use
npm install
```

If `nvm` is not available, install the Node.js version shown in `.nvmrc` with your preferred Node version manager.

Run the local development server:

```sh
npm run dev
```

The Vite development server prints the local and network URLs in the terminal.

Validate the project:

```sh
npm run check
npm run build
```

For Android development, install Android Studio and the Android SDK, then synchronize Capacitor:

```sh
npm run cap:sync
npm run cap:open
```

## Documentation

- Architecture notes: [`docs/architecture`](docs/architecture)
- Delivery waves: [`docs/waves`](docs/waves)

## Repository Policy

The repository tracks source code, documentation, configuration and curated assets required to build the application.

Private files, environment files, dependency folders, build outputs, generated web bundles and native build artifacts are intentionally excluded.

Do not commit:

- `.env` files or local secrets
- `node_modules`
- `dist`
- Android build folders
- generated Capacitor web bundles
- local editor or operating system files
