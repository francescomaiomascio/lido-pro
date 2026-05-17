# Responsive Device Matrix

Responsive validation is mandatory for every LidoPro UI change. The product must remain usable as a Tauri desktop app, browser preview, and native mobile/tablet shell.

## Canonical Matrix

| Category | Viewports |
| --- | --- |
| Desktop landscape | 1440 x 900, 1280 x 800 |
| Tablet landscape | 1180 x 820, 1138 x 712, 1024 x 768 |
| Tablet portrait | 820 x 1180, 768 x 1024 |
| Smartphone portrait | 430 x 932, 390 x 844, 360 x 800 |
| Smartphone landscape | 844 x 390, 932 x 430 |

## Validation Tools

- Tauri compressed windows: desktop and tablet-like preview for the LidoPro Desktop runtime.
- Chrome or Safari responsive mode: fast breakpoint inspection.
- Android Studio or physical Android devices: required for final Android validation when available.
- Xcode Simulator or physical iPad/iPhone: required for final iOS validation when available.

Browser responsive mode does not validate native WebView behavior, plugin behavior, storage, SQLite, file APIs, signing, package permissions, or device-specific safe areas. It is useful for layout checks only.

## Required Completion Report

Every UI-changing completion message must state:
- which responsive categories were checked
- whether native Android validation was performed
- whether native iOS validation was performed
- any deferred native validation
- remaining responsive risks

## Acceptance Checks

For every touched screen or panel:
- no horizontal overflow
- no clipped primary content
- no overlapped text
- no controls covering critical content
- sheets, drawers, and side panels scroll internally
- maps/canvases remain visible and operable
- primary actions remain reachable
- touch targets remain usable
- tablet portrait has its own layout, not desktop squeezed
- smartphone portrait has verticalized layout
- smartphone landscape keeps core navigation reachable
