# Setup

This document explains how to clone, install and run Beach BDF from a clean workstation.

## Clone

```sh
git clone https://github.com/francescomaiomascio/beach-bdf.git
cd beach-bdf
```

## Install

Use the Node.js version declared by the repository:

```sh
nvm use
npm install
```

If `nvm` is not available, install the Node.js version shown in `.nvmrc` with your preferred Node version manager.

## Run Locally

```sh
npm run dev
```

The Vite development server prints the local and network URLs in the terminal.

## Validate

```sh
npm run check
npm run build
```

## Android

Install Android Studio and the Android SDK, then synchronize Capacitor:

```sh
npm run cap:sync
npm run cap:open
```

The generated build output remains local and is excluded from version control.

## Version Control Hygiene

Do not commit:

- `.env` files or local secrets
- `node_modules`
- `dist`
- Android build folders
- generated Capacitor web bundles
- local editor or operating system files

Commit source code, documentation, lockfiles, project configuration and assets that are required to reproduce the application.
