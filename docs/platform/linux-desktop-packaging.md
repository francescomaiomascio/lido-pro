# Linux Desktop Packaging

LidoPro Desktop is prepared for Linux through the Tauri v2 desktop architecture.

Linux packages are not validated from the macOS development machine. A Linux machine or Linux CI runner is required before any Linux package is described as tested.

## Intended Package Types

- AppImage
- `.deb`

The package script is:

```sh
npm run desktop:build:linux
```

This command is intended for Linux. It may not be accepted by the macOS Tauri bundler because macOS only builds macOS bundle types locally.

## Linux Validation Checklist

Before claiming Linux desktop support as validated:

- run `npm run check`;
- run `npm run build`;
- run `npm run desktop:build:linux`;
- launch the produced AppImage;
- install/test the `.deb`;
- verify local storage behavior;
- verify canvas, settings, booking, customers, pricing, and diagnostics surfaces;
- verify no signing or release credentials are committed;
- verify generated artifacts are not committed unless a release process explicitly requires them.

## Boundary

Linux desktop preparation does not change Android, browser preview, product logic, cloud/payment/account boundaries, or commercial release status.
