# macOS Desktop Workflow

LidoPro Desktop is the primary local runtime for macOS development.

## Run Locally

Use a supported Node version first. Node 24 is recommended for the current Vite and TypeScript dependency line.

```sh
npm install
npm run app:dev
```

This starts one Vite frontend endpoint at `http://localhost:5173` and opens the Tauri macOS window.

`desktop:dev` remains available as an alias:

```sh
npm run desktop:dev
```

The browser command remains available only as preview/fallback:

```sh
npm run dev:server
```

## Build Local macOS Artifacts

```sh
npm run desktop:build
```

This creates a local unsigned macOS app bundle through Tauri. This artifact is not a public customer release.

```sh
npm run desktop:build:mac
```

This runs the same Tauri build through a macOS-named operational alias. It does not imply a signed, notarized, or customer-ready package.

## Signing And Notarization Boundary

DESKTOP.R1 does not add:

- Apple Developer signing identity;
- notarization credentials;
- App Store distribution;
- Mac App Store release;
- public signed binaries.

Distribution to customers will require a separate commercial release wave covering signing, notarization, customer terms, privacy terms, support boundaries, and release artifact policy.

## Android Boundary

Android remains Capacitor based:

```sh
npm run cap:sync:android
```

Tauri desktop does not replace the Android path in this wave.
